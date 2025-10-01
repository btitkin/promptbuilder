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
    <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col items-center justify-center">
      <div className="w-64 mb-6 opacity-90">
        <Logo className="w-full" />
      </div>
      <div className="w-3/4 max-w-xl">
        <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden border border-gray-700">
          <div className="h-full bg-accent transition-all" style={{ width: barWidth(progress) }} />
        </div>
        <div className="mt-3 text-sm text-gray-300 text-center">
          {statusText || 'Initializing...'} ({clamp(progress)}%)
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;