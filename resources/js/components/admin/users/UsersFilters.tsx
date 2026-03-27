// components/admin/users/UsersFilters.tsx
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Filter, 
  Download, 
  X, 
  FilterX, 
  Layers, 
  Rows, 
  Hash,
  RotateCcw 
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { UsersFiltersProps } from '@/types/admin/users/user-types';

export default function UsersFilters({
  search,
  setSearch,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
  showAdvancedFilters,
  setShowAdvancedFilters,
  hasActiveFilters,
  handleClearFilters,
  roles,
  departments,
  departmentFilter,
  setDepartmentFilter,
  isBulkMode,
  selectedUsers,
  setSelectedUsers,
  setIsSelectAll,
  users,
  selectionMode,
  setSelectionMode,
  isLoading = false,
  perPage,
  onPerPageChange
}: UsersFiltersProps) {
  const [showSelectionOptions, setShowSelectionOptions] = useState(false);
  const selectionRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSelectAllOnPage = () => {
    const pageIds = users.data.map(user => user.id);
    const isSelectAll = selectedUsers.length === pageIds.length && 
                       pageIds.every(id => selectedUsers.includes(id));
    
    if (isSelectAll) {
      setSelectedUsers(selectedUsers.filter(id => !pageIds.includes(id)));
    } else {
      const newSelected = [...new Set([...selectedUsers, ...pageIds])];
      setSelectedUsers(newSelected);
    }
    setIsSelectAll(!isSelectAll);
    setSelectionMode('page');
    setShowSelectionOptions(false);
  };

  const handleSelectAllFiltered = () => {
    const allIds = users.data.map(user => user.id);
    if (selectedUsers.length === allIds.length && allIds.every(id => selectedUsers.includes(id))) {
      setSelectedUsers(selectedUsers.filter(id => !allIds.includes(id)));
    } else {
      const newSelected = [...new Set([...selectedUsers, ...allIds])];
      setSelectedUsers(newSelected);
      setSelectionMode('filtered');
    }
    setShowSelectionOptions(false);
  };

  const handleSelectAll = () => {
    if (confirm(`This will select ALL ${users.total} users. This action may take a moment.`)) {
      const pageIds = users.data.map(user => user.id);
      setSelectedUsers(pageIds);
      setSelectionMode('all');
      setShowSelectionOptions(false);
    }
  };

  const truncateText = (text: string | null, maxLength: number = 15): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

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
                placeholder="Search users by name, email, or role... (Ctrl+F)"
                className="pl-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                disabled={isLoading}
              />
              {search && !isLoading && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setSearch('')}
                  disabled={isLoading}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
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
                onClick={() => {/* handle export */}}
                disabled={isLoading}
              >
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </div>
          </div>

          {/* Basic Filters */}
          <div className="flex flex-wrap gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">Role:</span>
              <select
                className="border rounded px-2 py-1 text-sm w-28 sm:w-auto bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                disabled={isLoading}
              >
                <option value="all" className="bg-white dark:bg-gray-900">All Roles</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id} className="bg-white dark:bg-gray-900">
                    {truncateText(role.name, 15)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">Status:</span>
              <select
                className="border rounded px-2 py-1 text-sm w-28 sm:w-auto bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                disabled={isLoading}
              >
                <option value="all" className="bg-white dark:bg-gray-900">All Status</option>
                <option value="active" className="bg-white dark:bg-gray-900">Active</option>
                <option value="inactive" className="bg-white dark:bg-gray-900">Inactive</option>
                <option value="suspended" className="bg-white dark:bg-gray-900">Suspended</option>
                <option value="pending" className="bg-white dark:bg-gray-900">Pending</option>
              </select>
            </div>

            {isBulkMode && (
              <div className="flex items-center gap-2 relative" ref={selectionRef}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSelectionOptions(!showSelectionOptions)}
                  className="h-8 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  disabled={isLoading}
                >
                  <Layers className="h-3.5 w-3.5 mr-1" />
                  Select
                </Button>
                {showSelectionOptions && (
                  <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
                    <div className="p-2">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1">
                        SELECTION OPTIONS
                      </div>
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-8 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={handleSelectAllOnPage}
                      >
                        <Rows className="h-3.5 w-3.5 mr-2" />
                        Current Page ({users.data.length})
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-8 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={handleSelectAllFiltered}
                      >
                        <Filter className="h-3.5 w-3.5 mr-2" />
                        All Filtered ({users.data.length})
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-8 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={handleSelectAll}
                      >
                        <Hash className="h-3.5 w-3.5 mr-2" />
                        All ({users.total})
                      </Button>
                      <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-8 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/50"
                        onClick={() => setSelectedUsers([])}
                      >
                        <RotateCcw className="h-3.5 w-3.5 mr-2" />
                        Clear Selection
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="border-t border-gray-200 dark:border-gray-800 pt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Department Filter */}
                {departments && departments.length > 0 && setDepartmentFilter && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
                    <select
                      className="w-full border rounded px-2 py-1 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                      value={departmentFilter || 'all'}
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                      disabled={isLoading}
                    >
                      <option value="all" className="bg-white dark:bg-gray-900">All Departments</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id} className="bg-white dark:bg-gray-900">
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Per Page Selector */}
                {onPerPageChange && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Items per page</label>
                    <select
                      className="w-full border rounded px-2 py-1 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                      value={perPage || 10}
                      onChange={(e) => onPerPageChange(Number(e.target.value))}
                      disabled={isLoading}
                    >
                      <option value={10}>10 per page</option>
                      <option value={25}>25 per page</option>
                      <option value={50}>50 per page</option>
                      <option value={100}>100 per page</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Active filters indicator */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing {users.from} to {users.to} of {users.total} users
              {search && ` matching "${search}"`}
              {roleFilter !== 'all' && ` • Role: ${roles.find(r => r.id.toString() === roleFilter)?.name || ''}`}
              {statusFilter !== 'all' && ` • Status: ${statusFilter}`}
            </div>
            
            <div className="flex items-center gap-3">
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  disabled={isLoading}
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/50 h-8"
                >
                  <FilterX className="h-3.5 w-3.5 mr-1" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

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