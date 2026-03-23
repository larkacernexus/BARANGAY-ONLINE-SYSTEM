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

interface Fee {
    balance: number;
    id: number;
    fee_code: string;
    purpose: string;
    issue_date: string;
    due_date: string;
    formatted_total: string;
    formatted_balance: string;
    formatted_amount_paid: string;
    status: string;
    is_overdue: boolean;
    days_overdue: number;
    fee_type?: any;
}

interface ModernFeeListViewProps {
    fees: Fee[];
    selectMode?: boolean;
    selectedFees?: number[];
    onSelectFee?: (id: number) => void;
    onSelectAll?: () => void;
    onCopyFeeCode?: (code: string) => void;
    onPrint?: () => void;
}

export function ModernFeeListView({
    fees,
    selectMode,
    selectedFees = [],
    onSelectFee,
    onSelectAll,
    onCopyFeeCode,
    onPrint
}: ModernFeeListViewProps) {
    const columns = [
        {
            key: 'details',
            header: 'Fee Details',
            cell: (fee: Fee) => (
                <div className="space-y-1">
                    <button
                        onClick={() => onCopyFeeCode?.(fee.fee_code)}
                        className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        {fee.fee_code}
                    </button>
                    <p className="font-medium text-gray-900 dark:text-white">{fee.purpose}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {getCategoryDisplay(fee.fee_type)}
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
                        <p className="text-sm text-gray-700 dark:text-gray-300">{formatDate(fee.issue_date)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Due</p>
                        <p className={cn(
                            "text-sm",
                            fee.is_overdue && "text-red-600 dark:text-red-400 font-medium"
                        )}>
                            {formatDate(fee.due_date)}
                            {fee.is_overdue && fee.days_overdue > 0 && (
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
            cell: (fee: Fee) => (
                <div className="space-y-1">
                    <p className="font-bold text-gray-900 dark:text-white">{fee.formatted_total}</p>
                    {fee.balance > 0 ? (
                        <p className="text-sm font-medium text-red-600 dark:text-red-400">
                            Balance: {fee.formatted_balance}
                        </p>
                    ) : (
                        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                            Paid: {fee.formatted_amount_paid}
                        </p>
                    )}
                </div>
            )
        },
        {
            key: 'status',
            header: 'Status',
            cell: (fee: Fee) => <StatusBadge status={fee.status} isOverdue={fee.is_overdue} />
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
                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent>View Details</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                            <DropdownMenuItem onClick={() => onCopyFeeCode?.(fee.fee_code)} className="text-gray-700 dark:text-gray-300">
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Fee Code
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-gray-700 dark:text-gray-300">
                                <FileText className="h-4 w-4 mr-2" />
                                Generate Report
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={onPrint} className="text-gray-700 dark:text-gray-300">
                                <Printer className="h-4 w-4 mr-2" />
                                Print
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        }
    ];

    return (
        <DataTable
            data={fees}
            columns={columns}
            selectMode={selectMode}
            selectedItems={selectedFees}
            onSelectAll={onSelectAll}
            getItemId={(fee) => fee.id}
        />
    );
}