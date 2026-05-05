import { useState, useEffect, useMemo } from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import { toast } from 'sonner';
import ResidentLayout from '@/layouts/resident-app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, FileText, Clock, Loader2, TrendingUp, CheckCircle, XCircle, Plus } from 'lucide-react';
import { ModernFilterModal } from '@/components/residentui/modern-filter-modal';
import { ModernEmptyState } from '@/components/residentui/modern-empty-state';
import { ModernPagination } from '@/components/residentui/modern-pagination';
import { ModernLoadingOverlay } from '@/components/residentui/modern-loading-overlay';
import { ModernSelectionBanner } from '@/components/residentui/modern-selection-banner';
import { ReportTabs, REPORT_TABS_CONFIG } from '@/components/portal/community-report/index/report-tabs';
import { formatDate, copyToClipboard, printReportsList, exportReportsToCSV } from '@/components/residentui/reports/report-utils';
import { ModernReportCard } from '@/components/residentui/reports/modern-report-card';
import { ModernReportGridCard } from '@/components/residentui/reports/modern-report-grid-card';
import { ModernReportMobileListView } from '@/components/residentui/reports/modern-report-mobile-list-view';
import { ModernReportFilters } from '@/components/residentui/reports/modern-report-filters';
import { ModernReportTable } from '@/components/residentui/reports/modern-report-table';
import { MobileHeader } from '@/components/portal/community-report/index/MobileHeader';
import { DesktopHeader } from '@/components/portal/community-report/index/DesktopHeader';
import { TabHeader } from '@/components/portal/community-report/index/TabHeader';
import { CollapsibleStats } from '@/components/portal/community-report/index/CollapsibleStats';
import { DesktopStats } from '@/components/portal/community-report/index/DesktopStats';
import { FilterModalContent } from '@/components/portal/community-report/index/FilterModalContent';
import ResidentMobileFooter from '@/layouts/resident-mobile-sticky-footer';
import type { CommunityReport, ReportStats } from '@/types/portal/reports/community-report';

interface PageProps {
    reports?: {
        data: CommunityReport[];
    };
    stats?: ReportStats;
    filterOptions?: {
        reportTypes: Array<{ id: number; name: string; category?: string }>;
        categories: string[];
        statuses?: string[];
        priorities?: string[];
    };
    currentResident?: {
        id: number;
        first_name: string;
        last_name: string;
    };
    error?: string;
    [key: string]: unknown;
}

type StatusFilterValue = 'pending' | 'under_review' | 'in_progress' | 'resolved' | 'rejected' | 'all';
type UrgencyFilterValue = 'low' | 'medium' | 'high' | 'critical' | 'all';

interface TabCounts {
    all: number;
    pending: number;
    under_review: number;
    in_progress: number;
    resolved: number;
    rejected: number;
}

function transformToReportForPrint(report: CommunityReport): CommunityReport {
    return {
        ...report,
        incident_time: report.incident_time ?? undefined,
    };
}

export default function CommunityReports() {
    const { props } = usePage<PageProps>();

    const allReports: CommunityReport[] = props.reports?.data ?? [];

    const stats: ReportStats = props.stats ?? {
        total: 0,
        resolved: 0,
        pending: 0,
        under_review: 0,
        in_progress: 0,
        rejected: 0,
    };

    const filterOptions = props.filterOptions ?? {
        reportTypes: [],
        categories: [],
    };

    const currentResident = props.currentResident ?? {
        id: 0,
        first_name: '',
        last_name: '',
    };

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('all');
    const [urgencyFilter, setUrgencyFilter] = useState<UrgencyFilterValue>('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [loading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [showStats, setShowStats] = useState(true);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [selectedReports, setSelectedReports] = useState<number[]>([]);
    const [isExporting, setIsExporting] = useState(false);
    const [selectMode, setSelectMode] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

    const filteredReports = useMemo((): CommunityReport[] => {
        let filtered = [...allReports];

        if (statusFilter !== 'all') {
            filtered = filtered.filter((report) => report.status === statusFilter);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (report) =>
                    report.report_number?.toLowerCase().includes(query) ||
                    report.title?.toLowerCase().includes(query) ||
                    report.description?.toLowerCase().includes(query) ||
                    report.location?.toLowerCase().includes(query),
            );
        }

        if (urgencyFilter !== 'all') {
            filtered = filtered.filter(
                (report) => report.urgency?.toLowerCase() === urgencyFilter.toLowerCase(),
            );
        }

        if (typeFilter !== 'all') {
            filtered = filtered.filter(
                (report) => report.report_type_id?.toString() === typeFilter,
            );
        }

        if (categoryFilter !== 'all') {
            filtered = filtered.filter(
                (report) =>
                    report.report_type?.category?.toLowerCase() ===
                    categoryFilter.toLowerCase(),
            );
        }

        filtered.sort((a, b) => {
            const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return dateB - dateA;
        });

        return filtered;
    }, [allReports, statusFilter, searchQuery, urgencyFilter, typeFilter, categoryFilter]);

    const tabCounts: TabCounts = useMemo((): TabCounts => {
        if (allReports.length === 0) {
            return {
                all: 0,
                pending: 0,
                under_review: 0,
                in_progress: 0,
                resolved: 0,
                rejected: 0,
            };
        }

        return {
            all: allReports.length,
            pending: allReports.filter((r) => r.status === 'pending').length,
            under_review: allReports.filter((r) => r.status === 'under_review').length,
            in_progress: allReports.filter((r) => r.status === 'in_progress').length,
            resolved: allReports.filter((r) => r.status === 'resolved').length,
            rejected: allReports.filter((r) => r.status === 'rejected').length,
        };
    }, [allReports]);

    const itemsPerPage = 15;
    const totalPages = Math.max(1, Math.ceil(filteredReports.length / itemsPerPage));
    const safeCurrentPage = Math.min(currentPage, totalPages);

    const paginatedReports = useMemo((): CommunityReport[] => {
        const start = (safeCurrentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredReports.slice(start, end);
    }, [filteredReports, safeCurrentPage, itemsPerPage]);

    const handleFilterChange = (filterType: string, value: string): void => {
        setCurrentPage(1);

        switch (filterType) {
            case 'status':
                setStatusFilter(value as StatusFilterValue);
                break;
            case 'search':
                setSearchQuery(value);
                break;
            case 'urgency':
                setUrgencyFilter(value as UrgencyFilterValue);
                break;
            case 'type':
                setTypeFilter(value);
                break;
            case 'category':
                setCategoryFilter(value);
                break;
        }

        setSelectedReports([]);
        setSelectMode(false);
    };

    const hasActiveFilters =
        statusFilter !== 'all' ||
        searchQuery !== '' ||
        urgencyFilter !== 'all' ||
        typeFilter !== 'all' ||
        categoryFilter !== 'all';

    const clearFilters = (): void => {
        setStatusFilter('all');
        setSearchQuery('');
        setUrgencyFilter('all');
        setTypeFilter('all');
        setCategoryFilter('all');
        setCurrentPage(1);
        setShowMobileFilters(false);
        setSelectedReports([]);
        setSelectMode(false);
    };

    const handleTabChange = (tab: string): void => {
        handleFilterChange('status', tab);
    };

    const toggleSelectReport = (id: number): void => {
        setSelectedReports((prev) =>
            prev.includes(id)
                ? prev.filter((reportId) => reportId !== id)
                : [...prev, id],
        );
    };

    const selectAllReports = (): void => {
        if (paginatedReports.length === 0) {
            return;
        }

        if (selectedReports.length === paginatedReports.length) {
            setSelectedReports([]);
        } else {
            setSelectedReports(paginatedReports.map((r) => r.id));
        }
    };

    const toggleSelectMode = (): void => {
        if (selectMode) {
            setSelectMode(false);
            setSelectedReports([]);
        } else {
            setSelectMode(true);
        }
    };

    const handleDeleteSelected = (): void => {
        if (selectedReports.length === 0) {
            return;
        }

        if (
            confirm(
                `Are you sure you want to delete ${selectedReports.length} selected report${selectedReports.length > 1 ? 's' : ''}?`,
            )
        ) {
            toast.success(`Deleted ${selectedReports.length} report${selectedReports.length > 1 ? 's' : ''}`);
            setSelectedReports([]);
            setSelectMode(false);
        }
    };

    const handleViewDetails = (id: number): void => {
        window.location.href = `/portal/community-reports/${id}`;
    };

    const handleCopyReportNumber = (reportNumber: string): void => {
        copyToClipboard(reportNumber, `Copied: ${reportNumber}`);
    };

    const handleGenerateReport = (report: CommunityReport): void => {
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
                <title>Report: ${sanitizeHTML(report.report_number ?? 'N/A')}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
                    h1 { color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px; }
                    .detail { margin: 12px 0; }
                    .label { font-weight: bold; color: #555; }
                    .value { color: #333; }
                </style>
            </head>
            <body>
                <h1>Community Report Details</h1>
                <div class="detail"><span class="label">Report Number:</span> ${sanitizeHTML(report.report_number ?? 'N/A')}</div>
                <div class="detail"><span class="label">Title:</span> ${sanitizeHTML(report.title ?? 'N/A')}</div>
                <div class="detail"><span class="label">Type:</span> ${sanitizeHTML(report.report_type?.name ?? 'N/A')}</div>
                <div class="detail"><span class="label">Category:</span> ${sanitizeHTML(report.report_type?.category ?? 'N/A')}</div>
                <div class="detail"><span class="label">Status:</span> ${sanitizeHTML(report.status ?? 'N/A')}</div>
                <div class="detail"><span class="label">Urgency:</span> ${sanitizeHTML(report.urgency ?? 'N/A')}</div>
                <div class="detail"><span class="label">Location:</span> ${sanitizeHTML(report.location ?? 'N/A')}</div>
                <div class="detail"><span class="label">Description:</span> ${sanitizeHTML(report.description ?? 'N/A')}</div>
                <div class="detail"><span class="label">Date Filed:</span> ${formatDate(report.created_at ?? '', false)}</div>
                <div class="detail"><span class="label">Incident Date:</span> ${formatDate(report.incident_date ?? '', false)}</div>
                ${report.incident_time ? `<div class="detail"><span class="label">Incident Time:</span> ${sanitizeHTML(report.incident_time)}</div>` : ''}
                ${report.resolved_at ? `<div class="detail"><span class="label">Resolved:</span> ${formatDate(report.resolved_at, false)}</div>` : ''}
                <div class="detail"><span class="label">Evidence Files:</span> ${report.evidences_count ?? 0}</div>
                <div class="detail"><span class="label">Anonymous:</span> ${report.is_anonymous ? 'Yes' : 'No'}</div>
            </body>
            </html>
        `);
        reportWindow.document.close();
    };

    const handlePrint = (): void => {
        if (filteredReports.length === 0) {
            toast.error('No reports to print');
            return;
        }

        const transformedReports = filteredReports.map(transformToReportForPrint);
        printReportsList(transformedReports, statusFilter, currentResident, (date: string) =>
            formatDate(date, false),
        );
    };

    const handleExport = (): void => {
        if (filteredReports.length === 0) {
            toast.error('No reports to export');
            return;
        }

        const transformedReports = filteredReports.map(transformToReportForPrint);
        exportReportsToCSV(
            transformedReports,
            statusFilter,
            (date: string) => formatDate(date, false),
            setIsExporting,
            toast,
        );
    };

    const handleCopySummary = async (): Promise<void> => {
        const summary =
            `Community Reports Summary:\n\n` +
            `Resident: ${currentResident.first_name || ''} ${currentResident.last_name || ''}\n\n` +
            `Total Reports: ${tabCounts.all}\n` +
            `Pending: ${tabCounts.pending}\n` +
            `Under Review: ${tabCounts.under_review}\n` +
            `In Progress: ${tabCounts.in_progress}\n` +
            `Resolved: ${tabCounts.resolved}\n` +
            `Rejected: ${tabCounts.rejected}\n\n` +
            `Generated on: ${new Date().toLocaleDateString()}\n` +
            `View online: ${window.location.origin}/portal/community-reports`;

        await copyToClipboard(summary, 'Summary copied to clipboard');
    };

    const tabHasData = paginatedReports.length > 0;

    const displayStatus =
        statusFilter !== 'all'
            ? statusFilter.split('_').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
            : 'All';

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    if (props.error) {
        return (
            <ResidentLayout
                breadcrumbs={[
                    { title: 'Dashboard', href: '/portal/dashboard' },
                    { title: 'Community Reports', href: '/portal/community-reports' },
                ]}
            >
                <Head title="Community Reports" />
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
            <Head title="Community Reports" />

            <ResidentLayout
                breadcrumbs={[
                    { title: 'Dashboard', href: '/portal/dashboard' },
                    { title: 'Community Reports', href: '/portal/community-reports' },
                ]}
            >
                <div className="space-y-4 md:space-y-6 pb-28 md:pb-6">
                    {isMobile ? (
                        <MobileHeader
                            statsTotal={filteredReports.length}
                            showStats={showStats}
                            setShowStats={setShowStats}
                            hasActiveFilters={hasActiveFilters}
                            setShowMobileFilters={setShowMobileFilters}
                        />
                    ) : (
                        <DesktopHeader onPrint={handlePrint} onExport={handleExport} isExporting={isExporting} />
                    )}

                    {showStats && (
                        <div className="animate-slide-down">
                            <CollapsibleStats
                                showStats={showStats}
                                setShowStats={setShowStats}
                                stats={stats}
                                tabCounts={tabCounts}
                                getStatusCount={(status: string | number) =>
                                    tabCounts[String(status) as keyof TabCounts] ?? 0
                                }
                            />
                            <DesktopStats stats={stats} tabCounts={tabCounts} />
                        </div>
                    )}

                    <ModernFilterModal
                        isOpen={showMobileFilters}
                        onClose={() => setShowMobileFilters(false)}
                        title="Filter Community Reports"
                        description={
                            hasActiveFilters ? 'Filters are currently active' : 'No filters applied'
                        }
                        search={searchQuery}
                        onSearchChange={(value) => setSearchQuery(value)}
                        onSearchSubmit={(e) => {
                            e.preventDefault();
                            handleFilterChange('search', searchQuery);
                            setShowMobileFilters(false);
                        }}
                        onSearchClear={() => handleFilterChange('search', '')}
                        loading={loading}
                        hasActiveFilters={hasActiveFilters}
                        onClearFilters={clearFilters}
                    >
                        <FilterModalContent
                            statusFilter={statusFilter}
                            onStatusChange={(status) => handleFilterChange('status', status)}
                            urgencyFilter={urgencyFilter}
                            onUrgencyChange={(urgency) => handleFilterChange('urgency', urgency)}
                            categoryFilter={categoryFilter}
                            onCategoryChange={(category) => handleFilterChange('category', category)}
                            typeFilter={typeFilter}
                            onTypeChange={(type) => handleFilterChange('type', type)}
                            loading={loading}
                            filterOptions={filterOptions}
                        />
                    </ModernFilterModal>

                    {!isMobile && (
                        <ModernReportFilters
                            search={searchQuery}
                            setSearch={(value) => handleFilterChange('search', value)}
                            handleSearchSubmit={(e) => {
                                e.preventDefault();
                            }}
                            handleSearchClear={() => handleFilterChange('search', '')}
                            statusFilter={statusFilter}
                            handleStatusChange={(status) => handleFilterChange('status', status)}
                            urgencyFilter={urgencyFilter}
                            handleUrgencyChange={(urgency) => handleFilterChange('urgency', urgency)}
                            typeFilter={typeFilter}
                            handleTypeChange={(type) => handleFilterChange('type', type)}
                            categoryFilter={categoryFilter}
                            handleCategoryChange={(category) => handleFilterChange('category', category)}
                            loading={loading}
                            filterOptions={filterOptions}
                            printReports={handlePrint}
                            exportToCSV={handleExport}
                            isExporting={isExporting}
                            hasActiveFilters={hasActiveFilters}
                            handleClearFilters={clearFilters}
                            onCopySummary={handleCopySummary}
                            tabCounts={tabCounts}
                        />
                    )}

                    <div className="mt-4">
                        <ReportTabs
                            statusFilter={statusFilter}
                            handleTabChange={handleTabChange}
                            tabCounts={tabCounts}
                            tabsConfig={REPORT_TABS_CONFIG}
                        />

                        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 mt-4">
                            <CardContent className="p-4 md:p-6">
                                {selectMode && tabHasData && (
                                    <ModernSelectionBanner
                                        selectedCount={selectedReports.length}
                                        totalCount={paginatedReports.length}
                                        onSelectAll={selectAllReports}
                                        onDeselectAll={() => setSelectedReports([])}
                                        onCancel={() => {
                                            setSelectMode(false);
                                            setSelectedReports([]);
                                        }}
                                        onDelete={handleDeleteSelected}
                                        deleteLabel="Delete Selected"
                                    />
                                )}

                                <TabHeader
                                    displayStatus={displayStatus}
                                    from={(safeCurrentPage - 1) * itemsPerPage + 1}
                                    to={Math.min(safeCurrentPage * itemsPerPage, filteredReports.length)}
                                    total={filteredReports.length}
                                    selectMode={selectMode}
                                    selectedCount={selectedReports.length}
                                    hasFilters={hasActiveFilters}
                                    viewMode={viewMode}
                                    setViewMode={setViewMode}
                                    onToggleSelectMode={toggleSelectMode}
                                    tabHasData={tabHasData}
                                />

                                {!tabHasData ? (
                                    <ModernEmptyState
                                        status={statusFilter}
                                        hasFilters={hasActiveFilters}
                                        onClearFilters={clearFilters}
                                        icon={
                                            statusFilter === 'all'
                                                ? FileText
                                                : statusFilter === 'pending'
                                                  ? Clock
                                                  : statusFilter === 'under_review'
                                                    ? Loader2
                                                    : statusFilter === 'in_progress'
                                                      ? TrendingUp
                                                      : statusFilter === 'resolved'
                                                        ? CheckCircle
                                                        : XCircle
                                        }
                                    />
                                ) : (
                                    <>
                                        {isMobile
                                            ? viewMode === 'grid'
                                                ? paginatedReports.map((report) => (
                                                      <div key={report.id} className="pb-4 space-y-3">
                                                          <ModernReportCard
                                                              report={report}
                                                              selectMode={selectMode}
                                                              selectedReports={selectedReports}
                                                              toggleSelectReport={toggleSelectReport}
                                                              formatDate={(date: string) => formatDate(date, true)}
                                                              onViewDetails={handleViewDetails}
                                                              onCopyReportNumber={handleCopyReportNumber}
                                                              onGenerateReport={handleGenerateReport}
                                                              isMobile={true}
                                                          />
                                                      </div>
                                                  ))
                                                : <ModernReportMobileListView
                                                      reports={paginatedReports}
                                                      selectMode={selectMode}
                                                      selectedReports={selectedReports}
                                                      toggleSelectReport={toggleSelectReport}
                                                      formatDate={(date: string) => formatDate(date, true)}
                                                      onViewDetails={handleViewDetails}
                                                      onCopyReportNumber={handleCopyReportNumber}
                                                      onGenerateReport={handleGenerateReport}
                                                  />
                                            : viewMode === 'grid'
                                              ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {paginatedReports.map((report) => (
                                                        <ModernReportGridCard
                                                            key={report.id}
                                                            report={report}
                                                            selectMode={selectMode}
                                                            selectedReports={selectedReports}
                                                            toggleSelectReport={toggleSelectReport}
                                                            formatDate={(date: string) => formatDate(date, false)}
                                                            onViewDetails={handleViewDetails}
                                                            onCopyReportNumber={handleCopyReportNumber}
                                                            onGenerateReport={handleGenerateReport}
                                                        />
                                                    ))}
                                                </div>
                                              : <ModernReportTable
                                                    reports={paginatedReports}
                                                    selectMode={selectMode}
                                                    selectedReports={selectedReports}
                                                    toggleSelectReport={toggleSelectReport}
                                                    selectAllReports={selectAllReports}
                                                    formatDate={(date: string) => formatDate(date, false)}
                                                    onViewDetails={handleViewDetails}
                                                    onCopyReportNumber={handleCopyReportNumber}
                                                    onGenerateReport={handleGenerateReport}
                                                />
                                        }

                                        {totalPages > 1 && (
                                            <div className="mt-6">
                                                <ModernPagination
                                                    currentPage={safeCurrentPage}
                                                    lastPage={totalPages}
                                                    onPageChange={(page: number) => setCurrentPage(page)}
                                                    loading={loading}
                                                />
                                            </div>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {isMobile && !showMobileFilters && (
                    <div className="fixed bottom-20 right-6 z-50 animate-scale-in">
                        <Link href="/portal/community-reports/create">
                            <Button
                                size="lg"
                                className="rounded-full h-14 w-14 shadow-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                            >
                                <Plus className="h-6 w-6" />
                            </Button>
                        </Link>
                    </div>
                )}

                <div className="md:hidden">
                    <ResidentMobileFooter />
                </div>

                <ModernLoadingOverlay loading={loading} message="Loading reports..." />
            </ResidentLayout>
        </>
    );
}