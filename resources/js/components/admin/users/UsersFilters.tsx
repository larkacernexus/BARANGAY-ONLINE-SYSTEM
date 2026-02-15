import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

interface UsersFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  roleFilter: string;
  setRoleFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  showAdvancedFilters: boolean;
  setShowAdvancedFilters: (value: boolean) => void;
  hasActiveFilters: boolean;
  handleClearFilters: () => void;
  roles: Array<{ id: number; name: string; count: number }>;
  isBulkMode: boolean;
  selectedUsers: number[];
  setSelectedUsers: (ids: number[]) => void;
  setIsSelectAll: (value: boolean) => void;
  users: any;
  selectionMode: 'page' | 'filtered' | 'all';
  setSelectionMode: (mode: 'page' | 'filtered' | 'all') => void;
}

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
  isBulkMode,
  selectedUsers,
  setSelectedUsers,
  setIsSelectAll,
  users,
  selectionMode,
  setSelectionMode
}: UsersFiltersProps) {
  const [showSelectionOptions, setShowSelectionOptions] = useState(false);
  const selectionRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSelectAllOnPage = () => {
    const pageIds = users.data.map((user: any) => user.id);
    const isSelectAll = selectedUsers.length === pageIds.length && 
                       pageIds.every((id: number) => selectedUsers.includes(id));
    
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
    const allIds = users.data.map((user: any) => user.id);
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
      const pageIds = users.data.map((user: any) => user.id);
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
    <Card className="overflow-hidden">
      <CardContent className="pt-6">
        <div className="flex flex-col space-y-4">
          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                ref={searchInputRef}
                placeholder="Search users by name, email, or role... (Ctrl+F)"
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
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
                onClick={() => {/* handle export */}}
              >
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </div>
          </div>

          {/* Basic Filters */}
          <div className="flex flex-wrap gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 hidden sm:inline">Role:</span>
              <select
                className="border rounded px-2 py-1 text-sm w-28 sm:w-auto"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {truncateText(role.name, 15)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 hidden sm:inline">Status:</span>
              <select
                className="border rounded px-2 py-1 text-sm w-28 sm:w-auto"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            {isBulkMode && (
              <div className="flex items-center gap-2" ref={selectionRef}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSelectionOptions(!showSelectionOptions)}
                  className="h-8"
                >
                  <Layers className="h-3.5 w-3.5 mr-1" />
                  Select
                </Button>
                {showSelectionOptions && (
                  <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-white dark:bg-gray-800 border rounded-md shadow-lg">
                    <div className="p-2">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1">
                        SELECTION OPTIONS
                      </div>
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-8 text-sm"
                        onClick={handleSelectAllOnPage}
                      >
                        <Rows className="h-3.5 w-3.5 mr-2" />
                        Current Page ({users.data.length})
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-8 text-sm"
                        onClick={handleSelectAllFiltered}
                      >
                        <Filter className="h-3.5 w-3.5 mr-2" />
                        All Filtered ({users.data.length})
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-8 text-sm"
                        onClick={handleSelectAll}
                      >
                        <Hash className="h-3.5 w-3.5 mr-2" />
                        All ({users.total})
                      </Button>
                      <div className="border-t my-1"></div>
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-8 text-sm text-red-600 hover:text-red-700"
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
            <div className="border-t pt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 2FA Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Two-Factor Authentication</label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                    >
                      2FA Enabled
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                    >
                      2FA Disabled
                    </Button>
                  </div>
                </div>

                {/* Department Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Department</label>
                  <select
                    className="w-full border rounded px-2 py-1 text-sm"
                    onChange={(e) => {}}
                  >
                    <option value="all">All Departments</option>
                    <option value="Barangay Office">Barangay Office</option>
                    <option value="Finance">Finance</option>
                    <option value="Registry">Registry</option>
                    <option value="Services">Services</option>
                    <option value="Planning">Planning</option>
                    <option value="Internal Audit">Internal Audit</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Active filters indicator */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {users.from} to {users.to} of {users.total} users
              {search && ` matching "${search}"`}
            </div>
            
            <div className="flex items-center gap-3">
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-red-600 hover:text-red-700 h-8"
                >
                  <FilterX className="h-3.5 w-3.5 mr-1" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}