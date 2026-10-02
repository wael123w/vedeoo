import {
  AIProviderCapabilities,
  ModelDescriptor,
  ProviderConnectionStatus,
  ProviderType,
  TextGenerationRequest,
  TextGenerationResult,
} from './types';
import { credentialStore } from './credentialStore';

export abstract class AIProvider {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly type: ProviderType;
  abstract readonly isLocal: boolean;
  abstract defaultBaseUrl?: string;

  abstract getCapabilities(): AIProviderCapabilities;

  abstract testConnection(): Promise<ProviderConnectionStatus>;

  abstract fetchModels(): Promise<ModelDescriptor[]>;

  abstract generateText(request: TextGenerationRequest): Promise<TextGenerationResult>;

  // Optional category methods
  async generateImage?(prompt: string, options?: { width: number; height: number }): Promise<{ imageUrl: string }>;
  async generateSpeech?(text: string, voice?: string, language?: string): Promise<{ audioUrl: string; duration: number }>;

  protected async getApiKey(): Promise<string | null> {
    return credentialStore.getCredential(this.id);
  }

  protected isRetryableError(status: number, message: string): boolean {
    // 401 Unauthorized, 403 Forbidden, 400 Bad Request (invalid format) are NOT retryable
    if (status === 401 || status === 403 || status === 400 || status === 422) {
      return false;
    }
    // Rate limits (429), timeouts (408), server errors (500, 502, 503, 504), network errors are retryable
    if (status === 429 || status >= 500 || status === 408) {
      return true;
    }
    if (message.includes('network') || message.includes('ECONNREFUSED') || message.includes('ETIMEDOUT') || message.includes('timeout')) {
      return true;
    }
    return false;
  }
}
