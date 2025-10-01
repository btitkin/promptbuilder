
import React from 'react';
import { TrashIcon } from './icons';

interface HistoryProps {
  history: string[];
  onSelect: (prompt: string) => void;
  onClear: () => void;
}

export const History: React.FC<HistoryProps> = ({ history, onSelect, onClear }) => {
  if (history.length === 0) {
    return null;
  }

  const handleClearClick = React.useCallback(() => {
    if (window.confirm('Clear all history? This action cannot be undone.')) {
      onClear();
    }
  }, [onClear]);
  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-gray-400">
          History
        </h3>
        {history.length > 0 && (
          <button
            onClick={handleClearClick}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500 rounded-md px-2 py-1"
            aria-label="Clear history"
          >
            <TrashIcon />
            Clear
          </button>
        )}
      </div>
      <div className="bg-gray-900 rounded-md border border-gray-700 max-h-48 overflow-y-auto shadow-inner">
        <ul className="divide-y divide-gray-700/50">
          {history.map((prompt, index) => (
            <li key={index}>
              <button
                onClick={() => onSelect(prompt)}
                className="w-full text-left p-3 text-gray-300 hover:bg-gray-800 transition-colors focus:outline-none focus:bg-gray-800"
                title="Click to use this prompt"
              >
                <p className="font-mono text-xs truncate">
                  {prompt.replace(/\n/g, ' ')}
                </p>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
