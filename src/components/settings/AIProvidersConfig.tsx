import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Server,
  DollarSign,
  Plus,
  Trash2,
  Check,
  X,
  ExternalLink,
  Layers,
  ArrowRight,
  Sliders,
} from 'lucide-react';
import { useAIStore } from '../../stores/useAIStore';
import { AITask, AIMode, ModelDescriptor } from '../../services/ai/types';
import { modelRegistry } from '../../services/ai/modelRegistry';
import { credentialStore } from '../../services/ai/credentialStore';

export const AIProvidersConfig: React.FC = () => {
  const {
    providers,
    selectedProviderTab,
    setSelectedTab,
    routerMode,
    setRouterMode,
    taskRoutes,
    setTaskRoute,
    setProviderApiKey,
    setProviderBaseUrl,
    setSelectedModel,
    testProvider,
    refreshModels,
    testingProviderId,
    refreshingProviderId,
    addCustomProvider,
    removeCustomProvider,
    usageReport,
    discoveredModels,
  } = useAIStore();

  const [inputKey, setInputKey] = useState('');
  const [maskedKey, setMaskedKey] = useState('');
  const [customName, setCustomName] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [customKey, setCustomKey] = useState('');
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);

  const activeProvider = providers.find((p) => p.id === selectedProviderTab) || providers[0];

  // Refresh masked key when switching provider tabs
  useEffect(() => {
    if (activeProvider) {
      credentialStore.getMaskedCredential(activeProvider.id).then(setMaskedKey);
      setInputKey('');
    }
  }, [activeProvider]);

  const providerModels = activeProvider ? discoveredModels[activeProvider.id] || [] : [];
  const selectedModelDescriptor = providerModels.find((m) => m.id === activeProvider?.selectedModelId);

  const handleSaveKey = async () => {
    if (!activeProvider) return;
    await setProviderApiKey(activeProvider.id, inputKey);
    const masked = await credentialStore.getMaskedCredential(activeProvider.id);
    setMaskedKey(masked);
    setInputKey('');
  };

  const handleAddCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customUrl.trim()) return;
    await addCustomProvider(customName.trim(), customUrl.trim(), customKey.trim());
    setShowAddCustomModal(false);
    setCustomName('');
    setCustomUrl('');
    setCustomKey('');
  };

  return (
    <div className="space-y-6">
      {/* 1. Global AI Mode & Router Selector */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              AIRouter Engine & Operational Mode
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Select how StoryForge AI dispatches narrative analysis, scene generation, and cliffhanger splitting.
            </p>
          </div>

          {/* Mode Radios */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            {(['automatic', 'cloud', 'local', 'custom'] as AIMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setRouterMode(mode)}
                className={`px-3 py-1.5 rounded-lg capitalize transition ${
                  routerMode === mode
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode === 'automatic' ? 'Automatic' : mode === 'local' ? 'Local Only' : mode === 'cloud' ? 'Cloud Only' : 'Custom'}
              </button>
            ))}
          </div>
        </div>

        {/* Task-Specific Route Configuration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {(
            [
              { id: 'story_analysis', label: 'Story Analysis' },
              { id: 'episode_generation', label: 'Episode Generation' },
              { id: 'scene_generation', label: 'Scene Generation' },
              { id: 'continuity', label: 'Continuity & Lore' },
              { id: 'social_metadata', label: 'Social Metadata' },
              { id: 'vision', label: 'Vision & Prompts' },
            ] as Array<{ id: AITask; label: string }>
          ).map((item) => {
            const currentRoute = taskRoutes[item.id] || { primary: 'codecraft', fallback: 'google' };
            return (
              <div key={item.id} className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-1.5">
                <div className="font-bold text-white flex items-center justify-between">
                  <span>{item.label}</span>
                  <span className="text-[10px] text-sky-400 font-mono">Primary → Fallback</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <select
                    value={currentRoute.primary}
                    onChange={(e) => setTaskRoute(item.id, e.target.value, currentRoute.fallback)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-[11px]"
                  >
                    {providers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <span className="text-slate-400 text-xs">→</span>
                  <select
                    value={currentRoute.fallback || ''}
                    onChange={(e) => setTaskRoute(item.id, currentRoute.primary, e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-300 text-[11px]"
                  >
                    <option value="">None</option>
                    {providers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Provider Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 overflow-x-auto text-xs font-semibold gap-2">
        <div className="flex items-center gap-1.5">
          {providers.map((p) => {
            const isActive = selectedProviderTab === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedTab(p.id)}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <span>{p.name}</span>
                {p.connectionStatus?.connected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setShowAddCustomModal(true)}
          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1 shrink-0"
        >
          <Plus className="w-3.5 h-3.5 text-sky-400" />
          <span>Add Custom Endpoint</span>
        </button>
      </div>

      {/* 3. Selected Provider Configuration Workspace */}
      {activeProvider && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6 text-xs text-slate-300">
          {/* Header & Status Indicator */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-bold text-white">{activeProvider.name}</h3>
                {activeProvider.isLocal && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-800">
                    Local Offline
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400">
                {activeProvider.type === 'codecraft'
                  ? 'Dynamic OpenAI-compatible enterprise engine with automated model discovery and pricing.'
                  : activeProvider.type === 'ollama'
                  ? 'Local AI inference engine running on your system with zero token costs.'
                  : activeProvider.type === 'lmstudio'
                  ? 'Local model server running on port 1234.'
                  : `Configured adapter for ${activeProvider.name}.`}
              </div>
            </div>

            {/* Connection Status Pill */}
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  activeProvider.connectionStatus?.connected
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                    : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    activeProvider.connectionStatus?.connected ? 'bg-emerald-400' : 'bg-slate-400'
                  }`}
                />
                <span>
                  {activeProvider.connectionStatus?.connected ? 'Connected' : 'Not Connected'}
                </span>
                {activeProvider.connectionStatus?.latencyMs !== undefined && (
                  <span className="font-mono text-[10px] text-slate-400 ml-1">
                    ({activeProvider.connectionStatus.latencyMs}ms)
                  </span>
                )}
              </div>

              {activeProvider.type === 'custom_openai' && (
                <button
                  onClick={() => removeCustomProvider(activeProvider.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                  title="Remove custom endpoint"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Form Fields: Base URL & Secure API Key */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Base Endpoint URL</label>
              <input
                type="text"
                value={activeProvider.baseUrl || ''}
                onChange={(e) => setProviderBaseUrl(activeProvider.id, e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs"
              />
            </div>

            {!activeProvider.isLocal ? (
              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  API Key (Stored in OS Secure Credential Vault)
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder={maskedKey || 'Paste API key...'}
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleSaveKey}
                    disabled={!inputKey.trim()}
                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-semibold"
                  >
                    Save
                  </button>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Never written to logs, localStorage, or Git commits.</span>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-slate-400 font-medium mb-1">API Key</label>
                <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 font-mono text-[11px]">
                  Local endpoint does not require an API key.
                </div>
              </div>
            )}
          </div>

          {/* Action Row: Test Connection & Refresh Models */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => testProvider(activeProvider.id)}
                disabled={testingProviderId === activeProvider.id}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold flex items-center gap-2 shadow-md shadow-sky-600/30 transition disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${testingProviderId === activeProvider.id ? 'animate-spin' : ''}`} />
                <span>
                  {activeProvider.type === 'ollama'
                    ? 'Detect Ollama & Test'
                    : activeProvider.type === 'lmstudio'
                    ? 'Detect Server & Test'
                    : 'Test Connection'}
                </span>
              </button>

              <button
                onClick={() => refreshModels(activeProvider.id)}
                disabled={refreshingProviderId === activeProvider.id}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshingProviderId === activeProvider.id ? 'animate-spin' : ''}`} />
                <span>Refresh Models</span>
              </button>
            </div>

            {/* Models Dropdown */}
            <div className="flex items-center gap-2">
              <label className="text-slate-400 font-medium">Selected Model:</label>
              <select
                value={activeProvider.selectedModelId || ''}
                onChange={(e) => setSelectedModel(activeProvider.id, e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono text-xs min-w-[200px]"
              >
                {providerModels.length === 0 ? (
                  <option value="">No models detected (Click Refresh)</option>
                ) : (
                  providerModels.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name || m.id}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Connection Result Message if Present */}
          {activeProvider.connectionStatus && (
            <div
              className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                activeProvider.connectionStatus.connected
                  ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                  : 'bg-rose-950/30 border-rose-800/60 text-rose-300'
              }`}
            >
              {activeProvider.connectionStatus.connected ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="leading-relaxed">{activeProvider.connectionStatus.message}</div>
            </div>
          )}

          {/* Dynamic Model Capabilities Checklist (Read from API, never hardcoded) */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs uppercase tracking-wider">
                Model Capabilities (Inspected Dynamically from Endpoint)
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Context Window: {selectedModelDescriptor?.contextWindow ? `${selectedModelDescriptor.contextWindow.toLocaleString()} tokens` : 'Standard'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              {[
                { label: 'Streaming', enabled: selectedModelDescriptor?.capabilities.streaming !== false },
                { label: 'Reasoning', enabled: Boolean(selectedModelDescriptor?.capabilities.reasoning) },
                { label: 'Vision', enabled: Boolean(selectedModelDescriptor?.capabilities.vision) },
                { label: 'Tool Calling', enabled: Boolean(selectedModelDescriptor?.capabilities.toolCalling) },
                { label: 'JSON Mode', enabled: Boolean(selectedModelDescriptor?.capabilities.jsonMode) },
              ].map((cap, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border flex items-center justify-between ${
                    cap.enabled
                      ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300 font-semibold'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <span>{cap.label}</span>
                  {cap.enabled ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>
              ))}
            </div>

            {/* Dynamic Pricing Inspection (Never invented) */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400">Model Dynamic Pricing:</span>
              {selectedModelDescriptor?.pricing?.isAvailable &&
              selectedModelDescriptor.pricing.promptTokenPriceUsd !== undefined ? (
                <span className="text-emerald-400 font-bold">
                  Prompt: ${selectedModelDescriptor.pricing.promptTokenPriceUsd * 1000000}/1M tokens • Completion: ${selectedModelDescriptor.pricing.completionTokenPriceUsd! * 1000000}/1M tokens
                </span>
              ) : (
                <span className="text-slate-400 italic">Cost unavailable</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Cost Control Telemetry Dashboard */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            AI Usage & Cost Control Ledger
          </span>
          <span className="text-xs font-mono font-bold text-emerald-400">
            Total Session Cost: ${usageReport.estimatedCostUsd.toFixed(4)} USD
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <div className="text-slate-400 font-sans text-[11px]">Total Requests</div>
            <div className="text-lg font-bold text-white mt-0.5">{usageReport.totalRequests}</div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <div className="text-slate-400 font-sans text-[11px]">Input (Prompt) Tokens</div>
            <div className="text-lg font-bold text-sky-400 mt-0.5">{usageReport.promptTokens.toLocaleString()}</div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <div className="text-slate-400 font-sans text-[11px]">Output (Completion) Tokens</div>
            <div className="text-lg font-bold text-indigo-400 mt-0.5">{usageReport.completionTokens.toLocaleString()}</div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <div className="text-slate-400 font-sans text-[11px]">Total Tokens Billed</div>
            <div className="text-lg font-bold text-emerald-400 mt-0.5">{usageReport.totalTokens.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Add Custom Provider Modal */}
      {showAddCustomModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-sky-400" />
                Add Custom OpenAI-Compatible Provider
              </h3>
              <button onClick={() => setShowAddCustomModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustom} className="space-y-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Provider Display Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My Private vLLM Server"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Base URL (OpenAI Spec)</label>
                <input
                  type="text"
                  required
                  placeholder="http://localhost:8000/v1"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">API Key (Optional)</label>
                <input
                  type="password"
                  placeholder="Leave blank for local endpoints"
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddCustomModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold"
                >
                  Register Provider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
