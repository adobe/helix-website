import {
  Chart, registerables,
  // eslint-disable-next-line import/no-unresolved, import/extensions
} from 'chartjs';
// eslint-disable-next-line import/no-unresolved, import/extensions
import ChartDataLabels from 'chartjs-plugin-datalabels';
import AbstractChart from './chart.js';
import { cssVariable } from '../utils.js';

Chart.register(...registerables, ChartDataLabels);

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

function colorFor(value, allValues, ringIndex) {
  if (!value) {
    return cssVariable('--spectrum-gray-100');
  }
  const basecolors = ['chartreuse', 'purple', 'green', 'seafoam', 'cyan', 'indigo', 'celery', 'fuchsia', 'magenta', 'red', 'orange', 'yellow', 'blue'];
  const innerValues = allValues.filter((v) => !v.includes(':'));
  const valueIndex = innerValues.indexOf(value.split(':')[0]);
  const sameBaseIndex = allValues
    .filter((v) => v.split(':')[0] === value.split(':')[0])
    .indexOf(value);
  const basecolor = basecolors[valueIndex % basecolors.length] || 'yellow';
  const baseShade = 100;
  // each ring is 400 shades darker than the previous
  const ringShade = (700 * ringIndex) % 1000;
  // each value within a ring is 100 shades lighter than the previous
  const valueShade = (100 * sameBaseIndex) % 500;

  const shade = baseShade + ringShade + valueShade;
  // eslint-disable-next-line no-console
  console.log('colorFor', value, basecolor, baseShade, ringShade, valueShade, shade);
  return cssVariable(`--spectrum-${basecolor}-${shade}`);
}

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

    if (this.dataChunks.filtered.length < 1000) {
      this.elems.lowDataWarning.ariaHidden = 'false';
    } else {
      this.elems.lowDataWarning.ariaHidden = 'true';
    }

    const u = new URL(window.location.href);
    if (!params.get('drilldown')) {
      u.searchParams.set('drilldown', 'userAgent');
      window.history.replaceState({}, '', u);
    }
    const drilldown = params.get('drilldown');

    const grfn = (bundle) => bundle[drilldown];

    if (drilldown === 'userAgent') {
      grfn.fillerFn = (existing) => Object.keys(colors)
        .filter((key) => !key.includes(':'))
        .concat(existing);
    }
    this.dataChunks.group(grfn);

    this.chart.data.labels = [];
    this.chart.data.datasets[0].data = [];
    this.chart.data.datasets[0].backgroundColor = [];
    const values = this.dataChunks.facets[drilldown].map(({ value }) => value);
    const rings = Math.max(...values
      .filter((value) => value.includes(':'))
      .filter((value) => !value.startsWith('http://') && !value.startsWith('https://'))
      .map((value) => value.split(':').length));

    this.chart.data.labels = values
      .sort((a, b) => sortByUAClass(a, b));
    for (let i = 0; i < rings; i += 1) {
      this.chart.data.datasets[i] = {
        data: this.dataChunks.facets[drilldown]
          .map(({ value, weight }) => {
            if (rings === 1) return { value, weight };
            if (value.split(':').length === rings - i) return { value, weight };
            return { value, weight: 0 };
          })
          .sort((a, b) => sortByUAClass(a.value, b.value))
          .map(({ weight }) => weight),
        backgroundColor: this.dataChunks.facets[drilldown]
          .map(({ value }) => value)
          .sort((a, b) => sortByUAClass(a, b))
          .map((value) => colorFor(value, values, i)),
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
            display: false,
          },
          datalabels: {
            labels: {
              value: null,
              title: {
                formatter: (value, context) => {
                  if (value === 0) return '';
                  return context.chart.data.labels[context.dataIndex];
                },
                anchor: 'end',
                color: 'black',
                display: 'auto',
                align: 'start',
                offset: 10,
                font: {
                  size: 18,
                  family: 'Adobe Clean, sans-serif',
                },
              },
            },
          },
        },
      },
    });
  }
}
