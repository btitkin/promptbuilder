import React, { useState, useEffect } from 'react';
import { PresetCategory } from './PresetCategory';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { RotateCcw, User, UserCheck, Palette, Scissors } from 'lucide-react';
import { InfoTooltip } from './InfoTooltip';

interface HairPresetsProps {
  onAppend: (text: string) => void;
  selectedPresets: string[];
  onSelectedPresetsChange: (presets: string[]) => void;
}

const femaleHairStyles = [
  'Shaved head', 'Buzzcut', 'Pixie cut', 'Bob cut', 'Lob', 'Shoulder length hair',
  'Long hair', 'Very long hair', 'Waist length hair', 'Layered hair', 'Straight hair',
  'Wavy hair', 'Curly hair', 'Kinky hair', 'Coily hair', 'Crimped hair',
  'Teased hair', 'Voluminous hair', 'Flat hair', 'Messy hair', 'Bedhead',
  'Sleek bun', 'Chignon', 'Updo', 'Half up half down', 'Ponytail',
  'High ponytail', 'Low ponytail', 'Braid', 'French braid', 'Dutch braid',
  'Pigtails', 'Space buns', 'Dreadlocks', 'Cornrows', 'Afro',
  'Faux hawk', 'Mohawk', 'Undercut', 'Side shave', 'Victory rolls',
  'Beehive', 'Fishtail braid', 'Bangs', 'Side swept bangs', 'Blunt bangs',
  'Curtain bangs', 'Wispy bangs', 'Micro bangs', 'Choppy bangs', 'Asymmetrical bangs'
];

const maleHairStyles = [
  'Shaved head', 'Buzzcut', 'Crew cut', 'Undercut', 'Fade',
  'Slicked back hair', 'Pompadour', 'Quiff', 'Spiky hair', 'Messy hair',
  'Long hair', 'Shoulder length hair', 'Man bun', 'Ponytail', 'Braid',
  'Dreadlocks', 'Cornrows', 'Afro', 'Mohawk', 'Faux hawk',
  'Bald', 'Wet hair', 'Bedhead'
];

const hairColors = [
  'Blonde hair', 'Brown hair', 'Black hair', 'Red hair', 'Auburn hair',
  'Silver hair', 'White hair', 'Pink hair', 'Blue hair', 'Purple hair',
  'Green hair', 'Rainbow hair', 'Multicolored hair', 'Ombre hair', 'Balayage hair',
  'Highlights', 'Lowlights', 'Platinum blonde', 'Strawberry blonde', 'Ash blonde',
  'Jet black', 'Crimson red', 'Burgundy', 'Neon pink', 'Pastel blue',
  'Emerald green', 'Iridescent hair', 'Fire hair', 'Ice hair', 'Galaxy hair',
  'Two-tone hair', 'Split hair color'
];

export const HairPresets: React.FC<HairPresetsProps> = ({ onAppend, selectedPresets, onSelectedPresetsChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isClient, setIsClient] = useState(false);

  const [activeTab, setActiveTab] = useState<string | null>(null);


  const handleTabToggle = (tab: string) => {
    setActiveTab(activeTab === tab ? null : tab);
  };

  const handleClearAll = () => {
    onSelectedPresetsChange([]);
  };

  return (
    <div className="bg-gray-900/50 rounded-md border border-pink-700/50">
      <button 
        onClick={() => setIsCollapsed(prev => !prev)} 
        className="w-full flex justify-between items-center p-4 focus:outline-none"
        aria-expanded={!isCollapsed}
      >
        <div className="flex items-center gap-2">
          <Scissors className="h-4 w-4 text-pink-400" />
          <h3 className="text-sm font-medium text-pink-400">Hair Presets</h3>
          {selectedPresets.length > 0 && (
            <span className="text-xs bg-pink-600 text-pink-100 px-2 py-0.5 rounded-full">
              {selectedPresets.length} selected
            </span>
          )}
          <InfoTooltip text="Select hairstyles and hair colors for your character. Choose from female styles, male styles, or hair colors." />
        </div>
        <ChevronDownIcon className={`h-5 w-5 text-pink-400 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`} />
      </button>
      
      {!isCollapsed && (
        <div className="px-4 pb-4 space-y-4 animate-fade-in">
          <div className="space-y-3">
            <div className="pt-4 border-t border-pink-700/30">
              <button
                onClick={() => handleTabToggle('female')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3 text-pink-400" />
                  <span className="text-xs font-medium text-pink-400">Female Hairstyles</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-pink-400 transition-transform duration-200 ${activeTab === 'female' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'female' && (
                <div className="mt-2">
                  <PresetCategory
                    title="Female Hairstyles"
                    presets={femaleHairStyles}
                    isOpen={true}
                    onToggle={() => {}}
                    onPresetClick={(preset) => {
                      const isSelected = selectedPresets.includes(preset.toLowerCase());
                      if (isSelected) {
                        onSelectedPresetsChange(selectedPresets.filter(p => p !== preset.toLowerCase()));
                      } else {
                        onSelectedPresetsChange([...selectedPresets, preset.toLowerCase()]);
                      }
                    }}
                    isMultiSelect={true}
                    selectedPresets={selectedPresets}
                    colorClass="text-pink-400"
                  />
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-pink-700/30">
              <button
                onClick={() => handleTabToggle('male')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <UserCheck className="h-3 w-3 text-blue-400" />
                  <span className="text-xs font-medium text-blue-400">Male Hairstyles</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-blue-400 transition-transform duration-200 ${activeTab === 'male' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'male' && (
                <div className="mt-2">
                  <PresetCategory
                    title="Male Hairstyles"
                    presets={maleHairStyles}
                    isOpen={true}
                    onToggle={() => {}}
                    onPresetClick={(preset) => {
                      const isSelected = selectedPresets.includes(preset.toLowerCase());
                      if (isSelected) {
                        onSelectedPresetsChange(selectedPresets.filter(p => p !== preset.toLowerCase()));
                      } else {
                        onSelectedPresetsChange([...selectedPresets, preset.toLowerCase()]);
                      }
                    }}
                    isMultiSelect={true}
                    selectedPresets={selectedPresets}
                    colorClass="text-blue-400"
                  />
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-pink-700/30">
              <button
                onClick={() => handleTabToggle('colors')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Palette className="h-3 w-3 text-purple-400" />
                  <span className="text-xs font-medium text-purple-400">Hair Colors</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-purple-400 transition-transform duration-200 ${activeTab === 'colors' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'colors' && (
                <div className="mt-2">
                  <PresetCategory
                    title="Hair Colors"
                    presets={hairColors}
                    isOpen={true}
                    onToggle={() => {}}
                    onPresetClick={(preset) => {
                      const isSelected = selectedPresets.includes(preset.toLowerCase());
                      if (isSelected) {
                        onSelectedPresetsChange(selectedPresets.filter(p => p !== preset.toLowerCase()));
                      } else {
                        onSelectedPresetsChange([...selectedPresets, preset.toLowerCase()]);
                      }
                    }}
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

