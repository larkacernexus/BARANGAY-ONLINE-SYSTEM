// /components/residentui/instructions/TabNavigation.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ 
  tabs, 
  activeTab, 
  onTabChange 
}) => {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
      <nav className="-mb-px flex space-x-4 sm:space-x-8 min-w-max px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex items-center gap-1 sm:gap-2 border-b-2 px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors',
                isActive
                  ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
              )}
            >
              <Icon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
};