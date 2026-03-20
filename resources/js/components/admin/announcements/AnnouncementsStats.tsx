// resources/js/components/admin/announcements/AnnouncementsStats.tsx
import { Megaphone, CheckCircle, AlertCircle, CalendarClock } from 'lucide-react';
import { StatCard } from '@/components/adminui/stats-grid';

interface AnnouncementsStatsProps {
    globalStats: {
        total: number;
        active: number;
        expired: number;
        upcoming: number;
        [key: string]: any;
    };
    filteredStats?: {
        total: number;
        active: number;
        expired: number;
        upcoming: number;
    };
    isLoading?: boolean;
}

export default function AnnouncementsStats({ 
    globalStats, 
    filteredStats, 
    isLoading = false 
}: AnnouncementsStatsProps) {
    
    // Safe stats with fallbacks
    const safeGlobalStats = {
        total: globalStats?.total || 0,
        active: globalStats?.active || 0,
        expired: globalStats?.expired || 0,
        upcoming: globalStats?.upcoming || 0
    };

    const safeFilteredStats = filteredStats ? {
        total: filteredStats?.total || 0,
        active: filteredStats?.active || 0,
        expired: filteredStats?.expired || 0,
        upcoming: filteredStats?.upcoming || 0
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
                title="Total Announcements"
                value={(safeFilteredStats?.total ?? safeGlobalStats.total).toLocaleString()}
                icon={<Megaphone className="h-4 w-4 text-blue-500" />}
                description={safeFilteredStats 
                    ? `${safeFilteredStats.active} active of ${safeGlobalStats.active}`
                    : "All time announcements"}
            />
            <StatCard
                title="Active"
                value={(safeFilteredStats?.active ?? safeGlobalStats.active).toLocaleString()}
                icon={<CheckCircle className="h-4 w-4 text-green-500" />}
                description="Currently visible"
            />
            <StatCard
                title="Expired"
                value={(safeFilteredStats?.expired ?? safeGlobalStats.expired).toLocaleString()}
                icon={<AlertCircle className="h-4 w-4 text-amber-500" />}
                description="Past end date"
            />
            <StatCard
                title="Upcoming"
                value={(safeFilteredStats?.upcoming ?? safeGlobalStats.upcoming).toLocaleString()}
                icon={<CalendarClock className="h-4 w-4 text-purple-500" />}
                description="Scheduled announcements"
            />
        </div>
    );
}