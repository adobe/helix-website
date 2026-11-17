/* global describe it beforeEach afterEach */

import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { fetchSourceData } from '../../../blocks/doc-search/doc-search.js';
import onSearchInput from '../../../blocks/header/gnav-search.js';

describe('Documentation search indexing', () => {
  let fetchStub;
  let originalDocs;
  let originalBlogIndex;
  let originalBody;
  const pages = [
    undefined, '', 'index, follow', 'nofollow', 'notnoindex',
    'noindex', 'noindex, nofollow', 'NOINDEX', ' follow, NOINDEX ',
  ].map((robots, index) => ({
    path: `/docs/page-${index}`,
    title: 'Searchable documentation',
    description: 'Documentation description',
    content: 'Searchable documentation content',
    image: '/default-meta-image.jpg',
    robots,
  }));
  const expectedPages = pages.slice(0, 4);

  beforeEach(() => {
    originalDocs = window.docs;
    originalBlogIndex = window.blogIndex;
    originalBody = document.body.innerHTML;
    delete window.docs;
    delete window.blogIndex;
    fetchStub = sinon.stub(window, 'fetch').resolves({
      json: async () => ({ data: pages }),
    });
    document.body.innerHTML = '<nav class="gnav"><div class="results"></div></nav>';
  });

  afterEach(() => {
    fetchStub.restore();
    window.docs = originalDocs;
    window.blogIndex = originalBlogIndex;
    document.body.innerHTML = originalBody;
  });

  it('excludes noindex directives before caching doc-search data', async () => {
    expect(await fetchSourceData('/docpages-index.json')).to.deep.equal(expectedPages);
    expect(window.docs).to.deep.equal(expectedPages);
    expect(await fetchSourceData('/docpages-index.json')).to.deep.equal(expectedPages);
    expect(fetchStub.callCount).to.equal(1);
    expect(pages).to.have.length(9);
  });

  it('preserves empty doc-search responses', async () => {
    fetchStub.resolves({ json: async () => ({}) });
    expect(await fetchSourceData('/docpages-index.json')).to.deep.equal([]);
  });

  it('excludes noindex directives from gnav results and both caches', async () => {
    const results = document.querySelector('.results');
    onSearchInput('searchable', results);
    await new Promise((resolve) => { setTimeout(resolve, 0); });

    expect([...results.querySelectorAll('a')].map((link) => link.getAttribute('href')))
      .to.deep.equal(expectedPages.map((page) => page.path));
    expect(window.blogIndex.data).to.deep.equal(expectedPages);
    expect(Object.keys(window.blogIndex.lookup)).to.deep.equal(
      expectedPages.map((page) => page.path),
    );

    onSearchInput('searchable', results);
    expect(results.children).to.have.length(expectedPages.length);
    expect(fetchStub.callCount).to.equal(1);
  });

  it('filters gnav entries before applying the result limit', async () => {
    const hiddenPages = Array.from({ length: 13 }, (_, index) => ({
      ...pages[5], path: `/docs/hidden-${index}`,
    }));
    fetchStub.resolves({ json: async () => ({ data: [...hiddenPages, ...expectedPages] }) });
    const results = document.querySelector('.results');
    onSearchInput('searchable', results);
    await new Promise((resolve) => { setTimeout(resolve, 0); });

    expect([...results.querySelectorAll('a')].map((link) => link.getAttribute('href')))
      .to.deep.equal(expectedPages.map((page) => page.path));
  });
});
