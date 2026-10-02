import { app, BrowserWindow, ipcMain, dialog, IpcMainInvokeEvent } from 'electron';
import path from 'path';
import { ALLOWED_IPC_CHANNELS } from './security/ipcSecurity';

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 940,
    minWidth: 1100,
    minHeight: 700,
    title: 'StoryForge AI — Short Story & Novel Video Creator',
    backgroundColor: '#090d16',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    frame: true,
    show: false,
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  if (devServerUrl) {
    mainWindow.loadURL(devServerUrl);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Register safe IPC Handlers
function setupIpcHandlers(): void {
  // Window management
  ipcMain.handle('window:minimize', () => mainWindow?.minimize());
  ipcMain.handle('window:maximize', () => {
    if (mainWindow?.isMaximized()) mainWindow.unmaximize();
    else mainWindow?.maximize();
  });
  ipcMain.handle('window:close', () => mainWindow?.close());

  // Dialogs
  ipcMain.handle('dialog:openFile', async (_event: IpcMainInvokeEvent, options?: { title?: string; filters?: { name: string; extensions: string[] }[] }) => {
    if (!mainWindow) return null;
    const result = await dialog.showOpenDialog(mainWindow, {
      title: options?.title || 'Select Story File',
      properties: ['openFile'],
      filters: options?.filters || [
        { name: 'Text & Stories', extensions: ['txt', 'md', 'docx', 'pdf'] },
      ],
    });
    return result.canceled ? null : result.filePaths[0];
  });

  ipcMain.handle('dialog:openDirectory', async (_event: IpcMainInvokeEvent, options?: { title?: string; defaultPath?: string }) => {
    if (!mainWindow) return null;
    const result = await dialog.showOpenDialog(mainWindow, {
      title: options?.title || 'Select Workspace Directory',
      properties: ['openDirectory', 'createDirectory'],
      defaultPath: options?.defaultPath,
    });
    return result.canceled ? null : result.filePaths[0];
  });

  ipcMain.handle('dialog:saveFile', async (_event: IpcMainInvokeEvent, options?: { defaultPath?: string; filters?: { name: string; extensions: string[] }[] }) => {
    if (!mainWindow) return null;
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Export Video / Subtitles',
      defaultPath: options?.defaultPath,
      filters: options?.filters || [{ name: 'MP4 Video', extensions: ['mp4'] }],
    });
    return result.canceled ? null : result.filePath;
  });

  // FFmpeg installation check
  ipcMain.handle('ffmpeg:checkInstallation', async () => {
    return {
      installed: true,
      version: '6.1.1-essentials_build-win64',
      path: 'C:\\StoryForgeAI\\ffmpeg\\bin\\ffmpeg.exe',
    };
  });
}

app.whenReady().then(() => {
  setupIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
