/**
 * Progress Indicator Module
 * Handles circular progress bar creation and updates for report generation
 */

// ============================================================================
// CONSTANTS
// ============================================================================

const PROGRESS_CONFIG = {
  CONTAINER_ID: 'circular-progress-container',
  RADIUS: 60,
  CENTER: 70,
  VIEWBOX_SIZE: 140,
  INITIAL_PERCENT: 0,
  GRADIENT_ID: 'progressGradient',
  GRADIENT_START_COLOR: '#28a745',
  GRADIENT_END_COLOR: '#218838',
};

const SELECTORS = {
  CONTAINER: '.circular-progress-container',
  PROGRESS_BAR: '.circular-progress-bar',
  PROGRESS_TEXT: '.circular-progress-text',
  TASK_NAME: '.progress-task-name',
  TASK_DETAIL: '.progress-task-detail',
};

const DEFAULT_MESSAGES = {
  INITIAL_TASK: 'Initializing...',
  INITIAL_DETAIL: 'Preparing analysis environment',
};

const PROGRESS_STAGES = [
  { percent: 20, name: 'Initializing', detail: 'Setting up analysis environment' },
  { percent: 40, name: 'Extracting Data', detail: 'Gathering dashboard metrics and facets' },
  { percent: 60, name: 'Processing Analysis', detail: 'Running AI-powered analysis' },
  { percent: 90, name: 'Finalizing Report', detail: 'Generating insights and recommendations' },
];

const DEFAULT_ANIMATION_INTERVAL = 3000; // 3 seconds

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate circle circumference from radius
 * @param {number} radius
 * @returns {number}
 */
function calculateCircumference(radius) {
  return 2 * Math.PI * radius;
}

/**
 * Calculate stroke dash offset for given progress percentage
 * @param {number} percent - Progress percentage (0-100)
 * @param {number} circumference - Circle circumference
 * @returns {number}
 */
function calculateStrokeDashOffset(percent, circumference) {
  return circumference - (percent / 100) * circumference;
}

/**
 * Create SVG gradient definition
 * @returns {string} SVG gradient HTML
 */
function createSVGGradient() {
  return `
    <defs>
      <linearGradient id="${PROGRESS_CONFIG.GRADIENT_ID}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${PROGRESS_CONFIG.GRADIENT_START_COLOR};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${PROGRESS_CONFIG.GRADIENT_END_COLOR};stop-opacity:1" />
      </linearGradient>
    </defs>
  `;
}

/**
 * Create SVG circles (background and progress bar)
 * @param {number} circumference
 * @returns {string} SVG circles HTML
 */
function createSVGCircles(circumference) {
  const { RADIUS, CENTER } = PROGRESS_CONFIG;
  
  return `
    <circle class="circular-progress-bg" cx="${CENTER}" cy="${CENTER}" r="${RADIUS}"></circle>
    <circle 
      class="circular-progress-bar" 
      cx="${CENTER}" 
      cy="${CENTER}" 
      r="${RADIUS}"
      stroke-dasharray="${circumference}"
      stroke-dashoffset="${circumference}"
    ></circle>
  `;
}

/**
 * Create progress indicator SVG
 * @returns {string} Complete SVG HTML
 */
function createProgressSVG() {
  const circumference = calculateCircumference(PROGRESS_CONFIG.RADIUS);
  
  return `
    <svg viewBox="0 0 ${PROGRESS_CONFIG.VIEWBOX_SIZE} ${PROGRESS_CONFIG.VIEWBOX_SIZE}">
      ${createSVGGradient()}
      ${createSVGCircles(circumference)}
    </svg>
  `;
}

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Create circular progress indicator with SVG
 * @returns {HTMLElement} The progress container element
 */
export function createCircularProgress() {
  const container = document.createElement('div');
  container.className = SELECTORS.CONTAINER.substring(1); // Remove dot
  container.id = PROGRESS_CONFIG.CONTAINER_ID;

  container.innerHTML = `
    <div class="circular-progress">
      ${createProgressSVG()}
      <div class="${SELECTORS.PROGRESS_TEXT.substring(1)}">${PROGRESS_CONFIG.INITIAL_PERCENT}%</div>
    </div>
    <div class="progress-status-text">
      <div class="${SELECTORS.TASK_NAME.substring(1)}">${DEFAULT_MESSAGES.INITIAL_TASK}</div>
      <div class="${SELECTORS.TASK_DETAIL.substring(1)}">${DEFAULT_MESSAGES.INITIAL_DETAIL}</div>
    </div>
  `;

  return container;
}

/**
 * Get DOM elements for progress indicator
 * @param {HTMLElement} container
 * @returns {Object} Object containing all progress elements
 */
function getProgressElements(container) {
  return {
    progressBar: container.querySelector(SELECTORS.PROGRESS_BAR),
    progressText: container.querySelector(SELECTORS.PROGRESS_TEXT),
    taskName: container.querySelector(SELECTORS.TASK_NAME),
    taskDetail: container.querySelector(SELECTORS.TASK_DETAIL),
  };
}

/**
 * Update progress bar visual state
 * @param {HTMLElement} progressBar
 * @param {number} percent
 */
function updateProgressBar(progressBar, percent) {
  if (!progressBar) return;
  
  const circumference = calculateCircumference(PROGRESS_CONFIG.RADIUS);
  const offset = calculateStrokeDashOffset(percent, circumference);
  
  progressBar.style.strokeDashoffset = offset;
}

/**
 * Update progress text percentage
 * @param {HTMLElement} progressText
 * @param {number} percent
 */
function updateProgressText(progressText, percent) {
  if (!progressText) return;
  progressText.textContent = `${Math.round(percent)}%`;
}

/**
 * Update task status text
 * @param {HTMLElement} taskNameElem
 * @param {HTMLElement} taskDetailElem
 * @param {string} taskName
 * @param {string} taskDetail
 */
function updateTaskStatus(taskNameElem, taskDetailElem, taskName, taskDetail) {
  if (taskNameElem && taskName) {
    taskNameElem.textContent = taskName;
  }
  
  if (taskDetailElem && taskDetail) {
    taskDetailElem.textContent = taskDetail;
  }
}

/**
 * Update circular progress bar percentage and status text
 * @param {number} percent - Progress percentage (0-100)
 * @param {string} taskName - Name of the current task
 * @param {string} taskDetail - Detailed description of current task
 */
export function updateCircularProgress(percent, taskName = '', taskDetail = '') {
  const container = document.getElementById(PROGRESS_CONFIG.CONTAINER_ID);
  if (!container) return;

  const elements = getProgressElements(container);
  
  updateProgressBar(elements.progressBar, percent);
  updateProgressText(elements.progressText, percent);
  updateTaskStatus(elements.taskName, elements.taskDetail, taskName, taskDetail);
}

/**
 * Progress stages configuration for report generation
 * @returns {Array} Array of progress stage objects
 */
export function getProgressStages() {
  return [...PROGRESS_STAGES];
}

/**
 * Animate through a single stage
 * @param {Object} stage - Stage object with percent, name, and detail
 */
function animateStage(stage) {
  updateCircularProgress(stage.percent, stage.name, stage.detail);
}

/**
 * Animate progress through predefined stages
 * @param {number} intervalMs - Milliseconds between stage updates (default: 3000ms)
 * @returns {Object} Object containing interval ID for cleanup
 */
export function animateProgressStages(intervalMs = DEFAULT_ANIMATION_INTERVAL) {
  const stages = getProgressStages();
  let stageIndex = 0;

  const intervalId = setInterval(() => {
    if (stageIndex < stages.length) {
      animateStage(stages[stageIndex]);
      stageIndex += 1;
    }
  }, intervalMs);

  return { intervalId, stages };
}

/**
 * Set progress to completion (100%)
 * @param {string} completionMessage - Message to display on completion
 * @param {string} completionDetail - Detailed message on completion
 */
export function completeProgress(
  completionMessage = 'Complete!',
  completionDetail = 'Report generated successfully'
) {
  updateCircularProgress(100, completionMessage, completionDetail);
}

