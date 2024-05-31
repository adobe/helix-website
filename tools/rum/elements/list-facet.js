import { scoreCWV, toHumanReadable, escapeHTML } from '../utils.js';
import { pValue } from '../cruncher.js';

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
export default class ListFacet extends HTMLElement {
  constructor() {
    super();
    this.placeholders = undefined;
  }

  createLabelHTML(labelText) {
    if (labelText.startsWith('https://') && labelText.includes('media_')) {
      return `<img src="${labelText}?width=750&format=webply&optimize=medium"">`;
    }

    if (labelText.startsWith('https://')) {
      return `<a href="${labelText}" target="_new">${labelText}</a>`;
    }

    if (this.placeholders && this.placeholders[labelText]) {
      return (`${this.placeholders[labelText]} [${labelText}]`);
    }
    return escapeHTML(labelText);
  }

  get dataChunks() {
    return this.parentElement.parentElement.dataChunks;
  }

  computeTSV(numOptions = 10) {
    const url = new URL(window.location);
    const facetName = this.getAttribute('facet');
    const mode = url.searchParams.get('mode') || this.getAttribute('mode');
    const showAtt = this.getAttribute('show');

    const facetEntries = this.dataChunks.facets[facetName];
    const tsv = [];
    const optionKeys = facetEntries.map((f) => f.value);
    if (optionKeys.length) {
      tsv.push(`${facetName}\tcount\tlcp\tcls\tinp`);
      const filterKeys = facetName === 'checkpoint' && mode !== 'all';
      const filteredKeys = filterKeys
        ? optionKeys.filter((a) => !!(this.placeholders[a]))
        : optionKeys;
      const nbToShow = showAtt || numOptions;
      facetEntries
        .filter((entry) => !filterKeys || filteredKeys.includes(entry.value))
        .slice(0, nbToShow)
        .forEach((entry) => {
          const CWVDISPLAYTHRESHOLD = 10;
          let lcp = '-';
          if (entry.metrics.lcp && entry.metrics.lcp.count >= CWVDISPLAYTHRESHOLD) {
            const lcpValue = entry.metrics.lcp.percentile(75);
            lcp = `${toHumanReadable(lcpValue / 1000)} s`;
          }

          let cls = '-';
          if (entry.metrics.cls && entry.metrics.cls.count >= CWVDISPLAYTHRESHOLD) {
            const clsValue = entry.metrics.cls.percentile(75);
            cls = `${toHumanReadable(clsValue)}`;
          }

          let inp = '-';
          if (entry.metrics.inp && entry.metrics.inp.count >= CWVDISPLAYTHRESHOLD) {
            const inpValue = entry.metrics.inp.percentile(75);
            inp = `${toHumanReadable(inpValue / 1000)} s`;
          }

          tsv.push(`${entry.name}\t${entry.value}\t${lcp}\t${cls}\t${inp}`);
        });
      tsv.push(...facetEntries
        .filter((entry) => !filterKeys || filteredKeys.includes(entry.value))
        .slice(0, nbToShow)
        .map((entry) => `${entry.value}\t${entry.metrics.pageViews.sum}\t${entry.metrics.lcp.percentile(75)}\t${entry.metrics.cls.percentile(75)}\t${entry.metrics.inp.percentile(75)}`));
    }
    return tsv;
  }

  connectedCallback() {
    if (this.dataChunks) this.update();
  }

  update() {
    const facetName = this.getAttribute('facet');
    const facetEntries = this.dataChunks.facets[facetName];
    const optionKeys = facetEntries.map((f) => f.value);

    const url = new URL(window.location);
    const drilldownAtt = this.getAttribute('drilldown');
    const mode = url.searchParams.get('mode') || this.getAttribute('mode');
    const numOptions = mode === 'all' ? 20 : 10;
    const nbToShow = this.getAttribute('show') || numOptions;
    const focus = this.getAttribute('focus') || url.searchParams.get('focus');

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
      legend.append(clipboard);
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
        .slice(0, nbToShow)
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
          div.addEventListener('click', (evt) => {
            if (evt.target !== input) input.checked = !input.checked;
            evt.stopPropagation();
            this.parentElement.parentElement.dispatchEvent(new Event('facetchange'), this);
          });

          const label = document.createElement('label');
          label.setAttribute('for', `${facetName}-${entry.value}`);
          const valuespan = document.createElement('span');
          const countspan = document.createElement('span');
          countspan.className = 'count';
          countspan.textContent = toHumanReadable(entry.metrics.pageViews.sum);
          countspan.title = entry.metrics.pageViews.sum;
          valuespan.innerHTML = this.createLabelHTML(entry.value);
          label.append(valuespan, countspan);

          const ul = document.createElement('ul');
          ul.classList.add('cwv');

          async function addSignificanceFlag(element, metric, baseline) {
            const p = pValue(metric.values, baseline.values);
            if (p < 0.05) {
              element.classList.add('significant');
            } else if (p < 0.1) {
              element.classList.add('interesting');
            }
            element.dataset.pValue = p;
          }

          const CWVDISPLAYTHRESHOLD = 10;
          // display core web vital to facets
          // add lcp
          let lcp = '-';
          let lcpScore = '';
          const lcpLI = document.createElement('li');
          lcpLI.title = 'LCP';
          if (entry.metrics.lcp && entry.metrics.lcp.count >= CWVDISPLAYTHRESHOLD) {
            const lcpValue = entry.metrics.lcp.percentile(75);
            lcp = `${toHumanReadable(lcpValue / 1000)} s`;
            lcpScore = scoreCWV(lcpValue, 'lcp');
            addSignificanceFlag(lcpLI, entry.metrics.lcp, this.dataChunks.totals.lcp);
            lcpLI.title += ` - based on ${entry.metrics.lcp.count} samples`;
          } else {
            lcpLI.title += ` - not enough samples (${entry.metrics.lcp.count})`;
          }
          lcpLI.classList.add(`score-${lcpScore}`);
          lcpLI.textContent = lcp;
          ul.append(lcpLI);

          // add cls
          let cls = '-';
          let clsScore = '';
          const clsLI = document.createElement('li');
          clsLI.title = 'CLS';
          if (entry.metrics.cls && entry.metrics.cls.count >= CWVDISPLAYTHRESHOLD) {
            const clsValue = entry.metrics.cls.percentile(75);
            cls = `${toHumanReadable(clsValue)}`;
            clsScore = scoreCWV(clsValue, 'cls');
            addSignificanceFlag(clsLI, entry.metrics.cls, this.dataChunks.totals.cls);
            clsLI.title += ` - based on ${entry.metrics.cls.count} samples`;
          } else {
            clsLI.title += ` - not enough samples (${entry.metrics.cls.count})`;
          }
          clsLI.classList.add(`score-${clsScore}`);
          clsLI.textContent = cls;
          ul.append(clsLI);

          // add inp
          let inp = '-';
          let inpScore = '';
          const inpLI = document.createElement('li');
          inpLI.title = 'INP';
          if (entry.metrics.inp && entry.metrics.inp.count >= CWVDISPLAYTHRESHOLD) {
            const inpValue = entry.metrics.inp.percentile(75);
            inp = `${toHumanReadable(inpValue / 1000)} s`;
            inpScore = scoreCWV(inpValue, 'inp');
            addSignificanceFlag(inpLI, entry.metrics.inp, this.dataChunks.totals.inp);
            inpLI.title += ` - based on ${entry.metrics.inp.count} samples`;
          } else {
            inpLI.title += ` - not enough samples (${entry.metrics.inp.count})`;
          }

          inpLI.classList.add(`score-${inpScore}`);
          inpLI.textContent = inp;
          ul.append(inpLI);

          div.append(input, label, ul);
          fieldSet.append(div);
        });

      if (filteredKeys.length > nbToShow) {
        // add "more" link
        const div = document.createElement('div');
        div.className = 'load-more';
        const more = document.createElement('label');
        more.textContent = 'more...';
        more.addEventListener('click', (evt) => {
          evt.preventDefault();
          // increase number of keys shown
          this.parentElement.updateFacets(
            focus,
            mode,
            this.placeholders,
            { [facetName]: nbToShow + numOptions },
          );
        });

        div.append(more);

        const all = document.createElement('label');
        all.textContent = `all (${filteredKeys.length})`;
        all.addEventListener('click', (evt) => {
          evt.preventDefault();
          // increase number of keys shown
          this.updateFacets(
            focus,
            mode,
            this.placeholders,
            { [facetName]: filteredKeys.length },
          );
        });
        div.append(all);
        const container = document.createElement('div');
        container.classList.add('more-container');
        container.append(div);
        fieldSet.append(container);
      }

      legend.addEventListener('click', () => {
        const tsv = this.computeTSV(numOptions);
        navigator.clipboard.writeText(tsv.join('\r\n'));
        const toast = document.getElementById('copied-toast');
        toast.ariaHidden = false;
        setTimeout(() => { toast.ariaHidden = true; }, 3000);
      });
      this.append(fieldSet);
    }
  }
}
