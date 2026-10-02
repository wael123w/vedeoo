-- StoryForge AI SQLite Database Schema & Migrations

PRAGMA foreign_keys = ON;

-- 1. Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  genre TEXT NOT NULL,
  aspect_ratio TEXT DEFAULT '9:16',
  language TEXT DEFAULT 'en',
  target_duration INTEGER DEFAULT 60,
  status TEXT DEFAULT 'Draft',
  workspace_path TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- 2. Stories Table
CREATE TABLE IF NOT EXISTS stories (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  raw_text TEXT NOT NULL,
  title TEXT,
  genre TEXT,
  word_count INTEGER DEFAULT 0,
  analyzed_at INTEGER
);

-- 3. Characters Table
CREATE TABLE IF NOT EXISTS characters (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age TEXT,
  gender TEXT,
  personality TEXT,
  appearance TEXT,
  hair TEXT,
  eyes TEXT,
  clothing TEXT,
  important_traits TEXT,
  character_prompt TEXT NOT NULL,
  reference_images TEXT, -- JSON array of file paths
  voice_id TEXT,
  notes TEXT
);

-- 4. Locations Table
CREATE TABLE IF NOT EXISTS locations (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  architecture TEXT,
  lighting TEXT,
  time_of_day TEXT,
  atmosphere TEXT,
  reference_images TEXT, -- JSON array of file paths
  canonical_prompt TEXT NOT NULL
);

-- 5. Episodes Table
CREATE TABLE IF NOT EXISTS episodes (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  episode_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  hook TEXT,
  ending_cta TEXT,
  next_episode_hook TEXT,
  target_duration INTEGER DEFAULT 60,
  estimated_duration INTEGER DEFAULT 60,
  music_suggestion TEXT,
  rendered_video_url TEXT
);

-- 6. Scenes Table
CREATE TABLE IF NOT EXISTS scenes (
  id TEXT PRIMARY KEY,
  episode_id TEXT NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  scene_number INTEGER NOT NULL,
  duration INTEGER DEFAULT 8,
  narration TEXT NOT NULL,
  dialogue TEXT,
  character_ids TEXT, -- JSON array
  location_id TEXT REFERENCES locations(id),
  visual_prompt TEXT NOT NULL,
  negative_prompt TEXT,
  camera_motion TEXT DEFAULT 'zoom_in',
  camera_angle TEXT DEFAULT 'medium',
  lighting TEXT,
  mood TEXT,
  image_url TEXT,
  video_url TEXT,
  audio_url TEXT,
  transition TEXT DEFAULT 'crossfade',
  subtitle_text TEXT
);

-- 7. Media Assets Table
CREATE TABLE IF NOT EXISTS media_assets (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- image, video, font
  file_path TEXT NOT NULL,
  filename TEXT NOT NULL,
  size_bytes INTEGER,
  created_at INTEGER NOT NULL
);

-- 8. Audio Assets Table
CREATE TABLE IF NOT EXISTS audio_assets (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- narration, music, sfx
  file_path TEXT NOT NULL,
  duration_sec REAL,
  created_at INTEGER NOT NULL
);

-- 9. Templates Table
CREATE TABLE IF NOT EXISTS templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  genre TEXT,
  subtitle_style TEXT,
  transition TEXT,
  default_camera_motion TEXT,
  font_family TEXT,
  primary_color TEXT,
  accent_color TEXT
);

-- 10. Render Jobs Table
CREATE TABLE IF NOT EXISTS render_jobs (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  episode_id TEXT REFERENCES episodes(id),
  status TEXT NOT NULL, -- Pending, Running, Completed, Failed, Cancelled
  progress INTEGER DEFAULT 0,
  output_file TEXT,
  created_at INTEGER NOT NULL,
  completed_at INTEGER,
  error TEXT
);

-- 11. Publishing Accounts Table
CREATE TABLE IF NOT EXISTS publishing_accounts (
  id TEXT PRIMARY KEY,
  platform TEXT NOT NULL, -- youtube, tiktok, instagram, facebook
  account_name TEXT NOT NULL,
  account_id TEXT,
  connected INTEGER DEFAULT 0,
  scopes TEXT,
  token_expiry INTEGER,
  status_message TEXT
);

-- 12. Publishing Jobs Table
CREATE TABLE IF NOT EXISTS publishing_jobs (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  episode_id TEXT REFERENCES episodes(id),
  platform TEXT NOT NULL,
  status TEXT NOT NULL, -- Pending, Uploading, Processing, Published, Failed, Cancelled
  scheduled_time INTEGER,
  published_url TEXT,
  title TEXT,
  caption TEXT,
  privacy TEXT DEFAULT 'public',
  retry_count INTEGER DEFAULT 0,
  error TEXT
);

-- 13. AI Providers Table
CREATE TABLE IF NOT EXISTS ai_providers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  enabled INTEGER DEFAULT 1,
  api_key_encrypted TEXT,
  base_url TEXT,
  model TEXT NOT NULL,
  temperature REAL DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 4096
);

-- 14. Settings Table
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- 15. Logs Table
CREATE TABLE IF NOT EXISTS logs (
  id TEXT PRIMARY KEY,
  timestamp INTEGER NOT NULL,
  level TEXT NOT NULL,
  category TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata TEXT
);
