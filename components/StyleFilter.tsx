import React, { useState } from 'react';
import { InfoTooltip } from './InfoTooltip';
import type { StyleFilter as StyleFilterType, RealisticStyle, AnimeStyle } from '../types';
import { ChevronDownIcon } from './icons';

interface StyleFilterProps {
    selectedStyle: StyleFilterType;
    onChange: (style: StyleFilterType) => void;
}

const mainStyles: { id: 'realistic' | 'anime'; label: string }[] = [
    { id: 'realistic', label: 'Realistic' },
    { id: 'anime', label: 'Anime' }
];

const realisticSubStyles: { id: RealisticStyle; label: string }[] = [
    { id: 'professional', label: 'Professional' },
    { id: 'amateur', label: 'Amateur' },
    { id: 'flash', label: 'Flash' }
];

const animeSubStyles: { id: AnimeStyle; label: string }[] = [
    { id: 'ghibli', label: 'Ghibli' },
    { id: 'naruto', label: 'Naruto' },
    { id: 'bleach', label: 'Bleach' }
];

export const StyleFilter: React.FC<StyleFilterProps> = ({ selectedStyle, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const handleMainChange = (main: 'realistic' | 'anime') => {
        if (main === 'realistic') {
            onChange({ main: 'realistic', sub: 'professional' });
        } else {
            onChange({ main: 'anime', sub: 'ghibli' });
        }
    };

    const handleSubChange = (sub: RealisticStyle | AnimeStyle) => {
        onChange({ ...selectedStyle, sub });
    };

    const subStyles = selectedStyle.main === 'realistic' ? realisticSubStyles : animeSubStyles;

    return (
        <div className="bg-gray-900/50 rounded-md border border-gray-700">
             <button 
                onClick={() => setIsOpen(prev => !prev)} 
                className="w-full flex justify-between items-center p-4 focus:outline-none"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-gray-400">Style Filter</h3>
                    <InfoTooltip text="Guides the AI to generate prompts tailored for either photorealistic images or anime/manga styles." />
                </div>
                <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                 <div className="px-4 pb-4 space-y-3 animate-fade-in">
                    <div className="flex space-x-2 rounded-md bg-gray-700 p-1">
                        {mainStyles.map(style => (
                            <button
                                key={style.id}
                                onClick={() => handleMainChange(style.id)}
                                className={`w-full rounded px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-gray-800
                                    ${selectedStyle.main === style.id ? 'bg-accent text-white' : 'text-gray-300 hover:bg-gray-600'}
                                `}
                            >
                                {style.label}
                            </button>
                        ))}
                    </div>
                    
                    <div className="animate-fade-in">
                        <div className="flex space-x-2 rounded-md bg-gray-900/70 p-1">
                            {subStyles.map(style => (
                                <button
                                    key={style.id}
                                    onClick={() => handleSubChange(style.id)}
                                     className={`w-full rounded px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent-hover focus:ring-offset-2 focus:ring-offset-gray-800
                                        ${selectedStyle.sub === style.id ? 'bg-indigo-700 text-white' : 'text-gray-400 hover:bg-gray-700'}
                                    `}
                                >
                                    {style.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};