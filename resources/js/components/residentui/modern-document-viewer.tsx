import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    X, Download, Loader2, FileText, Image as ImageIcon, 
    FileType, AlertCircle, Eye, FileImage 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatFileSize, getFileType, downloadFile } from '@/components/residentui/lib/resident-ui-utils';
import { ModernEmptyState } from './modern-empty-state';
import { useModal } from '@/components/residentui/hooks/useResidentUI';

interface DocumentViewerProps {
    document: any;
    isOpen: boolean;
    onClose: () => void;
}

export function ModernDocumentViewer({ document: doc, isOpen, onClose }: DocumentViewerProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const { isMounted } = useModal();
    
    const fileType = getFileType(doc);
    const documentUrl = `/storage/${doc.file_path}`;
    
    const handleDownload = useCallback(async () => {
        setIsDownloading(true);
        setError(null);
        
        try {
            await downloadFile(documentUrl, doc.original_name || doc.file_name);
        } catch (error) {
            console.error('Download failed:', error);
            setError('Failed to download document. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    }, [documentUrl, doc.original_name, doc.file_name]);
    
    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            setError(null);
        }
    }, [isOpen]);
    
    if (!isMounted || !isOpen) return null;
    
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-2 sm:p-4 animate-fade-in">
            <div className="relative w-full max-w-6xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center flex-shrink-0">
                            {fileType === 'image' ? (
                                <ImageIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            ) : fileType === 'pdf' ? (
                                <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            ) : (
                                <FileType className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                {doc.original_name || doc.file_name}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                                <span>{formatFileSize(doc.file_size)}</span>
                                {doc.document_type && (
                                    <>
                                        <span>•</span>
                                        <Badge variant="outline" className="text-[10px]">
                                            {doc.document_type.name}
                                        </Badge>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownload}
                            disabled={isDownloading}
                            className="gap-2 rounded-xl"
                        >
                            {isDownloading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Download className="h-4 w-4" />
                            )}
                            <span className="hidden sm:inline">Download</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="h-8 w-8 p-0 rounded-xl"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                
                <div className="flex-1 overflow-auto touch-pan-y bg-gray-50 dark:bg-gray-900/50">
                    {error ? (
                        <div className="h-full flex items-center justify-center p-8">
                            <ModernEmptyState
                                status="error"
                                title="Failed to Load Document"
                                description={error}
                                icon={AlertCircle}
                                action={{
                                    label: "Try Downloading",
                                    onClick: handleDownload
                                }}
                            />
                        </div>
                    ) : fileType === 'image' ? (
                        <div className="h-full flex items-center justify-center p-4">
                            <div className="relative w-full h-full flex items-center justify-center">
                                <img
                                    src={documentUrl}
                                    alt={doc.original_name || doc.file_name}
                                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                                    onLoad={() => setIsLoading(false)}
                                    onError={() => {
                                        setError('Failed to load image');
                                        setIsLoading(false);
                                    }}
                                    style={{ display: isLoading ? 'none' : 'block' }}
                                />
                                {isLoading && (
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                        <p className="text-sm text-gray-500">Loading image...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : fileType === 'pdf' ? (
                        <div className="h-full relative">
                            <iframe
                                src={documentUrl}
                                title={doc.original_name || doc.file_name}
                                className="w-full h-full border-0"
                                onLoad={() => setIsLoading(false)}
                                onError={() => {
                                    setError('Failed to load PDF');
                                    setIsLoading(false);
                                }}
                            />
                            {isLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-900">
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                        <p className="text-sm text-gray-500">Loading PDF...</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center p-8">
                            <ModernEmptyState
                                status="info"
                                title="Preview Not Available"
                                description={`File type: ${doc.mime_type || doc.file_type || 'Unknown'}`}
                                icon={FileType}
                                action={{
                                    label: "Download File",
                                    onClick: handleDownload,
                                    loading: isDownloading
                                }}
                            />
                        </div>
                    )}
                </div>
                
                {doc.description && (
                    <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium text-gray-900 dark:text-white">Description:</span> {doc.description}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

interface DocumentThumbnailProps {
    document: any;
    onView: () => void;
    onDownload?: () => void;
}

export function ModernDocumentThumbnail({ document: doc, onView, onDownload }: DocumentThumbnailProps) {
    const fileType = getFileType(doc);
    const documentUrl = `/storage/${doc.file_path}`;
    const [imageError, setImageError] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    
    useEffect(() => {
        setIsMounted(true);
    }, []);
    
    if (!isMounted) {
        return (
            <div className="h-32 sm:h-48 w-full rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 animate-pulse" />
        );
    }
    
    return (
        <div className="space-y-1.5">
            <div 
                className="relative group cursor-pointer active:scale-[0.98] transition-all duration-300 touch-manipulation"
                onClick={onView}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onView();
                    }
                }}
            >
                {fileType === 'image' ? (
                    <div className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 shadow-sm group-hover:shadow-md transition-all">
                        <img
                            src={documentUrl}
                            alt={doc.original_name || doc.file_name}
                            className="h-32 sm:h-48 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={() => setImageError(true)}
                            loading="lazy"
                        />
                        {imageError && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                                <FileImage className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="bg-black/50 backdrop-blur-sm text-white p-2 rounded-full">
                                <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-32 sm:h-48 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 flex flex-col items-center justify-center p-4 group-hover:shadow-md group-hover:border-gray-300 dark:group-hover:border-gray-600 transition-all duration-300">
                        {fileType === 'pdf' ? (
                            <FileText className="h-8 w-8 sm:h-12 sm:w-12 text-red-400 mb-2" />
                        ) : (
                            <FileType className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mb-2" />
                        )}
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center truncate w-full px-1 font-medium">
                            {doc.original_name || doc.file_name}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            {formatFileSize(doc.file_size)}
                        </p>
                    </div>
                )}
                
                <div className="absolute top-2 right-2 flex gap-1">
                    <Badge variant="secondary" className={cn(
                        "text-[10px] px-2 py-0.5 backdrop-blur-sm",
                        fileType === 'image' && "bg-blue-500/90 text-white",
                        fileType === 'pdf' && "bg-red-500/90 text-white",
                        fileType === 'other' && "bg-gray-500/90 text-white"
                    )}>
                        {fileType === 'image' ? 'Image' : fileType === 'pdf' ? 'PDF' : 'Document'}
                    </Badge>
                    {doc.is_verified && (
                        <Badge className="bg-green-500/90 text-white text-[10px] px-2 py-0.5 backdrop-blur-sm">
                            Verified
                        </Badge>
                    )}
                </div>
            </div>
            
            {onDownload && (
                <div className="flex items-center justify-between">
                    <p className="text-[10px] font-medium truncate max-w-[70%]">
                        {doc.original_name || doc.file_name}
                    </p>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 rounded-lg"
                        onClick={onDownload}
                    >
                        <Download className="h-3 w-3" />
                    </Button>
                </div>
            )}
        </div>
    );
}