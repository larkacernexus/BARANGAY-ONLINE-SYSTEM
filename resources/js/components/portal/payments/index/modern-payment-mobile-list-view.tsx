// components/portal/payments/index/modern-payment-mobile-list-view.tsx

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
    Hash,
    CreditCard,
    Copy,
    Eye,
    FileText,
    AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import type { Payment } from '@/types/portal/payments/payment.types';

interface ModernPaymentMobileListViewProps {
    payments: Payment[];
    selectMode?: boolean;
    selectedPayments?: number[];
    onSelectPayment?: (id: number) => void;
    formatDate: (date: string | null | undefined) => string;
    formatCurrency: (amount: number | undefined) => string;
    onViewDetails: (id: number) => void;
    onDownloadReceipt: (payment: Payment) => void;
    onCopyOrNumber: (orNumber: string) => void;
    onCopyReference: (ref: string) => void;
    onGenerateReceipt: (payment: Payment) => void;
}

// Status badge config
const statusConfig: Record<string, { color: string; label: string; icon: any }> = {
    paid: { 
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', 
        label: 'Paid',
        icon: Check
    },
    pending: { 
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', 
        label: 'Pending',
        icon: AlertCircle
    },
    overdue: { 
        color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', 
        label: 'Overdue',
        icon: AlertCircle
    },
    cancelled: { 
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300', 
        label: 'Cancelled',
        icon: AlertCircle
    },
};

export function ModernPaymentMobileListView({
    payments,
    selectMode = false,
    selectedPayments = [],
    onSelectPayment,
    formatDate,
    formatCurrency,
    onViewDetails,
    onDownloadReceipt,
    onCopyOrNumber,
    onCopyReference,
    onGenerateReceipt,
}: ModernPaymentMobileListViewProps) {
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
        const config = statusConfig[status || ''] || { 
            color: 'bg-gray-100 text-gray-800', 
            label: status || 'Unknown',
            icon: AlertCircle
        };
        return config;
    };

    return (
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {payments.map((payment) => {
                const isSelected = selectedPayments.includes(payment.id);
                const isExpanded = expandedId === payment.id;
                const statusBadge = getStatusBadge(payment.status);
                const StatusIcon = statusBadge.icon;
                const amount = payment.total_amount ?? 0;
                const orNumber = payment.or_number ?? 'N/A';
                const referenceNumber = payment.reference_number ?? null;

                return (
                    <div
                        key={payment.id}
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
                            onClick={() => selectMode && onSelectPayment?.(payment.id)}
                        >
                            <div className="flex items-center gap-3">
                                {/* Selection Checkbox */}
                                {selectMode && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onSelectPayment?.(payment.id);
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
                                    onClick={(e) => toggleExpand(payment.id, e)}
                                    className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    {isExpanded ? (
                                        <ChevronDown className="h-4 w-4" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4" />
                                    )}
                                </button>

                                {/* Payment Icon */}
                                <div className="flex-shrink-0">
                                    <div className={cn(
                                        "w-8 h-8 rounded-md flex items-center justify-center",
                                        payment.status === 'paid' 
                                            ? "bg-green-50 dark:bg-green-900/20" 
                                            : payment.status === 'pending'
                                                ? "bg-yellow-50 dark:bg-yellow-900/20"
                                                : "bg-blue-50 dark:bg-blue-900/20"
                                    )}>
                                        <Receipt className={cn(
                                            "h-4 w-4",
                                            payment.status === 'paid'
                                                ? "text-green-600 dark:text-green-400"
                                                : payment.status === 'pending'
                                                    ? "text-yellow-600 dark:text-yellow-400"
                                                    : "text-blue-600 dark:text-blue-400"
                                        )} />
                                    </div>
                                </div>

                                {/* Main Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <h3 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                            {payment.purpose || 'Payment'}
                                        </h3>
                                        <span className="font-semibold text-sm text-gray-900 dark:text-white ml-2">
                                            {formatCurrency(amount)}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (payment.or_number) {
                                                    onCopyOrNumber(payment.or_number);
                                                }
                                            }}
                                            className={cn(
                                                "font-mono",
                                                payment.or_number ? "text-blue-600 dark:text-blue-400" : "text-gray-400"
                                            )}
                                        >
                                            OR: {orNumber}
                                        </button>
                                        {referenceNumber && (
                                            <>
                                                <span>•</span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onCopyReference(referenceNumber);
                                                    }}
                                                    className="font-mono text-gray-500 dark:text-gray-400 truncate max-w-[100px]"
                                                >
                                                    Ref: {referenceNumber}
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
                                            <StatusIcon className="h-2.5 w-2.5 mr-0.5" />
                                            {statusBadge.label}
                                        </Badge>
                                        {payment.payment_date && (
                                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                                <Calendar className="h-3 w-3" />
                                                <span>{formatDate(payment.payment_date)}</span>
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
                                                    onViewDetails(payment.id);
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
                                                    <DropdownMenuItem onClick={() => onViewDetails(payment.id)}>
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => onDownloadReceipt(payment)}>
                                                        <Download className="h-4 w-4 mr-2" />
                                                        Download Receipt
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => onGenerateReceipt(payment)}>
                                                        <Printer className="h-4 w-4 mr-2" />
                                                        Print Receipt
                                                    </DropdownMenuItem>
                                                    {payment.or_number && (
                                                        <DropdownMenuItem onClick={() => onCopyOrNumber(payment.or_number!)}>
                                                            <Copy className="h-4 w-4 mr-2" />
                                                            Copy OR #
                                                        </DropdownMenuItem>
                                                    )}
                                                    {referenceNumber && (
                                                        <DropdownMenuItem onClick={() => onCopyReference(referenceNumber)}>
                                                            <Copy className="h-4 w-4 mr-2" />
                                                            Copy Reference #
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
                                    {/* OR Number */}
                                    {payment.or_number && (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs">
                                                <FileText className="h-3.5 w-3.5 text-gray-400" />
                                                <span className="text-gray-500 dark:text-gray-400">OR #:</span>
                                                <span className="font-mono text-gray-700 dark:text-gray-300">
                                                    {payment.or_number}
                                                </span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 px-2 text-xs"
                                                onClick={(e) => handleCopy(payment.or_number!, 'OR number', e)}
                                            >
                                                <Copy className="h-3 w-3 mr-1" />
                                                Copy
                                            </Button>
                                        </div>
                                    )}

                                    {/* Reference Number */}
                                    {referenceNumber && (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs">
                                                <Hash className="h-3.5 w-3.5 text-gray-400" />
                                                <span className="text-gray-500 dark:text-gray-400">Reference #:</span>
                                                <span className="font-mono text-gray-700 dark:text-gray-300">
                                                    {referenceNumber}
                                                </span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 px-2 text-xs"
                                                onClick={(e) => handleCopy(referenceNumber, 'Reference number', e)}
                                            >
                                                <Copy className="h-3 w-3 mr-1" />
                                                Copy
                                            </Button>
                                        </div>
                                    )}

                                    {/* Purpose */}
                                    <div className="flex items-center gap-2 text-xs">
                                        <Receipt className="h-3.5 w-3.5 text-gray-400" />
                                        <span className="text-gray-500 dark:text-gray-400">Purpose:</span>
                                        <span className="text-gray-700 dark:text-gray-300">
                                            {payment.purpose || 'N/A'}
                                        </span>
                                    </div>

                                    {/* Payment Method */}
                                    {payment.payment_method && (
                                        <div className="flex items-center gap-2 text-xs">
                                            <CreditCard className="h-3.5 w-3.5 text-gray-400" />
                                            <span className="text-gray-500 dark:text-gray-400">Method:</span>
                                            <span className="text-gray-700 dark:text-gray-300 capitalize">
                                                {payment.payment_method.replace('_', ' ')}
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

                                    {/* Dates */}
                                    {payment.payment_date && (
                                        <div className="flex items-center gap-2 text-xs">
                                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                            <span className="text-gray-500 dark:text-gray-400">Payment Date:</span>
                                            <span className="text-gray-700 dark:text-gray-300">
                                                {formatDate(payment.payment_date)}
                                            </span>
                                        </div>
                                    )}

                                    {payment.due_date && (
                                        <div className="flex items-center gap-2 text-xs">
                                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                            <span className="text-gray-500 dark:text-gray-400">Due Date:</span>
                                            <span className="text-gray-700 dark:text-gray-300">
                                                {formatDate(payment.due_date)}
                                            </span>
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
                                                onViewDetails(payment.id);
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
                                                onDownloadReceipt(payment);
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
                                                onGenerateReceipt(payment);
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