// clearance-show/hooks/useClearanceActions.ts
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { downloadFile } from '@/components/residentui/lib/resident-ui-utils';
import { ClearanceRequest } from '@/types/portal/clearances/clearance.types';

interface UseClearanceActionsProps {
    clearance: ClearanceRequest;
}

export const useClearanceActions = ({ clearance }: UseClearanceActionsProps) => {
    const [loading, setLoading] = useState(false);
    const [isDownloadingClearance, setIsDownloadingClearance] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);

    const handleClearanceDownload = async () => {
        try {
            setIsDownloadingClearance(true);
            await downloadFile(
                `/my-clearances/${clearance.id}/download`,
                `clearance-${clearance.reference_number}.pdf`
            );
            toast.success('Clearance downloaded successfully');
        } catch (error) {
            console.error('Download failed:', error);
            toast.error('Failed to download clearance. Please try again.');
        } finally {
            setIsDownloadingClearance(false);
        }
    };

    const handleDocumentDownload = async (document: any) => {
        try {
            await downloadFile(
                `/storage/${document.file_path}`,
                document.original_name || document.file_name
            );
            toast.success('Document downloaded successfully');
        } catch (error) {
            console.error('Download failed:', error);
            toast.error('Failed to download document. Please try again.');
        }
    };

    const handlePrint = () => {
        setIsPrinting(true);
        try {
            const printWindow = window.open(`/my-clearances/${clearance.id}/print`, '_blank');
            if (!printWindow) {
                throw new Error('Popup blocked. Please allow popups for this site.');
            }
            
            printWindow.onload = () => {
                setIsPrinting(false);
            };
            
            setTimeout(() => {
                setIsPrinting(false);
            }, 3000);
        } catch (error) {
            console.error('Print failed:', error);
            toast.error('Failed to open print window. Please check popup blocker settings.');
            setIsPrinting(false);
        }
    };

    const handleCancelRequest = () => {
        if (confirm('Are you sure you want to cancel this request?')) {
            setLoading(true);
            router.patch(`/my-clearances/${clearance.id}`, {
                status: 'cancelled'
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Request cancelled successfully');
                    router.reload();
                },
                onError: () => {
                    toast.error('Failed to cancel request');
                    setLoading(false);
                },
                onFinish: () => setLoading(false),
            });
        }
    };

    const copyReferenceNumber = () => {
        navigator.clipboard.writeText(clearance.reference_number)
            .then(() => toast.success('Reference number copied to clipboard!'))
            .catch(() => toast.error('Failed to copy'));
    };

    return {
        loading,
        isDownloadingClearance,
        isPrinting,
        handleClearanceDownload,
        handleDocumentDownload,
        handlePrint,
        handleCancelRequest,
        copyReferenceNumber,
        setLoading
    };
};