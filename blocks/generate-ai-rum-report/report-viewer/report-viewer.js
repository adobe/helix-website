/**
 * Report Viewer Module - Displays reports inline in facet-sidebar location
 */

/* eslint-disable no-console */

import { markReportAsViewed, updateNotificationBadge, getSavedReports } from '../report-actions.js';

// Load report viewer CSS
if (!document.querySelector('link[href*="report-viewer.css"]')) {
  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = '/blocks/generate-ai-rum-report/report-viewer/report-viewer.css';
  document.head.appendChild(css);
}

// Constants
const ELEMENTS = {
  FACET_SIDEBAR: 'facet-sidebar',
  FACETS_CONTAINER: '#facets',
  VIEWER_CONTAINER: 'report-viewer-container',
};

const SELECTORS = {
  REPORT_CONTENT: '.report-content',
};

// State
let cachedElements = {};

/**
 * Get element by ID
 * @param {string} id
 * @returns {HTMLElement}
 */
function getElement(id) {
  return document.getElementById(id);
}

/**
 * Get or create report viewer container
 * @returns {HTMLElement}
 */
function getViewerContainer() {
  let container = getElement(ELEMENTS.VIEWER_CONTAINER);

  if (!container) {
    const facetsContainer = cachedElements.facetsContainer
      || document.querySelector(ELEMENTS.FACETS_CONTAINER);
    if (!facetsContainer?.parentNode) return null;

    container = document.createElement('div');
    container.id = ELEMENTS.VIEWER_CONTAINER;
    container.className = 'report-viewer';
    facetsContainer.parentNode.insertBefore(container, facetsContainer.nextSibling);
  }

  return container;
}

/**
 * Get facet sidebar element
 * @returns {HTMLElement}
 */
function getFacetSidebar() {
  if (!cachedElements.facetSidebar) {
    cachedElements.facetSidebar = document.querySelector(ELEMENTS.FACET_SIDEBAR);
  }
  return cachedElements.facetSidebar;
}

function toggleView(showReport) {
  const viewer = getViewerContainer();
  const facets = cachedElements.facetsContainer
    || document.querySelector(ELEMENTS.FACETS_CONTAINER);
  const sidebar = getFacetSidebar();

  if (viewer) {
    viewer.classList.toggle('visible', showReport);
    viewer.style.display = showReport ? 'block' : 'none';
  }
  if (facets) facets.style.display = showReport ? 'none' : 'block';
  if (sidebar) sidebar.classList.toggle('report-view-active', showReport);
}

/**
 * Show loading state
 * @param {HTMLElement} container
 */
function showLoading(container) {
  container.innerHTML = '<div class="report-loading"><p>Loading report...</p></div>';
}

/**
 * Close report viewer and return to facets view
 */
export function closeReportViewer() {
  // Remove report date from URL
  const url = new URL(window.location);
  url.searchParams.delete('report');
  window.history.pushState({}, '', url);

  toggleView(false);
  cachedElements = {};
}

// Make globally available
window.closeReportViewer = closeReportViewer;

/**
 * Show error state
 * @param {HTMLElement} container
 * @param {string} message
 */
function showError(container, message = 'Failed to load report') {
  container.innerHTML = `
    <div class="report-error">
      <p>${message}</p>
      <button class="error-back-btn">Back to Dashboard</button>
    </div>
  `;
  container.querySelector('.error-back-btn')?.addEventListener('click', closeReportViewer);
}

/**
 * Extract sections from report content
 * @param {Document} doc - Parsed HTML document
 * @returns {Array<{title: string, content: string[]}>}
 */
function extractSections(doc) {
  const container = doc.querySelector(SELECTORS.REPORT_CONTENT) || doc.querySelector('main') || doc.body;
  if (!container) return [];

  const sections = [];
  let currentSection = null;

  // Check for table format (DA saved reports)
  const tables = container.querySelectorAll('table.report-table');
  if (tables.length > 0) {
    tables.forEach((table) => {
      table.querySelectorAll('tbody tr td').forEach((cell) => {
        const text = cell.textContent.trim();
        if (text === 'facet') return;

        // Check for h4 tags in table cells
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

  // Check for h4 headings (inline reports)
  const children = Array.from(container.children);
  children.forEach((el) => {
    if (el.tagName === 'H4') {
      if (currentSection && currentSection.content.length > 0) {
        sections.push(currentSection);
      }
      currentSection = { title: el.textContent.trim(), content: [] };
    } else if (currentSection && el.textContent.trim()) {
      currentSection.content.push(el.outerHTML);
    }
  });

  if (currentSection && currentSection.content.length > 0) {
    sections.push(currentSection);
  }

  return sections;
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text
 * @returns {string}
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Convert text to title case (handles all-caps conversion)
 * @param {string} text - Text to convert
 * @returns {string} - Title cased text
 */
function toTitleCase(text) {
  return text
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Create HTML for a report section
 * @param {Object} section - Section object with title and content
 * @returns {string}
 */
function createSection(section) {
  if (!section?.title) return '';

  const content = section.content
    .map((html) => `<div class="content-item">${html}</div>`)
    .join('');

  return `
    <fieldset class="report-section">
      <legend>${escapeHtml(toTitleCase(section.title))}</legend>
      <div class="section-content">${content}</div>
    </fieldset>
  `;
}

/**
 * Render complete report in container
 * @param {HTMLElement} container
 * @param {string} htmlContent
 */
function renderReport(container, htmlContent) {
  const doc = new DOMParser().parseFromString(htmlContent, 'text/html');
  const sections = extractSections(doc);

  container.innerHTML = `<div class="report-sections">${sections.map(createSection).join('')}</div>`;
}

export function showReportInline(reportPath, reportDate) {
  const viewer = getViewerContainer();
  if (!viewer) return;

  // Use date in yyyy-mm-dd format as URL parameter
  const url = new URL(window.location);

  // Only update URL if report date is different or missing
  if (url.searchParams.get('report') !== reportDate) {
    url.searchParams.set('report', reportDate);
    window.history.pushState({}, '', url);
  }

  toggleView(true);
  showLoading(viewer);

  fetch(reportPath)
    .then((res) => (res.ok ? res.text() : Promise.reject(new Error(`HTTP ${res.status}`))))
    .then((html) => renderReport(viewer, html))
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

      // Mark as viewed and update badge
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
    cachedElements = {};

    // Close date range dropdown if open
    const input = document.querySelector('daterange-picker')?.shadowRoot?.querySelector('input');
    if (input?.getAttribute('aria-expanded') === 'true') input.click();
    return;
  }

  // Open report matching the date parameter
  try {
    const reports = await getSavedReports();
    const match = reports.find((r) => new Date(r.timestamp).toISOString().split('T')[0] === reportParam);
    if (match) showReportInline(match.path, reportParam);
  } catch (err) {
    console.error('Failed to open report on popstate:', err);
  }
});
