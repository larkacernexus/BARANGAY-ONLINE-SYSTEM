// announcement-show/hooks/useAnnouncementActions.ts
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { downloadFile } from '@/components/residentui/lib/resident-ui-utils';
import { Announcement, AnnouncementAttachment } from '@/types/portal/announcements/announcement.types';

interface UseAnnouncementActionsProps {
    announcement: Announcement;
}

export const useAnnouncementActions = ({ announcement }: UseAnnouncementActionsProps) => {
    const [loading, setLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [isShareCopied, setIsShareCopied] = useState(false);

    const handleShare = async () => {
        const shareUrl = window.location.href;
        const shareText = `Check out this announcement: ${announcement.title}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: announcement.title,
                    text: shareText,
                    url: shareUrl,
                });
            } catch (error) {
                if (error instanceof Error && error.name !== 'AbortError') {
                    handleCopyShareLink();
                }
            }
        } else {
            handleCopyShareLink();
        }
    };

    const handleCopyShareLink = () => {
        navigator.clipboard.writeText(window.location.href)
            .then(() => {
                setIsShareCopied(true);
                setTimeout(() => setIsShareCopied(false), 2000);
            })
            .catch(() => {
                const textArea = document.createElement('textarea');
                textArea.value = window.location.href;
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    setIsShareCopied(true);
                    setTimeout(() => setIsShareCopied(false), 2000);
                } catch (err) {
                    console.error('Copy failed:', err);
                }
                document.body.removeChild(textArea);
            });
    };

    const handleLike = () => {
        setIsLiked(!isLiked);
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${announcement.title}</title>
                    <style>
                        body { font-family: system-ui; padding: 40px; max-width: 800px; margin: 0 auto; }
                        .title { font-size: 28px; font-weight: bold; margin-bottom: 16px; }
                        .meta { color: #666; margin-bottom: 32px; }
                        .content { line-height: 1.6; }
                        .attachments { margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee; }
                        .attachment { display: flex; align-items: center; gap: 8px; padding: 8px; background: #f9f9f9; border-radius: 4px; margin-bottom: 8px; }
                    </style>
                </head>
                <body>
                    <div class="title">${announcement.title}</div>
                    <div class="meta">Posted: ${new Date(announcement.created_at).toLocaleString()}</div>
                    <div class="content">${announcement.content}</div>
                    ${announcement.attachments && announcement.attachments.length > 0 ? `
                        <div class="attachments">
                            <h3>Attachments (${announcement.attachments.length})</h3>
                            ${announcement.attachments.map(att => `
                                <div class="attachment">
                                    <span>📎</span>
                                    <span>${att.original_name} (${att.formatted_size})</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
        }
    };

    const handleDownloadAttachment = async (attachment: AnnouncementAttachment) => {
        setIsDownloading(true);
        try {
            const response = await fetch(`/portal/announcements/attachments/${attachment.id}/download`);
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = attachment.original_name || attachment.file_name;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                await downloadFile(
                    `/storage/${attachment.file_path}`,
                    attachment.original_name || attachment.file_name
                );
            }
            
            router.post(`/portal/announcements/attachments/${attachment.id}/track-download`, {}, {
                preserveState: true,
                preserveScroll: true,
                onError: () => console.error('Failed to track download')
            });
        } catch (error) {
            console.error('Download error:', error);
        } finally {
            setIsDownloading(false);
        }
    };

    return {
        loading,
        isDownloading,
        isLiked,
        isShareCopied,
        handleShare,
        handleLike,
        handlePrint,
        handleDownloadAttachment,
        setLoading
    };
};