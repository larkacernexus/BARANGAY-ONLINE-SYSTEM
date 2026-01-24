import { List, Clock, FileCheck, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

// Default tabs for backward compatibility
const DEFAULT_TABS = [
    { id: 'all', label: 'All', icon: List, count: 'all' },
    { id: 'pending', label: 'Pending', icon: Clock, count: 'pending' },
    { id: 'issued', label: 'Issued', icon: FileCheck, count: 'issued' },
    { id: 'overdue', label: 'Overdue', icon: AlertCircle, count: 'overdue' },
    { id: 'paid', label: 'Paid', icon: CheckCircle, count: 'paid' },
    { id: 'cancelled', label: 'Cancelled', icon: XCircle, count: 'cancelled' },
];

interface TabConfig {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}

interface CustomTabsProps {
    statusFilter: string;
    handleTabChange: (tab: string) => void;
    getStatusCount: (status: string) => number;
    tabsConfig?: TabConfig[]; // Make this optional for backward compatibility
}

export function CustomTabs({ 
    statusFilter, 
    handleTabChange, 
    getStatusCount,
    tabsConfig = DEFAULT_TABS // Use default if not provided
}: CustomTabsProps) {
    return (
        <div className="overflow-x-auto scrollbar-hide">
            <div className="flex min-w-max space-x-1 pb-2">
                {tabsConfig.map((tab) => {
                    const Icon = tab.icon;
                    const count = tab.id === 'all' 
                        ? tabsConfig.reduce((total, t) => {
                            if (t.id !== 'all') {
                                const tabCount = getStatusCount(t.id);
                                return total + (tabCount || 0);
                            }
                            return total;
                        }, 0)
                        : getStatusCount(tab.id);
                    
                    const isActive = statusFilter === tab.id;
                    
                    return (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`
                                flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap
                                ${isActive 
                                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800' 
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }
                                min-w-[70px]
                            `}
                        >
                            <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                            <span>{tab.label}</span>
                            <span className={`
                                px-1.5 py-0.5 rounded-full text-[10px] font-medium min-w-[20px] text-center
                                ${isActive 
                                    ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300' 
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                }
                            `}>
                                {count || 0}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}