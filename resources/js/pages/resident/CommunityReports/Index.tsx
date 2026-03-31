// /Pages/resident/CommunityReports.tsx
import { useState, useEffect, useMemo, useRef } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import { toast } from 'sonner';
import ResidentLayout from '@/layouts/resident-app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, FileText, Clock, Loader2, TrendingUp, CheckCircle, XCircle, Plus } from 'lucide-react';

// Reusable Components
import { CustomTabs } from '@/components/residentui/CustomTabs';
import { ModernFilterModal } from '@/components/residentui/modern-filter-modal';
import { ModernEmptyState } from '@/components/residentui/modern-empty-state';
import { ModernPagination } from '@/components/residentui/modern-pagination';
import { ModernLoadingOverlay } from '@/components/residentui/modern-loading-overlay';
import { ModernSelectionBanner } from '@/components/residentui/modern-selection-banner';

// Report-specific components
import { REPORT_TABS, getReportStatsCards } from '@/components/residentui/reports/constants';
import { formatDate, getStatusCount, copyToClipboard, printReportsList, exportReportsToCSV } from '@/components/residentui/reports/report-utils';
import { ModernReportCard } from '@/components/residentui/reports/modern-report-card';
import { ModernReportGridCard } from '@/components/residentui/reports/modern-report-grid-card';
import { ModernReportFilters } from '@/components/residentui/reports/modern-report-filters';
import { ModernReportTable } from '@/components/residentui/reports/modern-report-table';
import { MobileHeader } from '@/components/portal/clearance/index/MobileHeader';
import { DesktopHeader } from '@/components/portal/clearance/index/DesktopHeader';
import { TabHeader } from '@/components/portal/clearance/index/TabHeader';
import { CollapsibleStats } from '@/components/portal/clearance/index/CollapsibleStats';
import { DesktopStats } from '@/components/portal/clearance/index/DesktopStats';
import { MobileViewModeToggle } from '@/components/residentui/reports/MobileViewModeToggle';
import { FilterModalContent } from '@/components/portal/clearance/index/FilterModalContent';
import ResidentMobileFooter from '@/layouts/resident-mobile-sticky-footer';

// Types
import { CommunityReport, ReportStats, FilterOptions, ReportFilters, PaginatedReports } from '@/types/portal/reports/community-report';

// Helper function for formatting currency (even if not used, to satisfy props)
const formatCurrency = (amount: number | string) => {
    if (typeof amount === 'string') amount = parseFloat(amount);
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
};

interface PageProps extends Record<string, any> {
    reports?: PaginatedReports;
    stats?: ReportStats;
    filterOptions?: FilterOptions;
    currentResident?: { id: number; first_name: string; last_name: string };
    filters?: ReportFilters;
    error?: string;
}

// Type transformation function to convert CommunityReport to ReportForPrint
// This handles the type mismatch where incident_time is string | null in CommunityReport
// but ReportForPrint expects string | undefined
const transformToReportForPrint = (report: CommunityReport) => {
    return {
        ...report,
        incident_time: report.incident_time ?? undefined, // Convert null to undefined
    };
};

export default function CommunityReports() {
    const page = usePage<PageProps>();
    const pageProps = page.props;
    
    const reports = pageProps.reports || {
        data: [],
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
        from: 0,
        to: 0,
        links: [],
    };
    
    const stats = pageProps.stats || {
        total: 0,
        resolved: 0,
        pending: 0,
        under_review: 0,
        in_progress: 0,
        rejected: 0,
    };
    
    const filterOptions = pageProps.filterOptions || {
        reportTypes: [],
        categories: [],
        statuses: [],
        priorities: [],
    };
    
    const currentResident = pageProps.currentResident || { id: 0, first_name: '', last_name: '' };
    const filters = pageProps.filters || {};
    
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>(filters.status || 'all');
    const [urgencyFilter, setUrgencyFilter] = useState<string>(filters.priority || 'all');
    const [typeFilter, setTypeFilter] = useState<string>(filters.type || 'all');
    const [categoryFilter, setCategoryFilter] = useState<string>(filters.category || 'all');
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [showStats, setShowStats] = useState(true);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [selectedReports, setSelectedReports] = useState<number[]>([]);
    const [isExporting, setIsExporting] = useState(false);
    const [selectMode, setSelectMode] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    
    const hasInitialized = useRef(false);
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);
    
    // Check if mobile on mount and resize
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) {
                setViewMode('grid');
            }
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    
    // Initialize filters from props
    useEffect(() => {
        if (!hasInitialized.current) {
            setSearch(filters.search || '');
            setStatusFilter(filters.status || 'all');
            setUrgencyFilter(filters.priority || 'all');
            setTypeFilter(filters.type || 'all');
            setCategoryFilter(filters.category || 'all');
            hasInitialized.current = true;
        }
    }, [filters]);
    
    // Search debounce
    useEffect(() => {
        if (!hasInitialized.current) return;
        if (search === '' && !filters.search) return;
        if (search === filters.search) return;
        
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }
        
        searchTimeout.current = setTimeout(() => {
            updateFilters({ 
                search: search.trim(),
                page: '1'
            });
        }, 800);
        
        return () => {
            if (searchTimeout.current) {
                clearTimeout(searchTimeout.current);
            }
        };
    }, [search]);
    
    const updateFilters = (newFilters: Record<string, string>) => {
        setLoading(true);
        
        const updatedFilters = {
            ...filters,
            ...newFilters,
        };
        
        const cleanFilters: Record<string, string> = {};
        
        Object.entries(updatedFilters).forEach(([key, value]) => {
            if (key === 'page' && value === '1') return;
            if (value && value !== '' && value !== 'all' && value !== undefined) {
                cleanFilters[key] = String(value);
            }
        });
        
        router.get('/portal/community-reports', cleanFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onFinish: () => setLoading(false),
        });
    };
    
    const handleTabChange = (tab: string) => {
        setStatusFilter(tab);
        
        if (tab === 'all') {
            updateFilters({ status: '', page: '1' });
        } else {
            updateFilters({ status: tab, page: '1' });
        }
        
        if (isMobile) setShowMobileFilters(false);
    };
    
    const handleStatusChange = (status: string) => {
        setStatusFilter(status);
        updateFilters({ status: status === 'all' ? '' : status, page: '1' });
        if (isMobile) setShowMobileFilters(false);
    };
    
    const handleUrgencyChange = (urgency: string) => {
        setUrgencyFilter(urgency);
        updateFilters({ priority: urgency === 'all' ? '' : urgency, page: '1' });
        if (isMobile) setShowMobileFilters(false);
    };
    
    const handleTypeChange = (type: string) => {
        setTypeFilter(type);
        updateFilters({ type: type === 'all' ? '' : type, page: '1' });
        if (isMobile) setShowMobileFilters(false);
    };
    
    const handleCategoryChange = (category: string) => {
        setCategoryFilter(category);
        updateFilters({ category: category === 'all' ? '' : category, page: '1' });
        if (isMobile) setShowMobileFilters(false);
    };
    
    const handleClearFilters = () => {
        setSearch('');
        setStatusFilter('all');
        setUrgencyFilter('all');
        setTypeFilter('all');
        setCategoryFilter('all');
        
        router.get('/portal/community-reports', {}, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setLoading(false),
        });
        
        if (isMobile) setShowMobileFilters(false);
    };
    
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }
        updateFilters({ search: search.trim(), page: '1' });
    };
    
    const handleSearchClear = () => {
        setSearch('');
        updateFilters({ search: '', page: '1' });
    };
    
    const toggleSelectReport = (id: number) => {
        setSelectedReports(prev =>
            prev.includes(id) ? prev.filter(reportId => reportId !== id) : [...prev, id]
        );
    };
    
    const selectAllReports = () => {
        const currentReports = reports.data;
        if (selectedReports.length === currentReports.length && currentReports.length > 0) {
            setSelectedReports([]);
        } else {
            setSelectedReports(currentReports.map(r => r.id));
        }
    };
    
    const toggleSelectMode = () => {
        if (selectMode) {
            setSelectMode(false);
            setSelectedReports([]);
        } else {
            setSelectMode(true);
        }
    };
    
    const handleDeleteSelected = () => {
        if (confirm(`Are you sure you want to delete ${selectedReports.length} selected reports?`)) {
            toast.success(`Deleted ${selectedReports.length} reports`);
            setSelectedReports([]);
            setSelectMode(false);
        }
    };
    
    const handleViewDetails = (id: number) => {
        router.visit(`/portal/community-reports/${id}`);
    };
    
    const handleCopyReportNumber = (reportNumber: string) => {
        copyToClipboard(reportNumber, `Copied: ${reportNumber}`);
    };
    
    const handleGenerateReport = (report: CommunityReport) => {
        const reportWindow = window.open('', '_blank');
        if (reportWindow) {
            reportWindow.document.write(`
                <h1>Report Details: ${report.report_number}</h1>
                <p><strong>Title:</strong> ${report.title}</p>
                <p><strong>Type:</strong> ${report.report_type.name}</p>
                <p><strong>Category:</strong> ${report.report_type.category}</p>
                <p><strong>Status:</strong> ${report.status}</p>
                <p><strong>Urgency:</strong> ${report.urgency}</p>
                <p><strong>Location:</strong> ${report.location}</p>
                <p><strong>Description:</strong> ${report.description}</p>
                <p><strong>Date Filed:</strong> ${formatDate(report.created_at, false)}</p>
                <p><strong>Incident Date:</strong> ${formatDate(report.incident_date, false)}</p>
                ${report.incident_time ? `<p><strong>Incident Time:</strong> ${report.incident_time}</p>` : ''}
                ${report.resolved_at ? `<p><strong>Resolved:</strong> ${formatDate(report.resolved_at, false)}</p>` : ''}
                <p><strong>Evidence Files:</strong> ${report.evidences_count || 0}</p>
                <p><strong>Anonymous:</strong> ${report.is_anonymous ? 'Yes' : 'No'}</p>
            `);
        }
    };
    
    const getCurrentTabReports = () => reports.data;
    
    const hasActiveFilters = useMemo(() => {
        return Object.entries(filters).some(([key, value]) => 
            key !== 'page' && value && value !== '' && value !== 'all'
        );
    }, [filters]);
    
    // Fixed handlePrint with type transformation
    const handlePrint = () => {
        const transformedReports = reports.data.map(transformToReportForPrint);
        printReportsList(
            transformedReports,
            statusFilter,
            currentResident,
            (date: string) => formatDate(date, false)
        );
    };
    
    // Fixed handleExport with type transformation
    const handleExport = () => {
        const transformedReports = reports.data.map(transformToReportForPrint);
        exportReportsToCSV(
            transformedReports,
            statusFilter,
            (date: string) => formatDate(date, false),
            setIsExporting,
            toast
        );
    };
    
    const handleCopySummary = async () => {
        const summary = `Community Reports Summary:\n\n` +
            `Resident: ${currentResident?.first_name || ''} ${currentResident?.last_name || ''}\n\n` +
            `Total Reports: ${reports.data.length}\n` +
            `Pending: ${reports.data.filter(r => r.status === 'pending').length}\n` +
            `Under Review: ${reports.data.filter(r => r.status === 'under_review').length}\n` +
            `In Progress: ${reports.data.filter(r => r.status === 'in_progress').length}\n` +
            `Resolved: ${reports.data.filter(r => r.status === 'resolved').length}\n` +
            `Rejected: ${reports.data.filter(r => r.status === 'rejected').length}\n\n` +
            `Generated on: ${new Date().toLocaleDateString()}\n` +
            `View online: ${window.location.origin}/community-reports`;
        
        await copyToClipboard(summary, 'Summary copied to clipboard');
    };
    
    const handlePageChange = (page: number) => {
        updateFilters({ page: page.toString() });
    };
    
    const renderTabContent = () => {
        const currentReports = getCurrentTabReports();
        const tabHasData = currentReports.length > 0;
        
        const displayStatus = statusFilter === 'all' ? 'All' : statusFilter.replace('_', ' ');
        
        return (
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
                <CardContent className="p-4 md:p-6">
                    <ModernSelectionBanner
                        selectedCount={selectedReports.length}
                        totalCount={currentReports.length}
                        onSelectAll={selectAllReports}
                        onDeselectAll={() => setSelectedReports([])}
                        onCancel={() => {
                            setSelectMode(false);
                            setSelectedReports([]);
                        }}
                        onDelete={handleDeleteSelected}
                        deleteLabel="Delete Selected"
                    />
                    
                    <TabHeader
                        displayStatus={displayStatus}
                        count={currentReports.length}
                        selectMode={selectMode}
                        selectedCount={selectedReports.length}
                        hasFilters={typeFilter !== 'all' || urgencyFilter !== 'all' || categoryFilter !== 'all' || !!search}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        onToggleSelectMode={toggleSelectMode}
                        tabHasData={tabHasData}
                    />
                        
                        {!tabHasData ? (
                            <ModernEmptyState
                                status={statusFilter}
                                hasFilters={hasActiveFilters}
                                onClearFilters={handleClearFilters}
                                icon={statusFilter === 'all' ? AlertCircle : 
                                      statusFilter === 'pending' ? Clock :
                                      statusFilter === 'under_review' ? Loader2 :
                                      statusFilter === 'in_progress' ? TrendingUp :
                                      statusFilter === 'resolved' ? CheckCircle :
                                      statusFilter === 'rejected' ? XCircle : AlertCircle}
                            />
                        ) : (
                            <>
                                {isMobile && tabHasData && !selectMode && (
                                    <MobileViewModeToggle
                                        viewMode={viewMode}
                                        setViewMode={setViewMode}
                                        onToggleSelectMode={toggleSelectMode}
                                    />
                                )}
                                
                                {viewMode === 'grid' && (
                                    <>
                                        {isMobile && (
                                            <div className="pb-4">
                                                {currentReports.map((report) => (
                                                    <ModernReportCard
                                                        key={report.id}
                                                        report={report}
                                                        selectMode={selectMode}
                                                        selectedReports={selectedReports}
                                                        toggleSelectReport={toggleSelectReport}
                                                        formatDate={(date) => formatDate(date, isMobile)}
                                                        onViewDetails={handleViewDetails}
                                                        onCopyReportNumber={handleCopyReportNumber}
                                                        onGenerateReport={handleGenerateReport}
                                                        isMobile={isMobile}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                        
                                        {!isMobile && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {currentReports.map((report) => (
                                                    <ModernReportGridCard
                                                        key={report.id}
                                                        report={report}
                                                        selectMode={selectMode}
                                                        selectedReports={selectedReports}
                                                        toggleSelectReport={toggleSelectReport}
                                                        formatDate={(date) => formatDate(date, isMobile)}
                                                        onViewDetails={handleViewDetails}
                                                        onCopyReportNumber={handleCopyReportNumber}
                                                        onGenerateReport={handleGenerateReport}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                                
                                {viewMode === 'list' && !isMobile && (
                                    <ModernReportTable
                                        reports={currentReports}
                                        selectMode={selectMode}
                                        selectedReports={selectedReports}
                                        toggleSelectReport={toggleSelectReport}
                                        selectAllReports={selectAllReports}
                                        formatDate={(date) => formatDate(date, isMobile)}
                                        onViewDetails={handleViewDetails}
                                        onCopyReportNumber={handleCopyReportNumber}
                                        onGenerateReport={handleGenerateReport}
                                    />
                                )}
                                
                                {reports.last_page > 1 && (
                                    <div className="mt-6">
                                        <ModernPagination
                                            currentPage={reports.current_page}
                                            lastPage={reports.last_page}
                                            onPageChange={handlePageChange}
                                            loading={loading}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            );
        };
        
        if (pageProps.error) {
            return (
                <ResidentLayout
                    breadcrumbs={[
                        { title: 'Dashboard', href: '/portal/dashboard' },
                        { title: 'Community Reports', href: '/portal/community-reports' }
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
                                <p className="text-gray-500 dark:text-gray-400 mb-4">
                                    {pageProps.error}
                                </p>
                                <Button 
                                    onClick={() => window.location.href = '/portal/dashboard'}
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
                        { title: 'Community Reports', href: '/portal/community-reports' }
                    ]}
                >
                    <div className="space-y-4 md:space-y-6 pb-28 md:pb-6">
                        {isMobile ? (
                            <MobileHeader
                                statsTotal={stats.total}
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
                                    formatCurrency={formatCurrency}
                                />
                                <DesktopStats
                                    stats={stats}
                                    formatCurrency={formatCurrency}
                                />
                            </div>
                        )}
                        
                        <ModernFilterModal
                            isOpen={showMobileFilters}
                            onClose={() => setShowMobileFilters(false)}
                            title="Filter Reports"
                            description={hasActiveFilters ? 'Filters are currently active' : 'No filters applied'}
                            search={search}
                            onSearchChange={setSearch}
                            onSearchSubmit={handleSearchSubmit}
                            onSearchClear={handleSearchClear}
                            loading={loading}
                            hasActiveFilters={hasActiveFilters}
                            onClearFilters={handleClearFilters}
                        >
                            <FilterModalContent
                                selectedStatus={statusFilter}
                                onStatusChange={handleStatusChange}
                                selectedUrgency={urgencyFilter}
                                onUrgencyChange={handleUrgencyChange}
                                selectedCategory={categoryFilter}
                                onCategoryChange={handleCategoryChange}
                                selectedType={typeFilter}
                                onTypeChange={handleTypeChange}
                                loading={loading}
                                filterOptions={filterOptions}
                            />
                        </ModernFilterModal>
                        
                        {!isMobile && (
                            <ModernReportFilters
                                search={search}
                                setSearch={setSearch}
                                handleSearchSubmit={handleSearchSubmit}
                                handleSearchClear={handleSearchClear}
                                statusFilter={statusFilter}
                                handleStatusChange={handleStatusChange}
                                urgencyFilter={urgencyFilter}
                                handleUrgencyChange={handleUrgencyChange}
                                typeFilter={typeFilter}
                                handleTypeChange={handleTypeChange}
                                categoryFilter={categoryFilter}
                                handleCategoryChange={handleCategoryChange}
                                loading={loading}
                                filterOptions={filterOptions}
                                printReports={handlePrint}
                                exportToCSV={handleExport}
                                isExporting={isExporting}
                                hasActiveFilters={hasActiveFilters}
                                handleClearFilters={handleClearFilters}
                                onCopySummary={handleCopySummary}
                            />
                        )}
                        
                        <div className="mt-4">
                            <CustomTabs
                                statusFilter={statusFilter}
                                handleTabChange={handleTabChange}
                                getStatusCount={(status) => getStatusCount(stats, status)}
                                tabsConfig={REPORT_TABS}
                            />
                            
                            <div className="mt-4">
                                {renderTabContent()}
                            </div>
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