// payment-show/components/dialogs/ChangePaymentMethodDialog.tsx
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { PaymentMethod } from '@/utils/portal/payments/payment-utils';

interface ChangePaymentMethodDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    paymentMethod: PaymentMethod;
    setPaymentMethod: (method: PaymentMethod) => void;
    referenceNumber: string;
    setReferenceNumber: (ref: string) => void;
    onUpdate: () => void;
    loading: boolean;
}

export function ChangePaymentMethodDialog({
    open,
    onOpenChange,
    paymentMethod,
    setPaymentMethod,
    referenceNumber,
    setReferenceNumber,
    onUpdate,
    loading
}: ChangePaymentMethodDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Change Payment Method</DialogTitle>
                    <DialogDescription>
                        Update the payment method for this transaction.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="payment_method">Payment Method</Label>
                        <select
                            id="payment_method"
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                            className="w-full rounded-md border border-gray-300 p-2"
                        >
                            <option value="cash">Cash</option>
                            <option value="gcash">GCash</option>
                            <option value="maya">Maya</option>
                            <option value="bank">Bank Transfer</option>
                            <option value="online">Online Payment</option>
                            <option value="card">Card</option>
                        </select>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="reference_number">Reference Number (Optional)</Label>
                        <Input
                            id="reference_number"
                            placeholder="Enter reference number"
                            value={referenceNumber}
                            onChange={(e) => setReferenceNumber(e.target.value)}
                        />
                    </div>
                </div>
                
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={onUpdate} disabled={loading}>
                        {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        Update
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}