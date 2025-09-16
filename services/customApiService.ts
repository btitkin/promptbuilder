import type {
  NsfwSettingsState,
  StyleFilter,
  StructuredPrompt,
  CharacterSettingsState,
  CustomApiConfig
} from '../types';
import { invokeLLM, isElectronAvailable } from './electronService';

// Optional generation options for local/external calls
type GenOptions = {
  temperature?: number;
  top_p?: number;
  maxTokens?: number;
  stop?: string[];
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
  let cleaned = (text ?? '').toString();

  cleaned = cleaned
    // Usuń cytaty i znaki '>' na początku linii (cytowanie, jak na zrzutach)
    .replace(/^\s*>+\s*/gm, '')
    // Usuń znacznikowe role i dialogi (ASSISTANT:, USER:, SYSTEM:)
    .replace(/^\s*(ASSISTANT|USER|SYSTEM)\s*:\s*/gim, '')
    // Usuń warianty nawiasowe typu (Scene description)
    .replace(/^\s*\(scene\s+description\)\s*[:\-]?\s*/gim, '')
    // generic prefix like "Label:"
    .replace(/^\s*[\w\s'-]+:\s*/im, '');

  return cleaned;
};

export function normalizeNarrative(text: string): string {
  // Zacznij od ogólnego czyszczenia, które usuwa role, cytaty '>' i większość znaczników
  let s = cleanTextResponse(text ?? '');

  // Usuń cytowania '>' i role oraz (Scene description) – (zostawione dla pewności po wstępnym czyszczeniu)
  s = s.replace(/^\s*>+\s*/gm, '');
  s = s.replace(/^\s*(ASSISTANT|USER|SYSTEM)\s*:\s*/gim, '');
  s = s.replace(/^\s*\(scene\s+description\)\s*[:\-]?\s*/gim, '');

  // Usuń code fences i pseudo-XML
  s = s.replace(/```[\s\S]*?```/g, ' ').replace(/<[^>]*>/g, ' ');

  // Usuń bracket tokens i ogólne nawiasowe tagi [SYS], [/EOD], [INST], [INSTR], itp.
  s = s.replace(/\[(?:\/)?(?:SYS|SYSTEM|EOD|INST|INSTR|OOC)\]/gi, '');
  // Dodatkowo: usuń dowolne krótkie uppercase tagi w nawiasach kwadratowych, np. [XYZ], [/ABC]
  s = s.replace(/\[(?:\/)?[A-Z]{2,10}\]/g, '');

  // Usuń zdania/reguły o asystencie/AI
  s = s.replace(/^\s*(you are|you're|as an(?:\s+ai|\s+assistant)?|i am|i'm)\b[^.]*\.\s*/gi, '');
  s = s.replace(/^\s*(Always answer|If a question|explain why instead).*?[.!?]\s*/gi, '');

  // Usuń linie/zdania będące echem instrukcji promptu
  const instructionLike = [
    /^(please\s+)?create\s+a\s+visual\s+scene\s+description/i,
    /^(please\s+)?write\s+one\s+paragraph/i,
    /^do\s+not\b/i,
    /^describe\s+only\b/i,
    /^(please\s+)?describe\s+(?:the\s+)?scene\b/i,
    /^start\s+(directly|immediately)\b/i,
    /^end\s+the\s+description\b/i,
    /^return\s+only\b/i,
    /^bad\s*:/i,
    /^good\s*:/i,
    /^note\s*:/i
  ];

  // Usuń wiodące zdanie-instrukcję, nawet gdy opis jest dalej w tej samej linii
  s = s.replace(/^\s*(?:please\s+)?describe\s+(?:the\s+)?scene\b.*?[.!?:]\s*/i, '');
  s = s.replace(/^\s*(?:please\s+)?create\s+a\s+visual\s+scene\s+description\b.*?[.!?:]\s*/i, '');

  s = s
    .split(/\r?\n+/)
    .map(line => line.trim())
    .filter(line => line && !instructionLike.some(rx => rx.test(line)))
    .join(' ');

  // Usuń wstępne numerowanie/listy
  s = s.replace(/^\s*\(?\d+\)?[.)]\s+/, '');

  // Wyciągnij to co po Scene:/Description: jeśli istnieje
  const sceneIdx = s.search(/\b(scene|description)\s*:/i);
  if (sceneIdx >= 0) {
    s = s.slice(s.indexOf(':', sceneIdx) + 1);
  }

  // Jeśli pojawił się wzorzec USER: ... ASSISTANT: ... -> weź fragment po USER:
  const userIdx = s.search(/\bUSER:\s*/i);
  if (userIdx >= 0) {
    const afterUser = s.slice(s.indexOf(':', userIdx) + 1).trim();
    if (afterUser && !afterUser.match(/^\s*(ASSISTANT:|\[\/?INST\]|<\/?)/)) {
      s = afterUser;
    }
  }

  // Usuń prefiks Tags:
  s = s.replace(/^\s*tags?\s*:\s*[^\n]*\)\s*[-–—:]?\s*/i, '');

  // Redukcja białych znaków i lini
  s = s.replace(/\r?\n+/g, ' ').replace(/\s{2,}/g, ' ').trim();

  // Zatrzymaj do 3 pierwszych zdań
  const sentences = s.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (sentences.length > 3) {
    s = sentences.slice(0, 3).join(' ');
  }

  // Dopnij kropkę jeśli brak
  if (!/[.!?]"?$/.test(s) && s.length > 0) {
    s += '.';
  }

  return s;
}

// Convert any noisy/multiline output into a single, comma-separated tag line suitable for the UI
const normalizeToTagsLine = (text: string, maxTags: number = 45): string => {
  let s = cleanTextResponse(text);

  // Usuń tylko najbardziej oczywiste prefiksy
  s = s.replace(/^(Here are some|Here's a|Tags:|Image tags:|Prompt:|Description:)\s*/i, '');
  s = s.replace(/^(I'll create|I can suggest|Let me generate).*?:\s*/i, '');
  
  // Usuń zdania wyjaśniające - ale tylko kompletne zdania
  s = s.replace(/\b(This prompt|These tags|The image)[^,]*?\./gi, '');
  
  // Usuń dziwne formatowanie z slashami - ale zachowaj więcej treści
  s = s.replace(/\/([A-Za-z0-9]+)/g, '$1');
  
  // Usuń powtarzające się słowa
  s = s.replace(/(\b\w+\b)\s+\1/gi, '$1');

  // Convert common separators to commas
  s = s.replace(/[;|]/g, ', ');
  s = s.replace(/\r?\n+/g, ', ');

  // Remove list markers and numeric bullets
  s = s.replace(/(^|, )\s*(?:\(?\d+\)?[.)]|[-*•])\s+/g, '$1');

  // Remove lingering role tokens if any
  s = s.replace(/\b(?:OOC|SYS|SYSTEM|USER|ASSISTANT)\b\s*:?/gi, '');

  // Normalize quotes/parentheses/backticks - ale zachowaj więcej
  s = s.replace(/["'`]/g, '');

  // Convert full stops to soft separators when they look like sentence breaks
  s = s.replace(/\.(\s+|$)/g, ', ');

  // Collapse duplicate commas/spaces
  s = s.replace(/\s*,\s*/g, ', ');
  s = s.replace(/(?:,\s*){2,}/g, ', ');

  // Split, trim, dedupe, and cap length - ale bądź mniej restrykcyjny
  const parts = s.split(',').map(t => t.trim()).filter(Boolean);
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const p of parts) {
    let tag = p.replace(/\s{2,}/g, ' ').replace(/[.]+$/g, '').trim();
    
    // Usuń tylko najbardziej oczywiste prefiksy - ale zachowaj więcej treści
    tag = tag.replace(/^(woman|man|pose|location|clothing|lighting|style|age|build)\s*:?\s*/i, '');
    
    if (!tag || tag.length < 1) continue;
    
    const key = tag.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      tags.push(tag);
    }
    if (tags.length >= maxTags) break; // pozwól na większą gęstość
  }

  if (tags.length === 0) {
    return 'portrait, single subject, natural light, shallow depth of field, cinematic lighting, high detail, sharp focus, photorealistic';
  }

  const result = tags.join(', ');
  return result;
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

const makeApiCall = async (
  config: CustomApiConfig,
  messages: any[],
  opts?: GenOptions
): Promise<string> => {
  // Always use local LLM when available (Electron environment)
  const electronAvailable = isElectronAvailable();
  
  const temperature = opts?.temperature ?? 0.6;
  const top_p = opts?.top_p ?? 0.9;
  const maxTokens = opts?.maxTokens ?? 512;
  const stop = opts?.stop ?? STOP_SEQS;

  if (electronAvailable) {
    const systemMessage = messages.find(m => m.role === 'system');
    const userMessage = messages.find(m => m.role === 'user');
    
    if (systemMessage && userMessage) {
      // obetnij za długie user content preemptively
      const safeUser = truncateMiddle(cleanTextResponse(userMessage.content ?? ''), MAX_USER_INPUT_CHARS);
      const prompt = buildTheBlokePrompt(
        (systemMessage.content ?? '').toString().trim(),
        safeUser
      ).replace(/\s+/g, ' ').trim(); // kompaktuj białe znaki

      // Używamy tylko prompt - main.js sam go obsłuży
      return await invokeLLM('custom', {
        prompt,
        temperature,
        top_p,
        maxTokens,
        stop
      });
    }
    throw new Error('Invalid message format for local LLM');
  }
  
  // Fallback to external API if not in Electron (should not happen in our case)
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (config.key) {
    headers['Authorization'] = `Bearer ${config.key}`;
  }

  const response = await fetch(`${config.url}/v1/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stop
    }),
  });

  if (!response.ok) {
    throw new Error(`Custom API error: ${response.status} ${response.statusText}`);
  }

  const data: any = await response.json();
  return data.choices?.[0]?.message?.content || '';
};

export const generatePromptVariations = async (
  config: CustomApiConfig,
  userInput: string,
  numVariations: number,
  nsfwSettings: NsfwSettingsState,
  styleFilter: StyleFilter,
  selectedModel: string,
  characterSettings: CharacterSettingsState
): Promise<{ structuredPrompts: StructuredPrompt[], negativePrompt: string }> => {
  // TheBloke preamble for WizardLM
  const systemPrompt = `A chat between a curious user and an artificial intelligence assistant. The assistant gives helpful, detailed, and polite answers to the user's questions.`;
  
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
  
  // Replace explicit style naming with an implicit guideline (no style tags in output)
  rules += `\n- Style Guideline: evoke the '${styleFilter.main}'${styleFilter.sub !== 'any' ? `/${styleFilter.sub}` : ''} aesthetic implicitly through vocabulary, lighting, composition, and mood — do not name style tags or genres.`;
  
  // Update NSFW constraints to influence tone without printing labels like "NSFW" or numeric intensities
  switch (nsfwSettings.mode) {
    case 'off':
      rules += `\n- Content Guideline: safe-for-work tone; do not use the words 'SFW' or 'NSFW'.`;
      break;
    case 'nsfw':
      rules += `\n- Content Guideline: allow sensual undertones consistent with the requested level, but DO NOT write the words 'NSFW', 'intensity', or any numeric ratings.`;
      break;
    case 'hardcore':
      rules += `\n- Content Guideline: explicit tone consistent with the requested level, but DO NOT write the words 'NSFW', 'intensity', or any numeric ratings.`;
      break;
  }
  
  const userContent = `${rules}\n\nGenerate ${numVariations} variations for: ${safeUser}\n\nReturn ONLY the JSON object.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent }
  ];

  try {
    const response = await makeApiCall(config, messages, {
      temperature: 0.35,
      top_p: 0.9,
      maxTokens: 600, // krótsza odpowiedź => mniej ryzyka dryfu
      stop: STOP_SEQS
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
      // Fallback: Create structured prompt from plain text response
      const fallbackPrompt: StructuredPrompt = {
        subject: [safeUser],
        attributes: ['detailed', 'high quality', 'masterpiece'],
        clothing: [],
        pose: [],
        action: [],
        location: [],
        background: [],
        style: [styleFilter.main, styleFilter.sub !== 'any' ? styleFilter.sub : '', 'professional'].filter(Boolean)
      };
      
      // Generate multiple variations by adding different attributes
      const variations: StructuredPrompt[] = [];
      for (let i = 0; i < numVariations; i++) {
        const variation: StructuredPrompt = JSON.parse(JSON.stringify(fallbackPrompt));
        const variationAttributes = ['detailed', 'high quality', 'masterpiece'];
        if (i === 1) variationAttributes.push('artistic', 'creative', 'vibrant');
        if (i === 2) variationAttributes.push('professional', 'polished', 'cinematic');
        if (i >= 3) variationAttributes.push('unique', 'expressive', 'dynamic');
        variation.attributes = variationAttributes;
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
  const systemPrompt = '';

  const focusParts: string[] = [];
  if (nsfwSettings.enhancePerson) focusParts.push('the person/subject');
  if (nsfwSettings.enhancePose) focusParts.push('pose and action');
  if (nsfwSettings.enhanceLocation) focusParts.push('location/background and atmosphere');
  const focusLine = focusParts.length > 0 ? `Focus on ${focusParts.join(', ')}.` : '';

  const genderRule =
    characterSettings.gender === 'male' ? 'All depicted individuals MUST be male.' :
    characterSettings.gender === 'female' ? 'All depicted individuals MUST be female.' :
    characterSettings.gender === 'mixed' ? 'Include both male and female individuals.' : '';

  const contentPolicy =
    nsfwSettings.mode === 'off' ? 'Content must be SFW.' :
    nsfwSettings.mode === 'nsfw' ? `Suggestive NSFW is allowed up to intensity ~${nsfwSettings.nsfwLevel}/10; avoid explicit mechanics.` :
    `Explicit content allowed up to intensity ~${nsfwSettings.hardcoreLevel}/10; avoid illegal or unsafe content.`;

  const constraints: string[] = [];
  if (characterSettings.age !== 'any') constraints.push(`main subject age in '${characterSettings.age}'`);
  if (characterSettings.ethnicity !== 'any') constraints.push(`ethnicity ${characterSettings.ethnicity}`);
  if (characterSettings.bodyType !== 'any') constraints.push(`body type ${characterSettings.bodyType}`);
  if (characterSettings.gender === 'female') {
    if (characterSettings.breastSize !== 'any') constraints.push(`breast size ${characterSettings.breastSize}`);
    if (characterSettings.hipsSize !== 'any') constraints.push(`hips size ${characterSettings.hipsSize}`);
    if (characterSettings.buttSize !== 'any') constraints.push(`butt size ${characterSettings.buttSize}`);
  }
  if (characterSettings.gender === 'male') {
    if (characterSettings.muscleDefinition !== 'any') constraints.push(`musculature ${characterSettings.muscleDefinition}`);
    if (characterSettings.facialHair !== 'any') constraints.push(`facial hair ${characterSettings.facialHair}`);
    if (characterSettings.penisSize !== 'any' && (nsfwSettings.mode === 'nsfw' || nsfwSettings.mode === 'hardcore')) constraints.push(`penis size ${characterSettings.penisSize}`);
  }

  const imaginationRule = nsfwSettings.aiImagination === false
    ? 'Do not invent elements that are not implied by the user text.'
    : 'You may add small, tasteful, coherent details that enhance clarity and mood, staying faithful to the user text.';

  const styleRule = `Keep an overall '${styleFilter.main}' style${styleFilter.sub !== 'any' ? ` with '${styleFilter.sub}' accents` : ''}.`;

  const safeUser = truncateMiddle(cleanTextResponse(userInput), MAX_USER_INPUT_CHARS);

  const userContent = [
    `You will rewrite and enrich the user's description into a single vivid paragraph (2–3 sentences, ~45–100 words).`,
    `Stay faithful to the original meaning. ${focusLine}`,
    genderRule,
    contentPolicy,
    imaginationRule,
    styleRule,
    constraints.length ? `Constraints to respect: ${constraints.join(', ')}.` : '',
    `Do NOT output tags, lists, bullet points, labels, headings, roles, or code fences.`,
    `Output plain text only. End the description with ${SENTINEL} and write nothing after it.`,
    `User description: ${safeUser}`
  ].filter(Boolean).join(' ');

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent }
  ];

  // Synthetic fallback builder: 2–3 zdania, respektuje ustawienia i Enhance Options
  const buildSyntheticEnhancement = (
    base: string,
    nsfw: NsfwSettingsState,
    style: StyleFilter,
    character: CharacterSettingsState,
    focus: string[]
  ): string => {
    const subject = character.gender === 'female' ? 'woman' : character.gender === 'male' ? 'man' : 'person';
    const age = character.age && character.age !== 'any' ? `${character.age}` : '';
    const ethnicity = character.ethnicity && character.ethnicity !== 'any' ? `${character.ethnicity}` : '';
    const body = character.bodyType && character.bodyType !== 'any' ? `${character.bodyType} build` : '';

    const styleTone = style.sub && style.sub !== 'any' ? `${style.main}/${style.sub}` : style.main;

    const nsfwTone = nsfw.mode === 'off'
      ? 'with a tasteful, understated mood'
      : nsfw.mode === 'nsfw'
        ? `with subtle, sensual undertones around ${nsfw.nsfwLevel}/10`
        : `with a bold, intimate tone around ${nsfw.hardcoreLevel}/10 (never illegal or unsafe)`;

    const details: string[] = [];
    if (character.gender === 'female') {
      if (character.breastSize && character.breastSize !== 'any') details.push(`a ${character.breastSize} bust`);
      if (character.hipsSize && character.hipsSize !== 'any') details.push(`${character.hipsSize} hips`);
      if (character.buttSize && character.buttSize !== 'any') details.push(`${character.buttSize} curves`);
    }
    if (character.gender === 'male') {
      if (character.muscleDefinition && character.muscleDefinition !== 'any') details.push(`${character.muscleDefinition} musculature`);
      if (character.facialHair && character.facialHair !== 'any') details.push(`${character.facialHair} facial hair`);
      if (nsfw.mode !== 'off' && character.penisSize && character.penisSize !== 'any') details.push(`${character.penisSize} endowment`);
    }

    const personLineParts = [age, ethnicity, body, subject].filter(Boolean);
    const baseIdea = base.trim().replace(/\s+/g, ' ');

    const focusText = focus.includes('pose and action') ? 'their natural pose and subtle action,' : 'their presence,';
    const locText = focus.includes('location/background and atmosphere') ? 'the evocative setting and atmosphere,' : 'the setting and ambient light,';

    const sentence1 = `A ${personLineParts.join(' ')} ${nsfwTone}, seen ${focusText} set around ${baseIdea}.`;

    const clothingHint = focus.includes('the person/subject') ? 'Clothing and features are described with tasteful specificity' : 'Details remain understated yet clear';
    const lightingHint = `soft, ${styleTone} lighting shapes the scene while the background falls gently out of focus`;

    const extra = details.length > 0 ? ` (${details.join(', ')})` : '';

    const sentence2 = `${clothingHint}${extra}, and ${locText} enhance the mood; ${lightingHint}.`;

    const text = `${sentence1} ${sentence2}`;
    return normalizeNarrative(text);
  };

  try {
    const response = await makeApiCall(config, messages, {
      temperature: 0.85,
      top_p: 0.95,
      maxTokens: 260,
      stop: STOP_SEQS
    });

    let cleaned = response.replace(new RegExp(`${SENTINEL}\\s*$`, 'i'), '').trim();
    cleaned = normalizeNarrative(cleaned);

    if (cleaned && cleaned.length > 5 && !isJunkOutput(cleaned)) {
      return cleaned;
    }

    // Fallback: syntetyczny akapit 2–3 zdaniowy, zgodny z ustawieniami
    return buildSyntheticEnhancement(safeUser, nsfwSettings, styleFilter, characterSettings, focusParts);
  } catch (error) {
    console.error('Local LLM error:', error);
    return buildSyntheticEnhancement(safeUser, nsfwSettings, styleFilter, characterSettings, focusParts);
  }
};

// Heurystyka wykrywania śmieciowych odpowiedzi od modelu (gwiazdki, same znaki specjalne, bardzo krótkie itp.)
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

// Prosty fallback opisowy
function buildFallbackNarrative(elements: string[]): string {
  const subject = elements.find(e => /woman|man/i.test(e)) || 'person';
  const mood = elements.find(e => /(suggestive|explicit)/i.test(e)) ? 'with a bold, intimate mood' : 'with a calm, reflective mood';
  const style = elements.find(e => /(cinematic|realistic|artistic|photorealistic|professional)/i.test(e)) || 'cinematic';
  return `A ${subject} in a thoughtfully composed scene, ${mood}. Gentle, ${style} lighting shapes the subject while the background falls softly out of focus. The environment adds texture and depth, inviting the viewer into the moment.`;
}

export const generateRandomDescription = async (
  config: CustomApiConfig,
  nsfwSettings: NsfwSettingsState,
  styleFilter: StyleFilter,
  characterSettings: CharacterSettingsState,
  selectedPresets: string[]
): Promise<string> => {
  // Brak systemPrompt - żeby nie było asystenckiego preamble
  const systemPrompt = ''; // pusty lub undefined

  // Baza elementów dla inspiracji
  const baseElements: string[] = [];
  if (characterSettings.gender === 'male') baseElements.push('man');
  else if (characterSettings.gender === 'female') baseElements.push('woman');

  if (characterSettings.age && characterSettings.age !== 'any') baseElements.push(`${characterSettings.age}`);
  if (characterSettings.ethnicity && characterSettings.ethnicity !== 'any') baseElements.push(`${characterSettings.ethnicity}`);
  if (characterSettings.bodyType && characterSettings.bodyType !== 'any') baseElements.push(`${characterSettings.bodyType} build`);
  baseElements.push(`${styleFilter.main}`);
  if (styleFilter.sub && styleFilter.sub !== 'any') baseElements.push(`${styleFilter.sub}`);
  if (nsfwSettings.mode === 'nsfw') baseElements.push('suggestive');
  else if (nsfwSettings.mode === 'hardcore') baseElements.push('explicit');
  if (selectedPresets.length > 0) baseElements.push(...selectedPresets);

  const basePrompt = baseElements.join(', ');

  // Format-lock z sentinelem - TYLKO opis sceny, bez dialogów
  const userContent = [
    `Create a visual scene description using these elements: ${basePrompt}.`,
    `Write one paragraph of 2–3 sentences (35–80 words) describing what you see in the scene.`,
    `Do NOT write dialogue, questions, conversations, or responses. Do NOT output tags, lists, or labels.`,
    `Describe only the visual scene - the person, their pose, setting, lighting, and atmosphere.`,
    `End the description with ${SENTINEL} and write nothing after it.`,
    `Bad: "Can you tell me about the woman?" or "Tags: woman, curvy"`,
    `Good: "A young Japanese woman with a curvy build reclines against weathered wooden steps, her confident gaze meeting the camera. Warm golden light filters through nearby foliage, casting soft shadows across her skin and highlighting the natural curves of her pose."`
  ].join(' ');

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent }
  ];

  try {
    // Parametry sampling dla większej różnorodności
    const response = await makeApiCall(config, messages, {
      temperature: 0.95 + (Math.random() * 0.1), // 0.95-1.05 z jitterem
      top_p: 0.96,
      maxTokens: 240, // więcej tokenów dla pełnych opisów
      stop: STOP_SEQS
    });

    // Usuń sentinel i normalizuj
    let cleaned = response.replace(new RegExp(`${SENTINEL}\\s*$`, 'i'), '').trim();
    
    cleaned = normalizeNarrative(cleaned);

    // Reject junk-like outputs as well (e.g., rows of dots/asterisks)
    if (cleaned && cleaned.length > 5 && !isJunkOutput(cleaned)) {
      return cleaned;
    }
    
    // Fallback: syntetyczny opis bazujący na baseElements (rzadki przypadek)
    const fallback = buildFallbackNarrative(baseElements);
    return fallback;
  } catch (error) {
    console.error('Local LLM error:', error);
    return buildFallbackNarrative(baseElements);
  }
};

export const generateImage = async (
  config: CustomApiConfig,
  prompt: string,
  resolution: '1k' | '2k',
  aspectRatio: string
): Promise<string> => {
  // Local LLM doesn't support image generation
  // This would require integration with a local image generation model like Stable Diffusion
  throw new Error('Image generation not supported with local LLM. Use an external image generation service.');
};