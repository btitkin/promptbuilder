

// FIX: Implemented missing AI service functions to resolve compilation errors.
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import type { StructuredPrompt, NsfwSettingsState, StyleFilter, CharacterSettingsState, Gender, FemaleBodyType, MaleBodyType, Ethnicity, HeightRange, AgeRange, BreastSize, HipsSize, ButtSize, PenisSize, MuscleDefinition, FacialHair, PromptVariationsResult } from '../types';
import { cleanLLMText, normalizeNarrative, normalizeToTagsLine as normalizeToTagsLineCentral } from './sanitizer';

const promptSchema = {
    type: Type.OBJECT,
    properties: {
        subject: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'The main person, character, or object. E.g., "1girl", "woman", "dragon".'
        },
        attributes: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Physical characteristics of the subject. E.g., "blonde hair", "blue eyes", "muscular build".'
        },
        clothing: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'What the subject is wearing. E.g., "bikini", "school uniform", "sci-fi armor".'
        },
        pose: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'The subject\'s posture or stance. E.g., "standing", "sitting on a bench", "dynamic action pose".'
        },
        action: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'What the subject is doing. E.g., "laughing", "reading a book", "fighting a monster".'
        },
        location: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'The immediate setting. E.g., "in a forest", "on a futuristic city street", "inside a cozy cafe".'
        },
        background: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Elements in the background. E.g., "mountains in the distance", "neon signs", "bookshelves".'
        },
        style: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Artistic and stylistic elements. E.g., "photorealistic", "oil painting", "cinematic lighting", "8k resolution".'
        },
    },
    required: ['subject', 'attributes', 'clothing', 'pose', 'action', 'location', 'background', 'style']
};

const variationsSchema = {
    type: Type.OBJECT,
    properties: {
        structuredPrompts: {
            type: Type.ARRAY,
            description: 'An array of structured prompts, each representing a different variation.',
            items: promptSchema,
        },
        negativePrompt: {
            type: Type.STRING,
            description: 'A negative prompt to be used with the generated prompts, listing concepts to avoid. E.g., "ugly, blurry, bad anatomy, worst quality".'
        }
    },
    required: ['structuredPrompts', 'negativePrompt']
};

// Schema for random prompt output as an array of concise tag strings
const randomTagsArraySchema = {
    type: Type.ARRAY,
    items: { type: Type.STRING },
    minItems: 12,
    maxItems: 25,
};

const getNsfwIntensityDescription = (level: number): string => {
    if (level <= 2) return "include tasteful nudity: nude, naked, bare skin, exposed. Keep it artistic and subtle.";
    if (level <= 4) return "include sensual themes: sensual, suggestive pose, alluring, revealing. Add some explicit nudity.";
    if (level <= 6) return "include provocative elements: provocative, seductive, enticing, erotic. Focus on detailed anatomy.";
    if (level <= 8) return "include strong erotic themes: tempting, captivating, mesmerizing, voluptuous. Detailed anatomy and strong sensuality.";
    return "include maximum explicit content: intoxicating, ravishing, beguiling, luscious. Extremely detailed anatomy and full explicit details.";
};

const getHardcoreIntensityDescription = (level: number): string => {
    if (level <= 2) return "include intimate context: sexual, intimate, passionate. Solo person explicit acts.";
    if (level <= 4) return "include explicit acts: masturbation, self-pleasure, touching herself, touching himself. Two people engaged.";
    if (level <= 6) return "include interactive scenarios: pillow humping, grinding, thrusting, moaning. Group explicit interactions.";
    if (level <= 8) return "include extreme scenarios: orgasm, climax, ecstasy, pleasure. Unconventional explicit themes.";
    return "include maximum hardcore: explicit sex, intercourse, penetration, raw passion. Most extreme explicit content with full details.";
};

const getBodyTypeDescription = (gender: Gender, bodyType: CharacterSettingsState['bodyType']): string => {
    if (gender === 'female') {
        switch (bodyType as FemaleBodyType) {
            case 'slim': return 'The subject must have a slim build, slender figure, and petite frame.';
            case 'curvy': return 'The subject must have a curvy figure with an hourglass shape, wide hips, and a voluptuous body.';
            case 'athletic': return 'The subject must have an athletic build with a toned body, defined muscles, and a fit physique.';
            case 'instagram model': return 'The subject must have an "instagram model" physique: a slim-thick, surgically enhanced look with an exaggerated hourglass figure and an impossibly small waist.';
        }
    } else if (gender === 'male') {
        switch (bodyType as MaleBodyType) {
            case 'slim': return 'The subject must have a slim build, a lean physique, and a slender frame.';
            case 'fat': return 'The subject must have a heavy-set, plus-size male build, such as a "dad bod" or a chubby, overweight frame with a large belly.';
            case 'muscular': return 'The subject must have a muscular, athletic body with toned muscles and a well-defined physique (like a movie star).';
            case 'big muscular': return 'The subject must have a hypermuscular bodybuilder physique with huge, massive, bulging muscles.';
        }
    }
    return '';
};

const getEthnicityDescription = (ethnicity: Ethnicity): string => {
    if (ethnicity === 'any') return '';
    return `The subject's ethnicity MUST be ${ethnicity}. This is a strict, non-negotiable requirement.`;
};

const getHeightDescription = (height: HeightRange): string => {
    if (height === 'any') return '';
    return `The subject's height MUST be ${height}. This is a strict physical trait.`;
};

const getBreastSizeDescription = (size: BreastSize): string => {
    if (size === 'any') return '';
    return `As a key physical attribute, the female subject MUST have ${size} breasts. This is a strict requirement.`;
};

const getHipsSizeDescription = (size: HipsSize): string => {
    if (size === 'any') return '';
    return `The female subject is required to have ${size} hips. This is a defining characteristic and must be depicted.`;
};

const getButtSizeDescription = (size: ButtSize): string => {
    if (size === 'any') return '';
    return `The female subject's butt MUST be ${size}. Adhere strictly to this physical trait.`;
};

const getPenisSizeDescription = (size: PenisSize): string => {
    if (size === 'any') return '';
    return `The male subject MUST be depicted with a ${size} penis. This is a non-negotiable anatomical detail.`;
};

const getMuscleDefinitionDescription = (def: MuscleDefinition): string => {
    if (def === 'any') return '';
    return `The male subject's musculature must be depicted as '${def}'. This is a key part of their physique.`;
};

const getFacialHairDescription = (hair: FacialHair): string => {
    if (hair === 'any') return '';
    return `The male subject MUST have facial hair described as: ${hair}. This is a strict visual requirement.`;
};

export const generateText = async (apiKey: string, prompt: string): Promise<string> => {
  const ai = new GoogleGenAI(apiKey);
  const result = await ai.getGenerativeModel({ model: 'gemini-pro' }).generateContent(prompt);
  return result.response.text();
};

// Simplified imagination paragraph generator for stability
export const generateImaginationParagraph = async (
  apiKey: string,
  nsfwSettings: NsfwSettingsState
): Promise<string> => {
  const systemInstruction = [
    'You are a creative writer. Your only task is to write a single paragraph.',
    'CRITICAL RULE: Your output MUST be a PARAGRAPH with full sentences.',
    `Content Policy: The content of the paragraph MUST match the user's SFW/NSFW/Hardcore setting: ${nsfwSettings.mode}.`
  ].join('\n');

  const userText = 'Write one single, creative, descriptive paragraph in English about a character in a compelling scene.';

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [{ text: userText }]
      }
    ],
    config: {
      systemInstruction,
      responseMimeType: 'text/plain'
    }
  });

  const text = (response as any)?.response?.text?.() ?? '';
  let cleaned = cleanLLMText(text).trim();
  cleaned = normalizeNarrative(cleaned);
  return cleaned || '';
};

function cleanModelText(text: string): string {
    return cleanLLMText(text);
}

// Convert any noisy/multiline output into a single, comma-separated tag line
function normalizeToTagsLine(text: string, maxTags: number = 25): string {
    return normalizeToTagsLineCentral(text || '', maxTags);
}

const buildSystemInstructionForVariations = (
    numVariations: number,
    nsfwSettings: NsfwSettingsState,
    styleFilter: StyleFilter,
    selectedModel: string,
    characterSettings: CharacterSettingsState
): string => {
    let instruction = `You are an expert prompt engineer for text-to-image AI models. Your task is to take a user's simple description and expand it into ${numVariations} detailed, structured prompts suitable for the "${selectedModel}" model. You must also generate a complementary negative prompt.

Key objectives:
- **Creativity and Detail**: Elaborate on the user's concept with vivid, specific, and evocative details.
- **Structured Output**: Populate all fields in the provided JSON schema. Do not leave any array empty.
- **Model Specificity**: The generated prompt syntax and style should be optimal for the "${selectedModel}" model.
- **Negative Prompt**: Create a generic but effective negative prompt to avoid common image generation issues.
- **Follow User Constraints**: Adhere strictly to all character, style, and content filters provided.`;

    switch (characterSettings.gender) {
        case 'male':
            instruction += `\n- **Gender Constraint**: All individuals depicted in the scene MUST be male. Do not include any other genders.`;
            break;
        case 'female':
            instruction += `\n- **Gender Constraint**: All individuals depicted in the scene MUST be female. Do not include any other genders.`;
            break;
        case 'mixed':
            instruction += `\n- **Gender Constraint**: The scene MUST include both male and female individuals.`;
            break;
    }
    
    if (characterSettings.age !== 'any') {
        instruction += `\n- **Age Constraint**: The main subject's age MUST be in the '${characterSettings.age}' range.`;
    }
    
    if (characterSettings.bodyType !== 'any' && (characterSettings.gender === 'male' || characterSettings.gender === 'female')) {
        instruction += `\n- **Body Type Constraint**: ${getBodyTypeDescription(characterSettings.gender, characterSettings.bodyType)}`;
    }

    if (characterSettings.ethnicity !== 'any') instruction += `\n- **Ethnicity Constraint**: ${getEthnicityDescription(characterSettings.ethnicity)}`;
    if (characterSettings.height !== 'any') instruction += `\n- **Height Constraint**: ${getHeightDescription(characterSettings.height)}`;

    // Overlays
    if (characterSettings.overlays?.furry) instruction += `\n- **Overlay Constraint**: include subtle anthropomorphic animal traits (ears, tail) while keeping a human physique (no full-animal).`;
    if (characterSettings.overlays?.monster) instruction += `\n- **Overlay Constraint**: include demonic/monster features (e.g., horns, fangs) while maintaining human anatomy.`;
    if (characterSettings.overlays?.sciFi) instruction += `\n- **Overlay Constraint**: include futuristic sci‑fi elements (technology, cybernetic augmentations, neon lighting).`;
    if (characterSettings.gender === 'female') {
        if (characterSettings.breastSize !== 'any') instruction += `\n- **Breast Size Constraint**: ${getBreastSizeDescription(characterSettings.breastSize)}`;
        if (characterSettings.hipsSize !== 'any') instruction += `\n- **Hips Size Constraint**: ${getHipsSizeDescription(characterSettings.hipsSize)}`;
        if (characterSettings.buttSize !== 'any') instruction += `\n- **Butt Size Constraint**: ${getButtSizeDescription(characterSettings.buttSize)}`;
    }

    if (characterSettings.gender === 'futanari') {
        // Futanari: Female attributes + penis size only
        if (characterSettings.breastSize !== 'any') instruction += `\n- **Breast Size Constraint**: ${getBreastSizeDescription(characterSettings.breastSize)}`;
        if (characterSettings.hipsSize !== 'any') instruction += `\n- **Hips Size Constraint**: ${getHipsSizeDescription(characterSettings.hipsSize)}`;
        if (characterSettings.buttSize !== 'any') instruction += `\n- **Butt Size Constraint**: ${getButtSizeDescription(characterSettings.buttSize)}`;
        if (characterSettings.penisSize !== 'any' && (nsfwSettings.mode === 'nsfw' || nsfwSettings.mode === 'hardcore')) {
             instruction += `\n- **Penis Size Constraint**: ${getPenisSizeDescription(characterSettings.penisSize)}`;
        }
    }

    if (characterSettings.gender === 'male') {
        if (characterSettings.bodyType !== 'any') instruction += `\n- Body: ${getBodyTypeDescription('male', characterSettings.bodyType)}`;
        if (characterSettings.penisSize !== 'any') instruction += `\n- ${getPenisSizeDescription(characterSettings.penisSize)}`;
        if (characterSettings.muscleDefinition !== 'any') instruction += `\n- ${getMuscleDefinitionDescription(characterSettings.muscleDefinition)}`;
        if (characterSettings.facialHair !== 'any') instruction += `\n- ${getFacialHairDescription(characterSettings.facialHair)}`;
    }

    instruction += `\n- **Style Constraint**: The overall style MUST be '${styleFilter.main}' with a '${styleFilter.sub}' sub-style.`;
    if (styleFilter.main === 'realistic') {
        instruction += ` The prompt must describe a scene as if it were a real photograph. Absolutely AVOID any terms related to anime, cartoons, illustrations, paintings, digital art, or 3D renders. Prioritize authenticity.`;
        
        switch (styleFilter.sub) {
            case 'film photography':
                instruction += ` The 'film photography' sub-style requires authentic, analog aesthetics. Focus on film grain, natural lighting, and the characteristic look of traditional photography.`;
                break;
            case 'webcam':
                instruction += ` The 'webcam' sub-style implies lower quality, casual photography with typical webcam characteristics like softer focus and basic lighting.`;
                break;
            case 'spycam':
                instruction += ` The 'spycam' sub-style suggests hidden camera aesthetics with candid, unposed subjects and often grainy or low-light conditions.`;
                break;
            case 'cctv':
                instruction += ` The 'cctv' sub-style implies security camera footage with wide angles, harsh lighting, and surveillance camera characteristics.`;
                break;
            case 'smartphone':
                instruction += ` The 'smartphone' sub-style suggests mobile phone photography with typical smartphone camera characteristics and casual composition.`;
                break;
            case 'polaroid':
                instruction += ` The 'polaroid' sub-style requires instant camera aesthetics with characteristic borders, vintage colors, and nostalgic feel.`;
                break;
            case 'analog':
                instruction += ` The 'analog' sub-style emphasizes traditional film photography with authentic grain, natural colors, and classic photographic techniques.`;
                break;
            case 'editorial':
                instruction += ` The 'editorial' sub-style implies professional magazine-quality photography with polished composition and lighting.`;
                break;
            case 'portrait studio':
                instruction += ` The 'portrait studio' sub-style suggests professional studio photography with controlled lighting and formal composition.`;
                break;
            case 'street photography':
                instruction += ` The 'street photography' sub-style emphasizes candid urban scenes with natural lighting and documentary-style composition.`;
                break;
            case 'fashion editorial':
                instruction += ` The 'fashion editorial' sub-style implies high-fashion photography with dramatic lighting and artistic composition.`;
                break;
        }
    } else { // anime
        instruction += ' For anime prompts, incorporate styles from famous artists or studios, and use anime-specific terminology (e.g., "dynamic perspective", "cell shading").';
    }

    switch (nsfwSettings.mode) {
        case 'off':
            instruction += `\n- **Content Rule**: Generate SAFE FOR WORK (SFW) content ONLY. Absolutely no nudity, sexually suggestive themes, or violence.`;
            break;
        case 'nsfw':
            instruction += `\n- **Content Rule**: Generate NSFW content. The content should be ${getNsfwIntensityDescription(nsfwSettings.nsfwLevel)} The intensity should be around ${nsfwSettings.nsfwLevel}/10.`;
            break;
        case 'hardcore':
            instruction += `\n- **Content Rule**: Generate explicit hardcore content. The content should be ${getHardcoreIntensityDescription(nsfwSettings.hardcoreLevel)} The intensity should be around ${nsfwSettings.hardcoreLevel}/10.`;
            break;
    }

// Creative scope: default balanced imaginative allowance
instruction += '\n- Creative scope: you MAY introduce tasteful imaginative elements (fantasy/sci-fi/surreal) and unexpected but coherent details, if they enrich the scene.';

    switch (characterSettings.gender) {
        case 'male':
            instruction += `\n- Gender constraint: all depicted individuals MUST be male.`;
            break;
        case 'female':
            instruction += `\n- Gender constraint: all depicted individuals MUST be female.`;
            break;
        case 'mixed':
            instruction += `\n- Gender constraint: include both male and female individuals.`;
            break;
    }

    if (characterSettings.age && characterSettings.age !== 'any') instruction += `\n- Age: main subject age in '${characterSettings.age}'.`;

    if (characterSettings.bodyType && characterSettings.bodyType !== 'any' && (characterSettings.gender === 'male' || characterSettings.gender === 'female')) {
        instruction += `\n- Body type: ${getBodyTypeDescription(characterSettings.gender, characterSettings.bodyType)}`;
    }
    if (characterSettings.ethnicity && characterSettings.ethnicity !== 'any') instruction += `\n- Ethnicity: ${getEthnicityDescription(characterSettings.ethnicity)}`;
    if (characterSettings.height && characterSettings.height !== 'any') instruction += `\n- Height: ${getHeightDescription(characterSettings.height)}`;

    if (characterSettings.gender === 'female') {
        if (characterSettings.breastSize && characterSettings.breastSize !== 'any') instruction += `\n- ${getBreastSizeDescription(characterSettings.breastSize)}`;
        if (characterSettings.hipsSize && characterSettings.hipsSize !== 'any') instruction += `\n- ${getHipsSizeDescription(characterSettings.hipsSize)}`;
        if (characterSettings.buttSize && characterSettings.buttSize !== 'any') instruction += `\n- ${getButtSizeDescription(characterSettings.buttSize)}`;
    }

    if (characterSettings.gender === 'futanari') {
        // Futanari: Female attributes + penis size only
        if (characterSettings.breastSize && characterSettings.breastSize !== 'any') instruction += `\n- ${getBreastSizeDescription(characterSettings.breastSize)}`;
        if (characterSettings.hipsSize && characterSettings.hipsSize !== 'any') instruction += `\n- ${getHipsSizeDescription(characterSettings.hipsSize)}`;
        if (characterSettings.buttSize && characterSettings.buttSize !== 'any') instruction += `\n- ${getButtSizeDescription(characterSettings.buttSize)}`;
        if (characterSettings.penisSize && characterSettings.penisSize !== 'any' && (nsfwSettings.mode === 'nsfw' || nsfwSettings.mode === 'hardcore')) instruction += `\n- ${getPenisSizeDescription(characterSettings.penisSize)}`;
    }

    if (characterSettings.gender === 'male') {
        if (characterSettings.muscleDefinition && characterSettings.muscleDefinition !== 'any') instruction += `\n- ${getMuscleDefinitionDescription(characterSettings.muscleDefinition)}`;
        if (characterSettings.facialHair && characterSettings.facialHair !== 'any') instruction += `\n- ${getFacialHairDescription(characterSettings.facialHair)}`;
        if (characterSettings.penisSize && characterSettings.penisSize !== 'any' && (nsfwSettings.mode === 'nsfw' || nsfwSettings.mode === 'hardcore')) instruction += `\n- ${getPenisSizeDescription(characterSettings.penisSize)}`;
    }

    switch (nsfwSettings.mode) {
        case 'off':
            instruction += `\n- Content rule: MUST be SFW.`;
            break;
        case 'nsfw':
            instruction += `\n- NSFW level ${nsfwSettings.nsfwLevel}/10: ${getNsfwIntensityDescription(nsfwSettings.nsfwLevel)}`;
            break;
        case 'hardcore':
            instruction += `\n- Hardcore level ${nsfwSettings.hardcoreLevel}/10: ${getHardcoreIntensityDescription(nsfwSettings.hardcoreLevel)}`;
            break;
    }

    instruction += `\n- Style guideline: subtly evoke '${styleFilter.main}'${styleFilter.sub && styleFilter.sub !== 'any' ? `/${styleFilter.sub}` : ''} through vocabulary and lighting; do not name styles as tags.`;

    return instruction;
};

// FIX: Implement the generatePromptVariations function to generate structured prompts using the Gemini API.
export const generatePromptVariations = async (
    apiKey: string,
    userInput: string,
    numVariations: number,
    nsfwSettings: NsfwSettingsState,
    styleFilter: StyleFilter,
    selectedModel: string,
    characterSettings: CharacterSettingsState
): Promise<PromptVariationsResult> => {
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = buildSystemInstructionForVariations(numVariations, nsfwSettings, styleFilter, selectedModel, characterSettings);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userInput,
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: variationsSchema
        }
    });

    const jsonText = getResponseTextOrThrow(response, 'prompt variation generation');
    const cleanedJsonText = cleanModelText(jsonText);
    try {
        return JSON.parse(cleanedJsonText);
    } catch (e) {
        console.error("Failed to parse Gemini JSON response:", cleanedJsonText);
        throw new Error("The AI returned an invalid JSON response. Please try again.");
    }
};


const buildSystemInstructionForEnhancement = (
    nsfwSettings: NsfwSettingsState,
    styleFilter: StyleFilter,
    characterSettings: CharacterSettingsState
): string => {
    // Enhance -> enrich into a vivid, writerly paragraph (no tags)
    let instruction = `You are a creative visual scene writer. Rewrite and enrich the user's short description into ONE short paragraph of 3–6 sentences (about 80–180 words).

Output rules (STRICT):
- Output PLAIN TEXT only — no JSON, no lists, no headings, no roles, no labels, no code blocks.
- Do NOT output comma-separated tags; write natural prose with flowing sentences.
- Add imaginative, story-like details: a sense of moment, mood, and subtle narrative tension; use dynamic verbs and sensory cues (light, texture, sound, atmosphere).
- Focus on the visual scene: subject, pose/action, setting/background, lighting/mood, atmosphere, and composition hints (framing, distance) when appropriate.
- Maintain coherence with the user's input and constraints. Do not contradict them.
- Avoid style tag names or parameter-like tokens (e.g., (best quality), --ar). Speak naturally.
- End your output with <<EOD>> and nothing after it.`;

    const enhancementFocus: string[] = [];
    if (nsfwSettings.enhancePerson) enhancementFocus.push('the person/subject and their attributes');
    if (nsfwSettings.enhancePose) enhancementFocus.push('their pose and action');
    if (nsfwSettings.enhanceLocation) enhancementFocus.push('the location and background');
    if (enhancementFocus.length > 0) instruction += `\n- Focus areas: ${enhancementFocus.join(', ')}.`;

    // Remove imaginationRule, default to balanced creative scope
    instruction += '\n- Creative scope: you MAY introduce tasteful imaginative elements (fantasy/sci-fi/surreal) and unexpected but coherent details, if they enrich the scene.';

    switch (characterSettings.gender) {
        case 'male':
            instruction += `\n- Gender constraint: all depicted individuals MUST be male.`;
            break;
        case 'female':
            instruction += `\n- Gender constraint: all depicted individuals MUST be female.`;
            break;
        case 'mixed':
            instruction += `\n- Gender constraint: include both male and female individuals.`;
            break;
    }

    if (characterSettings.age && characterSettings.age !== 'any') instruction += `\n- Age: main subject age in '${characterSettings.age}'.`;

    if (characterSettings.bodyType && characterSettings.bodyType !== 'any' && (characterSettings.gender === 'male' || characterSettings.gender === 'female')) {
        instruction += `\n- Body type: ${getBodyTypeDescription(characterSettings.gender, characterSettings.bodyType)}`;
    }
    if (characterSettings.ethnicity && characterSettings.ethnicity !== 'any') instruction += `\n- Ethnicity: ${getEthnicityDescription(characterSettings.ethnicity)}`;
    if (characterSettings.height && characterSettings.height !== 'any') instruction += `\n- Height: ${getHeightDescription(characterSettings.height)}`;

    if (characterSettings.gender === 'female') {
        if (characterSettings.breastSize && characterSettings.breastSize !== 'any') instruction += `\n- ${getBreastSizeDescription(characterSettings.breastSize)}`;
        if (characterSettings.hipsSize && characterSettings.hipsSize !== 'any') instruction += `\n- ${getHipsSizeDescription(characterSettings.hipsSize)}`;
        if (characterSettings.buttSize && characterSettings.buttSize !== 'any') instruction += `\n- ${getButtSizeDescription(characterSettings.buttSize)}`;
    }

    if (characterSettings.gender === 'futanari') {
        // Futanari: Female attributes + penis size only
        if (characterSettings.breastSize && characterSettings.breastSize !== 'any') instruction += `\n- ${getBreastSizeDescription(characterSettings.breastSize)}`;
        if (characterSettings.hipsSize && characterSettings.hipsSize !== 'any') instruction += `\n- ${getHipsSizeDescription(characterSettings.hipsSize)}`;
        if (characterSettings.buttSize && characterSettings.buttSize !== 'any') instruction += `\n- ${getButtSizeDescription(characterSettings.buttSize)}`;
        if (characterSettings.penisSize && characterSettings.penisSize !== 'any' && (nsfwSettings.mode === 'nsfw' || nsfwSettings.mode === 'hardcore')) instruction += `\n- ${getPenisSizeDescription(characterSettings.penisSize)}`;
    }

    if (characterSettings.gender === 'male') {
        if (characterSettings.muscleDefinition && characterSettings.muscleDefinition !== 'any') instruction += `\n- ${getMuscleDefinitionDescription(characterSettings.muscleDefinition)}`;
        if (characterSettings.facialHair && characterSettings.facialHair !== 'any') instruction += `\n- ${getFacialHairDescription(characterSettings.facialHair)}`;
        if (characterSettings.penisSize && characterSettings.penisSize !== 'any' && (nsfwSettings.mode === 'nsfw' || nsfwSettings.mode === 'hardcore')) instruction += `\n- ${getPenisSizeDescription(characterSettings.penisSize)}`;
    }

    switch (nsfwSettings.mode) {
        case 'off':
            instruction += `\n- Content rule: MUST be SFW.`;
            break;
        case 'nsfw':
            instruction += `\n- NSFW level ${nsfwSettings.nsfwLevel}/10: ${getNsfwIntensityDescription(nsfwSettings.nsfwLevel)}`;
            break;
        case 'hardcore':
            instruction += `\n- Hardcore level ${nsfwSettings.hardcoreLevel}/10: ${getHardcoreIntensityDescription(nsfwSettings.hardcoreLevel)}`;
            break;
    }

    instruction += `\n- Style guideline: subtly evoke '${styleFilter.main}'${styleFilter.sub && styleFilter.sub !== 'any' ? `/${styleFilter.sub}` : ''} through vocabulary and lighting; do not name styles as tags.`;

    return instruction;
};

// FIX: Implement the enhanceDescription function to enrich user input using the Gemini API.
export const enhanceDescription = async (
    apiKey: string,
    userInput: string,
    nsfwSettings: NsfwSettingsState,
    styleFilter: StyleFilter,
    characterSettings: CharacterSettingsState
): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = buildSystemInstructionForEnhancement(nsfwSettings, styleFilter, characterSettings);

    // Add a small novelty seed so repeated Enhance clicks add new, varied details
    const noveltyPool = [
        'a faint breeze that moves hair or clothing',
        'smell cues like rain-soaked asphalt, sea salt, fresh pine, or warm spices',
        'micro-actions: adjusting a strap, brushing hair back, fingertips grazing a surface',
        'texture cues: weathered wood, cracked paint, misted glass, wet cobblestones, velvet, denim',
        'light behavior: rim light, backlight glow, dappled leaves, neon spill, candle flicker',
        'foreground elements framing the subject (doorframe, foliage, window edge)',
        'environmental sounds: distant traffic, soft chatter, humming neon, rustling leaves',
        'weather shifts: light drizzle, drifting snow, heat haze, drifting fog',
        'camera hints: low-angle, over-the-shoulder, soft focus background, shallow depth of field',
        'props: steaming mug, folded jacket, open book, umbrella, earbuds, water bottle'
    ];
    const pick = (n: number) => {
        const pool = [...noveltyPool];
        const out: string[] = [];
        while (out.length < n && pool.length) {
            const i = Math.floor(Math.random() * pool.length);
            out.push(pool.splice(i, 1)[0]);
        }
        return out;
    };
    const seedItems = pick(3);
    const seedLine = `Incorporate at least two of these if coherent: ${seedItems.join(', ')}.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Enhance this description into ONE short paragraph of 3–6 sentences (about 80–180 words). If it is already a full paragraph, build upon it by adding 2–4 fresh, concrete details and vary composition, lighting, or background; avoid repeating previous phrasing. ${seedLine} End with <<EOD>>.\n\n${userInput}`,
        config: {
            systemInstruction,
            responseMimeType: 'text/plain'
        }
    });

    const text = getResponseTextOrThrow(response, 'description enhancement');
    let cleaned = cleanModelText(text).replace(/<<EOD>>\s*$/i, '').trim();

    // Ensure terminal punctuation without enforcing a hard sentence limit
    if (!/[.!?]$/.test(cleaned) && cleaned.length > 0) cleaned += '.';

    return cleaned;
};


export async function generateRandomDescription(
  apiKey: string,
  nsfwSettings: NsfwSettingsState,
  styleFilter: StyleFilter,
  characterSettings: CharacterSettingsState,
  selectedPresets: string[]
): Promise<string> {
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
    fixedConstraintsLines.push(`Age: ${toAgePhrase(characterSettings.age as AgeRange)}`);
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
    const hairColorDerived = deriveHairColor(selectedPresets);
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

  console.log('[geminiService.generateRandomDescription] fixedConstraintsLines=', fixedConstraintsLines);
  console.log('[geminiService.generateRandomDescription] fixedConstraintsBlock=\n' + fixedConstraintsBlock);
  console.log('[geminiService.generateRandomDescription] nsfwSettings.mode=', nsfwSettings.mode, 'nsfwLevel=', nsfwSettings.nsfwLevel, 'hardcoreLevel=', nsfwSettings.hardcoreLevel, 'selectedPresets=', selectedPresets);

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
'No Numerical Body Measurements: You are FORBIDDEN from using numbers, measurements, or specific sizes to describe the character\'s body (e.g., "5\'7\" tall", "waist 24 inches", "32B"). Use ONLY the qualitative descriptions provided in the constraints (e.g., "tall", "slender build", "large breasts", "curvy hips").',
    '',
    'STRICT OUTPUT STRUCTURE: Generate a single paragraph. Describe the character\'s attributes in this precise order:',
    'Start with core attributes like age, height, and build.',
    'Then, hair color and style.',
    'Then, facial features and eye color.',
    'Then, specific body measurements from the constraints (if provided).',
    'Then, clothing.',
    'Finally, the location, pose, and lighting.',
    '',
    'CRUCIAL RULE: Your output must be a single paragraph of factual sentences. It must not be a list and it must not contain any of the forbidden subjective words.',
    '',
    'Now, generate a character description in English following all these rules.'
  ].filter(Boolean).join('\n');

  // Use existing GoogleGenAI pattern
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: userContent,
    config: {
      systemInstruction,
      responseMimeType: 'text/plain'
    }
  });

  const text = getResponseTextOrThrow(response, 'random description generation');
  let cleaned = cleanModelText(text).trim();
  cleaned = normalizeNarrative(cleaned);
  if (cleaned && cleaned.length > 5) {
    return cleaned;
  }
  return 'The description focuses on the character and follows the required factual structure.';
}



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
    case 'clean-shaven': return 'clean‑shaven';
    case 'stubble': return 'stubble';
    case 'goatee': return 'a goatee';
    case 'mustache': return 'a mustache';
    case 'full beard': return 'a full beard';
    default: return String(hair);
  }
};

// Hair color presets derived from HairPresets component (lowercased)
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

const deriveHairColor = (presets: string[]): string | null => {
  if (!Array.isArray(presets)) return null;
  for (const p of presets) {
    const key = String(p).trim().toLowerCase();
    if (HAIR_COLOR_PRESETS.has(key)) {
      return toTitleCase(key);
    }
  }
  return null;
};

async function generateRandomDescription_duplicate(
  apiKey: string,
  nsfwSettings: NsfwSettingsState,
  styleFilter: StyleFilter,
  characterSettings: CharacterSettingsState,
  selectedPresets: string[]
): Promise<string> {
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
    const hairColorDerived = deriveHairColor(selectedPresets);
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

  console.log('[geminiService.generateRandomDescription/dup] fixedConstraintsLines=', fixedConstraintsLines);
  console.log('[geminiService.generateRandomDescription/dup] fixedConstraintsBlock=\n' + fixedConstraintsBlock);
  console.log('[geminiService.generateRandomDescription/dup] nsfwSettings.mode=', nsfwSettings.mode, 'nsfwLevel=', nsfwSettings.nsfwLevel, 'hardcoreLevel=', nsfwSettings.hardcoreLevel, 'selectedPresets=', selectedPresets);

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
    '',
    'STRICT OUTPUT STRUCTURE: Generate a single paragraph. Describe the character\'s attributes in this precise order:',
    'Start with core attributes like age, height, and build.',
    'Then, hair color and style.',
    'Then, facial features and eye color.',
    'Then, specific body measurements from the constraints (if provided).',
    'Then, clothing.',
    'Finally, the location, pose, and lighting.',
    '',
    'CRUCIAL RULE: Your output must be a single paragraph of factual sentences. It must not be a list and it must not contain any of the forbidden subjective words.',
    '',
    'Now, generate a character description in English following all these rules.'
  ].filter(Boolean).join('\n');

  // Use existing GoogleGenAI pattern
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: userContent,
    config: {
      systemInstruction,
      responseMimeType: 'text/plain'
    }
  });

  const text = getResponseTextOrThrow(response, 'random description generation');
  let cleaned = cleanModelText(text).trim();
  cleaned = normalizeNarrative(cleaned);
  if (cleaned && cleaned.length > 5) {
    return cleaned;
  }
  return 'The description focuses on the character and follows the required factual structure.';
}



export const generateImage = async (apiKey: string, prompt: string, resolution: '1k' | '2k', aspectRatio: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: aspectRatio,
          // The 'resolution' parameter is currently ignored as there is no direct 'outputResolution' config.
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image?.imageBytes) {
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/png;base64,${base64ImageBytes}`;
    }

    // Enhanced error handling for better user feedback
    let errorMessage = "Image generation failed. The model returned an empty response. This is often due to the prompt being rejected by the safety filter.";
    
    // The GenerateImagesResponse type from the SDK doesn't explicitly include promptFeedback, 
    // but we check for it dynamically to provide better error details if they exist in the raw response.
    const anyResponse = response as any;
    const promptFeedback = anyResponse.promptFeedback;

    if (promptFeedback?.blockReason) {
        errorMessage = `Image generation blocked by content policy. Reason: ${promptFeedback.blockReason}.`;
        
        const harmfulCategories = promptFeedback.safetyRatings
            ?.filter((rating: any) => rating.probability !== 'NEGLIGIBLE' && rating.probability !== 'LOW')
            .map((rating: any) => rating.category.replace('HARM_CATEGORY_', ''))
            .join(', ');
        
        if (harmfulCategories) {
            errorMessage += ` Flagged categories: ${harmfulCategories}.`;
        }
        errorMessage += " Please adjust your prompt or content settings and try again."
    }

    console.error("Imagen API error:", JSON.stringify(response, null, 2));
    throw new Error(errorMessage);
};