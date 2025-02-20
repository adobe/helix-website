// eslint-disable-next-line import/no-unresolved
import { utils, stats } from '@adobe/rum-distiller';
import { escapeHTML } from '../utils.js';

const { computeConversionRate, scoreCWV } = utils;
const { tTest, zTestTwoProportions } = stats;

async function addSignificanceFlag(element, metric, baseline) {
  let p = 1;
  if (Array.isArray(metric.values) && Array.isArray(baseline.values)) {
    // for two arrays of values, we use a t-test
    p = tTest(metric.values, baseline.values);
  } else if (
    typeof metric.total === 'number'
    && typeof metric.conversions === 'number'
    && typeof baseline.total === 'number'
    && typeof baseline.conversions === 'number'
  ) {
    // for two proportions, we use a z-test
    p = zTestTwoProportions(metric.total, metric.conversions, baseline.total, baseline.conversions);
  }
  if (p < 0.05) {
    element.classList.add('significant');
  } else if (p < 0.1) {
    element.classList.add('interesting');
  }
  element.dataset.pValue = p;
}
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
    if (this.placeholders && this.placeholders[labelText]) {
      return `<span class="label">${this.placeholders[labelText]}</span><span class="value">${labelText}</span>`;
    }
    return escapeHTML(labelText);
  }

  get dataChunks() {
    return this.parentElement.parentElement.dataChunks;
  }

  computeTSV() {
    const url = new URL(window.location);
    const facetName = this.getAttribute('facet');
    const mode = url.searchParams.get('mode') || this.getAttribute('mode');

    const facetEntries = this.dataChunks.facets[facetName];
    const tsv = [];
    const optionKeys = facetEntries.map((f) => f.value);
    if (optionKeys.length) {
      tsv.push(`${facetName}\tcount\tlcp\tcls\tinp`);
      const filterKeys = facetName === 'checkpoint' && mode !== 'all';
      const filteredKeys = filterKeys
        ? optionKeys.filter((a) => !!(this.placeholders[a]))
        : optionKeys;
      facetEntries
        .filter((entry) => !filterKeys || filteredKeys.includes(entry.value))
        .forEach((entry) => {
          const CWVDISPLAYTHRESHOLD = 10;
          const metrics = entry.getMetrics(['pageViews', 'lcp', 'cls', 'inp']);
          let lcp = '-';
          if (metrics.lcp && metrics.lcp.count >= CWVDISPLAYTHRESHOLD) {
            const lcpValue = metrics.lcp.percentile(75);
            lcp = `${(lcpValue / 1000)} s`;
          }

          let cls = '-';
          if (metrics.cls && metrics.cls.count >= CWVDISPLAYTHRESHOLD) {
            const clsValue = metrics.cls.percentile(75);
            cls = `${(clsValue)}`;
          }

          let inp = '-';
          if (metrics.inp && metrics.inp.count >= CWVDISPLAYTHRESHOLD) {
            const inpValue = metrics.inp.percentile(75);
            inp = `${(inpValue / 1000)} s`;
          }

          tsv.push(`${entry.value}\t${metrics.pageViews.sum}\t${lcp}\t${cls}\t${inp}`);
        });
    }
    return tsv;
  }

  connectedCallback() {
    if (this.dataChunks) this.update();
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
    const numOptions = parseInt(url.searchParams.get(`${facetName}~`), 10) || 10;

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
      const extraElements = Array.from(this.querySelectorAll(':scope > a, legend > a.icon') || []);

      fieldSet.textContent = '';

      const legend = this.querySelector('legend') || document.createElement('legend');
      legend.textContent = legendText;

      const clipboard = document.createElement('span');
      clipboard.className = 'clipboard';
      clipboard.title = 'Copy to clipboard';

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
      extraElements.forEach((el) => el.classList.add('icon'));
      legend.append(...extraElements);
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

      const paint = (start = 0, end = numOptions) => {
        const entries = facetEntries
          .filter((entry) => !filterKeys || filteredKeys.includes(entry.value));
        const prefix = entries.slice(start, end)
          .map((entry) => entry.value)
          .reduce((acc, entry) => {
            // find longest common prefix between acc and entry
            let i = 0;
            while (i < acc.length && i < entry.length && acc[i] === entry[i]) {
              i += 1;
            }
            return acc.slice(0, i);
          }, entries[0].value);
        entries.slice(start, end).forEach((entry) => {
          const div = document.createElement('div');
          const input = document.createElement('input');
          input.type = 'checkbox';
          input.value = entry.value;
          input.checked = url.searchParams.getAll(facetName).includes(entry.value);
          if (input.checked) {
            // addFilterTag(facetName, entry.value);
            div.ariaSelected = true;
          }
          input.indeterminate = url.searchParams.getAll(`${facetName}!`).includes(entry.value);
          if (input.indeterminate) {
            div.ariaChecked = 'mixed';
          }
          input.id = `${facetName}=${entry.value}`;
          if (enabled) {
            div.addEventListener('click', (evt) => {
              if (!evt.shiftKey && evt.target !== input) {
                input.checked = !input.checked;
              } else if (evt.shiftKey && this.dataChunks.facets[`${facetName}!`]) {
                // use the shift key to indicate a negation
                input.indeterminate = true;
              }
              evt.stopPropagation();
              this.parentElement.parentElement.dispatchEvent(new Event('facetchange'), this);
            });
          }

          const metrics = entry.getMetrics(['pageViews', 'visits']);

          const label = document.createElement('label');
          label.setAttribute('for', `${facetName}-${entry.value}`);
          const countspan = document.createElement('number-format');
          countspan.className = 'count';
          countspan.textContent = metrics.pageViews.sum;
          countspan.setAttribute('sample-size', metrics.pageViews.count);
          countspan.setAttribute('total', this.dataChunks.totals.pageViews.sum);
          countspan.setAttribute('fuzzy', 'false');
          const valuespan = this.createValueSpan(entry, prefix, filteredKeys.length === 1);

          label.append(valuespan, countspan);

          const ul = document.createElement('ul');
          ul.classList.add('cwv');

          // display core web vital to facets
          // add lcp
          const lcpLI = this.createCWVChiclet(entry, 'lcp');
          lcpLI.classList.add('performance');
          ul.append(lcpLI);

          // add cls
          const clsLI = this.createCWVChiclet(entry, 'cls');
          clsLI.classList.add('performance');
          ul.append(clsLI);

          // add inp
          const inpLI = this.createCWVChiclet(entry, 'inp');
          inpLI.classList.add('performance');
          ul.append(inpLI);

          // add bounce rate
          const bounceRateLI = this.createBusinessMetricChiclet(entry, 'bounces', 'visits', 60, 40, 20);
          bounceRateLI.title = 'Bounce Rate';
          bounceRateLI.classList.add('acquisition');
          ul.append(bounceRateLI);

          // add time on page
          const pagesPerVisitLI = this.createBusinessMetricChiclet(entry, 'timeOnPage', null, 1, 2, 5);
          pagesPerVisitLI.title = 'Time on page';
          pagesPerVisitLI.classList.add('time');
          pagesPerVisitLI.classList.add('acquisition');
          ul.append(pagesPerVisitLI);

          // add earned percentage
          const earnedLI = this.createBusinessMetricChiclet(entry, 'organic', 'visits', 25, 50, 75);
          earnedLI.title = 'Organic Percentage';
          earnedLI.classList.add('acquisition');
          ul.append(earnedLI);

          // add engagement and conversion rate
          const engagementLI = this.createBusinessMetricChiclet(entry, 'engagement', 'pageViews', 25, 75, 90);
          engagementLI.title = 'Engagement';
          engagementLI.classList.add('conversion');
          ul.append(engagementLI);

          const conversionRateLI = this.createBusinessMetricChiclet(entry, 'conversions', 'visits', 5, 10, 20);
          conversionRateLI.title = 'Conversion Rate';
          conversionRateLI.classList.add('conversion');
          ul.append(conversionRateLI);

          div.append(input, label, ul);

          const more = fieldSet.querySelector('.more-container');
          if (more) {
            more.before(div);
          } else {
            fieldSet.append(div);
          }
        });
      };

      paint();

      if (filteredKeys.length > numOptions) {
        const container = document.createElement('div');
        container.classList.add('more-container');

        // add "more" link
        const div = document.createElement('div');
        div.className = 'load-more';
        const more = document.createElement('label');
        more.textContent = 'more…';
        more.addEventListener('click', (evt) => {
          evt.preventDefault();
          const start = fieldSet.children.length - 2; // minus the "legend" and "more" container
          const end = start + numOptions;
          paint(start, end);
          const usp = new URLSearchParams(window.location.search);
          usp.set(`${facetName}~`, end);
          window.history.pushState({}, '', `${window.location.pathname}?${usp}`);

          if (end >= filteredKeys.length) {
            container.remove();
          }
        });

        div.append(more);

        const all = document.createElement('label');
        all.textContent = `all (${filteredKeys.length})`;
        all.addEventListener('click', (evt) => {
          evt.preventDefault();

          const start = fieldSet.children.length - 2; // minus the "legend" and "more" container
          paint(start, filteredKeys.length);

          container.remove();
        });
        div.append(all);

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
    } else {
      const fieldSet = this.querySelector('fieldset');
      if (fieldSet) fieldSet.remove();
    }
  }

  createValueSpan(entry, prefix, solo = false) {
    const valuespan = document.createElement('span');
    valuespan.innerHTML = this.createLabelHTML(entry.value, prefix, solo);
    const highlightFromParam = this.getAttribute('highlight');
    if (highlightFromParam) {
      const highlightValue = new URL(window.location).searchParams.get(highlightFromParam) || '';
      const highlights = highlightValue.split(' ')
        .map((h) => h.trim())
        .filter((h) => h.length > 0);
      // get all text nodes, no matter how deep inside valuespan
      const textNodes = [];
      const walker = document.createTreeWalker(valuespan, NodeFilter.SHOW_TEXT, null, false);
      let node = walker.nextNode();
      while (node) {
        textNodes.push(node);
        node = walker.nextNode();
      }
      textNodes.forEach((textNode) => {
        if (!highlights.length) return;
        const text = textNode.textContent;
        const placeholder = document.createElement('span');
        placeholder.innerHTML = text.replace(new RegExp(`(${highlights.join('|')})`, 'gi'), '<mark>$1</mark>');
        textNode.replaceWith(...placeholder.childNodes);
      });
    }
    return valuespan;
  }

  createCWVChiclet(entry, metricName = 'lcp') {
    const CWVDISPLAYTHRESHOLD = 10;
    let cwv = '-';
    let score = '';
    const li = document.createElement('li');
    const nf = document.createElement('number-format');
    nf.setAttribute('precision', 2);
    nf.setAttribute('fuzzy', 'false');
    const fillEl = async () => {
      const metrics = entry.getMetrics([metricName]);
      li.title = metricName.toUpperCase();
      if (metrics[metricName] && metrics[metricName].count >= CWVDISPLAYTHRESHOLD) {
        const value = metrics[metricName].percentile(75);
        cwv = metricName !== 'cls'
          ? value / 1000
          : (Math.round(value * 100) / 100);
        nf.textContent = cwv;
        score = scoreCWV(value, metricName);
        addSignificanceFlag(li, metrics[metricName], this.dataChunks.totals[metricName]);
        li.title += ` - based on ${metrics[metricName].count} samples`;
      } else {
        li.title += ` - not enough samples (${metrics[metricName].count})`;
      }
      li.classList.add(`score-${score}`);
      li.append(nf);
    };
    // fill the element, but don't wait for it
    window.setTimeout(fillEl, 0);
    return li;
  }

  createBusinessMetricChiclet(entry, rate, baseline, low, high, optimum) {
    const li = document.createElement('li');
    li.classList.add('business-metric');
    li.classList.add(rate);
    const meter = document.createElement('meter');
    meter.min = 0;
    if (Math.max(low, high, optimum) < 10) {
      meter.max = 10;
    } else {
      meter.max = 100;
    }
    if (low) meter.low = low;
    if (high) meter.high = high;
    if (optimum && !Number.isNaN(optimum)) meter.optimum = optimum;
    const nf = document.createElement('number-format');
    nf.setAttribute('precision', 2);
    nf.setAttribute('fuzzy', 'false');
    const fillEl = async () => {
      if (typeof baseline === 'string') {
        const value = entry.metrics[rate].sum;
        const total = entry.metrics[baseline].sum;
        const rateVal = li.classList.contains('fixed')
          ? value / total
          : computeConversionRate(value, total);
        meter.value = Number.isFinite(rateVal) ? rateVal : 0;
        nf.textContent = rateVal;

        // todo: add significance flag, but this needs to be based on a z-test
        // between the current entry and the total
        addSignificanceFlag(li, {
          total: entry.metrics[baseline].count,
          conversions: entry.metrics[rate].count,
        }, {
          total: this.dataChunks.totals[baseline].count,
          conversions: this.dataChunks.totals[rate].count,
        });
      } else {
        // we show the median and use a t-test between all values
        const value = entry.metrics[rate].percentile(50);
        nf.textContent = value;
        meter.value = Number.isFinite(value) ? value : 0;
      }

      li.append(nf, meter);
    };
    // fill the element, but don't wait for it
    window.setTimeout(fillEl, 0);
    return li;
  }
}
