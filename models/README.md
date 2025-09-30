# PromptBuilder – Local GGUF Models

This folder holds GGUF model files for local LLM inference used by the Electron app. The current default local model is Qwen Instruct.

## Default Local Model

- `Qwen2.5-7B-Instruct-Q4_K_M.gguf`

The Electron app resolves the model from:
- Development: `./models/Qwen2.5-7B-Instruct-Q4_K_M.gguf`
- Packaged app: `<resources>/models/Qwen2.5-7B-Instruct-Q4_K_M.gguf`

You can also override the model path via the environment variable:
- `LLAMA_MODEL_PATH=./models/Qwen2.5-7B-Instruct-Q4_K_M.gguf`

Or edit the path directly in `main.js` (`modelPath`).

## Download Instructions (Windows)

Use either `curl` (available by default) or `wget`:

```bash
# curl
curl -L -o Qwen2.5-7B-Instruct-Q4_K_M.gguf \
  https://huggingface.co/Qwen/Qwen2.5-7B-Instruct-GGUF/resolve/main/Qwen2.5-7B-Instruct-Q4_K_M.gguf

# wget (if installed)
wget https://huggingface.co/Qwen/Qwen2.5-7B-Instruct-GGUF/resolve/main/Qwen2.5-7B-Instruct-Q4_K_M.gguf
```

Place the downloaded file into this `models/` directory.

## Runtime Settings (Electron)

The local LLM is powered by `node-llama-cpp`. Current defaults:
- `gpuLayers: 'max'` (uses available GPU for best performance)
- `contextSize: 512`, `sequences: 2`, threads auto-tuned
- Flash attention enabled when supported
- Unified stop sequence: `<<EOD>>`

These settings are defined in `main.js` and may be tuned automatically based on your hardware.

## Alternative GGUF Models

You may substitute other instruct GGUF models by changing `modelPath` or `LLAMA_MODEL_PATH`:
- Qwen family (e.g., `Qwen2.5-7B-Instruct-*`) – recommended
- Gemma 2/3 Instruct (e.g., `Gemma-2-9B-It-Q4_K_M.gguf`)
- Llama/Mistral/Phi instruct variants

Ensure the file is a valid GGUF and large enough (the app warns if the file is missing or suspiciously small).

## Qwen Provider (HTTP API)

Separately from the local GGUF model, you can use the Qwen provider in the UI to call an OpenAI-compatible HTTP API. Configure it under Custom API with your endpoint and Qwen model name. This is optional and independent from the local GGUF file.

## Verification

After placing the model file, start or restart the Electron app. The console should show messages such as:
- `Loading model from: [path]`
- `LLM Model initialized successfully`
- `Model ready: [size] MB`