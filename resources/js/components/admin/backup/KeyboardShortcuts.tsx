import { Button } from '@/components/ui/button';
import { KeyRound } from 'lucide-react';

interface KeyboardShortcutsProps {
  onExitBulkMode: () => void;
  isPerformingBulkAction: boolean;
}

export default function KeyboardShortcuts({
  onExitBulkMode,
  isPerformingBulkAction
}: KeyboardShortcutsProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium">Keyboard Shortcuts</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onExitBulkMode}
          className="h-7 text-xs dark:hover:bg-gray-700"
          disabled={isPerformingBulkAction}
        >
          Exit Bulk Mode
        </Button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-xs text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Ctrl+A</kbd>
          <span>Select page</span>
        </div>
        <div className="flex items-center gap-1">
          <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Shift+Ctrl+A</kbd>
          <span>Select filtered</span>
        </div>
        <div className="flex items-center gap-1">
          <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Delete</kbd>
          <span>Delete selected</span>
        </div>
        <div className="flex items-center gap-1">
          <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Esc</kbd>
          <span>Exit/clear</span>
        </div>
      </div>
    </div>
  );
}