import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import AppLayout from '@/layouts/admin-app-layout';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { KeyRound } from 'lucide-react';

// Import custom components
import PrivilegesHeader from '@/components/admin/privileges/PrivilegesHeader';
import PrivilegesStats from '@/components/admin/privileges/PrivilegesStats';
import PrivilegesFilters from '@/components/admin/privileges/PrivilegesFilters';
import PrivilegesContent from '@/components/admin/privileges/PrivilegesContent';
import PrivilegesDialogs from '@/components/admin/privileges/PrivilegesDialogs';

// Import types
import { 
    Privilege, 
    PrivilegeFilters, 
    PrivilegeStats, 
    PaginationData,
    SelectionStats,
    SelectionMode,
    BulkOperation,
    DiscountType
} from '@/types/admin/privileges/privilege.types';
import { privilegeUtils } from '@/types/admin/privileges/privilege.types';

interface PrivilegesPageProps {
    privileges: PaginationData;
    filters: PrivilegeFilters;
    discountTypes: DiscountType[];
    can: {
        create: boolean;
        edit: boolean;
        delete: boolean;
        assign: boolean;
    };
    stats?: PrivilegeStats;
}

const defaultStats: PrivilegeStats = {
    total: 0,
    active: 0,
    totalAssignments: 0,
    activeAssignments: 0
};

// Helper functions for safe value extraction
const getSafeString = (value: any, defaultValue: string = ''): string => {
    if (value === null || value === undefined) return defaultValue;
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    return defaultValue;
};

const getSafeSortOrder = (value: any): 'asc' | 'desc' => {
    if (value === 'asc') return 'asc';
    if (value === 'desc') return 'desc';
    return 'asc';
};

// Helper functions for range filtering
const checkAssignmentsRange = (count: number, range: string): boolean => {
    switch (range) {
        case '0': return count === 0;
        case '1-10': return count >= 1 && count <= 10;
        case '11-50': return count >= 11 && count <= 50;
        case '51-100': return count >= 51 && count <= 100;
        case '100+': return count >= 100;
        default: return true;
    }
};

const checkDiscountPercentageRange = (percentage: number, range: string): boolean => {
    switch (range) {
        case '0-10': return percentage >= 0 && percentage <= 10;
        case '11-25': return percentage >= 11 && percentage <= 25;
        case '26-50': return percentage >= 26 && percentage <= 50;
        case '51-75': return percentage >= 51 && percentage <= 75;
        case '75+': return percentage >= 75;
        default: return true;
    }
};

export default function PrivilegesIndex({ 
    privileges, 
    filters, 
    discountTypes,
    can,
    stats: globalStats = defaultStats
}: PrivilegesPageProps) {
    const { flash } = usePage().props as any;
    
    // Safe data extraction
    const safePrivileges = privileges || { data: [], current_page: 1, last_page: 1, total: 0, per_page: 15, from: 0, to: 0 };
    const allPrivileges = safePrivileges.data || [];
    const safeFilters = filters || {};
    
    // Filter states - client-side only
    const [search, setSearch] = useState<string>(getSafeString(safeFilters.search));
    const [statusFilter, setStatusFilter] = useState<string>(getSafeString(safeFilters.status, 'all'));
    const [discountTypeFilter, setDiscountTypeFilter] = useState<string>(getSafeString(safeFilters.discount_type, 'all'));
    const [assignmentsRange, setAssignmentsRange] = useState<string>('');
    const [discountPercentageRange, setDiscountPercentageRange] = useState<string>('');
    const [requiresVerificationFilter, setRequiresVerificationFilter] = useState<string>('all');
    const [requiresIdNumberFilter, setRequiresIdNumberFilter] = useState<string>('all');
    
    // Sorting is now handled by table header only
    const [sortBy, setSortBy] = useState<string>(getSafeString(safeFilters.sort_by, 'name'));
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(getSafeSortOrder(safeFilters.sort_order));
    
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(15);
    const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    
    // Bulk selection states
    const [selectedPrivileges, setSelectedPrivileges] = useState<number[]>([]);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [isSelectAll, setIsSelectAll] = useState(false);
    const [selectionMode, setSelectionMode] = useState<SelectionMode>('page');
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
    const [showBulkStatusDialog, setShowBulkStatusDialog] = useState(false);
    const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false);
    const [bulkEditValue, setBulkEditValue] = useState<string>('');

    const searchInputRef = useRef<HTMLInputElement>(null);

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

    // Auto switch to grid view on mobile
    useEffect(() => {
        if (typeof window !== 'undefined' && window.innerWidth < 768 && viewMode === 'table') {
            setViewMode('grid');
        }
    }, []);

    // Flash messages
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter, discountTypeFilter, assignmentsRange, discountPercentageRange, requiresVerificationFilter, requiresIdNumberFilter, sortBy, sortOrder]);

    // Reset selection when exiting bulk mode
    useEffect(() => {
        if (!isBulkMode) {
            setSelectedPrivileges([]);
            setIsSelectAll(false);
        }
    }, [isBulkMode]);

    // Filter privileges client-side
    const filteredPrivileges = useMemo(() => {
        if (!allPrivileges || allPrivileges.length === 0) {
            return [];
        }
        
        let filtered = [...allPrivileges];
        
        // Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(privilege =>
                privilege?.name?.toLowerCase().includes(searchLower) ||
                privilege?.code?.toLowerCase().includes(searchLower) ||
                privilege?.description?.toLowerCase().includes(searchLower)
            );
        }
        
        // Status filter
        if (statusFilter && statusFilter !== 'all') {
            filtered = filtered.filter(privilege => privilege?.is_active === (statusFilter === 'active'));
        }
        
        // Discount type filter
        if (discountTypeFilter && discountTypeFilter !== 'all') {
            filtered = filtered.filter(privilege => privilege?.discount_type_id?.toString() === discountTypeFilter);
        }
        
        // Assignments range filter
        if (assignmentsRange) {
            filtered = filtered.filter(privilege => 
                checkAssignmentsRange(privilege?.residents_count || 0, assignmentsRange)
            );
        }
        
        // Discount percentage range filter - uses discountType.percentage from relationship
        if (discountPercentageRange) {
            filtered = filtered.filter(privilege => 
                checkDiscountPercentageRange(privilege?.discountType?.percentage || 0, discountPercentageRange)
            );
        }
        
        // Requires verification filter - uses discountType.requires_verification from relationship
        if (requiresVerificationFilter && requiresVerificationFilter !== 'all') {
            filtered = filtered.filter(privilege => 
                privilege?.discountType?.requires_verification === (requiresVerificationFilter === 'yes')
            );
        }
        
        // Requires ID number filter - uses discountType.requires_id_number from relationship
        if (requiresIdNumberFilter && requiresIdNumberFilter !== 'all') {
            filtered = filtered.filter(privilege => 
                privilege?.discountType?.requires_id_number === (requiresIdNumberFilter === 'yes')
            );
        }
        
        // Apply sorting
        if (filtered.length > 0) {
            filtered.sort((a, b) => {
                let valueA: any;
                let valueB: any;
                
                switch (sortBy) {
                    case 'name':
                        valueA = a?.name || '';
                        valueB = b?.name || '';
                        break;
                    case 'code':
                        valueA = a?.code || '';
                        valueB = b?.code || '';
                        break;
                    case 'discount_type':
                        valueA = a?.discountType?.name || '';
                        valueB = b?.discountType?.name || '';
                        break;
                    case 'discount_percentage':
                        valueA = a?.discountType?.percentage || 0;
                        valueB = b?.discountType?.percentage || 0;
                        break;
                    case 'residents_count':
                        valueA = a?.residents_count || 0;
                        valueB = b?.residents_count || 0;
                        break;
                    case 'active_residents_count':
                        valueA = a?.active_residents_count || 0;
                        valueB = b?.active_residents_count || 0;
                        break;
                    case 'status':
                        valueA = a?.is_active ? 1 : 0;
                        valueB = b?.is_active ? 1 : 0;
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
    }, [allPrivileges, search, statusFilter, discountTypeFilter, assignmentsRange, discountPercentageRange, requiresVerificationFilter, requiresIdNumberFilter, sortBy, sortOrder]);

    // Calculate filtered stats
    const filteredStats = useMemo(() => {
        if (!filteredPrivileges || filteredPrivileges.length === 0) {
            return globalStats;
        }
        
        const totalAssignments = filteredPrivileges.reduce((sum, p) => sum + (p?.residents_count || 0), 0);
        const totalActiveAssignments = filteredPrivileges.reduce((sum, p) => sum + (p?.active_residents_count || 0), 0);
        const avgDiscount = filteredPrivileges.reduce((sum, p) => sum + (p?.discountType?.percentage || 0), 0) / filteredPrivileges.length;
        const unassignedCount = filteredPrivileges.filter(p => (p?.residents_count || 0) === 0).length;
        
        return {
            total: filteredPrivileges.length,
            active: filteredPrivileges.filter(p => p?.is_active).length,
            totalAssignments,
            activeAssignments: totalActiveAssignments,
            avgDiscount: Math.round(avgDiscount),
            unassignedCount
        };
    }, [filteredPrivileges, globalStats]);

    // Pagination
    const totalItems = filteredPrivileges.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedPrivileges = filteredPrivileges.slice(startIndex, endIndex);

    // Selection handlers
    const handleSelectAllOnPage = useCallback(() => {
        const pageIds = paginatedPrivileges.map(privilege => privilege.id);
        if (isSelectAll) {
            setSelectedPrivileges(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedPrivileges, ...pageIds])];
            setSelectedPrivileges(newSelected);
        }
        setIsSelectAll(!isSelectAll);
        setSelectionMode('page');
    }, [paginatedPrivileges, isSelectAll, selectedPrivileges]);

    const handleSelectAllFiltered = useCallback(() => {
        const allIds = filteredPrivileges.map(privilege => privilege.id);
        if (selectedPrivileges.length === allIds.length && allIds.every(id => selectedPrivileges.includes(id))) {
            setSelectedPrivileges(prev => prev.filter(id => !allIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedPrivileges, ...allIds])];
            setSelectedPrivileges(newSelected);
            setSelectionMode('filtered');
        }
    }, [filteredPrivileges, selectedPrivileges]);

    const handleSelectAll = useCallback(() => {
        if (confirm(`This will select ALL ${totalItems} privileges. This action may take a moment.`)) {
            const allIds = filteredPrivileges.map(privilege => privilege.id);
            setSelectedPrivileges(allIds);
            setSelectionMode('all');
        }
    }, [filteredPrivileges, totalItems]);

    const handleItemSelect = useCallback((id: number) => {
        setSelectedPrivileges(prev => {
            if (prev.includes(id)) {
                return prev.filter(itemId => itemId !== id);
            } else {
                return [...prev, id];
            }
        });
    }, []);

    // Check if all items on current page are selected
    useEffect(() => {
        const allPageIds = paginatedPrivileges.map(privilege => privilege.id);
        const allSelected = allPageIds.length > 0 && allPageIds.every(id => selectedPrivileges.includes(id));
        setIsSelectAll(allSelected);
    }, [selectedPrivileges, paginatedPrivileges]);

    // Get selected privileges data
    const selectedPrivilegesData = useMemo(() => {
        return filteredPrivileges.filter(privilege => selectedPrivileges.includes(privilege.id));
    }, [selectedPrivileges, filteredPrivileges]);

    // Calculate selection stats
    const selectionStats = useMemo((): SelectionStats => {
        return privilegeUtils.getSelectionStats(selectedPrivilegesData);
    }, [selectedPrivilegesData]);

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

    // Handle sort from column click
    const handleSort = useCallback((column: string) => {
        const newSortOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortBy(column);
        setSortOrder(newSortOrder);
    }, [sortBy, sortOrder]);

    // Bulk operations
    const handleBulkOperation = async (operation: BulkOperation) => {
        if (selectedPrivileges.length === 0) {
            toast.error('Please select at least one privilege');
            return;
        }

        setIsPerformingBulkAction(true);

        try {
            switch (operation) {
                case 'delete':
                    setShowBulkDeleteDialog(true);
                    break;

                case 'update_status':
                    setShowBulkStatusDialog(true);
                    break;

                case 'export':
                case 'export_csv':
                    const exportData = selectedPrivilegesData.map(privilege => ({
                        'Name': privilege.name,
                        'Code': privilege.code,
                        'Discount Type': privilege?.discountType?.name || 'N/A',
                        'Discount %': privilege?.discountType?.percentage || 0,
                        'Requires Verification': privilege?.discountType?.requires_verification ? 'Yes' : 'No',
                        'Requires ID': privilege?.discountType?.requires_id_number ? 'Yes' : 'No',
                        'Status': privilege.is_active ? 'Active' : 'Inactive',
                        'Active Assignments': privilege.active_residents_count || 0,
                        'Total Assignments': privilege.residents_count || 0,
                    }));
                    
                    const headers = Object.keys(exportData[0]);
                    const csv = [
                        headers.join(','),
                        ...exportData.map(row => 
                            headers.map(header => {
                                const value = row[header as keyof typeof row];
                                return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
                            }).join(',')
                        )
                    ].join('\n');
                    
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `privileges-export-${new Date().toISOString().split('T')[0]}.csv`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                    
                    toast.success(`${selectedPrivileges.length} privileges exported successfully`);
                    setSelectedPrivileges([]);
                    break;

                case 'print':
                    selectedPrivileges.forEach(id => {
                        window.open(`/admin/privileges/${id}/print`, '_blank');
                    });
                    toast.success(`${selectedPrivileges.length} privilege(s) opened for printing`);
                    setSelectedPrivileges([]);
                    break;

                case 'copy_data':
                    handleCopySelectedData();
                    break;

                default:
                    toast.info('Functionality to be implemented');
                    break;
            }
        } catch (error) {
            console.error('Bulk operation error:', error);
            toast.error('An error occurred during the bulk operation.');
        } finally {
            setIsPerformingBulkAction(false);
        }
    };

    const handleBulkStatusUpdate = async () => {
        if (!bulkEditValue) {
            toast.error('Please select a status');
            return;
        }
        
        setIsPerformingBulkAction(true);

        try {
            await router.post('/admin/privileges/bulk-action', {
                action: 'update_status',
                privilege_ids: selectedPrivileges,
                status: bulkEditValue === 'active' ? 1 : 0
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedPrivileges([]);
                    setBulkEditValue('');
                    setShowBulkStatusDialog(false);
                    toast.success(`${selectedPrivileges.length} privilege statuses updated successfully`);
                },
                onError: () => {
                    toast.error('Failed to update privilege status');
                }
            });
        } catch (error) {
            console.error('Bulk status update error:', error);
            toast.error('An error occurred during the operation.');
        } finally {
            setIsPerformingBulkAction(false);
        }
    };

    const handleBulkDelete = async () => {
        setIsPerformingBulkAction(true);

        try {
            await router.post('/admin/privileges/bulk-action', {
                action: 'delete',
                privilege_ids: selectedPrivileges,
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedPrivileges([]);
                    setShowBulkDeleteDialog(false);
                    toast.success(`${selectedPrivileges.length} privileges deleted successfully`);
                },
                onError: () => {
                    toast.error('Failed to delete privileges');
                }
            });
        } catch (error) {
            console.error('Bulk delete error:', error);
            toast.error('An error occurred during the operation.');
        } finally {
            setIsPerformingBulkAction(false);
        }
    };

    // Individual privilege operations
    const handleDelete = (privilege: Privilege) => {
        if (confirm(`Are you sure you want to delete privilege "${privilege.name || 'Untitled'}"?`)) {
            router.delete(`/admin/privileges/${privilege.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedPrivileges(selectedPrivileges.filter(id => id !== privilege.id));
                    toast.success('Privilege deleted successfully');
                },
                onError: () => {
                    toast.error('Failed to delete privilege');
                }
            });
        }
    };

    const handleToggleStatus = (privilege: Privilege) => {
        if (confirm(`Are you sure you want to ${privilege.is_active ? 'deactivate' : 'activate'} "${privilege.name}"?`)) {
            router.post(`/admin/privileges/${privilege.id}/toggle-status`, {}, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Privilege ${privilege.is_active ? 'deactivated' : 'activated'} successfully`);
                },
                onError: () => {
                    toast.error('Failed to toggle privilege status');
                }
            });
        }
    };

    const handleDuplicate = (privilege: Privilege) => {
        if (confirm(`Duplicate "${privilege.name}" privilege?`)) {
            router.post(`/admin/privileges/${privilege.id}/duplicate`, {}, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Privilege duplicated successfully');
                },
                onError: () => {
                    toast.error('Failed to duplicate privilege');
                }
            });
        }
    };

    const handleClearFilters = useCallback(() => {
        setSearch('');
        setStatusFilter('all');
        setDiscountTypeFilter('all');
        setAssignmentsRange('');
        setDiscountPercentageRange('');
        setRequiresVerificationFilter('all');
        setRequiresIdNumberFilter('all');
        setSortBy('name');
        setSortOrder('asc');
        setCurrentPage(1);
    }, []);

    const handleClearSelection = useCallback(() => {
        setSelectedPrivileges([]);
        setIsSelectAll(false);
    }, []);

    const handleCopySelectedData = useCallback(() => {
        if (selectedPrivilegesData.length === 0) {
            toast.error('No data to copy');
            return;
        }
        
        const data = selectedPrivilegesData.map(privilege => ({
            'Name': privilege.name,
            'Code': privilege.code,
            'Discount %': privilege?.discountType?.percentage || 0,
            'Type': privilege.discountType?.name || 'N/A',
            'Status': privilege.is_active ? 'Active' : 'Inactive',
            'Assignments': privilege.residents_count || 0,
            'Active': privilege.active_residents_count || 0,
        }));
        
        const csvData = [
            Object.keys(data[0]).join(','),
            ...data.map(row => Object.values(row).join(','))
        ].join('\n');
        
        navigator.clipboard.writeText(csvData).then(() => {
            toast.success(`${selectedPrivilegesData.length} records copied to clipboard`);
        }).catch(() => {
            toast.error('Failed to copy to clipboard');
        });
    }, [selectedPrivilegesData]);

    const updateFilter = useCallback((key: keyof PrivilegeFilters, value: string) => {
        switch (key) {
            case 'status':
                setStatusFilter(value);
                break;
            case 'discount_type':
                setDiscountTypeFilter(value);
                break;
        }
    }, []);

    const hasActiveFilters = Boolean(
        search || 
        (statusFilter && statusFilter !== 'all') ||
        (discountTypeFilter && discountTypeFilter !== 'all') ||
        assignmentsRange ||
        discountPercentageRange
    );

    // Create filters object for the Filters component
    const filtersStateForComponent = {
        status: statusFilter,
        discount_type: discountTypeFilter,
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
                    if (selectedPrivileges.length > 0) {
                        setSelectedPrivileges([]);
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
            if (e.key === 'Delete' && isBulkMode && selectedPrivileges.length > 0) {
                e.preventDefault();
                setShowBulkDeleteDialog(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isBulkMode, selectedPrivileges, isMobile]);

    return (
        <AppLayout
            title="Privilege Management"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Privileges', href: '/admin/privileges' }
            ]}
        >
            <TooltipProvider>
                <div className="space-y-4 sm:space-y-6">
                    <PrivilegesHeader 
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isMobile={isMobile}
                        canCreate={can?.create || false}
                    />

                    <PrivilegesStats 
                        globalStats={globalStats}
                        filteredStats={filteredStats}
                        isLoading={isPerformingBulkAction}
                    />

                    <PrivilegesFilters
                        search={search}
                        setSearch={setSearch}
                        onSearchChange={(value) => {
                            setSearch(value);
                        }}
                        filtersState={filtersStateForComponent}
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
                        isLoading={isPerformingBulkAction}
                        discountTypes={discountTypes}
                        assignmentsRange={assignmentsRange}
                        setAssignmentsRange={setAssignmentsRange}
                        discountPercentageRange={discountPercentageRange}
                        setDiscountPercentageRange={setDiscountPercentageRange}
                    />

                    <PrivilegesContent
                        privileges={paginatedPrivileges}
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isSelectAll={isSelectAll}
                        selectedPrivileges={selectedPrivileges}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        isMobile={isMobile}
                        hasActiveFilters={hasActiveFilters}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        onSelectAllOnPage={handleSelectAllOnPage}
                        onSelectAllFiltered={handleSelectAllFiltered}
                        onSelectAll={handleSelectAll}
                        onItemSelect={handleItemSelect}
                        onClearFilters={handleClearFilters}
                        onClearSelection={handleClearSelection}
                        onDelete={handleDelete}
                        onToggleStatus={handleToggleStatus}
                        onDuplicate={handleDuplicate}
                        onSort={handleSort}
                        onBulkOperation={handleBulkOperation}
                        onCopySelectedData={handleCopySelectedData}
                        setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                        setShowBulkStatusDialog={setShowBulkStatusDialog}
                        filtersState={filtersStateForComponent}
                        isPerformingBulkAction={isPerformingBulkAction}
                        selectionMode={selectionMode}
                        selectionStats={selectionStats}
                        discountTypes={discountTypes}
                        can={can}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSortChange={handleSortChange}
                        getCurrentSortValue={getCurrentSortValue}
                    />

                    {/* Keyboard Shortcuts Help */}
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
                                <div className="flex items-center gap-1">
                                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Ctrl+F</kbd>
                                    <span>Focus search</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </TooltipProvider>

            <PrivilegesDialogs
                showBulkDeleteDialog={showBulkDeleteDialog}
                setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                showBulkStatusDialog={showBulkStatusDialog}
                setShowBulkStatusDialog={setShowBulkStatusDialog}
                isPerformingBulkAction={isPerformingBulkAction}
                selectedPrivileges={selectedPrivileges}
                handleBulkOperation={handleBulkDelete}
                handleBulkStatusUpdate={handleBulkStatusUpdate}
                selectionStats={selectionStats}
                bulkEditValue={bulkEditValue}
                setBulkEditValue={setBulkEditValue}
            />
        </AppLayout>
    );
}