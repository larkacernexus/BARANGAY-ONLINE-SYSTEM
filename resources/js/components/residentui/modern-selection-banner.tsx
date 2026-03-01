import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Square, X } from 'lucide-react';

interface ModernSelectionBannerProps {
    selectedCount: number;
    totalCount: number;
    onSelectAll: () => void;
    onDeselectAll: () => void;
    onCancel: () => void;
    onDelete?: () => void;
    deleteLabel?: string;
}

export const ModernSelectionBanner = ({
    selectedCount,
    totalCount,
    onSelectAll,
    onDeselectAll,
    onCancel,
    onDelete,
    deleteLabel = "Delete Selected"
}: ModernSelectionBannerProps) => {
    const allSelected = selectedCount === totalCount && totalCount > 0;

    return (
        <div className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 animate-slide-down">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="gap-1 bg-white dark:bg-gray-800">
                        <Square className="h-3 w-3" />
                        Selection Mode
                    </Badge>
                    <span className="text-sm text-blue-700 dark:text-blue-300">
                        {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
                    </span>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={allSelected ? onDeselectAll : onSelectAll}
                        className="flex-1 sm:flex-none bg-white dark:bg-gray-800"
                    >
                        {allSelected ? 'Deselect All' : 'Select All'}
                    </Button>
                    {selectedCount > 0 && onDelete && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={onDelete}
                            className="flex-1 sm:flex-none"
                        >
                            {deleteLabel}
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onCancel}
                        className="flex-1 sm:flex-none"
                    >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    );
};