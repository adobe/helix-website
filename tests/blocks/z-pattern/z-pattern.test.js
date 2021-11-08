/* eslint-disable no-unused-expressions */
/* global describe it */

import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from '../../../blocks/z-pattern/z-pattern.js';

const mock = await readFile({ path: './z-pattern.mock.html' });
document.body.innerHTML = mock;

describe('Z Pattern', () => {
  it('has a heading', () => {
    const zPattern = document.querySelector('.z-pattern');
    init(zPattern);
    const heading = zPattern.querySelector('.z-pattern-heading');
    expect(heading).to.exist;
  });

  it('has a trailing cta', () => {
    const zPattern = document.querySelector('.z-pattern');
    init(zPattern);
    const cta = zPattern.querySelector('.z-pattern-cta');
    expect(cta).to.exist;
  });
});
