import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Eye, MoreVertical, Copy, FileText, Printer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DataTable } from '@/components/residentui/modern/data-table';
import { StatusBadge } from '@/components/residentui/StatusBadge';
import { formatDate, getCategoryDisplay } from './fee-utils';
import { Fee, formatFeeAmount } from '@/types/portal/fees/my-fees';

interface ModernFeeListViewProps {
    fees: Fee[];
    selectMode?: boolean;
    selectedFees?: number[];
    onSelectFee?: (fee: Fee) => void;
    onSelectAll?: () => void;
    onCopyFeeCode?: (code: string) => void;
    onPrint?: () => void;
}

export function ModernFeeListView({
    fees,
    selectMode = false,
    selectedFees = [],
    onSelectFee,
    onSelectAll,
    onCopyFeeCode,
    onPrint
}: ModernFeeListViewProps) {
    // Helper function to format amount with fallback
    const formatAmount = (amount?: number): string => {
        if (!amount && amount !== 0) return '₱0.00';
        return `₱${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // Calculate paid amount (assuming balance is the remaining, so paid = total - balance)
    const getPaidAmount = (fee: Fee): number => {
        const total = fee.amount || 0;
        const balance = fee.balance || 0;
        return total - balance;
    };

    const columns = [
        {
            key: 'details',
            header: 'Fee Details',
            cell: (fee: Fee) => (
                <div className="space-y-1">
                    <button
                        onClick={() => onCopyFeeCode?.(fee.fee_code || '')}
                        className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        {fee.fee_code || 'N/A'}
                    </button>
                    <p className="font-medium text-gray-900 dark:text-white">
                        {fee.description || fee.purpose || 'Fee'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {getCategoryDisplay(fee.fee_type || fee.fee_type_name || '')}
                    </p>
                </div>
            )
        },
        {
            key: 'dates',
            header: 'Dates',
            cell: (fee: Fee) => (
                <div className="space-y-1">
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Issued</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            {formatDate(fee.created_at || fee.issue_date || '')}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Due</p>
                        <p className={cn(
                            "text-sm",
                            fee.is_overdue && "text-red-600 dark:text-red-400 font-medium"
                        )}>
                            {formatDate(fee.due_date || '')}
                            {fee.is_overdue && fee.days_overdue && fee.days_overdue > 0 && (
                                <span className="ml-1 text-xs text-red-500 dark:text-red-400">
                                    ({fee.days_overdue}d)
                                </span>
                            )}
                        </p>
                    </div>
                </div>
            )
        },
        {
            key: 'amount',
            header: 'Amount',
            cell: (fee: Fee) => {
                const totalAmount = fee.amount || 0;
                const balance = fee.balance || 0;
                const paidAmount = getPaidAmount(fee);
                const isFullyPaid = fee.status === 'paid' || balance === 0;
                
                return (
                    <div className="space-y-1">
                        <p className="font-bold text-gray-900 dark:text-white">
                            {formatAmount(totalAmount)}
                        </p>
                        {!isFullyPaid && balance > 0 ? (
                            <p className="text-sm font-medium text-red-600 dark:text-red-400">
                                Balance: {formatAmount(balance)}
                            </p>
                        ) : (
                            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                Paid: {formatAmount(paidAmount)}
                            </p>
                        )}
                    </div>
                );
            }
        },
        {
            key: 'status',
            header: 'Status',
            cell: (fee: Fee) => (
                <StatusBadge 
                    status={fee.status || ''} 
                    isOverdue={fee.is_overdue || false} 
                />
            )
        },
        {
            key: 'actions',
            header: 'Actions',
            className: 'text-right',
            cell: (fee: Fee) => (
                <div className="flex justify-end gap-1">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link href={`/portal/fees/${fee.id}`}>
                                    <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        className="h-8 w-8 p-0 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent>View Details</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 w-8 p-0 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            >
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent 
                            align="end" 
                            className="w-48 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                        >
                            <DropdownMenuItem 
                                onClick={() => onCopyFeeCode?.(fee.fee_code || '')} 
                                className="text-gray-700 dark:text-gray-300"
                            >
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Fee Code
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-gray-700 dark:text-gray-300">
                                <FileText className="h-4 w-4 mr-2" />
                                Generate Report
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                onClick={onPrint} 
                                className="text-gray-700 dark:text-gray-300"
                            >
                                <Printer className="h-4 w-4 mr-2" />
                                Print
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        }
    ];

    // Handle selection for the data table
    const handleSelectItem = (feeId: number) => {
        if (onSelectFee) {
            const fee = fees.find(f => f.id === feeId);
            if (fee) {
                onSelectFee(fee);
            }
        }
    };

    return (
        <DataTable
            data={fees}
            columns={columns}
            selectMode={selectMode}
            selectedItems={selectedFees}
            onSelectAll={onSelectAll}
            onSelectItem={handleSelectItem}
            getItemId={(fee) => fee.id}
        />
    );
}