
import React, { useState, useEffect } from 'react';
import { PresetCategory } from './PresetCategory';
import { CompactToggle } from './CompactToggle';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { RotateCcw, Home, TreePine, Eye, MapPin } from 'lucide-react';
import { InfoTooltip } from './InfoTooltip';

interface LocationPresetsProps {
  onAppend: (text: string) => void;
  selectedPresets: string[];
  onSelectedPresetsChange: (presets: string[]) => void;
}

export const insidePresets = [
    'Cozy library', 'Grand ballroom', 'Modern art gallery', 'Bustling coffee shop', 'Sunlit kitchen', 
    'University lecture hall', 'Science laboratory', 'Old bookstore', 'Victorian greenhouse', 'Minimalist apartment', 
    'Rustic cabin living room', 'Luxury hotel lobby', 'High-tech command center', 'Medieval throne room', 
    'Airplane cockpit', 'Artist\'s studio', 'Recording studio', 'Cathedral interior', 'Museum hall', 
    'Indoor swimming pool', 'Blacksmith\'s forge', 'Futuristic spaceship bridge', 'Wizard\'s tower', 'Dusty attic', 
    'Wine cellar', 'Gymnasium', 'Train station interior', 'Elegant dining room', 'Children\'s playroom', 'Hospital room'
];

export const outsidePresets = [
    'Sun-drenched meadow', 'Enchanted forest', 'Neon-lit cyberpunk city street', 'Majestic mountain peak', 
    'Serene beach at sunset', 'Ancient ruins', 'Bustling medieval marketplace', 'Tranquil Japanese garden', 
    'Post-apocalyptic wasteland', 'Sprawling alien landscape', 'Futuristic cityscape', 'Dense jungle', 
    'Snowy arctic tundra', 'Vast desert dunes', 'Charming village square', 'Cliffside overlooking the ocean', 
    'Volcanic caldera', 'Misty swamp', 'Flower field in bloom', 'Redwood forest', 'Rice paddies', 
    'Cobblestone alleyway', 'Skate park', 'Botanical garden', 'Wheat field', 'Riverbank', 'Lighthouse coast', 
    'Tropical island', 'Grand Canyon viewpoint', 'Autumnal forest'
];

export const nsfwPresets = [
    'Luxury hotel suite', 'Secluded beach at night', 'Private yacht deck', 'Back alley of a club', 
    'Dungeon with chains', 'Decadent boudoir', 'Steamy locker room shower', 'Abandoned warehouse', 
    'Massage parlor room', 'Strip club stage', 'Gloryhole wall', 'Futuristic sex club', 'Opulent vampire crypt', 
    'Orgy room', 'BDSM playroom', 'Public restroom stall', 'Porn studio set', 'Seedy motel room', 'Car backseat', 
    'Doctor\'s examination room', 'Rooftop pool party', 'College dorm room', 'Fetish club', 'Swinger\'s party', 
    'Adult bookstore', 'Backroom of a bar', 'Forest clearing at night', 'Hot tub', 'Sauna', 'Office after hours'
];

export const LocationPresets: React.FC<LocationPresetsProps> = ({ onAppend, selectedPresets, onSelectedPresetsChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [activeTab, setActiveTab] = useState<'inside' | 'outside' | 'nsfw' | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleTabToggle = (tab: 'inside' | 'outside' | 'nsfw') => {
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
    <div className="bg-gray-900/50 rounded-md border border-sky-700/50">
      <div 
        onClick={() => setIsCollapsed(prev => !prev)} 
        className="w-full flex justify-between items-center p-4 focus:outline-none cursor-pointer"
        aria-expanded={!isCollapsed}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setIsCollapsed(prev => !prev)}
      >
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-sky-400" />
          <h3 className="text-sm font-medium text-sky-400">Location Presets</h3>
          {selectedPresets.length > 0 && (
            <span className="text-xs bg-sky-600 text-sky-100 px-2 py-0.5 rounded-full">
              {selectedPresets.length} selected
            </span>
          )}
          <InfoTooltip text="Choose from indoor, outdoor, or nsfw location settings to set the scene for your image" />
        </div>
        <ChevronDownIcon className={`h-5 w-5 text-sky-400 transition-transform duration-200 ${!isCollapsed ? 'rotate-180' : ''}`} />
      </div>

      {!isCollapsed && (
         <div className="px-4 pb-4 space-y-4 animate-fade-in">
            <div className="space-y-0">
              <div className="border-t border-sky-700/30">
                <PresetCategory 
                  title={
                    <div className="flex items-center gap-2">
                      <Home className="h-3 w-3 text-green-400" />
                      <span>Inside</span>
                      <InfoTooltip text="Indoor locations like libraries, cafes, homes, and other interior spaces" />
                    </div>
                  }
                  presets={insidePresets}
                  isOpen={activeTab === 'inside'}
                  onToggle={() => handleTabToggle('inside')}
                  onPresetClick={handlePresetClick}
                  isMultiSelect={true}
                  selectedPresets={selectedPresets}
                  colorClass="text-green-400"
                />
              </div>
              <div className="border-t border-sky-700/30">
                <PresetCategory 
                  title={
                    <div className="flex items-center gap-2">
                      <TreePine className="h-3 w-3 text-blue-400" />
                      <span>Outside</span>
                      <InfoTooltip text="Outdoor locations like forests, beaches, cities, and natural landscapes" />
                    </div>
                  }
                  presets={outsidePresets}
                  isOpen={activeTab === 'outside'}
                  onToggle={() => handleTabToggle('outside')}
                  onPresetClick={handlePresetClick}
                  isMultiSelect={true}
                  selectedPresets={selectedPresets}
                  colorClass="text-blue-400"
                />
              </div>
              <div className="border-t border-sky-700/30">
                <PresetCategory 
                  title={
                    <div className="flex items-center gap-2">
                      <Eye className="h-3 w-3 text-yellow-400" />
                      <span>NSFW</span>
                      <InfoTooltip text="Adult-oriented locations for mature content generation" />
                    </div>
                  }
                  presets={nsfwPresets}
                  isOpen={activeTab === 'nsfw'}
                  onToggle={() => handleTabToggle('nsfw')}
                  onPresetClick={handlePresetClick}
                  isMultiSelect={true}
                  selectedPresets={selectedPresets}
                  colorClass="text-yellow-400"
                />
              </div>
            </div>
          </div>
      )}
    </div>
  );
};
