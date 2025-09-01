import {
  Chart, TimeScale, LinearScale, registerables,
  // eslint-disable-next-line import/no-unresolved, import/extensions
} from 'chartjs';
// eslint-disable-next-line import/no-unresolved, import/extensions
import 'chartjs-adapter-luxon';
import {
  utils,
} from '@adobe/rum-distiller';
import AbstractChart from './chart.js';
import {
  truncate,
  cssVariable,
  cwvInterpolationFn,
  INTERPOLATION_THRESHOLD,
} from '../utils.js';

const {
  scoreBundle,
} = utils;

Chart.register(TimeScale, LinearScale, ...registerables);

/**
 * The CWVPerfChart is a unique type of multi-series bar chart that
 * shows both the overall traffic levels as well as the distribution
 * of each of the three core web vitals values within the given date
 * range.
 */
export default class CWVPerfChart extends AbstractChart {
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

      existing.sort((a, b) => new Date(a) - new Date(b));
      const slots = new Set(existing);
      // because of timezones (visitor timezone vs slot utc), some slots might be out of range
      // this causes the last slot on the x index to be get no data, so we need to remove them.
      slots.forEach((slot) => {
        const slotDate = new Date(slot);
        if (slotDate < startDate || slotDate > endDate) {
          slots.delete(slot);
        }
      });
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
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Good CWV',
            backgroundColor: cssVariable('--spectrum-green-600'),
            borderColor: cssVariable('--spectrum-green-600'),
            tension: 0.2,
            pointRadius: 0,
            data: [],
          },
          {
            label: 'Needs Improvement CWV',
            backgroundColor: cssVariable('--spectrum-orange-600'),
            borderColor: cssVariable('--spectrum-orange-600'),
            tension: 0.2,
            pointRadius: 0,
            data: [],
          },
          {
            label: 'Poor CWV',
            backgroundColor: cssVariable('--spectrum-red-600'),
            borderColor: cssVariable('--spectrum-red-600'),
            tension: 0.2,
            pointRadius: 0,
            data: [],
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          customCanvasBackgroundColor: {
            color: 'white',
          },
          tooltip: {
            intersect: false,
            callbacks: {
              label: (context) => {
                const value = context.parsed.y;

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
            },
          },
          y: {
            display: false,
            stacked: false,
            border: {
              display: false,
            },
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

  async draw() {
    const params = new URL(window.location).searchParams;
    const view = params.get('view');

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

    const {
      iGoodCWVs,
      iNiCWVs,
      iPoorCWVs,
    } = Object.entries(this.dataChunks.aggregates)
      .sort(([a], [b]) => a.localeCompare(b))
      .reduce((acc, [, totals]) => {
        const t = (totals.iGoodCWV.weight + totals.iNiCWV.weight + totals.iPoorCWV.weight) || 1;
        acc.iGoodCWVs.push(totals.iGoodCWV.weight / t);
        acc.iNiCWVs.push(totals.iNiCWV.weight / t);
        acc.iPoorCWVs.push(totals.iPoorCWV.weight / t);
        return acc;
      }, {
        iGoodCWVs: [],
        iNiCWVs: [],
        iPoorCWVs: [],
      });

    this.chart.data.datasets[0].data = iGoodCWVs;
    this.chart.data.datasets[1].data = iNiCWVs;
    this.chart.data.datasets[2].data = iPoorCWVs;

    this.chart.data.labels = chartLabels;
    this.chart.options.scales.x.time.unit = config.unit;

    this.min = this.chart.options.scales.y.min;
    this.stepSize = undefined;
    this.clsAlreadyLabeled = false;
    this.lcpAlreadyLabeled = false;

    this.chart.update();
  }
}
