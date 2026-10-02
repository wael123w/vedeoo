import React, { useState } from 'react';
import {
  BookOpenCheck,
  Users,
  MapPin,
  Clock,
  Sparkles,
  Layers,
  ShieldCheck,
  Edit3,
  Plus,
  Trash2,
  Save,
  Compass,
} from 'lucide-react';
import { useProjectStore } from '../../stores/useProjectStore';
import { useUIStore } from '../../stores/useUIStore';

export const StoryBibleView: React.FC = () => {
  const { storyBible, updateStoryBible, characters, locations } = useProjectStore();
  const { setActiveTab, addToast, t } = useUIStore();

  const [activeSubTab, setActiveSubTab] = useState<
    'overview' | 'relationships' | 'objects' | 'timeline' | 'events' | 'rules'
  >('overview');

  if (!storyBible) {
    return (
      <div className="p-12 text-center text-slate-400 space-y-4">
        <BookOpenCheck className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">No Story Bible Found</h2>
        <p className="text-xs max-w-sm mx-auto">
          Analyze your story in the Story Editor to automatically extract characters, locations, timeline, and narrative rules.
        </p>
        <button
          onClick={() => setActiveTab('stories')}
          className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs"
        >
          Go to Story Editor
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpenCheck className="w-5 h-5 text-sky-400" />
            {t('bible.title')}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {t('bible.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('episodes')}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-sky-600/30 transition hover:scale-105"
          >
            <span>Proceed to Episodes</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'overview', label: t('bible.tab_overview') },
          { id: 'relationships', label: 'Character Dynamics' },
          { id: 'objects', label: t('bible.tab_objects') },
          { id: 'timeline', label: t('bible.tab_timeline') },
          { id: 'events', label: 'Major Plot Events' },
          { id: 'rules', label: t('bible.tab_rules') },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as typeof activeSubTab)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
              activeSubTab === tab.id
                ? 'bg-sky-950/80 text-sky-300 border border-sky-800/80'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeSubTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Title</label>
              <input
                type="text"
                value={storyBible.title}
                onChange={(e) => updateStoryBible({ title: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-semibold"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Genre</label>
              <input
                type="text"
                value={storyBible.genre}
                onChange={(e) => updateStoryBible({ genre: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Emotional Tone</label>
              <input
                type="text"
                value={storyBible.emotionalTone}
                onChange={(e) => updateStoryBible({ emotionalTone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Master Synopsis</label>
            <textarea
              rows={4}
              value={storyBible.summary}
              onChange={(e) => updateStoryBible({ summary: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 leading-relaxed resize-none focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Extracted Chapters & Arcs</div>
            <div className="space-y-2">
              {storyBible.chapters?.map((ch, idx) => (
                <div key={ch.id || idx} className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex items-start gap-3 text-xs">
                  <span className="w-5 h-5 rounded-full bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400 font-mono text-[10px] shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <div className="font-bold text-white">{ch.title}</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">{ch.summary}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Character Dynamics / Relationships */}
      {activeSubTab === 'relationships' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-400">
            Defines the interpersonal stakes and dynamics between characters to maintain emotional realism across scene dialogue.
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {storyBible.relationships?.map((rel, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between text-white font-bold">
                  <span className="text-sky-300">{rel.character1}</span>
                  <span className="text-slate-400 text-[10px]">↔</span>
                  <span className="text-amber-300">{rel.character2}</span>
                </div>
                <input
                  type="text"
                  value={rel.relationship}
                  onChange={(e) => {
                    const updated = [...(storyBible.relationships || [])];
                    updated[idx].relationship = e.target.value;
                    updateStoryBible({ relationships: updated });
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Key Artifacts */}
      {activeSubTab === 'objects' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {storyBible.objects?.map((obj, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
                <div className="font-bold text-white text-sm">{obj.name}</div>
                <div className="text-slate-300 text-xs">{obj.description}</div>
                <div className="text-[11px] text-amber-400/90 bg-amber-950/30 border border-amber-900/40 p-2 rounded-lg">
                  <strong>Significance:</strong> {obj.significance}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Timeline */}
      {activeSubTab === 'timeline' && (
        <div className="space-y-3">
          <div className="relative border-l-2 border-slate-800 ml-4 pl-4 space-y-4">
            {storyBible.timeline?.map((item, idx) => (
              <div key={idx} className="relative group text-xs">
                <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-sky-500 border-2 border-slate-900" />
                <div className="font-mono text-[11px] text-sky-400 font-bold">{item.time}</div>
                <div className="text-slate-200 font-medium mt-0.5">{item.event}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Major Plot Events */}
      {activeSubTab === 'events' && (
        <div className="space-y-3">
          {storyBible.majorEvents?.map((ev, idx) => (
            <div key={ev.id || idx} className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-indigo-950 border border-indigo-800 flex items-center justify-center font-mono text-[11px] text-indigo-300 font-bold">
                  {idx + 1}
                </span>
                <span className="text-slate-200 font-medium">{ev.description}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Style Rules */}
      {activeSubTab === 'rules' && (
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 text-xs">
            <div className="font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Canonical Style & Production Rules
            </div>
            <div className="text-slate-400 text-[11px]">
              These guidelines are automatically injected into scene image generators, camera motion plans, and narrator prompts to guarantee high-end aesthetics.
            </div>
            <div className="space-y-2 pt-1">
              {storyBible.styleRules?.map((rule, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center gap-2 text-slate-200">
                  <span className="text-sky-400 font-mono text-[11px]">#{idx + 1}</span>
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
