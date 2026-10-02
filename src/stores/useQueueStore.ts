import { create } from 'zustand';
import { BackgroundJob, JobStatus, JobType } from '../types';

interface QueueState {
  jobs: BackgroundJob[];
  activeRenderJob: BackgroundJob | null;

  // Actions
  addJob: (type: JobType, projectId: string, title: string, episodeId?: string, sceneId?: string) => string;
  updateJob: (id: string, patch: Partial<BackgroundJob>) => void;
  removeJob: (id: string) => void;
  cancelJob: (id: string) => void;
  retryJob: (id: string) => void;
}

export const useQueueStore = create<QueueState>((set, get) => ({
  jobs: [
    {
      id: 'job-init-1',
      type: 'StoryAnalysis',
      projectId: 'demo-mystery-door',
      status: 'Completed',
      progress: 100,
      title: 'Analyze The Mystery Door story',
      createdAt: Date.now() - 3600000 * 2,
      startedAt: Date.now() - 3600000 * 2,
      completedAt: Date.now() - 3600000 * 2 + 4000,
      retryCount: 0,
    },
    {
      id: 'job-init-2',
      type: 'EpisodeGeneration',
      projectId: 'demo-mystery-door',
      status: 'Completed',
      progress: 100,
      title: 'Generate 3 vertical episodes',
      createdAt: Date.now() - 3600000,
      startedAt: Date.now() - 3600000,
      completedAt: Date.now() - 3600000 + 3500,
      retryCount: 0,
    },
  ],
  activeRenderJob: null,

  addJob: (type, projectId, title, episodeId, sceneId) => {
    const id = `job-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const newJob: BackgroundJob = {
      id,
      type,
      projectId,
      episodeId,
      sceneId,
      status: 'Running',
      progress: 0,
      title,
      createdAt: Date.now(),
      startedAt: Date.now(),
      retryCount: 0,
    };

    set((state) => {
      const activeRenderJob = type === 'VideoRendering' ? newJob : state.activeRenderJob;
      return { jobs: [newJob, ...state.jobs], activeRenderJob };
    });

    return id;
  },

  updateJob: (id, patch) => {
    set((state) => {
      const jobs = state.jobs.map((j) => {
        if (j.id !== id) return j;
        const updated = { ...j, ...patch };
        if (patch.status === 'Completed' || patch.status === 'Failed') {
          updated.completedAt = Date.now();
        }
        return updated;
      });

      let activeRenderJob = state.activeRenderJob;
      if (activeRenderJob && activeRenderJob.id === id) {
        if (patch.status === 'Completed' || patch.status === 'Failed' || patch.status === 'Cancelled') {
          activeRenderJob = null;
        } else {
          activeRenderJob = { ...activeRenderJob, ...patch };
        }
      }

      return { jobs, activeRenderJob };
    });
  },

  removeJob: (id) => {
    set((state) => ({
      jobs: state.jobs.filter((j) => j.id !== id),
      activeRenderJob: state.activeRenderJob?.id === id ? null : state.activeRenderJob,
    }));
  },

  cancelJob: (id) => {
    get().updateJob(id, { status: 'Cancelled', details: 'Cancelled by user' });
  },

  retryJob: (id) => {
    const job = get().jobs.find((j) => j.id === id);
    if (!job) return;
    get().updateJob(id, {
      status: 'Running',
      progress: 0,
      error: undefined,
      retryCount: job.retryCount + 1,
      startedAt: Date.now(),
    });
  },
}));
