import { RefObject } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, Download, X, FilterX, Grid, List, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface BackupFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  sizeFilter: string;
  onSizeFilterChange: (value: string) => void;
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
  searchInputRef?: RefObject<HTMLInputElement | null>;
  viewMode?: 'table' | 'grid';
  onViewModeChange?: (mode: 'table' | 'grid') => void;
  isMobile?: boolean;
  // Sort props
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (value: string) => void;
  onSortOrderToggle?: () => void;  // ✅ Added
  getCurrentSortValue?: () => string;
}

export default function BackupFilters({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  sizeFilter,
  onSizeFilterChange,
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
  searchInputRef,
  viewMode = 'table',
  onViewModeChange,
  isMobile = false,
  sortBy = 'modified',
  sortOrder = 'desc',
  onSortChange,
  onSortOrderToggle,  // ✅ Added
  getCurrentSortValue,
}: BackupFiltersProps) {
  
  // Convert hasActiveFilters to boolean
  const activeFilters = typeof hasActiveFilters === 'string' 
    ? hasActiveFilters === 'true' || hasActiveFilters === '1'
    : Boolean(hasActiveFilters);

  // Sort options
  const sortOptions = [
    { value: 'filename-asc', label: 'Filename (A-Z)' },
    { value: 'filename-desc', label: 'Filename (Z-A)' },
    { value: 'size-asc', label: 'Size (Smallest)' },
    { value: 'size-desc', label: 'Size (Largest)' },
    { value: 'modified-desc', label: 'Newest First' },
    { value: 'modified-asc', label: 'Oldest First' },
    { value: 'type-asc', label: 'Type (A-Z)' },
    { value: 'type-desc', label: 'Type (Z-A)' },
  ];

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
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {/* Sort Controls */}
              <div className="flex gap-1">
                {/* Sort Dropdown */}
                {onSortChange && getCurrentSortValue && (
                  <Select
                    value={getCurrentSortValue()}
                    onValueChange={onSortChange}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-[140px] h-9 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                
                {/* Sort Order Toggle Button */}
                {onSortOrderToggle && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                    onClick={onSortOrderToggle}
                    disabled={isLoading}
                    title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                  >
                    {sortOrder === 'asc' ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : (
                      <ArrowDown className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>

              {/* View Mode Toggle */}
              {onViewModeChange && (
                <Button 
                  variant="outline" 
                  onClick={() => onViewModeChange(viewMode === 'table' ? 'grid' : 'table')}
                  className="h-9 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  disabled={isLoading}
                >
                  {viewMode === 'table' ? (
                    <Grid className="h-4 w-4" />
                  ) : (
                    <List className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline ml-2">
                    {viewMode === 'table' ? 'Grid View' : 'Table View'}
                  </span>
                </Button>
              )}
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

          {/* Active Filters Info and Clear Button */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} backups
              {search && ` matching "${search}"`}
              {isBulkMode && selectedCount > 0 && (
                <span className="ml-2 font-medium text-blue-600 dark:text-blue-400">
                  • {selectedCount} selected
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {activeFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearFilters}
                  disabled={isLoading}
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 h-8 hover:bg-red-50 dark:hover:bg-red-950/50"
                >
                  <FilterX className="h-3.5 w-3.5 mr-1" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Basic Filters */}
          <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-gray-500 dark:text-gray-400">Backup Type</Label>
              <select
                className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                value={typeFilter}
                onChange={(e) => onTypeFilterChange(e.target.value)}
                disabled={isLoading}
              >
                <option value="all">All Types</option>
                <option value="full">Full System</option>
                <option value="database">Database Only</option>
                <option value="files">Files Only</option>
              </select>
            </div>
            
            <div className="space-y-1">
              <Label className="text-xs text-gray-500 dark:text-gray-400">File Size</Label>
              <select
                className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                value={sizeFilter}
                onChange={(e) => onSizeFilterChange(e.target.value)}
                disabled={isLoading}
              >
                <option value="all">All Sizes</option>
                <option value="small">Small (&lt; 10MB)</option>
                <option value="medium">Medium (10-100MB)</option>
                <option value="large">Large (100MB-1GB)</option>
                <option value="xlarge">Extra Large (&gt; 1GB)</option>
              </select>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="border-t pt-4 space-y-4 border-gray-200 dark:border-gray-800">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Advanced Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Quick Actions */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Actions</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        onTypeFilterChange('full');
                        onToggleAdvancedFilters();
                      }}
                      disabled={isLoading}
                    >
                      Full Backups Only
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        onTypeFilterChange('database');
                        onToggleAdvancedFilters();
                      }}
                      disabled={isLoading}
                    >
                      Database Only
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        onSizeFilterChange('small');
                        onToggleAdvancedFilters();
                      }}
                      disabled={isLoading}
                    >
                      Small Files
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        onClearFilters();
                        onToggleAdvancedFilters();
                      }}
                      disabled={isLoading}
                    >
                      Reset All
                    </Button>
                  </div>
                </div>

                {/* Information */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Information</Label>
                  <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    <p>• Full backups include system and database</p>
                    <p>• Database backups can be restored separately</p>
                    <p>• File backups include uploaded assets</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 animate-pulse">
            Updating...
          </div>
        )}
      </CardContent>
    </Card>
  );
}