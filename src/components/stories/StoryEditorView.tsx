import React, { useState } from 'react';
import {
  PenTool,
  Upload,
  Sparkles,
  BookOpen,
  Layers,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Wand2,
  ArrowRight,
} from 'lucide-react';
import { useProjectStore } from '../../stores/useProjectStore';
import { useUIStore } from '../../stores/useUIStore';
import { useAIStore } from '../../stores/useAIStore';
import { aiClient } from '../../services/aiClient';
import { storage } from '../../services/storage';

export const StoryEditorView: React.FC = () => {
  const { activeProject, story, updateStory, setStoryBible, characters, locations, episodes } = useProjectStore();
  const { setActiveTab, addToast, t } = useUIStore();

  const [rawText, setRawText] = useState(story?.rawText || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState('');

  // Keep state synced when switching projects
  React.useEffect(() => {
    if (story) {
      setRawText(story.rawText || '');
    }
  }, [story]);

  const wordCount = rawText.trim() ? rawText.trim().split(/\s+/).length : 0;
  const charCount = rawText.length;
  const estimatedReadMin = Math.max(1, Math.round(wordCount / 200));

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setRawText(val);
    updateStory(val);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawText(content);
      updateStory(content, file.name.replace(/\.[^/.]+$/, ''));
      addToast('success', 'Story Imported', `Loaded ${file.name} (${content.split(/\s+/).length} words)`);
    };
    reader.readAsText(file);
  };

  const handleAnalyzeStory = async () => {
    if (!rawText.trim() || rawText.trim().length < 20) {
      addToast('warning', 'Story Too Short', 'Please enter at least a few sentences to analyze narrative arcs.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress('Analyzing characters, tone, and timeline arcs...');

    try {
      const bible = await aiClient.analyzeStory(rawText);

      if (activeProject) {
        bible.projectId = activeProject.id;
        await setStoryBible(bible);

        // Also populate detected characters & locations automatically
        if (bible.characters && bible.characters.length > 0) {
          for (const c of bible.characters) {
            await storage.saveCharacter({
              id: `char-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              projectId: activeProject.id,
              name: c.name,
              age: c.age || 'Unknown',
              gender: c.gender || 'Unknown',
              personality: c.personality || 'Complex',
              appearance: c.appearance || '',
              hair: c.hair || '',
              eyes: c.eyes || '',
              clothing: c.clothing || '',
              importantTraits: c.importantTraits || '',
              characterPrompt: c.characterPrompt || `${c.name}, highly detailed portrait`,
              referenceImages: [],
            });
          }
        }

        if (bible.locations && bible.locations.length > 0) {
          for (const l of bible.locations) {
            await storage.saveLocation({
              id: `loc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              projectId: activeProject.id,
              name: l.name,
              description: l.description || '',
              architecture: l.architecture || '',
              lighting: l.lighting || 'Cinematic',
              timeOfDay: l.timeOfDay || 'Atmospheric',
              atmosphere: l.atmosphere || '',
              referenceImages: [],
              canonicalPrompt: l.canonicalPrompt || `${l.name} background, atmospheric cinematic set`,
            });
          }
        }
      }

      addToast('success', 'Story Bible Generated', `Extracted ${bible.chapters?.length || 0} chapters and narrative arcs.`);
      setActiveTab('bible');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      addToast('error', 'Analysis Failed', msg);
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress('');
    }
  };

  if (!activeProject) {
    return (
      <div className="p-12 text-center text-slate-400 space-y-4">
        <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">No Active Project Selected</h2>
        <p className="text-xs max-w-sm mx-auto">
          Please select or create a project from the top bar to start writing or importing your story.
        </p>
        <button
          onClick={() => setActiveTab('projects')}
          className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs"
        >
          View Projects
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4 max-w-7xl mx-auto h-[calc(100vh-3.5rem)] flex flex-col overflow-hidden">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <PenTool className="w-5 h-5 text-sky-400" />
            {t('story.title')}
          </h1>
          <p className="text-xs text-slate-400">
            {activeProject.name} • {activeProject.genre}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* File Upload Button */}
          <label className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition shadow-xs">
            <Upload className="w-3.5 h-3.5 text-sky-400" />
            <span>{t('story.import_file')}</span>
            <input
              type="file"
              accept=".txt,.md,.docx,.pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Analyze Story Action */}
          <button
            onClick={handleAnalyzeStory}
            disabled={isAnalyzing || !rawText.trim()}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-sky-600/30 transition hover:scale-105"
          >
            <Wand2 className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? t('story.analyzing') : t('story.analyze_btn')}</span>
          </button>
        </div>
      </div>

      {/* Analysis Banner if in progress */}
      {isAnalyzing && (
        <div className="p-3 bg-sky-950/60 border border-sky-800 rounded-xl flex items-center gap-3 text-xs text-sky-300 animate-pulse shrink-0">
          <Sparkles className="w-4 h-4 text-sky-400 animate-spin" />
          <span>{analysisProgress}</span>
        </div>
      )}

      {/* Live Text Area Editor */}
      <div className="flex-1 flex flex-col rounded-2xl bg-slate-950 border border-slate-800 shadow-inner overflow-hidden min-h-0">
        <textarea
          value={rawText}
          onChange={handleTextChange}
          placeholder={t('story.input_placeholder')}
          className="flex-1 w-full bg-transparent p-6 text-slate-200 text-sm leading-relaxed resize-none focus:outline-none placeholder-slate-600 font-sans overflow-y-auto selection:bg-sky-500/30 selection:text-white"
        />

        {/* Footer Metrics */}
        <div className="h-10 bg-slate-900/90 border-t border-slate-800/80 px-4 flex items-center justify-between text-xs text-slate-400 font-mono shrink-0">
          <div className="flex items-center gap-4">
            <span>
              <strong className="text-slate-200">{wordCount}</strong> {t('story.stats_words')}
            </span>
            <span>
              <strong className="text-slate-200">{charCount}</strong> {t('story.stats_chars')}
            </span>
            <span className="hidden sm:inline">
              <strong className="text-slate-200">~{estimatedReadMin}</strong> {t('story.stats_reading_time')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Autosaved locally</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
