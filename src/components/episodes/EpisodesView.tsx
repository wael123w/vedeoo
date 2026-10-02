import React, { useState } from 'react';
import {
  Clapperboard,
  Sparkles,
  Play,
  Film,
  Clock,
  Layers,
  Wand2,
  CheckCircle2,
  Trash2,
  ChevronRight,
  Flame,
  Volume2,
} from 'lucide-react';
import { useProjectStore } from '../../stores/useProjectStore';
import { useUIStore } from '../../stores/useUIStore';
import { useAIStore } from '../../stores/useAIStore';
import { aiClient } from '../../services/aiClient';

export const EpisodesView: React.FC = () => {
  const {
    activeProject,
    story,
    storyBible,
    characters,
    locations,
    episodes,
    setEpisodes,
    setActiveEpisodeId,
  } = useProjectStore();
  const { setActiveTab, addToast, t } = useUIStore();

  const [targetDuration, setTargetDuration] = useState<number>(activeProject?.targetDuration || 60);
  const [aspectRatio, setAspectRatio] = useState<string>(activeProject?.aspectRatio || '9:16');
  const [language, setLanguage] = useState<string>('English');
  const [narrationEnabled, setNarrationEnabled] = useState(true);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(true);
  const [hookEnabled, setHookEnabled] = useState(true);
  const [ctaEnabled, setCtaEnabled] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateEpisodes = async () => {
    if (!story?.rawText || !storyBible) {
      addToast('warning', 'Story Required', 'Please import and analyze your story before generating episodes.');
      setActiveTab('stories');
      return;
    }

    setIsGenerating(true);
    try {
      const generated = await aiClient.splitStoryIntoEpisodes(
        story.rawText,
        {
          storyBible,
          characters,
          locations,
        },
        {
          targetDuration,
          aspectRatio,
          language,
        }
      );

      await setEpisodes(generated);
      addToast('success', 'Episodes Generated', `Created ${generated.length} short-form video episodes.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      addToast('error', 'Generation Failed', msg);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Clapperboard className="w-5 h-5 text-sky-400" />
            {t('episodes.title')}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {t('episodes.subtitle')}
          </p>
        </div>
      </div>

      {/* Generator Configuration Panel */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="font-bold text-white text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            Pacing & Breakdown Parameters
          </div>
          <button
            onClick={handleGenerateEpisodes}
            disabled={isGenerating}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-sky-600/30 transition hover:scale-105 disabled:opacity-50"
          >
            <Wand2 className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Splitting Episodes...' : t('episodes.generate_episodes')}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Target Duration</label>
            <select
              value={targetDuration}
              onChange={(e) => setTargetDuration(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
            >
              <option value={30}>30 sec (Fast TikTok)</option>
              <option value={45}>45 sec (Reels Sweetspot)</option>
              <option value={60}>60 sec (YouTube Shorts)</option>
              <option value={90}>90 sec (Extended Arc)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Aspect Ratio</label>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
            >
              <option value="9:16">9:16 Vertical (TikTok/Reels)</option>
              <option value="16:9">16:9 Widescreen (YouTube)</option>
              <option value="1:1">1:1 Square (Instagram)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
            >
              <option value="English">English</option>
              <option value="Arabic">العربية (Arabic)</option>
            </select>
          </div>

          <div className="flex flex-col justify-end">
            <div className="flex items-center gap-3 pt-2">
              <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hookEnabled}
                  onChange={(e) => setHookEnabled(e.target.checked)}
                  className="rounded accent-sky-500"
                />
                <span>3s Hook</span>
              </label>
              <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ctaEnabled}
                  onChange={(e) => setCtaEnabled(e.target.checked)}
                  className="rounded accent-sky-500"
                />
                <span>Cliffhanger CTA</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Episodes List Cards */}
      <div className="space-y-4">
        {episodes.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800">
            <Clapperboard className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-white">No Episodes Generated Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Click &quot;Generate Episodes&quot; above to automatically split your story into cliffhanger-driven short-form video episodes.
            </p>
          </div>
        ) : (
          episodes.map((ep) => (
            <div
              key={ep.id}
              className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-lg space-y-4 hover:border-slate-700 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-sky-950 border border-sky-800 flex items-center justify-center font-mono font-bold text-sky-400 text-sm">
                    {String(ep.episodeNumber).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      {ep.title}
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                        {ep.scenes.length} Scenes • ~{ep.estimatedDuration}s
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{ep.summary}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveEpisodeId(ep.id);
                      setActiveTab('editor');
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow"
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>Open in Video Editor</span>
                  </button>
                </div>
              </div>

              {/* Hook & Cliffhanger summary strip */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-900/40 text-amber-200/90 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-400 text-[11px] uppercase tracking-wider">
                    <Flame className="w-3.5 h-3.5" />
                    Viral Hook (0-3s)
                  </div>
                  <div className="italic">&ldquo;{ep.hook}&rdquo;</div>
                </div>

                <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-900/40 text-indigo-200/90 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-indigo-400 text-[11px] uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    Cliffhanger & Next Hook
                  </div>
                  <div className="italic">&ldquo;{ep.nextEpisodeHook}&rdquo;</div>
                </div>
              </div>

              {/* Scene Timeline Thumbnails Preview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                {ep.scenes.map((scene) => (
                  <div
                    key={scene.id}
                    className="rounded-xl bg-slate-950 border border-slate-800/80 p-2.5 space-y-2 text-xs"
                  >
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-900">
                      {scene.imageUrl ? (
                        <img
                          src={scene.imageUrl}
                          alt={`Scene ${scene.sceneNumber}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 font-mono text-[10px]">
                          Generating Art
                        </div>
                      )}
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-black/80 text-white font-bold">
                        {scene.duration}s
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="font-bold text-white text-[11px] flex justify-between">
                        <span>Scene {scene.sceneNumber}</span>
                        <span className="text-sky-400 text-[10px] uppercase">{scene.cameraMotion}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                        {scene.narration}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
