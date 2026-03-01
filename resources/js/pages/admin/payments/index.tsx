// resources/js/pages/admin/Payments/Index.tsx

import AppLayout from '@/layouts/admin-app-layout';
import { Head, router } from '@inertiajs/react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useEffect, useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

// Custom hooks
import { usePaymentsManagement } from '@/hooks/usePaymentsManagement';

// Components
import PaymentsHeader from '@/components/admin/payments/PaymentsHeader';
import PaymentsStats from '@/components/admin/payments/PaymentsStats';
import PaymentsFilters from '@/components/admin/payments/PaymentsFilters';
import PaymentsContent from '@/components/admin/payments/PaymentsContent';
import PaymentsDialogs from '@/components/admin/payments/PaymentsDialogs';
import PrintableReceipt from '@/components/admin/receipts/PrintableReceipt';

// Types
import { PaginationData, Filters, Stats } from '@/types/payments.types';

interface PaymentsIndexProps {
    payments: PaginationData;
    filters: Filters;
    stats: Stats;
}

// Helper function to format currency
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};

export default function PaymentsIndex({
    payments: rawPayments,
    filters,
    stats
}: PaymentsIndexProps) {
    
    const [selectedPaymentForPrint, setSelectedPaymentForPrint] = useState<any>(null);
    const [showPrintPreview, setShowPrintPreview] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `receipt-${selectedPaymentForPrint?.or_number || 'payment'}`,
        onAfterPrint: () => {
            setShowPrintPreview(false);
            setSelectedPaymentForPrint(null);
        },
    });

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

    // ===== HANDLERS =====
    const handleViewDetails = (payment: any) => {
        router.get(route('admin.payments.show', payment.id));
    };

    // Prepare receipt data for printing
    const prepareReceiptData = (payment: any) => {
        const amountDue = payment.total_amount - (payment.discount || 0);
        const changeDue = Math.max(0, payment.amount_paid - amountDue);
        
        return {
            id: payment.id,
            receipt_number: payment.or_number,
            or_number: payment.or_number,
            receipt_type: 'official',
            receipt_type_label: 'OFFICIAL RECEIPT',
            payer_name: payment.payer_name,
            payer_address: payment.address || null,
            subtotal: Number(payment.subtotal) || 0,
            surcharge: Number(payment.surcharge) || 0,
            penalty: Number(payment.penalty) || 0,
            discount: Number(payment.discount) || 0,
            total_amount: Number(payment.total_amount - (payment.discount || 0)) || 0,
            amount_paid: Number(payment.amount_paid) || 0,
            change_due: changeDue,
            formatted_subtotal: payment.formatted_subtotal || formatCurrency(payment.subtotal || 0),
            formatted_surcharge: payment.formatted_surcharge || formatCurrency(payment.surcharge || 0),
            formatted_penalty: payment.formatted_penalty || formatCurrency(payment.penalty || 0),
            formatted_discount: payment.formatted_discount || formatCurrency(payment.discount || 0),
            formatted_total: payment.formatted_total || formatCurrency(payment.total_amount - (payment.discount || 0)),
            formatted_amount_paid: payment.formatted_amount_paid || formatCurrency(payment.amount_paid || 0),
            formatted_change: payment.formatted_change_due || formatCurrency(changeDue),
            payment_method: payment.payment_method || 'cash',
            payment_method_label: payment.payment_method_display || 
                (payment.payment_method ? payment.payment_method.charAt(0).toUpperCase() + payment.payment_method.slice(1) : 'Cash'),
            reference_number: payment.reference_number || null,
            formatted_payment_date: payment.formatted_date || new Date(payment.payment_date).toLocaleDateString('en-PH'),
            formatted_issued_date: payment.formatted_date || new Date(payment.payment_date).toLocaleDateString('en-PH'),
            issued_by: payment.recorded_by_user_name || 'System',
            fee_breakdown: (payment.items || []).map((item: any) => ({
                fee_name: item.fee_name || 'Fee',
                fee_code: item.fee_code,
                base_amount: Number(item.base_amount || item.total_amount || 0) || 0,
                total_amount: Number(item.total_amount || item.base_amount || 0) || 0
            })),
            notes: payment.remarks || null
        };
    };

    const handlePrintReceipt = (payment: any) => {
        const receiptData = prepareReceiptData(payment);
        setSelectedPaymentForPrint(receiptData);
        setShowPrintPreview(true);
        
        // Small delay to ensure the printable component is rendered
        setTimeout(() => {
            handlePrint();
        }, 100);
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
            // Implement delete logic here
        }
    };

    const handleClearSelection = () => {
        console.log('Clear selection');
    };

    const handleSort = (column: string) => {
        console.log('Sort by:', column);
    };

    const handlePageChange = (page: number) => {
        router.get(route('payments.index'), {
            ...filters,
            page
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };
    // ===== END HANDLERS =====

    return (
        <AppLayout
            title="Payment Management"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Payments', href: '/admin/payments' }
            ]}
        >
            <TooltipProvider>
                {/* Hidden Print Preview */}
                {showPrintPreview && selectedPaymentForPrint && (
                    <div className="fixed top-0 left-0 w-0 h-0 overflow-hidden opacity-0 pointer-events-none">
                        <PrintableReceipt 
                            ref={printRef} 
                            receipt={selectedPaymentForPrint}
                            copyType="original"
                        />
                    </div>
                )}

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
                    
                    {/* Main Content */}
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