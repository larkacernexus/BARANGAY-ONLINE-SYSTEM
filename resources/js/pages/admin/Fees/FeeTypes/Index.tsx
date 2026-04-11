import { router, usePage } from '@inertiajs/react';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import debounce from 'lodash/debounce';
import AppLayout from '@/layouts/admin-app-layout';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { KeyRound } from 'lucide-react';
import { route } from 'ziggy-js';

// Import reusable components
import FeeTypesHeader from '@/components/admin/fee-types/FeeTypesHeader';
import FeeTypesStats from '@/components/admin/fee-types/FeeTypesStats';
import FeeTypesFilters from '@/components/admin/fee-types/FeeTypesFilters';
import FeeTypesContent from '@/components/admin/fee-types/FeeTypesContent';
import FeeTypesDialogs from '@/components/admin/fee-types/FeeTypesDialogs';

// Import utils
import {
    formatCurrency,
    formatDate,
    getCategoryIcon,
    getCategoryColor,
    getCategoryDetails,
    getSelectionStats,
    filterFeeTypes,
    formatForClipboard,
    safeNumber
} from '@/admin-utils/feeTypesUtils';

// Import types from centralized location
import type { 
    FeeType, 
    BulkOperation, 
    BulkEditField, 
    SelectionMode, 
    FilterState, 
    SelectionStats,
    PageProps
} from '@/types/admin/fee-types/fee.types';

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

export default function FeeTypesIndex() {
    const { props } = usePage<PageProps>();
    const { 
        feeTypes = [], 
        categories = {},
        filters = {}
    } = props;
    
    const safeFeeTypes: FeeType[] = Array.isArray(feeTypes) ? feeTypes : [];
    
    // Filter states - client-side only
    const [search, setSearch] = useState<string>(getSafeString(filters.search));
    const [categoryFilter, setCategoryFilter] = useState<string>(getSafeString(filters.category, 'all'));
    const [statusFilter, setStatusFilter] = useState<string>(getSafeString(filters.status, 'all'));
    const [hasDiscountFilter, setHasDiscountFilter] = useState<string>(getSafeString(filters.hasDiscount, 'all'));
    const [hasPenaltyFilter, setHasPenaltyFilter] = useState<string>(getSafeString(filters.hasPenalty, 'all'));
    const [frequencyFilter, setFrequencyFilter] = useState<string>(getSafeString(filters.frequency, 'all'));
    const [sortBy, setSortBy] = useState<string>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    
    const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
    const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage] = useState<number>(15);
    
    // Bulk selection states
    const [selectedFeeTypes, setSelectedFeeTypes] = useState<number[]>([]);
    const [isBulkMode, setIsBulkMode] = useState<boolean>(false);
    const [isSelectAll, setIsSelectAll] = useState<boolean>(false);
    const [selectionMode, setSelectionMode] = useState<SelectionMode>('page');
    
    // Dialog states
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState<boolean>(false);
    const [showBulkStatusDialog, setShowBulkStatusDialog] = useState<boolean>(false);
    const [showBulkCategoryDialog, setShowBulkCategoryDialog] = useState<boolean>(false);
    const [isPerformingBulkAction, setIsPerformingBulkAction] = useState<boolean>(false);
    const [bulkEditValue, setBulkEditValue] = useState<string>('');
    const [bulkEditField, setBulkEditField] = useState<BulkEditField>('status');

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

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, categoryFilter, statusFilter, hasDiscountFilter, hasPenaltyFilter, frequencyFilter, sortBy, sortOrder]);

    // Reset selection when exiting bulk mode
    useEffect(() => {
        if (!isBulkMode) {
            setSelectedFeeTypes([]);
            setIsSelectAll(false);
        }
    }, [isBulkMode]);

    // Filter fee types client-side
    const filteredFeeTypes = useMemo(() => {
        if (!safeFeeTypes || safeFeeTypes.length === 0) {
            return [];
        }
        
        let filtered = [...safeFeeTypes];
        
        // Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(feeType =>
                feeType?.name?.toLowerCase().includes(searchLower) ||
                feeType?.code?.toLowerCase().includes(searchLower) ||
                feeType?.description?.toLowerCase().includes(searchLower)
            );
        }
        
        // Category filter
        if (categoryFilter && categoryFilter !== 'all') {
            filtered = filtered.filter(feeType => feeType?.document_category_id?.toString() === categoryFilter);
        }
        
        // Status filter
        if (statusFilter && statusFilter !== 'all') {
            filtered = filtered.filter(feeType => feeType?.is_active === (statusFilter === 'active'));
        }
        
        // Has discount filter
        if (hasDiscountFilter && hasDiscountFilter !== 'all') {
            filtered = filtered.filter(feeType => 
                (feeType?.has_senior_discount || feeType?.has_pwd_discount || feeType?.has_solo_parent_discount || feeType?.has_indigent_discount) === (hasDiscountFilter === 'yes')
            );
        }
        
        // Has penalty filter
        if (hasPenaltyFilter && hasPenaltyFilter !== 'all') {
            filtered = filtered.filter(feeType => feeType?.has_penalty === (hasPenaltyFilter === 'yes'));
        }
        
        // Frequency filter
        if (frequencyFilter && frequencyFilter !== 'all') {
            filtered = filtered.filter(feeType => feeType?.frequency === frequencyFilter);
        }
        
        // Apply sorting
        if (filtered.length > 0) {
            filtered.sort((a, b) => {
                let valueA: any;
                let valueB: any;
                
                switch (sortBy) {
                    case 'name':
                        valueA = a?.name || '';
                        valueB = b?.name || '';
                        break;
                    case 'code':
                        valueA = a?.code || '';
                        valueB = b?.code || '';
                        break;
                    case 'base_amount':
                        valueA = Number(a?.base_amount) || 0;
                        valueB = Number(b?.base_amount) || 0;
                        break;
                    case 'category':
                        valueA = a?.document_category?.name || '';
                        valueB = b?.document_category?.name || '';
                        break;
                    case 'frequency':
                        valueA = a?.frequency || '';
                        valueB = b?.frequency || '';
                        break;
                    case 'status':
                        valueA = a?.is_active ? 1 : 0;
                        valueB = b?.is_active ? 1 : 0;
                        break;
                    case 'has_penalty':
                        valueA = a?.has_penalty ? 1 : 0;
                        valueB = b?.has_penalty ? 1 : 0;
                        break;
                    case 'created_at':
                        valueA = a?.created_at ? new Date(a.created_at).getTime() : 0;
                        valueB = b?.created_at ? new Date(b.created_at).getTime() : 0;
                        break;
                    default:
                        valueA = a?.name || '';
                        valueB = b?.name || '';
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
    }, [safeFeeTypes, search, categoryFilter, statusFilter, hasDiscountFilter, hasPenaltyFilter, frequencyFilter, sortBy, sortOrder]);

    // Statistics for filtered items
    const stats = useMemo(() => {
        const totalAmount = filteredFeeTypes.reduce((sum, ft) => {
            const amount = ft?.base_amount;
            if (amount === null || amount === undefined) return sum;
            const numAmount = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
            return sum + (isNaN(numAmount) ? 0 : numAmount);
        }, 0);

        return {
            total: filteredFeeTypes.length,
            active: filteredFeeTypes.filter(ft => ft?.is_active).length,
            inactive: filteredFeeTypes.filter(ft => !ft?.is_active).length,
            mandatory: filteredFeeTypes.filter(ft => ft?.is_mandatory).length,
            autoGenerate: filteredFeeTypes.filter(ft => ft?.auto_generate).length,
            totalAmount: totalAmount
        };
    }, [filteredFeeTypes]);

    // Category counts
    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        filteredFeeTypes.forEach(feeType => {
            const categoryId = feeType?.document_category_id?.toString() || 'uncategorized';
            counts[categoryId] = (counts[categoryId] || 0) + 1;
        });
        return counts;
    }, [filteredFeeTypes]);

    // Pagination
    const totalItems = filteredFeeTypes.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedFeeTypes = filteredFeeTypes.slice(startIndex, endIndex);

    // Selection handlers
    const handleSelectAllOnPage = useCallback(() => {
        const pageIds = paginatedFeeTypes.map(feeType => feeType.id);
        if (isSelectAll) {
            setSelectedFeeTypes(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedFeeTypes, ...pageIds])];
            setSelectedFeeTypes(newSelected);
        }
        setIsSelectAll(!isSelectAll);
        setSelectionMode('page');
    }, [paginatedFeeTypes, isSelectAll, selectedFeeTypes]);

    const handleSelectAllFiltered = useCallback(() => {
        const allIds = filteredFeeTypes.map(feeType => feeType.id);
        if (selectedFeeTypes.length === allIds.length && allIds.every(id => selectedFeeTypes.includes(id))) {
            setSelectedFeeTypes(prev => prev.filter(id => !allIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedFeeTypes, ...allIds])];
            setSelectedFeeTypes(newSelected);
            setSelectionMode('filtered');
        }
    }, [filteredFeeTypes, selectedFeeTypes]);

    const handleSelectAll = useCallback(() => {
        if (confirm(`This will select ALL ${totalItems} fee types. This action may take a moment.`)) {
            const allIds = filteredFeeTypes.map(feeType => feeType.id);
            setSelectedFeeTypes(allIds);
            setSelectionMode('all');
        }
    }, [filteredFeeTypes, totalItems]);

    const handleItemSelect = useCallback((id: number) => {
        setSelectedFeeTypes(prev => {
            if (prev.includes(id)) {
                return prev.filter(itemId => itemId !== id);
            } else {
                return [...prev, id];
            }
        });
    }, []);

    // Check if all items on current page are selected
    useEffect(() => {
        const allPageIds = paginatedFeeTypes.map(feeType => feeType.id);
        const allSelected = allPageIds.length > 0 && allPageIds.every(id => selectedFeeTypes.includes(id));
        setIsSelectAll(allSelected);
    }, [selectedFeeTypes, paginatedFeeTypes]);

    // Get selected fee types data
    const selectedFeeTypesData = useMemo(() => {
        return filteredFeeTypes.filter(feeType => selectedFeeTypes.includes(feeType.id));
    }, [selectedFeeTypes, filteredFeeTypes]);

    // Calculate selection stats
    const selectionStats = useMemo((): SelectionStats => {
        return getSelectionStats(selectedFeeTypesData);
    }, [selectedFeeTypesData]);

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
        if (selectedFeeTypes.length === 0) {
            toast.error('Please select at least one fee type');
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
                    setShowBulkStatusDialog(true);
                    break;

                case 'export':
                case 'export_csv':
                    const exportData = selectedFeeTypesData.map(feeType => ({
                        'Name': feeType.name,
                        'Code': feeType.code,
                        'Category': feeType.document_category?.name || 'Uncategorized',
                        'Base Amount': formatCurrency(feeType.base_amount),
                        'Frequency': feeType.frequency || 'one_time',
                        'Status': feeType.is_active ? 'Active' : 'Inactive',
                        'Has Penalty': feeType.has_penalty ? 'Yes' : 'No'
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
                    a.download = `fee-types-export-${new Date().toISOString().split('T')[0]}.csv`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                    
                    toast.success('Export completed successfully');
                    break;

                case 'duplicate':
                    if (confirm(`Duplicate ${selectedFeeTypes.length} selected fee type(s)?`)) {
                        await router.post(route('fee-types.bulk-duplicate'), {
                            ids: selectedFeeTypes
                        }, {
                            preserveScroll: true,
                            onSuccess: () => {
                                toast.success(`${selectedFeeTypes.length} fee type(s) duplicated successfully`);
                                setSelectedFeeTypes([]);
                            },
                            onError: (errors) => {
                                toast.error('Failed to duplicate fee types');
                            }
                        });
                    }
                    break;

                case 'update_category':
                    setShowBulkCategoryDialog(true);
                    break;

                default:
                    toast.error('Operation not supported');
            }
        } catch (error) {
            console.error('Bulk operation error:', error);
            toast.error('An error occurred during bulk operation');
        } finally {
            setIsPerformingBulkAction(false);
        }
    };

    // Copy selected data to clipboard
    const handleCopySelectedData = useCallback(() => {
        if (selectedFeeTypesData.length === 0) {
            toast.error('No data to copy');
            return;
        }
        
        const data = selectedFeeTypesData.map(feeType => ({
            'Name': feeType.name,
            'Code': feeType.code,
            'Category': feeType.document_category?.name || 'Uncategorized',
            'Amount': formatCurrency(feeType.base_amount),
            'Status': feeType.is_active ? 'Active' : 'Inactive'
        }));
        
        const csv = [
            Object.keys(data[0]).join('\t'),
            ...data.map(row => Object.values(row).join('\t'))
        ].join('\n');
        
        navigator.clipboard.writeText(csv).then(() => {
            toast.success(`${selectedFeeTypesData.length} records copied to clipboard`);
        }).catch(() => {
            toast.error('Failed to copy to clipboard');
        });
    }, [selectedFeeTypesData]);

    // Individual fee type operations
    const handleToggleStatus = useCallback((feeType: FeeType) => {
        if (confirm(`Are you sure you want to ${feeType.is_active ? 'deactivate' : 'activate'} "${feeType.name}"?`)) {
            router.post(route('fee-types.toggle-status', feeType.id), {}, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Fee type ${feeType.is_active ? 'deactivated' : 'activated'} successfully`);
                },
                onError: () => {
                    toast.error('Failed to toggle status');
                },
            });
        }
    }, []);

    const handleDuplicate = useCallback((feeType: FeeType) => {
        if (confirm(`Duplicate "${feeType.name}" fee type?`)) {
            router.post(route('fee-types.duplicate', feeType.id), {}, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Fee type duplicated successfully');
                },
                onError: () => {
                    toast.error('Failed to duplicate fee type');
                },
            });
        }
    }, []);

    const handleDelete = useCallback((feeType: FeeType) => {
        if (confirm(`Are you sure you want to delete "${feeType.name}"? This action cannot be undone.`)) {
            router.delete(route('fee-types.destroy', feeType.id));
        }
    }, []);

    const handleCopyToClipboard = useCallback((text: string, label: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success(`${label} copied to clipboard`);
        }).catch(() => {
            toast.error('Failed to copy to clipboard');
        });
    }, []);

    const handleSort = useCallback((column: string) => {
        const newSortOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortBy(column);
        setSortOrder(newSortOrder);
    }, [sortBy, sortOrder]);

    const handleClearFilters = useCallback(() => {
        setSearch('');
        setCategoryFilter('all');
        setStatusFilter('all');
        setHasDiscountFilter('all');
        setHasPenaltyFilter('all');
        setFrequencyFilter('all');
        setSortBy('name');
        setSortOrder('asc');
        setCurrentPage(1);
    }, []);

    const handleClearSelection = useCallback(() => {
        setSelectedFeeTypes([]);
        setIsSelectAll(false);
    }, []);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleViewPhoto = useCallback(() => {
        toast.info('Feature to be implemented');
    }, []);

    const updateFilter = useCallback((key: string, value: string) => {
        switch (key) {
            case 'category':
                setCategoryFilter(value);
                break;
            case 'status':
                setStatusFilter(value);
                break;
            case 'hasDiscount':
                setHasDiscountFilter(value);
                break;
            case 'hasPenalty':
                setHasPenaltyFilter(value);
                break;
            case 'frequency':
                setFrequencyFilter(value);
                break;
        }
    }, []);

    const hasActiveFilters = Boolean(
        search || 
        (categoryFilter && categoryFilter !== 'all') || 
        (statusFilter && statusFilter !== 'all') ||
        (hasDiscountFilter && hasDiscountFilter !== 'all') ||
        (hasPenaltyFilter && hasPenaltyFilter !== 'all') ||
        (frequencyFilter && frequencyFilter !== 'all')
    );

    // Create filters object for the Filters component
    const filtersStateForComponent = {
        category: categoryFilter,
        status: statusFilter,
        hasDiscount: hasDiscountFilter,
        hasPenalty: hasPenaltyFilter,
        frequency: frequencyFilter,
        search: search
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
                    if (selectedFeeTypes.length > 0) {
                        setSelectedFeeTypes([]);
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
            if (e.key === 'Delete' && isBulkMode && selectedFeeTypes.length > 0) {
                e.preventDefault();
                setShowBulkDeleteDialog(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isBulkMode, selectedFeeTypes, isMobile]);

    // Error boundary fallback
    if (!Array.isArray(safeFeeTypes)) {
        return (
            <AppLayout
                title="Fee Types"
                breadcrumbs={[
                    { title: 'Dashboard', href: '/admin/dashboard' },
                    { title: 'Fee Types', href: '/admin/fee-types' }
                ]}
            >
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="text-red-600 text-xl mb-2">Error Loading Fee Types</div>
                        <p className="text-gray-600">Fee types data is not in the expected format.</p>
                        <Button 
                            onClick={() => router.reload()} 
                            className="mt-4"
                            variant="outline"
                        >
                            Reload Page
                        </Button>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout
            title="Fee Types"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Fee Types', href: '/admin/fee-types' }
            ]}
        >
            <TooltipProvider>
                <div className="space-y-6">
                    <FeeTypesHeader 
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isMobile={isMobile}
                    />

                    <FeeTypesStats 
                        stats={stats}
                        categoryCounts={categoryCounts}
                    />

                    <FeeTypesFilters
                        search={search}
                        setSearch={setSearch}
                        filtersState={filtersStateForComponent}
                        updateFilter={updateFilter}
                        handleClearFilters={handleClearFilters}
                        hasActiveFilters={hasActiveFilters}
                        isMobile={isMobile}
                        totalItems={totalItems}
                        startIndex={startIndex}
                        endIndex={endIndex}
                        searchInputRef={searchInputRef}
                        categories={categories}
                        categoryCounts={categoryCounts}
                    />

                    <FeeTypesContent
                        feeTypes={paginatedFeeTypes}
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isSelectAll={isSelectAll}
                        selectedFeeTypes={selectedFeeTypes}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        isMobile={isMobile}
                        hasActiveFilters={hasActiveFilters}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        onPageChange={handlePageChange}
                        onSelectAllOnPage={handleSelectAllOnPage}
                        onSelectAllFiltered={handleSelectAllFiltered}
                        onSelectAll={handleSelectAll}
                        onItemSelect={handleItemSelect}
                        onClearFilters={handleClearFilters}
                        onClearSelection={handleClearSelection}
                        onDelete={handleDelete}
                        onToggleStatus={handleToggleStatus}
                        onDuplicate={handleDuplicate}
                        onViewPhoto={handleViewPhoto}
                        onCopyToClipboard={handleCopyToClipboard}
                        onCopySelectedData={handleCopySelectedData}
                        onSort={handleSort}
                        onBulkOperation={handleBulkOperation}
                        setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                        setShowBulkStatusDialog={setShowBulkStatusDialog}
                        setShowBulkCategoryDialog={setShowBulkCategoryDialog}
                        filtersState={filtersStateForComponent}
                        isPerformingBulkAction={isPerformingBulkAction}
                        selectionMode={selectionMode}
                        selectionStats={selectionStats}
                        categories={categories}
                        getCategoryDetails={getCategoryDetails}
                        formatCurrency={formatCurrency}
                        formatDate={formatDate}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSortChange={handleSortChange}
                        getCurrentSortValue={getCurrentSortValue}
                    />

                    {/* Keyboard Shortcuts Help */}
                    {isBulkMode && !isMobile && (
                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <KeyRound className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                    <span className="text-sm font-medium dark:text-gray-200">Keyboard Shortcuts</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsBulkMode(false)}
                                    className="h-7 text-xs dark:text-gray-300 dark:hover:bg-gray-800"
                                    disabled={isPerformingBulkAction}
                                >
                                    Exit Bulk Mode
                                </Button>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-xs text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-1">
                                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-gray-800 dark:text-gray-200">Ctrl+A</kbd>
                                    <span>Select page</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-gray-800 dark:text-gray-200">Shift+Ctrl+A</kbd>
                                    <span>Select filtered</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-gray-800 dark:text-gray-200">Delete</kbd>
                                    <span>Delete selected</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-gray-800 dark:text-gray-200">Esc</kbd>
                                    <span>Exit/clear</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </TooltipProvider>

            <FeeTypesDialogs
                showBulkDeleteDialog={showBulkDeleteDialog}
                setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                showBulkStatusDialog={showBulkStatusDialog}
                setShowBulkStatusDialog={setShowBulkStatusDialog}
                showBulkCategoryDialog={showBulkCategoryDialog}
                setShowBulkCategoryDialog={setShowBulkCategoryDialog}
                isPerformingBulkAction={isPerformingBulkAction}
                bulkEditValue={bulkEditValue}
                setBulkEditValue={setBulkEditValue}
                bulkEditField={bulkEditField}
                setBulkEditField={setBulkEditField}
                selectedFeeTypes={selectedFeeTypes}
                handleBulkOperation={handleBulkOperation}
                selectionStats={selectionStats}
                categories={categories}
                selectedFeeTypesData={selectedFeeTypesData}
                formatCurrency={formatCurrency}
            />
        </AppLayout>
    );
}