/* global describe it */

import { expect } from '@esm-bundle/chai';
import { restoreCrossSiteUrl, restoreCrossSiteLinks } from '../../utils/helpers.js';

const ORIGIN = 'https://www.aem.live';
const restore = (href) => restoreCrossSiteUrl(new URL(href, ORIGIN), ORIGIN);

describe('restoreCrossSiteUrl', () => {
  it('restores block collection links', () => {
    expect(restore('/block-collection/embed'))
      .to.equal('https://main--aem-block-collection--adobe.aem.live/block-collection/embed');
  });

  it('restores sidekick library links and keeps query and hash', () => {
    expect(restore('/tools/sidekick/library.html?plugin=blocks&path=/block-collection/embed&index=0'))
      .to.equal('https://sidekick-library--aem-block-collection--adobe.aem.page/tools/sidekick/library.html?plugin=blocks&path=/block-collection/embed&index=0');
    expect(restore('/tools/sidekick/library.html?plugin=blocks#foo'))
      .to.equal('https://sidekick-library--aem-block-collection--adobe.aem.page/tools/sidekick/library.html?plugin=blocks#foo');
    expect(restore('/tools/sidekick/library.html'))
      .to.equal('https://sidekick-library--aem-block-collection--adobe.aem.page/tools/sidekick/library.html');
  });

  it('ignores other links on the current site', () => {
    expect(restore('/docs/')).to.equal(null);
    expect(restore('/tools/sidekick/library.html/other')).to.equal(null);
    expect(restore('/tools/sidekick/library')).to.equal(null);
    expect(restore('/block-collection')).to.equal(null);
  });

  it('ignores links to other origins', () => {
    expect(restore('https://example.com/tools/sidekick/library.html')).to.equal(null);
    expect(restore('https://example.com/block-collection/embed')).to.equal(null);
  });

  it('defaults to the origin of the current page', () => {
    const url = new URL('/tools/sidekick/library.html?plugin=blocks', window.location.origin);
    expect(restoreCrossSiteUrl(url))
      .to.equal('https://sidekick-library--aem-block-collection--adobe.aem.page/tools/sidekick/library.html?plugin=blocks');
  });
});

describe('restoreCrossSiteLinks', () => {
  const LIBRARY = '/tools/sidekick/library.html?plugin=blocks&path=/block-collection/embed&index=0';
  const LIBRARY_RESTORED = `https://sidekick-library--aem-block-collection--adobe.aem.page${LIBRARY}`;

  // mirrors /docs/faq: only the first section is `.content`, the answers are sibling sections
  const mount = () => {
    const main = document.createElement('main');
    main.innerHTML = `
      <div class="content"><p><a id="hero" href="/docs/">Docs</a> <a id="hero-library" href="${LIBRARY}">Library</a></p></div>
      <div class="section" id="marketo">
        <div class="default-content-wrapper">
          <h3><a id="anchor" href="#marketo">Marketo</a></h3>
          <p>
            <a id="library" href="${LIBRARY}">iframe embed codes</a>
            <a id="collection" href="/block-collection/embed">embed</a>
            <a id="internal" href="/docs/faq">faq</a>
            <a id="external" href="https://example.com/tools/sidekick/library.html">external</a>
            <a id="named">no href</a>
          </p>
        </div>
      </div>`;
    document.body.append(main);
    return main;
  };
  const get = (main, id) => main.querySelector(`#${id}`);

  it('restores links outside of a .content section', () => {
    const main = mount();
    restoreCrossSiteLinks(main);
    expect(get(main, 'library').href).to.equal(LIBRARY_RESTORED);
    expect(get(main, 'library').target).to.equal('_blank');
    expect(get(main, 'collection').href)
      .to.equal('https://main--aem-block-collection--adobe.aem.live/block-collection/embed');
    expect(get(main, 'collection').target).to.equal('_blank');
    main.remove();
  });

  it('restores links inside a .content section', () => {
    const main = mount();
    restoreCrossSiteLinks(main);
    expect(get(main, 'hero-library').href).to.equal(LIBRARY_RESTORED);
    expect(get(main, 'hero-library').target).to.equal('_blank');
    main.remove();
  });

  it('sets the target on all .content links, but only on restored links elsewhere', () => {
    const main = mount();
    restoreCrossSiteLinks(main);
    expect(get(main, 'hero').target).to.equal('_self');
    expect(get(main, 'internal').hasAttribute('target')).to.equal(false);
    expect(get(main, 'anchor').hasAttribute('target')).to.equal(false);
    main.remove();
  });

  it('leaves other links alone', () => {
    const main = mount();
    restoreCrossSiteLinks(main);
    expect(get(main, 'internal').getAttribute('href')).to.equal('/docs/faq');
    expect(get(main, 'anchor').getAttribute('href')).to.equal('#marketo');
    expect(get(main, 'external').href).to.equal('https://example.com/tools/sidekick/library.html');
    expect(get(main, 'named').hasAttribute('href')).to.equal(false);
    main.remove();
  });

  it('skips links with an invalid url', () => {
    const main = document.createElement('main');
    main.innerHTML = `<div class="content"><a id="bad" href="http://[">bad</a><a id="ok" href="${LIBRARY}">ok</a></div>`;
    document.body.append(main);
    restoreCrossSiteLinks(main);
    expect(get(main, 'bad').hasAttribute('target')).to.equal(false);
    expect(get(main, 'ok').href).to.equal(LIBRARY_RESTORED);
    main.remove();
  });

  it('uses the given origin', () => {
    const main = mount();
    restoreCrossSiteLinks(main, 'https://www.aem.live');
    // the links resolve against the test origin, so nothing matches the given origin
    expect(get(main, 'library').getAttribute('href')).to.equal(LIBRARY);
    main.remove();
  });
});
