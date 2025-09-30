import React, { useState, useEffect } from 'react';
import { PresetCategory } from './PresetCategory';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { RotateCcw, Package, Gem, Shirt, Hand, Sword, Music, Sofa, Leaf, Cpu } from 'lucide-react';
import { InfoTooltip } from './InfoTooltip';

interface PropsPresetsProps {
  onAppend: (text: string) => void;
  selectedPresets: string[];
  onSelectedPresetsChange: (presets: string[]) => void;
}

const jewelry = [
  'necklace', 'choker', 'pendant', 'chain', 'collar',
  'earrings', 'hoop earrings', 'stud earrings', 'drop earrings',
  'bracelet', 'bangle', 'anklet', 'ring', 'wedding ring',
  'tiara', 'crown', 'diadem', 'circlet', 'headband',
  'brooch', 'pin', 'cufflinks', 'watch', 'locket'
];

const accessories = [
  'glasses', 'sunglasses', 'reading glasses', 'monocle',
  'hat', 'cap', 'beret', 'fedora', 'top hat', 'crown',
  'scarf', 'shawl', 'bandana', 'headscarf', 'veil',
  'gloves', 'mittens', 'fingerless gloves', 'opera gloves',
  'belt', 'sash', 'ribbon', 'bow tie', 'necktie'
];

const handheldItems = [
  'wine glass', 'champagne flute', 'cocktail glass', 'coffee cup',
  'book', 'scroll', 'letter', 'photograph', 'map',
  'flower', 'rose', 'bouquet', 'single flower', 'petals',
  'candle', 'lantern', 'torch', 'flashlight', 'lamp',
  'key', 'coin', 'gem', 'crystal', 'orb', 'staff'
];

const weapons = [
  'sword', 'katana', 'rapier', 'dagger', 'knife',
  'bow', 'arrow', 'crossbow', 'spear', 'lance',
  'axe', 'hammer', 'mace', 'club', 'whip',
  'gun', 'pistol', 'rifle', 'revolver', 'musket',
  'shield', 'buckler', 'armor', 'helmet', 'gauntlets'
];

const musicalInstruments = [
  'guitar', 'violin', 'piano', 'flute', 'harp',
  'drums', 'trumpet', 'saxophone', 'clarinet', 'oboe',
  'cello', 'bass', 'mandolin', 'banjo', 'ukulele',
  'accordion', 'harmonica', 'recorder', 'xylophone', 'tambourine'
];

const furniture = [
  'chair', 'throne', 'bench', 'stool', 'couch',
  'table', 'desk', 'bed', 'pillow', 'cushion',
  'mirror', 'painting', 'portrait', 'statue', 'vase',
  'bookshelf', 'cabinet', 'chest', 'trunk', 'wardrobe',
  'chandelier', 'curtains', 'drapes', 'tapestry', 'rug'
];

const nature = [
  'tree', 'branch', 'leaf', 'flower', 'grass',
  'rock', 'stone', 'crystal', 'shell', 'feather',
  'butterfly', 'bird', 'cat', 'dog', 'horse',
  'water', 'fountain', 'pond', 'stream', 'waterfall',
  'mountain', 'hill', 'cliff', 'cave', 'forest'
];

const technology = [
  'phone', 'smartphone', 'tablet', 'laptop', 'computer',
  'camera', 'video camera', 'microphone', 'headphones', 'speakers',
  'television', 'radio', 'clock', 'watch', 'calculator',
  'robot', 'drone', 'satellite', 'spaceship', 'car',
  'motorcycle', 'bicycle', 'train', 'airplane', 'boat'
];

export const PropsPresets: React.FC<PropsPresetsProps> = ({ 
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
    <div className="bg-gray-900/50 rounded-md border border-blue-700/50">
      <button 
        onClick={() => setIsCollapsed(prev => !prev)} 
        className="w-full flex justify-between items-center p-4 focus:outline-none"
        aria-expanded={!isCollapsed}
      >
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-blue-400" />
          <h3 className="text-sm font-medium text-blue-400">Props <span className="text-xs text-gray-400">(Opt-in)</span></h3>
          {selectedPresets.length > 0 && (
            <span className="text-xs bg-blue-600 text-blue-100 px-2 py-0.5 rounded-full">
              {selectedPresets.length} selected
            </span>
          )}
          <InfoTooltip text="Add various props and accessories to enhance scenes with jewelry, handheld items, weapons, instruments, and more." />
        </div>
        <ChevronDownIcon className={`h-5 w-5 text-blue-400 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`} />
      </button>
      
      {!isCollapsed && (
        <div className="px-4 pb-4 space-y-4 animate-fade-in">
          <div className="space-y-3">
            {/* Jewelry */}
            <div className="pt-4 border-t border-blue-700/30">
              <button
                onClick={() => handleTabToggle('jewelry')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Gem className="h-3 w-3 text-amber-400" />
                  <span className="text-xs font-medium text-amber-400">Jewelry</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-amber-400 transition-transform duration-200 ${activeTab === 'jewelry' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'jewelry' && (
                <div className="mt-2">
                  <PresetCategory
                    title="Jewelry"
                    presets={jewelry}
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

            {/* Accessories */}
            <div className="pt-4 border-t border-blue-700/30">
              <button
                onClick={() => handleTabToggle('accessories')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Shirt className="h-3 w-3 text-purple-400" />
                  <span className="text-xs font-medium text-purple-400">Accessories</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-purple-400 transition-transform duration-200 ${activeTab === 'accessories' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'accessories' && (
                <div className="mt-2">
                  <PresetCategory
                    title="Accessories"
                    presets={accessories}
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

            {/* Handheld Items */}
            <div className="pt-4 border-t border-blue-700/30">
              <button
                onClick={() => handleTabToggle('handheld')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Hand className="h-3 w-3 text-green-400" />
                  <span className="text-xs font-medium text-green-400">Handheld Items</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-green-400 transition-transform duration-200 ${activeTab === 'handheld' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'handheld' && (
                <div className="mt-2">
                  <PresetCategory
                    title="Handheld Items"
                    presets={handheldItems}
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

            {/* Weapons */}
            <div className="pt-4 border-t border-blue-700/30">
              <button
                onClick={() => handleTabToggle('weapons')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Sword className="h-3 w-3 text-red-400" />
                  <span className="text-xs font-medium text-red-400">Weapons</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-red-400 transition-transform duration-200 ${activeTab === 'weapons' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'weapons' && (
                <div className="mt-2">
                  <PresetCategory
                    title="Weapons"
                    presets={weapons}
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

            {/* Musical Instruments */}
            <div className="pt-4 border-t border-blue-700/30">
              <button
                onClick={() => handleTabToggle('instruments')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Music className="h-3 w-3 text-indigo-400" />
                  <span className="text-xs font-medium text-indigo-400">Musical Instruments</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-indigo-400 transition-transform duration-200 ${activeTab === 'instruments' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'instruments' && (
                <div className="mt-2">
                  <PresetCategory
                    title="Musical Instruments"
                    presets={musicalInstruments}
                    isOpen={true}
                    onToggle={() => {}}
                    onPresetClick={handlePresetClick}
                    isMultiSelect={true}
                    selectedPresets={selectedPresets}
                    colorClass="text-indigo-400"
                  />
                </div>
              )}
            </div>

            {/* Furniture */}
            <div className="pt-4 border-t border-blue-700/30">
              <button
                onClick={() => handleTabToggle('furniture')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Sofa className="h-3 w-3 text-orange-400" />
                  <span className="text-xs font-medium text-orange-400">Furniture</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-orange-400 transition-transform duration-200 ${activeTab === 'furniture' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'furniture' && (
                <div className="mt-2">
                  <PresetCategory
                    title="Furniture"
                    presets={furniture}
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

            {/* Nature */}
            <div className="pt-4 border-t border-blue-700/30">
              <button
                onClick={() => handleTabToggle('nature')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Leaf className="h-3 w-3 text-emerald-400" />
                  <span className="text-xs font-medium text-emerald-400">Nature</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-emerald-400 transition-transform duration-200 ${activeTab === 'nature' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'nature' && (
                <div className="mt-2">
                  <PresetCategory
                    title="Nature"
                    presets={nature}
                    isOpen={true}
                    onToggle={() => {}}
                    onPresetClick={handlePresetClick}
                    isMultiSelect={true}
                    selectedPresets={selectedPresets}
                    colorClass="text-emerald-400"
                  />
                </div>
              )}
            </div>

            {/* Technology */}
            <div className="pt-4 border-t border-blue-700/30">
              <button
                onClick={() => handleTabToggle('technology')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Cpu className="h-3 w-3 text-cyan-400" />
                  <span className="text-xs font-medium text-cyan-400">Technology</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-cyan-400 transition-transform duration-200 ${activeTab === 'technology' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'technology' && (
                <div className="mt-2">
                  <PresetCategory
                    title="Technology"
                    presets={technology}
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
          </div>
        </div>
      )}
    </div>
  );
};

