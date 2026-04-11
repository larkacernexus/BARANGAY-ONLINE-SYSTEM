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
import { AlertCircle } from 'lucide-react';

// Import types
import type { 
  UsersPageProps, 
  UserStatus, 
  SortOrder,
  BulkOperation,
  SelectionMode,
  ViewMode
} from '@/types/admin/users/user-types';

// Helper functions for safe value extraction
const getSafeString = (value: any, defaultValue: string = ''): string => {
    if (value === null || value === undefined) return defaultValue;
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    return defaultValue;
};

// Page props with data (matches Laravel response)
interface PageProps extends UsersPageProps {
  // Additional props specific to this page if needed
}

export default function Users() {
  const { users, stats, roles, filters, can, departments } = usePage<PageProps>().props;
  
  // Safe data extraction
  const safeUsers = users || { data: [], current_page: 1, last_page: 1, total: 0, per_page: 15, from: 0, to: 0 };
  const allUsers = safeUsers.data || [];
  const safeFilters = filters || {};
  const safeStats = stats || { total: 0, active: 0, inactive: 0, new_this_month: 0, by_role: {}, by_status: {} };
  const safeRoles = roles || [];
  const safeDepartments = departments || [];
  
  // Filter states - client-side only (removed sortBy/sortOrder from filters, kept for table sorting)
  const [search, setSearch] = useState<string>(getSafeString(safeFilters.search));
  const [roleFilter, setRoleFilter] = useState<string>(getSafeString(safeFilters.role_id, 'all'));
  const [statusFilter, setStatusFilter] = useState<string>(getSafeString(safeFilters.status, 'all'));
  const [emailVerifiedFilter, setEmailVerifiedFilter] = useState<string>(getSafeString(safeFilters.email_verified, ''));
  const [lastLoginRange, setLastLoginRange] = useState<string>(getSafeString(safeFilters.last_login_range, ''));
  const [departmentFilter, setDepartmentFilter] = useState<string>(getSafeString(safeFilters.department_id, 'all'));
  
  // Sorting is now handled by table header only
  const [sortBy, setSortBy] = useState<string>(getSafeString(safeFilters.sort_by, 'name'));
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(15);
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [viewMode, setViewMode] = useState<ViewMode>(isMobile ? 'grid' : 'table');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Bulk selection states
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('page');
  
  // Dialog states
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [showBulkStatusDialog, setShowBulkStatusDialog] = useState(false);
  const [showBulkRoleDialog, setShowBulkRoleDialog] = useState(false);
  const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false);
  const [bulkEditValue, setBulkEditValue] = useState<string>('');

  // Safe can object with default values to prevent undefined errors
  const safeCan = {
    create_users: can?.create_users ?? false,
    edit_users: can?.edit_users ?? false,
    delete_users: can?.delete_users ?? false,
    bulk_actions: can?.bulk_actions ?? false,
    export_users: can?.export_users ?? false,
    manage_roles: can?.manage_roles ?? false,
    impersonate: can?.impersonate ?? false,
  };

  // Track window resize
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      const mobile = width < 768;
      setIsMobile(mobile);
      
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

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter, statusFilter, emailVerifiedFilter, lastLoginRange, departmentFilter, sortBy, sortOrder]);

  // Reset selection when bulk mode is turned off
  useEffect(() => {
    if (!isBulkMode) {
      setSelectedUsers([]);
      setIsSelectAll(false);
    }
  }, [isBulkMode]);

  // Helper function to check last login range
  const checkLastLoginRange = (lastLoginAt: string | null, range: string): boolean => {
    if (!lastLoginAt && range === 'never') return true;
    if (!lastLoginAt) return false;
    
    const lastLogin = new Date(lastLoginAt);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
    
    switch (range) {
      case 'today': return diffDays === 0;
      case 'last_7_days': return diffDays <= 7;
      case 'last_30_days': return diffDays <= 30;
      case 'last_90_days': return diffDays <= 90;
      case 'never': return false;
      default: return true;
    }
  };

  // Filter users client-side
  const filteredUsers = useMemo(() => {
    if (!allUsers || allUsers.length === 0) {
      return [];
    }
    
    let filtered = [...allUsers];
    
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(user =>
        user?.first_name?.toLowerCase().includes(searchLower) ||
        user?.last_name?.toLowerCase().includes(searchLower) ||
        user?.email?.toLowerCase().includes(searchLower) ||
        user?.username?.toLowerCase().includes(searchLower)
      );
    }
    
    // Role filter
    if (roleFilter && roleFilter !== 'all') {
      filtered = filtered.filter(user => user?.role_id?.toString() === roleFilter);
    }
    
    // Status filter
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(user => user?.status === statusFilter);
    }
    
    // Email verified filter
    if (emailVerifiedFilter) {
      if (emailVerifiedFilter === 'verified') {
        filtered = filtered.filter(user => user?.email_verified_at !== null);
      } else if (emailVerifiedFilter === 'unverified') {
        filtered = filtered.filter(user => user?.email_verified_at === null);
      }
    }
    
    // Last login range filter
    if (lastLoginRange) {
      filtered = filtered.filter(user => checkLastLoginRange(user?.last_login_at, lastLoginRange));
    }
    
    // Department filter
    if (departmentFilter && departmentFilter !== 'all') {
      filtered = filtered.filter(user => user?.department_id?.toString() === departmentFilter);
    }
    
    // Apply sorting (for table header)
    if (filtered.length > 0) {
      filtered.sort((a, b) => {
        let valueA: any;
        let valueB: any;
        
        switch (sortBy) {
          case 'name':
            const nameA = `${a?.first_name || ''} ${a?.last_name || ''}`.trim();
            const nameB = `${b?.first_name || ''} ${b?.last_name || ''}`.trim();
            valueA = nameA || a?.email || '';
            valueB = nameB || b?.email || '';
            break;
          case 'email':
            valueA = a?.email || '';
            valueB = b?.email || '';
            break;
          case 'role':
            valueA = a?.role?.name || '';
            valueB = b?.role?.name || '';
            break;
          case 'status':
            valueA = a?.status || '';
            valueB = b?.status || '';
            break;
          case 'created_at':
            valueA = a?.created_at ? new Date(a.created_at).getTime() : 0;
            valueB = b?.created_at ? new Date(b.created_at).getTime() : 0;
            break;
          case 'last_login_at':
            valueA = a?.last_login_at ? new Date(a.last_login_at).getTime() : 0;
            valueB = b?.last_login_at ? new Date(b.last_login_at).getTime() : 0;
            break;
          case 'email_verified':
            valueA = a?.email_verified_at ? 1 : 0;
            valueB = b?.email_verified_at ? 1 : 0;
            break;
          default:
            const defaultNameA = `${a?.first_name || ''} ${a?.last_name || ''}`.trim();
            const defaultNameB = `${b?.first_name || ''} ${b?.last_name || ''}`.trim();
            valueA = defaultNameA || a?.email || '';
            valueB = defaultNameB || b?.email || '';
        }
        
        if (typeof valueA === 'string') {
          valueA = valueA.toLowerCase();
          valueB = valueB.toLowerCase();
        }
        
        if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return filtered;
  }, [allUsers, search, roleFilter, statusFilter, emailVerifiedFilter, lastLoginRange, departmentFilter, sortBy, sortOrder]);

  // Calculate filtered stats
  const filteredStats = useMemo(() => {
    if (!filteredUsers || filteredUsers.length === 0) {
      return safeStats;
    }
    
    const active = filteredUsers.filter(u => u?.status === 'active').length;
    const inactive = filteredUsers.filter(u => u?.status === 'inactive').length;
    const suspended = filteredUsers.filter(u => u?.status === 'suspended').length;
    const pending = filteredUsers.filter(u => u?.status === 'pending').length;
    const emailVerified = filteredUsers.filter(u => u?.email_verified_at !== null).length;
    const neverLoggedIn = filteredUsers.filter(u => !u?.last_login_at).length;
    
    const by_role: Record<string, number> = {};
    filteredUsers.forEach(u => {
      if (u?.role_id) {
        by_role[u.role_id] = (by_role[u.role_id] || 0) + 1;
      }
    });
    
    const by_status = { active, inactive, suspended, pending };
    
  return {
    total: filteredUsers.length,
    active,
    inactive,
    new_this_month: (safeStats as any).new_this_month || 0,
    by_role,
    by_status,
    email_verified: emailVerified,
    never_logged_in: neverLoggedIn
  };
  
  }, [filteredUsers, safeStats]);

  // Pagination
  const totalItems = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = Math.min(startIndex + perPage, totalItems);
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Update pagination data structure to match what UsersContent expects
  const paginatedUsersData = {
    ...safeUsers,
    data: paginatedUsers,
    current_page: currentPage,
    last_page: totalPages,
    total: totalItems,
    per_page: perPage,
    from: startIndex + 1,
    to: endIndex
  };

  // Selection handlers
  const handleSelectAllOnPage = useCallback(() => {
    const pageIds = paginatedUsers.map(user => user.id);
    if (isSelectAll) {
      setSelectedUsers(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      const newSelected = [...new Set([...selectedUsers, ...pageIds])];
      setSelectedUsers(newSelected);
    }
    setIsSelectAll(!isSelectAll);
    setSelectionMode('page');
  }, [paginatedUsers, isSelectAll, selectedUsers]);

  const handleSelectAllFiltered = useCallback(() => {
    const allIds = filteredUsers.map(user => user.id);
    if (selectedUsers.length === allIds.length && allIds.every(id => selectedUsers.includes(id))) {
      setSelectedUsers(prev => prev.filter(id => !allIds.includes(id)));
    } else {
      const newSelected = [...new Set([...selectedUsers, ...allIds])];
      setSelectedUsers(newSelected);
      setSelectionMode('filtered');
    }
  }, [filteredUsers, selectedUsers]);

  const handleSelectAll = useCallback(() => {
    if (window.confirm(`This will select ALL ${totalItems} users. This action may take a moment.`)) {
      const allIds = filteredUsers.map(user => user.id);
      setSelectedUsers(allIds);
      setSelectionMode('all');
    }
  }, [filteredUsers, totalItems]);

  const handleItemSelect = useCallback((id: number) => {
    setSelectedUsers(prev => {
      if (prev.includes(id)) {
        return prev.filter(itemId => itemId !== id);
      } else {
        return [...prev, id];
      }
    });
  }, []);

  // Check if all items on current page are selected
  useEffect(() => {
    const allPageIds = paginatedUsers.map(user => user.id);
    const allSelected = allPageIds.length > 0 && allPageIds.every(id => selectedUsers.includes(id));
    setIsSelectAll(allSelected);
  }, [selectedUsers, paginatedUsers]);

  // Get selected users data
  const selectedUsersData = useMemo(() => {
    return filteredUsers.filter(user => selectedUsers.includes(user.id));
  }, [selectedUsers, filteredUsers]);

  // Handle sort change from table header
  const handleSortChange = useCallback((value: string) => {
    const [newSortBy, newSortOrder] = value.split('-');
    setSortBy(newSortBy);
    setSortOrder(newSortOrder as 'asc' | 'desc');
  }, []);

  // Get current sort value for dropdown
  const getCurrentSortValue = useCallback((): string => {
    return `${sortBy}-${sortOrder}`;
  }, [sortBy, sortOrder]);

  // Bulk operations
  const handleBulkOperation = useCallback(async (operation: BulkOperation) => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user');
      return;
    }

    setIsPerformingBulkAction(true);
    try {
      switch (operation) {
        case 'export':
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
          router.post('/admin/users/bulk-activate', 
            { users: selectedUsers, selection_mode: selectionMode },
            {
              preserveState: true,
              onSuccess: () => toast.success(`${selectedUsers.length} users activated`),
              onError: () => toast.error('Failed to activate users')
            }
          );
          break;
        case 'deactivate':
          router.post('/admin/users/bulk-deactivate', 
            { users: selectedUsers, selection_mode: selectionMode },
            {
              preserveState: true,
              onSuccess: () => toast.success(`${selectedUsers.length} users deactivated`),
              onError: () => toast.error('Failed to deactivate users')
            }
          );
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
  }, [selectedUsers, selectedUsersData, selectionMode]);

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

  const handleClearFilters = useCallback(() => {
    setSearch('');
    setRoleFilter('all');
    setStatusFilter('all');
    setEmailVerifiedFilter('');
    setLastLoginRange('');
    setDepartmentFilter('all');
    setSortBy('name');
    setSortOrder('asc');
    setCurrentPage(1);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedUsers([]);
    setIsSelectAll(false);
  }, []);

  const handleSort = useCallback((column: string) => {
    const newSortOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(column);
    setSortOrder(newSortOrder);
  }, [sortBy, sortOrder]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handlePerPageChange = useCallback((newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return !!(search || roleFilter !== 'all' || statusFilter !== 'all' || 
              emailVerifiedFilter || lastLoginRange || departmentFilter !== 'all');
  }, [search, roleFilter, statusFilter, emailVerifiedFilter, lastLoginRange, departmentFilter]);

  // Create wrapper for setViewMode
  const handleSetViewMode = useCallback((mode: ViewMode) => {
    setViewMode(mode);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    if (isMobile) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'a' && isBulkMode) {
        e.preventDefault();
        if (e.shiftKey) {
          handleSelectAllFiltered();
        } else {
          handleSelectAllOnPage();
        }
      }
      if (e.key === 'Escape') {
        if (isBulkMode) {
          if (selectedUsers.length > 0) {
            setSelectedUsers([]);
          } else {
            setIsBulkMode(false);
          }
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'B') {
        e.preventDefault();
        setIsBulkMode(!isBulkMode);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        // Focus search input
      }
      if (e.key === 'Delete' && isBulkMode && selectedUsers.length > 0) {
        e.preventDefault();
        setShowBulkDeleteDialog(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isBulkMode, selectedUsers, isMobile, handleSelectAllOnPage, handleSelectAllFiltered]);

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
        <div className="space-y-4 sm:space-y-6">
          {/* Header - Now matches Residents pattern exactly */}
          <UsersHeader
            isBulkMode={isBulkMode}
            setIsBulkMode={setIsBulkMode}
            isMobile={isMobile}
          />

          {/* Stats Cards */}
          <UsersStats stats={filteredStats} />

          {/* Filters */}
          <UsersFilters
            search={search}
            setSearch={setSearch}
            roleFilter={roleFilter}
            setRoleFilter={setRoleFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            emailVerifiedFilter={emailVerifiedFilter}
            setEmailVerifiedFilter={setEmailVerifiedFilter}
            lastLoginRange={lastLoginRange}
            setLastLoginRange={setLastLoginRange}
            departmentFilter={departmentFilter}
            setDepartmentFilter={setDepartmentFilter}
            showAdvancedFilters={showAdvancedFilters}
            setShowAdvancedFilters={setShowAdvancedFilters}
            hasActiveFilters={hasActiveFilters}
            handleClearFilters={handleClearFilters}
            roles={safeRoles}
            departments={safeDepartments}
            isBulkMode={isBulkMode}
            selectedUsers={selectedUsers}
            setSelectedUsers={setSelectedUsers}
            setIsSelectAll={setIsSelectAll}
            users={paginatedUsersData}
            selectionMode={selectionMode}
            setSelectionMode={setSelectionMode}
            perPage={perPage}
            onPerPageChange={handlePerPageChange}
            isLoading={isRefreshing}
          />

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 text-sm bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1">
                Active filters applied. 
                {search && ` Search: "${search}"`}
                {roleFilter !== 'all' && ` Role: ${safeRoles.find(r => r.id.toString() === roleFilter)?.name}`}
                {statusFilter !== 'all' && ` Status: ${statusFilter}`}
                {emailVerifiedFilter && ` Email: ${emailVerifiedFilter === 'verified' ? 'Verified' : 'Unverified'}`}
                {lastLoginRange && ` Last login: ${lastLoginRange.replace('_', ' ')}`}
                {departmentFilter !== 'all' && ` Department: ${safeDepartments.find(d => d.id.toString() === departmentFilter)?.name}`}
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
            users={paginatedUsersData}
            selectedUsers={selectedUsers}
            selectedUsersData={selectedUsersData}
            isBulkMode={isBulkMode}
            setIsBulkMode={setIsBulkMode}
            isSelectAll={isSelectAll}
            viewMode={viewMode}
            setViewMode={handleSetViewMode}
            isMobile={isMobile}
            hasActiveFilters={hasActiveFilters}
            handleClearFilters={handleClearFilters}
            handleSelectAllOnPage={handleSelectAllOnPage}
            handleItemSelect={handleItemSelect}
            handlePageChange={handlePageChange}
            setShowBulkDeleteDialog={setShowBulkDeleteDialog}
            setShowBulkStatusDialog={setShowBulkStatusDialog}
            setShowBulkRoleDialog={setShowBulkRoleDialog}
            roles={safeRoles}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            onClearSelection={handleClearSelection}
            onBulkOperation={handleBulkOperation}
            onCopySelectedData={handleCopySelectedData}
            isLoading={isRefreshing}
            canEdit={safeCan.edit_users}
            canDelete={safeCan.delete_users}
            sortByProp={sortBy}
            sortOrderProp={sortOrder}
            onSortChange={handleSortChange}
            getCurrentSortValue={getCurrentSortValue}
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
        roles={safeRoles}
        departments={safeDepartments}
        onBulkDeleteConfirm={() => {
          if (confirm(`Are you sure you want to delete ${selectedUsers.length} user(s)?`)) {
            router.delete('/admin/users/bulk', 
              { data: { users: selectedUsers, selection_mode: selectionMode } }
            );
            setShowBulkDeleteDialog(false);
            setSelectedUsers([]);
            setIsBulkMode(false);
          }
        }}
        onBulkStatusConfirm={(status) => {
          router.post('/admin/users/bulk-status', 
            { users: selectedUsers, status, selection_mode: selectionMode }
          );
          setShowBulkStatusDialog(false);
        }}
        onBulkRoleConfirm={(roleId) => {
          router.post('/admin/users/bulk-role', 
            { users: selectedUsers, role_id: roleId, selection_mode: selectionMode }
          );
          setShowBulkRoleDialog(false);
        }}
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