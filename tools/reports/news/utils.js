import classifyConsent from './consent.js';
import { classifyAcquisition } from './acquisition.js';

/* helpers */

export function isKnownFacet(key) {
  const checkpoints = [
    'loadresource',
    'cwv',
    'cwv2', // ekrem
    'cwv-lcp',
    'cwv-cls',
    'cwv-inp',
    'cwv-ttfb', // these are virtual checkpoints
    'click',
    'top',
    'viewmedia',
    'viewblock',
    'enter',
    'error',
    'navigate',
    'utm',
    'reload',
    'back_forward',
    'missingresource',
    'audience',
    'experiment',
    'formsubmit',
    '404',
    'convert',
    'search',
    'unsupported',
    'noscript',
    'consent',
    'paid',
    'email',
    'acquisition',
    'login',
    'signup',
    'language', // record language preference
    'prerender',
    'redirect', // there was a redirect as part of the request
    'acquisition', // virtual checkpoint
  ];

  const baseFacets = [
    'userAgent',
    'url',
    'type',
    'conversions',
    'checkpoint',
    // facets from sankey
    'trafficsource',
    'traffictype',
    'entryevent',
    'pagetype',
    'loadtype',
    'contenttype',
    'interaction',
    'clicktarget',
    'exit',
    'vitals',
    // facets from checkpoints
    ...checkpoints,
  ];

  const suffixes = [
    'source',
    'target',
    'histogram',
  ];

  const modifiers = [
    '!', // indicates a negation, and allows us to select a negative facet
    '~', // indicates a count, and allows us to control how many items are shown
  ];

  const facetPattern = /^(?<facet>[a-z]+)(\.(?<suffix>[a-z]+))?(?<qualifier>[!~])?$/i;
  const match = facetPattern.exec(key);
  if (match) {
    const { facet, suffix, qualifier } = match.groups;
    return baseFacets.includes(facet)
      && (!suffix || suffixes.includes(suffix))
      && (!qualifier || modifiers.includes(qualifier));
  }
  return false;
}

export function scoreCWV(value, name) {
  if (value === undefined || value === null) return null;
  let poor;
  let ni;
  // this is unrolled on purpose as this method becomes a bottleneck
  if (name === 'lcp') {
    poor = 4000;
    ni = 2500;
  }
  if (name === 'cls') {
    poor = 0.25;
    ni = 0.1;
  }
  if (name === 'inp') {
    poor = 500;
    ni = 200;
  }
  if (name === 'ttfb') {
    poor = 1800;
    ni = 800;
  }
  if (value >= poor) {
    return 'poor';
  }
  if (value >= ni) {
    return 'ni';
  }
  return 'good';
}

export const UA_KEY = 'userAgent';

/**
 * Returns a human readable number
 * @param {Number} num a number
 * @param {Number} precision the number of significant digits
 * @returns {String} a human readable number
 */
export function toHumanReadable(num, precision = 2) {
  if (Number.isNaN(num)) return '-';
  const formatter = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumSignificantDigits: precision,
  });
  return formatter.format(num).toLocaleLowerCase();
}

export function toISOStringWithTimezone(date) {
  // Pad a number to 2 digits
  const pad = (n) => `${Math.floor(Math.abs(n))}`.padStart(2, '0');

  // Get timezone offset in ISO format (+hh:mm or -hh:mm)
  const getTimezoneOffset = () => {
    const tzOffset = -date.getTimezoneOffset();
    const diff = tzOffset >= 0 ? '+' : '-';
    return `${diff}${pad(tzOffset / 60)}:${pad(tzOffset % 60)}`;
  };

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}${getTimezoneOffset()}`;
}
export function scoreBundle(bundle) {
  // a bundle is good if all CWV that have a value are good
  // a bundle is ni if all CWV that have a value are ni or good
  // a bundle is poor if any CWV that have a value are poor
  // a bundle has no CWV if no CWV have a value
  const cwv = ['cwvLCP', 'cwvCLS', 'cwvINP'];
  const scores = cwv
    .filter((metric) => bundle[metric])
    .map((metric) => scoreCWV(bundle[metric], metric.toLowerCase().slice(3)));
  if (scores.length === 0) return null;
  if (scores.every((s) => s === 'good')) return 'good';
  if (scores.every((s) => s !== 'poor')) return 'ni';
  return 'poor';
}

export const INTERPOLATION_THRESHOLD = 10;

export function simpleCWVInterpolationFn(metric, threshold) {
  return (cwvs) => {
    const valuedWeights = Object.values(cwvs)
      .filter((value) => value.weight !== undefined)
      .map((value) => value.weight)
      .reduce((acc, value) => acc + value, 0);
    return cwvs[threshold + metric].weight / valuedWeights;
  };
}
export function cwvInterpolationFn(targetMetric) {
  return (cwvs) => {
    const valueCount = cwvs.goodCWV.count + cwvs.niCWV.count + cwvs.poorCWV.count;
    const valuedWeights = cwvs.goodCWV.weight + cwvs.niCWV.weight + cwvs.poorCWV.weight;

    if (valueCount < INTERPOLATION_THRESHOLD) {
      // not enough data to interpolate
      return 0;
    }
    // total weight
    const totalWeight = cwvs.goodCWV.weight
      + cwvs.niCWV.weight
      + cwvs.poorCWV.weight
      + cwvs.noCWV.weight;
    // share of targetMetric compared to all CWV
    const share = cwvs[targetMetric].weight / (valuedWeights);
    // interpolate the share to the total weight
    return Math.round(share * totalWeight);
  };
}

export function truncate(time, unit) {
  const t = new Date(time);
  // truncate to the beginning of the hour
  t.setMinutes(0);
  t.setSeconds(0);
  // truncate to the beginning of the day
  if (unit !== 'hour') t.setHours(0);
  // truncate to the beginning of the week, if the unit is week
  if (unit === 'week') t.setDate(t.getDate() - t.getDay());
  // truncate to the beginning of the month, if the unit is month
  if (unit === 'month') t.setDate(1);
  return toISOStringWithTimezone(t);
}

export function escapeHTML(unsafe) {
  return unsafe.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

export function cssVariable(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name);
}

let gradient;
let width;
let height;
export function getGradient(ctx, chartArea, from, to) {
  const chartWidth = chartArea.right - chartArea.left;
  const chartHeight = chartArea.bottom - chartArea.top;
  if (!gradient || width !== chartWidth || height !== chartHeight) {
    // Create the gradient because this is either the first render
    // or the size of the chart has changed
    width = chartWidth;
    height = chartHeight;
    gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
    gradient.addColorStop(0, from);
    gradient.addColorStop(1, to);
  }

  return gradient;
}
/**
 * Function used for filtering wanted parameters. Its implementation depends on the context,
 * for instance when parsing for conversion parameters we care about those that start with
 * `conversion.`.
 * @function filterFn
 * @param {string} paramName - The parameter name.
 * @returns {boolean} - Returns true if the parameter will be further parsed, false otherwise.
 */
/**
 * In some cases, it may just be that the parameters need to be transformed in some way.
 * For instance, when parsing conversion parameters we want to remove the `conversion.` prefix
 * from the parameter name.
 * @function transformFn
 * @param {[string, string]} paramPair - The pair of parameter name and its value.
 * @returns {[string, string]} - The result of the transformation.
 */
/**
 * Parse search parameters and return a dictionary.
 * @param {URLSearchParams} params - The search parameters.
 * @param {filterFn} filterFn - The filtering function.
 * @param {transformFn} transformFn - The transformation function.
 * @returns {Object<string, string[]>} - The dictionary of parameters.
 */
export function parseSearchParams(params, filterFn, transformFn) {
  return Array.from(params
    .entries())
    .filter(filterFn)
    .map(transformFn)
    .reduce((acc, [key, value]) => {
      if (acc[key]) acc[key].push(value);
      else acc[key] = [value];
      return acc;
    }, {});
}
const cached = {};
export function parseConversionSpec() {
  if (cached.conversionSpec) return cached.conversionSpec;
  const params = new URL(window.location).searchParams;
  const transform = ([key, value]) => [key.replace('conversion.', ''), value];
  const filter = ([key]) => (key.startsWith('conversion.'));
  cached.conversionSpec = parseSearchParams(params, filter, transform);
  return cached.conversionSpec;
}

/**
 * Conversion rates are computed as the ratio of conversions to visits. The conversion rate is
 * capped at 100%.
 * @param conversions the number of conversions
 * @param visits the number of visits
 * @returns {number}  the conversion rate as a percentage
 */
export function computeConversionRate(conversions, visits) {
  const conversionRate = (100 * conversions) / visits;
  if (conversionRate >= 0 && conversionRate <= 100) {
    return conversionRate;
  }
  return 100;
}

/**
 * Determines the sampling error based on a binomial distribution.
 * Each sample is a Bernoulli trial, where the probability of success is the
 * proportion of the total population that has the attribute of interest.
 * The sampling error is calculated as the standard error of the proportion.
 * @param {number} total the expectation value of the total population
 * @param {number} samples the number of successful trials (i.e. samples)
 */
export function samplingError(total, samples) {
  if (samples === 0) {
    return 0;
  }
  const weight = total / samples;

  const variance = weight * weight * samples;
  const standardError = Math.sqrt(variance);
  const marginOfError = 1.96 * standardError;
  // round up to the nearest integer
  return Math.round(marginOfError);
}

const vulgarFractions = {
  0: '0',
  0.125: '⅛',
  0.2: '⅕',
  0.25: '¼',
  0.333: '⅓',
  0.375: '⅜',
  0.5: '½',
  0.625: '⅝',
  0.666: '⅔',
  0.75: '¾',
  0.8: '⅘',
  0.875: '⅞',
  1: '1',
};

export function findNearestVulgarFraction(fraction) {
  const closest = Object.keys(vulgarFractions).reduce((acc, key) => {
    if (Math.abs(fraction - key) < Math.abs(fraction - acc)) {
      return key;
    }
    return acc;
  }, 0);
  return vulgarFractions[closest];
}

export function roundToConfidenceInterval(
  total,
  samples = total,
  maxPrecision = Infinity,
) {
  const max = total + samplingError(total, samples);
  const min = total - samplingError(total, samples);
  // determine the number of significant digits that max and min have in common
  // e.g. 3.14 and 3.16 have 2 significant digits in common
  const maxStr = max.toPrecision(`${max}`.length);
  const minStr = min.toPrecision(`${min}`.length);
  const common = Math.min(maxStr.split('').reduce((acc, digit, i) => {
    if (digit === minStr[i]) {
      return acc + 1;
    }
    return acc;
  }, 0), Number.isNaN(maxPrecision) ? Infinity : maxPrecision);
  const precision = Math.max(
    Math.min(2, Number.isNaN(maxPrecision) ? Infinity : maxPrecision),
    common,
  );

  const rounded = toHumanReadable(total, precision);
  return rounded;
}

export function reclassifyConsent({ source, target, checkpoint }) {
  if (checkpoint === 'click' && source) {
    const consent = classifyConsent(source);
    if (consent) return consent;
  }
  return { source, target, checkpoint };
}

export function reclassifyAcquisition({ source, target, checkpoint }) {
  if (checkpoint === 'utm' && (source === 'utm_source' || source === 'utm_medium')) {
    const acquisition = classifyAcquisition(target);
    if (acquisition) return { checkpoint: 'acquisition', source: acquisition };
  } else if (checkpoint === 'paid') {
    const acquisition = classifyAcquisition(source, true);
    if (acquisition) return { checkpoint: 'acquisition', source: acquisition };
  } else if (checkpoint === 'email') {
    const acquisition = classifyAcquisition(source, false);
    if (acquisition) return { checkpoint: 'acquisition', source: acquisition };
  }
  /* reclassify earned acquisition – I don't like this, because it kills the enter checkpoint
  else if (checkpoint === 'enter' && !allEvents.find((evt) => evt.checkpoint === 'acquisition'
    || evt.checkpoint === 'utm'
    || evt.checkpoint === 'paid'
    || evt.checkpoint === 'email')) {
    const acquisition = classifyAcquisition(source, 'earned');
    if (acquisition) return { checkpoint: 'acquisition', source: `${acquisition}` };
  }
  */
  return { source, target, checkpoint };
}

export function reclassifyEnter(acc, event, i, allEvents) {
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
