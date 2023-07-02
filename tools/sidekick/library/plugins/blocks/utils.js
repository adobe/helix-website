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

export function getLibraryMetadata(block) {
  const libraryMetadata = block.querySelector('.library-metadata');
  const metadata = {};
  if (libraryMetadata) {
    const meta = readBlockConfig(libraryMetadata);
    Object.keys(meta).forEach((key) => {
      if (key === 'style') return;

      metadata[toCamelCase(key)] = meta[key];
    });
    libraryMetadata.remove();

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

export function getTable(block, name, path) {
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

  const backgroundColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--sk-table-bg-color') || '#ff8012';

  const foregroundColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--sk-table-fg-color') || '#ffffff';

  const headerRow = document.createElement('tr');
  headerRow.append(createTag('td', { colspan: maxCols, style: `background-color: ${backgroundColor}; color: ${foregroundColor};` }, name));
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
  return `${table.outerHTML}<br/>`;
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

export function copyBlock(block, sectionMetadata) {
  const tables = [block];

  if (sectionMetadata) tables.push(sectionMetadata);

  try {
    const blob = new Blob(tables, { type: 'text/html' });
    createCopy(blob);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Unable to copy block', error);
  }

  return tables;
}
