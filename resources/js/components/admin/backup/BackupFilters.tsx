import { useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Download, X, FilterX, ChevronUp, ChevronDown, AlertCircle } from 'lucide-react';

interface BackupFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  sizeFilter: string;
  onSizeFilterChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderToggle: () => void;
  showAdvancedFilters: boolean;
  onToggleAdvancedFilters: () => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onExport: () => void;
  isBulkMode?: boolean;
  selectedCount?: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  isLoading?: boolean;
}

export default function BackupFilters({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  sizeFilter,
  onSizeFilterChange,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderToggle,
  showAdvancedFilters,
  onToggleAdvancedFilters,
  hasActiveFilters,
  onClearFilters,
  onExport,
  isBulkMode = false,
  selectedCount = 0,
  totalItems,
  startIndex,
  endIndex,
  isLoading = false,
}: BackupFiltersProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  return (
    <Card className="overflow-hidden border shadow-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
      <CardContent className="pt-6">
        <div className="flex flex-col space-y-4">
          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
              <Input
                ref={searchInputRef}
                placeholder="Search backups by filename or description... (Ctrl+F)"
                className="pl-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                disabled={isLoading}
              />
              {search && !isLoading && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => onSearchChange('')}
                  disabled={isLoading}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={onToggleAdvancedFilters}
                className="h-9 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                disabled={isLoading}
              >
                <Filter className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">
                  {showAdvancedFilters ? 'Hide Filters' : 'More Filters'}
                </span>
                <span className="sm:hidden">
                  {showAdvancedFilters ? 'Hide' : 'Filters'}
                </span>
              </Button>
              <Button 
                variant="outline"
                className="h-9 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={onExport}
                disabled={isLoading}
              >
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </div>
          </div>

          {/* Results and Selection Info */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {isBulkMode && selectedCount > 0 && (
                <>
                  <span className="font-medium text-blue-600 dark:text-blue-400">{selectedCount} selected</span>
                  {' • '}
                </>
              )}
              Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} backups
              {search && ` matching "${search}"`}
              {typeFilter !== 'all' && ` • Type: ${typeFilter}`}
              {sizeFilter !== 'all' && ` • Size: ${sizeFilter}`}
            </div>
            
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                disabled={isLoading}
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/50 h-8"
              >
                <FilterX className="h-3.5 w-3.5 mr-1" />
                Clear Filters
              </Button>
            )}
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">Type:</span>
              <select
                className="border rounded px-2 py-1 text-sm w-28 sm:w-auto bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                value={typeFilter}
                onChange={(e) => onTypeFilterChange(e.target.value)}
                disabled={isLoading}
              >
                <option value="all" className="bg-white dark:bg-gray-900">All Types</option>
                <option value="full" className="bg-white dark:bg-gray-900">Full System</option>
                <option value="database" className="bg-white dark:bg-gray-900">Database Only</option>
                <option value="files" className="bg-white dark:bg-gray-900">Files Only</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">Size:</span>
              <select
                className="border rounded px-2 py-1 text-sm w-28 sm:w-auto bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                value={sizeFilter}
                onChange={(e) => onSizeFilterChange(e.target.value)}
                disabled={isLoading}
              >
                <option value="all" className="bg-white dark:bg-gray-900">All Sizes</option>
                <option value="small" className="bg-white dark:bg-gray-900">Small (&lt; 10MB)</option>
                <option value="medium" className="bg-white dark:bg-gray-900">Medium (10-100MB)</option>
                <option value="large" className="bg-white dark:bg-gray-900">Large (100MB-1GB)</option>
                <option value="xlarge" className="bg-white dark:bg-gray-900">Extra Large (&gt; 1GB)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">Sort:</span>
              <select
                className="border rounded px-2 py-1 text-sm w-28 sm:w-auto bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                disabled={isLoading}
              >
                <option value="modified" className="bg-white dark:bg-gray-900">Date Modified</option>
                <option value="filename" className="bg-white dark:bg-gray-900">Filename</option>
                <option value="type" className="bg-white dark:bg-gray-900">Type</option>
                <option value="size" className="bg-white dark:bg-gray-900">Size</option>
              </select>
              <Button
                size="sm"
                variant="outline"
                className="h-7 w-7 p-0 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={onSortOrderToggle}
                disabled={isLoading}
              >
                {sortOrder === 'asc' ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 text-sm bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1">
                Active filters applied.
                {search && ` Search: "${search}"`}
                {typeFilter !== 'all' && ` Type: ${typeFilter}`}
                {sizeFilter !== 'all' && ` Size: ${sizeFilter}`}
                {sortBy !== 'modified' && ` Sorted by: ${sortBy} (${sortOrder})`}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                disabled={isLoading}
                className="text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 h-7 px-2"
              >
                Clear all
              </Button>
            </div>
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div className="text-xs text-gray-500 dark:text-gray-400 animate-pulse">
              Updating...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}