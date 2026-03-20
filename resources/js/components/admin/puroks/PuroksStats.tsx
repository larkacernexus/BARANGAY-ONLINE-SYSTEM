// resources/js/components/admin/puroks/PuroksStats.tsx
import { MapPin, CheckCircle, Home, Users } from 'lucide-react';
import { StatCard } from '@/components/adminui/stats-grid';

interface PuroksStatsProps {
    globalStats: {
        total: number;
        active: number;
        totalHouseholds: number;
        totalResidents: number;
        [key: string]: any;
    };
    filteredStats?: {
        total: number;
        active: number;
        totalHouseholds: number;
        totalResidents: number;
    };
    isLoading?: boolean;
}

export default function PuroksStats({ 
    globalStats, 
    filteredStats, 
    isLoading = false 
}: PuroksStatsProps) {
    
    // Safe stats with fallbacks
    const safeGlobalStats = {
        total: globalStats?.total || 0,
        active: globalStats?.active || 0,
        totalHouseholds: globalStats?.totalHouseholds || 0,
        totalResidents: globalStats?.totalResidents || 0
    };

    const safeFilteredStats = filteredStats ? {
        total: filteredStats?.total || 0,
        active: filteredStats?.active || 0,
        totalHouseholds: filteredStats?.totalHouseholds || 0,
        totalResidents: filteredStats?.totalResidents || 0
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
                title="Total Puroks"
                value={(safeFilteredStats?.total ?? safeGlobalStats.total).toLocaleString()}
                icon={<MapPin className="h-4 w-4 text-blue-500" />}
                description={safeFilteredStats 
                    ? `${safeFilteredStats.active} active of ${safeGlobalStats.active}`
                    : "All puroks"}
            />
            <StatCard
                title="Active Puroks"
                value={(safeFilteredStats?.active ?? safeGlobalStats.active).toLocaleString()}
                icon={<CheckCircle className="h-4 w-4 text-green-500" />}
                description="Currently active puroks"
            />
            <StatCard
                title="Total Households"
                value={(safeFilteredStats?.totalHouseholds ?? safeGlobalStats.totalHouseholds).toLocaleString()}
                icon={<Home className="h-4 w-4 text-purple-500" />}
                description="Across all puroks"
            />
            <StatCard
                title="Total Residents"
                value={(safeFilteredStats?.totalResidents ?? safeGlobalStats.totalResidents).toLocaleString()}
                icon={<Users className="h-4 w-4 text-amber-500" />}
                description="Population count"
            />
        </div>
    );
}