

import React from 'react';
import { InfoIcon } from './icons';

interface InfoTooltipProps {
  text: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ text }) => {
  return (
    <div className="relative flex items-center group" tabIndex={0} role="tooltip" aria-label={text}>
      <span className="text-gray-500 hover:text-gray-300 transition-colors">
        <InfoIcon />
      </span>
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 p-3 bg-gray-700 text-gray-200 text-xs rounded-md shadow-lg
                      opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none z-10 whitespace-pre-wrap">
        {text}
      </div>
    </div>
  );
};