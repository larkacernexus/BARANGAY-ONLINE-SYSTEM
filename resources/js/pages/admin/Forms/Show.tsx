// resources/js/Pages/Admin/Forms/Show.tsx
import AppLayout from '@/layouts/admin-app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    ArrowLeft,
    Download,
    Edit,
    Trash2,
    Eye,
    FileText,
    Building,
    Calendar,
    User,
    Copy,
    CheckCircle,
    XCircle,
    BarChart3,
    AlertCircle,
    Printer,
    Share2,
    ExternalLink,
    Clock,
    FolderOpen,
    Package,
    Shield,
    Users,
    Wrench,
    Hash,
    FileType,
    Check,
    X,
    Link as LinkIcon,
    QrCode,
    Star,
    TrendingUp,
    AlertTriangle,
    Bell,
    Mail,
    MessageSquare,
    Heart,
    ThumbsUp,
    Bookmark,
    Tag,
    EyeOff,
    Image as ImageIcon,
    Loader2,
    Maximize2,
    Minimize2,
    ZoomIn,
    ZoomOut,
    RotateCw,
    FileCode,
    PackageOpen,
    Lock,
    Globe,
    ShieldCheck,
    FileLock,
    ChevronLeft,
    ChevronRight,
    MoreVertical,
    Info
} from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';

interface Form {
    id: number;
    title: string;
    description: string;
    category: string;
    issuing_agency: string;
    file_path: string;
    file_name: string;
    file_size: number;
    file_type: string;
    mime_type: string;
    download_count: number;
    view_count: number;
    is_active: boolean;
    is_featured: boolean;
    is_public: boolean;
    requires_login: boolean;
    tags: string[];
    version?: string;
    valid_from?: string;
    valid_until?: string;
    language?: string;
    pages?: number;
    created_at: string;
    updated_at: string;
    created_by?: {
        id: number;
        name: string;
        email: string;
        avatar?: string;
    };
    last_downloaded_at?: string;
    last_downloaded_by?: {
        id: number;
        name: string;
        email: string;
    };
    last_viewed_at?: string;
    last_viewed_by?: {
        id: number;
        name: string;
        email: string;
    };
}

interface PageProps {
    form?: Form;
    related_forms?: Form[];
    download_stats?: {
        today: number;
        this_week: number;
        this_month: number;
        total: number;
    };
    view_stats?: {
        today: number;
        this_week: number;
        this_month: number;
        total: number;
    };
    flash?: {
        success?: string;
        error?: string;
    };
}

// ==================== HELPER FUNCTIONS ====================
const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
        return format(parseISO(dateString), 'MMM dd, yyyy HH:mm');
    } catch (error) {
        return 'Invalid date';
    }
};

const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
        return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch (error) {
        return 'Invalid date';
    }
};

const getFileIcon = (fileType?: string) => {
    if (!fileType) return '📎';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('doc')) return '📝';
    if (fileType.includes('excel') || fileType.includes('sheet')) return '📊';
    if (fileType.includes('image')) return '🖼️';
    return '📎';
};

const getFileTypeIcon = (fileType?: string) => {
    if (!fileType) return <FileText className="h-5 w-5 text-gray-500" />;
    if (fileType.includes('pdf')) return <FileType className="h-5 w-5 text-red-500" />;
    if (fileType.includes('word') || fileType.includes('doc')) return <FileText className="h-5 w-5 text-blue-500" />;
    if (fileType.includes('excel') || fileType.includes('sheet')) return <BarChart3 className="h-5 w-5 text-green-500" />;
    if (fileType.includes('image')) return <ImageIcon className="h-5 w-5 text-purple-500" />;
    return <FileText className="h-5 w-5 text-gray-500" />;
};

const getCategoryColor = (category?: string): string => {
    if (!category) return 'bg-gray-100 text-gray-800 border-gray-200';
    const colors: Record<string, string> = {
        'Social Services': 'bg-purple-100 text-purple-800 border-purple-200',
        'Permits & Licenses': 'bg-blue-100 text-blue-800 border-blue-200',
        'Health & Medical': 'bg-red-100 text-red-800 border-red-200',
        'Education': 'bg-green-100 text-green-800 border-green-200',
        'Legal & Police': 'bg-indigo-100 text-indigo-800 border-indigo-200',
        'Employment': 'bg-amber-100 text-amber-800 border-amber-200',
        'Housing': 'bg-cyan-100 text-cyan-800 border-cyan-200',
        'Other': 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[category] || colors['Other'];
};

const getAgencyIcon = (agency?: string) => {
    if (!agency) return <Building className="h-4 w-4" />;
    if (agency.includes('Mayor')) return <Building className="h-4 w-4" />;
    if (agency.includes('DSWD')) return <Users className="h-4 w-4" />;
    if (agency.includes('PNP') || agency.includes('Police')) return <Shield className="h-4 w-4" />;
    if (agency.includes('Health')) return <AlertCircle className="h-4 w-4" />;
    if (agency.includes('Education')) return <Bookmark className="h-4 w-4" />;
    return <Building className="h-4 w-4" />;
};

// ==================== FULLSCREEN DOCUMENT VIEWER ====================
function FullScreenFormViewer({
    form,
    previewUrl,
    isOpen,
    onClose,
}: {
    form: Form;
    previewUrl: string;
    isOpen: boolean;
    onClose: () => void;
}) {
    const [zoom, setZoom] = useState(100);
    const [rotation, setRotation] = useState(0);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const isPdf = form?.mime_type?.includes('pdf') || form?.file_type?.includes('pdf');
    const isImage = form?.mime_type?.startsWith('image/') || 
                   ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].some(ext => 
                       form?.file_type?.includes(ext) || form?.file_name?.endsWith(ext)
                   );

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
        <div className="fixed inset-0 z-[9999] flex flex-col bg-black">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between px-4 py-3 bg-black border-b border-gray-800 text-white">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="text-gray-300 hover:text-white hover:bg-gray-800 p-2"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                    
                    <div className="flex-1 min-w-0">
                        <h2 className="text-sm font-semibold truncate" title={form?.title || 'Document'}>
                            {form?.title || 'Document'}
                        </h2>
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
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
                        <div className="flex items-center gap-1 bg-gray-900 rounded-lg px-2 py-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleZoomOut}
                                disabled={zoom <= 25}
                                className="h-7 w-7 p-0 text-gray-300 hover:text-white hover:bg-gray-800"
                                title="Zoom Out (Ctrl -)"
                            >
                                <ZoomOut className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium px-1 min-w-[45px] text-center cursor-default" title="Zoom Level">
                                {zoom}%
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleZoomIn}
                                disabled={zoom >= 300}
                                className="h-7 w-7 p-0 text-gray-300 hover:text-white hover:bg-gray-800"
                                title="Zoom In (Ctrl +)"
                            >
                                <ZoomIn className="h-3 w-3" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleRotate}
                                className="h-7 w-7 p-0 text-gray-300 hover:text-white hover:bg-gray-800"
                                title="Rotate (Ctrl+R)"
                            >
                                <RotateCw className="h-3 w-3" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleZoomReset}
                                className="h-7 w-7 p-0 text-gray-300 hover:text-white hover:bg-gray-800"
                                title="Reset View"
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                    )}

                    <Separator orientation="vertical" className="h-6 bg-gray-700 mx-1" />
                    
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handlePrint}
                                    className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-800"
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
                                    className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-800"
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
            <div className="flex-1 relative overflow-hidden bg-gray-900">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                        <div className="text-center space-y-3">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                            <p className="text-white text-sm">Loading form preview...</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                        <div className="text-center p-6 max-w-md space-y-4">
                            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
                            <div>
                                <h3 className="text-lg font-medium text-white mb-2">Preview Unavailable</h3>
                                <p className="text-gray-300 text-sm">{error}</p>
                            </div>
                            <Button 
                                onClick={handleDownload}
                                className="gap-2 bg-blue-600 hover:bg-blue-700"
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
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                        <div className="text-center p-8 max-w-md space-y-6">
                            <div className="inline-block p-6 rounded-full bg-gray-800">
                                <FileText className="h-16 w-16 text-gray-400" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-semibold text-white">{form?.title || 'Document'}</h3>
                                <div className="flex flex-col items-center gap-1 text-gray-300">
                                    {form?.file_type && (
                                        <span className="px-3 py-1 bg-gray-800 rounded-full text-sm">
                                            {form.file_type.toUpperCase()}
                                        </span>
                                    )}
                                    <span className="text-sm">{formatFileSize(form?.file_size || 0)}</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Button 
                                    onClick={handleDownload}
                                    className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
                                >
                                    <Download className="h-4 w-4" />
                                    Download Form
                                </Button>
                                <Button
                                    onClick={onClose}
                                    variant="outline"
                                    className="w-full gap-2 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
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
            <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-t border-gray-800 text-xs text-gray-400">
                <div className="flex items-center gap-4">
                    <span className="truncate max-w-[200px]" title={form?.title || 'Document'}>
                        {form?.title || 'Document'}
                    </span>
                    <Separator orientation="vertical" className="h-3 bg-gray-700" />
                    <span>{form?.category || 'N/A'}</span>
                    <Separator orientation="vertical" className="h-3 bg-gray-700" />
                    <span>{form?.issuing_agency || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-4">
                    <span>Press ESC to exit fullscreen</span>
                    <Separator orientation="vertical" className="h-3 bg-gray-700" />
                    {isImage && <span>Ctrl + +/- to zoom • Ctrl+R to rotate</span>}
                    {isPdf && <span>Ctrl + +/- to zoom</span>}
                </div>
            </div>
        </div>
    );
}

// ==================== MAIN COMPONENT ====================
export default function FormsShow({ form, related_forms = [], download_stats, view_stats }: PageProps) {
    // Add null check at the beginning
    if (!form) {
        return (
            <AppLayout
                title="Loading Form..."
                breadcrumbs={[
                    { title: 'Dashboard', href: route('admin.dashboard') },
                    { title: 'Forms', href: route('admin.forms.index') },
                    { title: 'Loading...', href: '#' }
                ]}
            >
                <Head title="Loading Form..." />
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
                        <p className="text-gray-600">Loading form details...</p>
                        <Button
                            variant="outline"
                            onClick={() => router.get(route('forms.index'))}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Forms
                        </Button>
                    </div>
                </div>
            </AppLayout>
        );
    }

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState('details');
    const [isFullscreenViewerOpen, setIsFullscreenViewerOpen] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(100);
    const [rotation, setRotation] = useState(0);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);
    const [previewError, setPreviewError] = useState<string | null>(null);
    const previewContainerRef = useRef<HTMLDivElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Determine file types
    const isPdf = form.mime_type?.includes('pdf') || form.file_type?.includes('pdf');
    const isImage = form.mime_type?.startsWith('image/') || 
                   ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].some(ext => 
                       form.file_type?.includes(ext) || form.file_name?.endsWith(ext)
                   );
    const isOfficeDoc = ['word', 'doc', 'excel', 'sheet', 'powerpoint', 'presentation'].some(term => 
        form.mime_type?.includes(term) || form.file_type?.includes(term)
    );

    // Generate preview URL
    const getPreviewUrl = () => {
        if (!form?.file_path) return '';
        return `/storage/${form.file_path}`;
    };

    const previewUrl = getPreviewUrl();

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(route('forms.destroy', form.id), {
            preserveScroll: false,
            onFinish: () => setIsDeleting(false),
        });
    };

    const handleToggleStatus = () => {
        router.post(route('forms.toggle-status', form.id), {}, {
            preserveScroll: true,
        });
    };

    const handleToggleFeatured = () => {
        router.post(route('forms.toggle-featured', form.id), {}, {
            preserveScroll: true,
        });
    };

    const handleDownload = () => {
        window.open(route('forms.download', form.id), '_blank');
    };

    const handleCopyLink = () => {
        const link = route('forms.download', form.id);
        navigator.clipboard.writeText(link).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleCopyDetails = () => {
        const details = `
Form: ${form.title}
Category: ${form.category}
Agency: ${form.issuing_agency}
Description: ${form.description}
Views: ${form.view_count}
Downloads: ${form.download_count}
Download Link: ${route('forms.download', form.id)}
        `.trim();
        
        navigator.clipboard.writeText(details);
    };

    const handlePrint = () => {
        window.print();
    };

    // Preview controls
    const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 25, 200));
    const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 25, 50));
    const handleZoomReset = () => {
        setZoomLevel(100);
        setRotation(0);
    };
    const handleRotate = () => setRotation(prev => (prev + 90) % 360);

    // Handle fullscreen
    const handleFullscreen = () => {
        setIsFullscreenViewerOpen(true);
    };

    // Handle iframe loading
    const handleIframeLoad = () => {
        setIsLoadingPreview(false);
        setPreviewError(null);
    };

    const handleIframeError = () => {
        setIsLoadingPreview(false);
        setPreviewError('Failed to load preview. The file may be corrupted or the format is not supported.');
    };

    const handleImageLoad = () => {
        setIsLoadingPreview(false);
        setPreviewError(null);
    };

    const handleImageError = () => {
        setIsLoadingPreview(false);
        setPreviewError('Failed to load image. The file may be corrupted or the format is not supported.');
    };

    // Reset loading state when tab changes
    useEffect(() => {
        if (activeTab === 'preview') {
            setIsLoadingPreview(true);
            setPreviewError(null);
        } else {
            setIsLoadingPreview(false);
        }
    }, [activeTab]);

    const tabs = [
        { id: 'details', label: 'Form Details', icon: <FileText className="h-4 w-4" /> },
        { id: 'preview', label: 'Preview', icon: <Eye className="h-4 w-4" /> },
        { id: 'stats', label: 'Statistics', icon: <BarChart3 className="h-4 w-4" /> },
        { id: 'related', label: 'Related Forms', icon: <FolderOpen className="h-4 w-4" /> },
    ];

    return (
        <>
            {/* Fullscreen Viewer */}
            <FullScreenFormViewer
                form={form}
                previewUrl={previewUrl}
                isOpen={isFullscreenViewerOpen}
                onClose={() => setIsFullscreenViewerOpen(false)}
            />

            <AppLayout
                title={`${form.title} - Form Details`}
                breadcrumbs={[
                    { title: 'Dashboard', href: route('admin.dashboard') },
                    { title: 'Forms', href: route('admin.forms.index') },
                    { title: form.title, href: route('admin.forms.show', form.id) }
                ]}
            >
                <Head title={`${form.title} - Form Details`} />
                
                <TooltipProvider>
                    <div className="space-y-6">
                        {/* Header with Actions */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <Link href={route('admin.forms.index')}>
                                    <Button variant="ghost" size="sm">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back to Forms
                                    </Button>
                                </Link>
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight line-clamp-2">
                                        {form.title}
                                    </h1>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                        <Badge variant={form.is_active ? "default" : "secondary"} className="flex items-center gap-1">
                                            {form.is_active ? (
                                                <CheckCircle className="h-3 w-3" />
                                            ) : (
                                                <XCircle className="h-3 w-3" />
                                            )}
                                            {form.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                        {form.is_featured && (
                                            <Badge variant="default" className="bg-gradient-to-r from-purple-600 to-pink-600">
                                                <Star className="h-3 w-3" />
                                                Featured
                                            </Badge>
                                        )}
                                        <Badge variant="outline" className={getCategoryColor(form.category)}>
                                            {form.category}
                                        </Badge>
                                        <div className="flex items-center gap-3 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Eye className="h-3 w-3" />
                                                {form.view_count} views
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Download className="h-3 w-3" />
                                                {form.download_count} downloads
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleCopyLink}
                                            className="h-9"
                                        >
                                            {copied ? (
                                                <Check className="h-4 w-4 mr-2" />
                                            ) : (
                                                <LinkIcon className="h-4 w-4 mr-2" />
                                            )}
                                            {copied ? 'Copied!' : 'Copy Link'}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Copy download link to clipboard
                                    </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleToggleStatus}
                                            className="h-9"
                                        >
                                            {form.is_active ? (
                                                <XCircle className="h-4 w-4 mr-2" />
                                            ) : (
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                            )}
                                            {form.is_active ? 'Deactivate' : 'Activate'}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {form.is_active ? 'Make form unavailable' : 'Make form available for download'}
                                    </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleToggleFeatured}
                                            className="h-9"
                                        >
                                            <Star className={`h-4 w-4 mr-2 ${form.is_featured ? 'text-yellow-500 fill-yellow-500' : ''}`} />
                                            {form.is_featured ? 'Unfeature' : 'Feature'}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {form.is_featured ? 'Remove from featured forms' : 'Add to featured forms'}
                                    </TooltipContent>
                                </Tooltip>
                                <Link href={route('admin.forms.edit', form.id)}>
                                    <Button variant="outline" size="sm" className="h-9">
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                    </Button>
                                </Link>
                                <Button
                                    onClick={handleDownload}
                                    size="sm"
                                    className="h-9 bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                </Button>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowDeleteDialog(true)}
                                            className="h-9 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Delete this form
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="border-b">
                            <nav className="flex space-x-4" aria-label="Tabs">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`
                                            inline-flex items-center px-3 py-2 text-sm font-medium border-b-2
                                            ${activeTab === tab.id
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }
                                        `}
                                    >
                                        {tab.icon}
                                        <span className="ml-2">{tab.label}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Main Content */}
                        <div className="grid gap-6 lg:grid-cols-3">
                            {/* Left Column - Form Details & Preview */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Form Details Card */}
                                {activeTab === 'details' && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <FileText className="h-5 w-5" />
                                                Form Information
                                            </CardTitle>
                                            <CardDescription>
                                                Complete details about this form
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            {/* Description */}
                                            <div className="space-y-2">
                                                <h3 className="text-sm font-medium text-gray-700">Description</h3>
                                                <p className="text-gray-600 whitespace-pre-line">{form.description}</p>
                                            </div>

                                            <Separator />

                                            {/* File Information */}
                                            <div className="space-y-4">
                                                <h3 className="text-sm font-medium text-gray-700">File Information</h3>
                                                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                                                    <div className="text-3xl">
                                                        {getFileIcon(form.file_type)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <h4 className="font-medium">{form.file_name}</h4>
                                                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                                                    {getFileTypeIcon(form.file_type)}
                                                                    <span>{formatFileSize(form.file_size)}</span>
                                                                    <span>•</span>
                                                                    <span>{form.file_type}</span>
                                                                    <span>•</span>
                                                                    <span>MIME: {form.mime_type}</span>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={handleDownload}
                                                            >
                                                                <Download className="h-4 w-4 mr-2" />
                                                                Download
                                                            </Button>
                                                        </div>
                                                        <div className="mt-4 grid grid-cols-2 gap-4">
                                                            <div>
                                                                <p className="text-xs text-gray-500">File Path</p>
                                                                <p className="text-sm truncate" title={form.file_path}>
                                                                    {form.file_path}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-gray-500">Security</p>
                                                                <div className="flex flex-wrap gap-1 mt-1">
                                                                    {form.is_public ? (
                                                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                                            <PackageOpen className="h-3 w-3 mr-1" />
                                                                            Public
                                                                        </Badge>
                                                                    ) : (
                                                                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                                                            <Shield className="h-3 w-3 mr-1" />
                                                                            Restricted
                                                                        </Badge>
                                                                    )}
                                                                    {form.requires_login && (
                                                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                                            <Shield className="h-3 w-3 mr-1" />
                                                                            Login Required
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <Separator />

                                            {/* Category & Agency */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <h3 className="text-sm font-medium text-gray-700">Category</h3>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className={getCategoryColor(form.category)}>
                                                            {form.category}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <h3 className="text-sm font-medium text-gray-700">Issuing Agency</h3>
                                                    <div className="flex items-center gap-2">
                                                        {getAgencyIcon(form.issuing_agency)}
                                                        <span>{form.issuing_agency}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Additional Information */}
                                            {(form.version || form.language || form.pages || (form.tags && form.tags.length > 0)) && (
                                                <>
                                                    <Separator />
                                                    <div className="space-y-4">
                                                        <h3 className="text-sm font-medium text-gray-700">Additional Information</h3>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                            {form.version && (
                                                                <div className="space-y-1">
                                                                    <p className="text-xs text-gray-500">Version</p>
                                                                    <div className="flex items-center gap-2">
                                                                        <FileCode className="h-4 w-4 text-gray-400" />
                                                                        <span className="text-sm">{form.version}</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {form.language && (
                                                                <div className="space-y-1">
                                                                    <p className="text-xs text-gray-500">Language</p>
                                                                    <span className="text-sm">{form.language}</span>
                                                                </div>
                                                            )}
                                                            {form.pages && (
                                                                <div className="space-y-1">
                                                                    <p className="text-xs text-gray-500">Pages</p>
                                                                    <span className="text-sm">{form.pages} pages</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {form.tags && form.tags.length > 0 && (
                                                            <div className="space-y-2">
                                                                <p className="text-xs text-gray-500">Tags</p>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {form.tags.map((tag, index) => (
                                                                        <Badge key={index} variant="secondary" className="text-xs">
                                                                            <Tag className="h-2 w-2 mr-1" />
                                                                            {tag}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Preview Tab */}
                                {activeTab === 'preview' && (
                                    <Card>
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <CardTitle className="flex items-center gap-2">
                                                        <Eye className="h-5 w-5" />
                                                        Form Preview
                                                    </CardTitle>
                                                    <CardDescription>
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
                                                            onClick={handleFullscreen}
                                                            className="h-8 gap-1 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                                                        >
                                                            <Maximize2 className="h-3 w-3" />
                                                            Fullscreen
                                                            <kbd className="ml-1 text-xs bg-white border border-blue-300 rounded px-1 py-0.5">
                                                                F11
                                                            </kbd>
                                                        </Button>
                                                    )}
                                                    <a
                                                        href={previewUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <Button variant="outline" size="sm" className="h-8">
                                                            <ExternalLink className="h-3 w-3" />
                                                        </Button>
                                                    </a>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            <div 
                                                ref={previewContainerRef}
                                                className="relative w-full h-[500px] overflow-hidden bg-gray-100"
                                            >
                                                {isLoadingPreview && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20">
                                                        <div className="text-center space-y-3">
                                                            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
                                                            <p className="text-gray-600 font-medium text-base">Loading form preview...</p>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {previewError ? (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20">
                                                        <div className="text-center p-6 max-w-md space-y-4">
                                                            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
                                                            <div>
                                                                <h3 className="text-lg font-medium text-gray-900 mb-2">Preview Unavailable</h3>
                                                                <p className="text-gray-500 text-base">{previewError}</p>
                                                            </div>
                                                            <Button variant="outline" onClick={handleDownload}>
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
                                                        onLoad={handleIframeLoad}
                                                        onLoadStart={() => setIsLoadingPreview(true)}
                                                        onError={handleIframeError}
                                                    />
                                                ) : isImage ? (
                                                    <div className="w-full h-full flex items-center justify-center p-4 bg-gray-900">
                                                        <img
                                                            src={previewUrl}
                                                            alt={form.title}
                                                            className="max-w-full max-h-full object-contain"
                                                            style={{
                                                                transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                                                                transformOrigin: 'center center',
                                                                transition: 'transform 0.2s ease',
                                                            }}
                                                            onLoad={handleImageLoad}
                                                            onLoadStart={() => setIsLoadingPreview(true)}
                                                            onError={handleImageError}
                                                        />
                                                    </div>
                                                ) : isOfficeDoc ? (
                                                    <div className="relative w-full h-full">
                                                        <iframe
                                                            ref={iframeRef}
                                                            src={`https://docs.google.com/viewer?url=${encodeURIComponent(window.location.origin + previewUrl)}&embedded=true`}
                                                            title={form.title}
                                                            className="w-full h-full border-0"
                                                            onLoad={handleIframeLoad}
                                                            onLoadStart={() => setIsLoadingPreview(true)}
                                                            onError={handleIframeError}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                                                        <FileText className="h-16 w-16 text-gray-400 mb-4" />
                                                        <h3 className="text-lg font-semibold mb-2">Preview Not Available</h3>
                                                        <p className="text-gray-500 mb-4">
                                                            This file type cannot be previewed directly in the browser.
                                                        </p>
                                                        <Button onClick={handleDownload}>
                                                            <Download className="h-4 w-4 mr-2" />
                                                            Download to View
                                                        </Button>
                                                    </div>
                                                )}

                                                {/* Preview controls for images */}
                                                {isImage && !isLoadingPreview && !previewError && (
                                                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800/90 text-white rounded-lg px-3 py-2 flex items-center gap-2 z-10">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={handleZoomOut}
                                                            className="h-8 w-8 p-0 text-white hover:bg-gray-700"
                                                        >
                                                            <ZoomOut className="h-4 w-4" />
                                                        </Button>
                                                        <span className="text-sm">{zoomLevel}%</span>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={handleZoomIn}
                                                            className="h-8 w-8 p-0 text-white hover:bg-gray-700"
                                                        >
                                                            <ZoomIn className="h-4 w-4" />
                                                        </Button>
                                                        <Separator orientation="vertical" className="h-4" />
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={handleRotate}
                                                            className="h-8 w-8 p-0 text-white hover:bg-gray-700"
                                                        >
                                                            <RotateCw className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={handleZoomReset}
                                                            className="h-8 w-8 p-0 text-white hover:bg-gray-700"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Preview info and controls */}
                                            <div className="p-4 md:p-6 border-t">
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-medium text-gray-500">File Type</p>
                                                        <p className="text-sm font-semibold">
                                                            {isPdf && 'PDF'}
                                                            {isImage && 'Image'}
                                                            {isOfficeDoc && 'Office Document'}
                                                            {!isPdf && !isImage && !isOfficeDoc && 'File'}
                                                        </p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-medium text-gray-500">File Size</p>
                                                        <p className="text-sm">{formatFileSize(form.file_size)}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-medium text-gray-500">MIME Type</p>
                                                        <p className="text-sm font-mono text-xs">{form.mime_type || form.file_type}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-medium text-gray-500">Pages</p>
                                                        <p className="text-sm">{form.pages || 'N/A'}</p>
                                                    </div>
                                                </div>

                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    <Button
                                                        onClick={handleDownload}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                                        size="sm"
                                                    >
                                                        <Download className="h-3 w-3 mr-2" />
                                                        Download Original
                                                    </Button>
                                                    {isPdf && (
                                                        <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                                                            <Button variant="outline" size="sm">
                                                                <ExternalLink className="h-3 w-3 mr-2" />
                                                                Open in New Tab
                                                            </Button>
                                                        </a>
                                                    )}
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={handlePrint}
                                                    >
                                                        <Printer className="h-3 w-3 mr-2" />
                                                        Print
                                                    </Button>
                                                    {(isPdf || isImage) && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={handleFullscreen}
                                                            className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                                                        >
                                                            <Maximize2 className="h-3 w-3 mr-2" />
                                                            Fullscreen View
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Statistics Tab */}
                                {activeTab === 'stats' && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <BarChart3 className="h-5 w-5" />
                                                Usage Statistics
                                            </CardTitle>
                                            <CardDescription>
                                                View and download statistics for this form
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                    <Card>
                                                        <CardContent className="pt-6">
                                                            <div className="text-center space-y-2">
                                                                <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                                                    <Eye className="h-6 w-6 text-blue-600" />
                                                                </div>
                                                                <h3 className="text-2xl font-bold">{view_stats?.total || 0}</h3>
                                                                <p className="text-sm text-gray-500">Total Views</p>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                    <Card>
                                                        <CardContent className="pt-6">
                                                            <div className="text-center space-y-2">
                                                                <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                                                    <Download className="h-6 w-6 text-green-600" />
                                                                </div>
                                                                <h3 className="text-2xl font-bold">{download_stats?.total || 0}</h3>
                                                                <p className="text-sm text-gray-500">Total Downloads</p>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                    <Card>
                                                        <CardContent className="pt-6">
                                                            <div className="text-center space-y-2">
                                                                <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                                                                    <TrendingUp className="h-6 w-6 text-amber-600" />
                                                                </div>
                                                                <h3 className="text-2xl font-bold">{download_stats?.this_month || 0}</h3>
                                                                <p className="text-sm text-gray-500">Downloads This Month</p>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                    <Card>
                                                        <CardContent className="pt-6">
                                                            <div className="text-center space-y-2">
                                                                <div className="mx-auto w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                                                                    <BarChart3 className="h-6 w-6 text-purple-600" />
                                                                </div>
                                                                <h3 className="text-2xl font-bold">{view_stats?.this_month || 0}</h3>
                                                                <p className="text-sm text-gray-500">Views This Month</p>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </div>

                                                <Separator />

                                                <div className="space-y-4">
                                                    <h3 className="text-sm font-medium text-gray-700">Recent Activity</h3>
                                                    <div className="space-y-3">
                                                        {form.last_viewed_at && (
                                                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="p-2 rounded-full bg-blue-100">
                                                                        <Eye className="h-4 w-4 text-blue-600" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-medium">Last Viewed</p>
                                                                        <p className="text-xs text-gray-500">
                                                                            {form.last_viewed_by?.name ? `by ${form.last_viewed_by.name}` : ''}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <span className="text-sm text-gray-500">
                                                                    {formatDateTime(form.last_viewed_at)}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {form.last_downloaded_at && (
                                                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="p-2 rounded-full bg-green-100">
                                                                        <Download className="h-4 w-4 text-green-600" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-medium">Last Downloaded</p>
                                                                        <p className="text-xs text-gray-500">
                                                                            {form.last_downloaded_by?.name ? `by ${form.last_downloaded_by.name}` : ''}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <span className="text-sm text-gray-500">
                                                                    {formatDateTime(form.last_downloaded_at)}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Related Forms */}
                                {activeTab === 'related' && related_forms && related_forms.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <FolderOpen className="h-5 w-5" />
                                                Related Forms
                                            </CardTitle>
                                            <CardDescription>
                                                Other forms you might be interested in
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {related_forms.map((relatedForm) => (
                                                    <div key={relatedForm.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                                        <div className="flex items-center gap-3">
                                                            {getFileTypeIcon(relatedForm.file_type)}
                                                            <div>
                                                                <Link
                                                                    href={route('admin.forms.show', relatedForm.id)}
                                                                    className="font-medium hover:text-blue-600"
                                                                >
                                                                    {relatedForm.title}
                                                                </Link>
                                                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                                                    <Badge variant="outline" className={getCategoryColor(relatedForm.category)}>
                                                                        {relatedForm.category}
                                                                    </Badge>
                                                                    <span>{formatFileSize(relatedForm.file_size)}</span>
                                                                    <span>•</span>
                                                                    <span>{relatedForm.file_type}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Link href={route('admin.forms.show', relatedForm.id)}>
                                                                <Button variant="outline" size="sm">
                                                                    <Eye className="h-3 w-3" />
                                                                </Button>
                                                            </Link>
                                                            <a href={route('admin.forms.download', relatedForm.id)} target="_blank">
                                                                <Button variant="outline" size="sm">
                                                                    <Download className="h-3 w-3" />
                                                                </Button>
                                                            </a>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {activeTab === 'related' && (!related_forms || related_forms.length === 0) && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <FolderOpen className="h-5 w-5" />
                                                Related Forms
                                            </CardTitle>
                                            <CardDescription>
                                                Other forms you might be interested in
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-center py-8">
                                                <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">No related forms found</h3>
                                                <p className="text-gray-500">
                                                    There are no other forms related to this one.
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>

                            {/* Right Column - Metadata & Actions */}
                            <div className="space-y-6">
                                {/* Status & Actions Card */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">Form Status & Actions</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Availability</span>
                                                <Badge variant={form.is_active ? "default" : "secondary"}>
                                                    {form.is_active ? 'Available' : 'Unavailable'}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Featured</span>
                                                <Badge variant={form.is_featured ? "default" : "outline"}>
                                                    {form.is_featured ? 'Yes' : 'No'}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Views</span>
                                                <div className="flex items-center gap-1">
                                                    <Eye className="h-3 w-3 text-gray-400" />
                                                    <span className="font-medium">{form.view_count}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Downloads</span>
                                                <div className="flex items-center gap-1">
                                                    <Download className="h-3 w-3 text-gray-400" />
                                                    <span className="font-medium">{form.download_count}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">File Size</span>
                                                <span className="font-medium">{formatFileSize(form.file_size)}</span>
                                            </div>
                                        </div>
                                        
                                        <Separator />
                                        
                                        <div className="space-y-2">
                                            <Button
                                                onClick={handleDownload}
                                                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                Download Form
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => setActiveTab('preview')}
                                                className="w-full"
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                Preview Form
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={handleFullscreen}
                                                className="w-full bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                                            >
                                                <Maximize2 className="h-4 w-4 mr-2" />
                                                Fullscreen View
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={handleCopyLink}
                                                className="w-full"
                                            >
                                                {copied ? (
                                                    <Check className="h-4 w-4 mr-2" />
                                                ) : (
                                                    <LinkIcon className="h-4 w-4 mr-2" />
                                                )}
                                                {copied ? 'Link Copied!' : 'Copy Download Link'}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={handlePrint}
                                                className="w-full"
                                            >
                                                <Printer className="h-4 w-4 mr-2" />
                                                Print Details
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Metadata Card */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">Metadata</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Created</span>
                                                <div className="text-right">
                                                    <span className="text-sm block">{formatDate(form.created_at)}</span>
                                                    {form.created_by && (
                                                        <span className="text-xs text-gray-500 block">
                                                            by {form.created_by.name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Last Updated</span>
                                                <span className="text-sm">{formatDate(form.updated_at)}</span>
                                            </div>
                                            {form.valid_from && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">Valid From</span>
                                                    <span className="text-sm">{formatDate(form.valid_from)}</span>
                                                </div>
                                            )}
                                            {form.valid_until && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">Valid Until</span>
                                                    <span className="text-sm">{formatDate(form.valid_until)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Share & Export Card */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">Share & Export</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleCopyLink}
                                                className="flex-1"
                                            >
                                                <Copy className="h-3 w-3 mr-1" />
                                                Copy Link
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleCopyDetails}
                                                className="flex-1"
                                            >
                                                <FileText className="h-3 w-3 mr-1" />
                                                Copy Details
                                            </Button>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handlePrint}
                                                className="flex-1"
                                            >
                                                <Printer className="h-3 w-3 mr-1" />
                                                Print
                                            </Button>
                                            <Link href={route('admin.forms.edit', form.id)}>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1"
                                                >
                                                    <Edit className="h-3 w-3 mr-1" />
                                                    Edit
                                                </Button>
                                            </Link>
                                        </div>
                                        <div className="pt-2 border-t">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setShowDeleteDialog(true)}
                                                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-3 w-3 mr-1" />
                                                Delete Form
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </TooltipProvider>

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Form</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the form
                                "{form.title}" and remove all associated data from our servers.
                                All download links will become invalid.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                className="bg-red-600 hover:bg-red-700 text-white"
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete Form'
                                )}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </AppLayout>
        </>
    );
}