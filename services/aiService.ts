
import type { ApiProvider, NsfwSettingsState, StyleFilter, StructuredPrompt, CharacterSettingsState, CustomApiConfig } from '../types';
import * as gemini from './geminiService';
import * as customApi from './customApiService';

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

export const generatePromptVariations = (
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
    if (provider === 'custom_local' && customConfig) {
        return customApi.generatePromptVariations(customConfig, userInput, numVariations, nsfwSettings, styleFilter, selectedModel, characterSettings);
    }
    const service = getProvider(provider);
    return service.generatePromptVariations(apiKey, userInput, numVariations, nsfwSettings, styleFilter, selectedModel, characterSettings);
};

export const enhanceDescription = (
    provider: ApiProvider, 
    apiKey: string, 
    userInput: string, 
    nsfwSettings: NsfwSettingsState, 
    styleFilter: StyleFilter,
    characterSettings: CharacterSettingsState,
    customConfig?: CustomApiConfig
): Promise<string> => {
    if (provider === 'custom_local' && customConfig) {
        return customApi.enhanceDescription(customConfig, userInput, nsfwSettings, styleFilter, characterSettings);
    }
    const service = getProvider(provider);
    return service.enhanceDescription(apiKey, userInput, nsfwSettings, styleFilter, characterSettings);
};

export const generateRandomDescription = (
    provider: ApiProvider,
    apiKey: string,
    nsfwSettings: NsfwSettingsState,
    styleFilter: StyleFilter,
    characterSettings: CharacterSettingsState,
    selectedPresets: string[],
    customConfig?: CustomApiConfig
): Promise<string> => {
    if (provider === 'custom_local' && customConfig) {
        return customApi.generateRandomDescription(customConfig, nsfwSettings, styleFilter, characterSettings, selectedPresets);
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
