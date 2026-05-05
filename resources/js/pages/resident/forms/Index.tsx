import { useState, useEffect, useMemo } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import ResidentLayout from '@/layouts/resident-app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, FileText, Download, Clock } from 'lucide-react';
import { CustomTabs } from '@/components/residentui/CustomTabs';
import { ModernFilterModal } from '@/components/residentui/modern-filter-modal';
import { ModernEmptyState } from '@/components/residentui/modern-empty-state';
import { ModernPagination } from '@/components/residentui/modern-pagination';
import { ModernLoadingOverlay } from '@/components/residentui/modern-loading-overlay';
import { ModernSelectionBanner } from '@/components/residentui/modern-selection-banner';
import { ModernFormCard } from '@/components/residentui/forms/modern-form-card';
import { ModernFormGridCard } from '@/components/residentui/forms/modern-form-grid-card';
import { ModernFormMobileListView } from '@/components/residentui/forms/modern-form-mobile-list-view';
import { ModernFormTable } from '@/components/residentui/forms/modern-form-table';
import { ModernFormFilters } from '@/components/residentui/forms/modern-form-filters';
import { MobileHeader } from '@/components/portal/forms/index/MobileHeader';
import { DesktopHeader } from '@/components/portal/forms/index/DesktopHeader';
import { TabHeader } from '@/components/portal/forms/index/TabHeader';
import { CollapsibleStats } from '@/components/portal/forms/index/CollapsibleStats';
import { DesktopStats } from '@/components/portal/forms/index/DesktopStats';
import { FilterModalContent } from '@/components/portal/forms/index/FilterModalContent';
import type { Form, PaginationData, Stats } from '@/types/portal/forms/form.types';
import {
    FORM_TABS,
    SORT_OPTIONS,
    getCategoryColor,
    getAgencyIcon,
    getFileTypeIcon,
    getFileTypeColor,
} from '@/components/residentui/forms/constants';
import {
    formatDate,
    formatDateTime,
    formatFileSize,
    truncateText,
    copyToClipboard,
} from '@/utils/portal/forms/form-utils';

interface PageProps {
    forms: PaginationData;
    stats: Stats;
    categories: string[];
    agencies: string[];
    error?: string;
    [key: string]: unknown;
}

type SortByValue = 'title' | 'download_count' | 'category' | 'issuing_agency' | 'created_at';
type SortOrderValue = 'asc' | 'desc';

export default function FormsIndex() {
    const { props } = usePage<PageProps>();

    const allForms: Form[] = props.forms?.data ?? [];

    const forms: PaginationData = props.forms ?? {
        data: [],
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
        from: 0,
        to: 0,
    };

    const stats: Stats = props.stats ?? {
        total: 0,
        active: 0,
        downloads: 0,
        categories_count: 0,
        agencies_count: 0,
        popular_categories: [],
        popular_agencies: [],
    };

    const categories: string[] = props.categories ?? [];
    const agencies: string[] = props.agencies ?? [];

    const [search, setSearch] = useState<string>('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [agencyFilter, setAgencyFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<SortByValue>('created_at');
    const [sortOrder, setSortOrder] = useState<SortOrderValue>('desc');
    const [activeTab, setActiveTab] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState<number>(1);

    const [loading] = useState<boolean>(false);
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [showStats, setShowStats] = useState<boolean>(true);
    const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);
    const [selectedForms, setSelectedForms] = useState<number[]>([]);
    const [isExporting, setIsExporting] = useState<boolean>(false);
    const [selectMode, setSelectMode] = useState<boolean>(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const itemsPerPage = 15;

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => {
            window.removeEventListener('resize', checkMobile);
        };
    }, []);

    // Tab counts computed from ALL forms (independent of current filter)
    const tabCounts = useMemo((): Record<string, number> => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        return {
            all: allForms.length,
            popular: allForms.filter((f) => (f.download_count ?? 0) > 0).length,
            recent: allForms.filter((f) => {
                if (!f.created_at) return false;
                const createdDate = new Date(f.created_at);
                return !isNaN(createdDate.getTime()) && createdDate >= thirtyDaysAgo;
            }).length,
        };
    }, [allForms]);

    const getStatusCountForTab = (status: string): number => {
        return tabCounts[status] ?? 0;
    };

    const filteredForms: Form[] = useMemo((): Form[] => {
        let filtered = [...allForms];

        if (activeTab === 'popular') {
            filtered = filtered.filter((form) => (form.download_count ?? 0) > 0);
        } else if (activeTab === 'recent') {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            filtered = filtered.filter((form) => {
                if (!form.created_at) return false;
                const createdDate = new Date(form.created_at);
                return !isNaN(createdDate.getTime()) && createdDate >= thirtyDaysAgo;
            });
        }

        if (search) {
            const query = search.toLowerCase();
            filtered = filtered.filter(
                (form) =>
                    form.title?.toLowerCase().includes(query) ||
                    form.description?.toLowerCase().includes(query) ||
                    form.category?.toLowerCase().includes(query) ||
                    form.issuing_agency?.toLowerCase().includes(query),
            );
        }

        if (categoryFilter !== 'all') {
            filtered = filtered.filter(
                (form) => form.category?.toLowerCase() === categoryFilter.toLowerCase(),
            );
        }

        if (agencyFilter !== 'all') {
            filtered = filtered.filter(
                (form) => form.issuing_agency?.toLowerCase() === agencyFilter.toLowerCase(),
            );
        }

        filtered.sort((a, b) => {
            let aValue: string | number;
            let bValue: string | number;

            switch (sortBy) {
                case 'title':
                    aValue = a.title?.toLowerCase() ?? '';
                    bValue = b.title?.toLowerCase() ?? '';
                    break;
                case 'download_count':
                    aValue = a.download_count ?? 0;
                    bValue = b.download_count ?? 0;
                    break;
                case 'category':
                    aValue = a.category?.toLowerCase() ?? '';
                    bValue = b.category?.toLowerCase() ?? '';
                    break;
                case 'issuing_agency':
                    aValue = a.issuing_agency?.toLowerCase() ?? '';
                    bValue = b.issuing_agency?.toLowerCase() ?? '';
                    break;
                case 'created_at':
                default:
                    aValue = a.created_at ? new Date(a.created_at).getTime() : 0;
                    bValue = b.created_at ? new Date(b.created_at).getTime() : 0;
                    break;
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
            }
            return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        });

        return filtered;
    }, [allForms, activeTab, search, categoryFilter, agencyFilter, sortBy, sortOrder]);

    const totalPages: number = Math.max(1, Math.ceil(filteredForms.length / itemsPerPage));
    const safeCurrentPage: number = Math.min(currentPage, totalPages);

    const paginatedForms: Form[] = useMemo(
        () => filteredForms.slice((safeCurrentPage - 1) * itemsPerPage, safeCurrentPage * itemsPerPage),
        [filteredForms, safeCurrentPage, itemsPerPage],
    );

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    const handleFilterChange = (filterType: string, value: string): void => {
        setCurrentPage(1);

        switch (filterType) {
            case 'tab':
                setActiveTab(value);
                if (value === 'popular') {
                    setSortBy('download_count');
                    setSortOrder('desc');
                } else if (value === 'recent') {
                    setSortBy('created_at');
                    setSortOrder('desc');
                } else {
                    setSortBy('created_at');
                    setSortOrder('desc');
                }
                break;
            case 'search':
                setSearch(value);
                break;
            case 'category':
                setCategoryFilter(value);
                break;
            case 'agency':
                setAgencyFilter(value);
                break;
            case 'sort':
                setSortBy(value as SortByValue);
                break;
        }

        setSelectedForms([]);
        setSelectMode(false);
        if (isMobile) setShowMobileFilters(false);
    };

    const handleSortOrderToggle = (): void => {
        setCurrentPage(1);
        setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    };

    const hasActiveFilters: boolean =
        search !== '' ||
        categoryFilter !== 'all' ||
        agencyFilter !== 'all' ||
        activeTab !== 'all';

    const clearFilters = (): void => {
        setSearch('');
        setCategoryFilter('all');
        setAgencyFilter('all');
        setSortBy('created_at');
        setSortOrder('desc');
        setActiveTab('all');
        setCurrentPage(1);
        setShowMobileFilters(false);
        setSelectedForms([]);
        setSelectMode(false);
    };

    const handleTabChange = (tab: string): void => {
        handleFilterChange('tab', tab);
    };

    const handleSearchSubmit = (e: React.FormEvent): void => {
        e.preventDefault();
    };

    const toggleSelectForm = (id: number): void => {
        setSelectedForms((prev) =>
            prev.includes(id) ? prev.filter((formId) => formId !== id) : [...prev, id],
        );
    };

    const selectAllForms = (): void => {
        if (paginatedForms.length === 0) return;

        if (selectedForms.length === paginatedForms.length) {
            setSelectedForms([]);
        } else {
            setSelectedForms(paginatedForms.map((f) => f.id));
        }
    };

    const toggleSelectMode = (): void => {
        if (selectMode) {
            setSelectMode(false);
            setSelectedForms([]);
        } else {
            setSelectMode(true);
        }
    };

    const handleDownloadSelected = (): void => {
        if (selectedForms.length === 0) return;
        toast.info(`Download functionality for ${selectedForms.length} form${selectedForms.length > 1 ? 's' : ''} would be implemented here`);
        setSelectedForms([]);
        setSelectMode(false);
    };

    const handleViewDetails = (id: number): void => {
        if (id) {
            window.location.href = `/portal/forms/${id}`;
        }
    };

    const handleDownloadForm = (form: Form): void => {
        if (form?.id) {
            window.location.href = `/portal/forms/${form.id}/download`;
        }
    };

    const handleCopyLink = (form: Form): void => {
        const url = `${window.location.origin}/portal/forms/${form.id}`;
        copyToClipboard(url, 'Link copied to clipboard');
    };

    const handleCopyTitle = (title: string): void => {
        copyToClipboard(title, 'Title copied to clipboard');
    };

    const handleGenerateReport = (form: Form): void => {
        const reportWindow = window.open('', '_blank');
        if (!reportWindow) {
            toast.error('Unable to open report. Please check pop-up blocker settings.');
            return;
        }

        const sanitizeHTML = (str: string): string =>
            str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

        reportWindow.document.write(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Form Details: ${sanitizeHTML(form.title ?? 'N/A')}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { color: #333; }
                    .detail { margin: 10px 0; }
                    .label { font-weight: bold; }
                </style>
            </head>
            <body>
                <h1>Form Details: ${sanitizeHTML(form.title ?? 'N/A')}</h1>
                <div class="detail"><span class="label">Category:</span> ${sanitizeHTML(form.category ?? 'N/A')}</div>
                <div class="detail"><span class="label">Agency:</span> ${sanitizeHTML(form.issuing_agency ?? 'N/A')}</div>
                <div class="detail"><span class="label">Description:</span> ${sanitizeHTML(form.description ?? 'N/A')}</div>
                <div class="detail"><span class="label">Downloads:</span> ${(form.download_count ?? 0).toLocaleString()}</div>
                <div class="detail"><span class="label">File Size:</span> ${sanitizeHTML(formatFileSize(form.file_size))}</div>
                <div class="detail"><span class="label">File Type:</span> ${sanitizeHTML(form.file_type ?? 'N/A')}</div>
                <div class="detail"><span class="label">Uploaded:</span> ${sanitizeHTML(formatDateTime(form.created_at ?? ''))}</div>
            </body>
            </html>
        `);
        reportWindow.document.close();
    };

    const handleReportIssue = (form: Form): void => {
        toast.info('Report issue feature would open a form');
    };

    const handlePrint = (): void => {
        toast.info('Print functionality would be implemented here');
    };

    const handleExport = (): void => {
        setIsExporting(true);
        setTimeout(() => {
            toast.info('Export functionality would be implemented here');
            setIsExporting(false);
        }, 1000);
    };

    const handleCopySummary = async (): Promise<void> => {
        const summary =
            `Forms Catalog Summary:\n\n` +
            `Total Forms: ${tabCounts.all}\n` +
            `Most Downloaded: ${tabCounts.popular}\n` +
            `Recently Added: ${tabCounts.recent}\n\n` +
            `Filtered Results: ${filteredForms.length}\n` +
            `Generated on: ${new Date().toLocaleDateString()}\n` +
            `View online: ${window.location.origin}/portal/forms`;

        await copyToClipboard(summary, 'Summary copied to clipboard');
    };

    const handleEmailSummary = (): void => {
        const subject = `Forms Catalog Summary - ${new Date().toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}`;
    };

    const formatNumber = (num: number): string => num.toLocaleString();

    const tabHasData: boolean = paginatedForms.length > 0;

    const displayTab: string =
        activeTab === 'all'
            ? 'All'
            : activeTab === 'popular'
              ? 'Most Downloaded'
              : 'Recently Added';

    const from: number = tabHasData ? (safeCurrentPage - 1) * itemsPerPage + 1 : 0;
    const to: number = tabHasData ? Math.min(safeCurrentPage * itemsPerPage, filteredForms.length) : 0;

    const getEmptyStateIcon = () => {
        const map: Record<string, React.ComponentType<{ className?: string }>> = {
            all: FileText,
            popular: Download,
            recent: Clock,
        };
        return map[activeTab] || FileText;
    };

    if (props.error) {
        return (
            <ResidentLayout
                breadcrumbs={[
                    { title: 'Dashboard', href: '/portal/dashboard' },
                    { title: 'Forms Catalog', href: '/portal/forms' },
                ]}
            >
                <Head title="Forms Catalog" />
                <div className="min-h-[50vh] flex items-center justify-center px-4">
                    <Card className="w-full max-w-md border-0 shadow-xl bg-white dark:bg-gray-900">
                        <CardContent className="pt-6 text-center">
                            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-2xl flex items-center justify-center mb-4">
                                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Error</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">{props.error}</p>
                            <Button
                                onClick={() => (window.location.href = '/portal/dashboard')}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                            >
                                Go to Dashboard
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </ResidentLayout>
        );
    }

    return (
        <>
            <Head title="Forms Catalog" />

            <ResidentLayout
                breadcrumbs={[
                    { title: 'Dashboard', href: '/portal/dashboard' },
                    { title: 'Forms Catalog', href: '/portal/forms' },
                ]}
            >
                <div className="space-y-4 md:space-y-6 pb-20 md:pb-6">
                    {isMobile ? (
                        <MobileHeader
                            statsTotal={tabCounts.all}
                            showStats={showStats}
                            setShowStats={setShowStats}
                            hasActiveFilters={hasActiveFilters}
                            setShowMobileFilters={setShowMobileFilters}
                        />
                    ) : (
                        <DesktopHeader
                            onPrint={handlePrint}
                            onExport={handleExport}
                            isExporting={isExporting}
                        />
                    )}

                    {showStats && (
                        <div className="animate-slide-down">
                            <CollapsibleStats
                                showStats={showStats}
                                setShowStats={setShowStats}
                                stats={stats}
                                formatNumber={formatNumber}
                            />
                            <DesktopStats stats={stats} formatNumber={formatNumber} />
                        </div>
                    )}

                    <ModernFilterModal
                        isOpen={showMobileFilters}
                        onClose={() => setShowMobileFilters(false)}
                        title="Filter Forms"
                        description={
                            hasActiveFilters ? 'Filters are currently active' : 'No filters applied'
                        }
                        search={search}
                        onSearchChange={(value) => handleFilterChange('search', value)}
                        onSearchSubmit={handleSearchSubmit}
                        onSearchClear={() => handleFilterChange('search', '')}
                        loading={loading}
                        hasActiveFilters={hasActiveFilters}
                        onClearFilters={clearFilters}
                    >
                        <FilterModalContent
                            categoryFilter={categoryFilter}
                            onCategoryChange={(category) => handleFilterChange('category', category)}
                            agencyFilter={agencyFilter}
                            onAgencyChange={(agency) => handleFilterChange('agency', agency)}
                            sortBy={sortBy}
                            onSortChange={(sort) => handleFilterChange('sort', sort)}
                            sortOrder={sortOrder}
                            onSortOrderChange={handleSortOrderToggle}
                            loading={loading}
                            categories={categories}
                            agencies={agencies}
                        />
                    </ModernFilterModal>

                    {!isMobile && (
                        <ModernFormFilters
                            search={search}
                            setSearch={(value) => handleFilterChange('search', value)}
                            handleSearchSubmit={handleSearchSubmit}
                            handleSearchClear={() => handleFilterChange('search', '')}
                            categoryFilter={categoryFilter}
                            handleCategoryChange={(category) =>
                                handleFilterChange('category', category)
                            }
                            agencyFilter={agencyFilter}
                            handleAgencyChange={(agency) => handleFilterChange('agency', agency)}
                            sortBy={sortBy}
                            handleSortChange={(sort) => handleFilterChange('sort', sort)}
                            sortOrder={sortOrder}
                            handleSortOrderToggle={handleSortOrderToggle}
                            loading={loading}
                            categories={categories}
                            agencies={agencies}
                            sortOptions={SORT_OPTIONS}
                            printForms={handlePrint}
                            exportToCSV={handleExport}
                            isExporting={isExporting}
                            hasActiveFilters={hasActiveFilters}
                            handleClearFilters={clearFilters}
                            onCopySummary={handleCopySummary}
                            onEmailSummary={handleEmailSummary}
                        />
                    )}

                    <div className="mt-4">
                        <CustomTabs
                            key="form-tabs"
                            statusFilter={activeTab}
                            handleTabChange={handleTabChange}
                            getStatusCount={getStatusCountForTab}
                            tabsConfig={FORM_TABS}
                        />

                        <div className="mt-4">
                            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
                                <CardContent className="p-4 md:p-6">
                                    {selectMode && tabHasData && (
                                        <ModernSelectionBanner
                                            selectedCount={selectedForms.length}
                                            totalCount={paginatedForms.length}
                                            onSelectAll={selectAllForms}
                                            onDeselectAll={() => setSelectedForms([])}
                                            onCancel={() => {
                                                setSelectMode(false);
                                                setSelectedForms([]);
                                            }}
                                            onDelete={handleDownloadSelected}
                                            deleteLabel="Download Selected"
                                        />
                                    )}

                                    <TabHeader
                                        displayStatus={displayTab}
                                        from={from}
                                        to={to}
                                        total={filteredForms.length}
                                        selectMode={selectMode}
                                        selectedCount={selectedForms.length}
                                        hasFilters={hasActiveFilters}
                                        viewMode={viewMode}
                                        setViewMode={setViewMode}
                                        sortBy={sortBy}
                                        sortOrder={sortOrder}
                                        onSortChange={(sort) => handleFilterChange('sort', sort)}
                                        onSortOrderToggle={handleSortOrderToggle}
                                        onToggleSelectMode={toggleSelectMode}
                                        tabHasData={tabHasData}
                                    />

                                    {!tabHasData ? (
                                        <ModernEmptyState
                                            status={activeTab}
                                            hasFilters={hasActiveFilters}
                                            onClearFilters={clearFilters}
                                            icon={getEmptyStateIcon()}
                                        />
                                    ) : isMobile ? (
                                        viewMode === 'grid' ? (
                                            <div className="pb-4 space-y-3">
                                                {paginatedForms.map((form) => (
                                                    <ModernFormCard
                                                        key={form.id}
                                                        form={form}
                                                        selectMode={selectMode}
                                                        selectedForms={selectedForms}
                                                        toggleSelectForm={toggleSelectForm}
                                                        formatDate={(date) => formatDate(date, true)}
                                                        formatFileSize={formatFileSize}
                                                        getCategoryColor={getCategoryColor}
                                                        getAgencyIcon={getAgencyIcon}
                                                        getFileTypeIcon={getFileTypeIcon}
                                                        getFileTypeColor={getFileTypeColor}
                                                        truncateText={truncateText}
                                                        onCopyLink={handleCopyLink}
                                                        onCopyTitle={handleCopyTitle}
                                                        onViewDetails={handleViewDetails}
                                                        onDownload={handleDownloadForm}
                                                        onGenerateReport={handleGenerateReport}
                                                        onReportIssue={handleReportIssue}
                                                        isMobile={true}
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <ModernFormMobileListView
                                                forms={paginatedForms}
                                                selectMode={selectMode}
                                                selectedForms={selectedForms}
                                                toggleSelectForm={toggleSelectForm}
                                                formatDate={(date) => formatDate(date, true)}
                                                formatDateTime={formatDateTime}
                                                formatFileSize={formatFileSize}
                                                getCategoryColor={getCategoryColor}
                                                getAgencyIcon={getAgencyIcon}
                                                getFileTypeIcon={getFileTypeIcon}
                                                getFileTypeColor={getFileTypeColor}
                                                truncateText={truncateText}
                                                onCopyLink={handleCopyLink}
                                                onCopyTitle={handleCopyTitle}
                                                onViewDetails={handleViewDetails}
                                                onDownload={handleDownloadForm}
                                                onGenerateReport={handleGenerateReport}
                                                onReportIssue={handleReportIssue}
                                            />
                                        )
                                    ) : viewMode === 'grid' ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {paginatedForms.map((form) => (
                                                <ModernFormGridCard
                                                    key={form.id}
                                                    form={form}
                                                    selectMode={selectMode}
                                                    selectedForms={selectedForms}
                                                    toggleSelectForm={toggleSelectForm}
                                                    formatDate={(date) => formatDate(date, true)}
                                                    formatFileSize={formatFileSize}
                                                    getCategoryColor={getCategoryColor}
                                                    getAgencyIcon={getAgencyIcon}
                                                    getFileTypeIcon={getFileTypeIcon}
                                                    getFileTypeColor={getFileTypeColor}
                                                    truncateText={truncateText}
                                                    onCopyLink={handleCopyLink}
                                                    onCopyTitle={handleCopyTitle}
                                                    onViewDetails={handleViewDetails}
                                                    onDownload={handleDownloadForm}
                                                    onGenerateReport={handleGenerateReport}
                                                    onReportIssue={handleReportIssue}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <ModernFormTable
                                            forms={paginatedForms}
                                            selectMode={selectMode}
                                            selectedForms={selectedForms}
                                            toggleSelectForm={toggleSelectForm}
                                            selectAllForms={selectAllForms}
                                            formatDate={formatDateTime}
                                            formatFileSize={formatFileSize}
                                            getCategoryColor={getCategoryColor}
                                            getAgencyIcon={getAgencyIcon}
                                            getFileTypeIcon={getFileTypeIcon}
                                            getFileTypeColor={getFileTypeColor}
                                            truncateText={truncateText}
                                            onCopyLink={handleCopyLink}
                                            onCopyTitle={handleCopyTitle}
                                            onViewDetails={handleViewDetails}
                                            onDownload={handleDownloadForm}
                                            onGenerateReport={handleGenerateReport}
                                            onReportIssue={handleReportIssue}
                                        />
                                    )}

                                    {totalPages > 1 && (
                                        <div className="mt-6">
                                            <ModernPagination
                                                currentPage={safeCurrentPage}
                                                lastPage={totalPages}
                                                onPageChange={setCurrentPage}
                                                loading={loading}
                                            />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

                <ModernLoadingOverlay loading={loading} message="Loading forms..." />
            </ResidentLayout>
        </>
    );
}