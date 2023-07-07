/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

/**
 * log RUM if part of the sample.
 * @param {string} checkpoint identifies the checkpoint in funnel
 * @param {Object} data additional data for RUM sample
 */
import { addInViewAnimationToSingleElement, addInViewAnimationToMultipleElements, returnLinkTarget } from '../utils/helpers.js';

export function sampleRUM(checkpoint, data = {}) {
  sampleRUM.defer = sampleRUM.defer || [];
  const defer = (fnname) => {
    sampleRUM[fnname] = sampleRUM[fnname]
      || ((...args) => sampleRUM.defer.push({ fnname, args }));
  };
  sampleRUM.drain = sampleRUM.drain
    || ((dfnname, fn) => {
      sampleRUM[dfnname] = fn;
      sampleRUM.defer
        .filter(({ fnname }) => dfnname === fnname)
        .forEach(({ fnname, args }) => sampleRUM[fnname](...args));
    });
  sampleRUM.on = (chkpnt, fn) => { sampleRUM.cases[chkpnt] = fn; };
  defer('observe');
  defer('cwv');
  try {
    window.hlx = window.hlx || {};
    if (!window.hlx.rum) {
      const usp = new URLSearchParams(window.location.search);
      const weight = (usp.get('rum') === 'on') ? 1 : 100; // with parameter, weight is 1. Defaults to 100.
      // eslint-disable-next-line no-bitwise
      const hashCode = (s) => s.split('').reduce((a, b) => (((a << 5) - a) + b.charCodeAt(0)) | 0, 0);
      const id = `${hashCode(window.location.href)}-${new Date().getTime()}-${Math.random().toString(16).substr(2, 14)}`;
      const random = Math.random();
      const isSelected = (random * weight < 1);
      const urlSanitizers = {
        full: () => window.location.href,
        origin: () => window.location.origin,
        path: () => window.location.href.replace(/\?.*$/, ''),
      };
      // eslint-disable-next-line object-curly-newline, max-len
      window.hlx.rum = { weight, id, random, isSelected, sampleRUM, sanitizeURL: urlSanitizers[window.hlx.RUM_MASK_URL || 'path'] };
    }
    const { weight, id } = window.hlx.rum;
    if (window.hlx && window.hlx.rum && window.hlx.rum.isSelected) {
      const sendPing = (pdata = data) => {
        // eslint-disable-next-line object-curly-newline, max-len, no-use-before-define
        const body = JSON.stringify({ weight, id, referer: window.hlx.rum.sanitizeURL(), checkpoint, ...data });
        const url = `https://rum.hlx.page/.rum/${weight}`;
        // eslint-disable-next-line no-unused-expressions
        navigator.sendBeacon(url, body);
        // eslint-disable-next-line no-console
        console.debug(`ping:${checkpoint}`, pdata);
      };
      sampleRUM.cases = sampleRUM.cases || {
        cwv: () => sampleRUM.cwv(data) || true,
        lazy: () => {
          // use classic script to avoid CORS issues
          const script = document.createElement('script');
          script.src = 'https://rum.hlx.page/.rum/@adobe/helix-rum-enhancer@^1/src/index.js';
          document.head.appendChild(script);
          return true;
        },
      };
      sendPing(data);
      if (sampleRUM.cases[checkpoint]) { sampleRUM.cases[checkpoint](); }
    }
  } catch (error) {
    // something went wrong
  }
}

/**
 * Loads a CSS file.
 * @param {string} href The path to the CSS file
 */
export function loadCSS(href, callback) {
  if (!document.querySelector(`head > link[href="${href}"]`)) {
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', href);
    if (typeof callback === 'function') {
      link.onload = (e) => callback(e.type);
      link.onerror = (e) => callback(e.type);
    }
    document.head.appendChild(link);
  } else if (typeof callback === 'function') {
    callback('noop');
  }
}

/**
 * Loads preload file for LCP.
 * @param {string} href The path to the CSS file
 */
export function loadPreloadLink() {
  const preloadLinks = [{
    href: `${window.hlx.codeBasePath}/img/colorful-bg.jpg`,
    as: 'image',
    conditionalSelector: ['.hero', '.colorful-bg'],
  }];

  preloadLinks.forEach((preloadLink) => {
    if (!document.querySelector(`head > link[href="${preloadLink.href}"]`)) {
      const shouldPreload = preloadLink.conditionalSelector.some((s) => document.querySelector(s));

      if (shouldPreload) {
        const link = document.createElement('link');
        link.setAttribute('rel', 'preload');
        link.setAttribute('href', preloadLink.href);
        link.setAttribute('as', preloadLink.as);
        document.head.appendChild(link);
      }
    }
  });
}

/**
 * set language in html tag for improving SEO accessibility
 */
export function setLanguageForAccessibility() {
  document.documentElement.lang = 'en';
}

/**
 * Helper function to create DOM elements
 * @param {string} tag DOM element to be created
 * @param {array} attributes attributes to be added
 */

export function createTag(tag, attributes, html) {
  const el = document.createElement(tag);
  if (html) {
    if (html instanceof HTMLElement || html instanceof SVGElement) {
      el.append(html);
    } else {
      el.insertAdjacentHTML('beforeend', html);
    }
  }
  if (attributes) {
    Object.entries(attributes).forEach(([key, val]) => {
      el.setAttribute(key, val);
    });
  }
  return el;
}

/**
 * Retrieves the content of a metadata tag.
 * @param {string} name The metadata name (or property)
 * @returns {string} The metadata value
 */
export function getMetadata(name) {
  const attr = name && name.includes(':') ? 'property' : 'name';
  const $meta = document.head.querySelector(`meta[${attr}="${name}"]`);
  return $meta && $meta.content;
}

/**
 * Adds one or more URLs to the dependencies for publishing.
 * @param {string|[string]} url The URL(s) to add as dependencies
 */
export function addPublishDependencies(url) {
  const urls = Array.isArray(url) ? url : [url];
  window.hlx = window.hlx || {};
  if (window.hlx.dependencies && Array.isArray(window.hlx.dependencies)) {
    window.hlx.dependencies = window.hlx.dependencies.concat(urls);
  } else {
    window.hlx.dependencies = urls;
  }
}

/**
 * Sanitizes a name for use as class name.
 * @param {*} name The unsanitized name
 * @returns {string} The class name
 */
export function toClassName(name) {
  return name && typeof name === 'string'
    ? name.toLowerCase().replace(/[^0-9a-z]/gi, '-')
    : '';
}

/**
 * Decorates a block.
 * @param {Element} block The block element
 */
export function decorateBlock(block) {
  const shortBlockName = block.classList[0];
  if (shortBlockName) {
    block.classList.add('block');
    block.setAttribute('data-block-name', shortBlockName);
    block.setAttribute('data-block-status', 'initialized');
    const blockWrapper = block.parentElement;
    blockWrapper.classList.add(`${shortBlockName}-wrapper`);
  }
}

/**
 * Extracts the config from a block.
 * @param {Element} $block The block element
 * @returns {object} The block config
 */
export function readBlockConfig($block) {
  const config = {};
  $block.querySelectorAll(':scope>div').forEach(($row) => {
    if ($row.children) {
      const $cols = [...$row.children];
      if ($cols[1]) {
        const $value = $cols[1];
        const name = toClassName($cols[0].textContent);
        let value = '';
        if ($value.querySelector('a')) {
          const $as = [...$value.querySelectorAll('a')];
          if ($as.length === 1) {
            value = $as[0].href;
          } else {
            value = $as.map(($a) => $a.href);
          }
        } else if ($value.querySelector('p')) {
          const $ps = [...$value.querySelectorAll('p')];
          if ($ps.length === 1) {
            value = $ps[0].textContent;
          } else {
            value = $ps.map(($p) => $p.textContent);
          }
        } else if ($value.querySelector('img')) {
          value = $value.querySelector('img').src;
        } else value = $row.children[1].textContent;
        config[name] = value;
      }
    }
  });
  return config;
}

/**
 * Decorates all sections in a container element.
 * @param {Element} $main The container element
 */
export function decorateSections($main) {
  $main.querySelectorAll(':scope > div').forEach((section) => {
    const wrappers = [];
    let defaultContent = false;
    [...section.children].forEach((e) => {
      if (e.tagName === 'DIV' || !defaultContent) {
        const wrapper = document.createElement('div');
        defaultContent = e.tagName !== 'DIV';
        if (defaultContent) wrapper.className = 'default-content-wrapper';
        wrappers.push(wrapper);
      }
      wrappers[wrappers.length - 1].append(e);
    });
    wrappers.forEach((wrapper) => section.append(wrapper));
    section.classList.add('section');
    section.setAttribute('data-section-status', 'initialized');

    /* process section metadata */
    const sectionMeta = section.querySelector('div.section-metadata');
    if (sectionMeta) {
      const meta = readBlockConfig(sectionMeta);
      const keys = Object.keys(meta);
      keys.forEach((key) => {
        if (key === 'style') section.classList.add(toClassName(meta.style));
        else section.dataset[key] = meta[key];
      });
      sectionMeta.remove();
    }
  });
}
/**
 * Updates all section status in a container element.
 * @param {Element} $main The container element
 */
export function updateSectionsStatus($main) {
  const sections = [...$main.querySelectorAll(':scope > div.section')];
  for (let i = 0; i < sections.length; i += 1) {
    const section = sections[i];
    const status = section.getAttribute('data-section-status');
    if (status !== 'loaded') {
      const loadingBlock = section.querySelector('.block[data-block-status="initialized"], .block[data-block-status="loading"]');
      if (loadingBlock) {
        section.setAttribute('data-section-status', 'loading');
        break;
      } else {
        section.setAttribute('data-section-status', 'loaded');
      }
    }
  }
}

/**
 * Decorates all blocks in a container element.
 * @param {Element} $main The container element
 */
export function decorateBlocks($main) {
  $main
    .querySelectorAll('div.section > div div')
    .forEach(($block) => decorateBlock($block));
}

/**
 * Builds a block DOM Element from a two dimensional array
 * @param {string} blockName name of the block
 * @param {any} content two dimensional array or string or object of content
 */
export function buildBlock(blockName, content) {
  const table = Array.isArray(content) ? content : [[content]];
  const blockEl = document.createElement('div');
  // build image block nested div structure
  blockEl.classList.add(blockName);
  table.forEach((row) => {
    const rowEl = document.createElement('div');
    row.forEach((col) => {
      const colEl = document.createElement('div');
      const vals = col.elems ? col.elems : [col];
      vals.forEach((val) => {
        if (val) {
          if (typeof val === 'string') {
            colEl.innerHTML += val;
          } else {
            colEl.appendChild(val);
          }
        }
      });
      rowEl.appendChild(colEl);
    });
    blockEl.appendChild(rowEl);
  });
  return (blockEl);
}

/**
 * Loads JS and CSS for a block.
 * @param {Element} $block The block element
 */
export async function loadBlock(block, eager = false) {
  if (!(block.getAttribute('data-block-status') === 'loading' || block.getAttribute('data-block-status') === 'loaded')) {
    block.setAttribute('data-block-status', 'loading');
    const blockName = block.getAttribute('data-block-name');
    try {
      const cssLoaded = new Promise((resolve) => {
        loadCSS(`${window.hlx.codeBasePath}/blocks/${blockName}/${blockName}.css`, resolve);
      });
      const decorationComplete = new Promise((resolve) => {
        (async () => {
          try {
            const mod = await import(`../blocks/${blockName}/${blockName}.js`);
            if (mod.default) {
              await mod.default(block, blockName, document, eager);
            }
          } catch (err) {
            // eslint-disable-next-line no-console
            console.log(`failed to load module for ${blockName}`, err);
          }
          resolve();
        })();
      });
      await Promise.all([cssLoaded, decorationComplete]);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(`failed to load block ${blockName}`, err);
    }
    block.setAttribute('data-block-status', 'loaded');
  }
}

/**
 * Loads JS and CSS for all blocks in a container element.
 * @param {Element} $main The container element
 */
export async function loadBlocks($main) {
  updateSectionsStatus($main);
  const blocks = [...$main.querySelectorAll('div.block')];
  for (let i = 0; i < blocks.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await loadBlock(blocks[i]);
    updateSectionsStatus($main);
  }
}

/**
 * Returns a picture element with webp and fallbacks
 * @param {string} src The image URL
 * @param {boolean} eager load image eager
 * @param {Array} breakpoints breakpoints and corresponding params (eg. width)
 */
export function createOptimizedPicture(src, alt = '', eager = false, breakpoints = [{ media: '(min-width: 600px)', width: '2000' }, { width: '750' }]) {
  const url = new URL(src, window.location.href);
  const picture = document.createElement('picture');
  const { pathname } = url;
  const ext = pathname.substring(pathname.lastIndexOf('.') + 1);

  // webp
  breakpoints.forEach((br) => {
    const source = document.createElement('source');
    if (br.media) source.setAttribute('media', br.media);
    source.setAttribute('type', 'image/webp');
    source.setAttribute('srcset', `${pathname}?width=${br.width}&format=webply&optimize=medium`);
    picture.appendChild(source);
  });

  // fallback
  breakpoints.forEach((br, i) => {
    if (i < breakpoints.length - 1) {
      const source = document.createElement('source');
      if (br.media) source.setAttribute('media', br.media);
      source.setAttribute('srcset', `${pathname}?width=${br.width}&format=${ext}&optimize=medium`);
      picture.appendChild(source);
    } else {
      const img = document.createElement('img');
      img.setAttribute('loading', eager ? 'eager' : 'lazy');
      img.setAttribute('alt', alt);
      picture.appendChild(img);
      img.setAttribute('src', `${pathname}?width=${br.width}&format=${ext}&optimize=medium`);
    }
  });

  return picture;
}

/**
 * Normalizes all headings within a container element.
 * @param {Element} $elem The container element
 * @param {[string]]} allowedHeadings The list of allowed headings (h1 ... h6)
 */
export function normalizeHeadings($elem, allowedHeadings) {
  const allowed = allowedHeadings.map((h) => h.toLowerCase());
  $elem.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((tag) => {
    const h = tag.tagName.toLowerCase();
    if (allowed.indexOf(h) === -1) {
      // current heading is not in the allowed list -> try first to "promote" the heading
      let level = parseInt(h.charAt(1), 10) - 1;
      while (allowed.indexOf(`h${level}`) === -1 && level > 0) {
        level -= 1;
      }
      if (level === 0) {
        // did not find a match -> try to "downgrade" the heading
        while (allowed.indexOf(`h${level}`) === -1 && level < 7) {
          level += 1;
        }
      }
      if (level !== 7) {
        tag.outerHTML = `<h${level} id="${tag.id}">${tag.textContent}</h${level}>`;
      }
    }
  });
}

/**
 * Adds the favicon.
 * @param {string} href The favicon URL
 */
export function addFavIcon(href) {
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/png';
  link.href = href;
  const existingLink = document.querySelector('head link[rel="icon"]');
  if (existingLink) {
    existingLink.parentElement.replaceChild(link, existingLink);
  } else {
    document.getElementsByTagName('head')[0].appendChild(link);
  }
}

/**
 * Fills icon spans with an icon.
 */
export function decorateIcons(block = document) {
  block.querySelectorAll('span.icon').forEach(async (span) => {
    if (span.classList.length < 2 || !span.classList[1].startsWith('icon-')) {
      return;
    }
    const icon = span.classList[1].substring(5);
    // eslint-disable-next-line no-use-before-define
    const resp = await fetch(`${window.hlx.codeBasePath}${ICON_ROOT}/${icon}.svg`);
    if (resp.ok) {
      const iconHTML = await resp.text();
      if (iconHTML.match(/<style/i)) {
        const img = document.createElement('img');
        img.src = `data:image/svg+xml,${encodeURIComponent(iconHTML)}`;
        span.appendChild(img);
      } else {
        span.innerHTML = iconHTML;
      }
    }
  });
}

/**
 * load LCP block and/or wait for LCP in default content.
 */
async function waitForLCP() {
  // eslint-disable-next-line no-use-before-define
  const lcpBlocks = LCP_BLOCKS;
  const block = document.querySelector('.block');
  const hasLCPBlock = (block && lcpBlocks.includes(block.getAttribute('data-block-name')));
  if (hasLCPBlock) await loadBlock(block, true);

  document.querySelector('body').classList.add('appear');
  const lcpCandidate = document.querySelector('main img');
  await new Promise((resolve) => {
    if (lcpCandidate && !lcpCandidate.complete) {
      lcpCandidate.setAttribute('loading', 'eager');
      lcpCandidate.addEventListener('load', () => resolve());
      lcpCandidate.addEventListener('error', () => resolve());
    } else {
      resolve();
    }
  });
}

/**
 * Decorates the page.
 */
async function loadPage(doc) {
  // eslint-disable-next-line no-use-before-define
  await loadEager(doc);
  // eslint-disable-next-line no-use-before-define
  await loadLazy(doc);
  // eslint-disable-next-line no-use-before-define
  loadDelayed(doc);
}

export function initHlx() {
  window.hlx = window.hlx || {};
  window.hlx.lighthouse = new URLSearchParams(window.location.search).get('lighthouse') === 'on';
  window.hlx.codeBasePath = '';

  const scriptEl = document.querySelector('script[src$="/scripts/scripts.js"]');
  if (scriptEl) {
    try {
      [window.hlx.codeBasePath] = new URL(scriptEl.src).pathname.split('/scripts/scripts.js');
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
  }
}

initHlx();

/*
 * ------------------------------------------------------------
 * Edit above at your own risk
 * ------------------------------------------------------------
 */

const LCP_BLOCKS = ['hero', 'logo-wall']; // add your LCP blocks to the list
const ICON_ROOT = '/img';

sampleRUM('top');
window.addEventListener('load', () => sampleRUM('load'));

window.addEventListener('unhandledrejection', (event) => {
  sampleRUM('error', { source: event.reason.sourceURL, target: event.reason.line });
});
window.addEventListener('error', (event) => {
  sampleRUM('error', { source: event.filename, target: event.lineno });
});
loadPage(document);

export function decorateButtons(block = document) {
  const noButtonBlocks = ['cards', 'pagination', 'card-list'];
  block.querySelectorAll(':scope a').forEach(($a) => {
    $a.title = $a.title || $a.textContent;
    const $block = $a.closest('div.section > div > div');
    let blockName;
    if ($block) {
      blockName = $block.className;
    }
    if (!noButtonBlocks.includes(blockName)
      && $a.href !== $a.textContent) {
      const $up = $a.parentElement;
      const $twoup = $a.parentElement.parentElement;
      if (!$a.querySelector('img')) {
        if ($up.childNodes.length === 1 && ($up.tagName === 'P' || $up.tagName === 'DIV')) {
          $a.className = 'button accent'; // default
          $up.classList.add('button-container');
        }
        if ($up.childNodes.length === 1 && $up.tagName === 'STRONG'
          && $twoup.childNodes.length === 1 && $twoup.tagName === 'P') {
          $a.className = 'button accent';
          $twoup.classList.add('button-container');
        }
        if ($up.childNodes.length === 1 && $up.tagName === 'EM'
          && $twoup.childNodes.length === 1 && $twoup.tagName === 'P') {
          $a.className = 'button accent light';
          $twoup.classList.add('button-container');
        }
      }
    }
  });
}

export function addAnchorLink(elem) {
  const link = document.createElement('a');
  link.setAttribute('href', `#${elem.id || ''}`);
  link.setAttribute('title', `Copy link to "${elem.textContent}" to clipboard`);
  link.classList.add('anchor-link');
  link.addEventListener('click', (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(link.href);
    window.location.href = link.href;
    e.target.classList.add('anchor-link-copied');
    setTimeout(() => e.target.classList.remove('anchor-link-copied'), 1000);
  });
  link.innerHTML = elem.innerHTML;
  elem.innerHTML = '';
  elem.append(link);
}

export function decorateHeadings(main) {
  if (!document.body.classList.contains('docs-template')) return;
  main.querySelectorAll('h2, h3, h4, h5, h6').forEach((h) => {
    addAnchorLink(h);
  });
}

export function addMessageBoxOnGuideTemplate(main) {
  const messageBox = createTag('div', { class: 'message-box' }, 'Link copied!');
  main.append(messageBox);
}

export function addHeadingAnchorLink(elem) {
  const link = document.createElement('a');
  link.setAttribute('href', `#${elem.id || ''}`);
  link.setAttribute('title', `Copy link to "${elem.textContent}" to clipboard`);
  // hover highlight on title
  if (elem.tagName === 'H2') {
    link.classList.add('anchor-link', 'link-highlight-colorful-effect');
  } else {
    link.classList.add('anchor-link', 'link-highlight-colorful-effect-2');
  }
  link.addEventListener('click', (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(link.href);
    window.location.href = link.href;
    const messageBox = document.querySelector('.message-box');
    if (messageBox) {
      messageBox.classList.add('active', 'fill');
      setTimeout(() => {
        messageBox.classList.remove('active');
        setTimeout(() => {
          messageBox.classList.remove('fill');
        }, 300);
      }, 1000);
    }

    e.target.classList.add('anchor-link-copied');
    setTimeout(() => {
      e.target.classList.remove('anchor-link-copied');
    }, 1000);
  });
  link.innerHTML = elem.innerHTML;
  elem.innerHTML = '';
  elem.append(link);
}

export function decorateGuideTemplateHeadings(main) {
  const contentArea = main.querySelector('.section.content');
  if (!contentArea) return;
  const contentSections = contentArea.querySelectorAll('.default-content-wrapper');
  if (!contentSections) return;
  contentSections.forEach((section) => {
    section.querySelectorAll('h2, h3, h4, h5, h6').forEach((h) => {
      addHeadingAnchorLink(h);
    });
  });
}

export function decorateGuideTemplateHero(main) {
  if (main.classList.contains('without-full-width-hero'));
  const firstImageInContentArea = main.querySelector('.section.content .default-content-wrapper img');
  if (firstImageInContentArea) firstImageInContentArea.classList.add('doc-detail-hero-image');
}

export function decorateGuideTemplateLinks(main) {
  const links = main.querySelectorAll('.content a');
  links.forEach((link) => {
    link.setAttribute('target', returnLinkTarget(link.href));
  });
}

function animateTitleSection(section) {
  const animationConfig = {
    staggerTime: 0.3,
    items: [
      {
        selector: '.icon-eyebrow',
        animatedClass: 'slide-reveal-up',
      },
      {
        selector: '.main-headline',
        animatedClass: 'slide-reveal-up',
      }],
  };
  const trigger = section.querySelector('.default-content-wrapper');

  const image = trigger.querySelector('picture');
  if (image) {
    // addInViewAnimationToSingleElement(image, 'item-fade-in');

    // udpated logic
    const imageParent = image.parentElement;
    imageParent.classList.add('default-content-image-wrapper');
    addInViewAnimationToSingleElement(imageParent, 'slide-reveal-up');
    animationConfig.items.unshift({
      selector: '.default-content-image-wrapper',
      animatedClass: 'slide-reveal-up',
    });
  }
  addInViewAnimationToMultipleElements(animationConfig.items, trigger, animationConfig.staggerTime);
}

export function decorateTitleSection(main) {
  const titleSections = main.querySelectorAll('.title-section');
  if (!titleSections) return;
  titleSections.forEach((section) => {
    const elements = section.querySelectorAll('h1,h2,h3,h4,h5,h6');
    if (!elements || elements.length < 2) return;
    const eyebrow = elements[0];
    const headline = elements[1];
    if (eyebrow) {
      eyebrow.classList.add('icon-eyebrow');
    }
    if (headline) {
      headline.classList.add('main-headline');
    }
    animateTitleSection(section);
  });
}

export function loadScript(url, callback, type) {
  const script = document.createElement('script');
  script.onload = callback;
  script.setAttribute('src', url);
  if (type) { script.setAttribute('type', type); }
  document.head.append(script);
  return script;
}

export function setTemplate() {
  const template = getMetadata('template');
  if (!template) return;
  document.body.classList.add(`${template.toLowerCase()}-template`);
}

export async function decorateGuideTemplateCodeBlock() {
  if (!document.body.classList.contains('guides-template')) return;

  const highlightCSS = createTag('link', {
    rel: 'stylesheet',
    href: '/libs/highlight/atom-one-dark.min.css',
  });
  document.head.append(highlightCSS);

  await loadScript('/libs/highlight/highlight.min.js', () => {
    const initScript = createTag('script', {}, 'hljs.highlightAll();');
    document.body.append(initScript);
  });
}

// patch fix for table not being rendered as block in fragment
export function decorateFragmentTable(main) {
  if (!main) return;
  const tables = main.querySelectorAll('table');
  if (tables) {
    tables.forEach((table) => {
      if (table.classList.contains('block')) return;
      const tableWrapper = createTag('div', { class: 'table' });
      table.parentNode.insertBefore(tableWrapper, table);
      tableWrapper.appendChild(table);
    });
  }
}

export function decorateGuideTemplate(main) {
  if (!document.body.classList.contains('guides-template') || !main) return;
  addMessageBoxOnGuideTemplate(main);
  decorateGuideTemplateHeadings(main);
  decorateGuideTemplateHero(main);
  decorateGuideTemplateLinks(main);
  // decorateGuideTemplateCodeBlock();
  decorateFragmentTable(main); // ususally only use fragment in doc detail
}

/**
 * Clean up variant classes
 * Ex: marquee--small--contained- -> marquee small contained
 * @param {HTMLElement} parent
 */
export function cleanVariations(parent) {
  const variantBlocks = parent.querySelectorAll('[class$="-"]');
  return Array.from(variantBlocks).map((variant) => {
    const { className } = variant;
    const classNameClipped = className.slice(0, -1);
    variant.classList.remove(className);
    const classNames = classNameClipped.split('--');
    variant.classList.add(...classNames);
    return variant;
  });
}

function buildEmbeds() {
  const embeds = [...document.querySelectorAll('a[href^="https://www.youtube.com"], a[href^="https://gist.github.com"]')];
  embeds.forEach((embed) => {
    embed.replaceWith(buildBlock('embed', embed.outerHTML));
  });
}

function buildHeader() {
  const header = document.querySelector('header');
  header.append(buildBlock('header', ''));
}

function buildFooter() {
  const footer = document.querySelector('footer');
  footer.append(buildBlock('footer', ''));
}

function updateGuideTemplateStyleBasedOnHero() {
  const isHeroContentExist = document.querySelector('.guides-template .section.heading');

  if (isHeroContentExist) {
    document.querySelector('main').classList.add('has-full-width-hero');
    const cardListBlocks = document.querySelectorAll('.block.card-list');
    // make card list in main category page has '.image-card-listing' class
    cardListBlocks.forEach((block) => block.classList.add('image-card-listing'));
  } else {
    document.querySelector('main').classList.add('without-full-width-hero');
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
export function buildAutoBlocks(main) {
  try {
    buildHeader();
    buildEmbeds(main);
    buildFooter();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
export function decorateMain(main) {
  buildAutoBlocks(main);
  decorateSections(main);
  decorateButtons(main);
  decorateHeadings(main);
  decorateGuideTemplate(main);
  decorateBlocks(main);
  decorateTitleSection(main);
  // decorateTableBlock(main);
}

/**
 * loads everything needed to get to LCP.
 */
async function loadEager(doc) {
  const main = doc.querySelector('main');
  if (main) {
    setTemplate();
    decorateIcons();
    decorateMain(main);
    await waitForLCP();
  }
}

function addBlockLevelInViewAnimation(main) {
  const observerOptions = {
    threshold: 0.2, // add `.in-view` class when is 20% in view
    // rootMargin: '-10px 0px -10px 0px',
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // support block level animation as well
  const inviewTriggerClassList = '.fade-up, .fade-in, .fade-left, .fade-right';
  const sections = Array.from(main.querySelectorAll(inviewTriggerClassList));
  sections.forEach((section) => {
    observer.observe(section);
  });
}

/**
 * loads everything that doesn't need to be delayed.
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  const header = doc.querySelector('header > div');
  const footer = doc.querySelector('footer > div');
  const aside = createTag('aside');
  main.insertBefore(aside, main.querySelector('.section.content'));

  // NOTE:'.redesign' class is needed for the redesign styles, keep this
  document.body.classList.add('redesign');

  await loadBlocks(main);
  addBlockLevelInViewAnimation(main);

  const { hash } = window.location;

  if (hash) {
    setTimeout(() => {
      const element = hash ? main.querySelector(hash) : false;
      if (element) {
        element.scrollIntoView();
      }
    }, 500);
  }

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`, null);
  addFavIcon(`${window.hlx.codeBasePath}/img/franklin-favicon.png`);
  loadPreloadLink();
  setLanguageForAccessibility();

  if (getMetadata('supressframe')) {
    doc.querySelector('header').remove();
    doc.querySelector('footer').remove();
    return;
  }

  decorateBlock(header);
  loadBlock(header);

  decorateBlock(footer);
  loadBlock(footer);

  // breadcrump setup
  const breadcrumb = buildBlock('breadcrumb', '');
  const breadcrumbWrapper = createTag('div');
  breadcrumbWrapper.append(breadcrumb);
  main.insertBefore(breadcrumbWrapper, main.querySelectorAll('.section')[0]);
  decorateBlock(breadcrumb);
  loadBlock(breadcrumb);

  // sidebar + related style setup
  const sideNav = buildBlock('side-navigation', '');
  aside.append(sideNav);
  main.insertBefore(aside, main.querySelector('.section.content'));
  updateGuideTemplateStyleBasedOnHero();
  decorateBlock(sideNav);
  loadBlock(sideNav);

  decorateGuideTemplateCodeBlock();

  sampleRUM('lazy');
}

/**
 * loads everything that happens a lot later, without impacting
 * the user experience.
 */
function loadDelayed() {
  // load anything that can be postponed to the latest here

  // Core Web Vitals RUM collection
  sampleRUM('cwv');
}

if (window.name.includes('performance')) {
  import('./performance.js').then((mod) => {
    if (mod.default) mod.default();
  });
}
