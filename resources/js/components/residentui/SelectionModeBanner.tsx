import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Square, X } from 'lucide-react';

interface SelectionModeBannerProps {
    selectMode: boolean;
    selectedItems: number[];
    totalItems: number;
    selectAllItems: () => void;
    deleteSelected: () => void;
    exitSelectMode: () => void;
    isMobile: boolean;
    itemName: string;
}

export function SelectionModeBanner({
    selectMode,
    selectedItems,
    totalItems,
    selectAllItems,
    deleteSelected,
    exitSelectMode,
    isMobile,
    itemName = "items"
}: SelectionModeBannerProps) {
    if (!selectMode) return null;

    return (
        <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="gap-1">
                        <Square className="h-3 w-3" />
                        Selection Mode
                    </Badge>
                    <span className="text-sm text-blue-700 dark:text-blue-300">
                        {selectedItems.length} {itemName}{selectedItems.length !== 1 ? 's' : ''} selected
                    </span>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    {isMobile ? (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={selectAllItems}
                                className="flex-1 sm:flex-none"
                            >
                                {selectedItems.length === totalItems && totalItems > 0
                                    ? 'Deselect All'
                                    : 'Select All'}
                            </Button>
                            {selectedItems.length > 0 && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={deleteSelected}
                                    className="flex-1 sm:flex-none"
                                >
                                    Delete Selected
                                </Button>
                            )}
                        </>
                    ) : (
                        <>
                            {selectedItems.length > 0 && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={selectAllItems}
                                        className="flex-1 sm:flex-none"
                                    >
                                        {selectedItems.length === totalItems && totalItems > 0
                                            ? 'Deselect All'
                                            : 'Select All'}
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={deleteSelected}
                                        className="flex-1 sm:flex-none"
                                    >
                                        Delete Selected
                                    </Button>
                                </>
                            )}
                        </>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={exitSelectMode}
                        className="flex-1 sm:flex-none"
                    >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    );
}