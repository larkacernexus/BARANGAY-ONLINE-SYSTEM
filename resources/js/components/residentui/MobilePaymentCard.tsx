import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, Eye, Receipt, Check } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface MobilePaymentCardProps {
    payment: any;
    selectMode: boolean;
    selectedPayments: number[];
    toggleSelectPayment: (id: number) => void;
    formatDate: (dateString: string) => string;
    formatCurrency: (amount: number) => string;
    copyOrNumber: (orNumber: string) => void;
}

export const MobilePaymentCard = ({ 
    payment,
    selectMode,
    selectedPayments,
    toggleSelectPayment,
    formatDate,
    formatCurrency,
    copyOrNumber
}: MobilePaymentCardProps) => {
    return (
        <div className="mb-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 hover:shadow-md transition-shadow">
            <div className="p-4">
                <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start gap-3">
                        {selectMode && (
                            <button
                                onClick={() => toggleSelectPayment(payment.id)}
                                className={`flex-shrink-0 w-5 h-5 mt-1 rounded border flex items-center justify-center transition-colors ${
                                    selectedPayments.includes(payment.id)
                                        ? 'bg-blue-600 border-blue-600'
                                        : 'border-gray-300 hover:border-blue-500'
                                }`}
                            >
                                {selectedPayments.includes(payment.id) && (
                                    <Check className="h-3 w-3 text-white" />
                                )}
                            </button>
                        )}
                        
                        <div className={`flex-1 min-w-0 ${selectMode ? '' : 'ml-0'}`}>
                            <div className="flex items-center gap-2 mb-1">
                                <button
                                    onClick={() => copyOrNumber(payment.or_number)}
                                    className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 transition-colors"
                                    title="Copy OR number"
                                >
                                    OR #{payment.or_number}
                                </button>
                                {payment.reference_number && (
                                    <Badge variant="outline" size="sm" className="h-5 text-xs">
                                        Ref: {payment.reference_number}
                                    </Badge>
                                )}
                            </div>
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                {payment.purpose}
                            </h4>
                            {payment.certificate_type_display && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                    {payment.certificate_type_display}
                                </p>
                            )}
                        </div>
                        
                        <div className="flex flex-col items-end gap-1">
                            <div className="text-lg font-bold">{payment.formatted_total}</div>
                            <div className="flex">
                                {/* Status badge will be rendered by parent component */}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                            <p className="text-gray-500 dark:text-gray-400">Date</p>
                            <p className="font-medium flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(payment.payment_date)}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400">Method</p>
                            <div className="font-medium">
                                {/* Payment method badge will be rendered by parent component */}
                            </div>
                        </div>
                    </div>

                    {((payment.surcharge || 0) > 0 || (payment.penalty || 0) > 0 || (payment.discount || 0) > 0) && (
                        <div className="text-xs text-gray-500 grid grid-cols-3 gap-1">
                            {(payment.surcharge || 0) > 0 && (
                                <div>Fee: {payment.formatted_surcharge}</div>
                            )}
                            {(payment.penalty || 0) > 0 && (
                                <div>Penalty: {payment.formatted_penalty}</div>
                            )}
                            {(payment.discount || 0) > 0 && (
                                <div>Discount: -{payment.formatted_discount}</div>
                            )}
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                        <Link 
                            href={`/payments/${payment.id}`} 
                            className="flex-1"
                        >
                            <Button variant="outline" size="sm" className="w-full">
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                            </Button>
                        </Link>
                        <div className="flex gap-1 ml-2">
                            {(payment.status === 'completed' || payment.status === 'paid') && (
                                <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => console.log('Receipt download would be implemented here')}
                                >
                                    <Receipt className="h-4 w-4" />
                                </Button>
                            )}
                            {(payment.status === 'pending' || payment.status === 'overdue') && (
                                <Button 
                                    size="sm" 
                                    variant="default"
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => console.log('Payment functionality would open here')}
                                >
                                    <DollarSign className="h-4 w-4 mr-1" />
                                    Pay
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};