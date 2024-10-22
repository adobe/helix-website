import { URLReports, SERIES } from './news.js';
import {
  getConfig,
  getDetails,
  searchParams,
} from './utils.js';

import buildTop10TableBlock from './pods/top10.js';

function buildSummary(name, label, value) {
  const section = document.createElement('div');
  section.className = `summary ${name}`;
  section.innerHTML = `<p class="summary-value">${value}</p>
    <p class="summary-label">${label}</p>`;
  return section;
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

  const button = form.querySelector('button');
  button.addEventListener('click', (e) => {
    e.preventDefault();

    const u = new URL(window.location.href);
    u.searchParams.set('url', urlInput.value);
    u.searchParams.set('start', from.value);
    u.searchParams.set('end', to.value);
    u.searchParams.set('domainkey', searchParams.get('domainkey'));

    window.location.href = u.toString();
  });
}

const main = async () => {
  init(document);
  const config = getConfig();

  // const period = document.getElementById('period');
  // period.innerHTML = `from ${config.start} to ${config.end}`;

  getDetails(config.url, config.articlesRootURL).then((details) => {
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
      url: [config.url],
    };

    let urls = report.getURLs();
    const currentPageEntry = urls.find((entry) => entry.value === config.url);

    if (!currentPageEntry) {
      throw new Error('Current page not found in report');
    }

    const metrics = currentPageEntry.getMetrics(['pageViews', 'organic', 'visits', 'bounces', 'engagement', 'conversions', 'timeOnPage']);

    const summaries = document.querySelector('.summary-container');
    Object.keys(SERIES).forEach((key) => {
      const s = SERIES[key];
      const value = s.rateFn(metrics);
      const display = s.labelFn(value);

      const summary = buildSummary(key, s.label, key !== 'pageViews' ? display : value.toLocaleString());
      summaries.append(summary);
    });

    // const mediaElement = document.getElementById('media');
    // ul = document.createElement('ul');
    // mediaElement.appendChild(ul);

    // media.forEach((mi) => {
    //   const li = document.createElement('li');
    //   li.classList.add('media');
    // eslint-disable-next-line max-len
    //   li.innerHTML = `<img src="${config.url}/${mi.value}"> / ${mi.value} / ${toHumanReadable(mi.weight)}`;
    //   ul.appendChild(li);
    // });

    report.filter = {
      underroot: [true],
    };

    urls = report.getURLs();

    buildTop10TableBlock(
      urls,
      currentPageEntry,
      config,
      'top-overall-period',
    );

    report.filter = {
      inrange: [true],
    };

    urls = report.getURLs();

    buildTop10TableBlock(
      urls,
      currentPageEntry,
      config,
      'top-publish-period',
    );
  });
};

main();
