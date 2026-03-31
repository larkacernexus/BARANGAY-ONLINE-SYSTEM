// resources/js/components/admin/blotters/show/tabs/attachments-tab.tsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, FileImage, FileArchive, FileSpreadsheet, Loader2, Eye } from 'lucide-react';
import { useState } from 'react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { DisplayAttachment } from '@/types/admin/blotters/display-attachment';

interface AttachmentsTabProps {
    attachments: DisplayAttachment[];
    isLoading: boolean;
    onDownload: (attachment: DisplayAttachment, index: number) => void;
    blotterId: number;
}

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper function to get file icon component
const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
        return FileImage;
    }
    if (type.includes('pdf')) {
        return FileText;
    }
    if (type.includes('word') || type.includes('document')) {
        return FileText;
    }
    if (type.includes('excel') || type.includes('spreadsheet')) {
        return FileSpreadsheet;
    }
    if (type.includes('zip') || type.includes('rar')) {
        return FileArchive;
    }
    return FileText;
};

// Helper function to get file extension
const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || '';
};

export function AttachmentsTab({
    attachments,
    isLoading,
    onDownload,
    blotterId
}: AttachmentsTabProps) {
    const [previewOpen, setPreviewOpen] = useState<number | null>(null);

    if (isLoading) {
        return (
            <Card className="dark:bg-gray-900">
                <CardContent className="py-12">
                    <div className="flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-500 dark:text-gray-400" />
                        <span className="ml-2 text-gray-500 dark:text-gray-400">Loading attachments...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!attachments || attachments.length === 0) {
        return (
            <Card className="dark:bg-gray-900">
                <CardContent className="py-12 text-center">
                    <Download className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold dark:text-gray-100 mb-2">No Attachments</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        No files have been attached to this blotter record.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <Download className="h-5 w-5" />
                    Attachments
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                    Files attached to this blotter record ({attachments.length} file{attachments.length !== 1 ? 's' : ''})
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {attachments.map((attachment, index) => {
                        const fileName = attachment.name || attachment.file_name || 'Unknown file';
                        const fileSize = attachment.size || attachment.file_size || 0;
                        const fileType = attachment.type || attachment.file_type || 'application/octet-stream';
                        const IconComponent = getFileIcon(fileType);
                        const isImage = fileType.startsWith('image/');
                        
                        return (
                            <div
                                key={attachment.id || index}
                                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                            >
                                <div className="flex items-start gap-3 mb-3 sm:mb-0">
                                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                        <IconComponent className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate dark:text-gray-200">
                                            {fileName}
                                        </p>
                                        <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            <span>{formatFileSize(fileSize)}</span>
                                            <span>•</span>
                                            <span className="uppercase">{getFileExtension(fileName)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isImage && attachment.preview && (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setPreviewOpen(index)}
                                                        className="dark:border-gray-600 dark:text-gray-300"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                        <span className="sr-only">Preview</span>
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Preview image</TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => onDownload(attachment, index)}
                                                    className="dark:border-gray-600 dark:text-gray-300"
                                                >
                                                    <Download className="h-4 w-4" />
                                                    <span className="sr-only">Download</span>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Download file</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Image Preview Modal */}
                {previewOpen !== null && attachments[previewOpen]?.preview && (
                    <div 
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" 
                        onClick={() => setPreviewOpen(null)}
                    >
                        <div 
                            className="relative max-w-4xl max-h-[90vh]" 
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={attachments[previewOpen].preview}
                                alt={attachments[previewOpen].name || 'Preview'}
                                className="max-w-full max-h-[90vh] object-contain rounded-lg"
                            />
                            <button
                                onClick={() => setPreviewOpen(null)}
                                className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
                                aria-label="Close preview"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}