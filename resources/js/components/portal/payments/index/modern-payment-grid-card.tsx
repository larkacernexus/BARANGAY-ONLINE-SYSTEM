// components/residentui/payments/modern-payment-grid-card.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
import { Payment } from '@/types/portal/payments/payment.types';
import { getPaymentStatusColor, getPaymentStatusLabel, getPaymentMethodDisplay } from '@/components/residentui/payments/payment-utils';

interface ModernPaymentGridCardProps {
    payment: Payment;
    selectMode?: boolean;
    selectedPayments?: number[];
    toggleSelectPayment?: (id: number) => void;
    formatDate: (date: string | null) => string;
    formatCurrency: (amount: number) => string;
    onViewDetails: (id: number) => void;
    onMakePayment?: (id: number) => void;
    onDownloadReceipt?: (payment: Payment) => void;
    onCopyOrNumber: (orNumber: string) => void;
    onCopyReference: (ref: string) => void;
    onGenerateReceipt: (payment: Payment) => void;
}

export const ModernPaymentGridCard = ({
    payment,
    selectMode = false,
    selectedPayments = [],
    toggleSelectPayment,
    formatDate,
    formatCurrency,
    onViewDetails,
    onMakePayment,
    onDownloadReceipt,
    onCopyOrNumber,
    onCopyReference,
    onGenerateReceipt
}: ModernPaymentGridCardProps) => {
    const handleCopyOrNumber = (e: React.MouseEvent) => {
        e.stopPropagation();
        onCopyOrNumber(payment.or_number);
    };

    const handleCopyReference = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (payment.reference_number) {
            onCopyReference(payment.reference_number);
        }
    };

    const handleViewDetails = (e: React.MouseEvent) => {
        e.stopPropagation();
        onViewDetails(payment.id);
    };

    const handleMakePayment = (e: React.MouseEvent) => {
        e.stopPropagation();
        onMakePayment?.(payment.id);
    };

    const handleDownloadReceipt = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDownloadReceipt?.(payment);
    };

    const handleGenerateReceipt = (e: React.MouseEvent) => {
        e.stopPropagation();
        onGenerateReceipt(payment);
    };

    const handleSelect = () => {
        if (selectMode && toggleSelectPayment) {
            toggleSelectPayment(payment.id);
        }
    };

    return (
        <div className="animate-fade-in-up">
            <Card 
                className={cn(
                    "border-0 shadow-lg hover:shadow-xl transition-all duration-300 group bg-white dark:bg-gray-800",
                    selectMode && selectedPayments.includes(payment.id) && "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900",
                    payment.status === 'overdue' && "border-l-4 border-l-red-500"
                )}
                onClick={handleSelect}
            >
                <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <button
                                        onClick={handleCopyOrNumber}
                                        className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        OR #{payment.or_number}
                                    </button>
                                    <span className={cn(
                                        "px-2 py-1 rounded-full text-xs font-medium",
                                        getPaymentStatusColor(payment.status)
                                    )}>
                                        {getPaymentStatusLabel(payment.status)}
                                    </span>
                                </div>
                                <p className="font-medium text-gray-900 dark:text-white line-clamp-2">
                                    {payment.purpose}
                                </p>
                                {payment.reference_number && (
                                    <button
                                        onClick={handleCopyReference}
                                        className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mt-1"
                                    >
                                        Ref: {payment.reference_number}
                                    </button>
                                )}
                            </div>
                        </div>
                        
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 w-8 p-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={handleCopyOrNumber}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy OR Number
                                </DropdownMenuItem>
                                {payment.reference_number && (
                                    <DropdownMenuItem onClick={handleCopyReference}>
                                        <Copy className="h-4 w-4 mr-2" />
                                        Copy Reference
                                    </DropdownMenuItem>
                                )}
                                {(payment.status === 'paid' || payment.status === 'completed') && (
                                    <DropdownMenuItem onClick={handleDownloadReceipt}>
                                        <Download className="h-4 w-4 mr-2" />
                                        Download Receipt
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleGenerateReceipt}>
                                    <FileText className="h-4 w-4 mr-2" />
                                    Generate Receipt
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Payment Date</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {formatDate(payment.payment_date)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Method</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {getPaymentMethodDisplay(payment.payment_method)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Collection Type</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {payment.collection_type_display}
                            </p>
                        </div>
                        {payment.due_date && (
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Due Date</p>
                                <p className={cn(
                                    "text-sm font-medium",
                                    payment.status === 'overdue' && "text-red-600 dark:text-red-400"
                                )}>
                                    {formatDate(payment.due_date)}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 mb-3">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Total Amount</span>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                                {formatCurrency(payment.total_amount)}
                            </span>
                        </div>
                        
                        {(payment.surcharge > 0 || payment.penalty > 0 || payment.discount > 0) && (
                            <div className="space-y-1 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                                    <span>{formatCurrency(payment.subtotal)}</span>
                                </div>
                                {payment.surcharge > 0 && (
                                    <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
                                        <span>Surcharge</span>
                                        <span>+{formatCurrency(payment.surcharge)}</span>
                                    </div>
                                )}
                                {payment.penalty > 0 && (
                                    <div className="flex items-center justify-between text-red-600 dark:text-red-400">
                                        <span>Penalty</span>
                                        <span>+{formatCurrency(payment.penalty)}</span>
                                    </div>
                                )}
                                {payment.discount > 0 && (
                                    <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                                        <span>Discount</span>
                                        <span>-{formatCurrency(payment.discount)}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1 gap-2"
                            onClick={handleViewDetails}
                        >
                            <Eye className="h-4 w-4" />
                            View
                        </Button>
                        
                        {(payment.status === 'pending' || payment.status === 'overdue') && onMakePayment && (
                            <Button 
                                size="sm" 
                                className="flex-1 gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                                onClick={handleMakePayment}
                            >
                                Pay Now
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};