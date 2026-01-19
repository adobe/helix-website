/**
 * Report Viewer Module - Displays saved reports inline in facet-sidebar location
 */

/* eslint-disable no-console */

import { DA_CONFIG } from '../config.js';

// Load report viewer CSS
if (!document.querySelector('link[href*="report-viewer.css"]')) {
  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = '/blocks/ai-optel-report-generator/reports/report-viewer.css';
  document.head.appendChild(css);
}

/** Fetch report content via CF Worker */
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

/** Get or create viewer container next to facets */
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

/** Toggle between report view and facets view */
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
    if (show) document.querySelectorAll('.back-to-report-icon').forEach((el) => el.remove());
  }
};

/** Show/hide Claude button based on report view state */
const setClaudeButtonVisibility = (visible) => {
  const btn = document.querySelector('facet-sidebar .ai-optel-report-generator-button');
  if (btn) btn.style.display = visible ? '' : 'none';
};

/** Close report viewer and clean URL params */
export const closeReportViewer = () => {
  ['optel-detective-source-report', 'optel-detective-source-report-path', 'optel-detective-source-report-view']
    .forEach((k) => sessionStorage.removeItem(k));
  const url = new URL(window.location);
  ['report', 'metrics', 'startDate', 'endDate', 'view'].forEach((p) => url.searchParams.delete(p));
  window.history.pushState({}, '', url);
  toggleView(false);
  setClaudeButtonVisibility(true);
};

window.closeReportViewer = closeReportViewer;

const BACK_BTN_SVG = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
  <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
  <line x1="16" y1="17" x2="8" y2="17"/></svg>`;

/** Add "Back to Report" buttons : static in sidebar & floating when scrolled out */
const addBackToReportButton = () => {
  document.querySelectorAll('.back-to-report-btn, .back-to-report-floating').forEach((b) => b.remove());

  const reportDate = sessionStorage.getItem('optel-detective-source-report');
  const reportPath = sessionStorage.getItem('optel-detective-source-report-path');
  if (!reportDate || !reportPath) return;

  const claudeBtn = document.querySelector('facet-sidebar .ai-optel-report-generator-button');
  if (!claudeBtn) return;

  setClaudeButtonVisibility(false);

  const removeBackButtons = () => {
    document.querySelectorAll('.back-to-report-btn, .back-to-report-floating').forEach((b) => b.remove());
  };

  const handleClick = async () => {
    const savedView = sessionStorage.getItem('optel-detective-source-report-view') || 'week';
    // Keep clicked link ID for scroll-back, remove others
    ['optel-detective-source-report', 'optel-detective-source-report-path', 'optel-detective-source-report-view']
      .forEach((k) => sessionStorage.removeItem(k));
    removeBackButtons();
    // Stay in report view, so keep Claude button hidden

    const url = new URL(window.location);
    url.searchParams.set('report', reportDate);
    url.searchParams.set('view', savedView);

    ['metrics', 'checkpoint', 'url', 'userAgent', ...Array.from(url.searchParams.keys()).filter((k) => k.includes('.'))]
      .forEach((k) => url.searchParams.delete(k));

    document.querySelectorAll('facet-sidebar input[type="checkbox"]:checked')
      .forEach((el) => { el.checked = false; el.indeterminate = false; });

    window.history.pushState({}, '', url);
    if (typeof window.slicerDraw === 'function') await window.slicerDraw();
    // eslint-disable-next-line no-use-before-define
    await showReportInline(reportPath, reportDate);
    // Scroll back to the clicked link after report renders
    // eslint-disable-next-line no-use-before-define
    setTimeout(() => scrollToClickedLink(), 300);
  };

  // Static button (circular, replaces Claude button)
  const staticBtn = Object.assign(document.createElement('button'), {
    className: 'back-to-report-btn',
    title: 'Back to Report',
    innerHTML: BACK_BTN_SVG,
    onclick: handleClick,
  });
  claudeBtn.parentNode.insertBefore(staticBtn, claudeBtn.nextSibling);

  // Floating button (hidden by default, shown when static is out of view)
  const floatingBtn = Object.assign(document.createElement('button'), {
    className: 'back-to-report-floating',
    title: 'Back to Report',
    innerHTML: BACK_BTN_SVG,
    onclick: handleClick,
  });
  document.body.appendChild(floatingBtn);

  // Show floating only when static is scrolled out of view
  new IntersectionObserver(([e]) => {
    floatingBtn.classList.toggle('visible', !e.isIntersecting);
  }, { threshold: 0 }).observe(staticBtn);
};

/** Show error message in viewer */
const showError = (container, message = 'Failed to load report') => {
  container.innerHTML = `<div class="report-error"><p>${message}</p>
    <button class="error-back-btn">Back to Dashboard</button></div>`;
  container.querySelector('.error-back-btn')?.addEventListener('click', closeReportViewer);
};

/** Scroll to facet matching URL params with highlight */
const scrollToFirstCheckedFacet = (retries = 10) => {
  const params = new URLSearchParams(window.location.search);
  const facet = ['checkpoint', 'url', 'userAgent'].find((f) => params.has(f));
  const el = facet
    ? document.querySelector(`[facet="${facet}"]`)
    : document.querySelector('#facets input:checked, #facets [aria-selected="true"]');
  const fieldset = el?.closest('fieldset') || el;

  if (fieldset) {
    fieldset.scrollIntoView({ behavior: 'smooth', block: 'center' });
    fieldset.classList.add('highlight-checked');
    setTimeout(() => fieldset.classList.remove('highlight-checked'), 1500);
  } else if (retries > 0) {
    setTimeout(() => scrollToFirstCheckedFacet(retries - 1), 200);
  }
};

/** Scroll to clicked facet link in report with highlight */
const scrollToClickedLink = (retries = 5) => {
  const linkId = sessionStorage.getItem('optel-clicked-facet-link');
  if (!linkId) return;

  const link = document.getElementById(linkId);
  if (link) {
    link.scrollIntoView({ behavior: 'smooth', block: 'center' });
    link.classList.add('highlight-return');
    setTimeout(() => link.classList.remove('highlight-return'), 2000);
    sessionStorage.removeItem('optel-clicked-facet-link');
  } else if (retries > 0) {
    setTimeout(() => scrollToClickedLink(retries - 1), 200);
  }
};

/** Wait for dashboard elements to be ready */
const waitForDashboard = async (maxAttempts = 20, delay = 100) => {
  for (let i = 0; i < maxAttempts; i += 1) {
    if (document.querySelector('#facets')) return true;
    // eslint-disable-next-line no-await-in-loop
    await new Promise((r) => { setTimeout(r, delay); });
  }
  return false;
};

/** Extract sections from report HTML (supports table/div/h4 formats) */
const extractSections = (doc) => {
  const container = doc.querySelector('.report-content') || doc.querySelector('main') || doc.body;
  if (!container) return [];

  const sections = [];
  let current = null;

  const pushCurrent = () => { if (current) sections.push(current); };

  // Table format (DA saved reports)
  const tables = container.querySelectorAll('table.report-table');
  if (tables.length > 0) {
    tables.forEach((table) => {
      table.querySelectorAll('tbody tr td').forEach((cell) => {
        const text = cell.textContent.trim();
        if (text === 'facet') return;
        const h4 = cell.querySelector('h4');
        if (h4) {
          pushCurrent();
          current = { title: h4.textContent.trim(), content: [] };
        } else if (current && text) {
          current.content.push(cell.innerHTML);
        }
      });
    });
    pushCurrent();
    return sections;
  }

  // AEM facet divs
  const facetDivs = container.querySelectorAll('div.facet');
  if (facetDivs.length > 0) {
    facetDivs.forEach((div) => {
      const h4 = div.querySelector('h4');
      if (!h4) return;
      const content = Array.from(div.children)
        .filter((c) => !c.contains(h4) && c.textContent.trim() && c.textContent.trim() !== 'facet')
        .map((c) => c.outerHTML);
      if (content.length) sections.push({ title: h4.textContent.trim(), content });
    });
    return sections;
  }

  // Inline h4 sections
  container.querySelectorAll('h4').forEach((h4) => {
    pushCurrent();
    current = { title: h4.textContent.trim(), content: [] };
    let sibling = h4.parentElement.nextElementSibling;
    while (sibling && !sibling.querySelector('h4')) {
      const text = sibling.textContent.trim();
      if (text && text !== 'facet') current.content.push(sibling.outerHTML);
      sibling = sibling.nextElementSibling;
    }
  });
  pushCurrent();

  return sections;
};

const escapeHtml = (t) => Object.assign(document.createElement('div'), { textContent: t }).innerHTML;
const toTitleCase = (t) => t.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

/** Create HTML for a report section */
const createSection = (section) => (section?.title ? `
  <fieldset class="report-section">
    <legend>${escapeHtml(toTitleCase(section.title))}</legend>
    <div class="section-content">${section.content.map((h) => `<div class="content-item">${h}</div>`).join('')}</div>
  </fieldset>` : '');

/** Format numbers in report for visual styling */
const formatNumbers = (container) => {
  const walk = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => {
      if (n.parentElement?.matches('.num, script, style, a[href]')) return NodeFilter.FILTER_REJECT;
      return /\d/.test(n.textContent) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });

  const nodes = [];
  let node = walk.nextNode();
  while (node) { nodes.push(node); node = walk.nextNode(); }

  const pattern = /(\d{1,3}(?:,\d{3})*(?:\.\d+)?(?:[%skmKM]|ms)?)/g;

  nodes.forEach((textNode) => {
    const text = textNode.textContent;
    if (!pattern.test(text)) return;

    const frag = document.createDocumentFragment();
    let lastIdx = 0;

    text.replace(pattern, (match, num, offset) => {
      if (offset > lastIdx) frag.appendChild(document.createTextNode(text.slice(lastIdx, offset)));
      const span = Object.assign(document.createElement('span'), { className: 'num', textContent: num });
      frag.appendChild(span);
      lastIdx = offset + match.length;
      return match;
    });

    if (lastIdx < text.length) frag.appendChild(document.createTextNode(text.slice(lastIdx)));
    textNode.parentNode.replaceChild(frag, textNode);
  });
};

/** Render report content with clickable facet links */
const renderReport = (container, htmlContent, reportPath) => {
  const sections = extractSections(new DOMParser().parseFromString(htmlContent, 'text/html'));
  if (!sections.length) return showError(container, 'No content found in report');

  container.innerHTML = `<div class="report-sections">${sections.map(createSection).join('')}</div>`;
  formatNumbers(container);

  // Add unique IDs and click handlers for facet links
  container.querySelectorAll('a.facet-link').forEach((link, index) => {
    const linkId = `facet-link-${index}`;
    link.id = linkId;

    link.addEventListener('click', async (e) => {
      e.preventDefault();

      const currentParams = new URLSearchParams(window.location.search);
      const currentReportDate = currentParams.get('report');
      if (currentReportDate && reportPath) {
        sessionStorage.setItem('optel-detective-source-report', currentReportDate);
        sessionStorage.setItem('optel-detective-source-report-path', reportPath);
        sessionStorage.setItem('optel-detective-source-report-view', currentParams.get('view') || 'week');
        // Store clicked link ID for scroll-back
        sessionStorage.setItem('optel-clicked-facet-link', linkId);
      }

      toggleView(false);

      const currentUrl = new URL(window.location);
      const newUrl = new URL(link.href, window.location.origin);
      ['startDate', 'endDate', 'view', 'domainkey'].forEach((p) => {
        const v = currentUrl.searchParams.get(p);
        if (v && !newUrl.searchParams.has(p)) newUrl.searchParams.set(p, v);
      });

      if (newUrl.searchParams.has('checkpoint')) {
        newUrl.searchParams.set('metrics', 'super');
        sessionStorage.setItem('optel-metrics-super-intentional', 'true');
      }

      window.history.pushState({}, '', newUrl);

      if (typeof window.slicerDraw === 'function') {
        await window.slicerDraw();
        setTimeout(() => { addBackToReportButton(); scrollToFirstCheckedFacet(); }, 500);
      } else {
        window.location.href = newUrl.toString();
      }
    });
  });

  return undefined;
};

/** Display a report inline (main entry point) */
export async function showReportInline(reportPath, reportDate) {
  ['optel-detective-source-report', 'optel-detective-source-report-path', 'optel-detective-source-report-view']
    .forEach((k) => sessionStorage.removeItem(k));

  await waitForDashboard();
  const viewer = getViewerContainer();
  if (!viewer) return;

  toggleView(true);
  viewer.innerHTML = '<div class="report-loading"><p>Loading report...</p></div>';

  try {
    const html = await fetchReportContent(reportPath);
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const viewMeta = doc.querySelector('meta[name="report-view"]')?.content || 'week';
    const endMeta = doc.querySelector('meta[name="report-end-date"]')?.content;

    const url = new URL(window.location);
    const curView = url.searchParams.get('view');
    const curEnd = url.searchParams.get('endDate');
    const hadStart = url.searchParams.has('startDate');

    // Set report param and clear filters
    url.searchParams.set('report', reportDate);
    ['metrics', 'checkpoint', 'url', 'userAgent', 'startDate',
      ...Array.from(url.searchParams.keys()).filter((k) => k.includes('.'))]
      .forEach((k) => url.searchParams.delete(k));

    // Set view and endDate only (no startDate) for fetchPrevious31Days
    url.searchParams.set('view', viewMeta);
    if (endMeta) url.searchParams.set('endDate', endMeta);

    document.querySelectorAll('facet-sidebar input[type="checkbox"]:checked')
      .forEach((el) => { el.checked = false; el.indeterminate = false; });

    // Reload if view/endDate changed or had startDate
    if (curView !== viewMeta || curEnd !== endMeta || hadStart) {
      console.log(`[Report Viewer] Restoring view=${viewMeta}, endDate=${endMeta}`);
      window.location.href = url.toString();
      return;
    }

    window.history.pushState({}, '', url);
    if (typeof window.slicerDraw === 'function') await window.slicerDraw();
    renderReport(viewer, html, reportPath);
  } catch (err) {
    showError(viewer, err.message);
  }
}

/** Check URL for shared report and open it */
export async function checkForSharedReport(getReports) {
  const reportDate = new URLSearchParams(window.location.search).get('report');
  if (!reportDate || !getReports) return;

  try {
    const reports = await getReports();
    const match = reports.find((r) => new Date(r.timestamp).toISOString().split('T')[0] === reportDate);
    if (match) {
      // eslint-disable-next-line import/no-cycle
      const { markReportAsViewed, updateNotificationBadge } = await import('./report-actions.js');
      markReportAsViewed(match.path);
      await updateNotificationBadge();
      showReportInline(match.path, reportDate);
    }
  } catch (err) {
    console.error('Failed to fetch reports:', err);
  }
}

/** Clean metrics=super on reload unless intentional navigation from report */
const cleanMetricsSuperOnReload = () => {
  const url = new URL(window.location);
  if (url.searchParams.get('metrics') !== 'super') return;

  if (sessionStorage.getItem('optel-metrics-super-intentional') === 'true') {
    sessionStorage.removeItem('optel-metrics-super-intentional');
    return;
  }

  ['metrics', 'checkpoint', ...Array.from(url.searchParams.keys()).filter((k) => k.includes('.'))]
    .forEach((k) => url.searchParams.delete(k));
  window.history.replaceState({}, '', url);
};

const initBackToReportButton = () => {
  const [sourceReport, sourcePath] = ['optel-detective-source-report', 'optel-detective-source-report-path']
    .map((k) => sessionStorage.getItem(k));
  if (!sourceReport || !sourcePath) return;

  if (new URLSearchParams(window.location.search).get('report')) {
    sessionStorage.removeItem('optel-detective-source-report');
    sessionStorage.removeItem('optel-detective-source-report-path');
  } else {
    setTimeout(() => { addBackToReportButton(); scrollToFirstCheckedFacet(); }, 500);
  }
};

// Hide Claude button when viewing a report
const hideClaudeButtonInReportView = () => {
  if (new URLSearchParams(window.location.search).has('report')) {
    setClaudeButtonVisibility(false);
  }
};

// Clean metrics=super on page load (must run before dashboard loads)
cleanMetricsSuperOnReload();

// Initialize on DOM ready
const initOnReady = () => { initBackToReportButton(); hideClaudeButtonInReportView(); };
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initOnReady);
} else {
  initOnReady();
}

// Also hide after sidebar loads (it may render after DOM ready)
const observer = new MutationObserver(() => {
  if (document.querySelector('facet-sidebar .ai-optel-report-generator-button')) {
    hideClaudeButtonInReportView();
    observer.disconnect();
  }
});
observer.observe(document.body, { childList: true, subtree: true });

// Handle browser back/forward
window.addEventListener('popstate', async () => {
  const reportParam = new URLSearchParams(window.location.search).get('report');

  if (!reportParam) {
    toggleView(false);
    setClaudeButtonVisibility(true);
    const input = document.querySelector('daterange-picker')?.shadowRoot?.querySelector('input');
    if (input?.getAttribute('aria-expanded') === 'true') input.click();
    return;
  }

  setClaudeButtonVisibility(false);
  try {
    // eslint-disable-next-line import/no-cycle
    const { getSavedReports } = await import('./report-actions.js');
    const reports = await getSavedReports();
    const match = reports.find((r) => new Date(r.timestamp).toISOString().split('T')[0] === reportParam);
    if (match) showReportInline(match.path, reportParam);
  } catch (err) {
    console.error('Failed to open report on popstate:', err);
  }
});

// Listen for daterange picker changes (when user selects a date range instead of report)
const watchForDateRangeChange = () => {
  const picker = document.querySelector('daterange-picker');
  if (!picker) {
    setTimeout(watchForDateRangeChange, 500);
    return;
  }

  picker.addEventListener('change', () => {
    const hasReport = new URLSearchParams(window.location.search).has('report');
    if (!hasReport) {
      toggleView(false);
      setClaudeButtonVisibility(true);
    }
  });
};
watchForDateRangeChange();
