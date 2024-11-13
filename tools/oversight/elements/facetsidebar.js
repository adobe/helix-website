export default class FacetSidebar extends HTMLElement {
  constructor() {
    super();
    this.eventListeners = {};
    this.elems = {};
    this.predefinedFacets = [];
  }

  set data(data) {
    this.dataChunks = data;
  }

  connectedCallback() {
    this.initDOM();
  }

  initDOM() {
    const predefinedFacets = Array.from(this.querySelectorAll(':scope > *'));
    // <div class="filters">
    //   <div class="quick-filter">
    //     <input type="text" id="filter" placeholder="Type to filter...">
    //   </div>
    //   <form id="select-focus">
    //     <input type="radio" name="focus" id="performance">
    //     <label for="performance">Performance</label>
    //     <input type="radio" name="focus" id="acquisition">
    //     <label for="acquisition">Acquisition</label>
    //     <input type="radio" name="focus" id="conversion">
    //     <label for="conversion">Conversion</label>
    //   </form>
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
    this.append(quickFilter);

    const selectFocus = document.createElement('form');
    const performance = document.createElement('input');
    performance.type = 'radio';
    performance.name = 'focus';
    performance.value = 'performance';
    performance.title = 'Toggle performance metrics (LCP, CLS, INP)';
    const acquisition = document.createElement('input');
    acquisition.type = 'radio';
    acquisition.name = 'focus';
    acquisition.value = 'acquisition';
    acquisition.title = 'Toggle acquisition metrics (bounce rate, time on page, organic)';
    const conversion = document.createElement('input');
    conversion.type = 'radio';
    conversion.name = 'focus';
    conversion.value = 'conversion';
    conversion.title = 'Toggle conversion metrics';
    const urlParams = new URLSearchParams(window.location.search);
    const focus = urlParams.get('focus');
    if (focus) {
      performance.checked = focus === 'performance';
      acquisition.checked = focus === 'acquisition';
      conversion.checked = focus === 'conversion';
    } else {
      performance.checked = true;
    }

    // change selection on hover
    selectFocus.addEventListener('mouseover', (e) => {
      e.target.checked = true;
      e.target.dispatchEvent(new Event('change', { bubbles: true }));
    });

    selectFocus.addEventListener('change', (e) => {
      if (!e.target.value) return;
      urlParams.set('focus', e.target.value);
      // pushstate is needed to avoid a full reload
      window.history.pushState({}, '', `${window.location.pathname}?${urlParams.toString()}`);
    });

    selectFocus.append(performance, acquisition, conversion);
    this.append(selectFocus);

    const facetsElement = document.createElement('aside');
    facetsElement.id = 'facets';
    this.append(facetsElement);

    this.elems.filterInput = filterInput;
    this.elems.facetsElement = facetsElement;

    predefinedFacets.forEach((facet) => {
      this.elems.facetsElement.append(facet);
    });
  }

  updateFacets(mode) {
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

    const existingFacetElements = Array.from(this.elems.facetsElement.children);
    existingFacetElements.forEach((facet) => {
      facet.setAttribute('mode', 'hidden');
    });

    const keys = Object.keys(this.dataChunks.facets)
      // only show facets that have no decorators or are not hidden
      .filter((key) => key !== 'filter');
    keys.forEach((facetName) => {
      const facetEl = this.querySelector(`[facet="${facetName}"]`);
      // eslint-disable-next-line no-console
      console.assert(facetEl, `Facet ${facetName} not found in provided UI elements.`);

      if (facetEl) facetEl.setAttribute('mode', mode || 'default');
      if (facetEl) this.elems.facetsElement.append(facetEl);
    });
  }
}
