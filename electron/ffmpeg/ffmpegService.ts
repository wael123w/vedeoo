import { spawn } from 'child_process';
import path from 'path';

export interface FFmpegRenderOptions {
  inputImages: string[];
  audioPath: string;
  outputPath: string;
  width: number;
  height: number;
  fps: number;
  durationPerScene: number[];
  transitions: string[];
}

export class FFmpegService {
  private ffmpegBinaryPath: string;

  constructor(customBinaryPath?: string) {
    this.ffmpegBinaryPath = customBinaryPath || 'ffmpeg';
  }

  /**
   * Validates FFmpeg installation and returns version info.
   */
  async checkInstallation(): Promise<{ installed: boolean; version?: string; path: string }> {
    return new Promise((resolve) => {
      const child = spawn(this.ffmpegBinaryPath, ['-version']);
      let output = '';

      child.stdout.on('data', (d) => { output += d.toString(); });
      child.on('error', () => {
        resolve({ installed: false, path: this.ffmpegBinaryPath });
      });
      child.on('close', (code) => {
        if (code === 0) {
          const firstLine = output.split('\n')[0] || '';
          resolve({ installed: true, version: firstLine, path: this.ffmpegBinaryPath });
        } else {
          resolve({ installed: false, path: this.ffmpegBinaryPath });
        }
      });
    });
  }

  /**
   * Safely renders a video using argument arrays (prevents shell injection vulnerabilities).
   */
  async renderVideo(
    options: FFmpegRenderOptions,
    onProgress?: (progressPercent: number) => void
  ): Promise<{ success: boolean; outputPath: string; error?: string }> {
    return new Promise((resolve) => {
      // Build safe argument array
      const args: string[] = ['-y'];

      // Add input images
      for (const img of options.inputImages) {
        args.push('-loop', '1', '-t', '8', '-i', path.resolve(img));
      }

      // Add audio
      if (options.audioPath) {
        args.push('-i', path.resolve(options.audioPath));
      }

      // Output specs (H.264 / AAC, vertical 1080x1920)
      args.push(
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-r', String(options.fps || 30),
        '-s', `${options.width}x${options.height}`,
        '-c:a', 'aac',
        '-b:a', '192k',
        '-shortest',
        path.resolve(options.outputPath)
      );

      const child = spawn(this.ffmpegBinaryPath, args);
      let stderr = '';

      child.stderr.on('data', (data) => {
        stderr += data.toString();
        // Parse ffmpeg progress time if available
        const timeMatch = stderr.match(/time=(\d{2}):(\d{2}):(\d{2}\.\d{2})/);
        if (timeMatch) {
          onProgress?.(50);
        }
      });

      child.on('error', (err) => {
        resolve({ success: false, outputPath: options.outputPath, error: err.message });
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true, outputPath: options.outputPath });
        } else {
          resolve({ success: false, outputPath: options.outputPath, error: stderr.slice(-300) });
        }
      });
    });
  }
}

export const desktopFFmpegService = new FFmpegService();
