// resources/js/pages/admin/puroks/index.tsx

import { useState, useMemo, useEffect, useCallback, useRef, SetStateAction } from 'react';
import { router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import debounce from 'lodash/debounce';
import AppLayout from '@/layouts/admin-app-layout';
import { 
    Purok, 
    PurokFilters, 
    PaginationData,
    BulkOperation,
    SelectionMode
} from '@/types/admin/puroks/purok';
import { purokUtils } from '@/admin-utils/purok-utils';
import { TooltipProvider } from '@/components/ui/tooltip';

// Import AdminUI components
import PuroksHeader from '@/components/admin/puroks/PuroksHeader';
import PuroksStats from '@/components/admin/puroks/PuroksStats';
import PuroksFilters from '@/components/admin/puroks/PuroksFilters';
import PuroksContent from '@/components/admin/puroks/PuroksContent';
import PuroksDialogs from '@/components/admin/puroks/PuroksDialogs';
import { Button } from '@/components/ui/button';
import { KeyRound } from 'lucide-react';

interface PuroksPageProps {
    puroks: PaginationData;
    filters: PurokFilters;
    stats: {
        total: number;
        active: number;
        totalHouseholds: number;
        totalResidents: number;
    };
}

const defaultStats = {
    total: 0,
    active: 0,
    totalHouseholds: 0,
    totalResidents: 0
};

export default function PuroksIndex({ 
    puroks, 
    filters, 
    stats = defaultStats
}: PuroksPageProps) {
    const { flash } = usePage().props as any;
    
    // State management
    const [search, setSearch] = useState(filters.search || '');
    const [filtersState, setFiltersState] = useState<PurokFilters>({
        status: filters.status || 'all',
        sort_by: filters.sort_by || 'name',
        sort_order: filters.sort_order || 'asc'
    });
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
    
    // Bulk selection states
    const [selectedPuroks, setSelectedPuroks] = useState<number[]>([]);
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
            };
            
            Object.keys(params).forEach(key => {
                const k = key as keyof typeof params;
                if (params[k] === undefined || params[k] === '') {
                    delete params[k];
                }
            });
            
            router.get('/admin/puroks', params, {
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

    // Filter puroks
    const filteredPuroks = useMemo(() => {
        return purokUtils.filterPuroks({
            puroks: puroks.data,
            search,
            filters: filtersState
        });
    }, [puroks.data, search, filtersState]);

    // Calculate filtered stats
    const filteredStats = useMemo(() => {
        return {
            total: filteredPuroks.length,
            active: filteredPuroks.filter(p => p.status === 'active').length,
            totalHouseholds: filteredPuroks.reduce((sum, p) => sum + (p.total_households || 0), 0),
            totalResidents: filteredPuroks.reduce((sum, p) => sum + (p.total_residents || 0), 0)
        };
    }, [filteredPuroks]);

    // Pagination
    const totalItems = filteredPuroks.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedPuroks = filteredPuroks.slice(startIndex, endIndex);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, filtersState]);

    // Reset selection when exiting bulk mode
    useEffect(() => {
        if (!isBulkMode) {
            setSelectedPuroks([]);
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
                    if (selectedPuroks.length > 0) {
                        setSelectedPuroks([]);
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
            if (e.key === 'Delete' && isBulkMode && selectedPuroks.length > 0) {
                e.preventDefault();
                setShowBulkDeleteDialog(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isBulkMode, selectedPuroks, isMobile]);

    // Selection handlers
    const handleSelectAllOnPage = () => {
        const pageIds = paginatedPuroks.map(purok => purok.id);
        if (isSelectAll) {
            setSelectedPuroks(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedPuroks, ...pageIds])];
            setSelectedPuroks(newSelected);
        }
        setIsSelectAll(!isSelectAll);
        setSelectionMode('page');
    };

    const handleSelectAllFiltered = () => {
        const allIds = filteredPuroks.map(purok => purok.id);
        if (selectedPuroks.length === allIds.length && allIds.every(id => selectedPuroks.includes(id))) {
            setSelectedPuroks(prev => prev.filter(id => !allIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedPuroks, ...allIds])];
            setSelectedPuroks(newSelected);
            setSelectionMode('filtered');
        }
    };

    const handleSelectAll = () => {
        if (confirm(`This will select ALL ${puroks.total || 0} puroks. This action may take a moment.`)) {
            const allIds = puroks.data.map(p => p.id);
            setSelectedPuroks(allIds);
            setSelectionMode('all');
        }
    };

    const handleItemSelect = (id: number) => {
        setSelectedPuroks(prev => {
            if (prev.includes(id)) {
                return prev.filter(itemId => itemId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    // Check if all items on current page are selected
    useEffect(() => {
        const allPageIds = paginatedPuroks.map(purok => purok.id);
        const allSelected = allPageIds.length > 0 && allPageIds.every(id => selectedPuroks.includes(id));
        setIsSelectAll(allSelected);
    }, [selectedPuroks, paginatedPuroks]);

    // Get selected puroks data
    const selectedPuroksData = useMemo(() => {
        return filteredPuroks.filter(purok => selectedPuroks.includes(purok.id));
    }, [selectedPuroks, filteredPuroks]);

    // Calculate selection stats
    const selectionStats = useMemo(() => {
        return purokUtils.getSelectionStats(selectedPuroksData);
    }, [selectedPuroksData]);

    // Bulk operations
    const handleBulkOperation = async (operation: BulkOperation) => {
        if (selectedPuroks.length === 0) {
            toast.error('Please select at least one purok');
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
                    const exportData = selectedPuroksData.map(purok => ({
                        'ID': purok.id,
                        'Name': purok.name,
                        'Description': purok.description || '',
                        'Leader Name': purok.leader_name || '',
                        'Leader Contact': purok.leader_contact || '',
                        'Google Maps URL': purok.google_maps_url || '',
                        'Total Households': purok.total_households,
                        'Total Residents': purok.total_residents,
                        'Status': purok.status,
                        'Created At': purok.created_at,
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
                    a.download = `puroks-export-${new Date().toISOString().split('T')[0]}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                    
                    toast.success(`${selectedPuroks.length} puroks exported successfully`);
                    setSelectedPuroks([]);
                    break;

                case 'print':
                    selectedPuroks.forEach(id => {
                        window.open(`/admin/puroks/${id}/print`, '_blank');
                    });
                    toast.success(`${selectedPuroks.length} purok(s) opened for printing`);
                    setSelectedPuroks([]);
                    break;

                case 'generate_report':
                    const idsParam = selectedPuroks.join(',');
                    window.open(`/admin/puroks/report?ids=${idsParam}`, '_blank');
                    toast.success(`Generating report for ${selectedPuroks.length} purok(s)`);
                    setSelectedPuroks([]);
                    break;

                case 'send_message':
                    const leadersWithContacts = selectedPuroksData
                        .filter(p => p.leader_contact)
                        .map(p => ({ name: p.leader_name, contact: p.leader_contact }));
                    
                    if (leadersWithContacts.length > 0) {
                        const contacts = leadersWithContacts.map(l => l.contact).join(',');
                        const smsLink = `sms:${contacts}`;
                        window.location.href = smsLink;
                        toast.success(`Opening SMS for ${leadersWithContacts.length} purok leader(s)`);
                    } else {
                        toast.error('No contact numbers available for selected purok leaders');
                    }
                    setSelectedPuroks([]);
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
            await router.post('/admin/puroks/bulk-action', {
                action: 'update_status',
                purok_ids: selectedPuroks,
                status: bulkEditValue
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedPuroks([]);
                    setBulkEditValue('');
                    setShowBulkStatusDialog(false);
                    toast.success(`${selectedPuroks.length} purok statuses updated successfully`);
                },
                onError: () => {
                    toast.error('Failed to update purok status');
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
            await router.post('/admin/puroks/bulk-action', {
                action: 'delete',
                purok_ids: selectedPuroks,
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedPuroks([]);
                    setShowBulkDeleteDialog(false);
                    toast.success(`${selectedPuroks.length} puroks deleted successfully`);
                },
                onError: () => {
                    toast.error('Failed to delete puroks');
                }
            });
        } catch (error) {
            console.error('Bulk delete error:', error);
            toast.error('An error occurred during the operation.');
        } finally {
            setIsPerformingBulkAction(false);
        }
    };

    // Individual purok operations
    const handleDelete = (purok: Purok) => {
        if (confirm(`Are you sure you want to delete purok "${purok.name || 'Untitled'}"?`)) {
            router.delete(`/admin/puroks/${purok.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedPuroks(selectedPuroks.filter(id => id !== purok.id));
                    toast.success('Purok deleted successfully');
                },
                onError: () => {
                    toast.error('Failed to delete purok');
                }
            });
        }
    };

    const handleUpdateStatistics = () => {
        if (confirm('Update statistics for all puroks? This will recalculate household and resident counts.')) {
            router.post('/admin/puroks/update-statistics', {}, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Statistics updated successfully');
                },
                onError: () => {
                    toast.error('Failed to update statistics');
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
        
        router.get('/admin/puroks', params, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };

    const handleClearFilters = () => {
        setSearch('');
        setFiltersState({
            status: 'all',
            sort_by: 'name',
            sort_order: 'asc'
        });
        
        router.get('/admin/puroks', {
            search: '',
            status: 'all',
            sort_by: 'name',
            sort_order: 'asc'
        }, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };

    const handleClearSelection = () => {
        setSelectedPuroks([]);
        setIsSelectAll(false);
    };

    const handleCopySelectedData = () => {
        if (selectedPuroksData.length === 0) {
            toast.error('No data to copy');
            return;
        }
        
        const data = selectedPuroksData.map(purok => ({
            'Name': purok.name || 'N/A',
            'Leader': purok.leader_name || 'N/A',
            'Contact': purok.leader_contact || 'N/A',
            'Households': purok.total_households,
            'Residents': purok.total_residents,
            'Status': purok.status,
        }));
        
        const csvData = [
            Object.keys(data[0]).join(','),
            ...data.map(row => Object.values(row).join(','))
        ].join('\n');
        
        navigator.clipboard.writeText(csvData).then(() => {
            toast.success(`${selectedPuroksData.length} records copied to clipboard`);
        }).catch(() => {
            toast.error('Failed to copy to clipboard');
        });
    };

    const updateFilter = (key: keyof PurokFilters, value: string) => {
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
        
        router.get('/admin/puroks', params, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };

    const hasActiveFilters = Boolean(
        search || 
        filtersState.status !== 'all'
    );

    return (
        <AppLayout
            title="Purok Management"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Puroks', href: '/admin/puroks' }
            ]}
        >
            <TooltipProvider>
                <div className="space-y-4 sm:space-y-6">
                    <PuroksHeader 
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isMobile={isMobile}
                        onUpdateStatistics={handleUpdateStatistics}
                    />

                    <PuroksStats 
                        globalStats={stats}
                        filteredStats={filteredStats}
                        isLoading={isPerformingBulkAction}
                    />

                   <PuroksFilters
                        search={search}
                        setSearch={setSearch}
                        onSearchChange={(value: string) => {  // ← Change to string, not SetStateAction<string>
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
                    <PuroksContent
                        puroks={paginatedPuroks}
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isSelectAll={isSelectAll}
                        selectedPuroks={selectedPuroks}
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

            <PuroksDialogs
                showBulkDeleteDialog={showBulkDeleteDialog}
                setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                showBulkStatusDialog={showBulkStatusDialog}
                setShowBulkStatusDialog={setShowBulkStatusDialog}
                isPerformingBulkAction={isPerformingBulkAction}
                selectedPuroks={selectedPuroks}
                handleBulkOperation={handleBulkDelete}
                handleBulkStatusUpdate={handleBulkStatusUpdate}
                selectionStats={selectionStats}
                bulkEditValue={bulkEditValue}
                setBulkEditValue={setBulkEditValue}
            />
        </AppLayout>
    );
}