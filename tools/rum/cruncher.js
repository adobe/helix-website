/*
 * This module is another service worker, which will handle the number crunching, i.e.
 * filtering, aggregating, and summarizing the data.
 */
/* fetch and process raw bundles */

export function addCalculatedProps(bundle) {
  bundle.events.forEach((e) => {
    if (e.checkpoint === 'enter') {
      bundle.visit = true;
      if (e.source === '') e.source = '(direct)';
    }
    if (e.checkpoint === 'click') {
      bundle.conversion = true;
    }
    if (e.checkpoint === 'cwv-inp') {
      bundle.cwvINP = e.value;
    }
    if (e.checkpoint === 'cwv-lcp') {
      bundle.cwvLCP = e.value;
    }
    if (e.checkpoint === 'cwv-cls') {
      bundle.cwvCLS = e.value;
    }
    if (e.checkpoint === 'cwv-ttfb') {
      bundle.cwvTTFB = e.value;
    }
  });
}
