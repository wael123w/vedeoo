# StoryForge AI — AI Short Story & Novel Video Creator

> **Production-Grade Windows Desktop Creative Studio Application**  
> Turn your long-form stories, novels, and series into high-retention, cliffhanger-driven vertical videos optimized for TikTok, Instagram Reels, Facebook Reels, and YouTube Shorts.

---

## 🌟 Overview

StoryForge AI is an Electron + React + TypeScript desktop application for creative storytellers, authors, screenwriters, and content studios. It enables you to:
1. **Import or write full stories** in TXT, Markdown, or direct manuscript paste.
2. **Deeply analyze narrative arcs**, character relationships, timeline events, and style rules into an editable **Story Bible**.
3. **Enforce 100% Character & Location consistency** by automatically injecting canonical traits into visual prompts.
4. **Intelligently split stories into episodic cliffhangers** tailored for 30s, 45s, 60s, or 90s vertical video.
5. **Generate and customize synchronized narration, dialogue, and word-pop subtitles** (TikTok, YouTube, Cinematic, Bold, Karaoke).
6. **Apply smooth Ken Burns camera pan/zoom effects** and cinematic transitions.
7. **Assemble and render real 1080×1920 MP4 vertical videos** with multi-track audio ducking.
8. **Generate viral platform-tailored social copy** and schedule/publish through official APIs.

---

## 📁 Project Structure

```
storyforge-ai/
├── electron/
│   ├── main.ts             # Secure Electron main process
│   ├── preload.ts          # Typed, contextIsolated window.electronAPI bridge
│   ├── database/
│   │   └── schema.sql      # SQLite tables & relational migrations
│   ├── ffmpeg/
│   │   └── ffmpegService.ts# Native FFmpeg video rendering & argument array security
│   ├── services/
│   │   ├── licenseService.ts# Free / Pro / Business licensing abstraction
│   │   └── updateService.ts # Auto-update management service
│   └── security/
│       └── ipcSecurity.ts  # Channel allowlist & safe path traversal validator
│
├── src/
│   ├── components/
│   │   ├── common/         # ToastContainer, FirstRunWizard, Modals
│   │   ├── layout/         # Topbar, Sidebar
│   │   ├── dashboard/      # Real-time analytics & production workflow strip
│   │   ├── projects/       # Project workspaces & novel manager
│   │   ├── stories/        # Story editor & Story Bible inspector
│   │   ├── characters/     # Canonical cast manager & voice auditioning
│   │   ├── locations/      # World bible & atmospheric sets
│   │   ├── episodes/       # Cliffhanger generator & episode breakdown
│   │   ├── video/          # Interactive canvas preview, timeline & MP4 renderer
│   │   ├── media/          # Project media assets library
│   │   ├── templates/      # 9 Video templates & Studio Brand Kit
│   │   ├── publishing/     # Publishing Center, OAuth status & scheduler
│   │   └── settings/       # AI providers, cost control, logs & privacy
│   ├── data/
│   │   └── demoProject.ts  # "The Mystery Door" full demonstration project
│   ├── i18n/
│   │   ├── en.json         # English translations
│   │   └── ar.json         # Arabic translations (with full RTL support)
│   ├── services/
│   │   ├── aiClient.ts     # Google Gemini SDK & local OpenAI-compatible client
│   │   ├── promptEngine.ts # Modular prompt builders & continuity engine
│   │   ├── subtitleEngine.ts# SRT, VTT, and canvas burned-in subtitle renderer
│   │   ├── videoRenderer.ts# Real canvas + WebAudio multi-track video synthesizer
│   │   ├── ttsService.ts   # TTS speech synthesis & audio cache
│   │   └── storage.ts      # Unified SQLite / local persistence layer
│   ├── stores/             # Zustand state management
│   ├── tests/              # Automated verification test suite
│   ├── types/              # Strict TypeScript interfaces
│   ├── App.tsx             # Root application shell
│   └── main.tsx            # React 19 entry point
│
├── electron-builder.json   # Windows NSIS & Portable EXE packaging config
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 🔒 Security Architecture

StoryForge AI enforces strict Electron security best practices:
- `contextIsolation: true`
- `nodeIntegration: false`
- `sandbox: true`
- **Zero raw Node primitives exposed**: Neither `fs`, `child_process`, `shell`, nor `require` are ever leaked to the React renderer.
- **Allowlisted IPC Channels**: All IPC calls are validated against a strict compile-time allowlist (`ALLOWED_IPC_CHANNELS`).
- **Path Traversal Protection**: All filesystem access is normalized and strictly confined within the user's workspace directory.
- **Safe FFmpeg Command Arrays**: FFmpeg processes are executed using argument arrays (`spawn`), preventing arbitrary shell injection vulnerabilities.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (for development)
- Windows 10 or 11 (64-bit)

### Installation
```bash
# Clone the repository
git clone https://github.com/storyforge/storyforge-ai.git
cd storyforge-ai

# Install dependencies
npm install
```

### Running Development Mode
```bash
# Starts the Vite development server & studio interface
npm run dev
```

### Building for Production
```bash
# Compile and package client code
npm run build
```

### Packaging for Windows
StoryForge AI packages directly into native Windows installers:
- **NSIS Installer (.exe)**: Complete Windows installer with desktop shortcut and uninstaller.
- **Portable Standalone (.exe)**: Zero-install portable executable.

```bash
# Package Windows 64-bit executables
npm run dist
```
Artifacts are generated in the `dist-electron/` folder.

---

## 🤖 AI Provider Setup

### 1. Google Gemini AI
1. Go to **Settings → AI Providers**.
2. Select **Google Gemini AI**.
3. Enter your Gemini API key (uses `gemini-3.8-flash` for high-speed narrative breakdown and `gemini-3.1-flash-lite-image` for scene imagery).
4. Click **Test Connection** to verify latency and model status.

### 2. Local AI (Ollama / LocalAI)
1. Install and start Ollama locally (`ollama run llama3`).
2. Set Endpoint to `http://localhost:11434/v1`.
3. Test Connection to verify local offline inference.

### 3. Built-In Offline Fallback
If no API key is provided, StoryForge AI automatically switches to deterministic NLP narrative analysis and procedural scene generation so you can test all features and render videos 100% offline.

---

## 🎬 Video & FFmpeg Engine

### Supported Video Formats:
- **Vertical 9:16 (1080×1920)** — Default for TikTok, Reels, Shorts
- **Horizontal 16:9 (1920×1080)** — YouTube Widescreen
- **Square 1:1 (1080×1080)** — Instagram Feed

### Features:
- **Ken Burns Camera Motion**: Zoom In, Zoom Out, Pan Left, Pan Right, Pan Up, Pan Down.
- **Dynamic Transitions**: Fade, Crossfade, Dip to Black, Slide.
- **Burned-in Subtitle Engine**: TikTok, YouTube, Cinematic, Minimal, Bold, Karaoke with word-level highlight animation.
- **Multi-Track Audio Ducking**: Automatically attenuates background music when narration or dialogue is speaking.
- **Brand Watermark Overlay**: High-resolution logo or handle watermark at custom opacity and corner position.

---

## 🌐 Internationalization (i18n)

- **English (LTR)**: Default studio layout.
- **Arabic (العربية RTL)**: Complete right-to-left layout with Arabic typography (Cairo font), mirroring sidebars and editor panels.
- Toggle instantly from the header top bar or during the **First Run Setup Wizard**.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + S` | Save Project Changes |
| `Space` | Play / Pause Video Preview |
| `Ctrl + Z` | Undo |
| `Ctrl + Shift + Z` | Redo |
| `Ctrl + R` | Quick Render Active Episode |

---

## 📄 License
StoryForge AI Studio Desktop Application. Commercial and modular licensing ready (Free, Pro, Business tiers).
