/**
 * Metrics Processing Module - Sequential batch processing of metrics analysis
 */

import { API_CONFIG } from '../config.js';

const BATCH_CONFIG = {
  TOOLS_PER_BATCH: 1,
  PROGRESS_WEIGHT: 80,
};

function createBatches(tools) {
  const batches = [];
  const totalBatches = Math.ceil(tools.length / BATCH_CONFIG.TOOLS_PER_BATCH);

  for (let i = 0; i < totalBatches; i += 1) {
    const start = i * BATCH_CONFIG.TOOLS_PER_BATCH;
    const batchTools = tools.slice(start, start + BATCH_CONFIG.TOOLS_PER_BATCH);
    if (batchTools.length > 0) batches.push({ id: i + 1, tools: batchTools });
  }
  return batches;
}

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

  return `DASHBOARD DATA:\n${metrics}\n\nSEGMENTS DATA (showing top items per facet):\n${segments}`;
}

function createBatchMessage(batch, baseMessage, dashboardData, isFirstBatch) {
  const toolName = batch.tools[0].name;

  if (isFirstBatch) {
    const dateRange = dashboardData.dateRange
      ? `This data covers: ${dashboardData.dateRange.toUpperCase()}`
      : 'WARNING: Date range not specified';

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

DATA INTEGRITY: ONLY report findings based on actual tool results. DO NOT estimate or invent metrics.

FOCUS ON VALUE:
- If data is unremarkable/expected: Note it briefly (1-2 sentences)
- If data reveals issues/patterns: Provide detailed analysis with specific metrics

Start by calling the tool.`;
  }

  return `ANALYZE METRIC: ${toolName}

INSTRUCTIONS:
1. Call the "${toolName}" tool with operation='analyze'
2. Analyze the results with EXACT numbers
3. Provide concise findings (detailed if valuable, brief if unremarkable)

DATA INTEGRITY: Use ONLY actual tool results, never estimates.

Start your analysis.`;
}

async function processBatch(batch, message, dashboardData, systemPrompt, apiKey, toolHandler) {
  const batchMessage = createBatchMessage(batch, message, dashboardData, batch.id === 1);
  const toolName = batch.tools[0].name;

  try {
    const { callAI } = await import('../api/api-factory.js');
    const data = await callAI({
      max_tokens: API_CONFIG.BATCH_MAX_TOKENS,
      messages: [{ role: 'user', content: batchMessage }],
      tools: batch.tools,
      system: systemPrompt,
      temperature: API_CONFIG.BATCH_TEMPERATURE,
    });

    if (!data?.content?.length) {
      return {
        batchId: batch.id, toolName, analysis: '', success: false, error: 'No content',
      };
    }

    let analysis = '';
    const toolCalls = [];

    data.content.forEach((item) => {
      if (item.type === 'text' && item.text.trim()) analysis += `${item.text.trim()}\n`;
      else if (item.type === 'tool_use') toolCalls.push(item);
    });

    if (toolCalls.length > 0) {
      const toolResults = await Promise.all(
        toolCalls.map(async (toolCall) => {
          try {
            const result = await toolHandler(toolCall.name, toolCall.input || {}, true);
            return {
              type: 'tool_result',
              tool_use_id: toolCall.id,
              content: JSON.stringify(result, null, 2),
            };
          } catch (error) {
            return {
              type: 'tool_result',
              tool_use_id: toolCall.id,
              content: JSON.stringify({ success: false, error: error.message }),
              is_error: true,
            };
          }
        }),
      );

      const followUpData = await callAI({
        max_tokens: API_CONFIG.FOLLOWUP_MAX_TOKENS,
        messages: [
          { role: 'user', content: batchMessage },
          { role: 'assistant', content: data.content },
          { role: 'user', content: toolResults },
        ],
        tools: batch.tools,
        system: systemPrompt,
        temperature: API_CONFIG.FOLLOWUP_TEMPERATURE,
      });

      if (followUpData) {
        analysis = '';
        followUpData.content.forEach((item) => {
          if (item.type === 'text' && item.text.trim()) analysis += `${item.text.trim()}\n`;
        });
      }
    }

    return {
      batchId: batch.id, toolName, analysis: analysis || `${toolName} analyzed.`, success: true,
    };
  } catch (error) {
    if (error.isAuthError || error.isFatalError) throw error;
    return {
      batchId: batch.id, toolName, analysis: `${toolName} skipped.`, success: false, error: error.message,
    };
  }
}

async function performFollowUpAnalysis(analyses, systemPrompt) {
  if (analyses.length === 0) return null;
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
    const { callAI } = await import('../api/api-factory.js');
    const data = await callAI({
      max_tokens: API_CONFIG.FOLLOWUP_MAX_TOKENS,
      messages: [{ role: 'user', content }],
      system: systemPrompt,
      temperature: API_CONFIG.FOLLOWUP_TEMPERATURE,
    });

    if (!data.content?.length) return null;

    let synthesis = '';
    data.content.forEach((item) => {
      if (item.type === 'text' && item.text.trim()) synthesis += `${item.text.trim()}\n`;
    });

    return synthesis || null;
  } catch (error) {
    if (error.isAuthError) throw error;
    return null;
  }
}

export async function processMetricsBatches(
  facetTools,
  dashboardData,
  systemPrompt,
  apiKey,
  message,
  toolHandler,
  progressCallback = null,
) {
  const batches = createBatches(facetTools);
  let completedBatches = 0;

  const updateProgress = () => {
    if (progressCallback && batches.length > 0) {
      const pct = Math.round((completedBatches / batches.length) * BATCH_CONFIG.PROGRESS_WEIGHT);
      const msg = `Analyzing metrics... ${completedBatches}/${batches.length} complete`;
      progressCallback(2, 'in-progress', msg, pct);
    }
  };

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

    if (completedBatches < batches.length) {
      await new Promise((resolve) => { setTimeout(resolve, 500); });
    }

    return [...acc, result];
  }, Promise.resolve([]));

  const successful = results
    .filter((r) => r.success)
    .map((r) => r.analysis?.trim())
    .filter(Boolean);

  let followUp = null;
  if (successful.length > 0) {
    if (progressCallback) progressCallback(2, 'in-progress', 'Synthesizing comprehensive insights...', 85);
    followUp = await performFollowUpAnalysis(successful, systemPrompt);
    if (progressCallback && followUp) progressCallback(2, 'in-progress', 'Analysis complete', 100);
  }

  const allAnalyses = [...successful];
  if (followUp) allAnalyses.push(followUp);

  return allAnalyses;
}

export default processMetricsBatches;
