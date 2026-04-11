// /components/portal/community-report/show/EvidenceCard.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { 
    Paperclip, 
    File, 
    Download, 
    Trash2, 
    Loader2, 
    Eye, 
    Image, 
    FileText,
    Video,
    Archive,
    Music,
    Code
} from 'lucide-react';
import { ReportEvidence } from '@/types/portal/reports/community-report';
import { useState } from 'react';
import { toast } from 'sonner';

interface EvidenceCardProps {
    evidences: ReportEvidence[];
    canEdit: boolean;
    reportId: number;
    onViewEvidence: (url: string) => void;
    onDownloadEvidence: (evidenceId: number, fileName: string) => void;
    onDeleteEvidence: (evidenceId: number) => void;
    deletingEvidenceId?: number | null;
}

export const EvidenceCard = ({
    evidences,
    canEdit,
    reportId,
    onViewEvidence,
    onDownloadEvidence,
    onDeleteEvidence,
    deletingEvidenceId
}: EvidenceCardProps) => {
    if (!evidences || evidences.length === 0) {
        return (
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                            <Paperclip className="h-4 w-4 text-white" />
                        </div>
                        Supporting Evidence
                    </CardTitle>
                    <CardDescription>No evidence files attached</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <File className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">No Evidence Attached</h4>
                        <p className="text-sm text-gray-500">No supporting files were uploaded with this report</p>
                        {canEdit && (
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="mt-4 gap-2 rounded-xl"
                                asChild
                            >
                                <Link href={`/portal/community-reports/${reportId}/edit`}>
                                    <Paperclip className="h-4 w-4" />
                                    Add Evidence
                                </Link>
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }

    const handleViewEvidence = (fileUrl: string | undefined) => {
        if (fileUrl) {
            onViewEvidence(fileUrl);
        } else {
            toast.error('File URL not available');
        }
    };

    const handleDownloadEvidence = (evidenceId: number, fileName: string) => {
        onDownloadEvidence(evidenceId, fileName);
    };

    // Group evidences by type
    const images = evidences.filter(e => e.is_image);
    const documents = evidences.filter(e => !e.is_image);

    return (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
            <CardHeader className="pb-2">
                <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                        <Paperclip className="h-4 w-4 text-white" />
                    </div>
                    Supporting Evidence
                </CardTitle>
                <CardDescription>
                    {evidences.length} file{evidences.length !== 1 ? 's' : ''} attached
                    {images.length > 0 && ` • ${images.length} image${images.length !== 1 ? 's' : ''}`}
                    {documents.length > 0 && ` • ${documents.length} document${documents.length !== 1 ? 's' : ''}`}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* Images Grid */}
                {images.length > 0 && (
                    <div className="mb-6">
                        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                            <Image className="h-4 w-4 text-purple-500" />
                            Images
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {images.map((evidence) => (
                                <EvidenceThumbnail
                                    key={evidence.id}
                                    evidence={evidence}
                                    onView={() => handleViewEvidence(evidence.file_url)}
                                    onDownload={() => handleDownloadEvidence(evidence.id, evidence.file_name)}
                                    onDelete={() => onDeleteEvidence(evidence.id)}
                                    canEdit={canEdit}
                                    isDeleting={deletingEvidenceId === evidence.id}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Documents List */}
                {documents.length > 0 && (
                    <div>
                        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-500" />
                            Documents
                        </h4>
                        <div className="space-y-2">
                            {documents.map((evidence) => (
                                <DocumentItem
                                    key={evidence.id}
                                    evidence={evidence}
                                    onView={() => handleViewEvidence(evidence.file_url)}
                                    onDownload={() => handleDownloadEvidence(evidence.id, evidence.file_name)}
                                    onDelete={() => onDeleteEvidence(evidence.id)}
                                    canEdit={canEdit}
                                    isDeleting={deletingEvidenceId === evidence.id}
                                />
                            ))}
                        </div>
                    </div>
                )}
                
                {canEdit && (
                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full gap-2 rounded-xl"
                            asChild
                        >
                            <Link href={`/portal/community-reports/${reportId}/edit`}>
                                <Paperclip className="h-4 w-4" />
                                Add More Evidence
                            </Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

// Evidence Thumbnail Component
interface EvidenceThumbnailProps {
    evidence: ReportEvidence;
    onView: () => void;
    onDownload: () => void;
    onDelete: () => void;
    canEdit: boolean;
    isDeleting: boolean;
}

const EvidenceThumbnail = ({ 
    evidence, 
    onView, 
    onDownload, 
    onDelete, 
    canEdit, 
    isDeleting 
}: EvidenceThumbnailProps) => {
    return (
        <div className="relative group">
            <div 
                onClick={onView}
                className="cursor-pointer rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-square"
            >
                {evidence.file_url ? (
                    <img 
                        src={evidence.file_url} 
                        alt={evidence.file_name}
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Image className="h-8 w-8 text-gray-400" />
                    </div>
                )}
            </div>
            
            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-xl flex items-center justify-center gap-2">
                <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                        e.stopPropagation();
                        onView();
                    }}
                    className="h-8 w-8 p-0 rounded-lg hover:scale-110 transition-transform"
                >
                    <Eye className="h-4 w-4" />
                </Button>
                <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDownload();
                    }}
                    className="h-8 w-8 p-0 rounded-lg hover:scale-110 transition-transform"
                >
                    <Download className="h-4 w-4" />
                </Button>
                {canEdit && (
                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        disabled={isDeleting}
                        className="h-8 w-8 p-0 rounded-lg hover:scale-110 transition-transform"
                    >
                        {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Trash2 className="h-4 w-4" />
                        )}
                    </Button>
                )}
            </div>
        </div>
    );
};

// Document Item Component
interface DocumentItemProps {
    evidence: ReportEvidence;
    onView: () => void;
    onDownload: () => void;
    onDelete: () => void;
    canEdit: boolean;
    isDeleting: boolean;
}

const DocumentItem = ({ 
    evidence, 
    onView, 
    onDownload, 
    onDelete, 
    canEdit, 
    isDeleting 
}: DocumentItemProps) => {
    const getFileIcon = () => {
        const ext = evidence.file_name?.split('.').pop()?.toLowerCase();
        const iconClass = "h-5 w-5";
        
        switch (ext) {
            case 'pdf':
                return <FileText className={`${iconClass} text-red-500`} />;
            case 'doc':
            case 'docx':
                return <FileText className={`${iconClass} text-blue-500`} />;
            case 'xls':
            case 'xlsx':
                return <FileText className={`${iconClass} text-green-500`} />;
            case 'ppt':
            case 'pptx':
                return <FileText className={`${iconClass} text-orange-500`} />;
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'webp':
                return <Image className={`${iconClass} text-purple-500`} />;
            case 'mp4':
            case 'mov':
            case 'avi':
            case 'mkv':
                return <Video className={`${iconClass} text-indigo-500`} />;
            case 'mp3':
            case 'wav':
            case 'ogg':
                return <Music className={`${iconClass} text-pink-500`} />;
            case 'zip':
            case 'rar':
            case '7z':
                return <Archive className={`${iconClass} text-yellow-500`} />;
            case 'js':
            case 'ts':
            case 'jsx':
            case 'tsx':
            case 'html':
            case 'css':
            case 'json':
                return <Code className={`${iconClass} text-teal-500`} />;
            default:
                return <File className={`${iconClass} text-gray-500`} />;
        }
    };

    return (
        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group">
            <div 
                className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                onClick={onView}
            >
                {getFileIcon()}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{evidence.file_name}</p>
                    <p className="text-xs text-gray-500">
                        {evidence.formatted_size || formatFileSize(evidence.file_size)}
                    </p>
                </div>
            </div>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                        e.stopPropagation();
                        onView();
                    }}
                    className="h-8 w-8 p-0 rounded-lg"
                >
                    <Eye className="h-4 w-4" />
                </Button>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDownload();
                    }}
                    className="h-8 w-8 p-0 rounded-lg"
                >
                    <Download className="h-4 w-4" />
                </Button>
                {canEdit && (
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        disabled={isDeleting}
                        className="h-8 w-8 p-0 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                        {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Trash2 className="h-4 w-4" />
                        )}
                    </Button>
                )}
            </div>
        </div>
    );
};

// Helper function
const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};