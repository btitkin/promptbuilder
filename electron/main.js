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
    mainWindow.loadURL('http://localhost:5174');
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
    
    if (parsedUrl.origin !== 'http://localhost:5174' && !navigationUrl.startsWith('file://')) {
      event.preventDefault();
      shell.openExternal(navigationUrl);
    }
  });
}

// LLM IPC handler
ipcMain.handle('llm-request', async (_event, args) => {
  const { provider, payload } = args || {};
  if (provider !== 'custom') throw new Error('Unsupported provider');

  const prompt = payload?.prompt || '';
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
  text = trimAtStopSequences(text, stops);

  return text;
});

// Initialize Llama model
async function initializeLlama() {
  try {
    console.log('Initializing Llama model...');
    llama = await getLlama();
    
    // Load a model - you can change this to your preferred model path
    const modelPath = process.env.LLAMA_MODEL_PATH || './models/gemma-3-12b-it-abliterated.q4_k_m.gguf';
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