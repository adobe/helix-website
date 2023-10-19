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
  no-await-in-loop,
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
 * Renders the preview frame including the top action bar, frame view and details container
 * @param {HTMLElement} container
 */
function renderFrame(container) {
  if (!isFrameLoaded(container)) {
    const contentContainer = container.querySelector('.content');
    contentContainer.innerHTML = /* html */`
      <sp-split-view
        vertical
        resizable
        primary-size="2600"
        secondary-min="200"
        splitter-pos="250"
      >
        <div class="view">
          <div class="action-bar">
            <sp-action-group compact selects="single" selected="desktop">
              <sp-action-button value="mobile">
                  <sp-icon-device-phone slot="icon"></sp-icon-device-phone>
                  Mobile
              </sp-action-button>
              <sp-action-button value="tablet">
                  <sp-icon-device-tablet slot="icon"></sp-icon-device-tablet>
                  Tablet
              </sp-action-button>
              <sp-action-button value="desktop">
                  <sp-icon-device-desktop slot="icon"></sp-icon-device-desktop>
                  Desktop
              </sp-action-button>
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
    actionGroup.selected = 'desktop';

    // Setup listeners for the top action bar
    const frameView = container.querySelector('.frame-view');
    const mobileViewButton = removeAllEventListeners(container.querySelector('sp-action-button[value="mobile"]'));
    mobileViewButton?.addEventListener('click', () => {
      frameView.style.width = '480px';
    });

    const tabletViewButton = removeAllEventListeners(container.querySelector('sp-action-button[value="tablet"]'));
    tabletViewButton?.addEventListener('click', () => {
      frameView.style.width = '768px';
    });

    const desktopViewButton = removeAllEventListeners(container.querySelector('sp-action-button[value="desktop"]'));
    desktopViewButton?.addEventListener('click', () => {
      frameView.style.width = '100%';
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
  container,
  blockRenderer,
  defaultLibraryMetadata,
  sectionLibraryMetadata,
  pageMetadata,
) {
  const copyButton = removeAllEventListeners(container.querySelector('.content .copy-button'));
  copyButton.addEventListener('click', () => {
    const copyElement = blockRenderer.getBlockElement();
    const copyWrapper = blockRenderer.getBlockWrapper();
    const copyBlockData = blockRenderer.getBlockData();

    // Return the copied DOM in the toast message so it can be tested
    // Cannot read or write clipboard in tests
    let copiedDOM;

    // Are we trying to copy a block, a page or default content?
    // The copy operation is slightly different depending on which

    if (defaultLibraryMetadata.type === 'template' || sectionLibraryMetadata.multiSectionBlock || sectionLibraryMetadata.compoundBlock) {
      copiedDOM = copyPageToClipboard(copyWrapper, copyBlockData.url, pageMetadata);
    } else if (blockRenderer.isBlock) {
      copiedDOM = copyBlockToClipboard(
        copyWrapper,
        getBlockName(copyElement, true),
        copyBlockData.url,
      );
    } else {
      copiedDOM = copyDefaultContentToClipboard(copyWrapper, copyBlockData.url);
    }

    container.dispatchEvent(new CustomEvent('Toast', { detail: { message: 'Copied Block', result: copiedDOM } }));
  });
}

function onBlockListCopyButtonClicked(event, container) {
  const {
    blockWrapper: wrapper,
    blockNameWithVariant: name,
    blockURL,
    defaultLibraryMetadata,
    sectionLibraryMetadata,
    pageMetadata,
  } = event.detail;

  // Return the copied DOM in the toast message so it can be tested
  // Cannot read or write clipboard in tests
  let copiedDOM;

  // We may not have rendered the block yet, so we need to check for a block to know if
  // we are dealing with a block or default content
  const block = wrapper.querySelector(':scope > div:not(.section-metadata)');
  if (defaultLibraryMetadata && (defaultLibraryMetadata.type === 'template' || sectionLibraryMetadata.multiSectionBlock || sectionLibraryMetadata.compoundBlock)) {
    copiedDOM = copyPageToClipboard(wrapper, blockURL, pageMetadata);
  } else if (block) {
    copiedDOM = copyBlockToClipboard(wrapper, name, blockURL);
  } else {
    copiedDOM = copyDefaultContentToClipboard(wrapper, blockURL);
  }
  container.dispatchEvent(new CustomEvent('Toast', { detail: { message: 'Copied Block', target: wrapper, result: copiedDOM } }));
}

function loadBlock(event, container) {
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
  renderFrame(content);

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

  const blockRenderer = content.querySelector('block-renderer');

  // If the block element exists, load the block
  blockRenderer.loadBlock(
    blockName,
    blockData,
    blockWrapper,
    defaultLibraryMetadata,
    container,
  );

  // Append the path and index of the current block to the url params
  setURLParams([['path', blockData.path], ['index', event.detail.index]]);

  // Attach copy button event listener
  attachCopyButtonEventListener(
    container,
    blockRenderer,
    defaultLibraryMetadata,
    sectionLibraryMetadata,
    undefined,
  );

  // Track block view
  sampleRUM('library:blockviewed', { target: blockData.url });
}

function loadTemplate(event, container) {
  const content = container.querySelector('.block-library');
  const {
    blockWrapper,
    blockData,
    defaultLibraryMetadata,
    sectionLibraryMetadata,
    pageMetadata,
  } = event.detail;

  // Render the preview frame if we haven't already
  renderFrame(content);

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
    container,
  );

  // Append the path and index of the current block to the url params
  setURLParams([['path', blockData.path]], ['index']);

  // Attach copy button event listener
  attachCopyButtonEventListener(
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
export async function decorate(container, data) {
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
  blockList.addEventListener('LoadTemplate', loadPageEvent => loadTemplate(loadPageEvent, container));

  // Handle LoadBlock events
  blockList.addEventListener('LoadBlock', loadBlockEvent => loadBlock(loadBlockEvent, container));

  // Handle CopyBlock events from the block list
  blockList.addEventListener('CopyBlock', blockListCopyEvent => onBlockListCopyButtonClicked(blockListCopyEvent, container));

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
