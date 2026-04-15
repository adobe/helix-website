import {
  Chart, TimeScale, LinearScale, registerables,
  // eslint-disable-next-line import/no-unresolved, import/extensions
} from 'chartjs';
// eslint-disable-next-line import/no-unresolved, import/extensions
import 'chartjs-adapter-luxon';
import AbstractChart from './chart.js';
import {
  truncate,
  cssVariable,
  INTERPOLATION_THRESHOLD,
  isDarkTheme,
} from '../utils.js';

Chart.register(TimeScale, LinearScale, ...registerables);

const REDIRECT_TARGET_RE = /^(\d+)([:~])(\d+)$/;

function parseRedirectTarget(target) {
  if (typeof target !== 'string') return null;
  const m = target.match(REDIRECT_TARGET_RE);
  if (!m) return null;
  return {
    count: Number.parseInt(m[1], 10),
    type: m[2] === '~' ? 'external' : 'internal',
    duration: Number.parseInt(m[3], 10),
  };
}

function findRedirectEvent(bundle) {
  return bundle.events.find(
    (e) => e.checkpoint === 'redirect' && typeof e.target === 'string',
  );
}

/**
 * RedirectPerfChart shows redirect duration percentiles over time
 * as a line chart, with p50 and p75 redirect duration.
 */
export default class RedirectPerfChart extends AbstractChart {
  /**
   * Returns a function that groups data bundles by time slot,
   * truncated to the chart's configured granularity.
   * @returns {function} A grouping function for data bundles
   */
  get groupBy() {
    const groupFn = (bundle) => {
      const slotTime = new Date(bundle.timeSlot);
      return truncate(slotTime, this.chartConfig.unit);
    };

    groupFn.fillerFn = (existing) => {
      const endDate = this.chartConfig.endDate ? new Date(this.chartConfig.endDate) : new Date();

      let startDate;
      if (!this.chartConfig.startDate) {
        startDate = new Date(endDate);
        if (this.chartConfig.unit === 'day') startDate.setDate(endDate.getDate() - 30);
        if (this.chartConfig.unit === 'hour') startDate.setDate(endDate.getDate() - 7);
        if (this.chartConfig.unit === 'week') startDate.setMonth(endDate.getMonth() - 12);
        if (this.chartConfig.unit === 'month') startDate.setMonth(endDate.getMonth() - 1);
      } else {
        startDate = new Date(this.chartConfig.startDate);
      }

      existing.sort((a, b) => new Date(a) - new Date(b));
      const slots = new Set(existing);
      slots.forEach((slot) => {
        const slotDate = new Date(slot);
        if (slotDate < startDate || slotDate > endDate) {
          slots.delete(slot);
        }
      });
      const slotTime = new Date(startDate);
      let maxSlots = 1000;
      while (slotTime <= endDate) {
        const { unit } = this.chartConfig;
        slots.add(truncate(slotTime, unit));
        if (this.chartConfig.unit === 'day') slotTime.setDate(slotTime.getDate() + 1);
        if (this.chartConfig.unit === 'hour') slotTime.setHours(slotTime.getHours() + 1);
        if (this.chartConfig.unit === 'week') slotTime.setDate(slotTime.getDate() + 7);
        if (this.chartConfig.unit === 'month') slotTime.setMonth(slotTime.getMonth() + 1);
        maxSlots -= 1;
        if (maxSlots < 0) {
          // eslint-disable-next-line no-console
          console.error('Too many slots');
          break;
        }
      }
      return Array.from(slots);
    };

    return groupFn;
  }

  render() {
    if (!this.elems.canvas) return;
    // eslint-disable-next-line no-undef
    this.chart = new Chart(this.elems.canvas, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Redirect Duration (p50)',
            backgroundColor: cssVariable('--spectrum-blue-600'),
            borderColor: cssVariable('--spectrum-blue-600'),
            tension: 0.2,
            pointRadius: 2,
            spanGaps: true,
            data: [],
          },
          {
            label: 'Redirect Duration (p75)',
            backgroundColor: cssVariable('--spectrum-blue-400'),
            borderColor: cssVariable('--spectrum-blue-400'),
            borderDash: [5, 5],
            tension: 0.2,
            pointRadius: 2,
            spanGaps: true,
            data: [],
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: {
              color: isDarkTheme() ? '#b3b3b3' : undefined,
            },
          },
          customCanvasBackgroundColor: {
            color: isDarkTheme() ? '#1e1e1e' : 'white',
          },
          tooltip: {
            intersect: false,
            callbacks: {
              label: (context) => {
                const value = context.parsed.y;
                if (value === null || value === undefined || Number.isNaN(value)) return '';
                return `${context.dataset.label}: ${Math.round(value)}ms`;
              },
            },
          },
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
        },
        animation: {
          duration: 300,
        },
        responsive: true,
        scales: {
          x: {
            type: 'time',
            display: true,
            grid: { display: false },
            border: { display: false },
            offset: true,
            time: {
              displayFormats: { day: 'EEE, MMM d' },
              unit: 'day',
            },
            ticks: {
              minRotation: 90,
              maxRotation: 90,
              autoSkip: false,
              color: isDarkTheme() ? '#b3b3b3' : undefined,
            },
          },
          y: {
            display: true,
            beginAtZero: true,
            border: { display: false },
            title: {
              display: true,
              text: 'Duration (ms)',
              color: isDarkTheme() ? '#b3b3b3' : undefined,
            },
            ticks: {
              color: isDarkTheme() ? '#b3b3b3' : undefined,
            },
          },
        },
      },
    });
  }

  defineSeries() {
    const { dataChunks } = this;

    dataChunks.addSeries('hasRedirect', (bundle) => (
      findRedirectEvent(bundle) ? bundle.weight : undefined
    ));
    dataChunks.addSeries('noRedirect', (bundle) => (
      findRedirectEvent(bundle) ? undefined : bundle.weight
    ));

    dataChunks.addSeries('internalRedirect', (bundle) => {
      const evt = findRedirectEvent(bundle);
      if (!evt) return undefined;
      const parsed = parseRedirectTarget(evt.target);
      return parsed && parsed.type === 'internal' ? bundle.weight : undefined;
    });
    dataChunks.addSeries('externalRedirect', (bundle) => {
      const evt = findRedirectEvent(bundle);
      if (!evt) return undefined;
      const parsed = parseRedirectTarget(evt.target);
      return parsed && parsed.type === 'external' ? bundle.weight : undefined;
    });

    // Interpolations for percentage of traffic with/without redirects
    dataChunks.addInterpolation(
      'iHasRedirect',
      ['hasRedirect', 'noRedirect'],
      ({ hasRedirect, noRedirect }) => {
        const valueCount = hasRedirect.count + noRedirect.count;
        if (valueCount < INTERPOLATION_THRESHOLD) return 0;
        const totalWeight = hasRedirect.weight + noRedirect.weight;
        const share = hasRedirect.weight / (totalWeight || 1);
        return Math.round(share * totalWeight);
      },
    );
    dataChunks.addInterpolation(
      'iNoRedirect',
      ['hasRedirect', 'noRedirect'],
      ({ hasRedirect, noRedirect }) => {
        const valueCount = hasRedirect.count + noRedirect.count;
        if (valueCount < INTERPOLATION_THRESHOLD) {
          return hasRedirect.weight + noRedirect.weight;
        }
        const totalWeight = hasRedirect.weight + noRedirect.weight;
        const share = noRedirect.weight / (totalWeight || 1);
        return Math.round(share * totalWeight);
      },
    );
  }

  /**
   * Register redirect-specific facets. Called by slicer.js via the
   * updateDataFacets hook so these are available without needing
   * checkpoint=redirect in the URL.
   */
  // eslint-disable-next-line class-methods-use-this
  updateDataFacets(dataChunks) {
    dataChunks.addFacet('redirect.type', (bundle) => Array.from(
      bundle.events
        .filter((evt) => evt.checkpoint === 'redirect')
        .reduce((acc, evt) => {
          const parsed = parseRedirectTarget(evt.target);
          if (parsed) acc.add(parsed.type);
          return acc;
        }, new Set()),
    ));

    dataChunks.addFacet('redirect.count', (bundle) => Array.from(
      bundle.events
        .filter((evt) => evt.checkpoint === 'redirect')
        .reduce((acc, evt) => {
          const parsed = parseRedirectTarget(evt.target);
          if (parsed) acc.add(String(parsed.count));
          return acc;
        }, new Set()),
    ));

    dataChunks.addFacet('redirect.source', (bundle) => Array.from(
      bundle.events
        .filter((evt) => evt.checkpoint === 'redirect')
        .filter(({ source }) => source)
        .reduce((acc, { source }) => { acc.add(String(source)); return acc; }, new Set()),
    ));
  }

  async draw() {
    const params = new URL(window.location).searchParams;
    const view = params.get('view');

    const startDate = params.get('startDate');
    const endDate = params.get('endDate');

    let customView = 'year';
    let unit = 'month';
    let units = 12;
    if (view === 'custom') {
      const diff = endDate ? new Date(endDate).getTime() - new Date(startDate).getTime() : 0;
      if (diff < (1000 * 60 * 60 * 24)) {
        customView = 'hour';
        unit = 'hour';
        units = 24;
      } else if (diff <= (1000 * 60 * 60 * 24 * 7)) {
        customView = 'week';
        unit = 'hour';
        units = Math.round(diff / (1000 * 60 * 60));
      } else if (diff <= (1000 * 60 * 60 * 24 * 31)) {
        customView = 'month';
        unit = 'day';
        units = 30;
      } else if (diff <= (1000 * 60 * 60 * 24 * 365 * 3)) {
        customView = 'week';
        unit = 'week';
        units = Math.round(diff / (1000 * 60 * 60 * 24 * 7));
      }
    }

    const focus = params.get('focus');

    if (this.dataChunks.filtered.length < 1000) {
      this.elems.lowDataWarning.ariaHidden = 'false';
    } else {
      this.elems.lowDataWarning.ariaHidden = 'true';
    }

    const configs = {
      month: {
        view, unit: 'day', units: 30, focus, startDate, endDate,
      },
      week: {
        view, unit: 'hour', units: 24 * 7, focus, startDate, endDate,
      },
      year: {
        view, unit: 'week', units: 52, focus, startDate, endDate,
      },
      custom: {
        view: customView, unit, units, focus, startDate, endDate,
      },
    };

    const config = configs[view];
    this.config = { ...config, ...this.config };
    this.defineSeries();

    // group by date, according to the chart config
    const group = this.dataChunks.group(this.groupBy);
    const chartLabels = Object.keys(group).sort();

    const { p50s, p75s } = Object.entries(this.dataChunks.aggregates)
      .sort(([a], [b]) => a.localeCompare(b))
      .reduce((acc, [, totals]) => {
        const p50 = totals.redirectDuration.percentile(50);
        const p75 = totals.redirectDuration.percentile(75);
        acc.p50s.push(Number.isFinite(p50) ? p50 : null);
        acc.p75s.push(Number.isFinite(p75) ? p75 : null);
        return acc;
      }, { p50s: [], p75s: [] });

    this.chart.data.datasets[0].data = p50s;
    this.chart.data.datasets[1].data = p75s;
    this.chart.data.labels = chartLabels;
    this.chart.options.scales.x.time.unit = config.unit;

    this.chart.update();

    // Update redirect-specific key metric cards
    this.updateRedirectMetrics();
  }

  updateRedirectMetrics() {
    const { dataChunks } = this;

    const redirectPvs = document.querySelector('#redirect-pvs p number-format');
    if (redirectPvs) {
      const sum = dataChunks.totals.hasRedirect
        ? dataChunks.totals.hasRedirect.sum : 0;
      const count = dataChunks.totals.hasRedirect
        ? dataChunks.totals.hasRedirect.count : 0;
      redirectPvs.textContent = sum;
      redirectPvs.setAttribute('sample-size', count);
    }

    const redirectDuration = document.querySelector('#redirect-duration p number-format');
    if (redirectDuration) {
      const p50 = dataChunks.totals.redirectDuration
        ? dataChunks.totals.redirectDuration.percentile(50) : 0;
      redirectDuration.textContent = Number.isFinite(p50) ? Math.round(p50) : '-';
    }

    const redirectPct = document.querySelector('#redirect-pct p number-format');
    if (redirectPct) {
      const has = dataChunks.totals.hasRedirect
        ? dataChunks.totals.hasRedirect.sum : 0;
      const total = dataChunks.totals.pageViews
        ? dataChunks.totals.pageViews.sum : 0;
      redirectPct.textContent = total > 0
        ? Math.round((has / total) * 1000) / 10
        : '-';
    }
  }

  updateColorScheme() {
    if (!this.chart || !this.chart.update || !this.chart.options) return;

    const isDark = isDarkTheme();

    this.chart.options.plugins.customCanvasBackgroundColor.color = isDark ? '#1e1e1e' : 'white';
    this.chart.options.scales.x.ticks.color = isDark ? '#b3b3b3' : undefined;
    this.chart.options.scales.y.ticks.color = isDark ? '#b3b3b3' : undefined;
    this.chart.options.scales.y.title.color = isDark ? '#b3b3b3' : undefined;
    if (this.chart.options.plugins.legend) {
      this.chart.options.plugins.legend.labels.color = isDark ? '#b3b3b3' : undefined;
    }

    this.chart.update();
  }
}
