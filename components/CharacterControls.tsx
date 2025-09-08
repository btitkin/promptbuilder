

import React, { useState } from 'react';
import { InfoTooltip } from './InfoTooltip';
import type { CharacterSettingsState, Gender, AgeRange, FemaleBodyType, MaleBodyType, Ethnicity, HeightRange, BreastSize, HipsSize, ButtSize, PenisSize, MuscleDefinition, FacialHair } from '../types';
import { ChevronDownIcon } from './icons';

interface CharacterControlsProps {
    settings: CharacterSettingsState;
    onChange: (settings: CharacterSettingsState) => void;
}

const genders: { id: Gender; label: string }[] = [ { id: 'any', label: 'Any' }, { id: 'female', label: 'Female' }, { id: 'male', label: 'Male' }, { id: 'mixed', label: 'Mixed' }];
const ageRanges: { id: AgeRange; label: string }[] = [ { id: 'any', label: 'Any' }, { id: '18s', label: '18s' }, { id: '25s', label: '25s' }, { id: '30s', label: '30s' }, { id: '40s', label: '40s' }, { id: '50s', label: '50s' }, { id: '60s', label: '60s' }, { id: '70+', label: '70+' }];
const femaleBodyTypes: { id: FemaleBodyType | 'any'; label: string }[] = [ { id: 'any', label: 'Any' }, { id: 'slim', label: 'Slim' }, { id: 'curvy', label: 'Curvy' }, { id: 'athletic', label: 'Athletic' }, { id: 'instagram model', label: 'Insta Model' }];
const maleBodyTypes: { id: MaleBodyType | 'any'; label: string }[] = [ { id: 'any', label: 'Any' }, { id: 'slim', label: 'Slim' }, { id: 'fat', label: 'Fat' }, { id: 'muscular', label: 'Muscular' }, { id: 'big muscular', label: 'Big Muscular' }];
const ethnicities: { id: Ethnicity; label: string }[] = [ { id: 'any', label: 'Any' }, { id: 'caucasian', label: 'Caucasian' }, { id: 'european', label: 'European' }, { id: 'scandinavian', label: 'Scandinavian' }, { id: 'slavic', label: 'Slavic' }, { id: 'mediterranean', label: 'Mediterranean' }, { id: 'asian', label: 'Asian' }, { id: 'japanese', label: 'Japanese' }, { id: 'chinese', label: 'Chinese' }, { id: 'korean', label: 'Korean' }, { id: 'indian', label: 'Indian' }, { id: 'african', label: 'African' }, { id: 'hispanic', label: 'Hispanic' }, { id: 'middle eastern', label: 'M. Eastern' }, { id: 'native american', label: 'N. American' }];
const heights: { id: HeightRange; label: string }[] = [ { id: 'any', label: 'Any' }, { id: 'very short (<150cm)', label: 'Very Short' }, { id: 'short (150-165cm)', label: 'Short' }, { id: 'average (165-180cm)', label: 'Average' }, { id: 'tall (>180cm)', label: 'Tall' }];
const breastSizes: { id: BreastSize; label: string }[] = [ { id: 'any', label: 'Any' }, { id: 'flat', label: 'Flat' }, { id: 'small', label: 'Small' }, { id: 'medium', label: 'Medium' }, { id: 'large', label: 'Large' }, { id: 'huge', label: 'Huge' }, { id: 'gigantic', label: 'Gigantic' }];
const hipsSizes: { id: HipsSize; label: string }[] = [ { id: 'any', label: 'Any' }, { id: 'narrow', label: 'Narrow' }, { id: 'average', label: 'Average' }, { id: 'wide', label: 'Wide' }, { id: 'extra wide', label: 'Extra Wide' }];
const buttSizes: { id: ButtSize; label: string }[] = [ { id: 'any', label: 'Any' }, { id: 'flat', label: 'Flat' }, { id: 'small', label: 'Small' }, { id: 'average', label: 'Average' }, { id: 'large', label: 'Large' }, { id: 'bubble', label: 'Bubble' }];
const muscleDefinitions: { id: MuscleDefinition; label: string }[] = [ { id: 'any', label: 'Any' }, { id: 'soft', label: 'Soft' }, { id: 'toned', label: 'Toned' }, { id: 'defined', label: 'Defined' }, { id: 'ripped', label: 'Ripped' }, { id: 'bodybuilder', label: 'Bodybuilder' }];
const facialHairs: { id: FacialHair; label: string }[] = [ { id: 'any', label: 'Any' }, { id: 'clean-shaven', label: 'Shaven' }, { id: 'stubble', label: 'Stubble' }, { id: 'goatee', label: 'Goatee' }, { id: 'mustache', label: 'Mustache' }, { id: 'full beard', label: 'Full Beard' }];
const penisSizes: { id: PenisSize; label: string }[] = [ { id: 'any', label: 'Any' }, { id: 'small', label: 'Small' }, { id: 'average', label: 'Average' }, { id: 'large', label: 'Large' }, { id: 'huge', label: 'Huge' }, { id: 'horse-hung', label: 'Horse-hung' }];

interface AttributeSelectorProps<T extends string> {
    label: string;
    options: { id: T | 'any'; label: string }[];
    value: T | 'any';
    onChange: (value: T | 'any') => void;
    gridCols?: string;
}

const AttributeSelector = <T extends string>({ label, options, value, onChange, gridCols = 'grid-cols-4' }: AttributeSelectorProps<T>) => (
    <div>
        <label className="block text-xs font-medium text-gray-400 mb-2">{label}</label>
        <div className={`grid ${gridCols} gap-2 rounded-md bg-gray-700 p-1`}>
            {options.map(option => (
                <button
                    key={option.id}
                    onClick={() => onChange(option.id)}
                    className={`w-full rounded capitalize px-2 py-1 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-gray-800
                        ${value === option.id ? 'bg-accent text-white' : 'text-gray-300 hover:bg-gray-600'}
                    `}
                >
                    {option.label}
                </button>
            ))}
        </div>
    </div>
);

export const CharacterControls: React.FC<CharacterControlsProps> = ({ settings, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleGenderChange = (gender: Gender) => {
        onChange({
            ...settings,
            gender,
            bodyType: 'any',
            breastSize: 'any',
            hipsSize: 'any',
            buttSize: 'any',
            penisSize: 'any',
            muscleDefinition: 'any',
            facialHair: 'any',
        });
    };
    
    const handleChange = (field: keyof CharacterSettingsState, value: any) => {
        onChange({ ...settings, [field]: value });
    };

    const renderBodyTypeSelector = () => {
        if (settings.gender !== 'female' && settings.gender !== 'male') return null;
        const options = settings.gender === 'female' ? femaleBodyTypes : maleBodyTypes;
        return (
            <AttributeSelector
                label="Body Type"
                options={options}
                value={settings.bodyType}
                onChange={value => handleChange('bodyType', value)}
                gridCols="grid-cols-3 sm:grid-cols-5"
            />
        );
    };

    return (
        <div className="bg-gray-900/50 rounded-md border border-gray-700">
            <button 
                onClick={() => setIsOpen(prev => !prev)} 
                className="w-full flex justify-between items-center p-4 focus:outline-none"
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-gray-400">Character Settings</h3>
                    <InfoTooltip text="Specify detailed physical attributes for the primary subject. 'Any' gives the AI creative freedom." />
                </div>
                <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="px-4 pb-4 space-y-4 animate-fade-in">
                    <AttributeSelector label="Gender" options={genders} value={settings.gender} onChange={handleGenderChange} gridCols="grid-cols-2 sm:grid-cols-4"/>
                    
                    <div className="pt-4 border-t border-gray-700">
                        <AttributeSelector label="Age Range" options={ageRanges} value={settings.age} onChange={value => handleChange('age', value)} gridCols="grid-cols-4" />
                    </div>

                    <div className="pt-4 border-t border-gray-700">
                         <AttributeSelector label="Ethnicity" options={ethnicities} value={settings.ethnicity} onChange={value => handleChange('ethnicity', value)} gridCols="grid-cols-3 sm:grid-cols-5" />
                    </div>

                     <div className="pt-4 border-t border-gray-700">
                         <AttributeSelector label="Height" options={heights} value={settings.height} onChange={value => handleChange('height', value)} gridCols="grid-cols-3 sm:grid-cols-5" />
                    </div>
                    
                    <div className="pt-4 border-t border-gray-700">{renderBodyTypeSelector()}</div>

                    {settings.gender === 'female' && (
                        <div className="pt-4 border-t border-gray-700 space-y-4 animate-fade-in">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase">Female Attributes</h4>
                            <AttributeSelector label="Breast Size" options={breastSizes} value={settings.breastSize} onChange={v => handleChange('breastSize', v)} gridCols="grid-cols-3 sm:grid-cols-4" />
                            <AttributeSelector label="Hips Size" options={hipsSizes} value={settings.hipsSize} onChange={v => handleChange('hipsSize', v)} gridCols="grid-cols-3 sm:grid-cols-5" />
                            <AttributeSelector label="Butt Size" options={buttSizes} value={settings.buttSize} onChange={v => handleChange('buttSize', v)} gridCols="grid-cols-3 sm:grid-cols-4" />
                        </div>
                    )}

                    {settings.gender === 'male' && (
                        <div className="pt-4 border-t border-gray-700 space-y-4 animate-fade-in">
                             <h4 className="text-xs font-semibold text-gray-500 uppercase">Male Attributes</h4>
                             <AttributeSelector label="Muscle Definition" options={muscleDefinitions} value={settings.muscleDefinition} onChange={v => handleChange('muscleDefinition', v)} gridCols="grid-cols-3 sm:grid-cols-4" />
                             <AttributeSelector label="Facial Hair" options={facialHairs} value={settings.facialHair} onChange={v => handleChange('facialHair', v)} gridCols="grid-cols-3 sm:grid-cols-4" />
                             <AttributeSelector label="Penis Size" options={penisSizes} value={settings.penisSize} onChange={v => handleChange('penisSize', v)} gridCols="grid-cols-3 sm:grid-cols-4" />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};