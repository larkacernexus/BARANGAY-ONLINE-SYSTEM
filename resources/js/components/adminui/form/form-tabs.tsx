// components/ui/form/form-tabs.tsx
import React from 'react';
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { Check, AlertCircle, MinusCircle } from 'lucide-react';
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
    switch (status) {
        case 'complete':
            return <Check className="w-3.5 h-3.5 text-emerald-500" strokeWidth={3} />;
        case 'error':
            return <AlertCircle className="w-3.5 h-3.5 text-rose-500" />;
        case 'incomplete':
            return <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />;
        case 'optional':
            return <MinusCircle className="w-3.5 h-3.5 text-slate-400" />;
        default:
            return null;
    }
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

    // Dynamically set grid columns based on tab count (handling 3 or 4)
    const gridCols = {
        1: "grid-cols-1",
        2: "grid-cols-2",
        3: "grid-cols-3",
        4: "grid-cols-4",
    }[tabs.length] || "grid-cols-4";

    return (
        <div className={cn("w-full space-y-6", className)}>
            <TabsPrimitive.Root 
                value={activeTab} 
                onValueChange={onTabChange} 
                className="w-full"
            >
                {/* Fixed-width container: 
                   mx-auto centers it, max-w-2xl (or your preferred size) keeps it consistent 
                */}
                <div className="max-w-3xl mx-auto border-b border-slate-200 dark:border-slate-800">
                    <TabsPrimitive.List 
                        className={cn(
                            "grid w-full", 
                            gridCols, // Applies fixed columns
                            "items-center"
                        )}
                    >
                        {tabs.map((tab) => {
                            const status = tabStatuses[tab.id];
                            const isActive = activeTab === tab.id;
                            const Icon = tab.icon;

                            return (
                                <TabsPrimitive.Trigger
                                    key={tab.id}
                                    value={tab.id}
                                    disabled={tab.disabled}
                                    className={cn(
                                        "group relative flex flex-col sm:flex-row items-center justify-center gap-2",
                                        "px-2 py-4 text-sm font-medium transition-all outline-none",
                                        // Text Colors
                                        isActive 
                                            ? "text-blue-600 dark:text-blue-400" 
                                            : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300",
                                        "disabled:opacity-40 disabled:cursor-not-allowed"
                                    )}
                                >
                                    <div className="relative">
                                        <Icon className={cn(
                                            "w-4 h-4 transition-transform group-hover:scale-110",
                                            isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400"
                                        )} />
                                        {/* Overlay status dot on icon for smaller screens */}
                                        <div className="absolute -top-1.5 -right-1.5">
                                            <StatusBadge status={status} />
                                        </div>
                                    </div>
                                    
                                    <span className="truncate max-w-full leading-none">
                                        {tab.label}
                                    </span>

                                    {/* Animated Underline Indicator */}
                                    {isActive && (
                                        <div 
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full shadow-[0_-2px_8px_rgba(37,99,235,0.3)]" 
                                        />
                                    )}
                                </TabsPrimitive.Trigger>
                            );
                        })}
                    </TabsPrimitive.List>
                </div>
            </TabsPrimitive.Root>
            
            {missingCount > 0 && (
                <div className="max-w-3xl mx-auto flex items-center gap-2 px-1 animate-in fade-in slide-in-from-top-1">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                        <AlertCircle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                    </div>
                    <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                        {missingCount} required section{missingCount !== 1 ? 's' : ''} incomplete
                    </p>
                </div>
            )}
        </div>
    );
}