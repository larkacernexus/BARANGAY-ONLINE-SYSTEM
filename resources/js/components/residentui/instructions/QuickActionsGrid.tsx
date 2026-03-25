// /components/residentui/instructions/QuickActionsGrid.tsx
import React from 'react';
import { Link } from '@inertiajs/react';
import { Zap, LucideIcon } from 'lucide-react';

interface QuickAction {
  href: string;
  icon: LucideIcon;
  label: string;
  color: string;
}

interface QuickActionsGridProps {
  title: string;
  actions: QuickAction[];
}

export const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({ title, actions }) => {
  return (
    <div className="rounded-lg bg-blue-50 p-4 sm:p-6 dark:bg-blue-900/20">
      <h3 className="mb-3 sm:mb-4 flex items-center gap-1 sm:gap-2 text-base sm:text-lg font-semibold text-blue-900 dark:text-blue-300 break-words">
        <Zap className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
        {title}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              href={action.href}
              className={`flex items-center gap-1 sm:gap-2 rounded-lg bg-white p-2 sm:p-3 text-xs sm:text-sm text-${action.color}-700 hover:bg-${action.color}-100 dark:bg-gray-900 dark:text-${action.color}-400 dark:hover:bg-gray-700`}
            >
              <Icon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate">{action.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};