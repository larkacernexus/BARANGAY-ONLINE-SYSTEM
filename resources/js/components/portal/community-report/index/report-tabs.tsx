// components/portal/reports/index/report-tabs.tsx

import { 
    List, 
    Clock, 
    Loader2, 
    TrendingUp, 
    CheckCircle, 
    XCircle 
} from 'lucide-react';

// Community Report-specific tabs configuration
export const REPORT_TABS_CONFIG = [
    { id: 'all', label: 'All Reports', icon: List },
    { id: 'pending', label: 'Pending', icon: Clock },
    { id: 'under_review', label: 'Under Review', icon: Loader2 },
    { id: 'in_progress', label: 'In Progress', icon: TrendingUp },
    { id: 'resolved', label: 'Resolved', icon: CheckCircle },
    { id: 'rejected', label: 'Rejected', icon: XCircle },
];

interface TabConfig {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}

interface ReportTabsProps {
    statusFilter: string;
    handleTabChange: (tab: string) => void;
    tabCounts: Record<string, number>;
    tabsConfig?: TabConfig[];
}

export function ReportTabs({ 
    statusFilter, 
    handleTabChange, 
    tabCounts,
    tabsConfig = REPORT_TABS_CONFIG
}: ReportTabsProps) {
    // Filter out any tabs without an id
    const validTabs = tabsConfig.filter(tab => tab.id && typeof tab.id === 'string');
    
    if (validTabs.length === 0) {
        console.warn('ReportTabs: No valid tabs with id found');
        return null;
    }
    
    const activeTab = validTabs.some(tab => tab.id === statusFilter) ? statusFilter : validTabs[0]?.id || 'all';
    const totalCount = tabCounts.all || 0;

    const getTabStyles = (tabId: string, isActive: boolean) => {
        if (!isActive) {
            return 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800';
        }
        
        switch (tabId) {
            case 'pending':
                return 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800';
            case 'under_review':
                return 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
            case 'in_progress':
                return 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800';
            case 'resolved':
                return 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800';
            case 'rejected':
                return 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800';
            default:
                return 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
        }
    };

    const getCountStyles = (tabId: string, isActive: boolean) => {
        if (!isActive) {
            return 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
        }
        
        switch (tabId) {
            case 'pending':
                return 'bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300';
            case 'under_review':
                return 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300';
            case 'in_progress':
                return 'bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300';
            case 'resolved':
                return 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300';
            case 'rejected':
                return 'bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300';
            default:
                return 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300';
        }
    };

    const formatTabLabel = (tab: TabConfig) => {
        if (tab.label.includes(' ')) {
            return tab.label;
        }
        return tab.id.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    return (
        <div className="overflow-x-auto scrollbar-hide">
            <div className="flex min-w-max space-x-1 pb-2">
                {validTabs.map((tab) => {
                    const Icon = tab.icon;
                    const count = tab.id === 'all' ? totalCount : (tabCounts[tab.id] || 0);
                    const isActive = activeTab === tab.id;
                    const displayLabel = formatTabLabel(tab);
                    
                    return (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`
                                flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap
                                ${getTabStyles(tab.id, isActive)}
                                min-w-[70px]
                                hover:shadow-sm
                            `}
                        >
                            {Icon && <Icon className="h-3.5 w-3.5 flex-shrink-0" />}
                            <span className="hidden sm:inline">{displayLabel}</span>
                            <span className="sm:hidden">
                                {tab.id === 'under_review' ? 'Review' : 
                                 tab.id === 'in_progress' ? 'Progress' :
                                 tab.id === 'resolved' ? 'Done' :
                                 tab.id === 'rejected' ? 'Rej' :
                                 displayLabel}
                            </span>
                            <span className={`
                                px-1.5 py-0.5 rounded-full text-[10px] font-medium min-w-[20px] text-center transition-colors duration-200
                                ${getCountStyles(tab.id, isActive)}
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