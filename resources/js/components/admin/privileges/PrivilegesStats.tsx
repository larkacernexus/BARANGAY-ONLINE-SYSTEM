// resources/js/components/admin/privileges/PrivilegesStats.tsx

import { Award, CheckCircle, Users, UserCheck } from 'lucide-react';
import { StatCard } from '@/components/adminui/stats-grid';

interface PrivilegesStatsProps {
    globalStats: {
        total: number;
        active: number;
        totalAssignments: number;
        activeAssignments: number;
        [key: string]: any;
    };
    filteredStats?: {
        total: number;
        active: number;
        totalAssignments: number;
        activeAssignments: number;
    };
    isLoading?: boolean;
}

export default function PrivilegesStats({ 
    globalStats, 
    filteredStats, 
    isLoading = false 
}: PrivilegesStatsProps) {
    
    // Safe stats with fallbacks
    const safeGlobalStats = {
        total: globalStats?.total || 0,
        active: globalStats?.active || 0,
        totalAssignments: globalStats?.totalAssignments || 0,
        activeAssignments: globalStats?.activeAssignments || 0
    };

    const safeFilteredStats = filteredStats ? {
        total: filteredStats?.total || 0,
        active: filteredStats?.active || 0,
        totalAssignments: filteredStats?.totalAssignments || 0,
        activeAssignments: filteredStats?.activeAssignments || 0
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
                title="Total Privileges"
                value={(safeFilteredStats?.total ?? safeGlobalStats.total).toLocaleString()}
                icon={<Award className="h-4 w-4 text-amber-500" />}
                description={safeFilteredStats 
                    ? `${safeFilteredStats.active} active of ${safeGlobalStats.active}`
                    : "All privileges"}
            />
            <StatCard
                title="Active Privileges"
                value={(safeFilteredStats?.active ?? safeGlobalStats.active).toLocaleString()}
                icon={<CheckCircle className="h-4 w-4 text-green-500" />}
                description="Currently available"
            />
            <StatCard
                title="Total Assignments"
                value={(safeFilteredStats?.totalAssignments ?? safeGlobalStats.totalAssignments).toLocaleString()}
                icon={<Users className="h-4 w-4 text-blue-500" />}
                description="Residents with privileges"
            />
            <StatCard
                title="Active Assignments"
                value={(safeFilteredStats?.activeAssignments ?? safeGlobalStats.activeAssignments).toLocaleString()}
                icon={<UserCheck className="h-4 w-4 text-purple-500" />}
                description="Verified & active"
            />
        </div>
    );
}