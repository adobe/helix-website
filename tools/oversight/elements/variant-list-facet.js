import { zTestTwoProportions } from '../cruncher.js';
import ListFacet from './list-facet.js';

/**
 * A custom HTML element based on "list-facet" used to display a list of variant facets
 * along with conversion percentage and statistical signficance metrics.
 * <variant-list-facet facet="userAgent" drilldown="share.html" mode="all">
 *   <legend>Variant</legend>
 * </variant-list-facet>
 */
export default class VariantListFacet extends ListFacet {
  constructor() {
    super();
    this.placeholders = undefined;
  }

  // eslint-disable-next-line class-methods-use-this
  createCWVChiclet(entry, metricName) {
    const samples = entry.weight;
    const conversions = entry.metricsIn.conversions.sum;
    const parentSeries = entry.parent.seriesIn;
    let controlEntryKey = Object.keys(parentSeries).filter(
      (el) => (el.endsWith('control')),
    );
    if (controlEntryKey.length === 0) {
      controlEntryKey = Object.keys(parentSeries).filter(
        (el) => (el.endsWith('challenger-1')),
      );
    }
    const controlSamples = parentSeries[controlEntryKey]?.conversions.weight ?? samples;
    const controlConversions = parentSeries[controlEntryKey]?.conversions.sum ?? conversions;
    const li = document.createElement('li');
    const nf = document.createElement('number-format');
    nf.setAttribute('precision', 2);
    nf.setAttribute('fuzzy', 'false');
    const fillEl = async () => {
      li.title = metricName;
      if (metricName === 'conversion percentage') {
        const conversionPercentage = (conversions / samples) * 100;
        const controlConversionPercentage = (controlConversions / controlSamples) * 100;
        nf.textContent = conversionPercentage;
        let score = 'ni';
        if (conversionPercentage > controlConversionPercentage) {
          score = 'good';
        } else if (conversionPercentage < controlConversionPercentage
          || conversionPercentage === 0) {
          score = 'poor';
        }
        li.classList.add(`score-${score}`);
        li.title += ` - ${conversions} conversions out of ${samples} samples`;
      } else if (metricName === 'stat sig' && !controlEntryKey?.includes(entry.value)) {
        const statSig = 100 - zTestTwoProportions(
          controlSamples,
          controlConversions,
          samples,
          conversions,
        ) * 100;
        nf.textContent = statSig;
        let score = 'good';
        if (statSig < 80) {
          score = 'poor';
        } else if (statSig < 90) {
          score = 'ni';
        }
        li.classList.add(`score-${score}`);
      }
    };
    li.append(nf);
    // fill the element, but don't wait for it
    fillEl();
    return li;
  }

  addChiclets(ul, entry) {
    // display variant information in chiclets
    // add conversion ratio
    const convLI = this.createCWVChiclet(entry, 'conversion percentage');
    ul.append(convLI);

    // add stat sig
    const sigLI = this.createCWVChiclet(entry, 'stat sig');
    ul.append(sigLI);
  }
}
