import { create } from 'zustand';
import enTranslations from '../i18n/en.json';
import arTranslations from '../i18n/ar.json';
import { BrandKit, VideoTemplate } from '../types';
import { storage } from '../services/storage';

export type NavTab =
  | 'dashboard'
  | 'projects'
  | 'stories'
  | 'bible'
  | 'characters'
  | 'locations'
  | 'episodes'
  | 'editor'
  | 'media'
  | 'templates'
  | 'publishing'
  | 'ai_providers'
  | 'settings'
  | 'logs';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}

export const DEFAULT_BRAND_KIT: BrandKit = {
  watermarkEnabled: true,
  watermarkPosition: 'bottom_right',
  watermarkOpacity: 0.7,
  watermarkScale: 1.0,
  primaryColor: '#38bdf8',
  accentColor: '#f59e0b',
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  defaultCta: 'Follow for the next episode!',
  socialHandle: '@StoryForgeAI',
};

interface UIState {
  activeTab: NavTab;
  language: 'en' | 'ar';
  isRtl: boolean;
  theme: 'dark' | 'light';
  online: boolean;
  toasts: ToastMessage[];
  firstRunOpen: boolean;
  brandKit: BrandKit;
  activeTemplate: VideoTemplate | null;
  templates: VideoTemplate[];

  // Actions
  setActiveTab: (tab: NavTab) => void;
  setLanguage: (lang: 'en' | 'ar') => void;
  toggleTheme: () => void;
  addToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message?: string) => void;
  removeToast: (id: string) => void;
  setFirstRunOpen: (open: boolean) => void;
  updateBrandKit: (patch: Partial<BrandKit>) => void;
  setActiveTemplate: (template: VideoTemplate) => void;
  t: (keyPath: string) => string;
}

export const useUIStore = create<UIState>((set, get) => ({
  activeTab: 'dashboard',
  language: 'en',
  isRtl: false,
  theme: 'dark',
  online: typeof navigator !== 'undefined' ? navigator.onLine : true,
  toasts: [],
  firstRunOpen: false,
  brandKit: DEFAULT_BRAND_KIT,
  activeTemplate: null,
  templates: [],

  setActiveTab: (tab) => set({ activeTab: tab }),

  setLanguage: (lang) => {
    const isRtl = lang === 'ar';
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    set({ language: lang, isRtl });
    storage.saveSettings({ language: lang });
  },

  toggleTheme: () => {
    const newTheme = get().theme === 'dark' ? 'light' : 'dark';
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ theme: newTheme });
    storage.saveSettings({ theme: newTheme });
  },

  addToast: (type, title, message) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const toast: ToastMessage = { id, type, title, message, duration: 4000 };
    set((state) => ({ toasts: [...state.toasts, toast] }));

    setTimeout(() => {
      get().removeToast(id);
    }, 4500);
  },

  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  setFirstRunOpen: (open) => set({ firstRunOpen: open }),

  updateBrandKit: (patch) => {
    const brandKit = { ...get().brandKit, ...patch };
    set({ brandKit });
  },

  setActiveTemplate: (template) => set({ activeTemplate: template }),

  t: (keyPath: string): string => {
    const { language } = get();
    const source = language === 'ar' ? arTranslations : enTranslations;
    const parts = keyPath.split('.');
    let current: unknown = source;
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = (current as Record<string, unknown>)[part];
      } else {
        return keyPath;
      }
    }
    return typeof current === 'string' ? current : keyPath;
  },
}));
