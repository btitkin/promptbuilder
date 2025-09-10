import type { NsfwSettingsState, StyleFilter, StructuredPrompt, CharacterSettingsState, CustomApiConfig } from '../types';

interface CustomApiResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

const makeApiCall = async (config: CustomApiConfig, messages: any[]): Promise<string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (config.key) {
    headers['Authorization'] = `Bearer ${config.key}`;
  }

  const response = await fetch(`${config.url}/v1/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    throw new Error(`Custom API error: ${response.status} ${response.statusText}`);
  }

  const data: CustomApiResponse = await response.json();
  return data.choices[0]?.message?.content || '';
};

export const generatePromptVariations = async (
  config: CustomApiConfig,
  userInput: string,
  numVariations: number,
  nsfwSettings: NsfwSettingsState,
  styleFilter: StyleFilter,
  selectedModel: string,
  characterSettings: CharacterSettingsState
): Promise<{ structuredPrompts: StructuredPrompt[], negativePrompt: string }> => {
  const systemPrompt = `You are an AI assistant that generates detailed image prompts. Create ${numVariations} variations of the user's input as structured JSON.

Return ONLY a JSON object with this structure:
{
  "prompts": [
    {
      "subject": ["main subject elements"],
      "attributes": ["descriptive attributes"],
      "clothing": ["clothing items"],
      "pose": ["pose descriptions"],
      "action": ["actions being performed"],
      "location": ["location elements"],
      "background": ["background elements"],
      "style": ["artistic style elements"]
    }
  ],
  "negativePrompt": "elements to avoid"
}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Generate ${numVariations} variations for: ${userInput}` }
  ];

  console.log('🔍 DEBUG: generatePromptVariations called with config:', config.url);
  console.log('🔍 DEBUG: User input:', userInput);
  console.log('🔍 DEBUG: Num variations:', numVariations);
  
  try {
    const response = await makeApiCall(config, messages);
    console.log('🔍 DEBUG: Raw LLM response:', response);
    
    // Try to parse as JSON first
    try {
      const parsed = JSON.parse(response);
      return {
        structuredPrompts: parsed.prompts || [],
        negativePrompt: parsed.negativePrompt || ''
      };
    } catch (jsonError) {
       console.log('🔍 DEBUG: JSON parsing failed, using fallback mode');
       console.warn('Local LLM returned non-JSON response, creating fallback structured prompt:', response);
      
      // Fallback: Create structured prompt from plain text response
      const fallbackPrompt: StructuredPrompt = {
        subject: [userInput],
        attributes: ['detailed', 'high quality'],
        clothing: [],
        pose: [],
        action: [],
        location: [],
        background: [],
        style: [styleFilter.style || 'professional']
      };
      
      // Try to extract meaningful content from response
      const cleanResponse = response.trim();
      if (cleanResponse && cleanResponse.length > 10) {
        // Use the LLM response as enhanced subject
        fallbackPrompt.subject = [cleanResponse];
      }
      
      // Generate multiple variations by adding different attributes
      const variations: StructuredPrompt[] = [];
      for (let i = 0; i < numVariations; i++) {
        const variation = { ...fallbackPrompt };
        
        // Add variation-specific attributes
        const variationAttributes = ['detailed', 'high quality'];
        if (i === 1) variationAttributes.push('artistic', 'creative');
        if (i === 2) variationAttributes.push('professional', 'polished');
        if (i >= 3) variationAttributes.push('unique', 'expressive');
        
        variation.attributes = variationAttributes;
        variations.push(variation);
      }
      
      return {
        structuredPrompts: variations,
        negativePrompt: 'blurry, low quality, distorted, bad anatomy, worst quality'
      };
    }
  } catch (error) {
    console.error('Custom API error:', error);
    throw new Error('Failed to generate prompt variations with custom API');
  }
};

export const enhanceDescription = async (
  config: CustomApiConfig,
  userInput: string,
  nsfwSettings: NsfwSettingsState,
  styleFilter: StyleFilter,
  characterSettings: CharacterSettingsState
): Promise<string> => {
  const systemPrompt = 'You are an AI assistant that enhances image prompts for AI image generation. Improve the prompt by adding relevant visual details, style keywords, and quality tags. Keep it concise and comma-separated. Maximum 50 words.';
  
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Enhance this image prompt for AI generation: ${userInput}. Add visual details and style keywords, keep it concise and comma-separated.` }
  ];

  try {
    return await makeApiCall(config, messages);
  } catch (error) {
    console.error('Custom API error:', error);
    throw new Error('Failed to enhance description with custom API');
  }
};

export const generateRandomDescription = async (
  config: CustomApiConfig,
  nsfwSettings: NsfwSettingsState,
  styleFilter: StyleFilter,
  characterSettings: CharacterSettingsState,
  selectedPresets: string[]
): Promise<string> => {
  const systemPrompt = 'You are an AI assistant that generates concise image prompts for AI image generation (Stable Diffusion, Midjourney). Generate a short, comma-separated prompt with descriptive keywords and tags. Do NOT write stories or long descriptions. Focus on visual elements: subject, style, lighting, composition. Maximum 50 words.';
  
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Generate a concise image prompt using these elements: ${selectedPresets.join(', ')}. Format as comma-separated keywords for AI image generation.` }
  ];

  try {
    return await makeApiCall(config, messages);
  } catch (error) {
    console.error('Custom API error:', error);
    throw new Error('Failed to generate random description with custom API');
  }
};

export const generateImage = async (
  config: CustomApiConfig,
  prompt: string,
  resolution: '1k' | '2k',
  aspectRatio: string
): Promise<string> => {
  // Custom API typically doesn't support image generation
  // This is a placeholder that could be extended for APIs that do support it
  throw new Error('Image generation not supported with custom API');
};