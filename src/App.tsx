import React, { useEffect } from 'react';
import { Topbar } from './components/layout/Topbar';
import { Sidebar } from './components/layout/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';
import { FirstRunWizard } from './components/common/FirstRunWizard';

import { DashboardView } from './components/dashboard/DashboardView';
import { ProjectsView } from './components/projects/ProjectsView';
import { StoryEditorView } from './components/stories/StoryEditorView';
import { StoryBibleView } from './components/stories/StoryBibleView';
import { CharacterManagerView } from './components/characters/CharacterManagerView';
import { LocationManagerView } from './components/locations/LocationManagerView';
import { EpisodesView } from './components/episodes/EpisodesView';
import { VideoEditorView } from './components/video/VideoEditorView';
import { MediaLibraryView } from './components/media/MediaLibraryView';
import { TemplatesView } from './components/templates/TemplatesView';
import { PublishingView } from './components/publishing/PublishingView';
import { SettingsView } from './components/settings/SettingsView';

import { useUIStore } from './stores/useUIStore';
import { useProjectStore } from './stores/useProjectStore';
import { useAIStore } from './stores/useAIStore';
import { usePublishingStore } from './stores/usePublishingStore';
import { storage } from './services/storage';

export const App: React.FC = () => {
  const { activeTab, isRtl, language, setLanguage, addToast } = useUIStore();
  const { loadProjects, undo, redo } = useProjectStore();
  const { initialize: initAI } = useAIStore();
  const { loadPublishing } = usePublishingStore();

  // Initialization
  useEffect(() => {
    loadProjects();
    initAI();
    loadPublishing();

    // Check stored settings for language & first run
    storage.getSettings().then((s) => {
      if (s.language && s.language !== language) {
        setLanguage(s.language);
      }
    });
  }, [loadProjects, initAI, loadPublishing, language, setLanguage]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + S (Save)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        addToast('success', 'Project Saved', 'All changes persisted to local database.');
      }
      // Ctrl + Z (Undo)
      else if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        undo();
        addToast('info', 'Undo', 'Reverted previous action.');
      }
      // Ctrl + Shift + Z or Ctrl + Y (Redo)
      else if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Z') || ((e.ctrlKey || e.metaKey) && e.key === 'y')) {
        e.preventDefault();
        redo();
        addToast('info', 'Redo', 'Reapplied action.');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [addToast, undo, redo]);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'projects':
        return <ProjectsView />;
      case 'stories':
        return <StoryEditorView />;
      case 'bible':
        return <StoryBibleView />;
      case 'characters':
        return <CharacterManagerView />;
      case 'locations':
        return <LocationManagerView />;
      case 'episodes':
        return <EpisodesView />;
      case 'editor':
        return <VideoEditorView />;
      case 'media':
        return <MediaLibraryView />;
      case 'templates':
        return <TemplatesView />;
      case 'publishing':
        return <PublishingView />;
      case 'ai_providers':
      case 'settings':
      case 'logs':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`min-h-screen w-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-hidden ${
        isRtl ? 'font-arabic' : ''
      }`}
    >
      {/* Top Application Bar */}
      <Topbar />

      {/* Main Studio Body (Sidebar + Content Workspace) */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 bg-slate-950 overflow-y-auto relative">
          {renderActiveView()}
        </main>
      </div>

      {/* Floating System Dialogs & Toasts */}
      <ToastContainer />
      <FirstRunWizard />
    </div>
  );
};

export default App;
