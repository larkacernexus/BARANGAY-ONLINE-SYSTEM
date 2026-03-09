import { RefObject } from 'react';
import { Button } from '@/components/ui/button';
import { X, Printer } from 'lucide-react';
import PrintableClearance from '@/components/admin/clearances/PrintableClearance';
import { ClearanceRequest } from '@/types/clearance';

interface PrintPreviewModalProps {
    showPrintPreview: boolean;
    onClose: () => void;
    onPrint: () => void;
    isPrinting: boolean;
    clearance: ClearanceRequest;
    printRef: RefObject<HTMLDivElement>;
}

export function PrintPreviewModal({ 
    showPrintPreview, 
    onClose, 
    onPrint, 
    isPrinting, 
    clearance,
    printRef 
}: PrintPreviewModalProps) {
    if (!showPrintPreview) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm overflow-auto">
            <div className="min-h-screen p-8">
                <div className="max-w-5xl mx-auto">
                    <div className="flex justify-end mb-4 gap-2">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="bg-white"
                        >
                            <X className="h-4 w-4 mr-2" />
                            Close
                        </Button>
                        <Button
                            onClick={onPrint}
                            disabled={isPrinting}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Printer className="h-4 w-4 mr-2" />
                            {isPrinting ? 'Printing...' : 'Print'}
                        </Button>
                    </div>
                    <div className="bg-white shadow-2xl rounded-lg overflow-hidden">
                        <PrintableClearance
                            ref={printRef}
                            clearance={clearance}
                            barangayInfo={{
                                name: 'Barangay San Vicente',
                                address: 'San Vicente, City of San Fernando, La Union',
                                captain: 'Hon. Juan Dela Cruz',
                                secretary: 'Maria Santos',
                                treasurer: 'Pedro Reyes'
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}