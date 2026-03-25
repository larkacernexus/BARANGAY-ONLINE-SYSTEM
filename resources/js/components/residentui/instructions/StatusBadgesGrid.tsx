// /components/residentui/instructions/StatusBadgesGrid.tsx
import React from 'react';

interface StatusItem {
  status: string;
  color: string;
  description: string;
}

interface StatusBadgesGridProps {
  statuses: StatusItem[];
}

export const StatusBadgesGrid: React.FC<StatusBadgesGridProps> = ({ statuses }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
      {statuses.map((item, idx) => (
        <div key={idx} className="rounded-lg border border-gray-200 p-2 sm:p-3 dark:border-gray-700">
          <div className={`h-2 w-2 rounded-full bg-${item.color}-500 mb-1`}></div>
          <p className="text-xs font-medium text-gray-900 dark:text-white">{item.status}</p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">{item.description}</p>
        </div>
      ))}
    </div>
  );
};