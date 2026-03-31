// pages/admin/officials/index.tsx
import { router, usePage } from '@inertiajs/react';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import debounce from 'lodash/debounce';
import AppLayout from '@/layouts/admin-app-layout';
import { OfficialsProps, Official } from '@/types/admin/officials/officials';
import { 
    filterOfficials,
    getSelectionStats,
    formatForClipboard,
    truncateText,
    getTruncationLength,
    getStatusBadgeVariant,
    formatDate,
    getPositionBadgeVariant,
    FilterState,
    BulkOperation,
    SelectionMode,
    SelectionStats
} from '@/admin-utils/officialsUtils';

// Import reusable components
import { TooltipProvider } from '@/components/ui/tooltip';
import OfficialsHeader from '@/components/admin/officials/OfficialsHeader';
import OfficialsStats from '@/components/admin/officials/OfficialsStats';
import OfficialsFilters from '@/components/admin/officials/OfficialsFilters';
import OfficialsContent from '@/components/admin/officials/OfficialsContent';
import OfficialsDialogs from '@/components/admin/officials/OfficialsDialogs';
import { Button } from '@/components/ui/button';
import { KeyRound } from 'lucide-react';

export default function Officials() {
    const { props } = usePage<OfficialsProps>();
    const { officials, stats, filters, positions, committees, statusOptions, typeOptions } = props;
    
    // State management
    const [search, setSearch] = useState(filters.search || '');
    const [filtersState, setFiltersState] = useState<FilterState>({
        search: filters.search || '',  
        status: filters.status || 'active',
        position: filters.position || 'all',
        committee: filters.committee || 'all',
        type: filters.type || 'all',
        sort_by: filters.sort_by || 'order',
        sort_order: filters.sort_order || 'asc'
    });
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(15);
    const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
    const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    
    // Bulk selection states
    const [selectedOfficials, setSelectedOfficials] = useState<number[]>([]);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [isSelectAll, setIsSelectAll] = useState(false);
    const [selectionMode, setSelectionMode] = useState<SelectionMode>('page');
    
    // Dialog states
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
    const [showBulkStatusDialog, setShowBulkStatusDialog] = useState(false);
    const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false);

    const searchInputRef = useRef<HTMLInputElement | null>(null);

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
    }, [search, filtersState]);

    // Reset selection when exiting bulk mode
    useEffect(() => {
        if (!isBulkMode) {
            setSelectedOfficials([]);
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
                    if (selectedOfficials.length > 0) {
                        setSelectedOfficials([]);
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
            if (e.key === 'Delete' && isBulkMode && selectedOfficials.length > 0) {
                e.preventDefault();
                setShowBulkDeleteDialog(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isBulkMode, selectedOfficials, isMobile]);

    // Filter officials
    const filteredOfficials = useMemo(() => {
        return filterOfficials(
            officials.data,
            search,
            filtersState,
            positions,
            committees
        );
    }, [officials.data, search, filtersState, positions, committees]);

    // Pagination
    const totalItems = filteredOfficials.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedOfficials = filteredOfficials.slice(startIndex, endIndex);

    // Selection handlers
    const handleSelectAllOnPage = () => {
        const pageIds = paginatedOfficials.map(official => official.id);
        if (isSelectAll) {
            setSelectedOfficials(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedOfficials, ...pageIds])];
            setSelectedOfficials(newSelected);
        }
        setIsSelectAll(!isSelectAll);
        setSelectionMode('page');
    };

    const handleSelectAllFiltered = () => {
        const allIds = filteredOfficials.map(official => official.id);
        if (selectedOfficials.length === allIds.length && allIds.every(id => selectedOfficials.includes(id))) {
            setSelectedOfficials(prev => prev.filter(id => !allIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedOfficials, ...allIds])];
            setSelectedOfficials(newSelected);
            setSelectionMode('filtered');
        }
    };

    const handleSelectAll = () => {
        if (confirm(`This will select ALL ${officials.total || 0} officials. This action may take a moment.`)) {
            const pageIds = paginatedOfficials.map(official => official.id);
            setSelectedOfficials(pageIds);
            setSelectionMode('all');
        }
    };

    const handleItemSelect = (id: number) => {
        setSelectedOfficials(prev => {
            if (prev.includes(id)) {
                return prev.filter(itemId => itemId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    // Check if all items on current page are selected
    useEffect(() => {
        const allPageIds = paginatedOfficials.map(official => official.id);
        const allSelected = allPageIds.length > 0 && allPageIds.every(id => selectedOfficials.includes(id));
        setIsSelectAll(allSelected);
    }, [selectedOfficials, paginatedOfficials]);

    // Get selected officials data
    const selectedOfficialsData = useMemo(() => {
        return filteredOfficials.filter(official => selectedOfficials.includes(official.id));
    }, [selectedOfficials, filteredOfficials]);

    // Calculate selection stats
    const selectionStats = useMemo(() => {
        return getSelectionStats(selectedOfficialsData);
    }, [selectedOfficialsData]);

    // ========== REVISED BULK OPERATIONS ==========
    // ONE FUNCTION FOR ALL BULK STATUS UPDATES
    const handleBulkStatusUpdate = (status: 'active' | 'inactive' | 'former' | 'current') => {
        if (selectedOfficials.length === 0) {
            toast.error('Please select at least one official');
            return;
        }

        setIsPerformingBulkAction(true);

        router.post('/admin/officials/bulk-status', {
            ids: selectedOfficials,
            status: status,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                const messages = {
                    active: 'activated',
                    inactive: 'deactivated',
                    former: 'marked as former',
                    current: 'marked as current'
                };
                setSelectedOfficials([]);
                toast.success(`Officials ${messages[status]} successfully`);
                setShowBulkStatusDialog(false);
            },
            onError: (errors: any) => {
                console.error('Bulk status update error:', errors);
                toast.error('Failed to update officials status');
            },
            onFinish: () => {
                setIsPerformingBulkAction(false);
            }
        });
    };

    // Bulk delete
    const handleBulkDelete = () => {
        if (selectedOfficials.length === 0) {
            toast.error('Please select at least one official');
            return;
        }

        if (!confirm(`Are you sure you want to delete ${selectedOfficials.length} selected official(s)?`)) {
            return;
        }

        setIsPerformingBulkAction(true);

        router.post('/admin/officials/bulk-delete', {
            ids: selectedOfficials,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedOfficials([]);
                setShowBulkDeleteDialog(false);
                toast.success('Officials deleted successfully');
            },
            onError: (errors: any) => {
                console.error('Bulk delete error:', errors);
                toast.error('Failed to delete officials');
            },
            onFinish: () => {
                setIsPerformingBulkAction(false);
            }
        });
    };

    // Export
    const handleExport = () => {
        if (selectedOfficials.length === 0) {
            toast.error('Please select at least one official');
            return;
        }

        const exportData = formatForClipboard(selectedOfficialsData);
        const blob = new Blob([exportData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `officials-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success('Export completed successfully');
    };

    // Print
    const handlePrint = () => {
        if (selectedOfficials.length === 0) {
            toast.error('Please select at least one official');
            return;
        }

        selectedOfficials.forEach(id => {
            window.open(`/admin/officials/${id}/print`, '_blank');
        });
        toast.success(`${selectedOfficials.length} official(s) opened for printing`);
    };

    // Message
    const handleMessage = () => {
        if (selectedOfficials.length === 0) {
            toast.error('Please select at least one official');
            return;
        }

        const officialsWithContacts = selectedOfficialsData
            .filter(o => o.contact_number || o.resident?.contact_number)
            .map(o => ({ 
                name: o.resident?.full_name || 'Official', 
                contact: o.contact_number || o.resident?.contact_number 
            }));
        
        if (officialsWithContacts.length > 0) {
            const contacts = officialsWithContacts.map(o => o.contact).join(',');
            const smsLink = `sms:${contacts}`;
            window.location.href = smsLink;
            toast.success(`Opening SMS for ${officialsWithContacts.length} official(s)`);
        } else {
            toast.error('No contact numbers available for selected officials');
        }
    };

    // Generate report
    const handleGenerateReport = () => {
        if (selectedOfficials.length === 0) {
            toast.error('Please select at least one official');
            return;
        }

        const idsParam = selectedOfficials.join(',');
        window.open(`/admin/officials/report?ids=${idsParam}`, '_blank');
        toast.success(`Generating report for ${selectedOfficials.length} official(s)`);
    };

    // Main bulk operation handler
    const handleBulkOperation = async (operation: string) => {
        switch (operation) {
            case 'delete':
                setShowBulkDeleteDialog(true);
                break;
            case 'activate':
                handleBulkStatusUpdate('active');
                break;
            case 'deactivate':
                handleBulkStatusUpdate('inactive');
                break;
            case 'make_current':
                handleBulkStatusUpdate('current');
                break;
            case 'make_former':
                handleBulkStatusUpdate('former');
                break;
            case 'export':
            case 'export_csv':
                handleExport();
                break;
            case 'print':
                handlePrint();
                break;
            case 'generate_report':
                handleGenerateReport();
                break;
            case 'message_officials':
                handleMessage();
                break;
            default:
                toast.error('Operation not supported');
        }
    };

    // Copy selected data to clipboard
    const handleCopySelectedData = () => {
        if (selectedOfficialsData.length === 0) {
            toast.error('No data to copy');
            return;
        }
        
        const csv = formatForClipboard(selectedOfficialsData);
        
        navigator.clipboard.writeText(csv).then(() => {
            toast.success('Data copied to clipboard');
        }).catch(() => {
            toast.error('Failed to copy to clipboard');
        });
    };

    // Individual official operations
    const handleDelete = (official: Official) => {
        if (confirm(`Are you sure you want to delete official "${official.resident?.full_name || 'Untitled'}"?`)) {
            router.delete(`/admin/officials/${official.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedOfficials(selectedOfficials.filter(id => id !== official.id));
                    toast.success('Official deleted successfully');
                },
                onError: () => {
                    toast.error('Failed to delete official');
                }
            });
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
        setFiltersState(prev => ({
            ...prev,
            sort_by: column,
            sort_order: prev.sort_by === column && prev.sort_order === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleClearFilters = () => {
        setSearch('');
        setFiltersState({
            search: '',  // Add this missing property
            status: 'active',
            position: 'all',
            committee: 'all',
            type: 'all',
            sort_by: 'order',
            sort_order: 'asc'
        });
    };

    const handleClearSelection = () => {
        setSelectedOfficials([]);
        setIsSelectAll(false);
    };

    const updateFilter = (key: keyof FilterState, value: string) => {
        setFiltersState(prev => ({ ...prev, [key]: value }));
    };

    const hasActiveFilters = Boolean(
        search || 
        filtersState.status !== 'active' ||
        filtersState.position !== 'all' || 
        filtersState.committee !== 'all' ||
        filtersState.type !== 'all'
    );

    return (
        <AppLayout
            title="Barangay Officials"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Officials', href: '/admin/officials' }
            ]}
        >
            <TooltipProvider>
                <div className="space-y-4 sm:space-y-6">
                    <OfficialsHeader 
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isMobile={isMobile}
                    />

                    <OfficialsStats 
                        stats={stats}
                        positions={positions}
                        committees={committees}
                    />

                    <OfficialsFilters
                        search={search}
                        setSearch={setSearch}
                        filtersState={filtersState}
                        updateFilter={updateFilter}
                        showAdvancedFilters={showAdvancedFilters}
                        setShowAdvancedFilters={setShowAdvancedFilters}
                        handleClearFilters={handleClearFilters}
                        hasActiveFilters={hasActiveFilters}
                        positions={positions}
                        committees={committees}
                        statusOptions={statusOptions}
                        typeOptions={typeOptions}
                        isMobile={isMobile}
                        totalItems={totalItems}
                        startIndex={startIndex}
                        endIndex={endIndex}
                        searchInputRef={searchInputRef}
                        handleSort={handleSort}
                        exportData={() => handleBulkOperation('export_csv')}
                    />

                    <OfficialsContent
                        officials={paginatedOfficials}
                        stats={stats}
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isSelectAll={isSelectAll}
                        selectedOfficials={selectedOfficials}
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
                        onCopyToClipboard={handleCopyToClipboard}
                        onCopySelectedData={handleCopySelectedData}
                        onSort={handleSort}
                        onBulkOperation={handleBulkOperation}
                        setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                        filtersState={filtersState}
                        isPerformingBulkAction={isPerformingBulkAction}
                        selectionMode={selectionMode}
                        selectionStats={selectionStats}
                        positions={positions}
                        committees={committees}
                        windowWidth={windowWidth}
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

            <OfficialsDialogs
                showBulkDeleteDialog={showBulkDeleteDialog}
                setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                showBulkStatusDialog={showBulkStatusDialog}
                setShowBulkStatusDialog={setShowBulkStatusDialog}
                isPerformingBulkAction={isPerformingBulkAction}
                selectedOfficials={selectedOfficials}
                handleBulkOperation={handleBulkOperation}
                selectionStats={selectionStats}
            />
        </AppLayout>
    );
}