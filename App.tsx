import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { ModelSelector } from './components/ModelSelector';
import { Toggle } from './components/Toggle';
import { PromptInput } from './components/PromptInput';
import { PromptOutput } from './components/PromptOutput';
import { History } from './components/History';
import { AdvancedSettings } from './components/AdvancedSettings';
import { VariationSelector } from './components/VariationSelector';
import { NsfwControls } from './components/NsfwControls';
import { StyleFilter } from './components/StyleFilter';
import { ApiSettings } from './components/ApiSettings';
import { MODEL_NAMES, MODELS, DEFAULT_QUALITY_TAGS } from './constants';
import type { StructuredPrompt, AdvancedSettingsState, NsfwSettingsState, StyleFilter as StyleFilterType, ApiConfigState } from './types';
import * as aiService from './services/aiService';

const App: React.FC = () => {
  const [userInput, setUserInput] = useState<string>('A young woman laughing, holding a bouquet of wildflowers in a sun-drenched meadow, shallow depth of field, golden hour.');
  const [selectedModel, setSelectedModel] = useState<string>('SDXL');
  const [styleFilter, setStyleFilter] = useState<StyleFilterType>({ main: 'realistic', sub: 'professional' });
  const [nsfwSettings, setNsfwSettings] = useState<NsfwSettingsState>({
    mode: 'off',
    nsfwLevel: 5,
    hardcoreLevel: 5,
    enhancePerson: true,
    enhancePose: true,
    enhanceLocation: true,
    aiImagination: false,
  });
  const [useBreak, setUseBreak] = useState<boolean>(false);
  const [generatedPrompts, setGeneratedPrompts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [isGeneratingRandom, setIsGeneratingRandom] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettingsState>({
    negativePrompt: 'ugly, blurry, bad anatomy, worst quality',
    aspectRatio: '1:1',
    additionalParams: '',
    seed: '',
  });
  const [numVariations, setNumVariations] = useState<number>(1);
  const [showApiSettings, setShowApiSettings] = useState<boolean>(false);
  const [apiConfig, setApiConfig] = useState<ApiConfigState>({
    provider: 'google_gemini',
    keys: {},
  });

  const currentModelConfig = useMemo(() => MODELS[selectedModel], [selectedModel]);
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedPrompt = urlParams.get('prompt');
    const sharedModel = urlParams.get('model');

    if (sharedPrompt) setUserInput(sharedPrompt);
    if (sharedModel && MODEL_NAMES.includes(sharedModel)) setSelectedModel(sharedModel);
    if (sharedPrompt || sharedModel) window.history.replaceState({}, document.title, window.location.pathname);
    
    try {
      const storedHistory = localStorage.getItem('promptHistory');
      if (storedHistory) setHistory(JSON.parse(storedHistory));
    } catch (e) { console.error("Failed to load history", e); }

    try {
      const storedSettings = localStorage.getItem('advancedSettings');
      if (storedSettings) setAdvancedSettings(prev => ({...prev, ...JSON.parse(storedSettings)}));
    } catch (e) { console.error("Failed to load advanced settings", e); }
    
    try {
      const storedApiConfig = localStorage.getItem('apiConfig');
      if (storedApiConfig) {
        const parsedConfig = JSON.parse(storedApiConfig);
        setApiConfig(prev => ({...prev, ...parsedConfig}));
        if (!parsedConfig.keys?.[parsedConfig.provider]) {
          setShowApiSettings(true);
        }
      } else {
        setShowApiSettings(true);
      }
    } catch (e) { console.error("Failed to load API config", e); }
  }, []);

  useEffect(() => {
    try {
        localStorage.setItem('advancedSettings', JSON.stringify(advancedSettings));
    } catch (e) { console.error("Failed to save advanced settings", e); }
  }, [advancedSettings]);

  useEffect(() => {
    try {
        localStorage.setItem('apiConfig', JSON.stringify(apiConfig));
        if (!apiConfig.keys[apiConfig.provider]) {
            setShowApiSettings(true);
        }
    } catch (e) { console.error("Failed to save API config", e); }
  }, [apiConfig]);

  const formatSinglePrompt = useCallback((structuredPrompt: StructuredPrompt): string => {
    const processedCategories: { [key: string]: string[] } = {};
    for (const key in structuredPrompt) {
        const category = key as keyof StructuredPrompt;
        let tags = structuredPrompt[category] || [];
        processedCategories[category] = tags.filter(tag => tag.trim() !== '');
    }
    
    const taggedOrder: (keyof StructuredPrompt)[] = ['subject', 'attributes', 'action', 'pose', 'clothing', 'location', 'background', 'style'];
    const naturalOrder: (keyof StructuredPrompt)[] = ['subject', 'action', 'pose', 'clothing', 'attributes', 'location', 'background', 'style'];
    const categoryOrder = currentModelConfig.syntaxStyle === 'tagged' ? taggedOrder : naturalOrder;

    let mainPrompt = '';
    const { tagSeparator, qualityTagsLocation, promptPrefix, syntaxStyle } = currentModelConfig;
    const qualityTagsString = DEFAULT_QUALITY_TAGS.join(tagSeparator);

    if (syntaxStyle === 'natural') {
        const naturalParts: string[] = [];
        if (promptPrefix) naturalParts.push(promptPrefix);
        categoryOrder.forEach(category => {
            if (processedCategories[category]?.length > 0) naturalParts.push(processedCategories[category].join(' '));
        });
        mainPrompt = naturalParts.filter(p => p.trim() !== '').join(', ');
        if (qualityTagsLocation === 'append' && qualityTagsString) mainPrompt += (mainPrompt ? ', ' : '') + qualityTagsString;
        else if (qualityTagsLocation === 'prepend' && qualityTagsString) mainPrompt = `${qualityTagsString}, ${mainPrompt}`;
    } else if (currentModelConfig.supportsBreak && useBreak) {
        const sections: string[] = [];
        if (qualityTagsLocation === 'prepend' && qualityTagsString) sections.push(qualityTagsString);
        categoryOrder.forEach(category => {
            if (processedCategories[category]?.length > 0) sections.push(processedCategories[category].join(tagSeparator));
        });
        if (qualityTagsLocation === 'append' && qualityTagsString) sections.push(qualityTagsString);
        mainPrompt = sections.filter(s => s.trim() !== '').join('\n\nBREAK\n\n');
    } else {
        const allParts: string[] = [];
        if (promptPrefix) allParts.push(promptPrefix);
        if (qualityTagsLocation === 'prepend' && qualityTagsString) allParts.push(qualityTagsString);
        categoryOrder.forEach(category => {
            if (processedCategories[category]?.length > 0) allParts.push(...processedCategories[category]);
        });
        if (qualityTagsLocation === 'append' && qualityTagsString) allParts.push(qualityTagsString);
        mainPrompt = allParts.filter(p => p.trim() !== '').join(tagSeparator);
    }
    
    const { negativePrompt, aspectRatio, additionalParams, seed } = advancedSettings;
    const paramParts: string[] = [];
    if (currentModelConfig.paramStyle === 'double-dash') {
        if (aspectRatio && aspectRatio !== 'none') paramParts.push(`--ar ${aspectRatio}`);
        if (seed.trim()) paramParts.push(`--seed ${seed.trim()}`);
    }
    if (currentModelConfig.negativePromptStyle === 'param' && negativePrompt.trim()) paramParts.push(`--no ${negativePrompt.trim()}`);
    if (additionalParams.trim()) paramParts.push(additionalParams.trim());

    let finalPrompt = mainPrompt;
    if (paramParts.length > 0) finalPrompt += ' ' + paramParts.join(' ');
    if (currentModelConfig.paramStyle === 'natural-append' && aspectRatio && aspectRatio !== 'none') finalPrompt += `, in a ${aspectRatio} aspect ratio`;
    if (currentModelConfig.negativePromptStyle === 'natural-append' && negativePrompt.trim()) finalPrompt += `, avoiding themes of ${negativePrompt.trim()}`;

    return finalPrompt.replace(/, ,/g, ',').replace(/  +/g, ' ').trim();
  }, [currentModelConfig, useBreak, advancedSettings]);

  const withApiKeyCheck = <T extends any[]>(callback: (apiKey: string, ...args: T) => Promise<void>) => {
      return async (...args: T) => {
          const apiKey = apiConfig.keys[apiConfig.provider];
          if (!apiKey) {
              setError(`API Key for ${apiConfig.provider} is not set. Please add one in API Settings.`);
              setShowApiSettings(true);
              return;
          }
          await callback(apiKey, ...args);
      };
  };

  const handleGenerate = useCallback(withApiKeyCheck(async (apiKey) => {
    if (!userInput.trim()) { setError('Please enter a description.'); return; }
    setIsLoading(true);
    setError(null);
    setGeneratedPrompts([]);
    try {
      const { structuredPrompts, negativePrompt } = await aiService.generatePromptVariations(apiConfig.provider, apiKey, userInput, numVariations, nsfwSettings, styleFilter, selectedModel);
      const formattedPrompts = structuredPrompts.map(p => formatSinglePrompt(p));
      setGeneratedPrompts(formattedPrompts);
      if (negativePrompt) setAdvancedSettings(prev => ({...prev, negativePrompt}));
      if (formattedPrompts.length > 0) {
        setHistory(prevHistory => {
          const newHistory = [...formattedPrompts.filter(p => !prevHistory.includes(p)), ...prevHistory].slice(0, 20);
          localStorage.setItem('promptHistory', JSON.stringify(newHistory));
          return newHistory;
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate prompt: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }), [userInput, numVariations, formatSinglePrompt, nsfwSettings, styleFilter, selectedModel, apiConfig]);
  
  const handleEnhance = useCallback(withApiKeyCheck(async (apiKey) => {
    if (!userInput.trim()) return;
    setIsEnhancing(true);
    setError(null);
    try {
        const enhancedText = await aiService.enhanceDescription(apiConfig.provider, apiKey, userInput, nsfwSettings, styleFilter);
        setUserInput(enhancedText);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Failed to enhance prompt: ${errorMessage}`);
    } finally {
        setIsEnhancing(false);
    }
  }), [userInput, nsfwSettings, styleFilter, apiConfig]);

  const handleRandom = useCallback(withApiKeyCheck(async (apiKey) => {
    setIsGeneratingRandom(true);
    setError(null);
    try {
      const randomDescription = await aiService.generateRandomDescription(apiConfig.provider, apiKey, nsfwSettings, styleFilter);
      setUserInput(randomDescription);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate a random description: ${errorMessage}`);
    } finally {
      setIsGeneratingRandom(false);
    }
  }), [nsfwSettings, styleFilter, apiConfig]);

  const handleSelectFromHistory = (prompt: string) => setGeneratedPrompts([prompt]);
  const handleClearHistory = () => { setHistory([]); localStorage.removeItem('promptHistory'); };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-3xl mx-auto">
        <Header />
        <main className="mt-8 space-y-6 bg-gray-800 p-6 rounded-lg shadow-xl">
          <ApiSettings
            isOpen={showApiSettings}
            onToggle={() => setShowApiSettings(prev => !prev)}
            config={apiConfig}
            onChange={setApiConfig}
          />

           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
              <div className="sm:col-span-2 md:col-span-2">
                <ModelSelector selectedModel={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} />
              </div>
              <div>
                <VariationSelector value={numVariations} onChange={setNumVariations} />
              </div>
              <Toggle
                label="BREAK"
                checked={useBreak}
                onChange={setUseBreak}
                disabled={!currentModelConfig.supportsBreak}
                tooltip={`Use BREAK to separate prompt sections. Supported by certain models (e.g., SDXL).

Example structure:
[score, quality]
BREAK
[person description]
BREAK
[clothing]
BREAK
[pose, camera angle]
BREAK
[location]
BREAK
[style, quality settings]`}
              />
              <Toggle 
                label="Advanced" 
                checked={showAdvanced} 
                onChange={setShowAdvanced}
                tooltip="Show advanced settings like negative prompt, aspect ratio, and seed."
              />
            </div>
          
          <StyleFilter selectedStyle={styleFilter} onChange={setStyleFilter} />
          <NsfwControls settings={nsfwSettings} onChange={setNsfwSettings} />

          <AdvancedSettings 
            isOpen={showAdvanced}
            settings={advancedSettings}
            onChange={setAdvancedSettings}
          />

          <PromptInput
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onGenerate={handleGenerate}
            onEnhance={handleEnhance}
            onRandom={handleRandom}
            isLoading={isLoading}
            isEnhancing={isEnhancing}
            isGeneratingRandom={isGeneratingRandom}
          />
          
          {error && <p className="text-red-400 text-center">{error}</p>}

          <PromptOutput 
            prompts={generatedPrompts} 
            isLoading={isLoading} 
            selectedModel={selectedModel}
            negativePrompt={advancedSettings.negativePrompt}
          />
          
          <History
            history={history}
            onSelect={handleSelectFromHistory}
            onClear={handleClearHistory}
          />
        </main>
      </div>
    </div>
  );
};

export default App;