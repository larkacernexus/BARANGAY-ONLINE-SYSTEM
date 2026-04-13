// pages/resident/Receipts/Index.tsx (Updated with receiptsData prop)

import { useState, useMemo } from 'react';
import { Head, usePage } from '@inertiajs/react';
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
import { ModernReceiptMobileListView } from '@/components/residentui/receipts/modern-receipt-mobile-list-view';
import { ModernStatsCards } from '@/components/residentui/modern-stats-cards';
import { CollapsibleStats } from '@/components/residentui/receipts/CollapsibleStats';
import { getReceiptStatsCards } from '@/components/residentui/receipts/constants';
import { ModernReceiptFilters } from '@/components/residentui/receipts/modern-receipt-filters';
import { useMobile } from '@/components/residentui/hooks/use-mobile';
import { Receipt, List, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { 
    ReceiptItem, 
    ReceiptStats,
    HouseholdData
} from '@/types/portal/receipts/receipt.types';

// Helper functions with safety checks
const formatCurrency = (amount: string | number | undefined | null): string => {
    if (amount === undefined || amount === null || amount === '') {
        return '₱0.00';
    }
    
    if (typeof amount === 'string' && amount.startsWith('₱')) {
        return amount;
    }
    
    let numericAmount: number;
    if (typeof amount === 'string') {
        const cleanAmount = amount.replace(/[₱,]/g, '');
        numericAmount = parseFloat(cleanAmount);
    } else {
        numericAmount = amount;
    }
    
    if (isNaN(numericAmount) || !isFinite(numericAmount)) {
        return '₱0.00';
    }
    
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(numericAmount);
};

const formatDate = (date: string | null | undefined, isMobile: boolean = false): string => {
    if (!date) return '—';
    try {
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
            return '—';
        }
        if (isMobile) {
            return dateObj.toLocaleDateString('en-PH', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
            });
        }
        return dateObj.toLocaleDateString('en-PH', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
        });
    } catch {
        return date || '—';
    }
};

const parseAmount = (amount: string | number | undefined | null): number => {
    if (amount === undefined || amount === null || amount === '') return 0;
    if (typeof amount === 'number') return amount;
    if (typeof amount === 'string') {
        const cleanAmount = amount.replace(/[₱,]/g, '');
        const parsed = parseFloat(cleanAmount);
        return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
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
    error?: string;
}

const RECEIPT_TABS_CONFIG = [
    { id: 'all', label: 'All Receipts', icon: List },
    { id: 'paid', label: 'Paid', icon: CheckCircle },
    { id: 'partial', label: 'Partial', icon: Clock },
    { id: 'pending', label: 'Pending', icon: AlertCircle },
    { id: 'cancelled', label: 'Cancelled', icon: XCircle },
];

export default function ReceiptsIndex() {
    const { props } = usePage<PageProps>();
    
    const allReceipts = props.receipts?.data || [];
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
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [receiptTypeFilter, setReceiptTypeFilter] = useState('all');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    
    const [loading, setLoading] = useState(false);
    const [selectedReceipts, setSelectedReceipts] = useState<ReceiptItem[]>([]);
    const [selectMode, setSelectMode] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    
    const filteredReceipts = useMemo(() => {
        if (!allReceipts || !Array.isArray(allReceipts)) {
            return [];
        }
        
        let filtered = [...allReceipts];
        
        if (statusFilter !== 'all') {
            filtered = filtered.filter(receipt => receipt?.status === statusFilter);
        }
        
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(receipt => 
                receipt?.receipt_number?.toLowerCase().includes(query) ||
                receipt?.or_number?.toLowerCase().includes(query) ||
                receipt?.payor_name?.toLowerCase().includes(query) ||
                receipt?.amount?.toString().includes(query)
            );
        }
        
        if (dateFrom) {
            const fromDate = new Date(dateFrom);
            fromDate.setHours(0, 0, 0, 0);
            filtered = filtered.filter(receipt => {
                if (!receipt?.payment_date) return false;
                try {
                    const paymentDate = new Date(receipt.payment_date);
                    return paymentDate >= fromDate;
                } catch {
                    return false;
                }
            });
        }
        
        if (dateTo) {
            const toDate = new Date(dateTo);
            toDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter(receipt => {
                if (!receipt?.payment_date) return false;
                try {
                    const paymentDate = new Date(receipt.payment_date);
                    return paymentDate <= toDate;
                } catch {
                    return false;
                }
            });
        }
        
        if (receiptTypeFilter !== 'all') {
            filtered = filtered.filter(receipt => receipt?.receipt_type === receiptTypeFilter);
        }
        
        if (paymentMethodFilter !== 'all') {
            filtered = filtered.filter(receipt => receipt?.payment_method === paymentMethodFilter);
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
                    const amountA = parseAmount(a?.amount);
                    const amountB = parseAmount(b?.amount);
                    comparison = amountA - amountB;
                    break;
            }
            
            return sortOrder === 'asc' ? comparison : -comparison;
        });
        
        return filtered;
    }, [allReceipts, statusFilter, searchQuery, dateFrom, dateTo, receiptTypeFilter, paymentMethodFilter, sortBy, sortOrder]);
    
    const itemsPerPage = props.receipts?.per_page || 15;
    const totalPages = Math.ceil(filteredReceipts.length / itemsPerPage);
    const paginatedReceipts = useMemo(() => {
        if (!filteredReceipts || filteredReceipts.length === 0) {
            return [];
        }
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredReceipts.slice(start, end);
    }, [filteredReceipts, currentPage, itemsPerPage]);
    
    const handleFilterChange = (filterType: string, value: string) => {
        setCurrentPage(1);
        
        switch (filterType) {
            case 'status':
                setStatusFilter(value);
                break;
            case 'search':
                setSearchQuery(value);
                break;
            case 'dateFrom':
                setDateFrom(value);
                break;
            case 'dateTo':
                setDateTo(value);
                break;
            case 'receiptType':
                setReceiptTypeFilter(value);
                break;
            case 'paymentMethod':
                setPaymentMethodFilter(value);
                break;
        }
        
        clearSelection();
        setSelectMode(false);
    };
    
    const hasActiveFilters = statusFilter !== 'all' || 
                            searchQuery !== '' || 
                            dateFrom !== '' || 
                            dateTo !== '' || 
                            receiptTypeFilter !== 'all' || 
                            paymentMethodFilter !== 'all';
    
    const clearFilters = () => {
        setStatusFilter('all');
        setSearchQuery('');
        setDateFrom('');
        setDateTo('');
        setReceiptTypeFilter('all');
        setPaymentMethodFilter('all');
        setSortBy('date');
        setSortOrder('desc');
        setCurrentPage(1);
        
        if (isMobile) setShowMobileFilters(false);
        clearSelection();
        setSelectMode(false);
    };
    
    const toggleSelect = (receipt: ReceiptItem) => {
        if (!receipt) return;
        setSelectedReceipts(prev => {
            const isSelected = prev.some(item => item?.id === receipt.id);
            if (isSelected) {
                return prev.filter(item => item?.id !== receipt.id);
            } else {
                return [...prev, receipt];
            }
        });
    };
    
    const selectAll = () => {
        if (paginatedReceipts && paginatedReceipts.length > 0) {
            setSelectedReceipts([...paginatedReceipts]);
        }
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
    
    const selectedReceiptIds = selectedReceipts.map(receipt => receipt?.id).filter(id => id);
    
    const handleTabChange = (tab: string) => {
        handleFilterChange('status', tab);
        if (isMobile) setShowMobileFilters(false);
    };
    
    const handlePrintReceipts = () => {
        if (filteredReceipts.length === 0) {
            toast.error('No receipts to print');
            return;
        }
        toast.info('Print functionality coming soon');
    };
    
    const handleExportToCSV = async () => {
        if (filteredReceipts.length === 0) {
            toast.error('No receipts to export');
            return;
        }
        
        setIsExporting(true);
        try {
            const headers = ['Receipt #', 'OR #', 'Date', 'Payor', 'Amount', 'Type', 'Method', 'Status'];
            const rows = filteredReceipts.map(r => [
                r?.receipt_number || '',
                r?.or_number || '',
                r?.payment_date || '',
                r?.payor_name || '',
                formatCurrency(r?.amount || 0),
                r?.receipt_type || '',
                r?.payment_method || '',
                r?.status || ''
            ]);
            
            const csvContent = [headers, ...rows]
                .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
                .join('\n');
            
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `receipts_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            toast.success(`Exported ${filteredReceipts.length} receipts`);
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Export failed');
        } finally {
            setIsExporting(false);
        }
    };
    
    const handleCopyReceiptNumber = (code: string) => {
        if (!code) return;
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
        if (id) {
            window.location.href = `/portal/receipts/${id}`;
        }
    };
    
    const handleDownloadReceipt = (id: number) => {
        if (id) {
            window.open(`/portal/receipts/${id}/download`, '_blank');
        }
    };
    
    const handlePrintReceipt = (id: number) => {
        if (id) {
            window.open(`/portal/receipts/${id}/print`, '_blank');
        }
    };
    
    const handleSelectReceipt = (receipt: ReceiptItem) => {
        if (receipt) {
            toggleSelect(receipt);
        }
    };
    
    const getStatusCountForTab = (status: string): number => {
        if (!filteredReceipts || !Array.isArray(filteredReceipts)) return 0;
        if (status === 'all') return filteredReceipts.length;
        return filteredReceipts.filter(receipt => receipt?.status === status).length;
    };
    
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
    
    const tabHasData = paginatedReceipts && paginatedReceipts.length > 0;
    
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
                            subtitle={`${filteredReceipts.length} receipt${filteredReceipts.length !== 1 ? 's' : ''} • ${household?.household_number || ''}`}
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
                    
                    {/* Stats Section - Mobile: Collapsible, Desktop: Always visible */}
                    {isMobile && stats && (
                        <CollapsibleStats
                            showStats={showStats}
                            setShowStats={setShowStats}
                            stats={stats}
                            receiptsData={allReceipts}
                            loading={loading}
                            formatCurrency={formatCurrency}
                            variant="mobile"
                        />
                    )}
                    
                    {!isMobile && stats && (
                        <div>
                            <ModernStatsCards
                                cards={getReceiptStatsCards(stats, allReceipts, formatCurrency)}
                                loading={loading}
                                gridCols="grid-cols-2 lg:grid-cols-4"
                                variant="default"
                            />
                        </div>
                    )}
                    
                    {!isMobile && (
                        <ModernReceiptFilters
                            search={searchQuery}
                            setSearch={(value) => handleFilterChange('search', value)}
                            handleSearchSubmit={(e) => { e.preventDefault(); }}
                            handleSearchClear={() => handleFilterChange('search', '')}
                            dateFrom={dateFrom}
                            setDateFrom={(value) => handleFilterChange('dateFrom', value)}
                            dateTo={dateTo}
                            setDateTo={(value) => handleFilterChange('dateTo', value)}
                            receiptTypeFilter={receiptTypeFilter}
                            handleReceiptTypeChange={(type) => handleFilterChange('receiptType', type)}
                            paymentMethodFilter={paymentMethodFilter}
                            handlePaymentMethodChange={(method) => handleFilterChange('paymentMethod', method)}
                            loading={loading}
                            receiptTypes={receiptTypes}
                            paymentMethods={paymentMethods}
                            hasActiveFilters={hasActiveFilters}
                            handleClearFilters={clearFilters}
                            onPrint={handlePrintReceipts}
                            onExport={handleExportToCSV}
                            isExporting={isExporting}
                        />
                    )}
                    
                    <div className="mt-4">
                        <CustomTabs 
                            statusFilter={statusFilter}
                            handleTabChange={handleTabChange}
                            getStatusCount={getStatusCountForTab}
                            tabsConfig={RECEIPT_TABS_CONFIG}
                        />
                        
                        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
                            <CardContent className="p-4 md:p-6">
                                {selectMode && tabHasData && (
                                    <ModernSelectionBanner
                                        selectedCount={selectedReceipts.length}
                                        totalCount={paginatedReceipts.length}
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
                                        ? `Showing ${paginatedReceipts.length} of ${filteredReceipts.length} receipt${filteredReceipts.length !== 1 ? 's' : ''}`
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
                                            <ModernReceiptGridView
                                                receipts={paginatedReceipts}
                                                selectMode={selectMode}
                                                selectedReceipts={selectedReceiptIds}
                                                onSelectReceipt={handleSelectReceipt}
                                                formatDate={(date: string | null) => formatDate(date, true)}
                                                formatCurrency={formatCurrency}
                                                onView={handleViewReceipt}
                                                onDownload={handleDownloadReceipt}
                                                onPrint={handlePrintReceipt}
                                                onCopyReceiptNumber={handleCopyReceiptNumber}
                                                onCopyORNNumber={handleCopyORNNumber}
                                                isMobile={true}
                                            />
                                        ) : (
                                            <ModernReceiptMobileListView
                                                receipts={paginatedReceipts}
                                                selectMode={selectMode}
                                                selectedReceipts={selectedReceiptIds}
                                                onSelectReceipt={handleSelectReceipt}
                                                formatDate={(date: string | null) => formatDate(date, true)}
                                                formatCurrency={formatCurrency}
                                                onView={handleViewReceipt}
                                                onDownload={handleDownloadReceipt}
                                                onPrint={handlePrintReceipt}
                                                onCopyReceiptNumber={handleCopyReceiptNumber}
                                                onCopyORNNumber={handleCopyORNNumber}
                                            />
                                        )
                                    ) : (
                                        // Desktop rendering
                                        viewMode === 'grid' ? (
                                            <ModernReceiptGridView
                                                receipts={paginatedReceipts}
                                                selectMode={selectMode}
                                                selectedReceipts={selectedReceiptIds}
                                                onSelectReceipt={handleSelectReceipt}
                                                formatDate={(date: string | null) => formatDate(date, false)}
                                                formatCurrency={formatCurrency}
                                                onView={handleViewReceipt}
                                                onDownload={handleDownloadReceipt}
                                                onPrint={handlePrintReceipt}
                                                onCopyReceiptNumber={handleCopyReceiptNumber}
                                                onCopyORNNumber={handleCopyORNNumber}
                                                isMobile={false}
                                            />
                                        ) : (
                                            <ModernReceiptListView
                                                receipts={paginatedReceipts}
                                                selectMode={selectMode}
                                                selectedReceipts={selectedReceiptIds}
                                                onSelectReceipt={handleSelectReceipt}
                                                onSelectAll={selectAll}
                                                formatDate={(date: string | null) => formatDate(date, false)}
                                                formatCurrency={formatCurrency}
                                                onView={handleViewReceipt}
                                                onDownload={handleDownloadReceipt}
                                                onPrint={handlePrintReceipt}
                                                onCopyReceiptNumber={handleCopyReceiptNumber}
                                                onCopyORNNumber={handleCopyORNNumber}
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
                
                <ModernFilterModal
                    isOpen={showMobileFilters}
                    onClose={() => setShowMobileFilters(false)}
                    title="Filter Receipts"
                    description={hasActiveFilters ? 'Filters are currently active' : 'No filters applied'}
                    search={searchQuery}
                    onSearchChange={(value) => setSearchQuery(value)}
                    onSearchSubmit={(e: React.FormEvent) => { 
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
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date From</label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date To</label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Receipt Type</label>
                            <ModernSelect
                                value={receiptTypeFilter}
                                onValueChange={(value) => handleFilterChange('receiptType', value)}
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
                                onValueChange={(value) => handleFilterChange('paymentMethod', value)}
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