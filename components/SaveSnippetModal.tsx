
import React, { useState, useEffect } from 'react';

interface SaveSnippetModalProps {
  content: string;
  onSave: (name: string) => void;
  onCancel: () => void;
}

export const SaveSnippetModal: React.FC<SaveSnippetModalProps> = ({ content, onSave, onCancel }) => {
  const [name, setName] = useState(content.substring(0, 30));

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onCancel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 animate-fade-in" aria-modal="true" role="dialog">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md border border-gray-700" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <h2 className="text-lg font-semibold text-gray-200 mb-2">Save Snippet</h2>
          <p className="text-sm text-gray-400 mb-4">Give your reusable snippet a name.</p>
          
          <div className="mb-4">
            <label htmlFor="snippet-content" className="block text-xs font-medium text-gray-500 mb-1">Content</label>
            <p id="snippet-content" className="w-full bg-gray-900 rounded-md p-2 text-sm text-gray-300 border border-gray-700 max-h-24 overflow-y-auto">
              {content}
            </p>
          </div>

          <div className="mb-6">
            <label htmlFor="snippet-name" className="block text-sm font-medium text-gray-400 mb-1">Name</label>
            <input
              type="text"
              id="snippet-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-md shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
              required
              autoFocus
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-md hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-accent transition-colors"
            >
              Save Snippet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
