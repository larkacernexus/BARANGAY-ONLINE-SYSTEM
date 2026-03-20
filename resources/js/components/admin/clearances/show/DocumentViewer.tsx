import { useState, useEffect, JSX } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    ZoomIn,
    ZoomOut,
    RotateCw,
    ChevronLeft,
    ChevronRight,
    Maximize2,
    Download as DownloadIcon,
    X,
    Check,
    XCircle,
    Image as ImageIcon,
    FileText,
    File,
    AlertCircle
} from 'lucide-react';
import { Document } from '@/types/clearance';

interface DocumentViewerProps {
    document: Document | null;
    isOpen: boolean;
    onClose: () => void;
    onNext?: () => void;
    onPrev?: () => void;
    hasNext?: boolean;
    hasPrev?: boolean;
    onVerify?: (documentId: number) => void;
    onReject?: (documentId: number, notes: string) => void;
    canVerify?: boolean;
}

export function DocumentViewer({ 
    document: doc,
    isOpen, 
    onClose, 
    onNext, 
    onPrev, 
    hasNext = false, 
    hasPrev = false,
    onVerify,
    onReject,
    canVerify = false
}: DocumentViewerProps) {
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showNotesInput, setShowNotesInput] = useState(false);
    const [rejectionNotes, setRejectionNotes] = useState('');

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            
            switch (e.key) {
                case 'Escape':
                    onClose();
                    break;
                case 'ArrowLeft':
                    if (hasPrev && onPrev) onPrev();
                    break;
                case 'ArrowRight':
                    if (hasNext && onNext) onNext();
                    break;
                case '+':
                case '=':
                    if (e.ctrlKey) handleZoomIn();
                    break;
                case '-':
                    if (e.ctrlKey) handleZoomOut();
                    break;
                case 'r':
                case 'R':
                    if (e.ctrlKey) handleRotate();
                    break;
                case 'f':
                case 'F':
                    if (e.ctrlKey) handleFullscreen();
                    break;
            }
        };

        window.document.addEventListener('keydown', handleKeyDown);
        return () => window.document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, hasPrev, hasNext, onClose, onPrev, onNext]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!window.document.fullscreenElement);
        };

        window.document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => window.document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    if (!isOpen || !doc) return null;

    const isImage = doc.mime_type?.startsWith('image/') || 
                   doc.file_name?.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i);
    const isPDF = doc.mime_type === 'application/pdf' || 
                  doc.file_name?.match(/\.pdf$/i);
    const isWord = doc.mime_type?.includes('word') || 
                   doc.mime_type?.includes('document') ||
                   doc.file_name?.match(/\.(doc|docx)$/i);
    const isExcel = doc.mime_type?.includes('excel') || 
                    doc.mime_type?.includes('spreadsheet') ||
                    doc.file_name?.match(/\.(xls|xlsx|csv)$/i);
    const isText = doc.mime_type?.startsWith('text/') || 
                   doc.file_name?.match(/\.(txt|md|rtf)$/i);

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
    const handleRotate = () => setRotation(prev => (prev + 90) % 360);
    const handleReset = () => {
        setZoom(1);
        setRotation(0);
    };

    const handleDownload = () => {
        const link = window.document.createElement('a');
        link.href = doc.url || '#';
        link.download = doc.file_name || 'document';
        link.target = '_blank';
        link.click();
    };

    const handleFullscreen = () => {
        const viewerElement = window.document.querySelector('.document-viewer-container');
        if (!window.document.fullscreenElement && viewerElement) {
            viewerElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            window.document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const handleVerify = () => {
        if (onVerify && doc.id) {
            onVerify(doc.id);
        }
    };

    const handleReject = () => {
        if (rejectionNotes.trim() && onReject && doc.id) {
            onReject(doc.id, rejectionNotes);
            setRejectionNotes('');
            setShowNotesInput(false);
        }
    };

    const getFileIcon = () => {
        if (isImage) return <ImageIcon className="h-6 w-6 text-blue-500" />;
        if (isPDF) return <FileText className="h-6 w-6 text-red-500" />;
        if (isWord) return <File className="h-6 w-6 text-blue-600" />;
        if (isExcel) return <File className="h-6 w-6 text-green-600" />;
        if (isText) return <File className="h-6 w-6 text-gray-600" />;
        return <File className="h-6 w-6 text-gray-500" />;
    };

    const formatFileSize = (bytes?: number): string => {
        if (!bytes) return 'Unknown size';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    };

    const getDocumentStatus = () => {
        if (doc.is_verified) return 'verified';
        return doc.status || 'pending';
    };

    const documentStatus = getDocumentStatus();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm document-viewer-container">
            <div className="relative w-full h-full flex flex-col">
                {/* Viewer header */}
                <div className="flex items-center justify-between p-4 bg-gray-900 text-white border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        {getFileIcon()}
                        <div className="truncate max-w-xl">
                            <h3 className="font-medium">{doc.name || doc.original_name || doc.file_name}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <span>{doc.description || 'Document'}</span>
                                {doc.file_size && (
                                    <>
                                        <span>•</span>
                                        <span>{formatFileSize(doc.file_size)}</span>
                                    </>
                                )}
                                {doc.uploaded_at && (
                                    <>
                                        <span>•</span>
                                        <span>Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDownload}
                            className="text-white hover:bg-gray-900"
                        >
                            <DownloadIcon className="h-4 w-4 mr-2" />
                            Download
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="text-white hover:bg-gray-900"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Viewer controls */}
                <div className="flex items-center justify-between p-3 bg-gray-900 border-b border-gray-800">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleZoomOut}
                            disabled={zoom <= 0.5}
                            className="bg-gray-900 border-gray-700 text-white hover:bg-gray-700"
                        >
                            <ZoomOut className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-white px-2 min-w-[60px] text-center">
                            {Math.round(zoom * 100)}%
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleZoomIn}
                            disabled={zoom >= 3}
                            className="bg-gray-900 border-gray-700 text-white hover:bg-gray-700"
                        >
                            <ZoomIn className="h-4 w-4" />
                        </Button>
                        <Separator orientation="vertical" className="h-6 bg-gray-700 mx-2" />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRotate}
                            className="bg-gray-900 border-gray-700 text-white hover:bg-gray-700"
                        >
                            <RotateCw className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleReset}
                            className="bg-gray-900 border-gray-700 text-white hover:bg-gray-700"
                        >
                            Reset
                        </Button>
                        <Separator orientation="vertical" className="h-6 bg-gray-700 mx-2" />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleFullscreen}
                            className="bg-gray-900 border-gray-700 text-white hover:bg-gray-700"
                        >
                            <Maximize2 className="h-4 w-4" />
                            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                        </Button>
                    </div>

                    {canVerify && documentStatus !== 'verified' && (
                        <div className="flex items-center gap-2">
                            {documentStatus === 'rejected' ? (
                                <Badge variant="destructive" className="flex items-center gap-1">
                                    <XCircle className="h-3 w-3" />
                                    Rejected
                                </Badge>
                            ) : showNotesInput ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={rejectionNotes}
                                        onChange={(e) => setRejectionNotes(e.target.value)}
                                        placeholder="Enter rejection reason..."
                                        className="px-3 py-1 text-sm bg-gray-900 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleReject();
                                            if (e.key === 'Escape') {
                                                setShowNotesInput(false);
                                                setRejectionNotes('');
                                            }
                                        }}
                                        autoFocus
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleReject}
                                        disabled={!rejectionNotes.trim()}
                                        className="bg-red-900 border-red-700 text-white hover:bg-red-800"
                                    >
                                        Submit
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setShowNotesInput(false);
                                            setRejectionNotes('');
                                        }}
                                        className="text-gray-400 hover:text-white"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleVerify}
                                        className="bg-green-900 border-green-700 text-white hover:bg-green-800"
                                    >
                                        <Check className="h-4 w-4 mr-2" />
                                        Verify Document
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowNotesInput(true)}
                                        className="bg-red-900 border-red-700 text-white hover:bg-red-800"
                                    >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Reject
                                    </Button>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Navigation buttons */}
                {(hasPrev || hasNext) && (
                    <>
                        {hasPrev && (
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={onPrev}
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-900/80 backdrop-blur-sm border-gray-700 text-white hover:bg-gray-700/90 z-10 h-12 w-12 rounded-full"
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </Button>
                        )}
                        {hasNext && (
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={onNext}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-900/80 backdrop-blur-sm border-gray-700 text-white hover:bg-gray-700/90 z-10 h-12 w-12 rounded-full"
                            >
                                <ChevronRight className="h-6 w-6" />
                            </Button>
                        )}
                    </>
                )}

                {/* Document content */}
                <div className="flex-1 overflow-auto p-4">
                    <div className="flex items-center justify-center h-full">
                        {isImage ? (
                            <img
                                src={doc.url}
                                alt={doc.name || 'Document image'}
                                className="max-w-full max-h-full object-contain transition-all duration-200 select-none"
                                style={{
                                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                                }}
                                loading="lazy"
                                draggable={false}
                            />
                        ) : isPDF ? (
                            <div className="w-full h-full bg-white rounded-lg overflow-hidden">
                                <iframe
                                    src={doc.url}
                                    className="w-full h-full border-0"
                                    title={doc.name || 'PDF Document'}
                                    loading="lazy"
                                />
                            </div>
                        ) : isWord || isExcel || isText ? (
                            <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-8">
                                <div className="text-center">
                                    {getFileIcon()}
                                    <h4 className="text-xl font-semibold mt-4 mb-2">
                                        {doc.name || doc.file_name}
                                    </h4>
                                    <p className="text-gray-600 mb-4">
                                        This document type cannot be previewed directly. Please download to view.
                                    </p>
                                    <div className="grid grid-cols-2 gap-4 text-sm text-left max-w-md mx-auto">
                                        <div className="space-y-1">
                                            <p className="font-medium">Document Type:</p>
                                            <p className="text-gray-600">{doc.description || 'Document'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-medium">File Size:</p>
                                            <p className="text-gray-600">{formatFileSize(doc.file_size)}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-medium">Status:</p>
                                            <Badge variant={
                                                documentStatus === 'verified' ? 'default' :
                                                documentStatus === 'rejected' ? 'destructive' : 'outline'
                                            }>
                                                {documentStatus}
                                            </Badge>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-medium">Uploaded:</p>
                                            <p className="text-gray-600">
                                                {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : 'Unknown'}
                                            </p>
                                        </div>
                                    </div>
                                    <Button onClick={handleDownload} className="mt-6">
                                        <DownloadIcon className="h-4 w-4 mr-2" />
                                        Download Document
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center p-8 bg-gray-900 rounded-lg max-w-md mx-auto">
                                <File className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                                <h4 className="text-lg font-semibold text-white mb-2">Unsupported File Type</h4>
                                <p className="text-gray-300 mb-6">
                                    This file type cannot be previewed. Please download the file to view its contents.
                                </p>
                                <Button
                                    onClick={handleDownload}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    <DownloadIcon className="h-4 w-4 mr-2" />
                                    Download File ({formatFileSize(doc.file_size)})
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Document status footer */}
                <div className="p-3 bg-gray-900 border-t border-gray-800">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4 text-gray-300">
                            <span>Status: 
                                <Badge variant={
                                    documentStatus === 'verified' ? 'default' :
                                    documentStatus === 'rejected' ? 'destructive' : 'outline'
                                } className="ml-2">
                                    {documentStatus}
                                </Badge>
                            </span>
                            {doc.verified_at && (
                                <span>Verified: {new Date(doc.verified_at).toLocaleDateString()}</span>
                            )}
                            {doc.verified_by && (
                                <span>By: {doc.verified_by}</span>
                            )}
                        </div>
                        <div className="text-gray-400">
                            Use arrow keys to navigate • Ctrl+ for zoom • Ctrl+R to rotate • Ctrl+F for fullscreen
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}