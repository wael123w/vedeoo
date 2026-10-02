// Comprehensive AI Architecture Type Definitions

export type AICategory =
  | 'text'
  | 'reasoning'
  | 'vision'
  | 'imageGeneration'
  | 'textToSpeech'
  | 'videoGeneration'
  | 'embeddings';

export interface AIProviderCapabilities {
  text: boolean;
  reasoning: boolean;
  vision: boolean;
  imageGeneration: boolean;
  textToSpeech: boolean;
  videoGeneration: boolean;
  embeddings: boolean;
  streaming: boolean;
  toolCalling: boolean;
  jsonMode: boolean;
}

export type ProviderType =
  | 'google'
  | 'openai'
  | 'anthropic'
  | 'codecraft'
  | 'ollama'
  | 'lmstudio'
  | 'custom_openai';

export type AIMode = 'automatic' | 'cloud' | 'local' | 'custom';

export type AITask =
  | 'story_analysis'
  | 'episode_generation'
  | 'scene_generation'
  | 'continuity'
  | 'social_metadata'
  | 'vision';

export interface ModelPricing {
  promptTokenPriceUsd?: number; // per 1M tokens or per token
  completionTokenPriceUsd?: number;
  imagePriceUsd?: number;
  currency?: string;
  isAvailable: boolean;
}

export interface ModelDescriptor {
  id: string;
  name: string;
  providerType: ProviderType;
  providerId: string;
  contextWindow?: number;
  maxOutputTokens?: number;
  capabilities: Partial<AIProviderCapabilities>;
  pricing?: ModelPricing;
  supportedFeatures?: string[];
  rawMetadata?: Record<string, unknown>;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface TextGenerationRequest {
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  jsonMode?: boolean;
  stream?: boolean;
  tools?: unknown[];
  toolChoice?: unknown;
  stop?: string[];
  frequencyPenalty?: number;
}

export interface TextGenerationResult {
  text: string;
  model: string;
  providerId: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    estimatedCostUsd?: number | null;
  };
  latencyMs: number;
  fallbackTriggered?: boolean;
  fallbackReason?: string;
}

export interface ProviderConnectionStatus {
  connected: boolean;
  latencyMs: number;
  message: string;
  checkedAt: number;
  detectedModelsCount?: number;
}

export interface TaskRouteConfig {
  task: AITask;
  primaryProviderId: string;
  primaryModelId?: string;
  fallbackProviderId?: string;
  fallbackModelId?: string;
  secondFallbackProviderId?: string;
  secondFallbackModelId?: string;
}

export interface AIRouterConfig {
  mode: AIMode;
  routes: Record<AITask, TaskRouteConfig>;
}

export interface ProviderInstanceConfig {
  id: string;
  name: string;
  type: ProviderType;
  baseUrl?: string;
  enabled: boolean;
  selectedModelId?: string;
  hasCredential?: boolean; // credential key is stored securely in CredentialStore
  capabilities?: AIProviderCapabilities;
  connectionStatus?: ProviderConnectionStatus;
  isLocal: boolean;
}
