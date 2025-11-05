/**
 * Cleanup Utilities
 * Shared functions to avoid circular dependencies
 */

/**
 * Remove metrics=super parameter and uncheck all checkpoints
 */
export default function cleanupMetricsParameter() {
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
