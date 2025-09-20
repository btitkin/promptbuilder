
import type { ApiProvider, NsfwSettingsState, StyleFilter, StructuredPrompt, CharacterSettingsState, CustomApiConfig } from '../types';
import * as gemini from './geminiService';
import * as customApi from './customApiService';
import { invokeLLM } from './electronService';

// This is a facade that will route to the correct provider.
// For now, it only knows about Gemini, but it can be extended.

const notImplementedService = {
    generatePromptVariations: () => Promise.reject(new Error("This AI provider is not yet implemented.")),
    enhanceDescription: () => Promise.reject(new Error("This AI provider is not yet implemented.")),
    generateRandomDescription: () => Promise.reject(new Error("This AI provider is not yet implemented.")),
};

const providers: { [K in ApiProvider]: typeof gemini | typeof notImplementedService } = {
    google_gemini: gemini,
    openai: notImplementedService,
    claude: notImplementedService,
    deepseek: notImplementedService,
    groq: notImplementedService,
    together: notImplementedService,
    perplexity: notImplementedService,
    cohere: notImplementedService,
    custom_local: customApi,
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
): Promise<{ structuredPrompts: StructuredPrompt[], negativePrompt: string }> => {
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
                };
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
            console.warn('Local LLM failed:', error);
            // Don't fall back to custom API for prompt variations - we want proper LLM generation
            throw new Error('Local LLM unavailable for prompt generation. Please ensure your local model is properly configured.');
        }
    }
    const service = getProvider(provider);
    return service.generatePromptVariations(apiKey, userInput, numVariations, nsfwSettings, styleFilter, selectedModel, characterSettings);
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
            const response = await invokeLLM('enhanceDescription', {
                prompt: userInput,
                nsfwSettings,
                styleFilter,
                characterSettings
            });
            return response; // enhanceDescription oczekuje stringa, więc możemy zwrócić bezpośrednio
        } catch (error) {
            console.warn('Local LLM failed, falling back to custom API:', error);
            if (customConfig) {
                return customApi.enhanceDescription(customConfig, userInput, nsfwSettings, styleFilter, characterSettings);
            }
            throw error;
        }
    }
    const service = getProvider(provider);
    return service.enhanceDescription(apiKey, userInput, nsfwSettings, styleFilter, characterSettings);
};

// Globalny cache dla zapobiegania powtórzeniom
const descriptionCache = new Set<string>();
const recentGenders: string[] = [];
const MAX_CACHE_SIZE = 100;
const GENDER_HISTORY_SIZE = 10;

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
     try {
       // Generuj bazowy prompt z WSZYSTKICH dostępnych elementów użytkownika
       const baseElements: string[] = [];
       
       // Ustawienia postaci - zawsze uwzględniaj
       if (characterSettings.gender === 'male') baseElements.push('man');
       else if (characterSettings.gender === 'female') baseElements.push('woman');
       else if (characterSettings.gender === 'any') baseElements.push('person');

       if (characterSettings.age && characterSettings.age !== 'any') baseElements.push(`${characterSettings.age}`);
       if (characterSettings.ethnicity && characterSettings.ethnicity !== 'any') baseElements.push(`${characterSettings.ethnicity}`);
       if (characterSettings.bodyType && characterSettings.bodyType !== 'any') baseElements.push(`${characterSettings.bodyType} build`);
       
       // Style - zawsze uwzględniaj
       baseElements.push(`${styleFilter.main}`);
       if (styleFilter.sub && styleFilter.sub !== 'any') baseElements.push(`${styleFilter.sub}`);
       
       // NSFW - zawsze uwzględniaj
       if (nsfwSettings.mode === 'nsfw') baseElements.push('suggestive');
       else if (nsfwSettings.mode === 'hardcore') baseElements.push('explicit');
       
       // WSZYSTKIE zaznaczone presety użytkownika - zawsze uwzględniaj
       if (selectedPresets.length > 0) {
         baseElements.push(...selectedPresets);
       }

       const basePrompt = baseElements.join(', ');

       // Dynamiczne promptowanie dla maksymalnej różnorodności
       const promptVariations = [
         `Create a completely unique visual scene using: ${basePrompt}. Be wildly creative and unexpected.`,
         `Imagine a never-before-seen scene incorporating: ${basePrompt}. Break all patterns and clichés.`,
         `Design an original visual narrative featuring: ${basePrompt}. Invent something truly novel.`,
         `Visualize an unconventional scene with: ${basePrompt}. Avoid any common tropes or repetitions.`
       ];
       
       const selectedPrompt = promptVariations[Math.floor(Math.random() * promptVariations.length)];
       
       // Dynamiczna rotacja płci dla "any" - równa szansa dla każdej opcji
        let enforcedGender = 'person';
        if (characterSettings.gender === 'any') {
          const genderOptions = ['man', 'woman', 'non-binary'];
          enforcedGender = genderOptions[Math.floor(Math.random() * genderOptions.length)];
          
          // Zapisz historię dla statystyk
          recentGenders.push(enforcedGender);
          if (recentGenders.length > GENDER_HISTORY_SIZE) {
            recentGenders.shift();
          }
        } else if (characterSettings.gender === 'male') {
          enforcedGender = 'man';
        } else if (characterSettings.gender === 'female') {
          enforcedGender = 'woman';
        }

        const fullPrompt = [
         selectedPrompt,
         `Write one vivid paragraph of 2–3 sentences (45–100 words) describing exactly what you see.`,
         `ABSOLUTELY NO: dialogue, questions, conversations, responses, tags, lists, labels, or introductory phrases.`,
         `CRITICAL: Start directly with the visual description - no "here's", "image shows", "##", "Description:", titles, headers, or any formatting.`,
         `GENDER ENFORCEMENT: You MUST create a ${enforcedGender} character for this description.`,
         `EXTREME DIVERSITY: Create radically different characters every time with unique combinations.`,
         `RANDOMIZATION: Vary ethnicity, age, hair, body types, settings, time periods.`,
         `CREATIVE RISK: Take bold creative risks - unusual locations, unexpected occupations, unique scenarios.`,
         `ANTI-REPETITION: Check against previous outputs and consciously avoid any repetition.`,
         `FORMAT STRICT: The output must be ONLY the visual description text, no prefixes, no markdown, no headings, no labels of any kind.`
       ].join(' ');

       let response = '';
       let attempts = 0;
       const maxAttempts = 3;
       
       while (attempts < maxAttempts) {
         response = await invokeLLM(
           'generateRandomDescription',
           {
             prompt: fullPrompt,
             nsfwSettings,
             styleFilter,
             characterSettings,
             selectedPresets,
             temperature: 1.2 + (Math.random() * 0.4), // 1.2-1.6 z losową zmiennością (więcej kreatywności)
             top_p: 0.99, // Najwyższa wartość dla większej różnorodności
             maxTokens: 220, // Więcej tokenów dla bogatszych i bardziej szczegółowych opisów
             stop: ['USER:', 'ASSISTANT:', '<<EOD>>'] // Dodatkowe sekwencje stop
           }
         );

         // Sprawdź czy odpowiedź nie jest pusta i nie powtarza się
         if (response && response.length > 20 && !descriptionCache.has(response)) {
           break;
         }
         
         attempts++;
         if (attempts >= maxAttempts) {
           // Jeśli nadal powtarza, wymuś zmianę poprzez zwiększenie temperatury
           response = await invokeLLM(
             'generateRandomDescription',
             {
               prompt: fullPrompt + ' EXTREME CREATIVITY REQUIRED: Generate something completely different from previous outputs.',
               nsfwSettings,
               styleFilter,
               characterSettings,
               selectedPresets,
               temperature: 1.8 + (Math.random() * 0.2), // 1.8-2.0 (maksymalna kreatywność)
               top_p: 0.999,
               maxTokens: 250,
               stop: ['USER:', 'ASSISTANT:', '<<EOD>>']
             }
           );
           break;
         }
       }

       // Dodaj do cache i zarządzaj jego rozmiarem
       descriptionCache.add(response);
       if (descriptionCache.size > MAX_CACHE_SIZE) {
         // Usuń najstarsze elementy
         const oldest = Array.from(descriptionCache).slice(0, 20);
         oldest.forEach(item => descriptionCache.delete(item));
       }

       return response; // generateRandomDescription oczekuje stringa, więc możemy zwrócić bezpośrednio
     } catch (error) {
      console.warn('Local LLM failed, falling back to custom API:', error);
      if (customConfig) {
        return customApi.generateRandomDescription(customConfig, nsfwSettings, styleFilter, characterSettings, selectedPresets);
      }
      throw error;
    }
  }
    const service = getProvider(provider);
    return service.generateRandomDescription(apiKey, nsfwSettings, styleFilter, characterSettings, selectedPresets);
}

export const generateImage = (
    provider: ApiProvider,
    apiKey: string,
    prompt: string,
    resolution: '1k' | '2k',
    aspectRatio: string,
    customConfig?: CustomApiConfig
): Promise<string> => {
    switch (provider) {
        case 'google_gemini':
            return gemini.generateImage(apiKey, prompt, resolution, aspectRatio);
        case 'custom_local':
            if (customConfig) {
                return customApi.generateImage(customConfig, prompt, resolution, aspectRatio);
            }
            return Promise.reject(new Error("Custom API configuration is required for image generation."));
        case 'openai':
            return Promise.reject(new Error("OpenAI image generation is not yet implemented."));
        default:
            return Promise.reject(new Error(`Image generation is not supported by the ${provider} provider.`));
    }
};
