// resources/js/components/residentui/receipts/ReceiptTabs.tsx

import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Receipt, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle,
  CreditCard,
  FileText,
  Calendar
} from 'lucide-react';

// Receipt-specific tab configurations
const RECEIPT_TABS = [
  { 
    id: 'all', 
    label: 'All Receipts', 
    icon: Receipt, 
    color: 'text-gray-500',
    activeColor: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-gray-100 dark:bg-gray-900',
    activeBgColor: 'bg-blue-50 dark:bg-blue-900/30',
    borderColor: 'border-gray-200 dark:border-gray-700',
    activeBorderColor: 'border-blue-200 dark:border-blue-800'
  },
  { 
    id: 'paid', 
    label: 'Paid', 
    icon: CheckCircle, 
    color: 'text-green-500',
    activeColor: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    activeBgColor: 'bg-green-100 dark:bg-green-900/30',
    borderColor: 'border-green-200 dark:border-green-800',
    activeBorderColor: 'border-green-300 dark:border-green-700'
  },
  { 
    id: 'partial', 
    label: 'Partial', 
    icon: Clock, 
    color: 'text-yellow-500',
    activeColor: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    activeBgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    activeBorderColor: 'border-yellow-300 dark:border-yellow-700'
  },
  { 
    id: 'pending', 
    label: 'Pending', 
    icon: AlertCircle, 
    color: 'text-orange-500',
    activeColor: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    activeBgColor: 'bg-orange-100 dark:bg-orange-900/30',
    borderColor: 'border-orange-200 dark:border-orange-800',
    activeBorderColor: 'border-orange-300 dark:border-orange-700'
  },
  { 
    id: 'cancelled', 
    label: 'Cancelled', 
    icon: XCircle, 
    color: 'text-red-500',
    activeColor: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    activeBgColor: 'bg-red-100 dark:bg-red-900/30',
    borderColor: 'border-red-200 dark:border-red-800',
    activeBorderColor: 'border-red-300 dark:border-red-700'
  },
];

// Receipt type tabs (for filtering by type)
const RECEIPT_TYPE_TABS = [
  { 
    id: 'clearance', 
    label: 'Clearance', 
    icon: FileText, 
    color: 'text-blue-500',
    activeColor: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    activeBgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  { 
    id: 'fee', 
    label: 'Fees', 
    icon: CreditCard, 
    color: 'text-purple-500',
    activeColor: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    activeBgColor: 'bg-purple-100 dark:bg-purple-900/30',
  },
  { 
    id: 'official', 
    label: 'Official', 
    icon: Receipt, 
    color: 'text-green-500',
    activeColor: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    activeBgColor: 'bg-green-100 dark:bg-green-900/30',
  },
];

// Date range tabs
const DATE_RANGE_TABS = [
  { 
    id: 'today', 
    label: 'Today', 
    icon: Calendar, 
  },
  { 
    id: 'week', 
    label: 'This Week', 
    icon: Calendar, 
  },
  { 
    id: 'month', 
    label: 'This Month', 
    icon: Calendar, 
  },
  { 
    id: 'year', 
    label: 'This Year', 
    icon: Calendar, 
  },
];

interface TabConfig {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color?: string;
    activeColor?: string;
    bgColor?: string;
    activeBgColor?: string;
    borderColor?: string;
    activeBorderColor?: string;
}

interface ReceiptTabsProps {
    statusFilter: string;
    handleTabChange: (tab: string) => void;
    getStatusCount: (status: string) => number;
    tabsConfig?: TabConfig[];
    variant?: 'status' | 'type' | 'date';
    showCounts?: boolean;
    className?: string;
}

export function ReceiptTabs({ 
    statusFilter, 
    handleTabChange, 
    getStatusCount,
    tabsConfig,
    variant = 'status',
    showCounts = true,
    className
}: ReceiptTabsProps) {
    // Select appropriate tab configuration based on variant
    let tabs: TabConfig[] = [];
    
    if (tabsConfig) {
        tabs = tabsConfig;
    } else {
        switch (variant) {
            case 'type':
                tabs = RECEIPT_TYPE_TABS;
                break;
            case 'date':
                tabs = DATE_RANGE_TABS;
                break;
            case 'status':
            default:
                tabs = RECEIPT_TABS;
                break;
        }
    }

    // Calculate total count for "all" tab
    const getAllCount = () => {
        if (variant === 'status') {
            return tabs.slice(1).reduce((total, tab) => {
                return total + (getStatusCount(tab.id) || 0);
            }, 0);
        }
        return getStatusCount('all');
    };

    return (
        <div className={cn("overflow-x-auto scrollbar-hide", className)}>
            <div className="flex min-w-max space-x-2 pb-2">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const count = tab.id === 'all' ? getAllCount() : getStatusCount(tab.id);
                    const isActive = statusFilter === tab.id;
                    
                    // Dynamic classes based on active state and variant
                    const tabClasses = cn(
                        "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap",
                        "hover:scale-105 transform",
                        isActive 
                            ? tab.activeBgColor || 'bg-blue-50 dark:bg-blue-900/30' 
                            : tab.bgColor || 'bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-700',
                        isActive && (tab.activeBorderColor || 'border border-blue-200 dark:border-blue-800'),
                        !isActive && (tab.borderColor || 'border border-transparent')
                    );
                    
                    const iconClasses = cn(
                        "h-3.5 w-3.5 flex-shrink-0 transition-colors",
                        isActive ? tab.activeColor || 'text-blue-600 dark:text-blue-400' : tab.color || 'text-gray-500'
                    );
                    
                    const countClasses = cn(
                        "px-1.5 py-0.5 rounded-full text-[10px] font-medium min-w-[20px] text-center transition-colors",
                        isActive 
                            ? tab.activeBgColor ? tab.activeBgColor.replace('bg-', 'bg-').replace('/30', '/50') : 'bg-blue-100 dark:bg-blue-800' 
                            : 'bg-gray-200 dark:bg-gray-700',
                        isActive ? tab.activeColor || 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'
                    );
                    
                    return (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={tabClasses}
                            title={`${tab.label} ${count > 0 ? `(${count})` : ''}`}
                        >
                            <Icon className={iconClasses} />
                            <span>{tab.label}</span>
                            {showCounts && count > 0 && (
                                <span className={countClasses}>
                                    {count > 99 ? '99+' : count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// Compact version for mobile or space-constrained areas
export function CompactReceiptTabs({ 
    statusFilter, 
    handleTabChange, 
    getStatusCount,
    variant = 'status',
    className
}: ReceiptTabsProps) {
    const tabs = variant === 'status' ? RECEIPT_TABS : 
                 variant === 'type' ? RECEIPT_TYPE_TABS : 
                 DATE_RANGE_TABS;

    return (
        <div className={cn("flex flex-wrap gap-1", className)}>
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const count = tab.id === 'all' 
                    ? tabs.slice(1).reduce((total, t) => total + (getStatusCount(t.id) || 0), 0)
                    : getStatusCount(tab.id);
                const isActive = statusFilter === tab.id;
                
                return (
                    <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={cn(
                            "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors",
                            isActive 
                                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' 
                                : 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        )}
                    >
                        <Icon className="h-3 w-3" />
                        <span className="hidden sm:inline">{tab.label}</span>
                        {count > 0 && (
                            <span className="ml-0.5 px-1 rounded-full bg-current bg-opacity-20 text-[10px]">
                                {count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}

// Usage example:
/*
import { ReceiptTabs, CompactReceiptTabs } from '@/components/residentui/receipts/ReceiptTabs';

// In your component:
<ReceiptTabs
    statusFilter={statusFilter}
    handleTabChange={handleTabChange}
    getStatusCount={(status) => {
        switch(status) {
            case 'all': return stats.total_count;
            case 'paid': return stats.paid_count;
            case 'partial': return stats.partial_count;
            case 'pending': return stats.pending_count;
            case 'cancelled': return stats.cancelled_count;
            default: return 0;
        }
    }}
    variant="status"
/>

// For type filtering:
<ReceiptTabs
    statusFilter={typeFilter}
    handleTabChange={handleTypeChange}
    getStatusCount={(type) => {
        switch(type) {
            case 'clearance': return stats.clearance_count;
            case 'fee': return stats.fee_count;
            case 'official': return stats.official_count;
            default: return 0;
        }
    }}
    variant="type"
    showCounts={true}
/>
*/