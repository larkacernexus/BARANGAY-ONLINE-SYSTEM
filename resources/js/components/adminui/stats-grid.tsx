import { ReactNode } from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon?: ReactNode;
    description?: string | ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    className?: string;
}

export function StatCard({ 
    title, 
    value, 
    icon, 
    description, 
    trend, 
    trendValue,
    className = '' 
}: StatCardProps) {
    return (
        <div className={`bg-white dark:bg-gray-800 rounded-lg border p-4 sm:p-6 ${className}`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        {icon && <span className="flex-shrink-0">{icon}</span>}
                        {title}
                    </p>
                    <p className="mt-2 text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                        {value}
                    </p>
                </div>
                {trend && trendValue && (
                    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        trend === 'up' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                        trend === 'down' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                    }`}>
                        {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
                    </div>
                )}
            </div>
            {description && (
                <p className="mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {description}
                </p>
            )}
        </div>
    );
}

interface StatsGridProps {
    children: ReactNode;
    className?: string;
    cols?: 2 | 3 | 4;
}

export function StatsGrid({ 
    children, 
    className = '',
    cols = 4 
}: StatsGridProps) {
    const gridCols = {
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
    };

    return (
        <div className={`grid ${gridCols[cols]} gap-4 ${className}`}>
            {children}
        </div>
    );
}