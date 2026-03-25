// /Pages/resident/Announcements/Index.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import ResidentLayout from '@/layouts/resident-app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, TrendingUp, Sparkles, Loader2, Megaphone } from 'lucide-react';

// Import components
import { ActionStatusAlert } from '@/components/portal/announcements/index/ActionStatusAlert';
import { StatsBadges } from '@/components/portal/announcements/index/StatsBadges';
import { FeaturedAnnouncement } from '@/components/portal/announcements/index/FeaturedAnnouncement';
import { AnnouncementCard } from '@/components/portal/announcements/index/AnnouncementCard';
import { FilterSheet } from '@/components/portal/announcements/index/FilterSheet';
import { DesktopFilters } from '@/components/portal/announcements/index/DesktopFilters';
import { ActiveFiltersIndicator } from '@/components/portal/announcements/index/ActiveFiltersIndicator';
import { SearchBar } from '@/components/portal/announcements/index/SearchBar';
import { ResultsSummary } from '@/components/portal/announcements/index/ResultsSummary';
import { ModernPagination } from '@/components/residentui/modern-pagination';
import { ModernEmptyState } from '@/components/residentui/modern-empty-state';
import { ModernLoadingOverlay } from '@/components/residentui/modern-loading-overlay';

// Import types and constants
import { Announcement, AnnouncementStats, AnnouncementFilters, AnnouncementsPaginatedResponse } from '@/types/portal/announcements/announcement.types';
import { ANNOUNCEMENT_TYPE_CONFIGS, PRIORITY_CONFIGS } from '@/components/portal/announcements/index/constants';

interface PageProps {
    announcements: AnnouncementsPaginatedResponse;
    featuredAnnouncement?: Announcement | null;
    filters: AnnouncementFilters;
    types: Record<string, string>;
    priorityOptions: Record<number, string>;
    statusOptions: Record<string, string>;
    stats: AnnouncementStats;
}

export default function AnnouncementsIndex({ 
    announcements: initialAnnouncements, 
    featuredAnnouncement,
    filters,
    types,
    priorityOptions,
    statusOptions,
    stats
}: PageProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedType, setSelectedType] = useState(filters.type || 'all');
    const [selectedPriority, setSelectedPriority] = useState(filters.priority || 'all');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);
    
    const [actionStatus, setActionStatus] = useState<{
        type: 'success' | 'error' | 'info' | null;
        message: string;
    }>({ type: null, message: '' });

    useEffect(() => {
        setMounted(true);
        
        const saved = localStorage.getItem('announcement_bookmarks');
        if (saved) {
            try {
                setBookmarkedIds(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse bookmarks', e);
            }
        }
    }, []);

    useEffect(() => {
        if (!mounted) return;
        
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, [mounted]);

    const applyFilters = () => {
        if (loading) return;
        
        setLoading(true);
        
        const params: Record<string, string> = {};
        if (selectedType !== 'all') params.type = selectedType;
        if (selectedPriority !== 'all') params.priority = selectedPriority;
        if (selectedStatus !== 'all') params.status = selectedStatus;
        
        router.get('/portal/announcements', params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onFinish: () => setLoading(false),
        });
    };

    const handleTypeChange = (value: string) => {
        setSelectedType(value);
        
        setLoading(true);
        
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (value !== 'all') params.type = value;
        if (selectedPriority !== 'all') params.priority = selectedPriority;
        if (selectedStatus !== 'all') params.status = selectedStatus;
        
        router.get('/portal/announcements', params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onFinish: () => setLoading(false),
        });
        
        setIsFilterSheetOpen(false);
    };

    const handlePriorityChange = (value: string) => {
        setSelectedPriority(value);
        
        setLoading(true);
        
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (selectedType !== 'all') params.type = selectedType;
        if (value !== 'all') params.priority = value;
        if (selectedStatus !== 'all') params.status = selectedStatus;
        
        router.get('/portal/announcements', params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onFinish: () => setLoading(false),
        });
        
        setIsFilterSheetOpen(false);
    };

    const handleStatusChange = (value: string) => {
        setSelectedStatus(value);
        
        setLoading(true);
        
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (selectedType !== 'all') params.type = selectedType;
        if (selectedPriority !== 'all') params.priority = selectedPriority;
        if (value !== 'all') params.status = value;
        
        router.get('/portal/announcements', params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onFinish: () => setLoading(false),
        });
        
        setIsFilterSheetOpen(false);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters();
    };

    const handleSearchClear = () => {
        setSearch('');
        
        const params: Record<string, string> = {};
        if (selectedType !== 'all') params.type = selectedType;
        if (selectedPriority !== 'all') params.priority = selectedPriority;
        if (selectedStatus !== 'all') params.status = selectedStatus;
        
        router.get('/portal/announcements', params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
        
        setActionStatus({ type: 'info', message: 'Search cleared' });
        setTimeout(() => setActionStatus({ type: null, message: '' }), 3000);
    };

    const clearFilters = () => {
        setSearch('');
        setSelectedType('all');
        setSelectedPriority('all');
        setSelectedStatus('all');
        
        router.get('/portal/announcements', {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
        
        setActionStatus({ type: 'success', message: 'All filters cleared' });
        setTimeout(() => setActionStatus({ type: null, message: '' }), 3000);
        setIsFilterSheetOpen(false);
    };

    const toggleBookmark = (id: number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        let newBookmarks: number[];
        if (bookmarkedIds.includes(id)) {
            newBookmarks = bookmarkedIds.filter(bookmarkId => bookmarkId !== id);
            setActionStatus({ type: 'info', message: 'Bookmark removed' });
        } else {
            newBookmarks = [...bookmarkedIds, id];
            setActionStatus({ type: 'success', message: 'Bookmark added' });
        }
        
        setBookmarkedIds(newBookmarks);
        localStorage.setItem('announcement_bookmarks', JSON.stringify(newBookmarks));
        setTimeout(() => setActionStatus({ type: null, message: '' }), 2000);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: diffDays > 365 ? 'numeric' : undefined
        });
    };

    const truncateContent = (content: string, maxLength: number = 120) => {
        if (!content) return '';
        const strippedContent = content.replace(/<[^>]*>/g, '');
        if (strippedContent.length <= maxLength) return strippedContent;
        return strippedContent.substring(0, maxLength) + '...';
    };

    const hasActiveFilters = useMemo(() => {
        return selectedType !== 'all' || selectedPriority !== 'all' || selectedStatus !== 'all';
    }, [selectedType, selectedPriority, selectedStatus]);

    if (!mounted) {
        return (
            <ResidentLayout
                breadcrumbs={[
                    { title: 'Dashboard', href: '/portal/dashboard' },
                    { title: 'Announcements', href: '#' }
                ]}
            >
                <Head title="Announcements" />
                <div className="min-h-[50vh] flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">Loading...</p>
                    </div>
                </div>
            </ResidentLayout>
        );
    }

    return (
        <ResidentLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/portal/dashboard' },
                { title: 'Announcements', href: '#' }
            ]}
        >
            <Head title="Announcements" />
            
            <ActionStatusAlert type={actionStatus.type} message={actionStatus.message} />
            
            <div className="space-y-4 sm:space-y-6 pb-4 sm:pb-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-0">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="h-5 w-5 text-primary dark:text-primary-400" />
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate dark:text-white">
                                Announcements
                            </h1>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            Stay updated with community news
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <StatsBadges stats={stats} />
                        
                        {isMobile && (
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setIsFilterSheetOpen(true)}
                                className="relative dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                            >
                                <Filter className="h-4 w-4 mr-2" />
                                Filters
                                {hasActiveFilters && (
                                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full" />
                                )}
                            </Button>
                        )}
                        
                        <Badge variant="outline" className="text-sm px-3 py-1.5 bg-white dark:bg-gray-900 shadow-sm dark:border-gray-700">
                            <TrendingUp className="h-3 w-3 mr-1.5 text-gray-600 dark:text-gray-400" />
                            <span className="dark:text-gray-300">{initialAnnouncements.total} Total</span>
                        </Badge>
                    </div>
                </div>

                {/* Search Bar */}
                <SearchBar
                    value={search}
                    onChange={setSearch}
                    onSubmit={handleSearchSubmit}
                    onClear={handleSearchClear}
                    loading={loading}
                />

                {/* Featured Announcement */}
                {featuredAnnouncement && !hasActiveFilters && (
                    <div className="px-4 sm:px-0">
                        <FeaturedAnnouncement announcement={featuredAnnouncement} />
                    </div>
                )}

                {/* Filters */}
                {!isMobile && (
                    <DesktopFilters
                        selectedType={selectedType}
                        selectedPriority={selectedPriority}
                        selectedStatus={selectedStatus}
                        types={types}
                        priorityOptions={priorityOptions}
                        statusOptions={statusOptions}
                        onTypeChange={handleTypeChange}
                        onPriorityChange={handlePriorityChange}
                        onStatusChange={handleStatusChange}
                        loading={loading}
                    />
                )}

                {/* Active Filters Indicator */}
                <ActiveFiltersIndicator
                    selectedType={selectedType}
                    selectedPriority={selectedPriority}
                    selectedStatus={selectedStatus}
                    types={types}
                    priorityOptions={priorityOptions}
                    statusOptions={statusOptions}
                    onTypeChange={handleTypeChange}
                    onPriorityChange={handlePriorityChange}
                    onStatusChange={handleStatusChange}
                    onClearFilters={clearFilters}
                    loading={loading}
                />

                {/* Results Summary */}
                <ResultsSummary
                    total={initialAnnouncements.total}
                    from={initialAnnouncements.from}
                    to={initialAnnouncements.to}
                    selectedType={selectedType}
                    types={types}
                    personalizedCount={stats.personalized}
                />

                {/* Announcements Grid */}
                <div className="px-4 sm:px-0">
                    {initialAnnouncements.data.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                                {initialAnnouncements.data.map((announcement) => (
                                    <AnnouncementCard
                                        key={announcement.id}
                                        announcement={announcement}
                                        isBookmarked={bookmarkedIds.includes(announcement.id)}
                                        onBookmark={toggleBookmark}
                                        formatDate={formatDate}
                                        truncateContent={truncateContent}
                                    />
                                ))}
                            </div>
                            
                            {initialAnnouncements.last_page > 1 && (
                                <div className="mt-6 pt-6 border-t dark:border-gray-800">
                                    <ModernPagination
                                        currentPage={initialAnnouncements.current_page}
                                        lastPage={initialAnnouncements.last_page}
                                        onPageChange={(page) => {
                                            const params: Record<string, string> = {};
                                            if (search) params.search = search;
                                            if (selectedType !== 'all') params.type = selectedType;
                                            if (selectedPriority !== 'all') params.priority = selectedPriority;
                                            if (selectedStatus !== 'all') params.status = selectedStatus;
                                            params.page = page.toString();
                                            
                                            router.get('/portal/announcements', params, {
                                                preserveState: true,
                                                preserveScroll: true,
                                            });
                                        }}
                                        loading={loading}
                                    />
                                </div>
                            )}
                        </>
                    ) : (
                        <ModernEmptyState
                            status={hasActiveFilters ? 'filtered' : 'all'}
                            hasFilters={hasActiveFilters}
                            onClearFilters={clearFilters}
                            icon={Megaphone}
                        />
                    )}
                </div>
            </div>

            {/* Mobile Filter Sheet */}
            <FilterSheet
                isOpen={isFilterSheetOpen}
                onOpenChange={setIsFilterSheetOpen}
                selectedType={selectedType}
                selectedPriority={selectedPriority}
                selectedStatus={selectedStatus}
                types={types}
                priorityOptions={priorityOptions}
                statusOptions={statusOptions}
                onTypeChange={handleTypeChange}
                onPriorityChange={handlePriorityChange}
                onStatusChange={handleStatusChange}
                onClearFilters={clearFilters}
                hasActiveFilters={hasActiveFilters}
            />

            <ModernLoadingOverlay loading={loading} message="Loading announcements..." />
        </ResidentLayout>
    );
}