# Prompt Builder - Advanced AI Prompt Generation

> **Professional-grade prompt generation for AI image creation with intelligent batch processing, anime styles, and advanced randomization**

[![GitHub Stars](https://img.shields.io/github/stars/btitkin/promptbuilder?style=for-the-badge)](https://github.com/btitkin/promptbuilder/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/btitkin/promptbuilder?style=for-the-badge)](https://github.com/btitkin/promptbuilder/network/members)
[![License](https://img.shields.io/github/license/btitkin/promptbuilder?style=for-the-badge)](https://github.com/btitkin/promptbuilder/blob/main/LICENSE)
[![ComfyUI](https://img.shields.io/badge/ComfyUI-Compatible-brightgreen?style=for-the-badge)](https://github.com/comfyanonymous/ComfyUI)

## Overview

**Prompt Builder** is the most advanced AI prompt generation system available, designed for creators who demand professional results. Whether you're using the **Electron desktop application** or exploring the code in the **web dev server**, you get powerful features that transform simple descriptions into detailed, high-quality prompts.

---

## Choose Your Version

### **Electron Desktop Application** (Recommended)
> Privacy-focused, runs fully local with a built-in GGUF model loader

- **Beautiful Interface** - Modern, responsive React-based UI
- **Complete Privacy** - All processing happens locally on your machine
- **Local LLM Integration** - Built-in GGUF support powered by node-llama-cpp (no external server required)
- **Real-time Generation** - Instant prompt creation
- **Advanced Character Builder** - Detailed customization
- **20+ Anime Styles** - From Studio Ghibli to modern anime
- **Intelligent Batch Processing** - Generate multiple prompts with smart randomization
- **History & Favorites** - Save and manage prompts

### **ComfyUI Integration** (comfyui-node branch)
> Seamless integration with your ComfyUI workflows

- **Native Integration** - Works directly in ComfyUI
- **Workflow Ready** - Drag & drop nodes
- **Batch Processing** - Generate prompts at scale
- **Anime Styles** - 20+ specific anime art styles

---

## Core Features

### **Intelligent AI Generation**
- **Local LLM (GGUF) Support** - Run models locally via node-llama-cpp
- **Online APIs** - Google Gemini supported out of the box (set GEMINI_API_KEY)
- **Custom API (Optional)** - Bring your own OpenAI-compatible API via the Custom provider
- **Smart Prompting** - Context-aware prompt enhancement

### **Advanced Character Control**
- **Physical Attributes** - Gender, age, body type, ethnicity
- **Detailed Customization** - Height, build, female/male traits, overlays
- **NSFW Support** - Three modes with granular control
- **Preserved Traits** - Custom features that never change

### **Professional Style System**
- **Realistic Styles** - Professional, amateur, flash photography
- **Anime Styles** - 20+ specific styles (Ghibli, Naruto, Bleach, etc.)
- **Dynamic Selection** - Context-aware style options
- **Quality Enhancement** - Automatic model-specific tags

### **Intelligent Batch Processing**
- **Smart Randomization** - Fixed vs. variable elements
- **Batch Generation** - Multiple prompts with one click
- **Character Consistency** - Same person, different scenarios
- **Selective Variation** - Choose what randomizes

---

## Quick Start (Electron)

### 1) Clone and Install
```bash
# Clone the repository
git clone https://github.com/btitkin/promptbuilder.git
cd promptbuilder

# Install dependencies
npm install
```

### 2) Add a Local GGUF Model
The desktop app loads a local model file at runtime. By default it looks for:

- models/Qwen2.5-7B-Instruct-Q4_K_M.gguf

Steps:
- Create a folder named `models/` in the project root (if it doesn't exist)
- Download the GGUF file for your preferred instruct model
- Save it as `Qwen2.5-7B-Instruct-Q4_K_M.gguf` inside the `models/` folder
- Alternatively, update the filename in `main.js` if you want to use a different model name

Notes:
- GPU acceleration is enabled by default (gpuLayers: 'max') in the Electron app
- On first run, the app verifies the model exists and logs helpful errors if not

### 3) Start the App
```bash
# Start Vite + Electron together
npm run electron:dev
```
- If port 5173 is busy, the dev server may use 5174 automatically. The Electron app now falls back to 5174.

### 4) Providers and API Keys
- Local model: choose the "Local" or "custom_local" provider in the UI (Electron only)
- Google Gemini: set your API key in a `.env` file in the project root:
```bash
GEMINI_API_KEY=your_api_key_here
```

---

## Build and Distribution

### Desktop Application (Electron)
```bash
# Build Electron app for your platform
npm run build:electron

# Or produce installers/portable builds (no publish)
npm run dist
```
The Electron build bundles your `models/` folder into the app’s resources automatically.

### Web Dev Server (for UI development only)
```bash
# Run the UI in a browser (local LLM disabled in browser)
npm run dev
```
- When running only the Vite dev server in a browser, the local LLM is not available (Electron bridge is required). Use Gemini or a custom API provider instead.

---

## Scripts
These are the most relevant scripts from package.json:

- `npm run dev` — Start Vite dev server (UI only; no local LLM)
- `npm run electron` — Launch Electron using the last build artifacts
- `npm run electron:dev` — Start Vite and Electron together for development
- `npm run build` — Build the web assets (dist)
- `npm run build:electron` — Build Electron app via electron-builder
- `npm run dist` — Build installers/portable distributions
- `npm test` — Run unit tests (vitest)

---

## Troubleshooting

- Electron API is not available
  - You opened the UI in a regular browser (npm run dev). Use `npm run electron:dev` instead.

- Model file not found or too small
  - Make sure `models/Qwen2.5-7B-Instruct-Q4_K_M.gguf` exists and is a valid GGUF file
  - You can change the expected filename in `main.js`

- Dev server on port 5173 is busy
  - Vite may switch to 5174 automatically; the Electron app now falls back to 5174

- Gemini returns an auth error
  - Ensure `GEMINI_API_KEY` is set in a `.env` file at the project root

---

## ComfyUI Integration (Alternative)
For ComfyUI users, switch to the `comfyui-node` branch and follow the installation steps using the ComfyUI Manager or manual setup. This repository includes Python components and nodes tailored for ComfyUI workflows.

---

## License
MIT License. See LICENSE for details.
# Prompt Builder

Professional prompt-generation toolkit for AI image and video models. Prompt Builder transforms a simple description into multiple, structured, model-aware prompts. It offers a modern desktop app (Electron) and a web UI for development, with support for local LLMs and major online providers.

## Overview

Prompt Builder helps you move from idea to production-ready prompts quickly and consistently. It understands model-specific syntax (tag-based and natural language), applies style and content rules, and supports selective variation for batch workflows.

## Key Features

- Intelligent prompt expansion from a short description into multiple variants
- Model-aware formatting for tag-based (e.g., Stable Diffusion) and natural-language models
- Local LLM integration (Electron) with built-in support for GGUF models
- Online API providers (Gemini and any OpenAI-compatible API via Custom provider)
- Advanced controls: negative prompts, seeds, aspect ratios, and custom parameters
- Style system: realistic and anime styles, plus fine-grained preset controls
- Selective randomization and batch generation with consistency options
- History and favorites; saved snippets for reusable phrases
- Clean, responsive UI built with React + Vite

## System Requirements

- Windows 10/11 (64-bit) recommended for the Electron app
- Node.js 18+ and npm
- For local LLM usage (Electron): GGUF model file; 8 GB RAM minimum (16 GB recommended)

## Installation

```bash
git clone https://github.com/btitkin/promptbuilder.git
cd promptbuilder
npm install
```

## Quick Start

### Web Dev Server (UI only)

Runs the UI for rapid development. Local LLM features are disabled in a regular browser; use an online provider.

```bash
npm run dev
# Open http://localhost:5173/ (the dev server may choose a nearby port)
```

### Electron Desktop App (Local LLM + Full Features)

Starts Vite and Electron together for the desktop app experience. This mode enables the local LLM bridge and full functionality.

```bash
npm run electron:dev
```

If port `5173` is busy, the dev server may switch to `5174`; the Electron app will fall back automatically.

## Providers and API Keys

Prompt Builder can operate with either a local LLM (Electron) or online APIs.

### Local LLM (Electron)

- Place a GGUF model in `models/` (create the folder if it doesn't exist). Example filename:
  - `models/Qwen2.5-7B-Instruct-Q4_K_M.gguf`
- Download model: [Qwen2.5-7B-Instruct-Q4_K_M.gguf](https://huggingface.co/bartowski/Qwen2.5-7B-Instruct-GGUF/resolve/main/Qwen2.5-7B-Instruct-Q4_K_M.gguf?download=true) and place it under `models/`.
- The Electron app looks for a default model file at startup. If you use a different filename, update the path in `main.js` accordingly.
- GPU acceleration is enabled by default when available.

### Online APIs

- Gemini: set an environment variable `GEMINI_API_KEY` or paste the key in the UI under API Settings.
- Custom provider: any OpenAI-compatible API. Configure base URL and model name in the UI.

## Configuration

- Environment variables (when running locally):
  - `GEMINI_API_KEY` – used by the Gemini provider.
- User settings are stored locally (browser/electron storage). No keys or prompts are sent anywhere except to the providers you configure.

## Build and Distribution

Build the web assets and the desktop application.

```bash
# Build web assets (dist)
npm run build

# Build Electron app via electron-builder
npm run build:electron

# Produce installers/portable distributions
npm run dist
```

## Scripts

- `npm run dev` – start Vite dev server (UI only)
- `npm run electron:dev` – start Vite + Electron for development
- `npm run build` – build web assets
- `npm run build:electron` – build Electron app
- `npm run dist` – create installers/portable distributions
- `npm test` – run unit tests (vitest)

## Project Structure

```
components/           # React components (PromptInput, PromptOutput, presets, etc.)
services/             # Provider integrations and utilities
styles/               # Global theme and animation classes
electron/main.js      # Electron main process (LLM bridge, model loading)
index.html, index.tsx # App entry points
```

Portable build variants used for packaging are not part of the `main` branch distribution.

## Testing

```bash
npm test
```

End-to-end tests are available under `tests-e2e/`. The dev server must be running for browser-based tests.

## Troubleshooting

- Electron API unavailable in browser: use `npm run electron:dev` instead of `npm run dev`.
- Dev server port conflict: Vite may switch ports automatically; the Electron app will follow.
- Model file not found: ensure a GGUF file exists under `models/` and that its path matches the configuration in `electron/main.js`.
- Online provider errors: verify API keys and model names in API Settings.

## Security and Privacy

- When using a local LLM, all generation happens on your machine. Data does not leave your computer.
- API keys provided for online services are stored locally and sent only to the configured provider.

## License

This project is licensed under the MIT License. See `LICENSE` for details.