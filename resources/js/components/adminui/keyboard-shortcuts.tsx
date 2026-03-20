import { Button } from '@/components/ui/button';
import { KeyRound } from 'lucide-react';
import { ReactNode } from 'react';

interface KeyboardShortcutProps {
    keys: string[];
    description: string;
}

interface KeyboardShortcutsProps {
    shortcuts: KeyboardShortcutProps[];
    onExit?: () => void;
    isPerformingAction?: boolean;
    className?: string;
    children?: ReactNode;
}

export function KeyboardShortcuts({
    shortcuts,
    onExit,
    isPerformingAction = false,
    className = '',
    children
}: KeyboardShortcutsProps) {
    return (
        <div className={`bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border ${className}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Keyboard Shortcuts</span>
                </div>
                {onExit && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onExit}
                        className="h-7 text-xs"
                        disabled={isPerformingAction}
                    >
                        Exit Bulk Mode
                    </Button>
                )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-xs text-gray-600 dark:text-gray-400">
                {shortcuts.map((shortcut, index) => (
                    <div key={index} className="flex items-center gap-1">
                        <div className="flex gap-1">
                            {shortcut.keys.map((key, keyIndex) => (
                                <kbd key={keyIndex} className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
                                    {key}
                                </kbd>
                            ))}
                        </div>
                        <span>{shortcut.description}</span>
                    </div>
                ))}
            </div>
            {children}
        </div>
    );
}

// Make sure to export as default as well for flexibility
export default KeyboardShortcuts;