/*
 * Implements the CWV timeline chart (currently the only chart in the RUM explorer)
 */
import { toISOStringWithTimezone, scoreBundle, scoreCWV } from './utils.js';

const INTERPOLATION_THRESHOLD = 10;
function cwvInterpolationFn(targetMetric, interpolateTo100) {
  return (cwvs) => {
    const valueCount = cwvs.goodCWV.count + cwvs.niCWV.count + cwvs.poorCWV.count;
    const valuedWeights = cwvs.goodCWV.weight + cwvs.niCWV.weight + cwvs.poorCWV.weight;
    if (interpolateTo100) {
      return (cwvs[targetMetric].weight / valuedWeights);
    }
    if (valueCount < INTERPOLATION_THRESHOLD) {
      // not enough data to interpolate
      return 0;
    }
    // total weight
    const totalWeight = cwvs.goodCWV.weight
      + cwvs.niCWV.weight
      + cwvs.poorCWV.weight
      + cwvs.noCWV.weight;
    // share of targetMetric compared to all CWV
    const share = cwvs[targetMetric].weight / (valuedWeights);
    // interpolate the share to the total weight
    return Math.round(share * totalWeight);
  };
}
// todo
export default class CWVTimeLineChart {
  constructor(config) {
    this.chartConfig = config;
  }

  set config(config) {
    this.chartConfig = config;
  }

  /**
   * Returns a function that can group the data bundles based on the
   * configuration of the chart. As this is a timeline chart,
   * the grouping is based on the time slot of the bundle, truncated
   * to the granularity of the chart.
   * @returns {function} A function that can group the data bundles
   */
  get groupBy() {
    return (bundle) => {
      const slotTime = new Date(bundle.timeSlot);
      slotTime.setMinutes(0);
      slotTime.setSeconds(0);
      if (this.chartConfig.unit === 'day' || this.chartConfig.unit === 'week' || this.chartConfig.unit === 'month') slotTime.setHours(0);
      if (this.chartConfig.unit === 'week') slotTime.setDate(slotTime.getDate() - slotTime.getDay());
      if (this.chartConfig.unit === 'month') slotTime.setDate(1);
      return toISOStringWithTimezone(slotTime);
    };
  }

  useData(dataChunks) {
    this.dataChunks = dataChunks;
  }

  /**
   * Defines the series for the chart based on the data chunks
   * @param {DataChunks} dataChunks
   */
  defineSeries() {
    const { dataChunks } = this;
    // aggregate series
    if (this.chartConfig.focus === 'lcp') {
      dataChunks.addSeries('goodCWV', (bundle) => (scoreCWV(bundle.cwvLCP, 'lcp') === 'good' ? bundle.weight : undefined));
      dataChunks.addSeries('poorCWV', (bundle) => (scoreCWV(bundle.cwvLCP, 'lcp') === 'poor' ? bundle.weight : undefined));
      dataChunks.addSeries('niCWV', (bundle) => (scoreCWV(bundle.cwvLCP, 'lcp') === 'ni' ? bundle.weight : undefined));
      dataChunks.addSeries('noCWV', () => (0));
    } else if (this.chartConfig.focus === 'cls') {
      dataChunks.addSeries('goodCWV', (bundle) => (scoreCWV(bundle.cwvCLS, 'cls') === 'good' ? bundle.weight : undefined));
      dataChunks.addSeries('poorCWV', (bundle) => (scoreCWV(bundle.cwvCLS, 'cls') === 'poor' ? bundle.weight : undefined));
      dataChunks.addSeries('niCWV', (bundle) => (scoreCWV(bundle.cwvCLS, 'cls') === 'ni' ? bundle.weight : undefined));
      dataChunks.addSeries('noCWV', () => (0));
    } else if (this.chartConfig.focus === 'inp') {
      dataChunks.addSeries('goodCWV', (bundle) => (scoreCWV(bundle.cwvINP, 'inp') === 'good' ? bundle.weight : undefined));
      dataChunks.addSeries('poorCWV', (bundle) => (scoreCWV(bundle.cwvINP, 'inp') === 'poor' ? bundle.weight : undefined));
      dataChunks.addSeries('niCWV', (bundle) => (scoreCWV(bundle.cwvINP, 'inp') === 'ni' ? bundle.weight : undefined));
      dataChunks.addSeries('noCWV', () => (0));
    } else {
      dataChunks.addSeries('goodCWV', (bundle) => (scoreBundle(bundle) === 'good' ? bundle.weight : undefined));
      dataChunks.addSeries('poorCWV', (bundle) => (scoreBundle(bundle) === 'poor' ? bundle.weight : undefined));
      dataChunks.addSeries('niCWV', (bundle) => (scoreBundle(bundle) === 'ni' ? bundle.weight : undefined));
      dataChunks.addSeries('noCWV', (bundle) => (scoreBundle(bundle) === null ? bundle.weight : undefined));
    }

    // interpolated series
    dataChunks.addInterpolation(
      'iGoodCWV', // name of the series
      ['goodCWV', 'niCWV', 'poorCWV', 'noCWV'], // calculate from these series
      cwvInterpolationFn('goodCWV', this.chartConfig.focus), // interpolation function
    );

    dataChunks.addInterpolation(
      'iNiCWV',
      ['goodCWV', 'niCWV', 'poorCWV', 'noCWV'],
      cwvInterpolationFn('niCWV', this.chartConfig.focus),
    );

    dataChunks.addInterpolation(
      'iPoorCWV',
      ['goodCWV', 'niCWV', 'poorCWV', 'noCWV'],
      cwvInterpolationFn('poorCWV', this.chartConfig.focus),
    );

    dataChunks.addInterpolation(
      'iNoCWV',
      ['goodCWV', 'niCWV', 'poorCWV', 'noCWV'],
      ({
        goodCWV, niCWV, poorCWV, noCWV,
      }) => {
        const valueCount = goodCWV.count + niCWV.count + poorCWV.count;
        if (this.chartConfig.focus) {
          // we have a focus, so this series can stay at 0
          // as all other series are interpolated to 100%
          return 0;
        }
        if (valueCount < INTERPOLATION_THRESHOLD) {
          // not enough data to interpolate the other values, so
          // we report as if there are no CWV at all
          const totalWeight = goodCWV.weight + niCWV.weight + poorCWV.weight + noCWV.weight;
          return totalWeight;
        }
        return 0;
      },
    );
  }
}
