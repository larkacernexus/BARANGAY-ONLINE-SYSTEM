// /components/residentui/reports/SelectionModeButton.tsx
import { Button } from '@/components/ui/button';
import { Square } from 'lucide-react';

interface SelectionModeButtonProps {
    selectMode: boolean;
    onToggle: () => void;
}

export const SelectionModeButton = ({ selectMode, onToggle }: SelectionModeButtonProps) => (
    <Button
        variant={selectMode ? 'default' : 'outline'}
        size="sm"
        onClick={onToggle}
        className="gap-2 rounded-xl border-gray-200 dark:border-gray-700"
    >
        <Square className="h-4 w-4" />
        {selectMode ? 'Cancel' : 'Select'}
    </Button>
);