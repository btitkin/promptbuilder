import React, { useState, useEffect } from 'react';
import { RotateCcw, Camera, Sparkles, Palette, Brush } from 'lucide-react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { PresetCategory } from './PresetCategory';
import { InfoTooltip } from './InfoTooltip';
import { realisticStyles, animeStyles, artisticStyles } from '../constants';

interface StylePresetsProps {
  onAppend: (text: string) => void;
  selectedPresets: string[];
  onSelectedPresetsChange: (presets: string[]) => void;
}

export const StylePresets: React.FC<StylePresetsProps> = ({ 
  onAppend, 
  selectedPresets, 
  onSelectedPresetsChange 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const [activeTab, setActiveTab] = useState<string | null>(null);

  const handleTabToggle = (tab: string) => {
    setActiveTab(activeTab === tab ? null : tab);
  };

  const handleClearAll = () => {
    onSelectedPresetsChange([]);
  };
  
  const handlePresetClick = (preset: string) => {
    const presetLower = preset.toLowerCase();
    if (preset === '') {
      // Clear all selections
      onSelectedPresetsChange([]);
    } else {
      // Toggle selection in multi-select mode
      onSelectedPresetsChange(
        selectedPresets.includes(presetLower)
          ? selectedPresets.filter(p => p !== presetLower)
          : [...selectedPresets, presetLower]
      );
    }
  };

  return (
    <div className="bg-gray-900/50 rounded-md border border-orange-700/50">
      <button 
        onClick={() => setIsCollapsed(prev => !prev)} 
        className="w-full flex justify-between items-center p-4 focus:outline-none"
        aria-expanded={!isCollapsed}
      >
        <div className="flex items-center gap-2">
          <Brush className="h-4 w-4 text-orange-400" />
          <h3 className="text-sm font-medium text-orange-400">Style Presets <span className="text-xs text-gray-400">(Opt-in)</span></h3>
          {selectedPresets.length > 0 && (
            <span className="text-xs bg-orange-600 text-orange-100 px-2 py-0.5 rounded-full">
              {selectedPresets.length} selected
            </span>
          )}
          <InfoTooltip text="Choose visual styles to influence the overall aesthetic of your generated images. Realistic styles mimic photography, anime styles emulate Japanese animation, and artistic styles apply various art techniques." />
        </div>
        <ChevronDownIcon className={`h-5 w-5 text-orange-400 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`} />
      </button>
      
      {!isCollapsed && (
        <div className="px-4 pb-4 space-y-4 animate-fade-in">
          <div className="space-y-3">
            {/* Realistic Styles */}
            <div className="pt-4 border-t border-orange-700/30">
              <button
                onClick={() => handleTabToggle('realistic')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Camera className="h-3 w-3 text-blue-400" />
                  <span className="text-xs font-medium text-blue-400">Realistic Styles</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-blue-400 transition-transform duration-200 ${activeTab === 'realistic' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'realistic' && (
                <div className="mt-2">
                  <PresetCategory
                    title="Realistic Styles"
                    presets={realisticStyles}
                    isOpen={true}
                    onToggle={() => {}}
                    onPresetClick={handlePresetClick}
                    isMultiSelect={true}
                    selectedPresets={selectedPresets}
                    colorClass="text-blue-400"
                  />
                </div>
              )}
            </div>

            {/* Anime Styles */}
            <div className="pt-4 border-t border-orange-700/30">
              <button
                onClick={() => handleTabToggle('anime')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3 w-3 text-pink-400" />
                  <span className="text-xs font-medium text-pink-400">
                    Anime Styles <span className="text-[10px] text-gray-400 ml-1">(Opt-in)</span>
                  </span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-pink-400 transition-transform duration-200 ${activeTab === 'anime' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'anime' && (
                <div className="mt-2">
                  <PresetCategory
                    title="Anime Styles (Opt-in)"
                    presets={animeStyles}
                    isOpen={true}
                    onToggle={() => {}}
                    onPresetClick={handlePresetClick}
                    isMultiSelect={true}
                    selectedPresets={selectedPresets}
                    colorClass="text-pink-400"
                  />
                </div>
              )}
            </div>

            {/* Artistic Styles */}
            <div className="pt-4 border-t border-orange-700/30">
              <button
                onClick={() => handleTabToggle('artistic')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Palette className="h-3 w-3 text-purple-400" />
                  <span className="text-xs font-medium text-purple-400">Artistic Styles</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-purple-400 transition-transform duration-200 ${activeTab === 'artistic' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'artistic' && (
                <div className="mt-2">
                  <PresetCategory
                    title="Artistic Styles"
                    presets={artisticStyles}
                    isOpen={true}
                    onToggle={() => {}}
                    onPresetClick={handlePresetClick}
                    isMultiSelect={true}
                    selectedPresets={selectedPresets}
                    colorClass="text-purple-400"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};