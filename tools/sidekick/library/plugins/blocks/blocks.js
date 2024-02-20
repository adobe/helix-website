/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

/* eslint-disable
  no-param-reassign,
  consistent-return,
  no-plusplus,
  no-prototype-builtins */

import {
  getBlockName,
  parseDescription,
  copyBlockToClipboard,
  copyPageToClipboard,
  copyDefaultContentToClipboard,
  getBlockTableStyle,
} from './utils.js';
import {
  createTag, removeAllEventListeners, setURLParams,
} from '../../utils/dom.js';
import { sampleRUM } from '../../utils/rum.js';

/**
 * Renders the scaffolding for the block plugin
 * @returns {String} HTML string
 */
function renderScaffolding() {
  return /* html */`
    <sp-split-view 
        primary-size="350" 
        dir="ltr" 
        splitter-pos="250"
        resizable
      >
      <div class="menu">
        <div class="search">
          <sp-search></sp-search>
        </div>
        <div class="list-container">
        </div>
      </div>
      <div class="content">
      </div>
    </sp-split-view>
  `;
}

/**
 * Supported structures for the configuration is a list of objects like the below
 * default or a shorthand list of two breakpoints which gets merged into the default.
 * [600, 900] will overwrite the default sizes with '599px' and '899px' as breakpoints.
 *
 * @param {*} contextViewPorts project specific config object
 * @returns viewport options
 */
function getViewPorts(contextViewPorts) {
  const viewPorts = [
    {
      width: '599px',
      label: 'Mobile',
      icon: 'device-phone',
    },
    {
      width: '899px',
      label: 'Tablet',
      icon: 'device-tablet',
    },
    {
      width: '100%',
      label: 'Desktop',
      icon: 'device-desktop',
      default: true,
    },
  ];
  if (contextViewPorts && contextViewPorts.length > 0) {
    if (contextViewPorts.length === 2
        && contextViewPorts.every(breakpoint => Number.isInteger(breakpoint))) {
      for (let i = 0; i < 2; i += 1) {
        viewPorts[i].width = `${contextViewPorts[i] - 1}px`;
      }
    } else {
      return contextViewPorts;
    }
  }
  return viewPorts;
}

/**
 * Renders the preview frame including the top action bar, frame view and details container
 * @param {HTMLElement} container
 */
function renderFrame(contextViewPorts, container) {
  if (!isFrameLoaded(container)) {
    const viewPorts = getViewPorts(contextViewPorts);
    const viewPortsHTML = viewPorts.map((viewPort, index) => /* html */`
      <sp-action-button value="viewPort${index}">
        <sp-icon-${viewPort.icon} slot="icon"></sp-icon-${viewPort.icon}>
          ${viewPort.label}
        </sp-action-button>
    `).join('');
    const selectedViewPortIndex = viewPorts.findIndex(viewPort => viewPort.default);

    const contentContainer = container.querySelector('.content');
    contentContainer.innerHTML = /* html */`
      <sp-split-view
        vertical
        resizable
        collapsible
        primary-size="2600"
        secondary-min="200"
        splitter-pos="250"
      >
        <div class="view">
          <div class="action-bar">
            <sp-action-group compact selects="single" selected="viewPort${selectedViewPortIndex}">
              ${viewPortsHTML}
            </sp-action-group>
            <sp-divider size="s"></sp-divider>
          </div>
          <div class="frame-view">
            <block-renderer></block-renderer>
          </div>
        </div>
        <div class="details-container">
          <div class="action-bar">
            <h3 class="title"></h3>
            <div class="actions">
                <sp-button class="copy-button">Copy</sp-button>
            </div>
          </div>
          <sp-divider size="s"></sp-divider>
          <div class="details"></div>
        </div>
      </sp-split-view>
    `;

    const actionGroup = container.querySelector('sp-action-group');
    actionGroup.selected = `viewPort${selectedViewPortIndex}`;

    const frameView = container.querySelector('.frame-view');
    frameView.style.width = viewPorts[selectedViewPortIndex].width;

    [...container.querySelectorAll('sp-action-button')].forEach((button, index) => {
      const buttonClone = removeAllEventListeners(button);
      buttonClone?.addEventListener('click', () => {
        frameView.style.width = viewPorts[index].width;
      });
    });
  }
}

/**
 * Checks if the preview frame has been loaded yet
 * @param {HTMLElement} container The container that hosts the preview frame
 * @returns {Boolean} True if the frame has been loaded, false otherwise
 */
function isFrameLoaded(container) {
  return container.querySelector('.details-container') !== null;
}

/**
 * Updates the details container with the block title and description
 * @param {HTMLElement} container The container containing the details container
 * @param {String} title The title of the block
 * @param {String} description The description of the block
 */
function updateDetailsContainer(container, title, description) {
  // Set block title
  const blockTitle = container.querySelector('.action-bar .title');
  blockTitle.textContent = title;

  // Set block description
  const details = container.querySelector('.details');
  details.innerHTML = '';
  if (description) {
    const descriptionElement = createTag('p', {}, description);
    details.append(descriptionElement);
  }
}

/**
 * Attaches an event listener to the copy button in the preview UI
 * @param {HTMLElement} container The container containing the copy button
 * @param {HTMLElement} blockRenderer The block renderer
 * @param {Object} defaultLibraryMetadata The default library metadata
 * @param {Object} pageMetadata The page metadata
 */
function attachCopyButtonEventListener(
  context,
  container,
  blockRenderer,
  defaultLibraryMetadata,
  sectionLibraryMetadata,
  pageMetadata,
) {
  const copyButton = removeAllEventListeners(container.querySelector('.content .copy-button'));
  copyButton.addEventListener('click', async () => {
    const copyElement = blockRenderer.getBlockElement();
    const copyWrapper = blockRenderer.getBlockWrapper();
    const copyBlockData = blockRenderer.getBlockData();

    // Are we trying to copy a block, a page or default content?
    // The copy operation is slightly different depending on which
    if (defaultLibraryMetadata.type === 'template' || sectionLibraryMetadata.multiSectionBlock || sectionLibraryMetadata.compoundBlock) {
      await copyPageToClipboard(
        context,
        copyWrapper,
        copyBlockData.url,
        pageMetadata,
      );
    } else if (blockRenderer.isBlock) {
      const tableStyle = getBlockTableStyle(defaultLibraryMetadata, sectionLibraryMetadata);
      await copyBlockToClipboard(
        context,
        copyWrapper,
        getBlockName(copyElement, true),
        copyBlockData.url,
        tableStyle,
      );
    } else {
      await copyDefaultContentToClipboard(context, copyWrapper, copyBlockData.url);
    }

    container.dispatchEvent(new CustomEvent('Toast', { detail: { message: 'Copied Block' } }));
  });
}

async function onBlockListCopyButtonClicked(context, event, container) {
  const {
    blockWrapper: wrapper,
    blockNameWithVariant: name,
    blockURL,
    defaultLibraryMetadata,
    sectionLibraryMetadata,
    pageMetadata,
  } = event.detail;

  // We may not have rendered the block yet, so we need to check for a block to know if
  // we are dealing with a block or default content
  const block = wrapper.querySelector(':scope > div:not(.section-metadata)');
  if (defaultLibraryMetadata && (defaultLibraryMetadata.type === 'template' || sectionLibraryMetadata.multiSectionBlock || sectionLibraryMetadata.compoundBlock)) {
    await copyPageToClipboard(context, wrapper, blockURL, pageMetadata);
  } else if (block) {
    const tableStyle = getBlockTableStyle(defaultLibraryMetadata, sectionLibraryMetadata);
    await copyBlockToClipboard(context, wrapper, name, blockURL, tableStyle);
  } else {
    await copyDefaultContentToClipboard(context, wrapper, blockURL);
  }
  container.dispatchEvent(new CustomEvent('Toast', { detail: { message: 'Copied Block', target: wrapper } }));
}

function loadBlock(context, event, container) {
  const content = container.querySelector('.block-library');
  const {
    blockWrapper,
    blockData,
    sectionLibraryMetadata,
    defaultLibraryMetadata,
  } = event.detail;
  // Block element (first child of the wrapper)
  const blockElement = blockWrapper.querySelector('div[class]');

  // The name of the block (first column of the table)
  const blockName = getBlockName(blockElement, false);

  // Render the preview frame if we haven't already
  renderFrame(context.viewPorts, content);

  // For blocks we pull the block name from section metadata or the name given to the block
  const authoredBlockName = sectionLibraryMetadata.name ?? getBlockName(blockElement);

  // Pull the description for this block,
  // first from sectionLibraryMetadata and fallback to defaultLibraryMetadata
  const { description: sectionDescription } = sectionLibraryMetadata;
  const blockDescription = sectionDescription
    ? parseDescription(sectionDescription)
    : parseDescription(defaultLibraryMetadata.description);

  // Set block title & description in UI
  updateDetailsContainer(content, authoredBlockName, blockDescription);

  const disableCopyButton = sectionLibraryMetadata.disablecopy
    ?? defaultLibraryMetadata.disablecopy
    ?? false;

  const copyButton = container.querySelector('.content .copy-button');
  copyButton.removeAttribute('disabled');
  if (disableCopyButton) {
    copyButton.setAttribute('disabled', 'true');
  }

  const hideDetailsView = sectionLibraryMetadata.hidedetailsview
  ?? defaultLibraryMetadata.hidedetailsview
  ?? context.hidedetailsview
  ?? false;

  const splitView = container.querySelector('.content sp-split-view');
  splitView.primarySize = hideDetailsView ? '100%' : '75%';

  const blockRenderer = content.querySelector('block-renderer');

  // If the block element exists, load the block
  blockRenderer.loadBlock(
    blockName,
    blockData,
    blockWrapper,
    defaultLibraryMetadata,
    sectionLibraryMetadata,
    container,
  );

  // Append the path and index of the current block to the url params
  setURLParams([['path', blockData.path], ['index', event.detail.index]]);

  // Attach copy button event listener
  attachCopyButtonEventListener(
    context,
    container,
    blockRenderer,
    defaultLibraryMetadata,
    sectionLibraryMetadata,
    undefined,
  );

  // Track block view
  sampleRUM('library:blockviewed', { target: blockData.url });
}

function loadTemplate(context, event, container) {
  const content = container.querySelector('.block-library');
  const {
    blockWrapper,
    blockData,
    defaultLibraryMetadata,
    sectionLibraryMetadata,
    pageMetadata,
  } = event.detail;

  // Render the preview frame if we haven't already
  renderFrame(context.viewPorts, content);

  // For templates we pull the template name from default library metadata
  // or the name given to the document in the library sheet.
  const authoredTemplateName = defaultLibraryMetadata.name ?? blockData.name;

  // Pull the description for this page from default metadata.
  const templateDescription = parseDescription(defaultLibraryMetadata.description);

  // Set template title & description in UI
  updateDetailsContainer(content, authoredTemplateName, templateDescription);

  const blockRenderer = content.querySelector('block-renderer');

  // If the block element exists, load the block
  blockRenderer.loadBlock(
    '',
    blockData,
    blockWrapper,
    defaultLibraryMetadata,
    sectionLibraryMetadata,
    container,
  );

  // Append the path and index of the current block to the url params
  setURLParams([['path', blockData.path]], ['index']);

  // Attach copy button event listener
  attachCopyButtonEventListener(
    context,
    container,
    blockRenderer,
    defaultLibraryMetadata,
    sectionLibraryMetadata,
    pageMetadata,
  );

  // Track block view
  sampleRUM('library:blockviewed', { target: blockData.url });
}

/**
 * Called when a user tries to load the plugin
 * @param {HTMLElement} container The container to render the plugin in
 * @param {Object} data The data contained in the plugin sheet
 */
export async function decorate(container, data, searchTerm, context) {
  container.dispatchEvent(new CustomEvent('ShowLoader'));

  const content = createTag('div', { class: 'block-library' }, renderScaffolding());
  container.append(content);
  const listContainer = content.querySelector('.list-container');

  const blockList = createTag('block-list');
  listContainer.append(blockList);

  blockList.addEventListener('PreviewBlock', (e) => {
    window.open(e.details.path, '_blockpreview');
  });

  // Handle LoadTemplate events
  blockList.addEventListener('LoadTemplate', loadPageEvent => loadTemplate(context, loadPageEvent, container));

  // Handle LoadBlock events
  blockList.addEventListener('LoadBlock', loadBlockEvent => loadBlock(context, loadBlockEvent, container));

  // Handle CopyBlock events from the block list
  blockList.addEventListener('CopyBlock', blockListCopyEvent => onBlockListCopyButtonClicked(context, blockListCopyEvent, container));

  const search = content.querySelector('sp-search');
  search.addEventListener('input', (e) => {
    blockList.filterBlocks(e.target.value);
  });

  await blockList.loadBlocks(data, container);

  // Show blocks and hide loader
  container.dispatchEvent(new CustomEvent('HideLoader'));
}

export default {
  title: 'Blocks',
  searchEnabled: false,
};
