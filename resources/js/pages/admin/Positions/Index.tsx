import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import debounce from 'lodash/debounce';
import AppLayout from '@/layouts/admin-app-layout';
import { 
    Position, 
    PositionFilters, 
    PositionStats, 
    PaginationData,
    BulkOperation,
    SelectionMode 
} from '@/types/admin/positions/position.types';
import { positionUtils } from '@/admin-utils/position-utils';
import { TooltipProvider } from '@/components/ui/tooltip';

// Import AdminUI components
import PositionsHeader from '@/components/admin/positions/PositionsHeader';
import PositionsStats from '@/components/admin/positions/PositionsStats';
import PositionsFilters from '@/components/admin/positions/PositionsFilters';
import PositionsContent from '@/components/admin/positions/PositionsContent';
import PositionsDialogs from '@/components/admin/positions/PositionsDialogs';
import { Button } from '@/components/ui/button';
import { KeyRound } from 'lucide-react';

interface PositionsPageProps {
    positions: PaginationData;
    filters: PositionFilters;
    stats: PositionStats;
}

const defaultStats: PositionStats = {
    total: 0,
    active: 0,
    requires_account: 0,
    kagawad_count: 0,
    inactive: 0,
    assigned: 0,
    unassigned: 0
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

export default function PositionsIndex({ 
    positions, 
    filters, 
    stats = defaultStats
}: PositionsPageProps) {
    const { flash } = usePage().props as any;
    
    // Safe data extraction
    const safePositions = positions || { data: [], current_page: 1, last_page: 1, total: 0, per_page: 10, from: 0, to: 0 };
    const allPositions = safePositions.data || [];
    const safeFilters = filters || {};
    
    // Filter states - all client-side
    const [search, setSearch] = useState<string>(getSafeString(safeFilters.search));
    const [statusFilter, setStatusFilter] = useState<string>(getSafeString(safeFilters.status, 'all'));
    const [requiresAccountFilter, setRequiresAccountFilter] = useState<string>(getSafeString(safeFilters.requires_account, 'all'));
    const [officialsRange, setOfficialsRange] = useState<string>(getSafeString(safeFilters.officials_range, ''));
    
    // Sorting is now handled by table header, not in filters
    const [sortBy, setSortBy] = useState<string>(getSafeString(safeFilters.sort_by, 'order'));
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(getSafeSortOrder(safeFilters.sort_order));
    
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    
    // Bulk selection states
    const [selectedPositions, setSelectedPositions] = useState<number[]>([]);
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
    }, [search, statusFilter, requiresAccountFilter, officialsRange, sortBy, sortOrder]);

    // Reset selection when exiting bulk mode
    useEffect(() => {
        if (!isBulkMode) {
            setSelectedPositions([]);
            setIsSelectAll(false);
        }
    }, [isBulkMode]);

    // Filter positions client-side
    const filteredPositions = useMemo(() => {
        if (!allPositions || allPositions.length === 0) {
            return [];
        }
        
        let filtered = [...allPositions];
        
        // Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(position =>
                position?.name?.toLowerCase().includes(searchLower) ||
                position?.code?.toLowerCase().includes(searchLower) ||
                position?.description?.toLowerCase().includes(searchLower)
            );
        }
        
        // Status filter
        if (statusFilter && statusFilter !== 'all') {
            filtered = filtered.filter(position => position?.is_active === (statusFilter === 'active'));
        }
        
        // Requires account filter
        if (requiresAccountFilter && requiresAccountFilter !== 'all') {
            filtered = filtered.filter(position => position?.requires_account === (requiresAccountFilter === 'yes'));
        }
        
        // Officials count range filter
        if (officialsRange) {
            filtered = filtered.filter(position => {
                const count = position?.officials_count || 0;
                switch (officialsRange) {
                    case '0': return count === 0;
                    case '1': return count === 1;
                    case '2-3': return count >= 2 && count <= 3;
                    case '4-5': return count >= 4 && count <= 5;
                    case '6+': return count >= 6;
                    default: return true;
                }
            });
        }
        
        // Apply sorting (now handled client-side since positions are small data)
        if (filtered.length > 0) {
            filtered.sort((a, b) => {
                let valueA: any;
                let valueB: any;
                
                switch (sortBy) {
                    case 'order':
                        valueA = a?.order || 0;
                        valueB = b?.order || 0;
                        break;
                    case 'name':
                        valueA = a?.name || '';
                        valueB = b?.name || '';
                        break;
                    case 'code':
                        valueA = a?.code || '';
                        valueB = b?.code || '';
                        break;
                    case 'description':
                        valueA = a?.description || '';
                        valueB = b?.description || '';
                        break;
                    case 'committee':
                        valueA = a?.committee?.name || '';
                        valueB = b?.committee?.name || '';
                        break;
                    case 'officials_count':
                        valueA = a?.officials_count || 0;
                        valueB = b?.officials_count || 0;
                        break;
                    case 'status':
                        valueA = a?.is_active ? 1 : 0;
                        valueB = b?.is_active ? 1 : 0;
                        break;
                    case 'requires_account':
                        valueA = a?.requires_account ? 1 : 0;
                        valueB = b?.requires_account ? 1 : 0;
                        break;
                    case 'created_at':
                        valueA = a?.created_at ? new Date(a.created_at).getTime() : 0;
                        valueB = b?.created_at ? new Date(b.created_at).getTime() : 0;
                        break;
                    default:
                        valueA = a?.order || 0;
                        valueB = b?.order || 0;
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
    }, [allPositions, search, statusFilter, requiresAccountFilter, officialsRange, sortBy, sortOrder]);

    // Calculate filtered stats
    const filteredStats = useMemo(() => {
        if (!filteredPositions || filteredPositions.length === 0) {
            return stats;
        }
        
        return {
            total: filteredPositions.length,
            active: filteredPositions.filter(p => p?.is_active).length,
            requires_account: filteredPositions.filter(p => p?.requires_account).length,
            kagawad_count: filteredPositions.filter(p => p?.code?.startsWith('KAG')).length,
            inactive: filteredPositions.filter(p => !p?.is_active).length,
            assigned: filteredPositions.filter(p => (p?.officials_count ?? 0) > 0).length,
            unassigned: filteredPositions.filter(p => (p?.officials_count ?? 0) === 0).length
        };
    }, [filteredPositions, stats]);

    // Pagination
    const totalItems = filteredPositions.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedPositions = filteredPositions.slice(startIndex, endIndex);

    // Selection handlers
    const handleSelectAllOnPage = useCallback(() => {
        const pageIds = paginatedPositions.map(position => position.id);
        if (isSelectAll) {
            setSelectedPositions(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedPositions, ...pageIds])];
            setSelectedPositions(newSelected);
        }
        setIsSelectAll(!isSelectAll);
        setSelectionMode('page');
    }, [paginatedPositions, isSelectAll, selectedPositions]);

    const handleSelectAllFiltered = useCallback(() => {
        const allIds = filteredPositions.map(position => position.id);
        if (selectedPositions.length === allIds.length && allIds.every(id => selectedPositions.includes(id))) {
            setSelectedPositions(prev => prev.filter(id => !allIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedPositions, ...allIds])];
            setSelectedPositions(newSelected);
            setSelectionMode('filtered');
        }
    }, [filteredPositions, selectedPositions]);

    const handleSelectAll = useCallback(() => {
        if (confirm(`This will select ALL ${totalItems} positions. This action may take a moment.`)) {
            const allIds = filteredPositions.map(position => position.id);
            setSelectedPositions(allIds);
            setSelectionMode('all');
        }
    }, [filteredPositions, totalItems]);

    const handleItemSelect = useCallback((id: number) => {
        setSelectedPositions(prev => {
            if (prev.includes(id)) {
                return prev.filter(itemId => itemId !== id);
            } else {
                return [...prev, id];
            }
        });
    }, []);

    // Check if all items on current page are selected
    useEffect(() => {
        const allPageIds = paginatedPositions.map(position => position.id);
        const allSelected = allPageIds.length > 0 && allPageIds.every(id => selectedPositions.includes(id));
        setIsSelectAll(allSelected);
    }, [selectedPositions, paginatedPositions]);

    // Get selected positions data
    const selectedPositionsData = useMemo(() => {
        return filteredPositions.filter(position => selectedPositions.includes(position.id));
    }, [selectedPositions, filteredPositions]);

    // Calculate selection stats
    const selectionStats = useMemo(() => {
        return positionUtils.getSelectionStats(selectedPositionsData);
    }, [selectedPositionsData]);

    // Handle sort change from dropdown (for table header)
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
    const handleBulkOperation = async (operation: BulkOperation) => {
        if (selectedPositions.length === 0) {
            toast.error('Please select at least one position');
            return;
        }

        setIsPerformingBulkAction(true);

        try {
            switch (operation) {
                case 'delete':
                    setShowBulkDeleteDialog(true);
                    break;

                case 'activate':
                    await router.post('/admin/positions/bulk-action', {
                        action: 'activate',
                        position_ids: selectedPositions,
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            setSelectedPositions([]);
                            toast.success(`${selectedPositions.length} positions activated successfully`);
                            router.reload({ only: ['positions'] });
                        },
                        onError: () => {
                            toast.error('Failed to activate positions');
                        }
                    });
                    break;

                case 'deactivate':
                    await router.post('/admin/positions/bulk-action', {
                        action: 'deactivate',
                        position_ids: selectedPositions,
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            setSelectedPositions([]);
                            toast.success(`${selectedPositions.length} positions deactivated successfully`);
                            router.reload({ only: ['positions'] });
                        },
                        onError: () => {
                            toast.error('Failed to deactivate positions');
                        }
                    });
                    break;

                case 'toggle_account':
                    setShowBulkStatusDialog(true);
                    break;

                case 'export':
                case 'export_csv':
                    const exportData = selectedPositionsData.map(position => ({
                        'Name': position.name,
                        'Code': position.code,
                        'Description': position.description || '',
                        'Committee': position.committee?.name || '',
                        'Display Order': position.order,
                        'Officials Count': position.officials_count || 0,
                        'Requires Account': position.requires_account ? 'Yes' : 'No',
                        'Status': position.is_active ? 'Active' : 'Inactive',
                    }));
                    
                    if (exportData.length > 0) {
                        const headers = Object.keys(exportData[0]);
                        const csv = [
                            headers.join(','),
                            ...exportData.map(row => 
                                headers.map(header => {
                                    const value = row[header as keyof typeof row];
                                    return typeof value === 'string' && value.includes(',') 
                                        ? `"${value}"` 
                                        : value;
                                }).join(',')
                            )
                        ].join('\n');
                        
                        const blob = new Blob([csv], { type: 'text/csv' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `positions-export-${new Date().toISOString().split('T')[0]}.csv`;
                        a.click();
                        window.URL.revokeObjectURL(url);
                        
                        toast.success(`${selectedPositions.length} positions exported successfully`);
                        setSelectedPositions([]);
                    }
                    break;

                case 'print':
                    selectedPositions.forEach(id => {
                        window.open(`/admin/positions/${id}/print`, '_blank');
                    });
                    toast.success(`${selectedPositions.length} position(s) opened for printing`);
                    setSelectedPositions([]);
                    break;

                case 'generate_report':
                    const idsParam = selectedPositions.join(',');
                    window.open(`/admin/positions/report?ids=${idsParam}`, '_blank');
                    toast.success(`Generating report for ${selectedPositions.length} position(s)`);
                    setSelectedPositions([]);
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

    const handleBulkAccountToggle = async () => {
        if (!bulkEditValue) {
            toast.error('Please select an option');
            return;
        }

        setIsPerformingBulkAction(true);
        try {
            const requiresAccount = bulkEditValue === 'enable';
            await router.post('/admin/positions/bulk-action', {
                action: 'toggle_account',
                position_ids: selectedPositions,
                requires_account: requiresAccount
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedPositions([]);
                    setBulkEditValue('');
                    setShowBulkStatusDialog(false);
                    toast.success(`${selectedPositions.length} position account requirements updated successfully`);
                    router.reload({ only: ['positions'] });
                },
                onError: () => {
                    toast.error('Failed to update position account requirements');
                }
            });
        } catch (error) {
            console.error('Bulk account toggle error:', error);
            toast.error('An error occurred during the operation.');
        } finally {
            setIsPerformingBulkAction(false);
        }
    };

    const handleBulkDelete = async () => {
        setIsPerformingBulkAction(true);
        try {
            await router.post('/admin/positions/bulk-action', {
                action: 'delete',
                position_ids: selectedPositions,
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedPositions([]);
                    setShowBulkDeleteDialog(false);
                    toast.success(`${selectedPositions.length} positions deleted successfully`);
                    router.reload({ only: ['positions'] });
                },
                onError: () => {
                    toast.error('Failed to delete positions');
                }
            });
        } catch (error) {
            console.error('Bulk delete error:', error);
            toast.error('An error occurred during the operation.');
        } finally {
            setIsPerformingBulkAction(false);
        }
    };

    // Individual position operations
    const handleDelete = (position: Position) => {
        if (confirm(`Are you sure you want to delete position "${position.name || 'Untitled'}"?`)) {
            router.delete(`/admin/positions/${position.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedPositions(selectedPositions.filter(id => id !== position.id));
                    toast.success('Position deleted successfully');
                    router.reload({ only: ['positions'] });
                },
                onError: () => {
                    toast.error('Failed to delete position');
                }
            });
        }
    };

    const handleSort = useCallback((column: string) => {
        const newSortOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortBy(column);
        setSortOrder(newSortOrder);
    }, [sortBy, sortOrder]);

    const handleClearFilters = useCallback(() => {
        setSearch('');
        setStatusFilter('all');
        setRequiresAccountFilter('all');
        setOfficialsRange('');
        setSortBy('order');
        setSortOrder('asc');
        setCurrentPage(1);
    }, []);

    const handleClearSelection = useCallback(() => {
        setSelectedPositions([]);
        setIsSelectAll(false);
    }, []);

    const handleCopySelectedData = useCallback(() => {
        if (selectedPositionsData.length === 0) {
            toast.error('No data to copy');
            return;
        }
        
        const data = selectedPositionsData.map(position => ({
            'Code': position.code || 'N/A',
            'Name': position.name || 'N/A',
            'Committee': position.committee?.name || 'N/A',
            'Order': position.order,
            'Officials': position.officials_count || 0,
            'Account Required': position.requires_account ? 'Yes' : 'No',
            'Status': position.is_active ? 'Active' : 'Inactive',
        }));
        
        const csvData = [
            Object.keys(data[0]).join(','),
            ...data.map(row => Object.values(row).join(','))
        ].join('\n');
        
        navigator.clipboard.writeText(csvData).then(() => {
            toast.success(`${selectedPositionsData.length} records copied to clipboard`);
        }).catch(() => {
            toast.error('Failed to copy to clipboard');
        });
    }, [selectedPositionsData]);

    const updateFilter = useCallback((key: keyof PositionFilters, value: string) => {
        switch (key) {
            case 'status':
                setStatusFilter(value);
                break;
            case 'requires_account':
                setRequiresAccountFilter(value);
                break;
            case 'officials_range':
                setOfficialsRange(value);
                break;
        }
        setCurrentPage(1);
    }, []);

    const hasActiveFilters = Boolean(
        search || 
        (statusFilter && statusFilter !== 'all') ||
        (requiresAccountFilter && requiresAccountFilter !== 'all') ||
        officialsRange
    );

    // Create filters object for the Filters component
  const filtersStateForComponent: PositionFilters = {
    status: statusFilter,
    requires_account: requiresAccountFilter as "all" | "yes" | "no",
    officials_range: officialsRange
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
                    if (selectedPositions.length > 0) {
                        setSelectedPositions([]);
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
            if (e.key === 'Delete' && isBulkMode && selectedPositions.length > 0) {
                e.preventDefault();
                setShowBulkDeleteDialog(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isBulkMode, selectedPositions, isMobile]);

    return (
        <AppLayout
            title="Position Management"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Positions', href: '/admin/positions' }
            ]}
        >
            <TooltipProvider>
                <div className="space-y-4 sm:space-y-6">
                    <PositionsHeader 
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isMobile={isMobile}
                    />

                    <PositionsStats 
                        globalStats={stats}
                        filteredStats={filteredStats}
                        isLoading={isPerformingBulkAction}
                    />

                    <PositionsFilters
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
                    />

                    <PositionsContent
                        positions={paginatedPositions}
                        stats={filteredStats}
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isSelectAll={isSelectAll}
                        selectedPositions={selectedPositions}
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
                        onSort={handleSort}
                        onBulkOperation={handleBulkOperation}
                        onCopySelectedData={handleCopySelectedData}
                        setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                        setShowBulkStatusDialog={setShowBulkStatusDialog}
                        filtersState={filtersStateForComponent}
                        isPerformingBulkAction={isPerformingBulkAction}
                        selectionMode={selectionMode}
                        selectionStats={selectionStats}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
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

            <PositionsDialogs
                showBulkDeleteDialog={showBulkDeleteDialog}
                setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                showBulkStatusDialog={showBulkStatusDialog}
                setShowBulkStatusDialog={setShowBulkStatusDialog}
                isPerformingBulkAction={isPerformingBulkAction}
                selectedPositions={selectedPositions}
                handleBulkOperation={handleBulkDelete}
                handleBulkAccountToggle={handleBulkAccountToggle}
                selectionStats={selectionStats}
                bulkEditValue={bulkEditValue}
                setBulkEditValue={setBulkEditValue}
            />
        </AppLayout>
    );
}