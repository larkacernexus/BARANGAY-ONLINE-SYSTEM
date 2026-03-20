// components/admin/document-types/DocumentTypesStats.tsx
import { 
    FileText, 
    CheckCircle, 
    XCircle, 
    Folder,
    AlertCircle,
    HardDrive,
    FileType
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
    // Safe stats with fallbacks
    const safeStats = {
        total: stats?.total || 0,
        active: stats?.active || 0,
        required: stats?.required || 0,
        optional: stats?.optional || 0,
        max_file_size_mb: stats?.max_file_size_mb || 0,
        has_formats: stats?.has_formats || 0
    };

    const safeCategories = categories || [];
    const inactiveCount = safeStats.total - safeStats.active;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatCard
                title="Total Types"
                value={safeStats.total.toLocaleString()}
                icon={<FileText className="h-4 w-4 text-blue-500" />}
                description={`${safeStats.active} active • ${inactiveCount} inactive`}
            />
            
            <StatCard
                title="Required"
                value={safeStats.required.toLocaleString()}
                icon={<CheckCircle className="h-4 w-4 text-green-500" />}
                description={`${safeStats.optional} optional`}
            />

            <StatCard
                title="Categories"
                value={safeCategories.length.toLocaleString()}
                icon={<Folder className="h-4 w-4 text-purple-500" />}
                description="Active categories"
            />

            <StatCard
                title="Has Formats"
                value={safeStats.has_formats.toLocaleString()}
                icon={<FileType className="h-4 w-4 text-indigo-500" />}
                description="With format restrictions"
            />

            <StatCard
                title="Max Size"
                value={`${safeStats.max_file_size_mb} MB`}
                icon={<HardDrive className="h-4 w-4 text-amber-500" />}
                description="Maximum file size"
            />

            <StatCard
                title="Inactive"
                value={inactiveCount.toLocaleString()}
                icon={<AlertCircle className="h-4 w-4 text-red-500" />}
                description="Disabled document types"
            />
        </div>
    );
}