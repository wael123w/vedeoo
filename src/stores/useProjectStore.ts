import { create } from 'zustand';
import { Project, Story, StoryBible, Character, Location, Episode, Scene } from '../types';
import { storage } from '../services/storage';

interface ProjectState {
  projects: Project[];
  activeProject: Project | null;
  story: Story | null;
  storyBible: StoryBible | null;
  characters: Character[];
  locations: Location[];
  episodes: Episode[];
  activeEpisodeId: string | null;
  saveStatus: 'saved' | 'saving' | 'unsaved';
  history: Array<{ bible: StoryBible | null; episodes: Episode[] }>;
  historyIndex: number;

  // Actions
  loadProjects: () => Promise<void>;
  selectProject: (projectId: string) => Promise<void>;
  createProject: (name: string, genre: string, targetDuration?: number, aspectRatio?: '9:16' | '16:9' | '1:1') => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  duplicateProject: (id: string) => Promise<void>;

  updateStory: (text: string, title?: string, genre?: string) => Promise<void>;
  setStoryBible: (bible: StoryBible) => Promise<void>;
  updateStoryBible: (patch: Partial<StoryBible>) => Promise<void>;

  addCharacter: (character: Omit<Character, 'id' | 'projectId'>) => Promise<Character>;
  updateCharacter: (character: Character) => Promise<void>;
  deleteCharacter: (id: string) => Promise<void>;

  addLocation: (location: Omit<Location, 'id' | 'projectId'>) => Promise<Location>;
  updateLocation: (location: Location) => Promise<void>;
  deleteLocation: (id: string) => Promise<void>;

  setEpisodes: (episodes: Episode[]) => Promise<void>;
  setActiveEpisodeId: (id: string | null) => void;
  updateEpisode: (episode: Episode) => Promise<void>;
  updateScene: (episodeId: string, scene: Scene) => Promise<void>;
  deleteScene: (episodeId: string, sceneId: string) => Promise<void>;
  addScene: (episodeId: string, afterSceneNumber?: number) => Promise<void>;

  undo: () => void;
  redo: () => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  activeProject: null,
  story: null,
  storyBible: null,
  characters: [],
  locations: [],
  episodes: [],
  activeEpisodeId: null,
  saveStatus: 'saved',
  history: [],
  historyIndex: -1,

  loadProjects: async () => {
    const projects = await storage.getProjects();
    set({ projects });
    if (projects.length > 0 && !get().activeProject) {
      await get().selectProject(projects[0].id);
    }
  },

  selectProject: async (projectId: string) => {
    const projects = await storage.getProjects();
    const activeProject = projects.find((p) => p.id === projectId) || null;
    if (!activeProject) return;

    set({ saveStatus: 'saving' });
    const [story, storyBible, characters, locations, episodes] = await Promise.all([
      storage.getStory(projectId),
      storage.getStoryBible(projectId),
      storage.getCharacters(projectId),
      storage.getLocations(projectId),
      storage.getEpisodes(projectId),
    ]);

    set({
      activeProject,
      story,
      storyBible,
      characters,
      locations,
      episodes,
      activeEpisodeId: episodes.length > 0 ? episodes[0].id : null,
      saveStatus: 'saved',
      history: [{ bible: storyBible, episodes }],
      historyIndex: 0,
    });
  },

  createProject: async (name, genre, targetDuration = 60, aspectRatio = '9:16') => {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name,
      description: `Original story project in ${genre}`,
      genre,
      aspectRatio,
      language: 'en',
      targetDuration,
      status: 'Draft',
      workspacePath: `StoryForgeProjects/${name.replace(/[^a-zA-Z0-9_-]/g, '')}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await storage.saveProject(newProject);
    const projects = await storage.getProjects();
    set({ projects, activeProject: newProject });
    await get().selectProject(newProject.id);
    await storage.addLog('INFO', 'PROJECT', `Created new project: "${name}"`);
    return newProject;
  },

  deleteProject: async (id: string) => {
    await storage.deleteProject(id);
    const projects = await storage.getProjects();
    const nextActive = projects.length > 0 ? projects[0].id : null;
    set({ projects });
    if (nextActive) {
      await get().selectProject(nextActive);
    } else {
      set({
        activeProject: null,
        story: null,
        storyBible: null,
        characters: [],
        locations: [],
        episodes: [],
        activeEpisodeId: null,
      });
    }
  },

  duplicateProject: async (id: string) => {
    const projects = await storage.getProjects();
    const source = projects.find((p) => p.id === id);
    if (!source) return;

    const dupId = `proj-${Date.now()}`;
    const duplicated: Project = {
      ...source,
      id: dupId,
      name: `${source.name} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await storage.saveProject(duplicated);
    const [story, bible, chars, locs, eps] = await Promise.all([
      storage.getStory(id),
      storage.getStoryBible(id),
      storage.getCharacters(id),
      storage.getLocations(id),
      storage.getEpisodes(id),
    ]);

    if (story) await storage.saveStory({ ...story, id: `story-${Date.now()}`, projectId: dupId });
    if (bible) await storage.saveStoryBible({ ...bible, projectId: dupId });
    for (const c of chars) await storage.saveCharacter({ ...c, id: `char-${Date.now()}-${Math.random()}`, projectId: dupId });
    for (const l of locs) await storage.saveLocation({ ...l, id: `loc-${Date.now()}-${Math.random()}`, projectId: dupId });
    for (const e of eps) await storage.saveEpisode({ ...e, id: `ep-${Date.now()}-${Math.random()}`, projectId: dupId });

    await get().loadProjects();
    await get().selectProject(dupId);
  },

  updateStory: async (text: string, title?: string, genre?: string) => {
    const active = get().activeProject;
    if (!active) return;

    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    const story: Story = {
      id: get().story?.id || `story-${Date.now()}`,
      projectId: active.id,
      rawText: text,
      title: title || get().story?.title || active.name,
      genre: genre || get().story?.genre || active.genre,
      wordCount,
      analyzedAt: get().story?.analyzedAt,
    };

    set({ story, saveStatus: 'saving' });
    await storage.saveStory(story);
    set({ saveStatus: 'saved' });
  },

  setStoryBible: async (bible: StoryBible) => {
    const active = get().activeProject;
    if (!active) return;
    set({ storyBible: bible, saveStatus: 'saving' });
    await storage.saveStoryBible(bible);
    set({ saveStatus: 'saved' });
  },

  updateStoryBible: async (patch: Partial<StoryBible>) => {
    const current = get().storyBible;
    if (!current) return;
    const updated: StoryBible = { ...current, ...patch };
    set({ storyBible: updated, saveStatus: 'saving' });
    await storage.saveStoryBible(updated);
    set({ saveStatus: 'saved' });
  },

  addCharacter: async (data) => {
    const active = get().activeProject;
    if (!active) throw new Error('No active project');
    const character: Character = {
      ...data,
      id: `char-${Date.now()}`,
      projectId: active.id,
    };
    await storage.saveCharacter(character);
    const characters = [...get().characters, character];
    set({ characters });
    return character;
  },

  updateCharacter: async (character: Character) => {
    await storage.saveCharacter(character);
    const characters = get().characters.map((c) => (c.id === character.id ? character : c));
    set({ characters });
  },

  deleteCharacter: async (id: string) => {
    const active = get().activeProject;
    if (!active) return;
    await storage.deleteCharacter(active.id, id);
    const characters = get().characters.filter((c) => c.id !== id);
    set({ characters });
  },

  addLocation: async (data) => {
    const active = get().activeProject;
    if (!active) throw new Error('No active project');
    const location: Location = {
      ...data,
      id: `loc-${Date.now()}`,
      projectId: active.id,
    };
    await storage.saveLocation(location);
    const locations = [...get().locations, location];
    set({ locations });
    return location;
  },

  updateLocation: async (location: Location) => {
    await storage.saveLocation(location);
    const locations = get().locations.map((l) => (l.id === location.id ? location : l));
    set({ locations });
  },

  deleteLocation: async (id: string) => {
    const active = get().activeProject;
    if (!active) return;
    await storage.deleteLocation(active.id, id);
    const locations = get().locations.filter((l) => l.id !== id);
    set({ locations });
  },

  setEpisodes: async (episodes: Episode[]) => {
    const active = get().activeProject;
    if (!active) return;
    set({ episodes, activeEpisodeId: episodes[0]?.id || null, saveStatus: 'saving' });
    for (const ep of episodes) {
      await storage.saveEpisode(ep);
    }
    set({ saveStatus: 'saved' });
  },

  setActiveEpisodeId: (id: string | null) => {
    set({ activeEpisodeId: id });
  },

  updateEpisode: async (episode: Episode) => {
    await storage.saveEpisode(episode);
    const episodes = get().episodes.map((e) => (e.id === episode.id ? episode : e));
    set({ episodes });
  },

  updateScene: async (episodeId: string, scene: Scene) => {
    const episode = get().episodes.find((e) => e.id === episodeId);
    if (!episode) return;
    const scenes = episode.scenes.map((s) => (s.id === scene.id ? scene : s));
    const updatedEp: Episode = { ...episode, scenes };
    await get().updateEpisode(updatedEp);
  },

  deleteScene: async (episodeId: string, sceneId: string) => {
    const episode = get().episodes.find((e) => e.id === episodeId);
    if (!episode || episode.scenes.length <= 1) return;
    const scenes = episode.scenes
      .filter((s) => s.id !== sceneId)
      .map((s, idx) => ({ ...s, sceneNumber: idx + 1 }));
    const updatedEp: Episode = { ...episode, scenes };
    await get().updateEpisode(updatedEp);
  },

  addScene: async (episodeId: string, afterSceneNumber?: number) => {
    const episode = get().episodes.find((e) => e.id === episodeId);
    if (!episode) return;

    const insertIdx = afterSceneNumber !== undefined ? afterSceneNumber : episode.scenes.length;
    const newScene: Scene = {
      id: `sc-${Date.now()}`,
      episodeId,
      sceneNumber: insertIdx + 1,
      duration: 8,
      narration: 'New scene narration...',
      characterIds: [],
      visualPrompt: 'Cinematic visual composition, atmospheric lighting',
      cameraMotion: 'zoom_in',
      cameraAngle: 'medium',
      lighting: 'Dramatic high contrast lighting',
      mood: 'Intrigue',
      transition: 'crossfade',
      subtitleText: 'New scene narration...',
      imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" fill="%231e293b"><rect width="100%" height="100%"/><text x="540" y="960" fill="%2394a3b8" font-size="40" text-anchor="middle">NEW SCENE</text></svg>',
    };

    const newScenes = [...episode.scenes];
    newScenes.splice(insertIdx, 0, newScene);
    const reindexed = newScenes.map((s, idx) => ({ ...s, sceneNumber: idx + 1 }));
    await get().updateEpisode({ ...episode, scenes: reindexed });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      set({
        storyBible: prev.bible,
        episodes: prev.episodes,
        historyIndex: historyIndex - 1,
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      set({
        storyBible: next.bible,
        episodes: next.episodes,
        historyIndex: historyIndex + 1,
      });
    }
  },
}));
