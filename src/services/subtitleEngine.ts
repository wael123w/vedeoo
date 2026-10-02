import { SubtitleItem, SubtitleConfig, SubtitleStyle, Scene } from '../types';

export const DEFAULT_SUBTITLE_CONFIG: SubtitleConfig = {
  style: 'TikTok',
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontSize: 48,
  primaryColor: '#ffffff',
  highlightColor: '#facc15',
  strokeColor: '#000000',
  strokeWidth: 6,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  position: 'bottom',
  animation: 'bounce',
  wordHighlight: true,
};

export const SUBTITLE_STYLE_PRESETS: Record<SubtitleStyle, Partial<SubtitleConfig>> = {
  Classic: {
    style: 'Classic',
    fontFamily: 'sans-serif',
    fontSize: 42,
    primaryColor: '#ffffff',
    strokeColor: '#000000',
    strokeWidth: 4,
    backgroundColor: 'transparent',
    position: 'bottom',
    animation: 'none',
    wordHighlight: false,
  },
  Cinematic: {
    style: 'Cinematic',
    fontFamily: "'Georgia', serif",
    fontSize: 38,
    primaryColor: '#fef08a',
    strokeColor: '#09090b',
    strokeWidth: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    position: 'bottom',
    animation: 'fade',
    wordHighlight: false,
  },
  TikTok: {
    style: 'TikTok',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 52,
    primaryColor: '#ffffff',
    highlightColor: '#22d3ee',
    strokeColor: '#000000',
    strokeWidth: 8,
    backgroundColor: 'transparent',
    position: 'middle',
    animation: 'bounce',
    wordHighlight: true,
  },
  YouTube: {
    style: 'YouTube',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 46,
    primaryColor: '#ffffff',
    highlightColor: '#ef4444',
    strokeColor: '#000000',
    strokeWidth: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    position: 'bottom',
    animation: 'pop',
    wordHighlight: true,
  },
  Minimal: {
    style: 'Minimal',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 36,
    primaryColor: '#e2e8f0',
    strokeColor: 'transparent',
    strokeWidth: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    position: 'bottom',
    animation: 'none',
    wordHighlight: false,
  },
  Bold: {
    style: 'Bold',
    fontFamily: "'Impact', sans-serif",
    fontSize: 56,
    primaryColor: '#fbbf24',
    strokeColor: '#000000',
    strokeWidth: 9,
    backgroundColor: 'transparent',
    position: 'middle',
    animation: 'pop',
    wordHighlight: true,
  },
  Karaoke: {
    style: 'Karaoke',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 50,
    primaryColor: '#94a3b8',
    highlightColor: '#38bdf8',
    strokeColor: '#0f172a',
    strokeWidth: 7,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    position: 'middle',
    animation: 'bounce',
    wordHighlight: true,
  },
};

export class SubtitleEngine {
  /**
   * Generates synchronized subtitle items from a list of scenes.
   */
  generateFromScenes(scenes: Scene[]): SubtitleItem[] {
    let currentOffset = 0;
    const items: SubtitleItem[] = [];

    for (const scene of scenes) {
      const text = scene.subtitleText || scene.narration || '';
      if (!text.trim()) {
        currentOffset += scene.duration;
        continue;
      }

      // Split long narration into short digestible subtitle lines (approx 6-10 words per line)
      const words = text.trim().split(/\s+/);
      const chunkSize = 7;
      const chunks: string[] = [];

      for (let i = 0; i < words.length; i += chunkSize) {
        chunks.push(words.slice(i, i + chunkSize).join(' '));
      }

      const chunkDuration = scene.duration / (chunks.length || 1);

      chunks.forEach((chunk, idx) => {
        items.push({
          id: `sub-${scene.id}-${idx}`,
          sceneId: scene.id,
          startTime: Math.round((currentOffset + idx * chunkDuration) * 10) / 10,
          endTime: Math.round((currentOffset + (idx + 1) * chunkDuration) * 10) / 10,
          text: chunk,
        });
      });

      currentOffset += scene.duration;
    }

    return items;
  }

  /**
   * Exports subtitles to standard SubRip (.SRT) format.
   */
  exportToSRT(subtitles: SubtitleItem[]): string {
    const formatTime = (seconds: number) => {
      const pad = (num: number, size = 2) => String(Math.floor(num)).padStart(size, '0');
      const hrs = pad(seconds / 3600);
      const mins = pad((seconds % 3600) / 60);
      const secs = pad(seconds % 60);
      const ms = String(Math.floor((seconds % 1) * 1000)).padStart(3, '0');
      return `${hrs}:${mins}:${secs},${ms}`;
    };

    return subtitles
      .map((item, index) => {
        return `${index + 1}\n${formatTime(item.startTime)} --> ${formatTime(item.endTime)}\n${item.text}\n`;
      })
      .join('\n');
  }

  /**
   * Exports subtitles to WebVTT (.VTT) format.
   */
  exportToVTT(subtitles: SubtitleItem[]): string {
    const formatTime = (seconds: number) => {
      const pad = (num: number, size = 2) => String(Math.floor(num)).padStart(size, '0');
      const hrs = pad(seconds / 3600);
      const mins = pad((seconds % 3600) / 60);
      const secs = pad(seconds % 60);
      const ms = String(Math.floor((seconds % 1) * 1000)).padStart(3, '0');
      return `${hrs}:${mins}:${secs}.${ms}`;
    };

    const lines = ['WEBVTT\n'];
    subtitles.forEach((item, index) => {
      lines.push(`${index + 1}`);
      lines.push(`${formatTime(item.startTime)} --> ${formatTime(item.endTime)}`);
      lines.push(`${item.text}\n`);
    });

    return lines.join('\n');
  }

  /**
   * Renders burned-in subtitle overlay on an HTML5 2D Canvas.
   */
  renderSubtitleToCanvas(
    ctx: CanvasRenderingContext2D,
    subtitles: SubtitleItem[],
    currentTime: number,
    canvasWidth: number,
    canvasHeight: number,
    config: SubtitleConfig
  ): void {
    const currentSub = subtitles.find(
      (s) => currentTime >= s.startTime && currentTime <= s.endTime
    );

    if (!currentSub) return;

    ctx.save();

    // Determine Y position
    let yPos = canvasHeight * 0.85; // bottom default
    if (config.position === 'top') yPos = canvasHeight * 0.15;
    else if (config.position === 'middle') yPos = canvasHeight * 0.55;

    ctx.font = `bold ${config.fontSize}px ${config.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const words = currentSub.text.split(/\s+/);
    const subProgress = (currentTime - currentSub.startTime) / Math.max(0.1, currentSub.endTime - currentSub.startTime);
    const activeWordIdx = Math.min(words.length - 1, Math.floor(subProgress * words.length));

    // Word highlighting / Karaoke rendering
    if (config.wordHighlight) {
      const totalWidth = ctx.measureText(currentSub.text).width;
      let startX = (canvasWidth - totalWidth) / 2;

      // Draw background if configured
      if (config.backgroundColor && config.backgroundColor !== 'transparent') {
        const padding = 16;
        ctx.fillStyle = config.backgroundColor;
        ctx.fillRect(
          startX - padding,
          yPos - config.fontSize / 2 - padding / 2,
          totalWidth + padding * 2,
          config.fontSize + padding
        );
      }

      ctx.textAlign = 'left';
      words.forEach((word, wIdx) => {
        const wordText = word + ' ';
        const wordWidth = ctx.measureText(wordText).width;
        const isCurrentWord = wIdx === activeWordIdx;

        // Stroke
        if (config.strokeWidth > 0) {
          ctx.strokeStyle = config.strokeColor;
          ctx.lineWidth = config.strokeWidth;
          ctx.lineJoin = 'round';
          ctx.strokeText(wordText, startX, yPos);
        }

        // Fill
        ctx.fillStyle = isCurrentWord ? config.highlightColor : config.primaryColor;
        ctx.fillText(wordText, startX, yPos);

        startX += wordWidth;
      });
    } else {
      // Classic centered line rendering
      const textWidth = ctx.measureText(currentSub.text).width;
      if (config.backgroundColor && config.backgroundColor !== 'transparent') {
        const padX = 24;
        const padY = 12;
        ctx.fillStyle = config.backgroundColor;
        ctx.fillRect(
          (canvasWidth - textWidth) / 2 - padX,
          yPos - config.fontSize / 2 - padY,
          textWidth + padX * 2,
          config.fontSize + padY * 2
        );
      }

      if (config.strokeWidth > 0) {
        ctx.strokeStyle = config.strokeColor;
        ctx.lineWidth = config.strokeWidth;
        ctx.lineJoin = 'round';
        ctx.strokeText(currentSub.text, canvasWidth / 2, yPos);
      }

      ctx.fillStyle = config.primaryColor;
      ctx.fillText(currentSub.text, canvasWidth / 2, yPos);
    }

    ctx.restore();
  }
}

export const subtitleEngine = new SubtitleEngine();
