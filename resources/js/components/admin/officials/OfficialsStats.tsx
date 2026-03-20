// components/admin/officials/OfficialsStats.tsx
import { Users, CheckCircle, Shield, TargetIcon } from 'lucide-react';
import { StatCard } from '@/components/adminui/stats-grid';
import { Badge } from '@/components/ui/badge';
import { getColorClass } from '@/admin-utils/officialsUtils';

interface OfficialsStatsProps {
    stats: any;
    positions: Record<string, { name: string; order: number }>;
    committees: Record<string, string>;
}

export default function OfficialsStats({ stats, positions, committees }: OfficialsStatsProps) {
    // Safe stats with fallbacks
    const safeStats = {
        total: stats?.total || 0,
        current: stats?.current || 0,
        regular: stats?.regular || 0,
        by_position: stats?.by_position || {}
    };

    const getPositionCounts = () => {
        const positionEntries = Object.entries(safeStats.by_position || {});
        return positionEntries.slice(0, 3).map(([position, count]) => ({
            name: positions[position]?.name || position,
            count: count as number
        }));
    };

    return (
        <>
            {/* Main Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Officials"
                    value={safeStats.total.toLocaleString()}
                    icon={<Users className="h-4 w-4 text-blue-500" />}
                    description={`${safeStats.current} current • ${safeStats.regular} regular`}
                />
                <StatCard
                    title="Current Term"
                    value={safeStats.current.toLocaleString()}
                    icon={<CheckCircle className="h-4 w-4 text-green-500" />}
                    description="Active officials"
                />
                <StatCard
                    title="Captain"
                    value={(safeStats.by_position?.captain || 0).toLocaleString()}
                    icon={<Shield className="h-4 w-4 text-purple-500" />}
                    description="Captain • Kagawads • Secretary"
                />
                <StatCard
                    title="Committee Heads"
                    value={Object.keys(committees).length.toLocaleString()}
                    icon={<TargetIcon className="h-4 w-4 text-amber-500" />}
                    description="Committee assignments"
                />
            </div>

            {/* Position Distribution */}
            {getPositionCounts().length > 0 && (
                <div className="bg-white dark:bg-gray-900 rounded-lg border shadow-sm p-6">
                    <h3 className="text-lg font-semibold mb-4">Position Distribution</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {getPositionCounts().map((position, index) => (
                            <div key={position.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{position.name}</span>
                                <Badge className={getColorClass(['blue', 'green', 'purple'][index] || 'blue')}>
                                    {position.count}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}