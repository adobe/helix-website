/*
 * This module is another service worker, which will handle the number crunching, i.e.
 * filtering, aggregating, and summarizing the data.
 */
/* fetch and process raw bundles */

// eslint-disable-next-line max-classes-per-file
import { UA_KEY, scoreCWV } from './utils.js';
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

function tDistributionCDF(t, df) {
  // Calculate the cumulative distribution function (CDF) of the t-distribution
  const x = t / Math.sqrt(df);
  const a1 = 1 / Math.sqrt(df);
  const a2 = x ** 2 / df;
  const a3 = x ** 2 / (df + x ** 2);

  const a4 = x ** 2 / (df + 2 * x ** 2);
  const a5 = x ** 2 / (df + 3 * x ** 2);
  const a6 = x ** 2 / (df + 4 * x ** 2);

  const a7 = x ** 2 / (df + 5 * x ** 2);
  const a8 = x ** 2 / (df + 6 * x ** 2);
  const a9 = x ** 2 / (df + 7 * x ** 2);

  const a10 = x ** 2 / (df + 8 * x ** 2);
  const a11 = x ** 2 / (df + 9 * x ** 2);
  const a12 = x ** 2 / (df + 10 * x ** 2);

  const a13 = x ** 2 / (df + 11 * x ** 2);
  const a14 = x ** 2 / (df + 12 * x ** 2);
  const a15 = x ** 2 / (df + 13 * x ** 2);

  const a16 = x ** 2 / (df + 14 * x ** 2);
  const a17 = x ** 2 / (df + 15 * x ** 2);
  const a18 = x ** 2 / (df + 16 * x ** 2);
  const a19 = x ** 2 / (df + 17 * x ** 2);
  const a20 = x ** 2 / (df + 18 * x ** 2);
  const a21 = x ** 2 / (df + 19 * x ** 2);
  const a22 = x ** 2 / (df + 20 * x ** 2);

  const cdf = 0.5 + (
    x
    * (1
      - a1
      + a2
      - a3
      + a4
      - a5
      + a6
      - a7
      + a8
      - a9
      + a10
      - a11
      + a12
      - a13
      + a14
      - a15
      + a16
      - a17
      + a18
      - a19
      + a20
      - a21
      + a22));

  return cdf;
}

export function pValue(arr1, arr2) {
  // Calculate the means of the two arrays
  const mean1 = arr1.reduce((sum, num) => sum + num, 0) / arr1.length;
  const mean2 = arr2.reduce((sum, num) => sum + num, 0) / arr2.length;

  // Calculate the standard deviations of the two arrays
  const variance1 = arr1.reduce((sum, num) => sum + (num - mean1) ** 2, 0) / arr1.length;
  const variance2 = arr2.reduce((sum, num) => sum + (num - mean2) ** 2, 0) / arr2.length;

  // Calculate the test statistic
  const testStatistic = (mean1 - mean2)
    / Math.sqrt((variance1 / arr1.length) + (variance2 / arr2.length));

  // Calculate the degrees of freedom
  const degreesOfFreedom = arr1.length + arr2.length - 2;

  // Calculate the p-value using the t-distribution
  const p = 2 * (1 - tDistributionCDF(Math.abs(testStatistic), degreesOfFreedom));

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
   * @returns {Object} metrics
   */
  get metrics() {
    if (this.entries.length === 0) return {};
    return Object.entries(this.parent.series)
      .reduce((acc, [seriesName, valueFn]) => {
        acc[seriesName] = this.entries.reduce(aggregateFn(valueFn), new Aggregate());
        return acc;
      }, {});
  }
}

export class DataChunks {
  constructor() {
    this.data = [];
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
    this.subfacetFns = {};
  }

  /**
   * A facet function works on the entire data set.
   * @param {string} facetName name of the facet
   * @param {groupByFn} facetValueFn function that returns the facet value –
   * can return multiple values
   */
  addFacet(facetName, facetValueFn) {
    this.facetFns[facetName] = facetValueFn;
  }

  /**
   * @function eventFilterFn
   * @param {Event} event the event to check
   * @returns {boolean} true if the event should be included
   */
  /**
   * A subfacet function works on the data that has been filtered
   * @param {string} facetName name of the facet
   * @param {groupByFn} facetValueFn  function that returns the facet value –
   * @param {eventFilterFn} filterFn function that filters events to be considered
   * can return multiple values
   */
  addSubFacet(facetName, facetValueFn, filterFn) {
    this.subfacetFns[facetName] = facetValueFn;
    this.subfacetFns[facetName].filter = filterFn;
  }

  resetData() {
    // data that has been filtered
    this.filteredIn = [];
    this.filteredOut = [];
    // filtered data that has been grouped
    this.groupedIn = {};
    this.groupedOut = {};
    // grouped data that has been aggregated
    this.seriesIn = {};
    this.seriesOut = {};
    // totals for the entire dataset
    this.totalsIn = {};
    this.totalsOut = {};
    // facets[series]
    this.facetsIn = {};
    this.facetsOut = {};
    // subfacets[facet][series]
    this.subfacetsIn = {};
    this.subfacetsOut = {};
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
   * Splits the data into two groups: filteredIn and filteredOut
   * based on the criteria in the filterFn. Most downstream
   * functions will only need the filteredIn data.
   * @param {bundleFilter} filterFn
   * @returns {Bundle[]} all bundles that passed the filter
   */
  filter(filterFn) {
    this.resetData();
    this.bundleFilterFn = filterFn;
    this.filteredIn = this.bundles.filter(filterFn);
    // TODO: enable filterOut when we don't have filter functions
    // with side effects anymore
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
   * We will group the data into two objects: groupedIn and
   * groupedOut. Most downstream functions will only need the
   * groupedIn data.
   * @param {groupByFn} groupByFn for each object, determine the group key
   * @returns {Object<string, Bundle[]>} grouped data, each key is a group
   * and each vaule is an array of bundles
   */
  group(groupByFn) {
    this.groupedIn = this.filteredIn.reduce(groupFn(groupByFn), {});
    this.groupedOut = this.filteredOut.reduce(groupFn(groupByFn), {});
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
        acc[seriesName] = this.filteredIn.reduce(
          aggregateFn(valueFn),
          new Aggregate(),
        );
        return acc;
      }, {});
    this.totalsIn = Object.entries(this.series)
      .reduce((acc, [seriesName, valueFn]) => {
        acc[seriesName] = this.filteredIn.reduce(
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
        const groupedByFacetIn = this.bundles.reduce(groupFn(facetValueFn), {});
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

  /**
   * Calculates subfacets for the filtered data.
   * Other than facets, which operate on bundle-level data,
   * subfacets operate on event-level data.
   * For each function
   * added through `addFacet`, it will determine the most common
   * values, their frequency and their weight. The result will
   * be an object with one key for each facet, containing an array
   * of facet objects.
   * @returns {Object<string, Facet[]>} facets data
   */
  get subfacets() {
    if (Object.keys(this.subfacetsIn).length) return this.subfacetsIn;

    const f = (facet, bundle) => {
      // add the bundle to the entries
      // so that we can calculate metrics
      // later on
      facet.entries.push(bundle);
      facet.count += 1;
      facet.weight += bundle.weight;
      return facet;
    };

    this.subfacetsIn = Object.entries(this.subfacetFns)
      .reduce((accOuter, [facetName, facetValueFn]) => {
        const groupedByFacetIn = this.bundles.reduce(groupFn(facetValueFn), {});
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
    return this.subfacetsIn;
  }
  // do we need subfacet aggregation?
  // i.e. when a checkpoint has been picked, do we need to
  // split out facets by source, target, value?
}
/* filter, slice and dice bundles */
export function filterBundle(bundle, filter, facets, cwv) {
  let matchedAll = true;
  const filterMatches = {};

  /* create sub facets */
  filter.checkpoint.forEach((cp) => {
    if (!facets[`${cp}.value`]) {
      facets[`${cp}.value`] = {};
      cwv[`${cp}.value`] = {};
    }
    if (!facets[`${cp}.target`]) {
      facets[`${cp}.target`] = {};
      cwv[`${cp}.target`] = {};
    }
    if (!facets[`${cp}.source`]) {
      facets[`${cp}.source`] = {};
      cwv[`${cp}.source`] = {};
    }
  });

  filterMatches.text = true;

  const checkpointEvents = {};
  const checkpoints = bundle.events.map((e) => {
    if (!checkpointEvents[e.checkpoint]) checkpointEvents[e.checkpoint] = [];
    checkpointEvents[e.checkpoint].push(e);
    return (e.checkpoint);
  }).filter((cp, index, array) => array.indexOf(cp) === index);

  /* fulltext filter */
  const fullText = `${bundle.url} ${checkpoints.join()}`;
  if (!fullText.includes(filter.text)) {
    matchedAll = false;
    filterMatches.text = false;
  }

  /* filter checkpoint */
  if (matchedAll) {
    if (filter.checkpoint.length) {
      if (filter.checkpoint.every((cp) => checkpoints.includes(cp))) {
        filter.checkpoint.forEach((cp) => {
          const props = ['source', 'target', 'value'];
          props.forEach((prop) => {
            if (filter[`${cp}.${prop}`]) {
              let anyEventMatchedPropValue = false;
              const propFilters = filter[`${cp}.${prop}`];
              checkpointEvents[cp].forEach((cpEvent) => {
                const propValue = (cp.startsWith('cwv-') && prop === 'value') ? scoreCWV(cpEvent[prop], cp.split('-')[1]) : `${cpEvent[prop]}`;
                if (propFilters.includes(propValue)) anyEventMatchedPropValue = true;
              });
              filterMatches[`${cp}.${prop}`] = anyEventMatchedPropValue;
              if (!anyEventMatchedPropValue) matchedAll = false;
            }
          });
        });
        filterMatches.checkpoint = true;
      } else {
        matchedAll = false;
        filterMatches.checkpoint = false;
      }
    }
  }

  /* filter user_agent */
  if (filter[UA_KEY].length) {
    if (filter[UA_KEY].includes(bundle[UA_KEY])) {
      filterMatches[UA_KEY] = true;
    } else {
      matchedAll = false;
      filterMatches[UA_KEY] = false;
    }
  }

  /* filter url */
  if (filter.url.length) {
    if (filter.url.includes(bundle.url)) {
      filterMatches.url = true;
    } else {
      matchedAll = false;
      filterMatches.url = false;
    }
  }

  const matchedEverythingElse = (facetName) => {
    let includeInFacet = true;
    Object.keys(filterMatches).forEach((filterKey) => {
      if (filterKey !== facetName && !filterMatches[filterKey]) includeInFacet = false;
    });
    return includeInFacet;
  };

  const addToCWV = (facet, option) => {
    const addMetric = (metric) => {
      if (!cwv[facet][option]) cwv[facet][option] = {};
      if (!cwv[facet][option][metric]) cwv[facet][option][metric] = { weight: 0, bundles: [] };
      const m = cwv[facet][option][metric];
      m.bundles.push(bundle);
      m.weight += bundle.weight;
    };
    if (bundle.cwvLCP) addMetric('lcp');
    if (bundle.cwvCLS) addMetric('cls');
    if (bundle.cwvINP) addMetric('inp');
    if (bundle.cwvTTFB) addMetric('ttfb');
  };

  /* facets */
  if (matchedAll) {
    checkpoints.forEach((val) => {
      if (facets.checkpoint[val]) facets.checkpoint[val] += bundle.weight;
      else facets.checkpoint[val] = bundle.weight;
      addToCWV('checkpoint', val);
      if (filter.checkpoint.includes(val)) {
        const facetOptionsAdded = [];
        checkpointEvents[val].forEach((e) => {
          if (e.target) {
            const facetName = `${val}.target`;
            const facet = facets[facetName];
            const option = e.target;

            const facetOptionName = `${facetName}=${option}`;
            if (!facetOptionsAdded.includes(facetOptionName)) {
              facetOptionsAdded.push(facetOptionName);
              if (facet[option]) {
                facet[option] += bundle.weight;
              } else {
                facet[option] = bundle.weight;
              }
              addToCWV(facetName, option);
            }
          }
          if (e.source) {
            const facetName = `${val}.source`;
            const facet = facets[facetName];
            const option = e.source;

            const facetOptionName = `${facetName}=${option}`;
            if (!facetOptionsAdded.includes(facetOptionName)) {
              facetOptionsAdded.push(facetOptionName);
              if (facet[option]) {
                facet[option] += bundle.weight;
              } else {
                facet[option] = bundle.weight;
              }
              addToCWV(facetName, option);
            }
          }
          if (e.value) {
            const facetName = `${val}.value`;
            const facet = facets[facetName];
            const option = val.startsWith('cwv-') ? scoreCWV(e.value, val.split('-')[1]) : e.value;

            const facetOptionName = `${facetName}=${option}`;
            if (!facetOptionsAdded.includes(facetOptionName)) {
              facetOptionsAdded.push(facetOptionName);
              if (facet[option]) {
                facet[option] += bundle.weight;
              } else {
                facet[option] = bundle.weight;
              }
              addToCWV(facetName, option);
            }
          }
        });
      }
    });
  }

  if (matchedEverythingElse('url')) {
    if (facets.url[bundle.url]) facets.url[bundle.url] += bundle.weight;
    else facets.url[bundle.url] = bundle.weight;
    addToCWV('url', bundle.url);
  }

  if (matchedEverythingElse(UA_KEY)) {
    if (facets[UA_KEY][bundle[UA_KEY]]) facets[UA_KEY][bundle[UA_KEY]] += bundle.weight;
    else facets[UA_KEY][bundle[UA_KEY]] = bundle.weight;
    addToCWV(UA_KEY, bundle[UA_KEY]);
  }

  return (matchedAll);
}
