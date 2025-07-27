/* eslint-disable no-console */
// Import parallel processing functionality
import processParallelBatches, {
  resetInsightsAndRecommendations,
  getCollectedInsights,
  getCollectedRecommendations,
} from './parallel-processing.js';

// Import task progress functionality
import initializeTaskProgress, {
  completeAllRemainingTasks,
  resetTaskList,
} from './task-progress.js';

let messageHistory = [];
let cachedFacetTools = null;

// Cache for loaded templates
let systemPromptCache = null;
let overviewAnalysisTemplateCache = null;
let deepAnalysisTemplateCache = null;

// Cache for analysis results - now using localStorage for persistence
const CACHE_KEY = 'rumAnalysisCache';
const CACHE_DURATION = 40 * 60 * 1000; // 20 minute in milliseconds

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
  console.log('[Cache] Analysis result cached for 5 minutes');
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

  const facetElements = facetSidebar.querySelectorAll('list-facet, link-facet, literal-facet, file-facet, thumbnail-facet');
  console.log(`[Facet Extraction] Found ${facetElements.length} facet elements`);

  const tools = [];

  facetElements.forEach((facetElement, index) => {
    const facetName = facetElement.getAttribute('facet');
    if (!facetName) {
      console.log(`[Facet Extraction] Skipping facet #${index + 1} - no facet name`);
      return;
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

  console.log('[Facet Extraction] Created tools:', tools.map((t, i) => `
    Tool #${i + 1}:
    - Name: ${t.name}
    - Description: ${t.description}
  `).join('\n'));

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
  const facetName = toolName.replace(/Facet$/, '').replace(/_/g, '.');
  const facetElement = document.querySelector(`[facet="${facetName}"]`);

  if (!facetElement) {
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
            const labelText = label.querySelector('.label')?.textContent?.trim() || '';
            const valueText = label.querySelector('.value')?.textContent?.trim() || '';
            const countElement = label.querySelector('number-format.count');
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

            const text = labelText || valueText;
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
            const labelText = label.querySelector('.label')?.textContent?.trim() || '';
            const valueText = label.querySelector('.value')?.textContent?.trim() || '';
            const countElement = label.querySelector('number-format.count');
            const countTitle = countElement?.getAttribute('title') || '0';

            // Extract numeric value from title
            const numericCount = countTitle.split(' ')[0].replace(/[^\d]/g, '');
            const text = labelText || valueText;

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
      };

      console.log('[Dashboard Data] Starting DOM traversal');

      // Find all metric blocks in the dashboard
      const metricElements = document.querySelectorAll('.metric-block, [data-metric-type]');
      console.log('[Dashboard Data] Found metric elements:', metricElements.length);

      metricElements.forEach((metric) => {
        const metricName = metric.getAttribute('data-metric-name') || metric.querySelector('.metric-name')?.textContent;
        const metricValue = metric.getAttribute('data-metric-value') || metric.querySelector('.metric-value')?.textContent;
        if (metricName && metricValue) {
          dashboardData.metrics[metricName.trim()] = metricValue.trim();
        }
      });

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

            return {
              value: labelText || valueText,
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

      console.log('[Dashboard Data] Extraction complete:', dashboardData);
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
    console.log('[Anthropic API] Available facet tools:', facetTools);

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

          const finalSynthesisMessage = `Create a polished, professional analysis report based on the data below. 

DO NOT include any of the raw batch content in your response. Use it only as source material for your analysis.

==== SOURCE MATERIAL (FOR REFERENCE ONLY - DO NOT INCLUDE IN RESPONSE) ====
${allInsights.join('\n\n')}

INSIGHTS COLLECTED:
${getCollectedInsights().map((insight) => `- ${insight.category}: ${insight.insight} (Impact: ${insight.impact}, Metrics: ${insight.metrics})`).join('\n')}

RECOMMENDATIONS COLLECTED:
${getCollectedRecommendations().map((recommendation) => `- ${recommendation.category}: ${recommendation.recommendation} (Priority: ${recommendation.priority}, Effort: ${recommendation.effort}, Expected Impact: ${recommendation.expectedImpact})`).join('\n')}
==== END SOURCE MATERIAL ====

${overviewTemplate}`;

          const finalRequest = {
            model: 'claude-opus-4-20250514',
            max_tokens: 3584, // Comprehensive report with good depth
            messages: [{ role: 'user', content: finalSynthesisMessage }],
            tools: [createInsightsCollectionTool(), createRecommendationsCollectionTool()],
            system: systemPromptText,
            temperature: 0.35, // Balanced for structured comprehensive analysis
          };

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

      // Deep analysis mode - sequential processing
      console.log('[Anthropic API] Using DEEP analysis (sequential processing)');
      if (progressCallback) progressCallback(2, 'in-progress', 'Starting sequential batch processing...');

      // Reset insights and recommendations storage for fresh analysis
      resetInsightsAndRecommendations();

      const allInsights = [];
      const usedTools = new Set();

      // Enhanced initial message with clear instructions
      const initialMessage = `${message}

DASHBOARD DATA:
${Object.entries(dashboardData.metrics)
    .map(([metric, value]) => `- ${metric}: ${value}`)
    .join('\n')}

SEGMENTS (top 3 per category):
${Object.entries(dashboardData.segments)
    .map(([segment, items]) => `
${segment}: ${items.slice(0, 3).map((item) => `${item.value} (${item.count.toLocaleString()})`).join(', ')}`)
    .join('\n')}

ANALYSIS PRIORITIES:
1. ENGAGEMENT ANALYSIS: Identify user interaction patterns, click behaviors, and content engagement
2. BOUNCE RATE INVESTIGATION: Find high-exit pages, single-session patterns, and retention issues  
3. TRAFFIC ACQUISITION DEEP-DIVE: Analyze traffic sources, referrer quality, and channel performance
4. CONVERSION OPTIMIZATION: Discover friction points and optimization opportunities

CRITICAL WORKFLOW:
1. FIRST: Analyze "checkpoint" facet to discover available checkpoints
2. THEN: Use "filter" operations on key checkpoints (error, click, enter, navigate) to activate drilldown facets
3. FINALLY: Analyze newly revealed drilldown facets (.source, .target) for detailed insights

Use available tools systematically. Focus on checkpoint activation first, then drilldown analysis.`;

      // Variables already defined above for both parallel and sequential processing

      // Systematic batching with dynamic batch count, 3 tools per batch
      let currentBatch = 0;
      const remainingTools = [...facetTools];
      const toolsPerBatch = 3;
      const estimatedTotalBatches = Math.ceil(facetTools.length / toolsPerBatch);

      while (remainingTools.length > 0 && currentBatch < estimatedTotalBatches) {
        currentBatch += 1;
        console.log(`[Systematic Batch] Batch ${currentBatch}: Processing ${remainingTools.length} remaining tools`);

        // Update progress for current batch
        if (progressCallback) {
          progressCallback(currentBatch + 1, 'in-progress', `Processing Batch ${currentBatch} of ${estimatedTotalBatches}...`);
        }

        // Get tools for this batch
        const batchTools = remainingTools.splice(0, toolsPerBatch);

        // Prepare message for this batch
        let batchMessage;
        if (currentBatch === 1) {
          batchMessage = initialMessage;
        } else {
          batchMessage = `Continue systematic analysis using available tools.

PREVIOUS FINDINGS:
${allInsights.join('\n\n')}

FOCUS: Use remaining tools to discover deeper insights, activate checkpoints, and analyze drilldown facets.
TOOLS FOR THIS BATCH: ${batchTools.map((t) => t.name).join(', ')}`;
        }

        // Fresh message history for each batch (avoid tool role issues)
        const batchMessageHistory = [
          { role: 'user', content: batchMessage },
        ];

        const batchRequest = {
          model: 'claude-opus-4-20250514',
          max_tokens: 4096,
          messages: batchMessageHistory,
          tools: batchTools,
          system: systemPromptText,
          temperature: 0.3,
        };

        console.log(`[Systematic Batch] Sending batch ${currentBatch} with ${batchTools.length} tools`);

        try {
          const batchResponse = await fetch('https://chat-bot-test.asthabhargava001.workers.dev/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': mainApiKey,
            },
            body: JSON.stringify(batchRequest),
          });

          if (!batchResponse.ok) {
            const errorData = await batchResponse.json();
            console.error(`[Systematic Batch] Batch ${currentBatch} failed:`, errorData);
            break;
          }

          const batchData = await batchResponse.json();
          console.log(`[Systematic Batch] Batch ${currentBatch} response received`);

          if (batchData.content && batchData.content.length > 0) {
            let batchAnalysis = '';
            const batchToolCalls = [];

            // Process batch response
            batchData.content.forEach((item) => {
              if (item.type === 'text') {
                const text = item.text.trim();
                if (text) batchAnalysis += `${text}\n`;
              } else if (item.type === 'tool_use') {
                batchToolCalls.push(item);
              }
            });

            // Execute tool calls with stable event handling
            if (batchToolCalls.length > 0) {
              console.log(`[Systematic Batch] Executing ${batchToolCalls.length} tools in batch ${currentBatch}`);

              for (let i = 0; i < batchToolCalls.length; i += 1) {
                const toolCall = batchToolCalls[i];
                try {
                  console.log(`[Systematic Batch] Executing: ${toolCall.name}`);
                  const result = await handleDynamicFacetToolCall(
                    toolCall.name,
                    toolCall.input || {},
                  );

                  // Track used tools
                  usedTools.add(toolCall.name);
                  console.log(`[Systematic Batch] Tool ${toolCall.name} completed:`, result.success);
                } catch (error) {
                  console.error(`[Systematic Batch] Error executing ${toolCall.name}:`, error);
                }
              }

              // Get analysis of batch results (clean message history)
              const batchFollowUpMessage = `What insights did you discover from the tool results in this batch? Focus on:
- Key patterns and performance issues
- User behavior insights
- Business impact findings
- Any new facets that became available for further analysis`;

              const batchFollowUpHistory = [
                { role: 'user', content: batchFollowUpMessage },
              ];

              const batchFollowUpRequest = {
                model: 'claude-opus-4-20250514',
                max_tokens: 2048,
                messages: batchFollowUpHistory,
                system: systemPromptText,
                temperature: 0.3,
              };

              const batchFollowUpResponse = await fetch('https://chat-bot-test.asthabhargava001.workers.dev/', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-api-key': mainApiKey,
                },
                body: JSON.stringify(batchFollowUpRequest),
              });

              if (batchFollowUpResponse.ok) {
                const batchFollowUpData = await batchFollowUpResponse.json();
                if (batchFollowUpData.content && batchFollowUpData.content.length > 0) {
                  let batchInsights = '';
                  batchFollowUpData.content.forEach((item) => {
                    if (item.type === 'text') {
                      const text = item.text.trim();
                      if (text) batchInsights += `${text}\n`;
                    }
                  });
                  // Collect insights without batch headers
                  allInsights.push(batchInsights);
                }
              }
            } else if (batchAnalysis) {
              // No tool calls, just add text analysis
              allInsights.push(batchAnalysis);
            }

            // Log newly discovered tools but don't add them to continue processing
            const allAvailableTools = extractFacetsFromExplorer();
            const newlyAvailableTools = allAvailableTools.filter(
              (tool) => !usedTools.has(tool.name),
            );

            if (newlyAvailableTools.length > 0) {
              console.log(`[Systematic Batch] Found ${newlyAvailableTools.length} new tools (not adding to queue): ${newlyAvailableTools.map((t) => t.name).join(', ')}`);
            }

            console.log(`[Systematic Batch] Batch ${currentBatch} complete. ${remainingTools.length} tools remaining in queue`);

            // Mark current batch as completed in progress tracker
            if (progressCallback) {
              progressCallback(currentBatch + 1, 'completed', `Batch ${currentBatch} completed successfully`);
            }

            // Stop if no more tools in initial queue
            if (remainingTools.length === 0) {
              console.log('[Systematic Batch] All initial tools processed');
              break;
            }
          } else {
            console.log(`[Systematic Batch] Batch ${currentBatch} had no content`);
            break;
          }
        } catch (error) {
          console.error(`[Systematic Batch] Error in batch ${currentBatch}:`, error);
          break;
        }
      }

      // Log completion reason
      if (currentBatch >= estimatedTotalBatches) {
        console.log(`[Systematic Batch] Completed ${estimatedTotalBatches} estimated batches as planned`);
      }

      // Comprehensive final synthesis - organize by topic, not by batch
      console.log('[Systematic Batch] Generating comprehensive topical analysis');
      const finalReportTaskIndex = estimatedTotalBatches + 2; // Dynamic final task index
      if (progressCallback) {
        progressCallback(finalReportTaskIndex, 'in-progress', 'Generating comprehensive final report...', 10);
      }

      // Load the deep analysis template
      if (progressCallback) {
        progressCallback(finalReportTaskIndex, 'in-progress', 'Loading deep analysis template...', 25);
      }
      const deepTemplate = await getDeepAnalysisTemplate();

      const finalMessage = `Based on systematic analysis across ${currentBatch} batches, create a comprehensive, well-organized analysis report:

RAW FINDINGS FROM ALL BATCHES:
${allInsights.join('\n\n')}

INSIGHTS COLLECTED:
${getCollectedInsights().map((insight) => `- ${insight.category}: ${insight.insight} (Impact: ${insight.impact}, Metrics: ${insight.metrics})`).join('\n')}

RECOMMENDATIONS COLLECTED:
${getCollectedRecommendations().map((recommendation) => `- ${recommendation.category}: ${recommendation.recommendation} (Priority: ${recommendation.priority}, Effort: ${recommendation.effort}, Expected Impact: ${recommendation.expectedImpact})`).join('\n')}

${deepTemplate}`;

      const finalMessageHistory = [
        { role: 'user', content: finalMessage },
      ];

      const finalRequest = {
        model: 'claude-opus-4-20250514',
        max_tokens: 4096,
        messages: finalMessageHistory,
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
            console.log(`[Deep Final Analysis] Executing ${finalToolCalls.length} collection tools`);
            for (let i = 0; i < finalToolCalls.length; i += 1) {
              const toolCall = finalToolCalls[i];
              try {
                // eslint-disable-next-line no-await-in-loop
                await handleDynamicFacetToolCall(toolCall.name, toolCall.input || {}, false);
              } catch (error) {
                console.error(`[Deep Final Analysis] Error executing ${toolCall.name}:`, error);
              }
            }
          }

          console.log(`[Systematic Batch] Comprehensive topical analysis completed, length: ${finalAnalysis.length} characters`);
          if (progressCallback) {
            progressCallback(finalReportTaskIndex, 'completed', 'Deep analysis report generated successfully', 100);
          }
          cacheAnalysisResult(finalAnalysis, currentDashboardHash);
          return finalAnalysis;
        }
      }

      const result = allInsights.join('\n\n') || 'Systematic batched analysis completed.';
      cacheAnalysisResult(result, currentDashboardHash);
      return result;
    }

    // Simple fallback approach
    const fallbackMessage = `${message}

Analyze the RUM data and provide comprehensive insights.`;

    messageHistory.push({ role: 'user', content: fallbackMessage });

    const fallbackSystemPrompt = await getSystemPrompt();
    const fallbackRequest = {
      model: 'claude-opus-4-20250514',
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

export default async function decorate(block) {
  messageHistory = [];

  const chatInterface = document.createElement('div');
  chatInterface.className = 'chat-interface';

  chatInterface.innerHTML = `
    <div class="chat-header">
      <h2>OpTel Detective</h2>
      <div class="header-buttons">
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

  // Download functionality
  const generatePDF = () => {
    if (!analysisContent) {
      // eslint-disable-next-line no-alert
      alert('No analysis content available for download.');
      return;
    }

    // Get URL from the dashboard input field
    const urlInput = document.querySelector('#url');
    const currentUrl = urlInput ? urlInput.value.trim() : '';
    const reportTitle = currentUrl
      ? `OpTel analysis report for ${currentUrl}`
      : 'OpTel analysis report';

    // Create filename by replacing spaces with dashes (for PDF save suggestion)
    const filename = reportTitle.replace(/\s+/g, '-');

    // Store original title and change it BEFORE creating the iframe
    const originalTitle = document.title;
    console.log('Original title:', originalTitle);
    console.log('Setting title to:', filename);
    document.title = filename;
    console.log('Document title is now:', document.title);

    // Create a clean HTML content for printing
    const cleanContent = analysisContent
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace HTML entities
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();

    // Open a new window directly for printing with custom title
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${filename}</title>
        <meta charset="utf-8">
        <style>
          @media print {
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: none;
              margin: 0;
              padding: 20px;
            }
            h1 { 
              color: #2c5aa0;
              border-bottom: 2px solid #2c5aa0;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .timestamp { 
              color: #666;
              font-size: 14px;
              margin-bottom: 30px;
            }
            .content { 
              white-space: pre-wrap;
              font-size: 12px;
              line-height: 1.5;
            }
            @page {
              margin: 1in;
              size: A4;
            }
          }
          @media screen {
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            h1 { 
              color: #2c5aa0;
              border-bottom: 2px solid #2c5aa0;
              padding-bottom: 10px;
            }
            .timestamp { 
              color: #666;
              font-size: 14px;
              margin-bottom: 20px;
            }
            .content { 
              white-space: pre-wrap;
              line-height: 1.6;
            }
          }
        </style>
      </head>
      <body>
        <h1>${reportTitle}</h1>
        <div class="timestamp">Generated on: ${new Date().toLocaleString()}</div>
        <div class="content">${cleanContent}</div>
        <script>
          // Auto-trigger print dialog when page loads
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();

    // Restore original title after a delay
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  downloadButton.addEventListener('click', generatePDF);

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

  const createMessageElement = (text, className) => {
    const div = document.createElement('div');
    div.className = `message ${className}`;
    div.innerHTML = text.replace(/\n/g, '<br>');
    return div;
  };

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

  // Load saved deep mode preference
  const savedDeepMode = localStorage.getItem('rumChatDeepMode') === 'true';
  deepModeCheckbox.checked = savedDeepMode;
  deepModeCheckbox.dispatchEvent(new Event('change'));

  startAnalysisButton.addEventListener('click', async () => {
    // Prevent analysis if we're in the middle of clearing cache
    if (isProcessingCacheClear) {
      console.log('[UI] Ignoring click during cache clear process');
      return;
    }

    apiKeySection.style.display = 'none';

    const addProgressMessage = (message) => {
      if (message.trim()) {
        messagesDiv.appendChild(createMessageElement(message, 'claude-message'));
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
      }
    };

    try {
      // Check if we have cached results first
      const cacheStatus = getCacheStatus();
      if (cacheStatus) {
        addProgressMessage(`${cacheStatus}`);
        // If we have cached results, we should also enable download if content exists
        const cachedResult = getAnalysisCache();
        if (cachedResult && cachedResult.result) {
          analysisContent = cachedResult.result;
          downloadButton.disabled = false;
          downloadButton.title = 'Download insights as PDF';
        }
        return; // Exit early if using cached results
      }

      // Create task list for live progress tracking
      const isDeepMode = localStorage.getItem('rumChatDeepMode') === 'true';

      // For deep mode, generate dynamic batch tasks based on expected number of tools
      const toolsPerBatch = 3;
      const facetToolsCount = extractFacetsFromExplorer().length;
      const expectedBatches = Math.ceil(facetToolsCount / toolsPerBatch);

      const taskList = isDeepMode ? [
        'Initializing analysis environment',
        'Extracting dashboard data and facets',
        ...Array.from({ length: expectedBatches }, (_, i) => `Processing Batch ${i + 1} (Sequential)`),
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

        // Simple start message
        // const startMessage = isDeepMode
        //   ? '🔬 Deep analysis started...'
        //   : '⚡ Overview analysis started...';
        // addProgressMessage(startMessage);
      } else {
        updateTaskStatus(1, 'completed', 'Basic analysis mode - no advanced tools found');
        addProgressMessage('⚠️ No facet tools found, proceeding with basic dashboard analysis...');
      }

      const response = await callAnthropicAPI('Analyze the RUM data from the dashboard.', false, updateTaskStatus);
      if (response.trim()) {
        // if (cacheStatus) {
        //   addProgressMessage('✨ Cached analysis loaded! Here are the insights:');
        // } else {
        //   // addProgressMessage('✨ Analysis complete! Here are the insights:');
        // }
        addProgressMessage(response);

        // Store analysis content and enable download button
        analysisContent = response;
        downloadButton.disabled = false;
        downloadButton.title = 'Download insights as PDF';

        // Mark all remaining tasks as completed
        completeAllRemainingTasks();

        updateCacheStatus(); // Update cache status after analysis
      } else {
        addProgressMessage('Unable to generate insights. Please try again.');
      }
    } catch (error) {
      console.error('[Agent] Error during analysis:', error);
      addProgressMessage(`❌ Error during analysis: ${error.message}`);
      apiKeySection.style.display = 'block';
    }
  });
}
