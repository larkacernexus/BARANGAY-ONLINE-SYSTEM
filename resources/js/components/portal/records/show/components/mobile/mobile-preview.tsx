// components/document/mobile/mobile-preview.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ModernCard } from '@/components/residentui/modern-card';
import { Maximize2, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getFileIcon, getFileColor } from '@/utils/portal/records/document.utils';
import { Document } from '@/types/portal/records/document.types';

interface MobilePreviewProps {
    document: Document;
    previewUrl: string;
    onFullscreen: () => void;
}

export function MobilePreview({ document, previewUrl, onFullscreen }: MobilePreviewProps) {
    const [isLoading, setIsLoading] = useState(true);
    const FileIcon = getFileIcon(document.file_extension || '');
    const isPdf = document.file_extension?.toLowerCase() === 'pdf' || document.mime_type?.includes('pdf');
    const isImage = document.mime_type?.startsWith('image/');

    return (
        <div className="px-4">
            <ModernCard className="overflow-hidden p-0">
                <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm z-10">
                            <div className="text-center">
                                <div className="relative">
                                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <FileText className="h-5 w-5 text-blue-600 opacity-50" />
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 mt-2">Loading preview...</p>
                            </div>
                        </div>
                    )}

                    {isPdf ? (
                        <iframe
                            src={previewUrl}
                            title={document.name}
                            className="w-full h-[300px] border-0"
                            onLoad={() => setIsLoading(false)}
                            onError={() => setIsLoading(false)}
                        />
                    ) : isImage ? (
                        <img
                            src={previewUrl}
                            alt={document.name}
                            className="w-full h-auto max-h-[300px] object-contain"
                            onLoad={() => setIsLoading(false)}
                            onError={() => setIsLoading(false)}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 px-4">
                            <div className={cn("w-20 h-20 rounded-2xl flex items-center justify-center mb-4", getFileColor(document.file_extension || ''))}>
                                <FileIcon className="h-10 w-10" />
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                                Preview not available for this file type
                            </p>
                        </div>
                    )}

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onFullscreen}
                        className="absolute bottom-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg rounded-full px-4"
                    >
                        <Maximize2 className="h-4 w-4 mr-2" />
                        Fullscreen
                    </Button>
                </div>

                {document.description && (
                    <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                        <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                            {document.description}
                        </p>
                    </div>
                )}
            </ModernCard>
        </div>
    );
}