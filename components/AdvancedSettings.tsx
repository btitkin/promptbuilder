import React from 'react';
import type { AdvancedSettingsState } from '../types';
import { InfoTooltip } from './InfoTooltip';

interface AdvancedSettingsProps {
  isOpen: boolean;
  settings: AdvancedSettingsState;
  onChange: (settings: AdvancedSettingsState) => void;
}

const ASPECT_RATIOS = ['1:1', '16:9', '9:16', '4:3', '3:4', 'none'];

export const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({ isOpen, settings, onChange }) => {
  if (!isOpen) {
    return null;
  }

  const handleChange = (field: keyof AdvancedSettingsState, value: string) => {
    onChange({ ...settings, [field]: value });
  };

  return (
    <div className="space-y-4 bg-gray-900/50 p-4 rounded-md border border-gray-700 animate-fade-in">
      <h3 className="text-sm font-medium text-gray-400 border-b border-gray-700 pb-2 mb-4">Advanced Settings</h3>
      
      <div>
        <div className="flex items-center gap-2 mb-1">
          <label htmlFor="negative-prompt" className="block text-sm font-medium text-gray-400">
            Negative Prompt
          </label>
          <InfoTooltip text="Specify terms to exclude from the image. Useful for removing common artifacts like 'blurry' or 'bad anatomy'." />
        </div>
        <textarea
          id="negative-prompt"
          rows={2}
          className="w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-md shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent resize-y"
          placeholder="e.g., blurry, ugly, deformed hands"
          value={settings.negativePrompt}
          onChange={(e) => handleChange('negativePrompt', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <label htmlFor="aspect-ratio" className="block text-sm font-medium text-gray-400">
              Aspect Ratio
            </label>
            <InfoTooltip text="Set the desired width-to-height ratio of the final image. Support varies by model." />
          </div>
          <select
            id="aspect-ratio"
            value={settings.aspectRatio}
            onChange={(e) => handleChange('aspectRatio', e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
          >
            {ASPECT_RATIOS.map(ratio => (
              <option key={ratio} value={ratio}>{ratio}</option>
            ))}
          </select>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <label htmlFor="seed" className="block text-sm font-medium text-gray-400">
              Seed
            </label>
            <InfoTooltip text="A specific number that initializes the image generation. Using the same seed with the same prompt will produce a similar image." />
          </div>
          <input
            type="number"
            id="seed"
            min="0"
            className="w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-md shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
            placeholder="e.g., 12345"
            value={settings.seed}
            onChange={(e) => handleChange('seed', e.target.value)}
          />
        </div>
      </div>
      
      <div>
        <div className="flex items-center gap-2 mb-1">
            <label htmlFor="additional-params" className="block text-sm font-medium text-gray-400">
              Additional Parameters
            </label>
            <InfoTooltip text="Add any other model-specific parameters, like '--style raw' or '--chaos 10'. Ensure the syntax is correct for the selected model." />
        </div>
          <input
            type="text"
            id="additional-params"
            className="w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-md shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
            placeholder="e.g., --style raw --chaos 10"
            value={settings.additionalParams}
            onChange={(e) => handleChange('additionalParams', e.target.value)}
          />
        </div>
    </div>
  );
};