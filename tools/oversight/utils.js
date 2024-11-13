/* helpers */

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
