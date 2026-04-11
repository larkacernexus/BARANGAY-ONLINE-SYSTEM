import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Sparkles } from 'lucide-react';
import { QuickAction } from './types';

interface QuickActionItemProps {
    action: QuickAction;
    isCollapsed: boolean;
}

const iconClasses: Record<string, string> = {
    blue: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400',
    purple: 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-100 dark:bg-orange-800 text-orange-600 dark:text-orange-400',
    red: 'bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-400',
    indigo: 'bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-400',
    amber: 'bg-amber-100 dark:bg-amber-800 text-amber-600 dark:text-amber-400',
    cyan: 'bg-cyan-100 dark:bg-cyan-800 text-cyan-600 dark:text-cyan-400',
    lime: 'bg-lime-100 dark:bg-lime-800 text-lime-600 dark:text-lime-400',
    pink: 'bg-pink-100 dark:bg-pink-800 text-pink-600 dark:text-pink-400',
    violet: 'bg-violet-100 dark:bg-violet-800 text-violet-600 dark:text-violet-400',
    yellow: 'bg-yellow-100 dark:bg-yellow-800 text-yellow-600 dark:text-yellow-400',
    emerald: 'bg-emerald-100 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-400',
    teal: 'bg-teal-100 dark:bg-teal-800 text-teal-600 dark:text-teal-400',
};

const hoverIconClasses: Record<string, string> = {
    blue: 'hover:bg-blue-200 dark:hover:bg-blue-700 hover:text-blue-700 dark:hover:text-blue-300',
    green: 'hover:bg-green-200 dark:hover:bg-green-700 hover:text-green-700 dark:hover:text-green-300',
    purple: 'hover:bg-purple-200 dark:hover:bg-purple-700 hover:text-purple-700 dark:hover:text-purple-300',
    orange: 'hover:bg-orange-200 dark:hover:bg-orange-700 hover:text-orange-700 dark:hover:text-orange-300',
    red: 'hover:bg-red-200 dark:hover:bg-red-700 hover:text-red-700 dark:hover:text-red-300',
    indigo: 'hover:bg-indigo-200 dark:hover:bg-indigo-700 hover:text-indigo-700 dark:hover:text-indigo-300',
    amber: 'hover:bg-amber-200 dark:hover:bg-amber-700 hover:text-amber-700 dark:hover:text-amber-300',
    cyan: 'hover:bg-cyan-200 dark:hover:bg-cyan-700 hover:text-cyan-700 dark:hover:text-cyan-300',
    lime: 'hover:bg-lime-200 dark:hover:bg-lime-700 hover:text-lime-700 dark:hover:text-lime-300',
    pink: 'hover:bg-pink-200 dark:hover:bg-pink-700 hover:text-pink-700 dark:hover:text-pink-300',
    violet: 'hover:bg-violet-200 dark:hover:bg-violet-700 hover:text-violet-700 dark:hover:text-violet-300',
    yellow: 'hover:bg-yellow-200 dark:hover:bg-yellow-700 hover:text-yellow-700 dark:hover:text-yellow-300',
    emerald: 'hover:bg-emerald-200 dark:hover:bg-emerald-700 hover:text-emerald-700 dark:hover:text-emerald-300',
    teal: 'hover:bg-teal-200 dark:hover:bg-teal-700 hover:text-teal-700 dark:hover:text-teal-300',
};

export function QuickActionItem({ action, isCollapsed }: QuickActionItemProps) {
    if (isCollapsed) {
        return (
            <SidebarMenuItem>
                <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                        <SidebarMenuButton asChild>
                            <Link href={action.href} className="flex justify-center px-1">
                                <div
                                    className={cn(
                                        'flex items-center justify-center rounded-lg transition-all hover:scale-110',
                                        'h-6 w-6',
                                        iconClasses[action.color],
                                        hoverIconClasses[action.color],
                                    )}
                                >
                                    <action.icon className="h-3 w-3" />
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </TooltipTrigger>
                    <TooltipContent
                        side="right"
                        className="flex max-w-[180px] flex-col items-start"
                    >
                        <div className="flex items-center gap-1">
                            <p className="text-sm font-medium">{action.title}</p>
                            <Sparkles className="h-3 w-3 text-amber-500" />
                        </div>
                        <p className="text-xs text-gray-500">Quick action</p>
                    </TooltipContent>
                </Tooltip>
            </SidebarMenuItem>
        );
    }

    return (
        <SidebarMenuItem>
            <SidebarMenuButton asChild>
                <Link
                    href={action.href}
                    className={cn(
                        'group flex items-center gap-2 px-2 py-1.5 transition-all',
                        'rounded-md hover:bg-gray-50 dark:hover:bg-gray-900/50',
                    )}
                >
                    <div
                        className={cn(
                            'flex items-center justify-center rounded-lg transition-transform',
                            'h-7 w-7 shrink-0',
                            iconClasses[action.color],
                            'group-hover:scale-110',
                        )}
                    >
                        <action.icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                            <span className="truncate text-xs font-medium">
                                {action.title}
                            </span>
                            <Sparkles className="h-2.5 w-2.5 shrink-0 text-amber-500 dark:text-amber-400" />
                        </div>
                        <span className="truncate text-[10px] text-gray-500 dark:text-gray-400">
                            {action.description || 'Quick action'}
                        </span>
                    </div>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}