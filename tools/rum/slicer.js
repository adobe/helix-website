// eslint-disable-next-line import/no-relative-packages
import { DataChunks } from './cruncher.js';
import DataLoader from './loader.js';
import { toHumanReadable, scoreCWV } from './utils.js';

/* globals */
let DOMAIN = 'www.thinktanked.org';

const BUNDLER_ENDPOINT = 'https://rum.fastly-aem.page/bundles';
// const BUNDLER_ENDPOINT = 'http://localhost:3000';
const API_ENDPOINT = BUNDLER_ENDPOINT;
// const API_ENDPOINT = 'https://rum-bundles-2.david8603.workers.dev/rum-bundles';
// const UA_KEY = 'user_agent';

const elems = {};

const dataChunks = new DataChunks();

const loader = new DataLoader();
loader.apiEndpoint = API_ENDPOINT;

const herochart = new window.slicer.Chart(dataChunks, elems);

window.addEventListener('pageshow', () => elems.canvas && herochart.render());

// set up metrics for dataChunks
dataChunks.addSeries('pageViews', (bundle) => bundle.weight);
dataChunks.addSeries('visits', (bundle) => (bundle.visit ? bundle.weight : 0));
dataChunks.addSeries('conversions', (bundle) => (bundle.conversion ? bundle.weight : 0));
dataChunks.addSeries('lcp', (bundle) => bundle.cwvLCP);
dataChunks.addSeries('cls', (bundle) => bundle.cwvCLS);
dataChunks.addSeries('inp', (bundle) => bundle.cwvINP);
dataChunks.addSeries('ttfb', (bundle) => bundle.cwvTTFB);

function setDomain(domain, key) {
  DOMAIN = domain;
  loader.domain = domain;
  loader.domainKey = key;
}

/* update UX */
export function updateKeyMetrics(keyMetrics) {
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

function updateDataFacets(filterText, params, checkpoint) {
  dataChunks.resetFacets();
  dataChunks.addFacet('userAgent', (bundle) => {
    const parts = bundle.userAgent.split(':');
    return parts.reduce((acc, _, i) => {
      acc.push(parts.slice(0, i + 1).join(':'));
      return acc;
    }, []);
  });
  dataChunks.addFacet('url', (bundle) => bundle.domain || bundle.url);

  dataChunks.addFacet('vitals', (bundle) => {
    const cwv = ['cwvLCP', 'cwvCLS', 'cwvINP'];
    return cwv
      .filter((metric) => bundle[metric])
      .map((metric) => scoreCWV(bundle[metric], metric.toLowerCase().slice(3)) + metric.slice(3));
  });

  dataChunks.addFacet('checkpoint', (bundle) => Array.from(bundle.events.reduce((acc, evt) => {
    acc.add(evt.checkpoint);
    return acc;
  }, new Set())), 'every');

  // this is a bad name, fulltext would be better
  // but I'm keeping it for compatibility reasons
  dataChunks.addFacet('filter', (bundle) => {
    // this function is also a bit weird, because it takes
    // the filtertext into consideration
    const fullText = bundle.url + bundle.events.map((e) => e.checkpoint).join(' ');
    const keywords = filterText
      .split(' ')
      .filter((word) => word.length > 2);
    const matching = keywords
      .filter((word) => fullText.indexOf(word) > -1);
    if (matching.length === keywords.length && filterText.length > 2) {
      matching.push(params.get('filter'));
    }
    return matching;
  });

  // if we have a checkpoint filter, then we also want facets for
  // source and target
  checkpoint
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
            .reduce((acc, { target }) => { acc.add(target); return acc; }, new Set()),
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
  dataChunks.filter = Array.from(params
    .entries())
    .filter(([key]) => false // TODO: find a better way to filter out non-facet keys
      || key === 'userAgent'
      || (key === 'filter' && filterText.length > 2)
      || key === 'url'
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
      || key === 'checkpoint')
    .reduce((acc, [key, value]) => {
      if (acc[key]) acc[key].push(value);
      else acc[key] = [value];
      return acc;
    }, {});
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
  });

  const focus = params.get('focus');
  const mode = params.get('metrics');
  elems.sidebar.updateFacets(focus, mode);

  // eslint-disable-next-line no-console
  console.log(`full ui updated in ${new Date() - startTime}ms`);
}

async function loadData(scope) {
  const params = new URL(window.location.href).searchParams;
  const endDate = params.get('endDate') ? `${params.get('endDate')}T00:00:00` : null;

  if (scope === 'week') {
    dataChunks.load(await loader.fetchLastWeek(endDate));
  }
  if (scope === 'month') {
    dataChunks.load(await loader.fetchPrevious31Days(endDate));
  }
  if (scope === 'year') {
    dataChunks.load(await loader.fetchPrevious12Months(endDate));
  }

  draw();
}

export function updateState() {
  const url = new URL(window.location.href.split('?')[0]);
  const { searchParams } = new URL(window.location.href);
  url.searchParams.set('domain', DOMAIN);
  url.searchParams.set('filter', elems.filterInput.value);
  url.searchParams.set('view', elems.viewSelect.value);
  if (searchParams.get('endDate')) url.searchParams.set('endDate', searchParams.get('endDate'));
  if (searchParams.get('metrics')) url.searchParams.set('metrics', searchParams.get('metrics'));
  const selectedMetric = document.querySelector('.key-metrics li[aria-selected="true"]');
  if (selectedMetric) url.searchParams.set('focus', selectedMetric.id);
  const drilldown = new URL(window.location).searchParams.get('drilldown');
  if (drilldown) url.searchParams.set('drilldown', drilldown);

  elems.sidebar.querySelectorAll('input').forEach((e) => {
    if (e.checked) {
      url.searchParams.append(e.id.split('=')[0], e.value);
    }
  });
  url.searchParams.set('domainkey', searchParams.get('domainkey') || 'incognito');
  window.history.replaceState({}, '', url);
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
      console.log('sidebar change');
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
    const view = params.get('view') || 'week';

    elems.incognito.addEventListener('change', async () => {
      loader.domainKey = elems.incognito.getAttribute('domainkey');
      await loadData(view);
      herochart.draw();
    });

    herochart.render();
    // sidebar.updateFacets();

    elems.filterInput.value = params.get('filter');
    elems.viewSelect.value = view;
    setDomain(params.get('domain') || 'www.thinktanked.org', params.get('domainkey') || '');
    const focus = params.get('focus');
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
        window.location = `${window.location.pathname}?domain=${domain}&view=month`;
      }
    });

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    elems.timezoneElement.textContent = timezone;

    if (elems.incognito.getAttribute('domainkey')) {
      loadData(view);
    }

    elems.filterInput.addEventListener('input', () => {
      updateState();
      draw();
    });

    elems.viewSelect.addEventListener('input', () => {
      updateState();
      window.location.reload();
    });

    if (focus) {
      const keyMetric = document.getElementById(focus);
      if (keyMetric) keyMetric.ariaSelected = 'true';
    }

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
  }
});

io.observe(section);
