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
  createTag, readBlockConfig, toCamelCase, isPath,
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

export function getPreferedBackgroundColor(blockName) {
  const defaultBackgroundColor = '#ff8012';
  if (blockName === 'Section Metadata') {
    return getComputedStyle(document.documentElement)
      .getPropertyValue('--sk-section-metadata-table-background-color') || defaultBackgroundColor;
  }

  if (blockName === 'Metadata') {
    return getComputedStyle(document.documentElement)
      .getPropertyValue('--sk-metadata-table-background-color') || defaultBackgroundColor;
  }

  return getComputedStyle(document.documentElement)
    .getPropertyValue('--sk-block-table-background-color') || defaultBackgroundColor;
}

export function getPreferedForegroundColor(blockName) {
  const defaultForegroundColor = '#ffffff';
  if (blockName === 'Section Metadata') {
    return getComputedStyle(document.documentElement)
      .getPropertyValue('--sk-section-metadata-table-foreground-color') || defaultForegroundColor;
  }

  if (blockName === 'Metadata') {
    return getComputedStyle(document.documentElement)
      .getPropertyValue('--sk-metadata-table-foreground-color') || defaultForegroundColor;
  }

  return getComputedStyle(document.documentElement)
    .getPropertyValue('--sk-block-table-foreground-color') || defaultForegroundColor;
}

export function normalizeBlockName(name) {
  // eslint-disable-next-line no-confusing-arrow
  return name.replace(/-/g, ' ').replace(/(\b\w+)|(?:\([^)]*\))/g, (match, p1) => p1 ? p1.charAt(0).toUpperCase() + p1.slice(1) : match);
}

export async function convertBlockToTable(context, block, name, path, tableStyle) {
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
  const blockName = normalizeBlockName(name);
  headerRow.append(createTag('td', { colspan: maxCols, style: `background-color: ${tableStyle?.tableHeaderBackgroundColor || getPreferedBackgroundColor(blockName)}; color: ${tableStyle?.tableHeaderForegroundColor || getPreferedForegroundColor(blockName)};` }, blockName));
  table.append(headerRow);
  for (const row of rows) {
    const columns = [...row.children];
    const tr = document.createElement('tr');
    for (const col of columns) {
      const columnWidthPercentage = (1 / columns.length) * 100;
      const td = document.createElement('td');
      if (row.children.length < maxCols) {
        td.setAttribute('colspan', maxCols);
      } else {
        td.setAttribute('style', `width: ${columnWidthPercentage}%`);
      }

      if (col.hasAttribute('data-align')) {
        td.setAttribute('data-align', col.getAttribute('data-align'));
      }

      if (col.hasAttribute('data-valign')) {
        td.setAttribute('data-valign', col.getAttribute('data-valign'));
      }

      await prepareImagesForCopy(context, col, url, columnWidthPercentage);

      td.innerHTML = col.innerHTML;

      tr.append(td);
    }
    table.append(tr);
  }

  return table;
}

export function convertObjectToTable(name, object) {
  const table = document.createElement('table');
  table.setAttribute('border', '1');
  table.setAttribute('style', 'width:100%;');

  const headerRow = document.createElement('tr');
  const blockName = normalizeBlockName(name);
  headerRow.append(createTag('td', { colspan: 2, style: `background-color: ${getPreferedBackgroundColor(blockName)}; color: ${getPreferedForegroundColor(blockName)};` }, blockName));
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

/**
 * Converts an image URL to a base64 encoded string
 * @param {String} url The URL of the image
 * @returns {Promise<String>} The base64 encoded string
 */
async function imageUrlToBase64(url) {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = (res) => {
        resolve(res.target.result);
      };
      reader.readAsDataURL(blob);
    } catch (e) {
      /* c8 ignore next 2 */
      reject(e);
    }
  });
}

/**
 * Prepares images for copying to the clipboard, encodes if needed and sizes correctly
 * @param {Object} context The library context
 * @param {*} element The element to prepare
 * @param {*} url The URL of the block
 * @param {*} columnWidthPercentage The column width percentage
 */
export async function prepareImagesForCopy(context, element, url, columnWidthPercentage) {
  const blockURL = typeof url === 'string' ? new URL(url) : url;
  const images = element.querySelectorAll('img');
  for (const img of images) {
    // If the image is not a data URL
    if (!img.src.includes('data:')) {
      // If we are encoding images, convert the image to a data URL
      if (context.encodeImages) {
        try {
          const imgURL = new URL(img.src);

          // Limit image width to 2000px
          imgURL.searchParams.set('width', '2000');
          const dataURL = await imageUrlToBase64(imgURL.href);
          img.src = dataURL;
        } catch (e) {
          /* c8 ignore next 3 */
          // eslint-disable-next-line no-console
          console.error(e);
        }
      } else {
        // Not encoding, just replace the host with the block host
        const srcSplit = img.src.split('/');
        const mediaPath = srcSplit.pop();
        img.src = `${blockURL.origin}/${mediaPath}`;
      }
    }

    const maxWidth = columnWidthPercentage !== 100
      ? Math.min(295, (columnWidthPercentage / 100) * 540)
      : 650;
    const originalWidth = img.width;
    const originalHeight = img.height;

    // Calculate the aspect ratio
    const aspectRatio = originalWidth / originalHeight;

    // Calculate the new width and height based on the maximum width
    let newWidth = maxWidth;
    let newHeight = newWidth / aspectRatio;

    // Check if the new height exceeds the maximum height
    if (newHeight > maxWidth) {
      /* c8 ignore next 3 */
      newHeight = maxWidth;
      newWidth = newHeight * aspectRatio;
    }

    img.width = newWidth;
    img.height = newHeight;
  }
}

/**
 * Prepares icons for copying to the clipboard,
 * replaces the span with the icon name in the format :icon-name:
 * @param {HTMLElement} element The element to prepare
 */
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

/**
 * Prepares anchor tags for copying to the clipboard,
 * updates any relative paths to include the origin
 * @param {HTMLElement} element The element to prepare
 * @param {String} origin The origin to use for any relative paths
 */
export function prepareAnchorsForCopy(element) {
  const { origin } = window.location;
  element.querySelectorAll('a').forEach((anchor) => {
    const path = anchor.getAttribute('href');
    if (isPath(path)) {
      anchor.href = `${origin}${path}`;
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
 * Fetches the section metadata for a block and returns it as a table
 * @param {Object} context The library context
 * @param {HTMLElement} block The block element
 * @param {String} baseURL The base URL of the block
 * @returns
 */
async function getSectionMetadata(context, block, baseURL) {
  const sectionMetadata = block.querySelector(':scope > .section-metadata');
  if (sectionMetadata) {
    // Create a table for the section metadata
    return convertBlockToTable(
      context,
      sectionMetadata,
      'section metadata',
      baseURL,
    );
  }
}

/**
 * Copies to the clipboard
 * @param {Object} context The library context
 * @param {Object} data The data request to prepare the block
 * @param {Function} prepare The function to prepare the block
 */
export function copyToClipboard(context, data, prepare) {
  try {
    // Since we need may need to pontentially fetch images (if encodeImages is true),
    // we need to use the promise based API for the clipboard API.
    const clipboardData = [new ClipboardItem({
      'text/html': new Promise((resolve, reject) => {
        prepare(context, data).then((html) => {
          try {
            const blob = new Blob([html.outerHTML], { type: 'text/html' });
            resolve(blob);
          } catch (e) {
            /* c8 ignore next 2 */
            reject(e);
          }
        });
      }),
    })];
    navigator.clipboard.write(clipboardData);
    /* c8 ignore next 4 */
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Unable to write to clipboard', error);
  }
}

/**
 * Copies a block to the clipboard
 * @param {Object} context The library context
 * @param {HTMLElement} wrapper The wrapper element
 * @param {string} name The name of the block
 * @param {string} blockURL The URL of the block
 */
export async function copyBlockToClipboard(context, wrapper, name, blockURL, tableStyle) {
  async function prepare(ctx, data) {
    const { blockName, html } = data;
    // Get the first block element ignoring any section metadata blocks
    const element = html.querySelector(':scope > div:not(.section-metadata)');
    let blockTable = '';

    prepareAnchorsForCopy(element);

    // If the wrapper has no block, leave block table empty
    if (element) {
      blockTable = await convertBlockToTable(
        ctx,
        element,
        blockName,
        blockURL,
        tableStyle,
      );
    }

    // Does the block have section metadata?
    const sectionMetadataTable = await getSectionMetadata(ctx, html, blockURL);
    if (sectionMetadataTable) {
      sectionMetadataTable.prepend(createTag('br'));
      blockTable.append(sectionMetadataTable);
    }

    return blockTable;
  }

  const data = {
    blockName: name,
    html: wrapper,
  };

  const copied = await copyToClipboard(context, data, prepare);

  // Track block copy event
  sampleRUM('library:blockcopied', { target: blockURL });

  return copied;
}

/**
 * Copies default content to the clipboard
 * @param {Object} context The library context
 * @param {HTMLElement} wrapper The wrapper element
 * @param {string} blockURL The URL of the block
 * @returns {HTMLElement} The cloned wrapper
 */
export async function copyDefaultContentToClipboard(context, wrapper, blockURL) {
  async function prepare(ctx, data) {
    const { html, url } = data;
    const wrapperClone = html.cloneNode(true);
    prepareAnchorsForCopy(wrapperClone);
    prepareIconsForCopy(wrapperClone);
    await prepareImagesForCopy(ctx, wrapperClone, blockURL, 100);

    const sectionMetadataTable = await getSectionMetadata(ctx, wrapperClone, url);
    if (sectionMetadataTable) {
      wrapperClone.append(sectionMetadataTable);

      const sectionMetadata = wrapperClone.querySelector(':scope > .section-metadata');
      sectionMetadata.remove();
    }

    return wrapperClone;
  }

  const data = {
    html: wrapper,
    url: blockURL,
  };

  const copied = await copyToClipboard(context, data, prepare);

  // Track block copy event
  sampleRUM('library:blockcopied', { target: blockURL });

  return copied;
}

/**
 * Copies a page to the clipboard, pages can consist of multiple blocks,
 * default content, section metadata and metadata
 * @param {Object} context The library context
 * @param {HTMLElement} wrapper The wrapper element
 * @param {string} blockURL The URL of the block
 * @returns {HTMLElement} The cloned wrapper
 */
export async function copyPageToClipboard(context, wrapper, blockURL, pageMetadata) {
  async function prepare(ctx, data) {
    const { html, pageMeta, url } = data;
    const wrapperClone = html.cloneNode(true);
    prepareAnchorsForCopy(wrapperClone);
    prepareIconsForCopy(wrapperClone);
    await prepareImagesForCopy(ctx, wrapperClone, url, 100);

    const sectionBreak = createTag('p', undefined, '---');

    // Get all section on page
    const sections = wrapperClone.querySelectorAll(':scope > div');
    let index = 0;
    for (const section of sections) {
      // If not the last section, add a section delimeter
      if (index < sections.length - 1) {
        section.insertAdjacentElement('beforeend', sectionBreak.cloneNode(true));
      }

      // Create a br element to space out tables
      const br = createTag('br');

      // Does the current section have any blocks?
      const blocks = section.querySelectorAll(':scope > div:not(.section-metadata)');
      for (const block of blocks) {
        // Convert the block to a table
        const blockTable = await convertBlockToTable(
          ctx,
          block,
          getBlockName(block, true),
          blockURL,
        );

        // Insert a br after every table to add some spacing in the document
        block.parentNode.insertBefore(br.cloneNode(), block.nextSibling);

        // Replace the block with the table
        block.replaceWith(blockTable);
      }

      const sectionMetadata = section.querySelector(':scope > div.section-metadata');
      const sectionMetadataTable = await getSectionMetadata(ctx, section, blockURL);
      if (sectionMetadataTable) {
        sectionMetadata.replaceWith(createTag('br'), sectionMetadataTable);
      }

      index += 1;
    }

    if (pageMeta) {
      const pageMetadataTable = convertObjectToTable('metadata', pageMeta);
      wrapperClone.append(pageMetadataTable);
    }

    return wrapperClone;
  }

  const data = {
    html: wrapper,
    pageMeta: pageMetadata,
    url: blockURL,
  };

  await copyToClipboard(context, data, prepare);

  // Track block copy event
  sampleRUM('library:blockcopied', { target: blockURL });
}

/**
 * Gets the block table style from library metadata
 * @param {Object} defaultLibraryMetadata
 * @param {Object} sectionLibraryMetadata
 * @returns
 */
export function getBlockTableStyle(defaultLibraryMetadata, sectionLibraryMetadata) {
  const tableStyle = {};

  if (sectionLibraryMetadata.tableheaderbackgroundcolor) {
    tableStyle.tableHeaderBackgroundColor = sectionLibraryMetadata.tableheaderbackgroundcolor;
  } else if (defaultLibraryMetadata.tableheaderbackgroundcolor) {
    tableStyle.tableHeaderBackgroundColor = defaultLibraryMetadata.tableheaderbackgroundcolor;
  }

  if (sectionLibraryMetadata.tableheaderforegroundcolor) {
    tableStyle.tableHeaderForegroundColor = sectionLibraryMetadata.tableheaderforegroundcolor;
  } else if (defaultLibraryMetadata.tableheaderforegroundcolor) {
    tableStyle.tableHeaderForegroundColor = defaultLibraryMetadata.tableheaderforegroundcolor;
  }

  return tableStyle;
}
