
import React, { useState } from 'react';
import { ChevronDownIcon } from './icons';
import { CompactToggle } from './CompactToggle';
import { PresetCategory } from './PresetCategory';

interface PosePresetsProps {
  onAppend: (text: string) => void;
  selectedPresets: string[];
  onSelectedPresetsChange: (presets: string[]) => void;
}

const casualSfwPoses = [
    'Standing confidently', 'Sitting gracefully', 'Walking briskly', 'Running dynamically', 'Jumping for joy', 
    'Lying relaxed on grass', 'Leaning against a wall', 'Arms crossed', 'Hands in pockets', 'Waving hello', 
    'Pointing towards something', 'Thinking pose (hand on chin)', 'Reading a book intently', 'Sipping a drink', 
    'Looking over shoulder', 'Stretching languidly', 'Dancing freely', 'Yoga tree pose', 'Meditating peacefully', 
    'Laughing heartily', 'Crying softly', 'Surprised expression', 'Heroic stance', 'Kneeling respectfully', 
    'Crouching low', 'Reaching for the sky', 'Holding a flower', 'Looking directly at camera', 'Shy pose', 'Fighting stance'
];

const heroSfwPoses = [
    'Power stance, looking directly into the lens',
    'Mid-stride with purpose towards the camera',
    'Leaning forward on a table, intense gaze',
    'Three-quarter profile, chin up, looking off-camera',
    'Adjusting a jacket collar with a subtle smirk',
    'Back to camera, looking over one shoulder mysteriously',
    'Dynamic contrapposto pose, exuding confidence',
    'Hands tucked into trouser pockets, relaxed but in control',
    'Emerging from a doorway, silhouetted by light',
    'Hand raised, shielding eyes, looking to the horizon',
    'Seated on the edge of a chair, leaning forward, elbows on knees',
    'Lounging back in an armchair, one leg crossed, contemplative',
    'Perched on a stool, one foot on the rung, engaging the camera',
    'Sitting on the floor, back against a wall, knees drawn up',
    'At a grand piano, fingers hovering over the keys',
    'Mid-air jump, captured with high-speed photography',
    'Sprinting, captured with motion blur for speed',
    'Controlled "hero landing" on one knee, fist to the ground',
    'Swinging a coat over their shoulder while walking away',
    'In the middle of a sharp, elegant turn, fabric swirling',
    'Extreme close-up, eyes locked with camera, face half in shadow',
    'Laughing candidly, head tilted back slightly',
    'A quiet, confident smile, looking slightly down at camera',
    'Hand partially covering face, revealing only the eyes',
    'Winking playfully at the camera',
    'Holding a vintage camera, looking through the viewfinder',
    'Spinning a basketball on one finger, looking bored',
    'Leaning on a classic motorcycle, helmet under one arm',
    'Holding an antique sword, examining the blade',
    'Flipping a coin, eyes following its arc'
];

const nsfwPoses = [
    'Arching back seductively', 'Spreading legs invitingly', 'On all fours', 'Bending over', 'Presenting rear', 
    'Hands behind back', 'Self-embrace', 'Lying on bed', 'Classic pin-up pose', 'Suggestive glance over shoulder', 
    'Licking lips', 'Biting lower lip', 'Pulling up shirt', 'Partially undressed', 'Showering pose', 
    'On knees, looking up', 'Legs up in the air', 'Lying on stomach, propped on elbows', 'Provocative squat', 
    'Lingerie model pose', 'Teasingly hiding nudity', 'Touching own body', 'Knees bent, feet on floor', 
    'Side-lying pose', 'Hands on hips provocatively', 'Hand on inner thigh', 'Sensual stretching', 'Wetlook pose', 
    'Masturbating', 'Fingering'
];

const hardcorePoses = [
    'Missionary position', 'Cowgirl', 'Reverse cowgirl', 'Doggy style', 'Standing carry', 'Piledriver position', 
    '69 position', 'Receiving anal', 'Giving anal', 'Double penetration', 'Being spanked', 'Shibari rope bondage', 
    'Ball gag in mouth', 'Blindfolded', 'Fisting', 'Bukkake scene', 'Gangbang scene', 'Cunnilingus', 'Fellatio', 
    'Deepthroat', 'Footjob', 'Handjob', 'Titjob', 'Facesitting', 'Ahegao expression', 'Cum on face', 'Cum on body', 
    'Female orgasm', 'Male orgasm', 'Creampie'
];

export const PosePresets: React.FC<PosePresetsProps> = ({ onAppend, selectedPresets, onSelectedPresetsChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'sfw' | 'hero-sfw' | 'nsfw' | 'hardcore' | null>(null);
  const [isMultiSelect, setIsMultiSelect] = useState(false);

  const handleTabToggle = (tab: 'sfw' | 'hero-sfw' | 'nsfw' | 'hardcore') => {
    setActiveTab(prev => prev === tab ? null : tab);
  };
  
  const handlePresetClick = (preset: string) => {
    const presetLower = preset.toLowerCase();
    if (isMultiSelect) {
      onSelectedPresetsChange(
        selectedPresets.includes(presetLower)
          ? selectedPresets.filter(p => p !== presetLower)
          : [...selectedPresets, presetLower]
      );
    } else {
      onAppend(preset); // Append original case
      // Also update selection for the Random button. Toggle selection on single-select mode.
      const isCurrentlySelected = selectedPresets.length === 1 && selectedPresets[0] === presetLower;
      onSelectedPresetsChange(isCurrentlySelected ? [] : [presetLower]);
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
        <h3 className="text-sm font-medium text-gray-400">Pose Presets</h3>
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
                title="Casual SFW"
                presets={casualSfwPoses}
                isOpen={activeTab === 'sfw'}
                onToggle={() => handleTabToggle('sfw')}
                onPresetClick={handlePresetClick}
                isMultiSelect={isMultiSelect}
                selectedPresets={selectedPresets}
                colorClass="text-green-400"
              />
              <PresetCategory 
                title="Hero SFW"
                presets={heroSfwPoses}
                isOpen={activeTab === 'hero-sfw'}
                onToggle={() => handleTabToggle('hero-sfw')}
                onPresetClick={handlePresetClick}
                isMultiSelect={isMultiSelect}
                selectedPresets={selectedPresets}
                colorClass="text-cyan-400"
              />
              <PresetCategory 
                title="NSFW"
                presets={nsfwPoses}
                isOpen={activeTab === 'nsfw'}
                onToggle={() => handleTabToggle('nsfw')}
                onPresetClick={handlePresetClick}
                isMultiSelect={isMultiSelect}
                selectedPresets={selectedPresets}
                colorClass="text-yellow-400"
              />
              <PresetCategory 
                title="Hardcore"
                presets={hardcorePoses}
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
