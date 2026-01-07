import { useState, useEffect, useMemo, useRef } from 'react';
import ResidentLayout from '@/layouts/resident-app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Search,
    Filter,
    Eye,
    FileText,
    AlertCircle,
    CheckCircle,
    Clock,
    DollarSign,
    Calendar,
    CreditCard,
    Receipt,
    Loader2,
    ChevronRight,
    Info,
    Menu,
    X,
    Smartphone,
    ChevronDown,
    ChevronUp,
    ChevronLeft,
    ChevronRight as ChevronRightIcon,
    List,
    Grid
} from 'lucide-react';
import { Link, usePage, router, Head } from '@inertiajs/react';
import { toast } from 'sonner';
import { Pagination } from '@/components/ui/pagination';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
    fee_type?: {
        id: number;
        code: string;
        name: string;
        category: string;
        category_display: string;
    };
}

// Use Record<string, any> as base type for Inertia compatibility
interface PageProps extends Record<string, any> {
    fees?: {
        data: Fee[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    stats?: {
        total_fees: number;
        pending_fees: number;
        overdue_fees: number;
        paid_fees: number;
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
    }>;
    hasProfile?: boolean;
    filters?: {
        search?: string;
        status?: string;
        fee_type?: string;
        year?: string;
        page?: string;
    };
}

// Responsive Pagination Component for mobile support
const ResponsivePagination = ({ 
    currentPage, 
    totalPages, 
    onPageChange, 
    isLoading,
    isMobile 
}: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    isLoading: boolean;
    isMobile: boolean;
}) => {
    if (isMobile) {
        return (
            <div className="flex items-center justify-between w-full gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage <= 1 || isLoading}
                    className="flex-1 text-xs"
                >
                    <ChevronLeft className="h-3 w-3 mr-1" />
                    Previous
                </Button>
                
                <div className="px-3 py-1 bg-gray-100 rounded-md text-sm font-medium">
                    {currentPage} / {totalPages}
                </div>
                
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages || isLoading}
                    className="flex-1 text-xs"
                >
                    Next
                    <ChevronRightIcon className="h-3 w-3 ml-1" />
                </Button>
            </div>
        );
    }
    
    return (
        <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            isLoading={isLoading}
        />
    );
};

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
    };
    
    const stats = pageProps.stats || {
        total_fees: 0,
        pending_fees: 0,
        overdue_fees: 0,
        paid_fees: 0,
        total_balance: 0,
        total_paid: 0,
        current_year_total: 0,
        current_year_paid: 0,
        current_year_balance: 0,
    };
    
    const availableYears = pageProps.availableYears || [];
    const availableFeeTypes = pageProps.availableFeeTypes || [];
    const hasProfile = pageProps.hasProfile || false;
    const filters = pageProps.filters || {};
    
    // Initialize state with empty string instead of filters.search
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [feeTypeFilter, setFeeTypeFilter] = useState('all');
    const [yearFilter, setYearFilter] = useState('all');
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [showSummary, setShowSummary] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid'); // Default to grid on mobile

    const hasInitialized = useRef(false);
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);

    // Check if mobile on mount and resize
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) {
                setShowFilters(true);
                setViewMode('list'); // Default to list on desktop
            } else {
                setViewMode('grid'); // Default to grid on mobile
            }
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Initialize filters from props ONLY ONCE
    useEffect(() => {
        if (!hasInitialized.current) {
            setSearch(filters.search || '');
            setStatusFilter(filters.status || 'all');
            setFeeTypeFilter(filters.fee_type || 'all');
            setYearFilter(filters.year || 'all');
            hasInitialized.current = true;
        }
    }, [filters.search, filters.status, filters.fee_type, filters.year]);

    // Search debounce - ONLY trigger when user actively types
    useEffect(() => {
        // Don't run on initial render
        if (!hasInitialized.current) return;
        
        // Don't run if search is empty and we don't have a search filter in URL
        if (search === '' && !filters.search) return;
        
        // Don't run if search hasn't changed from the URL value
        if (search === filters.search) return;

        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        searchTimeout.current = setTimeout(() => {
            updateFilters({ 
                search: search.trim(),
                page: '1' // Reset to first page when searching
            });
        }, 800);

        return () => {
            if (searchTimeout.current) {
                clearTimeout(searchTimeout.current);
            }
        };
    }, [search]); // Only depend on search changes

    const updateFilters = (newFilters: Record<string, string>) => {
        setLoading(true);
        
        const updatedFilters = {
            ...filters,
            ...newFilters,
        };

        // Clean up the filters object
        const cleanFilters: Record<string, string> = {};
        
        Object.entries(updatedFilters).forEach(([key, value]) => {
            // Skip 'page' parameter if it's '1' (default)
            if (key === 'page' && value === '1') {
                return;
            }
            
            // Remove empty values
            if (value && value !== '' && value !== 'all' && value !== undefined) {
                cleanFilters[key] = value;
            }
        });

        router.get('/residentfees', cleanFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onFinish: () => setLoading(false),
        });
    };
    
    const handleStatusChange = (status: string) => {
        setStatusFilter(status);
        updateFilters({ 
            status: status === 'all' ? '' : status,
            page: '1'
        });
        if (isMobile) setShowFilters(false);
    };
    
    const handleFeeTypeChange = (type: string) => {
        setFeeTypeFilter(type);
        updateFilters({ 
            fee_type: type === 'all' ? '' : type,
            page: '1'
        });
        if (isMobile) setShowFilters(false);
    };
    
    const handleYearChange = (year: string) => {
        setYearFilter(year);
        updateFilters({ 
            year: year === 'all' ? '' : year,
            page: '1'
        });
        if (isMobile) setShowFilters(false);
    };
    
    const handleClearFilters = () => {
        setSearch('');
        setStatusFilter('all');
        setFeeTypeFilter('all');
        setYearFilter('all');
        
        // Clear all filters and go to first page
        router.get('/residentfees', {}, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setLoading(false),
        });
        
        if (isMobile) setShowFilters(false);
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
    
    const getStatusBadge = (status: string, isOverdue: boolean) => {
        if (isOverdue) {
            return (
                <Badge className="bg-red-100 text-red-800 hover:bg-red-100 text-xs px-2 py-0.5">
                    <AlertCircle className="h-2.5 w-2.5 mr-1" />
                    Overdue
                </Badge>
            );
        }
        
        switch (status.toLowerCase()) {
            case 'paid':
                return (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs px-2 py-0.5">
                        <CheckCircle className="h-2.5 w-2.5 mr-1" />
                        Paid
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 text-xs px-2 py-0.5">
                        <Clock className="h-2.5 w-2.5 mr-1" />
                        Pending
                    </Badge>
                );
            case 'partially_paid':
                return (
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-xs px-2 py-0.5">
                        <CreditCard className="h-2.5 w-2.5 mr-1" />
                        Partial
                    </Badge>
                );
            case 'issued':
                return (
                    <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 text-xs px-2 py-0.5">
                        <FileText className="h-2.5 w-2.5 mr-1" />
                        Issued
                    </Badge>
                );
            case 'cancelled':
                return (
                    <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 text-xs px-2 py-0.5">
                        <FileText className="h-2.5 w-2.5 mr-1" />
                        Cancelled
                    </Badge>
                );
            default:
                return <Badge variant="outline" className="text-xs px-2 py-0.5">{status}</Badge>;
        }
    };
    
    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isMobile) {
                return date.toLocaleDateString('en-PH', {
                    month: 'short',
                    day: 'numeric',
                });
            }
            return date.toLocaleDateString('en-PH', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch (error) {
            return 'N/A';
        }
    };
    
    const formatCurrency = (amount: number) => {
        if (amount >= 1000000) {
            return `₱${(amount / 1000000).toFixed(1)}M`;
        } else if (amount >= 1000) {
            return `₱${(amount / 1000).toFixed(1)}K`;
        }
        return `₱${amount.toFixed(2)}`;
    };
    
    const hasActiveFilters = useMemo(() => {
        return Object.entries(filters).some(([key, value]) => 
            key !== 'page' && value && value !== '' && value !== 'all'
        );
    }, [filters]);
    
    if (hasProfile === undefined) {
        return (
            <ResidentLayout
                breadcrumbs={[
                    { title: 'Dashboard', href: '/resident/dashboard' },
                    { title: 'My Fees', href: '/residentfees' }
                ]}
            >
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                        <p className="text-gray-600">Loading fees...</p>
                    </div>
                </div>
            </ResidentLayout>
        );
    }
    
    if (!hasProfile) {
        return (
            <ResidentLayout
                breadcrumbs={[
                    { title: 'Dashboard', href: '/resident/dashboard' },
                    { title: 'My Fees', href: '/residentfees' }
                ]}
            >
                <Head title="My Fees" />
                <div className="min-h-[50vh] flex items-center justify-center px-4">
                    <Card className="w-full max-w-md">
                        <CardContent className="pt-6 text-center">
                            <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                                <AlertCircle className="h-8 w-8 text-amber-600" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Complete Your Profile</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                You need to complete your resident profile before you can view fees.
                            </p>
                            <Link href="/resident/profile/create">
                                <Button>
                                    Complete Profile
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </ResidentLayout>
        );
    }
    
    // Mobile-friendly Fee Card Component
    const MobileFeeCard = ({ fee }: { fee: Fee }) => (
        <Card className="mb-3">
            <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
                            <span className="font-medium text-sm">{fee.fee_code}</span>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-1">{fee.purpose}</p>
                        {fee.fee_type && (
                            <p className="text-xs text-gray-500 mt-0.5">
                                {fee.fee_type.category_display}
                            </p>
                        )}
                    </div>
                    {getStatusBadge(fee.status, fee.is_overdue)}
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                    <div>
                        <p className="text-xs text-gray-500">Amount</p>
                        <p className="font-semibold">{fee.formatted_total}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500">Balance</p>
                        <p className={`font-semibold ${fee.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {fee.formatted_balance}
                        </p>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                    <div>
                        <p className="text-xs text-gray-500">Issued</p>
                        <p className="text-sm">{formatDate(fee.issue_date)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500">Due Date</p>
                        <p className={`text-sm ${fee.is_overdue ? 'text-red-600 font-medium' : ''}`}>
                            {formatDate(fee.due_date)}
                        </p>
                    </div>
                </div>
                
                {fee.is_overdue && fee.days_overdue > 0 && (
                    <div className="mb-3 p-2 bg-red-50 rounded-md">
                        <div className="flex items-center gap-1 text-red-700 text-sm">
                            <AlertCircle className="h-3 w-3" />
                            <span>{fee.days_overdue} days overdue</span>
                        </div>
                    </div>
                )}
                
                <div className="flex gap-2">
                    <Link href={`/residentfees/${fee.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full text-xs">
                            <Eye className="h-3 w-3 mr-1" />
                            View Details
                        </Button>
                    </Link>
                    {fee.balance > 0 && fee.status !== 'cancelled' && (
                        <Link href={`/resident/payments/create?fee_id=${fee.id}`} className="flex-1">
                            <Button size="sm" className="w-full text-xs">
                                <CreditCard className="h-3 w-3 mr-1" />
                                Pay Now
                            </Button>
                        </Link>
                    )}
                </div>
            </CardContent>
        </Card>
    );
    
    // Summary Stats Component
    const SummaryStats = () => (
        <>
            {/* Fee Summary - Mobile Optimized */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="sm:col-span-1">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Total Fees</p>
                                <p className="text-lg font-bold text-gray-800">
                                    {stats.total_fees.toLocaleString()}
                                </p>
                            </div>
                            <FileText className="h-6 w-6 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>
                
                <Card className="sm:col-span-1">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Balance Due</p>
                                <p className={`text-lg font-bold ${stats.total_balance > 0 ? 'text-red-600' : 'text-gray-800'}`}>
                                    {formatCurrency(stats.total_balance)}
                                </p>
                            </div>
                            <AlertCircle className="h-6 w-6 text-red-500" />
                        </div>
                    </CardContent>
                </Card>
                
                <Card className="sm:col-span-1">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Overdue</p>
                                <p className={`text-lg font-bold ${stats.overdue_fees > 0 ? 'text-amber-600' : 'text-gray-800'}`}>
                                    {stats.overdue_fees}
                                </p>
                            </div>
                            <Clock className="h-6 w-6 text-amber-500" />
                        </div>
                    </CardContent>
                </Card>
                
                <Card className="sm:col-span-1">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Total Paid</p>
                                <p className="text-lg font-bold text-green-600">
                                    {formatCurrency(stats.total_paid)}
                                </p>
                            </div>
                            <CheckCircle className="h-6 w-6 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            {/* Current Year Summary - Mobile Optimized */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold">Current Year Summary</h3>
                        <span className="text-xs text-gray-500">{new Date().getFullYear()}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="text-sm font-semibold text-gray-800">
                                {formatCurrency(stats.current_year_total)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">Total</div>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded">
                            <div className="text-sm font-semibold text-green-600">
                                {formatCurrency(stats.current_year_paid)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">Paid</div>
                        </div>
                        <div className="text-center p-2 bg-red-50 rounded">
                            <div className={`text-sm font-semibold ${stats.current_year_balance > 0 ? 'text-red-600' : 'text-gray-800'}`}>
                                {formatCurrency(stats.current_year_balance)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">Balance</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    );
    
    // Filters Component
    const FiltersSection = () => (
        <Card>
            <CardContent className="p-4">
                <div className="space-y-4">
                    {/* Search Bar with form to prevent automatic search */}
                    <form onSubmit={handleSearchSubmit}>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input 
                                placeholder="Search fees..." 
                                className="pl-10 pr-10 text-sm"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                disabled={loading}
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={handleSearchClear}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <button type="submit" className="hidden">Search</button>
                    </form>
                    
                    {/* Filter Controls */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Status</label>
                            <Select value={statusFilter} onValueChange={handleStatusChange} disabled={loading}>
                                <SelectTrigger className="w-full text-sm">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="overdue">Overdue</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="partially_paid">Partial</SelectItem>
                                    <SelectItem value="issued">Issued</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Type</label>
                            <Select value={feeTypeFilter} onValueChange={handleFeeTypeChange} disabled={loading}>
                                <SelectTrigger className="w-full text-sm">
                                    <SelectValue placeholder="All Types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    {availableFeeTypes.map((type) => (
                                        <SelectItem key={type.id} value={type.code}>
                                            {type.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Year</label>
                            <Select value={yearFilter} onValueChange={handleYearChange} disabled={loading || availableYears.length === 0}>
                                <SelectTrigger className="w-full text-sm">
                                    <SelectValue placeholder="All Years" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Years</SelectItem>
                                    {availableYears.map((year) => (
                                        <SelectItem key={year} value={year.toString()}>
                                            {year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    
                    {/* Filter Actions */}
                    <div className="flex justify-center gap-2">
                        {hasActiveFilters && (
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleClearFilters} 
                                disabled={loading}
                                className="text-xs"
                            >
                                Clear Filters
                            </Button>
                        )}
                        {isMobile && (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setShowFilters(false)}
                                className="text-xs"
                            >
                                Close
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
    
    return (
        <>
            <Head title="My Fees" />
            
            <ResidentLayout
                breadcrumbs={[
                    { title: 'Dashboard', href: '/resident/dashboard' },
                    { title: 'My Fees', href: '/residentfees' }
                ]}
            >
                <div className="space-y-4 md:space-y-6">
                    {/* Mobile Header with Toggle Buttons */}
                    {isMobile && (
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-xl font-bold">My Fees</h1>
                                <p className="text-xs text-gray-500">
                                    {fees.total} fee{fees.total !== 1 ? 's' : ''} total
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowSummary(!showSummary)}
                                    className="h-8 px-2"
                                >
                                    {showSummary ? (
                                        <ChevronUp className="h-4 w-4" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4" />
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="h-8 px-2"
                                >
                                    <Filter className="h-4 w-4" />
                                    {hasActiveFilters && (
                                        <span className="ml-1 h-2 w-2 bg-red-500 rounded-full"></span>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                    
                    {/* Desktop Header */}
                    {!isMobile && (
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">My Fees</h1>
                            <p className="text-gray-500 dark:text-gray-400">
                                View and manage your barangay fees and assessments
                            </p>
                        </div>
                    )}
                    
                    {/* Summary Stats - Collapsible on Mobile */}
                    {(showSummary || !isMobile) && <SummaryStats />}
                    
                    {/* Filters - Collapsible on Mobile */}
                    {(showFilters || !isMobile) && <FiltersSection />}
                    
                    {/* Results Count and View Toggle */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold">Fee History</h2>
                            <p className="text-sm text-gray-500">
                                {fees.total > 0 ? (
                                    <>Showing {fees.from}-{fees.to} of {fees.total} fees</>
                                ) : (
                                    'No fees found'
                                )}
                                {loading && <Loader2 className="ml-2 h-3 w-3 inline animate-spin" />}
                            </p>
                        </div>
                        
                        {/* View Toggle - Only show when we have fees */}
                        {fees.data.length > 0 && isMobile && (
                            <div className="flex items-center gap-1">
                                <span className="text-xs text-gray-500 mr-2">View:</span>
                                <div className="inline-flex items-center rounded-lg border border-gray-200 p-1">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-1 rounded ${viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                                        aria-label="Grid view"
                                    >
                                        <Grid className={`h-4 w-4 ${viewMode === 'grid' ? 'text-blue-600' : 'text-gray-500'}`} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-1 rounded ${viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                                        aria-label="List view"
                                    >
                                        <List className={`h-4 w-4 ${viewMode === 'list' ? 'text-blue-600' : 'text-gray-500'}`} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Fees Display */}
                    {fees.data.length === 0 ? (
                        <Card>
                            <CardContent className="text-center py-12">
                                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <FileText className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">No fees found</h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-4">
                                    {hasActiveFilters 
                                        ? 'Try adjusting your filters'
                                        : 'You have no fees or assessments'}
                                </p>
                                {hasActiveFilters && (
                                    <Button variant="outline" onClick={handleClearFilters} size="sm">
                                        Clear Filters
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            {/* Mobile View - Default Card Layout */}
                            {isMobile && viewMode === 'grid' && (
                                <div className="pb-4">
                                    {fees.data.map((fee) => (
                                        <MobileFeeCard key={fee.id} fee={fee} />
                                    ))}
                                </div>
                            )}
                            
                            {/* Desktop View - Table Layout */}
                            {(!isMobile || viewMode === 'list') && (
                                <Card>
                                    <CardContent className="p-0 md:p-6">
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="py-3">Fee Details</TableHead>
                                                        {!isMobile && <TableHead className="text-right">Amount</TableHead>}
                                                        <TableHead>Dates</TableHead>
                                                        <TableHead>Status</TableHead>
                                                        <TableHead className="text-right">Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {fees.data.map((fee) => (
                                                        <TableRow key={fee.id} className="hover:bg-gray-50">
                                                            <TableCell className="py-3">
                                                                <div>
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                                        <span className="font-medium text-sm">{fee.fee_code}</span>
                                                                    </div>
                                                                    <p className="text-sm text-gray-700 mb-1">{fee.purpose}</p>
                                                                    {fee.fee_type && (
                                                                        <p className="text-xs text-gray-500">
                                                                            {fee.fee_type.category_display}
                                                                        </p>
                                                                    )}
                                                                    {isMobile && (
                                                                        <div className="mt-2">
                                                                            <p className="text-sm font-semibold">{fee.formatted_total}</p>
                                                                            {fee.balance > 0 && (
                                                                                <p className="text-xs text-red-600">
                                                                                    Balance: {fee.formatted_balance}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                            {!isMobile && (
                                                                <TableCell className="py-3 text-right">
                                                                    <div className="space-y-1">
                                                                        <div className="font-bold">{fee.formatted_total}</div>
                                                                        {fee.balance > 0 && (
                                                                            <div className="text-sm font-medium text-red-600">
                                                                                Balance: {fee.formatted_balance}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </TableCell>
                                                            )}
                                                            <TableCell className="py-3">
                                                                <div className="space-y-1">
                                                                    <div>
                                                                        <p className="text-xs text-gray-500">Issued</p>
                                                                        <p className="text-sm">{formatDate(fee.issue_date)}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs text-gray-500">Due</p>
                                                                        <p className={`text-sm ${fee.is_overdue ? 'text-red-600 font-medium' : ''}`}>
                                                                            {formatDate(fee.due_date)}
                                                                            {fee.is_overdue && fee.days_overdue > 0 && !isMobile && (
                                                                                <span className="text-xs text-red-500 block">
                                                                                    {fee.days_overdue} days overdue
                                                                                </span>
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="py-3">
                                                                {getStatusBadge(fee.status, fee.is_overdue)}
                                                                {fee.is_overdue && fee.days_overdue > 0 && isMobile && (
                                                                    <div className="text-xs text-red-500 mt-1">
                                                                        {fee.days_overdue} days
                                                                    </div>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="py-3 text-right">
                                                                <div className="flex justify-end gap-1">
                                                                    <Link href={`/residentfees/${fee.id}`}>
                                                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                                            <Eye className="h-4 w-4" />
                                                                        </Button>
                                                                    </Link>
                                                                    {fee.balance > 0 && fee.status !== 'cancelled' && (
                                                                        <Link href={`/resident/payments/create?fee_id=${fee.id}`}>
                                                                            <Button size="sm" variant="default" className="h-8 px-3 text-xs">
                                                                                Pay
                                                                            </Button>
                                                                        </Link>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                            
                            {/* Pagination - Mobile Optimized */}
                            {fees.last_page > 1 && (
                                <div className="mt-4 md:mt-6">
                                    <ResponsivePagination
                                        currentPage={fees.current_page}
                                        totalPages={fees.last_page}
                                        onPageChange={(page) => {
                                            setLoading(true);
                                            router.get('/residentfees', {
                                                ...filters,
                                                page: page.toString(),
                                            }, {
                                                preserveState: true,
                                                preserveScroll: true,
                                                onFinish: () => setLoading(false),
                                            });
                                        }}
                                        isLoading={loading}
                                        isMobile={isMobile}
                                    />
                                </div>
                            )}
                        </>
                    )}
                    
                    {/* Loading Overlay */}
                    {loading && (
                        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-50 flex items-center justify-center">
                            <div className="bg-white p-6 rounded-lg shadow-lg">
                                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                                <p className="text-sm">Loading...</p>
                            </div>
                        </div>
                    )}
                </div>
            </ResidentLayout>
        </>
    );
}