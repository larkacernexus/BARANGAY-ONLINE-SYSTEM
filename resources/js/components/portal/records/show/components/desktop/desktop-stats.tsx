// components/document/desktop/desktop-stats.tsx
import { ModernCard } from '@/components/residentui/modern-card';
import { Eye, Download, HardDrive, Calendar, Clock } from 'lucide-react';
import { formatDate, formatFileSize } from '@/components/residentui/lib/resident-ui-utils';
import { Document } from '@/types/portal/records/records';

interface DesktopStatsProps {
    document: Document;
}

export function DesktopStats({ document }: DesktopStatsProps) {
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