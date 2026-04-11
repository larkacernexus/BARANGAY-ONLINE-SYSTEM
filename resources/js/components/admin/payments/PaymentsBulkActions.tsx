// components/admin/payments/PaymentsBulkActions.tsx

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ClipboardCopy, FileSpreadsheet, Printer, Edit, Layers, X, Loader2, Mail, CheckCheck, QrCode, Trash2, Receipt, DollarSign, CheckCircle, CreditCard, User, Users, CheckSquare, Square, AlertCircle } from 'lucide-react';
import { RefObject, useState, useEffect, useRef } from 'react';
import { SelectionStats, BulkOperationType } from '@/types/admin/payments/payments';


interface BulkActionItem {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    tooltip: string;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    disabled?: boolean;
}

interface PaymentsBulkActionsProps {
    selectedPayments: number[];
    selectionMode: 'page' | 'filtered' | 'all';
    selectionStats: SelectionStats;
    isPerformingBulkAction: boolean;
    isSelectAll: boolean;
    isMobile?: boolean;
    totalItems: number;
    onClearSelection: () => void;
    onSelectAllOnPage: () => void;
    onSelectAllFiltered: () => void;
    onSelectAll: () => void;
    onBulkOperation: (operation: BulkOperationType, customData?: any) => void;
    onCopySelectedData: () => void;
    setShowBulkDeleteDialog?: (show: boolean) => void;
    bulkActionRef?: RefObject<HTMLDivElement | null>;
    showBulkActions?: boolean;
    setShowBulkActions?: (show: boolean) => void;
    setIsBulkMode: (value: boolean) => void;
    customBulkActions?: BulkActionItem[];
}

export default function PaymentsBulkActions({
    selectedPayments,
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
    bulkActionRef,
    showBulkActions = false,
    setShowBulkActions = () => {},
    setIsBulkMode,
    customBulkActions = []
}: PaymentsBulkActionsProps) {
    
    // Local state for dropdown
    const [showSelectDropdown, setShowSelectDropdown] = useState<boolean>(false);
    const selectDropdownRef = useRef<HTMLDivElement>(null);
    const moreActionsRef = useRef<HTMLDivElement>(null);
    
    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectDropdownRef.current && !selectDropdownRef.current.contains(event.target as Node)) {
                setShowSelectDropdown(false);
            }
            if (moreActionsRef.current && !moreActionsRef.current.contains(event.target as Node)) {
                setShowBulkActions(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [setShowBulkActions]);
    
    const formatCurrency = (amount: number): string => {
        if (amount === undefined || amount === null || isNaN(amount)) {
            return '₱0.00';
        }
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    // Handle delete action
    const handleDeleteClick = (): void => {
        if (setShowBulkDeleteDialog) {
            setShowBulkDeleteDialog(true);
        }
    };

    // Bulk action items configuration
    const bulkActions = {
        primary: [
            {
                label: 'Export',
                icon: <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('export'),
                tooltip: 'Export selected payments as CSV',
                variant: 'default' as const
            },
            {
                label: 'Print',
                icon: <Printer className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('print'),
                tooltip: 'Print payment receipts',
                variant: 'default' as const
            }
        ],
        secondary: [
            {
                label: 'Update Status',
                icon: <Edit className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('update_status'),
                tooltip: 'Bulk edit selected payments',
                variant: 'ghost' as const
            },
            {
                label: 'Mark as Cleared',
                icon: <CheckCheck className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('mark_cleared'),
                tooltip: 'Mark selected as cleared',
                variant: 'ghost' as const
            },
            {
                label: 'Send Receipts',
                icon: <Mail className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('send_receipt'),
                tooltip: 'Send receipts via email/SMS',
                variant: 'ghost' as const
            },
            {
                label: 'Generate QR Codes',
                icon: <QrCode className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('generate_qr'),
                tooltip: 'Generate QR codes for selected payments',
                variant: 'ghost' as const
            },
            {
                label: 'Copy Data',
                icon: <ClipboardCopy className="h-3.5 w-3.5 mr-1.5" />,
                onClick: onCopySelectedData,
                tooltip: 'Copy selected data as CSV',
                variant: 'ghost' as const
            }
        ],
        destructive: [
            {
                label: 'Delete',
                icon: <Trash2 className="h-3.5 w-3.5 mr-1.5" />,
                onClick: handleDeleteClick,
                tooltip: 'Delete selected payments',
                variant: 'destructive' as const
            }
        ]
    };

    const hasSelectedItems = selectedPayments.length > 0;
    
    // Toggle select dropdown
    const toggleSelectDropdown = () => {
        setShowSelectDropdown(!showSelectDropdown);
    };
    
    // Handle select all on page
    const handleSelectAllOnPage = () => {
        onSelectAllOnPage();
        setShowSelectDropdown(false);
    };
    
    // Handle select all filtered
    const handleSelectAllFiltered = () => {
        onSelectAllFiltered();
        setShowSelectDropdown(false);
    };
    
    // Handle select all
    const handleSelectAll = () => {
        onSelectAll();
        setShowSelectDropdown(false);
    };
    
    // Handle clear selection
    const handleClearSelection = () => {
        onClearSelection();
        setShowSelectDropdown(false);
    };
    
    return (
        <TooltipProvider>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Left side: Selection info */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                hasSelectedItems 
                                    ? 'bg-blue-100 dark:bg-blue-900/30' 
                                    : 'bg-gray-100 dark:bg-gray-800'
                            }`}>
                                <span className={`font-bold text-sm ${
                                    hasSelectedItems 
                                        ? 'text-blue-600 dark:text-blue-400' 
                                        : 'text-gray-500 dark:text-gray-400'
                                }`}>
                                    {selectedPayments.length}
                                </span>
                            </div>
                            <div>
                                <span className="font-medium text-sm sm:text-base dark:text-gray-200">
                                    {selectedPayments.length} payment(s) selected
                                </span>
                                {selectionMode !== 'page' && hasSelectedItems && (
                                    <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                                        {selectionMode === 'filtered' ? 'Filtered' : 'All'}
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        {/* Selection Stats */}
                        {selectionStats && hasSelectedItems && (
                            <div className="hidden sm:flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                                {selectionStats.totalAmount && selectionStats.totalAmount > 0 && (
                                    <span className="flex items-center gap-1">
                                        <DollarSign className="w-3 h-3 text-green-500 dark:text-green-400" />
                                        Total: {formatCurrency(selectionStats.totalAmount)}
                                    </span>
                                )}
                                {selectionStats.completed && selectionStats.completed > 0 && (
                                    <span className="flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3 text-green-500 dark:text-green-400" />
                                        {selectionStats.completed} completed
                                    </span>
                                )}
                                {selectionStats.cashPayments && selectionStats.cashPayments > 0 && (
                                    <span className="flex items-center gap-1">
                                        <CreditCard className="w-3 h-3 text-purple-500 dark:text-purple-400" />
                                        {selectionStats.cashPayments} cash
                                    </span>
                                )}
                                {selectionStats.pending && selectionStats.pending > 0 && (
                                    <span className="flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3 text-yellow-500 dark:text-yellow-400" />
                                        {selectionStats.pending} pending
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {/* Right side: Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3" ref={bulkActionRef}>
                        {/* Selection Options */}
                        <div className="flex items-center gap-2">
                            {hasSelectedItems && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleClearSelection}
                                    disabled={isPerformingBulkAction}
                                    className="text-xs h-8 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                                >
                                    <X className="h-3.5 w-3.5 mr-1.5" />
                                    Clear
                                </Button>
                            )}
                            
                            {/* Select All Dropdown */}
                            <div className="relative" ref={selectDropdownRef}>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={isPerformingBulkAction}
                                    onClick={toggleSelectDropdown}
                                    className="text-xs h-8 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                                >
                                    {isSelectAll && hasSelectedItems ? (
                                        <>
                                            <CheckSquare className="h-3.5 w-3.5 mr-1.5" />
                                            Deselect All
                                        </>
                                    ) : (
                                        <>
                                            <Square className="h-3.5 w-3.5 mr-1.5" />
                                            Select...
                                        </>
                                    )}
                                </Button>
                                
                                {showSelectDropdown && (
                                    <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                                        <div className="py-1">
                                            {isSelectAll && hasSelectedItems ? (
                                                <button
                                                    onClick={handleClearSelection}
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 dark:text-gray-300"
                                                    disabled={isPerformingBulkAction}
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                    Clear Selection
                                                </button>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={handleSelectAllOnPage}
                                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 dark:text-gray-300"
                                                        disabled={isPerformingBulkAction}
                                                    >
                                                        <Square className="h-3.5 w-3.5" />
                                                        Select All on Page
                                                    </button>
                                                    <button
                                                        onClick={handleSelectAllFiltered}
                                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 dark:text-gray-300"
                                                        disabled={isPerformingBulkAction}
                                                    >
                                                        <Layers className="h-3.5 w-3.5" />
                                                        Select All Filtered ({totalItems})
                                                    </button>
                                                    <button
                                                        onClick={handleSelectAll}
                                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 dark:text-gray-300"
                                                        disabled={isPerformingBulkAction}
                                                    >
                                                        <CheckSquare className="h-3.5 w-3.5" />
                                                        Select All Payments
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Bulk Actions - Only show when items are selected */}
                        {hasSelectedItems && (
                            <div className="flex items-center gap-2 flex-wrap">
                                {/* Primary Actions */}
                                {bulkActions.primary.map((action, index) => (
                                    <Tooltip key={index}>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant={action.variant}
                                                size="sm"
                                                onClick={action.onClick}
                                                disabled={isPerformingBulkAction}
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
                                <div className="relative" ref={moreActionsRef}>
                                    <Button
                                        onClick={() => setShowBulkActions(!showBulkActions)}
                                        variant="default"
                                        size="sm"
                                        className="h-8 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800"
                                        disabled={isPerformingBulkAction}
                                    >
                                        {isPerformingBulkAction ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                            <>
                                                <Layers className="h-3.5 w-3.5 mr-1" />
                                                <span className="hidden sm:inline">More Actions</span>
                                                <span className="sm:hidden">More</span>
                                            </>
                                        )}
                                    </Button>
                                    
                                    {showBulkActions && (
                                        <div className="absolute right-0 top-full mt-1 z-50 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
                                            <div className="p-2">
                                                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1 mb-1">
                                                    BULK ACTIONS
                                                </div>
                                                {bulkActions.secondary.map((action, index) => (
                                                    <Button
                                                        key={index}
                                                        variant="ghost"
                                                        className="w-full justify-start h-8 text-sm dark:text-gray-300 dark:hover:bg-gray-800"
                                                        onClick={action.onClick}
                                                        disabled={isPerformingBulkAction}
                                                    >
                                                        {action.icon}
                                                        {action.label}
                                                    </Button>
                                                ))}
                                                
                                                <div className="border-t my-1 dark:border-gray-700"></div>
                                                
                                                {bulkActions.destructive.map((action, index) => (
                                                    <Button
                                                        key={index}
                                                        variant="ghost"
                                                        className="w-full justify-start h-8 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/50"
                                                        onClick={action.onClick}
                                                        disabled={isPerformingBulkAction}
                                                    >
                                                        {action.icon}
                                                        {action.label}
                                                    </Button>
                                                ))}
                                                
                                                {/* Custom Bulk Actions */}
                                                {customBulkActions.length > 0 && (
                                                    <>
                                                        <div className="border-t my-1 dark:border-gray-700"></div>
                                                        {customBulkActions.map((action, index) => (
                                                            <Button
                                                                key={index}
                                                                variant={action.variant || 'ghost'}
                                                                className={`w-full justify-start h-8 text-sm ${
                                                                    action.variant === 'destructive' 
                                                                        ? 'text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/50'
                                                                        : 'dark:text-gray-300 dark:hover:bg-gray-800'
                                                                }`}
                                                                onClick={action.onClick}
                                                                disabled={action.disabled || isPerformingBulkAction}
                                                            >
                                                                {action.icon}
                                                                {action.label}
                                                            </Button>
                                                        ))}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Exit Bulk Mode */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsBulkMode(false)}
                                    disabled={isPerformingBulkAction}
                                    className="text-xs h-8 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                                >
                                    <X className="h-3.5 w-3.5 mr-1.5" />
                                    {!isMobile && 'Exit'}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Enhanced stats of selected items */}
                {hasSelectedItems && selectionStats && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                            <div className="flex items-center gap-2">
                                <Receipt className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
                                <span className="font-medium dark:text-gray-300">
                                    {selectionStats.total} payments
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-3.5 w-3.5 text-green-500 dark:text-green-400" />
                                <span className="font-medium dark:text-gray-300">
                                    {formatCurrency(selectionStats.totalAmount)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-3.5 w-3.5 text-green-500 dark:text-green-400" />
                                <span className="font-medium dark:text-gray-300">
                                    {selectionStats.completed} completed
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CreditCard className="h-3.5 w-3.5 text-purple-500 dark:text-purple-400" />
                                <span className="font-medium dark:text-gray-300">
                                    {selectionStats.cashPayments} cash
                                </span>
                            </div>
                        </div>
                        
                        {/* Additional stats */}
                        {(selectionStats.residents > 0 || selectionStats.households > 0 || selectionStats.digitalPayments > 0) && (
                            <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-gray-500 dark:text-gray-400">
                                {selectionStats.residents > 0 && (
                                    <div className="flex items-center gap-1">
                                        <User className="h-3 w-3 text-blue-500 dark:text-blue-400" />
                                        <span>{selectionStats.residents} residents</span>
                                    </div>
                                )}
                                {selectionStats.households > 0 && (
                                    <div className="flex items-center gap-1">
                                        <Users className="h-3 w-3 text-green-500 dark:text-green-400" />
                                        <span>{selectionStats.households} households</span>
                                    </div>
                                )}
                                {selectionStats.digitalPayments > 0 && (
                                    <div className="flex items-center gap-1">
                                        <CreditCard className="h-3 w-3 text-purple-500 dark:text-purple-400" />
                                        <span>{selectionStats.digitalPayments} digital payments</span>
                                    </div>
                                )}
                                {selectionStats.avgAmount > 0 && (
                                    <div className="flex items-center gap-1">
                                        <DollarSign className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                                        <span>Avg: {formatCurrency(selectionStats.avgAmount)}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </TooltipProvider>
    );
}