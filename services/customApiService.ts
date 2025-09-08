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

  try {
    const response = await makeApiCall(config, messages);
    const parsed = JSON.parse(response);
    
    return {
      structuredPrompts: parsed.prompts || [],
      negativePrompt: parsed.negativePrompt || ''
    };
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
  const systemPrompt = 'You are an AI assistant that enhances image descriptions. Make the description more detailed and vivid while keeping the core meaning.';
  
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Enhance this description: ${userInput}` }
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
  const systemPrompt = 'You are an AI assistant that generates creative image descriptions. Create an interesting and detailed description based on the given parameters.';
  
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Generate a random creative description using these elements: ${selectedPresets.join(', ')}` }
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