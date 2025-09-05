
import React from 'react';
import { Slider } from './Slider';
import { CompactToggle } from './CompactToggle';
import { InfoTooltip } from './InfoTooltip';
import type { NsfwSettingsState, NsfwMode } from '../types';

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
        <div className="space-y-3 pt-4 mt-4 border-t border-gray-700">
            <div className="flex items-center gap-2">
                <h4 className="text-xs font-semibold text-gray-500 uppercase">Enhance Options</h4>
                <InfoTooltip text="Control which parts of your description the 'Enhance' button and AI Imagination will modify. If a category is OFF, it will be preserved exactly as you wrote it." />
            </div>
            <CompactToggle 
                label="Person"
                checked={settings.enhancePerson}
                onChange={(checked) => handleToggleChange('enhancePerson', checked)}
            />
            <CompactToggle 
                label="Pose"
                checked={settings.enhancePose}
                onChange={(checked) => handleToggleChange('enhancePose', checked)}
            />
            <CompactToggle 
                label="Location"
                checked={settings.enhanceLocation}
                onChange={(checked) => handleToggleChange('enhanceLocation', checked)}
            />
        </div>
    );

    return (
        <div className="space-y-4 bg-gray-900/50 p-4 rounded-md border border-gray-700">
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <label className="block text-sm font-medium text-gray-400">Content Mode</label>
                    <InfoTooltip text="Safe: No explicit content. NSFW: Adds explicit anatomy. Hardcore: Adds explicit actions and scenarios." />
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

            <div className="pt-4 border-t border-gray-700">
                <CompactToggle
                    label="AI Imagination"
                    checked={settings.aiImagination}
                    onChange={(checked) => handleToggleChange('aiImagination', checked)}
                    tooltip="When ON, the AI has creative freedom to add new ideas, themes, and details beyond your original description, potentially creating surprising results."
                />
            </div>


            {settings.mode === 'nsfw' && (
                <div className="animate-fade-in pt-4 border-t border-gray-700">
                    <Slider 
                        label="NSFW Intensity"
                        value={settings.nsfwLevel}
                        onChange={handleNsfwLevelChange}
                    />
                </div>
            )}
            
            {settings.mode === 'hardcore' && (
                <div className="animate-fade-in pt-4 border-t border-gray-700">
                     <Slider 
                        label="Hardcore Intensity"
                        value={settings.hardcoreLevel}
                        onChange={handleHardcoreLevelChange}
                    />
                </div>
            )}

            {renderEnhanceOptions()}
        </div>
    );
};
