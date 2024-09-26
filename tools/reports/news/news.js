// eslint-disable-next-line import/no-relative-packages
import { DataChunks } from './cruncher.js';
import DataLoader from './loader.js';

import {
//   parseConversionSpec,
//   parseSearchParams,
//   isKnownFacet,
//   scoreCWV,
  toHumanReadable,
//   computeConversionRate,
} from './utils.js';

// /* globals */
// let DOMAIN = 'www.thinktanked.org';

const BUNDLER_ENDPOINT = 'https://rum.fastly-aem.page';
// const BUNDLER_ENDPOINT = 'http://localhost:3000';
const API_ENDPOINT = BUNDLER_ENDPOINT;

const { searchParams } = new URL(window.location);

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

const getarticlesRootURL = () => {
  const url = getURL();
  const { pathname, origin } = new URL(url);
  // find year in pathname
  const year = pathname.match(/\/\d{4}\//);
  if (!year) {
    throw new Error('No year found in pathname');
  }
  return `${origin}${pathname.substring(0, year.index)}`;
};

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

    this.dataChunks = new DataChunks();

    this.dataChunks.addSeries('pageViews', (bundle) => bundle.weight);
    this.dataChunks.addFacet('url', (bundle) => bundle.url);

    const prefix = this.root;

    this.dataChunks.addFacet('underroot', (bundle) => {
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
    this.dataChunks.addFacet('inrange', (bundle) => {
      if (!bundle.url || !bundle.url.startsWith(prefix)) return false;
      for (let i = 0; i < possiblePrefixes.length; i += 1) {
        if (bundle.url.startsWith(possiblePrefixes[i])) {
          return true;
        }
      }
      return false;
    });

    this.dataChunks.load(this.data);
  }

  getURLs() {
    console.log('this.dataChunks.facets', this.dataChunks.facets);
    return this.dataChunks.facets.url;
  }

  set filter(filter) {
    this.dataChunks.filter = filter;
  }
}

const getConfig = () => {
  const config = {
    domain: getDomain(),
    domainKey: searchParams.get('domainkey') || '',
    apiEndpoint: API_ENDPOINT,
    start: searchParams.get('start'),
    end: searchParams.get('end'),
    url: getURL(),
    articlesRootURL: getarticlesRootURL(),
  };

  return config;
};

const getDetails = async (url, articlesRootURL) => {
  const resp = await fetch(url);
  const html = await resp.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const title = doc.querySelector('title')?.textContent || '';
  const description = doc.querySelector('meta[name="description"]')?.content || '';
  const author = doc.querySelector('meta[name="author"]')?.content || '';

  let publicationDate = doc.querySelector('meta[name="publication-date"]')?.content;
  if (!publicationDate) {
    // extract date from url
    const pathname = url.substring(articlesRootURL.length + 1);
    const date = pathname.match(/\d{4}\/\d{2}\/\d{2}/);
    publicationDate = date ? date[0] : '';
  }

  return {
    title, description, url, author, publicationDate,
  };
};

const main = async () => {
  const config = getConfig();

  const period = document.getElementById('period');
  period.innerHTML = `from ${config.start} to ${config.end}`;

  getDetails(config.url, config.articlesRootURL).then((details) => {
    const detailsElement = document.getElementById('details');
    detailsElement.innerHTML = `
      <ul>
        <li><label>URL: </label><a href="${details.url}" target="_blank">${details.url}</a></li>
        <li><label>Title: </label><span>${details.title}</span></li>
        <li><label>Auhor: </label><span>${details.author}</span></li>
        <li><label>Publication Date: </label><span>${details.publicationDate}</span></li>
        <li><label>Description: </label><span>${details.title}</p></span>
      </ul>
    `;
  });

  const report = new URLReports(config);
  report.init().then(() => {
    report.filter = {
      underroot: [true],
    };

    let urls = report.getURLs();

    const top10Element = document.getElementById('top10');
    let ul = document.createElement('ul');
    top10Element.appendChild(ul);
    for (let i = 0; i < Math.min(10, urls.length); i += 1) {
      const entry = urls[i];
      const metrics = entry.getMetrics(['pageViews']);
      const li = document.createElement('li');
      li.innerHTML = `<a href="${entry.value}" target="_blank">${entry.value} (${toHumanReadable(metrics.pageViews.sum)})</a>`;
      ul.appendChild(li);
    }

    report.filter = {
      inrange: [true],
    };

    urls = report.getURLs();

    const top10ReleasedElement = document.getElementById('top10released');
    ul = document.createElement('ul');
    top10ReleasedElement.appendChild(ul);
    for (let i = 0; i < Math.min(10, urls.length); i += 1) {
      const entry = urls[i];
      const metrics = entry.getMetrics(['pageViews']);
      const li = document.createElement('li');
      li.innerHTML = `<a href="${entry.value}" target="_blank">${entry.value} / (${toHumanReadable(metrics.pageViews.sum)})</a>`;
      ul.appendChild(li);
    }
  });
};

main();
