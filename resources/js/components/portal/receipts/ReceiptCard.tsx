// components/residentui/receipts/ReceiptCard.tsx

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Copy, Download, Printer, MoreVertical, CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ReceiptItem, ReceiptCardProps } from '@/types/portal/receipts/receipt.types';

const getStatusConfig = (status: string) => {
    const configs = {
        paid: { icon: CheckCircle, color: 'text-green-500 bg-green-100 dark:bg-green-900/20', label: 'Paid' },
        partial: { icon: Clock, color: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20', label: 'Partial' },
        pending: { icon: AlertCircle, color: 'text-orange-500 bg-orange-100 dark:bg-orange-900/20', label: 'Pending' },
        cancelled: { icon: XCircle, color: 'text-red-500 bg-red-100 dark:bg-red-900/20', label: 'Cancelled' },
    };
    return configs[status as keyof typeof configs] || configs.pending;
};

export const ReceiptCard = ({
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
    isMobile = false
}: ReceiptCardProps) => {
    const statusConfig = getStatusConfig(receipt.status);
    const StatusIcon = statusConfig.icon;
    
    const getFormattedDate = (): string => {
        const dateToUse = receipt.payment_date || receipt.created_at;
        if (!dateToUse) return 'N/A';
        return formatDate(dateToUse);
    };

    const handleSelect = () => {
        if (selectMode && toggleSelectReceipt) {
            toggleSelectReceipt(receipt.id);
        }
    };

    const handleCopyReceipt = (e: React.MouseEvent) => {
        e.stopPropagation();
        onCopyReceiptNumber(receipt.receipt_number);
    };

    const handleCopyOR = (e: React.MouseEvent) => {
        e.stopPropagation();
        onCopyORNNumber(receipt.or_number);
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

    return (
        <Card 
            className={cn(
                "border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 cursor-pointer",
                selectMode && selectedReceipts.includes(receipt.id) && "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900"
            )}
            onClick={handleSelect}
        >
            <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <button
                                onClick={handleCopyReceipt}
                                className="font-mono text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                #{receipt.receipt_number}
                            </button>
                            <span className={cn(
                                "px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1",
                                statusConfig.color
                            )}>
                                <StatusIcon className="h-3 w-3" />
                                {statusConfig.label}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {receipt.receipt_type_label}
                        </p>
                        {receipt.or_number && (
                            <button
                                onClick={handleCopyOR}
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
                                Copy Receipt #
                            </DropdownMenuItem>
                            {receipt.or_number && (
                                <DropdownMenuItem onClick={handleCopyOR}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy OR #
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={handleDownload}>
                                <Download className="h-4 w-4 mr-2" />
                                Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handlePrint}>
                                <Printer className="h-4 w-4 mr-2" />
                                Print Receipt
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                            {getFormattedDate()}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Method</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                            {receipt.payment_method_label || receipt.payment_method}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Amount:</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                        {formatCurrency(receipt.formatted_total)}
                    </span>
                </div>

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
                        Download
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};