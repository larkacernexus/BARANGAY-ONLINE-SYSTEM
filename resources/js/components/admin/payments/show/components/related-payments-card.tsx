// resources/js/Pages/Admin/Payments/components/related-payments-card.tsx
import React from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    History,
} from 'lucide-react';
import { RelatedPayment } from '../types';
import { getRoute } from '../utils/helpers';

interface Props {
    payments: RelatedPayment[];
    payerId: number;
    payerType: string;
}

export const RelatedPaymentsCard = ({ payments, payerId, payerType }: Props) => {
    if (payments.length === 0) return null;

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm dark:text-gray-100">
                    <History className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    Related Payments
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                    Previous payments from the same payer
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {payments.slice(0, 3).map((related) => (
                        <Link 
                            key={related.id}
                            href={`/admin/payments/${related.id}`}
                            className="block p-3 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium text-sm dark:text-gray-100">{related.or_number}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{related.formatted_date}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-semibold dark:text-gray-100">{related.formatted_total}</div>
                                    <Badge 
                                        variant="outline" 
                                        className={`text-xs mt-1 ${related.status === 'completed' 
                                            ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' 
                                            : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700'
                                        }`}
                                    >
                                        {related.status_display}
                                    </Badge>
                                </div>
                            </div>
                        </Link>
                    ))}
                    
                    {payments.length > 3 && (
                        <Link 
                            href={getRoute('admin.payments.index') + `?payer_id=${payerId}&payer_type=${payerType}`}
                            className="block text-center text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 py-2"
                        >
                            View all {payments.length} payments
                        </Link>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};