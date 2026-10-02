import { aiProviderRegistry } from './aiProviderRegistry';
import { aiRouter } from './aiRouter';
import { modelRegistry } from './modelRegistry';
import { credentialStore } from './credentialStore';
import {
  AITask,
  ProviderConnectionStatus,
  ModelDescriptor,
  TextGenerationResult,
  ProviderInstanceConfig,
} from './types';
import { StoryBible, Episode, Character, Location, Scene, SocialMetadata } from '../../types';
import {
  buildStoryAnalysisPrompt,
  buildEpisodeSplitPrompt,
  buildImagePrompt,
  buildSocialMetadataPrompt,
  ContinuityContext,
} from '../promptEngine';
import { sanitizeAndParseJson } from '../aiClient';

export class AIProviderManager {
  /**
   * Refreshes dynamic models for a provider (e.g. CodeCraft GET /v1/models, Ollama, LM Studio).
   */
  async refreshModels(providerId: string): Promise<ModelDescriptor[]> {
    const provider = aiProviderRegistry.get(providerId);
    if (!provider) throw new Error(`Provider "${providerId}" not found in registry.`);
    return provider.fetchModels();
  }

  /**
   * Tests connection for a specific provider.
   */
  async testProviderConnection(providerId: string): Promise<ProviderConnectionStatus> {
    const provider = aiProviderRegistry.get(providerId);
    if (!provider) {
      return {
        connected: false,
        latencyMs: 0,
        message: `Provider "${providerId}" not registered.`,
        checkedAt: Date.now(),
      };
    }
    return provider.testConnection();
  }

  /**
   * Performs Story Analysis in strict JSON mode via AIRouter with fallback.
   */
  async analyzeStory(storyText: string): Promise<{ bible: StoryBible; resultMeta?: TextGenerationResult }> {
    const prompt = buildStoryAnalysisPrompt(storyText);

    try {
      const result = await aiRouter.executeWithFallback('story_analysis', {
        messages: [
          {
            role: 'system',
            content: 'You are the master narrative analyst for StoryForge AI. Output strictly valid JSON without markdown fences.',
          },
          { role: 'user', content: prompt },
        ],
        jsonMode: true,
        temperature: 0.3,
      });

      const parsed = sanitizeAndParseJson<StoryBible>(result.text);
      return { bible: parsed, resultMeta: result };
    } catch (err) {
      console.warn('AI Story Analysis routed call failed, falling back to local deterministic extractor:', err);
      // Graceful offline fallback: Never crash the application!
      return { bible: this.offlineStoryAnalysis(storyText) };
    }
  }

  /**
   * Performs Episode Splitting in strict JSON mode via AIRouter with fallback.
   */
  async splitEpisodes(
    storyText: string,
    context: ContinuityContext,
    options: { targetDuration: number; aspectRatio: string; language: string }
  ): Promise<{ episodes: Episode[]; resultMeta?: TextGenerationResult }> {
    const prompt = buildEpisodeSplitPrompt(storyText, context, options);

    try {
      const result = await aiRouter.executeWithFallback('episode_generation', {
        messages: [
          {
            role: 'system',
            content: 'You are an executive vertical video showrunner. Return a JSON array of episodes with hooks and cliffhangers.',
          },
          { role: 'user', content: prompt },
        ],
        jsonMode: true,
        temperature: 0.5,
      });

      const raw = sanitizeAndParseJson<Partial<Episode>[]>(result.text);
      const episodes: Episode[] = raw.map((ep, idx) => ({
        id: `ep-${Date.now()}-${idx + 1}`,
        projectId: context.storyBible.projectId,
        episodeNumber: idx + 1,
        title: ep.title || `Episode ${idx + 1}`,
        summary: ep.summary || '',
        hook: ep.hook || 'You won\'t believe what happened next...',
        endingCta: ep.endingCta || 'Follow for the next episode!',
        nextEpisodeHook: ep.nextEpisodeHook || 'Coming up in the next part...',
        targetDuration: options.targetDuration,
        estimatedDuration: (ep.scenes || []).reduce((acc, s) => acc + (s.duration || 8), 0) || options.targetDuration,
        musicSuggestion: ep.musicSuggestion || 'Suspenseful atmospheric background track',
        scenes: (ep.scenes || []).map((s, sIdx) => ({
          id: `sc-${Date.now()}-${idx + 1}-${sIdx + 1}`,
          episodeId: `ep-${Date.now()}-${idx + 1}`,
          sceneNumber: sIdx + 1,
          duration: s.duration || Math.round(options.targetDuration / 4),
          narration: s.narration || '',
          dialogue: s.dialogue,
          characterIds: context.characters.filter((c) => (s as unknown as { characterNames?: string[] }).characterNames?.includes(c.name)).map((c) => c.id),
          locationId: context.locations.find((l) => (s as unknown as { locationName?: string }).locationName === l.name)?.id,
          visualPrompt: s.visualPrompt || '',
          negativePrompt: s.negativePrompt || 'blurry, low quality, distorted',
          cameraMotion: s.cameraMotion || 'zoom_in',
          cameraAngle: s.cameraAngle || 'medium',
          lighting: s.lighting || 'dramatic volumetric',
          mood: s.mood || 'tense',
          transition: s.transition || 'crossfade',
          subtitleText: s.subtitleText || s.narration || '',
        })),
        subtitles: [],
      }));

      return { episodes, resultMeta: result };
    } catch (err) {
      console.warn('AI Episode Splitting routed call failed, using local offline generator:', err);
      return { episodes: this.offlineEpisodeSplitter(storyText, context, options) };
    }
  }

  /**
   * Generates Social Metadata in strict JSON mode via AIRouter with fallback.
   */
  async generateSocialMetadata(episode: Episode, bible: StoryBible): Promise<SocialMetadata> {
    const prompt = buildSocialMetadataPrompt(episode, bible);

    try {
      const result = await aiRouter.executeWithFallback('social_metadata', {
        messages: [
          { role: 'system', content: 'Generate viral platform-tailored social copy. Return valid JSON only.' },
          { role: 'user', content: prompt },
        ],
        jsonMode: true,
        temperature: 0.7,
      });

      const parsed = sanitizeAndParseJson<SocialMetadata>(result.text);
      return { ...parsed, episodeId: episode.id };
    } catch {
      return {
        episodeId: episode.id,
        tiktokCaption: `${episode.hook} 😱 Watch Episode ${episode.episodeNumber} of ${bible.title}! #${bible.genre.replace(/\s+/g, '')} #StoryForge #ShortStory`,
        instagramCaption: `"${episode.hook}"\n\nEpisode ${episode.episodeNumber}: ${episode.title}\n\n👉 Follow @storyforge for the next episode!\n\n#Storyteller #FictionReels #${bible.genre.replace(/\s+/g, '')}`,
        facebookCaption: `What would you do in this situation? Episode ${episode.episodeNumber} of ${bible.title}.`,
        youtubeTitle: `${episode.title} - ${bible.title} (Part ${episode.episodeNumber}) #Shorts`,
        youtubeDescription: `${episode.summary}\n\n${episode.endingCta}\n\nCreated with StoryForge AI.`,
        hashtags: [`#${bible.genre.replace(/\s+/g, '')}`, '#StoryForgeAI', '#Shorts', '#StoryTime'],
        keywords: [bible.genre, 'short story', 'web series', episode.title],
        cta: episode.endingCta || 'Follow for Part ' + (episode.episodeNumber + 1),
      };
    }
  }

  // --- Offline Fallbacks ---
  private offlineStoryAnalysis(storyText: string): StoryBible {
    const paragraphs = storyText.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
    const titleMatch = storyText.match(/(?:title|prologue|chapter\s*1)?:?\s*([A-Z][A-Za-z0-9\s,'-]{3,40})/i);
    const title = titleMatch ? titleMatch[1].trim() : 'The Untold Legend';

    return {
      projectId: 'proj-current',
      title,
      genre: 'Mystery & Adventure',
      summary: paragraphs.slice(0, 2).join(' ').slice(0, 300) + '...',
      emotionalTone: 'Intriguing, suspenseful, atmospheric',
      storyArcs: ['Discovery of the hidden artifact', 'Confronting the subterranean truth'],
      styleRules: ['Maintain high contrast chiaroscuro', 'Hook audiences in the first 3 seconds'],
      chapters: [
        { id: 'ch-1', title: 'The Revelation', summary: paragraphs[0]?.slice(0, 140) || 'The journey starts with a discovery.' },
        { id: 'ch-2', title: 'The Threshold', summary: paragraphs[1]?.slice(0, 140) || 'Crossing into the unknown.' },
      ],
      relationships: [],
      objects: [{ name: 'The Ancient Relic', description: 'Mechanism unlocking the chamber', significance: 'Key artifact' }],
      majorEvents: [{ id: 'ev-1', description: 'Finding the mechanism' }],
      timeline: [{ time: 'Act 1', event: 'Initial discovery' }],
    };
  }

  private offlineEpisodeSplitter(
    storyText: string,
    context: ContinuityContext,
    options: { targetDuration: number; aspectRatio: string; language: string }
  ): Episode[] {
    const paragraphs = storyText.split(/\n\s*\n/).filter((p) => p.trim().length > 20);
    const numEpisodes = Math.max(2, Math.min(4, Math.ceil(paragraphs.length / 2)));
    const episodes: Episode[] = [];

    for (let i = 0; i < numEpisodes; i++) {
      const epNum = i + 1;
      const scenesCount = 4;
      const sceneDur = Math.round(options.targetDuration / scenesCount);
      const textChunk = paragraphs[i] || storyText.slice(0, 200);

      const scenes: Scene[] = Array.from({ length: scenesCount }, (_, sIdx) => ({
        id: `sc-auto-${epNum}-${sIdx + 1}`,
        episodeId: `ep-auto-${epNum}`,
        sceneNumber: sIdx + 1,
        duration: sceneDur,
        narration: `Scene ${sIdx + 1} narration unfolding for episode ${epNum}.`,
        characterIds: context.characters.slice(0, 1).map((c) => c.id),
        locationId: context.locations[0]?.id,
        visualPrompt: `Atmospheric vertical cinematic shot: ${textChunk.slice(0, 80)}, 8k, volumetric rays`,
        cameraMotion: sIdx % 2 === 0 ? 'zoom_in' : 'pan_left',
        cameraAngle: 'medium',
        lighting: 'Volumetric cinematic lighting',
        mood: 'Suspenseful',
        transition: sIdx === 0 ? 'cut' : 'crossfade',
        subtitleText: `Scene ${sIdx + 1} narration for episode ${epNum}.`,
      }));

      episodes.push({
        id: `ep-auto-${epNum}`,
        projectId: context.storyBible.projectId,
        episodeNumber: epNum,
        title: `Episode ${epNum}: The Awakening Part ${epNum}`,
        summary: textChunk.slice(0, 120),
        hook: 'What would you do if a 400-year-old secret was unlocked?',
        endingCta: `Subscribe for Episode ${epNum + 1}!`,
        nextEpisodeHook: 'Next episode: The consequence begins...',
        targetDuration: options.targetDuration,
        estimatedDuration: sceneDur * scenesCount,
        scenes,
        subtitles: scenes.map((s, idx) => ({
          id: `sub-${epNum}-${idx}`,
          startTime: idx * sceneDur,
          endTime: (idx + 1) * sceneDur,
          text: s.narration,
        })),
      });
    }

    return episodes;
  }
}

export const aiProviderManager = new AIProviderManager();
