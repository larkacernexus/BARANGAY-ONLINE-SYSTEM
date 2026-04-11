// stats-grid.tsx - Generic fix for common stats grid pattern
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Safe number formatter
const formatNumber = (value: any): string => {
    if (value === undefined || value === null) return '0';
    if (typeof value === 'number') {
        if (value % 1 !== 0) {
            return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
        return value.toLocaleString();
    }
    const num = Number(value);
    if (isNaN(num)) return String(value);
    if (num % 1 !== 0) {
        return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return num.toLocaleString();
};

interface StatItem {
    label: string;
    value: any;
    change?: number;
    icon?: React.ReactNode;
    color?: string;
}

interface StatsGridProps {
    stats: StatItem[];
    className?: string;
}

export function StatsGrid({ stats, className = '' }: StatsGridProps) {
    if (!stats || !Array.isArray(stats) || stats.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No statistics available
            </div>
        );
    }

    return (
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
            {stats.map((stat, index) => (
                <Card key={index} className="overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                            {stat.label}
                        </CardTitle>
                        {stat.icon && <div className="text-gray-400">{stat.icon}</div>}
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatNumber(stat.value)}
                        </div>
                        {stat.change !== undefined && (
                            <p className={`text-xs ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'} mt-1`}>
                                {stat.change >= 0 ? '+' : ''}{stat.change}% from last period
                            </p>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}