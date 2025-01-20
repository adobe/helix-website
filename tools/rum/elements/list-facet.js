// eslint-disable-next-line import/no-unresolved
import { utils, stats } from '@adobe/rum-distiller';
import {
  escapeHTML, toHumanReadable,
} from '../utils.js';

const { scoreCWV } = utils;
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
 * <list-facet facet="userAgent" mode="all">
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
            lcp = `${toHumanReadable(lcpValue / 1000)} s`;
          }

          let cls = '-';
          if (metrics.cls && metrics.cls.count >= CWVDISPLAYTHRESHOLD) {
            const clsValue = metrics.cls.percentile(75);
            cls = `${toHumanReadable(clsValue)}`;
          }

          let inp = '-';
          if (metrics.inp && metrics.inp.count >= CWVDISPLAYTHRESHOLD) {
            const inpValue = metrics.inp.percentile(75);
            inp = `${toHumanReadable(inpValue / 1000)} s`;
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
      clipboard.title = 'Copy facet rows to clipboard';

      legend.append(clipboard);

      fieldSet.append(legend);
      const filterKeys = facetName === 'checkpoint' && mode !== 'all';
      const filteredKeys = filterKeys && this.placeholders
        ? optionKeys.filter((a) => !!(this.placeholders[a]))
        : optionKeys;

      const paint = (start = 0, end = numOptions) => {
        const entries = facetEntries
          .filter((entry) => !filterKeys || filteredKeys.includes(entry.value));
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
          input.id = `${facetName}=${entry.value}`;
          if (enabled) {
            input.addEventListener('click', (evt) => {
              if (evt.target !== input) input.checked = !input.checked;
              evt.stopPropagation();
              this.parentElement.parentElement.dispatchEvent(new Event('facetchange'), this);
            });
          }

          const metrics = entry.getMetrics(['pageViews', 'visits']);

          const label = document.createElement('label');
          label.setAttribute('for', `${facetName}-${entry.value}`);
          const countspan = document.createElement('span');
          countspan.className = 'count';
          countspan.textContent = toHumanReadable(metrics.pageViews.sum);
          countspan.title = metrics.pageViews.sum;
          const valuespan = this.createValueSpan(entry);

          label.append(valuespan, countspan);

          const ul = document.createElement('ul');
          ul.classList.add('cwv');

          // display core web vital to facets
          // add lcp
          const lcpLI = this.createCWVChiclet(entry, 'lcp');
          ul.append(lcpLI);

          // add cls
          const clsLI = this.createCWVChiclet(entry, 'cls');
          ul.append(clsLI);

          // add inp
          const inpLI = this.createCWVChiclet(entry, 'inp');
          ul.append(inpLI);

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
        more.textContent = 'more...';
        more.addEventListener('click', (evt) => {
          evt.preventDefault();
          const start = fieldSet.children.length - 2; // minus the "legend" and "more" container
          const end = start + numOptions;
          paint(start, end);

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

  createValueSpan(entry) {
    const valuespan = document.createElement('span');
    valuespan.innerHTML = this.createLabelHTML(entry.value);
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
    const fillEl = async () => {
      const metrics = entry.getMetrics([metricName]);
      li.title = metricName.toUpperCase();
      if (metrics[metricName] && metrics[metricName].count >= CWVDISPLAYTHRESHOLD) {
        const value = metrics[metricName].percentile(75);
        cwv = `${toHumanReadable(value / (metricName === 'cls' ? 1 : 1000))}`;
        if (metricName === 'inp' || metricName === 'lcp') {
          cwv += ' s';
        }
        score = scoreCWV(value, metricName);
        addSignificanceFlag(li, metrics[metricName], this.dataChunks.totals[metricName]);
        li.title += ` - based on ${metrics[metricName].count} samples`;
      } else {
        li.title += ` - not enough samples (${metrics[metricName].count})`;
      }
      li.classList.add(`score-${score}`);
      li.textContent = cwv;
    };
    // fill the element, but don't wait for it
    window.setTimeout(fillEl, 0);
    return li;
  }
}
