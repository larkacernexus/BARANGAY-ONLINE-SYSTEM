// resources/js/components/admin/positions/PositionsStats.tsx
import { Shield, CheckCircle, UserCheck, Users } from 'lucide-react';
import { StatCard } from '@/components/adminui/stats-grid';

interface PositionsStatsProps {
    globalStats: {
        total: number;
        active: number;
        requires_account: number;
        kagawad_count: number;
        inactive: number;
        assigned: number;
        unassigned: number;
        [key: string]: any;
    };
    filteredStats?: {
        total: number;
        active: number;
        requires_account: number;
        kagawad_count: number;
        inactive: number;
        assigned: number;
        unassigned: number;
    };
    isLoading?: boolean;
}

export default function PositionsStats({ 
    globalStats, 
    filteredStats, 
    isLoading = false 
}: PositionsStatsProps) {
    
    // Safe stats with fallbacks
    const safeGlobalStats = {
        total: globalStats?.total || 0,
        active: globalStats?.active || 0,
        requires_account: globalStats?.requires_account || 0,
        kagawad_count: globalStats?.kagawad_count || 0,
        inactive: globalStats?.inactive || 0,
        assigned: globalStats?.assigned || 0,
        unassigned: globalStats?.unassigned || 0
    };

    const safeFilteredStats = filteredStats ? {
        total: filteredStats?.total || 0,
        active: filteredStats?.active || 0,
        requires_account: filteredStats?.requires_account || 0,
        kagawad_count: filteredStats?.kagawad_count || 0,
        inactive: filteredStats?.inactive || 0,
        assigned: filteredStats?.assigned || 0,
        unassigned: filteredStats?.unassigned || 0
    } : null;

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-gray-900 rounded-lg border shadow-sm p-6 animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                title="Total Positions"
                value={(safeFilteredStats?.total ?? safeGlobalStats.total).toLocaleString()}
                icon={<Shield className="h-4 w-4 text-blue-500" />}
                description={safeFilteredStats 
                    ? `${safeFilteredStats.active} active of ${safeGlobalStats.active}`
                    : "All positions"}
            />
            <StatCard
                title="Active Positions"
                value={(safeFilteredStats?.active ?? safeGlobalStats.active).toLocaleString()}
                icon={<CheckCircle className="h-4 w-4 text-green-500" />}
                description="Currently active positions"
            />
            <StatCard
                title="Require Account"
                value={(safeFilteredStats?.requires_account ?? safeGlobalStats.requires_account).toLocaleString()}
                icon={<UserCheck className="h-4 w-4 text-purple-500" />}
                description="Positions needing user accounts"
            />
            <StatCard
                title="Kagawad Positions"
                value={(safeFilteredStats?.kagawad_count ?? safeGlobalStats.kagawad_count).toLocaleString()}
                icon={<Users className="h-4 w-4 text-amber-500" />}
                description="Kagawad positions"
            />
        </div>
    );
}