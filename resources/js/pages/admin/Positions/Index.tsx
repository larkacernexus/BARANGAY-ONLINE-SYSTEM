// resources/js/pages/admin/positions/index.tsx
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import debounce from 'lodash/debounce';
import AppLayout from '@/layouts/admin-app-layout';
import { 
    Position, 
    PositionFilters, 
    PositionStats, 
    PaginationData,
    BulkOperation,
    SelectionMode 
} from '@/types/admin/positions/position.types';
import { positionUtils } from '@/admin-utils/position-utils';
import { TooltipProvider } from '@/components/ui/tooltip';

// Import AdminUI components
import PositionsHeader from '@/components/admin/positions/PositionsHeader';
import PositionsStats from '@/components/admin/positions/PositionsStats';
import PositionsFilters from '@/components/admin/positions/PositionsFilters';
import PositionsContent from '@/components/admin/positions/PositionsContent';
import PositionsDialogs from '@/components/admin/positions/PositionsDialogs';
import { Button } from '@/components/ui/button';
import { KeyRound } from 'lucide-react';

interface PositionsPageProps {
    positions: PaginationData;
    filters: PositionFilters;
    stats: PositionStats;
}

const defaultStats: PositionStats = {
    total: 0,
    active: 0,
    requires_account: 0,
    kagawad_count: 0,
    inactive: 0,
    assigned: 0,
    unassigned: 0
};

export default function PositionsIndex({ 
    positions, 
    filters, 
    stats = defaultStats
}: PositionsPageProps) {
    const { flash } = usePage().props as any;
    
    // State management
    const [search, setSearch] = useState(filters.search || '');
    const [filtersState, setFiltersState] = useState<PositionFilters>({
        status: filters.status || 'all',
        requires_account: filters.requires_account || 'all',
        sort_by: filters.sort_by || 'order',
        sort_order: filters.sort_order || 'asc'
    });
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
    
    // Bulk selection states
    const [selectedPositions, setSelectedPositions] = useState<number[]>([]);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [isSelectAll, setIsSelectAll] = useState(false);
    const [selectionMode, setSelectionMode] = useState<SelectionMode>('page');
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
    const [showBulkStatusDialog, setShowBulkStatusDialog] = useState(false);
    const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [bulkEditValue, setBulkEditValue] = useState<string>('');

    const searchInputRef = useRef<HTMLInputElement>(null);

    // Debounced search function
    const debouncedSearch = useCallback(
        debounce((value: string) => {
            const params = {
                ...filtersState,
                search: value || undefined,
                status: filtersState.status === 'all' ? undefined : filtersState.status,
                requires_account: filtersState.requires_account === 'all' ? undefined : filtersState.requires_account,
            };
            
            Object.keys(params).forEach(key => {
                const k = key as keyof typeof params;
                if (params[k] === undefined || params[k] === '') {
                    delete params[k];
                }
            });
            
            router.get('/admin/positions', params, {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            });
        }, 300),
        [filtersState]
    );

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);

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

    // Auto switch to grid view on mobile
    useEffect(() => {
        if (typeof window !== 'undefined' && window.innerWidth < 768 && viewMode === 'table') {
            setViewMode('grid');
        }
    }, []);

    // Flash messages
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // Filter positions
    const filteredPositions = useMemo(() => {
        return positionUtils.filterPositions({
            positions: positions.data,
            search,
            filters: filtersState
        });
    }, [positions.data, search, filtersState]);

    const filteredStats = useMemo(() => {
        return {
            total: filteredPositions.length,
            active: filteredPositions.filter(p => p.is_active).length,
            requires_account: filteredPositions.filter(p => p.requires_account).length,
            kagawad_count: filteredPositions.filter(p => p.code?.startsWith('KAG')).length,
            inactive: filteredPositions.filter(p => !p.is_active).length,
            assigned: filteredPositions.filter(p => (p.officials_count ?? 0) > 0).length,
            unassigned: filteredPositions.filter(p => (p.officials_count ?? 0) === 0).length
        };
    }, [filteredPositions]);

    // Pagination
    const totalItems = filteredPositions.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedPositions = filteredPositions.slice(startIndex, endIndex);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, filtersState]);

    // Reset selection when exiting bulk mode
    useEffect(() => {
        if (!isBulkMode) {
            setSelectedPositions([]);
            setIsSelectAll(false);
        }
    }, [isBulkMode]);

    // Keyboard shortcuts
    useEffect(() => {
        if (isMobile) return;
        
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'a' && isBulkMode) {
                e.preventDefault();
                if (e.shiftKey) {
                    handleSelectAllFiltered();
                } else {
                    handleSelectAllOnPage();
                }
            }
            if (e.key === 'Escape') {
                if (isBulkMode) {
                    if (selectedPositions.length > 0) {
                        setSelectedPositions([]);
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
            if (e.key === 'Delete' && isBulkMode && selectedPositions.length > 0) {
                e.preventDefault();
                setShowBulkDeleteDialog(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isBulkMode, selectedPositions, isMobile]);

    // Selection handlers
    const handleSelectAllOnPage = () => {
        const pageIds = paginatedPositions.map(position => position.id);
        if (isSelectAll) {
            setSelectedPositions(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedPositions, ...pageIds])];
            setSelectedPositions(newSelected);
        }
        setIsSelectAll(!isSelectAll);
        setSelectionMode('page');
    };

    const handleSelectAllFiltered = () => {
        const allIds = filteredPositions.map(position => position.id);
        if (selectedPositions.length === allIds.length && allIds.every(id => selectedPositions.includes(id))) {
            setSelectedPositions(prev => prev.filter(id => !allIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedPositions, ...allIds])];
            setSelectedPositions(newSelected);
            setSelectionMode('filtered');
        }
    };

    const handleSelectAll = () => {
        if (confirm(`This will select ALL ${positions.total || 0} positions. This action may take a moment.`)) {
            const allIds = positions.data.map(p => p.id);
            setSelectedPositions(allIds);
            setSelectionMode('all');
        }
    };

    const handleItemSelect = (id: number) => {
        setSelectedPositions(prev => {
            if (prev.includes(id)) {
                return prev.filter(itemId => itemId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    // Check if all items on current page are selected
    useEffect(() => {
        const allPageIds = paginatedPositions.map(position => position.id);
        const allSelected = allPageIds.length > 0 && allPageIds.every(id => selectedPositions.includes(id));
        setIsSelectAll(allSelected);
    }, [selectedPositions, paginatedPositions]);

    // Get selected positions data
    const selectedPositionsData = useMemo(() => {
        return filteredPositions.filter(position => selectedPositions.includes(position.id));
    }, [selectedPositions, filteredPositions]);

    // Calculate selection stats
    const selectionStats = useMemo(() => {
        return positionUtils.getSelectionStats(selectedPositionsData);
    }, [selectedPositionsData]);

    // Bulk operations
    const handleBulkOperation = async (operation: BulkOperation) => {
        if (selectedPositions.length === 0) {
            toast.error('Please select at least one position');
            return;
        }

        setIsPerformingBulkAction(true);

        try {
            switch (operation) {
                case 'delete':
                    setShowBulkDeleteDialog(true);
                    break;

                case 'activate':
                    await router.post('/admin/positions/bulk-action', {
                        action: 'activate',
                        position_ids: selectedPositions,
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            setSelectedPositions([]);
                            toast.success(`${selectedPositions.length} positions activated successfully`);
                        },
                        onError: () => {
                            toast.error('Failed to activate positions');
                        }
                    });
                    break;

                case 'deactivate':
                    await router.post('/admin/positions/bulk-action', {
                        action: 'deactivate',
                        position_ids: selectedPositions,
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            setSelectedPositions([]);
                            toast.success(`${selectedPositions.length} positions deactivated successfully`);
                        },
                        onError: () => {
                            toast.error('Failed to deactivate positions');
                        }
                    });
                    break;

                case 'toggle_account':
                    setShowBulkStatusDialog(true);
                    break;

                case 'export':
                case 'export_csv':
                    const exportData = selectedPositionsData.map(position => ({
                        'ID': position.id,
                        'Code': position.code,
                        'Name': position.name,
                        'Description': position.description || '',
                        'Committee': position.committee?.name || '',
                        'Display Order': position.order,
                        'Officials Count': position.officials_count || 0,
                        'Requires Account': position.requires_account ? 'Yes' : 'No',
                        'Status': position.is_active ? 'Active' : 'Inactive',
                        'Created At': position.created_at,
                    }));
                    
                    if (exportData.length > 0) {
                        const headers = Object.keys(exportData[0]);
                        const csv = [
                            headers.join(','),
                            ...exportData.map(row => 
                                headers.map(header => {
                                    const value = row[header as keyof typeof row];
                                    return typeof value === 'string' && value.includes(',') 
                                        ? `"${value}"` 
                                        : value;
                                }).join(',')
                            )
                        ].join('\n');
                        
                        const blob = new Blob([csv], { type: 'text/csv' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `positions-export-${new Date().toISOString().split('T')[0]}.csv`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(url);
                        
                        toast.success(`${selectedPositions.length} positions exported successfully`);
                        setSelectedPositions([]);
                    }
                    break;

                case 'print':
                    selectedPositions.forEach(id => {
                        window.open(`/admin/positions/${id}/print`, '_blank');
                    });
                    toast.success(`${selectedPositions.length} position(s) opened for printing`);
                    setSelectedPositions([]);
                    break;

                case 'generate_report':
                    const idsParam = selectedPositions.join(',');
                    window.open(`/admin/positions/report?ids=${idsParam}`, '_blank');
                    toast.success(`Generating report for ${selectedPositions.length} position(s)`);
                    setSelectedPositions([]);
                    break;

                case 'copy_data':
                    handleCopySelectedData();
                    break;

                default:
                    toast.info('Functionality to be implemented');
                    break;
            }
        } catch (error) {
            console.error('Bulk operation error:', error);
            toast.error('An error occurred during the bulk operation.');
        } finally {
            setIsPerformingBulkAction(false);
        }
    };

    const handleBulkAccountToggle = async () => {
        if (!bulkEditValue) {
            toast.error('Please select an option');
            return;
        }

        setIsPerformingBulkAction(true);
        try {
            const requiresAccount = bulkEditValue === 'enable';
            await router.post('/admin/positions/bulk-action', {
                action: 'toggle_account',
                position_ids: selectedPositions,
                requires_account: requiresAccount
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedPositions([]);
                    setBulkEditValue('');
                    setShowBulkStatusDialog(false);
                    toast.success(`${selectedPositions.length} position account requirements updated successfully`);
                },
                onError: () => {
                    toast.error('Failed to update position account requirements');
                }
            });
        } catch (error) {
            console.error('Bulk account toggle error:', error);
            toast.error('An error occurred during the operation.');
        } finally {
            setIsPerformingBulkAction(false);
        }
    };

    const handleBulkDelete = async () => {
        setIsPerformingBulkAction(true);
        try {
            await router.post('/admin/positions/bulk-action', {
                action: 'delete',
                position_ids: selectedPositions,
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedPositions([]);
                    setShowBulkDeleteDialog(false);
                    toast.success(`${selectedPositions.length} positions deleted successfully`);
                },
                onError: () => {
                    toast.error('Failed to delete positions');
                }
            });
        } catch (error) {
            console.error('Bulk delete error:', error);
            toast.error('An error occurred during the operation.');
        } finally {
            setIsPerformingBulkAction(false);
        }
    };

    const handleDelete = (position: Position) => {
        if (confirm(`Are you sure you want to delete position "${position.name || 'Untitled'}"?`)) {
            router.delete(`/admin/positions/${position.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedPositions(selectedPositions.filter(id => id !== position.id));
                    toast.success('Position deleted successfully');
                },
                onError: () => {
                    toast.error('Failed to delete position');
                }
            });
        }
    };

    const handleSort = (column: string) => {
        const newOrder = filtersState.sort_by === column && filtersState.sort_order === 'asc' ? 'desc' : 'asc';
        
        setFiltersState(prev => ({
            ...prev,
            sort_by: column as any,
            sort_order: newOrder
        }));
        
        const params = {
            ...filtersState,
            sort_by: column,
            sort_order: newOrder,
            search: search
        };
        
        Object.keys(params).forEach(key => {
            const k = key as keyof typeof params;
            if (!params[k] || params[k] === 'all') {
                delete params[k];
            }
        });
        
        router.get('/admin/positions', params, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };

    const handleClearFilters = () => {
        setSearch('');
        setFiltersState({
            status: 'all',
            requires_account: 'all',
            sort_by: 'order',
            sort_order: 'asc'
        });
        
        router.get('/admin/positions', {
            search: '',
            status: 'all',
            requires_account: 'all',
            sort_by: 'order',
            sort_order: 'asc'
        }, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };

    const handleClearSelection = () => {
        setSelectedPositions([]);
        setIsSelectAll(false);
    };

    const handleCopySelectedData = () => {
        if (selectedPositionsData.length === 0) {
            toast.error('No data to copy');
            return;
        }
        
        const data = selectedPositionsData.map(position => ({
            'Code': position.code || 'N/A',
            'Name': position.name || 'N/A',
            'Committee': position.committee?.name || 'N/A',
            'Order': position.order,
            'Officials': position.officials_count || 0,
            'Account Required': position.requires_account ? 'Yes' : 'No',
            'Status': position.is_active ? 'Active' : 'Inactive',
        }));
        
        const csvData = [
            Object.keys(data[0]).join(','),
            ...data.map(row => Object.values(row).join(','))
        ].join('\n');
        
        navigator.clipboard.writeText(csvData).then(() => {
            toast.success(`${selectedPositionsData.length} records copied to clipboard`);
        }).catch(() => {
            toast.error('Failed to copy to clipboard');
        });
    };

    const updateFilter = (key: keyof PositionFilters, value: string) => {
        setFiltersState(prev => ({ ...prev, [key]: value }));
        
        const params = {
            ...filtersState,
            [key]: value,
            search: search
        };
        
        Object.keys(params).forEach(key => {
            const k = key as keyof typeof params;
            if (!params[k] || params[k] === 'all') {
                delete params[k];
            }
        });
        
        router.get('/admin/positions', params, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };

    const hasActiveFilters = Boolean(
        search || 
        filtersState.status !== 'all' ||
        filtersState.requires_account !== 'all'
    );

    return (
        <AppLayout
            title="Position Management"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Positions', href: '/admin/positions' }
            ]}
        >
            <TooltipProvider>
                <div className="space-y-4 sm:space-y-6">
                    <PositionsHeader 
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isMobile={isMobile}
                    />

                    <PositionsStats 
                        globalStats={stats}
                        filteredStats={filteredStats}
                        isLoading={isPerformingBulkAction}
                    />

                    <PositionsFilters
                        search={search}
                        setSearch={setSearch}
                        onSearchChange={(value) => {
                            setSearch(value);
                            debouncedSearch(value);
                        }}
                        filtersState={filtersState}
                        updateFilter={updateFilter}
                        showAdvancedFilters={showAdvancedFilters}
                        setShowAdvancedFilters={setShowAdvancedFilters}
                        handleClearFilters={handleClearFilters}
                        hasActiveFilters={hasActiveFilters}
                        isMobile={isMobile}
                        totalItems={totalItems}
                        startIndex={startIndex}
                        endIndex={endIndex}
                        searchInputRef={searchInputRef}
                        isLoading={isPerformingBulkAction}
                    />

                    <PositionsContent
                        positions={paginatedPositions}
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isSelectAll={isSelectAll}
                        selectedPositions={selectedPositions}
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
                        onSort={handleSort}
                        onBulkOperation={handleBulkOperation}
                        onCopySelectedData={handleCopySelectedData}
                        setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                        setShowBulkStatusDialog={setShowBulkStatusDialog}
                        filtersState={filtersState}
                        isPerformingBulkAction={isPerformingBulkAction}
                        selectionMode={selectionMode}
                        selectionStats={selectionStats}
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

            <PositionsDialogs
                showBulkDeleteDialog={showBulkDeleteDialog}
                setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                showBulkStatusDialog={showBulkStatusDialog}
                setShowBulkStatusDialog={setShowBulkStatusDialog}
                isPerformingBulkAction={isPerformingBulkAction}
                selectedPositions={selectedPositions}
                handleBulkOperation={handleBulkDelete}
                handleBulkAccountToggle={handleBulkAccountToggle}
                selectionStats={selectionStats}
                bulkEditValue={bulkEditValue}
                setBulkEditValue={setBulkEditValue}
            />
        </AppLayout>
    );
}