import React, { useState, useEffect } from 'react';
import { PresetCategory } from './PresetCategory';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { RotateCcw, Clock, Sunrise, Sun, Sunset, Moon, Cloud } from 'lucide-react';
import { InfoTooltip } from './InfoTooltip';

interface TimeOfDayPresetsProps {
  onAppend: (text: string) => void;
  selectedPresets: string[];
  onSelectedPresetsChange: (presets: string[]) => void;
}

const morningTimes = [
  'sunrise', 'dawn', 'early morning', 'morning light',
  'golden hour morning', 'soft morning light', 'morning glow',
  'first light', 'daybreak', 'morning mist', 'morning dew'
];

const dayTimes = [
  'midday', 'noon', 'bright daylight', 'harsh sunlight',
  'overcast day', 'cloudy day', 'sunny day', 'clear sky',
  'afternoon', 'late afternoon', 'warm daylight'
];

const eveningTimes = [
  'sunset', 'dusk', 'twilight', 'evening light',
  'golden hour', 'magic hour', 'warm evening glow',
  'orange sunset', 'pink sunset', 'purple twilight'
];

const nightTimes = [
  'night', 'midnight', 'late night', 'deep night',
  'moonlight', 'starlight', 'moonlit night', 'starry night',
  'blue hour', 'night sky', 'dark night', 'pitch black'
];

const specialTimes = [
  'storm', 'lightning', 'thunder', 'rain',
  'snow', 'blizzard', 'fog', 'mist',
  'eclipse', 'aurora', 'northern lights', 'meteor shower'
];

export const TimeOfDayPresets: React.FC<TimeOfDayPresetsProps> = ({ 
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
    <div className="bg-gray-900/50 rounded-md border border-orange-700/50">
      <button 
        onClick={() => setIsCollapsed(prev => !prev)} 
        className="w-full flex justify-between items-center p-4 focus:outline-none"
        aria-expanded={!isCollapsed}
      >
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-orange-500" />
          <h3 className="text-sm font-medium text-orange-400">Time of Day</h3>
          {selectedPresets.length > 0 && (
            <span className="text-xs bg-orange-600 text-orange-100 px-2 py-0.5 rounded-full">
              {selectedPresets.length} selected
            </span>
          )}
          <InfoTooltip text="Set the time and atmospheric conditions to create the perfect lighting and mood for your scene." />
        </div>
        <ChevronDownIcon className={`h-5 w-5 text-orange-400 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`} />
      </button>
      
      {!isCollapsed && (
        <div className="px-4 pb-4 space-y-4 animate-fade-in">
          <div className="space-y-3">
            {/* Morning */}
            <div className="pt-4 border-t border-orange-700/30">
              <button
                onClick={() => handleTabToggle('morning')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Sunrise className="h-3 w-3 text-yellow-400" />
                  <span className="text-xs font-medium text-yellow-400">Morning</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-yellow-400 transition-transform duration-200 ${activeTab === 'morning' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'morning' && (
                <div className="mt-2">
                  <PresetCategory
                    title="Morning"
                    presets={morningTimes}
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

            {/* Day */}
            <div className="pt-4 border-t border-orange-700/30">
              <button
                onClick={() => handleTabToggle('day')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Sun className="h-3 w-3 text-orange-400" />
                  <span className="text-xs font-medium text-orange-400">Day</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-orange-400 transition-transform duration-200 ${activeTab === 'day' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'day' && (
                <div className="mt-2">
                  <PresetCategory
                     title="Day"
                     presets={dayTimes}
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

            {/* Evening */}
            <div className="pt-4 border-t border-orange-700/30">
              <button
                onClick={() => handleTabToggle('evening')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Sunset className="h-3 w-3 text-red-400" />
                  <span className="text-xs font-medium text-red-400">Evening</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-red-400 transition-transform duration-200 ${activeTab === 'evening' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'evening' && (
                <div className="mt-2">
                  <PresetCategory
                     title="Evening"
                     presets={eveningTimes}
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

            {/* Night */}
            <div className="pt-4 border-t border-orange-700/30">
              <button
                onClick={() => handleTabToggle('night')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Moon className="h-3 w-3 text-blue-400" />
                  <span className="text-xs font-medium text-blue-400">Night</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-blue-400 transition-transform duration-200 ${activeTab === 'night' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'night' && (
                <div className="mt-2">
                  <PresetCategory
                     title="Night"
                     presets={nightTimes}
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

            {/* Special Weather */}
            <div className="pt-4 border-t border-orange-700/30">
              <button
                onClick={() => handleTabToggle('special')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Cloud className="h-3 w-3 text-gray-400" />
                  <span className="text-xs font-medium text-gray-400">Special Weather</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${activeTab === 'special' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'special' && (
                <div className="mt-2">
                  <PresetCategory
                    title="Special Weather"
                    presets={specialTimes}
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

