// forms-show/tabs/PreviewTab.tsx
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ModernCard } from '@/components/residentui/modern-card';
import { ZoomIn, ZoomOut, Maximize2, ExternalLink, Download, Printer, Loader2, AlertCircle, FileText } from 'lucide-react';
import { Form, Permissions } from '@/types/portal/forms/form.types';
import { formatFileSize, getFileExtension } from '@/utils/portal/forms/form-utils';

interface PreviewTabProps {
    form: Form;
    previewUrl: string;
    isPdf: boolean;
    isImage: boolean;
    zoomLevel: number;
    setZoomLevel: (level: number) => void;
    isLoadingPdf: boolean;
    pdfError: string | null;
    onPdfLoad: () => void;
    onPdfError: () => void;
    onFullscreen: () => void;
    onDownload: () => void;
    isDownloading: boolean;
    permissions: Permissions;
}

export function PreviewTab({
    form,
    previewUrl,
    isPdf,
    isImage,
    zoomLevel,
    setZoomLevel,
    isLoadingPdf,
    pdfError,
    onPdfLoad,
    onPdfError,
    onFullscreen,
    onDownload,
    isDownloading,
    permissions
}: PreviewTabProps) {
    const renderPreview = () => {
        if (isPdf) {
            return (
                <div className="relative border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900 min-h-[500px]">
                    {isLoadingPdf && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/90 dark:bg-gray-900/90 z-10">
                            <div className="text-center space-y-3">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto" />
                                <p className="text-gray-600 dark:text-gray-400 font-medium">Loading form preview...</p>
                            </div>
                        </div>
                    )}
                    
                    {pdfError && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/90 dark:bg-gray-900/90 z-10">
                            <div className="text-center p-6 max-w-md space-y-4">
                                <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Preview Unavailable</h3>
                                    <p className="text-gray-600 dark:text-gray-400">{pdfError}</p>
                                </div>
                                {permissions.can_download && (
                                    <Button onClick={onDownload} className="gap-2">
                                        <Download className="h-4 w-4" />
                                        Download Instead
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                    
                    <iframe
                        src={previewUrl}
                        title={form.title}
                        className="w-full h-[500px] border-0"
                        onLoad={onPdfLoad}
                        onError={onPdfError}
                    />
                </div>
            );
        }
        
        if (isImage) {
            return (
                <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900">
                    <img 
                        src={previewUrl}
                        alt={form.title}
                        className="w-full h-auto max-h-[500px] object-contain mx-auto"
                        loading="lazy"
                    />
                </div>
            );
        }
        
        return (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-900">
                <div className="inline-block p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-lg mb-4">
                    <FileText className="h-16 w-16 text-gray-400" />
                </div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">{form.file_name}</h3>
                <div className="flex flex-col items-center gap-2 mb-6">
                    <Badge variant="outline" className="font-mono">
                        {getFileExtension(form.file_name)}
                    </Badge>
                    <span className="text-sm text-gray-500">{formatFileSize(form.file_size)}</span>
                </div>
                {permissions.can_download && form.is_active && (
                    <Button 
                        onClick={onDownload}
                        disabled={isDownloading}
                        size="lg"
                        className="gap-2"
                    >
                        <Download className="h-5 w-5" />
                        {isDownloading ? 'Downloading...' : 'Download Form'}
                    </Button>
                )}
            </div>
        );
    };

    return (
        <ModernCard
            title="Form Preview"
            description={isPdf ? 'PDF Document - Scroll to view pages' : isImage ? 'Image - Click to zoom' : 'Document - Download to view'}
            action={
                <div className="flex items-center gap-2">
                    {isPdf && (
                        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setZoomLevel(Math.max(zoomLevel - 25, 50))}
                                disabled={zoomLevel <= 50}
                                className="h-7 w-7 p-0"
                            >
                                <ZoomOut className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium px-2">{zoomLevel}%</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setZoomLevel(Math.min(zoomLevel + 25, 200))}
                                disabled={zoomLevel >= 200}
                                className="h-7 w-7 p-0"
                            >
                                <ZoomIn className="h-3 w-3" />
                            </Button>
                        </div>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onFullscreen}
                        className="h-8"
                    >
                        <Maximize2 className="h-3 w-3 mr-1" />
                        Fullscreen
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(previewUrl, '_blank')}
                        className="h-8"
                    >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        New Tab
                    </Button>
                </div>
            }
        >
            {renderPreview()}

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-500">File Type</p>
                        <p className="text-sm font-semibold">
                            {isPdf && 'PDF'}
                            {isImage && 'Image'}
                            {!isPdf && !isImage && 'Document'}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-500">File Size</p>
                        <p className="text-sm">{formatFileSize(form.file_size)}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-500">Pages</p>
                        <p className="text-sm">{form.pages || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-500">Format</p>
                        <p className="text-sm">{getFileExtension(form.file_name)}</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {permissions.can_download && form.is_active && (
                        <Button
                            onClick={onDownload}
                            disabled={isDownloading}
                            size="sm"
                            className="gap-2"
                        >
                            {isDownloading ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                                <Download className="h-3 w-3" />
                            )}
                            Download Original
                        </Button>
                    )}
                    {isPdf && (
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(previewUrl, '_blank')}
                            className="gap-2"
                        >
                            <ExternalLink className="h-3 w-3" />
                            Open in New Tab
                        </Button>
                    )}
                    {permissions.can_print && form.is_active && (
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.print()}
                            className="gap-2"
                        >
                            <Printer className="h-3 w-3" />
                            Print
                        </Button>
                    )}
                </div>
            </div>
        </ModernCard>
    );
}