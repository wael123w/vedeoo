import { create } from 'zustand';
import {
  AIMode,
  AITask,
  AIProviderCapabilities,
  ModelDescriptor,
  ProviderConnectionStatus,
  ProviderInstanceConfig,
  ProviderType,
} from '../services/ai/types';
import { aiProviderRegistry } from '../services/ai/aiProviderRegistry';
import { aiProviderManager } from '../services/ai/aiProviderManager';
import { aiRouter, DEFAULT_ROUTER_CONFIG } from '../services/ai/aiRouter';
import { modelRegistry } from '../services/ai/modelRegistry';
import { credentialStore } from '../services/ai/credentialStore';
import { CodeCraftProvider } from '../services/ai/adapters/codecraftProvider';

export interface UsageReport {
  totalRequests: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
}

interface AIState {
  providers: ProviderInstanceConfig[];
  selectedProviderTab: string; // 'codecraft' | 'google' | 'openai' | 'anthropic' | 'ollama' | 'lmstudio' | 'custom'
  routerMode: AIMode;
  taskRoutes: Record<AITask, { primary: string; fallback?: string }>;
  discoveredModels: Record<string, ModelDescriptor[]>; // providerId -> models
  testingProviderId: string | null;
  refreshingProviderId: string | null;
  usageReport: UsageReport;

  // Actions
  initialize: () => Promise<void>;
  setSelectedTab: (tab: string) => void;
  setRouterMode: (mode: AIMode) => void;
  setTaskRoute: (task: AITask, primary: string, fallback?: string) => void;
  setProviderApiKey: (providerId: string, apiKey: string) => Promise<void>;
  setProviderBaseUrl: (providerId: string, baseUrl: string) => void;
  setSelectedModel: (providerId: string, modelId: string) => void;
  testProvider: (providerId: string) => Promise<ProviderConnectionStatus>;
  refreshModels: (providerId: string) => Promise<ModelDescriptor[]>;
  addCustomProvider: (name: string, baseUrl: string, apiKey?: string, model?: string) => Promise<void>;
  removeCustomProvider: (id: string) => void;
  recordTokens: (promptTokens: number, completionTokens: number, costUsd?: number | null) => void;
}

export const useAIStore = create<AIState>((set, get) => ({
  providers: [
    {
      id: 'codecraft',
      name: 'CodeCraft API',
      type: 'codecraft',
      baseUrl: 'https://codecraftapi.com/v1',
      enabled: true,
      isLocal: false,
    },
    {
      id: 'google',
      name: 'Google AI (Gemini)',
      type: 'google',
      baseUrl: 'https://generativelanguage.googleapis.com',
      enabled: true,
      selectedModelId: 'gemini-3.8-flash',
      isLocal: false,
    },
    {
      id: 'openai',
      name: 'OpenAI',
      type: 'openai',
      baseUrl: 'https://api.openai.com/v1',
      enabled: false,
      selectedModelId: 'gpt-4o-mini',
      isLocal: false,
    },
    {
      id: 'anthropic',
      name: 'Anthropic (Claude)',
      type: 'anthropic',
      baseUrl: 'https://api.anthropic.com/v1',
      enabled: false,
      selectedModelId: 'claude-3-5-sonnet-20241022',
      isLocal: false,
    },
    {
      id: 'ollama',
      name: 'Ollama (Local)',
      type: 'ollama',
      baseUrl: 'http://localhost:11434/v1',
      enabled: false,
      isLocal: true,
    },
    {
      id: 'lmstudio',
      name: 'LM Studio (Local)',
      type: 'lmstudio',
      baseUrl: 'http://localhost:1234/v1',
      enabled: false,
      isLocal: true,
    },
  ],
  selectedProviderTab: 'codecraft',
  routerMode: 'automatic',
  taskRoutes: {
    story_analysis: { primary: 'codecraft', fallback: 'google' },
    episode_generation: { primary: 'codecraft', fallback: 'google' },
    scene_generation: { primary: 'codecraft', fallback: 'google' },
    continuity: { primary: 'codecraft', fallback: 'google' },
    social_metadata: { primary: 'google', fallback: 'codecraft' },
    vision: { primary: 'google', fallback: 'codecraft' },
  },
  discoveredModels: {},
  testingProviderId: null,
  refreshingProviderId: null,
  usageReport: {
    totalRequests: 8,
    promptTokens: 14200,
    completionTokens: 3840,
    totalTokens: 18040,
    estimatedCostUsd: 0.0042,
  },

  initialize: async () => {
    // Populate model lists for Google, OpenAI, Anthropic
    for (const p of aiProviderRegistry.getAll()) {
      try {
        const models = await p.fetchModels();
        set((state) => ({
          discoveredModels: { ...state.discoveredModels, [p.id]: models },
        }));
      } catch {
        // Local or unconfigured endpoints might be offline
      }
    }
  },

  setSelectedTab: (tab) => set({ selectedProviderTab: tab }),

  setRouterMode: (mode) => {
    aiRouter.setMode(mode);
    set({ routerMode: mode });
  },

  setTaskRoute: (task, primary, fallback) => {
    aiRouter.setTaskRoute(task, {
      primaryProviderId: primary,
      fallbackProviderId: fallback,
    });
    set((state) => ({
      taskRoutes: {
        ...state.taskRoutes,
        [task]: { primary, fallback },
      },
    }));
  },

  setProviderApiKey: async (providerId, apiKey) => {
    await credentialStore.setCredential(providerId, apiKey);
    set((state) => ({
      providers: state.providers.map((p) =>
        p.id === providerId ? { ...p, hasCredential: Boolean(apiKey.trim()) } : p
      ),
    }));
  },

  setProviderBaseUrl: (providerId, baseUrl) => {
    const provider = aiProviderRegistry.get(providerId);
    if (provider && 'setBaseUrl' in provider) {
      (provider as CodeCraftProvider).setBaseUrl(baseUrl);
    }
    set((state) => ({
      providers: state.providers.map((p) =>
        p.id === providerId ? { ...p, baseUrl } : p
      ),
    }));
  },

  setSelectedModel: (providerId, modelId) => {
    set((state) => ({
      providers: state.providers.map((p) =>
        p.id === providerId ? { ...p, selectedModelId: modelId } : p
      ),
    }));
  },

  testProvider: async (providerId) => {
    set({ testingProviderId: providerId });
    const status = await aiProviderManager.testProviderConnection(providerId);

    set((state) => ({
      testingProviderId: null,
      providers: state.providers.map((p) =>
        p.id === providerId ? { ...p, connectionStatus: status } : p
      ),
    }));

    // If connected, automatically update discovered models
    if (status.connected) {
      const models = modelRegistry.getModelsForProvider(providerId);
      set((state) => ({
        discoveredModels: { ...state.discoveredModels, [providerId]: models },
      }));
    }

    return status;
  },

  refreshModels: async (providerId) => {
    set({ refreshingProviderId: providerId });
    try {
      const models = await aiProviderManager.refreshModels(providerId);
      set((state) => {
        const existing = state.providers.find((p) => p.id === providerId);
        const selectedModelId = existing?.selectedModelId || models[0]?.id;
        return {
          refreshingProviderId: null,
          discoveredModels: { ...state.discoveredModels, [providerId]: models },
          providers: state.providers.map((p) =>
            p.id === providerId ? { ...p, selectedModelId } : p
          ),
        };
      });
      return models;
    } finally {
      set({ refreshingProviderId: null });
    }
  },

  addCustomProvider: async (name, baseUrl, apiKey, model) => {
    const id = `custom_${Date.now()}`;
    const provider = aiProviderRegistry.registerCustomOpenAI(id, name, baseUrl);
    if (apiKey) {
      await credentialStore.setCredential(id, apiKey);
    }

    const newInstance: ProviderInstanceConfig = {
      id,
      name,
      type: 'custom_openai',
      baseUrl,
      enabled: true,
      selectedModelId: model || 'default',
      isLocal: baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1'),
      hasCredential: Boolean(apiKey),
    };

    set((state) => ({
      providers: [...state.providers, newInstance],
      selectedProviderTab: id,
    }));
  },

  removeCustomProvider: (id) => {
    aiProviderRegistry.unregister(id);
    credentialStore.deleteCredential(id);
    set((state) => ({
      providers: state.providers.filter((p) => p.id !== id),
      selectedProviderTab: state.selectedProviderTab === id ? 'codecraft' : state.selectedProviderTab,
    }));
  },

  recordTokens: (promptTokens, completionTokens, costUsd) => {
    set((state) => {
      const totalTokens = promptTokens + completionTokens;
      const additionalCost = costUsd ?? 0;
      return {
        usageReport: {
          totalRequests: state.usageReport.totalRequests + 1,
          promptTokens: state.usageReport.promptTokens + promptTokens,
          completionTokens: state.usageReport.completionTokens + completionTokens,
          totalTokens: state.usageReport.totalTokens + totalTokens,
          estimatedCostUsd: state.usageReport.estimatedCostUsd + additionalCost,
        },
      };
    });
  },
}));
