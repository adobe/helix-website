/* eslint-disable no-unused-expressions */
/* global describe it */

import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import setFragment from '../../../blocks/fragment/fragment.js';

const mock = await readFile({ path: './fragment.mock.html' });
document.body.innerHTML = mock;

describe('Fragment loading', async () => {
  it('fragment is loaded', async () => {
    const el = document.querySelector('.fragment');
    await setFragment(el);
    const heading = document.querySelector('.fragment h1');
    expect(heading).to.exist;
  });

  it('fragment is not loaded', async () => {
    const el = document.querySelector('.fragment.nope');
    const fragment = await setFragment(el);
    expect(fragment).to.be.null;
  });
});
