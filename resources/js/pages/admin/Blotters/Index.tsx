// resources/js/Pages/admin/Blotters/Index.tsx

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import debounce from 'lodash/debounce';
import AppLayout from '@/layouts/admin-app-layout';
import { Blotter, BlotterFilters, BlotterStats } from '@/components/admin/blotters/blotter';
import { blotterUtils } from '@/admin-utils/blotter-utils';
import { TooltipProvider } from '@/components/ui/tooltip';

// Import components
import BlottersHeader from '@/components/admin/blotters/BlottersHeader';
import BlottersStats from '@/components/admin/blotters/BlottersStats';
import BlottersFilters from '@/components/admin/blotters/BlottersFilters';
import BlottersContent from '@/components/admin/blotters/BlottersContent';
import BlottersDialogs from '@/components/admin/blotters/BlottersDialogs';
import { Button } from '@/components/ui/button';
import { KeyRound } from 'lucide-react';

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
    total: 0,
    pending: 0,
    investigating: 0,
    resolved: 0,
    archived: 0,
    urgent: 0,
    high: 0,
    medium: 0,
    low: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
};

export default function BlottersIndex({ 
    blotters, 
    filters, 
    stats = defaultStats,
    barangays = []
}: BlottersPageProps) {
    const { flash } = usePage().props as any;
    
    // State management
    const [search, setSearch] = useState(filters.search || '');
    const [filtersState, setFiltersState] = useState<BlotterFilters>({
        status: filters.status || 'all',
        priority: filters.priority || 'all',
        incident_type: filters.incident_type || 'all',
        barangay: filters.barangay || 'all',
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
        sort_by: filters.sort_by || 'incident_datetime',
        sort_order: filters.sort_order || 'desc'
    });
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(blotters.current_page || 1);
    const [itemsPerPage] = useState(10);
    const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
    
    // Bulk selection states
    const [selectedBlotters, setSelectedBlotters] = useState<number[]>([]);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [isSelectAll, setIsSelectAll] = useState(false);
    const [selectionMode, setSelectionMode] = useState<'page' | 'filtered' | 'all'>('page');
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
    const [showBulkStatusDialog, setShowBulkStatusDialog] = useState(false);
    const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [bulkEditValue, setBulkEditValue] = useState<string>('');

    // Fixed: Changed from useRef<HTMLInputElement | null>(null) to useRef<HTMLInputElement>(null)
    const searchInputRef = useRef<HTMLInputElement>(null);

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

    // Filter blotters
    const filteredBlotters = useMemo(() => {
        return blotterUtils.filterBlotters({
            blotters: blotters.data,
            search,
            filters: filtersState
        });
    }, [blotters.data, search, filtersState]);

    // Calculate filtered stats
    const filteredStats = useMemo(() => {
        return {
            total: filteredBlotters.length,
            pending: filteredBlotters.filter(b => b.status === 'pending').length,
            investigating: filteredBlotters.filter(b => b.status === 'investigating').length,
            resolved: filteredBlotters.filter(b => b.status === 'resolved').length,
            archived: filteredBlotters.filter(b => b.status === 'archived').length,
            urgent: filteredBlotters.filter(b => b.priority === 'urgent').length,
            high: filteredBlotters.filter(b => b.priority === 'high').length,
            medium: filteredBlotters.filter(b => b.priority === 'medium').length,
            low: filteredBlotters.filter(b => b.priority === 'low').length,
        };
    }, [filteredBlotters]);

    // Pagination
    const totalItems = filteredBlotters.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedBlotters = filteredBlotters.slice(startIndex, endIndex);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, filtersState]);

    // Reset selection when exiting bulk mode
    useEffect(() => {
        if (!isBulkMode) {
            setSelectedBlotters([]);
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
                    if (selectedBlotters.length > 0) {
                        setSelectedBlotters([]);
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
            if (e.key === 'Delete' && isBulkMode && selectedBlotters.length > 0) {
                e.preventDefault();
                setShowBulkDeleteDialog(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isBulkMode, selectedBlotters, isMobile]);

    // Selection handlers
    const handleSelectAllOnPage = () => {
        const pageIds = paginatedBlotters.map(blotter => blotter.id);
        if (isSelectAll) {
            setSelectedBlotters(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedBlotters, ...pageIds])];
            setSelectedBlotters(newSelected);
        }
        setIsSelectAll(!isSelectAll);
        setSelectionMode('page');
    };

    const handleSelectAllFiltered = () => {
        const allIds = filteredBlotters.map(blotter => blotter.id);
        if (selectedBlotters.length === allIds.length && allIds.every(id => selectedBlotters.includes(id))) {
            setSelectedBlotters(prev => prev.filter(id => !allIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedBlotters, ...allIds])];
            setSelectedBlotters(newSelected);
            setSelectionMode('filtered');
        }
    };

    const handleSelectAll = () => {
        if (confirm(`This will select ALL ${blotters.total || 0} blotters. This action may take a moment.`)) {
            const allIds = blotters.data.map(b => b.id);
            setSelectedBlotters(allIds);
            setSelectionMode('all');
        }
    };

    const handleItemSelect = (id: number) => {
        setSelectedBlotters(prev => {
            if (prev.includes(id)) {
                return prev.filter(itemId => itemId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    // Check if all items on current page are selected
    useEffect(() => {
        const allPageIds = paginatedBlotters.map(blotter => blotter.id);
        const allSelected = allPageIds.length > 0 && allPageIds.every(id => selectedBlotters.includes(id));
        setIsSelectAll(allSelected);
    }, [selectedBlotters, paginatedBlotters]);

    // Get selected blotters data
    const selectedBlottersData = useMemo(() => {
        return filteredBlotters.filter(blotter => selectedBlotters.includes(blotter.id));
    }, [selectedBlotters, filteredBlotters]);

    // Calculate selection stats
    const selectionStats = useMemo(() => {
        return blotterUtils.getSelectionStats(selectedBlottersData);
    }, [selectedBlottersData]);

    // Bulk operations
    const handleBulkOperation = async (operation: string) => {
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
                    // Export to CSV
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
                        'Created At': blotter.created_at,
                    }));
                    
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
                    a.download = `blotters-export-${new Date().toISOString().split('T')[0]}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                    
                    toast.success(`${selectedBlotters.length} blotters exported successfully`);
                    setSelectedBlotters([]);
                    break;

                case 'print':
                    // Open print preview for each selected blotter
                    selectedBlotters.forEach(id => {
                        window.open(`/admin/blotters/${id}/print`, '_blank');
                    });
                    toast.success(`${selectedBlotters.length} blotter(s) opened for printing`);
                    setSelectedBlotters([]);
                    break;

                case 'generate_report':
                    // Generate report for selected blotters
                    const idsParam = selectedBlotters.join(',');
                    window.open(`/admin/blotters/report?ids=${idsParam}`, '_blank');
                    toast.success(`Generating report for ${selectedBlotters.length} blotter(s)`);
                    setSelectedBlotters([]);
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

    const handleBulkStatusUpdate = async () => {
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
                    toast.success(`${selectedBlotters.length} blotter statuses updated successfully`);
                },
                onError: () => {
                    toast.error('Failed to update blotter status');
                }
            });
        } catch (error) {
            console.error('Bulk status update error:', error);
            toast.error('An error occurred during the operation.');
        } finally {
            setIsPerformingBulkAction(false);
        }
    };

    const handleBulkDelete = async () => {
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
                    toast.success(`${selectedBlotters.length} blotters deleted successfully`);
                },
                onError: () => {
                    toast.error('Failed to delete blotters');
                }
            });
        } catch (error) {
            console.error('Bulk delete error:', error);
            toast.error('An error occurred during the operation.');
        } finally {
            setIsPerformingBulkAction(false);
        }
    };

    // Individual blotter operations
    const handleDelete = (blotter: Blotter) => {
        if (confirm(`Are you sure you want to delete blotter #${blotter.blotter_number || blotter.id}?`)) {
            router.delete(`/admin/blotters/${blotter.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedBlotters(selectedBlotters.filter(id => id !== blotter.id));
                    toast.success('Blotter deleted successfully');
                },
                onError: () => {
                    toast.error('Failed to delete blotter');
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
        
        // Trigger server-side sort update
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
        
        router.get('/admin/blotters', params, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };

    const handleClearFilters = () => {
        setSearch('');
        setFiltersState({
            status: 'all',
            priority: 'all',
            incident_type: 'all',
            barangay: 'all',
            date_from: '',
            date_to: '',
            sort_by: 'incident_datetime',
            sort_order: 'desc'
        });
        
        // Trigger server-side filter clear
        router.get('/admin/blotters', {
            search: '',
            status: 'all',
            priority: 'all',
            incident_type: 'all',
            barangay: 'all',
            date_from: '',
            date_to: '',
            sort_by: 'incident_datetime',
            sort_order: 'desc'
        }, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };

    const handleClearSelection = () => {
        setSelectedBlotters([]);
        setIsSelectAll(false);
    };

    const handleCopySelectedData = () => {
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
    };

    const updateFilter = (key: keyof BlotterFilters, value: string) => {
        setFiltersState(prev => ({ ...prev, [key]: value }));
        
        // Trigger server-side filter update
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
        
        router.get('/admin/blotters', params, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };

    // Fixed: Wrap the condition in Boolean() and explicitly type as boolean
    const hasActiveFilters: boolean = Boolean(
        search || 
        filtersState.status !== 'all' ||
        filtersState.priority !== 'all' ||
        filtersState.incident_type !== 'all' ||
        filtersState.barangay !== 'all' ||
        filtersState.date_from ||
        filtersState.date_to
    );

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
                    <BlottersHeader 
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isMobile={isMobile}
                    />

                    {/* Separate Stats Component */}
                    <BlottersStats 
                        globalStats={stats}
                        filteredStats={filteredStats}
                        isLoading={isPerformingBulkAction}
                    />

                    {/* Fixed: Added type assertion for searchInputRef */}
                    <BlottersFilters
                        search={search}
                        setSearch={setSearch}
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
                        searchInputRef={searchInputRef as React.RefObject<HTMLInputElement>}
                        isLoading={isPerformingBulkAction}
                        barangays={barangays}
                    />

                    <BlottersContent
                        blotters={paginatedBlotters}
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isSelectAll={isSelectAll}
                        selectedBlotters={selectedBlotters}
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