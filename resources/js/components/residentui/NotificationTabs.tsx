// =============================================
// components/residentui/NotificationTabs.tsx
// =============================================

import React from 'react';
import { 
    Inbox, 
    Mail, 
    MailOpen, 
    Bell, 
    DollarSign, 
    CreditCard, 
    FileCheck, 
    AlertCircle, 
    Info, 
    Home,
    Users,
    Tag,
    X
} from 'lucide-react';

// Shadcn UI Components (if needed)
import { Badge } from '@/components/ui/badge';

// Notification-specific tabs configuration
const NOTIFICATION_TABS = [
    { 
        id: 'all', 
        label: 'All Notifications', 
        icon: Inbox, 
        description: 'All your notifications',
        color: 'blue'
    },
    { 
        id: 'unread', 
        label: 'Unread', 
        icon: Mail, 
        description: 'Notifications waiting to be read',
        color: 'orange'
    },
    { 
        id: 'read', 
        label: 'Read', 
        icon: MailOpen, 
        description: 'Notifications you\'ve viewed',
        color: 'green'
    },
];

// Optional type filter tabs (can be shown in dropdown or as secondary tabs)
export const NOTIFICATION_TYPE_TABS = [
    { id: 'fee', label: 'Fee Notifications', icon: DollarSign, color: 'emerald' },
    { id: 'payment', label: 'Payment Notifications', icon: CreditCard, color: 'green' },
    { id: 'clearance', label: 'Clearance Notifications', icon: FileCheck, color: 'blue' },
    { id: 'report', label: 'Report Notifications', icon: AlertCircle, color: 'orange' },
    { id: 'announcement', label: 'Announcements', icon: Info, color: 'purple' },
    { id: 'household', label: 'Household Updates', icon: Home, color: 'indigo' },
    { id: 'member', label: 'Member Updates', icon: Users, color: 'pink' },
];

interface TabConfig {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color?: string;
    description?: string;
}

interface NotificationTabsProps {
    activeTab: string; // 'all' | 'unread' | 'read'
    onTabChange: (tab: string) => void;
    counts: {
        all: number;
        unread: number;
        read: number;
    };
    typeCounts?: {
        fee?: number;
        payment?: number;
        clearance?: number;
        report?: number;
        announcement?: number;
        household?: number;
        member?: number;
        [key: string]: number | undefined;
    };
    showTypeFilters?: boolean;
    onTypeFilterChange?: (type: string | null) => void;
    activeTypeFilter?: string | null;
    variant?: 'default' | 'compact' | 'mobile';
}

export function NotificationTabs({ 
    activeTab, 
    onTabChange, 
    counts,
    typeCounts = {},
    showTypeFilters = false,
    onTypeFilterChange,
    activeTypeFilter = null,
    variant = 'default'
}: NotificationTabsProps) {
    
    // Variant: Mobile - compact tabs for small screens
    if (variant === 'mobile') {
        return (
            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <button
                    onClick={() => onTabChange('all')}
                    className={`
                        flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium rounded-md transition-all
                        ${activeTab === 'all'
                            ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }
                    `}
                >
                    <Inbox className="h-3.5 w-3.5" />
                    <span>All</span>
                    {counts.all > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-[10px]">
                            {counts.all > 99 ? '99+' : counts.all}
                        </span>
                    )}
                </button>
                
                <button
                    onClick={() => onTabChange('unread')}
                    className={`
                        flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium rounded-md transition-all
                        ${activeTab === 'unread'
                            ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm' 
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }
                    `}
                >
                    <Mail className="h-3.5 w-3.5" />
                    <span>Unread</span>
                    {counts.unread > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full text-[10px]">
                            {counts.unread > 99 ? '99+' : counts.unread}
                        </span>
                    )}
                </button>
                
                <button
                    onClick={() => onTabChange('read')}
                    className={`
                        flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium rounded-md transition-all
                        ${activeTab === 'read'
                            ? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-sm' 
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }
                    `}
                >
                    <MailOpen className="h-3.5 w-3.5" />
                    <span>Read</span>
                    {counts.read > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-[10px]">
                            {counts.read > 99 ? '99+' : counts.read}
                        </span>
                    )}
                </button>
            </div>
        );
    }
    
    // Variant: Compact - smaller tabs with just icons on very small screens
    if (variant === 'compact') {
        return (
            <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit">
                <button
                    onClick={() => onTabChange('all')}
                    className={`
                        relative p-2 rounded-md transition-all
                        ${activeTab === 'all'
                            ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }
                    `}
                    title="All Notifications"
                >
                    <Inbox className="h-4 w-4" />
                    {counts.all > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-blue-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                            {counts.all > 9 ? '9+' : counts.all}
                        </span>
                    )}
                </button>
                
                <button
                    onClick={() => onTabChange('unread')}
                    className={`
                        relative p-2 rounded-md transition-all
                        ${activeTab === 'unread'
                            ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm' 
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }
                    `}
                    title="Unread Notifications"
                >
                    <Mail className="h-4 w-4" />
                    {counts.unread > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-orange-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                            {counts.unread > 9 ? '9+' : counts.unread}
                        </span>
                    )}
                </button>
                
                <button
                    onClick={() => onTabChange('read')}
                    className={`
                        relative p-2 rounded-md transition-all
                        ${activeTab === 'read'
                            ? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-sm' 
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }
                    `}
                    title="Read Notifications"
                >
                    <MailOpen className="h-4 w-4" />
                    {counts.read > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-green-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                            {counts.read > 9 ? '9+' : counts.read}
                        </span>
                    )}
                </button>
            </div>
        );
    }
    
    // Default variant - full tabs with labels (NO SCROLL)
    return (
        <div className="space-y-4">
            {/* Main Notification Tabs - NO SCROLLING */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    {/* Tabs Container - No overflow, fixed width with flex wrap if needed */}
                    <div className="flex flex-wrap items-center gap-2" aria-label="Notification tabs">
                        {NOTIFICATION_TABS.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            const count = counts[tab.id as keyof typeof counts] || 0;
                            
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => onTabChange(tab.id)}
                                    className={`
                                        group relative py-2 px-3 flex items-center gap-2 font-medium text-sm transition-all duration-200 rounded-lg whitespace-nowrap
                                        ${isActive 
                                            ? `bg-${tab.color}-50 text-${tab.color}-600 dark:bg-${tab.color}-900/30 dark:text-${tab.color}-400 ring-1 ring-${tab.color}-200 dark:ring-${tab.color}-800` 
                                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                                        }
                                    `}
                                >
                                    <Icon className={cn(
                                        "h-4 w-4",
                                        isActive ? `text-${tab.color}-500` : "text-gray-500"
                                    )} />
                                    <span>{tab.label}</span>
                                    {count > 0 && (
                                        <span className={cn(
                                            "ml-1 px-2 py-0.5 text-xs font-medium rounded-full",
                                            isActive 
                                                ? `bg-${tab.color}-100 text-${tab.color}-600 dark:bg-${tab.color}-900/50 dark:text-${tab.color}-400`
                                                : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                        )}>
                                            {count > 99 ? '99+' : count}
                                        </span>
                                    )}
                                    
                                    {/* Tooltip on hover */}
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                        {tab.description}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Optional Type Filter Button */}
                    {showTypeFilters && onTypeFilterChange && (
                        <NotificationTypeDropdown 
                            typeCounts={typeCounts}
                            activeType={activeTypeFilter}
                            onTypeChange={onTypeFilterChange}
                        />
                    )}
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>{counts.all.toLocaleString()} total</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>{counts.unread.toLocaleString()} unread</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>{counts.read.toLocaleString()} read</span>
                </div>
            </div>
        </div>
    );
}

// =============================================
// Notification Type Dropdown Component
// =============================================

interface NotificationTypeDropdownProps {
    typeCounts: Record<string, number | undefined>;
    activeType: string | null;
    onTypeChange: (type: string | null) => void;
}

function NotificationTypeDropdown({ typeCounts, activeType, onTypeChange }: NotificationTypeDropdownProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    
    // Filter to only show types that have counts
    const availableTypes = NOTIFICATION_TYPE_TABS.filter(tab => 
        typeCounts[tab.id] && typeCounts[tab.id]! > 0
    );
    
    if (availableTypes.length === 0) return null;
    
    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap
                    ${activeType 
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800' 
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }
                `}
            >
                <Tag className="h-4 w-4" />
                <span className="hidden sm:inline">{activeType ? NOTIFICATION_TYPE_TABS.find(t => t.id === activeType)?.label || 'Filter by type' : 'Filter by type'}</span>
                <span className="sm:hidden">Type</span>
                {activeType && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onTypeChange(null);
                            setIsOpen(false);
                        }}
                        className="ml-1 p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full"
                    >
                        <X className="h-3 w-3" />
                    </button>
                )}
            </button>
            
            {isOpen && (
                <>
                    <div 
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                        <div className="p-2">
                            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Filter by type
                            </div>
                            <div className="space-y-1 max-h-64 overflow-y-auto">
                                {availableTypes.map((type) => {
                                    const Icon = type.icon;
                                    const count = typeCounts[type.id] || 0;
                                    const isActive = activeType === type.id;
                                    
                                    return (
                                        <button
                                            key={type.id}
                                            onClick={() => {
                                                onTypeChange(isActive ? null : type.id);
                                                setIsOpen(false);
                                            }}
                                            className={`
                                                w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all
                                                ${isActive 
                                                    ? `bg-${type.color}-50 text-${type.color}-700 dark:bg-${type.color}-900/30 dark:text-${type.color}-400` 
                                                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                                }
                                            `}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "p-1 rounded",
                                                    isActive ? `bg-${type.color}-100 dark:bg-${type.color}-900/50` : 'bg-gray-100 dark:bg-gray-700'
                                                )}>
                                                    <Icon className={cn(
                                                        "h-3.5 w-3.5",
                                                        isActive ? `text-${type.color}-600 dark:text-${type.color}-400` : 'text-gray-500'
                                                    )} />
                                                </div>
                                                <span>{type.label}</span>
                                            </div>
                                            <Badge variant="secondary" className="text-xs">
                                                {count}
                                            </Badge>
                                        </button>
                                    );
                                })}
                            </div>
                            
                            {activeType && (
                                <>
                                    <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
                                    <button
                                        onClick={() => {
                                            onTypeChange(null);
                                            setIsOpen(false);
                                        }}
                                        className="w-full flex items-center justify-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg"
                                    >
                                        <X className="h-4 w-4" />
                                        Clear filter
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

// Helper function for className merging (if you don't have cn utility)
function cn(...classes: (string | boolean | undefined | null)[]) {
    return classes.filter(Boolean).join(' ');
}