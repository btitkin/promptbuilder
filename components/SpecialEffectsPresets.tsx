import React, { useState, useEffect } from 'react';
import { PresetCategory } from './PresetCategory';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { RotateCcw, Sparkles, Sun, Zap, Snowflake, Cloud, Wand2, Camera } from 'lucide-react';
import { InfoTooltip } from './InfoTooltip';

interface SpecialEffectsPresetsProps {
  onAppend: (text: string) => void;
  selectedPresets: string[];
  onSelectedPresetsChange: (presets: string[]) => void;
}

const lightingEffects = [
  'god rays', 'volumetric lighting', 'sunbeams', 'light shafts',
  'rim lighting', 'backlighting', 'dramatic lighting', 'cinematic lighting',
  'soft lighting', 'hard lighting', 'studio lighting', 'natural lighting'
];

const glowEffects = [
  'neon glow', 'soft glow', 'inner glow', 'outer glow',
  'bioluminescence', 'phosphorescence', 'luminous', 'radiant',
  'glowing eyes', 'glowing skin', 'magical glow', 'ethereal glow'
];

const particleEffects = [
  'bokeh', 'lens flare', 'light particles', 'floating particles',
  'dust particles', 'sparkles', 'glitter', 'fireflies',
  'embers', 'ash', 'pollen', 'snow particles'
];

const atmosphericEffects = [
  'fog', 'mist', 'haze', 'smoke',
  'steam', 'vapor', 'clouds', 'dust',
  'rain drops', 'water droplets', 'condensation', 'humidity'
];

const magicalEffects = [
  'magic aura', 'energy field', 'force field', 'magical particles',
  'spell effects', 'enchantment glow', 'mystical energy', 'arcane power',
  'elemental effects', 'fire magic', 'ice magic', 'lightning magic'
];

const technicalEffects = [
  'depth of field', 'shallow focus', 'motion blur', 'radial blur',
  'chromatic aberration', 'vignette', 'film grain', 'noise',
  'lens distortion', 'fisheye effect', 'tilt-shift', 'double exposure'
];

export const SpecialEffectsPresets: React.FC<SpecialEffectsPresetsProps> = ({ 
  onAppend, 
  selectedPresets, 
  onSelectedPresetsChange 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isClient, setIsClient] = useState(false);

  const [activeTab, setActiveTab] = useState<string | null>(null);


  const handleTabToggle = (tab: string) => {
    setActiveTab(activeTab === tab ? null : tab);
  };

  const handleClearAll = () => {
    onSelectedPresetsChange([]);
  };

  const handlePresetClick = (preset: string) => {
    const isSelected = selectedPresets.includes(preset);
    if (isSelected) {
      onSelectedPresetsChange(selectedPresets.filter(p => p !== preset));
    } else {
      onSelectedPresetsChange([...selectedPresets, preset]);
    }
  };

  return (
    <div className="bg-gray-900/50 rounded-md border border-purple-700/50">
      <button 
        onClick={() => setIsCollapsed(prev => !prev)} 
        className="w-full flex justify-between items-center p-4 focus:outline-none"
        aria-expanded={!isCollapsed}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-400" />
          <h3 className="text-sm font-medium text-purple-400">Special Effects <span className="text-xs text-gray-400">(Opt-in)</span></h3>
          {selectedPresets.length > 0 && (
            <span className="text-xs bg-purple-600 text-purple-100 px-2 py-0.5 rounded-full">
              {selectedPresets.length} selected
            </span>
          )}
          <InfoTooltip text="Add cinematic lighting, magical effects, and technical photography effects to enhance your image." />
        </div>
        <ChevronDownIcon className={`h-5 w-5 text-purple-400 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`} />
      </button>
      
      {!isCollapsed && (
        <div className="px-4 pb-4 space-y-4 animate-fade-in">
          <div className="space-y-3">
            {/* Lighting Effects */}
            <div className="pt-4 border-t border-purple-700/30">
              <button
                onClick={() => handleTabToggle('lighting')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Sun className="h-3 w-3 text-yellow-400" />
                  <span className="text-xs font-medium text-yellow-400">Lighting Effects</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-yellow-400 transition-transform duration-200 ${activeTab === 'lighting' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'lighting' && (
                <div className="mt-2">
                  <PresetCategory
                     title="Lighting Effects"
                     presets={lightingEffects}
                     isOpen={true}
                     onToggle={() => {}}
                     onPresetClick={handlePresetClick}
                     isMultiSelect={true}
                     selectedPresets={selectedPresets}
                     colorClass="text-yellow-400"
                   />
                </div>
              )}
            </div>

            {/* Glow Effects */}
            <div className="pt-4 border-t border-purple-700/30">
              <button
                onClick={() => handleTabToggle('glow')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Zap className="h-3 w-3 text-blue-400" />
                  <span className="text-xs font-medium text-blue-400">Glow Effects</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-blue-400 transition-transform duration-200 ${activeTab === 'glow' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'glow' && (
                <div className="mt-2">
                  <PresetCategory
                     title="Glow Effects"
                     presets={glowEffects}
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

            {/* Particle Effects */}
            <div className="pt-4 border-t border-purple-700/30">
              <button
                onClick={() => handleTabToggle('particles')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Snowflake className="h-3 w-3 text-cyan-400" />
                  <span className="text-xs font-medium text-cyan-400">Particle Effects</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-cyan-400 transition-transform duration-200 ${activeTab === 'particles' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'particles' && (
                <div className="mt-2">
                  <PresetCategory
                     title="Particle Effects"
                     presets={particleEffects}
                     isOpen={true}
                     onToggle={() => {}}
                     onPresetClick={handlePresetClick}
                     isMultiSelect={true}
                     selectedPresets={selectedPresets}
                     colorClass="text-cyan-400"
                   />
                </div>
              )}
            </div>

            {/* Atmospheric Effects */}
            <div className="pt-4 border-t border-purple-700/30">
              <button
                onClick={() => handleTabToggle('atmospheric')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Cloud className="h-3 w-3 text-gray-400" />
                  <span className="text-xs font-medium text-gray-400">Atmospheric Effects</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${activeTab === 'atmospheric' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'atmospheric' && (
                <div className="mt-2">
                  <PresetCategory
                     title="Atmospheric Effects"
                     presets={atmosphericEffects}
                     isOpen={true}
                     onToggle={() => {}}
                     onPresetClick={handlePresetClick}
                     isMultiSelect={true}
                     selectedPresets={selectedPresets}
                     colorClass="text-gray-400"
                   />
                </div>
              )}
            </div>

            {/* Magical Effects */}
            <div className="pt-4 border-t border-purple-700/30">
              <button
                onClick={() => handleTabToggle('magical')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Wand2 className="h-3 w-3 text-purple-400" />
                  <span className="text-xs font-medium text-purple-400">Magical Effects</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-purple-400 transition-transform duration-200 ${activeTab === 'magical' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'magical' && (
                <div className="mt-2">
                  <PresetCategory
                     title="Magical Effects"
                     presets={magicalEffects}
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

            {/* Technical Effects */}
            <div className="pt-4 border-t border-purple-700/30">
              <button
                onClick={() => handleTabToggle('technical')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Camera className="h-3 w-3 text-green-400" />
                  <span className="text-xs font-medium text-green-400">Technical Effects</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-green-400 transition-transform duration-200 ${activeTab === 'technical' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'technical' && (
                <div className="mt-2">
                  <PresetCategory
                     title="Technical Effects"
                     presets={technicalEffects}
                     isOpen={true}
                     onToggle={() => {}}
                     onPresetClick={handlePresetClick}
                     isMultiSelect={true}
                     selectedPresets={selectedPresets}
                     colorClass="text-green-400"
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

