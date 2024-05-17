import {
  SankeyController, Flow,
  // eslint-disable-next-line import/extensions, import/no-unresolved
} from 'https://esm.run/chartjs-chart-sankey';
import AbstractChart from './chart.js';

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
// modeling the flow of events
const stages = [
  {
    /*
     *  1.  Where is the traffic coming from:
     *   - referrer (can be domain or page)
     *   - direct
     */
    referrer: {
      label: (bundle) => {
        const refhost = bundle.events.filter((e) => e.checkpoint === 'enter')
          .filter((e) => e.source.startsWith('http'))
          .map((e) => new URL(e.source).hostname)
          .pop();
        if (refhost.includes('google')) return 'Google';
        if (refhost.includes('facebook')) return 'Facebook';
        if (refhost.includes('twitter')) return 'Twitter';
        return 'Other Referrer';
      },
      color: 'purple',
      // detection function
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'enter')
        .filter((e) => e.source.startsWith('http'))
        .length > 0,
      next: ['organic', 'campaign'],
    },
    direct: {
      label: 'Direct',
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'enter')
        .filter((e) => !e.source.startsWith('http'))
        .length > 0,
      next: ['organic', 'campaign'],
      color: 'green',
    },
  },
  {
    /*
     * 1.5 What kind of traffic is it:
     *   - organic
     *  - campaign (utm params present)
     */
    organic: {
      label: 'Organic',
      color: 'green',
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'utm')
        .length === 0,
      next: ['enter'],
    },
    campaign: {
      label: 'Campaign',
      color: 'darkred',
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'utm')
        .length > 0,
      next: ['enter'],
    },
  },
  {
    /*
     * 2.  What kind of entry event is it:
     *   - reload
     *   - back_forward
     *   - enter
     *   - navigate
     */
    reload: {
      label: 'Reload',
      color: 'gray',
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'reload')
        .length > 0,
      next: ['top', '404'],
    },
    back_forward: {
      color: 'gray',
      label: 'Back/Forward',
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'back_forward')
        .length > 0,
      next: ['top', '404'],
    },
    enter: {
      label: 'Enter',
      color: 'green',
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'enter')
        .length > 0,
      next: ['top', '404'],
    },
    navigate: {
      color: 'green',
      label: 'Internal Navigation',
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'navigate')
        .length > 0,
      next: ['top', '404'],
    },
  },
  {
    /*
     * 3.  What kind of page is it
     *   - normal
     *   - 404
     */
    top: {
      label: 'Content Page',
      color: 'green',
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === '404')
        .length === 0,
      next: ['load', 'partial', 'aborted'],
    },
    404: {
      label: '404',
      color: 'black',
      next: [],
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === '404')
        .length > 0,
    },
  },
  {
    /*
     * 4.  How is the page being loaded
     *   - partial (no lazy or lcp fired)
     *   - complete
     *   - aborted (leave before complete, no more events)
     */
    load: {
      color: 'green',
      label: 'Complete Load',
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'lcp' || e.checkpoint === 'lazy')
        .length > 0,
      next: ['nocontent', 'initial', 'engaged', 'experiment'],
    },
    partial: {
      color: 'orange',
      label: 'Partial Load',
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'lcp' || e.checkpoint === 'lazy')
        .length === 0,
      next: ['nocontent', 'initial', 'engaged', 'experiment'],
    },
    aborted: {
      color: 'black',
      label: 'Aborted Load',
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'top')
        .length === 0,
      next: [],
    },
  },
  {
    /*
     * 5.  What kind of content was consumed
      *  - none (no media or block whatsoever)
      *  - intital (<=3 media or blocks)
      *  - engaged (>3 media or blocks)
      *  - experiment
      */
    nocontent: {
      label: 'No Content',
      color: 'black',
      next: [],
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'viewmedia' || e.checkpoint === 'viewblock')
        .length === 0,
    },
    experiment: {
      label: 'Experiment',
      color: 'red',
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'experiment')
        .length > 0,
      next: ['click', 'formsubmit', 'nointeraction'],
    },
    initial: {
      label: 'Initial Content',
      color: 'lightgreen',
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'viewmedia' || e.checkpoint === 'viewblock')
        .length <= 3,
      next: ['click', 'formsubmit', 'nointeraction'],
    },
    engaged: {
      color: 'green',
      label: 'Engaged Content',
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'viewmedia' || e.checkpoint === 'viewblock')
        .length > 3,
      next: ['click', 'formsubmit', 'nointeraction'],
    },
  },
  {
  /*
   * 6.  What kind of interaction happened
   * - click
   * - formsubmit
   * - none
   */
    click: {
      color: 'green',
      label: 'Click',
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'click')
        .length > 0,
      next: ['blind', 'internal', 'external', 'media'],
    },
    formsubmit: {
      label: 'Form Submit',
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'formsubmit')
        .length > 0,
    },
    nointeraction: {
      label: 'No Interaction',
      color: 'black',
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'click'
          || e.checkpoint === 'formsubmit')
        .length === 0,
    },
  },
  {
    /*
     * 7.  What's the type of click target
     * - blind (no href)
     * - domain (external)
     * - page (internal)
     * - media (media)
     */
    media: {
      label: 'Media Click',
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'click')
        .filter((e) => e.target && e.target.indexOf('media_') > -1)
        .length > 0,
    },
    external: {
      label: 'External Click',
      color: 'purple',
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'click')
        .filter((e) => e.target && e.target.startsWith('http'))
        .filter((e) => new URL(e.target).hostname !== new URL(bundle.url).hostname)
        .length > 0,
    },

    internal: {
      label: 'Internal Click',
      color: 'green',
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'click')
        .filter((e) => !!e.target)
        .filter((e) => new URL(e.target).hostname === new URL(bundle.url).hostname)
        .length > 0,
    },
    blind: {
      label: 'Blind Click',
      color: 'gray',
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'click')
        .filter((e) => !e.target)
        .length > 0,
    },
  },
  {
    /*
     * 8. What's the click target, specifically
     */
    outclick: {
      label: (bundle) => 'Other' || bundle.events.filter((e) => e.checkpoint === 'click')
        .filter((e) => !!e.target)
        .map((e) => new URL(e.target))
        .map((t) => (t.hostname === new URL(bundle.url).hostname
          ? t.pathname
          : t.hostname))
        .pop(),
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'click')
        .filter((e) => e.target)
        .filter((e) => e.target.indexOf('media_') === -1)
        // only external links for now
        .filter((e) => new URL(e.target).hostname !== new URL(bundle.url).hostname)
        .length > 0,
    },
  },
];
const allStages = stages.reduce((acc, stage) => ({ ...acc, ...stage }), {});
export default class SankeyChart extends AbstractChart {
  async draw() {
    console.log('draw');
    const params = new URL(window.location.href).searchParams;
    this.chartConfig.focus = params.get('focus');

    if (this.dataChunks.filtered.length < 1000) {
      this.elems.lowDataWarning.ariaHidden = 'false';
    } else {
      this.elems.lowDataWarning.ariaHidden = 'true';
    }

    this.dataChunks.group((bundle) => {
      const detectedFlows = [];
      // go through each stage
      stages.forEach((stage) => {
        let cont = false;
        // go through each flow step in the stage
        Object.entries(stage).forEach(([key, step]) => {
          // if we already detected a flow, skip the rest
          if (cont) return;
          if (step.detect(bundle)) {
            if (typeof step.label === 'function') {
              detectedFlows.push(step.label(bundle));
              cont = true;
            } else {
              detectedFlows.push(key);
              cont = true;
            }
          }
        });
      });
      // split into pairs
      const pairs = detectedFlows
        .map((flow, i, arr) => [arr[i - 1], flow])
        // filter out start and end nodes
        .filter((pair) => pair.length === 2 && pair[0] && pair[1])
        // filter out forbidden pairs
        .filter((pair) => {
          if (allStages[pair[0]] && Array.isArray(allStages[pair[0]].next)) {
            return allStages[pair[0]].next.includes(pair[1]);
          }
          return true;
        })
        .map((pair) => pair.join('->'));
      return pairs;
    });
    this.enriched = Object.entries(this.dataChunks.aggregates)
      .map(([flow, { pageViews }]) => ({
        from: flow.split('->')[0],
        to: flow.split('->')[1],
        flow: pageViews.sum,
      }));

    this.labels = Object.keys(this.dataChunks.aggregates)
      .map((flow) => flow.split('->'))
      .flat()
      .reduce((acc, key) => {
        if (allStages[key] && allStages[key].label && typeof allStages[key].label === 'string') {
          acc[key] = allStages[key].label;
        } else {
          acc[key] = key;
        }
        return acc;
      }, {});

    this.columns = {} || Object.keys(this.dataChunks.aggregates)
      .map((flow) => flow.split('->'))
      .flat()
      .reduce((acc, key) => {
        stages.forEach((stage, column) => {
          console.log('finding column for', key, column, stage);
          if (stage[key]) {
            acc[key] = column + 1;
          }
        });
        return acc;
      }, {});
    console.log('this.columns', this.columns);

    if (this.chart && this.chart.data && this.dataChunks.bundles.length > 0) {
      this.chart.data.datasets[0].data = this.enriched;
      this.chart.data.labels = this.labels;
      this.chart.data.columns = this.columns;
      // const drilldown = params.get('drilldown') || 'checkpoint';
      this.chart.update();
    } else if (this.dataChunks.bundles.length > 0) {
      this.buildChart();
    }
  }

  buildChart() {
    console.log('charting', this.enriched);
    this.chart = new Chart(this.elems.canvas, {
      type: 'sankey',
      data: {
        datasets: [{
          label: 'My sankey',
          data: this.enriched,
          labels: this.labels,
          colorFrom: ({ raw }) => allStages[raw.from]?.color || 'purple',
          colorTo: ({ raw }) => allStages[raw.to]?.color || 'gray',
          columns: this.columns,
          colorMode: 'gradient', // or 'from' or 'to'

          /* optional column overrides */
          size: 'max',
        }],
      },
    });
  }

  render() {
    this.draw();

    if (this.enriched.length > 0) {
      this.buildChart();
    } else {
      console.log('no data yet, skipping charting');
    }
  }
}
