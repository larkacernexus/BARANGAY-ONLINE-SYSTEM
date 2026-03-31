// pages/portal/resident/my-payments.tsx
import { useState, useEffect, useMemo, useRef } from 'react';
import ResidentLayout from '@/layouts/resident-app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, usePage, router, Head } from '@inertiajs/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
    Plus, 
    ChevronUp, 
    ChevronDown, 
    Filter, 
    Square, 
    Grid, 
    List, 
    ArrowUpDown,
    Calendar,
    DollarSign,
    Info,
    Receipt,
    AlertCircle,
    User
} from 'lucide-react';

// Import reusable components
import { StatusBadge } from '@/components/residentui/StatusBadge';
import { CustomTabs } from '@/components/residentui/CustomTabs';
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
import { ModernPaymentFilters } from '@/components/residentui/payments/modern-payment-filters';

// Import payment utilities and types
import {
    Payment,
    PaymentsPaginatedResponse,
    PaymentStats,
    PaymentMethodType,
    PaymentFilters,
    ViewMode
} from '@/types/portal/payments/payment.types';
import {
    formatDate,
    formatCurrency,
    getStatusCount,
    printPaymentsList,
    exportToCSV,
    getPaymentMethodDisplay,
    getPaymentStatusColor,
    getPaymentStatusLabel
} from '@/components/residentui/payments/payment-utils';
import { getPaymentStatsCards } from '@/components/residentui/payments/constants';
import { SelectModeButton } from '@/components/residentui/modern/select-mode-button';

// Define PageProps with proper types
interface PageProps extends Record<string, any> {
    payments?: PaymentsPaginatedResponse;
    stats?: PaymentStats;
    availableYears?: number[];
    availablePaymentMethods?: PaymentMethodType[];
    currentResident?: {
        id: number;
        first_name: string;
        last_name: string;
    };
    hasProfile?: boolean;
    filters?: PaymentFilters;
    error?: string;
}

export default function MyPayments() {
    const page = usePage<PageProps>();
    const pageProps = page.props;
    
    const payments = pageProps.payments || {
        data: [],
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
        from: 0,
        to: 0,
        links: [],
    };
    
    const stats = pageProps.stats || {
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
    
    const availableYears = pageProps.availableYears || [];
    const availablePaymentMethods = pageProps.availablePaymentMethods || [];
    const currentResident = pageProps.currentResident || { id: 0, first_name: '', last_name: '' };
    const hasProfile = pageProps.hasProfile || false;
    const filters = pageProps.filters || {};
    
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
    const [yearFilter, setYearFilter] = useState('all');
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
    
    const hasInitialized = useRef(false);
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);
    
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
    
    // Initialize filters from props
    useEffect(() => {
        if (!hasInitialized.current) {
            setSearch(filters.search || '');
            setStatusFilter(filters.status || 'all');
            setPaymentMethodFilter(filters.payment_method || 'all');
            setYearFilter(filters.year || 'all');
            hasInitialized.current = true;
        }
    }, [filters]);
    
    // Search debounce
    useEffect(() => {
        if (!hasInitialized.current) return;
        if (search === '' && !filters.search) return;
        if (search === filters.search) return;
        
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }
        
        searchTimeout.current = setTimeout(() => {
            updateFilters({ 
                search: search.trim(),
                page: '1'
            });
        }, 800);
        
        return () => {
            if (searchTimeout.current) {
                clearTimeout(searchTimeout.current);
            }
        };
    }, [search]);
    
    const updateFilters = (newFilters: Record<string, string>) => {
        setLoading(true);
        
        const updatedFilters = {
            ...filters,
            ...newFilters,
        };
        
        const cleanFilters: Record<string, string> = {};
        
        Object.entries(updatedFilters).forEach(([key, value]) => {
            if (key === 'page' && value === '1') return;
            if (value && value !== '' && value !== 'all' && value !== undefined) {
                cleanFilters[key] = value;
            }
        });
        
        router.get('/portal/payments', cleanFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onFinish: () => setLoading(false),
        });
    };
    
    const handleTabChange = (tab: string) => {
        setStatusFilter(tab);
        
        if (tab === 'all') {
            updateFilters({ 
                status: '',
                page: '1'
            });
        } else {
            updateFilters({ 
                status: tab,
                page: '1'
            });
        }
        
        if (isMobile) setShowMobileFilters(false);
        // Clear selection when changing tabs
        setSelectedPayments([]);
        setSelectMode(false);
    };
    
    const handlePaymentMethodChange = (method: string) => {
        setPaymentMethodFilter(method);
        updateFilters({ 
            payment_method: method === 'all' ? '' : method,
            page: '1'
        });
        if (isMobile) setShowMobileFilters(false);
        setSelectedPayments([]);
        setSelectMode(false);
    };
    
    const handleYearChange = (year: string) => {
        setYearFilter(year);
        updateFilters({ 
            year: year === 'all' ? '' : year,
            page: '1'
        });
        if (isMobile) setShowMobileFilters(false);
        setSelectedPayments([]);
        setSelectMode(false);
    };
    
    const handleClearFilters = () => {
        setSearch('');
        setStatusFilter('all');
        setPaymentMethodFilter('all');
        setYearFilter('all');
        
        router.get('/portal/payments', {}, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setLoading(false),
        });
        
        if (isMobile) setShowMobileFilters(false);
        setSelectedPayments([]);
        setSelectMode(false);
    };
    
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }
        updateFilters({ 
            search: search.trim(),
            page: '1'
        });
    };
    
    const handleSearchClear = () => {
        setSearch('');
        updateFilters({ 
            search: '',
            page: '1'
        });
    };
    
    const toggleSelectPayment = (id: number) => {
        setSelectedPayments(prev =>
            prev.includes(id)
                ? prev.filter(paymentId => paymentId !== id)
                : [...prev, id]
        );
    };
    
    const selectAllPayments = () => {
        const currentPayments = payments.data;
        if (selectedPayments.length === currentPayments.length && currentPayments.length > 0) {
            setSelectedPayments([]);
        } else {
            setSelectedPayments(currentPayments.map(p => p.id));
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
    
    const getCurrentTabPayments = () => {
        return payments.data;
    };
    
    const hasActiveFilters = useMemo(() => {
        return Object.entries(filters).some(([key, value]) => 
            key !== 'page' && value && value !== '' && value !== 'all'
        );
    }, [filters]);
    
  const handlePrintPayments = () => {
    const currentPayments = getCurrentTabPayments();
    printPaymentsList(
        currentPayments, 
        statusFilter, 
        stats,             
        formatDate, 
        formatCurrency
    );
};
    
    const handleExportCSV = () => {
        const currentPayments = getCurrentTabPayments();
        exportToCSV(currentPayments, statusFilter, formatDate, setIsExporting, toast);
    };
    
    const handleCopyOrNumber = (orNumber: string) => {
        navigator.clipboard.writeText(orNumber);
        toast.success(`Copied: ${orNumber}`);
    };
    
    const handleCopyReference = (ref: string) => {
        navigator.clipboard.writeText(ref);
        toast.success(`Copied: ${ref}`);
    };
    
    const handleViewDetails = (id: number) => {
        router.visit(`/portal/payments/${id}`);
    };
    
    const handleMakePayment = (id: number) => {
        router.visit(`/portal/payments/create?payment_id=${id}`);
    };
    
    const handleDownloadReceipt = (payment: Payment) => {
        toast.info('Receipt download would be implemented here');
    };
    
    const handleGenerateReceipt = (payment: Payment) => {
        const reportWindow = window.open('', '_blank');
        if (reportWindow) {
            reportWindow.document.write(`
                <h1>Payment Receipt: ${payment.or_number}</h1>
                <p><strong>Purpose:</strong> ${payment.purpose}</p>
                <p><strong>Amount:</strong> ${formatCurrency(payment.total_amount)}</p>
                <p><strong>Status:</strong> ${payment.status}</p>
            `);
        }
    };
    
    const renderTabContent = () => {
        const currentPayments = getCurrentTabPayments();
        const tabHasData = currentPayments.length > 0;
        
        return (
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
                <CardContent className="p-4 md:p-6">
                    {/* Selection Mode Banner */}
                    {selectMode && tabHasData && (
                        <ModernSelectionBanner
                            selectedCount={selectedPayments.length}
                            totalCount={currentPayments.length}
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
                    
                    {/* Header with Sort */}
                    <ModernCardHeader
                        title={`${statusFilter === 'all' ? 'All' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Payments`}
                        description={tabHasData 
                            ? `Showing ${currentPayments.length} payment${currentPayments.length !== 1 ? 's' : ''}`
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
                                    }}
                                />
                                {!selectMode && tabHasData && (
                                    <ViewToggle
                                        viewMode={viewMode}
                                        onViewChange={setViewMode}
                                        disabled={isMobile}
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
                            onClearFilters={handleClearFilters}
                        />
                    ) : viewMode === 'grid' ? (
                        <ModernPaymentGridView
                            payments={currentPayments}
                            selectMode={selectMode}
                            selectedPayments={selectedPayments}
                            onSelectPayment={toggleSelectPayment}
                            formatDate={(date) => formatDate(date, isMobile)}
                            formatCurrency={formatCurrency}
                            onViewDetails={handleViewDetails}
                            onMakePayment={handleMakePayment}
                            onDownloadReceipt={handleDownloadReceipt}
                            onCopyOrNumber={handleCopyOrNumber}
                            onCopyReference={handleCopyReference}
                            onGenerateReceipt={handleGenerateReceipt}
                            isMobile={isMobile}
                        />
                    ) : (
                        <ModernPaymentListView
                            payments={currentPayments}
                            selectMode={selectMode}
                            selectedPayments={selectedPayments}
                            onSelectPayment={toggleSelectPayment}
                            onSelectAll={selectAllPayments}
                            formatDate={(date) => formatDate(date, isMobile)}
                            formatCurrency={formatCurrency}
                            onViewDetails={handleViewDetails}
                            onMakePayment={handleMakePayment}
                            onDownloadReceipt={handleDownloadReceipt}
                            onCopyOrNumber={handleCopyOrNumber}
                            onCopyReference={handleCopyReference}
                            onGenerateReceipt={handleGenerateReceipt}
                        />
                    )}
                    
                    {/* Pagination */}
                    {payments.last_page > 1 && (
                        <div className="mt-6">
                            <ModernPagination
                                currentPage={payments.current_page}
                                lastPage={payments.last_page}
                                onPageChange={(page) => updateFilters({ page: page.toString() })}
                                loading={loading}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    };
    
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
    
    if (pageProps.error) {
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
                        message={pageProps.error} 
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
                            subtitle={`${stats.total_payments} payment${stats.total_payments !== 1 ? 's' : ''} total`}
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
                    
                    {showStats && (
                        <div className="animate-slide-down">
                            <ModernStatsCards cards={getPaymentStatsCards(stats, formatCurrency)} loading={loading} />

                        </div>
                    )}
                    
                    {!isMobile && (
                        <ModernPaymentFilters
                            search={search}
                            setSearch={setSearch}
                            handleSearchSubmit={handleSearchSubmit}
                            handleSearchClear={handleSearchClear}
                            paymentMethodFilter={paymentMethodFilter}
                            handlePaymentMethodChange={handlePaymentMethodChange}
                            yearFilter={yearFilter}
                            handleYearChange={handleYearChange}
                            loading={loading}
                            availablePaymentMethods={availablePaymentMethods}
                            availableYears={availableYears}
                            printPayments={handlePrintPayments}
                            exportToCSV={handleExportCSV}
                            isExporting={isExporting}
                            hasActiveFilters={hasActiveFilters}
                            handleClearFilters={handleClearFilters}
                            onCopySummary={() => {
                                const summary = `Payments Summary:\n` +
                                    `Total: ${stats.total_payments}\n` +
                                    `Paid: ${formatCurrency(stats.total_paid)}\n` +
                                    `Balance: ${formatCurrency(stats.balance_due)}`;
                                navigator.clipboard.writeText(summary);
                                toast.success('Summary copied');
                            }}
                        />
                    )}
                    
                    <div className="mt-4">
                        <CustomTabs 
                            statusFilter={statusFilter}
                            handleTabChange={handleTabChange}
                            getStatusCount={(status) => getStatusCount(stats, status, payments.data)}
                        />
                        
                        <div className="mt-4">
                            {renderTabContent()}
                        </div>
                    </div>
                </div>
                
                {/* Mobile FAB */}
                {isMobile && (
                    <div className="fixed bottom-6 right-6 z-50 safe-bottom animate-scale-in">
                        <Link href="/portal/payments/create">
                            <Button 
                                size="lg" 
                                className="rounded-full h-14 w-14 shadow-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                            >
                                <Plus className="h-6 w-6" />
                            </Button>
                        </Link>
                    </div>
                )}
                
                {/* Mobile Filter Modal */}
                <ModernFilterModal
                    isOpen={showMobileFilters}
                    onClose={() => setShowMobileFilters(false)}
                    title="Filter Payments"
                    description={hasActiveFilters ? 'Filters are currently active' : 'No filters applied'}
                    search={search}
                    onSearchChange={setSearch}
                    onSearchSubmit={handleSearchSubmit}
                    onSearchClear={handleSearchClear}
                    loading={loading}
                    hasActiveFilters={hasActiveFilters}
                    onClearFilters={handleClearFilters}
                >
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Payment Method
                        </label>
                        <ModernSelect
                            value={paymentMethodFilter}
                            onValueChange={handlePaymentMethodChange}
                            placeholder="All payment methods"
                            options={availablePaymentMethods.map(method => ({
                                value: method.type,
                                label: method.display_name
                            }))}
                            disabled={loading}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Year
                        </label>
                        <ModernSelect
                            value={yearFilter}
                            onValueChange={handleYearChange}
                            placeholder="All years"
                            options={availableYears.map(year => ({
                                value: year.toString(),
                                label: year.toString()
                            }))}
                            disabled={loading}
                            icon={Calendar}
                        />
                    </div>
                </ModernFilterModal>
                
                {/* Loading Overlay */}
                <ModernLoadingOverlay loading={loading} message="Loading payments..." />
            </ResidentLayout>
        </>
    );
}