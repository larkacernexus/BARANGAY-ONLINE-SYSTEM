// /components/residentui/dashboard/MetricCard.tsx
import React from 'react';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassCard } from './GlassCard';
import { useMobile } from '@/components/residentui/hooks/use-mobile';

interface MetricCardProps {
    title: string;
    value: number | string;
    icon: React.ComponentType<{ className?: string }>;
    trend?: string;
    trendUp?: boolean;
    className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    trendUp = true, 
    className = '' 
}) => {
    const isMobile = useMobile();
    
    return (
        <GlassCard interactive gradient className={cn(`p-4 sm:p-6`, className)}>
            <div className="flex items-start justify-between">
                <div className="space-y-1 sm:space-y-2">
                    <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                    <p className="text-xl sm:text-3xl font-semibold text-gray-900 dark:text-white">{value}</p>
                    {trend && !isMobile && (
                        <div className="flex items-center gap-1.5">
                            <TrendingUp className={cn("h-4 w-4", trendUp ? 'text-emerald-500' : 'text-rose-500')} />
                            <span className={cn("text-xs sm:text-sm font-medium", trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>
                                {trend}
                            </span>
                        </div>
                    )}
                </div>
                <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25">
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
            </div>
            {trend && isMobile && (
                <div className="flex items-center gap-1.5 mt-2">
                    <TrendingUp className={cn("h-3 w-3", trendUp ? 'text-emerald-500' : 'text-rose-500')} />
                    <span className={cn("text-xs font-medium", trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>
                        {trend}
                    </span>
                </div>
            )}
        </GlassCard>
    );
};