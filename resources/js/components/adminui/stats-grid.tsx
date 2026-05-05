// components/adminui/stats-grid.tsx

import { ReactNode } from 'react';
import { Progress } from '@/components/ui/progress';

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
    footer?: string | ReactNode;
    valueClassName?: string;
    progress?: number;
}

const colorMap = {
    blue:   { icon: 'text-blue-600 dark:text-blue-400',   bg: 'bg-blue-50 dark:bg-blue-900/20',   border: 'border-blue-200 dark:border-blue-800' },
    green:  { icon: 'text-green-600 dark:text-green-400',  bg: 'bg-green-50 dark:bg-green-900/20',  border: 'border-green-200 dark:border-green-800' },
    red:    { icon: 'text-red-600 dark:text-red-400',      bg: 'bg-red-50 dark:bg-red-900/20',      border: 'border-red-200 dark:border-red-800' },
    yellow: { icon: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800' },
    purple: { icon: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800' },
    gray:   { icon: 'text-gray-600 dark:text-gray-400',    bg: 'bg-gray-50 dark:bg-gray-900/20',    border: 'border-gray-200 dark:border-gray-800' },
} as const;

const trendConfig = {
    up:      { style: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300', icon: '↑' },
    down:    { style: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',         icon: '↓' },
    neutral: { style: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',        icon: '→' },
} as const;

export function StatCard({ 
    title, value, icon, description, trend, trendValue,
    className = '', isLoading = false, onClick, color = 'blue',
    footer, valueClassName = '', progress
}: StatCardProps) {
    if (isLoading) {
        return (
            <div className={`bg-white dark:bg-gray-900 rounded-lg border p-3 animate-pulse ${className}`}>
                <div className="flex items-center justify-between gap-2">
                    <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                    <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="mt-1.5 h-6 bg-gray-200 dark:bg-gray-700 rounded w-12" />
            </div>
        );
    }

    const colors = colorMap[color];
    const trendStyle = trend ? trendConfig[trend] : null;

    return (
        <div 
            className={`bg-white dark:bg-gray-900 rounded-lg border p-3 transition-all duration-200 group ${onClick ? 'cursor-pointer hover:shadow-md hover:scale-[1.02]' : ''} ${className}`}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            {/* Top row: title + trend */}
            <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5 truncate">
                    {icon && <span className={`flex-shrink-0 ${colors.icon}`}>{icon}</span>}
                    {title}
                </p>
                {trend && trendValue && (
                    <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold flex-shrink-0 ${trendStyle!.style}`}>
                        {trendStyle!.icon} {trendValue}
                    </span>
                )}
            </div>

            {/* Value */}
            <p className={`text-lg font-bold text-gray-900 dark:text-white leading-tight ${valueClassName}`}>
                {value}
            </p>

            {/* Description */}
            {description && (
                <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1">
                    {description}
                </p>
            )}

            {/* Progress bar */}
            {progress !== undefined && progress !== null && (
                <div className="mt-2">
                    <Progress value={progress} className="h-1.5" />
                </div>
            )}

            {/* Footer */}
            {footer && (
                <div className="mt-2 pt-1.5 border-t border-gray-100 dark:border-gray-800 text-[10px] text-gray-500 dark:text-gray-400">
                    {footer}
                </div>
            )}
        </div>
    );
}

// ─── Grid ──────────────────────────────────────────────
const gridCols = { 2: 'grid-cols-1 sm:grid-cols-2', 3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3', 4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' } as const;
const gapMap   = { sm: 'gap-2', md: 'gap-3', lg: 'gap-4' } as const;

interface GridProps { children: ReactNode; className?: string; cols?: 2 | 3 | 4; spacing?: 'sm' | 'md' | 'lg'; }

export function StatsGrid({ children, className = '', cols = 4, spacing = 'md' }: GridProps) {
    return <div className={`grid ${gridCols[cols]} ${gapMap[spacing]} ${className}`}>{children}</div>;
}

export function StatsRow({ children, className = '', spacing = 'md' }: Omit<GridProps, 'cols'>) {
    return <div className={`flex flex-wrap ${gapMap[spacing]} ${className}`}>{children}</div>;
}