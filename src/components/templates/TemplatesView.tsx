import React, { useState } from 'react';
import {
  Palette,
  Sparkles,
  Type,
  Film,
  Music,
  CheckCircle2,
  Sliders,
  SlidersHorizontal,
} from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';
import { INITIAL_TEMPLATES } from '../../services/storage';
import { VideoTemplate } from '../../types';

export const TemplatesView: React.FC = () => {
  const { brandKit, updateBrandKit, activeTemplate, setActiveTemplate, addToast } = useUIStore();
  const [activeTab, setActiveTab] = useState<'templates' | 'brand_kit'>('templates');

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-sky-400" />
            Video Templates & Brand Kit
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure reusable styling, typography, subtitle designs, and studio watermark overlays.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'templates' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Video Templates ({INITIAL_TEMPLATES.length})
          </button>
          <button
            onClick={() => setActiveTab('brand_kit')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'brand_kit' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Studio Brand Kit
          </button>
        </div>
      </div>

      {/* Tab: Templates */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {INITIAL_TEMPLATES.map((tmpl) => {
            const isSelected = activeTemplate?.id === tmpl.id;
            return (
              <div
                key={tmpl.id}
                className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'bg-slate-900 border-sky-500 shadow-lg shadow-sky-950/60'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-3 text-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        {tmpl.name}
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-sky-400" />}
                      </h3>
                      <div className="text-[11px] text-sky-400 font-medium">{tmpl.genre}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-800 text-slate-300">
                      {tmpl.subtitleStyle}
                    </span>
                  </div>

                  <p className="text-slate-300 text-xs leading-relaxed">{tmpl.description}</p>

                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80 space-y-1.5 text-[11px] text-slate-400">
                    <div className="flex justify-between">
                      <span>Transition:</span>
                      <strong className="text-slate-200 uppercase">{tmpl.transition}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Camera Easing:</span>
                      <strong className="text-slate-200 uppercase">{tmpl.defaultCameraMotion}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Typography:</span>
                      <strong className="text-slate-200">{tmpl.fontFamily}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setActiveTemplate(tmpl);
                      addToast('success', 'Template Applied', `Active template: ${tmpl.name}`);
                    }}
                    className={`w-full py-2 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition ${
                      isSelected
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    <span>{isSelected ? 'Active Template' : 'Use This Template'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab: Brand Kit */}
      {activeTab === 'brand_kit' && (
        <div className="max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5 text-xs text-slate-300">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-sky-400" />
              Channel Branding & Watermark
            </h3>
            <span className="text-[11px] text-emerald-400 font-medium">Applied to Final Renders</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Channel / Creator Social Handle</label>
              <input
                type="text"
                value={brandKit.socialHandle}
                onChange={(e) => updateBrandKit({ socialHandle: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Default Call To Action (CTA)</label>
              <input
                type="text"
                value={brandKit.defaultCta}
                onChange={(e) => updateBrandKit({ defaultCta: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Watermark Position</label>
                <select
                  value={brandKit.watermarkPosition}
                  onChange={(e) => updateBrandKit({ watermarkPosition: e.target.value as typeof brandKit.watermarkPosition })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="bottom_right">Bottom Right</option>
                  <option value="bottom_left">Bottom Left</option>
                  <option value="top_right">Top Right</option>
                  <option value="top_left">Top Left</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Watermark Opacity ({Math.round(brandKit.watermarkOpacity * 100)}%)
                </label>
                <input
                  type="range"
                  min={0.1}
                  max={1.0}
                  step={0.05}
                  value={brandKit.watermarkOpacity}
                  onChange={(e) => updateBrandKit({ watermarkOpacity: Number(e.target.value) })}
                  className="w-full mt-2 accent-sky-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-slate-200 font-semibold">
                <input
                  type="checkbox"
                  checked={brandKit.watermarkEnabled}
                  onChange={(e) => updateBrandKit({ watermarkEnabled: e.target.checked })}
                  className="rounded accent-sky-500"
                />
                <span>Burn watermark directly into rendered videos</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
