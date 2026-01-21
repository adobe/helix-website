/**
 * AWS Bedrock API Integration
 */

import { AI_MODELS, BEDROCK_CONFIG } from '../config.js';

const ENDPOINT = `https://bedrock-runtime.${BEDROCK_CONFIG.REGION}.amazonaws.com/model/${AI_MODELS.BEDROCK_MODEL_ID}/converse`;
const MAX_RETRIES = 3;

const transformContentItem = (item) => {
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
};

const transformMessage = (msg) => {
  const { content } = msg;
  let transformedContent;
  if (typeof content === 'string') {
    transformedContent = [{ text: content }];
  } else if (Array.isArray(content)) {
    transformedContent = content.map(transformContentItem);
  } else {
    transformedContent = [{ text: String(content) }];
  }
  return { role: msg.role, content: transformedContent };
};

const transformResponseContent = (item) => {
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
};

const buildRequestBody = (params) => {
  const {
    messages,
    system,
    max_tokens: maxTokens = BEDROCK_CONFIG.MAX_TOKENS,
    temperature = BEDROCK_CONFIG.TEMPERATURE,
    tools,
  } = params;
  return {
    messages: messages.map(transformMessage),
    inferenceConfig: { maxTokens, temperature },
    ...(system && { system: [{ text: system }] }),
    ...(tools?.length && {
      toolConfig: {
        tools: tools.map((t) => ({
          toolSpec: {
            name: t.name,
            description: t.description,
            inputSchema: { json: t.input_schema || {} },
          },
        })),
        toolChoice: { auto: {} },
      },
    }),
  };
};

async function makeRequest(requestBody, bedrockToken) {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bedrockToken}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (response.ok) {
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

  if (response.status === 401 || response.status === 403) {
    const authError = new Error(
      'Invalid or expired AWS Bedrock token. Please enter valid token to generate the report.',
    );
    authError.isAuthError = true;
    throw authError;
  }

  const errorText = await response.text();
  const error = new Error(`Bedrock API error: ${response.status} ${errorText}`);
  if (response.status === 503) error.isFatalError = true;
  if (response.status === 429) error.isRetryable = true;
  throw error;
}

async function retryWithBackoff(fn, attempt = 0) {
  try {
    return await fn();
  } catch (error) {
    const shouldNotRetry = error.isAuthError
      || error.isFatalError
      || attempt >= MAX_RETRIES - 1
      || !error.isRetryable;
    if (shouldNotRetry) throw error;

    await new Promise((resolve) => { setTimeout(resolve, (2 ** attempt) * 1000); });
    return retryWithBackoff(fn, attempt + 1);
  }
}

export async function callBedrockAPI(params, bedrockToken) {
  if (!bedrockToken) throw new Error('AWS Bedrock token not provided');
  return retryWithBackoff(() => makeRequest(buildRequestBody(params), bedrockToken));
}

export const hasBedrockToken = () => !!localStorage.getItem('awsBedrockToken')?.trim();
export const getBedrockToken = () => localStorage.getItem('awsBedrockToken');
