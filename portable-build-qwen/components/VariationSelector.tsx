
import React from 'react';

interface VariationSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

// Allow variations from 1 to 6
const VARIATION_OPTIONS = [1, 2, 3, 4, 5, 6];

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
        className="mt-1 block w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
