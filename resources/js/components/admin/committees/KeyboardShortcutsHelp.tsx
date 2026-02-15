// components/admin/committees/KeyboardShortcutsHelp.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KeyRound } from 'lucide-react';

interface KeyboardShortcutsHelpProps {
    isBulkMode: boolean;
    isPerformingBulkAction: boolean;
    onExitBulkMode: () => void;
}

export function KeyboardShortcutsHelp({
    isBulkMode,
    isPerformingBulkAction,
    onExitBulkMode
}: KeyboardShortcutsHelpProps) {
    if (!isBulkMode) return null;

    return (
        <Card className="bg-gray-50 border">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <KeyRound className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">Keyboard Shortcuts</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onExitBulkMode}
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
                </div>
            </CardContent>
        </Card>
    );
}