// components/EvidenceThumbnail.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getFileIcon } from '@/components/residentui/reports/constants';
import { formatFileSize } from '@/components/residentui/reports/report-utils';
import { Eye, Download, Trash2, Paperclip, Image } from 'lucide-react';
import { ReportEvidence } from '@/types/portal/reports/community-report';

interface EvidenceThumbnailProps {
    evidence: ReportEvidence;
    onView: (url: string) => void;
    onDownload: (evidenceId: number, fileName: string) => void;
    onDelete?: (evidenceId: number) => void;
    canEdit: boolean;
    isDeleting?: number | null;
}

export const EvidenceThumbnail = ({
    evidence,
    onView,
    onDownload,
    onDelete,
    canEdit,
    isDeleting
}: EvidenceThumbnailProps) => {
    // Determine file type from mime_type
    const fileType = evidence.mime_type || '';
    const isImage = evidence.is_image || fileType.startsWith('image/');
    const FileIcon = getFileIcon(fileType, isImage);
    const [imageError, setImageError] = useState(false);
    const isCurrentlyDeleting = isDeleting === evidence.id;

    // Get the file URL, prioritizing file_url over file_path
    const fileUrl = evidence.file_url || evidence.file_path;

    const handleView = () => {
        if (fileUrl) {
            onView(fileUrl);
        }
    };

    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDownload(evidence.id, evidence.original_name || evidence.file_name);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onDelete) {
            onDelete(evidence.id);
        }
    };

    return (
        <div className="relative group cursor-pointer active:scale-[0.98] transition-all duration-300">
            {isImage ? (
                <div 
                    className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 shadow-sm group-hover:shadow-md transition-all"
                    onClick={handleView}
                >
                    {fileUrl ? (
                        <img
                            src={fileUrl}
                            alt={evidence.original_name || evidence.file_name}
                            className="h-32 sm:h-40 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={() => setImageError(true)}
                            loading="lazy"
                        />
                    ) : (
                        <div className="h-32 sm:h-40 w-full flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                            <Image className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                        </div>
                    )}
                    {imageError && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                            <Image className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-black/50 backdrop-blur-sm text-white p-2 rounded-full">
                            <Eye className="h-4 w-4" />
                        </div>
                    </div>
                </div>
            ) : (
                <div 
                    className="h-32 sm:h-40 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 flex flex-col items-center justify-center p-4 group-hover:shadow-md group-hover:border-gray-300 dark:group-hover:border-gray-600 transition-all duration-300"
                    onClick={handleView}
                >
                    <FileIcon className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400 mb-2" />
                    <p className="text-xs text-gray-600 dark:text-gray-400 text-center truncate w-full px-1 font-medium">
                        {evidence.original_name || evidence.file_name}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        {evidence.formatted_size || formatFileSize(evidence.file_size)}
                    </p>
                </div>
            )}
            
            <div className="absolute top-2 right-2 flex gap-1">
                <Badge variant="secondary" className={cn(
                    "text-[10px] px-2 py-0.5 backdrop-blur-sm",
                    isImage && "bg-blue-500/90 text-white",
                    fileType.includes('pdf') && "bg-red-500/90 text-white",
                    !isImage && !fileType.includes('pdf') && "bg-gray-500/90 text-white"
                )}>
                    {isImage ? 'Image' : fileType.includes('pdf') ? 'PDF' : 'Document'}
                </Badge>
            </div>

            <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button
                    variant="secondary"
                    size="sm"
                    className="h-7 w-7 p-0 rounded-lg bg-white/90 backdrop-blur-sm hover:bg-white"
                    onClick={handleDownload}
                    disabled={!fileUrl}
                >
                    <Download className="h-3 w-3" />
                </Button>
                {canEdit && onDelete && (
                    <Button
                        variant="destructive"
                        size="sm"
                        className="h-7 w-7 p-0 rounded-lg bg-red-500/90 backdrop-blur-sm hover:bg-red-600"
                        onClick={handleDelete}
                        disabled={isCurrentlyDeleting}
                    >
                        {isCurrentlyDeleting ? (
                            <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Trash2 className="h-3 w-3" />
                        )}
                    </Button>
                )}
            </div>

            {evidence.notes && (
                <div className="absolute bottom-2 left-2">
                    <Badge variant="outline" className="text-[10px] bg-white/90 backdrop-blur-sm">
                        <Paperclip className="h-2 w-2 mr-1" />
                        Note
                    </Badge>
                </div>
            )}
        </div>
    );
};