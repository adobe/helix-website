/**
 * Cleanup Utilities - Remove report generator URL params and reset UI
 */

const PARAMS_TO_REMOVE = ['startDate', 'endDate'];

export default function cleanupMetricsParameter() {
  const { searchParams } = new URL(window.location);
  const isSuper = searchParams.get('metrics') === 'super';
  const hasDates = PARAMS_TO_REMOVE.some((p) => searchParams.has(p));

  if (!isSuper && !hasDates) return;

  // Build clean URL
  if (isSuper) {
    searchParams.delete('metrics');
    searchParams.delete('checkpoint');
    // Reset checkpoint UI
    document.querySelectorAll('facet-sidebar input[id^="checkpoint="]')
      .forEach((el) => Object.assign(el, { checked: false, indeterminate: false }));
  }

  PARAMS_TO_REMOVE.forEach((p) => searchParams.delete(p));
  window.history.replaceState({}, '', `${window.location.pathname}?${searchParams}`);

  // Refresh dashboard
  window.slicerDraw?.().catch(() => {});
}
