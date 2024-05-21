import {
  Chart,
  // eslint-disable-next-line import/no-unresolved, import/extensions
} from 'https://cdn.skypack.dev/chart.js@4.2.0';
import AbstractChart from './chart.js';

const colors = {
  desktop: '#ffa037',
  'desktop:mac': '#ff7f00',
  'desktop:windows': '#ffb75e',
  'desktop:linux': '#ffc78a',
  mobile: '#49cc93',
  'mobile:ios': '#2f995f',
  'mobile:ipados': '#6bdfb1',
  'mobile:android': '#3eb47f',
  bot: '#ff7c65',
  'bot:social': '#ff5a3d',
};
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
      .sort(([leftkey], [rightkey]) => leftkey.localeCompare(rightkey))
      .forEach(([key, { pageViews }]) => {
        this.chart.data.labels.push(key);
        this.chart.data.datasets[0].data.push(pageViews.sum);
        this.chart.data.datasets[0].backgroundColor.push(colors[key] || '#888');
      });

    if (drilldown === 'userAgent') {
      // add a second dataset for the OS based on facets
      this.chart.data.datasets[1] = {
        data: this.dataChunks.facets.userAgent
          .sort(({ value: leftkey }, { value: rightkey }) => leftkey.localeCompare(rightkey))
          .map(({ value, weight }) => {
            if (value.includes(':')) return 0;
            return weight;
          }),
        backgroundColor: this.dataChunks.facets.userAgent
          .sort(({ value: leftkey }, { value: rightkey }) => leftkey.localeCompare(rightkey))
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
