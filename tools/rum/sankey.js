import {
  SankeyController, Flow,
  // eslint-disable-next-line import/extensions, import/no-unresolved
} from 'https://esm.run/chartjs-chart-sankey';
import AbstractChart from './chart.js';

console.log('SankeyChart', SankeyController);

const { Chart } = window;

Chart.register(SankeyController, Flow);

/*
* Some popular checkpoints
    'loadresource',
'cwv',
'click',
'top',
'lazy',
'viewmedia',
'viewblock',
'leave',
'load',
'enter',
// 'pagesviewed',
'error',
'navigate',
'utm',
'reload',
'back_forward',
'lcp',
'missingresource',
*/
const knownCheckpoints = {
  reload: {
    label: 'Reload',
    color: 'orange',
    next: ['top'],
  },
  back_forward: {
    label: 'Back/Forward',
    color: 'yellow',
    next: ['top'],
  },
  enter: {
    label: 'Enter',
    color: 'red',
    next: ['top'],
  },
  click: {
    label: 'Click',
    color: 'blue',
    next: ['leave', 'navigate'],
  },
  leave: {
    label: 'Leave',
    color: 'cyan',
    next: [],
  },
  navigate: {
    label: 'Navigate',
    color: 'magenta',
    next: [],
  },
  top: {
    label: 'Top',
    color: 'green',
    next: ['click', 'lazy', 'lcp', '404', 'viewmedia', 'viewblock'],
  },
  404: {
    label: '404',
    color: 'black',
    next: ['top'],
  },
  viewmedia: {
    label: 'View Media',
    color: 'pink',
    next: ['click'],
  },
  viewblock: {
    label: 'View Block',
    color: 'brown',
    next: ['viewmedia'],
  },
};
export default class SankeyChart extends AbstractChart {
  async draw() {
    const params = new URL(window.location.href).searchParams;
    this.chartConfig.focus = params.get('focus');

    if (this.dataChunks.filtered.length < 1000) {
      this.elems.lowDataWarning.ariaHidden = 'false';
    } else {
      this.elems.lowDataWarning.ariaHidden = 'true';
    }

    const checkpointcombos = Object.entries(knownCheckpoints)
      .map(([from, { next }]) => next.map((to) => ({ from, to })))
      .flat();
    this.enriched = checkpointcombos;

    this.dataChunks.group((bundle) => {
      const detectedFlows = [];
      checkpointcombos.forEach(({ from, to }) => {
        let foundFrom = false;
        bundle.events
          .filter(({ checkpoint }) => Object.keys(knownCheckpoints).includes(checkpoint))
          .forEach((event) => {
            if (event.checkpoint === from) {
              foundFrom = true;
            }
            if (foundFrom && event.checkpoint === to) {
              detectedFlows.push(`${from}-${to}`);
            }
          });
      });
      return detectedFlows;
    });
    if (this.dataChunks.filtered.length) {
      this.enriched = Object.entries(this.dataChunks.aggregates)
        .map(([key, value]) => {
          const [from, to] = key.split('-');
          return {
            from,
            to,
            // this is a super naive assumption that the flow is
            // all pageviews. In reality, we need something like an
            // 'end' event to know when the flow ends.
            // also, we need to attribute incomplete flows
            flow: value.pageViews.sum,
          };
        });
    }

    if (this.chart && this.chart.data) {
      this.chart.data.datasets[0].data = this.enriched;
      // const drilldown = params.get('drilldown') || 'checkpoint';
      this.chart.update();
    }
  }

  render() {
    const getColor = (key) => knownCheckpoints[key]?.color || 'teal';
    this.draw();

    this.chart = new Chart(this.elems.canvas, {
      type: 'sankey',
      data: {
        datasets: [{
          label: 'My sankey',
          data: this.enriched,
          labels: Object.fromEntries(Object
            .entries(knownCheckpoints)
            .map(([key, { label }]) => [key, label])),
          colorFrom: (c) => getColor(c.dataset.data[c.dataIndex].from),
          colorTo: (c) => getColor(c.dataset.data[c.dataIndex].to),
          colorMode: 'gradient', // or 'from' or 'to'
          /* optional column overrides */
          size: 'max', // or 'min' if flow overlap is preferred
        }],
      },
    });
  }
}
