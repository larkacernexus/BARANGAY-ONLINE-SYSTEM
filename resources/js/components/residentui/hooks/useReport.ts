// hooks/useReport.ts
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

export const useMobileDetection = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return { isMobile };
};

export const useReportActions = (reportId: number) => {
    const [deletingEvidence, setDeletingEvidence] = useState<number | null>(null);

    const handlePrint = () => {
        window.print();
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Community Report: ${reportId}`,
                    text: `Report #${reportId}`,
                    url: window.location.href,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard!');
        }
    };

    const handleDeleteEvidence = (evidenceId: number, onSuccess?: () => void) => {
        if (!confirm('Are you sure you want to delete this evidence file?')) {
            return;
        }

        setDeletingEvidence(evidenceId);
        
        router.delete(`/portal/community-reports/${reportId}/evidence/${evidenceId}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Evidence deleted successfully');
                setDeletingEvidence(null);
                onSuccess?.();
            },
            onError: () => {
                toast.error('Failed to delete evidence');
                setDeletingEvidence(null);
            }
        });
    };

    const downloadEvidence = (fileUrl: string, fileName: string) => {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName;
        link.click();
    };

    return {
        deletingEvidence,
        handlePrint,
        handleShare,
        handleDeleteEvidence,
        downloadEvidence
    };
};