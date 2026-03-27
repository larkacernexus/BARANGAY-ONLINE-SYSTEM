// components/adminui/stats-grid.tsx
import { ReactNode, ReactElement } from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon?: ReactNode;
    description?: string | ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    className?: string;
    isLoading?: boolean;
    onClick?: () => void;
    color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
}

export function StatCard({ 
    title, 
    value, 
    icon, 
    description, 
    trend, 
    trendValue,
    className = '',
    isLoading = false,
    onClick,
    color = 'blue'
}: StatCardProps) {
    const colorClasses = {
        blue: {
            icon: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            border: 'border-blue-200 dark:border-blue-800'
        },
        green: {
            icon: 'text-green-600 dark:text-green-400',
            bg: 'bg-green-50 dark:bg-green-900/20',
            border: 'border-green-200 dark:border-green-800'
        },
        red: {
            icon: 'text-red-600 dark:text-red-400',
            bg: 'bg-red-50 dark:bg-red-900/20',
            border: 'border-red-200 dark:border-red-800'
        },
        yellow: {
            icon: 'text-yellow-600 dark:text-yellow-400',
            bg: 'bg-yellow-50 dark:bg-yellow-900/20',
            border: 'border-yellow-200 dark:border-yellow-800'
        },
        purple: {
            icon: 'text-purple-600 dark:text-purple-400',
            bg: 'bg-purple-50 dark:bg-purple-900/20',
            border: 'border-purple-200 dark:border-purple-800'
        },
        gray: {
            icon: 'text-gray-600 dark:text-gray-400',
            bg: 'bg-gray-50 dark:bg-gray-900/20',
            border: 'border-gray-200 dark:border-gray-800'
        }
    };

    const getTrendStyles = () => {
        if (!trend) return '';
        switch (trend) {
            case 'up':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'down':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    const getTrendIcon = () => {
        if (!trend) return null;
        switch (trend) {
            case 'up':
                return '↑';
            case 'down':
                return '↓';
            default:
                return '→';
        }
    };

    if (isLoading) {
        return (
            <div className={`bg-white dark:bg-gray-900 rounded-lg border p-4 sm:p-6 ${className} animate-pulse`}>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    </div>
                    <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="mt-2 h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            </div>
        );
    }

    return (
        <div 
            className={`
                bg-white dark:bg-gray-900 
                rounded-lg border 
                p-4 sm:p-6 
                transition-all duration-200
                ${onClick ? 'cursor-pointer hover:shadow-md hover:scale-[1.02]' : ''}
                ${className}
            `}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        {icon && (
                            <span className={`flex-shrink-0 ${colorClasses[color].icon}`}>
                                {icon}
                            </span>
                        )}
                        {title}
                    </p>
                    <p className="mt-2 text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                        {value}
                    </p>
                </div>
                {trend && trendValue && (
                    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getTrendStyles()}`}>
                        {getTrendIcon()} {trendValue}
                    </div>
                )}
            </div>
            {description && (
                <div className="mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {description}
                </div>
            )}
        </div>
    );
}

interface StatsGridProps {
    children: ReactNode;
    className?: string;
    cols?: 2 | 3 | 4;
    spacing?: 'sm' | 'md' | 'lg';
}

export function StatsGrid({ 
    children, 
    className = '',
    cols = 4,
    spacing = 'md'
}: StatsGridProps) {
    const gridCols = {
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
    };

    const spacingClasses = {
        sm: 'gap-3',
        md: 'gap-4',
        lg: 'gap-6'
    };

    return (
        <div className={`grid ${gridCols[cols]} ${spacingClasses[spacing]} ${className}`}>
            {children}
        </div>
    );
}

// Optional: Add a StatsRow component for horizontal layouts
interface StatsRowProps {
    children: ReactNode;
    className?: string;
    spacing?: 'sm' | 'md' | 'lg';
}

export function StatsRow({ 
    children, 
    className = '',
    spacing = 'md'
}: StatsRowProps) {
    const spacingClasses = {
        sm: 'gap-3',
        md: 'gap-4',
        lg: 'gap-6'
    };

    return (
        <div className={`flex flex-wrap ${spacingClasses[spacing]} ${className}`}>
            {children}
        </div>
    );
}