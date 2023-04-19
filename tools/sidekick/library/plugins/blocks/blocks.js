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

/* eslint-disable no-await-in-loop, no-param-reassign, consistent-return */

import { createCopy, createTag, getMetadata } from '../../utils/dom.js';

function getAuthorName(block) {
  const authorNameTags = ['H2', 'H3'];
  const blockSib = block.previousElementSibling;
  if (!blockSib) return null;
  if (authorNameTags.includes(blockSib.nodeName)) {
    return blockSib.textContent;
  }
  const nextSib = blockSib.previousElementSibling;
  if (!nextSib) return null;
  if (authorNameTags.includes(nextSib.nodeName)) {
    return nextSib.textContent;
  }

  return null;
}

function getBlockDescription(block) {
  const descriptionTag = 'P';
  const blockSib = block.previousElementSibling;
  if (!blockSib) return null;
  if (blockSib.nodeName === descriptionTag) {
    return blockSib.textContent;
  }
  return null;
}

function getBlockName(block) {
  const classes = block.className.split(' ');
  const name = classes.shift();
  return classes.length > 0 ? `${name} (${classes.join(', ')})` : name;
}

function getTable(block, name, path) {
  const url = new URL(path);
  block.querySelectorAll('img').forEach((img) => {
    const srcSplit = img.src.split('/');
    const mediaPath = srcSplit.pop();
    img.src = `${url.origin}/${mediaPath}`;
    const { width, height } = img;
    const ratio = width > 200 ? 200 / width : 1;
    img.width = width * ratio;
    img.height = height * ratio;
  });
  const rows = [...block.children];
  const maxCols = rows.reduce(
    (cols, row) => (row.children.length > cols ? row.children.length : cols),
    0,
  );
  const table = document.createElement('table');
  table.setAttribute('border', '1');

  const backgroundColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--sk-table-bg-color') || '#ff8012';

  const foregroundColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--sk-table-fg-color') || '#ffffff';

  const headerRow = document.createElement('tr');
  headerRow.append(createTag('td', { colspan: maxCols, style: `background-color: ${backgroundColor}; color: ${foregroundColor};  height:23px;` }, name));
  table.append(headerRow);
  rows.forEach((row) => {
    const tr = document.createElement('tr');
    [...row.children].forEach((col) => {
      const td = document.createElement('td');
      if (row.children.length < maxCols) {
        td.setAttribute('colspan', maxCols);
      }
      td.innerHTML = col.innerHTML;
      tr.append(td);
    });
    table.append(tr);
  });
  return table.outerHTML;
}

function getBlockTags(block) {
  const blockName = getAuthorName(block) || getBlockName(block);
  if (block.nextElementSibling?.className !== 'library-metadata') {
    return blockName;
  }
  const libraryMetadata = getMetadata(block.nextElementSibling);
  return libraryMetadata?.searchtags?.text
    ? `${libraryMetadata?.searchtags?.text} ${blockName}`
    : blockName;
}

function isMatchingBlock(pageBlock, query) {
  const tagsString = getBlockTags(pageBlock);
  if (!query || !tagsString) return false;
  const searchTokens = query.split(' ');
  return searchTokens.every(token => tagsString.toLowerCase().includes(token.toLowerCase()));
}

function renderNoResults() {
  return /* html */`
    <div class="message-container">
        <sp-illustrated-message
        heading="No results"
        description="Try another search"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 150 103"
                width="150"
                height="103"
                viewBox="0 0 150 103"
            >
                <path
                    d="M133.7,8.5h-118c-1.9,0-3.5,1.6-3.5,3.5v27c0,0.8,0.7,1.5,1.5,1.5s1.5-0.7,1.5-1.5V23.5h119V92c0,0.3-0.2,0.5-0.5,0.5h-118c-0.3,0-0.5-0.2-0.5-0.5V69c0-0.8-0.7-1.5-1.5-1.5s-1.5,0.7-1.5,1.5v23c0,1.9,1.6,3.5,3.5,3.5h118c1.9,0,3.5-1.6,3.5-3.5V12C137.2,10.1,135.6,8.5,133.7,8.5z M15.2,21.5V12c0-0.3,0.2-0.5,0.5-0.5h118c0.3,0,0.5,0.2,0.5,0.5v9.5H15.2z M32.6,16.5c0,0.6-0.4,1-1,1h-10c-0.6,0-1-0.4-1-1s0.4-1,1-1h10C32.2,15.5,32.6,15.9,32.6,16.5z M13.6,56.1l-8.6,8.5C4.8,65,4.4,65.1,4,65.1c-0.4,0-0.8-0.1-1.1-0.4c-0.6-0.6-0.6-1.5,0-2.1l8.6-8.5l-8.6-8.5c-0.6-0.6-0.6-1.5,0-2.1c0.6-0.6,1.5-0.6,2.1,0l8.6,8.5l8.6-8.5c0.6-0.6,1.5-0.6,2.1,0c0.6,0.6,0.6,1.5,0,2.1L15.8,54l8.6,8.5c0.6,0.6,0.6,1.5,0,2.1c-0.3,0.3-0.7,0.4-1.1,0.4c-0.4,0-0.8-0.1-1.1-0.4L13.6,56.1z"
                ></path>
            </svg>
        </sp-illustrated-message>
    </div>
    `;
}

export async function fetchBlock(path) {
  if (!window.blocks) {
    window.blocks = {};
  }
  if (!window.blocks[path]) {
    const resp = await fetch(`${path}.plain.html`);
    if (!resp.ok) return;

    const html = await resp.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    window.blocks[path] = doc;
  }

  return window.blocks[path];
}

function onPreview(event, path) {
  event.stopPropagation();
  window.open(path, '_blockpreview');
}

/**
 * Called when a user tries to load the plugin
 * @param {HTMLElement} container The container to render the plugin in
 * @param {Object} data The data contained in the plugin sheet
 * @param {String} query If search is active, the current search query
 */
export async function decorate(container, data, query) {
  container.dispatchEvent(new CustomEvent('ShowLoader'));
  const sideNav = createTag('sp-sidenav', { variant: 'multilevel', 'data-testid': 'blocks' });
  for (const block of data) {
    const blockVariant = createTag('sp-sidenav-item', { label: block.name, preview: true });
    sideNav.append(blockVariant);

    blockVariant.addEventListener('Preview', e => onPreview(e, block.path));

    const doc = await fetchBlock(block.path);
    const pageBlocks = doc.body.querySelectorAll('div[class]');

    pageBlocks.forEach((pageBlock) => {
      // don't display the library-metadata block used to set the block search tags
      if (pageBlock.className === 'library-metadata') {
        return;
      }
      const blockName = getAuthorName(pageBlock) || getBlockName(pageBlock);
      const blockDescription = getBlockDescription(pageBlock);

      const childNavItem = createTag('sp-sidenav-item', { label: blockName, 'data-testid': 'item' });
      blockVariant.append(childNavItem);

      if (blockDescription) {
        childNavItem.setAttribute('data-info', blockDescription);
      }

      childNavItem.addEventListener('click', () => {
        const table = getTable(pageBlock, getBlockName(pageBlock), block.path);
        const blob = new Blob([table], { type: 'text/html' });
        createCopy(blob);

        // Show toast
        container.dispatchEvent(new CustomEvent('Toast', { detail: { message: 'Copied Block' } }));
      });

      if (query) {
        if (isMatchingBlock(pageBlock, query)) {
          blockVariant.setAttribute('expanded', true);
        } else {
          blockVariant.removeChild(childNavItem);
        }
      }
    });

    // Is we are searching and no blockVariants matched, remove the block
    if (query && !blockVariant.getAttribute('expanded')) {
      blockVariant.remove();
    }
  }

  // Show blocks and hide loader
  container.append(sideNav);
  container.dispatchEvent(new CustomEvent('HideLoader'));

  if (sideNav.querySelectorAll('sp-sidenav-item').length === 0) {
    container.innerHTML = renderNoResults();
  }
}

export default {
  title: 'Blocks',
  searchEnabled: true,
};
