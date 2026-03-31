// pages/resident/Receipts/Index.tsx (Fixed version)

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import ResidentLayout from '@/layouts/resident-app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { ModernCardHeader } from '@/components/residentui/modern/card-header';
import { ViewToggle } from '@/components/residentui/modern/view-toggle';
import { SortDropdown } from '@/components/residentui/modern/sort-dropdown';
import { SelectModeButton } from '@/components/residentui/modern/select-mode-button';
import { ActionButtons } from '@/components/residentui/modern/action-buttons';
import { MobileHeader } from '@/components/residentui/modern/mobile-header';
import { DesktopHeader } from '@/components/residentui/modern/desktop-header';
import { ErrorState } from '@/components/residentui/modern/error-state';
import { ModernEmptyState } from '@/components/residentui/modern-empty-state';
import { ModernPagination } from '@/components/residentui/modern-pagination';
import { ModernLoadingOverlay } from '@/components/residentui/modern-loading-overlay';
import { ModernSelectionBanner } from '@/components/residentui/modern-selection-banner';
import { ModernFilterModal } from '@/components/residentui/modern-filter-modal';
import { ModernSelect } from '@/components/residentui/modern-select';
import { CustomTabs } from '@/components/residentui/CustomTabs';
import { ModernReceiptGridView } from '@/components/residentui/receipts/modern-receipt-grid-view';
import { ModernReceiptListView } from '@/components/residentui/receipts/modern-receipt-list-view';
import { ReceiptStatsCards } from '@/components/residentui/receipts/receipt-stats-cards';
import { ModernReceiptFilters } from '@/components/residentui/receipts/modern-receipt-filters';
import { useMobile } from '@/components/residentui/hooks/use-mobile';
import { Receipt, DollarSign, List, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { 
    ReceiptItem, 
    ReceiptStats, 
    ReceiptFilters,
    HouseholdData
} from '@/types/portal/receipts/receipt.types';

// Helper functions
const formatCurrency = (amount: string | number): string => {
    if (typeof amount === 'string') return amount;
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
    }).format(amount);
};

const formatDate = (date: string | null, isMobile: boolean = false): string => {
    if (!date) return '—';
    try {
        const dateObj = new Date(date);
        if (isMobile) {
            return dateObj.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
        }
        return dateObj.toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' });
    } catch {
        return date;
    }
};

const getReceiptStatusCount = (stats: ReceiptStats, status: string): number => {
    if (!stats) return 0;
    switch (status) {
        case 'all': return stats.total_count || 0;
        case 'paid': return stats.paid_count || 0;
        case 'partial': return stats.partial_count || 0;
        case 'pending': return stats.pending_count || 0;
        case 'cancelled': return stats.cancelled_count || 0;
        default: return 0;
    }
};

interface PageProps extends Record<string, any> {
    receipts?: {
        data: ReceiptItem[];
        current_page: number;
        last_page: number;
        total: number;
        from: number;
        to: number;
        per_page: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    stats?: ReceiptStats;
    household?: HouseholdData;
    receiptTypes?: Array<{ value: string; label: string }>;
    paymentMethods?: Array<{ value: string; label: string }>;
    filters?: ReceiptFilters;
    error?: string;
}

// Define tabs configuration for CustomTabs
const RECEIPT_TABS_CONFIG = [
    { id: 'all', label: 'All Receipts', icon: List },
    { id: 'paid', label: 'Paid', icon: CheckCircle },
    { id: 'partial', label: 'Partial', icon: Clock },
    { id: 'pending', label: 'Pending', icon: AlertCircle },
    { id: 'cancelled', label: 'Cancelled', icon: XCircle },
];

export default function ReceiptsIndex() {
    const page = usePage<PageProps>();
    const { props } = page;
    
    const receipts = props.receipts || { 
        data: [], 
        current_page: 1, 
        last_page: 1, 
        total: 0, 
        from: 0, 
        to: 0, 
        per_page: 15,
        links: [] 
    };
    
    const stats = props.stats || { 
        total_count: 0, 
        total_amount: '₱0.00', 
        total_amount_raw: 0, 
        this_month_count: 0, 
        this_month_amount: '₱0.00', 
        this_month_amount_raw: 0, 
        latest_receipt: null, 
        clearance_count: 0, 
        fee_count: 0, 
        official_count: 0, 
        paid_count: 0, 
        pending_count: 0, 
        partial_count: 0, 
        cancelled_count: 0 
    };
    
    const household = props.household || { 
        id: 0, 
        household_number: '', 
        head_name: '', 
        address: '', 
        contact_number: null, 
        email: null, 
        member_count: 0, 
        has_user_account: false 
    };
    
    const receiptTypes = props.receiptTypes || [];
    const paymentMethods = props.paymentMethods || [];
    
    const isMobile = useMobile();
    const [showStats, setShowStats] = useState(true);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>(isMobile ? 'grid' : 'grid');
    const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [statusFilter, setStatusFilter] = useState('all');
    
    // Filter state
    const [search, setSearch] = useState(props.filters?.search || '');
    const [dateFrom, setDateFrom] = useState(props.filters?.date_from || '');
    const [dateTo, setDateTo] = useState(props.filters?.date_to || '');
    const [receiptTypeFilter, setReceiptTypeFilter] = useState(props.filters?.receipt_type || 'all');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState(props.filters?.payment_method || 'all');
    
    const [loading, setLoading] = useState(false);
    const [selectedReceipts, setSelectedReceipts] = useState<ReceiptItem[]>([]);
    const [selectMode, setSelectMode] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);
    
    // Selection handlers
    const toggleSelect = (receipt: ReceiptItem) => {
        setSelectedReceipts(prev => {
            const isSelected = prev.some(item => item.id === receipt.id);
            if (isSelected) {
                return prev.filter(item => item.id !== receipt.id);
            } else {
                return [...prev, receipt];
            }
        });
    };
    
    const selectAll = () => {
        setSelectedReceipts([...receipts.data]);
    };
    
    const clearSelection = () => {
        setSelectedReceipts([]);
    };
    
    const toggleSelectMode = () => {
        setSelectMode(prev => !prev);
        if (selectMode) {
            clearSelection();
        }
    };
    
    const selectedReceiptIds = selectedReceipts.map(receipt => receipt.id);
    
    // Filter update helper
    const updateFilters = useCallback((newFilters: Record<string, string>) => {
        setLoading(true);
        
        const updatedFilters = {
            search,
            date_from: dateFrom,
            date_to: dateTo,
            receipt_type: receiptTypeFilter === 'all' ? '' : receiptTypeFilter,
            payment_method: paymentMethodFilter === 'all' ? '' : paymentMethodFilter,
            status: statusFilter === 'all' ? '' : statusFilter,
            sort: `${sortBy}_${sortOrder}`,
            ...newFilters
        };
        
        const cleanFilters: Record<string, string> = {};
        Object.entries(updatedFilters).forEach(([key, value]) => {
            if (key === 'page' && value === '1') return;
            if (value && value !== '' && value !== 'all' && value !== undefined && value !== null) {
                cleanFilters[key] = value;
            }
        });
        
        router.get('/portal/receipts', cleanFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onFinish: () => setLoading(false),
        });
    }, [search, dateFrom, dateTo, receiptTypeFilter, paymentMethodFilter, statusFilter, sortBy, sortOrder]);
    
    // Debounced search
    useEffect(() => {
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            if (search !== props.filters?.search) {
                updateFilters({ search: search.trim(), page: '1' });
            }
        }, 800);
        return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
    }, [search, updateFilters, props.filters?.search]);
    
    // Handle filter changes
    const handleTabChange = (tab: string) => {
        setStatusFilter(tab);
        updateFilters({ status: tab === 'all' ? '' : tab, page: '1' });
        if (isMobile) setShowMobileFilters(false);
        clearSelection();
        setSelectMode(false);
    };
    
    const handleReceiptTypeChange = (type: string) => {
        setReceiptTypeFilter(type);
        updateFilters({ receipt_type: type === 'all' ? '' : type, page: '1' });
        if (isMobile) setShowMobileFilters(false);
        clearSelection();
        setSelectMode(false);
    };
    
    const handlePaymentMethodChange = (method: string) => {
        setPaymentMethodFilter(method);
        updateFilters({ payment_method: method === 'all' ? '' : method, page: '1' });
        if (isMobile) setShowMobileFilters(false);
        clearSelection();
        setSelectMode(false);
    };
    
    const handleDateFromChange = (date: string) => {
        setDateFrom(date);
        updateFilters({ date_from: date, page: '1' });
    };
    
    const handleDateToChange = (date: string) => {
        setDateTo(date);
        updateFilters({ date_to: date, page: '1' });
    };
    
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateFilters({ search: search.trim(), page: '1' });
    };
    
    const handleSearchClear = () => {
        setSearch('');
        updateFilters({ search: '', page: '1' });
    };
    
    const handleClearFilters = () => {
        setSearch('');
        setDateFrom('');
        setDateTo('');
        setReceiptTypeFilter('all');
        setStatusFilter('all');
        setPaymentMethodFilter('all');
        setSortBy('date');
        setSortOrder('desc');
        
        router.get('/portal/receipts', {}, { 
            preserveState: true, 
            preserveScroll: true, 
            onFinish: () => setLoading(false) 
        });
        
        if (isMobile) setShowMobileFilters(false);
        clearSelection();
        setSelectMode(false);
    };
    
    const handlePrintReceipts = () => {
        toast.info('Print functionality coming soon');
    };
    
    const handleExportToCSV = async () => {
        setIsExporting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Export successful');
        } catch (error) {
            toast.error('Export failed');
        } finally {
            setIsExporting(false);
        }
    };
    
    const handleCopyReceiptNumber = (code: string) => {
        navigator.clipboard.writeText(code);
        toast.success(`Copied: ${code}`);
    };
    
    const handleCopyORNNumber = (orNumber: string | null) => {
        if (orNumber) {
            navigator.clipboard.writeText(orNumber);
            toast.success(`Copied: ${orNumber}`);
        }
    };
    
    const handleViewReceipt = (id: number) => {
        router.get(`/portal/receipts/${id}`);
    };
    
    const handleDownloadReceipt = (id: number) => {
        window.open(`/portal/receipts/${id}/download`, '_blank');
    };
    
    const handlePrintReceipt = (id: number) => {
        window.open(`/portal/receipts/${id}/print`, '_blank');
    };
    
    const handleSelectReceipt = (receipt: ReceiptItem) => {
        toggleSelect(receipt);
    };
    
    const hasActiveFilters = useMemo(() => {
        return !!(search || dateFrom || dateTo || 
            receiptTypeFilter !== 'all' || 
            statusFilter !== 'all' || 
            paymentMethodFilter !== 'all');
    }, [search, dateFrom, dateTo, receiptTypeFilter, statusFilter, paymentMethodFilter]);
    
    // Error state
    if (props.error) {
        return (
            <ResidentLayout breadcrumbs={[
                { title: 'Dashboard', href: '/portal/dashboard' },
                { title: 'My Receipts', href: '/portal/receipts' }
            ]}>
                <Head title="My Receipts" />
                <div className="space-y-6">
                    <DesktopHeader title="My Receipts" description="View and download your payment receipts" />
                    <ErrorState 
                        message={props.error} 
                        onGoHome={() => window.location.href = '/portal/dashboard'} 
                    />
                </div>
            </ResidentLayout>
        );
    }
    
    const currentReceipts = receipts.data;
    const tabHasData = currentReceipts.length > 0;
    
    return (
        <>
            <Head title="My Receipts" />
            
            <ResidentLayout breadcrumbs={[
                { title: 'Dashboard', href: '/portal/dashboard' },
                { title: 'My Receipts', href: '/portal/receipts' }
            ]}>
                <div className="space-y-4 md:space-y-6 pb-20 md:pb-6">
                    {isMobile ? (
                        <MobileHeader
                            title="My Receipts"
                            subtitle={`${stats.total_count || 0} receipt${stats.total_count !== 1 ? 's' : ''} • ${household.household_number || ''}`}
                            showStats={showStats}
                            onToggleStats={() => setShowStats(!showStats)}
                            onOpenFilters={() => setShowMobileFilters(true)}
                            hasActiveFilters={hasActiveFilters}
                        />
                    ) : (
                        <DesktopHeader
                            title="My Receipts"
                            description="View and download your payment receipts"
                            actions={
                                <ActionButtons
                                    onPrint={handlePrintReceipts}
                                    onExport={handleExportToCSV}
                                    isExporting={isExporting}
                                />
                            }
                        />
                    )}
                    
                    {showStats && (
                        <div className="animate-slide-down">
                            <ReceiptStatsCards 
                                stats={stats}
                                loading={loading}
                                formatCurrency={formatCurrency}
                            />
                        </div>
                    )}
                    
                    {!isMobile && (
                        <ModernReceiptFilters
                            search={search}
                            setSearch={setSearch}
                            handleSearchSubmit={handleSearchSubmit}
                            handleSearchClear={handleSearchClear}
                            dateFrom={dateFrom}
                            setDateFrom={handleDateFromChange}
                            dateTo={dateTo}
                            setDateTo={handleDateToChange}
                            receiptTypeFilter={receiptTypeFilter}
                            handleReceiptTypeChange={handleReceiptTypeChange}
                            paymentMethodFilter={paymentMethodFilter}
                            handlePaymentMethodChange={handlePaymentMethodChange}
                            loading={loading}
                            receiptTypes={receiptTypes}
                            paymentMethods={paymentMethods}
                            hasActiveFilters={hasActiveFilters}
                            handleClearFilters={handleClearFilters}
                            onPrint={handlePrintReceipts}
                            onExport={handleExportToCSV}
                            isExporting={isExporting}
                        />
                    )}
                    
                    <div className="mt-4">
                        <CustomTabs 
                            statusFilter={statusFilter}
                            handleTabChange={handleTabChange}
                            getStatusCount={(status) => getReceiptStatusCount(stats, status)}
                            tabsConfig={RECEIPT_TABS_CONFIG}
                        />
                        
                        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
                            <CardContent className="p-4 md:p-6">
                                {selectMode && tabHasData && (
                                    <ModernSelectionBanner
                                        selectedCount={selectedReceipts.length}
                                        totalCount={currentReceipts.length}
                                        onSelectAll={selectAll}
                                        onDeselectAll={clearSelection}
                                        onCancel={toggleSelectMode}
                                        onDelete={() => {
                                            toast.error('Delete functionality is not available for receipts');
                                            clearSelection();
                                            setSelectMode(false);
                                        }}
                                        deleteLabel="Delete Selected"
                                    />
                                )}
                                
                                <ModernCardHeader
                                    title={`${statusFilter === 'all' ? 'All' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Receipts`}
                                    description={tabHasData 
                                        ? `Showing ${currentReceipts.length} receipt${currentReceipts.length !== 1 ? 's' : ''}`
                                        : `No ${statusFilter === 'all' ? 'receipts' : statusFilter} found`
                                    }
                                    action={
                                        <div className="flex items-center gap-2">
                                            <SortDropdown
                                                sortBy={sortBy}
                                                sortOrder={sortOrder}
                                                onSort={(by, order) => {
                                                    setSortBy(by as 'date' | 'amount');
                                                    setSortOrder(order);
                                                    updateFilters({ 
                                                        sort: `${by}_${order}`, 
                                                        page: '1' 
                                                    });
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
                                    <ModernReceiptGridView
                                        receipts={currentReceipts}
                                        selectMode={selectMode}
                                        selectedReceipts={selectedReceiptIds}
                                        onSelectReceipt={handleSelectReceipt}
                                        formatDate={(date: string | null) => formatDate(date, isMobile)}
                                        formatCurrency={formatCurrency}
                                        onView={handleViewReceipt}
                                        onDownload={handleDownloadReceipt}
                                        onPrint={handlePrintReceipt}
                                        onCopyReceiptNumber={handleCopyReceiptNumber}
                                        onCopyORNNumber={handleCopyORNNumber}
                                        isMobile={isMobile}
                                    />
                                ) : (
                                    <ModernReceiptListView
                                        receipts={currentReceipts}
                                        selectMode={selectMode}
                                        selectedReceipts={selectedReceiptIds}
                                        onSelectReceipt={handleSelectReceipt}
                                        onSelectAll={selectAll}
                                        formatDate={(date: string | null) => formatDate(date, isMobile)}
                                        formatCurrency={formatCurrency}
                                        onView={handleViewReceipt}
                                        onDownload={handleDownloadReceipt}
                                        onPrint={handlePrintReceipt}
                                        onCopyReceiptNumber={handleCopyReceiptNumber}
                                        onCopyORNNumber={handleCopyORNNumber}
                                    />
                                )}
                                
                                {receipts.last_page > 1 && (
                                    <div className="mt-6">
                                        <ModernPagination
                                            currentPage={receipts.current_page}
                                            lastPage={receipts.last_page}
                                            onPageChange={(page: number) => updateFilters({ page: page.toString() })}
                                            loading={loading}
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
                
                <ModernFilterModal
                    isOpen={showMobileFilters}
                    onClose={() => setShowMobileFilters(false)}
                    title="Filter Receipts"
                    description={hasActiveFilters ? 'Filters are currently active' : 'No filters applied'}
                    search={search}
                    onSearchChange={setSearch}
                    onSearchSubmit={(e: React.FormEvent) => { 
                        e.preventDefault(); 
                        updateFilters({ search: search.trim(), page: '1' }); 
                        setShowMobileFilters(false); 
                    }}
                    onSearchClear={() => setSearch('')}
                    loading={loading}
                    hasActiveFilters={hasActiveFilters}
                    onClearFilters={handleClearFilters}
                >
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date From</label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => handleDateFromChange(e.target.value)}
                                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date To</label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => handleDateToChange(e.target.value)}
                                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Receipt Type</label>
                            <ModernSelect
                                value={receiptTypeFilter}
                                onValueChange={handleReceiptTypeChange}
                                placeholder="All receipt types"
                                options={receiptTypes}
                                disabled={loading}
                                icon={Receipt}
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Payment Method</label>
                            <ModernSelect
                                value={paymentMethodFilter}
                                onValueChange={handlePaymentMethodChange}
                                placeholder="All payment methods"
                                options={paymentMethods}
                                disabled={loading}
                                icon={Receipt}
                            />
                        </div>
                    </div>
                </ModernFilterModal>
                
                <ModernLoadingOverlay loading={loading} message="Loading receipts..." />
            </ResidentLayout>
        </>
    );
}