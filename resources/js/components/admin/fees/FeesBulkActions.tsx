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
    FileDigit as FileDigitIcon,
    Receipt,
    User,
    Home,
    Building,
    Loader2,
    CheckSquare,
    Square
} from 'lucide-react';
import { SelectionStats } from '@/types/fees.types';

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

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2
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
    bulkActions: customBulkActions
}: FeesBulkActionsProps) {
    
    // Default bulk actions for fees
    const defaultBulkActions = {
        primary: [
            {
                label: 'Export',
                icon: <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('export'),
                tooltip: 'Export selected fees as CSV',
                variant: 'default' as const
            },
            {
                label: 'Print',
                icon: <Printer className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('print'),
                tooltip: 'Print selected fees',
                variant: 'default' as const
            }
        ],
        secondary: [
            {
                label: 'Mark Paid',
                icon: <CheckCircle className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('mark_paid'),
                tooltip: 'Mark selected as paid',
                variant: 'outline' as const
            },
            {
                label: 'Mark Unpaid',
                icon: <PackageX className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('mark_unpaid'),
                tooltip: 'Mark selected as unpaid',
                variant: 'outline' as const
            },
            {
                label: 'Generate Receipts',
                icon: <Receipt className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('generate_receipts'),
                tooltip: 'Generate receipts for selected fees',
                variant: 'outline' as const
            },
            {
                label: 'Generate Certificates',
                icon: <FileDigitIcon className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('generate_certificates'),
                tooltip: 'Generate certificates for selected fees',
                variant: 'outline' as const
            },
            {
                label: 'Copy Data',
                icon: <ClipboardCopy className="h-3.5 w-3.5 mr-1.5" />,
                onClick: onCopySelectedData,
                tooltip: 'Copy selected data as CSV',
                variant: 'outline' as const
            }
        ],
        destructive: [
            {
                label: 'Delete',
                icon: <Trash2 className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => setShowBulkDeleteDialog?.(true),
                tooltip: 'Delete selected fees',
                variant: 'destructive' as const
            }
        ]
    };

    const bulkActions = customBulkActions || defaultBulkActions;

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4 mb-4">
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
                            <span className="font-medium text-sm sm:text-base">
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
                    {selectionStats && (
                        <div className="hidden sm:flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            {selectionStats.totalAmount && selectionStats.totalAmount > 0 && (
                                <span className="flex items-center gap-1">
                                    <DollarSign className="w-3 h-3 text-green-500" />
                                    Total: {formatCurrency(selectionStats.totalAmount)}
                                </span>
                            )}
                            {selectionStats.totalBalance && selectionStats.totalBalance > 0 && (
                                <span className="flex items-center gap-1">
                                    <CreditCard className="w-3 h-3 text-indigo-500" />
                                    Balance: {formatCurrency(selectionStats.totalBalance)}
                                </span>
                            )}
                            {selectionStats.overdueCount && selectionStats.overdueCount > 0 && (
                                <span className="flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3 text-red-500" />
                                    {selectionStats.overdueCount} overdue
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
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
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
                                        Select All Fees
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
                                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
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
            
            {/* Enhanced stats of selected items */}
            {selectionStats && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                            <FileDigitIcon className="h-3.5 w-3.5 text-blue-500" />
                            <span className="font-medium">
                                {selectionStats.total} fees
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <DollarSign className="h-3.5 w-3.5 text-green-500" />
                            <span className="font-medium">
                                {formatCurrency(selectionStats.totalAmount)} total
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CreditCard className="h-3.5 w-3.5 text-indigo-500" />
                            <span className="font-medium">
                                {formatCurrency(selectionStats.totalBalance)} balance
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                            <span className="font-medium">
                                {selectionStats.overdueCount} overdue
                            </span>
                        </div>
                    </div>
                    
                    {selectionStats.withCertificates || selectionStats.withReceipts ? (
                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
                            {selectionStats.withCertificates > 0 && (
                                <div className="flex items-center gap-1">
                                    <FileDigitIcon className="h-3 w-3 text-purple-500" />
                                    <span>{selectionStats.withCertificates} certificates</span>
                                </div>
                            )}
                            {selectionStats.withReceipts > 0 && (
                                <div className="flex items-center gap-1">
                                    <Receipt className="h-3 w-3 text-green-500" />
                                    <span>{selectionStats.withReceipts} receipts</span>
                                </div>
                            )}
                        </div>
                    ) : null}
                    
                    {(selectionStats.residents || selectionStats.households || selectionStats.businesses) && (
                        <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-gray-500 dark:text-gray-400">
                            {selectionStats.residents > 0 && (
                                <div className="flex items-center gap-1">
                                    <User className="h-3 w-3 text-blue-500" />
                                    <span>{selectionStats.residents} residents</span>
                                </div>
                            )}
                            {selectionStats.households > 0 && (
                                <div className="flex items-center gap-1">
                                    <Home className="h-3 w-3 text-amber-500" />
                                    <span>{selectionStats.households} households</span>
                                </div>
                            )}
                            {selectionStats.businesses > 0 && (
                                <div className="flex items-center gap-1">
                                    <Building className="h-3 w-3 text-emerald-500" />
                                    <span>{selectionStats.businesses} businesses</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}