// components/residentui/receipts/modern-receipt-list-view.tsx

import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Eye, MoreVertical, Copy, Download, Printer, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DataTable } from '@/components/residentui/modern/data-table';
import { StatusBadge } from '@/components/residentui/StatusBadge';
import { ReceiptItem } from '@/types/portal/receipts/receipt.types';

interface ModernReceiptListViewProps {
    receipts: ReceiptItem[];
    selectMode?: boolean;
    selectedReceipts?: number[];
    onSelectReceipt?: (receipt: ReceiptItem) => void;
    onSelectAll?: () => void;
    formatDate: (date: string | null) => string;
    formatCurrency: (amount: string | number) => string;
    onView: (id: number) => void;
    onDownload: (id: number) => void;
    onPrint: (id: number) => void;
    onCopyReceiptNumber: (receiptNumber: string) => void;
    onCopyORNNumber: (orNumber: string | null) => void;
}

export function ModernReceiptListView({
    receipts,
    selectMode = false,
    selectedReceipts = [],
    onSelectReceipt,
    onSelectAll,
    formatDate,
    formatCurrency,
    onView,
    onDownload,
    onPrint,
    onCopyReceiptNumber,
    onCopyORNNumber
}: ModernReceiptListViewProps) {
    // Determine if a receipt is overdue based on its status
    const isOverdue = (status: string) => status === 'overdue';

    const columns = [
        {
            key: 'receipt_details',
            header: 'Receipt Details',
            cell: (receipt: ReceiptItem) => (
                <div className="space-y-1">
                    <button
                        onClick={() => onCopyReceiptNumber(receipt.receipt_number)}
                        className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        {receipt.receipt_number}
                    </button>
                    <p className="font-medium text-gray-900 dark:text-white">
                        {receipt.payer_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {receipt.receipt_type_label}
                    </p>
                </div>
            )
        },
        {
            key: 'or_details',
            header: 'OR Details',
            cell: (receipt: ReceiptItem) => (
                <div className="space-y-1">
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">OR Number</p>
                        {receipt.or_number ? (
                            <button
                                onClick={() => onCopyORNNumber(receipt.or_number)}
                                className="font-mono text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                            >
                                {receipt.or_number}
                            </button>
                        ) : (
                            <p className="text-sm text-gray-500">—</p>
                        )}
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Payment Method</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            {receipt.payment_method_label}
                        </p>
                    </div>
                </div>
            )
        },
        {
            key: 'dates',
            header: 'Dates',
            cell: (receipt: ReceiptItem) => (
                <div className="space-y-1">
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Payment Date</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            {formatDate(receipt.payment_date || receipt.created_at)}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Items</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            {receipt.items_count} item{receipt.items_count !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
            )
        },
        {
            key: 'amount',
            header: 'Amount',
            cell: (receipt: ReceiptItem) => (
                <div className="space-y-1">
                    <p className="font-bold text-gray-900 dark:text-white">
                        {formatCurrency(receipt.formatted_total)}
                    </p>
                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        Paid: {formatCurrency(receipt.formatted_amount_paid)}
                    </p>
                    {receipt.has_discount && (
                        <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                            <Receipt className="h-3 w-3" /> Discount applied
                        </p>
                    )}
                </div>
            )
        },
        {
            key: 'status',
            header: 'Status',
            cell: (receipt: ReceiptItem) => (
                <StatusBadge 
                    status={receipt.status} 
                    isOverdue={isOverdue(receipt.status)}
                />
            )
        },
        {
            key: 'actions',
            header: 'Actions',
            className: 'text-right',
            cell: (receipt: ReceiptItem) => (
                <div className="flex justify-end gap-1">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    onClick={() => onView(receipt.id)}
                                    className="h-8 w-8 p-0 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
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
                                onClick={() => onCopyReceiptNumber(receipt.receipt_number)} 
                                className="text-gray-700 dark:text-gray-300"
                            >
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Receipt Number
                            </DropdownMenuItem>
                            {receipt.or_number && (
                                <DropdownMenuItem 
                                    onClick={() => onCopyORNNumber(receipt.or_number)} 
                                    className="text-gray-700 dark:text-gray-300"
                                >
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy OR Number
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                                onClick={() => onDownload(receipt.id)} 
                                className="text-gray-700 dark:text-gray-300"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                onClick={() => onPrint(receipt.id)} 
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

    const handleSelectItem = (receiptId: number) => {
        if (onSelectReceipt) {
            const receipt = receipts.find(r => r.id === receiptId);
            if (receipt) {
                onSelectReceipt(receipt);
            }
        }
    };

    return (
        <DataTable
            data={receipts}
            columns={columns}
            selectMode={selectMode}
            selectedItems={selectedReceipts}
            onSelectAll={onSelectAll}
            onSelectItem={handleSelectItem}
            getItemId={(receipt) => receipt.id}
        />
    );
}