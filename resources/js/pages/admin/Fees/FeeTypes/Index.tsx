// app/pages/admin/fee-types/index.tsx
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

// Import types
import { FeeType, BulkOperation, BulkEditField, SelectionMode, FilterState, SelectionStats } from '@/types/fee-types';

interface PageProps {
    feeTypes: FeeType[];
    categories: Record<string, string>;
    filters: {
        search?: string;
        category?: string;
        status?: string;
    };
}

declare module '@inertiajs/react' {
    interface PageProps {
        feeTypes: FeeType[];
        categories: Record<string, string>;
        filters: {
            search?: string;
            category?: string;
            status?: string;
        };
    }
}

export default function FeeTypesIndex({ 
    feeTypes = [], 
    categories = {},
    filters = {},
}: PageProps) {
    const safeFeeTypes = Array.isArray(feeTypes) ? feeTypes : [];
    
    // State management
    const [search, setSearch] = useState(filters.search || '');
    const [filtersState, setFiltersState] = useState<FilterState>({
        search: filters.search || '',
        category: filters.category || 'all',
        status: filters.status || 'all'
    });
    const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
    const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    
    // Bulk selection states
    const [selectedFeeTypes, setSelectedFeeTypes] = useState<number[]>([]);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [isSelectAll, setIsSelectAll] = useState(false);
    const [selectionMode, setSelectionMode] = useState<SelectionMode>('page');
    
    // Dialog states
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
    const [showBulkStatusDialog, setShowBulkStatusDialog] = useState(false);
    const [showBulkCategoryDialog, setShowBulkCategoryDialog] = useState(false);
    const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false);
    const [bulkEditValue, setBulkEditValue] = useState<string>('');
    const [bulkEditField, setBulkEditField] = useState<BulkEditField>('status');

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
            
            router.get(route('fee-types.index'), params, {
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
    }, [search, debouncedSearch]);

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

    // Reset selection when exiting bulk mode
    useEffect(() => {
        if (!isBulkMode) {
            setSelectedFeeTypes([]);
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
                    if (selectedFeeTypes.length > 0) {
                        setSelectedFeeTypes([]);
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
            if (e.key === 'Delete' && isBulkMode && selectedFeeTypes.length > 0) {
                e.preventDefault();
                setShowBulkDeleteDialog(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isBulkMode, selectedFeeTypes, isMobile]);

    // Filter fee types client-side for selection
    const filteredFeeTypes = useMemo(() => {
        return filterFeeTypes(
            safeFeeTypes,
            search,
            filtersState,
            'name',
            'asc'
        );
    }, [safeFeeTypes, search, filtersState]);

    // Calculate pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const totalItems = filteredFeeTypes.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedFeeTypes = filteredFeeTypes.slice(startIndex, endIndex);

    // Selection handlers
    const handleSelectAllOnPage = () => {
        const pageIds = paginatedFeeTypes.map(feeType => feeType.id);
        if (isSelectAll) {
            setSelectedFeeTypes(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedFeeTypes, ...pageIds])];
            setSelectedFeeTypes(newSelected);
        }
        setIsSelectAll(!isSelectAll);
        setSelectionMode('page');
    };

    const handleSelectAllFiltered = () => {
        const allIds = filteredFeeTypes.map(feeType => feeType.id);
        if (selectedFeeTypes.length === allIds.length && allIds.every(id => selectedFeeTypes.includes(id))) {
            setSelectedFeeTypes(prev => prev.filter(id => !allIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedFeeTypes, ...allIds])];
            setSelectedFeeTypes(newSelected);
            setSelectionMode('filtered');
        }
    };

    const handleSelectAll = () => {
        if (confirm(`This will select ALL ${safeFeeTypes.length} fee types. This action may take a moment.`)) {
            const pageIds = paginatedFeeTypes.map(feeType => feeType.id);
            setSelectedFeeTypes(pageIds);
            setSelectionMode('all');
        }
    };

    const handleItemSelect = (id: number) => {
        setSelectedFeeTypes(prev => {
            if (prev.includes(id)) {
                return prev.filter(itemId => itemId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

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
    const selectionStats = useMemo(() => {
        return getSelectionStats(selectedFeeTypesData);
    }, [selectedFeeTypesData]);

    // Statistics for all filtered items
    const stats = useMemo(() => {
        const totalAmount = filteredFeeTypes.reduce((sum, ft) => {
            const amount = ft.base_amount;
            if (amount === null || amount === undefined || amount === '') return sum;
            const numAmount = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
            return sum + (isNaN(numAmount) ? 0 : numAmount);
        }, 0);

        return {
            total: filteredFeeTypes.length,
            active: filteredFeeTypes.filter(ft => ft.is_active).length,
            inactive: filteredFeeTypes.filter(ft => !ft.is_active).length,
            mandatory: filteredFeeTypes.filter(ft => ft.is_mandatory).length,
            autoGenerate: filteredFeeTypes.filter(ft => ft.auto_generate).length,
            totalAmount: totalAmount
        };
    }, [filteredFeeTypes]);

    // Category counts
    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        filteredFeeTypes.forEach(feeType => {
            const categoryId = feeType.document_category_id?.toString() || 'uncategorized';
            counts[categoryId] = (counts[categoryId] || 0) + 1;
        });
        return counts;
    }, [filteredFeeTypes]);

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
                    setShowBulkStatusDialog(true);
                    break;

                case 'deactivate':
                    setShowBulkStatusDialog(true);
                    break;

                case 'export':
                case 'export_csv':
                    const exportData = selectedFeeTypesData.map(feeType => ({
                        'ID': feeType.id,
                        'Code': feeType.code,
                        'Name': feeType.name,
                        'Short Name': feeType.short_name || '',
                        'Description': feeType.description || '',
                        'Category': feeType.document_category?.name || 'Uncategorized',
                        'Base Amount': formatCurrency(feeType.base_amount),
                        'Amount Type': feeType.amount_type || 'fixed',
                        'Frequency': feeType.frequency || 'one_time',
                        'Validity Days': feeType.validity_days || '',
                        'Status': feeType.is_active ? 'Active' : 'Inactive',
                        'Mandatory': feeType.is_mandatory ? 'Yes' : 'No',
                        'Auto Generate': feeType.auto_generate ? 'Yes' : 'No',
                        'Created At': feeType.created_at,
                        'Updated At': feeType.updated_at,
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
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
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
                                console.error('Duplicate errors:', errors);
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
    const handleCopySelectedData = () => {
        if (selectedFeeTypesData.length === 0) {
            toast.error('No data to copy');
            return;
        }
        
        const csv = formatForClipboard(selectedFeeTypesData);
        
        navigator.clipboard.writeText(csv).then(() => {
            toast.success('Selected data copied to clipboard as CSV');
        }).catch(() => {
            toast.error('Failed to copy to clipboard');
        });
    };

    // Individual fee type operations
    const handleToggleStatus = (feeType: FeeType) => {
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
    };

    const handleDuplicate = (feeType: FeeType) => {
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
    };

    const handleDelete = (feeType: FeeType) => {
        if (confirm(`Are you sure you want to delete "${feeType.name}"? This action cannot be undone.`)) {
            router.delete(route('fee-types.destroy', feeType.id));
        }
    };

    const handleCopyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success(`${label} copied to clipboard`);
        }).catch(() => {
            toast.error('Failed to copy to clipboard');
        });
    };

    const handleSort = (column: string) => {
        // For client-side sorting, we could implement it here
        // For server-side sorting, we would update filters
        toast.info(`Sort by ${column} - to be implemented`);
    };

    const updateFilter = (key: keyof FilterState, value: string) => {
        setFiltersState(prev => ({ ...prev, [key]: value }));
        
        const params = { ...filtersState, [key]: value };
        Object.keys(params).forEach(k => {
            const key = k as keyof typeof params;
            if (!params[key] || params[key] === 'all') {
                delete params[key];
            }
        });
        
        router.get(route('fee-types.index'), params, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };

    const handleClearFilters = () => {
        setSearch('');
        setFiltersState({
            search: '',
            category: 'all',
            status: 'all'
        });
        
        router.get(route('fee-types.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClearSelection = () => {
        setSelectedFeeTypes([]);
        setIsSelectAll(false);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleViewPhoto = (feeType: FeeType) => {
        // Implement if needed
        toast.info('Feature to be implemented');
    };

    const hasActiveFilters = 
        search || 
        filtersState.category !== 'all' || 
        filtersState.status !== 'all';

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
                        filtersState={filtersState}
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
                        filtersState={filtersState}
                        isPerformingBulkAction={isPerformingBulkAction}
                        selectionMode={selectionMode}
                        selectionStats={selectionStats}
                        categories={categories}
                        getCategoryDetails={getCategoryDetails}
                        formatCurrency={formatCurrency}
                        formatDate={formatDate}
                    />

                    {/* Keyboard Shortcuts Help */}
                    {isBulkMode && !isMobile && (
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border">
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