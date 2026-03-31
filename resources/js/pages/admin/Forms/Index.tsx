// pages/admin/forms/index.tsx

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
    
    // State management - FIX: Handle min_size and max_size as numbers
    const [filtersState, setFiltersState] = useState<Filters>({
        category: safeFilters.category || 'all',
        agency: safeFilters.agency || 'all',
        status: safeFilters.status || 'all',
        from_date: safeFilters.from_date || '',
        to_date: safeFilters.to_date || '',
        sort_by: safeFilters.sort_by || 'created_at',
        sort_order: safeFilters.sort_order || 'desc',
        is_featured: safeFilters.is_featured !== undefined ? safeFilters.is_featured : 'all',
        file_type: safeFilters.file_type || 'all',
        min_size: typeof safeFilters.min_size === 'number' ? safeFilters.min_size : undefined,
        max_size: typeof safeFilters.max_size === 'number' ? safeFilters.max_size : undefined
    });
    const [search, setSearch] = useState(safeFilters.search || '');
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

    // Immediate search handler
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        
        const params: Record<string, any> = {
            ...filtersState,
            search: value
        };
        
        // Clean up empty values and convert to strings
        Object.keys(params).forEach(key => {
            const k = key as keyof typeof params;
            const val = params[k];
            if (val === undefined || val === null || val === '' || val === 'all') {
                delete params[k];
            } else {
                params[k] = String(val);
            }
        });
        
        router.get('/admin/forms', params, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };

    // Filter forms client-side
    const filteredForms = useMemo(() => {
        return formUtils.filterForms({
            forms: safeForms.data,
            search,
            filters: filtersState
        });
    }, [safeForms.data, search, filtersState]);

    // Pagination
    const totalItems = filteredForms.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedForms = filteredForms.slice(startIndex, endIndex);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, filtersState]);

    // Reset selection when exiting bulk mode
    useEffect(() => {
        if (!isBulkMode) {
            setSelectedForms([]);
            setIsSelectAll(false);
        }
    }, [isBulkMode]);

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
                    toast.info('Export functionality to be implemented');
                    break;

                case 'download':
                    toast.info('Bulk download functionality to be implemented');
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
    }, [selectedForms]);

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

    const handleSort = (column: string) => {
        const newSortOrder = filtersState.sort_by === column && filtersState.sort_order === 'asc' ? 'desc' : 'asc';
        setFiltersState(prev => ({
            ...prev,
            sort_by: column,
            sort_order: newSortOrder
        }));
        
        // Trigger server-side sort update
        const params: Record<string, any> = {
            ...filtersState,
            sort_by: column,
            sort_order: newSortOrder,
            search: search
        };
        
        // Clean up empty values and convert to strings
        Object.keys(params).forEach(key => {
            const k = key as keyof typeof params;
            const val = params[k];
            if (val === undefined || val === null || val === '' || val === 'all') {
                delete params[k];
            } else {
                params[k] = String(val);
            }
        });
        
        router.get('/admin/forms', params, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };

    const handleClearFilters = () => {
        setSearch('');
        setFiltersState({
            category: 'all',
            agency: 'all',
            status: 'all',
            from_date: '',
            to_date: '',
            sort_by: 'created_at',
            sort_order: 'desc',
            is_featured: 'all',
            file_type: 'all',
            min_size: undefined,
            max_size: undefined
        });
        
        // Trigger server-side filter clear
        router.get('/admin/forms', {
            search: '',
            category: 'all',
            agency: 'all',
            status: 'all',
            from_date: '',
            to_date: '',
            sort_by: 'created_at',
            sort_order: 'desc'
        }, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };

    const handleClearSelection = () => {
        setSelectedForms([]);
        setIsSelectAll(false);
    };

    const updateFilter = (key: keyof Filters, value: string) => {
        // For numeric fields, convert to number or undefined
        let finalValue: string | number | undefined = value;
        
        if (key === 'min_size' || key === 'max_size') {
            if (value === '' || value === 'all') {
                finalValue = undefined;
            } else {
                const numValue = Number(value);
                finalValue = isNaN(numValue) ? undefined : numValue;
            }
        }
        
        setFiltersState(prev => ({ ...prev, [key]: finalValue }));
        
        // Trigger server-side filter update
        const params: Record<string, any> = {
            ...filtersState,
            [key]: finalValue,
            search: search
        };
        
        // Clean up empty values and convert to strings
        Object.keys(params).forEach(key => {
            const k = key as keyof typeof params;
            const val = params[k];
            if (val === undefined || val === null || val === '' || val === 'all') {
                delete params[k];
            } else {
                params[k] = String(val);
            }
        });
        
        router.get('/admin/forms', params, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };

    const hasActiveFilters = Boolean(
        search || 
        filtersState.category !== 'all' || 
        filtersState.agency !== 'all' || 
        filtersState.status !== 'all' ||
        filtersState.from_date ||
        filtersState.to_date ||
        (filtersState.is_featured !== undefined && filtersState.is_featured !== 'all') ||
        (filtersState.file_type !== undefined && filtersState.file_type !== 'all') ||
        filtersState.min_size !== undefined ||
        filtersState.max_size !== undefined
    );

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
                    if (selectedForms.length > 0) {
                        setSelectedForms([]);
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
            if (e.key === 'Delete' && isBulkMode && selectedForms.length > 0) {
                e.preventDefault();
                setShowBulkDeleteDialog(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isBulkMode, selectedForms, isMobile]);

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

                    <FormsStats stats={safeStats} />

                    <FormsFilters
                        search={search}
                        setSearch={setSearch}
                        onSearchChange={handleSearchChange}
                        filtersState={filtersState}
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
                        searchInputRef={searchInputRef} isMobile={false}                    />

                    <FormsContent
                        forms={paginatedForms}
                        stats={safeStats}
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
                        filtersState={filtersState}
                        isPerformingBulkAction={isPerformingBulkAction}
                        selectionMode={selectionMode}
                        selectionStats={selectionStats}
                        categories={safeCategories}
                        agencies={safeAgencies}
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