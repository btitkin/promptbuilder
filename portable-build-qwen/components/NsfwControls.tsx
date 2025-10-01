import React, { useState } from 'react';
import { Slider } from './Slider';
import { CompactToggle } from './CompactToggle';
import { InfoTooltip } from './InfoTooltip';
import type { NsfwSettingsState, NsfwMode } from '../types';
import { ChevronDownIcon } from './icons';
import { ShieldAlert } from 'lucide-react';

interface NsfwControlsProps {
    settings: NsfwSettingsState;
    onChange: (settings: NsfwSettingsState) => void;
}

const modes: { id: NsfwMode; label: string }[] = [
    { id: 'off', label: 'Safe' },
    { id: 'nsfw', label: 'NSFW' },
    { id: 'hardcore', label: 'Hardcore' }
];

export const NsfwControls: React.FC<NsfwControlsProps> = ({ settings, onChange }) => {
    const [isCollapsed, setIsCollapsed] = useState(true);

    const handleModeChange = (mode: NsfwMode) => {
        onChange({ ...settings, mode });
    };

    const handleNsfwLevelChange = (level: number) => {
        onChange({ ...settings, nsfwLevel: level });
    };
    
    const handleHardcoreLevelChange = (level: number) => {
        onChange({ ...settings, hardcoreLevel: level });
    };

    const handleToggleChange = (field: keyof NsfwSettingsState, value: boolean) => {
        onChange({ ...settings, [field]: value });
    };

    const renderEnhanceOptions = () => (
        <div className="space-y-3 pt-4 mt-4 border-t border-rose-700/30">
            <div className="flex items-center gap-2">
                <h4 className="text-xs font-semibold text-gray-500 uppercase">Enhance Options</h4>
                <InfoTooltip text="Control which parts of your description the 'Enhance' button will modify. If a category is off, it will be preserved exactly as you wrote it." />
            </div>
            <CompactToggle 
                label="Person"
                checked={settings.enhancePerson}
                onChange={(checked) => handleToggleChange('enhancePerson', checked)}
                tooltip="When ON, the AI can modify and enhance character descriptions, appearance, and attributes."
            />
            <CompactToggle 
                label="Pose"
                checked={settings.enhancePose}
                onChange={(checked) => handleToggleChange('enhancePose', checked)}
                tooltip="When ON, the AI can modify and enhance pose descriptions and body positioning."
            />
            <CompactToggle 
                label="Location"
                checked={settings.enhanceLocation}
                onChange={(checked) => handleToggleChange('enhanceLocation', checked)}
                tooltip="When ON, the AI can modify and enhance location descriptions, settings, and environments."
            />
        </div>
    );

    return (
        <div className="bg-gray-900/50 rounded-md border border-rose-700/50">
            <button 
                onClick={() => setIsCollapsed(prev => !prev)} 
                className="w-full flex justify-between items-center p-4 focus:outline-none"
                aria-expanded={!isCollapsed}
              >
                <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-rose-400" />
                    <h3 className="text-sm font-medium text-rose-400">Content Rules</h3>
                    <InfoTooltip text="Configure content filtering and safety settings for generated images." />
                </div>
                <ChevronDownIcon className={`h-5 w-5 text-rose-400 transition-transform duration-200 ${!isCollapsed ? 'rotate-180' : ''}`} />
            </button>
            {!isCollapsed && (
                 <div className="px-4 pb-4 space-y-4 animate-fade-in">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <label className="block text-sm font-medium text-gray-400">Content Mode</label>
                            <InfoTooltip text="Safe: No explicit content. Nsfw: Adds explicit anatomy. Hardcore: Adds explicit actions and scenarios." />
                        </div>
                        <div className="flex space-x-2 rounded-md bg-gray-700 p-1">
                            {modes.map(mode => (
                                <button
                                    key={mode.id}
                                    onClick={() => handleModeChange(mode.id)}
                                    className={`w-full rounded px-3 py-1 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-gray-800
                                        ${settings.mode === mode.id ? 'bg-accent text-white' : 'text-gray-300 hover:bg-gray-600'}
                                    `}
                                >
                                    {mode.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {settings.mode === 'nsfw' && (
                        <div className="animate-fade-in pt-4 border-t border-rose-700/30">
                            <div className="flex items-center gap-2 mb-2">
                                <label className="block text-sm font-medium text-gray-400">NSFW Intensity</label>
                                <InfoTooltip text="Controls how explicit the nsfw content becomes. Higher values add more explicit details and anatomy." />
                            </div>
                            <Slider 
                                label="NSFW Intensity"
                                value={settings.nsfwLevel}
                                onChange={handleNsfwLevelChange}
                            />
                        </div>
                    )}

                    {settings.mode === 'hardcore' && (
                        <div className="animate-fade-in pt-4 border-t border-rose-700/30">
                            <div className="flex items-center gap-2 mb-2">
                                <label className="block text-sm font-medium text-gray-400">Hardcore Intensity</label>
                                <InfoTooltip text="Controls the intensity of hardcore scenarios and actions. Higher values add more extreme content." />
                            </div>
                            <Slider 
                                label="Hardcore Intensity"
                                value={settings.hardcoreLevel}
                                onChange={handleHardcoreLevelChange}
                            />
                        </div>
                    )}

                    {renderEnhanceOptions()}
                </div>
            )}
        </div>
    );
};