
import React, { useState, useEffect } from 'react';
import { PresetCategory } from './PresetCategory';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { RotateCcw, Shirt, Heart, Flame } from 'lucide-react';
import { InfoTooltip } from './InfoTooltip';

interface ClothingPresetsProps {
  onAppend: (text: string) => void;
  selectedPresets: string[];
  onSelectedPresetsChange: (presets: string[]) => void;
}

export const sfwClothing = [
    'T-shirt and jeans', 'Formal business suit', 'Elegant evening gown', 'Summer dress', 'Winter coat and scarf',
    'Hoodie and sweatpants', 'School uniform', 'Nurse\'s uniform', 'Police officer uniform', 'Firefighter gear',
    'Knight\'s armor', 'Sci-fi spacesuit', 'Fantasy adventurer\'s leather armor', 'Wizard\'s robes', 'Steampunk attire',
    'Victorian dress', '1920s flapper dress', 'Casual sweater and slacks', 'Sportswear (tracksuit)', 'Tennis outfit',
    'Swimsuit (one-piece)', 'Lab coat', 'Chef\'s uniform', 'Pilot\'s uniform', 'Kimono',
    'Sari', 'Hanfu', 'Lederhosen', 'Kilt', 'Raincoat and boots',
    'Puffy jacket', 'Trench coat', 'Denim jacket', 'Leather biker jacket', 'Wetsuit',
    'Ski suit', 'Pajamas', 'Cocktail dress', 'Tuxedo', 'Cleric\'s vestments',
    'Jumpsuit', 'Overalls', 'Polo shirt and shorts', 'Hiking gear', 'Ballerina tutu',
    'Lab apron', 'Barista apron', 'Hazmat suit', 'Traditional wedding dress', 'Doctor\'s scrubs',
    'Roman toga', 'Viking tunic', 'Egyptian shendyt', 'Medieval gown', 'Renaissance doublet', 
    'Pirate coat', 'Judge\'s robes', 'Surgeon\'s scrubs', 'Construction worker vest', 'Cargo shorts', 
    'Plaid shirt', 'V-neck sweater', 'Tank top', 'Leggings', 'Elven circlet', 
    'Cyberpunk jacket', 'Post-apocalyptic rags', 'Fedora hat', 'Sunglasses', 'Gloves', 
    'Backpack', 'Crown', 'Tiara', 'Blouse', 'Skirt', 
    'Cardigan', 'Bomber jacket', 'Windbreaker', 'Anorak', 'Peacoat', 
    'Sneakers', 'Boots', 'Sandals', 'Dress shoes', 'Ballet flats', 
    'Prom dress', 'QuinceaĂ±era dress', 'Cheongsam', 'Dirndl', 'Poncho', 
    'Lab goggles', 'Artist\'s smock', 'Gardening gloves', 'Motorcycle helmet', 'Baseball cap', 
    'Beanie', 'Sarong', 'Kaftan', 'Messenger bag', 'Fanny pack'
];

export const nsfwClothing = [
    'Lingerie set', 'Thong', 'G-string', 'Bra and panties', 'Micro bikini',
    'See-through nightgown', 'Sheer lingerie', 'Fishnet stockings', 'Garter belt and stockings', 'Corset',
    'Latex catsuit', 'Leather bodysuit', 'Bondage harness', 'Strappy lingerie', 'Crotchless panties',
    'Open-cup bra', 'Pasties', 'Body chain', 'Wet t-shirt', 'Schoolgirl uniform (sexualized)',
    'French maid outfit (sexualized)', 'Nurse uniform (sexualized)', 'Cheerleader outfit (sexualized)', 'Bunny girl costume', 'Dominatrix outfit',
    'Body paint', 'See-through dress', 'Extremely short miniskirt', 'Side-tie bikini', 'Underwear only',
    'Transparent raincoat', 'Leather chaps', 'Vinyl minidress', 'Peek-a-boo lingerie', 'Bodystocking',
    'Harness lingerie', 'Thigh-high boots', 'High heels', 'Garter shorts', 'Babydoll dress',
    'Teddie lingerie', 'Roleplay costume', 'Nude apron', 'Open shirt, no bra', 'Short shorts (daisy dukes)',
    'Low-cut top', 'Shirt tied up', 'Butt-plug tail', 'Collar and leash', 'Bandages (shibari style)',
    'Caged bra', 'Ouvert lingerie', 'Suspender belt', 'Waspie', 'Wet look clothing', 
    'PVC dress', 'Satin robe', 'Sexy cop uniform', 'Submissive collar', 'Ankle cuffs', 
    'Tape gag', 'Topless', 'Bottomless', 'Strategically placed hands', 'Tassel pasties', 
    'Gas mask (fetish)', 'Rubber hood', 'Ballet boots', 'Micro skirt', 'Sling bikini', 
    'Monokini', 'Ripped clothes', 'Torn stockings', 'Duct tape bikini', 'Glow in the dark body paint', 
    'Liquid latex', 'Schoolboy uniform (sexualized)', 'Slit dress', 'Plugging tail', 'Nipple tape'
];

export const hardcoreClothing = [
    'Strapon harness', 'Ball gag', 'Blindfold', 'Nipple clamps', 'Spreader bar',
    'Vibrator', 'Dildo', 'Cock ring', 'Chastity cage', 'Anal beads',
    'Handcuffs', 'Rope bondage (shibari)', 'Butt plug', 'Anal hook', 'Piercings (genital)',
    'Syringe (medical play)', 'Speculum', 'Electrodes (e-stim)', 'Riding crop', 'Paddle',
    'Ring gag', 'Wrist cuffs', 'Ankle cuffs', 'Hogtie position', 'Medical restraints', 
    'Flogger', 'Whip', 'Cane', 'Enema bag', 'Catheter (play)', 
    'Double-ended dildo', 'Anal plug with tail', 'Milking machine', 'Penis pump', 'Urethral sounding rods', 
    'Muzzle gag', 'Spider gag', 'Inflatable gag', 'Nose hook', 'Tongue clamp'
];

export const ClothingPresets: React.FC<ClothingPresetsProps> = ({ onAppend, selectedPresets, onSelectedPresetsChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isClient, setIsClient] = useState(false);

  const [activeTab, setActiveTab] = useState<string | null>(null);


  const handleTabToggle = (tab: string) => {
    setActiveTab(activeTab === tab ? null : tab);
  };
  
  const handlePresetClick = (preset: string) => {
    const presetLower = preset.toLowerCase();
    if (preset === '') {
      // Clear all selections
      onSelectedPresetsChange([]);
    } else {
      // Toggle selection in multi-select mode
      onSelectedPresetsChange(
        selectedPresets.includes(presetLower)
          ? selectedPresets.filter(p => p !== presetLower)
          : [...selectedPresets, presetLower]
      );
    }
  };

  const handleClearAll = () => {
    onSelectedPresetsChange([]);
  };

  return (
    <div className="bg-gray-900/50 rounded-md border border-indigo-700/50">
      <button 
        onClick={() => setIsCollapsed(prev => !prev)} 
        className="w-full flex justify-between items-center p-4 focus:outline-none"
        aria-expanded={!isCollapsed}
      >
        <div className="flex items-center gap-2">
          <Shirt className="h-4 w-4 text-indigo-400" />
          <h3 className="text-sm font-medium text-indigo-400">Clothing Presets</h3>
          {selectedPresets.length > 0 && (
            <span className="text-xs bg-indigo-600 text-indigo-100 px-2 py-0.5 rounded-full">
              {selectedPresets.length} selected
            </span>
          )}
          <InfoTooltip text="Select clothing and accessories for your character from Sfw, Nsfw, or hardcore categories" />
        </div>
        <ChevronDownIcon className={`h-5 w-5 text-indigo-400 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`} />
      </button>
      
      {!isCollapsed && (
        <div className="px-4 pb-4 space-y-4 animate-fade-in">
          <div className="space-y-3">
            {/* SFW */}
            <div className="pt-4 border-t border-indigo-700/30">
              <button
                onClick={() => handleTabToggle('sfw')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Shirt className="h-3 w-3 text-green-400" />
                  <span className="text-xs font-medium text-green-400">SFW</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-green-400 transition-transform duration-200 ${activeTab === 'sfw' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'sfw' && (
                <div className="mt-2">
                  <PresetCategory
                    title="SFW"
                    presets={sfwClothing}
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

            {/* NSFW */}
            <div className="pt-4 border-t border-indigo-700/30">
              <button
                onClick={() => handleTabToggle('nsfw')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Heart className="h-3 w-3 text-yellow-400" />
                  <span className="text-xs font-medium text-yellow-400">NSFW</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-yellow-400 transition-transform duration-200 ${activeTab === 'nsfw' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'nsfw' && (
                <div className="mt-2">
                  <PresetCategory
                    title="NSFW"
                    presets={nsfwClothing}
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

            {/* Hardcore */}
            <div className="pt-4 border-t border-indigo-700/30">
              <button
                onClick={() => handleTabToggle('hardcore')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Flame className="h-3 w-3 text-red-400" />
                  <span className="text-xs font-medium text-red-400">Hardcore</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-red-400 transition-transform duration-200 ${activeTab === 'hardcore' ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === 'hardcore' && (
                <div className="mt-2">
                  <PresetCategory
                    title="Hardcore"
                    presets={hardcoreClothing}
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
          </div>
        </div>
      )}
    </div>
  );
};


