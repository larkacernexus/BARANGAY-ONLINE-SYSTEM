import { Button } from '@/components/ui/button';
import { Grid, List } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ViewToggleProps {
    viewMode: 'grid' | 'list';
    onViewChange: (mode: 'grid' | 'list') => void;
    disabled?: boolean;
    className?: string;
}

export function ViewToggle({ viewMode, onViewChange, disabled, className }: ViewToggleProps) {
    return (
        <div className={cn("flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg", className)}>
            <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewChange('grid')}
                disabled={disabled}
                className={cn(
                    "h-8 w-8 p-0",
                    viewMode === 'grid' && "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white"
                )}
            >
                <Grid className="h-4 w-4" />
            </Button>
            <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewChange('list')}
                disabled={disabled}
                className={cn(
                    "h-8 w-8 p-0",
                    viewMode === 'list' && "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white"
                )}
            >
                <List className="h-4 w-4" />
            </Button>
        </div>
    );
}