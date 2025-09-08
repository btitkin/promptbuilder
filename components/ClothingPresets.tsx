
import React, { useState } from 'react';
import { ChevronDownIcon } from './icons';
import { CompactToggle } from './CompactToggle';
import { PresetCategory } from './PresetCategory';

interface ClothingPresetsProps {
  onAppend: (text: string) => void;
  selectedPresets: string[];
  onSelectedPresetsChange: (presets: string[]) => void;
}

const sfwClothing = [
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
    'Prom dress', 'Quinceañera dress', 'Cheongsam', 'Dirndl', 'Poncho', 
    'Lab goggles', 'Artist\'s smock', 'Gardening gloves', 'Motorcycle helmet', 'Baseball cap', 
    'Beanie', 'Sarong', 'Kaftan', 'Messenger bag', 'Fanny pack'
];

const nsfwClothing = [
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

const hardcoreClothing = [
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
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'sfw' | 'nsfw' | 'hardcore' | null>(null);
  const [isMultiSelect, setIsMultiSelect] = useState(false);

  const handleTabToggle = (tab: 'sfw' | 'nsfw' | 'hardcore') => {
    setActiveTab(prev => prev === tab ? null : tab);
  };
  
  const handlePresetClick = (preset: string) => {
    if (isMultiSelect) {
      onSelectedPresetsChange(
        selectedPresets.includes(preset) ? selectedPresets.filter(p => p !== preset) : [...selectedPresets, preset]
      );
    } else {
      onAppend(preset);
      // Also update selection for the Random button. Toggle selection on single-select mode.
      const isCurrentlySelected = selectedPresets.length === 1 && selectedPresets[0] === preset;
      onSelectedPresetsChange(isCurrentlySelected ? [] : [preset]);
    }
  };
  
  const handleAppendSelected = () => {
    if (selectedPresets.length > 0) {
      onAppend(selectedPresets.join(', '));
      onSelectedPresetsChange([]);
    }
  };

  const handleClearSelection = () => {
    onSelectedPresetsChange([]);
  };

  return (
    <div className="bg-gray-900/50 rounded-md border border-gray-700">
       <button 
        onClick={() => setIsOpen(prev => !prev)} 
        className="w-full flex justify-between items-center p-4 focus:outline-none"
        aria-expanded={isOpen}
      >
        <h3 className="text-sm font-medium text-gray-400">Clothing Presets</h3>
        <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
         <div className="px-4 pb-4 space-y-4 animate-fade-in">
            <div className="p-3 bg-gray-800 rounded-md border border-gray-700 space-y-3">
              <CompactToggle
                label="Multi-Select"
                checked={isMultiSelect}
                onChange={(checked) => {
                    setIsMultiSelect(checked);
                    // Clear selection when changing mode to avoid confusion
                    onSelectedPresetsChange([]);
                }}
                tooltip="Toggle to select multiple presets at once."
              />
              {isMultiSelect && selectedPresets.length > 0 && (
                <div className="flex gap-2 animate-fade-in">
                  <button 
                    onClick={handleAppendSelected} 
                    className="flex-grow bg-accent text-white font-semibold py-2 px-3 text-sm rounded-md hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-accent transition-colors"
                  >
                    Append Selected ({selectedPresets.length})
                  </button>
                  <button 
                    onClick={handleClearSelection} 
                    className="text-gray-400 font-semibold py-2 px-3 text-sm rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-accent transition-colors"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
            <div className="bg-gray-800 rounded-md border border-gray-700">
              <PresetCategory 
                title="SFW"
                presets={sfwClothing}
                isOpen={activeTab === 'sfw'}
                onToggle={() => handleTabToggle('sfw')}
                onPresetClick={handlePresetClick}
                isMultiSelect={isMultiSelect}
                selectedPresets={selectedPresets}
                colorClass="text-green-400"
              />
              <PresetCategory 
                title="NSFW"
                presets={nsfwClothing}
                isOpen={activeTab === 'nsfw'}
                onToggle={() => handleTabToggle('nsfw')}
                onPresetClick={handlePresetClick}
                isMultiSelect={isMultiSelect}
                selectedPresets={selectedPresets}
                colorClass="text-yellow-400"
              />
              <PresetCategory 
                title="Hardcore"
                presets={hardcoreClothing}
                isOpen={activeTab === 'hardcore'}
                onToggle={() => handleTabToggle('hardcore')}
                onPresetClick={handlePresetClick}
                isMultiSelect={isMultiSelect}
                selectedPresets={selectedPresets}
                colorClass="text-red-400"
              />
            </div>
          </div>
      )}
    </div>
  );
};
