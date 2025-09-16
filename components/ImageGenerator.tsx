
import React, { useState } from 'react';
import { ChevronDownIcon, LoadingSpinnerIcon } from './icons';
import { InfoTooltip } from './InfoTooltip';

type Resolution = '1k' | '2k';

interface ImageGeneratorProps {
    isOpen: boolean;
    onToggle: () => void;
    prompt: string;
    onPromptChange: (newPrompt: string) => void;
    onGenerate: (prompt: string, resolution: Resolution) => void;
    imageUrl: string | null;
    isLoading: boolean;
    error: string | null;
    supportsImageGeneration: boolean;
}

export const ImageGenerator: React.FC<ImageGeneratorProps> = ({
    isOpen,
    onToggle,
    prompt,
    onPromptChange,
    onGenerate,
    imageUrl,
    isLoading,
    error,
    supportsImageGeneration,
}) => {
    const [resolution, setResolution] = useState<Resolution>('1k');
    
    if (!supportsImageGeneration) {
        return (
            <div id="image-generator-section" className="bg-gray-900/50 rounded-md border border-gray-700 opacity-60">
                <div className="w-full flex justify-between items-center p-4 cursor-not-allowed">
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-gray-500">Image Generation</h3>
                        <InfoTooltip text="This feature is only available when using the Google Gemini or OpenAI API." />
                    </div>
                    <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                </div>
            </div>
        );
    }

    return (
        <div id="image-generator-section" className="bg-gray-900/50 rounded-md border border-gray-700">
            <button
                onClick={onToggle}
                className="w-full flex justify-between items-center p-4 focus:outline-none"
                aria-expanded={isOpen}
            >
                <h3 className="text-sm font-medium text-gray-400">Image Generation</h3>
                <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="px-4 pb-4 space-y-4 animate-fade-in">
                    <div>
                        <label htmlFor="image-prompt" className="block text-sm font-medium text-gray-400 mb-1">
                            Prompt for Image Generation
                        </label>
                        <textarea
                            id="image-prompt"
                            rows={3}
                            className="w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-md shadow-sm p-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent resize-y font-mono text-sm"
                            placeholder="A prompt will appear here when you send it from the results above..."
                            value={prompt}
                            onChange={(e) => onPromptChange(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Resolution</label>
                        <div className="flex space-x-2 rounded-md bg-gray-700 p-1">
                           <button
                                onClick={() => setResolution('1k')}
                                className={`w-full rounded px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-gray-800
                                    ${resolution === '1k' ? 'bg-accent text-white' : 'text-gray-300 hover:bg-gray-600'}
                                `}
                            >
                                1k (1024x1024)
                            </button>
                             <button
                                onClick={() => setResolution('2k')}
                                className={`w-full rounded px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-gray-800
                                    ${resolution === '2k' ? 'bg-accent text-white' : 'text-gray-300 hover:bg-gray-600'}
                                `}
                            >
                                2k (2048x2048)
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={() => onGenerate(prompt, resolution)}
                        disabled={isLoading || !prompt}
                        className="w-full flex justify-center items-center gap-2 bg-indigo-600 text-white font-bold py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? (
                            <>
                                <LoadingSpinnerIcon />
                                Generating...
                            </>
                        ) : (
                            'Generate Image'
                        )}
                    </button>
                    
                    {error && <p className="text-red-400 text-center text-sm">{error}</p>}

                    <p className="text-xs text-gray-500 text-center -mt-2 px-2">
                        This feature uses Google's Imagen4 or OpenAI's DALL-E models. Text overlays on images showing parameters like 'sampler', 'steps', or 'CFG' are features of other applications (like Stable Diffusion WebUI) and cannot be generated here.
                    </p>

                    <div className="w-full aspect-square bg-gray-900 rounded-md border border-gray-700 flex items-center justify-center overflow-hidden">
                        {isLoading && (
                             <div className="flex flex-col items-center text-gray-400">
                                 <LoadingSpinnerIcon />
                                 <p className="mt-2 text-sm">Generating your image...</p>
                                 <p className="mt-1 text-xs text-gray-500">(This can take a minute)</p>
                            </div>
                        )}
                        {!isLoading && imageUrl && (
                             <img src={imageUrl} alt="Generated by AI" className="w-full h-full object-contain" />
                        )}
                        {!isLoading && !imageUrl && !error && (
                            <p className="text-gray-500 text-sm">Your generated image will appear here</p>
                        )}
                         {!isLoading && !imageUrl && error && (
                            <p className="text-red-400 text-sm p-4 text-center">Could not generate image.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
