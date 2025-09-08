
import React, { useState } from 'react';
import { ChevronDownIcon } from './icons';
import { CompactToggle } from './CompactToggle';
import { PresetCategory } from './PresetCategory';

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
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'lighting' | 'camera' | 'atmosphere' | null>(null);
  const [isMultiSelect, setIsMultiSelect] = useState(false);

  const handleTabToggle = (tab: 'lighting' | 'camera' | 'atmosphere') => {
    setActiveTab(prev => prev === tab ? null : tab);
  };
  
  const handlePresetClick = (preset: string) => {
    const presetLower = preset.toLowerCase();
    if (isMultiSelect) {
      onSelectedPresetsChange(
        selectedPresets.includes(presetLower)
          ? selectedPresets.filter(p => p !== presetLower)
          : [...selectedPresets, presetLower]
      );
    } else {
      onAppend(preset); // Append original case
      // Also update selection for the Random button. Toggle selection on single-select mode.
      const isCurrentlySelected = selectedPresets.length === 1 && selectedPresets[0] === presetLower;
      onSelectedPresetsChange(isCurrentlySelected ? [] : [presetLower]);
    }
  };
  
  const handleAppendSelected = () => {
    if (selectedPresets.length > 0) {
      onAppend(selectedPresets.join(', '));
      onSelectedPresetsChange([]);
    }
  };

  const handleClearSelection = () => {
    onSelectedPresetsChange([]);
  };


  return (
    <div className="bg-gray-900/50 rounded-md border border-gray-700">
       <button 
        onClick={() => setIsOpen(prev => !prev)} 
        className="w-full flex justify-between items-center p-4 focus:outline-none"
        aria-expanded={isOpen}
      >
        <h3 className="text-sm font-medium text-gray-400">Shot Presets</h3>
        <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
         <div className="px-4 pb-4 space-y-4 animate-fade-in">
            <div className="p-3 bg-gray-800 rounded-md border border-gray-700 space-y-3">
              <CompactToggle
                label="Multi-Select"
                checked={isMultiSelect}
                onChange={(checked) => {
                    setIsMultiSelect(checked);
                    // Clear selection when changing mode to avoid confusion
                    onSelectedPresetsChange([]);
                }}
                tooltip="Toggle to select multiple presets at once."
              />
              {isMultiSelect && selectedPresets.length > 0 && (
                <div className="flex gap-2 animate-fade-in">
                  <button 
                    onClick={handleAppendSelected} 
                    className="flex-grow bg-accent text-white font-semibold py-2 px-3 text-sm rounded-md hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-accent transition-colors"
                  >
                    Append Selected ({selectedPresets.length})
                  </button>
                  <button 
                    onClick={handleClearSelection} 
                    className="text-gray-400 font-semibold py-2 px-3 text-sm rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-accent transition-colors"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            <div className="bg-gray-800 rounded-md border border-gray-700">
              <PresetCategory 
                title="Lighting"
                presets={lightingPresets}
                isOpen={activeTab === 'lighting'}
                onToggle={() => handleTabToggle('lighting')}
                onPresetClick={handlePresetClick}
                isMultiSelect={isMultiSelect}
                selectedPresets={selectedPresets}
                colorClass="text-yellow-400"
              />
              <PresetCategory 
                title="Camera"
                presets={cameraPresets}
                isOpen={activeTab === 'camera'}
                onToggle={() => handleTabToggle('camera')}
                onPresetClick={handlePresetClick}
                isMultiSelect={isMultiSelect}
                selectedPresets={selectedPresets}
                colorClass="text-blue-400"
              />
              <PresetCategory 
                title="Atmosphere"
                presets={atmospherePresets}
                isOpen={activeTab === 'atmosphere'}
                onToggle={() => handleTabToggle('atmosphere')}
                onPresetClick={handlePresetClick}
                isMultiSelect={isMultiSelect}
                selectedPresets={selectedPresets}
                colorClass="text-purple-400"
              />
            </div>
          </div>
      )}
    </div>
  );
};
