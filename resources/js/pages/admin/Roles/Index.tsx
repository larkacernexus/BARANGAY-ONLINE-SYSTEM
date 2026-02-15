// pages/Roles.tsx
import { router, usePage } from '@inertiajs/react';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import debounce from 'lodash/debounce';
import AdminLayout from '@/layouts/admin-app-layout';
import { RolesIndexProps, Role } from '@/types';
import { 
    filterRoles,
    getSelectionStats,
    formatForClipboard,
    truncateText,
    getTruncationLength,
    getRoleTypeBadgeVariant,
    formatDate,
    canDeleteRole,
    getQuickFilterActions,
    normalizeStats,
    FilterState,
    BulkOperation,
    SelectionMode,
    SelectionStats
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

export default function Roles() {
    const { props } = usePage<RolesIndexProps>();
    const { roles, filters: initialFilters, stats: propsStats } = props;
    
    // State management
    const [search, setSearch] = useState(initialFilters.search || '');
    const [filtersState, setFiltersState] = useState<FilterState>({
        search: initialFilters.search || '',
        type: initialFilters.type || 'all'
    });
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
    const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    
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

    const searchInputRef = useRef<HTMLInputElement>(null);

    // Normalize stats
    const stats = useMemo(() => {
        return normalizeStats(propsStats, roles.data);
    }, [propsStats, roles.data]);

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
            
            router.get('/roles', params, {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            });
        }, 500),
        [filtersState]
    );

    // Handle search change
    useEffect(() => {
        if (search !== initialFilters.search) {
            debouncedSearch(search);
        }
        return () => debouncedSearch.cancel();
    }, [search, debouncedSearch, initialFilters.search]);

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
            setSelectedRoles([]);
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
                    if (selectedRoles.length > 0) {
                        setSelectedRoles([]);
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
            if (e.key === 'Delete' && isBulkMode && selectedRoles.length > 0) {
                e.preventDefault();
                setShowBulkDeleteDialog(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isBulkMode, selectedRoles, isMobile]);

    // Filter roles
    const filteredRoles = useMemo(() => {
        return filterRoles(
            roles.data,
            filtersState.search,
            filtersState
        );
    }, [roles.data, filtersState]);

    // Get current page roles
    const currentPageRoles = useMemo(() => {
        return roles.data;
    }, [roles.data]);

    // Selection handlers
    const handleSelectAllOnPage = () => {
        const pageIds = currentPageRoles.map(role => role.id);
        if (isSelectAll) {
            setSelectedRoles(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedRoles, ...pageIds])];
            setSelectedRoles(newSelected);
        }
        setIsSelectAll(!isSelectAll);
        setSelectionMode('page');
    };

    const handleSelectAllFiltered = () => {
        const allIds = filteredRoles.map(role => role.id);
        if (selectedRoles.length === allIds.length && allIds.every(id => selectedRoles.includes(id))) {
            setSelectedRoles(prev => prev.filter(id => !allIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedRoles, ...allIds])];
            setSelectedRoles(newSelected);
            setSelectionMode('filtered');
        }
    };

    const handleSelectAll = () => {
        if (confirm(`This will select ALL ${roles.meta?.total || 0} roles. This action may take a moment.`)) {
            const pageIds = currentPageRoles.map(role => role.id);
            setSelectedRoles(pageIds);
            setSelectionMode('all');
        }
    };

    const handleItemSelect = (id: number) => {
        setSelectedRoles(prev => {
            if (prev.includes(id)) {
                return prev.filter(itemId => itemId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    // Check if all items on current page are selected
    useEffect(() => {
        const allPageIds = currentPageRoles.map(role => role.id);
        const allSelected = allPageIds.every(id => selectedRoles.includes(id));
        setIsSelectAll(allSelected);
    }, [selectedRoles, currentPageRoles]);

    // Get selected roles data
    const selectedRolesData = useMemo(() => {
        return filteredRoles.filter(role => selectedRoles.includes(role.id));
    }, [selectedRoles, filteredRoles]);

    // Calculate selection stats
    const selectionStats = useMemo(() => {
        return getSelectionStats(selectedRolesData);
    }, [selectedRolesData]);

    // Bulk operations
    const handleBulkOperation = async (operation: BulkOperation) => {
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
                    
                    await router.post('/roles/bulk-action', {
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
                            toast.error('Failed to delete roles');
                        }
                    });
                    break;

                case 'change_type':
                    await router.post('/roles/bulk-action', {
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
                            toast.error('Failed to update role types');
                        }
                    });
                    break;

                case 'export':
                case 'export_csv':
                    const exportData = formatForClipboard(selectedRolesData);
                    const blob = new Blob([exportData], { type: 'text/csv' });
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
                    
                    const permissionCsv = [
                        Object.keys(permissionData[0]).join(','),
                        ...permissionData.map(row => Object.values(row).join(','))
                    ].join('\n');
                    
                    const permissionBlob = new Blob([permissionCsv], { type: 'text/csv' });
                    const permissionUrl = window.URL.createObjectURL(permissionBlob);
                    const permissionA = document.createElement('a');
                    permissionA.href = permissionUrl;
                    permissionA.download = `roles-permissions-export-${new Date().toISOString().split('T')[0]}.csv`;
                    document.body.appendChild(permissionA);
                    permissionA.click();
                    document.body.removeChild(permissionA);
                    window.URL.revokeObjectURL(permissionUrl);
                    
                    toast.success(`Exported permissions for ${selectedRoles.length} role(s)`);
                    break;

                case 'duplicate':
                    await router.post('/roles/bulk-action', {
                        action: 'duplicate',
                        role_ids: selectedRoles,
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            toast.success(`${selectedRoles.length} role(s) duplicated successfully`);
                            setSelectedRoles([]);
                        },
                        onError: (errors) => {
                            toast.error('Failed to duplicate roles');
                        }
                    });
                    break;

                case 'archive':
                    await router.post('/roles/bulk-action', {
                        action: 'archive',
                        role_ids: selectedRoles,
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            toast.success(`${selectedRoles.length} role(s) archived`);
                            setSelectedRoles([]);
                        },
                        onError: (errors) => {
                            toast.error('Failed to archive roles');
                        }
                    });
                    break;

                case 'generate_report':
                    const idsParam = selectedRoles.join(',');
                    window.open(`/roles/generate-bulk-report?ids=${idsParam}`, '_blank');
                    toast.success(`Generating report for ${selectedRoles.length} role(s)`);
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
        if (selectedRolesData.length === 0) {
            toast.error('No data to copy');
            return;
        }
        
        const csv = formatForClipboard(selectedRolesData);
        
        navigator.clipboard.writeText(csv).then(() => {
            toast.success('Data copied to clipboard');
        }).catch(() => {
            toast.error('Failed to copy to clipboard');
        });
    };

    // Individual role operations
    const handleDelete = (role: Role) => {
        if (canDeleteRole(role)) {
            if (confirm(`Are you sure you want to delete role "${role.name}"?`)) {
                router.delete(`/roles/${role.id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        setSelectedRoles(selectedRoles.filter(id => id !== role.id));
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
    };

    const handleCopyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success(`${label} copied to clipboard`);
        }).catch(() => {
            toast.error('Failed to copy to clipboard');
        });
    };

    const handleClearFilters = () => {
        setSearch('');
        setFiltersState({
            search: '',
            type: 'all'
        });
        router.get('/roles');
    };

    const handleClearSelection = () => {
        setSelectedRoles([]);
        setIsSelectAll(false);
    };

    const updateFilter = (key: keyof FilterState, value: string) => {
        setFiltersState(prev => ({ ...prev, [key]: value }));
    };

    const toggleRoleExpansion = (roleId: number) => {
        setExpandedRole(expandedRole === roleId ? null : roleId);
    };

    const hasActiveFilters = 
        search || 
        filtersState.type !== 'all';

    // Pagination data
    const totalItems = roles.meta?.total || filteredRoles.length;
    const totalPages = roles.meta?.last_page || 1;
    const currentPageNum = roles.meta?.current_page || 1;
    const itemsPerPage = roles.meta?.per_page || 10;
    const startIndex = (currentPageNum - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPageNum * itemsPerPage, totalItems);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        router.get(`/roles?page=${page}`, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleExport = () => {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        if (filtersState.type !== 'all') queryParams.append('type', filtersState.type);
        window.location.href = `/roles/export?${queryParams.toString()}`;
    };

    return (
        <AdminLayout
            title="Roles Management"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Roles', href: '/roles' }
            ]}
        >
            <TooltipProvider>
                <div className="space-y-4 sm:space-y-6">
                    <RolesHeader 
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isMobile={isMobile}
                    />

                    <RolesStats stats={stats} />

                    <RolesFilters
                        search={search}
                        setSearch={setSearch}
                        filtersState={filtersState}
                        updateFilter={updateFilter}
                        showAdvancedFilters={showAdvancedFilters}
                        setShowAdvancedFilters={setShowAdvancedFilters}
                        handleClearFilters={handleClearFilters}
                        hasActiveFilters={hasActiveFilters}
                        isMobile={isMobile}
                        totalItems={totalItems}
                        startIndex={startIndex}
                        endIndex={endIndex}
                        searchInputRef={searchInputRef}
                        handleExport={handleExport}
                    />

                    <RolesContent
                        roles={roles.data}
                        stats={stats}
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isSelectAll={isSelectAll}
                        selectedRoles={selectedRoles}
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
                        onDelete={handleDelete}
                        onCopyToClipboard={handleCopyToClipboard}
                        onCopySelectedData={handleCopySelectedData}
                        onBulkOperation={handleBulkOperation}
                        setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                        setShowBulkTypeDialog={setShowBulkTypeDialog}
                        filtersState={filtersState}
                        isPerformingBulkAction={isPerformingBulkAction}
                        selectionMode={selectionMode}
                        selectionStats={selectionStats}
                        windowWidth={windowWidth}
                        toggleRoleExpansion={toggleRoleExpansion}
                        expandedRole={expandedRole}
                        bulkEditValue={bulkEditValue}
                        setBulkEditValue={setBulkEditValue}
                    />

                    {/* Keyboard Shortcuts Help */}
                    {isBulkMode && !isMobile && (
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border hidden sm:block">
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
                handleBulkOperation={handleBulkOperation}
                selectionStats={selectionStats}
                bulkEditValue={bulkEditValue}
                setBulkEditValue={setBulkEditValue}
            />
        </AdminLayout>
    );
}