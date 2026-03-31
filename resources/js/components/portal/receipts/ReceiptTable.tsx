// components/residentui/receipts/ReceiptTable.tsx

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, Download, Printer, Copy, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ReceiptItem, ReceiptTableProps } from '@/types/portal/receipts/receipt.types';

const getStatusBadgeClass = (status: string) => {
    const classes = {
        paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        partial: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
        pending: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
        cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return classes[status as keyof typeof classes] || classes.pending;
};

export const ReceiptTable = ({
    receipts,
    selectMode = false,
    selectedReceipts = [],
    toggleSelectReceipt,
    selectAllReceipts,
    formatDate,
    formatCurrency,
    onView,
    onDownload,
    onPrint,
    onCopyReceiptNumber,
    onCopyORNNumber
}: ReceiptTableProps) => {
    const getFormattedDate = (receipt: ReceiptItem): string => {
        const dateToUse = receipt.payment_date || receipt.created_at;
        if (!dateToUse) return 'N/A';
        return formatDate(dateToUse);
    };

    return (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-900/50">
                        {selectMode && (
                            <TableHead className="w-12">
                                <Checkbox
                                    checked={selectedReceipts.length === receipts.length && receipts.length > 0}
                                    onCheckedChange={selectAllReceipts}
                                />
                            </TableHead>
                        )}
                        <TableHead>Receipt #</TableHead>
                        <TableHead>OR #</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-20">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {receipts.map((receipt) => (
                        <TableRow 
                            key={receipt.id}
                            className={cn(
                                "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50",
                                selectMode && selectedReceipts.includes(receipt.id) && "bg-blue-50 dark:bg-blue-900/20"
                            )}
                            onClick={() => selectMode && toggleSelectReceipt?.(receipt.id)}
                        >
                            {selectMode && (
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                    <Checkbox
                                        checked={selectedReceipts.includes(receipt.id)}
                                        onCheckedChange={() => toggleSelectReceipt?.(receipt.id)}
                                    />
                                </TableCell>
                            )}
                            <TableCell className="font-mono font-medium">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onCopyReceiptNumber(receipt.receipt_number);
                                    }}
                                    className="text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    {receipt.receipt_number}
                                </button>
                            </TableCell>
                            <TableCell>
                                {receipt.or_number ? (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onCopyORNNumber(receipt.or_number);
                                        }}
                                        className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                    >
                                        {receipt.or_number}
                                    </button>
                                ) : '—'}
                            </TableCell>
                            <TableCell>{receipt.receipt_type_label}</TableCell>
                            <TableCell>{getFormattedDate(receipt)}</TableCell>
                            <TableCell>{receipt.payment_method_label || receipt.payment_method}</TableCell>
                            <TableCell className="text-right font-medium">
                                {formatCurrency(receipt.formatted_total)}
                            </TableCell>
                            <TableCell>
                                <span className={cn(
                                    "px-2 py-1 rounded-full text-xs font-medium",
                                    getStatusBadgeClass(receipt.status)
                                )}>
                                    {receipt.status.charAt(0).toUpperCase() + receipt.status.slice(1)}
                                </span>
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuItem onClick={() => onView(receipt.id)}>
                                            <Eye className="h-4 w-4 mr-2" />
                                            View Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onDownload(receipt.id)}>
                                            <Download className="h-4 w-4 mr-2" />
                                            Download PDF
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onPrint(receipt.id)}>
                                            <Printer className="h-4 w-4 mr-2" />
                                            Print Receipt
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};