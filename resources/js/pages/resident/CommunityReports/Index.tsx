import { useState, useEffect, useMemo, useRef } from 'react';
import ResidentLayout from '@/layouts/resident-app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link, usePage, router, Head } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertCircle,
    Search,
    Eye,
    Plus,
    Check,
    X,
    Square,
    Grid,
    List,
    MoreVertical,
    Copy,
    FileText,
    Printer,
    Download,
    Share2,
    Filter,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    ChevronDown,
    BarChart,
    Loader2,
    Calendar,
    Clock,
    Shield,
    ArrowUpDown,
    Info,
    Flag,
    MapPin,
    Paperclip,
    TrendingUp,
    CheckCircle,
    XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ResidentMobileFooter from '@/layouts/resident-mobile-sticky-footer';

// Reusable Components
import { CustomTabs } from '@/components/residentui/CustomTabs';
import { ModernSelect } from '@/components/residentui/modern-select';
import { ModernFilterModal } from '@/components/residentui/modern-filter-modal';
import { ModernStatsCards } from '@/components/residentui/modern-stats-cards';
import { ModernEmptyState } from '@/components/residentui/modern-empty-state';
import { ModernPagination } from '@/components/residentui/modern-pagination';
import { ModernLoadingOverlay } from '@/components/residentui/modern-loading-overlay';
import { ModernSelectionBanner } from '@/components/residentui/modern-selection-banner';

// Report-specific components
import {
    STATUS_CONFIG,
    URGENCY_CONFIG,
    REPORT_TABS,
    getReportStatsCards
} from '@/components/residentui/reports/constants';
import {
    formatDate,
    formatDateTime,
    getStatusCount,
    copyToClipboard,
    printReportsList,
    exportReportsToCSV,
} from '@/components/residentui/reports/report-utils';
import { ModernReportCard } from '@/components/residentui/reports/modern-report-card';
import { ModernReportGridCard } from '@/components/residentui/reports/modern-report-grid-card';
import { ModernReportFilters } from '@/components/residentui/reports/modern-report-filters';
import { ModernReportTable } from '@/components/residentui/reports/modern-report-table';

// Types
interface ReportEvidence {
    id: number;
    report_id: number;
    file_path: string;
    file_name: string;
    file_type: string;
    file_size: number;
    uploaded_by: number;
    notes: string | null;
    created_at: string;
    updated_at: string;
    file_url: string;
    is_image: boolean;
    is_video: boolean;
    is_pdf: boolean;
    formatted_size: string;
}

interface ReportType {
    id: number;
    name: string;
    category: string;
    description: string;
    requires_evidence: boolean;
    allows_anonymous: boolean;
    priority_level: number;
    is_active: boolean;
}

interface CommunityReport {
    id: number;
    report_number: string;
    report_type_id: number;
    title: string;
    description: string;
    location: string;
    incident_date: string;
    incident_time: string | null;
    urgency: 'low' | 'medium' | 'high';
    status: 'pending' | 'under_review' | 'in_progress' | 'resolved' | 'rejected';
    is_anonymous: boolean;
    reporter_name: string | null;
    reporter_contact: string | null;
    admin_notes: string | null;
    resolved_at: string | null;
    created_at: string;
    updated_at: string;
    user_id: number;
    report_type: ReportType;
    evidences_count: number;
    evidences?: ReportEvidence[];
    formatted_created_at: string;
    formatted_incident_date: string;
    formatted_resolved_date?: string;
    days_since_created: number;
}

interface Stats {
    total: number;
    resolved: number;
    pending: number;
    under_review?: number;
    in_progress?: number;
    rejected?: number;
}

interface FilterOptions {
    reportTypes: ReportType[];
    categories: string[];
    statuses: string[];
    priorities: string[];
}

interface PageProps extends Record<string, any> {
    reports?: {
        data: CommunityReport[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    stats?: Stats;
    filterOptions?: FilterOptions;
    currentResident?: {
        id: number;
        first_name: string;
        last_name: string;
    };
    filters?: {
        search?: string;
        status?: string;
        category?: string;
        type?: string;
        priority?: string;
        page?: string;
    };
    error?: string;
}

// StatusBadge Component with dark mode
const StatusBadge = ({ status }: { status: string }) => {
    const statusKey = status as keyof typeof STATUS_CONFIG;
    const config = STATUS_CONFIG[statusKey];
    
    if (!config) {
        return (
            <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-0 px-2 py-1 flex items-center gap-1">
                <span className="capitalize">{status.replace('_', ' ')}</span>
            </Badge>
        );
    }
    
    const Icon = config.icon;
    return (
        <Badge className={`${config.color} ${config.textColor} border-0 px-2 py-1 flex items-center gap-1`}>
            <Icon className="h-3 w-3" />
            <span>{config.label}</span>
        </Badge>
    );
};

// UrgencyBadge Component with dark mode
const UrgencyBadge = ({ urgency }: { urgency: string }) => {
    const urgencyKey = urgency as keyof typeof URGENCY_CONFIG;
    const config = URGENCY_CONFIG[urgencyKey];
    
    if (!config) {
        return (
            <Badge variant="outline" className="text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700">
                {urgency}
            </Badge>
        );
    }
    
    return (
        <Badge variant="outline" className={`${config.color} ${config.textColor} border-0 flex items-center`}>
            <span className={`h-2 w-2 rounded-full ${config.dot} mr-2`}></span>
            <span>{config.label}</span>
        </Badge>
    );
};

// CollapsibleStats Component (Mobile)
const CollapsibleStats = ({
    showStats,
    setShowStats,
    stats
}: any) => (
    <div className="md:hidden">
        <Button
            variant="outline"
            className="w-full justify-between bg-white dark:bg-gray-900 rounded-xl border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
            onClick={() => setShowStats(!showStats)}
        >
            <div className="flex items-center gap-2">
                <BarChart className="h-4 w-4" />
                <span>{showStats ? 'Hide Statistics' : 'Show Statistics'}</span>
            </div>
            {showStats ? (
                <ChevronUp className="h-4 w-4" />
            ) : (
                <ChevronDown className="h-4 w-4" />
            )}
        </Button>
        
        {showStats && (
            <div className="mt-2 animate-slide-down">
                <ModernStatsCards
                    cards={getReportStatsCards(stats)}
                    loading={false}
                    gridCols="grid-cols-2"
                />
            </div>
        )}
    </div>
);

// DesktopStats Component
const DesktopStats = ({ stats }: any) => (
    <div className="hidden md:block">
        <ModernStatsCards
            cards={getReportStatsCards(stats)}
            loading={false}
        />
    </div>
);

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
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [urgencyFilter, setUrgencyFilter] = useState(filters.priority || 'all');
    const [typeFilter, setTypeFilter] = useState(filters.type || 'all');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || 'all');
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
                cleanFilters[key] = value;
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
            updateFilters({ 
                status: '',
                page: '1'
            });
        } else {
            updateFilters({ 
                status: tab,
                page: '1'
            });
        }
        
        if (isMobile) setShowMobileFilters(false);
    };
    
    const handleStatusChange = (status: string) => {
        setStatusFilter(status);
        updateFilters({ 
            status: status === 'all' ? '' : status,
            page: '1'
        });
        if (isMobile) setShowMobileFilters(false);
    };
    
    const handleUrgencyChange = (urgency: string) => {
        setUrgencyFilter(urgency);
        updateFilters({ 
            priority: urgency === 'all' ? '' : urgency,
            page: '1'
        });
        if (isMobile) setShowMobileFilters(false);
    };
    
    const handleTypeChange = (type: string) => {
        setTypeFilter(type);
        updateFilters({ 
            type: type === 'all' ? '' : type,
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
    const toggleSelectReport = (id: number) => {
        setSelectedReports(prev =>
            prev.includes(id)
                ? prev.filter(reportId => reportId !== id)
                : [...prev, id]
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
    
    const getCurrentTabReports = () => {
        return reports.data;
    };
    
    const hasActiveFilters = useMemo(() => {
        return Object.entries(filters).some(([key, value]) => 
            key !== 'page' && value && value !== '' && value !== 'all'
        );
    }, [filters]);
    
    const handlePrint = () => {
        printReportsList(
            reports.data,
            statusFilter,
            currentResident,
            (date: string) => formatDate(date, false)
        );
    };
    
    const handleExport = () => {
        exportReportsToCSV(
            reports.data,
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
        
        return (
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
                <CardContent className="p-4 md:p-6">
                    <ModernSelectionBanner
                        selectMode={selectMode}
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
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {statusFilter === 'all' ? 'All' : statusFilter.replace('_', ' ')} Reports
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {tabHasData 
                                    ? `Showing ${reports.from}-${reports.to} of ${reports.total} report${reports.total !== 1 ? 's' : ''}`
                                    : `No ${statusFilter === 'all' ? 'reports' : statusFilter.replace('_', ' ')} found`
                                }
                                {selectMode && selectedReports.length > 0 && ` • ${selectedReports.length} selected`}
                                {(typeFilter !== 'all' || urgencyFilter !== 'all' || categoryFilter !== 'all' || search) && ' (filtered)'}
                                {selectMode && ' • Selection Mode'}
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            {/* Sort Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="gap-2 rounded-xl border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <ArrowUpDown className="h-4 w-4" />
                                        Sort
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                                    <DropdownMenuItem className="text-gray-700 dark:text-gray-300">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Date
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-gray-700 dark:text-gray-300">
                                        <Info className="h-4 w-4 mr-2" />
                                        Status
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-gray-700 dark:text-gray-300">
                                        <Flag className="h-4 w-4 mr-2" />
                                        Urgency
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* View Toggle */}
                            {!selectMode && tabHasData && (
                                <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                                    <Button
                                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('grid')}
                                        className={cn(
                                            "h-8 w-8 p-0",
                                            viewMode === 'grid' && "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white"
                                        )}
                                    >
                                        <Grid className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('list')}
                                        className={cn(
                                            "h-8 w-8 p-0",
                                            viewMode === 'list' && "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white"
                                        )}
                                    >
                                        <List className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}

                            {/* Select Mode Toggle */}
                            {tabHasData && (
                                <Button
                                    variant={selectMode ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={toggleSelectMode}
                                    className="gap-2 rounded-xl border-gray-200 dark:border-gray-700"
                                >
                                    <Square className="h-4 w-4" />
                                    {selectMode ? 'Cancel' : 'Select'}
                                </Button>
                            )}
                        </div>
                    </div>
                    
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
                            {/* Mobile View Mode Toggle */}
                            {isMobile && tabHasData && !selectMode && (
                                <div className="mb-4">
                                    <div className="flex gap-2">
                                        <Button
                                            variant={viewMode === 'grid' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setViewMode('grid')}
                                            className="flex-1 rounded-lg"
                                        >
                                            <Grid className="h-4 w-4 mr-2" />
                                            Grid View
                                        </Button>
                                        <Button
                                            variant={viewMode === 'list' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setViewMode('list')}
                                            className="flex-1 rounded-lg"
                                        >
                                            <List className="h-4 w-4 mr-2" />
                                            List View
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={toggleSelectMode}
                                            className="flex-1 rounded-lg"
                                        >
                                            <Square className="h-4 w-4 mr-2" />
                                            Select
                                        </Button>
                                    </div>
                                </div>
                            )}
                            
                            {/* Grid View */}
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
                            
                            {/* List/Table View */}
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
                            
                            {/* Pagination */}
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
                    {/* Mobile Header */}
                    {isMobile && (
                        <div className="flex items-center justify-between sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl z-10 py-3 px-4 -mx-4">
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Community Reports</h1>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {stats.total} report{stats.total !== 1 ? 's' : ''} total
                                    {currentResident && (
                                        <span className="block text-xs">
                                            {currentResident.first_name} {currentResident.last_name}
                                        </span>
                                    )}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowStats(!showStats)}
                                    className="h-8 px-2 rounded-lg border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                                >
                                    {showStats ? (
                                        <ChevronUp className="h-4 w-4" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4" />
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowMobileFilters(true)}
                                    className="h-8 px-2 rounded-lg relative border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                                >
                                    <Filter className="h-4 w-4" />
                                    {hasActiveFilters && (
                                        <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 dark:bg-red-400 rounded-full animate-pulse" />
                                    )}
                                </Button>
                                <Link href="/portal/community-reports/create">
                                    <Button size="sm" className="h-8 px-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                                        <Plus className="h-4 w-4 mr-1" />
                                        Report
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                    
                    {/* Desktop Header */}
                    {!isMobile && (
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                                    Community Reports
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Submit and track community issues, incidents, and concerns
                                    {currentResident && (
                                        <span className="block text-xs mt-1">
                                            Resident: {currentResident.first_name} {currentResident.last_name}
                                        </span>
                                    )}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePrint}
                                    className="gap-2 rounded-xl border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                                >
                                    <Printer className="h-4 w-4" />
                                    Print
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleExport}
                                    disabled={isExporting}
                                    className="gap-2 rounded-xl border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                                >
                                    <Download className="h-4 w-4" />
                                    {isExporting ? 'Exporting...' : 'Export'}
                                </Button>
                                <Link href="/portal/community-reports/create">
                                    <Button className="gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl">
                                        <Plus className="h-4 w-4" />
                                        <span>New Report</span>
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                    
                    {/* Stats Section */}
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
                    
                    {/* Mobile Filter Modal */}
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
                        {/* Status Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Status
                            </label>
                            <ModernSelect
                                value={statusFilter}
                                onValueChange={handleStatusChange}
                                placeholder="All status"
                                options={[
                                    { value: 'all', label: 'All Status' },
                                    { value: 'pending', label: 'Pending' },
                                    { value: 'under_review', label: 'Under Review' },
                                    { value: 'in_progress', label: 'In Progress' },
                                    { value: 'resolved', label: 'Resolved' },
                                    { value: 'rejected', label: 'Rejected' },
                                ]}
                                disabled={loading}
                                icon={Filter}
                            />
                        </div>

                        {/* Urgency Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Urgency
                            </label>
                            <ModernSelect
                                value={urgencyFilter}
                                onValueChange={handleUrgencyChange}
                                placeholder="All urgency"
                                options={[
                                    { value: 'all', label: 'All Urgency' },
                                    { value: 'low', label: 'Low' },
                                    { value: 'medium', label: 'Medium' },
                                    { value: 'high', label: 'High' },
                                ]}
                                disabled={loading}
                            />
                        </div>

                        {/* Category Filter */}
                        {filterOptions?.categories?.length > 0 && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Category
                                </label>
                                <ModernSelect
                                    value={categoryFilter}
                                    onValueChange={handleCategoryChange}
                                    placeholder="All categories"
                                    options={[
                                        { value: 'all', label: 'All Categories' },
                                        ...filterOptions.categories.map(cat => ({
                                            value: cat,
                                            label: cat
                                        }))
                                    ]}
                                    disabled={loading}
                                />
                            </div>
                        )}

                        {/* Report Type Filter */}
                        {filterOptions?.reportTypes?.length > 0 && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Report Type
                                </label>
                                <ModernSelect
                                    value={typeFilter}
                                    onValueChange={handleTypeChange}
                                    placeholder="All types"
                                    options={[
                                        { value: 'all', label: 'All Types' },
                                        ...filterOptions.reportTypes.map(type => ({
                                            value: type.id.toString(),
                                            label: type.name
                                        }))
                                    ]}
                                    disabled={loading}
                                />
                            </div>
                        )}
                    </ModernFilterModal>
                    
                    {/* Desktop Filters */}
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
                    
                    {/* Tabs Section */}
                    <div className="mt-4">
                        <CustomTabs
                            statusFilter={statusFilter}
                            handleTabChange={handleTabChange}
                            getStatusCount={(status) => getStatusCount(stats, status)}
                            tabsConfig={REPORT_TABS}
                        />
                        
                        {/* Tab Content */}
                        <div className="mt-4">
                            {renderTabContent()}
                        </div>
                    </div>
                </div>
                
                {/* Mobile FAB - repositioned to avoid footer */}
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
                
                {/* Mobile Footer */}
                <div className="md:hidden">
                    <ResidentMobileFooter />
                </div>
                
                {/* Loading Overlay */}
                <ModernLoadingOverlay loading={loading} message="Loading reports..." />
            </ResidentLayout>
        </>
    );
}