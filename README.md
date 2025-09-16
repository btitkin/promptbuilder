# Prompt Builder - Advanced AI Prompt Generation

> **Professional-grade prompt generation for AI image creation with intelligent batch processing, anime styles, and advanced randomization**

[![GitHub Stars](https://img.shields.io/github/stars/btitkin/promptbuilder?style=for-the-badge)](https://github.com/btitkin/promptbuilder/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/btitkin/promptbuilder?style=for-the-badge)](https://github.com/btitkin/promptbuilder/network/members)
[![License](https://img.shields.io/github/license/btitkin/promptbuilder?style=for-the-badge)](https://github.com/btitkin/promptbuilder/blob/main/LICENSE)
[![ComfyUI](https://img.shields.io/badge/ComfyUI-Compatible-brightgreen?style=for-the-badge)](https://github.com/comfyanonymous/ComfyUI)

## Overview

**Prompt Builder** is the most advanced AI prompt generation system available, designed for creators who demand professional results. Whether you're using the **standalone web application** or the **ComfyUI integration**, you get the same powerful features that transform simple descriptions into detailed, high-quality prompts.

---

## Choose Your Version

### **Standalone Web Application** (Main Branch)
> Perfect for direct use, privacy-focused local processing, and development

- **Beautiful Web Interface** - Modern, responsive React-based UI
- **Complete Privacy** - All processing happens locally on your machine
- **Local LLM Integration** - Works with Ollama, LM Studio, Text Generation WebUI
- **Real-time Generation** - Instant prompt creation and live preview
- **Advanced Character Builder** - Detailed customization with live preview
- **20+ Anime Styles** - From Studio Ghibli to modern anime
- **Intelligent Batch Processing** - Generate 1-100 prompts with smart randomization
- **History & Favorites** - Save and manage your best prompts
- **Developer Ready** - Full TypeScript/React source code
- **Built-in Analytics** - Prompt analysis and optimization suggestions
- **Multiple Deployment Options** - Web app, Electron desktop, or Docker

**[Download Standalone App](https://github.com/btitkin/promptbuilder/archive/refs/heads/main.zip)**

### **ComfyUI Integration** (ComfyUI-Node Branch)
> Seamless integration with your ComfyUI workflows

- **Native Integration** - Works directly in ComfyUI
- **Workflow Ready** - Drag & drop nodes
- **Batch Processing** - Generate 1-100 prompts at once
- **Anime Styles** - 20+ specific anime art styles

**[Install ComfyUI Nodes](#comfyui-installation)**

---

## Core Features (Both Versions)

### **Intelligent AI Generation**
- **Local LLM Support** - Ollama, LM Studio, Text Generation WebUI
- **Online APIs** - OpenAI, Claude, Gemini, Groq, DeepSeek, and more
- **Smart Prompting** - Context-aware prompt enhancement
- **Model Optimization** - Tailored for each AI model

### **Advanced Character Control**
- **Physical Attributes** - Gender, age, body type, ethnicity
- **Detailed Customization** - Height, build, facial features
- **NSFW Support** - Three modes with granular control
- **Preserved Traits** - Custom features that never change

### **Professional Style System**
- **Realistic Styles** - Professional, amateur, flash photography
- **Anime Styles** - 20+ specific styles (Ghibli, Naruto, Bleach, etc.)
- **Dynamic Selection** - Context-aware style options
- **Quality Enhancement** - Automatic model-specific tags

### **Intelligent Batch Processing**
- **Smart Randomization** - Fixed vs. variable elements
- **Batch Generation** - 1-100 prompts with one click
- **Character Consistency** - Same person, different scenarios
- **Selective Variation** - Choose what randomizes

---

## ComfyUI Installation

### **Method 1: ComfyUI Manager (Recommended)**

1. Open ComfyUI
2. Click **"Manager"** → **"Install Custom Nodes"**
3. Paste: `https://github.com/btitkin/promptbuilder.git`
4. Select branch: **`comfyui-node`**
5. Click **"Install"** → **Restart ComfyUI**

### **Method 2: Manual Installation**

```bash
# Navigate to ComfyUI custom nodes folder
cd ComfyUI/custom_nodes/

# Clone the ComfyUI branch
git clone -b comfyui-node https://github.com/btitkin/promptbuilder.git

# Install dependencies
cd promptbuilder
pip install -r requirements.txt

# Restart ComfyUI
```

## ComfyUI Nodes Overview

### **Available Nodes**

#### **Main Generation Nodes**
- **Prompt Builder (Local LLM)** - Works with local AI models (Ollama, LM Studio, etc.)
- **Prompt Builder (Online LLM)** - Supports major online APIs (OpenAI, Claude, Gemini, etc.)
- **Quick Preset & Batch** - Simplified interface with batch processing

#### **Display & Utility Nodes**
- **Prompt Text Display** - Shows prompts in ComfyUI interface
- **Show Text** - Display any text directly in nodes
- **Prompt Selector** - Choose and customize specific outputs
- **Prompt Display & Stats** - Formatted display with statistics

### **Complete Feature Set**
- **Model Support** - SDXL, Pony, Flux, Illustrious, NoobAI, MidJourney, and more
- **Character Controls** - Gender, age, body type, ethnicity, detailed attributes
- **NSFW Support** - Three modes: Off, NSFW, Hardcore with granular controls
- **Anime Styles** - 20+ specific styles (Ghibli, Naruto, Bleach, One Piece, etc.)
- **Preset System** - Shot, Pose, Location, and Clothing presets
- **Quality Tags** - Automatic model-specific enhancement
- **Batch Processing** - Generate 1-100 prompts with intelligent randomization
- **Smart Randomization** - Fixed character + variable scenes
- **Performance Caching** - Faster generation with smart caching

---

## Standalone Web Application

### **Key Features**

#### **Privacy-First Design**
- **100% Local Processing** - No data sent to external servers
- **Offline Capable** - Works without internet connection
- **Your Data Stays Yours** - Complete control over your prompts and settings

#### **Advanced Local LLM Integration**
- **Ollama Support** - Direct integration with Ollama models
- **LM Studio Compatible** - Works with LM Studio's OpenAI API
- **Text Generation WebUI** - Supports oobabooga's text-generation-webui
- **Custom APIs** - Any OpenAI-compatible local API
- **Model Flexibility** - Use any model size that fits your hardware

#### **Professional Prompt Engineering**
- **Smart Character Builder** - Detailed physical and personality traits
- **Style System** - Realistic photography + 20+ anime art styles
- **Quality Enhancement** - Automatic model-specific optimization
- **Batch Generation** - Create 1-100 variations with intelligent randomization
- **Preset Library** - Pre-built combinations for common scenarios

#### **Developer Experience**
- **Modern Tech Stack** - React 18, TypeScript, Vite
- **Component Library** - Reusable UI components
- **API Abstraction** - Easy to add new LLM providers
- **Hot Reload** - Instant development feedback
- **Build Optimization** - Production-ready builds

### **Quick Start Guide**

#### **Step 1: Clone and Install**
```bash
# Clone the main branch
git clone https://github.com/btitkin/promptbuilder.git
cd promptbuilder

# Install dependencies
npm install
```

#### **Step 2: Setup Local LLM (Choose One)**

**Option A: Ollama (Recommended)**
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Download a model
ollama pull mistral
# or
ollama pull llama2

# Start Ollama (runs on http://localhost:11434)
ollama serve
```

**Option B: LM Studio**
1. Download and install [LM Studio](https://lmstudio.ai/)
2. Download a model (e.g., Mistral 7B, Llama 2 7B)
3. Start local server (runs on http://localhost:1234)

**Option C: Text Generation WebUI**
```bash
# Clone and setup text-generation-webui
git clone https://github.com/oobabooga/text-generation-webui
cd text-generation-webui
# Follow their installation guide
# Start with --api flag for API access
```

#### **Step 3: Start the Application**
```bash
# Development mode (with hot reload)
npm run dev

# Production build
npm run build
npm run preview
```

#### **Step 4: Configure LLM Connection**
1. Open the app in your browser
2. Go to Settings → API Configuration
3. Set your LLM endpoint:
   - **Ollama**: `http://localhost:11434`
   - **LM Studio**: `http://localhost:1234`
   - **Text Gen WebUI**: `http://localhost:5000`
4. Select your model name
5. Test connection and start generating!

### **Deployment Options**

#### **Desktop Application (Electron)**
```bash
# Build desktop app
npm run electron:build

# Development with Electron
npm run electron:dev
```

#### **Docker Deployment**
```bash
# Build Docker image
docker build -t promptbuilder .

# Run container
docker run -p 3000:3000 promptbuilder
```

#### **Static Hosting**
```bash
# Build for static hosting
npm run build

# Deploy to Netlify, Vercel, GitHub Pages, etc.
# Upload the 'dist' folder
```

### **Configuration Options**

#### **Environment Variables:**
```bash
# .env file
VITE_DEFAULT_API_URL=http://localhost:11434
VITE_DEFAULT_MODEL=mistral
VITE_ENABLE_ANALYTICS=false
VITE_THEME=dark
```

#### **Custom API Providers:**
```typescript
// Add custom LLM provider in src/services/
export const customApiService = {
  generatePrompt: async (config, prompt) => {
    // Your custom API logic
  }
}
```

## Example Use Cases

### **Character Consistency**
```
Input: "A beautiful woman"
Settings: Fixed (female, 25s, curvy, blonde hair, green eyes)
Batch: 100 prompts with random locations/poses
Result: Same woman in 100 different scenarios
```

### **Anime Style Exploration**
```
Style: Anime → Ghibli
Result: "Studio Ghibli style - soft, detailed, magical atmosphere"

Style: Anime → Naruto  
Result: "Naruto anime style - dynamic action poses, ninja themes"
```

### **Smart Batch Processing**
```
Batch Count: 50
Mode: Fixed Character
Randomize: Locations ✓, Poses ✓, Clothing ✓
Preserved: "freckles, dimples, blue eyes"
Result: 50 unique scenes with consistent character
```

---

## Technical Details

### **Supported Models**
- **SDXL** - Stable Diffusion XL
- **Pony** - Pony Diffusion V6
- **Flux** - Black Forest Labs Flux
- **Illustrious** - Anime/Illustration focused
- **NoobAI** - Community anime model
- **SD 1.5** - Classic Stable Diffusion
- **MidJourney** - MidJourney-optimized prompts

### **AI Providers**
- **Local:** Ollama, LM Studio, Text Generation WebUI, Kobold AI
- **Online:** OpenAI, Claude, Google Gemini, Groq, DeepSeek, Together AI

### **Performance**
- **Single Prompt:** ~1-3 seconds
- **Batch (100):** ~2-5 minutes (with caching)
- **Memory Usage:** <100MB
- **Cache Hit Rate:** 85%+ for similar requests

---

## Documentation & Support

### **Resources**
- **[Example Workflows](./workflows/)** - Ready-to-use ComfyUI workflows
- **[API Documentation](./docs/api.md)** - Complete API reference
- **[Configuration Guide](./docs/config.md)** - Setup and customization
- **[Style Guide](./docs/styles.md)** - All available styles and presets

### **Community & Support**
- **[Report Issues](https://github.com/btitkin/promptbuilder/issues)** - Bug reports and feature requests
- **[Discussions](https://github.com/btitkin/promptbuilder/discussions)** - Community discussions
- **[Contact](mailto:support@promptbuilder.ai)** - Direct support

### **Contributing**
- **[Pull Requests](https://github.com/btitkin/promptbuilder/pulls)** - Code contributions welcome
- **[Documentation](./CONTRIBUTING.md)** - Contribution guidelines
- **[Style Guide](./docs/development.md)** - Development standards

---

## License & Credits

### **License**
This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### **Acknowledgments**
- **ComfyUI Team** - For the amazing ComfyUI framework
- **Stability AI** - For Stable Diffusion models
- **Community Contributors** - For feedback, testing, and improvements
- **AI Model Creators** - For the incredible AI models we support

### **Show Your Support**
If you find Prompt Builder useful, please consider:
- **Starring** this repository
- **Forking** for your own projects
- **Sharing** with the community
- **Reporting** bugs and issues
- **Suggesting** new features

---

<div align="center">

**Made with ❤️ for the AI Art Community**

*Transform your creative vision into perfect prompts*

**[Back to Top](#prompt-builder---advanced-ai-prompt-generation)**

</div>