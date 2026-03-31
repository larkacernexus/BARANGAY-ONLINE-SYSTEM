// resources/js/pages/admin/Committees/Index.tsx

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
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { router, usePage } from '@inertiajs/react';

export default function CommitteesIndex({ committees, filters = {}, stats }: CommitteesIndexProps) {
    // Safely handle undefined values
    const safeCommittees = committees || { data: [], meta: undefined };
    const safeFilters = filters || {};
    const safeStats = stats || {
        total: 0,
        active: 0,
        inactive: 0,
        with_positions: 0,
        without_positions: 0
    };

    const { flash } = usePage().props as any;

    // Use custom hooks
    const {
        search,
        status,
        sortBy,
        sortOrder,
        viewMode,
        showAdvancedFilters,
        windowWidth,
        isMobile,
        handleSort,
        handleFilterChange,
        handleResetFilters,
        hasActiveFilters,
        setViewMode,
        setShowAdvancedFilters
    } = useCommitteesFilters(safeFilters);

    const {
        selectedIds,
        isBulkMode,
        isSelectAll,
        selectionMode,
        showSelectionOptions,
        showBulkActions,
        showBulkDeleteDialog,
        showBulkStatusDialog,
        isPerformingBulkAction,
        filteredCommittees,
        selectedCommitteesData,
        selectionStats,
        handleItemSelect,
        handleSelectAllOnPage,
        handleSelectAllFiltered,
        handleSelectAll,
        toggleBulkMode,
        clearSelection,
        setShowBulkDeleteDialog,
        setShowBulkStatusDialog,
        setShowSelectionOptions
    } = useCommitteesSelection(safeCommittees.data, search, status, sortBy, sortOrder);

    const {
        handleBulkOperation,
        handleCopySelectedData,
        handleExportAll
    } = useCommitteesBulkActions({
        selectedIds,
        selectedCommitteesData,
        onSuccess: () => {
            clearSelection();
        }
    });

    // Flash messages
    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    // Mobile detection - auto switch to grid on mobile
    useEffect(() => {
        if (typeof window !== 'undefined' && window.innerWidth < 768 && viewMode === 'table') {
            setViewMode('grid');
        }
    }, [viewMode, setViewMode]);

    // Handle page change
    const handlePageChange = (page: number) => {
        const queryParams: Record<string, any> = {};
        
        // Add filter params if they exist
        if (search) queryParams.search = search;
        if (status !== 'all') queryParams.status = status;
        if (sortBy !== 'order') queryParams.sort_by = sortBy;
        if (sortOrder !== 'asc') queryParams.sort_order = sortOrder;
        if (page > 1) queryParams.page = page;
        
        router.get('/admin/committees', queryParams, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Handle committee delete
    const handleDelete = (committee: Committee) => {
        if (confirm(`Are you sure you want to delete committee "${committee.name}"?`)) {
            router.delete(`/admin/committees/${committee.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Committee deleted successfully');
                },
                onError: () => {
                    toast.error('Failed to delete committee');
                }
            });
        }
    };

    // Handle toggle status
    const handleToggleStatus = (committee: Committee) => {
        router.post(`/admin/committees/${committee.id}/toggle-status`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Committee status updated');
            },
            onError: () => {
                toast.error('Failed to update status');
            }
        });
    };

    // Handle generate report
    const handleGenerateReport = () => {
        if (selectedIds.length === 0) {
            toast.error('Please select committees first');
            return;
        }
        handleBulkOperation('generate_report');
    };

    // Handle export with current filters
    const handleExport = () => {
        const exportFilters = {
            search,
            status: status !== 'all' ? status : undefined,
            sort_by: sortBy !== 'order' ? sortBy : undefined,
            sort_order: sortOrder !== 'asc' ? sortOrder : undefined,
        };
        handleExportAll(exportFilters);
    };

    // Filter change handlers with proper types
    const onSearchChange = (value: string) => {
        handleFilterChange('search', value);
    };

    const onStatusChange = (value: string) => {
        handleFilterChange('status', value);
    };

    const onSortChange = (column: string) => {
        handleSort(column);
    };

    const onResetFilters = () => {
        handleResetFilters();
    };

    const onToggleAdvancedFilters = () => {
        setShowAdvancedFilters(!showAdvancedFilters);
    };

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

                    <CommitteesStats stats={safeStats} />

                    <CommitteesFilters
                        search={search}
                        status={status}
                        sortBy={sortBy}
                        sortOrder={sortOrder as 'asc' | 'desc'} 
                        showAdvancedFilters={showAdvancedFilters}
                        isMobile={isMobile}
                        hasActiveFilters={hasActiveFilters as boolean}
                        onSearchChange={onSearchChange}
                        onStatusChange={onStatusChange}
                        onSortChange={onSortChange}
                        onExport={handleExport}
                        onReset={onResetFilters}
                        onToggleAdvancedFilters={onToggleAdvancedFilters}
                        isLoading={false}
                        selectedCount={selectedIds.length}
                    />

                   <CommitteesContent
                        committees={filteredCommittees}
                        selectedIds={selectedIds}
                        isBulkMode={isBulkMode}
                        isSelectAll={isSelectAll}
                        viewMode={viewMode}
                        isMobile={isMobile}
                        hasActiveFilters={Boolean(hasActiveFilters)} // Convert to boolean explicitly
                        currentPage={safeCommittees.meta?.current_page || 1}
                        totalPages={safeCommittees.meta?.last_page || 1}
                        totalItems={safeCommittees.meta?.total || filteredCommittees.length}
                        itemsPerPage={15}
                        onItemSelect={handleItemSelect}
                        onSelectAllOnPage={handleSelectAllOnPage}
                        onViewModeChange={setViewMode}
                        onPageChange={handlePageChange}
                        onClearFilters={handleResetFilters}
                        onDelete={handleDelete}
                        onToggleStatus={handleToggleStatus}
                        onToggleBulkMode={toggleBulkMode}
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