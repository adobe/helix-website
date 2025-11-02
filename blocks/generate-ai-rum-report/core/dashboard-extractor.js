/**
 * Dashboard Data Extractor Module
 * Extracts metrics and segment data from the RUM dashboard DOM
 */

/* eslint-disable no-console */

/**
 * Extract all dashboard data including metrics and segments
 * @returns {Promise<Object>} Dashboard data with metrics, segments, and date range
 */
export function extractDashboardData() {
  return new Promise((resolve) => {
    const getData = () => {
      console.log('[Dashboard Data] Starting data extraction...');

      const dashboardData = {
        metrics: {},
        segments: {},
        dateRange: null,
      };

      // Extract date range
      const dateRangeInput = document.querySelector('.daterange-wrapper input[data-value]');
      if (dateRangeInput) {
        dashboardData.dateRange = dateRangeInput.getAttribute('data-value');
        console.log(`[Dashboard Data] ✓ Captured date range: ${dashboardData.dateRange}`);
      }

      // Extract key metrics (pageviews, visits, conversions, LCP, CLS, INP, etc.)
      const keyMetricsContainer = document.querySelector('.key-metrics');
      if (keyMetricsContainer) {
        const metricItems = keyMetricsContainer.querySelectorAll('li[id]');

        metricItems.forEach((item) => {
          const metricName = item.querySelector('h2')?.textContent?.trim() || item.id;
          const numberFormat = item.querySelector('number-format');
          const metricValue = numberFormat?.textContent?.trim();
          const metricTitle = numberFormat?.getAttribute('title');

          if (metricName && metricValue && metricValue !== '0') {
            dashboardData.metrics[metricName] = metricTitle || metricValue;
            console.log(`[Dashboard Data] ✓ Captured metric: ${metricName} = ${metricTitle || metricValue}`);
          }
        });

        console.log(`[Dashboard Data] ✓ Successfully captured ${Object.keys(dashboardData.metrics).length} metrics`);
      }

      // Extract facet/segment data
      const facetSidebar = document.querySelector('facet-sidebar');
      if (facetSidebar) {
        const facets = facetSidebar.querySelectorAll('list-facet, link-facet, literal-facet');
        facets.forEach((facet) => {
          const facetName = facet.getAttribute('facet');
          if (!facetName) return;

          const labelElements = Array.from(facet.querySelectorAll('label'));
          const items = labelElements.map((label) => {
            const labelText = label.querySelector('.label')?.textContent?.trim() || '';
            const valueText = label.querySelector('.value')?.textContent?.trim() || '';
            const spanText = label.querySelector('span')?.textContent?.trim() || '';
            const countElement = label.querySelector('number-format.count');
            const countTitle = countElement?.getAttribute('title') || '0';
            const countText = countElement?.textContent?.trim() || '0';

            // Extract numeric count
            const numericCount = countTitle.split(' ')[0].replace(/[^\d]/g, '');

            // Extract performance metrics
            const cwvList = label.nextElementSibling?.querySelector?.('ul.cwv');
            const metrics = {};
            if (cwvList) {
              cwvList.querySelectorAll('li').forEach((item) => {
                const title = item.getAttribute('title') || '';
                const metricValue = item.querySelector('number-format')?.textContent?.trim();
                if (title && metricValue) {
                  const metricName = title.split(' - ')[0];
                  metrics[metricName] = metricValue;
                }
              });
            }

            return {
              value: labelText || valueText || spanText,
              displayCount: countText,
              count: parseInt(numericCount, 10) || 0,
              metrics,
            };
          }).filter((item) => item.value);

          dashboardData.segments[facetName] = items;
        });

        console.log(`[Dashboard Data] ✓ Extracted ${Object.keys(dashboardData.segments).length} segments`);
      }

      resolve(dashboardData);
    };

    // Ensure DOM is fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', getData);
    } else {
      getData();
    }
  });
}

/**
 * Generate a hash of dashboard data for cache validation
 * @param {Object} dashboardData - Dashboard data object
 * @returns {string} Hash string
 */
export function generateDashboardHash(dashboardData) {
  const dataString = JSON.stringify({
    metrics: dashboardData.metrics,
    segmentCounts: Object.keys(dashboardData.segments).reduce((acc, key) => {
      acc[key] = dashboardData.segments[key].length;
      return acc;
    }, {}),
    dateRange: dashboardData.dateRange,
  });

  // Simple hash function using Math operations instead of bitwise
  let hash = 0;
  for (let i = 0; i < dataString.length; i += 1) {
    const char = dataString.charCodeAt(i);
    hash = ((hash * 31) + char) % 2147483647;
  }

  return hash.toString(36);
}
