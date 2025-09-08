

// FIX: Implemented missing AI service functions to resolve compilation errors.
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import type { StructuredPrompt, NsfwSettingsState, StyleFilter, CharacterSettingsState, Gender, FemaleBodyType, MaleBodyType, Ethnicity, HeightRange, BreastSize, HipsSize, ButtSize, PenisSize, MuscleDefinition, FacialHair } from '../types';

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

const getNsfwIntensityDescription = (level: number): string => {
    if (level <= 2) return "artistically suggestive with tasteful nudity.";
    if (level <= 4) return "clearly suggestive with some explicit nudity and sensual themes.";
    if (level <= 6) return "moderately explicit with a focus on detailed anatomy and provocative situations.";
    if (level <= 8) return "highly explicit with detailed anatomy and strong erotic themes.";
    return "extremely explicit and provocative, intended for mature audiences only.";
};

const getHardcoreIntensityDescription = (level: number): string => {
    if (level <= 2) return "depicting a solo person in an explicit, intimate context.";
    if (level <= 4) return "depicting two people engaged in an intimate, explicit act.";
    if (level <= 6) return "depicting a group of people in a highly explicit, interactive scenario.";
    if (level <= 8) return "depicting unconventional and extreme explicit scenarios involving themes of power dynamics and specific fetishes.";
    return "depicting the most extreme and taboo explicit content, exploring the furthest limits of eroticism with no restrictions.";
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
    const description = height.replace(/\s*\(.+\)/, '');
    return `The subject's height MUST be in the '${description}' range. For reference: ${height}. This is a strict physical trait.`;
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


const getResponseTextOrThrow = (response: GenerateContentResponse, context: string): string => {
    const textOutput = response.text;

    if (typeof textOutput === 'string' && textOutput.trim()) {
        return textOutput.trim();
    }
    
    let errorMessage = `The AI returned an empty response during ${context}.`;
    const blockReason = response.promptFeedback?.blockReason;
    
    if (blockReason) {
        errorMessage = `Request blocked by content policy during ${context}. Reason: ${blockReason}.`;
        const harmfulCategories = response.promptFeedback?.safetyRatings
            ?.filter(rating => rating.probability !== 'NEGLIGIBLE' && rating.probability !== 'LOW')
            .map(rating => rating.category.replace('HARM_CATEGORY_', ''))
            .join(', ');
        
        if (harmfulCategories) {
            errorMessage += ` Categories flagged: ${harmfulCategories}.`;
        }
    } else {
        errorMessage += ` This may be due to the content policy. Please adjust your prompt and try again.`;
    }
    
    console.error(`Gemini API error during ${context}:`, JSON.stringify(response, null, 2));
    throw new Error(errorMessage);
};


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

    if (characterSettings.gender === 'female') {
        if (characterSettings.breastSize !== 'any') instruction += `\n- **Breast Size Constraint**: ${getBreastSizeDescription(characterSettings.breastSize)}`;
        if (characterSettings.hipsSize !== 'any') instruction += `\n- **Hips Size Constraint**: ${getHipsSizeDescription(characterSettings.hipsSize)}`;
        if (characterSettings.buttSize !== 'any') instruction += `\n- **Butt Size Constraint**: ${getButtSizeDescription(characterSettings.buttSize)}`;
    }

    if (characterSettings.gender === 'male') {
        if (characterSettings.muscleDefinition !== 'any') instruction += `\n- **Muscle Definition Constraint**: ${getMuscleDefinitionDescription(characterSettings.muscleDefinition)}`;
        if (characterSettings.facialHair !== 'any') instruction += `\n- **Facial Hair Constraint**: ${getFacialHairDescription(characterSettings.facialHair)}`;
        if (characterSettings.penisSize !== 'any' && (nsfwSettings.mode === 'nsfw' || nsfwSettings.mode === 'hardcore')) {
             instruction += `\n- **Penis Size Constraint**: ${getPenisSizeDescription(characterSettings.penisSize)}`;
        }
    }

    instruction += `\n- **Style Constraint**: The overall style MUST be '${styleFilter.main}' with a '${styleFilter.sub}' sub-style.`;
    if (styleFilter.main === 'realistic') {
        instruction += ` The prompt must describe a scene as if it were a real photograph. Absolutely AVOID any terms related to anime, cartoons, illustrations, paintings, digital art, or 3D renders. Prioritize authenticity.`;
        
        switch (styleFilter.sub) {
            case 'amateur':
                instruction += ` The 'amateur' sub-style requires a candid, unposed, and natural look. AVOID descriptions of perfect compositions, professional studio lighting, or overly idealized subjects. The scene should feel spontaneous and authentic, like a photo taken by a friend.`;
                break;
            case 'professional':
                instruction += ` The 'professional' sub-style implies a high-quality, well-composed shot. Focus on photographic details like camera models, lens types (e.g., 85mm f/1.8), and specific lighting setups (e.g., three-point lighting).`;
                break;
            case 'flash':
                instruction += ` The 'flash' sub-style implies direct, on-camera flash. Describe harsh shadows, bright highlights, and a 'paparazzi', 'nightclub', or 'disposable camera' feel.`;
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

    if (nsfwSettings.aiImagination) {
        instruction += `\n- **AI Imagination**: You have creative freedom to introduce new elements, themes, and details beyond the user's initial description to create more unique and surprising results.`;
    } else {
        instruction += `\n- **AI Imagination**: Stick closely to the user's original concept. Do not introduce radically new ideas; only enhance the existing ones.`;
    }

    instruction += "\n\nFinally, ensure the output is a single, valid JSON object that strictly adheres to the provided schema. Do not add any commentary before or after the JSON."

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
): Promise<{ structuredPrompts: StructuredPrompt[], negativePrompt: string }> => {
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
    try {
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Failed to parse Gemini JSON response:", jsonText);
        throw new Error("The AI returned an invalid JSON response. Please try again.");
    }
};


const buildSystemInstructionForEnhancement = (
    nsfwSettings: NsfwSettingsState,
    styleFilter: StyleFilter,
    characterSettings: CharacterSettingsState
): string => {
    let instruction = `You are a creative assistant who enhances user descriptions for text-to-image AI. Your task is to take a simple description and enrich it with more detail, making it more vivid and descriptive.

Key objectives:
- **Enrich, Don't Replace**: Build upon the user's original idea. Add adjectives, specific details, and sensory language. Do not change the core subject.
- **Natural Language**: The output should be a single, coherent, descriptive paragraph. Do not use lists or special formatting.
- **Follow User Constraints**: Adhere strictly to all character, style, and content filters provided.`;

    const enhancementFocus = [];
    if (nsfwSettings.enhancePerson) enhancementFocus.push('the person/subject and their attributes');
    if (nsfwSettings.enhancePose) enhancementFocus.push('their pose and action');
    if (nsfwSettings.enhanceLocation) enhancementFocus.push('the location and background');
    
    if(enhancementFocus.length > 0) {
        instruction += `\n- **Enhancement Focus**: Focus your creativity on improving these aspects: ${enhancementFocus.join(', ')}. Preserve other aspects as the user wrote them.`;
    }

    switch (characterSettings.gender) {
        case 'male':
            instruction += `\n- **Gender Constraint**: All individuals depicted MUST be male. Do not include any other genders.`;
            break;
        case 'female':
            instruction += `\n- **Gender Constraint**: All individuals depicted MUST be female. Do not include any other genders.`;
            break;
        case 'mixed':
            instruction += `\n- **Gender Constraint**: The description MUST feature both male and female individuals.`;
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

    if (characterSettings.gender === 'female') {
        if (characterSettings.breastSize !== 'any') instruction += `\n- **Breast Size Constraint**: ${getBreastSizeDescription(characterSettings.breastSize)}`;
        if (characterSettings.hipsSize !== 'any') instruction += `\n- **Hips Size Constraint**: ${getHipsSizeDescription(characterSettings.hipsSize)}`;
        if (characterSettings.buttSize !== 'any') instruction += `\n- **Butt Size Constraint**: ${getButtSizeDescription(characterSettings.buttSize)}`;
    }

    if (characterSettings.gender === 'male') {
        if (characterSettings.muscleDefinition !== 'any') instruction += `\n- **Muscle Definition Constraint**: ${getMuscleDefinitionDescription(characterSettings.muscleDefinition)}`;
        if (characterSettings.facialHair !== 'any') instruction += `\n- **Facial Hair Constraint**: ${getFacialHairDescription(characterSettings.facialHair)}`;
        if (characterSettings.penisSize !== 'any' && (nsfwSettings.mode === 'nsfw' || nsfwSettings.mode === 'hardcore')) {
             instruction += `\n- **Penis Size Constraint**: ${getPenisSizeDescription(characterSettings.penisSize)}`;
        }
    }


    instruction += `\n- **Style Constraint**: The description should be suitable for a '${styleFilter.main}' style with a '${styleFilter.sub}' sub-style.`;

    switch (nsfwSettings.mode) {
        case 'off':
            instruction += `\n- **Content Rule**: The description MUST be SAFE FOR WORK (SFW).`;
            break;
        case 'nsfw':
            instruction += `\n- **Content Rule**: The description should be suggestive and suitable for NSFW content that is ${getNsfwIntensityDescription(nsfwSettings.nsfwLevel)} The intensity should be around ${nsfwSettings.nsfwLevel}/10.`;
            break;
        case 'hardcore':
            instruction += `\n- **Content Rule**: The description should be explicit and suitable for hardcore content that is ${getHardcoreIntensityDescription(nsfwSettings.hardcoreLevel)} The intensity should be around ${nsfwSettings.hardcoreLevel}/10.`;
            break;
    }

    instruction += "\n\nFinally, respond with only the enhanced text. Do not add any commentary, greetings, or apologies."

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
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Enhance this description: "${userInput}"`,
        config: {
            systemInstruction: systemInstruction,
        }
    });

    return getResponseTextOrThrow(response, 'description enhancement');
};


const buildSystemInstructionForRandom = (
    nsfwSettings: NsfwSettingsState,
    styleFilter: StyleFilter,
    characterSettings: CharacterSettingsState,
    selectedPresets: string[]
): string => {
    let instruction = `You are a creative idea generator for text-to-image AI. Your task is to generate a random, interesting, and descriptive prompt for an image based on a set of constraints.

Key objectives:
- **Be Creative**: Come up with an original and compelling scene.
- **Natural Language**: The output should be a single, coherent, descriptive paragraph.
- **Follow User Constraints**: Adhere strictly to all character, style, and content filters provided.`;

    instruction += `\n- **Character Constraints**:`;
    
    let genderInstructionPart = 'You have creative freedom to choose any gender(s).';
    switch (characterSettings.gender) {
        case 'male':
            genderInstructionPart = 'All individuals in the scene MUST be male.';
            break;
        case 'female':
            genderInstructionPart = 'All individuals in the scene MUST be female.';
            break;
        case 'mixed':
            genderInstructionPart = 'The scene MUST include both male and female individuals.';
            break;
    }
    instruction += `\n  - Gender: ${genderInstructionPart}`;
    
    if (characterSettings.age === 'any') {
        instruction += `\n  - Age: You can choose any age.`;
    } else {
        instruction += `\n  - Age: The main subject's age MUST be in the '${characterSettings.age}' range.`;
    }

    if (characterSettings.bodyType !== 'any' && (characterSettings.gender === 'male' || characterSettings.gender === 'female')) {
        instruction += `\n- **Body Type Constraint**: ${getBodyTypeDescription(characterSettings.gender, characterSettings.bodyType)}`;
    }

    if (characterSettings.ethnicity !== 'any') instruction += `\n- **Ethnicity Constraint**: ${getEthnicityDescription(characterSettings.ethnicity)}`;
    if (characterSettings.height !== 'any') instruction += `\n- **Height Constraint**: ${getHeightDescription(characterSettings.height)}`;

    if (characterSettings.gender === 'female') {
        if (characterSettings.breastSize !== 'any') instruction += `\n- **Breast Size Constraint**: ${getBreastSizeDescription(characterSettings.breastSize)}`;
        if (characterSettings.hipsSize !== 'any') instruction += `\n- **Hips Size Constraint**: ${getHipsSizeDescription(characterSettings.hipsSize)}`;
        if (characterSettings.buttSize !== 'any') instruction += `\n- **Butt Size Constraint**: ${getButtSizeDescription(characterSettings.buttSize)}`;
    }

    if (characterSettings.gender === 'male') {
        if (characterSettings.muscleDefinition !== 'any') instruction += `\n- **Muscle Definition Constraint**: ${getMuscleDefinitionDescription(characterSettings.muscleDefinition)}`;
        if (characterSettings.facialHair !== 'any') instruction += `\n- **Facial Hair Constraint**: ${getFacialHairDescription(characterSettings.facialHair)}`;
        if (characterSettings.penisSize !== 'any' && (nsfwSettings.mode === 'nsfw' || nsfwSettings.mode === 'hardcore')) {
             instruction += `\n- **Penis Size Constraint**: ${getPenisSizeDescription(characterSettings.penisSize)}`;
        }
    }
    
    if (selectedPresets && selectedPresets.length > 0) {
        instruction += `\n\n- **Mandatory Keywords**: The generated description MUST incorporate the following themes, items, or concepts: "${selectedPresets.join(', ')}". Integrate them naturally into the scene.`;
    }


    instruction += `\n- **Style Constraint**: The description should be suitable for a '${styleFilter.main}' style with a '${styleFilter.sub}' sub-style.`;
    if (styleFilter.main === 'realistic') {
        instruction += ' For realistic prompts, describe photographic details like camera angles, lens types, and lighting.';
    } else {
        instruction += ' For anime prompts, describe styles from famous artists or studios, and use anime-specific terminology.';
    }

    switch (nsfwSettings.mode) {
        case 'off':
            instruction += `\n- **Content Rule**: The description MUST be SAFE FOR WORK (SFW).`;
            break;
        case 'nsfw':
            instruction += `\n- **Content Rule**: The description should be suggestive and suitable for NSFW content that is ${getNsfwIntensityDescription(nsfwSettings.nsfwLevel)} The intensity should be around ${nsfwSettings.nsfwLevel}/10.`;
            break;
        case 'hardcore':
            instruction += `\n- **Content Rule**: The description should be explicit and suitable for hardcore content that is ${getHardcoreIntensityDescription(nsfwSettings.hardcoreLevel)} The intensity should be around ${nsfwSettings.hardcoreLevel}/10.`;
            break;
    }

    instruction += "\n\nFinally, respond with only the generated description. Do not add any commentary, greetings, or apologies."

    return instruction;
};

// FIX: Implement the generateRandomDescription function to generate a random prompt using the Gemini API.
export const generateRandomDescription = async (
    apiKey: string,
    nsfwSettings: NsfwSettingsState,
    styleFilter: StyleFilter,
    characterSettings: CharacterSettingsState,
    selectedPresets: string[]
): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey });
    
    const systemInstruction = buildSystemInstructionForRandom(nsfwSettings, styleFilter, characterSettings, selectedPresets);
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: "Generate a random, creative description for an image.",
        config: {
            systemInstruction: systemInstruction,
        }
    });

    return getResponseTextOrThrow(response, 'random description generation');
};

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