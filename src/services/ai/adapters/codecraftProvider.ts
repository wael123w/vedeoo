import { AIProvider } from '../baseProvider';
import {
  AIProviderCapabilities,
  ModelDescriptor,
  ModelPricing,
  ProviderConnectionStatus,
  ProviderType,
  TextGenerationRequest,
  TextGenerationResult,
} from '../types';
import { modelRegistry } from '../modelRegistry';

interface CodeCraftModelPayload {
  id: string;
  name?: string;
  context_window?: number;
  max_output_tokens?: number;
  pricing?: {
    prompt_token_usd?: number;
    completion_token_usd?: number;
    currency?: string;
  };
  capabilities?: {
    text?: boolean;
    reasoning?: boolean;
    vision?: boolean;
    streaming?: boolean;
    tools?: boolean;
    tool_calling?: boolean;
    json?: boolean;
    json_mode?: boolean;
    image_generation?: boolean;
  };
  features?: string[];
  supported_features?: string[];
}

export class CodeCraftProvider extends AIProvider {
  readonly id = 'codecraft';
  readonly name = 'CodeCraft API';
  readonly type: ProviderType = 'codecraft';
  readonly isLocal = false;
  defaultBaseUrl = 'https://codecraftapi.com/v1';

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
    // Dynamically inferred or aggregate capabilities from discovered models
    const models = modelRegistry.getModelsForProvider(this.id);
    const hasVision = models.some((m) => m.capabilities?.vision);
    const hasReasoning = models.some((m) => m.capabilities?.reasoning);
    const hasTools = models.some((m) => m.capabilities?.toolCalling);
    const hasJson = models.some((m) => m.capabilities?.jsonMode);

    return {
      text: true,
      reasoning: hasReasoning || true,
      vision: hasVision,
      imageGeneration: false,
      textToSpeech: false,
      videoGeneration: false,
      embeddings: true,
      streaming: true,
      toolCalling: hasTools,
      jsonMode: hasJson || true,
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
          message: 'API Key missing. Enter your CodeCraft API key in settings.',
          checkedAt: Date.now(),
        };
      }

      const models = await this.fetchModels();
      const latencyMs = Math.round(performance.now() - startTime);

      return {
        connected: true,
        latencyMs,
        message: `Successfully connected. Discovered ${models.length} dynamic models.`,
        checkedAt: Date.now(),
        detectedModelsCount: models.length,
      };
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
    const apiKey = await this.getApiKey();
    if (!apiKey) {
      throw new Error('CodeCraft API key is required to retrieve models.');
    }

    const res = await fetch(`${this.getBaseUrl()}/models`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => res.statusText);
      throw new Error(`CodeCraft GET /v1/models returned HTTP ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    const rawList: CodeCraftModelPayload[] = Array.isArray(data)
      ? data
      : Array.isArray(data.data)
      ? data.data
      : [];

    const descriptors: ModelDescriptor[] = rawList.map((m) => {
      const caps = m.capabilities || {};
      const pricingObj = m.pricing;

      const pricing: ModelPricing = pricingObj && pricingObj.prompt_token_usd !== undefined
        ? {
            promptTokenPriceUsd: pricingObj.prompt_token_usd,
            completionTokenPriceUsd: pricingObj.completion_token_usd,
            currency: pricingObj.currency || 'USD',
            isAvailable: true,
          }
        : { isAvailable: false };

      return {
        id: m.id,
        name: m.name || m.id,
        providerType: this.type,
        providerId: this.id,
        contextWindow: m.context_window || 128000,
        maxOutputTokens: m.max_output_tokens,
        capabilities: {
          text: caps.text !== false,
          reasoning: Boolean(caps.reasoning || m.id.toLowerCase().includes('reason') || m.id.toLowerCase().includes('r1')),
          vision: Boolean(caps.vision || m.id.toLowerCase().includes('vision') || m.id.toLowerCase().includes('vl')),
          streaming: caps.streaming !== false,
          toolCalling: Boolean(caps.tools || caps.tool_calling),
          jsonMode: Boolean(caps.json || caps.json_mode !== false),
        },
        pricing,
        supportedFeatures: m.features || m.supported_features || [],
        rawMetadata: m as unknown as Record<string, unknown>,
      };
    });

    modelRegistry.registerModels(this.id, descriptors);
    return descriptors;
  }

  async generateText(request: TextGenerationRequest): Promise<TextGenerationResult> {
    const startTime = performance.now();
    const apiKey = await this.getApiKey();
    if (!apiKey) {
      throw new Error('CodeCraft API key is missing. Configure it in Settings → AI Providers.');
    }

    const selectedModel = request.model || 'codecraft-default';

    // Verify model capabilities if known
    const modelMeta = modelRegistry.getModel(this.id, selectedModel);
    if (modelMeta) {
      if (request.jsonMode && modelMeta.capabilities.jsonMode === false) {
        throw new Error(`Model "${selectedModel}" explicitly does not support JSON Mode.`);
      }
    }

    // Build payload conforming strictly to OpenAI specifications
    const payload: Record<string, unknown> = {
      model: selectedModel,
      messages: request.messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens,
      top_p: request.topP,
      stop: request.stop,
      frequency_penalty: request.frequencyPenalty,
      stream: false,
    };

    if (request.jsonMode) {
      payload.response_format = { type: 'json_object' };
    }

    if (request.tools && request.tools.length > 0) {
      payload.tools = request.tools;
      if (request.toolChoice) payload.tool_choice = request.toolChoice;
    }

    const res = await fetch(`${this.getBaseUrl()}/chat/completions`, {
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
      const isRetryable = this.isRetryableError(res.status, errText);
      const err = new Error(`CodeCraft HTTP ${res.status}: ${errText}`);
      (err as unknown as { isRetryable: boolean; status: number }).isRetryable = isRetryable;
      (err as unknown as { status: number }).status = res.status;
      throw err;
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || '';
    const usage = data.usage;

    let estimatedCostUsd: number | null = null;
    if (usage && modelMeta?.pricing?.isAvailable && modelMeta.pricing.promptTokenPriceUsd !== undefined) {
      const promptCost = (usage.prompt_tokens || 0) * (modelMeta.pricing.promptTokenPriceUsd || 0);
      const completionCost = (usage.completion_tokens || 0) * (modelMeta.pricing.completionTokenPriceUsd || 0);
      estimatedCostUsd = promptCost + completionCost;
    }

    return {
      text,
      model: data.model || selectedModel,
      providerId: this.id,
      usage: usage
        ? {
            promptTokens: usage.prompt_tokens || 0,
            completionTokens: usage.completion_tokens || 0,
            totalTokens: usage.total_tokens || 0,
            estimatedCostUsd,
          }
        : undefined,
      latencyMs,
    };
  }
}
