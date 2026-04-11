import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LayoutGrid, Settings } from 'lucide-react';
import { SidebarTab } from './types';

interface TabSwitcherProps {
    activeTab: SidebarTab;
    handleTabChange: (tab: SidebarTab) => void;
    isCollapsed: boolean;
}

export function TabSwitcher({ activeTab, handleTabChange, isCollapsed }: TabSwitcherProps) {
    if (isCollapsed) {
        return (
            <div className="mb-3 flex flex-col items-center gap-1 px-1">
                <Button
                    size="icon"
                    variant={activeTab === 'operations' ? 'default' : 'ghost'}
                    className={cn(
                        'h-7 w-7 transition-all',
                        activeTab === 'operations'
                            ? 'bg-gradient-to-br from-blue-600 to-blue-800 text-white hover:from-blue-700 hover:to-blue-900'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-900',
                    )}
                    onClick={() => handleTabChange('operations')}
                >
                    <LayoutGrid className="h-3.5 w-3.5" />
                </Button>
                <Button
                    size="icon"
                    variant={activeTab === 'settings' ? 'default' : 'ghost'}
                    className={cn(
                        'h-7 w-7 transition-all',
                        activeTab === 'settings'
                            ? 'bg-gradient-to-br from-purple-600 to-purple-800 text-white hover:from-purple-700 hover:to-purple-900'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-900',
                    )}
                    onClick={() => handleTabChange('settings')}
                >
                    <Settings className="h-3.5 w-3.5" />
                </Button>
            </div>
        );
    }

    return (
        <div className="mb-3 flex rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900">
            <Button
                variant="ghost"
                size="sm"
                className={cn(
                    'h-8 flex-1 rounded text-xs transition-all',
                    activeTab === 'operations'
                        ? 'bg-white text-blue-700 shadow-sm dark:bg-gray-900 dark:text-blue-300'
                        : 'hover:bg-gray-200 dark:hover:bg-gray-700',
                )}
                onClick={() => handleTabChange('operations')}
            >
                <LayoutGrid className="mr-1.5 h-3.5 w-3.5" />
                Operations
            </Button>
            <Button
                variant="ghost"
                size="sm"
                className={cn(
                    'h-8 flex-1 rounded text-xs transition-all',
                    activeTab === 'settings'
                        ? 'bg-white text-purple-700 shadow-sm dark:bg-gray-900 dark:text-purple-300'
                        : 'hover:bg-gray-200 dark:hover:bg-gray-700',
                )}
                onClick={() => handleTabChange('settings')}
            >
                <Settings className="mr-1.5 h-3.5 w-3.5" />
                Settings
            </Button>
        </div>
    );
}