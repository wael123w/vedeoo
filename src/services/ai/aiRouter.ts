import {
  AIMode,
  AITask,
  AIRouterConfig,
  TaskRouteConfig,
  TextGenerationRequest,
  TextGenerationResult,
} from './types';
import { aiProviderRegistry } from './aiProviderRegistry';
import { credentialStore } from './credentialStore';
import { AIProvider } from './baseProvider';

export const DEFAULT_ROUTER_CONFIG: AIRouterConfig = {
  mode: 'automatic',
  routes: {
    story_analysis: {
      task: 'story_analysis',
      primaryProviderId: 'codecraft',
      fallbackProviderId: 'google',
      secondFallbackProviderId: 'ollama',
    },
    episode_generation: {
      task: 'episode_generation',
      primaryProviderId: 'codecraft',
      fallbackProviderId: 'google',
      secondFallbackProviderId: 'ollama',
    },
    scene_generation: {
      task: 'scene_generation',
      primaryProviderId: 'codecraft',
      fallbackProviderId: 'google',
      secondFallbackProviderId: 'ollama',
    },
    continuity: {
      task: 'continuity',
      primaryProviderId: 'codecraft',
      fallbackProviderId: 'google',
      secondFallbackProviderId: 'ollama',
    },
    social_metadata: {
      task: 'social_metadata',
      primaryProviderId: 'google',
      fallbackProviderId: 'codecraft',
      secondFallbackProviderId: 'ollama',
    },
    vision: {
      task: 'vision',
      primaryProviderId: 'google',
      fallbackProviderId: 'codecraft',
    },
  },
};

export class AIRouter {
  private config: AIRouterConfig = DEFAULT_ROUTER_CONFIG;

  constructor(initialConfig?: Partial<AIRouterConfig>) {
    if (initialConfig) {
      this.config = { ...DEFAULT_ROUTER_CONFIG, ...initialConfig };
    }
  }

  getConfig(): AIRouterConfig {
    return this.config;
  }

  updateConfig(patch: Partial<AIRouterConfig>): void {
    this.config = { ...this.config, ...patch };
  }

  setTaskRoute(task: AITask, route: Partial<TaskRouteConfig>): void {
    this.config.routes[task] = { ...this.config.routes[task], ...route };
  }

  setMode(mode: AIMode): void {
    this.config.mode = mode;
  }

  /**
   * Resolves the prioritized list of provider candidates for a given task and mode.
   */
  async resolveProviderChain(task: AITask): Promise<Array<{ provider: AIProvider; modelOverride?: string }>> {
    const { mode, routes } = this.config;
    const route = routes[task] || DEFAULT_ROUTER_CONFIG.routes[task];
    const chain: Array<{ provider: AIProvider; modelOverride?: string }> = [];

    if (mode === 'local') {
      // Local mode strictly prefers Ollama then LM Studio
      const ollama = aiProviderRegistry.get('ollama');
      if (ollama) chain.push({ provider: ollama });
      const lmstudio = aiProviderRegistry.get('lmstudio');
      if (lmstudio) chain.push({ provider: lmstudio });
      return chain;
    }

    if (mode === 'cloud') {
      // Cloud only: Primary -> Fallback (excluding local providers)
      const primary = aiProviderRegistry.get(route.primaryProviderId);
      if (primary && !primary.isLocal) chain.push({ provider: primary, modelOverride: route.primaryModelId });

      if (route.fallbackProviderId) {
        const fb = aiProviderRegistry.get(route.fallbackProviderId);
        if (fb && !fb.isLocal) chain.push({ provider: fb, modelOverride: route.fallbackModelId });
      }
      return chain;
    }

    // Automatic / Custom mode: Use full configured chain (Primary -> Fallback -> Second fallback)
    const addCandidate = (pId?: string, mId?: string) => {
      if (!pId) return;
      const p = aiProviderRegistry.get(pId);
      if (p && !chain.some((c) => c.provider.id === p.id)) {
        chain.push({ provider: p, modelOverride: mId });
      }
    };

    addCandidate(route.primaryProviderId, route.primaryModelId);
    addCandidate(route.fallbackProviderId, route.fallbackModelId);
    addCandidate(route.secondFallbackProviderId, route.secondFallbackModelId);

    // If chain empty or none has credentials, append local providers as safety net
    if (chain.length === 0) {
      const ollama = aiProviderRegistry.get('ollama');
      if (ollama) chain.push({ provider: ollama });
    }

    return chain;
  }

  /**
   * Dispatches text generation through the provider chain with strict fallback rules.
   * Only retryable errors (rate limits, 5xx server errors, network drops) trigger fallback.
   * Non-retryable errors (invalid API key, 401/403, invalid input) throw immediately.
   */
  async executeWithFallback(task: AITask, request: TextGenerationRequest): Promise<TextGenerationResult> {
    const chain = await this.resolveProviderChain(task);
    if (chain.length === 0) {
      throw new Error(`No AI provider configured for task "${task}". Please configure a provider in Settings → AI Providers.`);
    }

    let lastError: Error | null = null;
    let fallbackReason = '';

    for (let i = 0; i < chain.length; i++) {
      const { provider, modelOverride } = chain[i];
      const model = modelOverride || request.model;

      try {
        const result = await provider.generateText({
          ...request,
          model,
        });

        if (i > 0) {
          result.fallbackTriggered = true;
          result.fallbackReason = fallbackReason;
        }

        return result;
      } catch (err: unknown) {
        const errObj = err instanceof Error ? err : new Error(String(err));
        lastError = errObj;

        const isRetryable = (errObj as unknown as { isRetryable?: boolean }).isRetryable;
        const status = (errObj as unknown as { status?: number }).status;

        // Check if non-retryable error
        if (status === 401 || status === 403 || errObj.message.includes('API key is missing') || errObj.message.includes('API Key missing')) {
          // Do NOT auto-switch for invalid/missing API key
          throw new Error(`[${provider.name}] Authentication failed: ${errObj.message}. Check your API key in Settings.`);
        }

        if (isRetryable === false) {
          // Explicit non-retryable error (e.g. prompt constraint, validation error)
          throw errObj;
        }

        // It is a retryable error (timeout, rate limit, server failure) -> prepare next fallback
        fallbackReason = `Primary provider "${provider.name}" failed (${errObj.message}). Routed to next available provider.`;
        console.warn(`[AIRouter] ${fallbackReason}`);
      }
    }

    throw lastError || new Error(`All configured AI providers failed for task "${task}".`);
  }
}

export const aiRouter = new AIRouter();
