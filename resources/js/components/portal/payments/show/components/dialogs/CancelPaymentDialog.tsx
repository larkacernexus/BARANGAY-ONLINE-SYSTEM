// payment-show/components/dialogs/CancelPaymentDialog.tsx
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface CancelPaymentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    reason: string;
    setReason: (reason: string) => void;
    onConfirm: () => void;
    loading: boolean;
}

export function CancelPaymentDialog({
    open,
    onOpenChange,
    reason,
    setReason,
    onConfirm,
    loading
}: CancelPaymentDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Cancel Payment</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to cancel this payment? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="cancel_reason">Reason for Cancellation</Label>
                        <Textarea
                            id="cancel_reason"
                            placeholder="Please provide a reason for cancellation..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={3}
                        />
                    </div>
                </div>
                
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        No, Keep Payment
                    </Button>
                    <Button 
                        variant="destructive" 
                        onClick={onConfirm}
                        disabled={loading || !reason.trim()}
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        Yes, Cancel Payment
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}