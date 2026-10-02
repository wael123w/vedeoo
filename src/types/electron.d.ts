import type { Project, Story, StoryBible, Character, Location, Episode, Scene, BackgroundJob, AIProviderConfig, PublishingAccount, PublishingJob, AppSettings, LogEntry } from './index';

export interface ElectronAPI {
  // App info & Window
  isDesktop: boolean;
  platform: 'win32' | 'darwin' | 'linux' | 'web';
  minimize: () => Promise<void>;
  maximize: () => Promise<void>;
  close: () => Promise<void>;

  // Dialogs
  openFileDialog: (options?: { filters?: { name: string; extensions: string[] }[]; title?: string }) => Promise<string | null>;
  openDirectoryDialog: (options?: { title?: string; defaultPath?: string }) => Promise<string | null>;
  saveFileDialog: (options?: { defaultPath?: string; filters?: { name: string; extensions: string[] }[] }) => Promise<string | null>;

  // Database operations
  db: {
    getProjects: () => Promise<Project[]>;
    saveProject: (project: Project) => Promise<void>;
    deleteProject: (id: string) => Promise<void>;
    getStory: (projectId: string) => Promise<Story | null>;
    saveStory: (story: Story) => Promise<void>;
    getStoryBible: (projectId: string) => Promise<StoryBible | null>;
    saveStoryBible: (bible: StoryBible) => Promise<void>;
    getCharacters: (projectId: string) => Promise<Character[]>;
    saveCharacter: (character: Character) => Promise<void>;
    deleteCharacter: (id: string) => Promise<void>;
    getLocations: (projectId: string) => Promise<Location[]>;
    saveLocation: (location: Location) => Promise<void>;
    deleteLocation: (id: string) => Promise<void>;
    getEpisodes: (projectId: string) => Promise<Episode[]>;
    saveEpisode: (episode: Episode) => Promise<void>;
    deleteEpisode: (id: string) => Promise<void>;
    getSettings: () => Promise<AppSettings>;
    saveSettings: (settings: Partial<AppSettings>) => Promise<void>;
    getAIProviders: () => Promise<AIProviderConfig[]>;
    saveAIProvider: (provider: AIProviderConfig) => Promise<void>;
    getPublishingAccounts: () => Promise<PublishingAccount[]>;
    savePublishingAccount: (account: PublishingAccount) => Promise<void>;
    getPublishingJobs: () => Promise<PublishingJob[]>;
    savePublishingJob: (job: PublishingJob) => Promise<void>;
    getLogs: (limit?: number) => Promise<LogEntry[]>;
    addLog: (level: 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG', category: string, message: string, metadata?: Record<string, unknown>) => Promise<void>;
    clearLogs: () => Promise<void>;
  };

  // FFmpeg
  ffmpeg: {
    checkInstallation: () => Promise<{ installed: boolean; version?: string; path?: string }>;
    renderVideo: (payload: {
      projectId: string;
      episodeId: string;
      scenes: Scene[];
      aspectRatio: string;
      resolution: string;
      fps: number;
      brandKit?: unknown;
      subtitles?: unknown;
    }) => Promise<{ success: boolean; outputPath?: string; error?: string }>;
    cancelRender: (episodeId: string) => Promise<void>;
  };

  // AI IPC
  ai: {
    testConnection: (providerId: string) => Promise<{ success: boolean; latencyMs: number; error?: string }>;
    analyzeStory: (text: string, options?: { providerId?: string }) => Promise<Partial<StoryBible>>;
    splitEpisodes: (storyText: string, bible: StoryBible, options: { targetDuration: number; aspectRatio: string; language: string }) => Promise<Partial<Episode>[]>;
    generateVisualPrompt: (scene: Partial<Scene>, characterBible: Character[], locationBible: Location[]) => Promise<string>;
    generateImage: (prompt: string, options: { width: number; height: number; providerId?: string }) => Promise<{ imageUrl: string }>;
    generateSpeech: (text: string, voiceId?: string, language?: string) => Promise<{ audioUrl: string; duration: number }>;
  };

  // Publishing
  publishing: {
    startOAuth: (platform: 'youtube' | 'tiktok' | 'instagram' | 'facebook') => Promise<{ success: boolean; account?: PublishingAccount; error?: string }>;
    disconnect: (platform: string) => Promise<void>;
    publishEpisode: (job: PublishingJob) => Promise<{ success: boolean; publishedUrl?: string; error?: string }>;
  };

  // Events listener
  on: (channel: string, listener: (...args: unknown[]) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
