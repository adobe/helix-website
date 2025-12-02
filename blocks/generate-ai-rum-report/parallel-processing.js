/**
 * Parallel Processing Module
 * Handles parallel batch processing of facet analysis
 */

/* eslint-disable no-console */

import { API_CONFIG } from './config.js';

// ============================================================================
// CONSTANTS
// ============================================================================

const BATCH_CONFIG = {
  TOOLS_PER_BATCH: 1, // One tool per batch - ensures ALL metrics are analyzed
  PROGRESS_WEIGHT: 80, // Parallel batches fill 80% of progress bar
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Split tools into batches
 * @param {Array} tools
 * @returns {Array} Batches with tools
 */
function createBatches(tools) {
  const batches = [];
  const totalBatches = Math.ceil(tools.length / BATCH_CONFIG.TOOLS_PER_BATCH);

  for (let i = 0; i < totalBatches; i += 1) {
    const start = i * BATCH_CONFIG.TOOLS_PER_BATCH;
    const batchTools = tools.slice(start, start + BATCH_CONFIG.TOOLS_PER_BATCH);

    if (batchTools.length > 0) {
      batches.push({ id: i + 1, tools: batchTools });
    }
  }

  return batches;
}

/**
 * Format dashboard data for batch message
 * @param {Object} dashboardData
 * @returns {string} Formatted dashboard data
 */
function formatDashboardData(dashboardData) {
  const metrics = Object.entries(dashboardData.metrics || {})
    .map(([k, v]) => `- ${k}: ${v}`)
    .join('\n');

  const segments = Object.entries(dashboardData.segments || {})
    .map(([segment, items]) => {
      const top5 = items.slice(0, 5)
        .map((item) => {
          const itemMetrics = item.metrics && Object.keys(item.metrics).length > 0
            ? `, metrics: ${JSON.stringify(item.metrics)}`
            : '';
          return `${item.value} (${item.count.toLocaleString()}${itemMetrics})`;
        })
        .join(', ');

      const more = items.length > 5 ? ` ... and ${items.length - 5} more` : '';
      return `${segment}: ${top5}${more}`;
    })
    .join('\n');

  return `DASHBOARD DATA:
${metrics}

SEGMENTS DATA (showing top items per facet):
${segments}`;
}

/**
 * Create batch message for single-tool analysis
 * @param {Object} batch
 * @param {string} baseMessage
 * @param {Object} dashboardData
 * @param {boolean} isFirstBatch
 * @returns {string} Batch message
 */
function createBatchMessage(batch, baseMessage, dashboardData, isFirstBatch) {
  const tool = batch.tools[0]; // Single tool per batch
  const toolName = tool.name;

  if (isFirstBatch) {
    const dateRange = dashboardData.dateRange
      ? `📅 This data covers: ${dashboardData.dateRange.toUpperCase()}`
      : '⚠️ Date range not specified';

    return `${baseMessage}

==== DATA TIME PERIOD ====
${dateRange}

IMPORTANT: All metrics and insights below are for the ${dashboardData.dateRange || 'specified'} time period.
==== END TIME PERIOD ====

${formatDashboardData(dashboardData)}

ANALYZE METRIC: ${toolName}

INSTRUCTIONS:
1. Call the "${toolName}" tool with operation='analyze' to get detailed data
2. Examine the results for patterns, outliers, and valuable insights
3. Provide concise analysis with EXACT numbers from the tool results

⚠️ DATA INTEGRITY: ONLY report findings based on actual tool results. DO NOT estimate or invent metrics.

⚠️ FOCUS ON VALUE:
- If data is unremarkable/expected: Note it briefly (1-2 sentences)
- If data reveals issues/patterns: Provide detailed analysis with specific metrics

Start by calling the tool.`;
  }

  return `ANALYZE METRIC: ${toolName}

INSTRUCTIONS:
1. Call the "${toolName}" tool with operation='analyze'
2. Analyze the results with EXACT numbers
3. Provide concise findings (detailed if valuable, brief if unremarkable)

⚠️ DATA INTEGRITY: Use ONLY actual tool results, never estimates.

Start your analysis.`;
}

// ============================================================================
// BATCH PROCESSING
// ============================================================================

/**
 * Process single batch
 * @param {Object} batch
 * @param {string} message
 * @param {Object} dashboardData
 * @param {string} systemPrompt
 * @param {string} apiKey
 * @param {Function} toolHandler
 * @param {Function} progressCallback
 * @returns {Promise<Object>} Batch result
 */
async function processBatch(
  batch,
  message,
  dashboardData,
  systemPrompt,
  apiKey,
  toolHandler,
) {
  const batchMessage = createBatchMessage(batch, message, dashboardData, batch.id === 1);

  const toolName = batch.tools[0].name; // Single tool per batch

  try {
    const request = {
      max_tokens: API_CONFIG.BATCH_MAX_TOKENS,
      messages: [{ role: 'user', content: batchMessage }],
      tools: batch.tools,
      system: systemPrompt,
      temperature: API_CONFIG.BATCH_TEMPERATURE,
    };

    // Use API Factory (AWS Bedrock)
    const { callAI } = await import('./api/api-factory.js');
    const data = await callAI(request);

    if (!data?.content?.length) {
      return {
        batchId: batch.id, toolName, analysis: '', success: false, error: 'No content',
      };
    }

    // Debug: Log what the AI returned
    console.log(`[${toolName}] AI response content blocks:`, data.content.map((item) => ({
      type: item.type,
      hasText: item.type === 'text' ? !!item.text : undefined,
      hasToolUse: item.type === 'tool_use' ? item.name : undefined,
    })));

    let analysis = '';
    const toolCalls = [];

    data.content.forEach((item) => {
      if (item.type === 'text' && item.text.trim()) {
        analysis += `${item.text.trim()}\n`;
      } else if (item.type === 'tool_use') {
        toolCalls.push(item);
      }
    });

    // Execute tool calls and send results back to AI
    if (toolCalls.length > 0) {
      console.log(`[${toolName}] Executing ${toolCalls.length} tool calls and sending results to AI`);

      const toolResults = await Promise.all(
        toolCalls.map(async (toolCall) => {
          try {
            const result = await toolHandler(toolCall.name, toolCall.input || {}, true);
            console.log(`[${toolName}] ✓ Tool executed:`, result.success ? `${result.totalItems || 0} items` : result.message);
            return {
              type: 'tool_result',
              tool_use_id: toolCall.id,
              content: JSON.stringify(result, null, 2),
            };
          } catch (error) {
            console.error(`[${toolName}] Tool error:`, error.message);
            return {
              type: 'tool_result',
              tool_use_id: toolCall.id,
              content: JSON.stringify({ success: false, error: error.message }),
              is_error: true,
            };
          }
        }),
      );

      // Send tool results back to AI for analysis
      const followUpRequest = {
        max_tokens: API_CONFIG.FOLLOWUP_MAX_TOKENS,
        messages: [
          { role: 'user', content: batchMessage },
          { role: 'assistant', content: data.content },
          { role: 'user', content: toolResults },
        ],
        tools: batch.tools,
        system: systemPrompt,
        temperature: API_CONFIG.FOLLOWUP_TEMPERATURE,
      };

      // Reuse callAI from above
      const followUpData = await callAI(followUpRequest);

      if (followUpData) {
        analysis = '';
        followUpData.content.forEach((item) => {
          if (item.type === 'text' && item.text.trim()) {
            analysis += `${item.text.trim()}\n`;
          }
        });
        console.log(`[${toolName}] ✓ AI analyzed tool results: ${analysis.length} chars`);
      } else {
        console.error(`[${toolName}] ✗ Failed to send tool results to AI`);
      }
    } else {
      console.warn(`[${toolName}] ⚠️ Tool not used by AI`);
    }

    return {
      batchId: batch.id,
      toolName,
      analysis: analysis || `${toolName} analyzed.`,
      success: true,
    };
  } catch (error) {
    console.error(`[${toolName}] ✗ Error:`, error.message);

    return {
      batchId: batch.id,
      toolName,
      analysis: `${toolName} skipped due to error.`,
      success: false,
      error: error.message,
    };
  }
}

/**
 * Perform follow-up analysis on batch results
 * @param {Array} analyses
 * @param {string} systemPrompt
 * @returns {Promise<string|null>} Follow-up analysis
 */
async function performFollowUpAnalysis(analyses, systemPrompt) {
  if (analyses.length === 0) return null;

  console.log('[Follow-up] Generating comprehensive insights...');

  const content = `Based on the comprehensive tool execution results from all batches, provide detailed insights analysis:

BATCH RESULTS:
${analyses.join('\n\n')}

Analyze the findings and provide substantial insights covering:
- Performance patterns and bottlenecks discovered
- User behavior insights and engagement patterns
- Traffic acquisition analysis and channel effectiveness
- Business impact findings and conversion opportunities
- Technical issues, errors, and optimization recommendations
- Cross-batch correlations and key discoveries

Provide comprehensive analysis with specific details and actionable insights.`;

  try {
    const request = {
      max_tokens: API_CONFIG.FOLLOWUP_MAX_TOKENS,
      messages: [{ role: 'user', content }],
      system: systemPrompt,
      temperature: API_CONFIG.FOLLOWUP_TEMPERATURE,
    };

    // Use API Factory (AWS Bedrock)
    const { callAI } = await import('./api/api-factory.js');
    const data = await callAI(request);

    if (!data.content?.length) return null;

    let synthesis = '';
    data.content.forEach((item) => {
      if (item.type === 'text' && item.text.trim()) {
        synthesis += `${item.text.trim()}\n`;
      }
    });

    if (synthesis) {
      console.log('[Follow-up] ✓ Complete');
      return synthesis;
    }

    return null;
  } catch (error) {
    console.error('[Follow-up] Error:', error.message);
    return null;
  }
}

// ============================================================================
// MAIN EXPORT
// ============================================================================

/**
 * Process facets in parallel batches
 * @param {Array} facetTools - Array of tool definitions
 * @param {Object} dashboardData - Dashboard data to analyze
 * @param {string} systemPrompt - System prompt for AI
 * @param {string} apiKey - Anthropic API key
 * @param {string} message - Base message
 * @param {Function} toolHandler - Function to handle tool calls
 * @param {Function} progressCallback - Optional progress callback
 * @returns {Promise<Array>} Array of analyses
 */
export async function processParallelBatches(
  facetTools,
  dashboardData,
  systemPrompt,
  apiKey,
  message,
  toolHandler,
  progressCallback = null,
) {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('[Parallel] RECEIVED FACET TOOLS');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Total facet tools received: ${facetTools.length}`);
  console.log(`Tool names: ${facetTools.map((t) => t.name).join(', ')}`);
  console.log('═══════════════════════════════════════════════════════════');

  const batches = createBatches(facetTools);
  console.log(`[Parallel] Created ${batches.length} batches (${BATCH_CONFIG.TOOLS_PER_BATCH} tool per batch)`);
  batches.forEach((batch) => {
    console.log(`  Batch ${batch.id}: ${batch.tools.map((t) => t.name).join(', ')}`);
  });

  let completedBatches = 0;
  const updateProgress = () => {
    if (progressCallback && batches.length > 0) {
      const percent = Math.round(
        (completedBatches / batches.length) * BATCH_CONFIG.PROGRESS_WEIGHT,
      );
      progressCallback(
        2,
        'in-progress',
        `Analyzing metrics... ${completedBatches}/${batches.length} complete`,
        percent,
      );
    }
  };

  // AWS Bedrock has strict rate limits - process sequentially
  console.log('[Parallel] Using AWS Bedrock - processing sequentially to avoid rate limits');
  const results = await batches.reduce(async (prevPromise, batch) => {
    const acc = await prevPromise;
    const result = await processBatch(
      batch,
      message,
      dashboardData,
      systemPrompt,
      apiKey,
      toolHandler,
    );

    completedBatches += 1;
    updateProgress();

    // Add small delay between requests to avoid rate limits
    if (completedBatches < batches.length) {
      await new Promise((resolve) => { setTimeout(resolve, 500); });
    }

    return [...acc, result];
  }, Promise.resolve([]));

  // Collect successful analyses
  const successful = results
    .filter((r) => r.success)
    .map((r) => r.analysis?.trim())
    .filter(Boolean);

  const failed = results.filter((r) => !r.success);

  console.log(`[Parallel] ✓ ${successful.length}/${results.length} metrics analyzed successfully`);

  if (failed.length > 0) {
    console.warn(`[Parallel] ⚠️ ${failed.length} metrics failed:`, failed.map((f) => f.toolName).join(', '));
  }

  // Perform follow-up synthesis
  let followUp = null;
  if (successful.length > 0) {
    if (progressCallback) {
      progressCallback(2, 'in-progress', 'Synthesizing comprehensive insights...', 85);
    }

    followUp = await performFollowUpAnalysis(successful, systemPrompt);

    if (progressCallback && followUp) {
      progressCallback(2, 'in-progress', 'Analysis complete', 100);
    }
  }

  // Return all analyses including synthesis
  const allAnalyses = [...successful];
  if (followUp) allAnalyses.push(followUp);

  const totalChars = allAnalyses.reduce((sum, a) => sum + a.length, 0);
  console.log(`[Parallel] ✓ Complete. ${successful.length} metrics, ${totalChars.toLocaleString()} total characters`);

  return allAnalyses;
}

export default processParallelBatches;
