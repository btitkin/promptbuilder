import React, { useState, useEffect } from 'react';

interface LogoAnimationProps {
  show: boolean;
  progress?: number;
  statusText?: string;
}

const fullText = "PromptBuilder";

export const LogoAnimation: React.FC<LogoAnimationProps> = ({ show, progress = 0, statusText = 'Initializing...' }) => {
  const [shouldRender, setShouldRender] = useState(true);
  const [typedText, setTypedText] = useState('');

  // Effect to unmount the component after fade-out
  useEffect(() => {
    if (!show) {
      const timer = setTimeout(() => setShouldRender(false), 500); // Wait for fade-out
      return () => clearTimeout(timer);
    }
  }, [show]);

  // Effect for the typing animation
  useEffect(() => {
    if (show) {
      setTypedText('');
      const startTypingTimer = setTimeout(() => {
        let i = 0;
        const typingInterval = setInterval(() => {
          setTypedText(fullText.slice(0, i + 1));
          i++;
          if (i > fullText.length) {
            clearInterval(typingInterval);
          }
        }, 150);
        return () => clearInterval(typingInterval);
      }, 800); // Delay after logo fades in

      return () => clearTimeout(startTypingTimer);
    }
  }, [show]);
  
  if (!shouldRender) return null;

  return (
    <div className={`fixed inset-0 bg-gray-900 flex items-center justify-center z-50 ${!show ? 'animate-overlay-fade-out' : 'animate-fade-in'}`}>
      <div className="flex flex-col items-center">
        <div className="w-24 mb-4 animate-logo-fade-in-scale">
          <svg
            viewBox="0 0 93.82071 90.531082"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(-16.44901,-9.037832)">
                <g transform="matrix(0.24139876,0,0,0.24139876,-59.770595,-33.792899)">
                    <g>
                        <path
                            fill="#2df6ed"
                            opacity="1"
                            d="m 368.31,178.04 c 2.54,-0.44 5.12,-0.57 7.7,-0.6 88.33,0 176.65,0.03 264.98,-0.01 14.27,-0.13 28.78,4.44 39.68,13.81 5.67,4.69 11.19,9.85 14.75,16.39 5.68,9.43 8.55,20.4 8.96,31.35 -0.04,19.34 -0.02,38.68 0,58.02 0.01,6.78 -1.64,13.93 -6.3,19.07 -4.93,5.67 -12.56,8.88 -20.06,8.43 -6.47,-0.2 -12.53,-3.06 -19.02,-3.05 -8.27,-0.28 -16.32,2.94 -23.04,7.54 -7.45,6.39 -13.24,15.17 -14.81,24.97 -1.83,10.38 -0.85,21.75 5.24,30.64 5.12,7.27 12.29,13.43 20.89,16.12 7.32,2.39 15.32,2.26 22.68,0.04 7.25,-2.08 15.93,-2.74 22.28,2.08 7.33,5.72 12.03,14.76 12.08,24.12 0.12,20.01 -0.05,40.03 0.07,60.04 0.1,8.07 -1.05,16.19 -3.65,23.85 -3.04,8.96 -9.12,16.54 -15.81,23.08 -13.11,12.75 -31.77,19.19 -49.93,18.47 -83.66,-0.07 -167.33,-0.01 -251,-0.03 -6.35,-0.05 -12.85,0.39 -19.04,-1.38 -8.59,-2.69 -17.25,-5.89 -24.32,-11.63 -10.82,-8.97 -19.64,-20.91 -23.03,-34.7 -2.01,-9.41 -1.91,-19.09 -1.84,-28.66 -0.05,-77.66 0,-155.33 -0.02,-233 -0.12,-10.06 1.61,-20.22 5.83,-29.39 4.88,-11.29 13.72,-20.38 23.79,-27.22 6.92,-4.41 14.91,-6.89 22.94,-8.35 m -13.28,33.98 c -8.31,6.68 -12.36,17.53 -12.5,27.98 0.01,83.67 -0.04,167.34 0,251 -0.27,13.56 8.91,25.94 20.96,31.47 8.6,3.89 18.21,4.4 27.5,4.12 82.36,0.05 164.71,0.03 247.06,0.01 10.95,0.18 22.21,-3.65 29.75,-11.81 7.12,-6.93 10.94,-16.9 10.67,-26.79 -0.19,-20.42 0.25,-40.85 -0.22,-61.26 -5.07,0.83 -10.12,1.8 -15.22,2.38 -19.84,1.68 -39.81,-7.54 -52.33,-22.84 -11.31,-12.47 -16.92,-29.55 -16.17,-46.28 -0.39,-22.32 13.36,-42.75 31.16,-55.19 6.22,-3.52 13.01,-6.16 19.93,-7.93 10.83,-1.33 21.92,-0.92 32.57,1.54 0.56,-17.8 0.09,-35.61 0.27,-53.42 0.18,-9.21 -1.43,-18.9 -7.19,-26.36 -7.83,-10.67 -21.17,-16.33 -34.22,-16.27 -85.03,-0.02 -170.06,-0.01 -255.09,0.01 -9.71,-0.06 -19.76,2.85 -26.93,9.64 z" />
                        <path
                            fill="#2df6ed"
                            opacity="1"
                            d="m 410.52,297.53 c 3.49,-7.18 14.1,-9.38 20.2,-4.25 21.4,17.6 42.58,35.48 64.23,52.79 3.31,3.01 7.03,5.61 9.92,9.06 3.64,4.42 3.52,11.36 0.03,15.83 -2.75,3.63 -6.71,6.01 -10.23,8.79 -19.74,16.93 -39.79,33.5 -59.74,50.18 -3.13,2.65 -6.74,5.1 -10.94,5.44 -5.83,0.56 -11.34,-3.22 -14.03,-8.2 -1.84,-4.72 -0.51,-10.51 3.42,-13.79 19.48,-17.34 40.22,-33.2 59.59,-50.65 -11.37,-9.51 -23.06,-18.66 -34.09,-28.57 -8.34,-7.02 -16.81,-13.89 -25.21,-20.83 -4.7,-3.62 -5.68,-10.64 -3.15,-15.8 z" />
                        <path
                            fill="#2df6ed"
                            opacity="1"
                            d="m 503.45,416.51 c 2.05,-0.89 4.34,-0.84 6.53,-0.9 18.02,0.08 36.05,0.06 54.07,0.01 5.28,-0.41 10.12,3.25 12.27,7.89 1.26,4.94 0.77,10.96 -3.34,14.49 -3.37,3.47 -8.48,3.61 -12.98,3.46 -17.02,-0.16 -34.04,0.04 -51.05,-0.07 -6.01,0.09 -12.45,-4.02 -13.21,-10.31 -1.36,-5.97 2.35,-12.06 7.71,-14.57 z" />
                    </g>
                </g>
            </g>
          </svg>
        </div>
        
        <div className="h-12 flex items-center"> {/* Container to prevent layout shift */}
          <h1 className="relative text-4xl font-light text-white tracking-widest" style={{ fontFamily: "'Helvetica Light', 'Helvetica', 'Arial', sans-serif" }}>
            {typedText}
            <span className="absolute text-accent animate-blink">▋</span>
          </h1>
        </div>

        {/* Progress section */}
        <div className="w-64 mt-4">
          <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden border border-gray-700 progress-track">
            <div
              className="h-full theme-accent progress-fill"
              style={{ transform: `scaleX(${Math.max(0, Math.min(100, Math.floor(progress))) / 100})` }}
            />
          </div>
          <div className="mt-3 text-xs text-gray-300 text-center">
            {statusText} ({Math.max(0, Math.min(100, Math.floor(progress)))}%)
          </div>
        </div>
      </div>
    </div>
  );
};
