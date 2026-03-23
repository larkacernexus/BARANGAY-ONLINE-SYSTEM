// forms-show/components/FormStats.tsx
import { ModernCard } from '@/components/residentui/modern-card';
import { FileText, HardDrive, Eye, Download } from 'lucide-react';
import { Form } from '@/types/portal/forms/form.types';

interface FormStatsProps {
    form: Form;
    fileExtension: string;
    fileSize: string;
}

export function FormStats({ form, fileExtension, fileSize }: FormStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <ModernCard className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
                <div className="flex items-center justify-between mb-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {fileExtension}
                    </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">File Type</p>
            </ModernCard>

            <ModernCard className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
                <div className="flex items-center justify-between mb-2">
                    <HardDrive className="h-5 w-5 text-emerald-600" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {fileSize}
                    </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">File Size</p>
            </ModernCard>

            <ModernCard className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
                <div className="flex items-center justify-between mb-2">
                    <Eye className="h-5 w-5 text-purple-600" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {form.view_count}
                    </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Views</p>
            </ModernCard>

            <ModernCard className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
                <div className="flex items-center justify-between mb-2">
                    <Download className="h-5 w-5 text-amber-600" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {form.download_count}
                    </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Downloads</p>
            </ModernCard>
        </div>
    );
}