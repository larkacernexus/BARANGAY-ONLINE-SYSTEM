import React from 'react';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { BackupCard } from './BackupCard';
import { 
  DatabaseBackup,
  Save,
  List,
  Grid3X3
} from 'lucide-react';
import type { BackupFile } from '@/types/backup';

interface BackupGridProps {
  backups: BackupFile[];
  isBulkMode: boolean;
  selectedBackups: string[];
  viewMode: 'table' | 'grid';
  isMobile: boolean;
  filtersState: any;
  onItemSelect: (id: string) => void;
  onDelete: (backup: BackupFile) => void;
  onDownload: (filename: string) => void;
  onToggleProtection: (filename: string) => void;
  onSelectAllOnPage: () => void;
  onSelectAllFiltered: () => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  isSelectAll: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onCreateBackup: () => void;
  filteredBackups: BackupFile[];
  setViewMode: (mode: 'table' | 'grid') => void;
  setIsBulkMode: (mode: boolean) => void;
  showSelectionOptions: boolean;
  setShowSelectionOptions: (show: boolean) => void;
  selectionRef: React.RefObject<HTMLDivElement>;
}

export default function BackupGrid({
  backups,
  isBulkMode,
  selectedBackups,
  viewMode,
  isMobile,
  filtersState,
  onItemSelect,
  onDelete,
  onDownload,
  onToggleProtection,
  onSelectAllOnPage,
  onSelectAllFiltered,
  onSelectAll,
  onClearSelection,
  isSelectAll,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  hasActiveFilters,
  onClearFilters,
  onCreateBackup,
  filteredBackups,
  setViewMode,
  setIsBulkMode,
  showSelectionOptions,
  setShowSelectionOptions,
  selectionRef
}: BackupGridProps) {
  const gridCols = isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

  return (
    <div className="space-y-4">
      {/* Grid View Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Backup Files
            {selectedBackups.length > 0 && isBulkMode && (
              <span className="ml-2 text-sm font-normal text-blue-600 bg-blue-50 px-2 py-1 rounded dark:bg-blue-900/20 dark:text-blue-300">
                {selectedBackups.length} selected
              </span>
            )}
          </h2>
          {totalItems > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Showing {backups.length} of {totalItems} backups
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'table' 
                  ? 'bg-white dark:bg-gray-700 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              title="Table view"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white dark:bg-gray-700 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              title="Grid view"
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
          </div>

          {/* Bulk Mode Toggle */}
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer whitespace-nowrap">
              <input
                type="checkbox"
                checked={isBulkMode}
                onChange={(e) => setIsBulkMode(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-blue-500"
              />
              Bulk Mode
            </label>
          </div>
        </div>
      </div>

      {/* Bulk Selection Options */}
      {isBulkMode && backups.length > 0 && (
        <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <div className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isSelectAll && backups.length > 0}
                onChange={onSelectAllOnPage}
                className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
              />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Select all on this page
              </label>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {selectedBackups.length} selected
            </div>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {backups.length === 0 ? (
        <EmptyState
          title="No backups found"
          description={
            hasActiveFilters
              ? 'Try changing your filters or search criteria.'
              : 'Get started by creating your first backup.'
          }
          icon={<DatabaseBackup className="h-12 w-12 text-gray-300 dark:text-gray-700" />}
          hasFilters={hasActiveFilters}
          onClearFilters={onClearFilters}
          onCreateNew={onCreateBackup}
          createLabel="Create Backup"
          createIcon={<Save className="h-4 w-4" />}
        />
      ) : (
        <div className={`grid ${gridCols} gap-4`}>
          {backups.map((backup) => (
            <BackupCard
              key={backup.id}
              backup={backup}
              isSelected={selectedBackups.includes(backup.id)}
              isBulkMode={isBulkMode}
              isMobile={isMobile}
              onSelect={onItemSelect}
              onDelete={onDelete}
              onDownload={onDownload}
              onToggleProtection={onToggleProtection}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t dark:border-gray-800">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`w-8 h-8 text-sm font-medium rounded-md ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}