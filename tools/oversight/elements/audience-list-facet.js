import ListFacet from './list-facet.js';

/**
 * A custom HTML element to display a list of facets.
 * <list-facet facet="userAgent" drilldown="share.html" mode="all">
 *   <legend>User Agent</legend>
 *   <dl>
 *    <dt>desktop</dt>
 *    <dd>Chrome 90.0.4430.93 (Windows 10)</dd>
 *   </dl>
 * </list-facet>
 */
export default class AudienceListFacet extends ListFacet {
  constructor() {
    super();
    this.placeholders = undefined;
  }

  // eslint-disable-next-line class-methods-use-this
  computeCount(entry) {
    const pv = entry.metrics.pageViews.sum;
    const audiencesCount = [];
    let samples = 0;
    entry.entries.forEach(({ weight, events }) => {
      events
        .filter((event) => event.checkpoint === 'audience' && event.source === entry.value)
        .forEach((event) => {
          audiencesCount.push(event.target.split(':').length);
          samples += weight;
        });
    });
    const averageAudiencesCount = audiencesCount.reduce((sum, v) => sum + v, 0)
      / audiencesCount.length;
    const proportionalDistribution = pv / averageAudiencesCount;
    const audienceRatio = samples / proportionalDistribution;
    // eslint-disable-next-line no-console
    console.debug({
      audience: entry.value,
      page_views: pv,
      proportional_distribution: proportionalDistribution,
      samples,
      audienceRatio,
      estimated_views: audienceRatio * pv,
    });
    return audienceRatio * pv;
  }
}
