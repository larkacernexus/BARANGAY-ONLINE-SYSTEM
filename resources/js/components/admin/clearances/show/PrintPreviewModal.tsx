import { RefObject } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, X } from 'lucide-react';
import { ClearanceRequest } from '@/types/admin/clearances/clearance-types';

interface PrintPreviewModalProps {
    showPrintPreview: boolean;
    onClose: () => void;
    onPrint: () => void;
    isPrinting: boolean;
    clearance: ClearanceRequest;
    printRef: RefObject<HTMLDivElement | null>; // Accept null
}

export function PrintPreviewModal({
    showPrintPreview,
    onClose,
    onPrint,
    isPrinting,
    clearance,
    printRef
}: PrintPreviewModalProps) {
    return (
        <Dialog open={showPrintPreview} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>Print Preview - {clearance.reference_number}</span>
                        <div className="flex gap-2">
                            <Button
                                onClick={onPrint}
                                disabled={isPrinting || !printRef.current}
                                variant="outline"
                                size="sm"
                            >
                                <Printer className="h-4 w-4 mr-2" />
                                {isPrinting ? 'Printing...' : 'Print'}
                            </Button>
                            <Button onClick={onClose} variant="ghost" size="sm">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                    {printRef.current ? (
                        <div 
                            dangerouslySetInnerHTML={{ __html: printRef.current.outerHTML }} 
                            className="print-content"
                        />
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            No content to preview
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}