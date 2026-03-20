// resources/js/Pages/Admin/Fees/components/fee-status-banners.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Shield,
    AlertTriangle,
    Download,
    Bell,
    CheckCircle,
    XCircle,
} from 'lucide-react';
import { Fee } from '../types';
import { formatDate } from '../utils/formatters';

interface Props {
    fee: Fee;
    isOverdue: boolean;
    daysOverdue: number;
    onDownloadCertificate: () => void;
    onSendReminder: () => void;
    isProcessing: boolean;
}

export const FeeStatusBanners = ({
    fee,
    isOverdue,
    daysOverdue,
    onDownloadCertificate,
    onSendReminder,
    isProcessing
}: Props) => {
    // Calculate remaining validity
    const getValidityStatus = () => {
        if (fee.status !== 'paid' || !fee.valid_until) {
            return null;
        }

        const today = new Date();
        const validUntil = new Date(fee.valid_until);
        const diffTime = validUntil.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 0) {
            return { text: `Valid for ${diffDays} day${diffDays !== 1 ? 's' : ''}`, color: 'text-green-600 dark:text-green-400' };
        } else if (diffDays === 0) {
            return { text: 'Expires today', color: 'text-amber-600 dark:text-amber-400' };
        } else {
            return { text: `Expired ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} ago`, color: 'text-red-600 dark:text-red-400' };
        }
    };

    const validityStatus = getValidityStatus();

    return (
        <>
            {/* Status Banner - For paid fees with certificate */}
            {fee.status === 'paid' && validityStatus && fee.certificate_number && (
                <Card className={`border-l-4 ${validityStatus.color.includes('green') ? 'border-l-green-500' : validityStatus.color.includes('amber') ? 'border-l-amber-500' : 'border-l-red-500'} dark:bg-gray-900`}>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Shield className={`h-5 w-5 ${validityStatus.color}`} />
                                <div>
                                    <p className="font-medium dark:text-gray-100">Certificate Status</p>
                                    <p className={`text-sm ${validityStatus.color}`}>
                                        {validityStatus.text} • Issued on {formatDate(fee.payment_date)} • Certificate #{fee.certificate_number}
                                    </p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={onDownloadCertificate}>
                                <Download className="h-4 w-4 mr-2" />
                                Download Certificate
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Overdue Warning Banner */}
            {isOverdue && (
                <Card className="border-l-4 border-l-red-500 dark:bg-gray-900">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400" />
                                <div>
                                    <p className="font-medium dark:text-gray-100">Fee Overdue</p>
                                    <p className="text-sm text-red-600 dark:text-red-400">
                                        This fee is {daysOverdue} day{daysOverdue !== 1 ? 's' : ''} overdue. Please follow up with the payer.
                                    </p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={onSendReminder} disabled={isProcessing}>
                                <Bell className="h-4 w-4 mr-2" />
                                {isProcessing ? 'Sending...' : 'Send Reminder'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </>
    );
};