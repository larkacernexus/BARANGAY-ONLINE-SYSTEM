// resources/js/Pages/Admin/Payments/components/payment-status-card.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Info,
    Check,
    Clock,
} from 'lucide-react';
import { Payment } from '../types';

interface Props {
    payment: Payment;
}

export const PaymentStatusCard = ({ payment }: Props) => {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm dark:text-gray-100">
                    <Info className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    Payment Status
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Cleared Status</span>
                    <Badge variant={payment.is_cleared ? "default" : "outline"} 
                           className={payment.is_cleared 
                               ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800" 
                               : "dark:border-gray-600 dark:text-gray-300"
                           }>
                        {payment.is_cleared ? (
                            <span className="flex items-center gap-1">
                                <Check className="h-3 w-3" />
                                Cleared
                            </span>
                        ) : (
                            <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Not Cleared
                            </span>
                        )}
                    </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Collection Type</span>
                    <span className="text-sm font-medium dark:text-gray-100">{payment.collection_type_display}</span>
                </div>

                {payment.payment_method === 'online' && payment.reference_number && (
                    <div className="pt-2 border-t dark:border-gray-700">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Reference Number</p>
                        <p className="text-sm font-mono bg-gray-100 dark:bg-gray-900 p-2 rounded">
                            {payment.reference_number}
                        </p>
                    </div>
                )}

                {payment.method_details && Object.keys(payment.method_details).length > 0 && (
                    <div className="pt-2 border-t dark:border-gray-700">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Payment Method Details</p>
                        <div className="text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded max-h-32 overflow-y-auto">
                            <pre className="whitespace-pre-wrap font-mono">
                                {JSON.stringify(payment.method_details, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};