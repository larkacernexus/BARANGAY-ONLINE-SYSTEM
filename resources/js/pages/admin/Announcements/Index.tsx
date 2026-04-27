// resources/js/pages/admin/announcements/index.tsx

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import AppLayout from '@/layouts/admin-app-layout';
import { 
    Announcement, 
    AnnouncementFilters, 
    AnnouncementStats, 
    PaginationData,
    BulkOperation,
    SelectionMode,
    SelectionStats,
    PRIORITY_DISPLAY,
    PriorityLevel
} from '@/types/admin/announcements/announcement.types';
import { announcementUtils } from '@/admin-utils/announcement-utils';
import { TooltipProvider } from '@/components/ui/tooltip';

// Import AdminUI components
import AnnouncementsHeader from '@/components/admin/announcements/AnnouncementsHeader';
import AnnouncementsStats from '@/components/admin/announcements/AnnouncementsStats';
import AnnouncementsFilters from '@/components/admin/announcements/AnnouncementsFilters';
import AnnouncementsContent from '@/components/admin/announcements/AnnouncementsContent';
import AnnouncementsDialogs from '@/components/admin/announcements/AnnouncementsDialogs';
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

interface AnnouncementsPageProps {
    announcements: PaginationData;
    filters: AnnouncementFilters;
    types: Record<string, string>;
    audience_types: Record<string, string>;
    priorities: Record<string, string>;
    stats: AnnouncementStats;
}

const defaultStats: AnnouncementStats = {
    total: 0,
    active: 0,
    expired: 0,
    upcoming: 0,
    unread: 0,
    personalized: 0,
    with_attachments: 0
};

// ✅ Sort options configuration
const SORT_OPTIONS = [
    { value: 'created_at-desc', label: 'Newest First' },
    { value: 'created_at-asc', label: 'Oldest First' },
    { value: 'title-asc', label: 'Title (A-Z)' },
    { value: 'title-desc', label: 'Title (Z-A)' },
    { value: 'priority-desc', label: 'Priority (High to Low)' },
    { value: 'priority-asc', label: 'Priority (Low to High)' },
    { value: 'type-asc', label: 'Type (A-Z)' },
    { value: 'type-desc', label: 'Type (Z-A)' },
    { value: 'status-asc', label: 'Status (A-Z)' },
    { value: 'status-desc', label: 'Status (Z-A)' },
    { value: 'audience_type-asc', label: 'Audience (A-Z)' },
    { value: 'audience_type-desc', label: 'Audience (Z-A)' },
] as const;

export default function AnnouncementsIndex({ 
    announcements: initialAnnouncements, 
    filters: initialFilters, 
    types, 
    priorities, 
    audience_types,
    stats = defaultStats
}: AnnouncementsPageProps) {
    const { flash } = usePage().props as any;
    
    // Safe data extraction
    const safeAnnouncements = initialAnnouncements || { 
        data: [], current_page: 1, last_page: 1, total: 0, per_page: 15, from: 0, to: 0 
    };
    
    // Filter states - server-side
    const [search, setSearch] = useState<string>(initialFilters.search || '');
    const [typeFilter, setTypeFilter] = useState<string>(initialFilters.type || 'all');
    const [statusFilter, setStatusFilter] = useState<string>(initialFilters.status || 'all');
    const [audienceTypeFilter, setAudienceTypeFilter] = useState<string>(initialFilters.audience_type || 'all');
    const [priorityFilter, setPriorityFilter] = useState<string>(initialFilters.priority || 'all');
    const [fromDate, setFromDate] = useState<string>(initialFilters.from_date || '');
    const [toDate, setToDate] = useState<string>(initialFilters.to_date || '');
    const [dateRangePreset, setDateRangePreset] = useState<string>('');
    
    // ✅ Sorting states - NOW SERVER-SIDE
    const [sortBy, setSortBy] = useState<string>(initialFilters.sort_by || 'created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
        (initialFilters.sort_order as 'asc' | 'desc') || 'desc'
    );
    
    // ✅ Per page state
    const [perPage, setPerPage] = useState<string>(initialFilters.per_page || '15');
    
    // UI states
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    
    // Bulk selection states
    const [selectedAnnouncements, setSelectedAnnouncements] = useState<number[]>([]);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [isSelectAll, setIsSelectAll] = useState(false);
    const [selectionMode, setSelectionMode] = useState<SelectionMode>('page');
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
    const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false);

    const searchInputRef = useRef<HTMLInputElement>(null);
    const isFirstMount = useRef(true);
    
    // Debounce filters
    const debouncedSearch = useDebounce(search, 300);
    const debouncedFromDate = useDebounce(fromDate, 500);
    const debouncedToDate = useDebounce(toDate, 500);

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
    const currentAnnouncements = safeAnnouncements.data || [];
    const paginationData = useMemo(() => ({
        current_page: safeAnnouncements.current_page || 1,
        last_page: safeAnnouncements.last_page || 1,
        total: safeAnnouncements.total || 0,
        from: safeAnnouncements.from || 0,
        to: safeAnnouncements.to || 0,
        per_page: safeAnnouncements.per_page || parseInt(perPage) || 15,
    }), [safeAnnouncements, perPage]);

    const getCurrentFilters = useCallback(() => ({
        search: debouncedSearch,
        type: typeFilter,
        status: statusFilter,
        audience_type: audienceTypeFilter,
        priority: priorityFilter,
        from_date: debouncedFromDate,
        to_date: debouncedToDate,
        sort_by: sortBy,
        sort_order: sortOrder,
        per_page: perPage,
    }), [
        debouncedSearch, typeFilter, statusFilter, audienceTypeFilter, 
        priorityFilter, debouncedFromDate, debouncedToDate, sortBy, sortOrder, perPage
    ]);

    const reloadData = useCallback((page = 1) => {
        setIsLoading(true);
        
        const filters = { ...getCurrentFilters(), page };
        
        router.get('/admin/announcements', filters, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsLoading(false);
                setSelectedAnnouncements([]);
                setIsSelectAll(false);
            },
            onError: () => {
                setIsLoading(false);
                toast.error('Failed to load announcements');
            }
        });
    }, [getCurrentFilters]);

    // ✅ Server-side filtering & sorting - reload when filters OR sort OR perPage changes
    useEffect(() => {
        if (isFirstMount.current) {
            isFirstMount.current = false;
            return;
        }
        
        reloadData();
    }, [
        debouncedSearch, typeFilter, statusFilter, audienceTypeFilter,
        priorityFilter, debouncedFromDate, debouncedToDate, sortBy, sortOrder, perPage
    ]);

    // Handle per page change
    const handlePerPageChange = useCallback((value: string) => {
        setPerPage(value);
        reloadData(1);
    }, [reloadData]);

    // Reset selection when exiting bulk mode
    useEffect(() => {
        if (!isBulkMode) {
            setSelectedAnnouncements([]);
            setIsSelectAll(false);
        }
    }, [isBulkMode]);

    // Selection handlers
    const handleSelectAllOnPage = useCallback(() => {
        const pageIds = currentAnnouncements.map(a => a.id);
        if (isSelectAll) {
            setSelectedAnnouncements(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            setSelectedAnnouncements(prev => [...new Set([...prev, ...pageIds])]);
        }
        setIsSelectAll(!isSelectAll);
        setSelectionMode('page');
    }, [currentAnnouncements, isSelectAll]);

    const handleItemSelect = useCallback((id: number) => {
        setSelectedAnnouncements(prev => 
            prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
        );
    }, []);

    // Check if all items on current page are selected
    useEffect(() => {
        const allPageIds = currentAnnouncements.map(a => a.id);
        const allSelected = allPageIds.length > 0 && allPageIds.every(id => selectedAnnouncements.includes(id));
        setIsSelectAll(allSelected);
    }, [selectedAnnouncements, currentAnnouncements]);

    // Get selected announcements data
    const selectedAnnouncementsData = useMemo(() => {
        return currentAnnouncements.filter(a => selectedAnnouncements.includes(a.id));
    }, [selectedAnnouncements, currentAnnouncements]);

    // Calculate selection stats
    const selectionStats: SelectionStats = useMemo(() => {
        return announcementUtils.getSelectionStats(selectedAnnouncementsData);
    }, [selectedAnnouncementsData]);

    // Handle page change
    const handlePageChange = useCallback((page: number) => {
        reloadData(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [reloadData]);

    // ✅ Handle sort change - server-side
    const handleSortChange = useCallback((value: string) => {
        const [newSortBy, newSortOrder] = value.split('-');
        setSortBy(newSortBy);
        setSortOrder(newSortOrder as 'asc' | 'desc');
    }, []);

    // ✅ Get current sort value for dropdown
    const getCurrentSortValue = useCallback(() => {
        return `${sortBy}-${sortOrder}`;
    }, [sortBy, sortOrder]);

    // Bulk operations
    const handleBulkOperation = useCallback(async (operation: BulkOperation) => {
        if (selectedAnnouncements.length === 0) {
            toast.error('Please select at least one announcement');
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
                    await router.post('/admin/announcements/bulk-action', {
                        action: operation,
                        announcement_ids: selectedAnnouncements,
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            setSelectedAnnouncements([]);
                            reloadData(paginationData.current_page);
                            toast.success(`${selectedAnnouncements.length} announcements ${operation}d successfully`);
                        },
                        onError: () => toast.error(`Failed to ${operation} announcements`)
                    });
                    break;

                case 'export':
                    const exportData = selectedAnnouncementsData.map(announcement => ({
                        'Title': announcement.title || 'N/A',
                        'Type': announcement.type || 'N/A',
                        'Priority': PRIORITY_DISPLAY[announcement.priority as PriorityLevel] || 'Normal',
                        'Audience': announcement.audience_type || 'N/A',
                        'Status': announcement.status || 'N/A',
                        'Created': announcementUtils.formatDate(announcement.created_at),
                    }));
                    
                    const csv = [
                        Object.keys(exportData[0]).join(','),
                        ...exportData.map(row => Object.values(row).map(v => `"${v}"`).join(','))
                    ].join('\n');
                    
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `announcements-export-${new Date().toISOString().split('T')[0]}.csv`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                    
                    toast.success(`${selectedAnnouncements.length} announcements exported`);
                    break;

                case 'print':
                    selectedAnnouncements.forEach(id => {
                        window.open(`/admin/announcements/${id}/print`, '_blank');
                    });
                    toast.success(`${selectedAnnouncements.length} announcement(s) opened for printing`);
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
    }, [selectedAnnouncements, selectedAnnouncementsData, paginationData.current_page, reloadData]);

    const handleBulkDelete = useCallback(async () => {
        setIsPerformingBulkAction(true);

        try {
            await router.post('/admin/announcements/bulk-action', {
                action: 'delete',
                announcement_ids: selectedAnnouncements,
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedAnnouncements([]);
                    setShowBulkDeleteDialog(false);
                    reloadData(paginationData.current_page);
                    toast.success(`${selectedAnnouncements.length} announcements deleted successfully`);
                },
                onError: () => toast.error('Failed to delete announcements')
            });
        } catch (error) {
            console.error('Bulk delete error:', error);
            toast.error('An error occurred during the operation.');
        } finally {
            setIsPerformingBulkAction(false);
        }
    }, [selectedAnnouncements, paginationData.current_page, reloadData]);

    // Individual announcement operations
    const handleDelete = useCallback((announcement: Announcement) => {
        if (confirm(`Are you sure you want to delete announcement "${announcement.title || 'Untitled'}"?`)) {
            router.delete(`/admin/announcements/${announcement.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedAnnouncements(prev => prev.filter(id => id !== announcement.id));
                    reloadData(paginationData.current_page);
                    toast.success('Announcement deleted successfully');
                },
                onError: () => toast.error('Failed to delete announcement')
            });
        }
    }, [paginationData.current_page, reloadData]);

    const handleToggleStatus = useCallback((announcement: Announcement) => {
        router.post(`/admin/announcements/${announcement.id}/toggle-status`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                reloadData(paginationData.current_page);
                toast.success('Announcement status updated');
            },
            onError: () => toast.error('Failed to update announcement status')
        });
    }, [paginationData.current_page, reloadData]);

    const handleClearFilters = useCallback(() => {
        setSearch('');
        setTypeFilter('all');
        setStatusFilter('all');
        setAudienceTypeFilter('all');
        setPriorityFilter('all');
        setFromDate('');
        setToDate('');
        setDateRangePreset('');
        setSortBy('created_at');
        setSortOrder('desc');
        setPerPage('15');
    }, []);

    const handleClearSelection = useCallback(() => {
        setSelectedAnnouncements([]);
        setIsSelectAll(false);
    }, []);

    const handleCopySelectedData = useCallback(() => {
        if (selectedAnnouncementsData.length === 0) {
            toast.error('No data to copy');
            return;
        }
        
        const data = selectedAnnouncementsData.map(announcement => ({
            'Title': announcement.title || 'N/A',
            'Type': announcement.type || 'N/A',
            'Priority': PRIORITY_DISPLAY[announcement.priority as PriorityLevel] || 'Normal',
            'Audience': announcement.audience_type || 'N/A',
            'Status': announcement.status || 'N/A',
            'Created': announcementUtils.formatDate(announcement.created_at),
        }));
        
        const csv = [
            Object.keys(data[0]).join('\t'),
            ...data.map(row => Object.values(row).join('\t'))
        ].join('\n');
        
        navigator.clipboard.writeText(csv).then(() => {
            toast.success(`${selectedAnnouncementsData.length} records copied to clipboard`);
        }).catch(() => {
            toast.error('Failed to copy to clipboard');
        });
    }, [selectedAnnouncementsData]);

    const updateFilter = useCallback((key: keyof AnnouncementFilters, value: string) => {
        switch (key) {
            case 'type': setTypeFilter(value); break;
            case 'status': setStatusFilter(value); break;
            case 'audience_type': setAudienceTypeFilter(value); break;
            case 'from_date': setFromDate(value); break;
            case 'to_date': setToDate(value); break;
        }
    }, []);

    const hasActiveFilters = useMemo(() => Boolean(
        search || 
        typeFilter !== 'all' || 
        statusFilter !== 'all' ||
        audienceTypeFilter !== 'all' ||
        priorityFilter !== 'all' ||
        fromDate ||
        toDate
    ), [search, typeFilter, statusFilter, audienceTypeFilter, priorityFilter, fromDate, toDate]);

    const filtersStateForComponent = useMemo(() => ({
        type: typeFilter,
        status: statusFilter,
        audience_type: audienceTypeFilter,
        from_date: fromDate,
        to_date: toDate,
        search,
        priority: priorityFilter,
        per_page: perPage
    }), [typeFilter, statusFilter, audienceTypeFilter, fromDate, toDate, search, priorityFilter, perPage]);

    // Keyboard shortcuts
    const bulkModeRef = useRef(isBulkMode);
    const selectedRef = useRef(selectedAnnouncements);
    
    useEffect(() => {
        bulkModeRef.current = isBulkMode;
        selectedRef.current = selectedAnnouncements;
    }, [isBulkMode, selectedAnnouncements]);

    useEffect(() => {
        if (isMobile) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'b') {
                e.preventDefault();
                setIsBulkMode(prev => !prev);
            }
            
            if (e.ctrlKey && e.key.toLowerCase() === 'a' && bulkModeRef.current) {
                e.preventDefault();
                const pageIds = currentAnnouncements.map(a => a.id);
                setSelectedAnnouncements(prev => {
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
                selectedRef.current.length > 0 ? setSelectedAnnouncements([]) : setIsBulkMode(false);
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
    }, [isMobile, currentAnnouncements]);

    return (
        <AppLayout
            title="Announcements Management"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Announcements', href: '/admin/announcements' }
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
                    
                    <AnnouncementsHeader 
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isMobile={isMobile}
                    />

                    <AnnouncementsStats 
                        globalStats={stats}
                        filteredStats={stats}
                        isLoading={isLoading}
                    />

                    <AnnouncementsFilters
                        search={search}
                        setSearch={setSearch}
                        filtersState={filtersStateForComponent}
                        updateFilter={updateFilter}
                        showAdvancedFilters={showAdvancedFilters}
                        setShowAdvancedFilters={setShowAdvancedFilters}
                        handleClearFilters={handleClearFilters}
                        hasActiveFilters={hasActiveFilters}
                        types={types}
                        priorities={priorities}
                        audienceTypes={audience_types}
                        isMobile={isMobile}
                        totalItems={paginationData.total}
                        startIndex={paginationData.from}
                        endIndex={paginationData.to}
                        searchInputRef={searchInputRef}
                        isLoading={isLoading}
                        handleExport={() => handleBulkOperation('export')}
                        priorityFilter={priorityFilter}
                        setPriorityFilter={setPriorityFilter}
                        audienceTypeFilter={audienceTypeFilter}
                        setAudienceTypeFilter={setAudienceTypeFilter}
                        dateRangePreset={dateRangePreset}
                        setDateRangePreset={setDateRangePreset}
                        perPage={perPage}
                        onPerPageChange={handlePerPageChange}
                    />

                    <AnnouncementsContent
                        announcements={currentAnnouncements}
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isSelectAll={isSelectAll}
                        selectedAnnouncements={selectedAnnouncements}
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
                        onToggleStatus={handleToggleStatus}
                        onBulkOperation={handleBulkOperation}
                        onCopySelectedData={handleCopySelectedData}
                        setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                        filtersState={filtersStateForComponent}
                        isPerformingBulkAction={isPerformingBulkAction}
                        selectionMode={selectionMode}
                        selectionStats={selectionStats}
                        types={types}
                        priorities={priorities}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSortChange={handleSortChange}
                        getCurrentSortValue={getCurrentSortValue}
                        sortOptions={SORT_OPTIONS}
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

            <AnnouncementsDialogs
                showBulkDeleteDialog={showBulkDeleteDialog}
                setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                isPerformingBulkAction={isPerformingBulkAction}
                selectedAnnouncements={selectedAnnouncements}
                handleBulkOperation={handleBulkDelete}
                selectionStats={selectionStats}
            />
        </AppLayout>
    );
}