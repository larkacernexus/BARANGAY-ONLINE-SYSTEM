// resources/js/Pages/Admin/Fees/components/fee-status-banners.tsx

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Shield,
    AlertTriangle,
    Download,
    Bell,
    CheckCircle,
    XCircle,
    Clock,
    FileCheck,
    AlertCircle,
} from 'lucide-react';
import { Fee } from '@/types/admin/fees/fees';
import { formatDate as importedFormatDate } from '@/types/admin/fees/fees';

// ========== TYPES ==========
interface FeeStatusBannersProps {
    fee: Fee;
    isOverdue: boolean;
    daysOverdue: number;
    onDownloadCertificate: () => void;
    onSendReminder: () => void;
    isProcessing: boolean;
}

interface ValidityStatus {
    text: string;
    color: string;
    variant: 'success' | 'warning' | 'danger' | 'info';
    icon: React.ReactNode;
}

export const FeeStatusBanners: React.FC<FeeStatusBannersProps> = ({
    fee,
    isOverdue,
    daysOverdue,
    onDownloadCertificate,
    onSendReminder,
    isProcessing
}) => {
    // Format date using imported function
    const formatDate = (date: string | null | undefined): string => {
        return importedFormatDate(date);
    };

    // Calculate remaining validity for paid fees
    const getValidityStatus = (): ValidityStatus | null => {
        // Only show validity for paid fees
        if (fee.status !== 'paid') {
            return null;
        }

        // Check if fee has validity period (using custom field or certificate issuance)
        const validUntil = (fee as any).valid_until || 
                          (fee.certificate_number && fee.paid_date 
                              ? new Date(new Date(fee.paid_date).setFullYear(new Date(fee.paid_date).getFullYear() + 1)).toISOString()
                              : null);

        if (!validUntil) {
            return null;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const validUntilDate = new Date(validUntil);
        validUntilDate.setHours(0, 0, 0, 0);
        
        const diffTime = validUntilDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 30) {
            return {
                text: `Valid for ${diffDays} days`,
                color: 'text-green-600 dark:text-green-400',
                variant: 'success',
                icon: <CheckCircle className="h-5 w-5 text-green-500" />
            };
        } else if (diffDays > 7) {
            return {
                text: `Valid for ${diffDays} days`,
                color: 'text-green-600 dark:text-green-400',
                variant: 'success',
                icon: <CheckCircle className="h-5 w-5 text-green-500" />
            };
        } else if (diffDays > 0) {
            return {
                text: `Expires in ${diffDays} day${diffDays !== 1 ? 's' : ''}`,
                color: 'text-amber-600 dark:text-amber-400',
                variant: 'warning',
                icon: <Clock className="h-5 w-5 text-amber-500" />
            };
        } else if (diffDays === 0) {
            return {
                text: 'Expires today',
                color: 'text-amber-600 dark:text-amber-400',
                variant: 'warning',
                icon: <AlertCircle className="h-5 w-5 text-amber-500" />
            };
        } else {
            const daysExpired = Math.abs(diffDays);
            return {
                text: `Expired ${daysExpired} day${daysExpired !== 1 ? 's' : ''} ago`,
                color: 'text-red-600 dark:text-red-400',
                variant: 'danger',
                icon: <XCircle className="h-5 w-5 text-red-500" />
            };
        }
    };

    const validityStatus = getValidityStatus();

    // Get border color based on variant
    const getBorderColor = (variant: ValidityStatus['variant']): string => {
        switch (variant) {
            case 'success':
                return 'border-l-green-500';
            case 'warning':
                return 'border-l-amber-500';
            case 'danger':
                return 'border-l-red-500';
            case 'info':
                return 'border-l-blue-500';
            default:
                return 'border-l-gray-500';
        }
    };

    // Check if fee is paid and completed
    const isCompleted = fee.status === 'paid';

    return (
        <div className="space-y-3">
            {/* Success Banner - For paid/completed fees */}
            {isCompleted && !validityStatus && (
                <Card className="border-l-4 border-l-green-500 dark:bg-gray-900">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
                            <div>
                                <p className="font-medium dark:text-gray-100">Fee Completed</p>
                                <p className="text-sm text-green-600 dark:text-green-400">
                                    This fee has been fully paid{fee.paid_date && ` on ${formatDate(fee.paid_date)}`}.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Certificate Status Banner - For paid fees with certificate */}
            {fee.status === 'paid' && validityStatus && fee.certificate_number && (
                <Card className={`border-l-4 ${getBorderColor(validityStatus.variant)} dark:bg-gray-900`}>
                    <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0">
                                    {validityStatus.icon || <Shield className="h-5 w-5" />}
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="font-medium dark:text-gray-100">Certificate Status</p>
                                        <Badge 
                                            variant="outline" 
                                            className={`${validityStatus.color} border-current`}
                                        >
                                            Certificate #{fee.certificate_number}
                                        </Badge>
                                    </div>
                                    <p className={`text-sm ${validityStatus.color}`}>
                                        {validityStatus.text}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Issued on {formatDate(fee.paid_date || fee.issue_date)}
                                        {(fee as any).valid_until && ` • Valid until ${formatDate((fee as any).valid_until)}`}
                                    </p>
                                </div>
                            </div>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={onDownloadCertificate}
                                className="flex-shrink-0"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Download Certificate
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Certificate Available Banner - For paid fees with certificate but no validity tracking */}
            {fee.status === 'paid' && !validityStatus && fee.certificate_number && (
                <Card className="border-l-4 border-l-blue-500 dark:bg-gray-900">
                    <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <FileCheck className="h-5 w-5 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                                <div>
                                    <p className="font-medium dark:text-gray-100">Certificate Available</p>
                                    <p className="text-sm text-blue-600 dark:text-blue-400">
                                        Certificate #{fee.certificate_number} has been issued for this fee.
                                    </p>
                                    {fee.paid_date && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Issued on {formatDate(fee.paid_date)}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={onDownloadCertificate}
                                className="flex-shrink-0"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Download Certificate
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Overdue Warning Banner */}
            {isOverdue && fee.status !== 'paid' && fee.status !== 'cancelled' && (
                <Card className="border-l-4 border-l-red-500 dark:bg-gray-900">
                    <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400 flex-shrink-0" />
                                <div>
                                    <p className="font-medium dark:text-gray-100">Fee Overdue</p>
                                    <p className="text-sm text-red-600 dark:text-red-400">
                                        This fee is {daysOverdue} day{daysOverdue !== 1 ? 's' : ''} overdue. 
                                        The due date was {formatDate(fee.due_date)}.
                                    </p>
                                    {fee.penalty_amount && fee.penalty_amount > 0 && (
                                        <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                                            Penalty applied: {new Intl.NumberFormat('en-PH', { 
                                                style: 'currency', 
                                                currency: 'PHP' 
                                            }).format(fee.penalty_amount)}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={onSendReminder} 
                                disabled={isProcessing}
                                className="flex-shrink-0"
                            >
                                <Bell className="h-4 w-4 mr-2" />
                                {isProcessing ? 'Sending...' : 'Send Reminder'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Due Soon Banner - Not overdue but due within 7 days */}
            {!isOverdue && fee.status !== 'paid' && fee.status !== 'cancelled' && (() => {
                const dueDate = new Date(fee.due_date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                dueDate.setHours(0, 0, 0, 0);
                
                const diffTime = dueDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays <= 7 && diffDays > 0) {
                    return (
                        <Card className="border-l-4 border-l-amber-500 dark:bg-gray-900">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <Clock className="h-5 w-5 text-amber-500 dark:text-amber-400 flex-shrink-0" />
                                    <div>
                                        <p className="font-medium dark:text-gray-100">Due Soon</p>
                                        <p className="text-sm text-amber-600 dark:text-amber-400">
                                            This fee is due in {diffDays} day{diffDays !== 1 ? 's' : ''} on {formatDate(fee.due_date)}.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                }
                return null;
            })()}

            {/* Cancelled Banner */}
            {fee.status === 'cancelled' && (
                <Card className="border-l-4 border-l-gray-500 dark:bg-gray-900">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <XCircle className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                            <div>
                                <p className="font-medium dark:text-gray-100">Fee Cancelled</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    This fee has been cancelled.
                                    {fee.cancelled_at && ` Cancelled on ${formatDate(fee.cancelled_at)}.`}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Refunded Banner */}
            {fee.status === 'refunded' && (
                <Card className="border-l-4 border-l-purple-500 dark:bg-gray-900">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-purple-500 dark:text-purple-400 flex-shrink-0" />
                            <div>
                                <p className="font-medium dark:text-gray-100">Fee Refunded</p>
                                <p className="text-sm text-purple-600 dark:text-purple-400">
                                    This fee has been refunded.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};