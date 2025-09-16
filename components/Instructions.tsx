
import React from 'react';
import { ChevronDownIcon } from './icons';

interface InstructionsProps {
    isOpen: boolean;
    onToggle: () => void;
}

export const Instructions: React.FC<InstructionsProps> = ({ isOpen, onToggle }) => {
    return (
        <div className="bg-gray-900/50 rounded-md border border-gray-700">
            <button
                onClick={onToggle}
                className="w-full flex justify-between items-center p-4 focus:outline-none"
                aria-expanded={isOpen}
            >
                <h3 className="text-sm font-medium text-gray-400">How to Use Prompt Builder</h3>
                <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="px-4 pb-4 space-y-6 text-gray-300 text-sm leading-relaxed animate-fade-in">
                    <div>
                        <p>Welcome! This tool transforms your simple ideas into detailed, structured prompts optimized for various AI image and video models. Whether you're a beginner or an expert, this guide will help you get the most out of it.</p>
                    </div>

                    <div className="space-y-2 p-3 bg-indigo-900/30 rounded-md border border-indigo-500/50">
                        <h4 className="font-semibold text-base text-indigo-400">Initial Setup: Add Your API Key</h4>
                        <p className="text-gray-400">
                            This application requires an API key from a supported Large Language Model (LLM) provider (like Google Gemini) to work. Your keys are stored securely in your browser and are never shared.
                            <br/>
                            <strong>Please go to the "API Settings" section below and enter your key to begin.</strong>
                        </p>
                    </div>

                    <div className="space-y-2">
                        <h4 className="font-semibold text-base text-indigo-400">Quick Start Guide</h4>
                        <ol className="list-decimal list-inside space-y-1 text-gray-400">
                            <li><strong className="text-gray-300">Set Your API Key:</strong> Expand the "API Settings" section and enter your API key for an LLM provider (e.g., Google Gemini). The app won't work without it!</li>
                            <li><strong className="text-gray-300">Describe Your Idea:</strong> Write a basic concept in the main text box (e.g., "a knight in a forest").</li>
                            <li><strong className="text-gray-300">Choose Your AI Model:</strong> Select the target AI model (e.g., SDXL, Google Imagen) from the dropdown. The tool will format the prompt correctly for that model.</li>
                            <li><strong className="text-gray-300">(Optional) Refine Your Vision:</strong> Use the "Style," "Character," and "Content Rules" sections to set high-level constraints.</li>
                            <li><strong className="text-gray-300">(Optional) Add Details:</strong> Click on the "Shot," "Pose," "Location," and "Clothing" presets to quickly add specific keywords to your description.</li>
                            <li><strong className="text-gray-300">Generate:</strong> Click the "Generate Prompt" button.</li>
                            <li><strong className="text-gray-300">Use the Output:</strong> Copy the generated prompts, or send one directly to the built-in Image Generator using the image icon.</li>
                        </ol>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-semibold text-base text-indigo-400">Feature Guide for Power Users</h4>
                        <ul className="list-disc list-inside space-y-2">
                            <li><strong className="text-gray-300">Main Description Box:</strong><br/>
                                <span className="text-gray-400">
                                    - <strong className="text-gray-300">Enhance:</strong> Uses AI to flesh out your simple description with more detail, respecting your "Enhance Options" in the Content Rules.<br/>
                                    - <strong className="text-gray-300">Random:</strong> Generates a completely new idea based on your current settings (including any selected presets).<br/>
                                    - <strong className="text-gray-300">Weighting `(+)` `(-)`:</strong> Select text and use these buttons to increase or decrease its importance in the prompt (e.g., `(word:1.1)` or `[word]`).
                                </span>
                            </li>
                            <li><strong className="text-gray-300">Settings Accordions (Style, Character, etc.):</strong><br/>
                                <span className="text-gray-400">
                                    These collapsible sections provide powerful, high-level controls. The AI will strictly follow these rules when generating prompts.
                                </span>
                            </li>
                            <li><strong className="text-gray-300">Advanced Settings:</strong><br/>
                                <span className="text-gray-400">
                                    Use the "Advanced" toggle on the main screen to reveal settings for Negative Prompt, Aspect Ratio, Seed, and other custom parameters. These are applied automatically based on the selected model's syntax.
                                </span>
                            </li>
                             <li><strong className="text-gray-300">Presets (Shot, Pose, etc.):</strong><br/>
                                <span className="text-gray-400">
                                    - Clicking a preset appends it to your main description.<br/>
                                    - Enable <strong className="text-gray-300">Multi-Select</strong> to choose several presets at once. These selected keywords will also be used by the "Random" button to guide its creativity.
                                </span>
                            </li>
                            <li><strong className="text-gray-300">Prompt Snippets:</strong><br/>
                                <span className="text-gray-400">
                                    Select text in the main input and click the bookmark icon to save it. You can reuse common phrases or complex character descriptions later.
                                </span>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-semibold text-base text-indigo-400">AI Model Documentation</h4>
                        <div className="p-3 bg-gray-900 rounded-md border border-gray-700 space-y-3">
                            <h5 className="font-semibold">Natural Language Models (Google Imagen, DALL-E)</h5>
                            <p className="text-gray-400 text-xs">
                                <strong className="text-gray-300">Best for:</strong> Descriptive, sentence-based prompts. Write as if you're describing a photograph in detail. The AI understands grammar and context.<br/>
                                <strong className="text-gray-300">Example:</strong> <code className="bg-gray-700/50 px-1 py-0.5 rounded">A photorealistic portrait of an old wizard with a long white beard, sitting in a library filled with ancient books, soft light coming from a window.</code>
                            </p>
                        </div>
                         <div className="p-3 bg-gray-900 rounded-md border border-gray-700 space-y-3">
                            <h5 className="font-semibold">Tag-Based Models (SDXL, Pony, SD 1.5)</h5>
                            <p className="text-gray-400 text-xs">
                                <strong className="text-gray-300">Best for:</strong> Comma-separated keywords and tags for precise control. Order often matters, with important tags first.<br/>
                                <strong className="text-gray-300">`BREAK` Keyword:</strong> Use the "BREAK" toggle for models like SDXL. This separates concepts for better interpretation by the AI.<br/>
                                <strong className="text-gray-300">Example:</strong> <code className="bg-gray-700/50 px-1 py-0.5 rounded">masterpiece, best quality, 1man, old wizard, long white beard, library, ancient books, sitting, detailed background, soft lighting, window light, absurdres.</code>
                            </p>
                        </div>
                         <div className="p-3 bg-gray-900 rounded-md border border-gray-700 space-y-3">
                            <h5 className="font-semibold">MidJourney</h5>
                            <p className="text-gray-400 text-xs">
                                <strong className="text-gray-300">Best for:</strong> A unique mix of natural language and parameters, known for its highly artistic and opinionated style.<br/>
                                <strong className="text-gray-300">Syntax:</strong> Starts with `/imagine prompt:`. Uses double-dash parameters like `--ar 16:9` (aspect ratio) and `--no text` (negative prompt). This tool formats these automatically.<br/>
                                <strong className="text-gray-300">Example:</strong> <code className="bg-gray-700/50 px-1 py-0.5 rounded">/imagine prompt: an old wizard in his library, cinematic lighting, dramatic --ar 16:9 --style raw</code>
                            </p>
                        </div>
                         <div className="p-3 bg-gray-900 rounded-md border border-gray-700 space-y-3">
                            <h5 className="font-semibold">Video Models (Veo 3, SVD)</h5>
                            <p className="text-gray-400 text-xs">
                                <strong className="text-gray-300">Best for:</strong> Describing scenes with clear action and movement. Be explicit about what is happening over a short period.<br/>
                                <strong className="text-gray-300">Example:</strong> <code className="bg-gray-700/50 px-1 py-0.5 rounded">A close-up shot of a cat playfully batting at a ball of yarn, which then unrolls across a wooden floor.</code>
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
