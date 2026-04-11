import { router, usePage } from '@inertiajs/react';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import AdminLayout from '@/layouts/admin-app-layout';

// Import types from the types file
import { 
    RolesIndexProps, 
    Role, 
    FilterState, 
    BulkOperation, 
    SelectionMode, 
    Permission
} from '@/types/admin/roles/roles';

// Import utilities from the utils file
import { 
    filterRoles,
    getSelectionStats,
    formatForClipboard,
    canDeleteRole,
    normalizeStats,
    validateBulkOperation,
} from '@/admin-utils/rolesUtils';

// Import reusable components
import { TooltipProvider } from '@/components/ui/tooltip';
import RolesHeader from '@/components/admin/roles/RolesHeader';
import RolesStats from '@/components/admin/roles/RolesStats';
import RolesFilters from '@/components/admin/roles/RolesFilters';
import RolesContent from '@/components/admin/roles/RolesContent';
import RolesDialogs from '@/components/admin/roles/RolesDialogs';
import { Button } from '@/components/ui/button';
import { Key } from 'lucide-react';

// Helper functions for safe value extraction
const getSafeString = (value: any, defaultValue: string = ''): string => {
    if (value === null || value === undefined) return defaultValue;
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    return defaultValue;
};

export default function Roles() {
    const { props } = usePage<RolesIndexProps>();
    const { roles, filters: initialFilters, stats: propsStats } = props;
    
    // Safe data extraction
    const rolesData = roles?.data || [];
    const safeFilters = initialFilters || {};
    
    // Filter states - client-side only (removed sortBy/sortOrder from filters, kept for table sorting)
    const [search, setSearch] = useState<string>(getSafeString(safeFilters.search));
    const [typeFilter, setTypeFilter] = useState<string>(getSafeString(safeFilters.type, 'all'));
    const [usersRange, setUsersRange] = useState<string>('');
    const [permissionsRange, setPermissionsRange] = useState<string>('');
    
    // Sorting is now handled by table header only
    const [sortBy, setSortBy] = useState<string>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
    const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [isLoading, setIsLoading] = useState(false);
    
    // Bulk selection states
    const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [isSelectAll, setIsSelectAll] = useState(false);
    const [selectionMode, setSelectionMode] = useState<SelectionMode>('page');
    
    // Dialog states
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
    const [showBulkTypeDialog, setShowBulkTypeDialog] = useState(false);
    const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false);
    const [bulkEditValue, setBulkEditValue] = useState<string>('');
    const [expandedRole, setExpandedRole] = useState<number | null>(null);

    const searchInputRef = useRef<HTMLInputElement | null>(null);

    // Normalize stats
    const stats = useMemo(() => {
        return normalizeStats(propsStats, rolesData);
    }, [propsStats, rolesData]);

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

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, typeFilter, usersRange, permissionsRange, sortBy, sortOrder]);

    // Reset selection when exiting bulk mode
    useEffect(() => {
        if (!isBulkMode) {
            setSelectedRoles([]);
            setIsSelectAll(false);
        }
    }, [isBulkMode]);

    // Helper function to check users range
    const checkUsersRange = (usersCount: number, range: string): boolean => {
        switch (range) {
            case '0': return usersCount === 0;
            case '1-5': return usersCount >= 1 && usersCount <= 5;
            case '6-10': return usersCount >= 6 && usersCount <= 10;
            case '11-20': return usersCount >= 11 && usersCount <= 20;
            case '20+': return usersCount >= 20;
            default: return true;
        }
    };

    // Helper function to check permissions range
    const checkPermissionsRange = (permissionsCount: number, range: string): boolean => {
        switch (range) {
            case '0': return permissionsCount === 0;
            case '1-5': return permissionsCount >= 1 && permissionsCount <= 5;
            case '6-10': return permissionsCount >= 6 && permissionsCount <= 10;
            case '11-20': return permissionsCount >= 11 && permissionsCount <= 20;
            case '20+': return permissionsCount >= 20;
            default: return true;
        }
    };

    // Filter and sort roles client-side
    const filteredRoles = useMemo(() => {
        if (!rolesData || rolesData.length === 0) {
            return [];
        }
        
        let filtered = [...rolesData];
        
        // Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(role =>
                role?.name?.toLowerCase().includes(searchLower) ||
                role?.description?.toLowerCase().includes(searchLower)
            );
        }
        
        // Type filter
        if (typeFilter && typeFilter !== 'all') {
            filtered = filtered.filter(role => role?.is_system_role === (typeFilter === 'system'));
        }
        
        // Users range filter
        if (usersRange) {
            filtered = filtered.filter(role => checkUsersRange(role?.users_count || 0, usersRange));
        }
        
        // Permissions range filter
        if (permissionsRange) {
            filtered = filtered.filter(role => checkPermissionsRange(role?.permissions_count || 0, permissionsRange));
        }
        
        // Apply sorting (for table header)
        if (filtered.length > 0) {
            filtered.sort((a, b) => {
                let valueA: any;
                let valueB: any;
                
                switch (sortBy) {
                    case 'name':
                        valueA = a?.name || '';
                        valueB = b?.name || '';
                        break;
                    case 'type':
                        valueA = a?.is_system_role ? 1 : 0;
                        valueB = b?.is_system_role ? 1 : 0;
                        break;
                    case 'users_count':
                        valueA = a?.users_count || 0;
                        valueB = b?.users_count || 0;
                        break;
                    case 'permissions_count':
                        valueA = a?.permissions_count || 0;
                        valueB = b?.permissions_count || 0;
                        break;
                    case 'created_at':
                        valueA = a?.created_at ? new Date(a.created_at).getTime() : 0;
                        valueB = b?.created_at ? new Date(b.created_at).getTime() : 0;
                        break;
                    default:
                        valueA = a?.name || '';
                        valueB = b?.name || '';
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
    }, [rolesData, search, typeFilter, usersRange, permissionsRange, sortBy, sortOrder]);

    // Calculate filtered stats - updated to match RoleStats interface
    const filteredStats = useMemo(() => {
        if (!filteredRoles || filteredRoles.length === 0) {
            return {
                total: 0,
                system_roles: 0,
                custom_roles: 0,
                active_roles: 0,
                total_users: 0,
                total_permissions: 0,
                roles_with_no_users: 0,
                roles_with_no_permissions: 0
            };
        }
        
        const total = filteredRoles.length;
        const system_roles = filteredRoles.filter(r => r?.is_system_role).length;
        const custom_roles = filteredRoles.filter(r => !r?.is_system_role).length;
        const active_roles = filteredRoles.filter(r => r?.is_active !== false).length;
        const total_users = filteredRoles.reduce((sum, r) => sum + (r?.users_count || 0), 0);
        const total_permissions = filteredRoles.reduce((sum, r) => sum + (r?.permissions_count || 0), 0);
        const roles_with_no_users = filteredRoles.filter(r => (r?.users_count || 0) === 0).length;
        const roles_with_no_permissions = filteredRoles.filter(r => (r?.permissions_count || 0) === 0).length;
        
        return {
            total,
            system_roles,
            custom_roles,
            active_roles,
            total_users,
            total_permissions,
            roles_with_no_users,
            roles_with_no_permissions
        };
    }, [filteredRoles]);

    // Pagination
    const totalItems = filteredRoles.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedRoles = filteredRoles.slice(startIndex, endIndex);

    // Selection handlers
    const handleSelectAllOnPage = useCallback(() => {
        const pageIds = paginatedRoles.map(role => role.id);
        if (isSelectAll) {
            setSelectedRoles(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedRoles, ...pageIds])];
            setSelectedRoles(newSelected);
        }
        setIsSelectAll(!isSelectAll);
        setSelectionMode('page');
    }, [paginatedRoles, isSelectAll, selectedRoles]);

    const handleSelectAllFiltered = useCallback(() => {
        if (!filteredRoles.length) {
            toast.error('No roles to select');
            return;
        }
        
        const allIds = filteredRoles.map(role => role.id);
        if (selectedRoles.length === allIds.length && allIds.every(id => selectedRoles.includes(id))) {
            setSelectedRoles(prev => prev.filter(id => !allIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedRoles, ...allIds])];
            setSelectedRoles(newSelected);
            setSelectionMode('filtered');
        }
    }, [filteredRoles, selectedRoles]);

    const handleSelectAll = useCallback(() => {
        if (confirm(`This will select ALL ${totalItems} roles. This action may take a moment.`)) {
            const allIds = filteredRoles.map(role => role.id);
            setSelectedRoles(allIds);
            setSelectionMode('all');
        }
    }, [filteredRoles, totalItems]);

    const handleItemSelect = useCallback((id: number) => {
        setSelectedRoles(prev => {
            if (prev.includes(id)) {
                return prev.filter(itemId => itemId !== id);
            } else {
                return [...prev, id];
            }
        });
    }, []);

    // Check if all items on current page are selected
    useEffect(() => {
        const allPageIds = paginatedRoles.map(role => role.id);
        const allSelected = allPageIds.length > 0 && allPageIds.every(id => selectedRoles.includes(id));
        setIsSelectAll(allSelected);
    }, [selectedRoles, paginatedRoles]);

    // Get selected roles data
    const selectedRolesData = useMemo(() => {
        return filteredRoles.filter(role => selectedRoles.includes(role.id));
    }, [selectedRoles, filteredRoles]);

    // Calculate selection stats
    const selectionStats = useMemo(() => {
        return getSelectionStats(selectedRolesData);
    }, [selectedRolesData]);

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

    // Confirm bulk delete (no parameter needed for this specific dialog)
    const confirmBulkDelete = useCallback(async () => {
        setIsPerformingBulkAction(true);
        
        try {
            const deletableRoles = selectedRolesData.filter(role => canDeleteRole(role));
            if (deletableRoles.length === 0) {
                toast.error('No deletable roles selected');
                return;
            }
            
            await router.post('/admin/roles/bulk-action', {
                action: 'delete',
                role_ids: deletableRoles.map(r => r.id),
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`${deletableRoles.length} role(s) deleted successfully`);
                    setSelectedRoles([]);
                    setShowBulkDeleteDialog(false);
                },
                onError: (errors) => {
                    console.error('Delete error:', errors);
                    toast.error('Failed to delete roles');
                }
            });
        } catch (error) {
            console.error('Bulk delete error:', error);
            toast.error('An error occurred during the operation.');
        } finally {
            setIsPerformingBulkAction(false);
        }
    }, [selectedRolesData]);

    // Confirm bulk type change (no parameter needed for this specific dialog)
    const confirmBulkTypeChange = useCallback(async () => {
        if (!bulkEditValue) {
            toast.error('Please select a role type');
            return;
        }
        
        setIsPerformingBulkAction(true);
        
        try {
            await router.post('/admin/roles/bulk-action', {
                action: 'change_type',
                role_ids: selectedRoles,
                is_system_role: bulkEditValue === 'system'
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`${selectedRoles.length} role(s) type updated`);
                    setShowBulkTypeDialog(false);
                    setBulkEditValue('');
                    setSelectedRoles([]);
                },
                onError: (errors) => {
                    console.error('Change type error:', errors);
                    toast.error('Failed to update role types');
                }
            });
        } catch (error) {
            console.error('Bulk type change error:', error);
            toast.error('An error occurred during the operation.');
        } finally {
            setIsPerformingBulkAction(false);
        }
    }, [selectedRoles, bulkEditValue]);

    // Create a wrapper for the dialog operations that matches the BulkOperation type
    const handleDialogBulkOperation = useCallback((operation: BulkOperation) => {
        if (operation === 'delete') {
            confirmBulkDelete();
        } else if (operation === 'change_type') {
            confirmBulkTypeChange();
        }
    }, [confirmBulkDelete, confirmBulkTypeChange]);

    // Bulk operations
    const handleBulkOperation = useCallback(async (operation: BulkOperation) => {
        if (selectedRoles.length === 0) {
            toast.error('Please select at least one role');
            return;
        }

        setIsPerformingBulkAction(true);

        try {
            switch (operation) {
                case 'delete':
                    const deletableRoles = selectedRolesData.filter(role => canDeleteRole(role));
                    if (deletableRoles.length === 0) {
                        toast.error('No deletable roles selected. System roles or roles with users cannot be deleted.');
                        break;
                    }
                    setShowBulkDeleteDialog(true);
                    break;

                case 'change_type':
                    setShowBulkTypeDialog(true);
                    break;

                case 'export':
                case 'export_csv':
                    const exportData = formatForClipboard(selectedRolesData);
                    if (!exportData) {
                        toast.error('Failed to generate export data');
                        break;
                    }
                    
                    const blob = new Blob([exportData], { type: 'text/csv;charset=utf-8;' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `roles-export-${new Date().toISOString().split('T')[0]}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                    toast.success(`Exported ${selectedRoles.length} roles successfully`);
                    break;

                case 'export_permissions':
                    const permissionData = selectedRolesData.map(role => ({
                        'Role': role.name,
                        'Permissions': role.permissions?.map(p => p.name).join('; ') || 'None',
                        'Total Permissions': role.permissions_count || 0,
                    }));
                    
                    if (permissionData.length === 0) {
                        toast.error('No permission data to export');
                        break;
                    }
                    
                    const headers = Object.keys(permissionData[0]);
                    const permissionCsv = [
                        headers.join(','),
                        ...permissionData.map(row => 
                            headers.map(header => {
                                const value = row[header as keyof typeof row];
                                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                                    return `"${value.replace(/"/g, '""')}"`;
                                }
                                return value;
                            }).join(',')
                        )
                    ].join('\n');
                    
                    const permissionBlob = new Blob([permissionCsv], { type: 'text/csv;charset=utf-8;' });
                    const permissionUrl = window.URL.createObjectURL(permissionBlob);
                    const permissionA = document.createElement('a');
                    permissionA.href = permissionUrl;
                    permissionA.download = `roles-permissions-export-${new Date().toISOString().split('T')[0]}.csv`;
                    permissionA.click();
                    window.URL.revokeObjectURL(permissionUrl);
                    toast.success(`Exported permissions for ${selectedRoles.length} role(s)`);
                    break;

                case 'duplicate':
                    await router.post('/admin/roles/bulk-action', {
                        action: 'duplicate',
                        role_ids: selectedRoles,
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            toast.success(`${selectedRoles.length} role(s) duplicated successfully`);
                            setSelectedRoles([]);
                        },
                        onError: (errors) => {
                            console.error('Duplicate error:', errors);
                            toast.error('Failed to duplicate roles');
                        }
                    });
                    break;

                case 'generate_report':
                    const idsParam = selectedRoles.join(',');
                    window.open(`/admin/roles/generate-bulk-report?ids=${idsParam}`, '_blank');
                    toast.success(`Generating report for ${selectedRoles.length} role(s)`);
                    break;

                case 'print':
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                        const printContent = `
                            <!DOCTYPE html>
                            <html>
                            <head><title>Roles Report</title>
                            <style>
                                body { font-family: Arial, sans-serif; margin: 20px; }
                                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                                th { background-color: #f4f4f4; }
                            </style>
                            </head>
                            <body>
                                <h1>Roles Report</h1>
                                <p>Generated on: ${new Date().toLocaleString()}</p>
                                <p>Total Roles: ${selectedRolesData.length}</p>
                                <table>
                                    <thead>
                                        <tr><th>Name</th><th>Type</th><th>Description</th><th>Users</th><th>Permissions</th></tr>
                                    </thead>
                                    <tbody>
                                        ${selectedRolesData.map(role => `
                                            <tr>
                                                <td>${role.name}</td>
                                                <td>${role.is_system_role ? 'System' : 'Custom'}</td>
                                                <td>${role.description || 'N/A'}</td>
                                                <td>${role.users_count || 0}</td>
                                                <td>${role.permissions_count || 0}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </body>
                            </html>
                        `;
                        printWindow.document.write(printContent);
                        printWindow.document.close();
                        printWindow.print();
                        toast.success(`Printing report for ${selectedRoles.length} role(s)`);
                    }
                    break;

                default:
                    toast.error(`Operation "${operation}" is not supported yet`);
            }
        } catch (error) {
            console.error('Bulk operation error:', error);
            toast.error('An error occurred during the bulk operation.');
        } finally {
            setIsPerformingBulkAction(false);
        }
    }, [selectedRoles, selectedRolesData]);

    // Copy selected data to clipboard
    const handleCopySelectedData = useCallback(() => {
        if (!selectedRolesData.length) {
            toast.error('No data to copy');
            return;
        }
        
        const csv = formatForClipboard(selectedRolesData);
        if (!csv) {
            toast.error('Failed to generate data for clipboard');
            return;
        }
        
        navigator.clipboard.writeText(csv).then(() => {
            toast.success('Data copied to clipboard');
        }).catch(() => {
            toast.error('Failed to copy to clipboard');
        });
    }, [selectedRolesData]);

    // Individual role operations
    const handleDelete = useCallback((role: Role) => {
        if (canDeleteRole(role)) {
            if (confirm(`Are you sure you want to delete role "${role.name}"?`)) {
                router.delete(`/admin/roles/${role.id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        setSelectedRoles(prev => prev.filter(id => id !== role.id));
                        toast.success('Role deleted successfully');
                    },
                    onError: () => {
                        toast.error('Failed to delete role');
                    }
                });
            }
        } else {
            if (role.is_system_role) {
                toast.error('System roles cannot be deleted.');
            } else if (role.users_count && role.users_count > 0) {
                toast.error('Cannot delete role that has users assigned. Please reassign users first.');
            }
        }
    }, []);

    const handleCopyToClipboard = useCallback((text: string, label: string) => {
        if (!text) {
            toast.error('No text to copy');
            return;
        }
        
        navigator.clipboard.writeText(text).then(() => {
            toast.success(`${label} copied to clipboard`);
        }).catch(() => {
            toast.error('Failed to copy to clipboard');
        });
    }, []);

    const handleClearFilters = useCallback(() => {
        setSearch('');
        setTypeFilter('all');
        setUsersRange('');
        setPermissionsRange('');
        setSortBy('name');
        setSortOrder('asc');
        setCurrentPage(1);
    }, []);

    const handleClearSelection = useCallback(() => {
        setSelectedRoles([]);
        setIsSelectAll(false);
    }, []);

    const updateFilter = useCallback((key: keyof FilterState, value: string) => {
        if (key === 'type') {
            setTypeFilter(value);
        } else if (key === 'search') {
            setSearch(value);
        }
    }, []);

    const toggleRoleExpansion = useCallback((roleId: number) => {
        setExpandedRole(prev => prev === roleId ? null : roleId);
    }, []);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleExport = useCallback(() => {
        handleBulkOperation('export');
    }, [handleBulkOperation]);

    const handleSort = useCallback((column: string) => {
        const newSortOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortBy(column);
        setSortOrder(newSortOrder);
    }, [sortBy, sortOrder]);

    const hasActiveFilters = Boolean(
        search || 
        typeFilter !== 'all' || 
        usersRange || 
        permissionsRange
    );

    // Create filters object for the Filters component
    const filtersStateForComponent: FilterState = {
        type: typeFilter,
        search: search
    };

    // Keyboard shortcuts
    useEffect(() => {
        if (isMobile) return;
        
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
                return;
            }
            
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
                    if (selectedRoles.length > 0) {
                        setSelectedRoles([]);
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
                searchInputRef.current?.focus();
            }
            if (e.key === 'Delete' && isBulkMode && selectedRoles.length > 0) {
                e.preventDefault();
                setShowBulkDeleteDialog(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isBulkMode, selectedRoles, isMobile]);

    return (
        <AdminLayout
            title="Roles Management"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Roles', href: '/admin/roles' }
            ]}
        >
            <TooltipProvider>
                <div className="space-y-4 sm:space-y-6">
                    <RolesHeader 
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isMobile={isMobile}
                    />

                    <RolesStats stats={filteredStats} />

                    <RolesFilters
                        search={search}
                        setSearch={setSearch}
                        filtersState={filtersStateForComponent}
                        updateFilter={updateFilter}
                        showAdvancedFilters={showAdvancedFilters}
                        setShowAdvancedFilters={setShowAdvancedFilters}
                        handleClearFilters={handleClearFilters}
                        hasActiveFilters={hasActiveFilters}
                        isMobile={isMobile}
                        totalItems={totalItems}
                        startIndex={startIndex + 1}
                        endIndex={endIndex}
                        searchInputRef={searchInputRef}
                        handleExport={handleExport}
                        isLoading={isLoading}
                        usersRange={usersRange}
                        setUsersRange={setUsersRange}
                        permissionsRange={permissionsRange}
                        setPermissionsRange={setPermissionsRange}
                    />

                    <RolesContent
                        roles={paginatedRoles}
                        stats={filteredStats}
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isSelectAll={isSelectAll}
                        selectedRoles={selectedRoles}
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
                        onDelete={handleDelete}
                        onCopyToClipboard={handleCopyToClipboard}
                        onCopySelectedData={handleCopySelectedData}
                        onBulkOperation={handleBulkOperation}
                        setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                        setShowBulkTypeDialog={setShowBulkTypeDialog}
                        filtersState={filtersStateForComponent}
                        isPerformingBulkAction={isPerformingBulkAction}
                        selectionMode={selectionMode}
                        selectionStats={selectionStats}
                        windowWidth={windowWidth}
                        toggleRoleExpansion={toggleRoleExpansion}
                        expandedRole={expandedRole}
                        bulkEditValue={bulkEditValue}
                        setBulkEditValue={setBulkEditValue}
                        isLoading={isLoading}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSortChange={handleSortChange}
                        getCurrentSortValue={getCurrentSortValue}
                        // onSort={handleSort}
                    />

                    {/* Keyboard Shortcuts Help */}
                    {isBulkMode && !isMobile && (
                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border hidden sm:block">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Key className="h-4 w-4 text-gray-500" />
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

            <RolesDialogs
                showBulkDeleteDialog={showBulkDeleteDialog}
                setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                showBulkTypeDialog={showBulkTypeDialog}
                setShowBulkTypeDialog={setShowBulkTypeDialog}
                isPerformingBulkAction={isPerformingBulkAction}
                selectedRoles={selectedRoles}
                handleBulkOperation={handleDialogBulkOperation}
                selectionStats={selectionStats}
                bulkEditValue={bulkEditValue}
                setBulkEditValue={setBulkEditValue}
            />
        </AdminLayout>
    );
}