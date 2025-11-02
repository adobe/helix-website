/**
 * Analysis Engine Module
 * Core AI orchestration for RUM dashboard analysis
 */

/* eslint-disable no-console */

import { extractDashboardData, generateDashboardHash } from './dashboard-extractor.js';
import {
  extractFacetsFromExplorer,
  initializeDynamicFacets,
  handleDynamicFacetToolCall,
} from './facet-manager.js';
import {
  isCacheValid,
  cacheAnalysisResult,
  getCachedResult,
} from './cache-manager.js';
import {
  processParallelBatches,
} from '../parallel-processing.js';

// Template cache
let systemPromptCache = null;
let overviewAnalysisTemplateCache = null;

// API configuration
const API_ENDPOINT = 'https://chat-bot-test.asthabhargava001.workers.dev/';
const API_MODEL = 'claude-opus-4-1-20250805';

/**
 * Load text file content from parent directory
 * @param {string} filename - File name to load
 * @returns {Promise<string>} File content
 */
async function loadTextFile(filename) {
  try {
    const response = await fetch(`/blocks/generate-ai-rum-report/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    console.error(`[Template Loader] Error loading ${filename}:`, error);
    return null;
  }
}

/**
 * Get system prompt
 * @returns {Promise<string>} System prompt text
 */
async function getSystemPrompt() {
  if (!systemPromptCache) {
    systemPromptCache = await loadTextFile('system-prompt.txt');
  }
  return systemPromptCache || 'You are a RUM data analyst specializing in web performance and user engagement analysis.';
}

/**
 * Get overview analysis template
 * @returns {Promise<string>} Overview template text
 */
async function getOverviewAnalysisTemplate() {
  if (!overviewAnalysisTemplateCache) {
    overviewAnalysisTemplateCache = await loadTextFile('overview-analysis-template.txt');
  }
  return overviewAnalysisTemplateCache || 'CREATE A CLEAN, PROFESSIONAL REPORT WITH STRUCTURED SECTIONS.';
}

/**
 * Build form data section for the analysis
 * @param {Object} dashboardData - Dashboard data
 * @returns {string} Form data section text
 */
function buildFormDataSection(dashboardData) {
  let section = '\n\n==== 📝 FORMS DATA - FOR DEDICATED FORMS SECTION ONLY ====\n';
  section += '⚠️ This data is ONLY for the "Forms Interaction & Conversion Analysis" section.\n';
  section += '⚠️ DO NOT mention forms in Executive Summary, Key Metrics, or other sections.\n\n';

  if (dashboardData.segments['fill.source']) {
    section += '<b>FILL.SOURCE (Form Entry Pages):</b>\n';
    dashboardData.segments['fill.source'].slice(0, 10).forEach((item, idx) => {
      section += `${idx + 1}. ${item.value}: ${item.count.toLocaleString()} form starts`;
      if (item.metrics && Object.keys(item.metrics).length > 0) {
        section += ` (Metrics: ${JSON.stringify(item.metrics)})`;
      }
      section += '\n';
    });
    section += '\n';
  }

  if (dashboardData.segments['formsubmit.source']) {
    section += '<b>FORMSUBMIT.SOURCE (Form Submission Pages):</b>\n';
    dashboardData.segments['formsubmit.source'].slice(0, 10).forEach((item, idx) => {
      section += `${idx + 1}. ${item.value}: ${item.count.toLocaleString()} form submissions`;
      if (item.metrics && Object.keys(item.metrics).length > 0) {
        section += ` (Metrics: ${JSON.stringify(item.metrics)})`;
      }
      section += '\n';
    });
    section += '\n';
  }

  if (dashboardData.segments['formsubmit.target']) {
    section += '<b>FORMSUBMIT.TARGET (Post-Submission Destinations):</b>\n';
    dashboardData.segments['formsubmit.target'].slice(0, 10).forEach((item, idx) => {
      section += `${idx + 1}. ${item.value}: ${item.count.toLocaleString()} redirects`;
      if (item.metrics && Object.keys(item.metrics).length > 0) {
        section += ` (Metrics: ${JSON.stringify(item.metrics)})`;
      }
      section += '\n';
    });
    section += '\n';
  }

  section += '<b>INSTRUCTIONS:</b>\n';
  section += '1. Create a dedicated "📝 Forms Interaction & Conversion Analysis" section\n';
  section += '2. Use this forms data ONLY in that dedicated section\n';
  section += '3. Analyze the complete funnel: fill.source → formsubmit.source → formsubmit.target\n';
  section += '4. In ALL OTHER SECTIONS, focus on NON-FORM facets\n';
  section += '==== END FORMS DATA ====\n\n';

  return section;
}

/**
 * Build final synthesis message for AI
 * @param {Object} dashboardData - Dashboard data
 * @param {Array} allInsights - Collected insights
 * @param {string} formDataSection - Form data section
 * @param {string} overviewTemplate - Overview template
 * @returns {string} Final synthesis message
 */
function buildFinalSynthesisMessage(dashboardData, allInsights, formDataSection, overviewTemplate) {
  const hasMetrics = Object.keys(dashboardData.metrics).length > 0;

  return `Create a polished, professional analysis report based on the data below.

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
==== END SOURCE MATERIAL ====

${overviewTemplate}`;
}

/**
 * Call Anthropic API for analysis
 * @param {Object} dashboardData - Dashboard data object
 * @param {string} currentDashboardHash - Dashboard hash for caching
 * @param {Array} facetTools - Array of facet tools
 * @param {Function} progressCallback - Progress callback
 * @returns {Promise<string>} Analysis result
 */
async function callAnthropicAPI(
  dashboardData,
  currentDashboardHash,
  facetTools,
  progressCallback,
) {
  console.log('[Analysis Engine] Starting AI analysis...');

  try {
    // Get API key
    const mainApiKey = localStorage.getItem('anthropicApiKey') || '';
    if (!mainApiKey) {
      throw new Error('API key not found');
    }

    // Get system prompt
    const systemPromptText = await getSystemPrompt();

    // Process with parallel batches
    if (progressCallback) {
      progressCallback(2, 'in-progress', 'Starting parallel batch processing...');
    }

    const allInsights = await processParallelBatches(
      facetTools,
      dashboardData,
      systemPromptText,
      mainApiKey,
      'Analyze the RUM data from the dashboard.',
      handleDynamicFacetToolCall,
      progressCallback,
    );

    if (allInsights.length > 0) {
      if (progressCallback) {
        progressCallback(2, 'completed', 'Parallel batch processing completed');
        progressCallback(3, 'in-progress', 'Generating streamlined overview report...', 10);
      }

      // Load overview template
      if (progressCallback) {
        progressCallback(3, 'in-progress', 'Loading overview template...', 25);
      }
      const overviewTemplate = await getOverviewAnalysisTemplate();

      // Check for form data
      const hasFormData = !!(
        dashboardData.segments['fill.source']
        || dashboardData.segments['formsubmit.source']
        || dashboardData.segments['formsubmit.target']
      );

      let formDataSection = '';
      if (hasFormData) {
        console.log('[Analysis Engine] Forms data detected - including in report');
        formDataSection = buildFormDataSection(dashboardData);
      }

      // Build final synthesis message
      const finalSynthesisMessage = buildFinalSynthesisMessage(
        dashboardData,
        allInsights,
        formDataSection,
        overviewTemplate,
      );

      // Calculate max tokens
      const maxTokens = hasFormData ? 5500 : 4500;

      const finalRequest = {
        model: API_MODEL,
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: finalSynthesisMessage }],
        system: systemPromptText,
        temperature: 0.35,
      };

      if (progressCallback) {
        progressCallback(3, 'in-progress', 'Preparing the overview analysis...', 40);
      }

      // Make final API call
      if (progressCallback) {
        progressCallback(3, 'in-progress', 'Generating insights and findings...', 65);
      }

      const finalResponse = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': mainApiKey,
        },
        body: JSON.stringify(finalRequest),
      });

      if (finalResponse.ok) {
        const finalData = await finalResponse.json();

        console.log('[Analysis Engine] API Response:', {
          stop_reason: finalData.stop_reason,
          content_blocks: finalData.content?.length || 0,
          usage: finalData.usage,
        });

        if (finalData.stop_reason === 'max_tokens') {
          console.error('[Analysis Engine] ⚠️ Response truncated - increase max_tokens');
        }

        if (finalData.content && finalData.content.length > 0) {
          if (progressCallback) {
            progressCallback(3, 'in-progress', 'Finalizing report...', 80);
          }

          let finalAnalysis = '';

          finalData.content.forEach((item) => {
            if (item.type === 'text') {
              const text = item.text.trim();
              if (text) finalAnalysis += `${text}\n`;
            }
          });

          console.log(`[Analysis Engine] Report completed, length: ${finalAnalysis.length} characters`);
          if (progressCallback) {
            progressCallback(3, 'completed', 'Streamlined overview report completed successfully', 100);
          }

          // Cache the result
          cacheAnalysisResult(finalAnalysis, currentDashboardHash);
          return finalAnalysis;
        }
      } else {
        const errorData = await finalResponse.json();
        throw new Error(errorData.error || `API request failed (${finalResponse.status})`);
      }
    }

    // Fallback result
    const result = 'Analysis completed successfully. Multiple insights were discovered across different data facets.';
    cacheAnalysisResult(result, currentDashboardHash);
    return result;
  } catch (error) {
    console.error('[Analysis Engine] Error in API call:', error);
    throw error;
  }
}

/**
 * Run complete RUM analysis
 * @param {Function} progressCallback - Progress callback function
 * @returns {Promise<string>} Analysis result
 */
export default async function runCompleteRumAnalysis(progressCallback = null) {
  console.log('[Analysis Engine] Starting RUM analysis...');

  try {
    // Step 1: Initialize analysis environment
    if (progressCallback) {
      progressCallback(0, 'in-progress', 'Setting up analysis tools...');
    }

    await new Promise((resolve) => {
      setTimeout(() => {
        console.log('[Analysis Engine] Initializing facet manipulation...');
        initializeDynamicFacets();
        if (progressCallback) {
          progressCallback(0, 'completed', 'Analysis environment ready');
        }
        resolve();
      }, 200);
    });

    // Step 2: Extract dashboard data
    if (progressCallback) {
      progressCallback(1, 'in-progress', 'Scanning dashboard for data and available tools...');
    }

    await new Promise((resolve) => {
      setTimeout(resolve, 300);
    });

    console.log('[Analysis Engine] Extracting dashboard data...');
    const dashboardData = await extractDashboardData();
    console.log('[Analysis Engine] Dashboard data extracted:', {
      metrics: Object.keys(dashboardData.metrics).length,
      segments: Object.keys(dashboardData.segments).length,
      dateRange: dashboardData.dateRange,
    });

    // Generate hash for cache validation
    const currentDashboardHash = generateDashboardHash(dashboardData);

    // Check cache
    if (isCacheValid(currentDashboardHash)) {
      console.log('[Analysis Engine] Using cached analysis');
      const cachedResult = getCachedResult();
      if (cachedResult) {
        if (progressCallback) {
          progressCallback(1, 'completed', 'Using cached analysis');
          progressCallback(2, 'completed', 'Skipped (using cache)');
          progressCallback(3, 'completed', 'Using cached report');
        }
        return cachedResult;
      }
    }

    // Extract facet tools
    const facetTools = extractFacetsFromExplorer();
    console.log(`[Analysis Engine] Found ${facetTools.length} facet tools`);

    if (facetTools.length > 0) {
      if (progressCallback) {
        progressCallback(1, 'completed', `Found ${facetTools.length} analysis metrics ready`);
      }
    } else if (progressCallback) {
      progressCallback(1, 'completed', 'Basic analysis mode - no advanced tools found');
    }

    // Step 3: Run AI analysis
    const response = await callAnthropicAPI(
      dashboardData,
      currentDashboardHash,
      facetTools,
      progressCallback,
    );

    return response;
  } catch (error) {
    console.error('[Analysis Engine] Error:', error);
    throw error;
  }
}
