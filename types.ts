

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

export type Gender = 'any' | 'male' | 'female' | 'mixed';
export type AgeRange = 'any' | '18s' | '25s' | '30s' | '40s' | '50s' | '60s' | '70+';

export type FemaleBodyType = 'slim' | 'curvy' | 'athletic' | 'instagram model';
export type MaleBodyType = 'slim' | 'fat' | 'muscular' | 'big muscular';

export type Ethnicity = 'any' | 'caucasian' | 'european' | 'scandinavian' | 'slavic' | 'mediterranean' | 'asian' | 'japanese' | 'chinese' | 'korean' | 'indian' | 'african' | 'hispanic' | 'middle eastern' | 'native american';
export type HeightRange = 'any' | 'very short (<150cm)' | 'short (150-165cm)' | 'average (165-180cm)' | 'tall (>180cm)';

// Female specific
export type BreastSize = 'any' | 'flat' | 'small' | 'medium' | 'large' | 'huge' | 'gigantic';
export type HipsSize = 'any' | 'narrow' | 'average' | 'wide' | 'extra wide';
export type ButtSize = 'any' | 'flat' | 'small' | 'average' | 'large' | 'bubble';

// Male specific
export type PenisSize = 'any' | 'small' | 'average' | 'large' | 'huge' | 'horse-hung';
export type MuscleDefinition = 'any' | 'soft' | 'toned' | 'defined' | 'ripped' | 'bodybuilder';
export type FacialHair = 'any' | 'clean-shaven' | 'stubble' | 'goatee' | 'mustache' | 'full beard';


export interface CharacterSettingsState {
  gender: Gender;
  age: AgeRange;
  bodyType: 'any' | FemaleBodyType | MaleBodyType;
  ethnicity: Ethnicity;
  height: HeightRange;
  breastSize: BreastSize;
  hipsSize: HipsSize;
  buttSize: ButtSize;
  penisSize: PenisSize;
  muscleDefinition: MuscleDefinition;
  facialHair: FacialHair;
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

export interface PromptSnippet {
  id: string;
  name: string;
  content: string;
}