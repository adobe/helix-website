/**
 * Report Viewer Module - Displays reports inline in facet-sidebar location
 */

/* eslint-disable no-console */

// Load report viewer CSS
if (!document.querySelector('link[href*="report-viewer.css"]')) {
  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = '/blocks/generate-ai-rum-report/report-viewer/report-viewer.css';
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
  if (sidebar) sidebar.classList.toggle('report-view-active', show);
};

export const closeReportViewer = () => {
  const url = new URL(window.location);
  url.searchParams.delete('report');
  url.searchParams.delete('startDate');
  url.searchParams.delete('endDate');
  url.searchParams.delete('view');
  window.history.pushState({}, '', url);
  toggleView(false);
};

window.closeReportViewer = closeReportViewer;

const showError = (container, message = 'Failed to load report') => {
  container.innerHTML = `<div class="report-error"><p>${message}</p><button class="error-back-btn">Back to Dashboard</button></div>`;
  container.querySelector('.error-back-btn')?.addEventListener('click', closeReportViewer);
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

const createSection = (section) => {
  if (!section?.title) return '';
  return `
    <fieldset class="report-section">
      <legend>${escapeHtml(toTitleCase(section.title))}</legend>
      <div class="section-content">${section.content.map((html) => `<div class="content-item">${html}</div>`).join('')}</div>
    </fieldset>`;
};

const renderReport = (container, htmlContent) => {
  const sections = extractSections(new DOMParser().parseFromString(htmlContent, 'text/html'));
  if (!sections.length) {
    showError(container, 'No content found in report');
    return;
  }
  container.innerHTML = `<div class="report-sections">${sections.map(createSection).join('')}</div>`;

  // New reports have real <a> links baked in from DA upload - no processing needed
  const linkCount = container.querySelectorAll('a.facet-link').length;
  if (linkCount > 0) {
    console.log(`[Report Viewer] Report loaded with ${linkCount} facet links ready`);
  } else {
    console.log('[Report Viewer] Report loaded (no facet links found)');
  }
};

export function showReportInline(reportPath, reportDate) {
  const viewer = getViewerContainer();
  if (!viewer) return;

  toggleView(true);
  viewer.innerHTML = '<div class="report-loading"><p>Loading report...</p></div>';

  fetch(reportPath, { cache: 'no-store' })
    .then((res) => (res.ok ? res.text() : Promise.reject(new Error(`HTTP ${res.status}`))))
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
        renderReport(viewer, html);
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
