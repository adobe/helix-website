/**
 * Report Viewer Module - Displays reports inline in facet-sidebar location
 */

/* eslint-disable no-console */

import { DA_CONFIG } from '../config.js';

/**
 * Fetch report content via CF Worker (handles DA auth)
 * @param {string} reportPath - Full DA source URL or path
 * @returns {Promise<string>} HTML content
 */
async function fetchReportContent(reportPath) {
  const path = reportPath.includes('/source') ? reportPath.split('/source')[1] : reportPath;
  const res = await fetch(DA_CONFIG.WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'read', path }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || `HTTP ${res.status}`);
  return data.content;
}

// Load report viewer CSS
if (!document.querySelector('link[href*="report-viewer.css"]')) {
  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = '/blocks/ai-optel-report-generator/report-viewer/report-viewer.css';
  document.head.appendChild(css);
}

const getViewerContainer = () => {
  let container = document.getElementById('report-viewer-container');
  if (!container) {
    const facets = document.querySelector('#facets');
    if (!facets?.parentNode) return null;
    container = Object.assign(document.createElement('div'), {
      id: 'report-viewer-container',
      className: 'report-viewer',
    });
    facets.parentNode.insertBefore(container, facets.nextSibling);
  }
  return container;
};

const toggleView = (show) => {
  const viewer = getViewerContainer();
  const facets = document.querySelector('#facets');
  const sidebar = document.querySelector('facet-sidebar');

  if (viewer) {
    viewer.classList.toggle('visible', show);
    viewer.style.display = show ? 'block' : 'none';
  }
  if (facets) facets.style.display = show ? 'none' : 'block';
  if (sidebar) {
    sidebar.classList.toggle('report-view-active', show);
    // Remove "Back to Report" icon when showing report view
    if (show) {
      document.querySelectorAll('.back-to-report-icon').forEach((icon) => icon.remove());
    }
  }
};

export const closeReportViewer = () => {
  // Clear the source report from sessionStorage when closing report
  sessionStorage.removeItem('optel-detective-source-report');
  sessionStorage.removeItem('optel-detective-source-report-path');

  const url = new URL(window.location);
  url.searchParams.delete('report');
  url.searchParams.delete('metrics'); // Remove metrics parameter added for report view
  url.searchParams.delete('startDate');
  url.searchParams.delete('endDate');
  url.searchParams.delete('view');
  window.history.pushState({}, '', url);
  toggleView(false);
};

window.closeReportViewer = closeReportViewer;

// Add floating "Back to Report" button (fixed position, top right)
const addBackToReportButton = () => {
  // Remove any existing button
  document.querySelectorAll('.back-to-report-floating').forEach((b) => b.remove());

  const reportDate = sessionStorage.getItem('optel-detective-source-report');
  const reportPath = sessionStorage.getItem('optel-detective-source-report-path');
  if (!reportDate || !reportPath) return;

  const btn = Object.assign(document.createElement('button'), {
    className: 'back-to-report-floating',
    title: 'Back to Report',
    innerHTML: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
    onclick: async () => {
      sessionStorage.removeItem('optel-detective-source-report');
      sessionStorage.removeItem('optel-detective-source-report-path');
      btn.remove();

      const url = new URL(window.location);
      url.searchParams.set('report', reportDate);
      url.searchParams.set('metrics', 'super');
      ['checkpoint', 'url', 'userAgent', ...Array.from(url.searchParams.keys()).filter((k) => k.includes('.'))]
        .forEach((k) => url.searchParams.delete(k));

      window.history.pushState({}, '', url.toString());
      if (typeof window.slicerDraw === 'function') await window.slicerDraw();
      // eslint-disable-next-line no-use-before-define
      await showReportInline(reportPath, reportDate);
    },
  });

  document.body.appendChild(btn);
  console.log('[Report Viewer] ✅ Added floating "Back to Report" button');
};

const showError = (container, message = 'Failed to load report') => {
  container.innerHTML = `<div class="report-error"><p>${message}</p><button class="error-back-btn">Back to Dashboard</button></div>`;
  container.querySelector('.error-back-btn')?.addEventListener('click', closeReportViewer);
};

/**
 * Scroll to the first checked/selected facet in sidebar (retries for async DOM)
 */
const scrollToFirstCheckedFacet = (retries = 5) => {
  const facets = document.querySelector('facet-sidebar #facets');
  const el = facets?.querySelector('input:checked, [aria-selected="true"]');
  const fieldset = el?.closest('fieldset');

  if (fieldset) {
    fieldset.scrollIntoView({ behavior: 'smooth', block: 'start' });
    console.log('[Report Viewer] ✅ Scrolled to:', fieldset.querySelector('legend')?.textContent);
  } else if (retries > 0) {
    setTimeout(() => scrollToFirstCheckedFacet(retries - 1), 200);
  }
};

const extractSections = (doc) => {
  const container = doc.querySelector('.report-content') || doc.querySelector('main') || doc.body;
  if (!container) return [];

  const sections = [];
  let currentSection = null;

  // Table format (DA saved reports with h4 in cells)
  const tables = container.querySelectorAll('table.report-table');
  if (tables.length > 0) {
    tables.forEach((table) => {
      table.querySelectorAll('tbody tr td').forEach((cell) => {
        const text = cell.textContent.trim();
        if (text === 'facet') return;

        const h4El = cell.querySelector('h4');
        if (h4El) {
          if (currentSection) sections.push(currentSection);
          currentSection = { title: h4El.textContent.trim(), content: [] };
        } else if (currentSection && text) {
          currentSection.content.push(cell.innerHTML);
        }
      });
    });
    if (currentSection) sections.push(currentSection);
    return sections;
  }

  // AEM facet divs (div.facet with h4 inside)
  const facetDivs = container.querySelectorAll('div.facet');
  if (facetDivs.length > 0) {
    facetDivs.forEach((facetDiv) => {
      const h4 = facetDiv.querySelector('h4');
      if (!h4) return;

      const content = Array.from(facetDiv.children)
        .filter((child) => !child.contains(h4) && child.textContent.trim() && child.textContent.trim() !== 'facet')
        .map((child) => child.outerHTML);

      if (content.length > 0) {
        sections.push({ title: h4.textContent.trim(), content });
      }
    });
    return sections;
  }

  // Inline h4 sections
  const allH4s = container.querySelectorAll('h4');
  if (allH4s.length > 0) {
    allH4s.forEach((h4) => {
      if (currentSection) sections.push(currentSection);
      currentSection = { title: h4.textContent.trim(), content: [] };

      let sibling = h4.parentElement.nextElementSibling;
      while (sibling && !sibling.querySelector('h4')) {
        const text = sibling.textContent.trim();
        if (text && text !== 'facet') currentSection.content.push(sibling.outerHTML);
        sibling = sibling.nextElementSibling;
      }
    });
    if (currentSection) sections.push(currentSection);
    return sections;
  }

  // Fallback: direct children
  Array.from(container.children).forEach((el) => {
    if (el.tagName === 'H4') {
      if (currentSection?.content.length) sections.push(currentSection);
      currentSection = { title: el.textContent.trim(), content: [] };
    } else if (currentSection && el.textContent.trim()) {
      currentSection.content.push(el.outerHTML);
    }
  });
  if (currentSection?.content.length) sections.push(currentSection);

  return sections;
};

const escapeHtml = (text) => Object.assign(document.createElement('div'), { textContent: text }).innerHTML;
const toTitleCase = (text) => text.toLowerCase().split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

/**
 * Wait for dashboard elements to be ready
 * @returns {Promise<boolean>}
 */
const waitForDashboard = async (maxAttempts = 20, delay = 100) => {
  for (let i = 0; i < maxAttempts; i += 1) {
    const facets = document.querySelector('#facets');
    if (facets) {
      return true;
    }
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => { setTimeout(resolve, delay); });
  }
  return false;
};

const createSection = (section) => {
  if (!section?.title) return '';
  return `
    <fieldset class="report-section">
      <legend>${escapeHtml(toTitleCase(section.title))}</legend>
      <div class="section-content">${section.content.map((html) => `<div class="content-item">${html}</div>`).join('')}</div>
    </fieldset>`;
};

/**
 * Format and style numbers in the report for better visual distinction
 * Wraps standalone numbers in <span class="num"> for styling
 */
const formatNumbers = (container) => {
  // Find all text nodes and wrap numbers
  const walk = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        // Skip if parent is already .num, script, style, or inside a link href
        if (node.parentElement?.matches('.num, script, style, a[href]')) {
          return NodeFilter.FILTER_REJECT;
        }
        // Accept if contains numbers
        return /\d/.test(node.textContent) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      },
    },
  );

  const nodesToProcess = [];
  let node = walk.nextNode();
  while (node) {
    nodesToProcess.push(node);
    node = walk.nextNode();
  }

  // Pattern: Numbers with optional decimals, commas, units (%, s, ms, k, M)
  const numberPattern = /(\d{1,3}(?:,\d{3})*(?:\.\d+)?(?:[%skmKM]|ms)?)/g;

  nodesToProcess.forEach((textNode) => {
    const text = textNode.textContent;
    if (!numberPattern.test(text)) return;

    const fragment = document.createDocumentFragment();
    let lastIndex = 0;

    text.replace(numberPattern, (match, num, offset) => {
      // Add text before the number
      if (offset > lastIndex) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex, offset)));
      }

      // Wrap number in styled span
      const span = document.createElement('span');
      span.className = 'num';
      span.textContent = num;
      fragment.appendChild(span);

      lastIndex = offset + match.length;
      return match;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
    }

    textNode.parentNode.replaceChild(fragment, textNode);
  });
};

const renderReport = (container, htmlContent, reportPath) => {
  const sections = extractSections(new DOMParser().parseFromString(htmlContent, 'text/html'));
  if (!sections.length) {
    showError(container, 'No content found in report');
    return;
  }
  container.innerHTML = `<div class="report-sections">${sections.map(createSection).join('')}</div>`;

  // Format numbers for better visual distinction
  formatNumbers(container);

  // New reports have real <a> links baked in from DA upload - no processing needed
  const facetLinks = container.querySelectorAll('a.facet-link');
  if (facetLinks.length > 0) {
    console.log(`[Report Viewer] Report loaded with ${facetLinks.length} facet links ready`);

    // Add click handlers to update dashboard without full page reload
    facetLinks.forEach((link) => {
      link.addEventListener('click', async (e) => {
        e.preventDefault();

        // Store current report date and path in sessionStorage for "Back to Report" button
        const currentReportDate = new URLSearchParams(window.location.search).get('report');
        console.log('[Report Viewer] Facet link clicked:', {
          reportDate: currentReportDate,
          reportPath,
          willStore: !!(currentReportDate && reportPath),
        });
        if (currentReportDate && reportPath) {
          sessionStorage.setItem('optel-detective-source-report', currentReportDate);
          sessionStorage.setItem('optel-detective-source-report-path', reportPath);
          console.log('[Report Viewer] ✅ Stored source report in sessionStorage');
        } else {
          console.warn('[Report Viewer] ⚠️ Cannot store report - missing date or path');
        }

        // Close report viewer first (removes report params, shows dashboard)
        toggleView(false);

        // Build new URL from link, preserving essential params from current URL
        const currentUrl = new URL(window.location);
        const newUrl = new URL(link.href, window.location.origin);

        // Preserve date range and metrics parameter
        ['startDate', 'endDate', 'view', 'domainkey', 'metrics'].forEach((param) => {
          const value = currentUrl.searchParams.get(param);
          if (value && !newUrl.searchParams.has(param)) {
            newUrl.searchParams.set(param, value);
          }
        });

        window.history.pushState({}, '', newUrl);

        // Reload dashboard data using global draw function
        // This should refresh all metrics and facets based on new URL parameters
        if (typeof window.slicerDraw === 'function') {
          try {
            console.log('[Report Viewer] Refreshing dashboard with filters:', newUrl.search);
            console.log('[Report Viewer] Active filters:', {
              checkpoint: newUrl.searchParams.get('checkpoint'),
              url: newUrl.searchParams.get('url'),
              userAgent: newUrl.searchParams.get('userAgent'),
              nested: Array.from(newUrl.searchParams.keys()).filter((k) => k.includes('.')),
            });
            await window.slicerDraw();
            console.log('[Report Viewer] Dashboard refreshed successfully');

            // Wait for DOM to settle, then add button and scroll to checked input
            setTimeout(() => {
              addBackToReportButton();
              scrollToFirstCheckedFacet();
            }, 500);
          } catch (error) {
            console.error('[Report Viewer] Error refreshing dashboard:', error);
          }
        } else {
          console.warn('[Report Viewer] Dashboard draw function not available, falling back to full reload');
          // Use newUrl (which already has metrics preserved) instead of link.href
          window.location.href = newUrl.toString();
        }
      });
    });
  } else {
    console.log('[Report Viewer] Report loaded (no facet links found)');
  }
};

export async function showReportInline(reportPath, reportDate) {
  // Clear any stored source report (we're now viewing a report, not coming from one)
  sessionStorage.removeItem('optel-detective-source-report');
  sessionStorage.removeItem('optel-detective-source-report-path');

  // Wait for dashboard to be ready first
  const dashboardReady = await waitForDashboard();
  if (!dashboardReady) {
    console.warn('[Report Viewer] Dashboard not ready after waiting');
  }

  const viewer = getViewerContainer();
  if (!viewer) return;

  toggleView(true);
  viewer.innerHTML = '<div class="report-loading"><p>Loading report...</p></div>';

  fetchReportContent(reportPath)
    .then((html) => {
      // Extract date range from report meta tags
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const startDateMeta = doc.querySelector('meta[name="report-start-date"]');
      const endDateMeta = doc.querySelector('meta[name="report-end-date"]');

      // Update URL with report date and date range
      const url = new URL(window.location);
      const currentStartDate = url.searchParams.get('startDate');
      const currentEndDate = url.searchParams.get('endDate');

      url.searchParams.set('report', reportDate);
      url.searchParams.set('metrics', 'super'); // Show all checkpoints in report view (matches generation mode)

      // Check if we need to update date range
      let needsReload = false;
      if (startDateMeta?.content && endDateMeta?.content) {
        // Only reload if date range is different
        if (currentStartDate !== startDateMeta.content || currentEndDate !== endDateMeta.content) {
          url.searchParams.set('startDate', startDateMeta.content);
          url.searchParams.set('endDate', endDateMeta.content);
          url.searchParams.set('view', 'custom');
          needsReload = true;

          console.log('[Report Viewer] Date range changed, reloading dashboard:', {
            from: { startDate: currentStartDate, endDate: currentEndDate },
            to: { startDate: startDateMeta.content, endDate: endDateMeta.content },
          });
        }
      }

      // If date range changed, reload the page to refresh dashboard data
      // Otherwise just update URL and render report inline
      if (needsReload) {
        window.location.href = url.toString();
      } else {
        window.history.pushState({}, '', url);
        renderReport(viewer, html, reportPath);
      }
    })
    .catch((err) => showError(viewer, err.message));
}

export async function checkForSharedReport(getReports) {
  const reportDate = new URLSearchParams(window.location.search).get('report');
  if (!reportDate || !getReports) return;

  // Fetch from DA to find matching report by date (yyyy-mm-dd)
  try {
    const reports = await getReports();
    const match = reports.find((r) => {
      const date = new Date(r.timestamp);
      const dateStr = date.toISOString().split('T')[0]; // yyyy-mm-dd
      return dateStr === reportDate;
    });
    if (match) {
      const date = new Date(match.timestamp);
      const dateStr = date.toISOString().split('T')[0];

      // Mark as viewed and update badge (dynamic import to avoid circular dependency)
      // eslint-disable-next-line import/no-cycle
      const { markReportAsViewed, updateNotificationBadge } = await import('../report-actions.js');
      markReportAsViewed(match.path);
      await updateNotificationBadge();

      // Open the report
      showReportInline(match.path, dateStr);
    }
  } catch (err) {
    console.error('Failed to fetch reports:', err);
  }
}

/**
 * Initialize "Back to Report" button on page load if coming from a report
 */
const initBackToReportButton = () => {
  const sourceReport = sessionStorage.getItem('optel-detective-source-report');
  const sourcePath = sessionStorage.getItem('optel-detective-source-report-path');
  if (!sourceReport || !sourcePath) return;

  // If viewing report, clear stale session data; otherwise add button and scroll to filter
  if (new URLSearchParams(window.location.search).get('report')) {
    sessionStorage.removeItem('optel-detective-source-report');
    sessionStorage.removeItem('optel-detective-source-report-path');
  } else {
    setTimeout(() => {
      addBackToReportButton();
      // Also scroll to the checked facet when returning from report
      scrollToFirstCheckedFacet();
    }, 500);
  }
};

// Run on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBackToReportButton);
} else {
  initBackToReportButton();
}

/**
 * Handle browser back/forward button
 */
window.addEventListener('popstate', async () => {
  const reportParam = new URLSearchParams(window.location.search).get('report');

  if (!reportParam) {
    toggleView(false);
    const input = document.querySelector('daterange-picker')?.shadowRoot?.querySelector('input');
    if (input?.getAttribute('aria-expanded') === 'true') input.click();
    return;
  }

  // Open report matching the date parameter
  try {
    // Dynamic import to avoid circular dependency
    // eslint-disable-next-line import/no-cycle
    const { getSavedReports } = await import('../report-actions.js');
    const reports = await getSavedReports();
    const match = reports.find((r) => new Date(r.timestamp).toISOString().split('T')[0] === reportParam);
    if (match) showReportInline(match.path, reportParam);
  } catch (err) {
    console.error('Failed to open report on popstate:', err);
  }
});
