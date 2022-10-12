/* eslint-disable no-unused-expressions */
/* global describe it */

import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import setFragment from '../../../blocks/fragment/fragment.js';

const mock = await readFile({ path: './fragment.mock.html' });
document.body.innerHTML = mock;

describe('Fragment loading', async () => {
  it('fragment is loaded', async () => {
    const fragment = document.querySelector('.fragment');
    await setFragment(fragment);
    const heading = document.querySelector('.h1-from-fragment');
    expect(heading).to.exist;
  });

  it('fragment is not loaded', async () => {
    const el = document.querySelector('.fragment.nope');
    await setFragment(el);
    const a = document.querySelector('.nope a');
    // fragment not found, not replaced
    expect(a).to.exist;
  });
});
