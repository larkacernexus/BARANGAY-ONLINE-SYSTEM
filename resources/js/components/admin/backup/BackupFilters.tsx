import { useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Download, X, FilterX, ChevronUp, ChevronDown } from 'lucide-react';

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
}: BackupFiltersProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-6">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                ref={searchInputRef}
                placeholder="Search backups by filename or description... (Ctrl+F)"
                className="pl-10"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
              />
              {search && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => onSearchChange('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={onToggleAdvancedFilters}
                className="h-9"
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
                className="h-9"
                onClick={onExport}
              >
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="text-sm text-gray-500">
              {isBulkMode && selectedCount > 0 ? (
                <>
                  <span className="font-medium text-blue-600">{selectedCount} selected</span>
                  {' • '}
                </>
              ) : null}
              Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} backups
              {search && ` matching "${search}"`}
            </div>
            
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-red-600 hover:text-red-700 h-8"
              >
                <FilterX className="h-3.5 w-3.5 mr-1" />
                Clear Filters
              </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 hidden sm:inline">Type:</span>
              <select
                className="border rounded px-2 py-1 text-sm w-28 sm:w-auto dark:bg-gray-800 dark:border-gray-700"
                value={typeFilter}
                onChange={(e) => onTypeFilterChange(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="full">Full System</option>
                <option value="database">Database Only</option>
                <option value="files">Files Only</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 hidden sm:inline">Size:</span>
              <select
                className="border rounded px-2 py-1 text-sm w-28 sm:w-auto dark:bg-gray-800 dark:border-gray-700"
                value={sizeFilter}
                onChange={(e) => onSizeFilterChange(e.target.value)}
              >
                <option value="all">All Sizes</option>
                <option value="small">Small (&lt; 10MB)</option>
                <option value="medium">Medium (10-100MB)</option>
                <option value="large">Large (100MB-1GB)</option>
                <option value="xlarge">Extra Large (&gt; 1GB)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 hidden sm:inline">Sort:</span>
              <select
                className="border rounded px-2 py-1 text-sm w-28 sm:w-auto dark:bg-gray-800 dark:border-gray-700"
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
              >
                <option value="modified">Date Modified</option>
                <option value="filename">Filename</option>
                <option value="type">Type</option>
                <option value="size">Size</option>
              </select>
              <Button
                size="sm"
                variant="outline"
                className="h-7 w-7 p-0 dark:border-gray-700"
                onClick={onSortOrderToggle}
              >
                {sortOrder === 'asc' ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}