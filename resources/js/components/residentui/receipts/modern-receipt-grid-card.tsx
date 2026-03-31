// components/residentui/receipts/modern-receipt-grid-card.tsx (Fixed)

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '../StatusBadge';
import { Check, Eye, Download, Printer, Copy, MoreVertical, FileText, Receipt as ReceiptIcon } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ReceiptItem } from '@/types/portal/receipts/receipt.types';

interface ModernReceiptGridCardProps {
    receipt: ReceiptItem;
    selectMode?: boolean;
    selectedReceipts?: number[];
    toggleSelectReceipt?: (id: number) => void;
    formatDate: (date: string | null) => string;
    formatCurrency: (amount: string | number) => string;
    onView: (id: number) => void;
    onDownload: (id: number) => void;
    onPrint: (id: number) => void;
    onCopyReceiptNumber: (receiptNumber: string) => void;
    onCopyORNNumber: (orNumber: string | null) => void;
}

export const ModernReceiptGridCard = ({
    receipt,
    selectMode = false,
    selectedReceipts = [],
    toggleSelectReceipt,
    formatDate,
    formatCurrency,
    onView,
    onDownload,
    onPrint,
    onCopyReceiptNumber,
    onCopyORNNumber
}: ModernReceiptGridCardProps) => {
    const isOverdue = receipt.status === 'overdue';
    const isCancelled = receipt.status === 'cancelled';
    const isPaid = receipt.status === 'paid';
    const isPartial = receipt.status === 'partial';
    const isPending = receipt.status === 'pending';

    const handleCopyReceiptCode = () => {
        onCopyReceiptNumber(receipt.receipt_number);
    };

    const handleCopyORN = () => {
        if (receipt.or_number) {
            onCopyORNNumber(receipt.or_number);
        }
    };

    return (
        <div className="animate-fade-in-up">
            <Card className={cn(
                "border-0 shadow-lg hover:shadow-xl transition-all duration-300 group bg-white dark:bg-gray-800",
                selectMode && selectedReceipts.includes(receipt.id) && "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900",
                isOverdue && "border-l-4 border-l-red-500",
                isCancelled && "opacity-75"
            )}>
                <CardContent className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                            {selectMode && (
                                <button
                                    onClick={() => toggleSelectReceipt?.(receipt.id)}
                                    className={cn(
                                        "mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                                        selectedReceipts.includes(receipt.id)
                                            ? "bg-blue-500 border-blue-500"
                                            : "border-gray-300 dark:border-gray-600 group-hover:border-gray-400 dark:group-hover:border-gray-500"
                                    )}
                                >
                                    {selectedReceipts.includes(receipt.id) && (
                                        <Check className="h-3 w-3 text-white" />
                                    )}
                                </button>
                            )}
                            
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <button
                                        onClick={handleCopyReceiptCode}
                                        className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        {receipt.receipt_number}
                                    </button>
                                    <StatusBadge 
                                        status={receipt.status} 
                                        isOverdue={isOverdue}
                                    />
                                </div>
                                <p className="font-medium text-gray-900 dark:text-white line-clamp-2">
                                    {receipt.payer_name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    {receipt.receipt_type_label}
                                </p>
                            </div>
                        </div>
                        
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 w-8 p-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                                <DropdownMenuItem 
                                    onClick={handleCopyReceiptCode}
                                    className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy Receipt Number
                                </DropdownMenuItem>
                                {receipt.or_number && (
                                    <DropdownMenuItem 
                                        onClick={handleCopyORN}
                                        className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    >
                                        <Copy className="h-4 w-4 mr-2" />
                                        Copy OR Number
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                                <DropdownMenuItem 
                                    onClick={() => onDownload(receipt.id)}
                                    className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download PDF
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                    onClick={() => onPrint(receipt.id)}
                                    className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <Printer className="h-4 w-4 mr-2" />
                                    Print
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">OR Number</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {receipt.or_number || '—'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Items</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {receipt.items_count} item{receipt.items_count !== 1 ? 's' : ''}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Payment Date</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {formatDate(receipt.payment_date || receipt.created_at)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Payment Method</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {receipt.payment_method_label}
                            </p>
                        </div>
                    </div>

                    {/* Amount Section */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 mb-3">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Total Amount</span>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                                {formatCurrency(receipt.formatted_total)}
                            </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Amount Paid</span>
                            <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                {formatCurrency(receipt.formatted_amount_paid)}
                            </span>
                        </div>

                        {receipt.has_discount && (
                            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                    <ReceiptIcon className="h-3 w-3" />
                                    Discount Applied
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => onView(receipt.id)}
                            className="flex-1 gap-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            <Eye className="h-4 w-4" />
                            View Details
                        </Button>
                        <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => onDownload(receipt.id)}
                            className="gap-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            <Download className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};