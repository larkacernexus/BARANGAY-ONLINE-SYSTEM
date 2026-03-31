// components/admin/clearances/ClearancesBulkActions.tsx

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
    FileSpreadsheet, 
    Printer, 
    PlayCircle, 
    CheckCircle, 
    FileText, 
    Trash2, 
    Download,
    Copy,
    DollarSign,
    CheckSquare,
    Square
} from 'lucide-react';
import { BulkOperation, BulkActionItem } from '@/types/portal/clearances/clearance.types';



interface ClearancesBulkActionsProps {
    selectedClearances: number[];
    selectionMode: 'page' | 'filtered' | 'all';
    selectionStats?: {
        pending?: number;
        processing?: number;
        approved?: number;
        totalValue?: number;
    };
    isPerformingBulkAction: boolean;
    isSelectAll: boolean;
    isMobile?: boolean;
    totalItems?: number;
    
    // Actions
    onClearSelection: () => void;
    onSelectAllOnPage: () => void;
    onSelectAllFiltered: () => void;
    onSelectAll: () => void;
    onBulkOperation: (operation: BulkOperation, customData?: any) => Promise<void>;
    onCopySelectedData: () => void;
    setShowBulkDeleteDialog?: (show: boolean) => void;
    
    // Bulk actions configuration (optional for customization)
    bulkActions?: {
        primary?: BulkActionItem[];
        secondary?: BulkActionItem[];
        destructive?: BulkActionItem[];
    };
}

export default function ClearancesBulkActions({
    selectedClearances,
    selectionMode,
    selectionStats,
    isPerformingBulkAction,
    isSelectAll,
    isMobile = false,
    totalItems = 0,
    onClearSelection,
    onSelectAllOnPage,
    onSelectAllFiltered,
    onSelectAll,
    onBulkOperation,
    onCopySelectedData,
    setShowBulkDeleteDialog,
    bulkActions: customBulkActions
}: ClearancesBulkActionsProps) {
    
    // Default bulk actions for clearances
    const defaultBulkActions = {
        primary: [
            {
                label: 'Export',
                icon: <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('export' as BulkOperation),
                tooltip: 'Export selected clearances',
                variant: 'default' as const,
                disabled: false // Add disabled property
            },
            {
                label: 'Print',
                icon: <Printer className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('print' as BulkOperation),
                tooltip: 'Print selected clearances',
                variant: 'default' as const,
                disabled: false
            }
        ],
        secondary: [
            {
                label: 'Mark as Processing',
                icon: <PlayCircle className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('process' as BulkOperation),
                tooltip: 'Mark selected as processing',
                variant: 'outline' as const,
                disabled: false
            },
            {
                label: 'Approve',
                icon: <CheckCircle className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('approve' as BulkOperation),
                tooltip: 'Approve selected clearances',
                variant: 'outline' as const,
                disabled: false
            },
            {
                label: 'Issue',
                icon: <FileText className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('issue' as BulkOperation),
                tooltip: 'Issue selected clearances',
                variant: 'outline' as const,
                disabled: false
            },
            {
                label: 'Export CSV',
                icon: <Download className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('export' as BulkOperation),
                tooltip: 'Export as CSV',
                variant: 'outline' as const,
                disabled: false
            },
            {
                label: 'Copy Data',
                icon: <Copy className="h-3.5 w-3.5 mr-1.5" />,
                onClick: onCopySelectedData,
                tooltip: 'Copy selected data to clipboard',
                variant: 'outline' as const,
                disabled: false
            }
        ],
        destructive: [
            {
                label: 'Delete',
                icon: <Trash2 className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => setShowBulkDeleteDialog?.(true),
                tooltip: 'Delete selected clearances',
                variant: 'destructive' as const,
                disabled: false
            }
        ]
    };

    const bulkActions = customBulkActions || defaultBulkActions;

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Left side: Selection info */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                                {selectedClearances.length}
                            </span>
                        </div>
                        <div>
                            <span className="font-medium text-sm sm:text-base">
                                {selectedClearances.length} clearance(s) selected
                            </span>
                            {selectionMode !== 'page' && (
                                <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                                    {selectionMode === 'filtered' ? 'Filtered' : 'All'}
                                </span>
                            )}
                        </div>
                    </div>
                    
                    {/* Selection Stats */}
                    {selectionStats && (
                        <div className="hidden sm:flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            {selectionStats.pending && selectionStats.pending > 0 && (
                                <span className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                    {selectionStats.pending} pending
                                </span>
                            )}
                            {selectionStats.processing && selectionStats.processing > 0 && (
                                <span className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    {selectionStats.processing} processing
                                </span>
                            )}
                            {selectionStats.approved && selectionStats.approved > 0 && (
                                <span className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    {selectionStats.approved} approved
                                </span>
                            )}
                            {selectionStats.totalValue && selectionStats.totalValue > 0 && (
                                <span className="flex items-center gap-1">
                                    <DollarSign className="w-3 h-3 text-purple-500" />
                                    ₱{selectionStats.totalValue.toLocaleString()}
                                </span>
                            )}
                        </div>
                    )}
                </div>
                
                {/* Right side: Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    {/* Selection Options */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onClearSelection}
                            disabled={isPerformingBulkAction}
                            className="text-xs h-8"
                        >
                            Clear Selection
                        </Button>
                        
                        {/* Select All Dropdown */}
                        <div className="relative group">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={isPerformingBulkAction}
                                className="text-xs h-8"
                            >
                                {isSelectAll ? (
                                    <>
                                        <CheckSquare className="h-3.5 w-3.5 mr-1.5" />
                                        Deselect
                                    </>
                                ) : (
                                    <>
                                        <Square className="h-3.5 w-3.5 mr-1.5" />
                                        Select...
                                    </>
                                )}
                            </Button>
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                <div className="py-1">
                                    <button
                                        onClick={onSelectAllOnPage}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                        disabled={isPerformingBulkAction}
                                    >
                                        {isSelectAll ? '✓ ' : ''}
                                        {isSelectAll ? 'Deselect Page' : 'Select Page'}
                                    </button>
                                    <button
                                        onClick={onSelectAllFiltered}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                        disabled={isPerformingBulkAction}
                                    >
                                        Select All Filtered ({totalItems})
                                    </button>
                                    <button
                                        onClick={onSelectAll}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                        disabled={isPerformingBulkAction}
                                    >
                                        Select All Clearances
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Bulk Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Primary Actions */}
                        {bulkActions.primary?.map((action, index) => (
                            <Tooltip key={index}>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={action.variant || 'default'}
                                        size="sm"
                                        onClick={action.onClick}
                                        disabled={isPerformingBulkAction || action.disabled}
                                        className="text-xs h-8"
                                    >
                                        {action.icon}
                                        {!isMobile && action.label}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{action.tooltip}</p>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                        
                        {/* More Actions Dropdown */}
                        {bulkActions.secondary && bulkActions.secondary.length > 0 && (
                            <div className="relative group">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={isPerformingBulkAction}
                                    className="text-xs h-8"
                                >
                                    More...
                                </Button>
                                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                    <div className="py-1">
                                        {bulkActions.secondary.map((action, index) => (
                                            <button
                                                key={index}
                                                onClick={action.onClick}
                                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                                disabled={isPerformingBulkAction || action.disabled}
                                            >
                                                {action.icon}
                                                {action.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Destructive Actions */}
                        {bulkActions.destructive?.map((action, index) => (
                            <Tooltip key={index}>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={action.variant || 'destructive'}
                                        size="sm"
                                        onClick={action.onClick}
                                        disabled={isPerformingBulkAction || action.disabled}
                                        className="text-xs h-8"
                                    >
                                        {action.icon}
                                        {!isMobile && action.label}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{action.tooltip}</p>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}