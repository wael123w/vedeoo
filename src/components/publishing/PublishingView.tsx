import React, { useState, useEffect } from 'react';
import {
  Share2,
  Youtube,
  Calendar,
  Clock,
  Send,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Layers,
  Wand2,
  X,
  Plus,
} from 'lucide-react';
import { usePublishingStore } from '../../stores/usePublishingStore';
import { useProjectStore } from '../../stores/useProjectStore';
import { useUIStore } from '../../stores/useUIStore';
import { useAIStore } from '../../stores/useAIStore';
import { aiClient } from '../../services/aiClient';
import { SocialMetadata, Episode } from '../../types';

export const PublishingView: React.FC = () => {
  const {
    accounts,
    jobs,
    loadPublishing,
    connectAccount,
    disconnectAccount,
    scheduleEpisode,
    retryPublishingJob,
    cancelPublishingJob,
    isConnectingPlatform,
  } = usePublishingStore();

  const { activeProject, episodes, storyBible, updateEpisode } = useProjectStore();
  const { addToast, t } = useUIStore();

  const [activeTab, setActiveTab] = useState<'queue' | 'metadata' | 'accounts'>('queue');
  const [selectedEpId, setSelectedEpId] = useState<string>(episodes[0]?.id || '');
  const [targetPlatform, setTargetPlatform] = useState<'youtube' | 'tiktok' | 'instagram' | 'facebook'>('tiktok');
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [isGeneratingMeta, setIsGeneratingMeta] = useState(false);

  // Connect credentials modal
  const [connectModalPlatform, setConnectModalPlatform] = useState<string | null>(null);
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    loadPublishing();
  }, [loadPublishing]);

  useEffect(() => {
    if (episodes.length > 0 && !selectedEpId) {
      setSelectedEpId(episodes[0].id);
    }
  }, [episodes, selectedEpId]);

  const activeEp = episodes.find((e) => e.id === selectedEpId) || episodes[0];

  const handleConnect = async (platform: 'youtube' | 'tiktok' | 'instagram' | 'facebook') => {
    const res = await connectAccount(platform, { clientId, clientSecret });
    if (res.success) {
      addToast('success', 'Account Authorized', res.message);
      setConnectModalPlatform(null);
    } else {
      addToast('error', 'OAuth Error', res.message);
    }
  };

  const handleGenerateMetadata = async () => {
    if (!activeEp || !storyBible) return;
    setIsGeneratingMeta(true);
    try {
      const meta = await aiClient.generateSocialMetadata(activeEp, storyBible);
      await updateEpisode({ ...activeEp, socialMetadata: meta });
      addToast('success', 'Social Metadata Generated', `Captions tailored for TikTok, Reels & YouTube Shorts.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      addToast('error', 'Generation Error', msg);
    } finally {
      setIsGeneratingMeta(false);
    }
  };

  const handleSchedulePost = async (isImmediate: boolean) => {
    if (!activeEp || !activeProject) return;

    const account = accounts.find((a) => a.platform === targetPlatform);
    if (!account?.connected) {
      addToast('warning', 'Platform Not Connected', `Please connect your official ${targetPlatform.toUpperCase()} account in the Accounts tab first.`);
      return;
    }

    const scheduledTime = isImmediate ? undefined : scheduledDate ? new Date(scheduledDate).getTime() : undefined;
    await scheduleEpisode(activeEp, activeProject, targetPlatform, scheduledTime);
    addToast('success', isImmediate ? 'Publishing Now' : 'Scheduled', `Queued ${activeEp.title} for ${targetPlatform.toUpperCase()}`);
    setActiveTab('queue');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Share2 className="w-5 h-5 text-sky-400" />
            {t('publishing.title')}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {t('publishing.subtitle')}
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'queue' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('publishing.queue')} ({jobs.length})
          </button>
          <button
            onClick={() => setActiveTab('metadata')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'metadata' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('publishing.metadata_tab')}
          </button>
          <button
            onClick={() => setActiveTab('accounts')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'accounts' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Connected Channels ({accounts.filter((a) => a.connected).length}/4)
          </button>
        </div>
      </div>

      {/* Tab: Publishing Queue & Quick Schedule */}
      {activeTab === 'queue' && (
        <div className="space-y-6">
          {/* Schedule Form Strip */}
          {activeEp && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <span className="font-bold text-white text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-sky-400" />
                  Schedule Video Post
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Targeting: Episode {activeEp.episodeNumber}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Select Episode</label>
                  <select
                    value={activeEp.id}
                    onChange={(e) => setSelectedEpId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
                  >
                    {episodes.map((ep) => (
                      <option key={ep.id} value={ep.id}>
                        Ep {ep.episodeNumber}: {ep.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Platform Channel</label>
                  <select
                    value={targetPlatform}
                    onChange={(e) => setTargetPlatform(e.target.value as typeof targetPlatform)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white capitalize font-semibold"
                  >
                    <option value="tiktok">TikTok Video API</option>
                    <option value="youtube">YouTube Shorts</option>
                    <option value="instagram">Instagram Reels</option>
                    <option value="facebook">Facebook Reels</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Schedule Date & Time</label>
                  <input
                    type="datetime-local"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1 text-white"
                  />
                </div>

                <div className="flex items-end gap-2">
                  <button
                    onClick={() => handleSchedulePost(true)}
                    className="flex-1 py-2 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Publish Now</span>
                  </button>
                  <button
                    onClick={() => handleSchedulePost(false)}
                    disabled={!scheduledDate}
                    className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs disabled:opacity-50"
                  >
                    Schedule
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Queue Jobs Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <span className="font-bold text-white text-xs uppercase tracking-wider">
                Publication Jobs & Broadcast Status
              </span>
            </div>

            {jobs.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-xs">
                No active publishing jobs in the queue.
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/70 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Platform</th>
                    <th className="py-3 px-4">Title / Video</th>
                    <th className="py-3 px-4">Scheduled For</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-bold text-white capitalize">{job.platform}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200">{job.title}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">{job.caption}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {job.scheduledTime ? new Date(job.scheduledTime).toLocaleString() : 'Immediate'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            job.status === 'Published'
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                              : job.status === 'Uploading'
                              ? 'bg-sky-950/80 text-sky-300 border border-sky-800 animate-pulse'
                              : job.status === 'Failed'
                              ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                              : 'bg-amber-950/80 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {job.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {job.publishedUrl && (
                            <a
                              href={job.publishedUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 text-sky-400 hover:text-white"
                              title="Open Published Video"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {job.status === 'Failed' && (
                            <button
                              onClick={() => retryPublishingJob(job.id)}
                              className="p-1 text-amber-400 hover:text-white"
                              title="Retry Publishing"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {job.status === 'Pending' && (
                            <button
                              onClick={() => cancelPublishingJob(job.id)}
                              className="p-1 text-slate-400 hover:text-rose-400"
                              title="Cancel Scheduled Job"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Tab: Generated Social Metadata */}
      {activeTab === 'metadata' && activeEp && (
        <div className="space-y-5">
          <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <div>
              <h3 className="text-sm font-bold text-white">Social Copy & SEO Metadata</h3>
              <p className="text-xs text-slate-400">
                Tailored high-converting titles, descriptions, and hashtag groups for Episode {activeEp.episodeNumber}.
              </p>
            </div>
            <button
              onClick={handleGenerateMetadata}
              disabled={isGeneratingMeta}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow transition"
            >
              <Wand2 className={`w-3.5 h-3.5 ${isGeneratingMeta ? 'animate-spin' : ''}`} />
              <span>{isGeneratingMeta ? 'Writing Viral Copy...' : 'Generate Platform Copy'}</span>
            </button>
          </div>

          {activeEp.socialMetadata ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="font-bold text-sky-400 uppercase text-[11px]">TikTok Caption</span>
                <textarea
                  rows={4}
                  value={activeEp.socialMetadata.tiktokCaption}
                  onChange={(e) => {
                    const meta = { ...activeEp.socialMetadata!, tiktokCaption: e.target.value };
                    updateEpisode({ ...activeEp, socialMetadata: meta });
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="font-bold text-rose-400 uppercase text-[11px]">Instagram Reels Caption</span>
                <textarea
                  rows={4}
                  value={activeEp.socialMetadata.instagramCaption}
                  onChange={(e) => {
                    const meta = { ...activeEp.socialMetadata!, instagramCaption: e.target.value };
                    updateEpisode({ ...activeEp, socialMetadata: meta });
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="font-bold text-red-400 uppercase text-[11px]">YouTube Shorts Title</span>
                <input
                  type="text"
                  value={activeEp.socialMetadata.youtubeTitle}
                  onChange={(e) => {
                    const meta = { ...activeEp.socialMetadata!, youtubeTitle: e.target.value };
                    updateEpisode({ ...activeEp, socialMetadata: meta });
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium"
                />
                <span className="font-bold text-red-400 uppercase text-[11px] block pt-1">Description</span>
                <textarea
                  rows={3}
                  value={activeEp.socialMetadata.youtubeDescription}
                  onChange={(e) => {
                    const meta = { ...activeEp.socialMetadata!, youtubeDescription: e.target.value };
                    updateEpisode({ ...activeEp, socialMetadata: meta });
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="font-bold text-amber-400 uppercase text-[11px]">Hashtags & Keywords</span>
                <div className="flex flex-wrap gap-1.5">
                  {activeEp.socialMetadata.hashtags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-sky-300 font-mono text-[11px]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-10 text-center text-slate-400 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
              Click &quot;Generate Platform Copy&quot; to build captions, hashtags, and titles.
            </div>
          )}
        </div>
      )}

      {/* Tab: Connected Social Accounts */}
      {activeTab === 'accounts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white capitalize">{acc.platform}</h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      acc.connected
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {acc.connected ? 'Connected' : 'Not Connected'}
                  </span>
                </div>
                <div className="text-xs text-slate-300 font-medium">{acc.accountName}</div>
                <div className="text-[11px] text-slate-400">{acc.statusMessage}</div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800 font-mono text-[10px] text-slate-400">
                  Scopes: {acc.scopes.join(', ')}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                {acc.connected ? (
                  <button
                    onClick={() => disconnectAccount(acc.platform)}
                    className="px-3 py-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 font-semibold"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={() => setConnectModalPlatform(acc.platform)}
                    className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold"
                  >
                    Connect Official OAuth
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Connect Modal */}
      {connectModalPlatform && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white capitalize">
                Connect {connectModalPlatform} API
              </h3>
              <button onClick={() => setConnectModalPlatform(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-300 leading-relaxed">
              StoryForge AI integrates via the official {connectModalPlatform.toUpperCase()} developer API. We never store passwords or scrape web sessions.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Developer Client ID / App ID</label>
                <input
                  type="text"
                  placeholder="Official App Client ID..."
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1">Client Secret</label>
                <input
                  type="password"
                  placeholder="App Client Secret..."
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setConnectModalPlatform(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleConnect(connectModalPlatform as 'youtube' | 'tiktok' | 'instagram' | 'facebook')}
                className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Authorize Channel</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
