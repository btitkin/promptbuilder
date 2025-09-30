import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { getLlama, LlamaChatSession } from "node-llama-cpp";
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Model Initialization ---
let model;
let context;
let llama;

// Determine path to model file. This handles both development and packaged app.
const modelPath = app.isPackaged
  ? path.join(process.resourcesPath, 'models', 'Qwen2.5-7B-Instruct-Q4_K_M.gguf')
  : path.join(__dirname, 'models', 'Qwen2.5-7B-Instruct-Q4_K_M.gguf');

// ========================= Helpers =========================
function pickNumber(n, fallback) {
  return (typeof n === 'number' && isFinite(n)) ? n : fallback;
}

function unifyStop(_payload) {
  // Wymuszamy sentinela zgodnie z nową polityką stop-sekwencji
  return ['<<EOD>>'];
}

function trimAtStopSequences(text, stops = []) {
  if (!text) return '';
  if (!Array.isArray(stops) || stops.length === 0) return text;
  let out = text;
  for (const stop of stops) {
    if (!stop) continue;
    const idx = out.indexOf(stop);
    if (idx >= 0) {
      out = out.slice(0, idx);
    }
  }
  return out.trim();
}

// ========================= Lazy initialization of the model =========================
async function initializeLlama() {
  if (model && context) return { success: true };

  try {
    console.log(`Loading model from: ${modelPath}`);
    
    llama = await getLlama();
    
    model = await llama.loadModel({
      modelPath: modelPath,
      gpuLayers: 0, // CPU only for better compatibility
    });

    context = await model.createContext({
      sequences: 1,
      contextSize: 4096,
    });

    console.log('Model loaded successfully');
    return { success: true };
  } catch (error) {
    console.error('Failed to initialize model:', error);
    return { success: false, error: error.message };
  }
}

// ========================= IPC Handlers =========================
ipcMain.handle('generate-text', async (event, payload) => {
  try {
    const initResult = await initializeLlama();
    if (!initResult.success) {
      return {
        success: false,
        error: initResult.error || 'Failed to initialize model'
      };
    }

    const { prompt, temperature = 0.7, maxTokens = 512 } = payload;
    
    const session = new LlamaChatSession({
      contextSequence: context.getSequence(),
    });

    const response = await session.prompt(prompt, {
      temperature: pickNumber(temperature, 0.7),
      maxTokens: pickNumber(maxTokens, 512),
      stopOnAbortSignal: true,
    });

    return {
      success: true,
      text: response
    };
  } catch (error) {
    console.error('Text generation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// ========================= Electron App Setup =========================
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'logo.svg')
  });

  // Load the built React app
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Cleanup on app quit
app.on('before-quit', async () => {
  if (context) {
    await context.dispose();
  }
  if (model) {
    await model.dispose();
  }
  if (llama) {
    await llama.dispose();
  }
});