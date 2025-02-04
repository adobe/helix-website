import { URLReports, SERIES } from './news.js';
import {
  getConfig,
  getDetails,
  searchParams,
} from './utils.js';

/**
 * Formats a given date string into the `YYYY-MM-DD` format.
 * @param {string|Date} date - Date to format.
 * @returns {string|null} Formatted date string (or `null` if date is invalid).
 */
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

/**
 * Initializes form parameters and syncs them with URL search parameters.
 * @param {Document} doc - Document object.
 */
function initParams(doc) {
  const form = doc.querySelector('.params form');

  // setup start field/parameter
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
  // setup end field/parameter
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
    u.searchParams.set('start', from.value);
    u.searchParams.set('end', to.value);
    u.searchParams.set('domainkey', searchParams.get('domainkey'));

    window.location.href = u.toString();
  });
}

let report;

const getGlobalFilters = () => {
  const device = document.querySelector('[name="device"]:checked').value;
  const filters = {};
  if (device !== 'all') {
    filters.userAgent = [device];
  }
  return filters;
};

const getDataset = async () => {
  report.filter = {
    inrange: [true],
    ...getGlobalFilters(),
  };

  const urls = report.getURLs();

  const dataset = (await Promise.all(urls.map(async (entry) => {
    try {
      const details = await getDetails(entry.value);

      const metrics = entry.getMetrics([
        'pageViews', 'organic', 'visits', 'bounces', 'engagement', 'conversions', 'timeOnPage',
      ]);

      const pageViews = SERIES.pageViews.rateFn(metrics);
      const bounces = SERIES.bounce.rateFn(metrics);
      const paid = SERIES.paid.rateFn(metrics);
      const conversions = SERIES.conversions.rateFn(metrics);
      const timeOnPage = SERIES.timeOnPage.rateFn(metrics);

      return {
        url: entry.value,
        title: details.title,
        publicationDate: details.publicationDate,
        author: details.author,
        tags: details.tags,
        pageViews,
        bounces,
        paid,
        conversions,
        timeOnPage,
      };
    } catch (e) {
      return null;
    }
  }))).filter((e) => e);

  return dataset;
};

const draw = async () => {
  const config = getConfig();

  const dataset = await getDataset();

  const postTable = document.querySelector('.post-list tbody');
  postTable.innerHTML = '';

  dataset.forEach(({
    url,
    title,
    publicationDate,
    author,
    tags,
    pageViews,
    bounces,
    paid,
    conversions,
    timeOnPage,
  }) => {
    const row = postTable.insertRow();
    row.innerHTML = `
      <td><a href="${url}">${title}</a></td>
      <td><a href="./news.html?url=${encodeURIComponent(url)}&domainkey=${config.domainKey}&start=${config.start}&end=${config.end}">${publicationDate}</a></td>
      <td>${pageViews}</td>
      <td>${author}</td>
      <td>${SERIES.timeOnPage.labelFn(timeOnPage)}</td>
      <td>${SERIES.conversions.labelFn(conversions)}</td>
      <td>${SERIES.bounce.labelFn(bounces)}</td>
      <td>${SERIES.paid.labelFn(paid)}</td>
      <td>${tags.join(', ')}</td>
    `;
  });
};

const initShare = (doc) => {
  const share = doc.getElementById('share-insights');
  share.addEventListener('click', () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        const tip = doc.createElement('div');
        tip.className = 'share-tip';
        tip.textContent = 'Link copied to clipboard!';
        tip.setAttribute('aria-live', 'polite');
        share.append(tip);
        setTimeout(() => {
          tip.remove();
        }, 3300);
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(`Could not copy ${window.location.href}:`, error);
      });
  });
};

const initFilters = (doc) => {
  const filters = doc.querySelectorAll('.filters input');
  filters.forEach((f) => {
    f.addEventListener('change', () => {
      draw();
    });
  });
};

const main = async () => {
  initParams(document);
  initShare(document);
  initFilters(document);

  const config = getConfig();

  report = new URLReports(config);
  report.init().then(() => {
    draw();
  });
};

main();
