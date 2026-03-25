// components/residentui/hooks/useReportActions.ts
import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';

interface UseReportActionsProps {
    reportId: number;
}

interface UseReportActionsReturn {
    deletingEvidence: number | null;
    isPrinting: boolean;
    isSharing: boolean;
    handlePrint: () => void;
    handleShare: () => void;
    handleDeleteEvidence: (evidenceId: number) => void;
    downloadEvidence: (evidenceId: number, fileName: string) => void;
}

export const useReportActions = ({ reportId }: UseReportActionsProps): UseReportActionsReturn => {
    const [deletingEvidence, setDeletingEvidence] = useState<number | null>(null);
    const [isPrinting, setIsPrinting] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    
    const { delete: destroy } = useForm({});

    const handlePrint = () => {
        setIsPrinting(true);
        try {
            window.print();
            toast.success('Print dialog opened');
        } catch (error) {
            toast.error('Failed to open print dialog');
        } finally {
            setIsPrinting(false);
        }
    };

    const handleShare = async () => {
        setIsSharing(true);
        try {
            const url = window.location.href;
            if (navigator.share) {
                await navigator.share({
                    title: 'Community Report',
                    text: 'Check out this community report',
                    url: url,
                });
                toast.success('Shared successfully');
            } else {
                // Fallback to copy to clipboard
                await navigator.clipboard.writeText(url);
                toast.success('Link copied to clipboard');
            }
        } catch (error) {
            if (error instanceof Error && error.name !== 'AbortError') {
                toast.error('Failed to share');
            }
        } finally {
            setIsSharing(false);
        }
    };

    const handleDeleteEvidence = (evidenceId: number) => {
        if (!confirm('Are you sure you want to delete this evidence?')) {
            return;
        }
        
        setDeletingEvidence(evidenceId);
        
        destroy(route('community-reports.evidence.destroy', { reportId, evidenceId }), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Evidence deleted successfully');
                setDeletingEvidence(null);
            },
            onError: (errors) => {
                console.error('Failed to delete evidence:', errors);
                toast.error('Failed to delete evidence');
                setDeletingEvidence(null);
            },
        });
    };

    const downloadEvidence = (evidenceId: number, fileName: string) => {
        // Create a temporary anchor element to trigger download
        const link = document.createElement('a');
        link.href = route('community-reports.evidence.download', { reportId, evidenceId });
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success('Download started');
    };

    return {
        deletingEvidence,
        isPrinting,
        isSharing,
        handlePrint,
        handleShare,
        handleDeleteEvidence,
        downloadEvidence,
    };
};