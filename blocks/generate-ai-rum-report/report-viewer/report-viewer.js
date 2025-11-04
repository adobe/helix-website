/**
 * Report Viewer Module - Displays reports inline in facet-sidebar location
 */

/* eslint-disable no-console */

import { markReportAsViewed, updateNotificationBadge } from '../report-actions.js';

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
  METADATA_ITEM: '.metadata-item',
  METADATA_VALUE: '.metadata-value',
  REPORT_CONTENT: '.report-content',
  REPORT_TABLE: 'table.report-table',
};

const METADATA_KEYS = {
  URL: 'Analyzed URL:',
  DATE: 'Generated on:',
  MODE: 'Analysis Mode:',
};

// State
let cachedElements = {};

// Generate hash from string (deterministic, better distribution)
const makeHash = (str) => {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    const char = str.charCodeAt(i);
    h = Math.imul(31, h) + char;
    // Keep in 32-bit range
    h %= 2147483648;
  }
  // Convert to base36, pad to 10 chars for better uniqueness
  return Math.abs(h).toString(36).padStart(10, '0');
};

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

  if (viewer) viewer.classList.toggle('visible', showReport);
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
  // Remove report hash from URL
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
 * Extract metadata from report document
 * @param {Document} doc - Parsed HTML document
 * @returns {Object} Metadata object
 */
function extractMetadata(doc) {
  const metadata = { url: '', date: '', mode: '' };
  const items = doc.querySelectorAll(SELECTORS.METADATA_ITEM);

  items.forEach((item) => {
    const text = item.textContent.trim();
    const value = item.querySelector(SELECTORS.METADATA_VALUE)?.textContent.trim() || '';

    if (text.includes(METADATA_KEYS.URL)) metadata.url = value;
    else if (text.includes(METADATA_KEYS.DATE)) metadata.date = value;
    else if (text.includes(METADATA_KEYS.MODE)) metadata.mode = value;
  });

  // Fallback: try simple paragraph extraction
  if (!metadata.url && !metadata.date) {
    const main = doc.querySelector('main');
    const paras = main?.querySelectorAll('p') || [];
    paras.forEach((p) => {
      const text = p.textContent;
      if (text.includes(METADATA_KEYS.URL)) {
        metadata.url = text.replace(METADATA_KEYS.URL, '').trim();
      } else if (text.includes(METADATA_KEYS.DATE)) {
        metadata.date = text.replace(METADATA_KEYS.DATE, '').trim();
      }
    });
  }

  return metadata;
}

/**
 * Extract sections from table format
 * @param {NodeList} tables
 * @returns {Array<{title: string, content: string[]}>}
 */
function extractFromTables(tables) {
  const sections = [];

  tables.forEach((table) => {
    let currentSection = null;

    table.querySelectorAll('tbody tr td').forEach((cell) => {
      const text = cell.textContent.trim();
      if (text === 'facet') return;

      const titleEl = cell.querySelector('strong');
      if (titleEl) {
        if (currentSection) sections.push(currentSection);
        currentSection = { title: titleEl.textContent.trim(), content: [] };
      } else if (currentSection && text) {
        currentSection.content.push(cell.innerHTML);
      }
    });

    if (currentSection) sections.push(currentSection);
  });

  return sections;
}

/**
 * Extract sections from DA facet format
 * @param {NodeList} facetDivs
 * @returns {Array<{title: string, content: string[]}>}
 */
function extractFromFacets(facetDivs) {
  const sections = [];

  facetDivs.forEach((facet) => {
    const divs = facet.querySelectorAll(':scope > div > div');
    let title = '';
    const content = [];

    divs.forEach((div, i) => {
      const strong = div.querySelector('strong');
      if (strong && i === 0) {
        title = strong.textContent.trim().replace(':', '');
      } else if (div.textContent.trim()) {
        content.push(div.innerHTML);
      }
    });

    if (title && content.length) sections.push({ title, content });
  });

  return sections;
}

/**
 * Extract sections from report content
 * @param {Document} doc - Parsed HTML document
 * @returns {Array<{title: string, content: string[]}>}
 */
function extractSections(doc) {
  const container = doc.querySelector(SELECTORS.REPORT_CONTENT) || doc.querySelector('main');
  if (!container) return [];

  // Try table format first
  const tables = container.querySelectorAll(SELECTORS.REPORT_TABLE);
  if (tables.length > 0) {
    return extractFromTables(tables);
  }

  // Fallback to div.facet format
  return extractFromFacets(container.querySelectorAll('div.facet'));
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
 * Create HTML for report header
 * @param {string} filename - Report filename
 * @returns {string}
 */
function createHeader(filename) {
  return `
    <div class="report-header">
      <button class="report-back-btn">← Back</button>
      <span class="report-title">${filename || 'Report'}</span>
      <button class="report-copy-link-btn">🔗 Copy Link</button>
    </div>
  `;
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
      <legend>${escapeHtml(section.title)}</legend>
      <div class="section-content">${content}</div>
    </fieldset>
  `;
}

/**
 * Render complete report in container
 * @param {HTMLElement} container
 * @param {string} htmlContent
 * @param {string} filename
 * @param {string} reportHash - Hash ID for shareable link
 */
function renderReport(container, htmlContent, filename, reportHash) {
  const doc = new DOMParser().parseFromString(htmlContent, 'text/html');
  const metadata = extractMetadata(doc);
  const sections = extractSections(doc);

  container.innerHTML = `
    ${createHeader(filename, metadata)}
    <div class="report-sections">${sections.map(createSection).join('')}</div>
  `;

  container.querySelector('.report-back-btn')?.addEventListener('click', closeReportViewer);

  const copyBtn = container.querySelector('.report-copy-link-btn');
  if (copyBtn && reportHash) {
    copyBtn.onclick = async () => {
      try {
        await navigator.clipboard.writeText(window.location.href);
        const orig = copyBtn.textContent;
        copyBtn.textContent = '✓ Copied!';
        setTimeout(() => { copyBtn.textContent = orig; }, 2000);
      } catch (err) {
        console.error('Copy failed:', err);
      }
    };
  }
}

export function showReportInline(reportPath, reportFilename) {
  const viewer = getViewerContainer();
  if (!viewer) return;

  // Use filename for hash since it's unique for each report
  const hash = makeHash(reportFilename);

  const url = new URL(window.location);

  // Only update URL if report hash is different or missing
  if (url.searchParams.get('report') !== hash) {
    url.searchParams.set('report', hash);
    window.history.pushState({}, '', url);
  }

  toggleView(true);
  showLoading(viewer);

  fetch(reportPath)
    .then((res) => (res.ok ? res.text() : Promise.reject(new Error(`HTTP ${res.status}`))))
    .then((html) => renderReport(viewer, html, reportFilename, hash))
    .catch((err) => showError(viewer, err.message));
}

export async function checkForSharedReport(getReports) {
  const hash = new URLSearchParams(window.location.search).get('report');
  if (!hash || !getReports) return;

  // Fetch from DA to find matching report by filename hash
  try {
    const reports = await getReports();
    const match = reports.find((r) => {
      const name = r.filename || r.path.split('/').pop();
      return makeHash(name) === hash;
    });
    if (match) {
      const name = match.filename || match.path.split('/').pop();

      // Mark as viewed and update badge
      markReportAsViewed(match.path);
      await updateNotificationBadge();

      // Open the report
      showReportInline(match.path, name);
    }
  } catch (err) {
    console.error('Failed to fetch reports:', err);
  }
}
