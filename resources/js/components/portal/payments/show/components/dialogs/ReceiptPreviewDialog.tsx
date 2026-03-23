// payment-show/components/dialogs/ReceiptPreviewDialog.tsx
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Printer, Download, Save, Loader2 } from 'lucide-react';
import { Payment } from '@/utils/portal/payments/payment-utils';
import { route } from 'ziggy-js';

interface ReceiptPreviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    payment: Payment;
    onPrint: () => void;
    onDownload: () => void;
    onSave: () => void;
    isPrinting: boolean;
    isDownloading: boolean;
    isSaving: boolean;
}

export function ReceiptPreviewDialog({
    open,
    onOpenChange,
    payment,
    onPrint,
    onDownload,
    onSave,
    isPrinting,
    isDownloading,
    isSaving
}: ReceiptPreviewDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Payment Receipt - OR #{payment.or_number}</DialogTitle>
                    <DialogDescription>
                        Preview of the official receipt
                    </DialogDescription>
                </DialogHeader>
                
                <div className="mt-4">
                    <iframe 
                        src={route('portal.my.payments.receipt.view', payment.id)} 
                        className="w-full h-[600px] border-0 rounded-lg"
                        title="Receipt Preview"
                    />
                </div>
                
                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                    <Button onClick={onPrint} disabled={isPrinting}>
                        {isPrinting ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Printer className="h-4 w-4 mr-2" />
                        )}
                        Print
                    </Button>
                    <Button onClick={onDownload} disabled={isDownloading}>
                        {isDownloading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Download className="h-4 w-4 mr-2" />
                        )}
                        Download
                    </Button>
                    <Button onClick={onSave} disabled={isSaving}>
                        {isSaving ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4 mr-2" />
                        )}
                        Save Receipt
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}