/* eslint-disable no-unused-expressions */
/* global describe it */

import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import {
  config,
  decorateAnchors,
  decorateBlocks,
  getCurrentDomain,
  loadBlocks,
  loadElement,
  loadScript,
  loadStyle,
  loadTemplate,
  setLCPTrigger,
} from '../scripts.js';
import getObjectProperty from '../utils/property.js';

const ms = 100;

const mock = await readFile({ path: './scripts.mock.html' });
document.body.innerHTML = mock;

describe('Anchors', () => {
  const parent = document.querySelector('.anchors');
  const anchors = decorateAnchors(parent);
  it('url maps to localhost', () => {
    expect(anchors[0].href).to.equal('http://localhost:2000/my-content');
  });

  it('url does not map to localhost', () => {
    expect(anchors[1].href).to.equal('https://www.adobe.com/');
  });

  it('svg image will unwrap anchor', () => {
    const svg = parent.querySelector(':scope > img');
    expect(svg).to.exist;
  });

  it('svg image will keep anchor', () => {
    const svgAnchor = anchors.pop();
    const svg = parent.querySelector(':scope > a > img');
    expect(svg).to.exist;
    expect(svgAnchor.href).to.equal('http://localhost:2000/my-awesome-link');
  });

  it('domain respects port', () => {
    const location = { protocol: 'http:', hostname: 'localhost' };
    const currentDomain = getCurrentDomain(location);
    expect(currentDomain).to.equal('http://localhost');
  });
});

describe('Block variations', () => {
  const parent = document.querySelector('.variations');
  const blocks = decorateBlocks(parent);
  it('url maps to localhost', () => {
    expect(blocks[0].classList.contains('marquee')).to.be.true;
  });
});

describe('Script loading', async () => {
  function callback() { window.scriptCallback = true; }
  const script = await loadScript('/__tests__/block.mock.js', callback, 'module');
  it('script element exists', () => {
    expect(script).to.exist;
  });

  it('script calls back', async () => {
    const loaded = await getObjectProperty('scriptCallback', ms);
    expect(loaded).to.be.true;
  });

  it('block mock can run', async () => {
    const loaded = await getObjectProperty('feature.loaded', ms);
    expect(loaded).to.be.true;
  });
});

describe('Style loading', async () => {
  function callback() { window.styleCallback = true; }
  function callbackTwo() { window.styleCallbackTwo = true; }
  const style = await loadStyle('/__tests__/block.mock.css', callback);
  it('style element exists', () => {
    expect(style).to.exist;
  });

  it('style calls back', async () => {
    const loaded = await getObjectProperty('styleCallback', ms);
    expect(loaded).to.be.true;
  });

  it('only one style', async () => {
    const oneStyle = await loadStyle('/__tests__/block.mock.css', callbackTwo);
    expect(oneStyle).to.exist;
    expect(window.styleCallbackTwo).to.be.true;
  });
});

describe('Template loading', async () => {
  const meta = document.createElement('meta');
  meta.setAttribute('name', 'template');
  meta.setAttribute('content', 'product');
  document.head.append(meta);

  it('template doesnt exist', () => {
    const noTemplate = loadTemplate({});
    expect(noTemplate).to.not.exist;
  });

  it('template conf doesnt exist', () => {
    const template = loadTemplate(config);
    expect(template).to.not.exist;
  });

  it('template conf exists', () => {
    meta.setAttribute('content', 'docs');
    loadTemplate(config);
    expect(document.body.classList.contains('has-Template')).to.be.true;
  });

  it('template has name', () => {
    meta.setAttribute('content', 'docs');
    loadTemplate(config);
    expect(document.body.classList.contains('docs-template')).to.be.true;
  });
});

describe('Block loading', async () => {
  const marquee = document.querySelector('.marquee');

  it('block has a block select', () => {
    const { blockSelect } = marquee.dataset;
    expect(blockSelect).to.exist;
  });

  it('block is loaded with only js', async () => {
    await loadElement(marquee, config.blocks['.marquee']);
    expect(marquee.classList.contains('is-Loaded')).to.be.true;
  });

  it('block is loaded with css', async () => {
    config.blocks['.marquee'].styles = 'marquee.css';
    await loadElement(marquee, config.blocks['.marquee']);
    expect(marquee.classList.contains('is-Loaded')).to.be.true;
  });
});

describe('Post LCP', () => {
  const img = document.createElement('img');
  document.body.append(img);

  it('LCP loads when there is no image', () => {
    const lcp = document.querySelector('img');
    setLCPTrigger(lcp);
    expect(window.lcpComplete).to.be.true;
  });

  it('LCP loads when there is a bad image', async () => {
    img.src = '/__tests__/nope.mock.png';
    setLCPTrigger(img);
    const lcpError = await getObjectProperty('lcpError', ms);
    expect(lcpError).to.be.true;
  });

  it('LCP loads when there is a good image', async () => {
    img.src = '/__tests__/block.mock.png';
    const lcpLoad = await getObjectProperty('lcpLoad', ms);
    expect(lcpLoad).to.be.true;
  });
});

const getLazyElement = (selector, timeout) => new Promise((resolve) => {
  let i = 0;
  const interval = 10;
  const refreshId = setInterval(() => {
    const el = document.querySelector(selector);
    if (el !== null && typeof el !== 'undefined') {
      resolve(el);
      clearInterval(refreshId);
    } else if (i >= timeout) {
      resolve(null);
      clearInterval(refreshId);
    }
    i += interval;
  }, interval);
});

describe('Lazy loading', async () => {
  it('youtube is loaded', async () => {
    const blocks = decorateBlocks(document);
    await loadBlocks(blocks, config);
    const iframe = await getLazyElement('iframe', ms);
    expect(iframe).to.exist;
  });
});

describe('Object property', async () => {
  const loaded = await getObjectProperty('nope', ms);
  expect(loaded).to.be.null;
});
