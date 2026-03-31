// resources/js/components/admin/announcements/AnnouncementsBulkActions.tsx

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
    Megaphone,
    FileSpreadsheet,
    Printer,
    Send,
    Archive,
    Copy,
    Edit,
    Trash2,
    Bell,
    AlertCircle,
    CheckSquare,
    Square
} from 'lucide-react';
import { SelectionMode, SelectionStats, BulkOperation } from '@/types/admin/announcements/announcement.types'; // ← Add BulkOperation import

interface BulkActionItem {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    tooltip: string;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    disabled?: boolean;
}

interface AnnouncementsBulkActionsProps {
    selectedAnnouncements: number[];
    selectionMode: SelectionMode;
    selectionStats?: SelectionStats;
    isPerformingBulkAction: boolean;
    isSelectAll: boolean;
    isMobile?: boolean;
    totalItems?: number;
    
    // Actions
    onClearSelection: () => void;
    onSelectAllOnPage: () => void;
    onSelectAllFiltered: () => void;
    onSelectAll: () => void;
    onBulkOperation: (operation: BulkOperation, additionalData?: any) => void; // ← CHANGE THIS LINE
    onCopySelectedData: () => void;
    setShowBulkDeleteDialog?: (show: boolean) => void;
    setShowBulkNotifyDialog?: (show: boolean) => void;
    
    // Bulk actions configuration (optional for customization)
    bulkActions?: {
        primary?: BulkActionItem[];
        secondary?: BulkActionItem[];
        destructive?: BulkActionItem[];
    };
}

export default function AnnouncementsBulkActions({
    selectedAnnouncements,
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
    setShowBulkNotifyDialog,
    bulkActions: customBulkActions
}: AnnouncementsBulkActionsProps) {
    
    // Default bulk actions for announcements
    const defaultBulkActions = {
        primary: [
            {
                label: 'Export',
                icon: <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('export' as BulkOperation), // ← Add as BulkOperation
                tooltip: 'Export selected announcements',
                variant: 'default' as const
            },
            {
                label: 'Publish',
                icon: <Send className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('publish' as BulkOperation), // ← Add as BulkOperation
                tooltip: 'Publish selected announcements',
                variant: 'default' as const
            },
            {
                label: 'Print',
                icon: <Printer className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('print' as BulkOperation), // ← Add as BulkOperation
                tooltip: 'Print selected announcements',
                variant: 'default' as const
            }
        ] as BulkActionItem[],
        secondary: [
            {
                label: 'Activate',
                icon: <Bell className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('activate' as BulkOperation), // ← Add as BulkOperation
                tooltip: 'Activate selected announcements',
                variant: 'outline' as const
            },
            {
                label: 'Deactivate',
                icon: <Bell className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('deactivate' as BulkOperation), // ← Add as BulkOperation
                tooltip: 'Deactivate selected announcements',
                variant: 'outline' as const
            },
            {
                label: 'Archive',
                icon: <Archive className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('archive' as BulkOperation), // ← Add as BulkOperation
                tooltip: 'Archive selected announcements',
                variant: 'outline' as const
            },
            {
                label: 'Change Status',
                icon: <Edit className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('change_status' as BulkOperation), // ← Add as BulkOperation
                tooltip: 'Change status for selected announcements',
                variant: 'outline' as const
            },
            {
                label: 'Change Type',
                icon: <AlertCircle className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('change_type' as BulkOperation), // ← Add as BulkOperation
                tooltip: 'Change type for selected announcements',
                variant: 'outline' as const
            },
            {
                label: 'Copy Data',
                icon: <Copy className="h-3.5 w-3.5 mr-1.5" />,
                onClick: onCopySelectedData,
                tooltip: 'Copy selected data to clipboard',
                variant: 'outline' as const
            }
        ] as BulkActionItem[],
        destructive: [
            {
                label: 'Delete',
                icon: <Trash2 className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => setShowBulkDeleteDialog?.(true),
                tooltip: 'Delete selected announcements',
                variant: 'destructive' as const
            }
        ] as BulkActionItem[]
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
                                {selectedAnnouncements.length}
                            </span>
                        </div>
                        <div>
                            <span className="font-medium text-sm sm:text-base">
                                {selectedAnnouncements.length} announcement(s) selected
                            </span>
                            {selectionMode !== 'page' && (
                                <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                                    {selectionMode === 'filtered' ? 'Filtered' : 'All'}
                                </span>
                            )}
                        </div>
                    </div>
                    
                    {/* Selection Stats using SelectionStats type */}
                    {selectionStats && (
                        <div className="hidden sm:flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            {selectionStats.active > 0 && (
                                <span className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    {selectionStats.active} active
                                </span>
                            )}
                            {selectionStats.inactive > 0 && (
                                <span className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                                    {selectionStats.inactive} inactive
                                </span>
                            )}
                            {selectionStats.expired > 0 && (
                                <span className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                    {selectionStats.expired} expired
                                </span>
                            )}
                            {selectionStats.upcoming > 0 && (
                                <span className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    {selectionStats.upcoming} upcoming
                                </span>
                            )}
                            {/* Show top priority type if available */}
                            {selectionStats.priorities && Object.keys(selectionStats.priorities).length > 0 && (
                                <span className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                    {Object.entries(selectionStats.priorities)[0][1]} high priority
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
                                        Select All Announcements
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
                                        disabled={isPerformingBulkAction || (action.disabled ?? false)}
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
                                                disabled={isPerformingBulkAction || (action.disabled ?? false)}
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
                                        disabled={isPerformingBulkAction || (action.disabled ?? false)}
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