import React, { useState, useEffect } from 'react';
import { PresetCategory } from './PresetCategory';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { RotateCcw, ShieldAlert, Heart, Zap, Shield, Shirt, Wine } from 'lucide-react';
import { InfoTooltip } from './InfoTooltip';

interface NSFWPropsPresetsProps {
  onAppend: (text: string) => void;
  selectedPresets: string[];
  onSelectedPresetsChange: (presets: string[]) => void;
  isNsfwEnabled: boolean;
}

const intimateAccessories = [
  'silk ribbons', 'satin blindfold', 'feathers', 'rose petals',
  'candles', 'massage oil', 'silk sheets', 'velvet cushions',
  'champagne glass', 'strawberries', 'chocolate', 'pearls'
];

const adultToys = [
  'adult toy', 'intimate accessory', 'pleasure device', 'personal massager',
  'vibrating toy', 'couples toy', 'intimate gadget', 'bedroom accessory',
  'sensual toy', 'adult novelty', 'intimate product', 'pleasure item'
];

const fetishGear = [
  'leather collar', 'chain leash', 'handcuffs', 'rope bondage',
  'leather harness', 'ball gag', 'blindfold', 'whip',
  'paddle', 'flogger', 'restraints', 'leather mask'
];

const lingerieProps = [
  'garter belt', 'stockings', 'thigh highs', 'corset strings',
  'lace panties', 'silk bra', 'negligee', 'babydoll',
  'teddy', 'chemise', 'bustier', 'camisole'
];

const seductiveItems = [
  'wine bottle', 'champagne', 'red wine glass', 'cocktail',
  'cigarette', 'cigar', 'hookah', 'pipe',
  'perfume bottle', 'lipstick', 'compact mirror', 'jewelry box'
];

export const NSFWPropsPresets: React.FC<NSFWPropsPresetsProps> = ({ 
  onAppend, 
  selectedPresets, 
  onSelectedPresetsChange,
  isNsfwEnabled 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isClient, setIsClient] = useState(false);

  const [activeTab, setActiveTab] = useState<string | null>(null);


  if (!isNsfwEnabled) {
    return null;
  }

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
    <div className="bg-gray-900/50 rounded-md border border-red-700/50">
      <button 
        onClick={() => setIsCollapsed(prev => !prev)} 
        className="w-full flex justify-between items-center p-4 focus:outline-none"
        aria-expanded={!isCollapsed}
      >
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-red-400" />
          <h3 className="text-sm font-medium text-red-400">NSFW Props <span className="text-xs text-gray-400">(Opt-in)</span></h3>
          {selectedPresets.length > 0 && (
            <span className="text-xs bg-red-600 text-red-100 px-2 py-0.5 rounded-full">
              {selectedPresets.length} selected
            </span>
          )}
          <InfoTooltip text="Adult-oriented props and accessories for mature content. Age-gated content." />
        </div>
        <ChevronDownIcon className={`h-5 w-5 text-red-400 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`} />
      </button>
      
      {!isCollapsed && (
        <div className="px-4 pb-4 space-y-4 animate-fade-in">
          <div className="bg-red-900/20 border border-red-700/30 rounded-md p-3">
            <p className="text-xs text-red-300">
              ⚠️ Adult Content: These props are intended for mature audiences only (18+)
            </p>
          </div>

          <div className="space-y-3">
            {/* Intimate Accessories */}
            <div className="pt-4 border-t border-red-700/30">
              <button
                onClick={() => handleTabToggle('intimate')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Heart className="h-3 w-3 text-pink-400" />
                  <span className="text-xs font-medium text-pink-400">Intimate Accessories</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-pink-400 transition-transform duration-200 ${activeTab === 'intimate' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'intimate' && (
                <div className="mt-2">
                  <PresetCategory
                    title="Intimate Accessories"
                    presets={intimateAccessories}
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

            {/* Adult Toys */}
            <div className="pt-4 border-t border-red-700/30">
              <button
                onClick={() => handleTabToggle('toys')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Zap className="h-3 w-3 text-purple-400" />
                  <span className="text-xs font-medium text-purple-400">Adult Toys</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-purple-400 transition-transform duration-200 ${activeTab === 'toys' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'toys' && (
                <div className="mt-2">
                  <PresetCategory
                    title="Adult Toys"
                    presets={adultToys}
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

            {/* Fetish Gear */}
            <div className="pt-4 border-t border-red-700/30">
              <button
                onClick={() => handleTabToggle('fetish')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Shield className="h-3 w-3 text-red-400" />
                  <span className="text-xs font-medium text-red-400">Fetish Gear</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-red-400 transition-transform duration-200 ${activeTab === 'fetish' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'fetish' && (
                <div className="mt-2">
                  <PresetCategory
                    title="Fetish Gear"
                    presets={fetishGear}
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

            {/* Lingerie Props */}
            <div className="pt-4 border-t border-red-700/30">
              <button
                onClick={() => handleTabToggle('lingerie')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Shirt className="h-3 w-3 text-blue-400" />
                  <span className="text-xs font-medium text-blue-400">Lingerie Props</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-blue-400 transition-transform duration-200 ${activeTab === 'lingerie' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'lingerie' && (
                <div className="mt-2">
                  <PresetCategory
                    title="Lingerie Props"
                    presets={lingerieProps}
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

            {/* Seductive Items */}
            <div className="pt-4 border-t border-red-700/30">
              <button
                onClick={() => handleTabToggle('seductive')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Wine className="h-3 w-3 text-orange-400" />
                  <span className="text-xs font-medium text-orange-400">Seductive Items</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-orange-400 transition-transform duration-200 ${activeTab === 'seductive' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'seductive' && (
                <div className="mt-2">
                  <PresetCategory
                    title="Seductive Items"
                    presets={seductiveItems}
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
          </div>
        </div>
      )}
    </div>
  );
};

