/**
 * Facet Link Generator Module
 * Creates dashboard links with specific facet parameters for report navigation
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
  const [simpleFacets, nestedFacets] = [
    facetList.filter((f) => !f.includes('.')),
    facetList.filter((f) => f.includes('.')),
  ];

  const formatFacet = (facet, showParent = false) => {
    const topValues = dashboardData.segments[facet].slice(0, 2).map((item) => item.value).join('", "');
    const parent = showParent ? `, Parent="${facet.split('.')[0]}"` : '';
    return `- ${facet}:${parent} Example values "${topValues}"`;
  };

  const sections = [
    '\n\n==== 🔗 AVAILABLE FACETS FOR LINKING ====',
    'When creating your report, wrap findings in <span> tags with data attributes to make them clickable.',
    'The following facets are available in the dashboard and can be linked:\n',
    'SIMPLE FACETS (single parameter):',
    ...simpleFacets.map((f) => formatFacet(f)),
  ];

  if (nestedFacets.length > 0) {
    sections.push(
      '\nNESTED FACETS (require parent checkpoint + nested parameter):',
      ...nestedFacets.map((f) => formatFacet(f, true)),
    );
  }

  sections.push(
    '\n✅ CORRECT USAGE EXAMPLES:',
    '\n1️⃣ Simple facets (single checkbox):',
    '⚠️ IMPORTANT: Include relevant metrics/numbers INSIDE the data-facet span so they become part of the clickable link!',
    '\n<p>• <span data-facet="checkpoint" data-facet-value="click">Click events show strong engagement with <span class="num">1,234</span> interactions</span>.</p>',
    'Result: Checks "click" checkbox - entire phrase including number is clickable',
    '\n<p>• <span data-facet="userAgent" data-facet-value="mobile:ios">iOS Mobile users have <span class="num">2.3s</span> average LCP</span>.</p>',
    'Result: Checks "mobile:ios" checkbox - metric is part of the link',
    '\n<p>• When tool returns: {"text": "All Mobile", "value": "mobile", "count": 8100}</p>',
    '✅ CORRECT: <span data-facet-value="mobile"> (use the VALUE field)',
    '❌ WRONG: <span data-facet-value="All Mobile"> (do NOT use the text/label field)',
    '\n<p>• <span data-facet="url" data-facet-value="/products">The /products page has a <span class="num">65%</span> bounce rate</span>.</p>',
    'Result: Checks "/products" checkbox - bounce rate is part of the clickable link',
  );

  if (nestedFacets.length > 0) {
    const errorSource = nestedFacets.find((f) => f === 'error.source');
    const acquisitionSource = nestedFacets.find((f) => f === 'acquisition.source');

    if (errorSource && dashboardData.segments[errorSource]?.length > 0) {
      const exampleValue = dashboardData.segments[errorSource][0].value;
      sections.push(
        '\n2️⃣ Nested facet (checkbox + drilldown):',
        '⚠️ Include metrics inside the span to make them clickable!',
        `<p>• <span data-facet="checkpoint" data-facet-value="error" data-nested-facet="error.source" data-nested-value="${exampleValue}">${exampleValue} errors affecting <span class="num">1,234</span> users</span>.</p>`,
        `Result: Checks "error" checkbox AND selects "${exampleValue}" in error.source drilldown - entire phrase with number is clickable`,
        `URL result: &checkpoint=error&error.source=${exampleValue}`,
      );
    }

    if (acquisitionSource && dashboardData.segments[acquisitionSource]?.length > 0) {
      const paidValue = dashboardData.segments[acquisitionSource].find((item) => item.value === 'paid');
      if (paidValue) {
        sections.push(
          '\n⚠️ IMPORTANT - ALWAYS USE "value" FIELD, NOT "text" OR "label":',
          '',
          'Example 1 - Device Type:',
          'Tool returns: {"text": "All Mobile", "value": "mobile", "count": 8100}',
          '✅ CORRECT: <span data-facet="userAgent" data-facet-value="mobile">Mobile users with <span class="num">8.1k</span> sessions</span>',
          '❌ WRONG: <span data-facet-value="All Mobile"> (uses text field - will NOT work)',
          '',
          'Example 2 - Acquisition Source:',
          'Tool returns: {"text": "Paid Traffic", "value": "paid", "count": 1234}',
          '✅ CORRECT: <span data-facet="checkpoint" data-facet-value="acquisition" data-nested-facet="acquisition.source" data-nested-value="paid">Paid traffic shows <span class="num">1,234</span> conversions</span>',
          '❌ WRONG: <span data-nested-value="Paid Traffic">... (uses text field - will NOT work)',
          '',
          'REMEMBER: Always inspect the "value" field in tool responses, ignore "text" and "label" fields for data attributes',
          '⚠️ KEY POINT: Wrap your complete insight (including metrics) inside the data-facet span to make everything clickable!',
        );
      }
    }
  }

  sections.push(
    '\n❌ INVALID EXAMPLES (will NOT check checkboxes):',
    '• <span data-facet="browser">Chrome</span> - Wrong name! Use "userAgent" not "browser"',
    '• <span data-nested-facet="error.source" data-nested-value="network">Errors</span> - Missing parent checkpoint!',
    '• <span data-facet="checkpoint" data-facet-value="error">Errors</span> - Incomplete! If talking about error.source, include nested attributes!',
    '\n⚠️ CRITICAL RULES - LINKS MUST BE DATA-BACKED:',
    '  1. ONLY create links for values you see in TOOL RESPONSES (not assumptions or inferences)',
    '  2. ALWAYS use the "value" field from tool response, NEVER the "text" or "label" field',
    '     Tool returns: {"text": "All Mobile", "value": "mobile", "count": 8100}',
    '     ✅ USE: data-facet-value="mobile"',
    '     ❌ NEVER: data-facet-value="All Mobile"',
    '  3. When a tool returns {"value": "mobile:ios", "count": 123}, use "mobile:ios" exactly',
    '  4. DO NOT create links for values you think might exist but didn\'t see in tools',
    '  5. Use EXACT value format from tool (e.g., URLs with trailing slash: "https://example.com/")',
    '  6. Simple facets: <span data-facet="NAME" data-facet-value="VALUE">text</span>',
    '  7. Nested facets (parent.child): ALWAYS include ALL 4 attributes:',
    '     - data-facet="checkpoint" (parent)',
    '     - data-facet-value="PARENT" (e.g., "error", "acquisition", "click")',
    '     - data-nested-facet="PARENT.CHILD" (e.g., "error.source", "acquisition.source")',
    '     - data-nested-value="VALUE" (exact "value" field from tool, not "text" field)',
    '  8. When discussing aggregate patterns without specific values, DO NOT create links',
    '  9. Example: "Mobile users have slower performance" → NO LINK (aggregate, no specific value)',
    '  10. Example: "mobile:ios users have 2.5s LCP" → LINK (specific value from tool)',
    '  11. INCLUDE METRICS INSIDE SPANS: Put relevant numbers/metrics inside the data-facet span to make them clickable',
    '      ✅ CORRECT: <span data-facet="url" data-facet-value="/checkout">The /checkout page has <span class="num">3.2s</span> LCP</span>',
    '      ❌ WRONG: <span data-facet="url" data-facet-value="/checkout">The /checkout page</span> has 3.2s LCP',
    '      (In the wrong example, only "The /checkout page" becomes clickable, not the metric)',
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
 * Private helper function used by convertSpansToLinks()
 * @param {string|Object} facetName - The facet name or object with multiple facets
 * @param {string} facetValue - The facet value to filter by (ignored if facetName is object)
 * @param {Object} options - Additional options
 * @param {boolean} options.preserveExisting - Keep existing URL params (default: false)
 * @param {string} options.nestedFacet - Nested facet name (e.g., 'cwv-lcp.source')
 * @param {string} options.nestedValue - Nested facet value (e.g., 'img')
 * @returns {string} Dashboard URL with facet parameter(s)
 */
function generateFacetLink(facetName, facetValue, options = {}) {
  const { preserveExisting = false, nestedFacet, nestedValue } = options;
  const currentParams = new URL(window.location.href).searchParams;
  const params = new URLSearchParams();

  // Copy params based on preservation mode
  const paramsToCopy = preserveExisting
    ? Array.from(currentParams.entries())
    : ['domain', 'domainkey', 'view', 'startDate', 'endDate', 'metrics']
      .filter((p) => currentParams.has(p))
      .map((p) => [p, currentParams.get(p)]);

  paramsToCopy.forEach(([key, value]) => params.set(key, value));
  params.delete('report'); // Remove report viewer UI parameter

  // Add facet parameters (normalize URLs)
  const addParam = (name, value) => params.append(name, name === 'url' ? normalizeUrl(value) : value);

  if (typeof facetName === 'object' && !Array.isArray(facetName)) {
    Object.entries(facetName).forEach(([name, value]) => addParam(name, value));
  } else {
    addParam(facetName, facetValue);
    if (nestedFacet && nestedValue) params.append(nestedFacet, nestedValue);
  }

  // Return relative URL (pathname + search params) so it works on any domain
  const { pathname } = window.location;
  const queryString = params.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
}

/**
 * Validate if a facet value exists in dashboard data
 * @param {string} facetName - Facet name
 * @param {string} facetValue - Facet value to check
 * @param {string} nestedFacet - Optional nested facet name
 * @param {string} nestedValue - Optional nested value
 * @returns {boolean} True if value exists in dashboard
 */
function validateFacetValue(facetName, facetValue, nestedFacet, nestedValue) {
  try {
    const facets = document.querySelector('facet-sidebar')?.facets;
    if (!facets) return true; // Can't validate, allow

    const checkExists = (data, value, isUrl) => {
      if (!data) return false;
      if (!isUrl) return data.some((item) => item.value === value);

      // For URLs, check with and without trailing slash
      return data.some((item) => item.value === value
        || item.value === `${value}/`
        || (value.endsWith('/') && item.value === value.slice(0, -1)));
    };

    // Validate main facet value
    if (!checkExists(facets[facetName], facetValue, facetName === 'url')) return false;

    // Validate nested facet if provided
    if (nestedFacet && !checkExists(facets[nestedFacet], nestedValue, nestedFacet === 'url')) return false;

    return true;
  } catch (error) {
    console.warn('[Facet Link Generator] Validation error:', error);
    return true;
  }
}

/**
 * Convert data-attribute spans to actual clickable links in HTML
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

  let converted = 0;
  let skipped = 0;

  facetElements.forEach((el) => {
    const facetName = el.getAttribute('data-facet');
    const facetValue = el.getAttribute('data-facet-value');
    if (!facetName || !facetValue) return;

    const nestedFacet = el.getAttribute('data-nested-facet');
    const nestedValue = el.getAttribute('data-nested-value');

    if (!validateFacetValue(facetName, facetValue, nestedFacet, nestedValue)) {
      skipped += 1;
      return;
    }

    const anchor = Object.assign(doc.createElement('a'), {
      href: generateFacetLink(facetName, facetValue, { nestedFacet, nestedValue }),
      className: 'facet-link',
      innerHTML: el.innerHTML,
      title: `View ${facetName}: ${facetValue}${nestedFacet ? ` → ${nestedFacet}: ${nestedValue}` : ''}`,
    });
    Object.assign(anchor.style, { color: '#0073e6', textDecoration: 'underline' });

    el.parentNode.replaceChild(anchor, el);
    converted += 1;
  });

  console.log(`[Facet Link Generator] ✓ ${converted} links created${skipped ? `, ${skipped} skipped` : ''}`);
  return doc.body.innerHTML;
}
