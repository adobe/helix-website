/*
 * This module is another service worker, which will handle the number crunching, i.e.
 * filtering, aggregating, and summarizing the data.
 */
/* eslint-disable max-classes-per-file */
/**
 * @typedef {Object} RawEvent - a raw RUM event
 * @property {string} checkpoint - the name of the event that happened
 * @property {string|number} target - the target of the event, typically an external URL
 * @property {string} source - the source of the event, typically a CSS selector
 * @property {number} value - the value of a CWV metric
 * @property {number} timeDelta – the difference in milliseconds between this event's
 * time and the containing bundle's timestamp
 */

/**
 * @typedef {Object} RawBundle - a raw bundle of events, all belonging to the same page view
 * @property {string} id - the unique identifier of the bundle. IDs can duplicate across bundles
 * @property {string} host - the hostname that the page view was made to
 * @property {string} time - exact time of the first event in the bundle, in ISO8601 format
 * @property {string} timeSlot - the hourly timesot that this bundle belongs to
 * @property {string} url - the URL of the request, without URL parameters
 * @property {string} userAgent - the user agent class, for instance desktop:windows or mobile:ios
 * @property {number} weight - the weight, or sampling ratio 1:n of the bundle
 * @property {RawEvent} events - the list of events that make up the bundle
 */

/**
 * @typedef {Object} Bundle - a processed bundle of events, with extra properties
 * @extends RawBundle
 * @property {boolean} visit - does this bundle start a visit
 * @property {boolean} conversion - did a conversion happen in this visit
 * @property {number} cwvINP - interaction to next paint, for the entire bundle
 * @property {number} cwvLCP - largest contentful paint, for the entire bundle
 * @property {number} cwvCLS - cumulative layout shift, for the entire bundle
 * @property {number} ttfb - time to first byte, for the entire bundle
 */

/**
 * @typedef {Object} RawChunk - a list of raw, unprocessed bundles as delivered by the endpoint
 * @property {string} date - the base date of all bundles in the chunk
 * @property {RawBundle[]} rumBundles - the bundles, as retrieved from the server
 */

/**
 * Calculates properties on the bundle, so that bundle-level filtering can be performed
 * @param {RawBundle} bundle the raw input bundle, without calculated properties
 * @returns {Bundle} a bundle with additional properties
 */
export function addCalculatedProps(bundle) {
  bundle.events.forEach((e) => {
    if (e.checkpoint === 'enter') {
      bundle.visit = true;
      if (e.source === '') e.source = '(direct)';
    }
    if (e.checkpoint === 'cwv-inp') {
      bundle.cwvINP = e.value;
    }
    if (e.checkpoint === 'cwv-lcp') {
      bundle.cwvLCP = Math.max(e.value || 0, bundle.cwvLCP || 0);
    }
    if (e.checkpoint === 'cwv-cls') {
      bundle.cwvCLS = Math.max(e.value || 0, bundle.cwvCLS || 0);
    }
    if (e.checkpoint === 'cwv-ttfb') {
      bundle.cwvTTFB = e.value;
    }
  });
  return bundle;
}

function aggregateFn(valueFn) {
  /**
   * @param {Aggregate} acc the current aggregate
   * @param {Bundle} bundle the bundle to add to the aggregate
   */
  return (acc, bundle) => {
    const value = valueFn(bundle);
    if (value === undefined) return acc;
    acc.count += 1;
    acc.sum += value;
    acc.weight += bundle.weight;
    acc.values.push(value);
    return acc;
  };
}

function groupFn(groupByFn) {
  return (acc, bundle) => {
    const key = groupByFn(bundle);
    if (!key) return acc;
    if (Array.isArray(key)) {
      key.forEach((k) => {
        if (!acc[k]) acc[k] = [];
        acc[k].push(bundle);
      });
      return acc;
    }
    if (!acc[key]) acc[key] = [];
    acc[key].push(bundle);
    return acc;
  };
}

/**
 * @typedef {Object} Aggregate - an object that contains aggregate metrics
 */
class Aggregate {
  constructor(parent = null) {
    this.count = 0;
    this.sum = 0;
    this.weight = 0;
    this.values = [];
    this.parent = parent;
  }

  get min() {
    return Math.min(...this.values);
  }

  get max() {
    return Math.max(...this.values);
  }

  get share() {
    if (!this.parent) return null;
    return this.count / this.parent.count;
  }

  get percentage() {
    if (!this.parent) return null;
    return this.sum / this.parent.sum;
  }

  get mean() {
    return this.sum / this.count;
  }

  percentile(p) {
    const sorted = this.values.sort((left, right) => left - right);
    const index = Math.floor((p / 100) * sorted.length);
    return sorted[index];
  }
}

class InterpolatedAggregate {
  constructor(interpolationFn, sourceAggregates) {
    this.interpolationFn = interpolationFn;
    this.sourceAggregates = sourceAggregates;
  }

  get weight() {
    const value = this.interpolationFn(this.sourceAggregates);
    if (Number.isNaN(value)) return 0;
    return value;
  }
}

function standardNormalCDF(x) {
  // Approximation of the standard normal CDF using the Hastings algorithm
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp((-x * x) / 2);
  const prob = d * t * (0.3193815
    + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));

  if (x > 0) {
    return 1 - prob;
  }
  return prob;
}

function getZTestPValue(Z) {
  // Approximate the p-value using the standard normal distribution
  // This is a simplified approximation and may not be as accurate as using a
  // Z-table or more advanced methods
  const absZ = Math.abs(Z);
  const pValue = 2 * (1 - standardNormalCDF(absZ));
  return pValue;
}

/**
 * Performs a Z Test between two proportions. This test assumes that the data
 * is normally distributed and will calculate the p-value for the difference
 * between the two proportions.
 * @param {number} sample1 the sample size of the first group (e.g. total number of visitors)
 * @param {number} conversions1 the number of conversions in the first group
 * @param {number} sample2 the sample size of the second group
 * @param {number} conversions2 the number of conversions in the second group
 * @returns {number} the p-value, a value between 0 and 1
 */
export function zTestTwoProportions(sample1, conversions1, sample2, conversions2) {
  // Calculate the conversion rates
  const p1 = conversions1 / sample1;
  const p2 = conversions2 / sample2;

  if (p1 === p2) {
    return 1;
  }

  // Calculate the pooled proportion
  const p = (conversions1 + conversions2) / (sample1 + sample2);

  // Calculate the standard error
  const SE = Math.sqrt(p * (1 - p) * (1 / sample1 + 1 / sample2));

  // Calculate the Z-score
  const Z = (p1 - p2) / SE;

  // Calculate the p-value
  return getZTestPValue(Z);
}

/**
 * The error function, also known as the Gauss error function.
 * @param {number} x the value to calculate the error function for
 */
function erf(x1) {
  // save the sign of x
  const sign = x1 >= 0 ? 1 : -1;
  const x = Math.abs(x1);

  // constants
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  // A&S formula 7.1.26
  const t = 1 / (1 + p * x);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
}
/**
 * @typedef {Object} MeanVariance
 * @property {number} mean - the mean of a dataset
 * @property {number} variance - the variance of a dataset
 */
/**
 * Calculate mean and variance of a dataset.
 * @param {number[]} data - the input data
 * @returns {MeanVariance} mean and variance of the input dataset
 */
function calcMeanVariance(data) {
  let sum = 0;
  let variance = 0;

  // Calculate sum
  for (let i = 0; i < data.length; i += 1) {
    sum += data[i];
  }

  const mean = sum / data.length;

  // Calculate variance
  for (let i = 0; i < data.length; i += 1) {
    variance += (data[i] - mean) ** 2;
  }

  variance /= data.length;

  return { mean, variance };
}
/**
 * Performs a significance test on the data. The test assumes
 * that the data is normally distributed and will calculate
 * the p-value for the difference between the two data sets.
 * @param {number[]} left the first data set
 * @param {number[]} right the second data set
 * @returns {number} the p-value, a value between 0 and 1
 */
export function tTest(left, right) {
  const { mean: meanLeft, variance: varianceLeft } = calcMeanVariance(left);
  const { mean: meanRight, variance: varianceRight } = calcMeanVariance(right);
  const pooledVariance = (varianceLeft + varianceRight) / 2;
  const tValue = (meanLeft - meanRight) / Math
    .sqrt(pooledVariance * (1 / left.length + 1 / right.length));
  const p = 1 - (0.5 + 0.5 * erf(tValue / Math.sqrt(2)));
  return p;
}

/**
 * @typedef Line
 * @type {Object}
 * @property {number} slope the slope of the linear function,
 * i.e. increase of y for every increase of x
 * @property {number} intercept the intercept of the linear function,
 * i.e. the value of y for x equals zero
 */
/**
 * Peform a linear ordinary squares regression against an array.
 * This regression takes the array index as the independent variable
 * and the data in the array as the dependent variable.
 * @param {number[]} data an array of input data
 * @returns {Line} the slope and intercept of the regression function
 */
export function linearRegression(data) {
  const { length: n } = data;

  if (n === 0) {
    throw new Error('Array must contain at least one element.');
  }

  // Calculate sumX and sumX2 using Gauss's formulas
  const sumX = ((n - 1) * n) / 2;
  const sumX2 = ((n - 1) * n * (2 * n - 1)) / 6;

  // Calculate sumY and sumXY using reduce with destructuring
  const { sumY, sumXY } = data.reduce((acc, y, x) => {
    acc.sumY += y;
    acc.sumXY += x * y;
    return acc;
  }, { sumY: 0, sumXY: 0 });

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

class Facet {
  constructor(parent, value, name) {
    this.parent = parent;
    this.value = value;
    this.name = name;
    this.count = 0;
    this.weight = 0;
    this.entries = [];
  }

  /**
   * Calculate the metrics for this facet. The metrics will be
   * calculated based on the series that have been added to the
   * parent object using `addSeries`.
   * The return value will be an object with one key for each
   * series, containing an object with the following properties:
   * - count
   * - sum
   * - min
   * - max
   * - mean
   * - percentile(p)
   * @returns {Aggregate} metrics
   */
  get metrics() {
    return this.getMetrics(Object.keys(this.parent.series));
  }

  getMetrics(series) {
    if (!series || series.length === 0) return {};
    const res = {};
    const needed = [];
    if (this.metricsIn) {
      series.forEach((s) => {
        if (this.metricsIn[s]) {
          res[s] = this.metricsIn[s];
        } else {
          needed.push(s);
        }
      });
    } else {
      this.metricsIn = {};
      needed.push(...series);
    }

    if (needed.length) {
      needed.forEach((s) => {
        const valueFn = this.parent.series[s];
        this.metricsIn[s] = this.entries.reduce(aggregateFn(valueFn), new Aggregate());
        res[s] = this.metricsIn[s];
      });
    }
    return res;
  }
}

export class DataChunks {
  constructor() {
    this.data = [];
    this.filters = {};
    this.resetData();
    this.resetSeries();
    this.resetFacets();
  }

  resetSeries() {
    this.series = {};
    this.interpolations = {};
  }

  /**
   * A series value function calculates the series value of a bundle.
   * If no value is returned, then the bundle will not be considered
   * for the series.
   * @function seriesValueFn
   * @param {Bundle} bundle the bundle to calculate the series value for
   * @returns {number|undefined} the series value or undefined
   */
  /**
   * A series is a named list of values, which are calculated
   * for each bundle in the data set.
   * @param {string} seriesName name of the series
   * @param {seriesValueFn} seriesValueFn function that returns the series value
   * for each bundle
   */
  addSeries(seriesName, seriesValueFn) {
    this.series[seriesName] = seriesValueFn;
  }

  /**
   * An interpolation is a series that is calulated based on the aggrega
   * values of other series. The interpolation function will receive the
   * list of source series and an interpolation function that will return
   * the interpolated value.
   * The interpolation function will have as many arguments as there are
   * source series.
   * @param {string} seriesName name of the (interpolated) series
   * @param {string[]} sourceSeries list of source series to interpolate from
   * @param {function(Object<string, Aggregate>)} interpolationFn
   */
  addInterpolation(seriesName, sourceSeries, interpolationFn) {
    this.interpolations[seriesName] = { sourceSeries, interpolationFn };
  }

  resetFacets() {
    this.facetFns = {};
  }

  /**
   * A facet function works on the entire data set.
   * @param {string} facetName name of the facet
   * @param {groupByFn} facetValueFn function that returns the facet value –
   * can return multiple values
   * @param {string} facetCombiner how to combine multiple values, default is 'some', can be 'every'
   */
  addFacet(facetName, facetValueFn, facetCombiner = 'some') {
    this.facetFns[facetName] = facetValueFn;
    this.facetFns[facetName].combiner = facetCombiner;
    this.resetData();
  }

  /**
   * Adds a histogram facet, derived from an existing facet. This facet
   * will group the data into buckets, based on the values of the base
   * facet.
   * You can specify the bucket size, limits and the type of bucketing.
   * @param {string} facetName name of your new facet
   * @param {string} baseFacet name of the base facet, from which to derive the histogram
   * @param {object} bucketOptions
   * @param {number} bucketOptions.count number of buckets
   * @param {number} bucketOptions.min minimum value of the histogram
   * @param {number} bucketOptions.max maximum value of the histogram
   * @param {('linear'|'logarithmic'|'quantiles')} bucketOptions.steps type of bucketing, can be
   * 'linear' (each bucket has the same value range), 'logarithmic' (same value range on
   * logarithmic scale), or 'quantiles' (buckets are roughly equal in size based on the current
   * facet values, but the bucket min/max values are less predictable)
   * @param {function} formatter a number formatter
   */
  addHistogramFacet(facetName, baseFacet, {
    count: bucketcount = 10,
    min: absmin = -Infinity,
    max: absmax = Infinity,
    steps = 'linear',
  }, formatter = Intl.NumberFormat(undefined, { maximumSignificantDigits: 2 })) {
    const facetvalues = this.facets[baseFacet];

    const createBundleFacetMap = (facetValues) => facetValues.reduce((acc, facet) => {
      facet.entries.forEach((aBundle) => {
        acc[aBundle.id] = acc[aBundle.id] ? [...acc[aBundle.id], facet] : [facet];
      });
      return acc;
    }, {});

    // inside a facet there are entries
    // a entry is a array of bundles
    // a bundle is a object with a id
    // need to create a map of bundles as a key and as values the facets where it belongs to
    // because then we need to use it in the facets value function
    // this is mainly to avoid looping through all the facets for each bundle
    const bundleFacetMap = createBundleFacetMap(facetvalues);

    let quantilesteps;
    const stepfns = {
      // split the range into equal parts
      linear: (min, max, total, step) => (((max - min) / total) * step) + min,
      // split the range into exponential parts, so that the full range
      // is covered
      logarithmic: (min, max, total, step) => {
        const range = max - min;
        const logrange = Math.log(range);
        const logstep = logrange / total;
        return Math.exp(logstep * step) + min;
      },
      // split the range into roughly equal size buckets
      // based on the current facet values (inefficient, needs
      // memoization)
      quantiles: (min, max, total, step) => {
        if (quantilesteps === undefined) {
          const allvalues = facetvalues
            .filter(({ value }) => value !== undefined)
            .map(({ value, weight }) => ({ value: Number.parseInt(value, 10), weight }))
            .filter(({ value }) => value >= min)
            .filter(({ value }) => value <= max)
            .sort((a, b) => a.value - b.value);
          const totalWeight = allvalues.reduce((acc, { weight }) => acc + weight, 0);
          const stepWeight = totalWeight
            / (total + (1 / total)); // add a little extra to make sure we have enough steps
          let currentWeight = 0;
          quantilesteps = allvalues.reduce((acc, { value, weight }) => {
            currentWeight += weight;
            if (currentWeight > stepWeight) {
              acc.push(value);
              currentWeight = 0;
            }
            return acc;
          }, []);
        }
        return quantilesteps[step] || max;
      },
    };
    const min = Math.max(absmin, facetvalues
      .map(({ value }) => Number.parseInt(value, 10))
      .reduce((acc, val) => Math.min(acc, val), absmax));
    const max = Math.min(absmax, facetvalues
      .map(({ value }) => Number.parseInt(value, 10))
      .reduce((acc, val) => Math.max(acc, val), absmin));
    const buckets = Array
      .from({ length: bucketcount }, (_, i) => stepfns[steps](min, max, bucketcount, i));
    this.addFacet(facetName, (bundle) => {
      // find the facetvalue that has the current bundle
      const facetmatch = bundleFacetMap[bundle.id];
      // const facetmatch = facetvalues.find((f) => f.entries.some((e) => e.id === bundle.id));
      if (!facetmatch) {
        return [];
      }
      // pick the first element from the array
      const facetvalue = Number.parseInt(facetmatch[0].value, 10);
      // const facetvalue = Number.parseInt(facetmatch.value, 10);
      const bucket = buckets.findIndex((b) => facetvalue < b);
      return bucket !== -1
        ? `<${formatter.format(buckets[bucket])}`
        : `>=${formatter.format(buckets[bucketcount - 1])}`;
    });
  }

  /**
   * @function eventFilterFn
   * @param {Event} event the event to check
   * @returns {boolean} true if the event should be included
   */

  resetData() {
    // data that has been filtered
    this.filteredIn = null;
    // filtered data that has been grouped
    this.groupedIn = {};
    // grouped data that has been aggregated
    this.seriesIn = {};
    // totals for the entire dataset
    this.totalsIn = {};
    // facets[series]
    this.facetsIn = {};
    // memoziaton
    this.memo = {};
  }

  /**
   * Load raw chunks. This will replace data that has been loaded before
   * @param {RawChunk[]} chunks the raw data to load, an array of chunks
   */
  load(chunks) {
    this.data = chunks;
    this.resetData();
  }

  /**
   * Load more data. This will amend the data that has been loaded before
   * @param {RawChunk} chunks the raw data to load, an array of chunks
   */
  addData(chunks) {
    this.data.push(...chunks);
    this.resetData();
  }

  /**
   * @returns {Bundle[]} all bundles, regardless of the chunk they belong to
   */
  get bundles() {
    if (this.memo.bundles) return this.memo.bundles;
    this.memo.bundles = this.data.reduce((acc, chunk) => {
      acc.push(...chunk.rumBundles);
      return acc;
    }, []);
    return this.memo.bundles;
  }

  /**
   * A filter function that will return true for matching
   * bundles and false for non-matching bundles.
   * @function bundleFilter
   * @param {Bundle} bundle the bundle to check
   * @returns {boolean} true if the bundle matches the filter
   */

  /**
   * Defines what filter to apply to the data. The filter
   * is an object that specifies the valid values for each
   * defined facet.
   * Filter values are the same values that can get returned
   * by the `valueFn` that has been added with `addFacet`.
   * @param {Object<string, string[]>} filterSpec the filter specification
   */
  set filter(filterSpec) {
    this.filters = filterSpec;
    // reset caches that depend on the filter
    this.resetData();
  }

  /**
   * Function used for skipping certain filtering attributes. The logic of the function
   * depends on the context, for instance when filtering bundles, this function is chained
   * as a filter function in order to skip certain attributes.
   * @function skipFilterFn
   * @param {string} attributeName the name of the attribute to skip.
   * @returns {boolean} true if the attribute should be included or not.
   */

  /**
   * Function used for whitelist filtering attributes. The logic of the function
   * depends on the context, for instance when filtering bundles, this function is chained
   * as a filter function in order to ditch attributes.
   * @function existenceFilterFn
   * @param {string} attributeName the name of the whitelisted attribute.
   * @returns {boolean} true if the attribute should be included or not.
   */

  /**
   * Function used for extracting the values for a certain attribute out of a dataset
   * specific to the context.
   * @function valuesExtractorFn
   * @param {string} attributeName the name of the attribute to extract.
   * @param {Bundle} bundle the dataset to extract the attribute from.
   * @param {DataChunks} parent the parent object that contains the bundles.
   * @returns {boolean} true if the attribute should be included or not.
   */

  /**
   * Function used for inferring the combiner that's going to be used when
   * filtering attributes.
   * @function combinerExtractorFn
   * @param {string} attributeName the name of the attribute to extract.
   * @param {DataChunks} parent the parent object that contains the bundles.
   * @returns {string} 'some' or 'every'.
   */

  /**
   * @private
   * @param {Bundle[]} bundles
   * @param {Object<string, string[]>} filterSpec
   * @param {string[]} skipped facets to skip
   */
  filterBundles(bundles, filterSpec, skipped = []) {
    const existenceFilterFn = ([facetName]) => this.facetFns[facetName];
    const skipFilterFn = ([facetName]) => !skipped.includes(facetName);
    const valuesExtractorFn = (attributeName, bundle, parent) => {
      const facetValue = parent.facetFns[attributeName](bundle);
      return Array.isArray(facetValue) ? facetValue : [facetValue];
    };
    const combinerExtractorFn = (attributeName, parent) => parent.facetFns[attributeName].combiner || 'some';
    // eslint-disable-next-line max-len
    return this.applyFilter(bundles, filterSpec, skipFilterFn, existenceFilterFn, valuesExtractorFn, combinerExtractorFn);
  }

  /**
   * @private
   * @param {Bundle[]} bundles that will be filtered based on a filter specification.
   * @param {Object<string, string[]>} filterSpec the filter specification.
   * @param {skipFilterFn} skipFilterFn function to skip filters. Useful for skipping
   * unwanted facets, in general skipping attributes.
   * @param {existenceFilterFn} existenceFilterFn function to filter out non-existing attributes.
   * This is used to skip facets that have not been added. In general,
   * this can be used to whitelist attributes names.
   * @param {valuesExtractorFn} valuesExtractorFn function to extract the probed values.
   * @param {combinerExtractorFn} combinerExtractorFn function to extract the combiner.
   * @returns {Bundle[]} the filtered bundles.
   */
  // eslint-disable-next-line max-len
  applyFilter(bundles, filterSpec, skipFilterFn, existenceFilterFn, valuesExtractorFn, combinerExtractorFn) {
    const filterBy = Object.entries(filterSpec)
      .filter(skipFilterFn)
      .filter(([, desiredValues]) => desiredValues.length)
      .filter(existenceFilterFn);
    return bundles.filter((bundle) => filterBy.every(([attributeName, desiredValues]) => {
      const actualValues = valuesExtractorFn(attributeName, bundle, this);
      const combiner = combinerExtractorFn(attributeName, this);
      return desiredValues[combiner]((value) => actualValues.includes(value));
    }));
  }

  /**
   * Checks if a conversion has happened in the bundle. A conversion means a business metric
   * that has been achieved, for instance a click on a certain link.
   * @param {Bundle} aBundle the bundle to check.
   * @param {Object<string, string[]>} filterSpec uses the same format as the filter specification.
   * For instance { checkpoint: ['click'] } means that inside a bundle an event that has the
   * checkpoint attribute set to 'click' must exist.
   * @param {string} combiner used to determine if all or some filters must match.
   * By default, 'every' is used.
   * @returns {boolean} the result of the check.
   */
  hasConversion(aBundle, filterSpec, combiner) {
    const existenceFilterFn = ([facetName]) => this.facetFns[facetName];
    const skipFilterFn = () => true;
    const valuesExtractorFn = (attributeName, bundle, parent) => {
      const facetValue = parent.facetFns[attributeName](bundle);
      return Array.isArray(facetValue) ? facetValue : [facetValue];
    };
    const combinerExtractorFn = () => combiner || 'every';

    return this.applyFilter(
      [aBundle],
      filterSpec,
      skipFilterFn,
      existenceFilterFn,
      valuesExtractorFn,
      combinerExtractorFn,
    ).length > 0;
  }

  filterBy(filterSpec) {
    this.filter = filterSpec;
    return this.filtered;
  }

  get filtered() {
    if (this.filteredIn) return this.filteredIn;
    if (Object.keys(this.filters).length === 0) return this.bundles; // no filter, return all
    if (Object.keys(this.facetFns).length === 0) return this.bundles; // no facets, return all
    this.filteredIn = this.filterBundles(this.bundles, this.filters);
    return this.filteredIn;
  }

  /**
   * A grouping function returns a group name or undefined
   * for each bundle, according to the group that the bundle
   * belongs to.
   * @function groupByFn
   * @param {Bundle} bundle the bundle to check
   * @returns {string[]|string|undefined} the group name(s) or undefined
   */

  /**
   * Groups the filteredIn data by the groupFn. The groupFn
   * should return a string that will be used as the key for
   * the group. If the groupFn returns a falsy value, the
   * bundle will be skipped.
   * @param {groupByFn} groupByFn for each object, determine the group key
   * @returns {Object<string, Bundle[]>} grouped data, each key is a group
   * and each vaule is an array of bundles
   */
  group(groupByFn) {
    this.groupedIn = this.filtered.reduce(groupFn(groupByFn), {});
    if (groupByFn.fillerFn) {
      // fill in the gaps, as sometimes there is no data for a group
      // so we need to add an empty array for that group
      const allGroups = groupByFn.fillerFn(Object.keys(this.groupedIn));
      this.groupedIn = allGroups.reduce((acc, group) => {
        acc[group] = this.groupedIn[group] || [];
        return acc;
      }, {});
    }
    return this.groupedIn;
  }

  /**
   * Aggregates the grouped data into series data. Each series
   * has been provided by `addSeries` and will be used to
   * calculate the value of each bundle in the group. The
   * aggregated data will be stored in the seriesIn[groupName][seriesName]
   * object.
   * Each result will be an object with the following properties:
   * - count
   * - sum
   * - min
   * - max
   * - mean
   * - percentile(p)
   * @returns {Object<string, Totals>} series data
   */
  get aggregates() {
    if (Object.keys(this.seriesIn).length) return this.seriesIn;
    this.seriesIn = Object.entries(this.groupedIn)
      .reduce((accOuter, [groupName, bundles]) => {
        accOuter[groupName] = Object.entries(this.series)
          .reduce((accInner, [seriesName, valueFn]) => {
            accInner[seriesName] = bundles.reduce(
              aggregateFn(valueFn),
              // we reference the totals object here, so that we can
              // calculate the share and percentage metrics
              new Aggregate(this.totals[seriesName]),
            );
            return accInner;
          }, {});
        // repeat, for interpolations
        accOuter[groupName] = Object.entries(this.interpolations)
          .reduce(
            (accInner, [seriesName, { sourceSeries, interpolationFn }]) => {
              const sourceAggregates = sourceSeries
                .reduce((acc, sourceSeriesName) => {
                  acc[sourceSeriesName] = accOuter[groupName][sourceSeriesName];
                  return acc;
                }, {});
              accInner[seriesName] = new InterpolatedAggregate(interpolationFn, sourceAggregates);
              return accInner;
            },
            accOuter[groupName],
          );
        return accOuter;
      }, {});
    return this.seriesIn;
  }

  /**
   * A total is an object that contains {Metric} objects
   * for each defined series.
   * @typedef Totals
   * @extends Object<string, Aggregate>
   */
  /**
   * Aggregates the filtered data into totals. The totals will
   * be stored in the totalIn object. The result will be an object
   * with one key for each series that has been added with `addSeries`.
   * Each value will be an object with the following properties:
   * - count
   * - sum
   * - min
   * - max
   * - mean
   * - percentile(p)
   * @returns {Totals} total data
   */
  get totals() {
    // go over each function in this.series and each value in filteredIn
    // and appy the function to the value
    if (Object.keys(this.totalsIn).length) return this.totalsIn;
    const parentTotals = Object.entries(this.series)
      .reduce((acc, [seriesName, valueFn]) => {
        acc[seriesName] = this.filtered.reduce(
          aggregateFn(valueFn),
          new Aggregate(),
        );
        return acc;
      }, {});
    this.totalsIn = Object.entries(this.series)
      .reduce((acc, [seriesName, valueFn]) => {
        acc[seriesName] = this.filtered.reduce(
          aggregateFn(valueFn),
          new Aggregate(parentTotals[seriesName]),
        );
        return acc;
      }, {});
    return this.totalsIn;
  }

  /**
   * Calculates facets for all data. For each function
   * added through `addFacet`, it will determine the most common
   * values, their frequency and their weight. The result will
   * be an object with one key for each facet, containining an array
   * of facet objects.
   * @returns {Object<string, Facet[]>} facets data
   */
  get facets() {
    if (Object.keys(this.facetsIn).length) return this.facetsIn;

    const f = (facet, bundle) => {
      // add the bundle to the entries
      // so that we can calculate metrics
      // later on
      facet.entries.push(bundle);
      facet.count += 1;
      facet.weight += bundle.weight;
      return facet;
    };

    this.facetsIn = Object.entries(this.facetFns)
      .reduce((accOuter, [facetName, facetValueFn]) => {
        const groupedByFacetIn = this
          // we filter the bundles by all active filters,
          // except for the current facet (we want to see)
          // all values here.
          .filterBundles(
            this.bundles,
            this.filters,
            this.facetFns[facetName].combiner === 'some'
              ? [facetName]
              : [],
          )
          .reduce(groupFn(facetValueFn), {});
        accOuter[facetName] = Object.entries(groupedByFacetIn)
          .reduce((accInner, [facetValue, bundles]) => {
            accInner.push(bundles
              .reduce(f, new Facet(this, facetValue, facetName)));
            // sort the entries by weight, descending
            accInner.sort((left, right) => right.weight - left.weight);
            return accInner;
          }, []);
        return accOuter;
      }, {});
    return this.facetsIn;
  }
}
