// pages/resident/CommunityReports.tsx (With Mobile List View)

import { useState, useEffect, useMemo } from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import { toast } from 'sonner';
import ResidentLayout from '@/layouts/resident-app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, FileText, Clock, Loader2, TrendingUp, CheckCircle, XCircle, Plus } from 'lucide-react';

// Reusable Components
import { ModernFilterModal } from '@/components/residentui/modern-filter-modal';
import { ModernEmptyState } from '@/components/residentui/modern-empty-state';
import { ModernPagination } from '@/components/residentui/modern-pagination';
import { ModernLoadingOverlay } from '@/components/residentui/modern-loading-overlay';
import { ModernSelectionBanner } from '@/components/residentui/modern-selection-banner';

// Report-specific components
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

// Types
import { CommunityReport, ReportStats, FilterOptions } from '@/types/portal/reports/community-report';

// Helper function for formatting currency
const formatCurrency = (amount: number | string) => {
    if (typeof amount === 'string') amount = parseFloat(amount);
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
};

interface PageProps extends Record<string, any> {
    reports?: {
        data: CommunityReport[];
    };
    stats?: ReportStats;
    filterOptions?: FilterOptions;
    currentResident?: { id: number; first_name: string; last_name: string };
    error?: string;
}

// Type for status filter
type StatusFilterValue = 'pending' | 'under_review' | 'in_progress' | 'resolved' | 'rejected' | 'all';
type UrgencyFilterValue = 'low' | 'medium' | 'high' | 'critical' | 'all';

// Type transformation function
const transformToReportForPrint = (report: CommunityReport) => {
    return {
        ...report,
        incident_time: report.incident_time ?? undefined,
    };
};

export default function CommunityReports() {
    const { props } = usePage<PageProps>();
    
    const allReports = props.reports?.data || [];
    const stats = props.stats || {
        total: 0,
        resolved: 0,
        pending: 0,
        under_review: 0,
        in_progress: 0,
        rejected: 0,
    };
    
    const filterOptions = props.filterOptions || {
        reportTypes: [],
        categories: [],
        statuses: [],
        priorities: [],
    };
    
    const currentResident = props.currentResident || { id: 0, first_name: '', last_name: '' };
    
    // Client-side filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('all');
    const [urgencyFilter, setUrgencyFilter] = useState<UrgencyFilterValue>('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [showStats, setShowStats] = useState(true);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [selectedReports, setSelectedReports] = useState<number[]>([]);
    const [isExporting, setIsExporting] = useState(false);
    const [selectMode, setSelectMode] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    
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
    
    // Filter reports client-side
    const filteredReports = useMemo(() => {
        let filtered = [...allReports];
        
        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(report => report.status === statusFilter);
        }
        
        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(report => 
                report.report_number?.toLowerCase().includes(query) ||
                report.title?.toLowerCase().includes(query) ||
                report.description?.toLowerCase().includes(query) ||
                report.location?.toLowerCase().includes(query)
            );
        }
        
        // Urgency/Priority filter
        if (urgencyFilter !== 'all') {
            filtered = filtered.filter(report => 
                report.urgency?.toLowerCase() === urgencyFilter.toLowerCase()
            );
        }
        
        // Type filter
        if (typeFilter !== 'all') {
            filtered = filtered.filter(report => 
                report.report_type_id?.toString() === typeFilter
            );
        }
        
        // Category filter
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(report => 
                report.report_type?.category?.toLowerCase() === categoryFilter.toLowerCase()
            );
        }
        
        // Sort by created_at desc (newest first)
        filtered.sort((a, b) => {
            const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return dateB - dateA;
        });
        
        return filtered;
    }, [allReports, statusFilter, searchQuery, urgencyFilter, typeFilter, categoryFilter]);
    
    // Pre-calculate tab counts from filtered data
    const tabCounts = useMemo(() => {
        if (!filteredReports) {
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
            all: filteredReports.length,
            pending: filteredReports.filter(r => r.status === 'pending').length,
            under_review: filteredReports.filter(r => r.status === 'under_review').length,
            in_progress: filteredReports.filter(r => r.status === 'in_progress').length,
            resolved: filteredReports.filter(r => r.status === 'resolved').length,
            rejected: filteredReports.filter(r => r.status === 'rejected').length,
        };
    }, [filteredReports]);
    
    // Get status count function for CollapsibleStats
    const getStatusCountForStats = (status: string | number): number => {
        const statusStr = String(status);
        return tabCounts[statusStr as keyof typeof tabCounts] || 0;
    };
    
    // Pagination
    const itemsPerPage = 15;
    const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
    const paginatedReports = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredReports.slice(start, end);
    }, [filteredReports, currentPage]);
    
    // Reset to first page when filters change
    const handleFilterChange = (filterType: string, value: string) => {
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
    
    const hasActiveFilters = statusFilter !== 'all' || 
                            searchQuery !== '' || 
                            urgencyFilter !== 'all' || 
                            typeFilter !== 'all' || 
                            categoryFilter !== 'all';
    
    const clearFilters = () => {
        setStatusFilter('all');
        setSearchQuery('');
        setUrgencyFilter('all');
        setTypeFilter('all');
        setCategoryFilter('all');
        setCurrentPage(1);
        
        if (isMobile) setShowMobileFilters(false);
        setSelectedReports([]);
        setSelectMode(false);
    };
    
    const handleTabChange = (tab: string) => {
        handleFilterChange('status', tab);
        if (isMobile) setShowMobileFilters(false);
    };
    
    const toggleSelectReport = (id: number) => {
        setSelectedReports(prev =>
            prev.includes(id) ? prev.filter(reportId => reportId !== id) : [...prev, id]
        );
    };
    
    const selectAllReports = () => {
        if (selectedReports.length === paginatedReports.length && paginatedReports.length > 0) {
            setSelectedReports([]);
        } else {
            setSelectedReports(paginatedReports.map(r => r.id));
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
        window.location.href = `/portal/community-reports/${id}`;
    };
    
    const handleCopyReportNumber = (reportNumber: string) => {
        copyToClipboard(reportNumber, `Copied: ${reportNumber}`);
    };
    
    const handleGenerateReport = (report: CommunityReport) => {
        const reportWindow = window.open('', '_blank');
        if (reportWindow) {
            reportWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Report: ${report.report_number}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h1 { color: #333; }
                        .detail { margin: 10px 0; }
                        .label { font-weight: bold; }
                    </style>
                </head>
                <body>
                    <h1>Community Report Details</h1>
                    <div class="detail"><span class="label">Report Number:</span> ${report.report_number}</div>
                    <div class="detail"><span class="label">Title:</span> ${report.title}</div>
                    <div class="detail"><span class="label">Type:</span> ${report.report_type?.name || 'N/A'}</div>
                    <div class="detail"><span class="label">Category:</span> ${report.report_type?.category || 'N/A'}</div>
                    <div class="detail"><span class="label">Status:</span> ${report.status}</div>
                    <div class="detail"><span class="label">Urgency:</span> ${report.urgency}</div>
                    <div class="detail"><span class="label">Location:</span> ${report.location || 'N/A'}</div>
                    <div class="detail"><span class="label">Description:</span> ${report.description}</div>
                    <div class="detail"><span class="label">Date Filed:</span> ${formatDate(report.created_at, false)}</div>
                    <div class="detail"><span class="label">Incident Date:</span> ${formatDate(report.incident_date, false)}</div>
                    ${report.incident_time ? `<div class="detail"><span class="label">Incident Time:</span> ${report.incident_time}</div>` : ''}
                    ${report.resolved_at ? `<div class="detail"><span class="label">Resolved:</span> ${formatDate(report.resolved_at, false)}</div>` : ''}
                    <div class="detail"><span class="label">Evidence Files:</span> ${report.evidences_count || 0}</div>
                    <div class="detail"><span class="label">Anonymous:</span> ${report.is_anonymous ? 'Yes' : 'No'}</div>
                </body>
                </html>
            `);
            reportWindow.document.close();
        }
    };
    
    const handlePrint = () => {
        const transformedReports = filteredReports.map(transformToReportForPrint);
        printReportsList(
            transformedReports,
            statusFilter,
            currentResident,
            (date: string) => formatDate(date, false)
        );
    };
    
    const handleExport = () => {
        const transformedReports = filteredReports.map(transformToReportForPrint);
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
            `Total Reports: ${filteredReports.length}\n` +
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
    const displayStatus = statusFilter && statusFilter !== 'all' 
        ? statusFilter.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        : 'All';
    
    // Error state
    if (props.error) {
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
                                {props.error}
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
                            statsTotal={filteredReports.length}
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
                            />
                            <DesktopStats
                                stats={stats}
                            />
                        </div>
                    )}
                    
                    <ModernFilterModal
                        isOpen={showMobileFilters}
                        onClose={() => setShowMobileFilters(false)}
                        title="Filter Community Reports"
                        description={hasActiveFilters ? 'Filters are currently active' : 'No filters applied'}
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
                            handleSearchSubmit={(e) => { e.preventDefault(); }}
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
                        />
                    )}
                    
                    <div className="mt-4">
                        <ReportTabs
                            statusFilter={statusFilter || 'all'}
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
                                    from={(currentPage - 1) * itemsPerPage + 1}
                                    to={Math.min(currentPage * itemsPerPage, filteredReports.length)}
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
                                        status={statusFilter || 'all'}
                                        hasFilters={hasActiveFilters}
                                        onClearFilters={clearFilters}
                                        icon={statusFilter === 'all' ? FileText : 
                                              statusFilter === 'pending' ? Clock :
                                              statusFilter === 'under_review' ? Loader2 :
                                              statusFilter === 'in_progress' ? TrendingUp :
                                              statusFilter === 'resolved' ? CheckCircle :
                                              statusFilter === 'rejected' ? XCircle : FileText}
                                    />
                                ) : (
                                    <>
                                        {/* Mobile-specific rendering */}
                                        {isMobile ? (
                                            viewMode === 'grid' ? (
                                                <div className="pb-4 space-y-3">
                                                    {paginatedReports.map((report) => (
                                                        <ModernReportCard
                                                            key={report.id}
                                                            report={report}
                                                            selectMode={selectMode}
                                                            selectedReports={selectedReports}
                                                            toggleSelectReport={toggleSelectReport}
                                                            formatDate={(date) => formatDate(date, true)}
                                                            onViewDetails={handleViewDetails}
                                                            onCopyReportNumber={handleCopyReportNumber}
                                                            onGenerateReport={handleGenerateReport}
                                                            isMobile={true}
                                                        />
                                                    ))}
                                                </div>
                                            ) : (
                                                <ModernReportMobileListView
                                                    reports={paginatedReports}
                                                    selectMode={selectMode}
                                                    selectedReports={selectedReports}
                                                    toggleSelectReport={toggleSelectReport}
                                                    formatDate={(date) => formatDate(date, true)}
                                                    onViewDetails={handleViewDetails}
                                                    onCopyReportNumber={handleCopyReportNumber}
                                                    onGenerateReport={handleGenerateReport}
                                                />
                                            )
                                        ) : (
                                            // Desktop rendering
                                            viewMode === 'grid' ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {paginatedReports.map((report) => (
                                                        <ModernReportGridCard
                                                            key={report.id}
                                                            report={report}
                                                            selectMode={selectMode}
                                                            selectedReports={selectedReports}
                                                            toggleSelectReport={toggleSelectReport}
                                                            formatDate={(date) => formatDate(date, false)}
                                                            onViewDetails={handleViewDetails}
                                                            onCopyReportNumber={handleCopyReportNumber}
                                                            onGenerateReport={handleGenerateReport}
                                                        />
                                                    ))}
                                                </div>
                                            ) : (
                                                <ModernReportTable
                                                    reports={paginatedReports}
                                                    selectMode={selectMode}
                                                    selectedReports={selectedReports}
                                                    toggleSelectReport={toggleSelectReport}
                                                    selectAllReports={selectAllReports}
                                                    formatDate={(date) => formatDate(date, false)}
                                                    onViewDetails={handleViewDetails}
                                                    onCopyReportNumber={handleCopyReportNumber}
                                                    onGenerateReport={handleGenerateReport}
                                                />
                                            )
                                        )}
                                        
                                        {totalPages > 1 && (
                                            <div className="mt-6">
                                                <ModernPagination
                                                    currentPage={currentPage}
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