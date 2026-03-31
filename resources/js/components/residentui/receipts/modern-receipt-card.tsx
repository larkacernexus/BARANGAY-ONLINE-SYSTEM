// components/residentui/receipts/modern-receipt-card.tsx (Mobile Version - Revised)

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '../StatusBadge';
import { Eye, Copy, MoreVertical, FileText, Printer, Download } from 'lucide-react';
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

interface ModernReceiptCardProps {
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
    isMobile?: boolean;
}

export const ModernReceiptCard = ({
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
    onCopyORNNumber,
    isMobile = true
}: ModernReceiptCardProps) => {
    const isOverdue = receipt.status === 'overdue';
    const isCancelled = receipt.status === 'cancelled';
    const isPaid = receipt.status === 'paid';
    const isPartial = receipt.status === 'partial';
    const isPending = receipt.status === 'pending';

    const handleCopyReceipt = (e: React.MouseEvent) => {
        e.stopPropagation();
        onCopyReceiptNumber(receipt.receipt_number);
    };

    const handleCopyORN = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (receipt.or_number) {
            onCopyORNNumber(receipt.or_number);
        }
    };

    const handleView = (e: React.MouseEvent) => {
        e.stopPropagation();
        onView(receipt.id);
    };

    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDownload(receipt.id);
    };

    const handlePrint = (e: React.MouseEvent) => {
        e.stopPropagation();
        onPrint(receipt.id);
    };

    const handleSelect = () => {
        if (selectMode && toggleSelectReceipt) {
            toggleSelectReceipt(receipt.id);
        }
    };

    // Determine badge variant
    const getStatusVariant = () => {
        if (isPaid) return 'success';
        if (isPartial) return 'warning';
        if (isPending) return 'info';
        if (isCancelled) return 'destructive';
        if (isOverdue) return 'error';
        return 'default';
    };

    return (
        <Card 
            className={cn(
                "border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 cursor-pointer",
                selectMode && selectedReceipts.includes(receipt.id) && "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900",
                isOverdue && "border-l-4 border-l-red-500",
                isCancelled && "opacity-75"
            )}
            onClick={handleSelect}
        >
            <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <button
                                onClick={handleCopyReceipt}
                                className="font-mono text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                {receipt.receipt_number}
                            </button>
                            <StatusBadge 
                                status={receipt.status} 
                                isOverdue={isOverdue}
                            />
                        </div>
                        <p className="font-medium text-gray-900 dark:text-white line-clamp-2 text-sm">
                            {receipt.payer_name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {receipt.receipt_type_label}
                        </p>
                        {receipt.or_number && (
                            <button
                                onClick={handleCopyORN}
                                className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mt-1"
                            >
                                OR: {receipt.or_number}
                            </button>
                        )}
                    </div>
                    
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-gray-500 dark:text-gray-400"
                            >
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={handleCopyReceipt}>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Receipt Number
                            </DropdownMenuItem>
                            {receipt.or_number && (
                                <DropdownMenuItem onClick={handleCopyORN}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy OR Number
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={handleDownload}>
                                <Download className="h-4 w-4 mr-2" />
                                Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handlePrint}>
                                <Printer className="h-4 w-4 mr-2" />
                                Print
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Payment Date</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                            {formatDate(receipt.payment_date || receipt.created_at)}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Payment Method</p>
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                            {receipt.payment_method_label}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Amount:</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                        {formatCurrency(receipt.formatted_total)}
                    </span>
                </div>

                <div className="flex items-center justify-between mb-3 text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Amount Paid:</span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(receipt.formatted_amount_paid)}
                    </span>
                </div>

                {receipt.has_discount && (
                    <div className="mb-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            Discount Applied
                        </p>
                    </div>
                )}

                <div className="flex gap-2">
                    <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 gap-2"
                        onClick={handleView}
                    >
                        <Eye className="h-3 w-3" />
                        View Details
                    </Button>
                    
                    <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 gap-2"
                        onClick={handleDownload}
                    >
                        <Download className="h-3 w-3" />
                        PDF
                    </Button>
                    
                    <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 gap-2"
                        onClick={handlePrint}
                    >
                        <Printer className="h-3 w-3" />
                        Print
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};