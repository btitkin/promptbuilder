import React from 'react';

interface SliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
}

export const Slider: React.FC<SliderProps> = ({ label, value, min = 1, max = 10, step = 1, onChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-1">{label} <span className="font-bold text-accent">{value}</span></label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-accent"
      />
    </div>
  );
};
