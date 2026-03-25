// /Pages/resident/Forms/Index.tsx
import { useState, useEffect, useMemo, useRef } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import ResidentLayout from '@/layouts/resident-app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, FileText, Download, Clock, Loader2, CheckCircle, XCircle } from 'lucide-react';

// Reusable Components
import { CustomTabs } from '@/components/residentui/CustomTabs';
import { ModernFilterModal } from '@/components/residentui/modern-filter-modal';
import { ModernEmptyState } from '@/components/residentui/modern-empty-state';
import { ModernPagination } from '@/components/residentui/modern-pagination';
import { ModernLoadingOverlay } from '@/components/residentui/modern-loading-overlay';
import { ModernSelectionBanner } from '@/components/residentui/modern-selection-banner';

// Form-specific components - Updated paths
import { ModernFormCard } from '@/components/residentui/forms/modern-form-card';
import { ModernFormGridCard } from '@/components/residentui/forms/modern-form-grid-card';
import { ModernFormTable } from '@/components/residentui/forms/modern-form-table';
import { ModernFormFilters } from '@/components/residentui/forms/modern-form-filters';
import { MobileHeader } from '@/components/portal/forms/index/MobileHeader';
import { DesktopHeader } from '@/components/portal/forms/index/DesktopHeader';
import { TabHeader } from '@/components/portal/forms/index/TabHeader';
import { CollapsibleStats } from '@/components/portal/forms/index/CollapsibleStats';
import { DesktopStats } from '@/components/portal/forms/index/DesktopStats';
import { FilterModalContent } from '@/components/portal/forms/index/FilterModalContent';


// Types and Utils
import type { Form, PaginationData, Stats, FormFilters } from '@/types/portal/forms/form.types';
import { FORM_TABS, SORT_OPTIONS, getCategoryColor, getAgencyIcon, getFileTypeIcon, getFileTypeColor } from '@/components/residentui/forms/constants';
import { 
    formatDate, 
    formatDateTime, 
    formatFileSize, 
    truncateText, 
    copyToClipboard,
    getFormStatsCards,
    getStatusCount 
} from '@/utils/portal/forms/form-utils';

interface PageProps extends Record<string, any> {
    forms: PaginationData;
    filters: FormFilters;
    categories: string[];
    agencies: string[];
    stats: Stats;
    error?: string;
}

export default function FormsIndex() {
    const page = usePage<PageProps>();
    const pageProps = page.props;
    
    const forms = pageProps.forms || {
        data: [],
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
        from: 0,
        to: 0,
    };
    
    const stats = pageProps.stats || {
        total: 0,
        active: 0,
        downloads: 0,
        categories_count: 0,
        agencies_count: 0,
        popular_categories: [],
        popular_agencies: [],
    };
    
    const categories = pageProps.categories || [];
    const agencies = pageProps.agencies || [];
    const filters = pageProps.filters || {};
    
    const [search, setSearch] = useState(filters.search || '');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || 'all');
    const [agencyFilter, setAgencyFilter] = useState(filters.agency || 'all');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(filters.sort_order === 'asc' ? 'asc' : 'desc');
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [showStats, setShowStats] = useState(true);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [selectedForms, setSelectedForms] = useState<number[]>([]);
    const [isExporting, setIsExporting] = useState(false);
    const [selectMode, setSelectMode] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [activeTab, setActiveTab] = useState('all');
    
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
            setCategoryFilter(filters.category || 'all');
            setAgencyFilter(filters.agency || 'all');
            setSortBy(filters.sort_by || 'created_at');
            setSortOrder(filters.sort_order === 'asc' ? 'asc' : 'desc');
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
                cleanFilters[key] = value;
            }
        });
        
        router.get('/portal/forms', cleanFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onFinish: () => setLoading(false),
        });
    };
    
    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        
        let sortField = 'created_at';
        let sortDir: 'asc' | 'desc' = 'desc';
        
        if (tab === 'popular') {
            sortField = 'download_count';
            sortDir = 'desc';
        } else if (tab === 'recent') {
            sortField = 'created_at';
            sortDir = 'desc';
        }
        
        setSortBy(sortField);
        setSortOrder(sortDir);
        
        updateFilters({ 
            sort_by: sortField,
            sort_order: sortDir,
            page: '1'
        });
        
        if (isMobile) setShowMobileFilters(false);
    };
    
    const handleCategoryChange = (category: string) => {
        setCategoryFilter(category);
        updateFilters({ 
            category: category === 'all' ? '' : category,
            page: '1'
        });
        if (isMobile) setShowMobileFilters(false);
    };
    
    const handleAgencyChange = (agency: string) => {
        setAgencyFilter(agency);
        updateFilters({ 
            agency: agency === 'all' ? '' : agency,
            page: '1'
        });
        if (isMobile) setShowMobileFilters(false);
    };
    
    const handleSortChange = (sort: string) => {
        setSortBy(sort);
        updateFilters({ 
            sort_by: sort,
            page: '1'
        });
    };
    
    const handleSortOrderToggle = () => {
        const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        setSortOrder(newOrder);
        updateFilters({ 
            sort_order: newOrder,
            page: '1'
        });
    };
    
    const handleClearFilters = () => {
        setSearch('');
        setCategoryFilter('all');
        setAgencyFilter('all');
        setSortBy('created_at');
        setSortOrder('desc');
        setActiveTab('all');
        
        router.get('/portal/forms', {}, {
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
        updateFilters({ 
            search: search.trim(),
            page: '1'
        });
    };
    
    const handleSearchClear = () => {
        setSearch('');
        updateFilters({ 
            search: '',
            page: '1'
        });
    };
    
    // Selection mode functions
    const toggleSelectForm = (id: number) => {
        setSelectedForms(prev =>
            prev.includes(id) ? prev.filter(formId => formId !== id) : [...prev, id]
        );
    };
    
    const selectAllForms = () => {
        const currentForms = forms.data;
        if (selectedForms.length === currentForms.length && currentForms.length > 0) {
            setSelectedForms([]);
        } else {
            setSelectedForms(currentForms.map(f => f.id));
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
    };
    
    const handleViewDetails = (id: number) => {
        router.visit(`/portal/forms/${id}`);
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
                <h1>Form Details: ${form.title}</h1>
                <p><strong>Category:</strong> ${form.category}</p>
                <p><strong>Agency:</strong> ${form.issuing_agency}</p>
                <p><strong>Description:</strong> ${form.description}</p>
                <p><strong>Downloads:</strong> ${form.download_count.toLocaleString()}</p>
                <p><strong>File Size:</strong> ${formatFileSize(form.file_size)}</p>
                <p><strong>File Type:</strong> ${form.file_type}</p>
                <p><strong>Uploaded:</strong> ${formatDateTime(form.created_at)}</p>
            `);
        }
    };
    
    const handleReportIssue = (form: Form) => {
        toast.info('Report issue feature would open a form');
    };
    
    const getCurrentForms = () => forms.data;
    
    const hasActiveFilters = useMemo(() => {
        return Object.entries(filters).some(([key, value]) => 
            key !== 'page' && value && value !== '' && value !== 'all'
        );
    }, [filters]);
    
    const handlePrint = () => {
        toast.info('Print functionality would be implemented here');
    };
    
    const handleExport = () => {
        toast.info('Export functionality would be implemented here');
    };
    
    const handleCopySummary = async () => {
        const summary = `Forms Catalog Summary:\n\n` +
            `Total Forms: ${stats.total}\n` +
            `Active Forms: ${stats.active}\n` +
            `Total Downloads: ${stats.downloads.toLocaleString()}\n` +
            `Categories: ${stats.categories_count}\n` +
            `Agencies: ${stats.agencies_count}\n\n` +
            `Generated on: ${new Date().toLocaleDateString()}\n` +
            `View online: ${window.location.origin}/portal/forms`;
        
        await copyToClipboard(summary, 'Summary copied to clipboard');
    };
    
    const handleEmailSummary = () => {
        const subject = `Forms Catalog Summary - ${new Date().toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}`;
    };
    
    const handlePageChange = (page: number) => {
        updateFilters({ page: page.toString() });
    };
    
    const formatNumber = (num: number) => num.toLocaleString();
    
    const renderTabContent = () => {
        const currentForms = getCurrentForms();
        const tabHasData = currentForms.length > 0;
        
        const displayTab = activeTab === 'all' ? 'All' : 
                          activeTab === 'popular' ? 'Most Downloaded' : 'Recently Added';
        
        return (
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
                <CardContent className="p-4 md:p-6">
                    <ModernSelectionBanner
                        selectedCount={selectedForms.length}
                        totalCount={currentForms.length}
                        onSelectAll={selectAllForms}
                        onDeselectAll={() => setSelectedForms([])}
                        onCancel={() => {
                            setSelectMode(false);
                            setSelectedForms([]);
                        }}
                        onDelete={handleDownloadSelected}
                        deleteLabel="Download Selected"
                    />
                    
                    <TabHeader
                        displayTab={displayTab}
                        count={currentForms.length}
                        selectMode={selectMode}
                        selectedCount={selectedForms.length}
                        hasFilters={categoryFilter !== 'all' || agencyFilter !== 'all' || !!search}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSortChange={handleSortChange}
                        onSortOrderToggle={handleSortOrderToggle}
                        onToggleSelectMode={toggleSelectMode}
                        tabHasData={tabHasData}
                    />
                    
                    {!tabHasData ? (
                        <ModernEmptyState
                            status={activeTab}
                            hasFilters={hasActiveFilters}
                            onClearFilters={handleClearFilters}
                            icon={activeTab === 'all' ? FileText : 
                                  activeTab === 'popular' ? Download :
                                  activeTab === 'recent' ? Clock : FileText}
                            title={`No ${activeTab === 'all' ? '' : activeTab} forms found`}
                            message={hasActiveFilters 
                                ? 'Try adjusting your filters or search criteria' 
                                : 'There are currently no forms available in this category'}
                        />
                    ) : (
                        <>
                            {viewMode === 'grid' && (
                                <>
                                    {isMobile && (
                                        <div className="pb-4">
                                            {currentForms.map((form) => (
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
                                                    isMobile={isMobile}
                                                />
                                            ))}
                                        </div>
                                    )}
                                    
                                    {!isMobile && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {currentForms.map((form) => (
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
                                    )}
                                </>
                            )}
                            
                            {viewMode === 'list' && !isMobile && (
                                <ModernFormTable
                                    forms={currentForms}
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
                            
                            {forms.last_page > 1 && (
                                <div className="mt-6">
                                    <ModernPagination
                                        currentPage={forms.current_page}
                                        lastPage={forms.last_page}
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
                        onSearchChange={setSearch}
                        onSearchSubmit={handleSearchSubmit}
                        onSearchClear={handleSearchClear}
                        loading={loading}
                        hasActiveFilters={hasActiveFilters}
                        onClearFilters={handleClearFilters}
                    >
                        <FilterModalContent
                            categoryFilter={categoryFilter}
                            onCategoryChange={handleCategoryChange}
                            agencyFilter={agencyFilter}
                            onAgencyChange={handleAgencyChange}
                            sortBy={sortBy}
                            onSortChange={handleSortChange}
                            sortOrder={sortOrder}
                            onSortOrderChange={(order) => {
                                setSortOrder(order);
                                updateFilters({ sort_order: order, page: '1' });
                            }}
                            loading={loading}
                            categories={categories}
                            agencies={agencies}
                        />
                    </ModernFilterModal>
                    
                    {/* Desktop Filters */}
                    {!isMobile && (
                        <ModernFormFilters
                            search={search}
                            setSearch={setSearch}
                            handleSearchSubmit={handleSearchSubmit}
                            handleSearchClear={handleSearchClear}
                            categoryFilter={categoryFilter}
                            handleCategoryChange={handleCategoryChange}
                            agencyFilter={agencyFilter}
                            handleAgencyChange={handleAgencyChange}
                            sortBy={sortBy}
                            handleSortChange={handleSortChange}
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
                            handleClearFilters={handleClearFilters}
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
                            {renderTabContent()}
                        </div>
                    </div>
                </div>
                
                {/* Loading Overlay */}
                <ModernLoadingOverlay loading={loading} message="Loading forms..." />
            </ResidentLayout>
        </>
    );
}