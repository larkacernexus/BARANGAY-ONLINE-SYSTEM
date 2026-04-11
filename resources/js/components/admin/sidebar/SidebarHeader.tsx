import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Building2 } from 'lucide-react';

const DASHBOARD_URL = '/admin/dashboard';

interface SidebarHeaderProps {
    isCollapsed: boolean;
}

export function SidebarHeaderComponent({ isCollapsed }: SidebarHeaderProps) {
    return (
        <div className="border-b border-gray-200 p-3 dark:border-gray-800">
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild size="lg">
                        <Link
                            href={DASHBOARD_URL}
                            className={cn(
                                'flex items-center gap-2 transition-all hover:opacity-90',
                                isCollapsed ? 'justify-center' : '',
                            )}
                        >
                            <div
                                className={cn(
                                    'flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg transition-transform hover:scale-105',
                                    isCollapsed ? 'h-8 w-8' : 'h-9 w-9',
                                )}
                            >
                                <Building2
                                    className={cn(
                                        'text-white',
                                        isCollapsed ? 'h-4 w-4' : 'h-5 w-5',
                                    )}
                                />
                            </div>
                            {!isCollapsed && (
                                <div className="flex flex-col overflow-hidden">
                                    <span className="truncate text-sm font-bold text-gray-900 dark:text-white">
                                        Brgy. Kibawe
                                    </span>
                                    <span className="truncate text-[10px] text-gray-500 dark:text-gray-400">
                                        Management System
                                    </span>
                                </div>
                            )}
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </div>
    );
}