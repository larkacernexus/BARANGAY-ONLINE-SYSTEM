import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
    TrendingUp,
    Calendar,
    User,
    FileText,
    Clock,
    AlertCircle,
    CheckCircle,
    DollarSign,
    Shield,
    Tag,
    Copy,
    RefreshCw,
    XCircle,
    FileCheck,
    MessageSquare
} from 'lucide-react';
import { ClearanceRequest } from '@/types/admin/clearances/clearance-types'; // Fix import
import { JSX } from 'react';

interface StatusSummaryCardProps {
    clearance: ClearanceRequest;
    formatDate: (date?: string | null) => string;
    formatDateTime: (date?: string | null) => string;
    formatCurrency: (amount?: number) => string;
    getStatusVariant: (status: string) => any;
    getStatusIcon: (status: string) => JSX.Element | null;
    onMarkAsProcessing?: () => void;
    onApprove?: () => void;
    onIssue?: () => void;
    onReject?: () => void;
    onAddNote?: () => void;
    canProcess?: boolean;
    canApprove?: boolean;
    canIssue?: boolean;
    isProcessing?: boolean;
}

export function StatusSummaryCard({
    clearance,
    formatDate,
    formatDateTime,
    formatCurrency,
    getStatusVariant,
    getStatusIcon,
    onMarkAsProcessing,
    onApprove,
    onIssue,
    onReject,
    onAddNote,
    canProcess = false,
    canApprove = false,
    canIssue = false,
    isProcessing = false
}: StatusSummaryCardProps) {
    const getStatusColor = (status: string): string => {
        const colors: Record<string, string> = {
            'pending': 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
            'pending_payment': 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
            'processing': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
            'approved': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
            'issued': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
            'rejected': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
            'cancelled': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700',
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700';
    };

    const getPaymentStatusColor = (status: string): string => {
        const colors: Record<string, string> = {
            'completed': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
            'paid': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
            'pending': 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
            'pending_payment': 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
            'unpaid': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700',
            'partially_paid': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
            'failed': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
            'refunded': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700',
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700';
    };

    const getStatusIconComponent = (status: string) => {
        switch (status) {
            case 'pending':
            case 'pending_payment':
                return <Clock className="h-4 w-4" />;
            case 'processing':
                return <RefreshCw className="h-4 w-4" />;
            case 'approved':
                return <CheckCircle className="h-4 w-4" />;
            case 'issued':
                return <FileCheck className="h-4 w-4" />;
            case 'rejected':
            case 'cancelled':
                return <XCircle className="h-4 w-4" />;
            default:
                return <AlertCircle className="h-4 w-4" />;
        }
    };

    const getPaymentStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
            case 'paid':
                return <CheckCircle className="h-4 w-4" />;
            case 'pending':
            case 'pending_payment':
                return <Clock className="h-4 w-4" />;
            case 'unpaid':
                return <DollarSign className="h-4 w-4" />;
            case 'partially_paid':
                return <AlertCircle className="h-4 w-4" />;
            case 'failed':
                return <XCircle className="h-4 w-4" />;
            case 'refunded':
                return <RefreshCw className="h-4 w-4" />;
            default:
                return <DollarSign className="h-4 w-4" />;
        }
    };

    const getPaymentStatusDisplay = (status: string): string => {
        const statusMap: Record<string, string> = {
            'completed': 'Paid',
            'paid': 'Paid',
            'pending': 'Pending',
            'pending_payment': 'Pending Payment',
            'unpaid': 'Unpaid',
            'partially_paid': 'Partially Paid',
            'failed': 'Failed',
            'refunded': 'Refunded'
        };
        return statusMap[status] || status;
    };

    const getStatusDisplay = (status: string): string => {
        const statusMap: Record<string, string> = {
            'pending': 'Pending',
            'pending_payment': 'Pending Payment',
            'processing': 'Processing',
            'approved': 'Approved',
            'issued': 'Issued',
            'rejected': 'Rejected',
            'cancelled': 'Cancelled'
        };
        return statusMap[status] || status;
    };

    const documentStats = {
        total: clearance.documents?.length || 0,
        verified: clearance.documents?.filter(d => d.verification_status === 'verified').length || 0,
    };

    const getPaymentStatus = () => {
        if (clearance.payment?.status) return clearance.payment.status;
        if (clearance.payment_status) return clearance.payment_status;
        return 'unpaid';
    };

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm dark:text-gray-100">
                    <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 flex items-center justify-center">
                        <TrendingUp className="h-3 w-3 text-white" />
                    </div>
                    Status Summary
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Status Grid */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Request Status</span>
                        <Badge variant="outline" className={getStatusColor(clearance.status)}>
                            {getStatusIconComponent(clearance.status)}
                            <span className="ml-1">{getStatusDisplay(clearance.status)}</span>
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Payment Status</span>
                        <Badge variant="outline" className={getPaymentStatusColor(getPaymentStatus())}>
                            {getPaymentStatusIcon(getPaymentStatus())}
                            <span className="ml-1">{getPaymentStatusDisplay(getPaymentStatus())}</span>
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Documents</span>
                        <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                            <span className="font-medium dark:text-gray-300">{documentStats.verified}/{documentStats.total}</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Fee Amount</span>
                        <span className="font-medium dark:text-gray-300">{formatCurrency(clearance.fee_amount)}</span>
                    </div>
                </div>

                <Separator className="dark:bg-gray-700" />

                {/* Timeline Info */}
                <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Created
                        </span>
                        <span className="font-medium dark:text-gray-300">{formatDate(clearance.created_at)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Last Updated
                        </span>
                        <span className="font-medium dark:text-gray-300">{formatDate(clearance.updated_at)}</span>
                    </div>
                    {clearance.issue_date && (
                        <div className="flex items-center justify-between">
                            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <FileCheck className="h-3 w-3" />
                                Issued
                            </span>
                            <span className="font-medium dark:text-gray-300">{formatDate(clearance.issue_date)}</span>
                        </div>
                    )}
                    {clearance.valid_until && (
                        <div className="flex items-center justify-between">
                            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Shield className="h-3 w-3" />
                                Valid Until
                            </span>
                            <span className="font-medium dark:text-gray-300">{formatDate(clearance.valid_until)}</span>
                        </div>
                    )}
                </div>

                {/* Action Buttons - Based on status */}
                {(canProcess || canApprove || canIssue) && (
                    <>
                        <Separator className="dark:bg-gray-700" />
                        <div className="space-y-2">
                            {clearance.status === 'pending' && canProcess && (
                                <Button
                                    onClick={onMarkAsProcessing}
                                    disabled={isProcessing}
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white dark:from-blue-700 dark:to-indigo-700 dark:hover:from-blue-800 dark:hover:to-indigo-800"
                                >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Mark as Processing
                                </Button>
                            )}

                            {clearance.status === 'processing' && canApprove && (
                                <Button
                                    onClick={onApprove}
                                    disabled={isProcessing}
                                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white dark:from-green-700 dark:to-emerald-700 dark:hover:from-green-800 dark:hover:to-emerald-800"
                                >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve Request
                                </Button>
                            )}

                            {clearance.status === 'approved' && canIssue && (
                                <Button
                                    onClick={onIssue}
                                    disabled={isProcessing}
                                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white dark:from-purple-700 dark:to-pink-700 dark:hover:from-purple-800 dark:hover:to-pink-800"
                                >
                                    <FileCheck className="h-4 w-4 mr-2" />
                                    Issue Certificate
                                </Button>
                            )}

                            {['pending', 'pending_payment', 'processing'].includes(clearance.status) && canProcess && (
                                <Button
                                    variant="outline"
                                    onClick={onReject}
                                    className="w-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/50"
                                >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                </Button>
                            )}

                            <Button
                                variant="outline"
                                onClick={onAddNote}
                                className="w-full dark:border-gray-600 dark:text-gray-300"
                            >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Add Note
                            </Button>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}