import React, { useState, useEffect } from 'react';
import { PresetCategory } from './PresetCategory';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { RotateCcw, Zap, Heart, Sparkles, Skull, Rocket, Flame, Cpu, Waves, Bug } from 'lucide-react';
import { InfoTooltip } from './InfoTooltip';

interface CreaturesPresetsProps {
  onAppend: (text: string) => void;
  selectedPresets: string[];
  onSelectedPresetsChange: (presets: string[]) => void;
}

const anthroFurry = [
  'anthro', 'furry', 'anthropomorphic', 'humanoid animal',
  'wolf anthro', 'fox anthro', 'cat anthro', 'dog anthro',
  'dragon anthro', 'tiger anthro', 'lion anthro', 'bear anthro',
  'rabbit anthro', 'deer anthro', 'horse anthro', 'bird anthro',
  'reptilian anthro', 'scaled humanoid', 'feathered humanoid', 'furred humanoid'
];

const mythicalCreatures = [
  'dragon', 'phoenix', 'griffin', 'pegasus', 'unicorn',
  'chimera', 'sphinx', 'hydra', 'basilisk', 'manticore',
  'centaur', 'minotaur', 'harpy', 'gargoyle', 'wyvern',
  'kelpie', 'banshee', 'wendigo', 'chupacabra', 'thunderbird'
];

const monsters = [
  'monster', 'beast', 'creature', 'abomination', 'horror',
  'tentacle monster', 'eldritch horror', 'cosmic horror', 'lovecraftian',
  'shadow creature', 'nightmare beast', 'void spawn', 'chaos beast',
  'mutant', 'aberration', 'monstrosity', 'fiend', 'predator',
  'giant spider', 'giant serpent', 'giant wolf', 'dire beast'
];

const alienBeings = [
  'alien', 'extraterrestrial', 'space being', 'cosmic entity',
  'grey alien', 'reptilian alien', 'insectoid alien', 'crystalline alien',
  'energy being', 'plasma creature', 'silicon-based life', 'gas giant dweller',
  'hive mind', 'collective consciousness', 'symbiotic organism', 'parasitic alien',
  'android', 'cyborg', 'bio-mechanical', 'synthetic being'
];

const elementalCreatures = [
  'fire elemental', 'water elemental', 'earth elemental', 'air elemental',
  'ice elemental', 'lightning elemental', 'shadow elemental', 'light elemental',
  'flame spirit', 'water spirit', 'stone giant', 'wind dancer',
  'lava golem', 'crystal being', 'metal construct', 'nature spirit',
  'storm entity', 'frost giant', 'magma creature', 'plasma being'
];

const roboticBeings = [
  'robot', 'android', 'cyborg', 'mech', 'automaton',
  'AI construct', 'synthetic being', 'bio-mechanical', 'cybernetic',
  'drone', 'sentinel', 'war machine', 'battle bot', 'guardian unit',
  'nano-swarm', 'hologram', 'digital entity', 'virtual being',
  'techno-organic', 'hybrid construct', 'augmented human', 'enhanced being'
];

const aquaticCreatures = [
  'sea monster', 'kraken', 'leviathan', 'deep one', 'abyssal creature',
  'giant octopus', 'sea serpent', 'shark hybrid', 'whale creature',
  'jellyfish entity', 'coral being', 'bioluminescent creature', 'deep sea horror',
  'aquatic dragon', 'water demon', 'tide hunter', 'ocean predator',
  'nautilus being', 'cephalopod', 'marine mutant', 'underwater dweller'
];

const insectoidCreatures = [
  'insectoid', 'bug creature', 'hive being', 'swarm entity',
  'mantis creature', 'spider being', 'ant warrior', 'bee guardian',
  'beetle knight', 'moth spirit', 'dragonfly rider', 'wasp hunter',
  'centipede horror', 'scorpion beast', 'locust swarm', 'termite builder',
  'chrysalis form', 'metamorphic being', 'compound eyes', 'chitinous armor'
];

export const CreaturesPresets: React.FC<CreaturesPresetsProps> = ({ 
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
    <div className="bg-gray-900/50 rounded-md border border-green-700/50">
      <button 
        onClick={() => setIsCollapsed(prev => !prev)} 
        className="w-full flex justify-between items-center p-4 focus:outline-none"
        aria-expanded={!isCollapsed}
      >
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-green-400" />
          <h3 className="text-sm font-medium text-green-400">Creatures <span className="text-xs text-gray-400">(Opt-in)</span></h3>
          {selectedPresets.length > 0 && (
            <span className="text-xs bg-green-600 text-green-100 px-2 py-0.5 rounded-full">
              {selectedPresets.length} selected
            </span>
          )}
          <InfoTooltip text="Add various creature types from anthro/furry to aliens, monsters, and mythical beings for diverse character creation." />
        </div>
        <ChevronDownIcon className={`h-5 w-5 text-green-400 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`} />
      </button>
      
      {!isCollapsed && (
        <div className="px-4 pb-4 space-y-4 animate-fade-in">
          <div className="space-y-3">
            {/* Anthro/Furry */}
            <div className="pt-4 border-t border-green-700/30">
              <button
                onClick={() => handleTabToggle('anthro')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Heart className="h-3 w-3 text-pink-400" />
                  <span className="text-xs font-medium text-pink-400">Anthro/Furry</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-pink-400 transition-transform duration-200 ${activeTab === 'anthro' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'anthro' && (
                <div className="mt-2">
                  <PresetCategory
                    title="Anthro/Furry"
                    presets={anthroFurry}
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

            {/* Mythical Creatures */}
            <div className="pt-4 border-t border-green-700/30">
              <button
                onClick={() => handleTabToggle('mythical')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3 w-3 text-purple-400" />
                  <span className="text-xs font-medium text-purple-400">Mythical Creatures</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-purple-400 transition-transform duration-200 ${activeTab === 'mythical' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'mythical' && (
                <div className="mt-2">
                  <PresetCategory
                     title="Mythical Creatures"
                     presets={mythicalCreatures}
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

            {/* Monsters */}
            <div className="pt-4 border-t border-green-700/30">
              <button
                onClick={() => handleTabToggle('monsters')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Skull className="h-3 w-3 text-red-400" />
                  <span className="text-xs font-medium text-red-400">Monsters</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-red-400 transition-transform duration-200 ${activeTab === 'monsters' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'monsters' && (
                <div className="mt-2">
                  <PresetCategory
                    title="Monsters"
                    presets={monsters}
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

            {/* Alien Beings */}
            <div className="pt-4 border-t border-green-700/30">
              <button
                onClick={() => handleTabToggle('aliens')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Rocket className="h-3 w-3 text-cyan-400" />
                  <span className="text-xs font-medium text-cyan-400">Alien Beings</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-cyan-400 transition-transform duration-200 ${activeTab === 'aliens' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'aliens' && (
                <div className="mt-2">
                  <PresetCategory
                    title="Alien Beings"
                    presets={alienBeings}
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

            {/* Elemental Creatures */}
            <div className="pt-4 border-t border-green-700/30">
              <button
                onClick={() => handleTabToggle('elemental')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Flame className="h-3 w-3 text-orange-400" />
                  <span className="text-xs font-medium text-orange-400">Elemental Creatures</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-orange-400 transition-transform duration-200 ${activeTab === 'elemental' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'elemental' && (
                <div className="mt-2">
                  <PresetCategory
                    title="Elemental Creatures"
                    presets={elementalCreatures}
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

            {/* Robotic Beings */}
            <div className="pt-4 border-t border-green-700/30">
              <button
                onClick={() => handleTabToggle('robotic')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Cpu className="h-3 w-3 text-blue-400" />
                  <span className="text-xs font-medium text-blue-400">Robotic Beings</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-blue-400 transition-transform duration-200 ${activeTab === 'robotic' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'robotic' && (
                <div className="mt-2">
                  <PresetCategory
                    title="Robotic Beings"
                    presets={roboticBeings}
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

            {/* Aquatic Creatures */}
            <div className="pt-4 border-t border-green-700/30">
              <button
                onClick={() => handleTabToggle('aquatic')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Waves className="h-3 w-3 text-teal-400" />
                  <span className="text-xs font-medium text-teal-400">Aquatic Creatures</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-teal-400 transition-transform duration-200 ${activeTab === 'aquatic' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'aquatic' && (
                <div className="mt-2">
                  <PresetCategory
                    title="Aquatic Creatures"
                    presets={aquaticCreatures}
                    isOpen={true}
                    onToggle={() => {}}
                    onPresetClick={handlePresetClick}
                    isMultiSelect={true}
                    selectedPresets={selectedPresets}
                    colorClass="text-teal-400"
                  />
                </div>
              )}
            </div>

            {/* Insectoid Creatures */}
            <div className="pt-4 border-t border-green-700/30">
              <button
                onClick={() => handleTabToggle('insectoid')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Bug className="h-3 w-3 text-lime-400" />
                  <span className="text-xs font-medium text-lime-400">Insectoid Creatures</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-lime-400 transition-transform duration-200 ${activeTab === 'insectoid' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'insectoid' && (
                <div className="mt-2">
                  <PresetCategory
                    title="Insectoid Creatures"
                    presets={insectoidCreatures}
                    isOpen={true}
                    onToggle={() => {}}
                    onPresetClick={handlePresetClick}
                    isMultiSelect={true}
                    selectedPresets={selectedPresets}
                    colorClass="text-lime-400"
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

