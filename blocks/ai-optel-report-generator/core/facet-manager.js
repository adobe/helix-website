/**
 * Facet Manager - Handles facet tool extraction and manipulation
 */

/* eslint-disable no-console */

let cachedFacetTools = null;

/** Create tool definition for a facet */
function createToolDefinition(facetName, description) {
  return {
    name: facetName.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64),
    description: `${description}. Use this tool to analyze data based on the ${facetName} facet.`,
    input_schema: {
      type: 'object',
      properties: {
        operation: {
          type: 'string',
          enum: ['filter', 'analyze', 'summarize'],
          description: 'The operation to perform on the facet',
        },
        value: {
          type: 'string',
          description: 'The value to use for the operation (required for filter)',
        },
      },
      required: ['operation'],
    },
  };
}

/** Extract facets from DOM and convert to tool definitions */
export function extractFacetsFromExplorer() {
  if (cachedFacetTools) return cachedFacetTools;

  const sidebar = document.querySelector('facet-sidebar');
  if (!sidebar) {
    console.error('[Facet Manager] Sidebar not found');
    return [];
  }

  const { dataChunks } = sidebar;
  const facetElements = sidebar.querySelectorAll(
    'list-facet, link-facet, literal-facet, file-facet, thumbnail-facet',
  );

  const tools = [];
  const skipped = [];

  facetElements.forEach((el) => {
    const facetName = el.getAttribute('facet');
    if (!facetName) return;

    const hasLabels = el.querySelectorAll('label').length > 0;
    const facetData = dataChunks?.facets?.[facetName];

    // Skip empty facets
    if (dataChunks?.facets && (!facetData || facetData.length === 0 || !hasLabels)) {
      skipped.push(facetName);
      return;
    }
    if (!dataChunks?.facets && !hasLabels) {
      skipped.push(facetName);
      return;
    }

    const helpTitle = el.querySelector('a.help[title]')?.getAttribute('title');
    const legendText = el.querySelector('legend')?.textContent;
    const description = helpTitle || legendText || `Analyze data based on ${facetName}`;

    tools.push(createToolDefinition(facetName, description));
  });

  console.log(`[Facet Manager] Extracted ${tools.length} tools, skipped ${skipped.length} empty facets`);
  cachedFacetTools = tools;
  return tools;
}

/** DOM Operation Queue to prevent conflicts during filter operations */
class DOMOperationQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
  }

  enqueue(operation) {
    return new Promise((resolve, reject) => {
      this.queue.push({ operation, resolve, reject });
      this.processQueue().catch(() => {}); // Trigger processing, errors handled per-item
    });
  }

  async processNext() {
    if (this.queue.length === 0) {
      this.isProcessing = false;
      return;
    }

    const { operation, resolve, reject } = this.queue.shift();
    try {
      const result = await operation();
      resolve(result);
      await new Promise((r) => { setTimeout(r, 500); });
    } catch (error) {
      reject(error);
    }

    // Recursion avoids await-in-loop lint issue
    await this.processNext();
  }

  async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;
    await this.processNext();
  }
}

const domOperationQueue = new DOMOperationQueue();

/** Extract label data from a facet element */
function extractLabelData(facetEl, includeMetrics = false) {
  return Array.from(facetEl.querySelectorAll('label')).map((label) => {
    const text = label.querySelector('.label')?.textContent?.trim()
      || label.querySelector('.value')?.textContent?.trim()
      || label.querySelector('span')?.textContent?.trim();
    if (!text) return null;

    const countEl = label.querySelector('number-format.count') || label.querySelector('number-format');
    const countTitle = countEl?.getAttribute('title') || '0';
    const count = parseInt(countTitle.split(' ')[0].replace(/\D/g, ''), 10) || 0;

    const item = { text, displayCount: countEl?.textContent?.trim() || '0', count };

    if (includeMetrics) {
      const cwv = label.nextElementSibling?.querySelector?.('ul.cwv');
      if (cwv) {
        item.metrics = {};
        cwv.querySelectorAll('li').forEach((li) => {
          const title = li.getAttribute('title')?.split(' - ')[0];
          const val = li.querySelector('number-format')?.textContent?.trim();
          if (title && val) {
            item.metrics[title] = { value: val, classes: Array.from(li.classList).join(' ') };
          }
        });
      }
    }
    return item;
  }).filter(Boolean);
}

/** Handle dynamic facet tool calls from AI */
export async function handleDynamicFacetToolCall(toolName, input, useQueue = true) {
  const facetName = toolName.replace(/_/g, '.');
  const facetEl = document.querySelector(`[facet="${facetName}"]`);

  if (!facetEl) {
    return { success: false, message: `Facet element not found for ${facetName}` };
  }

  const { operation, value } = input;

  const performOperation = async () => {
    try {
      switch (operation) {
        case 'filter': {
          if (!value) return { success: false, message: 'Filter operation requires a value' };
          const filterInput = facetEl.querySelector(`input[value="${value}"]`);
          if (!filterInput) return { success: false, message: `Filter value ${value} not found` };
          filterInput.click();
          await new Promise((r) => { setTimeout(r, 1000); });
          return { success: true, message: `Applied filter: ${value}` };
        }

        case 'analyze': {
          const items = extractLabelData(facetEl, true);
          return {
            success: true,
            facetName,
            totalItems: items.length,
            items: items.slice(0, 5),
            summary: `Found ${items.length} items in ${facetName}`,
          };
        }

        case 'summarize': {
          const items = extractLabelData(facetEl, false);
          const total = items.reduce((sum, i) => sum + i.count, 0);
          return {
            success: true,
            facetName,
            totalItems: items.length,
            totalCount: total,
            topItems: items.slice(0, 3),
            summary: `${facetName} has ${items.length} unique values with ${total} total occurrences`,
          };
        }

        default:
          return { success: false, message: `Unknown operation: ${operation}` };
      }
    } catch (error) {
      console.error('[Facet Manager] Error:', error);
      return { success: false, message: `Error processing ${facetName}: ${error.message}` };
    }
  };

  // Use queue for filter operations to prevent DOM conflicts
  return operation === 'filter' && useQueue
    ? domOperationQueue.enqueue(performOperation)
    : performOperation();
}

/** Initialize dynamic facets monitoring */
export function initializeDynamicFacets() {
  const extractFacets = () => extractFacetsFromExplorer();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', extractFacets);
  } else {
    setTimeout(extractFacets, 100);
  }

  // Monitor for new facets
  let timeout;
  const debouncedExtract = () => {
    clearTimeout(timeout);
    timeout = setTimeout(extractFacets, 250);
  };

  const observer = new MutationObserver((mutations) => {
    if (timeout) return;
    const hasFacets = mutations.some((m) => Array.from(m.addedNodes).some((n) => {
      if (n.nodeType !== Node.ELEMENT_NODE) return false;
      const tag = n.tagName?.toLowerCase() || '';
      return tag.includes('facet')
        || n.querySelector?.('list-facet, link-facet, literal-facet, file-facet, thumbnail-facet');
    }));
    if (hasFacets) debouncedExtract();
  });

  const sidebar = document.querySelector('facet-sidebar');
  observer.observe(sidebar || document.body, { childList: true, subtree: !!sidebar });
}

/** Reset cached facet tools */
export function resetCachedFacetTools() {
  cachedFacetTools = null;
}
