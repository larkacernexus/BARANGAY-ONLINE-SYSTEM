// components/ui/form/form-tabs.tsx
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, AlertCircle, Circle, MinusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TabConfig {
    id: string;
    label: string;
    icon: React.ElementType;
    requiredFields?: string[];
    disabled?: boolean;
    description?: string;
}

export type TabStatus = 'complete' | 'incomplete' | 'error' | 'optional';

interface FormTabsProps {
    tabs: TabConfig[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
    tabStatuses?: Record<string, TabStatus>;
    className?: string;
}

const StatusBadge = ({ status }: { status?: TabStatus }) => {
    if (status === 'complete') {
        return <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
    }
    
    if (status === 'error') {
        return <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />;
    }
    
    if (status === 'incomplete') {
        return <Circle className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />;
    }
    
    if (status === 'optional') {
        return <MinusCircle className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />;
    }
    
    return null;
};

export function FormTabs({ 
    tabs, 
    activeTab, 
    onTabChange, 
    tabStatuses = {}, 
    className,
}: FormTabsProps) {
    const missingCount = tabs.filter(
        tab => tab.requiredFields?.length && tabStatuses[tab.id] === 'incomplete'
    ).length;
    
    return (
        <div className={cn("w-full", className)}>
            <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
                <TabsList 
                    className="flex w-full h-auto p-1 bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700"
                >
                    {tabs.map((tab) => {
                        const status = tabStatuses[tab.id];
                        const isDisabled = tab.disabled;
                        const Icon = tab.icon;
                        const hasMissingRequired = tab.requiredFields?.length && status === 'incomplete';
                        const isActive = activeTab === tab.id;
                        
                        return (
                            <TabsTrigger
                                key={tab.id}
                                value={tab.id}
                                disabled={isDisabled}
                                className={cn(
                                    "flex-1 relative flex items-center justify-center gap-2",
                                    "px-4 py-2.5 text-sm font-medium",
                                    "rounded-md transition-all duration-200",
                                    // Active tab styling
                                    isActive && [
                                        "bg-white dark:bg-gray-900",
                                        "shadow-sm",
                                        "border border-gray-200 dark:border-gray-600",
                                        "text-gray-900 dark:text-gray-100",
                                    ],
                                    // Inactive tab styling
                                    !isActive && [
                                        "bg-transparent",
                                        "text-gray-600 dark:text-gray-400",
                                        "hover:bg-gray-100 dark:hover:bg-gray-800/50",
                                        "hover:text-gray-900 dark:hover:text-gray-200",
                                    ],
                                    // Status-based text colors
                                    hasMissingRequired && !isActive && "text-amber-600 dark:text-amber-400",
                                    hasMissingRequired && isActive && "text-amber-700 dark:text-amber-300",
                                    status === 'optional' && !isActive && "text-gray-500 dark:text-gray-500",
                                    status === 'optional' && isActive && "text-gray-600 dark:text-gray-400",
                                    // Disabled state
                                    "disabled:opacity-40 disabled:pointer-events-none",
                                    // Focus state
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
                                )}
                                title={tab.description}
                            >
                                <Icon className={cn(
                                    "w-4 h-4",
                                    hasMissingRequired && isActive && "text-amber-600 dark:text-amber-400"
                                )} />
                                <span className="hidden sm:inline">{tab.label}</span>
                                
                                {status && (
                                    <span className="ml-1">
                                        <StatusBadge status={status} />
                                    </span>
                                )}
                            </TabsTrigger>
                        );
                    })}
                </TabsList>
            </Tabs>
            
            {missingCount > 0 && (
                <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
                    ⚠️ {missingCount} required field{missingCount !== 1 ? 's' : ''} missing
                </p>
            )}
        </div>
    );
}