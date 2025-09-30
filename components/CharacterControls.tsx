

import React, { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { Settings } from 'lucide-react';
import { InfoTooltip } from './InfoTooltip';
import type { CharacterSettingsState, SceneType, Gender, AgeRange, FemaleBodyType, MaleBodyType, Ethnicity, HeightRange, BreastSize, HipsSize, ButtSize, PenisSize, MuscleDefinition, FacialHair, CharacterStyle, RoleplayType, NsfwSettingsState } from '../types';

interface CharacterControlsProps {
    settings: CharacterSettingsState;
    onChange: (settings: CharacterSettingsState) => void;
    nsfwSettings: NsfwSettingsState;
}

const sceneTypes: { id: SceneType; label: string }[] = [
    { id: 'solo', label: 'Solo' },
    { id: 'couple', label: 'Couple' },
    { id: 'threesome', label: 'Threesome' },
    { id: 'group', label: 'Group' }
];

const genders: { id: Gender; label: string }[] = [
    { id: 'any', label: 'Any' },
    { id: 'female', label: 'Female' },
    { id: 'male', label: 'Male' },
    { id: 'mixed', label: 'Mixed' },
    { id: 'couple', label: 'Couple' },
    { id: 'futanari', label: 'Futanari' },
    { id: 'trans female', label: 'Trans Female' },
    { id: 'trans male', label: 'Trans Male' },
    { id: 'femboy', label: 'Femboy' },
    { id: 'nonbinary', label: 'Nonbinary' }
];
const ageRanges: { id: AgeRange; label: string }[] = [ { id: 'any', label: 'Any' }, { id: '18s', label: '18s' }, { id: '25s', label: '25s' }, { id: '30s', label: '30s' }, { id: '40s', label: '40s' }, { id: '50s', label: '50s' }, { id: '60s', label: '60s' }, { id: '70+', label: '70+' }];
const femaleBodyTypes: { id: FemaleBodyType | 'any'; label: string }[] = [ { id: 'any', label: 'Any' }, { id: 'slim', label: 'Slim' }, { id: 'curvy', label: 'Curvy' }, { id: 'athletic', label: 'Athletic' }, { id: 'instagram model', label: 'Insta Model' }];
const maleBodyTypes: { id: MaleBodyType | 'any'; label: string }[] = [ { id: 'any', label: 'Any' }, { id: 'slim', label: 'Slim' }, { id: 'fat', label: 'Fat' }, { id: 'muscular', label: 'Muscular' }, { id: 'big muscular', label: 'Big Muscular' }];
const ethnicities: { id: Ethnicity; label: string }[] = [ { id: 'any', label: 'Any' }, { id: 'caucasian', label: 'Caucasian' }, { id: 'european', label: 'European' }, { id: 'scandinavian', label: 'Scandinavian' }, { id: 'slavic', label: 'Slavic' }, { id: 'mediterranean', label: 'Mediterranean' }, { id: 'asian', label: 'Asian' }, { id: 'japanese', label: 'Japanese' }, { id: 'chinese', label: 'Chinese' }, { id: 'korean', label: 'Korean' }, { id: 'indian', label: 'Indian' }, { id: 'african', label: 'African' }, { id: 'hispanic', label: 'Hispanic' }, { id: 'middle eastern', label: 'M. Eastern' }, { id: 'native american', label: 'N. American' }];
const heights: { id: HeightRange; label: string }[] = [ { id: 'any', label: 'Any' }, { id: 'very short', label: 'Very Short' }, { id: 'short', label: 'Short' }, { id: 'average', label: 'Average' }, { id: 'tall', label: 'Tall' }];
const breastSizes: { id: BreastSize; label: string }[] = [ { id: 'any', label: 'Any' }, { id: 'flat', label: 'Flat' }, { id: 'small', label: 'Small' }, { id: 'medium', label: 'Medium' }, { id: 'large', label: 'Large' }, { id: 'huge', label: 'Huge' }, { id: 'gigantic', label: 'Gigantic' }];
const hipsSizes: { id: HipsSize; label: string }[] = [ { id: 'any', label: 'Any' }, { id: 'narrow', label: 'Narrow' }, { id: 'average', label: 'Average' }, { id: 'wide', label: 'Wide' }, { id: 'extra wide', label: 'Extra Wide' }];
const buttSizes: { id: ButtSize; label: string }[] = [ { id: 'any', label: 'Any' }, { id: 'flat', label: 'Flat' }, { id: 'small', label: 'Small' }, { id: 'average', label: 'Average' }, { id: 'large', label: 'Large' }, { id: 'bubble', label: 'Bubble' }];
const muscleDefinitions: { id: MuscleDefinition; label: string }[] = [ { id: 'any', label: 'Any' }, { id: 'soft', label: 'Soft' }, { id: 'toned', label: 'Toned' }, { id: 'defined', label: 'Defined' }, { id: 'ripped', label: 'Ripped' }, { id: 'bodybuilder', label: 'Bodybuilder' }];
const facialHairs: { id: FacialHair; label: string }[] = [ { id: 'any', label: 'Any' }, { id: 'clean-shaven', label: 'Shaven' }, { id: 'stubble', label: 'Stubble' }, { id: 'goatee', label: 'Goatee' }, { id: 'mustache', label: 'Mustache' }, { id: 'full beard', label: 'Full Beard' }];
const characterStyles: { id: CharacterStyle; label: string }[] = [
    { id: 'any', label: 'Any' },
    { id: 'goth', label: 'Goth' },
    { id: 'cyberpunk', label: 'Cyberpunk' },
    { id: 'military', label: 'Military' },
    { id: 'pin-up', label: 'Pin-up' },
    { id: 'alt', label: 'Alt' },
    { id: 'retro', label: 'Retro' },
    { id: 'fairy', label: 'Fairy' },
    { id: 'battle angel', label: 'Battle Angel' },
    { id: 'nurse', label: 'Nurse' },
    { id: 'maid', label: 'Maid' },
    { id: 'femme fatale', label: 'Femme Fatale' },
    { id: 'sci-fi', label: 'Sci-Fi' },
    { id: 'vampire', label: 'Vampire' },
    { id: 'demoness', label: 'Demoness' },
    { id: 'angel', label: 'Angel' },
    { id: 'mermaid', label: 'Mermaid' },
    { id: 'punk', label: 'Punk' },
    { id: 'emo', label: 'Emo' },
    { id: 'cottagecore', label: 'Cottagecore' },
    { id: 'glam', label: 'Glam' },
    { id: 'harajuku', label: 'Harajuku' },
    { id: 'warrior', label: 'Warrior' },
    { id: 'cheerleader', label: 'Cheerleader' },
    { id: 'spy', label: 'Spy' },
    { id: 'doll', label: 'Doll' },
    { id: 'sailor', label: 'Sailor' },
    { id: 'tomboy', label: 'Tomboy' },
    { id: 'beach bunny', label: 'Beach Bunny' },
    { id: 'noble', label: 'Noble' },
    { id: 'geisha', label: 'Geisha' },
    { id: 'kunoichi', label: 'Kunoichi' },
    { id: 'mecha pilot', label: 'Mecha Pilot' },
    { id: 'samurai', label: 'Samurai' },
    { id: 'cowgirl', label: 'Cowgirl' },
    { id: 'pirate', label: 'Pirate' },
    { id: 'superheroine', label: 'Superheroine' },
    { id: 'space traveler', label: 'Space Traveler' },
    { id: 'bunnygirl', label: 'Bunnygirl' },
    { id: 'catgirl', label: 'Catgirl' },
    { id: 'policewoman', label: 'Policewoman' },
    { id: 'firefighter', label: 'Firefighter' },
    { id: 'woods elf', label: 'Woods Elf' },
    { id: 'raver', label: 'Raver' },
    { id: 'sporty', label: 'Sporty' },
    { id: 'popstar', label: 'Popstar' },
    { id: 'baroque', label: 'Baroque' },
    { id: 'priestess', label: 'Priestess' },
    { id: 'witch', label: 'Witch' },
    { id: 'sorceress', label: 'Sorceress' },
    { id: 'frost mage', label: 'Frost Mage' },
    { id: 'beastkin', label: 'Beastkin' },
    { id: 'chic', label: 'Chic' },
    { id: 'k-pop', label: 'K-pop' },
    { id: 'playboy model', label: 'Playboy Model' },
    { id: 'biker', label: 'Biker' },
    { id: 'grunge', label: 'Grunge' },
    { id: 'steampunk', label: 'Steampunk' },
    { id: 'tribal', label: 'Tribal' },
    { id: 'ancient goddess', label: 'Ancient Goddess' },
    { id: 'street fashion', label: 'Street Fashion' },
    { id: 'dancer', label: 'Dancer' },
    { id: 'vlogger', label: 'Vlogger' },
    { id: 'supermodel', label: 'Supermodel' },
    { id: 'streamer', label: 'Streamer' },
    { id: 'bodybuilder', label: 'Bodybuilder' },
    { id: 'tattoo queen', label: 'Tattoo Queen' },
    { id: 'hacker', label: 'Hacker' },
    { id: 'alien', label: 'Alien' },
    { id: 'zombie', label: 'Zombie' },
    { id: 'sports fan', label: 'Sports Fan' },
    { id: 'surfer', label: 'Surfer' },
    { id: 'yoga idol', label: 'Yoga Idol' },
    { id: 'circus artist', label: 'Circus Artist' },
    { id: 'acrobat', label: 'Acrobat' },
    { id: 'robot', label: 'Robot' },
    { id: 'android', label: 'Android' },
    { id: 'ballet dancer', label: 'Ballet Dancer' },
    { id: 'mystic', label: 'Mystic' },
    { id: 'spiritualist', label: 'Spiritualist' },
    { id: 'businesswoman', label: 'Businesswoman' },
    { id: 'boss lady', label: 'Boss Lady' },
    { id: 'sugar mommy', label: 'Sugar Mommy' },
    { id: 'milf next door', label: 'MILF Next Door' },
    { id: 'single mom', label: 'Single Mom' },
    { id: 'divorcee', label: 'Divorcee' },
    { id: 'uniform cosplay', label: 'Uniform Cosplay' }
];

const roleplayTypes: { id: RoleplayType; label: string }[] = [
    { id: 'none', label: 'None' },
    { id: 'default', label: 'Default' },
    { id: 'dom/sub', label: 'Dom/Sub' },
    { id: 'professor/student', label: 'Professor/Student' },
    { id: 'boss/employee', label: 'Boss/Employee' },
    { id: 'friends', label: 'Friends' },
    { id: 'childhood friends', label: 'Childhood Friends' },
    { id: 'roommates', label: 'Roommates' },
    { id: 'neighbors', label: 'Neighbors' },
    { id: 'bodyguard/client', label: 'Bodyguard/Client' },
    { id: 'nurse/patient', label: 'Nurse/Patient' }
];

const penisSizes: { id: PenisSize; label: string }[] = [ { id: 'any', label: 'Any' }, { id: 'small', label: 'Small' }, { id: 'average', label: 'Average' }, { id: 'large', label: 'Large' }, { id: 'huge', label: 'Huge' }, { id: 'horse-hung', label: 'Horse-hung' }];

const getAttributeTooltip = (label: string): string => {
    switch (label) {
        case 'Scene Type':
            return 'Determines how many characters appear in the scene. Solo for one person, Couple for two, etc.';
        case 'Gender':
            return 'Specifies the gender identity or type of character(s) to generate.';
        case 'Age Range':
            return 'Sets the approximate age group for the character(s). All ages are 18+.';
        case 'Ethnicity':
            return 'Defines the ethnic background or cultural appearance of the character(s).';
        case 'Height':
            return 'Controls the relative height of the character(s) in the scene.';
        case 'Body Type':
            return 'Determines the overall body shape and build of the character.';
        case 'Breast Size':
            return 'Specifies the breast size for female characters.';
        case 'Hips Size':
            return 'Controls the hip width for female characters.';
        case 'Butt Size':
            return 'Determines the buttocks size for female characters.';
        case 'Muscle Definition':
            return 'Sets the level of muscle definition and tone for male characters.';
        case 'Facial Hair':
            return 'Specifies facial hair style for male characters.';
        case 'Penis Size':
            return 'Determines the genital size for male characters.';
        case 'Species/Theme':
            return 'Add thematic overlays that modify appearance: Furry (beastkin traits), Monster (demonic traits), Sci‑Fi (futuristic tech).';
        case 'Overlays':
            return 'Add thematic overlays that modify appearance: Furry (beastkin traits), Monster (demonic traits), Sci‑Fi (futuristic tech).';
        default:
            return 'Character attribute setting.';
    }
};

interface AttributeSelectorProps<T extends string> {
    label: string;
    options: { id: T | 'any'; label: string }[];
    value: T | 'any';
    onChange: (value: T | 'any') => void;
    gridCols?: string;
}

const AttributeSelector = <T extends string>({ label, options, value, onChange, gridCols = 'grid-cols-4' }: AttributeSelectorProps<T>) => (
    <div>
        <div className="flex items-center gap-2 mb-2">
            <label className="block text-xs font-medium text-gray-400">{label}</label>
            <InfoTooltip text={getAttributeTooltip(label)} />
        </div>
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

export const CharacterControls: React.FC<CharacterControlsProps> = ({ settings, onChange, nsfwSettings }) => {
    const [isCollapsed, setIsCollapsed] = useState(true);

    const handleSceneTypeChange = (sceneType: SceneType) => {
        onChange({ ...settings, sceneType });
    };

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
    
    const suggestStyleIfNeeded = (overlay: 'furry' | 'monster' | 'sciFi'): CharacterStyle | undefined => {
        if (settings.characterStyle === 'any') {
            switch (overlay) {
                case 'furry': return 'beastkin';
                case 'monster': return 'demoness';
                case 'sciFi': return 'sci-fi';
            }
        }
        return undefined;
    };

    const handleOverlayToggle = (overlay: 'furry' | 'monster' | 'sciFi') => {
        const currentOverlays = settings.overlays || { furry: false, monster: false, sciFi: false };
        const newValue = !currentOverlays[overlay];
        const newOverlays = { ...currentOverlays, [overlay]: newValue };
        const styleSuggestion = newValue ? suggestStyleIfNeeded(overlay) : undefined;
        onChange({
            ...settings,
            overlays: newOverlays,
            ...(styleSuggestion ? { characterStyle: styleSuggestion } : {})
        });
    };
    
    const handleChange = (field: keyof CharacterSettingsState, value: any) => {
        onChange({ ...settings, [field]: value });
    };

    const renderBodyTypeSelector = () => {
        const femaleLike = settings.gender === 'female' || settings.gender === 'futanari' || settings.gender === 'trans female';
        const maleLike = settings.gender === 'male' || settings.gender === 'trans male';
        if (!femaleLike && !maleLike) return null;
        const options = femaleLike ? femaleBodyTypes : maleBodyTypes;
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

    const renderFemaleNsfwSelectors = () => {
        const femaleLike = settings.gender === 'female' || settings.gender === 'futanari' || settings.gender === 'trans female';
        const show = femaleLike && nsfwSettings.mode !== 'off';
        if (!show) return null;
        return (
            <div className="pt-4 border-t border-violet-700/30 space-y-4">
                <AttributeSelector
                    label="Breast Size"
                    options={breastSizes}
                    value={settings.breastSize}
                    onChange={value => handleChange('breastSize', value)}
                    gridCols="grid-cols-3 sm:grid-cols-7"
                />
                <AttributeSelector
                    label="Hips Size"
                    options={hipsSizes}
                    value={settings.hipsSize}
                    onChange={value => handleChange('hipsSize', value)}
                    gridCols="grid-cols-3 sm:grid-cols-5"
                />
                <AttributeSelector
                    label="Butt Size"
                    options={buttSizes}
                    value={settings.buttSize}
                    onChange={value => handleChange('buttSize', value)}
                    gridCols="grid-cols-3 sm:grid-cols-6"
                />
            </div>
        );
    };

    return (
        <div className="bg-gray-900/50 rounded-md border border-violet-700/50">
            <button 
                onClick={() => setIsCollapsed(prev => !prev)} 
                className="w-full flex justify-between items-center p-4 focus:outline-none"
                aria-expanded={!isCollapsed}
            >
                <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-violet-400" />
                    <h3 className="text-sm font-medium text-violet-400">Character Settings</h3>
                    <InfoTooltip text="Specify detailed physical attributes for the primary subject. 'Any' gives the Ai creative freedom." />
                </div>
                <ChevronDownIcon className={`h-5 w-5 text-violet-400 transition-transform duration-200 ${!isCollapsed ? 'rotate-180' : ''}`} />
            </button>
            {!isCollapsed && (
                <div className="px-4 pb-4 space-y-4 animate-fade-in">
                    <AttributeSelector label="Scene Type" options={sceneTypes} value={settings.sceneType} onChange={handleSceneTypeChange} gridCols="grid-cols-2 sm:grid-cols-4"/>
                    
                    <div className="pt-4 border-t border-violet-700/30">
                        <AttributeSelector label="Gender" options={genders} value={settings.gender} onChange={handleGenderChange} gridCols="grid-cols-3 sm:grid-cols-4"/>
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <label className="block text-xs font-medium text-gray-400">Species/Theme</label>
                                <InfoTooltip text={getAttributeTooltip('Species/Theme')} />
                            </div>
                            <div className="grid grid-cols-3 gap-2 rounded-md bg-gray-700 p-1">
                                <button
                                    onClick={() => handleOverlayToggle('furry')}
                                    className={`w-full rounded capitalize px-2 py-1 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-gray-800 ${settings.overlays?.furry ? 'bg-accent text-white' : 'text-gray-300 hover:bg-gray-600'}`}
                                >
                                    Furry
                                </button>
                                <button
                                    onClick={() => handleOverlayToggle('monster')}
                                    className={`w-full rounded capitalize px-2 py-1 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-gray-800 ${settings.overlays?.monster ? 'bg-accent text-white' : 'text-gray-300 hover:bg-gray-600'}`}
                                >
                                    Monster
                                </button>
                                <button
                                    onClick={() => handleOverlayToggle('sciFi')}
                                    className={`w-full rounded capitalize px-2 py-1 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-gray-800 ${settings.overlays?.sciFi ? 'bg-accent text-white' : 'text-gray-300 hover:bg-gray-600'}`}
                                >
                                    Sci‑Fi
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="pt-4 border-t border-violet-700/30">
                        <AttributeSelector label="Age Range" options={ageRanges} value={settings.age} onChange={value => handleChange('age', value)} gridCols="grid-cols-4" />
                    </div>
                    <div className="pt-4 border-t border-violet-700/30">{renderBodyTypeSelector()}</div>
                    <div className="pt-4 border-t border-violet-700/30">
                        <AttributeSelector label="Ethnicity" options={ethnicities} value={settings.ethnicity} onChange={value => handleChange('ethnicity', value)} gridCols="grid-cols-3 sm:grid-cols-5" />
                    </div>
                    <div className="pt-4 border-t border-violet-700/30">
                        <AttributeSelector label="Height" options={heights} value={settings.height} onChange={value => handleChange('height', value)} gridCols="grid-cols-3 sm:grid-cols-5" />
                    </div>
                    {renderFemaleNsfwSelectors()}
                </div>
            )}
        </div>
    );
};
                     

