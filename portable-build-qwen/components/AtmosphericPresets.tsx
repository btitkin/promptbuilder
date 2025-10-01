import React, { useState, useEffect } from 'react';
import { PresetCategory } from './PresetCategory';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { RotateCcw, Cloud, CloudRain, Zap, Sparkles, Sun, Lightbulb } from 'lucide-react';
import { InfoTooltip } from './InfoTooltip';

interface AtmosphericPresetsProps {
  onAppend: (text: string) => void;
  selectedPresets: string[];
  onSelectedPresetsChange: (presets: string[]) => void;
}

const fogMist = [
  'fog', 'mist', 'heavy fog', 'light mist',
  'morning fog', 'evening mist', 'dense fog', 'wispy mist',
  'ground fog', 'rolling fog', 'misty atmosphere', 'foggy'
];

const smokeVapor = [
  'smoke', 'vapor', 'steam', 'cigarette smoke',
  'incense smoke', 'campfire smoke', 'industrial smoke', 'white smoke',
  'black smoke', 'colored smoke', 'smoke trails', 'smoky atmosphere'
];

const dustParticles = [
  'dust particles', 'floating dust', 'dust motes', 'dust rays',
  'dusty air', 'sand particles', 'pollen', 'spores',
  'ash particles', 'debris', 'particulate matter', 'airborne particles'
];

const weatherEffects = [
  'rain', 'drizzle', 'heavy rain', 'light rain',
  'snow', 'snowfall', 'blizzard', 'sleet',
  'hail', 'storm', 'wind', 'breeze'
];

const cloudFormations = [
  'clouds', 'cloudy sky', 'overcast', 'storm clouds',
  'cumulus clouds', 'cirrus clouds', 'dramatic clouds', 'dark clouds',
  'white clouds', 'puffy clouds', 'cloud cover', 'partly cloudy'
];

const lightingAtmosphere = [
  'hazy light', 'diffused light', 'soft atmosphere', 'dreamy atmosphere',
  'ethereal atmosphere', 'moody atmosphere', 'dramatic atmosphere', 'serene atmosphere',
  'mysterious atmosphere', 'romantic atmosphere', 'melancholic atmosphere', 'nostalgic atmosphere'
];

export const AtmosphericPresets: React.FC<AtmosphericPresetsProps> = ({ 
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
    <div className="bg-gray-900/50 rounded-md border border-cyan-700/50">
      <button 
        onClick={() => setIsCollapsed(prev => !prev)} 
        className="w-full flex justify-between items-center p-4 focus:outline-none"
        aria-expanded={!isCollapsed}
      >
        <div className="flex items-center gap-2">
          <Cloud className="h-4 w-4 text-cyan-500" />
          <h3 className="text-sm font-medium text-cyan-400">Atmospheric</h3>
          {selectedPresets.length > 0 && (
            <span className="text-xs bg-cyan-600 text-cyan-100 px-2 py-0.5 rounded-full">
              {selectedPresets.length} selected
            </span>
          )}
          <InfoTooltip text="Add atmospheric effects like fog, mist, smoke, and weather conditions to create mood and depth." />
        </div>
        <ChevronDownIcon className={`h-5 w-5 text-cyan-400 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`} />
      </button>
      
      {!isCollapsed && (
        <div className="px-4 pb-4 space-y-4 animate-fade-in">
          <div className="space-y-3">
            {/* Fog & Mist */}
            <div className="pt-4 border-t border-cyan-700/30">
              <button
                onClick={() => handleTabToggle('fog')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Cloud className="h-3 w-3 text-gray-400" />
                  <span className="text-xs font-medium text-gray-400">Fog & Mist</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${activeTab === 'fog' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'fog' && (
                <div className="mt-2">
                  <PresetCategory
                    title="Fog & Mist"
                    presets={fogMist}
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

            {/* Smoke & Vapor */}
            <div className="pt-4 border-t border-cyan-700/30">
              <button
                onClick={() => handleTabToggle('smoke')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3 w-3 text-purple-400" />
                  <span className="text-xs font-medium text-purple-400">Smoke & Vapor</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-purple-400 transition-transform duration-200 ${activeTab === 'smoke' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'smoke' && (
                <div className="mt-2">
                  <PresetCategory
                    title="Smoke & Vapor"
                    presets={smokeVapor}
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

            {/* Dust & Particles */}
            <div className="pt-4 border-t border-cyan-700/30">
              <button
                onClick={() => handleTabToggle('dust')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Zap className="h-3 w-3 text-yellow-400" />
                  <span className="text-xs font-medium text-yellow-400">Dust & Particles</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-yellow-400 transition-transform duration-200 ${activeTab === 'dust' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'dust' && (
                <div className="mt-2">
                  <PresetCategory
                    title="Dust & Particles"
                    presets={dustParticles}
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

            {/* Weather Effects */}
            <div className="pt-4 border-t border-cyan-700/30">
              <button
                onClick={() => handleTabToggle('weather')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <CloudRain className="h-3 w-3 text-blue-400" />
                  <span className="text-xs font-medium text-blue-400">Weather Effects</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-blue-400 transition-transform duration-200 ${activeTab === 'weather' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'weather' && (
                <div className="mt-2">
                  <PresetCategory
                    title="Weather Effects"
                    presets={weatherEffects}
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

            {/* Cloud Formations */}
            <div className="pt-4 border-t border-cyan-700/30">
              <button
                onClick={() => handleTabToggle('clouds')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Sun className="h-3 w-3 text-orange-400" />
                  <span className="text-xs font-medium text-orange-400">Cloud Formations</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-orange-400 transition-transform duration-200 ${activeTab === 'clouds' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'clouds' && (
                <div className="mt-2">
                  <PresetCategory
                    title="Cloud Formations"
                    presets={cloudFormations}
                    isOpen={true}
                    onToggle={() => {}}
                    onPresetClick={handlePresetClick}
                    isMultiSelect={true}
                    selectedPresets={selectedPresets}
                    colorClass="text-orange-400"
                  />
                </div>
              )}
            </div>

            {/* Lighting Atmosphere */}
            <div className="pt-4 border-t border-cyan-700/30">
              <button
                onClick={() => handleTabToggle('lighting')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-3 w-3 text-amber-400" />
                  <span className="text-xs font-medium text-amber-400">Lighting Atmosphere</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-amber-400 transition-transform duration-200 ${activeTab === 'lighting' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'lighting' && (
                <div className="mt-2">
                  <PresetCategory
                    title="Lighting Atmosphere"
                    presets={lightingAtmosphere}
                    isOpen={true}
                    onToggle={() => {}}
                    onPresetClick={handlePresetClick}
                    isMultiSelect={true}
                    selectedPresets={selectedPresets}
                    colorClass="text-amber-400"
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

