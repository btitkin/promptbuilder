import React, { useState, useEffect } from 'react';
import { ChevronDownIcon } from './icons';
import { PresetCategory } from './PresetCategory';
import { InfoTooltip } from './InfoTooltip';
import { Briefcase, Users, Sparkles, Crown, Theater } from 'lucide-react';

interface RoleplayPresetsProps {
  onAppend: (text: string) => void;
  selectedPresets: string[];
  onSelectedPresetsChange: (presets: string[]) => void;
}

const professionalRoleplay = [
  'Teacher/Student', 'Professor/Student', 'Boss/Employee', 'Doctor/Patient', 'Nurse/Patient',
  'Therapist/Client', 'Lawyer/Client', 'Photographer/Model', 'Personal Trainer/Client',
  'Massage Therapist/Client', 'Secretary/Boss', 'Tutor/Student', 'Mentor/Mentee',
  'Interviewer/Candidate', 'Supervisor/Intern', 'Coach/Athlete', 'Consultant/Client'
];

const socialRoleplay = [
  'Friends', 'Childhood Friends', 'Best Friends', 'Roommates', 'Neighbors',
  'Strangers', 'Friends with Benefits', 'Ex-Lovers', 'Blind Date', 'Online Date',
  'College Classmates', 'Coworkers', 'Travel Companions', 'Study Partners',
  'Gym Partners', 'Dance Partners', 'Gaming Partners'
];

const fantasyRoleplay = [
  'Vampire/Human', 'Werewolf/Human', 'Angel/Demon', 'Witch/Mortal', 'Fairy/Human',
  'Elf/Human', 'Dragon/Human', 'Mermaid/Human', 'Goddess/Mortal', 'Demon/Human',
  'Alien/Human', 'Robot/Human', 'Time Traveler/Local', 'Superhero/Civilian',
  'Wizard/Apprentice', 'Knight/Princess', 'Pirate/Captive', 'Assassin/Target'
];

const powerDynamicRoleplay = [
  'Dom/Sub', 'Master/Servant', 'Owner/Pet', 'Captor/Captive', 'Hunter/Prey',
  'Predator/Prey', 'Alpha/Omega', 'Dominant/Submissive', 'Controller/Controlled',
  'Leader/Follower', 'Protector/Protected', 'Guardian/Ward', 'Bodyguard/Client'
];

const RotateCcw: React.FC = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 4v6h6M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </svg>
);

export const RoleplayPresets: React.FC<RoleplayPresetsProps> = ({ 
  onAppend, 
  selectedPresets, 
  onSelectedPresetsChange 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isClient, setIsClient] = useState(false);

  const [activeTab, setActiveTab] = useState<'professional' | 'social' | 'fantasy' | 'power' | null>(null);


  const handleTabToggle = (tab: 'professional' | 'social' | 'fantasy' | 'power') => {
    setActiveTab(prev => prev === tab ? null : tab);
  };

  const handlePresetClick = (preset: string) => {
    const presetLower = preset.toLowerCase();
    const newSelectedPresets = selectedPresets.includes(presetLower)
      ? selectedPresets.filter(p => p !== presetLower)
      : [...selectedPresets, presetLower];
    onSelectedPresetsChange(newSelectedPresets);
  };

  const handleClearSelection = () => {
    onSelectedPresetsChange([]);
  };

  return (
    <div className="bg-gray-900/50 rounded-md border border-amber-700/50">
       <button 
        onClick={() => setIsCollapsed(prev => !prev)} 
        className="w-full flex justify-between items-center p-4 focus:outline-none"
        aria-expanded={!isCollapsed}
      >
        <div className="flex items-center gap-2">
          <Theater className="h-4 w-4 text-amber-400" />
          <h3 className="text-sm font-medium text-amber-400">Roleplay Presets <span className="text-xs text-gray-400">(Opt-in)</span></h3>
          {selectedPresets.length > 0 && (
            <span className="text-xs bg-amber-600 text-amber-100 px-2 py-0.5 rounded-full">
              {selectedPresets.length} selected
            </span>
          )}
          <InfoTooltip text="Define character relationships and dynamics for roleplay scenarios" />
        </div>
        <ChevronDownIcon className={`h-5 w-5 text-amber-400 transition-transform duration-200 ${!isCollapsed ? 'rotate-180' : ''}`} />
      </button>

      {!isCollapsed && (
         <div className="px-4 pb-4 space-y-4 animate-fade-in">
            <div className="space-y-0">
              <div className="border-t border-amber-700/30">
                <PresetCategory 
                  title={
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-3 w-3 text-blue-400" />
                      <span>Professional</span>
                      <InfoTooltip text="Work-related roleplay scenarios including teacher/student, boss/employee dynamics" />
                    </div>
                  }
                  presets={professionalRoleplay}
                  isOpen={activeTab === 'professional'}
                  onToggle={() => handleTabToggle('professional')}
                  onPresetClick={handlePresetClick}
                  isMultiSelect={true}
                  selectedPresets={selectedPresets}
                  colorClass="text-blue-400"
                />
              </div>
              <div className="border-t border-amber-700/30">
                <PresetCategory 
                  title={
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3 text-green-400" />
                      <span>Social</span>
                      <InfoTooltip text="Casual relationship scenarios including friends, roommates, and dating situations" />
                    </div>
                  }
                  presets={socialRoleplay}
                  isOpen={activeTab === 'social'}
                  onToggle={() => handleTabToggle('social')}
                  onPresetClick={handlePresetClick}
                  isMultiSelect={true}
                  selectedPresets={selectedPresets}
                  colorClass="text-green-400"
                />
              </div>
              <div className="border-t border-amber-700/30">
                <PresetCategory 
                  title={
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-3 w-3 text-purple-400" />
                      <span>Fantasy</span>
                      <InfoTooltip text="Supernatural and fantasy roleplay scenarios with mythical creatures and beings" />
                    </div>
                  }
                  presets={fantasyRoleplay}
                  isOpen={activeTab === 'fantasy'}
                  onToggle={() => handleTabToggle('fantasy')}
                  onPresetClick={handlePresetClick}
                  isMultiSelect={true}
                  selectedPresets={selectedPresets}
                  colorClass="text-purple-400"
                />
              </div>
              <div className="border-t border-amber-700/30">
                <PresetCategory 
                  title={
                    <div className="flex items-center gap-2">
                      <Crown className="h-3 w-3 text-red-400" />
                      <span>Power Dynamics</span>
                      <InfoTooltip text="Dominant/submissive and power exchange roleplay scenarios for mature content" />
                    </div>
                  }
                  presets={powerDynamicRoleplay}
                  isOpen={activeTab === 'power'}
                  onToggle={() => handleTabToggle('power')}
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

