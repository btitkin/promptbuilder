import React, { useState, useEffect } from 'react';
import { PresetCategory } from './PresetCategory';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { RotateCcw, Smile, Sun, Heart, Frown, Zap, Eye } from 'lucide-react';
import { InfoTooltip } from './InfoTooltip';

interface FacialExpressionsPresetsProps {
  onAppend: (text: string) => void;
  selectedPresets: string[];
  onSelectedPresetsChange: (presets: string[]) => void;
}

const basicExpressions = [
  'smile', 'grin', 'smirk', 'laugh', 'giggle', 'chuckle',
  'frown', 'scowl', 'pout', 'grimace', 'wince',
  'neutral expression', 'blank expression', 'stoic expression',
  'serious expression', 'stern expression', 'focused expression'
];

const positiveExpressions = [
  'happy smile', 'bright smile', 'warm smile', 'gentle smile',
  'playful smile', 'mischievous smile', 'coy smile', 'shy smile',
  'confident smile', 'radiant smile', 'beaming smile',
  'joyful expression', 'cheerful expression', 'content expression',
  'peaceful expression', 'serene expression', 'blissful expression'
];

const seductiveExpressions = [
  'seductive smile', 'sultry smile', 'alluring smile', 'flirtatious smile',
  'bedroom eyes', 'come-hither look', 'smoldering gaze', 'intense stare',
  'half-lidded eyes', 'sultry expression', 'provocative look',
  'tempting smile', 'inviting expression', 'captivating gaze',
  'mysterious smile', 'enigmatic expression'
];

const emotionalExpressions = [
  'sad expression', 'melancholy look', 'wistful expression',
  'angry expression', 'furious look', 'irritated expression',
  'surprised expression', 'shocked look', 'amazed expression',
  'confused expression', 'puzzled look', 'perplexed expression',
  'worried expression', 'anxious look', 'concerned expression',
  'fearful expression', 'scared look', 'terrified expression'
];

const intensiveExpressions = [
  'intense gaze', 'piercing stare', 'burning gaze', 'fiery look',
  'cold stare', 'icy gaze', 'steely expression', 'hard look',
  'determined expression', 'resolute look', 'fierce expression',
  'passionate expression', 'wild look', 'untamed expression',
  'primal expression', 'raw emotion', 'unbridled passion'
];

const subtleExpressions = [
  'subtle smile', 'hint of a smile', 'barely there smile',
  'raised eyebrow', 'arched eyebrow', 'questioning look',
  'sideways glance', 'sidelong look', 'peripheral gaze',
  'downcast eyes', 'lowered gaze', 'averted eyes',
  'thoughtful expression', 'contemplative look', 'pensive expression',
  'dreamy expression', 'distant look', 'faraway gaze'
];

export const FacialExpressionsPresets: React.FC<FacialExpressionsPresetsProps> = ({ 
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
    <div className="bg-gray-900/50 rounded-md border border-yellow-700/50">
      <button 
        onClick={() => setIsCollapsed(prev => !prev)} 
        className="w-full flex justify-between items-center p-4 focus:outline-none"
        aria-expanded={!isCollapsed}
      >
        <div className="flex items-center gap-2">
          <Smile className="h-4 w-4 text-yellow-400" />
          <h3 className="text-sm font-medium text-yellow-400">Facial Expressions</h3>
          {selectedPresets.length > 0 && (
            <span className="text-xs bg-yellow-600 text-yellow-100 px-2 py-0.5 rounded-full">
              {selectedPresets.length} selected
            </span>
          )}
          <InfoTooltip text="Choose from a wide range of facial expressions to convey emotion and personality in your character." />
        </div>
        <ChevronDownIcon className={`h-5 w-5 text-yellow-400 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`} />
      </button>
      
      {!isCollapsed && (
        <div className="px-4 pb-4 space-y-4 animate-fade-in">
          <div className="space-y-3">
            {/* Basic Expressions */}
            <div className="pt-4 border-t border-yellow-700/30">
              <button
                onClick={() => handleTabToggle('basic')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Smile className="h-3 w-3 text-blue-400" />
                  <span className="text-xs font-medium text-blue-400">Basic Expressions</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-blue-400 transition-transform duration-200 ${activeTab === 'basic' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'basic' && (
                <div className="mt-2">
                  <PresetCategory
                     title="Basic Expressions"
                     presets={basicExpressions}
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

            {/* Positive Expressions */}
            <div className="pt-4 border-t border-yellow-700/30">
              <button
                onClick={() => handleTabToggle('positive')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Sun className="h-3 w-3 text-yellow-400" />
                  <span className="text-xs font-medium text-yellow-400">Positive Expressions</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-yellow-400 transition-transform duration-200 ${activeTab === 'positive' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'positive' && (
                <div className="mt-2">
                  <PresetCategory
                    title="Positive Expressions"
                    presets={positiveExpressions}
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

            {/* Seductive Expressions */}
            <div className="pt-4 border-t border-yellow-700/30">
              <button
                onClick={() => handleTabToggle('seductive')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Heart className="h-3 w-3 text-pink-400" />
                  <span className="text-xs font-medium text-pink-400">Seductive Expressions</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-pink-400 transition-transform duration-200 ${activeTab === 'seductive' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'seductive' && (
                <div className="mt-2">
                  <PresetCategory
                    title="Seductive Expressions"
                    presets={seductiveExpressions}
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

            {/* Emotional Expressions */}
            <div className="pt-4 border-t border-yellow-700/30">
              <button
                onClick={() => handleTabToggle('emotional')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Frown className="h-3 w-3 text-red-400" />
                  <span className="text-xs font-medium text-red-400">Emotional Expressions</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-red-400 transition-transform duration-200 ${activeTab === 'emotional' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'emotional' && (
                <div className="mt-2">
                  <PresetCategory
                     title="Emotional Expressions"
                     presets={emotionalExpressions}
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

            {/* Intensive Expressions */}
            <div className="pt-4 border-t border-yellow-700/30">
              <button
                onClick={() => handleTabToggle('intensive')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Zap className="h-3 w-3 text-orange-400" />
                  <span className="text-xs font-medium text-orange-400">Intensive Expressions</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-orange-400 transition-transform duration-200 ${activeTab === 'intensive' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'intensive' && (
                <div className="mt-2">
                  <PresetCategory
                    title="Intensive Expressions"
                    presets={intensiveExpressions}
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

            {/* Subtle Expressions */}
            <div className="pt-4 border-t border-yellow-700/30">
              <button
                onClick={() => handleTabToggle('subtle')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Eye className="h-3 w-3 text-gray-400" />
                  <span className="text-xs font-medium text-gray-400">Subtle Expressions</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${activeTab === 'subtle' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'subtle' && (
                <div className="mt-2">
                  <PresetCategory
                     title="Subtle Expressions"
                     presets={subtleExpressions}
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
          </div>
        </div>
      )}
    </div>
  );
};

