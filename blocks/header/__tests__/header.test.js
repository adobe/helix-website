/* global it */

import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';

const mock = await readFile({ path: '../__mocks__/header.html' });
document.body.innerHTML = mock;

it('adds 1 + 2 to equal 3', async () => {
  expect([1, 2, 3].indexOf(4)).to.equal(-1);
});
