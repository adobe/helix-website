/**
 * Facet Link Generator Module
 * Creates dashboard links with specific facet parameters for report navigation
 *
 * Supports flexible nested facet linking:
 * - Main facets: checkpoint, url, userAgent
 * - Nested facets: parent.source, parent.target (can be used independently or together)
 */

/* eslint-disable no-console */

/**
 * Build facet information section for AI prompt
 * Generates instructions for AI about how to create clickable facet links
 * @param {Object} dashboardData - Dashboard data
 * @returns {string} Facet information section for AI prompt
 */
export function buildFacetInfoSection(dashboardData) {
  const facetList = Object.keys(dashboardData.segments);
  const simpleFacets = facetList.filter((f) => !f.includes('.'));

  const formatFacet = (facet) => {
    const topValues = dashboardData.segments[facet].slice(0, 2).map((item) => item.value).join('", "');
    return `- ${facet}: Example values "${topValues}"`;
  };

  const nestedFacets = facetList.filter((f) => f.includes('.'));

  // Group nested facets by parent to identify source/target pairs
  const nestedByParent = {};
  nestedFacets.forEach((f) => {
    const parent = f.split('.')[0];
    if (!nestedByParent[parent]) nestedByParent[parent] = [];
    nestedByParent[parent].push(f);
  });

  const sections = [
    '\n\n==== 🔗 AVAILABLE FACETS FOR LINKING ====',
    'When creating your report, wrap findings in <span> tags with data attributes to make them clickable.',
    '',
    '⚠️ CRITICAL: All links PRESERVE existing url and userAgent filters in the URL',
    '   Checkpoint may be changed/added based on the link, but url/userAgent context is never lost.',
    '',
    '📋 FACET LINKING STRUCTURE:',
    '  • Main facets: checkpoint, url, userAgent (required)',
    '  • Nested facets: parent.source, parent.target (optional, can use one or both)',
    '',
    'MAIN FACETS (required for all links):',
    ...simpleFacets.filter((f) => ['checkpoint', 'url', 'userAgent'].includes(f)).map((f) => formatFacet(f)),
    '',
    '⚠️ NESTED FACETS - ONLY USE THESE EXACT NAMES (can be combined independently):',
    ...nestedFacets.map((f) => {
      const parent = f.split('.')[0];
      const values = dashboardData.segments[f]?.slice(0, 2).map((item) => item.value).join('", "') || '';
      return `- ${f} (parent: ${parent}): Example values "${values}"`;
    }),
    '',
    '📊 NESTED FACET COMBINATIONS (all valid):',
    ...Object.entries(nestedByParent)
      .filter(([, facets]) => facets.length >= 2)
      .map(([parent, facets]) => {
        const sourceFacet = facets.find((f) => f.includes('.source'));
        const targetFacet = facets.find((f) => f.includes('.target'));
        if (sourceFacet && targetFacet) {
          return [
            `  • checkpoint=${parent} only (broad filter)`,
            `  • checkpoint=${parent} + ${sourceFacet}=VALUE (filter by source)`,
            `  • checkpoint=${parent} + ${targetFacet}=VALUE (filter by target directly)`,
            `  • checkpoint=${parent} + ${sourceFacet}=VALUE + ${targetFacet}=VALUE (both)`,
          ].join('\n');
        }
        return null;
      })
      .filter(Boolean),
    '',
    '⚠️ CRITICAL: ONLY use nested facet names from the list above. DO NOT invent nested facet names!',
  ];

  sections.push(
    '\n✅ CORRECT USAGE EXAMPLES:',
    '',
    '⚠️ IMPORTANT: Include relevant metrics/numbers INSIDE the data-facet span so they become part of the clickable link!',
    '⚠️ Use <number-format> tags with proper attributes for all numbers (see Number Formatting section).',
    '',
    '1️⃣ SIMPLE LINK (Main facet only - Checkpoint):',
    '<p>• <span data-facet="checkpoint" data-facet-value="lcp">LCP events show <number-format title="2.3s ±0.4s" sample-size="1234"><span class="formatted-value">2.3s</span></number-format> average load time</span>.</p>',
    'URL: ?checkpoint=lcp',
    '',
    '2️⃣ SIMPLE LINK (Main facet only - URL):',
    '<p>• <span data-facet="url" data-facet-value="/checkout">The /checkout page has <number-format title="65% ±5%" sample-size="450"><span class="formatted-value">65%</span></number-format> bounce rate</span>.</p>',
    'URL: ?url=/checkout',
    '',
    '3️⃣ SIMPLE LINK (Main facet only - UserAgent):',
    'Tool returns: {"text": "All Mobile", "value": "mobile", "count": 8100}',
    '✅ CORRECT: <span data-facet="userAgent" data-facet-value="mobile">Mobile users have <number-format sample-size="8100"><span class="formatted-value">8.1k</span></number-format> page views</span>',
    '❌ WRONG: <span data-facet-value="All Mobile">... (uses "text" field - will NOT work)',
    '⚠️ ALWAYS use the "value" field from tool response, NEVER use "text" or "label"',
    '',
    '4️⃣ NESTED LINK (One nested facet - error.source):',
    '<p>• <span data-facet="checkpoint" data-facet-value="error" data-nested-facet="error.source" data-nested-value="network">Network errors affect <number-format sample-size="456"><span class="formatted-value">456</span></number-format> users</span>.</p>',
    'URL: ?checkpoint=error&error.source=network',
    '',
    '5️⃣ NESTED LINK (One nested facet - error.target directly, without source):',
    '<p>• <span data-facet="checkpoint" data-facet-value="error" data-nested-facet="error.target" data-nested-value="TypeError: Cannot read property">This TypeError affects <number-format sample-size="89"><span class="formatted-value">89</span></number-format> users</span>.</p>',
    'URL: ?checkpoint=error&error.target=TypeError: Cannot read property',
    '⚠️ You can link directly to error.target WITHOUT specifying error.source!',
    '',
    '6️⃣ NESTED LINK (Two nested facets - both source and target):',
    '<p>• <span data-facet="checkpoint" data-facet-value="error" data-nested-facet="error.source" data-nested-value="network" data-nested-facet-2="error.target" data-nested-value-2="TypeError: Cannot read property">This specific TypeError from network: <number-format sample-size="45"><span class="formatted-value">45</span></number-format></span>.</p>',
    'URL: ?checkpoint=error&error.source=network&error.target=TypeError: Cannot read property',
    '',
    '7️⃣ NESTED LINK (Click target URL - EXACT URL from tool required):',
    'Tool returns: {"facet": "click.target", "value": "https://example.com/watch-collection.html", "count": 123}',
    '✅ CORRECT: <span data-facet="checkpoint" data-facet-value="click" data-nested-facet="click.target" data-nested-value="https://example.com/watch-collection.html">Watch collection clicks</span>',
    '❌ WRONG: data-nested-value="https://example.com/watches.html" (different URL - will NOT work!)',
    '⚠️ For nested facets with URLs: Use the EXACT full URL from tool response',
    '',
    '💡 WHEN TO USE NESTED FACETS:',
    '  • Use one nested facet when you have data for that specific dimension',
    '  • Use two nested facets when you have data for both and want precise filtering',
    '  • You can use .target WITHOUT .source - they are independent filters!',
    '  ⚠️ ONLY create nested links if you called a tool for that nested facet!',
  );

  sections.push(
    '\n❌ INVALID EXAMPLES (will NOT work):',
    '• <span data-facet="browser">Chrome</span> - Wrong facet! Use "userAgent" not "browser"',
    '• <span data-facet="device">mobile</span> - Wrong facet! Use "userAgent" not "device"',
    '• <span data-nested-facet="error.source" data-nested-value="network">...</span> - Missing parent checkpoint!',
    '• <span data-facet="url" data-facet-value="/checkout">The page</span> has 3.2s LCP - Metric outside span!',
    '',
    '⚠️ CRITICAL RULES:',
    '  1. MAIN FACET REQUIRED: Every link needs data-facet and data-facet-value',
    '  2. NESTED FACETS ARE OPTIONAL: Add them when you have specific drill-down data',
    '  3. NESTED FACETS ARE INDEPENDENT: You can use .source, .target, or both',
    '  4. ONLY create links for values AND facet names you see in TOOL RESPONSES',
    '     ❌ DO NOT invent nested facet names - verify from "NESTED FACETS" list above',
    '  5. ALWAYS use the EXACT "value" field from tool response, NEVER "text" or "label"',
    '     Tool returns: {"text": "All Mobile", "value": "mobile", "count": 8100}',
    '     ✅ USE: data-facet-value="mobile"',
    '     ❌ NEVER: data-facet-value="All Mobile"',
    '  6. Use EXACT value format from tool - DO NOT paraphrase, shorten, or modify',
    '  7. SYNTAX REFERENCE:',
    '     Simple: <span data-facet="NAME" data-facet-value="VALUE">text</span>',
    '     One nested: + data-nested-facet="NAME" data-nested-value="VALUE"',
    '     Two nested: + data-nested-facet-2="NAME" data-nested-value-2="VALUE"',
    '  8. INCLUDE METRICS INSIDE SPANS: Put numbers inside data-facet span to make them clickable',
    '  9. All links automatically PRESERVE existing url and userAgent filters',
    '',
    '==== END FACET INFO ====\n',
  );

  return sections.join('\n');
}

/**
 * Normalize URL values to match dashboard format
 * @param {string} url - URL to normalize
 * @returns {string} Normalized URL that matches dashboard format
 */
function normalizeUrl(url) {
  if (!url || typeof url !== 'string') return url;

  const normalized = url.replace(/([^:]\/)\/+/g, '$1'); // Remove double slashes

  // Check dashboard for exact format match (try with and without trailing slash)
  const facetSidebar = document.querySelector('facet-sidebar');
  const urlData = facetSidebar?.facets?.url;
  if (urlData) {
    // Try exact match first
    if (urlData.some((item) => item.value === normalized)) {
      return normalized;
    }
    // Try with trailing slash added
    if (!normalized.endsWith('/') && urlData.some((item) => item.value === `${normalized}/`)) {
      return `${normalized}/`;
    }
    // Try with trailing slash removed
    if (normalized.endsWith('/') && urlData.some((item) => item.value === normalized.slice(0, -1))) {
      return normalized.slice(0, -1);
    }
  }

  // No match found - return as-is (don't modify)
  return normalized;
}

/**
 * Generate a dashboard URL with specific facet parameter(s)
 * Supports flexible nested facet linking:
 * - Main facets: checkpoint, url, userAgent (required)
 * - Nested facets: up to 2 independent nested facets (optional)
 *
 * Always preserves existing url and userAgent filters (checkpoint may be changed/added)
 * Private helper function used by convertSpansToLinks()
 *
 * @param {string|Object} facetName - The facet name or object with multiple facets
 * @param {string} facetValue - The facet value to filter by (ignored if facetName is object)
 * @param {Object} options - Additional options for nested facets
 * @param {string} options.nestedFacet - First nested facet name (e.g., 'error.source')
 * @param {string} options.nestedValue - First nested facet value
 * @param {string} options.nestedFacet2 - Second nested facet name (e.g., 'error.target')
 * @param {string} options.nestedValue2 - Second nested facet value
 * @returns {string} Dashboard URL with facet parameter(s)
 */
function generateFacetLink(facetName, facetValue, options = {}) {
  const {
    nestedFacet, nestedValue, nestedFacet2, nestedValue2,
  } = options;
  const currentParams = new URL(window.location.href).searchParams;
  const params = new URLSearchParams();

  // Always preserve these base parameters
  ['domain', 'domainkey', 'view', 'startDate', 'endDate', 'metrics']
    .filter((p) => currentParams.has(p))
    .forEach((p) => params.set(p, currentParams.get(p)));

  // CRITICAL: Preserve existing checkpoint, url, userAgent filters
  // (these will be overridden below if the link changes them)
  ['checkpoint', 'url', 'userAgent']
    .filter((p) => currentParams.has(p))
    .forEach((p) => params.set(p, currentParams.get(p)));

  params.delete('report'); // Remove report viewer UI parameter

  // Helper to add param with URL normalization
  const addParam = (name, value) => {
    const isUrl = name === 'url' || (typeof value === 'string' && value.startsWith('http'));
    params.set(name, isUrl ? normalizeUrl(value) : value);
  };

  if (typeof facetName === 'object' && !Array.isArray(facetName)) {
    Object.entries(facetName).forEach(([name, value]) => addParam(name, value));
  } else {
    // Set the main facet (checkpoint, url, or userAgent)
    addParam(facetName, facetValue);

    // Add first nested facet if provided (e.g., error.source OR error.target)
    if (nestedFacet && nestedValue) {
      addParam(nestedFacet, nestedValue);
    }

    // Add second nested facet if provided (e.g., error.target when error.source is also set)
    if (nestedFacet2 && nestedValue2) {
      addParam(nestedFacet2, nestedValue2);
    }
  }

  // Return relative URL (pathname + search params) so it works on any domain
  const { pathname } = window.location;
  const queryString = params.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
}

/**
 * Validate if a facet value exists in dashboard data
 * Supports validation for main facet and up to 2 nested facets
 *
 * @param {string} facetName - Main facet name (checkpoint, url, userAgent)
 * @param {string} facetValue - Main facet value
 * @param {Object} options - Optional nested facet options
 * @param {string} options.nestedFacet - First nested facet name
 * @param {string} options.nestedValue - First nested facet value
 * @param {string} options.nestedFacet2 - Second nested facet name
 * @param {string} options.nestedValue2 - Second nested facet value
 * @returns {boolean} True if all values exist in dashboard
 */
function validateFacetValue(facetName, facetValue, options = {}) {
  const {
    nestedFacet, nestedValue, nestedFacet2, nestedValue2,
  } = options;

  try {
    const facets = document.querySelector('facet-sidebar')?.facets;
    if (!facets) return true; // Can't validate, allow

    const checkExists = (data, value, isUrl) => {
      if (!data) return false;

      // For URLs, check with and without trailing slash
      if (isUrl) {
        return data.some((item) => item.value === value
          || item.value === `${value}/`
          || (value.endsWith('/') && item.value === value.slice(0, -1)));
      }

      // For other facets, exact match
      return data.some((item) => item.value === value);
    };

    const isUrlValue = (val) => typeof val === 'string' && val.startsWith('http');

    // Validate main facet value
    if (!checkExists(facets[facetName], facetValue, facetName === 'url')) {
      return false;
    }

    // Validate first nested facet if provided
    if (nestedFacet && nestedValue) {
      if (!checkExists(facets[nestedFacet], nestedValue, isUrlValue(nestedValue))) {
        console.warn(`[Facet Link Generator] Nested facet value not found: ${nestedFacet}="${nestedValue}"`);
        console.warn('[Facet Link Generator] Available values:', facets[nestedFacet]?.slice(0, 5).map((item) => item.value));
        return false;
      }
    }

    // Validate second nested facet if provided
    if (nestedFacet2 && nestedValue2) {
      if (!checkExists(facets[nestedFacet2], nestedValue2, isUrlValue(nestedValue2))) {
        console.warn(`[Facet Link Generator] Nested facet 2 value not found: ${nestedFacet2}="${nestedValue2}"`);
        console.warn('[Facet Link Generator] Available values:', facets[nestedFacet2]?.slice(0, 5).map((item) => item.value));
        return false;
      }
    }

    return true;
  } catch (error) {
    console.warn('[Facet Link Generator] Validation error:', error);
    return true;
  }
}

/**
 * Convert data-attribute spans to actual clickable links in HTML
 * Supports flexible nested facet linking:
 * - Main: data-facet + data-facet-value (required)
 * - Nested 1: data-nested-facet + data-nested-value (optional)
 * - Nested 2: data-nested-facet-2 + data-nested-value-2 (optional)
 *
 * Nested facets are INDEPENDENT - you can use either, both, or neither
 * Validates that facet values exist in dashboard before creating links
 * @param {string} htmlContent - HTML content with data-attribute spans
 * @returns {string} HTML with actual <a> links (only for validated values)
 */
export function convertSpansToLinks(htmlContent) {
  if (!htmlContent?.includes('data-facet')) return htmlContent;

  const doc = new DOMParser().parseFromString(htmlContent, 'text/html');
  if (doc.querySelector('parsererror')) {
    console.error('[Facet Link Generator] Parser error');
    return htmlContent;
  }

  const facetElements = doc.querySelectorAll('[data-facet][data-facet-value]');
  if (!facetElements.length) return htmlContent;

  const stats = {
    converted: 0,
    simpleLinks: 0,
    oneNested: 0,
    twoNested: 0,
    skippedNested: [],
    skippedInvalidFacet: [],
    skippedNonExistent: [],
  };

  facetElements.forEach((el) => {
    const facetName = el.getAttribute('data-facet');
    const facetValue = el.getAttribute('data-facet-value');
    if (!facetName || !facetValue) return;

    // First nested facet (optional)
    const nestedFacet = el.getAttribute('data-nested-facet');
    const nestedValue = el.getAttribute('data-nested-value');

    // Second nested facet (optional, independent of first)
    const nestedFacet2 = el.getAttribute('data-nested-facet-2');
    const nestedValue2 = el.getAttribute('data-nested-value-2');

    // Validate first nested facet (must have both attributes or neither)
    if ((nestedFacet && !nestedValue) || (!nestedFacet && nestedValue)) {
      stats.skippedNested.push(`${facetName}="${facetValue}" (incomplete nested facet attributes)`);
      return;
    }

    // Validate second nested facet (must have both attributes or neither)
    if ((nestedFacet2 && !nestedValue2) || (!nestedFacet2 && nestedValue2)) {
      stats.skippedNested.push(`${facetName}="${facetValue}" (incomplete nested facet 2 attributes)`);
      return;
    }

    // For nested facets, parent must be 'checkpoint'
    if ((nestedFacet || nestedFacet2) && facetName !== 'checkpoint') {
      stats.skippedNested.push(`${facetName}="${facetValue}" (nested facets require checkpoint as parent)`);
      return;
    }

    // Verify nested facet names exist in dashboard
    const facets = document.querySelector('facet-sidebar')?.facets;
    if (nestedFacet && facets && !facets[nestedFacet]) {
      stats.skippedNested.push(`${nestedFacet}="${nestedValue}" (nested facet "${nestedFacet}" does not exist)`);
      console.error(`[Facet Link Generator] AI generated invalid nested facet: "${nestedFacet}". This facet does not exist!`);
      return;
    }
    if (nestedFacet2 && facets && !facets[nestedFacet2]) {
      stats.skippedNested.push(`${nestedFacet2}="${nestedValue2}" (nested facet "${nestedFacet2}" does not exist)`);
      console.error(`[Facet Link Generator] AI generated invalid nested facet: "${nestedFacet2}". This facet does not exist!`);
      return;
    }

    // Only allow main facets: checkpoint, url, userAgent
    if (!['checkpoint', 'url', 'userAgent'].includes(facetName)) {
      stats.skippedInvalidFacet.push(`${facetName}="${facetValue}"`);
      return;
    }

    // Validate all facet values exist in dashboard
    const validationOptions = {
      nestedFacet, nestedValue, nestedFacet2, nestedValue2,
    };
    if (!validateFacetValue(facetName, facetValue, validationOptions)) {
      let errorMsg = `${facetName}="${facetValue}"`;
      if (nestedFacet) errorMsg += ` + ${nestedFacet}="${nestedValue}"`;
      if (nestedFacet2) errorMsg += ` + ${nestedFacet2}="${nestedValue2}"`;
      stats.skippedNonExistent.push(errorMsg);
      return;
    }

    // Build title showing the filter path
    let title = `View ${facetName}: ${facetValue}`;
    if (nestedFacet) title += ` + ${nestedFacet}: ${nestedValue}`;
    if (nestedFacet2) title += ` + ${nestedFacet2}: ${nestedValue2}`;

    const anchor = Object.assign(doc.createElement('a'), {
      href: generateFacetLink(facetName, facetValue, {
        nestedFacet, nestedValue, nestedFacet2, nestedValue2,
      }),
      className: 'facet-link',
      innerHTML: el.innerHTML,
      title,
    });
    Object.assign(anchor.style, { color: '#0073e6', textDecoration: 'underline' });

    el.parentNode.replaceChild(anchor, el);
    stats.converted += 1;

    // Track link types for logging
    if (nestedFacet && nestedFacet2) {
      stats.twoNested += 1;
    } else if (nestedFacet || nestedFacet2) {
      stats.oneNested += 1;
    } else {
      stats.simpleLinks += 1;
    }
  });

  // Log validation summary
  console.log(`[Facet Link Validation] ✅ ${stats.converted} valid links created (simple: ${stats.simpleLinks}, 1 nested: ${stats.oneNested}, 2 nested: ${stats.twoNested})`);
  if (stats.skippedNested.length) {
    console.warn(`[Facet Link Validation] ❌ ${stats.skippedNested.length} invalid nested facet links:`, stats.skippedNested);
  }
  if (stats.skippedInvalidFacet.length) {
    console.warn(`[Facet Link Validation] ❌ ${stats.skippedInvalidFacet.length} invalid facet names:`, stats.skippedInvalidFacet);
  }
  if (stats.skippedNonExistent.length) {
    console.warn(`[Facet Link Validation] ❌ ${stats.skippedNonExistent.length} non-existent values:`, stats.skippedNonExistent);
  }

  const totalSkipped = stats.skippedNested.length
    + stats.skippedInvalidFacet.length
    + stats.skippedNonExistent.length;
  if (totalSkipped === 0) {
    console.log('[Facet Link Validation] 🎯 All AI-generated links are valid!');
  }

  return doc.body.innerHTML;
}
