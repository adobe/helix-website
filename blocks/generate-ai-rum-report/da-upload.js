/**
 * DA Upload Module
 * Handles uploading analysis reports to Dark Alley (DA) storage
 */

/* eslint-disable no-console */

// ============================================================================
// CONSTANTS
// ============================================================================

const DA_CONFIG = {
  ORG: 'asthabh23',
  REPO: 'da-demo',
  BASE_URL: 'https://admin.da.live/source',
  UPLOAD_PATH: 'drafts/optel-reports',
};

const TEMPLATE_PATH = '/blocks/generate-ai-rum-report/report-template.html';
const STORAGE_KEY = 'rumChatDeepMode';

// Template cache
let templateCache = null;

// ============================================================================
// TEMPLATE HANDLING
// ============================================================================

/**
 * Get fallback template if loading fails
 * @returns {string} Basic HTML template
 */
function getFallbackTemplate() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{REPORT_TITLE}}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 900px; margin: 0 auto; padding: 40px 20px; }
    .report-content { line-height: 1.6; }
  </style>
</head>
<body>
  <h1>OpTel Detective Analysis Report</h1>
  <div class="report-content">{{ANALYSIS_CONTENT}}</div>
</body>
</html>`;
}

/**
 * Load HTML report template (with caching)
 * @returns {Promise<string>} Template content
 */
async function loadTemplate() {
  if (templateCache) return templateCache;

  try {
    const response = await fetch(TEMPLATE_PATH);
    if (!response.ok) throw new Error(`Template load failed: ${response.status}`);

    templateCache = await response.text();
    return templateCache;
  } catch (error) {
    console.error('[DA Upload] Template error:', error);
    return getFallbackTemplate();
  }
}

// ============================================================================
// CONTENT TRANSFORMATION
// ============================================================================

/**
 * Create table section for DA format with h4 headings preserved
 * @param {Element} titleElement - The h4 element
 * @param {Array<Element>} content
 * @returns {string} HTML table
 */
function createSectionTable(titleElement, content) {
  let table = '<table class="report-table"><tbody>';

  // Section header with facet marker
  table += `
    <tr><td colspan="2"><p>facet</p></td></tr>
    <tr><td colspan="2">${titleElement.outerHTML}</td></tr>`;

  // Content rows
  if (content?.length > 0) {
    content.forEach((element) => {
      const cleanElement = element.cloneNode(true);
      cleanElement.querySelectorAll('br').forEach((br) => br.remove());

      const html = cleanElement.outerHTML.trim();
      if (html) {
        table += `<tr><td colspan="2">${html}</td></tr>`;
      }
    });
  }

  table += '</tbody></table>';
  return table;
}

/**
 * Transform content to table format for DA (preserving h4 tags)
 * @param {string} content
 * @returns {string} Table-formatted HTML
 */
function transformToTableFormat(content) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${content}</div>`, 'text/html');
  const container = doc.querySelector('div');

  if (!container) return content;

  const children = Array.from(container.children);
  if (children.length === 0) return content;

  let output = '';
  let currentHeading = null;
  let sectionContent = [];

  children.forEach((element) => {
    if (element.tagName === 'H4') {
      // Save previous section
      if (currentHeading) {
        output += createSectionTable(currentHeading, sectionContent);
        sectionContent = [];
      }
      currentHeading = element;
    } else if (currentHeading && element.textContent.trim()) {
      sectionContent.push(element);
    }
  });

  // Output final section
  if (currentHeading) {
    output += createSectionTable(currentHeading, sectionContent);
  }

  return output || content;
}

// ============================================================================
// FILENAME & METADATA
// ============================================================================

/**
 * Generate filename with timestamp
 * @returns {string} Filename
 */
function generateFilename() {
  const now = new Date();

  // Human-readable time format: optel-analysis-2025-01-15-at-2-30pm
  const date = now.toISOString().split('T')[0];

  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12 || 12; // Convert to 12-hour format

  return `optel-analysis-${date}--${hours}-${minutes}${ampm}.html`;
}

/**
 * Clean URL for folder name
 * @param {string} url
 * @returns {string} Clean folder name
 */
function cleanUrlForFolder(url) {
  return url ? url.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() : 'dashboard';
}

/**
 * Format date for report
 * @param {string} timestamp
 * @returns {Object} Formatted dates
 */
function formatDates(timestamp) {
  const date = new Date(timestamp);

  return {
    date: date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    timestamp: date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    }),
  };
}

// ============================================================================
// REPORT GENERATION
// ============================================================================

/**
 * Generate complete HTML report
 * @param {string} content
 * @param {string} url
 * @param {string} timestamp
 * @param {boolean} isDeepMode
 * @returns {Promise<string>} Complete HTML document
 */
async function generateReportHTML(content, url, timestamp, isDeepMode) {
  const template = await loadTemplate();
  const reportId = `RPT-${Date.now().toString(36).toUpperCase()}`;
  const { date, timestamp: formattedTimestamp } = formatDates(timestamp);
  const tableContent = transformToTableFormat(content);

  return template
    .replace(/{{REPORT_TITLE}}/g, `OpTel Analysis - ${url || 'Dashboard'}`)
    .replace(/{{ANALYZED_URL}}/g, url || 'Dashboard')
    .replace(/{{GENERATED_DATE}}/g, date)
    .replace(/{{ANALYSIS_MODE}}/g, isDeepMode ? 'Deep Analysis' : 'Standard Analysis')
    .replace(/{{REPORT_ID}}/g, reportId)
    .replace(/{{ANALYSIS_CONTENT}}/g, tableContent)
    .replace(/{{GENERATED_TIMESTAMP}}/g, formattedTimestamp);
}

// ============================================================================
// MAIN UPLOAD FUNCTION
// ============================================================================

/**
 * Upload analysis report to DA storage
 * @param {string} content - Report content (HTML)
 * @param {Object} options
 * @param {string} options.url - URL being analyzed
 * @param {boolean} options.debug - Enable debug logging
 * @returns {Promise<Object>} Upload result
 */
export async function uploadToDA(content, options = {}) {
  const { url = '', debug = false } = options;

  if (!content?.trim()) {
    throw new Error('No content to upload');
  }

  try {
    const isDeepMode = localStorage.getItem(STORAGE_KEY) === 'true';
    const timestamp = new Date().toISOString();

    if (debug) console.log('[DA Upload] Generating HTML...');

    const htmlContent = await generateReportHTML(content, url, timestamp, isDeepMode);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const formData = new FormData();
    formData.append('data', blob);

    const filename = generateFilename();
    const folder = cleanUrlForFolder(url);
    const fullpath = `${DA_CONFIG.BASE_URL}/${DA_CONFIG.ORG}/${DA_CONFIG.REPO}/${DA_CONFIG.UPLOAD_PATH}/${folder}/${filename}`;

    if (debug) {
      console.log('[DA Upload] Target:', fullpath);
      console.log('[DA Upload] Size:', blob.size, 'bytes');
    }

    const response = await fetch(fullpath, { method: 'POST', body: formData });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`Upload failed: ${response.status} ${response.statusText}${errorText ? `\n${errorText}` : ''}`);
    }

    const result = {
      success: true,
      path: fullpath,
      filename,
      folder,
    };

    if (debug) console.log('[DA Upload] Success:', result);

    return result;
  } catch (error) {
    console.error('[DA Upload] Error:', error);
    throw error;
  }
}

/**
 * Get current analyzed URL from dashboard
 * @returns {string} Current URL or empty string
 */
export function getCurrentAnalyzedUrl() {
  const input = document.querySelector('#url');
  return input?.value.trim() || '';
}

/**
 * Map folder items to report objects
 * @param {Array} items - Items from DA folder
 * @param {string} folder - Folder name
 * @param {string} domain - Optional domain
 * @returns {Array} Mapped report objects
 */
function mapFolderItemsToReports(items, folder, domain = null) {
  return items
    .filter((item) => item.ext === 'html' || item.name?.endsWith('.html'))
    .map((item) => {
      const filename = item.name.endsWith('.html') ? item.name : `${item.name}.html`;
      const report = {
        filename,
        path: `${DA_CONFIG.BASE_URL}/${DA_CONFIG.ORG}/${DA_CONFIG.REPO}/${DA_CONFIG.UPLOAD_PATH}/${folder}/${filename}`,
        timestamp: new Date(item.lastModified || item.modified || Date.now()).getTime(),
      };
      if (domain) report.domain = domain;
      return report;
    });
}

/**
 * Fetch reports from a specific folder
 * @param {string} listUrl - Base list URL
 * @param {string} folder - Folder name
 * @param {string} domain - Optional domain
 * @returns {Promise<Array>} Reports from folder
 */
async function fetchReportsFromFolder(listUrl, folder, domain = null) {
  const response = await fetch(`${listUrl}/${folder}`);
  if (!response.ok) return [];
  const items = await response.json();
  return mapFolderItemsToReports(items, folder, domain);
}

/**
 * Fetch list of reports from DA storage
 * @param {string} domainFilter - Optional domain to filter reports by
 * @returns {Promise<Array>} List of report objects
 */
export async function fetchReportsFromDA(domainFilter = null) {
  try {
    const listUrl = `https://admin.da.live/list/${DA_CONFIG.ORG}/${DA_CONFIG.REPO}/${DA_CONFIG.UPLOAD_PATH}`;

    // Fetch from specific domain folder
    if (domainFilter) {
      const folder = cleanUrlForFolder(domainFilter);
      console.log(`[DA Upload] Fetching reports from folder: ${folder} (domain: ${domainFilter})`);
      const reports = await fetchReportsFromFolder(listUrl, folder, domainFilter);
      console.log(`[DA Upload] Found ${reports.length} report(s) for domain: ${domainFilter}`);
      return reports.sort((a, b) => b.timestamp - a.timestamp);
    }

    // Fetch from all folders (legacy behavior)
    const response = await fetch(listUrl);
    if (!response.ok) return [];

    const folders = (await response.json())
      .filter((item) => item.type === 'folder' || (!item.ext && item.name))
      .map((item) => item.name);

    if (!folders.length) return [];

    const reportsArrays = await Promise.all(
      folders.map((folder) => fetchReportsFromFolder(listUrl, folder)),
    );

    return reportsArrays.flat().sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('[DA Upload] Error fetching reports:', error);
    return [];
  }
}

export default uploadToDA;
