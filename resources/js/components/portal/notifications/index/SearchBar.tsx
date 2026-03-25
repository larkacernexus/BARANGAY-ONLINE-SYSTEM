// /components/residentui/notifications/SearchBar.tsx
import React from 'react';
import { Input } from '@/components/ui/input';
import { Bell, X } from 'lucide-react';

interface SearchBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onSearchClear: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ search, onSearchChange, onSearchClear }) => {
  return (
    <div className="relative w-full sm:w-auto flex-1 max-w-md">
      <Bell className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
      <Input
        type="text"
        placeholder="Search notifications..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 pr-10 py-2 w-full dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500"
      />
      {search && (
        <button
          onClick={onSearchClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};