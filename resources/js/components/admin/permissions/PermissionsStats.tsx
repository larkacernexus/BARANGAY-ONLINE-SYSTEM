// resources/js/components/admin/permissions/PermissionsStats.tsx
import { Shield, CheckCircle, Layers, Users } from 'lucide-react';
import { StatCard } from '@/components/adminui/stats-grid';

interface PermissionsStatsProps {
    globalStats: {
        total: number;
        active: number;
        inactive: number;
        modules: number;
        rolesAssigned: number;
        [key: string]: any;
    };
    filteredStats?: {
        total: number;
        active: number;
        inactive: number;
        modules: number;
        rolesAssigned: number;
    };
    isLoading?: boolean;
}

export default function PermissionsStats({ 
    globalStats, 
    filteredStats, 
    isLoading = false 
}: PermissionsStatsProps) {
    
    // Safe stats with fallbacks
    const safeGlobalStats = {
        total: globalStats?.total || 0,
        active: globalStats?.active || 0,
        inactive: globalStats?.inactive || 0,
        modules: globalStats?.modules || 0,
        rolesAssigned: globalStats?.rolesAssigned || 0
    };

    const safeFilteredStats = filteredStats ? {
        total: filteredStats?.total || 0,
        active: filteredStats?.active || 0,
        inactive: filteredStats?.inactive || 0,
        modules: filteredStats?.modules || 0,
        rolesAssigned: filteredStats?.rolesAssigned || 0
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
                title="Total Permissions"
                value={(safeFilteredStats?.total ?? safeGlobalStats.total).toLocaleString()}
                icon={<Shield className="h-4 w-4 text-blue-500" />}
                description={safeFilteredStats 
                    ? `${safeFilteredStats.active} active of ${safeGlobalStats.active}`
                    : "All system permissions"}
            />
            <StatCard
                title="Active Permissions"
                value={(safeFilteredStats?.active ?? safeGlobalStats.active).toLocaleString()}
                icon={<CheckCircle className="h-4 w-4 text-green-500" />}
                description="Currently active permissions"
            />
            <StatCard
                title="Modules"
                value={(safeFilteredStats?.modules ?? safeGlobalStats.modules).toLocaleString()}
                icon={<Layers className="h-4 w-4 text-purple-500" />}
                description="Unique modules"
            />
            <StatCard
                title="Roles Assigned"
                value={(safeFilteredStats?.rolesAssigned ?? safeGlobalStats.rolesAssigned).toLocaleString()}
                icon={<Users className="h-4 w-4 text-amber-500" />}
                description="Total role assignments"
            />
        </div>
    );
}