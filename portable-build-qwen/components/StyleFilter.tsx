import React from 'react';
import { InfoTooltip } from './InfoTooltip';
import type { StyleFilter as StyleFilterType } from '../types';

interface StyleFilterProps {
    styleFilter: StyleFilterType;
    setStyleFilter: (style: StyleFilterType) => void;
}

const mainStyles: { id: 'realistic' | 'anime'; label: string }[] = [
    { id: 'realistic', label: 'Realistic' },
    { id: 'anime', label: 'Anime' }
];

export const StyleFilter: React.FC<StyleFilterProps> = ({ styleFilter, setStyleFilter }) => {
    const handleMainChange = (main: 'realistic' | 'anime') => {
        setStyleFilter({ main, sub: 'any' });
    };

    return (
        <div className="bg-gray-900/50 rounded-md border border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-medium text-gray-400">Style Filter</h3>
                <InfoTooltip text="Guides the Ai to generate prompts tailored for either photorealistic images or anime/manga styles." />
            </div>
            <div className="flex space-x-2 rounded-md bg-gray-700 p-1">
                {mainStyles.map(style => (
                    <button
                        key={style.id}
                        onClick={() => handleMainChange(style.id)}
                        className={`w-full rounded px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-gray-800
                            ${styleFilter.main === style.id ? 'bg-accent text-white' : 'text-gray-300 hover:bg-gray-600'}
                        `}
                    >
                        {style.label}
                    </button>
                ))}
            </div>
        </div>
    );
};