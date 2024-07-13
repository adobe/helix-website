// eslint-disable-next-line import/no-unresolved
import { SankeyController, Flow } from 'chartjs-chart-sankey';
// eslint-disable-next-line import/no-unresolved
import { Chart, registerables } from 'chartjs';
import AbstractChart from './chart.js';
import { cssVariable, parseConversionSpec } from '../utils.js';

Chart.register(SankeyController, Flow, ...registerables);

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
'utm', // replace with 'paid'
'reload',
'back_forward',
'lcp',
'missingresource',
*/
// modeling the flow of events
const stages = [
  {
    label: 'contenttype',
    /*
     * 5.  What kind of content was consumed
      *  - none (no media or block whatsoever)
      *  - intital (<=3 media or blocks)
      *  - engaged (>3 media or blocks)
      *  - experiment
      */
    experiment: {
      label: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'experiment')
        .map((e) => `experiment:${e.source}`)
        .pop(),
      color: cssVariable('--spectrum-red-800'),
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'experiment')
        .length > 0,
      next: ['variant:*'],
    },
  },
  {
    label: 'variant',
    /*
     * 5.5.  What variant is selected
     * - variant
     *
     */
    variant: {
      color: cssVariable('--spectrum-fuchsia-300'),
      label: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'experiment')
        .map((e) => `variant:${e.source} ${e.target}`)
        .pop(),
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'experiment')
        .length > 0,
      next: ['click', 'convert', 'formsubmit', 'nointeraction'],
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
    convert: {
      color: cssVariable('--spectrum-fuchsia-300'),
      label: 'Conversion',
      detect: (bundle, dataChunks) => {
        const conversionSpec = parseConversionSpec();
        if (Object.keys(conversionSpec).length === 0) return false;
        if (Object.keys(conversionSpec).length === 1 && conversionSpec.checkpoint && conversionSpec.checkpoint[0] === 'click') return false;
        return dataChunks.hasConversion(bundle, conversionSpec, 'every');
      },
      next: [],
    },
    click: {
      color: cssVariable('--spectrum-green-900'),
      label: 'Click',
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'click')
        .length > 0,
      next: ['intclick', 'extclick', 'media'],
    },
    formsubmit: {
      color: cssVariable('--spectrum-seafoam-900'),
      label: 'Form Submit',
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'formsubmit')
        .length > 0,
    },
    nointeraction: {
      label: 'No Interaction',
      color: cssVariable('--spectrum-gray-100'),
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
      color: cssVariable('--spectrum-yellow-1000'),
      label: 'Media Click',
      next: [],
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'click')
        .filter((e) => e.target && e.target.indexOf('media_') > -1)
        .length > 0,
    },
    extclick: {
      label: 'External Click',
      color: cssVariable('--spectrum-purple-1000'),
      next: ['external:*'],
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'click')
        .filter((e) => e.target && e.target.startsWith('http'))
        .filter((e) => new URL(e.target).hostname !== new URL(bundle.url).hostname)
        .length > 0,
    },

    intclick: {
      label: 'Internal Click',
      color: cssVariable('--spectrum-green-1000'),
      next: ['internal:*'],
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'click')
        .filter((e) => !!e.target)
        .filter((e) => new URL(e.target).hostname === new URL(bundle.url).hostname)
        .length > 0,
    },
  },
  {
    label: 'exit',
    /*
     * 8. What's the click target, specifically
     */
    internal: {
      color: cssVariable('--spectrum-green-1100'),
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
      color: cssVariable('--spectrum-purple-1100'),
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

    if (!params.get('drilldown')) {
      const u = new URL(window.location.href);
      u.searchParams.set('drilldown', 'userAgent');
      window.history.replaceState({}, '', u);
    }

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
            if (step.detect(bundle, this.dataChunks)) {
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
      this.chart.update();
    } else if (this.dataChunks.bundles.length > 0) {
      this.buildChart();
    }
  }

  buildChart() {
    this.elems.canvas.parentNode.classList.add('sankey');

    Chart.defaults.font.family = 'Adobe Clean, sans-serif';
    Chart.defaults.font.size = 16;
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
          if (step.detect(bundle, dataChunks)) {
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
