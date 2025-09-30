


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

// Unified negative prompt type
export type NegativePrompt = string;

// Unified return type for prompt variations across services
export interface PromptVariationsResult {
  structuredPrompts: StructuredPrompt[];
  negativePrompt: NegativePrompt;
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
  isNsfwEnabled: boolean;
}

export type SceneType = 'solo' | 'couple' | 'threesome' | 'group';

export type Gender = 'any' | 'male' | 'female' | 'mixed' | 'couple' | 'futanari' | 'trans female' | 'trans male' | 'femboy' | 'nonbinary' | 'furry' | 'monster' | 'sci-fi';
export type AgeRange = 'any' | '18s' | '25s' | '30s' | '40s' | '50s' | '60s' | '70+';

export type FemaleBodyType = 'slim' | 'curvy' | 'athletic' | 'instagram model';
export type MaleBodyType = 'slim' | 'fat' | 'muscular' | 'big muscular';

export type Ethnicity = 'any' | 'caucasian' | 'european' | 'scandinavian' | 'slavic' | 'mediterranean' | 'asian' | 'japanese' | 'chinese' | 'korean' | 'indian' | 'african' | 'hispanic' | 'middle eastern' | 'native american';
export type HeightRange = 'any' | 'very short' | 'short' | 'average' | 'tall';

// Female specific
export type BreastSize = 'any' | 'flat' | 'small' | 'medium' | 'large' | 'huge' | 'gigantic';
export type HipsSize = 'any' | 'narrow' | 'average' | 'wide' | 'extra wide';
export type ButtSize = 'any' | 'flat' | 'small' | 'average' | 'large' | 'bubble';

// Male specific
export type PenisSize = 'any' | 'small' | 'average' | 'large' | 'huge' | 'horse-hung';
export type MuscleDefinition = 'any' | 'soft' | 'toned' | 'defined' | 'ripped' | 'bodybuilder';
export type FacialHair = 'any' | 'clean-shaven' | 'stubble' | 'goatee' | 'mustache' | 'full beard';

export type CharacterStyle = 'any' | 'goth' | 'cyberpunk' | 'military' | 'pin-up' | 'alt' | 'retro' | 'fairy' | 'battle angel' | 'nurse' | 'maid' | 'femme fatale' | 'sci-fi' | 'vampire' | 'demoness' | 'angel' | 'mermaid' | 'punk' | 'emo' | 'cottagecore' | 'glam' | 'harajuku' | 'warrior' | 'cheerleader' | 'spy' | 'doll' | 'sailor' | 'tomboy' | 'beach bunny' | 'noble' | 'geisha' | 'kunoichi' | 'mecha pilot' | 'samurai' | 'cowgirl' | 'pirate' | 'superheroine' | 'space traveler' | 'bunnygirl' | 'catgirl' | 'policewoman' | 'firefighter' | 'woods elf' | 'raver' | 'sporty' | 'popstar' | 'baroque' | 'priestess' | 'witch' | 'sorceress' | 'frost mage' | 'beastkin' | 'chic' | 'k-pop' | 'playboy model' | 'biker' | 'grunge' | 'steampunk' | 'tribal' | 'ancient goddess' | 'street fashion' | 'dancer' | 'vlogger' | 'supermodel' | 'streamer' | 'bodybuilder' | 'tattoo queen' | 'hacker' | 'alien' | 'zombie' | 'sports fan' | 'surfer' | 'yoga idol' | 'circus artist' | 'acrobat' | 'robot' | 'android' | 'ballet dancer' | 'mystic' | 'spiritualist' | 'businesswoman' | 'boss lady' | 'sugar mommy' | 'milf next door' | 'single mom' | 'divorcee' | 'uniform cosplay';

export type RoleplayType = 'none' | 'default' | 'dom/sub' | 'professor/student' | 'boss/employee' | 'friends' | 'childhood friends' | 'roommates' | 'neighbors' | 'bodyguard/client' | 'nurse/patient';

export interface CharacterSettingsState {
  sceneType: SceneType;
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
  characterStyle: CharacterStyle;
  roleplay: RoleplayType;
  overlays?: { furry: boolean; monster: boolean; sciFi: boolean };
}

export type RealisticStyle = 'film photography' | 'webcam' | 'spycam' | 'cctv' | 'smartphone' | 'polaroid' | 'analog' | 'editorial' | 'portrait studio' | 'street photography' | 'fashion editorial';
export type AnimeStyle = 'ghibli' | 'naruto' | 'bleach' | '90s vhs anime' | 'chibi' | 'ecchi manga' | 'dark fantasy anime' | 'dragon ball' | 'one piece' | 'neon genesis evangelion' | 'cyberpunk edgerunners' | 'demon slayer' | 'death note' | 'attack on titan' | 'pokémon';

export type StyleFilter = {
  main: 'realistic' | 'anime';
  sub: 'any' | 'film photography' | 'webcam' | 'spycam' | 'cctv' | 'smartphone' | 'polaroid' | 'analog' | 'editorial' | 'portrait studio' | 'street photography' | 'fashion editorial' | 'professional' | 'amateur' | 'flash';
};

export type ApiProvider = 'google_gemini' | 'openai' | 'claude' | 'deepseek' | 'groq' | 'together' | 'perplexity' | 'cohere' | 'custom_local' | 'qwen';

export interface CustomApiConfig {
  url: string;
  key: string;
  model: string;
}

export interface ApiConfigState {
  provider: ApiProvider;
  keys: {
    [key in ApiProvider]?: string;
  };
  customConfig?: CustomApiConfig;
}

export interface PromptSnippet {
  id: string;
  name: string;
  content: string;
  tags: string[];
  createdAt: string;
}

export interface AppSettings {
  version: number;
  userInput: string;
  selectedModel: string;
  styleFilter: StyleFilter;
  characterSettings: CharacterSettingsState;
  nsfwSettings: NsfwSettingsState;
  useBreak: boolean;
  advancedSettings: AdvancedSettingsState;
  numVariations: number;
  snippets: PromptSnippet[];
  selectedShotPresets: string[];
  selectedPosePresets: string[];
  selectedLocationPresets: string[];
  selectedClothingPresets: string[];
  selectedHairPresets: string[];
  selectedStylePresets: string[];
  selectedCharacterStylePresets: string[];
  selectedRoleplayPresets: string[];
  selectedPhysicalFeaturesPresets: string[];
  selectedFacialExpressionsPresets: string[];
  selectedEmotionalStatesPresets: string[];
  selectedNSFWExpressionsPresets: string[];
  selectedFantasyRacesPresets: string[];
  selectedCreaturesPresets: string[];
  selectedPropsPresets: string[];
}