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
    const mod = await import('../../scripts/lib-franklin.js');
    Object.keys(mod).forEach((func) => {
      scripts[func] = mod[func];
    });
    document.body.innerHTML = await readFile({ path: './body.html' });
  });

  it('Initializes window.hlx', async () => {
    // simulate code base path and turn on lighthouse
    const testScript = document.createElement('script');
    testScript.src = '../../scripts/lib-franklin.js';
    testScript.type = 'module';
    document.head.appendChild(testScript);
    window.history.pushState({}, '', `${window.location.href}&lighthouse=on`);

    scripts.init();
    expect(window.hlx.codeBasePath).to.equal('');
    expect(window.hlx.lighthouse).to.equal(true);

    // test error handling
    const url = sinon.stub(window, 'URL');
    scripts.init();

    // cleanup
    url.restore();
    window.hlx.codeBasePath = '';
    window.hlx.lighthouse = false;
    Array.from(document.querySelectorAll('script')).pop().remove();
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
    const { loadCSS } = await import('../../scripts/lib-franklin.js');
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

  // todo: no longer needed since breaking2022_05 ?
  it.skip('Decorates pictures', async () => {
    // add styling to picture and test its removal
    document
      .querySelector('main picture')
      .parentElement.appendChild(document.createElement('strong'))
      .appendChild(document.querySelector('main picture'));
    scripts.decoratePictures(document.querySelector('main'));
    expect(document.querySelectorAll('strong > picture').length).to.equal(0);
  });

  it('Normalizes headings', async () => {
    const numHeadings = document.querySelectorAll(
      'h1, h2, h3, h4, h5, h6',
    ).length;
    scripts.normalizeHeadings(document.querySelector('main'), [
      'h1',
      'h2',
      'h3',
    ]);
    expect(document.querySelectorAll('h1, h2, h3, h4, h5, h6').length).to.equal(
      numHeadings,
    );
    expect(document.querySelectorAll('h4, h5, h6').length).to.equal(0);
  });
});

describe('Sections and blocks', () => {
  it('Decorates sections', async () => {
    scripts.decorateSections(document.querySelector('main'));
    expect(document.querySelectorAll('main .section').length).to.equal(3);
  });

  it('Decorates blocks', async () => {
    scripts.decorateBlocks(document.querySelector('main'));
    expect(document.querySelectorAll('main .block').length).to.equal(7);
  });

  it('Loads blocks', async () => {
    scripts.init();
    await scripts.loadBlocks(document.querySelector('main'));
    document.querySelectorAll('main .block').forEach(($block) => {
      expect($block.dataset.blockStatus).to.equal('loaded');
    });
  });

  it('Updates section status', async () => {
    scripts.updateSectionsStatus(document.querySelector('main'));
    document.querySelectorAll('main .section').forEach(($section) => {
      expect($section.dataset.sectionStatus).to.equal('loaded');
    });

    // test section with block still loading
    const $section = document.querySelector('main .section');
    delete $section.dataset.sectionStatus;
    $section.querySelector(':scope .block').dataset.blockStatus = 'loading';
    scripts.updateSectionsStatus(document.querySelector('main'));
    expect($section.dataset.sectionStatus).to.equal('loading');
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
