/**
 * Generate AI RUM Report Modal
 * Main entry point for the report generation modal
 */

import { createModalStructure, showStatus } from './modal-ui.js';
import generateReport from './report-generator.js';
import cleanupMetricsParameter from './cleanup-utils.js';

// Constants
const API_KEY_STORAGE_KEY = 'anthropicApiKey';

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
 * Set up modal close handlers
 */
function setupCloseHandlers(modal) {
  // Close button
  const closeBtn = modal.querySelector('.report-modal-close');
  closeBtn?.addEventListener('click', closeReportModal);

  // ESC key to close
  const escHandler = (e) => {
    if (e.key === 'Escape') {
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
  const apiKeyInput = modal.querySelector('#report-api-key');
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
    const apiKey = apiKeyInput.value.trim();
    const bedrockToken = bedrockTokenInput.value.trim();

    // Validate at least one credential is provided
    if (!apiKey && !bedrockToken) {
      showStatus(statusDiv, 'error', '❌ Please enter either Anthropic API key or AWS Bedrock token');
      return;
    }

    // Save credentials if not already saved
    const existingApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    const existingBedrockToken = localStorage.getItem('awsBedrockToken');

    if ((!existingApiKey && apiKey) || (!existingBedrockToken && bedrockToken)) {
      if (apiKey && !existingApiKey) {
        localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
        apiKeyInput.disabled = true;
      }
      if (bedrockToken && !existingBedrockToken) {
        localStorage.setItem('awsBedrockToken', bedrockToken);
        bedrockTokenInput.disabled = true;
      }
      generateBtn.textContent = '📊 Generate Report';
      showStatus(statusDiv, 'success', '✅ API credentials saved successfully!');
      // Update provider name
      if (providerNameSpan) {
        import('./api/api-factory.js').then(({ getProviderName }) => {
          providerNameSpan.textContent = getProviderName();
        });
      }
      return;
    }

    // Generate report (apiKey param is kept for backwards compatibility but not used directly)
    await generateReport(apiKey || 'using-factory', statusDiv, generateBtn, modal);
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

  // Check if API key exists
  const hasApiKey = !!localStorage.getItem(API_KEY_STORAGE_KEY);

  // Create modal structure
  const { overlay, modal } = createModalStructure(hasApiKey);

  // Add click-outside-to-close functionality
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
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
