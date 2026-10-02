import React, { useState } from 'react';
import {
  Compass,
  Globe,
  Folder,
  Cpu,
  Video,
  Share2,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  X,
} from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';
import { useAIStore } from '../../stores/useAIStore';
import { storage } from '../../services/storage';

export const FirstRunWizard: React.FC = () => {
  const { firstRunOpen, setFirstRunOpen, language, setLanguage, addToast, setActiveTab } = useUIStore();
  const { setProviderApiKey, setProviderBaseUrl } = useAIStore();

  const [step, setStep] = useState(1);
  const [workspaceDir, setWorkspaceDir] = useState('C:\\StoryForgeProjects');
  const [geminiKey, setGeminiKey] = useState('');
  const [localUrl, setLocalUrl] = useState('http://localhost:11434/v1');

  if (!firstRunOpen) return null;

  const handleFinish = async () => {
    // Save settings
    await storage.saveSettings({
      workspaceDir,
      firstRunCompleted: true,
    });

    if (geminiKey) {
      await setProviderApiKey('google', geminiKey);
    }
    if (localUrl) {
      setProviderBaseUrl('ollama', localUrl);
    }

    addToast('success', 'Setup Complete', 'Welcome to StoryForge AI creative studio.');
    setFirstRunOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Welcome to StoryForge AI</h2>
              <p className="text-xs text-slate-400">Windows Desktop Setup & Production Wizard</p>
            </div>
          </div>
          <button
            onClick={() => setFirstRunOpen(false)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs font-medium">
          <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-sky-400' : 'text-slate-400'}`}>
            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">1</span>
            <span>Language</span>
          </div>
          <div className="w-8 h-px bg-slate-800" />
          <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-sky-400' : 'text-slate-400'}`}>
            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">2</span>
            <span>Workspace</span>
          </div>
          <div className="w-8 h-px bg-slate-800" />
          <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-sky-400' : 'text-slate-400'}`}>
            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">3</span>
            <span>AI & Engine</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-sm text-slate-300">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white">Select Interface Language</h3>
              <p className="text-xs text-slate-400">
                StoryForge AI offers native high-performance interfaces in English and Arabic (with complete RTL typographic mirroring).
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`p-4 rounded-xl border text-left flex flex-col justify-between transition ${
                    language === 'en'
                      ? 'border-sky-500 bg-sky-950/30 text-white'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <Globe className="w-6 h-6 text-sky-400 mb-2" />
                  <div className="font-bold text-base">English (US)</div>
                  <div className="text-xs text-slate-400">Standard LTR studio layout</div>
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('ar')}
                  className={`p-4 rounded-xl border text-right flex flex-col justify-between transition ${
                    language === 'ar'
                      ? 'border-sky-500 bg-sky-950/30 text-white'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <Globe className="w-6 h-6 text-amber-400 mb-2 self-end" />
                  <div className="font-bold text-base font-arabic">العربية (Arabic)</div>
                  <div className="text-xs text-slate-400">تخطيط استوديو كامل بالاتجاه من اليمين لليسار</div>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white">Default Workspace Directory</h3>
              <p className="text-xs text-slate-400">
                Choose the base Windows filesystem folder where your story bibles, audio tracks, and rendered MP4 files will be securely saved.
              </p>
              <div className="space-y-2 pt-2">
                <label className="text-xs text-slate-400 block font-medium">Workspace Folder Path</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={workspaceDir}
                    onChange={(e) => setWorkspaceDir(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (window.electronAPI) {
                        const path = await window.electronAPI.openDirectoryDialog();
                        if (path) setWorkspaceDir(path);
                      } else {
                        addToast('info', 'Workspace Selected', workspaceDir);
                      }
                    }}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium text-slate-200 flex items-center gap-1.5"
                  >
                    <Folder className="w-4 h-4 text-sky-400" />
                    Browse
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-xs space-y-1">
                <div className="text-slate-200 font-semibold">Offline-First Guarantee</div>
                <div className="text-slate-400">
                  All story assets and renders remain strictly on your local disk unless you explicitly trigger external AI generation or social media publishing.
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white">Configure AI & Video Engine</h3>
              <p className="text-xs text-slate-400">
                Configure your API key now or skip to use built-in offline templates and the included demonstration project.
              </p>

              <div className="space-y-3 pt-1">
                <div>
                  <label className="text-xs text-slate-400 block font-medium mb-1">
                    Google Gemini API Key (Optional)
                  </label>
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-sky-500"
                  />
                  <div className="text-[11px] text-slate-400 mt-1">
                    Uses Gemini 3.8 Flash for fast analysis and Gemini Flash Image for scene artwork.
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block font-medium mb-1">
                    Local Ollama / OpenAI-Compatible Endpoint
                  </label>
                  <input
                    type="text"
                    value={localUrl}
                    onChange={(e) => setLocalUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-sky-500"
                  />
                  <div className="text-[11px] text-slate-400 mt-1">
                    Connect local models (e.g. Llama 3) running on your machine at zero API cost.
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-lg text-xs text-emerald-300">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>FFmpeg Video Engine & Canvas Synthesizer Ready (H.264 / AAC 1080x1920)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setFirstRunOpen(false);
              addToast('info', 'First Run Skipped', 'You can re-configure anytime via Settings.');
            }}
            className="text-xs text-slate-400 hover:text-white px-3 py-2"
          >
            Skip for now
          </button>

          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs font-medium text-slate-200 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs font-semibold text-white flex items-center gap-1 shadow-md shadow-sky-600/30"
              >
                Continue
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white flex items-center gap-1 shadow-md shadow-emerald-600/30"
              >
                Launch Studio
                <CheckCircle className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
