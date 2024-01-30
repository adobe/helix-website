/* eslint-disable no-unused-expressions */
/* global describe it */

import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import decorate from '../../../blocks/model-viewer/model-viewer.js';

const mock = await readFile({ path: './model-viewer.mock.html' });
document.body.innerHTML = mock;

describe('Model viewer block', async () => {
  it('has a model-viewer element', async () => {
    const block = document.querySelector('.block');
    decorate(block);
    const loader = document.querySelector('lazy-loader');
    expect(loader).to.exist;
    const template = loader.querySelector('template');
    const cloned = template.content.cloneNode(true);
    document.body.append(cloned);

    const mv = document.body.querySelector('model-viewer');
    expect(mv).to.exist;
    const expected = {
      src: '/blocks/model-viewer/assets/the-model-name/3d-model.glb',
      alt: 'The model\'s description',
      ar: 'true',
      'environment-image': '/blocks/model-viewer/assets/the-model-name/environment-image.hdr',
      poster: '/blocks/model-viewer/assets/the-model-name/poster.webp',
      'shadow-intensity': '1',
      'camera-controls': 'true',
      'touch-action': 'pan-y',
    };
    Object.keys(expected).forEach((k) => {
      expect(mv.getAttribute(k)).to.equal(expected[k], `Expected attribute value '${k}' to match`);
    });

    const script = document.body.querySelector('script');
    expect(script).to.exist;
    expect(script.getAttribute('src')).to.equal('/web-components/google-model-viewer.min.js');
    expect(script.getAttribute('type')).to.equal('module');
  });
});
