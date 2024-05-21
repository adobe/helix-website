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
    label: 'trafficsource',
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
        return `referrer:${refhost}`;
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
      color: 'lightgreen',
    },
  },
  {
    label: 'traffictype',
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
    label: 'entryevent',
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
      color: 'lightgreen',
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'enter')
        .length > 0,
      next: ['top', '404'],
    },
    navigate: {
      color: 'green',
      label: (bundle) => {
        const nav = bundle.events.filter((e) => e.checkpoint === 'navigate')
          .map((e) => new URL(e.source).pathname)
          .pop();
        return `navigate:${nav}`;
      },
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'navigate')
        .length > 0,
      next: ['top', '404'],
    },
  },
  {
    label: 'pagetype',
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
    label: 'loadtype',
    /*
     * 4.  How is the page being loaded
     *   - partial (no lazy or lcp fired)
     *   - complete
     *   - aborted (leave before complete, no more events)
     */
    load: {
      color: 'darkgreen',
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
    label: 'contenttype',
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
      next: ['click', 'formsubmit', 'nointeraction'],
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
    label: 'interaction',
    /*
     * 6.  What kind of interaction happened
     * - click
     * - formsubmit
     * - none
     */
    click: {
      color: 'darkgreen',
      label: 'Click',
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'click')
        .length > 0,
      next: ['blind', 'intclick', 'extclick', 'media'],
    },
    formsubmit: {
      color: 'green',
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
    label: 'clicktarget',
    /*
     * 7.  What's the type of click target
     * - blind (no href)
     * - domain (external)
     * - page (internal)
     * - media (media)
     */
    media: {
      label: 'Media Click',
      next: [],
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'click')
        .filter((e) => e.target && e.target.indexOf('media_') > -1)
        .length > 0,
    },
    extclick: {
      label: 'External Click',
      color: 'purple',
      next: ['external:*'],
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'click')
        .filter((e) => e.target && e.target.startsWith('http'))
        .filter((e) => new URL(e.target).hostname !== new URL(bundle.url).hostname)
        .length > 0,
    },

    intclick: {
      label: 'Internal Click',
      color: 'green',
      next: ['internal:*'],
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
    label: 'exit',
    /*
     * 8. What's the click target, specifically
     */
    internal: {
      color: 'green',
      next: [],
      label: (bundle) => bundle.events.filter((e) => e.checkpoint === 'click')
        .filter((e) => !!e.target)
        .map((e) => new URL(e.target))
        .map((u) => u.pathname)
        .map((p) => `internal:${p}`)
        .pop(),
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'click')
        .filter((e) => !!e.target)
        .filter((e) => e.target.indexOf('media_') === -1)
        .filter((e) => new URL(e.target).hostname === new URL(bundle.url).hostname)
        .length > 0,
    },
    external: {
      color: 'purple',
      next: [],
      label: (bundle) => bundle.events.filter((e) => e.checkpoint === 'click')
        .filter((e) => !!e.target)
        .map((e) => new URL(e.target))
        .map((u) => u.hostname)
        .map((h) => `external:${h}`)
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
    const params = new URL(window.location.href).searchParams;
    this.chartConfig.focus = params.get('focus');

    if (this.dataChunks.filtered.length < 1000) {
      this.elems.lowDataWarning.ariaHidden = 'false';
    } else {
      this.elems.lowDataWarning.ariaHidden = 'true';
    }

    const MAX_FACETS = 7;
    this.dataChunks.group((bundle) => {
      const detectedFlows = [];
      // go through each stage
      stages.forEach((stage) => {
        let cont = false;
        // go through each flow step in the stage
        Object.entries(stage)
          .filter(([key]) => key !== 'label')
          .forEach(([key, step]) => {
          // if we already detected a flow, skip the rest
            if (cont) return;
            if (step.detect(bundle)) {
              const flowLabel = typeof step.label === 'function' ? step.label(bundle) : key;
              const flowValue = typeof step.label === 'function' ? step.label(bundle) : step.label;
              if (stage.label
                && Object.entries(this.dataChunks.facets[stage.label]).length > MAX_FACETS) {
                // we have too many facets, so we need to group some
                if (this.dataChunks.facets[stage.label]
                  .slice(0, MAX_FACETS)
                  .map(({ value }) => value)
                  .includes(flowValue)) {
                  // the top N values are shown as is
                  detectedFlows.push(flowLabel);
                } else {
                  // console.assert(key !== 'reload', this.dataChunks.facets[stage.label]);
                  // the rest is grouped into 'other'
                  detectedFlows.push(`${key}:other`);
                }
              } else {
                detectedFlows.push(flowLabel);
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
          const first = pair[0].split(':')[0];
          const second = pair[1].split(':')[0];

          if (allStages[first] && Array.isArray(allStages[first].next)) {
            if (allStages[first].next.includes(second)) {
              // console.log('explicit allow', pair[0], '->', pair[1]);
              return true;
            } if (allStages[first].next
              .filter((n) => n.endsWith(':*'))
              .map((n) => n.slice(0, -2))
              .includes(second)) {
              // console.log('wildcard allow', pair[0], '->', pair[1]);
              return true;
            }
            // console.log('forbidding', pair[0], '->', pair[1]);
            return false;
          }
          // console.log('implicit allow', pair[0], '->', pair[1]);
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
        const [prefix, suffix] = key.split(':');
        if (allStages[key] && allStages[key].label && typeof allStages[key].label === 'string') {
          acc[key] = allStages[key].label;
        } else if (allStages[prefix] && allStages[prefix].label) {
          acc[key] = suffix;
        } else {
          acc[key] = key;
        }
        return acc;
      }, {});
    if (this.dataChunks.facets.contenttype?.length < 2) {
      // console.log('setting contenttype label');
      this.labels.nocontent = 'Default Content';
    }

    this.columns = {} || Object.keys(this.dataChunks.aggregates)
      .map((flow) => flow.split('->'))
      .flat()
      .reduce((acc, key) => {
        stages.forEach((stage, column) => {
          if (stage[key]) {
            acc[key] = column + 1;
          }
        });
        return acc;
      }, {});

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
    this.chart = new Chart(this.elems.canvas, {
      type: 'sankey',
      data: {
        datasets: [{
          label: 'My sankey',
          data: this.enriched,
          labels: this.labels,
          colorFrom: ({ raw }) => allStages[raw.from.split(':')[0]]?.color || 'purple',
          colorTo: ({ raw }) => allStages[raw.to.split(':')[0]]?.color || 'gray',
          columns: this.columns,
          colorMode: 'gradient', // or 'from' or 'to'

          /* optional column overrides */
          size: 'max',
        }],
      },
    });
  }

  // eslint-disable-next-line class-methods-use-this
  updateDataFacets(dataChunks) {
    const facetcandidates = stages.filter((stage) => stage.label);

    facetcandidates.forEach((facet) => {
      dataChunks.addFacet(facet.label, (bundle) => Object.entries(facet)
        .filter(([key]) => key !== 'label')
        .reduce((acc, [key, step]) => {
          if (acc.length > 0) return acc;
          if (step.detect(bundle)) {
            acc.push(typeof step.label === 'function' ? step.label(bundle) : step.label || key);
          }
          return acc;
        }, []));
    });
  }

  render() {
    this.draw();

    if (this.enriched.length > 0) {
      this.buildChart();
    } else {
      // console.log('no data yet, skipping charting');
    }
  }
}
