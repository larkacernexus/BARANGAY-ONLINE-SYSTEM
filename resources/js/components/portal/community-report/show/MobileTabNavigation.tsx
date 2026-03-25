// components/MobileTabNavigation.tsx
import { cn } from '@/lib/utils';
import { FileText, Paperclip, History, HelpCircle } from 'lucide-react';

interface MobileTabNavigationProps {
    activeTab: string;
    onTabChange: (tabId: string) => void;
}

export const MobileTabNavigation = ({ activeTab, onTabChange }: MobileTabNavigationProps) => {
    const tabs = [
        { id: 'details', label: 'Details', icon: FileText },
        { id: 'evidence', label: 'Evidence', icon: Paperclip },
        { id: 'timeline', label: 'Timeline', icon: History },
        { id: 'help', label: 'Help', icon: HelpCircle },
    ];

    return (
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl py-2 -mx-4 px-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            className={cn(
                                "flex-1 py-2 px-1 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1",
                                activeTab === tab.id
                                    ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                            )}
                            onClick={() => onTabChange(tab.id)}
                        >
                            <Icon className="h-3.5 w-3.5" />
                            <span className="hidden xs:inline">{tab.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};