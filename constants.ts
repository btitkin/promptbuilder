import type { ModelConfig } from './types';

/**
 * Configuration for models that primarily use comma-separated tags (Danbooru style).
 * Parameters like aspect ratio and negative prompts are typically handled as separate
 * fields in the generation UI or API, not within the prompt text itself.
 */
const SD_LIKE_CONFIG: Omit<ModelConfig, 'name' | 'supportsBreak'> = {
  syntaxStyle: 'tagged',
  paramStyle: 'ignore',
  negativePromptStyle: 'ignore',
  qualityTagsLocation: 'prepend',
  tagSeparator: ', ',
};

/**
 * Configuration for modern generative models that excel with descriptive, natural language sentences.
 * For these models, generation parameters (aspect ratio, negative prompt, etc.) are almost
 * always specified via dedicated API parameters, not in the text prompt.
 */
const MODERN_NATURAL_LANGUAGE_CONFIG: Omit<ModelConfig, 'name' | 'supportsBreak'> = {
  syntaxStyle: 'natural',
  paramStyle: 'ignore',
  negativePromptStyle: 'ignore',
  qualityTagsLocation: 'append',
  tagSeparator: ', ',
};

/**
 * Configuration for video generation models, which use natural language to describe scenes and actions.
 * Parameters are handled at the API level.
 */
const VIDEO_CONFIG: Omit<ModelConfig, 'name' | 'supportsBreak'> = {
  syntaxStyle: 'natural',
  paramStyle: 'ignore',
  negativePromptStyle: 'ignore',
  qualityTagsLocation: 'append',
  tagSeparator: ' ',
};


export const MODELS: Record<string, ModelConfig> = {
  // Stable Diffusion & Clones (Tagged Syntax)
  'SDXL': { ...SD_LIKE_CONFIG, name: 'SDXL', supportsBreak: true },
  'Pony': { ...SD_LIKE_CONFIG, name: 'Pony', supportsBreak: true },
  'Stable Cascade': { ...SD_LIKE_CONFIG, name: 'Stable Cascade', supportsBreak: true },
  'SD 1.5': { ...SD_LIKE_CONFIG, name: 'SD 1.5', supportsBreak: false },
  'AuraFlow': { ...SD_LIKE_CONFIG, name: 'AuraFlow', supportsBreak: false },
  'HiDream': { ...SD_LIKE_CONFIG, name: 'HiDream', supportsBreak: false },
  'Illustrious': { ...SD_LIKE_CONFIG, name: 'Illustrious', supportsBreak: false },
  'Kolors': { ...SD_LIKE_CONFIG, name: 'Kolors', supportsBreak: false },
  'Lumina': { ...SD_LIKE_CONFIG, name: 'Lumina', supportsBreak: false },
  'Mochi': { ...SD_LIKE_CONFIG, name: 'Mochi', supportsBreak: false },
  'NoobAI': { ...SD_LIKE_CONFIG, name: 'NoobAI', supportsBreak: false },
  'PixArt A/E': { ...SD_LIKE_CONFIG, name: 'PixArt A/E', supportsBreak: false },

  // MidJourney (Unique Hybrid Syntax)
  'MidJourney': {
    name: 'MidJourney',
    supportsBreak: false,
    syntaxStyle: 'natural',
    paramStyle: 'double-dash',      // Uses --ar, --seed
    negativePromptStyle: 'param',   // Uses --no
    qualityTagsLocation: 'append',
    tagSeparator: ', ',
    promptPrefix: '/imagine prompt: ',
  },

  // Modern Natural Language Models
  'Google Imagen4': { ...MODERN_NATURAL_LANGUAGE_CONFIG, name: 'Google Imagen4', supportsBreak: false },
  'Flux': { ...MODERN_NATURAL_LANGUAGE_CONFIG, name: 'Flux', supportsBreak: false },
  'Nano Banana': { ...MODERN_NATURAL_LANGUAGE_CONFIG, name: 'Nano Banana', supportsBreak: false },
  'OpenAI': { ...MODERN_NATURAL_LANGUAGE_CONFIG, name: 'OpenAI', supportsBreak: false }, // DALL-E series
  'Qwen': { ...MODERN_NATURAL_LANGUAGE_CONFIG, name: 'Qwen', supportsBreak: false },
  
  // Video Models
  'Veo 3': { ...VIDEO_CONFIG, name: 'Veo 3', supportsBreak: false },
  'CogVideoX': { ...VIDEO_CONFIG, name: 'CogVideoX', supportsBreak: false },
  'Hunyuan Video': { ...VIDEO_CONFIG, name: 'Hunyuan Video', supportsBreak: false },
  'LTXV': { ...VIDEO_CONFIG, name: 'LTXV', supportsBreak: false },
  'SVD': { ...VIDEO_CONFIG, name: 'SVD', supportsBreak: false },
  'Wan Video': { ...VIDEO_CONFIG, name: 'Wan Video', supportsBreak: false },
};

const POPULARITY_ORDER = [
  // User's specified top models
  'Google Imagen4',
  'SDXL',
  'SD 1.5',
  'Flux',
  'Pony',
  'Illustrious',
  'OpenAI',
  
  // Other popular text-to-image models
  'MidJourney',
  'Stable Cascade',
  'Nano Banana',
  'Qwen',
  'AuraFlow',
  'HiDream',
  'Kolors',
  'Lumina',
  'Mochi',
  'NoobAI',
  'PixArt A/E',

  // Video models
  'Veo 3',
  'SVD',
  'CogVideoX',
  'Hunyuan Video',
  'LTXV',
  'Wan Video',
];

// Ensure the exported list of names is sorted by popularity and only contains models that exist.
export const MODEL_NAMES = POPULARITY_ORDER.filter(name => name in MODELS);
