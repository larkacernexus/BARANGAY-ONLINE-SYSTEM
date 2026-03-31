import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { StatusBadge } from '../StatusBadge';
import { Check, Eye, CreditCard, Copy, MoreVertical, FileText, Printer } from 'lucide-react';
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
import { Fee, formatFeeAmount, getFeeStatusLabel, getFeeStatusColor } from '@/types/portal/fees/my-fees';

interface ModernFeeGridCardProps {
    fee: Fee;
    selectMode?: boolean;
    selectedFees?: number[];
    toggleSelectFee?: (id: number) => void;
    getCategoryDisplay: (feeType: any) => string;
    formatDate: (date: string) => string;
    onPrint?: () => void;
}

export const ModernFeeGridCard = ({ 
    fee, 
    selectMode = false, 
    selectedFees = [], 
    toggleSelectFee,
    getCategoryDisplay, 
    formatDate,
    onPrint
}: ModernFeeGridCardProps) => {
    // Helper function to format amounts with proper fallbacks
    const formatAmount = (amount?: number): string => {
        if (!amount && amount !== 0) return '₱0.00';
        return `₱${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // Get formatted values with fallbacks
    const feeCode = fee.fee_code || 'N/A';
    const purpose = fee.description || fee.purpose || 'Fee';
    const feeType = fee.fee_type || fee.fee_type_name || '';
    const issueDate = fee.created_at || fee.issue_date;
    const dueDate = fee.due_date;
    const orNumber = fee.reference_number || fee.or_number;
    const totalAmount = fee.amount || 0;
    const balance = fee.balance || 0;
    const amountPaid = totalAmount - balance;
    const isOverdue = fee.is_overdue || (fee.status === 'overdue');
    const daysOverdue = fee.days_overdue || 0;

    // Calculate payment progress percentage
    const paymentProgress = totalAmount > 0 ? ((totalAmount - balance) / totalAmount) * 100 : 0;

    const handleCopyFeeCode = () => {
        if (feeCode !== 'N/A') {
            navigator.clipboard.writeText(feeCode);
            toast.success(`Copied: ${feeCode}`);
        }
    };

    const handleCopyORNumber = () => {
        if (orNumber) {
            navigator.clipboard.writeText(orNumber);
            toast.success(`Copied: ${orNumber}`);
        }
    };

    return (
        <div className="animate-fade-in-up">
            <Card className={cn(
                "border-0 shadow-lg hover:shadow-xl transition-all duration-300 group bg-white dark:bg-gray-800",
                selectMode && selectedFees.includes(fee.id) && "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900",
                isOverdue && "border-l-4 border-l-red-500"
            )}>
                <CardContent className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                            {selectMode && (
                                <button
                                    onClick={() => toggleSelectFee?.(fee.id)}
                                    className={cn(
                                        "mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                                        selectedFees.includes(fee.id)
                                            ? "bg-blue-500 border-blue-500"
                                            : "border-gray-300 dark:border-gray-600 group-hover:border-gray-400 dark:group-hover:border-gray-500"
                                    )}
                                >
                                    {selectedFees.includes(fee.id) && (
                                        <Check className="h-3 w-3 text-white" />
                                    )}
                                </button>
                            )}
                            
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <button
                                        onClick={handleCopyFeeCode}
                                        className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        {feeCode}
                                    </button>
                                    <StatusBadge 
                                        status={fee.status || ''} 
                                        isOverdue={isOverdue} 
                                    />
                                </div>
                                <p className="font-medium text-gray-900 dark:text-white line-clamp-2">
                                    {purpose}
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
                                    onClick={handleCopyFeeCode}
                                    className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy Fee Code
                                </DropdownMenuItem>
                                {orNumber && (
                                    <DropdownMenuItem 
                                        onClick={handleCopyORNumber}
                                        className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    >
                                        <Copy className="h-4 w-4 mr-2" />
                                        Copy Reference Number
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                                <DropdownMenuItem className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Generate Report
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                    onClick={onPrint}
                                    className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <Printer className="h-4 w-4 mr-2" />
                                    Print Details
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Type</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {getCategoryDisplay(feeType) || 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Issue Date</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {issueDate ? formatDate(issueDate) : 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Due Date</p>
                            <p className={cn(
                                "text-sm font-medium",
                                isOverdue ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"
                            )}>
                                {dueDate ? formatDate(dueDate) : 'N/A'}
                                {isOverdue && daysOverdue > 0 && (
                                    <span className="ml-1 text-xs text-red-500 dark:text-red-400">
                                        ({daysOverdue}d)
                                    </span>
                                )}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Reference #</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {orNumber || 'N/A'}
                            </p>
                        </div>
                    </div>

                    {/* Amount Section */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 mb-3">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Total Amount</span>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                                {formatAmount(totalAmount)}
                            </span>
                        </div>
                        
                        <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Amount Paid</span>
                                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                    {formatAmount(amountPaid)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Balance</span>
                                <span className={cn(
                                    "font-medium",
                                    balance > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
                                )}>
                                    {formatAmount(balance)}
                                </span>
                            </div>
                        </div>

                        {balance > 0 && amountPaid > 0 && (
                            <div className="mt-2">
                                <Progress 
                                    value={paymentProgress} 
                                    className="h-1.5 bg-gray-200 dark:bg-gray-700"
                                />
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <Link href={`/portal/fees/${fee.id}`} className="flex-1">
                            <Button 
                                size="sm" 
                                variant="outline" 
                                className="w-full gap-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                                <Eye className="h-4 w-4" />
                                View
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};