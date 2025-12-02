/**
 * Central Configuration File
 *
 * All environment-specific and organizational configurations are centralized here.
 * Update this file when switching environments, organizations, or model versions.
 */

// ============================================================================
// AI MODEL CONFIGURATION
// ============================================================================

export const AI_MODELS = {
  // AWS Bedrock Model ID
  BEDROCK_MODEL_ID: 'global.anthropic.claude-opus-4-5-20251101-v1:0',
};

// ============================================================================
// AWS BEDROCK CONFIGURATION
// ============================================================================

export const BEDROCK_CONFIG = {
  REGION: 'us-east-1',
  MAX_TOKENS: 4096,
  TEMPERATURE: 0.7,
};

// ============================================================================
// DARK ALLEY (DA) STORAGE CONFIGURATION
// ============================================================================

export const DA_CONFIG = {
  // Organization name in DA
  ORG: 'asthabh23',

  // Repository name in DA
  REPO: 'da-demo',

  // Base URL for DA API
  BASE_URL: 'https://admin.da.live/source',

  // Upload path for reports (relative to repo root)
  UPLOAD_PATH: 'drafts/optel-reports',
};

// ============================================================================
// API CONFIGURATION
// ============================================================================

export const API_CONFIG = {
  // Maximum tokens for parallel batch processing
  BATCH_MAX_TOKENS: 2048,

  // Maximum tokens for follow-up questions
  FOLLOWUP_MAX_TOKENS: 3072,

  // Temperature for initial batch processing
  BATCH_TEMPERATURE: 0.35,

  // Temperature for follow-up questions
  FOLLOWUP_TEMPERATURE: 0.3,
};

// ============================================================================
// BLOCK PATHS
// ============================================================================

export const PATHS = {
  BLOCK_BASE: '/blocks/generate-ai-rum-report',
  SYSTEM_PROMPT: 'system-prompt.txt',
  OVERVIEW_TEMPLATE: 'overview-analysis-template.html',
  REPORT_TEMPLATE: 'report-template.html',
};

// ============================================================================
// STORAGE KEYS
// ============================================================================

export const STORAGE_KEYS = {
  // localStorage key for AWS Bedrock token
  BEDROCK_TOKEN: 'awsBedrockToken',

  // localStorage key for viewed reports
  VIEWED_REPORTS: 'viewedReports',

  // sessionStorage key for source report (Back to Report feature)
  SOURCE_REPORT: 'optel-detective-source-report',
};
