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
  'script', 'style', 'noscript'
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
 * Script 3: Enhance contrast for section boundary detection
 *
 * This script exaggerates subtle background color differences to make
 * section boundaries visually obvious in screenshots. It:
 * 1. Collects all background colors from the page
 * 2. Groups similar colors (within 20 RGB units distance)
 * 3. Spreads each group apart by 60 units
 * 4. Preserves color relationships (darker stays darker)
 *
 * Example: white (255,255,255) vs light grey (247,248,245) become
 * visually distinct in the enhanced screenshot.
 *
 * Usage with browser_evaluate:
 *   const result = await browser_evaluate({ script: ENHANCE_CONTRAST_SCRIPT });
 *   // Returns: { groups: number, modified: number }
 */
export const ENHANCE_CONTRAST_SCRIPT = `
(() => {
  // Helper: Calculate color distance (Euclidean in RGB space)
  function colorDistance(rgb1, rgb2) {
    return Math.sqrt(
      Math.pow(rgb1.r - rgb2.r, 2) +
      Math.pow(rgb1.g - rgb2.g, 2) +
      Math.pow(rgb1.b - rgb2.b, 2)
    );
  }

  // Helper: Parse RGB string to object
  function parseRGB(rgbString) {
    const match = rgbString.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)/);
    if (match) {
      return { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) };
    }
    return null;
  }

  // Helper: RGB object to string
  function rgbToString(rgb) {
    return \`rgb(\${Math.round(rgb.r)}, \${Math.round(rgb.g)}, \${Math.round(rgb.b)})\`;
  }

  // Step 1: Collect all unique background colors
  const elements = document.querySelectorAll('*');
  const colorMap = new Map();

  elements.forEach(el => {
    const bg = window.getComputedStyle(el).backgroundColor;
    if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
      colorMap.set(bg, (colorMap.get(bg) || 0) + 1);
    }
  });

  const uniqueColors = Array.from(colorMap.keys());
  if (uniqueColors.length === 0) return { modified: 0, groups: 0 };

  // Step 2: Parse all colors
  const parsedColors = uniqueColors.map(c => ({
    original: c,
    parsed: parseRGB(c)
  })).filter(c => c.parsed !== null);

  // Step 3: Find groups of similar colors
  const SIMILARITY_THRESHOLD = 20;
  const colorGroups = [];
  const processed = new Set();

  parsedColors.forEach((color1, i) => {
    if (processed.has(color1.original)) return;

    const group = [color1];
    processed.add(color1.original);

    parsedColors.forEach((color2, j) => {
      if (i !== j && !processed.has(color2.original)) {
        const dist = colorDistance(color1.parsed, color2.parsed);
        if (dist < SIMILARITY_THRESHOLD) {
          group.push(color2);
          processed.add(color2.original);
        }
      }
    });

    if (group.length > 1) {
      colorGroups.push(group);
    }
  });

  // Step 4: Create enhancement mapping
  const enhancementMap = new Map();
  const SPREAD_AMOUNT = 60;

  colorGroups.forEach(group => {
    // Sort by brightness
    group.sort((a, b) => {
      const avgA = (a.parsed.r + a.parsed.g + a.parsed.b) / 3;
      const avgB = (b.parsed.r + b.parsed.g + b.parsed.b) / 3;
      return avgA - avgB;
    });

    // Spread the group apart
    group.forEach((color, idx) => {
      const { r, g, b } = color.parsed;
      const offset = (idx - (group.length - 1) / 2) * SPREAD_AMOUNT;

      const newR = Math.max(0, Math.min(255, r + offset));
      const newG = Math.max(0, Math.min(255, g + offset));
      const newB = Math.max(0, Math.min(255, b + offset));

      enhancementMap.set(color.original, rgbToString({ r: newR, g: newG, b: newB }));
    });
  });

  // Step 5: Apply enhancements
  let modifiedCount = 0;
  elements.forEach(el => {
    const bg = window.getComputedStyle(el).backgroundColor;
    if (enhancementMap.has(bg)) {
      el.style.backgroundColor = enhancementMap.get(bg);
      modifiedCount++;
    }
  });

  return {
    modified: modifiedCount,
    groups: colorGroups.length,
    totalColors: uniqueColors.length
  };
})()
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
    enhanceContrastScript: {
      purpose: 'Enhance contrast to make section boundaries obvious',
      usage: 'const result = await browser_evaluate({ script: ENHANCE_CONTRAST_SCRIPT });',
      parameters: {
        similarityThreshold: 20,
        spreadAmount: 60,
      },
      returns: '{ modified: number, groups: number, totalColors: number }',
      script: ENHANCE_CONTRAST_SCRIPT,
    },
  };
}
