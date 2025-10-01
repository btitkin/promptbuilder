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
let mainWindow; // keep reference to send progress events

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
function emitProgress(percent, message) {
  try {
    if (mainWindow?.webContents) {
      mainWindow.webContents.send('model-loading-progress', { percent, message });
    }
  } catch (_) {}
}

async function initializeLlama(withProgress = false) {
  if (model && context) return { success: true };

  try {
    console.log(`Loading model from: ${modelPath}`);
    if (withProgress) emitProgress(5, 'Preparing model...');
    llama = await getLlama();
    if (withProgress) emitProgress(15, 'Starting model load...');
    model = await llama.loadModel({
      modelPath,
      gpuLayers: 'max',  // Pełne wykorzystanie GPU dla modelu 12B
      defaultContextFlashAttention: true
    });
    if (withProgress) emitProgress(85, 'Initializing context...');

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
    if (withProgress) {
      emitProgress(100, 'Model ready');
      try { mainWindow?.webContents?.send('model-loading-complete'); } catch (_) {}
    }
    return { success: true };
  } catch (error) {
    console.error("Failed to initialize LLM Model:", error);
    return { success: false, error: error.message };
  }
}

// ========================= Window bootstrap =========================
function createWindow() {
  console.log('Creating Electron window...');
  
  mainWindow = new BrowserWindow({
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
    const devUrlPrimary = 'http://localhost:5173';
    const devUrlFallback = 'http://localhost:5174';
    console.log(`Loading Dev Server from: ${devUrlPrimary}`);
    mainWindow.loadURL(devUrlPrimary).then(() => {
      console.log('Dev URL loaded successfully');
    }).catch((error) => {
      console.error('Failed to load Dev URL:', error);
      console.log(`Attempting fallback Dev URL: ${devUrlFallback}`);
      return mainWindow.loadURL(devUrlFallback).then(() => {
        console.log('Fallback Dev URL loaded successfully');
      }).catch((fallbackError) => {
        console.error('Failed to load fallback Dev URL:', fallbackError);
      });
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

app.whenReady().then(() => {
  createWindow();
  // Start background model loading; simulate progress while loading if needed
  // Simulate progress ticks while the async load runs
  let intervalId;
  let p = 15;
  const startTicks = () => {
    intervalId = setInterval(() => {
      p = Math.min(p + 3, 80);
      emitProgress(p, 'Loading model into memory...');
    }, 500);
  };
  try {
    emitProgress(5, 'Preparing model...');
    startTicks();
  } catch (_) {}

  initializeLlama(true).catch((e) => {
    console.error('Background model load failed:', e);
    emitProgress(100, 'Model load failed — running without local LLM');
    try { mainWindow?.webContents?.send('model-loading-complete'); } catch (_) {}
  }).finally(() => {
    if (intervalId) clearInterval(intervalId);
  });
});

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

// ========================= Helpers =========================
function buildSystemPromptForModel(selectedModel, useBreak, nsfwSettings, task) {
  const allowedModels = ['Google Imagen4','SDXL','SD 1.5','Flux','Pony','Illustrious','OpenAI','MidJourney','Stable Cascade','Nano Banana','Qwen','AuraFlow','HiDream','Kolors','Lumina','Mochi','NoobAI','PixArt A/E','Veo 3','SVD','CogVideoX','Hunyuan Video','LTXV','Wan Video'];
  const model = selectedModel || 'SDXL';
  const header = `You are an expert prompt engineer. Follow the rules for the selected model: ${model}. Only produce prompts for these allowed models: ${allowedModels.join(', ')}. If a different model is requested, default to SDXL.`;
  const sdLike = ['SDXL','SD 1.5','Pony','Stable Cascade','AuraFlow','HiDream','Kolors','Lumina','Mochi','NoobAI','PixArt A/E'];
  const naturalModels = ['Google Imagen4','Flux','Nano Banana','OpenAI','Qwen','Veo 3','CogVideoX','Hunyuan Video','LTXV','SVD','Wan Video'];
  const isVariationsTask = task === 'generatePromptVariations';
  const isPlainTextTask = task === 'generateRandomDescription' || task === 'enhanceDescription' || task === 'custom';
  let rules;
  if (sdLike.includes(model)) {
    rules = [
      '- Syntax: concise comma-separated tags (Danbooru-style).',
      '- Do NOT include generation parameters (aspect ratio, seed) in the text prompt.',
      isVariationsTask
        ? '- Do NOT include negative prompts in the text. Return them separately as "negativePrompt".'
        : '- Do NOT include negative prompts, and do NOT output any JSON or a "negativePrompt" field. Output only plain text for the description.',
      (useBreak && ['SDXL','Pony','Stable Cascade'].includes(model))
        ? '- When requested, the final prompt will be formatted with BREAK separators by the client. Do NOT output BREAK yourself.'
        : '- Do NOT output BREAK separators in your JSON.',
      '- Subject entries must be concise tags (each <= 12 words).'
    ].join('\n');
  } else if (model === 'MidJourney') {
    rules = [
      '- Syntax: natural language phrases, organized and concise.',
      '- Do NOT include parameters like --ar, --seed, or --no inside text; the client app will append them.',
      '- Do NOT include the /imagine prefix; the client app will handle UX.',
      isVariationsTask
        ? '- Negative prompt must be returned separately as "negativePrompt".'
        : '- Do NOT include any negative prompt content or JSON fields; return only plain text.'
    ].join('\n');
  } else if (naturalModels.includes(model)) {
    rules = [
      '- Syntax: natural language phrases.',
      '- Do NOT include generation parameters in text.',
      isVariationsTask
        ? '- Negative prompt must be returned separately as "negativePrompt".'
        : '- Do NOT include any negative prompt content or JSON fields; return only plain text.',
      '- Quality/style cues can be appended at the end.'
    ].join('\n');
  } else {
    rules = '- Default to SDXL rules.';
  }
  const nsfwRule = nsfwSettings?.mode
    ? `- Content mode is "${nsfwSettings.mode}". Adjust tags and style accordingly, but never include illegal or unsafe content.`
    : '';
  return [header, rules, nsfwRule].filter(Boolean).join('\n');
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
- Preserve all character details (age, gender, ethnicity, physical features), placing them in "subject" and "attributes".
- Put clothing in "clothing"; actions and poses in "action" and "pose"; scene/location/background details in "location" and "background"; stylistic/technical cues (lighting, camera, materials, quality tags) in "style".
- "negativePrompt" MUST be a single comma-separated string of undesired concepts.

Options:
- Content Mode: ${payload.nsfwSettings?.mode || 'sfw'}
- Style Filter: ${JSON.stringify(payload.styleFilter || {})}
- Character Settings: ${JSON.stringify(payload.characterSettings || {})}

Return ONLY valid JSON. No prose, no markdown, no extra keys.`;

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
      // Extract and build comprehensive character description
      const characterTraits = [];
      const cs = payload.characterSettings || {};
      
      // Basic demographics - respect user's specific selections, only randomize if truly 'any'
      let gender = cs.gender;
      if (gender === 'any' || !gender) {
        gender = ['female', 'male'][Math.floor(Math.random() * 2)];
      }
      // Always add gender to character traits
      if (gender && gender !== 'any') {
        characterTraits.push(gender);
      }
      
      let age = cs.age;
      if (age === 'any' || !age) {
        age = ['18s', '25s', '30s', '40s', '50s'][Math.floor(Math.random() * 5)];
      }
      if (age && age !== 'any') {
        characterTraits.push(age);
      }
      
      let ethnicity = cs.ethnicity;
      if (ethnicity === 'any' || !ethnicity) {
        ethnicity = ['caucasian', 'european', 'asian', 'japanese', 'chinese', 'korean', 'african', 'hispanic', 'middle eastern'][Math.floor(Math.random() * 9)];
      }
      if (ethnicity && ethnicity !== 'any') {
        characterTraits.push(ethnicity);
      }
      
      // Body type - respect user selection
      let bodyType = cs.bodyType;
      if (bodyType === 'any' || !bodyType) {
        if (gender === 'female') {
          bodyType = ['slim', 'curvy', 'athletic', 'instagram model'][Math.floor(Math.random() * 4)];
        } else if (gender === 'male') {
          bodyType = ['slim', 'muscular', 'athletic', 'big muscular'][Math.floor(Math.random() * 4)];
        }
      }
      if (bodyType && bodyType !== 'any') {
        characterTraits.push(`${bodyType} build`);
      }
      
      // Height - respect user selection
      let height = cs.height;
      if (height === 'any' || !height) {
        height = ['short', 'average', 'tall'][Math.floor(Math.random() * 3)];
      }
      if (height && height !== 'any') {
        characterTraits.push(height);
      }
      
      // Female-specific traits - respect user selections
      if (gender === 'female' || gender === 'futanari') {
        let breastSize = cs.breastSize;
        if (breastSize === 'any' || !breastSize) {
          breastSize = ['small', 'medium', 'large', 'huge'][Math.floor(Math.random() * 4)];
        }
        if (breastSize && breastSize !== 'any') {
          characterTraits.push(`${breastSize} breasts`);
        }
        
        let hipsSize = cs.hipsSize;
        if (hipsSize === 'any' || !hipsSize) {
          hipsSize = ['narrow', 'average', 'wide'][Math.floor(Math.random() * 3)];
        }
        if (hipsSize && hipsSize !== 'any') {
          characterTraits.push(`${hipsSize} hips`);
        }
        
        let buttSize = cs.buttSize;
        if (buttSize === 'any' || !buttSize) {
          buttSize = ['small', 'average', 'large', 'bubble'][Math.floor(Math.random() * 4)];
        }
        if (buttSize && buttSize !== 'any') {
          characterTraits.push(`${buttSize} butt`);
        }
      }
      
      // Male-specific traits - respect user selections
      if (gender === 'male' || gender === 'futanari') {
        let muscleDefinition = cs.muscleDefinition;
        if (muscleDefinition === 'any' || !muscleDefinition) {
          muscleDefinition = ['toned', 'defined', 'ripped'][Math.floor(Math.random() * 3)];
        }
        if (muscleDefinition && muscleDefinition !== 'any') {
          characterTraits.push(`${muscleDefinition} muscles`);
        }
        
        let facialHair = cs.facialHair;
        if (facialHair === 'any' || !facialHair) {
          facialHair = ['clean-shaven', 'stubble', 'goatee', 'full beard'][Math.floor(Math.random() * 4)];
        }
        if (facialHair && facialHair !== 'any') {
          characterTraits.push(facialHair);
        }
        
        // Penis size for NSFW modes - respect user selection
        if (payload.nsfwSettings?.mode === 'nsfw' || payload.nsfwSettings?.mode === 'hardcore') {
          let penisSize = cs.penisSize;
          if (penisSize === 'any' || !penisSize) {
            penisSize = ['average', 'large', 'huge'][Math.floor(Math.random() * 3)];
          }
          if (penisSize && penisSize !== 'any') {
            characterTraits.push(`${penisSize} penis`);
          }
        }
      }
      
      // Add style if specified
      if (payload.styleFilter?.main) {
        characterTraits.push(payload.styleFilter.main);
      }
      
      const characterDescription = characterTraits.join(', ');
      
      // Extract selected presets from payload
      const selectedPresets = payload.selectedPresets || [];
      
      // Categorize selected presets
      const selectedLocations = [];
      const selectedPoses = [];
      const selectedClothing = [];
      const selectedEmotions = [];
      
      // Common location keywords to identify location presets
      const locationKeywords = ['bedroom', 'bathroom', 'kitchen', 'office', 'park', 'beach', 'forest', 'cafe', 'library', 'gym', 'rooftop', 'garden', 'studio', 'car', 'hotel', 'dungeon', 'warehouse', 'playroom', 'crypt', 'restroom', 'motel', 'backseat', 'examination', 'pool', 'dorm', 'club', 'bookstore', 'backroom', 'bar', 'clearing', 'sauna', 'yacht', 'suite', 'parlor', 'locker', 'boudoir', 'stage', 'tub'];
      
      // Common pose keywords to identify pose presets
      const poseKeywords = ['sitting', 'standing', 'lying', 'kneeling', 'leaning', 'stretching', 'dancing', 'walking', 'running', 'posing', 'arching', 'spreading', 'bending', 'presenting', 'embrace', 'bed', 'pin-up', 'glance', 'shoulder', 'licking', 'biting', 'pulling', 'undressed', 'shower', 'knees', 'legs', 'stomach', 'elbows', 'squat', 'model', 'hiding', 'touching', 'bent', 'side-lying', 'hips', 'thigh', 'sensual', 'wetlook', 'masturbating', 'fingering', 'stroking', 'missionary', 'cowgirl', 'doggy', 'anal', 'spanked', 'bondage', 'gag', 'blindfolded', 'fisting', 'bukkake', 'gangbang', 'cunnilingus', 'fellatio', 'deepthroat', 'footjob', 'handjob', 'titjob', 'facesitting', 'ahegao', 'orgasm', 'creampie', 'cum on face', 'cum on body', 'cum', 'face', 'body'];
      
      // Common clothing keywords to identify clothing presets
      const clothingKeywords = ['lingerie', 'thong', 'bra', 'panties', 'bikini', 'nightgown', 'stockings', 'garter', 'corset', 'latex', 'catsuit', 'leather', 'bodysuit', 'harness', 'strappy', 'crotchless', 'open-cup', 'pasties', 'chain', 'shirt', 'uniform', 'outfit', 'costume', 'dominatrix', 'paint', 'dress', 'miniskirt', 'tie', 'underwear', 'transparent', 'raincoat', 'chaps', 'vinyl', 'peek-a-boo', 'bodystocking', 'boots', 'heels', 'shorts', 'babydoll', 'teddie', 'roleplay', 'apron', 'daisy', 'dukes', 'low-cut', 'top', 'tied', 'plug', 'tail', 'collar', 'leash', 'bandages', 'shibari', 'caged', 'ouvert', 'suspender', 'belt', 'waspie', 'wet', 'look', 'pvc', 'satin', 'robe', 'cop', 'submissive', 'ankle', 'cuffs', 'tape', 'topless', 'bottomless', 'strategically', 'placed', 'hands', 'tassel', 'gas', 'mask', 'fetish', 'rubber', 'hood', 'ballet', 'micro-skirt', 'sling', 'monokini', 'ripped', 'clothes', 'torn', 'duct', 'nipple', 'slit'];
      
      // Common emotion keywords to identify emotional presets
      const emotionKeywords = ['happy', 'confident', 'relaxed', 'playful', 'mysterious', 'gentle', 'bold', 'seductive', 'lustful', 'passionate', 'aroused', 'sultry', 'provocative', 'sensual', 'erotic', 'inviting', 'teasing', 'submissive', 'dominant', 'degraded', 'pleasured', 'intense', 'overwhelmed', 'ecstatic', 'controlled', 'wild'];
      
      // Categorize selected presets based on keywords - use exact matching first, then partial
      selectedPresets.forEach(preset => {
        const lowerPreset = preset.toLowerCase();
        
        // Check for exact matches first for multi-word presets
        if (poseKeywords.includes(lowerPreset)) {
          selectedPoses.push(preset);
        } else if (clothingKeywords.includes(lowerPreset)) {
          selectedClothing.push(preset);
        } else if (emotionKeywords.includes(lowerPreset)) {
          selectedEmotions.push(preset);
        } else if (locationKeywords.some(keyword => lowerPreset.includes(keyword))) {
          selectedLocations.push(preset);
        } else if (poseKeywords.some(keyword => lowerPreset.includes(keyword))) {
          selectedPoses.push(preset);
        } else if (clothingKeywords.some(keyword => lowerPreset.includes(keyword))) {
          selectedClothing.push(preset);
        } else if (emotionKeywords.some(keyword => lowerPreset.includes(keyword))) {
          selectedEmotions.push(preset);
        }
      });
      
      // Add randomization elements for variety - mode and gender specific
      let locations, poses, emotions, defaultClothing;
      
      if (payload.nsfwSettings?.mode === 'nsfw') {
        // NSFW-specific locations
        locations = ['bedroom', 'bathroom', 'hotel room', 'private yacht deck', 'luxury hotel suite', 'secluded beach at night', 'massage parlor room', 'steamy locker room shower', 'decadent boudoir', 'strip club stage', 'sauna', 'hot tub', 'office after hours'];
        
        // NSFW-specific poses based on user examples
        poses = ['arching back seductively', 'spreading legs invitingly', 'on all fours', 'bending over', 'presenting rear', 'hands behind back', 'self-embrace', 'lying on bed', 'classic pin-up pose', 'suggestive glance over shoulder', 'licking lips', 'biting lower lip', 'pulling up shirt', 'partially undressed', 'showering pose', 'on knees, looking up', 'legs up in the air', 'lying on stomach, propped on elbows', 'provocative squat', 'lingerie model pose', 'teasingly hiding nudity', 'touching own body', 'knees bent, feet on floor', 'side-lying pose', 'hands on hips provocatively', 'hand on inner thigh', 'sensual stretching', 'wetlook pose'];
        
        // Add explicit poses for NSFW
        if (gender === 'female') {
          poses.push('masturbating', 'fingering');
        } else if (gender === 'male') {
          poses.push('masturbating', 'stroking');
        }
        
        emotions = ['seductive', 'lustful', 'passionate', 'aroused', 'sultry', 'provocative', 'sensual', 'erotic', 'inviting', 'teasing'];
        
        // NSFW clothing options (only used as fallback when no presets selected)
        defaultClothing = ['lingerie set', 'thong', 'g-string', 'bra and panties', 'micro bikini', 'see-through nightgown', 'sheer lingerie', 'fishnet stockings', 'garter belt and stockings', 'corset', 'latex catsuit', 'leather bodysuit', 'bondage harness', 'strappy lingerie', 'crotchless panties', 'open-cup bra', 'pasties', 'body chain', 'wet t-shirt', 'schoolgirl uniform (sexualized)', 'french maid outfit (sexualized)', 'nurse uniform (sexualized)', 'cheerleader outfit (sexualized)', 'bunny girl costume', 'dominatrix outfit', 'body paint', 'see-through dress', 'extremely short miniskirt', 'side-tie bikini', 'underwear only', 'transparent raincoat', 'leather chaps', 'vinyl minidress', 'peek-a-boo lingerie', 'bodystocking', 'harness lingerie', 'thigh-high boots', 'high heels', 'garter shorts', 'babydoll dress', 'teddie lingerie', 'roleplay costume', 'nude apron', 'open shirt, no bra', 'short shorts (daisy dukes)', 'low-cut top', 'shirt tied up', 'butt-plug tail', 'collar and leash', 'bandages (shibari style)', 'caged bra', 'ouvert lingerie', 'suspender belt', 'waspie', 'wet look clothing', 'pvc dress', 'satin robe', 'sexy cop uniform', 'submissive collar', 'ankle cuffs', 'tape gag', 'topless', 'bottomless', 'strategically placed hands', 'tassel pasties', 'gas mask (fetish)', 'rubber hood', 'ballet boots', 'micro-skirt', 'sling bikini', 'monokini', 'ripped clothes', 'torn stockings', 'duct tape bikini', 'nipple tape', 'slit dress', 'plugging tail'];
      } else if (payload.nsfwSettings?.mode === 'hardcore') {
        // Hardcore locations
        locations = ['dungeon with chains', 'abandoned warehouse', 'bdsm playroom', 'opulent vampire crypt', 'orgy room', 'public restroom stall', 'porn studio set', 'seedy motel room', 'car backseat', 'doctor\'s examination room', 'rooftop pool party', 'college dorm room', 'fetish club', 'swinger\'s party', 'adult bookstore', 'backroom of a bar', 'forest clearing at night', 'hot tub', 'sauna', 'office after hours'];
        
        // Check scene type to determine if solo or couple content
        const sceneType = payload.characterSettings?.sceneType || 'solo';
        
        // Gender-specific hardcore poses and activities - SOLO ONLY unless couple scene type
        if (gender === 'female') {
          if (sceneType === 'couple' || sceneType === 'threesome' || sceneType === 'group') {
            poses = ['missionary position', 'cowgirl', 'reverse cowgirl', 'doggy style', 'receiving anal', 'being spanked', 'shibari rope bondage', 'ball gag in mouth', 'blindfolded', 'receiving fisting', 'bukkake scene', 'gangbang scene', 'receiving cunnilingus', 'giving fellatio', 'deepthroat', 'footjob', 'giving handjob', 'titjob', 'being facesitted', 'ahegao expression', 'cum on face', 'cum on body', 'female orgasm', 'creampie'];
          } else {
            // Solo female activities only
            poses = ['masturbating', 'fingering herself', 'using vibrator', 'using dildo', 'legs spread wide', 'on all fours', 'bent over', 'tied up', 'submissive position', 'touching herself', 'self-pleasure', 'solo orgasm', 'ahegao expression', 'arched back', 'spreading legs'];
          }
        } else if (gender === 'male') {
          if (sceneType === 'couple' || sceneType === 'threesome' || sceneType === 'group') {
            poses = ['missionary position', 'receiving cowgirl', 'receiving reverse cowgirl', 'doggy style', 'giving anal', 'spanking', 'rope bondage', 'ball gag in mouth', 'blindfolded', 'giving fisting', 'bukkake scene', 'gangbang scene', 'giving cunnilingus', 'receiving fellatio', 'receiving deepthroat', 'receiving footjob', 'receiving handjob', 'receiving titjob', 'facesitting', 'male orgasm', 'creampie'];
          } else {
            // Solo male activities only
            poses = ['masturbating', 'stroking himself', 'using cock ring', 'using fleshlight', 'dominant position', 'standing', 'thrusting into toy', 'self-pleasure', 'solo orgasm', 'flexing muscles', 'touching himself'];
          }
        } else {
          if (sceneType === 'couple' || sceneType === 'threesome' || sceneType === 'group') {
            poses = ['missionary position', 'cowgirl', 'reverse cowgirl', 'doggy style', 'receiving anal', 'giving anal', 'being spanked', 'shibari rope bondage', 'ball gag in mouth', 'blindfolded', 'fisting', 'bukkake scene', 'gangbang scene', 'cunnilingus', 'fellatio', 'deepthroat', 'footjob', 'handjob', 'titjob', 'facesitting', 'ahegao expression', 'cum on face', 'cum on body', 'orgasm', 'creampie'];
          } else {
            // Solo activities only
            poses = ['masturbating', 'self-pleasure', 'using toys', 'solo orgasm', 'touching themselves', 'self-stimulation', 'arched back', 'legs spread', 'bent over'];
          }
        }
        
        emotions = ['submissive', 'dominant', 'lustful', 'degraded', 'pleasured', 'intense', 'overwhelmed', 'ecstatic', 'controlled', 'wild'];
        
        // Gender-appropriate hardcore clothing/accessories (only used as fallback when no presets selected)
        if (gender === 'female') {
          defaultClothing = ['strapon harness', 'ball gag', 'blindfold', 'nipple clamps', 'spreader bar', 'vibrator', 'dildo', 'anal beads', 'handcuffs', 'rope bondage (shibari)', 'butt plug', 'anal hook', 'genital piercings', 'riding crop', 'paddle', 'ring gag', 'wrist cuffs', 'ankle cuffs', 'hogtie position', 'medical restraints', 'flogger', 'whip', 'cane', 'double-ended dildo', 'anal plug with tail', 'muzzle gag', 'spider gag', 'tongue clamp', 'inflatable gag', 'nose hook', 'collar and leash', 'latex catsuit', 'leather harness', 'crotchless panties', 'open-cup bra'];
        } else if (gender === 'male') {
          defaultClothing = ['ball gag', 'blindfold', 'cock ring', 'chastity cage', 'anal beads', 'handcuffs', 'rope bondage (shibari)', 'butt plug', 'anal hook', 'genital piercings', 'riding crop', 'paddle', 'ring gag', 'wrist cuffs', 'ankle cuffs', 'hogtie position', 'medical restraints', 'flogger', 'whip', 'cane', 'enema bag', 'catheter (play)', 'penis pump', 'urethral sounding rods', 'muzzle gag', 'spider gag', 'tongue clamp', 'inflatable gag', 'nose hook', 'collar and leash', 'leather harness', 'latex suit'];
        } else {
          defaultClothing = ['ball gag', 'blindfold', 'nipple clamps', 'spreader bar', 'vibrator', 'dildo', 'cock ring', 'chastity cage', 'anal beads', 'handcuffs', 'rope bondage (shibari)', 'butt plug', 'anal hook', 'genital piercings', 'riding crop', 'paddle', 'ring gag', 'wrist cuffs', 'ankle cuffs', 'hogtie position', 'medical restraints', 'flogger', 'whip', 'cane', 'enema bag', 'catheter (play)', 'double-ended dildo', 'anal plug with tail', 'milking machine', 'penis pump', 'urethral sounding rods', 'muzzle gag', 'spider gag', 'tongue clamp', 'inflatable gag', 'nose hook'];
        }
      } else {
        // SFW content
        locations = ['bedroom', 'kitchen', 'living room', 'bathroom', 'office', 'park', 'beach', 'forest', 'cafe', 'library', 'gym', 'rooftop', 'garden', 'studio', 'car', 'hotel room'];
        poses = ['sitting', 'standing', 'lying down', 'kneeling', 'leaning', 'stretching', 'dancing', 'walking', 'running', 'posing'];
        emotions = ['happy', 'confident', 'relaxed', 'playful', 'mysterious', 'gentle', 'bold'];
        defaultClothing = ['casual outfit', 'formal dress', 'business attire', 'sportswear', 'summer dress', 'jeans and t-shirt'];
      }
      
      const lighting = ['soft lighting', 'dramatic lighting', 'natural sunlight', 'candlelight', 'neon lighting', 'golden hour', 'moonlight', 'studio lighting'];
      
      // Use selected presets when available, otherwise fall back to random selection
      const finalLocation = selectedLocations.length > 0 
        ? selectedLocations[Math.floor(Math.random() * selectedLocations.length)]
        : locations[Math.floor(Math.random() * locations.length)];
        
      const finalPose = selectedPoses.length > 0 
        ? selectedPoses[Math.floor(Math.random() * selectedPoses.length)]
        : poses[Math.floor(Math.random() * poses.length)];
        
      const finalEmotion = selectedEmotions.length > 0 
        ? selectedEmotions[Math.floor(Math.random() * selectedEmotions.length)]
        : emotions[Math.floor(Math.random() * emotions.length)];
        
      const finalClothing = selectedClothing.length > 0 
        ? selectedClothing[Math.floor(Math.random() * selectedClothing.length)]
        : (defaultClothing ? defaultClothing[Math.floor(Math.random() * defaultClothing.length)] : '');
      
      const randomLighting = lighting[Math.floor(Math.random() * lighting.length)];
      
      // Generate mode-specific descriptions based on content type
      if (payload.nsfwSettings?.mode === 'hardcore') {
        // Check scene type for appropriate description
        const sceneType = payload.characterSettings?.sceneType || 'solo';
        
        if (sceneType === 'couple' || sceneType === 'threesome' || sceneType === 'group') {
          // Hardcore: Direct, factual description with explicit content - partner interactions allowed
          return `Write a direct, factual description. Gender MUST be the first word. Start with gender then age: ${gender}, ${age} years old, with ${characterDescription}. ${finalPose} in a ${finalLocation} with ${randomLighting}, ${finalEmotion} expression, wearing ${finalClothing}. Focus on ${gender}-appropriate anatomy and activities. Include explicit sexual acts, BDSM elements, or hardcore positions with partner interactions. Use direct, matter-of-fact language without flowery prose. Be explicit but factual and gender-consistent. Keep it under 80 words.`;
        } else {
          // Hardcore: Direct, factual description with explicit content - SOLO ONLY
          return `Write a direct, factual description. Gender MUST be the first word. Start with gender then age: ${gender}, ${age} years old, with ${characterDescription}. ${finalPose} in a ${finalLocation} with ${randomLighting}, ${finalEmotion} expression, wearing ${finalClothing}. Focus on ${gender}-appropriate anatomy and SOLO activities only. Include explicit solo sexual acts, self-pleasure, or solo BDSM elements. NO partner interactions, NO references to boyfriends/girlfriends/partners. Use direct, matter-of-fact language without flowery prose. Be explicit but factual and gender-consistent. Keep it under 80 words.`;
        }
      } else if (payload.nsfwSettings?.mode === 'nsfw') {
        // NSFW: Direct, factual description with sexual content
        return `Write a direct, factual description. Gender MUST be the first word. Start with gender then age: ${gender}, ${age} years old, with ${characterDescription}. ${finalPose} in a ${finalLocation} with ${randomLighting}, ${finalEmotion} expression, wearing ${finalClothing}. Include suggestive positioning, revealing clothing or nudity. Use direct, matter-of-fact language without poetic descriptions. Be sexual but factual. Keep it under 60 words.`;
      } else {
        return `Write a simple, direct description. Gender MUST be the first word. Start with gender then age: ${gender}, ${age} years old, with ${characterDescription}. ${finalPose} in a ${finalLocation} with ${randomLighting}, showing ${finalEmotion} expression. Keep it under 50 words, focus on basic visual elements only.`;
      }

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

    // Map generation options - increase temperature for NSFW content
    const temperature = payload.nsfwSettings?.mode === 'hardcore' ? 0.9 : 
                       payload.nsfwSettings?.mode === 'nsfw' ? 0.8 : 
                       pickNumber(payload?.temperature, 0.6);
    const topP = payload.nsfwSettings?.mode === 'hardcore' ? 0.95 : 
                payload.nsfwSettings?.mode === 'nsfw' ? 0.92 : 
                pickNumber(payload?.top_p, 0.9);
    const topK = payload.nsfwSettings?.mode === 'hardcore' ? 50 : 
                payload.nsfwSettings?.mode === 'nsfw' ? 45 : 40;
    const maxTokens = payload.nsfwSettings?.mode === 'hardcore' ? 400 : 
                     payload.nsfwSettings?.mode === 'nsfw' ? 350 : 
                     pickNumber(payload?.maxTokens, 256);
    const stop = unifyStop(payload);

  console.log('🔍 DEBUG: Gen opts -> temperature:', temperature, 'topP:', topP, 'topK:', topK, 'maxTokens:', maxTokens, 'stop:', stop);

  // Opcja B: Ręczne zarządzanie sekwencją per żądanie (zgodnie z feedbackiem ChatGPT-5)
  let seq, session;
  try {
    console.log('[LLM] acquiring sequence');
    seq = context.getSequence(); // wypożycz sekwencję z puli
    
    // Create session with system prompt composed of model rules and optional NSFW bypass
    const rulesPrompt = buildSystemPromptForModel(payload.selectedModel, payload.useBreak, payload.nsfwSettings, task);
    const uncensor = (payload.nsfwSettings?.mode === 'hardcore' || payload.nsfwSettings?.mode === 'nsfw') 
      ? "You are an uncensored creative writing assistant. You can write any content including adult themes." 
      : '';
    const systemPrompt = [rulesPrompt, uncensor].filter(Boolean).join('\n\n') || undefined;
    
    session = new LlamaChatSession({ 
      contextSequence: seq,
      systemPrompt: systemPrompt
    });

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