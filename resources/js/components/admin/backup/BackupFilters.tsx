import { RefObject } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, Download, X, FilterX, Grid, List, ArrowUpDown, ArrowUp, ArrowDown, Database, HardDrive, Calendar, Layers } from 'lucide-react';

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
  onSortOrderToggle?: () => void;
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
  onSortOrderToggle,
  getCurrentSortValue,
}: BackupFiltersProps) {
  
  // Convert hasActiveFilters to boolean
  const activeFilters = typeof hasActiveFilters === 'string' 
    ? hasActiveFilters === 'true' || hasActiveFilters === '1'
    : Boolean(hasActiveFilters);

  // Helper to get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (typeFilter && typeFilter !== 'all') count++;
    if (sizeFilter && sizeFilter !== 'all') count++;
    if (search) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  // Sort options
  const sortOptions = [
    { value: 'filename-asc', label: 'Filename (A-Z)', icon: '📄' },
    { value: 'filename-desc', label: 'Filename (Z-A)', icon: '📄' },
    { value: 'size-asc', label: 'Size (Smallest)', icon: '📊' },
    { value: 'size-desc', label: 'Size (Largest)', icon: '📊' },
    { value: 'modified-desc', label: 'Newest First', icon: '🕐' },
    { value: 'modified-asc', label: 'Oldest First', icon: '🕐' },
    { value: 'type-asc', label: 'Type (A-Z)', icon: '📁' },
    { value: 'type-desc', label: 'Type (Z-A)', icon: '📁' },
  ];

  // Get type label
  const getTypeLabel = (value: string) => {
    switch (value) {
      case 'full': return 'Full System';
      case 'database': return 'Database Only';
      case 'files': return 'Files Only';
      default: return value;
    }
  };

  // Get size label
  const getSizeLabel = (value: string) => {
    switch (value) {
      case 'small': return 'Small (< 10MB)';
      case 'medium': return 'Medium (10-100MB)';
      case 'large': return 'Large (100MB-1GB)';
      case 'xlarge': return 'Extra Large (> 1GB)';
      default: return value;
    }
  };

  // Get type color
  const getTypeColor = (value: string) => {
    switch (value) {
      case 'full': return 'purple';
      case 'database': return 'blue';
      case 'files': return 'emerald';
      default: return 'gray';
    }
  };

  // Get size color
  const getSizeColor = (value: string) => {
    switch (value) {
      case 'small': return 'emerald';
      case 'medium': return 'blue';
      case 'large': return 'amber';
      case 'xlarge': return 'red';
      default: return 'gray';
    }
  };

  return (
    <Card className="overflow-hidden border-0 shadow-lg bg-white dark:bg-gray-900 rounded-xl">
      <CardContent className="p-5 md:p-6">
        <div className="flex flex-col space-y-5">
          {/* Search Bar - Enhanced */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400 dark:text-gray-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" />
              </div>
              <Input
                ref={searchInputRef}
                placeholder="Search backups by filename or description... (Ctrl+F)"
                className="pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                disabled={isLoading}
              />
              {search && !isLoading && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  onClick={() => onSearchChange('')}
                >
                  <X className="h-3.5 w-3.5" />
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
                    <SelectTrigger className="w-[140px] h-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl text-sm">
                      <ArrowUpDown className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <span className="flex items-center gap-2">
                            <span>{option.icon}</span>
                            {option.label}
                          </span>
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
                    className="h-10 w-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all"
                    onClick={onSortOrderToggle}
                    disabled={isLoading}
                    title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                  >
                    {sortOrder === 'asc' ? (
                      <ArrowUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    )}
                  </Button>
                )}
              </div>

              {/* View Mode Toggle */}
              {onViewModeChange && (
                <Button 
                  variant="outline" 
                  onClick={() => onViewModeChange(viewMode === 'table' ? 'grid' : 'table')}
                  className="h-10 px-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-all"
                  disabled={isLoading}
                >
                  {viewMode === 'table' ? (
                    <Grid className="h-4 w-4 mr-2" />
                  ) : (
                    <List className="h-4 w-4 mr-2" />
                  )}
                  <span className="hidden sm:inline font-medium">
                    {viewMode === 'table' ? 'Grid View' : 'Table View'}
                  </span>
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={onToggleAdvancedFilters}
                className="h-10 px-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-all"
                disabled={isLoading}
              >
                <Filter className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline font-medium">
                  {showAdvancedFilters ? 'Hide Filters' : 'More Filters'}
                </span>
                <span className="sm:hidden">
                  {showAdvancedFilters ? 'Hide' : 'Filters'}
                </span>
                {!showAdvancedFilters && activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full px-1.5 py-0 text-xs">
                    +{activeFilterCount}
                  </Badge>
                )}
              </Button>
              <Button 
                variant="outline"
                className="h-10 px-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-all"
                onClick={onExport}
                disabled={isLoading}
              >
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline font-medium">Export</span>
              </Button>
            </div>
          </div>

          {/* Results Info & Active Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30 px-3 py-1.5 rounded-lg">
              <span className="font-semibold text-gray-700 dark:text-gray-300">{startIndex + 1}-{Math.min(endIndex, totalItems)}</span>
              <span className="mx-1">of</span>
              <span className="font-semibold text-gray-700 dark:text-gray-300">{totalItems}</span>
              <span className="ml-1">backups</span>
              {search && (
                <span className="ml-1">
                  matching <span className="font-medium text-indigo-600 dark:text-indigo-400">“{search}”</span>
                </span>
              )}
              {isBulkMode && selectedCount > 0 && (
                <span className="ml-2 font-medium text-blue-600 dark:text-blue-400">
                  • {selectedCount} selected
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              {/* Active filter badges */}
              {activeFilters && (
                <>
                  {typeFilter && typeFilter !== 'all' && (
                    <Badge variant="secondary" className={`${
                      getTypeColor(typeFilter) === 'purple' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
                      getTypeColor(typeFilter) === 'blue' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                      'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                    } border-0 rounded-full px-2.5 py-1 text-xs font-medium`}>
                      <Database className="h-3 w-3 mr-1 inline" />
                      {getTypeLabel(typeFilter)}
                    </Badge>
                  )}
                  {sizeFilter && sizeFilter !== 'all' && (
                    <Badge variant="secondary" className={`${
                      getSizeColor(sizeFilter) === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                      getSizeColor(sizeFilter) === 'blue' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                      getSizeColor(sizeFilter) === 'amber' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                      'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    } border-0 rounded-full px-2.5 py-1 text-xs font-medium`}>
                      <HardDrive className="h-3 w-3 mr-1 inline" />
                      {getSizeLabel(sizeFilter)}
                    </Badge>
                  )}
                </>
              )}
              
              {activeFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearFilters}
                  disabled={isLoading}
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 h-7 px-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-xs"
                >
                  <FilterX className="h-3 w-3 mr-1" />
                  Clear all
                </Button>
              )}
            </div>
          </div>

          {/* Basic Filters - Modern Grid */}
          <div className="grid grid-cols-2 md:grid-cols-2 gap-3 pt-1">
            {/* Backup Type Filter */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Database className="h-3 w-3" />
                Backup Type
              </Label>
              <Select
                value={typeFilter}
                onValueChange={onTypeFilterChange}
                disabled={isLoading}
              >
                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-indigo-500">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="full">Full System</SelectItem>
                  <SelectItem value="database">Database Only</SelectItem>
                  <SelectItem value="files">Files Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* File Size Filter */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <HardDrive className="h-3 w-3" />
                File Size
              </Label>
              <Select
                value={sizeFilter}
                onValueChange={onSizeFilterChange}
                disabled={isLoading}
              >
                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                  <SelectValue placeholder="All Sizes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sizes</SelectItem>
                  <SelectItem value="small">Small (&lt; 10MB)</SelectItem>
                  <SelectItem value="medium">Medium (10-100MB)</SelectItem>
                  <SelectItem value="large">Large (100MB-1GB)</SelectItem>
                  <SelectItem value="xlarge">Extra Large (&gt; 1GB)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Advanced Filters - Modern Accordion Style */}
          {showAdvancedFilters && (
            <div className="border-t border-gray-100 dark:border-gray-800 pt-5 mt-2 space-y-5">
              <div className="flex items-center gap-2">
                <div className="h-5 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wide">Advanced Filters</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Quick Actions */}
                <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-3 rounded-xl">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Layers className="h-4 w-4 text-indigo-500" />
                    Quick Actions
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                      onClick={() => {
                        onTypeFilterChange('full');
                        onToggleAdvancedFilters();
                      }}
                      disabled={isLoading}
                    >
                      <Database className="h-3 w-3 mr-1" />
                      Full Backups Only
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
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
                      className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                      onClick={() => {
                        onSizeFilterChange('small');
                        onToggleAdvancedFilters();
                      }}
                      disabled={isLoading}
                    >
                      <HardDrive className="h-3 w-3 mr-1" />
                      Small Files
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                      onClick={() => {
                        onClearFilters();
                        onToggleAdvancedFilters();
                      }}
                      disabled={isLoading}
                    >
                      <FilterX className="h-3 w-3 mr-1" />
                      Reset All
                    </Button>
                  </div>
                </div>

                {/* Information Section */}
                <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-3 rounded-xl">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-emerald-500" />
                    Backup Information
                  </Label>
                  <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Full backups</span> include system and database</p>
                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Database backups</span> can be restored separately</p>
                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">File backups</span> include uploaded assets</p>
                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Size filters</span> help manage storage efficiently</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Loading indicator - Modern */}
        {isLoading && (
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            Updating...
          </div>
        )}
      </CardContent>
    </Card>
  );
}