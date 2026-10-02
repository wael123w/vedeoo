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

export class OpenAIProvider extends AIProvider {
  readonly id = 'openai';
  readonly name = 'OpenAI';
  readonly type: ProviderType = 'openai';
  readonly isLocal = false;
  defaultBaseUrl = 'https://api.openai.com/v1';

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
          message: 'OpenAI API key missing.',
          checkedAt: Date.now(),
        };
      }

      const res = await fetch(`${this.defaultBaseUrl}/models`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${apiKey}` },
      });

      const latencyMs = Math.round(performance.now() - startTime);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`OpenAI HTTP ${res.status}: ${text}`);
      }

      const data = await res.json();
      return {
        connected: true,
        latencyMs,
        message: `Connected to OpenAI. Found ${data.data?.length || 0} models.`,
        checkedAt: Date.now(),
        detectedModelsCount: data.data?.length,
      };
    } catch (err: unknown) {
      const latencyMs = Math.round(performance.now() - startTime);
      return {
        connected: false,
        latencyMs,
        message: err instanceof Error ? err.message : 'Connection failed',
        checkedAt: Date.now(),
      };
    }
  }

  async fetchModels(): Promise<ModelDescriptor[]> {
    const defaultModels: ModelDescriptor[] = [
      {
        id: 'gpt-4o',
        name: 'GPT-4o (Omni)',
        providerType: this.type,
        providerId: this.id,
        contextWindow: 128000,
        capabilities: { text: true, reasoning: true, vision: true, streaming: true, toolCalling: true, jsonMode: true },
        pricing: { isAvailable: true, promptTokenPriceUsd: 0.0000025, completionTokenPriceUsd: 0.00001, currency: 'USD' },
      },
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        providerType: this.type,
        providerId: this.id,
        contextWindow: 128000,
        capabilities: { text: true, reasoning: false, vision: true, streaming: true, toolCalling: true, jsonMode: true },
        pricing: { isAvailable: true, promptTokenPriceUsd: 0.00000015, completionTokenPriceUsd: 0.0000006, currency: 'USD' },
      },
      {
        id: 'o3-mini',
        name: 'o3-mini (High Reasoning)',
        providerType: this.type,
        providerId: this.id,
        contextWindow: 200000,
        capabilities: { text: true, reasoning: true, vision: false, streaming: true, toolCalling: true, jsonMode: true },
        pricing: { isAvailable: true, promptTokenPriceUsd: 0.0000011, completionTokenPriceUsd: 0.0000044, currency: 'USD' },
      },
    ];

    modelRegistry.registerModels(this.id, defaultModels);
    return defaultModels;
  }

  async generateText(request: TextGenerationRequest): Promise<TextGenerationResult> {
    const startTime = performance.now();
    const apiKey = await this.getApiKey();
    if (!apiKey) throw new Error('OpenAI API key missing.');

    const model = request.model || 'gpt-4o-mini';
    const payload: Record<string, unknown> = {
      model,
      messages: request.messages,
      temperature: request.temperature ?? 0.7,
      stream: false,
    };

    if (request.jsonMode) {
      payload.response_format = { type: 'json_object' };
    }

    const res = await fetch(`${this.defaultBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const latencyMs = Math.round(performance.now() - startTime);

    if (!res.ok) {
      const errText = await res.text().catch(() => res.statusText);
      const err = new Error(`OpenAI HTTP ${res.status}: ${errText}`);
      (err as unknown as { isRetryable: boolean }).isRetryable = this.isRetryableError(res.status, errText);
      throw err;
    }

    const data = await res.json();
    return {
      text: data.choices?.[0]?.message?.content || '',
      model: data.model || model,
      providerId: this.id,
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
        estimatedCostUsd: (data.usage?.prompt_tokens || 0) * 0.00000015 + (data.usage?.completion_tokens || 0) * 0.0000006,
      },
      latencyMs,
    };
  }
}
