// eslint-disable-next-line import/no-relative-packages
import { DataChunks } from './cruncher.js';
import DataLoader from './loader.js';

import {
  toHumanReadable,
  reclassifyAcquisition,
  parseConversionSpec,
} from './utils.js';

const BUNDLER_ENDPOINT = 'https://rum.fastly-aem.page';
// const BUNDLER_ENDPOINT = 'http://localhost:3000';
const API_ENDPOINT = BUNDLER_ENDPOINT;

const { searchParams } = new URL(window.location);

class URLReports {
  constructor(config) {
    this.start = config.start;
    this.end = config.end;
    this.data = null;
    this.root = config.articlesRootURL;

    const loader = new DataLoader();
    loader.apiEndpoint = API_ENDPOINT;
    loader.domain = config.domain;
    loader.domainKey = config.domainKey;

    this.loader = loader;
  }

  async init() {
    this.data = await this.loader.fetchPeriod(this.start, this.end);

    const dataChunks = new DataChunks();

    dataChunks.addSeries('pageViews', (bundle) => bundle.weight);
    dataChunks.addSeries('visits', (bundle) => (bundle.visit ? bundle.weight : 0));
    // a bounce is a visit without a click
    dataChunks.addSeries('bounces', (bundle) => (bundle.visit && !bundle.events.find(({ checkpoint }) => checkpoint === 'click')
      ? bundle.weight
      : 0));
    dataChunks.addSeries('engagement', (bundle) => (dataChunks.hasConversion(bundle, { checkpoint: ['click'] })
      ? bundle.weight
      : 0));

    dataChunks.addSeries('conversions', (bundle) => (dataChunks.hasConversion(bundle, parseConversionSpec())
      ? bundle.weight
      : 0));

    // our series are the different kinds of success metrics that exist
    // for each of the different breakdowns of the selected drilldown facet
    // these are the columns of the matrix
    // - pages per visit (provided by slicer)
    // - bounce rate (provided by slicer)
    // - earned percentage
    // - engagement (provided by slicer)
    // - conversion rate (if defined)
    // - we also show the core web vitals as additional series

    dataChunks.addSeries('earned', (bundle) => {
      const reclassified = bundle.events
        .map(reclassifyAcquisition);
      if (!reclassified.find((evt) => evt.checkpoint === 'enter')) {
        // we only consider enter events
        return 0;
      }
      if (!reclassified.find((evt) => evt.checkpoint === 'acquisition')) {
        // this is fully organic, as there are no traces of any acquisition
        return bundle.weight;
      }
      if (reclassified.find((evt) => evt.checkpoint === 'acquisition' && evt.source.startsWith('paid'))) {
        // this is paid, as there is at least one paid acquisition
        return 0;
      }
      if (reclassified.find((evt) => evt.checkpoint === 'acquisition' && evt.source.startsWith('owned'))) {
        // owned does not count as organic, sorry
        return 0;
      }
      return 0;
    });

    dataChunks.addFacet('url', (bundle) => bundle.url);

    const prefix = this.root;

    dataChunks.addFacet('underroot', (bundle) => {
      if (!bundle.url) return false;
      return bundle.url.startsWith(prefix);
    });

    const possiblePrefixes = [];
    const s = new Date(this.start);
    const e = new Date(this.end);

    // iterate each day between start and end
    for (let d = s; d <= e; d.setDate(d.getDate() + 1)) {
      const day = new Date(d);
      const datePattern = day.toISOString().split('T')[0].replace(/-/g, '/');
      const pattern = `${prefix}/${datePattern}`;
      possiblePrefixes.push(pattern);
    }
    dataChunks.addFacet('inrange', (bundle) => {
      if (!bundle.url || !bundle.url.startsWith(prefix)) return false;
      for (let i = 0; i < possiblePrefixes.length; i += 1) {
        if (bundle.url.startsWith(possiblePrefixes[i])) {
          return true;
        }
      }
      return false;
    });

    dataChunks.load(this.data);
    this.dataChunks = dataChunks;
  }

  getURLs() {
    return this.dataChunks.facets.url;
  }

  set filter(filter) {
    this.dataChunks.filter = filter;
  }
}

// const toReportURL = (url) => {
//   const u = new URL(window.location.href);
//   u.searchParams.delete('url');
//   u.searchParams.set('url', url);
//   return u.toString();
// };

const getDetails = async (url, articlesRootURL) => {
  const resp = await fetch(url);
  const html = await resp.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const title = doc.querySelector('h1')?.textContent || '';
  const description = doc.querySelector('meta[name="description"]')?.content || '';
  const author = doc.querySelector('meta[name="author"]')?.content || '';

  let publicationDate = doc.querySelector('meta[name="publication-date"]')?.content;
  if (!publicationDate) {
    // extract date from url
    const pathname = url.substring(articlesRootURL.length + 1);
    const date = pathname.match(/\d{4}\/\d{2}\/\d{2}/);
    publicationDate = date ? date[0] : '';
  }

  let img = doc.querySelector('img[src]');
  if (img) {
    img = {
      src: new URL(new URL(img.src).pathname, articlesRootURL).href,
      alt: img.alt || '',
      width: img.width || '',
      height: img.height || '',
    };
  } else img = '';

  return {
    title, description, url, author, publicationDate, img,
  };
};

const SERIES = {
  pageViews: {
    label: 'Page Views',
    rateFn: (aggregate) => aggregate.pageViews.sum,
    labelFn: (value) => toHumanReadable(value),
  },
  bounce: {
    label: 'Bounce Rate',
    rateFn: (aggregate) => Math.round(
      (100 * aggregate.bounces.sum) / aggregate.visits.sum,
    ),
    labelFn: (value) => `${value || 0}%`,
  },
  engagement: {
    label: 'Page Engagement',
    rateFn: (aggregate) => Math.round(
      (100 * aggregate.engagement.sum) / aggregate.pageViews.sum,
    ),
    labelFn: (value) => `${value || 0}%`,
  },
  conversions: {
    label: 'Conversion Rate',
    rateFn: (aggregate) => Math.min(Math.round(
      (100 * aggregate.conversions.sum) / aggregate.visits.sum,
    ), 100),
    labelFn: (value) => `${value}%`,
  },
  pagesPerVisit: {
    label: 'Visit Depth',
    // eslint-disable-next-line max-len
    rateFn: (aggregate) => (aggregate.visits.sum ? Math.round(aggregate.pageViews.sum / aggregate.visits.sum) : 0),
    labelFn: (value) => {
      if (!value) return '0 pages';
      return value > 1 ? `${value} pages` : `${value} page`;
    },
  },
  earned: {
    label: 'Earned Percentage',
    rateFn: (aggregate) => Math.round(
      (100 * aggregate.earned.sum) / aggregate.visits.sum,
    ),
    labelFn: (value) => `${value || 0}%`,
  },
};

const getURL = () => {
  const url = searchParams.get('url');

  if (!url) {
    throw new Error('No url provided');
  }

  return url;
};

const getDomain = () => {
  const url = getURL();

  const { hostname } = new URL(url);
  return hostname;
};

const getArticlesRootURL = () => {
  const url = getURL();
  const { pathname, origin } = new URL(url);
  // find year in pathname
  const year = pathname.match(/\/\d{4}\//);
  if (!year) {
    throw new Error('No year found in pathname');
  }
  return `${origin}${pathname.substring(0, year.index)}`;
};

const getConfig = () => {
  const config = {
    domain: getDomain(),
    domainKey: searchParams.get('domainkey') || '',
    apiEndpoint: API_ENDPOINT,
    start: searchParams.get('start'),
    end: searchParams.get('end'),
    url: getURL(),
    articlesRootURL: getArticlesRootURL(),
  };

  return config;
};

function buildSummary(name, label, value) {
  const section = document.createElement('div');
  section.className = `summary ${name}`;
  section.innerHTML = `<p class="summary-value">${value}</p>
    <p class="summary-label">${label}</p>`;
  return section;
}

function buildTableEl(label) {
  const table = document.createElement('table');
  const caption = document.createElement('caption');
  caption.innerHTML = 'Top <span class="top-total"></span> Blog Posts by Page Views';
  const head = document.createElement('thead');
  head.innerHTML = `<tr>
      <th scope="col">Blog Post</th>
      <th scope="col"><span data-before="by">${label}</span></th>
    </tr>`;
  const body = document.createElement('tbody');
  const foot = document.createElement('tfoot');
  foot.innerHTML = `<tr>
      <td><span class="post-count"></span> blog posts</td>
      <td class="metric-sum"><span data-before="with" data-after="page views"></span></td>
    </tr>`;
  table.append(caption, head, body, foot);
  return table;
}

function buildTableBlock(urls, currentEntry, config, id) {
  const container = document.getElementById(id);
  if (container) {
    const table = buildTableEl('Page Views');
    container.append(table);
    const body = table.querySelector('tbody');
    let sum = 0;
    let i = 0;
    for (i; i < Math.min(10, urls.length); i += 1) {
      const entry = urls[i];
      const metrics = entry.getMetrics(['pageViews']);
      const series = SERIES.pageViews;
      const rate = series.rateFn(metrics);
      sum += rate;
      const row = document.createElement('tr');
      if (entry && entry.value === currentEntry.value) {
        row.className = 'entry-match';
      }
      row.innerHTML = `<td>
          <a href="${entry.value}" target="_blank">
            ${entry.value.replace(config.articlesRootURL, '')}
          </a>
        </td>
        <td>
          <span class="bar" data-value="${rate}"></span>
          <span>${rate.toLocaleString()}</span>
        </td>`;
      body.append(row);
    }

    // populate table footer
    const foot = table.querySelector('tfoot');
    foot.querySelector('.post-count').textContent = i.toLocaleString();
    foot.querySelector('.metric-sum span').textContent = sum.toLocaleString();

    // update bars with the percentage width
    const bars = body.querySelectorAll('td .bar');
    bars.forEach((bar) => {
      const value = parseInt(bar.dataset.value, 10);
      const percentage = Math.floor((value / sum) * 100);
      bar.style.width = `${percentage}%`;
    });

    // populate table caption
    const caption = table.querySelector('caption');
    caption.querySelector('.top-total').textContent = i;
  }
}

function formatDateString(date) {
  try {
    const dateObj = new Date(date);
    return dateObj.toISOString().split('T')[0];
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(date, 'is not a valid date.');
  }
  return null;
}

function init(doc) {
  const form = doc.querySelector('.params form');
  // setup form
  const url = searchParams.get('url');
  const urlInput = form.querySelector('#post-url');
  urlInput.addEventListener('input', () => {
    const u = new URL(window.location.href);
    u.searchParams.delete('url');
    u.searchParams.set('url', urlInput.value);
  });
  if (url) {
    urlInput.value = url;
  }
  const start = searchParams.get('start');
  const from = form.querySelector('#from-date');
  from.addEventListener('input', () => {
    const u = new URL(window.location.href);
    u.searchParams.delete('start');
    u.searchParams.set('start', from.value);
  });
  if (start && formatDateString(start)) {
    from.value = formatDateString(start);
  } else { // set default start date (7 days ago)
    const now = new Date();
    now.setDate(now.getDate() - 7);
    from.value = formatDateString(now);
  }
  const end = searchParams.get('end');
  const to = form.querySelector('#to-date');
  to.addEventListener('input', () => {
    const u = new URL(window.location.href);
    u.searchParams.delete('end');
    u.searchParams.set('end', to.value);
  });
  if (end && formatDateString(end)) {
    to.value = formatDateString(end);
  } else { // set default end date (today)
    to.value = formatDateString(new Date());
  }

  // const button = form.querySelector('button');
  // button.addEventListener('click', (e) => {
  //   e.preventDefault();

  // });
}

init(document);

const populateData = async () => {
  const config = getConfig();

  // const period = document.getElementById('period');
  // period.innerHTML = `from ${config.start} to ${config.end}`;

  getDetails(config.url, config.articlesRootURL).then((details) => {
    // populate post
    const post = document.getElementById('post');
    Object.keys(details).forEach((key) => {
      const el = post.querySelector(`.post-${key}`);
      if (el) {
        el.textContent = details[key];
      } else if (key === 'url') {
        const title = post.querySelector('.post-title');
        title.setAttribute('href', details[key]);
      } else if (key === 'img') {
        const data = details[key];
        const img = post.querySelector('.post-image');
        img.src = data.src;
        img.alt = data.alt;
        if (data.width) img.width = data.width;
        if (data.height) img.height = data.height;
      }
    });
    post.addEventListener('click', () => {
      post.querySelector('a[href]').click();
    });
  });

  const report = new URLReports(config);
  report.init().then(() => {
    report.filter = {
      underroot: [true], // filter for overall period
    };
    let urls = report.getURLs();

    const currentEntry = urls.find((entry) => entry.value === config.url);

    // populate metrics
    if (currentEntry) {
      const summaries = document.querySelector('.summary-container');
      const metrics = currentEntry.getMetrics(['pageViews', 'earned', 'visits', 'bounces', 'engagement', 'conversions']);
      Object.keys(SERIES).forEach((key) => {
        const series = SERIES[key];
        const value = series.rateFn(metrics);
        const display = series.labelFn(value);
        const summary = buildSummary(key, series.label, key !== 'pageViews' ? display : value.toLocaleString());
        summaries.append(summary);
      });
    }

    // build table for overall period
    buildTableBlock(
      urls,
      currentEntry,
      config,
      'top-overall-period',
    );

    // build table for publish period
    report.filter = {
      inrange: [true], // filter for publish period
    };
    urls = report.getURLs();

    buildTableBlock(
      urls,
      currentEntry,
      config,
      'top-publish-period',
    );
  });
};

populateData();
