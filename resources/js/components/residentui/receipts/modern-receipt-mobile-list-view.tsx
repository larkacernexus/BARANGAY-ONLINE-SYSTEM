// components/residentui/receipts/modern-receipt-mobile-list-view.tsx

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Check, 
    Printer, 
    Download,
    MoreHorizontal, 
    Receipt, 
    ChevronRight,
    ChevronDown,
    Calendar,
    User,
    Hash,
    CreditCard,
    Copy,
    Eye,
    FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import type { ReceiptItem } from '@/types/portal/receipts/receipt.types';

interface ModernReceiptMobileListViewProps {
    receipts: ReceiptItem[];
    selectMode?: boolean;
    selectedReceipts?: number[];
    onSelectReceipt?: (receipt: ReceiptItem) => void;
    formatDate: (date: string | null) => string;
    formatCurrency: (amount: string | number | undefined | null) => string;
    onView: (id: number) => void;
    onDownload: (id: number) => void;
    onPrint: (id: number) => void;
    onCopyReceiptNumber: (code: string) => void;
    onCopyORNNumber: (orNumber: string | null) => void;
}

// Status badge config
const statusConfig: Record<string, { color: string; label: string }> = {
    paid: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', label: 'Paid' },
    partial: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', label: 'Partial' },
    pending: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300', label: 'Pending' },
    cancelled: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', label: 'Cancelled' },
};

export function ModernReceiptMobileListView({
    receipts,
    selectMode = false,
    selectedReceipts = [],
    onSelectReceipt,
    formatDate,
    formatCurrency,
    onView,
    onDownload,
    onPrint,
    onCopyReceiptNumber,
    onCopyORNNumber,
}: ModernReceiptMobileListViewProps) {
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const toggleExpand = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedId(expandedId === id ? null : id);
    };

    const handleCopy = (text: string, label: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!text) {
            toast.error(`No ${label} to copy`);
            return;
        }
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard`);
    };

    const getStatusBadge = (status?: string) => {
        const config = statusConfig[status || ''] || { color: 'bg-gray-100 text-gray-800', label: status || 'Unknown' };
        return config;
    };

    return (
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {receipts.map((receipt) => {
                const isSelected = selectedReceipts.includes(receipt.id);
                const isExpanded = expandedId === receipt.id;
                const statusBadge = getStatusBadge(receipt.status);
                const amount = receipt.amount ?? 0;
                const receiptNumber = receipt.receipt_number ?? 'N/A';
                const orNumber = receipt.or_number ?? null;

                return (
                    <div
                        key={receipt.id}
                        className={cn(
                            "relative transition-colors",
                            isSelected && "bg-blue-50 dark:bg-blue-900/20"
                        )}
                    >
                        {/* Main Row */}
                        <div 
                            className={cn(
                                "py-3 transition-colors cursor-pointer",
                                "active:bg-gray-50 dark:active:bg-gray-800/50"
                            )}
                            onClick={() => selectMode && onSelectReceipt?.(receipt)}
                        >
                            <div className="flex items-center gap-3">
                                {/* Selection Checkbox */}
                                {selectMode && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onSelectReceipt?.(receipt);
                                        }}
                                        className={cn(
                                            "flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                                            isSelected
                                                ? "bg-blue-500 border-blue-500"
                                                : "border-gray-300 dark:border-gray-600"
                                        )}
                                    >
                                        {isSelected && <Check className="h-3 w-3 text-white" />}
                                    </button>
                                )}

                                {/* Expand/Collapse Button */}
                                <button
                                    onClick={(e) => toggleExpand(receipt.id, e)}
                                    className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    {isExpanded ? (
                                        <ChevronDown className="h-4 w-4" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4" />
                                    )}
                                </button>

                                {/* Receipt Icon */}
                                <div className="flex-shrink-0">
                                    <div className={cn(
                                        "w-8 h-8 rounded-md flex items-center justify-center",
                                        receipt.status === 'paid' 
                                            ? "bg-green-50 dark:bg-green-900/20" 
                                            : "bg-blue-50 dark:bg-blue-900/20"
                                    )}>
                                        <Receipt className={cn(
                                            "h-4 w-4",
                                            receipt.status === 'paid'
                                                ? "text-green-600 dark:text-green-400"
                                                : "text-blue-600 dark:text-blue-400"
                                        )} />
                                    </div>
                                </div>

                                {/* Main Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <h3 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                            {receipt.payor_name || 'Unknown Payor'}
                                        </h3>
                                        <span className="font-semibold text-sm text-gray-900 dark:text-white ml-2">
                                            {formatCurrency(amount)}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (receipt.receipt_number) {
                                                    onCopyReceiptNumber(receipt.receipt_number);
                                                }
                                            }}
                                            className={cn(
                                                "font-mono",
                                                receipt.receipt_number ? "text-blue-600 dark:text-blue-400" : "text-gray-400"
                                            )}
                                        >
                                            {receiptNumber}
                                        </button>
                                        {orNumber && (
                                            <>
                                                <span>•</span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onCopyORNNumber(orNumber);
                                                    }}
                                                    className="font-mono text-gray-500 dark:text-gray-400"
                                                >
                                                    OR: {orNumber}
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Badge 
                                            variant="outline" 
                                            className={cn(
                                                "text-[10px] px-1.5 py-0 h-4 border-0",
                                                statusBadge.color
                                            )}
                                        >
                                            {statusBadge.label}
                                        </Badge>
                                        {receipt.payment_date && (
                                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                                <Calendar className="h-3 w-3" />
                                                <span>{formatDate(receipt.payment_date)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex-shrink-0 flex items-center gap-1">
                                    {!selectMode && (
                                        <>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-gray-500 dark:text-gray-400"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onView(receipt.id);
                                                }}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 text-gray-500 dark:text-gray-400"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-44">
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
                                                    {receipt.receipt_number && (
                                                        <DropdownMenuItem onClick={() => onCopyReceiptNumber(receipt.receipt_number!)}>
                                                            <Copy className="h-4 w-4 mr-2" />
                                                            Copy Receipt #
                                                        </DropdownMenuItem>
                                                    )}
                                                    {orNumber && (
                                                        <DropdownMenuItem onClick={() => onCopyORNNumber(orNumber)}>
                                                            <Copy className="h-4 w-4 mr-2" />
                                                            Copy OR #
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Expandable Details Section */}
                        {isExpanded && !selectMode && (
                            <div className="px-3 pb-3 pl-14 bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800">
                                <div className="pt-3 space-y-2">
                                    {/* Receipt Number */}
                                    {receipt.receipt_number && (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs">
                                                <Hash className="h-3.5 w-3.5 text-gray-400" />
                                                <span className="text-gray-500 dark:text-gray-400">Receipt #:</span>
                                                <span className="font-mono text-gray-700 dark:text-gray-300">
                                                    {receipt.receipt_number}
                                                </span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 px-2 text-xs"
                                                onClick={(e) => handleCopy(receipt.receipt_number!, 'Receipt number', e)}
                                            >
                                                <Copy className="h-3 w-3 mr-1" />
                                                Copy
                                            </Button>
                                        </div>
                                    )}

                                    {/* OR Number */}
                                    {orNumber && (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs">
                                                <FileText className="h-3.5 w-3.5 text-gray-400" />
                                                <span className="text-gray-500 dark:text-gray-400">OR #:</span>
                                                <span className="font-mono text-gray-700 dark:text-gray-300">
                                                    {orNumber}
                                                </span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 px-2 text-xs"
                                                onClick={(e) => handleCopy(orNumber, 'OR number', e)}
                                            >
                                                <Copy className="h-3 w-3 mr-1" />
                                                Copy
                                            </Button>
                                        </div>
                                    )}

                                    {/* Payor */}
                                    <div className="flex items-center gap-2 text-xs">
                                        <User className="h-3.5 w-3.5 text-gray-400" />
                                        <span className="text-gray-500 dark:text-gray-400">Payor:</span>
                                        <span className="text-gray-700 dark:text-gray-300">
                                            {receipt.payor_name || 'N/A'}
                                        </span>
                                    </div>

                                    {/* Receipt Type */}
                                    {receipt.receipt_type && (
                                        <div className="flex items-center gap-2 text-xs">
                                            <Receipt className="h-3.5 w-3.5 text-gray-400" />
                                            <span className="text-gray-500 dark:text-gray-400">Type:</span>
                                            <span className="text-gray-700 dark:text-gray-300 capitalize">
                                                {receipt.receipt_type.replace('_', ' ')}
                                            </span>
                                        </div>
                                    )}

                                    {/* Amount Details */}
                                    <div className="flex items-center gap-2 text-xs">
                                        <CreditCard className="h-3.5 w-3.5 text-gray-400" />
                                        <span className="text-gray-500 dark:text-gray-400">Amount:</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            {formatCurrency(amount)}
                                        </span>
                                    </div>

                                    {/* Payment Method */}
                                    {receipt.payment_method && (
                                        <div className="flex items-center gap-2 text-xs">
                                            <CreditCard className="h-3.5 w-3.5 text-gray-400" />
                                            <span className="text-gray-500 dark:text-gray-400">Method:</span>
                                            <span className="text-gray-700 dark:text-gray-300 capitalize">
                                                {receipt.payment_method.replace('_', ' ')}
                                            </span>
                                        </div>
                                    )}

                                    {/* Dates */}
                                    {receipt.payment_date && (
                                        <div className="flex items-center gap-2 text-xs">
                                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                            <span className="text-gray-500 dark:text-gray-400">Payment Date:</span>
                                            <span className="text-gray-700 dark:text-gray-300">
                                                {formatDate(receipt.payment_date)}
                                            </span>
                                        </div>
                                    )}

                                    {/* Description if available */}
                                    {receipt.description && (
                                        <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Description:</p>
                                            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                                                {receipt.description}
                                            </p>
                                        </div>
                                    )}

                                    {/* Quick Actions */}
                                    <div className="flex gap-2 pt-3">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1 h-8 text-xs"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onView(receipt.id);
                                            }}
                                        >
                                            <Eye className="h-3.5 w-3.5 mr-1" />
                                            View
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1 h-8 text-xs"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDownload(receipt.id);
                                            }}
                                        >
                                            <Download className="h-3.5 w-3.5 mr-1" />
                                            Download
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1 h-8 text-xs"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onPrint(receipt.id);
                                            }}
                                        >
                                            <Printer className="h-3.5 w-3.5 mr-1" />
                                            Print
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}