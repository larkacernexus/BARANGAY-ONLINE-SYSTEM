// components/document/fullscreen-viewer.tsx
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ModernCard } from '@/components/residentui/modern-card';
import { X, ZoomIn, ZoomOut, RotateCw, RefreshCw, Download, Info, Eye, BarChart3, Shield, Lock, Globe, HardDrive, FileText, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate, formatDateTime, formatFileSize } from '@/components/residentui/lib/resident-ui-utils';
import { getFileIcon, getFileColor } from '@/utils/portal/records/document.utils';
import { Document } from '@/types/portal/records/document.types';
import { Badge } from '@/components/ui/badge';


interface FullscreenViewerProps {
    document: Document;
    previewUrl: string;
    isOpen: boolean;
    onClose: () => void;
    onDownload?: () => void;
}

export function FullscreenViewer({ document, previewUrl, isOpen, onClose, onDownload }: FullscreenViewerProps) {
    const [zoom, setZoom] = useState(100);
    const [rotation, setRotation] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'view' | 'info'>('view');
    const iframeRef = useRef<HTMLIFrameElement>(null);
    
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
    }, [isOpen, onClose]); // Removed iframeRef from dependencies since it's not used

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex flex-col bg-black"
        >
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur-xl border-b border-white/10 text-white">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Button variant="ghost" size="icon" onClick={onClose} className="text-white/70 hover:text-white hover:bg-white/10 rounded-full">
                        <X className="h-5 w-5" />
                    </Button>
                    
                    <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-xl", fileColor)}>
                            <FileIcon className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-white line-clamp-1 max-w-[300px]">{document.name}</h2>
                            <div className="flex items-center gap-2 text-xs text-white/50">
                                <span>{safeFileExtension?.toUpperCase() || 'DOC'}</span>
                                <span>•</span>
                                <span>{document.file_size_human || formatFileSize(document.file_size || 0)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 mr-2">
                        <Button variant="ghost" size="icon" onClick={() => setZoom(prev => Math.max(prev - 25, 25))} disabled={zoom <= 25} className="h-8 w-8">
                            <ZoomOut className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium px-2 min-w-[45px] text-center">{zoom}%</span>
                        <Button variant="ghost" size="icon" onClick={() => setZoom(prev => Math.min(prev + 25, 300))} disabled={zoom >= 300} className="h-8 w-8">
                            <ZoomIn className="h-4 w-4" />
                        </Button>
                    </div>

                    {isImage && (
                        <Button variant="ghost" size="icon" onClick={() => setRotation(prev => (prev + 90) % 360)} className="h-8 w-8" title="Rotate (Ctrl+R)">
                            <RotateCw className="h-4 w-4" />
                        </Button>
                    )}

                    <Button variant="ghost" size="icon" onClick={() => { setZoom(100); setRotation(0); }} className="h-8 w-8" title="Reset (Ctrl+0)">
                        <RefreshCw className="h-4 w-4" />
                    </Button>

                    <Separator orientation="vertical" className="h-6 bg-white/10 mx-2" />

                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mr-2">
                        <TabsList className="bg-white/5 h-8">
                            <TabsTrigger value="view" className="text-xs px-3">View</TabsTrigger>
                            <TabsTrigger value="info" className="text-xs px-3">Info</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {onDownload && (
                        <Button variant="ghost" size="icon" onClick={onDownload} className="h-8 w-8" title="Download">
                            <Download className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Viewer Content */}
            <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-gray-950 to-gray-900">
                <AnimatePresence mode="wait">
                    {activeTab === 'view' ? (
                        <ViewerContent
                            document={document}
                            previewUrl={previewUrl}
                            zoom={zoom}
                            rotation={rotation}
                            isPdf={isPdf}
                            isImage={isImage}
                            isLoading={isLoading}
                            error={error}
                            onLoad={() => setIsLoading(false)}
                            onError={() => {
                                setIsLoading(false);
                                setError('Unable to load document preview');
                            }}
                            onDownload={onDownload}
                            iframeRef={iframeRef}
                        />
                    ) : (
                        <InfoContent document={document} />
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

// Sub-components for FullscreenViewer
function ViewerContent({ 
    document, 
    previewUrl, 
    zoom, 
    rotation, 
    isPdf, 
    isImage, 
    isLoading, 
    error, 
    onLoad, 
    onError, 
    onDownload,
    iframeRef 
}: any) {
    const FileIcon = getFileIcon(document.file_extension || '');
    const fileColor = getFileColor(document.file_extension || '');

    return (
        <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-950/50 backdrop-blur-sm z-10">
                    <div className="text-center space-y-4">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <FileText className="h-6 w-6 text-white/50" />
                            </div>
                        </div>
                        <p className="text-white/70 text-sm">Loading document...</p>
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
                        {onDownload && (
                            <Button onClick={onDownload} className="gap-2">
                                <Download className="h-4 w-4" />
                                Download Instead
                            </Button>
                        )}
                    </div>
                </div>
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
                    onLoad={onLoad}
                    onError={onError}
                />
            ) : isImage ? (
                <div className="w-full h-full flex items-center justify-center p-8">
                    <img
                        src={previewUrl}
                        alt={document.name}
                        className="max-w-full max-h-full object-contain"
                        style={{ transform: `scale(${zoom / 100}) rotate(${rotation}deg)` }}
                        onLoad={onLoad}
                        onError={onError}
                    />
                </div>
            ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-8 max-w-md">
                        <div className={cn("w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6", fileColor)}>
                            <FileIcon className="h-12 w-12" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">{document.name}</h3>
                        <p className="text-white/50 text-sm mb-6">This file type cannot be previewed directly.</p>
                        {onDownload && (
                            <Button onClick={onDownload} size="lg" className="gap-2">
                                <Download className="h-5 w-5" />
                                Download File
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </motion.div>
    );
}

function InfoContent({ document }: { document: Document }) {
    return (
        <motion.div key="info" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full h-full overflow-auto p-8">
            <div className="max-w-2xl mx-auto space-y-6">
                <ModernCard title="Document Information" icon={Info} iconColor="from-blue-500 to-indigo-500" className="bg-white/5 backdrop-blur-sm border-white/10">
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

                <ModernCard title="Statistics" icon={BarChart3} iconColor="from-purple-500 to-pink-500" className="bg-white/5 backdrop-blur-sm border-white/10">
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

                <ModernCard title="Security" icon={Shield} iconColor="from-amber-500 to-orange-500" className="bg-white/5 backdrop-blur-sm border-white/10">
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
                            <Badge variant="outline" className={cn(document.is_public ? "border-blue-500/30 bg-blue-500/10 text-blue-400" : "border-gray-500/30 bg-gray-500/10 text-gray-400")}>
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
    );
}