
import React, { useState, useEffect } from 'react';
import { PresetCategory } from './PresetCategory';
import { CompactToggle } from './CompactToggle';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { RotateCcw, User, Shield, Eye, Flame, Move } from 'lucide-react';
import { InfoTooltip } from './InfoTooltip';

interface PosePresetsProps {
  onAppend: (text: string) => void;
  selectedPresets: string[];
  onSelectedPresetsChange: (presets: string[]) => void;
}

export const casualSfwPoses = [
    'Standing confidently', 'Sitting gracefully', 'Walking briskly', 'Running dynamically', 'Jumping for joy', 
    'Lying relaxed on grass', 'Leaning against a wall', 'Arms crossed', 'Hands in pockets', 'Waving hello', 
    'Pointing towards something', 'Thinking pose (hand on chin)', 'Reading a book intently', 'Sipping a drink', 
    'Looking over shoulder', 'Stretching languidly', 'Dancing freely', 'Yoga tree pose', 'Meditating peacefully', 
    'Laughing heartily', 'Crying softly', 'Surprised expression', 'Heroic stance', 'Kneeling respectfully', 
    'Crouching low', 'Reaching for the sky', 'Holding a flower', 'Looking directly at camera', 'Shy pose', 'Fighting stance'
];

export const heroSfwPoses = [
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

export const nsfwPoses = [
    'Arching back seductively', 'Spreading legs invitingly', 'On all fours', 'Bending over', 'Presenting rear', 
    'Hands behind back', 'Self-embrace', 'Lying on bed', 'Classic pin-up pose', 'Suggestive glance over shoulder', 
    'Licking lips', 'Biting lower lip', 'Pulling up shirt', 'Partially undressed', 'Showering pose', 
    'On knees, looking up', 'Legs up in the air', 'Lying on stomach, propped on elbows', 'Provocative squat', 
    'Lingerie model pose', 'Teasingly hiding nudity', 'Touching own body', 'Knees bent, feet on floor', 
    'Side-lying pose', 'Hands on hips provocatively', 'Hand on inner thigh', 'Sensual stretching', 'Wetlook pose', 
    'Masturbating', 'Fingering'
];

export const hardcorePoses = [
    'Missionary position', 'Cowgirl', 'Reverse cowgirl', 'Doggy style', 'Standing carry', 'Piledriver position', 
    '69 position', 'Receiving anal', 'Giving anal', 'Double penetration', 'Being spanked', 'Shibari rope bondage', 
    'Ball gag in mouth', 'Blindfolded', 'Fisting', 'Bukkake scene', 'Gangbang scene', 'Cunnilingus', 'Fellatio', 
    'Deepthroat', 'Footjob', 'Handjob', 'Titjob', 'Facesitting', 'Ahegao expression', 'Cum on face', 'Cum on body', 
    'Female orgasm', 'Male orgasm', 'Creampie'
];

export const PosePresets: React.FC<PosePresetsProps> = ({ onAppend, selectedPresets, onSelectedPresetsChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [activeTab, setActiveTab] = useState<'sfw' | 'hero-sfw' | 'nsfw' | 'hardcore' | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleTabToggle = (tab: 'sfw' | 'hero-sfw' | 'nsfw' | 'hardcore') => {
    setActiveTab(prev => prev === tab ? null : tab);
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

  return (
    <div className="bg-gray-900/50 rounded-md border border-emerald-700/50">
      <div 
        onClick={() => setIsCollapsed(prev => !prev)} 
        className="w-full flex justify-between items-center p-4 focus:outline-none cursor-pointer"
        aria-expanded={!isCollapsed}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setIsCollapsed(prev => !prev)}
      >
        <div className="flex items-center gap-2">
          <Move className="h-4 w-4 text-emerald-400" />
          <h3 className="text-sm font-medium text-emerald-400">Pose Presets <span className="text-xs text-gray-400">(Opt-in)</span></h3>
          {selectedPresets.length > 0 && (
            <span className="text-xs bg-emerald-600 text-emerald-100 px-2 py-0.5 rounded-full">
              {selectedPresets.length} selected
            </span>
          )}
          <InfoTooltip text="Choose from various pose categories to define character positioning and body language in your image." />
        </div>
        <ChevronDownIcon className={`h-5 w-5 text-emerald-400 transition-transform duration-200 ${!isCollapsed ? 'rotate-180' : ''}`} />
      </div>

      {!isCollapsed && (
         <div className="px-4 pb-4 space-y-4 animate-fade-in">
            <div className="space-y-0">
              <div className="border-t border-emerald-700/30">
                <PresetCategory 
                  title={
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 text-green-400" />
                      <span>Casual SFW</span>
                      <InfoTooltip text="Safe-for-work poses suitable for everyday situations, casual photography, and general character positioning." />
                    </div>
                  }
                  presets={casualSfwPoses}
                  isOpen={activeTab === 'sfw'}
                  onToggle={() => handleTabToggle('sfw')}
                  onPresetClick={handlePresetClick}
                  isMultiSelect={true}
                  selectedPresets={selectedPresets}
                  colorClass="text-green-400"
                />
              </div>
              <div className="border-t border-emerald-700/30">
                <PresetCategory 
                  title={
                    <div className="flex items-center gap-2">
                      <Shield className="h-3 w-3 text-cyan-400" />
                      <span>Hero SFW</span>
                      <InfoTooltip text="Dynamic, confident poses perfect for heroic characters, professional photography, and dramatic scenes." />
                    </div>
                  }
                  presets={heroSfwPoses}
                  isOpen={activeTab === 'hero-sfw'}
                  onToggle={() => handleTabToggle('hero-sfw')}
                  onPresetClick={handlePresetClick}
                  isMultiSelect={true}
                  selectedPresets={selectedPresets}
                  colorClass="text-cyan-400"
                />
              </div>
              <div className="border-t border-emerald-700/30">
                <PresetCategory 
                  title={
                    <div className="flex items-center gap-2">
                      <Eye className="h-3 w-3 text-yellow-400" />
                      <span>NSFW</span>
                      <InfoTooltip text="Adult-oriented poses with suggestive positioning and sensual elements. 18+ content only." />
                    </div>
                  }
                  presets={nsfwPoses}
                  isOpen={activeTab === 'nsfw'}
                  onToggle={() => handleTabToggle('nsfw')}
                  onPresetClick={handlePresetClick}
                  isMultiSelect={true}
                  selectedPresets={selectedPresets}
                  colorClass="text-yellow-400"
                />
              </div>
              <div className="border-t border-emerald-700/30">
                <PresetCategory 
                  title={
                    <div className="flex items-center gap-2">
                      <Flame className="h-3 w-3 text-red-400" />
                      <span>Hardcore</span>
                      <InfoTooltip text="Explicit adult poses featuring intimate acts and hardcore scenarios. 18+ content only." />
                    </div>
                  }
                  presets={hardcorePoses}
                  isOpen={activeTab === 'hardcore'}
                  onToggle={() => handleTabToggle('hardcore')}
                  onPresetClick={handlePresetClick}
                  isMultiSelect={true}
                  selectedPresets={selectedPresets}
                  colorClass="text-red-400"
                />
              </div>
            </div>
          </div>
      )}
    </div>
  );
};
