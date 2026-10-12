/* eslint-disable no-unused-expressions */
/* global describe it */

import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import decorate, {
  decorateLegacyFeatureLifecycle,
  getFeatureLifecycleMetadata,
} from '../../../blocks/feature-lifecycle/feature-lifecycle.js';

const mock = await readFile({ path: './feature-lifecycle.mock.html' });

describe('Feature lifecycle block', () => {
  it('uses lifecycle metadata and retains labs and deprecation metadata fallbacks', () => {
    const names = ['feature-lifecycle', 'feature-lifecycle-notice', 'labs', 'deprecation'];
    const setMeta = (name, content) => {
      let meta = document.head.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = name;
        document.head.append(meta);
      }
      meta.content = content;
    };
    const clearMetadata = () => {
      names.forEach((name) => document.head.querySelector(`meta[name="${name}"]`)?.remove());
    };

    clearMetadata();
    setMeta('feature-lifecycle', '4');
    setMeta('feature-lifecycle-notice', 'New lifecycle notice.');
    setMeta('labs', 'AEM Sites');
    setMeta('deprecation', 'Legacy deprecation notice.');
    expect(getFeatureLifecycleMetadata()).to.deep.equal({
      stage: '4',
      notice: 'New lifecycle notice.',
    });

    clearMetadata();
    setMeta('labs', 'AEM Sites');
    expect(getFeatureLifecycleMetadata()).to.deep.equal({
      stage: '3',
      notice: 'Ask us about this feature from the AEM Sites labs on your Teams or Slack channel!',
    });
    setMeta('labs', 'Header: Custom labs notice.');
    expect(getFeatureLifecycleMetadata()).to.deep.equal({
      stage: '3',
      notice: 'Custom labs notice.',
    });

    clearMetadata();
    setMeta('deprecation', 'Legacy deprecation notice.');
    expect(getFeatureLifecycleMetadata()).to.deep.equal({
      stage: '6',
      notice: 'Legacy deprecation notice.',
    });
    clearMetadata();
  });

  it('fetches and inlines the matching badge icon for the Discouraged / Spent stage', async () => {
    document.body.innerHTML = mock;
    const block = document.querySelector('.feature-lifecycle');
    const originalFetch = window.fetch;
    let requestedURL;
    window.fetch = async (url) => {
      requestedURL = url;
      return {
        ok: true,
        text: async () => '<svg xmlns="http://www.w3.org/2000/svg"><title>Discouraged (Spent)</title><rect /><text>Discouraged</text><text>Spent</text></svg>',
      };
    };

    try {
      await decorate(block);
    } finally {
      window.fetch = originalFetch;
    }

    const badge = block.querySelector('a.badge');
    const icon = badge.querySelector('svg.feature-lifecycle-icon');
    expect(requestedURL).to.equal('/icons/feature-lifecycle-spent.svg');
    expect(block.classList.contains('feature-lifecycle-spent')).to.equal(true);
    expect(badge.getAttribute('href')).to.equal('/docs/lifecycle#discouraged');
    expect(badge.getAttribute('aria-label')).to.equal('Feature lifecycle: Discouraged (Spent). Read about the feature lifecycle.');
    expect(icon).to.exist;
    expect(icon.querySelector('rect')).to.exist;
    expect(icon.querySelector('title').textContent).to.equal('Discouraged (Spent)');
    expect([...icon.querySelectorAll('text')].map((text) => text.textContent)).to.deep.equal(['Discouraged', 'Spent']);
    expect(icon.getAttribute('aria-hidden')).to.equal('true');
    expect(document.querySelector('.feature-lifecycle-notice').textContent).to.equal('Reach out if you need help.');
  });

  it('maps each stage number to its matching badge', async () => {
    const stages = ['seed', 'sprout', 'sapling', 'rooted', 'wilting', 'spent', 'uprooted'];
    const originalFetch = window.fetch;
    let requestedURL;
    window.fetch = async (url) => {
      requestedURL = url;
      return {
        ok: true,
        text: async () => '<svg xmlns="http://www.w3.org/2000/svg"></svg>',
      };
    };

    try {
      for (let i = 0; i < stages.length; i += 1) {
        document.body.innerHTML = mock;
        const block = document.querySelector('.feature-lifecycle');
        block.children[0].textContent = String(i + 1);
        // eslint-disable-next-line no-await-in-loop
        await decorate(block);

        expect(requestedURL).to.equal(`/icons/feature-lifecycle-${stages[i]}.svg`);
        expect(block.classList.contains(`feature-lifecycle-${stages[i]}`)).to.equal(true);
      }
    } finally {
      window.fetch = originalFetch;
    }
  });

  it('renders only the badge when the notice row is empty', async () => {
    document.body.innerHTML = mock;
    const block = document.querySelector('.feature-lifecycle');
    block.children[1].textContent = '';
    const originalFetch = window.fetch;
    window.fetch = async () => ({
      ok: true,
      text: async () => '<svg xmlns="http://www.w3.org/2000/svg"><title>Discouraged (Spent)</title></svg>',
    });

    try {
      await decorate(block);
    } finally {
      window.fetch = originalFetch;
    }

    expect(block.classList.contains('feature-lifecycle-spent')).to.equal(true);
    expect(block.querySelector('a.badge')).to.exist;
    expect(document.querySelector('.feature-lifecycle-notice')).to.not.exist;
  });

  it('converts legacy labs and deprecation blocks to their lifecycle stages', async () => {
    const originalFetch = window.fetch;
    const originalHlx = window.hlx;
    window.hlx = { ...window.hlx, codeBasePath: '' };
    window.fetch = async () => ({
      ok: true,
      text: async () => '<svg xmlns="http://www.w3.org/2000/svg"><title>Lifecycle stage</title></svg>',
    });
    const stylesheet = document.createElement('link');
    stylesheet.href = '/blocks/feature-lifecycle/feature-lifecycle.css';
    document.head.append(stylesheet);

    const expectLegacyStage = async (kind, stage) => {
      document.body.innerHTML = `
        <main>
          <div>
            <h1>Legacy feature</h1>
            <div class="${kind}">
              <div><div><h3>Legacy heading</h3><p>Legacy notice.</p></div></div>
            </div>
          </div>
        </main>`;
      const block = document.querySelector(`.${kind}`);

      await decorateLegacyFeatureLifecycle(block, kind);

      expect(block.classList.contains(`feature-lifecycle-${stage}`)).to.equal(true);
      expect(block.querySelector('a.badge')).to.exist;
      expect(document.querySelector('.feature-lifecycle-notice').textContent).to.equal('Legacy notice.');
    };

    const expectLegacyLabsDefaultNotice = async () => {
      document.body.innerHTML = `
        <main>
          <div>
            <h1>Legacy feature</h1>
            <div class="labs"><div><div>AEM Sites</div></div></div>
          </div>
        </main>`;
      const block = document.querySelector('.labs');

      await decorateLegacyFeatureLifecycle(block, 'labs');

      expect(document.querySelector('.feature-lifecycle-notice').textContent).to.equal(
        'Ask us about this feature from the AEM Sites labs on your Teams or Slack channel!',
      );
    };

    try {
      await expectLegacyStage('labs', 'sapling');
      await expectLegacyLabsDefaultNotice();
      await expectLegacyStage('deprecation', 'spent');
    } finally {
      window.fetch = originalFetch;
      window.hlx = originalHlx;
      stylesheet.remove();
    }
  });
});
