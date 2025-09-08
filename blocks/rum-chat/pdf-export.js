/* eslint-disable no-console */
/**
 * PDF Export Module for RUM Chat Analysis
 * Handles generation and download of analysis reports as PDF
 */

/**
 * Clean HTML content for PDF display while preserving structure
 * @param {string} htmlContent - Raw HTML content
 * @returns {string} Cleaned content with preserved formatting
 */
function cleanHTMLContent(htmlContent) {
  return htmlContent
    // First, handle block-level elements by adding line breaks
    .replace(/<\/?(h[1-6]|p|div|section|article)[^>]*>/gi, '\n\n') // Headers, paragraphs, divs
    .replace(/<\/?(ul|ol|li)[^>]*>/gi, '\n') // Lists
    .replace(/<br\s*\/?>/gi, '\n') // Line breaks
    .replace(/<\/?(blockquote|pre)[^>]*>/gi, '\n\n') // Quote blocks, preformatted
    .replace(/<hr[^>]*>/gi, '\n---\n') // Horizontal rules

    // Handle inline formatting with text markers
    .replace(/<\/?b[^>]*>/gi, '**') // Bold
    .replace(/<\/?strong[^>]*>/gi, '**') // Strong
    .replace(/<\/?i[^>]*>/gi, '*') // Italic
    .replace(/<\/?em[^>]*>/gi, '*') // Emphasis
    .replace(/<\/?u[^>]*>/gi, '_') // Underline
    .replace(/<\/?code[^>]*>/gi, '`') // Code

    // Handle list items with bullet points
    .replace(/<li[^>]*>/gi, '• ') // List items with bullets
    .replace(/<\/li>/gi, '\n') // End list items

    // Remove all remaining HTML tags
    .replace(/<[^>]*>/g, '')

    // Clean up HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&hellip;/g, '...')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')

    // Clean up excessive whitespace while preserving intentional formatting
    .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive line breaks
    .replace(/[ \t]+/g, ' ') // Multiple spaces/tabs to single space
    .replace(/[ \t]*\n[ \t]*/g, '\n') // Remove spaces around line breaks
    .trim();
}

/**
 * Get CSS styles for print formatting
 * @returns {string} CSS styles
 */
function getPrintStyles() {
  return `
    * {
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background: white;
    }

    .report-container {
      max-width: 100%;
      margin: 0;
      padding: 0;
    }

    .report-header {
      border-bottom: 3px solid #2c5aa0;
      margin-bottom: 30px;
      padding-bottom: 20px;
    }

    .report-header h1 {
      color: #2c5aa0;
      font-size: 28px;
      font-weight: 700;
      margin: 0 0 10px 0;
      line-height: 1.2;
    }

    .timestamp {
      color: #666;
      font-size: 14px;
      margin: 5px 0;
      font-weight: 500;
    }

    .branding {
      color: #888;
      font-size: 12px;
      font-style: italic;
      margin-top: 5px;
    }

    .report-content {
      margin-bottom: 40px;
    }

    .content {
      white-space: pre-wrap;
      line-height: 1.6;
      font-size: 14px;
      color: #333;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    
    /* Style text markers for better readability */
    .content strong,
    .content b {
      font-weight: 700;
    }
    
    .content em,
    .content i {
      font-style: italic;
    }
    
    /* Improve spacing for sections */
    .content h1,
    .content h2,
    .content h3 {
      margin-top: 20px;
      margin-bottom: 10px;
      font-weight: 600;
    }

    .report-footer {
      border-top: 1px solid #ddd;
      padding-top: 15px;
      margin-top: 40px;
    }

    .footer-text {
      font-size: 11px;
      color: #888;
      text-align: center;
      font-style: italic;
    }

    /* Print-specific styles */
    @media print {
      body {
        padding: 20px;
        font-size: 12px;
      }

      .report-container {
        width: 100%;
        max-width: none;
      }

      .report-header h1 {
        font-size: 24px;
      }

      .content {
        font-size: 11px;
        line-height: 1.5;
        word-wrap: break-word;
        overflow-wrap: break-word;
      }
      
      .content h1,
      .content h2,
      .content h3 {
        margin-top: 15px;
        margin-bottom: 8px;
        font-weight: 600;
        page-break-after: avoid;
      }

      .timestamp {
        font-size: 12px;
      }

      .branding {
        font-size: 10px;
      }

      .footer-text {
        font-size: 9px;
      }

      @page {
        margin: 0.75in;
        size: A4;
      }

      /* Prevent page breaks in important sections */
      .report-header {
        page-break-after: avoid;
      }

      /* Ensure good page breaks */
      h1, h2, h3 {
        page-break-after: avoid;
      }
    }

    /* Screen styles for preview */
    @media screen {
      body {
        padding: 40px;
        background: #f5f5f5;
      }

      .report-container {
        max-width: 800px;
        margin: 0 auto;
        background: white;
        padding: 40px;
        box-shadow: 0 0 20px rgba(0,0,0,0.1);
        border-radius: 8px;
      }
    }
  `;
}

/**
 * Get JavaScript for print window functionality
 * @returns {string} JavaScript code
 */
function getPrintScript() {
  return `
    // Auto-trigger print dialog when page loads
    window.onload = function() {
      // Small delay to ensure styles are loaded
      setTimeout(function() {
        try {
          window.print();
        } catch (error) {
          console.error('Print dialog error:', error);
          alert('Print dialog could not be opened. Please use Ctrl+P to print manually.');
        }
      }, 750);
    };

    // Handle print events
    window.onbeforeprint = function() {
      console.log('Print dialog opened');
    };

    window.onafterprint = function() {
      console.log('Print dialog closed');
      // Optional: Close window after printing (uncomment if desired)
      // setTimeout(function() { window.close(); }, 1000);
    };

    // Handle escape key to close window
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        window.close();
      }
    });
  `;
}

/**
 * Generate the HTML content for the print window
 * @param {string} reportTitle - Title for the report
 * @param {string} processedContent - Processed content (text or HTML)
 * @param {string} filename - Filename for the document
 * @param {boolean} preserveHtml - Whether content is HTML or text
 * @returns {string} Complete HTML document
 */
function generatePrintHTML(reportTitle, processedContent, filename, preserveHtml = false) {
  const currentDate = new Date().toLocaleString();

  // For HTML content, use innerHTML directly; for text content, escape and use textContent approach
  const contentHtml = preserveHtml
    ? processedContent
    : processedContent.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return `<!DOCTYPE html>
<html>
<head>
  <title>${filename}</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    ${getPrintStyles()}
  </style>
</head>
<body>
  <div class="report-container">
    <header class="report-header">
      <h1>${reportTitle}</h1>
      <div class="timestamp">Generated on: ${currentDate}</div>
      <div class="branding">OpTel Detective Analysis Report</div>
    </header>
    <main class="report-content">
      <div class="content">${contentHtml}</div>
    </main>
    <footer class="report-footer">
      <div class="footer-text">
        This report was generated by OpTel Detective - Web Performance Analysis Tool
      </div>
    </footer>
  </div>
  <script>
    ${getPrintScript()}
  </script>
</body>
</html>`;
}

/**
 * Set up event handlers for the print window
 * @param {Window} printWindow - The print window object
 * @param {string} originalTitle - Original document title to restore
 * @param {boolean} debug - Enable debug logging
 */
function setupPrintWindowHandlers(printWindow, originalTitle, debug = false) {
  // Restore original title after a delay
  const restoreTitle = () => {
    document.title = originalTitle;
    if (debug) {
      console.log('[PDF Export] Restored original document title:', originalTitle);
    }
  };

  // Set up multiple fallbacks for title restoration
  setTimeout(restoreTitle, 1000);

  // Also restore title when print window closes
  const checkWindowClosed = () => {
    if (printWindow.closed) {
      restoreTitle();
      if (debug) {
        console.log('[PDF Export] Print window closed, title restored');
      }
    } else {
      setTimeout(checkWindowClosed, 500);
    }
  };

  setTimeout(checkWindowClosed, 1000);

  // Handle errors
  printWindow.onerror = (error) => {
    console.error('[PDF Export] Print window error:', error);
    restoreTitle();
  };
}

/**
 * Create and open print window with formatted content
 * @param {string} reportTitle - Title for the report
 * @param {string} filename - Filename for the document
 * @param {string} processedContent - Processed content (text or HTML)
 * @param {boolean} debug - Enable debug logging
 * @param {boolean} preserveHtml - Whether content is HTML or text
 */
function createPrintWindow(
  reportTitle,
  filename,
  processedContent,
  debug = false,
  preserveHtml = false,
) {
  // Store original title and temporarily change it for PDF
  const originalTitle = document.title;

  if (debug) {
    console.log('[PDF Export] Original document title:', originalTitle);
    console.log('[PDF Export] Setting temporary title:', filename);
    console.log('[PDF Export] Content type:', preserveHtml ? 'HTML' : 'Text');
  }

  document.title = filename;

  // Create print window with enhanced styling
  const printWindow = window.open('', '_blank');

  if (!printWindow) {
    throw new Error('Failed to open print window. Please allow popups for this site.');
  }

  const htmlContent = generatePrintHTML(reportTitle, processedContent, filename, preserveHtml);

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.focus();

  // Set up cleanup and error handling
  setupPrintWindowHandlers(printWindow, originalTitle, debug);
}

/**
 * Generate report title and filename based on provided options
 * @param {string} customTitle - Custom title override
 * @param {string} analyzedUrl - URL being analyzed
 * @returns {Object} Object with reportTitle and filename
 */
function generateReportTitle(customTitle, analyzedUrl) {
  let reportTitle;

  if (customTitle) {
    reportTitle = customTitle;
  } else {
    // Try to get URL from dashboard input field as fallback
    const urlInput = document.querySelector('#url');
    const currentUrl = analyzedUrl || (urlInput ? urlInput.value.trim() : '');

    reportTitle = currentUrl
      ? `OpTel analysis report for ${currentUrl}`
      : 'OpTel analysis report';
  }

  // Create filename by replacing spaces with dashes
  const filename = reportTitle.replace(/\s+/g, '-');

  return { reportTitle, filename };
}

/**
 * Sanitize HTML content for PDF display (keeps some HTML tags)
 * @param {string} htmlContent - Raw HTML content
 * @returns {string} Sanitized HTML content
 */
function sanitizeHtmlContent(htmlContent) {
  return htmlContent
    // Remove potentially dangerous tags
    .replace(/<script[^>]*>.*?<\/script>/gis, '')
    .replace(/<style[^>]*>.*?<\/style>/gis, '')
    .replace(/<link[^>]*>/gi, '')
    .replace(/<meta[^>]*>/gi, '')

    // Clean up attributes but keep basic formatting tags
    .replace(/(<[^>]+)\s+(class|id|style|onclick|onload|onerror)="[^"]*"/gi, '$1')
    .replace(/(<[^>]+)\s+(class|id|style|onclick|onload|onerror)='[^']*'/gi, '$1')

    // Ensure proper spacing
    .replace(/>\s+</g, '><')
    .trim();
}

/**
 * Generate and download PDF report from analysis content
 * @param {string} analysisContent - The HTML/text content of the analysis
 * @param {Object} options - Configuration options
 * @param {string} options.title - Custom title for the report
 * @param {string} options.url - URL being analyzed (optional)
 * @param {boolean} options.debug - Enable debug logging
 * @param {boolean} options.preserveHtml - Keep HTML formatting instead of converting to text
 */
export function generatePDFReport(analysisContent, options = {}) {
  const {
    title: customTitle,
    url: analyzedUrl,
    debug = false,
    preserveHtml = false,
  } = options;

  if (debug) {
    console.log('[PDF Export] Starting PDF generation with options:', options);
  }

  if (!analysisContent || !analysisContent.trim()) {
    // eslint-disable-next-line no-alert
    alert('No analysis content available for download.');
    return false;
  }

  try {
    // Generate report title and filename
    const { reportTitle, filename } = generateReportTitle(customTitle, analyzedUrl);

    if (debug) {
      console.log('[PDF Export] Report title:', reportTitle);
      console.log('[PDF Export] Filename:', filename);
    }

    // Process the content based on formatting preference
    const processedContent = preserveHtml
      ? sanitizeHtmlContent(analysisContent)
      : cleanHTMLContent(analysisContent);

    if (debug) {
      console.log('[PDF Export] Content processed, length:', processedContent.length);
      console.log('[PDF Export] Preserve HTML:', preserveHtml);
    }

    // Generate PDF via print window
    createPrintWindow(reportTitle, filename, processedContent, debug, preserveHtml);

    return true;
  } catch (error) {
    console.error('[PDF Export] Error generating PDF:', error);
    // eslint-disable-next-line no-alert
    alert(`Error generating PDF: ${error.message}`);
    return false;
  }
}

/**
 * Simple text file download as fallback
 * @param {string} content - Text content to download
 * @param {string} filename - Filename for download
 */
export function downloadAsText(content, filename = 'rum-analysis.txt') {
  try {
    const cleanContent = typeof content === 'string' ? cleanHTMLContent(content) : String(content);
    const blob = new Blob([cleanContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.txt') ? filename : `${filename}.txt`;

    // Temporarily add to DOM for click
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the URL
    setTimeout(() => URL.revokeObjectURL(url), 100);

    return true;
  } catch (error) {
    console.error('[PDF Export] Text download error:', error);
    return false;
  }
}

// Export default function for backward compatibility
export default generatePDFReport;
