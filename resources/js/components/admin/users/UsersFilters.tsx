// components/admin/users/UsersFilters.tsx

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Filter, 
  Download, 
  X, 
  FilterX, 
  Layers, 
  Rows, 
  Hash,
  RotateCcw,
  Users,
  Mail,
  Calendar
} from 'lucide-react';
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
  onPerPageChange,
  emailVerifiedFilter,
  setEmailVerifiedFilter,
  lastLoginRange,
  setLastLoginRange
}: UsersFiltersProps) {
  const [showSelectionOptions, setShowSelectionOptions] = useState(false);
  const selectionRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Last login range options
  const lastLoginRanges = [
    { value: '', label: 'Any Time' },
    { value: 'today', label: 'Today' },
    { value: 'last_7_days', label: 'Last 7 days' },
    { value: 'last_30_days', label: 'Last 30 days' },
    { value: 'last_90_days', label: 'Last 90 days' },
    { value: 'never', label: 'Never logged in' }
  ];

  // Email verification options
  const emailVerifiedOptions = [
    { value: '', label: 'All Users' },
    { value: 'verified', label: 'Email Verified' },
    { value: 'unverified', label: 'Email Not Verified' }
  ];

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

  // Convert hasActiveFilters to boolean
  const activeFilters = typeof hasActiveFilters === 'string' 
    ? hasActiveFilters === 'true' || hasActiveFilters === '1'
    : Boolean(hasActiveFilters);

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

          {/* Active Filters Info and Clear Button */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing {users.from} to {users.to} of {users.total} users
              {search && ` matching "${search}"`}
            </div>
            
            <div className="flex items-center gap-3">
              {activeFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  disabled={isLoading}
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 h-8 hover:bg-red-50 dark:hover:bg-red-950/50"
                >
                  <FilterX className="h-3.5 w-3.5 mr-1" />
                  Clear Filters
                </Button>
              )}
              {isBulkMode && selectedUsers.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2 py-1 rounded-md text-xs">
                    <Layers className="h-3 w-3" />
                    <span>{selectedUsers.length} selected</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedUsers([])}
                    className="h-7 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    Clear
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Basic Filters - Role + Status + Email Verification + Last Login */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Users className="h-3 w-3" />
                Role
              </Label>
              <select
                className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                disabled={isLoading}
              >
                <option value="all">All Roles</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {truncateText(role.name, 25)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <FilterX className="h-3 w-3" />
                Status
              </Label>
              <select
                className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                disabled={isLoading}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Mail className="h-3 w-3" />
                Email Verification
              </Label>
              <select
                className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                value={emailVerifiedFilter || ''}
                onChange={(e) => setEmailVerifiedFilter?.(e.target.value)}
                disabled={isLoading}
              >
                {emailVerifiedOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Last Login
              </Label>
              <select
                className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                value={lastLoginRange || ''}
                onChange={(e) => setLastLoginRange?.(e.target.value)}
                disabled={isLoading}
              >
                {lastLoginRanges.map(range => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bulk Mode Selection */}
          {isBulkMode && (
            <div className="space-y-1">
              <Label className="text-xs text-gray-500 dark:text-gray-400">Bulk Actions</Label>
              <div className="flex items-center gap-2 relative" ref={selectionRef}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSelectionOptions(!showSelectionOptions)}
                  className="w-full h-8 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  disabled={isLoading}
                >
                  <Layers className="h-3.5 w-3.5 mr-1" />
                  Select Users ({selectedUsers.length} selected)
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
                        onClick={() => {
                          setSelectedUsers([]);
                          setShowSelectionOptions(false);
                        }}
                      >
                        <RotateCcw className="h-3.5 w-3.5 mr-2" />
                        Clear Selection
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="border-t pt-4 space-y-4 border-gray-200 dark:border-gray-800">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Advanced Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Department Filter */}
                {departments && departments.length > 0 && setDepartmentFilter && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Department</Label>
                    <select
                      className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                      value={departmentFilter || 'all'}
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                      disabled={isLoading}
                    >
                      <option value="all">All Departments</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Per Page Selector */}
                {onPerPageChange && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Items per page</Label>
                    <select
                      className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
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

                {/* Quick Actions */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Actions</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        setStatusFilter('active');
                        setShowAdvancedFilters(false);
                      }}
                      disabled={isLoading}
                    >
                      Active Only
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        setStatusFilter('pending');
                        setShowAdvancedFilters(false);
                      }}
                      disabled={isLoading}
                    >
                      Pending Only
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        setEmailVerifiedFilter?.('unverified');
                        setShowAdvancedFilters(false);
                      }}
                      disabled={isLoading}
                    >
                      Unverified Email
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        setLastLoginRange?.('never');
                        setShowAdvancedFilters(false);
                      }}
                      disabled={isLoading}
                    >
                      Never Logged In
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        setRoleFilter('all');
                        setStatusFilter('all');
                        setEmailVerifiedFilter?.('');
                        setLastLoginRange?.('');
                        if (setDepartmentFilter) setDepartmentFilter('all');
                        setShowAdvancedFilters(false);
                      }}
                      disabled={isLoading}
                    >
                      Reset All
                    </Button>
                  </div>
                </div>
              </div>

              {/* Information Section */}
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Information</h4>
                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <p>• <span className="font-medium">Email verified</span> - Users who have confirmed their email address</p>
                  <p>• <span className="font-medium">Last login</span> - Track user activity and engagement</p>
                  <p>• <span className="font-medium">Pending status</span> - Users awaiting approval or verification</p>
                  <p>• Use the table header to sort by any column</p>
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