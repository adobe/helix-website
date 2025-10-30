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
    // Capture lastModified BEFORE calling decorate to avoid timing race condition
    const lastMod = new Date(document.lastModified);
    const shortDate = lastMod.toLocaleDateString();
    decorate(block);
    const rt = document.querySelector('relative-time');
    const rtDatetime = rt.getAttribute('datetime');

    // Allow for small time differences (±2 seconds) to handle timing edge cases
    const rtDate = new Date(rtDatetime);
    const timeDiff = Math.abs(rtDate.getTime() - lastMod.getTime());
    expect(timeDiff).to.be.at.most(2000, `Time difference was ${timeDiff}ms`);

    expect(rt.textContent).to.equal(shortDate);
    expect(block.textContent).to.equal(`prefix for relative time ${shortDate}`);
  });
});
