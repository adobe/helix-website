import { fetchPlaceholders } from '../../scripts/lib-franklin.js';
import { filterBundle, DataChunks } from './cruncher.js';
import CWVTimeLineChart from './cwvtimeline.js';
import DataLoader from './loader.js';
import { toHumanReadable, UA_KEY, scoreCWV } from './utils.js';

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
  <div class="chart-container">
    <canvas id="time-series"></canvas>
  </div>
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
// const API_ENDPOINT = 'https://rum-bundles-2.david8603.workers.dev/rum-bundles';
// const UA_KEY = 'user_agent';

const viewSelect = document.getElementById('view');
const filterInput = document.getElementById('filter');
const facetsElement = document.getElementById('facets');
const canvas = document.getElementById('time-series');
const timezoneElement = document.getElementById('timezone');
const lowDataWarning = document.getElementById('low-data-warning');

const dataChunks = new DataChunks();

const loader = new DataLoader();
loader.apiEndpoint = API_ENDPOINT;

const timelinechart = new CWVTimeLineChart();

function setDomain(domain, key) {
  DOMAIN = domain;
  DOMAIN_KEY = key;
  loader.domain = domain;
  loader.domainKey = key;
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

  const filtered = dataChunks.filter((bundle) => filterBundle(bundle, filter, facets, cwv));

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

  timelinechart.config = config;
  const { labels, datasets, stats } = timelinechart.createChartData(filtered, endDate);
  datasets.forEach((ds, i) => {
    chart.data.datasets[i].data = ds.data;
  });
  chart.data.labels = labels;
  chart.options.scales.x.time.unit = config.unit;
  chart.update();

  // eslint-disable-next-line no-console
  console.log(`filtered to ${filtered.length} bundles in ${new Date() - startTime}ms`);
  updateFacets(facets, cwv, focus, mode, ph);
  const statsKeys = Object.keys(stats);
  // eslint-disable-next-line no-console
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
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
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
        ticks: {
          callback: (value) => toHumanReadable(value),
        },
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
