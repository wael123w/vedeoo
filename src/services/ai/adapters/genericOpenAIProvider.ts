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

export class GenericOpenAIProvider extends AIProvider {
  readonly id: string;
  readonly name: string;
  readonly type: ProviderType = 'custom_openai';
  readonly isLocal: boolean;
  defaultBaseUrl: string;

  constructor(id: string, name: string, baseUrl: string, isLocal: boolean = false) {
    super();
    this.id = id;
    this.name = name;
    this.defaultBaseUrl = baseUrl.replace(/\/+$/, '');
    this.isLocal = isLocal;
  }

  getCapabilities(): AIProviderCapabilities {
    return {
      text: true,
      reasoning: true,
      vision: true,
      imageGeneration: false,
      textToSpeech: false,
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
      const res = await fetch(`${this.defaultBaseUrl}/models`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
      });

      const latencyMs = Math.round(performance.now() - startTime);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Endpoint HTTP ${res.status}: ${text}`);
      }

      const data = await res.json();
      const count = Array.isArray(data.data) ? data.data.length : 1;

      return {
        connected: true,
        latencyMs,
        message: `Connected successfully to custom endpoint. Found ${count} model(s).`,
        checkedAt: Date.now(),
        detectedModelsCount: count,
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
    const apiKey = await this.getApiKey();
    try {
      const res = await fetch(`${this.defaultBaseUrl}/models`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list = Array.isArray(data.data) ? data.data : [];

      const descriptors: ModelDescriptor[] = list.map((m: { id: string }) => ({
        id: m.id,
        name: m.id,
        providerType: this.type,
        providerId: this.id,
        contextWindow: 128000,
        capabilities: { text: true, reasoning: true, vision: true, streaming: true, jsonMode: true },
      }));

      modelRegistry.registerModels(this.id, descriptors);
      return descriptors;
    } catch {
      return [];
    }
  }

  async generateText(request: TextGenerationRequest): Promise<TextGenerationResult> {
    const startTime = performance.now();
    const apiKey = await this.getApiKey();

    const payload: Record<string, unknown> = {
      model: request.model || 'default-model',
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
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    const latencyMs = Math.round(performance.now() - startTime);

    if (!res.ok) {
      const errText = await res.text().catch(() => res.statusText);
      const err = new Error(`Custom OpenAI Provider HTTP ${res.status}: ${errText}`);
      (err as unknown as { isRetryable: boolean }).isRetryable = this.isRetryableError(res.status, errText);
      throw err;
    }

    const data = await res.json();
    return {
      text: data.choices?.[0]?.message?.content || '',
      model: data.model || request.model || 'custom',
      providerId: this.id,
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens || 0,
            completionTokens: data.usage.completion_tokens || 0,
            totalTokens: data.usage.total_tokens || 0,
          }
        : undefined,
      latencyMs,
    };
  }
}
