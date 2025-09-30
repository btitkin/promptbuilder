import React, { useState, useRef } from 'react';
import { ChevronDownIcon, UploadIcon, DownloadIcon } from './icons';
import { InfoTooltip } from './InfoTooltip';

interface SettingsManagerProps {
  onExport: () => void;
  onImport: (file: File) => void;
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({ onExport, onImport }) => {
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
    }
    // Reset file input to allow re-uploading the same file
    if(event.target) {
        event.target.value = '';
    }
  };

  return (
    <div className="bg-gray-900/50 rounded-md border border-gray-700">
      <button 
        onClick={() => setIsOpen(prev => !prev)} 
        className="w-full flex justify-between items-center p-4 focus:outline-none"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-gray-400">Manage Settings</h3>
            <InfoTooltip text="Export all your current settings (except Api keys) to a Json file to save or share. You can import a settings file to load a configuration." />
        </div>
        <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="px-4 pb-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row gap-3">
                <button 
                    onClick={onExport}
                    className="flex-1 flex justify-center items-center gap-2 bg-gray-700 text-gray-200 font-semibold py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-accent transition-colors"
                >
                    <DownloadIcon />
                    Export Settings
                </button>
                <button 
                    onClick={handleImportClick}
                    className="flex-1 flex justify-center items-center gap-2 bg-gray-700 text-gray-200 font-semibold py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-accent transition-colors"
                >
                    <UploadIcon />
                    Import Settings
                </button>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept=".json,application/json" 
                    className="hidden" 
                    aria-hidden="true"
                />
            </div>
        </div>
      )}
    </div>
  );
};
