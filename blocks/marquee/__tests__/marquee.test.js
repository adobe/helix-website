/* eslint-disable no-unused-expressions */
/* global describe it */

import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from '../marquee.js';

const mock = await readFile({ path: './marquee.mock.html' });
document.body.innerHTML = mock;

describe('Marquee', () => {
  it('has a background image', () => {
    const marquee = document.querySelector('.marquee.has-img');
    init(marquee);
    const background = marquee.querySelector('.background img');
    expect(background).to.exist;
  });

  it('has a background color', () => {
    const marquee = document.querySelector('.marquee.no-img');
    init(marquee);
    expect(marquee.style.background).to.equal('rgb(103, 103, 103)');
  });

  it('has an over background cta', () => {
    const marquee = document.querySelector('.marquee.dark');
    init(marquee);
    const cta = marquee.querySelector('a.over-background');
    expect(cta).to.exist;
  });

  it('has a normal cta', () => {
    const marquee = document.querySelector('.marquee.no-img');
    init(marquee);
    const cta = marquee.querySelector('a.cta');
    expect(cta).to.exist;
  });
});
