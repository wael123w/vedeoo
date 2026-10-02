import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  PenTool,
  BookOpenCheck,
  Users,
  MapPin,
  Clapperboard,
  Video,
  Image as ImageIcon,
  Palette,
  Share2,
  Cpu,
  Settings,
  ScrollText,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { useUIStore, NavTab } from '../../stores/useUIStore';
import { useProjectStore } from '../../stores/useProjectStore';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, t } = useUIStore();
  const { activeProject } = useProjectStore();

  const navigationItems: Array<{ id: NavTab; label: string; icon: React.ElementType; badge?: string }> = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { id: 'projects', label: t('nav.projects'), icon: FolderKanban },
    { id: 'stories', label: t('nav.stories'), icon: PenTool },
    { id: 'bible', label: t('nav.bible'), icon: BookOpenCheck },
    { id: 'characters', label: t('nav.characters'), icon: Users },
    { id: 'locations', label: t('nav.locations'), icon: MapPin },
    { id: 'episodes', label: t('nav.episodes'), icon: Clapperboard, badge: 'Viral' },
    { id: 'editor', label: t('nav.editor'), icon: Video },
    { id: 'media', label: t('nav.media'), icon: ImageIcon },
    { id: 'templates', label: t('nav.templates'), icon: Palette },
    { id: 'publishing', label: t('nav.publishing'), icon: Share2 },
    { id: 'ai_providers', label: t('nav.ai_providers'), icon: Cpu },
    { id: 'settings', label: t('nav.settings'), icon: Settings },
    { id: 'logs', label: t('nav.logs'), icon: ScrollText },
  ];

  return (
    <aside className="w-60 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between shrink-0 select-none">
      {/* Navigation List */}
      <div className="py-3 px-2 space-y-1 overflow-y-auto flex-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-sky-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && !isActive && (
                <span className="flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Flame className="w-2.5 h-2.5 text-amber-400" />
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Project Footer Card */}
      {activeProject && (
        <div className="p-3 m-2 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Current Project</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-950 text-sky-300 border border-sky-800">
              {activeProject.aspectRatio}
            </span>
          </div>
          <div className="font-semibold text-slate-200 truncate">{activeProject.name}</div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between mt-1">
            <span>{activeProject.genre}</span>
            <span className="text-emerald-400 font-medium">{activeProject.status}</span>
          </div>
        </div>
      )}
    </aside>
  );
};
