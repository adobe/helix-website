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
const HEADING_MAX_LENGTH = 150;

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
 * Check if element is a heading
 * @param {Element} element
 * @returns {string|boolean} Heading text or false
 */
function isHeading(element) {
  const tag = element.tagName.toLowerCase();

  // Check h1-h6 tags
  if (tag[0] === 'h' && tag.length === 2) {
    return element.textContent.trim();
  }

  // Check bold/strong tags (AI-generated headings)
  if (tag === 'b' || tag === 'strong') {
    const text = element.textContent.trim();
    const len = text.length;

    if (len > 0 && len < HEADING_MAX_LENGTH) {
      if (text.endsWith(':') || text === text.toUpperCase()) {
        return text;
      }
    }
  }

  return false;
}

/**
 * Create table section for DA format
 * @param {string} title
 * @param {Array<Element>} content
 * @returns {string} HTML table
 */
function createSectionTable(title, content) {
  let table = '<table class="report-table"><tbody>';

  // Section header
  table += `
    <tr><td colspan="2"><p>facet</p></td></tr>
    <tr><td colspan="2"><p><strong>${title}</strong></p></td></tr>`;

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
 * Transform content to table format for DA
 * @param {string} content
 * @returns {string} Table-formatted HTML
 */
function transformToTableFormat(content) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${content}</div>`, 'text/html');
  const container = doc.querySelector('div');

  if (!container) return content;

  const children = Array.from(container.children);
  if (children.length === 0) {
    return container.textContent.trim()
      ? createSectionTable('Analysis', [container])
      : content;
  }

  let output = '';
  let currentSection = null;
  let sectionContent = [];

  children.forEach((element) => {
    if (element.tagName.toLowerCase() === 'br') return;

    const headingText = isHeading(element);

    if (headingText) {
      if (currentSection) {
        output += createSectionTable(currentSection, sectionContent);
        sectionContent = [];
      }
      currentSection = headingText;
    } else if (currentSection && element.textContent.trim()) {
      sectionContent.push(element);
    }
  });

  // Output final section
  if (currentSection) {
    output += createSectionTable(currentSection, sectionContent);
  }

  // Fallback if no headings found
  if (!output && children.length > 0) {
    output = createSectionTable('Analysis', children);
  }

  return output;
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
  const date = now.toISOString().split('T')[0];
  const time = now.toTimeString().split(' ')[0].replace(/:/g, '-');

  return `optel-analysis-${date}-${time}.html`;
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
 * Fetch list of reports from DA storage
 * @returns {Promise<Array>} List of report objects
 */
export async function fetchReportsFromDA() {
  try {
    const listUrl = `https://admin.da.live/list/${DA_CONFIG.ORG}/${DA_CONFIG.REPO}/${DA_CONFIG.UPLOAD_PATH}`;
    const response = await fetch(listUrl);

    if (!response.ok) return [];

    const folders = (await response.json())
      .filter((item) => item.type === 'folder' || (!item.ext && item.name))
      .map((item) => item.name);

    if (!folders.length) return [];

    const reportsArrays = await Promise.all(folders.map(async (folder) => {
      const folderResponse = await fetch(`${listUrl}/${folder}`);
      if (!folderResponse.ok) return [];

      return (await folderResponse.json())
        .filter((item) => item.ext === 'html' || item.name?.endsWith('.html'))
        .map((item) => {
          const filename = item.name.endsWith('.html') ? item.name : `${item.name}.html`;
          return {
            filename,
            path: `${DA_CONFIG.BASE_URL}/${DA_CONFIG.ORG}/${DA_CONFIG.REPO}/${DA_CONFIG.UPLOAD_PATH}/${folder}/${filename}`,
            timestamp: new Date(item.lastModified || item.modified || Date.now()).getTime(),
          };
        });
    }));

    return reportsArrays.flat().sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('[DA Upload] Error fetching reports:', error);
    return [];
  }
}

export default uploadToDA;
