// components/admin/document-types/DocumentTypesStats.tsx

import { 
    FileText, 
    CheckCircle, 
    FileType,
    HardDrive,
} from 'lucide-react';
import { StatCard } from '@/components/adminui/stats-grid';

interface DocumentTypesStatsProps {
    stats: {
        total: number;
        active: number;
        required: number;
        optional: number;
        max_file_size_mb: number;
        has_formats: number;
    };
    categoryCounts: Record<number, number>;
    categories: Array<{ id: number; name: string; slug: string }>;
}

export default function DocumentTypesStats({ 
    stats, 
    categoryCounts, 
    categories 
}: DocumentTypesStatsProps) {
    const safeStats = {
        total: stats?.total || 0,
        required: stats?.required || 0,
        optional: stats?.optional || 0,
        has_formats: stats?.has_formats || 0,
        max_file_size_mb: stats?.max_file_size_mb || 0,
    };

    const calculatePercentage = (value: number) => {
        if (safeStats.total === 0) return 0;
        return Math.round((value / safeStats.total) * 100);
    };

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                title="Total Types"
                value={safeStats.total.toLocaleString()}
                icon={<FileText className="h-5 w-5 text-blue-500 dark:text-blue-400" />}
                description="All document types"
            />
            
            <StatCard
                title="Required Types"
                value={safeStats.required.toLocaleString()}
                icon={<CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />}
                description={`${calculatePercentage(safeStats.required)}% required • ${safeStats.optional} optional`}
            />

            <StatCard
                title="Format Restricted"
                value={safeStats.has_formats.toLocaleString()}
                icon={<FileType className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />}
                description={`${calculatePercentage(safeStats.has_formats)}% have format limits`}
            />

            <StatCard
                title="Max File Size"
                value={`${safeStats.max_file_size_mb} MB`}
                icon={<HardDrive className="h-5 w-5 text-amber-500 dark:text-amber-400" />}
                description="Maximum upload size"
            />
        </div>
    );
}