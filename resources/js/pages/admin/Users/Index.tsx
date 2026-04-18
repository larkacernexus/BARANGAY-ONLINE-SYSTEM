import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { usePage, router } from '@inertiajs/react';
import { toast } from 'sonner';
import AppLayout from '@/layouts/admin-app-layout';
import { TooltipProvider } from '@/components/ui/tooltip';
import UsersHeader from '@/components/admin/users/UsersHeader';
import UsersStats from '@/components/admin/users/UsersStats';
import UsersFilters from '@/components/admin/users/UsersFilters';
import UsersContent from '@/components/admin/users/UsersContent';
import UsersDialogs from '@/components/admin/users/UsersDialogs';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2, KeyRound } from 'lucide-react';
import type { 
  UsersPageProps, 
  BulkOperation,
  SelectionMode,
  ViewMode
} from '@/types/admin/users/user-types';

// Debounce utility
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

interface PageProps extends UsersPageProps {}

export default function Users() {
  const { users: initialUsers, stats, roles, filters: initialFilters, can } = usePage<PageProps>().props;
  
  // Safe data extraction
  const safeUsers = initialUsers || { data: [], current_page: 1, last_page: 1, total: 0, per_page: 15, from: 0, to: 0 };
  const safeStats = stats || { total: 0, active: 0, inactive: 0, new_this_month: 0 };
  const safeRoles = roles || [];
  
  // Filter states - server-side
  const [search, setSearch] = useState<string>(initialFilters.search || '');
  const [roleFilter, setRoleFilter] = useState<string>(initialFilters.role_id || 'all');
  const [statusFilter, setStatusFilter] = useState<string>(initialFilters.status || 'all');
  const [accountTypeFilter, setAccountTypeFilter] = useState<string>(initialFilters.account_type || 'all');
  const [twoFactorFilter, setTwoFactorFilter] = useState<string>(initialFilters.two_factor || 'all');
  const [emailVerifiedFilter, setEmailVerifiedFilter] = useState<string>(initialFilters.email_verified || 'all');
  const [lastLoginFilter, setLastLoginFilter] = useState<string>(initialFilters.last_login || 'all');
  const [dateFrom, setDateFrom] = useState<string>(initialFilters.date_from || '');
  const [dateTo, setDateTo] = useState<string>(initialFilters.date_to || '');
  
  // Sorting states
  const [sortBy, setSortBy] = useState<string>(initialFilters.sort_by || 'created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
    (initialFilters.sort_order as 'asc' | 'desc') || 'desc'
  );
  
  // UI states
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  const [perPage, setPerPage] = useState<number>(initialFilters.per_page || 20);
  
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
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Debounce search to prevent too many requests
  const debouncedSearch = useDebounce(search, 300);
  const debouncedDateFrom = useDebounce(dateFrom, 500);
  const debouncedDateTo = useDebounce(dateTo, 500);
  
  // Safe can object
  const safeCan = {
    create_users: can?.create_users ?? false,
    edit_users: can?.edit_users ?? false,
    delete_users: can?.delete_users ?? false,
    bulk_actions: can?.bulk_actions ?? false,
    export_users: can?.export_users ?? false,
  };

  // Handle window resize
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      setIsMobile(width < 768);
      if (width < 768 && viewMode === 'table') {
        setViewMode('grid');
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);

  // Server-side filtering - reload data when filters change
  useEffect(() => {
    const currentFilters = getCurrentFilters();
    const hasFilterChanges = JSON.stringify(initialFilters) !== JSON.stringify({
      ...currentFilters,
      per_page: perPage
    });
    
    if (hasFilterChanges) {
      reloadData();
    }
  }, [
    debouncedSearch, roleFilter, statusFilter, accountTypeFilter,
    twoFactorFilter, emailVerifiedFilter, lastLoginFilter,
    debouncedDateFrom, debouncedDateTo, sortBy, sortOrder, perPage
  ]);

  const getCurrentFilters = () => ({
    search: debouncedSearch,
    role_id: roleFilter,
    status: statusFilter,
    account_type: accountTypeFilter,
    two_factor: twoFactorFilter,
    email_verified: emailVerifiedFilter,
    last_login: lastLoginFilter,
    date_from: debouncedDateFrom,
    date_to: debouncedDateTo,
    sort_by: sortBy,
    sort_order: sortOrder,
  });

  const reloadData = (page = 1) => {
    setIsLoading(true);
    
    const filters = {
      ...getCurrentFilters(),
      page,
      per_page: perPage
    };
    
    router.get('/admin/users', filters, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        setIsLoading(false);
        setSelectedUsers([]);
        setIsSelectAll(false);
      },
      onError: () => {
        setIsLoading(false);
        toast.error('Failed to load users');
      }
    });
  };

  // Reset selection when exiting bulk mode
  useEffect(() => {
    if (!isBulkMode) {
      setSelectedUsers([]);
      setIsSelectAll(false);
    }
  }, [isBulkMode]);

  // Get current page data
  const currentUsers = safeUsers.data || [];
  const paginationData = {
    current_page: safeUsers.current_page || 1,
    last_page: safeUsers.last_page || 1,
    total: safeUsers.total || 0,
    from: safeUsers.from || 0,
    to: safeUsers.to || 0,
    per_page: safeUsers.per_page || perPage,
  };

  // Selection handlers
  const handleSelectAllOnPage = () => {
    const pageIds = currentUsers.map(user => user.id);
    if (isSelectAll) {
      setSelectedUsers(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      setSelectedUsers(prev => [...new Set([...prev, ...pageIds])]);
    }
    setIsSelectAll(!isSelectAll);
    setSelectionMode('page');
  };

  const handleItemSelect = (id: number) => {
    setSelectedUsers(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  // Check if all items on current page are selected
  useEffect(() => {
    const allPageIds = currentUsers.map(user => user.id);
    const allSelected = allPageIds.length > 0 
      && allPageIds.every(id => selectedUsers.includes(id));
    setIsSelectAll(allSelected);
  }, [selectedUsers, currentUsers]);

  // Get selected users data
  const selectedUsersData = currentUsers.filter(user => 
    selectedUsers.includes(user.id)
  );

  // Handle page change
  const handlePageChange = (page: number) => {
    reloadData(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle per page change
  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split('-');
    setSortBy(newSortBy);
    setSortOrder(newSortOrder as 'asc' | 'desc');
  };

  const getCurrentSortValue = (): string => {
    return `${sortBy}-${sortOrder}`;
  };

  // Bulk operations
  const handleBulkOperation = async (operation: BulkOperation) => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user');
      return;
    }

    setIsPerformingBulkAction(true);
    
    try {
      switch (operation) {
        case 'export':
          const exportData = selectedUsersData.map(user => ({
            'Name': user.resident_name || user.username,
            'Email': user.email,
            'Role': user.role?.name || 'N/A',
            'Status': user.status,
            '2FA': user.two_factor_enabled ? 'Yes' : 'No',
            'Last Login': user.last_login_at 
              ? new Date(user.last_login_at).toLocaleDateString() 
              : 'Never',
          }));
          
          const csv = [
            Object.keys(exportData[0]).join(','),
            ...exportData.map(row => Object.values(row).map(v => `"${v}"`).join(','))
          ].join('\n');
          
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
          a.click();
          window.URL.revokeObjectURL(url);
          
          toast.success(`Exported ${selectedUsers.length} users`);
          break;
          
        case 'activate':
        case 'deactivate':
          await router.post('/admin/users/bulk-actions', {
            action: operation,
            user_ids: selectedUsers,
          }, {
            preserveScroll: true,
            onSuccess: () => {
              setSelectedUsers([]);
              reloadData(paginationData.current_page);
              toast.success(`${selectedUsers.length} users ${operation}d`);
            },
            onError: () => toast.error(`Failed to ${operation} users`)
          });
          break;
          
        case 'delete':
          setShowBulkDeleteDialog(true);
          break;
          
        case 'role':
          setShowBulkRoleDialog(true);
          break;
      }
    } catch (error) {
      toast.error(`Failed to ${operation} users`);
    } finally {
      setIsPerformingBulkAction(false);
    }
  };

  const handleBulkDelete = async () => {
    setIsPerformingBulkAction(true);
    
    try {
      await router.post('/admin/users/bulk-actions', {
        action: 'delete',
        user_ids: selectedUsers,
      }, {
        preserveScroll: true,
        onSuccess: () => {
          setSelectedUsers([]);
          setShowBulkDeleteDialog(false);
          reloadData(paginationData.current_page);
          toast.success(`${selectedUsers.length} users deleted`);
        },
        onError: () => toast.error('Failed to delete users')
      });
    } finally {
      setIsPerformingBulkAction(false);
    }
  };

  const handleBulkRoleUpdate = async (roleId: number) => {
    setIsPerformingBulkAction(true);
    
    try {
      await router.post('/admin/users/bulk-actions', {
        action: 'update_role',
        user_ids: selectedUsers,
        role_id: roleId,
      }, {
        preserveScroll: true,
        onSuccess: () => {
          setSelectedUsers([]);
          setShowBulkRoleDialog(false);
          setBulkEditValue('');
          reloadData(paginationData.current_page);
          toast.success(`Role updated for ${selectedUsers.length} users`);
        },
        onError: () => toast.error('Failed to update roles')
      });
    } finally {
      setIsPerformingBulkAction(false);
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setRoleFilter('all');
    setStatusFilter('all');
    setAccountTypeFilter('all');
    setTwoFactorFilter('all');
    setEmailVerifiedFilter('all');
    setLastLoginFilter('all');
    setDateFrom('');
    setDateTo('');
    setSortBy('created_at');
    setSortOrder('desc');
  };

  const handleClearSelection = () => {
    setSelectedUsers([]);
    setIsSelectAll(false);
  };

  const hasActiveFilters = Boolean(
    search || roleFilter !== 'all' || statusFilter !== 'all' ||
    accountTypeFilter !== 'all' || twoFactorFilter !== 'all' ||
    emailVerifiedFilter !== 'all' || lastLoginFilter !== 'all' ||
    dateFrom || dateTo
  );

  // Keyboard shortcuts
  useEffect(() => {
    if (isMobile) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'a' && isBulkMode) {
        e.preventDefault();
        handleSelectAllOnPage();
      }
      if (e.key === 'Escape') {
        if (isBulkMode) {
          selectedUsers.length > 0 ? setSelectedUsers([]) : setIsBulkMode(false);
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'B') {
        e.preventDefault();
        setIsBulkMode(!isBulkMode);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Delete' && isBulkMode && selectedUsers.length > 0) {
        e.preventDefault();
        setShowBulkDeleteDialog(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isBulkMode, selectedUsers, isMobile]);

  return (
    <AppLayout
      title="Users"
      breadcrumbs={[
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Users', href: '/admin/users' }
      ]}
    >
      <TooltipProvider>
        <div className="space-y-4 sm:space-y-6">
          {/* Loading Indicator */}
          {isLoading && (
            <div className="fixed top-4 right-4 z-50 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading...</span>
            </div>
          )}
          
          <UsersHeader
            isBulkMode={isBulkMode}
            setIsBulkMode={setIsBulkMode}
            isMobile={isMobile}
          />

          <UsersStats stats={safeStats} />

          <UsersFilters
            search={search}
            setSearch={setSearch}
            roleFilter={roleFilter}
            setRoleFilter={setRoleFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            accountTypeFilter={accountTypeFilter}
            setAccountTypeFilter={setAccountTypeFilter}
            twoFactorFilter={twoFactorFilter}
            setTwoFactorFilter={setTwoFactorFilter}
            emailVerifiedFilter={emailVerifiedFilter}
            setEmailVerifiedFilter={setEmailVerifiedFilter}
            lastLoginFilter={lastLoginFilter}
            setLastLoginFilter={setLastLoginFilter}
            dateFrom={dateFrom}
            setDateFrom={setDateFrom}
            dateTo={dateTo}
            setDateTo={setDateTo}
            showAdvancedFilters={showAdvancedFilters}
            setShowAdvancedFilters={setShowAdvancedFilters}
            hasActiveFilters={hasActiveFilters}
            handleClearFilters={handleClearFilters}
            roles={safeRoles}
            departments={[]} // Add departments array if needed
            departmentFilter="all"
            setDepartmentFilter={() => {}}
            isBulkMode={isBulkMode}
            selectedUsers={selectedUsers}
            setSelectedUsers={setSelectedUsers}
            setIsSelectAll={setIsSelectAll}
            // FIX: Ensure users has the correct structure
            users={{
                data: currentUsers,  // This is the array of users
                current_page: paginationData.current_page,
                last_page: paginationData.last_page,
                total: paginationData.total,
                from: paginationData.from,
                to: paginationData.to,
                per_page: paginationData.per_page
            }}
            selectionMode={selectionMode}
            setSelectionMode={setSelectionMode}
            isLoading={isLoading}
            perPage={perPage}
            onPerPageChange={handlePerPageChange}
            lastLoginRange={lastLoginFilter}
            setLastLoginRange={setLastLoginFilter}
            searchInputRef={searchInputRef}
        />

          {hasActiveFilters && (
            <div className="flex items-center gap-2 text-sm bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1">
                Active filters applied. Showing {paginationData.total} results.
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-blue-700 dark:text-blue-400 hover:text-blue-800 h-7 px-2"
              >
                Clear all
              </Button>
            </div>
          )}

          <UsersContent
            users={{ ...safeUsers, data: currentUsers }}
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
            roles={safeRoles}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onClearSelection={handleClearSelection}
            onBulkOperation={handleBulkOperation}
            isLoading={isLoading}
            canEdit={safeCan.edit_users}
            canDelete={safeCan.delete_users}
            onSortChange={handleSortChange}
            getCurrentSortValue={getCurrentSortValue}
          />

          {isBulkMode && !isMobile && (
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Keyboard Shortcuts</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsBulkMode(false)}
                  className="h-7 text-xs"
                  disabled={isPerformingBulkAction}
                >
                  Exit Bulk Mode
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-xs text-gray-600">
                <div><kbd className="px-2 py-1 bg-gray-200 rounded">Ctrl+A</kbd> Select page</div>
                <div><kbd className="px-2 py-1 bg-gray-200 rounded">Delete</kbd> Delete selected</div>
                <div><kbd className="px-2 py-1 bg-gray-200 rounded">Esc</kbd> Exit/Clear</div>
                <div><kbd className="px-2 py-1 bg-gray-200 rounded">Ctrl+F</kbd> Focus search</div>
              </div>
            </div>
          )}
        </div>
      </TooltipProvider>

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
        onBulkDeleteConfirm={handleBulkDelete}
        onBulkRoleConfirm={handleBulkRoleUpdate}
      />
    </AppLayout>
  );
}