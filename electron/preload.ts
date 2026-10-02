import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { validateIpcChannel } from './security/ipcSecurity';
import type { Project, Story, StoryBible, Character, Location, Episode, AppSettings, AIProviderConfig, PublishingAccount, PublishingJob, LogEntry, Scene } from '../src/types';

const safeInvoke = async <T = unknown>(channel: string, ...args: unknown[]): Promise<T> => {
  if (!validateIpcChannel(channel)) {
    throw new Error(`Unauthorized IPC Channel: ${channel}`);
  }
  return ipcRenderer.invoke(channel, ...args) as Promise<T>;
};

// Expose safe, typed window.electronAPI bridge
contextBridge.exposeInMainWorld('electronAPI', {
  isDesktop: true,
  platform: process.platform,

  minimize: () => safeInvoke('window:minimize'),
  maximize: () => safeInvoke('window:maximize'),
  close: () => safeInvoke('window:close'),

  openFileDialog: (options?: { title?: string; filters?: { name: string; extensions: string[] }[] }) =>
    safeInvoke<string | null>('dialog:openFile', options),
  openDirectoryDialog: (options?: { title?: string; defaultPath?: string }) =>
    safeInvoke<string | null>('dialog:openDirectory', options),
  saveFileDialog: (options?: { defaultPath?: string; filters?: { name: string; extensions: string[] }[] }) =>
    safeInvoke<string | null>('dialog:saveFile', options),

  db: {
    getProjects: () => safeInvoke<Project[]>('db:getProjects'),
    saveProject: (p: Project) => safeInvoke<void>('db:saveProject', p),
    deleteProject: (id: string) => safeInvoke<void>('db:deleteProject', id),
    getStory: (id: string) => safeInvoke<Story | null>('db:getStory', id),
    saveStory: (s: Story) => safeInvoke<void>('db:saveStory', s),
    getStoryBible: (id: string) => safeInvoke<StoryBible | null>('db:getStoryBible', id),
    saveStoryBible: (b: StoryBible) => safeInvoke<void>('db:saveStoryBible', b),
    getCharacters: (id: string) => safeInvoke<Character[]>('db:getCharacters', id),
    saveCharacter: (c: Character) => safeInvoke<void>('db:saveCharacter', c),
    deleteCharacter: (id: string) => safeInvoke<void>('db:deleteCharacter', id),
    getLocations: (id: string) => safeInvoke<Location[]>('db:getLocations', id),
    saveLocation: (l: Location) => safeInvoke<void>('db:saveLocation', l),
    deleteLocation: (id: string) => safeInvoke<void>('db:deleteLocation', id),
    getEpisodes: (id: string) => safeInvoke<Episode[]>('db:getEpisodes', id),
    saveEpisode: (e: Episode) => safeInvoke<void>('db:saveEpisode', e),
    deleteEpisode: (id: string) => safeInvoke<void>('db:deleteEpisode', id),
    getSettings: () => safeInvoke<AppSettings>('db:getSettings'),
    saveSettings: (s: Partial<AppSettings>) => safeInvoke<void>('db:saveSettings', s),
    getAIProviders: () => safeInvoke<AIProviderConfig[]>('db:getAIProviders'),
    saveAIProvider: (p: AIProviderConfig) => safeInvoke<void>('db:saveAIProvider', p),
    getPublishingAccounts: () => safeInvoke<PublishingAccount[]>('db:getPublishingAccounts'),
    savePublishingAccount: (a: PublishingAccount) => safeInvoke<void>('db:savePublishingAccount', a),
    getPublishingJobs: () => safeInvoke<PublishingJob[]>('db:getPublishingJobs'),
    savePublishingJob: (j: PublishingJob) => safeInvoke<void>('db:savePublishingJob', j),
    getLogs: () => safeInvoke<LogEntry[]>('db:getLogs'),
    addLog: (level: string, category: string, message: string, meta?: Record<string, unknown>) =>
      safeInvoke<void>('db:addLog', level, category, message, meta),
    clearLogs: () => safeInvoke<void>('db:clearLogs'),
  },

  ffmpeg: {
    checkInstallation: () => safeInvoke<{ installed: boolean; version?: string; path?: string }>('ffmpeg:checkInstallation'),
    renderVideo: (payload: { projectId: string; episodeId: string; scenes: Scene[]; aspectRatio: string; resolution: string; fps: number }) =>
      safeInvoke<{ success: boolean; outputPath?: string; error?: string }>('ffmpeg:renderVideo', payload),
    cancelRender: (episodeId: string) => safeInvoke<void>('ffmpeg:cancelRender', episodeId),
  },

  ai: {
    testConnection: (id: string) => safeInvoke<{ success: boolean; latencyMs: number; error?: string }>('ai:testConnection', id),
    analyzeStory: (text: string, options?: { providerId?: string }) => safeInvoke<Partial<StoryBible>>('ai:analyzeStory', text, options),
    splitEpisodes: (text: string, bible: StoryBible, options: { targetDuration: number; aspectRatio: string; language: string }) =>
      safeInvoke<Partial<Episode>[]>('ai:splitEpisodes', text, bible, options),
    generateVisualPrompt: (scene: Partial<Scene>, chars: Character[], locs: Location[]) =>
      safeInvoke<string>('ai:generateVisualPrompt', scene, chars, locs),
    generateImage: (prompt: string, options: { width: number; height: number; providerId?: string }) =>
      safeInvoke<{ imageUrl: string }>('ai:generateImage', prompt, options),
    generateSpeech: (text: string, voiceId?: string, lang?: string) =>
      safeInvoke<{ audioUrl: string; duration: number }>('ai:generateSpeech', text, voiceId, lang),
  },

  publishing: {
    startOAuth: (platform: string) => safeInvoke<{ success: boolean; account?: PublishingAccount; error?: string }>('publishing:startOAuth', platform),
    disconnect: (platform: string) => safeInvoke<void>('publishing:disconnect', platform),
    publishEpisode: (job: PublishingJob) => safeInvoke<{ success: boolean; publishedUrl?: string; error?: string }>('publishing:publishEpisode', job),
  },

  on: (channel: string, callback: (...args: unknown[]) => void) => {
    const subscription = (_event: IpcRendererEvent, ...args: unknown[]) => callback(...args);
    ipcRenderer.on(channel, subscription);
    return () => {
      ipcRenderer.removeListener(channel, subscription);
    };
  },
});
