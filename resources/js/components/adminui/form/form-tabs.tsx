// components/ui/form/form-tabs.tsx
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, AlertCircle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TabConfig {
    id: string;
    label: string;
    icon: React.ElementType;
    requiredFields?: string[];
}

interface FormTabsProps {
    tabs: TabConfig[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
    tabStatuses?: Record<string, 'complete' | 'incomplete' | 'error' | 'optional'>;
    className?: string;
}

function TabIcon({ tab, icon: Icon, status }: { tab: string; icon: React.ElementType; status?: string }) {
    if (status === 'complete') {
        return (
            <div className="relative">
                <Icon className="h-4 w-4 text-green-600 dark:text-green-400" />
                <CheckCircle className="absolute -top-1 -right-1 h-3 w-3 text-green-600 dark:text-green-400 fill-white dark:fill-gray-900" />
            </div>
        );
    }
    
    if (status === 'error') {
        return (
            <div className="relative">
                <Icon className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertCircle className="absolute -top-1 -right-1 h-3 w-3 text-red-600 dark:text-red-400 fill-white dark:fill-gray-900" />
            </div>
        );
    }
    
    if (status === 'incomplete') {
        return (
            <div className="relative">
                <Icon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <Circle className="absolute -top-1 -right-1 h-3 w-3 text-amber-600 dark:text-amber-400 fill-white dark:fill-gray-900" />
            </div>
        );
    }
    
    return <Icon className="h-4 w-4" />;
}

// Helper function to determine grid columns based on number of tabs
const getGridCols = (tabCount: number) => {
    if (tabCount === 1) return 'grid-cols-1';
    if (tabCount === 2) return 'grid-cols-2';
    if (tabCount === 3) return 'grid-cols-3';
    if (tabCount === 4) return 'grid-cols-4';
    if (tabCount === 5) return 'grid-cols-5';
    if (tabCount === 6) return 'grid-cols-6';
    return `grid-cols-${Math.min(tabCount, 6)}`;
};

export function FormTabs({ tabs, activeTab, onTabChange, tabStatuses, className }: FormTabsProps) {
    const tabCount = tabs.length;
    const gridCols = getGridCols(tabCount);
    
    return (
        <Tabs value={activeTab} onValueChange={onTabChange} className={cn("space-y-4", className)}>
            <TabsList className={cn("grid w-full lg:w-auto", gridCols)}>
                {tabs.map((tab) => (
                    <TabsTrigger key={tab.id} value={tab.id} className="gap-2">
                        <TabIcon 
                            tab={tab.id} 
                            icon={tab.icon} 
                            status={tabStatuses?.[tab.id]} 
                        />
                        <span className="hidden sm:inline">{tab.label}</span>
                        {/* Optional: Show required badge for tabs with required fields */}
                        {tab.requiredFields && tab.requiredFields.length > 0 && tabStatuses?.[tab.id] === 'incomplete' && (
                            <span className="ml-1 text-xs text-amber-600 dark:text-amber-400">
                                *
                            </span>
                        )}
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    );
}