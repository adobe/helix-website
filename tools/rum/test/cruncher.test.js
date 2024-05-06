import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { readFileSync } from 'node:fs';
import { DataChunks, addCalculatedProps } from '../cruncher.js';

describe('cruncher.js helper functions', () => {
  it('addCalculatedProps()', () => {
    const bundle = {
      id: '37Rfpw',
      host: 'www.aem.live',
      time: '2024-05-06T05:00:06.668Z',
      timeSlot: '2024-05-06T05:00:00.000Z',
      url: 'https://www.aem.live/developer/tutorial',
      userAgent: 'desktop:mac',
      weight: 100,
      events: [
        {
          checkpoint: 'viewmedia',
          target: 'https://www.aem.live/developer/media_1c03ad909a87a4e318a33e780b93e4a1f8e7581a3.png',
          timeDelta: 6668.300048828125,
        },
        {
          checkpoint: 'cwv-ttfb',
          value: 116.40000009536743,
          timeDelta: 4157.60009765625,
        },
        {
          checkpoint: 'cwv-inp',
          value: 24,
          timeDelta: 22433,
        },
        {
          checkpoint: 'loadresource',
          target: 13,
          source: 'https://www.aem.live/side-navigation.plain.html',
          timeDelta: 2146.60009765625,
        },
        {
          checkpoint: 'cwv',
          timeDelta: 3405.699951171875,
        },
        {
          checkpoint: 'loadresource',
          target: 1,
          source: 'https://www.aem.live/new-footer.plain.html',
          timeDelta: 2146.300048828125,
        },
        {
          checkpoint: 'viewmedia',
          target: 'https://www.aem.live/developer/media_10ba61a1d511624419dcef8791a7ef1e2d4be517a.png',
          timeDelta: 2669.800048828125,
        },
        {
          checkpoint: 'viewmedia',
          target: 'https://www.aem.live/developer/media_10f4cf14edeb95728a5fe54816167b7bfdd84b470.png',
          timeDelta: 13955.60009765625,
        },
        {
          checkpoint: 'cwv-cls',
          value: 0.08819350790051111,
          timeDelta: 22433.199951171875,
        },
        {
          checkpoint: 'viewblock',
          source: '.side-navigation',
          timeDelta: 2263.800048828125,
        },
        {
          checkpoint: 'viewblock',
          source: '.video',
          timeDelta: 14990,
        },
        {
          checkpoint: 'cwv-lcp',
          value: 449.60000002384186,
          timeDelta: 22299.89990234375,
        },
        {
          checkpoint: 'load',
          timeDelta: 340.39990234375,
        },
        {
          checkpoint: 'viewmedia',
          target: 'https://www.aem.live/developer/media_1228880ca4b47272dfeff138bbc65e21ea7280ae2.png',
          timeDelta: 13113.800048828125,
        },
        {
          checkpoint: 'viewmedia',
          target: 'https://www.hlx.live/developer/videos/tutorial-step1.mp4',
          source: '.video',
          timeDelta: 2152.10009765625,
        },
        {
          checkpoint: 'viewblock',
          source: '.video',
          timeDelta: 2153.5,
        },
        {
          checkpoint: 'navigate',
          target: 'visible',
          source: 'https://www.aem.live/home',
          timeDelta: 2144.39990234375,
        },
        {
          checkpoint: 'viewmedia',
          target: 'https://www.aem.live/developer/media_1ac52277bb9463586a7cc3608c6bed2fb7fd3d10e.png',
          timeDelta: 17293.39990234375,
        },
        {
          checkpoint: 'cwv-fid',
          value: 17.600000023841858,
          timeDelta: 22301.60009765625,
        },
        {
          checkpoint: 'leave',
          timeDelta: 22432.699951171875,
        },
        {
          checkpoint: 'lazy',
          timeDelta: 397.10009765625,
        },
        {
          checkpoint: 'viewmedia',
          target: 'https://www.aem.live/developer/media_18d1c2a9ecd6557f129e41b42a03a8dfbff1e27e9.png',
          timeDelta: 2152.800048828125,
        },
        {
          checkpoint: 'loadresource',
          target: 2,
          source: 'https://www.aem.live/new-nav.plain.html',
          timeDelta: 2145.800048828125,
        },
        {
          checkpoint: 'top',
          target: 'visible',
          timeDelta: 156.300048828125,
        },
        {
          checkpoint: 'viewblock',
          source: '.header',
          timeDelta: 2153.199951171875,
        },
      ],
      cwvTTFB: 116.40000009536743,
      cwvINP: 24,
      cwvCLS: 0.08819350790051111,
      cwvLCP: 449.60000002384186,
    };
    const after = addCalculatedProps(bundle);
    assert.equal(after.visit, undefined);
    assert.equal(after.conversion, undefined);
    assert.equal(after.cwvINP, 24);
  });
});

describe('DataChunks', () => {
  it('new DataChunks()', async () => {
    const d = new DataChunks();
    assert.ok(d);
  });

  it('DataChunk.load()', () => {
    // load test chunks from cruncher.fixture.json
    const testFile = new URL('cruncher.fixture.json', import.meta.url);
    const testChunks = JSON.parse(readFileSync(testFile));
    assert.ok(testChunks);
  });
});
