/* eslint-disable no-console */
// Storage for insights and recommendations collected during analysis
let collectedInsights = [];
let collectedRecommendations = [];

// Function to reset insights and recommendations storage
function resetInsightsAndRecommendations() {
  collectedInsights = [];
  collectedRecommendations = [];
  console.log('[Insights/Recommendations] Storage reset');
}

// Function to process batches in parallel
async function processParallelBatches(
  facetTools,
  dashboardData,
  systemPromptText,
  mainApiKey,
  message,
  handleDynamicFacetToolCall,
  progressCallback = null,
) {
  console.log('[Parallel Processing] Starting parallel batch processing');

  // Reset insights and recommendations storage for fresh analysis
  resetInsightsAndRecommendations();

  // Reduce batch size to avoid timeouts (524 errors from Cloudflare)
  const toolsPerBatch = 2; // Reduced from 3 to avoid API timeouts

  // Split tools into batches dynamically
  const batches = [];
  const totalBatches = Math.ceil(facetTools.length / toolsPerBatch);
  for (let i = 0; i < totalBatches; i += 1) {
    const startIndex = i * toolsPerBatch;
    const batchTools = facetTools.slice(startIndex, startIndex + toolsPerBatch);
    if (batchTools.length > 0) {
      batches.push({
        id: i + 1,
        tools: batchTools,
      });
    }
  }

  console.log(`[Parallel Processing] Created ${batches.length} batches from ${facetTools.length} total facets`);
  console.log('[Parallel Processing] Available facets:', facetTools.map((t) => t.name).join(', '));
  
  // Log which batch contains form tools
  const formToolsInBatches = batches.filter((batch) => 
    batch.tools.some((t) => t.name.includes('fill') || t.name.includes('formsubmit'))
  );
  if (formToolsInBatches.length > 0) {
    console.log('[Parallel Processing] 📝 Form tools distributed across batches:');
    formToolsInBatches.forEach((batch) => {
      const formTools = batch.tools.filter((t) => t.name.includes('fill') || t.name.includes('formsubmit'));
      console.log(`  Batch ${batch.id}: ${formTools.map((t) => t.name).join(', ')}`);
    });
  }

  // Log dashboard data being sent to agent
  console.log('[Parallel Processing] Dashboard data summary:', {
    metricsCount: Object.keys(dashboardData.metrics).length,
    segmentsCount: Object.keys(dashboardData.segments).length,
    totalSegmentItems: Object.values(dashboardData.segments).reduce((sum, items) => sum + items.length, 0),
  });

  // Track completed batches for progress updates
  let completedBatches = 0;
  const updateProgress = () => {
    if (progressCallback && totalBatches > 0) {
      // Parallel batches only fill 80% of the progress bar
      const progressPercent = Math.round((completedBatches / totalBatches) * 80);
      progressCallback(
        2,
        'in-progress',
        `Processing batches in parallel... ${completedBatches}/${totalBatches} complete`,
        progressPercent,
      );
    }
  };

  // Create batch processing promises with enhanced error handling and progress tracking
  const batchPromises = batches.map(async (batch) => {
    const batchMessage = batch.id === 1
      ? `${message}

==== DATA TIME PERIOD ====
${dashboardData.dateRange ? `📅 This data covers: ${dashboardData.dateRange.toUpperCase()}` : '⚠️ Date range not specified'}

IMPORTANT: All metrics and insights below are for the ${dashboardData.dateRange || 'specified'} time period.
==== END TIME PERIOD ====

DASHBOARD DATA:
${Object.entries(dashboardData.metrics)
    .map(([metric, value]) => `- ${metric}: ${value}`)
    .join('\n')}

SEGMENTS DATA (showing top items per facet):
${Object.entries(dashboardData.segments)
    .map(([segment, items]) => `
${segment}: ${items.slice(0, 5).map((item) => `${item.value} (${item.count.toLocaleString()}${item.metrics && Object.keys(item.metrics).length > 0 ? `, metrics: ${JSON.stringify(item.metrics)}` : ''})`).join(', ')}${items.length > 5 ? ` ... and ${items.length - 5} more` : ''}`)
    .join('\n')}

IMPORTANT INSTRUCTIONS for Batch ${batch.id}:
You have access to ${batch.tools.length} analysis tools. YOU MUST USE EACH TOOL to analyze the corresponding facet data.

⚠️ DATA INTEGRITY: ONLY report findings based on actual tool results. DO NOT estimate or invent any metrics.

⚠️ FOCUS ON VALUE: If a facet shows unremarkable or expected data, just note it briefly and move on. Focus your detailed analysis on facets that reveal:
- Performance bottlenecks or errors
- Unexpected patterns or anomalies
- High-impact issues affecting many users
- Clear optimization opportunities

For EACH tool in this batch:
1. Call the tool with operation='analyze' to get detailed data
2. Examine the results for patterns, outliers, and insights
3. If the data is valuable (issues, patterns, anomalies), provide detailed analysis
4. If the data is unremarkable, briefly note it and focus on more valuable facets
5. Cite ONLY the exact numbers and values returned by the tools

REQUIRED ACTIONS:
- USE ALL ${batch.tools.length} TOOLS provided in this batch
- For valuable facets, analyze the top items and their metrics with EXACT values
- Identify specific patterns or anomalies using ACTUAL data
- Skip detailed analysis of unremarkable facets to focus on what matters

AVAILABLE TOOLS FOR BATCH ${batch.id}: ${batch.tools.map((t) => t.name).join(', ')}

Start your analysis by systematically calling each tool.`
      : `Continue analysis using Batch ${batch.id} tools.

IMPORTANT: You have ${batch.tools.length} more facets to analyze.

⚠️ DATA INTEGRITY: ONLY report findings based on actual tool results. DO NOT estimate or invent any metrics.

⚠️ FOCUS ON VALUE: If a facet shows unremarkable data, note it briefly and move on. Focus detailed analysis on facets with clear issues, patterns, or opportunities.

REQUIRED ACTIONS:
- USE ALL ${batch.tools.length} TOOLS in this batch
- For each tool, call it with operation='analyze' to examine the data
- For valuable facets, provide detailed insights with ACTUAL data
- For unremarkable facets, briefly acknowledge and continue
- Cite EXACT numbers from tool results, never approximate

AVAILABLE TOOLS FOR BATCH ${batch.id}: ${batch.tools.map((t) => t.name).join(', ')}

Analyze each facet systematically.`;

    try {
      console.log(`[Parallel Batch ${batch.id}] Starting API call with ${batch.tools.length} tools`);
      console.log(`[Parallel Batch ${batch.id}] Tools:`, batch.tools.map((t) => t.name));
      console.log(`[Parallel Batch ${batch.id}] Message length: ${batchMessage.length} characters`);

      const batchRequest = {
        model: 'claude-opus-4-1-20250805',
        max_tokens: 2048, // Reduced from 3072 to avoid timeouts
        messages: [{ role: 'user', content: batchMessage }],
        tools: batch.tools,
        system: systemPromptText,
        temperature: 0.35, // Balanced between creativity and precision
      };

      const batchResponse = await fetch('https://chat-bot-test.asthabhargava001.workers.dev/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': mainApiKey,
        },
        body: JSON.stringify(batchRequest),
      });

      if (!batchResponse.ok) {
        let errorMessage = `HTTP ${batchResponse.status}`;
        try {
          const errorData = await batchResponse.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          // Response might not be JSON (e.g., 524 timeout from Cloudflare)
          const errorText = await batchResponse.text();
          if (errorText.includes('524')) {
            errorMessage = 'Request timeout (524) - batch took too long to process';
          } else {
            errorMessage = errorText || errorMessage;
          }
        }
        throw new Error(`Batch ${batch.id} failed: ${errorMessage}`);
      }

      const batchData = await batchResponse.json();
      console.log(`[Parallel Batch ${batch.id}] Response received`);

      // Debug: Check if response has content
      if (!batchData.content || batchData.content.length === 0) {
        console.warn(`[Parallel Batch ${batch.id}] No content in response`);
      }

      let batchAnalysis = '';
      const batchToolCalls = [];

      if (batchData.content && batchData.content.length > 0) {
        batchData.content.forEach((item) => {
          if (item.type === 'text') {
            const text = item.text.trim();
            if (text) batchAnalysis += `${text}\n`;
          } else if (item.type === 'tool_use') {
            batchToolCalls.push(item);
          }
        });

        console.log(`[Parallel Batch ${batch.id}] Agent used ${batchToolCalls.length}/${batch.tools.length} available tools`);
        if (batchAnalysis.length > 0) {
          console.log(`[Parallel Batch ${batch.id}] Generated ${batchAnalysis.length} characters of analysis text`);
        }

        // Execute tool calls - DOM operations will be queued automatically
        if (batchToolCalls.length > 0) {
          console.log(`[Parallel Batch ${batch.id}] Executing ${batchToolCalls.length} tool calls`);

          // Execute tools in parallel within batch (DOM operations will be queued)
          const toolPromises = batchToolCalls.map(async (toolCall) => {
            try {
              console.log(`[Parallel Batch ${batch.id}] → Calling tool: ${toolCall.name} with operation: ${toolCall.input?.operation || 'unknown'}`);
              const result = await handleDynamicFacetToolCall(
                toolCall.name,
                toolCall.input || {},
                true, // Use queue for DOM operations
              );
              console.log(`[Parallel Batch ${batch.id}] ✓ Tool ${toolCall.name} completed:`, result.success ? `success (${result.totalItems || 0} items)` : `failed - ${result.message}`);
              return { toolCall, result };
            } catch (error) {
              console.error(`[Parallel Batch ${batch.id}] ✗ Tool ${toolCall.name} error:`, error.message);
              return { toolCall, result: { success: false, error: error.message } };
            }
          });

          const toolResults = await Promise.all(toolPromises);
          const successCount = toolResults.filter((r) => r.result.success).length;
          console.log(`[Parallel Batch ${batch.id}] Tool execution summary: ${successCount}/${toolResults.length} successful`);
        } else {
          console.warn(`[Parallel Batch ${batch.id}] Agent did not use any tools! Expected ${batch.tools.length} tool calls.`);
        }

        const result = {
          batchId: batch.id,
          analysis: batchAnalysis,
          success: true,
        };

        // Update progress tracking
        completedBatches += 1;
        console.log(`[Parallel Processing] Batch ${batch.id} completed successfully (${completedBatches}/${totalBatches})`);
        updateProgress();

        return result;
      }

      // Update progress tracking for no content received
      completedBatches += 1;
      console.log(`[Parallel Processing] Batch ${batch.id} completed with no content (${completedBatches}/${totalBatches})`);
      updateProgress();

      return {
        batchId: batch.id,
        analysis: '',
        success: false,
        error: 'No content received',
      };
    } catch (error) {
      console.error(`[Parallel Batch ${batch.id}] ❌ Error:`, error.message);
      
      // Check if it's a timeout error
      if (error.message.includes('524') || error.message.includes('timeout')) {
        console.warn(`[Parallel Batch ${batch.id}] ⚠️ TIMEOUT - This batch took too long. Consider reducing batch size or simplifying prompts.`);
      }

      // Update progress tracking for errors
      completedBatches += 1;
      console.log(`[Parallel Processing] Batch ${batch.id} completed with error (${completedBatches}/${totalBatches})`);
      updateProgress();

      return {
        batchId: batch.id,
        analysis: `Batch ${batch.id} analysis skipped due to timeout. Continuing with other batches...`,
        success: false,
        error: error.message,
      };
    }
  });

  // Wait for all batches to complete
  console.log('[Parallel Processing] Waiting for all batches to complete...');
  const batchResults = await Promise.all(batchPromises);

  // Collect successful analyses - include all successful batches (fixed filtering)
  const successfulAnalyses = batchResults
    .filter((result) => result.success)
    .map((result) => result.analysis?.trim() || `Batch ${result.batchId} tools executed successfully.`)
    .filter(Boolean);

  const failedBatches = batchResults.filter((result) => !result.success);
  
  console.log(`[Parallel Processing] Completed ${successfulAnalyses.length}/${batchResults.length} batches successfully`);
  if (failedBatches.length > 0) {
    console.warn(`[Parallel Processing] ⚠️ ${failedBatches.length} batches failed (likely timeouts). Analysis will continue with successful batches.`);
    failedBatches.forEach((failed) => {
      console.warn(`  - Batch ${failed.batchId}: ${failed.error}`);
    });
  }

  // Track successful batch count before follow-up analysis
  const successfulBatchCount = successfulAnalyses.length;
  const totalBatchContent = successfulAnalyses.reduce((sum, a) => sum + a.length, 0);

  // Single follow-up analysis for all batch results
  let followUpAnalysis = null;
  if (successfulAnalyses.length > 0) {
    console.log(`[Parallel Processing] Performing comprehensive follow-up analysis on ${successfulAnalyses.length} batch results...`);
    console.log(`[Parallel Processing] Total batch content: ${totalBatchContent} characters`);

    // Update progress to show follow-up analysis starting
    if (progressCallback) {
      progressCallback(
        2,
        'in-progress',
        'Analyzing results and generating comprehensive insights...',
        85,
      );
    }

    const followUpContent = `Based on the comprehensive tool execution results from all batches, provide detailed insights analysis:

BATCH RESULTS:
${successfulAnalyses.join('\n\n')}

Analyze the findings and provide substantial insights covering:
- Performance patterns and bottlenecks discovered
- User behavior insights and engagement patterns
- Traffic acquisition analysis and channel effectiveness  
- Business impact findings and conversion opportunities
- Technical issues, errors, and optimization recommendations
- Cross-batch correlations and key discoveries

Provide comprehensive analysis with specific details and actionable insights.`;

    console.log('[Parallel Processing] Follow-up request message length:', followUpContent.length, 'characters');

    const followUpRequest = {
      model: 'claude-opus-4-1-20250805',
      max_tokens: 3072,
      messages: [{
        role: 'user',
        content: followUpContent,
      }],
      system: systemPromptText,
      temperature: 0.3,
    };

    try {
      const followUpResponse = await fetch('https://chat-bot-test.asthabhargava001.workers.dev/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': mainApiKey,
        },
        body: JSON.stringify(followUpRequest),
      });

      if (followUpResponse.ok) {
        const followUpData = await followUpResponse.json();
        if (followUpData.content && followUpData.content.length > 0) {
          let comprehensiveAnalysis = '';
          followUpData.content.forEach((item) => {
            if (item.type === 'text') {
              const text = item.text.trim();
              if (text) comprehensiveAnalysis += `${text}\n`;
            }
          });

          if (comprehensiveAnalysis) {
            console.log(`[Parallel Processing] Follow-up synthesis completed, length: ${comprehensiveAnalysis.length} characters`);

            // Update progress to 100% when follow-up analysis is complete
            if (progressCallback) {
              progressCallback(
                2,
                'in-progress',
                'Comprehensive analysis complete',
                100,
              );
            }

            // Store follow-up analysis separately (don't add to batch count)
            followUpAnalysis = comprehensiveAnalysis;
          }
        }
      }
    } catch (followUpError) {
      console.error('[Parallel Processing] Follow-up analysis error:', followUpError);
    }
  }

  // Calculate total content including follow-up
  const totalContentLength = totalBatchContent + (followUpAnalysis ? followUpAnalysis.length : 0);

  // Final summary of parallel processing
  console.log('═══════════════════════════════════════════════════════════');
  console.log('[Parallel Processing] ANALYSIS SUMMARY');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Total facets: ${facetTools.length}`);
  console.log(`Total batches: ${batches.length}`);
  console.log(`✓ Successful batches: ${successfulBatchCount}`);
  if (failedBatches.length > 0) {
    console.log(`✗ Failed batches: ${failedBatches.length} (timeouts)`);
  }
  console.log(`Batch analysis content: ${totalBatchContent.toLocaleString()} characters`);
  if (followUpAnalysis) {
    console.log(`Follow-up synthesis: ${followUpAnalysis.length.toLocaleString()} characters`);
  }
  console.log(`Total analysis content: ${totalContentLength.toLocaleString()} characters`);
  console.log(`Insights collected: ${collectedInsights.length}`);
  console.log(`Recommendations collected: ${collectedRecommendations.length}`);
  console.log('═══════════════════════════════════════════════════════════');

  // Return all analyses including follow-up synthesis
  const allAnalyses = [...successfulAnalyses];
  if (followUpAnalysis) {
    allAnalyses.push(followUpAnalysis);
  }
  
  return allAnalyses;
}

// Getter functions for mutable variables
function getCollectedInsights() {
  return collectedInsights;
}

function getCollectedRecommendations() {
  return collectedRecommendations;
}

// Export functions and getter functions
export {
  processParallelBatches,
  resetInsightsAndRecommendations,
  getCollectedInsights,
  getCollectedRecommendations,
};

export default processParallelBatches;
