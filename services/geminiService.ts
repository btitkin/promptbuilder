import { GoogleGenAI, Type } from "@google/genai";
import type { StructuredPrompt, NsfwSettingsState, StyleFilter } from '../types';

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
            description: 'Physical characteristics of the subject. E.g., "blonde hair", "blue eyes", "big breasts".'
        },
        clothing: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: 'What the subject is wearing. E.g., "red dress", "leather jacket".'
        },
        pose: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: 'The subject\'s posture or position. E.g., "sitting", "standing", "leaning against wall".'
        },
        action: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: 'What the subject is actively doing. E.g., "reading a book", "drinking coffee".'
        },
        location: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: 'The primary setting or place. E.g., "in a park", "on a bench", "at a cafe".'
        },
        background: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: 'Additional elements in the scene. E.g., "trees in background", "cityscape at night".'
        },
        style: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: 'Artistic style or visual qualities. E.g., "photorealistic", "anime style", "impressionism". Preserve user-defined weighting syntax like "(masterpiece:1.2)" or "((best quality))".'
        },
    },
    required: ['subject', 'attributes', 'clothing', 'pose', 'action', 'location', 'background', 'style']
};

const getStyleInstruction = (styleFilter: StyleFilter): string => {
    let instruction = `The user's primary style is '${styleFilter.main}'. The specific sub-style is '${styleFilter.sub}'.\n\n`;
    
    switch (styleFilter.sub) {
        case 'professional':
            instruction += "For the 'Professional' sub-style, describe a high-quality photoshoot. Use terms for professional camera equipment (e.g., 'shot on a Sony A7III', '85mm f/1.4 lens'), studio lighting (e.g., 'softbox lighting', 'rim lighting'), and a polished, commercial aesthetic.";
            break;
        case 'amateur':
            instruction += "For the 'Amateur' sub-style, describe a casual, candid, or found-footage look. Use terms like 'smartphone photo', 'selfie', 'grainy photo', 'candid shot', 'disposable camera aesthetic'.";
            break;
        case 'flash':
            instruction += "For the 'Flash' sub-style, you MUST create a scene lit by a direct, harsh light source, typically at night or in a dark environment. Use phrases like 'on-camera flash', 'direct flash photography', 'nighttime photo', 'paparazzi style', 'harsh shadows', and 'blown-out highlights'. It is critical that you DO NOT use the two words 'flash' and 'camera' directly next to each other.";
            break;
        case 'ghibli':
            instruction += "For the 'Ghibli' sub-style, describe a whimsical, painterly scene. Emphasize beautiful, detailed backgrounds, soft and warm lighting, a nostalgic atmosphere, and characters with gentle expressions. The overall feel should be 'in the style of Studio Ghibli'.";
            break;
        case 'naruto':
            instruction += "For the 'Naruto' sub-style, describe a dynamic, action-oriented scene. Use terms like 'cel shading', 'bold outlines', 'dynamic camera angles', 'speed lines', and themes of ninjas and elemental powers. The overall feel should be 'in the style of Masashi Kishimoto'.";
            break;
        case 'bleach':
            instruction += "For the 'Bleach' sub-style, describe a high-contrast, dramatic scene. Emphasize sharp, clean lines, a darker color palette with stark whites and deep blacks, dramatic poses, and a modern, edgy aesthetic. The overall feel should be 'in the style of Tite Kubo'.";
            break;
    }
    return instruction;
};

export const generatePromptVariations = async (apiKey: string, userInput: string, numVariations: number, nsfwSettings: NsfwSettingsState, styleFilter: StyleFilter, selectedModel: string): Promise<{ structuredPrompts: StructuredPrompt[], negativePrompt: string }> => {
    if (!apiKey) throw new Error("Google Gemini API Key not provided.");
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are an expert prompt engineer for AI image generators. Your task is to analyze the user's text and generate ${numVariations} distinct, creative variations of it, deconstructed into a structured JSON format. The user is generating a prompt for the "${selectedModel}" AI model. You must tailor your output to its specific syntax and style preferences.

In addition to the positive prompts, you will generate a single, comprehensive negative prompt string. This negative prompt should include standard quality-related exclusions (e.g., 'ugly, blurry, bad anatomy, worst quality, low quality') as well as context-specific exclusions based on the user's request. For instance, if the user asks for a 'photograph', the negative prompt should include 'painting, illustration, cartoon'. If the user's prompt is SFW, the negative prompt should include 'nsfw, nudity'.

The user's preferences are:
- Mode: ${nsfwSettings.mode}
- Style Preference: ${styleFilter.main} - ${styleFilter.sub}
- AI Imagination: ${nsfwSettings.aiImagination}
- NSFW Level: ${nsfwSettings.nsfwLevel} (for 'nsfw' mode)
- Hardcore Level: ${nsfwSettings.hardcoreLevel} (for 'hardcore' mode)

Content Toggles:
- Enhance Person: ${nsfwSettings.enhancePerson}
- Enhance Pose: ${nsfwSettings.enhancePose}
- Enhance Location: ${nsfwSettings.enhanceLocation}

You must adhere to these preferences in every variation:
- **Style Instructions**: ${getStyleInstruction(styleFilter)}
- **MidJourney Specialization**: If the selected model is 'MidJourney', generate highly descriptive, artistic, and narrative-style prompts. Focus on cinematic lighting, camera angles, composition, mood, and specific art styles (e.g., 'in the style of Greg Rutkowski'). Avoid using simple tags like '1girl'. The prompt should read like a piece of art direction. For other models that use 'tagged' syntax, use comma-separated keywords.
- **AI Imagination**: If 'AI Imagination' is ON, you have creative freedom. You are encouraged to introduce novel concepts, settings, styles, and details beyond the user's initial description, surprising the user with your creativity. However, this freedom only applies to categories enabled by the 'Enhance' toggles below. If OFF, stick closely to the user's original concept, only adding detail and structure.
- **Content Toggles**: If 'Enhance Person' is false, you MUST preserve the original 'subject', 'attributes', and 'clothing' tags from the user's input as closely as possible. Do not add new details. If 'Enhance Pose' is false, you MUST preserve the original 'action' and 'pose' tags. Do not invent new actions. If 'Enhance Location' is false, you MUST preserve the original 'location' and 'background' tags.
- **NSFW Mode**: If mode is 'nsfw', your task is to focus on **explicit anatomy and nudity**.
  - For 'subject' and 'attributes': Add graphically detailed and explicit anatomical tags. The intensity must correspond to the NSFW Level (1-10). Level 1 is suggestive (e.g., 'large breasts'), while Level 10 uses extremely graphic and vulgar terms for body parts, orifices, and signs of arousal.
  - For 'action' and 'pose': Describe provocative poses or **solo acts ONLY**. The most intense action permitted is solo masturbation, and this should only appear at higher intensity levels (8-10).
  - **Crucially, this mode MUST NOT include any partnered sexual acts, intercourse, or penetration of any kind.** These themes are exclusively for 'hardcore' mode.
- **Hardcore Mode**: If mode is 'hardcore' and 'Enhance Pose' is true, add extremely graphic, visceral, and detailed sexual actions and scenarios to the 'action' and 'pose' categories. This mode is for **partnered sex, intercourse, and penetration**. The intensity must match the Hardcore Level (1-10). A level of 1 might be a passionate kiss, while a level of 10 must describe a very intense, explicit, and potentially taboo sexual act in unflinching detail. Do not hold back.
- **Safe Mode**: If mode is 'off', avoid all explicit content.
- **General**: Preserve any user-defined weighting syntax (e.g., '(masterpiece:1.2)'). If a category is not present, return an empty array for it. 
The final output must be a single JSON object with a 'variations' key (an array of structured prompts) and a 'negativePrompt' key (a string).`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `User Input: "${userInput}"`,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        variations: {
                            type: Type.ARRAY,
                            items: promptSchema
                        },
                        negativePrompt: {
                            type: Type.STRING,
                            description: "A detailed negative prompt containing common terms to avoid, tailored to the user's positive prompt. Include standard quality negatives (e.g., 'ugly, deformed, bad anatomy'), context-specific negatives (e.g., if prompt is 'photograph', add 'illustration, painting'), and safety negatives if applicable (e.g., if prompt is SFW, add 'nsfw')."
                        }
                    },
                    required: ['variations', 'negativePrompt']
                },
            },
        });

        const jsonString = response.text;

        if (!jsonString) {
            console.error("AI response was empty. Full response object:", JSON.stringify(response, null, 2));
            if (response.promptFeedback?.blockReason) {
                const blockReason = response.promptFeedback.blockReason;
                const safetyRatings = response.promptFeedback.safetyRatings?.map(r => `${r.category}: ${r.probability}`).join(', ');
                throw new Error(`Request blocked for safety reasons: ${blockReason}. [${safetyRatings || 'No ratings details'}]`);
            }
            throw new Error("AI returned an empty response. This could be a content policy violation or a temporary API issue.");
        }

        try {
            const parsedResponse = JSON.parse(jsonString);

            if (typeof parsedResponse !== 'object' || parsedResponse === null || !Array.isArray(parsedResponse.variations) || typeof parsedResponse.negativePrompt !== 'string') {
                throw new Error("AI response did not match the expected format of { variations: [], negativePrompt: '' }.");
            }

            const validatedPrompts: StructuredPrompt[] = parsedResponse.variations.map((p: any) => ({
                subject: p.subject || [],
                attributes: p.attributes || [],
                clothing: p.clothing || [],
                pose: p.pose || [],
                action: p.action || [],
                location: p.location || [],
                background: p.background || [],
                style: p.style || [],
            }));
            
            return {
                structuredPrompts: validatedPrompts,
                negativePrompt: parsedResponse.negativePrompt,
            };
        } catch (parseError) {
             console.error("Failed to parse JSON response from AI:", jsonString);
             throw new Error("AI returned a malformed JSON response.");
        }

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to get a structured response from the AI model.");
    }
};

export const enhanceDescription = async (apiKey: string, userInput: string, nsfwSettings: NsfwSettingsState, styleFilter: StyleFilter): Promise<string> => {
    if (!apiKey) throw new Error("Google Gemini API Key not provided.");
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are a creative assistant for an AI image prompt generator. Your task is to take a user's simple description and enhance it into a rich, detailed narrative paragraph.

The user has provided the following settings:
- Mode: ${nsfwSettings.mode}
- Style Preference: ${styleFilter.main} - ${styleFilter.sub}
- AI Imagination: ${nsfwSettings.aiImagination}
- NSFW Level: ${nsfwSettings.nsfwLevel} (for 'nsfw' mode)
- Hardcore Level: ${nsfwSettings.hardcoreLevel} (for 'hardcore' mode)

Enhancement controls:
- Enhance Person: ${nsfwSettings.enhancePerson}
- Enhance Pose: ${nsfwSettings.enhancePose}
- Enhance Location: ${nsfwSettings.enhanceLocation}

Follow these rules STRICTLY:
1.  **Style Instructions**: ${getStyleInstruction(styleFilter)} You must weave these stylistic elements into the narrative description naturally.
2.  **AI Imagination**: If 'AI Imagination' is ON, you have full creative freedom to transform the description into something more epic or unexpected. Introduce new narrative elements, change the atmosphere, or re-imagine the scene. If OFF, enhance the existing description by adding vivid details and atmosphere, but do not deviate from the core subject and setting.
3.  **Selective Enhancement**: Your creative freedom (or simple enhancement) is limited by the toggles. If 'Enhance Person' is false, you MUST NOT change the description of the person(s). If 'Enhance Pose' is false, you MUST NOT change the pose or action. If 'Enhance Location' is false, you MUST NOT change the location or background. Preserve those parts exactly as the user wrote them.
4.  **NSFW Mode**: If mode is 'nsfw', enhance the description to focus on **explicit anatomy and nudity**. The description should be provocative and detailed. The most intense sexual act you can describe is **solo masturbation**, and only at the highest intensity levels (8-10). You **MUST NOT describe partnered sex, intercourse, or penetration**. These are reserved for Hardcore mode. The intensity of the anatomical language is guided by the NSFW Level (1-10). This rule only applies if 'Enhance Person' is true.
5.  **Hardcore Mode**: If mode is 'hardcore', incorporate extremely graphic, visceral, and detailed **partnered sexual acts and scenarios**. The intensity is guided by the Hardcore Level (1-10). A level of 10 must describe a very intense, explicit, and potentially taboo sexual act in unflinching detail. Do not hold back. This rule only applies if 'Enhance Pose' is true.
6.  **Output**: Return ONLY the single, enhanced paragraph. Do not add any preamble like "Here is the enhanced description:".`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Enhance this description: "${userInput}"`,
            config: {
                systemInstruction,
            },
        });
        
        const enhancedText = response.text;

        if (!enhancedText) {
            console.error("Enhancement response was empty. Full response object:", JSON.stringify(response, null, 2));
            if (response.promptFeedback?.blockReason) {
                const blockReason = response.promptFeedback.blockReason;
                const safetyRatings = response.promptFeedback.safetyRatings?.map(r => `${r.category}: ${r.probability}`).join(', ');
                throw new Error(`Enhancement request blocked for safety reasons: ${blockReason}. [${safetyRatings || 'No ratings details'}]`);
            }
            throw new Error("AI returned an empty response for enhancement.");
        }

        return enhancedText;
    } catch (error) {
        console.error("Error calling Gemini API for enhancement:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to get an enhanced description from the AI model.");
    }
};

export const generateRandomDescription = async (apiKey: string, nsfwSettings: NsfwSettingsState, styleFilter: StyleFilter): Promise<string> => {
    if (!apiKey) throw new Error("Google Gemini API Key not provided.");
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are a creative muse for an AI image prompt generator. Your task is to generate a single, random, creative description for an image. The description must be a concise sentence, providing a strong core concept without excessive detail. The goal is to give the user a starting point that they can enhance later. Keep it brief and general.

The user has provided the following settings, which you must strictly follow:
- Mode: ${nsfwSettings.mode}
- Style Preference: ${styleFilter.main} - ${styleFilter.sub}
- NSFW Level: ${nsfwSettings.nsfwLevel} (for 'nsfw' mode)
- Hardcore Level: ${nsfwSettings.hardcoreLevel} (for 'hardcore' mode)

- **Style Instructions**: ${getStyleInstruction(styleFilter)} Your generated description must strongly reflect these instructions.
- If mode is 'off', the description must be completely safe for work.
- If mode is 'nsfw', the description must focus on **explicit anatomy and nudity**. It can describe provocative posing or **solo acts ONLY**. At the highest intensity levels (8-10), this can include solo masturbation. **You MUST NOT generate descriptions of partnered sex, intercourse, or penetration.** That is strictly for Hardcore mode. The intensity of anatomical language is guided by the NSFW Level (1-10).
- If mode is 'hardcore', the description must incorporate extremely graphic, visceral, and detailed **partnered sexual acts and scenarios**. The intensity is guided by the Hardcore Level (1-10).

Generate a single, brief sentence. Do not add any preamble like "Here is a random description:". Just return the description itself.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Generate a random image description based on the system instruction.",
            config: {
                systemInstruction,
            },
        });
        
        const randomDescription = response.text;

        if (!randomDescription) {
            console.error("Random description response was empty. Full response object:", JSON.stringify(response, null, 2));
            if (response.promptFeedback?.blockReason) {
                const blockReason = response.promptFeedback.blockReason;
                const safetyRatings = response.promptFeedback.safetyRatings?.map(r => `${r.category}: ${r.probability}`).join(', ');
                throw new Error(`Random generation request blocked for safety reasons: ${blockReason}. [${safetyRatings || 'No ratings details'}]`);
            }
            throw new Error("AI returned an empty response for random generation.");
        }

        return randomDescription;

    } catch (error) {
        console.error("Error calling Gemini API for random description:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to generate a random description from the AI model.");
    }
};