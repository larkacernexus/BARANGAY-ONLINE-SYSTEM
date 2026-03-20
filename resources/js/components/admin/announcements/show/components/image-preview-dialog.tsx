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

interface AnnouncementAttachment {
    id: number;
    file_path: string;
    original_name: string;
    formatted_size: string;
    is_image: boolean;
    created_at: string;
}

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
    return (
        <Dialog open={!!viewingAttachment} onOpenChange={() => setViewingAttachment(null)}>
            <DialogContent className="max-w-4xl dark:bg-gray-900">
                <DialogHeader>
                    <DialogTitle className="dark:text-gray-100">{viewingAttachment?.original_name}</DialogTitle>
                    <DialogDescription className="dark:text-gray-400">
                        {viewingAttachment?.formatted_size} • Uploaded on {viewingAttachment && formatDateTime(viewingAttachment.created_at)}
                    </DialogDescription>
                </DialogHeader>
                {viewingAttachment?.is_image && (
                    <div className="mt-4 flex justify-center">
                        <img
                            src={`/storage/${viewingAttachment.file_path}`}
                            alt={viewingAttachment.original_name}
                            className="max-w-full max-h-[60vh] object-contain rounded-lg"
                        />
                    </div>
                )}
                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => window.open(`/storage/${viewingAttachment?.file_path}`, '_blank')} className="dark:border-gray-600 dark:text-gray-300" type="button">
                        <Eye className="h-4 w-4 mr-2" />
                        Open in New Tab
                    </Button>
                    <Button onClick={() => viewingAttachment && onDownload(viewingAttachment)} disabled={isDownloading === viewingAttachment?.id} className="dark:bg-blue-600 dark:hover:bg-blue-700" type="button">
                        {isDownloading === viewingAttachment?.id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Download className="h-4 w-4 mr-2" />
                        )}
                        Download
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};