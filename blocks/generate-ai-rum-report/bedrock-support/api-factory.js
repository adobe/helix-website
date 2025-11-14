/**
 * API Factory - Auto-selects between Anthropic Direct and AWS Bedrock
 * Priority: Bedrock > Anthropic Direct
 */

/* eslint-disable no-console */

import { callBedrockAPI, hasBedrockToken, getBedrockToken } from './bedrock-api.js';

const ANTHROPIC_CONFIG = {
  ENDPOINT: 'https://api.anthropic.com/v1/messages',
  MODEL: 'claude-sonnet-4-20250514',
  API_VERSION: '2023-06-01',
};

async function callAnthropicDirect(params, anthropicKey) {
  const {
    messages, system,
    // eslint-disable-next-line camelcase
    max_tokens, temperature, tools,
  } = params;

  const requestBody = {
    model: ANTHROPIC_CONFIG.MODEL,
    messages,
    // eslint-disable-next-line camelcase
    max_tokens,
    temperature,
  };

  if (system) requestBody.system = system;
  if (tools) requestBody.tools = tools;

  const response = await fetch(ANTHROPIC_CONFIG.ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': anthropicKey,
      'anthropic-version': ANTHROPIC_CONFIG.API_VERSION,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `API error: ${response.status}`);
  }

  const data = await response.json();
  console.log('[Anthropic] Token usage:', data.usage?.input_tokens || 0, '/', data.usage?.output_tokens || 0);
  return data;
}

export function getApiProvider() {
  if (hasBedrockToken()) return { type: 'bedrock', hasToken: true };
  if (localStorage.getItem('anthropicApiKey')?.trim()) return { type: 'anthropic', hasToken: true };
  return { type: null, hasToken: false };
}

export async function callAI(params) {
  const provider = getApiProvider();
  if (!provider.hasToken) {
    throw new Error('No API credentials found. Configure AWS Bedrock or Anthropic API key.');
  }

  console.log(`[API Factory] Using: ${provider.type}`);

  return provider.type === 'bedrock'
    ? callBedrockAPI(params, getBedrockToken())
    : callAnthropicDirect(params, localStorage.getItem('anthropicApiKey'));
}

export function getProviderName() {
  const provider = getApiProvider();
  if (provider.type === 'bedrock') return 'AWS Bedrock (Claude Sonnet 4.5)';
  if (provider.type === 'anthropic') return 'Anthropic Direct (Claude Sonnet 4)';
  return 'No provider configured';
}
