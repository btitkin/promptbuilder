import type { ModelConfig } from './types';

const SD_LIKE_CONFIG: Omit<ModelConfig, 'name' | 'supportsBreak'> = {
  syntaxStyle: 'tagged',
  paramStyle: 'double-dash',
  negativePromptStyle: 'param',
  qualityTagsLocation: 'prepend',
  tagSeparator: ', ',
};

const NATURAL_LANGUAGE_CONFIG: Omit<ModelConfig, 'name' | 'supportsBreak'> = {
  syntaxStyle: 'natural',
  // FIX: Removed 'supportsBreak' as it's excluded by the Omit type. It will be added to each model individually.
  paramStyle: 'natural-append',
  negativePromptStyle: 'natural-append',
  qualityTagsLocation: 'append',
  tagSeparator: ' ',
};

const VIDEO_CONFIG: Omit<ModelConfig, 'name' | 'supportsBreak'> = {
  syntaxStyle: 'natural',
  // FIX: Removed 'supportsBreak' as it's excluded by the Omit type. It will be added to each model individually.
  paramStyle: 'ignore',
  negativePromptStyle: 'ignore',
  qualityTagsLocation: 'append',
  tagSeparator: ' ',
};


export const MODELS: Record<string, ModelConfig> = {
  'SDXL': { ...SD_LIKE_CONFIG, name: 'SDXL', supportsBreak: true },
  'Pony': { ...SD_LIKE_CONFIG, name: 'Pony', supportsBreak: true },
  'Stable Cascade': { ...SD_LIKE_CONFIG, name: 'Stable Cascade', supportsBreak: true },
  'SD': { ...SD_LIKE_CONFIG, name: 'SD', supportsBreak: false },
  'AuraFlow': { ...SD_LIKE_CONFIG, name: 'AuraFlow', supportsBreak: false },
  'HiDream': { ...SD_LIKE_CONFIG, name: 'HiDream', supportsBreak: false },
  'Illustrious': { ...SD_LIKE_CONFIG, name: 'Illustrious', supportsBreak: false },
  'Kolors': { ...SD_LIKE_CONFIG, name: 'Kolors', supportsBreak: false },
  'Lumina': { ...SD_LIKE_CONFIG, name: 'Lumina', supportsBreak: false },
  'Mochi': { ...SD_LIKE_CONFIG, name: 'Mochi', supportsBreak: false },
  'MidJourney': {
    ...NATURAL_LANGUAGE_CONFIG,
    name: 'MidJourney',
    supportsBreak: false,
    paramStyle: 'double-dash',
    negativePromptStyle: 'param',
    promptPrefix: '/imagine prompt: ',
    tagSeparator: ', ',
  },
  'NoobAI': { ...SD_LIKE_CONFIG, name: 'NoobAI', supportsBreak: false },
  'PixArt A/E': { ...SD_LIKE_CONFIG, name: 'PixArt A/E', supportsBreak: false },

  // FIX: Added the required 'supportsBreak' property to the models below.
  'Imagen4': { ...NATURAL_LANGUAGE_CONFIG, name: 'Imagen4', supportsBreak: false },
  'Flux': { ...NATURAL_LANGUAGE_CONFIG, name: 'Flux', supportsBreak: false },
  'Nano Banana': { ...NATURAL_LANGUAGE_CONFIG, name: 'Nano Banana', supportsBreak: false },
  'OpenAI': { ...NATURAL_LANGUAGE_CONFIG, name: 'OpenAI', supportsBreak: false },
  'Qwen': { ...NATURAL_LANGUAGE_CONFIG, name: 'Qwen', supportsBreak: false },
  
  'Veo 3': { ...VIDEO_CONFIG, name: 'Veo 3', supportsBreak: false },
  'CogVideoX': { ...VIDEO_CONFIG, name: 'CogVideoX', supportsBreak: false },
  'Hunyuan Video': { ...VIDEO_CONFIG, name: 'Hunyuan Video', supportsBreak: false },
  'LTXV': { ...VIDEO_CONFIG, name: 'LTXV', supportsBreak: false },
  'SVD': { ...VIDEO_CONFIG, name: 'SVD', supportsBreak: false },
  'Wan Video': { ...VIDEO_CONFIG, name: 'Wan Video', supportsBreak: false },
};

export const MODEL_NAMES = Object.keys(MODELS).sort();

export const DEFAULT_QUALITY_TAGS = ['best quality', 'amazing quality', 'very aesthetic', 'absurdres'];