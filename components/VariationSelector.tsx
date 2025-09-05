
import React from 'react';

interface VariationSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

const VARIATION_OPTIONS = [1, 3, 5];

export const VariationSelector: React.FC<VariationSelectorProps> = ({ value, onChange }) => {
  return (
    <div>
      <label htmlFor="variation-select" className="block text-sm font-medium text-gray-400 mb-1">
        Variations
      </label>
      <select
        id="variation-select"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
      >
        {VARIATION_OPTIONS.map((num) => (
          <option key={num} value={num}>
            {num} variation{num > 1 ? 's' : ''}
          </option>
        ))}
      </select>
    </div>
  );
};
