/**
 * Generate AI RUM Report Modal
 * Main entry point for the report generation modal
 */

import { createModalStructure, showStatus } from './modal-ui.js';
import generateReport from './report-generator.js';
import cleanupMetricsParameter from './cleanup-utils.js';
import { STORAGE_KEYS } from './config.js';
import checkRumAdminAccess from './rum-admin-auth.js';

let modalInstance = null;

/**
 * Close and remove the modal
 */
export function closeReportModal() {
  if (modalInstance) {
    modalInstance.remove();
    modalInstance = null;
    cleanupMetricsParameter();
  }
}

/**
 * Check if modal can be closed (not during active generation)
 */
function canCloseModal(modal) {
  // Only block closing when report generation is actively in progress
  return !modal.querySelector('#circular-progress-container');
}

/**
 * Set up modal close handlers
 */
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

/**
 * Set up generate button handler
 */
function setupGenerateButton(modal) {
  const generateBtn = modal.querySelector('#report-generate-btn');
  const tokenInput = modal.querySelector('#report-bedrock-token');
  const statusDiv = modal.querySelector('#report-status');
  const providerSpan = modal.querySelector('#provider-name');

  // Update provider name
  if (providerSpan) {
    import('./api/api-factory.js').then(({ getProviderName }) => {
      providerSpan.textContent = getProviderName();
    });
  }

  generateBtn?.addEventListener('click', async () => {
    const token = tokenInput?.value.trim() || '';

    if (!token) {
      showStatus(statusDiv, 'error', '❌ Please enter your AWS Bedrock token');
      return;
    }

    // Save token if new
    if (!localStorage.getItem(STORAGE_KEYS.BEDROCK_TOKEN)) {
      localStorage.setItem(STORAGE_KEYS.BEDROCK_TOKEN, token);
      if (tokenInput) tokenInput.disabled = true;
      generateBtn.textContent = '📊 Generate Report';
      if (providerSpan) {
        import('./api/api-factory.js').then(({ getProviderName }) => {
          providerSpan.textContent = getProviderName();
        });
      }
    }

    await generateReport(null, statusDiv, generateBtn, modal);
  });
}

/**
 * Disable generate button for non-admin users
 */
function disableForNonAdmin(modal) {
  const btn = modal.querySelector('#report-generate-btn');
  const info = modal.querySelector('.report-info');

  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Generate Report';
    Object.assign(btn.style, { opacity: '0.5', cursor: 'not-allowed' });
  }

  if (info) {
    // Style as warning (yellow background)
    Object.assign(info.style, {
      backgroundColor: '#fff8e6',
      borderLeft: '3px solid #f5a623',
      color: '#8a6d3b',
    });
    info.innerHTML = `
      <p style="font-weight: 600; color: #996b00; margin: 0 0 4px 0;">
        ⚠️ Access Restricted
      </p>
      <p style="margin: 0; color: #8a6d3b;">
        You don't have permission to generate reports. Please contact your OpTel administrator for access.
      </p>
    `;
  }
}

/**
 * Create and show the report generation modal
 */
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

  // Show validating state
  const btn = modal.querySelector('#report-generate-btn');
  const info = modal.querySelector('.report-info p');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Validating access...';
  }

  // Validate RUM token against API
  const { isAdmin } = await checkRumAdminAccess();

  if (!isAdmin) {
    disableForNonAdmin(modal);
    return overlay;
  }

  // Enable button for valid users
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

/**
 * Block initialization
 */
export default function decorate(block) {
  const button = document.createElement('button');
  button.className = 'open-report-modal-btn';
  button.textContent = '📊 Generate AI RUM Report';
  button.addEventListener('click', openReportModal);
  block.appendChild(button);
}
