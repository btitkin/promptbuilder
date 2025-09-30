import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { ModelSelector } from './components/ModelSelector';
import { Toggle } from './components/Toggle';
import { PromptInput } from './components/PromptInput';
import { PromptOutput } from './components/PromptOutput';
import { History } from './components/History';
import { AdvancedSettings } from './components/AdvancedSettings';
import { NsfwControls } from './components/NsfwControls';
import { StyleFilter } from './components/StyleFilter';
import { StylePresets } from './components/StylePresets';
import { ApiSettings } from './components/ApiSettings';
import { SettingsManager } from './components/SettingsManager';
import { CharacterControls } from './components/CharacterControls';
import { CharacterStylePresets } from './components/CharacterStylePresets';
import { ShotPresets } from './components/ShotPresets';
import { PosePresets } from './components/PosePresets';
import { LocationPresets } from './components/LocationPresets';
import { ClothingPresets } from './components/ClothingPresets';
import { HairPresets } from './components/HairPresets';
import { RoleplayPresets } from './components/RoleplayPresets';
import { PhysicalFeaturesPresets } from './components/PhysicalFeaturesPresets';
import { FacialExpressionsPresets } from './components/FacialExpressionsPresets';
import { EmotionalStatesPresets } from './components/EmotionalStatesPresets';
import { NSFWExpressionsPresets } from './components/NSFWExpressionsPresets';
import { FantasyRacesPresets } from './components/FantasyRacesPresets';
import { CreaturesPresets } from './components/CreaturesPresets';
import { PropsPresets } from './components/PropsPresets';
import { NSFWPropsPresets } from './components/NSFWPropsPresets';
import { TimeOfDayPresets } from './components/TimeOfDayPresets';
import { SpecialEffectsPresets } from './components/SpecialEffectsPresets';
import { AtmosphericPresets } from './components/AtmosphericPresets';
import { sfwClothing, nsfwClothing, hardcoreClothing } from './components/ClothingPresets';
import { casualSfwPoses, heroSfwPoses, nsfwPoses, hardcorePoses } from './components/PosePresets';
import { insidePresets as insideLocationPresets, outsidePresets as outsideLocationPresets, nsfwPresets as nsfwLocationPresets } from './components/LocationPresets';

import { PromptSnippets } from './components/PromptSnippets';
import { SaveSnippetModal } from './components/SaveSnippetModal';
import { ImageGenerator } from './components/ImageGenerator';
import { Instructions } from './components/Instructions';
import { LogoAnimation } from './components/LogoAnimation';
import { AgeVerificationModal } from './components/AgeVerificationModal';
import { MODEL_NAMES, MODELS, DEFAULT_NEGATIVE_PROMPT } from './constants';
import type { AppSettings, StructuredPrompt, AdvancedSettingsState, NsfwSettingsState, StyleFilter as StyleFilterType, ApiConfigState, CharacterSettingsState, PromptSnippet, ApiProvider } from './types';
import * as aiService from './services/aiService';
import { RotateCcw } from 'lucide-react';
import { cleanLLMText, normalizeNarrative, normalizeToTagsLine } from './services/sanitizer';

const getQualityTagsForStyle = (styleFilter: StyleFilterType): string[] => {
  if (styleFilter.main === 'anime') {
    return ['masterpiece', 'best quality', 'amazing quality', 'anime screenshot', 'absurdres'];
  }
  
  // Realistic styles
  switch (styleFilter.sub) {
    case 'film photography':
      return ['film grain', 'analog photography', 'vintage aesthetic', 'natural lighting', 'authentic colors', 'traditional photography'];
    case 'webcam':
      return ['webcam quality', 'casual photography', 'soft focus', 'basic lighting', 'amateur shot', 'low resolution'];
    case 'spycam':
      return ['hidden camera', 'candid shot', 'grainy', 'surveillance style', 'unposed', 'low light'];
    case 'cctv':
      return ['security camera', 'wide angle', 'harsh lighting', 'surveillance footage', 'institutional lighting', 'monitoring'];
    case 'smartphone':
      return ['mobile photography', 'smartphone camera', 'casual composition', 'everyday photography', 'handheld', 'social media style'];
    case 'polaroid':
      return ['instant camera', 'vintage borders', 'nostalgic colors', 'retro aesthetic', 'square format', 'faded colors'];
    case 'analog':
      return ['film photography', 'authentic grain', 'natural colors', 'classic techniques', 'traditional processing', 'timeless'];
    case 'editorial':
      return ['magazine quality', 'professional composition', 'polished lighting', 'high fashion', 'editorial style', 'commercial photography'];
    case 'portrait studio':
      return ['studio lighting', 'controlled environment', 'professional portrait', 'formal composition', 'clean background', 'portrait photography'];
    case 'street photography':
      return ['urban scenes', 'candid moments', 'natural lighting', 'documentary style', 'authentic life', 'photojournalism'];
    case 'fashion editorial':
      return ['high fashion', 'dramatic lighting', 'artistic composition', 'fashion photography', 'editorial style', 'avant-garde'];
    default:
      // A fallback for any unexpected sub-styles
      return ['photorealistic', 'best quality', 'high detail'];
  }
};


// Using centralized cleanLLMText from services/sanitizer

function App(): JSX.Element {
  const [userInput, setUserInput] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('Google Imagen4');
  const [styleFilter, setStyleFilter] = useState<StyleFilterType>({ main: 'realistic', sub: 'film photography' });

  const handleResetStyleFilter = useCallback(() => {
    // Reset style filter to default
    setStyleFilter({ main: 'realistic', sub: 'film photography' });
    
    // Reset all preset selections
    setSelectedShotPresets([]);
    setSelectedPosePresets([]);
    setSelectedLocationPresets([]);
    setSelectedClothingPresets([]);
    setSelectedHairPresets([]);
    setSelectedStylePresets([]);
    setSelectedCharacterStylePresets([]);
    setSelectedRoleplayPresets([]);
    setSelectedPhysicalFeaturesPresets([]);
    setSelectedFacialExpressionsPresets([]);
    setSelectedEmotionalStatesPresets([]);
    setSelectedNSFWExpressionsPresets([]);
    setSelectedFantasyRacesPresets([]);
    setSelectedCreaturesPresets([]);
    setSelectedPropsPresets([]);
    setSelectedNSFWPropsPresets([]);
    setSelectedTimeOfDayPresets([]);
    setSelectedSpecialEffectsPresets([]);
    setSelectedAtmosphericPresets([]);
    
    // Reset character settings to default
    setCharacterSettings({
      sceneType: 'solo',
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
      characterStyle: 'any',
      roleplay: 'none',
      overlays: { furry: false, monster: false, sciFi: false },
    });
    
    // Reset NSFW settings to default
    setNsfwSettings({
      mode: 'off',
      nsfwLevel: 5,
      hardcoreLevel: 5,
      enhancePerson: true,
      enhancePose: true,
      enhanceLocation: true,
      isNsfwEnabled: false,
    });
    
    // Reset other settings to default
    setUseBreak(false);
    setShowAdvanced(false);
    setAdvancedSettings({
      negativePrompt: 'ugly, blurry, bad anatomy, worst quality',
      aspectRatio: '1:1',
      additionalParams: '',
      seed: '',
    });
    setEnhanceRound(0);
    setLockedPhrases([]);
  }, []);

  const [characterSettings, setCharacterSettings] = useState<CharacterSettingsState>({
    sceneType: 'solo',
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
    characterStyle: 'any',
    roleplay: 'none',
    overlays: { furry: false, monster: false, sciFi: false },
  });
  const [nsfwSettings, setNsfwSettings] = useState<NsfwSettingsState>({
    mode: 'off',
    nsfwLevel: 5,
    hardcoreLevel: 5,
    enhancePerson: true,
    enhancePose: true,
    enhanceLocation: true,
    isNsfwEnabled: false,
  });
  const [useBreak, setUseBreak] = useState<boolean>(false);
  const [generatedPrompts, setGeneratedPrompts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGeneratingKeywords, setIsGeneratingKeywords] = useState<boolean>(false);
  const [isGeneratingRandom, setIsGeneratingRandom] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettingsState>({
    negativePrompt: DEFAULT_NEGATIVE_PROMPT,
    aspectRatio: '1:1',
    additionalParams: '',
    seed: '',
  });
  const [showApiSettings, setShowApiSettings] = useState<boolean>(false);
  const [apiConfig, setApiConfig] = useState<ApiConfigState>({
    provider: 'custom_local',
    keys: {},
    customConfig: {
      url: 'http://localhost:11434',
      key: '',
      model: 'Qwen2.5-7B-Instruct-Q4_K_M'
    }
  });

  const [snippets, setSnippets] = useState<PromptSnippet[]>([]);
  const [snippetToSave, setSnippetToSave] = useState<{ content: string } | null>(null);
  // New: enhance round and locked phrases
  const [enhanceRound, setEnhanceRound] = useState<number>(0);
  const [lockedPhrases, setLockedPhrases] = useState<string[]>([]);

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
  const [selectedHairPresets, setSelectedHairPresets] = useState<string[]>([]);
  const [selectedStylePresets, setSelectedStylePresets] = useState<string[]>([]);
  const [selectedCharacterStylePresets, setSelectedCharacterStylePresets] = useState<string[]>([]);
  const [selectedRoleplayPresets, setSelectedRoleplayPresets] = useState<string[]>([]);
  const [selectedPhysicalFeaturesPresets, setSelectedPhysicalFeaturesPresets] = useState<string[]>([]);
  const [selectedFacialExpressionsPresets, setSelectedFacialExpressionsPresets] = useState<string[]>([]);
  const [selectedEmotionalStatesPresets, setSelectedEmotionalStatesPresets] = useState<string[]>([]);
  const [selectedNSFWExpressionsPresets, setSelectedNSFWExpressionsPresets] = useState<string[]>([]);
  const [selectedFantasyRacesPresets, setSelectedFantasyRacesPresets] = useState<string[]>([]);
  const [selectedCreaturesPresets, setSelectedCreaturesPresets] = useState<string[]>([]);
  const [selectedPropsPresets, setSelectedPropsPresets] = useState<string[]>([]);
  const [selectedNSFWPropsPresets, setSelectedNSFWPropsPresets] = useState<string[]>([]);
  const [selectedTimeOfDayPresets, setSelectedTimeOfDayPresets] = useState<string[]>([]);
  const [selectedSpecialEffectsPresets, setSelectedSpecialEffectsPresets] = useState<string[]>([]);
  const [selectedAtmosphericPresets, setSelectedAtmosphericPresets] = useState<string[]>([]);


  // State for UI sections
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [showLogoAnimation, setShowLogoAnimation] = useState<boolean>(() => {
    try {
      const isAutomation = typeof navigator !== 'undefined' && (navigator as any).webdriver === true;
      const disableSplash = typeof window !== 'undefined' && window.localStorage.getItem('disableSplash') === 'true';
      return !(isAutomation || disableSplash);
    } catch {
      return true;
    }
  });
  const [isAgeVerified, setIsAgeVerified] = useState<boolean>(() => {
    try {
        const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        if (isLocalhost) {
          localStorage.setItem('ageVerified', 'true');
          return true;
        }
        return localStorage.getItem('ageVerified') === 'true';
    } catch {
        return false;
    }
  });

  const currentModelConfig = useMemo(() => MODELS[selectedModel], [selectedModel]);
  const supportsImageGeneration = useMemo(() => ['google_gemini', 'openai'].includes(apiConfig.provider), [apiConfig.provider]);
  
  // Global Reset All function
  const handleResetAllPresets = useCallback(() => {
    setSelectedShotPresets([]);
    setSelectedPosePresets([]);
    setSelectedLocationPresets([]);
    setSelectedClothingPresets([]);
    setSelectedHairPresets([]);
    setSelectedStylePresets([]);
    setSelectedCharacterStylePresets([]);
    setSelectedRoleplayPresets([]);
    setSelectedPhysicalFeaturesPresets([]);
    setSelectedFacialExpressionsPresets([]);
    setSelectedEmotionalStatesPresets([]);
    setSelectedNSFWExpressionsPresets([]);
    setSelectedFantasyRacesPresets([]);
    setSelectedCreaturesPresets([]);
    setSelectedPropsPresets([]);
    setSelectedNSFWPropsPresets([]);
    setSelectedTimeOfDayPresets([]);
    setSelectedSpecialEffectsPresets([]);
    setSelectedAtmosphericPresets([]);
  }, []);

  // Calculate total selected presets for the Reset All button
  const totalSelectedPresets = useMemo(() => {
    return selectedShotPresets.length + 
           selectedPosePresets.length + 
           selectedLocationPresets.length + 
           selectedClothingPresets.length + 
           selectedHairPresets.length + 
           selectedStylePresets.length + 
           selectedCharacterStylePresets.length + 
           selectedRoleplayPresets.length + 
           selectedPhysicalFeaturesPresets.length + 
           selectedFacialExpressionsPresets.length + 
           selectedEmotionalStatesPresets.length + 
           selectedNSFWExpressionsPresets.length + 
           selectedFantasyRacesPresets.length + 
           selectedCreaturesPresets.length + 
           selectedPropsPresets.length + 
           selectedNSFWPropsPresets.length + 
           selectedTimeOfDayPresets.length + 
           selectedSpecialEffectsPresets.length + 
           selectedAtmosphericPresets.length;
  }, [
    selectedShotPresets, selectedPosePresets, selectedLocationPresets,
    selectedClothingPresets, selectedHairPresets, selectedStylePresets,
    selectedCharacterStylePresets, selectedRoleplayPresets, selectedPhysicalFeaturesPresets,
    selectedFacialExpressionsPresets, selectedEmotionalStatesPresets, selectedNSFWExpressionsPresets,
    selectedFantasyRacesPresets, selectedCreaturesPresets, selectedPropsPresets,
    selectedNSFWPropsPresets, selectedTimeOfDayPresets, selectedSpecialEffectsPresets,
    selectedAtmosphericPresets
  ]);
  
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
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        setAdvancedSettings(prev => ({
          ...prev,
          ...parsed,
          negativePrompt:
            parsed?.negativePrompt && parsed.negativePrompt.trim() !== ''
              ? parsed.negativePrompt
              : prev.negativePrompt,
        }));
      }
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
        // Don't show API settings for local LLM
        if (parsedConfig.provider !== 'custom_local' && !parsedConfig.keys?.[parsedConfig.provider]) {
          setShowApiSettings(true);
        }
      } else {
        // Don't show API settings by default since we're using local LLM
        setShowApiSettings(false);
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
        // Don't show API settings for local LLM
        if (apiConfig.provider !== 'custom_local' && !apiConfig.keys?.[apiConfig.provider]) {
            setShowApiSettings(true);
        }
    } catch (e) { console.error("Failed to save API config", e); }
  }, [apiConfig]);



  const tagifySubjectForTaggedModel = (text: string): string[] => {
    const base = (text || '').replace(/\s+/g, ' ').trim();
    if (!base) return [];
    // Split by common separators and sentence boundaries
    const chunks = base
      .split(/[\n\r]+|BREAK|[,:;\.]+/)
      .map(s => s.trim())
      .filter(Boolean);
  
    // Further split by conjunctions to isolate concise phrases
    let parts: string[] = [];
    chunks.forEach(c => {
      parts.push(
        ...c
          .split(/\b(?:and|with|while|as|in|on|at|by|featuring|including)\b/i)
          .map(s => s.trim())
          .filter(Boolean)
      );
    });
  
    // Clean up quotes/dashes, drop overly long phrases, and dedupe
    const seen = new Set<string>();
    let result: string[] = [];
    parts
      .map(s => s.replace(/^["'`\-]+|["'`]+$/g, '').trim())
      .filter(Boolean)
      .filter(s => s.split(/\s+/).length <= 12)
      .forEach(p => {
        const key = p.toLowerCase();
        if (!seen.has(key)) { seen.add(key); result.push(p); }
      });
  
    // Heuristically filter out pronouns, function-words, and verb-only fragments
    const stopSingle = /^(?:a|an|the|and|or|but|with|without|in|on|at|by|for|to|from|of|her|his|their|your|my|our|its|she|he|they|them|me|you|we)$/i;
    const badVerbs = /\b(?:lying|lies|lie|reclining|recline|reclines|standing|sitting|holding|gazing|looking|propped|leaning|kneeling|squatting|walking|running|smiling|laughing)\b/i;
    const badAnatomy = /\b(?:stomach|elbow|elbows|hips|breast|breasts|buttock|buttocks|ass|penis|vagina)\b/i;

    result = result.filter(p => {
      const lower = p.toLowerCase();
      if (stopSingle.test(lower)) return false;
      if (/^(?:her|his|their)\b/.test(lower)) return false;
      if (badVerbs.test(lower)) return false;
      if (badAnatomy.test(lower)) return false;
      if (lower.length <= 2) return false;
      return true;
    });

    return result;
  };

  // Keep only core subject tokens suitable for tag lists (gender/noun + optional age/ethnicity)
  const refineSubjectTags = (original: string, tagified: string[]): string[] => {
    const lowerOrig = (original || '').toLowerCase();
    const demographic = ['woman','man','male','female','girl','boy','person','people','lady','gentleman'];
    const ethnicities = ['asian','japanese','chinese','korean','indian','south asian','east asian','middle eastern','arab','arabic','black','african','african american','white','caucasian','latina','latino','hispanic','mediterranean','european','slavic','russian','persian','turkish','thai','vietnamese','filipino','brazilian','mexican'];
    const out: string[] = [];

    // 1) Core subject (e.g., "woman", "man", or phrase containing it)
    const core = tagified.find(t => /(woman|man|male|female|girl|boy|person)/i.test(t));
    if (core) out.push(core);
    else {
      const word = demographic.find(w => lowerOrig.includes(w));
      if (word) out.push(word);
    }

    // 2) Age pattern (e.g., "25-year-old")
    const ageMatch = lowerOrig.match(/\b(\d{1,2}\s*-?\s*year[- ]old)\b/);
    if (ageMatch && !out.some(t => t.toLowerCase().includes('year'))) out.unshift(ageMatch[1]);

    // 3) Ethnicity tokens (pick at most one)
    const eth = ethnicities.find(e => lowerOrig.includes(e));
    if (eth) out.splice(out.length > 0 ? 1 : 0, 0, eth); // insert near the front

    // De-duplicate while preserving order
    const seen = new Set<string>();
    return out.filter(t => {
      const key = t.toLowerCase();
      if (seen.has(key)) return false; seen.add(key); return true;
    }).slice(0, 3); // keep it compact
  };

  const formatSinglePrompt = useCallback((structuredPrompt: StructuredPrompt): string => {
    const processedCategories: { [key: string]: string[] } = {};

    // Preserve original subject for narrative (before any tagification)
    const rawSubjectArr = Array.isArray((structuredPrompt as any).subject)
      ? ((structuredPrompt as any).subject as any[]).map(v => (v == null ? '' : String(v))).filter(Boolean)
      : ((structuredPrompt as any).subject != null && (structuredPrompt as any).subject !== '' ? [String((structuredPrompt as any).subject)] : []);
    const originalSubjectText = rawSubjectArr.join(' ').replace(/\s+/g, ' ').trim();

    for (const key in structuredPrompt) {
        const category = key as keyof StructuredPrompt;
        const raw: any = (structuredPrompt as any)[category];
        const tags: string[] = Array.isArray(raw)
          ? raw.map((t: any) => (t == null ? '' : String(t)))
          : (raw != null && raw !== '' ? [String(raw)] : []);
        // Sanitize: remove any accidental BREAK tokens coming from the LLM
        const sanitized = tags
          .flatMap(t => String(t).split(/(?:\n|\r|\s)*BREAK(?:\n|\r|\s)*/i))
          .map(s => s.replace(/\s+/g, ' ').trim())
          .filter(s => s && s.toUpperCase() !== 'BREAK');
        processedCategories[category] = sanitized.filter(tag => tag.trim() !== '');
    }

    // Convert subject to concise tags for tagged-style models (e.g., SDXL, Pony, Stable Cascade)
    if (currentModelConfig.syntaxStyle === 'tagged' && processedCategories['subject']?.length) {
        const tagified = processedCategories['subject'].flatMap(t => tagifySubjectForTaggedModel(t));
        // Fallback: if tagification yields nothing, keep original subject
        if (tagified.length > 0) {
            // Normalize subject tags to lower-case for cleaner tag-style
            processedCategories['subject'] = tagified.map(t => t.toLowerCase());
        }
    }
    
    const taggedOrder: (keyof StructuredPrompt)[] = ['subject', 'attributes', 'action', 'pose', 'clothing', 'location', 'background', 'style'];
    const naturalOrder: (keyof StructuredPrompt)[] = ['subject', 'action', 'pose', 'clothing', 'attributes', 'location', 'background', 'style'];
    const categoryOrder = currentModelConfig.syntaxStyle === 'tagged' ? taggedOrder : naturalOrder;
  
    let mainPrompt = '';
    const { tagSeparator, qualityTagsLocation, promptPrefix, syntaxStyle } = currentModelConfig;
    const qualityTagsString = getQualityTagsForStyle(styleFilter).join(tagSeparator);
  
    if (syntaxStyle === 'natural') {
        const naturalParts: string[] = [];
        // removed promptPrefix to keep output clean
        categoryOrder.forEach(category => {
            if (processedCategories[category]?.length > 0) naturalParts.push(processedCategories[category].join(' '));
        });
        mainPrompt = naturalParts.filter(p => p.trim() !== '').join(', ');
        if (qualityTagsLocation === 'append' && qualityTagsString) mainPrompt += (mainPrompt ? ', ' : '') + qualityTagsString;
        else if (qualityTagsLocation === 'prepend' && qualityTagsString) mainPrompt = `${qualityTagsString}, ${mainPrompt}`;
    } else if (currentModelConfig.supportsBreak && useBreak) {
        // For tagged models with BREAK support (e.g., SDXL/ComfyUI pipelines), produce multiple thematic sections:
        // 1) Subject + attributes (tags)
        // 2) Action + pose (scene dynamics)
        // 3) Clothing (or "nude" etc.)
        // 4) Location + background (scene context)
        // 5) Style + quality tags (camera/quality/photography aesthetics)
        const sections: string[] = [];

        // 1) Subject + attributes (refined subject tags to avoid verb/pronoun noise)
        const subjParts: string[] = [];
        if (processedCategories['subject']?.length > 0) {
            const refined = refineSubjectTags(originalSubjectText, processedCategories['subject']);
            if (refined.length > 0) subjParts.push(refined.join(tagSeparator));
        }
        if (processedCategories['attributes']?.length > 0) {
            subjParts.push(processedCategories['attributes'].join(tagSeparator));
        }
        const section1 = subjParts.filter(Boolean).join(tagSeparator);
        if (section1) sections.push(section1);

        // 2) Action + pose
        const actionPose: string[] = [];
        if (processedCategories['action']?.length > 0) actionPose.push(processedCategories['action'].join(', '));
        if (processedCategories['pose']?.length > 0) actionPose.push(processedCategories['pose'].join(', '));
        const section2 = actionPose.filter(Boolean).join(', ');
        if (section2) sections.push(section2);

        // 3) Clothing
        const section3 = processedCategories['clothing']?.length ? processedCategories['clothing'].join(', ') : '';
        if (section3) sections.push(section3);

        // 4) Location + background
        const locBg: string[] = [];
        if (processedCategories['location']?.length > 0) locBg.push(processedCategories['location'].join(', '));
        if (processedCategories['background']?.length > 0) locBg.push(processedCategories['background'].join(', '));
        const section4 = locBg.filter(Boolean).join(', ');
        if (section4) sections.push(section4);

        // 5) Style + quality tags — in ComfyUI this often appears at the end
        const styleQuality: string[] = [];
        if (processedCategories['style']?.length > 0) styleQuality.push(processedCategories['style'].join(tagSeparator));
        if (qualityTagsString) styleQuality.push(qualityTagsString);
        const section5 = styleQuality.filter(Boolean).join(tagSeparator);
        if (section5) sections.push(section5);

        const dedupedSections = sections.map(sec => {
          const deduped = normalizeToTagsLine(sec, 60);
          return tagSeparator === ', ' ? deduped : deduped.split(', ').join(tagSeparator);
        });
        mainPrompt = dedupedSections.join('\n\nBREAK\n\n');
      } else {
           // Tagged model but BREAK disabled – flatten into a single comma-separated list
           const flatParts: string[] = [];
           if (qualityTagsLocation === 'prepend' && qualityTagsString) flatParts.push(qualityTagsString);
           categoryOrder.forEach(category => {
             if (processedCategories[category]?.length > 0) flatParts.push(processedCategories[category].join(tagSeparator));
           });
           if (qualityTagsLocation === 'append' && qualityTagsString) flatParts.push(qualityTagsString);
           const dedupedFlat = normalizeToTagsLine(flatParts.filter(Boolean).join(', '), 60);
           mainPrompt = tagSeparator === ', ' ? dedupedFlat : dedupedFlat.split(', ').join(tagSeparator);
       }

    const { negativePrompt, aspectRatio, additionalParams, seed } = advancedSettings;
    const isMidJourney = currentModelConfig.name === 'MidJourney';
    if (isMidJourney) {
      const allowedAr = new Set(['1:1','16:9','9:16','4:3','3:4']);
      if (aspectRatio && aspectRatio !== 'none' && !allowedAr.has(aspectRatio)) {
        throw new Error(`MidJourney: Unsupported aspect ratio "${aspectRatio}". Use one of 1:1, 16:9, 9:16, 4:3, 3:4`);
      }
      if (seed.trim()) {
        const seedNum = Number(seed.trim());
        if (!Number.isInteger(seedNum) || seedNum < 0 || seedNum > 4294967295) {
          throw new Error('MidJourney: Seed must be an integer between 0 and 4294967295');
        }
      }
      if (/--(ar|seed|no)\b/i.test(additionalParams)) {
        throw new Error('MidJourney: Do not include --ar/--seed/--no in Additional Parameters; they are added automatically');
      }
      if (negativePrompt.includes('--')) {
        throw new Error('MidJourney: Negative Prompt must not contain parameter flags like --; use comma-separated terms only');
      }
    }
    let finalPrompt = mainPrompt;
    const paramParts: string[] = [];
    if (currentModelConfig.paramStyle === 'double-dash') {
      if (aspectRatio && aspectRatio !== 'none') paramParts.push(`--ar ${aspectRatio}`);
      if (seed.trim()) paramParts.push(`--seed ${seed.trim()}`);
      if (additionalParams.trim()) paramParts.push(additionalParams.trim());
    }
    if (currentModelConfig.negativePromptStyle === 'param' && negativePrompt.trim()) paramParts.push(`--no ${negativePrompt.trim()}`);
    // Usunięto drugie, zbędne dodanie additionalParams, aby uniknąć duplikacji

    if (paramParts.length > 0) finalPrompt += ' ' + paramParts.join(' ');
    if (currentModelConfig.paramStyle === 'natural-append' && aspectRatio && aspectRatio !== 'none') finalPrompt += `, in a ${aspectRatio} aspect ratio`;
    if (currentModelConfig.negativePromptStyle === 'natural-append' && negativePrompt.trim()) finalPrompt += `, avoiding themes of ${negativePrompt.trim()}`;

    return finalPrompt.replace(/, ,/g, ',').replace(/  +/g, ' ').trim();
  }, [currentModelConfig, useBreak, advancedSettings, styleFilter]);

  const withApiKeyCheck = <T extends any[]>(callback: (apiKey: string, ...args: T) => Promise<void>) => {
      return async (...args: T) => {
          if (apiConfig.provider === 'custom_local' || apiConfig.provider === 'qwen') {
              if (!apiConfig.customConfig?.url || !apiConfig.customConfig?.model) {
                  setError('Custom API configuration is incomplete. Please set URL and model in API Settings.');
                  setShowApiSettings(true);
                  return;
              }
              await callback('', ...args);
              return;
          }

          const apiKey = apiConfig.keys?.[apiConfig.provider];
          if (!apiKey) {
              setError(`Please set your ${apiConfig.provider} API key in the API Settings.`);
              setShowApiSettings(true);
              return;
          }
          await callback(apiKey, ...args);
      };
  };

  // SIMPLIFIED one-step process for the "Generate Prompt" button
  async function generateFinalPrompt() { 
    // Step 1: Get the text FROM THE MAIN TEXT BOX. THIS IS CRITICAL. 
    const inputText = getMainDescriptionTextBoxValue(); 
    if (!inputText) { 
      // Handle empty input error 
      return; 
    } 
   
    // Step 2: Detect whether input is a keyword list or a paragraph
    const isList = isKeywordList(inputText);

    // If keyword list, first convert to a descriptive paragraph respecting settings
    let narrative = inputText;
    if (isList) {
      try {
        const enhanced = await aiService.enhanceDescription(
          apiConfig.provider,
          apiConfig.keys[apiConfig.provider] || '',
          inputText,
          nsfwSettings,
          styleFilter,
          characterSettings,
          apiConfig.customConfig
        );
        narrative = cleanLLMText(enhanced);
      } catch (e) {
        console.warn('EnhanceDescription failed, proceeding with raw input.', e);
      }
    }

    // Step 3: Format the resulting paragraph into a final, model-specific prompt
    const selectedModel = getSelectedAIModelFromUI();
    const finalPrompt = await callAIWithInput(narrative, selectedModel);
   
    // Step 4: Display the final result in the "Generated Prompts" output area. 
    setFinalPromptOutput(finalPrompt); 
  }

  // Helper function to get main description text box value
  const getMainDescriptionTextBoxValue = () => {
    return userInput;
  };

  // Helper function to get selected AI model from UI
  const getSelectedAIModelFromUI = () => {
    return selectedModel;
  };

  // Helper function to call AI
  const callAIWithInput = async (input: string, modelName: string) => {
    const result = await aiService.generatePromptWithGuidance(
      apiConfig.provider,
      apiConfig.keys[apiConfig.provider] || '',
      input,
      modelName,
      apiConfig.customConfig
    );
    return cleanLLMText(result);
  };

  // Helper function to set final prompt output
  const setFinalPromptOutput = (prompt: string) => {
    setGeneratedPrompts([prompt]); 
  };

  // Basic heuristic to detect keyword lists vs natural prose
  function isKeywordList(text: string): boolean {
    const trimmed = (text || '').trim();
    if (!trimmed) return false;
    const hasSentencePunctuation = /[.!?]/.test(trimmed);
    const delimiterCount = (trimmed.match(/[,;\n]/g) || []).length;
    const hasTagPattern = /:\s*[^,;\n]+/.test(trimmed) || /\b\w+\b(?:,\s*\b\w+\b){3,}/.test(trimmed);
    return !hasSentencePunctuation && (delimiterCount >= 3 || hasTagPattern);
  }

  const handleGenerate = withApiKeyCheck(async (apiKey: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await generateFinalPrompt();

      const newHistory = [userInput, ...history.slice(0, 9)];
      setHistory(newHistory);
      try {
        localStorage.setItem('promptHistory', JSON.stringify(newHistory));
      } catch (e) { console.error("Failed to save history", e); }

    } catch (error) {
      console.error('Error generating prompt:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while generating the prompt');
    } finally {
      setIsLoading(false);
    }
  });

  // Enhance feature removed for stability; no-op handler
  const handleEnhance = () => {};

  const handleAIImagination = withApiKeyCheck(async (apiKey: string) => {
    setIsGeneratingRandom(true);
    setError(null);

    try {
      // Simple prompt logic as specified: SFW or NSFW paragraph generation
      const mode = nsfwSettings.mode;
      let creativityPrompt = '';
      
      if (mode === 'off') {
        creativityPrompt = 'Write a creative and descriptive paragraph in English about a character in a scene.';
      } else {
        creativityPrompt = 'Write a creative and explicit adult paragraph in English about a character in a scene.';
      }

      const creativeDescription = await aiService.generateImaginationParagraph(
        apiConfig.provider,
        apiConfig.keys[apiConfig.provider] || '',
        nsfwSettings,
        apiConfig.customConfig
      );

      // Place the creative description directly in the main text box
      const cleanedDescription = cleanLLMText(creativeDescription);
      setUserInput(cleanedDescription);
      
    } catch (error) {
      console.error('Error generating AI imagination:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while generating creative inspiration');
    } finally {
      setIsGeneratingRandom(false);
    }
  });

  // Complete implementation of the "Generate Keywords" function
  function generateKeywords() { 
    // Step 1: Get ALL settings from the UI state. 
    const settings = getCompleteCurrentUISettings(); 
   
    // Step 2: Create an array to hold the keyword parts. 
    let keywordParts: (string | null)[] = []; 
   
    // Step 3: Process ALL CORE categories with expanded randomization pools
    // These MUST always produce a keyword. 
    // If the user selected a value, use it. If they left it as 'Any', randomize a realistic default. 
    
    // Expanded gender pool - CORE CATEGORY (SFW)
    const genderOptions = ['male', 'female'];
    const sceneType = settings.character.sceneType;
    const rawGender = settings.character.gender;
    const normalizedGender = (rawGender && rawGender.toLowerCase() === 'random') ? 'any' : rawGender;
    // If scene type is couple OR legacy 'couple' set in gender, output scene_type and set gender appropriately
    let effectiveGender = normalizedGender as any;
    if ((sceneType && typeof sceneType === 'string' && sceneType.toLowerCase() === 'couple') || rawGender === 'couple') {
      keywordParts.push('scene_type: couple');
      keywordParts.push('gender: male and female');
      effectiveGender = 'mixed';
    } else {
      if (normalizedGender === 'any') {
        effectiveGender = genderOptions[Math.floor(Math.random() * genderOptions.length)];
      }
      if (effectiveGender && effectiveGender !== 'any') {
        keywordParts.push(`gender: ${effectiveGender}`);
      }
    }
    
    // Age range - CORE CATEGORY (SFW defaults per spec)
    const ageOptions = ['18s', '25s', '30s', '40s', '50s'];
    const ageResult = processSetting('age', settings.character.age, ageOptions, settings.nsfwSettings.mode);
    if (ageResult) keywordParts.push(ageResult);

    // Ethnicity - CORE CATEGORY (SFW defaults per spec)
    const ethnicityOptions = ['caucasian', 'european', 'asian', 'japanese', 'korean', 'african', 'hispanic'];
    const ethnicityResult = processSetting('ethnicity', settings.character.ethnicity, ethnicityOptions, settings.nsfwSettings.mode);
    if (ethnicityResult) keywordParts.push(ethnicityResult);

    // Gender-appropriate body type selection - CORE CATEGORY (SFW per spec)
    const femaleBodyTypes = ['slim', 'curvy', 'athletic'];
    const maleBodyTypes = ['slim', 'muscular', 'athletic'];
    
    // Select appropriate body type based on gender
    let bodyTypeOptions;
    if (effectiveGender === 'female' || rawGender === 'futanari' || rawGender === 'femboy') {
      bodyTypeOptions = femaleBodyTypes;
    } else if (effectiveGender === 'male') {
      bodyTypeOptions = maleBodyTypes;
    } else {
      // Default to female body types for mixed/any gender
      bodyTypeOptions = femaleBodyTypes;
    }
    
    const bodyTypeResult = processSetting('body_type', settings.character.bodyType, bodyTypeOptions, settings.nsfwSettings.mode);
    if (bodyTypeResult) keywordParts.push(bodyTypeResult);
    
    // Height range - CORE CATEGORY (SFW per spec)
    const heightOptions = ['short', 'average', 'tall'];
    const heightResult = processSetting('height', settings.character.height, heightOptions, settings.nsfwSettings.mode);
    if (heightResult) keywordParts.push(heightResult);
    
    // Hair color - CORE CATEGORY
    const hairColorOptions = ['blonde', 'brown', 'black', 'red', 'silver', 'white'];
    const hairColorResult = processSetting('hair_color', settings.character.hairColor, hairColorOptions, settings.nsfwSettings.mode);
    if (hairColorResult) keywordParts.push(hairColorResult);

    // Hair style - CORE CATEGORY (ensure default when none selected)
    const hairStyleOptions = ['long and straight', 'short bob', 'ponytail', 'curly', 'wavy', 'braids', 'bun', 'undercut', 'pixie cut', 'shoulder-length', 'twin tails', 'messy hair'];
    if (settings.hairPresets && settings.hairPresets.length > 0) {
      keywordParts.push(`hair_style: ${settings.hairPresets.join(', ')}`);
    } else {
      const randomHairStyle = hairStyleOptions[Math.floor(Math.random() * hairStyleOptions.length)];
      keywordParts.push(`hair_style: ${randomHairStyle}`);
    }

    // Eye color - CORE CATEGORY (SFW defaults)
    const eyeColorOptions = ['blue', 'green', 'brown', 'hazel', 'gray'];
    const randomEyeColor = eyeColorOptions[Math.floor(Math.random() * eyeColorOptions.length)];
    keywordParts.push(`eye_color: ${randomEyeColor}`);
    
    // Scene settings - CORE CATEGORIES (SFW pools per spec)
    const nsfwMode = settings.nsfwSettings?.mode;
    const locationOptions = ['studio', 'outdoor', 'beach', 'forest', 'city', 'office', 'cafe'];
    if (settings.location && settings.location.length > 0) {
      keywordParts.push(`location: ${settings.location.join(', ')}`);
    } else {
      const randomLocation = locationOptions[Math.floor(Math.random() * locationOptions.length)];
      keywordParts.push(`location: ${randomLocation}`);
    }
    
    // Pose Presets - Opt-in: omit when none selected
    if (settings.pose && settings.pose.length > 0) {
      keywordParts.push(`pose: ${settings.pose.join(', ')}`);
    } else if (nsfwMode === 'nsfw' || nsfwMode === 'hardcore') {
      // NSFW fallback randomization for pose when none selected
      const nsfwPoseOptions = ['seductive pose', 'provocative stance', 'lying on bed'];
      const randomNsfwPose = nsfwPoseOptions[Math.floor(Math.random() * nsfwPoseOptions.length)];
      keywordParts.push(`pose: ${randomNsfwPose}`);
    }
    
    // Gender-appropriate clothing selection - CORE CATEGORY (must never be empty)
    // Define gender-appropriate clothing pools
    const femaleClothing = ['lingerie', 'nightwear', 'dress', 'skirt', 'blouse', 'heels', 'stockings', 'garter belt', 'corset', 'babydoll', 'negligee', 'teddy', 'chemise', 'bustier', 'peignoir', 'robe', 'kimono', 'sarong', 'bikini', 'monokini', 'thong', 'g-string', 'panties', 'bra', 'bustier', 'corset', 'bodystocking', 'fishnets', 'thigh highs', 'opera gloves', 'choker', 'collar', 'harness', 'pasties', 'crotchless', 'open cup', 'see-through', 'mesh', 'lace', 'satin', 'silk', 'velvet', 'latex', 'leather', 'vinyl', 'pvc', 'fetish wear', 'bondage gear', 'shibari', 'rope', 'cuffs', 'gag', 'blindfold', 'mask', 'hood', 'leash', 'plug', 'vibrator', 'dildo', 'butt plug', 'anal beads', 'cock ring', 'ball gag', 'spreader bar', 'whip', 'crop', 'paddle', 'flogger', 'nipple clamps', 'clothespins', 'zipper', 'electro play', 'wax play', 'ice play', 'knife play', 'blood play', 'scat play', 'watersports', 'golden shower', 'fisting', 'fingering', 'masturbation', 'orgasm', 'cum', 'creampie', 'facials', 'bukakke', 'gangbang', 'orgy', 'swinging', 'cuckolding', 'hotwife', 'voyeurism', 'exhibitionism', 'public', 'outdoor', 'risky', 'dangerous', 'illegal', 'taboo', 'forbidden', 'degrading', 'humiliating', 'painful', 'pleasurable', 'ecstasy', 'bliss', 'nirvana', 'transcendence'];
    const maleClothing = ['suit', 'tuxedo', 'dress shirt', 'tie', 'vest', 'blazer', 'slacks', 'dress pants', 'khakis', 'jeans', 't-shirt', 'polo shirt', 'sweater', 'hoodie', 'jacket', 'coat', 'overcoat', 'trench coat', 'raincoat', 'windbreaker', 'parka', 'anorak', 'bomber jacket', 'leather jacket', 'denim jacket', 'vest', 'waistcoat', 'cardigan', 'sweatshirt', 'joggers', 'sweatpants', 'shorts', 'swim trunks', 'board shorts', 'briefs', 'boxers', 'boxer briefs', 'thong', 'jockstrap', 'athletic supporter', 'compression shorts', 'sports jersey', 'uniform', 'military uniform', 'police uniform', 'firefighter uniform', 'paramedic uniform', 'doctor coat', 'lab coat', 'chef uniform', 'waiter uniform', 'butler uniform', 'chauffeur uniform', 'pilot uniform', 'flight attendant uniform', 'conductor uniform', 'train engineer uniform', 'bus driver uniform', 'taxi driver uniform', 'delivery uniform', 'mailman uniform', 'construction worker uniform', 'mechanic uniform', 'plumber uniform', 'electrician uniform', 'carpenter uniform', 'painter uniform', 'gardener uniform', 'farmer uniform', 'rancher uniform', 'cowboy outfit', 'western wear', 'biker outfit', 'motorcycle gear', 'leathers', 'riding jacket', 'riding pants', 'boots', 'helmet', 'gloves', 'goggles', 'scarf', 'hat', 'cap', 'beanie', 'beret', 'fedora', 'trilby', 'bowler', 'top hat', 'cowboy hat', 'sombrero', 'baseball cap', 'snapback', 'trucker hat', 'bucket hat', 'sun hat', 'visor', 'headband', 'bandana', 'durag', 'turban', 'yarmulke', 'kippah', 'hijab', 'niqab', 'burqa', 'chador', 'abaya', 'thawb', 'dishdasha', 'kandura', 'jalabiya', 'sherwani', 'achkan', 'kurta', 'dhoti', 'lungi', 'sari', 'saree', 'lehenga', 'choli', 'salwar kameez', 'shalwar kameez', 'patiala suit', 'anarkali suit', 'ghagra', 'churidar', 'dupatta', 'odhani', 'pallu', 'veshti', 'mundu', 'dastar', 'pagri', 'safa', 'pheta', 'mysore peta', 'rajasthani pagri', 'marathi pheta', 'punjabi pagri', 'bengali pagri', 'assamese pagri', 'oriya pagri', 'gujarati pagri', 'kashmiri pagri', 'himachali pagri', 'uttarakhandi pagri', 'bihari pagri', 'jharkhandi pagri', 'chhattisgarhi pagri', 'madhyapradeshi pagri', 'maharashtrian pagri', 'goan pagri', 'karnatakan pagri', 'keralite pagri', 'tamil pagri', 'andhran pagri', 'telangan pagri', 'pondicherrian pagri', 'lakshadweep pagri', 'andaman pagri', 'nicobar pagri', 'sikkimese pagri', 'arunachali pagri', 'nagalandi pagri', 'manipuri pagri', 'mizorami pagri', 'tripuri pagri', 'meghalayan pagri', 'assamese gamosa', 'naga shawl', 'mizo puan', 'khasi jainspem', 'garo dakmanda', 'bodo aronai', 'karbi pini', 'dimasa rikha', 'tiwa rikha', 'rabha rikha', 'mishing rikha', 'deori rikha', 'sonowal rikha', 'thengal rikha', 'ahom rikha', 'motok rikha', 'moran rikha', 'chutia rikha', 'koc rikha', 'koch rikha', 'rajbongshi rikha', 'sutiya rikha', 'khamti rikha', 'khamyang rikha', 'phake rikha', 'aiton rikha', 'khampti rikha', 'tai ahom rikha', 'tai phake rikha', 'tai khamti rikha', 'tai khamyang rikha', 'tai aitonia rikha', 'tai turung rikha', 'tai noria rikha', 'tai rongria rikha', 'tai saek rikha', 'tai dam rikha', 'tai daeng rikha', 'tai don rikha', 'tai kadai rikha', 'tai lue rikha', 'tai nuea rikha', 'tai nyaw rikha', 'tai pa di rikha', 'tai pong rikha', 'tai song rikha', 'tai tham rikha', 'tai viet rikha', 'tai ya rikha', 'tai yuan rikha', 'tai Zhuang rikha', 'tai bouyei rikha', 'tai dai rikha', 'tai hani rikha', 'tai jingpo rikha', 'tai lisu rikha', 'tai nu rikha', 'tai va rikha', 'tai wa rikha', 'tai akha rikha', 'tai lahu rikha', 'tai mien rikha', 'tai hmong rikha', 'tai yao rikha', 'tai she rikha', 'tai tujia rikha', 'tai bai rikha', 'tai yi rikha', 'tai naxi rikha', 'tai mosuo rikha', 'tai lhoba rikha', 'tai monpa rikha', 'tai sherpa rikha', 'tai tamang rikha', 'tai gurung rikha', 'tai magar rikha', 'tai newar rikha', 'tai tharu rikha', 'tai chepang rikha', 'tai sunuwar rikha', 'tai jirel rikha', 'tai lepcha rikha', 'tai limbu rikha', 'tai rai rikha', 'tai yakha rikha', 'tai hayu rikha', 'tai kumal rikha', 'tai majhi rikha', 'tai danuwar rikha', 'tai thami rikha', 'tai surel rikha', 'tai pahari rikha', 'tai khas rikha', 'tai kiranti rikha'];
    
    // Clothing - CORE CATEGORY (SFW pool per spec) - must never be empty
    let clothingOptions = ['casual', 'formal', 'business', 'sportswear', 'vintage'];
    // NSFW expansion for clothing per spec
    if (nsfwMode === 'nsfw' || nsfwMode === 'hardcore') {
      clothingOptions = clothingOptions.concat(['lingerie', 'swimsuit', 'bondage gear', 'naked']);
    }
    if (settings.clothing && settings.clothing.length > 0) {
      keywordParts.push(`clothing: ${settings.clothing.join(', ')}`);
    } else {
      const randomClothing = clothingOptions[Math.floor(Math.random() * clothingOptions.length)];
      keywordParts.push(`clothing: ${randomClothing}`);
    }
    
    // Shot type - CORE CATEGORY (SFW pool per spec)
    // Shot Presets - Opt-in: omit when none selected
    if (settings.shot && settings.shot.length > 0) {
      keywordParts.push(`shot_type: ${settings.shot.join(', ')}`);
    }
    
    const expressionOptions = ['smiling', 'serious', 'neutral', 'happy', 'confident', 'mysterious', 'gentle', 'focused'];
    if (settings.expression && settings.expression.length > 0) {
      keywordParts.push(`facial_expression: ${settings.expression.join(', ')}`);
    } else {
      const randomExpression = expressionOptions[Math.floor(Math.random() * expressionOptions.length)];
      keywordParts.push(`facial_expression: ${randomExpression}`);
    }
    
    const timeOptions = ['morning', 'afternoon', 'evening', 'night', 'dawn', 'dusk', 'golden hour'];
    if (settings.timeOfDay && settings.timeOfDay.length > 0) {
      keywordParts.push(`time_of_day: ${settings.timeOfDay.join(', ')}`);
    } else {
      const randomTime = timeOptions[Math.floor(Math.random() * timeOptions.length)];
      keywordParts.push(`time_of_day: ${randomTime}`);
    }
    
    // Atmospheric - CORE CATEGORY
    const atmosphericOptions = ['bright', 'moody', 'dramatic', 'soft lighting', 'natural light', 'warm tones', 'cool tones', 'cinematic'];
    if (settings.atmospheric && settings.atmospheric.length > 0) {
      keywordParts.push(`atmospheric: ${settings.atmospheric.join(', ')}`);
    } else {
      const randomAtmospheric = atmosphericOptions[Math.floor(Math.random() * atmosphericOptions.length)];
      keywordParts.push(`atmospheric: ${randomAtmospheric}`);
    }
   
    // Step 4: Implement Gender-Dependent Logic for Physical Features
    // Use the explicitly selected gender only; do NOT randomize.
    const currentGender = effectiveGender;
    const isNsfwMode = settings.nsfwSettings.mode === 'nsfw' || settings.nsfwSettings.mode === 'hardcore';
    
    if (isNsfwMode) {
      // Female or Futanari specific features
      if (currentGender === 'female' || currentGender === 'futanari') {
        // Breast size
        let breastSize = settings.character.breastSize;
        if (!breastSize || breastSize === 'any') {
          const femaleBreastPool = ['small', 'medium', 'large', 'huge'];
          breastSize = femaleBreastPool[Math.floor(Math.random() * femaleBreastPool.length)] as typeof breastSize;
        }
        if (breastSize && breastSize !== 'any') {
          const breastDescriptions: Record<string, string> = {
            'flat': 'flat breasts',
            'small': 'small breasts',
            'medium': 'medium breasts',
            'large': 'large breasts',
            'huge': 'huge breasts',
            'gigantic': 'gigantic breasts'
          };
          keywordParts.push(`breast_size: ${breastDescriptions[breastSize] || breastSize}`);
        }
        
        // Hips size
        let hipsSize = settings.character.hipsSize;
        if (!hipsSize || hipsSize === 'any') {
          const hipsPool = ['narrow', 'average', 'wide'];
          hipsSize = hipsPool[Math.floor(Math.random() * hipsPool.length)] as typeof hipsSize;
        }
        if (hipsSize && hipsSize !== 'any') {
          const hipsDescriptions: Record<string, string> = {
            'narrow': 'narrow hips',
            'average': 'average hips',
            'wide': 'wide hips',
            'extra wide': 'extra wide hips'
          };
          keywordParts.push(`hips_size: ${hipsDescriptions[hipsSize] || hipsSize}`);
        }
        
        // Butt size
        let buttSize = settings.character.buttSize;
        if (!buttSize || buttSize === 'any') {
          const buttPool = ['small', 'average', 'large', 'bubble'];
          buttSize = buttPool[Math.floor(Math.random() * buttPool.length)] as typeof buttSize;
        }
        if (buttSize && buttSize !== 'any') {
          const buttDescriptions: Record<string, string> = {
            'flat': 'flat butt',
            'small': 'small butt',
            'average': 'average butt',
            'large': 'large butt',
            'bubble': 'bubble butt'
          };
          keywordParts.push(`butt_size: ${buttDescriptions[buttSize] || buttSize}`);
        }
      }
      
      // Male or Futanari specific features
      if (currentGender === 'male' || currentGender === 'futanari') {
        // Penis size
        let penisSize = settings.character.penisSize;
        if (!penisSize || penisSize === 'any') {
          const penisPool = ['average', 'large', 'huge'];
          penisSize = penisPool[Math.floor(Math.random() * penisPool.length)] as typeof penisSize;
        }
        if (penisSize && penisSize !== 'any') {
          const penisDescriptions: Record<string, string> = {
            'small': 'small penis',
            'average': 'average penis',
            'large': 'large penis',
            'huge': 'huge penis',
            'horse-hung': 'horse-hung penis'
          };
          keywordParts.push(`penis_size: ${penisDescriptions[penisSize] || penisSize}`);
        }
        
        // Muscle definition
        let muscleDefinition = settings.character.muscleDefinition;
        if (!muscleDefinition || muscleDefinition === 'any') {
          const musclePool = ['toned', 'defined', 'ripped'];
          muscleDefinition = musclePool[Math.floor(Math.random() * musclePool.length)] as typeof muscleDefinition;
        }
        if (muscleDefinition && muscleDefinition !== 'any') {
          const muscleDescriptions: Record<string, string> = {
            'soft': 'soft muscles',
            'toned': 'toned muscles',
            'defined': 'defined muscles',
            'ripped': 'ripped muscles',
            'bodybuilder': 'bodybuilder muscles'
          };
          keywordParts.push(`muscle_definition: ${muscleDescriptions[muscleDefinition] || muscleDefinition}`);
        }
      }
      
      // Femboy: do not emit male-only features here; respect explicit sliders only
      
      // Facial hair (for male, futanari, or femboy if applicable)
      if (currentGender === 'male' || currentGender === 'futanari') {
        let facialHair = settings.character.facialHair;
        if (!facialHair || facialHair === 'any') {
          const facialHairPool = ['clean-shaven', 'stubble', 'goatee', 'mustache', 'full beard'];
          facialHair = facialHairPool[Math.floor(Math.random() * facialHairPool.length)] as typeof facialHair;
        }
        if (facialHair && facialHair !== 'any') {
          const facialHairDescriptions: Record<string, string> = {
            'clean-shaven': 'clean shaven',
            'stubble': 'stubble',
            'goatee': 'goatee',
            'mustache': 'mustache',
            'full beard': 'full beard'
          };
          keywordParts.push(`facial_hair: ${facialHairDescriptions[facialHair] || facialHair}`);
        }
      }
    }
   
    // Step 5: Process ALL OPT-IN categories.
    // These are only added if the user made a specific selection and values are non-empty.
    const joinFiltered = (arr: any[]): string => {
      if (!Array.isArray(arr)) return '';
      return arr
        .map(v => typeof v === 'string' ? v.trim() : '')
        .filter(v => v && v.length > 0)
        .join(', ');
    };

    // Fantasy race (supports multiple selections)
    if (Array.isArray(settings.fantasyRace)) {
      const fr = joinFiltered(settings.fantasyRace);
      if (fr) keywordParts.push(`fantasy_race: ${fr}`);
    } else if (
      typeof settings.fantasyRace === 'string'
    ) {
      const fr = settings.fantasyRace.trim();
      if (fr && fr !== 'Any' && fr !== 'Human') keywordParts.push(`fantasy_race: ${fr}`);
    }

    // Handle preset arrays (filter empty selections)
    const propsStr = joinFiltered(settings.props);
    if (propsStr) keywordParts.push(`props: ${propsStr}`);

    const creaturesStr = joinFiltered(settings.creatures);
    if (creaturesStr) keywordParts.push(`creatures: ${creaturesStr}`);

    const specialEffectsStr = joinFiltered(settings.specialEffects);
    if (specialEffectsStr) keywordParts.push(`special_effects: ${specialEffectsStr}`);

    // Atmospheric is already handled as a Core category above; avoid duplicate tag here

    const physicalFeaturesStr = joinFiltered(settings.physicalFeatures);
    if (physicalFeaturesStr) keywordParts.push(`physical_features: ${physicalFeaturesStr}`);

    // Facial expressions are already handled as a Core category above; avoid duplicate tag here

    const emotionalStatesStr = joinFiltered(settings.emotionalStates);
    if (emotionalStatesStr) keywordParts.push(`emotional_states: ${emotionalStatesStr}`);

    const nsfwExpressionsStr = joinFiltered(settings.nsfwExpressions);
    if (nsfwExpressionsStr) keywordParts.push(`nsfw_expressions: ${nsfwExpressionsStr}`);

    const nsfwPropsStr = joinFiltered(settings.nsfwProps);
    if (nsfwPropsStr) keywordParts.push(`nsfw_props: ${nsfwPropsStr}`);

    const roleplayStr = joinFiltered(settings.roleplayPresets);
    if (roleplayStr) keywordParts.push(`roleplay: ${roleplayStr}`);

    const characterStyleStr = joinFiltered(settings.characterStylePresets);
    if (characterStyleStr) keywordParts.push(`character_style: ${characterStyleStr}`);

    const styleStr = joinFiltered(settings.stylePresets);
    if (styleStr) keywordParts.push(`style: ${styleStr}`);

    // hair_style is part of core categories above, avoid duplicating here
   
    // Step 6: Join the parts and update the UI's main text box. 
    const finalText = keywordParts.filter(part => part !== null && part !== undefined && part !== '').join(', '); 
    setMainDescriptionTextBox(finalText); 
  }

  // Helper function to get complete current UI settings including all physical feature sliders
  const getCompleteCurrentUISettings = () => {
    // Extract hair color from selected presets
    const hairColorPreset = selectedHairPresets.find(p => 
      p.includes('blonde') || p.includes('brown') || p.includes('black') || 
      p.includes('red') || p.includes('silver') || p.includes('white') ||
      p.includes('pink') || p.includes('blue') || p.includes('purple') ||
      p.includes('green') || p.includes('rainbow')
    );
    const hairColor = hairColorPreset ? hairColorPreset.replace(' hair', '') : 'any';

    return {
      // Core character settings
      character: {
        sceneType: characterSettings.sceneType,
        gender: characterSettings.gender,
        age: characterSettings.age,
        bodyType: characterSettings.bodyType,
        ethnicity: characterSettings.ethnicity,
        height: characterSettings.height,
        hairColor: hairColor,
        // Physical feature sliders
        breastSize: characterSettings.breastSize,
        hipsSize: characterSettings.hipsSize,
        buttSize: characterSettings.buttSize,
        penisSize: characterSettings.penisSize,
        muscleDefinition: characterSettings.muscleDefinition,
        facialHair: characterSettings.facialHair,
        characterStyle: characterSettings.characterStyle,
        roleplay: characterSettings.roleplay
      },
      // Scene settings
      location: selectedLocationPresets,
      pose: selectedPosePresets,
      clothing: selectedClothingPresets,
      shot: selectedShotPresets,
      expression: selectedFacialExpressionsPresets,
      timeOfDay: selectedTimeOfDayPresets,
      // Optional categories
      fantasyRace: selectedFantasyRacesPresets,
      props: selectedPropsPresets,
      creatures: selectedCreaturesPresets,
      specialEffects: selectedSpecialEffectsPresets,
      atmospheric: selectedAtmosphericPresets,
      physicalFeatures: selectedPhysicalFeaturesPresets,
      facialExpressions: selectedFacialExpressionsPresets,
      emotionalStates: selectedEmotionalStatesPresets,
      nsfwExpressions: selectedNSFWExpressionsPresets,
      nsfwProps: selectedNSFWPropsPresets,
      roleplayPresets: selectedRoleplayPresets,
      characterStylePresets: selectedCharacterStylePresets,
      stylePresets: selectedStylePresets,
      hairPresets: selectedHairPresets,
      // NSFW settings
      nsfwSettings: nsfwSettings
    };
  };

  // Helper function to process settings with default randomization and snake_case formatting
  const processSetting = (settingName: string, settingValue: any, defaultOptions: string[], nsfwMode?: string): string | null => {
    // Handle array values (presets)
    if (Array.isArray(settingValue)) {
      if (settingValue.length === 0) return null;
      return `${settingName}: ${settingValue.join(', ')}`;
    }
    
    // Handle single values
    if (settingValue !== 'any' && settingValue !== 'Any' && settingValue !== '' && settingValue !== null && settingValue !== undefined) {
      return `${settingName}: ${settingValue}`;
    } else {
      // Randomize from default options based on context
      let randomOptions = [...defaultOptions];
      
      // Expand options based on NSFW mode for certain categories
      if (nsfwMode === 'nsfw' || nsfwMode === 'hardcore') {
        if (settingName === 'clothing') {
          randomOptions = [...defaultOptions, 'lingerie', 'swimsuit', 'underwear', 'naked', 'topless', 'bottomless'];
        } else if (settingName === 'pose') {
          randomOptions = [...defaultOptions, 'seductive pose', 'lying on bed', 'provocative stance', 'sensual position', 'intimate pose'];
        } else if (settingName === 'location') {
          randomOptions = [...defaultOptions, 'bedroom', 'bathroom', 'hotel room', 'private room'];
        }
      }
      
      const randomValue = randomOptions[Math.floor(Math.random() * randomOptions.length)];
      return `${settingName}: ${randomValue}`;
    }
  };

  // Helper function to set main description text box
  const setMainDescriptionTextBox = (text: string) => {
    setUserInput(text);
  };

  const handleGenerateKeywords = () => {
    generateKeywords();
  };

  const handleAppendToInput = useCallback((text: string) => {
    setUserInput(prev => `${prev} ${text}`.trim());
  }, []);



  const handleSelectFromHistory = useCallback((prompt: string) => {
    setUserInput(prompt);
    setEnhanceRound(0);
    setLockedPhrases([]);
  }, []);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem('promptHistory');
    } catch (e) { console.error("Failed to clear history", e); }
  }, []);

  const handleInitiateSaveSnippet = useCallback((content: string) => {
    setSnippetToSave({ content });
  }, []);

  const handleConfirmSaveSnippet = useCallback((name: string) => {
    if (!snippetToSave) return;
    
    const newSnippet: PromptSnippet = {
      id: Date.now().toString(),
      name,
      content: snippetToSave.content,
      tags: [],
      createdAt: new Date().toISOString()
    };
    
    setSnippets(prev => [newSnippet, ...prev]);
    setSnippetToSave(null);
  }, [snippetToSave]);

  const handleCancelSaveSnippet = useCallback(() => {
    setSnippetToSave(null);
  }, []);

  const handleDeleteSnippet = useCallback((id: string) => {
    setSnippets(prev => prev.filter(snippet => snippet.id !== id));
  }, []);

  const handleSendToGenerator = useCallback((prompt: string) => {
    setPromptForImageGen(prompt);
    setIsImageGeneratorOpen(true);
  }, []);

  

  const handleAgeVerification = useCallback((verified: boolean) => {
    setIsAgeVerified(verified);
    try {
        localStorage.setItem('ageVerified', verified.toString());
    } catch (e) { console.error("Failed to save age verification", e); }
  }, []);

  const handleExportSettings = useCallback(() => {
    try {
      const settingsToExport = {
        selectedModel,
        useBreak,
        showAdvanced,
        advancedSettings,
        styleFilter,
        nsfwSettings,
        characterSettings,
        selectedShotPresets,
        selectedPosePresets,
        selectedLocationPresets,
        selectedClothingPresets,
        selectedHairPresets,
        selectedStylePresets,
        selectedCharacterStylePresets,
        selectedRoleplayPresets,
        selectedPhysicalFeaturesPresets,
        selectedFacialExpressionsPresets,
        selectedEmotionalStatesPresets,
        selectedNSFWExpressionsPresets,
        selectedFantasyRacesPresets,
        selectedCreaturesPresets,
        selectedPropsPresets,
        selectedNSFWPropsPresets,
        selectedTimeOfDayPresets,
        selectedSpecialEffectsPresets,
        selectedAtmosphericPresets,
        snippets
      };

      const dataStr = JSON.stringify(settingsToExport, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `promptbuilder-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting settings:', error);
      setError('Failed to export settings');
    }
  }, [
    selectedModel, useBreak, showAdvanced, advancedSettings,
    styleFilter, nsfwSettings, characterSettings, selectedShotPresets,
    selectedPosePresets, selectedLocationPresets, selectedClothingPresets,
    selectedHairPresets, selectedStylePresets, selectedCharacterStylePresets,
    selectedRoleplayPresets, selectedPhysicalFeaturesPresets, selectedFacialExpressionsPresets,
    selectedEmotionalStatesPresets, selectedNSFWExpressionsPresets, selectedFantasyRacesPresets,
    selectedCreaturesPresets, selectedPropsPresets, selectedNSFWPropsPresets,
    selectedTimeOfDayPresets, selectedSpecialEffectsPresets, selectedAtmosphericPresets,
    snippets
  ]);

  const handleImportSettings = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target?.result as string);
        
        // Apply imported settings
        if (importedSettings.selectedModel) setSelectedModel(importedSettings.selectedModel);
        if (typeof importedSettings.useBreak === 'boolean') setUseBreak(importedSettings.useBreak);
        if (typeof importedSettings.showAdvanced === 'boolean') setShowAdvanced(importedSettings.showAdvanced);
        if (importedSettings.advancedSettings) setAdvancedSettings(importedSettings.advancedSettings);
        if (importedSettings.styleFilter) setStyleFilter(importedSettings.styleFilter);
        if (importedSettings.nsfwSettings) setNsfwSettings(importedSettings.nsfwSettings);
        if (importedSettings.characterSettings) setCharacterSettings(importedSettings.characterSettings);
        
        // Apply preset selections
        if (Array.isArray(importedSettings.selectedShotPresets)) setSelectedShotPresets(importedSettings.selectedShotPresets);
        if (Array.isArray(importedSettings.selectedPosePresets)) setSelectedPosePresets(importedSettings.selectedPosePresets);
        if (Array.isArray(importedSettings.selectedLocationPresets)) setSelectedLocationPresets(importedSettings.selectedLocationPresets);
        if (Array.isArray(importedSettings.selectedClothingPresets)) setSelectedClothingPresets(importedSettings.selectedClothingPresets);
        if (Array.isArray(importedSettings.selectedHairPresets)) setSelectedHairPresets(importedSettings.selectedHairPresets);
        if (Array.isArray(importedSettings.selectedStylePresets)) setSelectedStylePresets(importedSettings.selectedStylePresets);
        if (Array.isArray(importedSettings.selectedCharacterStylePresets)) setSelectedCharacterStylePresets(importedSettings.selectedCharacterStylePresets);
        if (Array.isArray(importedSettings.selectedRoleplayPresets)) setSelectedRoleplayPresets(importedSettings.selectedRoleplayPresets);
        if (Array.isArray(importedSettings.selectedPhysicalFeaturesPresets)) setSelectedPhysicalFeaturesPresets(importedSettings.selectedPhysicalFeaturesPresets);
        if (Array.isArray(importedSettings.selectedFacialExpressionsPresets)) setSelectedFacialExpressionsPresets(importedSettings.selectedFacialExpressionsPresets);
        if (Array.isArray(importedSettings.selectedEmotionalStatesPresets)) setSelectedEmotionalStatesPresets(importedSettings.selectedEmotionalStatesPresets);
        if (Array.isArray(importedSettings.selectedNSFWExpressionsPresets)) setSelectedNSFWExpressionsPresets(importedSettings.selectedNSFWExpressionsPresets);
        if (Array.isArray(importedSettings.selectedFantasyRacesPresets)) setSelectedFantasyRacesPresets(importedSettings.selectedFantasyRacesPresets);
        if (Array.isArray(importedSettings.selectedCreaturesPresets)) setSelectedCreaturesPresets(importedSettings.selectedCreaturesPresets);
        if (Array.isArray(importedSettings.selectedPropsPresets)) setSelectedPropsPresets(importedSettings.selectedPropsPresets);
        if (Array.isArray(importedSettings.selectedNSFWPropsPresets)) setSelectedNSFWPropsPresets(importedSettings.selectedNSFWPropsPresets);
        if (Array.isArray(importedSettings.selectedTimeOfDayPresets)) setSelectedTimeOfDayPresets(importedSettings.selectedTimeOfDayPresets);
        if (Array.isArray(importedSettings.selectedSpecialEffectsPresets)) setSelectedSpecialEffectsPresets(importedSettings.selectedSpecialEffectsPresets);
        if (Array.isArray(importedSettings.selectedAtmosphericPresets)) setSelectedAtmosphericPresets(importedSettings.selectedAtmosphericPresets);
        
        // Apply snippets
        if (Array.isArray(importedSettings.snippets)) setSnippets(importedSettings.snippets);
        
        console.log('Settings imported successfully');
      } catch (error) {
        console.error('Error importing settings:', error);
        setError('Failed to import settings. Please check the file format.');
      }
    };
    reader.readAsText(file);
  }, []);

  if (showLogoAnimation) {
    return <LogoAnimation show={showLogoAnimation} />;
  }

  if (!isAgeVerified) {
    return <AgeVerificationModal 
      onConfirm={() => handleAgeVerification(true)} 
      onDeny={() => handleAgeVerification(false)} 
    />;
  }

  return (
    <>
      <div className="min-h-screen bg-gray-900 text-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <Header />
          {error && (
            <div role="alert" aria-live="polite" className="mt-3 mb-2 p-3 rounded-md border border-red-700 bg-red-900/30 text-red-300">
              {error}
            </div>
          )}
          <main className="space-y-6">

            {/* Collapsible Settings Sections */}
            <Instructions 
              isOpen={showInstructions} 
              onToggle={() => setShowInstructions(!showInstructions)} 
            />
            
            <ApiSettings 
              isOpen={showApiSettings}
              onToggle={() => setShowApiSettings(!showApiSettings)}
              config={apiConfig}
              onChange={setApiConfig}
            />
            
            <SettingsManager 
              onExport={handleExportSettings}
              onImport={handleImportSettings}
            />
            
            {/* AI Model and Controls Row */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 max-w-md">
                <ModelSelector 
                  selectedModel={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-4">
                <Toggle
                  label="BREAK"
                  checked={useBreak}
                  onChange={setUseBreak}
                  disabled={!currentModelConfig.supportsBreak}
                />
                <Toggle
                  label="Advanced Settings"
                  checked={showAdvanced}
                  onChange={setShowAdvanced}
                  htmlId="toggle-advanced-settings"
                />
              </div>
            </div>
            
            {/* Supported Models List */}
            <div className="bg-gray-900/50 rounded-md border border-gray-700 p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Supported Models:</h3>
              <div className="text-xs text-gray-500 leading-relaxed">
                Google Imagen4, SDXL, SD 1.5, Flux, Pony, Illustrious, OpenAI, Midjourney, Stable Cascade, Nano Banana, Gwen, AuraFlow, HiDream, Kolors, Lumina, Mochi, NoobAI, PixArt A/E, Veo 3, SVD, CogVideoX, Hunyuan Video, LTXV, Wan Video
              </div>
            </div>
            
            <StyleFilter styleFilter={styleFilter} setStyleFilter={setStyleFilter} />
            
            {/* Reset All Selected Button */}
            <div className="flex justify-center mb-4">
              <button
                onClick={handleResetStyleFilter}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md transition-colors font-medium"
              >
                <RotateCcw size={16} />
                Reset All Selected
              </button>
            </div>
            
            {/* Character & Content Controls */}
            <div className="space-y-4">
              <CharacterControls
                settings={characterSettings}
                onChange={setCharacterSettings}
                nsfwSettings={nsfwSettings}
              />
              <NsfwControls
                settings={nsfwSettings}
                onChange={setNsfwSettings}
              />
            </div>
            
            {/* Presets temporarily removed during JSX bisection */}
            {/* Presets */}
            <div className="space-y-4">
              {/* Core categories */}
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
              <TimeOfDayPresets
                onAppend={handleAppendToInput}
                selectedPresets={selectedTimeOfDayPresets}
                onSelectedPresetsChange={setSelectedTimeOfDayPresets}
              />

              {/* Opt-In categories (placed lower) */}
              <HairPresets
                onAppend={handleAppendToInput}
                selectedPresets={selectedHairPresets}
                onSelectedPresetsChange={setSelectedHairPresets}
              />
              <StylePresets
                onAppend={handleAppendToInput}
                selectedPresets={selectedStylePresets}
                onSelectedPresetsChange={setSelectedStylePresets}
              />
              <CharacterStylePresets
                onAppend={handleAppendToInput}
                selectedPresets={selectedCharacterStylePresets}
                onSelectedPresetsChange={setSelectedCharacterStylePresets}
              />
              <PhysicalFeaturesPresets
                onAppend={handleAppendToInput}
                selectedPresets={selectedPhysicalFeaturesPresets}
                onSelectedPresetsChange={setSelectedPhysicalFeaturesPresets}
              />
              <FacialExpressionsPresets
                onAppend={handleAppendToInput}
                selectedPresets={selectedFacialExpressionsPresets}
                onSelectedPresetsChange={setSelectedFacialExpressionsPresets}
              />
              <EmotionalStatesPresets
                onAppend={handleAppendToInput}
                selectedPresets={selectedEmotionalStatesPresets}
                onSelectedPresetsChange={setSelectedEmotionalStatesPresets}
              />
              <AtmosphericPresets
                onAppend={handleAppendToInput}
                selectedPresets={selectedAtmosphericPresets}
                onSelectedPresetsChange={setSelectedAtmosphericPresets}
              />
              <SpecialEffectsPresets
                onAppend={handleAppendToInput}
                selectedPresets={selectedSpecialEffectsPresets}
                onSelectedPresetsChange={setSelectedSpecialEffectsPresets}
              />
              <FantasyRacesPresets
                onAppend={handleAppendToInput}
                selectedPresets={selectedFantasyRacesPresets}
                onSelectedPresetsChange={setSelectedFantasyRacesPresets}
              />
              <CreaturesPresets
                onAppend={handleAppendToInput}
                selectedPresets={selectedCreaturesPresets}
                onSelectedPresetsChange={setSelectedCreaturesPresets}
              />
              <PropsPresets
                onAppend={handleAppendToInput}
                selectedPresets={selectedPropsPresets}
                onSelectedPresetsChange={setSelectedPropsPresets}
              />
              {/* Roleplay placed under Props */}
              <RoleplayPresets
                onAppend={handleAppendToInput}
                selectedPresets={selectedRoleplayPresets}
                onSelectedPresetsChange={setSelectedRoleplayPresets}
              />
              <NSFWExpressionsPresets
                onAppend={handleAppendToInput}
                selectedPresets={selectedNSFWExpressionsPresets}
                onSelectedPresetsChange={setSelectedNSFWExpressionsPresets}
                isNsfwEnabled={nsfwSettings.mode !== 'off'}
              />
              <NSFWPropsPresets
                onAppend={handleAppendToInput}
                selectedPresets={selectedNSFWPropsPresets}
                onSelectedPresetsChange={setSelectedNSFWPropsPresets}
                isNsfwEnabled={nsfwSettings.mode !== 'off'}
              />
            </div>
            
            {/* My Snippets */}
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
              onRandom={handleGenerateKeywords}
              onAIImagination={handleAIImagination}
              isLoading={isLoading}
              isGeneratingRandom={isGeneratingKeywords}
              onSaveSnippet={handleInitiateSaveSnippet}
              onLockSelection={(text) => {
                if (!lockedPhrases.includes(text)) {
                  setLockedPhrases(prev => [...prev, text]);
                }
              }}
              lockedPhrases={lockedPhrases}
              onRemoveLockedPhrase={(text) => setLockedPhrases(prev => prev.filter(p => p !== text))}
            />
            {/* PromptInput temporarily removed during JSX bisection to locate syntax error */}
            
            <PromptOutput 
              prompts={generatedPrompts} 
              isLoading={isLoading} 
              selectedModel={selectedModel}
              negativePrompt={advancedSettings.negativePrompt}
              supportsImageGeneration={supportsImageGeneration}
              onSendToGenerator={handleSendToGenerator}
            />
            {/* Temporarily removed during JSX bisection to locate syntax error */}
            
            <ImageGenerator
              isOpen={isImageGeneratorOpen}
              onToggle={() => setIsImageGeneratorOpen(prev => !prev)}
              prompt={promptForImageGen}
              onPromptChange={setPromptForImageGen}
              onGenerate={() => {}}
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
          
        </div>
      </div>
    </>
  );
}

export default App;