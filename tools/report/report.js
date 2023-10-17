/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
let sitemapURLs = [];
let totalSize = 0;
let totalFiles = 0;
let totalFilesMatched = 0;
let startTime = new Date();
let endTime = 0;

function humanFileSize(bytes, si = false, dp = 1) {
  let numBytes = bytes;
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return `${bytes} B`;
  }

  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  const r = 10 ** dp;

  do {
    numBytes /= thresh;
    u += 1;
  } while (Math.round(Math.abs(numBytes) * r) / r >= thresh && u < units.length - 1);

  return `${numBytes.toFixed(dp)} ${units[u]}`;
}

async function loadSitemap(sitemapURL) {
  const resp = await fetch(sitemapURL);
  const xml = await resp.text();
  const sitemap = new DOMParser().parseFromString(xml, 'text/xml');
  const subSitemaps = [...sitemap.querySelectorAll('sitemap loc')];
  for (let i = 0; i < subSitemaps.length; i += 1) {
    const loc = subSitemaps[i];
    const subSitemapURL = new URL(loc.textContent.trim());
    // eslint-disable-next-line no-await-in-loop
    await loadSitemap(subSitemapURL.pathname);
  }
  const urlLocs = sitemap.querySelectorAll('url loc');
  urlLocs.forEach((loc) => {
    const locURL = new URL(loc.textContent.trim());
    sitemapURLs.push(locURL.pathname);
  });
}

function updateStatus() {
  const status = document.getElementById('status');
  const seconds = Math.floor((endTime - startTime) / 100) / 10;
  status.innerHTML = `Matched Files: ${totalFilesMatched} / ${totalFiles} (${humanFileSize(totalSize, true)}) ${seconds}s`;
}

function metaMatch(pattern, text) {
  const dom = new DOMParser().parseFromString(text, 'text/html');
  const metas = [...dom.querySelectorAll('meta[name], meta[property]')];
  const tags = [
    { name: 'title', value: dom.querySelector('title').textContent },
    { name: 'canonical', value: dom.querySelector('link[rel="canonical"').href },
    ...metas.map((meta) => ({ name: meta.name || meta.getAttribute('property'), value: meta.content })),
  ];

  const matches = tags.filter((tag) => tag.value.indexOf(pattern) >= 0).map((tag) => `${tag.name}: ${tag.value}`);
  return { found: matches.length > 0, matches };
}

function altMatch(pattern, text) {
  const dom = new DOMParser().parseFromString(text, 'text/html');
  const matches = [...dom.querySelectorAll('img')].filter((img) => img.getAttribute('alt').indexOf(pattern) >= 0).map((img) => `${img.getAttribute('src').split('?')[0]}: ${img.getAttribute('alt')}`);
  return { found: matches.length > 0, matches };
}

function imagesMatch(pattern, text) {
  const dom = new DOMParser().parseFromString(text, 'text/html');
  const matches = [...dom.querySelectorAll('img')].filter((img) => img.getAttribute('alt').indexOf(pattern) >= 0).map((img) => `${img.getAttribute('src').split('?')[0]}: ${img.getAttribute('alt')}`);
  return { found: matches.length > 0, matches };
}

function linkMatch(pattern, text) {
  const dom = new DOMParser().parseFromString(text, 'text/html');
  const matches = [...dom.querySelectorAll('a[href]')].filter((a) => a.getAttribute('href').indexOf(pattern) >= 0).map((a) => `${a.textContent}: ${a.getAttribute('href')}`);
  return { found: matches.length > 0, matches };
}

function simpleMatch(pattern, text) {
  return { found: text.indexOf(pattern) >= 0, matches: [] };
}
function matchFile(pattern, text, type) {
  if (type === 'link') return linkMatch(pattern, text);
  if (type === 'meta') return metaMatch(pattern, text);
  if (type === 'alt') return altMatch(pattern, text);
  if (type === 'images') return imagesMatch(pattern, text);

  return simpleMatch(pattern, text);
}

async function fgrep(pathname, pattern, type) {
  const resp = await fetch(pathname, { redirect: 'manual' });
  const text = await resp.text();
  const { found, matches } = matchFile(pattern, text, type);

  const { status } = resp;
  const size = +text.length;
  return ({
    found,
    size,
    status,
    pathname,
    matches,
  });
}

async function edit(path, y) {
  try {
    const statusRes = await fetch(`https://admin.hlx.page/status/adobe/helix-website/main${path}?editUrl=auto`);
    const status = await statusRes.json();
    const editUrl = status.edit && status.edit.url;
    if (y) {
      // scroll back to original position
      window.scrollTo(0, y);
    }
    if (editUrl) {
      window.open(editUrl);
    } else {
      throw new Error('admin did not return an edit url');
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(`failed to get edit url for ${path}`, e);
    // eslint-disable-next-line no-alert
    alert(`failed to get edit url for ${path}`);
  }
}

function showMediaDetails(mediaHash) {
  const dialog = document.getElementById('media-details');
  const dialogContent = document.getElementById('media-details-content');
  dialogContent.textContent = '';

  const resultDisplay = document.getElementById('results');
  const results = resultDisplay.querySelectorAll(`img[src*="${mediaHash}"`);
  results.forEach((res) => {
    const href = res.closest('p').querySelector('a').getAttribute('href');
    const p = document.createElement('p');
    p.innerHTML = `<a href="${href}">${href}</a> [<a href="#${href}">edit</a>]`;
    dialogContent.append(p);
  });
  dialog.showModal();
}

function displayResult(result) {
  const resultDisplay = document.getElementById('results');
  const mediaDisplay = document.getElementById('media');
  totalSize += result.size;
  totalFilesMatched += result.found ? 1 : 0;
  if (result.found) {
    const p = document.createElement('p');
    p.innerHTML = `${humanFileSize(result.size, true).padStart(9, ' ')} <a href="${result.pathname}">${result.pathname}</a> (${result.status})`;
    const editLink = document.createElement('a');
    editLink.className = 'edit';
    editLink.href = `#${result.pathname}`;
    editLink.onclick = () => edit(result.pathname, window.scrollY);
    p.append(' ', editLink);
    result.matches.forEach((match) => {
      if (match.startsWith('./media_')) {
        const img = document.createElement('img');
        const [src, alt] = match.split(':');
        const imgURL = new URL(src, new URL(result.pathname, window.location.origin));
        img.src = `${imgURL.href}?width=750&format=webply&optimize=medium`;
        p.append('\n', ''.padStart(10, ' '), img, `:${alt}`);

        const [mediaHash] = match.substr(8).split('.');
        const existing = mediaDisplay.querySelector(`img[src*="${mediaHash}"]`);
        if (existing) {
          const parent = existing.closest('div');
          const count = parent.querySelector('span.badge');
          count.textContent = +count.textContent + 1;
          let prev = parent.previousElementSibling;
          while (prev) {
            if (+prev.querySelector('span.badge').textContent > +count.textContent) {
              break;
            }
            prev = prev.previousElementSibling;
          }
          if (!prev) {
            mediaDisplay.prepend(parent);
          } else {
            prev.after(parent);
          }
        } else {
          const mediaDiv = document.createElement('div');
          mediaDiv.append(img.cloneNode(true));
          const badge = document.createElement('span');
          badge.className = 'badge';
          badge.textContent = 1;
          badge.addEventListener('click', () => {
            showMediaDetails(mediaHash);
          });
          mediaDiv.append(badge);
          mediaDisplay.append(mediaDiv);
        }
      } else p.append('\n', ''.padStart(10, ' '), match);
    });
    if (result.matches.length) p.append('\n');
    resultDisplay.appendChild(p);
  }
}

function createMetaExport() {
  const table = [['URL', 'Meta', 'Value']];
  const pars = [...document.querySelectorAll('#results > p')];
  pars.forEach((p) => {
    const a = p.querySelector('a:first-of-type');
    const url = a.href;
    const matches = p.textContent.split('\n').slice(1);
    matches.forEach((match) => {
      if (match.trim()) table.push([url, match.split(': ')[0].trim(), match.split(': ')[1]]);
    });
  });
  return table.map((row) => row.join('\t')).join('\n');
}

function createAltExport() {
  const table = [['URL', 'Image', 'Alt Text']];
  const pars = [...document.querySelectorAll('#results > p')];
  pars.forEach((p) => {
    const a = p.querySelector('a:first-of-type');
    const url = a.href;
    const matches = p.innerHTML.split('\n').slice(1);
    matches.forEach((match) => {
      if (match.trim()) {
        const imgSrc = match.split('src="')[1].split('"')[0];
        table.push([url, imgSrc, match.split(': ')[1]]);
      }
    });
  });
  return table.map((row) => row.join('\t')).join('\n');
}

function createImagesExport() {
  const table = [['URL', 'Image', 'Alt Text']];
  const pars = [...document.querySelectorAll('#results > p')];
  pars.forEach((p) => {
    const a = p.querySelector('a:first-of-type');
    const url = a.href;
    const matches = p.innerHTML.split('\n').slice(1);
    matches.forEach((match) => {
      if (match.trim()) {
        const imgSrc = match.split('src="')[1].split('"')[0];
        table.push([url, imgSrc, match.split(': ')[1]]);
      }
    });
  });
  return table.map((row) => row.join('\t')).join('\n');
}

function createLinkExport() {
  const table = [['URL', 'Link Text', 'Link HREF']];
  const pars = [...document.querySelectorAll('#results > p')];
  pars.forEach((p) => {
    const a = p.querySelector('a:first-of-type');
    const url = a.href;
    const matches = p.textContent.split('\n').slice(1);
    matches.forEach((match) => {
      if (match.trim()) table.push([url, match.split(': ')[0].trim(), match.split(': ')[1]]);
    });
  });
  return table.map((row) => row.join('\t')).join('\n');
}

function createSimpleExport() {
  return [...document.querySelectorAll('#results > p')]
    .map((res) => res.querySelector('a:first-of-type').getAttribute('href'))
    .join('\n');
}

function createExport(type) {
  if (type === 'meta') return createMetaExport();
  if (type === 'link') return createLinkExport();
  if (type === 'alt') return createAltExport();
  if (type === 'images') return createImagesExport();
  return createSimpleExport();
}

function exportResults() {
  const type = document.getElementById('type').value;
  const exp = createExport(type);
  const blob = new Blob([exp], { type: 'text/tab-separated-values' });
  const url = window.URL.createObjectURL(blob);
  const a = document.getElementById('exportLink');
  a.href = url;
  a.download = 'content-report.tsv';
  a.click();
  window.URL.revokeObjectURL(url);
}

async function fgrepNextFile(queue, pattern, type) {
  const path = queue.shift();
  if (path) {
    totalFiles += 1;
    fgrep(path, pattern, type).then((result) => {
      displayResult(result);
      if (queue[0]) fgrepNextFile(queue, pattern, type);
      endTime = new Date();
      updateStatus();
    });
  }
}

async function fgrepFiles(sitemap, pattern, connections, type) {
  const queue = [...sitemap];
  for (let c = 0; c < connections; c += 1) {
    fgrepNextFile(queue, pattern, type);
  }
}

// eslint-disable-next-line import/prefer-default-export
export async function run() {
  sitemapURLs = [];
  totalSize = 0;
  totalFiles = 0;
  totalFilesMatched = 0;
  startTime = new Date();
  endTime = new Date();
  document.getElementById('results').textContent = '';
  document.getElementById('media').textContent = '';

  await loadSitemap('/sitemap.xml');
  const type = document.getElementById('type').value;
  document.body.className = type;
  const sitemap = sitemapURLs;
  let pattern = document.getElementById('input').value;
  let connections = 10;
  if (pattern.includes(' -c ')) {
    [pattern, connections] = pattern.split(' -c ');
  }
  fgrepFiles(sitemap, pattern, +connections, type);
  localStorage.setItem('content-report-pattern', pattern);
  localStorage.setItem('content-report-type', type);
}

const runButton = document.getElementById('run');
runButton.addEventListener('click', () => {
  run();
});

const input = document.getElementById('input');
input.value = localStorage.getItem('content-report-pattern') || '';
input.focus();
input.setAttribute('autocomplete', 'on');
input.addEventListener('keyup', (event) => {
  if (event.keyCode === 13) {
    runButton.click();
  }
});

const close = document.getElementById('media-details-close');
close.addEventListener('click', () => {
  const dialog = document.getElementById('media-details');
  dialog.close();
});

// only run on .hlx.live
/*
if (window.location.hostname.endsWith('.hlx.page')) {
  window.location.href = window.location.href.replace('.hlx.page', '.hlx.live');
}
*/

const type = document.getElementById('type');
type.value = localStorage.getItem('content-report-type') || '';

const params = new URLSearchParams(window.location.search);
const typeParam = params.get('type');

if (typeParam) {
  const select = document.getElementById('type');
  select.value = typeParam;
}

document.getElementById('export').addEventListener('click', exportResults);
