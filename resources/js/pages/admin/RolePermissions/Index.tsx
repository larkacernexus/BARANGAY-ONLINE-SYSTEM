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

// Helper functions for safe value extraction
const getSafeString = (value: any, defaultValue: string = ''): string => {
    if (value === null || value === undefined) return defaultValue;
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    return defaultValue;
};

// Helper to get granter name safely
const getGranterName = (permission: RolePermission): string => {
    if (permission?.granter?.name) {
        return permission.granter.name;
    }
    if (permission?.granted_by_name) {
        return permission.granted_by_name;
    }
    return 'System';
};

// Helper to get granted date safely
const getGrantedDate = (permission: RolePermission): string => {
    if (permission?.granted_at) {
        return formatDate(permission.granted_at);
    }
    if (permission?.created_at) {
        return formatDate(permission.created_at);
    }
    return 'N/A';
};

// Helper to get permission name safely
const getPermissionName = (permission: RolePermission): string => {
    return permission?.permission?.name || permission?.permission_name || 'Unknown';
};

// Helper to get permission display name safely
const getPermissionDisplayName = (permission: RolePermission): string => {
    return permission?.permission?.display_name || permission?.permission_name || 'Unknown';
};

// Helper to get permission module safely
const getPermissionModule = (permission: RolePermission): string => {
    return permission?.permission?.module || permission?.module || 'General';
};

// Helper to get role name safely
const getRoleName = (permission: RolePermission): string => {
    return permission?.role?.name || permission?.role_name || 'Unknown';
};

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

// ✅ Helper function to check date range
const checkDateRange = (grantedAt: string | null, range: string): boolean => {
    if (!grantedAt && range) return false;
    if (!grantedAt) return true;
    
    const date = new Date(grantedAt);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    switch (range) {
        case 'today': return diffDays === 0;
        case 'yesterday': return diffDays === 1;
        case 'this_week': return diffDays <= 7;
        case 'last_week': return diffDays > 7 && diffDays <= 14;
        case 'this_month': return diffDays <= 30;
        case 'last_month': return diffDays > 30 && diffDays <= 60;
        case 'this_quarter': return diffDays <= 90;
        case 'this_year': return diffDays <= 365;
        default: return true;
    }
};

// ✅ Helper function to check roles count range
const checkRolesCountRange = (permission: RolePermission, range: string): boolean => {
    const rolesCount = permission?.roles_count || permission?.permission?.roles_count || 0;
    
    switch (range) {
        case '0': return rolesCount === 0;
        case '1': return rolesCount === 1;
        case '2-5': return rolesCount >= 2 && rolesCount <= 5;
        case '6-10': return rolesCount >= 6 && rolesCount <= 10;
        case '10+': return rolesCount >= 10;
        default: return true;
    }
};

export default function RolePermissions() {
    const { props } = usePage<RolePermissionProps>();
    const { role_permissions, filters: initialFilters, roles, modules, granters } = props;
    
    // Safe data extraction
    const allPermissions = role_permissions?.data || [];
    const safeRoles = roles || [];
    const safeModules = modules || [];
    const safeGranters = granters || [];
    
    // ✅ Safe filters extraction with proper typing
    const safeFilters = (initialFilters || {}) as {
        search?: string;
        role?: string;
        module?: string;
        granter?: string;
        date_range?: string;
        roles_count_range?: string;
        sort_by?: string;
        sort_order?: string;
    };
    
    // ✅ Filter states - client-side only
    const [search, setSearch] = useState<string>(getSafeString(safeFilters.search));
    const [roleFilter, setRoleFilter] = useState<string>(getSafeString(safeFilters.role, 'all'));
    const [moduleFilter, setModuleFilter] = useState<string>(getSafeString(safeFilters.module, 'all'));
    const [granterFilter, setGranterFilter] = useState<string>(getSafeString(safeFilters.granter, 'all'));
    const [dateRangePreset, setDateRangePreset] = useState<string>(getSafeString(safeFilters.date_range, ''));
    const [rolesCountRange, setRolesCountRange] = useState<string>(getSafeString(safeFilters.roles_count_range, ''));
    
    // ✅ Separate sort states for table header
    const [sortBy, setSortBy] = useState<string>('granted_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;
    
    // Custom hooks
    const { windowWidth, isMobile } = useWindowResize();
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    
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

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, roleFilter, moduleFilter, granterFilter, dateRangePreset, rolesCountRange]);

    // Reset selection when exiting bulk mode
    useEffect(() => {
        if (!isBulkMode) {
            setSelectedPermissions([]);
            setIsSelectAll(false);
        }
    }, [isBulkMode]);

    // Filter permissions client-side
    const filteredPermissions = useMemo(() => {
        if (!allPermissions || allPermissions.length === 0) {
            return [];
        }
        
        let filtered = [...allPermissions];
        
        // Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(permission =>
                getPermissionName(permission).toLowerCase().includes(searchLower) ||
                getPermissionDisplayName(permission).toLowerCase().includes(searchLower) ||
                getRoleName(permission).toLowerCase().includes(searchLower) ||
                getGranterName(permission).toLowerCase().includes(searchLower)
            );
        }
        
        // Role filter
        if (roleFilter && roleFilter !== 'all') {
            filtered = filtered.filter(permission => permission?.role_id?.toString() === roleFilter);
        }
        
        // Module filter
        if (moduleFilter && moduleFilter !== 'all') {
            filtered = filtered.filter(permission => getPermissionModule(permission) === moduleFilter);
        }
        
        // Granter filter
        if (granterFilter && granterFilter !== 'all') {
            filtered = filtered.filter(permission => permission?.granter_id?.toString() === granterFilter);
        }
        
        // ✅ Date range filter
        if (dateRangePreset) {
            filtered = filtered.filter(permission => 
                checkDateRange(permission?.granted_at || permission?.created_at, dateRangePreset)
            );
        }
        
        // ✅ Roles count range filter
        if (rolesCountRange) {
            filtered = filtered.filter(permission => checkRolesCountRange(permission, rolesCountRange));
        }
        
        // ✅ Apply sorting (for table header)
        if (filtered.length > 0) {
            filtered.sort((a, b) => {
                let valueA: any;
                let valueB: any;
                
                switch (sortBy) {
                    case 'permission_name':
                        valueA = getPermissionName(a);
                        valueB = getPermissionName(b);
                        break;
                    case 'role_name':
                        valueA = getRoleName(a);
                        valueB = getRoleName(b);
                        break;
                    case 'module':
                        valueA = getPermissionModule(a);
                        valueB = getPermissionModule(b);
                        break;
                    case 'granter':
                        valueA = getGranterName(a);
                        valueB = getGranterName(b);
                        break;
                    case 'granted_at':
                        valueA = a?.granted_at ? new Date(a.granted_at).getTime() : (a?.created_at ? new Date(a.created_at).getTime() : 0);
                        valueB = b?.granted_at ? new Date(b.granted_at).getTime() : (b?.created_at ? new Date(b.created_at).getTime() : 0);
                        break;
                    default:
                        valueA = a?.granted_at ? new Date(a.granted_at).getTime() : (a?.created_at ? new Date(a.created_at).getTime() : 0);
                        valueB = b?.granted_at ? new Date(b.granted_at).getTime() : (b?.created_at ? new Date(b.created_at).getTime() : 0);
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
    }, [allPermissions, search, roleFilter, moduleFilter, granterFilter, dateRangePreset, rolesCountRange, sortBy, sortOrder]);

    // Pagination
    const totalItems = filteredPermissions.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedPermissions = filteredPermissions.slice(startIndex, endIndex);

    // Selection handlers
    const handleSelectAllOnPage = useCallback(() => {
        const pageIds = paginatedPermissions.map(permission => permission.id);
        if (isSelectAll) {
            setSelectedPermissions(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedPermissions, ...pageIds])];
            setSelectedPermissions(newSelected);
        }
        setIsSelectAll(!isSelectAll);
        setSelectionMode('page');
    }, [paginatedPermissions, isSelectAll, selectedPermissions]);

    const handleSelectAllFiltered = useCallback(() => {
        const allIds = filteredPermissions.map(permission => permission.id);
        if (selectedPermissions.length === allIds.length && allIds.every(id => selectedPermissions.includes(id))) {
            setSelectedPermissions(prev => prev.filter(id => !allIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedPermissions, ...allIds])];
            setSelectedPermissions(newSelected);
            setSelectionMode('filtered');
        }
    }, [filteredPermissions, selectedPermissions]);

    const handleSelectAll = useCallback(() => {
        if (confirm(`This will select ALL ${totalItems} permissions. This action may take a moment.`)) {
            const allIds = filteredPermissions.map(permission => permission.id);
            setSelectedPermissions(allIds);
            setSelectionMode('all');
        }
    }, [filteredPermissions, totalItems]);

    const handleItemSelect = useCallback((id: number) => {
        setSelectedPermissions(prev => {
            if (prev.includes(id)) {
                return prev.filter(itemId => itemId !== id);
            } else {
                return [...prev, id];
            }
        });
    }, []);

    // Check if all items on current page are selected
    useEffect(() => {
        const allPageIds = paginatedPermissions.map(permission => permission.id);
        const allSelected = allPageIds.length > 0 && allPageIds.every(id => selectedPermissions.includes(id));
        setIsSelectAll(allSelected);
    }, [selectedPermissions, paginatedPermissions]);

    // Get selected permissions data
    const selectedPermissionsData = useMemo(() => {
        return filteredPermissions.filter(permission => selectedPermissions.includes(permission.id));
    }, [selectedPermissions, filteredPermissions]);

    // Calculate selection stats
    const selectionStats = useMemo(() => {
        return getSelectionStats(selectedPermissionsData);
    }, [selectedPermissionsData]);

    // ✅ Handle sort from table header
    const handleSort = useCallback((column: string) => {
        const newSortOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortBy(column);
        setSortOrder(newSortOrder);
    }, [sortBy, sortOrder]);

    // Handle sort change from dropdown
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
                    setShowBulkRevokeDialog(true);
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

    const confirmBulkRevoke = useCallback(async () => {
        setIsPerformingBulkAction(true);
        
        try {
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
        } catch (error) {
            console.error('Bulk revoke error:', error);
            toast.error('An error occurred during the operation.');
        } finally {
            setIsPerformingBulkAction(false);
        }
    }, [selectedPermissions]);

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

    const handleClearFilters = useCallback(() => {
        setSearch('');
        setRoleFilter('all');
        setModuleFilter('all');
        setGranterFilter('all');
        setDateRangePreset('');
        setRolesCountRange('');
        setSortBy('granted_at');
        setSortOrder('desc');
        setCurrentPage(1);
    }, []);

    const handleClearSelection = useCallback(() => {
        setSelectedPermissions([]);
        setIsSelectAll(false);
    }, []);

    const updateFilter = useCallback((key: keyof FilterState, value: string) => {
        switch (key) {
            case 'role':
                setRoleFilter(value);
                break;
            case 'module':
                setModuleFilter(value);
                break;
            case 'granter':
                setGranterFilter(value);
                break;
            case 'date_range':
                setDateRangePreset(value);
                break;
            case 'roles_count_range':
                setRolesCountRange(value);
                break;
        }
    }, []);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleExport = useCallback(() => {
        handleBulkOperation('export');
    }, [handleBulkOperation]);

const hasActiveFilters = useMemo(() => 
    !!(search || 
        roleFilter !== 'all' || 
        moduleFilter !== 'all' ||
        granterFilter !== 'all' ||
        dateRangePreset ||
        rolesCountRange),
    [search, roleFilter, moduleFilter, granterFilter, dateRangePreset, rolesCountRange]
);

    // Create normalized data structure for compatibility
    const normalizedData = {
        data: paginatedPermissions,
        meta: {
            total: totalItems,
            last_page: totalPages,
            current_page: currentPage,
            per_page: itemsPerPage,
            from: startIndex + 1,
            to: endIndex
        }
    };

    // ✅ Create filters object for the Filters component (removed sort fields)
    const filtersStateForComponent: FilterState = {
        role: roleFilter,
        module: moduleFilter,
        granter: granterFilter,
        date_range: dateRangePreset,
        roles_count_range: rolesCountRange,
        search: search,
        sort: sortBy,
        order: sortOrder
    };

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
                    if (selectedPermissions.length > 0) {
                        setSelectedPermissions([]);
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
                if (searchInputRef.current) {
                    searchInputRef.current.focus();
                }
            }
            if (e.key === 'Delete' && isBulkMode && selectedPermissions.length > 0) {
                e.preventDefault();
                setShowBulkRevokeDialog(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isBulkMode, selectedPermissions, isMobile]);

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
                        permissions={filteredPermissions}
                        totalItems={totalItems}
                    />

                    <RolePermissionsFilters
                        search={search}
                        setSearch={setSearch}
                        filtersState={filtersStateForComponent}
                        updateFilter={updateFilter}
                        showAdvancedFilters={showAdvancedFilters}
                        setShowAdvancedFilters={setShowAdvancedFilters}
                        handleClearFilters={handleClearFilters}
                        hasActiveFilters={hasActiveFilters}
                        roles={safeRoles}
                        modules={safeModules}
                        granters={safeGranters}
                        isMobile={isMobile}
                        totalItems={totalItems}
                        startIndex={startIndex + 1}
                        endIndex={endIndex}
                        searchInputRef={searchInputRef}
                        handleExport={handleExport}
                        isLoading={isPerformingBulkAction}
                        dateRangePreset={dateRangePreset}
                        setDateRangePreset={setDateRangePreset}
                        rolesCountRange={rolesCountRange}
                        setRolesCountRange={setRolesCountRange}
                    />

                    <RolePermissionsContent
                        permissions={paginatedPermissions}
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isSelectAll={isSelectAll}
                        selectedPermissions={selectedPermissions}
                        // viewMode={viewMode}
                        // setViewMode={setViewMode}
                        isMobile={isMobile}
                        hasActiveFilters={hasActiveFilters}
                        currentPage={currentPage}
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
                        filtersState={filtersStateForComponent}
                        isPerformingBulkAction={isPerformingBulkAction}
                        selectionMode={selectionMode}
                        selectionStats={selectionStats}
                        windowWidth={windowWidth}
                        expandedPermission={null}
                        togglePermissionExpansion={() => {}}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        // onSort={handleSort}
                        onSortChange={handleSortChange}
                        getCurrentSortValue={getCurrentSortValue}
                    />
                </div>
            </TooltipProvider>

            <RolePermissionsDialogs
                showBulkRevokeDialog={showBulkRevokeDialog}
                setShowBulkRevokeDialog={setShowBulkRevokeDialog}
                showRevokeDialog={showRevokeDialog}
                setShowRevokeDialog={setShowRevokeDialog}
                isPerformingBulkAction={isPerformingBulkAction}
                selectedPermissions={selectedPermissions}
                handleBulkOperation={confirmBulkRevoke}
                confirmRevoke={confirmRevoke}
                selectionStats={selectionStats}
            />
        </AdminLayout>
    );
}