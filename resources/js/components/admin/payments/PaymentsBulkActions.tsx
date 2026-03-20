import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
    PackageCheck,
    PackageX,
    ClipboardCopy,
    FileSpreadsheet,
    Printer,
    Edit,
    Layers,
    X,
    Loader2,
    Mail,
    CheckCheck,
    QrCode,
    Trash2,
    Receipt,
    DollarSign,
    CheckCircle,
    CreditCard,
    User,
    Users,
    CheckSquare,
    Square,
    FileText,
    Archive
} from 'lucide-react';
import { RefObject } from 'react';
import { SelectionStats } from '@/types/payments.types';

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
    onBulkOperation: (operation: string) => void;
    onCopySelectedData: () => void;
    setShowBulkDeleteDialog: (show: boolean) => void;
    bulkActionRef?: RefObject<HTMLDivElement>;
    showBulkActions?: boolean;
    setShowBulkActions?: (show: boolean) => void;
    setIsBulkMode: (value: boolean) => void;
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
    setIsBulkMode
}: PaymentsBulkActionsProps) {
    
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    // Bulk action items configuration
    const bulkActions = {
        primary: [
            {
                label: 'Export',
                icon: <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('export'),
                tooltip: 'Export selected payments as CSV'
            },
            {
                label: 'Print',
                icon: <Printer className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('print'),
                tooltip: 'Print payment receipts'
            }
        ],
        secondary: [
            {
                label: 'Update Status',
                icon: <Edit className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('update_status'),
                tooltip: 'Bulk edit selected payments'
            },
            {
                label: 'Mark as Cleared',
                icon: <CheckCheck className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('mark_cleared'),
                tooltip: 'Mark selected as cleared'
            },
            {
                label: 'Send Receipts',
                icon: <Mail className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('send_receipt'),
                tooltip: 'Send receipts via email/SMS'
            },
            {
                label: 'Generate QR Codes',
                icon: <QrCode className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('generate_qr'),
                tooltip: 'Generate QR codes for selected payments'
            },
            {
                label: 'Copy Data',
                icon: <ClipboardCopy className="h-3.5 w-3.5 mr-1.5" />,
                onClick: onCopySelectedData,
                tooltip: 'Copy selected data as CSV'
            }
        ],
        destructive: [
            {
                label: 'Delete',
                icon: <Trash2 className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => setShowBulkDeleteDialog(true),
                tooltip: 'Delete selected payments',
                variant: 'destructive' as const
            }
        ]
    };

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Left side: Selection info */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                                {selectedPayments.length}
                            </span>
                        </div>
                        <div>
                            <span className="font-medium text-sm sm:text-base">
                                {selectedPayments.length} payment(s) selected
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
                            {selectionStats.totalAmount && selectionStats.totalAmount > 0 && (
                                <span className="flex items-center gap-1">
                                    <DollarSign className="w-3 h-3 text-green-500" />
                                    Total: {formatCurrency(selectionStats.totalAmount)}
                                </span>
                            )}
                            {selectionStats.completed && selectionStats.completed > 0 && (
                                <span className="flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3 text-green-500" />
                                    {selectionStats.completed} completed
                                </span>
                            )}
                            {selectionStats.cashPayments && selectionStats.cashPayments > 0 && (
                                <span className="flex items-center gap-1">
                                    <CreditCard className="w-3 h-3 text-purple-500" />
                                    {selectionStats.cashPayments} cash
                                </span>
                            )}
                        </div>
                    )}
                </div>
                
                {/* Right side: Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3" ref={bulkActionRef}>
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
                                        Select All Payments
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Bulk Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Primary Actions */}
                        {bulkActions.primary.map((action, index) => (
                            <Tooltip key={index}>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="default"
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
                        
                        {/* More Actions Dropdown (if setShowBulkActions is provided) */}
                        {setShowBulkActions && (
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
                                            <span className="hidden sm:inline">More</span>
                                        </>
                                    )}
                                </Button>
                                
                                {showBulkActions && (
                                    <div className="absolute right-0 top-full mt-1 z-50 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
                                        <div className="p-2">
                                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1">
                                                BULK ACTIONS
                                            </div>
                                            {bulkActions.secondary.map((action, index) => (
                                                <Button
                                                    key={index}
                                                    variant="ghost"
                                                    className="w-full justify-start h-8 text-sm"
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
                                                    className="w-full justify-start h-8 text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={action.onClick}
                                                    disabled={isPerformingBulkAction}
                                                >
                                                    {action.icon}
                                                    {action.label}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {/* Destructive Actions (if not using dropdown) */}
                        {!setShowBulkActions && bulkActions.destructive.map((action, index) => (
                            <Tooltip key={index}>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="destructive"
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
                        
                        {/* Exit Bulk Mode */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsBulkMode(false)}
                            disabled={isPerformingBulkAction}
                            className="text-xs h-8"
                        >
                            <X className="h-3.5 w-3.5 mr-1.5" />
                            {!isMobile && 'Exit'}
                        </Button>
                    </div>
                </div>
            </div>
            
            {/* Enhanced stats of selected items */}
            {selectedPayments.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                            <Receipt className="h-3.5 w-3.5 text-blue-500" />
                            <span className="font-medium">
                                {selectionStats.total} payments
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <DollarSign className="h-3.5 w-3.5 text-green-500" />
                            <span className="font-medium">
                                {formatCurrency(selectionStats.totalAmount)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                            <span className="font-medium">
                                {selectionStats.completed} completed
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CreditCard className="h-3.5 w-3.5 text-purple-500" />
                            <span className="font-medium">
                                {selectionStats.cashPayments} cash
                            </span>
                        </div>
                    </div>
                    {(selectionStats.residents || selectionStats.households) && (
                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
                            {selectionStats.residents > 0 && (
                                <div className="flex items-center gap-1">
                                    <User className="h-3 w-3 text-blue-500" />
                                    <span>{selectionStats.residents} residents</span>
                                </div>
                            )}
                            {selectionStats.households > 0 && (
                                <div className="flex items-center gap-1">
                                    <Users className="h-3 w-3 text-green-500" />
                                    <span>{selectionStats.households} households</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}