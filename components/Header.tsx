import React, { useEffect, useState } from 'react';
import { InfoTooltip } from './InfoTooltip';
import { Logo } from './Logo';

export const Header: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>(
    () => (document.documentElement.getAttribute('data-theme') as 'dark' | 'light') || 'dark'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('theme', theme);
    } catch {}
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <header className="text-center">
      <div className="flex items-center justify-center gap-2">
        <Logo className="h-12 w-auto" />
        <InfoTooltip
          text="Prompt Builder intelligently transforms your simple descriptions into perfectly structured, model-specific prompts. It handles complex syntax, BREAK statements, and content rules, saving you time and maximizing the quality of your results."
        />
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          className="ml-3 inline-flex items-center gap-2 px-3 py-1 rounded-md theme-border border hover:opacity-90 focus:outline-none theme-focus"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <span className="text-xs font-medium">{theme === 'dark' ? 'Dark' : 'Light'}</span>
        </button>
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