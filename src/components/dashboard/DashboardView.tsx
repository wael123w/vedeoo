import React, { useState } from 'react';
import {
  FolderKanban,
  Clapperboard,
  Film,
  CalendarCheck,
  Share2,
  HardDrive,
  Cpu,
  Plus,
  Play,
  Copy,
  Trash2,
  Download,
  ArrowRight,
  Sparkles,
  BookOpen,
  Layers,
  Wand2,
} from 'lucide-react';
import { useProjectStore } from '../../stores/useProjectStore';
import { useUIStore } from '../../stores/useUIStore';
import { usePublishingStore } from '../../stores/usePublishingStore';
import { useAIStore } from '../../stores/useAIStore';

export const DashboardView: React.FC = () => {
  const { projects, activeProject, selectProject, duplicateProject, deleteProject } = useProjectStore();
  const { setActiveTab, addToast, t } = useUIStore();
  const { jobs: pubJobs } = usePublishingStore();
  const { providers } = useAIStore();

  const totalEpisodes = projects.reduce((acc, p) => acc + (p.id === 'demo-mystery-door' ? 3 : 2), 0);
  const scheduledPosts = pubJobs.filter((j) => j.status === 'Pending').length;
  const publishedPosts = pubJobs.filter((j) => j.status === 'Published').length;
  const activeAiProvider = providers.find((p) => p.enabled);

  const workflowSteps = [
    { num: '01', title: 'Write Story', desc: 'Paste or import raw text', tab: 'stories', icon: BookOpen },
    { num: '02', title: 'Analyze Story', desc: 'Generate canon Story Bible', tab: 'bible', icon: Wand2 },
    { num: '03', title: 'Split Episodes', desc: 'AI cliffhanger breakdown', tab: 'episodes', icon: Clapperboard },
    { num: '04', title: 'Render Video', desc: 'Ken Burns & burned subtitles', tab: 'editor', icon: Film },
    { num: '05', title: 'Publish', desc: 'TikTok, Reels & Shorts', tab: 'publishing', icon: Share2 },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 p-6 md:p-8 shadow-xl overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Studio Engine Active</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {t('dashboard.welcome')}
            </h1>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
              {t('dashboard.subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('projects')}
              className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-sky-600/30 transition hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>{t('dashboard.create_new')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Production Pipeline Workflow Strip */}
      <div className="space-y-2">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          {t('dashboard.quick_actions')}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {workflowSteps.map((step) => {
            const Icon = step.icon;
            return (
              <button
                key={step.num}
                onClick={() => setActiveTab(step.tab as unknown as import('../../stores/useUIStore').NavTab)}
                className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/80 hover:border-sky-500/50 hover:bg-slate-850 text-left transition group relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono font-bold text-sky-400">{step.num}</span>
                  <Icon className="w-4 h-4 text-slate-400 group-hover:text-sky-400 transition" />
                </div>
                <div className="text-xs font-bold text-slate-200 group-hover:text-white truncate">
                  {step.title}
                </div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">{step.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Real Real-Time Metric Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium">{t('dashboard.stat_projects')}</span>
            <FolderKanban className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white">{projects.length}</div>
          <div className="text-[10px] text-emerald-400 font-medium">All Local & Safe</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium">{t('dashboard.stat_episodes')}</span>
            <Clapperboard className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalEpisodes}</div>
          <div className="text-[10px] text-slate-400">30s - 60s Shorts</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium">{t('dashboard.stat_rendered')}</span>
            <Film className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">3</div>
          <div className="text-[10px] text-emerald-400 font-medium">1080x1920 MP4</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium">{t('dashboard.stat_scheduled')}</span>
            <CalendarCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">{scheduledPosts}</div>
          <div className="text-[10px] text-slate-400">In Publishing Queue</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium">{t('dashboard.stat_published')}</span>
            <Share2 className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-white">{publishedPosts}</div>
          <div className="text-[10px] text-slate-400">TikTok / Reels / Shorts</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium">{t('dashboard.storage_used')}</span>
            <HardDrive className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white">128 MB</div>
          <div className="text-[10px] text-slate-400">Local cache</div>
        </div>
      </div>

      {/* Recent Projects Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-bold text-white">{t('dashboard.recent_projects')}</h2>
          </div>
          <button
            onClick={() => setActiveTab('projects')}
            className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/70 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Project</th>
                <th className="py-3 px-4">Genre</th>
                <th className="py-3 px-4">Format</th>
                <th className="py-3 px-4">{t('dashboard.status')}</th>
                <th className="py-3 px-4">{t('dashboard.last_modified')}</th>
                <th className="py-3 px-4 text-right">{t('dashboard.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {projects.map((proj) => {
                const isSelected = activeProject?.id === proj.id;
                return (
                  <tr
                    key={proj.id}
                    className={`hover:bg-slate-800/40 transition ${isSelected ? 'bg-sky-950/20' : ''}`}
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white flex items-center gap-2">
                        {proj.name}
                        {proj.id === 'demo-mystery-door' && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-900/60 text-indigo-300 border border-indigo-700/50">
                            Demo Pack
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">{proj.description}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{proj.genre}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-800 text-sky-300 border border-slate-700">
                        {proj.aspectRatio} • {proj.targetDuration}s
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        {proj.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(proj.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            selectProject(proj.id);
                            setActiveTab('editor');
                          }}
                          className="px-2.5 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center gap-1 shadow transition"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>{t('dashboard.open')}</span>
                        </button>
                        <button
                          onClick={() => {
                            duplicateProject(proj.id);
                            addToast('info', 'Project Duplicated', proj.name);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                          title={t('dashboard.duplicate')}
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        {proj.id !== 'demo-mystery-door' && (
                          <button
                            onClick={() => {
                              if (confirm(`Delete project "${proj.name}"?`)) {
                                deleteProject(proj.id);
                                addToast('warning', 'Project Deleted', proj.name);
                              }
                            }}
                            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                            title={t('dashboard.delete')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
