/**
 * Report Generator Module - Handles core report generation logic with OpTel analysis
 */

import runCompleteRumAnalysis from '../core/analysis-engine.js';
import { resetCachedFacetTools } from '../core/facet-manager.js';
import {
  createCircularProgress,
  initializeStepProgress,
  advanceStep,
  setProgress,
  completeProgress,
} from '../ui/progress-indicator.js';
import {
  toggleFormVisibility,
  showStatus,
  createReportResultsUI,
  updateButtonState,
} from '../ui/modal-ui.js';
import { setupReportActions } from './report-actions.js';
import { getCurrentAnalyzedUrl } from './da-upload.js';

const RESULTS_DISPLAY_DELAY = 1000;
const REPORT_STEPS = [
  { name: 'Loading Checkpoints', detail: 'Ensuring all metrics are available' },
  { name: 'Extracting Data', detail: 'Gathering dashboard metrics and facets' },
  { name: 'Processing Analysis', detail: 'Running AI-powered analysis' },
  { name: 'Generating Report', detail: 'Creating insights and recommendations' },
];

/** Set only endDate (no startDate) to use fetchPrevious31Days with locked date */
function setEndDateOnly() {
  const url = new URL(window.location);
  // Remove startDate so fetchPrevious31Days is used instead of fetchPeriod
  url.searchParams.delete('startDate');
  // Set endDate to today if not already set
  if (!url.searchParams.has('endDate')) {
    url.searchParams.set('endDate', new Date().toISOString().split('T')[0]);
  }
  window.history.replaceState({}, '', url);
}

/** Ensure metrics=super is set for checkpoint data extraction */
async function ensureMetricsSuper() {
  const url = new URL(window.location);
  if (url.searchParams.get('metrics') === 'super') return;

  url.searchParams.set('metrics', 'super');
  window.history.replaceState({}, '', url);

  if (typeof window.slicerDraw === 'function') {
    await window.slicerDraw();
    resetCachedFacetTools();
    await new Promise((r) => { setTimeout(r, 500); });
  }
}

/** Show report results with action buttons */
function showReportResults(modalBody, reportContent) {
  modalBody.querySelector('#circular-progress-container')?.remove();
  const resultsSection = createReportResultsUI(getCurrentAnalyzedUrl());
  modalBody.appendChild(resultsSection);
  setupReportActions(reportContent);
}

/** Handle generation error */
function handleGenerationError(body, progress, status, btn, origText, err) {
  progress?.remove();
  toggleFormVisibility(body, true);

  const isAuth = err.isAuthError;
  const isFatal = err.isFatalError;

  if (isAuth) {
    localStorage.removeItem('awsBedrockToken');
    const tokenInput = body.querySelector('#report-bedrock-token');
    if (tokenInput) {
      tokenInput.disabled = false;
      tokenInput.value = '';
      tokenInput.style.borderColor = '#ff4444';
      tokenInput.focus();
    }
    const infoBox = body.querySelector('.report-info');
    if (infoBox) infoBox.style.display = 'none';
  }

  // Display error message with appropriate context
  let errorMessage;
  if (isAuth) {
    errorMessage = err.message;
  } else if (isFatal) {
    errorMessage = err.message; // Already includes "Bedrock API error: 503..."
  } else {
    errorMessage = `Error: ${err.message}`;
  }

  showStatus(status, 'error', errorMessage);
  updateButtonState(btn, false, isAuth ? 'Save Token & Generate' : origText);
}

/** Generate the RUM analysis report */
export default async function generateReport(statusDiv, button, modal) {
  const originalText = button.textContent;
  updateButtonState(button, true, 'Generating...');

  statusDiv.style.display = 'none';
  const progressContainer = createCircularProgress();
  const modalBody = modal.querySelector('.report-modal-body');
  modalBody.appendChild(progressContainer);
  toggleFormVisibility(modalBody, false);

  try {
    initializeStepProgress(REPORT_STEPS);

    // Set only endDate to use fetchPrevious31Days with locked date
    setEndDateOnly();

    advanceStep(); // 25% - Loading Checkpoints
    await ensureMetricsSuper();

    advanceStep(); // 50% - Extracting Data
    await new Promise((r) => { setTimeout(r, 300); });

    const progressCallback = (step, status, message, batchPercent = 0) => {
      const isStep3 = step === 3;
      const stepIndex = isStep3 ? 3 : 2;
      const pct = isStep3 ? 87.5 + (batchPercent * 0.125) : 50 + (batchPercent * 0.375);
      const detail = message || REPORT_STEPS[stepIndex].detail;
      setProgress(pct, REPORT_STEPS[stepIndex].name, detail);
    };

    const analysisResult = await runCompleteRumAnalysis(progressCallback);
    completeProgress('Report Ready', 'Analysis complete');

    // Restore dashboard to original state (remove metrics=super and checkpoints)
    const url = new URL(window.location);
    ['metrics', 'checkpoint', ...Array.from(url.searchParams.keys()).filter((k) => k.includes('.'))]
      .forEach((k) => url.searchParams.delete(k));
    window.history.replaceState({}, '', url);
    if (typeof window.slicerDraw === 'function') await window.slicerDraw();

    setTimeout(() => {
      showReportResults(modalBody, analysisResult);
      updateButtonState(button, true, 'Report Generated Successfully!');
    }, RESULTS_DISPLAY_DELAY);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[Report Generator] Error:', error);
    handleGenerationError(modalBody, progressContainer, statusDiv, button, originalText, error);
  }
}
