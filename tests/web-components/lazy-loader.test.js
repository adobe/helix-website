/* eslint-disable no-unused-expressions */
/* global describe it */

import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import '../../web-components/lazy-loader.js';

document.body.innerHTML = await readFile({ path: './lazy-loader.mock.html' });

describe('Lazy-loader Web Component test', async () => {
  const sceSelector = 'some-custom-element';
  const scriptSelector = "script[src='42']";

  it('Registers a lazy-loader component', async () => {
    const loader = customElements.get('lazy-loader');
    expect(loader).to.exist;
  });

  it('Does not activate elements before hlx:delayed ', async () => {
    expect(document.querySelector(sceSelector)).to.be.null;
    expect(document.querySelector(scriptSelector)).to.be.null;
  });

  it('Activates elements once hlx:delayed is received', async () => {
    document.dispatchEvent(new CustomEvent('hlx:delayed'));
    const sce = document.body.querySelector(sceSelector);
    expect(sce).to.exist;
    expect(sce.getAttribute('id')).to.equal('12');
  });

  it('Moves scripts under document.head with async loading', async () => {
    document.dispatchEvent(new CustomEvent('hlx:delayed'));
    const script = document.head.querySelector(scriptSelector);
    expect(script).to.exist;
    expect(script.getAttribute('type')).to.equal('test-type');
    expect(script.getAttribute('async')).to.equal('true');
  });
});
