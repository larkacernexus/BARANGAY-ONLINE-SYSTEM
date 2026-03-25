// /components/residentui/instructions/PageHeader.tsx
import React from 'react';
import { Search } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  description, 
  searchQuery, 
  onSearchChange 
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white break-words">
          {title}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 break-words">
          {description}
        </p>
      </div>
      
      <div className="relative w-full sm:w-72 md:w-96">
        <Search className="absolute left-2 sm:left-3 top-1/2 h-3 w-3 sm:h-4 sm:w-4 -translate-y-1/2 text-gray-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search guides..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 py-1.5 sm:py-2 pl-7 sm:pl-10 pr-3 sm:pr-4 text-xs sm:text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400"
        />
      </div>
    </div>
  );
};