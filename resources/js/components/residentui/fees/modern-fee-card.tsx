import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { StatusBadge } from '../StatusBadge';
import { Check, ChevronDown, Eye, CreditCard } from 'lucide-react';
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

    return (
        <div className="mb-3 last:mb-0 animate-fade-in">
            <Card className={cn(
                "border-0 shadow-lg overflow-hidden transition-all duration-300",
                selectMode && selectedFees?.includes(fee.id) && "ring-2 ring-blue-500 ring-offset-2",
                fee.is_overdue && "border-l-4 border-l-red-500"
            )}>
                <CardContent className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3 flex-1">
                            {selectMode && (
                                <button
                                    onClick={() => toggleSelectFee?.(fee.id)}
                                    className={cn(
                                        "mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                                        selectedFees?.includes(fee.id)
                                            ? "bg-blue-500 border-blue-500"
                                            : "border-gray-300 dark:border-gray-600"
                                    )}
                                >
                                    {selectedFees?.includes(fee.id) && (
                                        <Check className="h-3 w-3 text-white" />
                                    )}
                                </button>
                            )}
                            
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(fee.fee_code);
                                            toast.success(`Copied: ${fee.fee_code}`);
                                        }}
                                        className="font-mono text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        {fee.fee_code}
                                    </button>
                                    <StatusBadge status={fee.status} isOverdue={fee.is_overdue} />
                                </div>
                                <p className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2">
                                    {fee.purpose}
                                </p>
                            </div>
                        </div>
                        
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <ChevronDown className={cn(
                                "h-4 w-4 text-gray-500 transition-transform duration-200",
                                isExpanded && "transform rotate-180"
                            )} />
                        </button>
                    </div>

                    {/* Amount Summary */}
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Total Amount</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                                {fee.formatted_total}
                            </p>
                        </div>
                        {fee.balance > 0 ? (
                            <div className="text-right">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Balance</p>
                                <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                                    {fee.formatted_balance}
                                </p>
                            </div>
                        ) : (
                            <div className="text-right">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Paid</p>
                                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                    {fee.formatted_amount_paid}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Progress Bar for Partial Payments */}
                    {fee.balance > 0 && fee.amount_paid > 0 && (
                        <div className="mb-3">
                            <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-gray-500 dark:text-gray-400">Payment Progress</span>
                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                    {Math.round(((fee.total_amount - fee.balance) / fee.total_amount) * 100)}%
                                </span>
                            </div>
                            <Progress 
                                value={((fee.total_amount - fee.balance) / fee.total_amount) * 100} 
                                className="h-1.5 bg-gray-200 dark:bg-gray-700"
                            />
                        </div>
                    )}

                    {/* Expandable Details */}
                    {isExpanded && (
                        <div className="pt-3 border-t border-gray-100 dark:border-gray-700 space-y-2 animate-slide-down">
                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Issue Date</p>
                                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                        {formatDate(fee.issue_date)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Due Date</p>
                                    <p className={cn(
                                        "text-xs font-medium",
                                        fee.is_overdue ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-300"
                                    )}>
                                        {formatDate(fee.due_date)}
                                        {fee.is_overdue && fee.days_overdue > 0 && (
                                            <span className="ml-1 text-red-500">
                                                ({fee.days_overdue}d)
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Type & Category */}
                            {fee.fee_type && (
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Type</p>
                                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                        {getCategoryDisplay(fee.fee_type)}
                                    </p>
                                </div>
                            )}

                            {/* OR Number if available */}
                            {fee.or_number && (
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">OR Number</p>
                                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                        {fee.or_number}
                                    </p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-2 pt-2">
                                <Link href={`/residentfees/${fee.id}`} className="flex-1">
                                    <Button size="sm" variant="outline" className="w-full gap-2">
                                        <Eye className="h-3 w-3" />
                                        View Details
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};