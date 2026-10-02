import {
  Project,
  Story,
  StoryBible,
  Character,
  Location,
  Episode,
  AIProviderConfig,
  PublishingAccount,
  PublishingJob,
  AppSettings,
  LogEntry,
  BackgroundJob,
  VideoTemplate,
} from '../types';
import {
  DEMO_PROJECT,
  DEMO_STORY,
  DEMO_STORY_BIBLE,
  DEMO_CHARACTERS,
  DEMO_LOCATIONS,
  DEMO_EPISODES,
} from '../data/demoProject';

const DB_PREFIX = 'storyforge_';

export const INITIAL_SETTINGS: AppSettings = {
  language: 'en',
  theme: 'dark',
  workspaceDir: 'C:\\StoryForgeProjects',
  renderResolution: '1080p',
  renderFps: 30,
  duckingAmount: 0.35,
  autoSaveIntervalSec: 10,
  firstRunCompleted: false,
};

export const INITIAL_AI_PROVIDERS: AIProviderConfig[] = [
  {
    id: 'google-gemini',
    name: 'Google Gemini AI',
    type: 'google',
    enabled: true,
    model: 'gemini-3.8-flash',
    temperature: 0.7,
    maxTokens: 4096,
  },
  {
    id: 'local-ollama',
    name: 'Local AI (Ollama / LocalAI)',
    type: 'openai_compatible',
    enabled: false,
    baseUrl: 'http://localhost:11434/v1',
    model: 'llama3:latest',
  },
];

export const INITIAL_PUBLISHING_ACCOUNTS: PublishingAccount[] = [
  {
    id: 'pub-youtube',
    platform: 'youtube',
    accountName: 'YouTube Shorts Studio',
    connected: false,
    scopes: ['https://www.googleapis.com/auth/youtube.upload'],
    statusMessage: 'Ready for OAuth Connection',
  },
  {
    id: 'pub-tiktok',
    platform: 'tiktok',
    accountName: 'TikTok Content API',
    connected: false,
    scopes: ['video.upload', 'video.publish'],
    statusMessage: 'Official TikTok Posting API',
  },
  {
    id: 'pub-instagram',
    platform: 'instagram',
    accountName: 'Instagram Reels (Meta Graph)',
    connected: false,
    scopes: ['instagram_basic', 'instagram_content_publish'],
    statusMessage: 'Requires Professional/Creator Account',
  },
  {
    id: 'pub-facebook',
    platform: 'facebook',
    accountName: 'Facebook Page Reels',
    connected: false,
    scopes: ['pages_show_list', 'pages_read_engagement', 'publish_video'],
    statusMessage: 'Meta Graph API v19.0',
  },
];

export const INITIAL_TEMPLATES: VideoTemplate[] = [
  {
    id: 'tmpl-cinematic',
    name: 'Cinematic Mystery',
    description: 'High tension chiaroscuro with serif subtitles and smooth push-in zooms.',
    genre: 'Mystery & Thriller',
    subtitleStyle: 'Cinematic',
    transition: 'fade',
    defaultCameraMotion: 'zoom_in',
    fontFamily: "'Georgia', serif",
    primaryColor: '#fef08a',
    accentColor: '#38bdf8',
    defaultAspectRatio: '9:16',
  },
  {
    id: 'tmpl-tiktok-viral',
    name: 'TikTok Viral Story',
    description: 'High energy pop subtitles with fast paced camera cuts and word highlighting.',
    genre: 'Fiction / Reddit Stories',
    subtitleStyle: 'TikTok',
    transition: 'cut',
    defaultCameraMotion: 'pan_left',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    primaryColor: '#ffffff',
    accentColor: '#22d3ee',
    defaultAspectRatio: '9:16',
  },
  {
    id: 'tmpl-horror-dark',
    name: 'Dark Horror & Suspense',
    description: 'Shadowy aesthetics with deep black dips and trembling tension.',
    genre: 'Horror',
    subtitleStyle: 'Bold',
    transition: 'dip_to_black',
    defaultCameraMotion: 'zoom_out',
    fontFamily: "'Impact', sans-serif",
    primaryColor: '#ef4444',
    accentColor: '#dc2626',
    defaultAspectRatio: '9:16',
  },
  {
    id: 'tmpl-anime',
    name: 'Anime & Light Novel',
    description: 'Vibrant punchy styling with dynamic slide cuts and neon titles.',
    genre: 'Anime & Fantasy',
    subtitleStyle: 'Karaoke',
    transition: 'slide',
    defaultCameraMotion: 'pan_right',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    primaryColor: '#38bdf8',
    accentColor: '#ec4899',
    defaultAspectRatio: '9:16',
  },
  {
    id: 'tmpl-documentary',
    name: 'Historical Documentary',
    description: 'Pristine neutral archival styling with classic subtitles.',
    genre: 'History / Biography',
    subtitleStyle: 'Classic',
    transition: 'crossfade',
    defaultCameraMotion: 'pan_down',
    fontFamily: "'Times New Roman', serif",
    primaryColor: '#f1f5f9',
    accentColor: '#f59e0b',
    defaultAspectRatio: '9:16',
  },
];

export class StorageService {
  constructor() {
    this.seedDefaultsIfEmpty();
  }

  private seedDefaultsIfEmpty(): void {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(`${DB_PREFIX}projects`)) {
      // Seed initial demo project
      localStorage.setItem(`${DB_PREFIX}projects`, JSON.stringify([DEMO_PROJECT]));
      localStorage.setItem(`${DB_PREFIX}story_${DEMO_PROJECT.id}`, JSON.stringify(DEMO_STORY));
      localStorage.setItem(`${DB_PREFIX}storybible_${DEMO_PROJECT.id}`, JSON.stringify(DEMO_STORY_BIBLE));
      localStorage.setItem(`${DB_PREFIX}characters_${DEMO_PROJECT.id}`, JSON.stringify(DEMO_CHARACTERS));
      localStorage.setItem(`${DB_PREFIX}locations_${DEMO_PROJECT.id}`, JSON.stringify(DEMO_LOCATIONS));
      localStorage.setItem(`${DB_PREFIX}episodes_${DEMO_PROJECT.id}`, JSON.stringify(DEMO_EPISODES));
      localStorage.setItem(`${DB_PREFIX}settings`, JSON.stringify(INITIAL_SETTINGS));
      localStorage.setItem(`${DB_PREFIX}ai_providers`, JSON.stringify(INITIAL_AI_PROVIDERS));
      localStorage.setItem(`${DB_PREFIX}publishing_accounts`, JSON.stringify(INITIAL_PUBLISHING_ACCOUNTS));
      localStorage.setItem(`${DB_PREFIX}publishing_jobs`, JSON.stringify([]));
      localStorage.setItem(`${DB_PREFIX}templates`, JSON.stringify(INITIAL_TEMPLATES));
      localStorage.setItem(`${DB_PREFIX}logs`, JSON.stringify([
        {
          id: 'log-1',
          timestamp: Date.now() - 3600000,
          level: 'INFO',
          category: 'SYSTEM',
          message: 'StoryForge AI Core Engine initialized successfully.',
        },
        {
          id: 'log-2',
          timestamp: Date.now() - 3500000,
          level: 'INFO',
          category: 'DATABASE',
          message: 'Seeded built-in demonstration project: "The Mystery Door".',
        },
      ]));
    }
  }

  // --- Projects ---
  async getProjects(): Promise<Project[]> {
    if (window.electronAPI?.db) return window.electronAPI.db.getProjects();
    const raw = localStorage.getItem(`${DB_PREFIX}projects`);
    return raw ? JSON.parse(raw) : [];
  }

  async saveProject(project: Project): Promise<void> {
    if (window.electronAPI?.db) return window.electronAPI.db.saveProject(project);
    const projects = await this.getProjects();
    const idx = projects.findIndex((p) => p.id === project.id);
    if (idx >= 0) projects[idx] = project;
    else projects.unshift(project);
    localStorage.setItem(`${DB_PREFIX}projects`, JSON.stringify(projects));
  }

  async deleteProject(id: string): Promise<void> {
    if (window.electronAPI?.db) return window.electronAPI.db.deleteProject(id);
    const projects = (await this.getProjects()).filter((p) => p.id !== id);
    localStorage.setItem(`${DB_PREFIX}projects`, JSON.stringify(projects));
    localStorage.removeItem(`${DB_PREFIX}story_${id}`);
    localStorage.removeItem(`${DB_PREFIX}storybible_${id}`);
    localStorage.removeItem(`${DB_PREFIX}characters_${id}`);
    localStorage.removeItem(`${DB_PREFIX}locations_${id}`);
    localStorage.removeItem(`${DB_PREFIX}episodes_${id}`);
  }

  // --- Story & Story Bible ---
  async getStory(projectId: string): Promise<Story | null> {
    if (window.electronAPI?.db) return window.electronAPI.db.getStory(projectId);
    const raw = localStorage.getItem(`${DB_PREFIX}story_${projectId}`);
    return raw ? JSON.parse(raw) : null;
  }

  async saveStory(story: Story): Promise<void> {
    if (window.electronAPI?.db) return window.electronAPI.db.saveStory(story);
    localStorage.setItem(`${DB_PREFIX}story_${story.projectId}`, JSON.stringify(story));
  }

  async getStoryBible(projectId: string): Promise<StoryBible | null> {
    if (window.electronAPI?.db) return window.electronAPI.db.getStoryBible(projectId);
    const raw = localStorage.getItem(`${DB_PREFIX}storybible_${projectId}`);
    return raw ? JSON.parse(raw) : null;
  }

  async saveStoryBible(bible: StoryBible): Promise<void> {
    if (window.electronAPI?.db) return window.electronAPI.db.saveStoryBible(bible);
    localStorage.setItem(`${DB_PREFIX}storybible_${bible.projectId}`, JSON.stringify(bible));
  }

  // --- Characters ---
  async getCharacters(projectId: string): Promise<Character[]> {
    if (window.electronAPI?.db) return window.electronAPI.db.getCharacters(projectId);
    const raw = localStorage.getItem(`${DB_PREFIX}characters_${projectId}`);
    return raw ? JSON.parse(raw) : [];
  }

  async saveCharacter(character: Character): Promise<void> {
    if (window.electronAPI?.db) return window.electronAPI.db.saveCharacter(character);
    const list = await this.getCharacters(character.projectId);
    const idx = list.findIndex((c) => c.id === character.id);
    if (idx >= 0) list[idx] = character;
    else list.push(character);
    localStorage.setItem(`${DB_PREFIX}characters_${character.projectId}`, JSON.stringify(list));
  }

  async deleteCharacter(projectId: string, id: string): Promise<void> {
    if (window.electronAPI?.db) return window.electronAPI.db.deleteCharacter(id);
    const list = (await this.getCharacters(projectId)).filter((c) => c.id !== id);
    localStorage.setItem(`${DB_PREFIX}characters_${projectId}`, JSON.stringify(list));
  }

  // --- Locations ---
  async getLocations(projectId: string): Promise<Location[]> {
    if (window.electronAPI?.db) return window.electronAPI.db.getLocations(projectId);
    const raw = localStorage.getItem(`${DB_PREFIX}locations_${projectId}`);
    return raw ? JSON.parse(raw) : [];
  }

  async saveLocation(location: Location): Promise<void> {
    if (window.electronAPI?.db) return window.electronAPI.db.saveLocation(location);
    const list = await this.getLocations(location.projectId);
    const idx = list.findIndex((l) => l.id === location.id);
    if (idx >= 0) list[idx] = location;
    else list.push(location);
    localStorage.setItem(`${DB_PREFIX}locations_${location.projectId}`, JSON.stringify(list));
  }

  async deleteLocation(projectId: string, id: string): Promise<void> {
    if (window.electronAPI?.db) return window.electronAPI.db.deleteLocation(id);
    const list = (await this.getLocations(projectId)).filter((l) => l.id !== id);
    localStorage.setItem(`${DB_PREFIX}locations_${projectId}`, JSON.stringify(list));
  }

  // --- Episodes ---
  async getEpisodes(projectId: string): Promise<Episode[]> {
    if (window.electronAPI?.db) return window.electronAPI.db.getEpisodes(projectId);
    const raw = localStorage.getItem(`${DB_PREFIX}episodes_${projectId}`);
    return raw ? JSON.parse(raw) : [];
  }

  async saveEpisode(episode: Episode): Promise<void> {
    if (window.electronAPI?.db) return window.electronAPI.db.saveEpisode(episode);
    const list = await this.getEpisodes(episode.projectId);
    const idx = list.findIndex((e) => e.id === episode.id);
    if (idx >= 0) list[idx] = episode;
    else list.push(episode);
    localStorage.setItem(`${DB_PREFIX}episodes_${episode.projectId}`, JSON.stringify(list));
  }

  async deleteEpisode(projectId: string, id: string): Promise<void> {
    if (window.electronAPI?.db) return window.electronAPI.db.deleteEpisode(id);
    const list = (await this.getEpisodes(projectId)).filter((e) => e.id !== id);
    localStorage.setItem(`${DB_PREFIX}episodes_${projectId}`, JSON.stringify(list));
  }

  // --- Settings & AI Providers ---
  async getSettings(): Promise<AppSettings> {
    if (window.electronAPI?.db) return window.electronAPI.db.getSettings();
    const raw = localStorage.getItem(`${DB_PREFIX}settings`);
    return raw ? { ...INITIAL_SETTINGS, ...JSON.parse(raw) } : INITIAL_SETTINGS;
  }

  async saveSettings(settings: Partial<AppSettings>): Promise<void> {
    if (window.electronAPI?.db) return window.electronAPI.db.saveSettings(settings);
    const current = await this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(`${DB_PREFIX}settings`, JSON.stringify(updated));
  }

  async getAIProviders(): Promise<AIProviderConfig[]> {
    if (window.electronAPI?.db) return window.electronAPI.db.getAIProviders();
    const raw = localStorage.getItem(`${DB_PREFIX}ai_providers`);
    return raw ? JSON.parse(raw) : INITIAL_AI_PROVIDERS;
  }

  async saveAIProvider(provider: AIProviderConfig): Promise<void> {
    if (window.electronAPI?.db) return window.electronAPI.db.saveAIProvider(provider);
    const list = await this.getAIProviders();
    const idx = list.findIndex((p) => p.id === provider.id);
    if (idx >= 0) list[idx] = provider;
    else list.push(provider);
    localStorage.setItem(`${DB_PREFIX}ai_providers`, JSON.stringify(list));
  }

  // --- Publishing Accounts & Jobs ---
  async getPublishingAccounts(): Promise<PublishingAccount[]> {
    if (window.electronAPI?.db) return window.electronAPI.db.getPublishingAccounts();
    const raw = localStorage.getItem(`${DB_PREFIX}publishing_accounts`);
    return raw ? JSON.parse(raw) : INITIAL_PUBLISHING_ACCOUNTS;
  }

  async savePublishingAccount(account: PublishingAccount): Promise<void> {
    if (window.electronAPI?.db) return window.electronAPI.db.savePublishingAccount(account);
    const list = await this.getPublishingAccounts();
    const idx = list.findIndex((a) => a.id === account.id || a.platform === account.platform);
    if (idx >= 0) list[idx] = account;
    else list.push(account);
    localStorage.setItem(`${DB_PREFIX}publishing_accounts`, JSON.stringify(list));
  }

  async getPublishingJobs(): Promise<PublishingJob[]> {
    if (window.electronAPI?.db) return window.electronAPI.db.getPublishingJobs();
    const raw = localStorage.getItem(`${DB_PREFIX}publishing_jobs`);
    return raw ? JSON.parse(raw) : [];
  }

  async savePublishingJob(job: PublishingJob): Promise<void> {
    if (window.electronAPI?.db) return window.electronAPI.db.savePublishingJob(job);
    const list = await this.getPublishingJobs();
    const idx = list.findIndex((j) => j.id === job.id);
    if (idx >= 0) list[idx] = job;
    else list.unshift(job);
    localStorage.setItem(`${DB_PREFIX}publishing_jobs`, JSON.stringify(list));
  }

  // --- Logging ---
  async getLogs(): Promise<LogEntry[]> {
    if (window.electronAPI?.db) return window.electronAPI.db.getLogs();
    const raw = localStorage.getItem(`${DB_PREFIX}logs`);
    return raw ? JSON.parse(raw) : [];
  }

  async addLog(level: 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG', category: string, message: string, metadata?: Record<string, unknown>): Promise<void> {
    if (window.electronAPI?.db) return window.electronAPI.db.addLog(level, category, message, metadata);
    const logs = await this.getLogs();
    const entry: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      level,
      category,
      message,
      metadata,
    };
    logs.unshift(entry);
    // Keep max 200 logs
    if (logs.length > 200) logs.pop();
    localStorage.setItem(`${DB_PREFIX}logs`, JSON.stringify(logs));
  }

  async clearLogs(): Promise<void> {
    if (window.electronAPI?.db) return window.electronAPI.db.clearLogs();
    localStorage.setItem(`${DB_PREFIX}logs`, JSON.stringify([]));
  }
}

export const storage = new StorageService();
