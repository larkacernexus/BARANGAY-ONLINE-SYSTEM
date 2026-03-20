import { useState, useEffect, useMemo, useRef } from 'react';
import ResidentLayout from '@/layouts/resident-app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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
    CreditCard,
    XCircle,
    User,
    Clock,
    SlidersHorizontal,
    ArrowUpDown,
    DownloadCloud,
    Sparkles,
    Receipt,
    TrendingUp,
    Wallet,
    AlertTriangle,
    CheckCircle2,
    CalendarDays,
    DollarSign,
    PieChart,
    RefreshCw,
    Menu,
    Home,
    Info,
} from 'lucide-react';
import { Link, usePage, router, Head } from '@inertiajs/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Import reusable components
import { StatusBadge } from '@/components/residentui/StatusBadge';
import { CustomTabs } from '@/components/residentui/CustomTabs';
import { ModernSelect } from '@/components/residentui/modern-select';
import { ModernFilterModal } from '@/components/residentui/modern-filter-modal';
import { ModernStatsCards } from '@/components/residentui/modern-stats-cards';
import { ModernEmptyState } from '@/components/residentui/modern-empty-state';
import { ModernPagination } from '@/components/residentui/modern-pagination';
import { ModernLoadingOverlay } from '@/components/residentui/modern-loading-overlay';
import { ModernSelectionBanner } from '@/components/residentui/modern-selection-banner';

// Import fee-specific components
import { getFeeStatsCards } from '@/components/residentui/fees/constants';
import { ModernFeeFilters } from '@/components/residentui/fees/modern-fee-filters';
import { ModernFeeCard } from '@/components/residentui/fees/modern-fee-card';
import { ModernFeeGridCard } from '@/components/residentui/fees/modern-fee-grid-card';
import { formatDate, formatCurrency, getCategoryDisplay, getStatusCount, printFeesList, exportToCSV } from '@/components/residentui/fees/fee-utils';

// Import shadcn components
import * as SelectPrimitive from '@radix-ui/react-select';
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface DocumentCategory {
    id: number;
    name: string;
    slug: string;
}

interface FeeType {
    id: number;
    code: string;
    name: string;
    category: string;
    category_display: string;
    document_category?: DocumentCategory | null;
}

interface Fee {
    id: number;
    fee_code: string;
    or_number?: string;
    certificate_number?: string;
    purpose: string;
    payer_name: string;
    address: string;
    purok?: string;
    zone?: string;
    billing_period?: string;
    issue_date: string;
    due_date: string;
    period_start?: string;
    period_end?: string;
    base_amount: number;
    surcharge_amount: number;
    penalty_amount: number;
    discount_amount: number;
    total_amount: number;
    amount_paid: number;
    balance: number;
    status: string;
    remarks?: string;
    formatted_issue_date: string;
    formatted_due_date: string;
    formatted_total: string;
    formatted_balance: string;
    formatted_amount_paid: string;
    is_overdue: boolean;
    days_overdue: number;
    fee_type?: FeeType;
    resident?: {
        id: number;
        first_name: string;
        last_name: string;
        middle_name?: string;
    };
}

interface PageProps extends Record<string, any> {
    fees?: {
        data: Fee[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    stats?: {
        total_fees: number;
        pending_fees: number;
        overdue_fees: number;
        paid_fees: number;
        issued_fees?: number;
        cancelled_fees?: number;
        total_balance: number;
        total_paid: number;
        current_year_total: number;
        current_year_paid: number;
        current_year_balance: number;
    };
    availableYears?: number[];
    availableFeeTypes?: Array<{
        id: number;
        code: string;
        name: string;
        category: string;
        category_display: string;
        document_category?: DocumentCategory | null;
    }>;
    householdResidents?: Array<{
        id: number;
        first_name: string;
        last_name: string;
        middle_name?: string;
    }>;
    currentResident?: {
        id: number;
        first_name: string;
        last_name: string;
    };
    hasProfile?: boolean;
    filters?: {
        search?: string;
        status?: string;
        fee_type?: string;
        year?: string;
        resident?: string;
        page?: string;
    };
    error?: string;
}

export default function MyFees() {
    const page = usePage<PageProps>();
    const pageProps = page.props;
    
    const fees = pageProps.fees || {
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
        total_fees: 0,
        pending_fees: 0,
        overdue_fees: 0,
        paid_fees: 0,
        issued_fees: 0,
        cancelled_fees: 0,
        total_balance: 0,
        total_paid: 0,
        current_year_total: 0,
        current_year_paid: 0,
        current_year_balance: 0,
    };
    
    const availableYears = pageProps.availableYears || [];
    const availableFeeTypes = pageProps.availableFeeTypes || [];
    const householdResidents = pageProps.householdResidents || [];
    const currentResident = pageProps.currentResident || { id: 0, first_name: '', last_name: '' };
    const hasProfile = pageProps.hasProfile || false;
    const filters = pageProps.filters || {};
    
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [feeTypeFilter, setFeeTypeFilter] = useState('all');
    const [residentFilter, setResidentFilter] = useState('all');
    const [yearFilter, setYearFilter] = useState('all');
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [showStats, setShowStats] = useState(true);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [selectedFees, setSelectedFees] = useState<number[]>([]);
    const [isExporting, setIsExporting] = useState(false);
    const [selectMode, setSelectMode] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    
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
            setFeeTypeFilter(filters.fee_type || 'all');
            setYearFilter(filters.year || 'all');
            setResidentFilter(filters.resident || 'all');
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
        
        router.get('/portal/fees', cleanFilters, {
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
    
    const handleFeeTypeChange = (type: string) => {
        setFeeTypeFilter(type);
        updateFilters({ 
            fee_type: type === 'all' ? '' : type,
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
        setFeeTypeFilter('all');
        setResidentFilter('all');
        setYearFilter('all');
        
        router.get('/portal/fees', {}, {
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
    
    const toggleSelectFee = (id: number) => {
        setSelectedFees(prev =>
            prev.includes(id)
                ? prev.filter(feeId => feeId !== id)
                : [...prev, id]
        );
    };
    
    const selectAllFees = () => {
        const currentFees = fees.data;
        if (selectedFees.length === currentFees.length && currentFees.length > 0) {
            setSelectedFees([]);
        } else {
            setSelectedFees(currentFees.map(f => f.id));
        }
    };
    
    const toggleSelectMode = () => {
        if (selectMode) {
            setSelectMode(false);
            setSelectedFees([]);
        } else {
            setSelectMode(true);
        }
    };
    
    const getCurrentTabFees = () => {
        return fees.data;
    };
    
    const hasActiveFilters = useMemo(() => {
        return Object.entries(filters).some(([key, value]) => 
            key !== 'page' && value && value !== '' && value !== 'all'
        );
    }, [filters]);
    
    const handlePrintFees = () => {
        const currentFees = getCurrentTabFees();
        printFeesList(currentFees, statusFilter, formatDate, getCategoryDisplay, formatCurrency);
    };
    
    const handleExportCSV = () => {
        const currentFees = getCurrentTabFees();
        exportToCSV(currentFees, statusFilter, formatDate, getCategoryDisplay, setIsExporting, toast);
    };
    
    const renderTabContent = () => {
        const currentFees = getCurrentTabFees();
        const tabHasData = currentFees.length > 0;
        
        return (
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
                <CardContent className="p-4 md:p-6">
                    {/* Selection Mode Banner */}
                    {selectMode && tabHasData && (
                        <ModernSelectionBanner
                            selectedCount={selectedFees.length}
                            totalCount={currentFees.length}
                            onSelectAll={selectAllFees}
                            onDeselectAll={() => setSelectedFees([])}
                            onCancel={toggleSelectMode}
                            onDelete={() => {
                                toast.success(`Deleted ${selectedFees.length} fees`);
                                setSelectedFees([]);
                                setSelectMode(false);
                            }}
                            deleteLabel="Delete Selected"
                        />
                    )}
                    
                    {/* Header with Sort */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {statusFilter === 'all' ? 'All' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Fees
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {tabHasData 
                                    ? `Showing ${currentFees.length} fee${currentFees.length !== 1 ? 's' : ''}`
                                    : `No ${statusFilter === 'all' ? 'fees' : statusFilter.replace('_', ' ')} found`
                                }
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            {/* Sort Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <ArrowUpDown className="h-4 w-4" />
                                        Sort
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem onClick={() => {
                                        setSortBy('date');
                                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                                    }}>
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {
                                        setSortBy('amount');
                                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                                    }}>
                                        <DollarSign className="h-4 w-4 mr-2" />
                                        Amount {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {
                                        setSortBy('status');
                                        setSortOrder('asc');
                                    }}>
                                        <Info className="h-4 w-4 mr-2" />
                                        Status
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* View Toggle */}
                            {!selectMode && tabHasData && (
                                <div className="flex gap-1 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
                                    <Button
                                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('grid')}
                                        className={cn(
                                            "h-8 w-8 p-0",
                                            viewMode === 'grid' && "bg-white dark:bg-gray-700 shadow-sm"
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
                                            viewMode === 'list' && "bg-white dark:bg-gray-700 shadow-sm"
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
                                    className="gap-2"
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
                        />
                    ) : (
                        <>
                            {/* Grid View */}
                            {viewMode === 'grid' && (
                                <div className={cn(
                                    isMobile ? "space-y-3" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                                )}>
                                    {currentFees.map((fee) => (
                                        isMobile ? (
                                            <ModernFeeCard
                                                key={`fee-${fee.id}`}
                                                fee={fee}
                                                selectMode={selectMode}
                                                selectedFees={selectedFees}
                                                toggleSelectFee={toggleSelectFee}
                                                getCategoryDisplay={getCategoryDisplay}
                                                formatDate={(date) => formatDate(date, isMobile)}
                                                isMobile={isMobile}
                                            />
                                        ) : (
                                            <ModernFeeGridCard
                                                key={`fee-${fee.id}`}
                                                fee={fee}
                                                selectMode={selectMode}
                                                selectedFees={selectedFees}
                                                toggleSelectFee={toggleSelectFee}
                                                getCategoryDisplay={getCategoryDisplay}
                                                formatDate={(date) => formatDate(date, isMobile)}
                                                onPrint={(fee) => {
                                                    printFeesList([fee], 'single', formatDate, getCategoryDisplay, formatCurrency);
                                                }}
                                            />
                                        )
                                    ))}
                                </div>
                            )}
                            
                            {/* List View */}
                            {viewMode === 'list' && !isMobile && (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="hover:bg-transparent">
                                                {selectMode && (
                                                    <TableHead className="w-12">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedFees.length === currentFees.length && currentFees.length > 0}
                                                            onChange={selectAllFees}
                                                            className="h-4 w-4 rounded border-gray-300"
                                                        />
                                                    </TableHead>
                                                )}
                                                <TableHead className="font-semibold">Fee Details</TableHead>
                                                <TableHead className="font-semibold">Dates</TableHead>
                                                <TableHead className="font-semibold">Amount</TableHead>
                                                <TableHead className="font-semibold">Status</TableHead>
                                                <TableHead className="font-semibold text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {currentFees.map((fee) => (
                                                <TableRow key={`table-${fee.id}`} className="group hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
                                                    {selectMode && (
                                                        <TableCell>
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedFees.includes(fee.id)}
                                                                onChange={() => toggleSelectFee(fee.id)}
                                                                className="h-4 w-4 rounded border-gray-300"
                                                            />
                                                        </TableCell>
                                                    )}
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <button
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(fee.fee_code);
                                                                    toast.success(`Copied: ${fee.fee_code}`);
                                                                }}
                                                                className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                                                            >
                                                                {fee.fee_code}
                                                            </button>
                                                            <p className="font-medium text-gray-900 dark:text-white">
                                                                {fee.purpose}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                {getCategoryDisplay(fee.fee_type)}
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div>
                                                                <p className="text-xs text-gray-500">Issued</p>
                                                                <p className="text-sm">{formatDate(fee.issue_date)}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-gray-500">Due</p>
                                                                <p className={cn(
                                                                    "text-sm",
                                                                    fee.is_overdue && "text-red-600 font-medium"
                                                                )}>
                                                                    {formatDate(fee.due_date)}
                                                                    {fee.is_overdue && fee.days_overdue > 0 && (
                                                                        <span className="ml-1 text-xs text-red-500">
                                                                            ({fee.days_overdue}d)
                                                                        </span>
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <p className="font-bold text-gray-900 dark:text-white">
                                                                {fee.formatted_total}
                                                            </p>
                                                            {fee.balance > 0 ? (
                                                                <p className="text-sm font-medium text-red-600">
                                                                    Balance: {fee.formatted_balance}
                                                                </p>
                                                            ) : (
                                                                <p className="text-sm font-medium text-emerald-600">
                                                                    Paid: {fee.formatted_amount_paid}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <StatusBadge status={fee.status} isOverdue={fee.is_overdue} />
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Link href={`/portal/fees/${fee.id}`}>
                                                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                                                <Eye className="h-4 w-4" />
                                                                            </Button>
                                                                        </Link>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>View Details</TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                            
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                                        <MoreVertical className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="w-48">
                                                                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(fee.fee_code)}>
                                                                        <Copy className="h-4 w-4 mr-2" />
                                                                        Copy Fee Code
                                                                    </DropdownMenuItem>
                                                                    {fee.or_number && (
                                                                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(fee.or_number)}>
                                                                            <Copy className="h-4 w-4 mr-2" />
                                                                            Copy OR Number
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    <DropdownMenuItem>
                                                                        <FileText className="h-4 w-4 mr-2" />
                                                                        Generate Report
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={handlePrintFees}>
                                                                        <Printer className="h-4 w-4 mr-2" />
                                                                        Print
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                            
                            {/* Pagination */}
                            {fees.last_page > 1 && (
                                <div className="mt-6">
                                    <ModernPagination
                                        currentPage={fees.current_page}
                                        lastPage={fees.last_page}
                                        onPageChange={(page) => updateFilters({ page: page.toString() })}
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
    
    if (!hasProfile) {
        return (
            <ResidentLayout
                breadcrumbs={[
                    { title: 'Dashboard', href: '/portal/dashboard' },
                    { title: 'My Fees', href: '/portal/fees' }
                ]}
            >
                <Head title="My Fees" />
               
            </ResidentLayout>
        );
    }
    
    if (pageProps.error) {
        return (
            <ResidentLayout
                breadcrumbs={[
                    { title: 'Dashboard', href: '/portal/dashboard' },
                    { title: 'My Fees', href: '/portal/fees' }
                ]}
            >
                <div className="space-y-6">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">My Fees</h1>
                    </div>
                    <Card className="border-0 shadow-lg">
                        <CardContent className="py-12 text-center">
                            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-2xl flex items-center justify-center mb-4">
                                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Error</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                {pageProps.error}
                            </p>
                            <Button 
                                onClick={() => window.location.href = '/dashboard'}
                                className="bg-gradient-to-r from-blue-500 to-blue-600"
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
            <Head title="My Fees" />
            
            <ResidentLayout
                breadcrumbs={[
                    { title: 'Dashboard', href: '/portal/dashboard' },
                    { title: 'My Fees', href: '/portal/fees' }
                ]}
            >
                <div className="space-y-4 md:space-y-6 pb-20 md:pb-6">
                    {/* Mobile Header */}
                    {isMobile && (
                        <div className="flex items-center justify-between sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl z-10 py-3 px-4 -mx-4">
                            <div>
                                <h1 className="text-xl font-bold">My Fees</h1>
                                <p className="text-xs text-gray-500">
                                    {stats.total_fees} fee{stats.total_fees !== 1 ? 's' : ''} total
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowStats(!showStats)}
                                    className="h-8 px-2 rounded-lg"
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
                                    className="h-8 px-2 rounded-lg relative"
                                >
                                    <Filter className="h-4 w-4" />
                                    {hasActiveFilters && (
                                        <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                    
                    {/* Desktop Header */}
                    {!isMobile && (
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                                    My Fees
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    View and manage your barangay fees and assessments
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePrintFees}
                                    className="gap-2"
                                >
                                    <Printer className="h-4 w-4" />
                                    Print
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleExportCSV}
                                    disabled={isExporting}
                                    className="gap-2"
                                >
                                    <Download className="h-4 w-4" />
                                    {isExporting ? 'Exporting...' : 'Export'}
                                </Button>
                            </div>
                        </div>
                    )}
                    
                    {/* Stats Section */}
                    {showStats && (
                        <div className="animate-slide-down">
                            <ModernStatsCards cards={getFeeStatsCards(stats)} loading={loading} />
                        </div>
                    )}
                    
                    {/* Desktop Filters */}
                    {!isMobile && (
                        <ModernFeeFilters
                            search={search}
                            setSearch={setSearch}
                            handleSearchSubmit={handleSearchSubmit}
                            handleSearchClear={handleSearchClear}
                            feeTypeFilter={feeTypeFilter}
                            handleFeeTypeChange={handleFeeTypeChange}
                            residentFilter={residentFilter}
                            handleResidentChange={handleResidentChange}
                            yearFilter={yearFilter}
                            handleYearChange={handleYearChange}
                            loading={loading}
                            availableFeeTypes={availableFeeTypes}
                            availableYears={availableYears}
                            householdResidents={householdResidents}
                            printFees={handlePrintFees}
                            exportToCSV={handleExportCSV}
                            isExporting={isExporting}
                            hasActiveFilters={hasActiveFilters}
                            handleClearFilters={handleClearFilters}
                            onCopySummary={() => {
                                const summary = `Fees Summary:\n` +
                                    `Total: ${availableFeeTypes.length}\n` +
                                    `Filtered: ${feeTypeFilter !== 'all' ? 'Yes' : 'No'}`;
                                navigator.clipboard.writeText(summary);
                                toast.success('Summary copied');
                            }}
                        />
                    )}
                    
                    {/* Custom Tabs */}
                    <div className="mt-4">
                        <CustomTabs 
                            statusFilter={statusFilter}
                            handleTabChange={handleTabChange}
                            getStatusCount={(status) => getStatusCount(stats, status, fees.data)}
                        />
                        
                        {/* Tab Content */}
                        <div className="mt-4">
                            {renderTabContent()}
                        </div>
                    </div>
                </div>
                
                
                {/* Mobile Filter Modal */}
                <ModernFilterModal
                    isOpen={showMobileFilters}
                    onClose={() => setShowMobileFilters(false)}
                    title="Filter Fees"
                    description={hasActiveFilters ? 'Filters are currently active' : 'No filters applied'}
                    search={search}
                    onSearchChange={setSearch}
                    onSearchSubmit={handleSearchSubmit}
                    onSearchClear={handleSearchClear}
                    loading={loading}
                    hasActiveFilters={hasActiveFilters}
                    onClearFilters={handleClearFilters}
                >
                    {/* Fee Type Filter */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Fee Type
                        </label>
                        <ModernSelect
                            value={feeTypeFilter}
                            onValueChange={handleFeeTypeChange}
                            placeholder="All fee types"
                            options={availableFeeTypes.map(type => ({
                                value: type.id.toString(),
                                label: type.name
                            }))}
                            disabled={loading}
                            icon={Receipt}
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
                                    label: `${resident.first_name} ${resident.last_name}`
                                }))}
                                disabled={loading}
                                icon={User}
                            />
                        </div>
                    )}

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
                
                {/* Loading Overlay */}
                <ModernLoadingOverlay loading={loading} message="Loading fees..." />
            </ResidentLayout>
        </>
    );
}