import { zTestTwoProportions } from '../cruncher.js';
import { computeConversionRate } from '../utils.js';
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
export default class VariantListFacet extends ListFacet {
  constructor() {
    super();
    this.placeholders = undefined;
  }

  update() {
    const facetName = this.getAttribute('facet');
    const facetEntries = this.dataChunks.facets[facetName];
    const enabled = !this.closest('facet-sidebar[aria-disabled="true"]');

    const sort = this.getAttribute('sort') || 'count';

    const optionKeys = facetEntries.map((f) => f.value)
      .sort((a, b) => {
        if (sort === 'count') return 0; // keep the order
        return a.localeCompare(b);
      });

    const url = new URL(window.location);
    const drilldownAtt = this.getAttribute('drilldown');
    const mode = url.searchParams.get('mode') || this.getAttribute('mode');
    const numOptions = mode === 'all' ? 20 : 10;

    if (this.querySelector('dl')) {
      this.placeholders = Array.from(this.querySelectorAll('dl > dt + dd'))
        .reduce((acc, dd) => {
          acc[dd.previousElementSibling.textContent] = dd.textContent;
          return acc;
        }, {});
      this.querySelector('dl').remove();
    }

    if (optionKeys.length) {
      const fieldSet = this.querySelector('fieldset') || document.createElement('fieldset');
      fieldSet.classList.add(`facet-${facetName}`);
      const legendText = this.querySelector('legend')?.textContent || facetName;

      fieldSet.textContent = '';

      const legend = this.querySelector('legend') || document.createElement('legend');
      legend.textContent = legendText;

      const clipboard = document.createElement('span');
      clipboard.className = 'clipboard';

      const clipboardPaste = document.createElement('span');
      clipboardPaste.className = 'clipboard-paste';
      clipboardPaste.title = 'Paste from clipboard';

      clipboardPaste.addEventListener('click', async () => {
        // read the clipboard
        const paste = navigator.clipboard.readText();
        // split based on any newline character or space
        const values = (await paste).split(/[\n\s]+/);
        const pasted = [];
        values.forEach((value) => {
          const input = fieldSet.querySelector(`input[value="${value}"]`);
          if (input) {
            pasted.push(input);
            input.checked = true;
            input.parentElement.ariaSelected = true;
          }
        });
        if (pasted.length) {
          this.parentElement.parentElement.dispatchEvent(new Event('facetchange'), this);
        }
      });

      legend.append(clipboard, clipboardPaste);
      if (drilldownAtt && url.searchParams.get('drilldown') !== facetName) {
        const drilldown = document.createElement('a');
        drilldown.className = 'drilldown';
        drilldown.href = drilldownAtt;
        drilldown.title = 'Drill down to more details';
        drilldown.textContent = '';
        drilldown.addEventListener('click', () => {
          const drilldownurl = new URL(drilldown.href, window.location);
          drilldownurl.search = new URL(window.location).search;
          drilldownurl.searchParams.delete(facetName);
          drilldownurl.searchParams.set('drilldown', facetName);
          drilldown.href = drilldownurl.href;
        });
        legend.append(drilldown);
      } else if (url.searchParams.get('drilldown') === facetName) {
        const drillup = document.createElement('a');
        drillup.className = 'drillup';
        drillup.href = 'explorer.html';
        drillup.title = 'Return to previous level';
        drillup.textContent = '';
        drillup.addEventListener('click', () => {
          const drillupurl = new URL(drillup.href, window.location);
          drillupurl.search = new URL(window.location).search;
          drillupurl.searchParams.delete(facetName);
          drillupurl.searchParams.delete('drilldown', facetName);
          drillup.href = drillupurl.href;
        });
        legend.append(drillup);
      }

      fieldSet.append(legend);
      const filterKeys = facetName === 'checkpoint' && mode !== 'all';
      const filteredKeys = filterKeys && this.placeholders
        ? optionKeys.filter((a) => !!(this.placeholders[a]))
        : optionKeys;
      facetEntries
        .filter((entry) => !filterKeys || filteredKeys.includes(entry.value))
        .forEach((entry) => {
          const div = document.createElement('div');
          const input = document.createElement('input');
          input.type = 'checkbox';
          input.value = entry.value;
          input.checked = url.searchParams.getAll(facetName).includes(entry.value);
          if (input.checked) {
            // addFilterTag(facetName, entry.value);
            div.ariaSelected = true;
          }
          input.id = `${facetName}=${entry.value}`;
          if (enabled) {
            div.addEventListener('click', (evt) => {
              if (evt.target !== input) input.checked = !input.checked;
              evt.stopPropagation();
              this.parentElement.parentElement.dispatchEvent(new Event('facetchange'), this);
            });
          }

          const label = document.createElement('label');
          label.setAttribute('for', `${facetName}-${entry.value}`);
          const countspan = document.createElement('number-format');
          countspan.className = 'count';
          countspan.textContent = entry.metrics.pageViews.sum;
          countspan.setAttribute('sample-size', entry.metrics.pageViews.count);
          countspan.setAttribute('total', this.dataChunks.totals.pageViews.sum);
          countspan.setAttribute('fuzzy', 'false');
          const valuespan = this.createValueSpan(entry);

          const conversionspan = document.createElement('number-format');
          conversionspan.className = 'extra';

          const conversions = entry.metrics.conversions.sum;
          const visits = entry.metrics.visits.sum;
          const conversionRate = computeConversionRate(conversions, visits);
          conversionspan.textContent = conversionRate;
          conversionspan.setAttribute('precision', 2);

          label.append(valuespan, countspan, conversionspan);

          const ul = document.createElement('ul');
          ul.classList.add('cwv');

          // display variant information in chiclets
          // add conversion ratio
          const convLI = this.createCWVChiclet(entry, 'conversion percentage');
          ul.append(convLI);

          // add stat sig
          const sigLI = this.createCWVChiclet(entry, 'stat sig');
          ul.append(sigLI);

          div.append(input, label, ul);
          fieldSet.append(div);
        });

      if (filteredKeys.length > 10) {
        // add "more" link
        const div = document.createElement('div');
        div.className = 'load-more';
        const more = document.createElement('label');
        more.textContent = 'more...';
        more.addEventListener('click', (evt) => {
          evt.preventDefault();
          if (this.classList.contains('more')) {
            const mores = Array.from(this.classList)
              .filter((c) => c.startsWith('more'));
            // add a more-more-more with the length of
            // the existing mores + 1
            const moreClass = Array.from({ length: mores.length + 1 }, () => 'more').join('-');
            this.classList.add(moreClass);
          }
          this.classList.add('more');
        });

        div.append(more);

        const all = document.createElement('label');
        all.textContent = `all (${filteredKeys.length})`;
        all.addEventListener('click', (evt) => {
          evt.preventDefault();
          this.classList.add('more-all');
        });
        div.append(all);
        const container = document.createElement('div');
        container.classList.add('more-container');
        container.append(div);
        fieldSet.append(container);
      }

      clipboard.addEventListener('click', () => {
        const tsv = this.computeTSV(numOptions);
        navigator.clipboard.writeText(tsv.join('\r\n'));
        const toast = document.getElementById('copied-toast');
        toast.ariaHidden = false;
        setTimeout(() => { toast.ariaHidden = true; }, 3000);
      });
      this.append(fieldSet);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  createCWVChiclet(entry, metricName) {
    const samples = entry.weight;
    const conversions = entry.metricsIn.conversions.sum;
    let controlSamples = samples;
    let controlConversions = conversions;
    if (!entry.value.includes('control')) {
      const parentSeries = entry.parent.seriesIn;
      const controlEntryKey = Object.keys(parentSeries).filter(
        (el) => (el.endsWith('control')),
      );
      controlSamples = parentSeries[controlEntryKey].conversions.weight;
      controlConversions = parentSeries[controlEntryKey].conversions.sum;
    }
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
      } else if (metricName === 'stat sig' && !entry.value.includes('control')) {
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
}
