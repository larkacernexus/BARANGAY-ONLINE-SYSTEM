// components/admin/clearance-types/ClearanceTypesBulkActions.tsx
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
    ClipboardCopy,
    PlayCircle,
    PauseCircle,
    Download,
    Edit,
    Layers,
    X,
    CheckCircle,
    XCircle,
    CreditCard,
    Shield,
    Globe,
    Timer,
    DollarSign,
    Copy,
    Trash2,
    MoreVertical,
    Rows,
    Filter,
    Hash,
    RotateCcw
} from 'lucide-react';
import { BulkOperation, SelectionMode, SelectionStats } from '@/types/clearance-types';

interface ClearanceTypesBulkActionsProps {
    selectedTypes: number[];
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
    onSmartBulkToggle: () => void;
    setShowBulkDeleteDialog?: (show: boolean) => void;
    setShowBulkEditDialog?: (show: boolean) => void;
}

export default function ClearanceTypesBulkActions({
    selectedTypes,
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
    onSmartBulkToggle,
    setShowBulkDeleteDialog,
    setShowBulkEditDialog
}: ClearanceTypesBulkActionsProps) {
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [showSelectionOptions, setShowSelectionOptions] = useState(false);
    const bulkActionRef = useRef<HTMLDivElement>(null);
    const selectionRef = useRef<HTMLDivElement>(null);

    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-900 px-3 py-1.5 rounded-full border">
                        <PackageCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="font-medium text-sm">
                            {selectedTypes.length} selected
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
                                    <ClipboardCopy className="h-3.5 w-3.5" />
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
                                    onClick={onSmartBulkToggle}
                                    className="h-8"
                                    disabled={isPerformingBulkAction}
                                >
                                    {selectionStats.inactive > 0 ? (
                                        <>
                                            <PlayCircle className="h-3.5 w-3.5 mr-1" />
                                            Activate
                                        </>
                                    ) : (
                                        <>
                                            <PauseCircle className="h-3.5 w-3.5 mr-1" />
                                            Deactivate
                                        </>
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                Smart toggle based on selection
                            </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onBulkOperation('export')}
                                    className="h-8"
                                    disabled={isPerformingBulkAction}
                                >
                                    <Download className="h-3.5 w-3.5 mr-1" />
                                    Export
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                Export selected items
                            </TooltipContent>
                        </Tooltip>
                        
                        {setShowBulkEditDialog && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowBulkEditDialog(true)}
                                        className="h-8"
                                        disabled={isPerformingBulkAction}
                                    >
                                        <Edit className="h-3.5 w-3.5 mr-1" />
                                        Edit
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Bulk edit selected items
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </div>
                    
                    <div className="relative" ref={selectionRef}>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowSelectionOptions(!showSelectionOptions)}
                            className="h-8"
                        >
                            <Layers className="h-3.5 w-3.5 mr-1" />
                            Select
                        </Button>
                        {showSelectionOptions && (
                            <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-white dark:bg-gray-900 border rounded-md shadow-lg">
                                <div className="p-2">
                                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1">
                                        SELECTION OPTIONS
                                    </div>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start h-8 text-sm"
                                        onClick={onSelectAllOnPage}
                                    >
                                        <Rows className="h-3.5 w-3.5 mr-2" />
                                        Current Page
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start h-8 text-sm"
                                        onClick={onSelectAllFiltered}
                                    >
                                        <Filter className="h-3.5 w-3.5 mr-2" />
                                        All Filtered
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start h-8 text-sm"
                                        onClick={onSelectAll}
                                    >
                                        <Hash className="h-3.5 w-3.5 mr-2" />
                                        All Items
                                    </Button>
                                    <div className="border-t my-1"></div>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start h-8 text-sm text-red-600 hover:text-red-700"
                                        onClick={onClearSelection}
                                    >
                                        <RotateCcw className="h-3.5 w-3.5 mr-2" />
                                        Clear Selection
                                    </Button>
                                </div>
                            </div>
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
                            <div className="absolute right-0 top-full mt-1 z-50 w-56 bg-white dark:bg-gray-900 border rounded-md shadow-lg">
                                <div className="p-2">
                                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1">
                                        BULK ACTIONS
                                    </div>
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
                    >
                        <X className="h-3.5 w-3.5 mr-1" />
                        Exit
                    </Button>
                </div>
            </div>
            
            {/* Enhanced stats of selected items */}
            {selectedTypes.length > 0 && (
                <div className="mt-3 pt-3 border-t border-blue-100 dark:border-blue-800">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                            <span>
                                {selectionStats.active} active
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <XCircle className="h-3.5 w-3.5 text-gray-500" />
                            <span>
                                {selectionStats.inactive} inactive
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CreditCard className="h-3.5 w-3.5 text-amber-500" />
                            <span>
                                {selectionStats.paid} paid • {selectionStats.free} free
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Shield className="h-3.5 w-3.5 text-purple-500" />
                            <span>
                                {selectionStats.needsApproval} need approval
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Globe className="h-3.5 w-3.5 text-cyan-500" />
                            <span>
                                {selectionStats.onlineOnly} online only
                            </span>
                        </div>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                            <Timer className="h-3 w-3" />
                            <span>Avg processing: {
                                selectionStats.avgProcessingDays.toFixed(1)
                            } days</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            <span>Total value: ${
                                selectionStats.totalValue.toFixed(2)
                            }</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}