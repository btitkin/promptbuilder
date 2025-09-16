import React from 'react';
import type { ApiConfigState, ApiProvider, CustomApiConfig } from '../types';
import { InfoTooltip } from './InfoTooltip';
import { ChevronDownIcon } from './icons';

interface ApiSettingsProps {
  isOpen: boolean;
  onToggle: () => void;
  config: ApiConfigState;
  onChange: (config: ApiConfigState) => void;
}

// FIX: Explicitly cast the array to the correct type before calling .sort().
// This ensures TypeScript infers the correct element type for the array on which .sort()
// is called, resolving the error where `id` was inferred as `string` instead of `ApiProvider`.
const PROVIDERS = ([
    { id: 'claude', label: 'Anthropic (Claude)', docUrl: 'https://console.anthropic.com/settings/keys' },
    { id: 'cohere', label: 'Cohere', docUrl: 'https://dashboard.cohere.com/api-keys' },
    { id: 'custom_local', label: 'Custom/Local API', docUrl: 'https://docs.mistral.ai/getting-started/quickstart/' },
    { id: 'deepseek', label: 'Deepseek', docUrl: 'https://platform.deepseek.com/api_keys' },
    { id: 'google_gemini', label: 'Google Gemini', docUrl: 'https://aistudio.google.com/app/apikey' },
    { id: 'groq', label: 'Groq', docUrl: 'https://console.groq.com/keys' },
    { id: 'openai', label: 'OpenAI (GPT)', docUrl: 'https://platform.openai.com/api-keys' },
    { id: 'perplexity', label: 'Perplexity', docUrl: 'https://docs.perplexity.ai/docs/getting-started' },
    { id: 'together', label: 'Together AI', docUrl: 'https://api.together.ai/settings/api-keys' },
] as { id: ApiProvider; label: string; docUrl: string }[]).sort((a, b) => a.label.localeCompare(b.label));

export const ApiSettings: React.FC<ApiSettingsProps> = ({ isOpen, onToggle, config, onChange }) => {
  const handleProviderChange = (provider: ApiProvider) => {
    onChange({ ...config, provider });
  };
  
  const handleKeyChange = (key: string) => {
    onChange({
        ...config,
        keys: {
            ...config.keys,
            [config.provider]: key
        }
    });
  };

  const handleCustomConfigChange = (field: keyof CustomApiConfig, value: string) => {
    onChange({
      ...config,
      customConfig: {
        ...config.customConfig,
        [field]: value
      } as CustomApiConfig
    });
  };

  const currentProviderInfo = PROVIDERS.find(p => p.id === config.provider);

  return (
    <div className="bg-gray-900/50 rounded-md border border-gray-700">
      <button 
        onClick={onToggle} 
        className="w-full flex justify-between items-center p-4 focus:outline-none"
        aria-expanded={isOpen}
      >
        <h3 className="text-sm font-medium text-gray-400">API Settings</h3>
        <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="space-y-4 px-4 pb-4 animate-fade-in">
          <p className="text-xs text-gray-500">
            Your API keys are stored securely in your browser's local storage and are never sent to our servers.
          </p>

          <div>
            <label htmlFor="api-provider" className="block text-sm font-medium text-gray-400 mb-1">
              LLM Provider
            </label>
            <select
              id="api-provider"
              value={config.provider}
              onChange={(e) => handleProviderChange(e.target.value as ApiProvider)}
              className="w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
            >
              {PROVIDERS.map(provider => (
                <option key={provider.id} value={provider.id}>{provider.label}</option>
              ))}
            </select>
          </div>
          
          {config.provider === 'custom_local' ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <label htmlFor="custom-url" className="block text-sm font-medium text-gray-400">
                    API Base URL
                  </label>
                  <InfoTooltip text="The base URL of your local LLM API (e.g., http://localhost:11434 for Ollama)" />
                </div>
                <input
                  type="text"
                  id="custom-url"
                  className="w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-md shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent font-mono"
                  placeholder="http://localhost:11434"
                  value={config.customConfig?.url || ''}
                  onChange={(e) => handleCustomConfigChange('url', e.target.value)}
                />
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <label htmlFor="custom-model" className="block text-sm font-medium text-gray-400">
                    Model Name
                  </label>
                  <InfoTooltip text="The name of the model to use (e.g., mistral, llama2, codellama)" />
                </div>
                <input
                  type="text"
                  id="custom-model"
                  className="w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-md shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent font-mono"
                  placeholder="mistral"
                  value={config.customConfig?.model || ''}
                  onChange={(e) => handleCustomConfigChange('model', e.target.value)}
                />
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <label htmlFor="custom-key" className="block text-sm font-medium text-gray-400">
                    API Key (Optional)
                  </label>
                  <InfoTooltip text="API key if your local server requires authentication" />
                </div>
                <input
                  type="password"
                  id="custom-key"
                  className="w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-md shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent font-mono"
                  placeholder="Optional API key..."
                  value={config.customConfig?.key || ''}
                  onChange={(e) => handleCustomConfigChange('key', e.target.value)}
                />
              </div>
              
              {currentProviderInfo && (
                <a href={currentProviderInfo.docUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-indigo-400 hover:underline">
                  How to set up local LLM with Ollama/Mistral?
                </a>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <label htmlFor="api-key" className="block text-sm font-medium text-gray-400">
                  API Key for {currentProviderInfo?.label}
                </label>
                <InfoTooltip text="The key used to authenticate with the selected AI provider." />
              </div>
              <input
                type="password"
                id="api-key"
                className="w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-md shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent font-mono"
                placeholder="Enter your API key here..."
                value={config.keys[config.provider] || ''}
                onChange={(e) => handleKeyChange(e.target.value)}
              />
              {currentProviderInfo && (
                  <a href={currentProviderInfo.docUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-indigo-400 hover:underline">
                      How to get a {currentProviderInfo.label} API key?
                  </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};