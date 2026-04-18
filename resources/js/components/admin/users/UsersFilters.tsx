// components/admin/users/UsersFilters.tsx

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Calendar,
  Shield,
  TrendingUp,
  UserCheck,
  Clock
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
    { value: '', label: 'Any Time', color: 'gray' },
    { value: 'today', label: 'Today', color: 'blue' },
    { value: 'last_7_days', label: 'Last 7 days', color: 'emerald' },
    { value: 'last_30_days', label: 'Last 30 days', color: 'amber' },
    { value: 'last_90_days', label: 'Last 90 days', color: 'orange' },
    { value: 'never', label: 'Never logged in', color: 'red' }
  ];

  // Email verification options
  const emailVerifiedOptions = [
    { value: '', label: 'All Users', color: 'gray' },
    { value: 'verified', label: 'Email Verified', color: 'emerald' },
    { value: 'unverified', label: 'Email Not Verified', color: 'amber' }
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

  // Helper to get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (roleFilter && roleFilter !== 'all') count++;
    if (statusFilter && statusFilter !== 'all') count++;
    if (emailVerifiedFilter && emailVerifiedFilter !== '') count++;
    if (lastLoginRange && lastLoginRange !== '') count++;
    if (departmentFilter && departmentFilter !== 'all') count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  // Get status color
  const getStatusColor = (statusValue: string) => {
    switch (statusValue) {
      case 'active': return 'emerald';
      case 'inactive': return 'gray';
      case 'suspended': return 'red';
      case 'pending': return 'amber';
      default: return 'gray';
    }
  };

  // Get status label
  const getStatusLabel = (value: string) => {
    switch (value) {
      case 'active': return 'Active';
      case 'inactive': return 'Inactive';
      case 'suspended': return 'Suspended';
      case 'pending': return 'Pending';
      default: return value;
    }
  };

  // Get role label
  const getRoleLabel = (value: string) => {
    const role = roles.find(r => r.id.toString() === value);
    return role?.name || value;
  };

  // Get department label
  const getDepartmentLabel = (value: string) => {
    const dept = departments?.find(d => d.id.toString() === value);
    return dept?.name || value;
  };

  // Get email verification info
  const getEmailVerificationInfo = (value: string) => {
    const option = emailVerifiedOptions.find(o => o.value === value);
    return { label: option?.label || value, color: option?.color || 'gray' };
  };

  // Get last login info
  const getLastLoginInfo = (value: string) => {
    const option = lastLoginRanges.find(o => o.value === value);
    return { label: option?.label || value, color: option?.color || 'gray' };
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
                placeholder="Search users by name, email, role, or department... (Ctrl+F)"
                className="pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                disabled={isLoading}
              />
              {search && !isLoading && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  onClick={() => setSearch('')}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="h-10 px-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl transition-all"
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
                className="h-10 px-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl transition-all"
                onClick={() => {/* handle export */}}
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
              <span className="font-semibold text-gray-700 dark:text-gray-300">{users.from}-{users.to}</span>
              <span className="mx-1">of</span>
              <span className="font-semibold text-gray-700 dark:text-gray-300">{users.total}</span>
              <span className="ml-1">users</span>
              {search && (
                <span className="ml-1">
                  matching <span className="font-medium text-indigo-600 dark:text-indigo-400">“{search}”</span>
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              {/* Active filter badges */}
              {activeFilters && (
                <>
                  {roleFilter && roleFilter !== 'all' && (
                    <Badge variant="secondary" className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-0 rounded-full px-2.5 py-1 text-xs font-medium">
                      <Shield className="h-3 w-3 mr-1 inline" />
                      Role: {getRoleLabel(roleFilter)}
                    </Badge>
                  )}
                  {statusFilter && statusFilter !== 'all' && (
                    <Badge variant="secondary" className={`${
                      getStatusColor(statusFilter) === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                      getStatusColor(statusFilter) === 'red' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                      getStatusColor(statusFilter) === 'amber' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                      'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    } border-0 rounded-full px-2.5 py-1 text-xs font-medium`}>
                      <UserCheck className="h-3 w-3 mr-1 inline" />
                      {getStatusLabel(statusFilter)}
                    </Badge>
                  )}
                  {emailVerifiedFilter && emailVerifiedFilter !== '' && (
                    <Badge variant="secondary" className={`${
                      getEmailVerificationInfo(emailVerifiedFilter).color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                      'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                    } border-0 rounded-full px-2.5 py-1 text-xs font-medium`}>
                      <Mail className="h-3 w-3 mr-1 inline" />
                      {getEmailVerificationInfo(emailVerifiedFilter).label}
                    </Badge>
                  )}
                  {lastLoginRange && lastLoginRange !== '' && (
                    <Badge variant="secondary" className={`${
                      getLastLoginInfo(lastLoginRange).color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                      getLastLoginInfo(lastLoginRange).color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                      getLastLoginInfo(lastLoginRange).color === 'amber' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                      getLastLoginInfo(lastLoginRange).color === 'red' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                      'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    } border-0 rounded-full px-2.5 py-1 text-xs font-medium`}>
                      <Calendar className="h-3 w-3 mr-1 inline" />
                      {getLastLoginInfo(lastLoginRange).label}
                    </Badge>
                  )}
                  {departmentFilter && departmentFilter !== 'all' && departments && (
                    <Badge variant="secondary" className="bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-0 rounded-full px-2.5 py-1 text-xs font-medium">
                      <Users className="h-3 w-3 mr-1 inline" />
                      Dept: {getDepartmentLabel(departmentFilter)}
                    </Badge>
                  )}
                </>
              )}
              
              {activeFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {/* Role Filter */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Role
              </Label>
              <Select
                value={roleFilter}
                onValueChange={setRoleFilter}
                disabled={isLoading}
              >
                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-indigo-500">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {truncateText(role.name, 25)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <UserCheck className="h-3 w-3" />
                Status
              </Label>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
                disabled={isLoading}
              >
                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Email Verification Filter */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Mail className="h-3 w-3" />
                Email Verification
              </Label>
              <Select
                value={emailVerifiedFilter || ''}
                onValueChange={(value) => setEmailVerifiedFilter?.(value)}
                disabled={isLoading}
              >
                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                  <SelectValue placeholder="All Users" />
                </SelectTrigger>
                <SelectContent>
                  {emailVerifiedOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          option.color === 'emerald' ? 'bg-emerald-500' :
                          option.color === 'amber' ? 'bg-amber-500' :
                          'bg-gray-400'
                        }`} />
                        {option.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Last Login Filter */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Last Login
              </Label>
              <Select
                value={lastLoginRange || ''}
                onValueChange={(value) => setLastLoginRange?.(value)}
                disabled={isLoading}
              >
                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                  <SelectValue placeholder="Any Time" />
                </SelectTrigger>
                <SelectContent>
                  {lastLoginRanges.map(range => (
                    <SelectItem key={range.value} value={range.value}>
                      <span className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          range.color === 'blue' ? 'bg-blue-500' :
                          range.color === 'emerald' ? 'bg-emerald-500' :
                          range.color === 'amber' ? 'bg-amber-500' :
                          range.color === 'orange' ? 'bg-orange-500' :
                          range.color === 'red' ? 'bg-red-500' :
                          'bg-gray-400'
                        }`} />
                        {range.label}
                      </span>
                    </SelectItem>
                  ))}
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Department Filter */}
                {departments && departments.length > 0 && setDepartmentFilter && (
                  <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-3 rounded-xl">
                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Users className="h-4 w-4 text-indigo-500" />
                      Department
                    </Label>
                    <Select
                      value={departmentFilter || 'all'}
                      onValueChange={setDepartmentFilter}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                        <SelectValue placeholder="All Departments" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id.toString()}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Per Page Selector */}
                {onPerPageChange && (
                  <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-3 rounded-xl">
                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Rows className="h-4 w-4 text-emerald-500" />
                      Items per page
                    </Label>
                    <Select
                      value={perPage?.toString() || '10'}
                      onValueChange={(value) => onPerPageChange(Number(value))}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                        <SelectValue placeholder="10 per page" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 per page</SelectItem>
                        <SelectItem value="25">25 per page</SelectItem>
                        <SelectItem value="50">50 per page</SelectItem>
                        <SelectItem value="100">100 per page</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-3 rounded-xl">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-amber-500" />
                    Quick Actions
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                      onClick={() => {
                        setStatusFilter('active');
                        setShowAdvancedFilters(false);
                      }}
                      disabled={isLoading}
                    >
                      <UserCheck className="h-3 w-3 mr-1" />
                      Active Only
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                      onClick={() => {
                        setStatusFilter('pending');
                        setShowAdvancedFilters(false);
                      }}
                      disabled={isLoading}
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      Pending Only
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                      onClick={() => {
                        setEmailVerifiedFilter?.('unverified');
                        setShowAdvancedFilters(false);
                      }}
                      disabled={isLoading}
                    >
                      <Mail className="h-3 w-3 mr-1" />
                      Unverified Email
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                      onClick={() => {
                        setLastLoginRange?.('never');
                        setShowAdvancedFilters(false);
                      }}
                      disabled={isLoading}
                    >
                      <Calendar className="h-3 w-3 mr-1" />
                      Never Logged In
                    </Button>
                  </div>
                </div>
              </div>

              {/* Information Section - Modern */}
              <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800/30 dark:to-gray-800/10 rounded-xl border border-gray-100 dark:border-gray-800">
                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide flex items-center gap-2">
                  <Users className="h-3 w-3" />
                  User Information
                </h4>
                <div className="text-xs text-gray-500 dark:text-gray-400 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                  <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Email verified</span> - Users who have confirmed their email address</p>
                  <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Last login</span> - Track user activity and engagement</p>
                  <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Pending status</span> - Users awaiting approval or verification</p>
                  <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Department</span> - Organizational unit assignment</p>
                </div>
                <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
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
                    <FilterX className="h-3 w-3 mr-1" />
                    Reset All
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Bulk Mode Selection - Modern */}
          {isBulkMode && (
            <div className="relative" ref={selectionRef}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSelectionOptions(!showSelectionOptions)}
                className="w-full md:w-auto h-9 px-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg text-sm"
                disabled={isLoading}
              >
                <Layers className="h-3.5 w-3.5 mr-2" />
                Select Users {selectedUsers.length > 0 && `(${selectedUsers.length})`}
              </Button>
              
              {showSelectionOptions && (
                <div className="absolute left-0 top-full mt-1 z-50 w-52 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
                  <div className="p-2">
                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 py-1.5 uppercase tracking-wider">
                      SELECTION OPTIONS
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-8 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      onClick={handleSelectAllOnPage}
                    >
                      <Rows className="h-3.5 w-3.5 mr-2" />
                      Current Page ({users.data.length})
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-8 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      onClick={handleSelectAllFiltered}
                    >
                      <Filter className="h-3.5 w-3.5 mr-2" />
                      All Filtered ({users.data.length})
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-8 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      onClick={handleSelectAll}
                    >
                      <Hash className="h-3.5 w-3.5 mr-2" />
                      All ({users.total})
                    </Button>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-8 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg"
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