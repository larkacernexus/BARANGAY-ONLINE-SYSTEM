import { Link, usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { SidebarItem, SidebarTab } from './types';

interface CompactMenuItemProps {
    item: SidebarItem;
    type?: SidebarTab;
}

export function CompactMenuItem({ item, type = 'operations' }: CompactMenuItemProps) {
    const { url: currentUrl } = usePage();
    const isActive = item.isActive
        ? item.isActive(currentUrl)
        : currentUrl === item.href || currentUrl.startsWith(item.href + '/');

    const colors = {
        operations: {
            activeText: 'text-blue-700 dark:text-blue-300',
            activeBg: 'bg-blue-50 dark:bg-blue-900/20',
        },
        settings: {
            activeText: 'text-purple-700 dark:text-purple-300',
            activeBg: 'bg-purple-50 dark:bg-purple-900/20',
        },
    };

    const currentColors = colors[type];

    return (
        <DropdownMenuItem asChild>
            <Link
                href={item.href}
                className={cn(
                    'flex cursor-pointer items-center gap-2 px-2 py-1.5 text-xs transition-colors hover:bg-gray-100 dark:hover:bg-gray-900',
                    isActive && cn(currentColors.activeBg, currentColors.activeText),
                )}
            >
                <div
                    className={cn(
                        'flex h-5 w-5 items-center justify-center rounded',
                        isActive
                            ? item.color ||
                                  (type === 'operations'
                                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-400'
                                      : 'bg-purple-100 text-purple-600 dark:bg-purple-800 dark:text-purple-400')
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-400',
                    )}
                >
                    <item.icon className="h-3 w-3" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                        <span className="truncate font-medium">{item.title}</span>
                        <div className="flex items-center gap-1">
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
                            {item.badge && (
                                <span
                                    className={cn(
                                        'ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                                        type === 'operations'
                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200'
                                            : 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200',
                                    )}
                                >
                                    {item.badge}
                                </span>
                            )}
                        </div>
                    </div>
                    {item.description && (
                        <span className="block truncate text-[10px] text-gray-500 dark:text-gray-400">
                            {item.description}
                        </span>
                    )}
                </div>
            </Link>
        </DropdownMenuItem>
    );
}