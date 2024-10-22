import { URLReports, SERIES } from './news.js';
import {
  getConfig,
  getDetails,
  toReportURL,
  searchParams,
} from './utils.js';

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
          <a href="${toReportURL(entry.value)}" target="_blank">
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

    // const media = report.getMedia();
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

    buildTableBlock(
      urls,
      currentPageEntry,
      config,
      'top-overall-period',
    );

    report.filter = {
      inrange: [true],
    };

    urls = report.getURLs();

    buildTableBlock(
      urls,
      currentPageEntry,
      config,
      'top-publish-period',
    );
  });
};

main();
