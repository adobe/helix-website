/**
 * Report Generator Module - Handles core report generation logic with OpTel analysis
 */

/* eslint-disable no-console */

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

/** Get actual dates from daterange picker input */
function getPickerDates() {
  const picker = document.querySelector('daterange-picker');
  const input = picker?.shadowRoot?.querySelector('input');
  if (!input?.value) return null;

  // Parse format like "Dec 31, 2025 - Jan 7, 2026" or "2025-12-31 - 2026-01-07"
  const parts = input.value.split(/\s*[-–]\s*/);
  if (parts.length !== 2) return null;

  const parseDate = (str) => {
    const d = new Date(str);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const start = parseDate(parts[0]);
  const end = parseDate(parts[1]);
  return start && end ? { start, end } : null;
}

/** Ensure date params and metrics=super are in URL, reload dashboard if needed */
async function ensureMetricsParameter() {
  const url = new URL(window.location);
  let updated = false;
  const currentView = url.searchParams.get('view') || 'week';

  // Get dates - prefer picker values, then URL, then calculate
  if (!url.searchParams.has('startDate') || !url.searchParams.has('endDate')) {
    const pickerDates = getPickerDates();
    const fmt = (d) => d.toISOString().split('T')[0];

    if (pickerDates) {
      // Use actual dates from picker
      url.searchParams.set('startDate', fmt(pickerDates.start));
      url.searchParams.set('endDate', fmt(pickerDates.end));
      console.log(`[Report Generator] Using picker dates: ${fmt(pickerDates.start)} to ${fmt(pickerDates.end)}`);
    } else {
      // Calculate based on view
      const end = new Date();
      const start = new Date(end);
      if (currentView === 'month') start.setDate(end.getDate() - 31);
      else if (currentView === 'year') start.setMonth(end.getMonth() - 12);
      else start.setDate(end.getDate() - 7);

      url.searchParams.set('startDate', fmt(start));
      url.searchParams.set('endDate', fmt(end));
      console.log(`[Report Generator] Calculated dates for ${currentView}: ${fmt(start)} to ${fmt(end)}`);
    }
    updated = true;
  }

  if (url.searchParams.get('metrics') !== 'super') {
    url.searchParams.set('metrics', 'super');
    console.log('[Report Generator] Added metrics=super to URL');
    updated = true;
  }

  // Keep original view (don't force custom) - this ensures consistent metrics
  console.log(`[Report Generator] Keeping view=${currentView}`);

  if (!updated) return false;

  window.history.replaceState({}, '', url);

  if (typeof window.slicerDraw === 'function') {
    try {
      await window.slicerDraw();
      resetCachedFacetTools();
      await new Promise((r) => { setTimeout(r, 500); });
      return true;
    } catch (e) {
      console.error('[Report Generator] Error reloading dashboard:', e);
      return false;
    }
  }
  return false;
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

  showStatus(status, 'error', isAuth ? err.message : `Error: ${err.message}`);
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
    console.log('[Report Generator] Starting...');
    initializeStepProgress(REPORT_STEPS);

    advanceStep(); // 25% - Loading Checkpoints
    await ensureMetricsParameter();

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

    setTimeout(() => {
      showReportResults(modalBody, analysisResult);
      updateButtonState(button, true, 'Report Generated Successfully!');
    }, RESULTS_DISPLAY_DELAY);

    console.log('[Report Generator] Completed');
  } catch (error) {
    console.error('[Report Generator] Error:', error);
    handleGenerationError(modalBody, progressContainer, statusDiv, button, originalText, error);
  }
}
