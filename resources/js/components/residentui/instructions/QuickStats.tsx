// /components/residentui/instructions/QuickStats.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatItem {
  icon: LucideIcon;
  value: string;
  label: string;
  color: string;
}

interface QuickStatsProps {
  stats: StatItem[];
}

export const QuickStats: React.FC<QuickStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div key={idx} className="rounded-lg border border-gray-200 bg-white p-2 sm:p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className={`rounded-lg bg-${stat.color}-100 p-1.5 sm:p-2 dark:bg-${stat.color}-900/30 w-fit`}>
              <Icon className={`h-4 w-4 sm:h-5 sm:w-5 text-${stat.color}-600 dark:text-${stat.color}-400 flex-shrink-0`} />
            </div>
            <h3 className="mt-1 sm:mt-2 text-sm sm:text-base font-semibold text-gray-900 dark:text-white break-words">{stat.value}</h3>
            <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 break-words">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
};