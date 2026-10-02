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

export class LMStudioProvider extends AIProvider {
  readonly id = 'lmstudio';
  readonly name = 'LM Studio (Local)';
  readonly type: ProviderType = 'lmstudio';
  readonly isLocal = true;
  defaultBaseUrl = 'http://localhost:1234/v1';

  private customBaseUrl?: string;

  constructor(customBaseUrl?: string) {
    super();
    this.customBaseUrl = customBaseUrl;
  }

  getBaseUrl(): string {
    return (this.customBaseUrl || this.defaultBaseUrl).replace(/\/+$/, '');
  }

  setBaseUrl(url: string): void {
    this.customBaseUrl = url.trim();
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
      const models = await this.fetchModels();
      const latencyMs = Math.round(performance.now() - startTime);

      return {
        connected: true,
        latencyMs,
        message: `LM Studio local server active. Found ${models.length} loaded model(s).`,
        checkedAt: Date.now(),
        detectedModelsCount: models.length,
      };
    } catch {
      const latencyMs = Math.round(performance.now() - startTime);
      return {
        connected: false,
        latencyMs,
        message: 'LM Studio local server is not running on port 1234.',
        checkedAt: Date.now(),
      };
    }
  }

  async fetchModels(): Promise<ModelDescriptor[]> {
    const apiKey = await this.getApiKey();
    try {
      const res = await fetch(`${this.getBaseUrl()}/models`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
      });

      if (!res.ok) {
        throw new Error(`LM Studio HTTP ${res.status}`);
      }

      const data = await res.json();
      const rawList = Array.isArray(data.data) ? data.data : [];

      const descriptors: ModelDescriptor[] = rawList.map((m: { id: string }) => ({
        id: m.id,
        name: m.id,
        providerType: this.type,
        providerId: this.id,
        contextWindow: 32768,
        capabilities: {
          text: true,
          reasoning: m.id.toLowerCase().includes('reason') || m.id.toLowerCase().includes('r1'),
          vision: m.id.toLowerCase().includes('vision'),
          streaming: true,
          jsonMode: true,
        },
        pricing: {
          isAvailable: true,
          promptTokenPriceUsd: 0,
          completionTokenPriceUsd: 0,
          currency: 'USD',
        },
      }));

      modelRegistry.registerModels(this.id, descriptors);
      return descriptors;
    } catch {
      throw new Error('LM Studio server is not responding at ' + this.getBaseUrl());
    }
  }

  async generateText(request: TextGenerationRequest): Promise<TextGenerationResult> {
    const startTime = performance.now();
    const apiKey = await this.getApiKey();
    const model = request.model || 'local-model';

    const payload: Record<string, unknown> = {
      model,
      messages: request.messages,
      temperature: request.temperature ?? 0.7,
      stream: false,
    };

    if (request.jsonMode) {
      payload.response_format = { type: 'json_object' };
    }

    try {
      const res = await fetch(`${this.getBaseUrl()}/chat/completions`, {
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
        const err = new Error(`LM Studio error HTTP ${res.status}: ${errText}`);
        (err as unknown as { isRetryable: boolean }).isRetryable = this.isRetryableError(res.status, errText);
        throw err;
      }

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || '';

      return {
        text,
        model: data.model || model,
        providerId: this.id,
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
          estimatedCostUsd: 0,
        },
        latencyMs,
      };
    } catch (err: unknown) {
      const isRetryable = err instanceof Error && (err.message.includes('fetch') || err.message.includes('not responding'));
      const errorObj = new Error(err instanceof Error ? err.message : 'LM Studio error');
      (errorObj as unknown as { isRetryable: boolean }).isRetryable = isRetryable;
      throw errorObj;
    }
  }
}
