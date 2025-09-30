import React, { useState, useEffect } from 'react';
import { PresetCategory } from './PresetCategory';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { RotateCcw, Activity, Eye, Shield, Crown, Flame, Brain, Heart } from 'lucide-react';
import { InfoTooltip } from './InfoTooltip';

interface EmotionalStatesPresetsProps {
  onAppend: (text: string) => void;
  selectedPresets: string[];
  onSelectedPresetsChange: (presets: string[]) => void;
}

const physicalReactions = [
  'blushing', 'red cheeks', 'flushed face', 'rosy cheeks',
  'sweating', 'perspiration', 'glistening skin', 'dewy skin',
  'tears', 'teary eyes', 'crying', 'sobbing',
  'trembling', 'shaking', 'quivering', 'shivering',
  'goosebumps', 'raised hair', 'tense muscles', 'relaxed posture'
];

const eyeExpressions = [
  'wide eyes', 'surprised eyes', 'shocked eyes', 'amazed eyes',
  'narrowed eyes', 'squinting', 'glaring', 'scowling eyes',
  'sleepy eyes', 'drowsy eyes', 'tired eyes', 'heavy eyelids',
  'bright eyes', 'sparkling eyes', 'twinkling eyes', 'gleaming eyes',
  'sad eyes', 'watery eyes', 'puffy eyes', 'red-rimmed eyes',
  'intense gaze', 'piercing stare', 'focused eyes', 'concentrated look'
];

const vulnerableStates = [
  'shy', 'bashful', 'timid', 'hesitant', 'uncertain',
  'nervous', 'anxious', 'worried', 'apprehensive', 'tense',
  'embarrassed', 'ashamed', 'self-conscious', 'awkward',
  'vulnerable', 'fragile', 'delicate', 'sensitive',
  'insecure', 'doubtful', 'questioning', 'unsure'
];

const confidentStates = [
  'confident', 'self-assured', 'bold', 'fearless', 'brave',
  'determined', 'resolute', 'strong-willed', 'decisive',
  'proud', 'dignified', 'regal', 'majestic', 'commanding',
  'assertive', 'dominant', 'powerful', 'authoritative',
  'charismatic', 'magnetic', 'captivating', 'alluring'
];

const passionateStates = [
  'passionate', 'intense', 'fervent', 'ardent', 'zealous',
  'excited', 'enthusiastic', 'energetic', 'vibrant', 'animated',
  'aroused', 'stimulated', 'electrified', 'charged', 'heated',
  'wild', 'untamed', 'primal', 'raw', 'uninhibited',
  'breathless', 'panting', 'gasping', 'sighing', 'moaning'
];

const contemplativeStates = [
  'thoughtful', 'pensive', 'contemplative', 'reflective', 'meditative',
  'dreamy', 'wistful', 'nostalgic', 'melancholic', 'bittersweet',
  'peaceful', 'serene', 'tranquil', 'calm', 'composed',
  'focused', 'concentrated', 'absorbed', 'engrossed', 'immersed',
  'distant', 'faraway', 'lost in thought', 'daydreaming'
];

export const EmotionalStatesPresets: React.FC<EmotionalStatesPresetsProps> = ({ 
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
    <div className="bg-gray-900/50 rounded-md border border-red-700/50">
      <button 
        onClick={() => setIsCollapsed(prev => !prev)} 
        className="w-full flex justify-between items-center p-4 focus:outline-none"
        aria-expanded={!isCollapsed}
      >
        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4 text-red-400" />
          <h3 className="text-sm font-medium text-red-400">Emotional States <span className="text-xs text-gray-400">(Opt-in)</span></h3>
          {selectedPresets.length > 0 && (
            <span className="text-xs bg-red-600 text-red-100 px-2 py-0.5 rounded-full">
              {selectedPresets.length} selected
            </span>
          )}
          <InfoTooltip text="Add emotional depth with physical reactions, eye expressions, and various emotional states from vulnerable to confident." />
        </div>
        <ChevronDownIcon className={`h-5 w-5 text-red-400 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`} />
      </button>
      
      {!isCollapsed && (
        <div className="px-4 pb-4 space-y-4 animate-fade-in">
          <div className="space-y-3">
            {/* Physical Reactions */}
            <div className="pt-4 border-t border-red-700/30">
              <button
                onClick={() => handleTabToggle('physical')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Activity className="h-3 w-3 text-red-400" />
                  <span className="text-xs font-medium text-red-400">Physical Reactions</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-red-400 transition-transform duration-200 ${activeTab === 'physical' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'physical' && (
                <div className="mt-2">
                  <PresetCategory
                    title="Physical Reactions"
                    presets={physicalReactions}
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

            {/* Eye Expressions */}
            <div className="pt-4 border-t border-red-700/30">
              <button
                onClick={() => handleTabToggle('eyes')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Eye className="h-3 w-3 text-blue-400" />
                  <span className="text-xs font-medium text-blue-400">Eye Expressions</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-blue-400 transition-transform duration-200 ${activeTab === 'eyes' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'eyes' && (
                <div className="mt-2">
                  <PresetCategory
                    title="Eye Expressions"
                    presets={eyeExpressions}
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

            {/* Vulnerable States */}
            <div className="pt-4 border-t border-red-700/30">
              <button
                onClick={() => handleTabToggle('vulnerable')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Shield className="h-3 w-3 text-purple-400" />
                  <span className="text-xs font-medium text-purple-400">Vulnerable States</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-purple-400 transition-transform duration-200 ${activeTab === 'vulnerable' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'vulnerable' && (
                <div className="mt-2">
                  <PresetCategory
                    title="Vulnerable States"
                    presets={vulnerableStates}
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

            {/* Confident States */}
            <div className="pt-4 border-t border-red-700/30">
              <button
                onClick={() => handleTabToggle('confident')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Crown className="h-3 w-3 text-yellow-400" />
                  <span className="text-xs font-medium text-yellow-400">Confident States</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-yellow-400 transition-transform duration-200 ${activeTab === 'confident' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'confident' && (
                <div className="mt-2">
                  <PresetCategory
                    title="Confident States"
                    presets={confidentStates}
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

            {/* Passionate States */}
            <div className="pt-4 border-t border-red-700/30">
              <button
                onClick={() => handleTabToggle('passionate')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Flame className="h-3 w-3 text-orange-400" />
                  <span className="text-xs font-medium text-orange-400">Passionate States</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-orange-400 transition-transform duration-200 ${activeTab === 'passionate' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'passionate' && (
                <div className="mt-2">
                  <PresetCategory
                    title="Passionate States"
                    presets={passionateStates}
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

            {/* Contemplative States */}
            <div className="pt-4 border-t border-red-700/30">
              <button
                onClick={() => handleTabToggle('contemplative')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Brain className="h-3 w-3 text-green-400" />
                  <span className="text-xs font-medium text-green-400">Contemplative States</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-green-400 transition-transform duration-200 ${activeTab === 'contemplative' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'contemplative' && (
                <div className="mt-2">
                  <PresetCategory
                    title="Contemplative States"
                    presets={contemplativeStates}
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

