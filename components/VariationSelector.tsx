
import React from 'react';

interface VariationSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

// Only one allowed variation
const VARIATION_OPTIONS = [1];

const VariationSelector: React.FC<VariationSelectorProps> = ({ value, onChange }) => {
  return (
    <div>
      <label htmlFor="variation-select" className="block text-sm font-medium text-gray-400 mb-1">
        Variations
      </label>
      <select
        id="variation-select"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled
        title="Variations are fixed to 1"
        className="mt-1 block w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {VARIATION_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
};

export default VariationSelector;
