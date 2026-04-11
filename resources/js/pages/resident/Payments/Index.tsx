// pages/portal/resident/my-payments.tsx (Updated with mobile list view)

import { useState, useEffect, useMemo } from 'react';
import ResidentLayout from '@/layouts/resident-app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, usePage, Head } from '@inertiajs/react';
import { toast } from 'sonner';
import { 
    Calendar,
    AlertCircle
} from 'lucide-react';

// Import reusable components
import { PaymentTabs, PAYMENT_TABS_CONFIG } from '@/components/portal/payments/index/payment-tabs';
import { ModernSelect } from '@/components/residentui/modern-select';
import { ModernFilterModal } from '@/components/residentui/modern-filter-modal';
import { ModernStatsCards } from '@/components/residentui/modern-stats-cards';
import { ModernEmptyState } from '@/components/residentui/modern-empty-state';
import { ModernPagination } from '@/components/residentui/modern-pagination';
import { ModernLoadingOverlay } from '@/components/residentui/modern-loading-overlay';
import { ModernSelectionBanner } from '@/components/residentui/modern-selection-banner';
import { ModernCardHeader } from '@/components/residentui/modern/card-header';
import { ViewToggle } from '@/components/residentui/modern/view-toggle';
import { SortDropdown } from '@/components/residentui/modern/sort-dropdown';
import { ActionButtons } from '@/components/residentui/modern/action-buttons';
import { MobileHeader } from '@/components/residentui/modern/mobile-header';
import { DesktopHeader } from '@/components/residentui/modern/desktop-header';
import { ErrorState } from '@/components/residentui/modern/error-state';
import { ModernPaymentListView } from '@/components/portal/payments/index/modern-payment-list-view';
import { ModernPaymentGridView } from '@/components/portal/payments/index/modern-payment-grid-view';
import { ModernPaymentMobileListView } from '@/components/portal/payments/index/modern-payment-mobile-list-view'; // New import
import { ModernPaymentFilters } from '@/components/residentui/payments/modern-payment-filters';
import { SelectModeButton } from '@/components/residentui/modern/select-mode-button';

// Import payment utilities and types
import {
    Payment,
    PaymentStats,
    PaymentMethodType,
    ViewMode
} from '@/types/portal/payments/payment.types';
import {
    formatDate,
    formatCurrency,
    printPaymentsList,
    exportToCSV,
} from '@/components/residentui/payments/payment-utils';
import { getPaymentStatsCards } from '@/components/residentui/payments/constants';

// Define PageProps with proper types
interface PageProps extends Record<string, any> {
    payments?: {
        data: Payment[];
    };
    stats?: PaymentStats;
    availableYears?: number[];
    availablePaymentMethods?: PaymentMethodType[];
    currentResident?: {
        id: number;
        first_name: string;
        last_name: string;
    };
    hasProfile?: boolean;
    error?: string;
}

export default function MyPayments() {
    const { props } = usePage<PageProps>();
    
    // Safe data access with fallbacks
    const allPayments = props.payments?.data || [];
    const stats = props.stats || {
        total_payments: 0,
        pending_payments: 0,
        total_paid: 0,
        balance_due: 0,
        completed_payments: 0,
        overdue_payments: 0,
        cancelled_payments: 0,
        current_year_total: 0,
        current_year_paid: 0,
        current_year_balance: 0,
    };
    
    const availableYears = props.availableYears || [];
    const availablePaymentMethods = props.availablePaymentMethods || [];
    const currentResident = props.currentResident || { id: 0, first_name: '', last_name: '' };
    const hasProfile = props.hasProfile || false;
    
    // Client-side filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
    const [yearFilter, setYearFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [showStats, setShowStats] = useState(true);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [selectedPayments, setSelectedPayments] = useState<number[]>([]);
    const [isExporting, setIsExporting] = useState(false);
    const [selectMode, setSelectMode] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    
    // Check if mobile on mount and resize
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) {
                setViewMode('grid');
            }
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    
    // Filter payments client-side with safety checks
    const filteredPayments = useMemo(() => {
        if (!allPayments || !Array.isArray(allPayments)) {
            return [];
        }
        
        let filtered = [...allPayments];
        
        if (statusFilter !== 'all') {
            filtered = filtered.filter(payment => payment?.status === statusFilter);
        }
        
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(payment => 
                payment?.or_number?.toLowerCase().includes(query) ||
                payment?.purpose?.toLowerCase().includes(query) ||
                payment?.reference_number?.toLowerCase().includes(query) ||
                payment?.total_amount?.toString().includes(query)
            );
        }
        
        if (paymentMethodFilter !== 'all') {
            filtered = filtered.filter(payment => payment?.payment_method === paymentMethodFilter);
        }
        
        if (yearFilter !== 'all') {
            filtered = filtered.filter(payment => {
                if (!payment?.payment_date) return false;
                try {
                    const paymentYear = new Date(payment.payment_date).getFullYear().toString();
                    return paymentYear === yearFilter;
                } catch {
                    return false;
                }
            });
        }
        
        filtered.sort((a, b) => {
            let comparison = 0;
            
            switch (sortBy) {
                case 'date':
                    const dateA = a?.payment_date ? new Date(a.payment_date).getTime() : 0;
                    const dateB = b?.payment_date ? new Date(b.payment_date).getTime() : 0;
                    comparison = dateA - dateB;
                    break;
                case 'amount':
                    const amountA = a?.total_amount || 0;
                    const amountB = b?.total_amount || 0;
                    comparison = amountA - amountB;
                    break;
                case 'status':
                    comparison = (a?.status || '').localeCompare(b?.status || '');
                    break;
            }
            
            return sortOrder === 'asc' ? comparison : -comparison;
        });
        
        return filtered;
    }, [allPayments, statusFilter, searchQuery, paymentMethodFilter, yearFilter, sortBy, sortOrder]);
    
    // Pagination
    const itemsPerPage = 15;
    const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
    const paginatedPayments = useMemo(() => {
        if (!filteredPayments || filteredPayments.length === 0) {
            return [];
        }
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredPayments.slice(start, end);
    }, [filteredPayments, currentPage]);
    
    // Reset to first page when filters change
    const handleFilterChange = (filterType: string, value: string) => {
        setCurrentPage(1);
        
        switch (filterType) {
            case 'status':
                setStatusFilter(value);
                break;
            case 'search':
                setSearchQuery(value);
                break;
            case 'paymentMethod':
                setPaymentMethodFilter(value);
                break;
            case 'year':
                setYearFilter(value);
                break;
        }
        
        setSelectedPayments([]);
        setSelectMode(false);
    };
    
    const hasActiveFilters = statusFilter !== 'all' || 
                            searchQuery !== '' || 
                            paymentMethodFilter !== 'all' || 
                            yearFilter !== 'all';
    
    const clearFilters = () => {
        setStatusFilter('all');
        setSearchQuery('');
        setPaymentMethodFilter('all');
        setYearFilter('all');
        setCurrentPage(1);
        
        if (isMobile) setShowMobileFilters(false);
        setSelectedPayments([]);
        setSelectMode(false);
    };
    
    const handleTabChange = (tab: string) => {
        handleFilterChange('status', tab);
        if (isMobile) setShowMobileFilters(false);
    };
    
    const toggleSelectPayment = (id: number) => {
        setSelectedPayments(prev =>
            prev.includes(id)
                ? prev.filter(paymentId => paymentId !== id)
                : [...prev, id]
        );
    };
    
    const selectAllPayments = () => {
        if (selectedPayments.length === paginatedPayments.length && paginatedPayments.length > 0) {
            setSelectedPayments([]);
        } else {
            setSelectedPayments(paginatedPayments.map(p => p?.id).filter(id => id));
        }
    };
    
    const toggleSelectMode = () => {
        if (selectMode) {
            setSelectMode(false);
            setSelectedPayments([]);
        } else {
            setSelectMode(true);
        }
    };
    
    // Calculate status counts from filtered data with safety
    const getStatusCountForTab = (status: string): number => {
        if (!filteredPayments || !Array.isArray(filteredPayments)) return 0;
        if (status === 'all') return filteredPayments.length;
        return filteredPayments.filter(payment => payment?.status === status).length;
    };
    
    const handlePrintPayments = () => {
        if (filteredPayments.length === 0) {
            toast.error('No payments to print');
            return;
        }
        printPaymentsList(
            filteredPayments, 
            statusFilter, 
            stats,             
            formatDate, 
            formatCurrency
        );
    };
    
    const handleExportCSV = () => {
        if (filteredPayments.length === 0) {
            toast.error('No payments to export');
            return;
        }
        exportToCSV(filteredPayments, statusFilter, formatDate, setIsExporting, toast);
    };
    
    const handleCopyOrNumber = (orNumber: string) => {
        if (!orNumber) return;
        navigator.clipboard.writeText(orNumber);
        toast.success(`Copied: ${orNumber}`);
    };
    
    const handleCopyReference = (ref: string) => {
        if (!ref) return;
        navigator.clipboard.writeText(ref);
        toast.success(`Copied: ${ref}`);
    };
    
    const handleViewDetails = (id: number) => {
        if (id) {
            window.location.href = `/portal/payments/${id}`;
        }
    };
    
    const handleDownloadReceipt = (payment: Payment) => {
        if (!payment) return;
        toast.info(`Receipt download for ${payment.or_number} would be implemented here`);
    };
    
    const handleGenerateReceipt = (payment: Payment) => {
        if (!payment) return;
        const reportWindow = window.open('', '_blank');
        if (reportWindow) {
            reportWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Payment Receipt - ${payment.or_number}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 40px; }
                        .receipt { max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .amount { font-size: 24px; font-weight: bold; color: #059669; }
                        .status { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; }
                        .status-paid { background: #d1fae5; color: #065f46; }
                        .status-pending { background: #fef3c7; color: #92400e; }
                        .status-overdue { background: #fee2e2; color: #991b1b; }
                    </style>
                </head>
                <body>
                    <div class="receipt">
                        <div class="header">
                            <h1>Barangay Payment Receipt</h1>
                            <p>Official Receipt #: ${payment.or_number}</p>
                        </div>
                        <div>
                            <p><strong>Purpose:</strong> ${payment.purpose || 'N/A'}</p>
                            <p><strong>Amount:</strong> <span class="amount">${formatCurrency(payment.total_amount)}</span></p>
                            <p><strong>Status:</strong> <span class="status status-${payment.status}">${payment.status?.toUpperCase() || 'PENDING'}</span></p>
                            <p><strong>Payment Date:</strong> ${formatDate(payment.payment_date)}</p>
                            ${payment.reference_number ? `<p><strong>Reference #:</strong> ${payment.reference_number}</p>` : ''}
                        </div>
                        <hr />
                        <p style="text-align: center; font-size: 12px; color: #666;">
                            Generated from Barangay Management System
                        </p>
                    </div>
                </body>
                </html>
            `);
            reportWindow.document.close();
            reportWindow.print();
        }
    };
    
    const tabHasData = paginatedPayments && paginatedPayments.length > 0;
    
    if (!hasProfile) {
        return (
            <ResidentLayout
                breadcrumbs={[
                    { title: 'Dashboard', href: '/portal/dashboard' },
                    { title: 'My Payments', href: '/portal/payments' }
                ]}
            >
                <Head title="My Payments" />
                <div className="min-h-[50vh] flex items-center justify-center px-4">
                    <Card className="w-full max-w-md border-0 shadow-xl bg-white dark:bg-gray-900">
                        <CardContent className="pt-6 text-center">
                            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 rounded-2xl flex items-center justify-center mb-4">
                                <AlertCircle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Complete Your Profile</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                You need to complete your resident profile before you can view payments.
                            </p>
                            <Link href="/resident/profile/create">
                                <Button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                                    Complete Profile
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </ResidentLayout>
        );
    }
    
    if (props.error) {
        return (
            <ResidentLayout
                breadcrumbs={[
                    { title: 'Dashboard', href: '/portal/dashboard' },
                    { title: 'My Payments', href: '/portal/payments' }
                ]}
            >
                <Head title="My Payments" />
                <div className="space-y-6">
                    <DesktopHeader title="My Payments" description="View and manage your barangay payments" />
                    <ErrorState 
                        message={props.error} 
                        onGoHome={() => window.location.href = '/dashboard'} 
                    />
                </div>
            </ResidentLayout>
        );
    }
    
    return (
        <>
            <Head title="My Payments" />
            
            <ResidentLayout
                breadcrumbs={[
                    { title: 'Dashboard', href: '/portal/dashboard' },
                    { title: 'My Payments', href: '/portal/payments' }
                ]}
            >
                <div className="space-y-4 md:space-y-6 pb-20 md:pb-6">
                    {isMobile ? (
                        <MobileHeader
                            title="My Payments"
                            subtitle={`${filteredPayments.length} payment${filteredPayments.length !== 1 ? 's' : ''} total`}
                            showStats={showStats}
                            onToggleStats={() => setShowStats(!showStats)}
                            onOpenFilters={() => setShowMobileFilters(true)}
                            hasActiveFilters={hasActiveFilters}
                        />
                    ) : (
                        <DesktopHeader
                            title="My Payments"
                            description="View and manage your barangay payments"
                            actions={
                                <ActionButtons
                                    onPrint={handlePrintPayments}
                                    onExport={handleExportCSV}
                                    isExporting={isExporting}
                                />
                            }
                        />
                    )}
                    
                    {showStats && stats && (
                        <div className="animate-slide-down">
                            <ModernStatsCards cards={getPaymentStatsCards(stats, formatCurrency)} loading={loading} />
                        </div>
                    )}
                    
                    {!isMobile && (
                        <ModernPaymentFilters
                            search={searchQuery}
                            setSearch={(value) => handleFilterChange('search', value)}
                            handleSearchSubmit={(e) => { e.preventDefault(); }}
                            handleSearchClear={() => handleFilterChange('search', '')}
                            paymentMethodFilter={paymentMethodFilter}
                            handlePaymentMethodChange={(method) => handleFilterChange('paymentMethod', method)}
                            yearFilter={yearFilter}
                            handleYearChange={(year) => handleFilterChange('year', year)}
                            loading={loading}
                            availablePaymentMethods={availablePaymentMethods}
                            availableYears={availableYears}
                            printPayments={handlePrintPayments}
                            exportToCSV={handleExportCSV}
                            isExporting={isExporting}
                            hasActiveFilters={hasActiveFilters}
                            handleClearFilters={clearFilters}
                            onCopySummary={() => {
                                const summary = `Payments Summary:\n` +
                                    `Total: ${filteredPayments.length}\n` +
                                    `Paid: ${formatCurrency(stats.total_paid)}\n` +
                                    `Balance: ${formatCurrency(stats.balance_due)}`;
                                navigator.clipboard.writeText(summary);
                                toast.success('Summary copied');
                            }}
                        />
                    )}
                    
                    <div className="mt-4">
                        <PaymentTabs 
                            statusFilter={statusFilter}
                            handleTabChange={handleTabChange}
                            getStatusCount={getStatusCountForTab}
                            tabsConfig={PAYMENT_TABS_CONFIG}
                        />
                        
                        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 mt-4">
                            <CardContent className="p-4 md:p-6">
                                {selectMode && tabHasData && (
                                    <ModernSelectionBanner
                                        selectedCount={selectedPayments.length}
                                        totalCount={paginatedPayments.length}
                                        onSelectAll={selectAllPayments}
                                        onDeselectAll={() => setSelectedPayments([])}
                                        onCancel={toggleSelectMode}
                                        onDelete={() => {
                                            toast.success(`Deleted ${selectedPayments.length} payments`);
                                            setSelectedPayments([]);
                                            setSelectMode(false);
                                        }}
                                        deleteLabel="Delete Selected"
                                    />
                                )}
                                
                                <ModernCardHeader
                                    title={`${statusFilter === 'all' ? 'All' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Payments`}
                                    description={tabHasData 
                                        ? `Showing ${paginatedPayments.length} of ${filteredPayments.length} payment${filteredPayments.length !== 1 ? 's' : ''}`
                                        : `No ${statusFilter === 'all' ? 'payments' : statusFilter.replace('_', ' ')} found`
                                    }
                                    action={
                                        <div className="flex items-center gap-2">
                                            <SortDropdown
                                                sortBy={sortBy}
                                                sortOrder={sortOrder}
                                                onSort={(by, order) => {
                                                    setSortBy(by as 'date' | 'amount' | 'status');
                                                    setSortOrder(order);
                                                    setCurrentPage(1);
                                                }}
                                            />
                                            {!selectMode && tabHasData && (
                                                <ViewToggle
                                                    viewMode={viewMode}
                                                    onViewChange={setViewMode}
                                                    disabled={false}
                                                />
                                            )}
                                            {tabHasData && (
                                                <SelectModeButton
                                                    isActive={selectMode}
                                                    onToggle={toggleSelectMode}
                                                />
                                            )}
                                        </div>
                                    }
                                />
                                
                                {!tabHasData ? (
                                    <ModernEmptyState 
                                        status={statusFilter} 
                                        hasFilters={hasActiveFilters}
                                        onClearFilters={clearFilters}
                                    />
                                ) : (
                                    // Mobile-specific rendering
                                    isMobile ? (
                                        viewMode === 'grid' ? (
                                            <ModernPaymentGridView
                                                payments={paginatedPayments}
                                                selectMode={selectMode}
                                                selectedPayments={selectedPayments}
                                                onSelectPayment={toggleSelectPayment}
                                                formatDate={(date) => formatDate(date, true)}
                                                formatCurrency={formatCurrency}
                                                onViewDetails={handleViewDetails}
                                                onDownloadReceipt={handleDownloadReceipt}
                                                onCopyOrNumber={handleCopyOrNumber}
                                                onCopyReference={handleCopyReference}
                                                onGenerateReceipt={handleGenerateReceipt}
                                                isMobile={true}
                                            />
                                        ) : (
                                            <ModernPaymentMobileListView
                                                payments={paginatedPayments}
                                                selectMode={selectMode}
                                                selectedPayments={selectedPayments}
                                                onSelectPayment={toggleSelectPayment}
                                                formatDate={(date) => formatDate(date, true)}
                                                formatCurrency={formatCurrency}
                                                onViewDetails={handleViewDetails}
                                                onDownloadReceipt={handleDownloadReceipt}
                                                onCopyOrNumber={handleCopyOrNumber}
                                                onCopyReference={handleCopyReference}
                                                onGenerateReceipt={handleGenerateReceipt}
                                            />
                                        )
                                    ) : (
                                        // Desktop rendering
                                        viewMode === 'grid' ? (
                                            <ModernPaymentGridView
                                                payments={paginatedPayments}
                                                selectMode={selectMode}
                                                selectedPayments={selectedPayments}
                                                onSelectPayment={toggleSelectPayment}
                                                formatDate={(date) => formatDate(date, false)}
                                                formatCurrency={formatCurrency}
                                                onViewDetails={handleViewDetails}
                                                onDownloadReceipt={handleDownloadReceipt}
                                                onCopyOrNumber={handleCopyOrNumber}
                                                onCopyReference={handleCopyReference}
                                                onGenerateReceipt={handleGenerateReceipt}
                                                isMobile={false}
                                            />
                                        ) : (
                                            <ModernPaymentListView
                                                payments={paginatedPayments}
                                                selectMode={selectMode}
                                                selectedPayments={selectedPayments}
                                                onSelectPayment={toggleSelectPayment}
                                                onSelectAll={selectAllPayments}
                                                formatDate={(date) => formatDate(date, false)}
                                                formatCurrency={formatCurrency}
                                                onViewDetails={handleViewDetails}
                                                onDownloadReceipt={handleDownloadReceipt}
                                                onCopyOrNumber={handleCopyOrNumber}
                                                onCopyReference={handleCopyReference}
                                                onGenerateReceipt={handleGenerateReceipt}
                                            />
                                        )
                                    )
                                )}
                                
                                {totalPages > 1 && (
                                    <div className="mt-6">
                                        <ModernPagination
                                            currentPage={currentPage}
                                            lastPage={totalPages}
                                            onPageChange={(page: number) => setCurrentPage(page)}
                                            loading={loading}
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
                
                {/* Mobile Filter Modal */}
                <ModernFilterModal
                    isOpen={showMobileFilters}
                    onClose={() => setShowMobileFilters(false)}
                    title="Filter Payments"
                    description={hasActiveFilters ? 'Filters are currently active' : 'No filters applied'}
                    search={searchQuery}
                    onSearchChange={(value) => setSearchQuery(value)}
                    onSearchSubmit={(e) => { 
                        e.preventDefault(); 
                        handleFilterChange('search', searchQuery);
                        setShowMobileFilters(false);
                    }}
                    onSearchClear={() => handleFilterChange('search', '')}
                    loading={loading}
                    hasActiveFilters={hasActiveFilters}
                    onClearFilters={clearFilters}
                >
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Payment Method
                            </label>
                            <ModernSelect
                                value={paymentMethodFilter}
                                onValueChange={(value) => handleFilterChange('paymentMethod', value)}
                                placeholder="All payment methods"
                                options={[
                                    { value: 'all', label: 'All payment methods' },
                                    ...availablePaymentMethods.map(method => ({
                                        value: method.type,
                                        label: method.display_name
                                    }))
                                ]}
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Year
                            </label>
                            <ModernSelect
                                value={yearFilter}
                                onValueChange={(value) => handleFilterChange('year', value)}
                                placeholder="All years"
                                options={[
                                    { value: 'all', label: 'All years' },
                                    ...availableYears.map(year => ({
                                        value: year.toString(),
                                        label: year.toString()
                                    }))
                                ]}
                                disabled={loading}
                                icon={Calendar}
                            />
                        </div>
                    </div>
                </ModernFilterModal>
                
                {/* Loading Overlay */}
                <ModernLoadingOverlay loading={loading} message="Loading payments..." />
            </ResidentLayout>
        </>
    );
}