import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
    FileSpreadsheet, 
    Download, 
    Edit, 
    Trash2, 
    Copy, 
    Archive,
    ArchiveRestore,
    Folder,
    FileDown,
    Checkbox,
    CheckSquare,
    Square
} from 'lucide-react';

interface BulkActionItem {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    tooltip: string;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    disabled?: boolean;
}

interface FormsBulkActionsProps {
    selectedForms: number[];
    selectionMode: 'page' | 'filtered' | 'all';
    selectionStats?: {
        totalSize?: string;
        activeCount?: number;
        totalDownloads?: number;
        categoriesCount?: number;
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
    onBulkOperation: (operation: string) => void;
    onCopySelectedData: () => void;
    setShowBulkDeleteDialog?: (show: boolean) => void;
    
    // Bulk actions configuration (optional for customization)
    bulkActions?: {
        primary?: BulkActionItem[];
        secondary?: BulkActionItem[];
        destructive?: BulkActionItem[];
    };
}

export default function FormsBulkActions({
    selectedForms,
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
}: FormsBulkActionsProps) {
    
    // Default bulk actions for forms
    const defaultBulkActions = {
        primary: [
            {
                label: 'Export',
                icon: <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('export'),
                tooltip: 'Export selected forms',
                variant: 'default' as const
            },
            {
                label: 'Download',
                icon: <Download className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('download'),
                tooltip: 'Download selected forms',
                variant: 'default' as const
            }
        ],
        secondary: [
            {
                label: 'Activate',
                icon: <ArchiveRestore className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('activate'),
                tooltip: 'Activate selected forms',
                variant: 'outline' as const
            },
            {
                label: 'Deactivate',
                icon: <Archive className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('deactivate'),
                tooltip: 'Deactivate selected forms',
                variant: 'outline' as const
            },
            {
                label: 'Change Status',
                icon: <Edit className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('change_status'),
                tooltip: 'Change status for selected forms',
                variant: 'outline' as const
            },
            {
                label: 'Change Category',
                icon: <Folder className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('change_category'),
                tooltip: 'Change category for selected forms',
                variant: 'outline' as const
            },
            {
                label: 'Export CSV',
                icon: <FileDown className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('export_csv'),
                tooltip: 'Export as CSV',
                variant: 'outline' as const
            },
            {
                label: 'Copy Data',
                icon: <Copy className="h-3.5 w-3.5 mr-1.5" />,
                onClick: onCopySelectedData,
                tooltip: 'Copy selected data to clipboard',
                variant: 'outline' as const
            }
        ],
        destructive: [
            {
                label: 'Delete',
                icon: <Trash2 className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => setShowBulkDeleteDialog?.(true),
                tooltip: 'Delete selected forms',
                variant: 'destructive' as const
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
                                {selectedForms.length}
                            </span>
                        </div>
                        <div>
                            <span className="font-medium text-sm sm:text-base">
                                {selectedForms.length} form(s) selected
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
                            {selectionStats.totalSize && (
                                <span className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                    Total: {selectionStats.totalSize}
                                </span>
                            )}
                            {selectionStats.activeCount && selectionStats.activeCount > 0 && (
                                <span className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    {selectionStats.activeCount} active
                                </span>
                            )}
                            {selectionStats.totalDownloads && selectionStats.totalDownloads > 0 && (
                                <span className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    {selectionStats.totalDownloads} downloads
                                </span>
                            )}
                            {selectionStats.categoriesCount && selectionStats.categoriesCount > 0 && (
                                <span className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                    {selectionStats.categoriesCount} categories
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
                                        Select All Forms
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