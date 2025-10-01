
import React from 'react';
import { MODEL_NAMES } from '../constants';

interface ModelSelectorProps {
  selectedModel: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onChange }) => {
  return (
    <div>
      <label htmlFor="model-select" className="block text-sm font-medium text-gray-400 mb-1">
        AI Model
      </label>
      <select
        id="model-select"
        value={selectedModel}
        onChange={onChange}
        className="w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
      >
        {MODEL_NAMES.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );
};
