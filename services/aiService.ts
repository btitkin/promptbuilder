import type { ApiProvider, NsfwSettingsState, StyleFilter, StructuredPrompt } from '../types';
import * as gemini from './geminiService';

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
    selectedModel: string
): Promise<{ structuredPrompts: StructuredPrompt[], negativePrompt: string }> => {
    const service = getProvider(provider);
    return service.generatePromptVariations(apiKey, userInput, numVariations, nsfwSettings, styleFilter, selectedModel);
};

export const enhanceDescription = (
    provider: ApiProvider, 
    apiKey: string, 
    userInput: string, 
    nsfwSettings: NsfwSettingsState, 
    styleFilter: StyleFilter
): Promise<string> => {
    const service = getProvider(provider);
    return service.enhanceDescription(apiKey, userInput, nsfwSettings, styleFilter);
};

export const generateRandomDescription = (
    provider: ApiProvider,
    apiKey: string,
    nsfwSettings: NsfwSettingsState,
    styleFilter: StyleFilter
): Promise<string> => {
    const service = getProvider(provider);
    return service.generateRandomDescription(apiKey, nsfwSettings, styleFilter);
}