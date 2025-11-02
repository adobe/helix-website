/**
 * Facet Manager Module
 * Handles facet tool extraction, initialization, and manipulation
 */

/* eslint-disable no-console */

// Cache for facet tools
let cachedFacetTools = null;

/**
 * Create tool definition for a facet
 * @param {string} facetName - Original facet name
 * @param {string} description - Tool description
 * @returns {Object} Tool definition object
 */
function createToolDefinition(facetName, description) {
  const sanitizedName = facetName.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64);

  return {
    name: sanitizedName,
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

/**
 * Extract facets from DOM and convert to tool definitions
 * @returns {Array} Array of tool definitions
 */
export function extractFacetsFromExplorer() {
  if (cachedFacetTools) {
    return cachedFacetTools;
  }

  const facetSidebar = document.querySelector('facet-sidebar');
  if (!facetSidebar) {
    console.error('[Facet Extraction] Facet sidebar not found');
    return [];
  }

  const { dataChunks } = facetSidebar;
  const facetElements = facetSidebar.querySelectorAll('list-facet, link-facet, literal-facet, file-facet, thumbnail-facet');

  const tools = [];
  facetElements.forEach((facetElement) => {
    const facetName = facetElement.getAttribute('facet');
    if (!facetName) return;

    // Skip empty facets
    if (dataChunks && dataChunks.facets) {
      const facetData = dataChunks.facets[facetName];
      if (!facetData || facetData.length === 0) {
        return;
      }
    }

    // Get description from help link or legend
    const helpLink = facetElement.querySelector('a.help[title]');
    const helpTitle = helpLink ? helpLink.getAttribute('title') : null;
    const legendElement = facetElement.querySelector('legend');
    const legendText = legendElement ? legendElement.textContent : null;
    const description = helpTitle || legendText || `Analyze data based on ${facetName}`;

    const tool = createToolDefinition(facetName, description);
    if (tool) tools.push(tool);
  });

  console.log(`[Facet Extraction] ✓ Created ${tools.length} tools`);
  cachedFacetTools = tools;
  return tools;
}

/**
 * DOM Operation Queue to prevent conflicts during parallel processing
 */
class DOMOperationQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
  }

  async enqueue(operation) {
    return new Promise((resolve, reject) => {
      this.queue.push({ operation, resolve, reject });
      // eslint-disable-next-line no-void
      void this.processQueue();
    });
  }

  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    // eslint-disable-next-line no-await-in-loop
    while (this.queue.length > 0) {
      const { operation, resolve, reject } = this.queue.shift();
      try {
        // eslint-disable-next-line no-await-in-loop
        const result = await operation();
        resolve(result);
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => {
          setTimeout(r, 500);
        });
      } catch (error) {
        reject(error);
      }
    }

    this.isProcessing = false;
  }
}

const domOperationQueue = new DOMOperationQueue();

/**
 * Handle dynamic facet tool calls from AI
 * @param {string} toolName - Tool name
 * @param {Object} input - Tool input parameters
 * @param {boolean} useQueue - Whether to use DOM operation queue
 * @returns {Promise<Object>} Tool execution result
 */
export async function handleDynamicFacetToolCall(toolName, input, useQueue = true) {
  // Convert tool name back to facet name (underscores to dots)
  const facetName = toolName.replace(/_/g, '.');
  const facetElement = document.querySelector(`[facet="${facetName}"]`);

  if (!facetElement) {
    return {
      success: false,
      message: `Facet element not found for ${facetName}`,
    };
  }

  const { operation, value } = input;

  const performOperation = async () => {
    try {
      let result;

      switch (operation) {
        case 'filter': {
          if (!value) {
            result = { success: false, message: 'Filter operation requires a value' };
            break;
          }
          const filterInput = facetElement.querySelector(`input[value="${value}"]`);
          if (filterInput) {
            filterInput.click();
            await new Promise((resolve) => {
              setTimeout(resolve, 1000);
            });
            result = { success: true, message: `Applied filter: ${value}` };
          } else {
            result = { success: false, message: `Filter value ${value} not found` };
          }
          break;
        }

        case 'analyze': {
          const labelElements = facetElement.querySelectorAll('label');
          const items = [];

          labelElements.forEach((label) => {
            const labelText = label.querySelector('.label')?.textContent?.trim() || '';
            const valueText = label.querySelector('.value')?.textContent?.trim() || '';
            const spanText = label.querySelector('span')?.textContent?.trim() || '';
            const countElement = label.querySelector('number-format.count') || label.querySelector('number-format');
            const countText = countElement?.textContent?.trim() || '0';
            const countTitle = countElement?.getAttribute('title') || '0';
            const numericCount = countTitle.split(' ')[0].replace(/[^\d]/g, '');

            // Get metrics
            const cwvList = label.nextElementSibling?.querySelector?.('ul.cwv');
            const metrics = {};
            if (cwvList) {
              cwvList.querySelectorAll('li').forEach((item) => {
                const title = item.getAttribute('title') || '';
                const metricValue = item.querySelector('number-format')?.textContent?.trim();
                if (title && metricValue) {
                  const metricName = title.split(' - ')[0];
                  metrics[metricName] = metricValue;
                }
              });
            }

            const text = labelText || valueText || spanText;
            if (text) {
              items.push({
                text,
                displayCount: countText,
                count: parseInt(numericCount, 10) || 0,
                metrics,
              });
            }
          });

          result = {
            success: true,
            facetName,
            totalItems: items.length,
            items: items.slice(0, 5),
            summary: `Found ${items.length} items in ${facetName}`,
          };
          break;
        }

        case 'summarize': {
          const labelElements = facetElement.querySelectorAll('label');
          const allItems = [];

          labelElements.forEach((label) => {
            const labelText = label.querySelector('.label')?.textContent?.trim() || '';
            const valueText = label.querySelector('.value')?.textContent?.trim() || '';
            const spanText = label.querySelector('span')?.textContent?.trim() || '';
            const countElement = label.querySelector('number-format.count') || label.querySelector('number-format');
            const countTitle = countElement?.getAttribute('title') || '0';
            const numericCount = countTitle.split(' ')[0].replace(/[^\d]/g, '');
            const text = labelText || valueText || spanText;

            if (text) {
              allItems.push({
                text,
                count: parseInt(numericCount, 10) || 0,
              });
            }
          });

          const total = allItems.reduce((sum, item) => sum + item.count, 0);
          result = {
            success: true,
            facetName,
            totalItems: allItems.length,
            totalCount: total,
            topItems: allItems.slice(0, 3),
            summary: `${facetName} has ${allItems.length} unique values with ${total} total occurrences`,
          };
          break;
        }

        default:
          result = { success: false, message: `Unknown operation: ${operation}` };
      }

      return result;
    } catch (error) {
      console.error('[Dynamic Facet] Error:', error);
      return {
        success: false,
        message: `Error processing ${facetName}: ${error.message}`,
      };
    }
  };

  // Use queue for filter operations, direct execution for read-only operations
  if (operation === 'filter' && useQueue) {
    return domOperationQueue.enqueue(performOperation);
  }
  return performOperation();
}

/**
 * Initialize dynamic facets monitoring
 */
export function initializeDynamicFacets() {
  console.log('[Dynamic Facets] Initializing dynamic facets');

  const extractFacets = () => {
    const tools = extractFacetsFromExplorer();
    console.log(`[Dynamic Facets] Extracted ${tools.length} tools`);
    return tools;
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', extractFacets);
  } else {
    setTimeout(extractFacets, 100);
  }

  // Monitor for new facets
  let observerTimeout;
  const debouncedExtractFacets = () => {
    clearTimeout(observerTimeout);
    observerTimeout = setTimeout(extractFacets, 250);
  };

  const observer = new MutationObserver((mutations) => {
    if (observerTimeout) return;

    const hasFacetElements = mutations.some((mutation) => {
      if (mutation.addedNodes.length) {
        return Array.from(mutation.addedNodes).some((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            return node.tagName && (
              node.tagName.toLowerCase().includes('facet')
              || node.querySelector('list-facet, link-facet, literal-facet, file-facet, thumbnail-facet')
            );
          }
          return false;
        });
      }
      return false;
    });

    if (hasFacetElements) {
      debouncedExtractFacets();
    }
  });

  const facetSidebar = document.querySelector('facet-sidebar');
  if (facetSidebar) {
    observer.observe(facetSidebar, { childList: true, subtree: true });
  } else {
    observer.observe(document.body, { childList: true, subtree: false });
  }
}

/**
 * Reset cached facet tools
 */
export function resetCachedFacetTools() {
  cachedFacetTools = null;
}
