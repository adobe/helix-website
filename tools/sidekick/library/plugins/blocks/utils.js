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

/* eslint-disable consistent-return, no-param-reassign */

import {
  createCopy,
  createTag, readBlockConfig, toCamelCase,
} from '../../utils/dom.js';
import { sampleRUM } from '../../utils/rum.js';

export function blockToObject(blockElement, excludes = [], convertKeys = true) {
  if (blockElement) {
    const result = {};
    const config = readBlockConfig(blockElement, convertKeys);
    Object.keys(config).forEach((key) => {
      if (excludes.includes(key)) return;

      if (convertKeys) {
        result[toCamelCase(key)] = config[key];
      } else {
        result[key] = config[key];
      }
    });

    return result;
  }
}

/**
 * Searches for a library metadata block and returns the metadata as an object.
 * @param {HTMLElement} block
 * @returns {Object} the library metadata
 */
export function getLibraryMetadata(block) {
  const libraryMetadata = block.querySelector('.library-metadata');
  if (libraryMetadata) {
    const metadata = blockToObject(libraryMetadata, ['style']);
    libraryMetadata.remove();

    return metadata;
  }
}

/**
 * Searches for a page metadata block and returns the metadata as an object.
 * @param {HTMLElement} block
 * @returns {Object} the page metadata
 */
export function getPageMetadata(block) {
  const pageMetadata = block.querySelector('.page-metadata');
  if (pageMetadata) {
    const metadata = blockToObject(pageMetadata, [], false);
    pageMetadata.remove();

    return metadata;
  }
}

/**
 * Get the default library metadata for a document.
 * @param {*} document
 * @returns
 */
export function getDefaultLibraryMetadata(document) {
  // Check for a section that just contains library metadata and nothing else
  const defaultLibraryMetadataElement = document.querySelector(':scope > div > .library-metadata:only-child');
  if (defaultLibraryMetadataElement) {
    // We found some default library metadata, store the parent element
    const parent = defaultLibraryMetadataElement.parentElement;
    const defaultLibraryMetadata = getLibraryMetadata(defaultLibraryMetadataElement.parentElement);

    // Remove the parent
    parent.remove();
    return defaultLibraryMetadata;
  }

  return {};
}

export function getBlockName(block, includeVariants = true) {
  if (!block) return;

  const classes = block.className.split(' ');
  const name = classes.shift();
  if (!includeVariants) {
    return name;
  }

  // Remove the "sidekick-library" class or any empty classes
  const filteredClasses = classes.filter(blockClass => blockClass !== 'sidekick-library' && blockClass !== '');
  return filteredClasses.length > 0 ? `${name} (${filteredClasses.join(', ')})` : name;
}

function getPreferedBackgroundColor() {
  return getComputedStyle(document.documentElement)
    .getPropertyValue('--sk-table-bg-color') || '#ff8012';
}

function getPreferedForegroundColor() {
  return getComputedStyle(document.documentElement)
    .getPropertyValue('--sk-table-fg-color') || '#ffffff';
}

export function getAuthorFriendlyName(name) {
  return name.replace(/-/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

export function convertBlockToTable(block, name, path) {
  const url = new URL(path);

  prepareIconsForCopy(block);

  const rows = [...block.children];
  const maxCols = rows.reduce(
    (cols, row) => (row.children.length > cols ? row.children.length : cols),
    0,
  );

  const table = document.createElement('table');
  table.setAttribute('border', '1');
  table.setAttribute('style', 'width:100%;');

  const headerRow = document.createElement('tr');
  headerRow.append(createTag('td', { colspan: maxCols, style: `background-color: ${getPreferedBackgroundColor()}; color: ${getPreferedForegroundColor()};` }, getAuthorFriendlyName(name)));
  table.append(headerRow);
  rows.forEach((row) => {
    const columns = [...row.children];
    const tr = document.createElement('tr');
    columns.forEach((col) => {
      const columnWidthPercentage = (1 / columns.length) * 100;
      const td = document.createElement('td');
      if (row.children.length < maxCols) {
        td.setAttribute('colspan', maxCols);
      } else {
        td.setAttribute('style', `width: ${columnWidthPercentage}%`);
      }

      prepareImagesForCopy(col, url, columnWidthPercentage);

      td.innerHTML = col.innerHTML;

      tr.append(td);
    });
    table.append(tr);
  });
  return table;
}

export function convertObjectToTable(name, object) {
  const table = document.createElement('table');
  table.setAttribute('border', '1');
  table.setAttribute('style', 'width:100%;');

  const headerRow = document.createElement('tr');
  headerRow.append(createTag('td', { colspan: 2, style: `background-color: ${getPreferedBackgroundColor()}; color: ${getPreferedForegroundColor()};` }, getAuthorFriendlyName(name)));
  table.append(headerRow);

  for (const [key, value] of Object.entries(object)) {
    const tr = document.createElement('tr');
    const keyCol = document.createElement('td');
    keyCol.setAttribute('style', 'width: 50%');
    keyCol.innerText = key;
    tr.append(keyCol);

    const valueCol = document.createElement('td');
    valueCol.setAttribute('style', 'width: 50%');
    valueCol.innerText = value;
    tr.append(valueCol);

    table.append(tr);
  }

  return table;
}

export function prepareImagesForCopy(element, url, columnWidthPercentage) {
  const blockURL = typeof url === 'string' ? new URL(url) : url;
  element.querySelectorAll('img').forEach((img) => {
    if (!img.src.includes('data:')) {
      const srcSplit = img.src.split('/');
      const mediaPath = srcSplit.pop();
      img.src = `${blockURL.origin}/${mediaPath}`;
    }

    const maxWidth = Math.min(295, (columnWidthPercentage / 100) * 540);
    const originalWidth = img.width;
    const originalHeight = img.height;

    // Calculate the aspect ratio
    const aspectRatio = originalWidth / originalHeight;

    // Calculate the new width and height based on the maximum width
    let newWidth = maxWidth;
    let newHeight = newWidth / aspectRatio;

    // Check if the new height exceeds the maximum height
    if (newHeight > maxWidth) {
      newHeight = maxWidth;
      newWidth = newHeight * aspectRatio;
    }

    img.width = newWidth;
    img.height = newHeight;
  });
}

export function prepareIconsForCopy(element) {
  element.querySelectorAll('span.icon').forEach((icon) => {
    const classNames = icon.className.split(' ');

    // Loop through each class
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < classNames.length; i++) {
      const className = classNames[i];

      // Check if the class starts with "icon-"
      if (className.startsWith('icon-')) {
        // Remove the "icon-" prefix
        const iconName = className.replace('icon-', '');
        // eslint-disable-next-line no-param-reassign
        icon.parentElement.innerHTML = icon.parentElement.innerHTML.replace(/<span\b[^>]*>(.*?)<\/span>/, `:${iconName}:`);
        break;
      }
    }
  });
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

export function parseDescription(description) {
  if (!description) return;

  return Array.isArray(description)
    ? description.map(item => `<p>${item}</p>`).join(' ')
    : description;
}

/**
 *
 * @param {*} block
 * @param {*} baseURL
 * @returns
 */
function getSectionMetadata(block, baseURL) {
  const sectionMetadata = block.querySelector(':scope > .section-metadata');
  if (sectionMetadata) {
    // Create a table for the section metadata
    return convertBlockToTable(
      sectionMetadata,
      'Section metadata',
      baseURL,
    );
  }
}

export function copyBlock(block) {
  const tables = [block];

  try {
    const blob = new Blob(tables, { type: 'text/html' });
    createCopy(blob);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Unable to copy block', error);
  }

  return block;
}

/**
 * Copies a block to the clipboard
 * @param {HTMLElement} wrapper The wrapper element
 * @param {string} name The name of the block
 * @param {string} blockURL The URL of the block
 */
export function copyBlockToClipboard(wrapper, name, blockURL) {
  // Get the first block element ignoring any section metadata blocks
  const element = wrapper.querySelector(':scope > div:not(.section-metadata)');
  let blockTable = '';

  // If the wrapper has no block, leave block table empty
  if (element) {
    blockTable = convertBlockToTable(
      element,
      name,
      blockURL,
    );
  }

  // Does the block have section metadata?
  const sectionMetadataTable = getSectionMetadata(wrapper, blockURL);
  if (sectionMetadataTable) {
    sectionMetadataTable.prepend(createTag('br'));
    blockTable.append(sectionMetadataTable);
  }

  const copied = copyBlock(blockTable.outerHTML);

  // Track block copy event
  sampleRUM('library:blockcopied', { target: blockURL });

  return copied;
}

/**
 * Copies default content to the clipboard
 * @param {HTMLElement} wrapper The wrapper element
 * @param {string} blockURL The URL of the block
 * @returns {HTMLElement} The cloned wrapper
 */
export function copyDefaultContentToClipboard(wrapper, blockURL) {
  const wrapperClone = wrapper.cloneNode(true);
  prepareIconsForCopy(wrapperClone);
  prepareImagesForCopy(wrapperClone, blockURL, 100);

  const sectionMetadataTable = getSectionMetadata(wrapperClone, blockURL);
  if (sectionMetadataTable) {
    wrapperClone.append(sectionMetadataTable);

    const sectionMetadata = wrapperClone.querySelector(':scope > .section-metadata');
    sectionMetadata.remove();
  }

  const copied = copyBlock(wrapperClone.outerHTML);

  // Track block copy event
  sampleRUM('library:blockcopied', { target: blockURL });

  return copied;
}

/**
 * Copies a page to the clipboard, pages can consist of multiple blocks,
 * default content, section metadata and metadata
 * @param {HTMLElement} wrapper The wrapper element
 * @param {string} blockURL The URL of the block
 * @returns {HTMLElement} The cloned wrapper
 */
export function copyPageToClipboard(wrapper, blockURL, pageMetadata) {
  const wrapperClone = wrapper.cloneNode(true);
  prepareIconsForCopy(wrapperClone);
  prepareImagesForCopy(wrapperClone, blockURL, 100);

  const sectionBreak = createTag('p', undefined, '---');

  // Get all section on page
  const sections = wrapperClone.querySelectorAll(':scope > div');
  sections.forEach((section, index) => {
    // If not the last section, add a section delimeter
    if (index < sections.length - 1) {
      section.insertAdjacentElement('beforeend', sectionBreak.cloneNode(true));
    }

    // Create a br element to space out tables
    const br = createTag('br');

    // Does the current section have any blocks?
    const blocks = section.querySelectorAll(':scope > div:not(.section-metadata)');
    blocks.forEach((block) => {
      // Convert the block to a table
      const blockTable = convertBlockToTable(
        block,
        getBlockName(block, true),
        blockURL,
      );

      // Insert a br after every table to add some spacing in the document
      block.parentNode.insertBefore(br.cloneNode(), block.nextSibling);

      // Replace the block with the table
      block.replaceWith(blockTable);
    });

    const sectionMetadata = section.querySelector(':scope > div.section-metadata');
    const sectionMetadataTable = getSectionMetadata(section, blockURL);
    if (sectionMetadataTable) {
      sectionMetadata.replaceWith(createTag('br'), sectionMetadataTable);
    }
  });

  if (pageMetadata) {
    const pageMetadataTable = convertObjectToTable('Metadata', pageMetadata);
    wrapperClone.append(pageMetadataTable);
  }

  const copied = copyBlock(wrapperClone.outerHTML);

  // Track block copy event
  sampleRUM('library:blockcopied', { target: blockURL });

  return copied;
}
