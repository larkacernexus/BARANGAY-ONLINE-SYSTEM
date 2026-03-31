// resources/js/Pages/Admin/Announcements/components/image-preview-dialog.tsx

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, Download, Loader2 } from 'lucide-react';

// Import types from admin types
import type { AnnouncementAttachment } from '@/types/admin/announcements/announcement.types';

interface Props {
    viewingAttachment: AnnouncementAttachment | null;
    setViewingAttachment: (attachment: AnnouncementAttachment | null) => void;
    onDownload: (attachment: AnnouncementAttachment) => void;
    isDownloading: number | null;
    formatDateTime: (date: string | null) => string;
}

export const ImagePreviewDialog = ({
    viewingAttachment,
    setViewingAttachment,
    onDownload,
    isDownloading,
    formatDateTime
}: Props) => {
    // Helper function to get image URL
    const getImageUrl = (attachment: AnnouncementAttachment): string => {
        // Check if file_path already includes /storage/ or is a full URL
        if (attachment.file_path.startsWith('http') || attachment.file_path.startsWith('/storage/')) {
            return attachment.file_path;
        }
        // Otherwise, prepend /storage/
        return `/storage/${attachment.file_path}`;
    };

    // Helper function to handle opening in new tab
    const handleOpenInNewTab = (attachment: AnnouncementAttachment) => {
        const url = getImageUrl(attachment);
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    // Handle dialog close
    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setViewingAttachment(null);
        }
    };

    if (!viewingAttachment) return null;

    return (
        <Dialog open={!!viewingAttachment} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-4xl dark:bg-gray-900">
                <DialogHeader>
                    <DialogTitle className="dark:text-gray-100 truncate">
                        {viewingAttachment.original_name || viewingAttachment.file_name}
                    </DialogTitle>
                    <DialogDescription className="dark:text-gray-400">
                        {viewingAttachment.formatted_size && (
                            <span>{viewingAttachment.formatted_size} • </span>
                        )}
                        Uploaded on {formatDateTime(viewingAttachment.created_at)}
                    </DialogDescription>
                </DialogHeader>
                
                {viewingAttachment.is_image && (
                    <div className="mt-4 flex justify-center items-center min-h-[200px] bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <img
                            src={getImageUrl(viewingAttachment)}
                            alt={viewingAttachment.original_name || viewingAttachment.file_name}
                            className="max-w-full max-h-[60vh] object-contain rounded-lg"
                            onError={(e) => {
                                // Handle image loading error
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                // You could show an error message here
                                console.error('Failed to load image:', viewingAttachment.file_path);
                            }}
                        />
                    </div>
                )}
                
                <div className="flex justify-end gap-2 mt-4">
                    <Button 
                        variant="outline" 
                        onClick={() => handleOpenInNewTab(viewingAttachment)} 
                        className="dark:border-gray-600 dark:text-gray-300"
                        type="button"
                    >
                        <Eye className="h-4 w-4 mr-2" />
                        Open in New Tab
                    </Button>
                    <Button 
                        onClick={() => onDownload(viewingAttachment)} 
                        disabled={isDownloading === viewingAttachment.id} 
                        className="dark:bg-blue-600 dark:hover:bg-blue-700"
                        type="button"
                    >
                        {isDownloading === viewingAttachment.id ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Downloading...
                            </>
                        ) : (
                            <>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};