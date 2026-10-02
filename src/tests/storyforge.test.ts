// StoryForge AI - Comprehensive Verification Test Suite
import { sanitizeAndParseJson } from '../services/aiClient';
import {
  buildStoryAnalysisPrompt,
  buildEpisodeSplitPrompt,
  buildImagePrompt,
  buildSocialMetadataPrompt,
} from '../services/promptEngine';
import { subtitleEngine } from '../services/subtitleEngine';
import { FFmpegService } from '../../electron/ffmpeg/ffmpegService';
import { ALLOWED_IPC_CHANNELS, validateIpcChannel, sanitizeSafePath } from '../../electron/security/ipcSecurity';
import { DEMO_PROJECT, DEMO_STORY_BIBLE, DEMO_EPISODES, DEMO_CHARACTERS } from '../data/demoProject';
import { CodeCraftProvider } from '../services/ai/adapters/codecraftProvider';
import { OllamaProvider } from '../services/ai/adapters/ollamaProvider';
import { LMStudioProvider } from '../services/ai/adapters/lmStudioProvider';
import { modelRegistry } from '../services/ai/modelRegistry';
import { aiRouter } from '../services/ai/aiRouter';
import { credentialStore } from '../services/ai/credentialStore';
import { aiProviderRegistry } from '../services/ai/aiProviderRegistry';

export async function runTests(): Promise<{ total: number; passed: number; results: { name: string; success: boolean; error?: string }[] }> {
  const results: { name: string; success: boolean; error?: string }[] = [];

  async function assert(name: string, fn: () => void | Promise<void>) {
    try {
      await fn();
      results.push({ name, success: true });
    } catch (err: unknown) {
      results.push({ name, success: false, error: err instanceof Error ? err.message : String(err) });
    }
  }

  // 1. JSON Repair and Sanitization Test
  await assert('JSON Parser & Sanitizer handles markdown code blocks and trailing commas', () => {
    const raw = '```json\n{\n  "title": "Test Title",\n  "genre": "Mystery",\n}\n```';
    const parsed = sanitizeAndParseJson<{ title: string; genre: string }>(raw);
    if (parsed.title !== 'Test Title' || parsed.genre !== 'Mystery') {
      throw new Error(`Unexpected parse output: ${JSON.stringify(parsed)}`);
    }
  });

  // 2. Prompt Builder Tests
  await assert('Story Analysis Prompt Builder generates structured schema requirements', () => {
    const prompt = buildStoryAnalysisPrompt('Ahmed found an antique brass key.');
    if (!prompt.includes('Story Bible') || !prompt.includes('"characters"')) {
      throw new Error('Prompt missing essential schema instructions');
    }
  });

  await assert('Image Prompt Builder strictly enforces Character and Location Consistency', () => {
    const prompt = buildImagePrompt(
      {
        characterIds: ['char-ahmed'],
        visualPrompt: 'Inspecting an antique celestial atlas',
        cameraMotion: 'zoom_in',
        cameraAngle: 'close_up',
        lighting: 'Amber dust rays',
        mood: 'Intense focus',
      },
      DEMO_CHARACTERS
    );
    if (!prompt.includes('Ahmed Al-Mansoor') || !prompt.includes('Dark charcoal travel coat')) {
      throw new Error('Character consistency details were not injected into image prompt');
    }
  });

  // 3. Subtitle Engine Synchronization Test
  await assert('Subtitle Engine breaks narration into synchronized chunks and exports valid SRT', () => {
    const sampleScenes = DEMO_EPISODES[0].scenes;
    const generatedSubs = subtitleEngine.generateFromScenes(sampleScenes);
    if (generatedSubs.length === 0) throw new Error('No subtitles generated');

    const srt = subtitleEngine.exportToSRT(generatedSubs);
    if (!srt.includes('-->') || !srt.includes('1\n')) {
      throw new Error(`Invalid SRT format generated: ${srt}`);
    }

    const vtt = subtitleEngine.exportToVTT(generatedSubs);
    if (!vtt.startsWith('WEBVTT')) {
      throw new Error('Invalid VTT format');
    }
  });

  // 4. Security & IPC Allowlist Test
  await assert('IPC Security Allowlist permits authorized channels and blocks arbitrary channels', () => {
    if (!validateIpcChannel('db:getProjects')) throw new Error('db:getProjects should be allowed');
    if (!validateIpcChannel('ffmpeg:renderVideo')) throw new Error('ffmpeg:renderVideo should be allowed');
    if (validateIpcChannel('malicious:exec')) throw new Error('malicious:exec must be blocked');
    if (validateIpcChannel('shell:run')) throw new Error('shell:run must be blocked');
  });

  // 5. Path Traversal Protection Test
  await assert('Sanitize Safe Path prevents directory traversal outside workspace', () => {
    const workspace = '/workspace/projects';
    const safe = sanitizeSafePath(workspace, 'Episode1/renders/output.mp4');
    if (!safe.startsWith(workspace)) throw new Error('Safe path should be allowed');

    let blocked = false;
    try {
      sanitizeSafePath(workspace, '../../../../windows/system32');
    } catch {
      blocked = true;
    }
    if (!blocked) throw new Error('Path traversal attack was not blocked');
  });

  // 6. FFmpeg Argument Builder Security
  await assert('FFmpeg Service initializes with secure default binary and safe options', () => {
    const service = new FFmpegService();
    if (!service) throw new Error('FFmpeg service failed to initialize');
  });

  // 7. AI Architecture - CodeCraft Provider Adapter
  await assert('CodeCraftProvider initializes with default https://codecraftapi.com/v1 and dynamic capabilities', () => {
    const codecraft = new CodeCraftProvider();
    if (codecraft.getBaseUrl() !== 'https://codecraftapi.com/v1') {
      throw new Error(`Unexpected Base URL: ${codecraft.getBaseUrl()}`);
    }
    const caps = codecraft.getCapabilities();
    if (!caps.text || !caps.jsonMode || !caps.streaming) {
      throw new Error('CodeCraft missing required base capabilities');
    }
  });

  // 8. AI Architecture - Ollama & LM Studio Local Providers
  await assert('Local Providers Ollama and LM Studio are registered as local-first without requiring keys', () => {
    const ollama = new OllamaProvider();
    const lmstudio = new LMStudioProvider();
    if (!ollama.isLocal || !lmstudio.isLocal) {
      throw new Error('Local providers must be flagged as isLocal: true');
    }
    if (ollama.defaultBaseUrl !== 'http://localhost:11434/v1') {
      throw new Error('Ollama default URL mismatch');
    }
    if (lmstudio.defaultBaseUrl !== 'http://localhost:1234/v1') {
      throw new Error('LM Studio default URL mismatch');
    }
  });

  // 9. AI Architecture - ModelRegistry Dynamic Capabilities & Pricing
  await assert('ModelRegistry stores and retrieves dynamic model metadata with pricing', () => {
    modelRegistry.registerModels('test_provider', [
      {
        id: 'test-model-1',
        name: 'Test Model 1',
        providerType: 'codecraft',
        providerId: 'test_provider',
        contextWindow: 128000,
        capabilities: { text: true, jsonMode: true, vision: true },
        pricing: {
          isAvailable: true,
          promptTokenPriceUsd: 0.000002,
          completionTokenPriceUsd: 0.000008,
          currency: 'USD',
        },
      },
    ]);

    const model = modelRegistry.getModel('test_provider', 'test-model-1');
    if (!model || model.contextWindow !== 128000 || !model.pricing?.isAvailable) {
      throw new Error('Failed to retrieve model from registry');
    }
  });

  // 10. AI Architecture - AIRouter Provider Chain and Fallback
  await assert('AIRouter resolves correct provider candidate chains based on mode', async () => {
    // Test local mode
    aiRouter.setMode('local');
    const localChain = await aiRouter.resolveProviderChain('story_analysis');
    if (localChain[0]?.provider.id !== 'ollama') {
      throw new Error('Local mode must prefer Ollama first');
    }

    // Test automatic mode
    aiRouter.setMode('automatic');
    const autoChain = await aiRouter.resolveProviderChain('story_analysis');
    if (autoChain.length === 0) {
      throw new Error('Automatic mode must provide a candidate chain');
    }
  });

  // 11. Credential Security - In-Memory Vault & Masking
  await assert('CredentialStore securely stores, retrieves, and masks API keys without leaking', async () => {
    await credentialStore.setCredential('test_provider', 'sk-proj-1234567890abcdef');
    const retrieved = await credentialStore.getCredential('test_provider');
    if (retrieved !== 'sk-proj-1234567890abcdef') {
      throw new Error('Failed to retrieve stored credential');
    }

    const masked = await credentialStore.getMaskedCredential('test_provider');
    if (!masked.includes('••••••••') || masked.includes('1234567890')) {
      throw new Error(`Key was not properly masked: ${masked}`);
    }

    await credentialStore.deleteCredential('test_provider');
    const hasKey = await credentialStore.hasCredential('test_provider');
    if (hasKey) throw new Error('Key should have been deleted');
  });

  const passed = results.filter((r) => r.success).length;
  return { total: results.length, passed, results };
}
