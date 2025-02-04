import { URLReports, SERIES } from './news.js';
import {
  getConfig,
  getDetails,
  searchParams,
  truncate,
} from './utils.js';

/**
 * Initializes form parameters and syncs them with URL search parameters.
 * @param {Document} doc - Document object.
 */
function initParams(doc) {
  const form = doc.querySelector('.params form');

  const year = searchParams.get('year');
  const yearField = form.querySelector('#year');
  yearField.addEventListener('input', () => {
    const u = new URL(window.location.href);
    u.searchParams.delete('year');
    u.searchParams.set('year', yearField.value);
  });

  yearField.value = year || '2024';

  const button = form.querySelector('button');
  button.addEventListener('click', (e) => {
    e.preventDefault();

    const u = new URL(window.location.href);
    u.searchParams.set('year', yearField.value);
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

const groupBy = () => {
  const config = getConfig();

  const groupFn = (bundle) => {
    const slotTime = new Date(bundle.timeSlot);
    return slotTime.toLocaleString('default', { month: 'short' }).toLowerCase();
  };

  groupFn.fillerFn = (existing) => {
    const startDate = new Date(config.from);
    const endDate = new Date(config.to);

    const slots = new Set(existing);
    const slotTime = new Date(startDate);
    let maxSlots = 1000;
    while (slotTime <= endDate) {
      const { unit } = this.chartConfig;
      slots.add(truncate(slotTime, unit));
      slotTime.setMonth(slotTime.getMonth() + 1);
      maxSlots -= 1;
      if (maxSlots < 0) {
        // eslint-disable-next-line no-console
        console.error('Too many slots');
        break;
      }
    }
    return Array.from(slots);
  };

  return groupFn;
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

      const url = entry.value;
      report.filter = {
        url: [url],
        inrange: [true],
        ...getGlobalFilters(),
      };

      report.getDataChunks().group(groupBy());
      const { aggregates } = report.getDataChunks();

      const monthly = [];
      for (let i = 0; i < 12; i += 1) {
        // 3 letter month
        const month = new Date(0, i).toLocaleString('default', { month: 'short' }).toLowerCase();
        if (aggregates[month]) {
          const pv = SERIES.pageViews.rateFn(aggregates[month]);
          const clicks = SERIES.clicks.rateFn(aggregates[month]);
          const br = SERIES.bounce.rateFn(aggregates[month]);
          const pt = SERIES.paid.rateFn(aggregates[month]);
          const cr = SERIES.conversions.rateFn(aggregates[month]);

          monthly.push({
            month,
            clicks,
            pv,
            br,
            pt,
            cr,
          });
        } else {
          monthly.push({
            month,
            clicks: '',
            pv: '',
            br: '',
            pt: '',
            cr: '',
          });
        }
      }

      return {
        url,
        title: details.title,
        publicationDate: details.publicationDate,
        author: details.author,
        tags: details.tags,
        pageViews,
        bounces,
        paid,
        conversions,
        timeOnPage,
        monthly,
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
    publicationDate,
    pageViews,
    bounces,
    paid,
    conversions,
    timeOnPage,
    monthly,
  }) => {
    const row = postTable.insertRow();
    row.innerHTML = `
      <td><a href="${url}">${url}</a></td>
      <td><a href="./news.html?url=${encodeURIComponent(url)}&domainkey=${config.domainKey}&start=${config.start}&end=${config.end}">${publicationDate}</a></td>
      <td>${pageViews}</td>
      <td>${SERIES.timeOnPage.labelFn(timeOnPage)}</td>
      <td>${SERIES.conversions.labelFn(conversions)}</td>
      <td>${SERIES.bounce.labelFn(bounces)}</td>
      <td>${SERIES.paid.labelFn(paid)}</td>
    `;

    monthly.forEach(({
      pv, br, pt, cr, clicks,
    }) => {
      row.innerHTML += `
        <td>${pv}</td>
        <td>${clicks}</td>
        <td>${br}</td>
        <td>${pt}</td>
        <td>${cr}</td>
      `;
    });
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
