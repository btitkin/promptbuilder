import React, { useState, useEffect } from 'react';
import { PresetCategory } from './PresetCategory';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { RotateCcw, Sparkles, Crown, Flame, Sun, Waves, Wand2, Zap, Skull } from 'lucide-react';
import { InfoTooltip } from './InfoTooltip';

interface FantasyRacesPresetsProps {
  onAppend: (text: string) => void;
  selectedPresets: string[];
  onSelectedPresetsChange: (presets: string[]) => void;
}

const classicFantasy = [
  'elf', 'high elf', 'wood elf', 'dark elf', 'night elf',
  'dwarf', 'mountain dwarf', 'forest dwarf', 'dwarven warrior',
  'halfling', 'hobbit', 'gnome', 'fairy', 'pixie',
  'orc', 'half-orc', 'goblin', 'troll', 'ogre'
];

const celestialBeings = [
  'angel', 'archangel', 'seraph', 'cherub', 'guardian angel',
  'valkyrie', 'divine being', 'celestial warrior', 'heavenly messenger',
  'light being', 'radiant entity', 'blessed one', 'holy spirit',
  'winged deity', 'cosmic entity', 'stellar being', 'astral form'
];

const infernalBeings = [
  'demon', 'succubus', 'incubus', 'devil', 'fallen angel',
  'shadow demon', 'fire demon', 'hell spawn', 'infernal being',
  'dark entity', 'nightmare creature', 'soul reaper', 'void walker',
  'chaos spawn', 'abyssal creature', 'underworld dweller', 'damned soul'
];

const aquaticRaces = [
  'mermaid', 'merman', 'siren', 'sea nymph', 'water spirit',
  'triton', 'sea elf', 'aquatic humanoid', 'ocean dweller',
  'coral maiden', 'pearl diver', 'tide walker', 'deep sea being',
  'nautical creature', 'marine entity', 'oceanic spirit', 'water elemental'
];

const magicalBeings = [
  'witch', 'sorceress', 'wizard', 'mage', 'enchantress',
  'warlock', 'necromancer', 'druid', 'shaman', 'oracle',
  'mystic', 'spellcaster', 'arcane being', 'magical entity',
  'elemental mage', 'crystal witch', 'moon priestess', 'star weaver'
];

const shapeshifters = [
  'werewolf', 'werebeast', 'shapeshifter', 'skin walker',
  'were-cat', 'were-fox', 'were-raven', 'were-dragon',
  'lycanthrope', 'beast form', 'animal spirit', 'primal being',
  'metamorph', 'changeling', 'doppelganger', 'mimic'
];

const undeadRaces = [
  'vampire', 'vampiress', 'dhampir', 'blood drinker',
  'lich', 'undead', 'zombie', 'skeleton warrior',
  'ghost', 'specter', 'wraith', 'banshee',
  'revenant', 'death knight', 'bone lord', 'soul eater'
];

const exoticRaces = [
  'draconian', 'dragon-born', 'lizardfolk', 'serpentine',
  'catfolk', 'feline humanoid', 'wolfkin', 'fox spirit',
  'bird person', 'avian', 'insectoid', 'crystalline being',
  'plant person', 'tree spirit', 'stone giant', 'golem'
];

export const FantasyRacesPresets: React.FC<FantasyRacesPresetsProps> = ({ 
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
          <Sparkles className="h-4 w-4 text-purple-500" />
          <h3 className="text-sm font-medium text-purple-400">Fantasy Races <span className="text-xs text-gray-400">(Opt-in)</span></h3>
          {selectedPresets.length > 0 && (
            <span className="text-xs bg-purple-600 text-purple-100 px-2 py-0.5 rounded-full">
              {selectedPresets.length} selected
            </span>
          )}
          <InfoTooltip text="Transform characters into fantasy races and mythical beings from various mythologies and fictional universes." />
        </div>
        <ChevronDownIcon className={`h-5 w-5 text-purple-400 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`} />
      </button>
      
      {!isCollapsed && (
        <div className="px-4 pb-4 space-y-4 animate-fade-in">
          <div className="space-y-3">
            {/* Classic Fantasy */}
            <div className="pt-4 border-t border-purple-700/30">
              <button
                onClick={() => handleTabToggle('classic')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Crown className="h-3 w-3 text-amber-400" />
                  <span className="text-xs font-medium text-amber-400">Classic Fantasy</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-amber-400 transition-transform duration-200 ${activeTab === 'classic' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'classic' && (
                <div className="mt-2">
                  <PresetCategory
                     title="Classic Fantasy Races"
                     presets={classicFantasy}
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

            {/* Celestial Beings */}
            <div className="pt-4 border-t border-purple-700/30">
              <button
                onClick={() => handleTabToggle('celestial')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Sun className="h-3 w-3 text-yellow-400" />
                  <span className="text-xs font-medium text-yellow-400">Celestial Beings</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-yellow-400 transition-transform duration-200 ${activeTab === 'celestial' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'celestial' && (
                <div className="mt-2">
                  <PresetCategory
                     title="Celestial Beings"
                     presets={celestialBeings}
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

            {/* Infernal Beings */}
            <div className="pt-4 border-t border-purple-700/30">
              <button
                onClick={() => handleTabToggle('infernal')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Flame className="h-3 w-3 text-red-400" />
                  <span className="text-xs font-medium text-red-400">Infernal Beings</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-red-400 transition-transform duration-200 ${activeTab === 'infernal' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'infernal' && (
                <div className="mt-2">
                  <PresetCategory
                     title="Infernal Beings"
                     presets={infernalBeings}
                     isOpen={true}
                     onToggle={() => {}}
                     onPresetClick={handlePresetClick}
                     isMultiSelect={true}
                     selectedPresets={selectedPresets}
                     colorClass="text-red-400"
                   />
                </div>
              )}
            </div>

            {/* Aquatic Races */}
            <div className="pt-4 border-t border-purple-700/30">
              <button
                onClick={() => handleTabToggle('aquatic')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Waves className="h-3 w-3 text-blue-400" />
                  <span className="text-xs font-medium text-blue-400">Aquatic Races</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-blue-400 transition-transform duration-200 ${activeTab === 'aquatic' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'aquatic' && (
                <div className="mt-2">
                  <PresetCategory
                    title="Aquatic Races"
                    presets={aquaticRaces}
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

            {/* Magical Beings */}
            <div className="pt-4 border-t border-purple-700/30">
              <button
                onClick={() => handleTabToggle('magical')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Wand2 className="h-3 w-3 text-purple-400" />
                  <span className="text-xs font-medium text-purple-400">Magical Beings</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-purple-400 transition-transform duration-200 ${activeTab === 'magical' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'magical' && (
                <div className="mt-2">
                  <PresetCategory
                     title="Magical Beings"
                     presets={magicalBeings}
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

            {/* Shapeshifters */}
            <div className="pt-4 border-t border-purple-700/30">
              <button
                onClick={() => handleTabToggle('shapeshifters')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Zap className="h-3 w-3 text-green-400" />
                  <span className="text-xs font-medium text-green-400">Shapeshifters</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-green-400 transition-transform duration-200 ${activeTab === 'shapeshifters' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'shapeshifters' && (
                <div className="mt-2">
                  <PresetCategory
                    title="Shapeshifters"
                    presets={shapeshifters}
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

            {/* Undead Races */}
            <div className="pt-4 border-t border-purple-700/30">
              <button
                onClick={() => handleTabToggle('undead')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Skull className="h-3 w-3 text-gray-400" />
                  <span className="text-xs font-medium text-gray-400">Undead Races</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${activeTab === 'undead' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'undead' && (
                <div className="mt-2">
                  <PresetCategory
                     title="Undead & Cursed"
                     presets={undeadRaces}
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

            {/* Exotic Races */}
            <div className="pt-4 border-t border-purple-700/30">
              <button
                onClick={() => handleTabToggle('exotic')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3 w-3 text-pink-400" />
                  <span className="text-xs font-medium text-pink-400">Exotic Races</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-pink-400 transition-transform duration-200 ${activeTab === 'exotic' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'exotic' && (
                <div className="mt-2">
                  <PresetCategory
                    title="Exotic Races"
                    presets={exoticRaces}
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
          </div>
        </div>
      )}
    </div>
  );
};

