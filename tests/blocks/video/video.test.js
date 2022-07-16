/* eslint-disable no-unused-expressions */
/* global describe it beforeEach, afterEach */

import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import decorate from '../../../blocks/video/video.js';
import { setupIntersectionObserverMock, restoreDefaultIntersectionObserver, intersect } from '../../utils.js';

const mock = await readFile({ path: './video.mock.html' });
document.body.innerHTML = mock;

describe('Video', () => {
  beforeEach(() => {
    setupIntersectionObserverMock();
  });

  afterEach(() => {
    restoreDefaultIntersectionObserver();
  });

  it('has a video', async () => {
    const block = document.querySelector('.video');
    await decorate(block);

    // trigger the intersection observer
    intersect();

    // must contain a video tag
    const video = document.querySelector('video');
    expect(video).to.exist;
    const source = video.querySelector('source');
    expect(source).to.exist;
    expect(source.src).to.eql('http://localhost:2000/media_1d6e3d8e0e465fb2c43cdcb4c6ba8123693c86117.mp4');
  });
});
