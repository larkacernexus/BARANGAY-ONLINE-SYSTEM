// /components/residentui/instructions/InfoSection.tsx
import React from 'react';
import { Info, CheckCircle, Shield } from 'lucide-react';

interface InfoItem {
  icon: React.ElementType;
  text: string;
}

interface InfoSectionProps {
  title: string;
  leftItems: InfoItem[];
  rightItems: InfoItem[];
}

export const InfoSection: React.FC<InfoSectionProps> = ({ title, leftItems, rightItems }) => {
  return (
    <div className="rounded-lg border border-gray-200 p-4 sm:p-6 dark:border-gray-700">
      <h3 className="mb-3 sm:mb-4 flex items-center gap-1 sm:gap-2 text-base sm:text-lg font-semibold text-gray-900 dark:text-white break-words">
        <Info className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <h4 className="mb-2 text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-300 break-words">What You Can Do:</h4>
          <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            {leftItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <li key={idx} className="flex items-start gap-1 sm:gap-2">
                  <Icon className="mt-0.5 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-green-500" />
                  <span className="break-words flex-1">{item.text}</span>
                </li>
              );
            })}
          </ul>
        </div>
        <div>
          <h4 className="mb-2 text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-300 break-words">Security Features:</h4>
          <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            {rightItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <li key={idx} className="flex items-start gap-1 sm:gap-2">
                  <Icon className="mt-0.5 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-blue-500" />
                  <span className="break-words flex-1">{item.text}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};