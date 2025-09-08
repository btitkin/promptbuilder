import React, { useState } from 'react';
import type { PromptSnippet } from '../types';
import { ChevronDownIcon, TrashIcon } from './icons';

interface PromptSnippetsProps {
    snippets: PromptSnippet[];
    onAppend: (text: string) => void;
    onDelete: (id: string) => void;
}

export const PromptSnippets: React.FC<PromptSnippetsProps> = ({ snippets, onAppend, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (snippets.length === 0) {
        return null; 
    }

    return (
        <div className="bg-gray-900/50 rounded-md border border-gray-700">
            <button 
                onClick={() => setIsOpen(prev => !prev)} 
                className="w-full flex justify-between items-center p-4 focus:outline-none"
                aria-expanded={isOpen}
            >
                <h3 className="text-sm font-medium text-gray-400">My Snippets ({snippets.length})</h3>
                <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="px-4 pb-4 animate-fade-in">
                    <div className="bg-gray-800 rounded-md border border-gray-700 max-h-60 overflow-y-auto">
                        <ul className="divide-y divide-gray-700/50">
                            {snippets.map(snippet => (
                                <li key={snippet.id} className="group p-3 flex items-center justify-between gap-2">
                                    <button
                                        onClick={() => onAppend(snippet.content)}
                                        className="flex-grow text-left focus:outline-none"
                                        title={`Append: "${snippet.content}"`}
                                    >
                                        <p className="font-semibold text-sm text-gray-300 group-hover:text-accent transition-colors">{snippet.name}</p>
                                        <p className="font-mono text-xs text-gray-400 truncate">{snippet.content}</p>
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(snippet.id);
                                        }}
                                        className="p-2 rounded-md text-gray-500 hover:bg-red-500/10 hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                                        aria-label={`Delete snippet ${snippet.name}`}
                                    >
                                        <TrashIcon />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};
