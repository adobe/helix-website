/* eslint-disable no-console */

// Import insights collection functionality
import {
  resetInsightsAndRecommendations,
  getCollectedInsights,
  getCollectedRecommendations,
} from './parallel-processing.js';

/**
 * Process tools individually with quality rating and filtering
 * Optimizations: Combined analysis+evaluation, prioritization, early termination, content filtering
 * @param {Array} facetTools - Array of available facet tools
 * @param {Object} dashboardData - Extracted dashboard data
 * @param {string} systemPrompt - System prompt for AI
 * @param {string} apiKey - Anthropic API key
 * @param {string} initialMessage - Initial analysis message
 * @param {Function} toolCallHandler - Function to handle tool calls
 * @param {Function} progressCallback - Progress update callback
 * @returns {Object} Object with qualityInsights, toolResults, and processedToolsCount
 */
async function processSequentialTools(
  facetTools,
  dashboardData,
  systemPrompt,
  apiKey,
  initialMessage,
  toolCallHandler,
  progressCallback = null,
) {
  console.log('[Sequential Processing] Starting individual tool analysis');

  // Reset insights and recommendations for fresh analysis
  resetInsightsAndRecommendations();

  const highQualityInsights = [];
  const processedTools = new Set();
  const toolAnalysisResults = [];

  // Optimization: Tool prioritization and filtering
  const highValueTools = ['checkpoint', 'url', 'enter.source', 'userAgent', 'click.source'];
  const prioritizedTools = [
    ...facetTools.filter((tool) => highValueTools.some((hv) => tool.name.includes(hv))),
    ...facetTools.filter((tool) => !highValueTools.some((hv) => tool.name.includes(hv))),
  ];

  console.log(`[Sequential Processing] Prioritized ${prioritizedTools.length} tools, high-value tools first`);

  // Enhanced initial message with quality focus
  const qualityFocusedMessage = `${initialMessage}

QUALITY ANALYSIS INSTRUCTIONS:
- Focus on discovering SIGNIFICANT patterns and anomalies
- Look for BUSINESS-IMPACTING insights only
- Rate each finding by importance (HIGH/MEDIUM/LOW)
- Skip routine or expected findings
- Prioritize actionable insights over descriptive statistics

ANALYSIS WORKFLOW:
1. Use tools systematically to explore each data facet
2. After each tool, self-evaluate the significance of findings
3. Only highlight HIGH and MEDIUM impact discoveries
4. Focus on user behavior patterns, performance bottlenecks, and conversion opportunities`;

  // Process each tool individually with early termination
  for (let toolIndex = 0; toolIndex < prioritizedTools.length; toolIndex += 1) {
    const tool = prioritizedTools[toolIndex];
    const toolProgress = Math.round(((toolIndex + 1) / prioritizedTools.length) * 100);

    // Optimization: Early termination if we have enough high-quality insights
    if (highQualityInsights.length >= 8 && toolIndex > prioritizedTools.length * 0.6) {
      console.log(`[Sequential Processing] Early termination: ${highQualityInsights.length} quality insights found`);
      break;
    }

    if (progressCallback) {
      progressCallback(
        2, // Always use step 3 (index 2)
        'in-progress',
        `Analyzing ${toolIndex + 1}/${prioritizedTools.length} metrics (${tool.name.replace(/_/g, '.')})...`,
        toolProgress,
      );
    }

    console.log(`[Sequential Processing] Processing tool ${toolIndex + 1}/${facetTools.length}: ${tool.name}`);

    try {
      // Create focused message for this specific tool
      const toolSpecificMessage = toolIndex === 0
        ? qualityFocusedMessage
        : `Continue systematic analysis using the next available tool.

PREVIOUS HIGH-QUALITY FINDINGS:
${highQualityInsights.slice(-3).join('\n\n')} // Only show last 3 for context

CURRENT TOOL FOCUS: ${tool.description}
- Analyze this facet for significant patterns
- Look for performance bottlenecks or user behavior insights
- Rate findings by business impact (HIGH/MEDIUM/LOW)
- Only report HIGH and MEDIUM impact discoveries

RESPONSE FORMAT REQUIRED:
After your analysis, end with:

IMPACT: [HIGH/MEDIUM/LOW]
SUMMARY: [If HIGH/MEDIUM: 2-3 sentence summary of key findings. If LOW: "routine findings"]`;

      // API request for individual tool analysis
      const toolRequest = {
        model: 'claude-opus-4-20250514',
        max_tokens: 2048, // Focused analysis per tool
        messages: [{ role: 'user', content: toolSpecificMessage }],
        tools: [tool], // Single tool focus
        system: systemPrompt,
        temperature: 0.25, // Lower temperature for focused analysis
      };

      console.log(`[Sequential Processing] Sending request for ${tool.name}`);

      // eslint-disable-next-line no-await-in-loop
      const toolResponse = await fetch('https://chat-bot-test.asthabhargava001.workers.dev/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify(toolRequest),
      });

      if (!toolResponse.ok) {
        console.error(`[Sequential Processing] Tool ${tool.name} failed:`, toolResponse.status);
        // eslint-disable-next-line no-continue
        continue; // Skip failed tools
      }

      // eslint-disable-next-line no-await-in-loop
      const toolData = await toolResponse.json();

      if (toolData.content && toolData.content.length > 0) {
        let toolAnalysis = '';
        const toolCalls = [];

        // Process response content
        toolData.content.forEach((item) => {
          if (item.type === 'text') {
            const text = item.text.trim();
            if (text) toolAnalysis += `${text}\n`;
          } else if (item.type === 'tool_use') {
            toolCalls.push(item);
          }
        });

        // Only skip tools with truly minimal content (empty or very short responses)
        if (toolAnalysis.length < 20 && toolCalls.length === 0) {
          console.log(`[Sequential Processing] Skipping ${tool.name} - insufficient content (${toolAnalysis.length} chars)`);
          continue; // eslint-disable-line no-continue
        }

        // Execute tool calls if any
        if (toolCalls.length > 0) {
          console.log(`[Sequential Processing] Executing ${toolCalls.length} tool calls for ${tool.name}`);

          for (let i = 0; i < toolCalls.length; i += 1) {
            const toolCall = toolCalls[i];
            try {
              // eslint-disable-next-line no-await-in-loop
              const result = await toolCallHandler(toolCall.name, toolCall.input || {}, true);
              processedTools.add(toolCall.name);
              console.log(`[Sequential Processing] Tool call ${toolCall.name} completed:`, result.success);
            } catch (error) {
              console.error(`[Sequential Processing] Error executing ${toolCall.name}:`, error);
            }
          }

          // Wait for DOM to settle after tool execution
          // eslint-disable-next-line no-await-in-loop
          await new Promise((resolve) => {
            setTimeout(() => resolve(), 800);
          });
        }

        // Parse combined analysis and evaluation from single response
        if (toolAnalysis.trim()) {
          console.log(`[Sequential Processing] Processing ${tool.name} analysis (${toolAnalysis.length} chars):`, `${toolAnalysis.substring(0, 150)}...`);

          // Look for the embedded evaluation in the response
          const impactMatch = toolAnalysis.match(/IMPACT:\s*(HIGH|MEDIUM|LOW)/i);
          const summaryMatch = toolAnalysis.match(/SUMMARY:\s*(.+)/s);

          if (impactMatch && summaryMatch) {
            const impact = impactMatch[1].toUpperCase();
            const summary = summaryMatch[1].trim();

            console.log(`[Sequential Processing] ${tool.name} self-rated as ${impact}`);

            // Only keep HIGH and MEDIUM impact findings
            if (impact === 'HIGH' || impact === 'MEDIUM') {
              const qualityInsight = `[${impact} IMPACT] ${tool.name.replace(/_/g, '.')}: ${summary}`;
              highQualityInsights.push(qualityInsight);

              // Clean the full analysis by removing the evaluation section
              const cleanAnalysis = toolAnalysis.replace(/\n\s*IMPACT:.*$/s, '').trim();

              toolAnalysisResults.push({
                tool: tool.name,
                impact,
                summary,
                fullAnalysis: cleanAnalysis,
              });

              console.log(`[Sequential Processing] Added quality insight from ${tool.name}`);
            } else {
              console.log(`[Sequential Processing] Filtered out LOW impact findings from ${tool.name}`);
            }
          } else {
            // Fallback: if no evaluation format found, treat as medium impact
            console.log(`[Sequential Processing] No evaluation format found for ${tool.name}, treating as MEDIUM impact`);
            console.log('[Sequential Processing] Raw response for fallback:', toolAnalysis);
            const fallbackSummary = toolAnalysis.length > 200 ? `${toolAnalysis.substring(0, 200)}...` : toolAnalysis;
            const qualityInsight = `[MEDIUM IMPACT] ${tool.name.replace(/_/g, '.')}: ${fallbackSummary}`;
            highQualityInsights.push(qualityInsight);

            toolAnalysisResults.push({
              tool: tool.name,
              impact: 'MEDIUM',
              summary: fallbackSummary,
              fullAnalysis: toolAnalysis,
            });

            console.log(`[Sequential Processing] Added fallback insight from ${tool.name}`);
          }
        } else {
          console.log(`[Sequential Processing] Empty analysis for ${tool.name}`);
        }

        // Don't create separate completion boxes - progress will be shown in main step
      } else {
        console.log(`[Sequential Processing] No content from tool ${tool.name}`);
      }
    } catch (error) {
      console.error(`[Sequential Processing] Error processing tool ${tool.name}:`, error);
      // eslint-disable-next-line no-continue
      continue; // Continue with next tool
    }

    // Small delay between tools to prevent rate limiting
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => {
      setTimeout(() => resolve(), 300);
    });
  }

  // Mark comprehensive processing as completed
  if (progressCallback) {
    progressCallback(2, 'completed', `Comprehensive analysis completed (${processedTools.size} tools analyzed)`);
  }

  // Final quality summary
  console.log(`[Sequential Processing] Completed individual analysis of ${processedTools.size}/${prioritizedTools.length} tools`);
  console.log(`[Sequential Processing] High-quality insights collected: ${highQualityInsights.length}`);
  console.log(`[Sequential Processing] Tool analysis results: ${toolAnalysisResults.length}`);

  return {
    qualityInsights: highQualityInsights,
    toolResults: toolAnalysisResults,
    processedToolsCount: processedTools.size,
  };
}

// Export the main processing function
export default processSequentialTools;

// Export utility functions
export {
  resetInsightsAndRecommendations,
  getCollectedInsights,
  getCollectedRecommendations,
};
