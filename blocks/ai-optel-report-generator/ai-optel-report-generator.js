/**
 * AI OpTel Report Generator - Main entry point
 */

import { createModalStructure, showStatus } from './ui/modal-ui.js';
import generateReport from './reports/report-generator.js';
import cleanupMetricsParameter from './cleanup-utils.js';
import { STORAGE_KEYS } from './config.js';
import checkRumAdminAccess from './rum-admin-auth.js';

let modalInstance = null;

export function closeReportModal() {
  if (modalInstance) {
    modalInstance.remove();
    modalInstance = null;
    cleanupMetricsParameter();
  }
}

const canCloseModal = (modal) => {
  const hasProgress = modal.querySelector('#circular-progress-container');
  const saveBtn = modal.querySelector('#save-report-btn:not([disabled])');
  return !hasProgress && !saveBtn;
};

function setupCloseHandlers(modal) {
  modal.querySelector('.report-modal-close')?.addEventListener('click', () => {
    if (canCloseModal(modal)) closeReportModal();
  });

  const escHandler = (e) => {
    if (e.key === 'Escape' && canCloseModal(modal)) {
      closeReportModal();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

async function updateProviderName(providerSpan) {
  if (!providerSpan) return;
  const { getProviderName } = await import('./api/api-factory.js');
  providerSpan.textContent = getProviderName();
}

function setupGenerateButton(modal) {
  const generateBtn = modal.querySelector('#report-generate-btn');
  const tokenInput = modal.querySelector('#report-bedrock-token');
  const statusDiv = modal.querySelector('#report-status');
  const providerSpan = modal.querySelector('#provider-name');

  updateProviderName(providerSpan);

  generateBtn?.addEventListener('click', async () => {
    const token = tokenInput?.value.trim() || '';

    if (!token) {
      showStatus(statusDiv, 'error', 'Please enter your AWS Bedrock token');
      return;
    }

    if (!localStorage.getItem(STORAGE_KEYS.BEDROCK_TOKEN)) {
      localStorage.setItem(STORAGE_KEYS.BEDROCK_TOKEN, token);
      if (tokenInput) tokenInput.disabled = true;
      generateBtn.textContent = 'Generate Report';
      updateProviderName(providerSpan);
    }

    await generateReport(statusDiv, generateBtn, modal);
  });
}

function disableForNonAdmin(modal) {
  const btn = modal.querySelector('#report-generate-btn');
  const info = modal.querySelector('.report-info');

  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Generate Report';
  }

  if (info) {
    info.classList.add('warning');
    info.innerHTML = `<p><strong>Access Restricted</strong></p>
      <p>You don't have permission to generate reports. Contact your OpTel administrator.</p>`;
  }
}

export async function openReportModal() {
  if (modalInstance) closeReportModal();

  const hasToken = !!localStorage.getItem(STORAGE_KEYS.BEDROCK_TOKEN);
  const { overlay, modal } = createModalStructure(hasToken);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay && canCloseModal(modal)) closeReportModal();
  });

  document.body.appendChild(overlay);
  modalInstance = overlay;
  setupCloseHandlers(modal);

  const btn = modal.querySelector('#report-generate-btn');
  const info = modal.querySelector('.report-info p');

  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Validating access...';
  }

  const { isAdmin } = await checkRumAdminAccess();

  if (!isAdmin) {
    disableForNonAdmin(modal);
    return overlay;
  }

  if (btn) {
    btn.disabled = false;
    btn.textContent = hasToken ? 'Generate Report' : 'Save Token & Generate';
  }
  if (info) {
    info.textContent = hasToken
      ? 'Your API credentials are saved. Click "Generate Report" to start the analysis.'
      : 'Enter your AWS Bedrock token to generate a comprehensive report.';
  }

  setupGenerateButton(modal);
  return overlay;
}

/* Block initialization */
export default function decorate(block) {
  const button = document.createElement('button');
  button.className = 'open-report-modal-btn';
  button.textContent = 'Generate AI RUM Report';
  button.addEventListener('click', openReportModal);
  block.appendChild(button);
}

window.openReportModal = openReportModal;
