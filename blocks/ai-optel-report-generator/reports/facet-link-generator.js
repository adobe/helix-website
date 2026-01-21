/**
 * Facet Link Generator - Creates dashboard links with facet parameters for report navigation
 */

/** Build facet info section for AI prompt (instructions on creating clickable links) */
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
    '\n\n==== AVAILABLE FACETS FOR LINKING ====',
    'When creating your report, wrap findings in <span> tags with data attributes to make them clickable.',
    '',
    'CRITICAL: All links PRESERVE existing url and userAgent filters in the URL',
    '   Checkpoint may be changed/added based on the link, but url/userAgent context is never lost.',
    '',
    'FACET LINKING STRUCTURE:',
    '  • Main facets: checkpoint, url, userAgent (required)',
    '  • Nested facets: parent.source, parent.target (optional, can use one or both)',
    '',
    'MAIN FACETS (required for all links):',
    ...simpleFacets.filter((f) => ['checkpoint', 'url', 'userAgent'].includes(f)).map((f) => formatFacet(f)),
    '',
    'NESTED FACETS - ONLY USE THESE EXACT NAMES (can be combined independently):',
    ...nestedFacets.map((f) => {
      const parent = f.split('.')[0];
      const values = dashboardData.segments[f]?.slice(0, 2).map((item) => item.value).join('", "') || '';
      return `- ${f} (parent: ${parent}): Example values "${values}"`;
    }),
    '',
    'NESTED FACET COMBINATIONS (all valid):',
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
    'CRITICAL: ONLY use nested facet names from the list above. DO NOT invent nested facet names!',
  ];

  sections.push(
    '\nCORRECT USAGE EXAMPLES:',
    '',
    'IMPORTANT: Include relevant metrics/numbers INSIDE the data-facet span so they become part of the clickable link!',
    'Use <number-format> tags with proper attributes for all numbers (see Number Formatting section).',
    '',
    '1. SIMPLE LINK (Main facet only - Checkpoint):',
    '<p>• <span data-facet="checkpoint" data-facet-value="lcp">LCP events show <number-format title="2.3s ±0.4s" sample-size="1234"><span class="formatted-value">2.3s</span></number-format> average load time</span>.</p>',
    'URL: ?checkpoint=lcp',
    '',
    '2. SIMPLE LINK (Main facet only - URL):',
    '<p>• <span data-facet="url" data-facet-value="/checkout">The /checkout page has <number-format title="65% ±5%" sample-size="450"><span class="formatted-value">65%</span></number-format> bounce rate</span>.</p>',
    'URL: ?url=/checkout',
    '',
    '3. SIMPLE LINK (Main facet only - UserAgent):',
    'Tool returns: {"text": "All Mobile", "value": "mobile", "count": 8100}',
    'CORRECT: <span data-facet="userAgent" data-facet-value="mobile">Mobile users have <number-format sample-size="8100"><span class="formatted-value">8.1k</span></number-format> page views</span>',
    'WRONG: <span data-facet-value="All Mobile">... (uses "text" field - will NOT work)',
    'ALWAYS use the "value" field from tool response, NEVER use "text" or "label"',
    '',
    '4. NESTED LINK (One nested facet - error.source):',
    '<p>• <span data-facet="checkpoint" data-facet-value="error" data-nested-facet="error.source" data-nested-value="network">Network errors affect <number-format sample-size="456"><span class="formatted-value">456</span></number-format> users</span>.</p>',
    'URL: ?checkpoint=error&error.source=network',
    '',
    '5. NESTED LINK (One nested facet - error.target directly, without source):',
    '<p>• <span data-facet="checkpoint" data-facet-value="error" data-nested-facet="error.target" data-nested-value="TypeError: Cannot read property">This TypeError affects <number-format sample-size="89"><span class="formatted-value">89</span></number-format> users</span>.</p>',
    'URL: ?checkpoint=error&error.target=TypeError: Cannot read property',
    'You can link directly to error.target WITHOUT specifying error.source!',
    '',
    '6. NESTED LINK (Two nested facets - both source and target):',
    '<p>• <span data-facet="checkpoint" data-facet-value="error" data-nested-facet="error.source" data-nested-value="network" data-nested-facet-2="error.target" data-nested-value-2="TypeError: Cannot read property">This specific TypeError from network: <number-format sample-size="45"><span class="formatted-value">45</span></number-format></span>.</p>',
    'URL: ?checkpoint=error&error.source=network&error.target=TypeError: Cannot read property',
    '',
    '7. NESTED LINK (Click target URL - EXACT URL from tool required):',
    'Tool returns: {"facet": "click.target", "value": "https://example.com/watch-collection.html", "count": 123}',
    'CORRECT: <span data-facet="checkpoint" data-facet-value="click" data-nested-facet="click.target" data-nested-value="https://example.com/watch-collection.html">Watch collection clicks</span>',
    'WRONG: data-nested-value="https://example.com/watches.html" (different URL - will NOT work!)',
    'For nested facets with URLs: Use the EXACT full URL from tool response',
    '',
    'WHEN TO USE NESTED FACETS:',
    '  • Use one nested facet when you have data for that specific dimension',
    '  • Use two nested facets when you have data for both and want precise filtering',
    '  • You can use .target WITHOUT .source - they are independent filters!',
    '  ONLY create nested links if you called a tool for that nested facet!',
  );

  sections.push(
    '\nINVALID EXAMPLES (will NOT work):',
    '• <span data-facet="browser">Chrome</span> - Wrong facet! Use "userAgent" not "browser"',
    '• <span data-facet="device">mobile</span> - Wrong facet! Use "userAgent" not "device"',
    '• <span data-nested-facet="error.source" data-nested-value="network">...</span> - Missing parent checkpoint!',
    '• <span data-facet="url" data-facet-value="/checkout">The page</span> has 3.2s LCP - Metric outside span!',
    '',
    'CRITICAL RULES:',
    '  1. MAIN FACET REQUIRED: Every link needs data-facet and data-facet-value',
    '  2. NESTED FACETS ARE OPTIONAL: Add them when you have specific drill-down data',
    '  3. NESTED FACETS ARE INDEPENDENT: You can use .source, .target, or both',
    '  4. ONLY create links for values AND facet names you see in TOOL RESPONSES',
    '     DO NOT invent nested facet names - verify from "NESTED FACETS" list above',
    '  5. ALWAYS use the EXACT "value" field from tool response, NEVER "text" or "label"',
    '     Tool returns: {"text": "All Mobile", "value": "mobile", "count": 8100}',
    '     USE: data-facet-value="mobile"',
    '     NEVER: data-facet-value="All Mobile"',
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

/** Normalize URL values to match dashboard format */
function normalizeUrl(url) {
  if (!url || typeof url !== 'string') return url;

  const normalized = url.replace(/([^:]\/)\/+/g, '$1');

  const facetSidebar = document.querySelector('facet-sidebar');
  const urlData = facetSidebar?.facets?.url;
  if (urlData) {
    if (urlData.some((item) => item.value === normalized)) {
      return normalized;
    }
    if (!normalized.endsWith('/') && urlData.some((item) => item.value === `${normalized}/`)) {
      return `${normalized}/`;
    }
    if (normalized.endsWith('/') && urlData.some((item) => item.value === normalized.slice(0, -1))) {
      return normalized.slice(0, -1);
    }
  }

  return normalized;
}

/** Generate dashboard URL with facet params (preserves existing url/userAgent filters) */
function generateFacetLink(facetName, facetValue, options = {}) {
  const {
    nestedFacet, nestedValue, nestedFacet2, nestedValue2,
  } = options;
  const currentParams = new URL(window.location.href).searchParams;
  const params = new URLSearchParams();

  ['domain', 'domainkey', 'view', 'startDate', 'endDate', 'metrics']
    .filter((p) => currentParams.has(p))
    .forEach((p) => params.set(p, currentParams.get(p)));

  // Preserve existing filters (will be overridden if link changes them)
  ['checkpoint', 'url', 'userAgent']
    .filter((p) => currentParams.has(p))
    .forEach((p) => params.set(p, currentParams.get(p)));

  params.delete('report');

  const addParam = (name, value) => {
    const isUrl = name === 'url' || (typeof value === 'string' && value.startsWith('http'));
    params.set(name, isUrl ? normalizeUrl(value) : value);
  };

  if (typeof facetName === 'object' && !Array.isArray(facetName)) {
    Object.entries(facetName).forEach(([name, value]) => addParam(name, value));
  } else {
    addParam(facetName, facetValue);

    if (nestedFacet && nestedValue) {
      addParam(nestedFacet, nestedValue);
    }

    if (nestedFacet2 && nestedValue2) {
      addParam(nestedFacet2, nestedValue2);
    }
  }

  const { pathname } = window.location;
  const queryString = params.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
}

/** Correct display text to actual value (e.g., "OneTrust" → "onetrust") */
function correctValue(facetName, text) {
  const sidebar = document.querySelector('facet-sidebar');
  if (!sidebar) return text;

  const lc = text.toLowerCase();

  const sel = `label[for^="${CSS.escape(facetName)}-"], label[for^="${CSS.escape(facetName)}="]`;
  const label = Array.from(sidebar.querySelectorAll(sel))
    .find((l) => l.querySelector('.label')?.textContent?.trim().toLowerCase() === lc);
  const dom = label?.querySelector('.value')?.textContent?.trim();
  if (dom && dom !== text) { /* log(dom, 'DOM'); */ return dom; }

  if (facetName.includes('.')) {
    const match = sidebar.facets?.[facetName]?.find(
      (i) => i.value?.toLowerCase() === lc || (i.text || i.value)?.toLowerCase() === lc,
    );
    if (match?.value && match.value !== text) {
      /* log(match.value, 'data'); */
      return match.value;
    }
  }

  return text;
}

/** Validate facet value exists in data and checkbox is clickable */
function isValidFacetValue(facetName, value) {
  const sidebar = document.querySelector('facet-sidebar');
  if (!sidebar) return true;

  const { facets } = sidebar;
  const isUrl = facetName === 'url' || value?.startsWith('http');
  const isNested = facetName.includes('.');

  const data = facets?.[facetName];
  if (!data) return facetName === 'checkpoint' || isNested;

  const inData = isUrl
    ? data.some((i) => i.value === value || i.value === `${value}/` || i.value === value.replace(/\/$/, ''))
    : data.some((i) => i.value === value);
  if (!inData) return false;

  if (facetName === 'checkpoint' || isNested) return true;

  const find = (id) => sidebar.querySelector(`input[id="${CSS.escape(id)}"]`);
  let cb = find(`${facetName}=${value}`);
  if (!cb && isUrl) {
    cb = find(`${facetName}=${value}/`) || find(`${facetName}=${value.replace(/\/$/, '')}`);
  }
  return cb && !cb.disabled;
}

/** Convert data-attribute spans to clickable <a> links (validates values exist in dashboard) */
export function convertSpansToLinks(htmlContent) {
  if (!htmlContent?.includes('data-facet')) return htmlContent;

  const doc = new DOMParser().parseFromString(htmlContent, 'text/html');
  if (doc.querySelector('parsererror')) {
    // eslint-disable-next-line no-console
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

    const nestedFacet = el.getAttribute('data-nested-facet');
    const nestedValue = el.getAttribute('data-nested-value');
    const nestedFacet2 = el.getAttribute('data-nested-facet-2');
    const nestedValue2 = el.getAttribute('data-nested-value-2');

    if ((nestedFacet && !nestedValue) || (!nestedFacet && nestedValue)) {
      stats.skippedNested.push(`${facetName}="${facetValue}" (incomplete nested facet attributes)`);
      return;
    }

    if ((nestedFacet2 && !nestedValue2) || (!nestedFacet2 && nestedValue2)) {
      stats.skippedNested.push(`${facetName}="${facetValue}" (incomplete nested facet 2 attributes)`);
      return;
    }

    if ((nestedFacet || nestedFacet2) && facetName !== 'checkpoint') {
      stats.skippedNested.push(`${facetName}="${facetValue}" (nested facets require checkpoint as parent)`);
      return;
    }

    const facets = document.querySelector('facet-sidebar')?.facets;
    if (nestedFacet && facets && !facets[nestedFacet]) {
      stats.skippedNested.push(`${nestedFacet}="${nestedValue}" (nested facet "${nestedFacet}" does not exist)`);
      // eslint-disable-next-line no-console
      console.error(`[Facet Link Generator] AI generated invalid nested facet: "${nestedFacet}". This facet does not exist!`);
      return;
    }
    if (nestedFacet2 && facets && !facets[nestedFacet2]) {
      stats.skippedNested.push(`${nestedFacet2}="${nestedValue2}" (nested facet "${nestedFacet2}" does not exist)`);
      // eslint-disable-next-line no-console
      console.error(`[Facet Link Generator] AI generated invalid nested facet: "${nestedFacet2}". This facet does not exist!`);
      return;
    }

    if (!['checkpoint', 'url', 'userAgent'].includes(facetName)) {
      stats.skippedInvalidFacet.push(`${facetName}="${facetValue}"`);
      return;
    }

    const cv = correctValue(facetName, facetValue);
    const cn = nestedFacet ? correctValue(nestedFacet, nestedValue) : null;
    const cn2 = nestedFacet2 ? correctValue(nestedFacet2, nestedValue2) : null;

    const allValid = isValidFacetValue(facetName, cv)
      && (!nestedFacet || isValidFacetValue(nestedFacet, cn))
      && (!nestedFacet2 || isValidFacetValue(nestedFacet2, cn2));

    if (!allValid) {
      stats.skippedNonExistent.push(`${facetName}="${facetValue}"`);
      return;
    }

    let title = `View ${facetName}: ${cv}`;
    if (nestedFacet) title += ` + ${nestedFacet}: ${cn}`;
    if (nestedFacet2) title += ` + ${nestedFacet2}: ${cn2}`;

    const anchor = Object.assign(doc.createElement('a'), {
      href: generateFacetLink(facetName, cv, {
        nestedFacet, nestedValue: cn, nestedFacet2, nestedValue2: cn2,
      }),
      className: 'facet-link',
      innerHTML: el.innerHTML,
      title,
    });
    Object.assign(anchor.style, { color: '#0073e6', textDecoration: 'underline' });

    el.parentNode.replaceChild(anchor, el);
    stats.converted += 1;

    if (nestedFacet && nestedFacet2) {
      stats.twoNested += 1;
    } else if (nestedFacet || nestedFacet2) {
      stats.oneNested += 1;
    } else {
      stats.simpleLinks += 1;
    }
  });

  return doc.body.innerHTML;
}
