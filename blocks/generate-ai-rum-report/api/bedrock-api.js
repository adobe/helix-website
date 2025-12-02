/**
 * AWS Bedrock API Integration
 */

/* eslint-disable no-console */

import { AI_MODELS, BEDROCK_CONFIG } from '../config.js';

const ENDPOINT = `https://bedrock-runtime.${BEDROCK_CONFIG.REGION}.amazonaws.com/model/${AI_MODELS.BEDROCK_MODEL_ID}/converse`;

/**
 * Call AWS Bedrock API
 */
export async function callBedrockAPI(params, bedrockToken) {
  if (!bedrockToken) throw new Error('AWS Bedrock token not provided');

  const {
    messages,
    system,
    // eslint-disable-next-line camelcase
    max_tokens = BEDROCK_CONFIG.MAX_TOKENS,
    temperature = BEDROCK_CONFIG.TEMPERATURE,
    tools,
  } = params;

  // Transform messages from Anthropic format to Bedrock format
  const transformedMessages = messages.map((msg) => {
    let content;
    if (typeof msg.content === 'string') {
      content = [{ text: msg.content }];
    } else if (Array.isArray(msg.content)) {
      // Transform each content item
      content = msg.content.map((item) => {
        if (item.type === 'text') {
          return { text: item.text };
        }
        if (item.type === 'tool_use') {
          return {
            toolUse: {
              toolUseId: item.id,
              name: item.name,
              input: item.input || {},
            },
          };
        }
        if (item.type === 'tool_result') {
          return {
            toolResult: {
              toolUseId: item.tool_use_id,
              content: [{ text: item.content }],
              status: item.is_error ? 'error' : 'success',
            },
          };
        }
        // Fallback
        console.warn('[Bedrock] Unknown content type:', item.type);
        return { text: JSON.stringify(item) };
      });
    } else {
      content = [{ text: String(msg.content) }];
    }

    return { role: msg.role, content };
  });

  const requestBody = {
    messages: transformedMessages,
    inferenceConfig: {
      // eslint-disable-next-line camelcase
      maxTokens: max_tokens,
      temperature,
    },
  };

  if (system) requestBody.system = [{ text: system }];
  if (tools?.length) {
    // Transform Anthropic tool format to Bedrock format
    requestBody.toolConfig = {
      tools: tools.map((tool) => {
        // Anthropic: input_schema is the JSON Schema object
        // Bedrock: inputSchema.json should be the JSON Schema object
        const schema = tool.input_schema || {};
        return {
          toolSpec: {
            name: tool.name,
            description: tool.description,
            inputSchema: { json: schema },
          },
        };
      }),
      toolChoice: { auto: {} },
    };

    // Debug: Log tool config to verify format
    console.log('[Bedrock] Sending tools:', tools.map((t) => t.name));
  }

  // Debug: Log request details
  if (messages.length === 1 && tools?.length) {
    console.log('[Bedrock] First request with tools:', {
      toolCount: tools?.length,
      toolNames: tools?.map((t) => t.name),
    });
  } else if (messages.length > 1) {
    console.log('[Bedrock] Follow-up request:', {
      messageCount: messages.length,
      contentTypes: messages.map((m, i) => ({
        index: i,
        role: m.role,
        types: Array.isArray(m.content)
          ? m.content.map((c) => c.type || 'string')
          : [typeof m.content],
      })),
    });
  }

  // Retry logic for rate limits
  const maxRetries = 3;
  let lastError;

  // eslint-disable-next-line no-plusplus
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    // eslint-disable-next-line no-await-in-loop
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bedrockToken}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      // eslint-disable-next-line no-await-in-loop
      const data = await response.json();
      console.log('[Bedrock] Token usage:', data.usage?.inputTokens || 0, '/', data.usage?.outputTokens || 0);

      // Debug: Log raw content to see what Bedrock returns
      console.log('[Bedrock] Response content types:', data.output.message.content.map((item) => Object.keys(item)));

      // Transform Bedrock format to Anthropic format
      const transformedContent = data.output.message.content.map((item) => {
        if (item.text !== undefined) {
          return { type: 'text', text: item.text };
        }
        if (item.toolUse) {
          return {
            type: 'tool_use',
            id: item.toolUse.toolUseId,
            name: item.toolUse.name,
            input: item.toolUse.input,
          };
        }
        console.warn('[Bedrock] Unknown content item type:', Object.keys(item));
        return { type: 'text', text: JSON.stringify(item) };
      });

      return {
        id: `bedrock-${Date.now()}`,
        type: 'message',
        role: 'assistant',
        content: transformedContent,
        model: BEDROCK_CONFIG.MODEL_ID,
        stop_reason: data.stopReason === 'end_turn' ? 'end_turn' : data.stopReason,
        usage: {
          input_tokens: data.usage?.inputTokens || 0,
          output_tokens: data.usage?.outputTokens || 0,
        },
      };
    }

    // Handle rate limits (429)
    // eslint-disable-next-line no-await-in-loop
    const errorText = await response.text();
    lastError = `Bedrock API error: ${response.status} ${errorText}`;

    if (response.status === 429 && attempt < maxRetries - 1) {
      const waitTime = (2 ** attempt) * 1000; // Exponential backoff: 1s, 2s, 4s
      console.warn(`[Bedrock] Rate limit hit, retrying in ${waitTime}ms (attempt ${attempt + 1}/${maxRetries})`);
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => { setTimeout(resolve, waitTime); });
    } else {
      break; // Non-429 error or max retries reached
    }
  }

  throw new Error(lastError);
}

export const hasBedrockToken = () => !!localStorage.getItem('awsBedrockToken')?.trim();
export const getBedrockToken = () => localStorage.getItem('awsBedrockToken');
