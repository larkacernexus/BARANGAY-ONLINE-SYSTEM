// forms-show/components/FormHeader.tsx
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Maximize2, Download, Share2, Copy, FileCode, Loader2, Folder, Building, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Form, Permissions, StatusConfig } from '@/types/portal/forms/form.types';
import { getFileIcon, getCategoryColor, getAgencyIcon } from '@/utils/portal/forms/form-utils';

interface FormHeaderProps {
    form: Form;
    statusConfig: StatusConfig;
    permissions: Permissions;
    isDownloading: boolean;
    onDownload: () => void;
    onShare: () => void;
    onFullscreen: () => void;
    onCopyLink: () => void;
    onCopyCode: () => void;
}

export function FormHeader({
    form,
    statusConfig,
    permissions,
    isDownloading,
    onDownload,
    onShare,
    onFullscreen,
    onCopyLink,
    onCopyCode
}: FormHeaderProps) {
    const StatusIcon = statusConfig.icon;
    const FileIcon = getFileIcon(form.file_type);
    const AgencyIcon = getAgencyIcon(form.issuing_agency);

    return (
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
                <Link href="/forms">
                    <Button variant="ghost" size="sm" className="gap-2 rounded-xl">
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                </Link>
                
                <div className="flex items-start gap-3">
                    <div className={cn(
                        "h-12 w-12 rounded-xl flex items-center justify-center",
                        `bg-gradient-to-br ${getCategoryColor(form.category)}`
                    )}>
                        <FileIcon className="h-6 w-6 text-white" />
                    </div>
                    
                    <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                                {form.title}
                            </h1>
                            <Badge className={cn(
                                "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                                statusConfig.bgColor,
                                statusConfig.color
                            )}>
                                <StatusIcon className="h-3 w-3" />
                                {statusConfig.label}
                            </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl">
                            {form.description}
                        </p>
                        
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                                <Folder className="h-4 w-4" />
                                {form.category}
                            </div>
                            <div className="flex items-center gap-1">
                                <AgencyIcon className="h-4 w-4" />
                                {form.issuing_agency}
                            </div>
                            <div className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                {form.view_count} views
                            </div>
                            <div className="flex items-center gap-1">
                                <Download className="h-4 w-4" />
                                {form.download_count} downloads
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    onClick={onFullscreen}
                    className="gap-2 rounded-xl"
                >
                    <Maximize2 className="h-4 w-4" />
                    Fullscreen
                </Button>
                
                {permissions.can_download && form.is_active && (
                    <Button
                        onClick={onDownload}
                        disabled={isDownloading}
                        className="gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                    >
                        {isDownloading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
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
                
                {permissions.can_share && (
                    <Button
                        variant="outline"
                        className="gap-2 rounded-xl"
                        onClick={onShare}
                    >
                        <Share2 className="h-4 w-4" />
                        Share
                    </Button>
                )}
            </div>
        </div>
    );
}