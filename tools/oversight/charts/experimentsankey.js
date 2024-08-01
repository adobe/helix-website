// eslint-disable-next-line import/no-unresolved
import { SankeyController, Flow } from 'chartjs-chart-sankey';
// eslint-disable-next-line import/no-unresolved
import { Chart, registerables } from 'chartjs';
import SankeyChart from './sankey.js';
import { cssVariable, parseConversionSpec } from '../utils.js';

Chart.register(SankeyController, Flow, ...registerables);

const stages = [
  {
    label: 'contenttype',
    /*
    * 1. What kind of content was consumed
    * In this case, it is just "experiment"
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
     * 2. What variant is selected
     * - variant
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
     * 3. What kind of interaction happened
     * - convert
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
     * 4.  What's the type of click target
     * - external
     * - internal
     * - media
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
     * 5. What's the click target, specifically
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

export default class ExperimentSankeyChart extends SankeyChart {
  constructor(dataChunks, elems) {
    super(dataChunks, elems);
    this.stages = stages;
    this.allStages = allStages;
  }
}
