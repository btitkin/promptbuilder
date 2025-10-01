import React from 'react';

interface AgeVerificationModalProps {
  onConfirm: () => void;
  onDeny: () => void;
}

export const AgeVerificationModal: React.FC<AgeVerificationModalProps> = ({ onConfirm, onDeny }) => {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50 animate-fade-in" aria-modal="true" role="dialog">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-md border border-gray-700 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-2">Age Verification</h2>
        <p className="text-gray-400 mb-4">
          This website may contain content of an adult nature.
        </p>
        <p className="text-lg text-gray-200 mb-6">
          Are you 18 years of age or older?
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={onDeny}
            className="w-full sm:w-auto px-8 py-3 text-base font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500 transition-colors"
          >
            No, Exit
          </button>
          <button
            onClick={onConfirm}
            className="w-full sm:w-auto px-8 py-3 text-base font-medium text-white bg-accent rounded-md hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-accent transition-colors"
          >
            Yes, I am 18+
          </button>
        </div>
      </div>
    </div>
  );
};