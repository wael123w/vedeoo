import { GoogleGenAI } from '@google/genai';
import { AIProvider } from '../baseProvider';
import {
  AIProviderCapabilities,
  ModelDescriptor,
  ProviderConnectionStatus,
  ProviderType,
  TextGenerationRequest,
  TextGenerationResult,
} from '../types';
import { modelRegistry } from '../modelRegistry';

export class GoogleAIProvider extends AIProvider {
  readonly id = 'google';
  readonly name = 'Google AI (Gemini)';
  readonly type: ProviderType = 'google';
  readonly isLocal = false;
  defaultBaseUrl = 'https://generativelanguage.googleapis.com';

  getCapabilities(): AIProviderCapabilities {
    return {
      text: true,
      reasoning: true,
      vision: true,
      imageGeneration: true,
      textToSpeech: true,
      videoGeneration: false,
      embeddings: true,
      streaming: true,
      toolCalling: true,
      jsonMode: true,
    };
  }

  async testConnection(): Promise<ProviderConnectionStatus> {
    const startTime = performance.now();
    try {
      const apiKey = await this.getApiKey();
      if (!apiKey) {
        return {
          connected: false,
          latencyMs: 0,
          message: 'Google Gemini API Key is required.',
          checkedAt: Date.now(),
        };
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: 'Ping',
      });

      const latencyMs = Math.round(performance.now() - startTime);
      if (response.text) {
        return {
          connected: true,
          latencyMs,
          message: 'Connected to Gemini API (gemini-3.8-flash).',
          checkedAt: Date.now(),
          detectedModelsCount: 5,
        };
      }
      throw new Error('Received empty response from Gemini');
    } catch (err: unknown) {
      const latencyMs = Math.round(performance.now() - startTime);
      const msg = err instanceof Error ? err.message : String(err);
      return {
        connected: false,
        latencyMs,
        message: `Connection failed: ${msg}`,
        checkedAt: Date.now(),
      };
    }
  }

  async fetchModels(): Promise<ModelDescriptor[]> {
    const list: ModelDescriptor[] = [
      {
        id: 'gemini-3.8-flash',
        name: 'Gemini 3.8 Flash (Recommended)',
        providerType: this.type,
        providerId: this.id,
        contextWindow: 1048576,
        capabilities: { text: true, reasoning: true, vision: true, streaming: true, toolCalling: true, jsonMode: true },
        pricing: { isAvailable: true, promptTokenPriceUsd: 0.000000075, completionTokenPriceUsd: 0.0000003, currency: 'USD' },
      },
      {
        id: 'gemini-3.1-pro-preview',
        name: 'Gemini 3.1 Pro Preview (Complex Reasoning)',
        providerType: this.type,
        providerId: this.id,
        contextWindow: 2097152,
        capabilities: { text: true, reasoning: true, vision: true, streaming: true, toolCalling: true, jsonMode: true },
        pricing: { isAvailable: true, promptTokenPriceUsd: 0.00000125, completionTokenPriceUsd: 0.000005, currency: 'USD' },
      },
      {
        id: 'gemini-3.1-flash-lite',
        name: 'Gemini 3.1 Flash Lite',
        providerType: this.type,
        providerId: this.id,
        contextWindow: 1048576,
        capabilities: { text: true, reasoning: false, vision: true, streaming: true, jsonMode: true },
        pricing: { isAvailable: true, promptTokenPriceUsd: 0.0000000375, completionTokenPriceUsd: 0.00000015, currency: 'USD' },
      },
      {
        id: 'gemini-3.1-flash-lite-image',
        name: 'Gemini 3.1 Flash Lite Image (Scene Artwork)',
        providerType: this.type,
        providerId: this.id,
        contextWindow: 32768,
        capabilities: { text: false, imageGeneration: true },
        pricing: { isAvailable: true, imagePriceUsd: 0.03, currency: 'USD' },
      },
    ];

    modelRegistry.registerModels(this.id, list);
    return list;
  }

  async generateText(request: TextGenerationRequest): Promise<TextGenerationResult> {
    const startTime = performance.now();
    const apiKey = await this.getApiKey();
    if (!apiKey) {
      throw new Error('Google AI API Key missing. Configure in Settings → AI Providers.');
    }

    const model = request.model || 'gemini-3.8-flash';
    const ai = new GoogleGenAI({ apiKey });

    // Format chat messages
    const contents = request.messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');

    try {
      const config: Record<string, unknown> = {};
      if (request.temperature !== undefined) config.temperature = request.temperature;
      if (request.jsonMode) config.responseMimeType = 'application/json';

      const response = await ai.models.generateContent({
        model,
        contents,
        config: Object.keys(config).length > 0 ? config : undefined,
      });

      const latencyMs = Math.round(performance.now() - startTime);
      const text = response.text || '';

      const promptTokens = Math.round(contents.length / 4);
      const completionTokens = Math.round(text.length / 4);

      return {
        text,
        model,
        providerId: this.id,
        usage: {
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens,
          estimatedCostUsd: promptTokens * 0.000000075 + completionTokens * 0.0000003,
        },
        latencyMs,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const isRetryable = msg.includes('429') || msg.includes('503') || msg.includes('quota') || msg.includes('timeout');
      const errorObj = new Error(msg);
      (errorObj as unknown as { isRetryable: boolean }).isRetryable = isRetryable;
      throw errorObj;
    }
  }
}
