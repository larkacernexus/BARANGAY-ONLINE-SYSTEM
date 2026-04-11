// components/admin/clearances/show/ActionsPanel.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    FileSignature,
    FileCode,
    CheckCircle,
    Mail,
    Shield,
    XCircle,
    MessageSquare,
    AlertCircle,
    Loader2,
    RefreshCw,
    DollarSign,
    Eye
} from 'lucide-react';
import { ClearanceRequest, ClearanceType } from '@/types/admin/clearances/clearance';

interface ActionsPanelProps {
    clearance: ClearanceRequest;
    clearanceType?: ClearanceType;
    canProcess: boolean;
    canApprove: boolean;
    canIssue: boolean;
    isProcessing: boolean;
    onMarkAsProcessing: () => void;
    onVerifyPayment: () => void;
    onSendReminder: () => void;
    onApprove: () => void;
    onIssue: () => void;
    onReject: () => void;
    onCancel: () => void;
    onAddNote: () => void;
    onViewPayment?: () => void;
}

export function ActionsPanel({
    clearance,
    clearanceType,
    canProcess,
    canApprove,
    canIssue,
    isProcessing,
    onMarkAsProcessing,
    onVerifyPayment,
    onSendReminder,
    onApprove,
    onIssue,
    onReject,
    onCancel,
    onAddNote,
    onViewPayment
}: ActionsPanelProps) {
    if (!canProcess && !canApprove && !canIssue) return null;

    const requiresPayment = clearanceType?.requires_payment || false;
    const isPaymentPaid = clearance.payment_status === 'paid';

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm dark:text-gray-100">
                    <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-700 dark:to-orange-700 flex items-center justify-center">
                        <FileSignature className="h-3 w-3 text-white" />
                    </div>
                    Available Actions
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {/* Pending -> Processing */}
                {clearance.status === 'pending' && canProcess && (
                    <Button
                        className="w-full justify-start bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white dark:from-blue-700 dark:to-indigo-700 dark:hover:from-blue-800 dark:hover:to-indigo-800"
                        onClick={onMarkAsProcessing}
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        Mark as Processing
                    </Button>
                )}

                {/* Pending Payment Actions */}
                {clearance.status === 'pending_payment' && canProcess && (
                    <>
                        <Button
                            className="w-full justify-start bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white dark:from-green-700 dark:to-emerald-700 dark:hover:from-green-800 dark:hover:to-emerald-800"
                            onClick={onVerifyPayment}
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            Verify Payment
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full justify-start border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950/50"
                            onClick={onSendReminder}
                            disabled={isProcessing}
                        >
                            <Mail className="h-4 w-4 mr-2" />
                            Send Payment Reminder
                        </Button>
                    </>
                )}

                {/* Processing -> Approve */}
                {clearance.status === 'processing' && canApprove && (
                    <Button
                        className={`w-full justify-start ${
                            !requiresPayment || isPaymentPaid
                                ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white dark:from-green-700 dark:to-emerald-700 dark:hover:from-green-800 dark:hover:to-emerald-800'
                                : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                        }`}
                        onClick={onApprove}
                        disabled={isProcessing || (requiresPayment && !isPaymentPaid)}
                    >
                        {isProcessing ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Approve Request
                        {requiresPayment && !isPaymentPaid && (
                            <span className="ml-2 text-xs">(Payment required)</span>
                        )}
                    </Button>
                )}

                {/* Approved -> Issue */}
                {clearance.status === 'approved' && canIssue && (
                    <Button
                        className="w-full justify-start bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white dark:from-purple-700 dark:to-pink-700 dark:hover:from-purple-800 dark:hover:to-pink-800"
                        onClick={onIssue}
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Shield className="h-4 w-4 mr-2" />
                        )}
                        Issue Certificate
                    </Button>
                )}

                {/* View Payment (if available) */}
                {onViewPayment && clearance.payment && (
                    <Button
                        variant="outline"
                        className="w-full justify-start dark:border-gray-600 dark:text-gray-300"
                        onClick={onViewPayment}
                    >
                        <DollarSign className="h-4 w-4 mr-2" />
                        View Payment Details
                    </Button>
                )}

                {/* Reject/Cancel for pending/processing */}
                {['pending', 'pending_payment', 'processing'].includes(clearance.status) && canProcess && (
                    <>
                        <Separator className="dark:bg-gray-700" />
                        <Button
                            variant="outline"
                            className="w-full justify-start border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/50"
                            onClick={onReject}
                            disabled={isProcessing}
                        >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject Request
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full justify-start border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-900"
                            onClick={onCancel}
                            disabled={isProcessing}
                        >
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Cancel Request
                        </Button>
                    </>
                )}

                {/* Add Note - Always available */}
                <Separator className="dark:bg-gray-700" />
                <Button
                    variant="outline"
                    className="w-full justify-start dark:border-gray-600 dark:text-gray-300"
                    onClick={onAddNote}
                >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Add Note
                </Button>
            </CardContent>
        </Card>
    );
}