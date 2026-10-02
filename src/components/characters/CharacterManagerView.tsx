import React, { useState } from 'react';
import {
  Users,
  Plus,
  ShieldCheck,
  Sparkles,
  Volume2,
  Trash2,
  Edit,
  Eye,
  Camera,
  X,
  UserCheck,
} from 'lucide-react';
import { useProjectStore } from '../../stores/useProjectStore';
import { useUIStore } from '../../stores/useUIStore';
import { Character } from '../../types';
import { AVAILABLE_VOICES, ttsService } from '../../services/ttsService';

export const CharacterManagerView: React.FC = () => {
  const { characters, addCharacter, updateCharacter, deleteCharacter, activeProject } = useProjectStore();
  const { addToast, t } = useUIStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingChar, setEditingChar] = useState<Character | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [age, setAge] = useState('28');
  const [gender, setGender] = useState('Male');
  const [personality, setPersonality] = useState('Observant, analytical, cautious');
  const [appearance, setAppearance] = useState('Warm skin tone, athletic frame');
  const [hair, setHair] = useState('Short wavy black hair');
  const [eyes, setEyes] = useState('Dark brown, observant');
  const [clothing, setClothing] = useState('Dark charcoal travel coat over a linen shirt');
  const [importantTraits, setImportantTraits] = useState('Carries an antique pocket watch');
  const [characterPrompt, setCharacterPrompt] = useState('');
  const [voiceId, setVoiceId] = useState('en-male-narrator');

  const openAddModal = () => {
    setEditingChar(null);
    setName('');
    setAge('25');
    setGender('Male');
    setPersonality('Intelligent, driven');
    setAppearance('Athletic build, sharp features');
    setHair('Dark hair');
    setEyes('Brown');
    setClothing('Tailored jacket');
    setImportantTraits('Distinctive scar or trait');
    setCharacterPrompt('A young protagonist, cinematic lighting, 8k');
    setVoiceId('en-male-narrator');
    setModalOpen(true);
  };

  const openEditModal = (c: Character) => {
    setEditingChar(c);
    setName(c.name);
    setAge(c.age);
    setGender(c.gender);
    setPersonality(c.personality);
    setAppearance(c.appearance);
    setHair(c.hair);
    setEyes(c.eyes);
    setClothing(c.clothing);
    setImportantTraits(c.importantTraits);
    setCharacterPrompt(c.characterPrompt);
    setVoiceId(c.voiceId || 'en-male-narrator');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const prompt = characterPrompt.trim()
      ? characterPrompt
      : `${name}, a ${age} year old ${gender}, ${hair}, ${eyes}, wearing ${clothing}. ${appearance}. Cinematic portrait lighting, 8k.`;

    if (editingChar) {
      await updateCharacter({
        ...editingChar,
        name,
        age,
        gender,
        personality,
        appearance,
        hair,
        eyes,
        clothing,
        importantTraits,
        characterPrompt: prompt,
        voiceId,
      });
      addToast('success', 'Character Updated', name);
    } else {
      await addCharacter({
        name,
        age,
        gender,
        personality,
        appearance,
        hair,
        eyes,
        clothing,
        importantTraits,
        characterPrompt: prompt,
        referenceImages: [],
        voiceId,
      });
      addToast('success', 'Character Added', name);
    }
    setModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-400" />
            {t('characters.title')}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {t('characters.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-sky-600/30 transition hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>{t('characters.add_character')}</span>
          </button>
        </div>
      </div>

      {/* Consistency Guarantee Banner */}
      <div className="p-4 rounded-xl bg-sky-950/40 border border-sky-800/60 flex items-start gap-3 text-xs text-sky-300">
        <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-white">Automated Character Consistency Active</div>
          <div className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
            Every scene featuring a character automatically injects their canonical facial features, clothing, and hair into the image generation prompt to eliminate hallucinations across episodes.
          </div>
        </div>
      </div>

      {/* Character Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {characters.map((char) => (
          <div
            key={char.id}
            className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col justify-between shadow-lg hover:border-slate-700 transition"
          >
            {/* Top Avatar & Reference preview */}
            <div className="relative h-44 bg-slate-950 flex items-center justify-center overflow-hidden border-b border-slate-800/80">
              {char.referenceImages && char.referenceImages[0] ? (
                <img
                  src={char.referenceImages[0]}
                  alt={char.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <UserCheck className="w-12 h-12 text-slate-400" />
                  <span className="text-[11px] font-mono">No Reference Photo</span>
                </div>
              )}

              {/* Consistency Tag */}
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-slate-900/90 backdrop-blur border border-emerald-500/40 text-[10px] text-emerald-300 font-semibold flex items-center gap-1 shadow">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Consistent</span>
              </div>
            </div>

            {/* Character Info */}
            <div className="p-5 space-y-3 flex-1 text-xs">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">{char.name}</h3>
                  <div className="text-[11px] text-sky-400 font-medium">
                    {char.age} yrs • {char.gender}
                  </div>
                </div>

                {/* Voice Preview Button */}
                <button
                  onClick={() => {
                    ttsService.speakPreview(`Hello, I am ${char.name}. I am ready for the scene.`, char.voiceId);
                    addToast('info', 'Voice Audition', `Speaking as ${char.name}`);
                  }}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white"
                  title="Audition Narration Voice"
                >
                  <Volume2 className="w-4 h-4 text-amber-400" />
                </button>
              </div>

              <div className="space-y-1.5 text-slate-300 text-[11px]">
                <div>
                  <strong className="text-slate-400">Appearance:</strong> {char.appearance}
                </div>
                <div>
                  <strong className="text-slate-400">Clothing:</strong> {char.clothing}
                </div>
                <div>
                  <strong className="text-slate-400">Personality:</strong> {char.personality}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-[10px] text-slate-400 line-clamp-3 leading-relaxed">
                <span className="text-slate-400 block font-bold mb-0.5">CANONICAL PROMPT:</span>
                {char.characterPrompt}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-3 bg-slate-950/70 border-t border-slate-800 flex items-center justify-between text-xs">
              <button
                onClick={() => openEditModal(char)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>

              <button
                onClick={() => {
                  if (confirm(`Remove character "${char.name}"?`)) {
                    deleteCharacter(char.id);
                    addToast('warning', 'Character Removed', char.name);
                  }
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900"
                title="Delete Character"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Character Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-400" />
                {editingChar ? `Edit ${editingChar.name}` : 'New Character'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-300 font-medium mb-1">Character Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Age</label>
                  <input
                    type="text"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Hair Style & Color</label>
                  <input
                    type="text"
                    value={hair}
                    onChange={(e) => setHair(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Eyes</label>
                  <input
                    type="text"
                    value={eyes}
                    onChange={(e) => setEyes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Canonical Wardrobe / Clothing</label>
                <input
                  type="text"
                  value={clothing}
                  onChange={(e) => setClothing(e.target.value)}
                  placeholder="e.g. Dark charcoal coat, white linen shirt"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Personality & Demeanor</label>
                <input
                  type="text"
                  value={personality}
                  onChange={(e) => setPersonality(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Narration Voice ID</label>
                <select
                  value={voiceId}
                  onChange={(e) => setVoiceId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  {AVAILABLE_VOICES.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.language})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Canonical AI Image Generation Prompt
                </label>
                <textarea
                  rows={3}
                  value={characterPrompt}
                  onChange={(e) => setCharacterPrompt(e.target.value)}
                  placeholder="Leave empty to auto-generate from features above..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white font-mono text-[11px] leading-relaxed resize-none"
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
                  className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow-md shadow-sky-600/30"
                >
                  Save Character
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
