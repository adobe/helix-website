import { fetchPlaceholders } from '../../scripts/lib-franklin.js';
import DataLoader from './loader.js';

const mainInnerHTML = `<div class="output">
<div class="title">
  <h1><img src="https://www.aem.live/favicon.ico"> www.aem.live</h1>
  <div>
    <select id="view">
      <option value="week">Week</option>
      <option value="month">Month</option>
      <option value="year">Year</option>
    </select>
  </div>
</div>
<div class="key-metrics">
  <ul>
    <li id="pageviews">
      <h2>Pageviews</h2>
      <p>0</p>
    </li>
    <li id="visits">
      <h2>Visits</h2>
      <p>0</p>
    </li>
    <li id="conversions">
      <h2>Conversions</h2>
      <p>0</p>
    </li>
    <li id="lcp">
      <h2>LCP</h2>
      <p>0</p>
    </li>
    <li id="cls">
      <h2>CLS</h2>
      <p>0</p>
    </li>
    <li id="inp">
      <h2>INP</h2>
      <p>0</p>
    </li>
  </ul>
  <div class="key-metrics-more" aria-hidden="true">
    <ul>
      <li id="ttfb">
        <h2>TTFB</h2>
        <p>0</p>
      </li>  
    </ul>
  </div>
</div>

<figure>
  <canvas id="time-series"></canvas>
  <div class="filter-tags"></div>
  <figcaption>
    <span aria-hidden="true" id="low-data-warning"><span class="danger-icon"></span> small sample size, accuracy reduced.</span>
    <span id="timezone"></span>
  </figcaption>
</figure>
</div>

<div class="filters">
  <div class="quick-filter">
  <input type="text" id="filter" placeholder="Type to filter...">
  </div>
  <aside id="facets">
  </aside>
</div>
`;

const main = document.querySelector('main');
main.innerHTML = mainInnerHTML;

/* globals */
let DOMAIN_KEY = '';
let DOMAIN = 'www.thinktanked.org';
let chart;
const BUNDLER_ENDPOINT = 'https://rum.fastly-aem.page/bundles';
// const BUNDLER_ENDPOINT = 'http://localhost:3000';
const API_ENDPOINT = BUNDLER_ENDPOINT;
const UA_KEY = 'userAgent';
// const API_ENDPOINT = 'https://rum-bundles-2.david8603.workers.dev/rum-bundles';
// const UA_KEY = 'user_agent';

const viewSelect = document.getElementById('view');
const filterInput = document.getElementById('filter');
const facetsElement = document.getElementById('facets');
const canvas = document.getElementById('time-series');
const timezoneElement = document.getElementById('timezone');
const lowDataWarning = document.getElementById('low-data-warning');

let dataChunks = [];

/* helpers */

function scoreValue(value, ni, poor) {
  if (value >= poor) return 'poor';
  if (value >= ni) return 'ni';
  return 'good';
}

function scoreCWV(value, name) {
  const limits = {
    lcp: [2500, 4000],
    cls: [0.1, 0.25],
    inp: [200, 500],
    ttfb: [800, 1800],
  };
  return scoreValue(value, ...limits[name]);
}

function toHumanReadable(num) {
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
}

function toISOStringWithTimezone(date) {
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

const loader = new DataLoader();
loader.apiEndpoint = API_ENDPOINT;

function setDomain(domain, key) {
  DOMAIN = domain;
  DOMAIN_KEY = key;
  loader.domain = domain;
  loader.domainKey = key;
}

/* filter, slice and dice bundles */

function filterBundle(bundle, filter, facets, cwv) {
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

/* update UX */

function updateKeyMetrics(keyMetrics) {
  document.querySelector('#pageviews p').textContent = toHumanReadable(keyMetrics.pageViews);
  document.querySelector('#visits p').textContent = toHumanReadable(keyMetrics.visits);
  document.querySelector('#conversions p').textContent = toHumanReadable(keyMetrics.conversions);

  const lcpElem = document.querySelector('#lcp p');
  lcpElem.textContent = `${toHumanReadable(keyMetrics.lcp / 1000)} s`;
  lcpElem.closest('li').className = `score-${scoreCWV(keyMetrics.lcp, 'lcp')}`;

  const clsElem = document.querySelector('#cls p');
  clsElem.textContent = `${toHumanReadable(keyMetrics.cls)}`;
  clsElem.closest('li').className = `score-${scoreCWV(keyMetrics.cls, 'cls')}`;

  const inpElem = document.querySelector('#inp p');
  inpElem.textContent = `${toHumanReadable(keyMetrics.inp / 1000)} s`;
  inpElem.closest('li').className = `score-${scoreCWV(keyMetrics.inp, 'inp')}`;

  const ttfbElem = document.querySelector('#ttfb p');
  ttfbElem.textContent = `${toHumanReadable(keyMetrics.ttfb / 1000)} s`;
  ttfbElem.closest('li').className = `score-${scoreCWV(keyMetrics.ttfb, 'ttfb')}`;
}

function createChartData(bundles, config, endDate) {
  const labels = [];
  const datasets = [];

  const stats = {};
  const cwvStructure = () => ({
    bundles: [],
    weight: 0,
    average: 0,
    good: { weight: 0, average: 0 },
    ni: { weight: 0, average: 0 },
    poor: { weight: 0, average: 0 },
  });

  bundles.forEach((bundle) => {
    const slotTime = new Date(bundle.timeSlot);
    slotTime.setMinutes(0);
    slotTime.setSeconds(0);
    if (config.unit === 'day' || config.unit === 'week' || config.unit === 'month') slotTime.setHours(0);
    if (config.unit === 'week') slotTime.setDate(slotTime.getDate() - slotTime.getDay());
    if (config.unit === 'month') slotTime.setDate(1);

    const localTimeSlot = toISOStringWithTimezone(slotTime);
    if (!stats[localTimeSlot]) {
      const s = {
        total: 0,
        conversions: 0,
        visits: 0,
        lcp: cwvStructure(),
        inp: cwvStructure(),
        cls: cwvStructure(),
        ttfb: cwvStructure(),
        bundles: [],
      };

      stats[localTimeSlot] = s;
    }

    const updateAverage = (b, struct, key) => {
      const newWeight = b.weight + struct.weight;
      struct.average = (
        (struct.average * struct.weight)
        + (b[key] * b.weight)
      ) / newWeight;
      struct.weight = newWeight;
    };

    const stat = stats[localTimeSlot];
    stat.bundles.push(bundle);
    stat.total += bundle.weight;
    if (bundle.conversion) stat.conversions += bundle.weight;
    if (bundle.visit) stat.visits += bundle.weight;

    if (bundle.cwvLCP) {
      const score = scoreCWV(bundle.cwvLCP, 'lcp');
      const bucket = stat.lcp[score];
      updateAverage(bundle, bucket, 'cwvLCP');
      updateAverage(bundle, stat.lcp, 'cwvLCP');
      stat.lcp.bundles.push(bundle);
    }
    if (bundle.cwvCLS) {
      const score = scoreCWV(bundle.cwvCLS, 'cls');
      const bucket = stat.cls[score];
      updateAverage(bundle, bucket, 'cwvCLS');
      updateAverage(bundle, stat.cls, 'cwvCLS');
      stat.cls.bundles.push(bundle);
    }
    if (bundle.cwvINP) {
      const score = scoreCWV(bundle.cwvINP, 'inp');
      const bucket = stat.inp[score];
      updateAverage(bundle, bucket, 'cwvINP');
      updateAverage(bundle, stat.inp, 'cwvINP');
      stat.inp.bundles.push(bundle);
    }

    if (bundle.cwvTTFB) {
      const score = scoreCWV(bundle.cwvTTFB, 'ttfb');
      const bucket = stat.ttfb[score];
      updateAverage(bundle, bucket, 'cwvTTFB');
      updateAverage(bundle, stat.ttfb, 'cwvTTFB');
      stat.ttfb.bundles.push(bundle);
    }
  });

  const dataTotal = [];
  const dataGood = [];
  const dataNI = [];
  const dataPoor = [];

  const date = endDate ? new Date(endDate) : new Date();
  date.setMinutes(0);
  date.setSeconds(0);
  if (config.unit === 'day' || config.unit === 'month' || config.unit === 'week') date.setHours(0);
  if (config.unit === 'week') date.setDate(date.getDate() - date.getDay());
  if (config.unit === 'month') date.setDate(1);

  for (let i = 0; i < config.units; i += 1) {
    const localTimeSlot = toISOStringWithTimezone(date);
    const stat = stats[localTimeSlot];
    // eslint-disable-next-line no-undef
    labels.unshift(localTimeSlot);
    const sumBucket = (bucket) => {
      bucket.weight = bucket.good.weight + bucket.ni.weight + bucket.poor.weight;
      if (bucket.weight) {
        bucket.average = ((bucket.good.weight * bucket.good.average)
      + (bucket.ni.weight * bucket.ni.average)
      + (bucket.poor.weight * bucket.poor.average)) / bucket.weight;
      } else {
        bucket.average = 0;
      }
    };

    if (stat) {
      sumBucket(stat.lcp);
      sumBucket(stat.cls);
      sumBucket(stat.inp);
      sumBucket(stat.ttfb);

      const cwvNumBundles = stat.lcp.bundles.length
      + stat.cls.bundles.length + stat.inp.bundles.length;
      const cwvTotal = stat.lcp.weight + stat.cls.weight + stat.inp.weight;
      const cwvFactor = stat.total / cwvTotal;

      const cwvGood = stat.lcp.good.weight + stat.cls.good.weight + stat.inp.good.weight;
      const cwvNI = stat.lcp.ni.weight + stat.cls.ni.weight + stat.inp.ni.weight;
      const cwvPoor = stat.lcp.poor.weight + stat.cls.poor.weight + stat.inp.poor.weight;

      const showCWVSplit = cwvNumBundles && (cwvNumBundles > 10);
      if (!config.focus) {
        dataTotal.unshift(showCWVSplit ? 0 : stat.total);
        dataGood.unshift(showCWVSplit ? Math.round(cwvGood * cwvFactor) : 0);
        dataNI.unshift(showCWVSplit ? Math.round(cwvNI * cwvFactor) : 0);
        dataPoor.unshift(showCWVSplit ? Math.round(cwvPoor * cwvFactor) : 0);
      } else {
        if (config.focus === 'lcp' || config.focus === 'cls' || config.focus === 'inp' || config.focus === 'ttfb') {
          const m = config.focus;
          dataTotal.unshift(showCWVSplit ? 0 : 1);
          dataGood.unshift(showCWVSplit ? stat[m].good.weight / stat[m].weight : 0);
          dataNI.unshift(showCWVSplit ? stat[m].ni.weight / stat[m].weight : 0);
          dataPoor.unshift(showCWVSplit ? stat[m].poor.weight / stat[m].weight : 0);
        }
        if (config.focus === 'conversions') {
          // cls here
          dataTotal.unshift(0);
          dataGood.unshift(stat.conversions / stat.total);
          dataNI.unshift(1 - (stat.conversions / stat.total));
          dataPoor.unshift(0);
        }
        if (config.focus === 'visits') {
          // cls here
          dataTotal.unshift(stat.visits / stat.total);
          dataGood.unshift(1 - (stat.visits / stat.total));
          dataNI.unshift(0);
          dataPoor.unshift(0);
        }
      }
    } else {
      dataTotal.unshift(0);
      dataGood.unshift(0);
      dataNI.unshift(0);
      dataPoor.unshift(0);
    }

    if (config.unit === 'hour') date.setTime(date.getTime() - (3600 * 1000));
    if (config.unit === 'day') date.setDate(date.getDate() - 1);
    if (config.unit === 'week') date.setDate(date.getDate() - 7);
    if (config.unit === 'month') date.setMonth(date.getMonth() - 1);
  }

  datasets.push({ data: dataTotal });
  datasets.push({ data: dataGood });
  datasets.push({ data: dataNI });
  datasets.push({ data: dataPoor });

  return { labels, datasets, stats };
}

function updateFacets(facets, cwv, focus, mode, ph, show = {}) {
  const numOptions = mode === 'all' ? 20 : 10;
  const filterTags = document.querySelector('.filter-tags');
  filterTags.textContent = '';
  const addFilterTag = (name, value) => {
    const tag = document.createElement('span');
    if (value) tag.textContent = `${name}: ${value}`;
    else tag.textContent = `${name}`;
    tag.classList.add(`filter-tag-${name}`);
    filterTags.append(tag);
  };

  if (filterInput.value) addFilterTag('text', filterInput.value);
  if (focus) addFilterTag(focus);

  const url = new URL(window.location);

  facetsElement.textContent = '';
  const keys = Object.keys(facets);
  keys.forEach((facetName) => {
    const facet = facets[facetName];
    const optionKeys = Object.keys(facet);
    if (optionKeys.length) {
      let tsv = '';
      const fieldSet = document.createElement('fieldset');
      fieldSet.classList.add(`facet-${facetName}`);
      const legend = document.createElement('legend');
      legend.textContent = facetName;
      const clipboard = document.createElement('span');
      clipboard.className = 'clipboard';
      legend.append(clipboard);
      fieldSet.append(legend);
      tsv += `${facetName}\tcount\tlcp\tcls\tinp\r\n`;
      optionKeys.sort((a, b) => facet[b] - facet[a]);
      const filterKeys = facetName === 'checkpoint' && mode !== 'all';
      const filteredKeys = filterKeys ? optionKeys.filter((a) => !!(ph[a])) : optionKeys;
      const nbToShow = show[facetName] || numOptions;
      filteredKeys.forEach((optionKey, i) => {
        if (i < nbToShow) {
          const optionValue = facet[optionKey];
          const div = document.createElement('div');
          const input = document.createElement('input');
          input.type = 'checkbox';
          input.value = optionKey;
          input.checked = url.searchParams.getAll(facetName).includes(optionKey);
          if (input.checked) {
            addFilterTag(facetName, optionKey);
            div.ariaSelected = true;
          }
          input.id = `${facetName}=${optionKey}`;
          div.addEventListener('click', (evt) => {
            if (evt.target !== input) input.checked = !input.checked;
            evt.stopPropagation();
            // eslint-disable-next-line no-use-before-define
            updateState();
            // eslint-disable-next-line no-use-before-define
            draw();
          });
          const createLabelHTML = (labelText, usePlaceholders) => {
            if (labelText.startsWith('https://') && labelText.includes('media_')) {
              return `<img src="${labelText}?width=750&format=webply&optimize=medium"">`;
            }

            if (labelText.startsWith('https://')) {
              return `<a href="${labelText}" target="_new">${labelText}</a>`;
            }

            if (usePlaceholders && ph[labelText]) {
              return (`${ph[labelText]} [${labelText}]`);
            }
            return (labelText);
          };

          const label = document.createElement('label');
          label.setAttribute('for', `${facetName}-${optionKey}`);
          label.innerHTML = `${createLabelHTML(optionKey, facetName === 'checkpoint')} (${toHumanReadable(optionValue)})`;

          const getP75 = (metric) => {
            const cwvMetric = `cwv${metric.toUpperCase()}`;
            const optionMetric = cwv[facetName][optionKey][metric];
            optionMetric.bundles.sort((a, b) => a[cwvMetric] - b[cwvMetric]);
            let p75Weight = optionMetric.weight * 0.75;
            let p75Value;
            for (let j = 0; j < optionMetric.bundles.length; j += 1) {
              p75Weight -= optionMetric.bundles[j].weight;
              if (p75Weight < 0) {
                p75Value = optionMetric.bundles[j][cwvMetric];
                break;
              }
            }
            return (p75Value);
          };

          const ul = document.createElement('ul');
          ul.classList.add('cwv');

          // display core web vital to facets
          if (cwv[facetName]) {
            // add lcp
            let lcp = '-';
            let lcpScore = '';
            if (cwv[facetName][optionKey] && cwv[facetName][optionKey].lcp) {
              const lcpValue = getP75('lcp');
              lcp = `${toHumanReadable(lcpValue / 1000)} s`;
              lcpScore = scoreCWV(lcpValue, 'lcp');
            }
            const lcpLI = document.createElement('li');
            lcpLI.classList.add(`score-${lcpScore}`);
            lcpLI.textContent = lcp;
            ul.append(lcpLI);

            // add cls
            let cls = '-';
            let clsScore = '';
            if (cwv[facetName][optionKey] && cwv[facetName][optionKey].cls) {
              const clsValue = getP75('cls');
              cls = `${toHumanReadable(clsValue)}`;
              clsScore = scoreCWV(clsValue, 'cls');
            }
            const clsLI = document.createElement('li');
            clsLI.classList.add(`score-${clsScore}`);
            clsLI.textContent = cls;
            ul.append(clsLI);

            // add inp
            let inp = '-';
            let inpScore = '';
            if (cwv[facetName][optionKey] && cwv[facetName][optionKey].inp) {
              const inpValue = getP75('inp');
              inp = `${toHumanReadable(inpValue / 1000)} s`;
              inpScore = scoreCWV(inpValue, 'inp');
            }
            const inpLI = document.createElement('li');
            inpLI.classList.add(`score-${inpScore}`);
            inpLI.textContent = inp;
            ul.append(inpLI);
            tsv += `${optionKey}\t${optionValue}\t${lcp}\t${cls}\t${inp}\r\n`;
          }
          div.append(input, label, ul);
          fieldSet.append(div);
        } else if (i < 100) {
          tsv += `${optionKey}\t${facet[optionKey]}\t\t\t\r\n`;
        }
      });

      if (filteredKeys.length > nbToShow) {
        // add "more" link
        const div = document.createElement('div');
        div.className = 'load-more';
        const more = document.createElement('label');
        more.textContent = 'more...';
        more.addEventListener('click', (evt) => {
          evt.preventDefault();
          // increase number of keys shown
          updateFacets(
            facets,
            cwv,
            focus,
            mode,
            ph,
            { [facetName]: (show[facetName] || numOptions) + numOptions },
          );
        });

        div.append(more);

        const all = document.createElement('label');
        all.textContent = `all (${filteredKeys.length})`;
        all.addEventListener('click', (evt) => {
          evt.preventDefault();
          // increase number of keys shown
          updateFacets(facets, cwv, focus, mode, ph, { [facetName]: filteredKeys.length });
        });
        div.append(all);
        const container = document.createElement('div');
        container.classList.add('more-container');
        container.append(div);
        fieldSet.append(container);
      }

      legend.addEventListener('click', () => {
        navigator.clipboard.writeText(tsv);
        const toast = document.getElementById('copied-toast');
        toast.ariaHidden = false;
        setTimeout(() => { toast.ariaHidden = true; }, 3000);
      });

      facetsElement.append(fieldSet);
    }
  });
}

async function fetchDomainKey(domain) {
  try {
    const auth = localStorage.getItem('rum-bundler-token');
    const resp = await fetch(`https://rum.fastly-aem.page/domainkey/${domain}`, {
      headers: {
        authorization: `Bearer ${auth}`,
      },
    });
    const json = await resp.json();
    return (json.domainkey);
  } catch {
    return '';
  }
}

async function draw() {
  const ph = await fetchPlaceholders('/tools/rum');
  const params = new URL(window.location).searchParams;
  const checkpoint = params.getAll('checkpoint');
  const target = params.getAll('target');
  const url = params.getAll('url');
  const mode = params.get('metrics');

  const userAgent = params.getAll(UA_KEY);
  const view = params.get('view') || 'week';
  const endDate = params.get('endDate') ? `${params.get('endDate')}T00:00:00` : null;
  const focus = params.get('focus');

  const filterText = params.get('filter') || '';
  const filtered = [];
  const filter = {
    text: filterText,
    checkpoint,
    target,
    url,
    [UA_KEY]: userAgent,
  };

  checkpoint.forEach((cp) => {
    const props = ['target', 'source', 'value'];
    props.forEach((prop) => {
      const values = params.getAll(`${cp}.${prop}`);
      if (values.length) {
        filter[`${cp}.${prop}`] = values;
      }
    });
  });

  const facets = {
    [UA_KEY]: {},
    url: {},
    checkpoint: {},
  };

  const startTime = new Date();
  const cwv = structuredClone(facets);

  dataChunks.forEach((chunk) => {
    filtered.push(...chunk.rumBundles
      .filter((bundle) => filterBundle(bundle, filter, facets, cwv)));
  });

  if (filtered.length < 1000) {
    lowDataWarning.ariaHidden = 'false';
  } else {
    lowDataWarning.ariaHidden = 'true';
  }

  const configs = {
    month: {
      view,
      unit: 'day',
      units: 30,
      focus,
    },
    week: {
      view,
      unit: 'hour',
      units: 24 * 7,
      focus,
    },
    year: {
      view,
      unit: 'week',
      units: 52,
      focus,
    },
  };

  const config = configs[view];

  const { labels, datasets, stats } = createChartData(filtered, config, endDate);
  datasets.forEach((ds, i) => {
    chart.data.datasets[i].data = ds.data;
  });
  chart.data.labels = labels;
  chart.options.scales.x.time.unit = config.unit;
  chart.update();

  console.log(`filtered to ${filtered.length} bundles in ${new Date() - startTime}ms`);
  updateFacets(facets, cwv, focus, mode, ph);
  const statsKeys = Object.keys(stats);
  if (mode === 'all') console.log(stats);

  const getP75 = (metric) => {
    const cwvMetric = `cwv${metric.toUpperCase()}`;
    const totalWeight = statsKeys.reduce((cv, nv) => (cv + stats[nv][metric].weight), 0);
    const allBundles = [];
    statsKeys.forEach((key) => allBundles.push(...stats[key][metric].bundles));
    allBundles.sort((a, b) => a[cwvMetric] - b[cwvMetric]);
    let p75Weight = totalWeight * 0.75;
    let p75Value;
    for (let i = 0; i < allBundles.length; i += 1) {
      p75Weight -= allBundles[i].weight;
      if (p75Weight < 0) {
        p75Value = allBundles[i][cwvMetric];
        break;
      }
    }
    return (p75Value);
  };

  const keyMetrics = {
    pageViews: statsKeys.reduce((cv, nv) => cv + stats[nv].total, 0),
    lcp: getP75('lcp'),
    cls: getP75('cls'),
    inp: getP75('inp'),
    ttfb: getP75('ttfb'),
    conversions: statsKeys.reduce((cv, nv) => cv + stats[nv].conversions, 0),
    visits: statsKeys.reduce((cv, nv) => cv + stats[nv].visits, 0),
  };

  updateKeyMetrics(keyMetrics);
}

async function loadData(scope) {
  const params = new URL(window.location.href).searchParams;
  const endDate = params.get('endDate') ? `${params.get('endDate')}T00:00:00` : null;

  if (scope === 'week') {
    dataChunks = await loader.fetchLastWeek(endDate);
  }
  if (scope === 'month') {
    dataChunks = await loader.fetchPrevious31Days(endDate);
  }
  if (scope === 'year') {
    dataChunks = await loader.fetchPrevious12Months(endDate);
  }

  draw();
}

function updateState() {
  const url = new URL(window.location.href.split('?')[0]);
  const { searchParams } = new URL(window.location.href);
  url.searchParams.set('domain', DOMAIN);
  url.searchParams.set('filter', filterInput.value);
  url.searchParams.set('view', viewSelect.value);
  if (searchParams.get('endDate')) url.searchParams.set('endDate', searchParams.get('endDate'));
  if (searchParams.get('metrics')) url.searchParams.set('metrics', searchParams.get('metrics'));
  const selectedMetric = document.querySelector('.key-metrics li[aria-selected="true"]');
  if (selectedMetric) url.searchParams.set('focus', selectedMetric.id);

  facetsElement.querySelectorAll('input').forEach((e) => {
    if (e.checked) {
      url.searchParams.append(e.id.split('=')[0], e.value);
    }
  });
  url.searchParams.set('domainkey', DOMAIN_KEY);
  window.history.replaceState({}, '', url);
}

// eslint-disable-next-line no-undef, no-new
chart = new Chart(canvas, {
  type: 'bar',
  data: {
    labels: [],
    datasets: [{
      label: 'No CVW',
      backgroundColor: '#888',
      data: [],
    },
    {
      label: 'Good',
      backgroundColor: '#49cc93',
      data: [],
    },
    {
      label: 'Needs Improvement',
      backgroundColor: '#ffa037',
      data: [],
    },
    {
      label: 'Poor',
      backgroundColor: '#ff7c65',
      data: [],
    }],
  },
  plugins: [
    {
      id: 'customCanvasBackgroundColor',
      beforeDraw: (ch, args, options) => {
        const { ctx } = ch;
        ctx.save();
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = options.color || '#99ffff';
        ctx.fillRect(0, 0, ch.width, ch.height);
        ctx.restore();
      },
    },
  ],
  options: {
    plugins: {
      customCanvasBackgroundColor: {
        color: 'white',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const { datasets } = context.chart.data;
            const value = context.parsed.y;
            const i = context.dataIndex;
            const total = datasets.reduce((pv, cv) => pv + cv.data[i], 0);

            return (`${context.dataset.label}: ${Math.round((value / total) * 1000) / 10}%`);
          },
        },
      },
    },
    interaction: {
      mode: 'x',
    },
    animation: {
      duration: 300,
    },
    datasets: {
      bar: {
        barPercentage: 1,
        categoryPercentage: 0.9,
        borderSkipped: false,
        borderRadius: {
          topLeft: 3,
          topRight: 3,
          bottomLeft: 3,
          bottomRight: 3,
        },
      },
    },
    responsive: true,
    scales: {
      x: {
        type: 'time',
        display: true,
        offset: true,
        time: {
          displayFormats: {
            day: 'EEE, MMM d',
          },
          unit: 'day',
        },
        stacked: true,
        ticks: {
          minRotation: 90,
          maxRotation: 90,
          autoSkip: false,
        },
      },
      y: {
        stacked: true,
      },
    },
  },
});

const params = new URL(window.location).searchParams;
filterInput.value = params.get('filter');
const view = params.get('view') || 'week';
viewSelect.value = view;
setDomain(params.get('domain') || 'www.thinktanked.org', params.get('domainkey') || '');
const h1 = document.querySelector('h1');
h1.textContent = ` ${DOMAIN}`;
const img = document.createElement('img');
img.src = `https://${DOMAIN}/favicon.ico`;
img.addEventListener('error', () => {
  img.src = './website.svg';
});
h1.prepend(img);
h1.addEventListener('click', async () => {
  // eslint-disable-next-line no-alert
  let domain = window.prompt('enter domain or URL');
  if (domain) {
    try {
      const url = new URL(domain);
      domain = url.host;
    } catch {
      // nothing
    }
    const domainkey = await fetchDomainKey(domain);
    window.location = `${window.location.pathname}?domain=${domain}&view=month&domainkey=${domainkey}`;
  }
});

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
timezoneElement.textContent = timezone;

loadData(view);

filterInput.addEventListener('input', () => {
  updateState();
  draw();
});

viewSelect.addEventListener('input', () => {
  updateState();
  window.location.reload();
});

const metrics = [...document.querySelectorAll('.key-metrics li')];
metrics.forEach((e) => {
  e.addEventListener('click', (evt) => {
    const metric = evt.currentTarget.id;
    const selected = evt.currentTarget.ariaSelected === 'true';
    metrics.forEach((m) => { m.ariaSelected = false; });
    if (metric !== 'pageviews') e.ariaSelected = !selected;
    updateState();
    draw();
  });
});

if (params.get('metrics') === 'all') {
  document.querySelector('.key-metrics-more').ariaHidden = false;
}
