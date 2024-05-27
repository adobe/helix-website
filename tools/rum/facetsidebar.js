import { pValue } from './cruncher.js';
import { toHumanReadable, scoreCWV, escapeHTML } from './utils.js';

const facetDecorators = {
  userAgent: {
    label: 'User Agent (Operating System and Browser)',
    drilldown: 'share.html',
  },
  url: {
    label: 'URL',
    drilldown: 'list.html',
  },
  checkpoint: {
    label: 'Checkpoint',
    drilldown: 'flow.html',
  },
  filter: {
    hidden: true,
  },
  'click.source': {
    label: 'Clicked Element (CSS Selector)',
  },
  'click.target': {
    label: 'Click Target (URL)',
  },
  'utm.source': {
    label: 'Campaign Tracking Parameter',
  },
  'utm.utm_medium.target': {
    label: 'Medium',
  },
  'utm.utm_campaign.target': {
    label: 'Campaign',
  },
  'utm.utm_content.target': {
    label: 'Content',
  },
  'utm.utm_term.target': {
    label: 'Term',
  },
  'utm.utm_source.target': {
    label: 'Source',
  },
  'utm.utm_keyword.target': {
    label: 'Keyword',
  },
  trafficsource: {
    label: 'Traffic Source',
  },
  traffictype: {
    label: 'Traffic Type',
  },
  entryevent: {
    label: 'Entry Event',
  },
  pagetype: {
    label: 'Page Type',
  },
  contenttype: {
    label: 'Content Type',
  },
  interaction: {
    label: 'Interaction',
  },
  clicktarget: {
    label: 'Click Target Type',
  },
  exit: {
    label: 'Exit Link',
  },
};
export default class FacetSidebar {
  constructor(dataChunks, elems) {
    this.dataChunks = dataChunks;
    this.elems = elems;
    this.eventListeners = {};
    this.initDOM();
  }

  initDOM() {
    // <div class="filters">
    //   <div class="quick-filter">
    //     <input type="text" id="filter" placeholder="Type to filter...">
    //   </div>
    //   <aside id="facets">
    //   </aside>
    // </div>;
    const filters = document.createElement('div');
    filters.className = 'filters';
    const quickFilter = document.createElement('div');
    quickFilter.className = 'quick-filter';
    const filterInput = document.createElement('input');
    filterInput.type = 'text';
    filterInput.id = 'filter';
    filterInput.placeholder = 'Type to filter...';
    quickFilter.append(filterInput);
    filters.append(quickFilter);
    const facetsElement = document.createElement('aside');
    facetsElement.id = 'facets';
    filters.append(facetsElement);

    this.rootElement = filters;
    this.elems.filterInput = filterInput;
    this.elems.facetsElement = facetsElement;
  }

  addEventListener(event, callback) {
    if (!this.eventListeners[event]) this.eventListeners[event] = [];
    this.eventListeners[event].push(callback);
  }

  dispatchEvent(event, data) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach((callback) => callback(data));
    }
  }

  updateFacets(focus, mode, placeholders, show = {}) {
    const createLabelHTML = (labelText, usePlaceholders) => {
      if (labelText.startsWith('https://') && labelText.includes('media_')) {
        return `<img src="${labelText}?width=750&format=webply&optimize=medium"">`;
      }

      if (labelText.startsWith('https://')) {
        return `<a href="${labelText}" target="_new">${labelText}</a>`;
      }

      if (usePlaceholders && placeholders[labelText]) {
        return (`${placeholders[labelText]} [${labelText}]`);
      }
      return escapeHTML(labelText);
    };

    const numOptions = mode === 'all' ? 20 : 10;
    const filterTags = document.querySelector('.filter-tags');
    filterTags.textContent = '';
    const addFilterTag = (name, value) => {
      const tag = document.createElement('span');
      if (value) tag.textContent = `${name}: ${value}`;
      else tag.textContent = `${name}`;
      tag.classList.add(`filter-tag-${name}`);
      filterTags.append(tag);
    };

    if (this.elems.filterInput.value) addFilterTag('text', this.elems.filterInput.value);
    if (focus) addFilterTag(focus);

    const url = new URL(window.location);

    this.elems.facetsElement.textContent = '';
    const keys = Object.keys(this.dataChunks.facets)
      // only show facets that have no decorators or are not hidden
      .filter((key) => !facetDecorators[key] || !facetDecorators[key].hidden);
    keys.forEach((facetName) => {
      const facetEntries = this.dataChunks.facets[facetName];
      const optionKeys = facetEntries.map((f) => f.value);
      if (optionKeys.length) {
        let tsv = '';
        const fieldSet = document.createElement('fieldset');
        fieldSet.classList.add(`facet-${facetName}`);
        const legend = document.createElement('legend');
        legend.textContent = facetDecorators[facetName]?.label || facetName;
        const clipboard = document.createElement('span');
        clipboard.className = 'clipboard';
        legend.append(clipboard);
        if (facetDecorators[facetName]?.drilldown && url.searchParams.get('drilldown') !== facetName) {
          const drilldown = document.createElement('a');
          drilldown.className = 'drilldown';
          drilldown.href = facetDecorators[facetName].drilldown;
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
          drillup.href = facetDecorators[facetName].drilldown;
          drillup.title = 'Drill down to more details';
          drillup.textContent = '';
          drillup.addEventListener('click', () => {
            const drillupurl = new URL('explorer.html', window.location);
            drillupurl.search = new URL(window.location).search;
            drillupurl.searchParams.delete(facetName);
            drillupurl.searchParams.delete('drilldown', facetName);
            drillup.href = drillupurl.href;
          });
          legend.append(drillup);
        }

        fieldSet.append(legend);
        tsv += `${facetName}\tcount\tlcp\tcls\tinp\r\n`;
        const filterKeys = facetName === 'checkpoint' && mode !== 'all';
        const filteredKeys = filterKeys
          ? optionKeys.filter((a) => !!(placeholders[a]))
          : optionKeys;
        const nbToShow = show[facetName] || numOptions;
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
              addFilterTag(facetName, entry.value);
              div.ariaSelected = true;
            }
            input.id = `${facetName}=${entry.value}`;
            div.addEventListener('click', (evt) => {
              if (evt.target !== input) input.checked = !input.checked;
              evt.stopPropagation();
              this.dispatchEvent('change', this);
            });

            const label = document.createElement('label');
            label.setAttribute('for', `${facetName}-${entry.value}`);
            label.innerHTML = `${createLabelHTML(entry.value, facetName === 'checkpoint')} (${toHumanReadable(entry.metrics.pageViews.sum)})`;

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
            }

            inpLI.classList.add(`score-${inpScore}`);
            inpLI.textContent = inp;
            ul.append(inpLI);
            tsv += `${entry.name}\t${entry.value}\t${lcp}\t${cls}\t${inp}\r\n`;

            div.append(input, label, ul);
            fieldSet.append(div);
          });
        // populate pastebuffer with overflow data
        // ideally, this would be populated only when
        // the user clicks the copy button, so that we
        // don't waste cycles on rendering p75s that
        // the user never sees.
        tsv = facetEntries
          .filter((entry) => !filterKeys || filteredKeys.includes(entry.value))
          .slice(0, nbToShow)
          .reduce((acc, entry) => `${acc}${entry.value}\t${entry.metrics.pageViews.sum}\t${entry.metrics.lcp.percentile(75)}\t${entry.metrics.cls.percentile(75)}\t${entry.metrics.inp.percentile(75)}\r\n`, tsv);

        if (filteredKeys.length > nbToShow) {
          // add "more" link
          const div = document.createElement('div');
          div.className = 'load-more';
          const more = document.createElement('label');
          more.textContent = 'more...';
          more.addEventListener('click', (evt) => {
            evt.preventDefault();
            // increase number of keys shown
            this.updateFacets(
              focus,
              mode,
              placeholders,
              { [facetName]: (show[facetName] || numOptions) + numOptions },
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
              placeholders,
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
          navigator.clipboard.writeText(tsv);
          const toast = document.getElementById('copied-toast');
          toast.ariaHidden = false;
          setTimeout(() => { toast.ariaHidden = true; }, 3000);
        });

        this.elems.facetsElement.append(fieldSet);
      }
    });
  }
}
