// Import RUM chat analysis functionality
import {
  runCompleteRumAnalysis,
// eslint-disable-next-line import/no-unresolved, import/no-relative-packages
} from '../../../blocks/rum-chat/rum-chat.js';

// Import PDF export functionality
// eslint-disable-next-line import/no-unresolved, import/no-relative-packages
import { generatePDFReport, downloadAsText } from '../../../blocks/rum-chat/pdf-export.js';

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
    // Load RUM chat CSS for proper styling
    if (!document.querySelector('#rum-chat-styles')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/blocks/rum-chat/rum-chat.css';
      link.id = 'rum-chat-styles';
      document.head.appendChild(link);
    }

    // Set analysis tile height to match viewport like the left side graph
    this.elems.analysisTile.style.height = 'calc(100vh - 200px)'; // Adjust for header space
    this.elems.analysisTile.style.display = 'flex';
    this.elems.analysisTile.style.flexDirection = 'column';
    this.elems.analysisTile.style.overflow = 'hidden'; // No scrolling on the tile itself

    // Create the same RUM chat interface that appears in the sidebar
    if (!this.elems.analysisTile.querySelector('.chat-interface')) {
      // Create the interface structure directly
      const chatInterface = document.createElement('div');
      chatInterface.className = 'chat-interface';
      chatInterface.style.display = 'flex';
      chatInterface.style.flexDirection = 'column';
      chatInterface.style.height = '100%';

      // Check if API key exists to customize welcome message
      const existingApiKey = localStorage.getItem('anthropicApiKey');
      const welcomeMessage = existingApiKey
        ? '👋 Hey there! What would you like to discover about your site today? Start with a quick summary or dive deep with a comprehensive analysis.'
        : '🤖 Welcome to OpTel Detective! Enter your Anthropic API key below to start analyzing the site data.';

      chatInterface.innerHTML = `
        <div class="chat-header" style="flex-shrink: 0;">
          <h2>OpTel Detective</h2>
          <div class="header-buttons">
            <button class="download-button" disabled title="Download insights as PDF (available after analysis)">📄 Download as PDF</button>
          </div>
        </div>
        <div id="messages" class="messages" style="flex: 1; overflow-y: auto; max-height: none;">
          <div class="message claude-message" id="welcome-message">
            ${welcomeMessage}
          </div>
        </div>
      `;

      // Create API key section separately and append it at the end
      const apiKeySection = document.createElement('div');
      apiKeySection.id = 'api-key-section';
      apiKeySection.className = 'api-key-section';
      apiKeySection.style.marginTop = '15px';
      apiKeySection.style.borderTop = '1px solid #e0e0e0';
      apiKeySection.style.paddingTop = '15px';
      apiKeySection.style.flexShrink = '0'; // Don't shrink the API key section
      apiKeySection.innerHTML = `
        <div class="api-key-input">
          <label for="api-key">Enter Anthropic API Key:</label>
          <input type="password" id="api-key" placeholder="sk-ant-...">
          <button id="save-api-key">Save Key</button>
        </div>
        <div class="analysis-section" style="display: none;">
          <div class="analysis-options" style="display: flex; flex-direction: column; gap: 12px;">
            <label style="display: flex; align-items: center; font-size: 14px; color: var(--gray-700); cursor: pointer;">
              <input type="checkbox" id="detailed-analysis" style="margin-right: 8px;">
              Detailed site analysis (more comprehensive)
            </label>
            <button id="start-analysis" class="primary-button" style="padding: 10px 16px; background: linear-gradient(135deg, var(--light-green) 0%, var(--medium-green) 100%); color: var(--dark-green); border: none; border-radius: 6px; cursor: pointer; font-size: 14px; width: 100%; text-align: center; font-weight: 600;">📊 Show Insights (executive summary)</button>
          </div>
        </div>
      `;

      // Append the chat interface first, then the API key section at the bottom
      this.elems.analysisTile.appendChild(chatInterface);
      this.elems.analysisTile.appendChild(apiKeySection);

      // Add basic functionality
      this.setupAnalysisInterface(chatInterface);
    }
  }

  setupAnalysisInterface(chatInterface) {
    // API key section is now separate from chatInterface, so look in the parent analysisTile
    const apiKeyInput = this.elems.analysisTile.querySelector('#api-key');
    const saveApiKeyButton = this.elems.analysisTile.querySelector('#save-api-key');
    const analysisSection = this.elems.analysisTile.querySelector('.analysis-section');
    const startAnalysisButton = this.elems.analysisTile.querySelector('#start-analysis');
    const detailedAnalysisCheckbox = this.elems.analysisTile.querySelector('#detailed-analysis');
    const messagesDiv = chatInterface.querySelector('#messages');
    const downloadButton = chatInterface.querySelector('.download-button');

    // Store reference to the chat interface in the class
    this.elems.chatInterface = chatInterface;

    // Load saved analysis mode preference
    const savedDeepMode = localStorage.getItem('rumChatDeepMode') === 'true';
    detailedAnalysisCheckbox.checked = savedDeepMode;
    // Trigger change event to update button appearance
    detailedAnalysisCheckbox.dispatchEvent(new Event('change'));

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

        // Update the welcome message instead of adding a new one
        const welcomeMessage = messagesDiv.querySelector('#welcome-message');
        if (welcomeMessage) {
          welcomeMessage.innerHTML = '👋 Hey there! What would you like to discover about your site today? Start with a quick summary or dive deep with a comprehensive analysis.';
        }
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
      } else {
        // eslint-disable-next-line no-alert
        alert('Please enter a valid API key');
      }
    });

    // Handle checkbox change to update button text and save state
    detailedAnalysisCheckbox.addEventListener('change', () => {
      const isDetailed = detailedAnalysisCheckbox.checked;

      // Save analysis mode to localStorage (same key as main rum-chat)
      localStorage.setItem('rumChatDeepMode', isDetailed.toString());
      console.log(`[Sidebar Analysis] Deep mode: ${isDetailed ? 'ENABLED' : 'DISABLED'}`);

      if (isDetailed) {
        startAnalysisButton.textContent = '🔍 Show Insights (Comprehensive Report)';
        startAnalysisButton.style.background = 'linear-gradient(135deg, var(--medium-green) 0%, var(--dark-green) 100%)';
        startAnalysisButton.style.color = 'white';
      } else {
        startAnalysisButton.textContent = '📊 Show Insights (Executive Summary)';
        startAnalysisButton.style.background = 'linear-gradient(135deg, var(--light-green) 0%, var(--medium-green) 100%)';
        startAnalysisButton.style.color = 'var(--dark-green)';
      }
    });

    // Start analysis functionality
    startAnalysisButton.addEventListener('click', async () => {
      const apiKey = localStorage.getItem('anthropicApiKey');
      if (!apiKey) {
        const message = document.createElement('div');
        message.className = 'message claude-message';
        message.innerHTML = '❌ Please save your API key first.';
        messagesDiv.appendChild(message);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        return;
      }

      const isDetailed = detailedAnalysisCheckbox.checked;
      const originalText = startAnalysisButton.textContent;

      startAnalysisButton.disabled = true;
      startAnalysisButton.textContent = 'Analyzing...';

      const apiKeySection = this.elems.analysisTile.querySelector('.api-key-section');

      try {
        // Call the complete original RUM analysis function directly
        await runCompleteRumAnalysis(messagesDiv, downloadButton, apiKeySection);

        // Analysis complete - result is displayed by the function itself
        console.log(`[Sidebar Analysis] ${isDetailed ? 'Detailed' : 'Executive'} analysis completed successfully`);
      } catch (error) {
        console.error('[Sidebar Analysis] Error:', error);
        // Error messages are already displayed by the function
      } finally {
        startAnalysisButton.disabled = false;
        startAnalysisButton.textContent = originalText;
      }
    });

    // Download functionality using the PDF export module
    downloadButton.addEventListener('click', () => {
      // Look for analysis content in various possible containers
      const analysisContent = chatInterface.querySelector('.analysis-content')
        || chatInterface.querySelector('.message.claude-message:last-child')
        || chatInterface.querySelector('#messages .message:last-child');

      if (analysisContent) {
        // Get the content (HTML or text)
        const contentHtml = analysisContent.innerHTML || '';
        const contentText = analysisContent.textContent || '';
        const finalContent = contentHtml.trim() || contentText.trim();

        if (finalContent) {
          // Try to get URL from the dashboard or current page
          const urlInput = document.querySelector('#url');
          const currentUrl = urlInput ? urlInput.value.trim() : window.location.hostname;

          // Use the modular PDF export function with fallback and HTML preservation
          const success = generatePDFReport(finalContent, {
            url: currentUrl,
            title: `OpTel Detective Analysis - ${currentUrl || 'Dashboard'}`,
            debug: false,
            preserveHtml: true, // Keep HTML formatting for better structure
          });

          if (!success) {
            console.warn('[Facet Sidebar] PDF generation failed, using text download fallback');
            // Fallback to simple text download
            const filename = `rum-analysis-${new Date().toISOString().split('T')[0]}`;
            downloadAsText(finalContent, filename);
          }
        } else {
          // eslint-disable-next-line no-alert
          alert('No analysis content available for download.');
        }
      } else {
        // eslint-disable-next-line no-alert
        alert('No analysis content found. Please run an analysis first.');
      }
    });
  }
}
