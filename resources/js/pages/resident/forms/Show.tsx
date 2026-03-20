// resources/js/Pages/Forms/Show.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import ResidentLayout from '@/layouts/resident-app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    ArrowLeft,
    Download,
    Printer,
    FileText,
    Eye,
    Copy,
    Share2,
    FileType,
    CheckCircle,
    EyeOff,
    Tag,
    FolderOpen,
    Building,
    FileCheck,
    Loader2,
    ChevronRight,
    Info,
    Lock,
    Globe,
    Calendar,
    Building2,
    Users,
    Shield,
    AlertTriangle,
    BarChart3,
    Star,
    Image as ImageIcon,
    FileCode,
    ExternalLink,
    X,
    Maximize2,
    Minimize2,
    RotateCw,
    ZoomIn,
    ZoomOut,
    AlertCircle,
    ChevronLeft,
    ShieldCheck,
    FileLock,
    MoreVertical,
    Folder,
    Clock,
    User,
    Home,
    XCircle,
} from 'lucide-react';

interface Form {
    id: number;
    title: string;
    slug: string;
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
    
    // Related forms
    related_forms?: Array<{
        id: number;
        title: string;
        slug: string;
        category: string;
        download_count: number;
        file_type: string;
        file_size: number;
    }>;
}

interface Permissions {
    can_download: boolean;
    can_print: boolean;
    can_share: boolean;
}

interface FormsShowProps {
    form: Form;
    related_forms?: Form[];
    permissions?: Permissions;
}

// ==================== FULLSCREEN FORM VIEWER ====================
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
        const downloadUrl = `/forms/${form.slug}/download`;
        window.open(downloadUrl, '_blank');
    };

    const handlePrint = () => {
        if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.print();
        } else if (isImage && previewUrl) {
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`
                    <html>
                        <head>
                            <title>Print - ${form.title}</title>
                            <style>
                                body { margin: 0; padding: 20px; }
                                img { max-width: 100%; height: auto; display: block; margin: 0 auto; }
                                @media print {
                                    body { padding: 0; }
                                }
                            </style>
                        </head>
                        <body>
                            <img src="${previewUrl}" alt="${form.title}" />
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
    const handleZoomReset = () => setZoom(100);

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
                        className="text-gray-300 hover:text-white hover:bg-gray-900 p-2"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                    
                    <div className="flex-1 min-w-0">
                        <h2 className="text-sm font-semibold truncate" title={form.title}>
                            {form.title}
                        </h2>
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                            <span>{form.file_name.split('.').pop()?.toUpperCase() || 'FORM'}</span>
                            <span>•</span>
                            <span>{formatFileSize(form.file_size)}</span>
                            <span>•</span>
                            <span>{isPdf ? 'PDF' : isImage ? 'Image' : 'Document'}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-gray-900 rounded-lg px-2 py-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleZoomOut}
                            disabled={zoom <= 25}
                            className="h-7 w-7 p-0 text-gray-300 hover:text-white hover:bg-gray-900"
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
                            className="h-7 w-7 p-0 text-gray-300 hover:text-white hover:bg-gray-900"
                            title="Zoom In (Ctrl +)"
                        >
                            <ZoomIn className="h-3 w-3" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleZoomReset}
                            className="h-7 w-7 p-0 text-gray-300 hover:text-white hover:bg-gray-900"
                            title="Reset Zoom (Ctrl 0)"
                        >
                            <RotateCw className="h-3 w-3" />
                        </Button>
                    </div>

                    <Separator orientation="vertical" className="h-6 bg-gray-700 mx-1" />
                    
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handlePrint}
                        className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-900"
                        title="Print (Ctrl+P)"
                    >
                        <Printer className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDownload}
                        className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-900"
                        title="Download"
                    >
                        <Download className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Form Viewer */}
            <div className="flex-1 relative overflow-hidden bg-gray-900">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                        <div className="text-center space-y-3">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                            <p className="text-white text-sm">Loading form...</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                        <div className="text-center p-6 max-w-md space-y-4">
                            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
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
                        src={previewUrl}
                        title={`Fullscreen: ${form.title}`}
                        className="w-full h-full border-0"
                        allow="fullscreen"
                        onLoad={handleIframeLoad}
                        onError={handleIframeError}
                    />
                ) : isImage ? (
                    <div className="w-full h-full flex items-center justify-center p-4">
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
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                        <div className="text-center p-8 max-w-md space-y-6">
                            <div className="inline-block p-6 rounded-full bg-gray-900">
                                <FileText className="h-16 w-16 text-gray-400" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-semibold text-white">{form.title}</h3>
                                <div className="flex flex-col items-center gap-1 text-gray-300">
                                    <span className="px-3 py-1 bg-gray-900 rounded-full text-sm">
                                        {form.file_name.split('.').pop()?.toUpperCase() || 'FILE'}
                                    </span>
                                    <span className="text-sm">{formatFileSize(form.file_size)}</span>
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
                                    className="w-full gap-2 border-gray-700 text-gray-300 hover:bg-gray-900 hover:text-white"
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
                    <span className="truncate max-w-[200px]" title={form.title}>
                        {form.title}
                    </span>
                    <Separator orientation="vertical" className="h-3 bg-gray-700" />
                    <span>Form ID: {form.id}</span>
                </div>
                <div className="flex items-center gap-4">
                    <span>Press ESC to exit fullscreen</span>
                    <Separator orientation="vertical" className="h-3 bg-gray-700" />
                    <span>Ctrl + +/- to zoom</span>
                </div>
            </div>
        </div>
    );
}

// ==================== HELPER FUNCTIONS ====================
function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDate(dateString?: string): string {
    if (!dateString) return 'Not set';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid date';
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        return 'Invalid date';
    }
}

function getStatusConfig(status: string, isActive: boolean, isFeatured: boolean) {
    if (!isActive) {
        return { 
            label: 'Unavailable', 
            color: 'text-red-600', 
            icon: XCircle, 
            bgColor: 'bg-red-50 border-red-200' 
        };
    }
    
    if (isFeatured) {
        return { 
            label: 'Popular', 
            color: 'text-purple-600', 
            icon: Star, 
            bgColor: 'bg-purple-50 border-purple-200' 
        };
    }
    
    return { 
        label: 'Available', 
        color: 'text-green-600', 
        icon: CheckCircle, 
        bgColor: 'bg-green-50 border-green-200' 
    };
}

function getFileIcon(fileType: string) {
    if (fileType.includes('pdf')) return FileType;
    if (fileType.includes('word') || fileType.includes('doc')) return FileText;
    if (fileType.includes('excel') || fileType.includes('sheet')) return BarChart3;
    if (fileType.includes('image')) return ImageIcon;
    return FileText;
}

function getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
        'Social Services': 'bg-purple-100 text-purple-800 border-purple-200',
        'Permits & Licenses': 'bg-blue-100 text-blue-800 border-blue-200',
        'Health & Medical': 'bg-red-100 text-red-800 border-red-200',
        'Education': 'bg-green-100 text-green-800 border-green-200',
        'Legal & Police': 'bg-indigo-100 text-indigo-800 border-indigo-200',
        'Employment': 'bg-amber-100 text-amber-800 border-amber-200',
        'Housing': 'bg-cyan-100 text-cyan-800 border-cyan-200',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
}

// ==================== MAIN COMPONENT ====================
export default function FormsShow({
    form,
    related_forms = [],
    permissions = {
        can_download: true,
        can_print: true,
        can_share: true,
    }
}: FormsShowProps) {
    const [activeTab, setActiveTab] = useState('details');
    const [isDownloading, setIsDownloading] = useState(false);
    const [isFullscreenViewerOpen, setIsFullscreenViewerOpen] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(100);
    const [isLoadingPdf, setIsLoadingPdf] = useState(false);
    const [pdfError, setPdfError] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const previewContainerRef = useRef<HTMLDivElement>(null);

    const isPdf = form.file_type.includes('pdf') || form.mime_type.includes('pdf');
    const isImage = form.mime_type?.startsWith('image/') || 
                   ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(form.file_name.split('.').pop()?.toLowerCase() || '');
    const FileIcon = getFileIcon(form.file_type);
    const statusConfig = getStatusConfig('', form.is_active, form.is_featured);

    // Generate preview URL
    const getPreviewUrl = () => {
        return `/storage/${form.file_path}`;
    };

    const previewUrl = getPreviewUrl();

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'F11') {
                e.preventDefault();
                handleFullscreen();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                handleFullscreen();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handlePdfLoadStart = useCallback(() => {
        setIsLoadingPdf(true);
        setPdfError(null);
    }, []);

    const handlePdfLoad = useCallback(() => {
        setIsLoadingPdf(false);
    }, []);

    const handlePdfError = useCallback(() => {
        setIsLoadingPdf(false);
        setPdfError('Failed to load form preview. Please try downloading the file instead.');
    }, []);

    // Handle download
    const handleDownload = () => {
        if (isDownloading) return;
        
        setIsDownloading(true);
        const downloadUrl = `/forms/${form.slug}/download`;
        window.open(downloadUrl, '_blank');
        
        setTimeout(() => setIsDownloading(false), 1000);
    };

    const handlePrint = () => {
        if (isPdf && previewUrl) {
            window.open(previewUrl, '_blank');
        } else {
            handleDownload();
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: form.title,
            text: form.description,
            url: window.location.href,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const copyFormLink = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('Form link copied to clipboard!');
    };

    const copyFormCode = () => {
        navigator.clipboard.writeText(form.slug);
        alert('Form code copied to clipboard!');
    };

    const handleFullscreen = () => {
        setIsFullscreenViewerOpen(true);
    };

    const openInNewTab = () => {
        window.open(previewUrl, '_blank');
    };

    // Get file type category
    const getFileTypeCategory = () => {
        if (form.file_type.includes('pdf')) return 'PDF Document';
        if (form.file_type.includes('word') || form.file_type.includes('doc')) return 'Word Document';
        if (form.file_type.includes('excel') || form.file_type.includes('sheet')) return 'Excel Spreadsheet';
        if (form.file_type.includes('image')) return 'Image File';
        return 'Document';
    };

    // Get file extension
    const getFileExtension = () => {
        return form.file_name.split('.').pop()?.toUpperCase() || 'FILE';
    };

    // Get agency icon
    const getAgencyIcon = () => {
        if (form.issuing_agency.includes('Mayor')) return <Building2 className="h-5 w-5" />;
        if (form.issuing_agency.includes('DSWD')) return <Users className="h-5 w-5" />;
        if (form.issuing_agency.includes('PNP') || form.issuing_agency.includes('Police')) return <Shield className="h-5 w-5" />;
        if (form.issuing_agency.includes('Health')) return <AlertTriangle className="h-5 w-5" />;
        return <Building className="h-5 w-5" />;
    };

    // Get visibility badge
    const getVisibilityBadge = () => {
        if (form.requires_login) {
            return (
                <Badge variant="outline" className="flex items-center gap-1 bg-amber-50 text-amber-700 border-amber-200">
                    <Lock className="h-3 w-3" />
                    Login Required
                </Badge>
            );
        }
        
        return (
            <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
                <Globe className="h-3 w-3" />
                Public Access
            </Badge>
        );
    };

    // Render preview
    const renderPreview = () => {
        return isPdf ? (
            <div className="relative border rounded-lg overflow-hidden bg-gray-50 h-[500px]">
                {isLoadingPdf && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50/90 z-10">
                        <div className="text-center space-y-3">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
                            <p className="text-gray-600 font-medium text-base">Loading form preview...</p>
                        </div>
                    </div>
                )}
                
                {pdfError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50/90 z-10">
                        <div className="text-center p-6 max-w-md space-y-4">
                            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Preview Unavailable</h3>
                                <p className="text-gray-600 text-base">{pdfError}</p>
                            </div>
                            {permissions.can_download && (
                                <Button onClick={handleDownload} className="gap-2 text-base">
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
                    className="w-full h-full"
                    onLoad={handlePdfLoad}
                    onLoadStart={handlePdfLoadStart}
                    onError={handlePdfError}
                />
            </div>
        ) : isImage ? (
            <div className="border rounded-lg overflow-hidden bg-gray-50">
                <img 
                    src={previewUrl}
                    alt={form.title}
                    className="w-full h-auto max-h-[400px] object-contain mx-auto"
                    loading="lazy"
                />
            </div>
        ) : (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                <div className="inline-block p-4 rounded-full bg-white border-4 border-gray-100 mb-4">
                    <FileIcon className="h-16 w-16 text-gray-400" />
                </div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">{form.file_name}</h3>
                <div className="flex flex-col items-center gap-1 text-sm text-gray-600 mb-6">
                    <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                        {getFileExtension()}
                    </span>
                    <span className="text-sm">{formatFileSize(form.file_size)}</span>
                    {form.view_count > 0 && (
                        <span className="flex items-center gap-1 text-sm">
                            <Eye className="h-4 w-4" />
                            {form.view_count} views
                        </span>
                    )}
                </div>
                {permissions.can_download && (
                    <Button 
                        onClick={handleDownload}
                        disabled={isDownloading}
                        size="lg"
                        className="gap-2 text-base"
                    >
                        <Download className="h-5 w-5" />
                        {isDownloading ? 'Downloading...' : 'Download Form'}
                    </Button>
                )}
            </div>
        );
    };

    return (
        <>
            {/* Fullscreen Viewer */}
            <FullScreenFormViewer
                form={form}
                previewUrl={previewUrl}
                isOpen={isFullscreenViewerOpen}
                onClose={() => setIsFullscreenViewerOpen(false)}
            />

            <ResidentLayout
                title={`${form.title} - Form`}
                breadcrumbs={[
                    { title: 'Dashboard', href: '/dashboard' },
                    { title: 'Forms', href: '/forms' },
                    { title: form.title, href: `/forms/${form.slug}` }
                ]}
            >
                <div className="space-y-4 md:space-y-6">
                    {/* Header with Actions */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <Link href="/forms">
                                <Button variant="outline" size="sm" className="h-8 gap-2">
                                    <ArrowLeft className="h-3 w-3" />
                                    <span className="hidden sm:inline">Back to Forms</span>
                                </Button>
                            </Link>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={handleFullscreen}
                                    className="h-8 gap-2 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                                >
                                    <Maximize2 className="h-3 w-3" />
                                    Fullscreen
                                    <kbd className="ml-2 text-xs bg-white border border-blue-300 rounded px-1 py-0.5">
                                        F11
                                    </kbd>
                                </Button>
                                
                                {permissions.can_download && (
                                    <Button
                                        onClick={handleDownload}
                                        disabled={isDownloading || !form.is_active}
                                        size="sm"
                                        className="h-8 px-2 sm:px-3"
                                    >
                                        {isDownloading ? (
                                            <Loader2 className="h-3 w-3 sm:mr-1 animate-spin" />
                                        ) : (
                                            <Download className="h-3 w-3 sm:mr-1" />
                                        )}
                                        <span className="hidden sm:inline">Download</span>
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-xl md:text-2xl font-bold tracking-tight truncate flex-1 min-w-0">
                                    {form.title}
                                </h1>
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border",
                                        statusConfig.bgColor,
                                        statusConfig.color
                                    )}>
                                        {(() => {
                                            const Icon = statusConfig.icon;
                                            return <Icon className="h-3 w-3" />;
                                        })()}
                                        {statusConfig.label}
                                    </div>
                                    {getVisibilityBadge()}
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-2">
                                {form.description}
                            </p>
                        </div>
                    </div>

                    {/* Status Banners */}
                    {!form.is_active && (
                        <Alert className="border-l-4 border-l-amber-500 bg-amber-50">
                            <EyeOff className="h-4 w-4 text-amber-600" />
                            <AlertTitle className="text-sm font-medium text-amber-800">
                                Form Currently Unavailable
                            </AlertTitle>
                            <AlertDescription className="text-sm text-amber-700">
                                This form is temporarily unavailable for download.
                            </AlertDescription>
                        </Alert>
                    )}

                    {form.requires_login && (
                        <Alert className="border-l-4 border-l-blue-500 bg-blue-50">
                            <Lock className="h-4 w-4 text-blue-600" />
                            <AlertTitle className="text-sm font-medium text-blue-800">
                                Login Required
                            </AlertTitle>
                            <AlertDescription className="text-sm text-blue-700">
                                You must be logged in to download this form.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Main Content */}
                    <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
                        {/* Left Column - Form Details with Tabs */}
                        <div className="lg:col-span-2 space-y-4 md:space-y-6">
                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="details">Details</TabsTrigger>
                                    <TabsTrigger value="preview">Preview</TabsTrigger>
                                    <TabsTrigger value="related">Related</TabsTrigger>
                                </TabsList>

                                {/* Details Tab */}
                                <TabsContent value="details" className="space-y-4 md:space-y-6">
                                    <Card>
                                        <CardHeader className="p-4 md:p-6">
                                            <CardTitle className="text-base md:text-lg flex items-center gap-2">
                                                <FileText className="h-4 w-4 md:h-5 md:w-5" />
                                                Form Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-4 md:p-6 pt-0 space-y-4">
                                            <div className="space-y-1">
                                                <p className="text-xs md:text-sm font-medium text-gray-500">Description</p>
                                                <p className="text-gray-700 whitespace-pre-wrap text-sm md:text-base">
                                                    {form.description || 'No description provided.'}
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                                <div className="space-y-1">
                                                    <p className="text-xs md:text-sm font-medium text-gray-500">Category</p>
                                                    <Badge variant="outline" className={getCategoryColor(form.category)}>
                                                        {form.category}
                                                    </Badge>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs md:text-sm font-medium text-gray-500">Issuing Agency</p>
                                                    <div className="flex items-center gap-2">
                                                        {getAgencyIcon()}
                                                        <span className="text-sm">{form.issuing_agency}</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs md:text-sm font-medium text-gray-500">Language</p>
                                                    <p className="text-sm">{form.language || 'English'}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs md:text-sm font-medium text-gray-500">Version</p>
                                                    <p className="text-sm">{form.version || 'Latest'}</p>
                                                </div>
                                            </div>

                                            {form.tags && form.tags.length > 0 && (
                                                <div className="space-y-2">
                                                    <p className="text-xs md:text-sm font-medium text-gray-500">Tags</p>
                                                    <div className="flex flex-wrap gap-1 md:gap-2">
                                                        {form.tags.map((tag, index) => (
                                                            <Badge key={index} variant="secondary" className="text-xs">
                                                                <Tag className="h-2 w-2 md:h-3 md:w-3 mr-1" />
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {form.valid_from && form.valid_until && (
                                                <div className="space-y-2 pt-2 border-t">
                                                    <p className="text-xs md:text-sm font-medium text-gray-500">Validity Period</p>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                                        <div className="space-y-1">
                                                            <p className="text-xs text-gray-500">Valid From</p>
                                                            <p className="text-sm flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                {formatDate(form.valid_from)}
                                                            </p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-xs text-gray-500">Valid Until</p>
                                                            <p className="text-sm flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                {formatDate(form.valid_until)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* File Information */}
                                    <Card>
                                        <CardHeader className="p-4 md:p-6">
                                            <CardTitle className="text-base md:text-lg flex items-center gap-2">
                                                {<FileIcon className="h-5 w-5 text-blue-500" />}
                                                File Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-4 md:p-6 pt-0">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                                <div className="space-y-1">
                                                    <p className="text-xs md:text-sm font-medium text-gray-500">File Name</p>
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="h-3 w-3 md:h-4 md:w-4 text-gray-400" />
                                                        <span className="text-sm font-mono truncate">{form.file_name}</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs md:text-sm font-medium text-gray-500">File Type</p>
                                                    <p className="text-sm">{getFileTypeCategory()}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs md:text-sm font-medium text-gray-500">File Size</p>
                                                    <p className="text-sm">{formatFileSize(form.file_size)}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs md:text-sm font-medium text-gray-500">File Extension</p>
                                                    <Badge variant="outline" className="font-mono text-xs">
                                                        {getFileExtension()}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Preview Tab */}
                                <TabsContent value="preview">
                                    <Card>
                                        <CardHeader className="p-4 md:p-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <CardTitle className="text-base md:text-lg flex items-center gap-2">
                                                        <Eye className="h-4 w-4 md:h-5 md:w-5" />
                                                        Form Preview
                                                    </CardTitle>
                                                    <CardDescription className="text-xs md:text-sm">
                                                        {isPdf && 'PDF Document - Scroll to view pages'}
                                                        {isImage && 'Image - Click to zoom'}
                                                        {!isPdf && !isImage && 'Document - Download to view'}
                                                    </CardDescription>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {isPdf && (
                                                        <div className="flex items-center gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => setZoomLevel(prev => Math.max(prev - 25, 50))}
                                                                disabled={zoomLevel <= 50}
                                                                className="h-8 w-8 p-0"
                                                            >
                                                                <ZoomOut className="h-3 w-3" />
                                                            </Button>
                                                            <span className="text-sm font-medium px-2">{zoomLevel}%</span>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => setZoomLevel(prev => Math.min(prev + 25, 200))}
                                                                disabled={zoomLevel >= 200}
                                                                className="h-8 w-8 p-0"
                                                            >
                                                                <ZoomIn className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={handleFullscreen}
                                                        className="h-8"
                                                    >
                                                        <Maximize2 className="h-3 w-3" />
                                                        Fullscreen
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={openInNewTab}
                                                        className="h-8"
                                                    >
                                                        <ExternalLink className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            <div 
                                                ref={previewContainerRef}
                                                className="relative w-full min-h-[500px] overflow-hidden bg-gray-100"
                                            >
                                                {renderPreview()}
                                            </div>

                                            <div className="p-4 md:p-6 border-t">
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                                                        <p className="text-xs font-medium text-gray-500">MIME Type</p>
                                                        <p className="text-sm font-mono text-xs">{form.mime_type || form.file_type}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-medium text-gray-500">Pages</p>
                                                        <p className="text-sm">{form.pages || 'N/A'}</p>
                                                    </div>
                                                </div>

                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    {permissions.can_download && (
                                                        <Button
                                                            onClick={handleDownload}
                                                            disabled={isDownloading}
                                                            size="sm"
                                                        >
                                                            {isDownloading ? (
                                                                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                                                            ) : (
                                                                <Download className="h-3 w-3 mr-2" />
                                                            )}
                                                            Download Original
                                                        </Button>
                                                    )}
                                                    {isPdf && (
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            onClick={openInNewTab}
                                                        >
                                                            <ExternalLink className="h-3 w-3 mr-2" />
                                                            Open in New Tab
                                                        </Button>
                                                    )}
                                                    {permissions.can_print && form.is_active && (
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            onClick={handlePrint}
                                                        >
                                                            <Printer className="h-3 w-3 mr-2" />
                                                            Print
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Related Forms Tab */}
                                <TabsContent value="related">
                                    <Card>
                                        <CardHeader className="p-4 md:p-6">
                                            <CardTitle className="text-base md:text-lg flex items-center gap-2">
                                                <FolderOpen className="h-4 w-4 md:h-5 md:w-5" />
                                                Related Forms
                                            </CardTitle>
                                            <CardDescription className="text-xs md:text-sm">
                                                Other forms you might be interested in
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-4 md:p-6 pt-0">
                                            {related_forms.length > 0 ? (
                                                <div className="space-y-2 md:space-y-3">
                                                    {related_forms.map((related) => {
                                                        const RelatedFileIcon = getFileIcon(related.file_type);
                                                        return (
                                                            <Link 
                                                                key={related.id} 
                                                                href={`/forms/${related.slug}`}
                                                                className="block"
                                                            >
                                                                <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors group">
                                                                    <div className="flex-shrink-0">
                                                                        <RelatedFileIcon className="h-5 w-5 text-gray-600" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="font-medium text-sm md:text-base truncate">{related.title}</p>
                                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs md:text-sm text-gray-500">
                                                                            <Badge variant="outline" className={`${getCategoryColor(related.category)} text-xs w-fit`}>
                                                                                {related.category}
                                                                            </Badge>
                                                                            <div className="flex items-center gap-2">
                                                                                <span>{formatFileSize(related.file_size)}</span>
                                                                                <span className="hidden sm:inline">•</span>
                                                                                <span>{related.download_count} downloads</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                                                                </div>
                                                            </Link>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="text-center py-6 md:py-8">
                                                    <FolderOpen className="h-10 w-10 md:h-12 md:w-12 mx-auto text-gray-400" />
                                                    <h3 className="mt-3 text-base md:text-lg font-semibold">No Related Forms</h3>
                                                    <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                                                        No related forms found for this category.
                                                    </p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>

                        {/* Right Column - Status & Actions */}
                        <div className="space-y-4 md:space-y-6">
                            {/* File Summary */}
                            <Card>
                                <CardHeader className="p-4 md:p-6">
                                    <CardTitle className="text-sm md:text-base flex items-center gap-2">
                                        {<FileIcon className="h-5 w-5 text-blue-500" />}
                                        Form Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 md:p-6 pt-0 space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-gray-500">File Size</p>
                                            <p className="font-semibold text-sm md:text-base">{formatFileSize(form.file_size)}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-gray-500">Type</p>
                                            <p className="font-semibold text-sm md:text-base">
                                                {isPdf && 'PDF'}
                                                {isImage && 'Image'}
                                                {!isPdf && !isImage && 'Document'}
                                            </p>
                                        </div>
                                    </div>
                                    <Separator />
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-gray-500">Category</p>
                                        <p className="text-sm">{form.category}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-gray-500">Agency</p>
                                        <p className="text-sm">{form.issuing_agency}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-gray-500">Updated</p>
                                        <p className="text-sm">{formatDate(form.updated_at)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-gray-500">Views</p>
                                        <p className="text-sm">{form.view_count}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-gray-500">Downloads</p>
                                        <p className="text-sm">{form.download_count}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            <Card>
                                <CardHeader className="p-4 md:p-6">
                                    <CardTitle className="text-sm md:text-base flex items-center gap-2">
                                        <FileCheck className="h-4 w-4 md:h-5 md:w-5" />
                                        Quick Actions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 md:p-6 pt-0 space-y-3">
                                    {permissions.can_download && (
                                        <Button 
                                            className="w-full justify-start text-sm" 
                                            onClick={handleDownload}
                                            disabled={isDownloading || !form.is_active}
                                            size="sm"
                                        >
                                            {isDownloading ? (
                                                <Loader2 className="h-3 w-3 md:h-4 md:w-4 mr-2 animate-spin" />
                                            ) : (
                                                <Download className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                                            )}
                                            {form.is_active ? 'Download Form' : 'Unavailable'}
                                        </Button>
                                    )}

                                    <Button 
                                        variant="outline" 
                                        className="w-full justify-start text-sm"
                                        onClick={() => setActiveTab('preview')}
                                        size="sm"
                                    >
                                        <Eye className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                                        View Preview
                                    </Button>

                                    <Button 
                                        variant="outline" 
                                        className="w-full justify-start text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                                        onClick={handleFullscreen}
                                        size="sm"
                                    >
                                        <Maximize2 className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                                        Fullscreen View
                                    </Button>

                                    {permissions.can_print && form.is_active && (
                                        <Button 
                                            variant="outline" 
                                            className="w-full justify-start text-sm"
                                            onClick={handlePrint}
                                            size="sm"
                                        >
                                            <Printer className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                                            Print Form
                                        </Button>
                                    )}

                                    {permissions.can_share && (
                                        <Button 
                                            variant="outline" 
                                            className="w-full justify-start text-sm"
                                            onClick={handleShare}
                                            size="sm"
                                        >
                                            <Share2 className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                                            Share Form
                                        </Button>
                                    )}

                                    <Separator />

                                    <div className="grid grid-cols-2 gap-2">
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            className="text-xs"
                                            onClick={copyFormLink}
                                        >
                                            <Copy className="h-3 w-3 mr-1 md:mr-2" />
                                            <span className="truncate">Copy Link</span>
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            className="text-xs"
                                            onClick={copyFormCode}
                                        >
                                            <FileCode className="h-3 w-3 mr-1 md:mr-2" />
                                            <span className="truncate">Copy Code</span>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Instructions */}
                            <Card>
                                <CardHeader className="p-4 md:p-6">
                                    <CardTitle className="text-sm md:text-base flex items-center gap-2">
                                        <Info className="h-4 w-4 md:h-5 md:w-5" />
                                        Instructions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 md:p-6 pt-0">
                                    <div className="space-y-2 text-xs md:text-sm">
                                        <p className="font-medium text-gray-700">How to use this form:</p>
                                        <ol className="list-decimal pl-4 space-y-1 text-gray-600">
                                            <li>Click "Download" to save the file</li>
                                            <li>Open with:
                                                <ul className="list-disc pl-4 mt-1 space-y-0.5">
                                                    {isPdf && <li>Adobe Reader or any PDF viewer</li>}
                                                    {form.file_type.includes('word') && <li>Microsoft Word or Google Docs</li>}
                                                    {form.file_type.includes('excel') && <li>Microsoft Excel or Google Sheets</li>}
                                                    {isImage && <li>Any image viewer</li>}
                                                </ul>
                                            </li>
                                            <li>Print or fill digitally</li>
                                            <li>Submit to {form.issuing_agency}</li>
                                        </ol>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </ResidentLayout>
        </>
    );
}

function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(' ');
}