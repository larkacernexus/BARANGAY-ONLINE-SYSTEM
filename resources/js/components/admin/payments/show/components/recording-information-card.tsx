// resources/js/Pages/Admin/Payments/components/recording-information-card.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Payment } from '../types';

interface Props {
    payment: Payment;
    formatDate: (date?: string, includeTime?: boolean) => string;
}

export const RecordingInformationCard = ({ payment, formatDate }: Props) => {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm dark:text-gray-100">Recording Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Recorded By</p>
                    <p className="font-semibold dark:text-gray-100">{payment.recorder?.name || 'System'}</p>
                    {payment.recorder?.email && (
                        <p className="text-xs text-gray-600 dark:text-gray-400">{payment.recorder.email}</p>
                    )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Created</p>
                        <p className="text-xs dark:text-gray-300">{formatDate(payment.created_at, true)}</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Last Updated</p>
                        <p className="text-xs dark:text-gray-300">{formatDate(payment.updated_at, true)}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};