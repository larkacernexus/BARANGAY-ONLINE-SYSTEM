import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReactNode } from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon?: ReactNode;
    className?: string;
}

export function StatCard({ title, value, description, icon, className = '' }: StatCardProps) {
    return (
        <Card className={`overflow-hidden ${className}`}>
            <CardHeader className="pb-1 sm:pb-2 p-3 sm:p-4">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-500 flex items-center gap-2">
                    {icon}
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
                <div className="text-lg sm:text-xl md:text-2xl font-bold">{value}</div>
                {description && (
                    <div className="text-xs text-gray-500 mt-0.5">
                        {description}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

interface StatsCardsProps {
    stats: Array<{
        title: string;
        value: string | number;
        description?: string;
        icon?: ReactNode;
        className?: string;
    }>;
    columns?: 2 | 4;
}

export function StatsCards({ stats, columns = 4 }: StatsCardsProps) {
    const gridCols = columns === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-4';
    
    return (
        <div className={`grid ${gridCols} gap-2 sm:gap-4`}>
            {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
            ))}
        </div>
    );
}