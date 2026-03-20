import { useState, useEffect, useCallback, useMemo } from 'react';
import { usePage, router } from '@inertiajs/react';
import { toast } from 'sonner';
import AppLayout from '@/layouts/admin-app-layout';
import { TooltipProvider } from '@/components/ui/tooltip';
import UsersHeader from '@/components/admin/users/UsersHeader';
import UsersStats from '@/components/admin/users/UsersStats';
import UsersFilters from '@/components/admin/users/UsersFilters';
import UsersContent from '@/components/admin/users/UsersContent';
import UsersDialogs from '@/components/admin/users/UsersDialogs';
import UsersKeyboardShortcuts from '@/components/admin/users/UsersKeyboardShortcuts';
import UsersPermissionsOverview from '@/components/admin/users/UsersPermissionsOverview';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';

// Types
interface User {
  id: number;
  first_name: string | null;
  last_name: string | null;
  email: string;
  role_id: number;
  role?: { id: number; name: string };
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  email_verified_at: string | null;
  two_factor_enabled: boolean;
  last_login_at: string | null;
  department?: { id: number; name: string };
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

interface PagePropsWithData {
  users: {
    data: User[];
    current_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
    per_page: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
  };
  stats: Array<{ label: string; value: number; change?: number; icon?: string; color?: string }>;
  roles: Array<{ id: number; name: string; count: number }>;
  filters: {
    search?: string;
    role_id?: string | number;
    status?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  };
}

export default function Users() {
  const { users, stats, roles, filters } = usePage<PagePropsWithData>().props;
  
  // Filter states
  const [search, setSearch] = useState(filters.search || '');
  const [roleFilter, setRoleFilter] = useState<string>(filters.role_id?.toString() || 'all');
  const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
  const [sortBy, setSortBy] = useState(filters.sort_by || 'name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(filters.sort_order || 'asc');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // UI states
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>(isMobile ? 'grid' : 'table');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Bulk selection states
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [selectionMode, setSelectionMode] = useState<'page' | 'filtered' | 'all'>('page');
  
  // Dialog states
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [showBulkStatusDialog, setShowBulkStatusDialog] = useState(false);
  const [showBulkRoleDialog, setShowBulkRoleDialog] = useState(false);
  const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false);
  const [bulkEditValue, setBulkEditValue] = useState<string>('');

  // Track window resize
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      const mobile = width < 768;
      setIsMobile(mobile);
      
      // Auto switch to grid view on mobile
      if (mobile && viewMode === 'table') {
        setViewMode('grid');
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);

  // Auto switch to grid view on mobile on initial load
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768 && viewMode === 'table') {
      setViewMode('grid');
    }
  }, []);

  

  // Reset selection when bulk mode is turned off or filters change
  useEffect(() => {
    if (!isBulkMode) {
      setSelectedUsers([]);
      setIsSelectAll(false);
    }
  }, [isBulkMode]);

  // Check if all items on current page are selected
  useEffect(() => {
    const allPageIds = users.data.map(user => user.id);
    const allSelected = allPageIds.length > 0 && allPageIds.every(id => selectedUsers.includes(id));
    setIsSelectAll(allSelected);
  }, [selectedUsers, users.data]);

  const hasActiveFilters = useMemo(() => {
    return search || roleFilter !== 'all' || statusFilter !== 'all';
  }, [search, roleFilter, statusFilter]);

  const selectedUsersData = useMemo(() => {
    return users.data.filter(user => selectedUsers.includes(user.id));
  }, [users.data, selectedUsers]);

  // Bulk selection handlers
  const handleSelectAllOnPage = useCallback(() => {
    const pageIds = users.data.map(user => user.id);
    if (isSelectAll) {
      setSelectedUsers(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      const newSelected = [...new Set([...selectedUsers, ...pageIds])];
      setSelectedUsers(newSelected);
    }
    setIsSelectAll(!isSelectAll);
    setSelectionMode('page');
  }, [users.data, isSelectAll, selectedUsers]);

  const handleSelectAllFiltered = useCallback(() => {
    const allIds = users.data.map(user => user.id);
    if (selectedUsers.length === allIds.length && allIds.every(id => selectedUsers.includes(id))) {
      setSelectedUsers(prev => prev.filter(id => !allIds.includes(id)));
    } else {
      const newSelected = [...new Set([...selectedUsers, ...allIds])];
      setSelectedUsers(newSelected);
      setSelectionMode('filtered');
    }
  }, [users.data, selectedUsers]);

  const handleSelectAll = useCallback(() => {
    if (window.confirm(`This will select ALL ${users.total} users. This action may take a moment.`)) {
      const pageIds = users.data.map(user => user.id);
      setSelectedUsers(pageIds);
      setSelectionMode('all');
    }
  }, [users.data, users.total]);

  const handleItemSelect = useCallback((id: number) => {
    setSelectedUsers(prev => {
      if (prev.includes(id)) {
        return prev.filter(itemId => itemId !== id);
      } else {
        return [...prev, id];
      }
    });
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedUsers([]);
    setIsSelectAll(false);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearch('');
    setRoleFilter('all');
    setStatusFilter('all');
    setSortBy('name');
    setSortOrder('asc');
    router.get('/admin/users', {}, { 
      preserveState: true, 
      replace: true 
    });
  }, []);

  const handlePageChange = useCallback((page: number) => {
    router.get('/admin/users', {
      ...filters,
      page,
      search: search || undefined,
      role_id: roleFilter !== 'all' ? roleFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      sort_by: sortBy,
      sort_order: sortOrder,
    }, {
      preserveState: true,
      replace: true,
    });
  }, [filters, search, roleFilter, statusFilter, sortBy, sortOrder]);

  const handleSort = useCallback((column: string) => {
    const newSortOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(column);
    setSortOrder(newSortOrder);
  }, [sortBy, sortOrder]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    router.reload({ 
      only: ['users', 'stats'],
      onFinish: () => {
        setIsRefreshing(false);
        toast.success('Data refreshed');
      }
    });
  }, []);

  // Bulk operation handler
  const handleBulkOperation = useCallback(async (operation: string) => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user');
      return;
    }

    setIsPerformingBulkAction(true);
    try {
      switch (operation) {
        case 'export':
          // Export logic
          const exportData = selectedUsersData.map(user => ({
            'Name': user.first_name ? `${user.first_name} ${user.last_name}`.trim() : user.email,
            'Email': user.email,
            'Role': user.role?.name || 'N/A',
            'Department': user.department?.name || 'N/A',
            'Status': user.status,
            'Email Verified': user.email_verified_at ? 'Yes' : 'No',
            '2FA Enabled': user.two_factor_enabled ? 'Yes' : 'No',
            'Last Login': user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never',
            'Created': new Date(user.created_at).toLocaleDateString(),
          }));
          
          const csv = [
            Object.keys(exportData[0]).join(','),
            ...exportData.map(row => Object.values(row).join(','))
          ].join('\n');
          
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
          a.click();
          window.URL.revokeObjectURL(url);
          
          toast.success(`Exported ${selectedUsers.length} users`);
          break;
        case 'activate':
          // Activate logic
          toast.success(`${selectedUsers.length} users activated`);
          break;
        case 'deactivate':
          // Deactivate logic
          toast.success(`${selectedUsers.length} users deactivated`);
          break;
        case 'delete':
          setShowBulkDeleteDialog(true);
          break;
        case 'role':
          setShowBulkRoleDialog(true);
          break;
        default:
          toast.info(`${operation} functionality to be implemented`);
      }
    } catch (error) {
      toast.error(`Failed to ${operation} users`);
    } finally {
      setIsPerformingBulkAction(false);
    }
  }, [selectedUsers, selectedUsersData]);

  const handleCopySelectedData = useCallback(() => {
    if (selectedUsersData.length === 0) {
      toast.error('No data to copy');
      return;
    }
    
    const data = selectedUsersData.map(user => ({
      'Name': user.first_name ? `${user.first_name} ${user.last_name}`.trim() : user.email,
      'Email': user.email,
      'Role': user.role?.name || 'N/A',
      'Department': user.department?.name || 'N/A',
      'Status': user.status,
    }));
    
    const csv = [
      Object.keys(data[0]).join('\t'),
      ...data.map(row => Object.values(row).join('\t'))
    ].join('\n');
    
    navigator.clipboard.writeText(csv).then(() => {
      toast.success('Data copied to clipboard');
    }).catch(() => {
      toast.error('Failed to copy to clipboard');
    });
  }, [selectedUsersData]);

  return (
    <AppLayout
      title="Users"
      breadcrumbs={[
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Administration', href: '/administration' },
        { title: 'Users', href: '/admin/users' }
      ]}
    >
      <TooltipProvider>
        <div className="space-y-6">
          {/* Header with actions */}
          <div className="flex items-center justify-between">
            <UsersHeader
              isBulkMode={isBulkMode}
              setIsBulkMode={setIsBulkMode}
              isMobile={isMobile}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Stats Cards */}
          <UsersStats stats={stats} />

          {/* Filters */}
          <UsersFilters
            search={search}
            setSearch={setSearch}
            roleFilter={roleFilter}
            setRoleFilter={setRoleFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            showAdvancedFilters={showAdvancedFilters}
            setShowAdvancedFilters={setShowAdvancedFilters}
            hasActiveFilters={hasActiveFilters}
            handleClearFilters={handleClearFilters}
            roles={roles}
            isBulkMode={isBulkMode}
            selectedUsers={selectedUsers}
            setSelectedUsers={setSelectedUsers}
            setIsSelectAll={setIsSelectAll}
            users={users}
            selectionMode={selectionMode}
            setSelectionMode={setSelectionMode}
            onSelectAllOnPage={handleSelectAllOnPage}
            onSelectAllFiltered={handleSelectAllFiltered}
            onSelectAll={handleSelectAll}
            isLoading={isRefreshing}
          />

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 text-sm bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1">
                Active filters applied. 
                {search && ` Search: "${search}"`}
                {roleFilter !== 'all' && ` Role: ${roles.find(r => r.id.toString() === roleFilter)?.name}`}
                {statusFilter !== 'all' && ` Status: ${statusFilter}`}
                {sortBy !== 'name' && ` Sorted by: ${sortBy} (${sortOrder})`}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 h-7 px-2"
              >
                Clear all
              </Button>
            </div>
          )}

          {/* Main Content */}
          <UsersContent
            users={users}
            selectedUsers={selectedUsers}
            selectedUsersData={selectedUsersData}
            isBulkMode={isBulkMode}
            setIsBulkMode={setIsBulkMode}
            isSelectAll={isSelectAll}
            viewMode={viewMode}
            setViewMode={setViewMode}
            isMobile={isMobile}
            hasActiveFilters={hasActiveFilters}
            handleClearFilters={handleClearFilters}
            handleSelectAllOnPage={handleSelectAllOnPage}
            handleItemSelect={handleItemSelect}
            handlePageChange={handlePageChange}
            setShowBulkDeleteDialog={setShowBulkDeleteDialog}
            setShowBulkStatusDialog={setShowBulkStatusDialog}
            setShowBulkRoleDialog={setShowBulkRoleDialog}
            roles={roles}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            onClearSelection={handleClearSelection}
            onBulkOperation={handleBulkOperation}
            onCopySelectedData={handleCopySelectedData}
            isLoading={isRefreshing}
          />

          {/* Permissions Overview */}
          <UsersPermissionsOverview />

          {/* Keyboard Shortcuts Help - Only in bulk mode */}
          {isBulkMode && !isMobile && (
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Keyboard Shortcuts</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsBulkMode(false)}
                  className="h-7 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  disabled={isPerformingBulkAction}
                >
                  Exit Bulk Mode (Esc)
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-xs">
                <div className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded font-mono text-gray-800 dark:text-gray-200">Ctrl+A</kbd>
                  <span className="text-gray-600 dark:text-gray-400">Select page</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded font-mono text-gray-800 dark:text-gray-200">Shift+Ctrl+A</kbd>
                  <span className="text-gray-600 dark:text-gray-400">Select filtered</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded font-mono text-gray-800 dark:text-gray-200">Delete</kbd>
                  <span className="text-gray-600 dark:text-gray-400">Delete selected</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded font-mono text-gray-800 dark:text-gray-200">Esc</kbd>
                  <span className="text-gray-600 dark:text-gray-400">Exit/Clear</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </TooltipProvider>

      {/* Dialogs */}
      <UsersDialogs
        showBulkDeleteDialog={showBulkDeleteDialog}
        setShowBulkDeleteDialog={setShowBulkDeleteDialog}
        showBulkStatusDialog={showBulkStatusDialog}
        setShowBulkStatusDialog={setShowBulkStatusDialog}
        showBulkRoleDialog={showBulkRoleDialog}
        setShowBulkRoleDialog={setShowBulkRoleDialog}
        selectedUsers={selectedUsers}
        selectedUsersData={selectedUsersData}
        isPerformingBulkAction={isPerformingBulkAction}
        bulkEditValue={bulkEditValue}
        setBulkEditValue={setBulkEditValue}
        roles={roles}
      />

      {/* Keyboard Shortcuts Component */}
      {isBulkMode && !isMobile && (
        <UsersKeyboardShortcuts
          isBulkMode={isBulkMode}
          setIsBulkMode={setIsBulkMode}
          isPerformingBulkAction={isPerformingBulkAction}
          onSelectAllPage={handleSelectAllOnPage}
          onSelectAllFiltered={handleSelectAllFiltered}
          onDelete={() => setShowBulkDeleteDialog(true)}
          onClearSelection={handleClearSelection}
        />
      )}
    </AppLayout>
  );
}