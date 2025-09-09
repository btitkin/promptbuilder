# ComfyUI Prompt Builder Node

A ComfyUI integration for Prompt Builder that enables advanced prompt generation using local LLM models.

## 🚀 Features

- **Local LLM Support** - Works with local AI models (Ollama, Mistral, LM Studio)
- **Prompt Generation** - Automatically creates detailed positive and negative prompts
- **Multiple Styles** - Support for different styles: photorealistic, anime, artistic
- **Configurable** - Full control over generation parameters
- **Offline Operation** - Works completely offline with local models

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

### Basic Usage

1. **Add Node** - In ComfyUI, add "Prompt Builder (Local LLM)" node
2. **Configure Connection:**
   - **API URL**: `http://127.0.0.1:1234` (for LM Studio)
   - **Model Name**: `mistral` or your model name
3. **Enter Description**: "A beautiful sunset over mountains"
4. **Select Style**: photorealistic/anime/artistic
5. **Run** - Node will generate enhanced prompts

### Input Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `description` | STRING | "A beautiful sunset..." | Basic scene description |
| `api_url` | STRING | "http://127.0.0.1:1234" | Local LLM API URL |
| `model_name` | STRING | "dolphin-2.7-mixtral-8x7b" | Model name |
| `style_filter` | CHOICE | "photorealistic" | Style: photorealistic/anime/artistic |
| `num_variations` | INT | 3 | Number of variations (1-10) |
| `api_key` | STRING | "" | API Key (optional) |
| `temperature` | FLOAT | 0.7 | Creativity (0.1-2.0) |
| `max_tokens` | INT | 2000 | Maximum response length |

### Outputs

- **positive_prompt** - Detailed positive prompt
- **negative_prompt** - Negative prompt (elements to avoid)
- **enhanced_description** - Extended scene description

## 🔗 Example Workflow

```
[Prompt Builder Node] → [CLIP Text Encode] → [KSampler] → [VAE Decode] → [Save Image]
                    ↘ [CLIP Text Encode (Negative)]
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