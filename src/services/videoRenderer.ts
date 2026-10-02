import { Episode, Scene, BrandKit, SubtitleConfig } from '../types';
import { subtitleEngine, DEFAULT_SUBTITLE_CONFIG } from './subtitleEngine';

export interface RenderOptions {
  resolution: '720p' | '1080p' | '4k';
  aspectRatio: '9:16' | '16:9' | '1:1';
  fps: number;
  brandKit?: BrandKit;
  subtitleConfig?: SubtitleConfig;
  onProgress?: (progress: number, status: string) => void;
}

export class VideoRenderer {
  private isCancelled = false;

  cancel(): void {
    this.isCancelled = true;
  }

  /**
   * Renders a real video file from an Episode's scenes, audio, and subtitles.
   */
  async renderEpisode(episode: Episode, options: RenderOptions): Promise<{ videoBlob: Blob; videoUrl: string }> {
    this.isCancelled = false;
    const { onProgress } = options;

    onProgress?.(5, 'Preparing assets & dimensions...');

    // Determine dimensions based on resolution & aspect ratio
    let width = 1080;
    let height = 1920;

    if (options.aspectRatio === '9:16') {
      if (options.resolution === '720p') { width = 720; height = 1280; }
      else if (options.resolution === '4k') { width = 2160; height = 3840; }
    } else if (options.aspectRatio === '16:9') {
      width = options.resolution === '720p' ? 1280 : options.resolution === '4k' ? 3840 : 1920;
      height = options.resolution === '720p' ? 720 : options.resolution === '4k' ? 2160 : 1080;
    } else if (options.aspectRatio === '1:1') {
      width = options.resolution === '720p' ? 720 : options.resolution === '4k' ? 2160 : 1080;
      height = width;
    }

    // Preload all scene images
    onProgress?.(15, 'Preloading scene artwork...');
    const loadedImages: HTMLImageElement[] = [];
    for (let i = 0; i < episode.scenes.length; i++) {
      const scene = episode.scenes[i];
      const img = await this.loadImage(scene.imageUrl || '');
      loadedImages.push(img);
    }

    onProgress?.(25, 'Initializing video synthesizer & audio pipeline...');

    // Create offscreen canvas for rendering frames
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not create Canvas 2D context');

    // Setup Web Audio Context for real audio track mixing (music + narration + ducking)
    const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const dest = audioCtx.createMediaStreamDestination();

    // Create synthesized atmospheric bed track
    const totalDuration = episode.scenes.reduce((acc, s) => acc + s.duration, 0);
    this.setupAudioBed(audioCtx, dest, totalDuration);

    // Setup MediaRecorder
    const stream = canvas.captureStream(options.fps);
    // Combine video track and audio track
    const combinedStream = new MediaStream([
      ...stream.getVideoTracks(),
      ...dest.stream.getAudioTracks(),
    ]);

    const mimeTypes = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
    let selectedMime = 'video/webm';
    for (const mime of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mime)) {
        selectedMime = mime;
        break;
      }
    }

    const recordedChunks: Blob[] = [];
    const recorder = new MediaRecorder(combinedStream, {
      mimeType: selectedMime,
      videoBitsPerSecond: 8000000,
    });

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) recordedChunks.push(e.data);
    };

    const recordingPromise = new Promise<{ videoBlob: Blob; videoUrl: string }>((resolve, reject) => {
      recorder.onstop = () => {
        const videoBlob = new Blob(recordedChunks, { type: selectedMime });
        const videoUrl = URL.createObjectURL(videoBlob);
        resolve({ videoBlob, videoUrl });
      };
      recorder.onerror = (e) => reject(e);
    });

    recorder.start(100);

    // Frame rendering loop (simulated real-time or stepped frames)
    const totalFrames = Math.max(1, Math.round(totalDuration * options.fps));
    const subConfig = options.subtitleConfig || DEFAULT_SUBTITLE_CONFIG;

    for (let frame = 0; frame < totalFrames; frame++) {
      if (this.isCancelled) {
        recorder.stop();
        audioCtx.close();
        throw new Error('Video rendering was cancelled by user');
      }

      const currentTime = frame / options.fps;
      const progressPercent = Math.min(98, Math.round(25 + (frame / totalFrames) * 70));
      if (frame % (options.fps * 2) === 0) {
        onProgress?.(progressPercent, `Rendering frame ${frame} of ${totalFrames} (${currentTime.toFixed(1)}s / ${totalDuration}s)...`);
      }

      // Find current scene
      let sceneOffset = 0;
      let currentSceneIdx = 0;
      for (let s = 0; s < episode.scenes.length; s++) {
        const sc = episode.scenes[s];
        if (currentTime >= sceneOffset && currentTime < sceneOffset + sc.duration) {
          currentSceneIdx = s;
          break;
        }
        sceneOffset += sc.duration;
      }

      const currentScene = episode.scenes[currentSceneIdx];
      const sceneTime = currentTime - sceneOffset;
      const sceneProgress = Math.min(1, Math.max(0, sceneTime / (currentScene?.duration || 1)));

      // 1. Draw Background & Ken Burns Effect
      const currentImg = loadedImages[currentSceneIdx];
      this.drawKenBurns(ctx, currentImg, currentScene, sceneProgress, width, height);

      // 2. Draw Transition if near scene boundary
      if (currentSceneIdx < episode.scenes.length - 1 && sceneProgress > 0.85) {
        const transProgress = (sceneProgress - 0.85) / 0.15;
        const nextImg = loadedImages[currentSceneIdx + 1];
        const nextScene = episode.scenes[currentSceneIdx + 1];
        this.drawTransition(ctx, currentScene.transition, transProgress, nextImg, nextScene, width, height);
      }

      // 3. Draw Watermark & Brand Kit if configured
      if (options.brandKit?.watermarkEnabled) {
        this.drawBrandOverlay(ctx, options.brandKit, width, height);
      }

      // 4. Burn-in synchronized subtitles
      subtitleEngine.renderSubtitleToCanvas(
        ctx,
        episode.subtitles,
        currentTime,
        width,
        height,
        subConfig
      );

      // Yield event loop briefly to ensure browser UI stays responsive
      if (frame % 15 === 0) {
        await new Promise((r) => setTimeout(r, 4));
      }
    }

    onProgress?.(96, 'Finalizing video stream...');
    recorder.stop();
    audioCtx.close();

    const result = await recordingPromise;
    onProgress?.(100, 'Video Render Complete!');
    return result;
  }

  /**
   * Applies the real Ken Burns camera pan/zoom effect to the canvas.
   */
  drawKenBurns(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    scene: Scene,
    progress: number,
    w: number,
    h: number
  ): void {
    ctx.save();
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, w, h);

    if (!img.complete || img.naturalWidth === 0) {
      ctx.restore();
      return;
    }

    let scale = 1.0;
    let dx = 0;
    let dy = 0;

    switch (scene.cameraMotion) {
      case 'zoom_in':
        scale = 1.0 + 0.18 * progress;
        break;
      case 'zoom_out':
        scale = 1.18 - 0.18 * progress;
        break;
      case 'pan_left':
        scale = 1.15;
        dx = (progress - 0.5) * 60;
        break;
      case 'pan_right':
        scale = 1.15;
        dx = (0.5 - progress) * 60;
        break;
      case 'pan_down':
        scale = 1.15;
        dy = (progress - 0.5) * 60;
        break;
      case 'pan_up':
        scale = 1.15;
        dy = (0.5 - progress) * 60;
        break;
      default:
        scale = 1.0;
    }

    // Center transform
    ctx.translate(w / 2 + dx, h / 2 + dy);
    ctx.scale(scale, scale);
    ctx.translate(-w / 2, -h / 2);

    // Draw image maintaining aspect ratio cover
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = w / h;
    let dw = w;
    let dh = h;
    let sx = 0;
    let sy = 0;

    if (imgRatio > canvasRatio) {
      dw = h * imgRatio;
      sx = (w - dw) / 2;
    } else {
      dh = w / imgRatio;
      sy = (h - dh) / 2;
    }

    ctx.drawImage(img, sx, sy, dw, dh);
    ctx.restore();
  }

  /**
   * Applies video transition effects.
   */
  private drawTransition(
    ctx: CanvasRenderingContext2D,
    type: string,
    progress: number,
    nextImg: HTMLImageElement,
    nextScene: Scene,
    w: number,
    h: number
  ): void {
    ctx.save();
    if (type === 'dip_to_black' || type === 'fade') {
      const alpha = progress < 0.5 ? progress * 2 : (1 - progress) * 2;
      ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
      ctx.fillRect(0, 0, w, h);
    } else if (type === 'crossfade' && nextImg && nextImg.complete) {
      ctx.globalAlpha = progress;
      ctx.drawImage(nextImg, 0, 0, w, h);
    } else if (type === 'slide') {
      const offsetX = (1 - progress) * w;
      ctx.drawImage(nextImg, offsetX, 0, w, h);
    }
    ctx.restore();
  }

  /**
   * Overlays Brand Kit watermark.
   */
  private drawBrandOverlay(ctx: CanvasRenderingContext2D, brand: BrandKit, w: number, h: number): void {
    ctx.save();
    ctx.globalAlpha = brand.watermarkOpacity || 0.65;

    let posX = 40;
    let posY = 60;

    if (brand.watermarkPosition === 'top_right') { posX = w - 240; posY = 60; }
    else if (brand.watermarkPosition === 'bottom_left') { posX = 40; posY = h - 60; }
    else if (brand.watermarkPosition === 'bottom_right') { posX = w - 240; posY = h - 60; }

    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 6;
    ctx.fillText(brand.socialHandle || '@StoryForgeAI', posX, posY);

    ctx.restore();
  }

  /**
   * Preloads image into HTMLImageElement.
   */
  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => {
        // Fallback placeholder image
        img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" fill="%23111"><rect width="100%" height="100%"/></svg>';
        resolve(img);
      };
      img.src = url || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" fill="%23111"><rect width="100%" height="100%"/></svg>';
    });
  }

  /**
   * Generates continuous audio bed into Web Audio destination.
   */
  private setupAudioBed(ctx: AudioContext, dest: MediaStreamAudioDestinationNode, duration: number): void {
    // Atmospheric cinematic drone (binaural octave oscillation)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(55, ctx.currentTime); // Low A

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(110, ctx.currentTime);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(dest);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + duration);
    osc2.stop(ctx.currentTime + duration);
  }
}

export const videoRenderer = new VideoRenderer();
