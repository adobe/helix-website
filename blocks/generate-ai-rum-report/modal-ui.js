/**
 * Modal UI Module
 * Handles modal creation, DOM structure, and UI state management
 */

/**
 * Create modal header
 * @returns {HTMLElement}
 */
function createModalHeader() {
  const header = document.createElement('div');
  header.className = 'report-modal-header';
  header.innerHTML = `
    <h2>Automated Report Generator</h2>
    <button class="report-modal-close" aria-label="Close modal">×</button>
  `;
  return header;
}

/**
 * Create modal body with form
 * @param {boolean} hasApiKey
 * @returns {HTMLElement}
 */
function createModalBody(hasApiKey) {
  const body = document.createElement('div');
  body.className = 'report-modal-body';

  const apiKey = localStorage.getItem('anthropicApiKey') || '';
  const buttonText = hasApiKey ? 'Generate Report' : 'Save Key & Generate';
  const infoText = hasApiKey
    ? 'Your API key is saved. Click "Generate Report" to start the analysis.'
    : 'Enter your Anthropic API key to generate a comprehensive report of your site data.';

  body.innerHTML = `
    <div class="report-form-group">
      <label for="report-api-key">Anthropic API Key (<a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer">Get your key</a>)</label>
      <div class="report-quick-filter">
        <input
          type="password"
          id="report-api-key"
          placeholder="sk-ant-..."
          value="${apiKey}"
          ${hasApiKey ? 'disabled' : ''}
        >
      </div>
    </div>

    <button id="report-generate-btn" class="report-generate-btn">
      ${buttonText}
    </button>

    <div class="report-info">
      <p>${infoText}</p>
    </div>

    <div id="report-status" style="display: none;"></div>
  `;

  return body;
}

/**
 * Create modal structure
 * @param {boolean} hasApiKey - Whether API key already exists
 * @returns {Object} Modal elements
 */
export function createModalStructure(hasApiKey) {
  const overlay = document.createElement('div');
  overlay.className = 'report-modal-overlay';

  const modal = document.createElement('div');
  modal.className = 'report-modal';

  const header = createModalHeader();
  const body = createModalBody(hasApiKey);

  modal.append(header, body);
  overlay.appendChild(modal);

  return { overlay, modal, body };
}

/**
 * Show/hide form elements
 * @param {HTMLElement} modalBody
 * @param {boolean} visible
 */
export function toggleFormVisibility(modalBody, visible) {
  const formGroup = modalBody.querySelector('.report-form-group');
  const infoDiv = modalBody.querySelector('.report-info');

  if (formGroup) formGroup.style.display = visible ? 'block' : 'none';
  if (infoDiv) infoDiv.style.display = visible ? 'block' : 'none';
}

/**
 * Show status message
 * @param {HTMLElement} statusDiv
 * @param {string} type - 'success', 'error', 'loading'
 * @param {string} message
 */
export function showStatus(statusDiv, type, message) {
  statusDiv.className = `report-status ${type}`;
  statusDiv.textContent = message;
  statusDiv.style.display = 'block';
}

/**
 * Create report results UI with file icon
 * @returns {HTMLElement}
 */
export function createReportResultsUI() {
  const resultsSection = document.createElement('div');
  resultsSection.className = 'report-results';

  // Get current date in yyyy-mm-dd format
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];

  resultsSection.innerHTML = `
    <div class="report-file-icon">
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#49cc93" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M14 2V8H20" stroke="#49cc93" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12 18V12" stroke="#49cc93" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M9 15L12 18L15 15" stroke="#49cc93" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <div class="report-meta">
      <div class="report-date">${dateStr}.html</div>
      <div class="report-description">AI-powered analysis of Real User Monitoring (RUM) data to identify performance issues, user experience patterns, and optimization opportunities.</div>
    </div>
    <div class="report-actions">
      <button class="report-action-btn primary" id="save-report-btn">Save Report</button>
    </div>
  `;

  return resultsSection;
}

/**
 * Update button state
 * @param {HTMLElement} button
 * @param {boolean} disabled
 * @param {string} text
 */
export function updateButtonState(button, disabled, text) {
  if (!button) return;
  button.disabled = disabled;
  button.textContent = text;
}
