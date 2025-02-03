// eslint-disable-next-line import/no-relative-packages
import {
  DataChunks, series, facets, utils,
} from '@adobe/rum-distiller';

import DataLoader from './loader.js';
import { API_ENDPOINT } from './utils.js';

class URLReports {
  constructor(config) {
    this.start = config.start;
    this.end = config.end;
    this.data = null;

    const loader = new DataLoader();
    loader.apiEndpoint = API_ENDPOINT;
    loader.domain = config.domain;
    loader.domainKey = config.domainKey;

    this.loader = loader;
  }

  async init() {
    this.data = await this.loader.fetchPeriod(`${this.start} 00:00:00`, `${this.end} 23:59:59`);

    const dataChunks = new DataChunks();

    // distiller defined series
    dataChunks.addSeries('pageViews', series.pageViews);
    dataChunks.addSeries('visits', series.visits);
    dataChunks.addSeries('bounces', series.bounces);
    dataChunks.addSeries('engagement', series.engagement);
    dataChunks.addSeries('organic', series.organic);

    // custom series
    dataChunks.addSeries('conversions', (bundle) => (dataChunks.hasConversion(bundle, { 'hasclick&source': [true] }) ? bundle.weight : 0));

    dataChunks.addSeries('timeOnPage', (bundle) => {
      const deltas = bundle.events
        .map((evt) => evt.timeDelta)
        .filter((delta) => delta > 0);
      if (deltas.length === 0) {
        return undefined;
      }
      return Math.max(...deltas, 0) / 1000;
    });

    dataChunks.addSeries('contentEngagement', (bundle) => {
      const viewEvents = bundle.events
        .filter((evt) => evt.checkpoint === 'viewmedia' || evt.checkpoint === 'viewblock');
      return viewEvents.length;
    });

    dataChunks.addFacet('checkpoint', facets.checkpoint);
    dataChunks.addFacet('url', facets.plainURL);
    dataChunks.addFacet('userAgent', facets.userAgent);

    dataChunks.addFacet('hasclick&source', (bundle) => {
      const a = bundle.events
        .filter((event) => event.checkpoint === 'click' && event.source && event.source.includes('cta'));
      return a.length > 0;
    });

    dataChunks.addFacet('underroot', (bundle) => {
      if (!bundle.url) return false;
      const u = new URL(bundle.url);
      return !!u.pathname.match(/\/\d{4}\//);
    });

    dataChunks.addFacet('referer', (bundle) => bundle.events
      .filter((evt) => evt.checkpoint === 'enter')
      .map((evt) => evt.source)
      .filter((source) => source));

    const possiblePrefixes = [];
    const s = new Date(this.start);
    const e = new Date(this.end);

    // iterate each day between start and end
    for (let d = s; d <= e; d.setDate(d.getDate() + 1)) {
      const day = new Date(d);
      const pattern = day.toISOString().split('T')[0].replace(/-/g, '/');
      possiblePrefixes.push(pattern);
    }
    dataChunks.addFacet('inrange', (bundle) => {
      if (!bundle.url) return false;
      for (let i = 0; i < possiblePrefixes.length; i += 1) {
        if (bundle.url.includes(possiblePrefixes[i])) {
          return true;
        }
      }
      return false;
    });

    dataChunks.addFacet('media', (bundle) => Array.from(
      bundle.events
        .filter((evt) => evt.checkpoint === 'viewmedia')
        .filter(({ target }) => target) // filter out empty targets
        .reduce((acc, { target }) => {
          if (typeof target === 'string' && !target.includes('profile')) {
            try {
              const u = new URL(target);
              u.hash = '';
              acc.add(u.toString());
            } catch (error) {
              // eslint-disable-next-line no-console
              console.error(error, target);
            }
          }
          return acc;
        }, new Set()),
    ));

    dataChunks.load(this.data);
    this.dataChunks = dataChunks;
  }

  getDataChunks() {
    return this.dataChunks;
  }

  getURLs() {
    return this.dataChunks.facets.url;
  }

  getMedia() {
    return this.dataChunks.facets.media;
  }

  getReferers() {
    return this.dataChunks.facets.referer;
  }

  set filter(filter) {
    this.dataChunks.filter = filter;
  }
}

const SERIES = {
  pageViews: {
    label: 'Page Views',
    rateFn: (aggregate) => aggregate.pageViews.sum,
    labelFn: (value) => utils.toHumanReadable(value),
  },
  bounce: {
    label: 'Bounce Rate (Visitor left page without any interaction)',
    rateFn: (aggregate) => (aggregate.visits.sum > 0 ? Math.round(
      (100 * aggregate.bounces.sum) / aggregate.visits.sum,
    ) : 0),
    labelFn: (value) => `${value || 0}%`,
  },
  engagement: {
    label: 'Active Page Engagement (Visitor clicked or viewed at least three media elements/content blocks)',
    rateFn: (aggregate) => (aggregate.pageViews.sum > 0 ? Math.round(
      (100 * aggregate.engagement.sum) / aggregate.pageViews.sum,
    ) : 0),
    labelFn: (value) => `${value || 0}%`,
  },
  conversions: {
    label: 'Conversion Rate (Visitor clicked the call-to-action button)',
    rateFn: (aggregate) => (aggregate.visits.sum > 0 ? Math.min(Math.round(
      (100 * aggregate.conversions.sum) / aggregate.visits.sum,
    ), 100) : 0),
    labelFn: (value) => `${value}%`,
  },
  paid: {
    label: 'Paid traffic',
    rateFn: (aggregate) => (aggregate.visits.sum > 0 ? 100 - Math.round(
      (100 * aggregate.organic.sum) / aggregate.visits.sum,
    ) : 0),
    labelFn: (value) => `${value || 0}%`,
  },
  timeOnPage: {
    label: 'Time on page',
    rateFn: (aggregate) => aggregate.timeOnPage.percentile(50),
    labelFn: (value) => `${Number.isFinite(value) ? value : 0}s`,
  },
};

const { toHumanReadable } = utils;

export {
  URLReports,
  SERIES,
  toHumanReadable,
};
