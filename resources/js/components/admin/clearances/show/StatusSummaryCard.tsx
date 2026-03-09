import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';
import { PaymentStatusBadge } from './PaymentStatusBadge';
import { ClearanceRequest } from '@/types/clearance';
import { JSX } from 'react';

interface StatusSummaryCardProps {
    clearance: ClearanceRequest;
    formatDate: (date?: string) => string;
    formatDateTime: (date?: string) => string;
    formatCurrency: (amount?: number) => string;
    getStatusVariant: (status: string) => any;
    getStatusIcon: (status: string) => JSX.Element | null;
}

export function StatusSummaryCard({
    clearance,
    formatDate,
    formatDateTime,
    formatCurrency,
    getStatusVariant,
    getStatusIcon
}: StatusSummaryCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Status Summary
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">Current Status</p>
                    <div className="flex items-center gap-2">
                        <Badge variant={getStatusVariant(clearance.status)} className="flex items-center gap-1">
                            {getStatusIcon(clearance.status)}
                            {clearance.status_display || clearance.status}
                        </Badge>
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">Payment Status</p>
                    <PaymentStatusBadge status={clearance.payment_status || 'unpaid'} />
                    {clearance.payment_status === 'partially_paid' && (
                        <p className="text-xs text-gray-500 mt-1">
                            Paid: {formatCurrency(clearance.amount_paid || 0)} of {formatCurrency(clearance.fee_amount)}
                        </p>
                    )}
                    {clearance.payment_status === 'paid' && clearance.or_number && (
                        <p className="text-xs text-gray-500 mt-1">
                            OR #: {clearance.or_number}
                        </p>
                    )}
                </div>

                {clearance.estimated_completion_date && (
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500">Estimated Completion</p>
                        <p className="text-sm">{formatDate(clearance.estimated_completion_date)}</p>
                    </div>
                )}

                {clearance.issuing_officer_name && (
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500">Issuing Officer</p>
                        <p className="text-sm">{clearance.issuing_officer_name}</p>
                    </div>
                )}

                {clearance.processed_at && (
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500">Processed At</p>
                        <p className="text-sm">{formatDateTime(clearance.processed_at)}</p>
                    </div>
                )}

                {clearance.remarks && (
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500">Officer Remarks</p>
                        <p className="text-sm text-gray-600">{clearance.remarks}</p>
                    </div>
                )}

                {clearance.admin_notes && (
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500">Admin Notes</p>
                        <p className="text-sm text-gray-600">{clearance.admin_notes}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}