/**
 * Central Configuration - Update when switching environments or models
 */

export const AI_MODELS = {
  BEDROCK_MODEL_ID: 'global.anthropic.claude-opus-4-5-20251101-v1:0',
};

export const BEDROCK_CONFIG = {
  REGION: 'us-east-1',
  MAX_TOKENS: 4096,
  TEMPERATURE: 0.7,
};

export const DA_CONFIG = {
  ORG: 'adobe',
  REPO: 'helix-optel',
  BASE_URL: 'https://admin.da.live/source',
  UPLOAD_PATH: 'optel-reports',
  WORKER_URL: 'https://optel-da-upload.adobeaem.workers.dev/',
};

export const API_CONFIG = {
  BATCH_MAX_TOKENS: 2048,
  FOLLOWUP_MAX_TOKENS: 3072,
  BATCH_TEMPERATURE: 0.35,
  FOLLOWUP_TEMPERATURE: 0.3,
};

export const PATHS = {
  BLOCK_BASE: '/blocks/ai-optel-report-generator',
  SYSTEM_PROMPT: 'system-prompt.txt',
  OVERVIEW_TEMPLATE: 'overview-analysis-template.html',
  REPORT_TEMPLATE: 'report-template.html',
};

export const STORAGE_KEYS = {
  BEDROCK_TOKEN: 'awsBedrockToken',
  VIEWED_REPORTS: 'viewedReports',
  SOURCE_REPORT: 'optel-detective-source-report',
};
