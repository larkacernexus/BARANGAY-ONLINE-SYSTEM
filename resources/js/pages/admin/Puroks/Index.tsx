import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
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

// Helper function to extract numeric value from purok name
const getPurokNumber = (name: string): number => {
    const match = name.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
};

// Helper functions for safe value extraction
const getSafeString = (value: any, defaultValue: string = ''): string => {
    if (value === null || value === undefined) return defaultValue;
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    return defaultValue;
};

const getSafeSortOrder = (value: any): 'asc' | 'desc' => {
    if (value === 'asc') return 'asc';
    if (value === 'desc') return 'desc';
    return 'asc';
};

export default function PuroksIndex({ 
    puroks, 
    filters, 
    stats = defaultStats
}: PuroksPageProps) {
    const { flash } = usePage().props as any;
    
    // Safe data extraction
    const safePuroks = puroks || { data: [], current_page: 1, last_page: 1, total: 0, per_page: 10, from: 0, to: 0 };
    const allPuroks = safePuroks.data || [];
    const safeFilters = filters || {};
    
    // Filter states - all client-side
    const [search, setSearch] = useState<string>(getSafeString(safeFilters.search));
    const [statusFilter, setStatusFilter] = useState<string>(getSafeString(safeFilters.status, 'all'));
    const [populationRange, setPopulationRange] = useState<string>(getSafeString(safeFilters.population_range, ''));
    const [householdRange, setHouseholdRange] = useState<string>(getSafeString(safeFilters.household_range, ''));
    const [sortBy, setSortBy] = useState<string>(getSafeString(safeFilters.sort_by, 'name'));
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(getSafeSortOrder(safeFilters.sort_order));
    
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    
    // Bulk selection states
    const [selectedPuroks, setSelectedPuroks] = useState<number[]>([]);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [isSelectAll, setIsSelectAll] = useState(false);
    const [selectionMode, setSelectionMode] = useState<SelectionMode>('page');
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
    const [showBulkStatusDialog, setShowBulkStatusDialog] = useState(false);
    const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false);
    const [bulkEditValue, setBulkEditValue] = useState<string>('');

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

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter, populationRange, householdRange, sortBy, sortOrder]);

    // Reset selection when exiting bulk mode
    useEffect(() => {
        if (!isBulkMode) {
            setSelectedPuroks([]);
            setIsSelectAll(false);
        }
    }, [isBulkMode]);

    // Filter puroks client-side
    const filteredPuroks = useMemo(() => {
        if (!allPuroks || allPuroks.length === 0) {
            return [];
        }
        
        let filtered = [...allPuroks];
        
        // Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(purok =>
                purok?.name?.toLowerCase().includes(searchLower) ||
                purok?.description?.toLowerCase().includes(searchLower) ||
                purok?.leader_name?.toLowerCase().includes(searchLower)
            );
        }
        
        // Status filter
        if (statusFilter && statusFilter !== 'all') {
            filtered = filtered.filter(purok => purok?.status === statusFilter);
        }
        
        // Population range filter
        if (populationRange) {
            filtered = filtered.filter(purok => {
                const residents = purok?.total_residents || 0;
                switch (populationRange) {
                    case '0-50': return residents <= 50;
                    case '51-100': return residents >= 51 && residents <= 100;
                    case '101-200': return residents >= 101 && residents <= 200;
                    case '201-500': return residents >= 201 && residents <= 500;
                    case '500+': return residents >= 500;
                    default: return true;
                }
            });
        }
        
        // Household range filter
        if (householdRange) {
            filtered = filtered.filter(purok => {
                const households = purok?.total_households || 0;
                switch (householdRange) {
                    case '0-10': return households <= 10;
                    case '11-20': return households >= 11 && households <= 20;
                    case '21-50': return households >= 21 && households <= 50;
                    case '51-100': return households >= 51 && households <= 100;
                    case '100+': return households >= 100;
                    default: return true;
                }
            });
        }
        
        // Apply sorting with numerical support for purok names
        if (filtered.length > 0) {
            filtered.sort((a, b) => {
                let valueA: any;
                let valueB: any;
                
                switch (sortBy) {
                    case 'name':
                        const numA = getPurokNumber(a?.name || '');
                        const numB = getPurokNumber(b?.name || '');
                        valueA = numA;
                        valueB = numB;
                        break;
                    case 'total_households':
                        valueA = a?.total_households || 0;
                        valueB = b?.total_households || 0;
                        break;
                    case 'total_residents':
                        valueA = a?.total_residents || 0;
                        valueB = b?.total_residents || 0;
                        break;
                    case 'leader_name':
                        valueA = a?.leader_name || '';
                        valueB = b?.leader_name || '';
                        break;
                    case 'status':
                        valueA = a?.status || '';
                        valueB = b?.status || '';
                        break;
                    case 'created_at':
                        valueA = a?.created_at ? new Date(a.created_at).getTime() : 0;
                        valueB = b?.created_at ? new Date(b.created_at).getTime() : 0;
                        break;
                    default:
                        const defaultNumA = getPurokNumber(a?.name || '');
                        const defaultNumB = getPurokNumber(b?.name || '');
                        valueA = defaultNumA;
                        valueB = defaultNumB;
                }
                
                if (typeof valueA === 'string') {
                    valueA = valueA.toLowerCase();
                    valueB = valueB.toLowerCase();
                }
                
                if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
                if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
                return 0;
            });
        }
        
        return filtered;
    }, [allPuroks, search, statusFilter, populationRange, householdRange, sortBy, sortOrder]);

    // Calculate filtered stats
    const filteredStats = useMemo(() => {
        if (!filteredPuroks || filteredPuroks.length === 0) {
            return {
                total: 0,
                active: 0,
                totalHouseholds: 0,
                totalResidents: 0
            };
        }
        
        return {
            total: filteredPuroks.length,
            active: filteredPuroks.filter(p => p?.status === 'active').length,
            totalHouseholds: filteredPuroks.reduce((sum, p) => sum + (p?.total_households || 0), 0),
            totalResidents: filteredPuroks.reduce((sum, p) => sum + (p?.total_residents || 0), 0)
        };
    }, [filteredPuroks]);

    // Pagination
    const totalItems = filteredPuroks.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedPuroks = filteredPuroks.slice(startIndex, endIndex);

    // Selection handlers
    const handleSelectAllOnPage = useCallback(() => {
        const pageIds = paginatedPuroks.map(purok => purok.id);
        if (isSelectAll) {
            setSelectedPuroks(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedPuroks, ...pageIds])];
            setSelectedPuroks(newSelected);
        }
        setIsSelectAll(!isSelectAll);
        setSelectionMode('page');
    }, [paginatedPuroks, isSelectAll, selectedPuroks]);

    const handleSelectAllFiltered = useCallback(() => {
        const allIds = filteredPuroks.map(purok => purok.id);
        if (selectedPuroks.length === allIds.length && allIds.every(id => selectedPuroks.includes(id))) {
            setSelectedPuroks(prev => prev.filter(id => !allIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedPuroks, ...allIds])];
            setSelectedPuroks(newSelected);
            setSelectionMode('filtered');
        }
    }, [filteredPuroks, selectedPuroks]);

    const handleSelectAll = useCallback(() => {
        if (confirm(`This will select ALL ${totalItems} puroks. This action may take a moment.`)) {
            const allIds = filteredPuroks.map(purok => purok.id);
            setSelectedPuroks(allIds);
            setSelectionMode('all');
        }
    }, [filteredPuroks, totalItems]);

    const handleItemSelect = useCallback((id: number) => {
        setSelectedPuroks(prev => {
            if (prev.includes(id)) {
                return prev.filter(itemId => itemId !== id);
            } else {
                return [...prev, id];
            }
        });
    }, []);

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

    // Handle sort change from dropdown
    const handleSortChange = useCallback((value: string) => {
        const [newSortBy, newSortOrder] = value.split('-');
        setSortBy(newSortBy);
        setSortOrder(newSortOrder as 'asc' | 'desc');
    }, []);

    // Get current sort value for dropdown
    const getCurrentSortValue = useCallback((): string => {
        return `${sortBy}-${sortOrder}`;
    }, [sortBy, sortOrder]);

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
                        'Name': purok.name,
                        'Description': purok.description || '',
                        'Leader Name': purok.leader_name || '',
                        'Leader Contact': purok.leader_contact || '',
                        'Total Households': purok.total_households,
                        'Total Residents': purok.total_residents,
                        'Status': purok.status,
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
                    a.click();
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
                    // Refresh the page data
                    router.reload({ only: ['puroks'] });
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
                    // Refresh the page data
                    router.reload({ only: ['puroks'] });
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
                    // Refresh the page data
                    router.reload({ only: ['puroks'] });
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
                    // Refresh the page data
                    router.reload({ only: ['puroks'] });
                },
                onError: () => {
                    toast.error('Failed to update statistics');
                }
            });
        }
    };

    const handleSort = useCallback((column: string) => {
        const newSortOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortBy(column);
        setSortOrder(newSortOrder);
    }, [sortBy, sortOrder]);

    const handleClearFilters = useCallback(() => {
        setSearch('');
        setStatusFilter('all');
        setPopulationRange('');
        setHouseholdRange('');
        setSortBy('name');
        setSortOrder('asc');
        setCurrentPage(1);
    }, []);

    const handleClearSelection = useCallback(() => {
        setSelectedPuroks([]);
        setIsSelectAll(false);
    }, []);

    const handleCopySelectedData = useCallback(() => {
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
    }, [selectedPuroksData]);

    const updateFilter = useCallback((key: keyof PurokFilters, value: string) => {
        switch (key) {
            case 'status':
                setStatusFilter(value);
                break;
            case 'population_range':
                setPopulationRange(value);
                break;
            case 'household_range':
                setHouseholdRange(value);
                break;
            case 'sort_by':
                setSortBy(value);
                break;
            case 'sort_order':
                setSortOrder(value as 'asc' | 'desc');
                break;
        }
        setCurrentPage(1);
    }, []);

    const hasActiveFilters = Boolean(
        search || 
        (statusFilter && statusFilter !== 'all') ||
        populationRange ||
        householdRange
    );

    // Create filters object for the Filters component
const filtersStateForComponent: PurokFilters = {
    status: statusFilter,
    sort_by: sortBy as "name" | "status" | "created_at" | "total_households" | "total_residents" | "leader_name",
    sort_order: sortOrder,
    population_range: populationRange,
    household_range: householdRange
};

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
                    if (selectedPuroks.length > 0) {
                        setSelectedPuroks([]);
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
            if (e.key === 'Delete' && isBulkMode && selectedPuroks.length > 0) {
                e.preventDefault();
                setShowBulkDeleteDialog(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isBulkMode, selectedPuroks, isMobile]);

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
                        onSearchChange={(value: string) => {
                            setSearch(value);
                        }}
                        filtersState={filtersStateForComponent}
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
                        filtersState={filtersStateForComponent}
                        isPerformingBulkAction={isPerformingBulkAction}
                        selectionMode={selectionMode}
                        selectionStats={selectionStats}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSortChange={handleSortChange}
                        getCurrentSortValue={getCurrentSortValue}
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