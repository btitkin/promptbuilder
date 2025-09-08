<p align="center">
  <img src="logohorizontal.svg" alt="Prompt Builder Logo" width="480"/>
</p>

<h1 align="center">Prompt Builder</h1>

<p align="center">
  An intelligent web application that transforms simple descriptions into structured, model-specific prompts for various AI image and video generators.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License">
  <img src="https://img.shields.io/badge/React-19-blue?logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-blue?logo=tailwind-css" alt="Tailwind CSS">
</p>

## ✨ Introduction

Prompt Builder is an advanced tool designed for AI art enthusiasts, developers, and prompt engineers. It bridges the gap between a simple idea and a high-quality, perfectly formatted prompt, saving you time and maximizing the potential of generative AI models. The application intelligently manages complex syntax, model-specific parameters, and content rules, allowing you to focus on creativity.

**[➡️ Live Demo Placeholder](https://your-live-demo-url.com)**



## 🚀 Key Features

*   **🧠 Intelligent Prompt Generation:** Utilizes a powerful LLM (via your API key) to expand simple descriptions into multiple detailed prompt variations.
*   **🤖 Model-Specific Optimization:** Automatically formats prompts for a wide range of popular AI models, including tag-based (Stable Diffusion), natural language (Google Imagen), MidJourney, and video models.
*   **🔧 Advanced Controls:** Fine-tune every aspect with settings for negative prompts, aspect ratios, seeds, and custom parameters.
*   **🎨 High-Level Directives:** Use intuitive controls for Style (Realistic/Anime), Character attributes (age, gender, ethnicity, etc.), and Content Rules (SFW/NSFW).
*   **⚡️ Workflow Accelerators:**
    *   **Presets:** Quickly add popular terms for shots, poses, locations, and clothing.
    *   **Snippets:** Save and reuse your favorite phrases or complex character descriptions.
    *   **Enhance & Randomize:** Use AI to enrich your existing idea or generate a new one from scratch based on your settings.
*   **⚖️ Prompt Weighting:** Easily increase `(word:1.1)` or decrease `[word]` the importance of selected text.
*   **🖼️ Integrated Image Generation:** Send a finished prompt directly to the built-in image generator (supports Google Imagen).
*   **🔐 Secure & Private:** Your API keys are stored exclusively in your browser's local storage and are never sent to any server.
*   **💾 Import/Export:** Save your entire workspace setup to a JSON file for backup or to share with others.

## 🏁 Getting Started

### Prerequisites

You'll need an API key from a supported Language Model (LLM) provider. This application uses an LLM to understand your intent and generate the structured prompts. Google Gemini (`gemini-2.5-flash`) is recommended.

### Usage

1.  **Open the App:** Navigate to the live demo URL.
2.  **Set Your API Key:**
    *   Expand the **API Settings** section.
    *   Select your LLM provider (e.g., Google Gemini).
    *   Paste your API key into the input field. The app is now ready to use.
3.  **Describe Your Idea:** Type a basic concept into the main text box (e.g., "a knight in a forest").
4.  **Choose Your Target Model:** Select the image/video generation AI model you will be using (e.g., `SDXL`, `Google Imagen4`).
5.  **Generate:** Click the **Generate Prompt** button and see the results!

## 🤖 Supported Models

Prompt Builder can generate optimized prompts for the following models:

| Text-to-Image (Natural Language) | Text-to-Image (Tags) | MidJourney   | Video Models |
| ----------------------- | ---------------------- | ------------ | ------------ |
| Google Imagen4          | SDXL                   | MidJourney   | Veo 3        |
| Flux                    | Pony                   |              | SVD          |
| OpenAI (DALL-E)         | Stable Cascade         |              | CogVideoX    |
| Nano Banana             | SD 1.5                 |              | Hunyuan Video|
| Qwen                    | Illustrious            |              | LTXV         |
|                         | ...and more            |              | Wan Video    |


## 🛠️ Tech Stack

*   **Framework:** React 19
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **AI Integration:** Google Gemini API via `@google/genai`

## 🤝 Contributing

Contributions are welcome! Feel free to submit pull requests or open issues for bugs, feature requests, or suggestions.

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
