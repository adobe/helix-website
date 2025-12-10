import {
  Chart, TimeScale, LinearScale, registerables,
  // eslint-disable-next-line import/no-unresolved, import/extensions
} from 'chartjs';
// eslint-disable-next-line import/no-unresolved, import/extensions
import 'chartjs-adapter-luxon';
import {
  utils,
  stats,
} from '@adobe/rum-distiller';
import AbstractChart from './chart.js';
import {
  truncate,
  toHumanReadable,
  cssVariable,
  getGradient,
  cwvInterpolationFn,
  simpleCWVInterpolationFn,
  INTERPOLATION_THRESHOLD,
  purpleShades,
} from '../utils.js';

const {
  scoreCWV, scoreBundle,
} = utils;
const { linearRegression } = stats;

Chart.register(TimeScale, LinearScale, ...registerables);

/**
 * The SkylineChart is a unique type of multi-series bar chart that
 * shows both the overall traffic levels as well as the distribution
 * of each of the three core web vitals values within the given date
 * range.
 */
export default class SkylineChart extends AbstractChart {
  /**
   * Returns a function that can group the data bundles based on the
   * configuration of the chart. As this is a timeline chart,
   * the grouping is based on the time slot of the bundle, truncated
   * to the granularity of the chart.
   * @returns {function} A function that can group the data bundles
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
        // set start date depending on the unit
        startDate = new Date(endDate);
        // roll back to beginning of time
        if (this.chartConfig.unit === 'day') startDate.setDate(endDate.getDate() - 30);
        if (this.chartConfig.unit === 'hour') startDate.setDate(endDate.getDate() - 7);
        if (this.chartConfig.unit === 'week') startDate.setMonth(endDate.getMonth() - 12);
        if (this.chartConfig.unit === 'month') startDate.setMonth(endDate.getMonth() - 1);
      } else {
        startDate = new Date(this.chartConfig.startDate);
      }

      const slots = new Set(existing);
      const slotTime = new Date(startDate);
      // return Array.from(slots);
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
    // eslint-disable-next-line no-undef
    this.chart = new Chart(this.elems.canvas, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Page Views',
            // backgroundColor: cssVariable('--spectrum-purple-1300'),
            backgroundColor: (context) => {
              const { chart } = context;
              const { ctx, chartArea } = chart;

              if (!chartArea) {
                // This case happens on initial chart load
                return null;
              }
              const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              // Brighter purples in dark mode with visible gradient
              return isDark
                ? getGradient(ctx, chartArea, cssVariable('--spectrum-purple-1100'), cssVariable('--spectrum-purple-700'))
                : getGradient(ctx, chartArea, cssVariable('--spectrum-gray-800'), cssVariable('--spectrum-purple-1200'));
            },
            data: [],
          },
          {
            label: 'Good LCP',
            // Darker greens in dark mode to match metric indicators
            backgroundColor: window.matchMedia('(prefers-color-scheme: dark)').matches
              ? cssVariable('--spectrum-green-900')
              : cssVariable('--spectrum-green-600'),
            data: [],
            yAxisID: 'lcp',
            borderSkipped: 'top',
          },
          {
            label: 'Needs Improvement LCP',
            backgroundColor: window.matchMedia('(prefers-color-scheme: dark)').matches
              ? cssVariable('--spectrum-orange-900')
              : cssVariable('--spectrum-orange-600'),
            data: [],
            yAxisID: 'lcp',
            borderSkipped: true,
          },
          {
            label: 'Poor LCP',
            backgroundColor: window.matchMedia('(prefers-color-scheme: dark)').matches
              ? cssVariable('--spectrum-red-900')
              : cssVariable('--spectrum-red-600'),
            data: [],
            yAxisID: 'lcp',
            borderSkipped: 'bottom',
          },
          {
            label: 'Fake LCP Data',
            backgroundColor: 'transparent',
            data: [-2],
            yAxisID: 'lcp',
          },
          {
            label: 'Good CLS',
            backgroundColor: window.matchMedia('(prefers-color-scheme: dark)').matches
              ? cssVariable('--spectrum-green-800')
              : cssVariable('--spectrum-green-500'),
            data: [],
            yAxisID: 'cls',
            borderSkipped: 'top',
          },
          {
            label: 'Needs Improvement CLS',
            backgroundColor: window.matchMedia('(prefers-color-scheme: dark)').matches
              ? cssVariable('--spectrum-orange-800')
              : cssVariable('--spectrum-orange-500'),
            data: [],
            yAxisID: 'cls',
            borderSkipped: true,
          },
          {
            label: 'Poor CLS',
            backgroundColor: window.matchMedia('(prefers-color-scheme: dark)').matches
              ? cssVariable('--spectrum-red-800')
              : cssVariable('--spectrum-red-500'),
            data: [],
            yAxisID: 'cls',
            borderSkipped: 'bottom',
          },
          {
            label: 'Fake CLS Data',
            backgroundColor: 'transparent',
            data: [-2],
            yAxisID: 'cls',
          },
          {
            label: 'Good INP',
            backgroundColor: window.matchMedia('(prefers-color-scheme: dark)').matches
              ? cssVariable('--spectrum-green-700')
              : cssVariable('--spectrum-green-400'),
            data: [],
            yAxisID: 'inp',
            borderSkipped: 'top',
          },
          {
            label: 'Needs Improvement INP',
            backgroundColor: window.matchMedia('(prefers-color-scheme: dark)').matches
              ? cssVariable('--spectrum-orange-700')
              : cssVariable('--spectrum-orange-400'),
            data: [],
            yAxisID: 'inp',
            borderSkipped: true,
          },
          {
            label: 'Poor INP',
            backgroundColor: window.matchMedia('(prefers-color-scheme: dark)').matches
              ? cssVariable('--spectrum-red-700')
              : cssVariable('--spectrum-red-400'),
            data: [],
            yAxisID: 'inp',
            borderSkipped: 'bottom',
          },
          {
            label: 'Fake INP Data',
            backgroundColor: 'transparent',
            data: [-2],
            yAxisID: 'inp',
          },
        ],
      },
      plugins: [
        {
          id: 'customCanvasBackgroundColor',
          beforeDraw: (ch, _, options) => {
            const { ctx } = ch;
            ctx.save();
            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = options.color || '#99ffff';
            ctx.fillRect(0, 0, ch.width, ch.height);
            ctx.restore();
          },
        },
      ],
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          customCanvasBackgroundColor: {
            color: window.matchMedia('(prefers-color-scheme: dark)').matches
              ? '#1e1e1e'
              : 'white',
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.parsed.y;
                // show page views as human readable
                if (context.dataset.label === 'Page Views') return `${context.dataset.label}: ${toHumanReadable(value)}`;
                // show breakdown datasets as page views
                if (context.dataset.breakdownDataset) {
                  if (value === 0) return '';
                  return `${context.dataset.label}: ${toHumanReadable(value)}`;
                }
                // hide fake data and hidden datasets
                if (context.dataset.label.indexOf('Fake') > -1) return '';
                if (context.dataset.label.indexOf('hidden') > -1) return '';

                const { datasets } = context.chart.data;
                const i = context.dataIndex;
                const cwvmetric = context.dataset.label.split(' ').pop();
                const total = datasets
                  .filter((dataset) => dataset.label.indexOf('Fake') === -1)
                  .filter(({ label }) => label.indexOf(cwvmetric) > -1)
                  .reduce((pv, cv) => (pv || 0) + (cv.data[i] || 0), 0);

                if (value === 0 || total === 0) return '';
                return (`${context.dataset.label}: ${Math.round((value / total) * 1000) / 10}%`);
              },
            },
          },
        },
        interaction: {
          mode: 'x',
        },
        animation: {
          duration: 300,
        },
        datasets: {
          bar: {
            barPercentage: 1,
            categoryPercentage: 0.9,
            borderSkipped: false,
            borderRadius: {
              topLeft: 3,
              topRight: 3,
              bottomLeft: 3,
              bottomRight: 3,
            },
          },
        },
        responsive: true,
        scales: {
          x: {
            type: 'time',
            display: true,
            grid: {
              display: false,
            },
            border: {
              display: false,
            },
            offset: true,
            time: {
              displayFormats: {
                day: 'EEE, MMM d',
              },
              unit: 'day',
            },
            stacked: true,
            ticks: {
              minRotation: 90,
              maxRotation: 90,
              autoSkip: false,
              color: window.matchMedia('(prefers-color-scheme: dark)').matches
                ? '#b3b3b3'
                : undefined,
            },
          },
          y: {
            display: true,
            stacked: true,
            border: {
              display: false,
            },
            ticks: {
              autoSkip: false,
              maxTicksLimit: 16,
              color: window.matchMedia('(prefers-color-scheme: dark)').matches
                ? '#b3b3b3'
                : undefined,
              callback: (value, index, arr) => {
                if (value === 0) return '';
                if (value > 0) {
                  return toHumanReadable(value);
                }
                if (index === 0) return 'INP';
                if (index === 1) return 'CLS';
                if (index === 3 || (index === 2 && arr[index + 1].value === 0)) return 'LCP';
                return '';
              },
            },
            grid: {
              color: (context) => {
                const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (context.tick.value > 0) return isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)';
                return 'rgba(0, 0, 0, 0.0)';
              },
            },
            // min: -7000,
          },
          lcp: {
            display: false,
            stacked: true,
            axis: 'y',
            reverse: false,
            // @davidnuescheler tweak this
            min: -3,
            max: 4.3,
          },
          cls: {
            display: false,
            stacked: true,
            axis: 'y',
            reverse: false,
            min: -2,
            max: 5.4,
          },
          inp: {
            display: false,
            stacked: true,
            axis: 'y',
            reverse: false,
            min: -1,
            max: 6.6,
          },
        },
      },
    });
  }

  /**
   * Defines the series for the chart based on the data chunks
   * @param {DataChunks} dataChunks
   */
  defineSeries() {
    const { dataChunks } = this;

    dataChunks.addSeries('goodLCP', (bundle) => (scoreCWV(bundle.cwvLCP, 'lcp') === 'good' ? bundle.weight : undefined));
    dataChunks.addSeries('poorLCP', (bundle) => (scoreCWV(bundle.cwvLCP, 'lcp') === 'poor' ? bundle.weight : undefined));
    dataChunks.addSeries('niLCP', (bundle) => (scoreCWV(bundle.cwvLCP, 'lcp') === 'ni' ? bundle.weight : undefined));
    dataChunks.addSeries('noLCP', () => (0));

    dataChunks.addSeries('goodCLS', (bundle) => (scoreCWV(bundle.cwvCLS, 'cls') === 'good' ? bundle.weight : undefined));
    dataChunks.addSeries('poorCLS', (bundle) => (scoreCWV(bundle.cwvCLS, 'cls') === 'poor' ? bundle.weight : undefined));
    dataChunks.addSeries('niCLS', (bundle) => (scoreCWV(bundle.cwvCLS, 'cls') === 'ni' ? bundle.weight : undefined));
    dataChunks.addSeries('noCLS', () => (0));

    dataChunks.addSeries('goodINP', (bundle) => (scoreCWV(bundle.cwvINP, 'inp') === 'good' ? bundle.weight : undefined));
    dataChunks.addSeries('poorINP', (bundle) => (scoreCWV(bundle.cwvINP, 'inp') === 'poor' ? bundle.weight : undefined));
    dataChunks.addSeries('niINP', (bundle) => (scoreCWV(bundle.cwvINP, 'inp') === 'ni' ? bundle.weight : undefined));
    dataChunks.addSeries('noINP', () => (0));

    // interpolated series
    dataChunks.addInterpolation(
      'iGoodLCP',
      ['goodLCP', 'niLCP', 'poorLCP'],
      simpleCWVInterpolationFn('LCP', 'good'),
    );
    dataChunks.addInterpolation(
      'iNiLCP',
      ['goodLCP', 'niLCP', 'poorLCP'],
      simpleCWVInterpolationFn('LCP', 'ni'),
    );
    dataChunks.addInterpolation(
      'iPoorLCP',
      ['goodLCP', 'niLCP', 'poorLCP'],
      simpleCWVInterpolationFn('LCP', 'poor'),
    );

    dataChunks.addInterpolation(
      'iGoodCLS',
      ['goodCLS', 'niCLS', 'poorCLS'],
      simpleCWVInterpolationFn('CLS', 'good'),
    );
    dataChunks.addInterpolation(
      'iNiCLS',
      ['goodCLS', 'niCLS', 'poorCLS'],
      simpleCWVInterpolationFn('CLS', 'ni'),
    );
    dataChunks.addInterpolation(
      'iPoorCLS',
      ['goodCLS', 'niCLS', 'poorCLS'],
      simpleCWVInterpolationFn('CLS', 'poor'),
    );

    dataChunks.addInterpolation(
      'iGoodINP',
      ['goodINP', 'niINP', 'poorINP'],
      simpleCWVInterpolationFn('INP', 'good'),
    );
    dataChunks.addInterpolation(
      'iNiINP',
      ['goodINP', 'niINP', 'poorINP'],
      simpleCWVInterpolationFn('INP', 'ni'),
    );
    dataChunks.addInterpolation(
      'iPoorINP',
      ['goodINP', 'niINP', 'poorINP'],
      simpleCWVInterpolationFn('INP', 'poor'),
    );

    dataChunks.addSeries('goodCWV', (bundle) => (scoreBundle(bundle) === 'good' ? bundle.weight : undefined));
    dataChunks.addSeries('poorCWV', (bundle) => (scoreBundle(bundle) === 'poor' ? bundle.weight : undefined));
    dataChunks.addSeries('niCWV', (bundle) => (scoreBundle(bundle) === 'ni' ? bundle.weight : undefined));
    dataChunks.addSeries('noCWV', (bundle) => (scoreBundle(bundle) === null ? bundle.weight : undefined));

    // interpolated series
    dataChunks.addInterpolation(
      'iGoodCWV', // name of the series
      ['goodCWV', 'niCWV', 'poorCWV', 'noCWV'], // calculate from these series
      cwvInterpolationFn('goodCWV'), // interpolation function
    );

    dataChunks.addInterpolation(
      'iNiCWV',
      ['goodCWV', 'niCWV', 'poorCWV', 'noCWV'],
      cwvInterpolationFn('niCWV'),
    );

    dataChunks.addInterpolation(
      'iPoorCWV',
      ['goodCWV', 'niCWV', 'poorCWV', 'noCWV'],
      cwvInterpolationFn('poorCWV'),
    );

    dataChunks.addInterpolation(
      'iNoCWV',
      ['goodCWV', 'niCWV', 'poorCWV', 'noCWV'],
      ({
        goodCWV, niCWV, poorCWV, noCWV,
      }) => {
        const valueCount = goodCWV.count + niCWV.count + poorCWV.count;
        if (valueCount < INTERPOLATION_THRESHOLD) {
          // not enough data to interpolate the other values, so
          // we report as if there are no CWV at all
          const totalWeight = goodCWV.weight + niCWV.weight + poorCWV.weight + noCWV.weight;
          return totalWeight;
        }
        return 0;
      },
    );
  }

  /**
   * Get breakdown facet categories based on the skyline parameter
   * @param {string} skylineParam - The skyline parameter value ('type' or 'userAgent')
   * @returns {Object} - Object with facetName and categories array
   */
  // eslint-disable-next-line class-methods-use-this
  getBreakdownConfig(skylineParam) {
    if (skylineParam === 'type') {
      return {
        facetName: 'type',
        // Extract facet value from bundle - hostType for 'type'
        extractValue: (bundle) => bundle.hostType || 'unknown',
        // Only show these categories (in order)
        categories: ['aemcs', 'helix', 'ams', 'commerce', 'unknown'],
      };
    }
    if (skylineParam === 'userAgent') {
      return {
        facetName: 'userAgent',
        // For userAgent, only use top-level categories (no colon)
        extractValue: (bundle) => {
          // Get user agent from bundle - need to determine the top-level type
          const ua = bundle.userAgent || '';
          // Only return top-level categories (mobile, desktop, bot, or undefined)
          if (ua.startsWith('mobile')) return 'mobile';
          if (ua.startsWith('desktop')) return 'desktop';
          if (ua.startsWith('bot')) return 'bot';
          return 'undefined';
        },
        categories: ['desktop', 'mobile', 'bot', 'undefined'],
      };
    }
    return null;
  }

  async draw() {
    const params = new URL(window.location).searchParams;
    const view = params.get('view');
    const domain = params.get('domain');
    // Default skyline breakdown: 'type' for aem.live:all, 'userAgent' for everything else
    const defaultSkyline = domain === 'aem.live:all' ? 'type' : 'userAgent';
    const skylineParam = params.get('skyline') || defaultSkyline;

    // eslint-disable-next-line no-unused-vars
    const startDate = params.get('startDate');
    const endDate = params.get('endDate');

    let customView = 'year';
    let unit = 'month';
    let units = 12;
    if (view === 'custom') {
      const diff = endDate ? new Date(endDate).getTime() - new Date(startDate).getTime() : 0;
      if (diff < (1000 * 60 * 60 * 24)) {
        // less than a day
        customView = 'hour';
        unit = 'hour';
        units = 24;
      } else if (diff <= (1000 * 60 * 60 * 24 * 7)) {
        // less than a week
        customView = 'week';
        unit = 'hour';
        units = Math.round(diff / (1000 * 60 * 60));
      } else if (diff <= (1000 * 60 * 60 * 24 * 31)) {
        // less than a month
        customView = 'month';
        unit = 'day';
        units = 30;
      } else if (diff <= (1000 * 60 * 60 * 24 * 365 * 3)) {
        // less than 3 years
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
        view,
        unit: 'day',
        units: 30,
        focus,
        startDate,
        endDate,
      },
      week: {
        view,
        unit: 'hour',
        units: 24 * 7,
        focus,
        startDate,
        endDate,
      },
      year: {
        view,
        unit: 'week',
        units: 52,
        focus,
        startDate,
        endDate,
      },
      custom: {
        view: customView,
        unit,
        units,
        focus,
        startDate,
        endDate,
      },
    };

    const config = configs[view];

    this.config = { ...config, ...this.config };
    this.defineSeries();

    // group by date, according to the chart config
    const group = this.dataChunks.group(this.groupBy);
    const chartLabels = Object.keys(group).sort();

    // Check if we need to break down by a facet
    const breakdownConfig = this.getBreakdownConfig(skylineParam);

    const {
      iGoodLCPs,
      iNiLCPs,
      iPoorLCPs,
      iGoodCLSs,
      iNiCLSs,
      iPoorCLSs,
      iGoodINPs,
      iNiINPs,
      iPoorINPs,
      allTraffic,
    } = Object.entries(this.dataChunks.aggregates)
      .sort(([a], [b]) => a.localeCompare(b))
      .reduce((acc, [, totals]) => {
        acc.iGoodLCPs.push(-totals.iGoodLCP.weight);
        acc.iNiLCPs.push(-totals.iNiLCP.weight);
        acc.iPoorLCPs.push(-totals.iPoorLCP.weight);
        acc.iGoodCLSs.push(-totals.iGoodCLS.weight);
        acc.iNiCLSs.push(-totals.iNiCLS.weight);
        acc.iPoorCLSs.push(-totals.iPoorCLS.weight);
        acc.iGoodINPs.push(-totals.iGoodINP.weight);
        acc.iNiINPs.push(-totals.iNiINP.weight);
        acc.iPoorINPs.push(-totals.iPoorINP.weight);
        acc.allTraffic.push(totals.pageViews.sum);
        return acc;
      }, {
        iGoodLCPs: [],
        iNiLCPs: [],
        iPoorLCPs: [],
        iGoodCLSs: [],
        iNiCLSs: [],
        iPoorCLSs: [],
        iGoodINPs: [],
        iNiINPs: [],
        iPoorINPs: [],
        allTraffic: [],
      });

    // Handle breakdown datasets for pageviews
    if (breakdownConfig) {
      const { categories, extractValue } = breakdownConfig;
      const colors = purpleShades(categories.length);

      // Calculate breakdown data for each category and time slot
      const breakdownData = {};
      categories.forEach((cat) => {
        breakdownData[cat] = [];
      });

      // For each time slot, calculate pageviews per category
      chartLabels.forEach((timeSlot) => {
        const bundles = group[timeSlot] || [];
        const categoryTotals = {};
        categories.forEach((cat) => {
          categoryTotals[cat] = 0;
        });

        bundles.forEach((bundle) => {
          const category = extractValue(bundle);
          if (categories.includes(category)) {
            categoryTotals[category] += bundle.weight;
          }
        });

        categories.forEach((cat) => {
          breakdownData[cat].push(categoryTotals[cat]);
        });
      });

      // Remove existing pageviews dataset and add breakdown datasets
      // Keep only the first dataset slot for now, we'll add breakdown datasets
      // We need to dynamically adjust the datasets array

      // Clear existing pageviews data in dataset 0
      this.chart.data.datasets[0].data = [];
      this.chart.data.datasets[0].backgroundColor = 'transparent';
      this.chart.data.datasets[0].label = 'Page Views (hidden)';

      // Check if breakdown datasets already exist, if not create them
      const existingBreakdownCount = this.chart.data.datasets
        .filter((ds) => ds.breakdownDataset).length;

      // Helper to get border radius for stacked bars
      // First category (bottom): rounded bottom, Last category (top): rounded top
      const getBorderRadius = (catIndex, total) => {
        if (catIndex === 0) {
          // Bottom of stack - rounded bottom corners only
          return {
            topLeft: 0, topRight: 0, bottomLeft: 3, bottomRight: 3,
          };
        }
        if (catIndex === total - 1) {
          // Top of stack - rounded top corners only
          return {
            topLeft: 3, topRight: 3, bottomLeft: 0, bottomRight: 0,
          };
        }
        // Middle - no rounded corners
        return {
          topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0,
        };
      };

      if (existingBreakdownCount === 0) {
        // Insert breakdown datasets at the beginning (after hidden dataset 0)
        // We need to insert them in reverse order to maintain stacking order
        categories.slice().reverse().forEach((cat, i) => {
          const colorIndex = categories.length - 1 - i;
          const catIndex = categories.length - 1 - i;
          this.chart.data.datasets.splice(1, 0, {
            label: cat,
            backgroundColor: colors[colorIndex],
            data: [],
            breakdownDataset: true, // marker to identify breakdown datasets
            yAxisID: 'y',
            borderRadius: getBorderRadius(catIndex, categories.length),
            borderSkipped: false,
            barPercentage: 1,
            categoryPercentage: 0.9,
          });
        });
      }

      // Update breakdown dataset data and border radius
      let datasetIndex = 1;
      categories.forEach((cat, catIndex) => {
        const ds = this.chart.data.datasets[datasetIndex];
        if (ds && ds.breakdownDataset) {
          ds.data = breakdownData[cat];
          ds.label = cat;
          ds.borderRadius = getBorderRadius(catIndex, categories.length);
          ds.borderSkipped = false;
          ds.barPercentage = 1;
          ds.categoryPercentage = 0.9;
        }
        datasetIndex += 1;
      });
    } else {
      // No breakdown - use original single dataset
      // Remove any breakdown datasets if they exist
      this.chart.data.datasets = this.chart.data.datasets
        .filter((ds) => !ds.breakdownDataset);

      // Restore original pageviews dataset
      this.chart.data.datasets[0].data = allTraffic;
      this.chart.data.datasets[0].label = 'Page Views';
      this.chart.data.datasets[0].backgroundColor = (context) => {
        const { chart } = context;
        const { ctx, chartArea } = chart;
        if (!chartArea) return null;
        return getGradient(ctx, chartArea, cssVariable('--spectrum-gray-800'), cssVariable('--spectrum-purple-1200'));
      };
    }

    // Helper to find dataset by label
    const findDataset = (label) => this.chart.data.datasets.find((ds) => ds.label === label);

    // Helper to set dataset data with error checking
    const setDatasetData = (label, data) => {
      const dataset = findDataset(label);
      if (dataset) {
        dataset.data = data;
      }
    };

    setDatasetData('Good LCP', iGoodLCPs);
    setDatasetData('Needs Improvement LCP', iNiLCPs);
    setDatasetData('Poor LCP', iPoorLCPs);
    setDatasetData('Good CLS', iGoodCLSs);
    setDatasetData('Needs Improvement CLS', iNiCLSs);
    setDatasetData('Poor CLS', iPoorCLSs);
    setDatasetData('Good INP', iGoodINPs);
    setDatasetData('Needs Improvement INP', iNiINPs);
    setDatasetData('Poor INP', iPoorINPs);

    this.chart.data.labels = chartLabels;
    this.chart.options.scales.x.time.unit = config.unit;
    // hack: we pretend this scale extends to the bottom as much as
    // it extends to the top, so that the chart is centered
    this.chart.options.scales.y.min = -Math.max(...allTraffic) * 0.71;
    this.chart.options.scales.y.max = Math.max(...allTraffic) * 1.0;

    this.min = this.chart.options.scales.y.min;
    this.stepSize = undefined;
    this.clsAlreadyLabeled = false;
    this.lcpAlreadyLabeled = false;

    this.chart.update();

    // add trend indicators
    const trafficTrend = linearRegression(allTraffic);
    const iGoodLCPTrend = linearRegression(iGoodLCPs);
    const iGoodCLSTrend = linearRegression(iGoodCLSs);
    const iGoodINPTrend = linearRegression(iGoodINPs);
    document.querySelector('.key-metrics #pageviews number-format').setAttribute('trend', trafficTrend.slope > 0 ? 'rising' : 'falling');
    document.querySelector('.key-metrics #lcp number-format').setAttribute('trend', iGoodLCPTrend.slope > 0 ? 'rising' : 'falling');
    document.querySelector('.key-metrics #cls number-format').setAttribute('trend', iGoodCLSTrend.slope > 0 ? 'rising' : 'falling');
    document.querySelector('.key-metrics #inp number-format').setAttribute('trend', iGoodINPTrend.slope > 0 ? 'rising' : 'falling');
  }
}
