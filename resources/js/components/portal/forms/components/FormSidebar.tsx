// forms-show/components/FormSidebar.tsx
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ModernCard } from '@/components/residentui/modern-card';
import { 
    Download, Eye, Maximize2, Share2, Copy, FileCode, 
    Loader2, Eye as EyeIcon, Building, Calendar, Folder, 
    FileText, HardDrive, Printer
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Form, Permissions, StatusConfig } from '@/types/portal/forms/form.types';
import { formatDate, formatFileSize, getAgencyIcon } from '@/utils/portal/forms/form-utils';

interface FormSidebarProps {
    form: Form;
    statusConfig: StatusConfig;
    permissions: Permissions;
    isDownloading: boolean;
    onDownload: () => void;
    onShare: () => void;
    onFullscreen: () => void;
    onCopyLink: () => void;
    onCopyCode: () => void;
    onPreviewTab: () => void;
    fileExtension: string;
    fileSize: string;
    isPdf: boolean;
    isImage: boolean;
}

export function FormSidebar({
    form,
    statusConfig,
    permissions,
    isDownloading,
    onDownload,
    onShare,
    onFullscreen,
    onCopyLink,
    onCopyCode,
    onPreviewTab,
    fileExtension,
    fileSize,
    isPdf,
    isImage
}: FormSidebarProps) {
    const StatusIcon = statusConfig.icon;
    const AgencyIcon = getAgencyIcon(form.issuing_agency);

    return (
        <div className="space-y-4 lg:space-y-6">
            <ModernCard title="Form Summary">
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <p className="text-sm text-gray-500">Status</p>
                        <Badge className={cn(
                            "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                            statusConfig.bgColor,
                            statusConfig.color
                        )}>
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig.label}
                        </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <p className="text-sm text-gray-500">File Type</p>
                        <p className="font-medium">{fileExtension}</p>
                    </div>
                    
                    <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <p className="text-sm text-gray-500">File Size</p>
                        <p className="font-bold">{fileSize}</p>
                    </div>
                    
                    <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <p className="text-sm text-gray-500">Category</p>
                        <p className="font-medium">{form.category}</p>
                    </div>
                    
                    <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <p className="text-sm text-gray-500">Issuing Agency</p>
                        <div className="flex items-center gap-1">
                            <AgencyIcon className="h-3 w-3 text-gray-400" />
                            <p className="font-medium">{form.issuing_agency}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <p className="text-sm text-gray-500">Last Updated</p>
                        <p className="font-medium">{formatDate(form.updated_at)}</p>
                    </div>
                    
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 mb-1">Views</p>
                        <p className="text-2xl font-bold">{form.view_count}</p>
                    </div>
                    
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Downloads</p>
                        <p className="text-2xl font-bold">{form.download_count}</p>
                    </div>
                </div>
            </ModernCard>

            <ModernCard title="Quick Actions">
                <div className="space-y-2">
                    {permissions.can_download && form.is_active && (
                        <Button 
                            className="w-full justify-start gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                            onClick={onDownload}
                            disabled={isDownloading}
                        >
                            {isDownloading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Download className="h-4 w-4" />
                            )}
                            {isDownloading ? 'Downloading...' : 'Download Form'}
                        </Button>
                    )}

                    <Button 
                        variant="outline" 
                        className="w-full justify-start gap-2 rounded-xl"
                        onClick={onPreviewTab}
                    >
                        <EyeIcon className="h-4 w-4" />
                        View Preview
                    </Button>

                    <Button 
                        variant="outline" 
                        className="w-full justify-start gap-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400"
                        onClick={onFullscreen}
                    >
                        <Maximize2 className="h-4 w-4" />
                        Fullscreen View
                    </Button>

                    {permissions.can_share && (
                        <Button 
                            variant="outline" 
                            className="w-full justify-start gap-2 rounded-xl"
                            onClick={onShare}
                        >
                            <Share2 className="h-4 w-4" />
                            Share Form
                        </Button>
                    )}

                    <Separator />

                    <div className="grid grid-cols-2 gap-2">
                        <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-xs"
                            onClick={onCopyLink}
                        >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy Link
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-xs"
                            onClick={onCopyCode}
                        >
                            <FileCode className="h-3 w-3 mr-1" />
                            Copy Code
                        </Button>
                    </div>
                </div>
            </ModernCard>

            <ModernCard title="Instructions">
                <div className="space-y-2 text-sm">
                    <p className="font-medium text-gray-700 dark:text-gray-300">How to use this form:</p>
                    <ol className="list-decimal pl-4 space-y-1 text-gray-600 dark:text-gray-400">
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
            </ModernCard>
        </div>
    );
}