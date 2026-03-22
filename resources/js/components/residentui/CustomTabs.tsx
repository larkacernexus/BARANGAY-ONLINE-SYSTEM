// components/ui/custom-tabs.tsx
import { List, Clock, FileCheck, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

// Default tabs for backward compatibility
const DEFAULT_TABS = [
    { id: 'all', label: 'All', icon: List },
    { id: 'pending', label: 'Pending', icon: Clock },
    { id: 'issued', label: 'Issued', icon: FileCheck },
    { id: 'overdue', label: 'Overdue', icon: AlertCircle },
    { id: 'paid', label: 'Paid', icon: CheckCircle },
    { id: 'cancelled', label: 'Cancelled', icon: XCircle },
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
    tabsConfig?: TabConfig[];
}

export function CustomTabs({ 
    statusFilter, 
    handleTabChange, 
    getStatusCount,
    tabsConfig = DEFAULT_TABS
}: CustomTabsProps) {
    // Filter out any tabs without an id to prevent undefined keys
    const validTabs = tabsConfig.filter(tab => tab.id && typeof tab.id === 'string');
    
    // If no valid tabs, return null
    if (validTabs.length === 0) {
        console.warn('CustomTabs: No valid tabs with id found');
        return null;
    }
    
    // Ensure statusFilter is valid (exists in valid tabs)
    const activeTab = validTabs.some(tab => tab.id === statusFilter) ? statusFilter : validTabs[0]?.id || 'all';
    
    // Calculate total count for "all" tab
    const totalCount = validTabs.reduce((total, tab) => {
        if (tab.id !== 'all') {
            return total + (getStatusCount(tab.id) || 0);
        }
        return total;
    }, 0);

    return (
        <div className="overflow-x-auto scrollbar-hide">
            <div className="flex min-w-max space-x-1 pb-2">
                {validTabs.map((tab) => {
                    const Icon = tab.icon;
                    // Ensure count is a number
                    const count = tab.id === 'all' ? totalCount : (getStatusCount(tab.id) || 0);
                    const isActive = activeTab === tab.id;
                    
                    return (
                        <button
                            key={tab.id} // ✅ Use tab.id directly as key (already validated)
                            onClick={() => handleTabChange(tab.id)}
                            className={`
                                flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap
                                ${isActive 
                                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800' 
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900'
                                }
                                min-w-[70px]
                            `}
                        >
                            {Icon && <Icon className="h-3.5 w-3.5 flex-shrink-0" />}
                            <span>{tab.label}</span>
                            <span className={`
                                px-1.5 py-0.5 rounded-full text-[10px] font-medium min-w-[20px] text-center
                                ${isActive 
                                    ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300' 
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                }
                            `}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}