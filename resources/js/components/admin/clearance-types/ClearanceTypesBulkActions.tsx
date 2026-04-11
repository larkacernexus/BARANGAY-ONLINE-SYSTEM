// components/admin/clearance-types/ClearanceTypesBulkActions.tsx

import { useState, useRef, useEffect } from 'react';
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
    RotateCcw,
    Lock,
    Unlock
} from 'lucide-react';
import { BulkOperation, SelectionMode, SelectionStats } from '@/types/admin/clearance-types/clearance-types';

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
    onSmartBulkDiscountableToggle?: () => void;
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
    onSmartBulkDiscountableToggle,
    setShowBulkDeleteDialog,
    setShowBulkEditDialog
}: ClearanceTypesBulkActionsProps) {
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [showSelectionOptions, setShowSelectionOptions] = useState(false);
    const bulkActionRef = useRef<HTMLDivElement>(null);
    const selectionRef = useRef<HTMLDivElement>(null);
    const moreActionsRef = useRef<HTMLDivElement>(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectionRef.current && !selectionRef.current.contains(event.target as Node)) {
                setShowSelectionOptions(false);
            }
            if (moreActionsRef.current && !moreActionsRef.current.contains(event.target as Node)) {
                setShowBulkActions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Determine smart toggle text and icon
    const getSmartToggleConfig = () => {
        const hasInactive = selectionStats.inactive > 0;
        const hasNonDiscountable = selectionStats.non_discountable > 0;
        
        if (hasInactive) {
            return {
                label: 'Activate',
                icon: <PlayCircle className="h-3.5 w-3.5 mr-1" />,
                tooltip: 'Activate selected clearance types'
            };
        } else {
            return {
                label: 'Deactivate',
                icon: <PauseCircle className="h-3.5 w-3.5 mr-1" />,
                tooltip: 'Deactivate selected clearance types'
            };
        }
    };

    const getSmartDiscountableConfig = () => {
        const hasNonDiscountable = selectionStats.non_discountable > 0;
        
        if (hasNonDiscountable) {
            return {
                label: 'Mark Discountable',
                icon: <Unlock className="h-3.5 w-3.5 mr-1" />,
                tooltip: 'Mark selected clearance types as discountable'
            };
        } else {
            return {
                label: 'Mark Non-Discountable',
                icon: <Lock className="h-3.5 w-3.5 mr-1" />,
                tooltip: 'Mark selected clearance types as non-discountable'
            };
        }
    };

    const smartToggleConfig = getSmartToggleConfig();
    const smartDiscountableConfig = getSmartDiscountableConfig();

    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-wrap">
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
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onClearSelection}
                                    className="h-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    <PackageX className="h-3.5 w-3.5 mr-1" />
                                    Clear
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                Clear current selection
                            </TooltipContent>
                        </Tooltip>
                        
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
                        {/* Smart Status Toggle */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onSmartBulkToggle}
                                    className="h-8"
                                    disabled={isPerformingBulkAction}
                                >
                                    {smartToggleConfig.icon}
                                    {smartToggleConfig.label}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {smartToggleConfig.tooltip}
                            </TooltipContent>
                        </Tooltip>
                        
                        {/* Smart Discountable Toggle */}
                        {onSmartBulkDiscountableToggle && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={onSmartBulkDiscountableToggle}
                                        className="h-8"
                                        disabled={isPerformingBulkAction}
                                    >
                                        {smartDiscountableConfig.icon}
                                        {smartDiscountableConfig.label}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {smartDiscountableConfig.tooltip}
                                </TooltipContent>
                            </Tooltip>
                        )}
                        
                        {/* Export Button */}
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
                                Export selected items to CSV
                            </TooltipContent>
                        </Tooltip>
                        
                        {/* Bulk Edit Button */}
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
                    
                    {/* Selection Options Dropdown */}
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
                            <div className="absolute right-0 top-full mt-1 z-50 w-56 bg-white dark:bg-gray-900 border rounded-md shadow-lg">
                                <div className="p-2">
                                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1">
                                        SELECTION OPTIONS
                                    </div>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start h-8 text-sm"
                                        onClick={() => {
                                            onSelectAllOnPage();
                                            setShowSelectionOptions(false);
                                        }}
                                    >
                                        <Rows className="h-3.5 w-3.5 mr-2" />
                                        Current Page
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start h-8 text-sm"
                                        onClick={() => {
                                            onSelectAllFiltered();
                                            setShowSelectionOptions(false);
                                        }}
                                    >
                                        <Filter className="h-3.5 w-3.5 mr-2" />
                                        All Filtered
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start h-8 text-sm"
                                        onClick={() => {
                                            onSelectAll();
                                            setShowSelectionOptions(false);
                                        }}
                                    >
                                        <Hash className="h-3.5 w-3.5 mr-2" />
                                        All Items
                                    </Button>
                                    <div className="border-t my-1"></div>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start h-8 text-sm text-red-600 hover:text-red-700"
                                        onClick={() => {
                                            onClearSelection();
                                            setShowSelectionOptions(false);
                                        }}
                                    >
                                        <RotateCcw className="h-3.5 w-3.5 mr-2" />
                                        Clear Selection
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* More Actions Dropdown */}
                    <div className="relative" ref={moreActionsRef}>
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
                                        onClick={() => {
                                            onBulkOperation('duplicate');
                                            setShowBulkActions(false);
                                        }}
                                    >
                                        <Copy className="h-3.5 w-3.5 mr-2" />
                                        Duplicate
                                    </Button>
                                    
                                    {onSmartBulkDiscountableToggle && (
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start h-8 text-sm"
                                            onClick={() => {
                                                onSmartBulkDiscountableToggle();
                                                setShowBulkActions(false);
                                            }}
                                        >
                                            {smartDiscountableConfig.icon}
                                            {smartDiscountableConfig.label}
                                        </Button>
                                    )}
                                    
                                    <div className="border-t my-1"></div>
                                    
                                    {setShowBulkDeleteDialog && (
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start h-8 text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => {
                                                setShowBulkDeleteDialog(true);
                                                setShowBulkActions(false);
                                            }}
                                        >
                                            <Trash2 className="h-3.5 w-3.5 mr-2" />
                                            Delete Selected
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Exit Button */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                className="h-8"
                                onClick={onClearSelection}
                            >
                                <X className="h-3.5 w-3.5 mr-1" />
                                Exit
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            Exit bulk mode and clear selection
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>
            
            {/* Enhanced stats of selected items */}
            {selectedTypes.length > 0 && (
                <div className="mt-3 pt-3 border-t border-blue-100 dark:border-blue-800">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-sm">
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
                            <Unlock className="h-3.5 w-3.5 text-green-500" />
                            <span>
                                {selectionStats.discountable} discountable
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Lock className="h-3.5 w-3.5 text-gray-500" />
                            <span>
                                {selectionStats.non_discountable} non-disc.
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
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                            <Timer className="h-3 w-3" />
                            <span>Avg processing: {
                                selectionStats.avgProcessingDays.toFixed(1)
                            } days</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            <span>Total value: ₱{
                                selectionStats.totalValue.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })
                            }</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}