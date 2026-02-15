import AppLayout from '@/layouts/admin-app-layout';
import { Head, router } from '@inertiajs/react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useEffect } from 'react';

// Custom hooks
import { usePaymentsManagement } from '@/hooks/usePaymentsManagement';

// Components
import PaymentsHeader from '@/components/admin/payments/PaymentsHeader';
import PaymentsStats from '@/components/admin/payments/PaymentsStats';
import PaymentsFilters from '@/components/admin/payments/PaymentsFilters';
import PaymentsContent from '@/components/admin/payments/PaymentsContent';
import PaymentsDialogs from '@/components/admin/payments/PaymentsDialogs';

// Types
import { PaginationData, Filters, Stats } from '@/types/payments.types';

interface PaymentsIndexProps {
    payments: PaginationData;
    filters: Filters;
    stats: Stats;
}

export default function PaymentsIndex({
    payments: rawPayments,
    filters,
    stats
}: PaymentsIndexProps) {
    
    // Debug what we're receiving
    useEffect(() => {
        console.log('Payments Index Raw Props:', {
            rawPayments,
            isArray: Array.isArray(rawPayments),
            filters,
            stats
        });
    }, [rawPayments, filters, stats]);
    
    // Use the hook - it now handles both array and paginated data
    const {
        // Safe data
        safePayments,
        safeMeta,
        
        // State and handlers from hook...
        search,
        setSearch,
        statusFilter,
        setStatusFilter,
        methodFilter,
        setMethodFilter,
        payerTypeFilter,
        setPayerTypeFilter,
        dateFrom,
        setDateFrom,
        dateTo,
        setDateTo,
        isLoading,
        expandedPayments,
        viewMode,
        setViewMode,
        showAdvancedFilters,
        setShowAdvancedFilters,
        windowWidth,
        selectedPayments,
        isBulkMode,
        setIsBulkMode,
        showBulkActions,
        setShowBulkActions,
        isSelectAll,
        showBulkDeleteDialog,
        setShowBulkDeleteDialog,
        showBulkStatusDialog,
        setShowBulkStatusDialog,
        isPerformingBulkAction,
        bulkEditValue,
        setBulkEditValue,
        selectionMode,
        showSelectionOptions,
        setShowSelectionOptions,
        
        // Refs
        bulkActionRef,
        selectionRef,
        searchInputRef,
        
        // Data
        filteredPayments,
        selectedPaymentsData,
        selectionStats,
        
        // Constants
        paymentMethods,
        statusOptions,
        payerTypeOptions,
        
        // Handlers
        handleSelectAllOnPage,
        handleSelectAllFiltered,
        handleSelectAll,
        handleItemSelect,
        handleBulkOperation,
        handleCopySelectedData,
        handleClearFilters,
        handleExport,
        togglePaymentExpanded,
        
        // Computed
        hasActiveFilters,
    } = usePaymentsManagement({ 
        payments: rawPayments, 
        filters, 
        stats 
    });

    // ===== ADDED MISSING HANDLERS =====
    const handleViewDetails = (payment: any) => {
        router.get(route('payments.show', payment.id));
    };

    const handlePrintReceipt = (payment: any) => {
        console.log('Print receipt for:', payment.or_number);
    };

    const handleCopyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text).then(() => {
            console.log(`Copied ${label}: ${text}`);
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
    };

    const handleDeletePayment = (payment: any) => {
        if (confirm(`Are you sure you want to delete payment OR#${payment.or_number}?`)) {
            console.log('Delete payment:', payment.id);
        }
    };

    const handleClearSelection = () => {
        console.log('Clear selection');
    };

    const handleSort = (column: string) => {
        console.log('Sort by:', column);
    };

    const handlePageChange = (page: number) => {
        console.log('Change to page:', page);
    };
    // ===== END ADDED HANDLERS =====

    return (
        <AppLayout
            title="Payment Management"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Payments', href: '/payments' }
            ]}
        >
            <TooltipProvider>
                <div className="space-y-6">
                    {/* Header */}
                    <PaymentsHeader 
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        handleExport={handleExport}
                        isLoading={isLoading}
                    />
                    
                    {/* Stats Cards */}
                    <PaymentsStats stats={stats} />
                    
                    {/* Search and Filters */}
                    <PaymentsFilters
                        search={search}
                        setSearch={setSearch}
                        statusFilter={statusFilter}
                        setStatusFilter={setStatusFilter}
                        methodFilter={methodFilter}
                        setMethodFilter={setMethodFilter}
                        payerTypeFilter={payerTypeFilter}
                        setPayerTypeFilter={setPayerTypeFilter}
                        dateFrom={dateFrom}
                        setDateFrom={setDateFrom}
                        dateTo={dateTo}
                        setDateTo={setDateTo}
                        showAdvancedFilters={showAdvancedFilters}
                        setShowAdvancedFilters={setShowAdvancedFilters}
                        handleClearFilters={handleClearFilters}
                        handleExport={handleExport}
                        hasActiveFilters={hasActiveFilters}
                        isLoading={isLoading}
                        paymentMethods={paymentMethods}
                        statusOptions={statusOptions}
                        payerTypeOptions={payerTypeOptions}
                        searchInputRef={searchInputRef}
                        payments={safePayments}
                        isBulkMode={isBulkMode}
                        selectedPayments={selectedPayments}
                        handleSelectAllOnPage={handleSelectAllOnPage}
                        handleSelectAllFiltered={handleSelectAllFiltered}
                        handleSelectAll={handleSelectAll}
                        selectionRef={selectionRef}
                        showSelectionOptions={showSelectionOptions}
                        setShowSelectionOptions={setShowSelectionOptions}
                        setSelectedPayments={() => {}}
                    />
                    
                    {/* Main Content - FIXED: Removed duplicate onCopySelectedData */}
                    <PaymentsContent
                        payments={filteredPayments}
                        paymentsMeta={safeMeta}
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isSelectAll={isSelectAll}
                        selectedPayments={selectedPayments}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        hasActiveFilters={hasActiveFilters}
                        currentPage={safeMeta.current_page}
                        totalPages={safeMeta.last_page}
                        totalItems={safeMeta.total}
                        itemsPerPage={safeMeta.per_page}
                        onPageChange={handlePageChange}
                        onSelectAllOnPage={handleSelectAllOnPage}
                        onSelectAllFiltered={handleSelectAllFiltered}
                        onSelectAll={handleSelectAll}
                        onItemSelect={handleItemSelect}
                        onClearFilters={handleClearFilters}
                        onClearSelection={handleClearSelection}
                        onDelete={handleDeletePayment}
                        onViewDetails={handleViewDetails}
                        onPrintReceipt={handlePrintReceipt}
                        onCopyToClipboard={handleCopyToClipboard}
                        onCopySelectedData={handleCopySelectedData}
                        onSort={handleSort}
                        onBulkOperation={handleBulkOperation}
                        setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                        filtersState={{
                            search,
                            status: statusFilter,
                            payment_method: methodFilter,
                            payer_type: payerTypeFilter,
                            date_from: dateFrom,
                            date_to: dateTo
                        }}
                        isPerformingBulkAction={isPerformingBulkAction}
                        selectionMode={selectionMode}
                        selectionStats={selectionStats}
                        expandedPayments={expandedPayments}
                        togglePaymentExpanded={togglePaymentExpanded}
                        paymentMethods={paymentMethods}
                        statusOptions={statusOptions}
                        payerTypeOptions={payerTypeOptions}
                        isLoading={isLoading}
                        windowWidth={windowWidth}
                        bulkActionRef={bulkActionRef}
                        showBulkActions={showBulkActions}
                        setShowBulkActions={setShowBulkActions}
                    />
                </div>
            </TooltipProvider>
            
            {/* Dialogs */}
            <PaymentsDialogs
                showBulkDeleteDialog={showBulkDeleteDialog}
                setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                showBulkStatusDialog={showBulkStatusDialog}
                setShowBulkStatusDialog={setShowBulkStatusDialog}
                isPerformingBulkAction={isPerformingBulkAction}
                selectedPayments={selectedPayments}
                handleBulkOperation={handleBulkOperation}
                selectionStats={selectionStats}
                bulkEditValue={bulkEditValue}
                setBulkEditValue={setBulkEditValue}
            />
        </AppLayout>
    );
}