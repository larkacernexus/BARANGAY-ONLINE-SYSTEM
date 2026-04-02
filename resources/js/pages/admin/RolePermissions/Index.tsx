// pages/RolePermissions.tsx
import { router, usePage } from '@inertiajs/react';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import AdminLayout from '@/layouts/admin-app-layout';

// Import types from the types file
import { 
    RolePermissionProps,
    FilterState,
    BulkOperation,
    SelectionMode,
    SelectionStats,
    RolePermission
} from '@/types/admin/rolepermissions/rolePermissions.types';

// Import utilities from the utils file
import { 
    formatDate,
    formatTimeAgo,
    truncateText,
    getTruncationLength,
    getRoleTypeBadgeVariant,
    getModuleBadgeVariant,
    getSelectionStats,
    formatForExport,
    getSortIcon,
    safeNormalizeData
} from '@/admin-utils/rolePermissionsUtils';

// Import reusable components
import { TooltipProvider } from '@/components/ui/tooltip';
import RolePermissionsHeader from '@/components/admin/role-permissions/RolePermissionsHeader';
import RolePermissionsStats from '@/components/admin/role-permissions/RolePermissionsStats';
import RolePermissionsFilters from '@/components/admin/role-permissions/RolePermissionsFilters';
import RolePermissionsContent from '@/components/admin/role-permissions/RolePermissionsContent';
import RolePermissionsDialogs from '@/components/admin/role-permissions/RolePermissionsDialogs';

// Custom hooks for better organization
const useWindowResize = () => {
    const [windowWidth, setWindowWidth] = useState<number>(
        typeof window !== 'undefined' ? window.innerWidth : 1024
    );
    const [isMobile, setIsMobile] = useState<boolean>(
        typeof window !== 'undefined' ? window.innerWidth < 768 : false
    );

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleResize = () => {
            const width = window.innerWidth;
            setWindowWidth(width);
            setIsMobile(width < 768);
        };

        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return { windowWidth, isMobile };
};

const useKeyboardShortcuts = (
    isBulkMode: boolean,
    selectedPermissions: number[],
    setIsBulkMode: (value: boolean) => void,
    setSelectedPermissions: React.Dispatch<React.SetStateAction<number[]>>,
    setShowBulkRevokeDialog: (value: boolean) => void,
    searchInputRef: React.RefObject<HTMLInputElement | null>, // Allow null
    isMobile: boolean,
    handleSelectAllOnPage: () => void,
    handleSelectAllFiltered: () => void
) => {
    useEffect(() => {
        if (isMobile) return;
        
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl/Cmd + A to select all
            if ((e.ctrlKey || e.metaKey) && e.key === 'a' && isBulkMode) {
                e.preventDefault();
                if (e.shiftKey) {
                    handleSelectAllFiltered();
                } else {
                    handleSelectAllOnPage();
                }
            }
            // Escape key
            if (e.key === 'Escape') {
                if (isBulkMode) {
                    if (selectedPermissions.length > 0) {
                        setSelectedPermissions([]);
                    } else {
                        setIsBulkMode(false);
                    }
                }
            }
            // Ctrl/Cmd + Shift + B to toggle bulk mode
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'B') {
                e.preventDefault();
                setIsBulkMode(!isBulkMode);
            }
            // Ctrl/Cmd + F to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                if (searchInputRef.current) {
                    searchInputRef.current.focus();
                }
            }
            // Delete key for bulk delete
            if (e.key === 'Delete' && isBulkMode && selectedPermissions.length > 0) {
                e.preventDefault();
                setShowBulkRevokeDialog(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isBulkMode, selectedPermissions, isMobile, setIsBulkMode, setSelectedPermissions, 
        setShowBulkRevokeDialog, searchInputRef, handleSelectAllOnPage, handleSelectAllFiltered]);
};

const useSelectionHandlers = (
    currentPagePermissions: RolePermission[],
    normalizedData: { data: RolePermission[]; meta: any },
    selectedPermissions: number[],
    setSelectedPermissions: React.Dispatch<React.SetStateAction<number[]>>,
    setSelectionMode: React.Dispatch<React.SetStateAction<SelectionMode>>
) => {
    const handleSelectAllOnPage = useCallback(() => {
        const pageIds = currentPagePermissions.map((permission: RolePermission) => permission.id);
        setSelectedPermissions((prev: number[]) => {
            const allSelected = pageIds.every((id: number) => prev.includes(id));
            if (allSelected) {
                return prev.filter((id: number) => !pageIds.includes(id));
            } else {
                return [...new Set([...prev, ...pageIds])];
            }
        });
        setSelectionMode('page');
    }, [currentPagePermissions, setSelectedPermissions, setSelectionMode]);

    const handleSelectAllFiltered = useCallback(() => {
        const allIds = normalizedData.data.map((permission: RolePermission) => permission.id);
        setSelectedPermissions((prev: number[]) => {
            const allSelected = allIds.every((id: number) => prev.includes(id));
            if (allSelected) {
                return prev.filter((id: number) => !allIds.includes(id));
            } else {
                return [...new Set([...prev, ...allIds])];
            }
        });
        setSelectionMode('filtered');
    }, [normalizedData.data, setSelectedPermissions, setSelectionMode]);

    const handleSelectAll = useCallback(() => {
        if (confirm(`This will select ALL ${normalizedData.meta.total || 0} permissions. This action may take a moment.`)) {
            const pageIds = currentPagePermissions.map((permission: RolePermission) => permission.id);
            setSelectedPermissions(pageIds);
            setSelectionMode('all');
        }
    }, [currentPagePermissions, normalizedData.meta.total, setSelectedPermissions, setSelectionMode]);

    const handleItemSelect = useCallback((id: number) => {
        setSelectedPermissions((prev: number[]) => {
            if (prev.includes(id)) {
                return prev.filter((itemId: number) => itemId !== id);
            } else {
                return [...prev, id];
            }
        });
    }, [setSelectedPermissions]);

    return {
        handleSelectAllOnPage,
        handleSelectAllFiltered,
        handleSelectAll,
        handleItemSelect
    };
};

export default function RolePermissions() {
    const { props } = usePage<RolePermissionProps>();
    const { role_permissions, filters: initialFilters, roles, modules, granters } = props;
    
    // State management
    const [search, setSearch] = useState(initialFilters?.search || '');
    const [filtersState, setFiltersState] = useState<FilterState>({
        search: initialFilters?.search || '',
        role: initialFilters?.role || 'all',
        module: initialFilters?.module || 'all',
        granter: initialFilters?.granter || 'all',
        sort: initialFilters?.sort || 'granted_at',
        order: initialFilters?.order || 'desc'
    });
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    
    // Custom hooks
    const { windowWidth, isMobile } = useWindowResize();
    
    // Bulk selection states
    const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [isSelectAll, setIsSelectAll] = useState(false);
    const [selectionMode, setSelectionMode] = useState<SelectionMode>('page');
    
    // Dialog states
    const [showBulkRevokeDialog, setShowBulkRevokeDialog] = useState(false);
    const [showRevokeDialog, setShowRevokeDialog] = useState<RolePermission | null>(null);
    const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false);

    const searchInputRef = useRef<HTMLInputElement>(null);

    // Safe data normalization
    const normalizedData = useMemo(() => {
        return safeNormalizeData(role_permissions);
    }, [role_permissions]);

    // Get current page permissions
    const currentPagePermissions = useMemo(() => {
        return normalizedData.data;
    }, [normalizedData.data]);

    // Selection handlers
    const {
        handleSelectAllOnPage,
        handleSelectAllFiltered,
        handleSelectAll,
        handleItemSelect
    } = useSelectionHandlers(
        currentPagePermissions,
        normalizedData,
        selectedPermissions,
        setSelectedPermissions,
        setSelectionMode
    );

    // Keyboard shortcuts
    useKeyboardShortcuts(
        isBulkMode,
        selectedPermissions,
        setIsBulkMode,
        setSelectedPermissions,
        setShowBulkRevokeDialog,
        searchInputRef,
        isMobile,
        handleSelectAllOnPage,
        handleSelectAllFiltered
    );

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, filtersState]);

    // Reset selection when exiting bulk mode
    useEffect(() => {
        if (!isBulkMode) {
            setSelectedPermissions([]);
            setIsSelectAll(false);
        }
    }, [isBulkMode]);

    // Check if all items on current page are selected
    useEffect(() => {
        const allPageIds = currentPagePermissions.map((permission: RolePermission) => permission.id);
        const allSelected = allPageIds.length > 0 && allPageIds.every((id: number) => selectedPermissions.includes(id));
        setIsSelectAll(allSelected);
    }, [selectedPermissions, currentPagePermissions]);

    // Get selected permissions data
    const selectedPermissionsData = useMemo(() => {
        return normalizedData.data.filter((permission: RolePermission) => selectedPermissions.includes(permission.id));
    }, [selectedPermissions, normalizedData.data]);

    // Calculate selection stats
    const selectionStats = useMemo(() => {
        return getSelectionStats(selectedPermissionsData);
    }, [selectedPermissionsData]);

    // Bulk operations
    const handleBulkOperation = useCallback(async (operation: BulkOperation) => {
        if (selectedPermissions.length === 0) {
            toast.error('Please select at least one permission');
            return;
        }

        setIsPerformingBulkAction(true);

        try {
            switch (operation) {
                case 'export':
                    const exportData = formatForExport(selectedPermissionsData);
                    const blob = new Blob([exportData], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `role-permissions-export-${new Date().toISOString().split('T')[0]}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                    toast.success(`Exported ${selectedPermissions.length} permissions successfully`);
                    break;

                case 'bulk_revoke':
                    await router.post('/admin/role-permissions/bulk-revoke', {
                        permission_ids: selectedPermissions,
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            toast.success(`${selectedPermissions.length} permissions revoked successfully`);
                            setSelectedPermissions([]);
                            setShowBulkRevokeDialog(false);
                        },
                        onError: (errors) => {
                            console.error('Bulk revoke error:', errors);
                            toast.error('Failed to revoke permissions');
                        }
                    });
                    break;

                case 'generate_report':
                    const idsParam = selectedPermissions.join(',');
                    window.open(`/admin/role-permissions/generate-bulk-report?ids=${idsParam}`, '_blank');
                    toast.success(`Generating report for ${selectedPermissions.length} permission(s)`);
                    break;

                default:
                    toast.error('Operation not supported yet');
            }
        } catch (error) {
            console.error('Bulk operation error:', error);
            toast.error('An error occurred during the bulk operation.');
        } finally {
            setIsPerformingBulkAction(false);
        }
    }, [selectedPermissions, selectedPermissionsData]);

    // Copy selected data to clipboard
    const handleCopySelectedData = useCallback(() => {
        if (selectedPermissionsData.length === 0) {
            toast.error('No data to copy');
            return;
        }
        
        const csv = formatForExport(selectedPermissionsData);
        
        navigator.clipboard.writeText(csv).then(() => {
            toast.success('Data copied to clipboard');
        }).catch(() => {
            toast.error('Failed to copy to clipboard');
        });
    }, [selectedPermissionsData]);

    // Individual permission operations
    const handleRevokePermission = useCallback((permission: RolePermission) => {
        setShowRevokeDialog(permission);
    }, []);

    const confirmRevoke = useCallback(() => {
        if (!showRevokeDialog) return;

        router.delete(`/admin/role-permissions/${showRevokeDialog.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Permission revoked successfully');
                setShowRevokeDialog(null);
                setSelectedPermissions(prev => prev.filter(id => id !== showRevokeDialog.id));
            },
            onError: () => {
                toast.error('Failed to revoke permission');
            },
        });
    }, [showRevokeDialog]);

    const handleCopyToClipboard = useCallback((text: string, label: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success(`${label} copied to clipboard`);
        }).catch(() => {
            toast.error('Failed to copy to clipboard');
        });
    }, []);

    const handleSort = useCallback((column: string) => {
        setFiltersState(prev => ({
            ...prev,
            sort: column,
            order: prev.sort === column && prev.order === 'asc' ? 'desc' : 'asc'
        }));
    }, []);

    const handleClearFilters = useCallback(() => {
        setSearch('');
        setFiltersState({
            search: '',
            role: 'all',
            module: 'all',
            granter: 'all',
            sort: 'granted_at',
            order: 'desc'
        });
        router.get('/admin/role-permissions');
    }, []);

    const handleClearSelection = useCallback(() => {
        setSelectedPermissions([]);
        setIsSelectAll(false);
    }, []);

    const updateFilter = useCallback((key: keyof FilterState, value: string) => {
        setFiltersState(prev => ({ ...prev, [key]: value }));
    }, []);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
        router.get(`/admin/role-permissions?page=${page}`, {
            preserveState: true,
            preserveScroll: true,
        });
    }, []);

    const handleExport = useCallback(() => {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        if (filtersState.role !== 'all') queryParams.append('role', filtersState.role);
        if (filtersState.module !== 'all') queryParams.append('module', filtersState.module);
        if (filtersState.granter !== 'all') queryParams.append('granter', filtersState.granter);
        window.location.href = `/admin/role-permissions/export?${queryParams.toString()}`;
    }, [search, filtersState.role, filtersState.module, filtersState.granter]);

    const hasActiveFilters = useMemo(() => 
       !! search || 
        filtersState.role !== 'all' || 
        filtersState.module !== 'all' ||
        filtersState.granter !== 'all',
        [search, filtersState.role, filtersState.module, filtersState.granter]
    );

    // Pagination data
    const {
        total: totalItems,
        last_page: totalPages,
        current_page: currentPageNum,
        per_page: itemsPerPage,
        from: startIndex,
        to: endIndex
    } = normalizedData.meta;

    return (
        <AdminLayout
            title="Role Permissions Management"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Role Permissions', href: '/admin/role-permissions' }
            ]}
        >
            <TooltipProvider>
                <div className="space-y-4 sm:space-y-6">
                    <RolePermissionsHeader 
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isMobile={isMobile}
                    />

                    <RolePermissionsStats 
                        permissions={normalizedData.data}
                        totalItems={totalItems}
                    />

                    <RolePermissionsFilters
                        search={search}
                        setSearch={setSearch}
                        filtersState={filtersState}
                        updateFilter={updateFilter}
                        showAdvancedFilters={showAdvancedFilters}
                        setShowAdvancedFilters={setShowAdvancedFilters}
                        handleClearFilters={handleClearFilters}
                        hasActiveFilters={hasActiveFilters}
                        roles={roles || []}
                        modules={modules || []}
                        granters={granters || []}
                        isMobile={isMobile}
                        totalItems={totalItems}
                        startIndex={startIndex}
                        endIndex={endIndex}
                        searchInputRef={searchInputRef}
                        handleExport={handleExport}
                        handleSort={handleSort}
                    />

                    <RolePermissionsContent
                        permissions={normalizedData.data}
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isSelectAll={isSelectAll}
                        selectedPermissions={selectedPermissions}
                        isMobile={isMobile}
                        hasActiveFilters={hasActiveFilters}
                        currentPage={currentPageNum}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        onPageChange={handlePageChange}
                        onSelectAllOnPage={handleSelectAllOnPage}
                        onSelectAllFiltered={handleSelectAllFiltered}
                        onSelectAll={handleSelectAll}
                        onItemSelect={handleItemSelect}
                        onClearFilters={handleClearFilters}
                        onClearSelection={handleClearSelection}
                        onRevokePermission={handleRevokePermission}
                        onCopyToClipboard={handleCopyToClipboard}
                        onCopySelectedData={handleCopySelectedData}
                        onBulkOperation={handleBulkOperation}
                        setShowBulkRevokeDialog={setShowBulkRevokeDialog}
                        filtersState={filtersState}
                        isPerformingBulkAction={isPerformingBulkAction}
                        selectionMode={selectionMode}
                        selectionStats={selectionStats}
                        windowWidth={windowWidth} expandedPermission={null} togglePermissionExpansion={function (id: number): void {
                            throw new Error('Function not implemented.');
                        } }                    />
                </div>
            </TooltipProvider>

            <RolePermissionsDialogs
                showBulkRevokeDialog={showBulkRevokeDialog}
                setShowBulkRevokeDialog={setShowBulkRevokeDialog}
                showRevokeDialog={showRevokeDialog}
                setShowRevokeDialog={setShowRevokeDialog}
                isPerformingBulkAction={isPerformingBulkAction}
                selectedPermissions={selectedPermissions}
                handleBulkOperation={handleBulkOperation}
                confirmRevoke={confirmRevoke}
                selectionStats={selectionStats}
            />
        </AdminLayout>
    );
}