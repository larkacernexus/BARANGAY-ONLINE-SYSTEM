// forms-show/components/FullscreenFormViewer.tsx
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { X, ZoomIn, ZoomOut, RotateCw, ExternalLink, Download, FileText, AlertCircle, Maximize2 } from 'lucide-react';
import { Form } from '@/types/portal/forms/form.types';
import { formatFileSize, getFileExtension } from '@/utils/portal/forms/form-utils';

interface FullscreenFormViewerProps {
    form: Form;
    previewUrl: string;
    isOpen: boolean;
    onClose: () => void;
}

export function FullscreenFormViewer({ form, previewUrl, isOpen, onClose }: FullscreenFormViewerProps) {
    const [zoom, setZoom] = useState(100);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const isPdf = form.file_type.includes('pdf') || form.mime_type.includes('pdf');
    const isImage = form.mime_type?.startsWith('image/') || 
                  ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(form.file_name.split('.').pop()?.toLowerCase() || '');

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

    const handleDownload = () => {
        window.open(`/forms/${form.slug}/download`, '_blank');
    };

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 300));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 25));
    const handleZoomReset = () => setZoom(100);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col bg-black">
            <div className="flex items-center justify-between px-4 py-3 bg-black/90 backdrop-blur-xl border-b border-white/10 text-white">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="text-white/70 hover:text-white hover:bg-white/10 rounded-full"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                    
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500">
                            <FileText className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-white line-clamp-1 max-w-[300px]">{form.title}</h2>
                            <div className="flex items-center gap-2 text-xs text-white/50">
                                <span>{getFileExtension(form.file_name)}</span>
                                <span>•</span>
                                <span>{formatFileSize(form.file_size)}</span>
                                <span>•</span>
                                <span>{isPdf ? 'PDF' : isImage ? 'Image' : 'Document'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleZoomOut}
                            disabled={zoom <= 25}
                            className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                        >
                            <ZoomOut className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium px-2 min-w-[45px] text-center">{zoom}%</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleZoomIn}
                            disabled={zoom >= 300}
                            className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                        >
                            <ZoomIn className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleZoomReset}
                            className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                        >
                            <RotateCw className="h-4 w-4" />
                        </Button>
                    </div>

                    <Separator orientation="vertical" className="h-6 bg-white/10 mx-1" />
                    
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(previewUrl, '_blank')}
                        className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                        title="Open in New Tab"
                    >
                        <ExternalLink className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDownload}
                        className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                        title="Download"
                    >
                        <Download className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-gray-950 to-gray-900">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-950/50 backdrop-blur-sm z-10">
                        <div className="text-center space-y-4">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <FileText className="h-6 w-6 text-white/50" />
                                </div>
                            </div>
                            <p className="text-white/70 text-sm">Loading form preview...</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center p-8 max-w-md">
                            <div className="w-20 h-20 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="h-10 w-10 text-rose-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">Preview Unavailable</h3>
                            <p className="text-white/50 text-sm mb-6">{error}</p>
                            <Button onClick={handleDownload} className="gap-2">
                                <Download className="h-4 w-4" />
                                Download Instead
                            </Button>
                        </div>
                    </div>
                )}

                {isPdf ? (
                    <iframe
                        ref={iframeRef}
                        src={previewUrl}
                        title={`Fullscreen: ${form.title}`}
                        className="w-full h-full border-0"
                        allow="fullscreen"
                        onLoad={handleIframeLoad}
                        onError={handleIframeError}
                    />
                ) : isImage ? (
                    <div className="w-full h-full flex items-center justify-center p-8">
                        <img
                            src={previewUrl}
                            alt={form.title}
                            className="max-w-full max-h-full object-contain"
                            onLoad={() => {
                                setIsLoading(false);
                                setError(null);
                            }}
                            onError={() => {
                                setIsLoading(false);
                                setError('Failed to load image');
                            }}
                        />
                    </div>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center p-8 max-w-md">
                            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center mx-auto mb-6">
                                <FileText className="h-12 w-12 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">{form.title}</h3>
                            <p className="text-white/50 text-sm mb-6">This file type cannot be previewed directly.</p>
                            <Button onClick={handleDownload} size="lg" className="gap-2">
                                <Download className="h-5 w-5" />
                                Download Form
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between px-4 py-2 bg-black/50 backdrop-blur-sm border-t border-white/5 text-xs text-white/40">
                <div className="flex items-center gap-4">
                    <span className="truncate max-w-[300px]">{form.title}</span>
                    <Separator orientation="vertical" className="h-3 bg-white/10" />
                    <span>Form ID: {form.id}</span>
                </div>
                <div className="flex items-center gap-4">
                    <span>ESC to exit</span>
                    <Separator orientation="vertical" className="h-3 bg-white/10" />
                    <span>Ctrl +/- zoom</span>
                </div>
            </div>
        </div>
    );
}