import { router, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import AppLayout from '@/layouts/admin-app-layout';
import { 
    BulkAction, 
    SelectionMode,
    Household,
    Purok,
    HouseholdFilters,
    FlashMessage,
    SelectionStats
} from '@/types/admin/households/household.types';
import { 
    getSelectionStats, 
    formatForClipboard
} from '@/admin-utils/householdUtils';
import { TooltipProvider } from '@/components/ui/tooltip';

// Import reusable components
import HouseholdsHeader from '@/components/admin/households/HouseholdsHeader';
import HouseholdsStats from '@/components/admin/households/HouseholdsStats';
import HouseholdsFilters from '@/components/admin/households/HouseholdsFilters';
import HouseholdsContent from '@/components/admin/households/HouseholdsContent';
import HouseholdsDialogs from '@/components/admin/households/HouseholdsDialogs';
import { Button } from '@/components/ui/button';
import { KeyRound, Loader2 } from 'lucide-react';

interface HouseholdsPageProps {
    households: {
        data: Household[];
        current_page: number;
        last_page: number;
        total: number;
        from: number;
        to: number;
    };
    stats: any[];
    puroks: Purok[];
    totalCount: number;
    filters: HouseholdFilters;
}

// Helper function to safely convert to string
const safeToString = (value: string | number | undefined): string => {
    if (value === undefined || value === null) return '';
    return String(value);
};

// Debounce utility
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export default function Households({ 
    households: initialHouseholds, 
    stats, 
    puroks = [], 
    totalCount,
    filters: initialFilters 
}: HouseholdsPageProps) {
    const { flash } = usePage<{ flash: FlashMessage }>().props;
    
    // Search and filter states - server-side
    const [search, setSearch] = useState(initialFilters.search || '');
    const [statusFilter, setStatusFilter] = useState<string>(
        typeof initialFilters.status === 'string' ? initialFilters.status : 'all'
    );
    
    // ✅ FIXED: Safely convert to string
    const [purokFilter, setPurokFilter] = useState<string>(
        safeToString(initialFilters.purok_id) || 'all'
    );
    const [minMembers, setMinMembers] = useState<string>(
        safeToString(initialFilters.min_members)
    );
    const [maxMembers, setMaxMembers] = useState<string>(
        safeToString(initialFilters.max_members)
    );
    
    const [fromDate, setFromDate] = useState<string>(initialFilters.from_date || '');
    const [toDate, setToDate] = useState<string>(initialFilters.to_date || '');
    const [sortBy, setSortBy] = useState<string>(initialFilters.sort_by || 'created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
        (initialFilters.sort_order as 'asc' | 'desc') || 'desc'
    );
    
    // UI states
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    
    // Mobile detection
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [windowWidth, setWindowWidth] = useState<number>(
        typeof window !== 'undefined' ? window.innerWidth : 1024
    );
    
    // Bulk selection states
    const [selectedHouseholds, setSelectedHouseholds] = useState<number[]>([]);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [isSelectAll, setIsSelectAll] = useState(false);
    const [selectionMode, setSelectionMode] = useState<SelectionMode>('page');
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
    const [showBulkStatusDialog, setShowBulkStatusDialog] = useState(false);
    const [showBulkPurokDialog, setShowBulkPurokDialog] = useState(false);
    const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false);
    const [bulkEditValue, setBulkEditValue] = useState<string>('');
    
    const searchInputRef = useRef<HTMLInputElement>(null);
    const isFirstMount = useRef(true);
    
    // Debounce filters to prevent too many requests
    const debouncedSearch = useDebounce(search, 300);
    const debouncedMinMembers = useDebounce(minMembers, 500);
    const debouncedMaxMembers = useDebounce(maxMembers, 500);
    const debouncedFromDate = useDebounce(fromDate, 500);
    const debouncedToDate = useDebounce(toDate, 500);

    // Flash messages
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // Responsive behavior
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleResize = () => {
            const width = window.innerWidth;
            setWindowWidth(width);
            setIsMobile(width < 768);
            if (width < 768 && viewMode === 'table') {
                setViewMode('grid');
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, [viewMode]);

    // Get current page households
    const currentHouseholds = initialHouseholds?.data || [];
    const paginationData = {
        current_page: initialHouseholds?.current_page || 1,
        last_page: initialHouseholds?.last_page || 1,
        total: initialHouseholds?.total || 0,
        from: initialHouseholds?.from || 0,
        to: initialHouseholds?.to || 0,
    };

    const getCurrentFilters = () => {
        const filters: Record<string, any> = {};
        
        if (debouncedSearch) filters.search = debouncedSearch;
        if (statusFilter !== 'all') filters.status = statusFilter;
        if (purokFilter !== 'all') filters.purok_id = purokFilter; // Send as string
        if (minMembers) filters.min_members = parseInt(minMembers, 10); // Convert to number for API
        if (maxMembers) filters.max_members = parseInt(maxMembers, 10); // Convert to number for API
        if (debouncedFromDate) filters.from_date = debouncedFromDate;
        if (debouncedToDate) filters.to_date = debouncedToDate;
        if (sortBy) filters.sort_by = sortBy;
        if (sortOrder) filters.sort_order = sortOrder;
        
        return filters;
    };

    const reloadData = (page = 1) => {
        setIsLoading(true);
        
        const filters = { ...getCurrentFilters(), page };
        
        router.get('/admin/households', 
            filters,
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setIsLoading(false);
                    setSelectedHouseholds([]);
                    setIsSelectAll(false);
                },
                onError: () => {
                    setIsLoading(false);
                    toast.error('Failed to load households');
                }
            }
        );
    };

    // Server-side filtering - reload data when filters change
    useEffect(() => {
        if (isFirstMount.current) {
            isFirstMount.current = false;
            return;
        }
        
        reloadData();
    }, [
        debouncedSearch, 
        statusFilter, 
        purokFilter, 
        debouncedMinMembers, 
        debouncedMaxMembers, 
        debouncedFromDate, 
        debouncedToDate, 
        sortBy, 
        sortOrder
    ]);

    // Reset selection when exiting bulk mode
    useEffect(() => {
        if (!isBulkMode) {
            setSelectedHouseholds([]);
            setIsSelectAll(false);
        }
    }, [isBulkMode]);

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
                    if (selectedHouseholds.length > 0) {
                        setSelectedHouseholds([]);
                        setIsSelectAll(false);
                    } else {
                        setIsBulkMode(false);
                    }
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
            if (e.key === 'Delete' && isBulkMode && selectedHouseholds.length > 0) {
                e.preventDefault();
                setShowBulkDeleteDialog(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isBulkMode, selectedHouseholds, isMobile]);

    // Selection handlers
    const handleSelectAllOnPage = () => {
        const pageIds = currentHouseholds.map(household => household.id);
        if (isSelectAll) {
            setSelectedHouseholds(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedHouseholds, ...pageIds])];
            setSelectedHouseholds(newSelected);
        }
        setIsSelectAll(!isSelectAll);
        setSelectionMode('page');
    };

    const handleItemSelect = (id: number) => {
        setSelectedHouseholds(prev => {
            if (prev.includes(id)) {
                return prev.filter(itemId => itemId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    // Check if all items on current page are selected
    useEffect(() => {
        const allPageIds = currentHouseholds.map(household => household.id);
        const allSelected = allPageIds.length > 0 && allPageIds.every(id => selectedHouseholds.includes(id));
        setIsSelectAll(allSelected);
    }, [selectedHouseholds, currentHouseholds]);

    // Get selected households data
    const selectedHouseholdsData = currentHouseholds.filter(household => 
        selectedHouseholds.includes(household.id)
    );

    // Calculate selection stats
    const selectionStats: SelectionStats = getSelectionStats(selectedHouseholdsData);

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

    const getCurrentSortValue = (): string => {
        return `${sortBy}-${sortOrder}`;
    };

    // Bulk operations
    const handleBulkOperation = async (operation: BulkAction) => {
        if (selectedHouseholds.length === 0) {
            toast.error('Please select at least one household');
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
                    await router.post('/admin/households/bulk-action', {
                        action: operation,
                        household_ids: selectedHouseholds,
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            setSelectedHouseholds([]);
                            reloadData(paginationData.current_page);
                            toast.success(`${selectedHouseholds.length} households ${operation}d successfully`);
                        },
                        onError: () => {
                            toast.error(`Failed to ${operation} households`);
                        }
                    });
                    break;

                case 'export':
                    const exportData = selectedHouseholdsData.map(household => ({
                        'Household Number': household.household_number,
                        'Head of Household': household.head_of_family || 'N/A',
                        'Purok': household.purok?.name || 'N/A',
                        'Members': household.member_count || 0,
                        'Status': household.status,
                        'Address': household.address || 'N/A',
                        'Created': new Date(household.created_at).toLocaleDateString()
                    }));
                    
                    const csv = [
                        Object.keys(exportData[0]).join(','),
                        ...exportData.map(row => Object.values(row).map(v => `"${v}"`).join(','))
                    ].join('\n');
                    
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `households-export-${new Date().toISOString().split('T')[0]}.csv`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                    
                    toast.success(`${selectedHouseholds.length} households exported`);
                    break;

                case 'print':
                    selectedHouseholds.forEach(id => {
                        window.open(`/admin/households/${id}/print`, '_blank');
                    });
                    toast.success(`${selectedHouseholds.length} household(s) opened for printing`);
                    break;

                case 'change_status':
                    setShowBulkStatusDialog(true);
                    break;

                case 'change_purok':
                    setShowBulkPurokDialog(true);
                    break;
            }
        } catch (error) {
            console.error('Bulk operation error:', error);
            toast.error('An error occurred during the bulk operation.');
        } finally {
            setIsPerformingBulkAction(false);
        }
    };

    const handleBulkStatusUpdate = async (status: string) => {
        setIsPerformingBulkAction(true);

        try {
            await router.post('/admin/households/bulk-action', {
                action: 'update_status',
                household_ids: selectedHouseholds,
                status: status,
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedHouseholds([]);
                    setShowBulkStatusDialog(false);
                    setBulkEditValue('');
                    reloadData(paginationData.current_page);
                    toast.success(`Status updated to ${status} for ${selectedHouseholds.length} households`);
                },
                onError: () => {
                    toast.error('Failed to update status');
                }
            });
        } catch (error) {
            console.error('Bulk status update error:', error);
            toast.error('An error occurred during the operation.');
        } finally {
            setIsPerformingBulkAction(false);
        }
    };

    const handleBulkPurokUpdate = async (purokId: number) => {
        setIsPerformingBulkAction(true);

        try {
            await router.post('/admin/households/bulk-action', {
                action: 'update_purok',
                household_ids: selectedHouseholds,
                purok_id: purokId,
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedHouseholds([]);
                    setShowBulkPurokDialog(false);
                    setBulkEditValue('');
                    reloadData(paginationData.current_page);
                    toast.success(`Purok updated for ${selectedHouseholds.length} households`);
                },
                onError: () => {
                    toast.error('Failed to update purok');
                }
            });
        } catch (error) {
            console.error('Bulk purok update error:', error);
            toast.error('An error occurred during the operation.');
        } finally {
            setIsPerformingBulkAction(false);
        }
    };

    const handleBulkDelete = async () => {
        setIsPerformingBulkAction(true);

        try {
            await router.post('/admin/households/bulk-action', {
                action: 'delete',
                household_ids: selectedHouseholds,
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedHouseholds([]);
                    setShowBulkDeleteDialog(false);
                    reloadData(paginationData.current_page);
                    toast.success(`${selectedHouseholds.length} households deleted successfully`);
                },
                onError: () => {
                    toast.error('Failed to delete households');
                }
            });
        } catch (error) {
            console.error('Bulk delete error:', error);
            toast.error('An error occurred during the operation.');
        } finally {
            setIsPerformingBulkAction(false);
        }
    };

    const handleCopySelectedData = () => {
        if (selectedHouseholdsData.length === 0) {
            toast.error('No data to copy');
            return;
        }
        
        const csv = formatForClipboard(selectedHouseholdsData, puroks);
        
        navigator.clipboard.writeText(csv).then(() => {
            toast.success(`${selectedHouseholdsData.length} records copied to clipboard`);
        }).catch(() => {
            toast.error('Failed to copy to clipboard');
        });
    };

    const handleDelete = (household: Household) => {
        if (confirm(`Are you sure you want to delete household "${household.household_number || 'Untitled'}"?`)) {
            router.delete(`/admin/households/${household.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedHouseholds(selectedHouseholds.filter(id => id !== household.id));
                    reloadData(paginationData.current_page);
                    toast.success('Household deleted successfully');
                },
                onError: () => {
                    toast.error('Failed to delete household');
                }
            });
        }
    };

    const handleToggleStatus = (household: Household) => {
        const newStatus = household.status === 'active' ? 'inactive' : 'active';
        router.post(`/admin/households/${household.id}/update-status`, {
            status: newStatus
        }, {
            preserveScroll: true,
            onSuccess: () => {
                reloadData(paginationData.current_page);
                toast.success(`Household status updated to ${newStatus}`);
            },
            onError: () => {
                toast.error('Failed to update household status');
            }
        });
    };

    const handleCopyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success(`${label} copied to clipboard`);
        }).catch(() => {
            toast.error('Failed to copy to clipboard');
        });
    };

    const handleClearFilters = () => {
        setSearch('');
        setStatusFilter('all');
        setPurokFilter('all');
        setMinMembers('');
        setMaxMembers('');
        setFromDate('');
        setToDate('');
        setSortBy('created_at');
        setSortOrder('desc');
    };

    const handleClearSelection = () => {
        setSelectedHouseholds([]);
        setIsSelectAll(false);
    };

    const hasActiveFilters = Boolean(
        search || 
        statusFilter !== 'all' || 
        purokFilter !== 'all' ||
        minMembers ||
        maxMembers ||
        fromDate ||
        toDate
    );

    // Create a filters state object for the Filters component
    const filtersStateForComponent = {
        status: statusFilter,
        purok_id: purokFilter,
        from_date: fromDate,
        to_date: toDate,
        min_members: minMembers,
        max_members: maxMembers,
        sort_by: sortBy,
        sort_order: sortOrder,
        search: search
    };

    const updateFilter = (key: string, value: string) => {
        switch (key) {
            case 'status':
                setStatusFilter(value);
                break;
            case 'purok_id':
                setPurokFilter(value);
                break;
            case 'from_date':
                setFromDate(value);
                break;
            case 'to_date':
                setToDate(value);
                break;
            case 'min_members':
                setMinMembers(value);
                break;
            case 'max_members':
                setMaxMembers(value);
                break;
        }
    };

    // Calculate filtered stats for display
    const filteredStats = {
        total: paginationData.total,
        active: 0,
        inactive: 0,
        totalMembers: 0,
        averageMembers: 0,
        purokCount: 0
    };

    return (
        <AppLayout
            title="Households"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Households', href: '/admin/households' }
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
                    
                    <HouseholdsHeader 
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isMobile={isMobile}
                    />

                    <HouseholdsStats 
                        globalStats={stats}
                        filteredStats={filteredStats}
                        isLoading={isLoading}
                    />

                    <HouseholdsFilters
                        globalStats={stats}
                        filteredStats={filteredStats}
                        search={search}
                        setSearch={setSearch}
                        onSearchChange={(e) => setSearch(e.target.value)}
                        filtersState={filtersStateForComponent}
                        updateFilter={updateFilter}
                        showAdvancedFilters={showAdvancedFilters}
                        setShowAdvancedFilters={setShowAdvancedFilters}
                        handleClearFilters={handleClearFilters}
                        hasActiveFilters={hasActiveFilters}
                        puroks={puroks}
                        isMobile={isMobile}
                        totalItems={paginationData.total}
                        startIndex={paginationData.from}
                        endIndex={paginationData.to}
                        filteredHouseholds={currentHouseholds}
                        searchInputRef={searchInputRef}
                        isLoading={isLoading}
                    />

                    <HouseholdsContent
                        households={currentHouseholds}
                        stats={stats}
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isSelectAll={isSelectAll}
                        selectedHouseholds={selectedHouseholds}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        isMobile={isMobile}
                        hasActiveFilters={hasActiveFilters}
                        currentPage={paginationData.current_page}
                        totalPages={paginationData.last_page}
                        totalItems={paginationData.total}
                        itemsPerPage={15}
                        onPageChange={handlePageChange}
                        onSelectAllOnPage={handleSelectAllOnPage}
                        onItemSelect={handleItemSelect}
                        onClearFilters={handleClearFilters}
                        onDelete={handleDelete}
                        onToggleStatus={handleToggleStatus}
                        onCopyToClipboard={handleCopyToClipboard}
                        onSort={() => {}}
                        puroks={puroks}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        selectionStats={selectionStats}
                        isPerformingBulkAction={isPerformingBulkAction}
                        onBulkOperation={handleBulkOperation}
                        onClearSelection={handleClearSelection}
                        onCopySelectedData={handleCopySelectedData}
                        onSelectAllFiltered={() => {}}
                        onSelectAll={() => {}}
                        setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                        setShowBulkStatusDialog={setShowBulkStatusDialog}
                        setShowBulkPurokDialog={setShowBulkPurokDialog}
                        selectionMode={selectionMode}
                        onSortChange={handleSortChange}
                        getCurrentSortValue={getCurrentSortValue}
                        isLoading={isLoading}
                    />
                    
                    {/* Keyboard Shortcuts Help */}
                    {isBulkMode && !isMobile && (
                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border hidden sm:block">
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
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-xs text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-1">
                                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Ctrl+A</kbd>
                                    <span>Select page</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Delete</kbd>
                                    <span>Delete selected</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Esc</kbd>
                                    <span>Exit/clear</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Ctrl+F</kbd>
                                    <span>Focus search</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </TooltipProvider>

            <HouseholdsDialogs
                showBulkDeleteDialog={showBulkDeleteDialog}
                setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                showBulkStatusDialog={showBulkStatusDialog}
                setShowBulkStatusDialog={setShowBulkStatusDialog}
                showBulkPurokDialog={showBulkPurokDialog}
                setShowBulkPurokDialog={setShowBulkPurokDialog}
                isPerformingBulkAction={isPerformingBulkAction}
                bulkEditValue={bulkEditValue}
                setBulkEditValue={setBulkEditValue}
                selectedHouseholds={selectedHouseholds}
                handleBulkOperation={handleBulkOperation}
                handleBulkStatusUpdate={handleBulkStatusUpdate}
                handleBulkPurokUpdate={handleBulkPurokUpdate}
                handleBulkDelete={handleBulkDelete}
                puroks={puroks}
                selectionStats={selectionStats}
            />
        </AppLayout>
    );
}