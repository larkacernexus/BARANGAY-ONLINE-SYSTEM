import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { SidebarMenuItem } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { SidebarCategory, SidebarTab } from './types';
import { RegularMenuItem } from './RegularMenuItem';
import { CompactMenuItem } from './CompactMenuItem';

interface CategoryItemProps {
    category: SidebarCategory;
    type?: SidebarTab;
    isCollapsed: boolean;
}

export function CategoryItem({ category, type = 'operations', isCollapsed }: CategoryItemProps) {
    const { url: currentUrl } = usePage();

    // If only 1 item, render as regular menu item
    if (category.items.length === 1) {
        return (
            <RegularMenuItem
                item={category.items[0]}
                isCollapsed={isCollapsed}
                type={type}
            />
        );
    }

    // For multiple items, use dropdown
    const isAnyActive = category.items.some((item) =>
        item.isActive ? item.isActive(currentUrl) : currentUrl.startsWith(item.href),
    );

    const colors = {
        operations: {
            activeText: 'text-blue-700 dark:text-blue-300',
            activeBg: 'bg-blue-50 dark:bg-blue-900/20',
            activeBorder: 'border-blue-600 dark:border-blue-400',
            iconBg: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400',
        },
        settings: {
            activeText: 'text-purple-700 dark:text-purple-300',
            activeBg: 'bg-purple-50 dark:bg-purple-900/20',
            activeBorder: 'border-purple-600 dark:border-purple-400',
            iconBg: 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-400',
        },
    };

    const currentColors = colors[type];

    if (isCollapsed) {
        return (
            <SidebarMenuItem>
                <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                        <div className="flex justify-center px-1">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={cn(
                                            'h-7 w-7 transition-colors',
                                            isAnyActive &&
                                                cn(currentColors.iconBg, 'border', currentColors.activeBorder),
                                        )}
                                    >
                                        <category.icon className="h-3.5 w-3.5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    side="right"
                                    align="start"
                                    className="max-h-[400px] w-64 overflow-y-auto"
                                >
                                    <DropdownMenuLabel className="flex items-center gap-2 text-xs font-semibold">
                                        <category.icon className="h-3.5 w-3.5" />
                                        {category.title}
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {category.items.map((item) => (
                                        <CompactMenuItem
                                            key={`${category.title}-${item.title}-${item.href}`}
                                            item={item}
                                            type={type}
                                        />
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        <p className="text-sm font-medium">{category.title}</p>
                        <p className="text-xs text-gray-500">{category.items.length} items</p>
                    </TooltipContent>
                </Tooltip>
            </SidebarMenuItem>
        );
    }

    return (
        <SidebarMenuItem>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className={cn(
                            'w-full justify-start px-2 py-1.5 text-xs font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-900',
                            isAnyActive && currentColors.activeBg,
                        )}
                    >
                        <div className="flex w-full items-center gap-2">
                            <div
                                className={cn(
                                    'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded',
                                    isAnyActive
                                        ? currentColors.iconBg
                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-400',
                                )}
                            >
                                <category.icon className="h-3 w-3" />
                            </div>
                            <div className="flex flex-1 items-center justify-between">
                                <span className="truncate text-left">{category.title}</span>
                                <ChevronDown className="h-3 w-3 flex-shrink-0 text-gray-400" />
                            </div>
                            {isAnyActive && (
                                <div
                                    className={cn(
                                        'h-1.5 w-1.5 rounded-full',
                                        currentColors.activeBorder.replace('border-', 'bg-'),
                                    )}
                                />
                            )}
                        </div>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    side="right"
                    align="start"
                    className="max-h-[400px] w-64 overflow-y-auto"
                >
                    <DropdownMenuLabel className="flex items-center gap-2 text-xs font-semibold">
                        <category.icon className="h-3.5 w-3.5" />
                        {category.title}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {category.items.map((item) => (
                        <CompactMenuItem
                            key={`${category.title}-${item.title}-${item.href}`}
                            item={item}
                            type={type}
                        />
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </SidebarMenuItem>
    );
}