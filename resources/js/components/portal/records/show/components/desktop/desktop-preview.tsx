// components/document/desktop/desktop-preview.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ModernCard } from '@/components/residentui/modern-card';
import { Maximize2, FileText, Info, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getFileIcon, getFileColor } from '@/utils/portal/records/document.utils';
import { Document } from '@/types/portal/records/records';

interface DesktopPreviewProps {
    document: Document;
    previewUrl: string;
    onFullscreen: () => void;
}

export function DesktopPreview({ document, previewUrl, onFullscreen }: DesktopPreviewProps) {
    const [zoom, setZoom] = useState(100);
    const [isLoading, setIsLoading] = useState(true);
    const FileIcon = getFileIcon(document.file_extension || '');
    const isPdf = document.file_extension?.toLowerCase() === 'pdf' || document.mime_type?.includes('pdf');
    const isImage = document.mime_type?.startsWith('image/');

    return (
        <ModernCard title="Document Preview" icon={Eye} iconColor="from-blue-500 to-indigo-500">
            <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 rounded-xl overflow-hidden min-h-[400px]">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm z-10">
                        <div className="text-center">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <FileText className="h-6 w-6 text-blue-600 opacity-50" />
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 mt-3">Loading preview...</p>
                        </div>
                    </div>
                )}

                {isPdf ? (
                    <iframe
                        src={previewUrl}
                        title={document.name}
                        className="w-full h-[500px] border-0"
                        style={{
                            transform: `scale(${zoom / 100})`,
                            transformOrigin: '0 0',
                            width: `${10000 / zoom}%`,
                            height: `${10000 / zoom}%`,
                        }}
                        onLoad={() => setIsLoading(false)}
                        onError={() => setIsLoading(false)}
                    />
                ) : isImage ? (
                    <img
                        src={previewUrl}
                        alt={document.name}
                        className="w-full h-auto max-h-[500px] object-contain mx-auto"
                        onLoad={() => setIsLoading(false)}
                        onError={() => setIsLoading(false)}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 px-4">
                        <div className={cn("w-24 h-24 rounded-2xl flex items-center justify-center mb-4", getFileColor(document.file_extension || ''))}>
                            <FileIcon className="h-12 w-12" />
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                            Preview not available for this file type
                        </p>
                        <Button onClick={onFullscreen} variant="outline" className="gap-2">
                            <Maximize2 className="h-4 w-4" />
                            Open in Fullscreen
                        </Button>
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
                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        Description
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
                        {document.description}
                    </p>
                </div>
            )}
        </ModernCard>
    );
}