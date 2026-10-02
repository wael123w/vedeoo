import { Character, Location, StoryBible, Scene, Episode } from '../types';

export interface ContinuityContext {
  storyBible: StoryBible;
  characters: Character[];
  locations: Location[];
  previousEpisodeSummary?: string;
  currentEpisodeTitle?: string;
  nextEpisodeHook?: string;
}

/**
 * Builds the structured JSON prompt for deep story analysis.
 */
export function buildStoryAnalysisPrompt(rawStoryText: string): string {
  return `You are the master narrative analyst for StoryForge AI.
Analyze the following story or novel excerpt and produce an exhaustive, production-grade Story Bible in valid, strictly formatted JSON.

STORY TEXT:
"""
${rawStoryText}
"""

Output MUST be a single raw JSON object conforming strictly to this TypeScript schema:
{
  "title": string,
  "genre": string,
  "summary": string,
  "emotionalTone": string,
  "storyArcs": string[],
  "styleRules": string[],
  "chapters": [
    { "id": string, "title": string, "summary": string }
  ],
  "characters": [
    {
      "name": string,
      "age": string,
      "gender": string,
      "personality": string,
      "appearance": string,
      "hair": string,
      "eyes": string,
      "clothing": string,
      "importantTraits": string,
      "characterPrompt": string,
      "voiceId": string,
      "notes": string
    }
  ],
  "locations": [
    {
      "name": string,
      "description": string,
      "architecture": string,
      "lighting": string,
      "timeOfDay": string,
      "atmosphere": string,
      "canonicalPrompt": string
    }
  ],
  "relationships": [
    { "character1": string, "character2": string, "relationship": string }
  ],
  "objects": [
    { "name": string, "description": string, "significance": string }
  ],
  "majorEvents": [
    { "id": string, "description": string, "chapterId": string }
  ],
  "timeline": [
    { "time": string, "event": string }
  ]
}

DO NOT include backticks or markdown wraps. Return pure valid JSON only.`;
}

/**
 * Builds the prompt for splitting a story into coherent, cliffhanger-driven short-form video episodes.
 */
export function buildEpisodeSplitPrompt(
  storyText: string,
  context: ContinuityContext,
  options: {
    targetDuration: number;
    aspectRatio: string;
    language: string;
    hookEnabled?: boolean;
    ctaEnabled?: boolean;
  }
): string {
  return `You are the executive showrunner and pacing director for vertical video storytelling.
Split the provided story into a cohesive sequence of short-form video episodes (e.g. TikTok, Reels, Shorts).

CONSTRAINTS:
- Target Episode Duration: ${options.targetDuration} seconds
- Aspect Ratio: ${options.aspectRatio}
- Language: ${options.language}
- Do NOT split merely by word count! Split along natural dramatic scene boundaries, emotional turns, high-stakes dialogue, and cliffhangers.
- Each episode must have a high-retention 3-second HOOK at the start and a gripping cliffhanger or call-to-action at the finish.

CANONICAL STORY BIBLE:
Title: ${context.storyBible.title}
Genre: ${context.storyBible.genre}
Summary: ${context.storyBible.summary}
Tone: ${context.storyBible.emotionalTone}
Known Characters: ${context.characters.map((c) => `${c.name} (${c.appearance}, clothing: ${c.clothing})`).join('; ')}
Known Locations: ${context.locations.map((l) => `${l.name} (${l.lighting}, ${l.atmosphere})`).join('; ')}

RAW STORY TEXT:
"""
${storyText}
"""

Return a JSON array of episode objects conforming to this schema:
[
  {
    "episodeNumber": number,
    "title": string,
    "summary": string,
    "hook": string,
    "endingCta": string,
    "nextEpisodeHook": string,
    "targetDuration": number,
    "musicSuggestion": string,
    "scenes": [
      {
        "sceneNumber": number,
        "duration": number,
        "narration": string,
        "dialogue": string,
        "characterNames": string[],
        "locationName": string,
        "visualPrompt": string,
        "negativePrompt": string,
        "cameraMotion": "static" | "zoom_in" | "zoom_out" | "pan_left" | "pan_right" | "pan_up" | "pan_down",
        "cameraAngle": "wide" | "medium" | "close_up" | "extreme_close_up" | "low_angle" | "high_angle",
        "lighting": string,
        "mood": string,
        "transition": "cut" | "fade" | "crossfade" | "zoom" | "slide" | "blur" | "dip_to_black",
        "subtitleText": string
      }
    ]
  }
]

Pure JSON only, no markdown formatting.`;
}

/**
 * Builds the canonical image prompt guaranteeing Character & Location consistency.
 */
export function buildImagePrompt(
  scene: Partial<Scene>,
  characters: Character[],
  location?: Location,
  aspectRatio: string = '9:16'
): string {
  const involvedCharacters = characters.filter((c) => scene.characterIds?.includes(c.id));
  
  const charDescriptions = involvedCharacters
    .map((c) => `[Character: ${c.name}, ${c.age} y/o ${c.gender}, ${c.hair}, ${c.eyes}, wearing ${c.clothing}. ${c.appearance}]`)
    .join(' and ');

  const locDescription = location
    ? `[Setting: ${location.name}. Architecture: ${location.architecture}. Lighting: ${location.lighting}. Atmosphere: ${location.atmosphere}]`
    : (scene.locationId || 'Atmospheric cinematic set');

  const cameraSpecs = `Camera angle: ${scene.cameraAngle || 'medium shot'}, motion feel: ${scene.cameraMotion || 'cinematic'}, lighting: ${scene.lighting || 'dramatic volumetric'}.`;
  const moodSpecs = `Mood: ${scene.mood || 'intrigue'}, cinematic composition, 8k resolution, photorealistic, vivid colors, no artifacts.`;

  return `${scene.visualPrompt || ''}. Featuring: ${charDescriptions || 'the scene elements'}. In: ${locDescription}. ${cameraSpecs} ${moodSpecs} Aspect ratio: ${aspectRatio}.`;
}

/**
 * Builds the social media metadata prompt.
 */
export function buildSocialMetadataPrompt(episode: Episode, bible: StoryBible): string {
  return `Generate high-converting, viral social media metadata for Episode ${episode.episodeNumber}: "${episode.title}" of the story "${bible.title}".

EPISODE SUMMARY:
${episode.summary}

HOOK:
${episode.hook}

Generate a strictly valid JSON object with:
{
  "tiktokCaption": string (includes hook, engagement question, hashtags),
  "instagramCaption": string (rich storytelling caption, call to action, hashtags),
  "facebookCaption": string (engaging community style post),
  "youtubeTitle": string (punchy title under 70 chars with #Shorts),
  "youtubeDescription": string (detailed description, timestamps or cliffhanger, subscribe CTA),
  "hashtags": string[],
  "keywords": string[],
  "cta": string
}

Pure JSON only.`;
}
