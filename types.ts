
export interface ModelConfig {
  name: string;
  supportsBreak: boolean;
  syntaxStyle: 'tagged' | 'natural';
  
  /** 
   * How to format parameters like aspect ratio and seed.
   * - `double-dash`: --ar 1:1 --seed 123
   * - `natural-append`: Appends params as a phrase at the end.
   * - `ignore`: For models where these are API params, not part of the text prompt.
   */
  paramStyle: 'double-dash' | 'natural-append' | 'ignore';
  
  /** 
   * How to handle negative prompts.
   * - `param`: --no blurry, ugly
   * - `natural-append`: ..., avoiding blurry, ugly images
   * - `ignore`: Not part of the text prompt.
   */
  negativePromptStyle: 'param' | 'natural-append' | 'ignore';
  
  /** Where to put the default quality tags. */
  qualityTagsLocation: 'prepend' | 'append';
  
  /** The character(s) to join tags with. */
  tagSeparator: string;
  
  /** An optional string to add at the very beginning of the prompt. */
  promptPrefix?: string;
}


export interface StructuredPrompt {
  subject: string[];
  attributes: string[];
  clothing: string[];
  pose: string[];
  action: string[];
  location: string[];
  background: string[];
  style: string[];
}

export interface AdvancedSettingsState {
  negativePrompt: string;
  aspectRatio: string;
  additionalParams: string;
  seed: string;
}

export type NsfwMode = 'off' | 'nsfw' | 'hardcore';

export interface NsfwSettingsState {
  mode: NsfwMode;
  nsfwLevel: number;
  hardcoreLevel: number;
  enhancePerson: boolean;
  enhancePose: boolean;
  enhanceLocation: boolean;
  aiImagination: boolean;
}

export type RealisticStyle = 'professional' | 'amateur' | 'flash';
export type AnimeStyle = 'ghibli' | 'naruto' | 'bleach';

export type StyleFilter = {
  main: 'realistic' | 'anime';
  sub: RealisticStyle | AnimeStyle;
};

export type ApiProvider = 'google_gemini' | 'openai' | 'claude' | 'deepseek' | 'groq' | 'together' | 'perplexity' | 'cohere';

export interface ApiConfigState {
  provider: ApiProvider;
  keys: {
    [key in ApiProvider]?: string;
  };
}