// resources/js/Pages/Admin/Payments/components/payment-header.tsx
import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    ArrowLeft,
    Printer,
    Copy,
    MoreVertical,
    XCircle,
    Send,
    Download as DownloadIcon,
    Check,
    Database,
    Receipt,
    CreditCard,
    Clock,
    AlertCircle,
    FileText,
    DollarSign,
    CalendarDays,
    User
} from 'lucide-react';
import { Payment } from '@/components/admin/payments/show/types';
import { getRoute } from '../utils/helpers';

interface Props {
    payment: Payment;
    onCopy: (text: string) => void;
    onPrint: () => void;
    onVoid: () => void;
    onEmailReceipt: () => void;
    onExportPDF: () => void;
    getStatusColor: (status: string) => string;
    getStatusIcon: (status: string) => React.ReactNode;
    getMethodIcon: (method: string) => React.ReactNode;
}

const getStatusGradient = (status: string): string => {
    switch (status) {
        case 'completed':
        case 'paid':
            return 'from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700';
        case 'pending':
            return 'from-amber-600 to-orange-600 dark:from-amber-700 dark:to-orange-700';
        case 'processing':
            return 'from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700';
        case 'failed':
        case 'voided':
        case 'refunded':
            return 'from-red-600 to-rose-600 dark:from-red-700 dark:to-rose-700';
        default:
            return 'from-gray-600 to-slate-600 dark:from-gray-700 dark:to-slate-700';
    }
};

const getStatusBadgeColor = (status: string): string => {
    const colors: Record<string, string> = {
        'completed': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
        'paid': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
        'pending': 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
        'processing': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
        'failed': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
        'voided': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700',
        'refunded': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700';
};

export const PaymentHeader = ({
    payment,
    onCopy,
    onPrint,
    onVoid,
    onEmailReceipt,
    onExportPDF,
    getStatusColor,
    getStatusIcon,
    getMethodIcon
}: Props) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        onCopy(payment.or_number);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const canVoid = ['pending', 'processing'].includes(payment.status);

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <Link href={getRoute('admin.payments.index')}>
                    <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Payments
                    </Button>
                </Link>
                <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r ${getStatusGradient(payment.status)}`}>
                        <Receipt className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-gray-100">
                            Payment #{payment.or_number}
                        </h1>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {/* Status Badge */}
                            <Badge variant="outline" className={getStatusBadgeColor(payment.status)}>
                                {getStatusIcon(payment.status)}
                                <span className="ml-1">{payment.status_display}</span>
                            </Badge>

                            {/* Payment Method Badge */}
                            <Badge variant="outline" className="flex items-center gap-1 bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
                                {getMethodIcon(payment.payment_method)}
                                <span className="ml-1">{payment.payment_method_display}</span>
                            </Badge>

                            {/* Cleared Badge */}
                            {payment.is_cleared && (
                                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                                    <Check className="h-3 w-3 mr-1" />
                                    Cleared
                                </Badge>
                            )}

                            {/* System Generated Badge */}
                            {payment.collection_type === 'system' && (
                                <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800">
                                    <Database className="h-3 w-3 mr-1" />
                                    System Generated
                                </Badge>
                            )}

                            {/* Amount Badge */}
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800 rounded-full cursor-default">
                                            <DollarSign className="h-3 w-3" />
                                            <span className="text-sm font-medium">
                                                {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(payment.amount)}
                                            </span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>Amount</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            {/* OR Number with Copy */}
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div 
                                            className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 border border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800 rounded-full cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                                            onClick={handleCopy}
                                        >
                                            <FileText className="h-3 w-3" />
                                            <span className="text-sm font-mono">
                                                {payment.or_number}
                                            </span>
                                            {copied ? (
                                                <Check className="h-3 w-3 ml-1" />
                                            ) : (
                                                <Copy className="h-3 w-3 ml-1" />
                                            )}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>Click to copy OR number</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                {/* Print Button - Primary Action */}
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                onClick={onPrint}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white dark:from-blue-700 dark:to-indigo-700 dark:hover:from-blue-800 dark:hover:to-indigo-800"
                            >
                                <Printer className="h-4 w-4 mr-2" />
                                Print Receipt
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Print official receipt</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                {/* 3-Dots Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 dark:bg-gray-900 dark:border-gray-700">
                        <DropdownMenuLabel className="dark:text-gray-100">Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator className="dark:bg-gray-700" />
                        
                        <DropdownMenuItem 
                            onClick={handleCopy}
                            className="dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy OR Number
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                            onClick={onEmailReceipt}
                            className="dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <Send className="h-4 w-4 mr-2" />
                            Email Receipt
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                            onClick={onExportPDF}
                            className="dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <DownloadIcon className="h-4 w-4 mr-2" />
                            Export as PDF
                        </DropdownMenuItem>
                        
                        {canVoid && (
                            <>
                                <DropdownMenuSeparator className="dark:bg-gray-700" />
                                <DropdownMenuItem 
                                    onClick={onVoid} 
                                    className="text-red-600 dark:text-red-400 dark:hover:bg-red-950/50"
                                >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Void Payment
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};