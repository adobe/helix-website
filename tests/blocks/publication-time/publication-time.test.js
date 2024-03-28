/* eslint-disable no-unused-expressions */
/* global describe it */

import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import decorate from '../../../blocks/publication-time/publication-time.js';

const mock = await readFile({ path: './publication-time.mock.html' });
document.body.innerHTML = mock;

describe('Publication time block', async () => {
  it('has a relative-time element', async () => {
    Object.defineProperty(document, 'lastModified', {
      get: () => 1234567891234,
    });
    const block = document.querySelector('.block');
    decorate(block);
    const rt = document.querySelector('relative-time');
    expect(rt.getAttribute('datetime')).to.equal('2009-02-13T23:31:31.234Z');
    expect(rt.textContent).to.equal('2/14/2009');
    expect(block.textContent).to.equal('prefix for relative time 2/14/2009');
  });
});
