import { cn } from '@/lib/utils';
import { NavUser } from '@/components/nav-user';
import { SidebarTab } from './types';
import { User } from 'lucide-react';

interface SidebarFooterProps {
    isCollapsed: boolean;
    activeTab: SidebarTab;
}

export function SidebarFooterComponent({ isCollapsed, activeTab }: SidebarFooterProps) {
    if (!isCollapsed) {
        return (
            <div className="space-y-2">
                <NavUser />
                <div className="border-t border-gray-200 pt-2 dark:border-gray-800">
                    <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400">
                        <span>v1.2.0</span>
                        <span
                            className={cn(
                                'rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                                activeTab === 'operations'
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                    : 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
                            )}
                        >
                            {activeTab === 'operations' ? 'Operations' : 'Settings'}
                        </span>
                        <span>{new Date().getFullYear()}</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center space-y-1">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-800 shadow-md">
                <User className="h-3.5 w-3.5 text-white" />
            </div>
            <span
                className={cn(
                    'rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                    activeTab === 'operations'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
                )}
            >
                {activeTab === 'operations' ? 'Ops' : 'Settings'}
            </span>
        </div>
    );
}