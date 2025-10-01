import React from 'react';
import { InfoTooltip } from './InfoTooltip';

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  tooltip?: string;
  htmlId?: string; // optional stable id independent from label
}

export const Toggle: React.FC<ToggleProps> = ({ label, checked, onChange, disabled = false, tooltip, htmlId }) => {
  const toggleId = htmlId || `toggle-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className={`flex flex-col items-start ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <div className="flex items-center gap-2 mb-1">
            <label htmlFor={toggleId} className="block text-sm font-medium text-gray-400">
                {label}
            </label>
            {tooltip && <InfoTooltip text={tooltip} />}
        </div>
        <div className="flex items-center">
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
            <span className="ml-3 text-sm text-gray-200">{checked ? 'On' : 'Off'}</span>
        </div>
    </div>
  );
};