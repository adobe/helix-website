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
  copyBlock,
  getBlockName,
  getTable,
  parseDescription,
} from './utils.js';
import {
  createTag,
} from '../../utils/dom.js';

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

function renderFrameSplitContainer() {
  return /* html */`
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
          <h3 class="block-title"></h3>
          <div class="actions">
              <sp-button class="copy-button">Copy Block</sp-button>
          </div>
        </div>
        <sp-divider size="s"></sp-divider>
        <div class="details"></div>
      </div>
    </sp-split-view>
  `;
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
  let frameLoaded = false;

  const blockList = createTag('block-list');
  listContainer.append(blockList);

  await blockList.loadBlocks(data, container);

  blockList.addEventListener('PreviewBlock', (e) => {
    window.open(e.details.path, '_blockpreview');
  });

  blockList.addEventListener('LoadBlock', (e) => {
    const {
      blockWrapper,
      blockData,
      sectionLibraryMetadata,
      defaultLibraryMetadata,
    } = e.detail;

    const blockElement = blockWrapper.querySelector('div[class]');
    const blockName = getBlockName(blockElement, false);
    const authoredBlockName = sectionLibraryMetadata.name ?? getBlockName(blockElement);

    // Pull the description for this block,
    // first from sectionLibraryMetadata and fallback to defaultLibraryMetadata
    const { description: sectionDescription } = sectionLibraryMetadata;
    const blockDescription = sectionDescription
      ? parseDescription(sectionDescription)
      : parseDescription(defaultLibraryMetadata.description);

    if (!frameLoaded) {
      const contentContainer = content.querySelector('.content');
      contentContainer.innerHTML = renderFrameSplitContainer();

      const actionGroup = content.querySelector('sp-action-group');
      actionGroup.selected = 'desktop';
      frameLoaded = true;
    }

    // Set block title
    const blockTitle = content.querySelector('.block-title');
    blockTitle.textContent = authoredBlockName;

    // Set block description
    const details = content.querySelector('.details');
    details.innerHTML = '';
    if (blockDescription) {
      const description = createTag('p', {}, blockDescription);
      details.append(description);
    }

    const blockRenderer = content.querySelector('block-renderer');

    blockRenderer.loadBlock(
      blockName,
      blockData,
      blockWrapper,
      container,
    );

    const copyButton = content.querySelector('.copy-button');
    copyButton?.addEventListener('click', () => {
      const copyElement = blockRenderer.getBlockElement();
      const copyWrapper = blockRenderer.getBlockWrapper();
      const copyBlockData = blockRenderer.getBlockData();

      const blockTable = getTable(
        copyElement,
        getBlockName(copyElement, true),
        copyBlockData.url,
      );

      // Does the block have section metadata?
      let sectionMetadataTable;
      const sectionMetadata = copyWrapper.querySelector('.section-metadata');
      if (sectionMetadata) {
      // Create a table for the section metadata
        sectionMetadataTable = getTable(
          sectionMetadata,
          'section-metadata',
          blockData.url,
        );
      }

      copyBlock(blockTable, sectionMetadataTable);
      container.dispatchEvent(new CustomEvent('Toast', { detail: { message: 'Copied Block' } }));
    });

    const frameView = content.querySelector('.frame-view');
    const mobileViewButton = content.querySelector('sp-action-button[value="mobile"]');
    mobileViewButton?.addEventListener('click', () => {
      frameView.style.width = '480px';
    });

    const tabletViewButton = content.querySelector('sp-action-button[value="tablet"]');
    tabletViewButton?.addEventListener('click', () => {
      frameView.style.width = '768px';
    });

    const desktopViewButton = content.querySelector('sp-action-button[value="desktop"]');
    desktopViewButton?.addEventListener('click', () => {
      frameView.style.width = '100%';
    });
  });

  blockList.addEventListener('CopyBlock', (e) => {
    const { blockWrapper: wrapper, blockNameWithVariant: name, blockURL } = e.detail;

    const blockTable = getTable(
      wrapper.querySelector('div[class]'),
      name,
      blockURL,
    );

    // Does the block have section metadata?
    let sectionMetadataTable;
    const sectionMetadata = wrapper.querySelector('.section-metadata');
    if (sectionMetadata) {
      // Create a table for the section metadata
      sectionMetadataTable = getTable(
        sectionMetadata,
        'section-metadata',
        blockURL,
      );
    }

    copyBlock(blockTable, sectionMetadataTable);

    // Show toast
    container.dispatchEvent(new CustomEvent('Toast', { detail: { message: 'Copied Block' } }));
  });

  const search = content.querySelector('sp-search');
  search.addEventListener('input', (e) => {
    blockList.filterBlocks(e.target.value);
  });

  // Show blocks and hide loader
  container.dispatchEvent(new CustomEvent('HideLoader'));
}

export default {
  title: 'Blocks',
  searchEnabled: false,
};
