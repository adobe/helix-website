/*
 * This module is another service worker, which will handle the number crunching, i.e.
 * filtering, aggregating, and summarizing the data.
 */
/* fetch and process raw bundles */

// eslint-disable-next-line max-classes-per-file
import { UA_KEY, scoreCWV } from './utils.js';

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
}

function aggregateFn(valueFn) {
  return (acc, bundle) => {
    const value = valueFn(bundle);
    acc.count += 1;
    acc.sum += value;
    acc.values.push(value);
    return acc;
  };
}

function groupFn(groupByFn) {
  return (acc, bundle) => {
    const key = groupByFn(bundle);
    if (!key) return acc;
    if (!acc[key]) acc[key] = [];
    acc[key].push(bundle);
    return acc;
  };
}

function initialAggregate() {
  return {
    count: 0,
    sum: 0,
    values: [],
    get min() { return Math.min(...this.values); },
    get max() { return Math.max(...this.values); },
    // stay nice or ...
    get mean() { return this.sum / this.count; },
    percentile(p) {
      const sorted = this.values.sort((left, right) => left - right);
      const index = Math.floor((p / 100) * sorted.length);
      return sorted[index];
    },
  };
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
  constructor(parent, value) {
    this.parent = parent;
    this.name = value;
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
        acc[seriesName] = this.entries.reduce(aggregateFn(valueFn), initialAggregate());
        return acc;
      }, {});
  }
}

export class DataChunks {
  constructor() {
    this.data = [];
    this.resetData();
    this.resetSeries();
  }

  resetSeries() {
    this.series = {};
  }

  addSeries(seriesName, seriesValueFn) {
    this.series[seriesName] = seriesValueFn;
  }

  resetFacets() {
    this.facets = {};
  }

  addFacet(facetName, facetValueFn) {
    this.facets[facetName] = facetValueFn;
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
    this.totalIn = {};
    this.totalOut = {};
    // facets[series]
    this.facetsIn = {};
    this.facetsOut = {};
    // subfacets[facet][series]
    this.subfacetsIn = {};
    this.subfacetsOut = {};
  }

  load(chunks) {
    this.data = chunks;
    this.resetData();
  }

  addData(chunks) {
    this.data.push(chunks);
    this.resetData();
  }

  /**
   * Splits the data into two groups: filteredIn and filteredOut
   * based on the criteria in the filterFn. Most downstream
   * functions will only need the filteredIn data.
   * @param {function(bundle)} filterFn
   * @returns {Array} all bundles that passed the filter
   */
  filter(filterFn) {
    this.resetData();
    this.data.forEach((chunk) => {
      this.filteredIn.push(...chunk.rumBundles.filter(filterFn));
      this.filteredOut.push(...chunk.rumBundles.filter((bundle) => !filterFn(bundle)));
    });
    return this.filteredIn;
  }

  /**
   * Groups the filteredIn data by the groupFn. The groupFn
   * should return a string that will be used as the key for
   * the group. If the groupFn returns a falsy value, the
   * bundle will be skipped.
   * We will group the data into two objects: groupedIn and
   * groupedOut. Most downstream functions will only need the
   * groupedIn data.
   * @param {function(bundle)} groupByFn for each object, determine the group key
   * @returns {Object} grouped data, each key is a group and each vaule is an array of bundles
   */
  group(groupByFn) {
    this.resetData();
    this.groupedIn = this.filteredIn.reduce(groupFn(groupByFn), {});
    this.groupedOut = this.filteredOut.reduce(groupFn(groupByFn), {});
    return this.groupedIn;
  }

  aggregateGroupBundles(valueFn, seriesName, groupName, out) {
    const group = out ? this.groupedOut : this.groupedIn;
    const bundlesInGroup = group[groupName];
    if (out) {
      if (!this.seriesOut[groupName]) this.seriesOut[groupName] = {};
      this.seriesOut[groupName][seriesName] = bundlesInGroup
        .reduce(aggregateFn(valueFn), initialAggregate());
    } else {
      if (!this.seriesIn[groupName]) this.seriesIn[groupName] = {};
      this.seriesIn[groupName][seriesName] = bundlesInGroup
        .reduce(aggregateFn(valueFn), initialAggregate());
    }
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
   * @returns {Object} series data
   */
  aggregate() {
    Object.entries(this.series)
      .forEach(([seriesName, valueFn]) => {
        Object.keys(this.groupedIn)
          .forEach((groupName) => this
            .aggregateGroupBundles(valueFn, seriesName, groupName, false));
        Object.keys(this.groupedOut)
          .forEach((groupName) => this
            .aggregateGroupBundles(valueFn, seriesName, groupName, true));
      });
    return this.seriesIn;
  }

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
   * @returns {Object} total data
   */
  totals() {
    // go over each function in this.series and each value in filteredIn
    // and appy the function to the value
    this.totalsIn = Object.entries(this.series)
      .reduce((acc, [seriesName, valueFn]) => {
        acc[seriesName] = this.filteredIn.reduce(aggregateFn(valueFn), initialAggregate());
        return acc;
      }, {});
    this.totalsOut = Object.entries(this.series)
      .reduce((acc, [seriesName, valueFn]) => {
        acc[seriesName] = this.filteredOut.reduce(aggregateFn(valueFn), initialAggregate());
        return acc;
      }, {});
    return this.totalsIn;
  }

  /**
   * Calculates facets for the filtered data. For each function
   * added through `addFacet`, it will determine the most common
   * values, their frequency and their weight. The result will
   * be an object with one key for each facet, containing an object
   * with one key for each value, containing an object with the
   * following properties:
   * - count: number of raw occurrences
   * - weight: sum of the weight of the occurrences (estimated page views)
   * @returns {object} facets data
   */
  facets() {
    // go over each function in this.facets and each value in filteredIn
    // then aggregate the values
    const f = (facet, bundle) => {
      // add the bundle to the entries
      // so that we can calculate metrics
      // later on
      facet.entries.push(bundle);
      facet.count += 1;
      facet.weight += bundle.weight;
      return facet;
    };
    // group by facet
    this.facetsIn = Object.entries(this.facets)
      .reduce((accOuter, [facetName, facetValueFn]) => {
        const groupedByFacetIn = this.filteredIn.reduce(groupFn(facetValueFn), {});
        accOuter[facetName] = Object.entries(groupedByFacetIn)
          .reduce((accInner, [facetValue, bundles]) => {
            accInner[facetValue] = bundles.reduce(f, { count: 0, weight: 0 });
            return accInner;
          }, new Facet(this, facetName));
        return accOuter;
      }, {});
    // repeat for filteredOut
    this.facetsOut = Object.entries(this.facets)
      .reduce((accOuter, [facetName, facetValueFn]) => {
        const groupedByFacetOut = this.filteredOut.reduce(groupFn(facetValueFn), {});
        accOuter[facetName] = Object.entries(groupedByFacetOut)
          .reduce((accInner, [facetValue, bundles]) => {
            accInner[facetValue] = bundles.reduce(f, { count: 0, weight: 0 });
            return accInner;
          }, new Facet(this, facetName));
        return accOuter;
      }, {});

    return this.facetsIn;
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
