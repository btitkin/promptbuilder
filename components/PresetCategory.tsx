
import React from 'react';
import { ChevronDownIcon } from './icons';

export interface PresetCategoryProps {
  title: string;
  presets: string[];
  isOpen: boolean;
  onToggle: () => void;
  onPresetClick: (text: string) => void;
  isMultiSelect: boolean;
  selectedPresets: string[];
  colorClass?: string;
}

export const PresetCategory: React.FC<PresetCategoryProps> = ({ title, presets, isOpen, onToggle, onPresetClick, isMultiSelect, selectedPresets, colorClass = 'text-gray-500' }) => {
  return (
    <div className="border-t border-gray-700/50 first:border-t-0">
      <button 
        onClick={onToggle} 
        className="w-full flex justify-between items-center p-3 focus:outline-none"
        aria-expanded={isOpen}
      >
        <h4 className={`text-xs font-semibold uppercase ${colorClass}`}>{title}</h4>
        <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="px-3 pb-3 flex flex-wrap gap-2 animate-fade-in">
          {presets.map(preset => {
             const presetLower = preset.toLowerCase();
             const isSelected = selectedPresets.includes(presetLower);
             return (
               <button
                 key={preset}
                 onClick={() => onPresetClick(presetLower)}
                 className={`px-3 py-1 text-sm rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-gray-800 focus:ring-accent ${
                   isSelected
                     ? 'bg-accent text-white'
                     : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                 }`}
               >
                 {preset}
               </button>
             );
          })}
        </div>
      )}
    </div>
  );
};
