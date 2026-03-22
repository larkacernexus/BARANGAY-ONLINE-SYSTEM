import { useState, useEffect, useMemo, useRef } from 'react';
import ResidentLayout from '@/layouts/resident-app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Link, usePage, router, Head } from '@inertiajs/react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  DollarSign,
  FileCheck,
  User,
  XCircle,
  CheckCircle,
  Zap,
  Mail,
  ArrowUpDown,
  Info,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Reusable Components
import { CustomTabs } from '@/components/residentui/CustomTabs';
import { ModernSelect } from '@/components/residentui/modern-select';
import { ModernFilterModal } from '@/components/residentui/modern-filter-modal';
import { ModernStatsCards } from '@/components/residentui/modern-stats-cards';
import { ModernEmptyState } from '@/components/residentui/modern-empty-state';
import { ModernPagination } from '@/components/residentui/modern-pagination';
import { ModernLoadingOverlay } from '@/components/residentui/modern-loading-overlay';
import { ModernSelectionBanner } from '@/components/residentui/modern-selection-banner';

// Clearance-specific components
import { 
  STATUS_CONFIG, 
  URGENCY_CONFIG, 
  CLEARANCE_TABS,
  getClearanceStatsCards 
} from '@/components/residentui/clearances/constants';
import {
  formatDate,
  formatCurrency,
  getClearanceTypeDisplay,
  getUrgencyBadge,
  getStatusCount,
  copyToClipboard,
  printClearancesList,
  exportClearancesToCSV,
} from '@/components/residentui/clearances/clearance-utils';
import { ModernClearanceCard } from '@/components/residentui/clearances/modern-clearance-card';
import { ModernClearanceGridCard } from '@/components/residentui/clearances/modern-clearance-grid-card';
import { ModernClearanceFilters } from '@/components/residentui/clearances/modern-clearance-filters';
import { ModernClearanceTable } from '@/components/residentui/clearances/modern-clearance-table';

// Types
interface ClearanceType {
    id: number;
    name: string;
    code: string;
    fee: number | string;
    processing_days: number;
}

interface Resident {
    id: number;
    first_name: string;
    last_name: string;
    middle_name?: string;
    suffix?: string;
}

interface ClearanceRequest {
    id: number;
    resident_id: number;
    clearance_type_id?: number;
    reference_number: string;
    clearance_number?: string;
    status: string;
    purpose: string;
    specific_purpose?: string;
    urgency: 'normal' | 'rush' | 'express';
    needed_date: string;
    additional_requirements?: string;
    fee_amount: number | string;
    issue_date?: string;
    valid_until?: string;
    remarks?: string;
    issuing_officer_name?: string;
    created_at: string;
    updated_at: string;
    resident?: Resident;
    clearance_type?: ClearanceType;
    formatted_created_at: string;
    formatted_needed_date: string;
    formatted_issue_date?: string;
    formatted_fee: string;
    is_urgent: boolean;
    days_until_needed: number;
}

interface Household {
    id: number;
    household_number: string;
    head_of_family: string;
    head_resident_id?: number;
}

interface PageProps extends Record<string, any> {
    clearances?: {
        data: ClearanceRequest[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    stats?: {
        total_clearances: number;
        pending_clearances: number;
        pending_payment_clearances: number;
        processing_clearances: number;
        approved_clearances: number;
        issued_clearances: number;
        rejected_clearances: number;
        cancelled_clearances: number;
        total_fees: number;
        total_paid: number;
        total_balance: number;
        current_year_total: number;
        current_year_issued: number;
    };
    availableYears?: number[];
    availableClearanceTypes?: ClearanceType[];
    householdResidents?: Resident[];
    currentResident?: {
        id: number;
        first_name: string;
        last_name: string;
    };
    household?: Household;
    filters?: {
        search?: string;
        status?: string;
        clearance_type?: string;
        year?: string;
        resident?: string;
        urgency?: string;
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
        <Badge variant="outline" className={`${config.color} ${config.textColor} border-0`}>
            <span className={`h-2 w-2 rounded-full ${config.dot} mr-2`}></span>
            <span>{config.label}</span>
        </Badge>
    );
};

// CollapsibleStats Component (Mobile)
const CollapsibleStats = ({ 
    showStats, 
    setShowStats, 
    stats, 
    formatCurrency 
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
                    cards={getClearanceStatsCards(stats, formatCurrency)} 
                    loading={false}
                    gridCols="grid-cols-2"
                />
            </div>
        )}
    </div>
);

// DesktopStats Component
const DesktopStats = ({ 
    stats, 
    formatCurrency 
}: any) => (
    <div className="hidden md:block">
        <ModernStatsCards 
            cards={getClearanceStatsCards(stats, formatCurrency)} 
            loading={false}
        />
    </div>
);

export default function MyClearances() {
    const page = usePage<PageProps>();
    const pageProps = page.props;
    
    const clearances = pageProps.clearances || {
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
        total_clearances: 0,
        pending_clearances: 0,
        pending_payment_clearances: 0,
        processing_clearances: 0,
        approved_clearances: 0,
        issued_clearances: 0,
        rejected_clearances: 0,
        cancelled_clearances: 0,
        total_fees: 0,
        total_paid: 0,
        total_balance: 0,
        current_year_total: 0,
        current_year_issued: 0,
    };
    
    const availableYears = pageProps.availableYears || [];
    const availableClearanceTypes = pageProps.availableClearanceTypes || [];
    const householdResidents = pageProps.householdResidents || [];
    const currentResident = pageProps.currentResident || { id: 0, first_name: '', last_name: '' };
    const household = pageProps.household || { id: 0, household_number: '', head_of_family: '' };
    const filters = pageProps.filters || {};
    
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [clearanceTypeFilter, setClearanceTypeFilter] = useState(filters.clearance_type || 'all');
    const [residentFilter, setResidentFilter] = useState(filters.resident || 'all');
    const [urgencyFilter, setUrgencyFilter] = useState(filters.urgency || 'all');
    const [yearFilter, setYearFilter] = useState(filters.year || 'all');
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [showStats, setShowStats] = useState(true);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [selectedClearances, setSelectedClearances] = useState<number[]>([]);
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
            setClearanceTypeFilter(filters.clearance_type || 'all');
            setResidentFilter(filters.resident || 'all');
            setUrgencyFilter(filters.urgency || 'all');
            setYearFilter(filters.year || 'all');
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
        
        router.get('/portal/my-clearances', cleanFilters, {
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
    
    const handleClearanceTypeChange = (type: string) => {
        setClearanceTypeFilter(type);
        updateFilters({ 
            clearance_type: type === 'all' ? '' : type,
            page: '1'
        });
        if (isMobile) setShowMobileFilters(false);
    };
    
    const handleResidentChange = (resident: string) => {
        setResidentFilter(resident);
        updateFilters({ 
            resident: resident === 'all' ? '' : resident,
            page: '1'
        });
        if (isMobile) setShowMobileFilters(false);
    };
    
    const handleUrgencyChange = (urgency: string) => {
        setUrgencyFilter(urgency);
        updateFilters({ 
            urgency: urgency === 'all' ? '' : urgency,
            page: '1'
        });
        if (isMobile) setShowMobileFilters(false);
    };
    
    const handleYearChange = (year: string) => {
        setYearFilter(year);
        updateFilters({ 
            year: year === 'all' ? '' : year,
            page: '1'
        });
        if (isMobile) setShowMobileFilters(false);
    };
    
    const handleClearFilters = () => {
        setSearch('');
        setStatusFilter('all');
        setClearanceTypeFilter('all');
        setResidentFilter('all');
        setUrgencyFilter('all');
        setYearFilter('all');
        
        router.get('/portal/my-clearances', {}, {
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
    const toggleSelectClearance = (id: number) => {
        setSelectedClearances(prev =>
            prev.includes(id)
                ? prev.filter(clearanceId => clearanceId !== id)
                : [...prev, id]
        );
    };
    
    const selectAllClearances = () => {
        const currentClearances = clearances.data;
        if (selectedClearances.length === currentClearances.length && currentClearances.length > 0) {
            setSelectedClearances([]);
        } else {
            setSelectedClearances(currentClearances.map(c => c.id));
        }
    };
    
    const toggleSelectMode = () => {
        if (selectMode) {
            setSelectMode(false);
            setSelectedClearances([]);
        } else {
            setSelectMode(true);
        }
    };
    
    const handleDeleteSelected = () => {
        if (confirm(`Are you sure you want to delete ${selectedClearances.length} selected clearance requests?`)) {
            toast.success(`Deleted ${selectedClearances.length} clearance requests`);
            setSelectedClearances([]);
            setSelectMode(false);
        }
    };
    
    const handleViewDetails = (id: number) => {
        router.visit(`/portal/my-clearances/${id}`);
    };
    
    const handleMakePayment = (id: number) => {
        router.visit(`/portal/payments/create?clearance_id=${id}`);
    };
    
    const handleDownloadClearance = (clearance: any) => {
        toast.info('Download functionality would be implemented here');
    };
    
    const handleGenerateReport = (clearance: any) => {
        const reportWindow = window.open('', '_blank');
        if (reportWindow) {
            reportWindow.document.write(`
                <h1>Clearance Request Details: ${clearance.reference_number}</h1>
                <p><strong>Type:</strong> ${getClearanceTypeDisplay(clearance.clearance_type)}</p>
                <p><strong>Purpose:</strong> ${clearance.purpose}</p>
                <p><strong>Fee:</strong> ${formatCurrency(clearance.fee_amount)}</p>
                <p><strong>Status:</strong> ${clearance.status}</p>
            `);
        }
    };
    
    const handleReportIssue = (clearance: any) => {
        toast.info('Report issue feature would open a form');
    };
    
    const handleCopyReference = (ref: string) => {
        copyToClipboard(ref, `Copied: ${ref}`);
    };
    
    const getCurrentTabClearances = () => {
        return clearances.data;
    };
    
    const hasActiveFilters = useMemo(() => {
        return Object.entries(filters).some(([key, value]) => 
            key !== 'page' && value && value !== '' && value !== 'all'
        );
    }, [filters]);
    
    const handlePrint = () => {
        printClearancesList(
            clearances.data,
            statusFilter,
            household,
            stats,
            (date: string) => formatDate(date, false),
            formatCurrency,
            getClearanceTypeDisplay
        );
    };
    
    const handleExport = () => {
        exportClearancesToCSV(
            clearances.data,
            statusFilter,
            (date: string) => formatDate(date, false),
            formatCurrency,
            getClearanceTypeDisplay,
            setIsExporting,
            toast
        );
    };
    
    const handleCopySummary = async () => {
        const summary = `My Clearance Requests Summary:\n\n` +
            `Household: ${household?.household_number || 'N/A'}\n` +
            `Head of Family: ${household?.head_of_family || 'N/A'}\n\n` +
            `Total Requests: ${clearances.data.length}\n` +
            `Pending: ${clearances.data.filter(c => c.status === 'pending').length}\n` +
            `Pending Payment: ${clearances.data.filter(c => c.status === 'pending_payment').length}\n` +
            `Processing: ${clearances.data.filter(c => c.status === 'processing').length}\n` +
            `Approved: ${clearances.data.filter(c => c.status === 'approved').length}\n` +
            `Issued: ${clearances.data.filter(c => c.status === 'issued').length}\n` +
            `Rejected: ${clearances.data.filter(c => c.status === 'rejected').length}\n` +
            `Cancelled: ${clearances.data.filter(c => c.status === 'cancelled').length}\n\n` +
            `Total Fees: ${formatCurrency(stats.total_fees)}\n` +
            `Total Paid: ${formatCurrency(stats.total_paid)}\n` +
            `Balance Due: ${formatCurrency(stats.total_balance)}\n\n` +
            `Generated on: ${new Date().toLocaleDateString()}\n` +
            `View online: ${window.location.origin}/portal/my-clearances`;
        
        await copyToClipboard(summary, 'Summary copied to clipboard');
    };
    
    const handleEmailSummary = () => {
        const body = `
Hello,

Here's a summary of my clearance requests:

Total Requests: ${clearances.data.length}
- Pending: ${clearances.data.filter(c => c.status === 'pending').length}
- Pending Payment: ${clearances.data.filter(c => c.status === 'pending_payment').length}
- Processing: ${clearances.data.filter(c => c.status === 'processing').length}
- Approved: ${clearances.data.filter(c => c.status === 'approved').length}
- Issued: ${clearances.data.filter(c => c.status === 'issued').length}
- Rejected: ${clearances.data.filter(c => c.status === 'rejected').length}
- Cancelled: ${clearances.data.filter(c => c.status === 'cancelled').length}

Total Fees: ${formatCurrency(stats.total_fees)}
Total Paid: ${formatCurrency(stats.total_paid)}
Balance Due: ${formatCurrency(stats.total_balance)}

This summary was generated from the Barangay Management System.

Best regards,
${currentResident?.first_name} ${currentResident?.last_name}
        `.trim();
        
        const subject = `My Clearance Requests Summary - ${new Date().toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };
    
    const handlePageChange = (page: number) => {
        updateFilters({ page: page.toString() });
    };
    
    const renderTabContent = () => {
        const currentClearances = getCurrentTabClearances();
        const tabHasData = currentClearances.length > 0;
        
        const displayStatus = statusFilter && statusFilter !== 'all' 
            ? statusFilter.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
            : 'All';
        
        const emptyStateStatus = statusFilter === 'all' ? 'clearance requests' : (statusFilter || '').replace(/_/g, ' ');
        
        return (
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
                <CardContent className="p-4 md:p-6">
                    <ModernSelectionBanner
                        selectMode={selectMode}
                        selectedCount={selectedClearances.length}
                        totalCount={currentClearances.length}
                        onSelectAll={selectAllClearances}
                        onDeselectAll={() => setSelectedClearances([])}
                        onCancel={() => {
                            setSelectMode(false);
                            setSelectedClearances([]);
                        }}
                        onDelete={handleDeleteSelected}
                        deleteLabel="Delete Selected"
                    />
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {displayStatus} Clearance Requests
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {tabHasData 
                                    ? `Showing ${currentClearances.length} request${currentClearances.length !== 1 ? 's' : ''}`
                                    : `No ${emptyStateStatus} found`
                                }
                                {selectMode && selectedClearances.length > 0 && ` • ${selectedClearances.length} selected`}
                                {(clearanceTypeFilter !== 'all' || residentFilter !== 'all' || urgencyFilter !== 'all' || yearFilter !== 'all' || search) && ' (filtered)'}
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
                                        <DollarSign className="h-4 w-4 mr-2" />
                                        Amount
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-gray-700 dark:text-gray-300">
                                        <Info className="h-4 w-4 mr-2" />
                                        Status
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
                            status={statusFilter || 'all'}
                            hasFilters={hasActiveFilters}
                            onClearFilters={handleClearFilters}
                            icon={statusFilter === 'all' ? FileText : 
                                  statusFilter === 'pending' ? Clock :
                                  statusFilter === 'pending_payment' ? DollarSign :
                                  statusFilter === 'processing' ? Loader2 :
                                  statusFilter === 'approved' ? CheckCircle :
                                  statusFilter === 'issued' ? FileCheck :
                                  statusFilter === 'rejected' || statusFilter === 'cancelled' ? XCircle : FileText}
                        />
                    ) : (
                        <>
                            {viewMode === 'grid' && (
                                <>
                                    {isMobile && (
                                        <div className="pb-4">
                                            {currentClearances.map((clearance) => (
                                                <ModernClearanceCard
                                                    key={clearance.id}
                                                    clearance={clearance}
                                                    selectMode={selectMode}
                                                    selectedClearances={selectedClearances}
                                                    toggleSelectClearance={toggleSelectClearance}
                                                    getClearanceTypeDisplay={getClearanceTypeDisplay}
                                                    formatDate={(date) => formatDate(date, isMobile)}
                                                    formatCurrency={formatCurrency}
                                                    currentResident={currentResident}
                                                    onCopyReference={handleCopyReference}
                                                    onViewDetails={handleViewDetails}
                                                    onMakePayment={handleMakePayment}
                                                    onDownloadClearance={handleDownloadClearance}
                                                    onGenerateReport={handleGenerateReport}
                                                    onReportIssue={handleReportIssue}
                                                    isMobile={isMobile}
                                                />
                                            ))}
                                        </div>
                                    )}
                                    
                                    {!isMobile && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {currentClearances.map((clearance) => (
                                                <ModernClearanceGridCard
                                                    key={clearance.id}
                                                    clearance={clearance}
                                                    selectMode={selectMode}
                                                    selectedClearances={selectedClearances}
                                                    toggleSelectClearance={toggleSelectClearance}
                                                    getClearanceTypeDisplay={getClearanceTypeDisplay}
                                                    formatDate={(date) => formatDate(date, isMobile)}
                                                    formatCurrency={formatCurrency}
                                                    currentResident={currentResident}
                                                    onCopyReference={handleCopyReference}
                                                    onViewDetails={handleViewDetails}
                                                    onMakePayment={handleMakePayment}
                                                    onDownloadClearance={handleDownloadClearance}
                                                    onGenerateReport={handleGenerateReport}
                                                    onReportIssue={handleReportIssue}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                            
                            {viewMode === 'list' && (
                                <ModernClearanceTable
                                    clearances={currentClearances}
                                    selectMode={selectMode}
                                    selectedClearances={selectedClearances}
                                    toggleSelectClearance={toggleSelectClearance}
                                    selectAllClearances={selectAllClearances}
                                    getClearanceTypeDisplay={getClearanceTypeDisplay}
                                    formatDate={(date) => formatDate(date, isMobile)}
                                    formatCurrency={formatCurrency}
                                    currentResident={currentResident}
                                    onCopyReference={handleCopyReference}
                                    onViewDetails={handleViewDetails}
                                    onMakePayment={handleMakePayment}
                                    onDownloadClearance={handleDownloadClearance}
                                    onGenerateReport={handleGenerateReport}
                                    onReportIssue={handleReportIssue}
                                />
                            )}
                            
                            {clearances.last_page > 1 && (
                                <div className="mt-6">
                                    <ModernPagination
                                        currentPage={clearances.current_page}
                                        lastPage={clearances.last_page}
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
                    { title: 'My Clearances', href: '/portal/my-clearances' }
                ]}
            >
                <Head title="My Clearances" />
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
                                onClick={() => window.location.href = '/dashboard'}
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
            <Head title="My Clearances" />
            
            <ResidentLayout
                breadcrumbs={[
                    { title: 'Dashboard', href: '/portal/dashboard' },
                    { title: 'My Clearances', href: '/portal/my-clearances' }
                ]}
            >
                <div className="space-y-4 md:space-y-6 pb-20 md:pb-6">
                    {/* Mobile Header */}
                    {isMobile && (
                        <div className="flex items-center justify-between sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl z-10 py-3 px-4 -mx-4">
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Clearances</h1>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {stats.total_clearances} request{stats.total_clearances !== 1 ? 's' : ''} total
                                    {household && (
                                        <span className="block text-xs">
                                            {household.household_number}
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
                                <Link href="/portal/my-clearances/create">
                                    <Button size="sm" className="h-8 px-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                                        <Plus className="h-4 w-4 mr-1" />
                                        Request
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
                                    My Clearances
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Manage and track your clearance requests
                                    {household && (
                                        <span className="block text-xs mt-1">
                                            Household: {household.household_number} • {household.head_of_family}
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
                                <Link href="/portal/my-clearances/create">
                                    <Button className="gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl">
                                        <Plus className="h-4 w-4" />
                                        <span>New Request</span>
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
                                formatCurrency={formatCurrency}
                            />
                            <DesktopStats
                                stats={stats}
                                formatCurrency={formatCurrency}
                            />
                        </div>
                    )}
                    
                    {/* Mobile Filter Modal */}
                    <ModernFilterModal
                        isOpen={showMobileFilters}
                        onClose={() => setShowMobileFilters(false)}
                        title="Filter Clearance Requests"
                        description={hasActiveFilters ? 'Filters are currently active' : 'No filters applied'}
                        search={search}
                        onSearchChange={setSearch}
                        onSearchSubmit={handleSearchSubmit}
                        onSearchClear={handleSearchClear}
                        loading={loading}
                        hasActiveFilters={hasActiveFilters}
                        onClearFilters={handleClearFilters}
                    >
                        {/* Clearance Type Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Clearance Type
                            </label>
                            <ModernSelect
                                value={clearanceTypeFilter}
                                onValueChange={handleClearanceTypeChange}
                                placeholder="All types"
                                options={availableClearanceTypes.map(type => ({
                                    value: type.id.toString(),
                                    label: type.name
                                }))}
                                disabled={loading}
                                icon={FileText}
                            />
                        </div>

                        {/* Resident Filter */}
                        {householdResidents.length > 0 && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Resident
                                </label>
                                <ModernSelect
                                    value={residentFilter}
                                    onValueChange={handleResidentChange}
                                    placeholder="All residents"
                                    options={householdResidents.map(resident => ({
                                        value: resident.id.toString(),
                                        label: `${resident.first_name} ${resident.last_name}${resident.id === currentResident?.id ? ' (You)' : ''}`
                                    }))}
                                    disabled={loading}
                                    icon={User}
                                />
                            </div>
                        )}

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
                                    { value: 'normal', label: 'Normal' },
                                    { value: 'rush', label: 'Rush' },
                                    { value: 'express', label: 'Express' },
                                ]}
                                disabled={loading}
                            />
                        </div>

                        {/* Year Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Year
                            </label>
                            <ModernSelect
                                value={yearFilter}
                                onValueChange={handleYearChange}
                                placeholder="All years"
                                options={availableYears.map(year => ({
                                    value: year.toString(),
                                    label: year.toString()
                                }))}
                                disabled={loading}
                                icon={Calendar}
                            />
                        </div>
                    </ModernFilterModal>
                    
                    {/* Desktop Filters */}
                    {!isMobile && (
                        <ModernClearanceFilters
                            search={search}
                            setSearch={setSearch}
                            handleSearchSubmit={handleSearchSubmit}
                            handleSearchClear={handleSearchClear}
                            clearanceTypeFilter={clearanceTypeFilter}
                            handleClearanceTypeChange={handleClearanceTypeChange}
                            residentFilter={residentFilter}
                            handleResidentChange={handleResidentChange}
                            urgencyFilter={urgencyFilter}
                            handleUrgencyChange={handleUrgencyChange}
                            yearFilter={yearFilter}
                            handleYearChange={handleYearChange}
                            loading={loading}
                            availableClearanceTypes={availableClearanceTypes}
                            householdResidents={householdResidents}
                            availableYears={availableYears}
                            printClearances={handlePrint}
                            exportToCSV={handleExport}
                            isExporting={isExporting}
                            hasActiveFilters={hasActiveFilters}
                            handleClearFilters={handleClearFilters}
                            onCopySummary={handleCopySummary}
                            onEmailSummary={handleEmailSummary}
                            currentResident={currentResident}
                        />
                    )}
                    
                    {/* Custom Tabs Section */}
                    <div className="mt-4">
                        <CustomTabs
                            key="clearance-tabs"
                            statusFilter={statusFilter || 'all'}
                            handleTabChange={handleTabChange}
                            getStatusCount={(status) => getStatusCount(stats, status)}
                            tabsConfig={CLEARANCE_TABS}
                        />
                        
                        {/* Tab Content */}
                        <div className="mt-4">
                            {renderTabContent()}
                        </div>
                    </div>
                </div>
                
                {/* Mobile FAB */}
                {isMobile && !showMobileFilters && (
                    <div className="fixed bottom-6 right-6 z-50 safe-bottom animate-scale-in">
                        <Link href="/portal/my-clearances/create">
                            <Button 
                                size="lg" 
                                className="rounded-full h-14 w-14 shadow-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                            >
                                <Plus className="h-6 w-6" />
                            </Button>
                        </Link>
                    </div>
                )}
                
                {/* Loading Overlay */}
                <ModernLoadingOverlay loading={loading} message="Loading clearance requests..." />
            </ResidentLayout>
        </>
    );
}