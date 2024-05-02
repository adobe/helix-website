/*
 * Implements the CWV timeline chart (currently the only chart in the RUM explorer)
 */
import { toISOStringWithTimezone, scoreCWV } from './utils.js';

// todo
export default class CWVTimeLineChart {
  constructor(config) {
    this.chartConfig = config;
  }

  set config(config) {
    this.chartConfig = config;
  }

  createChartData(bundles, endDate) {
    const labels = [];
    const datasets = [];

    const stats = {};
    const cwvStructure = () => ({
      bundles: [],
      weight: 0,
      average: 0,
      good: { weight: 0, average: 0 },
      ni: { weight: 0, average: 0 },
      poor: { weight: 0, average: 0 },
    });

    bundles.forEach((bundle) => {
      const slotTime = new Date(bundle.timeSlot);
      slotTime.setMinutes(0);
      slotTime.setSeconds(0);
      if (this.chartConfig.unit === 'day' || this.chartConfig.unit === 'week' || this.chartConfig.unit === 'month') slotTime.setHours(0);
      if (this.chartConfig.unit === 'week') slotTime.setDate(slotTime.getDate() - slotTime.getDay());
      if (this.chartConfig.unit === 'month') slotTime.setDate(1);

      const localTimeSlot = toISOStringWithTimezone(slotTime);
      if (!stats[localTimeSlot]) {
        const s = {
          total: 0,
          conversions: 0,
          visits: 0,
          lcp: cwvStructure(),
          inp: cwvStructure(),
          cls: cwvStructure(),
          ttfb: cwvStructure(),
          bundles: [],
        };

        stats[localTimeSlot] = s;
      }

      const updateAverage = (b, struct, key) => {
        const newWeight = b.weight + struct.weight;
        struct.average = (
          (struct.average * struct.weight)
          + (b[key] * b.weight)
        ) / newWeight;
        struct.weight = newWeight;
      };

      const stat = stats[localTimeSlot];
      stat.bundles.push(bundle);
      stat.total += bundle.weight;
      if (bundle.conversion) stat.conversions += bundle.weight;
      if (bundle.visit) stat.visits += bundle.weight;

      if (bundle.cwvLCP) {
        const score = scoreCWV(bundle.cwvLCP, 'lcp');
        const bucket = stat.lcp[score];
        updateAverage(bundle, bucket, 'cwvLCP');
        updateAverage(bundle, stat.lcp, 'cwvLCP');
        stat.lcp.bundles.push(bundle);
      }
      if (bundle.cwvCLS) {
        const score = scoreCWV(bundle.cwvCLS, 'cls');
        const bucket = stat.cls[score];
        updateAverage(bundle, bucket, 'cwvCLS');
        updateAverage(bundle, stat.cls, 'cwvCLS');
        stat.cls.bundles.push(bundle);
      }
      if (bundle.cwvINP) {
        const score = scoreCWV(bundle.cwvINP, 'inp');
        const bucket = stat.inp[score];
        updateAverage(bundle, bucket, 'cwvINP');
        updateAverage(bundle, stat.inp, 'cwvINP');
        stat.inp.bundles.push(bundle);
      }

      if (bundle.cwvTTFB) {
        const score = scoreCWV(bundle.cwvTTFB, 'ttfb');
        const bucket = stat.ttfb[score];
        updateAverage(bundle, bucket, 'cwvTTFB');
        updateAverage(bundle, stat.ttfb, 'cwvTTFB');
        stat.ttfb.bundles.push(bundle);
      }
    });

    const dataTotal = [];
    const dataGood = [];
    const dataNI = [];
    const dataPoor = [];

    const date = endDate ? new Date(endDate) : new Date();
    date.setMinutes(0);
    date.setSeconds(0);
    if (this.chartConfig.unit === 'day' || this.chartConfig.unit === 'month' || this.chartConfig.unit === 'week') date.setHours(0);
    if (this.chartConfig.unit === 'week') date.setDate(date.getDate() - date.getDay());
    if (this.chartConfig.unit === 'month') date.setDate(1);

    for (let i = 0; i < this.chartConfig.units; i += 1) {
      const localTimeSlot = toISOStringWithTimezone(date);
      const stat = stats[localTimeSlot];
      // eslint-disable-next-line no-undef
      labels.unshift(localTimeSlot);
      const sumBucket = (bucket) => {
        bucket.weight = bucket.good.weight + bucket.ni.weight + bucket.poor.weight;
        if (bucket.weight) {
          bucket.average = ((bucket.good.weight * bucket.good.average)
            + (bucket.ni.weight * bucket.ni.average)
            + (bucket.poor.weight * bucket.poor.average)) / bucket.weight;
        } else {
          bucket.average = 0;
        }
      };

      if (stat) {
        sumBucket(stat.lcp);
        sumBucket(stat.cls);
        sumBucket(stat.inp);
        sumBucket(stat.ttfb);

        const cwvNumBundles = stat.lcp.bundles.length
          + stat.cls.bundles.length + stat.inp.bundles.length;
        const cwvTotal = stat.lcp.weight + stat.cls.weight + stat.inp.weight;
        const cwvFactor = stat.total / cwvTotal;

        const cwvGood = stat.lcp.good.weight + stat.cls.good.weight + stat.inp.good.weight;
        const cwvNI = stat.lcp.ni.weight + stat.cls.ni.weight + stat.inp.ni.weight;
        const cwvPoor = stat.lcp.poor.weight + stat.cls.poor.weight + stat.inp.poor.weight;

        const showCWVSplit = cwvNumBundles && (cwvNumBundles > 10);
        if (!this.chartConfig.focus) {
          dataTotal.unshift(showCWVSplit ? 0 : stat.total);
          dataGood.unshift(showCWVSplit ? Math.round(cwvGood * cwvFactor) : 0);
          dataNI.unshift(showCWVSplit ? Math.round(cwvNI * cwvFactor) : 0);
          dataPoor.unshift(showCWVSplit ? Math.round(cwvPoor * cwvFactor) : 0);
        } else {
          if (this.chartConfig.focus === 'lcp' || this.chartConfig.focus === 'cls' || this.chartConfig.focus === 'inp' || this.chartConfig.focus === 'ttfb') {
            const m = this.chartConfig.focus;
            dataTotal.unshift(showCWVSplit ? 0 : 1);
            dataGood.unshift(showCWVSplit ? stat[m].good.weight / stat[m].weight : 0);
            dataNI.unshift(showCWVSplit ? stat[m].ni.weight / stat[m].weight : 0);
            dataPoor.unshift(showCWVSplit ? stat[m].poor.weight / stat[m].weight : 0);
          }
          if (this.chartConfig.focus === 'conversions') {
            // cls here
            dataTotal.unshift(0);
            dataGood.unshift(stat.conversions / stat.total);
            dataNI.unshift(1 - (stat.conversions / stat.total));
            dataPoor.unshift(0);
          }
          if (this.chartConfig.focus === 'visits') {
            // cls here
            dataTotal.unshift(stat.visits / stat.total);
            dataGood.unshift(1 - (stat.visits / stat.total));
            dataNI.unshift(0);
            dataPoor.unshift(0);
          }
        }
      } else {
        dataTotal.unshift(0);
        dataGood.unshift(0);
        dataNI.unshift(0);
        dataPoor.unshift(0);
      }

      if (this.chartConfig.unit === 'hour') date.setTime(date.getTime() - (3600 * 1000));
      if (this.chartConfig.unit === 'day') date.setDate(date.getDate() - 1);
      if (this.chartConfig.unit === 'week') date.setDate(date.getDate() - 7);
      if (this.chartConfig.unit === 'month') date.setMonth(date.getMonth() - 1);
    }

    datasets.push({ data: dataTotal });
    datasets.push({ data: dataGood });
    datasets.push({ data: dataNI });
    datasets.push({ data: dataPoor });

    return { labels, datasets, stats };
  }
}
