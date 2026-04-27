// pages/admin/Fees/Index.tsx - COMPLETE REVISED FILE

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import AppLayout from '@/layouts/admin-app-layout';
import { router } from '@inertiajs/react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import FeesHeader from '@/components/admin/fees/FeesHeader';
import FeesStats from '@/components/admin/fees/FeesStats';
import FeesFilters from '@/components/admin/fees/FeesFilters';
import FeesContent from '@/components/admin/fees/FeesContent';
import FeesDialogs from '@/components/admin/fees/FeesDialogs';
import FlashMessages from '@/components/adminui/FlashMessages';
import { PaginationData, Filters, Stats, BulkOperation, Fee } from '@/types/admin/fees/fees';
import { route } from 'ziggy-js';
import { Loader2, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

interface FeesIndexProps {
    fees: PaginationData;
    filters: Filters;
    statuses: Record<string, string>;
    categories: Record<string, string>;
    puroks: string[];
    payerTypes?: Record<string, string>;
    stats: Stats;
    flash?: { success?: string; error?: string; info?: string; warning?: string; };
}

export default function FeesIndex({
    fees: initialFees,
    filters: initialFilters = {},
    statuses = {},
    categories = {},
    puroks = [],
    payerTypes = {},
    stats = { 
        total: 0, 
        total_amount: 0,
        collected: 0,
        pending: 0,
        overdue_count: 0,
        due_soon_count: 0,
        today_count: 0,
        today_amount: 0,
        today_collected: 0,
        this_month_count: 0,
        this_month_amount: 0,
        this_month_collected: 0,
        status_counts: {},
        category_totals: {}
    },
    flash
}: FeesIndexProps) {
    
    const isMobile = useMediaQuery('(max-width: 768px)');
    
    // ✅ per_page default is 15
    const safeFees = initialFees || { 
        data: [], current_page: 1, last_page: 1, total: 0, per_page: 15, from: 0, to: 0 
    };
    
    const getSafeString = (value: any, defaultValue: string = ''): string => {
        if (value === null || value === undefined) return defaultValue;
        if (typeof value === 'string') return value;
        if (typeof value === 'number') return String(value);
        return defaultValue;
    };
    
    const [search, setSearch] = useState<string>(getSafeString(initialFilters.search));
    const [statusFilter, setStatusFilter] = useState<string>(getSafeString(initialFilters.status, 'all'));
    const [categoryFilter, setCategoryFilter] = useState<string>(getSafeString(initialFilters.category, 'all'));
    const [purokFilter, setPurokFilter] = useState<string>(getSafeString(initialFilters.purok, 'all'));
    const [payerTypeFilter, setPayerTypeFilter] = useState<string>(getSafeString(initialFilters.payer_type, 'all'));
    const [minAmount, setMinAmount] = useState<string>(getSafeString(initialFilters.min_amount));
    const [maxAmount, setMaxAmount] = useState<string>(getSafeString(initialFilters.max_amount));
    const [fromDate, setFromDate] = useState<string>(getSafeString(initialFilters.from_date));
    const [toDate, setToDate] = useState<string>(getSafeString(initialFilters.to_date));
    const [amountRange, setAmountRange] = useState<string>(getSafeString(initialFilters.amount_range));
    const [dueDateRange, setDueDateRange] = useState<string>(getSafeString(initialFilters.due_date_range));
    const [dateRangePreset, setDateRangePreset] = useState<string>('');
    
    const [sortBy, setSortBy] = useState<string>(getSafeString(initialFilters.sort_by, 'created_at'));
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
        (initialFilters.sort_order as 'asc' | 'desc') || 'desc'
    );
    // ✅ DEFAULT IS '15'
    const [perPage, setPerPage] = useState<string>('15');
    
    const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    
    const [selectedFees, setSelectedFees] = useState<number[]>([]);
    const [isBulkMode, setIsBulkMode] = useState<boolean>(false);
    const [isSelectAll, setIsSelectAll] = useState<boolean>(false);
    const [selectionMode, setSelectionMode] = useState<'page' | 'filtered' | 'all'>('page');
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState<boolean>(false);
    const [isPerformingBulkAction, setIsPerformingBulkAction] = useState<boolean>(false);
    const [selectionStats, setSelectionStats] = useState<any>(null);
    
    const searchInputRef = useRef<HTMLInputElement>(null);
    const isFirstMount = useRef(true);
    
    const debouncedSearch = useDebounce(search, 300);
    const debouncedMinAmount = useDebounce(minAmount, 500);
    const debouncedMaxAmount = useDebounce(maxAmount, 500);
    const debouncedFromDate = useDebounce(fromDate, 500);
    const debouncedToDate = useDebounce(toDate, 500);

    useEffect(() => {
        if (isMobile && viewMode !== 'grid') {
            setViewMode('grid');
        }
    }, [isMobile, viewMode]);

    const currentFees = safeFees.data || [];
    const paginationData = useMemo(() => ({
        current_page: safeFees.current_page || 1,
        last_page: safeFees.last_page || 1,
        total: safeFees.total || 0,
        from: safeFees.from || 0,
        to: safeFees.to || 0,
        per_page: safeFees.per_page || parseInt(perPage) || 15, // ✅ fallback 15
    }), [safeFees, perPage]);

    const getCurrentFilters = useCallback(() => ({
        search: debouncedSearch,
        status: statusFilter,
        category: categoryFilter,
        purok: purokFilter,
        payer_type: payerTypeFilter,
        min_amount: debouncedMinAmount,
        max_amount: debouncedMaxAmount,
        from_date: debouncedFromDate,
        to_date: debouncedToDate,
        amount_range: amountRange,
        due_date_range: dueDateRange,
        sort_by: sortBy,
        sort_order: sortOrder,
        per_page: perPage,
    }), [
        debouncedSearch, statusFilter, categoryFilter, purokFilter, payerTypeFilter,
        debouncedMinAmount, debouncedMaxAmount, debouncedFromDate, debouncedToDate,
        amountRange, dueDateRange, sortBy, sortOrder, perPage
    ]);

    const reloadData = useCallback((page = 1) => {
        setIsLoading(true);
        
        const filters = { ...getCurrentFilters(), page };
        
        router.get('/admin/fees', filters, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsLoading(false);
                setSelectedFees([]);
                setIsSelectAll(false);
            },
            onError: () => {
                setIsLoading(false);
                toast.error('Failed to load fees');
            }
        });
    }, [getCurrentFilters]);

    useEffect(() => {
        if (isFirstMount.current) {
            isFirstMount.current = false;
            return;
        }
        
        reloadData();
    }, [
        debouncedSearch, statusFilter, categoryFilter, purokFilter, payerTypeFilter,
        debouncedMinAmount, debouncedMaxAmount, debouncedFromDate, debouncedToDate,
        amountRange, dueDateRange, sortBy, sortOrder, perPage, reloadData
    ]);

    const handlePerPageChange = useCallback((value: string) => {
        setPerPage(value);
        reloadData(1);
    }, [reloadData]);

    useEffect(() => {
        if (!isBulkMode) {
            setSelectedFees([]);
            setIsSelectAll(false);
        }
    }, [isBulkMode]);

    const handleSelectAllOnPage = useCallback(() => {
        const pageIds = currentFees.map(fee => fee.id);
        if (isSelectAll) {
            setSelectedFees(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            setSelectedFees(prev => [...new Set([...prev, ...pageIds])]);
        }
        setIsSelectAll(!isSelectAll);
        setSelectionMode('page');
    }, [currentFees, isSelectAll]);

    const handleItemSelect = useCallback((id: number) => {
        setSelectedFees(prev => 
            prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
        );
    }, []);

    useEffect(() => {
        const allPageIds = currentFees.map(fee => fee.id);
        const allSelected = allPageIds.length > 0 && allPageIds.every(id => selectedFees.includes(id));
        setIsSelectAll(allSelected);
    }, [selectedFees, currentFees]);

    const selectedFeesData = useMemo(() => 
        currentFees.filter(fee => selectedFees.includes(fee.id)),
    [selectedFees, currentFees]);

    useEffect(() => {
        if (selectedFeesData.length === 0) {
            setSelectionStats({
                total: 0, totalAmount: 0, averageAmount: 0,
                active: 0, inactive: 0, pending: 0, paid: 0,
                overdue: 0, issued: 0, partially_paid: 0,
                cancelled: 0, refunded: 0, resident: 0, business: 0, household: 0
            });
            return;
        }
        
        const totalAmount = selectedFeesData.reduce((sum, f) => sum + (Number(f?.total_amount) || 0), 0);
        
        setSelectionStats({
            total: selectedFeesData.length,
            totalAmount,
            averageAmount: totalAmount / selectedFeesData.length,
            active: selectedFeesData.filter(f => f?.status !== 'cancelled' && f?.status !== 'refunded').length,
            inactive: selectedFeesData.filter(f => f?.status === 'cancelled' || f?.status === 'refunded').length,
            pending: selectedFeesData.filter(f => f?.status === 'pending').length,
            paid: selectedFeesData.filter(f => f?.status === 'paid').length,
            overdue: selectedFeesData.filter(f => f?.status === 'overdue').length,
            issued: selectedFeesData.filter(f => f?.status === 'issued').length,
            partially_paid: selectedFeesData.filter(f => f?.status === 'partial' || f?.status === 'partially_paid').length,
            cancelled: selectedFeesData.filter(f => f?.status === 'cancelled').length,
            refunded: selectedFeesData.filter(f => f?.status === 'refunded').length,
            resident: selectedFeesData.filter(f => f?.payer_type === 'resident').length,
            business: selectedFeesData.filter(f => f?.payer_type === 'business').length,
            household: selectedFeesData.filter(f => f?.payer_type === 'household').length
        });
    }, [selectedFeesData]);

    const handlePageChange = useCallback((page: number) => {
        reloadData(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [reloadData]);

    const handleSort = useCallback((column: string) => {
        if (sortBy === column) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    }, [sortBy]);

    const handleBulkOperation = useCallback(async (operation: BulkOperation) => {
        if (selectedFees.length === 0) {
            toast.error('Please select at least one fee');
            return;
        }

        setIsPerformingBulkAction(true);

        try {
            switch (operation) {
                case 'delete':
                    setShowBulkDeleteDialog(true);
                    break;
                case 'activate':
                case 'deactivate':
                case 'issue':
                case 'mark_paid':
                case 'cancel':
                    await router.post('/admin/fees/bulk-action', {
                        action: operation,
                        fee_ids: selectedFees,
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            setSelectedFees([]);
                            reloadData(paginationData.current_page);
                            toast.success(`${selectedFees.length} fees ${operation}d successfully`);
                        },
                        onError: () => toast.error(`Failed to ${operation} fees`)
                    });
                    break;
                case 'export':
                    const exportData = selectedFeesData.map(fee => ({
                        'Fee Code': fee.fee_code || 'N/A',
                        'Payer Name': fee.payer_name || 'N/A',
                        'Payer Type': fee.payer_type || 'N/A',
                        'Amount': fee.total_amount || 0,
                        'Status': fee.status || 'N/A',
                        'Due Date': fee.due_date || 'N/A',
                    }));
                    
                    const csv = [
                        Object.keys(exportData[0]).join(','),
                        ...exportData.map(row => Object.values(row).map(v => `"${v}"`).join(','))
                    ].join('\n');
                    
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `fees-export-${new Date().toISOString().split('T')[0]}.csv`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                    
                    toast.success(`${selectedFees.length} fees exported`);
                    break;
                case 'print':
                    selectedFees.forEach(id => {
                        window.open(`/admin/fees/${id}/print`, '_blank');
                    });
                    toast.success(`${selectedFees.length} fee(s) opened for printing`);
                    break;
                case 'send_reminders':
                    await router.post('/admin/fees/bulk-action', {
                        action: 'send_reminders',
                        fee_ids: selectedFees,
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            toast.success(`Reminders sent for ${selectedFees.length} fees`);
                        },
                        onError: () => toast.error('Failed to send reminders')
                    });
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
    }, [selectedFees, selectedFeesData, paginationData.current_page, reloadData]);

    const handleDelete = useCallback((fee: Fee) => {
        if (confirm(`Are you sure you want to delete fee "${fee.fee_code || 'Untitled'}"?`)) {
            router.delete(`/admin/fees/${fee.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedFees(prev => prev.filter(id => id !== fee.id));
                    reloadData(paginationData.current_page);
                    toast.success('Fee deleted successfully');
                },
                onError: () => toast.error('Failed to delete fee')
            });
        }
    }, [paginationData.current_page, reloadData]);

    // ✅ Clear filters - reset to '15'
    const handleClearFilters = useCallback(() => {
        setSearch('');
        setStatusFilter('all');
        setCategoryFilter('all');
        setPurokFilter('all');
        setPayerTypeFilter('all');
        setMinAmount('');
        setMaxAmount('');
        setFromDate('');
        setToDate('');
        setAmountRange('');
        setDueDateRange('');
        setDateRangePreset('');
        setSortBy('created_at');
        setSortOrder('desc');
        setPerPage('15');
    }, []);

    const handleClearSelection = useCallback(() => {
        setSelectedFees([]);
        setIsSelectAll(false);
    }, []);

    const handleCopySelectedData = useCallback(() => {
        if (selectedFeesData.length === 0) {
            toast.error('No data to copy');
            return;
        }
        
        const data = selectedFeesData.map(fee => ({
            'Fee Code': fee.fee_code || 'N/A',
            'Payer': fee.payer_name || 'N/A',
            'Amount': fee.total_amount || 0,
            'Status': fee.status || 'N/A',
        }));
        
        const csv = [
            Object.keys(data[0]).join('\t'),
            ...data.map(row => Object.values(row).join('\t'))
        ].join('\n');
        
        navigator.clipboard.writeText(csv).then(() => {
            toast.success(`${selectedFeesData.length} records copied to clipboard`);
        }).catch(() => {
            toast.error('Failed to copy to clipboard');
        });
    }, [selectedFeesData]);

    const updateFilter = useCallback((key: string, value: string) => {
        switch (key) {
            case 'status': setStatusFilter(value); break;
            case 'purok': setPurokFilter(value); break;
            case 'min_amount': setMinAmount(value); break;
            case 'max_amount': setMaxAmount(value); break;
            case 'from_date': setFromDate(value); break;
            case 'to_date': setToDate(value); break;
            case 'per_page': handlePerPageChange(value); break;
        }
    }, [handlePerPageChange]);

    const hasActiveFilters = useMemo(() => Boolean(
        search || 
        (statusFilter && statusFilter !== 'all') || 
        (categoryFilter && categoryFilter !== 'all') ||
        (purokFilter && purokFilter !== 'all') ||
        (payerTypeFilter && payerTypeFilter !== 'all') ||
        minAmount || maxAmount || fromDate || toDate ||
        amountRange || dueDateRange
    ), [search, statusFilter, categoryFilter, purokFilter, payerTypeFilter, minAmount, maxAmount, fromDate, toDate, amountRange, dueDateRange]);

    const filtersStateForComponent = useMemo(() => ({
        status: statusFilter,
        purok: purokFilter,
        min_amount: minAmount,
        max_amount: maxAmount,
        from_date: fromDate,
        to_date: toDate,
        per_page: perPage
    }), [statusFilter, purokFilter, minAmount, maxAmount, fromDate, toDate, perPage]);

    const bulkModeRef = useRef(isBulkMode);
    const selectedFeesRef = useRef(selectedFees);
    
    useEffect(() => {
        bulkModeRef.current = isBulkMode;
        selectedFeesRef.current = selectedFees;
    }, [isBulkMode, selectedFees]);

    useEffect(() => {
        if (isMobile) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'b') {
                e.preventDefault();
                setIsBulkMode(prev => !prev);
            }
            
            if (e.ctrlKey && e.key.toLowerCase() === 'a' && bulkModeRef.current) {
                e.preventDefault();
                const pageIds = currentFees.map(fee => fee.id);
                setSelectedFees(prev => {
                    const allSelected = pageIds.length > 0 && pageIds.every(id => prev.includes(id));
                    if (allSelected) {
                        return prev.filter(id => !pageIds.includes(id));
                    } else {
                        return [...new Set([...prev, ...pageIds])];
                    }
                });
                setIsSelectAll(prev => !prev);
                setSelectionMode('page');
            }
            
            if (e.key === 'Escape' && bulkModeRef.current) {
                e.preventDefault();
                if (selectedFeesRef.current.length > 0) {
                    setSelectedFees([]);
                    setIsSelectAll(false);
                } else {
                    setIsBulkMode(false);
                }
            }
            
            if (e.ctrlKey && e.key.toLowerCase() === 'f') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            
            if (e.key === 'Delete' && bulkModeRef.current && selectedFeesRef.current.length > 0) {
                e.preventDefault();
                setShowBulkDeleteDialog(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isMobile, currentFees]);

    const hasFlashMessages = flash && Object.values(flash).some(message => message !== undefined);

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
                    {isLoading && (
                        <div className="fixed top-4 right-4 z-50 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">Loading...</span>
                        </div>
                    )}
                    
                    {hasFlashMessages && <FlashMessages flash={flash} />}
                    
                    <FeesHeader 
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isMobile={isMobile}
                        selectedFees={selectedFees}
                        paginatedFees={currentFees}
                    />
                    
                    <FeesStats stats={stats} />
                    
                    <FeesFilters
                        search={search}
                        setSearch={setSearch}
                        filtersState={filtersStateForComponent}
                        updateFilter={updateFilter}
                        showAdvancedFilters={showAdvancedFilters}
                        setShowAdvancedFilters={setShowAdvancedFilters}
                        handleClearFilters={handleClearFilters}
                        hasActiveFilters={hasActiveFilters}
                        statuses={statuses}
                        puroks={puroks}
                        payerTypes={payerTypes}
                        startIndex={paginationData.from}
                        endIndex={paginationData.to}
                        totalItems={paginationData.total}
                        isBulkMode={isBulkMode}
                        selectedFees={selectedFees}
                        onSelectAllOnPage={handleSelectAllOnPage}
                        onSelectAllFiltered={() => {}}
                        onSelectAll={() => {}}
                        onClearSelection={handleClearSelection}
                        isLoading={isLoading}
                        dateRangePreset={dateRangePreset}
                        setDateRangePreset={setDateRangePreset}
                        payerTypeFilter={payerTypeFilter}
                        setPayerTypeFilter={setPayerTypeFilter}
                        amountRange={amountRange}
                        setAmountRange={setAmountRange}
                        dueDateRange={dueDateRange}
                        setDueDateRange={setDueDateRange}
                        categoryFilter={categoryFilter}
                        setCategoryFilter={setCategoryFilter}
                        categories={categories}
                        searchInputRef={searchInputRef}
                        perPage={perPage}
                        onPerPageChange={handlePerPageChange}
                    />
                    
                    <FeesContent
                        fees={currentFees}
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isSelectAll={isSelectAll}
                        selectedFees={selectedFees}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        isMobile={isMobile}
                        hasActiveFilters={hasActiveFilters}
                        currentPage={paginationData.current_page}
                        totalPages={paginationData.last_page}
                        totalItems={paginationData.total}
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
                        onViewDetails={(fee) => router.get(route('admin.fees.show', fee.id))}
                        onEdit={(fee) => router.get(route('admin.fees.edit', fee.id))}
                        onCopyToClipboard={(text, label) => {
                            navigator.clipboard.writeText(text);
                            toast.success(`${label} copied to clipboard`);
                        }}
                        onCopySelectedData={handleCopySelectedData}
                        onSort={handleSort}
                        onBulkOperation={handleBulkOperation}
                        setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                        filtersState={filtersStateForComponent}
                        isPerformingBulkAction={isPerformingBulkAction}
                        selectionMode={selectionMode}
                        selectionStats={selectionStats}
                        statuses={statuses}
                        puroks={puroks}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSortChange={(value) => {
                            const [newSortBy, newSortOrder] = value.split('-');
                            setSortBy(newSortBy);
                            setSortOrder(newSortOrder as 'asc' | 'desc');
                        }}
                        getCurrentSortValue={() => `${sortBy}-${sortOrder}`}
                        isLoading={isLoading}
                    />

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
            
            <FeesDialogs
                showBulkDeleteDialog={showBulkDeleteDialog}
                setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                isPerformingBulkAction={isPerformingBulkAction}
                selectedFees={selectedFees}
                handleBulkOperation={handleBulkOperation}
                selectionStats={selectionStats}
            />
        </AppLayout>
    );
}