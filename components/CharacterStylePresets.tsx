import React, { useState } from 'react';
import { InfoTooltip } from './InfoTooltip';
import { Skull, Shirt, Zap, Briefcase, Dumbbell, Globe, Palette } from 'lucide-react';

const ChevronDown: React.FC = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const ChevronUp: React.FC = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);

const RotateCcw: React.FC = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 4v6h6M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </svg>
);

interface CharacterStylePresetsProps {
  onAppend: (text: string) => void;
  selectedPresets: string[];
  onSelectedPresetsChange: (presets: string[]) => void;
}

export const CharacterStylePresets: React.FC<CharacterStylePresetsProps> = ({ 
  onAppend, 
  selectedPresets, 
  onSelectedPresetsChange 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Use selectedPresets from props instead of local state
  const selectedStyles = selectedPresets;

  const characterStyles = {
    'Alternative Styles': [
      'goth', 'emo', 'punk', 'grunge', 'scene', 'alternative', 'dark academia'
    ],
    'Fashion Styles': [
      'preppy', 'hipster', 'bohemian', 'minimalist', 'vintage', 'retro', 'chic'
    ],
    'Subculture Styles': [
      'cyberpunk', 'steampunk', 'dieselpunk', 'biopunk', 'solarpunk', 'cottagecore'
    ],
    'Professional Styles': [
      'business casual', 'corporate', 'academic', 'medical professional', 'military', 'uniform'
    ],
    'Lifestyle Styles': [
      'athletic', 'outdoorsy', 'artistic', 'musician', 'dancer', 'model', 'influencer'
    ],
    'Cultural Styles': [
      'kawaii', 'harajuku', 'lolita', 'visual kei', 'gyaru', 'decora', 'fairy kei'
    ]
  };

  const handleStyleClick = (style: string) => {
    const newSelectedStyles = selectedStyles.includes(style) 
      ? selectedStyles.filter(s => s !== style)
      : [...selectedStyles, style];
    onSelectedPresetsChange(newSelectedStyles);
  };

  const clearAll = () => {
    onSelectedPresetsChange([]);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Alternative Styles':
        return <Skull className="h-3 w-3 text-gray-400" />;
      case 'Fashion Styles':
        return <Shirt className="h-3 w-3 text-pink-400" />;
      case 'Subculture Styles':
        return <Zap className="h-3 w-3 text-purple-400" />;
      case 'Professional Styles':
        return <Briefcase className="h-3 w-3 text-blue-400" />;
      case 'Lifestyle Styles':
        return <Dumbbell className="h-3 w-3 text-green-400" />;
      case 'Cultural Styles':
        return <Globe className="h-3 w-3 text-orange-400" />;
      default:
        return null;
    }
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'Alternative Styles':
        return 'text-gray-400';
      case 'Fashion Styles':
        return 'text-pink-400';
      case 'Subculture Styles':
        return 'text-purple-400';
      case 'Professional Styles':
        return 'text-blue-400';
      case 'Lifestyle Styles':
        return 'text-green-400';
      case 'Cultural Styles':
        return 'text-orange-400';
      default:
        return 'text-gray-500';
    }
  };

  const getCategoryTooltip = (category: string): string => {
    switch (category) {
      case 'Alternative Styles':
        return 'Dark and alternative fashion styles including goth, punk, and emo aesthetics.';
      case 'Fashion Styles':
        return 'Mainstream fashion trends and classic style categories.';
      case 'Subculture Styles':
        return 'Futuristic and niche aesthetic movements like cyberpunk and cottagecore.';
      case 'Professional Styles':
        return 'Work-appropriate and formal attire for various professions.';
      case 'Lifestyle Styles':
        return 'Active and creative lifestyle-based fashion choices.';
      case 'Cultural Styles':
        return 'Japanese street fashion and cultural aesthetic movements.';
      default:
        return 'Character style options for this category.';
    }
  };

  return (
    <div className="bg-gray-900/50 rounded-md border border-orange-700/50">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex justify-between items-center p-4 focus:outline-none"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-orange-400" />
          <h3 className="text-sm font-medium text-orange-400">Character Style Presets <span className="text-xs text-gray-400">(Opt-in)</span></h3>
          {selectedPresets.length > 0 && (
            <span className="text-xs bg-orange-600 text-orange-100 px-2 py-0.5 rounded-full">
              {selectedPresets.length} selected
            </span>
          )}
          <InfoTooltip text="Choose character style aesthetics and subcultures to influence the overall look and personality of your character." />
        </div>
        <div className={`h-5 w-5 text-orange-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
          {isExpanded ? <ChevronUp /> : <ChevronDown />}
        </div>
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 animate-fade-in">
          {Object.entries(characterStyles).map(([category, styles]) => (
            <div key={category} className="pt-4 border-t border-orange-700/30">
              <div className="flex items-center gap-2 mb-2">
                {getCategoryIcon(category)}
                <h4 className={`text-xs font-semibold uppercase ${getCategoryColor(category)}`}>
                  {category}
                </h4>
                <InfoTooltip text={getCategoryTooltip(category)} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 rounded-md bg-gray-700 p-1">
                {styles.map((style) => (
                  <button
                    key={style}
                    onClick={() => handleStyleClick(style)}
                    className={`w-full rounded capitalize px-2 py-1 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-gray-800 ${
                      selectedStyles.includes(style)
                        ? 'bg-accent text-white'
                        : 'text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};