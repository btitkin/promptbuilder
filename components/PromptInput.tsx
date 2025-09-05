
import React from 'react';
import { LoadingSpinnerIcon, MagicWandIcon, DiceIcon } from './icons';

interface PromptInputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onGenerate: () => void;
  onEnhance: () => void;
  onRandom: () => void;
  isLoading: boolean;
  isEnhancing: boolean;
  isGeneratingRandom: boolean;
}

export const PromptInput: React.FC<PromptInputProps> = ({ value, onChange, onGenerate, onEnhance, onRandom, isLoading, isEnhancing, isGeneratingRandom }) => {
  const anyLoading = isLoading || isEnhancing || isGeneratingRandom;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label htmlFor="description" className="block text-sm font-medium text-gray-400">
          Enter your simple description
        </label>
        <div className="flex items-center gap-2">
           <button
            onClick={onRandom}
            disabled={anyLoading}
            className="flex items-center gap-2 text-sm text-indigo-400 font-semibold py-1 px-3 rounded-md hover:bg-indigo-500/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-transparent transition-colors"
            title="Generate a random description based on your settings"
          >
            {isGeneratingRandom ? (
              <LoadingSpinnerIcon />
            ) : (
              <DiceIcon />
            )}
            Random
          </button>
          <button
            onClick={onEnhance}
            disabled={anyLoading || !value}
            className="flex items-center gap-2 text-sm text-indigo-400 font-semibold py-1 px-3 rounded-md hover:bg-indigo-500/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-transparent transition-colors"
            title="Enhance your current description with more detail"
          >
            {isEnhancing ? (
              <LoadingSpinnerIcon />
            ) : (
              <MagicWandIcon />
            )}
            Enhance
          </button>
        </div>
      </div>
      <textarea
        id="description"
        rows={4}
        className="w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-md shadow-sm p-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent resize-none"
        placeholder="e.g., a photorealistic portrait of a woman with red hair"
        value={value}
        onChange={onChange}
        disabled={anyLoading}
      />
      <button
        onClick={onGenerate}
        disabled={anyLoading || !value}
        className="w-full flex justify-center items-center gap-2 bg-accent text-white font-bold py-3 px-4 rounded-md hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-accent disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <>
            <LoadingSpinnerIcon />
            Generating...
          </>
        ) : (
          'Generate Prompt'
        )}
      </button>
    </div>
  );
};