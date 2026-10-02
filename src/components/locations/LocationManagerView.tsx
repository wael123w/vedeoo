import React, { useState } from 'react';
import {
  MapPin,
  Plus,
  Compass,
  Edit,
  Trash2,
  X,
  Sun,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useProjectStore } from '../../stores/useProjectStore';
import { useUIStore } from '../../stores/useUIStore';
import { Location } from '../../types';

export const LocationManagerView: React.FC = () => {
  const { locations, addLocation, updateLocation, deleteLocation } = useProjectStore();
  const { addToast, t } = useUIStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingLoc, setEditingLoc] = useState<Location | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [architecture, setArchitecture] = useState('Ancient stone masonry');
  const [lighting, setLighting] = useState('Volumetric amber sunlight with dust motes');
  const [timeOfDay, setTimeOfDay] = useState('Golden Hour / Sunset');
  const [atmosphere, setAtmosphere] = useState('Solemn, historic, mysterious');
  const [canonicalPrompt, setCanonicalPrompt] = useState('');

  const openAddModal = () => {
    setEditingLoc(null);
    setName('');
    setDescription('Historic subterranean library chamber');
    setArchitecture('Vaulted Gothic limestone arches');
    setLighting('Dramatic chiaroscuro lantern light');
    setTimeOfDay('Night');
    setAtmosphere('Suspenseful and ancient');
    setCanonicalPrompt('');
    setModalOpen(true);
  };

  const openEditModal = (loc: Location) => {
    setEditingLoc(loc);
    setName(loc.name);
    setDescription(loc.description);
    setArchitecture(loc.architecture);
    setLighting(loc.lighting);
    setTimeOfDay(loc.timeOfDay);
    setAtmosphere(loc.atmosphere);
    setCanonicalPrompt(loc.canonicalPrompt);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const prompt = canonicalPrompt.trim()
      ? canonicalPrompt
      : `Cinematic interior shot of ${name}, ${description}. Architecture: ${architecture}. Lighting: ${lighting}. Atmosphere: ${atmosphere}. 8k photorealistic set design.`;

    if (editingLoc) {
      await updateLocation({
        ...editingLoc,
        name,
        description,
        architecture,
        lighting,
        timeOfDay,
        atmosphere,
        canonicalPrompt: prompt,
      });
      addToast('success', 'Location Updated', name);
    } else {
      await addLocation({
        name,
        description,
        architecture,
        lighting,
        timeOfDay,
        atmosphere,
        canonicalPrompt: prompt,
        referenceImages: [],
      });
      addToast('success', 'Location Added', name);
    }
    setModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-sky-400" />
            {t('locations.title')}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {t('locations.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-sky-600/30 transition hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>{t('locations.add_location')}</span>
          </button>
        </div>
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {locations.map((loc) => (
          <div
            key={loc.id}
            className="rounded-2xl bg-slate-900 border border-slate-800 p-5 flex flex-col justify-between shadow-lg hover:border-slate-700 transition"
          >
            <div className="space-y-3 text-xs">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">{loc.name}</h3>
                  <div className="text-[11px] text-amber-400 font-medium flex items-center gap-1 mt-0.5">
                    <Sun className="w-3 h-3" />
                    <span>{loc.timeOfDay}</span>
                  </div>
                </div>
              </div>

              <p className="text-slate-300 text-xs leading-relaxed">{loc.description}</p>

              <div className="space-y-1 text-[11px] text-slate-400">
                <div>
                  <strong className="text-slate-300">Architecture:</strong> {loc.architecture}
                </div>
                <div>
                  <strong className="text-slate-300">Lighting:</strong> {loc.lighting}
                </div>
                <div>
                  <strong className="text-slate-300">Atmosphere:</strong> {loc.atmosphere}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[10px] text-slate-400 line-clamp-3">
                <span className="text-slate-400 block font-bold mb-0.5">CANONICAL PROMPT:</span>
                {loc.canonicalPrompt}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <button
                onClick={() => openEditModal(loc)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Set</span>
              </button>

              <button
                onClick={() => {
                  if (confirm(`Delete location "${loc.name}"?`)) {
                    deleteLocation(loc.id);
                    addToast('warning', 'Location Removed', loc.name);
                  }
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900"
                title="Delete Location"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Location Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sky-400" />
                {editingLoc ? `Edit ${editingLoc.name}` : 'New Location Set'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Location Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Architecture / Environment</label>
                  <input
                    type="text"
                    value={architecture}
                    onChange={(e) => setArchitecture(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Time of Day</label>
                  <input
                    type="text"
                    value={timeOfDay}
                    onChange={(e) => setTimeOfDay(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Lighting Design</label>
                  <input
                    type="text"
                    value={lighting}
                    onChange={(e) => setLighting(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Atmosphere & Mood</label>
                  <input
                    type="text"
                    value={atmosphere}
                    onChange={(e) => setAtmosphere(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Canonical Visual Prompt</label>
                <textarea
                  rows={3}
                  value={canonicalPrompt}
                  onChange={(e) => setCanonicalPrompt(e.target.value)}
                  placeholder="Auto-generated if left empty..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white font-mono text-[11px]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold"
                >
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
