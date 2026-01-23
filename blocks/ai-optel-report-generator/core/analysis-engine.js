/* Analysis Engine Module - Core AI orchestration for RUM dashboard analysis */

import extractDashboardData from './dashboard-extractor.js';
import {
  extractFacetsFromExplorer,
  initializeDynamicFacets,
  handleDynamicFacetToolCall,
} from './facet-manager.js';
import {
  processMetricsBatches,
} from './metrics-processing.js';
import { buildFacetInfoSection } from '../reports/facet-link-generator.js';
import { PATHS, API_CONFIG } from '../config.js';

// Template cache
let systemPromptCache = null;
let overviewAnalysisTemplateCache = null;

async function loadTextFile(filename) {
  try {
    const response = await fetch(`${PATHS.BLOCK_BASE}/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    throw new Error(`Error loading ${filename}: ${error.message}`);
  }
}

async function getSystemPrompt() {
  if (!systemPromptCache) {
    systemPromptCache = await loadTextFile(PATHS.SYSTEM_PROMPT);
  }
  return systemPromptCache || 'You are a RUM data analyst specializing in web performance and user engagement analysis.';
}

async function getOverviewAnalysisTemplate() {
  if (!overviewAnalysisTemplateCache) {
    overviewAnalysisTemplateCache = await loadTextFile(PATHS.OVERVIEW_TEMPLATE);
  }
  return overviewAnalysisTemplateCache || 'CREATE A CLEAN, PROFESSIONAL REPORT WITH STRUCTURED SECTIONS.';
}

function buildFinalSynthesisMessage(dashboardData, allInsights, overviewTemplate) {
  const hasMetrics = Object.keys(dashboardData.metrics).length > 0;

  return `Create a polished, professional analysis report based on the data below.

DO NOT include any of the raw batch content in your response. Use it only as source material for your analysis.

==== REPORT STRUCTURE REQUIREMENTS ====
1. Start with EXECUTIVE SUMMARY section (required, comes first)
2. Follow with other sections as defined in the template
3. Ensure all facets are covered across appropriate sections

==== DATA TIME PERIOD ====
${dashboardData.dateRange ? `Date Range Selected: ${dashboardData.dateRange}` : 'WARNING: Date range not available'}
${dashboardData.dateRange ? `(Found in: <daterange-wrapper><input data-value="${dashboardData.dateRange}">)` : ''}

IMPORTANT: All insights and metrics in this report are for the ${dashboardData.dateRange || 'specified'} time period.
Convert the data-value to readable format in your report (e.g., "month" → "Last 30 Days", "week" → "Last 7 Days").
==== END TIME PERIOD ====
==== FACET COVERAGE CHECKLIST ====
WARNING: The following facets MUST ALL be covered in the "Key Metrics & Findings" section.
Each facet needs 1 positive + 1 improvement observation:

${Object.keys(dashboardData.segments)
    .map((facet, idx) => `${idx + 1}. ${facet}`)
    .join('\n')}

TOTAL: ${Object.keys(dashboardData.segments).length} facets to cover
==== END CHECKLIST ====
==== ACTUAL DASHBOARD METRICS (USE THESE EXACT VALUES) ====
${hasMetrics
    ? Object.entries(dashboardData.metrics)
      .map(([metric, value]) => `${metric}: ${value}`)
      .join('\n')
    : 'WARNING: Dashboard metrics not available - focus analysis on segment data from tool results'}

TOTAL SEGMENTS: ${Object.keys(dashboardData.segments).length} facets analyzed

COMPLETE LIST OF ALL FACETS THAT MUST BE COVERED:
${Object.keys(dashboardData.segments).join(', ')}

Each of these facets MUST get 1 positive + 1 improvement mention in the "Key Metrics & Findings" section.

SEGMENT SUMMARY (showing top items per facet):
${Object.entries(dashboardData.segments)
    .slice(0, 10)
    .map(([segment, items]) => `- ${segment}: ${items.length} items, top item: ${items[0]?.value || 'N/A'} (${items[0]?.count?.toLocaleString() || 0})`)
    .join('\n')}
${Object.keys(dashboardData.segments).length > 10 ? `... and ${Object.keys(dashboardData.segments).length - 10} more facets` : ''}
==== END DASHBOARD METRICS ====

==== SOURCE MATERIAL (FOR REFERENCE ONLY - DO NOT INCLUDE IN RESPONSE) ====
${allInsights.map((insight) => insight.slice(0, 1000)).join('\n\n')}
${allInsights.reduce((sum, i) => sum + i.length, 0) > allInsights.length * 1000 ? '\n\n[Additional analysis details available - use the dashboard metrics and segment data above for specific numbers]' : ''}
==== END SOURCE MATERIAL ====

${overviewTemplate}`;
}

/** Call AWS Bedrock API for analysis */
async function callAnthropicAPI(dashboardData, facetTools, progressCallback) {
  try {
    // Verify API credentials exist (checked in metrics-processing.js)
    const { getApiProvider } = await import('../api/api-factory.js');
    const provider = getApiProvider();
    if (!provider.hasToken) {
      throw new Error('AWS Bedrock token not found. Please configure your token.');
    }

    // Get system prompt
    const systemPromptText = await getSystemPrompt();

    // Process metrics in sequential batches
    if (progressCallback) {
      progressCallback(2, 'in-progress', 'Starting analysis...');
    }

    const allInsights = await processMetricsBatches(
      facetTools,
      dashboardData,
      systemPromptText,
      null, // API credentials auto-detected in metrics-processing.js
      'Analyze the RUM data from the dashboard.',
      handleDynamicFacetToolCall,
      progressCallback,
    );

    if (allInsights.length > 0) {
      if (progressCallback) {
        progressCallback(2, 'completed', 'Metrics batch processing completed');
        progressCallback(3, 'in-progress', 'Generating streamlined overview report...', 10);
      }

      // Load overview template
      if (progressCallback) {
        progressCallback(3, 'in-progress', 'Loading overview template...', 25);
      }
      const overviewTemplate = await getOverviewAnalysisTemplate();

      // Build final synthesis message
      const finalSynthesisMessage = buildFinalSynthesisMessage(
        dashboardData,
        allInsights,
        overviewTemplate,
      );

      // Add facet info to system prompt (instructions belong in system, not user message)
      const facetInfoSection = buildFacetInfoSection(dashboardData);
      const enhancedSystemPrompt = `${systemPromptText}\n\n${facetInfoSection}`;

      const maxTokens = 7500;

      const finalRequest = {
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: finalSynthesisMessage }],
        system: enhancedSystemPrompt,
        temperature: API_CONFIG.BATCH_TEMPERATURE,
      };

      if (progressCallback) {
        progressCallback(3, 'in-progress', 'Preparing the overview analysis...', 40);
      }

      // Make final API call using API Factory (AWS Bedrock)
      if (progressCallback) {
        progressCallback(3, 'in-progress', 'Generating insights and findings...', 65);
      }

      const { callAI } = await import('../api/api-factory.js');
      const finalData = await callAI(finalRequest);

      if (finalData) {
        if (finalData.stop_reason === 'max_tokens') {
          throw new Error('AI response truncated. Please try again or increase max_tokens configuration.');
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

          if (progressCallback) {
            progressCallback(3, 'completed', 'Streamlined overview report completed successfully', 100);
          }

          return finalAnalysis;
        }
      }
    }

    // Fallback result
    const result = 'Analysis completed successfully. Multiple insights were discovered across different data facets.';
    return result;
  } catch (error) {
    throw new Error(`Analysis Engine error: ${error.message}`);
  }
}

/**
 * Run complete RUM analysis
 * @param {Function} progressCallback - Progress callback function
 * @returns {Promise<string>} Analysis result
 */
export default async function runCompleteRumAnalysis(progressCallback = null) {
  try {
    // Step 1: Initialize analysis environment
    if (progressCallback) {
      progressCallback(0, 'in-progress', 'Setting up analysis tools...');
    }

    await new Promise((resolve) => {
      setTimeout(() => {
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

    const dashboardData = await extractDashboardData();

    // Extract facet tools
    const facetTools = extractFacetsFromExplorer();

    if (facetTools.length > 0) {
      if (progressCallback) {
        progressCallback(1, 'completed', `Found ${facetTools.length} analysis metrics ready`);
      }
    } else if (progressCallback) {
      progressCallback(1, 'completed', 'Basic analysis mode - no advanced tools found');
    }

    // Step 3: Run AI analysis
    const response = await callAnthropicAPI(dashboardData, facetTools, progressCallback);

    return response;
  } catch (error) {
    throw new Error(`RUM Analysis failed: ${error.message}`);
  }
}
