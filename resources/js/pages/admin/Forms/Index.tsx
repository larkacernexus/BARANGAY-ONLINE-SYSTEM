import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import AppLayout from '@/layouts/admin-app-layout';
import { 
    Form, 
    Filters, 
    Stats, 
    PaginationData, 
    BulkOperation, 
    SelectionMode,
    SelectionStats
} from '@/types/admin/forms/forms.types';
import { formUtils } from '@/admin-utils/form-utils'; 
import { TooltipProvider } from '@/components/ui/tooltip';

// Import reusable components
import FormsHeader from '@/components/admin/forms/FormsHeader';
import FormsStats from '@/components/admin/forms/FormsStats';
import FormsFilters from '@/components/admin/forms/FormsFilters';
import FormsContent from '@/components/admin/forms/FormsContent';
import FormsDialogs from '@/components/admin/forms/FormsDialogs';
import { Button } from '@/components/ui/button';
import { KeyRound } from 'lucide-react';

interface FormsPageProps {
    forms?: PaginationData;
    filters?: Filters;
    categories?: string[];
    agencies?: string[];
    stats?: Stats;
}

const defaultPaginationData: PaginationData = {
    current_page: 1,
    data: [],
    from: 0,
    last_page: 1,
    per_page: 15,
    to: 0,
    total: 0
};

const defaultStats: Stats = {
    total: 0,
    active: 0,
    downloads: 0,
    categories_count: 0,
    agencies_count: 0
};

export default function FormsIndex({ 
    forms, 
    filters, 
    categories, 
    agencies, 
    stats 
}: FormsPageProps) {
    const { flash } = usePage().props as any;
    
    // Safe destructuring with defaults
    const safeForms = forms || defaultPaginationData;
    const safeFilters = filters || {};
    const safeCategories = categories || [];
    const safeAgencies = agencies || [];
    const safeStats = stats || defaultStats;
    const allForms = safeForms.data || [];
    
    // Filter states - client-side only (removed sort from filters, kept for table sorting)
    const [search, setSearch] = useState(safeFilters.search || '');
    const [categoryFilter, setCategoryFilter] = useState<string>(safeFilters.category || 'all');
    const [agencyFilter, setAgencyFilter] = useState<string>(safeFilters.agency || 'all');
    const [statusFilter, setStatusFilter] = useState<string>(safeFilters.status || 'all');
    const [featuredFilter, setFeaturedFilter] = useState<string>('all');
    const [fileTypeFilter, setFileTypeFilter] = useState<string>('');
    const [fromDate, setFromDate] = useState<string>(safeFilters.from_date || '');
    const [toDate, setToDate] = useState<string>(safeFilters.to_date || '');
    const [minSize, setMinSize] = useState<string>('');
    const [maxSize, setMaxSize] = useState<string>('');
    
    // Sorting is now handled by table header only
    const [sortBy, setSortBy] = useState<string>('created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(15);
    
    // Bulk selection states
    const [selectedForms, setSelectedForms] = useState<number[]>([]);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [isSelectAll, setIsSelectAll] = useState(false);
    const [selectionMode, setSelectionMode] = useState<SelectionMode>('page');
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
    const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

    const searchInputRef = useRef<HTMLInputElement>(null);

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
    }, [search, categoryFilter, agencyFilter, statusFilter, featuredFilter, fileTypeFilter, fromDate, toDate, minSize, maxSize, sortBy, sortOrder]);

    // Reset selection when exiting bulk mode
    useEffect(() => {
        if (!isBulkMode) {
            setSelectedForms([]);
            setIsSelectAll(false);
        }
    }, [isBulkMode]);

    // Helper function to check file type
    const checkFileType = (filePath: string | null, typeFilter: string): boolean => {
        if (!typeFilter) return true;
        if (!filePath) return false;
        const extension = filePath.split('.').pop()?.toLowerCase() || '';
        
        // Handle group filtering
        if (typeFilter === 'pdf') return extension === 'pdf';
        if (typeFilter === 'doc') return extension === 'doc' || extension === 'docx';
        if (typeFilter === 'xls') return extension === 'xls' || extension === 'xlsx';
        if (typeFilter === 'jpg') return extension === 'jpg' || extension === 'jpeg' || extension === 'png' || extension === 'gif';
        return extension === typeFilter;
    };

    // Filter forms client-side
    const filteredForms = useMemo(() => {
        let filtered = [...allForms];
        
        // Apply search filter
        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(form =>
                form.title?.toLowerCase().includes(searchLower) ||
                form.description?.toLowerCase().includes(searchLower) ||
                form.category?.toLowerCase().includes(searchLower) ||
                form.issuing_agency?.toLowerCase().includes(searchLower)
            );
        }
        
        // Apply category filter
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(form => form.category === categoryFilter);
        }
        
        // Apply agency filter
        if (agencyFilter !== 'all') {
            filtered = filtered.filter(form => form.issuing_agency === agencyFilter);
        }
        
        // Apply status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(form => form.is_active === (statusFilter === 'active'));
        }
        
        // Apply featured filter
        if (featuredFilter !== 'all') {
            filtered = filtered.filter(form => form.is_featured === (featuredFilter === 'yes'));
        }
        
        // Apply file type filter
        if (fileTypeFilter) {
            filtered = filtered.filter(form => checkFileType(form.file_path, fileTypeFilter));
        }
        
        // Apply date filters
        if (fromDate) {
            filtered = filtered.filter(form => form.created_at >= fromDate);
        }
        if (toDate) {
            filtered = filtered.filter(form => form.created_at <= toDate);
        }
        
        // Apply file size filters
        if (minSize) {
            const min = parseFloat(minSize) * 1024 * 1024; // Convert MB to bytes
            filtered = filtered.filter(form => (form.file_size || 0) >= min);
        }
        if (maxSize) {
            const max = parseFloat(maxSize) * 1024 * 1024; // Convert MB to bytes
            filtered = filtered.filter(form => (form.file_size || 0) <= max);
        }
        
        // Apply sorting (for table header)
        filtered.sort((a, b) => {
            let valueA: any;
            let valueB: any;
            
            switch (sortBy) {
                case 'title':
                    valueA = a.title || '';
                    valueB = b.title || '';
                    break;
                case 'category':
                    valueA = a.category || '';
                    valueB = b.category || '';
                    break;
                case 'issuing_agency':
                    valueA = a.issuing_agency || '';
                    valueB = b.issuing_agency || '';
                    break;
                case 'download_count':
                    valueA = a.download_count || 0;
                    valueB = b.download_count || 0;
                    break;
                case 'file_size':
                    valueA = a.file_size || 0;
                    valueB = b.file_size || 0;
                    break;
                case 'status':
                    valueA = a.is_active ? 1 : 0;
                    valueB = b.is_active ? 1 : 0;
                    break;
                case 'is_featured':
                    valueA = a.is_featured ? 1 : 0;
                    valueB = b.is_featured ? 1 : 0;
                    break;
                case 'created_at':
                    valueA = new Date(a.created_at).getTime();
                    valueB = new Date(b.created_at).getTime();
                    break;
                default:
                    valueA = new Date(a.created_at).getTime();
                    valueB = new Date(b.created_at).getTime();
            }
            
            if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
            if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
        
        return filtered;
    }, [allForms, search, categoryFilter, agencyFilter, statusFilter, featuredFilter, fileTypeFilter, fromDate, toDate, minSize, maxSize, sortBy, sortOrder]);

    // Calculate filtered stats
    const filteredStats = useMemo(() => {
        const activeCount = filteredForms.filter(f => f.is_active).length;
        const totalDownloads = filteredForms.reduce((sum, f) => sum + (f.download_count || 0), 0);
        const featuredCount = filteredForms.filter(f => f.is_featured).length;
        const uniqueCategories = new Set(filteredForms.map(f => f.category)).size;
        const uniqueAgencies = new Set(filteredForms.map(f => f.issuing_agency)).size;
        const totalFileSize = filteredForms.reduce((sum, f) => sum + (f.file_size || 0), 0);
        
        return {
            total: filteredForms.length,
            active: activeCount,
            downloads: totalDownloads,
            categories_count: uniqueCategories,
            agencies_count: uniqueAgencies,
            featured_count: featuredCount,
            total_file_size: totalFileSize
        };
    }, [filteredForms]);

    // Pagination
    const totalItems = filteredForms.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedForms = filteredForms.slice(startIndex, endIndex);

    // Selection handlers
    const handleSelectAllOnPage = () => {
        const pageIds = paginatedForms.map(form => form.id);
        if (isSelectAll) {
            setSelectedForms(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedForms, ...pageIds])];
            setSelectedForms(newSelected);
        }
        setIsSelectAll(!isSelectAll);
        setSelectionMode('page');
    };

    const handleSelectAllFiltered = () => {
        const allIds = filteredForms.map(form => form.id);
        if (selectedForms.length === allIds.length && allIds.every(id => selectedForms.includes(id))) {
            setSelectedForms(prev => prev.filter(id => !allIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedForms, ...allIds])];
            setSelectedForms(newSelected);
            setSelectionMode('filtered');
        }
    };

    const handleSelectAll = () => {
        if (confirm(`This will select ALL ${safeForms.total || 0} forms. This action may take a moment.`)) {
            const allIds = filteredForms.map(form => form.id);
            setSelectedForms(allIds);
            setSelectionMode('all');
        }
    };

    const handleItemSelect = (id: number) => {
        setSelectedForms(prev => {
            if (prev.includes(id)) {
                return prev.filter(itemId => itemId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    // Check if all items on current page are selected
    useEffect(() => {
        const allPageIds = paginatedForms.map(form => form.id);
        const allSelected = allPageIds.length > 0 && allPageIds.every(id => selectedForms.includes(id));
        setIsSelectAll(allSelected);
    }, [selectedForms, paginatedForms]);

    // Get selected forms data
    const selectedFormsData = useMemo(() => {
        return filteredForms.filter(form => selectedForms.includes(form.id));
    }, [selectedForms, filteredForms]);

    // Calculate selection stats
    const selectionStats = useMemo((): SelectionStats => {
        return formUtils.getSelectionStats(selectedFormsData);
    }, [selectedFormsData]);

    // Handle sort change from table header
    const handleSortChange = (value: string) => {
        const [newSortBy, newSortOrder] = value.split('-');
        setSortBy(newSortBy);
        setSortOrder(newSortOrder as 'asc' | 'desc');
    };

    // Get current sort value for dropdown
    const getCurrentSortValue = (): string => {
        return `${sortBy}-${sortOrder}`;
    };

    // Handle sort from column click
    const handleSort = (column: string) => {
        const newSortOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortBy(column);
        setSortOrder(newSortOrder);
    };

    // Bulk operations
    const handleBulkOperation = useCallback(async (operation: BulkOperation) => {
        if (selectedForms.length === 0) {
            toast.error('Please select at least one form');
            return;
        }

        setIsPerformingBulkAction(true);

        try {
            switch (operation) {
                case 'delete':
                    if (confirm(`Are you sure you want to delete ${selectedForms.length} selected form(s)?`)) {
                        await router.post('/admin/forms/bulk-action', {
                            action: 'delete',
                            form_ids: selectedForms,
                        }, {
                            preserveScroll: true,
                            onSuccess: () => {
                                setSelectedForms([]);
                                setShowBulkDeleteDialog(false);
                                toast.success('Forms deleted successfully');
                            },
                            onError: () => {
                                toast.error('Failed to delete forms');
                            }
                        });
                    }
                    break;

                case 'activate':
                    await router.post('/admin/forms/bulk-action', {
                        action: 'activate',
                        form_ids: selectedForms,
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            setSelectedForms([]);
                            toast.success('Forms activated successfully');
                        },
                        onError: () => {
                            toast.error('Failed to activate forms');
                        }
                    });
                    break;

                case 'deactivate':
                    await router.post('/admin/forms/bulk-action', {
                        action: 'deactivate',
                        form_ids: selectedForms,
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            setSelectedForms([]);
                            toast.success('Forms deactivated successfully');
                        },
                        onError: () => {
                            toast.error('Failed to deactivate forms');
                        }
                    });
                    break;

                case 'export':
                case 'export_csv':
                    const exportData = selectedFormsData.map(form => ({
                        'Title': form.title || 'N/A',
                        'Category': form.category || 'N/A',
                        'Agency': form.issuing_agency || 'N/A',
                        'Downloads': form.download_count || 0,
                        'File Size': formUtils.formatFileSize(form.file_size),
                        'Status': form.is_active ? 'Active' : 'Inactive',
                        'Featured': form.is_featured ? 'Yes' : 'No',
                        'Created': formUtils.formatDate(form.created_at),
                    }));
                    
                    const headers = Object.keys(exportData[0]);
                    const csv = [
                        headers.join(','),
                        ...exportData.map(row => 
                            headers.map(header => {
                                const value = row[header as keyof typeof row];
                                return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
                            }).join(',')
                        )
                    ].join('\n');
                    
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `forms-export-${new Date().toISOString().split('T')[0]}.csv`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                    
                    toast.success(`${selectedForms.length} forms exported`);
                    break;

                case 'download':
                    selectedForms.forEach(id => {
                        window.open(`/admin/forms/${id}/download`, '_blank');
                    });
                    toast.success(`${selectedForms.length} form(s) opened for download`);
                    break;

                case 'change_status':
                case 'change_category':
                    toast.info('Bulk update functionality to be implemented');
                    break;
            }
        } catch (error) {
            console.error('Bulk operation error:', error);
            toast.error('An error occurred during the bulk operation.');
        } finally {
            setIsPerformingBulkAction(false);
        }
    }, [selectedForms, selectedFormsData]);

    // Copy selected data to clipboard
    const handleCopySelectedData = () => {
        if (selectedFormsData.length === 0) {
            toast.error('No data to copy');
            return;
        }
        
        const data = selectedFormsData.map(form => ({
            'Title': form.title || 'N/A',
            'Category': form.category || 'N/A',
            'Agency': form.issuing_agency || 'N/A',
            'Downloads': form.download_count || 0,
            'File Size': formUtils.formatFileSize(form.file_size),
            'Status': form.is_active ? 'Active' : 'Inactive',
            'Featured': form.is_featured ? 'Yes' : 'No',
            'Created': formUtils.formatDate(form.created_at),
        }));
        
        const headers = Object.keys(data[0]);
        const csv = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => {
                    const value = row[header as keyof typeof row];
                    return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
                }).join(',')
            )
        ].join('\n');
        
        navigator.clipboard.writeText(csv).then(() => {
            toast.success('Data copied to clipboard');
        }).catch(() => {
            toast.error('Failed to copy to clipboard');
        });
    };

    // Individual form operations
    const handleDelete = (form: Form) => {
        if (confirm(`Are you sure you want to delete form "${form.title || 'Untitled'}"?`)) {
            router.delete(`/admin/forms/${form.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedForms(selectedForms.filter(id => id !== form.id));
                    toast.success('Form deleted successfully');
                },
                onError: () => {
                    toast.error('Failed to delete form');
                }
            });
        }
    };

    const handleToggleStatus = (form: Form) => {
        router.post(`/admin/forms/${form.id}/toggle-status`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Form status updated');
            },
            onError: () => {
                toast.error('Failed to update form status');
            }
        });
    };

    const handleDownload = (form: Form) => {
        window.open(`/admin/forms/${form.id}/download`, '_blank');
    };

    const handleClearFilters = () => {
        setSearch('');
        setCategoryFilter('all');
        setAgencyFilter('all');
        setStatusFilter('all');
        setFeaturedFilter('all');
        setFileTypeFilter('');
        setFromDate('');
        setToDate('');
        setMinSize('');
        setMaxSize('');
        setSortBy('created_at');
        setSortOrder('desc');
        setCurrentPage(1);
    };

    const handleClearSelection = () => {
        setSelectedForms([]);
        setIsSelectAll(false);
    };

    const updateFilter = (key: string, value: string) => {
        switch (key) {
            case 'category':
                setCategoryFilter(value);
                break;
            case 'agency':
                setAgencyFilter(value);
                break;
            case 'status':
                setStatusFilter(value);
                break;
            case 'from_date':
                setFromDate(value);
                break;
            case 'to_date':
                setToDate(value);
                break;
        }
    };

    const hasActiveFilters = Boolean(
        search || 
        categoryFilter !== 'all' || 
        agencyFilter !== 'all' || 
        statusFilter !== 'all' ||
        featuredFilter !== 'all' ||
        fileTypeFilter ||
        fromDate ||
        toDate ||
        minSize ||
        maxSize
    );

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
                    if (selectedForms.length > 0) {
                        setSelectedForms([]);
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
            if (e.key === 'Delete' && isBulkMode && selectedForms.length > 0) {
                e.preventDefault();
                setShowBulkDeleteDialog(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isBulkMode, selectedForms, isMobile]);

    // Create filters object for the Filters component
    const filtersStateForComponent = {
        category: categoryFilter,
        agency: agencyFilter,
        status: statusFilter,
        from_date: fromDate,
        to_date: toDate
    };

    return (
        <AppLayout
            title="Forms Management"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Forms', href: '/forms' }
            ]}
        >
            <TooltipProvider>
                <div className="space-y-6">
                    <FormsHeader 
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isMobile={isMobile}
                    />

                    <FormsStats stats={filteredStats} />

                    <FormsFilters
                        search={search}
                        setSearch={setSearch}
                        onSearchChange={(e) => setSearch(e.target.value)}
                        filtersState={filtersStateForComponent}
                        updateFilter={updateFilter}
                        showAdvancedFilters={showAdvancedFilters}
                        setShowAdvancedFilters={setShowAdvancedFilters}
                        handleClearFilters={handleClearFilters}
                        hasActiveFilters={hasActiveFilters}
                        categories={safeCategories}
                        agencies={safeAgencies}
                        startIndex={startIndex}
                        endIndex={endIndex}
                        totalItems={totalItems}
                        searchInputRef={searchInputRef}
                        isMobile={isMobile}
                        isLoading={isPerformingBulkAction}
                        handleExport={() => handleBulkOperation('export')}
                        featuredFilter={featuredFilter}
                        setFeaturedFilter={setFeaturedFilter}
                        fileTypeFilter={fileTypeFilter}
                        setFileTypeFilter={setFileTypeFilter}
                        minSize={minSize}
                        setMinSize={setMinSize}
                        maxSize={maxSize}
                        setMaxSize={setMaxSize}
                    />

                    <FormsContent
                        forms={paginatedForms}
                        stats={filteredStats}
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isSelectAll={isSelectAll}
                        selectedForms={selectedForms}
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
                        onDownload={handleDownload}
                        onSort={handleSort}
                        onCopySelectedData={handleCopySelectedData}
                        onBulkOperation={handleBulkOperation}
                        setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                        filtersState={filtersStateForComponent}
                        isPerformingBulkAction={isPerformingBulkAction}
                        selectionMode={selectionMode}
                        selectionStats={selectionStats}
                        categories={safeCategories}
                        agencies={safeAgencies}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSortChange={handleSortChange}
                        getCurrentSortValue={getCurrentSortValue}
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
                            </div>
                        </div>
                    )}
                </div>
            </TooltipProvider>

            <FormsDialogs
                showBulkDeleteDialog={showBulkDeleteDialog}
                setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                isPerformingBulkAction={isPerformingBulkAction}
                selectedForms={selectedForms}
                handleBulkOperation={handleBulkOperation}
                selectionStats={selectionStats}
            />
        </AppLayout>
    );
}