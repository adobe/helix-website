/* eslint-disable no-unused-expressions */
/* global describe before it */

import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';

const scripts = {};

document.body.innerHTML = await readFile({ path: './dummy.html' });
document.head.innerHTML = await readFile({ path: './head.html' });

describe('Core Helix features', () => {
  before(async () => {
    const mod = await import('../../scripts/aem.js');
    Object.keys(mod).forEach((func) => {
      scripts[func] = mod[func];
    });
    document.body.innerHTML = await readFile({ path: './body.html' });
  });

  it('Initializes window.hlx', async () => {
    // simulate code base path and turn on lighthouse
    window.history.pushState({}, '', `${window.location.href}&lighthouse=on`);

    scripts.setup();
    expect(window.hlx.codeBasePath).to.equal('');
    expect(window.hlx.lighthouse).to.equal(true);

    // test error handling
    const url = sinon.stub(window, 'URL');
    scripts.setup();

    // cleanup
    url.restore();
    window.hlx.codeBasePath = '';
    window.hlx.lighthouse = false;
  });

  it('Sanitizes class name', async () => {
    expect(scripts.toClassName('Hello world')).to.equal('hello-world');
    expect(scripts.toClassName(null)).to.equal('');
  });

  it('Extracts metadata', async () => {
    expect(scripts.getMetadata('description')).to.equal(
      'Lorem ipsum dolor sit amet.',
    );
    expect(scripts.getMetadata('og:title')).to.equal('Foo');
  });

  it('Loads CSS', async () => {
    // loads a css file and calls callback
    // Import the loadCSS function dynamically
    const { loadCSS } = await import('../../scripts/aem.js');
    const load = await loadCSS('/tests/scripts/test.css');
    expect(load).to.be.ok;
    expect(getComputedStyle(document.body).color).to.equal('rgb(255, 0, 0)');

    // does nothing if css already loaded
    const noop = await loadCSS('/tests/scripts/test.css');
    expect(noop).to.be.undefined;

    // calls callback in case of error
    let error;
    try {
      await loadCSS('/tests/scripts/nope.css');
    } catch (err) {
      error = err;
    }
    expect(error).to.be.ok;
  });

  it('Collects RUM data', async () => {
    const sendBeacon = sinon.stub(navigator, 'sendBeacon');
    // turn on RUM
    window.history.pushState({}, '', `${window.location.href}&rum=on`);
    delete window.hlx;

    // sends checkpoint beacon
    await scripts.sampleRUM('test', { foo: 'bar' });
    expect(sendBeacon.called).to.be.true;
    expect(window.hlx.rum.queue.length).to.equal(1);
    sendBeacon.resetHistory();

    // queues cwv beacon
    await scripts.sampleRUM('cwv', { foo: 'bar' });
    expect(window.hlx.rum.queue.length).to.equal(2);

    // test error handling
    sendBeacon.throws();
    await scripts.sampleRUM('error', { foo: 'bar' });
    expect(window.hlx.rum.queue.length).to.equal(3);

    sendBeacon.restore();
  });

  it('Creates optimized picture', async () => {
    const $picture = scripts.createOptimizedPicture('/test/scripts/mock.png');
    expect($picture.querySelector(':scope source[type="image/webp"]')).to.exist; // webp
    expect($picture.querySelector(':scope source:not([type="image/webp"])')).to
      .exist; // fallback
    expect($picture.querySelector(':scope img').src).to.include(
      'format=png&optimize=medium',
    ); // default
  });
});

describe('Sections and blocks', () => {
  it('Decorates sections', async () => {
    scripts.decorateSections(document.querySelector('main'));
    expect(document.querySelectorAll('main .section').length).to.equal(3);
  });

  it('Decorates blocks', async () => {
    scripts.decorateBlocks(document.querySelector('main'));
    // aem.js's decorateSections doesn't strip Section Metadata blocks (that's
    // handled by scripts.js's own decorateSectionMetadata in production), so
    // the leftover .section-metadata div here is correctly counted as an
    // 8th block by decorateBlocks
    expect(document.querySelectorAll('main .block').length).to.equal(8);
  });

  it('Loads sections', async () => {
    // the RUM test above deletes window.hlx entirely; restore codeBasePath
    // so block/css module paths resolve correctly again
    scripts.setup();
    await scripts.loadSections(document.querySelector('main'));
    document.querySelectorAll('main .block').forEach(($block) => {
      expect($block.dataset.blockStatus).to.equal('loaded');
    });
  });

  it('Reads block config', async () => {
    document.querySelector('main .section > div').innerHTML += await readFile({
      path: './config.html',
    });
    const cfg = scripts.readBlockConfig(document.querySelector('main .config'));
    expect(cfg).to.deep.include({
      'prop-0': 'Plain text',
      'prop-1': 'Paragraph',
      'prop-2': ['First paragraph', 'Second paragraph'],
      'prop-3': 'https://www.adobe.com/',
      'prop-4': ['https://www.adobe.com/', 'https://www.hlx.live/'],
    });
  });
});
