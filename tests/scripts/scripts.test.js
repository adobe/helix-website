/* eslint-disable no-unused-expressions */
/* global describe it */

import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import {
  config,
  decorateAnchors,
  setupBlocks,
  getCurrentDomain,
  loadBlocks,
  loadElement,
  loadScript,
  loadStyle,
  loadTemplate,
  setLCPTrigger,
} from '../../scripts/scripts.js';
import getObjectProperty from '../../utils/property.js';

const ms = 100;

const mock = await readFile({ path: './scripts.mock.html' });
document.body.innerHTML = mock;

const variations = document.querySelector('.variations');
const variationBlocks = setupBlocks(variations, config);

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

  it('crx link has download attribute', () => {
    const crxAnchor = document.getElementById('crx');
    expect(crxAnchor.download).to.equal('extension.crx');
  });
});

describe('Post LCP', () => {
  const img = document.createElement('img');
  document.body.append(img);

  it('LCP loads when there is no selector', () => {
    setLCPTrigger(null, []);
    expect(window.lcp.none).to.be.true;
  });

  it('LCP loads when there is no image src', () => {
    setLCPTrigger(img, []);
    expect(window.lcp.complete).to.be.true;
  });

  it('LCP loads when there is a bad image', async () => {
    img.src = '/tests/scripts/nope.mock.png';
    setLCPTrigger(img, []);
    const error = await getObjectProperty('lcp.error', ms);
    expect(error).to.be.true;
  });

  it('LCP loads when there is a good image', async () => {
    img.src = '/tests/scripts/block.mock.png';
    setLCPTrigger(img, []);
    const load = await getObjectProperty('lcp.load', ms);
    expect(load).to.be.true;
  });
});

describe('Block variations', () => {
  it('url maps to localhost', () => {
    expect(variationBlocks[0].classList.contains('columns')).to.be.true;
  });
});

describe('Script loading', async () => {
  function callback() { window.scriptCallback = true; }
  const script = await loadScript('/tests/scripts/block.mock.js', callback, 'module');
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
  const style = await loadStyle('/tests/scripts/block.mock.css', callback);
  it('style element exists', () => {
    expect(style).to.exist;
  });

  it('style calls back', async () => {
    const loaded = await getObjectProperty('styleCallback', ms);
    expect(loaded).to.be.true;
  });

  it('only one style', async () => {
    const oneStyle = await loadStyle('/tests/scripts/block.mock.css', callbackTwo);
    expect(oneStyle).to.exist;
    expect(window.styleCallbackTwo).to.be.true;
  });
});

describe('Template loading', () => {
  it('template doesnt exist', () => {
    const noTemplate = loadTemplate();
    expect(noTemplate).to.not.exist;
  });

  it('template has name', () => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'template');
    meta.setAttribute('content', 'docs');
    document.head.append(meta);
    loadTemplate();
    expect(document.body.classList.contains('docs-template')).to.be.true;
  });
});

describe('Block loading', async () => {
  const marquee = document.querySelector('.marquee');
  const columns = document.querySelector('.columns');

  it('block has a block select', () => {
    const { blockSelect } = columns.dataset;
    expect(blockSelect).to.exist;
  });

  it('block is loaded with only js', async () => {
    config.blocks['.marquee'] = {};
    await loadElement(marquee, config.blocks['.marquee']);
    expect(marquee.dataset.blockLoaded).to.exist;
  });

  it('block is loaded with css', async () => {
    await loadElement(columns, config.blocks['.columns']);
    expect(columns.dataset.blockLoaded).to.exist;
  });

  it('a block is attempted to load a second time', async () => {
    await loadElement(columns, config.blocks['.columns']);
    expect(columns.dataset.blockLoaded).to.exist;
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

describe('non lazy block loading', async () => {
  it('feature list is loaded', async () => {
    const wrapper = document.querySelector('.get-started-wrapper');
    const blocks = setupBlocks(wrapper, config);
    const loadedBlocks = await loadBlocks(blocks, config);
    expect(loadedBlocks[0]).to.exist;
  });
});

describe('Lazy loading', async () => {
  it('youtube is loaded', async () => {
    const wrapper = document.querySelector('.youtube-wrapper');
    const blocks = setupBlocks(wrapper, config);
    await loadBlocks(blocks, config);
    const iframe = await getLazyElement('iframe', ms);
    expect(iframe).to.exist;
  });
});

describe('Object property', async () => {
  const loaded = await getObjectProperty('nope', ms);
  expect(loaded).to.be.null;
});
