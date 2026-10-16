/* eslint-disable no-unused-expressions */
/* global describe it */

import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import decorate from '../../../blocks/feature-lifecycle-list/feature-lifecycle-list.js';

const mock = await readFile({ path: './feature-lifecycle-list.mock.html' });

describe('Feature lifecycle list block', () => {
  it('lists pages whose feature-lifecycle metadata matches the block stage', async () => {
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
        'feature-lifecycle': ' 3 ',
      },
      {
        path: '/docs/stage4',
        title: 'Stage 4 page',
        description: 'Stage 4 description.',
        'feature-lifecycle': '4',
      },
      {
        path: '/docs/third',
        title: 'Third page',
        description: 'Third description.',
        'feature-lifecycle': '3',
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
    expect(cards.classList.contains('feature-lifecycle-stage3')).to.equal(true);
    cardsList.forEach((card) => {
      expect([...card.classList].some((name) => name.startsWith('feature-lifecycle-stage')))
        .to.equal(false);
    });
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

  it('uses one block-level stage class for each stage swatch', async () => {
    let stage = 1;
    const pages = () => Array.from({ length: 3 }, (_, index) => ({
      path: `/docs/page${index + 1}`,
      title: `Page ${index + 1}`,
      description: 'Feature description.',
      'feature-lifecycle': ` ${stage} `,
    }));
    const originalFetch = window.fetch;
    window.fetch = async () => ({
      ok: true,
      json: async () => ({ data: pages() }),
    });
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = '/blocks/cards/cards.css';

    try {
      await new Promise((resolve, reject) => {
        stylesheet.onload = resolve;
        stylesheet.onerror = reject;
        document.head.append(stylesheet);
      });
      const colors = [
        'rgb(214, 236, 188)', 'rgb(166, 212, 123)', 'rgb(116, 190, 85)',
        'rgb(46, 158, 63)', 'rgb(205, 201, 58)', 'rgb(240, 164, 33)', 'rgb(138, 90, 52)',
      ];
      for (stage = 1; stage <= 7; stage += 1) {
        document.body.innerHTML = mock;
        document.querySelector('.feature-lifecycle-list > div > div').textContent = ` ${stage} `;
        // eslint-disable-next-line no-await-in-loop
        await decorate(document.querySelector('.feature-lifecycle-list'));
        const cards = document.querySelector('.cards');
        cards.style.colorScheme = 'light';
        expect(cards.classList.contains('alternate')).to.equal(true);
        expect(cards.classList.contains('three')).to.equal(true);
        expect(cards.classList.contains(`feature-lifecycle-stage${stage}`)).to.equal(true);
        const cells = [...cards.querySelectorAll('.cards-card')];
        expect(cells).to.have.length(3);
        const color = colors[stage - 1];
        cells.forEach((cell) => {
          expect([...cell.classList].some((name) => name.startsWith('feature-lifecycle-stage')))
            .to.equal(false);
          expect(getComputedStyle(cell.querySelector('a'), '::after').borderRightColor)
            .to.equal(color);
        });
        if (stage === 7) {
          cards.style.colorScheme = 'dark';
          expect(getComputedStyle(cells[0].querySelector('a'), '::after').borderRightColor)
            .to.equal('rgb(197, 139, 90)');
        }
      }
    } finally {
      window.fetch = originalFetch;
      stylesheet.remove();
    }
  });
});
