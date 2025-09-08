
import React, { useState } from 'react';
import { ChevronDownIcon } from './icons';
import { CompactToggle } from './CompactToggle';
import { PresetCategory } from './PresetCategory';

interface LocationPresetsProps {
  onAppend: (text: string) => void;
  selectedPresets: string[];
  onSelectedPresetsChange: (presets: string[]) => void;
}

const insidePresets = [
    'Cozy library', 'Grand ballroom', 'Modern art gallery', 'Bustling coffee shop', 'Sunlit kitchen', 
    'University lecture hall', 'Science laboratory', 'Old bookstore', 'Victorian greenhouse', 'Minimalist apartment', 
    'Rustic cabin living room', 'Luxury hotel lobby', 'High-tech command center', 'Medieval throne room', 
    'Airplane cockpit', 'Artist\'s studio', 'Recording studio', 'Cathedral interior', 'Museum hall', 
    'Indoor swimming pool', 'Blacksmith\'s forge', 'Futuristic spaceship bridge', 'Wizard\'s tower', 'Dusty attic', 
    'Wine cellar', 'Gymnasium', 'Train station interior', 'Elegant dining room', 'Children\'s playroom', 'Hospital room'
];

const outsidePresets = [
    'Sun-drenched meadow', 'Enchanted forest', 'Neon-lit cyberpunk city street', 'Majestic mountain peak', 
    'Serene beach at sunset', 'Ancient ruins', 'Bustling medieval marketplace', 'Tranquil Japanese garden', 
    'Post-apocalyptic wasteland', 'Sprawling alien landscape', 'Futuristic cityscape', 'Dense jungle', 
    'Snowy arctic tundra', 'Vast desert dunes', 'Charming village square', 'Cliffside overlooking the ocean', 
    'Volcanic caldera', 'Misty swamp', 'Flower field in bloom', 'Redwood forest', 'Rice paddies', 
    'Cobblestone alleyway', 'Skate park', 'Botanical garden', 'Wheat field', 'Riverbank', 'Lighthouse coast', 
    'Tropical island', 'Grand Canyon viewpoint', 'Autumnal forest'
];

const nsfwPresets = [
    'Luxury hotel suite', 'Secluded beach at night', 'Private yacht deck', 'Back alley of a club', 
    'Dungeon with chains', 'Decadent boudoir', 'Steamy locker room shower', 'Abandoned warehouse', 
    'Massage parlor room', 'Strip club stage', 'Gloryhole wall', 'Futuristic sex club', 'Opulent vampire crypt', 
    'Orgy room', 'BDSM playroom', 'Public restroom stall', 'Porn studio set', 'Seedy motel room', 'Car backseat', 
    'Doctor\'s examination room', 'Rooftop pool party', 'College dorm room', 'Fetish club', 'Swinger\'s party', 
    'Adult bookstore', 'Backroom of a bar', 'Forest clearing at night', 'Hot tub', 'Sauna', 'Office after hours'
];

export const LocationPresets: React.FC<LocationPresetsProps> = ({ onAppend, selectedPresets, onSelectedPresetsChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'inside' | 'outside' | 'nsfw' | null>(null);
  const [isMultiSelect, setIsMultiSelect] = useState(false);

  const handleTabToggle = (tab: 'inside' | 'outside' | 'nsfw') => {
    setActiveTab(prev => prev === tab ? null : tab);
  };
  
  const handlePresetClick = (preset: string) => {
    if (isMultiSelect) {
      onSelectedPresetsChange(
        selectedPresets.includes(preset) ? selectedPresets.filter(p => p !== preset) : [...selectedPresets, preset]
      );
    } else {
      onAppend(preset);
      // Also update selection for the Random button. Toggle selection on single-select mode.
      const isCurrentlySelected = selectedPresets.length === 1 && selectedPresets[0] === preset;
      onSelectedPresetsChange(isCurrentlySelected ? [] : [preset]);
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
        <h3 className="text-sm font-medium text-gray-400">Location Presets</h3>
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
                title="Inside"
                presets={insidePresets}
                isOpen={activeTab === 'inside'}
                onToggle={() => handleTabToggle('inside')}
                onPresetClick={handlePresetClick}
                isMultiSelect={isMultiSelect}
                selectedPresets={selectedPresets}
                colorClass="text-green-400"
              />
              <PresetCategory 
                title="Outside"
                presets={outsidePresets}
                isOpen={activeTab === 'outside'}
                onToggle={() => handleTabToggle('outside')}
                onPresetClick={handlePresetClick}
                isMultiSelect={isMultiSelect}
                selectedPresets={selectedPresets}
                colorClass="text-blue-400"
              />
              <PresetCategory 
                title="NSFW"
                presets={nsfwPresets}
                isOpen={activeTab === 'nsfw'}
                onToggle={() => handleTabToggle('nsfw')}
                onPresetClick={handlePresetClick}
                isMultiSelect={isMultiSelect}
                selectedPresets={selectedPresets}
                colorClass="text-red-400"
              />
            </div>
          </div>
      )}
    </div>
  );
};
