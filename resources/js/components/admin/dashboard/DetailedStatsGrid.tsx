import { Link } from '@inertiajs/react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { StatItem } from '@/components/admin/dashboard/types/dashboard';

interface DetailedStatsGridProps {
    stats: StatItem[];
}

const getChangeIcon = (changeType: StatItem['changeType']) => {
    switch(changeType) {
        case 'increase': return <TrendingUp className="h-3 w-3" />;
        case 'decrease': return <TrendingDown className="h-3 w-3" />;
        default: return <Activity className="h-3 w-3" />;
    }
};

export function DetailedStatsGrid({ stats }: DetailedStatsGridProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                    <Link
                        key={stat.title}
                        href={stat.href}
                        className="group relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5 dark:border-sidebar-border dark:bg-gray-900"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    {stat.title}
                                </p>
                                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                                    {stat.value}
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                    {getChangeIcon(stat.changeType)}
                                    <p className={`text-sm font-medium ${stat.changeType === 'increase' ? 'text-emerald-600' : stat.changeType === 'decrease' ? 'text-rose-600' : 'text-gray-600'}`}>
                                        {stat.change}
                                    </p>
                                </div>
                            </div>
                            <div className={`${stat.color} rounded-xl p-3 text-white shadow-sm`}>
                                <Icon className="h-5 w-5" />
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}