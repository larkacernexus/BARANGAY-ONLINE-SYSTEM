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
import { Fee, Permissions } from '../types';

interface Props {
    fee: Fee;
    permissions: Permissions;
    isProcessing: boolean;
    isOverdue: boolean;
    getStatusVariant: (status: string) => any;
    getStatusIcon: (status: string) => JSX.Element | null;
    getPaymentProgress: () => number;
    onRecordPayment: () => void;
    onApprove: () => void;
    onCollect: () => void;
    onSendReminder: () => void;
    onWaive: () => void;
    onCancel: () => void;
    formatDate: (date?: string) => string;
    formatCurrency: (amount: number | string | undefined) => string;
}

export const FeeStatusSidebar = ({
    fee,
    permissions,
    isProcessing,
    isOverdue,
    getStatusVariant,
    getStatusIcon,
    getPaymentProgress,
    onRecordPayment,
    onApprove,
    onCollect,
    onSendReminder,
    onWaive,
    onCancel,
    formatDate,
    formatCurrency
}: Props) => {
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
                        <Badge variant={getStatusVariant(fee.status)} className="flex items-center gap-1 w-fit">
                            {getStatusIcon(fee.status)}
                            {fee.status_display || fee.status}
                        </Badge>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Progress</p>
                        <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-300">Paid: {formatCurrency(fee.amount_paid)}</span>
                                <span className="font-medium dark:text-gray-100">{getPaymentProgress()}%</span>
                            </div>
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-green-500 rounded-full transition-all duration-300"
                                    style={{ width: `${getPaymentProgress()}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                <span>₱0</span>
                                <span>{formatCurrency(fee.total_amount)}</span>
                            </div>
                        </div>
                    </div>

                    {fee.valid_until && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Valid Until</p>
                            <p className="text-sm dark:text-gray-300">{formatDate(fee.valid_until)}</p>
                        </div>
                    )}

                    {fee.remarks && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Remarks</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{fee.remarks}</p>
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
                            <span className="font-medium dark:text-gray-100">{formatCurrency(fee.base_amount)}</span>
                        </div>
                        {fee.surcharge_amount > 0 && (
                            <div className="flex justify-between items-center">
                                <span className="text-orange-600 dark:text-orange-400">Surcharge</span>
                                <span className="font-medium text-orange-600 dark:text-orange-400">+ {formatCurrency(fee.surcharge_amount)}</span>
                            </div>
                        )}
                        {fee.penalty_amount > 0 && (
                            <div className="flex justify-between items-center">
                                <span className="text-red-600 dark:text-red-400">Penalty</span>
                                <span className="font-medium text-red-600 dark:text-red-400">+ {formatCurrency(fee.penalty_amount)}</span>
                            </div>
                        )}
                        <Separator className="dark:bg-gray-700" />
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-300">Subtotal</span>
                            <span className="font-medium dark:text-gray-100">{formatCurrency(fee.base_amount + fee.surcharge_amount + fee.penalty_amount)}</span>
                        </div>
                        {fee.discount_amount > 0 && (
                            <div className="flex justify-between items-center">
                                <span className="text-green-600 dark:text-green-400">Discount</span>
                                <span className="font-medium text-green-600 dark:text-green-400">- {formatCurrency(fee.discount_amount)}</span>
                            </div>
                        )}
                        <Separator className="dark:bg-gray-700" />
                        <div className="flex justify-between items-center">
                            <span className="font-semibold dark:text-gray-100">Total</span>
                            <span className="text-xl font-bold dark:text-gray-100">{formatCurrency(fee.total_amount)}</span>
                        </div>
                        <Separator className="dark:bg-gray-700" />
                        <div className="flex justify-between items-center">
                            <span className="text-green-600 dark:text-green-400">Amount Paid</span>
                            <span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(fee.amount_paid)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-red-600 dark:text-red-400">Balance Due</span>
                            <span className="text-lg font-bold text-red-600 dark:text-red-400">{formatCurrency(fee.balance)}</span>
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
                    {permissions.can_record_payment && fee.balance > 0 && (
                        <Button 
                            className="w-full justify-start" 
                            onClick={onRecordPayment}
                            disabled={isProcessing}
                        >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Record Payment
                        </Button>
                    )}

                    {permissions.can_approve && fee.status === 'pending' && (
                        <Button 
                            className="w-full justify-start" 
                            onClick={onApprove}
                            disabled={isProcessing}
                        >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve Fee
                        </Button>
                    )}

                    {permissions.can_collect && fee.status === 'approved' && (
                        <Button 
                            className="w-full justify-start" 
                            onClick={onCollect}
                            disabled={isProcessing}
                        >
                            <FileCheck className="h-4 w-4 mr-2" />
                            Mark as Collected
                        </Button>
                    )}

                    {isOverdue && (
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

                    {permissions.can_waive && fee.balance > 0 && (
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

                    {permissions.can_cancel && !['paid', 'cancelled', 'waived'].includes(fee.status) && (
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

                    <Button variant="ghost" className="w-full justify-start dark:text-gray-300 dark:hover:bg-gray-900">
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
                        <span className="text-gray-500 dark:text-gray-400">Created</span>
                        <span className="dark:text-gray-300">{formatDate(fee.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Last Updated</span>
                        <span className="dark:text-gray-300">{formatDate(fee.updated_at)}</span>
                    </div>
                    {fee.payment_date && (
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Paid Date</span>
                            <span className="dark:text-gray-300">{formatDate(fee.payment_date)}</span>
                        </div>
                    )}
                    {fee.cancelled_at && (
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Cancelled Date</span>
                            <span className="dark:text-gray-300">{formatDate(fee.cancelled_at)}</span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};