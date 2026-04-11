import { Link, usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { SidebarItem, SidebarTab } from './types';

interface RegularMenuItemProps {
    item: SidebarItem;
    isCollapsed: boolean;
    type?: SidebarTab;
}

export function RegularMenuItem({ item, isCollapsed, type = 'operations' }: RegularMenuItemProps) {
    const { url: currentUrl } = usePage();
    const isActive = item.isActive
        ? item.isActive(currentUrl)
        : currentUrl === item.href || currentUrl.startsWith(item.href + '/');

    const colors = {
        operations: {
            activeBg: 'bg-blue-50 dark:bg-blue-900/20',
            activeText: 'text-blue-700 dark:text-blue-300',
            activeBorder: 'bg-blue-600 dark:bg-blue-400',
            iconBg: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400',
            badgeBg: 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200',
        },
        settings: {
            activeBg: 'bg-purple-50 dark:bg-purple-900/20',
            activeText: 'text-purple-700 dark:text-purple-300',
            activeBorder: 'bg-purple-600 dark:bg-purple-400',
            iconBg: 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-400',
            badgeBg: 'bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200',
        },
    };

    const currentColors = colors[type];

    return (
        <SidebarMenuItem>
            <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                    <SidebarMenuButton asChild>
                        <Link
                            href={item.href}
                            className={cn(
                                'relative flex items-center gap-1.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50',
                                isCollapsed ? 'justify-center px-1' : 'px-2',
                                isActive && cn(currentColors.activeBg, currentColors.activeText),
                            )}
                        >
                            {isActive && !isCollapsed && (
                                <div
                                    className={cn(
                                        'absolute top-1/2 left-0 h-5 w-1 -translate-y-1/2 transform rounded-r-full',
                                        currentColors.activeBorder,
                                    )}
                                />
                            )}
                            <div className="relative">
                                <div
                                    className={cn(
                                        'flex items-center justify-center rounded transition-colors',
                                        isCollapsed ? 'h-6 w-6' : 'h-7 w-7',
                                        isActive
                                            ? currentColors.iconBg
                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-400',
                                    )}
                                >
                                    <item.icon className={cn(isCollapsed ? 'h-3 w-3' : 'h-3.5 w-3.5')} />
                                </div>
                                {item.isNew && !isCollapsed && (
                                    <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-900" />
                                )}
                            </div>
                            {!isCollapsed && (
                                <>
                                    <div className="flex min-w-0 flex-1 flex-col items-start">
                                        <div className="flex items-center gap-1">
                                            <span className="truncate text-xs font-medium">
                                                {item.title}
                                            </span>
                                            {item.isNew && (
                                                <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-800 dark:text-green-300">
                                                    New
                                                </span>
                                            )}
                                            {item.isUpdated && (
                                                <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-800 dark:text-blue-300">
                                                    Updated
                                                </span>
                                            )}
                                        </div>
                                        {item.description && (
                                            <span className="truncate text-[10px] leading-tight text-gray-500 dark:text-gray-400">
                                                {item.description}
                                            </span>
                                        )}
                                    </div>
                                    {item.badge && (
                                        <span
                                            className={cn(
                                                'ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                                                currentColors.badgeBg,
                                            )}
                                        >
                                            {item.badge}
                                        </span>
                                    )}
                                </>
                            )}
                        </Link>
                    </SidebarMenuButton>
                </TooltipTrigger>
                {isCollapsed && (
                    <TooltipContent
                        side="right"
                        className="flex max-w-[200px] flex-col items-start"
                    >
                        <div className="flex items-center gap-1">
                            <p className="text-sm font-medium">{item.title}</p>
                            {item.isNew && (
                                <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-800 dark:text-green-300">
                                    New
                                </span>
                            )}
                        </div>
                        {item.description && (
                            <p className="mt-0.5 text-xs text-gray-500">{item.description}</p>
                        )}
                        {item.badge && (
                            <span
                                className={cn(
                                    'mt-1 rounded-full px-1.5 py-0.5 text-xs font-medium',
                                    currentColors.badgeBg,
                                )}
                            >
                                {item.badge}
                            </span>
                        )}
                    </TooltipContent>
                )}
            </Tooltip>
        </SidebarMenuItem>
    );
}