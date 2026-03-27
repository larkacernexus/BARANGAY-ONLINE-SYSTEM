// components/admin/users/UsersKeyboardShortcuts.tsx
import { Button } from '@/components/ui/button';
import { KeyRound } from 'lucide-react';
import { UsersKeyboardShortcutsProps } from '@/types/admin/users/user-types';

export default function UsersKeyboardShortcuts({
  isBulkMode,
  setIsBulkMode,
  isPerformingBulkAction,
  onSelectAllPage,
  onSelectAllFiltered,
  onDelete,
  onClearSelection
}: UsersKeyboardShortcutsProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Keyboard Shortcuts</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsBulkMode(false)}
          className="h-7 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          disabled={isPerformingBulkAction}
        >
          Exit Bulk Mode (Esc)
        </Button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-xs text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded font-mono text-gray-800 dark:text-gray-200">Ctrl+A</kbd>
          <span onClick={onSelectAllPage} className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400">Select page</span>
        </div>
        <div className="flex items-center gap-1">
          <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded font-mono text-gray-800 dark:text-gray-200">Shift+Ctrl+A</kbd>
          <span onClick={onSelectAllFiltered} className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400">Select filtered</span>
        </div>
        <div className="flex items-center gap-1">
          <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded font-mono text-gray-800 dark:text-gray-200">Delete</kbd>
          <span onClick={onDelete} className="cursor-pointer hover:text-red-600 dark:hover:text-red-400">Delete selected</span>
        </div>
        <div className="flex items-center gap-1">
          <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded font-mono text-gray-800 dark:text-gray-200">Esc</kbd>
          <span onClick={onClearSelection} className="cursor-pointer hover:text-gray-900 dark:hover:text-gray-200">Exit/Clear</span>
        </div>
      </div>
    </div>
  );
}