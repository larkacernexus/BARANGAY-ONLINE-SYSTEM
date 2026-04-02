// components/admin/role-permissions/RolePermissionsBulkActions.tsx
// components/admin/role-permissions/RolePermissionsBulkActions.tsx
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
    FileSpreadsheet,
    Trash2,
    Layers,
    PackageCheck,
    PackageX,
    ClipboardCopy,
    X,
    Shield,
    Key,
    Users,
    Loader2,
    ChevronDown
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

// Import types from the types file
import { SelectionMode, SelectionStats, BulkOperation } from '@/types/admin/rolepermissions/rolePermissions.types';
interface RolePermissionsBulkActionsProps {
    selectedPermissions: number[];
    selectionMode: SelectionMode;
    selectionStats: SelectionStats;
    isPerformingBulkAction: boolean;
    isSelectAll: boolean;
    isMobile: boolean;
    onClearSelection: () => void;
    onSelectAllOnPage: () => void;
    onSelectAllFiltered: () => void;
    onSelectAll: () => void;
    onBulkOperation: (operation: BulkOperation) => void; // Changed to BulkOperation type
    onCopySelectedData: () => void;
    setShowBulkRevokeDialog: (show: boolean) => void;
}

export default function RolePermissionsBulkActions({
    selectedPermissions,
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
    setShowBulkRevokeDialog
}: RolePermissionsBulkActionsProps) {
    const [showBulkActions, setShowBulkActions] = useState(false);
    const bulkActionRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (bulkActionRef.current && !bulkActionRef.current.contains(event.target as Node)) {
                setShowBulkActions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-900 px-3 py-1.5 rounded-full border">
                        <PackageCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="font-medium text-sm">
                            {selectedPermissions.length} selected
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
                
                <div className="flex flex-wrap items-center gap-2">
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
                                Export selected permissions
                            </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowBulkRevokeDialog(true)}
                                    className="h-8"
                                    disabled={isPerformingBulkAction}
                                >
                                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                                    Revoke
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                Bulk revoke selected permissions
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    
                    <div className="relative" ref={bulkActionRef}>
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
                                        onClick={() => {
                                            onBulkOperation('generate_report');
                                            setShowBulkActions(false);
                                        }}
                                    >
                                        <FileSpreadsheet className="h-3.5 w-3.5 mr-2" />
                                        Generate Report
                                    </Button>
                                    <div className="border-t my-1"></div>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start h-8 text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => {
                                            setShowBulkRevokeDialog(true);
                                            setShowBulkActions(false);
                                        }}
                                    >
                                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                                        Revoke Selected
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <Button
                        variant="outline"
                        className="h-8"
                        onClick={() => onBulkOperation('generate_report')}
                        disabled={isPerformingBulkAction}
                    >
                        <FileSpreadsheet className="h-3.5 w-3.5 mr-1" />
                        Print
                    </Button>
                </div>
            </div>
            
            {/* Enhanced stats of selected items */}
            {selectedPermissions.length > 0 && selectionStats && (
                <div className="mt-3 pt-3 border-t border-blue-100 dark:border-blue-800">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                            <Layers className="h-3.5 w-3.5 text-blue-500" />
                            <span>
                                {selectionStats.total} assignments
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Shield className="h-3.5 w-3.5 text-green-500" />
                            <span>
                                {selectionStats.uniqueRoles} roles
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Key className="h-3.5 w-3.5 text-purple-500" />
                            <span>
                                {selectionStats.uniquePermissions} permissions
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="h-3.5 w-3.5 text-orange-500" />
                            <span>
                                {selectionStats.uniqueModules} modules
                            </span>
                        </div>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                            <Shield className="h-3 w-3 text-purple-500" />
                            <span>{selectionStats.systemRoles} system roles</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Shield className="h-3 w-3 text-green-500" />
                            <span>{selectionStats.customRoles} custom roles</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}