import { router, usePage } from '@inertiajs/react';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import AppLayout from '@/layouts/admin-app-layout';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { KeyRound } from 'lucide-react';
import { route } from 'ziggy-js';

// Import reusable components
import ReportTypesHeader from '@/components/admin/report-types/ReportTypesHeader';
import ReportTypesStats from '@/components/admin/report-types/ReportTypesStats';
import ReportTypesFilters from '@/components/admin/report-types/ReportTypesFilters';
import ReportTypesContent from '@/components/admin/report-types/ReportTypesContent';
import ReportTypesDialogs from '@/components/admin/report-types/ReportTypesDialogs';

// Import utils
import {
    formatDate,
    getPriorityDetails,
    getPriorityLabel,
    getSelectionStats,
} from '@/admin-utils/reportTypesUtils';

// Import types (no PageProps from here - we define it locally)
import { 
    ReportType, 
    BulkOperation, 
    BulkEditField, 
    SelectionMode, 
    SelectionStats 
} from '@/types/admin/report-types/report-types';

// ============================================
// LOCAL PAGE PROPS INTERFACE
// ============================================
// Defined locally to avoid conflicts with any global PageProps definitions
interface ReportTypesPageProps {
    [key: string]: unknown; // Add index signature to satisfy PageProps constraint
    reportTypes: ReportType[] | null;
    filters: {
        search?: string;
        status?: string;
        priority?: string;
        requires_action?: string;
    } | null;
    stats: {
        total: number;
        active: number;
        requires_immediate_action: number;
        allows_anonymous: number;
        requires_evidence: number;
        critical: number;
        high: number;
        medium: number;
        low: number;
    } | null;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

const getSafeString = (value: any, defaultValue: string = ''): string => {
    if (value === null || value === undefined) return defaultValue;
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    return defaultValue;
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function ReportTypesIndex() {
    const { props } = usePage<ReportTypesPageProps>();
    const { reportTypes = [], filters = {}, stats = null } = props;
    
    // Safe defaults for optional props
    const safeReportTypes = Array.isArray(reportTypes) ? reportTypes : [];
    const safeFilters = filters || {};
    const safeStats = stats || {
        total: 0,
        active: 0,
        requires_immediate_action: 0,
        allows_anonymous: 0,
        requires_evidence: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
    };
    
    // ============================================
    // STATE
    // ============================================
    
    // Filter states - client-side only
    const [search, setSearch] = useState<string>(getSafeString(safeFilters.search));
    const [statusFilter, setStatusFilter] = useState<string>(getSafeString(safeFilters.status, 'all'));
    const [priorityFilter, setPriorityFilter] = useState<string>(getSafeString(safeFilters.priority, 'all'));
    const [requiresActionFilter, setRequiresActionFilter] = useState<string>(getSafeString(safeFilters.requires_action, 'all'));
    const [sortBy, setSortBy] = useState<string>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    
    const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
    const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage] = useState<number>(15);
    
    // Bulk selection states
    const [selectedReportTypes, setSelectedReportTypes] = useState<number[]>([]);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [isSelectAll, setIsSelectAll] = useState(false);
    const [selectionMode, setSelectionMode] = useState<SelectionMode>('page');
    
    // Dialog states
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
    const [showBulkActivateDialog, setShowBulkActivateDialog] = useState(false);
    const [showBulkDeactivateDialog, setShowBulkDeactivateDialog] = useState(false);
    const [showBulkPriorityDialog, setShowBulkPriorityDialog] = useState(false);
    const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false);
    const [bulkEditValue, setBulkEditValue] = useState<string>('');
    const [bulkEditField, setBulkEditField] = useState<BulkEditField>('status');

    const searchInputRef = useRef<HTMLInputElement>(null);

    // ============================================
    // EFFECTS
    // ============================================

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
    }, [search, statusFilter, priorityFilter, requiresActionFilter, sortBy, sortOrder]);

    // Reset selection when exiting bulk mode
    useEffect(() => {
        if (!isBulkMode) {
            setSelectedReportTypes([]);
            setIsSelectAll(false);
        }
    }, [isBulkMode]);

    // ============================================
    // COMPUTED VALUES
    // ============================================

    // Filter report types client-side
    const filteredReportTypes = useMemo(() => {
        if (!safeReportTypes || safeReportTypes.length === 0) {
            return [];
        }
        
        let filtered = [...safeReportTypes];
        
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
        
        // Priority filter
        if (priorityFilter && priorityFilter !== 'all') {
            const priorityMap: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
            const targetLevel = priorityMap[priorityFilter];
            if (targetLevel) {
                filtered = filtered.filter(type => type?.priority_level === targetLevel);
            }
        }
        
        // Requires action filter
        if (requiresActionFilter && requiresActionFilter !== 'all') {
            filtered = filtered.filter(type => type?.requires_immediate_action === (requiresActionFilter === 'yes'));
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
                    case 'priority':
                        valueA = a?.priority_level || 0;
                        valueB = b?.priority_level || 0;
                        break;
                    case 'resolution_days':
                        valueA = a?.resolution_days || 0;
                        valueB = b?.resolution_days || 0;
                        break;
                    case 'status':
                        valueA = a?.is_active ? 1 : 0;
                        valueB = b?.is_active ? 1 : 0;
                        break;
                    case 'requires_immediate_action':
                        valueA = a?.requires_immediate_action ? 1 : 0;
                        valueB = b?.requires_immediate_action ? 1 : 0;
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
    }, [safeReportTypes, search, statusFilter, priorityFilter, requiresActionFilter, sortBy, sortOrder]);

    // Priority counts for filtered items
    const priorityCounts = useMemo(() => {
        const counts = { critical: 0, high: 0, medium: 0, low: 0 };
        filteredReportTypes.forEach(type => {
            const priority = getPriorityLabel(type.priority_level);
            if (priority === 'Critical') counts.critical++;
            else if (priority === 'High') counts.high++;
            else if (priority === 'Medium') counts.medium++;
            else if (priority === 'Low') counts.low++;
        });
        return counts;
    }, [filteredReportTypes]);

    // Calculate filtered stats
    const filteredStats = useMemo(() => {
        if (!filteredReportTypes || filteredReportTypes.length === 0) {
            return safeStats;
        }
        
        const active = filteredReportTypes.filter(t => t?.is_active).length;
        const requires_immediate_action = filteredReportTypes.filter(t => t?.requires_immediate_action).length;
        const allows_anonymous = filteredReportTypes.filter(t => t?.allows_anonymous).length;
        const requires_evidence = filteredReportTypes.filter(t => t?.requires_evidence).length;
        
        return {
            total: filteredReportTypes.length,
            active,
            requires_immediate_action,
            allows_anonymous,
            requires_evidence,
            critical: priorityCounts.critical,
            high: priorityCounts.high,
            medium: priorityCounts.medium,
            low: priorityCounts.low
        };
    }, [filteredReportTypes, safeStats, priorityCounts]);

    // Pagination
    const totalItems = filteredReportTypes.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedReportTypes = filteredReportTypes.slice(startIndex, endIndex);

    // Get selected report types data
    const selectedReportTypesData = useMemo(() => {
        return filteredReportTypes.filter(type => selectedReportTypes.includes(type.id));
    }, [selectedReportTypes, filteredReportTypes]);

    // Calculate selection stats
    const selectionStats = useMemo(() => {
        return getSelectionStats(selectedReportTypesData);
    }, [selectedReportTypesData]);

    const hasActiveFilters = Boolean(
        search || 
        (statusFilter && statusFilter !== 'all') || 
        (priorityFilter && priorityFilter !== 'all') ||
        (requiresActionFilter && requiresActionFilter !== 'all')
    );

    // Create filters object for the Filters component
    const filtersStateForComponent = {
        search: search,
        status: statusFilter,
        priority: priorityFilter,
        requires_action: requiresActionFilter
    };

    // ============================================
    // HANDLERS
    // ============================================

    // Selection handlers
    const handleSelectAllOnPage = useCallback(() => {
        const pageIds = paginatedReportTypes.map(type => type.id);
        if (isSelectAll) {
            setSelectedReportTypes(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedReportTypes, ...pageIds])];
            setSelectedReportTypes(newSelected);
        }
        setIsSelectAll(!isSelectAll);
        setSelectionMode('page');
    }, [paginatedReportTypes, isSelectAll, selectedReportTypes]);

    const handleSelectAllFiltered = useCallback(() => {
        const allIds = filteredReportTypes.map(type => type.id);
        if (selectedReportTypes.length === allIds.length && allIds.every(id => selectedReportTypes.includes(id))) {
            setSelectedReportTypes(prev => prev.filter(id => !allIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedReportTypes, ...allIds])];
            setSelectedReportTypes(newSelected);
            setSelectionMode('filtered');
        }
    }, [filteredReportTypes, selectedReportTypes]);

    const handleSelectAll = useCallback(() => {
        if (confirm(`This will select ALL ${totalItems} report types. This action may take a moment.`)) {
            const allIds = filteredReportTypes.map(type => type.id);
            setSelectedReportTypes(allIds);
            setSelectionMode('all');
        }
    }, [filteredReportTypes, totalItems]);

    const handleItemSelect = useCallback((id: number) => {
        setSelectedReportTypes(prev => {
            if (prev.includes(id)) {
                return prev.filter(itemId => itemId !== id);
            } else {
                return [...prev, id];
            }
        });
    }, []);

    // Check if all items on current page are selected
    useEffect(() => {
        const allPageIds = paginatedReportTypes.map(type => type.id);
        const allSelected = allPageIds.length > 0 && allPageIds.every(id => selectedReportTypes.includes(id));
        setIsSelectAll(allSelected);
    }, [selectedReportTypes, paginatedReportTypes]);

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
        if (selectedReportTypes.length === 0) {
            toast.error('Please select at least one report type');
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
                    const exportData = selectedReportTypesData.map(type => ({
                        'Name': type.name,
                        'Code': type.code,
                        'Priority': getPriorityLabel(type.priority_level),
                        'Resolution Days': type.resolution_days,
                        'Status': type.is_active ? 'Active' : 'Inactive',
                        'Requires Immediate Action': type.requires_immediate_action ? 'Yes' : 'No',
                        'Requires Evidence': type.requires_evidence ? 'Yes' : 'No',
                        'Allows Anonymous': type.allows_anonymous ? 'Yes' : 'No'
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
                    a.download = `report-types-export-${new Date().toISOString().split('T')[0]}.csv`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                    
                    toast.success('Export completed successfully');
                    break;

                case 'duplicate':
                    if (confirm(`Duplicate ${selectedReportTypes.length} selected report type(s)?`)) {
                        await router.post(route('report-types.bulk-duplicate'), {
                            ids: selectedReportTypes
                        }, {
                            preserveScroll: true,
                            onSuccess: () => {
                                toast.success(`${selectedReportTypes.length} report type(s) duplicated successfully`);
                                setSelectedReportTypes([]);
                            },
                            onError: () => {
                                toast.error('Failed to duplicate report types');
                            }
                        });
                    }
                    break;

                case 'update_priority':
                    setShowBulkPriorityDialog(true);
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
        if (selectedReportTypesData.length === 0) {
            toast.error('No data to copy');
            return;
        }
        
        const data = selectedReportTypesData.map(type => ({
            'Name': type.name,
            'Code': type.code,
            'Priority': getPriorityLabel(type.priority_level),
            'Resolution Days': type.resolution_days,
            'Status': type.is_active ? 'Active' : 'Inactive'
        }));
        
        const csv = [
            Object.keys(data[0]).join('\t'),
            ...data.map(row => Object.values(row).join('\t'))
        ].join('\n');
        
        navigator.clipboard.writeText(csv).then(() => {
            toast.success(`${selectedReportTypesData.length} records copied to clipboard`);
        }).catch(() => {
            toast.error('Failed to copy to clipboard');
        });
    }, [selectedReportTypesData]);

    // Individual report type operations
    const handleToggleStatus = useCallback((type: ReportType) => {
        if (confirm(`Are you sure you want to ${type.is_active ? 'deactivate' : 'activate'} "${type.name}"?`)) {
            router.post(route('report-types.toggle-status', type.id), {}, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Report type ${type.is_active ? 'deactivated' : 'activated'} successfully`);
                },
                onError: () => {
                    toast.error('Failed to toggle status');
                },
            });
        }
    }, []);

    const handleDuplicate = useCallback((type: ReportType) => {
        if (confirm(`Duplicate "${type.name}" report type?`)) {
            router.post(route('report-types.duplicate', type.id), {}, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Report type duplicated successfully');
                },
                onError: () => {
                    toast.error('Failed to duplicate report type');
                },
            });
        }
    }, []);

    const handleDelete = useCallback((type: ReportType) => {
        if (confirm(`Are you sure you want to delete "${type.name}"? This action cannot be undone.`)) {
            router.delete(route('report-types.destroy', type.id));
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
        setPriorityFilter('all');
        setRequiresActionFilter('all');
        setSortBy('name');
        setSortOrder('asc');
        setCurrentPage(1);
    }, []);

    const handleClearSelection = useCallback(() => {
        setSelectedReportTypes([]);
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
            case 'status':
                setStatusFilter(value);
                break;
            case 'priority':
                setPriorityFilter(value);
                break;
            case 'requires_action':
                setRequiresActionFilter(value);
                break;
        }
    }, []);

    // ============================================
    // KEYBOARD SHORTCUTS
    // ============================================

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
                    if (selectedReportTypes.length > 0) {
                        setSelectedReportTypes([]);
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
            if (e.key === 'Delete' && isBulkMode && selectedReportTypes.length > 0) {
                e.preventDefault();
                setShowBulkDeleteDialog(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isBulkMode, selectedReportTypes, isMobile, handleSelectAllFiltered, handleSelectAllOnPage]);

    // ============================================
    // ERROR BOUNDARY FALLBACK
    // ============================================

    if (!Array.isArray(safeReportTypes)) {
        return (
            <AppLayout
                title="Report Types"
                breadcrumbs={[
                    { title: 'Dashboard', href: '/admin/dashboard' },
                    { title: 'Report Types', href: '/admin/report-types' }
                ]}
            >
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="text-red-600 text-xl mb-2">Error Loading Report Types</div>
                        <p className="text-gray-600">Report types data is not in the expected format.</p>
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

    // ============================================
    // RENDER
    // ============================================

    return (
        <AppLayout
            title="Report Types"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Report Types', href: '/admin/report-types' }
            ]}
        >
            <TooltipProvider>
                <div className="space-y-6">
                    <ReportTypesHeader 
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isMobile={isMobile}
                    />

                    <ReportTypesStats 
                        stats={filteredStats}
                        priorityCounts={priorityCounts}
                    />

                    <ReportTypesFilters
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
                    />

                    <ReportTypesContent
                        reportTypes={paginatedReportTypes}
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isSelectAll={isSelectAll}
                        selectedReportTypes={selectedReportTypes}
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
                        setShowBulkPriorityDialog={setShowBulkPriorityDialog}
                        filtersState={filtersStateForComponent}
                        isPerformingBulkAction={isPerformingBulkAction}
                        selectionMode={selectionMode}
                        selectionStats={selectionStats}
                        getPriorityDetails={getPriorityDetails}
                        formatDate={formatDate}
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
                            </div>
                        </div>
                    )}
                </div>
            </TooltipProvider>

            <ReportTypesDialogs
                showBulkDeleteDialog={showBulkDeleteDialog}
                setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                showBulkActivateDialog={showBulkActivateDialog}
                setShowBulkActivateDialog={setShowBulkActivateDialog}
                showBulkDeactivateDialog={showBulkDeactivateDialog}
                setShowBulkDeactivateDialog={setShowBulkDeactivateDialog}
                showBulkPriorityDialog={showBulkPriorityDialog}
                setShowBulkPriorityDialog={setShowBulkPriorityDialog}
                isPerformingBulkAction={isPerformingBulkAction}
                bulkEditValue={bulkEditValue}
                setBulkEditValue={setBulkEditValue}
                bulkEditField={bulkEditField}
                setBulkEditField={setBulkEditField}
                selectedReportTypes={selectedReportTypes}
                handleBulkOperation={handleBulkOperation}
                selectionStats={selectionStats}
            />
        </AppLayout>
    );
}