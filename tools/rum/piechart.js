import {
  Chart,
  // eslint-disable-next-line import/no-unresolved, import/extensions
} from 'https://cdn.skypack.dev/chart.js@4.2.0';
import AbstractChart from './chart.js';

const colors = {
  'bot:social': '#ff5a3d',
  'bot:search': '#ff7c65',
  'bot:seo': '#ff7c65',
  'bot:ads': '#ff7c65',
  'bot:monitoring': '#ff7c65',
  bot: '#ff7c65',
  // desktop linux is often a hidden bot, so we group them together
  'desktop:linux': '#ffc78a',
  desktop: '#ffa037',
  'desktop:chromeos': '#ff7f00',
  'desktop:windows': '#ffb75e',
  /* a trick to group all apple devices together */
  'desktop:mac': '#ff7f00',
  'mobile:ios': '#2f995f',
  'mobile:ipados': '#6bdfb1',
  mobile: '#49cc93',
  'mobile:android': '#3eb47f',
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

    const drilldown = params.get('drilldown') || 'userAgent';

    this.dataChunks.group((bundle) => bundle[drilldown]);

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
        plugins: {
          legend: {
            display: true,
          },
        },
      },
    });
  }
}
