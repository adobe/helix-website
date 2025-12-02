/**
 * Generate AI RUM Report Modal
 * Main entry point for the report generation modal
 */

import { createModalStructure, showStatus } from './modal-ui.js';
import generateReport from './report-generator.js';
import cleanupMetricsParameter from './cleanup-utils.js';
import { STORAGE_KEYS } from './config.js';

let modalInstance = null;

/**
 * Close and remove the modal
 * Also removes the metrics=super parameter and unchecks all checkboxes
 */
export function closeReportModal() {
  if (modalInstance) {
    modalInstance.remove();
    modalInstance = null;

    cleanupMetricsParameter();
  }
}

/**
 * Check if modal can be closed (not during generation or waiting to save)
 */
function canCloseModal(modal) {
  const generateBtn = modal.querySelector('#report-generate-btn');
  const progressIndicator = modal.querySelector('#circular-progress-container');
  const reportResults = modal.querySelector('.report-results');
  return !(generateBtn?.disabled || progressIndicator || reportResults);
}

/**
 * Set up modal close handlers
 */
function setupCloseHandlers(modal) {
  // Close button
  const closeBtn = modal.querySelector('.report-modal-close');
  closeBtn?.addEventListener('click', () => {
    if (canCloseModal(modal)) closeReportModal();
  });

  // ESC key
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
  const bedrockTokenInput = modal.querySelector('#report-bedrock-token');
  const statusDiv = modal.querySelector('#report-status');
  const providerNameSpan = modal.querySelector('#provider-name');

  // Update provider name if span exists
  if (providerNameSpan) {
    import('./api/api-factory.js').then(({ getProviderName }) => {
      providerNameSpan.textContent = getProviderName();
    });
  }

  generateBtn?.addEventListener('click', async () => {
    const bedrockToken = bedrockTokenInput?.value.trim() || '';

    // Validate Bedrock token is provided
    if (!bedrockToken) {
      showStatus(statusDiv, 'error', '❌ Please enter your AWS Bedrock token');
      return;
    }

    // Save token if not already saved
    const existingBedrockToken = localStorage.getItem(STORAGE_KEYS.BEDROCK_TOKEN);

    if (!existingBedrockToken && bedrockToken) {
      localStorage.setItem(STORAGE_KEYS.BEDROCK_TOKEN, bedrockToken);
      if (bedrockTokenInput) bedrockTokenInput.disabled = true;
      generateBtn.textContent = '📊 Generate Report';
      // Update provider name
      if (providerNameSpan) {
        import('./api/api-factory.js').then(({ getProviderName }) => {
          providerNameSpan.textContent = getProviderName();
        });
      }
    }

    // Generate report
    await generateReport(null, statusDiv, generateBtn, modal);
  });
}

/**
 * Set up event listeners for modal interactions
 */
function setupModalEventListeners(modal) {
  setupCloseHandlers(modal);
  setupGenerateButton(modal);
}

/**
 * Create and show the report generation modal
 */
export function openReportModal() {
  // Remove existing modal if any
  if (modalInstance) {
    closeReportModal();
  }

  // Check if Bedrock token exists
  const hasBedrockToken = !!localStorage.getItem(STORAGE_KEYS.BEDROCK_TOKEN);

  // Create modal structure
  const { overlay, modal } = createModalStructure(hasBedrockToken);

  // Click outside to close
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay && canCloseModal(modal)) {
      closeReportModal();
    }
  });

  // Append to document
  document.body.appendChild(overlay);
  modalInstance = overlay;

  // Set up event listeners
  setupModalEventListeners(modal);

  return overlay;
}

/**
 * Default export for block initialization
 */
export default function decorate(block) {
  // If block is provided, create a button that opens the modal
  const button = document.createElement('button');
  button.className = 'open-report-modal-btn';
  button.textContent = '📊 Generate AI RUM Report';
  button.addEventListener('click', openReportModal);
  block.appendChild(button);
}
