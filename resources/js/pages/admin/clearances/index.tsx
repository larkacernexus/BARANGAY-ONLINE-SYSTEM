import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import AppLayout from '@/layouts/admin-app-layout';
import { 
    ClearanceRequest,
    ClearanceType,
    StatusOption,
    Filters,
    Stats,
    PaginationData,
    BulkOperation,
    SelectionMode
} from '@/types/admin/clearances/clearance';
import { TooltipProvider } from '@/components/ui/tooltip';

// Import reusable components
import ClearancesStats from '@/components/admin/clearances/ClearancesStats';
import ClearancesFilters from '@/components/admin/clearances/ClearancesFilters';
import ClearancesContent from '@/components/admin/clearances/ClearancesContent';
import ClearancesDialogs from '@/components/admin/clearances/ClearancesDialogs';
import { Button } from '@/components/ui/button';
import { KeyRound, Plus, Loader2 } from 'lucide-react';

// Debounce utility
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

interface ClearancesPageProps {
    clearances?: PaginationData<ClearanceRequest>;
    filters?: Filters;
    clearanceTypes?: ClearanceType[];
    statusOptions?: StatusOption[];
    paymentStatusOptions?: StatusOption[];
    stats?: Stats;
}

const defaultStats: Stats = {
    total: 0, pending: 0, processing: 0, approved: 0, totalRevenue: 0,
    issuedThisMonth: 0, pendingToday: 0, expressRequests: 0, rushRequests: 0,
    unpaid: 0, partially_paid: 0, paid: 0, pending_payment: 0
};

export default function ClearancesIndex({ 
    clearances: initialClearances, 
    filters: initialFilters = {}, 
    clearanceTypes = [], 
    statusOptions = [],
    paymentStatusOptions = [],
    stats = defaultStats
}: ClearancesPageProps) {
    const { flash } = usePage().props as any;
    
    // Safe data extraction - ✅ per_page default is 15
    const safeClearances = initialClearances || { 
        data: [], current_page: 1, last_page: 1, total: 0, per_page: 15, from: 0, to: 0 
    };
    
    // Filter states - server-side
    const [search, setSearch] = useState<string>(initialFilters.search || '');
    const [statusFilter, setStatusFilter] = useState<string>(initialFilters.status || '');
    const [typeFilter, setTypeFilter] = useState<string>(initialFilters.type || '');
    const [urgencyFilter, setUrgencyFilter] = useState<string>(initialFilters.urgency || '');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>(initialFilters.payment_status || '');
    const [fromDate, setFromDate] = useState<string>(initialFilters.from_date || '');
    const [toDate, setToDate] = useState<string>(initialFilters.to_date || '');
    const [clearanceNumberFilter, setClearanceNumberFilter] = useState<string>(initialFilters.clearance_number || '');
    const [applicantTypeFilter, setApplicantTypeFilter] = useState<string>(initialFilters.applicant_type || 'all');
    const [amountRange, setAmountRange] = useState<string>(initialFilters.amount_range || '');
    
    // Sorting states
    const [sortBy, setSortBy] = useState<string>(initialFilters.sort_by || 'created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
        (initialFilters.sort_order as 'asc' | 'desc') || 'desc'
    );
    
    // Per page state - ✅ default is '15'
    const [perPage, setPerPage] = useState<string>('15');
    
    // UI states
    const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
    const [dateRangePreset, setDateRangePreset] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    
    // Bulk selection states
    const [selectedClearances, setSelectedClearances] = useState<number[]>([]);
    const [isBulkMode, setIsBulkMode] = useState<boolean>(false);
    const [isSelectAll, setIsSelectAll] = useState<boolean>(false);
    const [selectionMode, setSelectionMode] = useState<SelectionMode>('page');
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState<boolean>(false);
    const [showBulkStatusDialog, setShowBulkStatusDialog] = useState<boolean>(false);
    const [isPerformingBulkAction, setIsPerformingBulkAction] = useState<boolean>(false);
    const [bulkEditValue, setBulkEditValue] = useState<string>('');

    const searchInputRef = useRef<HTMLInputElement>(null);
    
    // Debounce filters
    const debouncedSearch = useDebounce(search, 300);
    const debouncedClearanceNumber = useDebounce(clearanceNumberFilter, 300);
    const debouncedFromDate = useDebounce(fromDate, 500);
    const debouncedToDate = useDebounce(toDate, 500);

    // Handle window resize
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const handleResize = () => {
            const width = window.innerWidth;
            setIsMobile(width < 768);
            if (width < 768 && viewMode === 'table') setViewMode('grid');
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

    const getCurrentFilters = useCallback(() => ({
        search: debouncedSearch,
        status: statusFilter,
        type: typeFilter,
        urgency: urgencyFilter,
        payment_status: paymentStatusFilter,
        from_date: debouncedFromDate,
        to_date: debouncedToDate,
        clearance_number: debouncedClearanceNumber,
        applicant_type: applicantTypeFilter,
        amount_range: amountRange,
        sort_by: sortBy,
        sort_order: sortOrder,
        per_page: perPage,
    }), [
        debouncedSearch, statusFilter, typeFilter, urgencyFilter, paymentStatusFilter,
        debouncedFromDate, debouncedToDate, debouncedClearanceNumber, applicantTypeFilter,
        amountRange, sortBy, sortOrder, perPage
    ]);

    const reloadData = useCallback((page = 1) => {
        setIsLoading(true);
        
        const filters = { ...getCurrentFilters(), page };
        
        router.get('/admin/clearances', filters, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsLoading(false);
                setSelectedClearances([]);
                setIsSelectAll(false);
            },
            onError: () => {
                setIsLoading(false);
                toast.error('Failed to load clearances');
            }
        });
    }, [getCurrentFilters]);

    // Server-side filtering - reload data when filters change
    useEffect(() => {
        reloadData();
    }, [
        debouncedSearch, statusFilter, typeFilter, urgencyFilter, paymentStatusFilter,
        debouncedFromDate, debouncedToDate, debouncedClearanceNumber, applicantTypeFilter,
        amountRange, sortBy, sortOrder, perPage
    ]);

    // Handle per page change
    const handlePerPageChange = useCallback((value: string) => {
        setPerPage(value);
        reloadData(1);
    }, [reloadData]);

    // Reset selection when exiting bulk mode
    useEffect(() => {
        if (!isBulkMode) {
            setSelectedClearances([]);
            setIsSelectAll(false);
        }
    }, [isBulkMode]);

    // Get current page data
    const currentClearances = safeClearances.data || [];
    const paginationData = {
        current_page: safeClearances.current_page || 1,
        last_page: safeClearances.last_page || 1,
        total: safeClearances.total || 0,
        from: safeClearances.from || 0,
        to: safeClearances.to || 0,
        per_page: safeClearances.per_page || parseInt(perPage) || 15,  // ✅ fallback 15
    };

    // Selection handlers
    const handleSelectAllOnPage = () => {
        const pageIds = currentClearances.map(c => c.id);
        if (isSelectAll) {
            setSelectedClearances(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            setSelectedClearances(prev => [...new Set([...prev, ...pageIds])]);
        }
        setIsSelectAll(!isSelectAll);
        setSelectionMode('page');
    };

    const handleItemSelect = (id: number) => {
        setSelectedClearances(prev => 
            prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
        );
    };

    // Check if all items on current page are selected
    useEffect(() => {
        const allPageIds = currentClearances.map(c => c.id);
        const allSelected = allPageIds.length > 0 && allPageIds.every(id => selectedClearances.includes(id));
        setIsSelectAll(allSelected);
    }, [selectedClearances, currentClearances]);

    // Get selected clearances data
    const selectedClearancesData = currentClearances.filter(c => 
        selectedClearances.includes(c.id)
    );

    // Calculate selection stats
    const selectionStats = {
        total: selectedClearancesData.length,
        pending: selectedClearancesData.filter(c => c?.status === 'pending').length,
        processing: selectedClearancesData.filter(c => c?.status === 'processing').length,
        approved: selectedClearancesData.filter(c => c?.status === 'approved' || c?.status === 'issued').length,
        unpaid: selectedClearancesData.filter(c => c?.payment_status === 'unpaid').length,
        partially_paid: selectedClearancesData.filter(c => c?.payment_status === 'partially_paid').length,
        paid: selectedClearancesData.filter(c => c?.payment_status === 'paid').length,
        totalValue: selectedClearancesData.reduce((sum, c) => sum + (Number(c?.fee_amount) || 0), 0),
        totalPaid: selectedClearancesData.reduce((sum, c) => sum + (Number(c?.amount_paid) || 0), 0)
    };

    // Handle page change
    const handlePageChange = (page: number) => {
        reloadData(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Handle sort change
    const handleSortChange = (value: string) => {
        const [newSortBy, newSortOrder] = value.split('-');
        setSortBy(newSortBy);
        setSortOrder(newSortOrder as 'asc' | 'desc');
    };

    const getCurrentSortValue = (): string => `${sortBy}-${sortOrder}`;

    // Bulk operations
    const handleBulkOperation = async (operation: BulkOperation | string) => {
        if (selectedClearances.length === 0) {
            toast.error('Please select at least one clearance request');
            return;
        }

        setIsPerformingBulkAction(true);

        try {
            const endpoint = `/admin/clearances/bulk-${operation}`;
            
            await router.post(endpoint, { ids: selectedClearances }, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedClearances([]);
                    reloadData(paginationData.current_page);
                    toast.success(`Clearance requests ${operation}ed successfully`);
                },
                onError: () => toast.error(`Failed to ${operation} clearance requests`)
            });
        } catch (error) {
            toast.error('An error occurred during bulk operation');
        } finally {
            setIsPerformingBulkAction(false);
            if (operation === 'delete') setShowBulkDeleteDialog(false);
        }
    };

    // Individual clearance operations
    const handleDelete = (clearance: ClearanceRequest) => {
        if (confirm(`Are you sure you want to cancel request ${clearance?.reference_number}?`)) {
            router.delete(`/admin/clearances/${clearance.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedClearances(prev => prev.filter(id => id !== clearance.id));
                    reloadData(paginationData.current_page);
                    toast.success('Clearance request cancelled');
                },
                onError: () => toast.error('Failed to cancel clearance request')
            });
        }
    };

    // ✅ Clear filters - reset perPage to '15'
    const handleClearFilters = () => {
        setSearch('');
        setStatusFilter('');
        setTypeFilter('');
        setUrgencyFilter('');
        setPaymentStatusFilter('');
        setFromDate('');
        setToDate('');
        setClearanceNumberFilter('');
        setApplicantTypeFilter('all');
        setAmountRange('');
        setDateRangePreset('');
        setSortBy('created_at');
        setSortOrder('desc');
        setPerPage('15');
    };

    const handleClearSelection = () => {
        setSelectedClearances([]);
        setIsSelectAll(false);
    };

    const updateFilter = (key: string, value: string) => {
        switch (key) {
            case 'status': setStatusFilter(value); break;
            case 'type': setTypeFilter(value); break;
            case 'urgency': setUrgencyFilter(value); break;
            case 'payment_status': setPaymentStatusFilter(value); break;
            case 'from_date': setFromDate(value); break;
            case 'to_date': setToDate(value); break;
            case 'per_page': handlePerPageChange(value); break;
        }
    };

    const hasActiveFilters = Boolean(
        search || statusFilter || typeFilter || urgencyFilter ||
        paymentStatusFilter || fromDate || toDate || clearanceNumberFilter ||
        applicantTypeFilter !== 'all' || amountRange
    );

    const filtersStateForComponent = {
        status: statusFilter,
        type: typeFilter,
        urgency: urgencyFilter,
        payment_status: paymentStatusFilter,
        from_date: fromDate,
        to_date: toDate,
        per_page: perPage
    };

    // Keyboard shortcuts
    useEffect(() => {
        if (isMobile) return;
        
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'a' && isBulkMode) {
                e.preventDefault();
                handleSelectAllOnPage();
            }
            if (e.key === 'Escape') {
                if (isBulkMode) {
                    selectedClearances.length > 0 ? setSelectedClearances([]) : setIsBulkMode(false);
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
            if (e.key === 'Delete' && isBulkMode && selectedClearances.length > 0) {
                e.preventDefault();
                setShowBulkDeleteDialog(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isBulkMode, selectedClearances, isMobile]);

    return (
        <AppLayout
            title="Clearance Requests"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Clearances', href: '/admin/clearances' }
            ]}
        >
            <TooltipProvider>
                <div className="space-y-6">
                    {/* Loading Indicator */}
                    {isLoading && (
                        <div className="fixed top-4 right-4 z-50 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">Loading...</span>
                        </div>
                    )}
                    
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Clearance Requests</h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Manage and process barangay clearance requests
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setIsBulkMode(!isBulkMode)}
                                className={isBulkMode ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}
                            >
                                <KeyRound className="h-4 w-4 mr-2" />
                                {isBulkMode ? `Bulk Mode (${selectedClearances.length})` : 'Bulk Select'}
                            </Button>
                            <Button asChild>
                                <a href="/admin/clearances/create">
                                    <Plus className="h-4 w-4 mr-2" />
                                    New Request
                                </a>
                            </Button>
                        </div>
                    </div>

                    <ClearancesStats stats={stats} />

                    <ClearancesFilters
                        search={search}
                        setSearch={setSearch}
                        filtersState={filtersStateForComponent}
                        updateFilter={updateFilter}
                        handleClearFilters={handleClearFilters}
                        hasActiveFilters={hasActiveFilters}
                        clearanceTypes={clearanceTypes}
                        statusOptions={statusOptions}
                        paymentStatusOptions={paymentStatusOptions}
                        startIndex={paginationData.from}
                        endIndex={paginationData.to}
                        totalItems={paginationData.total}
                        totalFilteredItems={paginationData.total}
                        isBulkMode={isBulkMode}
                        selectionMode={selectionMode}
                        selectedCount={selectedClearances.length}
                        onClearSelection={handleClearSelection}
                        onSelectAllPage={handleSelectAllOnPage}
                        onSelectAllFiltered={() => {}}
                        onSelectAll={() => {}}
                        isLoading={isLoading}
                        showAdvancedFilters={showAdvancedFilters}
                        setShowAdvancedFilters={setShowAdvancedFilters}
                        dateRangePreset={dateRangePreset}
                        setDateRangePreset={setDateRangePreset}
                        clearanceNumberFilter={clearanceNumberFilter}
                        setClearanceNumberFilter={setClearanceNumberFilter}
                        applicantTypeFilter={applicantTypeFilter}
                        setApplicantTypeFilter={setApplicantTypeFilter}
                        amountRange={amountRange}
                        setAmountRange={setAmountRange}
                        perPage={perPage}
                        onPerPageChange={handlePerPageChange}
                    />

                    <ClearancesContent
                        clearances={currentClearances}
                        totalItems={paginationData.total}
                        stats={stats}
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isSelectAll={isSelectAll}
                        selectedClearances={selectedClearances}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        isMobile={isMobile}
                        hasActiveFilters={hasActiveFilters}
                        currentPage={paginationData.current_page}
                        totalPages={paginationData.last_page}
                        itemsPerPage={paginationData.per_page}
                        perPage={perPage}
                        onPerPageChange={handlePerPageChange}
                        onPageChange={handlePageChange}
                        onSelectAllOnPage={handleSelectAllOnPage}
                        onSelectAllFiltered={() => {}}
                        onSelectAll={() => {}}
                        onItemSelect={handleItemSelect}
                        onClearFilters={handleClearFilters}
                        onClearSelection={handleClearSelection}
                        onDelete={handleDelete}
                        onViewPhoto={() => {}}
                        onSort={() => {}}
                        onBulkOperation={handleBulkOperation}
                        onCopySelectedData={() => {}}
                        setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                        filtersState={filtersStateForComponent}
                        handleRecordPayment={() => {}}
                        isLoading={isLoading}
                        clearanceTypes={clearanceTypes}
                        statusOptions={statusOptions}
                        isPerformingBulkAction={isPerformingBulkAction}
                        selectionMode={selectionMode}
                        selectionStats={selectionStats}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSortChange={handleSortChange}
                        getCurrentSortValue={getCurrentSortValue}
                    />

                    {/* Keyboard Shortcuts */}
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
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-xs text-gray-600">
                                <div><kbd className="px-2 py-1 bg-gray-200 rounded">Ctrl+A</kbd> Select page</div>
                                <div><kbd className="px-2 py-1 bg-gray-200 rounded">Delete</kbd> Delete selected</div>
                                <div><kbd className="px-2 py-1 bg-gray-200 rounded">Esc</kbd> Exit/clear</div>
                                <div><kbd className="px-2 py-1 bg-gray-200 rounded">Ctrl+F</kbd> Focus search</div>
                            </div>
                        </div>
                    )}
                </div>
            </TooltipProvider>

            <ClearancesDialogs
                showBulkDeleteDialog={showBulkDeleteDialog}
                setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                showBulkStatusDialog={showBulkStatusDialog}
                setShowBulkStatusDialog={setShowBulkStatusDialog}
                isPerformingBulkAction={isPerformingBulkAction}
                selectedClearances={selectedClearances}
                handleBulkOperation={handleBulkOperation}
                selectionStats={selectionStats}
                bulkEditValue={bulkEditValue}
                setBulkEditValue={setBulkEditValue}
                statusOptions={statusOptions}
            />
        </AppLayout>
    );
}