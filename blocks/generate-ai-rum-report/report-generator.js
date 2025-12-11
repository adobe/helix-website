/**
 * Report Generator Module
 * Handles the core report generation logic with RUM analysis
 */

/* eslint-disable no-console */

// Import analysis engine functionality
import runCompleteRumAnalysis from './core/analysis-engine.js';
import { resetCachedFacetTools } from './core/facet-manager.js';

import {
  createCircularProgress,
  initializeStepProgress,
  advanceStep,
  setProgress,
  completeProgress,
} from './progress-indicator.js';

import {
  toggleFormVisibility,
  showStatus,
  createReportResultsUI,
  updateButtonState,
} from './modal-ui.js';

import { setupReportActions } from './report-actions.js';
import { getCurrentAnalyzedUrl } from './da-upload.js';

// Constants
const METRICS_URL_PARAM = 'metrics';
const METRICS_URL_VALUE = 'super';
const RESULTS_DISPLAY_DELAY = 1000;

// Report generation steps (4 steps, advance 3 times to 75%, then 100% = Report Ready)
const REPORT_STEPS = [
  { name: 'Loading Checkpoints', detail: 'Ensuring all metrics are available' },
  { name: 'Extracting Data', detail: 'Gathering dashboard metrics and facets' },
  { name: 'Processing Analysis', detail: 'Running AI-powered analysis' },
  { name: 'Generating Report', detail: 'Creating insights and recommendations' },
];

/**
 * Ensure date params and metrics=super are in URL, then reload dashboard
 * @returns {Promise<boolean>} True if URL was updated
 */
async function ensureMetricsParameter() {
  const url = new URL(window.location);
  let updated = false;

  // Add dates if missing
  if (!url.searchParams.has('startDate') || !url.searchParams.has('endDate')) {
    const view = url.searchParams.get('view') || 'week';
    const end = url.searchParams.get('endDate') ? new Date(url.searchParams.get('endDate')) : new Date();
    const start = new Date(end);
    if (view === 'month') start.setDate(end.getDate() - 31);
    else if (view === 'year') start.setMonth(end.getMonth() - 12);
    else start.setDate(end.getDate() - 7);

    const fmt = (d) => d.toISOString().split('T')[0];
    url.searchParams.set('startDate', fmt(start));
    url.searchParams.set('endDate', fmt(end));
    console.log(`[OpTel Detective Report] Added date range: ${fmt(start)} to ${fmt(end)}`);
    updated = true;
  }

  // Add metrics=super if missing
  if (url.searchParams.get(METRICS_URL_PARAM) !== METRICS_URL_VALUE) {
    url.searchParams.set(METRICS_URL_PARAM, METRICS_URL_VALUE);
    console.log('[OpTel Detective Report] Added metrics=super to URL');
    updated = true;
  }

  if (!updated) return false;

  // Update URL and reload dashboard
  window.history.replaceState({}, '', url);

  if (typeof window.slicerDraw === 'function') {
    try {
      await window.slicerDraw();
      console.log('[OpTel Detective Report] Dashboard reloaded');
      resetCachedFacetTools();
      await new Promise((resolve) => { setTimeout(resolve, 500); });
      return true;
    } catch (e) {
      console.error('[OpTel Detective Report] Error reloading dashboard:', e);
      return false;
    }
  }

  console.warn('[OpTel Detective Report] Dashboard draw function not available');
  return false;
}

/**
 * Show report results with action buttons
 * @param {HTMLElement} modalBody
 * @param {string} reportContent
 */
function showReportResults(modalBody, reportContent) {
  // Remove progress indicator
  const progressContainer = modalBody.querySelector('#circular-progress-container');
  progressContainer?.remove();

  // Get current analyzed URL for report description
  const url = getCurrentAnalyzedUrl();

  // Create and append results section
  const resultsSection = createReportResultsUI(url);
  modalBody.appendChild(resultsSection);

  // Set up action buttons
  setupReportActions(reportContent);
}

/**
 * Handle generation error
 * @param {HTMLElement} modalBody
 * @param {HTMLElement} progressContainer
 * @param {HTMLElement} statusDiv
 * @param {HTMLElement} button
 * @param {string} originalText
 * @param {Error} error
 */
function handleGenerationError(
  modalBody,
  progressContainer,
  statusDiv,
  button,
  originalText,
  error,
) {
  // Clean up progress indicator
  progressContainer?.parentNode?.removeChild(progressContainer);

  // Show form again
  toggleFormVisibility(modalBody, true);

  // Show error status
  showStatus(statusDiv, 'error', `❌ Error: ${error.message}`);
  updateButtonState(button, false, originalText);
}

/**
 * Generate the RUM analysis report
 * @param {string} apiKey - API key (deprecated)
 * @param {HTMLElement} statusDiv - Status message container
 * @param {HTMLElement} button - Generate button element
 * @param {HTMLElement} modal - Modal container element
 */
export default async function generateReport(apiKey, statusDiv, button, modal) {
  const originalText = button.textContent;
  updateButtonState(button, true, 'Generating...');

  // Clear status and add progress indicator
  statusDiv.style.display = 'none';
  const progressContainer = createCircularProgress();
  const modalBody = modal.querySelector('.report-modal-body');
  modalBody.appendChild(progressContainer);

  // Hide the form elements during generation
  toggleFormVisibility(modalBody, false);

  try {
    console.log('[OpTel Detective Report] Starting report generation...');

    // Initialize step-based progress (4 steps, advance 3 times to 75%)
    initializeStepProgress(REPORT_STEPS);

    // Step 1: Check and add metrics parameter if needed, reload data with all checkpoints
    advanceStep(); // 25% - Loading Checkpoints
    await ensureMetricsParameter();

    // Step 2: Extracting Data - show briefly before batch processing
    advanceStep(); // 50% - Extracting Data
    await new Promise((resolve) => { setTimeout(resolve, 300); });

    // Step 3: Processing Analysis with granular progress
    // Map internal progress: step 2 (50-87.5%), step 3 (87.5-100%)
    const progressCallback = (step, status, message, batchPercent = 0) => {
      const isStep3 = step === 3;
      const stepIndex = isStep3 ? 3 : 2;
      const mappedPercent = isStep3
        ? 87.5 + (batchPercent * 0.125) // Final synthesis: 87.5-100%
        : 50 + (batchPercent * 0.375); // Parallel processing: 50-87.5%

      setProgress(
        mappedPercent,
        REPORT_STEPS[stepIndex].name,
        message || REPORT_STEPS[stepIndex].detail,
      );
    };

    const analysisResult = await runCompleteRumAnalysis(progressCallback);

    // Final step: 100% with "Report Ready" message
    completeProgress('Report Ready', 'Analysis complete, report generated successfully');

    // Wait a moment then show results
    setTimeout(() => {
      showReportResults(modalBody, analysisResult);
      // Keep button disabled after successful generation
      updateButtonState(button, true, 'Report Generated Successfully!');
    }, RESULTS_DISPLAY_DELAY);

    console.log('[OpTel Detective Report] Report generation completed successfully');
  } catch (error) {
    console.error('[OpTel Detective Report] Error:', error);
    handleGenerationError(modalBody, progressContainer, statusDiv, button, originalText, error);
  }
}
