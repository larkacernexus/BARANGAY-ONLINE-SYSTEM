import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    icon: LucideIcon;
    title: string;
    value: number;
    color: string;
    isCollapsed: boolean;
}

export function StatsCard({ icon: Icon, title, value, color, isCollapsed }: StatsCardProps) {
    if (isCollapsed) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900">
                        <Icon className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                    </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                    <p className="text-sm font-medium">{title}</p>
                    <p className="text-xs text-gray-500">{value} items</p>
                </TooltipContent>
            </Tooltip>
        );
    }

    return (
        <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-2 py-1.5 dark:bg-gray-900/50">
            <div className={cn('flex h-6 w-6 items-center justify-center rounded', color)}>
                <Icon className="h-3 w-3" />
            </div>
            <div className="min-w-0 flex-1">
                <div className="text-[10px] text-gray-500 dark:text-gray-400">{title}</div>
                <div className="text-xs font-semibold">{value}</div>
            </div>
        </div>
    );
}