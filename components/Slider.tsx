import React from 'react';

interface SliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export const Slider: React.FC<SliderProps> = ({ 
  label, 
  value, 
  min = 1, 
  max = 10, 
  step = 1, 
  onChange, 
  disabled = false 
}) => {
  return (
    <div>
      <label className={`block text-sm font-medium mb-1 ${disabled ? 'text-gray-500' : 'text-gray-200'}`}>
        {label} <span className={`font-bold ${disabled ? 'text-gray-500' : 'text-blue-400'}`}>{value}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
          disabled 
            ? 'bg-gray-600 cursor-not-allowed' 
            : 'bg-gray-600 hover:bg-gray-500 accent-blue-400'
        }`}
      />
    </div>
  );
};
