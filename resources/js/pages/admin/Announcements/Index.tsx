import { useState, useMemo, useEffect, useCallback } from 'react';
import { router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import AppLayout from '@/layouts/admin-app-layout';
import { 
    Announcement, 
    AnnouncementFilters, 
    AnnouncementStats, 
    PaginationData,
    BulkOperation,
    SelectionMode 
} from '@/types';
import { announcementUtils } from '@/admin-utils/announcement-utils';
import { TooltipProvider } from '@/components/ui/tooltip';

// Import AdminUI components
import AnnouncementsHeader from '@/components/admin/announcements/AnnouncementsHeader';
import AnnouncementsFilters from '@/components/admin/announcements/AnnouncementsFilters';
import AnnouncementsContent from '@/components/admin/announcements/AnnouncementsContent';
import AnnouncementsDialogs from '@/components/admin/announcements/AnnouncementsDialogs';
import { Button } from '@/components/ui/button';
import { KeyRound } from 'lucide-react';

interface AnnouncementsPageProps {
    announcements: PaginationData;
    filters: AnnouncementFilters;
    types: Record<string, string>;
    priorities: Record<string, string>;
    stats: AnnouncementStats;
}

const defaultStats: AnnouncementStats = {
    total: 0,
    active: 0,
    expired: 0,
    upcoming: 0
};

export default function AnnouncementsIndex({ 
    announcements, 
    filters, 
    types, 
    priorities, 
    stats = defaultStats
}: AnnouncementsPageProps) {
    const { flash } = usePage().props as any;
    
    // State management
    const [search, setSearch] = useState(filters.search || '');
    const [filtersState, setFiltersState] = useState<AnnouncementFilters>({
        type: filters.type || 'all',
        status: filters.status || 'all',
        from_date: filters.from_date || '',
        to_date: filters.to_date || '',
        sort_by: filters.sort_by || 'created_at',
        sort_order: filters.sort_order || 'desc'
    });
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(15);
    const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
    
    // Bulk selection states
    const [selectedAnnouncements, setSelectedAnnouncements] = useState<number[]>([]);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [isSelectAll, setIsSelectAll] = useState(false);
    const [selectionMode, setSelectionMode] = useState<SelectionMode>('page');
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
    const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [bulkEditValue, setBulkEditValue] = useState<string>('');

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

    // Handle search change - immediate navigation without debounce
    const handleSearchChange = (value: string) => {
        setSearch(value);
        
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
        
        router.get('/admin/announcements', params, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };

    // Filter announcements
    const filteredAnnouncements = useMemo(() => {
        return announcementUtils.filterAnnouncements({
            announcements: announcements.data,
            search,
            filters: filtersState
        });
    }, [announcements.data, search, filtersState]);

    // Pagination
    const totalItems = filteredAnnouncements.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedAnnouncements = filteredAnnouncements.slice(startIndex, endIndex);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, filtersState]);

    // Reset selection when exiting bulk mode
    useEffect(() => {
        if (!isBulkMode) {
            setSelectedAnnouncements([]);
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
                    if (selectedAnnouncements.length > 0) {
                        setSelectedAnnouncements([]);
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
                // Focus search input - you'll need to pass searchInputRef to Filters component
            }
            // Delete key for bulk delete
            if (e.key === 'Delete' && isBulkMode && selectedAnnouncements.length > 0) {
                e.preventDefault();
                setShowBulkDeleteDialog(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isBulkMode, selectedAnnouncements, isMobile]);

    // Selection handlers
    const handleSelectAllOnPage = () => {
        const pageIds = paginatedAnnouncements.map(announcement => announcement.id);
        if (isSelectAll) {
            setSelectedAnnouncements(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedAnnouncements, ...pageIds])];
            setSelectedAnnouncements(newSelected);
        }
        setIsSelectAll(!isSelectAll);
        setSelectionMode('page');
    };

    const handleSelectAllFiltered = () => {
        const allIds = filteredAnnouncements.map(announcement => announcement.id);
        if (selectedAnnouncements.length === allIds.length && allIds.every(id => selectedAnnouncements.includes(id))) {
            setSelectedAnnouncements(prev => prev.filter(id => !allIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedAnnouncements, ...allIds])];
            setSelectedAnnouncements(newSelected);
            setSelectionMode('filtered');
        }
    };

    const handleSelectAll = () => {
        if (confirm(`This will select ALL ${announcements.total || 0} announcements. This action may take a moment.`)) {
            const pageIds = paginatedAnnouncements.map(announcement => announcement.id);
            setSelectedAnnouncements(pageIds);
            setSelectionMode('all');
        }
    };

    const handleItemSelect = (id: number) => {
        setSelectedAnnouncements(prev => {
            if (prev.includes(id)) {
                return prev.filter(itemId => itemId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    // Check if all items on current page are selected
    useEffect(() => {
        const allPageIds = paginatedAnnouncements.map(announcement => announcement.id);
        const allSelected = allPageIds.length > 0 && allPageIds.every(id => selectedAnnouncements.includes(id));
        setIsSelectAll(allSelected);
    }, [selectedAnnouncements, paginatedAnnouncements]);

    // Get selected announcements data
    const selectedAnnouncementsData = useMemo(() => {
        return filteredAnnouncements.filter(announcement => selectedAnnouncements.includes(announcement.id));
    }, [selectedAnnouncements, filteredAnnouncements]);

    // Calculate selection stats
    const selectionStats = useMemo(() => {
        return announcementUtils.getSelectionStats(selectedAnnouncementsData);
    }, [selectedAnnouncementsData]);

    // Bulk operations
    const handleBulkOperation = async (operation: BulkOperation) => {
        if (selectedAnnouncements.length === 0) {
            toast.error('Please select at least one announcement');
            return;
        }

        setIsPerformingBulkAction(true);

        try {
            switch (operation) {
                case 'delete':
                    if (confirm(`Are you sure you want to delete ${selectedAnnouncements.length} selected announcement(s)?`)) {
                        await router.post('/admin/announcements/bulk-action', {
                            action: 'delete',
                            announcement_ids: selectedAnnouncements,
                        }, {
                            preserveScroll: true,
                            onSuccess: () => {
                                setSelectedAnnouncements([]);
                                setShowBulkDeleteDialog(false);
                                toast.success('Announcements deleted successfully');
                            },
                            onError: () => {
                                toast.error('Failed to delete announcements');
                            }
                        });
                    }
                    break;

                case 'activate':
                    await router.post('/admin/announcements/bulk-action', {
                        action: 'activate',
                        announcement_ids: selectedAnnouncements,
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            setSelectedAnnouncements([]);
                            toast.success('Announcements activated successfully');
                        },
                        onError: () => {
                            toast.error('Failed to activate announcements');
                        }
                    });
                    break;

                case 'deactivate':
                    await router.post('/admin/announcements/bulk-action', {
                        action: 'deactivate',
                        announcement_ids: selectedAnnouncements,
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            setSelectedAnnouncements([]);
                            toast.success('Announcements deactivated successfully');
                        },
                        onError: () => {
                            toast.error('Failed to deactivate announcements');
                        }
                    });
                    break;

                case 'publish':
                    // Implement publish logic
                    toast.info('Publish functionality to be implemented');
                    break;

                case 'archive':
                    // Implement archive logic
                    toast.info('Archive functionality to be implemented');
                    break;

                case 'export':
                    toast.info('Export functionality to be implemented');
                    break;

                case 'print':
                    toast.info('Print functionality to be implemented');
                    break;

                case 'change_status':
                    toast.info('Change status functionality to be implemented');
                    break;

                case 'change_type':
                    toast.info('Change type functionality to be implemented');
                    break;

                case 'copy_data':
                    // Copy selected data to clipboard
                    if (selectedAnnouncementsData.length === 0) {
                        toast.error('No data to copy');
                        return;
                    }
                    
                    const data = selectedAnnouncementsData.map(announcement => ({
                        'Title': announcement.title || 'N/A',
                        'Type': announcement.type || 'N/A',
                        'Priority': announcement.priority || 'N/A',
                        'Status': announcement.is_active ? 'Active' : 'Inactive',
                        'Created': announcementUtils.formatDate(announcement.created_at),
                    }));
                    
                    const csv = [
                        Object.keys(data[0]).join(','),
                        ...data.map(row => Object.values(row).join(','))
                    ].join('\n');
                    
                    navigator.clipboard.writeText(csv).then(() => {
                        toast.success('Data copied to clipboard');
                    }).catch(() => {
                        toast.error('Failed to copy to clipboard');
                    });
                    break;
            }
        } catch (error) {
            console.error('Bulk operation error:', error);
            toast.error('An error occurred during the bulk operation.');
        } finally {
            setIsPerformingBulkAction(false);
        }
    };

    // Individual announcement operations
    const handleDelete = (announcement: Announcement) => {
        if (confirm(`Are you sure you want to delete announcement "${announcement.title || 'Untitled'}"?`)) {
            router.delete(`/admin/announcements/${announcement.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedAnnouncements(selectedAnnouncements.filter(id => id !== announcement.id));
                    toast.success('Announcement deleted successfully');
                },
                onError: () => {
                    toast.error('Failed to delete announcement');
                }
            });
        }
    };

    const handleToggleStatus = (announcement: Announcement) => {
        router.post(`/admin/announcements/${announcement.id}/toggle-status`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Announcement status updated');
            },
            onError: () => {
                toast.error('Failed to update announcement status');
            }
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
            type: 'all',
            status: 'all',
            from_date: '',
            to_date: '',
            sort_by: 'created_at',
            sort_order: 'desc'
        });
    };

    const handleClearSelection = () => {
        setSelectedAnnouncements([]);
        setIsSelectAll(false);
    };

    const handleCopySelectedData = () => {
        handleBulkOperation('copy_data');
    };

    const updateFilter = (key: keyof AnnouncementFilters, value: string) => {
        setFiltersState(prev => ({ ...prev, [key]: value }));
    };

    const hasActiveFilters = 
        search || 
        filtersState.type !== 'all' || 
        filtersState.status !== 'all' ||
        filtersState.from_date ||
        filtersState.to_date;

    return (
        <AppLayout
            title="Announcements Management"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Announcements', href: '/admin/announcements' }
            ]}
        >
            <TooltipProvider>
                <div className="space-y-4 sm:space-y-6">
                    <AnnouncementsHeader 
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isMobile={isMobile}
                    />

                    <AnnouncementsFilters
                        stats={stats}
                        search={search}
                        setSearch={handleSearchChange}
                        filtersState={filtersState}
                        updateFilter={updateFilter}
                        showAdvancedFilters={showAdvancedFilters}
                        setShowAdvancedFilters={setShowAdvancedFilters}
                        handleClearFilters={handleClearFilters}
                        hasActiveFilters={hasActiveFilters}
                        types={types}
                        isMobile={isMobile}
                        totalItems={totalItems}
                        startIndex={startIndex}
                        endIndex={endIndex}
                    />

                    <AnnouncementsContent
                        announcements={paginatedAnnouncements}
                        stats={stats}
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isSelectAll={isSelectAll}
                        selectedAnnouncements={selectedAnnouncements}
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
                        onSort={handleSort}
                        onBulkOperation={handleBulkOperation}
                        onCopySelectedData={handleCopySelectedData}
                        setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                        filtersState={filtersState}
                        isPerformingBulkAction={isPerformingBulkAction}
                        selectionMode={selectionMode}
                        selectionStats={selectionStats}
                        types={types}
                        priorities={priorities}
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

            <AnnouncementsDialogs
                showBulkDeleteDialog={showBulkDeleteDialog}
                setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                isPerformingBulkAction={isPerformingBulkAction}
                selectedAnnouncements={selectedAnnouncements}
                handleBulkOperation={handleBulkOperation}
                selectionStats={selectionStats}
            />
        </AppLayout>
    );
}