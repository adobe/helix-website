import {
  Chart, LinearScale, registerables,
  // eslint-disable-next-line import/no-unresolved, import/extensions
} from 'chartjs';
import { utils } from '@adobe/rum-distiller';
import AbstractChart from './chart.js';
import {
  toHumanReadable, cssVariable, cwvInterpolationFn,
} from '../utils.js';

const { scoreBundle } = utils;

Chart.register(LinearScale, ...registerables);

const INTERPOLATION_THRESHOLD = 10;
export default class BarChart extends AbstractChart {
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
    let params = new URL(window.location.href).searchParams;

    if (this.dataChunks.filtered.length < 1000) {
      this.elems.lowDataWarning.ariaHidden = 'false';
    } else {
      this.elems.lowDataWarning.ariaHidden = 'true';
    }

    this.defineSeries();

    if (!params.get('drilldown')) {
      const u = new URL(window.location.href);
      u.searchParams.set('drilldown', 'url');
      window.history.replaceState({}, '', u);
      params = u.searchParams;
    }

    const drilldown = params.get('drilldown');

    const drilldowns = {
      url: (bundle) => bundle.domain || bundle.url,
      'click.source': (bundle) => bundle.events
        .filter((event) => event.checkpoint === 'click')
        .filter((event) => event.source)
        .map((event) => event.source),
      'click.target': (bundle) => bundle.events
        .filter((event) => event.checkpoint === 'click')
        .filter((event) => event.target)
        .map((event) => event.target),
    };

    const drilldownFn = (bundle) => (typeof drilldowns[drilldown] === 'function'
      ? drilldowns[drilldown](bundle)
      : bundle.events
        .filter((event) => event.checkpoint === drilldown.split('.')[0])
        .map((event) => event[drilldown.split('.')[1]])
        .filter((value) => value));

    this.dataChunks.group((bundle) => drilldownFn(bundle));
    const topgroups = Object.entries(this.dataChunks.aggregates)
      .sort(([, a], [, b]) => b.pageViews.sum - a.pageViews.sum)
      .slice(0, 30);
    this.chart.data.labels = topgroups.map(([path]) => path);

    // clear the data
    this.chart.data.datasets.forEach((dataset) => {
      dataset.data = [];
    });
    // set new data
    this.chart.data.labels.forEach((path) => {
      this.chart.data.datasets[0].data.push(this.dataChunks.aggregates[path].iNoCWV.weight);
      this.chart.data.datasets[1].data.push(this.dataChunks.aggregates[path].iGoodCWV.weight);
      this.chart.data.datasets[2].data.push(this.dataChunks.aggregates[path].iNiCWV.weight);
      this.chart.data.datasets[3].data.push(this.dataChunks.aggregates[path].iPoorCWV.weight);
    });

    this.chart.update();
  }

  render() {
    // eslint-disable-next-line no-undef
    this.chart = new Chart(this.elems.canvas, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'No CVW',
          backgroundColor: cssVariable('--spectrum-gray-600'),
          data: [],
        },
        {
          label: 'Good',
          backgroundColor: cssVariable('--spectrum-green-600'),
          data: [],
        },
        {
          label: 'Needs Improvement',
          backgroundColor: cssVariable('--spectrum-orange-600'),
          data: [],
        },
        {
          label: 'Poor',
          backgroundColor: cssVariable('--spectrum-red-600'),
          data: [],
        }],
      },
      options: {
        indexAxis: 'y',
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          customCanvasBackgroundColor: {
            color: 'white',
          },
        },
        interaction: {
          mode: 'y',
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
            stacked: true,
            ticks: {
              callback: (value) => toHumanReadable(value),
            },
          },
          y: {
            stacked: true,
            grid: {
              display: false,
            },
          },
        },
      },
    });
  }
}
