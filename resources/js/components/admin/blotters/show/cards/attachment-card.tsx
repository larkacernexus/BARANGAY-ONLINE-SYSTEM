// resources/js/components/admin/blotters/show/components/cards/attachment-card.tsx

import { Button } from '@/components/ui/button';
import { Eye, Download, Image, File, FileText } from 'lucide-react';
import { useState } from 'react';
import { Attachment } from '@/types/admin/blotters/blotter';
import { formatFileSize } from '@/components/admin/blotters/show/utils/helpers';

interface AttachmentCardProps {
    attachment: Attachment;
    onDownload: () => void;
    onView: () => void;
}

export function AttachmentCard({ attachment, onDownload, onView }: AttachmentCardProps) {
    const [isHovered, setIsHovered] = useState(false);

    const getFileIcon = () => {
        if (attachment.type.startsWith('image/')) return <Image className="h-5 w-5" />;
        if (attachment.type.includes('pdf')) return <FileText className="h-5 w-5" />;
        return <File className="h-5 w-5" />;
    };

    return (
        <div 
            className="group relative border dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-all"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {attachment.type.startsWith('image/') && attachment.preview ? (
                <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
                    <img
                        src={attachment.preview}
                        alt={attachment.name}
                        className="w-full h-full object-cover"
                    />
                    <div className={`absolute inset-0 bg-black/50 transition-opacity flex items-center justify-center gap-2 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={onView}
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                        </Button>
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={onDownload}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                            {getFileIcon()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate dark:text-gray-300">
                                {attachment.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formatFileSize(attachment.size)}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onDownload}
                        className="flex-shrink-0"
                    >
                        <Download className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}