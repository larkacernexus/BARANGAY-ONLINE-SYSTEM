// components/adminui/select-all-float.tsx
import { Button } from '@/components/ui/button';
import { CheckSquare, Square } from 'lucide-react';

interface SelectAllFloatProps {
    isSelectAll: boolean;
    onSelectAll: () => void;
    selectedCount: number;
    totalCount: number;
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export default function SelectAllFloat({
    isSelectAll,
    onSelectAll,
    selectedCount,
    totalCount,
    position = 'bottom-right'
}: SelectAllFloatProps) {
    const positionClasses = {
        'bottom-right': 'bottom-4 right-4',
        'bottom-left': 'bottom-4 left-4',
        'top-right': 'top-4 right-4',
        'top-left': 'top-4 left-4',
    };

    return (
        <div className={`fixed ${positionClasses[position]} z-40`}>
            <Button
                onClick={onSelectAll}
                className="shadow-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full flex items-center gap-2"
                size="sm"
            >
                {isSelectAll ? (
                    <CheckSquare className="h-4 w-4" />
                ) : (
                    <Square className="h-4 w-4" />
                )}
                <span>
                    {isSelectAll ? 'Deselect All' : 'Select All'} ({selectedCount}/{totalCount})
                </span>
            </Button>
        </div>
    );
}