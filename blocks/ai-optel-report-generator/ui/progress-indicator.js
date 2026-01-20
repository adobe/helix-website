/**
 * Progress Indicator - Step-based progress with automatic percentage calculation
 */

const CONFIG = {
  ID: 'circular-progress-container',
  RADIUS: 60,
  CENTER: 70,
  CIRCUMFERENCE: 2 * Math.PI * 60,
  COLORS: { start: '#49cc93', end: '#00653e' },
  INITIAL: { name: 'Initializing...', detail: 'Preparing analysis environment' },
};

let state = {
  totalSteps: 0, currentStep: 0, steps: [], maxProgress: 0,
};

/** Create circular progress indicator element */
export function createCircularProgress() {
  const c = document.createElement('div');
  c.className = 'circular-progress-container';
  c.id = CONFIG.ID;

  c.innerHTML = `
    <div class="circular-progress">
      <svg viewBox="0 0 140 140">
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${CONFIG.COLORS.start}" />
            <stop offset="100%" style="stop-color:${CONFIG.COLORS.end}" />
          </linearGradient>
        </defs>
        <circle class="circular-progress-bg" cx="${CONFIG.CENTER}" cy="${CONFIG.CENTER}" r="${CONFIG.RADIUS}"/>
        <circle class="circular-progress-bar" cx="${CONFIG.CENTER}" cy="${CONFIG.CENTER}" r="${CONFIG.RADIUS}" 
                stroke-dasharray="${CONFIG.CIRCUMFERENCE}" stroke-dashoffset="${CONFIG.CIRCUMFERENCE}"/>
      </svg>
      <div class="circular-progress-text">0%</div>
    </div>
    <div class="progress-status-text">
      <div class="progress-task-name">${CONFIG.INITIAL.name}</div>
      <div class="progress-task-detail">${CONFIG.INITIAL.detail}</div>
    </div>`;

  return c;
}

/** Update progress display */
export function updateCircularProgress(percent, taskName = '', taskDetail = '') {
  const container = document.getElementById(CONFIG.ID);
  if (!container) return;

  const actualPercent = Math.max(percent, state.maxProgress);
  state.maxProgress = actualPercent;

  const bar = container.querySelector('.circular-progress-bar');
  if (bar) bar.style.strokeDashoffset = CONFIG.CIRCUMFERENCE * (1 - actualPercent / 100);

  const text = container.querySelector('.circular-progress-text');
  if (text) text.textContent = `${Math.round(actualPercent)}%`;

  const nameEl = container.querySelector('.progress-task-name');
  const detailEl = container.querySelector('.progress-task-detail');
  if (nameEl && taskName) nameEl.textContent = taskName;
  if (detailEl && taskDetail) detailEl.textContent = taskDetail;
}

/** Initialize step-based progress with step definitions */
export function initializeStepProgress(steps) {
  if (!steps?.length) throw new Error('Steps must be a non-empty array');
  state = {
    totalSteps: steps.length, currentStep: 0, steps: [...steps], maxProgress: 0,
  };
  updateCircularProgress(0, CONFIG.INITIAL.name, CONFIG.INITIAL.detail);
}

/** Advance to next step */
export function advanceStep(options = {}) {
  if (!state.totalSteps || state.currentStep >= state.totalSteps) return;

  state.currentStep += 1;
  const stepInfo = state.steps[state.currentStep - 1] || {};
  const percent = (state.currentStep / state.totalSteps) * 100;

  updateCircularProgress(
    percent,
    options.name || stepInfo.name || `Step ${state.currentStep}`,
    options.detail || stepInfo.detail || `Processing step ${state.currentStep} of ${state.totalSteps}`,
  );
}

/** Jump to specific step */
export function setStep(stepNumber, options = {}) {
  if (!state.totalSteps || stepNumber < 1 || stepNumber > state.totalSteps) return;

  state.currentStep = stepNumber;
  const stepInfo = state.steps[stepNumber - 1] || {};
  const percent = (stepNumber / state.totalSteps) * 100;

  updateCircularProgress(
    percent,
    options.name || stepInfo.name || `Step ${stepNumber}`,
    options.detail || stepInfo.detail || `Processing step ${stepNumber} of ${state.totalSteps}`,
  );
}

/** Get current progress state */
export function getProgressState() {
  const percent = state.totalSteps ? (state.currentStep / state.totalSteps) * 100 : 0;
  return {
    totalSteps: state.totalSteps,
    currentStep: state.currentStep,
    percent,
    isComplete: state.currentStep === state.totalSteps,
  };
}

/** Reset progress to initial state */
export function resetProgress() {
  state = {
    totalSteps: 0, currentStep: 0, steps: [], maxProgress: 0,
  };
  updateCircularProgress(0, CONFIG.INITIAL.name, CONFIG.INITIAL.detail);
}

/** Set progress to specific percentage with message */
export function setProgress(percent, message = '', detail = '') {
  updateCircularProgress(percent, message, detail);
}

/** Complete progress (100%) */
export function completeProgress(message = 'Complete!', detail = 'Report generated successfully') {
  updateCircularProgress(100, message, detail);
}
