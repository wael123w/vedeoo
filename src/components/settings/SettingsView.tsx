import React, { useState, useEffect } from 'react';
import {
  Settings,
  Cpu,
  Video,
  Mic,
  Folder,
  Shield,
  ScrollText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Info,
  DollarSign,
  Download,
  Trash2,
} from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';
import { storage } from '../../services/storage';
import { LogEntry, AppSettings } from '../../types';
import { AIProvidersConfig } from './AIProvidersConfig';

export const SettingsView: React.FC = () => {
  const { language, setLanguage, theme, toggleTheme, addToast, t } = useUIStore();
  const [activeTab, setActiveTab] = useState<'ai' | 'general' | 'logs' | 'privacy'>('ai');
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    storage.getSettings().then(setSettings);
    storage.getLogs().then(setLogs);
  }, []);

  const handleClearLogs = async () => {
    await storage.clearLogs();
    setLogs([]);
    addToast('info', 'Logs Cleared', 'System log history reset.');
  };

  const handleExportLogs = () => {
    const text = logs
      .map((l) => `[${new Date(l.timestamp).toISOString()}] [${l.level}] [${l.category}] ${l.message}`)
      .join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `storyforge_system_logs_${Date.now()}.log`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('success', 'Logs Exported', 'Saved diagnostic log file.');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-sky-400" />
            {t('settings.title')}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure AI models, storage directories, FFmpeg video encoders, and privacy rules.
          </p>
        </div>

        {/* Subtabs */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'ai' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            AI Providers & Keys
          </button>
          <button
            onClick={() => setActiveTab('general')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'general' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            General & Output
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'logs' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            System Logs ({logs.length})
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'privacy' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Privacy & Offline
          </button>
        </div>
      </div>

      {/* Tab: AI Providers */}
      {activeTab === 'ai' && (
        <AIProvidersConfig />
      )}

      {/* Tab: General & Output */}
      {activeTab === 'general' && settings && (
        <div className="max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 text-xs text-slate-300">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Local Workspace Directory</label>
            <input
              type="text"
              value={settings.workspaceDir}
              onChange={(e) => {
                setSettings({ ...settings, workspaceDir: e.target.value });
                storage.saveSettings({ workspaceDir: e.target.value });
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Render Resolution</label>
              <select
                value={settings.renderResolution}
                onChange={(e) => {
                  const val = e.target.value as '720p' | '1080p' | '4k';
                  setSettings({ ...settings, renderResolution: val });
                  storage.saveSettings({ renderResolution: val });
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-semibold"
              >
                <option value="1080p">1080x1920 (Full HD Vertical)</option>
                <option value="720p">720x1280 (Fast Draft)</option>
                <option value="4k">2160x3840 (Ultra 4K)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Frame Rate</label>
              <select
                value={settings.renderFps}
                onChange={(e) => {
                  const val = Number(e.target.value) as 30 | 60;
                  setSettings({ ...settings, renderFps: val });
                  storage.saveSettings({ renderFps: val });
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-semibold"
              >
                <option value={30}>30 FPS (Standard Short)</option>
                <option value={60}>60 FPS (Smooth Cinematic)</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
            <div className="font-semibold text-white">FFmpeg Video Subsystem</div>
            <div className="text-slate-400 text-[11px]">
              Active encoder: libx264 (H.264 High Profile), audio codec: aac 192k stereo.
            </div>
          </div>
        </div>
      )}

      {/* Tab: System Logs */}
      {activeTab === 'logs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg space-y-2">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <span className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <ScrollText className="w-4 h-4 text-sky-400" />
              Diagnostics & Engine Execution Log
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportLogs}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white font-medium flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Log</span>
              </button>
              <button
                onClick={handleClearLogs}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-rose-400 font-medium flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          <div className="p-4 max-h-[500px] overflow-y-auto font-mono text-[11px] space-y-1.5">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-2 text-slate-300">
                <span className="text-slate-400 shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span
                  className={`font-bold shrink-0 ${
                    log.level === 'ERROR'
                      ? 'text-rose-400'
                      : log.level === 'WARNING'
                      ? 'text-amber-400'
                      : 'text-sky-400'
                  }`}
                >
                  [{log.level}]
                </span>
                <span className="text-indigo-300 font-bold shrink-0">[{log.category}]</span>
                <span className="text-slate-200">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Privacy & Offline Architecture */}
      {activeTab === 'privacy' && (
        <div className="max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 text-xs text-slate-300">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Local-First Desktop Privacy Policy</h3>
          </div>

          <p className="leading-relaxed">
            StoryForge AI operates on a strictly offline-first desktop architecture. Your story manuscripts, character definitions, location bibles, voice files, and rendered MP4 videos are stored exclusively on your local computer hard drive.
          </p>

          <div className="space-y-2">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
              <strong className="text-white block">External Cloud AI Calls</strong>
              <span className="text-slate-400 text-[11px]">
                Data is sent to Google AI or external endpoints only when you explicitly click &ldquo;Analyze Story&rdquo; or &ldquo;Generate Episodes&rdquo;. If local AI (Ollama) is enabled, no network requests leave your machine.
              </span>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
              <strong className="text-white block">No Telemetry or Scraping</strong>
              <span className="text-slate-400 text-[11px]">
                We do not track keystrokes, story contents, or user activity. All social platform integrations use official developer OAuth scopes and APIs.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
