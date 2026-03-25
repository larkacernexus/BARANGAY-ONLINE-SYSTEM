// /components/residentui/notifications/ActionButtons.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Square, Filter, X, MailOpen, Trash2, CheckCheck } from 'lucide-react';

interface ActionButtonsProps {
  selectMode: boolean;
  selectedCount: number;
  totalCount: number;
  onSelectModeToggle: () => void;
  onSelectAll: () => void;
  onCancelSelect: () => void;
  onMarkAllAsRead: () => void;
  onBulkDelete: () => void;
  onShowMobileFilters: () => void;
  loading: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  selectMode,
  selectedCount,
  totalCount,
  onSelectModeToggle,
  onSelectAll,
  onCancelSelect,
  onMarkAllAsRead,
  onBulkDelete,
  onShowMobileFilters,
  loading
}) => {
  if (!selectMode) {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={onSelectModeToggle}
          className="gap-2 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <Square className="h-4 w-4" />
          Select
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onShowMobileFilters}
          className="gap-2 lg:hidden dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <Filter className="h-4 w-4" />
          Filters
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onMarkAllAsRead}
          className="gap-2 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          disabled={loading}
        >
          <MailOpen className="h-4 w-4" />
          Mark all read
        </Button>
      </>
    );
  }

  const allSelected = selectedCount === totalCount && totalCount > 0;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={onSelectAll}
        className="gap-2 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <div className="flex items-center justify-center">
          {allSelected ? (
            <CheckCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          ) : (
            <Square className="h-4 w-4" />
          )}
        </div>
        {allSelected ? 'Deselect All' : 'Select All'}
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onCancelSelect}
        className="gap-2 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <X className="h-4 w-4" />
        Cancel
      </Button>
      
      {selectedCount > 0 && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMarkAllAsRead()}
            className="gap-2 text-blue-600 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-950/30"
            disabled={loading}
          >
            <MailOpen className="h-4 w-4" />
            Mark Read
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkDelete}
            className="gap-2 text-red-600 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950/30"
            disabled={loading}
          >
            <Trash2 className="h-4 w-4" />
            Delete ({selectedCount})
          </Button>
        </>
      )}
    </>
  );
};