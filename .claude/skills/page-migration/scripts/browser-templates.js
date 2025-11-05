/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

/**
 * Browser Script Templates (NOT CLI Executable)
 *
 * These are JavaScript code strings meant to be executed INSIDE a browser
 * via Playwright's browser_evaluate() MCP tool.
 *
 * DO NOT execute directly with node command.
 * Import and pass to browser_evaluate() instead.
 *
 * Why this file is different from other scripts:
 * - CLI scripts (search-*.js, generate-path.js): Run in Node.js, use process.argv, have main()
 * - Browser templates (this file): Run in browser DOM, passed to browser_evaluate()
 *
 * Usage pattern:
 *   import { SCROLL_SCRIPT } from './browser-templates.js';
 *   await browser_evaluate({ script: SCROLL_SCRIPT });
 */

/**
 * Script 1: Scroll to trigger lazy-loaded content
 *
 * Many modern websites lazy-load images only when they scroll into view.
 * This script scrolls through the entire page to ensure all images have
 * their src attributes populated before extraction.
 *
 * Usage with browser_evaluate:
 *   await browser_evaluate({ script: SCROLL_SCRIPT });
 */
export const SCROLL_SCRIPT = `
await new Promise((resolve) => {
  let totalHeight = 0;
  const distance = 100;
  const timer = setInterval(() => {
    const scrollHeight = document.body.scrollHeight;
    window.scrollBy(0, distance);
    totalHeight += distance;
    if(totalHeight >= scrollHeight){
      clearInterval(timer);
      resolve();
    }
  }, 100);
});
`;

/**
 * Script 2: Extract and clean HTML content with attribute preservation
 *
 * This script:
 * 1. Removes non-content elements (scripts, styles, nav, footer, ads, etc.)
 * 2. Works on full body (doesn't isolate to main - lets Claude identify content)
 * 3. Strips unnecessary attributes while preserving essential ones
 * 4. Compresses whitespace
 *
 * CRITICAL: This explicitly preserves src, href, alt, title, class, id
 * to ensure images and links work in the migrated content.
 *
 * Usage with browser_evaluate:
 *   const html = await browser_evaluate({ script: EXTRACT_HTML_SCRIPT });
 */
export const EXTRACT_HTML_SCRIPT = `
// 1. Remove non-content elements
const selectorsToRemove = [
  'script', 'style', 'noscript', 'iframe', 'svg[class*="hidden"]',
  'nav', 'header[role="banner"]', 'footer[role="contentinfo"]',
  '[role="navigation"]', '[role="complementary"]', '[role="banner"]',
  '.navigation', '.nav', '.header', '.footer', '.sidebar',
  '.ad', '.advertisement', '.cookie-banner', '.popup',
  'link', 'meta', 'form[role="search"]',
  '[id*="cookie"]', '[class*="cookie"]', '[id*="Cookie"]', '[class*="Cookie"]'
];

selectorsToRemove.forEach(selector => {
  document.querySelectorAll(selector).forEach(el => el.remove());
});

// 2. CRITICAL: Preserve essential attributes, strip all others
const keepAttributes = ['src', 'href', 'alt', 'title', 'class', 'id'];
document.body.querySelectorAll('*').forEach(el => {
  const attrs = Array.from(el.attributes);
  attrs.forEach(attr => {
    if (!keepAttributes.includes(attr.name)) {
      el.removeAttribute(attr.name);
    }
  });
});

// 3. Compress whitespace and return full body
const html = document.body.outerHTML
  .replace(/\\s+/g, ' ')
  .replace(/>\\s+</g, '><')
  .trim();

return html;
`;

/**
 * Helper function to format the scripts for inline documentation
 */
export function getScriptDocumentation() {
  return {
    scrollScript: {
      purpose: 'Trigger lazy-loaded images by scrolling page',
      usage: 'await browser_evaluate({ script: SCROLL_SCRIPT });',
      script: SCROLL_SCRIPT,
    },
    extractScript: {
      purpose: 'Extract main content HTML with attribute preservation',
      usage: 'const html = await browser_evaluate({ script: EXTRACT_HTML_SCRIPT });',
      preservedAttributes: ['src', 'href', 'alt', 'title', 'class', 'id'],
      script: EXTRACT_HTML_SCRIPT,
    },
  };
}
