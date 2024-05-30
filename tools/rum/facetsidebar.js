import ListFacet from './list-facet.js';

customElements.define('list-facet', ListFacet);

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
    labels: {
      enter: 'Visit Entry',
      loadresource: 'Fragment Loaded',
      404: 'Not Found',
      viewblock: 'Block Viewed',
      viewmedia: 'Media Viewed',
      click: 'Clicked',
      error: 'JavaScript Error',
      utm: 'Marketing Campaigns',
      consent: 'Consent',
    },
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

  updateFacets(focus, mode) {
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

    this.elems.facetsElement.textContent = '';
    const keys = Object.keys(this.dataChunks.facets)
      // only show facets that have no decorators or are not hidden
      .filter((key) => !facetDecorators[key] || !facetDecorators[key].hidden);
    keys.forEach((facetName) => {
      const facetEl = document.createElement(facetDecorators[facetName]?.component || 'list-facet');
      facetEl.setAttribute('facet', facetName);
      if (mode) facetEl.setAttribute('mode', mode);
      if (focus) facetEl.setAttribute('focus', focus);
      facetEl.setAttribute('drilldown', facetDecorators[facetName]?.drilldown);
      facetEl.data = this.dataChunks;
      facetEl.parent = this;
      if (facetDecorators[facetName]?.label) {
        const flabel = document.createElement('legend');
        flabel.textContent = facetDecorators[facetName].label;
        facetEl.append(flabel);
      }
      if (facetDecorators[facetName]?.labels) {
        const fnames = document.createElement('dl');
        Object.entries(facetDecorators[facetName].labels).forEach(([key, value]) => {
          const dt = document.createElement('dt');
          dt.textContent = key;
          const dd = document.createElement('dd');
          dd.textContent = value;
          fnames.append(dt, dd);
        });
        facetEl.append(fnames);
      }
      this.elems.facetsElement.append(facetEl);
    });
  }
}
