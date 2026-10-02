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

export class AnthropicProvider extends AIProvider {
  readonly id = 'anthropic';
  readonly name = 'Anthropic (Claude)';
  readonly type: ProviderType = 'anthropic';
  readonly isLocal = false;
  defaultBaseUrl = 'https://api.anthropic.com/v1';

  getCapabilities(): AIProviderCapabilities {
    return {
      text: true,
      reasoning: true,
      vision: true,
      imageGeneration: false,
      textToSpeech: false,
      videoGeneration: false,
      embeddings: false,
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
          message: 'Anthropic API key missing.',
          checkedAt: Date.now(),
        };
      }

      // Quick test call with 1 token output
      const res = await fetch(`${this.defaultBaseUrl}/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-5-haiku-20241022',
          max_tokens: 5,
          messages: [{ role: 'user', content: 'Ping' }],
        }),
      });

      const latencyMs = Math.round(performance.now() - startTime);
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Anthropic HTTP ${res.status}: ${errText}`);
      }

      return {
        connected: true,
        latencyMs,
        message: 'Successfully connected to Anthropic Claude API.',
        checkedAt: Date.now(),
        detectedModelsCount: 3,
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
    const list: ModelDescriptor[] = [
      {
        id: 'claude-3-7-sonnet-20250219',
        name: 'Claude 3.7 Sonnet (Hybrid Reasoning)',
        providerType: this.type,
        providerId: this.id,
        contextWindow: 200000,
        capabilities: { text: true, reasoning: true, vision: true, streaming: true, toolCalling: true, jsonMode: true },
        pricing: { isAvailable: true, promptTokenPriceUsd: 0.000003, completionTokenPriceUsd: 0.000015, currency: 'USD' },
      },
      {
        id: 'claude-3-5-sonnet-20241022',
        name: 'Claude 3.5 Sonnet',
        providerType: this.type,
        providerId: this.id,
        contextWindow: 200000,
        capabilities: { text: true, reasoning: true, vision: true, streaming: true, toolCalling: true, jsonMode: true },
        pricing: { isAvailable: true, promptTokenPriceUsd: 0.000003, completionTokenPriceUsd: 0.000015, currency: 'USD' },
      },
      {
        id: 'claude-3-5-haiku-20241022',
        name: 'Claude 3.5 Haiku (Fast)',
        providerType: this.type,
        providerId: this.id,
        contextWindow: 200000,
        capabilities: { text: true, reasoning: false, vision: true, streaming: true, toolCalling: true, jsonMode: true },
        pricing: { isAvailable: true, promptTokenPriceUsd: 0.0000008, completionTokenPriceUsd: 0.000004, currency: 'USD' },
      },
    ];

    modelRegistry.registerModels(this.id, list);
    return list;
  }

  async generateText(request: TextGenerationRequest): Promise<TextGenerationResult> {
    const startTime = performance.now();
    const apiKey = await this.getApiKey();
    if (!apiKey) throw new Error('Anthropic API key missing.');

    const model = request.model || 'claude-3-5-sonnet-20241022';

    // Separate system message if provided
    let system = '';
    const messages: Array<{ role: string; content: string }> = [];

    for (const m of request.messages) {
      if (m.role === 'system') {
        system = m.content;
      } else {
        messages.push({ role: m.role, content: m.content });
      }
    }

    if (request.jsonMode && !system.includes('JSON')) {
      system = (system ? system + '\n\n' : '') + 'CRITICAL: Return output strictly as valid JSON without markdown fences.';
    }

    const payload: Record<string, unknown> = {
      model,
      max_tokens: request.maxTokens || 4096,
      messages,
      temperature: request.temperature ?? 0.7,
    };
    if (system) payload.system = system;

    const res = await fetch(`${this.defaultBaseUrl}/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const latencyMs = Math.round(performance.now() - startTime);

    if (!res.ok) {
      const errText = await res.text().catch(() => res.statusText);
      const err = new Error(`Anthropic HTTP ${res.status}: ${errText}`);
      (err as unknown as { isRetryable: boolean }).isRetryable = this.isRetryableError(res.status, errText);
      throw err;
    }

    const data = await res.json();
    const text = data.content?.[0]?.text || '';

    return {
      text,
      model: data.model || model,
      providerId: this.id,
      usage: {
        promptTokens: data.usage?.input_tokens || 0,
        completionTokens: data.usage?.output_tokens || 0,
        totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
        estimatedCostUsd: (data.usage?.input_tokens || 0) * 0.000003 + (data.usage?.output_tokens || 0) * 0.000015,
      },
      latencyMs,
    };
  }
}
