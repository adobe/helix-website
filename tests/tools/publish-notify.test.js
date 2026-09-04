/* eslint-disable no-unused-expressions */
/* global describe it */

import { expect } from '@esm-bundle/chai';
import {
  toPagePath,
  toSourcePath,
  toHandle,
  formatMessage,
} from '../../tools/publish-notify/build-message.js';

describe('Publish notification paths', () => {
  it('strips a page extension to get the site path', () => {
    expect(toPagePath('/docs/edge-delivery-service-configuration.md')).to.equal('/docs/edge-delivery-service-configuration');
    expect(toPagePath('/blog/post.html')).to.equal('/blog/post');
  });

  it('strips only a trailing extension', () => {
    // A global replace of ".md" would mangle this one.
    expect(toPagePath('/docs/using.md-files.md')).to.equal('/docs/using.md-files');
  });

  it('treats data and media files as not-a-page', () => {
    expect(toPagePath('/community-feeds.json')).to.equal(null);
    expect(toPagePath('/media/diagram.png')).to.equal(null);
    expect(toPagePath('/sitemap.xml')).to.equal(null);
  });

  it('maps a published path to its source-bus path', () => {
    expect(toSourcePath('/docs/foo.md')).to.equal('/docs/foo.html');
    expect(toSourcePath('/community-feeds.json')).to.equal('/community-feeds.json');
  });

  it('derives a Slack handle from an email', () => {
    expect(toHandle('msagolj@adobe.com')).to.equal('@msagolj');
  });

  it('has no handle for an unknown publisher', () => {
    expect(toHandle(undefined)).to.equal(null);
    expect(toHandle('unknown')).to.equal(null);
  });
});

describe('Publish notification message', () => {
  const page = { path: '/docs/foo.md', url: 'https://www.aem.live/docs/foo' };

  it('names the publisher and links the page', () => {
    expect(formatMessage({ ...page, publisher: '@bohnert' }))
      .to.equal('@bohnert published <https://www.aem.live/docs/foo|/docs/foo>');
  });

  it('credits the author when it is someone else', () => {
    expect(formatMessage({ ...page, publisher: '@bohnert', author: '@msagolj' }))
      .to.equal('@bohnert published <https://www.aem.live/docs/foo|/docs/foo>, authored by @msagolj');
  });

  it('does not repeat one person as both publisher and author', () => {
    expect(formatMessage({ ...page, publisher: '@msagolj', author: '@msagolj' }))
      .to.equal('@msagolj published <https://www.aem.live/docs/foo|/docs/foo>');
  });

  it('still says something useful when the publisher is unknown', () => {
    expect(formatMessage({ ...page, publisher: null }))
      .to.equal('Just published: <https://www.aem.live/docs/foo|/docs/foo>');
  });

  it('announces data and media files that have no page URL', () => {
    expect(formatMessage({ path: '/community-feeds.json', url: null, publisher: '@bohnert' }))
      .to.equal('@bohnert published `/community-feeds.json`');
    expect(formatMessage({ path: '/media/diagram.png', url: null, publisher: '@bohnert' }))
      .to.equal('@bohnert published `/media/diagram.png`');
  });
});
