// components/admin/fee-types/FeeTypesBulkActions.tsx
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    PackageCheck,
    PackageX,
    Clipboard,
    FileSpreadsheet,
    Edit,
    Layers,
    X,
    Hash,
    CheckCircle,
    AlertCircle,
    DollarSign,
    MoreVertical,
    Trash2,
    Tag,
    Copy,
    Timer
} from 'lucide-react';
import { BulkOperation, SelectionMode, SelectionStats } from '@/types/fee-types';

interface FeeTypesBulkActionsProps {
    selectedFeeTypes: number[];
    selectionMode: SelectionMode;
    selectionStats: SelectionStats;
    isPerformingBulkAction: boolean;
    isSelectAll: boolean;
    isMobile: boolean;
    onClearSelection: () => void;
    onSelectAllOnPage: () => void;
    onSelectAllFiltered: () => void;
    onSelectAll: () => void;
    onBulkOperation: (operation: BulkOperation) => void;
    onCopySelectedData: () => void;
    setShowBulkDeleteDialog?: (show: boolean) => void;
    setShowBulkStatusDialog?: (show: boolean) => void;
    setShowBulkCategoryDialog?: (show: boolean) => void;
    formatCurrency: (amount: number) => string;
}

export default function FeeTypesBulkActions({
    selectedFeeTypes,
    selectionMode,
    selectionStats,
    isPerformingBulkAction,
    isSelectAll,
    isMobile,
    onClearSelection,
    onSelectAllOnPage,
    onSelectAllFiltered,
    onSelectAll,
    onBulkOperation,
    onCopySelectedData,
    setShowBulkDeleteDialog,
    setShowBulkStatusDialog,
    setShowBulkCategoryDialog,
    formatCurrency
}: FeeTypesBulkActionsProps) {
    const [showBulkActions, setShowBulkActions] = useState(false);
    const bulkActionRef = useRef<HTMLDivElement>(null);

    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full border">
                        <PackageCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="font-medium text-sm">
                            {selectedFeeTypes.length} selected
                        </span>
                        <Badge variant="outline" className="ml-1 h-5 text-xs">
                            {selectionMode === 'page' ? 'Page' : 
                             selectionMode === 'filtered' ? 'Filtered' : 'All'}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClearSelection}
                            className="h-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            <PackageX className="h-3.5 w-3.5 mr-1" />
                            Clear
                        </Button>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onCopySelectedData}
                                    className="h-7"
                                >
                                    <Clipboard className="h-3.5 w-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                Copy selected data as CSV
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-2" ref={bulkActionRef}>
                    <div className="flex items-center gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onBulkOperation('export')}
                                    className="h-8"
                                    disabled={isPerformingBulkAction}
                                >
                                    <FileSpreadsheet className="h-3.5 w-3.5 mr-1" />
                                    Export
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                Export selected fee types
                            </TooltipContent>
                        </Tooltip>
                        
                        {setShowBulkStatusDialog && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowBulkStatusDialog(true)}
                                        className="h-8"
                                        disabled={isPerformingBulkAction}
                                    >
                                        <Edit className="h-3.5 w-3.5 mr-1" />
                                        Edit Status
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Bulk edit selected fee types
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </div>
                    
                    <div className="relative">
                        <Button
                            onClick={() => setShowBulkActions(!showBulkActions)}
                            className="h-8 bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={isPerformingBulkAction}
                        >
                            {isPerformingBulkAction ? (
                                <Timer className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <>
                                    <MoreVertical className="h-3.5 w-3.5 mr-1" />
                                    More
                                </>
                            )}
                        </Button>
                        
                        {showBulkActions && (
                            <div className="absolute right-0 top-full mt-1 z-50 w-56 bg-white dark:bg-gray-800 border rounded-md shadow-lg">
                                <div className="p-2">
                                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1">
                                        BULK ACTIONS
                                    </div>
                                    {setShowBulkCategoryDialog && (
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start h-8 text-sm"
                                            onClick={() => setShowBulkCategoryDialog(true)}
                                        >
                                            <Tag className="h-3.5 w-3.5 mr-2" />
                                            Update Category
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start h-8 text-sm"
                                        onClick={() => onBulkOperation('duplicate')}
                                    >
                                        <Copy className="h-3.5 w-3.5 mr-2" />
                                        Duplicate
                                    </Button>
                                    <div className="border-t my-1"></div>
                                    {setShowBulkDeleteDialog && (
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start h-8 text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => setShowBulkDeleteDialog(true)}
                                        >
                                            <Trash2 className="h-3.5 w-3.5 mr-2" />
                                            Delete Selected
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <Button
                        variant="outline"
                        className="h-8"
                        onClick={onClearSelection}
                        disabled={isPerformingBulkAction}
                    >
                        <X className="h-3.5 w-3.5 mr-1" />
                        Exit
                    </Button>
                </div>
            </div>
            
            {/* Enhanced stats of selected items */}
            {selectedFeeTypes.length > 0 && (
                <div className="mt-3 pt-3 border-t border-blue-100 dark:border-blue-800">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                            <Hash className="h-3.5 w-3.5 text-blue-500" />
                            <span>
                                {selectionStats.total} total
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                            <span>
                                {selectionStats.active} active • {selectionStats.inactive} inactive
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                            <span>
                                {selectionStats.mandatory} mandatory
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <DollarSign className="h-3.5 w-3.5 text-green-500" />
                            <span>
                                {formatCurrency(selectionStats.totalAmount)}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}