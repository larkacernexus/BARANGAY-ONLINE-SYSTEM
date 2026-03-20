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

interface ModernFeeGridCardProps {
    fee: any;
    selectMode?: boolean;
    selectedFees?: number[];
    toggleSelectFee?: (id: number) => void;
    getCategoryDisplay: (feeType: any) => string;
    formatDate: (date: string) => string;
    onPrint?: (fee: any) => void;
}

export const ModernFeeGridCard = ({ 
    fee, 
    selectMode, 
    selectedFees, 
    toggleSelectFee,
    getCategoryDisplay, 
    formatDate,
    onPrint
}: ModernFeeGridCardProps) => {
    return (
        <div className="animate-fade-in-up">
            <Card className={cn(
                "border-0 shadow-lg hover:shadow-xl transition-all duration-300 group",
                selectMode && selectedFees?.includes(fee.id) && "ring-2 ring-blue-500 ring-offset-2",
                fee.is_overdue && "border-l-4 border-l-red-500"
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
                                        selectedFees?.includes(fee.id)
                                            ? "bg-blue-500 border-blue-500"
                                            : "border-gray-300 dark:border-gray-600 group-hover:border-gray-400"
                                    )}
                                >
                                    {selectedFees?.includes(fee.id) && (
                                        <Check className="h-3 w-3 text-white" />
                                    )}
                                </button>
                            )}
                            
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(fee.fee_code);
                                            toast.success(`Copied: ${fee.fee_code}`);
                                        }}
                                        className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        {fee.fee_code}
                                    </button>
                                    <StatusBadge status={fee.status} isOverdue={fee.is_overdue} />
                                </div>
                                <p className="font-medium text-gray-900 dark:text-white line-clamp-2">
                                    {fee.purpose}
                                </p>
                            </div>
                        </div>
                        
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(fee.fee_code)}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy Fee Code
                                </DropdownMenuItem>
                                {fee.or_number && (
                                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(fee.or_number)}>
                                        <Copy className="h-4 w-4 mr-2" />
                                        Copy OR Number
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <FileText className="h-4 w-4 mr-2" />
                                    Generate Report
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onPrint?.(fee)}>
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
                                {getCategoryDisplay(fee.fee_type) || 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Issue Date</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {formatDate(fee.issue_date)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Due Date</p>
                            <p className={cn(
                                "text-sm font-medium",
                                fee.is_overdue ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"
                            )}>
                                {formatDate(fee.due_date)}
                                {fee.is_overdue && fee.days_overdue > 0 && (
                                    <span className="ml-1 text-xs text-red-500">
                                        ({fee.days_overdue}d)
                                    </span>
                                )}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">OR Number</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {fee.or_number || 'N/A'}
                            </p>
                        </div>
                    </div>

                    {/* Amount Section */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 mb-3">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Total Amount</span>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                                {fee.formatted_total}
                            </span>
                        </div>
                        
                        <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Amount Paid</span>
                                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                    {fee.formatted_amount_paid}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Balance</span>
                                <span className={cn(
                                    "font-medium",
                                    fee.balance > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
                                )}>
                                    {fee.formatted_balance}
                                </span>
                            </div>
                        </div>

                        {fee.balance > 0 && fee.amount_paid > 0 && (
                            <div className="mt-2">
                                <Progress 
                                    value={((fee.total_amount - fee.balance) / fee.total_amount) * 100} 
                                    className="h-1.5 bg-gray-200 dark:bg-gray-700"
                                />
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <Link href={`/portal/fees/${fee.id}`} className="flex-1">
                            <Button size="sm" variant="outline" className="w-full gap-2">
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