import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { getLlama, LlamaChatSession } from "node-llama-cpp";
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Model Initialization ---
// Usunięto contextSequence i session - będą tworzone per żądanie
let model;
let context;
let llama;

// Determine path to model file. This handles both development and packaged app.
const modelPath = app.isPackaged
  ? path.join(process.resourcesPath, 'models', 'gemma-3-4b-it-abliterated.q4_k_m.gguf')
  : path.join(__dirname, 'models', 'gemma-3-4b-it-abliterated.q4_k_m.gguf');

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
      modelPath,
      gpuLayers: 'max',
      defaultContextFlashAttention: true
    });

    // Dobierz liczbę wątków CPU (pozostaw 1 rdzeń wolny, ogranicz do 16 by uniknąć nadmiernej konkurencji)
    const cpuThreads = Math.max(
      4,
      Math.min(
        16,
        ((os.availableParallelism && typeof os.availableParallelism === 'function')
          ? os.availableParallelism()
          : os.cpus().length) - 1
      )
    );

    context = await model.createContext({
      contextSize: 512,  // Nieco mniejszy kontekst, aby obniżyć zużycie CPU/VRAM
      sequences: 2,      // Zwiększono z 1 na 2 dla obsługi szybkich kliknięć
      threads: cpuThreads,
      flashAttention: true // jeżeli niewspierane, zostanie zignorowane
    });
    // Nie tworzymy globalnej sekwencji - będzie per żądanie
     console.log("LLM Model initialized successfully.");
    return { success: true };
  } catch (error) {
    console.error("Failed to initialize LLM Model:", error);
    return { success: false, error: error.message };
  }
}

// ========================= Window bootstrap =========================
function createWindow() {
  console.log('Creating Electron window...');
  
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, 'logo.svg')
  });

  if (!app.isPackaged) {
    const devUrl = 'http://localhost:5173';
    console.log(`Loading Dev Server from: ${devUrl}`);
    mainWindow.loadURL(devUrl).then(() => {
      console.log('Dev URL loaded successfully');
    }).catch((error) => {
      console.error('Failed to load Dev URL:', error);
    });
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    // Load the built HTML file from dist folder
    const htmlPath = path.join(__dirname, 'dist', 'index.html');
    console.log(`Loading HTML from: ${htmlPath}`);
    
    mainWindow.loadFile(htmlPath).then(() => {
      console.log('HTML loaded successfully');
    }).catch((error) => {
      console.error('Failed to load HTML:', error);
    });
  }
}

app.whenReady().then(createWindow);

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// ========================= IPC Handler for AI Requests =========================
ipcMain.handle('llm-request', async (event, { task, payload }) => {
  console.log(`🔍 DEBUG: Received LLM request for task: ${task}`);
  console.log(`🔍 DEBUG: Payload keys:`, Object.keys(payload || {}));

  const initResult = await initializeLlama();
  if (!initResult.success) {
    console.error(`🔍 DEBUG: Model initialization failed:`, initResult.error);
    return { error: `Failed to initialize model: ${initResult.error}. Make sure the model file exists at '${modelPath}' and is not corrupted.` };
  }

  console.log(`🔍 DEBUG: Model initialized successfully`);

  // Efemeryczna sesja per żądanie - zgodnie z Opcją A z feedbacku ChatGPT-5
  const prompt = String(payload?.prompt || '').trim();
  if (!prompt) {
    throw new Error('No prompt provided');
  }
  console.log('🔍 DEBUG: Using prompt (length):', prompt.length);

  // Map generation options
  const temperature = pickNumber(payload?.temperature, 0.6);
  const topP = pickNumber(payload?.top_p, 0.9);
  const topK = 40;
  const maxTokens = pickNumber(payload?.maxTokens, 256);
  const stop = unifyStop(payload);

  console.log('🔍 DEBUG: Gen opts -> temperature:', temperature, 'topP:', topP, 'topK:', topK, 'maxTokens:', maxTokens, 'stop:', stop);

  // Opcja B: Ręczne zarządzanie sekwencją per żądanie (zgodnie z feedbackiem ChatGPT-5)
  let seq, session;
  try {
    console.log('[LLM] acquiring sequence');
    seq = context.getSequence(); // wypożycz sekwencję z puli
    session = new LlamaChatSession({ contextSequence: seq });

    const startTime = Date.now();
    const response = await session.prompt(prompt, {
      temperature,
      topP,
      topK,
      maxTokens,
      stopSequences: stop,
      antiPrompts: stop
    });

    const endTime = Date.now();
    console.log(`[LLM] gen in ${endTime - startTime}ms len=${response?.length}`);
    console.log('[LLM][RAW OUT len]', response?.length, 'text=', JSON.stringify(response));

    // Dodatkowe ucięcie po stop-sekwencjach po stronie main (na wszelki wypadek)
    const trimmed = trimAtStopSequences(response, stop);
    console.log('[LLM][POST-TRIM len]', trimmed?.length, 'text=', JSON.stringify(trimmed));
    const finalText = (trimmed && trimmed.trim().length > 0) ? trimmed : response;
    return { result: finalText };
  } catch (error) {
    console.error(`Error during LLM task '${task}':`, error);
    return { error: error?.message || "An unknown error occurred during LLM processing." };
  } finally {
    // Kolejność: najpierw sesja, potem sekwencja
    try { 
      session?.dispose?.(); 
    } catch (e) { 
      console.warn('session.dispose failed', e); 
    }
    try {
      console.log('[LLM] releasing sequence');
      if (typeof seq?.release === 'function') seq.release();
      else if (typeof seq?.dispose === 'function') seq.dispose();
    } catch (e) {
      console.warn('sequence release failed', e);
    }
  }
});