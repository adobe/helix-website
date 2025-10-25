/* eslint-disable no-console */
// Import parallel processing functionality
import {
  processParallelBatches,
  getCollectedInsights,
  getCollectedRecommendations,
} from './parallel-processing.js';

// Import comprehensive processing functionality
import processSequentialTools from './comprehensive-processing.js';

// Import task progress functionality
import {
  initializeTaskProgress,
  completeAllRemainingTasks,
  resetTaskList,
} from './task-progress.js';

// Import PDF export functionality
import { generatePDFReport, downloadAsText } from './pdf-export.js';
import { uploadToDA, getCurrentAnalyzedUrl } from './da-upload.js';

let messageHistory = [];
let cachedFacetTools = null;

// Cache for loaded templates
let systemPromptCache = null;
let overviewAnalysisTemplateCache = null;
let deepAnalysisTemplateCache = null;

// Cache for analysis results - now using localStorage for persistence
const CACHE_KEY = 'rumAnalysisCache';
const CACHE_DURATION = 4 * 60 * 60 * 1000; // 4 hours in milliseconds

// Function to get cache from localStorage
function getAnalysisCache() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.warn('[Cache] Error reading cache from localStorage:', error);
    return null;
  }
}

// Function to set cache in localStorage
function setAnalysisCache(cacheData) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('[Cache] Error saving cache to localStorage:', error);
  }
}

// Function to generate a simple hash of dashboard data for cache validation
function generateDashboardHash(dashboardData) {
  const dataString = JSON.stringify({
    dateRange: dashboardData.dateRange, // Include date range in cache validation
    metricsCount: Object.keys(dashboardData.metrics).length,
    segmentsCount: Object.keys(dashboardData.segments).length,
    segmentSizes: Object.entries(dashboardData.segments).map(([key, items]) => ({
      key,
      count: items.length,
      totalItems: items.reduce((sum, item) => sum + item.count, 0),
    })),
  });

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < dataString.length; i += 1) {
    const char = dataString.charCodeAt(i);
    // eslint-disable-next-line no-bitwise
    hash = ((hash << 5) - hash) + char;
    // eslint-disable-next-line no-bitwise
    hash &= hash; // Convert to 32-bit integer
  }
  return hash.toString();
}

// Function to check if cached analysis is still valid
function isCacheValid(currentDashboardHash) {
  const analysisCache = getAnalysisCache();

  if (!analysisCache || !analysisCache.result || !analysisCache.timestamp
      || !analysisCache.dashboardDataHash) {
    console.log('[Cache] No cached analysis found');
    return false;
  }

  const now = Date.now();
  const timeDiff = now - analysisCache.timestamp;
  const isTimeValid = timeDiff < CACHE_DURATION;
  const isDataValid = analysisCache.dashboardDataHash === currentDashboardHash;

  console.log(`[Cache] Time valid: ${isTimeValid} (${Math.round(timeDiff / 1000)}s ago), Data valid: ${isDataValid}`);

  return isTimeValid && isDataValid;
}

// Function to cache analysis result
function cacheAnalysisResult(result, dashboardDataHash) {
  const cacheData = {
    result,
    timestamp: Date.now(),
    dashboardDataHash,
  };
  setAnalysisCache(cacheData);
  console.log('[Cache] Analysis result cached for 4 hours');
}

// Function to clear analysis cache
function clearAnalysisCache() {
  try {
    localStorage.removeItem(CACHE_KEY);
    console.log('[Cache] Analysis cache cleared');
  } catch (error) {
    console.warn('[Cache] Error clearing cache:', error);
  }
}

// Function to get cache status for UI display
function getCacheStatus() {
  const analysisCache = getAnalysisCache();

  if (!analysisCache || !analysisCache.timestamp) {
    return null;
  }

  const now = Date.now();
  const timeDiff = now - analysisCache.timestamp;
  const remainingTime = CACHE_DURATION - timeDiff;

  if (remainingTime <= 0) {
    // Cache expired, clean it up
    clearAnalysisCache();
    return null;
  }

  const remainingMinutes = Math.ceil(remainingTime / (60 * 1000));
  return `Cached result (expires in ${remainingMinutes} min)`;
}

// Function to load text file content
async function loadTextFile(filename) {
  try {
    const response = await fetch(`/blocks/rum-chat/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    console.error(`[Template Loader] Error loading ${filename}:`, error);
    return null;
  }
}

// Function to get system prompt
async function getSystemPrompt() {
  if (!systemPromptCache) {
    systemPromptCache = await loadTextFile('system-prompt.txt');
  }
  return systemPromptCache || 'You are a RUM data detective specializing in USER ENGAGEMENT and TRAFFIC ACQUISITION analysis.';
}

// Function to get overview analysis template
async function getOverviewAnalysisTemplate() {
  if (!overviewAnalysisTemplateCache) {
    overviewAnalysisTemplateCache = await loadTextFile('overview-analysis-template.txt');
  }
  return overviewAnalysisTemplateCache || 'CREATE A CLEAN, PROFESSIONAL REPORT WITH STRUCTURED SECTIONS.';
}

// Function to get deep analysis template
async function getDeepAnalysisTemplate() {
  if (!deepAnalysisTemplateCache) {
    deepAnalysisTemplateCache = await loadTextFile('deep-analysis-template.txt');
  }
  return deepAnalysisTemplateCache || 'ORGANIZE THE ABOVE FINDINGS INTO A STRUCTURED REPORT.';
}

// Function to create tool definition based on facet type
function createToolDefinition(facetName, description) {
  // Sanitize the facet name to match the required pattern ^[a-zA-Z0-9_-]{1,64}$
  const sanitizedName = facetName.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64);

  console.log(`[Tool Creation] Creating tool for facet "${facetName}":
    - Original name: ${facetName}
    - Sanitized name: ${sanitizedName}
    - Description: ${description}`);

  const inputSchema = {
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
  };

  return {
    name: sanitizedName,
    description: `${description}. Use this tool to analyze data based on the ${facetName} facet.`,
    input_schema: inputSchema,
  };
}

// Function to create insights collection tool
function createInsightsCollectionTool() {
  return {
    name: 'collect_insights',
    description: 'Collect and organize key performance insights discovered during analysis. Use this tool to systematically capture important findings.',
    input_schema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          enum: ['performance', 'engagement', 'traffic', 'errors', 'user_behavior'],
          description: 'The category of insight being recorded',
        },
        insight: {
          type: 'string',
          description: 'The specific insight or finding discovered',
        },
        impact: {
          type: 'string',
          enum: ['high', 'medium', 'low'],
          description: 'The business impact level of this insight',
        },
        metrics: {
          type: 'string',
          description: 'Relevant metrics or data supporting this insight',
        },
      },
      required: ['category', 'insight', 'impact'],
    },
  };
}

// Function to create recommendations collection tool
function createRecommendationsCollectionTool() {
  return {
    name: 'collect_recommendations',
    description: 'Collect actionable recommendations based on analysis findings. Use this tool to systematically capture improvement suggestions.',
    input_schema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          enum: ['performance', 'technical', 'user_experience', 'monitoring', 'content'],
          description: 'The category of recommendation',
        },
        recommendation: {
          type: 'string',
          description: 'The specific actionable recommendation',
        },
        priority: {
          type: 'string',
          enum: ['high', 'medium', 'low'],
          description: 'The implementation priority of this recommendation',
        },
        effort: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          description: 'The estimated effort required to implement',
        },
        expected_impact: {
          type: 'string',
          description: 'The expected business impact or improvement',
        },
      },
      required: ['category', 'recommendation', 'priority'],
    },
  };
}

// Function to extract facets from explorer.html and convert them to tool definitions
function extractFacetsFromExplorer() {
  if (cachedFacetTools) {
    console.log('[Facet Extraction] Using cached facet tools');
    return cachedFacetTools;
  }

  console.log('[Facet Extraction] Starting facet extraction');
  const facetSidebar = document.querySelector('facet-sidebar');
  if (!facetSidebar) {
    console.error('[Facet Extraction] Facet sidebar not found');
    return [];
  }

  // Get dataChunks to check if facets have data
  const dataChunks = facetSidebar.dataChunks;
  if (!dataChunks || !dataChunks.facets) {
    console.warn('[Facet Extraction] No dataChunks available, cannot filter empty facets');
  }

  const facetElements = facetSidebar.querySelectorAll('list-facet, link-facet, literal-facet, file-facet, thumbnail-facet');
  console.log(`[Facet Extraction] Found ${facetElements.length} facet elements`);

  const tools = [];
  const skippedEmptyFacets = [];

  facetElements.forEach((facetElement, index) => {
    const facetName = facetElement.getAttribute('facet');
    if (!facetName) {
      console.log(`[Facet Extraction] Skipping facet #${index + 1} - no facet name`);
      return;
    }

    // Check if facet has data - skip if empty
    if (dataChunks && dataChunks.facets) {
      const facetData = dataChunks.facets[facetName];
      if (!facetData || facetData.length === 0) {
        console.log(`[Facet Extraction] Skipping facet #${index + 1} (${facetName}) - no data (0 items)`);
        skippedEmptyFacets.push(facetName);
        return;
      }
      console.log(`[Facet Extraction] Facet ${facetName} has ${facetData.length} items - including in tools`);
    }

    // Try to get description from help link title (more detailed)
    const helpLink = facetElement.querySelector('a.help[title]');
    const helpTitle = helpLink ? helpLink.getAttribute('title') : null;

    // Fall back to legend text
    const legendElement = facetElement.querySelector('legend');
    const legendText = legendElement ? legendElement.textContent : null;

    // Use help title if available, otherwise legend, otherwise default
    const description = helpTitle || legendText || `Analyze data based on ${facetName}`;

    console.log(`[Facet Extraction] Processing facet #${index + 1}:
      - Name: ${facetName}
      - Type: ${facetElement.tagName.toLowerCase()}
      - Legend: ${legendText || 'none'}
      - Help Title: ${helpTitle || 'none'}
      - Final Description: ${description}`);

    const tool = createToolDefinition(facetName, description);
    if (tool) tools.push(tool);
  });

  console.log('[Facet Extraction] ✅ Created tools from facet elements');
  console.log('  🔧 Total tools created:', tools.length);
  console.log('  📋 Tool names:', tools.map((t) => t.name).join(', '));
  
  if (skippedEmptyFacets.length > 0) {
    console.log('  ⏭️  Skipped empty facets:', skippedEmptyFacets.join(', '));
  }
  
  // Highlight form-related tools for debugging
  const formTools = tools.filter((t) => 
    t.name.includes('fill') || t.name.includes('formsubmit')
  );
  if (formTools.length > 0) {
    console.log('  ✅ Form-related tools found:', formTools.map((t) => t.name).join(', '));
  } else {
    console.log('  ⚠️ No form-related tools found (fill.source, formsubmit.source, formsubmit.target)');
  }

  cachedFacetTools = tools;
  return tools;
}

// DOM operation queue to prevent conflicts during parallel processing
class DOMOperationQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
  }

  async enqueue(operation) {
    return new Promise((resolve, reject) => {
      this.queue.push({ operation, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    // eslint-disable-next-line no-await-in-loop
    while (this.queue.length > 0) {
      const { operation, resolve, reject } = this.queue.shift();

      try {
        // eslint-disable-next-line no-await-in-loop
        const result = await operation();
        resolve(result);

        // Add delay between DOM operations to prevent conflicts
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

// Global DOM operation queue
const domOperationQueue = new DOMOperationQueue();

// Enhanced function to handle dynamic facet tool calls with queue support
async function handleDynamicFacetToolCall(toolName, input, useQueue = true) {
  // Handle special insights and recommendations collection tools
  if (toolName === 'collect_insights') {
    const {
      category, insight, impact, metrics,
    } = input;
    const insightEntry = {
      category,
      insight,
      impact,
      metrics: metrics || '',
      timestamp: new Date().toISOString(),
    };
    getCollectedInsights().push(insightEntry);
    console.log(`[Insights Collection] Added ${impact} impact ${category} insight`);
    return {
      success: true,
      message: `Insight collected: ${category} - ${impact} impact`,
      data: insightEntry,
    };
  }

  if (toolName === 'collect_recommendations') {
    const {
      category, recommendation, priority, effort, expectedImpact,
    } = input;
    const recommendationEntry = {
      category,
      recommendation,
      priority,
      effort: effort || 'medium',
      expectedImpact: expectedImpact || '',
      timestamp: new Date().toISOString(),
    };
    getCollectedRecommendations().push(recommendationEntry);
    console.log(`[Recommendations Collection] Added ${priority} priority ${category} recommendation`);
    return {
      success: true,
      message: `Recommendation collected: ${category} - ${priority} priority`,
      data: recommendationEntry,
    };
  }

  // Handle regular facet tools
  // Convert tool name back to original facet name (underscores to dots)
  const facetName = toolName.replace(/_/g, '.');
  
  // Track form tool calls specifically
  if (facetName.includes('fill') || facetName.includes('formsubmit')) {
    console.log(`[FORM TOOL CALLED] 📝 AI is using form tool: ${facetName}`, input);
  }
  
  console.log(`[DEBUG] Tool name: "${toolName}" → Facet name: "${facetName}"`);
  const facetElement = document.querySelector(`[facet="${facetName}"]`);
  console.log('[DEBUG] Facet element found:', !!facetElement);

  if (!facetElement) {
    console.log('[DEBUG] Available facets:', Array.from(document.querySelectorAll('[facet]')).map((el) => el.getAttribute('facet')));
    return {
      success: false,
      message: `Facet element not found for ${facetName}`,
    };
  }

  const { operation, value } = input;

  // Define the actual operation function
  const performOperation = async () => {
    try {
      let result;
      switch (operation) {
        case 'filter': {
          if (!value) {
            result = {
              success: false,
              message: 'Filter operation requires a value',
            };
            break;
          }
          // Look for checkbox input with the specified value
          const filterInput = facetElement.querySelector(`input[value="${value}"]`);
          if (filterInput) {
            // Use simple direct click like the working version
            filterInput.click();

            // Wait for UI to update with proper delay
            await new Promise((resolve) => {
              setTimeout(() => resolve(), 1000);
            });

            result = {
              success: true,
              message: `Applied filter: ${value}`,
            };
          } else {
            result = {
              success: false,
              message: `Filter value ${value} not found in facet ${facetName}`,
            };
          }
          break;
        }
        case 'analyze': {
          // Simplified analyze operation without complex batching
          const labelElements = facetElement.querySelectorAll('label');
          const items = [];

          // Process elements directly without batching to avoid complexity
          labelElements.forEach((label) => {
            // Try different label structures: .label, .value classes, or direct span
            const labelText = label.querySelector('.label')?.textContent?.trim() || '';
            const valueText = label.querySelector('.value')?.textContent?.trim() || '';
            const spanText = label.querySelector('span')?.textContent?.trim() || '';
            
            const countElement = label.querySelector('number-format.count') || label.querySelector('number-format');
            const countText = countElement?.textContent?.trim() || '0';
            const countTitle = countElement?.getAttribute('title') || '0';

            // Extract numeric value from title (e.g., "250354800 ±5252663" -> "250354800")
            const numericCount = countTitle.split(' ')[0].replace(/[^\d]/g, '');

            // Get performance metrics from cwv list (simplified)
            const cwvList = label.nextElementSibling?.querySelector?.('ul.cwv');
            const metrics = {};
            if (cwvList) {
              const metricItems = cwvList.querySelectorAll('li');
              metricItems.forEach((item) => {
                const title = item.getAttribute('title') || '';
                const metricValue = item.querySelector('number-format')?.textContent?.trim() || '';
                if (title && metricValue) {
                  // Extract metric name from title (e.g., "LCP - based on 2921 samples" -> "LCP")
                  const metricName = title.split(' - ')[0];
                  metrics[metricName] = metricValue;
                }
              });
            }

            // Use whichever text is available: .label, .value, or span
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
            items: items.slice(0, 5), // Return first 5 items
            summary: `Found ${items.length} items in ${facetName}`,
          };
          break;
        }
        case 'summarize': {
          // Simplified summarize operation
          const labelElements = facetElement.querySelectorAll('label');
          const allItems = [];

          labelElements.forEach((label) => {
            // Try different label structures: .label, .value classes, or direct span
            const labelText = label.querySelector('.label')?.textContent?.trim() || '';
            const valueText = label.querySelector('.value')?.textContent?.trim() || '';
            const spanText = label.querySelector('span')?.textContent?.trim() || '';
            
            const countElement = label.querySelector('number-format.count') || label.querySelector('number-format');
            const countTitle = countElement?.getAttribute('title') || '0';

            // Extract numeric value from title
            const numericCount = countTitle.split(' ')[0].replace(/[^\d]/g, '');
            
            // Use whichever text is available: .label, .value, or span
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
          result = {
            success: false,
            message: `Unknown operation: ${operation}`,
          };
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

  // Use queue for DOM operations (filter), direct execution for read-only operations
  if (operation === 'filter' && useQueue) {
    return domOperationQueue.enqueue(performOperation);
  }
  return performOperation();
}

// Function to initialize dynamic facets
function initializeDynamicFacets() {
  console.log('[Dynamic Facets] Initializing dynamic facets');

  const extractFacets = () => {
    console.log('[Dynamic Facets] DOM ready, extracting facets');
    const tools = extractFacetsFromExplorer();
    console.log(`[Dynamic Facets] Extracted ${tools.length} tools`);
    return tools;
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', extractFacets);
  } else {
    // Add a small delay to ensure DOM is fully rendered
    setTimeout(extractFacets, 100);
  }

  // Debounce function to prevent excessive observer calls
  let observerTimeout;
  const debouncedExtractFacets = () => {
    clearTimeout(observerTimeout);
    observerTimeout = setTimeout(extractFacets, 250);
  };

  const observer = new MutationObserver((mutations) => {
    // Only process if we haven't already scheduled an extraction
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
      console.log('[Dynamic Facets] Facet elements detected in DOM changes, scheduling re-extraction');
      debouncedExtractFacets();
    }
  });

  // Observe only the facet sidebar instead of the entire body for better performance
  const facetSidebar = document.querySelector('facet-sidebar');
  if (facetSidebar) {
    observer.observe(facetSidebar, { childList: true, subtree: true });
  } else {
    // Fallback to body observation if facet sidebar not found yet
    observer.observe(document.body, { childList: true, subtree: false });
  }
}

// Note: Dynamic facets will be initialized only when insights are requested

// Function to extract RUM data from dashboard
function extractDashboardData() {
  return new Promise((resolve) => {
    const getData = async () => {
      console.log('[Dashboard Data] Starting data extraction...');

      const dashboardData = {
        metrics: {},
        segments: {},
        dateRange: null, // Will store the date range information
      };

      console.log('[Dashboard Data] Starting DOM traversal');

      // Extract date range from the daterange-wrapper
      const dateRangeWrapper = document.querySelector('.daterange-wrapper');
      if (dateRangeWrapper) {
        const dateRangeInput = dateRangeWrapper.querySelector('input[data-value]');
        if (dateRangeInput) {
          const dateValue = dateRangeInput.getAttribute('data-value');
          const isCustom = dateRangeInput.getAttribute('data-custom') === 'true';
          
          // Map date range values to human-readable format
          const dateRangeMap = {
            'hour': 'last hour',
            'day': 'last 24 hours',
            'week': 'last 7 days',
            'month': 'last 30 days',
            'year': 'last year',
          };
          
          dashboardData.dateRange = isCustom ? 'custom date range' : (dateRangeMap[dateValue] || dateValue);
          console.log(`[Dashboard Data] ✓ Captured date range: ${dashboardData.dateRange} (raw value: ${dateValue})`);
        } else {
          console.warn('[Dashboard Data] ⚠️ Date range input not found in daterange-wrapper');
        }
      } else {
        console.warn('[Dashboard Data] ⚠️ Date range wrapper not found in DOM');
      }

      // Extract key metrics from the dashboard (pageviews, visits, conversions, LCP, CLS, INP)
      const keyMetricsContainer = document.querySelector('.key-metrics');
      if (keyMetricsContainer) {
        console.log('[Dashboard Data] Found key metrics container');
        
        // Get all li elements with IDs (pageviews, visits, conversions, lcp, cls, inp, etc.)
        const metricItems = keyMetricsContainer.querySelectorAll('li[id]');
        console.log('[Dashboard Data] Found metric items:', metricItems.length);
        
        metricItems.forEach((item) => {
          const metricId = item.id;
          const metricName = item.querySelector('h2')?.textContent?.trim() || metricId;
          const numberFormat = item.querySelector('number-format');
          const metricValue = numberFormat?.textContent?.trim();
          const metricTitle = numberFormat?.getAttribute('title');
          
          if (metricName && metricValue && metricValue !== '0') {
            // Store both display value and raw value if available in title
            const finalValue = metricTitle || metricValue;
            dashboardData.metrics[metricName] = finalValue;
            console.log(`[Dashboard Data] ✓ Captured metric: ${metricName} = ${finalValue}`);
          } else if (metricName) {
            console.warn(`[Dashboard Data] ⚠️ Skipping metric ${metricName}: value is empty or zero (${metricValue})`);
          }
        });
        
        // Verify we captured some metrics
        const metricsCount = Object.keys(dashboardData.metrics).length;
        if (metricsCount === 0) {
          console.error('[Dashboard Data] ❌ ERROR: No metrics were captured! Dashboard may not be loaded yet.');
        } else {
          console.log(`[Dashboard Data] ✓ Successfully captured ${metricsCount} metrics`);
        }
      } else {
        console.error('[Dashboard Data] ❌ ERROR: Key metrics container not found in DOM');
      }

      // Get facet data from the explorer
      const facetSidebar = document.querySelector('facet-sidebar');
      if (facetSidebar) {
        console.log('[Dashboard Data] Found facet sidebar');
        const facets = facetSidebar.querySelectorAll('list-facet, link-facet, literal-facet');
        console.log('[Dashboard Data] Found facets:', facets.length);

        facets.forEach((facet) => {
          const facetName = facet.getAttribute('facet');
          if (!facetName) return;

          console.log(`[Dashboard Data] Processing facet: ${facetName}`);

          // Extract data from label elements with number-format counts
          const labelElements = Array.from(facet.querySelectorAll('label'));
          const items = labelElements.map((label) => {
            const labelText = label.querySelector('.label')?.textContent?.trim() || '';
            const valueText = label.querySelector('.value')?.textContent?.trim() || '';
            const spanText = label.querySelector('span')?.textContent?.trim() || '';
            const countElement = label.querySelector('number-format.count');
            const countText = countElement?.textContent?.trim() || '0';
            const countTitle = countElement?.getAttribute('title') || '0';

            // Extract numeric value from title (e.g., "250354800 ±5252663" -> "250354800")
            const numericCount = countTitle.split(' ')[0].replace(/[^\d]/g, '');

            // Get performance metrics from cwv list
            const cwvList = label.nextElementSibling?.querySelector?.('ul.cwv');
            const metrics = {};
            if (cwvList) {
              const metricItems = cwvList.querySelectorAll('li');
              metricItems.forEach((item) => {
                const title = item.getAttribute('title') || '';
                const metricValue = item.querySelector('number-format')?.textContent?.trim() || '';
                if (title && metricValue) {
                  // Extract metric name from title
                  const metricName = title.split(' - ')[0];
                  metrics[metricName] = metricValue;
                }
              });
            }

            // Use whichever text is available: .label, .value, or span
            const value = labelText || valueText || spanText;

            return {
              value,
              displayCount: countText,
              count: parseInt(numericCount, 10) || 0,
              metrics,
            };
          }).filter((item) => item.value); // Filter out empty items

          dashboardData.segments[facetName] = items;
        });
      } else {
        console.log('[Dashboard Data] No facet sidebar found');
      }

      console.log('[Dashboard Data] Extraction complete');
      console.log('  📊 Total segments extracted:', Object.keys(dashboardData.segments).length);
      console.log('  📋 Segment names:', Object.keys(dashboardData.segments).join(', '));
      
      // Log form-specific facets for debugging
      if (dashboardData.segments['fill.source']) {
        console.log('  ✅ fill.source:', dashboardData.segments['fill.source'].length, 'items');
      }
      if (dashboardData.segments['formsubmit.source']) {
        console.log('  ✅ formsubmit.source:', dashboardData.segments['formsubmit.source'].length, 'items');
      }
      if (dashboardData.segments['formsubmit.target']) {
        console.log('  ✅ formsubmit.target:', dashboardData.segments['formsubmit.target'].length, 'items');
      }
      
      resolve(dashboardData);
    };

    // Ensure DOM is fully loaded before traversing
    if (document.readyState === 'loading') {
      console.log('[Dashboard Data] DOM still loading, waiting for DOMContentLoaded');
      document.addEventListener('DOMContentLoaded', getData);
    } else {
      console.log('[Dashboard Data] DOM already loaded, processing immediately');
      getData();
    }
  });
}

/* eslint-disable no-await-in-loop */
async function callAnthropicAPI(message, isFollowUp = false, progressCallback = null) {
  console.log('[Anthropic API] Starting API call with message:', message);
  try {
    // Extract dashboard data after DOM is loaded
    console.log('[Dashboard Data] Waiting for dashboard data extraction...');
    const dashboardData = await extractDashboardData();
    console.log('[Dashboard] Extracted data:', dashboardData);

    // Generate hash of current dashboard data for cache validation
    const currentDashboardHash = generateDashboardHash(dashboardData);

    // Check if we have a valid cached result
    if (!isFollowUp && isCacheValid(currentDashboardHash)) {
      console.log('[Cache] Returning cached analysis result');
      return getAnalysisCache().result;
    }

    // Get the current facet tools
    const facetTools = extractFacetsFromExplorer();
    console.log('[Anthropic API] 🔧 Total facet tools to pass to AI:', facetTools.length);
    console.log('[Anthropic API] 📋 Tool names being passed:', facetTools.map((t) => t.name).join(', '));
    
    // Cross-check: tools vs segments
    const segmentNames = Object.keys(dashboardData.segments);
    const toolNames = facetTools.map((t) => t.name.replace(/_/g, '.'));
    const missingInTools = segmentNames.filter((s) => !toolNames.includes(s));
    const missingInSegments = toolNames.filter((t) => !segmentNames.includes(t));
    
    if (missingInTools.length > 0) {
      console.log('[Anthropic API] ⚠️ Segments WITHOUT tools:', missingInTools.join(', '));
    }
    if (missingInSegments.length > 0) {
      console.log('[Anthropic API] ℹ️ Tools WITHOUT segment data:', missingInSegments.join(', '));
    }
    
    // Highlight form tools specifically
    const formToolNames = toolNames.filter((t) => t.includes('fill') || t.includes('formsubmit'));
    if (formToolNames.length > 0) {
      console.log('[Anthropic API] ✅ Form tools ready:', formToolNames.join(', '));
    } else {
      console.log('[Anthropic API] ⚠️ No form tools found');
    }

    // Get required variables for processing
    const systemPromptText = await getSystemPrompt();
    const mainApiKey = localStorage.getItem('anthropicApiKey') || '';
    if (!mainApiKey) {
      throw new Error('API key not found');
    }

    // Multi-phase approach to ensure comprehensive tool utilization
    if (!isFollowUp && facetTools.length > 0) {
      console.log('[Anthropic API] Starting systematic batched analysis');

      // Check if user wants deep analysis (checkbox controls this)
      const useDeepAnalysis = localStorage.getItem('rumChatDeepMode') === 'true';

      if (!useDeepAnalysis) {
        console.log('[Anthropic API] Using OVERVIEW analysis (parallel processing)');
        if (progressCallback) progressCallback(2, 'in-progress', 'Starting parallel batch processing...');
        const allInsights = await processParallelBatches(
          facetTools,
          dashboardData,
          systemPromptText,
          mainApiKey,
          message,
          handleDynamicFacetToolCall,
          progressCallback,
        );

        if (allInsights.length > 0) {
          // Mark parallel processing as completed
          if (progressCallback) progressCallback(2, 'completed', 'Parallel batch processing completed');

          // Create comprehensive final synthesis
          if (progressCallback) progressCallback(3, 'in-progress', 'Generating streamlined overview report...', 10);

          // Load the overview analysis template
          if (progressCallback) progressCallback(3, 'in-progress', 'Loading overview template...', 25);
          const overviewTemplate = await getOverviewAnalysisTemplate();

          // Log the actual dashboard metrics being sent to the agent
          console.log('[Final Synthesis] Dashboard metrics being sent to agent:');
          console.log(JSON.stringify(dashboardData.metrics, null, 2));
          console.log('[Final Synthesis] Number of segments:', Object.keys(dashboardData.segments).length);

          // Verify we have metrics before proceeding
          const hasMetrics = Object.keys(dashboardData.metrics).length > 0;
          if (!hasMetrics) {
            console.error('[Final Synthesis] ❌ WARNING: No dashboard metrics available! Agent will only have segment data.');
          }

          // Check if we have form data directly from segments
          const hasFormData = !!(dashboardData.segments['fill.source'] || 
                                  dashboardData.segments['formsubmit.source'] || 
                                  dashboardData.segments['formsubmit.target']);
          let formDataSection = '';
          
          console.log('[Final Synthesis] Checking for form data:', {
            'fill.source': !!dashboardData.segments['fill.source'],
            'formsubmit.source': !!dashboardData.segments['formsubmit.source'],
            'formsubmit.target': !!dashboardData.segments['formsubmit.target'],
            hasFormData,
          });
          
          if (hasFormData) {
            console.log('[Final Synthesis] ✅ Forms data detected - increasing word limit to 900-1000 words');
            console.log('[Final Synthesis] ✅ Forms section will be MANDATORY in the report');
            
            formDataSection = '\n\n==== 📝 FORMS DATA - FOR DEDICATED FORMS SECTION ONLY ====\n';
            formDataSection += '⚠️ This data is ONLY for the "Forms Interaction & Conversion Analysis" section.\n';
            formDataSection += '⚠️ DO NOT mention forms in Executive Summary, Key Metrics, or other sections.\n';
            formDataSection += '⚠️ All other sections should focus on the NON-FORM facets.\n\n';
            
            if (dashboardData.segments['fill.source']) {
              formDataSection += '<b>FILL.SOURCE (Form Entry Pages):</b>\n';
              dashboardData.segments['fill.source'].slice(0, 10).forEach((item, idx) => {
                formDataSection += `${idx + 1}. ${item.value}: ${item.count.toLocaleString()} form starts`;
                if (item.metrics && Object.keys(item.metrics).length > 0) {
                  formDataSection += ` (Metrics: ${JSON.stringify(item.metrics)})`;
                }
                formDataSection += '\n';
              });
              formDataSection += '\n';
            }
            
            if (dashboardData.segments['formsubmit.source']) {
              formDataSection += '<b>FORMSUBMIT.SOURCE (Form Submission Pages):</b>\n';
              dashboardData.segments['formsubmit.source'].slice(0, 10).forEach((item, idx) => {
                formDataSection += `${idx + 1}. ${item.value}: ${item.count.toLocaleString()} form submissions`;
                if (item.metrics && Object.keys(item.metrics).length > 0) {
                  formDataSection += ` (Metrics: ${JSON.stringify(item.metrics)})`;
                }
                formDataSection += '\n';
              });
              formDataSection += '\n';
            }
            
            if (dashboardData.segments['formsubmit.target']) {
              formDataSection += '<b>FORMSUBMIT.TARGET (Post-Submission Destinations):</b>\n';
              dashboardData.segments['formsubmit.target'].slice(0, 10).forEach((item, idx) => {
                formDataSection += `${idx + 1}. ${item.value}: ${item.count.toLocaleString()} redirects`;
                if (item.metrics && Object.keys(item.metrics).length > 0) {
                  formDataSection += ` (Metrics: ${JSON.stringify(item.metrics)})`;
                }
                formDataSection += '\n';
              });
              formDataSection += '\n';
            }
            
            formDataSection += '\n<b>INSTRUCTIONS:</b>\n';
            formDataSection += '1. Create a dedicated "📝 Forms Interaction & Conversion Analysis" section immediately after Executive Summary\n';
            formDataSection += '2. Use this forms data ONLY in that dedicated section\n';
            formDataSection += '3. Analyze the complete funnel: fill.source → formsubmit.source → formsubmit.target\n';
            formDataSection += '4. In ALL OTHER SECTIONS (Executive Summary, Key Metrics, Priority Actions, Business Impact), focus on NON-FORM facets\n';
            formDataSection += '5. Forms get their own dedicated section - don\'t mix them into other sections\n';
            formDataSection += '==== END FORMS DATA ====\n\n';
          } else {
            console.log('[Final Synthesis] ℹ️ No forms data - standard 600-700 word report');
          }

          const finalSynthesisMessage = `Create a polished, professional analysis report based on the data below. 

DO NOT include any of the raw batch content in your response. Use it only as source material for your analysis.

==== DATA TIME PERIOD ====
${dashboardData.dateRange ? `📅 Analysis covers data from: ${dashboardData.dateRange.toUpperCase()}` : '⚠️ Date range not available'}

IMPORTANT: All insights and metrics in this report are for the ${dashboardData.dateRange || 'specified'} time period.
==== END TIME PERIOD ====

==== ✅ FACET COVERAGE CHECKLIST ====
⚠️ The following NON-FORM facets MUST ALL be covered in the "Key Metrics & Findings" section.
Each facet needs 1 positive + 1 improvement observation:

${Object.keys(dashboardData.segments)
    .filter((key) => !key.includes('fill') && !key.includes('formsubmit'))
    .map((facet, idx) => `${idx + 1}. ${facet}`)
    .join('\n')}

TOTAL: ${Object.keys(dashboardData.segments).filter((key) => !key.includes('fill') && !key.includes('formsubmit')).length} facets to cover
==== END CHECKLIST ====
${formDataSection}
==== ACTUAL DASHBOARD METRICS (USE THESE EXACT VALUES) ====
${hasMetrics 
    ? Object.entries(dashboardData.metrics)
        .map(([metric, value]) => `${metric}: ${value}`)
        .join('\n')
    : '⚠️ WARNING: Dashboard metrics not available - focus analysis on segment data from tool results'}

TOTAL SEGMENTS: ${Object.keys(dashboardData.segments).length} facets analyzed

⚠️ COMPLETE LIST OF ALL FACETS THAT MUST BE COVERED (EXCEPT FORMS):
${Object.keys(dashboardData.segments)
    .filter((key) => !key.includes('fill') && !key.includes('formsubmit'))
    .join(', ')}

Each of these facets MUST get 1 positive + 1 improvement mention in the "Key Metrics & Findings" section.

SEGMENT SUMMARY (showing top items per facet):
${Object.entries(dashboardData.segments)
    .slice(0, 10)
    .map(([segment, items]) => `- ${segment}: ${items.length} items, top item: ${items[0]?.value || 'N/A'} (${items[0]?.count?.toLocaleString() || 0})`)
    .join('\n')}
${Object.keys(dashboardData.segments).length > 10 ? `... and ${Object.keys(dashboardData.segments).length - 10} more facets` : ''}
==== END DASHBOARD METRICS ====

==== SOURCE MATERIAL (FOR REFERENCE ONLY - DO NOT INCLUDE IN RESPONSE) ====
${allInsights.join('\n\n')}

INSIGHTS COLLECTED:
${getCollectedInsights().map((insight) => `- ${insight.category}: ${insight.insight} (Impact: ${insight.impact}, Metrics: ${insight.metrics})`).join('\n')}

RECOMMENDATIONS COLLECTED:
${getCollectedRecommendations().map((recommendation) => `- ${recommendation.category}: ${recommendation.recommendation} (Priority: ${recommendation.priority}, Effort: ${recommendation.effort}, Expected Impact: ${recommendation.expectedImpact})`).join('\n')}
==== END SOURCE MATERIAL ====

${overviewTemplate}`;

          // Calculate max tokens based on whether we have form data
          // Need to cover 30+ facets with positive + improvement for each
          // Standard: 1200-1400 words = ~4500 tokens
          // With forms: 1400-1600 words = ~5500 tokens
          const maxTokens = hasFormData ? 5500 : 4500;
          
          // Log if form data section was included
          if (hasFormData) {
            console.log('[Final Synthesis] 📝 Form data section length:', formDataSection.length, 'characters');
            console.log('[Final Synthesis] 📝 Form data section preview:', formDataSection.substring(0, 200));
          }
          
          const finalRequest = {
            model: 'claude-opus-4-1-20250805',
            max_tokens: maxTokens, // 4500 standard (1200-1400 words, 30+ facets), 5500 with forms (1400-1600 words)
            messages: [{ role: 'user', content: finalSynthesisMessage }],
            tools: [createInsightsCollectionTool(), createRecommendationsCollectionTool()],
            system: systemPromptText,
            temperature: 0.35, // Balanced for structured comprehensive analysis
          };
          
          console.log('[Final Synthesis] Request config:', {
            max_tokens: maxTokens,
            has_form_data: hasFormData,
            message_length: finalSynthesisMessage.length,
          });

          if (progressCallback) progressCallback(3, 'in-progress', 'Preparing the overview analysis...', 40);

          if (progressCallback) progressCallback(3, 'in-progress', 'Generating insights and findings...', 65);
          const finalResponse = await fetch('https://chat-bot-test.asthabhargava001.workers.dev/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': mainApiKey,
            },
            body: JSON.stringify(finalRequest),
          });

          if (finalResponse.ok) {
            const finalData = await finalResponse.json();
            
            // Log stop reason to debug truncation
            console.log('[Final Synthesis] API Response:', {
              stop_reason: finalData.stop_reason,
              content_blocks: finalData.content?.length || 0,
              usage: finalData.usage,
            });
            
            if (finalData.stop_reason === 'max_tokens') {
              console.error('[Final Synthesis] ⚠️ WARNING: Response was truncated due to max_tokens limit!');
              console.error('[Final Synthesis] ⚠️ Increase max_tokens or reduce content');
            }
            
            if (finalData.content && finalData.content.length > 0) {
              if (progressCallback) progressCallback(3, 'in-progress', 'Finalizing recommendations and action items...', 80);

              let finalAnalysis = '';
              const finalToolCalls = [];

              finalData.content.forEach((item) => {
                if (item.type === 'text') {
                  const text = item.text.trim();
                  if (text) finalAnalysis += `${text}\n`;
                } else if (item.type === 'tool_use') {
                  finalToolCalls.push(item);
                }
              });

              // Execute final tool calls for insights and recommendations collection
              if (finalToolCalls.length > 0) {
                console.log(`[Final Analysis] Executing ${finalToolCalls.length} collection tools`);
                for (let i = 0; i < finalToolCalls.length; i += 1) {
                  const toolCall = finalToolCalls[i];
                  try {
                    // eslint-disable-next-line no-await-in-loop
                    await handleDynamicFacetToolCall(toolCall.name, toolCall.input || {}, false);
                  } catch (error) {
                    console.error(`[Final Analysis] Error executing ${toolCall.name}:`, error);
                  }
                }
              }

              console.log(`[Fast Analysis] Comprehensive report completed efficiently, length: ${finalAnalysis.length} characters`);
              if (progressCallback) progressCallback(3, 'completed', 'Streamlined overview report completed successfully', 100);
              cacheAnalysisResult(finalAnalysis, currentDashboardHash);
              return finalAnalysis;
            }
          }
        }

        // Don't show raw batch insights - create a clean fallback message
        const result = 'Analysis completed successfully. Multiple insights were discovered across different data facets including performance metrics, user behavior patterns, and traffic acquisition data.';
        cacheAnalysisResult(result, currentDashboardHash);
        return result;
      }

      // Deep analysis mode - comprehensive sequential processing
      console.log('[Anthropic API] Using DEEP analysis (comprehensive individual tool processing)');
      if (progressCallback) progressCallback(2, 'in-progress', `Analyzing ${facetTools.length} metrics comprehensively...`);

      // Load the deep analysis template
      const deepAnalysisTemplate = await getDeepAnalysisTemplate();

      // Process each tool individually with quality rating
      const comprehensiveResults = await processSequentialTools(
        facetTools,
        dashboardData,
        systemPromptText,
        mainApiKey,
        message,
        handleDynamicFacetToolCall,
        progressCallback,
        deepAnalysisTemplate,
      );

      // Use the high-quality insights from comprehensive processing
      const { qualityInsights, toolResults, processedToolsCount } = comprehensiveResults;

      console.log(`[Comprehensive Processing] Processed ${processedToolsCount} tools with ${qualityInsights.length} high-quality insights`);

      // Use fixed task index for final report (step 4)
      const finalReportTaskIndex = 3;
      if (progressCallback) {
        progressCallback(finalReportTaskIndex, 'in-progress', 'Generating comprehensive final report...', 10);
      }

      // Load the deep analysis template
      if (progressCallback) {
        progressCallback(finalReportTaskIndex, 'in-progress', 'Loading deep analysis template...', 25);
      }
      const deepTemplate = await getDeepAnalysisTemplate();

      // Create final synthesis message with quality-filtered insights
      const finalMessage = `Based on comprehensive individual tool analysis with quality rating, create a well-organized analysis report:

==== DATA TIME PERIOD ====
${dashboardData.dateRange ? `📅 Analysis covers data from: ${dashboardData.dateRange.toUpperCase()}` : '⚠️ Date range not available'}

IMPORTANT: All insights and metrics in this report are for the ${dashboardData.dateRange || 'specified'} time period.
==== END TIME PERIOD ====

HIGH-QUALITY INSIGHTS DISCOVERED:
${qualityInsights.join('\n\n')}

DETAILED TOOL ANALYSIS RESULTS:
${toolResults.map((result) => `[${result.impact}] ${result.tool}: ${result.summary}`).join('\n')}

INSIGHTS COLLECTED:
${getCollectedInsights().map((insight) => `- ${insight.category}: ${insight.insight} (Impact: ${insight.impact}, Metrics: ${insight.metrics})`).join('\n')}

RECOMMENDATIONS COLLECTED:
${getCollectedRecommendations().map((recommendation) => `- ${recommendation.category}: ${recommendation.recommendation} (Priority: ${recommendation.priority}, Effort: ${recommendation.effort}, Expected Impact: ${recommendation.expectedImpact})`).join('\n')}

${deepTemplate}`;

      const finalRequest = {
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 4096,
        messages: [{ role: 'user', content: finalMessage }],
        tools: [createInsightsCollectionTool(), createRecommendationsCollectionTool()],
        system: systemPromptText,
        temperature: 0.3,
      };

      if (progressCallback) {
        progressCallback(finalReportTaskIndex, 'in-progress', 'Preparing the comprehensive report...', 40);
      }

      const finalResponse = await fetch('https://chat-bot-test.asthabhargava001.workers.dev/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': mainApiKey,
        },
        body: JSON.stringify(finalRequest),
      });

      if (finalResponse.ok) {
        if (progressCallback) {
          progressCallback(finalReportTaskIndex, 'in-progress', 'Generating insights and findings...', 65);
        }
        const finalData = await finalResponse.json();
        if (finalData.content && finalData.content.length > 0) {
          let finalAnalysis = '';
          const finalToolCalls = [];

          finalData.content.forEach((item) => {
            if (item.type === 'text') {
              const text = item.text.trim();
              if (text) finalAnalysis += `${text}\n`;
            } else if (item.type === 'tool_use') {
              finalToolCalls.push(item);
            }
          });

          // Execute final tool calls for insights and recommendations collection
          if (finalToolCalls.length > 0) {
            if (progressCallback) {
              progressCallback(finalReportTaskIndex, 'in-progress', 'Finalizing recommendations and action items...', 80);
            }
            console.log(`[Comprehensive Final Analysis] Executing ${finalToolCalls.length} collection tools`);
            for (let i = 0; i < finalToolCalls.length; i += 1) {
              const toolCall = finalToolCalls[i];
              try {
                // eslint-disable-next-line no-await-in-loop
                await handleDynamicFacetToolCall(toolCall.name, toolCall.input || {}, false);
              } catch (error) {
                console.error(`[Comprehensive Final Analysis] Error executing ${toolCall.name}:`, error);
              }
            }
          }

          console.log(`[Comprehensive Processing] Final analysis completed, length: ${finalAnalysis.length} characters`);
          if (progressCallback) {
            progressCallback(finalReportTaskIndex, 'completed', 'Comprehensive analysis report completed successfully', 100);
          }
          cacheAnalysisResult(finalAnalysis, currentDashboardHash);
          return finalAnalysis;
        }
      }

      // Fallback with quality insights
      const result = qualityInsights.join('\n\n') || 'Comprehensive analysis completed successfully.';
      cacheAnalysisResult(result, currentDashboardHash);
      return result;
    }

    // Simple fallback approach
    const fallbackMessage = `${message}

Analyze the RUM data and provide comprehensive insights.`;

    messageHistory.push({ role: 'user', content: fallbackMessage });

    const fallbackSystemPrompt = await getSystemPrompt();
    const fallbackRequest = {
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      messages: messageHistory,
      tools: facetTools,
      system: fallbackSystemPrompt,
      temperature: 0.7,
    };

    const fallbackApiKey = localStorage.getItem('anthropicApiKey') || '';
    if (!fallbackApiKey) {
      throw new Error('API key not found');
    }

    const fallbackResponse = await fetch('https://chat-bot-test.asthabhargava001.workers.dev/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': fallbackApiKey,
      },
      body: JSON.stringify(fallbackRequest),
    });

    if (!fallbackResponse.ok) {
      const errorData = await fallbackResponse.json();
      throw new Error(errorData.error || `API request failed (${fallbackResponse.status})`);
    }

    const fallbackData = await fallbackResponse.json();
    if (fallbackData.content && fallbackData.content.length > 0) {
      let fallbackAnalysis = '';
      fallbackData.content.forEach((item) => {
        if (item.type === 'text') {
          const text = item.text.trim();
          if (text) fallbackAnalysis += `${text}\n`;
        }
      });

      const result = fallbackAnalysis || 'Analysis completed successfully.';
      if (!isFollowUp) {
        cacheAnalysisResult(result, currentDashboardHash);
      }
      return result;
    }

    throw new Error('Unexpected API response format');
  } catch (error) {
    console.error('[Anthropic API] Error in API call:', error);
    throw error;
  }
}

// Reusable analysis function for external modules (e.g., sidebar)
async function runCompleteRumAnalysis(messagesDiv, downloadButton, apiKeySection = null, saveResultsButton = null) {
  const createMessageElement = (text, className) => {
    const div = document.createElement('div');
    div.className = `message ${className}`;
    div.innerHTML = text.replace(/\n/g, '<br>');
    return div;
  };

  const addProgressMessage = (message) => {
    if (message.trim()) {
      messagesDiv.appendChild(createMessageElement(message, 'claude-message'));
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
  };

  let analysisResult = '';

  try {
    // Check if we have cached results first
    const cacheStatus = getCacheStatus();
    if (cacheStatus) {
      addProgressMessage(`${cacheStatus}`);
      // If we have cached results, we should also enable download if content exists
      const cachedResult = getAnalysisCache();
      if (cachedResult && cachedResult.result) {
        analysisResult = cachedResult.result;
        
        // Display the cached analysis result
        addProgressMessage(analysisResult);
        
        if (downloadButton) {
          downloadButton.disabled = false;
          downloadButton.title = 'Download insights as PDF';
        }
        if (saveResultsButton) {
          saveResultsButton.disabled = false;
          saveResultsButton.title = 'Save results to DA';
        }
      }
      return analysisResult; // Exit early if using cached results
    }

    // Create task list for live progress tracking
    const isDeepMode = localStorage.getItem('rumChatDeepMode') === 'true';

    // Use the same 4-step structure for both overview and deep analysis modes
    const taskList = isDeepMode ? [
      'Initializing analysis environment',
      'Extracting dashboard data and facets',
      'Processing comprehensive tool analysis',
      'Generating comprehensive final report',
    ] : [
      'Initializing analysis environment',
      'Extracting dashboard data and facets',
      'Processing multiple batches in parallel',
      'Generating streamlined analysis report',
    ];

    addProgressMessage('🔍 Analyzing RUM dashboard...');
    const updateTaskStatus = initializeTaskProgress(taskList, messagesDiv);

    // Start first task
    updateTaskStatus(0, 'in-progress', 'Setting up analysis tools...');

    // Add a small delay to allow any ongoing operations to complete
    // This helps prevent performance violations from overlapping operations
    await new Promise((resolve) => {
      setTimeout(() => {
        console.log('[Insights] Initializing facet manipulation for analysis...');
        initializeDynamicFacets();
        updateTaskStatus(0, 'completed', 'Analysis environment ready');
        resolve();
      }, 200);
    });

    // Update task 2: Extract dashboard data
    updateTaskStatus(1, 'in-progress', 'Scanning dashboard for data and available tools...');

    await new Promise((resolve) => {
      setTimeout(() => resolve(), 300);
    }); // Brief pause for visual effect

    const facetTools = extractFacetsFromExplorer();

    if (facetTools.length > 0) {
      updateTaskStatus(1, 'completed', `Found ${facetTools.length} analysis metrics ready`);
    } else {
      updateTaskStatus(1, 'completed', 'Basic analysis mode - no advanced tools found');
      addProgressMessage('⚠️ No facet tools found, proceeding with basic dashboard analysis...');
    }

    const response = await callAnthropicAPI('Analyze the RUM data from the dashboard.', false, updateTaskStatus);
    if (response.trim()) {
      addProgressMessage(response);

      // Store analysis content and enable download button
      analysisResult = response;
      if (downloadButton) {
        downloadButton.disabled = false;
        downloadButton.title = 'Download insights as PDF';
      }
      if (saveResultsButton) {
        saveResultsButton.disabled = false;
        saveResultsButton.title = 'Save results as JSON';
      }

      // Mark all remaining tasks as completed
      completeAllRemainingTasks();

      // Note: updateCacheStatus not called here as it's specific to main chat UI
    } else {
      addProgressMessage('Unable to generate insights. Please try again.');
    }
  } catch (error) {
    console.error('[Agent] Error during analysis:', error);
    addProgressMessage(`❌ Error during analysis: ${error.message}`);
    if (apiKeySection) {
      apiKeySection.style.display = 'block';
    }
    throw error; // Re-throw for caller to handle
  }

  return analysisResult;
}

export default async function decorate(block) {
  messageHistory = [];

  const chatInterface = document.createElement('div');
  chatInterface.className = 'chat-interface';

  chatInterface.innerHTML = `
    <div class="chat-header">
      <h2>OpTel Detective</h2>
      <div class="header-buttons">
        <button class="save-results-button" disabled title="Save results as JSON (available after analysis)">💾 Save Results</button>
        <button class="download-button" disabled title="Download insights as PDF (available after analysis)">📄 Download as PDF</button>
        <button class="close-button" title="Close chat">×</button>
      </div>
    </div>
    <div id="messages" class="messages"></div>
    <div id="api-key-section" class="api-key-section">
      <div class="api-key-input">
        <label for="api-key">Enter Anthropic API Key:</label>
        <input type="password" id="api-key" placeholder="sk-ant-...">
        <button id="save-api-key">Save Key</button>
      </div>
      <div class="analysis-section" style="display: none;">
        <div class="processing-mode-selection" style="margin-bottom: 10px;">
          <label style="font-size: 14px; color: #666;">
            <input type="checkbox" id="deep-mode" style="margin-right: 5px;">
            Deep Analysis (more detailed, takes longer)
          </label>
        </div>
        <button id="start-analysis" class="primary-button" style="padding: 6px 10px;" title="">Show Insights</button>
      </div>
    </div>
  `;

  block.textContent = '';
  block.appendChild(chatInterface);

  const downloadButton = block.querySelector('.download-button');
  const saveResultsButton = block.querySelector('.save-results-button');
  const closeButton = block.querySelector('.close-button');
  const messagesDiv = block.querySelector('#messages');
  const apiKeySection = block.querySelector('#api-key-section');
  const apiKeyInput = block.querySelector('#api-key');
  const saveApiKeyButton = block.querySelector('#save-api-key');
  const analysisSection = block.querySelector('.analysis-section');
  const startAnalysisButton = block.querySelector('#start-analysis');
  const deepModeCheckbox = block.querySelector('#deep-mode');

  // Variable to store analysis content for PDF generation
  let analysisContent = '';

  // Download functionality using the PDF export module
  const generatePDF = () => {
    if (!analysisContent) {
      // eslint-disable-next-line no-alert
      alert('No analysis content available for download.');
      return;
    }

    // Get URL from the dashboard input field
    const urlInput = document.querySelector('#url');
    const currentUrl = urlInput ? urlInput.value.trim() : '';

    // Use the modular PDF export function
    const success = generatePDFReport(analysisContent, {
      url: currentUrl,
      title: `OpTel Detective Analysis - ${currentUrl || 'Dashboard'}`,
      debug: true, // Enable debug logging
      preserveHtml: true, // Keep HTML formatting for better structure
    });

    if (!success) {
      console.error('[RUM Chat] PDF generation failed, trying text download fallback');
      // Fallback to text download if PDF generation fails
      const filename = currentUrl
        ? `OpTel-analysis-${currentUrl.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}`
        : `OpTel-analysis-${new Date().toISOString().split('T')[0]}`;

      downloadAsText(analysisContent, filename);
    }
  };

  downloadButton.addEventListener('click', generatePDF);

  // Save Results functionality - Upload to DA
  const saveResults = async () => {
    if (!analysisContent) {
      // eslint-disable-next-line no-alert
      alert('No analysis content available to save.');
      return;
    }

    // Disable button and show loading state
    saveResultsButton.disabled = true;
    const originalText = saveResultsButton.textContent;
    saveResultsButton.textContent = '💾 Saving...';

    try {
      // Get current analyzed URL
      const currentUrl = getCurrentAnalyzedUrl();

      // Upload to DA using the modular upload function
      const result = await uploadToDA(analysisContent, {
        url: currentUrl,
        debug: true, // Enable debug logging
      });

      // Show success message
      // eslint-disable-next-line no-alert
      alert(`✅ Analysis report saved successfully to DA!\n\nPath: ${result.path}`);
    } catch (error) {
      console.error('[Save Results] Error uploading to DA:', error);
      // eslint-disable-next-line no-alert
      alert(`❌ Error saving to DA: ${error.message}\n\nPlease check console for details.`);
    } finally {
      // Re-enable button and restore text
      saveResultsButton.disabled = false;
      saveResultsButton.textContent = originalText;
    }
  };

  saveResultsButton.addEventListener('click', saveResults);

  // Function to update cache status in UI
  const updateCacheStatus = () => {
    const cacheStatus = getCacheStatus();
    if (cacheStatus) {
      const analysisCache = getAnalysisCache();
      const minutesAgo = Math.floor((Date.now() - analysisCache.timestamp) / (60 * 1000));
      const timeText = minutesAgo === 0 ? 'just now' : `${minutesAgo} min${minutesAgo > 1 ? 's' : ''} ago`;

      startAnalysisButton.textContent = 'Show Insights *';
      startAnalysisButton.title = `Results cached from ${timeText}. Ctrl+click to clear cache.`;
    } else {
      startAnalysisButton.textContent = 'Show Insights';
      startAnalysisButton.title = '';
    }
  };

  // Add a flag to prevent accidental analysis triggering
  let isProcessingCacheClear = false;

  // Add right-click handler for cache clearing
  startAnalysisButton.addEventListener('contextmenu', (e) => {
    const cacheStatus = getCacheStatus();
    if (cacheStatus && e.ctrlKey) { // Require Ctrl+right-click
      e.preventDefault(); // Prevent default context menu
      e.stopPropagation(); // Stop event bubbling
      e.stopImmediatePropagation(); // Stop all other event handlers

      isProcessingCacheClear = true; // Set flag to prevent immediate analysis

      clearAnalysisCache();
      updateCacheStatus();
      messagesDiv.innerHTML = '';
      messageHistory = [];

      // Reset download button
      analysisContent = '';
      downloadButton.disabled = true;
      downloadButton.title = 'Download insights as PDF (available after analysis)';

      console.log('[UI] Cache cleared by Ctrl+click');

      // Add a brief visual feedback
      const originalText = startAnalysisButton.textContent;
      startAnalysisButton.textContent = 'Cache Cleared';
      startAnalysisButton.disabled = true;

      setTimeout(() => {
        startAnalysisButton.textContent = originalText.replace(' *', '');
        startAnalysisButton.disabled = false;
        updateCacheStatus();
        isProcessingCacheClear = false; // Reset flag after UI update
      }, 1000);
    }
  });

  closeButton.addEventListener('click', () => {
    const chatContainer = block.closest('.rum-chat-container');
    if (chatContainer) {
      chatContainer.classList.remove('show');
    } else {
      block.style.display = 'none';
    }
    messagesDiv.innerHTML = '';
    messageHistory = [];

    // Reset download button
    analysisContent = '';
    downloadButton.disabled = true;
    downloadButton.title = 'Download insights as PDF (available after analysis)';

    // Reset facet manipulation state but keep cache for persistence across reloads
    cachedFacetTools = null;
    resetTaskList();
    console.log('[Cleanup] Reset facet manipulation state (cache preserved for next session)');

    apiKeySection.style.display = 'block';
    if (localStorage.getItem('anthropicApiKey')) {
      analysisSection.style.display = 'block';
    }

    // Reload the page
    window.location.reload();
  });

  const existingApiKey = localStorage.getItem('anthropicApiKey');
  if (existingApiKey) {
    apiKeyInput.value = existingApiKey;
    apiKeyInput.disabled = true;
    saveApiKeyButton.textContent = 'Save Key';
    saveApiKeyButton.disabled = true;
    analysisSection.style.display = 'block';
    updateCacheStatus(); // Update cache status when showing analysis section
  }

  saveApiKeyButton.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
      localStorage.setItem('anthropicApiKey', apiKey);
      apiKeyInput.disabled = true;
      saveApiKeyButton.textContent = 'Key Saved';
      saveApiKeyButton.disabled = true;
      analysisSection.style.display = 'block';
      updateCacheStatus(); // Update cache status when showing analysis section
    } else {
      alert('Please enter a valid API key');
    }
  });

  // Handle deep mode checkbox
  deepModeCheckbox.addEventListener('change', () => {
    const isDeep = deepModeCheckbox.checked;
    localStorage.setItem('rumChatDeepMode', isDeep.toString());
    console.log(`[UI] Deep analysis mode: ${isDeep ? 'ENABLED' : 'DISABLED'}`);

    // Update button text to indicate mode
    const baseText = 'Show Insights';
    const modeText = isDeep ? ' (Deep)' : ' (Overview)';
    const cacheIndicator = startAnalysisButton.textContent.includes('*') ? ' *' : '';
    startAnalysisButton.textContent = baseText + modeText + cacheIndicator;
  });

  // Load saved deep mode preference - defaults to unchecked/false
  const savedDeepMode = localStorage.getItem('rumChatDeepMode');
  // Only check the box if user explicitly saved 'true', otherwise default to unchecked
  deepModeCheckbox.checked = savedDeepMode === 'true';
  deepModeCheckbox.dispatchEvent(new Event('change'));

  startAnalysisButton.addEventListener('click', async () => {
    // Prevent analysis if we're in the middle of clearing cache
    if (isProcessingCacheClear) {
      console.log('[UI] Ignoring click during cache clear process');
      return;
    }

    // Add metrics=super to URL to ensure all checkpoints are available for analysis
    const currentUrl = new URL(window.location);
    
    if (!currentUrl.searchParams.has('metrics') || currentUrl.searchParams.get('metrics') !== 'super') {
      currentUrl.searchParams.set('metrics', 'super');
      window.history.replaceState({}, '', currentUrl);
      console.log('[UI] Added metrics=super to URL for comprehensive analysis');
      
      // Trigger a page reload to apply the new metrics parameter
      // This ensures all checkpoints are loaded and available for analysis
      window.location.reload();
      return; // Exit early since we're reloading
    }

    apiKeySection.style.display = 'none';

    try {
      analysisContent = await runCompleteRumAnalysis(messagesDiv, downloadButton, apiKeySection, saveResultsButton);
    } catch (error) {
      // Error already handled in the function
    }
  });
}

// Export functions for use in other modules (e.g., facetsidebar)
export {
  callAnthropicAPI,
  extractDashboardData,
  handleDynamicFacetToolCall,
  initializeTaskProgress,
  completeAllRemainingTasks,
  resetTaskList,
  extractFacetsFromExplorer,
  initializeDynamicFacets,
  getCacheStatus,
  getAnalysisCache,
  setAnalysisCache,
  cacheAnalysisResult,
  generateDashboardHash,
  runCompleteRumAnalysis,
};
