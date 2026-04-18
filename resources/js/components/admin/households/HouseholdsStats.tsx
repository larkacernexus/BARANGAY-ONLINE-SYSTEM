// resources/js/components/admin/households/HouseholdsStats.tsx

import { Home, Users, CheckCircle, MapPin } from 'lucide-react';
import { StatCard } from '@/components/adminui/stats-grid';

interface HouseholdsStatsProps {
    globalStats?: {
        total?: number;
        active?: number;
        inactive?: number;
        totalMembers?: number;
        averageMembers?: number;
        purokCount?: number;
        [key: string]: any;
    };
    filteredStats?: {
        total?: number;
        active?: number;
        inactive?: number;
        totalMembers?: number;
        averageMembers?: number;
        purokCount?: number;
    };
    isLoading?: boolean;
}

export default function HouseholdsStats({ 
    globalStats = {},
    filteredStats, 
    isLoading = false 
}: HouseholdsStatsProps) {
    
    // Loading skeleton
    if (isLoading) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6 animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    </div>
                ))}
            </div>
        );
    }

    // Use filtered stats if available, otherwise fall back to global stats
    const stats = filteredStats || globalStats;

    // Safely access values with fallbacks
    const total = stats.total ?? 0;
    const active = stats.active ?? 0;
    const totalMembers = stats.totalMembers ?? 0;
    const averageMembers = stats.averageMembers ?? 0;
    const globalTotal = globalStats?.total ?? total;
    const globalActive = globalStats?.active ?? active;
    const globalMembers = globalStats?.totalMembers ?? totalMembers;

    // Determine if we're showing filtered stats
    const isFiltered = filteredStats !== undefined;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                title="Total Households"
                value={total.toLocaleString()}
                icon={<Home className="h-4 w-4 text-blue-500" />}
                description={isFiltered && globalTotal !== total 
                    ? `${((total / globalTotal) * 100).toFixed(0)}% of ${globalTotal.toLocaleString()} total`
                    : "All registered households"
                }
            />
            <StatCard
                title="Active Households"
                value={active.toLocaleString()}
                icon={<CheckCircle className="h-4 w-4 text-green-500" />}
                description={isFiltered && globalActive !== active
                    ? `${((active / globalActive) * 100).toFixed(0)}% of ${globalActive.toLocaleString()} active`
                    : "Currently active households"
                }
            />
            <StatCard
                title="Total Members"
                value={totalMembers.toLocaleString()}
                icon={<Users className="h-4 w-4 text-purple-500" />}
                description={isFiltered && globalMembers !== totalMembers
                    ? `${((totalMembers / globalMembers) * 100).toFixed(0)}% of ${globalMembers.toLocaleString()} total`
                    : "Residents across all households"
                }
            />
            <StatCard
                title="Average Members"
                value={averageMembers.toFixed(1)}
                icon={<Users className="h-4 w-4 text-amber-500" />}
                description={isFiltered 
                    ? "Per household (filtered)"
                    : "Per household average"
                }
            />
        </div>
    );
}