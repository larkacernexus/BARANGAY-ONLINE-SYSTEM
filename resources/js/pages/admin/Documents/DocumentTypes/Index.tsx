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
import DocumentTypesHeader from '@/components/admin/document-types/DocumentTypesHeader';
import DocumentTypesStats from '@/components/admin/document-types/DocumentTypesStats';
import DocumentTypesFilters from '@/components/admin/document-types/DocumentTypesFilters';
import DocumentTypesContent from '@/components/admin/document-types/DocumentTypesContent';
import DocumentTypesDialogs from '@/components/admin/document-types/DocumentTypesDialogs';

// Import utils
import {
    formatDate,
    getFileSizeMB,
    formatFileFormats,
    getSelectionStats,
    filterDocumentTypes,
    formatForClipboard,
    safeNumber
} from '@/admin-utils/documentTypesUtils';

// Import types
import { 
    DocumentType, 
    BulkOperation, 
    BulkEditField, 
    SelectionMode, 
    FilterState, 
    SelectionStats, 
    PageProps,
    DocumentCategory
} from '@/types/admin/document-types/document-types';

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

export default function DocumentTypesIndex() {
    const { props } = usePage<PageProps>();
    const { 
        documentTypes = [], 
        filters = {}, 
        stats = null,
        categories = []
    } = props;
    
    // Safe defaults for optional props
    const safeDocumentTypes: DocumentType[] = Array.isArray(documentTypes) ? documentTypes : [];
    const safeFilters = filters || {};
    const safeStats = stats || {
        total: 0,
        active: 0,
        required: 0,
        optional: 0,
        max_file_size_mb: 0,
        has_formats: 0
    };
    const safeCategories: DocumentCategory[] = Array.isArray(categories) ? categories : [];
    
    // Filter states - client-side only
    const [search, setSearch] = useState<string>(getSafeString(safeFilters.search));
    const [statusFilter, setStatusFilter] = useState<string>(getSafeString(safeFilters.status, 'all'));
    const [categoryFilter, setCategoryFilter] = useState<string>(getSafeString(safeFilters.category, 'all'));
    const [requiredFilter, setRequiredFilter] = useState<string>(getSafeString(safeFilters.required, 'all'));
    const [sortBy, setSortBy] = useState<string>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    
    const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
    const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage] = useState<number>(15);
    
    // Bulk selection states
    const [selectedDocumentTypes, setSelectedDocumentTypes] = useState<number[]>([]);
    const [isBulkMode, setIsBulkMode] = useState<boolean>(false);
    const [isSelectAll, setIsSelectAll] = useState<boolean>(false);
    const [selectionMode, setSelectionMode] = useState<SelectionMode>('page');
    
    // Dialog states
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState<boolean>(false);
    const [showBulkActivateDialog, setShowBulkActivateDialog] = useState<boolean>(false);
    const [showBulkDeactivateDialog, setShowBulkDeactivateDialog] = useState<boolean>(false);
    const [showBulkRequiredDialog, setShowBulkRequiredDialog] = useState<boolean>(false);
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
    }, [search, statusFilter, categoryFilter, requiredFilter, sortBy, sortOrder]);

    // Reset selection when exiting bulk mode
    useEffect(() => {
        if (!isBulkMode) {
            setSelectedDocumentTypes([]);
            setIsSelectAll(false);
        }
    }, [isBulkMode]);

    // Filter document types client-side
    const filteredDocumentTypes = useMemo(() => {
        if (!safeDocumentTypes || safeDocumentTypes.length === 0) {
            return [];
        }
        
        let filtered = [...safeDocumentTypes];
        
        // Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(type =>
                type?.name?.toLowerCase().includes(searchLower) ||
                type?.code?.toLowerCase().includes(searchLower) ||
                type?.description?.toLowerCase().includes(searchLower)
            );
        }
        
        // Status filter
        if (statusFilter && statusFilter !== 'all') {
            filtered = filtered.filter(type => type?.is_active === (statusFilter === 'active'));
        }
        
        // Category filter
        if (categoryFilter && categoryFilter !== 'all') {
            filtered = filtered.filter(type => type?.document_category_id?.toString() === categoryFilter);
        }
        
        // Required filter
        if (requiredFilter && requiredFilter !== 'all') {
            filtered = filtered.filter(type => type?.is_required === (requiredFilter === 'yes'));
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
                    case 'category':
                        valueA = a?.category?.name || '';
                        valueB = b?.category?.name || '';
                        break;
                    case 'max_file_size':
                        valueA = a?.max_file_size || 0;
                        valueB = b?.max_file_size || 0;
                        break;
                    case 'sort_order':
                        valueA = a?.sort_order || 0;
                        valueB = b?.sort_order || 0;
                        break;
                    case 'status':
                        valueA = a?.is_active ? 1 : 0;
                        valueB = b?.is_active ? 1 : 0;
                        break;
                    case 'is_required':
                        valueA = a?.is_required ? 1 : 0;
                        valueB = b?.is_required ? 1 : 0;
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
    }, [safeDocumentTypes, search, statusFilter, categoryFilter, requiredFilter, sortBy, sortOrder]);

    // Category counts for filtered items
    const categoryCounts = useMemo(() => {
        const counts: Record<number, number> = {};
        safeCategories.forEach(category => {
            counts[category.id] = filteredDocumentTypes.filter(
                type => type.document_category_id === category.id
            ).length;
        });
        return counts;
    }, [filteredDocumentTypes, safeCategories]);

    // Calculate filtered stats
    const filteredStats = useMemo(() => {
        if (!filteredDocumentTypes || filteredDocumentTypes.length === 0) {
            return safeStats;
        }
        
        const active = filteredDocumentTypes.filter(t => t?.is_active).length;
        const required = filteredDocumentTypes.filter(t => t?.is_required).length;
        const optional = filteredDocumentTypes.filter(t => !t?.is_required).length;
        const has_formats = filteredDocumentTypes.filter(t => t?.accepted_formats && t.accepted_formats.length > 0).length;
        const max_file_size_mb = Math.max(...filteredDocumentTypes.map(t => t?.max_file_size || 0), 0);
        
        return {
            total: filteredDocumentTypes.length,
            active,
            required,
            optional,
            max_file_size_mb,
            has_formats
        };
    }, [filteredDocumentTypes, safeStats]);

    // Pagination
    const totalItems = filteredDocumentTypes.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedDocumentTypes = filteredDocumentTypes.slice(startIndex, endIndex);

    // Selection handlers
    const handleSelectAllOnPage = useCallback(() => {
        const pageIds = paginatedDocumentTypes.map(type => type.id);
        if (isSelectAll) {
            setSelectedDocumentTypes(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedDocumentTypes, ...pageIds])];
            setSelectedDocumentTypes(newSelected);
        }
        setIsSelectAll(!isSelectAll);
        setSelectionMode('page');
    }, [paginatedDocumentTypes, isSelectAll, selectedDocumentTypes]);

    const handleSelectAllFiltered = useCallback(() => {
        const allIds = filteredDocumentTypes.map(type => type.id);
        if (selectedDocumentTypes.length === allIds.length && allIds.every(id => selectedDocumentTypes.includes(id))) {
            setSelectedDocumentTypes(prev => prev.filter(id => !allIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedDocumentTypes, ...allIds])];
            setSelectedDocumentTypes(newSelected);
            setSelectionMode('filtered');
        }
    }, [filteredDocumentTypes, selectedDocumentTypes]);

    const handleSelectAll = useCallback(() => {
        if (confirm(`This will select ALL ${totalItems} document types. This action may take a moment.`)) {
            const allIds = filteredDocumentTypes.map(type => type.id);
            setSelectedDocumentTypes(allIds);
            setSelectionMode('all');
        }
    }, [filteredDocumentTypes, totalItems]);

    const handleItemSelect = useCallback((id: number) => {
        setSelectedDocumentTypes(prev => {
            if (prev.includes(id)) {
                return prev.filter(itemId => itemId !== id);
            } else {
                return [...prev, id];
            }
        });
    }, []);

    // Check if all items on current page are selected
    useEffect(() => {
        const allPageIds = paginatedDocumentTypes.map(type => type.id);
        const allSelected = allPageIds.length > 0 && allPageIds.every(id => selectedDocumentTypes.includes(id));
        setIsSelectAll(allSelected);
    }, [selectedDocumentTypes, paginatedDocumentTypes]);

    // Get selected document types data
    const selectedDocumentTypesData = useMemo(() => {
        return filteredDocumentTypes.filter(type => selectedDocumentTypes.includes(type.id));
    }, [selectedDocumentTypes, filteredDocumentTypes]);

    // Calculate selection stats
    const selectionStats = useMemo((): SelectionStats => {
        return getSelectionStats(selectedDocumentTypesData);
    }, [selectedDocumentTypesData]);

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
        if (selectedDocumentTypes.length === 0) {
            toast.error('Please select at least one document type');
            return;
        }

        setIsPerformingBulkAction(true);

        try {
            switch (operation) {
                case 'delete':
                    setShowBulkDeleteDialog(true);
                    break;

                case 'activate':
                    setShowBulkActivateDialog(true);
                    break;

                case 'deactivate':
                    setShowBulkDeactivateDialog(true);
                    break;

                case 'export':
                case 'export_csv':
                    const exportData = selectedDocumentTypesData.map(type => ({
                        'Name': type.name,
                        'Code': type.code,
                        'Category': type.category?.name || 'Uncategorized',
                        'Required': type.is_required ? 'Yes' : 'No',
                        'Status': type.is_active ? 'Active' : 'Inactive',
                        'Max File Size': `${getFileSizeMB(type.max_file_size)} MB`,
                        'Accepted Formats': formatFileFormats(type.accepted_formats),
                        'Sort Order': type.sort_order
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
                    a.download = `document-types-export-${new Date().toISOString().split('T')[0]}.csv`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                    
                    toast.success('Export completed successfully');
                    break;

                case 'duplicate':
                    if (confirm(`Duplicate ${selectedDocumentTypes.length} selected document type(s)?`)) {
                        await router.post(route('document-types.bulk-duplicate'), {
                            ids: selectedDocumentTypes
                        }, {
                            preserveScroll: true,
                            onSuccess: () => {
                                toast.success(`${selectedDocumentTypes.length} document type(s) duplicated successfully`);
                                setSelectedDocumentTypes([]);
                            },
                            onError: (errors) => {
                                toast.error('Failed to duplicate document types');
                            }
                        });
                    }
                    break;

                case 'update_required':
                    setShowBulkRequiredDialog(true);
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
        if (selectedDocumentTypesData.length === 0) {
            toast.error('No data to copy');
            return;
        }
        
        const data = selectedDocumentTypesData.map(type => ({
            'Name': type.name,
            'Code': type.code,
            'Category': type.category?.name || 'Uncategorized',
            'Required': type.is_required ? 'Yes' : 'No',
            'Status': type.is_active ? 'Active' : 'Inactive'
        }));
        
        const csv = [
            Object.keys(data[0]).join('\t'),
            ...data.map(row => Object.values(row).join('\t'))
        ].join('\n');
        
        navigator.clipboard.writeText(csv).then(() => {
            toast.success(`${selectedDocumentTypesData.length} records copied to clipboard`);
        }).catch(() => {
            toast.error('Failed to copy to clipboard');
        });
    }, [selectedDocumentTypesData]);

    // Individual document type operations
    const handleToggleStatus = useCallback((type: DocumentType) => {
        if (confirm(`Are you sure you want to ${type.is_active ? 'deactivate' : 'activate'} "${type.name}"?`)) {
            router.post(route('document-types.toggle-status', type.id), {}, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Document type ${type.is_active ? 'deactivated' : 'activated'} successfully`);
                },
                onError: () => {
                    toast.error('Failed to toggle status');
                },
            });
        }
    }, []);

    const handleDuplicate = useCallback((type: DocumentType) => {
        if (confirm(`Duplicate "${type.name}" document type?`)) {
            router.post(route('document-types.duplicate', type.id), {}, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Document type duplicated successfully');
                },
                onError: () => {
                    toast.error('Failed to duplicate document type');
                },
            });
        }
    }, []);

    const handleDelete = useCallback((type: DocumentType) => {
        if (confirm(`Are you sure you want to delete "${type.name}"? This action cannot be undone.`)) {
            router.delete(route('document-types.destroy', type.id));
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
        setStatusFilter('all');
        setCategoryFilter('all');
        setRequiredFilter('all');
        setSortBy('name');
        setSortOrder('asc');
        setCurrentPage(1);
    }, []);

    const handleClearSelection = useCallback(() => {
        setSelectedDocumentTypes([]);
        setIsSelectAll(false);
    }, []);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const updateFilter = useCallback((key: string, value: string) => {
        switch (key) {
            case 'status':
                setStatusFilter(value);
                break;
            case 'category':
                setCategoryFilter(value);
                break;
            case 'required':
                setRequiredFilter(value);
                break;
        }
    }, []);

    const hasActiveFilters = Boolean(
        search || 
        (statusFilter && statusFilter !== 'all') || 
        (categoryFilter && categoryFilter !== 'all') ||
        (requiredFilter && requiredFilter !== 'all')
    );

    // Create filters object for the Filters component
    const filtersStateForComponent: FilterState = {
        status: statusFilter,
        category: categoryFilter,
        required: requiredFilter,
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
                    if (selectedDocumentTypes.length > 0) {
                        setSelectedDocumentTypes([]);
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
            if (e.key === 'Delete' && isBulkMode && selectedDocumentTypes.length > 0) {
                e.preventDefault();
                setShowBulkDeleteDialog(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isBulkMode, selectedDocumentTypes, isMobile]);

    // Error boundary fallback
    if (!Array.isArray(safeDocumentTypes)) {
        return (
            <AppLayout
                title="Document Types"
                breadcrumbs={[
                    { title: 'Dashboard', href: '/dashboard' },
                    { title: 'Document Types', href: '/document-types' }
                ]}
            >
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="text-red-600 text-xl mb-2">Error Loading Document Types</div>
                        <p className="text-gray-600">Document types data is not in the expected format.</p>
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
            title="Document Types"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Document Types', href: '/document-types' }
            ]}
        >
            <TooltipProvider>
                <div className="space-y-6">
                    <DocumentTypesHeader 
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isMobile={isMobile}
                    />

                    <DocumentTypesStats 
                        stats={filteredStats}
                        categoryCounts={categoryCounts}
                        categories={safeCategories}
                    />

                    <DocumentTypesFilters
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
                        categories={safeCategories}
                    />

                    <DocumentTypesContent
                        documentTypes={paginatedDocumentTypes}
                        categories={safeCategories}
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isSelectAll={isSelectAll}
                        selectedDocumentTypes={selectedDocumentTypes}
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
                        onCopyToClipboard={handleCopyToClipboard}
                        onCopySelectedData={handleCopySelectedData}
                        onSort={handleSort}
                        onBulkOperation={handleBulkOperation}
                        setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                        setShowBulkRequiredDialog={setShowBulkRequiredDialog}
                        filtersState={filtersStateForComponent}
                        isPerformingBulkAction={isPerformingBulkAction}
                        selectionMode={selectionMode}
                        selectionStats={selectionStats}
                        getFileSizeMB={getFileSizeMB}
                        formatFileFormats={formatFileFormats}
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

            <DocumentTypesDialogs
                showBulkDeleteDialog={showBulkDeleteDialog}
                setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                showBulkActivateDialog={showBulkActivateDialog}
                setShowBulkActivateDialog={setShowBulkActivateDialog}
                showBulkDeactivateDialog={showBulkDeactivateDialog}
                setShowBulkDeactivateDialog={setShowBulkDeactivateDialog}
                showBulkRequiredDialog={showBulkRequiredDialog}
                setShowBulkRequiredDialog={setShowBulkRequiredDialog}
                isPerformingBulkAction={isPerformingBulkAction}
                bulkEditValue={bulkEditValue}
                setBulkEditValue={setBulkEditValue}
                bulkEditField={bulkEditField}
                setBulkEditField={setBulkEditField}
                selectedDocumentTypes={selectedDocumentTypes}
                handleBulkOperation={handleBulkOperation}
                selectionStats={selectionStats}
            />
        </AppLayout>
    );
}