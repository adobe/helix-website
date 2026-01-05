/**
 * Modal UI - Creation, structure, and state management
 */

const STORAGE_KEY = 'awsBedrockToken';

function createModalHeader() {
  const header = document.createElement('div');
  header.className = 'report-modal-header';
  header.innerHTML = `<h2>Automated Report Generator</h2>
    <button class="report-modal-close" aria-label="Close modal">×</button>`;
  return header;
}

function createModalBody() {
  const body = document.createElement('div');
  body.className = 'report-modal-body';

  const token = localStorage.getItem(STORAGE_KEY) || '';
  const hasToken = !!token;

  body.innerHTML = `
    <div class="report-form-group">
      <label for="report-bedrock-token">Enter your AWS Bedrock Token</label>
      <div class="report-quick-filter">
        <input type="password" id="report-bedrock-token" placeholder="AWS Bearer Token..."
          value="${token}" ${hasToken ? 'disabled' : ''}>
      </div>
    </div>
    <button id="report-generate-btn" class="report-generate-btn">
      ${hasToken ? 'Generate Report' : 'Save Token & Generate'}
    </button>
    <div class="report-info">
      <p>${hasToken
    ? 'Your API credentials are saved. Click "Generate Report" to start the analysis.'
    : 'Enter your AWS Bedrock token to generate a comprehensive report of your site data.'}</p>
      ${hasToken ? '<p style="font-size: 12px; opacity: 0.8;">Provider: <span id="provider-name">Checking...</span></p>' : ''}
    </div>
    <div id="report-status" style="display: none;"></div>`;

  return body;
}

export function createModalStructure() {
  const overlay = document.createElement('div');
  overlay.className = 'report-modal-overlay';

  const modal = document.createElement('div');
  modal.className = 'report-modal';
  modal.append(createModalHeader(), createModalBody());
  overlay.appendChild(modal);

  return { overlay, modal, body: modal.querySelector('.report-modal-body') };
}

export function toggleFormVisibility(modalBody, visible) {
  const display = visible ? 'block' : 'none';
  modalBody.querySelector('.report-form-group')?.style.setProperty('display', display);
  modalBody.querySelector('.report-info')?.style.setProperty('display', display);
}

export function showStatus(statusDiv, type, message) {
  Object.assign(statusDiv, { className: `report-status ${type}`, textContent: message });
  statusDiv.style.display = 'block';
}

export function createReportResultsUI(url = '') {
  const section = document.createElement('div');
  section.className = 'report-results';
  const dateStr = new Date().toISOString().split('T')[0];
  const domain = url || 'your site';

  section.innerHTML = `
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
      <div class="report-description">AI-powered analysis of Operational Telemetry data for <strong>${domain}</strong> website to identify performance issues, user experience patterns, and optimization opportunities.</div>
    </div>
    <div class="report-actions">
      <button class="report-action-btn primary" id="save-report-btn">Save Report</button>
    </div>`;

  return section;
}

export function updateButtonState(button, disabled, text) {
  if (button) Object.assign(button, { disabled, textContent: text });
}
