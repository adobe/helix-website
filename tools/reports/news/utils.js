const BUNDLER_ENDPOINT = 'https://rum.fastly-aem.page';
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

const getConfig = () => {
  const config = {
    domain: getDomain(),
    domainKey: searchParams.get('domainkey') || '',
    apiEndpoint: API_ENDPOINT,
    start: searchParams.get('start'),
    end: searchParams.get('end'),
    url: getURL(),
  };

  return config;
};

const fetchDetails = async (url) => {
  const resp = await fetch(url);
  const html = await resp.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const title = doc.querySelector('h1')?.textContent || doc.querySelector('title')?.textContent || '';
  const description = doc.querySelector('meta[name="description"]')?.content || '';
  const author = doc.querySelector('meta[name="author"]')?.content || '';

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
    title, description, url, author, publicationDate, img,
  };
};

const toReportURL = (url) => {
  const u = new URL(window.location.href);
  u.searchParams.delete('url');
  u.searchParams.set('url', url);
  return u.toString();
};

export {
  getURL,
  getDomain,
  getConfig,
  fetchDetails as getDetails,
  toReportURL,
  BUNDLER_ENDPOINT,
  API_ENDPOINT,
  searchParams,
};
