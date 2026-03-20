// components/residentui/modern-tabs.tsx
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { TabConfig } from '@/components/residentui/types/resident-ui';

interface ModernTabsProps {
    tabs: TabConfig[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
    getTabCount?: (tabId: string) => number;
    className?: string;
}

export function ModernTabs({ tabs, activeTab, onTabChange, getTabCount, className }: ModernTabsProps) {
    return (
        <div className={cn(
            "flex items-center gap-1 overflow-x-auto scrollbar-hide p-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700",
            className
        )}>
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const count = getTabCount?.(tab.id) ?? 0;
                const isActive = activeTab === tab.id;
                
                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 whitespace-nowrap flex-1",
                            isActive 
                                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg" 
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900"
                        )}
                    >
                        <Icon className={cn(
                            "h-4 w-4",
                            isActive ? "text-white" : "text-gray-500 dark:text-gray-400"
                        )} />
                        <span className="hidden sm:inline">{tab.label}</span>
                        <span className="sm:hidden">{tab.label.substring(0, 3)}</span>
                        {count > 0 && (
                            <Badge 
                                variant={isActive ? "secondary" : "outline"} 
                                className={cn(
                                    "ml-auto px-1.5 py-0.5 text-[10px] font-medium",
                                    isActive 
                                        ? "bg-white/20 text-white border-0" 
                                        : "bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-0"
                                )}
                            >
                                {count}
                            </Badge>
                        )}
                    </button>
                );
            })}
        </div>
    );
}