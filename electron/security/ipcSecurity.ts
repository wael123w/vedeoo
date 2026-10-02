import path from 'path';

// Allowed IPC channel names
export const ALLOWED_IPC_CHANNELS = new Set([
  'db:getProjects',
  'db:saveProject',
  'db:deleteProject',
  'db:getStory',
  'db:saveStory',
  'db:getStoryBible',
  'db:saveStoryBible',
  'db:getCharacters',
  'db:saveCharacter',
  'db:deleteCharacter',
  'db:getLocations',
  'db:saveLocation',
  'db:deleteLocation',
  'db:getEpisodes',
  'db:saveEpisode',
  'db:deleteEpisode',
  'db:getSettings',
  'db:saveSettings',
  'db:getAIProviders',
  'db:saveAIProvider',
  'db:getPublishingAccounts',
  'db:savePublishingAccount',
  'db:getPublishingJobs',
  'db:savePublishingJob',
  'db:getLogs',
  'db:addLog',
  'db:clearLogs',
  'ffmpeg:checkInstallation',
  'ffmpeg:renderVideo',
  'ffmpeg:cancelRender',
  'ai:testConnection',
  'ai:analyzeStory',
  'ai:splitEpisodes',
  'publishing:startOAuth',
  'publishing:publishEpisode',
  'window:minimize',
  'window:maximize',
  'window:close',
  'dialog:openFile',
  'dialog:openDirectory',
  'dialog:saveFile',
]);

/**
 * Validates that an IPC channel is strictly on the allowlist.
 */
export function validateIpcChannel(channel: string): boolean {
  return ALLOWED_IPC_CHANNELS.has(channel);
}

/**
 * Validates and normalizes safe local file paths, preventing path traversal attacks.
 */
export function sanitizeSafePath(baseWorkspace: string, userPath: string): string {
  const normalizedBase = path.resolve(baseWorkspace);
  const resolvedTarget = path.resolve(normalizedBase, userPath);

  if (!resolvedTarget.startsWith(normalizedBase)) {
    throw new Error('Access denied: Path traversal detected outside workspace directory');
  }

  return resolvedTarget;
}
