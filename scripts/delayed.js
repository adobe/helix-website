// eslint-disable-next-line import/no-cycle
import { sampleRUM } from './lib-franklin.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here

async function preloadPage(href) {
  const hrefURL = new URL(href);
  if (hrefURL.origin === window.location.origin) {
    const resp = await fetch(href);
    const html = await resp.text();
    const dom = new DOMParser().parseFromString(html, 'text/html');
    const picture = dom.querySelector('picture');
    if (picture) {
      const imgLoader = document.createElement('div');
      imgLoader.append(picture);
      picture.querySelector('img').loading = 'eager';
    }
  }
}

document.querySelectorAll('.side-navigation a[href]').forEach((a) => {
  preloadPage(a.href);
});
