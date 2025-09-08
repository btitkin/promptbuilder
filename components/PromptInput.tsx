

import React, { useRef } from 'react';
import { LoadingSpinnerIcon, MagicWandIcon, DiceIcon, BookmarkIcon } from './icons';

interface PromptInputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onGenerate: () => void;
  onEnhance: () => void;
  onRandom: () => void;
  isLoading: boolean;
  isEnhancing: boolean;
  isGeneratingRandom: boolean;
  onSaveSnippet: (content: string) => void;
}

export const PromptInput: React.FC<PromptInputProps> = ({ value, onChange, onGenerate, onEnhance, onRandom, isLoading, isEnhancing, isGeneratingRandom, onSaveSnippet }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const anyLoading = isLoading || isEnhancing || isGeneratingRandom;

  const handleTextTransform = (transformType: 'increase' | 'decrease') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start === end) {
      alert("Please select some text in the description box to change its weight.");
      return;
    }

    const selectedText = value.substring(start, end);
    let newSelectedText = selectedText;
    let newSelectionEnd = end;

    const weightedRegex = /^\((.+):([\d\.]+)\)$/;
    const simpleParenRegex = /^\((.+)\)$/;
    const bracketRegex = /^\[(.+)\]$/;

    const weightedMatch = selectedText.match(weightedRegex);
    const simpleParenMatch = !weightedMatch && selectedText.match(simpleParenRegex);
    const bracketMatch = selectedText.match(bracketRegex);

    if (transformType === 'increase') {
      if (weightedMatch) {
        const text = weightedMatch[1];
        const weight = parseFloat(weightedMatch[2]);
        const newWeight = (weight + 0.1).toFixed(1);
        newSelectedText = `(${text}:${newWeight})`;
      } else if (simpleParenMatch) {
        const text = simpleParenMatch[1];
        newSelectedText = `(${text}:1.1)`;
      } else if (bracketMatch) {
        const text = bracketMatch[1];
        newSelectedText = `(${text})`;
      } else {
        newSelectedText = `(${selectedText}:1.1)`;
      }
    } else { // decrease
      if (weightedMatch) {
        const text = weightedMatch[1];
        const weight = parseFloat(weightedMatch[2]);
        const newWeight = parseFloat((weight - 0.1).toFixed(1));
        if (newWeight > 1.0) {
          newSelectedText = `(${text}:${newWeight.toFixed(1)})`;
        } else if (newWeight === 1.0) {
          newSelectedText = `(${text})`;
        } else {
          newSelectedText = `[${text}]`;
        }
      } else if (simpleParenMatch) {
        const text = simpleParenMatch[1];
        newSelectedText = `[${text}]`;
      } else if (bracketMatch) {
        newSelectedText = bracketMatch[1];
      } else {
        newSelectedText = `[${selectedText}]`;
      }
    }

    const newValue = value.substring(0, start) + newSelectedText + value.substring(end);
    newSelectionEnd = start + newSelectedText.length;

    const syntheticEvent = {
      target: { value: newValue }
    } as React.ChangeEvent<HTMLTextAreaElement>;
    onChange(syntheticEvent);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start, newSelectionEnd);
      }
    }, 0);
  };

  const handleSaveClick = () => {
    const textarea = textareaRef.current;
    if (!textarea || !value.trim()) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    const contentToSave = selectedText.trim() || value.trim();
    onSaveSnippet(contentToSave);
  };

  const controlButtonClass = "p-2 rounded-md hover:bg-indigo-500/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-transparent transition-colors text-indigo-400";
  const textButtonClass = "flex items-center gap-2 text-sm text-indigo-400 font-semibold py-1 px-3 rounded-md hover:bg-indigo-500/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-transparent transition-colors";

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label htmlFor="description" className="block text-sm font-medium text-gray-400">
          Enter your simple description
        </label>
        <div className="flex items-center gap-2">
           <button onClick={() => handleTextTransform('increase')} disabled={anyLoading} className={controlButtonClass} title="Increase weight of selected text (e.g., (word:1.1))">
             <span className="font-bold text-lg leading-none">(+)</span>
           </button>
           <button onClick={() => handleTextTransform('decrease')} disabled={anyLoading} className={controlButtonClass} title="Decrease weight of selected text (e.g., [word])">
             <span className="font-bold text-lg leading-none">[-]</span>
           </button>
           <button onClick={handleSaveClick} disabled={anyLoading || !value} className={controlButtonClass} title="Save selected text (or full prompt) as a reusable snippet">
             <BookmarkIcon />
           </button>
           <div className="border-l border-gray-600 h-6 mx-1"></div>
           <button
            onClick={onRandom}
            disabled={anyLoading}
            className={textButtonClass}
            title="Generate a random description based on your settings"
          >
            {isGeneratingRandom ? <LoadingSpinnerIcon /> : <DiceIcon />}
            Random
          </button>
          <button
            onClick={onEnhance}
            disabled={anyLoading || !value}
            className={textButtonClass}
            title="Enhance your current description with more detail"
          >
            {isEnhancing ? <LoadingSpinnerIcon /> : <MagicWandIcon />}
            Enhance
          </button>
        </div>
      </div>
      <textarea
        ref={textareaRef}
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
