// eslint-disable-next-line import/no-unresolved
import { SankeyController, Flow } from 'chartjs-chart-sankey';
// eslint-disable-next-line import/no-unresolved
import { Chart, registerables } from 'chartjs';
// eslint-disable-next-line import/no-unresolved
import { utils } from '@adobe/rum-distiller';
import AbstractChart from './chart.js';
import {
  cssVariable, parseConversionSpec,
} from '../utils.js';

const { classifyAcquisition, reclassifyAcquisition } = utils;

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
    label: 'trafficsource',
    max_values: 20,
    /*
     *  1.  Where is the traffic coming from:
     *   - referrer (can be domain or page)
     *   - direct
     */
    social: {
      label: 'Social',
      next: ['paid', 'owned', 'earned'],
      color: cssVariable('--spectrum-red-300'),
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'acquisition')
        .filter((e) => e.source)
        .filter(({ source }) => source.match(/social/))
        .length > 0,
    },
    search: {
      label: 'Search',
      next: ['paid', 'owned', 'earned'],
      color: cssVariable('--spectrum-blue-300'),
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'acquisition')
        .filter((e) => e.source)
        .filter(({ source }) => source.match(/search/))
        .length > 0,
    },
    display: {
      label: 'Display',
      next: ['paid'],
      color: cssVariable('--spectrum-red-300'),
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'acquisition')
        .filter((e) => e.source)
        .filter(({ source }) => source.match(/display/))
        .length > 0,
    },
    video: {
      label: 'Video',
      next: ['paid', 'owned', 'earned'],
      color: cssVariable('--spectrum-orange-300'),
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'acquisition')
        .filter((e) => e.source)
        .filter(({ source }) => source.match(/video/))
        .length > 0,
    },
    email: {
      label: 'Email',
      next: ['owned'],
      color: cssVariable('--spectrum-yellow-300'),
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'acquisition')
        .filter((e) => e.source)
        .filter(({ source }) => source.match(/email/))
        .length > 0,
    },
    local: {
      label: 'Local',
      next: ['owned', 'paid'],
      color: cssVariable('--spectrum-chartreuse-300'),
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'acquisition')
        .filter((e) => e.source)
        .filter(({ source }) => source.match(/local/))
        .length > 0,
    },
    referrer: {
      label: 'Referrer',
      color: cssVariable('--spectrum-purple-300'),
      // detection function
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'enter')
        .filter((e) => e.source.startsWith('http'))
        .length > 0
        && bundle.events
          .filter((e) => e.checkpoint === 'acquisition')
          .filter((e) => e.source)
          .length === 0,
      next: ['earned', 'owned', 'paid'],
    },
    direct: {
      label: 'Direct',
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'enter')
        .filter((e) => !e.source.startsWith('http'))
        .length > 0
        || bundle.events
          .filter((e) => e.checkpoint === 'acquisition')
          .filter((e) => e.source)
          .filter(({ source }) => source.match(/direct/))
          .length > 0,
      next: ['earned', 'owned', 'paid'],
      color: cssVariable('--spectrum-green-300'),
    },
  },
  {
    label: 'traffictype',
    /*
     * 1.5 What kind of traffic is it:
     *   - organic
     *  - campaign (utm params present)
     */
    earned: {
      label: 'Earned',
      color: cssVariable('--spectrum-green-400'),
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'utm'
          || e.checkpoint === 'paid'
          || (e.checkpoint === 'acquisition' && e.source && !e.source.startsWith('earned'))
          || e.checkpoint === 'email')
        .length === 0,
      next: ['enter', 'consent', 'noconsent'],
    },
    owned: {
      label: 'Owned',
      color: cssVariable('--spectrum-orange-400'),
      detect: (bundle) => bundle.events
        // .map(reclassifyAcquisition)
        .filter((e) => e.checkpoint === 'acquisition')
        .filter((e) => e.source)
        .filter((e) => e.source.startsWith('owned'))
        .length > 0,
      next: ['enter', 'consent', 'noconsent'],
    },
    paid: {
      label: 'Paid',
      color: cssVariable('--spectrum-red-400'),
      detect: (bundle) => bundle.events
        // .map(reclassifyAcquisition)
        .filter((e) => e.checkpoint === 'acquisition')
        .filter((e) => e.source)
        .filter((e) => e.source.startsWith('paid'))
        .length > 0,
      next: ['enter', 'consent', 'noconsent'],
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
      color: cssVariable('--spectrum-gray-500'),
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'reload')
        .length > 0,
      next: ['top', '404'],
    },
    back_forward: {
      color: cssVariable('--spectrum-gray-500'),
      label: 'Back/Forward',
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'back_forward')
        .length > 0,
      next: ['top', '404'],
    },
    consent: {
      label: 'Consent Shown',
      color: cssVariable('--spectrum-purple-500'),
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'consent')
        .filter((e) => e.target === 'show')
        .length > 0,
      next: ['top', '404'],
    },
    noconsent: {
      label: 'Consent Hidden',
      color: cssVariable('--spectrum-seafoam-500'),
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'consent')
        .filter((e) => e.target === 'hidden')
        .length > 0,
      next: ['top', '404'],
    },
    enter: {
      label: 'Enter',
      color: cssVariable('--spectrum-green-500'),
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'enter')
        .length > 0,
      next: ['top', '404'],
    },
    navigate: {
      color: cssVariable('--spectrum-green-500'),
      label: (bundle) => {
        const nav = bundle.events.filter((e) => e.checkpoint === 'navigate')
          .filter((e) => e.source)
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
      color: cssVariable('--spectrum-green-600'),
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === '404')
        .length === 0,
      next: ['nocontent', 'initial', 'engaged', 'experiment'],
    },
    404: {
      label: '404',
      color: cssVariable('--spectrum-gray-900'),
      next: [],
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === '404')
        .length > 0,
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
      color: cssVariable('--spectrum-gray-200'),
      next: ['click', 'convert', 'formsubmit', 'nointeraction'],
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'viewmedia' || e.checkpoint === 'viewblock')
        .length === 0,
    },
    experiment: {
      label: 'Experiment',
      color: cssVariable('--spectrum-red-800'),
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'experiment')
        .length > 0,
      next: ['click', 'convert', 'formsubmit', 'nointeraction'],
    },
    initial: {
      label: 'Initial Content',
      color: cssVariable('--spectrum-green-800'),
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'viewmedia' || e.checkpoint === 'viewblock')
        .length <= 3,
      next: ['click', 'convert', 'formsubmit', 'nointeraction'],
    },
    engaged: {
      color: cssVariable('--spectrum-seafoam-800'), // greenish, but not too green
      label: 'Engaged Content',
      detect: (bundle) => bundle.events
        .filter((e) => e.checkpoint === 'viewmedia' || e.checkpoint === 'viewblock')
        .length > 3,
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
];
const allStages = stages.reduce((acc, stage) => ({ ...acc, ...stage }), {});

function reclassifyEnter(acc, event, i, allEvents) {
  const has = (cp) => allEvents.find((evt) => evt.checkpoint === cp);

  if (event.checkpoint === 'enter') acc.referrer = event.source;
  if (event.checkpoint === 'acquisition') acc.acquisition = event.source;
  if (
    // we need to reclassify when we have seen both enter and acquisition
    (event.checkpoint === 'enter' || event.checkpoint === 'acquisition')
    // but if there is no acquisition, we reclassify the enter event
    && ((acc.acquisition && acc.referrer) || (!has('acquisition')))) {
    const [aGroup, aCategory, aVendor] = (acc.acquisition || '').split(':');
    const [, rCategory, rVendor] = (classifyAcquisition(acc.referrer) || '').split(':');
    const group = aGroup || 'earned';
    const category = rCategory || aCategory;
    const vndr = rVendor || aVendor;
    const newsrc = `${group}:${category}:${vndr}`.replace(/:undefined/g, '');
    // console.log('reclassifyEnter', acc.referrer, acc.acquisition, newsrc);
    acc.push({ checkpoint: 'acquisition', source: newsrc });
  }
  if (event.checkpoint !== 'acquisition') {
    acc.push(event);
  }
  return acc;
}

export default class SankeyChart extends AbstractChart {
  async draw() {
    const params = new URL(window.location.href).searchParams;

    if (!params.get('drilldown')) {
      const u = new URL(window.location.href);
      u.searchParams.set('drilldown', 'userAgent');
      window.history.replaceState({}, '', u);
    }

    if (this.dataChunks.filtered.length < 1000) {
      this.elems.lowDataWarning.ariaHidden = 'false';
    } else {
      this.elems.lowDataWarning.ariaHidden = 'true';
    }

    const MAX_FACETS = 7;
    this.dataChunks.group((b) => {
      const bundle = b;
      bundle.events = b.events
        .map(reclassifyAcquisition)
        .reduce(reclassifyEnter, []);
      const detectedFlows = [];
      // go through each stage
      stages.forEach((stage) => {
        let cont = false;
        // go through each flow step in the stage
        Object.entries(stage)
          .filter(([key]) => key !== 'label')
          .filter(([key]) => key !== 'max_values')
          .forEach(([key, step]) => {
          // if we already detected a flow, skip the rest
            if (cont) return;
            if (step.detect(bundle, this.dataChunks)) {
              const flowLabel = typeof step.label === 'function' ? step.label(bundle) : key;
              const flowValue = typeof step.label === 'function' ? step.label(bundle) : step.label;
              if (stage.label
                && Object.entries(this.dataChunks.facets[stage.label]).length
                > (stage.max_values || stage.max_values || MAX_FACETS)) {
                // we have too many facets, so we need to group some
                if (this.dataChunks.facets[stage.label]
                  .slice(0, stage.max_values || stage.max_values || MAX_FACETS)
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
        .filter(([key]) => key !== 'max_values')
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
