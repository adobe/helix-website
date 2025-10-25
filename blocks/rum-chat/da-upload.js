/* eslint-disable no-console */
/**
 * DA Upload Module for RUM Chat Analysis
 * Handles uploading analysis reports to Dark Alley (DA)
 */

// Cache for the HTML template
let reportTemplateCache = null;

/**
 * Load the HTML report template
 * @returns {Promise<string>} HTML template content
 */
async function loadReportTemplate() {
  if (reportTemplateCache) {
    return reportTemplateCache;
  }

  try {
    const response = await fetch('/blocks/rum-chat/report-template.html');
    if (!response.ok) {
      throw new Error(`Failed to load template: ${response.status}`);
    }
    reportTemplateCache = await response.text();
    return reportTemplateCache;
  } catch (error) {
    console.error('[DA Upload] Error loading template:', error);
    // Return a basic fallback template
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
}

/**
 * Generate HTML document with analysis results using the template
 * @param {string} analysisContent - The HTML content of the analysis
 * @param {string} currentUrl - URL being analyzed
 * @param {string} timestamp - ISO timestamp
 * @param {boolean} isDeepMode - Whether deep analysis mode was used
 * @returns {Promise<string>} Complete HTML document
 */
async function generateReportHTML(analysisContent, currentUrl, timestamp, isDeepMode) {
  // Load the template
  const template = await loadReportTemplate();
  
  // Generate a unique report ID
  const reportId = `RPT-${Date.now().toString(36).toUpperCase()}`;
  
  // Format dates
  const generatedDate = new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  const generatedTimestamp = new Date(timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  });
  
  // Replace placeholders in the template
  const populatedHtml = template
    .replace(/{{REPORT_TITLE}}/g, `OpTel Analysis - ${currentUrl || 'Dashboard'}`)
    .replace(/{{ANALYZED_URL}}/g, currentUrl || 'Dashboard')
    .replace(/{{GENERATED_DATE}}/g, generatedDate)
    .replace(/{{ANALYSIS_MODE}}/g, isDeepMode ? 'Deep Analysis' : 'Standard Analysis')
    .replace(/{{REPORT_ID}}/g, reportId)
    .replace(/{{ANALYSIS_CONTENT}}/g, analysisContent)
    .replace(/{{GENERATED_TIMESTAMP}}/g, generatedTimestamp);
  
  return populatedHtml;
}

/**
 * Generate filename for the report
 * @param {string} currentUrl - URL being analyzed
 * @returns {string} Filename for the report
 */
function generateFilename(currentUrl) {
  const timestamp = new Date().toISOString().split('T')[0];
  const urlPart = currentUrl
    ? currentUrl.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()
    : 'dashboard';
  return `optel-analysis-${urlPart}-${timestamp}.html`;
}

/**
 * Upload analysis report to DA
 * @param {string} analysisContent - The HTML content of the analysis
 * @param {Object} options - Upload options
 * @param {string} options.url - URL being analyzed (optional)
 * @param {boolean} options.debug - Enable debug logging
 * @returns {Promise<Object>} Upload result with success status and message
 */
export async function uploadToDA(analysisContent, options = {}) {
  const {
    url: currentUrl,
    debug = false,
  } = options;

  if (debug) {
    console.log('[DA Upload] Starting upload with options:', options);
  }

  if (!analysisContent || !analysisContent.trim()) {
    throw new Error('No analysis content available to upload');
  }

  try {
    // Hardcoded DA context (no SDK needed)
    const org = 'asthabh23';
    const repo = 'da-demo';

    if (debug) {
      console.log('[DA Upload] Using DA context:', { org, repo });
    }

    // Get analysis mode from localStorage
    const isDeepMode = localStorage.getItem('rumChatDeepMode') === 'true';

    // Generate HTML document using the template
    const timestamp = new Date().toISOString();
    
    if (debug) {
      console.log('[DA Upload] Generating HTML report...');
    }
    
    const htmlContent = await generateReportHTML(analysisContent, currentUrl, timestamp, isDeepMode);

    if (debug) {
      console.log('[DA Upload] Generated HTML document, length:', htmlContent.length);
    }

    // Create blob and form data
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const body = new FormData();
    body.append('data', blob);

    if (debug) {
      console.log('[DA Upload] Created blob, size:', blob.size, 'bytes');
    }

    // Generate filename
    const filename = generateFilename(currentUrl);

    if (debug) {
      console.log('[DA Upload] Filename:', filename);
    }

    // Upload to DA (no authentication required)
    const opts = {
      method: 'POST',
      body,
    };

    const fullpath = `https://admin.da.live/source/${org}/${repo}/drafts/optel-reports/${filename}`;

    if (debug) {
      console.log('[DA Upload] Upload configuration:');
      console.log('[DA Upload] - Target:', fullpath);
      console.log('[DA Upload] - Method:', opts.method);
      console.log('[DA Upload] Starting fetch...');
    }

    const resp = await fetch(fullpath, opts);

    if (debug) {
      console.log('[DA Upload] Fetch completed');
      console.log('[DA Upload] Response status:', resp.status);
      console.log('[DA Upload] Response statusText:', resp.statusText);
    }

    if (resp.ok) {
      const result = {
        success: true,
        path: `/drafts/optel-reports/${filename}`,
        fullpath,
        filename,
      };

      if (debug) {
        console.log('[DA Upload] Upload successful:', result);
      }

      return result;
    }

    // Upload failed - get more details
    let errorMessage = `Upload failed with status: ${resp.status} ${resp.statusText}`;
    try {
      const errorText = await resp.text();
      if (errorText) {
        errorMessage += `\nDetails: ${errorText}`;
      }
    } catch (e) {
      // Ignore if we can't read the error response
    }

    if (debug) {
      console.error('[DA Upload] Upload failed:', errorMessage);
    }

    throw new Error(errorMessage);
  } catch (error) {
    console.error('[DA Upload] Error:', error);
    throw error;
  }
}

/**
 * Get the URL being analyzed from the dashboard
 * @returns {string} Current URL or empty string
 */
export function getCurrentAnalyzedUrl() {
  const urlInput = document.querySelector('#url');
  return urlInput ? urlInput.value.trim() : '';
}

/**
 * Generate a formatted HTML report (for preview or download)
 * @param {string} analysisContent - The HTML content of the analysis
 * @param {Object} options - Report options
 * @param {string} options.url - URL being analyzed (optional)
 * @returns {Promise<string>} Complete HTML document
 */
export async function generateFormattedReport(analysisContent, options = {}) {
  const { url: currentUrl } = options;
  const isDeepMode = localStorage.getItem('rumChatDeepMode') === 'true';
  const timestamp = new Date().toISOString();
  
  return generateReportHTML(analysisContent, currentUrl, timestamp, isDeepMode);
}

// Export default function for backward compatibility
export default uploadToDA;

