import React from 'react';
import { Logo } from './Logo';

interface LoadingScreenProps {
  progress: number;
  statusText: string;
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.floor(n)));

const barWidth = (n: number) => `${clamp(n)}%`;

const LoadingScreen: React.FC<LoadingScreenProps> = ({ progress, statusText }) => {
  return (
    <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col items-center justify-center animate-fade-in">
      <div className="w-64 mb-6 opacity-90 animate-logo-fade-in-scale">
        <Logo className="w-full accent-glow" />
      </div>
      <div className="w-3/4 max-w-xl">
        <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden border border-gray-700 progress-track">
          <div
            className="h-full theme-accent progress-fill"
            style={{ transform: `scaleX(${clamp(progress) / 100})` }}
          />
        </div>
        <div className="mt-3 text-sm text-gray-300 text-center">
          {statusText || 'Initializing...'} ({clamp(progress)}%)
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;