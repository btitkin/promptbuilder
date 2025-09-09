# ComfyUI Prompt Builder Nodes - Advanced Edition

A comprehensive ComfyUI integration for Prompt Builder featuring **two powerful nodes** with the complete feature set from the main application.

## 🚀 Features

### **🔥 Two Advanced Nodes:**
- **Prompt Builder (Local LLM)** - Works with local AI models (Ollama, LM Studio, etc.)
- **Prompt Builder (Online LLM)** - Supports major online APIs (OpenAI, Claude, Gemini, etc.)

### **💎 Complete Feature Set:**
- **Full Model Support** - SDXL, Pony, Flux, Illustrious, NoobAI, MidJourney, and more
- **Advanced Character Controls** - Gender, age, body type, ethnicity, and detailed attributes
- **NSFW Support** - Three modes: Off, NSFW, Hardcore with granular controls
- **Style System** - Realistic (Professional/Amateur/Flash) and Anime (Ghibli/Naruto/Bleach)
- **Preset System** - Shot, Pose, Location, and Clothing presets
- **Quality Tags** - Automatic model-specific quality enhancement
- **BREAK Support** - Smart token insertion for compatible models
- **Model-Specific Formatting** - Optimized output for each target model

## 📦 Installation

### 1. Via ComfyUI Manager (Recommended)

1. Open ComfyUI
2. Click "Manager" in the menu
3. Select "Install Custom Nodes"
4. Paste URL: `https://github.com/btitkin/promptbuilder.git`
5. Select branch: `comfyui-node`
6. Click "Install"
7. Restart ComfyUI

### 2. Manual Installation

1. Navigate to `ComfyUI/custom_nodes/` folder
2. Clone the repository:
   ```bash
   git clone -b comfyui-node https://github.com/btitkin/promptbuilder.git comfyui-promptbuilder-node
   ```
3. Install dependencies:
   ```bash
   cd comfyui-promptbuilder-node
   pip install -r requirements.txt
   ```
4. Restart ComfyUI

## 🔧 Local LLM Setup

### Ollama
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Download model
ollama pull mistral

# Start server
ollama serve
```

### LM Studio
1. Download and install LM Studio
2. Download a model (e.g., Mistral 7B)
3. Start local server on port 1234

### Other Compatible APIs
Any OpenAI-compatible API (LocalAI, text-generation-webui, etc.)

## 🎯 Usage

### **🔧 Node Selection**

**Choose the right node for your setup:**
- **Prompt Builder (Local LLM)** - For Ollama, LM Studio, or other local APIs
- **Prompt Builder (Online LLM)** - For OpenAI, Claude, Gemini, and other cloud APIs

### **⚡ Quick Start**

#### **Local LLM Node:**
1. Add "Prompt Builder (Local LLM)" to your workflow
2. Configure:
   - **API URL**: `http://127.0.0.1:1234` (LM Studio) or `http://127.0.0.1:11434` (Ollama)
   - **Model Name**: Your local model (e.g., `mistral`, `llama2`)
   - **Target Model**: Choose your image generation model (SDXL, Pony, etc.)
3. Set description and run!

#### **Online LLM Node:**
1. Add "Prompt Builder (Online LLM)" to your workflow
2. Configure:
   - **API Provider**: Choose from OpenAI, Claude, Gemini, etc.
   - **API Key**: Your provider's API key
   - **Target Model**: Choose your image generation model
3. Set description and run!

### **🎨 Advanced Configuration**

#### **Core Parameters**
| Parameter | Type | Options | Description |
|-----------|------|---------|-------------|
| `description` | STRING | - | Your creative prompt |
| `target_model` | CHOICE | SDXL, Pony, Flux, etc. | Target image generation model |
| `style_main` | CHOICE | realistic, anime | Main style category |
| `style_sub` | CHOICE | professional, amateur, flash, ghibli, etc. | Sub-style refinement |
| `num_variations` | INT | 1-10 | Number of prompt variations |

#### **🔞 NSFW Controls**
| Parameter | Type | Options | Description |
|-----------|------|---------|-------------|
| `nsfw_mode` | CHOICE | off, nsfw, hardcore | Content rating level |
| `nsfw_level` | INT | 1-10 | NSFW intensity |
| `hardcore_level` | INT | 1-10 | Hardcore content intensity |
| `enhance_person` | BOOLEAN | - | Enhance character descriptions |
| `enhance_pose` | BOOLEAN | - | Enhance pose descriptions |
| `enhance_location` | BOOLEAN | - | Enhance location descriptions |
| `ai_imagination` | BOOLEAN | - | Allow AI creative additions |

#### **👤 Character Settings**
| Parameter | Type | Options | Description |
|-----------|------|---------|-------------|
| `gender` | CHOICE | any, male, female, mixed | Character gender |
| `age_range` | CHOICE | any, 18s, 25s, 30s, 40s, 50s, 60s, 70+ | Age range |
| `body_type` | CHOICE | any, slim, curvy, athletic, etc. | Body type |
| `ethnicity` | CHOICE | any, caucasian, asian, african, etc. | Ethnicity |
| `height_range` | CHOICE | any, short, average, tall, etc. | Height range |

#### **🚺 Female-Specific**
- `breast_size`: any, flat, small, medium, large, huge, gigantic
- `hips_size`: any, narrow, average, wide, extra wide
- `butt_size`: any, flat, small, average, large, bubble

#### **🚹 Male-Specific**
- `penis_size`: any, small, average, large, huge, horse-hung
- `muscle_definition`: any, soft, toned, defined, ripped, bodybuilder
- `facial_hair`: any, clean-shaven, stubble, goatee, mustache, full beard

#### **🎬 Preset System**
| Parameter | Type | Examples | Description |
|-----------|------|----------|-------------|
| `shot_presets` | STRING | "close-up, portrait" | Camera shot types |
| `pose_presets` | STRING | "standing, confident" | Character poses |
| `location_presets` | STRING | "studio, outdoor" | Scene locations |
| `clothing_presets` | STRING | "casual, elegant" | Clothing styles |

### **📤 Outputs**

- **positive_prompt** - Enhanced positive prompt with quality tags
- **negative_prompt** - Negative prompt (elements to avoid)
- **enhanced_description** - AI-enhanced scene description
- **formatted_prompt** - Model-specific formatted prompt (NEW!)

## 🔗 Example Workflows

### **🎨 Dual-Style Workflow (Realistic + Anime)**

```
[Prompt Builder Local] → [CLIP Text Encode] → [KSampler SDXL] → [VAE Decode] → [Save Realistic]
                      ↘ [CLIP Text Encode (Neg)]

[Prompt Builder Online] → [CLIP Text Encode] → [KSampler Illustrious] → [VAE Decode] → [Save Anime]
                       ↘ [CLIP Text Encode (Neg)]
```

### **🔥 Advanced Features Showcase**

```
Prompt Builder (Local LLM):
├── Description: "A majestic dragon flying over a medieval castle"
├── Target Model: SDXL
├── Style: Realistic → Professional
├── Shot Presets: "wide shot, cinematic"
├── Location Presets: "castle, medieval"
├── Quality Tags: Enabled
├── BREAK Support: Enabled
└── Outputs: Enhanced prompts optimized for SDXL

Prompt Builder (Online LLM):
├── Description: "A beautiful anime girl in a magical forest"
├── API Provider: OpenAI GPT-4
├── Target Model: Illustrious
├── Style: Anime → Ghibli
├── Character: Female, 25s, Japanese
├── Pose Presets: "standing, graceful"
├── Clothing Presets: "fantasy, elegant"
└── Outputs: Enhanced prompts optimized for Illustrious
```

## ⚙️ Advanced Configuration

### Different LLM Models

**Ollama:**
- URL: `http://127.0.0.1:11434`
- Models: `mistral`, `llama2`, `codellama`

**LM Studio:**
- URL: `http://127.0.0.1:1234`
- Models: Any loaded model

**text-generation-webui:**
- URL: `http://127.0.0.1:5000`
- Mode: OpenAI API compatibility

### Prompt Optimization

**Photorealistic:**
- Adds photography terms
- Focuses on lighting and composition
- Includes technical details

**Anime:**
- Uses anime/manga terminology
- Adds artistic style elements
- Includes character design references

**Artistic:**
- Focuses on art movements
- Adds painting techniques
- Includes aesthetic elements

## 🐛 Troubleshooting

### "Connection Error"
- Check if local LLM is running
- Verify API URL (http://127.0.0.1:1234)
- Check if port is not blocked

### "API Error 404"
- Check if model is loaded
- Verify model name
- Check if API endpoint is correct

### "Timeout Error"
- Increase timeout in node code
- Check system performance
- Consider smaller LLM model

### CORS Issues (for web applications)
- Use desktop application (Electron)
- Configure proxy in development server
- Run LLM with CORS support

## 📋 System Requirements

- **ComfyUI** - Latest version
- **Python** - 3.8+
- **RAM** - Min. 8GB (16GB recommended for larger models)
- **GPU** - Optional (for LLM acceleration)
- **Local LLM** - Ollama/LM Studio/other

## 🤝 Support

- **Issues**: [GitHub Issues](https://github.com/btitkin/promptbuilder/issues)
- **Documentation**: [Wiki](https://github.com/btitkin/promptbuilder/wiki)
- **Discussions**: [GitHub Discussions](https://github.com/btitkin/promptbuilder/discussions)

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- ComfyUI team for the amazing platform
- AI community for support and feedback
- Local LLM model creators

---

**Prompt Builder ComfyUI Node** - Generate better prompts with the power of local LLMs! 🚀