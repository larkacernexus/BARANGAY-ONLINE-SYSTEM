// resources/js/components/admin/blotters/BlottersStats.tsx

import { FileText, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { StatCard } from '@/components/adminui/stats-grid';

interface BlottersStatsProps {
    globalStats: {
        total: number;
        pending: number;
        investigating: number;
        resolved: number;
        archived: number;
        urgent: number;
        high: number;
        medium: number;
        low: number;
        today: number;
        thisWeek: number;
        thisMonth: number;
    };
    filteredStats?: {
        total: number;
        pending: number;
        investigating: number;
        resolved: number;
        archived: number;
        urgent: number;
        high: number;
        medium: number;
        low: number;
    };
    isLoading?: boolean;
}

export default function BlottersStats({ 
    globalStats, 
    filteredStats, 
    isLoading = false 
}: BlottersStatsProps) {
    
    const safeGlobalStats = {
        total: globalStats?.total || 0,
        pending: globalStats?.pending || 0,
        investigating: globalStats?.investigating || 0,
        resolved: globalStats?.resolved || 0,
        archived: globalStats?.archived || 0,
        urgent: globalStats?.urgent || 0,
        high: globalStats?.high || 0,
        medium: globalStats?.medium || 0,
        low: globalStats?.low || 0,
        today: globalStats?.today || 0,
        thisWeek: globalStats?.thisWeek || 0,
        thisMonth: globalStats?.thisMonth || 0,
    };

    const safeFilteredStats = filteredStats ? {
        total: filteredStats?.total || 0,
        pending: filteredStats?.pending || 0,
        investigating: filteredStats?.investigating || 0,
        resolved: filteredStats?.resolved || 0,
        archived: filteredStats?.archived || 0,
        urgent: filteredStats?.urgent || 0,
        high: filteredStats?.high || 0,
        medium: filteredStats?.medium || 0,
        low: filteredStats?.low || 0,
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
                title="Total Cases"
                value={(safeFilteredStats?.total ?? safeGlobalStats.total).toLocaleString()}
                icon={<FileText className="h-4 w-4 text-blue-500" />}
                description={safeFilteredStats 
                    ? `${safeFilteredStats.total} of ${safeGlobalStats.total}`
                    : "All blotter cases"}
            />
            <StatCard
                title="Pending"
                value={(safeFilteredStats?.pending ?? safeGlobalStats.pending).toLocaleString()}
                icon={<Clock className="h-4 w-4 text-yellow-500" />}
                description="Awaiting action"
            />
            <StatCard
                title="Investigating"
                value={(safeFilteredStats?.investigating ?? safeGlobalStats.investigating).toLocaleString()}
                icon={<AlertCircle className="h-4 w-4 text-blue-500" />}
                description="Under investigation"
            />
            <StatCard
                title="Resolved"
                value={(safeFilteredStats?.resolved ?? safeGlobalStats.resolved).toLocaleString()}
                icon={<CheckCircle className="h-4 w-4 text-green-500" />}
                description="Cases closed"
            />
        </div>
    );
}