// /components/residentui/reports/ReportsTabs.tsx
import { REPORT_TABS, TabConfig } from '@/components/residentui/reports/constants';
import { cn } from '@/lib/utils';

interface ReportsTabsProps {
    statusFilter: string;
    handleTabChange: (tabId: string) => void;
    getStatusCount: (status: string) => number;
    tabsConfig?: TabConfig[];
}

export const ReportsTabs = ({
    statusFilter,
    handleTabChange,
    getStatusCount,
    tabsConfig = REPORT_TABS,
}: ReportsTabsProps) => {
    return (
        <div className="border-b border-gray-200 dark:border-gray-800">
            <div className="flex space-x-8 overflow-x-auto scrollbar-hide">
                {tabsConfig.map((tab) => {
                    const isActive = statusFilter === tab.id;
                    const count = getStatusCount(tab.status);
                    
                    return (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={cn(
                                "group inline-flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 whitespace-nowrap",
                                isActive
                                    ? `border-${tab.color}-500 text-${tab.color}-600 dark:text-${tab.color}-400`
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                            )}
                        >
                            <tab.icon className={cn(
                                "h-4 w-4",
                                isActive ? `text-${tab.color}-500` : "text-gray-400 group-hover:text-gray-500"
                            )} />
                            <span>{tab.label}</span>
                            {count > 0 && (
                                <span className={cn(
                                    "ml-2 rounded-full px-2 py-0.5 text-xs font-medium transition-colors",
                                    isActive
                                        ? `bg-${tab.color}-100 text-${tab.color}-700 dark:bg-${tab.color}-900/30 dark:text-${tab.color}-300`
                                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                                )}>
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};