// /components/residentui/dashboard/Tabs.tsx
import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassCard } from './GlassCard';
import { useMobile } from '@/components/residentui/hooks/use-mobile';
import { Tab } from '@/types/portal/dashboard/dashboard-types';

interface TabsProps {
    tabs: Tab[];
    activeTab: string;
    onChange: (id: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange }) => {
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const isMobile = useMobile();

    if (isMobile) {
        return (
            <div className="relative">
                <button
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-900 rounded-xl text-sm font-medium shadow-md border border-gray-200 dark:border-gray-700"
                >
                    <Menu className="h-4 w-4" />
                    <span>{tabs.find(t => t.id === activeTab)?.label || 'Menu'}</span>
                </button>
                
                {showMobileMenu && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowMobileMenu(false)} />
                        <GlassCard className="absolute right-0 mt-2 p-1 z-50 min-w-[200px]">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            onChange(tab.id);
                                            setShowMobileMenu(false);
                                        }}
                                        className={cn(
                                            "flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all",
                                            isActive 
                                                ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' 
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </GlassCard>
                    </>
                )}
            </div>
        );
    }

    return (
        <GlassCard className="p-1 inline-flex">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
                            isActive 
                                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-md' 
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50'
                        )}
                    >
                        <Icon className="h-4 w-4" />
                        <span>{tab.label}</span>
                    </button>
                );
            })}
        </GlassCard>
    );
};