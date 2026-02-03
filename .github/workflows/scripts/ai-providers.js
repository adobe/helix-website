#!/usr/bin/env node

/**
 * AI Provider Abstraction
 * 
 * Supports multiple AI providers:
 * - Anthropic Claude (Sonnet, Opus)
 * - OpenAI ChatGPT (GPT-4, GPT-4 Turbo)
 * - Azure OpenAI
 * - Google Gemini
 */

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Get the configured AI provider
 */
export function getProvider() {
  const provider = process.env.AI_PROVIDER || 'anthropic';
  
  switch (provider.toLowerCase()) {
    case 'anthropic':
    case 'claude':
      return new AnthropicProvider();
      
    case 'openai':
    case 'chatgpt':
      return new OpenAIProvider();
      
    case 'azure':
    case 'azure-openai':
      return new AzureOpenAIProvider();
      
    case 'gemini':
    case 'google':
      return new GeminiProvider();
      
    default:
      console.error(`❌ Unknown AI provider: ${provider}`);
      console.error('   Supported: anthropic, openai, azure, gemini');
      process.exit(1);
  }
}

/**
 * Base AI Provider class
 */
class AIProvider {
  async performReview(prompt, options = {}) {
    throw new Error('performReview must be implemented by subclass');
  }
  
  getName() {
    throw new Error('getName must be implemented by subclass');
  }
  
  getRequiredEnvVars() {
    throw new Error('getRequiredEnvVars must be implemented by subclass');
  }
}

/**
 * Anthropic Claude Provider
 */
class AnthropicProvider extends AIProvider {
  constructor() {
    super();
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      console.error('❌ ANTHROPIC_API_KEY not set');
      console.error('   Get your API key at: https://console.anthropic.com/');
      process.exit(1);
    }
    
    this.client = new Anthropic({ apiKey });
    this.model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';
  }
  
  getName() {
    return `Anthropic Claude (${this.model})`;
  }
  
  getRequiredEnvVars() {
    return ['ANTHROPIC_API_KEY'];
  }
  
  async performReview(prompt, options = {}) {
    const {
      maxTokens = 16000,
      temperature = 0.3,
    } = options;
    
    console.log(`🤖 Calling ${this.getName()}...`);
    
    try {
      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: maxTokens,
        temperature,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });
      
      return {
        text: message.content[0].text,
        usage: {
          inputTokens: message.usage.input_tokens,
          outputTokens: message.usage.output_tokens,
        },
      };
    } catch (error) {
      console.error('❌ Anthropic API error:', error.message);
      throw error;
    }
  }
}

/**
 * OpenAI ChatGPT Provider
 */
class OpenAIProvider extends AIProvider {
  constructor() {
    super();
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error('❌ OPENAI_API_KEY not set');
      console.error('   Get your API key at: https://platform.openai.com/api-keys');
      process.exit(1);
    }
    
    this.client = new OpenAI({ apiKey });
    this.model = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';
  }
  
  getName() {
    return `OpenAI ChatGPT (${this.model})`;
  }
  
  getRequiredEnvVars() {
    return ['OPENAI_API_KEY'];
  }
  
  async performReview(prompt, options = {}) {
    const {
      maxTokens = 16000,
      temperature = 0.3,
    } = options;
    
    console.log(`🤖 Calling ${this.getName()}...`);
    
    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        max_tokens: maxTokens,
        temperature,
        response_format: { type: "json_object" },
        messages: [
          {
            role: 'system',
            content: 'You are an expert code reviewer for AEM Edge Delivery Services projects. Always respond with valid JSON matching the requested format.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      });
      
      return {
        text: completion.choices[0].message.content,
        usage: {
          inputTokens: completion.usage.prompt_tokens,
          outputTokens: completion.usage.completion_tokens,
        },
      };
    } catch (error) {
      console.error('❌ OpenAI API error:', error.message);
      throw error;
    }
  }
}

/**
 * Azure OpenAI Provider
 */
class AzureOpenAIProvider extends AIProvider {
  constructor() {
    super();
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
    
    if (!apiKey || !endpoint || !deployment) {
      console.error('❌ Azure OpenAI configuration incomplete');
      console.error('   Required: AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_DEPLOYMENT');
      process.exit(1);
    }
    
    this.client = new OpenAI({
      apiKey,
      baseURL: `${endpoint}/openai/deployments/${deployment}`,
      defaultQuery: { 'api-version': '2024-02-01' },
      defaultHeaders: { 'api-key': apiKey },
    });
    
    this.deployment = deployment;
  }
  
  getName() {
    return `Azure OpenAI (${this.deployment})`;
  }
  
  getRequiredEnvVars() {
    return ['AZURE_OPENAI_API_KEY', 'AZURE_OPENAI_ENDPOINT', 'AZURE_OPENAI_DEPLOYMENT'];
  }
  
  async performReview(prompt, options = {}) {
    const {
      maxTokens = 16000,
      temperature = 0.3,
    } = options;
    
    console.log(`🤖 Calling ${this.getName()}...`);
    
    try {
      const completion = await this.client.chat.completions.create({
        max_tokens: maxTokens,
        temperature,
        response_format: { type: "json_object" },
        messages: [
          {
            role: 'system',
            content: 'You are an expert code reviewer for AEM Edge Delivery Services projects. Always respond with valid JSON matching the requested format.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      });
      
      return {
        text: completion.choices[0].message.content,
        usage: {
          inputTokens: completion.usage.prompt_tokens,
          outputTokens: completion.usage.completion_tokens,
        },
      };
    } catch (error) {
      console.error('❌ Azure OpenAI API error:', error.message);
      throw error;
    }
  }
}

/**
 * Google Gemini Provider
 */
class GeminiProvider extends AIProvider {
  constructor() {
    super();
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY not set');
      console.error('   Get your API key at: https://aistudio.google.com/apikey');
      process.exit(1);
    }
    
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = process.env.GEMINI_MODEL || 'gemini-1.5-pro';
  }
  
  getName() {
    return `Google Gemini (${this.model})`;
  }
  
  getRequiredEnvVars() {
    return ['GEMINI_API_KEY'];
  }
  
  async performReview(prompt, options = {}) {
    const {
      temperature = 0.3,
    } = options;
    
    console.log(`🤖 Calling ${this.getName()}...`);
    
    try {
      const model = this.client.getGenerativeModel({
        model: this.model,
        generationConfig: {
          temperature,
          responseMimeType: 'application/json',
        },
      });
      
      // Add explicit JSON instruction to prompt
      const jsonPrompt = `${prompt}

CRITICAL: Your response MUST be valid JSON. Do not include any markdown formatting, code blocks, or explanatory text. Output ONLY the JSON object.`;
      
      const result = await model.generateContent(jsonPrompt);
      const response = result.response;
      const text = response.text();
      
      // Gemini doesn't provide token counts in all cases, estimate if needed
      const usage = {
        inputTokens: response.usageMetadata?.promptTokenCount || 0,
        outputTokens: response.usageMetadata?.candidatesTokenCount || 0,
      };
      
      return {
        text,
        usage,
      };
    } catch (error) {
      console.error('❌ Google Gemini API error:', error.message);
      throw error;
    }
  }
}

/**
 * Extract JSON from response text
 */
export function extractJSON(responseText) {
  // Try direct parse first
  try {
    return JSON.parse(responseText);
  } catch {
    // Try extracting from markdown code block
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    
    // Try extracting from any code block
    const codeMatch = responseText.match(/```\n([\s\S]*?)\n```/);
    if (codeMatch) {
      return JSON.parse(codeMatch[1]);
    }
    
    throw new Error('Could not extract JSON from response');
  }
}
