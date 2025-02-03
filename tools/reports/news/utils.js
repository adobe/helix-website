const BUNDLER_ENDPOINT = 'https://rum.fastly-aem.page';
const API_ENDPOINT = BUNDLER_ENDPOINT;

const { searchParams } = new URL(window.location);

/**
 * Returns a human readable number
 * @param {Number} num a number
 * @param {Number} precision the number of significant digits
 * @returns {String} a human readable number
 */
export function toHumanReadable(num, precision = 2) {
  if (Number.isNaN(num)) return '-';
  const formatter = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumSignificantDigits: precision,
  });
  return formatter.format(num).toLocaleLowerCase();
}

const getURL = () => {
  const url = searchParams.get('url');
  return url;
};

const getConfig = () => {
  const config = {
    domainKey: searchParams.get('domainkey') || '',
    apiEndpoint: API_ENDPOINT,
    start: searchParams.get('start'),
    end: searchParams.get('end'),
    url: getURL(),
  };

  return config;
};

export function cssVariable(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name);
}

const fetchDetails = async (url) => {
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`Failed to fetch details for ${url}`);
  }
  const html = await resp.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const title = doc.querySelector('h1')?.textContent || doc.querySelector('title')?.textContent || '';
  const description = doc.querySelector('meta[name="description"]')?.content || '';
  const author = doc.querySelector('meta[name="author"]')?.content || '';
  const tags = Array.from(doc.querySelectorAll('meta[property="article:tag"]'))
    .map((tag) => tag.getAttribute('content'))
    .filter(Boolean);

  let publicationDate = doc.querySelector('meta[name="publication-date"]')?.content;
  if (!publicationDate) {
    // extract date from url
    const u = new URL(url);
    const date = u.pathname.match(/\d{4}\/\d{2}\/\d{2}/);
    publicationDate = date ? date[0] : '';
  }

  let img = doc.querySelector('img[src]');
  if (img) {
    img = {
      src: new URL(img.getAttribute('src'), url).href,
      alt: img.alt || '',
      width: img.width || '',
      height: img.height || '',
    };
  } else img = '';

  return {
    title, description, url, author, publicationDate, img, tags,
  };
};

const toReportURL = (url) => {
  const u = new URL(window.location.href);
  u.searchParams.delete('url');
  u.searchParams.set('url', url);
  return u.toString();
};

function toISOStringWithTimezone(date) {
  // Pad a number to 2 digits
  const pad = (n) => `${Math.floor(Math.abs(n))}`.padStart(2, '0');

  // Get timezone offset in ISO format (+hh:mm or -hh:mm)
  const getTimezoneOffset = () => {
    const tzOffset = -date.getTimezoneOffset();
    const diff = tzOffset >= 0 ? '+' : '-';
    return `${diff}${pad(tzOffset / 60)}:${pad(tzOffset % 60)}`;
  };

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}${getTimezoneOffset()}`;
}

function truncate(time, unit) {
  const t = new Date(time);
  // truncate to the beginning of the hour
  t.setMinutes(0);
  t.setSeconds(0);
  // truncate to the beginning of the day
  if (unit !== 'hour') t.setHours(0);
  // truncate to the beginning of the week, if the unit is week
  if (unit === 'week') t.setDate(t.getDate() - t.getDay());
  // truncate to the beginning of the month, if the unit is month
  if (unit === 'month') t.setDate(1);
  return toISOStringWithTimezone(t);
}

export {
  getURL,
  getConfig,
  fetchDetails as getDetails,
  toReportURL,
  truncate,
  BUNDLER_ENDPOINT,
  API_ENDPOINT,
  searchParams,
};
