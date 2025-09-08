

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
import { CharacterControls } from './components/CharacterControls';
import { ShotPresets } from './components/ShotPresets';
import { PosePresets } from './components/PosePresets';
import { LocationPresets } from './components/LocationPresets';
import { ClothingPresets } from './components/ClothingPresets';
import { PromptSnippets } from './components/PromptSnippets';
import { SaveSnippetModal } from './components/SaveSnippetModal';
import { ImageGenerator } from './components/ImageGenerator';
import { Instructions } from './components/Instructions';
import { LogoAnimation } from './components/LogoAnimation';
import { AgeVerificationModal } from './components/AgeVerificationModal';
import { MODEL_NAMES, MODELS } from './constants';
import type { StructuredPrompt, AdvancedSettingsState, NsfwSettingsState, StyleFilter as StyleFilterType, ApiConfigState, CharacterSettingsState, PromptSnippet } from './types';
import * as aiService from './services/aiService';

const getQualityTagsForStyle = (styleFilter: StyleFilterType): string[] => {
  if (styleFilter.main === 'anime') {
    return ['masterpiece', 'best quality', 'amazing quality', 'anime screenshot', 'absurdres'];
  }
  
  // Realistic styles
  switch (styleFilter.sub) {
    case 'professional':
      return ['photorealistic', 'professional photography', '8k', 'high detail', 'sharp focus', 'award-winning photograph'];
    case 'amateur':
      return ['realistic photograph', 'candid shot', 'amateur photography', 'photographic grain', 'natural look', 'unposed'];
    case 'flash':
      return ['flash photography', 'direct flash', 'harsh lighting', 'realistic', 'overexposed highlights', 'deep shadows', 'candid'];
    default:
      // A fallback for any unexpected sub-styles
      return ['photorealistic', 'best quality', 'high detail'];
  }
};


const App: React.FC = () => {
  const [userInput, setUserInput] = useState<string>('A young woman laughing, holding a bouquet of wildflowers in a sun-drenched meadow, shallow depth of field, golden hour.');
  const [selectedModel, setSelectedModel] = useState<string>('Google Imagen4');
  const [styleFilter, setStyleFilter] = useState<StyleFilterType>({ main: 'realistic', sub: 'amateur' });
  const [characterSettings, setCharacterSettings] = useState<CharacterSettingsState>({
    gender: 'any',
    age: 'any',
    bodyType: 'any',
    ethnicity: 'any',
    height: 'any',
    breastSize: 'any',
    hipsSize: 'any',
    buttSize: 'any',
    penisSize: 'any',
    muscleDefinition: 'any',
    facialHair: 'any',
  });
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
  const [snippets, setSnippets] = useState<PromptSnippet[]>([]);
  const [snippetToSave, setSnippetToSave] = useState<{ content: string } | null>(null);

  // State for image generation
  const [isImageGeneratorOpen, setIsImageGeneratorOpen] = useState<boolean>(false);
  const [promptForImageGen, setPromptForImageGen] = useState<string>('');
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [imageGenError, setImageGenError] = useState<string | null>(null);
  
  // State for selected presets
  const [selectedShotPresets, setSelectedShotPresets] = useState<string[]>([]);
  const [selectedPosePresets, setSelectedPosePresets] = useState<string[]>([]);
  const [selectedLocationPresets, setSelectedLocationPresets] = useState<string[]>([]);
  const [selectedClothingPresets, setSelectedClothingPresets] = useState<string[]>([]);

  // State for UI sections
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [showLogoAnimation, setShowLogoAnimation] = useState<boolean>(true);
  const [isAgeVerified, setIsAgeVerified] = useState<boolean>(() => {
    try {
        return localStorage.getItem('ageVerified') === 'true';
    } catch {
        return false;
    }
  });

  const currentModelConfig = useMemo(() => MODELS[selectedModel], [selectedModel]);
  const supportsImageGeneration = useMemo(() => ['google_gemini', 'openai'].includes(apiConfig.provider), [apiConfig.provider]);
  
  useEffect(() => {
    const animationTimer = setTimeout(() => setShowLogoAnimation(false), 4000);

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
        const storedSnippets = localStorage.getItem('promptSnippets');
        if (storedSnippets) setSnippets(JSON.parse(storedSnippets));
    } catch (e) { console.error("Failed to load snippets", e); }

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
    
    return () => clearTimeout(animationTimer);
  }, []);

  useEffect(() => {
    try {
        localStorage.setItem('advancedSettings', JSON.stringify(advancedSettings));
    } catch (e) { console.error("Failed to save advanced settings", e); }
  }, [advancedSettings]);

  useEffect(() => {
    try {
        localStorage.setItem('promptSnippets', JSON.stringify(snippets));
    } catch (e) { console.error("Failed to save snippets", e); }
  }, [snippets]);

  useEffect(() => {
    try {
        localStorage.setItem('apiConfig', JSON.stringify(apiConfig));
        if (!apiConfig.keys?.[apiConfig.provider]) {
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
    const qualityTagsString = getQualityTagsForStyle(styleFilter).join(tagSeparator);

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
  }, [currentModelConfig, useBreak, advancedSettings, styleFilter]);

  const withApiKeyCheck = <T extends any[]>(callback: (apiKey: string, ...args: T) => Promise<void>) => {
      return async (...args: T) => {
          const apiKey = apiConfig.keys?.[apiConfig.provider];
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
      const { structuredPrompts, negativePrompt } = await aiService.generatePromptVariations(apiConfig.provider, apiKey, userInput, numVariations, nsfwSettings, styleFilter, selectedModel, characterSettings);
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
  }), [userInput, numVariations, formatSinglePrompt, nsfwSettings, styleFilter, selectedModel, apiConfig, characterSettings]);
  
  const handleEnhance = useCallback(withApiKeyCheck(async (apiKey) => {
    if (!userInput.trim()) return;
    setIsEnhancing(true);
    setError(null);
    try {
        const enhancedText = await aiService.enhanceDescription(apiConfig.provider, apiKey, userInput, nsfwSettings, styleFilter, characterSettings);
        setUserInput(enhancedText);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Failed to enhance prompt: ${errorMessage}`);
    } finally {
        setIsEnhancing(false);
    }
  }), [userInput, nsfwSettings, styleFilter, apiConfig, characterSettings]);

  const handleRandom = useCallback(withApiKeyCheck(async (apiKey) => {
    setIsGeneratingRandom(true);
    setError(null);
    const allSelectedPresets = [
        ...selectedShotPresets,
        ...selectedPosePresets,
        ...selectedLocationPresets,
        ...selectedClothingPresets,
    ];
    try {
      const randomDescription = await aiService.generateRandomDescription(apiConfig.provider, apiKey, nsfwSettings, styleFilter, characterSettings, allSelectedPresets);
      setUserInput(randomDescription);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate a random description: ${errorMessage}`);
    } finally {
      setIsGeneratingRandom(false);
    }
  }), [nsfwSettings, styleFilter, apiConfig, characterSettings, selectedShotPresets, selectedPosePresets, selectedLocationPresets, selectedClothingPresets]);

  const handleSelectFromHistory = (prompt: string) => setGeneratedPrompts([prompt]);
  const handleClearHistory = () => { setHistory([]); localStorage.removeItem('promptHistory'); };

  const handleAppendToInput = useCallback((textToAppend: string) => {
    setUserInput(prev => {
        if (!prev.trim()) return textToAppend;
        const lastChar = prev.trim().slice(-1);
        if (['.', ',', ';'].includes(lastChar)) {
            return `${prev.trim()} ${textToAppend}`;
        }
        return `${prev.trim()}, ${textToAppend}`;
    });
  }, []);
  
  const handleInitiateSaveSnippet = useCallback((content: string) => {
    if (!content.trim()) {
        setError("Cannot save an empty snippet.");
        return;
    }
    setSnippetToSave({ content });
  }, []);

  const handleConfirmSaveSnippet = useCallback((name: string) => {
    if (!snippetToSave) return;
    const newSnippet: PromptSnippet = {
      id: Date.now().toString(),
      name,
      content: snippetToSave.content,
    };
    setSnippets(prev => [newSnippet, ...prev]);
    setSnippetToSave(null);
  }, [snippetToSave]);

  const handleCancelSaveSnippet = useCallback(() => {
    setSnippetToSave(null);
  }, []);

  const handleDeleteSnippet = useCallback((id: string) => {
    setSnippets(prev => prev.filter(s => s.id !== id));
  }, []);

  const handleSendToGenerator = useCallback((prompt: string) => {
    setPromptForImageGen(prompt);
    setIsImageGeneratorOpen(true);
    setGeneratedImageUrl(null);
    setImageGenError(null);
    setTimeout(() => {
        document.getElementById('image-generator-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  const handleGenerateImage = useCallback(async (promptToGenerate: string, resolution: '1k' | '2k') => {
    const { provider, keys } = apiConfig;
    
    if (!supportsImageGeneration) {
        setImageGenError(`Image generation is not supported for the ${provider} provider.`);
        return;
    }

    const apiKey = keys?.[provider];
    if (!apiKey) {
        setImageGenError(`API Key for ${provider} is not set. Please add one in API Settings.`);
        setShowApiSettings(true);
        return;
    }
    
    if (!promptToGenerate.trim()) {
        setImageGenError('Prompt cannot be empty.');
        return;
    }
    setIsGeneratingImage(true);
    setGeneratedImageUrl(null);
    setImageGenError(null);

    const validAspectRatios = ["1:1", "3:4", "4:3", "9:16", "16:9"];
    const aspectRatioForApi = validAspectRatios.includes(advancedSettings.aspectRatio) ? advancedSettings.aspectRatio : '1:1';

    try {
        const imageUrl = await aiService.generateImage(provider, apiKey, promptToGenerate, resolution, aspectRatioForApi);
        setGeneratedImageUrl(imageUrl);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setImageGenError(`Failed to generate image: ${errorMessage}`);
    } finally {
        setIsGeneratingImage(false);
    }
  }, [apiConfig, advancedSettings.aspectRatio, supportsImageGeneration]);

  const handleAgeConfirm = () => {
    try {
        localStorage.setItem('ageVerified', 'true');
    } catch (e) {
        console.error("Failed to save age verification status", e);
    }
    setIsAgeVerified(true);
  };

  const handleAgeDeny = () => {
      window.open('https://www.cisa.gov/resources-tools/programs/cybersecurity-education-career-development/resources-grades-k-5', '_top');
  };

  return (
    <>
      <LogoAnimation show={showLogoAnimation} />

      {!showLogoAnimation && !isAgeVerified && (
        <AgeVerificationModal onConfirm={handleAgeConfirm} onDeny={handleAgeDeny} />
      )}

      <div className={`min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center p-4 sm:p-6 lg:p-8 ${!showLogoAnimation && isAgeVerified ? 'animate-fade-in' : 'opacity-0'}`}>
        {isAgeVerified && (
          <div className="w-full max-w-3xl mx-auto">
            <Header />
            <main className="mt-8 space-y-6 bg-gray-800 p-6 rounded-lg shadow-xl">
              <Instructions
                isOpen={showInstructions}
                onToggle={() => setShowInstructions(prev => !prev)}
              />
              
              <ApiSettings
                isOpen={showApiSettings}
                onToggle={() => setShowApiSettings(prev => !prev)}
                config={apiConfig}
                onChange={setApiConfig}
              />

              <div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div className="md:col-span-2">
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
                  <p className="text-xs text-gray-500 mt-2">
                    Supported Models: {MODEL_NAMES.join(', ')}
                  </p>
              </div>
              
              <StyleFilter selectedStyle={styleFilter} onChange={setStyleFilter} />
              <CharacterControls settings={characterSettings} onChange={setCharacterSettings} />
              <NsfwControls settings={nsfwSettings} onChange={setNsfwSettings} />
              
              <ShotPresets
                onAppend={handleAppendToInput}
                selectedPresets={selectedShotPresets}
                onSelectedPresetsChange={setSelectedShotPresets}
              />
              <PosePresets
                onAppend={handleAppendToInput}
                selectedPresets={selectedPosePresets}
                onSelectedPresetsChange={setSelectedPosePresets}
              />
              <LocationPresets
                onAppend={handleAppendToInput}
                selectedPresets={selectedLocationPresets}
                onSelectedPresetsChange={setSelectedLocationPresets}
              />
              <ClothingPresets
                onAppend={handleAppendToInput}
                selectedPresets={selectedClothingPresets}
                onSelectedPresetsChange={setSelectedClothingPresets}
              />
              
              <PromptSnippets
                snippets={snippets}
                onAppend={handleAppendToInput}
                onDelete={handleDeleteSnippet}
              />

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
                onSaveSnippet={handleInitiateSaveSnippet}
              />
              
              {error && <p className="text-red-400 text-center">{error}</p>}

              <PromptOutput 
                prompts={generatedPrompts} 
                isLoading={isLoading} 
                selectedModel={selectedModel}
                negativePrompt={advancedSettings.negativePrompt}
                supportsImageGeneration={supportsImageGeneration}
                onSendToGenerator={handleSendToGenerator}
              />
              
              <ImageGenerator
                isOpen={isImageGeneratorOpen}
                onToggle={() => setIsImageGeneratorOpen(prev => !prev)}
                prompt={promptForImageGen}
                onPromptChange={setPromptForImageGen}
                onGenerate={handleGenerateImage}
                imageUrl={generatedImageUrl}
                isLoading={isGeneratingImage}
                error={imageGenError}
                supportsImageGeneration={supportsImageGeneration}
              />

              <History
                history={history}
                onSelect={handleSelectFromHistory}
                onClear={handleClearHistory}
              />
            </main>
            
            {snippetToSave && (
              <SaveSnippetModal
                content={snippetToSave.content}
                onSave={handleConfirmSaveSnippet}
                onCancel={handleCancelSaveSnippet}
              />
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default App;