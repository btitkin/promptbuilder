
import React from 'react';
import { InfoTooltip } from './InfoTooltip';

interface CompactToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  tooltip?: string;
}

export const CompactToggle: React.FC<CompactToggleProps> = ({ label, checked, onChange, disabled = false, tooltip }) => {
  const toggleId = `compact-toggle-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className={`flex items-center justify-between ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <div className="flex items-center gap-2">
            <label htmlFor={toggleId} className="text-sm font-medium text-gray-400 cursor-pointer">
                {label}
            </label>
            {tooltip && <InfoTooltip text={tooltip} />}
        </div>
        <button
            type="button"
            id={toggleId}
            className={`${
            checked ? 'bg-accent' : 'bg-gray-600'
            } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-gray-800 disabled:cursor-not-allowed`}
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            disabled={disabled}
        >
            <span
            aria-hidden="true"
            className={`${
                checked ? 'translate-x-5' : 'translate-x-0'
            } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
            />
        </button>
    </div>
  );
};
