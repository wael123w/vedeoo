import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Play,
  Copy,
  Trash2,
  Download,
  Upload,
  Layers,
  Sparkles,
  Check,
  X,
  FileCode,
} from 'lucide-react';
import { useProjectStore } from '../../stores/useProjectStore';
import { useUIStore } from '../../stores/useUIStore';

export const ProjectsView: React.FC = () => {
  const { projects, activeProject, selectProject, createProject, duplicateProject, deleteProject } = useProjectStore();
  const { setActiveTab, addToast } = useUIStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [genre, setGenre] = useState('Mystery & Supernatural');
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9' | '1:1'>('9:16');
  const [targetDuration, setTargetDuration] = useState(60);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    const newProj = await createProject(projectName.trim(), genre, targetDuration, aspectRatio);
    addToast('success', 'Project Created', `Created project "${newProj.name}"`);
    setModalOpen(false);
    setProjectName('');
    setActiveTab('stories');
  };

  const exportProjectJson = (projId: string) => {
    const proj = projects.find((p) => p.id === projId);
    if (!proj) return;
    const blob = new Blob([JSON.stringify(proj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${proj.name.replace(/\s+/g, '_')}_project.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('success', 'Project Exported', `Saved ${proj.name} project schema`);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-sky-400" />
            Project Workspaces & Novels
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your story repositories, episode timelines, and video configurations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-sky-600/30 transition hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>New Story Project</span>
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((proj) => {
          const isSelected = activeProject?.id === proj.id;
          return (
            <div
              key={proj.id}
              className={`rounded-2xl border transition-all p-5 flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 border-sky-500/80 shadow-lg shadow-sky-950/50'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-white leading-tight flex items-center gap-2">
                      {proj.name}
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                      )}
                    </h3>
                    <div className="text-xs text-sky-400 font-medium mt-0.5">{proj.genre}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                    {proj.aspectRatio}
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {proj.description || 'No description provided.'}
                </p>

                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                  <span>Folder: {proj.workspacePath}</span>
                  <span className="text-slate-300 font-bold">{proj.targetDuration}s</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    selectProject(proj.id);
                    setActiveTab('stories');
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                    isSelected
                      ? 'bg-sky-600 hover:bg-sky-500 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Open Studio</span>
                </button>

                <button
                  onClick={() => exportProjectJson(proj.id)}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white"
                  title="Export project JSON"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    duplicateProject(proj.id);
                    addToast('info', 'Project Duplicated', proj.name);
                  }}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white"
                  title="Duplicate project"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>

                {proj.id !== 'demo-mystery-door' && (
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to permanently delete "${proj.name}"?`)) {
                        deleteProject(proj.id);
                        addToast('warning', 'Project Deleted', proj.name);
                      }
                    }}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 border border-slate-800 text-slate-400 hover:text-rose-400"
                    title="Delete project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Project Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                Create New Story Project
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Story / Novel Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Whispers of the Chronos Clock"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Genre & Sub-genre</label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="Mystery & Supernatural">Mystery & Supernatural</option>
                  <option value="Sci-Fi & Cyberpunk">Sci-Fi & Cyberpunk</option>
                  <option value="Dark Fantasy & Lore">Dark Fantasy & Lore</option>
                  <option value="Historical Fiction">Historical Fiction</option>
                  <option value="Horror & Psychological Thriller">Horror & Psychological Thriller</option>
                  <option value="Reddit / Creepypasta Story">Reddit / Creepypasta Story</option>
                  <option value="Romance & Drama">Romance & Drama</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Aspect Ratio</label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['9:16', '16:9', '1:1'] as const).map((ratio) => (
                      <button
                        type="button"
                        key={ratio}
                        onClick={() => setAspectRatio(ratio)}
                        className={`py-1.5 px-2 rounded-lg border text-center font-mono text-[11px] font-bold transition ${
                          aspectRatio === ratio
                            ? 'border-sky-500 bg-sky-950/60 text-sky-300'
                            : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Target Episode Duration</label>
                  <select
                    value={targetDuration}
                    onChange={(e) => setTargetDuration(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value={30}>30 Seconds (Fast)</option>
                    <option value={45}>45 Seconds (Optimal)</option>
                    <option value={60}>60 Seconds (Full Short)</option>
                    <option value={90}>90 Seconds (Deep Arc)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg text-[11px] text-slate-400">
                A localized Windows workspace folder will be created under <code className="text-sky-300">StoryForgeProjects/</code> with subfolders for story bible, characters, locations, episodes, and MP4 renders.
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow-md shadow-sky-600/30"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
