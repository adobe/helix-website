import {
  Chart, registerables,
  // eslint-disable-next-line import/no-unresolved, import/extensions
} from 'chartjs';
import AbstractChart from './chart.js';
import { cssVariable } from '../utils.js';

Chart.register(...registerables);

const colors = {
  'bot:social': cssVariable('--spectrum-red-100'),
  'bot:search': cssVariable('--spectrum-red-300'),
  'bot:seo': cssVariable('--spectrum-red-600'),
  'bot:ads': cssVariable('--spectrum-red-800'),
  'bot:monitoring': cssVariable('--spectrum-red-1000'),
  bot: cssVariable('--spectrum-red-1300'),
  // desktop linux is often a hidden bot, so we group them together
  'desktop:linux': cssVariable('--spectrum-magenta-900'),
  desktop: cssVariable('--spectrum-fuchsia-1300'),
  'desktop:chromeos': cssVariable('--spectrum-fuchsia-900'),
  'desktop:windows': cssVariable('--spectrum-fuchsia-600'),
  /* a trick to group all apple devices together */
  'desktop:mac': cssVariable('--spectrum-fuchsia-300'),
  'mobile:ios': cssVariable('--spectrum-seafoam-300'),
  'mobile:ipados': cssVariable('--spectrum-seafoam-500'),
  mobile: cssVariable('--spectrum-seafoam-1300'),
  'mobile:android': cssVariable('--spectrum-seafoam-900'),
};

function sortByUAClass(left, right) {
  if (colors[left] || colors[right]) {
    return Object.keys(colors).indexOf(left) - Object.keys(colors).indexOf(right);
  }
  return left.localeCompare(right);
  // if left and right are in the colors object, sort by key order
}
export default class PieChart extends AbstractChart {
  async draw() {
    const params = new URL(window.location.href).searchParams;
    this.chartConfig.focus = params.get('focus');

    if (this.dataChunks.filtered.length < 1000) {
      this.elems.lowDataWarning.ariaHidden = 'false';
    } else {
      this.elems.lowDataWarning.ariaHidden = 'true';
    }

    if (!params.get('drilldown')) {
      const u = new URL(window.location.href);
      u.searchParams.set('drilldown', 'userAgent');
      window.history.replaceState({}, '', u);
    }
    const drilldown = params.get('drilldown');

    const grfn = (bundle) => bundle[drilldown];
    if (drilldown === 'userAgent') {
      grfn.fillerFn = (existing) => Object.keys(colors).filter((key) => !key.includes(':')).concat(existing);
    }
    this.dataChunks.group(grfn);

    this.chart.data.labels = [];
    this.chart.data.datasets[0].data = [];
    this.chart.data.datasets[0].backgroundColor = [];
    Object.entries(this.dataChunks.aggregates)
      .sort(([leftkey], [rightkey]) => sortByUAClass(leftkey, rightkey))
      .forEach(([key, { pageViews }]) => {
        this.chart.data.labels.push(key);
        this.chart.data.datasets[0].data.push(pageViews.sum);
        this.chart.data.datasets[0].backgroundColor.push(colors[key] || '#888');
      });

    if (drilldown === 'userAgent') {
      // add a second dataset for the OS based on facets
      this.chart.data.datasets[1] = {
        data: this.dataChunks.facets.userAgent
          .sort(({ value: leftkey }, { value: rightkey }) => sortByUAClass(leftkey, rightkey))
          .map(({ value, weight }) => {
            if (value.includes(':')) return 0;
            return weight;
          }),
        backgroundColor: this.dataChunks.facets.userAgent
          .sort(({ value: leftkey }, { value: rightkey }) => sortByUAClass(leftkey, rightkey))
          .map(({ value }) => {
            if (value.includes(':')) return 0;
            return colors[value] || '#888';
          }),
      };
    }

    this.chart.update();
  }

  render() {
    this.chart = new Chart(this.elems.canvas, {
      type: 'pie',
      data: {
        labels: [],
        datasets: [{}],
      },
      options: {
        borderRadius: 10,
        borderWidth: 3,
        plugins: {
          legend: {
            display: true,
          },
        },
      },
    });
  }
}
