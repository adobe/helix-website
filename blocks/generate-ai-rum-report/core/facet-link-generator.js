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

  let section = '\n\n==== 🔗 AVAILABLE FACETS FOR LINKING ====\n';
  section += 'When creating your report, wrap findings in <span> tags with data attributes to make them clickable.\n';
  section += 'The following facets are available in the dashboard and can be linked:\n\n';

  // Separate simple facets from nested facets
  const simpleFacets = facetList.filter((f) => !f.includes('.'));
  const nestedFacets = facetList.filter((f) => f.includes('.'));

  section += 'SIMPLE FACETS (single parameter):\n';
  simpleFacets.forEach((facet) => {
    const topValues = dashboardData.segments[facet]
      .slice(0, 2)
      .map((item) => item.value)
      .join('", "');
    section += `- ${facet}: Example values "${topValues}"\n`;
  });

  if (nestedFacets.length > 0) {
    section += '\nNESTED FACETS (require parent checkpoint + nested parameter):\n';
    nestedFacets.forEach((facet) => {
      const topValues = dashboardData.segments[facet]
        .slice(0, 2)
        .map((item) => item.value)
        .join('", "');
      const parentCheckpoint = facet.split('.')[0];
      section += `- ${facet}: Parent="${parentCheckpoint}", Example values "${topValues}"\n`;
    });
  }

  section += '\nEXAMPLE USAGE:\n';
  section += 'Simple facet:\n';
  section += '<p>• <span data-facet="checkpoint" data-facet-value="click">Click events show strong engagement</span> with 1,234 interactions.</p>\n';
  section += '<p>• <span data-facet="url" data-facet-value="/products">The /products page</span> has a 65% bounce rate.</p>\n';

  if (nestedFacets.length > 0) {
    // Find a good nested facet example
    const errorSource = nestedFacets.find((f) => f === 'error.source');
    const acquisitionSource = nestedFacets.find((f) => f === 'acquisition.source');

    if (errorSource && dashboardData.segments[errorSource]?.length > 0) {
      const exampleValue = dashboardData.segments[errorSource][0].value;
      section += '\nNested facet (BOTH checkpoint AND nested):\n';
      section += `<p>• <span data-facet="checkpoint" data-facet-value="error" data-nested-facet="error.source" data-nested-value="${exampleValue}">${exampleValue} errors</span> affecting users.</p>\n`;
      section += `URL result: &checkpoint=error&error.source=${exampleValue}\n`;
    }

    if (acquisitionSource && dashboardData.segments[acquisitionSource]?.length > 0) {
      const paidValue = dashboardData.segments[acquisitionSource].find((item) => item.value === 'paid');
      if (paidValue) {
        section += '\n⚠️ ACTUAL VALUE vs DISPLAY TEXT:\n';
        section += 'When tool returns: {"value": "paid", "count": 1234}\n';
        section += '✅ CORRECT: <span data-facet="checkpoint" data-facet-value="acquisition" data-nested-facet="acquisition.source" data-nested-value="paid">All paid traffic</span>\n';
        section += '❌ WRONG: <span data-nested-value="All paid traffic">...</span> (do NOT use display text in data attribute)\n';
        section += 'URL result: &checkpoint=acquisition&acquisition.source=paid\n';
      }
    }
  }

  section += '\n⚠️ CRITICAL RULES:\n';
  section += '  1. For .source/.target facets: data-facet="checkpoint" + data-nested-facet + data-nested-value\n';
  section += '  2. Use EXACT facet value from tool results (e.g., "paid", not "All paid traffic")\n';
  section += '  3. Display text goes INSIDE span, actual value goes in data-* attributes\n';
  section += '  4. Never use human-readable labels or descriptions as facet values\n';
  section += '==== END FACET INFO ====\n\n';

  return section;
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
 * @param {Object} options.dateRange - Date range to include {startDate, endDate}
 * @returns {string} Dashboard URL with facet parameter(s)
 */
function generateFacetLink(facetName, facetValue, options = {}) {
  const {
    preserveExisting = false, nestedFacet, nestedValue, dateRange,
  } = options;

  // Build search params instead of full URL to make links relative
  const params = new URLSearchParams();

  // If not preserving, copy only essential params
  if (!preserveExisting) {
    const currentParams = new URL(window.location.href).searchParams;
    // Essential params that should always be preserved
    const essentialParams = ['domain', 'domainkey'];

    essentialParams.forEach((param) => {
      if (currentParams.has(param)) {
        params.set(param, currentParams.get(param));
      }
    });

    // Add date range from report metadata (takes precedence over current URL)
    if (dateRange?.startDate && dateRange?.endDate) {
      params.set('startDate', dateRange.startDate);
      params.set('endDate', dateRange.endDate);
      params.set('view', 'custom');
    } else {
      // Fall back to current URL params if no date range provided
      ['view', 'startDate', 'endDate'].forEach((param) => {
        if (currentParams.has(param)) {
          params.set(param, currentParams.get(param));
        }
      });
    }
  } else {
    // Preserve all existing params
    const currentParams = new URL(window.location.href).searchParams;
    currentParams.forEach((value, key) => {
      params.set(key, value);
    });
  }

  // Remove ONLY the report viewer UI parameter
  // Keep view, startDate, endDate so dashboard shows data from report's time period
  params.delete('report');

  // Handle multiple facets passed as object
  if (typeof facetName === 'object' && !Array.isArray(facetName)) {
    Object.entries(facetName).forEach(([name, value]) => {
      params.append(name, value);
    });
  } else {
    // Add the primary facet parameter
    params.append(facetName, facetValue);

    // Add nested facet if provided
    if (nestedFacet && nestedValue) {
      params.append(nestedFacet, nestedValue);
    }
  }

  // Return relative URL (pathname + search params) so it works on any domain
  const { pathname } = window.location;
  const queryString = params.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
}

/**
 * Convert data-attribute spans to actual clickable links in HTML
 * This makes links work in the uploaded DA report without client-side JS
 * @param {string} htmlContent - HTML content with data-attribute spans
 * @param {Object} dateRange - Date range metadata {startDate, endDate}
 * @returns {string} HTML with actual <a> links
 */
export function convertSpansToLinks(htmlContent, dateRange = {}) {
  // If no content or no spans to convert, return original
  if (!htmlContent || !htmlContent.includes('data-facet')) {
    return htmlContent;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');

  // Check for parser errors
  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    console.error('[Facet Link Generator] Parser error:', parserError.textContent);
    return htmlContent; // Return original if parsing failed
  }

  // Find all elements with data-facet attributes
  const facetElements = doc.querySelectorAll('[data-facet][data-facet-value]');

  if (facetElements.length === 0) {
    return htmlContent; // No spans to convert, return original
  }

  console.log(`[Facet Link Generator] Converting ${facetElements.length} spans to links`);

  facetElements.forEach((element) => {
    const facetName = element.getAttribute('data-facet');
    const facetValue = element.getAttribute('data-facet-value');

    if (!facetName || !facetValue) return;

    // Check for nested facet
    const nestedFacet = element.getAttribute('data-nested-facet');
    const nestedValue = element.getAttribute('data-nested-value');

    // Generate link URL with date range
    const linkUrl = generateFacetLink(facetName, facetValue, {
      nestedFacet,
      nestedValue,
      dateRange,
    });

    // Create anchor element
    const anchor = doc.createElement('a');
    anchor.href = linkUrl;
    anchor.className = 'facet-link';
    anchor.innerHTML = element.innerHTML;
    anchor.style.color = '#0073e6';
    anchor.style.textDecoration = 'underline';

    // Build tooltip text
    let tooltipText = `View ${facetName}: ${facetValue}`;
    if (nestedFacet && nestedValue) {
      tooltipText += ` → ${nestedFacet}: ${nestedValue}`;
    }
    anchor.title = tooltipText;

    // Replace span with anchor
    element.parentNode.replaceChild(anchor, element);
  });

  // Return the processed HTML
  return doc.body.innerHTML;
}
