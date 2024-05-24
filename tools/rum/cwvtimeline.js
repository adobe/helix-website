/*
 * Implements the CWV timeline chart (currently the only chart in the RUM explorer)
 */
import {
  Chart, TimeScale, LinearScale, registerables,
  // eslint-disable-next-line import/no-unresolved, import/extensions
} from 'https://cdn.skypack.dev/chart.js@4.2.0';
// eslint-disable-next-line import/no-unresolved, import/extensions
import 'https://cdn.skypack.dev/chartjs-adapter-luxon@1.3.1';
import {
  INTERPOLATION_THRESHOLD,
  scoreBundle, scoreCWV, toHumanReadable, cwvInterpolationFn, truncate, simpleCWVInterpolationFn,
} from './utils.js';
import AbstractChart from './chart.js';

Chart.register(TimeScale, LinearScale, ...registerables);

// todo
export default class CWVTimeLineChart extends AbstractChart {
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
      // set start date depending on the unit
      const startDate = new Date(endDate);
      // roll back to beginning of time
      if (this.chartConfig.unit === 'day') startDate.setDate(endDate.getDate() - 30);
      if (this.chartConfig.unit === 'hour') startDate.setDate(endDate.getDate() - 7);
      if (this.chartConfig.unit === 'week') startDate.setMonth(endDate.getMonth() - 12);
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
            backgroundColor: 'purple',
            data: [],
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
            color: 'white',
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const { datasets } = context.chart.data;
                const value = context.parsed.y;
                const i = context.dataIndex;
                const total = datasets.reduce((pv, cv) => pv + cv.data[i], 0);

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
            display: true,
            stacked: true,
            ticks: {
              callback: (value) => toHumanReadable(value),
            },
          },
        },
      },
    });

    this.elems.canvas.parentNode.classList.remove('solitary');
    const lcpcanvas = document.getElementById('extra-chart-1');
    this.lcpchart = new Chart(lcpcanvas, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Good',
            backgroundColor: '#49cc93',
            data: [],
          },
          {
            label: 'Needs Improvement',
            backgroundColor: '#ffa037',
            data: [],
          },
          {
            label: 'Poor',
            backgroundColor: '#ff7c65',
            data: [],
          }],
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
            color: 'transparent',
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const { datasets } = context.chart.data;
                const value = context.parsed.y;
                const i = context.dataIndex;
                const total = datasets.reduce((pv, cv) => pv + cv.data[i], 0);

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
            display: false,
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
            stacked: true,
            display: false,
            offset: true,
            ticks: {
              callback: (value) => toHumanReadable(value),
            },
          },
        },
      },
    });

    const clscanvas = document.getElementById('extra-chart-2');
    this.clschart = new Chart(clscanvas, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Good',
            backgroundColor: '#49cc93',
            data: [],
          },
          {
            label: 'Needs Improvement',
            backgroundColor: '#ffa037',
            data: [],
          },
          {
            label: 'Poor',
            backgroundColor: '#ff7c65',
            data: [],
          }],
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
            color: 'transparent',
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const { datasets } = context.chart.data;
                const value = context.parsed.y;
                const i = context.dataIndex;
                const total = datasets.reduce((pv, cv) => pv + cv.data[i], 0);

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
            display: false,
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
            stacked: true,
            display: false,
            offset: true,
            ticks: {
              callback: (value) => toHumanReadable(value),
            },
          },
        },
      },
    });

    const inpcanvas = document.getElementById('extra-chart-3');
    this.inpchart = new Chart(inpcanvas, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Good',
            backgroundColor: '#49cc93',
            data: [],
          },
          {
            label: 'Needs Improvement',
            backgroundColor: '#ffa037',
            data: [],
          },
          {
            label: 'Poor',
            backgroundColor: '#ff7c65',
            data: [],
          }],
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
            color: 'transparent',
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const { datasets } = context.chart.data;
                const value = context.parsed.y;
                const i = context.dataIndex;
                const total = datasets.reduce((pv, cv) => pv + cv.data[i], 0);

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
            display: false,
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
            stacked: true,
            display: false,
            offset: true,
            ticks: {
              callback: (value) => toHumanReadable(value),
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

    // aggregate series
    if (this.chartConfig.focus === 'lcp') {
      dataChunks.addSeries('goodCWV', (bundle) => (scoreCWV(bundle.cwvLCP, 'lcp') === 'good' ? bundle.weight : undefined));
      dataChunks.addSeries('poorCWV', (bundle) => (scoreCWV(bundle.cwvLCP, 'lcp') === 'poor' ? bundle.weight : undefined));
      dataChunks.addSeries('niCWV', (bundle) => (scoreCWV(bundle.cwvLCP, 'lcp') === 'ni' ? bundle.weight : undefined));
      dataChunks.addSeries('noCWV', () => (0));
    } else if (this.chartConfig.focus === 'cls') {
      dataChunks.addSeries('goodCWV', (bundle) => (scoreCWV(bundle.cwvCLS, 'cls') === 'good' ? bundle.weight : undefined));
      dataChunks.addSeries('poorCWV', (bundle) => (scoreCWV(bundle.cwvCLS, 'cls') === 'poor' ? bundle.weight : undefined));
      dataChunks.addSeries('niCWV', (bundle) => (scoreCWV(bundle.cwvCLS, 'cls') === 'ni' ? bundle.weight : undefined));
      dataChunks.addSeries('noCWV', () => (0));
    } else if (this.chartConfig.focus === 'inp') {
      dataChunks.addSeries('goodCWV', (bundle) => (scoreCWV(bundle.cwvINP, 'inp') === 'good' ? bundle.weight : undefined));
      dataChunks.addSeries('poorCWV', (bundle) => (scoreCWV(bundle.cwvINP, 'inp') === 'poor' ? bundle.weight : undefined));
      dataChunks.addSeries('niCWV', (bundle) => (scoreCWV(bundle.cwvINP, 'inp') === 'ni' ? bundle.weight : undefined));
      dataChunks.addSeries('noCWV', () => (0));
    } else {
      dataChunks.addSeries('goodCWV', (bundle) => (scoreBundle(bundle) === 'good' ? bundle.weight : undefined));
      dataChunks.addSeries('poorCWV', (bundle) => (scoreBundle(bundle) === 'poor' ? bundle.weight : undefined));
      dataChunks.addSeries('niCWV', (bundle) => (scoreBundle(bundle) === 'ni' ? bundle.weight : undefined));
      dataChunks.addSeries('noCWV', (bundle) => (scoreBundle(bundle) === null ? bundle.weight : undefined));
    }

    // interpolated series
    dataChunks.addInterpolation(
      'iGoodCWV', // name of the series
      ['goodCWV', 'niCWV', 'poorCWV', 'noCWV'], // calculate from these series
      cwvInterpolationFn('goodCWV', this.chartConfig.focus), // interpolation function
    );

    dataChunks.addInterpolation(
      'iNiCWV',
      ['goodCWV', 'niCWV', 'poorCWV', 'noCWV'],
      cwvInterpolationFn('niCWV', this.chartConfig.focus),
    );

    dataChunks.addInterpolation(
      'iPoorCWV',
      ['goodCWV', 'niCWV', 'poorCWV', 'noCWV'],
      cwvInterpolationFn('poorCWV', this.chartConfig.focus),
    );

    dataChunks.addInterpolation(
      'iNoCWV',
      ['goodCWV', 'niCWV', 'poorCWV', 'noCWV'],
      ({
        goodCWV, niCWV, poorCWV, noCWV,
      }) => {
        const valueCount = goodCWV.count + niCWV.count + poorCWV.count;
        if (this.chartConfig.focus) {
          // we have a focus, so this series can stay at 0
          // as all other series are interpolated to 100%
          return 0;
        }
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
    const view = params.get('view') || 'week';
    // TODO re-add. I think this should be a filter
    // eslint-disable-next-line no-unused-vars
    const endDate = params.get('endDate') ? `${params.get('endDate')}T00:00:00` : null;
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
        endDate,
      },
      week: {
        view,
        unit: 'hour',
        units: 24 * 7,
        focus,
        endDate,
      },
      year: {
        view,
        unit: 'week',
        units: 52,
        focus,
        endDate,
      },
    };

    const config = configs[view];

    this.config = config;
    this.defineSeries();

    // group by date, according to the chart config
    const group = this.dataChunks.group(this.groupBy);
    const chartLabels = Object.keys(group).sort();

    const iGoodLCPs = Object.entries(this.dataChunks.aggregates)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, totals]) => totals.iGoodLCP.weight);
    const iNiLCPs = Object.entries(this.dataChunks.aggregates)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, totals]) => totals.iNiLCP.weight);
    const iPoorLCPs = Object.entries(this.dataChunks.aggregates)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, totals]) => totals.iPoorLCP.weight);
    this.lcpchart.data.datasets[0].data = iGoodLCPs;
    this.lcpchart.data.datasets[1].data = iNiLCPs;
    this.lcpchart.data.datasets[2].data = iPoorLCPs;

    const iGoodCLSs = Object.entries(this.dataChunks.aggregates)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, totals]) => totals.iGoodCLS.weight);
    const iNiCLSs = Object.entries(this.dataChunks.aggregates)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, totals]) => totals.iNiCLS.weight);
    const iPoorCLSs = Object.entries(this.dataChunks.aggregates)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, totals]) => totals.iPoorCLS.weight);
    this.clschart.data.datasets[0].data = iGoodCLSs;
    this.clschart.data.datasets[1].data = iNiCLSs;
    this.clschart.data.datasets[2].data = iPoorCLSs;

    const iGoodINPs = Object.entries(this.dataChunks.aggregates)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, totals]) => totals.iGoodINP.weight);
    const iNiINPs = Object.entries(this.dataChunks.aggregates)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, totals]) => totals.iNiINP.weight);
    const iPoorINPs = Object.entries(this.dataChunks.aggregates)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, totals]) => totals.iPoorINP.weight);
    this.inpchart.data.datasets[0].data = iGoodINPs;
    this.inpchart.data.datasets[1].data = iNiINPs;
    this.inpchart.data.datasets[2].data = iPoorINPs;

    const allTraffic = Object.entries(this.dataChunks.aggregates)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, totals]) => totals.pageViews.sum);

    this.chart.data.datasets[0].data = allTraffic;

    this.chart.data.labels = chartLabels;
    this.lcpchart.data.labels = chartLabels;
    this.clschart.data.labels = chartLabels;
    this.inpchart.data.labels = chartLabels;
    this.chart.options.scales.x.time.unit = config.unit;

    this.chart.update();
    this.lcpchart.update();
    this.clschart.update();
    this.inpchart.update();

    console.log('this.lcpchart', this.lcpchart.data);
  }
}
