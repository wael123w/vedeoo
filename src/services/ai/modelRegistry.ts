import { ModelDescriptor, ProviderType } from './types';

export class ModelRegistry {
  private models: Map<string, ModelDescriptor[]> = new Map(); // providerId -> models

  registerModels(providerId: string, models: ModelDescriptor[]): void {
    this.models.set(providerId, models);
  }

  getModelsForProvider(providerId: string): ModelDescriptor[] {
    return this.models.get(providerId) || [];
  }

  getModel(providerId: string, modelId: string): ModelDescriptor | undefined {
    const list = this.getModelsForProvider(providerId);
    return list.find((m) => m.id === modelId);
  }

  getAllModels(): ModelDescriptor[] {
    const all: ModelDescriptor[] = [];
    for (const list of this.models.values()) {
      all.push(...list);
    }
    return all;
  }

  clearProvider(providerId: string): void {
    this.models.delete(providerId);
  }
}

export const modelRegistry = new ModelRegistry();
