// components/admin/roles/RolesBulkActions.tsx
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
    FileSpreadsheet,
    Edit,
    Trash2,
    Layers,
    PackageCheck,
    PackageX,
    ClipboardCopy,
    X,
    Shield,
    Users,
    Key,
    Archive,
    Copy,
    Loader2,
    ChevronDown
} from 'lucide-react';
import { useState, useRef } from 'react';
import { SelectionMode, SelectionStats } from '@/admin-utils/rolesUtils';

interface RolesBulkActionsProps {
    selectedRoles: number[];
    selectionMode: SelectionMode;
    selectionStats: SelectionStats;
    isPerformingBulkAction: boolean;
    isSelectAll: boolean;
    isMobile: boolean;
    onClearSelection: () => void;
    onSelectAllOnPage: () => void;
    onSelectAllFiltered: () => void;
    onSelectAll: () => void;
    onBulkOperation: (operation: string) => void;
    onCopySelectedData: () => void;
    setShowBulkDeleteDialog: (show: boolean) => void;
    setShowBulkTypeDialog: (show: boolean) => void;
    bulkEditValue: string;
    setBulkEditValue: (value: string) => void;
}

export default function RolesBulkActions({
    selectedRoles,
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
    setShowBulkTypeDialog,
    bulkEditValue,
    setBulkEditValue
}: RolesBulkActionsProps) {
    const [showBulkActions, setShowBulkActions] = useState(false);
    const bulkActionRef = useRef<HTMLDivElement>(null);

    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-900 px-3 py-1.5 rounded-full border">
                        <PackageCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="font-medium text-sm">
                            {selectedRoles.length} selected
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
                                    onClick={() => onBulkOperation('export')}
                                    className="h-8"
                                    disabled={isPerformingBulkAction}
                                >
                                    <FileSpreadsheet className="h-3.5 w-3.5 mr-1" />
                                    Export
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                Export selected roles
                            </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onBulkOperation('export_permissions')}
                                    className="h-8"
                                    disabled={isPerformingBulkAction}
                                >
                                    <Key className="h-3.5 w-3.5 mr-1" />
                                    Export Perms
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                Export role permissions
                            </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowBulkTypeDialog(true)}
                                    className="h-8"
                                    disabled={isPerformingBulkAction}
                                >
                                    <Edit className="h-3.5 w-3.5 mr-1" />
                                    Edit Type
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                Bulk change role type
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    
                    <div className="relative">
                        <Button
                            onClick={() => setShowBulkActions(!showBulkActions)}
                            className="h-8 bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={isPerformingBulkAction}
                        >
                            {isPerformingBulkAction ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <>
                                    <Layers className="h-3.5 w-3.5 mr-1" />
                                    More
                                    <ChevronDown className="h-3.5 w-3.5 ml-1" />
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
                                        Duplicate Roles
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start h-8 text-sm"
                                        onClick={() => onBulkOperation('generate_report')}
                                    >
                                        <FileSpreadsheet className="h-3.5 w-3.5 mr-2" />
                                        Generate Report
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start h-8 text-sm"
                                        onClick={() => onBulkOperation('archive')}
                                    >
                                        <Archive className="h-3.5 w-3.5 mr-2" />
                                        Archive Roles
                                    </Button>
                                    <div className="border-t my-1"></div>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start h-8 text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => setShowBulkDeleteDialog(true)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                                        Delete Selected
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <Button
                        variant="outline"
                        className="h-8"
                        onClick={() => onBulkOperation('print')}
                        disabled={isPerformingBulkAction}
                    >
                        <FileSpreadsheet className="h-3.5 w-3.5 mr-1" />
                        Print
                    </Button>
                </div>
            </div>
            
            {/* Enhanced stats of selected items */}
            {selectedRoles.length > 0 && selectionStats && (
                <div className="mt-3 pt-3 border-t border-blue-100 dark:border-blue-800">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                            <Shield className="h-3.5 w-3.5 text-blue-500" />
                            <span>
                                {selectionStats.total} roles
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="h-3.5 w-3.5 text-green-500" />
                            <span>
                                {selectionStats.totalUsers} users
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Edit className="h-3.5 w-3.5 text-green-500" />
                            <span>
                                {selectionStats.custom} custom
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Shield className="h-3.5 w-3.5 text-purple-500" />
                            <span>
                                {selectionStats.system} system
                            </span>
                        </div>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                            <Users className="h-3 w-3 text-green-500" />
                            <span>Avg users: {selectionStats.avgUsers}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Trash2 className="h-3 w-3 text-red-500" />
                            <span>Deletable: {selectionStats.deletable}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}