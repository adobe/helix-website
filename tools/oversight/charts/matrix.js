import {
  Chart, registerables,
  // eslint-disable-next-line import/no-unresolved, import/extensions
} from 'chartjs';
// eslint-disable-next-line import/no-unresolved, import/extensions
import { MatrixController, MatrixElement } from 'chartjs-chart-matrix';

import {
  Burg, Mint, DarkMint, Purp, Emrld, OrYel,
  // eslint-disable-next-line import/no-unresolved, import/extensions
} from 'cartocolor';
import AbstractChart from './chart.js';
import { reclassifyAcquisition } from '../utils.js';

Chart.register(MatrixController, MatrixElement, ...registerables);

const createColorizer = (minValue, maxValue, palette) => (value) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 'rgba(0, 0, 0, 0)';
  }

  const colors = palette[7];
  const clampedValue = Math.min(Math.max(value, minValue), maxValue);
  const index = Math.round(((clampedValue - minValue)
    / (maxValue - minValue)) * (colors.length - 1));
  return colors[index];
};
/**
 * Creates a colorizer function that uses a three-point scale, with three palettes
 * for good, meh, and bad values.
 * @param {number} badMin
 * @param {number} badMax
 * @param {number} goodMin
 * @param {number} goodMax
 * @param {Palette} badPalette
 * @param {Palette} mehPalette
 * @param {Palette} goodPalette
 * @returns {function} a colorizer function
 */
const createTriScaleColorizer = (

  goodMin,
  goodMax,
  badMin,
  badMax,
  goodPalette,
  mehPalette,
  badPalette,
) => (value) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 'rgba(0, 0, 0, 0)';
  }

  if (value < goodMax) {
    return createColorizer(goodMin, goodMax, goodPalette)(value);
  }
  if (value > badMin) {
    return createColorizer(badMin, badMax, badPalette)(value);
  }
  return createColorizer(goodMax, badMin, mehPalette)(value);
};

export default class MatrixChart extends AbstractChart {
  constructor(dataChunks, elems) {
    super(dataChunks, elems);

    this.series = {
      bounce: {
        label: 'Bounce Rate',
        rateFn: (aggregate) => Math.round(
          (100 * aggregate.bounces.sum) / aggregate.visits.sum,
        ),
        colorizer: createColorizer(30, 90, Burg),
        labelFn: (value) => `${value}%`,
      },
      engagement: {
        label: 'Page Engagement',
        rateFn: (aggregate) => Math.round(
          (100 * aggregate.engagement.sum) / aggregate.pageViews.sum,
        ),
        colorizer: createColorizer(0, 80, Mint),
        labelFn: (value) => `${value}%`,
      },
      conversions: {
        label: 'Conversion Rate',
        rateFn: (aggregate) => Math.min(Math.round(
          (100 * aggregate.conversions.sum) / aggregate.visits.sum,
        ), 100),
        colorizer: createColorizer(0, 100, DarkMint),
        labelFn: (value) => `${value}%`,
      },
      pagesPerVisit: {
        label: 'Visit Depth',
        rateFn: (aggregate) => Math.round(aggregate.pageViews.sum / aggregate.visits.sum),
        colorizer: createColorizer(1, 10, Purp),
        labelFn: (value) => `${value} pages`,
      },
      earned: {
        label: 'Earned Percentage',
        rateFn: (aggregate) => Math.round(
          (100 * aggregate.earned.sum) / aggregate.visits.sum,
        ),
        colorizer: createColorizer(0, 100, Emrld),
        labelFn: (value) => `${value}%`,
      },
      lcp: {
        label: 'Largest Contentful Paint',
        rateFn: (aggregate) => aggregate.lcp.percentile(75),
        colorizer: createTriScaleColorizer(
          500, // relalistic lower bound of how good LCP can be
          2500, // Google's upper bound of good LCP
          4000, // Google's lower bound of bad LCP
          10000, // arbitrary upper bound of how bad LCP can be
          Mint,
          OrYel,
          Burg,
        ),
      },
      cls: {
        label: 'Cumulative Layout Shift',
        rateFn: (aggregate) => aggregate.cls.percentile(75),
        colorizer: createTriScaleColorizer(
          0, // realistic lower bound of how good CLS can be
          0.1, // Google's upper bound of good CLS
          0.25, // Google's lower bound of bad CLS
          1, // arbitrary upper bound of how bad CLS can be
          Mint,
          OrYel,
          Burg,
        ),
      },
      inp: {
        label: 'Interaction to Next Paint',
        rateFn: (aggregate) => aggregate.inp.percentile(75),
        colorizer: createTriScaleColorizer(
          0, // realistic lower bound of how good INP can be
          100, // Google's upper bound of good INP
          300, // Google's lower bound of bad INP
          1000, // arbitrary upper bound of how bad INP can be
          Mint,
          OrYel,
          Burg,
        ),
      },
      // ... other series
    };
  }

  async draw() {
    let params = new URL(window.location.href).searchParams;
    this.defineSeries();

    if (!params.get('drilldown')) {
      const u = new URL(window.location.href);
      u.searchParams.set('drilldown', 'url');
      window.history.replaceState({}, '', u);
      params = u.searchParams;
    }

    this.drilldown = params.get('drilldown');

    const facet = this.dataChunks.facets[this.drilldown];
    const dataset = this.chart.data.datasets[0];

    this.chart.options.scales.y.labels = [];

    dataset.data = [];
    facet
      .slice(0, 20)
      // reverse order
      .reverse()
      .forEach((row) => {
        const { metrics, value: y } = row;
        Object.entries(this.series).forEach(([x, series]) => {
          const v = series.rateFn(metrics);
          dataset.data.push({
            x: series.label, y, v, key: x,
          });
        });
      });

    this.chart.update();
  }

  defineSeries() {
    const { dataChunks } = this;

    // our series are the different kinds of success metrics that exist
    // for each of the different breakdowns of the selected drilldown facet
    // these are the columns of the matrix
    // - pages per visit (provided by slicer)
    // - bounce rate (provided by slicer)
    // - earned percentage
    // - engagement (provided by slicer)
    // - conversion rate (if defined)
    // - we also show the core web vitals as additional series

    dataChunks.addSeries('earned', (bundle) => {
      const reclassified = bundle.events
        .map(reclassifyAcquisition);
      if (!reclassified.find((evt) => evt.checkpoint === 'enter')) {
        // we only consider enter events
        return 0;
      }
      if (!reclassified.find((evt) => evt.checkpoint === 'acquisition')) {
        // this is fully organic, as there are no traces of any acquisition
        return bundle.weight;
      }
      if (reclassified.find((evt) => evt.checkpoint === 'acquisition' && evt.source.startsWith('paid'))) {
        // this is paid, as there is at least one paid acquisition
        return 0;
      }
      if (reclassified.find((evt) => evt.checkpoint === 'acquisition' && evt.source.startsWith('owned'))) {
        // owned does not count as organic, sorry
        return 0;
      }
      return 0;
    });
  }

  render() {
    // eslint-disable-next-line no-undef
    this.chart = new Chart(this.elems.canvas, {
      type: 'matrix',
      data: {
        datasets: [{
          label: 'Success Matrix',
          data: [
            { x: '', y: 'Metric A', v: 1 },
          ],
          backgroundColor: (context) => {
            const value = context.dataset.data[context.dataIndex].v;
            const { key } = context.dataset.data[context.dataIndex];
            const series = this.series[key];
            if (!series || typeof series.colorizer !== 'function') {
              const alpha = (value + 5) / 20;
              return `rgba(0, 0, 255, ${alpha})`;
            }
            return series.colorizer(value);
          },
          width: ({ chart }) => (chart.chartArea || {}).width / 16,
          // height: ({ chart }) => (chart.chartArea || {}).height / 3,
          borderColor: 'rgba(0, 0, 0, 0.2)',
          borderWidth: 1,
        }],
      },
      options: {
        plugins: {
          tooltip: {
            callbacks: {
              title: () => '',
              label: (context) => {
                const v = context.dataset.data[context.dataIndex];
                const series = this.series[v.key];
                if (!series || typeof series.labelFn !== 'function') {
                  return [`${v.y}`, `${v.x}: ${v.v}`];
                }
                const label = series.labelFn(v.v);
                return [`${v.y}`, `${v.x}: ${label}`];
              },
            },
          },
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            position: 'top',
            type: 'category',
            ticks: {
              display: true,
            },
            grid: {
              display: false,
            },
            border: {
              display: false,
            },
          },
          y: {
            type: 'category',
            labels: [],
            ticks: {
              display: true,
            },
            grid: {
              display: false,
            },
            border: {
              display: false,
            },
          },
        },
      },
    });
  }
}
