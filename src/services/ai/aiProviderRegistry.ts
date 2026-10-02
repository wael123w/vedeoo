import { AIProvider } from './baseProvider';
import { ProviderType } from './types';
import { GoogleAIProvider } from './adapters/googleProvider';
import { OpenAIProvider } from './adapters/openaiProvider';
import { AnthropicProvider } from './adapters/anthropicProvider';
import { CodeCraftProvider } from './adapters/codecraftProvider';
import { OllamaProvider } from './adapters/ollamaProvider';
import { LMStudioProvider } from './adapters/lmStudioProvider';
import { GenericOpenAIProvider } from './adapters/genericOpenAIProvider';

export class AIProviderRegistry {
  private providers: Map<string, AIProvider> = new Map();

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults(): void {
    this.register(new CodeCraftProvider());
    this.register(new GoogleAIProvider());
    this.register(new OpenAIProvider());
    this.register(new AnthropicProvider());
    this.register(new OllamaProvider());
    this.register(new LMStudioProvider());
  }

  register(provider: AIProvider): void {
    this.providers.set(provider.id, provider);
  }

  unregister(providerId: string): void {
    this.providers.delete(providerId);
  }

  get(providerId: string): AIProvider | undefined {
    return this.providers.get(providerId);
  }

  getAll(): AIProvider[] {
    return Array.from(this.providers.values());
  }

  getByType(type: ProviderType): AIProvider[] {
    return this.getAll().filter((p) => p.type === type);
  }

  getLocalProviders(): AIProvider[] {
    return this.getAll().filter((p) => p.isLocal);
  }

  getCloudProviders(): AIProvider[] {
    return this.getAll().filter((p) => !p.isLocal);
  }

  registerCustomOpenAI(id: string, name: string, baseUrl: string): GenericOpenAIProvider {
    const provider = new GenericOpenAIProvider(id, name, baseUrl, false);
    this.register(provider);
    return provider;
  }
}

export const aiProviderRegistry = new AIProviderRegistry();
