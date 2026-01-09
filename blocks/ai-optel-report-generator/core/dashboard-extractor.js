/**
 * Dashboard Data Extractor - Extracts metrics and segments from RUM dashboard
 */

/* eslint-disable no-console */

/** Extract dashboard data including metrics, segments, and date range */
export default function extractDashboardData() {
  return new Promise((resolve) => {
    const getData = () => {
      const data = {
        metrics: {}, segments: {}, dateRange: null, startDate: null, endDate: null,
      };

      // Extract date range from picker
      const picker = document.querySelector('daterange-picker');
      if (picker?.value) {
        const { value, from, to } = picker.value;
        if (value) data.dateRange = value;
        if (from && to) {
          data.startDate = from;
          data.endDate = to;
        }
      }

      // Extract key metrics
      document.querySelectorAll('.key-metrics li[id]').forEach((item) => {
        const name = item.querySelector('h2')?.textContent?.trim() || item.id;
        const numFmt = item.querySelector('number-format');
        const value = numFmt?.getAttribute('title') || numFmt?.textContent?.trim();
        if (name && value && value !== '0') data.metrics[name] = value;
      });

      // Extract facet segments
      const sidebar = document.querySelector('facet-sidebar');
      sidebar?.querySelectorAll('list-facet, link-facet, literal-facet').forEach((facet) => {
        const facetName = facet.getAttribute('facet');
        if (!facetName) return;

        data.segments[facetName] = Array.from(facet.querySelectorAll('label')).map((label) => {
          const labelText = label.querySelector('.label')?.textContent?.trim();
          const valueText = label.querySelector('.value')?.textContent?.trim();
          const countEl = label.querySelector('number-format.count');
          const countTitle = countEl?.getAttribute('title') || '0';

          // Extract CWV metrics if present
          const metrics = {};
          label.nextElementSibling?.querySelector?.('ul.cwv')?.querySelectorAll('li').forEach((li) => {
            const title = li.getAttribute('title')?.split(' - ')[0];
            const val = li.querySelector('number-format')?.textContent?.trim();
            if (title && val) metrics[title] = val;
          });

          return {
            value: labelText || valueText || label.querySelector('span')?.textContent?.trim(),
            displayCount: countEl?.textContent?.trim() || '0',
            count: parseInt(countTitle.split(' ')[0].replace(/\D/g, ''), 10) || 0,
            metrics,
          };
        }).filter((item) => item.value);
      });

      console.log(`[Dashboard] Extracted ${Object.keys(data.metrics).length} metrics, ${Object.keys(data.segments).length} segments`);
      resolve(data);
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', getData);
    } else {
      getData();
    }
  });
}
