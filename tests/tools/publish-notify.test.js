/* eslint-disable no-unused-expressions */
/* global describe it */

import { expect } from '@esm-bundle/chai';
import {
  toPagePath,
  toSourcePath,
  toHandle,
  formatMessage,
  toEpochMs,
  formatDelay,
  formatWhen,
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

describe('Publish notification timing', () => {
  // The real incident: /docs/special-metadata-properties was published once, at
  // 2026-09-08T07:19:21.771Z, and announced three times - 11:53Z, 12:46Z and 12:51Z -
  // because backlogged Track Publishes runs all resolved the same watermark. Nothing in
  // the message said so, so it read as three fresh publishes that had not happened.
  const PUBLISHED = 1788851961771;
  const ANNOUNCED = 1788871888167;

  it('reads the log timestamp, in milliseconds or seconds', () => {
    expect(toEpochMs(PUBLISHED)).to.equal(PUBLISHED);
    expect(toEpochMs(Math.floor(PUBLISHED / 1000))).to.equal(1788851961000);
    expect(toEpochMs('1788851961771')).to.equal(PUBLISHED);
  });

  it('has no timestamp to report when the payload carries none', () => {
    expect(toEpochMs(undefined)).to.equal(null);
    expect(toEpochMs('')).to.equal(null);
    expect(toEpochMs('not-a-number')).to.equal(null);
    expect(toEpochMs(0)).to.equal(null);
    expect(toEpochMs(-1)).to.equal(null);
  });

  it('spells a delay in hours and minutes', () => {
    expect(formatDelay(12 * 60 * 1000)).to.equal('12m');
    expect(formatDelay(ANNOUNCED - PUBLISHED)).to.equal('5h 32m');
  });

  it('says nothing about timing when the announcement is prompt', () => {
    expect(formatWhen(PUBLISHED, PUBLISHED + 30 * 1000)).to.equal(null);
    expect(formatWhen(PUBLISHED, PUBLISHED + 9 * 60 * 1000)).to.equal(null);
  });

  it('names the real publish time once the announcement is late', () => {
    expect(formatWhen(PUBLISHED, ANNOUNCED)).to.equal(
      '_(delayed 5h 32m - published <!date^1788851961^{date_short_pretty} at {time}|2026-09-08 07:19 UTC>)_',
    );
  });

  it('does not report a delay for a timestamp in the future', () => {
    expect(formatWhen(PUBLISHED, PUBLISHED - 60 * 60 * 1000)).to.equal(null);
  });

  it('appends the timing to the message, and omits it when prompt', () => {
    const page = { path: '/docs/foo.md', url: 'https://www.aem.live/docs/foo', publisher: '@rofe' };
    expect(formatMessage({ ...page, when: formatWhen(PUBLISHED, ANNOUNCED) }))
      .to.equal('@rofe published <https://www.aem.live/docs/foo|/docs/foo> _(delayed 5h 32m - published <!date^1788851961^{date_short_pretty} at {time}|2026-09-08 07:19 UTC>)_');
    expect(formatMessage({ ...page, when: formatWhen(PUBLISHED, PUBLISHED) }))
      .to.equal('@rofe published <https://www.aem.live/docs/foo|/docs/foo>');
  });
});
