import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Calendar, Eye, CreditCard, Check } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { toast } from 'sonner';
import { StatusBadge } from './StatusBadge';

interface FeeType {
    id: number;
    code: string;
    name: string;
    category: string;
    category_display: string;
    document_category?: {
        id: number;
        name: string;
        slug: string;
    } | null;
}

interface MobileFeeCardProps {
    fee: {
        id: number;
        fee_code: string;
        purpose: string;
        issue_date: string;
        due_date: string;
        total_amount: number;
        balance: number;
        amount_paid: number;
        status: string;
        is_overdue: boolean;
        days_overdue: number;
        formatted_total: string;
        formatted_balance: string;
        formatted_amount_paid: string;
        fee_type?: FeeType;
    };
    selectMode: boolean;
    selectedFees: number[];
    toggleSelectFee: (id: number) => void;
    getCategoryDisplay: (feeType: FeeType | undefined) => string;
    formatDate: (dateString: string) => string;
}

export function MobileFeeCard({ 
    fee, 
    selectMode, 
    selectedFees, 
    toggleSelectFee,
    getCategoryDisplay,
    formatDate 
}: MobileFeeCardProps) {
    return (
        <Card className="mb-3 border border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
                <div className="space-y-3">
                    <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                {selectMode && (
                                    <button
                                        onClick={() => toggleSelectFee(fee.id)}
                                        className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded border flex items-center justify-center transition-colors ${
                                            selectedFees.includes(fee.id)
                                                ? 'bg-blue-600 border-blue-600'
                                                : 'border-gray-300 hover:border-blue-500'
                                        }`}
                                    >
                                        {selectedFees.includes(fee.id) && (
                                            <Check className="h-3 w-3 text-white" />
                                        )}
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(fee.fee_code);
                                        toast.success(`Copied: ${fee.fee_code}`);
                                    }}
                                    className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 transition-colors truncate"
                                    title="Copy fee code"
                                >
                                    {fee.fee_code}
                                </button>
                            </div>
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                {fee.purpose}
                            </h4>
                            {fee.fee_type && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {getCategoryDisplay(fee.fee_type)}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <div className="text-lg font-bold">{fee.formatted_total}</div>
                            <StatusBadge status={fee.status} isOverdue={fee.is_overdue} />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Issued</p>
                            <p className="font-medium flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(fee.issue_date)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Due</p>
                            <p className={`font-medium flex items-center gap-1 ${fee.is_overdue ? 'text-red-600' : ''}`}>
                                <Calendar className="h-3 w-3" />
                                {formatDate(fee.due_date)}
                            </p>
                        </div>
                    </div>
                    
                    {fee.is_overdue && fee.days_overdue > 0 && (
                        <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-md">
                            <div className="flex items-center gap-1 text-red-700 dark:text-red-300 text-sm">
                                <AlertCircle className="h-3 w-3" />
                                <span>{fee.days_overdue} days overdue</span>
                            </div>
                        </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                        <Link href={`/residentfees/${fee.id}`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                            </Button>
                        </Link>
                        <div className="flex gap-1 ml-2">
                            {fee.balance > 0 && fee.status !== 'cancelled' && (
                                <Link href={`/resident/payments/create?fee_id=${fee.id}`}>
                                    <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700">
                                        <CreditCard className="h-4 w-4 mr-1" />
                                        Pay
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}