import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { truncate, weighBundle } from '../utils.js';

describe('truncate', () => {
  it('truncates to the beginning of the hour', () => {
    const time = new Date('2021-01-01T01:30:00Z');
    assert.strictEqual(truncate(time, 'hour'), '2021-01-01T02:00:00+01:00');
  });

  it('truncates to the beginning of the day', () => {
    const time = new Date('2021-01-01T01:30:00Z');
    assert.strictEqual(truncate(time, 'day'), '2021-01-01T00:00:00+01:00');
  });

  it('truncates to the beginning of the week', () => {
    const time = new Date('2021-01-01T01:30:00Z');
    assert.strictEqual(truncate(time, 'week'), '2020-12-27T00:00:00+01:00');
  });

  it('truncates to the beginning of the week (May 11th)', () => {
    const time = new Date('2024-05-11T00:00:00+02:00');
    assert.strictEqual(truncate(time, 'week'), '2024-05-05T00:00:00+02:00');
  });

  it('truncates to the beginning of the week (May 12th)', () => {
    const time = new Date('2024-05-12T00:00:00+02:00');
    assert.strictEqual(truncate(time, 'week'), '2024-05-12T00:00:00+02:00');
  });

  it('truncates to the beginning of the week (May 13th)', () => {
    const time = new Date('2024-05-13T00:00:00+02:00');
    assert.strictEqual(truncate(time, 'week'), '2024-05-12T00:00:00+02:00');
  });

  it('truncates to the beginning of the week (May 14th)', () => {
    const time = new Date('2024-05-14T00:00:00+02:00');
    assert.strictEqual(truncate(time, 'week'), '2024-05-12T00:00:00+02:00');
  });
});

describe('weighBundle', () => {
  it('weighs a bundle with a single CWV', () => {
    const bundle = {
      id: 'mv',
      host: 'www.aem.live',
      time: '2024-05-01T03:13:27.389Z',
      timeSlot: '2024-05-01T03:00:00.000Z',
      url: 'https://www.aem.live/docs/setup-byo-cdn-push-invalidation',
      userAgent: 'desktop:mac',
      weight: 100,
      events: [
        {
          checkpoint: 'cwv-inp',
          value: 8,
          timeDelta: 807389.1000976,
        },
      ],
      cwvINP: 8,
    };
    const weights = weighBundle(bundle);
    assert.deepEqual(weights, {
      goodINP: 100,
      good: 100,
    });
  });

  it('weighs a bundle with two CWVs', () => {
    const bundle = {
      id: 'mv',
      host: 'www.aem.live',
      time: '2024-05-01T03:13:27.389Z',
      timeSlot: '2024-05-01T03:00:00.000Z',
      url: 'https://www.aem.live/docs/setup-byo-cdn-push-invalidation',
      userAgent: 'desktop:mac',
      weight: 100,
      events: [
        {
          checkpoint: 'cwv-inp',
          value: 8,
          timeDelta: 807389.1000976,
        },
        {
          checkpoint: 'cwv-lcp',
          value: 4000,
          timeDelta: 807389.1000976,
        },
      ],
      cwvINP: 8,
      cwvLCP: 4000,
    };
    const weights = weighBundle(bundle);
    assert.deepEqual(weights, {
      goodINP: 50,
      poorLCP: 50,
      good: 50,
      poor: 50,
    });
  });

  it('weighs a bundle with three CWVs', () => {
    const bundle = {
      id: 'mv',
      host: 'www.aem.live',
      time: '2024-05-01T03:13:27.389Z',
      timeSlot: '2024-05-01T03:00:00.000Z',
      url: 'https://www.aem.live/docs/setup-byo-cdn-push-invalidation',
      userAgent: 'desktop:mac',
      weight: 100,
      events: [
        {
          checkpoint: 'cwv-inp',
          value: 8,
          timeDelta: 807389.1000976,
        },
        {
          checkpoint: 'cwv-lcp',
          value: 4000,
          timeDelta: 807389.1000976,
        },
        {
          checkpoint: 'cwv-cls',
          value: 0.1,
          timeDelta: 807389.1000976,
        },
      ],
      cwvINP: 8,
      cwvLCP: 4000,
      cwvCLS: 0.1,
    };
    const weights = weighBundle(bundle);
    assert.deepEqual(weights, {
      goodINP: 33,
      poorLCP: 33,
      niCLS: 33,
      good: 33,
      poor: 33,
      ni: 33,
    });
  });

  it('weighs a bundle with no CWVs', () => {
    const bundle = {
      id: 'mv',
      host: 'www.aem.live',
      time: '2024-05-01T03:13:27.389Z',
      timeSlot: '2024-05-01T03:00:00.000Z',
      url: 'https://www.aem.live/docs/setup-byo-cdn-push-invalidation',
      userAgent: 'desktop:mac',
      weight: 100,
      events: [],
    };
    const weights = weighBundle(bundle);
    assert.deepEqual(weights, {
      no: 100,
    });
  });
});
