import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { StatusBadge } from '../StatusBadge';
import { Check, ChevronDown, Eye, CreditCard, Calendar, Tag, Receipt, AlertCircle } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ModernFeeCardProps {
    fee: any;
    selectMode?: boolean;
    selectedFees?: number[];
    toggleSelectFee?: (id: number) => void;
    getCategoryDisplay: (feeType: any) => string;
    formatDate: (date: string) => string;
    isMobile?: boolean;
}

export const ModernFeeCard = ({ 
    fee, 
    selectMode, 
    selectedFees, 
    toggleSelectFee,
    getCategoryDisplay, 
    formatDate,
    isMobile = true
}: ModernFeeCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Format date with year
    const formatDateWithYear = (date: string) => {
        if (!date) return 'N/A';
        try {
            const d = new Date(date);
            return d.toLocaleDateString('en-PH', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch {
            return formatDate(date);
        }
    };

    // Check if there are any expandable details
    const hasExpandableDetails = fee.fee_type || fee.or_number || (fee.balance > 0 && fee.amount_paid > 0);

    return (
        <div className="mb-2 last:mb-0 animate-fade-in">
            <Card className={cn(
                "border-0 shadow-md hover:shadow-lg transition-all duration-200 group bg-white dark:bg-gray-800",
                selectMode && selectedFees?.includes(fee.id) && "ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-gray-900",
                fee.is_overdue && "border-l-2 border-l-red-500"
            )}>
                <CardContent className="p-3">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                            {selectMode && (
                                <button
                                    onClick={() => toggleSelectFee?.(fee.id)}
                                    className={cn(
                                        "mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0",
                                        selectedFees?.includes(fee.id)
                                            ? "bg-blue-500 border-blue-500"
                                            : "border-gray-300 dark:border-gray-600 group-hover:border-gray-400 dark:group-hover:border-gray-500"
                                    )}
                                >
                                    {selectedFees?.includes(fee.id) && (
                                        <Check className="h-2.5 w-2.5 text-white" />
                                    )}
                                </button>
                            )}
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(fee.fee_code);
                                            toast.success(`Copied: ${fee.fee_code}`);
                                        }}
                                        className="font-mono text-[10px] font-medium text-blue-600 dark:text-blue-400 hover:underline flex-shrink-0"
                                    >
                                        {fee.fee_code}
                                    </button>
                                    <StatusBadge status={fee.status} isOverdue={fee.is_overdue} />
                                </div>
                                <p className="font-medium text-xs text-gray-900 dark:text-white line-clamp-1">
                                    {fee.purpose}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Amount Summary */}
                    <div className="flex items-center justify-between mb-1.5">
                        <div>
                            <p className="text-[9px] text-gray-500 dark:text-gray-400">Total Amount</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {fee.formatted_total}
                            </p>
                        </div>
                        {fee.balance > 0 ? (
                            <div className="text-right">
                                <p className="text-[9px] text-gray-500 dark:text-gray-400">Balance</p>
                                <p className="text-xs font-semibold text-red-600 dark:text-red-400">
                                    {fee.formatted_balance}
                                </p>
                            </div>
                        ) : (
                            <div className="text-right">
                                <p className="text-[9px] text-gray-500 dark:text-gray-400">Paid</p>
                                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                    {fee.formatted_amount_paid}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Progress Bar for Partial Payments */}
                    {fee.balance > 0 && fee.amount_paid > 0 && (
                        <div className="mb-2">
                            <div className="flex items-center justify-between text-[9px] mb-0.5">
                                <span className="text-gray-500 dark:text-gray-400">Payment Progress</span>
                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                    {Math.round(((fee.total_amount - fee.balance) / fee.total_amount) * 100)}%
                                </span>
                            </div>
                            <Progress 
                                value={((fee.total_amount - fee.balance) / fee.total_amount) * 100} 
                                className="h-1 bg-gray-200 dark:bg-gray-700"
                            />
                        </div>
                    )}

                    {/* Dates - Two Column Layout with Year */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-md p-2 mb-2">
                        <div className="grid grid-cols-2 gap-1.5">
                            <div className="flex items-center gap-1.5 text-[9px] min-w-0">
                                <Calendar className="h-2.5 w-2.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                <span className="text-gray-600 dark:text-gray-400 truncate">
                                    Issued: {formatDateWithYear(fee.issue_date)}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[9px] min-w-0">
                                <Calendar className="h-2.5 w-2.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                <span className={cn(
                                    "truncate",
                                    fee.is_overdue ? "text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-400"
                                )}>
                                    Due: {formatDateWithYear(fee.due_date)}
                                    {fee.is_overdue && fee.days_overdue > 0 && (
                                        <span className="ml-0.5 text-red-500">
                                            ({fee.days_overdue}d)
                                        </span>
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Expandable Details */}
                    {hasExpandableDetails && isExpanded && (
                        <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-2 animate-slide-down">
                            {/* Type & Category */}
                            {fee.fee_type && (
                                <div>
                                    <p className="text-[9px] font-medium text-gray-500 dark:text-gray-400 mb-0.5">Type</p>
                                    <div className="flex items-center gap-1">
                                        <Tag className="h-2.5 w-2.5 text-gray-400 dark:text-gray-500" />
                                        <p className="text-[10px] font-medium text-gray-700 dark:text-gray-300">
                                            {getCategoryDisplay(fee.fee_type)}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* OR Number if available */}
                            {fee.or_number && (
                                <div>
                                    <p className="text-[9px] font-medium text-gray-500 dark:text-gray-400 mb-0.5">OR Number</p>
                                    <div className="flex items-center gap-1">
                                        <Receipt className="h-2.5 w-2.5 text-gray-400 dark:text-gray-500" />
                                        <p className="text-[10px] font-medium text-gray-700 dark:text-gray-300">
                                            {fee.or_number}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-1.5 mt-2">
                        <Link href={`/residentfees/${fee.id}`} className="flex-1">
                            <Button 
                                size="sm" 
                                variant="outline" 
                                className="w-full gap-1 h-7 text-[10px] border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                                <Eye className="h-3 w-3" />
                                View
                            </Button>
                        </Link>
                        
                        {hasExpandableDetails && (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="px-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                                title={isExpanded ? "Show Less" : "Show More"}
                            >
                                <ChevronDown className={cn(
                                    "h-3.5 w-3.5 transition-transform duration-200",
                                    isExpanded && "transform rotate-180"
                                )} />
                            </button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};