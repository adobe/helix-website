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

    // Create analysis switcher
    const analysisSwitcher = document.createElement('div');
    analysisSwitcher.className = 'analysis-switcher';
    analysisSwitcher.title = 'AI Insights';

    const switchLabel = document.createElement('label');
    switchLabel.className = 'switch';
    const toggleInput = document.createElement('input');
    toggleInput.type = 'checkbox';
    toggleInput.id = 'analysis-toggle';
    const slider = document.createElement('span');
    slider.className = 'slider';
    slider.innerHTML = '🤖';

    switchLabel.append(toggleInput, slider);
    analysisSwitcher.append(switchLabel);
    quickFilter.append(filterInput, analysisSwitcher);
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

    // Create analysis tile
    const analysisTile = document.createElement('div');
    analysisTile.id = 'analysis-tile';
    analysisTile.className = 'analysis-tile';
    analysisTile.style.display = 'none';
    this.append(analysisTile);

    this.elems.filterInput = filterInput;
    this.elems.facetsElement = facetsElement;
    this.elems.selectFocus = selectFocus;
    this.elems.toggleInput = toggleInput;
    this.elems.analysisTile = analysisTile;

    // Add toggle event listener
    toggleInput.addEventListener('change', () => {
      this.toggleAnalysisMode(toggleInput.checked);
    });

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

  toggleAnalysisMode(enabled) {
    if (enabled) {
      this.elems.facetsElement.style.display = 'none';
      this.elems.selectFocus.style.display = 'none';
      this.elems.analysisTile.style.display = 'block';
      this.loadAnalysisInterface();
    } else {
      this.elems.facetsElement.style.display = 'block';
      this.elems.selectFocus.style.display = 'block';
      this.elems.analysisTile.style.display = 'none';
    }
  }

  loadAnalysisInterface() {
    // Create the same RUM chat interface that appears in the sidebar
    if (!this.elems.analysisTile.querySelector('.chat-interface')) {
      // Create the interface structure directly
      const chatInterface = document.createElement('div');
      chatInterface.className = 'chat-interface';

      chatInterface.innerHTML = `
        <div class="chat-header">
          <h2>OpTel Detective</h2>
          <div class="header-buttons">
            <button class="download-button" disabled title="Download insights as PDF (available after analysis)">📄 Download as PDF</button>
          </div>
        </div>
        <div id="messages" class="messages">
          <div class="message claude-message">
            🤖 Welcome to OpTel Detective! Enter your Anthropic API key below to start analyzing your RUM data.
          </div>
        </div>
        <div id="api-key-section" class="api-key-section">
          <div class="api-key-input">
            <label for="api-key">Enter Anthropic API Key:</label>
            <input type="password" id="api-key" placeholder="sk-ant-...">
            <button id="save-api-key">Save Key</button>
          </div>
          <div class="analysis-section" style="display: none;">
            <div class="processing-mode-selection" style="margin-bottom: 10px;">
              <label style="font-size: 14px; color: #666;">
                <input type="checkbox" id="deep-mode" style="margin-right: 5px;">
                Deep Analysis (more detailed, takes longer)
              </label>
            </div>
            <button id="start-analysis" class="primary-button" style="padding: 6px 10px;" title="">Show Insights</button>
          </div>
        </div>
      `;

      this.elems.analysisTile.appendChild(chatInterface);

      // Add basic functionality
      this.setupAnalysisInterface(chatInterface);
    }
  }

  setupAnalysisInterface(chatInterface) {
    const apiKeyInput = chatInterface.querySelector('#api-key');
    const saveApiKeyButton = chatInterface.querySelector('#save-api-key');
    const analysisSection = chatInterface.querySelector('.analysis-section');
    const startAnalysisButton = chatInterface.querySelector('#start-analysis');
    const messagesDiv = chatInterface.querySelector('#messages');

    // Store reference to the chat interface in the class
    this.elems.chatInterface = chatInterface;

    // Check for existing API key
    const existingApiKey = localStorage.getItem('anthropicApiKey');
    if (existingApiKey) {
      apiKeyInput.value = existingApiKey;
      apiKeyInput.disabled = true;
      saveApiKeyButton.textContent = 'Key Saved';
      saveApiKeyButton.disabled = true;
      analysisSection.style.display = 'block';
    }

    // Save API key functionality
    saveApiKeyButton.addEventListener('click', () => {
      const apiKey = apiKeyInput.value.trim();
      if (apiKey) {
        localStorage.setItem('anthropicApiKey', apiKey);
        apiKeyInput.disabled = true;
        saveApiKeyButton.textContent = 'Key Saved';
        saveApiKeyButton.disabled = true;
        analysisSection.style.display = 'block';

        const message = document.createElement('div');
        message.className = 'message claude-message';
        message.innerHTML = '✅ API key saved! You can now start your analysis.';
        messagesDiv.appendChild(message);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
      } else {
        // eslint-disable-next-line no-alert
        alert('Please enter a valid API key');
      }
    });

    // Start analysis functionality
    startAnalysisButton.addEventListener('click', () => {
      const message = document.createElement('div');
      message.className = 'message claude-message';
      message.innerHTML = '🔍 Analysis functionality will be available once the RUM chat module is properly loaded. For now, please use the main insights button in the top navigation.';
      messagesDiv.appendChild(message);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });
  }
}
