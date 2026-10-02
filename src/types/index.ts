// StoryForge AI - Core Type Definitions

export type AspectRatio = '9:16' | '16:9' | '1:1';
export type ProjectStatus = 'Draft' | 'Analyzing' | 'Episodes Ready' | 'Generating' | 'Rendering' | 'Ready' | 'Publishing' | 'Completed' | 'Error';

export interface Project {
  id: string;
  name: string;
  description: string;
  genre: string;
  aspectRatio: AspectRatio;
  language: 'en' | 'ar' | string;
  targetDuration: number; // in seconds
  status: ProjectStatus;
  workspacePath?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Character {
  id: string;
  projectId: string;
  name: string;
  age: string;
  gender: string;
  personality: string;
  appearance: string;
  hair: string;
  eyes: string;
  clothing: string;
  importantTraits: string;
  characterPrompt: string;
  referenceImages: string[];
  voiceId?: string;
  notes?: string;
}

export interface Location {
  id: string;
  projectId: string;
  name: string;
  description: string;
  architecture: string;
  lighting: string;
  timeOfDay: string;
  atmosphere: string;
  referenceImages: string[];
  canonicalPrompt: string;
}

export interface StoryBible {
  projectId: string;
  title: string;
  genre: string;
  summary: string;
  chapters: { id: string; title: string; summary: string }[];
  characters?: Array<{
    name: string;
    age?: string;
    gender?: string;
    personality?: string;
    appearance?: string;
    hair?: string;
    eyes?: string;
    clothing?: string;
    importantTraits?: string;
    characterPrompt?: string;
  }>;
  locations?: Array<{
    name: string;
    description?: string;
    architecture?: string;
    lighting?: string;
    timeOfDay?: string;
    atmosphere?: string;
    canonicalPrompt?: string;
  }>;
  relationships: { character1: string; character2: string; relationship: string }[];
  objects: { name: string; description: string; significance: string }[];
  majorEvents: { id: string; description: string; chapterId?: string }[];
  timeline: { time: string; event: string }[];
  emotionalTone: string;
  storyArcs: string[];
  styleRules: string[];
}

export interface Story {
  id: string;
  projectId: string;
  rawText: string;
  title: string;
  genre: string;
  wordCount: number;
  analyzedAt?: number;
}

export type CameraMotion = 'static' | 'zoom_in' | 'zoom_out' | 'pan_left' | 'pan_right' | 'pan_up' | 'pan_down';
export type CameraAngle = 'wide' | 'medium' | 'close_up' | 'extreme_close_up' | 'low_angle' | 'high_angle' | 'dutch_angle';
export type TransitionType = 'cut' | 'fade' | 'crossfade' | 'zoom' | 'slide' | 'blur' | 'dip_to_black';

export interface Scene {
  id: string;
  episodeId: string;
  sceneNumber: number;
  duration: number; // in seconds
  narration: string;
  dialogue?: string;
  characterIds: string[];
  locationId?: string;
  visualPrompt: string;
  negativePrompt?: string;
  cameraMotion: CameraMotion;
  cameraAngle: CameraAngle;
  lighting: string;
  mood: string;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  soundEffects?: string[];
  subtitleText?: string;
  transition: TransitionType;
}

export interface SubtitleItem {
  id: string;
  sceneId?: string;
  startTime: number; // in seconds
  endTime: number;
  text: string;
}

export type SubtitleStyle = 'Classic' | 'Cinematic' | 'TikTok' | 'YouTube' | 'Minimal' | 'Bold' | 'Karaoke';

export interface SubtitleConfig {
  style: SubtitleStyle;
  fontFamily: string;
  fontSize: number; // in px
  primaryColor: string;
  highlightColor: string;
  strokeColor: string;
  strokeWidth: number;
  backgroundColor: string;
  position: 'bottom' | 'middle' | 'top';
  animation: 'none' | 'bounce' | 'fade' | 'pop' | 'typewriter';
  wordHighlight: boolean;
}

export interface Episode {
  id: string;
  projectId: string;
  episodeNumber: number;
  title: string;
  summary: string;
  hook: string;
  endingCta: string;
  nextEpisodeHook: string;
  targetDuration: number;
  estimatedDuration: number;
  musicSuggestion?: string;
  scenes: Scene[];
  subtitles: SubtitleItem[];
  renderedVideoUrl?: string;
  socialMetadata?: SocialMetadata;
  renderProgress?: number;
  isRendering?: boolean;
}

export interface SocialMetadata {
  id?: string;
  episodeId: string;
  tiktokCaption: string;
  instagramCaption: string;
  facebookCaption: string;
  youtubeTitle: string;
  youtubeDescription: string;
  hashtags: string[];
  keywords: string[];
  cta: string;
}

export interface BrandKit {
  logoUrl?: string;
  watermarkEnabled: boolean;
  watermarkPosition: 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right';
  watermarkOpacity: number;
  watermarkScale: number;
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  introUrl?: string;
  outroUrl?: string;
  defaultCta: string;
  socialHandle: string;
}

export interface VideoTemplate {
  id: string;
  name: string;
  description: string;
  genre: string;
  subtitleStyle: SubtitleStyle;
  transition: TransitionType;
  defaultCameraMotion: CameraMotion;
  fontFamily: string;
  primaryColor: string;
  accentColor: string;
  backgroundMusicUrl?: string;
  defaultAspectRatio: AspectRatio;
}

export interface TimelineTrackItem {
  id: string;
  trackId: 'video' | 'image' | 'voice' | 'music' | 'sfx' | 'subtitle';
  sceneId?: string;
  startTime: number;
  duration: number;
  title: string;
  mediaUrl?: string;
  volume?: number;
  isMuted?: boolean;
}

export type JobStatus = 'Pending' | 'Running' | 'Processing' | 'Completed' | 'Failed' | 'Cancelled';
export type JobType = 'StoryAnalysis' | 'EpisodeGeneration' | 'ImageGeneration' | 'VoiceGeneration' | 'VideoRendering' | 'SubtitleGeneration' | 'Upload' | 'Publishing';

export interface BackgroundJob {
  id: string;
  type: JobType;
  projectId: string;
  episodeId?: string;
  sceneId?: string;
  status: JobStatus;
  progress: number;
  title: string;
  details?: string;
  error?: string;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  retryCount: number;
}

export interface AIProviderConfig {
  id: string;
  name: string;
  type: 'google' | 'openai_compatible' | 'elevenlabs' | 'replicate';
  enabled: boolean;
  apiKey?: string;
  baseUrl?: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  lastTestedAt?: number;
  testStatus?: 'connected' | 'error';
  testMessage?: string;
  latencyMs?: number;
}

export interface AIUsageMetrics {
  totalRequests: number;
  imagesGenerated: number;
  audioSecondsGenerated: number;
  estimatedCostUsd: number;
}

export interface PublishingAccount {
  id: string;
  platform: 'youtube' | 'tiktok' | 'instagram' | 'facebook';
  accountName: string;
  accountId?: string;
  connected: boolean;
  connectedAt?: number;
  scopes: string[];
  tokenExpiry?: number;
  statusMessage?: string;
}

export interface PublishingJob {
  id: string;
  episodeId: string;
  projectId: string;
  platform: 'youtube' | 'tiktok' | 'instagram' | 'facebook';
  status: 'Pending' | 'Uploading' | 'Processing' | 'Published' | 'Failed' | 'Cancelled';
  scheduledTime?: number;
  publishedUrl?: string;
  error?: string;
  retryCount: number;
  title: string;
  caption: string;
  privacy: 'public' | 'unlisted' | 'private';
}

export interface AppSettings {
  language: 'en' | 'ar';
  theme: 'dark' | 'light';
  workspaceDir: string;
  ffmpegPath?: string;
  autoSaveIntervalSec: number;
  renderResolution: '720p' | '1080p' | '4k';
  renderFps: 30 | 60;
  duckingAmount: number; // 0 to 1
  firstRunCompleted: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG';
  category: string;
  message: string;
  metadata?: Record<string, unknown>;
}
