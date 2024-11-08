/*
 * This module should handle all of the loading of bundles. Ideally it would work
 * offline, so it should be a service worker. We will migrate code from the main
 * file to here.
 */
// eslint-disable-next-line import/no-unresolved
import { utils } from '@adobe/rum-distiller';
import ffetch from './ffetch.js';

const { addCalculatedProps } = utils;

export default class DataLoader {
  constructor() {
    this.cache = new Map();
    this.API_ENDPOINT = 'https://rum.fastly-aem.page';
    this.DOMAIN = 'www.thinktanked.org';
    this.DOMAIN_KEY = '';
    this.ORG = undefined;
    this.SCOPE = undefined; // unused
    this.granularity = 'month';
    this.enrichURL = undefined;
    this.classifications = new Set();
  }

  flush() {
    this.cache.clear();
  }

  set domainKey(key) {
    this.DOMAIN_KEY = key;
    this.flush();
  }

  set domain(domain) {
    if (domain.endsWith(':all') && domain !== 'aem.live:all') {
      [this.ORG, this.SCOPE] = domain.split(':');
    } else {
      this.DOMAIN = domain;
    }
    this.flush();
  }

  set apiEndpoint(endpoint) {
    this.API_ENDPOINT = endpoint;
    this.flush();
  }

  set enrich(url) {
    if (!this.DOMAIN_KEY) return;
    const serviceURL = new URL('https://rum-proxy-prod.adobeaem.workers.dev/tools/rum/_cors');
    serviceURL.searchParams.set('url', url);
    serviceURL.searchParams.set('domainkey', this.DOMAIN_KEY);
    this.enrichURL = serviceURL.toString();
  }

  /**
   *
   * @param {object[]} data a list of objects
   * @param {string[]} keys a list of keys
   * @returns an object where each key is a value from the data list where any of the
   * parameters in keys are present
   */
  organizeClassifications(data, keys) {
    return data.reduce((acc, item) => {
      const key = Object.keys(item).find((k) => keys.includes(k));
      if (!key) {
        return acc;
      }
      acc[item[key]] = item;
      Object.keys(item).forEach((k) => this.classifications.add(k));
      return acc;
    }, {});
  }

  async fetchEnrichedData() {
    if (!this.enrichURL || this.enrichedData) {
      return this.enrichedData;
    }
    const allentries = await ffetch(this.enrichURL)
      .follow('path', 'document')
      .map((entry) => {
        const { document: doc } = entry;
        if (doc) {
          doc.querySelectorAll('head meta').forEach((meta) => {
            const name = meta.getAttribute('name') || meta.getAttribute('property');
            const content = meta.getAttribute('content');
            if (name && content) {
              entry[name] = content.toLowerCase();
            }
          });
        }
        delete entry.document;
        return entry;
      })
      .all();
    this.enrichedData = this.organizeClassifications(allentries, ['path', 'url']);
    console.log('enriched data', this.enrichedData);
    return this.enrichedData;
  }

  apiURL(datePath, hour) {
    const u = new URL(this.API_ENDPOINT);
    u.pathname = [
      ...(this.ORG
        ? ['orgs', this.ORG, 'bundles']
        : ['bundles', this.DOMAIN]
      ),
      datePath,
      hour,
    ]
      .filter((p) => !!p) // remove empty strings
      .join('/');
    u.searchParams.set('domainkey', this.DOMAIN_KEY);
    return u.toString();
  }

  // eslint-disable-next-line class-methods-use-this
  filterByDateRange(data, start, end) {
    if (start || end) {
      const filtered = data.filter((bundle) => {
        const time = new Date(bundle.timeSlot);
        return ((start ? time >= start : true) && (end ? time <= end : true));
      });
      return filtered;
    }
    return data;
  }

  async fetchUTCMonth(utcISOString, start, end) {
    this.granularity = 'month';
    const [date] = utcISOString.split('T');
    const dateSplits = date.split('-');
    dateSplits.pop();
    const monthPath = dateSplits.join('/');
    const apiRequestURL = this.apiURL(monthPath);
    const resp = await fetch(apiRequestURL);
    const json = await resp.json();
    const { rumBundles } = json;
    rumBundles.forEach((bundle) => addCalculatedProps(bundle));
    // TODO: add enrichment, classification
    return { date, rumBundles: this.filterByDateRange(rumBundles, start, end) };
  }

  async fetchUTCDay(utcISOString, start, end) {
    this.granularity = 'day';
    const [date] = utcISOString.split('T');
    const datePath = date.split('-').join('/');
    const apiRequestURL = this.apiURL(datePath);
    const resp = await fetch(apiRequestURL);
    const json = await resp.json();
    const { rumBundles } = json;
    rumBundles.forEach((bundle) => addCalculatedProps(bundle));
    // TODO: add enrichment, classification
    return { date, rumBundles: this.filterByDateRange(rumBundles, start, end) };
  }

  async fetchUTCHour(utcISOString, start, end) {
    this.granularity = 'hour';
    const [date, time] = utcISOString.split('T');
    const datePath = date.split('-').join('/');
    const hour = time.split(':')[0];
    const apiRequestURL = this.apiURL(datePath, hour);
    const resp = await fetch(apiRequestURL);
    const json = await resp.json();
    const { rumBundles } = json;
    rumBundles.forEach((bundle) => addCalculatedProps(bundle));
    // TODO: add enrichment, classification
    return { date, hour, rumBundles: this.filterByDateRange(rumBundles, start, end) };
  }

  async fetchLastWeek(endDate) {
    const date = endDate ? new Date(endDate) : new Date();
    const hoursInWeek = 7 * 24;
    const promises = [];
    for (let i = 0; i < hoursInWeek; i += 1) {
      promises.push(this.fetchUTCHour(date.toISOString()));
      date.setTime(date.getTime() - (3600 * 1000));
    }
    const chunks = Promise.all(promises);
    return chunks;
  }

  async fetchPrevious31Days(endDate) {
    const date = endDate ? new Date(endDate) : new Date();
    const days = 31;
    const promises = [];
    for (let i = 0; i < days; i += 1) {
      promises.push(this.fetchUTCDay(date.toISOString()));
      date.setDate(date.getDate() - 1);
    }
    const chunks = Promise.all(promises);
    return chunks;
  }

  async fetchPrevious12Months(endDate) {
    const date = endDate ? new Date(endDate) : new Date();
    const months = 13; // 13 to include 2 partial months (first and last)
    const promises = [];
    for (let i = 0; i < months; i += 1) {
      promises.push(this.fetchUTCMonth(date.toISOString()));
      date.setMonth(date.getMonth() - 1);
    }
    const chunks = Promise.all(promises);
    return chunks;
  }

  async fetchDateRange(startDate, endDate = new Date().toISOString()) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const hoursInRange = Math.floor((end - start) / (1000 * 60 * 60));
    const daysInRange = Math.floor((end - start) / (1000 * 60 * 60 * 24));
    const monthsInRange = Math.floor((end - start) / (1000 * 60 * 60 * 24 * 30));
    let promises = [];
    if (daysInRange < 0) {
      throw new Error('Start date must be before end date');
    } else if (hoursInRange < 200) {
      // fetch each hour
      promises = Array.from({ length: hoursInRange + 1 }, (_, i) => {
        const date = new Date(start);
        date.setHours(date.getHours() + i + 1);
        return date.toISOString();
      }).map((hour) => this.fetchUTCHour(hour));
    } else if (daysInRange < 200) {
      // fetch each day
      promises = Array.from({ length: daysInRange + 1 }, (_, i) => {
        const date = new Date(start);
        date.setDate(date.getDate() + i + 1);
        return date.toISOString();
      }).map((day) => this.fetchUTCDay(day));
    } else {
      // fetch each month
      promises = Array.from({ length: monthsInRange + 1 }, (_, i) => {
        const date = new Date(start);
        date.setMonth(date.getMonth() + i + 1);
        return date.toISOString();
      }).map((month) => this.fetchUTCMonth(month));
    }
    return Promise.all(promises);
  }

  async fetchPeriod(startDate, endDate) {
    const start = new Date(startDate);
    const originalStart = new Date(start);
    const end = endDate ? new Date(endDate) : new Date();

    const diff = end.getTime() - start.getTime();
    if (diff < 0) {
      throw new Error('Start date must be before end date');
    }

    const promises = [];

    if (diff <= (1000 * 60 * 60 * 24 * 7)) {
      // less than a week
      const days = Math.round((diff / (1000 * 60 * 60 * 24))) + 1;

      for (let i = 0; i < days; i += 1) {
        promises.push(this.fetchUTCDay(start.toISOString(), originalStart, end));
        start.setDate(start.getDate() + 1);
      }
    } else if (diff <= (1000 * 60 * 60 * 24 * 31)) {
      // less than a month
      const days = Math.round((diff / (1000 * 60 * 60 * 24))) + 1;

      for (let i = 0; i < days; i += 1) {
        promises.push(this.fetchUTCDay(start.toISOString(), originalStart, end));
        start.setDate(start.getDate() + 1);
      }
    } else {
      const months = Math.round(diff / (1000 * 60 * 60 * 24 * 31)) + 1;

      for (let i = 0; i < months; i += 1) {
        promises.push(this.fetchUTCMonth(start.toISOString(), originalStart, end));
        start.setMonth(start.getMonth() + 1);
      }
    }

    return Promise.all(promises);
  }
}
