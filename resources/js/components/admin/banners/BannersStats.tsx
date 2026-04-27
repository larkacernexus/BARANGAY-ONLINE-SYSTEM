// resources/js/components/admin/banners/BannersStats.tsx

import { Image, CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';
import { StatCard } from '@/components/adminui/stats-grid';

interface BannersStatsProps {
    globalStats: {
        total: number;
        active: number;
        scheduled: number;
        expired: number;
        inactive: number;
        [key: string]: any;
    };
    filteredStats?: {
        total: number;
        active: number;
        scheduled: number;
        expired: number;
        inactive: number;
    };
    isLoading?: boolean;
}

export default function BannersStats({ 
    globalStats, 
    filteredStats, 
    isLoading = false 
}: BannersStatsProps) {
    
    // Safe stats with fallbacks
    const safeGlobalStats = {
        total: globalStats?.total || 0,
        active: globalStats?.active || 0,
        scheduled: globalStats?.scheduled || 0,
        expired: globalStats?.expired || 0,
        inactive: globalStats?.inactive || 0
    };

    const safeFilteredStats = filteredStats ? {
        total: filteredStats?.total || 0,
        active: filteredStats?.active || 0,
        scheduled: filteredStats?.scheduled || 0,
        expired: filteredStats?.expired || 0,
        inactive: filteredStats?.inactive || 0
    } : null;

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-gray-900 rounded-lg border shadow-sm p-6 animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
                title="Total Banners"
                value={(safeFilteredStats?.total ?? safeGlobalStats.total).toLocaleString()}
                icon={<Image className="h-4 w-4 text-blue-500" />}
                description={safeFilteredStats 
                    ? `${safeFilteredStats.active} active of ${safeGlobalStats.active}`
                    : "All banners"}
            />
            <StatCard
                title="Active"
                value={(safeFilteredStats?.active ?? safeGlobalStats.active).toLocaleString()}
                icon={<CheckCircle className="h-4 w-4 text-green-500" />}
                description="Currently displaying"
            />
            <StatCard
                title="Scheduled"
                value={(safeFilteredStats?.scheduled ?? safeGlobalStats.scheduled).toLocaleString()}
                icon={<Clock className="h-4 w-4 text-blue-500" />}
                description="Future start date"
            />
            <StatCard
                title="Expired"
                value={(safeFilteredStats?.expired ?? safeGlobalStats.expired).toLocaleString()}
                icon={<AlertCircle className="h-4 w-4 text-gray-500" />}
                description="Past end date"
            />
            <StatCard
                title="Inactive"
                value={(safeFilteredStats?.inactive ?? safeGlobalStats.inactive).toLocaleString()}
                icon={<XCircle className="h-4 w-4 text-red-500" />}
                description="Manually disabled"
            />
        </div>
    );
}