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

const fetchDetails = async (url, articlesRootURL) => {
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

const toReportURL = (url) => {
  const u = new URL(window.location.href);
  u.searchParams.delete('url');
  u.searchParams.set('url', url);
  return u.toString();
};

export {
  getURL,
  getDomain,
  getarticlesRootURL,
  getConfig,
  fetchDetails as getDetails,
  toReportURL,
  BUNDLER_ENDPOINT,
  API_ENDPOINT,
};
