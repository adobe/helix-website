/**
 * DA Upload Module - Uploads analysis reports to Document Authoring (DA) storage
 */

/* eslint-disable no-console */

import { convertSpansToLinks } from './facet-link-generator.js';
import { DA_CONFIG, PATHS } from '../config.js';

const TEMPLATE_PATH = `${PATHS.BLOCK_BASE}/${PATHS.REPORT_TEMPLATE}`;
let templateCache = null;

/** Fallback template if loading fails */
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
  <h1>{{REPORT_TITLE}}</h1>
  <div class="report-content">{{ANALYSIS_CONTENT}}</div>
</body>
</html>`;
}

/** Load HTML report template with caching */
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

/** Create table section for DA format with h4 headings */
function createSectionTable(titleElement, content) {
  let table = '<table class="report-table"><tbody>';
  table += `<tr><td colspan="2"><p>facet</p></td></tr>
    <tr><td colspan="2">${titleElement.outerHTML}</td></tr>`;

  content?.forEach((el) => {
    const clone = el.cloneNode(true);
    clone.querySelectorAll('br').forEach((br) => br.remove());
    const html = clone.outerHTML.trim();
    if (html) table += `<tr><td colspan="2">${html}</td></tr>`;
  });

  // Add empty line after each facet table for better readability
  return `${table}</tbody></table><p></p>`;
}

/** Transform content to table format for DA */
function transformToTableFormat(content) {
  const doc = new DOMParser().parseFromString(`<div>${content}</div>`, 'text/html');
  const container = doc.querySelector('div');
  if (!container?.children.length) return content;

  let output = '';
  let currentHeading = null;
  let sectionContent = [];

  Array.from(container.children).forEach((el) => {
    if (el.tagName === 'H4') {
      if (currentHeading) {
        output += createSectionTable(currentHeading, sectionContent);
        sectionContent = [];
      }
      currentHeading = el;
    } else if (currentHeading && el.textContent.trim()) {
      sectionContent.push(el);
    }
  });

  if (currentHeading) output += createSectionTable(currentHeading, sectionContent);
  return output || content;
}

/** Generate filename with timestamp and date folder */
function generateFilenameAndDate() {
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12 || 12;
  return {
    filename: `optel-analysis-${date}-${hours}-${minutes}${ampm}.html`,
    dateFolder: date,
  };
}

/** Clean URL for folder name */
const cleanUrlForFolder = (url) => (url ? url.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() : 'dashboard');

/** Format timestamp for report footer */
function formatDates(timestamp) {
  return new Date(timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  });
}

function fixExpectedImpactLineBreaks(html) {
  return html.replace(
    /\.(<\/[^>]+>)?\s*Expected Impact:/gi,
    '.$1<br><span class="expected-impact"><em>Expected Impact:</em>',
  ).replace(/<\/em>([^<]*?)(<\/p>|<br>|$)/gi, '</em>$1</span>$2');
}

/** Generate complete HTML report with date range from URL */
async function generateReportHTML(content, url, timestamp) {
  const template = await loadTemplate();
  const formattedTimestamp = formatDates(timestamp);

  let tableContent = transformToTableFormat(content);
  try {
    const originalLength = tableContent.length;
    tableContent = convertSpansToLinks(tableContent);
    if (!tableContent || tableContent.length < originalLength * 0.5) {
      tableContent = transformToTableFormat(content);
    }
  } catch {
    tableContent = transformToTableFormat(content);
  }

  // Ensure "Expected Impact:" always appears on new line
  tableContent = fixExpectedImpactLineBreaks(tableContent);

  let html = template
    .replace(/{{REPORT_TITLE}}/g, `OpTel Analysis - ${url || 'Dashboard'}`)
    .replace(/{{ANALYSIS_CONTENT}}/g, tableContent)
    .replace(/{{GENERATED_TIMESTAMP}}/g, formattedTimestamp);

  // Save view and endDate for consistent fetchPrevious31Days loading
  const urlParams = new URL(window.location.href).searchParams;
  const view = urlParams.get('view') || 'week';
  const endDate = urlParams.get('endDate') || new Date().toISOString().split('T')[0];

  const metaTags = `<meta name="report-view" content="${view}">
  <meta name="report-end-date" content="${endDate}">`;
  html = html.replace('</head>', `${metaTags}\n</head>`);

  return html;
}

/** Upload analysis report to DA storage via Cloudflare Worker */
export async function uploadToDA(content, options = {}) {
  const { url = '', debug = false } = options;
  if (!content?.trim()) throw new Error('No content to upload');

  const timestamp = new Date().toISOString();
  const htmlContent = await generateReportHTML(content, url, timestamp);
  const { filename, dateFolder } = generateFilenameAndDate();
  const folder = cleanUrlForFolder(url);
  const daPath = `/${DA_CONFIG.ORG}/${DA_CONFIG.REPO}/${DA_CONFIG.UPLOAD_PATH}/${folder}/${dateFolder}/${filename}`;

  if (debug) {
    console.log('[DA Upload] Path:', daPath, 'Size:', htmlContent.length);
  }

  const rumToken = localStorage.getItem('rum-bundler-token') || localStorage.getItem('rum-admin-token');
  if (!rumToken) throw new Error('No RUM token found. Please authenticate first.');

  const response = await fetch(DA_CONFIG.WORKER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-RUM-Token': rumToken,
    },
    body: JSON.stringify({ html: htmlContent, path: daPath }),
  });

  const responseData = await response.json();
  if (!response.ok || !responseData.success) {
    throw new Error(responseData.error || `Upload failed: ${response.status}`);
  }

  return {
    success: true,
    path: `${DA_CONFIG.BASE_URL}${daPath}`,
    filename,
    folder,
    responseData,
  };
}

/** Get current analyzed URL from dashboard */
export function getCurrentAnalyzedUrl() {
  return document.querySelector('#url')?.value.trim() || '';
}

/** Map folder items to report objects */
function mapFolderItemsToReports(items, folder, dateFolder, domain = null) {
  return items
    .filter((item) => item.ext === 'html' || item.name?.endsWith('.html'))
    .map((item) => {
      const filename = item.name.endsWith('.html') ? item.name : `${item.name}.html`;
      const report = {
        filename,
        path: `${DA_CONFIG.BASE_URL}/${DA_CONFIG.ORG}/${DA_CONFIG.REPO}/${DA_CONFIG.UPLOAD_PATH}/${folder}/${dateFolder}/${filename}`,
        timestamp: new Date(item.lastModified || item.modified || Date.now()).getTime(),
        date: dateFolder,
      };
      if (domain) report.domain = domain;
      return report;
    });
}

/** List folder contents via CF Worker */
async function listFolder(path) {
  try {
    const res = await fetch(DA_CONFIG.WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'list', path }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.success && data.items ? data.items : [];
  } catch {
    return [];
  }
}

/** Fetch reports from a domain folder (traverses date subfolders) */
async function fetchReportsFromDomainFolder(basePath, folder, domain = null) {
  const items = await listFolder(basePath);
  const dateFolders = items
    .filter((i) => !i.ext && /^\d{4}-\d{2}-\d{2}$/.test(i.name))
    .map((i) => i.name);

  if (!dateFolders.length) return [];

  const results = await Promise.all(dateFolders.map(async (df) => {
    const files = await listFolder(`${basePath}/${df}`);
    return mapFolderItemsToReports(files, folder, df, domain);
  }));
  return results.flat();
}

/** Fetch list of reports from DA storage, optionally filtered by domain */
export async function fetchReportsFromDA(domainFilter = null) {
  try {
    const basePath = `/${DA_CONFIG.ORG}/${DA_CONFIG.REPO}/${DA_CONFIG.UPLOAD_PATH}`;

    if (domainFilter) {
      const folder = cleanUrlForFolder(domainFilter);
      const reports = await fetchReportsFromDomainFolder(`${basePath}/${folder}`, folder, domainFilter);
      return reports.sort((a, b) => b.timestamp - a.timestamp);
    }

    const items = await listFolder(basePath);
    const folders = items.filter((i) => !i.ext && i.name).map((i) => i.name);
    if (!folders.length) return [];

    const results = await Promise.all(
      folders.map((f) => fetchReportsFromDomainFolder(`${basePath}/${f}`, f)),
    );
    return results.flat().sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('[DA Upload] Error fetching reports:', error);
    return [];
  }
}

export default uploadToDA;
