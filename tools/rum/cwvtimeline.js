/*
 * Implements the CWV timeline chart (currently the only chart in the RUM explorer)
 */
import {
  toISOStringWithTimezone,
  INTERPOLATION_THRESHOLD,
  scoreBundle, scoreCWV, toHumanReadable, cwvInterpolationFn,
} from './utils.js';
import AbstractChart from './chart.js';
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
      slotTime.setMinutes(0);
      slotTime.setSeconds(0);
      if (this.chartConfig.unit === 'day' || this.chartConfig.unit === 'week' || this.chartConfig.unit === 'month') slotTime.setHours(0);
      if (this.chartConfig.unit === 'week') slotTime.setDate(slotTime.getDate() - slotTime.getDay());
      if (this.chartConfig.unit === 'month') slotTime.setDate(1);
      return toISOStringWithTimezone(slotTime);
    };

    groupFn.fillerFn = () => {
      const endDate = this.chartConfig.endDate ? new Date(this.chartConfig.endDate) : new Date();
      // set start date depending on the unit
      const startDate = new Date(endDate);
      if (this.chartConfig.unit === 'day') startDate.setDate(endDate.getDate() - 30);
      if (this.chartConfig.unit === 'week') startDate.setDate(endDate.getDate() - 7);
      if (this.chartConfig.unit === 'month') startDate.setMonth(endDate.getMonth() - 12);
      const slots = new Set();
      const slotTime = new Date(startDate);
      slotTime.setMinutes(0);
      slotTime.setSeconds(0);
      if (this.chartConfig.unit === 'day' || this.chartConfig.unit === 'week' || this.chartConfig.unit === 'month') slotTime.setHours(0);
      while (slotTime <= endDate) {
        slots.add(toISOStringWithTimezone(slotTime));
        if (this.chartConfig.unit === 'day') slotTime.setDate(slotTime.getDate() + 1);
        if (this.chartConfig.unit === 'week') slotTime.setDate(slotTime.getDate() + 7);
        if (this.chartConfig.unit === 'month') slotTime.setMonth(slotTime.getMonth() + 1);
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
        datasets: [{
          label: 'No CVW',
          backgroundColor: '#888',
          data: [],
        },
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
            stacked: true,
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

    const iGoodCWVs = Object.entries(this.dataChunks.aggregates)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, totals]) => totals.iGoodCWV.weight);

    const iNiCWVs = Object.entries(this.dataChunks.aggregates)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, totals]) => totals.iNiCWV.weight);

    const iPoorCWVs = Object.entries(this.dataChunks.aggregates)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, totals]) => totals.iPoorCWV.weight);

    const iNoCWVs = Object.entries(this.dataChunks.aggregates)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, totals]) => totals.iNoCWV.weight);

    this.chart.data.datasets[1].data = iGoodCWVs;
    this.chart.data.datasets[2].data = iNiCWVs;
    this.chart.data.datasets[3].data = iPoorCWVs;
    this.chart.data.datasets[0].data = iNoCWVs;

    this.chart.data.labels = chartLabels;
    this.chart.options.scales.x.time.unit = config.unit;
    this.chart.update();
  }
}
