/*
 * This module is another service worker, which will handle the number crunching, i.e.
 * filtering, aggregating, and summarizing the data.
 */
/* fetch and process raw bundles */

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

export class DataChunks {
  constructor() {
    this.data = [];
    this.filtered = [];
  }

  load(chunks) {
    this.data = chunks;
    this.filtered = [];
  }

  add(chunks) {
    this.data.push(chunks);
    this.filtered = [];
  }

  filter(filterFn) {
    this.filtered = [];
    this.data.forEach((chunk) => {
      this.filtered.push(...chunk.rumBundles.filter(filterFn));
    });
    return this.filtered;
  }
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
