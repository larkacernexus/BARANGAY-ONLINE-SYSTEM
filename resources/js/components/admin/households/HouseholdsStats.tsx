// resources/js/components/admin/households/HouseholdsStats.tsx
import { Home, Users, CheckCircle, MapPin } from 'lucide-react';
import { StatCard } from '@/components/adminui/stats-grid';

interface HouseholdsStatsProps {
    globalStats: {
        total: number;
        active: number;
        inactive: number;
        totalMembers: number;
        averageMembers: number;
        purokCount: number;
        [key: string]: any;
    };
    filteredStats?: {
        total: number;
        active: number;
        totalMembers: number;
        averageMembers: number;
    };
    isLoading?: boolean;
}

export default function HouseholdsStats({ 
    globalStats, 
    filteredStats, 
    isLoading = false 
}: HouseholdsStatsProps) {
    
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
                title="Total Households"
                value={Number(filteredStats?.total ?? globalStats.total).toLocaleString()}
                icon={<Home className="h-4 w-4 text-blue-500" />}
                description={filteredStats ? `of ${globalStats.total} total` : "All households"}
            />
            <StatCard
                title="Active Households"
                value={Number(filteredStats?.active ?? globalStats.active).toLocaleString()}
                icon={<CheckCircle className="h-4 w-4 text-green-500" />}
                description={filteredStats ? `of ${globalStats.active} active` : "Registered households"}
            />
            <StatCard
                title="Total Members"
                value={Number(filteredStats?.totalMembers ?? globalStats.totalMembers).toLocaleString()}
                icon={<Users className="h-4 w-4 text-purple-500" />}
                description={filteredStats ? `of ${globalStats.totalMembers} total` : "Residents across households"}
            />
            <StatCard
                title="Average Members"
                value={Number(filteredStats?.averageMembers ?? globalStats.averageMembers).toFixed(1)}
                icon={<Users className="h-4 w-4 text-amber-500" />}
                description="Per household average"
            />
        </div>
    );
}