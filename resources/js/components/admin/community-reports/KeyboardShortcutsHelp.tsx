import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Hash } from 'lucide-react';

interface KeyboardShortcutsHelpProps {
    isBulkMode: boolean;
    setIsBulkMode: (value: boolean) => void;
    isPerformingBulkAction?: boolean;
}

export default function KeyboardShortcutsHelp({
    isBulkMode,
    setIsBulkMode,
    isPerformingBulkAction
}: KeyboardShortcutsHelpProps) {
    if (!isBulkMode) return null;

    return (
        <div className="bg-gray-50 rounded-lg p-4 border">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Keyboard Shortcuts</span>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsBulkMode(false)}
                    className="h-7 text-xs"
                    disabled={isPerformingBulkAction}
                >
                    Exit Bulk Mode
                </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-gray-200 rounded">Ctrl+A</kbd>
                    <span>Select page</span>
                </div>
                <div className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-gray-200 rounded">Shift+Ctrl+A</kbd>
                    <span>Select filtered</span>
                </div>
                <div className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-gray-200 rounded">Delete</kbd>
                    <span>Delete selected</span>
                </div>
                <div className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-gray-200 rounded">Esc</kbd>
                    <span>Exit/clear</span>
                </div>
                <div className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-gray-200 rounded">Ctrl+F</kbd>
                    <span>Focus search</span>
                </div>
                <div className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-gray-200 rounded">Ctrl+Shift+B</kbd>
                    <span>Toggle bulk mode</span>
                </div>
            </div>
        </div>
    );
}