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
  // eslint-disable-next-line class-methods-use-this
  createCWVChiclet(entry) {
    const samples = entry.weight;
    const conversions = entry.metrics.conversions.sum;
    let isControl = false;
    const parentSeries = entry.parent.seriesIn;
    let controlEntryKey = Object.keys(parentSeries).filter(
      (el) => (el.endsWith('control') && el.includes(entry.value.split(' ')[0])),
    );
    if (controlEntryKey.length !== 0 && entry.value.endsWith('control')) {
      isControl = true;
    } else if (controlEntryKey.length === 0) {
      controlEntryKey = Object.keys(parentSeries).filter(
        (el) => (el.endsWith('challenger-1') && el.includes(entry.value.split(' ')[0])),
      );
      if (entry.value.endsWith('challenger-1')) {
        isControl = true;
      }
    }
    const controlSamples = parentSeries[controlEntryKey]?.conversions.weight ?? samples;
    const controlConversions = parentSeries[controlEntryKey]?.conversions.sum ?? conversions;
    const controlConversionRate = controlConversions / controlSamples;
    const statSig = 100 - zTestTwoProportions(
      controlSamples,
      controlConversions,
      samples,
      conversions,
    ) * 100;
    return this.createBar(samples, conversions, controlConversionRate, statSig, isControl);
  }

  addVitalMetrics(entry) {
    // display variant information in chiclets
    // add conversion ratio
    const conversionStats = this.createCWVChiclet(entry);
    return conversionStats;
  }

  // eslint-disable-next-line class-methods-use-this
  reorderFacetEntries(facetEntries) {
    let facets = [];
    const variants = new Set();
    facetEntries.forEach((item) => {
      const variant = item.value.split(' ')[0];
      variants.add(variant);
    });
    Array.from(variants).forEach((variant) => {
      const experiment = [];
      facetEntries.forEach((facet) => {
        if (facet.value.includes(variant)) {
          experiment.push(facet);
        }
      });
      const controlEntries = [];
      const otherEntries = [];
      let control = 'challenger-1';
      if (experiment.some((str) => str.value.includes('control'))) {
        control = 'control';
      }
      experiment.forEach((item) => {
        if (item.value.endsWith(control)) {
          controlEntries.push(item);
        } else {
          otherEntries.push(item);
        }
      });
      otherEntries.sort((a, b) => a.value.localeCompare(b.value));
      facets = facets.concat(controlEntries.concat(otherEntries));
    });
    return facets;
  }

  // eslint-disable-next-line class-methods-use-this
  createBar(samples, conversions, controlConversionRate, statSig, isControl) {
    const barContainer = document.createElement('div');
    barContainer.classList.add('stat-bar-container');
    barContainer.title = `${conversions} conversions out of ${samples} samples`;

    // div for the bar fill
    const barFill = document.createElement('div');
    barFill.classList.add('stat-bar-fill');
    const percentage = conversions / samples;
    barFill.style.width = `${340 * percentage}px`;

    // span for the percentage text
    const barText = document.createElement('span');
    barText.classList.add('stat-bar-text');

    // wrap text in a number-format element
    const nf = document.createElement('number-format');
    nf.setAttribute('precision', 3);
    nf.setAttribute('fuzzy', 'false');
    nf.textContent = percentage * 100;
    barText.append(nf);

    // apply class stylings based on parameters
    if (isControl) {
      barContainer.classList.add('control');
      barFill.classList.add('control');
    } else {
      if (statSig > 95) {
        barContainer.classList.add('significant');
        barFill.classList.add('significant');
        barText.style.fontWeight = 'bold';
      }
      if (percentage > controlConversionRate) {
        barContainer.classList.add('winner');
        barFill.classList.add('winner');
      } else {
        barContainer.classList.add('loser');
        barFill.classList.add('loser');
      }
    }

    barContainer.appendChild(barFill);
    barContainer.appendChild(barText);

    return barContainer;
  }
}
