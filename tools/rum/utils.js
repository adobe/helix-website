/* helpers */
export function isKnownFacet(key) {
  return false // TODO: find a better way to filter out non-facet keys
    || key === 'userAgent'
    || key === 'url'
    || key === 'type'
    || key === 'conversions'
    // facets from sankey
    || key === 'trafficsource'
    || key === 'traffictype'
    || key === 'entryevent'
    || key === 'pagetype'
    || key === 'loadtype'
    || key === 'contenttype'
    || key === 'interaction'
    || key === 'clicktarget'
    || key === 'exit'
    || key === 'vitals'
    || key.endsWith('.source')
    || key.endsWith('.target')
    || key.endsWith('.histogram')
    || key === 'checkpoint';
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
export function toHumanReadable(num) {
  const dp = 3;
  let number = num;
  const thresh = 1000;

  if (Math.abs(num) < thresh) {
    const precision = (Math.log10(number) < 0) ? 2 : (dp - 1) - Math.floor(Math.log10(number));
    return `${number.toFixed(precision)}`;
  }

  const units = ['k', 'm', 'g', 't', 'p'];
  let u = -1;
  const r = 10 ** dp;

  do {
    number /= thresh;
    u += 1;
  } while (Math.round(Math.abs(number) * r) / r >= thresh && u < units.length - 1);

  const precision = (dp - 1) - Math.floor(Math.log10(number));
  return `${number.toFixed(precision)}${units[u]}`;
} export function toISOStringWithTimezone(date) {
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
