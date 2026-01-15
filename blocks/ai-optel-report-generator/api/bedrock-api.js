/**
 * AWS Bedrock API Integration
 */

import { AI_MODELS, BEDROCK_CONFIG } from '../config.js';

const ENDPOINT = `https://bedrock-runtime.${BEDROCK_CONFIG.REGION}.amazonaws.com/model/${AI_MODELS.BEDROCK_MODEL_ID}/converse`;
const MAX_RETRIES = 3;

/** Transform content item from Anthropic to Bedrock format */
function transformContentItem(item) {
  if (item.type === 'text') return { text: item.text };
  if (item.type === 'tool_use') {
    return { toolUse: { toolUseId: item.id, name: item.name, input: item.input || {} } };
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
  return { text: JSON.stringify(item) };
}

/** Transform message from Anthropic to Bedrock format */
function transformMessage(msg) {
  let content;
  if (typeof msg.content === 'string') {
    content = [{ text: msg.content }];
  } else if (Array.isArray(msg.content)) {
    content = msg.content.map(transformContentItem);
  } else {
    content = [{ text: String(msg.content) }];
  }
  return { role: msg.role, content };
}

/** Transform Bedrock response content to Anthropic format */
function transformResponseContent(item) {
  if (item.text !== undefined) return { type: 'text', text: item.text };
  if (item.toolUse) {
    return {
      type: 'tool_use',
      id: item.toolUse.toolUseId,
      name: item.toolUse.name,
      input: item.toolUse.input,
    };
  }
  return { type: 'text', text: JSON.stringify(item) };
}

/** Build request body for Bedrock API */
function buildRequestBody(params) {
  const {
    messages, system, max_tokens: maxTokens = BEDROCK_CONFIG.MAX_TOKENS,
    temperature = BEDROCK_CONFIG.TEMPERATURE, tools,
  } = params;

  const body = {
    messages: messages.map(transformMessage),
    inferenceConfig: { maxTokens, temperature },
  };

  if (system) body.system = [{ text: system }];

  if (tools?.length) {
    body.toolConfig = {
      tools: tools.map((t) => ({
        toolSpec: {
          name: t.name,
          description: t.description,
          inputSchema: { json: t.input_schema || {} },
        },
      })),
      toolChoice: { auto: {} },
    };
  }

  return body;
}

/** Call AWS Bedrock API with retry logic */
export async function callBedrockAPI(params, bedrockToken) {
  if (!bedrockToken) throw new Error('AWS Bedrock token not provided');

  const requestBody = buildRequestBody(params);
  let lastError;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
    // eslint-disable-next-line no-await-in-loop
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${bedrockToken}` },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      // eslint-disable-next-line no-await-in-loop
      const data = await response.json();
      return {
        id: `bedrock-${Date.now()}`,
        type: 'message',
        role: 'assistant',
        content: data.output.message.content.map(transformResponseContent),
        model: BEDROCK_CONFIG.MODEL_ID,
        stop_reason: data.stopReason === 'end_turn' ? 'end_turn' : data.stopReason,
        usage: {
          input_tokens: data.usage?.inputTokens || 0,
          output_tokens: data.usage?.outputTokens || 0,
        },
      };
    }

    // Handle auth errors immediately
    if (response.status === 401 || response.status === 403) {
      const authError = new Error('Invalid or expired AWS Bedrock token. Please enter valid token to generate the report.');
      authError.isAuthError = true;
      throw authError;
    }

    // eslint-disable-next-line no-await-in-loop
    const errorText = await response.text();
    lastError = `Bedrock API error: ${response.status} ${errorText}`;

    // Handle service unavailable (503) - should not retry, throw immediately
    if (response.status === 503) {
      const serviceError = new Error(lastError);
      serviceError.isFatalError = true;
      throw serviceError;
    }

    // Retry on rate limit
    if (response.status === 429 && attempt < MAX_RETRIES - 1) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => { setTimeout(r, (2 ** attempt) * 1000); });
    } else {
      break;
    }
  }

  throw new Error(lastError);
}

export const hasBedrockToken = () => !!localStorage.getItem('awsBedrockToken')?.trim();
export const getBedrockToken = () => localStorage.getItem('awsBedrockToken');
