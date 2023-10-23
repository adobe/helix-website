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

/* eslint-disable no-param-reassign */

/**
 * Creates an HTML tag
 * @param {String} tag The tag to create
 * @param {Object} attributes The attributes to add to the tag
 * @param {Element} html An html element to set as it's content
 * @returns The new element
 */
export function createTag(tag, attributes, html) {
  const el = document.createElement(tag);
  if (html) {
    if (
      html instanceof HTMLElement
      || html instanceof SVGElement
      || html instanceof DocumentFragment
    ) {
      el.append(html);
    } else if (Array.isArray(html)) {
      el.append(...html);
    } else {
      el.insertAdjacentHTML('beforeend', html);
    }
  }
  if (attributes) {
    Object.entries(attributes).forEach(([key, val]) => {
      el.setAttribute(key, val);
    });
  }
  return el;
}

/**
 * Copies to the clipboard
 * @param {Blob} blob The data
 */
export function createCopy(blob) {
  try {
    const data = [new ClipboardItem({ [blob.type]: blob })];
    navigator.clipboard.write(data);
    /* c8 ignore next 4 */
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Unable to write to clipboard', error);
  }
}

/**
 * Parses a metadata block
 * @param {HTMLElement} el The metadata HTML element
 * @returns The metadata
 */
export const getMetadata = el => [...el.childNodes].reduce((rdx, row) => {
  if (row.children) {
    const key = row.children[0].textContent.trim().toLowerCase();
    const content = row.children[1];
    const text = content?.textContent.trim().toLowerCase();
    if (key && content) rdx[key] = { content, text };
  }
  return rdx;
}, {});

/**
 * Loads a CSS file into a shadow DOM
 * @param {string} href The path to the CSS file
 */
export function loadCSS(href, callback) {
  if (!document.querySelector(`head > link[href="${href}"]`)) {
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', href);
    if (typeof callback === 'function') {
      link.onload = e => callback(e.type);
      /* c8 ignore next */
      link.onerror = e => callback(e.type);
    }
    document.head.appendChild(link);
  } else if (typeof callback === 'function') {
    callback('noop');
  }
}

/**
 * Capitalizes the first letter of a string
 * @param {String} str The string
 * @returns The capitalized string
 */
export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Is the provided string a path?
 * @param {*} str The string to check
 * @returns True if yes
 */
export function isPath(str) {
  try {
    const url = new URL(str);
    return url.protocol === '' && url.hostname === '';
  } catch (error) {
    return true;
  }
}

/**
 * Extracts the config from a block.
 * @param {Element} block The block element
 * @returns {object} The block config
 */
export function readBlockConfig(block, convertKeys = true) {
  const config = {};
  block.querySelectorAll(':scope > div').forEach((row) => {
    if (row.children) {
      const cols = [...row.children];
      if (cols[1]) {
        const col = cols[1];
        const name = convertKeys ? toClassName(cols[0].textContent) : cols[0].textContent;
        let value = col;

        // We don't want to modify the html in the description column
        if (name !== 'description') {
          if (col.querySelector('a')) {
            const as = [...col.querySelectorAll('a')];
            if (as.length === 1) {
              value = as[0].href;
            } else {
              value = as.map(a => a.href);
            }
          } else if (col.querySelector('img')) {
            const imgs = [...col.querySelectorAll('img')];
            if (imgs.length === 1) {
              value = imgs[0].src;
            } else {
              value = imgs.map(img => img.src);
            }
          } else if (col.querySelector('p')) {
            const ps = [...col.querySelectorAll('p')];
            if (ps.length === 1) {
              value = ps[0].textContent;
            } else {
              value = ps.map(p => p.textContent);
            }
          } else value = row.children[1].textContent;
        }
        config[name] = value;
      }
    }
  });
  return config;
}

/**
 * Sanitizes a string for use as class name.
 * @param {string} name The unsanitized string
 * @returns {string} The class name
 */
export function toClassName(name) {
  return typeof name === 'string'
    ? name.toLowerCase().replace(/[^0-9a-z]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    : '';
}

/**
 * Sanitizes a string for use as a js property name.
 * @param {string} name The unsanitized string
 * @returns {string} The camelCased name
 */
export function toCamelCase(name) {
  return toClassName(name).replace(/-([a-z])/g, g => g[1].toUpperCase());
}

export function createSideNavItem(
  label,
  icon,
  disclosureArrow,
  hasAction = false,
  actionIcon = '',
) {
  const childElements = [];
  if (icon) {
    childElements.push(createTag(icon, { slot: 'icon', size: 's' }));
  }

  if (actionIcon) {
    childElements.push(createTag(actionIcon, { slot: 'action-icon' }));
  }

  const blockVariant = createTag('sp-sidenav-item', { label }, childElements);
  if (hasAction) {
    blockVariant.setAttribute('action', true);
  }

  if (disclosureArrow) {
    blockVariant.setAttribute('disclosureArrow', true);
  }
  return blockVariant;
}

/**
 * Appends the provided url params to the current url
 * @param {Array} kvs An array of key value pairs
 */
export function setURLParams(toAdd, toRemove = []) {
  const url = new URL(window.location.href);
  toAdd.forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  toRemove.forEach((key) => {
    url.searchParams.delete(key);
  });

  const { href } = url;
  window.history.pushState({ path: href }, '', decodeURIComponent(href));
}

/**
 * Removes all the urlParams
 * @param {Array} keys An array of keys
 */
export function removeAllURLParams() {
  const url = new URL(window.location.href);
  const newUrl = `${url.origin}${url.pathname}`;
  window.history.pushState({ path: newUrl }, '', newUrl);
}

/**
 * Removes all event listeners from an element by cloning it
 * @param {HTMLElement} element The element to remove the listeners from
 * @returns The element with the listeners removed
 */
export function removeAllEventListeners(element) {
  const clone = element.cloneNode(true);
  element.parentNode.replaceChild(clone, element);
  return clone;
}
