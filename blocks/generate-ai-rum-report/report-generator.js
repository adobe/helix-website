/**
 * Report Generator Module
 * Handles the core report generation logic with RUM analysis
 */

// Import analysis engine functionality
import { runCompleteRumAnalysis } from './core/analysis-engine.js';

import {
  createCircularProgress,
  updateCircularProgress,
  animateProgressStages,
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
const PROGRESS_INTERVAL = 3000;

/**
 * Generate the RUM analysis report
 * @param {string} apiKey - Anthropic API key
 * @param {HTMLElement} statusDiv - Status message container
 * @param {HTMLElement} button - Generate button element
 * @param {HTMLElement} modal - Modal container element
 */
export async function generateReport(apiKey, statusDiv, button, modal) {
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

    // Check and add metrics parameter if needed, reload data with all checkpoints
    const metricsAdded = await ensureMetricsParameter();

    // Track progress through the analysis phases
    const { intervalId: progressInterval } = animateProgressStages(PROGRESS_INTERVAL);

    // Create progress callback for analysis engine
    // Start from 30% if we just loaded metrics, otherwise from 0%
    const baseProgress = metricsAdded ? 30 : 0;
    const progressCallback = (step, status, message, percent) => {
      const adjustedPercent = percent ? Math.min(baseProgress + percent * 0.7, 100) : (baseProgress + step * 17);
      updateCircularProgress(adjustedPercent, message, status);
    };

    // Run the actual RUM analysis
    const analysisResult = await runCompleteRumAnalysis(progressCallback);

    // Complete progress
    clearInterval(progressInterval);
    completeProgress();

    // Wait a moment then show results
    setTimeout(() => {
      showReportResults(modalBody, analysisResult);
      // Keep button disabled after successful generation
      updateButtonState(button, true, '✅ Report Generated');
    }, RESULTS_DISPLAY_DELAY);

    console.log('[OpTel Detective Report] Report generation completed successfully');
  } catch (error) {
    console.error('[OpTel Detective Report] Error:', error);
    handleGenerationError(modalBody, progressContainer, statusDiv, button, originalText, error);
  }
}

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
      updateCircularProgress(15, 'Loading all checkpoints...', 'Refreshing dashboard with comprehensive metrics');
      try {
        await window.slicerDraw();
        console.log('[OpTel Detective Report] Dashboard reloaded with all checkpoints');
        updateCircularProgress(25, 'All checkpoints loaded', 'Dashboard ready for comprehensive analysis');
        await new Promise(resolve => setTimeout(resolve, 500));
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
function handleGenerationError(modalBody, progressContainer, statusDiv, button, originalText, error) {
  // Clean up progress indicator
  progressContainer?.parentNode?.removeChild(progressContainer);
  
  // Show form again
  toggleFormVisibility(modalBody, true);
  
  // Show error status
  showStatus(statusDiv, 'error', `❌ Error: ${error.message}`);
  updateButtonState(button, false, originalText);
}

