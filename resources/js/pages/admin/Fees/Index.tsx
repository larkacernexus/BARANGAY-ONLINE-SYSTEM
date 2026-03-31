// pages/admin/fees/index.tsx

import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/admin-app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { TooltipProvider } from '@/components/ui/tooltip';

// Custom hooks
import { useFeesManagement } from '@/hooks/useFeesManagement';
import { useMediaQuery } from '@/hooks/useMediaQuery';

// Components
import FeesHeader from '@/components/admin/fees/FeesHeader';
import FeesStats from '@/components/admin/fees/FeesStats';
import FeesFilters from '@/components/admin/fees/FeesFilters';
import FeesContent from '@/components/admin/fees/FeesContent';
import FeesDialogs from '@/components/admin/fees/FeesDialogs';
import FlashMessages from '@/components/adminui/FlashMessages';

// Types
import { PaginationData, Filters, Stats, BulkOperation } from '@/types/admin/fees/fees';
import { route } from 'ziggy-js';

interface FeesIndexProps {
    fees: PaginationData;
    filters: Filters;
    statuses: Record<string, string>;
    categories: Record<string, string>;
    puroks: string[];
    stats: Stats;
    flash?: {
        success?: string;
        error?: string;
        info?: string;
        warning?: string;
    };
}

export default function FeesIndex({
    fees,
    filters,
    statuses,
    categories,
    puroks,
    stats,
    flash
}: FeesIndexProps) {
    
    // Detect mobile for responsive behavior
    const isMobile = useMediaQuery('(max-width: 768px)');
    
    const {
        // State
        search,
        filters: filtersState,
        showAdvancedFilters,
        currentPage,
        selectedFees,
        isBulkMode,
        isSelectAll,
        showBulkDeleteDialog,
        isPerformingBulkAction,
        viewMode,
        selectionMode,
        
        // Data
        paginatedFees,
        totalItems,
        totalPages,
        startIndex,
        endIndex,
        itemsPerPage,
        selectionStats,
        
        // Handlers
        setSearch,
        setShowAdvancedFilters,
        setCurrentPage,
        setIsBulkMode,
        setShowBulkDeleteDialog,
        setViewMode,
        
        handleSelectAllOnPage,
        handleSelectAllFiltered,
        handleSelectAll,
        handleItemSelect,
        handleBulkOperation,
        handleDelete,
        handleSort,
        handleClearFilters,
        updateFilter,
        
        // Computed
        hasActiveFilters,
        
        // Props
        flash: hookFlash,
    } = useFeesManagement(fees, filters, statuses, categories, puroks, stats);

    // Create wrapper function for bulk operations
    const handleBulkOperationWrapper = (operation: string) => {
        handleBulkOperation(operation as BulkOperation);
    };

    // Ensure hasActiveFilters is a boolean
    const hasActiveFiltersBool = Boolean(hasActiveFilters);

    // Combine flash messages from props and hook
    const combinedFlash = {
        success: flash?.success || hookFlash?.success,
        error: flash?.error || hookFlash?.error,
        warning: flash?.warning || hookFlash?.warning,
        info: flash?.info || hookFlash?.info
    };

    // Handle mobile view mode override
    useEffect(() => {
        if (isMobile && viewMode !== 'grid') {
            setViewMode('grid');
        }
    }, [isMobile, viewMode, setViewMode]);

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Toggle bulk mode: Ctrl+Shift+B
            if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'b') {
                e.preventDefault();
                setIsBulkMode(!isBulkMode);
            }
            
            // Select all: Ctrl+A
            if (e.ctrlKey && e.key.toLowerCase() === 'a' && isBulkMode) {
                e.preventDefault();
                handleSelectAllOnPage();
            }
            
            // Escape to clear selection
            if (e.key === 'Escape' && isBulkMode && selectedFees.length > 0) {
                e.preventDefault();
                setIsBulkMode(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isBulkMode, selectedFees.length, handleSelectAllOnPage, setIsBulkMode]);

    // Handle page change with scroll to top
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ===== ALL HANDLERS =====
    const handleViewDetails = (fee: any) => {
        router.get(route('admin.fees.show', fee.id));
    };

    const handleEdit = (fee: any) => {
        router.get(route('admin.fees.edit', fee.id));
    };

    const handleCopyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text)
            .then(() => {
                console.log(`${label} copied to clipboard`);
            })
            .catch(err => {
                console.error('Failed to copy:', err);
            });
    };

    const handleCopySelectedData = () => {
        // Copy selected fees data as CSV
        console.log('Copy selected data:', selectedFees);
    };

    const handleClearSelection = () => {
        setIsBulkMode(false);
    };

    // Handle reminders sent
    const handleRemindersSent = () => {
        // Refresh data after sending reminders
        router.reload({ only: ['fees', 'stats'] });
    };
    // ===== END HANDLERS =====

    // Check if any flash messages exist
    const hasFlashMessages = Object.values(combinedFlash).some(message => message !== undefined);

    return (
        <AppLayout
            title="Fees Management"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Fees', href: '/admin/fees' }
            ]}
        >
            <TooltipProvider>
                <div className="space-y-6">
                    {/* Flash Messages */}
                    {hasFlashMessages && (
                        <FlashMessages flash={combinedFlash} />
                    )}
                    
                    {/* Header */}
                    <FeesHeader 
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isMobile={isMobile}
                        selectedFees={selectedFees}
                        onRemindersSent={handleRemindersSent}
                        paginatedFees={paginatedFees}
                    />
                    
                    {/* Stats Cards */}
                    <FeesStats stats={stats} />
                    
                    {/* Search and Filters */}
                    <FeesFilters
                        search={search}
                        setSearch={setSearch}
                        filtersState={filtersState}
                        updateFilter={updateFilter}
                        showAdvancedFilters={showAdvancedFilters}
                        setShowAdvancedFilters={setShowAdvancedFilters}
                        handleClearFilters={handleClearFilters}
                        hasActiveFilters={hasActiveFiltersBool}
                        statuses={statuses}
                        categories={categories}
                        puroks={puroks}
                        startIndex={startIndex}
                        endIndex={endIndex}
                        totalItems={totalItems}
                        isBulkMode={isBulkMode}
                        selectedFees={selectedFees}
                        onSelectAllOnPage={handleSelectAllOnPage}
                        onSelectAllFiltered={handleSelectAllFiltered}
                        onSelectAll={handleSelectAll}
                        onClearSelection={handleClearSelection}
                    />
                    
                    {/* Main Content */}
                    <FeesContent
                        fees={paginatedFees}
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isSelectAll={isSelectAll}
                        selectedFees={selectedFees}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        isMobile={isMobile}
                        hasActiveFilters={hasActiveFiltersBool}
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
                        onViewDetails={handleViewDetails}
                        onEdit={handleEdit}
                        onCopyToClipboard={handleCopyToClipboard}
                        onCopySelectedData={handleCopySelectedData}
                        onSort={handleSort}
                        onBulkOperation={handleBulkOperationWrapper} // Use wrapper
                        setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                        filtersState={filtersState}
                        isPerformingBulkAction={isPerformingBulkAction}
                        selectionMode={selectionMode}
                        selectionStats={selectionStats}
                        statuses={statuses}
                        categories={categories}
                        puroks={puroks}
                    />
                </div>
            </TooltipProvider>
            
            {/* Dialogs */}
            <FeesDialogs
                showBulkDeleteDialog={showBulkDeleteDialog}
                setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                isPerformingBulkAction={isPerformingBulkAction}
                selectedFees={selectedFees}
                handleBulkOperation={handleBulkOperationWrapper} // Use wrapper
                selectionStats={selectionStats}
            />
        </AppLayout>
    );
}