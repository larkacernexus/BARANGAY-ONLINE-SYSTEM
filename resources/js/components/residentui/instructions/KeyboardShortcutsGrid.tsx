// /components/residentui/instructions/KeyboardShortcutsGrid.tsx
import React from 'react';

interface Shortcut {
  key: string;
  description: string;
}

interface KeyboardShortcutsGridProps {
  shortcuts: Shortcut[];
}

export const KeyboardShortcutsGrid: React.FC<KeyboardShortcutsGridProps> = ({ shortcuts }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
      {shortcuts.map((shortcut, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-2 sm:p-3 dark:border-gray-700 dark:bg-gray-900 gap-2"
        >
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-words flex-1">{shortcut.description}</span>
          <kbd className="rounded bg-gray-100 px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs sm:text-sm font-mono font-semibold text-gray-900 dark:bg-gray-700 dark:text-white whitespace-nowrap flex-shrink-0">
            {shortcut.key}
          </kbd>
        </div>
      ))}
    </div>
  );
};