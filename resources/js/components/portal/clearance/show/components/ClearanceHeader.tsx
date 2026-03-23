// clearance-show/components/ClearanceHeader.tsx
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Copy, Download, Printer, XCircle, Loader2 } from 'lucide-react';
import { formatDate } from '@/components/residentui/lib/resident-ui-utils';
import { ClearanceRequest } from '@/types/portal/clearances/clearance.types';
import { getStatusConfig } from '@/components/residentui/clearances/clearance-utils';

interface ClearanceHeaderProps {
    clearance: ClearanceRequest;
    isDownloadingClearance: boolean;
    isPrinting: boolean;
    onDownload: () => void;
    onPrint: () => void;
    onCopyReference: () => void;
    onCancel: () => void;
}

export function ClearanceHeader({
    clearance,
    isDownloadingClearance,
    isPrinting,
    onDownload,
    onPrint,
    onCopyReference,
    onCancel
}: ClearanceHeaderProps) {
    const statusConfig = getStatusConfig(clearance.status);

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <Link href="/portal/my-clearances">
                    <Button variant="ghost" size="sm" className="gap-2 rounded-xl">
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                        {clearance.clearance_type?.name || 'Clearance Request'}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Reference: {clearance.reference_number}
                        </p>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 rounded-lg"
                            onClick={onCopyReference}
                        >
                            <Copy className="h-3 w-3" />
                        </Button>
                    </div>
                </div>
            </div>
            
            <div className="flex gap-2">
                {clearance.status === 'issued' && clearance.clearance_number && (
                    <>
                        <Button
                            variant="outline"
                            className="gap-2 rounded-xl"
                            onClick={onDownload}
                            disabled={isDownloadingClearance}
                        >
                            {isDownloadingClearance ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Download className="h-4 w-4" />
                            )}
                            Download
                        </Button>
                        <Button
                            variant="outline"
                            className="gap-2 rounded-xl"
                            onClick={onPrint}
                            disabled={isPrinting}
                        >
                            {isPrinting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Printer className="h-4 w-4" />
                            )}
                            Print
                        </Button>
                    </>
                )}
                {clearance.status === 'pending' && (
                    <Button
                        variant="destructive"
                        className="gap-2 rounded-xl"
                        onClick={onCancel}
                    >
                        <XCircle className="h-4 w-4" />
                        Cancel Request
                    </Button>
                )}
            </div>
        </div>
    );
}