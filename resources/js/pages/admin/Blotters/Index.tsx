// resources/js/Pages/admin/Blotters/Index.tsx

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import AppLayout from '@/layouts/admin-app-layout';
import { Blotter, BlotterFilters, BlotterStats } from '@/types/admin/blotters/blotter';
import { blotterUtils } from '@/admin-utils/blotter-utils';
import { TooltipProvider } from '@/components/ui/tooltip';

// Import components
import BlottersHeader from '@/components/admin/blotters/BlottersHeader';
import BlottersStats from '@/components/admin/blotters/BlottersStats';
import BlottersFilters from '@/components/admin/blotters/BlottersFilters';
import BlottersContent from '@/components/admin/blotters/BlottersContent';
import BlottersDialogs from '@/components/admin/blotters/BlottersDialogs';
import { Button } from '@/components/ui/button';
import { KeyRound, Loader2 } from 'lucide-react';

// Debounce utility
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

interface PaginationData {
    data: Blotter[];
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
}

interface BlottersPageProps {
    blotters: PaginationData;
    filters: BlotterFilters;
    stats: BlotterStats;
    barangays: string[];
}

const defaultStats: BlotterStats = {
    total: 0, pending: 0, investigating: 0, resolved: 0, archived: 0,
    urgent: 0, high: 0, medium: 0, low: 0,
    today: 0, thisWeek: 0, thisMonth: 0,
};

export default function BlottersIndex({ 
    blotters: initialBlotters, 
    filters: initialFilters, 
    stats = defaultStats,
    barangays = []
}: BlottersPageProps) {
    const { flash } = usePage().props as any;
    
    // Safe data extraction
    const safeBlotters = initialBlotters || { 
        data: [], total: 0, per_page: 10, current_page: 1, last_page: 1, from: 0, to: 0 
    };
    
    // Filter states - server-side
    const [search, setSearch] = useState(initialFilters.search || '');
    const [statusFilter, setStatusFilter] = useState(initialFilters.status || 'all');
    const [priorityFilter, setPriorityFilter] = useState(initialFilters.priority || 'all');
    const [incidentTypeFilter, setIncidentTypeFilter] = useState(initialFilters.incident_type || 'all');
    const [barangayFilter, setBarangayFilter] = useState(initialFilters.barangay || 'all');
    const [dateFrom, setDateFrom] = useState(initialFilters.date_from || '');
    const [dateTo, setDateTo] = useState(initialFilters.date_to || '');
    
    // Sorting states
    const [sortBy, setSortBy] = useState(initialFilters.sort_by || 'incident_datetime');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
        (initialFilters.sort_order as 'asc' | 'desc') || 'desc'
    );
    
    // UI states
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    
    // Bulk selection states
    const [selectedBlotters, setSelectedBlotters] = useState<number[]>([]);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [isSelectAll, setIsSelectAll] = useState(false);
    const [selectionMode, setSelectionMode] = useState<'page' | 'filtered' | 'all'>('page');
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
    const [showBulkStatusDialog, setShowBulkStatusDialog] = useState(false);
    const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false);
    const [bulkEditValue, setBulkEditValue] = useState<string>('');
    
    const searchInputRef = useRef<HTMLInputElement>(null);
    const isFirstMount = useRef(true);
    
    // Debounce filters
    const debouncedSearch = useDebounce(search, 300);
    const debouncedDateFrom = useDebounce(dateFrom, 500);
    const debouncedDateTo = useDebounce(dateTo, 500);

    // Handle window resize
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleResize = () => {
            const width = window.innerWidth;
            setIsMobile(width < 768);
            if (width < 768 && viewMode === 'table') {
                setViewMode('grid');
            }
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

    // Get current page data
    const currentBlotters = safeBlotters.data || [];
    const paginationData = useMemo(() => ({
        current_page: safeBlotters.current_page || 1,
        last_page: safeBlotters.last_page || 1,
        total: safeBlotters.total || 0,
        from: safeBlotters.from || 0,
        to: safeBlotters.to || 0,
        per_page: safeBlotters.per_page || 10,
    }), [safeBlotters]);

    const getCurrentFilters = useCallback(() => {
        const filters: Record<string, any> = {};
        
        if (debouncedSearch) filters.search = debouncedSearch;
        if (statusFilter !== 'all') filters.status = statusFilter;
        if (priorityFilter !== 'all') filters.priority = priorityFilter;
        if (incidentTypeFilter !== 'all') filters.incident_type = incidentTypeFilter;
        if (barangayFilter !== 'all') filters.barangay = barangayFilter;
        if (debouncedDateFrom) filters.date_from = debouncedDateFrom;
        if (debouncedDateTo) filters.date_to = debouncedDateTo;
        if (sortBy) filters.sort_by = sortBy;
        if (sortOrder) filters.sort_order = sortOrder;
        
        return filters;
    }, [
        debouncedSearch, statusFilter, priorityFilter, incidentTypeFilter,
        barangayFilter, debouncedDateFrom, debouncedDateTo, sortBy, sortOrder
    ]);

    const reloadData = useCallback((page = 1) => {
        setIsLoading(true);
        
        const filters = { ...getCurrentFilters(), page };
        
        router.get('/admin/blotters', filters, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsLoading(false);
                setSelectedBlotters([]);
                setIsSelectAll(false);
            },
            onError: () => {
                setIsLoading(false);
                toast.error('Failed to load blotters');
            }
        });
    }, [getCurrentFilters]);

    // Server-side filtering - reload data when filters change
    useEffect(() => {
        if (isFirstMount.current) {
            isFirstMount.current = false;
            return;
        }
        
        reloadData();
    }, [
        debouncedSearch, statusFilter, priorityFilter, incidentTypeFilter,
        barangayFilter, debouncedDateFrom, debouncedDateTo, sortBy, sortOrder
    ]);

    // Reset selection when exiting bulk mode
    useEffect(() => {
        if (!isBulkMode) {
            setSelectedBlotters([]);
            setIsSelectAll(false);
        }
    }, [isBulkMode]);

    // Selection handlers
    const handleSelectAllOnPage = useCallback(() => {
        const pageIds = currentBlotters.map(blotter => blotter.id);
        if (isSelectAll) {
            setSelectedBlotters(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            setSelectedBlotters(prev => [...new Set([...prev, ...pageIds])]);
        }
        setIsSelectAll(!isSelectAll);
        setSelectionMode('page');
    }, [currentBlotters, isSelectAll]);

    const handleItemSelect = useCallback((id: number) => {
        setSelectedBlotters(prev => 
            prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
        );
    }, []);

    // Check if all items on current page are selected
    useEffect(() => {
        const allPageIds = currentBlotters.map(blotter => blotter.id);
        const allSelected = allPageIds.length > 0 && allPageIds.every(id => selectedBlotters.includes(id));
        setIsSelectAll(allSelected);
    }, [selectedBlotters, currentBlotters]);

    // Get selected blotters data
    const selectedBlottersData = useMemo(() => {
        return currentBlotters.filter(blotter => selectedBlotters.includes(blotter.id));
    }, [selectedBlotters, currentBlotters]);

    // Calculate selection stats
    const selectionStats = useMemo(() => {
        return blotterUtils.getSelectionStats(selectedBlottersData);
    }, [selectedBlottersData]);

    // Handle page change
    const handlePageChange = useCallback((page: number) => {
        reloadData(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [reloadData]);

    // Handle sort
    const handleSort = useCallback((column: string) => {
        if (sortBy === column) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    }, [sortBy]);

    // Bulk operations
    const handleBulkOperation = useCallback(async (operation: string) => {
        if (selectedBlotters.length === 0) {
            toast.error('Please select at least one blotter');
            return;
        }

        setIsPerformingBulkAction(true);

        try {
            switch (operation) {
                case 'delete':
                    setShowBulkDeleteDialog(true);
                    break;

                case 'update_status':
                    setShowBulkStatusDialog(true);
                    break;

                case 'export':
                case 'export_csv':
                    const exportData = selectedBlottersData.map(blotter => ({
                        'Blotter Number': blotter.blotter_number,
                        'Incident Type': blotter.incident_type,
                        'Date & Time': blotter.formatted_datetime,
                        'Location': blotter.location,
                        'Barangay': blotter.barangay,
                        'Reporter': blotter.reporter_name,
                        'Respondent': blotter.respondent_name || 'N/A',
                        'Status': blotter.status,
                        'Priority': blotter.priority,
                    }));
                    
                    const headers = Object.keys(exportData[0]);
                    const csv = [
                        headers.join(','),
                        ...exportData.map(row => 
                            headers.map(header => {
                                const value = row[header as keyof typeof row];
                                return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
                            }).join(',')
                        )
                    ].join('\n');
                    
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `blotters-export-${new Date().toISOString().split('T')[0]}.csv`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                    
                    toast.success(`${selectedBlotters.length} blotters exported`);
                    break;

                case 'print':
                    selectedBlotters.forEach(id => {
                        window.open(`/admin/blotters/${id}/print`, '_blank');
                    });
                    toast.success(`${selectedBlotters.length} blotter(s) opened for printing`);
                    break;

                case 'copy_data':
                    handleCopySelectedData();
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
    }, [selectedBlotters, selectedBlottersData]);

    const handleBulkStatusUpdate = useCallback(async () => {
        if (!bulkEditValue) {
            toast.error('Please select a status');
            return;
        }
        
        setIsPerformingBulkAction(true);

        try {
            await router.post('/admin/blotters/bulk-action', {
                action: 'update_status',
                blotter_ids: selectedBlotters,
                status: bulkEditValue
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedBlotters([]);
                    setBulkEditValue('');
                    setShowBulkStatusDialog(false);
                    reloadData(paginationData.current_page);
                    toast.success(`${selectedBlotters.length} blotter statuses updated`);
                },
                onError: () => toast.error('Failed to update blotter status')
            });
        } catch (error) {
            console.error('Bulk status update error:', error);
            toast.error('An error occurred during the operation.');
        } finally {
            setIsPerformingBulkAction(false);
        }
    }, [selectedBlotters, bulkEditValue, paginationData.current_page, reloadData]);

    const handleBulkDelete = useCallback(async () => {
        setIsPerformingBulkAction(true);

        try {
            await router.post('/admin/blotters/bulk-action', {
                action: 'delete',
                blotter_ids: selectedBlotters,
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedBlotters([]);
                    setShowBulkDeleteDialog(false);
                    reloadData(paginationData.current_page);
                    toast.success(`${selectedBlotters.length} blotters deleted`);
                },
                onError: () => toast.error('Failed to delete blotters')
            });
        } catch (error) {
            console.error('Bulk delete error:', error);
            toast.error('An error occurred during the operation.');
        } finally {
            setIsPerformingBulkAction(false);
        }
    }, [selectedBlotters, paginationData.current_page, reloadData]);

    // Individual blotter operations
    const handleDelete = useCallback((blotter: Blotter) => {
        if (confirm(`Are you sure you want to delete blotter #${blotter.blotter_number || blotter.id}?`)) {
            router.delete(`/admin/blotters/${blotter.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedBlotters(prev => prev.filter(id => id !== blotter.id));
                    reloadData(paginationData.current_page);
                    toast.success('Blotter deleted successfully');
                },
                onError: () => toast.error('Failed to delete blotter')
            });
        }
    }, [paginationData.current_page, reloadData]);

    const handleClearFilters = useCallback(() => {
        setSearch('');
        setStatusFilter('all');
        setPriorityFilter('all');
        setIncidentTypeFilter('all');
        setBarangayFilter('all');
        setDateFrom('');
        setDateTo('');
        setSortBy('incident_datetime');
        setSortOrder('desc');
    }, []);

    const handleClearSelection = useCallback(() => {
        setSelectedBlotters([]);
        setIsSelectAll(false);
    }, []);

    const handleCopySelectedData = useCallback(() => {
        if (selectedBlottersData.length === 0) {
            toast.error('No data to copy');
            return;
        }
        
        const data = selectedBlottersData.map(blotter => ({
            'Blotter #': blotter.blotter_number,
            'Incident Type': blotter.incident_type,
            'Date & Time': blotter.formatted_datetime,
            'Location': blotter.location,
            'Reporter': blotter.reporter_name,
            'Respondent': blotter.respondent_name || 'N/A',
            'Status': blotter.status,
            'Priority': blotter.priority,
        }));
        
        const csvData = [
            Object.keys(data[0]).join(','),
            ...data.map(row => Object.values(row).join(','))
        ].join('\n');
        
        navigator.clipboard.writeText(csvData).then(() => {
            toast.success(`${selectedBlottersData.length} records copied to clipboard`);
        }).catch(() => {
            toast.error('Failed to copy to clipboard');
        });
    }, [selectedBlottersData]);

    const updateFilter = useCallback((key: keyof BlotterFilters, value: string) => {
        switch (key) {
            case 'status': setStatusFilter(value); break;
            case 'priority': setPriorityFilter(value); break;
            case 'incident_type': setIncidentTypeFilter(value); break;
            case 'barangay': setBarangayFilter(value); break;
            case 'date_from': setDateFrom(value); break;
            case 'date_to': setDateTo(value); break;
        }
    }, []);

    const hasActiveFilters = useMemo(() => Boolean(
        search || 
        statusFilter !== 'all' ||
        priorityFilter !== 'all' ||
        incidentTypeFilter !== 'all' ||
        barangayFilter !== 'all' ||
        dateFrom ||
        dateTo
    ), [search, statusFilter, priorityFilter, incidentTypeFilter, barangayFilter, dateFrom, dateTo]);

    // Keyboard shortcuts - using refs to avoid dependency issues
    const bulkModeRef = useRef(isBulkMode);
    const selectedRef = useRef(selectedBlotters);
    
    useEffect(() => {
        bulkModeRef.current = isBulkMode;
        selectedRef.current = selectedBlotters;
    }, [isBulkMode, selectedBlotters]);

    useEffect(() => {
        if (isMobile) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'b') {
                e.preventDefault();
                setIsBulkMode(prev => !prev);
            }
            
            if (e.ctrlKey && e.key.toLowerCase() === 'a' && bulkModeRef.current) {
                e.preventDefault();
                const pageIds = currentBlotters.map(b => b.id);
                setSelectedBlotters(prev => {
                    const allSelected = pageIds.length > 0 && pageIds.every(id => prev.includes(id));
                    return allSelected 
                        ? prev.filter(id => !pageIds.includes(id))
                        : [...new Set([...prev, ...pageIds])];
                });
                setIsSelectAll(prev => !prev);
                setSelectionMode('page');
            }
            
            if (e.key === 'Escape' && bulkModeRef.current) {
                e.preventDefault();
                selectedRef.current.length > 0 ? setSelectedBlotters([]) : setIsBulkMode(false);
            }
            
            if (e.ctrlKey && e.key.toLowerCase() === 'f') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            
            if (e.key === 'Delete' && bulkModeRef.current && selectedRef.current.length > 0) {
                e.preventDefault();
                setShowBulkDeleteDialog(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isMobile, currentBlotters]);

    // Filters state for component
    const filtersStateForComponent = useMemo(() => ({
        status: statusFilter,
        priority: priorityFilter,
        incident_type: incidentTypeFilter,
        barangay: barangayFilter,
        date_from: dateFrom,
        date_to: dateTo,
        sort_by: sortBy,
        sort_order: sortOrder,
        search,
    }), [statusFilter, priorityFilter, incidentTypeFilter, barangayFilter, dateFrom, dateTo, sortBy, sortOrder, search]);

    return (
        <AppLayout
            title="Blotter Records"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Blotters', href: '/admin/blotters' }
            ]}
        >
            <TooltipProvider>
                <div className="space-y-4 sm:space-y-6">
                    {/* Loading Indicator */}
                    {isLoading && (
                        <div className="fixed top-4 right-4 z-50 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">Loading...</span>
                        </div>
                    )}
                    
                    <BlottersHeader 
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isMobile={isMobile}
                    />

                    <BlottersStats 
                        globalStats={stats}
                        filteredStats={stats}
                        isLoading={isLoading}
                    />

                    <BlottersFilters
                        search={search}
                        setSearch={setSearch}
                        filtersState={filtersStateForComponent}
                        updateFilter={updateFilter}
                        showAdvancedFilters={showAdvancedFilters}
                        setShowAdvancedFilters={setShowAdvancedFilters}
                        handleClearFilters={handleClearFilters}
                        hasActiveFilters={hasActiveFilters}
                        isMobile={isMobile}
                        totalItems={paginationData.total}
                        startIndex={paginationData.from}
                        endIndex={paginationData.to}
                        searchInputRef={searchInputRef as React.RefObject<HTMLInputElement>}
                        isLoading={isLoading}
                        barangays={barangays}
                    />

                    <BlottersContent
                        blotters={currentBlotters}
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isSelectAll={isSelectAll}
                        selectedBlotters={selectedBlotters}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        isMobile={isMobile}
                        hasActiveFilters={hasActiveFilters}
                        currentPage={paginationData.current_page}
                        totalPages={paginationData.last_page}
                        totalItems={paginationData.total}
                        itemsPerPage={paginationData.per_page}
                        onPageChange={handlePageChange}
                        onSelectAllOnPage={handleSelectAllOnPage}
                        onSelectAllFiltered={() => {}}
                        onSelectAll={() => {}}
                        onItemSelect={handleItemSelect}
                        onClearFilters={handleClearFilters}
                        onClearSelection={handleClearSelection}
                        onDelete={handleDelete}
                        onSort={handleSort}
                        onBulkOperation={handleBulkOperation}
                        onCopySelectedData={handleCopySelectedData}
                        setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                        setShowBulkStatusDialog={setShowBulkStatusDialog}
                        filtersState={filtersStateForComponent}
                        isPerformingBulkAction={isPerformingBulkAction}
                        selectionMode={selectionMode}
                        selectionStats={selectionStats}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSortChange={(value) => {
                            const [newSortBy, newSortOrder] = value.split('-');
                            setSortBy(newSortBy);
                            setSortOrder(newSortOrder as 'asc' | 'desc');
                        }}
                        getCurrentSortValue={() => `${sortBy}-${sortOrder}`}
                    />

                    {/* Keyboard Shortcuts Help */}
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

            <BlottersDialogs
                showBulkDeleteDialog={showBulkDeleteDialog}
                setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                showBulkStatusDialog={showBulkStatusDialog}
                setShowBulkStatusDialog={setShowBulkStatusDialog}
                isPerformingBulkAction={isPerformingBulkAction}
                selectedBlotters={selectedBlotters}
                handleBulkOperation={handleBulkDelete}
                handleBulkStatusUpdate={handleBulkStatusUpdate}
                selectionStats={selectionStats}
                bulkEditValue={bulkEditValue}
                setBulkEditValue={setBulkEditValue}
            />
        </AppLayout>
    );
}