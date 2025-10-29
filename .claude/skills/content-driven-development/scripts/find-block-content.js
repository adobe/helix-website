#!/usr/bin/env node

/**
 * Find pages containing a specific block in AEM Edge Delivery projects.
 *
 * This script queries the query-index to find instances of a block,
 * helping developers identify existing content for testing during development.
 *
 * Usage:
 *   node find-block-content.js <block-name> [host] [variant]
 *
 * Examples:
 *   node find-block-content.js hero
 *   node find-block-content.js hero localhost:3000
 *   node find-block-content.js hero main--mysite--owner.aem.live
 *   node find-block-content.js hero main--mysite--owner.aem.page
 *   node find-block-content.js hero localhost:3000 dark
 *   node find-block-content.js cards main--mysite--owner.aem.live three-up
 *
 * The script will:
 * 1. Query the site's query-index for all pages
 * 2. Check each page for the specified block (and variant if provided)
 * 3. Report all pages containing the block with their URLs
 *
 * Defaults to localhost:3000 if no host specified
 */

import { JSDOM } from 'jsdom';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Fetch all URLs from the query index with pagination
 * @param {string} host - The host to query
 * @returns {Promise<string[]>} Array of page paths
 */
async function fetchQueryIndex(host) {
  const limit = 512;
  let offset = 0;
  const paths = [];
  let more = true;

  console.log(`Fetching query index from ${host}...\n`);

  do {
    try {
      // Use http for localhost, https for everything else
      const protocol = host.startsWith('localhost') ? 'http' : 'https';
      const url = `${protocol}://${host}/query-index.json?offset=${offset}&limit=${limit}`;
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();
      const data = json.data || [];

      data.forEach((item) => {
        if (item.path) {
          paths.push(item.path);
        }
      });

      more = data.length === limit;
      offset += limit;

      if (more) {
        console.log(`Fetched ${paths.length} pages so far...`);
      }
    } catch (err) {
      console.error(`Error fetching query index: ${err.message}`);
      more = false;
    }
  } while (more);

  console.log(`\nTotal pages found: ${paths.length}\n`);
  return paths;
}

/**
 * Check if a page contains the specified block (and optional variant)
 * @param {string} host - The host to query
 * @param {string} path - The page path
 * @param {string} blockName - Name of block to find
 * @param {string} variant - Optional variant name to match
 * @returns {Promise<boolean>} True if block is found
 */
async function pageContainsBlock(host, path, blockName, variant = null) {
  try {
    // Use http for localhost, https for everything else
    const protocol = host.startsWith('localhost') ? 'http' : 'https';
    const url = `${protocol}://${host}${path}`;
    const res = await fetch(url);

    if (!res.ok) {
      return false;
    }

    const html = await res.text();

    // Parse HTML with jsdom
    const dom = new JSDOM(html);
    const { document } = dom.window;

    // Look for block using proper DOM query
    // Blocks appear as elements with the block name as a class
    const selector = `.${blockName}`;
    const blockElements = document.querySelectorAll(selector);

    if (blockElements.length === 0) {
      return false;
    }

    // If no variant specified, any instance of the block counts
    if (!variant) {
      return true;
    }

    // Check if any block instance has the specified variant
    return Array.from(blockElements).some((element) =>
      element.classList.contains(variant)
    );
  } catch (err) {
    return false;
  }
}

/**
 * Process URLs in batches with concurrency control
 * @param {string} host - The host to query
 * @param {string[]} paths - Array of page paths
 * @param {string} blockName - Name of block to find
 * @param {string} variant - Optional variant name
 * @param {number} concurrency - Number of concurrent requests
 * @returns {Promise<string[]>} Array of paths containing the block
 */
async function findBlockInPages(host, paths, blockName, variant = null, concurrency = 10) {
  const matches = [];
  const inFlight = new Set();

  const searchTerm = variant ? `"${blockName}" block with "${variant}" variant` : `"${blockName}" block`;
  console.log(`Searching ${paths.length} pages for ${searchTerm}...\n`);

  for (let i = 0; i < paths.length; i += 1) {
    const path = paths[i];

    const promise = pageContainsBlock(host, path, blockName, variant).then((found) => {
      if (found) {
        matches.push(path);
        console.log(`✓ Found: ${path}`);
      }
      inFlight.delete(promise);
    });

    inFlight.add(promise);

    // Wait if we've hit concurrency limit
    if (inFlight.size >= concurrency) {
      await Promise.race(inFlight);
    }
  }

  // Wait for remaining requests
  await Promise.all(inFlight);

  return matches;
}

/**
 * Get the host to query
 * @param {string} host - Host string or undefined for default
 * @returns {string} The host to query
 */
function getHost(host) {
  if (!host) {
    return 'localhost:3000';
  }

  // Strip https:// or http:// if provided
  return host.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

/**
 * Main execution
 */
async function main() {
  const blockName = process.argv[2];
  const hostArg = process.argv[3];
  const variantArg = process.argv[4];

  if (!blockName) {
    console.error('Error: Block name is required');
    console.error('\nUsage: node find-block-content.js <block-name> [host] [variant]');
    console.error('\nExamples:');
    console.error('  node find-block-content.js hero');
    console.error('  node find-block-content.js hero localhost:3000');
    console.error('  node find-block-content.js hero main--mysite--owner.aem.live');
    console.error('  node find-block-content.js hero localhost:3000 dark');
    console.error('  node find-block-content.js cards main--mysite--owner.aem.live three-up');
    process.exit(1);
  }

  const host = getHost(hostArg);
  const searchTerm = variantArg ? `"${blockName}" block with "${variantArg}" variant` : `"${blockName}" block`;
  console.log(`Searching for ${searchTerm} on ${host}\n`);
  console.log('─'.repeat(60));
  console.log();

  // Fetch all pages from query index
  const paths = await fetchQueryIndex(host);

  if (paths.length === 0) {
    console.log('No pages found in query index.');
    console.log('\nMake sure:');
    console.log('- Your dev server is running (aem up)');
    console.log('- The site has been indexed');
    return;
  }

  // Search for block in pages
  const matches = await findBlockInPages(host, paths, blockName, variantArg);

  console.log();
  console.log('─'.repeat(60));
  console.log();

  // Report results
  if (matches.length === 0) {
    const notFoundMsg = variantArg
      ? `No pages found containing the "${blockName}" block with "${variantArg}" variant.`
      : `No pages found containing the "${blockName}" block.`;
    console.log(notFoundMsg);
    console.log('\nThis might mean:');
    console.log('- The block is new and no content exists yet');
    console.log('- The block name is spelled differently');
    if (variantArg) {
      console.log('- The variant name is spelled differently');
      console.log(`- The block exists but not with the "${variantArg}" variant`);
    }
    console.log('- Content exists but hasn\'t been published');
  } else {
    const resultMsg = variantArg
      ? `✓ Found ${matches.length} page(s) containing the "${blockName}" block with "${variantArg}" variant:\n`
      : `✓ Found ${matches.length} page(s) containing the "${blockName}" block:\n`;
    console.log(resultMsg);

    matches.forEach((path, index) => {
      console.log(`${index + 1}. https://${host}${path}`);
    });

    console.log('\nYou can use these pages for testing during development.');
  }
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
