// components/admin/fees/FeesBulkActions.tsx

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
    PackageCheck,
    PackageX,
    ClipboardCopy,
    FileSpreadsheet,
    Printer,
    CheckCircle,
    Mail,
    FileDigit,
    Trash2,
    Layers,
    X,
    DollarSign,
    CreditCard,
    AlertCircle,
    Receipt,
    User,
    Home,
    Building,
    CheckSquare,
    Square
} from 'lucide-react';
import { SelectionStats, BulkOperation } from '@/types/admin/fees/fees';
import { useState, useRef, useEffect } from 'react';

interface BulkActionItem {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    tooltip: string;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    disabled?: boolean;
}

interface FeesBulkActionsProps {
    selectedFees: number[];
    selectionMode: 'page' | 'filtered' | 'all';
    selectionStats?: SelectionStats;
    isPerformingBulkAction: boolean;
    isSelectAll: boolean;
    isMobile?: boolean;
    totalItems: number;
    onClearSelection: () => void;
    onSelectAllOnPage: () => void;
    onSelectAllFiltered: () => void;
    onSelectAll: () => void;
    onBulkOperation: (operation: BulkOperation) => void;
    onCopySelectedData: () => void;
    setShowBulkDeleteDialog?: (show: boolean) => void;
    setIsBulkMode?: (value: boolean) => void;
    // ✅ FIXED: Allow null in RefObject
    bulkActionRef?: React.RefObject<HTMLDivElement | null>;
    showBulkActions?: boolean;
    setShowBulkActions?: (show: boolean) => void;
    onRemindersSent?: () => void;
    onExport?: () => void;
    onPrint?: () => void;
    bulkActions?: {
        primary?: BulkActionItem[];
        secondary?: BulkActionItem[];
        destructive?: BulkActionItem[];
    };
}

const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null || isNaN(amount)) return '₱0.00';
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};

export default function FeesBulkActions({
    selectedFees,
    selectionMode,
    selectionStats,
    isPerformingBulkAction,
    isSelectAll,
    isMobile = false,
    totalItems,
    onClearSelection,
    onSelectAllOnPage,
    onSelectAllFiltered,
    onSelectAll,
    onBulkOperation,
    onCopySelectedData,
    setShowBulkDeleteDialog,
    setIsBulkMode,
    bulkActionRef,
    showBulkActions: _showBulkActions,
    setShowBulkActions: _setShowBulkActions,
    onRemindersSent,
    onExport,
    onPrint,
    bulkActions: customBulkActions
}: FeesBulkActionsProps) {
    
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [showSelectMenu, setShowSelectMenu] = useState(false);
    const moreMenuRef = useRef<HTMLDivElement>(null);
    const selectMenuRef = useRef<HTMLDivElement>(null);
    
    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
                setShowMoreMenu(false);
            }
            if (selectMenuRef.current && !selectMenuRef.current.contains(event.target as Node)) {
                setShowSelectMenu(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    // Default bulk actions for fees
    const defaultBulkActions = {
        primary: [
            {
                label: 'Export',
                icon: <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => {
                    onBulkOperation('export' as BulkOperation);
                    onExport?.();
                },
                tooltip: 'Export selected fees as CSV',
                variant: 'default' as const,
                disabled: false
            },
            {
                label: 'Print',
                icon: <Printer className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => {
                    onBulkOperation('print' as BulkOperation);
                    onPrint?.();
                },
                tooltip: 'Print selected fees',
                variant: 'default' as const,
                disabled: false
            }
        ],
        secondary: [
            {
                label: 'Mark Paid',
                icon: <CheckCircle className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('mark_paid' as BulkOperation),
                tooltip: 'Mark selected as paid',
                variant: 'outline' as const,
                disabled: false
            },
            {
                label: 'Mark Unpaid',
                icon: <PackageX className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('mark_unpaid' as BulkOperation),
                tooltip: 'Mark selected as unpaid',
                variant: 'outline' as const,
                disabled: false
            },
            {
                label: 'Send Reminders',
                icon: <Mail className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => {
                    onBulkOperation('send_reminders' as BulkOperation);
                    onRemindersSent?.();
                },
                tooltip: 'Send payment reminders',
                variant: 'outline' as const,
                disabled: false
            },
            {
                label: 'Generate Receipts',
                icon: <Receipt className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('generate_receipt' as BulkOperation),
                tooltip: 'Generate receipts for selected fees',
                variant: 'outline' as const,
                disabled: false
            },
            {
                label: 'Copy Data',
                icon: <ClipboardCopy className="h-3.5 w-3.5 mr-1.5" />,
                onClick: onCopySelectedData,
                tooltip: 'Copy selected data as CSV',
                variant: 'outline' as const,
                disabled: false
            }
        ],
        destructive: [
            {
                label: 'Delete',
                icon: <Trash2 className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => setShowBulkDeleteDialog?.(true),
                tooltip: 'Delete selected fees',
                variant: 'destructive' as const,
                disabled: false
            }
        ]
    };

    const bulkActions = customBulkActions || defaultBulkActions;

    // Safe access to selection stats with proper number conversion
    const safeStats = {
        total: typeof selectionStats?.total === 'number' ? selectionStats.total : selectedFees.length,
        totalAmount: typeof selectionStats?.totalAmount === 'number' ? selectionStats.totalAmount : 0,
        totalBalance: typeof selectionStats?.totalBalance === 'number' ? selectionStats.totalBalance : 0,
        overdueCount: typeof selectionStats?.overdueCount === 'number' ? selectionStats.overdueCount : 0,
        withCertificates: typeof selectionStats?.withCertificates === 'number' ? selectionStats.withCertificates : 0,
        withReceipts: typeof selectionStats?.withReceipts === 'number' ? selectionStats.withReceipts : 0,
        residents: typeof selectionStats?.residents === 'number' ? selectionStats.residents : 0,
        households: typeof selectionStats?.households === 'number' ? selectionStats.households : 0,
        businesses: typeof selectionStats?.businesses === 'number' ? selectionStats.businesses : 0
    };

    const hasStats = safeStats.totalAmount > 0 || 
                     safeStats.totalBalance > 0 || 
                     safeStats.overdueCount > 0 ||
                     safeStats.withCertificates > 0 ||
                     safeStats.withReceipts > 0 ||
                     safeStats.residents > 0 ||
                     safeStats.households > 0 ||
                     safeStats.businesses > 0;

    return (
        <div 
            ref={bulkActionRef}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4 mb-4 animate-in slide-in-from-top-2 duration-300"
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Left side: Selection info */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                                {selectedFees.length}
                            </span>
                        </div>
                        <div>
                            <span className="font-medium text-sm sm:text-base dark:text-gray-200">
                                {selectedFees.length} fee(s) selected
                            </span>
                            {selectionMode !== 'page' && (
                                <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                                    {selectionMode === 'filtered' ? 'Filtered' : 'All'}
                                </span>
                            )}
                        </div>
                    </div>
                    
                    {/* Selection Stats */}
                    {hasStats && (
                        <div className="hidden sm:flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            {safeStats.totalAmount > 0 && (
                                <span className="flex items-center gap-1">
                                    <DollarSign className="w-3 h-3 text-green-500" />
                                    Total: {formatCurrency(safeStats.totalAmount)}
                                </span>
                            )}
                            {safeStats.totalBalance > 0 && (
                                <span className="flex items-center gap-1">
                                    <CreditCard className="w-3 h-3 text-indigo-500" />
                                    Balance: {formatCurrency(safeStats.totalBalance)}
                                </span>
                            )}
                            {safeStats.overdueCount > 0 && (
                                <span className="flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3 text-red-500" />
                                    {safeStats.overdueCount} overdue
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
                            <X className="h-3.5 w-3.5 mr-1.5" />
                            Clear
                        </Button>
                        
                        {/* Select All Dropdown */}
                        <div className="relative" ref={selectMenuRef}>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={isPerformingBulkAction}
                                onClick={() => setShowSelectMenu(!showSelectMenu)}
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
                            {showSelectMenu && (
                                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                                    <div className="py-1">
                                        <button
                                            onClick={() => {
                                                onSelectAllOnPage();
                                                setShowSelectMenu(false);
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 dark:text-gray-300"
                                            disabled={isPerformingBulkAction}
                                        >
                                            Select Page
                                        </button>
                                        <button
                                            onClick={() => {
                                                onSelectAllFiltered();
                                                setShowSelectMenu(false);
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 dark:text-gray-300"
                                            disabled={isPerformingBulkAction}
                                        >
                                            Select All Filtered ({totalItems})
                                        </button>
                                        <button
                                            onClick={() => {
                                                onSelectAll();
                                                setShowSelectMenu(false);
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 dark:text-gray-300"
                                            disabled={isPerformingBulkAction}
                                        >
                                            Select All Fees
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Bulk Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Primary Actions */}
                        {bulkActions.primary?.map((action, index) => (
                            <Tooltip key={index}>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={action.variant}
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
                            <div className="relative" ref={moreMenuRef}>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={isPerformingBulkAction}
                                    onClick={() => setShowMoreMenu(!showMoreMenu)}
                                    className="text-xs h-8 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                                >
                                    <Layers className="h-3.5 w-3.5 mr-1.5" />
                                    More
                                </Button>
                                {showMoreMenu && (
                                    <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                                        <div className="py-1">
                                            {bulkActions.secondary.map((action, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => {
                                                        action.onClick();
                                                        setShowMoreMenu(false);
                                                    }}
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 dark:text-gray-300"
                                                    disabled={isPerformingBulkAction || action.disabled}
                                                >
                                                    {action.icon}
                                                    {action.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {/* Destructive Actions */}
                        {bulkActions.destructive?.map((action, index) => (
                            <Tooltip key={index}>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={action.variant}
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
                        
                        {/* Exit Bulk Mode Button */}
                        {setIsBulkMode && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsBulkMode(false)}
                                disabled={isPerformingBulkAction}
                                className="text-xs h-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                Exit
                            </Button>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Enhanced stats of selected items */}
            {hasStats && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                            <FileDigit className="h-3.5 w-3.5 text-blue-500" />
                            <span className="font-medium dark:text-gray-300">
                                {safeStats.total} fees
                            </span>
                        </div>
                        {safeStats.totalAmount > 0 && (
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-3.5 w-3.5 text-green-500" />
                                <span className="font-medium dark:text-gray-300">
                                    {formatCurrency(safeStats.totalAmount)} total
                                </span>
                            </div>
                        )}
                        {safeStats.totalBalance > 0 && (
                            <div className="flex items-center gap-2">
                                <CreditCard className="h-3.5 w-3.5 text-indigo-500" />
                                <span className="font-medium dark:text-gray-300">
                                    {formatCurrency(safeStats.totalBalance)} balance
                                </span>
                            </div>
                        )}
                        {safeStats.overdueCount > 0 && (
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                                <span className="font-medium dark:text-gray-300">
                                    {safeStats.overdueCount} overdue
                                </span>
                            </div>
                        )}
                    </div>
                    
                    {(safeStats.withCertificates > 0 || safeStats.withReceipts > 0) && (
                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
                            {safeStats.withCertificates > 0 && (
                                <div className="flex items-center gap-1">
                                    <FileDigit className="h-3 w-3 text-purple-500" />
                                    <span>{safeStats.withCertificates} certificates</span>
                                </div>
                            )}
                            {safeStats.withReceipts > 0 && (
                                <div className="flex items-center gap-1">
                                    <Receipt className="h-3 w-3 text-green-500" />
                                    <span>{safeStats.withReceipts} receipts</span>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {(safeStats.residents > 0 || safeStats.households > 0 || safeStats.businesses > 0) && (
                        <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-gray-500 dark:text-gray-400">
                            {safeStats.residents > 0 && (
                                <div className="flex items-center gap-1">
                                    <User className="h-3 w-3 text-blue-500" />
                                    <span>{safeStats.residents} residents</span>
                                </div>
                            )}
                            {safeStats.households > 0 && (
                                <div className="flex items-center gap-1">
                                    <Home className="h-3 w-3 text-amber-500" />
                                    <span>{safeStats.households} households</span>
                                </div>
                            )}
                            {safeStats.businesses > 0 && (
                                <div className="flex items-center gap-1">
                                    <Building className="h-3 w-3 text-emerald-500" />
                                    <span>{safeStats.businesses} businesses</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}