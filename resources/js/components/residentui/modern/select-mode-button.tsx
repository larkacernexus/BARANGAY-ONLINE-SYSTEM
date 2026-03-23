import { Button } from '@/components/ui/button';
import { Square } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectModeButtonProps {
    isActive: boolean;
    onToggle: () => void;
    disabled?: boolean;
    className?: string;
}

export function SelectModeButton({ isActive, onToggle, disabled, className }: SelectModeButtonProps) {
    return (
        <Button
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            onClick={onToggle}
            disabled={disabled}
            className={cn("gap-2 border-gray-200 dark:border-gray-700", className)}
        >
            <Square className="h-4 w-4" />
            {isActive ? 'Cancel' : 'Select'}
        </Button>
    );
}