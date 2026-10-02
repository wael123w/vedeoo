import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Video,
  Music,
  Volume2,
  Type,
  Upload,
  Trash2,
  Play,
  Plus,
  Layers,
} from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';

interface MediaAsset {
  id: string;
  category: 'images' | 'audio' | 'sfx' | 'music';
  name: string;
  url: string;
  size: string;
}

export const MediaLibraryView: React.FC = () => {
  const { addToast } = useUIStore();
  const [category, setCategory] = useState<'images' | 'audio' | 'sfx' | 'music'>('images');

  const [assets, setAssets] = useState<MediaAsset[]>([
    { id: '1', category: 'images', name: 'Atlas_Vault_01.png', url: 'https://images.unsplash.com/photo-1507842229451-7f01be44c0a2?w=800&auto=format&fit=crop&q=60', size: '2.4 MB' },
    { id: '2', category: 'images', name: 'Subterranean_Arch_Lanterns.png', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=60', size: '1.9 MB' },
    { id: '3', category: 'music', name: 'Ancient_Clockwork_Drone.wav', url: '', size: '8.2 MB' },
    { id: '4', category: 'sfx', name: 'Hydraulic_Stone_Slide.wav', url: '', size: '540 KB' },
    { id: '5', category: 'sfx', name: 'Brass_Key_Click.wav', url: '', size: '120 KB' },
  ]);

  const filtered = assets.filter((a) => a.category === category);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newAsset: MediaAsset = {
      id: `media-${Date.now()}`,
      category,
      name: file.name,
      url: URL.createObjectURL(file),
      size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
    };

    setAssets([newAsset, ...assets]);
    addToast('success', 'Media Imported', file.name);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-sky-400" />
            Project Media Library
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Store and manage production visual assets, voiceovers, background music, and sound effects.
          </p>
        </div>

        <label className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-sky-600/30 cursor-pointer transition">
          <Upload className="w-4 h-4" />
          <span>Import Asset</span>
          <input type="file" onChange={handleUpload} className="hidden" />
        </label>
      </div>

      {/* Category selector */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-semibold">
        {[
          { id: 'images', label: 'Images & Visuals', icon: ImageIcon },
          { id: 'music', label: 'Music Tracks', icon: Music },
          { id: 'sfx', label: 'Sound Effects (SFX)', icon: Volume2 },
        ].map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id as typeof category)}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                category === cat.id
                  ? 'bg-sky-950/80 text-sky-300 border border-sky-800'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col justify-between group shadow"
          >
            {item.category === 'images' ? (
              <div className="aspect-video bg-slate-950 relative overflow-hidden">
                <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="aspect-video bg-slate-950 flex items-center justify-center text-slate-400">
                <Volume2 className="w-8 h-8 text-amber-400" />
              </div>
            )}

            <div className="p-3 text-xs flex items-center justify-between">
              <div>
                <div className="font-semibold text-white truncate max-w-[140px]">{item.name}</div>
                <div className="text-[10px] text-slate-400">{item.size}</div>
              </div>

              <button
                onClick={() => {
                  setAssets(assets.filter((a) => a.id !== item.id));
                  addToast('info', 'Asset Removed', item.name);
                }}
                className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
