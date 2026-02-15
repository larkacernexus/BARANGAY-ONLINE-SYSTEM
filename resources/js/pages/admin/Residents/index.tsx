import { router, usePage } from '@inertiajs/react';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import debounce from 'lodash/debounce';
import AppLayout from '@/layouts/admin-app-layout';
import { ResidentsProps, Resident, FilterState, BulkOperation, SelectionMode } from '@/types';
import { 
    filterResidents,
    getSelectionStats,
    formatForClipboard,
    getFullName,
    isHeadOfHousehold,
    getStatusBadgeVariant,
    formatDate
} from '@/admin-utils/residentsUtils';

// Import reusable components
import { TooltipProvider } from '@/components/ui/tooltip';
import ResidentsHeader from '@/components/admin/residents/ResidentsHeader';
import ResidentsStats from '@/components/admin/residents/ResidentsStats';
import ResidentsFilters from '@/components/admin/residents/ResidentsFilters';
import ResidentsContent from '@/components/admin/residents/ResidentsContent';
import ResidentsDialogs from '@/components/admin/residents/ResidentsDialogs';
import { Button } from '@/components/ui/button';
import { KeyRound } from 'lucide-react';

export default function Residents() {
    const { props } = usePage<ResidentsProps>();
    const { residents, stats, filters, puroks, civilStatusOptions = [], ageRanges = [], allResidents } = props;
    
    // State management
    const [search, setSearch] = useState(filters.search || '');
    const [filtersState, setFiltersState] = useState<FilterState>({
        status: filters.status || 'all',
        purok_id: filters.purok_id || 'all',
        gender: filters.gender || 'all',
        min_age: filters.min_age || '',
        max_age: filters.max_age || '',
        civil_status: filters.civil_status || 'all',
        is_voter: filters.is_voter || 'all',
        is_head: filters.is_head || 'all',
        sort_by: filters.sort_by || 'last_name',
        sort_order: filters.sort_order || 'asc'
    });
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(15);
    const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
    const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    
    // Bulk selection states
    const [selectedResidents, setSelectedResidents] = useState<number[]>([]);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [isSelectAll, setIsSelectAll] = useState(false);
    const [selectionMode, setSelectionMode] = useState<SelectionMode>('page');
    
    // Dialog states
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
    const [showBulkStatusDialog, setShowBulkStatusDialog] = useState(false);
    const [showBulkPurokDialog, setShowBulkPurokDialog] = useState(false);
    const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false);
    const [bulkEditValue, setBulkEditValue] = useState<string>('');

    const searchInputRef = useRef<HTMLInputElement>(null);

    // Debounced search
    const debouncedSearch = useCallback(
        debounce((value: string) => {
            const params = {
                ...filtersState,
                search: value
            };
            
            // Clean up empty values
            Object.keys(params).forEach(key => {
                const k = key as keyof typeof params;
                if (!params[k] || params[k] === 'all') {
                    delete params[k];
                }
            });
            
            router.get('/residents', params, {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            });
        }, 500),
        [filtersState]
    );

    // Handle search change
    useEffect(() => {
        if (search !== filters.search) {
            debouncedSearch(search);
        }
        return () => debouncedSearch.cancel();
    }, [search, debouncedSearch, filters.search]);

    // Handle window resize
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

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, filtersState]);

    // Reset selection when exiting bulk mode
    useEffect(() => {
        if (!isBulkMode) {
            setSelectedResidents([]);
            setIsSelectAll(false);
        }
    }, [isBulkMode]);

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
                    if (selectedResidents.length > 0) {
                        setSelectedResidents([]);
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
            if (e.key === 'Delete' && isBulkMode && selectedResidents.length > 0) {
                e.preventDefault();
                setShowBulkDeleteDialog(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isBulkMode, selectedResidents, isMobile]);

    // Filter residents
    const filteredResidents = useMemo(() => {
        return filterResidents(
            allResidents,
            search,
            filtersState,
            filtersState.sort_by,
            filtersState.sort_order
        );
    }, [allResidents, search, filtersState]);

    // Pagination
    const totalItems = filteredResidents.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedResidents = filteredResidents.slice(startIndex, endIndex);

    // Selection handlers
    const handleSelectAllOnPage = () => {
        const pageIds = paginatedResidents.map(resident => resident.id);
        if (isSelectAll) {
            setSelectedResidents(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedResidents, ...pageIds])];
            setSelectedResidents(newSelected);
        }
        setIsSelectAll(!isSelectAll);
        setSelectionMode('page');
    };

    const handleSelectAllFiltered = () => {
        const allIds = filteredResidents.map(resident => resident.id);
        if (selectedResidents.length === allIds.length && allIds.every(id => selectedResidents.includes(id))) {
            setSelectedResidents(prev => prev.filter(id => !allIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedResidents, ...allIds])];
            setSelectedResidents(newSelected);
            setSelectionMode('filtered');
        }
    };

    const handleSelectAll = () => {
        if (confirm(`This will select ALL ${allResidents.length || 0} residents. This action may take a moment.`)) {
            const pageIds = paginatedResidents.map(resident => resident.id);
            setSelectedResidents(pageIds);
            setSelectionMode('all');
        }
    };

    const handleItemSelect = (id: number) => {
        setSelectedResidents(prev => {
            if (prev.includes(id)) {
                return prev.filter(itemId => itemId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    // Check if all items on current page are selected
    useEffect(() => {
        const allPageIds = paginatedResidents.map(resident => resident.id);
        const allSelected = allPageIds.length > 0 && allPageIds.every(id => selectedResidents.includes(id));
        setIsSelectAll(allSelected);
    }, [selectedResidents, paginatedResidents]);

    // Get selected residents data
    const selectedResidentsData = useMemo(() => {
        return filteredResidents.filter(resident => selectedResidents.includes(resident.id));
    }, [selectedResidents, filteredResidents]);

    // Calculate selection stats
    const selectionStats = useMemo(() => {
        return getSelectionStats(selectedResidentsData);
    }, [selectedResidentsData]);

    // Bulk operations
    const handleBulkOperation = async (operation: string) => {
        if (selectedResidents.length === 0) {
            toast.error('Please select at least one resident');
            return;
        }

        setIsPerformingBulkAction(true);

        try {
            switch (operation) {
                case 'delete':
                    if (confirm(`Are you sure you want to delete ${selectedResidents.length} selected resident(s)?`)) {
                        await router.post('/residents/bulk-action', {
                            action: 'delete',
                            resident_ids: selectedResidents,
                        }, {
                            preserveScroll: true,
                            onSuccess: () => {
                                setSelectedResidents([]);
                                setShowBulkDeleteDialog(false);
                                toast.success('Residents deleted successfully');
                            },
                            onError: () => {
                                toast.error('Failed to delete residents');
                            }
                        });
                    }
                    break;

                case 'activate':
                    await router.post('/residents/bulk-action', {
                        action: 'activate',
                        resident_ids: selectedResidents,
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            setSelectedResidents([]);
                            toast.success('Residents activated successfully');
                        },
                        onError: () => {
                            toast.error('Failed to activate residents');
                        }
                    });
                    break;

                case 'deactivate':
                    await router.post('/residents/bulk-action', {
                        action: 'deactivate',
                        resident_ids: selectedResidents,
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            setSelectedResidents([]);
                            toast.success('Residents deactivated successfully');
                        },
                        onError: () => {
                            toast.error('Failed to deactivate residents');
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

                case 'print_ids':
                    toast.info('Print IDs functionality to be implemented');
                    break;

                case 'export_csv':
                    toast.info('Export CSV functionality to be implemented');
                    break;
            }
        } catch (error) {
            console.error('Bulk operation error:', error);
            toast.error('An error occurred during the bulk operation.');
        } finally {
            setIsPerformingBulkAction(false);
        }
    };

    // Copy selected data to clipboard
    const handleCopySelectedData = () => {
        if (selectedResidentsData.length === 0) {
            toast.error('No data to copy');
            return;
        }
        
        const csv = formatForClipboard(selectedResidentsData);
        
        navigator.clipboard.writeText(csv).then(() => {
            toast.success('Data copied to clipboard');
        }).catch(() => {
            toast.error('Failed to copy to clipboard');
        });
    };

    // Individual resident operations
    const handleDelete = (resident: Resident) => {
        if (confirm(`Are you sure you want to delete resident "${getFullName(resident) || 'Untitled'}"?`)) {
            router.delete(`/residents/${resident.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedResidents(selectedResidents.filter(id => id !== resident.id));
                    toast.success('Resident deleted successfully');
                },
                onError: () => {
                    toast.error('Failed to delete resident');
                }
            });
        }
    };

    const handleToggleStatus = (resident: Resident) => {
        const newStatus = resident.status === 'active' ? 'inactive' : 'active';
        router.post(`/residents/${resident.id}/update-status`, {
            status: newStatus
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Resident status updated');
            },
            onError: () => {
                toast.error('Failed to update resident status');
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

    const handleViewPhoto = (resident: Resident) => {
        // Implement photo viewing logic
        console.log('View photo for:', getFullName(resident));
        toast.info('Photo viewer would open here');
    };

    const handleSort = (column: string) => {
        setFiltersState(prev => ({
            ...prev,
            sort_by: column,
            sort_order: prev.sort_by === column && prev.sort_order === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleClearFilters = () => {
        setSearch('');
        setFiltersState({
            status: 'all',
            purok_id: 'all',
            gender: 'all',
            min_age: '',
            max_age: '',
            civil_status: 'all',
            is_voter: 'all',
            is_head: 'all',
            sort_by: 'last_name',
            sort_order: 'asc'
        });
    };

    const handleClearSelection = () => {
        setSelectedResidents([]);
        setIsSelectAll(false);
    };

    const updateFilter = (key: keyof FilterState, value: string) => {
        setFiltersState(prev => ({ ...prev, [key]: value }));
    };

    const hasActiveFilters = 
        search || 
        filtersState.status !== 'all' || 
        filtersState.purok_id !== 'all' || 
        filtersState.gender !== 'all' ||
        filtersState.min_age ||
        filtersState.max_age ||
        filtersState.civil_status !== 'all' ||
        filtersState.is_voter !== 'all' ||
        filtersState.is_head !== 'all';

    return (
        <AppLayout
            title="Residents"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Residents', href: '/residents' }
            ]}
        >
            <TooltipProvider>
                <div className="space-y-4 sm:space-y-6">
                    <ResidentsHeader 
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isMobile={isMobile}
                    />

                    <ResidentsStats stats={stats} />

                    <ResidentsFilters
                        stats={stats}
                        search={search}
                        setSearch={setSearch}
                        filtersState={filtersState}
                        updateFilter={updateFilter}
                        showAdvancedFilters={showAdvancedFilters}
                        setShowAdvancedFilters={setShowAdvancedFilters}
                        handleClearFilters={handleClearFilters}
                        hasActiveFilters={hasActiveFilters}
                        puroks={puroks}
                        ageRanges={ageRanges}
                        civilStatusOptions={civilStatusOptions}
                        isMobile={isMobile}
                        totalItems={totalItems}
                        startIndex={startIndex}
                        endIndex={endIndex}
                    />

                    <ResidentsContent
                        residents={paginatedResidents}
                        stats={stats}
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isSelectAll={isSelectAll}
                        selectedResidents={selectedResidents}
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
                        onSelectAllFiltered={handleSelectAllFiltered}
                        onSelectAll={handleSelectAll}
                        onItemSelect={handleItemSelect}
                        onClearFilters={handleClearFilters}
                        onClearSelection={handleClearSelection}
                        onDelete={handleDelete}
                        onToggleStatus={handleToggleStatus}
                        onViewPhoto={handleViewPhoto}
                        onCopyToClipboard={handleCopyToClipboard}
                        onCopySelectedData={handleCopySelectedData}
                        onSort={handleSort}
                        onBulkOperation={handleBulkOperation}
                        setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                        filtersState={filtersState}
                        isPerformingBulkAction={isPerformingBulkAction}
                        selectionMode={selectionMode}
                        selectionStats={selectionStats}
                        puroks={puroks}
                    />

                    {/* Keyboard Shortcuts Help */}
                    {isBulkMode && !isMobile && (
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border hidden sm:block">
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
                            </div>
                        </div>
                    )}
                </div>
            </TooltipProvider>

            <ResidentsDialogs
                showBulkDeleteDialog={showBulkDeleteDialog}
                setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                showBulkStatusDialog={showBulkStatusDialog}
                setShowBulkStatusDialog={setShowBulkStatusDialog}
                showBulkPurokDialog={showBulkPurokDialog}
                setShowBulkPurokDialog={setShowBulkPurokDialog}
                isPerformingBulkAction={isPerformingBulkAction}
                bulkEditValue={bulkEditValue}
                setBulkEditValue={setBulkEditValue}
                selectedResidents={selectedResidents}
                handleBulkOperation={handleBulkOperation}
                puroks={puroks}
                selectionStats={selectionStats}
            />
        </AppLayout>
    );
}