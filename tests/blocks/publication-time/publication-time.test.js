/* eslint-disable no-unused-expressions */
/* global describe it */

import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import decorate from '../../../blocks/publication-time/publication-time.js';

const mock = await readFile({ path: './publication-time.mock.html' });
document.body.innerHTML = mock;

describe('Publication time block', async () => {
  it('has a relative-time element', async () => {
    const block = document.querySelector('.block');
    decorate(block);
    const rt = document.querySelector('relative-time');
    const lastMod = new Date(document.lastModified);
    const shortDate = lastMod.toLocaleDateString();
    expect(rt.getAttribute('datetime')).to.equal(lastMod.toISOString());
    expect(rt.textContent).to.equal(shortDate);
    expect(block.textContent).to.equal(`prefix for relative time ${shortDate}`);
  });
});
