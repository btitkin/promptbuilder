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
  // Moved to tagged syntax per product unification
  'Nano Banana': { ...SD_LIKE_CONFIG, name: 'Nano Banana', supportsBreak: false },
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

// Style Presets Arrays
export const realisticStyles = [
  'Film Photography', 'Portrait Studio', 'Street Photography', 'Fashion Editorial', 
  'Documentary', 'Candid', 'Professional Headshot', 'Environmental Portrait',
  'Black and White', 'Color Grading', 'Natural Light', 'Studio Lighting',
  'Golden Hour', 'Blue Hour', 'High Key', 'Low Key', 'Dramatic Lighting',
  'Soft Focus', 'Sharp Focus', 'Bokeh', 'Depth of Field', 'Wide Angle',
  'Telephoto', 'Macro', 'Vintage', 'Modern', 'Minimalist', 'Cinematic',
  'Webcam', 'Spycam', 'CCTV', 'Smartphone', 'Polaroid', 'Analog', 'Editorial',
  'Realistic', 'Amateur', 'Retro'
];

export const animeStyles = [
  'Studio Ghibli', 'Naruto', 'Bleach', 'One Piece', 'Attack on Titan',
  'Demon Slayer', 'Your Name', 'Spirited Away', 'Princess Mononoke',
  'Akira', 'Ghost in the Shell', 'Cowboy Bebop', 'Evangelion',
  'Sailor Moon', 'Dragon Ball', 'Pokemon', 'JoJo\'s Bizarre Adventure',
  'Death Note', 'Fullmetal Alchemist', 'My Hero Academia', '90s VHS Anime',
  'Chibi', 'Ecchi Manga', 'Dark Fantasy Anime', 'Cyberpunk Edgerunners',
  'Cell Shading', 'Watercolor Anime', 'Sketch Style', 'Manga Panel'
];

export const artisticStyles = [
  'Oil Painting', 'Watercolor', 'Acrylic', 'Digital Art', 'Concept Art',
  'Illustration', 'Sketch', 'Charcoal Drawing', 'Pencil Drawing',
  'Ink Drawing', 'Pastel', 'Mixed Media', 'Abstract', 'Impressionist',
  'Expressionist', 'Surreal', 'Pop Art', 'Art Nouveau', 'Art Deco',
  'Renaissance', 'Baroque', 'Gothic', 'Minimalist Art', 'Contemporary',
  'Fantasy Art', 'Sci-Fi Art', 'Comic Book Style', 'Pin-up Art'
];

// Default negative prompt used when the user has not saved a custom value
export const DEFAULT_NEGATIVE_PROMPT =
  'low quality, worst quality, jpeg artifacts, noisy, blurry, ugly, disgusting, deformed, distorted, disfigured, bad anatomy, wrong anatomy, extra limb, missing limb, floating limbs, disconnected limbs, amputation, malformed hands, mutated hands, extra fingers, missing fingers, poorly drawn hands, poorly drawn face, mutated face, watermark, signature, username, artist name';
