// components/document/mobile/mobile-stats.tsx
import { Eye, Download, HardDrive } from 'lucide-react';
import { formatFileSize } from '@/components/residentui/lib/resident-ui-utils';
import { Document } from '@/types/portal/records/records';

interface MobileStatsProps {
    document: Document;
}

export function MobileStats({ document }: MobileStatsProps) {
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