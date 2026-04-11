// components/portal/clearance/index/clearance-tabs.tsx

import { 
    List, 
    Clock, 
    DollarSign, 
    Loader2, 
    CheckCircle, 
    FileCheck, 
    XCircle 
} from 'lucide-react';

// Clearance-specific tabs configuration
export const CLEARANCE_TABS_CONFIG = [
    { id: 'all', label: 'All', icon: List },
    { id: 'pending', label: 'Pending', icon: Clock },
    { id: 'pending_payment', label: 'Pending Payment', icon: DollarSign },
    { id: 'processing', label: 'Processing', icon: Loader2 },
    { id: 'approved', label: 'Approved', icon: CheckCircle },
    { id: 'issued', label: 'Issued', icon: FileCheck },
    { id: 'rejected', label: 'Rejected', icon: XCircle },
    { id: 'cancelled', label: 'Cancelled', icon: XCircle },
];

interface TabConfig {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}

interface ClearanceTabsProps {
    statusFilter: string;
    handleTabChange: (tab: string) => void;
    tabCounts: Record<string, number>;
    tabsConfig?: TabConfig[];
}

export function ClearanceTabs({ 
    statusFilter, 
    handleTabChange, 
    tabCounts,
    tabsConfig = CLEARANCE_TABS_CONFIG
}: ClearanceTabsProps) {
    // Filter out any tabs without an id to prevent undefined keys
    const validTabs = tabsConfig.filter(tab => tab.id && typeof tab.id === 'string');
    
    // If no valid tabs, return null
    if (validTabs.length === 0) {
        console.warn('ClearanceTabs: No valid tabs with id found');
        return null;
    }
    
    // Ensure statusFilter is valid (exists in valid tabs)
    const activeTab = validTabs.some(tab => tab.id === statusFilter) ? statusFilter : validTabs[0]?.id || 'all';
    
    // Get total count from tabCounts
    const totalCount = tabCounts.all || 0;

    // Status-specific styles for clearance tabs
    const getTabStyles = (tabId: string, isActive: boolean) => {
        if (!isActive) {
            return 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800';
        }
        
        switch (tabId) {
            case 'pending':
                return 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800';
            case 'pending_payment':
                return 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800';
            case 'processing':
                return 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
            case 'approved':
                return 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';
            case 'issued':
                return 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800';
            case 'rejected':
                return 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800';
            case 'cancelled':
                return 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700';
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
            case 'pending_payment':
                return 'bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-300';
            case 'processing':
                return 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300';
            case 'approved':
                return 'bg-emerald-100 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-300';
            case 'issued':
                return 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300';
            case 'rejected':
                return 'bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300';
            case 'cancelled':
                return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
            default:
                return 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300';
        }
    };

    // Format label for display (handle pending_payment -> Pending Payment)
    const formatTabLabel = (tab: TabConfig) => {
        // If it's a custom label that includes spaces, use it as is
        if (tab.label.includes(' ')) {
            return tab.label;
        }
        // Otherwise format with spaces
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
                                {tab.id === 'pending_payment' ? 'Pay' : 
                                 tab.id === 'processing' ? 'Proc' :
                                 tab.id === 'approved' ? 'Appr' :
                                 tab.id === 'issued' ? 'Issue' :
                                 tab.id === 'rejected' ? 'Rej' :
                                 tab.id === 'cancelled' ? 'Canc' :
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