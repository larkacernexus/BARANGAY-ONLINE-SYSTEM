import { StatItem } from '@/types/admin/dashboard/dashboard';
import { StatCard } from './StatCard';

interface StatsGridProps {
    stats: StatItem[];
}

export function StatsGrid({ stats }: StatsGridProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
                <StatCard key={stat.title} stat={stat} />
            ))}
        </div>
    );
}