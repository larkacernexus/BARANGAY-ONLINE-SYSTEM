// components/residentui/payments/modern-payment-list-view.tsx
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, MoreVertical, Copy, FileText, Printer, Download } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Payment } from '@/types/portal/payments/payment.types';
import { getPaymentStatusColor, getPaymentStatusLabel, getPaymentMethodDisplay } from '@/components/residentui/payments/payment-utils';

interface ModernPaymentListViewProps {
    payments: Payment[];
    selectMode?: boolean;
    selectedPayments?: number[];
    onSelectPayment?: (id: number) => void;
    onSelectAll?: () => void;
    formatDate: (date: string | null) => string;
    formatCurrency: (amount: number) => string;
    onViewDetails: (id: number) => void;
    onMakePayment?: (id: number) => void;
    onDownloadReceipt?: (payment: Payment) => void;
    onCopyOrNumber: (orNumber: string) => void;
    onCopyReference: (ref: string) => void;
    onGenerateReceipt: (payment: Payment) => void;
    onPrint?: () => void;
}

export const ModernPaymentListView = ({
    payments,
    selectMode = false,
    selectedPayments = [],
    onSelectPayment,
    onSelectAll,
    formatDate,
    formatCurrency,
    onViewDetails,
    onMakePayment,
    onDownloadReceipt,
    onCopyOrNumber,
    onCopyReference,
    onGenerateReceipt
}: ModernPaymentListViewProps) => {
    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent border-gray-200 dark:border-gray-700">
                        {selectMode && (
                            <TableHead className="w-12">
                                <Checkbox
                                    checked={selectedPayments.length === payments.length && payments.length > 0}
                                    onCheckedChange={onSelectAll}
                                />
                            </TableHead>
                        )}
                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300">OR Details</TableHead>
                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Purpose & Type</TableHead>
                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Dates</TableHead>
                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Method</TableHead>
                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Status</TableHead>
                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Amount</TableHead>
                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300 text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {payments.map((payment) => (
                        <TableRow key={`table-${payment.id}`} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors border-gray-200 dark:border-gray-700">
                            {selectMode && (
                                <TableCell>
                                    <Checkbox
                                        checked={selectedPayments.includes(payment.id)}
                                        onCheckedChange={() => onSelectPayment?.(payment.id)}
                                    />
                                </TableCell>
                            )}
                            <TableCell>
                                <div className="space-y-1">
                                    <button
                                        onClick={() => onCopyOrNumber(payment.or_number)}
                                        className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        OR #{payment.or_number}
                                    </button>
                                    {payment.reference_number && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Ref: {payment.reference_number}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {payment.collection_type_display}
                                    </p>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {payment.purpose}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                        {payment.certificate_type_display || 'General Payment'}
                                    </p>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="space-y-1">
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Paid</p>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">{formatDate(payment.payment_date)}</p>
                                    </div>
                                    {payment.due_date && (
                                        <div>
                                            <p className={cn(
                                                "text-xs",
                                                payment.status === 'overdue' ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
                                            )}>
                                                Due
                                            </p>
                                            <p className={cn(
                                                "text-sm",
                                                payment.status === 'overdue' && "text-red-600 dark:text-red-400 font-medium"
                                            )}>
                                                {formatDate(payment.due_date)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                    {getPaymentMethodDisplay(payment.payment_method)}
                                </span>
                            </TableCell>
                            <TableCell>
                                <span className={cn(
                                    "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                                    getPaymentStatusColor(payment.status)
                                )}>
                                    {getPaymentStatusLabel(payment.status)}
                                </span>
                            </TableCell>
                            <TableCell>
                                <div className="space-y-1">
                                    <p className="font-bold text-gray-900 dark:text-white">
                                        {formatCurrency(payment.total_amount)}
                                    </p>
                                    {((payment.surcharge || 0) > 0 ||
                                      (payment.penalty || 0) > 0 ||
                                      (payment.discount || 0) > 0) && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Base: {formatCurrency(payment.subtotal)}
                                        </p>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                                    onClick={() => onViewDetails(payment.id)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>View Details</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                    
                                    {(payment.status === 'pending' || payment.status === 'overdue') && onMakePayment && (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        size="sm"
                                                        variant="default"
                                                        className="h-8 px-3 text-xs bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                                                        onClick={() => onMakePayment(payment.id)}
                                                    >
                                                        Pay
                                                    </Button>
                                                </TooltipTrigger>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}
                                    
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            <DropdownMenuItem onClick={() => onCopyOrNumber(payment.or_number)}>
                                                <Copy className="h-4 w-4 mr-2" />
                                                Copy OR Number
                                            </DropdownMenuItem>
                                            {payment.reference_number && (
                                                <DropdownMenuItem onClick={() => onCopyReference(payment.reference_number!)}>
                                                    <Copy className="h-4 w-4 mr-2" />
                                                    Copy Reference
                                                </DropdownMenuItem>
                                            )}
                                            {(payment.status === 'paid' || payment.status === 'completed') && onDownloadReceipt && (
                                                <DropdownMenuItem onClick={() => onDownloadReceipt(payment)}>
                                                    <Download className="h-4 w-4 mr-2" />
                                                    Download Receipt
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuItem onClick={() => onGenerateReceipt(payment)}>
                                                <FileText className="h-4 w-4 mr-2" />
                                                Generate Receipt
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};