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
    Download,
    Eye,
    CreditCard,
    Receipt,
    AlertCircle,
    CheckCircle,
    Clock,
    XCircle,
    Plus,
    Loader2,
    DollarSign,
    Calendar,
    FileText,
    Banknote,
    ShieldCheck
} from 'lucide-react';
import { Link, usePage, router, Head } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Pagination } from '@/components/ui/pagination';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Payment {
    id: number;
    or_number: string;
    reference_number?: string;
    purpose: string;
    subtotal: number;
    surcharge: number;
    penalty: number;
    discount: number;
    total_amount: number;
    payment_date: string;
    due_date?: string;
    status: string;
    payment_method: string;
    payment_method_display: string;
    is_cleared: boolean;
    certificate_type?: string;
    certificate_type_display?: string;
    collection_type: string;
    collection_type_display: string;
    remarks?: string;
    formatted_total: string;
    formatted_date: string;
    formatted_subtotal: string;
    formatted_surcharge: string;
    formatted_penalty: string;
    formatted_discount: string;
    payer_details?: {
        name: string;
        contact_number?: string;
        address?: string;
        household_number?: string;
        purok?: string;
    };
    items?: Array<{
        id: number;
        item_name: string;
        description?: string;
        quantity: number;
        unit_price: number;
        total: number;
    }>;
}

interface PaymentMethod {
    type: string;
    display_name: string;
    icon?: React.ReactNode;
}

interface PageProps {
    payments?: {
        data: Payment[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    stats?: {
        total_payments: number;
        pending_payments: number;
        total_paid: number;
        balance_due: number;
    };
    paymentMethods?: PaymentMethod[];
    hasProfile?: boolean;
    filters?: {
        search?: string;
        status?: string;
        start_date?: string;
        end_date?: string;
        payment_method?: string;
    };
}

export default function MyPayments() {
    const pageProps = usePage<PageProps>().props;
    
    // Provide default values for undefined props
    const payments = pageProps.payments || {
        data: [],
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
        from: 0,
        to: 0,
    };
    
    const stats = pageProps.stats || {
        total_payments: 0,
        pending_payments: 0,
        total_paid: 0,
        balance_due: 0,
    };
    
    const paymentMethods = pageProps.paymentMethods || [];
    const hasProfile = pageProps.hasProfile || false;
    const filters = pageProps.filters || {};
    
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState(filters.payment_method || 'all');
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Initialize filters from props only on first load
    useEffect(() => {
        if (isInitialLoad) {
            setSearch(filters.search || '');
            setStatusFilter(filters.status || 'all');
            setPaymentMethodFilter(filters.payment_method || 'all');
            setStartDate(filters.start_date || '');
            setEndDate(filters.end_date || '');
            setIsInitialLoad(false);
        }
    }, [filters, isInitialLoad]);

    // Debounced search with proper cleanup
    useEffect(() => {
        if (isInitialLoad) return;
        
        const timer = setTimeout(() => {
            if (search !== filters.search) {
                updateFilters({ search });
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [search, filters.search, isInitialLoad]);

    const updateFilters = useCallback((newFilters: Record<string, string>) => {
        setLoading(true);
        
        // Build query params
        const queryParams = {
            ...filters,
            ...newFilters,
            page: 1,
        };
        
        // Clean up empty values
        Object.keys(queryParams).forEach(key => {
            if (!queryParams[key]) {
                delete queryParams[key];
            }
        });
        
        router.get('/my-payments', queryParams, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setLoading(false),
            onError: (error) => {
                setLoading(false);
                toast.error('Failed to load payments');
                console.error('Payment filter error:', error);
            },
        });
    }, [filters]);

    const handleStatusChange = (status: string) => {
        setStatusFilter(status);
        updateFilters({ status: status === 'all' ? '' : status });
    };

    const handlePaymentMethodChange = (method: string) => {
        setPaymentMethodFilter(method);
        updateFilters({ payment_method: method === 'all' ? '' : method });
    };

    const handleDateFilter = () => {
        // Validate dates
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                toast.error('Invalid date format');
                return;
            }
            
            if (start > end) {
                toast.error('Start date cannot be after end date');
                return;
            }
        }
        
        updateFilters({ 
            start_date: startDate || '', 
            end_date: endDate || '' 
        });
    };

    const handleClearFilters = () => {
        setSearch('');
        setStatusFilter('all');
        setPaymentMethodFilter('all');
        setStartDate('');
        setEndDate('');
        
        router.get('/resident/payments', {}, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setLoading(false),
        });
    };

    const getStatusBadge = (status: string) => {
        const statusLower = status.toLowerCase();
        switch (statusLower) {
            case 'completed':
            case 'paid':
                return (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Paid
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                    </Badge>
                );
            case 'overdue':
                return (
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Overdue
                    </Badge>
                );
            case 'cancelled':
                return (
                    <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                        <XCircle className="h-3 w-3 mr-1" />
                        Cancelled
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getPaymentMethodIcon = (method: string) => {
        if (!method) return <CreditCard className="h-4 w-4 text-gray-500" />;
        
        const methodLower = method.toLowerCase();
        switch (methodLower) {
            case 'cash':
                return <Banknote className="h-4 w-4 text-green-600" />;
            case 'gcash':
                return <FileText className="h-4 w-4 text-blue-600" />;
            case 'maya':
                return <CreditCard className="h-4 w-4 text-purple-600" />;
            case 'bank':
                return <Banknote className="h-4 w-4 text-indigo-600" />;
            case 'check':
                return <FileText className="h-4 w-4 text-gray-600" />;
            case 'online':
                return <ShieldCheck className="h-4 w-4 text-teal-600" />;
            default:
                return <CreditCard className="h-4 w-4 text-gray-500" />;
        }
    };

    const getPaymentMethodColor = (method: string) => {
        if (!method) return 'border-gray-200 bg-gray-50';
        
        const methodLower = method.toLowerCase();
        switch (methodLower) {
            case 'cash':
                return 'border-green-200 bg-green-50';
            case 'gcash':
                return 'border-blue-200 bg-blue-50';
            case 'maya':
                return 'border-purple-200 bg-purple-50';
            case 'bank':
                return 'border-indigo-200 bg-indigo-50';
            case 'check':
                return 'border-gray-200 bg-gray-50';
            case 'online':
                return 'border-teal-200 bg-teal-50';
            default:
                return 'border-gray-200 bg-gray-50';
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Invalid Date';
            
            return date.toLocaleDateString('en-PH', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch (error) {
            console.error('Date formatting error:', error);
            return 'Invalid Date';
        }
    };

    const formatDateTime = (dateString: string) => {
        if (!dateString) return 'N/A';
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Invalid Date';
            
            return date.toLocaleDateString('en-PH', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch (error) {
            console.error('DateTime formatting error:', error);
            return 'Invalid Date';
        }
    };

    const exportPayments = () => {
        setLoading(true);
        
        const queryParams = {
            ...filters,
            export: 'true',
        };
        
        // Clean up empty values
        Object.keys(queryParams).forEach(key => {
            if (!queryParams[key]) {
                delete queryParams[key];
            }
        });
        
        router.get('/resident/payments', queryParams, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setLoading(false),
            onError: () => {
                setLoading(false);
                toast.error('Failed to export payments');
            },
        });
    };

    const hasActiveFilters = Object.values(filters).some(value => 
        value !== undefined && value !== null && value !== '' && value !== 'all'
    );

    // Show loading state while checking profile
    if (hasProfile === undefined) {
        return (
            <ResidentLayout
                title="My Payments"
                breadcrumbs={[
                    { title: 'Dashboard', href: '/resident/dashboard' },
                    { title: 'My Payments', href: '/resident/payments' }
                ]}
            >
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                        <p className="text-gray-600">Loading payments...</p>
                    </div>
                </div>
            </ResidentLayout>
        );
    }

    if (!hasProfile) {
        return (
            <ResidentLayout
                title="My Payments"
                breadcrumbs={[
                    { title: 'Dashboard', href: '/resident/dashboard' },
                    { title: 'My Payments', href: '/resident/payments' }
                ]}
            >
                <div className="min-h-[50vh] flex items-center justify-center">
                    <Card className="w-full max-w-md">
                        <CardContent className="pt-6 text-center">
                            <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                                <AlertCircle className="h-8 w-8 text-amber-600" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Complete Your Profile</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                You need to complete your resident profile before you can view and manage payments.
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

    return (
        <ResidentLayout
            title="My Payments"
            breadcrumbs={[
                { title: 'Dashboard', href: '/resident/dashboard' },
                { title: 'My Payments', href: '/resident/payments' }
            ]}
        >
            <Head title="My Payments" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">My Payments</h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            View and manage your barangay payments
                        </p>
                    </div>
                    <Link href="/resident/payments/create">
                        <Button className="w-full sm:w-auto">
                            <Plus className="h-4 w-4 mr-2" />
                            Make Payment
                        </Button>
                    </Link>
                </div>

                {/* Payment Summary */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">
                                Total Payments
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                                    {stats.total_payments.toLocaleString()}
                                </div>
                                <Receipt className="h-8 w-8 text-blue-200" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">
                                Pending Payments
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className={`text-2xl font-bold ${stats.pending_payments > 0 ? 'text-amber-600' : 'text-gray-800 dark:text-gray-200'}`}>
                                    {stats.pending_payments.toLocaleString()}
                                </div>
                                <Clock className="h-8 w-8 text-amber-200" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">
                                Balance Due
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className={`text-2xl font-bold ${stats.balance_due > 0 ? 'text-red-600' : 'text-gray-800 dark:text-gray-200'}`}>
                                    ₱{stats.balance_due.toFixed(2)}
                                </div>
                                <AlertCircle className="h-8 w-8 text-red-200" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">
                                Total Paid
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="text-2xl font-bold text-green-600">
                                    ₱{stats.total_paid.toFixed(2)}
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-200" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input 
                                        placeholder="Search by OR number, purpose, or reference..." 
                                        className="pl-10"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" disabled={loading} className="relative">
                                                <Filter className="h-4 w-4 mr-2" />
                                                Filter
                                                {hasActiveFilters && (
                                                    <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center bg-primary text-primary-foreground">
                                                        !
                                                    </Badge>
                                                )}
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-56" align="end">
                                            <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <div className="p-2">
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="text-xs text-gray-500">Status</label>
                                                        <Select 
                                                            value={statusFilter} 
                                                            onValueChange={handleStatusChange}
                                                            disabled={loading}
                                                        >
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="All Status" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="all">All Status</SelectItem>
                                                                <SelectItem value="completed">Paid</SelectItem>
                                                                <SelectItem value="pending">Pending</SelectItem>
                                                                <SelectItem value="overdue">Overdue</SelectItem>
                                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-gray-500">Payment Method</label>
                                                        <Select 
                                                            value={paymentMethodFilter} 
                                                            onValueChange={handlePaymentMethodChange}
                                                            disabled={loading}
                                                        >
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="All Methods" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="all">All Methods</SelectItem>
                                                                <SelectItem value="cash">Cash</SelectItem>
                                                                <SelectItem value="gcash">GCash</SelectItem>
                                                                <SelectItem value="maya">Maya</SelectItem>
                                                                <SelectItem value="bank">Bank Transfer</SelectItem>
                                                                <SelectItem value="check">Check</SelectItem>
                                                                <SelectItem value="online">Online</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-gray-500">Date Range</label>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <Input 
                                                                type="date" 
                                                                placeholder="Start Date"
                                                                value={startDate}
                                                                onChange={(e) => setStartDate(e.target.value)}
                                                                disabled={loading}
                                                                className="text-sm"
                                                            />
                                                            <Input 
                                                                type="date" 
                                                                placeholder="End Date"
                                                                value={endDate}
                                                                onChange={(e) => setEndDate(e.target.value)}
                                                                disabled={loading}
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline" 
                                                            onClick={handleDateFilter}
                                                            disabled={loading}
                                                            className="w-full"
                                                        >
                                                            Apply Date Filter
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem 
                                                onClick={handleClearFilters}
                                                disabled={!hasActiveFilters || loading}
                                            >
                                                Clear All Filters
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <Button 
                                        variant="outline" 
                                        onClick={exportPayments}
                                        disabled={loading || payments.data.length === 0}
                                    >
                                        {loading ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                            <Download className="h-4 w-4 mr-2" />
                                        )}
                                        Export
                                    </Button>
                                </div>
                            </div>
                            {hasActiveFilters && (
                                <div className="flex flex-wrap items-center gap-2 text-sm">
                                    <span className="text-gray-500">Active filters:</span>
                                    {filters.search && (
                                        <Badge variant="secondary" className="gap-1">
                                            Search: {filters.search}
                                            <button 
                                                onClick={() => updateFilters({ search: '' })}
                                                className="ml-1 hover:text-destructive"
                                                disabled={loading}
                                            >
                                                ×
                                            </button>
                                        </Badge>
                                    )}
                                    {filters.status && (
                                        <Badge variant="secondary" className="gap-1">
                                            Status: {filters.status}
                                            <button 
                                                onClick={() => handleStatusChange('all')}
                                                className="ml-1 hover:text-destructive"
                                                disabled={loading}
                                            >
                                                ×
                                            </button>
                                        </Badge>
                                    )}
                                    {filters.payment_method && (
                                        <Badge variant="secondary" className="gap-1">
                                            Method: {filters.payment_method}
                                            <button 
                                                onClick={() => handlePaymentMethodChange('all')}
                                                className="ml-1 hover:text-destructive"
                                                disabled={loading}
                                            >
                                                ×
                                            </button>
                                        </Badge>
                                    )}
                                    {(filters.start_date || filters.end_date) && (
                                        <Badge variant="secondary" className="gap-1">
                                            {filters.start_date || 'Any'} to {filters.end_date || 'Any'}
                                            <button 
                                                onClick={() => {
                                                    setStartDate('');
                                                    setEndDate('');
                                                    updateFilters({ start_date: '', end_date: '' });
                                                }}
                                                className="ml-1 hover:text-destructive"
                                                disabled={loading}
                                            >
                                                ×
                                            </button>
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Payments Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Payment History</CardTitle>
                        <CardDescription>
                            {payments.total > 0 ? (
                                <>Showing {payments.from}-{payments.to} of {payments.total} payments</>
                            ) : (
                                'No payments found'
                            )}
                            {loading && <Loader2 className="ml-2 h-3 w-3 inline animate-spin" />}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {payments.data.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <Receipt className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">No payments found</h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-4">
                                    {hasActiveFilters 
                                        ? 'Try adjusting your filters'
                                        : 'You haven\'t made any payments yet'}
                                </p>
                                {hasActiveFilters ? (
                                    <Button variant="outline" onClick={handleClearFilters} disabled={loading}>
                                        Clear Filters
                                    </Button>
                                ) : (
                                    <Link href="/resident/payments/create">
                                        <Button disabled={loading}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Make Your First Payment
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[140px]">OR Number</TableHead>
                                                <TableHead>Description</TableHead>
                                                <TableHead className="text-right w-[120px]">Amount</TableHead>
                                                <TableHead className="w-[120px]">Date</TableHead>
                                                <TableHead className="w-[120px]">Method</TableHead>
                                                <TableHead className="w-[100px]">Status</TableHead>
                                                <TableHead className="text-right w-[120px]">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {payments.data.map((payment) => (
                                                <TableRow key={payment.id}>
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center gap-2">
                                                            <Receipt className="h-4 w-4 text-gray-500" />
                                                            <span className="font-mono text-sm truncate" title={payment.or_number}>
                                                                {payment.or_number}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div className="font-medium line-clamp-1" title={payment.purpose}>
                                                                {payment.purpose}
                                                            </div>
                                                            {payment.certificate_type_display && (
                                                                <div className="text-xs text-gray-500">
                                                                    {payment.certificate_type_display}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="font-bold">{payment.formatted_total}</div>
                                                        {(payment.surcharge > 0 || payment.penalty > 0 || payment.discount > 0) && (
                                                            <div className="text-xs text-gray-500 space-x-1">
                                                                <span>Base: {payment.formatted_subtotal}</span>
                                                                {payment.surcharge > 0 && (
                                                                    <span>+ Fee: {payment.formatted_surcharge}</span>
                                                                )}
                                                                {payment.penalty > 0 && (
                                                                    <span>+ Penalty: {payment.formatted_penalty}</span>
                                                                )}
                                                                {payment.discount > 0 && (
                                                                    <span>- Discount: {payment.formatted_discount}</span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div className="text-sm">{formatDate(payment.payment_date)}</div>
                                                            {payment.due_date && (
                                                                <div className={`text-xs ${payment.status === 'overdue' ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                                                                    Due: {formatDate(payment.due_date)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            {getPaymentMethodIcon(payment.payment_method)}
                                                            <span className="text-sm truncate" title={payment.payment_method_display}>
                                                                {payment.payment_method_display}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Link href={`/resident/payments/${payment.id}`}>
                                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                            {payment.status === 'completed' && (
                                                                <Link href={`/resident/payments/${payment.id}/receipt`}>
                                                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                                        <Download className="h-4 w-4" />
                                                                    </Button>
                                                                </Link>
                                                            )}
                                                            {(payment.status === 'pending' || payment.status === 'overdue') && (
                                                                <Link href={`/resident/payments/${payment.id}`}>
                                                                    <Button size="sm" variant="default" className="h-8 px-3">
                                                                        Pay Now
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

                                {/* Pagination */}
                                {payments.last_page > 1 && (
                                    <div className="mt-6">
                                        <Pagination
                                            currentPage={payments.current_page}
                                            totalPages={payments.last_page}
                                            onPageChange={(page) => {
                                                setLoading(true);
                                                router.get('/resident/payments', {
                                                    ...filters,
                                                    page,
                                                }, {
                                                    preserveState: true,
                                                    preserveScroll: true,
                                                    onFinish: () => setLoading(false),
                                                });
                                            }}
                                            isLoading={loading}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Payment Methods */}
                {paymentMethods.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Your Payment Methods
                            </CardTitle>
                            <CardDescription>
                                Payment methods you've used for previous transactions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {paymentMethods.map((method, index) => (
                                    <Card 
                                        key={index} 
                                        className={`border-2 ${getPaymentMethodColor(method.type)} hover:shadow-md transition-shadow`}
                                    >
                                        <CardContent className="pt-6">
                                            <div className="flex items-center gap-3">
                                                {getPaymentMethodIcon(method.type)}
                                                <div>
                                                    <div className="font-bold">{method.display_name}</div>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Available for use
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </ResidentLayout>
    );
}