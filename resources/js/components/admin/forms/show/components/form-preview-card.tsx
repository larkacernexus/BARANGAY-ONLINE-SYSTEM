// resources/js/Pages/Admin/Forms/components/form-preview-card.tsx
import React, { RefObject } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Eye,
    Maximize2,
    ExternalLink,
    Download,
    Printer,
    ZoomIn,
    ZoomOut,
    RotateCw,
    X,
    Loader2,
    AlertTriangle,
    FileText,
} from 'lucide-react';
import { Form } from '../types';

interface Props {
    form: Form;
    previewUrl: string;
    isPdf: boolean;
    isImage: boolean;
    isOfficeDoc: boolean;
    isLoadingPreview: boolean;
    previewError: string | null;
    zoomLevel: number;
    rotation: number;
    iframeRef: RefObject<HTMLIFrameElement>;
    previewContainerRef: RefObject<HTMLDivElement>;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onZoomReset: () => void;
    onRotate: () => void;
    onFullscreen: () => void;
    onDownload: () => void;
    onPrint: () => void;
    onIframeLoad: () => void;
    onIframeError: () => void;
    onImageLoad: () => void;
    onImageError: () => void;
    formatFileSize: (bytes: number) => string;
}

export const FormPreviewCard = ({
    form,
    previewUrl,
    isPdf,
    isImage,
    isOfficeDoc,
    isLoadingPreview,
    previewError,
    zoomLevel,
    rotation,
    iframeRef,
    previewContainerRef,
    onZoomIn,
    onZoomOut,
    onZoomReset,
    onRotate,
    onFullscreen,
    onDownload,
    onPrint,
    onIframeLoad,
    onIframeError,
    onImageLoad,
    onImageError,
    formatFileSize,
}: Props) => {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <Eye className="h-5 w-5" />
                            Form Preview
                        </CardTitle>
                        <CardDescription className="dark:text-gray-400">
                            {isPdf && 'PDF Document - Scroll to view pages'}
                            {isImage && 'Image - Use controls to zoom and rotate'}
                            {isOfficeDoc && 'Document - Viewing via Google Docs Viewer'}
                            {!isPdf && !isImage && !isOfficeDoc && 'File preview'}
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        {(isPdf || isImage) && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onFullscreen}
                                className="h-8 gap-1 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/50"
                            >
                                <Maximize2 className="h-3 w-3" />
                                Fullscreen
                                <kbd className="ml-1 text-xs bg-white border border-blue-300 rounded px-1 py-0.5 dark:bg-gray-900 dark:border-blue-700 dark:text-gray-300">
                                    F11
                                </kbd>
                            </Button>
                        )}
                        <a
                            href={previewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button variant="outline" size="sm" className="h-8 dark:border-gray-600 dark:text-gray-300">
                                <ExternalLink className="h-3 w-3" />
                            </Button>
                        </a>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div 
                    ref={previewContainerRef}
                    className="relative w-full h-[500px] overflow-hidden bg-gray-100 dark:bg-gray-900"
                >
                    {isLoadingPreview && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-20">
                            <div className="text-center space-y-3">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-500 dark:text-blue-400 mx-auto" />
                                <p className="text-gray-600 dark:text-gray-300 font-medium text-base">Loading form preview...</p>
                            </div>
                        </div>
                    )}
                    
                    {previewError ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-20">
                            <div className="text-center p-6 max-w-md space-y-4">
                                <AlertTriangle className="h-12 w-12 text-amber-500 dark:text-amber-400 mx-auto" />
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Preview Unavailable</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-base">{previewError}</p>
                                </div>
                                <Button variant="outline" onClick={onDownload} className="dark:border-gray-600 dark:text-gray-300">
                                    <Download className="h-4 w-4 mr-2" />
                                    Download Instead
                                </Button>
                            </div>
                        </div>
                    ) : isPdf ? (
                        <iframe
                            ref={iframeRef}
                            src={`${previewUrl}#view=fit&toolbar=0&navpanes=0`}
                            title={form.title}
                            className="w-full h-full border-0"
                            style={{
                                transform: `scale(${zoomLevel / 100})`,
                                transformOrigin: '0 0',
                                width: `${10000 / zoomLevel}%`,
                                height: `${10000 / zoomLevel}%`,
                            }}
                            onLoad={onIframeLoad}
                            onError={onIframeError}
                        />
                    ) : isImage ? (
                        <div className="w-full h-full flex items-center justify-center p-4 bg-gray-900 dark:bg-gray-950">
                            <img
                                src={previewUrl}
                                alt={form.title}
                                className="max-w-full max-h-full object-contain"
                                style={{
                                    transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                                    transformOrigin: 'center center',
                                    transition: 'transform 0.2s ease',
                                }}
                                onLoad={onImageLoad}
                                onError={onImageError}
                            />
                        </div>
                    ) : isOfficeDoc ? (
                        <div className="relative w-full h-full">
                            <iframe
                                ref={iframeRef}
                                src={`https://docs.google.com/viewer?url=${encodeURIComponent(window.location.origin + previewUrl)}&embedded=true`}
                                title={form.title}
                                className="w-full h-full border-0"
                                onLoad={onIframeLoad}
                                onError={onIframeError}
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                            <FileText className="h-16 w-16 text-gray-400 dark:text-gray-600 mb-4" />
                            <h3 className="text-lg font-semibold mb-2 dark:text-gray-100">Preview Not Available</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                This file type cannot be previewed directly in the browser.
                            </p>
                            <Button onClick={onDownload}>
                                <Download className="h-4 w-4 mr-2" />
                                Download to View
                            </Button>
                        </div>
                    )}

                    {/* Preview controls for images */}
                    {isImage && !isLoadingPreview && !previewError && (
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900/90 dark:bg-gray-900/90 text-white rounded-lg px-3 py-2 flex items-center gap-2 z-10">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onZoomOut}
                                className="h-8 w-8 p-0 text-white hover:bg-gray-700 dark:hover:bg-gray-700"
                            >
                                <ZoomOut className="h-4 w-4" />
                            </Button>
                            <span className="text-sm">{zoomLevel}%</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onZoomIn}
                                className="h-8 w-8 p-0 text-white hover:bg-gray-700 dark:hover:bg-gray-700"
                            >
                                <ZoomIn className="h-4 w-4" />
                            </Button>
                            <Separator orientation="vertical" className="h-4 bg-gray-600 dark:bg-gray-700" />
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onRotate}
                                className="h-8 w-8 p-0 text-white hover:bg-gray-700 dark:hover:bg-gray-700"
                            >
                                <RotateCw className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onZoomReset}
                                className="h-8 w-8 p-0 text-white hover:bg-gray-700 dark:hover:bg-gray-700"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>

                {/* Preview info and controls */}
                <div className="p-4 md:p-6 border-t dark:border-gray-700">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">File Type</p>
                            <p className="text-sm font-semibold dark:text-gray-300">
                                {isPdf && 'PDF'}
                                {isImage && 'Image'}
                                {isOfficeDoc && 'Office Document'}
                                {!isPdf && !isImage && !isOfficeDoc && 'File'}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">File Size</p>
                            <p className="text-sm dark:text-gray-300">{formatFileSize(form.file_size)}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">MIME Type</p>
                            <p className="text-sm font-mono text-xs dark:text-gray-300">{form.mime_type || form.file_type}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Pages</p>
                            <p className="text-sm dark:text-gray-300">{form.pages || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <Button
                            onClick={onDownload}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            size="sm"
                        >
                            <Download className="h-3 w-3 mr-2" />
                            Download Original
                        </Button>
                        {isPdf && (
                            <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                                    <ExternalLink className="h-3 w-3 mr-2" />
                                    Open in New Tab
                                </Button>
                            </a>
                        )}
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={onPrint}
                            className="dark:border-gray-600 dark:text-gray-300"
                        >
                            <Printer className="h-3 w-3 mr-2" />
                            Print
                        </Button>
                        {(isPdf || isImage) && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onFullscreen}
                                className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/50"
                            >
                                <Maximize2 className="h-3 w-3 mr-2" />
                                Fullscreen View
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};