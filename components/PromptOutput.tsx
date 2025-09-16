
import React, { useState, useEffect } from 'react';
import { CopyIcon, CheckIcon, ShareIcon, ImageIcon } from './icons';
import { InfoTooltip } from './InfoTooltip';

interface PromptOutputProps {
  prompts: string[];
  isLoading: boolean;
  selectedModel: string;
  negativePrompt: string;
  supportsImageGeneration: boolean;
  onSendToGenerator: (prompt: string) => void;
}

export const PromptOutput: React.FC<PromptOutputProps> = ({ prompts, isLoading, selectedModel, negativePrompt, supportsImageGeneration, onSendToGenerator }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [sharedIndex, setSharedIndex] = useState<number | null>(null);
  const [isNegativeCopied, setIsNegativeCopied] = useState<boolean>(false);

  useEffect(() => {
    if (copiedIndex !== null) {
      const timer = setTimeout(() => setCopiedIndex(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedIndex]);
  
  useEffect(() => {
    if (sharedIndex !== null) {
      const timer = setTimeout(() => setSharedIndex(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [sharedIndex]);

  useEffect(() => {
    if (isNegativeCopied) {
        const timer = setTimeout(() => setIsNegativeCopied(false), 2000);
        return () => clearTimeout(timer);
    }
  }, [isNegativeCopied]);


  const handleCopy = (promptToCopy: string, index: number) => {
    if (promptToCopy) {
      navigator.clipboard.writeText(promptToCopy);
      setCopiedIndex(index);
    }
  };

  const handleShare = (promptToShare: string, index: number) => {
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('prompt', promptToShare);
    url.searchParams.set('model', selectedModel);
    navigator.clipboard.writeText(url.toString());
    setSharedIndex(index);
  };
  
  const handleNegativeCopy = () => {
    if(negativePrompt) {
        navigator.clipboard.writeText(negativePrompt);
        setIsNegativeCopied(true);
    }
  };

  const renderLoadingSkeleton = () => (
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="space-y-3 p-4 bg-gray-900 rounded-md border border-gray-700 animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/4"></div>
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-700 rounded w-5/6"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-2">
        Generated Prompts
      </label>
      <div className="space-y-4">
        {isLoading && renderLoadingSkeleton()}
        {!isLoading && prompts.length === 0 && (
           <div className="bg-gray-900 rounded-md p-4 min-h-[120px] text-gray-500 flex items-center justify-center border border-gray-700">
             Your generated prompts will appear here...
           </div>
        )}
        {!isLoading && prompts.map((prompt, index) => {
          const isCopied = copiedIndex === index;
          const isShared = sharedIndex === index;
          const imageButtonTooltip = supportsImageGeneration ? "Generate Image" : "Image generation only available for Gemini or OpenAI";
          return (
            <div key={index} className="relative bg-gray-900 rounded-md p-4 text-gray-200 whitespace-pre-wrap font-mono text-sm border border-gray-700">
              <h4 className="text-xs font-semibold text-indigo-400 mb-2 uppercase">Variation {index + 1}</h4>
              <div
                className="w-full bg-gray-800/70 border border-gray-700 rounded-md p-3 text-gray-100 whitespace-pre-wrap font-mono text-sm resize-y overflow-auto min-h-[120px] max-h-[60vh]"
                role="textbox"
                aria-label={`Prompt variation ${index + 1}`}
                contentEditable={false}
              >{prompt}</div>
              <div className="absolute top-2 right-2 flex gap-2">
                  <div title={imageButtonTooltip}>
                    <button
                        onClick={() => onSendToGenerator(prompt)}
                        className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-accent transition-colors bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-700"
                        aria-label={`Generate image for variation ${index + 1}`}
                        disabled={!supportsImageGeneration}
                    >
                        <ImageIcon />
                    </button>
                  </div>
                  <button
                      onClick={() => handleShare(prompt, index)}
                      className={`p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-accent transition-colors ${
                        isShared 
                          ? 'bg-blue-500/20 text-blue-400' 
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white'
                      }`}
                      aria-label={isShared ? 'Link Copied!' : `Share variation ${index + 1}`}
                      disabled={isShared}
                  >
                      {isShared ? <CheckIcon /> : <ShareIcon />}
                  </button>
                  <button
                      onClick={() => handleCopy(prompt, index)}
                      className={`p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-accent transition-colors ${
                        isCopied 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white'
                      }`}
                      aria-label={isCopied ? 'Copied!' : `Copy variation ${index + 1}`}
                      disabled={isCopied}
                  >
                      {isCopied ? <CheckIcon /> : <CopyIcon />}
                  </button>
              </div>
            </div>
          );
        })}
        
        {!isLoading && prompts.length > 0 && negativePrompt.trim() && (
            <div className="relative bg-gray-900 rounded-md p-4 text-gray-200 whitespace-pre-wrap font-mono text-sm border border-gray-700 mt-4">
              <h4 className="text-xs font-semibold text-red-400 mb-2 uppercase">Negative Prompt</h4>
              <div
                className="w-full bg-gray-800/70 border border-gray-700 rounded-md p-3 text-gray-100 whitespace-pre-wrap font-mono text-sm resize-y overflow-auto min-h-[100px] max-h-[50vh]"
                role="textbox"
                aria-label="Negative prompt"
                contentEditable={false}
              >{negativePrompt}</div>
               <div className="absolute top-2 right-2 flex">
                    <button
                        onClick={handleNegativeCopy}
                        className={`p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-accent transition-colors ${
                          isNegativeCopied
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white'
                        }`}
                        aria-label={isNegativeCopied ? 'Copied!' : 'Copy negative prompt'}
                        disabled={isNegativeCopied}
                    >
                        {isNegativeCopied ? <CheckIcon /> : <CopyIcon />}
                    </button>
               </div>
            </div>
        )}
      </div>
    </div>
  );
};
