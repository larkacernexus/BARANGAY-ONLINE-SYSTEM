// pages/admin/households/index.tsx

import { router, usePage } from '@inertiajs/react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import AppLayout from '@/layouts/admin-app-layout';
import { 
    BulkAction, 
    SelectionMode,
    Household,
    Purok,
    HouseholdStats as IHouseholdStats,
    HouseholdFilters,
    FlashMessage,
    SelectionStats,
    FilterState  // Import FilterState from types
} from '@/types/admin/households/household.types';
import { 
    filterHouseholds, 
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
import { KeyRound } from 'lucide-react';

interface HouseholdsPageProps {
    households: Household[];
    stats: IHouseholdStats;
    filters: HouseholdFilters;
    puroks: Purok[];
    allHouseholds: Household[];
}

// Remove the local FilterState interface - use the imported one
// Define the filtered stats type to match what HouseholdsStats expects
interface FilteredStats {
    total: number;
    active: number;
    inactive: number;
    totalMembers: number;
    averageMembers: number;
    purokCount: number;
}

export default function Households({ households, stats, filters, puroks, allHouseholds }: HouseholdsPageProps) {
    const { flash } = usePage<{ flash: FlashMessage }>().props;
    
    // Initialize state with safe defaults
    const safeFilters: HouseholdFilters = filters || {};
    const safePuroks: Purok[] = puroks || [];
    const safeStats: IHouseholdStats = stats || {
        total: 0,
        active: 0,
        inactive: 0,
        totalMembers: 0,
        averageMembers: 0,
        purokCount: 0
    };
    
    // Search and filter states - use the imported FilterState
    const [search, setSearch] = useState(safeFilters.search || '');
    const [filtersState, setFiltersState] = useState<FilterState>({
        search: safeFilters.search || '',
        status: safeFilters.status || 'all',
        purok_id: String(safeFilters.purok_id || 'all'),
        from_date: safeFilters.from_date || '',
        to_date: safeFilters.to_date || '',
        sort_by: safeFilters.sort_by || 'household_number',
        sort_order: (safeFilters.sort_order as 'asc' | 'desc') || 'asc',
        min_members: safeFilters.min_members?.toString() || '',
        max_members: safeFilters.max_members?.toString() || ''
    });
    
    // View and pagination states
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(15);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    
    // Mobile detection
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [windowWidth, setWindowWidth] = useState<number>(1024);
    
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

    // Auto switch to grid view on mobile
    useEffect(() => {
        if (typeof window !== 'undefined' && window.innerWidth < 768 && viewMode === 'table') {
            setViewMode('grid');
        }
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        if (isMobile) return;
        
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl/Cmd + A to select all
            if ((e.ctrlKey || e.metaKey) && e.key === 'a' && isBulkMode) {
                e.preventDefault();
                if (e.shiftKey) {
                    handleSelectAllFiltered();
                } else {
                    handleSelectAllOnPage();
                }
            }
            // Escape key
            if (e.key === 'Escape') {
                if (isBulkMode) {
                    if (selectedHouseholds.length > 0) {
                        setSelectedHouseholds([]);
                    } else {
                        setIsBulkMode(false);
                    }
                }
            }
            // Ctrl/Cmd + Shift + B to toggle bulk mode
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'B') {
                e.preventDefault();
                setIsBulkMode(!isBulkMode);
            }
            // Ctrl/Cmd + F to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            // Delete key for bulk delete
            if (e.key === 'Delete' && isBulkMode && selectedHouseholds.length > 0) {
                e.preventDefault();
                setShowBulkDeleteDialog(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isBulkMode, selectedHouseholds, isMobile]);

    // Reset selection when exiting bulk mode
    useEffect(() => {
        if (!isBulkMode) {
            setSelectedHouseholds([]);
            setIsSelectAll(false);
        }
    }, [isBulkMode]);

    // Immediate search handler
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        
        const params: Record<string, any> = {
            ...filtersState,
            search: value
        };
        
        // Remove empty params
        Object.keys(params).forEach(key => {
            if (!params[key] || params[key] === 'all') {
                delete params[key];
            }
        });
        
        router.get('/admin/households', params, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };

    // Filter households client-side
    const filteredHouseholds = useMemo(() => {
        return filterHouseholds(
            allHouseholds,
            search,
            filtersState,
            safePuroks
        );
    }, [allHouseholds, search, filtersState, safePuroks]);

    // Calculate filtered stats for display - now properly typed as FilteredStats
    const filteredStats = useMemo((): FilteredStats => {
        return {
            total: filteredHouseholds.length,
            active: filteredHouseholds.filter(h => h.status === 'active').length,
            inactive: filteredHouseholds.filter(h => h.status === 'inactive').length,
            totalMembers: filteredHouseholds.reduce((sum, h) => sum + (h.member_count || 0), 0),
            averageMembers: filteredHouseholds.length > 0 
                ? Number((filteredHouseholds.reduce((sum, h) => sum + (h.member_count || 0), 0) / filteredHouseholds.length).toFixed(1))
                : 0,
            purokCount: new Set(filteredHouseholds.map(h => h.purok_id)).size
        };
    }, [filteredHouseholds]);

    // Calculate pagination
    const totalItems = filteredHouseholds.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedHouseholds = filteredHouseholds.slice(startIndex, endIndex);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, filtersState]);

    // Selection handlers
    const handleSelectAllOnPage = () => {
        const pageIds = paginatedHouseholds.map(household => household.id);
        if (isSelectAll) {
            setSelectedHouseholds(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedHouseholds, ...pageIds])];
            setSelectedHouseholds(newSelected);
        }
        setIsSelectAll(!isSelectAll);
        setSelectionMode('page');
    };

    const handleSelectAllFiltered = () => {
        const allIds = filteredHouseholds.map(household => household.id);
        if (selectedHouseholds.length === allIds.length && allIds.every(id => selectedHouseholds.includes(id))) {
            setSelectedHouseholds(prev => prev.filter(id => !allIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedHouseholds, ...allIds])];
            setSelectedHouseholds(newSelected);
            setSelectionMode('filtered');
        }
    };

    const handleSelectAll = () => {
        if (confirm(`This will select ALL ${allHouseholds.length || 0} households. This action may take a moment.`)) {
            const allIds = allHouseholds.map(household => household.id);
            setSelectedHouseholds(allIds);
            setSelectionMode('all');
        }
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
        const allPageIds = paginatedHouseholds.map(household => household.id);
        const allSelected = allPageIds.length > 0 && allPageIds.every(id => selectedHouseholds.includes(id));
        setIsSelectAll(allSelected);
    }, [selectedHouseholds, paginatedHouseholds]);

    // Get selected households data
    const selectedHouseholdsData = useMemo(() => {
        return filteredHouseholds.filter(household => selectedHouseholds.includes(household.id));
    }, [selectedHouseholds, filteredHouseholds]);

    // Calculate selection stats
    const selectionStats = useMemo((): SelectionStats => {
        return getSelectionStats(selectedHouseholdsData);
    }, [selectedHouseholdsData]);

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
                    await router.post('/admin/households/bulk-action', {
                        action: 'activate',
                        household_ids: selectedHouseholds,
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            setSelectedHouseholds([]);
                            toast.success(`${selectedHouseholds.length} households activated successfully`);
                        },
                        onError: () => {
                            toast.error('Failed to activate households');
                        }
                    });
                    break;

                case 'deactivate':
                    await router.post('/admin/households/bulk-action', {
                        action: 'deactivate',
                        household_ids: selectedHouseholds,
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            setSelectedHouseholds([]);
                            toast.success(`${selectedHouseholds.length} households deactivated successfully`);
                        },
                        onError: () => {
                            toast.error('Failed to deactivate households');
                        }
                    });
                    break;

                case 'export':
                    toast.info('Export functionality to be implemented');
                    break;

                case 'print':
                    toast.info('Print functionality to be implemented');
                    break;

                case 'change_status':
                    setShowBulkStatusDialog(true);
                    break;

                case 'change_purok':
                    setShowBulkPurokDialog(true);
                    break;

                default:
                    toast.info(`Operation ${operation} to be implemented`);
                    break;
            }
        } catch (error) {
            console.error('Bulk operation error:', error);
            toast.error('An error occurred during the bulk operation.');
        } finally {
            setIsPerformingBulkAction(false);
        }
    };

    // Bulk action handlers
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

    // Copy selected data to clipboard
    const handleCopySelectedData = () => {
        if (selectedHouseholdsData.length === 0) {
            toast.error('No data to copy');
            return;
        }
        
        const csv = formatForClipboard(selectedHouseholdsData, safePuroks);
        
        navigator.clipboard.writeText(csv).then(() => {
            toast.success(`${selectedHouseholdsData.length} records copied to clipboard`);
        }).catch(() => {
            toast.error('Failed to copy to clipboard');
        });
    };

    // Individual household operations
    const handleDelete = (household: Household) => {
        if (confirm(`Are you sure you want to delete household "${household.household_number || 'Untitled'}"?`)) {
            router.delete(`/admin/households/${household.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedHouseholds(selectedHouseholds.filter(id => id !== household.id));
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

    const handleSort = (column: string) => {
        const newOrder = filtersState.sort_by === column && filtersState.sort_order === 'asc' ? 'desc' : 'asc';
        
        setFiltersState(prev => ({
            ...prev,
            sort_by: column,
            sort_order: newOrder
        }));
        
        // Trigger server-side sort update
        const params: Record<string, any> = {
            ...filtersState,
            sort_by: column,
            sort_order: newOrder,
            search: search
        };
        
        Object.keys(params).forEach(key => {
            if (!params[key] || params[key] === 'all') {
                delete params[key];
            }
        });
        
        router.get('/admin/households', params, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };

    const handleClearFilters = () => {
        setSearch('');
        setFiltersState({
            search: '',
            status: 'all',
            purok_id: 'all',
            from_date: '',
            to_date: '',
            sort_by: 'household_number',
            sort_order: 'asc',
            min_members: '',
            max_members: ''
        });
        
        // Trigger search with cleared filters
        router.get('/admin/households', {
            search: '',
            status: 'all',
            purok_id: 'all',
            from_date: '',
            to_date: '',
            sort_by: 'household_number',
            sort_order: 'asc',
            min_members: '',
            max_members: ''
        }, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };

    const handleClearSelection = () => {
        setSelectedHouseholds([]);
        setIsSelectAll(false);
    };

    const updateFilter = (key: keyof FilterState, value: string) => {
        setFiltersState(prev => ({ ...prev, [key]: value }));
        
        // Trigger server-side filter update
        const params: Record<string, any> = {
            ...filtersState,
            [key]: value,
            search: search
        };
        
        Object.keys(params).forEach(key => {
            if (!params[key] || params[key] === 'all') {
                delete params[key];
            }
        });
        
        router.get('/admin/households', params, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };

    const hasActiveFilters = 
        search !== '' || 
        filtersState.status !== 'all' || 
        filtersState.purok_id !== 'all' ||
        filtersState.from_date !== '' ||
        filtersState.to_date !== '' ||
        filtersState.min_members !== '' ||
        filtersState.max_members !== '';

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
                    <HouseholdsHeader 
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isMobile={isMobile}
                    />

                    {/* Separate Stats Component */}
                    <HouseholdsStats 
                        globalStats={safeStats}
                        filteredStats={filteredStats}
                        isLoading={isPerformingBulkAction}
                    />

                    <HouseholdsFilters
                        globalStats={safeStats}
                        filteredStats={filteredStats}
                        search={search}
                        setSearch={setSearch}
                        onSearchChange={handleSearchChange}
                        filtersState={filtersState}
                        updateFilter={updateFilter}
                        showAdvancedFilters={showAdvancedFilters}
                        setShowAdvancedFilters={setShowAdvancedFilters}
                        handleClearFilters={handleClearFilters}
                        hasActiveFilters={hasActiveFilters}
                        puroks={safePuroks}
                        isMobile={isMobile}
                        totalItems={totalItems}
                        startIndex={startIndex}
                        endIndex={endIndex}
                        filteredHouseholds={filteredHouseholds}
                        searchInputRef={searchInputRef}
                        isLoading={isPerformingBulkAction}
                    />

                  <HouseholdsContent
                        households={paginatedHouseholds}
                        stats={{
                            total: filteredStats.total,
                            active: filteredStats.active,
                            inactive: filteredStats.inactive,
                            totalMembers: filteredStats.totalMembers,
                            averageMembers: filteredStats.averageMembers,
                            purokCount: filteredStats.purokCount
                        }}
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isSelectAll={isSelectAll}
                        selectedHouseholds={selectedHouseholds}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        isMobile={isMobile}
                        hasActiveFilters={hasActiveFilters}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        onSelectAllOnPage={handleSelectAllOnPage}
                        onItemSelect={handleItemSelect}
                        onClearFilters={handleClearFilters}
                        onDelete={handleDelete}
                        onToggleStatus={handleToggleStatus}
                        onCopyToClipboard={handleCopyToClipboard}
                        onSort={handleSort}
                        puroks={safePuroks}
                        sortBy={filtersState.sort_by}
                        sortOrder={filtersState.sort_order}
                        selectionStats={selectionStats}
                        isPerformingBulkAction={isPerformingBulkAction}
                        onBulkOperation={handleBulkOperation}
                        onClearSelection={handleClearSelection}
                        onCopySelectedData={handleCopySelectedData}
                        onSelectAllFiltered={handleSelectAllFiltered}
                        onSelectAll={handleSelectAll}
                        setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                        setShowBulkStatusDialog={setShowBulkStatusDialog}
                        setShowBulkPurokDialog={setShowBulkPurokDialog}
                        selectionMode={selectionMode}
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
                                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Shift+Ctrl+A</kbd>
                                    <span>Select filtered</span>
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
                puroks={safePuroks}
                selectionStats={selectionStats}
            />
        </AppLayout>
    );
}