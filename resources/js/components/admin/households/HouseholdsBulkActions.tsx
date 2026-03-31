// components/admin/households/HouseholdsBulkActions.tsx

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
    Download, 
    Printer, 
    Edit, 
    Trash2, 
    Copy, 
    Users, 
    Globe,
    CheckSquare,
    Square
} from 'lucide-react';
import { BulkAction } from '@/types/admin/households/household.types';

interface BulkActionItem {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    tooltip: string;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    disabled?: boolean;
}

interface HouseholdBulkActionsProps {
    selectedHouseholds: number[];
    selectionMode: 'page' | 'filtered' | 'all';
    selectionStats?: {
        active?: number;
        inactive?: number;
        pending?: number;
        total?: number;
        totalMembers?: number;
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
    onBulkOperation: (operation: BulkAction) => void; // Changed to BulkAction
    onCopySelectedData: () => void;
    setShowBulkDeleteDialog?: (show: boolean) => void;
    
    // Bulk actions configuration (optional for customization)
    bulkActions?: {
        primary?: BulkActionItem[];
        secondary?: BulkActionItem[];
        destructive?: BulkActionItem[];
    };
}

export default function HouseholdBulkActions({
    selectedHouseholds,
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
}: HouseholdBulkActionsProps) {
    
    // Default bulk actions for households
    const defaultBulkActions = {
        primary: [
            {
                label: 'Export',
                icon: <Download className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('export' as BulkAction),
                tooltip: 'Export selected households',
                variant: 'default' as const,
                disabled: false
            },
            {
                label: 'Edit Status',
                icon: <Edit className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('change_status' as BulkAction),
                tooltip: 'Bulk edit status',
                variant: 'default' as const,
                disabled: false
            }
        ],
        secondary: [
            {
                label: 'Activate',
                icon: <Users className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('activate' as BulkAction),
                tooltip: 'Activate selected households',
                variant: 'outline' as const,
                disabled: false
            },
            {
                label: 'Deactivate',
                icon: <Users className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('deactivate' as BulkAction),
                tooltip: 'Deactivate selected households',
                variant: 'outline' as const,
                disabled: false
            },
            {
                label: 'Change Purok',
                icon: <Globe className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('change_purok' as BulkAction),
                tooltip: 'Change purok for selected households',
                variant: 'outline' as const,
                disabled: false
            },
            {
                label: 'Print',
                icon: <Printer className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('print' as BulkAction),
                tooltip: 'Print selected households',
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
                tooltip: 'Delete selected households',
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
                                {selectedHouseholds.length}
                            </span>
                        </div>
                        <div>
                            <span className="font-medium text-sm sm:text-base dark:text-gray-200">
                                {selectedHouseholds.length} household(s) selected
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
                            {selectionStats.total && selectionStats.total > 0 && (
                                <span className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    Total: {selectionStats.total}
                                </span>
                            )}
                            {selectionStats.totalMembers && selectionStats.totalMembers > 0 && (
                                <span className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                    Members: {selectionStats.totalMembers}
                                </span>
                            )}
                            {selectionStats.active && selectionStats.active > 0 && (
                                <span className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    {selectionStats.active} active
                                </span>
                            )}
                            {selectionStats.inactive && selectionStats.inactive > 0 && (
                                <span className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                    {selectionStats.inactive} inactive
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
                            className="text-xs h-8 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            Clear Selection
                        </Button>
                        
                        {/* Select All Dropdown */}
                        <div className="relative group">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={isPerformingBulkAction}
                                className="text-xs h-8 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
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
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 dark:text-gray-300"
                                        disabled={isPerformingBulkAction}
                                    >
                                        {isSelectAll ? '✓ ' : ''}
                                        {isSelectAll ? 'Deselect Page' : 'Select Page'}
                                    </button>
                                    <button
                                        onClick={onSelectAllFiltered}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 dark:text-gray-300"
                                        disabled={isPerformingBulkAction}
                                    >
                                        Select All Filtered ({totalItems})
                                    </button>
                                    <button
                                        onClick={onSelectAll}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 dark:text-gray-300"
                                        disabled={isPerformingBulkAction}
                                    >
                                        Select All Households
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
                                        className="text-xs h-8 dark:border-gray-600 dark:text-gray-300"
                                    >
                                        {action.icon}
                                        {!isMobile && action.label}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="dark:bg-gray-800 dark:text-gray-200">
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
                                    className="text-xs h-8 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                                >
                                    More...
                                </Button>
                                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                    <div className="py-1">
                                        {bulkActions.secondary.map((action, index) => (
                                            <button
                                                key={index}
                                                onClick={action.onClick}
                                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 dark:text-gray-300"
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
                                <TooltipContent className="dark:bg-gray-800 dark:text-gray-200">
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