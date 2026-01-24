// resources/js/Pages/Clearances/Show.tsx
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/layouts/admin-app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    ArrowLeft,
    Download,
    Printer,
    FileText,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle,
    DollarSign,
    Calendar,
    User,
    FileCheck,
    MessageSquare,
    History,
    Edit,
    Trash2,
    Copy,
    Mail,
    Phone,
    MapPin,
    CalendarDays,
    Shield,
    TrendingUp,
    FileSignature,
    Eye,
    FileCode,
    Tag,
    ExternalLink,
    Image as ImageIcon,
    File,
    X,
    ZoomIn,
    ZoomOut,
    RotateCw,
    ChevronLeft,
    ChevronRight,
    Maximize2,
    Download as DownloadIcon,
    Upload,
    Check,
    AlertTriangle
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { 
    ClearanceRequest, 
    ActivityLog, 
    Document, 
    StatusVariant, 
    UrgencyVariant,
    ClearanceType as ClearanceTypeInterface,
    Resident as ResidentInterface,
    Payment as PaymentInterface,
    DocumentStats
} from '@/types/clearance';

// Document viewer component - updated with proper Document type
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

const DocumentViewer = ({ 
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
}: DocumentViewerProps) => {
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

    // Get document status - handle both is_verified and status fields
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
                            className="text-white hover:bg-gray-800"
                        >
                            <DownloadIcon className="h-4 w-4 mr-2" />
                            Download
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="text-white hover:bg-gray-800"
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
                            className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
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
                            className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                        >
                            <ZoomIn className="h-4 w-4" />
                        </Button>
                        <Separator orientation="vertical" className="h-6 bg-gray-700 mx-2" />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRotate}
                            className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                        >
                            <RotateCw className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleReset}
                            className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                        >
                            Reset
                        </Button>
                        <Separator orientation="vertical" className="h-6 bg-gray-700 mx-2" />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleFullscreen}
                            className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                        >
                            <Maximize2 className="h-4 w-4" />
                            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                        </Button>
                    </div>

                    {/* Document verification actions */}
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
                                        className="px-3 py-1 text-sm bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-800/80 backdrop-blur-sm border-gray-700 text-white hover:bg-gray-700/90 z-10 h-12 w-12 rounded-full"
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </Button>
                        )}
                        {hasNext && (
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={onNext}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-800/80 backdrop-blur-sm border-gray-700 text-white hover:bg-gray-700/90 z-10 h-12 w-12 rounded-full"
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
                            <div className="text-center p-8 bg-gray-800 rounded-lg max-w-md mx-auto">
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
};

interface ShowClearanceProps {
    clearance: ClearanceRequest;
    activityLogs?: ActivityLog[];
    canEdit: boolean;
    canDelete: boolean;
    canProcess: boolean;
    canIssue: boolean;
    canApprove: boolean;
    canPrint: boolean;
}

export default function ShowClearance({
    clearance,
    activityLogs = [],
    canEdit = false,
    canDelete = false,
    canProcess = false,
    canIssue = false,
    canApprove = false,
    canPrint = false
}: ShowClearanceProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    const [activeTab, setActiveTab] = useState<'details' | 'documents' | 'payment' | 'history'>('details');
    
    // Document viewer state
    const [viewedDocument, setViewedDocument] = useState<Document | null>(null);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [currentDocumentIndex, setCurrentDocumentIndex] = useState<number>(-1);

    // Format date
    const formatDate = (dateString?: string): string => {
        if (!dateString) return 'Not set';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Invalid date';
            return date.toLocaleDateString('en-PH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
            });
        } catch (error) {
            return 'Invalid date';
        }
    };

    const formatDateTime = (dateString?: string): string => {
        if (!dateString) return 'Not set';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Invalid date';
            return date.toLocaleDateString('en-PH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Invalid date';
        }
    };

    // Format file size
    const formatFileSize = (bytes?: number): string => {
        if (!bytes) return 'Unknown size';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    };

    // Format currency
    const formatCurrency = (amount?: number): string => {
        if (amount === undefined || amount === null) return '₱0.00';
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    // Get file icon for list view
    const getFileIcon = (document: Document) => {
        const isImage = document.mime_type?.startsWith('image/') || 
                       document.file_name?.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i);
        const isPDF = document.mime_type === 'application/pdf' || 
                      document.file_name?.match(/\.pdf$/i);
        const isWord = document.mime_type?.includes('word') || 
                       document.mime_type?.includes('document') ||
                       document.file_name?.match(/\.(doc|docx)$/i);
        const isExcel = document.mime_type?.includes('excel') || 
                        document.mime_type?.includes('spreadsheet') ||
                        document.file_name?.match(/\.(xls|xlsx|csv)$/i);

        if (isImage) return <ImageIcon className="h-5 w-5 text-blue-500" />;
        if (isPDF) return <FileText className="h-5 w-5 text-red-500" />;
        if (isWord) return <File className="h-5 w-5 text-blue-600" />;
        if (isExcel) return <File className="h-5 w-5 text-green-600" />;
        return <File className="h-5 w-5 text-gray-500" />;
    };

    // Get status badge variant
    const getStatusVariant = (status: string): StatusVariant => {
        const variants: Record<string, StatusVariant> = {
            'pending': 'secondary',
            'pending_payment': 'outline',
            'processing': 'outline',
            'approved': 'success',
            'issued': 'default',
            'rejected': 'destructive',
            'cancelled': 'destructive',
            'expired': 'outline'
        };
        return variants[status] || 'outline';
    };

    // Get status icon
    const getStatusIcon = (status: string) => {
        const icons: Record<string, JSX.Element> = {
            'pending': <Clock className="h-4 w-4 text-amber-500" />,
            'pending_payment': <DollarSign className="h-4 w-4 text-amber-500" />,
            'processing': <FileCode className="h-4 w-4 text-blue-500" />,
            'approved': <CheckCircle className="h-4 w-4 text-green-500" />,
            'issued': <Shield className="h-4 w-4 text-green-500" />,
            'rejected': <XCircle className="h-4 w-4 text-red-500" />,
            'cancelled': <XCircle className="h-4 w-4 text-gray-500" />,
            'expired': <AlertCircle className="h-4 w-4 text-gray-500" />
        };
        return icons[status] || null;
    };

    // Get urgency badge variant
    const getUrgencyVariant = (urgency: string): UrgencyVariant => {
        const variants: Record<string, UrgencyVariant> = {
            'normal': 'default',
            'rush': 'secondary',
            'express': 'destructive'
        };
        return variants[urgency] || 'outline';
    };

    // Get document status color
    const getDocumentStatusColor = (document: Document): string => {
        const status = document.is_verified ? 'verified' : (document.status || 'pending');
        switch (status) {
            case 'verified': return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
            case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    // Get document status text
    const getDocumentStatusText = (document: Document): string => {
        if (document.is_verified) return 'Verified';
        return document.status ? document.status.charAt(0).toUpperCase() + document.status.slice(1) : 'Pending';
    };

    // Handle document viewing
    const openDocument = (document: Document, index: number) => {
        setViewedDocument(document);
        setCurrentDocumentIndex(index);
        setIsViewerOpen(true);
    };

    const closeDocumentViewer = () => {
        setIsViewerOpen(false);
        setViewedDocument(null);
        setCurrentDocumentIndex(-1);
    };

    const navigateDocument = (direction: 'next' | 'prev') => {
        const documents = clearance.documents || [];
        let newIndex = currentDocumentIndex;
        
        if (direction === 'next' && currentDocumentIndex < documents.length - 1) {
            newIndex = currentDocumentIndex + 1;
        } else if (direction === 'prev' && currentDocumentIndex > 0) {
            newIndex = currentDocumentIndex - 1;
        }
        
        if (newIndex !== currentDocumentIndex) {
            setViewedDocument(documents[newIndex]);
            setCurrentDocumentIndex(newIndex);
        }
    };

    // Handle document verification
    const handleVerifyDocument = (documentId: number) => {
        if (confirm('Verify this document?')) {
            router.post(`/documents/${documentId}/verify`, {}, {
                onSuccess: () => {
                    if (viewedDocument) {
                        setViewedDocument({ 
                            ...viewedDocument, 
                            is_verified: true,
                            status: 'verified',
                            verified_at: new Date().toISOString() 
                        });
                    }
                }
            });
        }
    };

    const handleRejectDocument = (documentId: number, notes: string) => {
        router.post(`/documents/${documentId}/reject`, { notes }, {
            onSuccess: () => {
                if (viewedDocument) {
                    setViewedDocument({ 
                        ...viewedDocument, 
                        is_verified: false,
                        status: 'rejected' 
                    });
                }
            }
        });
    };

    // Handle actions
    const handlePrint = () => {
        setIsPrinting(true);
        router.get(`/clearances/${clearance.id}/print`, {}, {
            onFinish: () => setIsPrinting(false)
        });
    };

    const handleDownload = () => {
        router.get(`/clearances/${clearance.id}/download`);
    };

    const handleMarkAsProcessing = () => {
        if (confirm('Mark this request as "Under Processing"?')) {
            setIsProcessing(true);
            router.post(`/clearances/${clearance.id}/process`, {}, {
                onSuccess: () => setIsProcessing(false),
                onError: () => setIsProcessing(false)
            });
        }
    };

    const handleApprove = () => {
        if (confirm('Approve this clearance request?')) {
            setIsProcessing(true);
            router.post(`/clearances/${clearance.id}/approve`, {}, {
                onSuccess: () => setIsProcessing(false),
                onError: () => setIsProcessing(false)
            });
        }
    };

    const handleIssue = () => {
        if (confirm('Issue this clearance certificate?')) {
            setIsProcessing(true);
            router.post(`/clearances/${clearance.id}/issue`, {}, {
                onSuccess: () => setIsProcessing(false),
                onError: () => setIsProcessing(false)
            });
        }
    };

    const handleReject = () => {
        const reason = prompt('Please enter the reason for rejection:');
        if (reason) {
            setIsProcessing(true);
            router.post(`/clearances/${clearance.id}/reject`, { reason }, {
                onSuccess: () => setIsProcessing(false),
                onError: () => setIsProcessing(false)
            });
        }
    };

    const handleCancel = () => {
        const reason = prompt('Please enter the reason for cancellation:');
        if (reason !== null) {
            setIsProcessing(true);
            router.post(`/clearances/${clearance.id}/cancel`, { reason }, {
                onSuccess: () => setIsProcessing(false),
                onError: () => setIsProcessing(false)
            });
        }
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this clearance request? This action cannot be undone.')) {
            router.delete(`/clearances/${clearance.id}`);
        }
    };

    const handleEdit = () => {
        router.visit(`/clearances/${clearance.id}/edit`);
    };

    // Copy reference number to clipboard
    const copyReferenceNumber = () => {
        navigator.clipboard.writeText(clearance.reference_number);
        alert('Reference number copied to clipboard!');
    };

    // Calculate remaining validity
    const getValidityStatus = () => {
        if (clearance.status !== 'issued' || !clearance.valid_until) {
            return null;
        }

        const today = new Date();
        const validUntil = new Date(clearance.valid_until);
        const diffTime = validUntil.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 0) {
            return { text: `Valid for ${diffDays} day${diffDays !== 1 ? 's' : ''}`, color: 'text-green-600' };
        } else if (diffDays === 0) {
            return { text: 'Expires today', color: 'text-amber-600' };
        } else {
            return { text: `Expired ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} ago`, color: 'text-red-600' };
        }
    };

    const validityStatus = getValidityStatus();

    // Calculate document statistics
    const documentStats: DocumentStats = clearance.documents ? {
        total: clearance.documents.length,
        verified: clearance.documents.filter(d => d.is_verified).length,
        pending: clearance.documents.filter(d => !d.is_verified && (!d.status || d.status === 'pending')).length,
        rejected: clearance.documents.filter(d => d.status === 'rejected').length
    } : { total: 0, verified: 0, pending: 0, rejected: 0 };

    // Get clearance type
    const clearanceType = clearance.clearance_type as ClearanceTypeInterface | undefined;
    const resident = clearance.resident as ResidentInterface | undefined;
    const payment = clearance.payment as PaymentInterface | undefined;

    return (
        <AppLayout
            title={`Clearance Request: ${clearance.reference_number}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Clearances', href: '/clearances' },
                { title: clearance.reference_number, href: `/clearances/${clearance.id}` }
            ]}
        >
            <div className="space-y-6">
                {/* Header with Actions */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/clearances">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to List
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Clearance Request</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant={getStatusVariant(clearance.status)} className="flex items-center gap-1">
                                    {getStatusIcon(clearance.status)}
                                    {clearance.status_display || clearance.status}
                                </Badge>
                                <div className="flex items-center gap-2">
                                    <Tag className="h-3 w-3 text-gray-500" />
                                    <span className="text-sm text-gray-600 font-mono cursor-pointer hover:underline" 
                                          onClick={copyReferenceNumber} 
                                          title="Click to copy">
                                        {clearance.reference_number}
                                    </span>
                                </div>
                                {clearance.clearance_number && (
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-3 w-3 text-gray-500" />
                                        <span className="text-sm text-gray-600 font-mono">
                                            {clearance.clearance_number}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline"
                            onClick={handleEdit}
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Button>

                        {canPrint && clearance.status === 'issued' && (
                            <Button onClick={handlePrint} disabled={isPrinting}>
                                <Printer className="h-4 w-4 mr-2" />
                                {isPrinting ? 'Printing...' : 'Print Certificate'}
                            </Button>
                        )}
                        
                        {canDelete && ['pending', 'pending_payment', 'processing'].includes(clearance.status) && (
                            <Button variant="outline" onClick={handleDelete} className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </Button>
                        )}
                    </div>
                </div>

                {/* Status Banner */}
                {clearance.status === 'issued' && validityStatus && (
                    <Card className={`border-l-4 ${validityStatus.color.includes('green') ? 'border-l-green-500' : validityStatus.color.includes('amber') ? 'border-l-amber-500' : 'border-l-red-500'}`}>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Shield className={`h-5 w-5 ${validityStatus.color}`} />
                                    <div>
                                        <p className="font-medium">Clearance Status</p>
                                        <p className={`text-sm ${validityStatus.color}`}>
                                            {validityStatus.text} • Issued on {formatDate(clearance.issue_date)} • Valid until {formatDate(clearance.valid_until)}
                                        </p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={handleDownload}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Download Certificate
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Main Content */}
                <div className="grid gap-6 md:grid-cols-3">
                    {/* Left Column - Request Details with Tabs */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Tab Navigation */}
                        <div className="border-b border-gray-200">
                            <nav className="flex space-x-8">
                                <button
                                    onClick={() => setActiveTab('details')}
                                    className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'details' 
                                        ? 'border-blue-500 text-blue-600' 
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    Details
                                </button>
                                <button
                                    onClick={() => setActiveTab('documents')}
                                    className={`py-3 px-1 border-b-2 font-medium text-sm relative ${activeTab === 'documents' 
                                        ? 'border-blue-500 text-blue-600' 
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    Documents
                                    {clearance.documents && clearance.documents.length > 0 && (
                                        <span className="ml-2 inline-flex items-center justify-center h-5 w-5 text-xs font-semibold bg-blue-100 text-blue-600 rounded-full">
                                            {clearance.documents.length}
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('payment')}
                                    className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'payment' 
                                        ? 'border-blue-500 text-blue-600' 
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    Payment
                                </button>
                                <button
                                    onClick={() => setActiveTab('history')}
                                    className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'history' 
                                        ? 'border-blue-500 text-blue-600' 
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    History
                                </button>
                            </nav>
                        </div>

                        {/* Tab Content */}
                        <div className="pt-2">
                            {/* Details Tab */}
                            {activeTab === 'details' && (
                                <div className="space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <FileText className="h-5 w-5" />
                                                Request Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <p className="text-sm font-medium text-gray-500">Clearance Type</p>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="text-sm">
                                                            {clearanceType?.name || 'N/A'}
                                                        </Badge>
                                                        <span className="text-xs text-gray-500">({clearanceType?.code})</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-sm font-medium text-gray-500">Purpose</p>
                                                    <p className="text-sm">{clearance.purpose}</p>
                                                    {clearance.specific_purpose && (
                                                        <p className="text-sm text-gray-500">{clearance.specific_purpose}</p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-sm font-medium text-gray-500">Urgency</p>
                                                    <Badge variant={getUrgencyVariant(clearance.urgency)}>
                                                        {clearance.urgency_display || clearance.urgency}
                                                    </Badge>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-sm font-medium text-gray-500">Fee Amount</p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-lg font-semibold">
                                                            {formatCurrency(clearance.fee_amount)}
                                                        </p>
                                                        {clearanceType?.requires_payment === false && (
                                                            <Badge variant="outline" className="text-xs text-green-600">
                                                                Free
                                                            </Badge>
                                                        )}
                                                        {clearanceType?.requires_payment === true && clearance.status !== 'pending_payment' && payment?.status === 'completed' && (
                                                            <Badge variant="outline" className="text-xs text-green-600">
                                                                Paid
                                                            </Badge>
                                                        )}
                                                        {clearanceType?.requires_payment === true && clearance.status === 'pending_payment' && (
                                                            <Badge variant="outline" className="text-xs text-amber-600">
                                                                Payment Pending
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-sm font-medium text-gray-500">Requested Date</p>
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <Calendar className="h-3 w-3" />
                                                        {formatDate(clearance.created_at)}
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-sm font-medium text-gray-500">Needed By</p>
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <CalendarDays className="h-3 w-3" />
                                                        {clearance.needed_date ? formatDate(clearance.needed_date) : 'Not specified'}
                                                    </div>
                                                </div>
                                            </div>

                                            {clearance.additional_requirements && (
                                                <div className="space-y-2">
                                                    <p className="text-sm font-medium text-gray-500">Additional Requirements</p>
                                                    <p className="text-sm text-gray-600">{clearance.additional_requirements}</p>
                                                </div>
                                            )}

                                            {clearance.requirements_met && clearance.requirements_met.length > 0 && (
                                                <div className="space-y-2">
                                                    <p className="text-sm font-medium text-gray-500">Requirements Met</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {clearance.requirements_met.map((req: string, index: number) => (
                                                            <Badge key={index} variant="outline" className="flex items-center gap-1">
                                                                <FileCheck className="h-3 w-3" />
                                                                {req}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <User className="h-5 w-5" />
                                                Resident Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {resident ? (
                                                <div className="space-y-4">
                                                    <div className="flex items-start gap-4">
                                                        {resident.photo_path ? (
                                                            <img
                                                                src={resident.photo_path}
                                                                alt={resident.full_name}
                                                                className="h-16 w-16 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                                                                <User className="h-8 w-8 text-gray-400" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <h3 className="font-semibold text-lg">{resident.full_name}</h3>
                                                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                                                {resident.contact_number && (
                                                                    <span className="flex items-center gap-1">
                                                                        <Phone className="h-3 w-3" />
                                                                        {resident.contact_number}
                                                                    </span>
                                                                )}
                                                                {resident.email && (
                                                                    <span className="flex items-center gap-1">
                                                                        <Mail className="h-3 w-3" />
                                                                        {resident.email}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <Separator />

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <p className="text-sm font-medium text-gray-500">Address</p>
                                                            <p className="text-sm flex items-start gap-1">
                                                                <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                                                {resident.address || 'No address provided'}
                                                            </p>
                                                        </div>
                                                        {resident.birth_date && (
                                                            <div className="space-y-2">
                                                                <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                                                                <p className="text-sm">{formatDate(resident.birth_date)}</p>
                                                            </div>
                                                        )}
                                                        {resident.gender && (
                                                            <div className="space-y-2">
                                                                <p className="text-sm font-medium text-gray-500">Gender</p>
                                                                <p className="text-sm capitalize">{resident.gender}</p>
                                                            </div>
                                                        )}
                                                        {resident.civil_status && (
                                                            <div className="space-y-2">
                                                                <p className="text-sm font-medium text-gray-500">Civil Status</p>
                                                                <p className="text-sm capitalize">{resident.civil_status}</p>
                                                            </div>
                                                        )}
                                                        {resident.occupation && (
                                                            <div className="space-y-2">
                                                                <p className="text-sm font-medium text-gray-500">Occupation</p>
                                                                <p className="text-sm">{resident.occupation}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-gray-500">Resident information not available</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* Documents Tab */}
                            {activeTab === 'documents' && (
                                <div>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <FileCheck className="h-5 w-5" />
                                                Submitted Documents
                                            </CardTitle>
                                            <CardDescription>
                                                Documents submitted by the resident for this clearance request
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {clearance.documents && clearance.documents.length > 0 ? (
                                                <div className="space-y-6">
                                                    {/* Document statistics */}
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                                            <p className="text-sm font-medium text-blue-600">Total Documents</p>
                                                            <p className="text-2xl font-bold text-blue-700">{documentStats.total}</p>
                                                        </div>
                                                        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                                            <p className="text-sm font-medium text-green-600">Verified</p>
                                                            <p className="text-2xl font-bold text-green-700">{documentStats.verified}</p>
                                                        </div>
                                                        <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                                                            <p className="text-sm font-medium text-amber-600">Pending</p>
                                                            <p className="text-2xl font-bold text-amber-700">{documentStats.pending}</p>
                                                        </div>
                                                        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                                                            <p className="text-sm font-medium text-red-600">Rejected</p>
                                                            <p className="text-2xl font-bold text-red-700">{documentStats.rejected}</p>
                                                        </div>
                                                    </div>

                                                    {/* Documents list */}
                                                    <div className="space-y-3">
                                                        {clearance.documents.map((doc: Document, index: number) => {
                                                            const isImage = doc.mime_type?.startsWith('image/') || 
                                                                           doc.file_name?.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i);
                                                            const isPDF = doc.mime_type === 'application/pdf' || 
                                                                          doc.file_name?.match(/\.pdf$/i);
                                                            
                                                            return (
                                                                <div key={doc.id} className="border rounded-lg hover:border-gray-300 hover:shadow-sm transition-all duration-200">
                                                                    <div className="flex items-start justify-between p-4">
                                                                        <div className="flex items-start gap-4 flex-1 min-w-0">
                                                                            <div className="flex-shrink-0">
                                                                                {isImage && doc.thumbnail_url ? (
                                                                                    <img
                                                                                        src={doc.thumbnail_url}
                                                                                        alt={doc.name}
                                                                                        className="h-20 w-20 object-cover rounded-md cursor-pointer hover:opacity-90 transition-opacity border"
                                                                                        onClick={() => openDocument(doc, index)}
                                                                                    />
                                                                                ) : (
                                                                                    <div 
                                                                                        className={`h-20 w-20 rounded-md flex items-center justify-center cursor-pointer transition-colors border ${
                                                                                            isImage ? 'bg-blue-50 hover:bg-blue-100 border-blue-200' :
                                                                                            isPDF ? 'bg-red-50 hover:bg-red-100 border-red-200' :
                                                                                            'bg-gray-50 hover:bg-gray-100 border-gray-200'
                                                                                        }`}
                                                                                        onClick={() => openDocument(doc, index)}
                                                                                    >
                                                                                        <div className="flex flex-col items-center">
                                                                                            {getFileIcon(doc)}
                                                                                            <span className="text-xs mt-1 text-gray-600">
                                                                                                {isImage ? 'Image' : isPDF ? 'PDF' : 'File'}
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            <div className="flex-1 min-w-0">
                                                                                <div className="flex items-start justify-between">
                                                                                    <div className="min-w-0">
                                                                                        <h4 className="font-medium text-gray-900 truncate">{doc.name || doc.original_name || doc.file_name}</h4>
                                                                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                                                            <Badge 
                                                                                                variant="outline"
                                                                                                className={`${getDocumentStatusColor(doc)}`}
                                                                                            >
                                                                                                {getDocumentStatusText(doc)}
                                                                                            </Badge>
                                                                                            <span className="text-sm text-gray-500">{doc.description || 'Document'}</span>
                                                                                            <span className="text-sm text-gray-500">•</span>
                                                                                            <span className="text-sm text-gray-500">{formatFileSize(doc.file_size)}</span>
                                                                                        </div>
                                                                                        <div className="mt-2">
                                                                                            <p className="text-sm text-gray-600">
                                                                                                Uploaded {formatDateTime(doc.uploaded_at)}
                                                                                            </p>
                                                                                            {doc.verified_at && doc.is_verified && (
                                                                                                <p className="text-sm text-green-600 mt-1">
                                                                                                    Verified on {formatDateTime(doc.verified_at)}
                                                                                                </p>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex flex-col items-end gap-2">
                                                                            <div className="flex items-center gap-2">
                                                                                <Button
                                                                                    variant="outline"
                                                                                    size="sm"
                                                                                    onClick={() => openDocument(doc, index)}
                                                                                    className="flex items-center gap-1"
                                                                                >
                                                                                    <Eye className="h-4 w-4" />
                                                                                    View
                                                                                </Button>
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    onClick={() => {
                                                                                        const link = window.document.createElement('a');
                                                                                        link.href = doc.url || '#';
                                                                                        link.download = doc.file_name || 'document';
                                                                                        link.target = '_blank';
                                                                                        link.click();
                                                                                    }}
                                                                                >
                                                                                    <Download className="h-4 w-4" />
                                                                                </Button>
                                                                            </div>
                                                                            {canProcess && !doc.is_verified && doc.status !== 'rejected' && (
                                                                                <div className="flex items-center gap-1">
                                                                                    <Button
                                                                                        size="sm"
                                                                                        variant="outline"
                                                                                        className="h-7 px-2 text-xs"
                                                                                        onClick={() => doc.id && handleVerifyDocument(doc.id)}
                                                                                    >
                                                                                        <CheckCircle className="h-3 w-3 mr-1" />
                                                                                        Verify
                                                                                    </Button>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>

                                                    {/* Bulk actions */}
                                                    {canProcess && (
                                                        <div className="mt-6 pt-6 border-t">
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <h4 className="font-medium text-gray-900">Document Management</h4>
                                                                    <p className="text-sm text-gray-500">Apply actions to multiple documents</p>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <Button
                                                                        variant="outline"
                                                                        onClick={() => {
                                                                            if (confirm('Verify all pending documents?')) {
                                                                                router.post(`/clearances/${clearance.id}/verify-all-documents`);
                                                                            }
                                                                        }}
                                                                        disabled={documentStats.pending === 0}
                                                                    >
                                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                                        Verify All Pending
                                                                    </Button>
                                                                    <Button
                                                                        variant="outline"
                                                                        onClick={() => {
                                                                            const reason = prompt('Enter reason for requesting more documents:');
                                                                            if (reason) {
                                                                                router.post(`/clearances/${clearance.id}/request-more-documents`, { reason });
                                                                            }
                                                                        }}
                                                                    >
                                                                        <Upload className="h-4 w-4 mr-2" />
                                                                        Request More
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-center py-12">
                                                    <div className="w-24 h-24 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-6 border-2 border-dashed border-gray-300">
                                                        <FileText className="h-12 w-12 text-gray-400" />
                                                    </div>
                                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No documents submitted</h3>
                                                    <p className="text-gray-600 max-w-md mx-auto mb-6">
                                                        The resident has not uploaded any documents for this request yet.
                                                        Documents may be required for processing this clearance request.
                                                    </p>
                                                    {canProcess && (
                                                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                                            <Button
                                                                onClick={() => {
                                                                    router.post(`/clearances/${clearance.id}/request-documents`);
                                                                }}
                                                            >
                                                                <Upload className="h-4 w-4 mr-2" />
                                                                Request Documents
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => {
                                                                    router.visit(`/clearances/${clearance.id}/upload`);
                                                                }}
                                                            >
                                                                <Upload className="h-4 w-4 mr-2" />
                                                                Upload Documents
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* Payment Tab */}
                            {activeTab === 'payment' && (
                                <div>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <DollarSign className="h-5 w-5" />
                                                Payment Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {/* Check if payment is actually required based on clearance type */}
                                            {clearanceType?.requires_payment === true ? (
                                                payment ? (
                                                    <div className="space-y-4">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <p className="text-sm font-medium text-gray-500">Amount</p>
                                                                <p className="text-2xl font-bold">{payment.formatted_amount}</p>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <p className="text-sm font-medium text-gray-500">Status</p>
                                                                <Badge variant={payment.status === 'completed' ? 'default' : 'outline'}>
                                                                    {payment.status_display || payment.status.toUpperCase()}
                                                                </Badge>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <p className="text-sm font-medium text-gray-500">Payment Method</p>
                                                                <p className="text-sm capitalize">{payment.payment_method_display || payment.payment_method?.replace('_', ' ') || 'N/A'}</p>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <p className="text-sm font-medium text-gray-500">Official Receipt (OR)</p>
                                                                <p className="text-sm font-mono">{payment.or_number || 'N/A'}</p>
                                                            </div>
                                                            {payment.reference_number && (
                                                                <div className="space-y-2">
                                                                    <p className="text-sm font-medium text-gray-500">Reference Number</p>
                                                                    <p className="text-sm font-mono">{payment.reference_number}</p>
                                                                </div>
                                                            )}
                                                            {payment.paid_at && (
                                                                <div className="space-y-2 md:col-span-2">
                                                                    <p className="text-sm font-medium text-gray-500">Paid At</p>
                                                                    <p className="text-sm">{formatDateTime(payment.paid_at)}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {/* Show payment actions if applicable */}
                                                        {payment.status === 'pending' && canProcess && (
                                                            <div className="mt-6 pt-6 border-t">
                                                                <Button onClick={() => router.post(`/clearances/${clearance.id}/verify-payment`)}>
                                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                                    Mark as Paid
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : clearance.status === 'pending_payment' ? (
                                                    <div className="text-center py-8">
                                                        <DollarSign className="h-12 w-12 mx-auto text-gray-400" />
                                                        <h3 className="mt-4 text-lg font-semibold">Pending Payment</h3>
                                                        <p className="text-gray-500 mt-1">
                                                            Waiting for the resident to complete the payment of {formatCurrency(clearance.fee_amount)}.
                                                        </p>
                                                        {canProcess && (
                                                            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
                                                                <Button onClick={() => router.post(`/clearances/${clearance.id}/verify-payment`)}>
                                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                                    Mark as Paid
                                                                </Button>
                                                                <Button variant="outline" onClick={() => router.post(`/clearances/${clearance.id}/send-payment-reminder`)}>
                                                                    <Mail className="h-4 w-4 mr-2" />
                                                                    Send Reminder
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-8">
                                                        <AlertCircle className="h-12 w-12 mx-auto text-gray-400" />
                                                        <h3 className="mt-4 text-lg font-semibold">Payment Not Submitted</h3>
                                                        <p className="text-gray-500 mt-1">
                                                            Payment is required but not yet submitted. Required amount: {formatCurrency(clearance.fee_amount)}
                                                        </p>
                                                        {canProcess && clearance.status !== 'cancelled' && clearance.status !== 'rejected' && (
                                                            <Button className="mt-4" onClick={() => router.post(`/clearances/${clearance.id}/request-payment`)}>
                                                                <Mail className="h-4 w-4 mr-2" />
                                                                Request Payment
                                                            </Button>
                                                        )}
                                                    </div>
                                                )
                                            ) : payment ? (
                                                // Payment exists but clearance type doesn't require payment (maybe refund or special case)
                                                <div className="space-y-4">
                                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                                                        <div className="flex items-center gap-2">
                                                            <AlertCircle className="h-5 w-5 text-blue-600" />
                                                            <p className="text-sm text-blue-600">
                                                                Note: This clearance type does not normally require payment, but a payment record exists.
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <p className="text-sm font-medium text-gray-500">Amount</p>
                                                            <p className="text-2xl font-bold">{payment.formatted_amount}</p>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <p className="text-sm font-medium text-gray-500">Status</p>
                                                            <Badge variant={payment.status === 'completed' ? 'default' : 'outline'}>
                                                                {payment.status_display || payment.status.toUpperCase()}
                                                            </Badge>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <p className="text-sm font-medium text-gray-500">Payment Method</p>
                                                            <p className="text-sm capitalize">{payment.payment_method_display || payment.payment_method?.replace('_', ' ') || 'N/A'}</p>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <p className="text-sm font-medium text-gray-500">Official Receipt (OR)</p>
                                                            <p className="text-sm font-mono">{payment.or_number || 'N/A'}</p>
                                                        </div>
                                                        {payment.paid_at && (
                                                            <div className="space-y-2 md:col-span-2">
                                                                <p className="text-sm font-medium text-gray-500">Paid At</p>
                                                                <p className="text-sm">{formatDateTime(payment.paid_at)}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                // No payment required and no payment exists
                                                <div className="text-center py-8">
                                                    <CheckCircle className="h-12 w-12 mx-auto text-gray-400" />
                                                    <h3 className="mt-4 text-lg font-semibold">No Payment Required</h3>
                                                    <p className="text-gray-500 mt-1">
                                                        This clearance type does not require payment.
                                                        {clearance.fee_amount && clearance.fee_amount > 0 && (
                                                            <span className="block mt-2 text-sm">
                                                                Note: Although fee is listed as {formatCurrency(clearance.fee_amount)}, 
                                                                this clearance type is marked as free.
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* History Tab */}
                            {activeTab === 'history' && (
                                <div>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <History className="h-5 w-5" />
                                                Activity Log
                                            </CardTitle>
                                            <CardDescription>
                                                Timeline of all actions performed on this clearance request
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {activityLogs.length > 0 ? (
                                                <div className="space-y-4">
                                                    {activityLogs.map((log: ActivityLog) => (
                                                        <div key={log.id} className="flex gap-3 pb-4 border-l-2 border-gray-200 last:border-l-0 last:pb-0">
                                                            <div className="flex-shrink-0 w-6 h-6 -ml-3 mt-0.5 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                                                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center justify-between">
                                                                    <p className="font-medium">{log.user?.name || 'System'}</p>
                                                                    <p className="text-xs text-gray-500">{formatDateTime(log.created_at)}</p>
                                                                </div>
                                                                <p className="text-sm text-gray-600 mt-1">{log.description}</p>
                                                                {log.event && (
                                                                    <Badge variant="outline" className="mt-2">
                                                                        {log.event}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <History className="h-12 w-12 mx-auto text-gray-400" />
                                                    <h3 className="mt-4 text-lg font-semibold">No activity yet</h3>
                                                    <p className="text-gray-500 mt-1">
                                                        No actions have been performed on this request yet.
                                                    </p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Status & Actions */}
                    <div className="space-y-6">
                        {/* Status Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    Status Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500">Current Status</p>
                                    <Badge variant={getStatusVariant(clearance.status)} className="flex items-center gap-1 w-fit">
                                        {getStatusIcon(clearance.status)}
                                        {clearance.status_display || clearance.status}
                                    </Badge>
                                </div>

                                {clearance.estimated_completion_date && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-500">Estimated Completion</p>
                                        <p className="text-sm">{formatDate(clearance.estimated_completion_date)}</p>
                                    </div>
                                )}

                                {clearance.issuing_officer_name && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-500">Issuing Officer</p>
                                        <p className="text-sm">{clearance.issuing_officer_name}</p>
                                    </div>
                                )}

                                {clearance.processed_at && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-500">Processed At</p>
                                        <p className="text-sm">{formatDateTime(clearance.processed_at)}</p>
                                    </div>
                                )}

                                {clearance.remarks && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-500">Officer Remarks</p>
                                        <p className="text-sm text-gray-600">{clearance.remarks}</p>
                                    </div>
                                )}

                                {clearance.admin_notes && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-500">Admin Notes</p>
                                        <p className="text-sm text-gray-600">{clearance.admin_notes}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Actions Panel */}
                        {canProcess && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileSignature className="h-5 w-5" />
                                        Actions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {clearance.status === 'pending' && (
                                        <Button 
                                            className="w-full justify-start" 
                                            onClick={handleMarkAsProcessing}
                                            disabled={isProcessing}
                                        >
                                            <FileCode className="h-4 w-4 mr-2" />
                                            Mark as Processing
                                        </Button>
                                    )}

                                    {clearance.status === 'processing' && canApprove && (
                                        <Button 
                                            className="w-full justify-start" 
                                            onClick={handleApprove}
                                            disabled={isProcessing}
                                        >
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Approve Request
                                        </Button>
                                    )}

                                    {clearance.status === 'approved' && canIssue && (
                                        <Button 
                                            className="w-full justify-start" 
                                            onClick={handleIssue}
                                            disabled={isProcessing}
                                        >
                                            <Shield className="h-4 w-4 mr-2" />
                                            Issue Certificate
                                        </Button>
                                    )}

                                    {['pending', 'processing'].includes(clearance.status) && (
                                        <Button 
                                            variant="outline" 
                                            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                                            onClick={handleReject}
                                            disabled={isProcessing}
                                        >
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Reject Request
                                        </Button>
                                    )}

                                    {['pending', 'pending_payment', 'processing'].includes(clearance.status) && (
                                        <Button 
                                            variant="outline" 
                                            className="w-full justify-start text-gray-600 hover:text-gray-700"
                                            onClick={handleCancel}
                                            disabled={isProcessing}
                                        >
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Cancel Request
                                        </Button>
                                    )}

                                    <Separator />

                                    <Button variant="ghost" className="w-full justify-start">
                                        <MessageSquare className="h-4 w-4 mr-2" />
                                        Add Note
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* Quick Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Quick Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Created</span>
                                    <span>{formatDate(clearance.created_at)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Last Updated</span>
                                    <span>{formatDate(clearance.updated_at)}</span>
                                </div>
                                {clearance.issue_date && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Issued Date</span>
                                        <span>{formatDate(clearance.issue_date)}</span>
                                    </div>
                                )}
                                {clearance.valid_until && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Valid Until</span>
                                        <span>{formatDate(clearance.valid_until)}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Document Viewer Modal */}
            {isViewerOpen && viewedDocument && (
                <DocumentViewer
                    document={viewedDocument}
                    isOpen={isViewerOpen}
                    onClose={closeDocumentViewer}
                    onNext={() => navigateDocument('next')}
                    onPrev={() => navigateDocument('prev')}
                    hasNext={currentDocumentIndex < (clearance.documents?.length || 0) - 1}
                    hasPrev={currentDocumentIndex > 0}
                    onVerify={handleVerifyDocument}
                    onReject={handleRejectDocument}
                    canVerify={canProcess}
                />
            )}
        </AppLayout>
    );
}