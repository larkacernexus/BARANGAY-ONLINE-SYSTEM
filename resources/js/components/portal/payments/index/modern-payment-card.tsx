// components/residentui/payments/modern-payment-card.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Payment, PaymentStatus } from '@/types/portal/payments/payment.types';
import { getPaymentStatusColor, getPaymentStatusLabel, getPaymentMethodDisplay } from '@/components/residentui/payments/payment-utils';

interface ModernPaymentCardProps {
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
    isMobile?: boolean;
}

export const ModernPaymentCard = ({
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
    onGenerateReceipt,
    isMobile = false
}: ModernPaymentCardProps) => {
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
        <Card 
            className={cn(
                "border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 cursor-pointer",
                selectMode && selectedPayments.includes(payment.id) && "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900",
                payment.status === 'overdue' && "border-l-4 border-l-red-500"
            )}
            onClick={handleSelect}
        >
            <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <button
                                onClick={handleCopyOrNumber}
                                className="font-mono text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                OR #{payment.or_number}
                            </button>
                            <span className={cn(
                                "px-2 py-0.5 rounded-full text-xs font-medium",
                                getPaymentStatusColor(payment.status)
                            )}>
                                {getPaymentStatusLabel(payment.status)}
                            </span>
                        </div>
                        <p className="font-medium text-gray-900 dark:text-white line-clamp-2 text-sm">
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
                            <DropdownMenuItem onClick={handleGenerateReceipt}>
                                <FileText className="h-4 w-4 mr-2" />
                                Generate Receipt
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                            {formatDate(payment.payment_date)}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Method</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                            {getPaymentMethodDisplay(payment.payment_method)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Amount:</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                        {formatCurrency(payment.total_amount)}
                    </span>
                </div>

                <div className="flex gap-2">
                    <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 gap-2"
                        onClick={handleViewDetails}
                    >
                        <Eye className="h-3 w-3" />
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
    );
};