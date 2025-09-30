const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const path = require('path');
const { getLlama, LlamaChatSession } = require("node-llama-cpp");
// Consider app.isPackaged to detect dev reliably when running `electron .`
const isDev = !app.isPackaged;

// LLM variables
let llama;
let model;

const DEFAULT_CONTEXT_SIZE = 2048; // było 512 – zwiększamy dla stabilności narracji
const DEFAULT_MAX_NEW_TOKENS = 256;

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

function unifyStop(stop) {
  // wymuszamy nasz sentinel
  return ['<<EOD>>'];
}

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
    case 'generatePromptVariations': {
      const description = payload?.prompt || '';
      return `As an expert prompt engineer, transform the following description into ${payload?.numVariations || 1} optimized prompt variation(s) for ${payload?.selectedModel || 'SDXL'}.
"""
${description}
"""

Strict output requirements:
- Return a JSON object with exactly two keys: "structuredPrompts" and "negativePrompt".
- "structuredPrompts" MUST be an array with exactly ${payload?.numVariations || 1} item(s).
- Each item MUST be an object with ONLY these keys: "subject", "attributes", "clothing", "pose", "action", "location", "background", "style".
- The value of every key MUST be an array of strings.
- Use concise, model-appropriate phrases. Do NOT include generation parameters (aspect ratio, seed) or negative concepts inside these arrays.

Content mode: ${payload?.nsfwSettings?.mode || 'off'}
Style filter: ${payload?.styleFilter?.main || 'realistic'}${payload?.styleFilter?.sub && payload?.styleFilter?.sub !== 'any' ? '/' + payload?.styleFilter?.sub : ''}
Character settings: ${JSON.stringify(payload?.characterSettings || {})}

Return only the JSON object, no additional text.`;
    }
    case 'enhanceDescription':
      return `You are a prompt expansion expert. Your task is to take a list of basic keywords and enrich them with more specific and descriptive details, while maintaining the original \`key: value\` structure as much as possible.
Instructions:
Analyze the input keywords below.
For each keyword or key-value pair, add more specific, creative details.
Output the new, enriched list of keywords.

Example:
INPUT: clothing: suit, location: city, hair_color: red
CORRECT OUTPUT: clothing: tailored black pinstripe business suit with a crisp white shirt, location: rain-slicked neon-lit cyberpunk city street at night, hair_color: vibrant crimson red

Input Keywords to Enhance:
${payload?.prompt || ''}`;
    case 'generateRandomDescription':
      return `You are a creative author. Your task is to write a single, descriptive PARAGRAPH about a compelling character in a scene.
Crucial Rule: Your output MUST be a narrative paragraph with full sentences. It MUST NOT be a comma-separated list of keywords or tags.
Content Policy: The tone of the paragraph must match the user's SFW/NSFW/Hardcore setting: ${payload?.nsfwSettings?.mode || 'SFW'}.`;
    default:
      return String(payload?.prompt || '').trim();
  }
}

// w konstrukcji modelu
const ctxSize = DEFAULT_CONTEXT_SIZE;
const maxNewTokens = DEFAULT_MAX_NEW_TOKENS;

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true
    },
    icon: path.join(__dirname, '../logo.svg'),
    show: false, // Don't show until ready-to-show
    titleBarStyle: 'default'
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Prevent navigation to external URLs
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    if (parsedUrl.origin !== 'http://localhost:5173' && !navigationUrl.startsWith('file://')) {
      event.preventDefault();
      shell.openExternal(navigationUrl);
    }
  });
}

// LLM IPC handler
ipcMain.handle('llm-request', async (_event, args) => {
  // Support both legacy shape ({provider, payload}) and new shape ({task, payload})
  const task = args?.task || 'custom';
  const payload = args?.payload || {};

  const prompt = buildPromptForTask(task, payload);
  const temperature = payload?.temperature ?? 0.7;
  const top_p = payload?.top_p ?? 0.9;
  const maxTokens = payload?.maxTokens ?? maxNewTokens;
  const stops = unifyStop(payload?.stop);

  let text = '';
  try {
    // Initialize llama if not already initialized
    if (!llama) {
      await initializeLlama();
    }

    // Create a new session for this request
    const context = await model.createContext({ threads: 4 });
    const session = new LlamaChatSession({ context });

    // Set generation parameters
    const generationOptions = {
      temperature,
      topP: top_p,
      maxTokens: maxTokens,
      stopSequences: stops
    };

    // Generate response using the model
    const response = await session.prompt(prompt, generationOptions);
    text = response;

    console.log('LLM response generated:', text.substring(0, 100) + '...');
  } catch (error) {
    console.error('LLM generation error:', error);
    // Fallback to placeholder if LLM fails
    text = prompt;
  }

  // Trim only at the first occurrence of any stop sequence; if none found, keep full text
  const finalText = trimAtStopSequences(text, stops);

  // Return unified schema for structured tasks
  try {
    switch (task) {
      case 'generatePromptVariations': {
        const parsed = parseLlamaJsonResponse(finalText);
        if (parsed) {
          return {
            structuredPrompts: Array.isArray(parsed.structuredPrompts) ? parsed.structuredPrompts : [parsed],
            negativePrompt: parsed.negativePrompt || 'blurry, ugly, bad anatomy, watermark, signature'
          };
        }
        return {
          structuredPrompts: [{ subject: [], attributes: [], clothing: [], pose: [], action: [], location: [], background: [], style: [] }],
          negativePrompt: 'blurry, ugly, bad anatomy, watermark, signature'
        };
      }
      case 'enhanceDescription':
      case 'generateRandomDescription':
      default:
        return { result: finalText };
    }
  } catch (e) {
    console.warn('Failed to parse or format LLM response:', e);
    return { result: finalText };
  }
});

// Initialize Llama model
async function initializeLlama() {
  try {
    console.log('Initializing Llama model...');
    llama = await getLlama();
    
    // Load a model - you can change this to your preferred model path
    const modelPath = process.env.LLAMA_MODEL_PATH || './models/Qwen2.5-7B-Instruct-Q4_K_M.gguf';
    model = await llama.loadModel({
      modelPath: modelPath,
      gpuLayers: 'max' // Pełne wykorzystanie GPU dla modelu 12B
    });
    
    console.log('Llama model loaded successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize Llama:', error);
    throw error;
  }
}

// Create application menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectall' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About Prompt Builder',
          click: () => {
            shell.openExternal('https://github.com/btitkin/promptbuilder');
          }
        }
      ]
    }
  ];

  // macOS specific menu adjustments
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });

    // Window menu
    template[4].submenu = [
      { role: 'close' },
      { role: 'minimize' },
      { role: 'zoom' },
      { type: 'separator' },
      { role: 'front' }
    ];
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();
  createMenu();

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});

// Handle certificate errors
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  if (isDev) {
    // In development, ignore certificate errors
    event.preventDefault();
    callback(true);
  } else {
    // In production, use default behavior
    callback(false);
  }
});