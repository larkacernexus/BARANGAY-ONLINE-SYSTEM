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
    MessageSquare
} from 'lucide-react';
import { ClearanceRequest, ClearanceType } from '@/types/clearance';

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
    onAddNote
}: ActionsPanelProps) {
    if (!canProcess) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileSignature className="h-5 w-5" />
                    Actions
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {clearance.status === 'pending' && (
                    <Button 
                        className="w-full justify-start" 
                        onClick={onMarkAsProcessing}
                        disabled={isProcessing}
                    >
                        <FileCode className="h-4 w-4 mr-2" />
                        Mark as Processing
                    </Button>
                )}

                {clearance.status === 'pending_payment' && (
                    <>
                        <Button 
                            className="w-full justify-start" 
                            onClick={onVerifyPayment}
                            disabled={isProcessing}
                        >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Verify Payment
                        </Button>
                        <Button 
                            variant="outline"
                            className="w-full justify-start" 
                            onClick={onSendReminder}
                            disabled={isProcessing}
                        >
                            <Mail className="h-4 w-4 mr-2" />
                            Send Payment Reminder
                        </Button>
                    </>
                )}

                {clearance.status === 'processing' && canApprove && (
                    <Button 
                        className="w-full justify-start" 
                        onClick={onApprove}
                        disabled={isProcessing || (clearanceType?.requires_payment && clearance.payment_status !== 'paid')}
                    >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve Request
                    </Button>
                )}

                {clearance.status === 'approved' && canIssue && (
                    <Button 
                        className="w-full justify-start" 
                        onClick={onIssue}
                        disabled={isProcessing}
                    >
                        <Shield className="h-4 w-4 mr-2" />
                        Issue Certificate
                    </Button>
                )}

                {['pending', 'pending_payment', 'processing'].includes(clearance.status) && (
                    <>
                        <Separator />
                        <Button 
                            variant="outline" 
                            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={onReject}
                            disabled={isProcessing}
                        >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject Request
                        </Button>
                        <Button 
                            variant="outline" 
                            className="w-full justify-start text-gray-600 hover:text-gray-700"
                            onClick={onCancel}
                            disabled={isProcessing}
                        >
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancel Request
                        </Button>
                    </>
                )}

                <Separator />

                <Button variant="ghost" className="w-full justify-start" onClick={onAddNote}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Add Note
                </Button>
            </CardContent>
        </Card>
    );
}