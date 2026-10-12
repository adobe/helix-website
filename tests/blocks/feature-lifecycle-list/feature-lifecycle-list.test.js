/* eslint-disable no-unused-expressions */
/* global describe it */

import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import decorate from '../../../blocks/feature-lifecycle-list/feature-lifecycle-list.js';

const mock = await readFile({ path: './feature-lifecycle-list.mock.html' });

describe('Feature lifecycle list block', () => {
  it('lists pages where feature-lifecycle metadata has a value', async () => {
    document.body.innerHTML = mock;
    const pages = [
      {
        path: '/docs/first',
        title: 'First page',
        description: 'First description.',
        'feature-lifecycle': '3',
        labs: 'Early Access',
      },
      {
        path: '/developer/second',
        title: 'Second page',
        description: 'Second description.',
        'feature-lifecycle': '4',
      },
      {
        path: '/docs/third',
        title: 'Third page',
        description: 'Third description.',
        'feature-lifecycle': '5',
        labs: 'deprecated',
      },
      {
        path: '/docs/fourth',
        title: 'Fourth page',
        description: 'Fourth description.',
        'feature-lifecycle': '',
      },
      {
        path: '/docs/whitespace',
        title: 'Whitespace metadata page',
        description: 'Whitespace metadata.',
        'feature-lifecycle': '   ',
      },
      {
        path: '/docs/other',
        title: 'Other page',
        description: 'Other description.',
        deprecation: 'deprecated',
      },
    ];
    const originalFetch = window.fetch;
    let requestedURL;
    window.fetch = async (url) => {
      requestedURL = url;
      return {
        ok: true,
        json: async () => ({ data: pages }),
      };
    };

    try {
      await decorate(document.querySelector('.feature-lifecycle-list'));
    } finally {
      window.fetch = originalFetch;
    }

    const cards = document.querySelector('.cards');
    expect(requestedURL).to.equal('/docs/feature-lifecycle.json');
    expect(document.querySelector('.feature-lifecycle-list')).to.not.exist;
    expect(cards.classList.contains('alternate')).to.equal(true);
    expect(cards.classList.contains('three')).to.equal(true);
    expect(cards.classList.contains('early')).to.equal(false);

    const cardsList = [...cards.querySelectorAll(':scope > div > div')];
    expect(cards.querySelector(':scope > div').children).to.have.length(3);
    expect(cardsList).to.have.length(3);
    expect(cardsList.map((card) => card.querySelector('a').textContent)).to.deep.equal([
      'First page',
      'Second page',
      'Third page',
    ]);
    expect(cardsList.map((card) => card.querySelector('.cards-card-details p:last-of-type').textContent)).to.deep.equal([
      'First description.',
      'Second description.',
      'Third description.',
    ]);
  });
});
