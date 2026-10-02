import { StoryBible, Episode, Character, Location, Scene, SocialMetadata } from '../types';
import { buildImagePrompt, ContinuityContext } from './promptEngine';
import { aiProviderManager } from './ai/aiProviderManager';

// Robust JSON repair utility
export function sanitizeAndParseJson<T>(raw: string): T {
  let cleaned = raw.trim();
  // Strip markdown code fences if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // Attempt basic JSON repairs (common trailing commas or smart quotes)
    const fixed = cleaned
      .replace(/,\s*([}\]])/g, '$1')
      .replace(/[\u201C\u201D]/g, '"');
    return JSON.parse(fixed) as T;
  }
}

export class AIClientService {
  /**
   * Tests connection to a configured provider with real request and latency tracking.
   */
  async testConnection(providerId: string): Promise<{ success: boolean; latencyMs: number; message: string; model?: string }> {
    const status = await aiProviderManager.testProviderConnection(providerId);
    return {
      success: status.connected,
      latencyMs: status.latencyMs,
      message: status.message,
    };
  }

  /**
   * Performs deep structured story analysis to generate a complete Story Bible.
   * Utilizes AIRouter with automatic fallback and JSON mode.
   */
  async analyzeStory(storyText: string): Promise<StoryBible> {
    const { bible } = await aiProviderManager.analyzeStory(storyText);
    return bible;
  }

  /**
   * Splits a story into video episodes maintaining narrative continuity.
   * Utilizes AIRouter with automatic fallback and JSON mode.
   */
  async splitStoryIntoEpisodes(
    storyText: string,
    context: ContinuityContext,
    options: { targetDuration: number; aspectRatio: string; language: string }
  ): Promise<Episode[]> {
    const { episodes } = await aiProviderManager.splitEpisodes(storyText, context, options);
    return episodes;
  }

  /**
   * Generates or refines an image prompt for a scene.
   */
  generateSceneImagePrompt(scene: Partial<Scene>, characters: Character[], location?: Location, aspectRatio: string = '9:16'): string {
    return buildImagePrompt(scene, characters, location, aspectRatio);
  }

  /**
   * Generates social media metadata for an episode.
   * Utilizes AIRouter with automatic fallback and JSON mode.
   */
  async generateSocialMetadata(episode: Episode, bible: StoryBible): Promise<SocialMetadata> {
    return aiProviderManager.generateSocialMetadata(episode, bible);
  }
}

export const aiClient = new AIClientService();
