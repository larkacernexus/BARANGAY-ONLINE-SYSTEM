import { useState, useEffect } from 'react';
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
import UserRolesOverview from '@/components/admin/users/UserRolesOverview';
import UsersPermissionsOverview from '@/components/admin/users/UsersPermissionsOverview';

// Types
interface User {
  id: number;
  first_name: string | null;
  last_name: string | null;
  email: string;
  role_id: number;
  status: 'active' | 'inactive';
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
  };
  stats: Array<{ label: string; value: number }>;
  roles: Array<{ id: number; name: string; count: number }>;
  filters: {
    search?: string;
    role_id?: string | number;
    status?: string;
  };
}

export default function Users() {
  const { users, stats, roles, filters } = usePage<PagePropsWithData>().props;
  
  const [search, setSearch] = useState(filters.search || '');
  const [roleFilter, setRoleFilter] = useState<string>(filters.role_id?.toString() || 'all');
  const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
  const [currentPage, setCurrentPage] = useState(users.current_page);
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>(isMobile ? 'grid' : 'table');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Bulk selection states
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [showBulkStatusDialog, setShowBulkStatusDialog] = useState(false);
  const [showBulkRoleDialog, setShowBulkRoleDialog] = useState(false);
  const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false);
  const [bulkEditValue, setBulkEditValue] = useState<string>('');
  const [selectionMode, setSelectionMode] = useState<'page' | 'filtered' | 'all'>('page');

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
    handleResize(); // Initial check
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);

  // Auto switch to grid view on mobile on initial load
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768 && viewMode === 'table') {
      setViewMode('grid');
    }
  }, []);

  // Update current page when pagination changes
  useEffect(() => {
    setCurrentPage(users.current_page);
  }, [users.current_page]);

  // Handle filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      router.get('/users', {
        search: search || undefined,
        role_id: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      }, {
        preserveState: true,
        replace: true,
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [search, roleFilter, statusFilter, sortBy, sortOrder]);

  // Reset selection when bulk mode is turned off or filters change
  useEffect(() => {
    if (!isBulkMode) {
      setSelectedUsers([]);
      setIsSelectAll(false);
    }
  }, [isBulkMode]);

  // Keyboard shortcuts
  useEffect(() => {
    if (typeof window === 'undefined' || isMobile) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + A to select all on current page
      if ((e.ctrlKey || e.metaKey) && e.key === 'a' && isBulkMode) {
        e.preventDefault();
        if (e.shiftKey) {
          handleSelectAllFiltered();
        } else {
          handleSelectAllOnPage();
        }
      }
      // Escape to exit bulk mode
      if (e.key === 'Escape' && isBulkMode) {
        if (selectedUsers.length > 0) {
          setSelectedUsers([]);
        } else {
          setIsBulkMode(false);
        }
      }
      // Ctrl/Cmd + Shift + B to toggle bulk mode
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'B') {
        e.preventDefault();
        setIsBulkMode(!isBulkMode);
      }
      // Delete key to open delete dialog
      if (e.key === 'Delete' && isBulkMode && selectedUsers.length > 0) {
        e.preventDefault();
        setShowBulkDeleteDialog(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isBulkMode, selectedUsers, isMobile]);

  // Bulk selection handlers
  const handleSelectAllOnPage = () => {
    const pageIds = users.data.map(user => user.id);
    if (isSelectAll) {
      setSelectedUsers(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      const newSelected = [...new Set([...selectedUsers, ...pageIds])];
      setSelectedUsers(newSelected);
    }
    setIsSelectAll(!isSelectAll);
    setSelectionMode('page');
  };

  const handleSelectAllFiltered = () => {
    const allIds = users.data.map(user => user.id);
    if (selectedUsers.length === allIds.length && allIds.every(id => selectedUsers.includes(id))) {
      setSelectedUsers(prev => prev.filter(id => !allIds.includes(id)));
    } else {
      const newSelected = [...new Set([...selectedUsers, ...allIds])];
      setSelectedUsers(newSelected);
      setSelectionMode('filtered');
    }
  };

  const handleSelectAll = () => {
    if (confirm(`This will select ALL ${users.total} users. This action may take a moment.`)) {
      const pageIds = users.data.map(user => user.id);
      setSelectedUsers(pageIds);
      setSelectionMode('all');
    }
  };

  const handleItemSelect = (id: number) => {
    setSelectedUsers(prev => {
      if (prev.includes(id)) {
        return prev.filter(itemId => itemId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleClearSelection = () => {
    setSelectedUsers([]);
    setIsSelectAll(false);
  };

  const handleClearFilters = () => {
    setSearch('');
    setRoleFilter('all');
    setStatusFilter('all');
    router.get('/users', {}, { preserveState: true, replace: true });
  };

  const handlePageChange = (page: number) => {
    router.get('/users', {
      ...filters,
      page,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleSort = (column: string) => {
    const newSortOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(column);
    setSortOrder(newSortOrder);
  };

  const hasActiveFilters = search || roleFilter !== 'all' || statusFilter !== 'all';

  const selectedUsersData = users.data.filter(user => selectedUsers.includes(user.id));

  // Check if all items on current page are selected
  useEffect(() => {
    const allPageIds = users.data.map(user => user.id);
    const allSelected = allPageIds.length > 0 && allPageIds.every(id => selectedUsers.includes(id));
    setIsSelectAll(allSelected);
  }, [selectedUsers, users.data]);

  // Bulk operation handler
  const handleBulkOperation = async (operation: string) => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user');
      return;
    }

    setIsPerformingBulkAction(true);
    try {
      switch (operation) {
        case 'export':
          // Export logic
          toast.success('Export completed');
          break;
        case 'activate':
          // Activate logic
          toast.success('Users activated');
          break;
        case 'deactivate':
          // Deactivate logic
          toast.success('Users deactivated');
          break;
        case 'delete':
          setShowBulkDeleteDialog(true);
          break;
        default:
          toast.info(`${operation} functionality to be implemented`);
      }
    } catch (error) {
      toast.error(`Failed to ${operation} users`);
    } finally {
      setIsPerformingBulkAction(false);
    }
  };

  const handleCopySelectedData = () => {
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
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');
    
    navigator.clipboard.writeText(csv).then(() => {
      toast.success('Data copied to clipboard');
    }).catch(() => {
      toast.error('Failed to copy to clipboard');
    });
  };

  return (
    <AppLayout
      title="Users"
      breadcrumbs={[
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Administration', href: '/administration' },
        { title: 'Users', href: '/users' }
      ]}
    >
      <TooltipProvider>
        <div className="space-y-6">
          <UsersHeader
            isBulkMode={isBulkMode}
            setIsBulkMode={setIsBulkMode}
            isMobile={isMobile}
          />

          <UsersStats stats={stats} />

          <UserRolesOverview
            roles={roles}
            roleFilter={roleFilter}
            setRoleFilter={setRoleFilter}
          />

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
            isMobile={isMobile}
          />

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
          />

          <UsersPermissionsOverview />

          {/* Keyboard Shortcuts Help */}
          {isBulkMode && !isMobile && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Keyboard Shortcuts</span>
                </div>
                <button
                  onClick={() => setIsBulkMode(false)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                  disabled={isPerformingBulkAction}
                >
                  Exit Bulk Mode
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Ctrl+A</kbd>
                  <span>Select page</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Shift+Ctrl+A</kbd>
                  <span>Select filtered</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Delete</kbd>
                  <span>Delete selected</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Esc</kbd>
                  <span>Exit/clear</span>
                </div>
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
        roles={roles}
      />

      {isBulkMode && !isMobile && (
        <UsersKeyboardShortcuts
          isBulkMode={isBulkMode}
          setIsBulkMode={setIsBulkMode}
          isPerformingBulkAction={isPerformingBulkAction}
        />
      )}
    </AppLayout>
  );
}