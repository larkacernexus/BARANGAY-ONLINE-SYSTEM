// forms-show/hooks/useFormActions.ts
import { useState } from 'react';
import { Form, Permissions } from '@/types/portal/forms/form.types';

interface UseFormActionsProps {
    form: Form;
    permissions: Permissions;
}

export const useFormActions = ({ form, permissions }: UseFormActionsProps) => {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = () => {
        if (isDownloading || !form.is_active || !permissions.can_download) return;
        
        setIsDownloading(true);
        window.open(`/forms/${form.slug}/download`, '_blank');
        setTimeout(() => setIsDownloading(false), 1000);
    };

    const handleShare = async () => {
        const shareData = {
            title: form.title,
            text: form.description,
            url: window.location.href,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const copyFormLink = () => {
        navigator.clipboard.writeText(window.location.href);
    };

    const copyFormCode = () => {
        navigator.clipboard.writeText(form.slug);
    };

    return {
        isDownloading,
        handleDownload,
        handleShare,
        copyFormLink,
        copyFormCode,
    };
};