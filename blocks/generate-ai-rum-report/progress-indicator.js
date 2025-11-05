/**
 * Progress Indicator Module
 * Step-based progress tracking that automatically divides progress equally among steps.
 * 
 * @example
 * // Initialize with 4 steps (each = 25%)
 * initializeStepProgress([
 *   { name: 'Fetching', detail: 'Getting data' },
 *   { name: 'Processing', detail: 'Analyzing' },
 *   { name: 'Generating', detail: 'Creating report' },
 *   { name: 'Finalizing', detail: 'Done' }
 * ]);
 * 
 * advanceStep(); // 25%
 * advanceStep(); // 50%
 * advanceStep(); // 75%
 * advanceStep(); // 100%
 */

// Configuration
const CONFIG = {
  CONTAINER_ID: 'circular-progress-container',
  RADIUS: 60,
  CENTER: 70,
  VIEWBOX: 140,
  GRADIENT_ID: 'progressGradient',
  COLOR_START: '#49cc93',
  COLOR_END: '#00653e',
  INITIAL_MSG: { name: 'Initializing...', detail: 'Preparing analysis environment' },
};

// Global state
let state = { totalSteps: 0, currentStep: 0, steps: [] };

/**
 * Create circular progress indicator
 * @returns {HTMLElement}
 */
export function createCircularProgress() {
  const circumference = 2 * Math.PI * CONFIG.RADIUS;
  const container = document.createElement('div');
  container.className = 'circular-progress-container';
  container.id = CONFIG.CONTAINER_ID;

  container.innerHTML = `
    <div class="circular-progress">
      <svg viewBox="0 0 ${CONFIG.VIEWBOX} ${CONFIG.VIEWBOX}">
        <defs>
          <linearGradient id="${CONFIG.GRADIENT_ID}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${CONFIG.COLOR_START};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${CONFIG.COLOR_END};stop-opacity:1" />
          </linearGradient>
        </defs>
        <circle class="circular-progress-bg" cx="${CONFIG.CENTER}" cy="${CONFIG.CENTER}" r="${CONFIG.RADIUS}"></circle>
        <circle class="circular-progress-bar" cx="${CONFIG.CENTER}" cy="${CONFIG.CENTER}" r="${CONFIG.RADIUS}" 
                stroke-dasharray="${circumference}" stroke-dashoffset="${circumference}"></circle>
      </svg>
      <div class="circular-progress-text">0%</div>
    </div>
    <div class="progress-status-text">
      <div class="progress-task-name">${CONFIG.INITIAL_MSG.name}</div>
      <div class="progress-task-detail">${CONFIG.INITIAL_MSG.detail}</div>
    </div>
  `;

  return container;
}

/**
 * Update progress display
 * @param {number} percent - Progress 0-100
 * @param {string} taskName - Task name
 * @param {string} taskDetail - Task detail
 */
export function updateCircularProgress(percent, taskName = '', taskDetail = '') {
  const container = document.getElementById(CONFIG.CONTAINER_ID);
  if (!container) return;

  const progressBar = container.querySelector('.circular-progress-bar');
  const progressText = container.querySelector('.circular-progress-text');
  const taskNameElem = container.querySelector('.progress-task-name');
  const taskDetailElem = container.querySelector('.progress-task-detail');

  if (progressBar) {
    const circumference = 2 * Math.PI * CONFIG.RADIUS;
    const offset = circumference - (percent / 100) * circumference;
    progressBar.style.strokeDashoffset = offset;
  }

  if (progressText) progressText.textContent = `${Math.round(percent)}%`;
  if (taskNameElem && taskName) taskNameElem.textContent = taskName;
  if (taskDetailElem && taskDetail) taskDetailElem.textContent = taskDetail;
}

/**
 * Initialize step-based progress
 * @param {Array<{name: string, detail: string}>} steps - Steps array
 */
export function initializeStepProgress(steps) {
  if (!Array.isArray(steps) || steps.length === 0) {
    throw new Error('Steps must be a non-empty array');
  }

  state = { totalSteps: steps.length, currentStep: 0, steps: [...steps] };
  updateCircularProgress(0, CONFIG.INITIAL_MSG.name, CONFIG.INITIAL_MSG.detail);
}

/**
 * Advance to next step
 * @param {{name?: string, detail?: string}} options - Override step info
 */
export function advanceStep(options = {}) {
  if (state.totalSteps === 0) {
    // eslint-disable-next-line no-console
    console.warn('Progress not initialized. Call initializeStepProgress() first.');
    return;
  }

  if (state.currentStep >= state.totalSteps) {
    // eslint-disable-next-line no-console
    console.warn('Already at final step');
    return;
  }

  state.currentStep += 1;
  const percent = (state.currentStep / state.totalSteps) * 100;
  const stepInfo = state.steps[state.currentStep - 1] || {};
  const name = options.name || stepInfo.name || `Step ${state.currentStep}`;
  const detail = options.detail || stepInfo.detail || `Processing step ${state.currentStep} of ${state.totalSteps}`;

  updateCircularProgress(percent, name, detail);
}

/**
 * Jump to specific step
 * @param {number} stepNumber - Step number (1-based)
 * @param {{name?: string, detail?: string}} options - Override step info
 */
export function setStep(stepNumber, options = {}) {
  if (state.totalSteps === 0) {
    // eslint-disable-next-line no-console
    console.warn('Progress not initialized. Call initializeStepProgress() first.');
    return;
  }

  if (stepNumber < 1 || stepNumber > state.totalSteps) {
    // eslint-disable-next-line no-console
    console.warn(`Step number must be between 1 and ${state.totalSteps}`);
    return;
  }

  state.currentStep = stepNumber;
  const percent = (stepNumber / state.totalSteps) * 100;
  const stepInfo = state.steps[stepNumber - 1] || {};
  const name = options.name || stepInfo.name || `Step ${stepNumber}`;
  const detail = options.detail || stepInfo.detail || `Processing step ${stepNumber} of ${state.totalSteps}`;

  updateCircularProgress(percent, name, detail);
}

/**
 * Get current progress state
 * @returns {{totalSteps: number, currentStep: number, percent: number, isComplete: boolean}}
 */
export function getProgressState() {
  const percent = state.totalSteps > 0 ? (state.currentStep / state.totalSteps) * 100 : 0;
  return {
    totalSteps: state.totalSteps,
    currentStep: state.currentStep,
    percent,
    isComplete: state.currentStep === state.totalSteps,
  };
}

/**
 * Reset progress state
 */
export function resetProgress() {
  state = { totalSteps: 0, currentStep: 0, steps: [] };
  updateCircularProgress(0, CONFIG.INITIAL_MSG.name, CONFIG.INITIAL_MSG.detail);
}

/**
 * Complete progress (100%)
 * @param {string} message - Completion message
 * @param {string} detail - Completion detail
 */
export function completeProgress(message = 'Complete!', detail = 'Report generated successfully') {
  updateCircularProgress(100, message, detail);
}
