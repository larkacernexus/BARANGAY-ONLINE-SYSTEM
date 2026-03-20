// app/pages/admin/report-types/index.tsx
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
    getPriorityColor,
    getPriorityIcon,
    getStatusBadgeVariant,
    getSelectionStats,
    filterReportTypes,
    formatForClipboard,
    safeNumber
} from '@/admin-utils/reportTypesUtils';

// Import types
import { ReportType, BulkOperation, BulkEditField, SelectionMode, FilterState, SelectionStats } from '@/types/report-types';

interface PageProps {
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

declare module '@inertiajs/react' {
    interface PageProps {
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
}

export default function ReportTypesIndex() {
    const { props } = usePage<PageProps>();
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
    
    // State management
    const [search, setSearch] = useState(safeFilters.search || '');
    const [filtersState, setFiltersState] = useState<FilterState>({
        search: safeFilters.search || '',
        status: safeFilters.status || 'all',
        priority: safeFilters.priority || 'all',
        requires_action: safeFilters.requires_action || 'all'
    });
    const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
    const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    
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
            setSelectedReportTypes([]);
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
                    if (selectedReportTypes.length > 0) {
                        setSelectedReportTypes([]);
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
            if (e.key === 'Delete' && isBulkMode && selectedReportTypes.length > 0) {
                e.preventDefault();
                setShowBulkDeleteDialog(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isBulkMode, selectedReportTypes, isMobile]);

    // Filter report types client-side for selection
    const filteredReportTypes = useMemo(() => {
        return filterReportTypes(
            safeReportTypes,
            search,
            filtersState,
            'name',
            'asc'
        );
    }, [safeReportTypes, search, filtersState]);

    // Calculate pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const totalItems = filteredReportTypes.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedReportTypes = filteredReportTypes.slice(startIndex, endIndex);

    // Selection handlers
    const handleSelectAllOnPage = () => {
        const pageIds = paginatedReportTypes.map(type => type.id);
        if (isSelectAll) {
            setSelectedReportTypes(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedReportTypes, ...pageIds])];
            setSelectedReportTypes(newSelected);
        }
        setIsSelectAll(!isSelectAll);
        setSelectionMode('page');
    };

    const handleSelectAllFiltered = () => {
        const allIds = filteredReportTypes.map(type => type.id);
        if (selectedReportTypes.length === allIds.length && allIds.every(id => selectedReportTypes.includes(id))) {
            setSelectedReportTypes(prev => prev.filter(id => !allIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedReportTypes, ...allIds])];
            setSelectedReportTypes(newSelected);
            setSelectionMode('filtered');
        }
    };

    const handleSelectAll = () => {
        if (confirm(`This will select ALL ${safeReportTypes.length} report types. This action may take a moment.`)) {
            const pageIds = paginatedReportTypes.map(type => type.id);
            setSelectedReportTypes(pageIds);
            setSelectionMode('all');
        }
    };

    const handleItemSelect = (id: number) => {
        setSelectedReportTypes(prev => {
            if (prev.includes(id)) {
                return prev.filter(itemId => itemId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    // Check if all items on current page are selected
    useEffect(() => {
        const allPageIds = paginatedReportTypes.map(type => type.id);
        const allSelected = allPageIds.length > 0 && allPageIds.every(id => selectedReportTypes.includes(id));
        setIsSelectAll(allSelected);
    }, [selectedReportTypes, paginatedReportTypes]);

    // Get selected report types data
    const selectedReportTypesData = useMemo(() => {
        return filteredReportTypes.filter(type => selectedReportTypes.includes(type.id));
    }, [selectedReportTypes, filteredReportTypes]);

    // Calculate selection stats
    const selectionStats = useMemo(() => {
        return getSelectionStats(selectedReportTypesData);
    }, [selectedReportTypesData]);

    // Priority counts
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
                        'ID': type.id,
                        'Code': type.code,
                        'Name': type.name,
                        'Description': type.description || '',
                        'Priority': getPriorityLabel(type.priority_level),
                        'Resolution Days': type.resolution_days,
                        'Status': type.is_active ? 'Active' : 'Inactive',
                        'Requires Immediate Action': type.requires_immediate_action ? 'Yes' : 'No',
                        'Requires Evidence': type.requires_evidence ? 'Yes' : 'No',
                        'Allows Anonymous': type.allows_anonymous ? 'Yes' : 'No',
                        'Created At': formatDate(type.created_at),
                        'Updated At': formatDate(type.updated_at),
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
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
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
                            onError: (errors) => {
                                toast.error('Failed to duplicate report types');
                                console.error('Duplicate errors:', errors);
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
    const handleCopySelectedData = () => {
        if (selectedReportTypesData.length === 0) {
            toast.error('No data to copy');
            return;
        }
        
        const csv = formatForClipboard(selectedReportTypesData);
        
        navigator.clipboard.writeText(csv).then(() => {
            toast.success('Selected data copied to clipboard as CSV');
        }).catch(() => {
            toast.error('Failed to copy to clipboard');
        });
    };

    // Individual report type operations
    const handleToggleStatus = (type: ReportType) => {
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
    };

    const handleDuplicate = (type: ReportType) => {
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
    };

    const handleDelete = (type: ReportType) => {
        if (confirm(`Are you sure you want to delete "${type.name}"? This action cannot be undone.`)) {
            router.delete(route('report-types.destroy', type.id));
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
        
        router.get(route('admin.report-types.index'), params, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };

    const handleClearFilters = () => {
        setSearch('');
        setFiltersState({
            search: '',
            status: 'all',
            priority: 'all',
            requires_action: 'all'
        });
        
        router.get(route('admin.report-types.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClearSelection = () => {
        setSelectedReportTypes([]);
        setIsSelectAll(false);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleViewPhoto = (type: ReportType) => {
        // Implement if needed
        toast.info('Feature to be implemented');
    };

    const hasActiveFilters = 
        search || 
        filtersState.status !== 'all' || 
        filtersState.priority !== 'all' ||
        filtersState.requires_action !== 'all';

    // Add error boundary fallback
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
                        stats={safeStats}
                        priorityCounts={priorityCounts}
                    />

                    <ReportTypesFilters
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
                        filtersState={filtersState}
                        isPerformingBulkAction={isPerformingBulkAction}
                        selectionMode={selectionMode}
                        selectionStats={selectionStats}
                        getPriorityDetails={getPriorityDetails}
                        formatDate={formatDate}
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