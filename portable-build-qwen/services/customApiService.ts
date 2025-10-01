import type {
  NsfwSettingsState,
  StyleFilter,
  StructuredPrompt,
  CharacterSettingsState,
  CustomApiConfig,
  PromptVariationsResult,
  Gender,
  FemaleBodyType,
  MaleBodyType,
  HeightRange,
  AgeRange,
  BreastSize,
  HipsSize,
  ButtSize,
  PenisSize,
  MuscleDefinition,
  FacialHair,
  AdvancedSettingsState
} from '../types';
import { invokeLLM, isElectronAvailable } from './electronService';
import { cleanLLMText, normalizeNarrative as normalizeNarrativeCentral, normalizeToTagsLine as normalizeToTagsLineCentral } from './sanitizer';
import { MODELS } from '../constants';

// Optional generation options for local/external calls
type GenOptions = {
  temperature?: number;
  top_p?: number;
  maxTokens?: number;
  stop?: string[];
  // If true, bypass Electron local LLM even when available and use external HTTP API instead
  forceExternal?: boolean;
  // Optional timeout in milliseconds for the whole generation call
  timeoutMs?: number;
};

const STOP_SEQS = ['<<EOD>>'];
const SENTINEL = '<<EOD>>';

// Bezpieczne ograniczenia długości wejścia do LLM
const MAX_USER_INPUT_CHARS = 800; // chroni przed błędem: zbyt długi prompt/system
const truncateMiddle = (s: string, maxLen: number) => {
  if (!s) return '';
  if (s.length <= maxLen) return s;
  const keep = Math.floor(maxLen / 2) - 3;
  return s.slice(0, keep) + '...' + s.slice(-keep);
};

// TheBloke (WizardLM) chat template helper: "USER: {prompt} ASSISTANT:"
const buildTheBlokePrompt = (systemText: string | undefined, userText: string): string => {
  // Zero preamble. Tylko czysty dialog Vicuna - bez "asystenckiego" preamble
  const pre = (systemText && systemText.trim().length > 0) ? `${systemText.trim()}\n\n` : '';
  return `${pre}USER: ${userText}\nASSISTANT: `;
};

// Helper function to clean LLM output (bezpieczne regexy — bez wrażliwych sekwencji typu ```math w stringach)
export const cleanTextResponse = (text: string): string => {
  return cleanLLMText(text ?? '');
};

export function normalizeNarrative(text: string): string {
  return normalizeNarrativeCentral(text ?? '');
}

// Convert any noisy/multiline output into a single, comma-separated tag line suitable for the UI
const normalizeToTagsLine = (text: string, maxTags: number = 45): string => {
  return normalizeToTagsLineCentral(text ?? '', maxTags);
};

// Helurystyka wykrywania śmieciowych odpowiedzi od modelu (gwiazdki, same znaki specjalne, bardzo krótkie itp.)
export const isJunkOutput = (s: string): boolean => {
  if (!s) return true;
  const text = s.trim();
  if (!text) return true;
  // Same znaki specjalne/punktacja
  if (/^[\s*._\-\/\\|]+$/.test(text)) return true;
  // Długie powtórzenia tego samego znaku (np. *******)
  if (/(.)\1{9,}/.test(text)) return true;
  // Za mało znaków alfanumerycznych w stosunku do długości
  const alphaNum = (text.match(/[A-Za-z\u00C0-\u017F0-9]/g) || []).length;
  if (alphaNum / text.length < 0.3) return true;
  // Bardzo krótkie treści po usunięciu spacji
  if (text.replace(/\s+/g, '').length < 20) return true;
  return false;
};
const extractJson = (text: string): any | null => {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.warn('Could not parse extracted JSON:', e);
      return null;
    }
  }
  return null;
};

// Simple promise timeout wrapper
const withTimeout = async <T>(p: Promise<T>, ms: number, label: string): Promise<T> => {
  let timer: any;
  try {
    return await Promise.race<T>([
      p,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms} ms`)), ms);
      })
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
};

const makeApiCall = async (
  config: CustomApiConfig,
  messages: any[],
  opts?: GenOptions
): Promise<string> => {
  // Always use local LLM when available (Electron environment)
  const electronAvailable = isElectronAvailable() && !opts?.forceExternal;
  
  const temperature = opts?.temperature ?? 0.6;
  const top_p = opts?.top_p ?? 0.9;
  const maxTokens = opts?.maxTokens ?? 512;
  const stop = opts?.stop ?? STOP_SEQS;
  const timeoutMs = opts?.timeoutMs ?? (config as any)?.timeoutMs ?? 20000;

  if (electronAvailable) {
    const systemMessage = messages.find(m => m.role === 'system');
    const userMessage = messages.find(m => m.role === 'user');
    
    if (systemMessage && userMessage) {
      // obetnij za długie user content preemptively
      const safeUser = truncateMiddle(cleanTextResponse(userMessage.content ?? ''), MAX_USER_INPUT_CHARS);
      const prompt = buildTheBlokePrompt(
        (systemMessage.content ?? '').toString().trim(),
        safeUser
      );
      try {
        const localResponse = await withTimeout(
          invokeLLM('chatCompletion', {
            prompt,
            temperature,
            top_p,
            maxTokens,
            stop
          }),
          timeoutMs,
          'Local LLM chatCompletion'
        );
        return localResponse || '';
      } catch (e) {
        console.warn('Local LLM chatCompletion failed, will try external API:', e);
        // fall through to external API below
      }
    }
  }

  // Fallback to external HTTP API if not in Electron or local call failed/disabled
  // Normalize base URL: handle common mistakes like using 'local' or missing protocol
  let base = (config.url ?? '').trim();
  if (!base || base === 'local' || base === '/local') {
    base = 'http://localhost:11434';
  } else if (!/^https?:\/\//i.test(base)) {
    // If user typed e.g. 'localhost:11434' or '/localhost:11434'
    base = `http://${base.replace(/^\//, '')}`;
  }
  base = base.replace(/\/$/, '');
  const url = `${base}/v1/chat/completions`;
  const body = {
    model: config.model || 'Qwen2.5-7B-Instruct-Q4_K_M',
    messages,
    temperature,
    top_p,
    max_tokens: maxTokens,
    stop
  } as any;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.key ? { Authorization: `Bearer ${config.key}` } : {})
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });
  
    if (!res.ok) {
      const errTxt = await res.text();
      throw new Error(`Custom API request failed: ${res.status} ${res.statusText} - ${errTxt}`);
    }
  
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content ?? '';
    return content;
  } catch (e: any) {
    if (e?.name === 'AbortError') {
      throw new Error(`Custom API request timed out after ${timeoutMs} ms`);
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
};

export const generatePromptVariations = async (
  config: CustomApiConfig,
  userInput: string,
  numVariations: number,
  nsfwSettings: NsfwSettingsState,
  styleFilter: StyleFilter,
  selectedModel: string,
  characterSettings: CharacterSettingsState
): Promise<PromptVariationsResult> => {
  // Empty system prompt to avoid assistant-style responses
  const systemPrompt = ``;
  
  const safeUser = truncateMiddle(cleanTextResponse(userInput), MAX_USER_INPUT_CHARS);
  
  let rules = `You are an expert prompt engineer for text-to-image models.

Output format rules (STRICT):
- Output ONLY valid JSON. No markdown, no code fences, no extra text.
- JSON schema EXACTLY:
{
  "structuredPrompts": [
    {
      "subject": string[],
      "attributes": string[],
      "clothing": string[],
      "pose": string[],
      "action": string[],
      "location": string[],
      "background": string[],
      "style": string[]
    }
  ],
  "negativePrompt": string
}
- Return exactly ${numVariations} items in "structuredPrompts".
- Use concise, lower-case english tags (max 8 items per array).
- If a field doesn’t apply, return an empty array [].
- Do NOT include labels like 'Prompt:', 'Negative Prompt:', or any dialogue roles.`;

  // Add character constraints
  switch (characterSettings.gender) {
    case 'male':
      rules += `\n- Gender Constraint: all individuals MUST be male.`;
      break;
    case 'female':
      rules += `\n- Gender Constraint: all individuals MUST be female.`;
      break;
    case 'futanari':
      rules += `\n- Gender Constraint: all individuals MUST be futanari (female with male genitalia).`;
      break;
    case 'mixed':
      rules += `\n- Gender Constraint: include both male and female subjects.`;
      break;
  }
  
  if (characterSettings.age !== 'any') {
    rules += `\n- Age Constraint: the subject's age MUST be in the '${characterSettings.age}' range.`;
  }
  
  if (characterSettings.ethnicity && characterSettings.ethnicity !== 'any') {
    rules += `\n- Ethnicity Constraint: prioritize '${characterSettings.ethnicity}'.`;
  }

  if (characterSettings.bodyType && characterSettings.bodyType !== 'any') {
    rules += `\n- Body Type Constraint: emphasize a '${characterSettings.bodyType}' build.`;
  }

  // Overlays (modify appearance without changing core gender)
  if (characterSettings.overlays?.furry) {
    rules += `\n- Overlay: include subtle anthropomorphic animal traits (ears, tail) while keeping human anatomy.`;
  }
  if (characterSettings.overlays?.monster) {
    rules += `\n- Overlay: include demonic/monster features (e.g., horns, fangs) while maintaining human physique.`;
  }
  if (characterSettings.overlays?.sciFi) {
    rules += `\n- Overlay: include futuristic sci‑fi elements (technology, cybernetic augmentations, neon lighting).`;
  }
  
  // Replace explicit style naming with an implicit guideline (no style tags in output)
  rules += `\n- Style Guideline: evoke the '${styleFilter.main}'${styleFilter.sub !== 'any' ? `/${styleFilter.sub}` : ''} aesthetic implicitly through vocabulary, lighting, composition, and mood — do not name style tags or genres.`;
  
  // SFW/NSFW/Hardcore policy (unified with Gemini)
  switch (nsfwSettings.mode) {
    case 'off':
      rules += `\n- Content rule: MUST be SFW.`;
      break;
    case 'nsfw':
      rules += `\n- Content rule: sensual undertones allowed, around ${nsfwSettings.nsfwLevel}/10; avoid explicit mechanics or unsafe content.`;
      break;
    case 'hardcore':
      rules += `\n- Content rule: can be explicit around ${nsfwSettings.hardcoreLevel}/10 but never illegal or unsafe.`;
      break;
  }
  
  const userContent = `${rules}\n\nGenerate ${numVariations} variations for: ${safeUser}\n\nReturn ONLY the JSON object.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent }
  ];

  try {
    const response = await makeApiCall(config, messages, {
      temperature: 0.9, // allow creativity while staying coherent
      top_p: 0.95,
      maxTokens: 280,
      stop: STOP_SEQS,
      forceExternal: false
    });
    
    let cleanedResponse = cleanTextResponse(response);
    // Guard against junk outputs (e.g., rows of dots/asterisks) before JSON parsing
    if (isJunkOutput(cleanedResponse)) {
      cleanedResponse = cleanTextResponse(safeUser);
    }
    
    // Try to parse as JSON first
    try {
      const parsed = extractJson(cleanedResponse) || JSON.parse(
        cleanedResponse.replace(/,\s*(\}|\])/g, '$1')
      );
      if (!parsed.structuredPrompts && !parsed.prompts) {
        throw new Error('Invalid JSON structure');
      }
      return {
        structuredPrompts: parsed.structuredPrompts || parsed.prompts || [],
        negativePrompt: parsed.negativePrompt || 'ugly, blurry, worst quality, bad anatomy'
      };
    } catch (jsonError) {
      // Fallback: Create structured prompt from detailed description
      // Extract key elements from the detailed description for better prompt generation
      const extractElementsFromDescription = (description: string): StructuredPrompt => {
        const prompt: StructuredPrompt = {
          subject: [],
          attributes: [],
          clothing: [],
          pose: [],
          action: [],
          location: [],
          background: [],
          style: []
        };
        
        const descLower = description.toLowerCase();
        
        // Intelligent subject extraction - find the main subject from the description
        const subjectPatterns = [
          /(young woman|woman|female|lady|girl)/,
          /(man|male|gentleman|boy)/,
          /(person|individual|figure|human)/
        ];
        
        for (const pattern of subjectPatterns) {
          const match = descLower.match(pattern);
          if (match && match[1]) {
            prompt.subject.push(match[1]);
            break; // Take only the first main subject
          }
        }
        
        // If no subject found, use context to determine subject
        if (prompt.subject.length === 0) {
          // Look for contextual clues about the subject
          if (descLower.includes('her ') || descLower.includes('she ') || descLower.includes('woman') || descLower.includes('female')) {
            prompt.subject.push('woman');
          } else if (descLower.includes('his ') || descLower.includes('he ') || descLower.includes('man') || descLower.includes('male')) {
            prompt.subject.push('man');
          } else {
            prompt.subject.push('person'); // Default fallback
          }
        }
        
        // Enhanced attribute extraction with better context awareness
        if (descLower.includes('young')) prompt.attributes.push('youthful', 'young appearance');
        if (descLower.includes('dark hair') || descLower.includes('dark-haired')) prompt.attributes.push('dark hair', 'brunette');
        if (descLower.includes('soft') || descLower.includes('gentle') || descLower.includes('subtle')) 
          prompt.attributes.push('soft lighting', 'gentle atmosphere', 'subtle tones');
        if (descLower.includes('overcast') || descLower.includes('diffused') || descLower.includes('muted')) 
          prompt.attributes.push('overcast light', 'diffused lighting', 'muted tones');
        if (descLower.includes('contemplative') || descLower.includes('peaceful') || descLower.includes('quiet')) 
          prompt.attributes.push('contemplative mood', 'peaceful atmosphere', 'quiet moment');
        if (descLower.includes('relaxed') || descLower.includes('comfortable') || descLower.includes('casual')) 
          prompt.attributes.push('relaxed pose', 'comfortable stance', 'casual attitude');
        if (descLower.includes('natural') || descLower.includes('realistic') || descLower.includes('authentic')) 
          prompt.attributes.push('natural look', 'realistic appearance', 'authentic moment');
        
        // Extract specific objects and details
        if (descLower.includes('terracotta pot') || descLower.includes('clay pot')) 
          prompt.attributes.push('terracotta pot', 'clay pottery', 'plant pot');
        if (descLower.includes('texture') || descLower.includes('textured')) 
          prompt.attributes.push('textured surface', 'detailed texture');
        if (descLower.includes('wood') || descLower.includes('wooden')) 
          prompt.background.push('wood floor', 'wooden floorboards', 'natural wood');
        if (descLower.includes('grain') || descLower.includes('grained')) 
          prompt.attributes.push('wood grain', 'natural grain pattern');
        
        // Enhanced location/background extraction
        if (descLower.includes('window') || descLower.includes('large window')) {
          prompt.location.push('near window', 'window view');
          prompt.background.push('window light', 'natural illumination', 'daylight');
        }
        if (descLower.includes('room') || descLower.includes('interior') || descLower.includes('inside')) 
          prompt.location.push('interior', 'indoors', 'room setting');
        if (descLower.includes('light') || descLower.includes('lighting') || descLower.includes('illumination')) 
          prompt.attributes.push('natural lighting', 'soft illumination', 'light play');
        if (descLower.includes('shadow') || descLower.includes('shadows')) 
          prompt.attributes.push('soft shadows', 'light and shadow', 'shadow play');
        
        // Enhanced pose/action extraction
        if (descLower.includes('standing') || descLower.includes('stands')) 
          prompt.pose.push('standing', 'upright pose', 'standing position');
        if (descLower.includes('turned') || descLower.includes('turning') || descLower.includes('facing away')) 
          prompt.pose.push('turned away', 'profile view', 'side angle');
        if (descLower.includes('holding') || descLower.includes('carrying')) 
          prompt.action.push('holding object', 'carrying item', 'interacting with object');
        if (descLower.includes('observing') || descLower.includes('looking') || descLower.includes('gazing')) 
          prompt.action.push('observing', 'looking away', 'gazing into distance');
        if (descLower.includes('contemplative') || descLower.includes('thoughtful')) 
          prompt.attributes.push('contemplative expression', 'thoughtful mood');
        
        // Extract specific clothing details with exact matches
        if (descLower.includes('charcoal-grey t-shirt') || descLower.includes('charcoal grey t-shirt') || descLower.includes('grey t-shirt')) 
          prompt.clothing.push('charcoal grey t-shirt', 'grey cotton shirt', 'casual t-shirt');
        if (descLower.includes('dark indigo jeans') || descLower.includes('indigo jeans') || descLower.includes('blue jeans')) 
          prompt.clothing.push('dark indigo jeans', 'blue denim jeans', 'casual jeans');
        if (descLower.includes('simple') || descLower.includes('plain')) 
          prompt.attributes.push('simple clothing', 'plain attire', 'minimalist style');
        if (descLower.includes('casual') || descLower.includes('everyday')) 
          prompt.attributes.push('casual wear', 'everyday clothing', 'relaxed attire');
        
        // Extract hair details
        if (descLower.includes('dark hair') || descLower.includes('brunette')) 
          prompt.attributes.push('dark hair', 'brunette hair', 'brown hair');
        if (descLower.includes('falling softly') || descLower.includes('soft hair')) 
          prompt.attributes.push('soft hair', 'flowing hair', 'natural hair');
        
        // Remove duplicates and ensure meaningful content
        prompt.subject = [...new Set(prompt.subject.filter(s => s && s.trim()))];
        prompt.attributes = [...new Set(prompt.attributes.filter(a => a && a.trim()))];
        prompt.location = [...new Set(prompt.location.filter(l => l && l.trim()))];
        prompt.background = [...new Set(prompt.background.filter(b => b && b.trim()))];
        prompt.pose = [...new Set(prompt.pose.filter(p => p && p.trim()))];
        prompt.action = [...new Set(prompt.action.filter(a => a && a.trim()))];
        prompt.clothing = [...new Set(prompt.clothing.filter(c => c && c.trim()))];
        
        return prompt;
      };
      
      const detailedPrompt = extractElementsFromDescription(safeUser);
      
      // For single variation, return one detailed prompt
      if (numVariations === 1) {
        return {
          structuredPrompts: [detailedPrompt],
          negativePrompt: 'ugly, blurry, worst quality, deformed, mutated, extra limbs, bad anatomy, disfigured'
        };
      }
      
      // For multiple variations, create slight variations
      const variations: StructuredPrompt[] = [];
      for (let i = 0; i < numVariations; i++) {
        const variation: StructuredPrompt = JSON.parse(JSON.stringify(detailedPrompt));
        
        // Add variation-specific enhancements only if we have multiple variations
        if (numVariations > 1) {
          if (i === 1) {
            variation.attributes.push('artistic', 'creative composition', 'vibrant colors');
          } else if (i === 2) {
            variation.attributes.push('professional photography', 'polished', 'cinematic lighting');
          } else if (i >= 3) {
            variation.attributes.push('unique perspective', 'expressive', 'dynamic angle');
          }
        }
        
        variations.push(variation);
      }
      
      return {
        structuredPrompts: variations,
        negativePrompt: 'ugly, blurry, worst quality, deformed, mutated, extra limbs, bad anatomy, disfigured'
      };
    }
  } catch (error) {
    console.error('Local LLM error:', error);
    throw new Error('Failed to generate prompt variations with local LLM');
  }
};

export const enhanceDescription = async (
  config: CustomApiConfig,
  userInput: string,
  nsfwSettings: NsfwSettingsState,
  styleFilter: StyleFilter,
  characterSettings: CharacterSettingsState
): Promise<string> => {
  // Enhance should enrich the existing short description into a vivid paragraph (no tags)
  const systemPrompt = 'You are an expert Creative Writing Editor. Your job is to take a basic scene description and enrich it with vivid detail and narrative depth.';

  const focusParts: string[] = [];
  if (nsfwSettings.enhancePerson) focusParts.push('the person/subject');
  if (nsfwSettings.enhancePose) focusParts.push('pose and action');
  if (nsfwSettings.enhanceLocation) focusParts.push('location/background and atmosphere');
  const focusLine = focusParts.length > 0 ? `Focus on ${focusParts.join(', ')}.` : '';

  const genderRule =
    characterSettings.gender === 'male' ? 'All depicted individuals MUST be male.' :
    characterSettings.gender === 'female' ? 'All depicted individuals MUST be female.' :
    characterSettings.gender === 'futanari' ? 'All depicted individuals MUST be futanari (female with male genitalia).' :
    characterSettings.gender === 'mixed' ? 'Include both male and female individuals.' : '';

  // SFW/NSFW/Hardcore policy (unified with Gemini)
  let contentPolicy: string;
  switch (nsfwSettings.mode) {
    case 'off':
      contentPolicy = 'Content rule: MUST be SFW. Absolutely no nudity, sexual content, erotic or suggestive language, or fetishized descriptions.';
      break;
    case 'nsfw':
      contentPolicy = `Content rule: sensual undertones allowed, around ${nsfwSettings.nsfwLevel}/10; avoid explicit mechanics or unsafe content.`;
      break;
    case 'hardcore':
      contentPolicy = `Content rule: can be explicit around ${nsfwSettings.hardcoreLevel}/10 but never illegal or unsafe.`;
      break;
    default:
      contentPolicy = 'Content rule: MUST be SFW.';
  }

  const constraints: string[] = [];
  if (characterSettings.age !== 'any') constraints.push(`main subject age in '${characterSettings.age}'`);
  if (characterSettings.ethnicity !== 'any') constraints.push(`ethnicity ${characterSettings.ethnicity}`);
  if (characterSettings.bodyType !== 'any') constraints.push(`body type ${characterSettings.bodyType}`);
  if (characterSettings.gender === 'female') {
    if (characterSettings.breastSize !== 'any') constraints.push(`breast size ${characterSettings.breastSize}`);
    if (characterSettings.hipsSize !== 'any') constraints.push(`hips size ${characterSettings.hipsSize}`);
    if (characterSettings.buttSize !== 'any') constraints.push(`butt size ${characterSettings.buttSize}`);
  }
  if (characterSettings.gender === 'futanari') {
    if (characterSettings.breastSize !== 'any') constraints.push(`breast size ${characterSettings.breastSize}`);
    if (characterSettings.hipsSize !== 'any') constraints.push(`hips size ${characterSettings.hipsSize}`);
    if (characterSettings.buttSize !== 'any') constraints.push(`butt size ${characterSettings.buttSize}`);
    if (characterSettings.penisSize !== 'any' && (nsfwSettings.mode === 'nsfw' || nsfwSettings.mode === 'hardcore')) constraints.push(`penis size ${characterSettings.penisSize}`);
  }
  if (characterSettings.gender === 'male') {
    if (characterSettings.muscleDefinition !== 'any') constraints.push(`musculature ${characterSettings.muscleDefinition}`);
    if (characterSettings.facialHair !== 'any') constraints.push(`facial hair ${characterSettings.facialHair}`);
    if (characterSettings.penisSize !== 'any' && (nsfwSettings.mode === 'nsfw' || nsfwSettings.mode === 'hardcore')) constraints.push(`penis size ${characterSettings.penisSize}`);
  }



  const creativeScopeRule = 'Creative scope: You MAY introduce tasteful imaginative elements (fantasy/sci-fi/surreal) and unexpected but coherent details, when they enrich the scene.';
  const styleRule = `Keep an overall '${styleFilter.main}' style${styleFilter.sub !== 'any' ? ` with '${styleFilter.sub}' accents` : ''}.`;

  const safeUser = truncateMiddle(cleanTextResponse(userInput), MAX_USER_INPUT_CHARS);

  const userContent = [
    'Your task is to generate a random yet logical character-focused scene. To do this, you will mentally select options from the categories listed below and then weave them into a compelling, descriptive paragraph.',
    '',
    'Follow this creation process:',
    '1. Establish a Character: Randomly choose a foundation from categories like Fantasy Races, Roleplay Presets, or Character Style Presets.',
    '2. Define their Look: Select fitting options from Clothing Presets, Hair Presets, and Physical Features.',
    '3. Set the Scene: Place them in a location using Location Presets and set the mood with Time of Day and Atmospheric options.',
    '4. Give them Life: Describe their posture using Pose Presets and their current state with Facial Expressions and Emotional States.',
    '5. Add Details: Include relevant Props or Special Effects that complete the scene.',
    '',
    'Application constraints that MUST be respected:',
    styleRule,
    genderRule,
    constraints.length ? `Constraints to respect: ${constraints.join(', ')}.` : '',
    creativeScopeRule,
    '',
    'Now, execute this process and generate a new, random scene description.',
    'Constraint: The focus must be on a character, not a generic landscape or creature. The final output must be ONLY the descriptive paragraph, with no extra text or explanations.',
    `End your response with ${SENTINEL} and write nothing after it.`
  ].filter(Boolean).join('\n');

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent }
  ];

  try {
    const response = await makeApiCall(config, messages, {
      temperature: 0.9, // allow creativity while staying coherent
      top_p: 0.95,
      maxTokens: 280,
      stop: STOP_SEQS,
      forceExternal: false
    });

    let cleaned = response.replace(new RegExp(`${SENTINEL}\\s*$`, 'i'), '').trim();
    cleaned = normalizeNarrative(cleaned);

    if (cleaned && cleaned.length > 5 && !isJunkOutput(cleaned)) {
      return cleaned;
    }

    // Fallback: brief neutral narrative if output is unusable
    return 'A thoughtfully composed scene unfolds with a vivid sense of place and atmosphere, inviting the viewer to imagine the story behind it.';
  } catch (error) {
    console.error('Local LLM error:', error);
    return 'A thoughtfully composed scene unfolds with a vivid sense of place and atmosphere, inviting the viewer to imagine the story behind it.';
  }
};

export const generateRandomDescription = async (
  config: CustomApiConfig,
  nsfwSettings: NsfwSettingsState,
  styleFilter: StyleFilter,
  characterSettings: CharacterSettingsState,
  selectedPresets: string[]
): Promise<string> => {
  const systemInstruction = [
    'You are an observer writing a factual, objective report. Your task is to describe a person and their surroundings using ONLY direct, neutral, and descriptive language. You avoid ALL subjective, emotional, or poetic words. You state facts only. You write in full sentences to form a single paragraph.'
  ].join('\n');

  // Helper: filter defaults like Any/Average/None/Unknown
  const isDefault = (v?: string | null) => {
    if (!v) return true;
    const s = String(v).trim().toLowerCase();
    return s === '' || s === 'any' || s === 'average' || s === 'none' || s === 'unknown';
  };
  const nsfwOn = nsfwSettings.mode !== 'off';

  const fixedConstraintsLines: string[] = [];
  if (!isDefault(characterSettings.gender)) {
    const g = characterSettings.gender;
    const genderLabel = g === 'male' ? 'Male' : g === 'female' ? 'Female' : g === 'futanari' ? 'Futanari' : g === 'mixed' ? 'Mixed' : String(g);
    fixedConstraintsLines.push(`Gender: ${genderLabel}`);
  }
  if (!isDefault(characterSettings.age)) {
    fixedConstraintsLines.push(`Age: ${toAgePhrase(characterSettings.age as AgeRange)}`);
  }
  // Additional fixed constraints from UI
  if (!isDefault(characterSettings.height)) {
    fixedConstraintsLines.push(`Height: ${toHeightPhrase(characterSettings.height as HeightRange)}`);
  }
  if (!isDefault(characterSettings.bodyType)) {
    fixedConstraintsLines.push(`Body Type: ${toBodyTypePhrase(characterSettings.gender as Gender, characterSettings.bodyType)}`);
  }
  if (!isDefault(characterSettings.ethnicity)) {
    fixedConstraintsLines.push(`Ethnicity: ${characterSettings.ethnicity}`);
  }
  // Include hair color derived from selected presets if present
  if (selectedPresets && selectedPresets.length) {
    const HAIR_COLOR_PRESETS = new Set<string>([
      'blonde hair', 'brown hair', 'black hair', 'red hair', 'auburn hair',
      'silver hair', 'white hair', 'pink hair', 'blue hair', 'purple hair',
      'green hair', 'rainbow hair', 'multicolored hair', 'ombre hair', 'balayage hair',
      'highlights', 'lowlights', 'platinum blonde', 'strawberry blonde', 'ash blonde',
      'jet black', 'crimson red', 'burgundy', 'neon pink', 'pastel blue',
      'emerald green', 'iridescent hair', 'fire hair', 'ice hair', 'galaxy hair',
      'two-tone hair', 'split hair color'
    ]);
    const toTitleCase = (s: string): string => s.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1));
    const hairColorDerived = (() => {
      for (const p of selectedPresets) {
        const key = String(p).trim().toLowerCase();
        if (HAIR_COLOR_PRESETS.has(key)) return toTitleCase(key);
      }
      return null;
    })();
    if (hairColorDerived) {
      fixedConstraintsLines.push(`Hair Color: ${hairColorDerived}`);
    }
  }
  // Sexual attributes included only when NSFW mode is on
  if (nsfwOn && !isDefault(characterSettings.breastSize)) {
    fixedConstraintsLines.push(`Breast Size: ${toBreastPhrase(characterSettings.breastSize as BreastSize)}`);
  }
  if (!isDefault(characterSettings.hipsSize)) {
    fixedConstraintsLines.push(`Hips Size: ${toHipsPhrase(characterSettings.hipsSize as HipsSize)}`);
  }
  if (!isDefault(characterSettings.buttSize)) {
    fixedConstraintsLines.push(`Butt Size: ${toButtPhrase(characterSettings.buttSize as ButtSize)}`);
  }
  if (nsfwOn && !isDefault(characterSettings.penisSize)) {
    fixedConstraintsLines.push(`Penis Size: ${toPenisPhrase(characterSettings.penisSize as PenisSize)}`);
  }
  if (!isDefault(characterSettings.muscleDefinition)) {
    fixedConstraintsLines.push(`Muscle Definition: ${toMusclePhrase(characterSettings.muscleDefinition as MuscleDefinition)}`);
  }
  if (!isDefault(characterSettings.facialHair)) {
    fixedConstraintsLines.push(`Facial Hair: ${toFacialHairPhrase(characterSettings.facialHair as FacialHair)}`);
  }
  if (!isDefault(characterSettings.characterStyle)) {
    fixedConstraintsLines.push(`Character Style: ${characterSettings.characterStyle}`);
  }
  if (!isDefault(characterSettings.roleplay)) {
    fixedConstraintsLines.push(`Roleplay: ${characterSettings.roleplay}`);
  }
  if (characterSettings.overlays) {
    const overlayFlags: string[] = [];
    if (characterSettings.overlays.furry) overlayFlags.push('Furry');
    if (characterSettings.overlays.monster) overlayFlags.push('Monster');
    if (characterSettings.overlays.sciFi) overlayFlags.push('SciFi');
    if (overlayFlags.length) {
      fixedConstraintsLines.push(`Overlays: ${overlayFlags.join(', ')}`);
    }
  }
  if (!isDefault(styleFilter?.main)) {
    const styleParts = [`Main: ${styleFilter.main}`];
    if (!isDefault(styleFilter.sub)) styleParts.push(`Sub: ${styleFilter.sub}`);
    fixedConstraintsLines.push(`Style Filter: ${styleParts.join(', ')}`);
  }
  const nsfwAllowed = nsfwSettings.mode === 'off' ? 'Not allowed' : 'Allowed';
  fixedConstraintsLines.push(`NSFW: ${nsfwAllowed}`);

  const fixedConstraintsBlock = [
    '<fixed_constraints>',
    ...fixedConstraintsLines,
    '</fixed_constraints>'
  ].join('\n');

  console.log('[customApiService.generateRandomDescription] fixedConstraintsLines=', fixedConstraintsLines);
  console.log('[customApiService.generateRandomDescription] fixedConstraintsBlock=\n' + fixedConstraintsBlock);
  console.log('[customApiService.generateRandomDescription] nsfwSettings.mode=', nsfwSettings.mode, 'nsfwLevel=', nsfwSettings.nsfwLevel, 'hardcoreLevel=', nsfwSettings.hardcoreLevel, 'selectedPresets=', selectedPresets);

  const userContent = [
    'You will generate a factual description of a character based on a set of fixed rules and randomized details.',
    '',
    "FIXED CONSTRAINTS: These are the character's non-negotiable attributes. You MUST use them exactly as provided. Use only qualitative descriptors. DO NOT include numeric measurements.",
    fixedConstraintsBlock,
    selectedPresets && selectedPresets.length ? `You MUST incorporate ALL of these presets/themes: ${selectedPresets.join(', ')}.` : '',
    '',
    'DICTION AND TONE RULES:',
    'Objective Language Only: You are FORBIDDEN from using subjective or emotional adjectives. Do not use words like: beautiful, captivating, graceful, serene, enchanting, elegant, mysterious, alluring, dreamy, magical, stunning, breathtaking.',
    'No Names or Personas: DO NOT invent a name for the character (e.g., Sarah, Lila). DO NOT assign a role or archetype (e.g., princess, muse).',
    'No Numerical Body Measurements: You are strictly FORBIDDEN from using any numeric measurements (e.g., height in cm/ft, weight in kg/lbs, bust/waist/hip sizes, cup sizes). Use only qualitative descriptions.',
    '',
    'Now, generate a character description in English following all these rules.'
  ].filter(Boolean).join('\n');

  // Build standard chat messages for local/external LLM
  const messages = [
    { role: 'system', content: systemInstruction },
    { role: 'user', content: userContent }
  ];

  try {
    const response = await makeApiCall(config, messages, {
      temperature: 0.7,
      top_p: 0.9,
      maxTokens: 360,
      stop: STOP_SEQS
    });

    const text = cleanTextResponse(response);
    let cleaned = normalizeNarrative(text).trim();
    if (cleaned && cleaned.length > 5) {
      return cleaned;
    }
  } catch (error) {
    console.error('Local/External LLM error during random description generation:', error);
  }
  return 'The description focuses on the character and follows the required factual structure.';
}

// Helper: strip MidJourney-specific flags from generated text to avoid duplication/injection
const stripMidJourneyFlags = (s: string): string => {
  let out = s;
  // Remove imagine prefix
  out = out.replace(/\/?imagine\s+prompt:\s*/ig, '');
  // Remove aspect ratio flags like --ar 16:9
  out = out.replace(/\s*--ar\s+\d{1,2}:\d{1,2}\s*/ig, ' ');
  // Remove seed flags like --seed 1234567890
  out = out.replace(/\s*--seed\s+\d{1,10}\s*/ig, ' ');
  // Remove stylize and quality flags to prevent duplication with Additional Parameters
  out = out.replace(/\s*--stylize\s+\d{1,5}\s*/ig, ' ');
  out = out.replace(/\s*--quality\s+\d{1,3}\s*/ig, ' ');
  // Remove --no flag with following terms until next flag or end
  out = out.replace(/\s*--no\s+(.+?)(?=\s+--|$)/ig, ' ');
  // Cleanup excessive spaces and repeated commas
  out = out.replace(/\s{2,}/g, ' ').replace(/,\s*,+/g, ',').replace(/,\s*,/g, ',');
  return out.trim();
};

export const generatePromptWithGuidance = async (
  config: CustomApiConfig,
  sceneDescription: string,
  targetModelName: string,
  breakToggle: boolean,
  advancedSettings?: AdvancedSettingsState
): Promise<string> => {
  const model = targetModelName;
  const safeUser = truncateMiddle(cleanTextResponse(sceneDescription ?? ''), MAX_USER_INPUT_CHARS);

  // Grouping per product requirement: Natural Language vs Keyword-based
  const NATURAL_MODELS = new Set<string>([
    'Google Imagen4',
    'Flux',
    'Illustrious',
    'OpenAI', // DALL-E family
    'Veo 3',
    'SVD',
    'CogVideoX',
    'Hunyuan Video',
    'LTXV',
    'Wan Video'
  ]);

  const KEYWORD_MODELS = new Set<string>([
    'SDXL',
    'SD 1.5',
    'Pony',
    'MidJourney',
    'Stable Cascade',
    'Nano Banana',
    'Gwen',
    'AuraFlow',
    'HiDream',
    'Kolors',
    'Lumina',
    'Mochi',
    'NoobAI',
    'PixArt A/E'
  ]);

  let systemPrompt = '';
  let userContent = '';
  let mode: 'flux' | 'sdxl_flat' | 'sdxl_break' = 'flux';

  // Decide variant:
  if (NATURAL_MODELS.has(model)) {
    // Natural language paragraph style (Flux-like). BREAK toggle ignored by design
    mode = 'flux';
    systemPrompt = 'You are a meticulous prompt engineer who specializes in converting descriptions into ready-to-use prompts for modern natural-language image/video models (e.g., Flux, Imagen, DALL·E).';
    userContent = [
      'Your task is to CONVERT, NOT SUMMARIZE, the following scene description into a clear, direct, and detailed instruction in natural prose. You MUST use all significant details, concepts, and descriptive words from the original text. Ensure the final output preserves the full context and richness of the original. The output should be a single, well-formed paragraph in English.',
      '',
      'Scene Description:',
      `"${safeUser}"`,
      '',
      'Final Prompt:'
    ].join('\n');
  } else if (KEYWORD_MODELS.has(model)) {
    // Keyword/tag style (SDXL-like). Respect BREAK toggle
    if (breakToggle) {
      mode = 'sdxl_break';
      systemPrompt = 'You are a meticulous prompt engineer who specializes in creating structured prompts for advanced AI image generation, using the `BREAK` keyword to separate concepts.';
      userContent = [
        'Analyze the following description and break it down into logical thematic chunks (e.g., 1. Subject and appearance, 2. Action and pose, 3. Environment and lighting, 4. Overall style and composition). Convert each chunk into comma-separated keywords, and then join these chunks together using the `BREAK` keyword. It is crucial to be comprehensive and not omit details from the original text. The output must be a single line of text in English.',
        '',
        'Scene Description:',
        `"${safeUser}"`,
        '',
        'SDXL Prompt with BREAKs:'
      ].join('\n');
    } else {
      mode = 'sdxl_flat';
      systemPrompt = 'You are a meticulous prompt engineer who specializes in extracting keywords for AI image generators like Stable Diffusion (SDXL).';
      userContent = [
        'Analyze the following description and extract a rich, diverse set of comma-separated keywords (without labels). Start with the subject and their defining traits, then include pose/action, clothing, hair, facial expression and emotion, environment/location, lighting/mood, composition/camera terms, and high-level style descriptors. The output must be a single line of text in English, with no headings or extra words.',
        '',
        'Scene Description:',
        `"${safeUser}"`,
        '',
        'SDXL Keyword Prompt:'
      ].join('\n');
    }
  } else {
    // Unknown model -> default to natural prose
    mode = 'flux';
    systemPrompt = 'You are a skilled prompt engineer who rewrites descriptions into a single natural-language instruction.';
    userContent = [
      'Rewrite the following into one clear paragraph in English, preserving all important details and ensuring it instructs an image model precisely.',
      '',
      'Scene Description:',
      `"${safeUser}"`,
      '',
      'Final Prompt:'
    ].join('\n');
  }

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent }
  ];

  const useBreak = mode === 'sdxl_break';

  try {
    const response = await makeApiCall(config, messages, {
      temperature: 0.5,
      top_p: 0.9,
      maxTokens: 320,
      stop: STOP_SEQS
    });

    let text = cleanTextResponse(response);

    if (mode === 'flux') {
      // Natural paragraph; just normalize
      const base = normalizeNarrative(text);
      return appendParamsIfNeeded(base, targetModelName, advancedSettings);
    }

    // SDXL styles -> reduce to keywords
    const normalized = normalizeToTagsLine(text, 60);
    const normalizedSanitized = model === 'MidJourney' ? stripMidJourneyFlags(normalized) : normalized;

    if (useBreak) {
      // Ensure presence of BREAK separation; if missing, try to intelligently insert
      const parts = normalizedSanitized.split(/\s*BREAK\s*/i).filter(Boolean);
      let base: string;
      if (parts.length < 2) {
        // Heuristic split: subject/appearance | action/pose | environment/lighting | style/composition
        const segments = normalizedSanitized.split(',').map(s => s.trim()).filter(Boolean);
        const quarter = Math.ceil(segments.length / 4);
        const recomposed = [
          segments.slice(0, quarter).join(', '),
          segments.slice(quarter, 2 * quarter).join(', '),
          segments.slice(2 * quarter, 3 * quarter).join(', '),
          segments.slice(3 * quarter).join(', ')
        ].filter(s => s.length > 0).join(' BREAK ');
        base = recomposed;
      } else {
        base = parts.join(' BREAK ');
      }
      return appendParamsIfNeeded(base, targetModelName, advancedSettings);
    }

    return appendParamsIfNeeded(normalizedSanitized, targetModelName, advancedSettings);
  } catch (error) {
    console.error('Local LLM error during guided prompt generation:', error);
    // Fallback: simple normalization based on chosen mode
    const text = safeUser;
    const base = (mode === 'flux') ? normalizeNarrative(text) : normalizeToTagsLine(text, 60);
    return appendParamsIfNeeded(base, targetModelName, advancedSettings);
  }
};

// Helper: append MidJourney-like params with validation
function appendParamsIfNeeded(basePrompt: string, modelName: string, adv?: AdvancedSettingsState): string {
  if (!adv) return basePrompt;
  const modelCfg = MODELS[modelName];
  const isMidJourney = modelName === 'MidJourney';

  // Only act when model uses textual params
  if (modelCfg?.paramStyle !== 'double-dash' && modelCfg?.negativePromptStyle !== 'param') {
    return basePrompt;
  }

  const negativePrompt = (adv.negativePrompt || '').trim();
  const aspectRatio = adv.aspectRatio || '';
  const additionalParams = (adv.additionalParams || '').trim();
  const seed = (adv.seed || '').trim();

  if (isMidJourney) {
    const allowedAr = new Set(['1:1','16:9','9:16','4:3','3:4']);
    if (aspectRatio && aspectRatio !== 'none' && !allowedAr.has(aspectRatio)) {
      throw new Error(`MidJourney: Unsupported aspect ratio "${aspectRatio}". Use one of 1:1, 16:9, 9:16, 4:3, 3:4`);
    }
    if (seed) {
      const seedNum = Number(seed);
      if (!Number.isInteger(seedNum) || seedNum < 0 || seedNum > 4294967295) {
        throw new Error('MidJourney: Seed must be an integer between 0 and 4294967295');
      }
    }
    if (/--(ar|seed|no)\b/i.test(additionalParams)) {
      throw new Error('MidJourney: Do not include --ar/--seed/--no in Additional Parameters; they are added automatically');
    }
    if (negativePrompt.includes('--')) {
      throw new Error('MidJourney: Negative Prompt must not contain parameter flags like --; use comma-separated terms only');
    }
  }

  // Start with a clean base that may have had flags injected by the model
  let baseClean: string = basePrompt;

  // If using param-style negative prompt and base looks like tags, remove any exact negative tokens from base
  if (modelCfg?.negativePromptStyle === 'param' && negativePrompt) {
    const negTokens = negativePrompt
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)
      .map(t => t.toLowerCase());
    if (negTokens.length > 0) {
      const hasBreak = /\bBREAK\b/i.test(baseClean);
      if (hasBreak) {
        const chunks = baseClean.split(/\s*BREAK\s*/i).map(c => c.trim());
        const filteredChunks = chunks.map(chunk => {
          const parts = chunk.split(',').map(p => p.trim()).filter(Boolean);
          const filtered = parts.filter(p => !negTokens.includes(p.toLowerCase()));
          return filtered.join(', ');
        });
        baseClean = filteredChunks.join(' BREAK ');
      } else if (baseClean.includes(',')) {
        const parts = baseClean.split(',').map(p => p.trim()).filter(Boolean);
        const filtered = parts.filter(p => !negTokens.includes(p.toLowerCase()));
        baseClean = filtered.join(', ');
      }
    }
  }

  // Build param parts with deduplication for additionalParams flags
  const parts: string[] = [];
  if (modelCfg?.paramStyle === 'double-dash') {
    if (aspectRatio && aspectRatio !== 'none') {
      if (!/\s--ar\s+\d{1,2}:\d{1,2}\b/i.test(baseClean)) parts.push(`--ar ${aspectRatio}`);
    }
    if (seed) {
      if (!/\s--seed\s+\d{1,10}\b/i.test(baseClean)) parts.push(`--seed ${seed}`);
    }
    if (additionalParams) {
      const flagMatches = additionalParams.match(/--[a-z][\w-]*\s+[^\s]+/ig) || [];
      const residual = additionalParams.replace(/--[a-z][\w-]*\s+[^\s]+/ig, '').trim();
      const dedupedFlags = flagMatches.filter((f: string) => baseClean.toLowerCase().indexOf(f.toLowerCase()) === -1);
      const extra: string[] = [];
      if (dedupedFlags.length > 0) extra.push(dedupedFlags.join(' '));
      if (residual) extra.push(residual);
      if (extra.length > 0) parts.push(extra.join(' '));
    }
  }
  if (modelCfg?.negativePromptStyle === 'param' && negativePrompt) {
    if (!/--no\b/i.test(baseClean)) parts.push(`--no ${negativePrompt}`);
  }

  if (parts.length === 0) return baseClean;
  return `${baseClean} ${parts.join(' ')}`.replace(/\s{2,}/g, ' ').trim();
}
export const generatePromptWithGuidanceLegacy = async (
  config: CustomApiConfig,
  sceneDescription: string,
  targetModelName: string,
  syntaxStyle: 'natural' | 'tagged'
): Promise<string> => {
  // Legacy kept for backward compatibility if needed
  const safeUser = truncateMiddle(cleanTextResponse(sceneDescription ?? ''), MAX_USER_INPUT_CHARS);
  const systemPrompt = syntaxStyle === 'natural'
    ? 'Convert the description into one concise natural-language instruction paragraph.'
    : 'Extract concise, diverse keywords suitable for SDXL-like models.';
  const userContent = syntaxStyle === 'natural'
    ? `Rewrite into a single paragraph in English:\n\n"${safeUser}"\n\nFinal Prompt:`
    : `Extract comma-separated keywords in English (no labels):\n\n"${safeUser}"\n\nKeywords:`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent }
  ];

  try {
    const response = await makeApiCall(config, messages, { temperature: 0.6, top_p: 0.9, maxTokens: 280, stop: STOP_SEQS });
    const text = cleanTextResponse(response);
    return syntaxStyle === 'natural' ? normalizeNarrative(text) : normalizeToTagsLine(text, 60);
  } catch (e) {
    return syntaxStyle === 'natural' ? normalizeNarrative(safeUser) : normalizeToTagsLine(safeUser, 60);
  }
};

// Translator: map numeric/categorical attributes to descriptive phrases for constraints
const toAgePhrase = (age: AgeRange): string => {
  switch (age) {
    case '18s': return 'young adult';
    case '25s': return 'mid‑twenties';
    case '30s': return 'thirties';
    case '40s': return 'forties';
    case '50s': return 'fifties';
    case '60s': return 'sixties';
    case '70+': return 'seventies or older';
    default: return 'adult';
  }
};

const toHeightPhrase = (height: HeightRange): string => {
  switch (height) {
    case 'very short': return 'very short';
    case 'short': return 'short';
    case 'average': return 'average height';
    case 'tall': return 'tall';
    default: return String(height);
  }
};

const toBreastPhrase = (size: BreastSize): string => {
  switch (size) {
    case 'flat': return 'flat chest';
    case 'small': return 'small breasts';
    case 'medium': return 'medium breasts';
    case 'large': return 'large breasts';
    case 'huge': return 'huge breasts';
    case 'gigantic': return 'gigantic breasts';
    default: return String(size);
  }
};

const toHipsPhrase = (size: HipsSize): string => {
  switch (size) {
    case 'narrow': return 'slender hips';
    case 'average': return 'average hips';
    case 'wide': return 'wide hips';
    case 'extra wide': return 'extra-wide hips';
    default: return String(size);
  }
};

const toButtPhrase = (size: ButtSize): string => {
  switch (size) {
    case 'flat': return 'a flat butt';
    case 'small': return 'a small butt';
    case 'average': return 'an average butt';
    case 'large': return 'a large butt';
    case 'bubble': return 'a bubble butt';
    default: return String(size);
  }
};

const toBodyTypePhrase = (gender: Gender, bodyType: CharacterSettingsState['bodyType']): string => {
  if (bodyType === 'any') return '';
  const femaleLike = gender === 'female' || gender === 'futanari' || gender === 'trans female' || gender === 'nonbinary';
  if (femaleLike) {
    switch (bodyType as FemaleBodyType | 'any') {
      case 'slim': return 'a slender build';
      case 'curvy': return 'a soft and curvy body';
      case 'athletic': return 'a slender and athletic build';
      case 'instagram model': return 'a slim‑thick, hourglass figure';
      default: return String(bodyType);
    }
  } else {
    switch (bodyType as MaleBodyType | 'any') {
      case 'slim': return 'a slender build';
      case 'fat': return 'a heavy‑set build';
      case 'muscular': return 'a muscular build';
      case 'big muscular': return 'a massive, bodybuilder physique';
      default: return String(bodyType);
    }
  }
};

const toPenisPhrase = (size: PenisSize): string => {
  switch (size) {
    case 'small': return 'a small penis';
    case 'average': return 'an average penis';
    case 'large': return 'a large penis';
    case 'huge': return 'a huge penis';
    case 'horse-hung': return 'a horse‑hung penis';
    default: return String(size);
  }
};

const toMusclePhrase = (def: MuscleDefinition): string => {
  switch (def) {
    case 'soft': return 'soft musculature';
    case 'toned': return 'toned musculature';
    case 'defined': return 'well‑defined muscles';
    case 'ripped': return 'a ripped physique';
    case 'bodybuilder': return 'bodybuilder‑level musculature';
    default: return String(def);
  }
};

const toFacialHairPhrase = (hair: FacialHair): string => {
  switch (hair) {
    case 'any': return '';
    case 'clean-shaven': return 'clean-shaven';
    case 'stubble': return 'stubble';
    case 'goatee': return 'a goatee';
    case 'mustache': return 'a mustache';
    case 'full beard': return 'a full beard';
    default: return '';
  }
};
export const generateText = async (apiKey: string, prompt: string, model: string, customApiConfig: CustomApiConfig): Promise<string> => {
  // Normalize base URL similar to makeApiCall
  let base = (customApiConfig.url ?? '').trim();
  if (!base || base === 'local' || base === '/local') {
    base = 'http://localhost:11434';
  } else if (!/^https?:\/\//i.test(base)) {
    base = `http://${base.replace(/^\//, '')}`;
  }
  base = base.replace(/\/$/, '');
  const url = `${base}/v1/completions`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {})
    },
    body: JSON.stringify({
      prompt,
      model
    })
  });

  if (!response.ok) {
    const errTxt = await response.text().catch(() => '');
    throw new Error(`Custom API request failed with status ${response.status} ${response.statusText} - ${errTxt}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.text ?? '';
};

// Simplified imagination paragraph for Qwen-compatible custom API
export const generateImaginationParagraph = async (
  config: CustomApiConfig,
  nsfwSettings: NsfwSettingsState
): Promise<string> => {
  const systemPrompt = [
    'You are a creative writer. Your only task is to write a single paragraph.',
    'CRITICAL RULE: Your output MUST be a PARAGRAPH with full sentences.',
    `Content Policy: The content of the paragraph MUST match the user's SFW/NSFW/Hardcore setting: ${nsfwSettings.mode}.`
  ].join('\n');

  const userPrompt = 'Write one single, creative, descriptive paragraph in English about a character in a compelling scene.';

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];

  const raw = await makeApiCall(config, messages, {
    temperature: 0.7,
    top_p: 0.9,
    maxTokens: 280,
    stop: ['<<EOD>>']
  });
  return cleanTextResponse(raw);
};