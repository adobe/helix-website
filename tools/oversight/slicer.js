// eslint-disable-next-line import/no-relative-packages
import {
  DataChunks, utils, series, facets,
// eslint-disable-next-line import/no-unresolved
} from '@adobe/rum-distiller';
import DataLoader from './loader.js';
import { parseSearchParams, parseConversionSpec } from './utils.js';

const {
  isKnownFacet,
  scoreCWV,
  computeConversionRate,
  reclassifyConsent,
} = utils;

const {
  userAgent,
  vitals,
  lcpSource,
  lcpTarget,
  acquisitionSource,
  enterSource,
} = facets;

const {
  pageViews, visits, bounces, lcp, cls, inp, engagement, ttfb, organic,
} = series;

/* globals */
let DOMAIN = 'www.thinktanked.org';

const BUNDLER_ENDPOINT = 'https://bundles.aem.page';
// const BUNDLER_ENDPOINT = 'http://localhost:3000';
const API_ENDPOINT = BUNDLER_ENDPOINT;

const elems = {};

const dataChunks = new DataChunks();

const loader = new DataLoader();
loader.apiEndpoint = API_ENDPOINT;

const herochart = new window.slicer.Chart(dataChunks, elems);

window.addEventListener('pageshow', () => !elems.canvas && herochart.render());

// set up metrics for dataChunks
dataChunks.addSeries('pageViews', pageViews);
dataChunks.addSeries('visits', visits);
// a bounce is a visit without a click
dataChunks.addSeries('bounces', bounces);
dataChunks.addSeries('lcp', lcp);
dataChunks.addSeries('cls', cls);
dataChunks.addSeries('inp', inp);
dataChunks.addSeries('ttfb', ttfb);
dataChunks.addSeries('engagement', engagement);
dataChunks.addSeries('conversions', (bundle) => (dataChunks.hasConversion(bundle, parseConversionSpec())
  ? bundle.weight
  : 0));

dataChunks.addSeries('organic', organic);
/*
 * timeOnPage is the time it took to load the page,
 * i.e. the difference between the first and last event
 * in seconds
 */
dataChunks.addSeries('timeOnPage', (bundle) => {
  const deltas = bundle.events
    .map((evt) => evt.timeDelta)
    .filter((delta) => delta > 0);
  if (deltas.length === 0) {
    return undefined;
  }
  // get max delta and divide by 1000 to get seconds
  return (deltas.reduce((a, b) => Math.max(a, b), -Infinity)) / 1000;
});

dataChunks.addSeries('contentEngagement', (bundle) => {
  const viewEvents = bundle.events
    .filter((evt) => evt.checkpoint === 'viewmedia' || evt.checkpoint === 'viewblock');
  return viewEvents.length;
});

function setDomain(domain, key) {
  DOMAIN = domain;
  loader.domain = domain;
  loader.domainKey = key;
}

const conversionSpec = Object.keys(parseConversionSpec()).length
  ? parseConversionSpec()
  : { checkpoint: ['click'] };

const isDefaultConversion = Object.keys(conversionSpec).length === 0
  || (Object.keys(conversionSpec).length === 1
    && conversionSpec.checkpoint
    && conversionSpec.checkpoint[0] === 'click');
/* update UX */
export function updateKeyMetrics() {
  document.querySelector('#pageviews p number-format').textContent = dataChunks.totals.pageViews.sum;
  document.querySelector('#pageviews p number-format').setAttribute('sample-size', dataChunks.totals.pageViews.count);
  if (dataChunks.totals.visits.sum > 0) {
    const pageViewsExtra = document.querySelector('#pageviews p number-format.extra') || document.createElement('number-format');
    pageViewsExtra.textContent = dataChunks.totals.pageViews.sum / dataChunks.totals.visits.sum;
    pageViewsExtra.setAttribute('precision', 2);
    pageViewsExtra.className = 'extra';
    document.querySelector('#pageviews p').appendChild(pageViewsExtra);
  }

  if (dataChunks.totals.visits.sum > 0) {
    document.querySelector('#visits p number-format').textContent = dataChunks.totals.visits.sum;
    document.querySelector('#visits p number-format').setAttribute('sample-size', dataChunks.totals.visits.count);
    document.querySelector('#visits p number-format').setAttribute('total', dataChunks.totals.pageViews.sum);
    const visitsExtra = document.querySelector('#visits p number-format.extra') || document.createElement('number-format');
    visitsExtra.textContent = (100 * dataChunks.totals.bounces.sum) / dataChunks.totals.visits.sum;
    visitsExtra.setAttribute('precision', 1);
    visitsExtra.setAttribute('total', 100);
    visitsExtra.className = 'extra';
    document.querySelector('#visits p').appendChild(visitsExtra);
  } else {
    document.querySelector('#visits p number-format').textContent = 'N/A';
  }

  if (dataChunks.totals.visits.sum > 0) {
    if (isDefaultConversion) {
      document.querySelector('#conversions p number-format').textContent = dataChunks.totals.engagement.sum;
      document.querySelector('#conversions p number-format').setAttribute('sample-size', dataChunks.totals.engagement.count);
    } else {
      document.querySelector('#conversions p number-format').textContent = dataChunks.totals.conversions.sum;
      document.querySelector('#conversions p number-format').setAttribute('sample-size', dataChunks.totals.conversions.count);
    }

    document.querySelector('#conversions p number-format').setAttribute('total', dataChunks.totals.visits.sum);
    const conversionsExtra = document.querySelector('#conversions p number-format.extra') || document.createElement('number-format');
    if (dataChunks.totals.pageViews.sum > 0 && isDefaultConversion) {
      conversionsExtra.textContent = computeConversionRate(
        dataChunks.totals.engagement.sum,
        dataChunks.totals.pageViews.sum,
      );
      // this is a bit of fake precision, but it's good enough for now
      conversionsExtra.setAttribute('precision', 2);
      conversionsExtra.setAttribute('total', 100);
      conversionsExtra.className = 'extra';
      document.querySelector('#conversions p').appendChild(conversionsExtra);
    } else if (dataChunks.totals.visits.sum > 0 && !isDefaultConversion) {
      conversionsExtra.textContent = computeConversionRate(
        dataChunks.totals.conversions.sum,
        dataChunks.totals.visits.sum,
      );
      // this is a bit of fake precision, but it's good enough for now
      conversionsExtra.setAttribute('precision', 2);
      conversionsExtra.setAttribute('total', 100);
      conversionsExtra.className = 'extra';
      document.querySelector('#conversions p').appendChild(conversionsExtra);
    }
  } else {
    document.querySelector('#conversions p number-format').textContent = 'N/A';
  }

  const lcpElem = document.querySelector('#lcp p number-format');
  lcpElem.textContent = dataChunks.totals.lcp.percentile(75) / 1000;
  lcpElem.closest('li').className = `score-${scoreCWV(dataChunks.totals.lcp.percentile(75), 'lcp')}`;
  if (dataChunks.totals.ttfb.count > 0) {
    const lcpExtra = document.querySelector('#lcp p number-format.extra') || document.createElement('number-format');
    lcpExtra.textContent = dataChunks.totals.ttfb.percentile(75) / 1000;
    lcpExtra.setAttribute('precision', 1);
    lcpExtra.setAttribute('fuzzy', false);
    lcpExtra.className = 'extra';
    document.querySelector('#lcp p').appendChild(lcpExtra);
  }

  const clsElem = document.querySelector('#cls p number-format');
  clsElem.textContent = dataChunks.totals.cls.percentile(75);
  clsElem.closest('li').className = `score-${scoreCWV(dataChunks.totals.cls.percentile(75), 'cls')}`;

  const inpElem = document.querySelector('#inp p number-format');
  inpElem.textContent = dataChunks.totals.inp.percentile(75) / 1000;
  inpElem.closest('li').className = `score-${scoreCWV(dataChunks.totals.inp.percentile(75), 'inp')}`;
}

function updateDataFacets(filterText, params, checkpoint) {
  dataChunks.resetFacets();

  dataChunks.addFacet('type', (bundle) => bundle.hostType);

  dataChunks.addFacet(
    'conversions',
    (bundle) => (dataChunks.hasConversion(bundle, conversionSpec) ? 'converted' : 'not-converted'),
  );

  dataChunks.addFacet('userAgent', userAgent, 'some', 'none');

  dataChunks.addFacet('url', facets.url, 'some', 'never');

  dataChunks.addFacet('vitals', vitals);

  dataChunks.addFacet('checkpoint', facets.checkpoint, 'every', 'none');

  if (params.has('vitals') && params.getAll('vitals').filter((v) => v.endsWith('LCP')).length) {
    dataChunks.addFacet('lcp.target', lcpTarget);

    dataChunks.addFacet('lcp.source', lcpSource);
  }

  // this is a bad name, fulltext would be better
  // but I'm keeping it for compatibility reasons
  dataChunks.addFacet('filter', (bundle) => {
    // this function is also a bit weird, because it takes
    // the filtertext into consideration
    const fullText = `${bundle.url} ${bundle.events.map((e) => e.checkpoint).join(' ')}`;
    const keywords = filterText
      .split(' ')
      .filter((word) => word.length > 2);
    const matching = keywords
      .filter((word) => fullText.toLowerCase().indexOf(word.toLowerCase()) > -1);
    if (matching.length === keywords.length && filterText.length > 2) {
      matching.push(params.get('filter'));
    }
    return matching;
  });

  Object.entries(window.slicer.extraFacets || {}).forEach(([key, value]) => {
    dataChunks.addFacet(key, value);
  });

  // if we have a checkpoint filter, then we also want facets for
  // source and target, the same applies to defined conversion checkpoints
  // we need facets for source and target, too
  Array.from(new Set([...checkpoint, ...(
    isDefaultConversion ? [] : conversionSpec.checkpoint || [])]))
    .forEach((cp) => {
      dataChunks.addFacet(`${cp}.source`, (bundle) => Array.from(
        bundle.events
          .map(reclassifyConsent)
          .filter((evt) => evt.checkpoint === cp)
          .filter(({ source }) => source) // filter out empty sources
          .reduce((acc, { source }) => { acc.add(source); return acc; }, new Set()),
      ));
      dataChunks.addFacet(`${cp}.target`, (bundle) => Array.from(
        bundle.events
          .map(reclassifyConsent)
          .filter((evt) => evt.checkpoint === cp)
          .filter(({ target }) => target) // filter out empty targets
          .reduce((acc, { target }) => { acc.add(target); return acc; }, new Set()),
      ));

      if (cp === 'loadresource') {
        // eslint-disable-next-line no-console
        console.log('adding histogram facet');
        // loadresource.target are not discrete values, but the number
        // of milliseconds it took to load the resource, so the best way
        // to present this is to create a histogram
        // we already have the `loadresource.target` facet, so we can
        // extract the values from there and create a histogram
        dataChunks.addHistogramFacet(
          'loadresource.histogram',
          'loadresource.target',
          {
            count: 10, min: 0, max: 10000, steps: 'quantiles',
          },
        );
      }

      // a bit of special handling here, so we can split the acquisition source
      if (cp === 'acquisition') {
        dataChunks.addFacet('acquisition.source', acquisitionSource);
      }

      // special handling for enter checkpoint
      if (cp === 'enter') {
        dataChunks.addFacet('enter.source', enterSource);
      }
    });

  if (typeof herochart.updateDataFacets === 'function') {
    herochart.updateDataFacets(dataChunks);
  }
}

function updateFilter(params, filterText) {
  const filter = ([key]) => false // TODO: find a better way to filter out non-facet keys
    || (isKnownFacet(key) && !key.endsWith('~'))
    || (key === 'filter' && filterText.length > 2);
  const transform = ([key, value]) => [key, value];
  dataChunks.filter = parseSearchParams(params, filter, transform);
}

export async function draw() {
  const params = new URL(window.location).searchParams;
  const checkpoint = params.getAll('checkpoint');

  const filterText = params.get('filter') || '';

  const startTime = new Date();

  updateDataFacets(filterText, params, checkpoint);

  // set up filter from URL parameters
  updateFilter(params, filterText);

  // eslint-disable-next-line no-console
  console.log(`filtered to ${dataChunks.filtered.length} bundles in ${new Date() - startTime}ms`);

  await herochart.draw();

  updateKeyMetrics();

  const mode = params.get('metrics');
  elems.sidebar.updateFacets(mode);

  // eslint-disable-next-line no-console
  console.log(`full ui updated in ${new Date() - startTime}ms`);
}

async function loadData(config) {
  const scope = config.value;
  const params = new URL(window.location.href).searchParams;
  const startDate = params.get('startDate') ? `${params.get('startDate')}` : null;
  const endDate = params.get('endDate') ? `${params.get('endDate')}` : null;

  if (startDate && endDate) {
    dataChunks.load(await loader.fetchPeriod(`${startDate} 00:00:00`, `${endDate} 23:59:59`));
  } else if (scope === 'week') {
    dataChunks.load(await loader.fetchLastWeek(endDate));
  } else if (scope === 'month') {
    dataChunks.load(await loader.fetchPrevious31Days(endDate));
  } else if (scope === 'year') {
    dataChunks.load(await loader.fetchPrevious12Months(endDate));
  }
}

export function updateState() {
  const url = new URL(window.location.href.split('?')[0]);
  const { searchParams } = new URL(window.location.href);
  url.searchParams.set('domain', DOMAIN);
  url.searchParams.set('filter', elems.filterInput.value);

  const viewConfig = elems.viewSelect.value;
  url.searchParams.set('view', viewConfig.value);
  if (viewConfig.value === 'custom') {
    url.searchParams.set('startDate', viewConfig.from);
    url.searchParams.set('endDate', viewConfig.to);
  }
  // if (searchParams.get('endDate')) url.searchParams.set('endDate', searchParams.get('endDate'));
  if (searchParams.get('metrics')) url.searchParams.set('metrics', searchParams.get('metrics'));
  const drilldown = new URL(window.location).searchParams.get('drilldown');
  if (drilldown) url.searchParams.set('drilldown', drilldown);

  elems.sidebar.querySelectorAll('input').forEach((e) => {
    if (e.indeterminate) {
      url.searchParams.append(`${e.id.split('=')[0]}!`, e.value);
    } else if (e.checked) {
      url.searchParams.append(e.id.split('=')[0], e.value);
    }
  });
  url.searchParams.set('domainkey', searchParams.get('domainkey') || 'incognito');

  // with the conversion spec in form of dictionary
  // need to put it back in the url by expanding the dictionary as follows
  // the key is appended to conversion. and there can be multiple values for the same key
  // conversion.key=value1&conversion.key=value2

  Object.entries(conversionSpec).forEach(([key, values]) => {
    values.forEach((value) => {
      url.searchParams.append(`conversion.${key}`, value);
    });
  });

  // remove all source and target filters if their specific checkpoint
  // is not in the checkpoint filter
  [...url.searchParams.entries()].filter(([key]) => key.match(/\.(source|target)$/))
    .forEach(([key]) => {
      const [cp] = key.split('.');
      if (!url.searchParams.getAll('checkpoint').includes(cp)) {
        url.searchParams.delete(key);
      }
    });
  // iterate over all existing URL parameters and keep those that are known facets
  // and end with ~, so that we can keep the state of the facets
  searchParams.forEach((value, key) => {
    if (key.endsWith('~') && isKnownFacet(key)) {
      url.searchParams.set(key, value);
    }
  });

  window.history.replaceState({}, '', url);
  document.dispatchEvent(new CustomEvent('urlstatechange', { detail: url }));
}

const section = document.querySelector('main > div');
const io = new IntersectionObserver((entries) => {
  // wait for decoration to have happened
  if (entries[0].isIntersecting) {
    // const main = document.querySelector('main');
    // main.innerHTML = mainInnerHTML;

    const sidebar = document.querySelector('facet-sidebar');
    sidebar.data = dataChunks;
    elems.sidebar = sidebar;

    sidebar.addEventListener('facetchange', () => {
      // console.log('sidebar change');
      updateState();
      draw();
    });

    elems.viewSelect = document.getElementById('view');
    elems.canvas = document.getElementById('time-series');
    elems.timezoneElement = document.getElementById('timezone');
    elems.lowDataWarning = document.getElementById('low-data-warning');
    elems.incognito = document.querySelector('incognito-checkbox');
    elems.filterInput = sidebar.elems.filterInput;

    const params = new URL(window.location).searchParams;
    let view = params.get('view');
    if (!view) {
      view = 'week';
      params.set('view', view);
      const url = new URL(window.location.href);
      url.search = params.toString();
      window.history.replaceState({}, '', url);
    }

    const startDate = params.get('startDate') ? `${params.get('startDate')}` : null;
    const endDate = params.get('endDate') ? `${params.get('endDate')}` : null;

    elems.incognito.addEventListener('change', async () => {
      loader.domainKey = elems.incognito.getAttribute('domainkey');

      await loadData(elems.viewSelect.value);
      draw();
    });

    herochart.render();

    elems.filterInput.value = params.get('filter');
    elems.viewSelect.value = {
      value: view,
      from: startDate,
      to: endDate,
    };

    setDomain(params.get('domain') || 'www.thinktanked.org', params.get('domainkey') || '');

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    elems.timezoneElement.textContent = timezone;

    if (elems.incognito.getAttribute('domainkey')) {
      loadData(elems.viewSelect.value).then(draw);
    }

    elems.filterInput.addEventListener('input', () => {
      updateState();
      draw();
    });

    elems.viewSelect.addEventListener('change', () => {
      updateState();
      window.location.reload();
    });

    if (params.get('metrics') === 'all') {
      document.querySelector('.key-metrics-more').ariaHidden = false;
    }
  }
});

io.observe(section);
