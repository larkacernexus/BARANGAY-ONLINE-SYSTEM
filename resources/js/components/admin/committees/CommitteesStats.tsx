// components/admin/committees/CommitteesStats.tsx
import { Target, CheckCircle, XCircle, Users, Folder } from 'lucide-react';
import { StatCard } from '@/components/adminui/stats-grid';

interface CommitteesStatsProps {
    stats: {
        total: number;
        active: number;
        inactive: number;
        with_positions: number;
        without_positions: number;
    };
}

export function CommitteesStats({ stats }: CommitteesStatsProps) {
    // Safe stats with fallbacks
    const safeStats = {
        total: stats?.total || 0,
        active: stats?.active || 0,
        inactive: stats?.inactive || 0,
        with_positions: stats?.with_positions || 0,
        without_positions: stats?.without_positions || 0
    };

    return (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
                title="Total Committees"
                value={safeStats.total.toLocaleString()}
                icon={<Target className="h-4 w-4 text-blue-500" />}
                description="All committees"
            />
            <StatCard
                title="Active"
                value={safeStats.active.toLocaleString()}
                icon={<CheckCircle className="h-4 w-4 text-green-500" />}
                description="Currently active committees"
            />
            <StatCard
                title="Inactive"
                value={safeStats.inactive.toLocaleString()}
                icon={<XCircle className="h-4 w-4 text-gray-500" />}
                description="Inactive committees"
            />
            <StatCard
                title="With Positions"
                value={safeStats.with_positions.toLocaleString()}
                icon={<Users className="h-4 w-4 text-purple-500" />}
                description="Committees with positions"
            />
            <StatCard
                title="Without Positions"
                value={safeStats.without_positions.toLocaleString()}
                icon={<Folder className="h-4 w-4 text-amber-500" />}
                description="Committees without positions"
            />
        </div>
    );
}