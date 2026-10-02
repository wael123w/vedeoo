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

export class OllamaProvider extends AIProvider {
  readonly id = 'ollama';
  readonly name = 'Ollama (Local)';
  readonly type: ProviderType = 'ollama';
  readonly isLocal = true;
  defaultBaseUrl = 'http://localhost:11434/v1';

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
      // Test endpoint using standard /models
      const models = await this.fetchModels();
      const latencyMs = Math.round(performance.now() - startTime);

      return {
        connected: true,
        latencyMs,
        message: `Ollama is active. Discovered ${models.length} local model(s).`,
        checkedAt: Date.now(),
        detectedModelsCount: models.length,
      };
    } catch {
      const latencyMs = Math.round(performance.now() - startTime);
      return {
        connected: false,
        latencyMs,
        message: 'Ollama is not running or is not installed.',
        checkedAt: Date.now(),
      };
    }
  }

  async fetchModels(): Promise<ModelDescriptor[]> {
    try {
      const res = await fetch(`${this.getBaseUrl()}/models`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        throw new Error('Ollama is not running or is not installed.');
      }

      const data = await res.json();
      const rawList = Array.isArray(data.data) ? data.data : Array.isArray(data.models) ? data.models : [];

      const descriptors: ModelDescriptor[] = rawList.map((m: { id?: string; name?: string }) => {
        const id = m.id || m.name || 'llama3';
        return {
          id,
          name: id,
          providerType: this.type,
          providerId: this.id,
          contextWindow: 128000,
          capabilities: {
            text: true,
            reasoning: id.includes('deepseek') || id.includes('r1') || id.includes('reason'),
            vision: id.includes('llava') || id.includes('vision'),
            streaming: true,
            jsonMode: true,
          },
          pricing: {
            isAvailable: true,
            promptTokenPriceUsd: 0,
            completionTokenPriceUsd: 0,
            currency: 'USD',
          },
        };
      });

      modelRegistry.registerModels(this.id, descriptors);
      return descriptors;
    } catch {
      throw new Error('Ollama is not running or is not installed.');
    }
  }

  async generateText(request: TextGenerationRequest): Promise<TextGenerationResult> {
    const startTime = performance.now();
    const model = request.model || 'llama3:latest';

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const latencyMs = Math.round(performance.now() - startTime);

      if (!res.ok) {
        const errText = await res.text().catch(() => res.statusText);
        const err = new Error(`Ollama error HTTP ${res.status}: ${errText}`);
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
          estimatedCostUsd: 0, // Local execution is completely free
        },
        latencyMs,
      };
    } catch (err: unknown) {
      const isRetryable = err instanceof Error && (err.message.includes('fetch') || err.message.includes('not running'));
      const errorObj = new Error(err instanceof Error ? err.message : 'Ollama connection error');
      (errorObj as unknown as { isRetryable: boolean }).isRetryable = isRetryable;
      throw errorObj;
    }
  }
}
