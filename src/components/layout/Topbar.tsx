import React, { useState } from 'react';
import {
  Sparkles,
  Save,
  Film,
  Wifi,
  WifiOff,
  Globe,
  Sun,
  Moon,
  HelpCircle,
  FolderOpen,
  Keyboard,
  Compass,
} from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';
import { useProjectStore } from '../../stores/useProjectStore';
import { useQueueStore } from '../../stores/useQueueStore';

export const Topbar: React.FC = () => {
  const { language, setLanguage, isRtl, theme, toggleTheme, setFirstRunOpen, t } = useUIStore();
  const { projects, activeProject, selectProject, saveStatus } = useProjectStore();
  const { activeRenderJob } = useQueueStore();
  const [showShortcuts, setShowShortcuts] = useState(false);

  return (
    <header className="h-14 bg-slate-900/90 backdrop-blur border-b border-slate-800 flex items-center justify-between px-4 z-30 select-none">
      {/* Left: Brand & Active Project Selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 font-extrabold text-lg tracking-tight bg-gradient-to-r from-sky-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="hidden sm:inline">StoryForge AI</span>
        </div>

        <div className="h-5 w-px bg-slate-700 mx-1 hidden sm:block" />

        {/* Project Selector Dropdown */}
        <div className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-slate-400 hidden sm:block" />
          <select
            value={activeProject?.id || ''}
            onChange={(e) => selectProject(e.target.value)}
            className="bg-slate-800/90 text-slate-200 text-xs sm:text-sm font-medium rounded-md px-2.5 py-1.5 border border-slate-700 hover:border-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-500 max-w-[200px] truncate"
          >
            {projects.length === 0 ? (
              <option value="">{t('topbar.no_project')}</option>
            ) : (
              projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.genre})
                </option>
              ))
            )}
          </select>
        </div>

        {/* Autosave Status */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400">
          <Save
            className={`w-3.5 h-3.5 ${
              saveStatus === 'saving'
                ? 'animate-spin text-amber-400'
                : saveStatus === 'saved'
                ? 'text-emerald-400'
                : 'text-slate-400'
            }`}
          />
          <span className="font-mono text-[11px]">
            {saveStatus === 'saving'
              ? t('topbar.saving')
              : saveStatus === 'saved'
              ? t('topbar.saved')
              : t('topbar.unsaved')}
          </span>
        </div>
      </div>

      {/* Center: Render Queue Banner if Active */}
      {activeRenderJob && (
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-sky-950/70 border border-sky-800/80 rounded-full text-xs text-sky-200 animate-pulse">
          <Film className="w-3.5 h-3.5 text-sky-400 animate-spin" />
          <span>Rendering: {activeRenderJob.title}</span>
          <span className="font-mono font-bold text-sky-400">{activeRenderJob.progress}%</span>
        </div>
      )}

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Online / Offline status */}
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800/70 border border-slate-700/60 text-[11px] text-slate-300">
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
          <span>{t('topbar.online')}</span>
        </div>

        {/* Language Toggle (EN / AR) */}
        <button
          onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition"
          title="Switch Language (العربية / English)"
        >
          <Globe className="w-3.5 h-3.5 text-sky-400" />
          <span>{language === 'en' ? 'العربية' : 'English'}</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition"
          title="Toggle Light / Dark Mode"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Shortcuts button */}
        <button
          onClick={() => setShowShortcuts(!showShortcuts)}
          className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition"
          title="Keyboard Shortcuts"
        >
          <Keyboard className="w-4 h-4" />
        </button>

        {/* First Run Wizard button */}
        <button
          onClick={() => setFirstRunOpen(true)}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded bg-indigo-600/80 hover:bg-indigo-600 text-white shadow transition"
          title="Setup Wizard"
        >
          <Compass className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t('topbar.first_run')}</span>
        </button>
      </div>

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-sky-400" />
                Keyboard Shortcuts
              </h3>
              <button
                onClick={() => setShowShortcuts(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span>Save Project</span>
                <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono">Ctrl + S</kbd>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span>Play / Pause Video Preview</span>
                <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono">Space</kbd>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span>Undo Action</span>
                <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono">Ctrl + Z</kbd>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span>Redo Action</span>
                <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono">Ctrl + Shift + Z</kbd>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span>Quick Render Active Episode</span>
                <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono">Ctrl + R</kbd>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
