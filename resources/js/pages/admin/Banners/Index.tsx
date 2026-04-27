// pages/admin/banners/index.tsx

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import AppLayout from '@/layouts/admin-app-layout';
import { TooltipProvider } from '@/components/ui/tooltip';

// Import AdminUI components
import BannersHeader from '@/components/admin/banners/BannersHeader';
import BannersStats from '@/components/admin/banners/BannersStats';
import BannersFilters from '@/components/admin/banners/BannersFilters';
import BannersContent from '@/components/admin/banners/BannersContent';
import BannersDialogs from '@/components/admin/banners/BannersDialogs';
import { Button } from '@/components/ui/button';
import { KeyRound } from 'lucide-react';

interface Banner {
    id: number;
    title: string;
    description: string | null;
    image_url: string;
    mobile_image_url: string;
    link_url: string | null;
    button_text: string;
    sort_order: number;
    is_active: boolean;
    start_date: string | null;
    end_date: string | null;
    target_audience: string;
    status: 'active' | 'scheduled' | 'expired' | 'inactive';
    is_currently_active: boolean;
    creator?: {
        first_name: string;
        last_name: string;
    };
    created_at: string;
}

interface PaginationData {
    data: Banner[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
    from: number | null;
    to: number | null;
    links?: any[];
}

interface BannerFilters {
    search?: string;
    status?: string;
    audience?: string;
    date_from?: string;
    date_to?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

interface BannersPageProps {
    banners: PaginationData;
    filters: BannerFilters;
    stats: {
        total: number;
        active: number;
        scheduled: number;
        expired: number;
        inactive: number;
    };
}

const defaultStats = {
    total: 0,
    active: 0,
    scheduled: 0,
    expired: 0,
    inactive: 0
};

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
    return 'desc';
};

export default function BannersIndex({ 
    banners, 
    filters, 
    stats = defaultStats
}: BannersPageProps) {
    const { flash } = usePage().props as any;
    
    // Safe data extraction
    const safeBanners = banners || { data: [], current_page: 1, last_page: 1, total: 0, per_page: 10, from: 0, to: 0 };
    const allBanners = safeBanners.data || [];
    const safeFilters = filters || {};
    
    // Filter states - all client-side
    const [search, setSearch] = useState<string>(getSafeString(safeFilters.search));
    const [statusFilter, setStatusFilter] = useState<string>(getSafeString(safeFilters.status, 'all'));
    const [audienceFilter, setAudienceFilter] = useState<string>(getSafeString(safeFilters.audience, 'all'));
    const [dateFrom, setDateFrom] = useState<string>(getSafeString(safeFilters.date_from));
    const [dateTo, setDateTo] = useState<string>(getSafeString(safeFilters.date_to));
    const [sortBy, setSortBy] = useState<string>(getSafeString(safeFilters.sort_by, 'sort_order'));
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(getSafeSortOrder(safeFilters.sort_order));
    
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    
    // Bulk selection states
    const [selectedBanners, setSelectedBanners] = useState<number[]>([]);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [isSelectAll, setIsSelectAll] = useState(false);
    const [selectionMode, setSelectionMode] = useState<'page' | 'filtered' | 'all'>('page');
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
    const [showBulkStatusDialog, setShowBulkStatusDialog] = useState(false);
    const [showBulkAudienceDialog, setShowBulkAudienceDialog] = useState(false);
    const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false);
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

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter, audienceFilter, dateFrom, dateTo, sortBy, sortOrder]);

    // Reset selection when exiting bulk mode
    useEffect(() => {
        if (!isBulkMode) {
            setSelectedBanners([]);
            setIsSelectAll(false);
        }
    }, [isBulkMode]);

    // Filter banners client-side
    const filteredBanners = useMemo(() => {
        if (!allBanners || allBanners.length === 0) {
            return [];
        }
        
        let filtered = [...allBanners];
        
        // Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(banner =>
                banner?.title?.toLowerCase().includes(searchLower) ||
                banner?.description?.toLowerCase().includes(searchLower) ||
                banner?.button_text?.toLowerCase().includes(searchLower)
            );
        }
        
        // Status filter
        if (statusFilter && statusFilter !== 'all') {
            filtered = filtered.filter(banner => banner?.status === statusFilter);
        }
        
        // Audience filter
        if (audienceFilter && audienceFilter !== 'all') {
            filtered = filtered.filter(banner => banner?.target_audience === audienceFilter);
        }
        
        // Date range filter
        if (dateFrom) {
            const fromDate = new Date(dateFrom);
            filtered = filtered.filter(banner => {
                if (!banner.start_date && !banner.end_date) return true;
                const startDate = banner.start_date ? new Date(banner.start_date) : null;
                return startDate ? startDate >= fromDate : true;
            });
        }
        
        if (dateTo) {
            const toDate = new Date(dateTo);
            filtered = filtered.filter(banner => {
                if (!banner.start_date && !banner.end_date) return true;
                const endDate = banner.end_date ? new Date(banner.end_date) : null;
                return endDate ? endDate <= toDate : true;
            });
        }
        
        // Apply sorting
        if (filtered.length > 0) {
            filtered.sort((a, b) => {
                let valueA: any;
                let valueB: any;
                
                switch (sortBy) {
                    case 'title':
                        valueA = a?.title || '';
                        valueB = b?.title || '';
                        break;
                    case 'sort_order':
                        valueA = a?.sort_order || 0;
                        valueB = b?.sort_order || 0;
                        break;
                    case 'status':
                        valueA = a?.status || '';
                        valueB = b?.status || '';
                        break;
                    case 'created_at':
                        valueA = a?.created_at ? new Date(a.created_at).getTime() : 0;
                        valueB = b?.created_at ? new Date(b.created_at).getTime() : 0;
                        break;
                    case 'start_date':
                        valueA = a?.start_date ? new Date(a.start_date).getTime() : 0;
                        valueB = b?.start_date ? new Date(b.start_date).getTime() : 0;
                        break;
                    case 'end_date':
                        valueA = a?.end_date ? new Date(a.end_date).getTime() : Infinity;
                        valueB = b?.end_date ? new Date(b.end_date).getTime() : Infinity;
                        break;
                    default:
                        valueA = a?.sort_order || 0;
                        valueB = b?.sort_order || 0;
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
    }, [allBanners, search, statusFilter, audienceFilter, dateFrom, dateTo, sortBy, sortOrder]);

    // Calculate filtered stats
    const filteredStats = useMemo(() => {
        if (!filteredBanners || filteredBanners.length === 0) {
            return {
                total: 0,
                active: 0,
                scheduled: 0,
                expired: 0,
                inactive: 0
            };
        }
        
        return {
            total: filteredBanners.length,
            active: filteredBanners.filter(b => b?.status === 'active').length,
            scheduled: filteredBanners.filter(b => b?.status === 'scheduled').length,
            expired: filteredBanners.filter(b => b?.status === 'expired').length,
            inactive: filteredBanners.filter(b => b?.status === 'inactive').length,
        };
    }, [filteredBanners]);

    // Pagination
    const totalItems = filteredBanners.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedBanners = filteredBanners.slice(startIndex, endIndex);

    // Selection handlers
    const handleSelectAllOnPage = useCallback(() => {
        const pageIds = paginatedBanners.map(banner => banner.id);
        if (isSelectAll) {
            setSelectedBanners(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedBanners, ...pageIds])];
            setSelectedBanners(newSelected);
        }
        setIsSelectAll(!isSelectAll);
        setSelectionMode('page');
    }, [paginatedBanners, isSelectAll, selectedBanners]);

    const handleSelectAllFiltered = useCallback(() => {
        const allIds = filteredBanners.map(banner => banner.id);
        if (selectedBanners.length === allIds.length && allIds.every(id => selectedBanners.includes(id))) {
            setSelectedBanners(prev => prev.filter(id => !allIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedBanners, ...allIds])];
            setSelectedBanners(newSelected);
            setSelectionMode('filtered');
        }
    }, [filteredBanners, selectedBanners]);

    const handleSelectAll = useCallback(() => {
        if (confirm(`This will select ALL ${totalItems} banners. This action may take a moment.`)) {
            const allIds = filteredBanners.map(banner => banner.id);
            setSelectedBanners(allIds);
            setSelectionMode('all');
        }
    }, [filteredBanners, totalItems]);

    const handleItemSelect = useCallback((id: number) => {
        setSelectedBanners(prev => {
            if (prev.includes(id)) {
                return prev.filter(itemId => itemId !== id);
            } else {
                return [...prev, id];
            }
        });
    }, []);

    // Check if all items on current page are selected
    useEffect(() => {
        const allPageIds = paginatedBanners.map(banner => banner.id);
        const allSelected = allPageIds.length > 0 && allPageIds.every(id => selectedBanners.includes(id));
        setIsSelectAll(allSelected);
    }, [selectedBanners, paginatedBanners]);

    // Get selected banners data
    const selectedBannersData = useMemo(() => {
        return filteredBanners.filter(banner => selectedBanners.includes(banner.id));
    }, [selectedBanners, filteredBanners]);

    // Calculate selection stats
    const selectionStats = useMemo(() => {
        const total = selectedBannersData.length;
        const active = selectedBannersData.filter(b => b.status === 'active').length;
        const scheduled = selectedBannersData.filter(b => b.status === 'scheduled').length;
        const expired = selectedBannersData.filter(b => b.status === 'expired').length;
        const inactive = selectedBannersData.filter(b => b.status === 'inactive').length;
        
        return {
            total,
            active,
            scheduled,
            expired,
            inactive
        };
    }, [selectedBannersData]);

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
    const handleBulkOperation = async (operation: string) => {
        if (selectedBanners.length === 0) {
            toast.error('Please select at least one banner');
            return;
        }

        setIsPerformingBulkAction(true);

        try {
            switch (operation) {
                case 'delete':
                    setShowBulkDeleteDialog(true);
                    break;

                case 'update_status':
                    setShowBulkStatusDialog(true);
                    break;

                case 'update_audience':
                    setShowBulkAudienceDialog(true);
                    break;

                case 'export':
                case 'export_csv':
                    const exportData = selectedBannersData.map(banner => ({
                        'Title': banner.title,
                        'Description': banner.description || '',
                        'Button Text': banner.button_text,
                        'Link URL': banner.link_url || '',
                        'Sort Order': banner.sort_order,
                        'Status': banner.status,
                        'Audience': banner.target_audience,
                        'Start Date': banner.start_date || '',
                        'End Date': banner.end_date || '',
                        'Created At': new Date(banner.created_at).toLocaleDateString(),
                    }));
                    
                    const headers = Object.keys(exportData[0]);
                    const csv = [
                        headers.join(','),
                        ...exportData.map(row => 
                            headers.map(header => {
                                const value = row[header as keyof typeof row];
                                return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
                                    ? `"${value.replace(/"/g, '""')}"` 
                                    : value;
                            }).join(',')
                        )
                    ].join('\n');
                    
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `banners-export-${new Date().toISOString().split('T')[0]}.csv`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                    
                    toast.success(`${selectedBanners.length} banners exported successfully`);
                    setSelectedBanners([]);
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

    const handleBulkStatusUpdate = async () => {
        if (!bulkEditValue) {
            toast.error('Please select a status');
            return;
        }
        
        setIsPerformingBulkAction(true);

        try {
            await router.post('/admin/banners/bulk-action', {
                action: 'update_status',
                banner_ids: selectedBanners,
                status: bulkEditValue
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedBanners([]);
                    setBulkEditValue('');
                    setShowBulkStatusDialog(false);
                    toast.success(`${selectedBanners.length} banner statuses updated successfully`);
                    router.reload({ only: ['banners'] });
                },
                onError: () => {
                    toast.error('Failed to update banner status');
                }
            });
        } catch (error) {
            console.error('Bulk status update error:', error);
            toast.error('An error occurred during the operation.');
        } finally {
            setIsPerformingBulkAction(false);
        }
    };

    const handleBulkAudienceUpdate = async () => {
        if (!bulkEditValue) {
            toast.error('Please select an audience');
            return;
        }
        
        setIsPerformingBulkAction(true);

        try {
            await router.post('/admin/banners/bulk-action', {
                action: 'update_audience',
                banner_ids: selectedBanners,
                target_audience: bulkEditValue
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedBanners([]);
                    setBulkEditValue('');
                    setShowBulkAudienceDialog(false);
                    toast.success(`${selectedBanners.length} banner audiences updated successfully`);
                    router.reload({ only: ['banners'] });
                },
                onError: () => {
                    toast.error('Failed to update banner audience');
                }
            });
        } catch (error) {
            console.error('Bulk audience update error:', error);
            toast.error('An error occurred during the operation.');
        } finally {
            setIsPerformingBulkAction(false);
        }
    };

    const handleBulkDelete = async () => {
        setIsPerformingBulkAction(true);

        try {
            await router.post('/admin/banners/bulk-action', {
                action: 'delete',
                banner_ids: selectedBanners,
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedBanners([]);
                    setShowBulkDeleteDialog(false);
                    toast.success(`${selectedBanners.length} banners deleted successfully`);
                    router.reload({ only: ['banners'] });
                },
                onError: () => {
                    toast.error('Failed to delete banners');
                }
            });
        } catch (error) {
            console.error('Bulk delete error:', error);
            toast.error('An error occurred during the operation.');
        } finally {
            setIsPerformingBulkAction(false);
        }
    };

    // Individual banner operations
    const handleDelete = (banner: Banner) => {
        if (confirm(`Are you sure you want to delete banner "${banner.title || 'Untitled'}"?`)) {
            router.delete(`/admin/banners/${banner.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedBanners(selectedBanners.filter(id => id !== banner.id));
                    toast.success('Banner deleted successfully');
                    router.reload({ only: ['banners'] });
                },
                onError: () => {
                    toast.error('Failed to delete banner');
                }
            });
        }
    };

    const handleToggleActive = (banner: Banner) => {
        router.post(`/admin/banners/${banner.id}/toggle`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(banner.is_active ? 'Banner deactivated' : 'Banner activated');
                router.reload({ only: ['banners'] });
            },
            onError: () => {
                toast.error('Failed to toggle banner status');
            }
        });
    };

    const handleSort = useCallback((column: string) => {
        const newSortOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortBy(column);
        setSortOrder(newSortOrder);
    }, [sortBy, sortOrder]);

    const handleClearFilters = useCallback(() => {
        setSearch('');
        setStatusFilter('all');
        setAudienceFilter('all');
        setDateFrom('');
        setDateTo('');
        setSortBy('sort_order');
        setSortOrder('desc');
        setCurrentPage(1);
    }, []);

    const handleClearSelection = useCallback(() => {
        setSelectedBanners([]);
        setIsSelectAll(false);
    }, []);

    const handleCopySelectedData = useCallback(() => {
        if (selectedBannersData.length === 0) {
            toast.error('No data to copy');
            return;
        }
        
        const data = selectedBannersData.map(banner => ({
            'Title': banner.title || 'N/A',
            'Description': banner.description || 'N/A',
            'Button Text': banner.button_text,
            'Link URL': banner.link_url || 'N/A',
            'Sort Order': banner.sort_order,
            'Status': banner.status,
            'Audience': banner.target_audience,
        }));
        
        const csvData = [
            Object.keys(data[0]).join(','),
            ...data.map(row => Object.values(row).join(','))
        ].join('\n');
        
        navigator.clipboard.writeText(csvData).then(() => {
            toast.success(`${selectedBannersData.length} records copied to clipboard`);
        }).catch(() => {
            toast.error('Failed to copy to clipboard');
        });
    }, [selectedBannersData]);

    const updateFilter = useCallback((key: keyof BannerFilters, value: string) => {
        switch (key) {
            case 'status':
                setStatusFilter(value);
                break;
            case 'audience':
                setAudienceFilter(value);
                break;
            case 'date_from':
                setDateFrom(value);
                break;
            case 'date_to':
                setDateTo(value);
                break;
            case 'sort_by':
                setSortBy(value);
                break;
            case 'sort_order':
                setSortOrder(value as 'asc' | 'desc');
                break;
        }
        setCurrentPage(1);
    }, []);

    const hasActiveFilters = Boolean(
        search || 
        (statusFilter && statusFilter !== 'all') ||
        (audienceFilter && audienceFilter !== 'all') ||
        dateFrom ||
        dateTo
    );

    // Create filters object for the Filters component
    const filtersStateForComponent: BannerFilters = {
        status: statusFilter,
        audience: audienceFilter,
        date_from: dateFrom,
        date_to: dateTo,
        sort_by: sortBy,
        sort_order: sortOrder
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
                    if (selectedBanners.length > 0) {
                        setSelectedBanners([]);
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
            if (e.key === 'Delete' && isBulkMode && selectedBanners.length > 0) {
                e.preventDefault();
                setShowBulkDeleteDialog(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isBulkMode, selectedBanners, isMobile]);

    return (
        <AppLayout
            title="Banner Management"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Banners', href: '/admin/banners' }
            ]}
        >
            <TooltipProvider>
                <div className="space-y-4 sm:space-y-6">
                    <BannersHeader 
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isMobile={isMobile}
                    />

                    <BannersStats 
                        globalStats={stats}
                        filteredStats={filteredStats}
                        isLoading={isPerformingBulkAction}
                    />

                    <BannersFilters
                        search={search}
                        setSearch={setSearch}
                        onSearchChange={(value: string) => {
                            setSearch(value);
                        }}
                        filtersState={filtersStateForComponent}
                        updateFilter={updateFilter}
                        showAdvancedFilters={showAdvancedFilters}
                        setShowAdvancedFilters={setShowAdvancedFilters}
                        handleClearFilters={handleClearFilters}
                        hasActiveFilters={hasActiveFilters}
                        isMobile={isMobile}
                        totalItems={totalItems}
                        startIndex={startIndex}
                        endIndex={endIndex}
                        searchInputRef={searchInputRef}
                        isLoading={isPerformingBulkAction}
                    />
                    
                    <BannersContent
                        banners={paginatedBanners}
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isSelectAll={isSelectAll}
                        selectedBanners={selectedBanners}
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
                        onToggleActive={handleToggleActive}
                        onSort={handleSort}
                        onBulkOperation={handleBulkOperation}
                        onCopySelectedData={handleCopySelectedData}
                        setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                        setShowBulkStatusDialog={setShowBulkStatusDialog}
                        filtersState={filtersStateForComponent}
                        isPerformingBulkAction={isPerformingBulkAction}
                        selectionMode={selectionMode}
                        selectionStats={selectionStats}
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
                                <div className="flex items-center gap-1">
                                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Ctrl+F</kbd>
                                    <span>Focus search</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </TooltipProvider>

            <BannersDialogs
                showBulkDeleteDialog={showBulkDeleteDialog}
                setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                showBulkStatusDialog={showBulkStatusDialog}
                setShowBulkStatusDialog={setShowBulkStatusDialog}
                showBulkAudienceDialog={showBulkAudienceDialog}
                setShowBulkAudienceDialog={setShowBulkAudienceDialog}
                isPerformingBulkAction={isPerformingBulkAction}
                selectedBanners={selectedBanners}
                handleBulkOperation={handleBulkDelete}
                handleBulkStatusUpdate={handleBulkStatusUpdate}
                handleBulkAudienceUpdate={handleBulkAudienceUpdate}
                selectionStats={selectionStats}
                bulkEditValue={bulkEditValue}
                setBulkEditValue={setBulkEditValue}
            />
        </AppLayout>
    );
}