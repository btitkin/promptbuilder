
import React, { useState, useEffect } from 'react';
import { PresetCategory } from './PresetCategory';
import { CompactToggle } from './CompactToggle';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { RotateCcw, Lightbulb, Camera, Cloud } from 'lucide-react';
import { InfoTooltip } from './InfoTooltip';

interface ShotPresetsProps {
  onAppend: (text: string) => void;
  selectedPresets: string[];
  onSelectedPresetsChange: (presets: string[]) => void;
}

const lightingPresets = [
  'Golden Hour', 'Blue Hour', 'Overcast', 'Dappled Sunlight', 'Full Moon', 'Starlight',
  'Aurora Borealis', 'Midday Sun', 'Sunrise', 'Sunset', 'Neon Glow', 'Candlelight',
  'Campfire', 'Studio Lighting', 'Softbox Lighting', 'Rim Lighting', 'Backlighting',
  'Spotlight', 'Streetlights', 'Bioluminescence', 'Cinematic Lighting', 'Volumetric Lighting',
  'God Rays', 'Hard Shadows', 'Chiaroscuro', 'Split Lighting', 'Low-key Lighting',
  'High-key Lighting', 'Underwater Caustics', 'Iridescent', 'Holographic', 'Ethereal Glow',
  'Magical Aura', 'Glitching Light', 'Film Noir Lighting'
];

const cameraPresets = [
  'Low Angle', 'High Angle', 'Eye-Level', 'Dutch Angle', "Worm's-eye View", "Bird's-eye View",
  'Top-down Shot', 'Extreme Close-up', 'Close-up', 'Medium Shot', 'Cowboy Shot', 'Full Shot',
  'Long Shot', 'Establishing Shot', 'Point-of-View (POV)', 'Macro Lens', 'Fisheye Lens',
  'Wide-Angle Lens', 'Telephoto Lens', 'Shallow Depth of Field', 'Deep Focus', 'Bokeh',
  'Lens Flare', 'Tilt-Shift', 'Motion Blur', 'Anamorphic', 'Rule of Thirds', 'Leading Lines',
  'Symmetrical', 'Asymmetrical Balance', 'Centered Composition', 'Framing', 'Golden Ratio'
];

const atmospherePresets = [
  'Serene', 'Joyful', 'Whimsical', 'Nostalgic', 'Romantic', 'Peaceful', 'Vibrant',
  'Energetic', 'Triumphant', 'Magical', 'Ominous', 'Eerie', 'Melancholy', 'Gloomy',
  'Tense', 'Desolate', 'Apocalyptic', 'Chaotic', 'Foreboding', 'Sinister', 'Mysterious',
  'Surreal', 'Dreamlike', 'Ethereal', 'Gritty', 'Industrial', 'Cybernetic', 'Steampunk',
  'Biopunk', 'Solarpunk', 'Contemplative', 'Heroic', 'Intimate', 'Suspenseful', 'Otherworldly'
];

export const ShotPresets: React.FC<ShotPresetsProps> = ({ onAppend, selectedPresets, onSelectedPresetsChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isClient, setIsClient] = useState(false);

  const [activeTab, setActiveTab] = useState<'lighting' | 'camera' | 'atmosphere' | null>(null);


  const handleTabToggle = (tab: 'lighting' | 'camera' | 'atmosphere') => {
    setActiveTab(prev => prev === tab ? null : tab);
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
    <div className="bg-gray-900/50 rounded-md border border-slate-700/50">
       <button 
        onClick={() => setIsCollapsed(prev => !prev)} 
        className="w-full flex justify-between items-center p-4 focus:outline-none"
        aria-expanded={!isCollapsed}
      >
        <div className="flex items-center gap-2">
          <Camera className="h-4 w-4 text-slate-400" />
          <h3 className="text-sm font-medium text-slate-400">Shot Presets <span className="text-xs text-gray-400">(Opt-in)</span></h3>
          {selectedPresets.length > 0 && (
            <span className="text-xs bg-slate-600 text-slate-200 px-2 py-0.5 rounded-full">
              {selectedPresets.length} selected
            </span>
          )}
          <InfoTooltip text="Control lighting, camera angles, and atmosphere to set the mood and visual style of your image." />
        </div>
        <ChevronDownIcon className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${!isCollapsed ? 'rotate-180' : ''}`} />
      </button>

      {!isCollapsed && (
         <div className="px-4 pb-4 space-y-4 animate-fade-in">
            <div className="space-y-0">
              <div className="border-t border-slate-700/30">
                <PresetCategory 
                  title={
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-3 w-3 text-yellow-400" />
                      <span>Lighting</span>
                      <InfoTooltip text="Control the lighting conditions and mood of your scene, from natural sunlight to dramatic cinematic effects." />
                    </div>
                  }
                  presets={lightingPresets}
                  isOpen={activeTab === 'lighting'}
                  onToggle={() => handleTabToggle('lighting')}
                  onPresetClick={handlePresetClick}
                  isMultiSelect={true}
                  selectedPresets={selectedPresets}
                  colorClass="text-yellow-400"
                />
              </div>
              <div className="border-t border-slate-700/30">
                <PresetCategory 
                  title={
                    <div className="flex items-center gap-2">
                      <Camera className="h-3 w-3 text-blue-400" />
                      <span>Camera</span>
                      <InfoTooltip text="Set camera angles, shot types, and composition techniques to frame your subject perfectly." />
                    </div>
                  }
                  presets={cameraPresets}
                  isOpen={activeTab === 'camera'}
                  onToggle={() => handleTabToggle('camera')}
                  onPresetClick={handlePresetClick}
                  isMultiSelect={true}
                  selectedPresets={selectedPresets}
                  colorClass="text-blue-400"
                />
              </div>
              <div className="border-t border-slate-700/30">
                <PresetCategory 
                  title={
                    <div className="flex items-center gap-2">
                      <Cloud className="h-3 w-3 text-purple-400" />
                      <span>Atmosphere</span>
                      <InfoTooltip text="Define the emotional tone and atmosphere of your image, from peaceful and serene to dark and mysterious." />
                    </div>
                  }
                  presets={atmospherePresets}
                  isOpen={activeTab === 'atmosphere'}
                  onToggle={() => handleTabToggle('atmosphere')}
                  onPresetClick={handlePresetClick}
                  isMultiSelect={true}
                  selectedPresets={selectedPresets}
                  colorClass="text-purple-400"
                />
              </div>
            </div>
          </div>
      )}
    </div>
  );
};


