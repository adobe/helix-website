/**
 * Report Generator Module
 * Handles the core report generation logic with RUM analysis
 */

/* eslint-disable no-console */

// Import analysis engine functionality
import runCompleteRumAnalysis from './core/analysis-engine.js';

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
 * Ensure metrics=super parameter is in URL and reload dashboard data
 * @returns {Promise<boolean>} True if parameter was just added
 */
async function ensureMetricsParameter() {
  const currentUrl = new URL(window.location);

  if (!currentUrl.searchParams.has(METRICS_URL_PARAM)
      || currentUrl.searchParams.get(METRICS_URL_PARAM) !== METRICS_URL_VALUE) {
    currentUrl.searchParams.set(METRICS_URL_PARAM, METRICS_URL_VALUE);
    window.history.replaceState({}, '', currentUrl);
    console.log('[OpTel Detective Report] Added metrics=super to URL');

    // Reload dashboard data in background using global draw function
    if (typeof window.slicerDraw === 'function') {
      try {
        await window.slicerDraw();
        console.log('[OpTel Detective Report] Dashboard reloaded with all checkpoints');
        await new Promise((resolve) => {
          setTimeout(resolve, 500);
        });
        return true;
      } catch (error) {
        console.error('[OpTel Detective Report] Error reloading dashboard:', error);
        return false;
      }
    }

    console.warn('[OpTel Detective Report] Dashboard draw function not available');
    return false;
  }

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

  // Create and append results section
  const resultsSection = createReportResultsUI(reportContent);
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
 * @param {string} apiKey - Anthropic API key
 * @param {HTMLElement} statusDiv - Status message container
 * @param {HTMLElement} button - Generate button element
 * @param {HTMLElement} modal - Modal container element
 */
export default async function generateReport(apiKey, statusDiv, button, modal) {
  const originalText = button.textContent;
  updateButtonState(button, true, '⏳ Generating...');

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
    // Map internal batch progress (0-100%) to overall progress (50-87.5%)
    const progressCallback = (step, status, message, batchPercent = 0) => {
      // Map batch progress to 50-87.5% range
      const mappedPercent = 50 + (batchPercent * 0.375); // 0-100 maps to 50-87.5%
      setProgress(
        mappedPercent,
        REPORT_STEPS[2].name, // "Processing Analysis"
        message || REPORT_STEPS[2].detail,
      );
    };

    const analysisResult = await runCompleteRumAnalysis(progressCallback);

    // Step 4: Final synthesis at 87.5-100%
    setProgress(87.5, REPORT_STEPS[3].name, REPORT_STEPS[3].detail);

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
