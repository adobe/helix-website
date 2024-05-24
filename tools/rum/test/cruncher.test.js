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
    const d = new DataChunks();
    d.load(testChunks);
    assert.equal(d.data.length, 31);
  });

  it('DataChunk.bundles', () => {
    // load test chunks from cruncher.fixture.json
    const testFile = new URL('cruncher.fixture.json', import.meta.url);
    const testChunks = JSON.parse(readFileSync(testFile));
    const d = new DataChunks();
    d.load(testChunks);
    assert.equal(d.bundles.length, 969);
  });

  it('DataChunk.bundles (repeat)', () => {
    // load test chunks from cruncher.fixture.json
    const testFile = new URL('cruncher.fixture.json', import.meta.url);
    const testChunks = JSON.parse(readFileSync(testFile));
    const d = new DataChunks();
    d.load(testChunks);
    assert.equal(d.bundles.length, 969);
    assert.equal(d.bundles.length, 969);
    assert.equal(d.bundles.length, 969);
  });

  it('DataChunk.addData()', () => {
    const chunks1 = [
      {
        date: '2024-05-06',
        rumBundles: [
          {
            id: 'one',
            host: 'www.aem.live',
            time: '2024-05-06T00:00:04.444Z',
            timeSlot: '2024-05-06T00:00:00.000Z',
            url: 'https://www.aem.live/home',
            userAgent: 'desktop:windows',
            weight: 100,
            events: [
              {
                checkpoint: 'top',
                target: 'visible',
                timeDelta: 4444.5,
              },
            ],
          },
        ],
      },
    ];
    const chunks2 = [
      {
        date: '2024-05-06',
        rumBundles: [
          {
            id: 'two',
            host: 'www.aem.live',
            time: '2024-05-06T00:00:04.444Z',
            timeSlot: '2024-05-06T00:00:00.000Z',
            url: 'https://www.aem.live/home',
            userAgent: 'desktop:windows',
            weight: 100,
            events: [
              {
                checkpoint: 'top',
                target: 'visible',
                timeDelta: 4444.5,
              },
            ],
          },
        ],
      },
    ];
    const d = new DataChunks();
    d.load(chunks1);
    assert.equal(d.bundles.length, 1);
    d.addData(chunks2);
    assert.equal(d.bundles.length, 2);
  });

  it('DataChunk.filter()', () => {
    const chunks1 = [
      {
        date: '2024-05-06',
        rumBundles: [
          {
            id: 'one',
            host: 'www.aem.live',
            time: '2024-05-06T00:00:04.444Z',
            timeSlot: '2024-05-06T00:00:00.000Z',
            url: 'https://www.aem.live/home',
            userAgent: 'desktop:windows',
            weight: 100,
            events: [
              {
                checkpoint: 'top',
                target: 'visible',
                timeDelta: 4444.5,
              },
            ],
          },
        ],
      },
    ];
    const chunks2 = [
      {
        date: '2024-05-06',
        rumBundles: [
          {
            id: 'two',
            host: 'www.aem.live',
            time: '2024-05-06T00:00:04.444Z',
            timeSlot: '2024-05-06T00:00:00.000Z',
            url: 'https://www.aem.live/home',
            userAgent: 'desktop:windows',
            weight: 100,
            events: [
              {
                checkpoint: 'top',
                target: 'visible',
                timeDelta: 4444.5,
              },
            ],
          },
        ],
      },
    ];
    const d = new DataChunks();
    d.load(chunks1);
    d.addData(chunks2);

    d.addFacet('all', () => 'true');
    d.addFacet('none', () => 'false');
    d.addFacet('id', (bundle) => bundle.id);

    d.filter = {
      all: ['true'],
    };
    assert.equal(d.filtered.length, 2);

    d.filter = {
      none: ['true'],
    };
    assert.equal(d.filtered.length, 0);

    d.filter = {
      id: ['one'],
    };
    assert.equal(d.filtered.length, 1);
  });

  it('DataChunk.group()', () => {
    const chunks1 = [
      {
        date: '2024-05-06',
        rumBundles: [
          {
            id: 'one',
            host: 'www.aem.live',
            time: '2024-05-06T00:00:04.444Z',
            timeSlot: '2024-05-06T00:00:00.000Z',
            url: 'https://www.aem.live/home',
            userAgent: 'desktop:windows',
            weight: 100,
            events: [
              {
                checkpoint: 'top',
                target: 'visible',
                timeDelta: 100,
              },
            ],
          },
          {
            id: 'two',
            host: 'www.aem.live',
            time: '2024-05-06T00:00:04.444Z',
            timeSlot: '2024-05-06T00:00:00.000Z',
            url: 'https://www.aem.live/home',
            userAgent: 'desktop:windows',
            weight: 100,
            events: [
              {
                checkpoint: 'top',
                target: 'hidden',
                timeDelta: 200,
              },
            ],
          },
        ],
      },
    ];
    const d = new DataChunks();
    d.load(chunks1);
    const grouped = d.group((bundle) => bundle.id);
    assert.equal(grouped.one.length, 1);
    assert.equal(grouped.two.length, 1);
    const groupedbydisplay = d.group((bundle) => bundle.events.find((e) => e.checkpoint === 'top')?.target);
    assert.equal(groupedbydisplay.visible.length, 1);
    assert.equal(groupedbydisplay.hidden.length, 1);
  });

  it('DataChunk.totals()', () => {
    const chunks1 = [
      {
        date: '2024-05-06',
        rumBundles: [
          {
            id: 'one',
            host: 'www.aem.live',
            time: '2024-05-06T00:00:04.444Z',
            timeSlot: '2024-05-06T00:00:00.000Z',
            url: 'https://www.aem.live/home',
            userAgent: 'desktop:windows',
            weight: 100,
            events: [
              {
                checkpoint: 'top',
                target: 'visible',
                timeDelta: 100,
              },
            ],
          },
          {
            id: 'two',
            host: 'www.aem.live',
            time: '2024-05-06T00:00:04.444Z',
            timeSlot: '2024-05-06T00:00:00.000Z',
            url: 'https://www.aem.live/home',
            userAgent: 'desktop:windows',
            weight: 100,
            events: [
              {
                checkpoint: 'top',
                target: 'hidden',
                timeDelta: 200,
              },
              {
                checkpoint: 'click',
              },
            ],
          },
        ],
      },
    ];
    const d = new DataChunks();
    d.load(chunks1);

    // define two series
    d.addSeries('toptime', (bundle) => bundle.events.find((e) => e.checkpoint === 'top')?.timeDelta);
    d.addSeries('clickcount', (bundle) => bundle.events.filter((e) => e.checkpoint === 'click').length);

    // get totals
    const { totals } = d;
    // for each series, there are a number of ways to look at the aggregate
    assert.equal(totals.toptime.sum, 300);
    assert.equal(totals.toptime.mean, 150);
    assert.equal(totals.clickcount.sum, 1);
    assert.equal(totals.clickcount.mean, 0.5);
  });

  it('DataChunk.aggregate()', () => {
    const chunks1 = [
      {
        date: '2024-05-06',
        rumBundles: [
          {
            id: 'one',
            host: 'www.aem.live',
            time: '2024-05-06T00:00:04.444Z',
            timeSlot: '2024-05-06T00:00:00.000Z',
            url: 'https://www.aem.live/home',
            userAgent: 'desktop:windows',
            weight: 100,
            events: [
              {
                checkpoint: 'top',
                target: 'visible',
                timeDelta: 100,
              },
            ],
          },
          {
            id: 'two',
            host: 'www.aem.live',
            time: '2024-05-06T00:00:04.444Z',
            timeSlot: '2024-05-06T00:00:00.000Z',
            url: 'https://www.aem.live/home',
            userAgent: 'desktop:windows',
            weight: 100,
            events: [
              {
                checkpoint: 'top',
                target: 'hidden',
                timeDelta: 200,
              },
              {
                checkpoint: 'click',
              },
            ],
          },
        ],
      },
    ];
    const d = new DataChunks();
    d.load(chunks1);

    // define two series
    d.addSeries('toptime', (bundle) => bundle.events.find((e) => e.checkpoint === 'top')?.timeDelta);
    d.addSeries('clickcount', (bundle) => bundle.events.filter((e) => e.checkpoint === 'click').length);

    // group by display
    d.group((bundle) => bundle.events.find((e) => e.checkpoint === 'top')?.target);

    // get aggregates
    const { aggregates } = d;
    // the first level of aggregation is by group
    assert.deepEqual(Object.keys(aggregates), ['visible', 'hidden']);
    // the second level of aggregation is by series
    assert.equal(aggregates.visible.toptime.sum, 100);
    assert.equal(aggregates.hidden.toptime.sum, 200);
    assert.equal(aggregates.visible.clickcount.sum, 0);
    assert.equal(aggregates.hidden.clickcount.sum, 1);
    // we can also compare the sum and count metrics to the parent (all) group
    assert.equal(aggregates.visible.toptime.share, 1 / 2);
    // percentage is calculated as the ratio of sums
    assert.equal(aggregates.hidden.toptime.percentage, 2 / 3);
  });

  it('DataChunk.facets', () => {
    const chunks1 = [
      {
        date: '2024-05-06',
        rumBundles: [
          {
            id: 'one',
            host: 'www.aem.live',
            time: '2024-05-06T00:00:04.444Z',
            timeSlot: '2024-05-06T00:00:00.000Z',
            url: 'https://www.aem.live/developer/tutorial',
            userAgent: 'desktop:windows',
            weight: 100,
            events: [
              {
                checkpoint: 'top',
                target: 'visible',
                timeDelta: 100,
              },
            ],
          },
          {
            id: 'two',
            host: 'www.aem.live',
            time: '2024-05-06T00:00:04.444Z',
            timeSlot: '2024-05-06T00:00:00.000Z',
            url: 'https://www.aem.live/home',
            userAgent: 'desktop:windows',
            weight: 100,
            events: [
              {
                checkpoint: 'top',
                target: 'hidden',
                timeDelta: 200,
              },
              {
                checkpoint: 'click',
              },
            ],
          },
          {
            id: 'three',
            host: 'www.aem.live',
            time: '2024-05-06T00:00:04.444Z',
            timeSlot: '2024-05-06T00:00:00.000Z',
            url: 'https://www.aem.live/home',
            userAgent: 'mobile:ios',
            weight: 100,
            events: [
              {
                checkpoint: 'top',
                target: 'visible',
                timeDelta: 200,
              },
              {
                checkpoint: 'viewmedia',
                target: 'some_image.png',
              },
            ],
          },
        ],
      },
    ];
    const d = new DataChunks();
    d.load(chunks1);

    // define two series
    d.addSeries('toptime', (bundle) => bundle.events.find((e) => e.checkpoint === 'top')?.timeDelta);
    d.addSeries('clickcount', (bundle) => bundle.events.filter((e) => e.checkpoint === 'click').length);

    // group by display
    d.group((bundle) => bundle.events.find((e) => e.checkpoint === 'top')?.target);

    // define facet functions
    d.addFacet('host', (bundle) => bundle.host);
    d.addFacet('url', (bundle) => bundle.url);
    d.addFacet('userAgent', (bundle) => {
      const parts = bundle.userAgent.split(':');
      return parts.reduce((acc, _, i) => {
        acc.push(parts.slice(0, i + 1).join(':'));
        return acc;
      }, []);
    });

    // set an example filter
    d.filter = {
      host: ['www.aem.live'],
    };

    // get facets
    const { facets } = d;

    // the first level of aggregation is by facet
    assert.deepEqual(Object.keys(facets), ['host', 'url', 'userAgent']);
    assert.deepEqual(facets.url.map((f) => f.value), [
      // two bundles, so it comes first
      'https://www.aem.live/home',
      // one bundle, so it comes second
      'https://www.aem.live/developer/tutorial']);

    // one entry can create multiple facets, if the facet function returns an array
    // so that desktop can include all desktop:* variants
    assert.deepEqual(facets.userAgent.map((f) => f.value), [
      'desktop',
      'desktop:windows',
      'mobile',
      'mobile:ios',
    ]);
  });

  it('DataChunk.filter(userAgent)', () => {
    const chunks1 = [
      {
        date: '2024-05-06',
        rumBundles: [
          {
            id: 'one',
            host: 'www.aem.live',
            time: '2024-05-06T00:00:04.444Z',
            timeSlot: '2024-05-06T00:00:00.000Z',
            url: 'https://www.aem.live/developer/tutorial',
            userAgent: 'desktop:windows',
            weight: 100,
            events: [
              {
                checkpoint: 'top',
                target: 'visible',
                timeDelta: 100,
              },
            ],
          },
          {
            id: 'two',
            host: 'www.aem.live',
            time: '2024-05-06T00:00:04.444Z',
            timeSlot: '2024-05-06T00:00:00.000Z',
            url: 'https://www.aem.live/home',
            userAgent: 'desktop',
            weight: 100,
            events: [
              {
                checkpoint: 'top',
                target: 'hidden',
                timeDelta: 200,
              },
              {
                checkpoint: 'click',
              },
            ],
          },
          {
            id: 'three',
            host: 'www.aem.live',
            time: '2024-05-06T00:00:04.444Z',
            timeSlot: '2024-05-06T00:00:00.000Z',
            url: 'https://www.aem.live/home',
            userAgent: 'mobile:ios',
            weight: 100,
            events: [
              {
                checkpoint: 'top',
                target: 'visible',
                timeDelta: 200,
              },
              {
                checkpoint: 'viewmedia',
                target: 'some_image.png',
              },
            ],
          },
        ],
      },
    ];
    const d = new DataChunks();
    d.load(chunks1);

    // define facet functions
    d.addFacet('userAgent', (bundle) => {
      const parts = bundle.userAgent.split(':');
      return parts.reduce((acc, _, i) => {
        acc.push(parts.slice(0, i + 1).join(':'));
        return acc;
      }, []);
    });

    // set an example filter
    d.filter = {
      host: ['www.aem.live'],
      userAgent: ['desktop'],
    };

    assert.equal(d.filtered.length, 2);

    // get facets and subfacets
    const { facets } = d;

    // one entry can create multiple facets, if the facet function returns an array
    // so that desktop can include all desktop:* variants
    assert.deepEqual(facets.userAgent.map((f) => f.value), [
      'desktop',
      'desktop:windows',
      'mobile',
      'mobile:ios',
    ]);
  });
});
describe('DataChunks.hasConversion', () => {
  it('will tag bundles with convert and not-convert based on a filter spec', () => {
    const chunks = [
      {
        date: '2024-05-06',
        rumBundles: [
          {
            id: 'one',
            host: 'www.aem.live',
            time: '2024-05-06T00:00:04.444Z',
            timeSlot: '2024-05-06T00:00:00.000Z',
            url: 'https://www.aem.live/developer/tutorial',
            userAgent: 'desktop:windows',
            weight: 100,
            events: [
              {
                checkpoint: 'top',
                target: 'visible',
                timeDelta: 100,
              },
            ],
          },
          {
            id: 'two',
            host: 'www.aem.live',
            time: '2024-05-06T00:00:04.444Z',
            timeSlot: '2024-05-06T00:00:00.000Z',
            url: 'https://www.aem.live/home',
            userAgent: 'desktop',
            weight: 100,
            events: [
              {
                checkpoint: 'top',
                target: 'hidden',
                timeDelta: 200,
              },
              {
                checkpoint: 'click',
              },
            ],
          },
          {
            id: 'three',
            host: 'www.aem.live',
            time: '2024-05-06T00:00:04.444Z',
            timeSlot: '2024-05-06T00:00:00.000Z',
            url: 'https://www.aem.live/home',
            userAgent: 'mobile:ios',
            weight: 100,
            events: [
              {
                checkpoint: 'top',
                target: 'visible',
                timeDelta: 200,
              },
              {
                checkpoint: 'viewmedia',
                target: 'some_image.png',
              },
            ],
          },
        ],
      },
    ];
    const d = new DataChunks();
    d.load(chunks);

    const spec = {
      checkpoint: ['top'],
      target: ['hidden'],
    };
    const facetValueFn = (bundle) => (d.hasConversion(bundle, spec) ? 'converted' : 'not-converted');
    d.addFacet('conversion', facetValueFn);
    const facets = d.facets.conversion;
    const converted = facets.find((f) => f.value === 'converted');
    assert.equal(converted?.count, 1);
    const notConverted = facets.find((f) => f.value === 'not-converted');
    assert.equal(notConverted?.count, 2);
  });
});
