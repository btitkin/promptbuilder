
import type { ApiProvider, NsfwSettingsState, StyleFilter, StructuredPrompt, CharacterSettingsState, CustomApiConfig, PromptVariationsResult, AdvancedSettingsState } from '../types';
import * as gemini from './geminiService';
import * as customApi from './customApiService';
import { invokeLLM } from './electronService';
import { normalizeNarrative as normalizeNarrativeCentral } from './sanitizer';
import { MODELS } from '../constants';

export const generateKeywordsFromPicks = (corePicks: any, optInPicks: any): string => {
  const keywords: string[] = [];

  // Process core picks
  for (const key in corePicks) {
    const value = corePicks[key];
    if (value && value !== 'any' && value !== 'none') {
      keywords.push(`${key}: ${value}`);
    }
  }

  // Process opt-in picks
  for (const key in optInPicks) {
    const value = optInPicks[key];
    if (Array.isArray(value) && value.length > 0) {
      keywords.push(...value);
    } else if (typeof value === 'string' && value) {
      keywords.push(value);
    }
  }

  return keywords.join(', ');
};

// Local caches/state used by random description generation
const GENDER_HISTORY_SIZE = 20;
const recentGenders: string[] = [];
const MAX_CACHE_SIZE = 200;
const descriptionCache: Set<string> = new Set();

// This is a facade that will route to the correct provider.
// For now, it only knows about Gemini, but it can be extended.

const notImplementedService = {
    generatePromptVariations: () => Promise.reject(new Error("This AI provider is not yet implemented.")),
    enhanceDescription: () => Promise.reject(new Error("This AI provider is not yet implemented.")),
    generateRandomDescription: () => Promise.reject(new Error("This AI provider is not yet implemented.")),
};

const providers: { [K in ApiProvider]: typeof gemini | typeof customApi | typeof notImplementedService } = {
    google_gemini: gemini,
    openai: notImplementedService,
    claude: notImplementedService,
    deepseek: notImplementedService,
    groq: notImplementedService,
    together: notImplementedService,
    perplexity: notImplementedService,
    cohere: notImplementedService,
    custom_local: notImplementedService,
    qwen: customApi,
};

function getProvider(provider: ApiProvider) {
    const service = providers[provider];
    if (!service) {
        throw new Error(`Unsupported API provider: ${provider}`);
    }
    return service;
}

export const generatePromptVariations = async (
    provider: ApiProvider, 
    apiKey: string, 
    userInput: string, 
    numVariations: number, 
    nsfwSettings: NsfwSettingsState, 
    styleFilter: StyleFilter, 
    selectedModel: string,
    characterSettings: CharacterSettingsState,
    customConfig?: CustomApiConfig
): Promise<PromptVariationsResult> => {
    if (provider === 'custom_local') {
        try {
            const response = await invokeLLM('generatePromptVariations', {
                prompt: userInput,
                numVariations,
                nsfwSettings,
                styleFilter,
                selectedModel,
                characterSettings
            });
            
            // Parse the string response from Electron API to expected object format
            try {
                const parsed = JSON.parse(response);
                return {
                    structuredPrompts: parsed.structuredPrompts || [],
                    negativePrompt: parsed.negativePrompt || 'ugly, blurry, worst quality, bad anatomy'
                } as PromptVariationsResult;
            } catch (error) {
                console.error('Failed to parse LLM response:', error);
                // Fallback to default structure
                return {
                    structuredPrompts: [{
                        subject: [userInput],
                        attributes: ['detailed', 'high quality', 'masterpiece'],
                        clothing: [],
                        pose: [],
                        action: [],
                        location: [],
                        background: [],
                        style: []
                    }],
                    negativePrompt: 'ugly, blurry, worst quality, bad anatomy'
                };
            }
        } catch (error) {
            console.warn('Local LLM failed for variations:', error);
            throw error;
        }
    }

    if (provider === 'qwen') {
        if (!customConfig) {
            throw new Error('Qwen provider requires Custom API configuration (URL and model).');
        }
        // Reuse Custom API (Qwen-aligned prompts) for variations
        return customApi.generatePromptVariations(customConfig, userInput, numVariations, nsfwSettings, styleFilter, selectedModel, characterSettings);
    }

    const service = getProvider(provider);
    return (service as typeof gemini).generatePromptVariations(apiKey, userInput, numVariations, nsfwSettings, styleFilter, selectedModel, characterSettings);
};

export const enhanceDescription = async (
    provider: ApiProvider, 
    apiKey: string, 
    userInput: string, 
    nsfwSettings: NsfwSettingsState, 
    styleFilter: StyleFilter,
    characterSettings: CharacterSettingsState,
    customConfig?: CustomApiConfig
): Promise<string> => {
    if (provider === 'custom_local') {
        try {
            // Fallback: enrich the raw input with a creativity seed so each click yields a fresh, imaginative variant
            const seed = Math.floor(100000 + Math.random() * 900000);
            const enrichedInput = `${userInput}\n\nWrite ONE short paragraph of 3–6 sentences (about 80–180 words). Start directly with the scene in natural prose (no tags or lists). Creative seed: ${seed}. Add 2–3 fresh, vivid but plausible details (props, weather, textures, micro-actions). Vary composition and atmosphere; avoid repeating previous phrasing.`;
        
            const response = await invokeLLM('enhanceDescription', {
                prompt: enrichedInput,
                nsfwSettings,
                styleFilter,
                characterSettings,
                temperature: 0.9,     // encourage imaginative variety
                top_p: 0.95,
                maxTokens: 360,
                stop: ['<<EOD>>', 'USER:', 'ASSISTANT:']
            });
            return response; // expected plain string
        } catch (error) {
            console.warn('Local LLM failed for enhanceDescription:', error);
            throw error;
        }
    }

    // Explicit Qwen provider uses Custom API prompts (Qwen-aligned)
    if (provider === 'qwen') {
        if (!customConfig) {
            throw new Error('Qwen provider requires Custom API configuration (URL and model).');
        }
        return customApi.enhanceDescription(customConfig, userInput, nsfwSettings, styleFilter, characterSettings);
    }

    const service = getProvider(provider);
    return (service as typeof gemini).enhanceDescription(apiKey, userInput, nsfwSettings, styleFilter, characterSettings);
};

// Keep existing import usage
export const normalizeNarrative = (text: string): string => {
  return normalizeNarrativeCentral(text ?? '');
};

// NEW: Convert final description into model-specific prompt via Qwen guidance
export const generatePromptWithGuidance = async (
    provider: ApiProvider,
    apiKey: string,
    userInput: string,
    selectedModel: string,
    customConfig?: CustomApiConfig,
    tuningParams?: { temperature?: number; topP?: number; frequencyPenalty?: number; presencePenalty?: number }
): Promise<string> => {
    const masterPrompt = `You are a world-class prompt engineering AI. Your one and only task is to take a set of character keywords and reformat them into a perfect, ready-to-use prompt for a specific target AI image model.

Instructions:
First, analyze the character described by the keywords provided below.
Then, convert all this information into a final prompt that is perfectly formatted for the ${selectedModel} model.
Apply all necessary formatting rules for that target model. For example:
For SDXL or Midjourney, create a descriptive, comma-separated list of tags.
For Flux or DALL-E, write a descriptive, natural language paragraph.
Respect any BREAK toggle settings if required for the target model.
Input Keywords: ${userInput}
Final Prompt for ${selectedModel}:
`;

    if (provider === 'custom_local') {
      // Use local Electron LLM directly; avoid any HTTP requests
      const response = await invokeLLM('chatCompletion', {
        prompt: masterPrompt,
        temperature: tuningParams?.temperature ?? 0.6,
        top_p: tuningParams?.topP ?? 0.9,
        frequency_penalty: tuningParams?.frequencyPenalty ?? 0.0,
        presence_penalty: tuningParams?.presencePenalty ?? 0.0,
        maxTokens: 280,
        stop: ['<<EOD>>']
      });
      return response;
    } else if (provider === 'google_gemini') {
      return gemini.generateText(apiKey, masterPrompt);
    } 
    // For other providers, ensure custom config is valid before proceeding
    else {
      if (!customConfig || !customConfig.url) {
        throw new Error(`Custom API URL is missing or invalid for the ${provider} provider.`);
      }
      // Keep existing external path for non-local providers
      return customApi.generateText(apiKey, masterPrompt, selectedModel, customConfig);
    }
}

// Final simplified AI Imagination: single descriptive paragraph
export const generateImaginationParagraph = async (
  provider: ApiProvider,
  apiKey: string,
  nsfwSettings: NsfwSettingsState,
  customConfig?: CustomApiConfig,
  tuningParams?: { temperature?: number; topP?: number; frequencyPenalty?: number; presencePenalty?: number }
): Promise<string> => {
  // First: support Local (Electron, GGUF) explicitly
  if (provider === 'custom_local') {
    try {
      const response = await invokeLLM('chatCompletion', {
      prompt: `You are a creative writer. Your only task is to write a single paragraph.\nCRITICAL RULE: Your output MUST be a PARAGRAPH with full sentences.\nContent Policy: The content of the paragraph MUST match the user's SFW/NSFW/Hardcore setting: ${nsfwSettings.mode}.\n\nWrite one single, creative, descriptive paragraph in English about a character in a compelling scene.`,
      temperature: tuningParams?.temperature ?? 0.7,
      top_p: tuningParams?.topP ?? 0.9,
      frequency_penalty: tuningParams?.frequencyPenalty ?? 0.0,
      presence_penalty: tuningParams?.presencePenalty ?? 0.0,
      maxTokens: 280,
      stop: ['<<EOD>>']
    });
      return response || '';
    } catch (e) {
      throw new Error('Local LLM (Electron) is unavailable or failed to generate. Verify model path and cache permissions.');
    }
  }
  if (provider === 'google_gemini') {
    return gemini.generateImaginationParagraph(apiKey, nsfwSettings);
  }
  if (provider === 'qwen') {
    if (!customConfig) {
      throw new Error('Qwen provider requires Custom API configuration (URL and model).');
    }
    return customApi.generateImaginationParagraph(customConfig, nsfwSettings);
  }
  // Fallback: use local LLM minimal instruction if available
  try {
    const response = await invokeLLM('chatCompletion', {
      prompt: `You are a creative writer. Your only task is to write a single paragraph.\nCRITICAL RULE: Your output MUST be a PARAGRAPH with full sentences.\nContent Policy: The content of the paragraph MUST match the user's SFW/NSFW/Hardcore setting: ${nsfwSettings.mode}.\n\nWrite one single, creative, descriptive paragraph in English about a character in a compelling scene.`,
      temperature: tuningParams?.temperature ?? 0.7,
      top_p: tuningParams?.topP ?? 0.9,
      frequency_penalty: tuningParams?.frequencyPenalty ?? 0.0,
      presence_penalty: tuningParams?.presencePenalty ?? 0.0,
      maxTokens: 280,
      stop: ['<<EOD>>']
    });
    return response || '';
  } catch (e) {
    throw new Error('AI Imagination supports Local (Electron), Custom API (OpenAI-compatible), or Gemini. Configure one of these providers and ensure Local model loads correctly.');
  }
};

export const generateRandomDescription = async (
    provider: ApiProvider, 
    apiKey: string, 
    nsfwSettings: NsfwSettingsState, 
    styleFilter: StyleFilter,
    characterSettings: CharacterSettingsState,
    selectedPresets: string[],
    customConfig?: CustomApiConfig
): Promise<string> => {
    if (provider === 'custom_local') {
      // Always use local Electron logic for random description
        // Generuj bazowy prompt z WSZYSTKICH dostępnych elementów użytkownika
        // Build character descriptor for description starter
        let characterDescriptor = '';
        let baseElements: string[] = [];
        
        // Build proper character identifier
        if (characterSettings.gender === 'male') {
          characterDescriptor = 'man';
          baseElements.push('man');
        } else if (characterSettings.gender === 'female') {
          characterDescriptor = 'woman';
          baseElements.push('woman');
        } else if (characterSettings.gender === 'futanari') {
          characterDescriptor = 'futanari';
          baseElements.push('futanari');
        } else if (characterSettings.gender === 'any') {
          characterDescriptor = 'person';
          baseElements.push('person');
        } else {
          characterDescriptor = 'character';
          baseElements.push('character');
        }

        // Add age to descriptor if specified
        if (characterSettings.age && characterSettings.age !== 'any') {
          characterDescriptor = `${characterSettings.age} ${characterDescriptor}`;
          baseElements.push(`${characterSettings.age}`);
        }

        // Add ethnicity to descriptor if specified
        if (characterSettings.ethnicity && characterSettings.ethnicity !== 'any') {
          characterDescriptor = `${characterSettings.ethnicity} ${characterDescriptor}`;
          baseElements.push(`${characterSettings.ethnicity}`);
        }

        // Add body type to elements (not to descriptor as it's more descriptive)
        if (characterSettings.bodyType && characterSettings.bodyType !== 'any') {
          baseElements.push(`${characterSettings.bodyType} build`);
        }

        // Add height if specified
        if (characterSettings.height && characterSettings.height !== 'any') {
          baseElements.push(`${characterSettings.height}`);
        }

        // Overlays: add thematic modifiers
        if (characterSettings.overlays?.furry) {
          baseElements.push('beastkin features (animal ears, tail)');
        }
        if (characterSettings.overlays?.monster) {
          baseElements.push('demonic/monster traits (horns, fangs)');
        }
        if (characterSettings.overlays?.sciFi) {
          baseElements.push('futuristic sci-fi elements');
        }

        // Add female-specific traits
        if (characterSettings.gender === 'female' || characterSettings.gender === 'futanari') {
          if (characterSettings.breastSize && characterSettings.breastSize !== 'any') {
            baseElements.push(`${characterSettings.breastSize} breasts`);
          }
          if (characterSettings.hipsSize && characterSettings.hipsSize !== 'any') {
            baseElements.push(`${characterSettings.hipsSize} hips`);
          }
          if (characterSettings.buttSize && characterSettings.buttSize !== 'any') {
            baseElements.push(`${characterSettings.buttSize} butt`);
          }
        }

        // Add male-specific traits
        if (characterSettings.gender === 'male' || characterSettings.gender === 'futanari') {
          if (characterSettings.muscleDefinition && characterSettings.muscleDefinition !== 'any') {
            baseElements.push(`${characterSettings.muscleDefinition} muscles`);
          }
          if (characterSettings.facialHair && characterSettings.facialHair !== 'any') {
            baseElements.push(`${characterSettings.facialHair}`);
          }
          if (characterSettings.penisSize && characterSettings.penisSize !== 'any' && (nsfwSettings.mode === 'nsfw' || nsfwSettings.mode === 'hardcore')) {
            baseElements.push(`${characterSettings.penisSize} penis`);
          }
        }
        
        // Style is handled separately in the prompt generation, not as part of character elements
        
        // NSFW - pełna lista elementów zgodna z customApiService.ts
        if (nsfwSettings.mode === 'nsfw' && nsfwSettings.nsfwLevel) {
          const nsfwElements = [
            'nude', 'naked', 'sensual', 'erotic', 'provocative', 'seductive',
            'lingerie', 'underwear', 'bikini', 'swimsuit', 'see-through', 'transparent',
            'cleavage', 'curves', 'voluptuous', 'alluring', 'tempting', 'enticing'
          ];
          // Dodaj elementy na podstawie poziomu NSFW (1-10)
          const elementsToAdd = Math.min(nsfwElements.length, Math.floor(nsfwSettings.nsfwLevel / 2));
          baseElements.push(...nsfwElements.slice(0, elementsToAdd));
        } else if (nsfwSettings.mode === 'hardcore' && nsfwSettings.hardcoreLevel) {
          const hardcoreElements = [
            'sexual', 'masturbation', 'foreplay', 'intimate', 'passionate', 'lustful',
            'arousal', 'desire', 'ecstasy', 'pleasure', 'orgasm', 'climax',
            'explicit sexual activities', 'graphic sexual descriptions', 'sexual intercourse',
            'penetration', 'sexual positions', 'sexual acts', 'graphic nudity', 'explicit content'
          ];
          // Dodaj elementy na podstawie poziomu hardcore (1-10)
          const elementsToAdd = Math.min(hardcoreElements.length, Math.floor(nsfwSettings.hardcoreLevel / 2));
          baseElements.push(...hardcoreElements.slice(0, elementsToAdd));
        }
        
        // WSZYSTKIE zaznaczone presety użytkownika - zawsze uwzględniaj
        if (selectedPresets.length > 0) {
          baseElements.push(...selectedPresets);
        }

        const basePrompt = baseElements.join(', ');

        // Mode-specific prompt variations optimized for Qwen2.5 with detailed descriptions
        let promptVariations: string[] = [];
        
        if (nsfwSettings.mode === 'off') {
          promptVariations = [
            `Create a detailed realistic scene with: ${basePrompt}. Include specific details about location, lighting, pose, facial expression, emotions, hair style, and clothing. Write in English only.`,
            `Describe a comprehensive everyday scene featuring: ${basePrompt}. Include setting details, lighting conditions, body pose, face and emotions, hair description, and outfit. Use English language only.`,
            `Generate a detailed description with: ${basePrompt}. Cover location/background, lighting atmosphere, character pose, facial features and expression, hair style, and clothing details. English only.`,
            `Create a thorough scene description including: ${basePrompt}. Describe the setting, lighting, pose, face and emotions, hair, and clothing in detail. Write only in English.`
          ];
        } else if (nsfwSettings.mode === 'nsfw') {
          promptVariations = [
            `Create a detailed erotic scene with: ${basePrompt}. Include location, lighting, nude pose, facial expression, emotions, hair, and nudity/clothing details. Use direct sensual English only.`,
            `Describe a comprehensive sexual scene featuring: ${basePrompt}. Cover setting, lighting, erotic pose, face and emotions, hair style, and nude/clothing state. English language only.`,
            `Generate a detailed nude description with: ${basePrompt}. Include background, lighting, sexual pose, facial features and arousal, hair, and nudity details. Write in English only.`,
            `Create a thorough intimate scene including: ${basePrompt}. Describe setting, lighting, erotic pose, face and sexual emotions, hair, and nude/clothing state. English only.`
          ];
        } else if (nsfwSettings.mode === 'hardcore') {
          promptVariations = [
            `Create a detailed hardcore sexual scene with: ${basePrompt}. Include location, lighting, explicit sexual pose, facial expression, emotions, hair, and graphic nudity/sexual details. Use raw explicit English only.`,
            `Describe a comprehensive extreme sexual scene featuring: ${basePrompt}. Cover setting, lighting, hardcore sexual pose, face and intense emotions, hair style, and graphic sexual details. English language only.`,
            `Generate a detailed hardcore description with: ${basePrompt}. Include background, lighting, extreme sexual pose, facial features and intense arousal, hair, and explicit sexual details. Write in English only.`,
            `Create a thorough hardcore scene including: ${basePrompt}. Describe setting, lighting, graphic sexual pose, face and extreme emotions, hair, and explicit sexual content. English only.`
          ];
        }
        
        const selectedPrompt = promptVariations[Math.floor(Math.random() * promptVariations.length)];
        
        // Dynamiczna rotacja płci dla "any" - równa szansa dla każdej opcji
         let enforcedGender = characterDescriptor || 'person';
         if (characterSettings.gender === 'any') {
           const genderOptions = ['man', 'woman'];
           const selectedGender = genderOptions[Math.floor(Math.random() * genderOptions.length)];
           enforcedGender = selectedGender;
           
           // Update character descriptor for "any" gender
           if (characterSettings.ethnicity && characterSettings.ethnicity !== 'any') {
             if (characterSettings.age && characterSettings.age !== 'any') {
               enforcedGender = `${characterSettings.ethnicity} ${characterSettings.age} ${selectedGender}`;
             } else {
               enforcedGender = `${characterSettings.ethnicity} ${selectedGender}`;
             }
           } else if (characterSettings.age && characterSettings.age !== 'any') {
             enforcedGender = `${characterSettings.age} ${selectedGender}`;
           }
           
           // Zapisz historię dla statystyk
           recentGenders.push(selectedGender);
           if (recentGenders.length > GENDER_HISTORY_SIZE) {
             recentGenders.shift();
           }
         } else if (characterSettings.gender === 'male') {
           enforcedGender = characterDescriptor || 'man';
         } else if (characterSettings.gender === 'female') {
           enforcedGender = characterDescriptor || 'woman';
         } else if (characterSettings.gender === 'futanari') {
           enforcedGender = characterDescriptor || 'futanari woman';
         }

         // Mode-specific instructions optimized for Qwen2.5 with detailed descriptions
         let modeInstructions: string[] = [];
         
         if (nsfwSettings.mode === 'off') {
           modeInstructions = [
             `Write ONE short paragraph of 3–6 sentences (about 80–180 words) describing a richly detailed, realistic everyday scene.`,
             `START the description with "The ${enforcedGender}" followed by the scene details.`,
             `Include specific details: location/setting, lighting conditions, body pose, facial expression and emotions, hair style, and clothing description.`,
             `Add 2–3 specific, vivid but plausible details (props, textures, micro-actions, weather) to keep outputs varied.`,
             `You may freely introduce additional creative elements from any visual category (camera angle, lens/shot type, composition, color palette, atmosphere, weather, props, accessories, special effects, background activity) as long as they are coherent with the constraints.`,
             `MUST include ALL selected character traits: ${baseElements.filter(el => !['man', 'woman', 'person'].includes(el)).join(', ')}.`,
             `Use simple, realistic English language only. NO sexual content, nudity, or suggestive elements.`,
             `Example style: "The japanese woman in a red sweater sits at a sunlit cafe table, her brown hair catching the golden afternoon light as she smiles while reading a book, her relaxed posture showing contentment."`,
             `LANGUAGE: Write only in English. Do not use Chinese, Japanese, or any non-English characters.`
           ];
         } else if (nsfwSettings.mode === 'nsfw') {
           modeInstructions = [
             `Write ONE short paragraph of 3–6 sentences (about 80–180 words) describing a richly detailed erotic scene with nudity or sexual elements.`,
             `START the description with "The ${enforcedGender}" followed by the scene details.`,
             `Include specific details: location/setting, lighting atmosphere, nude/erotic pose, facial expression and arousal, hair style, and nudity/clothing state.`,
             `Add 2–3 specific, scene-appropriate details (props, textures, movements) that enhance sensuality without changing constraints.`,
             `You may freely introduce additional creative elements from any visual category (camera angle, lens/shot type, composition, color palette, atmosphere, weather, props, accessories, special effects, background activity) as long as they are coherent with the constraints.`,
             `MUST include ALL selected character traits: ${baseElements.filter(el => !['man', 'woman', 'person'].includes(el)).join(', ')}.`,
             `Use direct, sensual English language only. Include explicit terms for body parts and sexual actions.`,
             `Example style: "The japanese woman spreads her legs on the silk sheets, the warm lamplight highlighting her wet pussy and erect nipples, her blonde hair cascading over her shoulders as she moans with desire."`,
             `LANGUAGE: Write only in English. Do not use Chinese, Japanese, or any non-English characters.`
           ];
         } else if (nsfwSettings.mode === 'hardcore') {
           modeInstructions = [
             `Write ONE short paragraph of 3–6 sentences (about 80–180 words) describing a richly detailed hardcore sexual scene.`,
             `START the description with "The ${enforcedGender}" followed by the scene details.`,
             `Include specific details: setting, lighting, explicit sexual pose, facial expression and intense arousal, hair style, and graphic nudity/sexual details.`,
             `Add 2–3 specific, vivid details that enhance intensity without changing constraints.`,
             `You may freely introduce additional creative elements from any visual category (camera angle, lens/shot type, composition, color palette, atmosphere, weather, props, accessories, special effects, background activity) as long as they are coherent with the constraints.`,
             `MUST include ALL selected character traits: ${baseElements.filter(el => !['man', 'woman', 'person'].includes(el)).join(', ')}.`,
             `Use raw, explicit English language only.`,
             `LANGUAGE: Write only in English. Do not use Chinese, Japanese, or any non-English characters.`
           ];
         }

         const instructionBlock = modeInstructions.join('\n');

         // Build final prompt for local LLM
         const prompt = `${selectedPrompt}\n\n${instructionBlock}`;

         try {
           const response = await invokeLLM('generateRandomDescription', {
             prompt,
             nsfwSettings,
             styleFilter,
             characterSettings,
             temperature: 0.9,
             top_p: 0.95,
             maxTokens: 360,
             stop: ['<<EOD>>', 'USER:', 'ASSISTANT:']
           });
           
           const normalized = normalizeNarrativeCentral(response ?? '');
           if (!normalized) throw new Error('Empty response');

           // Deduplicate recent outputs (cache)
           if (descriptionCache.has(normalized)) {
             // Try once more with a slightly different phrasing seed
             const retry = await invokeLLM('generateRandomDescription', {
               prompt: prompt + `\n\nAdd 1-2 fresh details different from your previous attempt.`,
               nsfwSettings,
               styleFilter,
               characterSettings,
               temperature: 0.92,
               top_p: 0.96,
               maxTokens: 360,
               stop: ['<<EOD>>', 'USER:', 'ASSISTANT:']
             });
             const retryNorm = normalizeNarrativeCentral(retry ?? '');
             if (retryNorm) {
               descriptionCache.add(retryNorm);
               if (descriptionCache.size > MAX_CACHE_SIZE) {
                 const first = descriptionCache.values().next().value;
                 descriptionCache.delete(first);
               }
               return retryNorm;
             }
           }

           descriptionCache.add(normalized);
           if (descriptionCache.size > MAX_CACHE_SIZE) {
             const first = descriptionCache.values().next().value;
             descriptionCache.delete(first);
           }
         return normalized;
       } catch (error) {
          console.warn('Local LLM failed for random description:', error);
          throw error;
        }
       }
      if (provider === 'qwen') {
        if (!customConfig) {
          throw new Error('Qwen provider requires Custom API configuration (URL and model).');
        }
        return customApi.generateRandomDescription(customConfig, nsfwSettings, styleFilter, characterSettings, selectedPresets);
      }
      const service = getProvider(provider);
      return (service as typeof gemini).generateRandomDescription(apiKey, nsfwSettings, styleFilter, characterSettings, selectedPresets);
};
