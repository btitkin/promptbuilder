

import React, { useRef } from 'react';
import { LoadingSpinnerIcon, DiceIcon, BookmarkIcon, LockClosedIcon, KeyIcon } from './icons';

interface PromptInputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onGenerate: () => void;
  onRandom: () => void;
  onAIImagination: () => void;
  onEnhance: () => void;
  isLoading: boolean;
  isGeneratingRandom: boolean;
  isEnhancing: boolean;
  onSaveSnippet: (content: string) => void;
  onLockSelection?: (text: string) => void;
  lockedPhrases?: string[];
  onRemoveLockedPhrase?: (text: string) => void;
  nsfwMode?: string; // Add nsfw mode to control button visibility
}

export const PromptInput: React.FC<PromptInputProps> = ({ value, onChange, onGenerate, onRandom, onAIImagination, onEnhance, isLoading, isGeneratingRandom, isEnhancing, onSaveSnippet, onLockSelection, lockedPhrases, onRemoveLockedPhrase, nsfwMode }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const anyLoading = isLoading || isGeneratingRandom || isEnhancing;

  const getSelectionText = () => {
    const textarea = textareaRef.current;
    if (!textarea) return '';
    const { selectionStart, selectionEnd, value: v } = textarea;
    if (selectionStart === null || selectionEnd === null || selectionStart === undefined || selectionEnd === undefined) return '';
    return v.slice(selectionStart, selectionEnd).trim();
  };

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

  const controlButtonClass = "p-2 rounded-md hover:bg-indigo-500/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-transparent transition-colors text-indigo-400 pressable wow-icon-btn";
  const textButtonClass = "flex items-center gap-2 text-sm text-indigo-400 font-semibold py-1 px-3 rounded-md hover:bg-indigo-500/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-transparent transition-colors pressable";

  return (
    <div className="space-y-2 animate-fade-in">
      <div className="flex justify-between items-center wow-toolbar border-b border-gray-600 py-2 px-3">
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
           <button
             onClick={() => {
               const sel = getSelectionText();
               if (sel && onLockSelection) onLockSelection(sel);
             }}
             disabled={anyLoading}
             className={controlButtonClass}
             title="Lock selected text to preserve it in Enhance/Random"
           >
             <LockClosedIcon />
           </button>
           <div className="border-l border-gray-600 h-6 mx-1 wow-divider"></div>
           <button
            onClick={onRandom}
            disabled={anyLoading}
            className={textButtonClass}
            title="Generate a list of keywords based on the current settings"
            data-testid="btn-generate-keywords"
          >
            {isGeneratingRandom ? <LoadingSpinnerIcon /> : <KeyIcon />}
            Generate Keywords
          </button>

          <button
            onClick={onAIImagination}
            disabled={anyLoading || (nsfwMode !== 'nsfw' && nsfwMode !== 'hardcore')}
            className={textButtonClass}
            title="Generate creative NSFW inspiration with AI imagination"
            data-testid="btn-ai-imagination"
          >
            {isGeneratingRandom ? <LoadingSpinnerIcon /> : <DiceIcon />}
            NSFW AI Imagination
          </button>

          <button
            onClick={onEnhance}
            disabled={anyLoading || !value}
            className={textButtonClass}
            title="Enhance keywords with AI for more creative and detailed descriptions"
            data-testid="btn-enhance"
          >
            {isEnhancing ? <LoadingSpinnerIcon /> : <KeyIcon />}
            Enhance
          </button>
        </div>
      </div>

      {lockedPhrases && lockedPhrases.length > 0 && (
        <div className="mt-2">
          <label className="block text-xs font-medium text-gray-400 mb-1">Locked Phrases</label>
          <div className="flex flex-wrap gap-2">
            {lockedPhrases.map((p) => (
              <span key={p} className="inline-flex items-center bg-gray-700 text-indigo-300 rounded-full px-2 py-1 text-xs">
                <span className="max-w-[260px] truncate">{p}</span>
                <button
                  onClick={() => onRemoveLockedPhrase && onRemoveLockedPhrase(p)}
                  className="ml-2 rounded-full hover:bg-indigo-500/20 text-indigo-300 hover:text-indigo-200 px-2"
                  title="Remove lock"
                  disabled={anyLoading}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <textarea
        ref={textareaRef}
        id="description"
        rows={8}
        className="w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-md shadow-sm p-3 wow-textarea resize-y min-h-[220px] max-h-[70vh]"
        placeholder="e.g., a photorealistic portrait of a woman with red hair"
        value={value}
        onChange={onChange}
        disabled={anyLoading}
      />
      <button
        onClick={onGenerate}
        disabled={anyLoading || !value}
        className="w-full flex justify-center items-center gap-2 bg-accent text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-accent disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors btn-primary-wow"
        data-testid="btn-generate"
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
