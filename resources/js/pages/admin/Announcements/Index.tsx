// resources/js/pages/admin/announcements/index.tsx

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import AppLayout from '@/layouts/admin-app-layout';
import { 
    Announcement, 
    AnnouncementFilters, 
    AnnouncementStats, 
    PaginationData,
    BulkOperation,
    SelectionMode,
    SelectionStats,
    PRIORITY_DISPLAY,
    PRIORITY_LABELS,
    PRIORITY_ORDER,
    STATUS_ORDER,
    PriorityLevel
} from '@/types/admin/announcements/announcement.types';
import { announcementUtils } from '@/admin-utils/announcement-utils';
import { TooltipProvider } from '@/components/ui/tooltip';

// Import AdminUI components
import AnnouncementsHeader from '@/components/admin/announcements/AnnouncementsHeader';
import AnnouncementsStats from '@/components/admin/announcements/AnnouncementsStats';
import AnnouncementsFilters from '@/components/admin/announcements/AnnouncementsFilters';
import AnnouncementsContent from '@/components/admin/announcements/AnnouncementsContent';
import AnnouncementsDialogs from '@/components/admin/announcements/AnnouncementsDialogs';
import { Button } from '@/components/ui/button';
import { KeyRound } from 'lucide-react';

interface AnnouncementsPageProps {
    announcements: PaginationData;
    filters: AnnouncementFilters;
    types: Record<string, string>;
    audience_types: Record<string, string>;
    priorities: Record<string, string>;
    stats: AnnouncementStats;
}

const defaultStats: AnnouncementStats = {
    total: 0,
    active: 0,
    expired: 0,
    upcoming: 0,
    unread: 0,
    personalized: 0,
    with_attachments: 0
};

export default function AnnouncementsIndex({ 
    announcements, 
    filters, 
    types, 
    priorities, 
    audience_types,
    stats = defaultStats
}: AnnouncementsPageProps) {
    const { flash } = usePage().props as any;
    
    // State management
    const [search, setSearch] = useState(filters.search || '');
    
    // Filter states
    const [filtersState, setFiltersState] = useState<AnnouncementFilters>({
        type: filters.type || 'all',
        status: filters.status || 'all',
        from_date: filters.from_date || '',
        to_date: filters.to_date || '',
        audience_type: filters.audience_type || 'all',
    });
    
    // Priority filter - using string values that map to numeric priorities
    const [priorityFilter, setPriorityFilter] = useState<string>(filters.priority || 'all');
    
    // Audience type filter
    const [audienceTypeFilter, setAudienceTypeFilter] = useState<string>(filters.audience_type || 'all');
    
    // Date range preset
    const [dateRangePreset, setDateRangePreset] = useState<string>('');
    
    // Sorting states for table header
    const [sortByState, setSortByState] = useState<string>(filters.sort_by || 'created_at');
    const [sortOrderState, setSortOrderState] = useState<'asc' | 'desc'>(filters.sort_order || 'desc');
    
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(announcements.current_page || 1);
    const [itemsPerPage] = useState(announcements.per_page || 15);
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

    // Filter announcements
    const filteredAnnouncements = useMemo(() => {
        let filtered = [...(announcements.data || [])];
        
        // Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(a =>
                a?.title?.toLowerCase().includes(searchLower) ||
                a?.content?.toLowerCase().includes(searchLower) ||
                a?.type?.toLowerCase().includes(searchLower)
            );
        }
        
        // Type filter
        if (filtersState.type && filtersState.type !== 'all') {
            filtered = filtered.filter(a => a?.type === filtersState.type);
        }
        
        // Status filter
        if (filtersState.status && filtersState.status !== 'all') {
            filtered = filtered.filter(a => a?.status === filtersState.status);
        }
        
        // Priority filter
        if (priorityFilter && priorityFilter !== 'all') {
            const numericPriority = parseInt(priorityFilter) as PriorityLevel;
            filtered = filtered.filter(a => a?.priority === numericPriority);
        }
        
        // Audience type filter
        if (audienceTypeFilter && audienceTypeFilter !== 'all') {
            filtered = filtered.filter(a => a?.audience_type === audienceTypeFilter);
        }
        
        // Date range filter (using created_at) - FIXED: Added null checks
        if (filtersState.from_date && filtersState.from_date !== '') {
            filtered = filtered.filter(a => a.created_at && a.created_at >= filtersState.from_date!);
        }
        if (filtersState.to_date && filtersState.to_date !== '') {
            filtered = filtered.filter(a => a.created_at && a.created_at <= filtersState.to_date!);
        }
        
        // Apply sorting
        if (filtered.length > 0) {
            filtered.sort((a, b) => {
                let valueA: any;
                let valueB: any;
                
                switch (sortByState) {
                    case 'title':
                        valueA = a?.title || '';
                        valueB = b?.title || '';
                        break;
                    case 'type':
                        valueA = a?.type || '';
                        valueB = b?.type || '';
                        break;
                    case 'priority':
                        valueA = a?.priority ?? 0;
                        valueB = b?.priority ?? 0;
                        break;
                    case 'audience_type':
                        valueA = a?.audience_type || '';
                        valueB = b?.audience_type || '';
                        break;
                    case 'status':
                        valueA = STATUS_ORDER[a?.status || 'archived'] || 99;
                        valueB = STATUS_ORDER[b?.status || 'archived'] || 99;
                        break;
                    case 'start_date':
                        valueA = a?.start_date ? new Date(a.start_date).getTime() : 0;
                        valueB = b?.start_date ? new Date(b.start_date).getTime() : 0;
                        break;
                    case 'end_date':
                        valueA = a?.end_date ? new Date(a.end_date).getTime() : 0;
                        valueB = b?.end_date ? new Date(b.end_date).getTime() : 0;
                        break;
                    case 'created_at':
                        valueA = a?.created_at ? new Date(a.created_at).getTime() : 0;
                        valueB = b?.created_at ? new Date(b.created_at).getTime() : 0;
                        break;
                    default:
                        valueA = a?.created_at ? new Date(a.created_at).getTime() : 0;
                        valueB = b?.created_at ? new Date(b.created_at).getTime() : 0;
                }
                
                if (typeof valueA === 'string') {
                    valueA = valueA.toLowerCase();
                    valueB = valueB.toLowerCase();
                }
                
                if (valueA < valueB) return sortOrderState === 'asc' ? -1 : 1;
                if (valueA > valueB) return sortOrderState === 'asc' ? 1 : -1;
                return 0;
            });
        }
        
        return filtered;
    }, [announcements.data, search, filtersState, priorityFilter, audienceTypeFilter, sortByState, sortOrderState]);

    // Calculate filtered stats
    const filteredStats = useMemo(() => {
        return {
            total: filteredAnnouncements.length,
            active: filteredAnnouncements.filter(a => a?.status === 'active').length,
            expired: filteredAnnouncements.filter(a => a?.status === 'expired').length,
            upcoming: filteredAnnouncements.filter(a => a?.status === 'upcoming').length,
            unread: stats.unread || 0,
            personalized: stats.personalized || 0,
            with_attachments: filteredAnnouncements.filter(a => a?.has_attachments).length,
        };
    }, [filteredAnnouncements, stats]);

    // Pagination
    const totalItems = filteredAnnouncements.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedAnnouncements = filteredAnnouncements.slice(startIndex, endIndex);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, filtersState, priorityFilter, audienceTypeFilter]);

    // Reset selection when exiting bulk mode
    useEffect(() => {
        if (!isBulkMode) {
            setSelectedAnnouncements([]);
            setIsSelectAll(false);
        }
    }, [isBulkMode]);

    // Handle sort from table header
    const handleSort = useCallback((column: string) => {
        const newOrder = sortByState === column && sortOrderState === 'asc' ? 'desc' : 'asc';
        setSortByState(column);
        setSortOrderState(newOrder);
        
        // Optionally persist sort to server
        router.get('/admin/announcements', {
            ...filtersState,
            search,
            priority: priorityFilter,
            audience_type: audienceTypeFilter,
            sort_by: column,
            sort_order: newOrder,
            page: currentPage
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    }, [sortByState, sortOrderState, filtersState, search, priorityFilter, audienceTypeFilter, currentPage]);

    // Handle search change with debounce
    const handleSearchChange = useCallback((value: string) => {
        setSearch(value);
        
        // Debounced server search
        const timeoutId = setTimeout(() => {
            router.get('/admin/announcements', {
                ...filtersState,
                search: value,
                priority: priorityFilter,
                audience_type: audienceTypeFilter,
                sort_by: sortByState,
                sort_order: sortOrderState,
                page: 1
            }, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ['announcements', 'filters']
            });
        }, 500);
        
        return () => clearTimeout(timeoutId);
    }, [filtersState, priorityFilter, audienceTypeFilter, sortByState, sortOrderState]);

    // Handle filter updates with server sync
    const updateFilter = useCallback((key: keyof AnnouncementFilters, value: string) => {
        const newFilters = { ...filtersState, [key]: value };
        setFiltersState(newFilters);
        setCurrentPage(1);
        
        router.get('/admin/announcements', {
            ...newFilters,
            search,
            priority: priorityFilter,
            audience_type: audienceTypeFilter,
            sort_by: sortByState,
            sort_order: sortOrderState,
            page: 1
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['announcements', 'filters']
        });
    }, [filtersState, search, priorityFilter, audienceTypeFilter, sortByState, sortOrderState]);

    // Handle priority filter change
    const handlePriorityFilterChange = useCallback((value: string) => {
        setPriorityFilter(value);
        
        router.get('/admin/announcements', {
            ...filtersState,
            search,
            priority: value,
            audience_type: audienceTypeFilter,
            sort_by: sortByState,
            sort_order: sortOrderState,
            page: 1
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['announcements', 'filters']
        });
    }, [filtersState, search, audienceTypeFilter, sortByState, sortOrderState]);

    // Handle audience type filter change
    const handleAudienceTypeChange = useCallback((value: string) => {
        setAudienceTypeFilter(value);
        
        router.get('/admin/announcements', {
            ...filtersState,
            search,
            priority: priorityFilter,
            audience_type: value,
            sort_by: sortByState,
            sort_order: sortOrderState,
            page: 1
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['announcements', 'filters']
        });
    }, [filtersState, search, priorityFilter, sortByState, sortOrderState]);

    // Handle clear filters
    const handleClearFilters = useCallback(() => {
        setSearch('');
        setFiltersState({
            type: 'all',
            status: 'all',
            from_date: '',
            to_date: '',
            audience_type: 'all',
        });
        setPriorityFilter('all');
        setAudienceTypeFilter('all');
        setDateRangePreset('');
        setSortByState('created_at');
        setSortOrderState('desc');
        setCurrentPage(1);
        
        router.get('/admin/announcements', {
            type: 'all',
            status: 'all',
            audience_type: 'all',
            sort_by: 'created_at',
            sort_order: 'desc',
            page: 1
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['announcements', 'filters']
        });
    }, []);

    // Check if any filters are active - FIXED: Added null checks for date fields
    const hasActiveFilters = useMemo(() => {
        return !!(search || 
            filtersState.type !== 'all' || 
            filtersState.status !== 'all' ||
            (filtersState.from_date && filtersState.from_date !== '') ||
            (filtersState.to_date && filtersState.to_date !== '') ||
            filtersState.audience_type !== 'all' ||
            priorityFilter !== 'all');
    }, [search, filtersState, priorityFilter]);

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
        if (confirm(`This will select ALL ${filteredAnnouncements.length} announcements. This action may take a moment.`)) {
            const allIds = filteredAnnouncements.map(a => a.id);
            setSelectedAnnouncements(allIds);
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
    const selectionStats: SelectionStats = useMemo(() => {
        return announcementUtils.getSelectionStats(selectedAnnouncementsData);
    }, [selectedAnnouncementsData]);

    // Bulk operations
    const handleBulkOperation = async (operation: BulkOperation, additionalData?: any) => {
        if (selectedAnnouncements.length === 0) {
            toast.error('Please select at least one announcement');
            return;
        }

        setIsPerformingBulkAction(true);

        try {
            switch (operation) {
                case 'delete':
                    setShowBulkDeleteDialog(true);
                    break;

                case 'activate':
                    await router.post('/admin/announcements/bulk-action', {
                        action: 'activate',
                        announcement_ids: selectedAnnouncements,
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            setSelectedAnnouncements([]);
                            toast.success(`${selectedAnnouncements.length} announcements activated successfully`);
                            router.reload({ only: ['announcements'] });
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
                            toast.success(`${selectedAnnouncements.length} announcements deactivated successfully`);
                            router.reload({ only: ['announcements'] });
                        },
                        onError: () => {
                            toast.error('Failed to deactivate announcements');
                        }
                    });
                    break;

                case 'export':
                    const exportData = selectedAnnouncementsData.map(announcement => ({
                        'Title': announcement.title || 'N/A',
                        'Type': announcement.type || 'N/A',
                        'Priority': PRIORITY_DISPLAY[announcement.priority as PriorityLevel] || 'Normal',
                        'Audience': announcement.audience_type || 'N/A',
                        'Status': announcement.status || 'N/A',
                        'Start Date': announcement.start_date || '',
                        'End Date': announcement.end_date || '',
                        'Created': announcement.created_at ? new Date(announcement.created_at).toLocaleDateString() : '',
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
                    a.download = `announcements-export-${new Date().toISOString().split('T')[0]}.csv`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                    
                    toast.success(`${selectedAnnouncements.length} announcements exported`);
                    setSelectedAnnouncements([]);
                    break;

                case 'print':
                    selectedAnnouncements.forEach(id => {
                        window.open(`/admin/announcements/${id}/print`, '_blank');
                    });
                    toast.success(`${selectedAnnouncements.length} announcement(s) opened for printing`);
                    setSelectedAnnouncements([]);
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

    const handleBulkDelete = async () => {
        setIsPerformingBulkAction(true);

        try {
            await router.post('/admin/announcements/bulk-action', {
                action: 'delete',
                announcement_ids: selectedAnnouncements,
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedAnnouncements([]);
                    setShowBulkDeleteDialog(false);
                    toast.success(`${selectedAnnouncements.length} announcements deleted successfully`);
                    router.reload({ only: ['announcements'] });
                },
                onError: () => {
                    toast.error('Failed to delete announcements');
                }
            });
        } catch (error) {
            console.error('Bulk delete error:', error);
            toast.error('An error occurred during the operation.');
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
                    router.reload({ only: ['announcements'] });
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
                router.reload({ only: ['announcements'] });
            },
            onError: () => {
                toast.error('Failed to update announcement status');
            }
        });
    };

    const handleClearSelection = () => {
        setSelectedAnnouncements([]);
        setIsSelectAll(false);
    };

    const handleCopySelectedData = () => {
        if (selectedAnnouncementsData.length === 0) {
            toast.error('No data to copy');
            return;
        }
        
        const data = selectedAnnouncementsData.map(announcement => ({
            'Title': announcement.title || 'N/A',
            'Type': announcement.type || 'N/A',
            'Priority': PRIORITY_DISPLAY[announcement.priority as PriorityLevel] || 'Normal',
            'Audience': announcement.audience_type || 'N/A',
            'Status': announcement.status || 'N/A',
            'Start Date': announcement.start_date,
            'End Date': announcement.end_date,
            'Created': announcementUtils.formatDate(announcement.created_at),
        }));
        
        const csv = [
            Object.keys(data[0]).join(','),
            ...data.map(row => Object.values(row).join(','))
        ].join('\n');
        
        navigator.clipboard.writeText(csv).then(() => {
            toast.success(`${selectedAnnouncementsData.length} records copied to clipboard`);
        }).catch(() => {
            toast.error('Failed to copy to clipboard');
        });
    };

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        
        router.get('/admin/announcements', {
            ...filtersState,
            search,
            priority: priorityFilter,
            audience_type: audienceTypeFilter,
            sort_by: sortByState,
            sort_order: sortOrderState,
            page: page
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['announcements']
        });
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
                    if (selectedAnnouncements.length > 0) {
                        setSelectedAnnouncements([]);
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
            if (e.key === 'Delete' && isBulkMode && selectedAnnouncements.length > 0) {
                e.preventDefault();
                setShowBulkDeleteDialog(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isBulkMode, selectedAnnouncements, isMobile]);

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

                    <AnnouncementsStats 
                        globalStats={stats}
                        filteredStats={filteredStats}
                        isLoading={isPerformingBulkAction}
                    />

                    <AnnouncementsFilters
                        search={search}
                        setSearch={handleSearchChange}
                        filtersState={filtersState}
                        updateFilter={updateFilter}
                        showAdvancedFilters={showAdvancedFilters}
                        setShowAdvancedFilters={setShowAdvancedFilters}
                        handleClearFilters={handleClearFilters}
                        hasActiveFilters={hasActiveFilters}
                        types={types}
                        priorities={priorities}
                        audienceTypes={audience_types}  
                        isMobile={isMobile}
                        totalItems={totalItems}
                        startIndex={startIndex}
                        endIndex={endIndex}
                        searchInputRef={searchInputRef}
                        isLoading={isPerformingBulkAction}
                        handleExport={() => handleBulkOperation('export')}
                        priorityFilter={priorityFilter}
                        setPriorityFilter={handlePriorityFilterChange}
                        audienceTypeFilter={audienceTypeFilter}
                        setAudienceTypeFilter={handleAudienceTypeChange}
                        dateRangePreset={dateRangePreset}
                        setDateRangePreset={setDateRangePreset}
                    />

                    <AnnouncementsContent
                        announcements={paginatedAnnouncements}
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
                        onPageChange={handlePageChange}
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
                        // sortBy={sortByState}
                        // sortOrder={sortOrderState}
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

            <AnnouncementsDialogs
                showBulkDeleteDialog={showBulkDeleteDialog}
                setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                isPerformingBulkAction={isPerformingBulkAction}
                selectedAnnouncements={selectedAnnouncements}
                handleBulkOperation={handleBulkDelete}
                selectionStats={selectionStats}
            />
        </AppLayout>
    );
}