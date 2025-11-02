/**
 * Generate AI RUM Report Modal
 * Main entry point for the report generation modal
 */

import { createModalStructure, showStatus } from './modal-ui.js';
import generateReport from './report-generator.js';

// Constants
const API_KEY_STORAGE_KEY = 'anthropicApiKey';

let modalInstance = null;

/**
 * Remove metrics=super parameter and uncheck all checkpoints
 */
function cleanupMetricsParameter() {
  const currentUrl = new URL(window.location);

  // Check if metrics=super was added
  if (currentUrl.searchParams.get('metrics') === 'super') {
    // Remove metrics parameter
    currentUrl.searchParams.delete('metrics');

    // Remove all checkpoint parameters
    currentUrl.searchParams.delete('checkpoint');

    // Update URL
    window.history.replaceState({}, '', currentUrl);

    // Uncheck all checkpoint checkboxes in the sidebar
    const sidebar = document.querySelector('facet-sidebar');
    if (sidebar) {
      const checkpointInputs = sidebar.querySelectorAll('input[id^="checkpoint="]');
      checkpointInputs.forEach((input) => {
        input.checked = false;
        input.indeterminate = false;
      });
    }

    // Refresh dashboard to reflect changes
    if (typeof window.slicerDraw === 'function') {
      window.slicerDraw().catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[OpTel Detective Report] Error refreshing dashboard:', err);
      });
    }
  }
}

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
  const statusDiv = modal.querySelector('#report-status');

  generateBtn?.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();

    // Validate API key
    if (!apiKey) {
      showStatus(statusDiv, 'error', '❌ Please enter a valid API key');
      return;
    }

    // Save API key if not already saved
    const existingApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (!existingApiKey) {
      localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
      apiKeyInput.disabled = true;
      generateBtn.textContent = '📊 Generate Report';
      showStatus(statusDiv, 'success', '✅ API key saved successfully!');
      return;
    }

    // Generate report
    await generateReport(apiKey, statusDiv, generateBtn, modal);
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
