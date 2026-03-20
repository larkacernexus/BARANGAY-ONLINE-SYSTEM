import ResidentLayout from '@/layouts/resident-app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
    FileText,
    Download,
    Eye,
    Calendar,
    User,
    Clock,
    Lock,
    Globe,
    Shield,
    AlertCircle,
    ArrowLeft,
    Printer,
    Copy,
    File,
    Folder,
    CheckCircle,
    XCircle,
    ArrowRight,
    ChevronLeft,
    Tag,
    X,
    ExternalLink,
    Maximize2,
    RotateCw,
    ZoomIn,
    ZoomOut,
    RefreshCw,
    EyeOff,
    MoreVertical,
    Info,
    ChevronDown,
    ChevronUp,
    Link2,
    HardDrive,
    Fingerprint,
    FileLock,
    History,
    Scan,
    ShieldAlert,
    Timer,
    Video,
    Volume2,
    Home,
    Bell,
    Menu,
    Sparkles,
    Smartphone,
    Wifi,
    WifiOff,
    Cloud,
    CloudOff,
    QrCode,
    BarChart3,
    PieChart,
    TrendingUp,
    Activity,
    Settings,
    Palette,
    PenTool,
    Move,
    Scale,
    VolumeX,
    Mic,
    MicOff,
    Camera,
    CameraOff,
    VideoOff,
    Heart,
    Star,
    Bookmark,
    Share,
    Mail,
    Database,
    Key,
    ShieldCheck,
    ShieldQuestion,
    Verified,
    BadgeCheck,
    Clock3,
    Fingerprint as FingerprintIcon,
    FileLock as FileLockIcon,
    History as HistoryIcon,
    Scan as ScanIcon,
    Zap,
    ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Import from reusable UI library
import { formatDate, formatDateTime, formatFileSize } from '@/components/residentui/lib/resident-ui-utils';
import { useMobileDetect } from '@/components/residentui/hooks/useResidentUI';
import { ModernCard } from '@/components/residentui/modern-card';
import { ModernEmptyState } from '@/components/residentui/modern-empty-state';
import { ModernLoadingOverlay } from '@/components/residentui/modern-loading-overlay';
import { DOCUMENT_STATUS_CONFIG, FILE_TYPE_CONFIG,  } from '@/components/residentui/constants/document-ui';

// Interfaces
interface Document {
    id: number;
    name: string;
    file_name?: string;
    file_extension?: string;
    file_size?: number;
    file_size_human?: string;
    mime_type?: string;
    description?: string;
    reference_number?: string;
    issue_date?: string;
    expiry_date?: string;
    view_count?: number;
    download_count?: number;
    is_public?: boolean;
    requires_password: boolean;
    password?: string;
    status?: string;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string;
    resident?: {
        id: number;
        first_name: string;
        last_name: string;
    };
    category?: {
        id: number;
        name: string;
        icon: string;
        color: string;
    };
    document_type?: {
        id: number;
        name: string;
        code: string;
    };
    file_path?: string;
    metadata?: Record<string, any> | null;
    tags?: string[];
    uploaded_by?: number;
    uploaded_at?: string;
    uploaded_by_user?: {
        id: number;
        name: string;
        email: string;
    };
    preview_url?: string;
    security_options?: SecurityOptions;
}

interface SecurityOptions {
    add_watermark?: boolean;
    enable_encryption?: boolean;
    audit_log_access?: boolean;
    scan_quality?: 'low' | 'medium' | 'high' | 'original';
    restrict_download?: boolean;
    restrict_print?: boolean;
    max_downloads?: number;
    expiration_days?: number;
    ip_restriction?: string[];
    [key: string]: any;
}

interface RelatedDocument {
    id: number;
    name: string;
    file_extension?: string;
    file_size_human?: string;
    created_at?: string;
    category?: {
        name: string;
    };
    requires_password?: boolean;
}

interface PageProps {
    document: Document;
    relatedDocuments?: RelatedDocument[];
    canDownload?: boolean;
    canDelete?: boolean;
    error?: string;
    needsPassword?: boolean;
    sessionExpiry?: string;
    sessionData?: any;
    debugMode?: boolean;
}

// Helper functions
const getDocumentStatus = (doc: Document): string => {
    if (doc.status) return doc.status;
    if (doc.expiry_date && new Date(doc.expiry_date) < new Date()) {
        return 'expired';
    }
    return 'active';
};

const getFileIcon = (extension: string = '') => {
    const config = FILE_TYPE_CONFIG[extension.toLowerCase() as keyof typeof FILE_TYPE_CONFIG];
    return config?.icon || File;
};

const getFileColor = (extension: string = ''): string => {
    const config = FILE_TYPE_CONFIG[extension.toLowerCase() as keyof typeof FILE_TYPE_CONFIG];
    return config?.color || 'text-gray-600 bg-gray-50 dark:bg-gray-900 dark:text-gray-400';
};

// ==================== MODERN FULLSCREEN VIEWER ====================
function ModernFullScreenViewer({
    document,
    previewUrl,
    isOpen,
    onClose,
}: {
    document: Document;
    previewUrl: string;
    isOpen: boolean;
    onClose: () => void;
}) {
    const [zoom, setZoom] = useState(100);
    const [rotation, setRotation] = useState(0);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'view' | 'info'>('view');
    
    const safeFileExtension = document.file_extension || '';
    const isPdf = safeFileExtension.toLowerCase() === 'pdf' || 
                  document.mime_type?.includes('pdf') || 
                  previewUrl.includes('.pdf');
    const isImage = document.mime_type?.startsWith('image/') || 
                    ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(safeFileExtension.toLowerCase());
    const FileIcon = getFileIcon(safeFileExtension);
    const fileColor = getFileColor(safeFileExtension);

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
                    setZoom(prev => Math.min(prev + 25, 300));
                } else if (e.key === '-') {
                    e.preventDefault();
                    setZoom(prev => Math.max(prev - 25, 25));
                } else if (e.key === '0') {
                    e.preventDefault();
                    setZoom(100);
                    setRotation(0);
                } else if (e.key === 'r') {
                    e.preventDefault();
                    setRotation(prev => (prev + 90) % 360);
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
        setError('Unable to load document preview');
    };

    const handleDownload = () => {
        window.open(`/my-records/${document.id}/download`, '_blank');
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex flex-col bg-black"
        >
            {/* Modern Toolbar */}
            <div className="flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur-xl border-b border-white/10 text-white">
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
                        <div className={cn("p-2 rounded-xl", fileColor)}>
                            <FileIcon className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-white line-clamp-1 max-w-[300px]">
                                {document.name}
                            </h2>
                            <div className="flex items-center gap-2 text-xs text-white/50">
                                <span>{safeFileExtension?.toUpperCase() || 'DOC'}</span>
                                <span>•</span>
                                <span>{document.file_size_human || formatFileSize(document.file_size || 0)}</span>
                                <span>•</span>
                                <span>{isPdf ? 'PDF Document' : isImage ? 'Image' : 'File'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    {/* Zoom Controls */}
                    <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 mr-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setZoom(prev => Math.max(prev - 25, 25))}
                            disabled={zoom <= 25}
                            className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                        >
                            <ZoomOut className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium px-2 min-w-[45px] text-center text-white">
                            {zoom}%
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setZoom(prev => Math.min(prev + 25, 300))}
                            disabled={zoom >= 300}
                            className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                        >
                            <ZoomIn className="h-4 w-4" />
                        </Button>
                    </div>

                    {isImage && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setRotation(prev => (prev + 90) % 360)}
                            className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                            title="Rotate (Ctrl+R)"
                        >
                            <RotateCw className="h-4 w-4" />
                        </Button>
                    )}

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setZoom(100)}
                        className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                        title="Reset (Ctrl+0)"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </Button>

                    <Separator orientation="vertical" className="h-6 bg-white/10 mx-2" />

                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mr-2">
                        <TabsList className="bg-white/5 h-8">
                            <TabsTrigger value="view" className="text-xs px-3 data-[state=active]:bg-white/20">
                                View
                            </TabsTrigger>
                            <TabsTrigger value="info" className="text-xs px-3 data-[state=active]:bg-white/20">
                                Info
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

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

            {/* Document Viewer */}
            <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-gray-950 to-gray-900">
                <AnimatePresence mode="wait">
                    {activeTab === 'view' ? (
                        <motion.div
                            key="view"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full h-full"
                        >
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute inset-0 flex items-center justify-center bg-gray-950/50 backdrop-blur-sm z-10"
                                >
                                    <div className="text-center space-y-4">
                                        <div className="relative">
                                            <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <FileText className="h-6 w-6 text-white/50" />
                                            </div>
                                        </div>
                                        <p className="text-white/70 text-sm">Loading document...</p>
                                    </div>
                                </motion.div>
                            )}

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="absolute inset-0 flex items-center justify-center"
                                >
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
                                </motion.div>
                            )}

                            {isPdf ? (
                                <iframe
                                    ref={iframeRef}
                                    src={previewUrl}
                                    title={`Fullscreen: ${document.name}`}
                                    className="w-full h-full border-0"
                                    style={{
                                        transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                                        transformOrigin: 'center',
                                        width: `${10000 / zoom}%`,
                                        height: `${10000 / zoom}%`,
                                    }}
                                    onLoad={handleIframeLoad}
                                    onError={handleIframeError}
                                />
                            ) : isImage ? (
                                <div className="w-full h-full flex items-center justify-center p-8">
                                    <motion.img
                                        src={previewUrl}
                                        alt={document.name}
                                        className="max-w-full max-h-full object-contain"
                                        style={{
                                            transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                                            transformOrigin: 'center center',
                                        }}
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
                                        <div className={cn(
                                            "w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6",
                                            fileColor
                                        )}>
                                            <FileIcon className="h-12 w-12" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-white mb-2">{document.name}</h3>
                                        <p className="text-white/50 text-sm mb-6">
                                            This file type cannot be previewed directly.
                                        </p>
                                        <Button onClick={handleDownload} size="lg" className="gap-2">
                                            <Download className="h-5 w-5" />
                                            Download File
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="info"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="w-full h-full overflow-auto p-8"
                        >
                            <div className="max-w-2xl mx-auto space-y-6">
                                <ModernCard
                                    title="Document Information"
                                    icon={Info}
                                    iconColor="from-blue-500 to-indigo-500"
                                    className="bg-white/5 backdrop-blur-sm border-white/10"
                                >
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 rounded-xl bg-white/5">
                                                <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Reference</p>
                                                <p className="text-sm text-white font-mono">{document.reference_number || '—'}</p>
                                            </div>
                                            <div className="p-4 rounded-xl bg-white/5">
                                                <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Type</p>
                                                <p className="text-sm text-white">{document.document_type?.name || document.category?.name || '—'}</p>
                                            </div>
                                        </div>
                                        
                                        <Separator className="bg-white/10" />
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 rounded-xl bg-white/5">
                                                <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Created</p>
                                                <p className="text-sm text-white">{formatDateTime(document.created_at)}</p>
                                            </div>
                                            <div className="p-4 rounded-xl bg-white/5">
                                                <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Modified</p>
                                                <p className="text-sm text-white">{formatDateTime(document.updated_at)}</p>
                                            </div>
                                        </div>

                                        {document.description && (
                                            <>
                                                <Separator className="bg-white/10" />
                                                <div className="p-4 rounded-xl bg-white/5">
                                                    <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Description</p>
                                                    <p className="text-sm text-white/80 whitespace-pre-line">{document.description}</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </ModernCard>

                                <ModernCard
                                    title="Statistics"
                                    icon={BarChart3}
                                    iconColor="from-purple-500 to-pink-500"
                                    className="bg-white/5 backdrop-blur-sm border-white/10"
                                >
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="text-center p-4 bg-white/5 rounded-xl">
                                            <Eye className="h-5 w-5 text-blue-400 mx-auto mb-2" />
                                            <div className="text-2xl font-bold text-white">{document.view_count || 0}</div>
                                            <p className="text-xs text-white/40">Views</p>
                                        </div>
                                        <div className="text-center p-4 bg-white/5 rounded-xl">
                                            <Download className="h-5 w-5 text-emerald-400 mx-auto mb-2" />
                                            <div className="text-2xl font-bold text-white">{document.download_count || 0}</div>
                                            <p className="text-xs text-white/40">Downloads</p>
                                        </div>
                                        <div className="text-center p-4 bg-white/5 rounded-xl">
                                            <HardDrive className="h-5 w-5 text-purple-400 mx-auto mb-2" />
                                            <div className="text-2xl font-bold text-white">{document.file_size_human || formatFileSize(document.file_size || 0)}</div>
                                            <p className="text-xs text-white/40">Size</p>
                                        </div>
                                    </div>
                                </ModernCard>

                                <ModernCard
                                    title="Security"
                                    icon={Shield}
                                    iconColor="from-amber-500 to-orange-500"
                                    className="bg-white/5 backdrop-blur-sm border-white/10"
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                                            <span className="text-sm text-white/60">Password Protected</span>
                                            {document.requires_password ? (
                                                <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-400">
                                                    <Lock className="h-3 w-3 mr-1" />
                                                    Yes
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                                                    <Shield className="h-3 w-3 mr-1" />
                                                    No
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                                            <span className="text-sm text-white/60">Access Level</span>
                                            <Badge variant="outline" className={cn(
                                                document.is_public 
                                                    ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
                                                    : "border-gray-500/30 bg-gray-500/10 text-gray-400"
                                            )}>
                                                {document.is_public ? (
                                                    <>
                                                        <Globe className="h-3 w-3 mr-1" />
                                                        Public
                                                    </>
                                                ) : (
                                                    <>
                                                        <Lock className="h-3 w-3 mr-1" />
                                                        Private
                                                    </>
                                                )}
                                            </Badge>
                                        </div>
                                    </div>
                                </ModernCard>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-black/50 backdrop-blur-sm border-t border-white/5 text-xs text-white/40">
                <div className="flex items-center gap-4">
                    <span className="truncate max-w-[300px]">{document.name}</span>
                    {document.reference_number && (
                        <>
                            <Separator orientation="vertical" className="h-3 bg-white/10" />
                            <span>Ref: {document.reference_number}</span>
                        </>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <span>ESC to exit</span>
                    <Separator orientation="vertical" className="h-3 bg-white/10" />
                    <span>Ctrl +/- zoom</span>
                    {isImage && (
                        <>
                            <Separator orientation="vertical" className="h-3 bg-white/10" />
                            <span>Ctrl+R rotate</span>
                        </>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

// ==================== MODERN PASSWORD FORM ====================
function ModernPasswordForm({ document, error, onSubmit, isVerifying }: {
    document: Document;
    error?: string;
    onSubmit: (e: React.FormEvent) => void;
    isVerifying: boolean;
}) {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="min-h-[80vh] flex items-center justify-center px-4 py-8"
        >
            <ModernCard
                title="Protected Document"
                description={`Enter the password to access "${document.name}"`}
                icon={Lock}
                iconColor="from-blue-500 to-indigo-600"
                className="w-full max-w-md"
            >
                {error && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <Alert variant="destructive" className="border-rose-200 bg-rose-50 dark:bg-rose-950/20 dark:border-rose-900">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle className="text-sm font-medium">Access Denied</AlertTitle>
                            <AlertDescription className="text-sm">{error}</AlertDescription>
                        </Alert>
                    </motion.div>
                )}
                
                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 border border-blue-100 dark:border-blue-900">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                            <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">
                                Secure Access
                            </h4>
                            <p className="text-xs text-blue-700 dark:text-blue-400">
                                Your session will remain active for 30 minutes
                            </p>
                        </div>
                    </div>
                </div>
                
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Document Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full pl-10 pr-12 py-3 text-base border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                placeholder="Enter document password"
                                disabled={isVerifying}
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex gap-3 pt-2">
                        <Link href="/portal/my-records" className="flex-1">
                            <Button 
                                type="button" 
                                variant="outline" 
                                className="w-full border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 py-6"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <Button 
                            type="submit" 
                            disabled={isVerifying} 
                            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-6"
                        >
                            {isVerifying ? (
                                <>
                                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    <ArrowRight className="h-4 w-4 mr-2" />
                                    Access
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </ModernCard>
        </motion.div>
    );
}

// ==================== MODERN MOBILE COMPONENTS ====================
function ModernMobileHeader({ document, onFullscreen, onDownload, canDownload }: any) {
    const status = getDocumentStatus(document);
    const statusConfig = DOCUMENT_STATUS_CONFIG[status as keyof typeof DOCUMENT_STATUS_CONFIG] || DOCUMENT_STATUS_CONFIG.active;
    const StatusIcon = statusConfig.icon;
    const FileIcon = getFileIcon(document.file_extension || '');

    return (
        <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
            <div className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <Link href="/portal/my-records">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <div className={cn("p-1.5 rounded-xl", getFileColor(document.file_extension || ''))}>
                                <FileIcon className="h-4 w-4" />
                            </div>
                            <h1 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                                {document.name}
                            </h1>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-[10px] h-5 px-1.5 gap-1 bg-gray-50 dark:bg-gray-900">
                                <Folder className="h-2.5 w-2.5" />
                                {document.category?.name || 'Uncategorized'}
                            </Badge>
                            <div className={cn(
                                "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium",
                                statusConfig.badge
                            )}>
                                <StatusIcon className="h-2.5 w-2.5" />
                                {statusConfig.label}
                            </div>
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" className="rounded-full">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={onFullscreen}>
                                <Maximize2 className="h-4 w-4 mr-2" />
                                Fullscreen
                            </DropdownMenuItem>
                            {canDownload && !document.security_options?.restrict_download && (
                                <DropdownMenuItem onClick={onDownload}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                </DropdownMenuItem>
                            )}
                            {!document.security_options?.restrict_print && (
                                <DropdownMenuItem onClick={() => window.print()}>
                                    <Printer className="h-4 w-4 mr-2" />
                                    Print
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
}

function ModernMobileStats({ document }: { document: Document }) {
    return (
        <div className="grid grid-cols-3 gap-2 p-4">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-4">
                <div className="absolute top-2 right-2 opacity-10">
                    <Eye className="h-12 w-12 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{document.view_count || 0}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Views</p>
            </div>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 p-4">
                <div className="absolute top-2 right-2 opacity-10">
                    <Download className="h-12 w-12 text-emerald-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{document.download_count || 0}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Downloads</p>
            </div>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-4">
                <div className="absolute top-2 right-2 opacity-10">
                    <HardDrive className="h-12 w-12 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white truncate">
                    {document.file_size_human || formatFileSize(document.file_size || 0)}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Size</p>
            </div>
        </div>
    );
}

function ModernMobilePreview({ document, previewUrl, onFullscreen }: any) {
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
                            <div className={cn(
                                "w-20 h-20 rounded-2xl flex items-center justify-center mb-4",
                                getFileColor(document.file_extension || '')
                            )}>
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

function ModernMobileDetails({ document }: { document: Document }) {
    const [isOpen, setIsOpen] = useState(false);
    const status = getDocumentStatus(document);
    const statusConfig = DOCUMENT_STATUS_CONFIG[status as keyof typeof DOCUMENT_STATUS_CONFIG] || DOCUMENT_STATUS_CONFIG.active;

    return (
        <div className="px-4">
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <ModernCard className="overflow-hidden">
                    <CollapsibleTrigger className="w-full">
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
                            <div className="flex items-center gap-2">
                                <Info className="h-5 w-5 text-blue-500" />
                                <span className="font-semibold text-gray-900 dark:text-white">Document Details</span>
                            </div>
                            <Button variant="ghost" size="sm" className="rounded-full">
                                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                        </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <div className="p-4 pt-0 space-y-4">
                            {/* Reference Number */}
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                    Reference Number
                                </p>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 font-mono text-sm bg-white dark:bg-gray-900 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                                        {document.reference_number || 'N/A'}
                                    </code>
                                    {document.reference_number && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => navigator.clipboard.writeText(document.reference_number!)}
                                            className="rounded-full"
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Owner */}
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                    Document Owner
                                </p>
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                                            {document.resident?.first_name?.[0]}{document.resident?.last_name?.[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {document.resident ? 
                                                `${document.resident.first_name} ${document.resident.last_name}` : 
                                                'Unknown Resident'}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Resident</p>
                                    </div>
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-3">
                                {document.issue_date && (
                                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Issue Date</p>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            <span className="font-medium text-sm">{formatDate(document.issue_date, 'short')}</span>
                                        </div>
                                    </div>
                                )}
                                {document.expiry_date && (
                                    <div className={cn(
                                        "rounded-xl p-4",
                                        status === 'expired' 
                                            ? 'bg-rose-50 dark:bg-rose-950/30' 
                                            : 'bg-gray-50 dark:bg-gray-900'
                                    )}>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Expiry Date</p>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-gray-400" />
                                            <span className={cn(
                                                "font-medium text-sm",
                                                status === 'expired' && "text-rose-600 dark:text-rose-400"
                                            )}>
                                                {formatDate(document.expiry_date, 'short')}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Upload Info */}
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                    Upload Information
                                </p>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Uploaded:</span>
                                        <span className="font-medium">{formatDateTime(document.created_at)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Last Modified:</span>
                                        <span className="font-medium">{formatDateTime(document.updated_at)}</span>
                                    </div>
                                    {document.uploaded_by_user && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Uploaded By:</span>
                                            <span className="font-medium truncate max-w-[150px]">
                                                {document.uploaded_by_user.name}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Tags */}
                            {document.tags && document.tags.length > 0 && (
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                        Tags
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {document.tags.map((tag, index) => (
                                            <Badge key={index} variant="secondary" className="gap-1">
                                                <Tag className="h-3 w-3" />
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CollapsibleContent>
                </ModernCard>
            </Collapsible>
        </div>
    );
}

function ModernMobileSecurity({ document }: { document: Document }) {
    const [isOpen, setIsOpen] = useState(false);
    const securityOptions = document.security_options || {};

    return (
        <div className="px-4">
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <ModernCard className="overflow-hidden">
                    <CollapsibleTrigger className="w-full">
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
                            <div className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-blue-500" />
                                <span className="font-semibold text-gray-900 dark:text-white">Security</span>
                            </div>
                            <Button variant="ghost" size="sm" className="rounded-full">
                                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                        </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <div className="p-4 pt-0 space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Lock className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm">Password Protected</span>
                                    </div>
                                    {document.requires_password ? (
                                        <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-600">
                                            Yes
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600">
                                            No
                                        </Badge>
                                    )}
                                </div>

                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Globe className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm">Access Level</span>
                                    </div>
                                    <Badge variant="outline" className={cn(
                                        document.is_public 
                                            ? "border-blue-500/30 bg-blue-500/10 text-blue-600"
                                            : "border-gray-500/30 bg-gray-500/10 text-gray-600"
                                    )}>
                                        {document.is_public ? 'Public' : 'Private'}
                                    </Badge>
                                </div>

                                {(securityOptions.add_watermark || securityOptions.enable_encryption) && (
                                    <>
                                        <div className="pt-2">
                                            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                                                Advanced Security
                                            </h4>
                                            <div className="space-y-2">
                                                {securityOptions.add_watermark && (
                                                    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                                        <Fingerprint className="h-4 w-4 text-blue-500" />
                                                        <span className="text-sm">Watermark Protection</span>
                                                    </div>
                                                )}
                                                {securityOptions.enable_encryption && (
                                                    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                                        <FileLock className="h-4 w-4 text-purple-500" />
                                                        <span className="text-sm">File Encryption</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {(securityOptions.restrict_download || securityOptions.restrict_print) && (
                                    <>
                                        <div className="pt-2">
                                            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                                                Restrictions
                                            </h4>
                                            <div className="space-y-2">
                                                {securityOptions.restrict_download && (
                                                    <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-950/30 rounded-lg text-rose-600 dark:text-rose-400">
                                                        <Download className="h-4 w-4" />
                                                        <span className="text-sm">Download Restricted</span>
                                                    </div>
                                                )}
                                                {securityOptions.restrict_print && (
                                                    <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-950/30 rounded-lg text-rose-600 dark:text-rose-400">
                                                        <Printer className="h-4 w-4" />
                                                        <span className="text-sm">Print Restricted</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </CollapsibleContent>
                </ModernCard>
            </Collapsible>
        </div>
    );
}

function ModernMobileRelated({ relatedDocuments }: { relatedDocuments: RelatedDocument[] }) {
    const [isOpen, setIsOpen] = useState(false);

    if (!relatedDocuments || relatedDocuments.length === 0) return null;

    return (
        <div className="px-4">
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <ModernCard className="overflow-hidden">
                    <CollapsibleTrigger className="w-full">
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
                            <div className="flex items-center gap-2">
                                <Link2 className="h-5 w-5 text-blue-500" />
                                <span className="font-semibold text-gray-900 dark:text-white">Related Documents</span>
                            </div>
                            <Button variant="ghost" size="sm" className="rounded-full">
                                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                        </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <div className="p-4 pt-0 space-y-2">
                            {relatedDocuments.map((doc) => {
                                const FileIcon = getFileIcon(doc.file_extension || '');
                                return (
                                    <Link
                                        key={doc.id}
                                        href={`/portal/my-records/${doc.id}`}
                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group"
                                    >
                                        <div className={cn("p-2 rounded-lg", getFileColor(doc.file_extension || ''))}>
                                            <FileIcon className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                                {doc.name}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                {doc.file_extension && (
                                                    <span>{doc.file_extension.toUpperCase()}</span>
                                                )}
                                                {doc.file_size_human && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{doc.file_size_human}</span>
                                                    </>
                                                )}
                                                {doc.requires_password && (
                                                    <Lock className="h-3 w-3 text-amber-500" />
                                                )}
                                            </div>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                                    </Link>
                                );
                            })}
                        </div>
                    </CollapsibleContent>
                </ModernCard>
            </Collapsible>
        </div>
    );
}

function ModernMobileBottomBar({ document, onDownload, onFullscreen, canDownload }: any) {
    const securityOptions = document.security_options || {};

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 safe-bottom">
            <div className="flex items-center justify-around py-3 px-4">
                {canDownload && !securityOptions.restrict_download && (
                    <Button
                        variant="ghost"
                        onClick={onDownload}
                        className="flex flex-col items-center gap-1 h-auto py-1 px-3"
                    >
                        <Download className="h-5 w-5" />
                        <span className="text-[10px]">Download</span>
                    </Button>
                )}
                
                <Button
                    variant="ghost"
                    onClick={onFullscreen}
                    className="flex flex-col items-center gap-1 h-auto py-1 px-3"
                >
                    <Maximize2 className="h-5 w-5" />
                    <span className="text-[10px]">Fullscreen</span>
                </Button>
                
                {!securityOptions.restrict_print && (
                    <Button
                        variant="ghost"
                        onClick={() => window.print()}
                        className="flex flex-col items-center gap-1 h-auto py-1 px-3"
                    >
                        <Printer className="h-5 w-5" />
                        <span className="text-[10px]">Print</span>
                    </Button>
                )}
                
                <Link href="/portal/my-records" className="flex flex-col items-center gap-1 py-1 px-3">
                    <Button variant="ghost" className="h-auto p-0 flex flex-col items-center gap-1">
                        <ArrowLeft className="h-5 w-5" />
                        <span className="text-[10px]">Back</span>
                    </Button>
                </Link>
            </div>
        </div>
    );
}

// ==================== MODERN DESKTOP COMPONENTS ====================
function ModernDesktopHeader({ document, onFullscreen, onDownload, canDownload, isDownloading }: any) {
    const status = getDocumentStatus(document);
    const statusConfig = DOCUMENT_STATUS_CONFIG[status as keyof typeof DOCUMENT_STATUS_CONFIG] || DOCUMENT_STATUS_CONFIG.active;
    const StatusIcon = statusConfig.icon;
    const FileIcon = getFileIcon(document.file_extension || '');

    return (
        <div className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
            <div className="px-8 py-6">
                <div className="flex items-start gap-4">
                    <Link href="/portal/my-records">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={cn("p-3 rounded-2xl", getFileColor(document.file_extension || ''))}>
                                <FileIcon className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    {document.name}
                                    {document.requires_password && (
                                        <Lock className="h-5 w-5 text-amber-500" />
                                    )}
                                </h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="gap-1.5 bg-gray-50 dark:bg-gray-900">
                                        <Folder className="h-3 w-3" />
                                        {document.category?.name || 'Uncategorized'}
                                    </Badge>
                                    <div className={cn(
                                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium",
                                        statusConfig.badge
                                    )}>
                                        <StatusIcon className="h-3 w-3" />
                                        {statusConfig.label}
                                    </div>
                                    {document.is_public && (
                                        <Badge variant="outline" className="gap-1.5 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400">
                                            <Globe className="h-3 w-3" />
                                            Public
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={onFullscreen}
                            className="gap-2 border-gray-200 dark:border-gray-800"
                        >
                            <Maximize2 className="h-4 w-4" />
                            Fullscreen
                        </Button>
                        
                        {canDownload && !document.security_options?.restrict_download && (
                            <Button
                                onClick={onDownload}
                                disabled={isDownloading}
                                className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                            >
                                {isDownloading ? (
                                    <>
                                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                        Downloading...
                                    </>
                                ) : (
                                    <>
                                        <Download className="h-4 w-4" />
                                        Download
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ModernDesktopStats({ document }: { document: Document }) {
    return (
        <div className="grid grid-cols-4 gap-4">
            <ModernCard className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                        <Eye className="h-5 w-5 text-blue-600" />
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">{document.view_count || 0}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Views</p>
                    <div className="mt-4 h-1 bg-blue-200 dark:bg-blue-900 rounded-full overflow-hidden">
                        <div className="h-full w-3/4 bg-blue-600 rounded-full" />
                    </div>
                </div>
            </ModernCard>

            <ModernCard className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                        <Download className="h-5 w-5 text-emerald-600" />
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">{document.download_count || 0}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Downloads</p>
                    <div className="mt-4 h-1 bg-emerald-200 dark:bg-emerald-900 rounded-full overflow-hidden">
                        <div className="h-full w-2/3 bg-emerald-600 rounded-full" />
                    </div>
                </div>
            </ModernCard>

            <ModernCard className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                        <HardDrive className="h-5 w-5 text-purple-600" />
                        <span className="text-3xl font-bold text-gray-900 dark:text-white truncate">
                            {document.file_size_human || formatFileSize(document.file_size || 0)}
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">File Size</p>
                    <div className="mt-4 h-1 bg-purple-200 dark:bg-purple-900 rounded-full overflow-hidden">
                        <div className="h-full w-1/2 bg-purple-600 rounded-full" />
                    </div>
                </div>
            </ModernCard>

            <ModernCard className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                        <Calendar className="h-5 w-5 text-amber-600" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatDate(document.created_at, 'short')}
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Created</p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>Last updated {formatDate(document.updated_at, 'short')}</span>
                    </div>
                </div>
            </ModernCard>
        </div>
    );
}

function ModernDesktopPreview({ document, previewUrl, onFullscreen }: any) {
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
                        <div className={cn(
                            "w-24 h-24 rounded-2xl flex items-center justify-center mb-4",
                            getFileColor(document.file_extension || '')
                        )}>
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

function ModernDesktopDetails({ document }: { document: Document }) {
    return (
        <ModernCard title="Document Information" icon={Info} iconColor="from-purple-500 to-pink-500">
            <div className="space-y-6">
                {/* Reference Number */}
                <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
                        Reference Number
                    </label>
                    <div className="flex items-center gap-2">
                        <code className="flex-1 font-mono text-sm bg-gray-50 dark:bg-gray-900 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800">
                            {document.reference_number || 'N/A'}
                        </code>
                        {document.reference_number && (
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => navigator.clipboard.writeText(document.reference_number!)}
                                className="rounded-xl"
                            >
                                <Copy className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Owner */}
                <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
                        Document Owner
                    </label>
                    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                        <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 text-lg">
                                {document.resident?.first_name?.[0]}{document.resident?.last_name?.[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                                {document.resident ? 
                                    `${document.resident.first_name} ${document.resident.last_name}` : 
                                    'Unknown Resident'}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Resident</p>
                        </div>
                    </div>
                </div>

                {/* Dates Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {document.issue_date && (
                        <div>
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
                                Issue Date
                            </label>
                            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                <Calendar className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {formatDate(document.issue_date)}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(document.issue_date).toLocaleDateString('en-PH', { weekday: 'long' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {document.expiry_date && (
                        <div>
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
                                Expiry Date
                            </label>
                            <div className={cn(
                                "flex items-center gap-3 p-4 rounded-xl",
                                getDocumentStatus(document) === 'expired'
                                    ? 'bg-rose-50 dark:bg-rose-950/30'
                                    : 'bg-gray-50 dark:bg-gray-900'
                            )}>
                                <Clock className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className={cn(
                                        "font-medium",
                                        getDocumentStatus(document) === 'expired' && "text-rose-600 dark:text-rose-400"
                                    )}>
                                        {formatDate(document.expiry_date)}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(document.expiry_date).toLocaleDateString('en-PH', { weekday: 'long' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Upload Info */}
                <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
                        Upload Information
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Uploaded</p>
                            <p className="font-medium">{formatDateTime(document.created_at)}</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Last Modified</p>
                            <p className="font-medium">{formatDateTime(document.updated_at)}</p>
                        </div>
                        {document.uploaded_by_user && (
                            <div className="col-span-2 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Uploaded By</p>
                                <p className="font-medium">{document.uploaded_by_user.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{document.uploaded_by_user.email}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tags */}
                {document.tags && document.tags.length > 0 && (
                    <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
                            Tags
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {document.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="gap-1 px-3 py-1.5">
                                    <Tag className="h-3 w-3" />
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </ModernCard>
    );
}

function ModernDesktopSecurity({ document }: { document: Document }) {
    const securityOptions = document.security_options || {};

    return (
        <ModernCard title="Security & Access" icon={Shield} iconColor="from-amber-500 to-orange-500">
            <div className="space-y-4">
                {/* Basic Security */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                            <Lock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium">Password</span>
                        </div>
                        {document.requires_password ? (
                            <Badge className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400">
                                Protected
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600">
                                No Password
                            </Badge>
                        )}
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                            <Globe className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium">Access</span>
                        </div>
                        <Badge variant="outline" className={cn(
                            document.is_public 
                                ? "border-blue-500/30 bg-blue-500/10 text-blue-600"
                                : "border-gray-500/30 bg-gray-500/10 text-gray-600"
                        )}>
                            {document.is_public ? 'Public' : 'Private'}
                        </Badge>
                    </div>
                </div>

                {/* Advanced Security */}
                {(securityOptions.add_watermark || securityOptions.enable_encryption || securityOptions.audit_log_access) && (
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Advanced Security</h4>
                        <div className="space-y-2">
                            {securityOptions.add_watermark && (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                    <Fingerprint className="h-5 w-5 text-blue-500" />
                                    <div>
                                        <p className="font-medium">Watermark Protection</p>
                                        <p className="text-xs text-gray-500">Document will display viewer information</p>
                                    </div>
                                </div>
                            )}
                            {securityOptions.enable_encryption && (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                    <FileLock className="h-5 w-5 text-purple-500" />
                                    <div>
                                        <p className="font-medium">File Encryption</p>
                                        <p className="text-xs text-gray-500">AES-256 encryption enabled</p>
                                    </div>
                                </div>
                            )}
                            {securityOptions.audit_log_access && (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                    <History className="h-5 w-5 text-amber-500" />
                                    <div>
                                        <p className="font-medium">Audit Logging</p>
                                        <p className="text-xs text-gray-500">All access is logged</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Restrictions */}
                {(securityOptions.restrict_download || securityOptions.restrict_print) && (
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Restrictions</h4>
                        <div className="space-y-2">
                            {securityOptions.restrict_download && (
                                <div className="flex items-center gap-3 p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl text-rose-600 dark:text-rose-400">
                                    <Download className="h-5 w-5" />
                                    <div>
                                        <p className="font-medium">Download Restricted</p>
                                        <p className="text-xs opacity-80">Downloading is not permitted</p>
                                    </div>
                                </div>
                            )}
                            {securityOptions.restrict_print && (
                                <div className="flex items-center gap-3 p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl text-rose-600 dark:text-rose-400">
                                    <Printer className="h-5 w-5" />
                                    <div>
                                        <p className="font-medium">Print Restricted</p>
                                        <p className="text-xs opacity-80">Printing is not permitted</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Scan Quality */}
                {securityOptions.scan_quality && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                            <Scan className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium">Scan Quality</span>
                        </div>
                        <Badge variant="outline" className="capitalize">
                            {securityOptions.scan_quality.replace('_', ' ')}
                        </Badge>
                    </div>
                )}
            </div>
        </ModernCard>
    );
}

function ModernDesktopSidebar({ document, relatedDocuments, onFullscreen, onDownload, canDownload, isDownloading }: any) {
    return (
        <div className="space-y-6">
            {/* Quick Actions */}
            <ModernCard title="Quick Actions" icon={Zap} iconColor="from-blue-500 to-indigo-500">
                <div className="space-y-2">
                    <Button
                        variant="outline"
                        onClick={onFullscreen}
                        className="w-full justify-start gap-2 h-12"
                    >
                        <Maximize2 className="h-4 w-4" />
                        Fullscreen View
                        <kbd className="ml-auto text-xs bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">F11</kbd>
                    </Button>
                    
                    {canDownload && !document.security_options?.restrict_download && (
                        <Button
                            variant="outline"
                            onClick={onDownload}
                            disabled={isDownloading}
                            className="w-full justify-start gap-2 h-12"
                        >
                            <Download className="h-4 w-4" />
                            {isDownloading ? 'Downloading...' : 'Download Document'}
                        </Button>
                    )}
                    
                    {!document.security_options?.restrict_print && (
                        <Button
                            variant="outline"
                            onClick={() => window.print()}
                            className="w-full justify-start gap-2 h-12"
                        >
                            <Printer className="h-4 w-4" />
                            Print Document
                        </Button>
                    )}
                    
                    <Separator className="my-2" />
                    
                    <Link href="/portal/my-records">
                        <Button variant="ghost" className="w-full justify-start gap-2 h-12">
                            <ArrowLeft className="h-4 w-4" />
                            Back to All Documents
                        </Button>
                    </Link>
                </div>
            </ModernCard>

            {/* Security Info */}
            <ModernDesktopSecurity document={document} />

            {/* Related Documents */}
            {relatedDocuments && relatedDocuments.length > 0 && (
                <ModernCard
                    title="Related Documents"
                    description={`Other documents in ${document.category?.name || 'this category'}`}
                    icon={Link2}
                    iconColor="from-teal-500 to-emerald-500"
                >
                    <div className="space-y-2">
                        {relatedDocuments.map((doc) => {
                            const FileIcon = getFileIcon(doc.file_extension || '');
                            return (
                                <Link
                                    key={doc.id}
                                    href={`/portal/my-records/${doc.id}`}
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group"
                                >
                                    <div className={cn("p-2 rounded-lg", getFileColor(doc.file_extension || ''))}>
                                        <FileIcon className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                            {doc.name}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                            {doc.file_extension && (
                                                <span>{doc.file_extension.toUpperCase()}</span>
                                            )}
                                            {doc.file_size_human && (
                                                <>
                                                    <span>•</span>
                                                    <span>{doc.file_size_human}</span>
                                                </>
                                            )}
                                            {doc.requires_password && (
                                                <Lock className="h-3 w-3 text-amber-500" />
                                            )}
                                        </div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                                </Link>
                            );
                        })}
                    </div>
                </ModernCard>
            )}
        </div>
    );
}

// ==================== MAIN COMPONENT ====================
export default function DocumentShow({ 
    document, 
    relatedDocuments = [], 
    canDownload = false, 
    canDelete = false,
    error,
    needsPassword = false,
    sessionExpiry,
    sessionData,
    debugMode = false,
}: PageProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isFullscreenViewerOpen, setIsFullscreenViewerOpen] = useState(false);
    const { isMobile } = useMobileDetect();
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const handleDownload = () => {
        if (isDownloading) return;
        
        setIsDownloading(true);
        window.open(`/my-records/${document.id}/download`, '_blank');
        
        setTimeout(() => setIsDownloading(false), 1000);
    };

    const handleDelete = () => {
        if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
            return;
        }
        
        setIsDeleting(true);
        router.delete(`/my-records/${document.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                router.visit('/my-records');
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsVerifying(true);

        router.post(`/my-records/${document.id}/verify-password`, {
            password: password,
        }, {
            preserveScroll: true,
            preserveState: false,
            onError: (errors) => {
                setPasswordError(errors.password || 'Invalid password');
                setIsVerifying(false);
            },
            onFinish: () => setIsVerifying(false),
        });
    };

    const getPreviewUrl = () => {
        if (document.preview_url) {
            return document.preview_url;
        }
        if (document.file_path) {
            return `/storage/${document.file_path}`;
        }
        return `/my-records/${document.id}/preview`;
    };

    const showPasswordForm = needsPassword || (document.requires_password && !sessionExpiry);

    if (showPasswordForm) {
        return (
            <ResidentLayout
                title="Password Required"
                breadcrumbs={[
                    { title: 'Dashboard', href: '/portal/dashboard' },
                    { title: 'My Records', href: '/portal/my-records' },
                    { title: 'Password Required', href: '#' },
                ]}
            >
                <Head title="Password Required" />
                <ModernPasswordForm
                    document={document}
                    error={error}
                    onSubmit={handlePasswordSubmit}
                    isVerifying={isVerifying}
                />
            </ResidentLayout>
        );
    }

    // Mobile Layout
    if (isMobile) {
        return (
            <>
                <ModernFullScreenViewer
                    document={document}
                    previewUrl={getPreviewUrl()}
                    isOpen={isFullscreenViewerOpen}
                    onClose={() => setIsFullscreenViewerOpen(false)}
                />

                <ResidentLayout
                    title={`${document.name} - My Records`}
                    breadcrumbs={[
                        { title: 'Dashboard', href: '/portal/dashboard' },
                        { title: 'My Records', href: '/portal/my-records' },
                        { title: document.name, href: '#' },
                    ]}
                    hideMobileFooter={true}
                >
                    <Head title={`${document.name} - My Records`} />

                    <div className="min-h-screen pb-24">
                        <ModernMobileHeader
                            document={document}
                            onFullscreen={() => setIsFullscreenViewerOpen(true)}
                            onDownload={handleDownload}
                            canDownload={canDownload}
                        />

                        <ModernMobileStats document={document} />

                        <div className="space-y-4 py-4">
                            <ModernMobilePreview
                                document={document}
                                previewUrl={getPreviewUrl()}
                                onFullscreen={() => setIsFullscreenViewerOpen(true)}
                            />

                            <ModernMobileDetails document={document} />
                            <ModernMobileSecurity document={document} />
                            <ModernMobileRelated relatedDocuments={relatedDocuments} />
                        </div>

                        <ModernMobileBottomBar
                            document={document}
                            onDownload={handleDownload}
                            onFullscreen={() => setIsFullscreenViewerOpen(true)}
                            canDownload={canDownload}
                        />
                    </div>
                </ResidentLayout>
            </>
        );
    }

    // Desktop Layout
    return (
        <>
            <ModernFullScreenViewer
                document={document}
                previewUrl={getPreviewUrl()}
                isOpen={isFullscreenViewerOpen}
                onClose={() => setIsFullscreenViewerOpen(false)}
            />

            <ResidentLayout
                title={`${document.name} - My Records`}
                breadcrumbs={[
                    { title: 'Dashboard', href: '/portal/dashboard' },
                    { title: 'My Records', href: '/portal/my-records' },
                    { title: document.name, href: '#' },
                ]}
            >
                <Head title={`${document.name} - My Records`} />

                <div className="pb-8">
                    <ModernDesktopHeader
                        document={document}
                        onFullscreen={() => setIsFullscreenViewerOpen(true)}
                        onDownload={handleDownload}
                        canDownload={canDownload}
                        isDownloading={isDownloading}
                    />

                    <div className="px-8 py-6 space-y-6">
                        <ModernDesktopStats document={document} />

                        <div className="grid grid-cols-3 gap-6">
                            <div className="col-span-2 space-y-6">
                                <ModernDesktopPreview
                                    document={document}
                                    previewUrl={getPreviewUrl()}
                                    onFullscreen={() => setIsFullscreenViewerOpen(true)}
                                />
                                <ModernDesktopDetails document={document} />
                            </div>

                            <div className="col-span-1">
                                <ModernDesktopSidebar
                                    document={document}
                                    relatedDocuments={relatedDocuments}
                                    onFullscreen={() => setIsFullscreenViewerOpen(true)}
                                    onDownload={handleDownload}
                                    canDownload={canDownload}
                                    isDownloading={isDownloading}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <ModernLoadingOverlay loading={isDeleting} message="Deleting document..." />
            </ResidentLayout>
        </>
    );
}