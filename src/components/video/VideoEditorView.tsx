import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Film,
  Download,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Type,
  Camera,
  Layers,
  Wand2,
  Sliders,
  CheckCircle2,
  Share2,
  Music,
  Mic,
  Scissors,
  Eye,
  FileText,
} from 'lucide-react';
import { useProjectStore } from '../../stores/useProjectStore';
import { useUIStore } from '../../stores/useUIStore';
import { useQueueStore } from '../../stores/useQueueStore';
import { Scene, SubtitleStyle, CameraMotion, CameraAngle, TransitionType } from '../../types';
import { videoRenderer } from '../../services/videoRenderer';
import { subtitleEngine, SUBTITLE_STYLE_PRESETS } from '../../services/subtitleEngine';
import { ttsService } from '../../services/ttsService';

export const VideoEditorView: React.FC = () => {
  const {
    activeProject,
    episodes,
    activeEpisodeId,
    setActiveEpisodeId,
    updateEpisode,
    updateScene,
    deleteScene,
    addScene,
    characters,
    locations,
  } = useProjectStore();
  const { addToast, brandKit, t } = useUIStore();
  const { addJob, updateJob, activeRenderJob } = useQueueStore();

  const episode = episodes.find((e) => e.id === activeEpisodeId) || episodes[0];
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);

  // Video playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  // Subtitle styling state
  const [subtitleStyle, setSubtitleStyle] = useState<SubtitleStyle>('TikTok');
  const [wordHighlight, setWordHighlight] = useState(true);

  // Video rendering state
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderedBlobUrl, setRenderedBlobUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Total duration of current episode
  const totalDuration = episode?.scenes.reduce((acc, s) => acc + s.duration, 0) || 60;

  // Selected scene
  const activeScene = episode?.scenes.find((s) => s.id === selectedSceneId) || episode?.scenes[0];

  // Auto-select first scene if none selected
  useEffect(() => {
    if (episode && episode.scenes.length > 0 && !selectedSceneId) {
      setSelectedSceneId(episode.scenes[0].id);
    }
  }, [episode, selectedSceneId]);

  // Canvas Real-Time Preview Loop
  useEffect(() => {
    if (!canvasRef.current || !episode) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Find active scene at currentTime
    let offset = 0;
    let currentScene = episode.scenes[0];
    for (const sc of episode.scenes) {
      if (currentTime >= offset && currentTime < offset + sc.duration) {
        currentScene = sc;
        break;
      }
      offset += sc.duration;
    }

    const sceneTime = currentTime - offset;
    const sceneProgress = Math.min(1, Math.max(0, sceneTime / (currentScene?.duration || 1)));

    // Load and draw image with real Ken Burns motion
    const img = new Image();
    img.src = currentScene?.imageUrl || '';
    img.onload = () => {
      videoRenderer.drawKenBurns(ctx, img, currentScene, sceneProgress, canvas.width, canvas.height);

      // Burn-in subtitles according to active preset
      const preset = SUBTITLE_STYLE_PRESETS[subtitleStyle] || {};
      subtitleEngine.renderSubtitleToCanvas(
        ctx,
        episode.subtitles,
        currentTime,
        canvas.width,
        canvas.height,
        {
          style: subtitleStyle,
          fontFamily: preset.fontFamily || "'Plus Jakarta Sans', sans-serif",
          fontSize: 44,
          primaryColor: preset.primaryColor || '#ffffff',
          highlightColor: preset.highlightColor || '#facc15',
          strokeColor: preset.strokeColor || '#000000',
          strokeWidth: preset.strokeWidth || 6,
          backgroundColor: preset.backgroundColor || 'transparent',
          position: preset.position || 'bottom',
          animation: preset.animation || 'bounce',
          wordHighlight,
        }
      );
    };

    if (img.complete) {
      img.onload(new Event('load'));
    }
  }, [currentTime, episode, subtitleStyle, wordHighlight]);

  // Playback timer ticker
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    let lastTime = performance.now();
    const tick = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      setCurrentTime((prev) => {
        const next = prev + dt;
        if (next >= totalDuration) {
          setIsPlaying(false);
          return 0;
        }
        return next;
      });

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, totalDuration]);

  // Execute Real Video Rendering
  const handleRenderVideo = async () => {
    if (!episode || !activeProject) return;

    setIsRendering(true);
    setRenderProgress(5);
    const jobId = addJob('VideoRendering', activeProject.id, `Render Episode ${episode.episodeNumber}`, episode.id);

    try {
      const preset = SUBTITLE_STYLE_PRESETS[subtitleStyle] || {};
      const { videoBlob, videoUrl } = await videoRenderer.renderEpisode(episode, {
        resolution: '1080p',
        aspectRatio: (activeProject.aspectRatio as '9:16' | '16:9' | '1:1') || '9:16',
        fps: 30,
        brandKit,
        subtitleConfig: {
          style: subtitleStyle,
          fontFamily: preset.fontFamily || "'Plus Jakarta Sans', sans-serif",
          fontSize: 48,
          primaryColor: preset.primaryColor || '#ffffff',
          highlightColor: preset.highlightColor || '#facc15',
          strokeColor: preset.strokeColor || '#000000',
          strokeWidth: 6,
          backgroundColor: preset.backgroundColor || 'transparent',
          position: preset.position || 'bottom',
          animation: 'bounce',
          wordHighlight,
        },
        onProgress: (prog, status) => {
          setRenderProgress(prog);
          updateJob(jobId, { progress: prog, details: status });
        },
      });

      setRenderedBlobUrl(videoUrl);
      await updateEpisode({ ...episode, renderedVideoUrl: videoUrl });
      updateJob(jobId, { status: 'Completed', progress: 100 });
      addToast('success', 'Video Rendered!', `Episode ${episode.episodeNumber} is ready for export and publishing.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      updateJob(jobId, { status: 'Failed', error: msg });
      addToast('error', 'Render Error', msg);
    } finally {
      setIsRendering(false);
    }
  };

  const handleDownloadVideo = () => {
    if (!renderedBlobUrl) return;
    const a = document.createElement('a');
    a.href = renderedBlobUrl;
    a.download = `${activeProject?.name || 'Story'}_Episode_${episode?.episodeNumber || 1}.mp4`;
    a.click();
    addToast('success', 'Downloaded MP4', 'Video saved to your local downloads.');
  };

  const handleExportSRT = () => {
    if (!episode) return;
    const srt = subtitleEngine.exportToSRT(episode.subtitles);
    const blob = new Blob([srt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Episode_${episode.episodeNumber}_subtitles.srt`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('success', 'Exported SRT Subtitles', 'Synced subtitle file exported.');
  };

  if (!episode) {
    return (
      <div className="p-12 text-center text-slate-400">
        <Film className="w-12 h-12 mx-auto mb-2 text-slate-400" />
        <h2 className="text-base font-bold text-white">No Episodes Available</h2>
        <p className="text-xs">Create or generate episodes from the Episodes tab.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-slate-950">
      {/* Top Bar for Episode Selector & Render Actions */}
      <div className="h-12 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Film className="w-4 h-4 text-sky-400" />
          <select
            value={episode.id}
            onChange={(e) => setActiveEpisodeId(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-semibold"
          >
            {episodes.map((ep) => (
              <option key={ep.id} value={ep.id}>
                Episode {ep.episodeNumber}: {ep.title} ({ep.scenes.length} scenes)
              </option>
            ))}
          </select>
        </div>

        {/* Center / Right Action Controls */}
        <div className="flex items-center gap-2">
          {/* Export SRT */}
          <button
            onClick={handleExportSRT}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs text-slate-300 font-medium flex items-center gap-1.5"
            title="Export Synchronized Subtitles (SRT)"
          >
            <FileText className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Export SRT</span>
          </button>

          {/* Render Action */}
          <button
            onClick={handleRenderVideo}
            disabled={isRendering}
            className="px-3.5 py-1 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow shadow-sky-600/30 disabled:opacity-50"
          >
            <Film className={`w-3.5 h-3.5 ${isRendering ? 'animate-spin' : ''}`} />
            <span>{isRendering ? `Rendering ${renderProgress}%` : 'Render Video (1080x1920)'}</span>
          </button>

          {/* Download Final MP4 if rendered */}
          {renderedBlobUrl && (
            <button
              onClick={handleDownloadVideo}
              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export MP4</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace (Player Preview & Scene Inspector) */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left: Interactive Canvas Video Player Preview */}
        <div className="flex-1 bg-black/60 flex flex-col items-center justify-center p-4 relative min-w-0">
          <div className="relative h-[90%] aspect-[9/16] rounded-xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-950 flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={1080}
              height={1920}
              className="w-full h-full object-contain"
            />

            {/* Hover Floating Play / Pause Overlay */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition opacity-0 hover:opacity-100 group"
            >
              <div className="w-14 h-14 rounded-full bg-sky-500/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1 fill-current" />}
              </div>
            </button>
          </div>

          {/* Player Transport Bar */}
          <div className="w-full max-w-md mt-2 flex items-center justify-between gap-3 px-3 py-1.5 bg-slate-900/90 rounded-xl border border-slate-800 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-1 hover:text-white"
              >
                {isPlaying ? <Pause className="w-4 h-4 text-sky-400" /> : <Play className="w-4 h-4 fill-current text-sky-400" />}
              </button>
              <button
                onClick={() => setCurrentTime(0)}
                className="p-1 hover:text-white"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

            {/* Scrubber Range */}
            <input
              type="range"
              min={0}
              max={totalDuration}
              step={0.1}
              value={currentTime}
              onChange={(e) => setCurrentTime(Number(e.target.value))}
              className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />

            {/* Time readout */}
            <span className="font-mono text-[11px] text-slate-400">
              {currentTime.toFixed(1)}s / {totalDuration.toFixed(1)}s
            </span>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1 hover:text-white"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-slate-400" />}
            </button>
          </div>
        </div>

        {/* Right: Scene Editor & Inspector Panel */}
        <div className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col overflow-hidden shrink-0">
          {/* Subtitle Style Selector Tab */}
          <div className="p-3 border-b border-slate-800 space-y-2 bg-slate-950/60">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5 text-sky-400">
                <Type className="w-3.5 h-3.5" />
                Subtitle Typography & Burn-in
              </span>
              <label className="flex items-center gap-1 text-[11px] cursor-pointer text-slate-400">
                <input
                  type="checkbox"
                  checked={wordHighlight}
                  onChange={(e) => setWordHighlight(e.target.checked)}
                  className="rounded accent-sky-500"
                />
                <span>Word Pop</span>
              </label>
            </div>

            <div className="grid grid-cols-4 gap-1 text-[10px]">
              {(['TikTok', 'YouTube', 'Cinematic', 'Bold', 'Minimal', 'Karaoke', 'Classic'] as SubtitleStyle[]).map(
                (style) => (
                  <button
                    key={style}
                    onClick={() => setSubtitleStyle(style)}
                    className={`py-1 px-1.5 rounded font-semibold transition truncate ${
                      subtitleStyle === style
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {style}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Active Scene Controls */}
          {activeScene ? (
            <div className="p-4 overflow-y-auto flex-1 space-y-3.5 text-xs text-slate-300">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-white text-sm">Scene {activeScene.sceneNumber}</span>
                <div className="flex items-center gap-1">
                  <span className="text-slate-400 text-[11px]">Duration:</span>
                  <input
                    type="number"
                    min={2}
                    max={30}
                    value={activeScene.duration}
                    onChange={(e) => updateScene(episode.id, { ...activeScene, duration: Number(e.target.value) })}
                    className="w-12 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-center text-white font-mono"
                  />
                  <span className="text-slate-400">s</span>
                </div>
              </div>

              {/* Narration Script */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1 flex items-center justify-between">
                  <span>Narration Script</span>
                  <button
                    onClick={() => ttsService.speakPreview(activeScene.narration)}
                    className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-[10px]"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Audition Voice</span>
                  </button>
                </label>
                <textarea
                  rows={2}
                  value={activeScene.narration}
                  onChange={(e) => updateScene(episode.id, { ...activeScene, narration: e.target.value, subtitleText: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-xs leading-relaxed resize-none"
                />
              </div>

              {/* Camera Motion & Angle */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Ken Burns Motion</label>
                  <select
                    value={activeScene.cameraMotion}
                    onChange={(e) => updateScene(episode.id, { ...activeScene, cameraMotion: e.target.value as CameraMotion })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-white"
                  >
                    <option value="zoom_in">Zoom In (Push)</option>
                    <option value="zoom_out">Zoom Out (Pull)</option>
                    <option value="pan_left">Pan Left</option>
                    <option value="pan_right">Pan Right</option>
                    <option value="pan_down">Pan Down</option>
                    <option value="pan_up">Pan Up</option>
                    <option value="static">Static Camera</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Scene Transition</label>
                  <select
                    value={activeScene.transition}
                    onChange={(e) => updateScene(episode.id, { ...activeScene, transition: e.target.value as TransitionType })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-white"
                  >
                    <option value="crossfade">Crossfade</option>
                    <option value="dip_to_black">Dip to Black</option>
                    <option value="fade">Smooth Fade</option>
                    <option value="slide">Slide In</option>
                    <option value="cut">Hard Cut</option>
                  </select>
                </div>
              </div>

              {/* Visual Prompt */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Visual Art Prompt</label>
                <textarea
                  rows={3}
                  value={activeScene.visualPrompt}
                  onChange={(e) => updateScene(episode.id, { ...activeScene, visualPrompt: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono text-[11px] leading-relaxed resize-none"
                />
              </div>

              {/* Mood & Lighting */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="text-slate-400">Lighting</div>
                  <div className="text-slate-200 truncate font-medium">{activeScene.lighting}</div>
                </div>
                <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="text-slate-400">Mood</div>
                  <div className="text-slate-200 truncate font-medium">{activeScene.mood}</div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Bottom: Multi-Track Timeline */}
      <div className="h-44 bg-slate-950 border-t border-slate-800 flex flex-col shrink-0">
        <div className="h-8 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2 font-semibold text-slate-300">
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span>Multi-Track Timeline</span>
          </div>

          <button
            onClick={() => addScene(episode.id)}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-white text-[11px] flex items-center gap-1 font-medium"
          >
            <Plus className="w-3 h-3" />
            <span>Add Scene</span>
          </button>
        </div>

        {/* Tracks List */}
        <div className="flex-1 overflow-x-auto p-2 space-y-1.5 select-none font-mono text-[10px]">
          {/* Visual Track (Scenes) */}
          <div className="flex items-center gap-2 h-14">
            <div className="w-20 shrink-0 text-slate-400 text-right pr-2 font-semibold">SCENES</div>
            <div className="flex-1 flex gap-1.5 h-full">
              {episode.scenes.map((scene) => {
                const isSelected = selectedSceneId === scene.id;
                const widthPercent = (scene.duration / totalDuration) * 100;
                return (
                  <button
                    key={scene.id}
                    onClick={() => setSelectedSceneId(scene.id)}
                    style={{ width: `${Math.max(12, widthPercent)}%` }}
                    className={`h-full rounded-lg border flex flex-col justify-between p-1.5 text-left transition relative overflow-hidden ${
                      isSelected
                        ? 'bg-sky-950 border-sky-400 text-white shadow-md'
                        : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center font-bold text-[10px]">
                      <span>SC {scene.sceneNumber}</span>
                      <span>{scene.duration}s</span>
                    </div>
                    <div className="text-[9px] text-slate-400 truncate font-sans">
                      {scene.narration}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subtitle / Voice Track */}
          <div className="flex items-center gap-2 h-7">
            <div className="w-20 shrink-0 text-slate-400 text-right pr-2 text-[10px]">VOICE</div>
            <div className="flex-1 h-full bg-slate-900/60 rounded border border-slate-800/80 flex items-center px-2 text-indigo-300 text-[10px] truncate">
              <Mic className="w-3 h-3 mr-1 text-indigo-400 inline" />
              <span>Narration & Dialogue Waveform Active</span>
            </div>
          </div>

          {/* Music Track */}
          <div className="flex items-center gap-2 h-7">
            <div className="w-20 shrink-0 text-slate-400 text-right pr-2 text-[10px]">MUSIC</div>
            <div className="flex-1 h-full bg-slate-900/60 rounded border border-slate-800/80 flex items-center px-2 text-emerald-300 text-[10px] truncate">
              <Music className="w-3 h-3 mr-1 text-emerald-400 inline" />
              <span>{episode.musicSuggestion || 'Atmospheric Suspense Bed'} (Ducking: 35%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
