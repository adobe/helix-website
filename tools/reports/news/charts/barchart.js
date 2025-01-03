import {
  Chart, TimeScale, LinearScale, registerables,
  // eslint-disable-next-line import/no-unresolved, import/extensions
} from 'chartjs';

// eslint-disable-next-line import/no-unresolved
import 'chartjs-adapter-luxon';

import {
  toHumanReadable,
  truncate,
  cssVariable,
} from '../utils.js';

import AbstractChart from './chart.js';

Chart.register(TimeScale, LinearScale, ...registerables);

/**
 * The BarChart is a bar chart that shows overall traffic level
 * within the given date range.
 */
export default class BarChart extends AbstractChart {
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

  async draw() {
    // extract date range from url params
    const params = new URL(window.location).searchParams;
    const startDate = params.get('start');
    const endDate = params.get('end');

    // calculate time difference between end and start date
    const diff = endDate ? new Date(endDate).getTime() - new Date(startDate).getTime() : 0;

    // establish time granularity (units) based on date range
    let customView = 'year';
    let unit = 'month';
    let units = 12;

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

    // setup chart config
    const config = {
      view: customView,
      unit,
      units,
      startDate,
      endDate,
    };

    this.config = config;

    // group by calculated unit, according to chart config
    const group = this.dataChunks.group(this.groupBy);
    const chartLabels = Object.keys(group).sort();

    // aggregate page view data
    const { allTraffic } = Object.entries(this.dataChunks.aggregates)
      .sort(([a], [b]) => a.localeCompare(b))
      .reduce((acc, [, totals]) => {
        acc.allTraffic.push(totals.pageViews.sum);
        return acc;
      }, {
        allTraffic: [],
      });

    this.chart.data.datasets[0].data = allTraffic;
    this.chart.data.labels = chartLabels;
    this.chart.options.scales.x.time.unit = unit;
    this.stepSize = undefined;

    this.chart.update();
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
            backgroundColor: cssVariable('--spectrum-seafoam-500'),
            // render an empty chart to reduce blocking time?
            data: [],
          },
        ],
      },
      options: {
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (tooltip) => toHumanReadable(tooltip.parsed.y),
            },
          },
        },
        animation: {
          duration: 1300,
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
            ticks: {
              minRotation: 90,
              maxRotation: 90,
              autoSkip: false,
            },
          },
          y: {
            display: true,
            border: {
              display: false,
            },
            ticks: {
              autoSkip: false,
              maxTicksLimit: 16,
              callback: (y) => toHumanReadable(y),
            },
          },
        },
      },
    });
  }
}
