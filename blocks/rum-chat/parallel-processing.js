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

  const toolsPerBatch = 3;

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

  console.log(`[Parallel Processing] Created ${batches.length} batches`);

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

DASHBOARD DATA:
${Object.entries(dashboardData.metrics)
    .map(([metric, value]) => `- ${metric}: ${value}`)
    .join('\n')}

SEGMENTS (top 3 per category):
${Object.entries(dashboardData.segments)
    .map(([segment, items]) => `
${segment}: ${items.slice(0, 3).map((item) => `${item.value} (${item.count.toLocaleString()})`).join(', ')}`)
    .join('\n')}

ANALYSIS PRIORITIES for Batch ${batch.id}:
1. ENGAGEMENT ANALYSIS: Identify user interaction patterns
2. PERFORMANCE INSIGHTS: Find performance bottlenecks  
3. TRAFFIC ANALYSIS: Analyze acquisition patterns
4. ERROR INVESTIGATION: Discover technical issues

TOOLS FOR THIS BATCH: ${batch.tools.map((t) => t.name).join(', ')}`
      : `Continue analysis using Batch ${batch.id} tools.
FOCUS: Discover insights using available tools for deeper analysis.
TOOLS FOR THIS BATCH: ${batch.tools.map((t) => t.name).join(', ')}`;

    try {
      console.log(`[Parallel Batch ${batch.id}] Starting API call`);

      const batchRequest = {
        model: 'claude-opus-4-1-20250805',
        max_tokens: 3072, // Good depth while maintaining speed advantage
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
        const errorData = await batchResponse.json();
        throw new Error(`Batch ${batch.id} failed: ${errorData.error || batchResponse.status}`);
      }

      const batchData = await batchResponse.json();
      console.log(`[Parallel Batch ${batch.id}] Response received`);

      // Debug: Check if response has content
      if (!batchData.content || batchData.content.length === 0) {
        console.log(`[DEBUG] Parallel Batch ${batch.id} - No content in response:`, JSON.stringify(batchData, null, 2));
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

        // Execute tool calls - DOM operations will be queued automatically
        if (batchToolCalls.length > 0) {
          console.log(`[Parallel Batch ${batch.id}] Executing ${batchToolCalls.length} tools`);

          // Execute tools in parallel within batch (DOM operations will be queued)
          const toolPromises = batchToolCalls.map(async (toolCall) => {
            try {
              console.log(`[Parallel Batch ${batch.id}] Executing: ${toolCall.name}`);
              const result = await handleDynamicFacetToolCall(
                toolCall.name,
                toolCall.input || {},
                true, // Use queue for DOM operations
              );
              return { toolCall, result };
            } catch (error) {
              console.error(`[Parallel Batch ${batch.id}] Error executing ${toolCall.name}:`, error);
              return { toolCall, result: { success: false, error: error.message } };
            }
          });

          await Promise.all(toolPromises);
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
      console.error(`[Parallel Batch ${batch.id}] Error:`, error);

      // Update progress tracking for errors
      completedBatches += 1;
      console.log(`[Parallel Processing] Batch ${batch.id} completed with error (${completedBatches}/${totalBatches})`);
      updateProgress();

      return {
        batchId: batch.id,
        analysis: '',
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

  console.log(`[Parallel Processing] Completed ${successfulAnalyses.length}/${batchResults.length} batches successfully`);

  // Single follow-up analysis for all batch results
  if (successfulAnalyses.length > 0) {
    console.log('[Parallel Processing] Performing comprehensive follow-up analysis...');

    // Update progress to show follow-up analysis starting
    if (progressCallback) {
      progressCallback(
        2,
        'in-progress',
        'Analyzing results and generating comprehensive insights...',
        85,
      );
    }

    const followUpRequest = {
      model: 'claude-opus-4-1-20250805',
      max_tokens: 3072,
      messages: [{
        role: 'user',
        content: `Based on the comprehensive tool execution results from all batches, provide detailed insights analysis:

BATCH RESULTS:
${successfulAnalyses.join('\n\n')}

Analyze the findings and provide substantial insights covering:
- Performance patterns and bottlenecks discovered
- User behavior insights and engagement patterns
- Traffic acquisition analysis and channel effectiveness  
- Business impact findings and conversion opportunities
- Technical issues, errors, and optimization recommendations
- Cross-batch correlations and key discoveries

Provide comprehensive analysis with specific details and actionable insights.`,
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
            console.log(`[Parallel Processing] Follow-up analysis completed, length: ${comprehensiveAnalysis.length} characters`);

            // Update progress to 100% when follow-up analysis is complete
            if (progressCallback) {
              progressCallback(
                2,
                'in-progress',
                'Comprehensive analysis complete',
                100,
              );
            }

            // Add comprehensive analysis to results
            successfulAnalyses.push(comprehensiveAnalysis);
          }
        }
      }
    } catch (followUpError) {
      console.error('[Parallel Processing] Follow-up analysis error:', followUpError);
    }
  }

  return successfulAnalyses;
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
