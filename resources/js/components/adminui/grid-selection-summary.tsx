import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { CheckSquare, Square, X } from 'lucide-react';

interface GridSelectionSummaryProps {
    selectedCount: number;
    totalCount: number;
    isSelectAll: boolean;
    onSelectAll: () => void;
    onClearSelection: () => void;
    className?: string;
}

export function GridSelectionSummary({
    selectedCount,
    totalCount,
    isSelectAll,
    onSelectAll,
    onClearSelection,
    className = ''
}: GridSelectionSummaryProps) {
    if (selectedCount === 0) return null;

    return (
        <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-3 ${className}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            checked={isSelectAll}
                            onCheckedChange={onSelectAll}
                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />
                        <Label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                            {isSelectAll ? 'Deselect All' : 'Select All'}
                        </Label>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-semibold text-blue-600">{selectedCount}</span>
                        <span className="mx-1">of</span>
                        <span className="font-semibold">{totalCount}</span>
                        <span className="ml-1">items selected</span>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearSelection}
                    className="h-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                    <X className="h-3.5 w-3.5 mr-1" />
                    Clear
                </Button>
            </div>
        </div>
    );
}