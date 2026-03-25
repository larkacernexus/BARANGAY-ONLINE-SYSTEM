// /components/residentui/notifications/FilterRow.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tag, Calendar, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NOTIFICATION_TYPES, TIME_FILTERS } from '@/components/residentui/notifications/constants';
import { NotificationType } from '@/types/portal/notifications/types';
import { CheckCheck } from 'lucide-react';

interface FilterRowProps {
  notificationType: NotificationType;
  timeFilter: string;
  hasActiveFilters: boolean;
  onTypeChange: (type: NotificationType) => void;
  onTimeChange: (time: string) => void;
  onClearFilters: () => void;
  loading: boolean;
}

export const FilterRow: React.FC<FilterRowProps> = ({
  notificationType,
  timeFilter,
  hasActiveFilters,
  onTypeChange,
  onTimeChange,
  onClearFilters,
  loading
}) => {
  const getTypeLabel = () => {
    const found = NOTIFICATION_TYPES.find(t => t.value === notificationType);
    return found?.label.split(' ')[0] || 'Type';
  };

  const getTimeLabel = () => {
    const found = TIME_FILTERS.find(t => t.value === timeFilter);
    return found?.label || 'Time';
  };

  return (
    <div className="hidden lg:flex items-center justify-end gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="relative dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
            <Tag className="h-4 w-4 mr-2" />
            Type
            {notificationType !== 'all' && (
              <span className="ml-1 text-xs bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 rounded-full px-1.5">
                {getTypeLabel()}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 dark:bg-gray-800 dark:border-gray-700">
          <DropdownMenuLabel className="dark:text-gray-200">Filter by type</DropdownMenuLabel>
          <DropdownMenuSeparator className="dark:bg-gray-700" />
          {NOTIFICATION_TYPES.map(({ value, label, icon: Icon }) => (
            <DropdownMenuItem 
              key={value}
              onClick={() => onTypeChange(value as NotificationType)}
              className={cn(
                "flex items-center justify-between cursor-pointer dark:text-gray-200 dark:hover:bg-gray-700",
                notificationType === value && "bg-blue-50 dark:bg-blue-950/30"
              )}
              disabled={loading}
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </div>
              {notificationType === value && (
                <CheckCheck className="h-4 w-4 text-blue-500 dark:text-blue-400" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="relative dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
            <Calendar className="h-4 w-4 mr-2" />
            Time
            {timeFilter !== 'all' && (
              <span className="ml-1 text-xs bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 rounded-full px-1.5">
                {getTimeLabel()}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 dark:bg-gray-800 dark:border-gray-700">
          <DropdownMenuLabel className="dark:text-gray-200">Time period</DropdownMenuLabel>
          <DropdownMenuSeparator className="dark:bg-gray-700" />
          <DropdownMenuItem 
            onClick={() => onTimeChange('all')}
            className={cn(
              "flex items-center justify-between cursor-pointer dark:text-gray-200 dark:hover:bg-gray-700",
              timeFilter === 'all' && "bg-blue-50 dark:bg-blue-950/30"
            )}
            disabled={loading}
          >
            <span>All time</span>
            {timeFilter === 'all' && <CheckCheck className="h-4 w-4 text-blue-500 dark:text-blue-400" />}
          </DropdownMenuItem>
          {TIME_FILTERS.map(({ value, label }) => (
            <DropdownMenuItem 
              key={value}
              onClick={() => onTimeChange(value)}
              className={cn(
                "flex items-center justify-between cursor-pointer dark:text-gray-200 dark:hover:bg-gray-700",
                timeFilter === value && "bg-blue-50 dark:bg-blue-950/30"
              )}
              disabled={loading}
            >
              <span>{label}</span>
              {timeFilter === value && <CheckCheck className="h-4 w-4 text-blue-500 dark:text-blue-400" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/30"
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
};