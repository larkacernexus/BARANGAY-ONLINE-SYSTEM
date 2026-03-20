// resources/js/Pages/Admin/Forms/components/fullscreen-form-viewer.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    X,
    Download,
    Printer,
    ZoomIn,
    ZoomOut,
    RotateCw,
    FileText,
    AlertTriangle,
    ArrowLeft,
} from 'lucide-react';
import { route } from 'ziggy-js';
import { Form } from '../types';

interface Props {
    form: Form;
    previewUrl: string;
    isOpen: boolean;
    isPdf: boolean;
    isImage: boolean;
    onClose: () => void;
    formatFileSize: (bytes: number) => string;
}

export const FullScreenFormViewer = ({
    form,
    previewUrl,
    isOpen,
    isPdf,
    isImage,
    onClose,
    formatFileSize,
}: Props) => {
    const [zoom, setZoom] = useState(100);
    const [rotation, setRotation] = useState(0);
    const iframeRef = useRef<HTMLIFrameElement>(null!);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            }
            if (e.ctrlKey || e.metaKey) {
                if (e.key === '+' || e.key === '=') {
                    e.preventDefault();
                    handleZoomIn();
                } else if (e.key === '-') {
                    e.preventDefault();
                    handleZoomOut();
                } else if (e.key === '0') {
                    e.preventDefault();
                    handleZoomReset();
                } else if (e.key === 'r') {
                    e.preventDefault();
                    handleRotate();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const handleIframeLoad = () => {
        setIsLoading(false);
        setError(null);
    };

    const handleIframeError = () => {
        setIsLoading(false);
        setError('Failed to load form preview');
    };

    const handleImageLoad = () => {
        setIsLoading(false);
        setError(null);
    };

    const handleImageError = () => {
        setIsLoading(false);
        setError('Failed to load image');
    };

    const handleDownload = () => {
        if (form?.id) {
            window.open(route('forms.download', form.id), '_blank');
        }
    };

    const handlePrint = () => {
        if (iframeRef.current?.contentWindow && isPdf) {
            iframeRef.current.contentWindow.print();
        } else if (isImage && previewUrl) {
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`
                    <html>
                        <head>
                            <title>Print - ${form?.title || 'Document'}</title>
                            <style>
                                body { margin: 0; padding: 20px; }
                                img { max-width: 100%; height: auto; display: block; margin: 0 auto; }
                                @media print {
                                    body { padding: 0; }
                                }
                            </style>
                        </head>
                        <body>
                            <img src="${previewUrl}" alt="${form?.title || 'Document'}" />
                            <script>
                                window.onload = function() {
                                    window.print();
                                    setTimeout(() => window.close(), 1000);
                                }
                            </script>
                        </body>
                    </html>
                `);
                printWindow.document.close();
            }
        }
    };

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 300));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 25));
    const handleZoomReset = () => {
        setZoom(100);
        setRotation(0);
    };
    const handleRotate = () => setRotation(prev => (prev + 90) % 360);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col bg-black dark:bg-gray-950">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between px-4 py-3 bg-black dark:bg-gray-900 border-b border-gray-800 dark:border-gray-800 text-white">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="text-gray-300 hover:text-white hover:bg-gray-900 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-900 p-2"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                    
                    <div className="flex-1 min-w-0">
                        <h2 className="text-sm font-semibold truncate text-white" title={form?.title || 'Document'}>
                            {form?.title || 'Document'}
                        </h2>
                        <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                            <span>{form?.file_type?.toUpperCase() || 'DOCUMENT'}</span>
                            <span>•</span>
                            <span>{formatFileSize(form?.file_size || 0)}</span>
                            <span>•</span>
                            <span>{isPdf ? 'PDF' : isImage ? 'Image' : 'Document'}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isImage && (
                        <div className="flex items-center gap-1 bg-gray-900 dark:bg-gray-900 rounded-lg px-2 py-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleZoomOut}
                                disabled={zoom <= 25}
                                className="h-7 w-7 p-0 text-gray-300 hover:text-white hover:bg-gray-900 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
                                title="Zoom Out (Ctrl -)"
                            >
                                <ZoomOut className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium px-1 min-w-[45px] text-center cursor-default text-white dark:text-gray-300" title="Zoom Level">
                                {zoom}%
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleZoomIn}
                                disabled={zoom >= 300}
                                className="h-7 w-7 p-0 text-gray-300 hover:text-white hover:bg-gray-900 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
                                title="Zoom In (Ctrl +)"
                            >
                                <ZoomIn className="h-3 w-3" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleRotate}
                                className="h-7 w-7 p-0 text-gray-300 hover:text-white hover:bg-gray-900 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
                                title="Rotate (Ctrl+R)"
                            >
                                <RotateCw className="h-3 w-3" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleZoomReset}
                                className="h-7 w-7 p-0 text-gray-300 hover:text-white hover:bg-gray-900 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
                                title="Reset View"
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                    )}

                    <Separator orientation="vertical" className="h-6 bg-gray-700 dark:bg-gray-700 mx-1" />
                    
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handlePrint}
                                    className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-900 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
                                    title="Print (Ctrl+P)"
                                >
                                    <Printer className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Print</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleDownload}
                                    className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-900 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
                                    title="Download"
                                >
                                    <Download className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Download</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>

            {/* Document Viewer */}
            <div className="flex-1 relative overflow-hidden bg-gray-900 dark:bg-gray-950">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 dark:bg-gray-950 z-10">
                        <div className="text-center space-y-3">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white dark:border-gray-300 mx-auto"></div>
                            <p className="text-white dark:text-gray-300 text-sm">Loading form preview...</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 dark:bg-gray-950 z-10">
                        <div className="text-center p-6 max-w-md space-y-4">
                            <AlertTriangle className="h-12 w-12 text-red-500 dark:text-red-400 mx-auto" />
                            <div>
                                <h3 className="text-lg font-medium text-white dark:text-gray-100 mb-2">Preview Unavailable</h3>
                                <p className="text-gray-300 dark:text-gray-400 text-sm">{error}</p>
                            </div>
                            <Button 
                                onClick={handleDownload}
                                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <Download className="h-4 w-4" />
                                Download Instead
                            </Button>
                        </div>
                    </div>
                )}

                {isPdf ? (
                    <iframe
                        ref={iframeRef}
                        src={`${previewUrl}#view=fit&toolbar=0&navpanes=0`}
                        title={`Fullscreen: ${form?.title || 'Document'}`}
                        className="w-full h-full border-0"
                        style={{
                            transform: `scale(${zoom / 100})`,
                            transformOrigin: '0 0',
                            width: `${10000 / zoom}%`,
                            height: `${10000 / zoom}%`,
                        }}
                        allow="fullscreen"
                        onLoad={handleIframeLoad}
                        onError={handleIframeError}
                    />
                ) : isImage ? (
                    <div className="w-full h-full flex items-center justify-center p-4">
                        <img
                            src={previewUrl}
                            alt={form?.title || 'Document'}
                            className="max-w-full max-h-full object-contain"
                            style={{
                                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                                transformOrigin: 'center center',
                                transition: 'transform 0.2s ease',
                            }}
                            onLoad={handleImageLoad}
                            onError={handleImageError}
                        />
                    </div>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 dark:bg-gray-950">
                        <div className="text-center p-8 max-w-md space-y-6">
                            <div className="inline-block p-6 rounded-full bg-gray-900 dark:bg-gray-900">
                                <FileText className="h-16 w-16 text-gray-400 dark:text-gray-500" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-semibold text-white dark:text-gray-100">{form?.title || 'Document'}</h3>
                                <div className="flex flex-col items-center gap-1 text-gray-300 dark:text-gray-400">
                                    {form?.file_type && (
                                        <span className="px-3 py-1 bg-gray-900 dark:bg-gray-700 rounded-full text-sm">
                                            {form.file_type.toUpperCase()}
                                        </span>
                                    )}
                                    <span className="text-sm">{formatFileSize(form?.file_size || 0)}</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Button 
                                    onClick={handleDownload}
                                    className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    <Download className="h-4 w-4" />
                                    Download Form
                                </Button>
                                <Button
                                    onClick={onClose}
                                    variant="outline"
                                    className="w-full gap-2 border-gray-700 text-gray-300 hover:bg-gray-900 hover:text-white dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to Form View
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Info Bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-900 dark:bg-gray-900 border-t border-gray-800 dark:border-gray-800 text-xs text-gray-400 dark:text-gray-500">
                <div className="flex items-center gap-4">
                    <span className="truncate max-w-[200px] text-gray-300 dark:text-gray-400" title={form?.title || 'Document'}>
                        {form?.title || 'Document'}
                    </span>
                    <Separator orientation="vertical" className="h-3 bg-gray-700 dark:bg-gray-700" />
                    <span>{form?.category || 'N/A'}</span>
                    <Separator orientation="vertical" className="h-3 bg-gray-700 dark:bg-gray-700" />
                    <span>{form?.issuing_agency || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-4">
                    <span>Press ESC to exit fullscreen</span>
                    <Separator orientation="vertical" className="h-3 bg-gray-700 dark:bg-gray-700" />
                    {isImage && <span>Ctrl + +/- to zoom • Ctrl+R to rotate</span>}
                    {isPdf && <span>Ctrl + +/- to zoom</span>}
                </div>
            </div>
        </div>
    );
};