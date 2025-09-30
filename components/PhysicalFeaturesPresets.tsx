import React, { useState, useEffect } from 'react';
import { PresetCategory } from './PresetCategory';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { RotateCcw, Sparkles, Palette, Zap, Dumbbell, Eye, Scissors, User } from 'lucide-react';
import { InfoTooltip } from './InfoTooltip';

interface PhysicalFeaturesPresetsProps {
  onAppend: (text: string) => void;
  selectedPresets: string[];
  onSelectedPresetsChange: (presets: string[]) => void;
}

const skinFeatures = [
  'freckles', 'beauty mark', 'mole', 'dimples', 'smooth skin', 'rough skin',
  'pale skin', 'tan skin', 'dark skin', 'olive skin', 'fair skin', 'sun-kissed skin',
  'glowing skin', 'oily skin', 'dry skin', 'blemished skin', 'perfect skin',
  'wrinkles', 'laugh lines', 'crow\'s feet', 'age spots', 'birthmark',
  'scar', 'stretch marks', 'cellulite', 'goosebumps', 'flushed skin'
];

const bodyMarkings = [
  'tattoo', 'small tattoo', 'large tattoo', 'sleeve tattoo', 'back tattoo',
  'chest tattoo', 'leg tattoo', 'arm tattoo', 'neck tattoo', 'face tattoo',
  'tribal tattoo', 'floral tattoo', 'geometric tattoo', 'text tattoo',
  'colorful tattoo', 'black tattoo', 'temporary tattoo', 'henna tattoo'
];

const piercings = [
  'ear piercing', 'nose piercing', 'lip piercing', 'eyebrow piercing',
  'tongue piercing', 'belly button piercing', 'nipple piercing',
  'multiple ear piercings', 'gauge earrings', 'septum piercing',
  'nostril piercing', 'labret piercing', 'monroe piercing',
  'industrial piercing', 'helix piercing', 'tragus piercing'
];

const muscleDefinition = [
  'toned', 'athletic', 'muscular', 'ripped', 'buff', 'lean muscle',
  'defined abs', 'six pack abs', 'eight pack abs', 'flat stomach',
  'soft belly', 'chubby', 'beer belly', 'pot belly', 'love handles',
  'defined arms', 'muscular arms', 'toned legs', 'muscular legs',
  'defined shoulders', 'broad shoulders', 'narrow shoulders',
  'muscular back', 'defined chest', 'pecs', 'biceps', 'triceps'
];

const physicalDetails = [
  'veins', 'visible veins', 'bulging veins', 'muscle striations',
  'defined jawline', 'sharp jawline', 'soft jawline', 'double chin',
  'high cheekbones', 'hollow cheeks', 'chubby cheeks', 'rosy cheeks',
  'long neck', 'thick neck', 'swan neck', 'collar bones',
  'prominent collar bones', 'shoulder blades', 'spine',
  'hip bones', 'defined waist', 'narrow waist', 'wide hips'
];

const bodyHair = [
  'body hair', 'chest hair', 'arm hair', 'leg hair', 'pubic hair',
  'armpit hair', 'back hair', 'stomach hair', 'happy trail',
  'smooth body', 'hairless', 'trimmed body hair', 'natural body hair',
  'thick body hair', 'sparse body hair', 'blonde body hair',
  'dark body hair', 'gray body hair'
];

export const PhysicalFeaturesPresets: React.FC<PhysicalFeaturesPresetsProps> = ({ 
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
    <div className="bg-gray-900/50 rounded-md border border-lime-700/50">
      <button 
        onClick={() => setIsCollapsed(prev => !prev)} 
        className="w-full flex justify-between items-center p-4 focus:outline-none"
        aria-expanded={!isCollapsed}
      >
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-lime-400" />
          <h3 className="text-sm font-medium text-lime-400">Physical Features</h3>
          {selectedPresets.length > 0 && (
            <span className="text-xs bg-lime-600 text-lime-100 px-2 py-0.5 rounded-full">
              {selectedPresets.length} selected
            </span>
          )}
          <InfoTooltip text="Add detailed physical characteristics including skin features, body markings, piercings, muscle definition, and body hair." />
        </div>
        <ChevronDownIcon className={`h-5 w-5 text-lime-400 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`} />
      </button>
      
      {!isCollapsed && (
        <div className="px-4 pb-4 space-y-4 animate-fade-in">
          <div className="space-y-3">
            {/* Skin Features */}
            <div className="pt-4 border-t border-lime-700/30">
              <button
                onClick={() => handleTabToggle('skin')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3 w-3 text-pink-400" />
                  <span className="text-xs font-medium text-pink-400">Skin Features</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-pink-400 transition-transform duration-200 ${activeTab === 'skin' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'skin' && (
                <div className="mt-2">
                  <PresetCategory
                     title="Skin Features"
                     presets={skinFeatures}
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

            {/* Body Markings */}
            <div className="pt-4 border-t border-lime-700/30">
              <button
                onClick={() => handleTabToggle('markings')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Palette className="h-3 w-3 text-purple-400" />
                  <span className="text-xs font-medium text-purple-400">Tattoos & Markings</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-purple-400 transition-transform duration-200 ${activeTab === 'markings' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'markings' && (
                <div className="mt-2">
                  <PresetCategory
                    title="Tattoos & Markings"
                    presets={bodyMarkings}
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

            {/* Piercings */}
            <div className="pt-4 border-t border-lime-700/30">
              <button
                onClick={() => handleTabToggle('piercings')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Zap className="h-3 w-3 text-yellow-400" />
                  <span className="text-xs font-medium text-yellow-400">Piercings</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-yellow-400 transition-transform duration-200 ${activeTab === 'piercings' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'piercings' && (
                <div className="mt-2">
                  <PresetCategory
                    title="Piercings"
                    presets={piercings}
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

            {/* Muscle Definition */}
            <div className="pt-4 border-t border-lime-700/30">
              <button
                onClick={() => handleTabToggle('muscle')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Dumbbell className="h-3 w-3 text-red-400" />
                  <span className="text-xs font-medium text-red-400">Muscle Definition</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-red-400 transition-transform duration-200 ${activeTab === 'muscle' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'muscle' && (
                <div className="mt-2">
                  <PresetCategory
                    title="Muscle Definition"
                    presets={muscleDefinition}
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

            {/* Physical Details */}
            <div className="pt-4 border-t border-lime-700/30">
              <button
                onClick={() => handleTabToggle('details')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Eye className="h-3 w-3 text-blue-400" />
                  <span className="text-xs font-medium text-blue-400">Physical Details</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-blue-400 transition-transform duration-200 ${activeTab === 'details' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'details' && (
                <div className="mt-2">
                  <PresetCategory
                    title="Physical Details"
                    presets={physicalDetails}
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

            {/* Body Hair */}
            <div className="pt-4 border-t border-lime-700/30">
              <button
                onClick={() => handleTabToggle('bodyhair')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Scissors className="h-3 w-3 text-green-400" />
                  <span className="text-xs font-medium text-green-400">Body Hair</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-green-400 transition-transform duration-200 ${activeTab === 'bodyhair' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'bodyhair' && (
                <div className="mt-2">
                  <PresetCategory
                     title="Body Hair"
                     presets={bodyHair}
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
          </div>
        </div>
      )}
    </div>
  );
};

