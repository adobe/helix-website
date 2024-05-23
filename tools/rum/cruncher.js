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
    if (e.checkpoint === 'click') {
      bundle.conversion = true;
    }
    if (e.checkpoint === 'cwv-inp') {
      bundle.cwvINP = e.value;
    }
    if (e.checkpoint === 'cwv-lcp') {
      bundle.cwvLCP = e.value;
    }
    if (e.checkpoint === 'cwv-cls') {
      bundle.cwvCLS = e.value;
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
 * Performs a significance test on the data. The test assumes
 * that the data is normally distributed and will calculate
 * the p-value for the difference between the two data sets.
 * @param {number[]} left the first data set
 * @param {number[]} right the second data set
 * @returns {number} the p-value, a value between 0 and 1
 */
export function pValue(left, right) {
  const meanLeft = left.reduce((acc, value) => acc + value, 0) / left.length;
  const meanRight = right.reduce((acc, value) => acc + value, 0) / right.length;
  const varianceLeft = left.reduce((acc, value) => acc + (value - meanLeft) ** 2, 0) / left.length;
  const varianceRight = right
    .reduce((acc, value) => acc + (value - meanRight) ** 2, 0) / right.length;
  const pooledVariance = (varianceLeft + varianceRight) / 2;
  const tValue = (meanLeft - meanRight) / Math
    .sqrt(pooledVariance * (1 / left.length + 1 / right.length));
  const p = 1 - (0.5 + 0.5 * erf(tValue / Math.sqrt(2)));
  return p;
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
    if (this.metricsIn) return this.metricsIn;
    if (this.entries.length === 0) {
      this.metricsIn = {};
      return this.metricsIn;
    }

    this.metricsIn = Object.entries(this.parent.series)
      .reduce((acc, [seriesName, valueFn]) => {
        acc[seriesName] = this.entries.reduce(aggregateFn(valueFn), new Aggregate());
        return acc;
      }, {});

    return this.metricsIn;
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
  }

  /**
   * @function eventFilterFn
   * @param {Event} event the event to check
   * @returns {boolean} true if the event should be included
   */

  resetData() {
    // data that has been filtered
    this.filteredIn = [];
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
   * @private
   * @param {Bundle[]} bundles
   * @param {Object<string, string[]>} filterSpec
   * @param {string[]} skipped facets to skip
   */
  filterBundles(bundles, filterSpec, skipped = []) {
    const filterBy = Object.entries(filterSpec) // use the full filter spec
      .filter(([facetName]) => !skipped.includes(facetName)) // except for skipped facets
      .filter(([, filterValues]) => filterValues.length) // and filters that accept no values
      .filter(([facetName]) => this.facetFns[facetName]); // and facets that don't exist
    return bundles.filter((bundle) => {
      const matches = filterBy.map(([facetName, values]) => {
        // get the facet values for the bundle, remember that
        // a facet can return multiple values
        const facetValue = this.facetFns[facetName](bundle);
        const facetValues = Array.isArray(facetValue) ? facetValue : [facetValue];
        const facetCombiner = this.facetFns[facetName].combiner || 'some';
        // check if any of the values match
        return values[facetCombiner]((value) => facetValues.includes(value));
      });
      // only if all active filters have a match, then the bundle is included
      return matches.every((match) => match);
    });
  }

  filterBy(filterSpec) {
    this.filter = filterSpec;
    return this.filtered;
  }

  get filtered() {
    if (this.filteredIn.length) return this.filteredIn;
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
