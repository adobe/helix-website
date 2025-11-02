// Import OpTel Detective Report modal functionality
// eslint-disable-next-line import/no-unresolved, import/no-relative-packages
import { openReportModal } from '../../../blocks/generate-ai-rum-report/generate-ai-rum-report.js';

// Import Saved Reports functionality
// eslint-disable-next-line import/no-unresolved, import/no-relative-packages
import { initializeSavedReports } from '../../../blocks/generate-ai-rum-report/report-actions.js';

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
    //     <div class="analysis-switcher">
    //       <label class="switch">
    //         <input type="checkbox" id="analysis-toggle">
    //         <span class="slider">Analysis</span>
    //       </label>
    //     </div>
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
    //   <div id="analysis-tile" class="analysis-tile" style="display: none;">
    //   </div>
    // </div>;
    const filters = document.createElement('div');
    filters.className = 'filters';
    const quickFilter = document.createElement('div');
    quickFilter.className = 'quick-filter';
    const filterInput = document.createElement('input');
    filterInput.type = 'text';
    filterInput.id = 'filter';
    filterInput.placeholder = 'Type to filter...';

    // Create OpTel Detective Report button
    const generateReportButton = document.createElement('button');
    generateReportButton.className = 'generate-ai-rum-report-button';
    generateReportButton.title = 'Use Claude to generate OpTel Detective Report';

    // Create icon element
    const icon = document.createElement('img');
    icon.src = '/icons/icon-claude.svg';
    icon.alt = 'Claude AI';
    icon.style.cssText = `
      width: 20px;
      height: 20px;
    `;
    generateReportButton.appendChild(icon);

    generateReportButton.style.cssText = `
      background: white;
      border: 2px solid #D97757;
      border-radius: 6px;
      cursor: pointer;
      padding: 8px 12px;
      transition: all 0.2s;
      margin-left: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    generateReportButton.addEventListener('mouseenter', () => {
      generateReportButton.style.transform = 'scale(1.05)';
      generateReportButton.style.boxShadow = '0 2px 8px rgba(217, 119, 87, 0.3)';
    });
    generateReportButton.addEventListener('mouseleave', () => {
      generateReportButton.style.transform = 'scale(1)';
      generateReportButton.style.boxShadow = 'none';
    });
    generateReportButton.addEventListener('click', () => {
      // Load the stylesheet dynamically
      FacetSidebar.loadStylesheet('generate-ai-rum-report-styles', '/blocks/generate-ai-rum-report/generate-ai-rum-report.css');
      // Open the modal
      openReportModal();
    });

    quickFilter.append(filterInput, generateReportButton);
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
    this.elems.selectFocus = selectFocus;

    predefinedFacets.forEach((facet) => {
      this.elems.facetsElement.append(facet);
    });

    // Initialize saved reports after daterange-picker is ready
    setTimeout(() => {
      initializeSavedReports();
    }, 500);
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

  static loadStylesheet(id, href) {
    if (!document.querySelector(`#${id}`)) {
      document.head.appendChild(Object.assign(document.createElement('link'), { rel: 'stylesheet', href, id }));
    }
  }
}
