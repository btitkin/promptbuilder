import React from 'react';
import { InfoTooltip } from './InfoTooltip';
import { Logo } from './Logo';

export const Header: React.FC = () => {
  return (
    <header className="text-center">
      <div className="flex items-center justify-center gap-2">
        <Logo className="h-12 w-auto" />
        <InfoTooltip
          text="Prompt Builder intelligently transforms your simple descriptions into perfectly structured, model-specific prompts. It handles complex syntax, BREAK statements, and content rules, saving you time and maximizing the quality of your results."
        />
      </div>
      <p className="mt-2 text-lg text-gray-400">
        Transform simple ideas into perfectly structured AI prompts.
      </p>
      <a
        href="https://huggingface.co/spaces/ovi054/image-to-prompt"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-block text-sm text-indigo-500 hover:text-indigo-400 transition-colors"
      >
        You need image to prompt? Click here and then come back!
      </a>
    </header>
  );
};