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
  ? path.join(process.resourcesPath, 'models', 'Qwen2.5-7B-Instruct-Q4_K_M.gguf')
  : path.join(__dirname, 'models', 'Qwen2.5-7B-Instruct-Q4_K_M.gguf');

// ========================= Helpers =========================
function pickNumber(n, fallback) {
  return (typeof n === 'number' && isFinite(n)) ? n : fallback;
}

// Check if model file exists and is accessible
async function checkModelAvailability() {
  try {
    const fs = require('fs').promises;
    await fs.access(modelPath);
    const stats = await fs.stat(modelPath);
    
    if (stats.size < 1024 * 1024) { // Less than 1MB - probably corrupted
      return { 
        available: false, 
        error: `Model file exists but is too small (${stats.size} bytes). Please download the proper GGUF model.` 
      };
    }
    
    return { available: true, size: stats.size };
  } catch (error) {
    return { 
      available: false, 
      error: `Model file not found at: ${modelPath}. Please download the GGUF model and place it in the models folder.` 
    };
  }
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
      gpuLayers: 'max',  // Pełne wykorzystanie GPU dla modelu 12B
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
      contextSize: 512,  // Standardowy kontekst dla modelu 12B
      sequences: 2,      // 2 sekwencje dla lepszej wydajności
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
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'logo.svg')
  });

  // Dla przenośnego buildu - ZAWSZE wyłącz DevTools
  const htmlPath = path.join(__dirname, 'dist', 'index.html');
  console.log(`Loading HTML from: ${htmlPath}`);
  
  mainWindow.loadFile(htmlPath).then(() => {
    console.log('HTML loaded successfully');
  }).catch((error) => {
    console.error('Failed to load HTML:', error);
  });
  
  // ZAWSZE zamykaj DevTools w przenośnym buildzie
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.closeDevTools();
  });
}

app.whenReady().then(createWindow);

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
});

// ========================= IPC Handler for Model Status =========================
ipcMain.handle('check-model-status', async () => {
  try {
    const availability = await checkModelAvailability();
    const initResult = await initializeLlama();
    
    return {
      modelAvailable: availability.available,
      modelPath: modelPath,
      modelSize: availability.size,
      modelInitialized: initResult.success,
      error: availability.error || (initResult.success ? null : initResult.error),
      message: availability.available 
        ? `Model ready: ${(availability.size / (1024 * 1024)).toFixed(1)} MB` 
        : 'Model not available. Please download GGUF model.'
    };
  } catch (error) {
    return {
      modelAvailable: false,
      modelPath: modelPath,
      modelInitialized: false,
      error: error.message,
      message: 'Error checking model status'
    };
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// ========================= Advanced JSON Parsing Functions =========================
function parseLlamaJsonResponse(text) {
  if (!text || typeof text !== 'string') return null;
  
  const cleanedText = text.trim();
  
  // Strategy 1: Try direct JSON parsing
  try {
    const parsed = JSON.parse(cleanedText);
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
  } catch (e) {
    // Continue to other strategies
  }
  
  // Strategy 2: Extract JSON from code blocks or markdown
  const jsonBlockMatch = cleanedText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonBlockMatch) {
    try {
      const parsed = JSON.parse(jsonBlockMatch[1].trim());
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    } catch (e) {
      // Continue to other strategies
    }
  }
  
  // Strategy 3: Find the first valid JSON object in the text
  const jsonObjectMatch = cleanedText.match(/\{[\s\S]*?\}(?=\s*$|\s*[^\s\w\d\{\}\[\]"',])/);
  if (jsonObjectMatch) {
    try {
      // Clean common JSON formatting issues
      let jsonStr = jsonObjectMatch[0]
        .replace(/,\s*\}/g, '}')
        .replace(/,\s*\]/g, ']')
        .replace(/'/g, '"')
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ');
      
      const parsed = JSON.parse(jsonStr);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    } catch (e) {
      // Continue to other strategies
    }
  }
  
  // Strategy 4: Try to parse as array of objects
  const jsonArrayMatch = cleanedText.match(/\[[\s\S]*?\]/);
  if (jsonArrayMatch) {
    try {
      const parsed = JSON.parse(jsonArrayMatch[0]);
      if (Array.isArray(parsed)) {
        return { structuredPrompts: parsed };
      }
    } catch (e) {
      // Continue to other strategies
    }
  }
  
  // Strategy 5: Try to find and fix common JSON syntax errors
  const potentialJsonMatch = cleanedText.match(/\{[\s\S]{20,1000}\}/);
  if (potentialJsonMatch) {
    try {
      let fixedJson = potentialJsonMatch[0]
        // Fix missing quotes around keys
        .replace(/([\{\,])\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')
        // Fix single quotes
        .replace(/'/g, '"')
        // Fix trailing commas
        .replace(/,\s*\}/g, '}')
        .replace(/,\s*\]/g, ']');
      
      const parsed = JSON.parse(fixedJson);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    } catch (e) {
      // Final fallback
    }
  }
  
  return null;
}

// ========================= Prompt Builders for Different Tasks =========================
function buildPromptForTask(task, payload) {
  switch (task) {
    case 'generatePromptVariations':
      // Extract character details from the description
      const description = payload.prompt || '';
      
      return `As an expert prompt engineer, transform the following description into ${payload.numVariations || 1} optimized prompt variation(s) for ${payload.selectedModel || 'SDXL'}.
"""
${description}
"""

Strict output requirements:
- Return a JSON object with exactly two keys: "structuredPrompts" and "negativePrompt".
- "structuredPrompts" MUST be an array with exactly ${payload.numVariations || 1} item(s).
- Each item MUST be an object with ONLY these keys: "subject", "attributes", "clothing", "pose", "action", "location", "background", "style".
- The value of every key MUST be an array of strings.
- Use concise, model-appropriate phrases. Do NOT include generation parameters (aspect ratio, seed) or negative concepts inside these arrays.

Content mode: ${payload.nsfwSettings?.mode || 'off'}
Style filter: ${payload.styleFilter?.main || 'realistic'}${payload.styleFilter?.sub && payload.styleFilter?.sub !== 'any' ? '/' + payload.styleFilter.sub : ''}
Character settings: ${JSON.stringify(payload.characterSettings || {})}

Return only the JSON object, no additional text.`;

    case 'enhanceDescription':
      return `Enhance this image description with vivid details:
"""
${payload.prompt}
"""

Style: ${payload.styleFilter?.main} ${payload.styleFilter?.sub}
Character: ${JSON.stringify(payload.characterSettings)}
NSFW: ${payload.nsfwSettings?.mode}

Return only the enhanced description.`;

    case 'generateRandomDescription':
      // Use the prompt provided by aiService.ts which already contains proper instructions
      return payload.prompt;

    default:
      return String(payload?.prompt || '').trim();
  }
}

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

  // Build appropriate prompt based on task type
  const prompt = buildPromptForTask(task, payload);
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
    
    // Parse response based on task type
    try {
      switch (task) {
        case 'generatePromptVariations':
          // Advanced JSON parsing with multiple fallback strategies
          const parsedResult = parseLlamaJsonResponse(finalText);
          if (parsedResult) {
            return { 
              structuredPrompts: Array.isArray(parsedResult.structuredPrompts) ? parsedResult.structuredPrompts : [parsedResult],
              negativePrompt: parsedResult.negativePrompt || 'blurry, ugly, bad anatomy, watermark, signature'
            };
          }
          // Fallback: return empty structured data
          return { 
            structuredPrompts: [{ subject: [], attributes: [], clothing: [], pose: [], action: [], location: [], background: [], style: [] }], 
            negativePrompt: 'blurry, ugly, bad anatomy, watermark, signature' 
          };
          
        case 'enhanceDescription':
        case 'generateRandomDescription':
          return { result: finalText };
          
        default:
          return { result: finalText };
      }
    } catch (parseError) {
      console.warn('Failed to parse LLM response:', parseError);
      // Return raw text as fallback
      return { result: finalText };
    }
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