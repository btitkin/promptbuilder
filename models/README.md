# PromptBuilder - Local GGUF Models

This folder should contain GGUF model files for local LLM inference.

## Required Model File

Place the following GGUF model file in this directory:
- `gemma-3-12b-it-abliterated.q4_k_m.gguf`

## Download Instructions

1. Download the model from HuggingFace:
   ```bash
   # Using wget (Windows)
   wget https://huggingface.co/mlabonne/gemma-3-12b-it-abliterated-GGUF/blob/main/gemma-3-12b-it-abliterated.q4_k_m.gguf
   
   # Or using curl
   curl -L -o gemma-3-12b-it-abliterated.q4_k_m.gguf https://huggingface.co/mlabonne/gemma-3-12b-it-abliterated-GGUF/blob/main/gemma-3-12b-it-abliterated.q4_k_m.gguf
   ```

2. Alternatively, download manually from:
   https://huggingface.co/mlabonne/gemma-3-12b-it-abliterated-GGUF

## Model Specifications

- **Model**: Google Gemma 3 12B Instruct (Abliterated version)
- **Format**: GGUF (4-bit quantization)
- **Size**: ~7.3 GB
- **Requirements**: 16GB+ RAM recommended

## Alternative Models

You can also use other GGUF models by updating the path in `main.js`:
- Mistral, Llama, Phi models supported
- Update `modelPath` variable in electron/main.js

## Verification

After placing the model file, restart the Electron app. The console should show:
- "Loading model from: [path]"
- "LLM Model initialized successfully"