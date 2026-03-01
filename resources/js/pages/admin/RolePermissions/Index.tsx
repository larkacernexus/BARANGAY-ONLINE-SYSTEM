// pages/RolePermissions.tsx
import { router, usePage } from '@inertiajs/react';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import debounce from 'lodash/debounce';
import AdminLayout from '@/layouts/admin-app-layout';
import { RolePermissionProps } from '@/types/rolePermissions.types';
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
    safeNormalizeData,
    FilterState,
    BulkOperation,
    SelectionMode,
    SelectionStats
} from '@/admin-utils/rolePermissionsUtils';

// Import reusable components
import { TooltipProvider } from '@/components/ui/tooltip';
import RolePermissionsHeader from '@/components/admin/role-permissions/RolePermissionsHeader';
import RolePermissionsStats from '@/components/admin/role-permissions/RolePermissionsStats';
import RolePermissionsFilters from '@/components/admin/role-permissions/RolePermissionsFilters';
import RolePermissionsContent from '@/components/admin/role-permissions/RolePermissionsContent';
import RolePermissionsDialogs from '@/components/admin/role-permissions/RolePermissionsDialogs';

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
    const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
    const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    
    // Bulk selection states
    const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [isSelectAll, setIsSelectAll] = useState(false);
    const [selectionMode, setSelectionMode] = useState<SelectionMode>('page');
    
    // Dialog states
    const [showBulkRevokeDialog, setShowBulkRevokeDialog] = useState(false);
    const [showRevokeDialog, setShowRevokeDialog] = useState<any>(null);
    const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false);

    const searchInputRef = useRef<HTMLInputElement>(null);

    // Safe data normalization
    const normalizedData = useMemo(() => {
        return safeNormalizeData(role_permissions);
    }, [role_permissions]);

    // Debounced search
    const debouncedSearch = useCallback(
        debounce((value: string) => {
            const params = {
                ...filtersState,
                search: value
            };
            
            // Clean up empty values
            Object.keys(params).forEach(key => {
                const k = key as keyof typeof params;
                if (!params[k] || params[k] === 'all') {
                    delete params[k];
                }
            });
            
            router.get('/admin/role-permissions', params, {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            });
        }, 500),
        [filtersState]
    );

    // Handle search change
    useEffect(() => {
        if (search !== initialFilters?.search) {
            debouncedSearch(search);
        }
        return () => debouncedSearch.cancel();
    }, [search, debouncedSearch, initialFilters?.search]);

    // Handle window resize
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

    // Keyboard shortcuts
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
                searchInputRef.current?.focus();
            }
            // Delete key for bulk delete
            if (e.key === 'Delete' && isBulkMode && selectedPermissions.length > 0) {
                e.preventDefault();
                setShowBulkRevokeDialog(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isBulkMode, selectedPermissions, isMobile]);

    // Get current page permissions
    const currentPagePermissions = useMemo(() => {
        return normalizedData.data;
    }, [normalizedData.data]);

    // Selection handlers
    const handleSelectAllOnPage = () => {
        const pageIds = currentPagePermissions.map(permission => permission.id);
        if (isSelectAll) {
            setSelectedPermissions(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedPermissions, ...pageIds])];
            setSelectedPermissions(newSelected);
        }
        setIsSelectAll(!isSelectAll);
        setSelectionMode('page');
    };

    const handleSelectAllFiltered = () => {
        const allIds = normalizedData.data.map(permission => permission.id);
        if (selectedPermissions.length === allIds.length && allIds.every(id => selectedPermissions.includes(id))) {
            setSelectedPermissions(prev => prev.filter(id => !allIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedPermissions, ...allIds])];
            setSelectedPermissions(newSelected);
            setSelectionMode('filtered');
        }
    };

    const handleSelectAll = () => {
        if (confirm(`This will select ALL ${normalizedData.meta.total || 0} permissions. This action may take a moment.`)) {
            const pageIds = currentPagePermissions.map(permission => permission.id);
            setSelectedPermissions(pageIds);
            setSelectionMode('all');
        }
    };

    const handleItemSelect = (id: number) => {
        setSelectedPermissions(prev => {
            if (prev.includes(id)) {
                return prev.filter(itemId => itemId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    // Check if all items on current page are selected
    useEffect(() => {
        const allPageIds = currentPagePermissions.map(permission => permission.id);
        const allSelected = allPageIds.every(id => selectedPermissions.includes(id));
        setIsSelectAll(allSelected);
    }, [selectedPermissions, currentPagePermissions]);

    // Get selected permissions data
    const selectedPermissionsData = useMemo(() => {
        return normalizedData.data.filter(permission => selectedPermissions.includes(permission.id));
    }, [selectedPermissions, normalizedData.data]);

    // Calculate selection stats
    const selectionStats = useMemo(() => {
        return getSelectionStats(selectedPermissionsData);
    }, [selectedPermissionsData]);

    // Bulk operations
    const handleBulkOperation = async (operation: BulkOperation) => {
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
    };

    // Copy selected data to clipboard
    const handleCopySelectedData = () => {
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
    };

    // Individual permission operations
    const handleRevokePermission = (permission: any) => {
        setShowRevokeDialog(permission);
    };

    const confirmRevoke = () => {
        if (!showRevokeDialog) return;

        router.delete(`/admin/role-permissions/${showRevokeDialog.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Permission revoked successfully');
                setShowRevokeDialog(null);
                setSelectedPermissions(selectedPermissions.filter(id => id !== showRevokeDialog.id));
            },
            onError: () => {
                toast.error('Failed to revoke permission');
            },
        });
    };

    const handleCopyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success(`${label} copied to clipboard`);
        }).catch(() => {
            toast.error('Failed to copy to clipboard');
        });
    };

    const handleSort = (column: string) => {
        setFiltersState(prev => ({
            ...prev,
            sort: column,
            order: prev.sort === column && prev.order === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleClearFilters = () => {
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
    };

    const handleClearSelection = () => {
        setSelectedPermissions([]);
        setIsSelectAll(false);
    };

    const updateFilter = (key: keyof FilterState, value: string) => {
        setFiltersState(prev => ({ ...prev, [key]: value }));
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        router.get(`/admin/role-permissions?page=${page}`, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleExport = () => {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        if (filtersState.role !== 'all') queryParams.append('role', filtersState.role);
        if (filtersState.module !== 'all') queryParams.append('module', filtersState.module);
        if (filtersState.granter !== 'all') queryParams.append('granter', filtersState.granter);
        window.location.href = `/admin/role-permissions/export?${queryParams.toString()}`;
    };

    const hasActiveFilters = 
        search || 
        filtersState.role !== 'all' || 
        filtersState.module !== 'all' ||
        filtersState.granter !== 'all';

    // Pagination data
    const totalItems = normalizedData.meta.total;
    const totalPages = normalizedData.meta.last_page;
    const currentPageNum = normalizedData.meta.current_page;
    const itemsPerPage = normalizedData.meta.per_page;
    const startIndex = normalizedData.meta.from;
    const endIndex = normalizedData.meta.to;

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
                        windowWidth={windowWidth}
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
                handleBulkOperation={handleBulkOperation}
                confirmRevoke={confirmRevoke}
                selectionStats={selectionStats}
            />
        </AdminLayout>
    );
}