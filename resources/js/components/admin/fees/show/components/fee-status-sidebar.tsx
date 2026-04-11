// resources/js/Pages/Admin/Fees/components/fee-status-sidebar.tsx
import React, { JSX } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    TrendingUp,
    DollarSign,
    FileSignature,
    CreditCard,
    CheckCircle,
    FileCheck,
    Bell,
    XCircle,
    MessageSquare,
} from 'lucide-react';
import { Fee, Permissions } from '@/types/admin/fees/fees';
import { formatCurrency, formatDate, getStatusColor, calculateDaysOverdue } from '@/types/admin/fees/fees';

interface Props {
    fee: Fee;
    permissions: Permissions;
    isProcessing: boolean;
    isOverdue: boolean;
    onRecordPayment: () => void;
    onApprove: () => void;
    onCollect: () => void;
    onSendReminder: () => void;
    onWaive: () => void;
    onCancel: () => void;
}

export const FeeStatusSidebar = ({
    fee,
    permissions,
    isProcessing,
    isOverdue,
    onRecordPayment,
    onApprove,
    onCollect,
    onSendReminder,
    onWaive,
    onCancel,
}: Props) => {
    // Calculate payment progress
    const getPaymentProgress = (): number => {
        const total = fee.total_amount || fee.amount;
        const paid = fee.amount_paid || fee.paid_amount || 0;
        if (!total || total === 0) return 0;
        return Math.min((paid / total) * 100, 100);
    };

    // Get status display text
    const getStatusDisplay = (status: string): string => {
        const statusMap: Record<string, string> = {
            pending: 'Pending',
            paid: 'Paid',
            overdue: 'Overdue',
            cancelled: 'Cancelled',
            refunded: 'Refunded',
            issued: 'Issued',
            partial: 'Partially Paid',
            partially_paid: 'Partially Paid'
        };
        return statusMap[status] || status;
    };

    // Get status variant for Badge component
    const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            paid: "default",
            pending: "secondary",
            overdue: "destructive",
            issued: "default",
            partial: "secondary",
            partially_paid: "secondary",
            cancelled: "secondary",
            refunded: "secondary"
        };
        return variants[status] || "secondary";
    };

    const progress = getPaymentProgress();
    const totalAmount = fee.total_amount || fee.amount;
    const paidAmount = fee.amount_paid || fee.paid_amount || 0;
    const balance = fee.balance || (totalAmount - paidAmount);
    const surchargeAmount = fee.surcharge_amount || 0;
    const penaltyAmount = fee.penalty_amount || 0;
    const discountAmount = fee.discount_amount || 0;

    // Check if fee can be collected (issued status means it's ready for collection)
    const canCollect = fee.status === 'issued';
    
    // Check if fee can be approved (pending status)
    const canApprove = fee.status === 'pending';

    return (
        <div className="space-y-6">
            {/* Status Summary */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <TrendingUp className="h-5 w-5" />
                        Status Summary
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Status</p>
                        <Badge 
                            variant={getStatusVariant(fee.status)} 
                            className={`flex items-center gap-1 w-fit ${getStatusColor(fee.status)}`}
                        >
                            {getStatusDisplay(fee.status)}
                        </Badge>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Progress</p>
                        <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-300">Paid: {formatCurrency(paidAmount)}</span>
                                <span className="font-medium dark:text-gray-100">{Math.round(progress)}%</span>
                            </div>
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-green-500 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                <span>₱0</span>
                                <span>{formatCurrency(totalAmount)}</span>
                            </div>
                        </div>
                    </div>

                    {fee.due_date && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Due Date</p>
                            <p className="text-sm dark:text-gray-300">{formatDate(fee.due_date)}</p>
                            {isOverdue && (
                                <p className="text-xs text-red-600 dark:text-red-400">
                                    Overdue by {calculateDaysOverdue(fee.due_date)} days
                                </p>
                            )}
                        </div>
                    )}

                    {fee.notes && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Notes</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{fee.notes}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Amount Summary */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <DollarSign className="h-5 w-5" />
                        Amount Summary
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-300">Base Amount</span>
                            <span className="font-medium dark:text-gray-100">{formatCurrency(totalAmount - surchargeAmount - penaltyAmount + discountAmount)}</span>
                        </div>
                        {surchargeAmount > 0 && (
                            <div className="flex justify-between items-center">
                                <span className="text-orange-600 dark:text-orange-400">Surcharge</span>
                                <span className="font-medium text-orange-600 dark:text-orange-400">+ {formatCurrency(surchargeAmount)}</span>
                            </div>
                        )}
                        {penaltyAmount > 0 && (
                            <div className="flex justify-between items-center">
                                <span className="text-red-600 dark:text-red-400">Penalty</span>
                                <span className="font-medium text-red-600 dark:text-red-400">+ {formatCurrency(penaltyAmount)}</span>
                            </div>
                        )}
                        <Separator className="dark:bg-gray-700" />
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-300">Subtotal</span>
                            <span className="font-medium dark:text-gray-100">{formatCurrency(totalAmount + discountAmount)}</span>
                        </div>
                        {discountAmount > 0 && (
                            <div className="flex justify-between items-center">
                                <span className="text-green-600 dark:text-green-400">Discount</span>
                                <span className="font-medium text-green-600 dark:text-green-400">- {formatCurrency(discountAmount)}</span>
                            </div>
                        )}
                        <Separator className="dark:bg-gray-700" />
                        <div className="flex justify-between items-center">
                            <span className="font-semibold dark:text-gray-100">Total Amount</span>
                            <span className="text-xl font-bold dark:text-gray-100">{formatCurrency(totalAmount)}</span>
                        </div>
                        <Separator className="dark:bg-gray-700" />
                        <div className="flex justify-between items-center">
                            <span className="text-green-600 dark:text-green-400">Amount Paid</span>
                            <span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(paidAmount)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-red-600 dark:text-red-400">Balance Due</span>
                            <span className="text-lg font-bold text-red-600 dark:text-red-400">{formatCurrency(balance)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Actions Panel */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <FileSignature className="h-5 w-5" />
                        Actions
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {permissions.can_record_payment && balance > 0 && fee.status !== 'paid' && fee.status !== 'cancelled' && (
                        <Button 
                            className="w-full justify-start" 
                            onClick={onRecordPayment}
                            disabled={isProcessing}
                        >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Record Payment
                        </Button>
                    )}

                    {permissions.can_approve && canApprove && (
                        <Button 
                            className="w-full justify-start" 
                            onClick={onApprove}
                            disabled={isProcessing}
                        >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve Fee
                        </Button>
                    )}

                    {permissions.can_collect && canCollect && (
                        <Button 
                            className="w-full justify-start" 
                            onClick={onCollect}
                            disabled={isProcessing}
                        >
                            <FileCheck className="h-4 w-4 mr-2" />
                            Mark as Collected
                        </Button>
                    )}

                    {isOverdue && fee.status !== 'paid' && fee.status !== 'cancelled' && (
                        <Button 
                            variant="outline" 
                            className="w-full justify-start"
                            onClick={onSendReminder}
                            disabled={isProcessing}
                        >
                            <Bell className="h-4 w-4 mr-2" />
                            Send Reminder
                        </Button>
                    )}

                    {permissions.can_waive && balance > 0 && fee.status !== 'paid' && fee.status !== 'cancelled' && (
                        <Button 
                            variant="outline" 
                            className="w-full justify-start text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/50"
                            onClick={onWaive}
                            disabled={isProcessing}
                        >
                            <FileCheck className="h-4 w-4 mr-2" />
                            Waive Fee
                        </Button>
                    )}

                    {permissions.can_cancel && !['paid', 'cancelled', 'refunded'].includes(fee.status) && (
                        <Button 
                            variant="outline" 
                            className="w-full justify-start text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/50"
                            onClick={onCancel}
                            disabled={isProcessing}
                        >
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancel Fee
                        </Button>
                    )}

                    <Separator className="dark:bg-gray-700" />

                    <Button variant="ghost" className="w-full justify-start dark:text-gray-300 dark:hover:bg-gray-800">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Add Note
                    </Button>
                </CardContent>
            </Card>

            {/* Quick Info */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="text-sm font-medium dark:text-gray-100">Quick Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Fee Code</span>
                        <span className="font-mono dark:text-gray-300">{fee.fee_code || fee.code || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Created</span>
                        <span className="dark:text-gray-300">{formatDate(fee.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Last Updated</span>
                        <span className="dark:text-gray-300">{formatDate(fee.updated_at)}</span>
                    </div>
                    {fee.paid_date && (
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Paid Date</span>
                            <span className="dark:text-gray-300">{formatDate(fee.paid_date)}</span>
                        </div>
                    )}
                    {fee.cancelled_at && (
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Cancelled Date</span>
                            <span className="dark:text-gray-300">{formatDate(fee.cancelled_at)}</span>
                        </div>
                    )}
                    {fee.certificate_number && (
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Certificate #</span>
                            <span className="font-mono dark:text-gray-300">{fee.certificate_number}</span>
                        </div>
                    )}
                    {fee.or_number && (
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">OR #</span>
                            <span className="font-mono dark:text-gray-300">{fee.or_number}</span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};