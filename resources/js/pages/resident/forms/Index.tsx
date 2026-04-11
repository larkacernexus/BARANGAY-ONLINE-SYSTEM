// /Pages/resident/Forms/Index.tsx
import { useState, useEffect, useMemo } from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import { toast } from 'sonner';
import ResidentLayout from '@/layouts/resident-app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, FileText, Download, Clock } from 'lucide-react';

// Reusable Components
import { CustomTabs } from '@/components/residentui/CustomTabs';
import { ModernFilterModal } from '@/components/residentui/modern-filter-modal';
import { ModernEmptyState } from '@/components/residentui/modern-empty-state';
import { ModernPagination } from '@/components/residentui/modern-pagination';
import { ModernLoadingOverlay } from '@/components/residentui/modern-loading-overlay';
import { ModernSelectionBanner } from '@/components/residentui/modern-selection-banner';

// Form-specific components
import { ModernFormCard } from '@/components/residentui/forms/modern-form-card';
import { ModernFormGridCard } from '@/components/residentui/forms/modern-form-grid-card';
import { ModernFormMobileListView } from '@/components/residentui/forms/modern-form-mobile-list-view'; // New import
import { ModernFormTable } from '@/components/residentui/forms/modern-form-table';
import { ModernFormFilters } from '@/components/residentui/forms/modern-form-filters';
import { MobileHeader } from '@/components/portal/forms/index/MobileHeader';
import { DesktopHeader } from '@/components/portal/forms/index/DesktopHeader';
import { TabHeader } from '@/components/portal/forms/index/TabHeader';
import { CollapsibleStats } from '@/components/portal/forms/index/CollapsibleStats';
import { DesktopStats } from '@/components/portal/forms/index/DesktopStats';
import { FilterModalContent } from '@/components/portal/forms/index/FilterModalContent';

// Types and Utils
import type { Form, PaginationData, Stats } from '@/types/portal/forms/form.types';
import { FORM_TABS, SORT_OPTIONS, getCategoryColor, getAgencyIcon, getFileTypeIcon, getFileTypeColor } from '@/components/residentui/forms/constants';
import { 
    formatDate, 
    formatDateTime, 
    formatFileSize, 
    truncateText, 
    copyToClipboard,
    getStatusCount 
} from '@/utils/portal/forms/form-utils';

interface PageProps extends Record<string, any> {
    forms: PaginationData;
    stats: Stats;
    categories: string[];
    agencies: string[];
    error?: string;
}

export default function FormsIndex() {
    const { props } = usePage<PageProps>();
    
    // Extract the forms array from paginated data
    const allForms = props.forms?.data || [];
    const forms = props.forms || {
        data: [],
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
        from: 0,
        to: 0,
    };
    
    const stats = props.stats || {
        total: 0,
        active: 0,
        downloads: 0,
        categories_count: 0,
        agencies_count: 0,
        popular_categories: [],
        popular_agencies: [],
    };
    
    const categories = props.categories || [];
    const agencies = props.agencies || [];
    
    // CLIENT-SIDE FILTER STATE
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [agencyFilter, setAgencyFilter] = useState('all');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [activeTab, setActiveTab] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [showStats, setShowStats] = useState(true);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [selectedForms, setSelectedForms] = useState<number[]>([]);
    const [isExporting, setIsExporting] = useState(false);
    const [selectMode, setSelectMode] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    
    const itemsPerPage = 15;
    
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
    
    // CLIENT-SIDE FILTERING
    const filteredForms = useMemo(() => {
        let filtered = [...allForms];
        
        // Tab filter
        if (activeTab === 'popular') {
            filtered = filtered.filter(form => form.download_count > 0);
        } else if (activeTab === 'recent') {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            filtered = filtered.filter(form => {
                const createdDate = new Date(form.created_at);
                return createdDate >= thirtyDaysAgo;
            });
        }
        
        // Search filter
        if (search) {
            const query = search.toLowerCase();
            filtered = filtered.filter(form => 
                form.title?.toLowerCase().includes(query) ||
                form.description?.toLowerCase().includes(query) ||
                form.category?.toLowerCase().includes(query) ||
                form.issuing_agency?.toLowerCase().includes(query)
            );
        }
        
        // Category filter
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(form => 
                form.category?.toLowerCase() === categoryFilter.toLowerCase()
            );
        }
        
        // Agency filter
        if (agencyFilter !== 'all') {
            filtered = filtered.filter(form => 
                form.issuing_agency?.toLowerCase() === agencyFilter.toLowerCase()
            );
        }
        
        // Sorting
        filtered.sort((a, b) => {
            let aValue: any;
            let bValue: any;
            
            switch (sortBy) {
                case 'title':
                    aValue = a.title?.toLowerCase() || '';
                    bValue = b.title?.toLowerCase() || '';
                    break;
                case 'download_count':
                    aValue = a.download_count || 0;
                    bValue = b.download_count || 0;
                    break;
                case 'category':
                    aValue = a.category?.toLowerCase() || '';
                    bValue = b.category?.toLowerCase() || '';
                    break;
                case 'issuing_agency':
                    aValue = a.issuing_agency?.toLowerCase() || '';
                    bValue = b.issuing_agency?.toLowerCase() || '';
                    break;
                case 'created_at':
                default:
                    aValue = new Date(a.created_at || 0).getTime();
                    bValue = new Date(b.created_at || 0).getTime();
                    break;
            }
            
            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
            } else {
                return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
            }
        });
        
        return filtered;
    }, [allForms, activeTab, search, categoryFilter, agencyFilter, sortBy, sortOrder]);
    
    // Pagination
    const totalPages = Math.ceil(filteredForms.length / itemsPerPage);
    const paginatedForms = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredForms.slice(start, end);
    }, [filteredForms, currentPage]);
    
    // Reset to first page when filters change
    const handleFilterChange = (filterType: string, value: string) => {
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
                setSortBy(value);
                break;
        }
        
        setSelectedForms([]);
        setSelectMode(false);
        if (isMobile) setShowMobileFilters(false);
    };
    
    const handleSortOrderToggle = () => {
        setCurrentPage(1);
        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    };
    
    const hasActiveFilters = search !== '' || 
                            categoryFilter !== 'all' || 
                            agencyFilter !== 'all' ||
                            activeTab !== 'all';
    
    const clearFilters = () => {
        setSearch('');
        setCategoryFilter('all');
        setAgencyFilter('all');
        setSortBy('created_at');
        setSortOrder('desc');
        setActiveTab('all');
        setCurrentPage(1);
        
        if (isMobile) setShowMobileFilters(false);
        setSelectedForms([]);
        setSelectMode(false);
    };
    
    const handleTabChange = (tab: string) => {
        handleFilterChange('tab', tab);
    };
    
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Search is already applied via useMemo
    };
    
    // Selection mode functions
    const toggleSelectForm = (id: number) => {
        setSelectedForms(prev =>
            prev.includes(id) ? prev.filter(formId => formId !== id) : [...prev, id]
        );
    };
    
    const selectAllForms = () => {
        if (selectedForms.length === paginatedForms.length && paginatedForms.length > 0) {
            setSelectedForms([]);
        } else {
            setSelectedForms(paginatedForms.map(f => f.id));
        }
    };
    
    const toggleSelectMode = () => {
        if (selectMode) {
            setSelectMode(false);
            setSelectedForms([]);
        } else {
            setSelectMode(true);
        }
    };
    
    const handleDownloadSelected = () => {
        toast.info(`Download functionality for ${selectedForms.length} forms would be implemented here`);
        setSelectedForms([]);
        setSelectMode(false);
    };
    
    const handleViewDetails = (id: number) => {
        window.location.href = `/portal/forms/${id}`;
    };
    
    const handleDownloadForm = (form: Form) => {
        window.location.href = `/portal/forms/${form.id}/download`;
    };
    
    const handleCopyLink = (form: Form) => {
        const url = `${window.location.origin}/portal/forms/${form.id}`;
        copyToClipboard(url, `Link copied to clipboard`);
    };
    
    const handleCopyTitle = (title: string) => {
        copyToClipboard(title, `Title copied to clipboard`);
    };
    
    const handleGenerateReport = (form: Form) => {
        const reportWindow = window.open('', '_blank');
        if (reportWindow) {
            reportWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Form Details: ${form.title}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h1 { color: #333; }
                        .detail { margin: 10px 0; }
                        .label { font-weight: bold; }
                    </style>
                </head>
                <body>
                    <h1>Form Details: ${form.title}</h1>
                    <div class="detail"><span class="label">Category:</span> ${form.category}</div>
                    <div class="detail"><span class="label">Agency:</span> ${form.issuing_agency}</div>
                    <div class="detail"><span class="label">Description:</span> ${form.description || 'N/A'}</div>
                    <div class="detail"><span class="label">Downloads:</span> ${form.download_count.toLocaleString()}</div>
                    <div class="detail"><span class="label">File Size:</span> ${formatFileSize(form.file_size)}</div>
                    <div class="detail"><span class="label">File Type:</span> ${form.file_type}</div>
                    <div class="detail"><span class="label">Uploaded:</span> ${formatDateTime(form.created_at)}</div>
                </body>
                </html>
            `);
            reportWindow.document.close();
        }
    };
    
    const handleReportIssue = (form: Form) => {
        toast.info('Report issue feature would open a form');
    };
    
    const handlePrint = () => {
        toast.info('Print functionality would be implemented here');
    };
    
    const handleExport = () => {
        setIsExporting(true);
        setTimeout(() => {
            toast.info('Export functionality would be implemented here');
            setIsExporting(false);
        }, 1000);
    };
    
    const handleCopySummary = async () => {
        const summary = `Forms Catalog Summary:\n\n` +
            `Total Forms: ${stats.total}\n` +
            `Active Forms: ${stats.active}\n` +
            `Total Downloads: ${stats.downloads.toLocaleString()}\n` +
            `Categories: ${stats.categories_count}\n` +
            `Agencies: ${stats.agencies_count}\n\n` +
            `Filtered Results: ${filteredForms.length}\n` +
            `Generated on: ${new Date().toLocaleDateString()}\n` +
            `View online: ${window.location.origin}/portal/forms`;
        
        await copyToClipboard(summary, 'Summary copied to clipboard');
    };
    
    const handleEmailSummary = () => {
        const subject = `Forms Catalog Summary - ${new Date().toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}`;
    };
    
    const formatNumber = (num: number) => num.toLocaleString();
    
    const tabHasData = paginatedForms.length > 0;
    const displayTab = activeTab === 'all' ? 'All' : 
                      activeTab === 'popular' ? 'Most Downloaded' : 'Recently Added';
    
    const from = tabHasData ? (currentPage - 1) * itemsPerPage + 1 : 0;
    const to = tabHasData ? Math.min(currentPage * itemsPerPage, filteredForms.length) : 0;
    
    if (props.error) {
        return (
            <ResidentLayout
                breadcrumbs={[
                    { title: 'Dashboard', href: '/portal/dashboard' },
                    { title: 'Forms Catalog', href: '/portal/forms' }
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
            <Head title="Forms Catalog" />
            
            <ResidentLayout
                breadcrumbs={[
                    { title: 'Dashboard', href: '/portal/dashboard' },
                    { title: 'Forms Catalog', href: '/portal/forms' }
                ]}
            >
                <div className="space-y-4 md:space-y-6 pb-20 md:pb-6">
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
                    
                    {/* Stats Section */}
                    {showStats && (
                        <div className="animate-slide-down">
                            <CollapsibleStats
                                showStats={showStats}
                                setShowStats={setShowStats}
                                stats={stats}
                                formatNumber={formatNumber}
                            />
                            <DesktopStats
                                stats={stats}
                                formatNumber={formatNumber}
                            />
                        </div>
                    )}
                    
                    {/* Mobile Filter Modal */}
                    <ModernFilterModal
                        isOpen={showMobileFilters}
                        onClose={() => setShowMobileFilters(false)}
                        title="Filter Forms"
                        description={hasActiveFilters ? 'Filters are currently active' : 'No filters applied'}
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
                    
                    {/* Desktop Filters */}
                    {!isMobile && (
                        <ModernFormFilters
                            search={search}
                            setSearch={(value) => handleFilterChange('search', value)}
                            handleSearchSubmit={handleSearchSubmit}
                            handleSearchClear={() => handleFilterChange('search', '')}
                            categoryFilter={categoryFilter}
                            handleCategoryChange={(category) => handleFilterChange('category', category)}
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
                    
                    {/* Custom Tabs Section */}
                    <div className="mt-4">
                        <CustomTabs
                            key="form-tabs"
                            statusFilter={activeTab}
                            handleTabChange={handleTabChange}
                            getStatusCount={(status) => getStatusCount(stats, status)}
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
                                            icon={activeTab === 'all' ? FileText : 
                                                  activeTab === 'popular' ? Download : Clock}
                                        />
                                    ) : (
                                        <>
                                            {/* Mobile-specific rendering */}
                                            {isMobile ? (
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
                                            ) : (
                                                // Desktop rendering
                                                viewMode === 'grid' ? (
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
                                                )
                                            )}
                                            
                                            {totalPages > 1 && (
                                                <div className="mt-6">
                                                    <ModernPagination
                                                        currentPage={currentPage}
                                                        lastPage={totalPages}
                                                        onPageChange={setCurrentPage}
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
                </div>
                
                {/* Loading Overlay */}
                <ModernLoadingOverlay loading={loading} message="Loading forms..." />
            </ResidentLayout>
        </>
    );
}