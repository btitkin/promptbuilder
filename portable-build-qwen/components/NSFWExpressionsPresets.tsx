import React, { useState, useEffect } from 'react';
import { PresetCategory } from './PresetCategory';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { RotateCcw, AlertTriangle, Eye, Zap, Shield, Crown, Heart, Users } from 'lucide-react';
import { InfoTooltip } from './InfoTooltip';

interface NSFWExpressionsPresetsProps {
  onAppend: (text: string) => void;
  selectedPresets: string[];
  onSelectedPresetsChange: (presets: string[]) => void;
  isNsfwEnabled?: boolean;
}

const lustfulExpressions = [
  'lustful gaze', 'seductive stare', 'bedroom eyes', 'sultry look',
  'hungry eyes', 'predatory gaze', 'smoldering look', 'intense desire',
  'yearning expression', 'longing stare', 'passionate gaze', 'heated look',
  'provocative expression', 'tempting smile', 'alluring gaze', 'inviting look'
];

const ecstasyExpressions = [
  'ecstatic expression', 'blissful face', 'euphoric look', 'rapturous gaze',
  'overwhelmed expression', 'lost in pleasure', 'transcendent look', 'divine expression',
  'breathless face', 'gasping expression', 'panting look', 'flushed with pleasure',
  'eyes rolling back', 'head thrown back', 'arched back', 'trembling with pleasure'
];

const submissiveExpressions = [
  'submissive gaze', 'obedient look', 'pleading eyes', 'begging expression',
  'vulnerable stare', 'helpless look', 'surrendering gaze', 'yielding expression',
  'docile face', 'compliant look', 'deferential gaze', 'meek expression',
  'worshipful stare', 'adoring gaze', 'devoted look', 'reverent expression'
];

const dominantExpressions = [
  'dominant stare', 'commanding gaze', 'authoritative look', 'controlling expression',
  'predatory smile', 'possessive gaze', 'territorial look', 'claiming stare',
  'intimidating expression', 'powerful gaze', 'assertive look', 'confident dominance',
  'stern expression', 'strict gaze', 'disciplinary look', 'firm stare'
];

const ahegaoExpressions = [
  'ahegao', 'crossed eyes', 'tongue out', 'drooling',
  'rolled back eyes', 'vacant stare', 'mindless expression', 'overwhelmed face',
  'pleasure-drunk look', 'sensory overload', 'blissed out expression', 'lost in sensation',
  'glazed eyes', 'unfocused gaze', 'dazed expression', 'euphoric stupor'
];

const intimateExpressions = [
  'intimate gaze', 'tender passion', 'loving desire', 'gentle lust',
  'soft moaning', 'quiet gasps', 'whispered pleasure', 'breathless whispers',
  'closed eyes bliss', 'peaceful ecstasy', 'serene pleasure', 'tranquil passion',
  'connected souls', 'merged beings', 'unified pleasure', 'shared ecstasy'
];

export const NSFWExpressionsPresets: React.FC<NSFWExpressionsPresetsProps> = ({ 
  onAppend, 
  selectedPresets, 
  onSelectedPresetsChange,
  isNsfwEnabled = false
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

  if (!isNsfwEnabled) {
    return (
      <div className="bg-gray-900/50 rounded-md border border-gray-700 opacity-50">
        <div className="p-4 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <span className="text-sm text-gray-400">NSFW Expressions (Enable NSFW mode to access)</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 rounded-md border border-red-700/50">
      <button 
        onClick={() => setIsCollapsed(prev => !prev)} 
        className="w-full flex justify-between items-center p-4 focus:outline-none"
        aria-expanded={!isCollapsed}
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <h3 className="text-sm font-medium text-red-400">NSFW Expressions <span className="text-xs text-gray-400">(Opt-in)</span></h3>
          {selectedPresets.length > 0 && (
            <span className="text-xs bg-red-600 text-red-100 px-2 py-0.5 rounded-full">
              {selectedPresets.length} selected
            </span>
          )}
          <InfoTooltip text="Adult-oriented expressions for mature content. Only available when NSFW mode is enabled." />
        </div>
        <ChevronDownIcon className={`h-5 w-5 text-red-400 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`} />
      </button>
      
      {!isCollapsed && (
        <div className="px-4 pb-4 space-y-4 animate-fade-in">
          <div className="space-y-3">
            {/* Lustful Expressions */}
            <div className="pt-4 border-t border-red-700/30">
              <button
                onClick={() => handleTabToggle('lustful')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Eye className="h-3 w-3 text-red-400" />
                  <span className="text-xs font-medium text-red-400">Lustful Expressions</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-red-400 transition-transform duration-200 ${activeTab === 'lustful' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'lustful' && (
                <div className="mt-2">
                  <PresetCategory
                     title="Lustful Expressions"
                     presets={lustfulExpressions}
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

            {/* Ecstasy Expressions */}
            <div className="pt-4 border-t border-red-700/30">
              <button
                onClick={() => handleTabToggle('ecstasy')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Zap className="h-3 w-3 text-orange-400" />
                  <span className="text-xs font-medium text-orange-400">Ecstasy Expressions</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-orange-400 transition-transform duration-200 ${activeTab === 'ecstasy' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'ecstasy' && (
                <div className="mt-2">
                  <PresetCategory
                     title="Ecstasy Expressions"
                     presets={ecstasyExpressions}
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

            {/* Submissive Expressions */}
            <div className="pt-4 border-t border-red-700/30">
              <button
                onClick={() => handleTabToggle('submissive')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Shield className="h-3 w-3 text-purple-400" />
                  <span className="text-xs font-medium text-purple-400">Submissive Expressions</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-purple-400 transition-transform duration-200 ${activeTab === 'submissive' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'submissive' && (
                <div className="mt-2">
                  <PresetCategory
                     title="Submissive Expressions"
                     presets={submissiveExpressions}
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

            {/* Dominant Expressions */}
            <div className="pt-4 border-t border-red-700/30">
              <button
                onClick={() => handleTabToggle('dominant')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Crown className="h-3 w-3 text-yellow-400" />
                  <span className="text-xs font-medium text-yellow-400">Dominant Expressions</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-yellow-400 transition-transform duration-200 ${activeTab === 'dominant' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'dominant' && (
                <div className="mt-2">
                  <PresetCategory
                     title="Dominant Expressions"
                     presets={dominantExpressions}
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

            {/* Ahegao Expressions */}
            <div className="pt-4 border-t border-red-700/30">
              <button
                onClick={() => handleTabToggle('ahegao')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Heart className="h-3 w-3 text-pink-400" />
                  <span className="text-xs font-medium text-pink-400">Ahegao Expressions</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-pink-400 transition-transform duration-200 ${activeTab === 'ahegao' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'ahegao' && (
                <div className="mt-2">
                  <PresetCategory
                     title="Ahegao Expressions"
                     presets={ahegaoExpressions}
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

            {/* Intimate Expressions */}
            <div className="pt-4 border-t border-red-700/30">
              <button
                onClick={() => handleTabToggle('intimate')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Users className="h-3 w-3 text-blue-400" />
                  <span className="text-xs font-medium text-blue-400">Intimate Expressions</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-blue-400 transition-transform duration-200 ${activeTab === 'intimate' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'intimate' && (
                <div className="mt-2">
                  <PresetCategory
                     title="Intimate Expressions"
                     presets={intimateExpressions}
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
          </div>
        </div>
      )}
    </div>
  );
};

