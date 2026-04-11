import AppLayout from '@/layouts/admin-app-layout';
import { CommitteesHeader } from '@/components/admin/committees/CommitteesHeader';
import { CommitteesFilters } from '@/components/admin/committees/CommitteesFilters';
import { CommitteesContent } from '@/components/admin/committees/CommitteesContent';
import { CommitteesDialogs } from '@/components/admin/committees/CommitteesDialogs';
import { CommitteesStats } from '@/components/admin/committees/CommitteesStats';
import { CommitteesQuickActions } from '@/components/admin/committees/CommitteesQuickActions';
import { CommitteesDistribution } from '@/components/admin/committees/CommitteesDistribution';
import { KeyboardShortcutsHelp } from '@/components/admin/committees/KeyboardShortcutsHelp';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useCommitteesSelection } from '@/hooks/useCommitteesSelection';
import { useCommitteesFilters } from '@/hooks/useCommitteesFilters';
import { useCommitteesBulkActions } from '@/hooks/useCommitteesBulkActions';
import { Committee, CommitteesIndexProps } from '@/types/admin/committees/committees';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { router, usePage } from '@inertiajs/react';

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

export default function CommitteesIndex({ committees, filters = {
    positions_range: function (positions_range: any, arg1: string): string | (() => string) {
        throw new Error('Function not implemented.');
    }
}, stats }: CommitteesIndexProps) {
    // Safely handle undefined values
    const safeCommittees = committees || { data: [], meta: { current_page: 1, last_page: 1, total: 0, per_page: 15, from: 0, to: 0 } };
    const safeFilters = filters || {};
    const safeStats = stats || {
        total: 0,
        active: 0,
        inactive: 0,
        with_positions: 0,
        without_positions: 0
    };

    const { flash } = usePage().props as any;
    
    // All committees data
    const allCommittees = safeCommittees.data || [];
    
    // Filter states - client-side only
    const [search, setSearch] = useState<string>(getSafeString(safeFilters.search));
    const [statusFilter, setStatusFilter] = useState<string>(getSafeString(safeFilters.status, 'all'));
    const [positionsRange, setPositionsRange] = useState<string>(getSafeString(safeFilters.positions_range, ''));
    const [sortBy, setSortBy] = useState<string>(getSafeString(safeFilters.sort_by, 'order'));
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(getSafeSortOrder(safeFilters.sort_order));
    
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 15;
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
    
    // Bulk selection states
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isBulkMode, setIsBulkMode] = useState<boolean>(false);
    const [isSelectAll, setIsSelectAll] = useState<boolean>(false);
    const [selectionMode, setSelectionMode] = useState<'page' | 'filtered' | 'all'>('page');
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState<boolean>(false);
    const [showBulkStatusDialog, setShowBulkStatusDialog] = useState<boolean>(false);
    const [isPerformingBulkAction, setIsPerformingBulkAction] = useState<boolean>(false);
    const [showSelectionOptions, setShowSelectionOptions] = useState<boolean>(false);
    const [selectedCommitteesData, setSelectedCommitteesData] = useState<Committee[]>([]);
    const [selectionStats, setSelectionStats] = useState<any>(null);

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

    // Flash messages
    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter, positionsRange, sortBy, sortOrder]);

    // Reset selection when exiting bulk mode
    useEffect(() => {
        if (!isBulkMode) {
            setSelectedIds([]);
            setIsSelectAll(false);
        }
    }, [isBulkMode]);

    // Filter committees client-side
    const filteredCommittees = useMemo(() => {
        if (!allCommittees || allCommittees.length === 0) {
            return [];
        }
        
        let filtered = [...allCommittees];
        
        // Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(committee =>
                committee?.name?.toLowerCase().includes(searchLower) ||
                committee?.code?.toLowerCase().includes(searchLower) ||
                committee?.description?.toLowerCase().includes(searchLower)
            );
        }
        
        // Status filter
        if (statusFilter && statusFilter !== 'all') {
            filtered = filtered.filter(committee => committee?.is_active === (statusFilter === 'active'));
        }
        
        // Positions range filter
        if (positionsRange) {
            filtered = filtered.filter(committee => {
                const count = committee?.positions_count || 0;
                switch (positionsRange) {
                    case '0': return count === 0;
                    case '1-3': return count >= 1 && count <= 3;
                    case '4-6': return count >= 4 && count <= 6;
                    case '7-10': return count >= 7 && count <= 10;
                    case '10+': return count >= 10;
                    default: return true;
                }
            });
        }
        
        // Apply sorting
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
                    case 'description':
                        valueA = a?.description || '';
                        valueB = b?.description || '';
                        break;
                    case 'positions_count':
                        valueA = a?.positions_count || 0;
                        valueB = b?.positions_count || 0;
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
    }, [allCommittees, search, statusFilter, positionsRange, sortBy, sortOrder]);

    // Calculate filtered stats
    const filteredStats = useMemo(() => {
        if (!filteredCommittees || filteredCommittees.length === 0) {
            return safeStats;
        }
        
        return {
            total: filteredCommittees.length,
            active: filteredCommittees.filter(c => c?.is_active).length,
            inactive: filteredCommittees.filter(c => !c?.is_active).length,
            with_positions: filteredCommittees.filter(c => (c?.positions_count || 0) > 0).length,
            without_positions: filteredCommittees.filter(c => (c?.positions_count || 0) === 0).length
        };
    }, [filteredCommittees, safeStats]);

    // Pagination
    const totalItems = filteredCommittees.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedCommittees = filteredCommittees.slice(startIndex, endIndex);

    // Selection handlers
    const handleSelectAllOnPage = useCallback(() => {
        const pageIds = paginatedCommittees.map(committee => committee.id);
        if (isSelectAll) {
            setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedIds, ...pageIds])];
            setSelectedIds(newSelected);
        }
        setIsSelectAll(!isSelectAll);
        setSelectionMode('page');
    }, [paginatedCommittees, isSelectAll, selectedIds]);

    const handleSelectAllFiltered = useCallback(() => {
        const allIds = filteredCommittees.map(committee => committee.id);
        if (selectedIds.length === allIds.length && allIds.every(id => selectedIds.includes(id))) {
            setSelectedIds(prev => prev.filter(id => !allIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedIds, ...allIds])];
            setSelectedIds(newSelected);
            setSelectionMode('filtered');
        }
    }, [filteredCommittees, selectedIds]);

    const handleSelectAll = useCallback(() => {
        if (confirm(`This will select ALL ${totalItems} committees. This action may take a moment.`)) {
            const allIds = filteredCommittees.map(committee => committee.id);
            setSelectedIds(allIds);
            setSelectionMode('all');
        }
    }, [filteredCommittees, totalItems]);

    const handleItemSelect = useCallback((id: number) => {
        setSelectedIds(prev => {
            if (prev.includes(id)) {
                return prev.filter(itemId => itemId !== id);
            } else {
                return [...prev, id];
            }
        });
    }, []);

    // Check if all items on current page are selected
    useEffect(() => {
        const allPageIds = paginatedCommittees.map(committee => committee.id);
        const allSelected = allPageIds.length > 0 && allPageIds.every(id => selectedIds.includes(id));
        setIsSelectAll(allSelected);
    }, [selectedIds, paginatedCommittees]);

    // Get selected committees data
    useEffect(() => {
        const selectedData = filteredCommittees.filter(committee => selectedIds.includes(committee.id));
        setSelectedCommitteesData(selectedData);
        
        // Calculate selection stats
        const total = selectedData.length;
        const active = selectedData.filter(c => c?.is_active).length;
        const inactive = selectedData.filter(c => !c?.is_active).length;
        const totalPositions = selectedData.reduce((sum, c) => sum + (c?.positions_count || 0), 0);
        
        setSelectionStats({
            total,
            active,
            inactive,
            totalPositions,
            averagePositions: total > 0 ? totalPositions / total : 0
        });
    }, [selectedIds, filteredCommittees]);

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

    // Handle committee delete
    const handleDelete = useCallback((committee: Committee) => {
        if (confirm(`Are you sure you want to delete committee "${committee.name}"?`)) {
            router.delete(`/admin/committees/${committee.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Committee deleted successfully');
                    router.reload();
                },
                onError: () => {
                    toast.error('Failed to delete committee');
                }
            });
        }
    }, []);

    // Handle toggle status
    const handleToggleStatus = useCallback((committee: Committee) => {
        router.post(`/admin/committees/${committee.id}/toggle-status`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Committee status updated');
                router.reload();
            },
            onError: () => {
                toast.error('Failed to update status');
            }
        });
    }, []);

    // Handle generate report
    const handleGenerateReport = useCallback(() => {
        if (selectedIds.length === 0) {
            toast.error('Please select committees first');
            return;
        }
        const idsParam = selectedIds.join(',');
        window.open(`/admin/committees/report?ids=${idsParam}`, '_blank');
        toast.success(`Generating report for ${selectedIds.length} committee(s)`);
    }, [selectedIds]);

    // Handle export with current filters
    const handleExport = useCallback(() => {
        const exportData = filteredCommittees.map(committee => ({
            'Name': committee.name,
            'Code': committee.code,
            'Description': committee.description || '',
            'Status': committee.is_active ? 'Active' : 'Inactive',
            'Positions': committee.positions_count || 0,
            'Order': committee.order,
            'Created At': new Date(committee.created_at).toLocaleDateString()
        }));
        
        const csv = [
            Object.keys(exportData[0]).join(','),
            ...exportData.map(row => Object.values(row).map(v => `"${v}"`).join(','))
        ].join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `committees-export-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        toast.success(`${filteredCommittees.length} committees exported`);
    }, [filteredCommittees]);

    // Bulk operations
    const handleBulkOperation = useCallback(async (operation: string) => {
        if (selectedIds.length === 0) {
            toast.error('Please select at least one committee');
            return;
        }

        setIsPerformingBulkAction(true);

        try {
            switch (operation) {
                case 'delete':
                    setShowBulkDeleteDialog(true);
                    break;
                case 'activate':
                    await router.post('/admin/committees/bulk-action', {
                        action: 'activate',
                        committee_ids: selectedIds,
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            setSelectedIds([]);
                            toast.success(`${selectedIds.length} committees activated successfully`);
                            router.reload();
                        },
                        onError: () => {
                            toast.error('Failed to activate committees');
                        }
                    });
                    break;
                case 'deactivate':
                    await router.post('/admin/committees/bulk-action', {
                        action: 'deactivate',
                        committee_ids: selectedIds,
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            setSelectedIds([]);
                            toast.success(`${selectedIds.length} committees deactivated successfully`);
                            router.reload();
                        },
                        onError: () => {
                            toast.error('Failed to deactivate committees');
                        }
                    });
                    break;
                case 'generate_report':
                    const idsParam = selectedIds.join(',');
                    window.open(`/admin/committees/report?ids=${idsParam}`, '_blank');
                    toast.success(`Generating report for ${selectedIds.length} committee(s)`);
                    break;
                default:
                    toast.info('Functionality to be implemented');
            }
        } catch (error) {
            console.error('Bulk operation error:', error);
            toast.error('An error occurred during the bulk operation.');
        } finally {
            setIsPerformingBulkAction(false);
        }
    }, [selectedIds]);

    const handleCopySelectedData = useCallback(() => {
        if (selectedCommitteesData.length === 0) {
            toast.error('No data to copy');
            return;
        }
        
        const data = selectedCommitteesData.map(committee => ({
            'Name': committee.name,
            'Code': committee.code,
            'Description': committee.description || '',
            'Status': committee.is_active ? 'Active' : 'Inactive',
            'Positions': committee.positions_count || 0,
            'Order': committee.order,
        }));
        
        const csvData = [
            Object.keys(data[0]).join(','),
            ...data.map(row => Object.values(row).join(','))
        ].join('\n');
        
        navigator.clipboard.writeText(csvData).then(() => {
            toast.success(`${selectedCommitteesData.length} records copied to clipboard`);
        }).catch(() => {
            toast.error('Failed to copy to clipboard');
        });
    }, [selectedCommitteesData]);

    const toggleBulkMode = useCallback(() => {
        setIsBulkMode(prev => !prev);
        if (isBulkMode) {
            setSelectedIds([]);
            setIsSelectAll(false);
        }
    }, [isBulkMode]);

    const clearSelection = useCallback(() => {
        setSelectedIds([]);
        setIsSelectAll(false);
    }, []);

    const handleResetFilters = useCallback(() => {
        setSearch('');
        setStatusFilter('all');
        setPositionsRange('');
        setSortBy('order');
        setSortOrder('asc');
        setCurrentPage(1);
    }, []);

    const handleFilterChange = useCallback((key: string, value: string) => {
        switch (key) {
            case 'search':
                setSearch(value);
                break;
            case 'status':
                setStatusFilter(value);
                break;
            case 'positions_range':
                setPositionsRange(value);
                break;
        }
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

    const hasActiveFilters = Boolean(
        search || 
        (statusFilter && statusFilter !== 'all') ||
        positionsRange
    );

    return (
        <AppLayout
            title="Committees"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Committees', href: '/admin/committees' }
            ]}
        >
            <TooltipProvider>
                <div className="space-y-6">
                    <CommitteesHeader
                        isBulkMode={isBulkMode}
                        toggleBulkMode={toggleBulkMode}
                        stats={safeStats}
                    />

                    <CommitteesStats stats={filteredStats} />

                    <CommitteesFilters
                        search={search}
                        status={statusFilter}
                        positionsRange={positionsRange}
                        showAdvancedFilters={showAdvancedFilters}
                        isMobile={isMobile}
                        hasActiveFilters={hasActiveFilters}
                        onSearchChange={(value) => handleFilterChange('search', value)}
                        onStatusChange={(value) => handleFilterChange('status', value)}
                        onPositionsRangeChange={(value) => handleFilterChange('positions_range', value)}
                        onExport={handleExport}
                        onReset={handleResetFilters}
                        onToggleAdvancedFilters={() => setShowAdvancedFilters(prev => !prev)}
                        isLoading={isPerformingBulkAction}
                        selectedCount={selectedIds.length}
                    />

                    <CommitteesContent
                        committees={paginatedCommittees}
                        selectedIds={selectedIds}
                        isBulkMode={isBulkMode}
                        isSelectAll={isSelectAll}
                        viewMode={viewMode}
                        isMobile={isMobile}
                        hasActiveFilters={hasActiveFilters}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        onItemSelect={handleItemSelect}
                        onSelectAllOnPage={handleSelectAllOnPage}
                        onViewModeChange={setViewMode}
                        onPageChange={handlePageChange}
                        onClearFilters={handleResetFilters}
                        onDelete={handleDelete}
                        onToggleStatus={handleToggleStatus}
                        onToggleBulkMode={toggleBulkMode}
                        onClearSelection={clearSelection}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSortChange={handleSortChange}
                        getCurrentSortValue={getCurrentSortValue}
                    />
                    
                    <KeyboardShortcutsHelp
                        isBulkMode={isBulkMode}
                        isPerformingBulkAction={isPerformingBulkAction}
                        onExitBulkMode={toggleBulkMode}
                    />

                    <div className="grid gap-6 sm:grid-cols-2">
                        <CommitteesQuickActions
                            selectedIds={selectedIds}
                            onGenerateReport={handleGenerateReport}
                            onExport={handleExport}
                        />

                        <CommitteesDistribution
                            committees={filteredCommittees.slice(0, 3)}
                            onViewAll={() => handlePageChange(1)}
                        />
                    </div>
                </div>
            </TooltipProvider>

            <CommitteesDialogs
                showBulkDeleteDialog={showBulkDeleteDialog}
                showBulkStatusDialog={showBulkStatusDialog}
                selectedIds={selectedIds}
                isPerformingBulkAction={isPerformingBulkAction}
                selectionStats={selectionStats}
                onClose={() => {
                    setShowBulkDeleteDialog(false);
                    setShowBulkStatusDialog(false);
                }}
                onBulkDelete={() => handleBulkOperation('delete')}
                onBulkActivate={() => handleBulkOperation('activate')}
                onBulkDeactivate={() => handleBulkOperation('deactivate')}
            />
        </AppLayout>
    );
}