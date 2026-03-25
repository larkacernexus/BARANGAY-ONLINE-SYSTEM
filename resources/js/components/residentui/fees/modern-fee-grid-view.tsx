// /components/residentui/fees/modern-fee-grid-view.tsx
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, FileText, Printer, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Fee {
    id: number;
    fee_type: string;
    fee_type_name?: string;
    amount: number;
    status: string;
    due_date: string;
    paid_at?: string;
    reference_number?: string;
    description?: string;
}

interface ModernFeeGridViewProps {
    fees: Fee[];
    selectMode: boolean;
    selectedFees: number[];
    onSelectFee: (id: number) => void;
    getCategoryDisplay: (type: string) => string;
    formatDate: (date: string) => string;
    onPrint: (fee: Fee) => void;
    isMobile: boolean;
}

export const ModernFeeGridView = ({
    fees,
    selectMode,
    selectedFees,
    onSelectFee,
    getCategoryDisplay,
    formatDate,
    onPrint,
    isMobile
}: ModernFeeGridViewProps) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'overdue':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'paid':
                return 'Paid';
            case 'pending':
                return 'Pending';
            case 'overdue':
                return 'Overdue';
            default:
                return status;
        }
    };

    return (
        <div className={cn(
            'grid gap-4',
            isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        )}>
            {fees.map((fee) => (
                <Card
                    key={fee.id}
                    className={cn(
                        'relative overflow-hidden transition-all duration-200 hover:shadow-md',
                        selectMode && 'cursor-pointer'
                    )}
                    onClick={() => selectMode && onSelectFee(fee.id)}
                >
                    {selectMode && (
                        <div className="absolute top-3 left-3 z-10">
                            <Checkbox
                                checked={selectedFees.includes(fee.id)}
                                onCheckedChange={() => onSelectFee(fee.id)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    )}
                    
                    <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    {getCategoryDisplay(fee.fee_type)}
                                </h3>
                                {fee.description && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {fee.description}
                                    </p>
                                )}
                            </div>
                            <span className={cn(
                                'px-2 py-1 rounded-full text-xs font-medium',
                                getStatusColor(fee.status)
                            )}>
                                {getStatusLabel(fee.status)}
                            </span>
                        </div>
                        
                        <div className="space-y-2 mt-3">
                            <div className="flex items-center gap-2 text-sm">
                                <DollarSign className="h-4 w-4 text-gray-400" />
                                <span className="font-medium text-gray-900 dark:text-white">
                                    ₱{fee.amount.toLocaleString()}
                                </span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-600 dark:text-gray-300">
                                    Due: {formatDate(fee.due_date)}
                                </span>
                            </div>
                            
                            {fee.reference_number && (
                                <div className="flex items-center gap-2 text-sm">
                                    <FileText className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-600 dark:text-gray-300 font-mono text-xs">
                                        {fee.reference_number}
                                    </span>
                                </div>
                            )}
                        </div>
                        
                        <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                            <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onPrint(fee);
                                }}
                            >
                                <Printer className="h-3 w-3 mr-1" />
                                Print
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    // Handle view details
                                }}
                            >
                                <Eye className="h-3 w-3 mr-1" />
                                Details
                            </Button>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};