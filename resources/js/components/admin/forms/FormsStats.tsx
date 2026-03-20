import { FileText, Zap, DownloadIcon, FolderOpen } from 'lucide-react';
import { StatCard } from '@/components/adminui/stats-grid';

interface FormsStatsProps {
    stats: {
        total: number;
        active: number;
        downloads: number;
        categories_count: number;
        agencies_count: number;
    };
}

export default function FormsStats({ stats }: FormsStatsProps) {
    // Safely access stats with defaults
    const safeStats = {
        total: stats?.total || 0,
        active: stats?.active || 0,
        downloads: stats?.downloads || 0,
        categories_count: stats?.categories_count || 0,
        agencies_count: stats?.agencies_count || 0
    };

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                title="Total Forms"
                value={safeStats.total.toLocaleString()}
                icon={<FileText className="h-4 w-4 text-blue-500" />}
                description={`${safeStats.categories_count} categories • ${safeStats.agencies_count} agencies`}
            />
            <StatCard
                title="Active Forms"
                value={safeStats.active.toLocaleString()}
                icon={<Zap className="h-4 w-4 text-green-500" />}
                description="Available for download"
            />
            <StatCard
                title="Total Downloads"
                value={safeStats.downloads.toLocaleString()}
                icon={<DownloadIcon className="h-4 w-4 text-purple-500" />}
                description="All time downloads"
            />
            <StatCard
                title="Categories"
                value={safeStats.categories_count.toLocaleString()}
                icon={<FolderOpen className="h-4 w-4 text-amber-500" />}
                description="Different form categories"
            />
        </div>
    );
}