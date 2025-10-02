import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { Slider } from './Slider';

export interface TuningParameters {
  temperature: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

export interface ModelTuningProps {
  parameters: TuningParameters;
  onParametersChange: (parameters: TuningParameters) => void;
}

const DEFAULT_PARAMETERS: TuningParameters = {
  temperature: 0.7,
  topP: 1.0,
  frequencyPenalty: 0.0,
  presencePenalty: 0.0,
};

export const ModelTuning: React.FC<ModelTuningProps> = ({ parameters, onParametersChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [temperatureDisabled, setTemperatureDisabled] = useState(false);
  const [topPDisabled, setTopPDisabled] = useState(false);

  // Load parameters from localStorage on component mount
  useEffect(() => {
    const savedParams = localStorage.getItem('modelTuningParameters');
    if (savedParams) {
      try {
        const parsed = JSON.parse(savedParams);
        onParametersChange(parsed);
        
        // Set disabled states based on loaded values
        if (parsed.topP !== DEFAULT_PARAMETERS.topP) {
          setTemperatureDisabled(true);
        } else if (parsed.temperature !== DEFAULT_PARAMETERS.temperature) {
          setTopPDisabled(true);
        }
      } catch (error) {
        console.error('Failed to parse saved tuning parameters:', error);
      }
    }
  }, []);

  // Save parameters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('modelTuningParameters', JSON.stringify(parameters));
  }, [parameters]);

  const handleParameterChange = (key: keyof TuningParameters, value: number) => {
    const newParameters = { ...parameters, [key]: value };

    // Handle mutual exclusivity between Temperature and Top-p
    if (key === 'temperature') {
      if (value !== DEFAULT_PARAMETERS.temperature) {
        // Temperature changed from default - disable Top-p and reset it
        newParameters.topP = DEFAULT_PARAMETERS.topP;
        setTopPDisabled(true);
        setTemperatureDisabled(false);
      } else {
        // Temperature reset to default - enable Top-p
        setTopPDisabled(false);
        setTemperatureDisabled(false);
      }
    } else if (key === 'topP') {
      if (value !== DEFAULT_PARAMETERS.topP) {
        // Top-p changed from default - disable Temperature and reset it
        newParameters.temperature = DEFAULT_PARAMETERS.temperature;
        setTemperatureDisabled(true);
        setTopPDisabled(false);
      } else {
        // Top-p reset to default - enable Temperature
        setTemperatureDisabled(false);
        setTopPDisabled(false);
      }
    }

    onParametersChange(newParameters);
  };

  const handleReset = () => {
    onParametersChange(DEFAULT_PARAMETERS);
    setTemperatureDisabled(false);
    setTopPDisabled(false);
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-600 mb-6">
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-700 transition-colors"
        aria-expanded={!isCollapsed}
      >
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
          </svg>
          <h3 className="text-lg font-semibold text-white">Model Tuning</h3>
        </div>
        {isCollapsed ? (
          <ChevronDown className="w-5 h-5 text-gray-300" />
        ) : (
          <ChevronUp className="w-5 h-5 text-gray-300" />
        )}
      </button>

      {!isCollapsed && (
        <div className="px-6 pb-6 space-y-6 bg-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`space-y-2 ${temperatureDisabled ? 'opacity-50' : ''}`}>
              <Slider
                label="Temperature"
                value={parameters.temperature}
                min={0.1}
                max={2.0}
                step={0.1}
                onChange={(value) => handleParameterChange('temperature', value)}
                disabled={temperatureDisabled}
              />
              <p className="text-xs text-gray-300">
                Controls randomness. Higher = more creative, lower = more focused.
                {temperatureDisabled && " (Disabled - Top-p is active)"}
              </p>
            </div>

            <div className={`space-y-2 ${topPDisabled ? 'opacity-50' : ''}`}>
              <Slider
                label="Top-p"
                value={parameters.topP}
                min={0.1}
                max={1.0}
                step={0.1}
                onChange={(value) => handleParameterChange('topP', value)}
                disabled={topPDisabled}
              />
              <p className="text-xs text-gray-300">
                Nucleus sampling. Lower = more focused vocabulary.
                {topPDisabled && " (Disabled - Temperature is active)"}
              </p>
            </div>

            <div className="space-y-2">
              <Slider
                label="Frequency Penalty"
                value={parameters.frequencyPenalty}
                min={-2.0}
                max={2.0}
                step={0.1}
                onChange={(value) => handleParameterChange('frequencyPenalty', value)}
              />
              <p className="text-xs text-gray-300">
                Reduces repetition of frequent tokens. Positive = less repetition.
              </p>
            </div>

            <div className="space-y-2">
              <Slider
                label="Presence Penalty"
                value={parameters.presencePenalty}
                min={-2.0}
                max={2.0}
                step={0.1}
                onChange={(value) => handleParameterChange('presencePenalty', value)}
              />
              <p className="text-xs text-gray-300">
                Encourages new topics. Positive = more diverse content.
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-600">
            <div className="text-sm text-gray-300">
              <strong>Note:</strong> Temperature and Top-p are mutually exclusive. Only one can be active at a time.
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-200 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to defaults
            </button>
          </div>
        </div>
      )}
    </div>
  );
};