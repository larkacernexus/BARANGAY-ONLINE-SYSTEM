// components/document/desktop/desktop-sidebar.tsx
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ModernCard } from '@/components/residentui/modern-card';
import { Maximize2, Download, Printer, ArrowLeft, Zap, Link2, ChevronRight, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DesktopSecurity } from './desktop-security';
import { getFileIcon, getFileColor } from '@/utils/portal/records/document.utils';
import { Document, RelatedDocument } from '@/types/portal/records/document.types';

interface DesktopSidebarProps {
    document: Document;
    relatedDocuments: RelatedDocument[];
    onFullscreen: () => void;
    onDownload: () => void;
    canDownload: boolean;
    isDownloading: boolean;
}

export function DesktopSidebar({ document, relatedDocuments, onFullscreen, onDownload, canDownload, isDownloading }: DesktopSidebarProps) {
    return (
        <div className="space-y-6">
            {/* Quick Actions */}
            <ModernCard title="Quick Actions" icon={Zap} iconColor="from-blue-500 to-indigo-500">
                <div className="space-y-2">
                    <Button variant="outline" onClick={onFullscreen} className="w-full justify-start gap-2 h-12">
                        <Maximize2 className="h-4 w-4" />
                        Fullscreen View
                        <kbd className="ml-auto text-xs bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">F11</kbd>
                    </Button>
                    
                    {canDownload && !document.security_options?.restrict_download && (
                        <Button variant="outline" onClick={onDownload} disabled={isDownloading} className="w-full justify-start gap-2 h-12">
                            <Download className="h-4 w-4" />
                            {isDownloading ? 'Downloading...' : 'Download Document'}
                        </Button>
                    )}
                    
                    {!document.security_options?.restrict_print && (
                        <Button variant="outline" onClick={() => window.print()} className="w-full justify-start gap-2 h-12">
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
            <DesktopSecurity document={document} />

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
                                        <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{doc.name}</p>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                            {doc.file_extension && <span>{doc.file_extension.toUpperCase()}</span>}
                                            {doc.file_size_human && <><span>•</span><span>{doc.file_size_human}</span></>}
                                            {doc.requires_password && <Lock className="h-3 w-3 text-amber-500" />}
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