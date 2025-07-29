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
  toHumanReadable,
} = utils;

const {
  userAgent,
  vitals,
  lcpSource,
  lcpTarget,
} = facets;

const {
  pageViews, visits, bounces, lcp, cls, inp, engagement, ttfb,
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

const conversionSpec = Object.keys(parseConversionSpec()).length
  ? parseConversionSpec()
  : { checkpoint: ['click'] };

const isDefaultConversion = Object.keys(conversionSpec).length === 1
  && conversionSpec.checkpoint
  && conversionSpec.checkpoint[0] === 'click';

window.addEventListener('pageshow', () => !elems.canvas && herochart.render());

// set up metrics for dataChunks
dataChunks.addSeries('pageViews', pageViews);
dataChunks.addSeries('visits', visits);
dataChunks.addSeries('bounces', bounces);
dataChunks.addSeries('lcp', lcp);
dataChunks.addSeries('cls', cls);
dataChunks.addSeries('inp', inp);
dataChunks.addSeries('ttfb', ttfb);
dataChunks.addSeries('engagement', engagement);
dataChunks.addSeries('conversions', (bundle) => (dataChunks.hasConversion(bundle, conversionSpec)
  ? bundle.weight
  : 0));
function setDomain(domain, key) {
  DOMAIN = domain;
  loader.domain = domain;
  loader.domainKey = key;
}

/* update UX */
export function updateKeyMetrics(keyMetrics) {
  document.querySelector('#pageviews p').textContent = toHumanReadable(keyMetrics.pageViews);
  if (keyMetrics.visits > 0) {
    const pageViewsExtra = document.createElement('span');
    pageViewsExtra.textContent = toHumanReadable(keyMetrics.pageViews / keyMetrics.visits);
    pageViewsExtra.className = 'extra';
    document.querySelector('#pageviews p').appendChild(pageViewsExtra);
  }

  if (keyMetrics.visits > 0) {
    document.querySelector('#visits p').textContent = toHumanReadable(keyMetrics.visits);
    const visitsExtra = document.createElement('span');
    visitsExtra.textContent = toHumanReadable((100 * keyMetrics.bounces) / keyMetrics.visits);
    visitsExtra.className = 'extra';
    document.querySelector('#visits p').appendChild(visitsExtra);
  } else {
    document.querySelector('#visits p').textContent = 'N/A';
  }

  if (keyMetrics.visits > 0) {
    document.querySelector('#conversions p').textContent = toHumanReadable(keyMetrics.conversions);
    const conversionsExtra = document.createElement('span');
    const conversionRate = computeConversionRate(keyMetrics.conversions, keyMetrics.pageViews);
    conversionsExtra.textContent = toHumanReadable(conversionRate);
    conversionsExtra.className = 'extra';
    document.querySelector('#conversions p').appendChild(conversionsExtra);
  } else {
    document.querySelector('#conversions p').textContent = 'N/A';
  }

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
          .filter((evt) => evt.checkpoint === cp)
          .filter(({ source }) => source) // filter out empty sources
          .reduce((acc, { source }) => { acc.add(source); return acc; }, new Set()),
      ));
      if (cp !== 'utm') { // utm.target is different from the other checkpoints
        dataChunks.addFacet(`${cp}.target`, (bundle) => Array.from(
          bundle.events
            .filter((evt) => evt.checkpoint === cp)
            .filter(({ target }) => target) // filter out empty targets
            .reduce((acc, { target }) => {
              if (typeof target === 'string') {
                const mi = target.indexOf('/media_');
                if (cp === 'viewmedia' && mi) {
                  acc.add(target.substring(mi + 1));
                } else {
                  acc.add(target);
                }
              } else {
                acc.add(target);
              }
              return acc;
            }, new Set()),
        ));

        if (cp === 'loadresource') {
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
      } else if (params.has('utm.source')) {
        params.getAll('utm.source').forEach((utmsource) => {
          dataChunks.addFacet(`utm.${utmsource}.target`, (bundle) => Array.from(
            bundle.events
              .filter((evt) => evt.checkpoint === 'utm')
              .filter((evt) => evt.source === utmsource)
              .filter((evt) => evt.target)
              .reduce((acc, { target }) => { acc.add(target); return acc; }, new Set()),
          ));
        });
      }
    });

  if (typeof herochart.updateDataFacets === 'function') {
    herochart.updateDataFacets(dataChunks);
  }
}

function updateFilter(params, filterText) {
  const filter = ([key]) => false // TODO: find a better way to filter out non-facet keys
    || isKnownFacet(key)
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

  updateKeyMetrics({
    pageViews: dataChunks.totals.pageViews.sum,
    lcp: dataChunks.totals.lcp.percentile(75),
    cls: dataChunks.totals.cls.percentile(75),
    inp: dataChunks.totals.inp.percentile(75),
    ttfb: dataChunks.totals.ttfb.percentile(75),
    conversions: dataChunks.totals.conversions.sum,
    visits: dataChunks.totals.visits.sum,
    bounces: dataChunks.totals.bounces.sum,
  });

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

  elems.sidebar.querySelectorAll('input').forEach((e) => {
    if (e.checked) {
      url.searchParams.append(e.id.split('=')[0], e.value);
    }
  });
  url.searchParams.set('domainkey', searchParams.get('domainkey') || 'incognito');

  // remove all source and target filters if their specific checkpoint
  // is not in the checkpoint filter
  [...url.searchParams.entries()].filter(([key]) => key.match(/\.(source|target)$/))
    .forEach(([key]) => {
      const [cp] = key.split('.');
      if (!url.searchParams.getAll('checkpoint').includes(cp)) {
        url.searchParams.delete(key);
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

    // update the lab link with the current url search params
    const labLink = document.querySelector('.lab a');
    if (labLink) {
      const updateLabLink = (url) => {
        const current = new URL(labLink.href);
        current.search = url.search;
        labLink.href = current.toString();
      };
      updateLabLink(new URL(window.location.href));

      document.addEventListener('urlstatechange', (ev) => {
        updateLabLink(ev.detail);
      });
    }
  }
});

io.observe(section);
