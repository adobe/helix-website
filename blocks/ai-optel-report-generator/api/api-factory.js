/**
 * API Factory - AWS Bedrock Integration
 */

import { callBedrockAPI, hasBedrockToken, getBedrockToken } from './bedrock-api.js';

export function getApiProvider() {
  if (hasBedrockToken()) return { type: 'bedrock', hasToken: true };
  return { type: null, hasToken: false };
}

export async function callAI(params) {
  if (!hasBedrockToken()) {
    throw new Error('AWS Bedrock token not found. Please configure your token in the settings.');
  }
  return callBedrockAPI(params, getBedrockToken());
}

export function getProviderName() {
  return hasBedrockToken() ? 'AWS Bedrock (Claude Opus 4.5)' : 'No provider configured';
}
