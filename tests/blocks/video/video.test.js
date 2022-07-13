/* eslint-disable no-unused-expressions */
/* global describe it */

import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import decorate from '../../../blocks/video/video.js';

const mock = await readFile({ path: './video.mock.html' });
document.body.innerHTML = mock;

describe('Video', () => {
  it('has a video', () => {
    const video = document.querySelector('.video');
    decorate(video);
    expect(video).to.exist;
  });
});
