// resources/js/components/admin/privileges/PrivilegesBulkActions.tsx

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    CheckCircle,
    XCircle,
    ChevronDown,
    Download,
    Trash2,
    Edit,
    Copy,
    Printer,
    Users,
    Percent,
    Shield,
    IdCard,
    Loader2
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { SelectionStats, BulkOperation } from '@/types/admin/privileges/privilege.types';
import { JSX } from 'react';

interface BulkActionItem {
    label: string;
    icon: JSX.Element;
    onClick: () => void;
    tooltip: string;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

interface PrivilegesBulkActionsProps {
    selectedPrivileges: number[];
    selectionMode: 'page' | 'filtered' | 'all';
    selectionStats: SelectionStats;
    isPerformingBulkAction: boolean;
    isSelectAll: boolean;
    isMobile: boolean;
    totalItems: number;
    onClearSelection: () => void;
    onSelectAllOnPage: () => void;
    onSelectAllFiltered: () => void;
    onSelectAll: () => void;
    onBulkOperation: (operation: BulkOperation) => void;
    onCopySelectedData: () => void;
    setShowBulkDeleteDialog?: (show: boolean) => void;
    bulkActions: {
        primary: BulkActionItem[];
        secondary: BulkActionItem[];
        destructive: BulkActionItem[];
    };
}

export default function PrivilegesBulkActions({
    selectedPrivileges,
    selectionMode,
    selectionStats,
    isPerformingBulkAction,
    isSelectAll,
    isMobile,
    totalItems,
    onClearSelection,
    onSelectAllOnPage,
    onSelectAllFiltered,
    onSelectAll,
    onBulkOperation,
    onCopySelectedData,
    setShowBulkDeleteDialog,
    bulkActions
}: PrivilegesBulkActionsProps) {
    const hasSelection = selectedPrivileges.length > 0;

    if (!hasSelection) {
        return null;
    }

    return (
        <div className="sticky top-0 z-10 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                    <Badge className="bg-blue-600 text-white px-2 py-0.5">
                        {selectedPrivileges.length} selected
                    </Badge>
                    {selectionMode === 'all' && (
                        <Badge variant="outline" className="border-blue-300 text-blue-700 dark:text-blue-400">
                            All privileges
                        </Badge>
                    )}
                    {selectionMode === 'filtered' && (
                        <Badge variant="outline" className="border-blue-300 text-blue-700 dark:text-blue-400">
                            Filtered results
                        </Badge>
                    )}
                </div>
                
                <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 cursor-help">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                <span>{selectionStats.active} active</span>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Active privileges in selection</p>
                        </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 cursor-help">
                                <XCircle className="h-3 w-3 text-gray-500" />
                                <span>{selectionStats.inactive} inactive</span>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Inactive privileges in selection</p>
                        </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 cursor-help">
                                <Shield className="h-3 w-3 text-purple-500" />
                                <span>{selectionStats.requiresVerification} need verification</span>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Privileges that require verification</p>
                        </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 cursor-help">
                                <IdCard className="h-3 w-3 text-blue-500" />
                                <span>{selectionStats.requiresIdNumber} need ID</span>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Privileges that require ID number</p>
                        </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 cursor-help">
                                <Users className="h-3 w-3 text-amber-500" />
                                <span>{selectionStats.totalAssignments.toLocaleString()} assignments</span>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Total resident assignments</p>
                        </TooltipContent>
                    </Tooltip>
                    
                    {selectionStats.avgDiscount !== undefined && selectionStats.avgDiscount > 0 && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-1 cursor-help">
                                    <Percent className="h-3 w-3 text-green-500" />
                                    <span>{selectionStats.avgDiscount.toFixed(1)}% avg</span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Average discount percentage</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button 
                            size="sm" 
                            variant="outline"
                            className="bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800"
                            disabled={isPerformingBulkAction}
                        >
                            Select More
                            <ChevronDown className="ml-2 h-3 w-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Selection Options</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={onSelectAllOnPage} disabled={isPerformingBulkAction}>
                            Select this page ({Math.min(selectedPrivileges.length, 15)})
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onSelectAllFiltered} disabled={isPerformingBulkAction}>
                            Select all filtered ({totalItems})
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onSelectAll} disabled={isPerformingBulkAction}>
                            Select all ({totalItems}+)
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={onClearSelection} disabled={isPerformingBulkAction}>
                            Clear selection
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Primary Actions */}
                {bulkActions.primary.map((action, index) => (
                    <Tooltip key={index}>
                        <TooltipTrigger asChild>
                            <Button
                                size="sm"
                                variant="outline"
                                className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                                onClick={action.onClick}
                                disabled={isPerformingBulkAction}
                            >
                                {isPerformingBulkAction ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    action.icon
                                )}
                                {!isMobile && <span className="ml-1 hidden sm:inline">{action.label}</span>}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{action.tooltip}</p>
                        </TooltipContent>
                    </Tooltip>
                ))}

                {/* Secondary Actions Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button 
                            size="sm" 
                            variant="outline"
                            className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                            disabled={isPerformingBulkAction}
                        >
                            More Actions
                            <ChevronDown className="ml-2 h-3 w-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        
                        {bulkActions.secondary.map((action, index) => (
                            <DropdownMenuItem 
                                key={index}
                                onClick={action.onClick}
                                className="cursor-pointer"
                                disabled={isPerformingBulkAction}
                            >
                                {action.icon}
                                {action.label}
                            </DropdownMenuItem>
                        ))}
                        
                        <DropdownMenuSeparator />
                        
                        {bulkActions.destructive.map((action, index) => (
                            <DropdownMenuItem 
                                key={index}
                                onClick={action.onClick}
                                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50"
                                disabled={isPerformingBulkAction}
                            >
                                {action.icon}
                                {action.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Quick Delete Button */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setShowBulkDeleteDialog?.(true)}
                            disabled={isPerformingBulkAction}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {isPerformingBulkAction ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                            )}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Delete selected privileges</p>
                    </TooltipContent>
                </Tooltip>
            </div>
        </div>
    );
}