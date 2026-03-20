import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import UsersTable from './UsersTable';
import UsersGridView from './UsersGridView';
import UsersBulkActions from './UsersBulkActions';
import { ViewToggle } from '@/components/adminui/view-toggle';
import { Pagination } from '@/components/adminui/pagination';
import { EmptyState } from '@/components/adminui/empty-state';
import { SelectAllFloat } from '@/components/adminui/select-all-float';
import { GridSelectionSummary } from '@/components/adminui/grid-selection-summary';
import { User } from '@/types';
import { 
  UserIcon,
  Plus,
  List,
  Grid3X3
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';

interface UsersContentProps {
  users: {
    data: User[];
    current_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
    per_page: number;
  };
  selectedUsers: number[];
  selectedUsersData: User[];
  isBulkMode: boolean;
  setIsBulkMode: (value: boolean) => void;
  isSelectAll: boolean;
  viewMode: 'table' | 'grid';
  setViewMode: (mode: 'table' | 'grid') => void;
  isMobile: boolean;
  hasActiveFilters: boolean;
  handleClearFilters: () => void;
  handleSelectAllOnPage: () => void;
  handleItemSelect: (id: number) => void;
  handlePageChange: (page: number) => void;
  setShowBulkDeleteDialog: (show: boolean) => void;
  setShowBulkStatusDialog: (show: boolean) => void;
  setShowBulkRoleDialog: (show: boolean) => void;
  roles: Array<{ id: number; name: string; count: number }>;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (column: string) => void;
  onClearSelection: () => void;
}

export default function UsersContent({
  users,
  selectedUsers,
  selectedUsersData,
  isBulkMode,
  setIsBulkMode,
  isSelectAll,
  viewMode,
  setViewMode,
  isMobile,
  hasActiveFilters,
  handleClearFilters,
  handleSelectAllOnPage,
  handleItemSelect,
  handlePageChange,
  setShowBulkDeleteDialog,
  setShowBulkStatusDialog,
  setShowBulkRoleDialog,
  roles,
  sortBy,
  sortOrder,
  onSort,
  onClearSelection
}: UsersContentProps) {
  // Toggle handler for bulk mode
  const handleBulkModeToggle = () => {
    setIsBulkMode(!isBulkMode);
    if (isBulkMode) {
      onClearSelection();
    }
  };

  // Set grid view as default on mobile
  useEffect(() => {
    if (isMobile && viewMode === 'table') {
      setViewMode('grid');
    }
  }, [isMobile, viewMode, setViewMode]);

  // Bulk action items configuration
  const bulkActions = {
    primary: [
      {
        label: 'Export',
        icon: <UserIcon className="h-3.5 w-3.5 mr-1.5" />,
        onClick: () => console.log('Export'),
        tooltip: 'Export selected users'
      },
      {
        label: 'Activate',
        icon: <UserIcon className="h-3.5 w-3.5 mr-1.5" />,
        onClick: () => setShowBulkStatusDialog(true),
        tooltip: 'Activate selected users'
      },
      {
        label: 'Deactivate',
        icon: <UserIcon className="h-3.5 w-3.5 mr-1.5" />,
        onClick: () => setShowBulkStatusDialog(true),
        tooltip: 'Deactivate selected users'
      }
    ],
    secondary: [
      {
        label: 'Change Role',
        icon: <UserIcon className="h-3.5 w-3.5 mr-1.5" />,
        onClick: () => setShowBulkRoleDialog(true),
        tooltip: 'Change role for selected users'
      },
      {
        label: 'Reset Password',
        icon: <UserIcon className="h-3.5 w-3.5 mr-1.5" />,
        onClick: () => console.log('Reset Password'),
        tooltip: 'Reset passwords for selected users'
      },
      {
        label: 'Send Email',
        icon: <UserIcon className="h-3.5 w-3.5 mr-1.5" />,
        onClick: () => console.log('Send Email'),
        tooltip: 'Send email to selected users'
      }
    ],
    destructive: [
      {
        label: 'Delete',
        icon: <UserIcon className="h-3.5 w-3.5 mr-1.5" />,
        onClick: () => setShowBulkDeleteDialog(true),
        tooltip: 'Delete selected users',
        variant: 'destructive' as const
      }
    ]
  };

  return (
    <>
      {/* Enhanced Bulk Actions Bar */}
      {isBulkMode && selectedUsers.length > 0 && (
        <UsersBulkActions
          selectedUsers={selectedUsers}
          selectedUsersData={selectedUsersData}
          setShowBulkDeleteDialog={setShowBulkDeleteDialog}
          setShowBulkStatusDialog={setShowBulkStatusDialog}
          setShowBulkRoleDialog={setShowBulkRoleDialog}
          setIsBulkMode={setIsBulkMode}
          bulkActions={bulkActions}
          onClearSelection={onClearSelection}
          onSelectAllOnPage={handleSelectAllOnPage}
        />
      )}

      {/* Floating Select All for Grid View */}
      {viewMode === 'grid' && users.data.length > 0 && selectedUsers.length < users.data.length && isBulkMode && (
        <SelectAllFloat
          isSelectAll={isSelectAll}
          onSelectAll={handleSelectAllOnPage}
          selectedCount={selectedUsers.length}
          totalCount={users.data.length}
          position="bottom-right"
        />
      )}

      {/* Users Table/Grid View with dark mode */}
      <Card className="overflow-hidden border border-gray-200 dark:border-gray-700 dark:bg-gray-900">
        <CardHeader className="flex flex-row items-center justify-between pb-3 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <CardTitle className="text-base sm:text-lg md:text-xl font-semibold dark:text-gray-100">
                User Accounts
                {selectedUsers.length > 0 && isBulkMode && (
                  <span className="ml-2 text-xs font-normal text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                    {selectedUsers.length} selected
                  </span>
                )}
              </CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 w-8 p-0 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-900 ${
                      viewMode === 'table' 
                        ? 'bg-gray-100 dark:bg-gray-900 dark:text-gray-200' 
                        : ''
                    }`}
                    onClick={() => setViewMode('table')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700">
                  Table view
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 w-8 p-0 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-900 ${
                      viewMode === 'grid' 
                        ? 'bg-gray-100 dark:bg-gray-900 dark:text-gray-200' 
                        : ''
                    }`}
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700">
                  Grid view
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Grid view select all checkbox */}
            {viewMode === 'grid' && isBulkMode && users.data.length > 0 && (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all-grid"
                  checked={isSelectAll}
                  onCheckedChange={handleSelectAllOnPage}
                  className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 dark:border-gray-600 dark:data-[state=checked]:bg-blue-600"
                />
                <Label 
                  htmlFor="select-all-grid" 
                  className="text-xs sm:text-sm font-medium cursor-pointer whitespace-nowrap dark:text-gray-300"
                >
                  {isSelectAll ? 'Deselect Page' : 'Select Page'}
                </Label>
              </div>
            )}
            
            {/* Bulk Mode Toggle */}
            {!isMobile && (
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="bulk-mode"
                        checked={isBulkMode}
                        onCheckedChange={handleBulkModeToggle}
                        className="data-[state=checked]:bg-blue-600 h-5 w-9 dark:data-[state=checked]:bg-blue-600"
                      />
                      <Label 
                        htmlFor="bulk-mode" 
                        className="text-xs sm:text-sm font-medium cursor-pointer whitespace-nowrap dark:text-gray-300"
                      >
                        Bulk Mode
                      </Label>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700">
                    <p>Toggle bulk selection mode</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
            
            {/* Page Info */}
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
              Page {users.current_page} of {users.last_page}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 dark:bg-gray-900">
          {/* Empty State with dark mode */}
          {users.data.length === 0 ? (
            <EmptyState
              icon={<UserIcon className="h-12 w-12 text-gray-400 dark:text-gray-600" />}
              title="No users found"
              description={hasActiveFilters 
                ? "No users match your current filters. Try adjusting your search or filters."
                : "No users have been created yet."}
              action={hasActiveFilters ? {
                label: "Clear Filters",
                onClick: handleClearFilters
              } : {
                label: "Create User",
                onClick: () => window.location.href = '/admin/users/create'
              }}
              className="py-12 sm:py-16 dark:bg-gray-900"
            />
          ) : (
            <>
              {/* Table View */}
              {viewMode === 'table' ? (
                <UsersTable
                  users={users.data}
                  isBulkMode={isBulkMode}
                  selectedUsers={selectedUsers}
                  isSelectAll={isSelectAll}
                  onItemSelect={handleItemSelect}
                  onSelectAll={handleSelectAllOnPage}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSort={onSort}
                />
              ) : (
                // Grid View
                <UsersGridView
                  users={users.data}
                  isBulkMode={isBulkMode}
                  selectedUsers={selectedUsers}
                  onItemSelect={handleItemSelect}
                  isMobile={isMobile}
                />
              )}

              {/* Grid Selection Summary with dark mode */}
              {viewMode === 'grid' && isBulkMode && selectedUsers.length > 0 && (
                <GridSelectionSummary
                  selectedCount={selectedUsers.length}
                  totalCount={users.data.length}
                  isSelectAll={isSelectAll}
                  onSelectAll={handleSelectAllOnPage}
                  onClearSelection={onClearSelection}
                  className="mt-4 mx-4 dark:text-gray-300"
                />
              )}

              {/* Pagination with dark mode */}
              {users.last_page > 1 && (
                <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
                  <Pagination
                    currentPage={users.current_page}
                    totalPages={users.last_page}
                    totalItems={users.total}
                    itemsPerPage={users.per_page}
                    onPageChange={handlePageChange}
                    showCount={true}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}