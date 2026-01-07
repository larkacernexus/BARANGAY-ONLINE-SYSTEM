import AppLayout from '@/layouts/admin-app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    Download,
    Plus,
    CheckCircle,
    XCircle,
    Clock,
    User,
    Users,
    Home,
    Receipt,
    Eye,
    Edit,
    Printer,
    Calendar,
    DollarSign,
    AlertTriangle,
    CreditCard,
    FileText,
    Filter,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { Link, usePage, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface PaymentItem {
    id: number;
    fee_name: string;
    fee_code: string;
    description?: string;
    base_amount: number;
    surcharge: number;
    penalty: number;
    total_amount: number;
    category: string;
    period_covered?: string;
    months_late?: number;
}

interface Payment {
    id: number;
    or_number: string;
    payer_type: 'resident' | 'household';
    payer_id: number;
    payer_name: string;
    contact_number?: string;
    address?: string;
    household_number?: string;
    purok?: string;
    payment_date: string;
    formatted_date?: string;
    period_covered?: string;
    payment_method: string;
    payment_method_details?: {
        name: string;
        icon: string;
    };
    reference_number?: string;
    subtotal: number;
    surcharge: number;
    penalty: number;
    discount: number;
    discount_type?: string;
    total_amount: number;
    formatted_total?: string;
    purpose?: string;
    remarks?: string;
    is_cleared: boolean;
    certificate_type?: string;
    validity_date?: string;
    collection_type: string;
    status: 'completed' | 'pending' | 'cancelled';
    method_details?: Record<string, any>;
    recorded_by?: number;
    recorded_by_name?: string;
    created_at: string;
    updated_at: string;
    items?: PaymentItem[];
    payer_details?: any;
    recorder?: {
        id: number;
        name: string;
    };
}

interface Stat {
    label: string;
    value: string | number;
    change?: string;
    icon: string;
    color?: string;
    trend?: 'up' | 'down' | 'neutral';
}

interface PageProps {
    payments: {
        data: Payment[];
        links: {
            first: string;
            last: string;
            prev: string | null;
            next: string | null;
        };
        meta: {
            current_page: number;
            from: number;
            last_page: number;
            links: any[];
            path: string;
            per_page: number;
            to: number;
            total: number;
        };
    };
    stats: {
        total: number;
        today: number;
        monthly: number;
        total_amount: number;
        today_amount: number;
        monthly_amount: number;
    };
    filters: {
        search?: string;
        status?: string;
        payment_method?: string;
        date_from?: string;
        date_to?: string;
        payer_type?: string;
    };
}

// Helper function to get routes
const getRoute = (name: string, params?: any) => {
    if (typeof window !== 'undefined' && (window as any).route) {
        try {
            return (window as any).route(name, params);
        } catch (e) {
            console.warn(`Route ${name} not found`);
        }
    }
    
    const fallbacks: Record<string, any> = {
        'payments.index': '/payments',
        'payments.create': '/payments/create',
        'payments.show': (id: number) => `/payments/${id}`,
        'payments.edit': (id: number) => `/payments/${id}/edit`,
        'payments.receipt': (id: number) => `/payments/${id}/receipt`,
        'payments.export': '/payments/export',
    };
    
    const fallback = fallbacks[name];
    if (typeof fallback === 'function') {
        return fallback(params);
    }
    return fallback || '/';
};

// Helper function to format currency
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};

// Helper function to format date
const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        return 'Invalid Date';
    }
};

export default function Payments() {
    const { payments, stats, filters } = usePage<PageProps>().props;
    
    const [search, setSearch] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');
    const [methodFilter, setMethodFilter] = useState(filters?.payment_method || 'all');
    const [payerTypeFilter, setPayerTypeFilter] = useState(filters?.payer_type || 'all');
    const [dateFrom, setDateFrom] = useState(filters?.date_from || '');
    const [dateTo, setDateTo] = useState(filters?.date_to || '');
    const [isLoading, setIsLoading] = useState(false);
    const [expandedPayments, setExpandedPayments] = useState<Set<number>>(new Set());
    
    // Payment method options
    const paymentMethods = [
        { value: 'cash', label: 'Cash' },
        { value: 'gcash', label: 'GCash' },
        { value: 'maya', label: 'Maya' },
        { value: 'bank', label: 'Bank Transfer' },
        { value: 'check', label: 'Check' },
        { value: 'online', label: 'Online Payment' },
    ];
    
    // Status options
    const statusOptions = [
        { value: 'completed', label: 'Completed' },
        { value: 'pending', label: 'Pending' },
        { value: 'cancelled', label: 'Cancelled' },
    ];
    
    // Payer type options
    const payerTypeOptions = [
        { value: 'resident', label: 'Resident' },
        { value: 'household', label: 'Household' },
    ];
    
    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(true);
            router.get(getRoute('payments.index'), {
                search,
                status: statusFilter !== 'all' ? statusFilter : null,
                payment_method: methodFilter !== 'all' ? methodFilter : null,
                payer_type: payerTypeFilter !== 'all' ? payerTypeFilter : null,
                date_from: dateFrom || null,
                date_to: dateTo || null,
            }, {
                preserveState: true,
                replace: true,
                onFinish: () => setIsLoading(false)
            });
        }, 500);
        
        return () => clearTimeout(timer);
    }, [search, statusFilter, methodFilter, payerTypeFilter, dateFrom, dateTo]);
    
    const handleExport = () => {
        router.get(getRoute('payments.export'), {
            search: search || null,
            status: statusFilter !== 'all' ? statusFilter : null,
            payment_method: methodFilter !== 'all' ? methodFilter : null,
            date_from: dateFrom || null,
            date_to: dateTo || null,
            payer_type: payerTypeFilter !== 'all' ? payerTypeFilter : null,
        });
    };
    
    const handleClearFilters = () => {
        setSearch('');
        setStatusFilter('all');
        setMethodFilter('all');
        setPayerTypeFilter('all');
        setDateFrom('');
        setDateTo('');
    };
    
    const togglePaymentExpanded = (paymentId: number) => {
        const newExpanded = new Set(expandedPayments);
        if (newExpanded.has(paymentId)) {
            newExpanded.delete(paymentId);
        } else {
            newExpanded.add(paymentId);
        }
        setExpandedPayments(newExpanded);
    };
    
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': 
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'pending': 
                return <Clock className="h-4 w-4 text-amber-500" />;
            case 'cancelled':
                return <XCircle className="h-4 w-4 text-gray-500" />;
            default: 
                return null;
        }
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'completed': 
                return 'default';
            case 'pending': 
                return 'secondary';
            case 'cancelled':
                return 'destructive';
            default: 
                return 'outline';
        }
    };
    
    const getMethodIcon = (method: string) => {
        switch (method) {
            case 'cash': 
                return <DollarSign className="h-4 w-4 text-green-500" />;
            case 'gcash':
            case 'maya':
            case 'online':
                return <CreditCard className="h-4 w-4 text-blue-500" />;
            case 'bank':
                return <FileText className="h-4 w-4 text-purple-500" />;
            case 'check':
                return <Receipt className="h-4 w-4 text-orange-500" />;
            default: 
                return <CreditCard className="h-4 w-4 text-gray-500" />;
        }
    };
    
    const getPayerIcon = (payerType: string) => {
        switch (payerType) {
            case 'resident': 
                return <User className="h-4 w-4 text-blue-500" />;
            case 'household':
                return <Users className="h-4 w-4 text-green-500" />;
            default: 
                return <User className="h-4 w-4 text-gray-500" />;
        }
    };
    
    const hasActiveFilters = search || statusFilter !== 'all' || methodFilter !== 'all' || payerTypeFilter !== 'all' || dateFrom || dateTo;
    
    // Calculate stats cards
    const statCards: Stat[] = [
        {
            label: 'Total Payments',
            value: stats?.total || 0,
            icon: 'dollar-sign',
            color: 'text-blue-600 bg-blue-50',
            trend: 'up'
        },
        {
            label: "Today's Payments",
            value: stats?.today || 0,
            icon: 'calendar',
            color: 'text-green-600 bg-green-50',
            change: formatCurrency(stats?.today_amount || 0)
        },
        {
            label: 'Monthly Payments',
            value: stats?.monthly || 0,
            icon: 'calendar',
            color: 'text-purple-600 bg-purple-50',
            change: formatCurrency(stats?.monthly_amount || 0)
        },
        {
            label: 'Total Amount',
            value: formatCurrency(stats?.total_amount || 0),
            icon: 'dollar-sign',
            color: 'text-amber-600 bg-amber-50'
        }
    ];
    
    const getStatIcon = (iconName: string) => {
        switch (iconName) {
            case 'dollar-sign': return <DollarSign className="h-5 w-5" />;
            case 'calendar': return <Calendar className="h-5 w-5" />;
            case 'clock': return <Clock className="h-5 w-5" />;
            case 'users': return <Users className="h-5 w-5" />;
            default: return <DollarSign className="h-5 w-5" />;
        }
    };

    return (
        <AppLayout
            title="Payment Management"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Payments', href: getRoute('payments.index') }
            ]}
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Payment Management</h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Manage and track all payment transactions
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleExport} disabled={isLoading}>
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                        <Link href={getRoute('payments.create')}>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Record Payment
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((stat, index) => {
                        const bgColor = stat.color?.split(' ')[1] || 'bg-gray-50';
                        const textColor = stat.color?.split(' ')[0] || 'text-gray-600';
                        
                        return (
                            <Card key={index}>
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm font-medium">
                                            {stat.label}
                                        </CardTitle>
                                        <div className={`p-2 rounded-full ${bgColor}`}>
                                            {getStatIcon(stat.icon)}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className={`text-2xl font-bold ${textColor}`}>
                                        {stat.value}
                                    </div>
                                    {stat.change && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Amount: {stat.change}
                                        </p>
                                    )}
                                    {stat.trend && (
                                        <div className="flex items-center gap-1 mt-1">
                                            {stat.trend === 'up' ? (
                                                <ChevronUp className="h-3 w-3 text-green-500" />
                                            ) : stat.trend === 'down' ? (
                                                <ChevronDown className="h-3 w-3 text-red-500" />
                                            ) : null}
                                            <span className="text-xs text-gray-500">
                                                {stat.trend === 'up' ? 'Increased' : stat.trend === 'down' ? 'Decreased' : 'No change'}
                                            </span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Search and Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 max-w-md">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <Input 
                                            placeholder="Search by OR number, payer name, reference number..." 
                                            className="pl-10"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="font-normal">
                                        <Filter className="h-3 w-3 mr-1" />
                                        Filters
                                    </Badge>
                                    <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={handleClearFilters}
                                        disabled={isLoading || !hasActiveFilters}
                                    >
                                        Clear
                                    </Button>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Status</label>
                                    <select 
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        disabled={isLoading}
                                    >
                                        <option value="all">All Status</option>
                                        {statusOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Payment Method</label>
                                    <select 
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={methodFilter}
                                        onChange={(e) => setMethodFilter(e.target.value)}
                                        disabled={isLoading}
                                    >
                                        <option value="all">All Methods</option>
                                        {paymentMethods.map((method) => (
                                            <option key={method.value} value={method.value}>
                                                {method.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Payer Type</label>
                                    <select 
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={payerTypeFilter}
                                        onChange={(e) => setPayerTypeFilter(e.target.value)}
                                        disabled={isLoading}
                                    >
                                        <option value="all">All Types</option>
                                        {payerTypeOptions.map((type) => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">From Date</label>
                                    <Input 
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">To Date</label>
                                    <Input 
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                        </div>
                        
                        {isLoading && (
                            <div className="mt-3 text-sm text-blue-500 flex items-center gap-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                                Loading payments...
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Payments Table */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Payment Transactions</CardTitle>
                            <div className="text-sm text-gray-500 mt-1">
                                Total: {payments.meta?.total || 0} payments • 
                                Amount: {formatCurrency(stats?.total_amount || 0)}
                            </div>
                        </div>
                        {payments.meta && payments.meta.total > 0 && (
                            <div className="text-sm text-gray-500">
                                Page {payments.meta.current_page} of {payments.meta.last_page}
                            </div>
                        )}
                    </CardHeader>
                    <CardContent>
                        {payments.data && payments.data.length > 0 ? (
                            <>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[80px]"></TableHead>
                                                <TableHead>OR Number</TableHead>
                                                <TableHead>Payer Details</TableHead>
                                                <TableHead>Amount</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Method</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {payments.data.map((payment) => (
                                                <>
                                                    <TableRow key={payment.id} className="hover:bg-gray-50">
                                                        <TableCell>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => togglePaymentExpanded(payment.id)}
                                                                className="h-8 w-8 p-0"
                                                            >
                                                                {expandedPayments.has(payment.id) ? (
                                                                    <ChevronUp className="h-4 w-4" />
                                                                ) : (
                                                                    <ChevronDown className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </TableCell>
                                                        <TableCell className="font-medium">
                                                            <div className="flex items-center gap-2">
                                                                <Receipt className="h-4 w-4 text-gray-500" />
                                                                <div>
                                                                    <div>{payment.or_number}</div>
                                                                    {payment.reference_number && (
                                                                        <div className="text-xs text-gray-500">
                                                                            Ref: {payment.reference_number}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div>
                                                                <div className="flex items-center gap-2 font-medium">
                                                                    {getPayerIcon(payment.payer_type)}
                                                                    {payment.payer_name}
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    {payment.contact_number}
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    {payment.payer_type === 'resident' ? 'Resident' : 'Household'}
                                                                    {payment.household_number && ` • House #${payment.household_number}`}
                                                                    {payment.purok && ` • Purok ${payment.purok}`}
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="font-bold">
                                                            <div>
                                                                <div>{formatCurrency(payment.total_amount)}</div>
                                                                {payment.surcharge > 0 || payment.penalty > 0 || payment.discount > 0 ? (
                                                                    <div className="text-xs text-gray-500">
                                                                        {payment.discount > 0 && `Discount: ${formatCurrency(payment.discount)} `}
                                                                        {payment.surcharge > 0 && `Surcharge: ${formatCurrency(payment.surcharge)} `}
                                                                        {payment.penalty > 0 && `Penalty: ${formatCurrency(payment.penalty)}`}
                                                                    </div>
                                                                ) : null}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div>
                                                                <div>{payment.formatted_date || formatDate(payment.payment_date)}</div>
                                                                {payment.period_covered && (
                                                                    <div className="text-xs text-gray-500">
                                                                        Period: {payment.period_covered}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                {getMethodIcon(payment.payment_method)}
                                                                <span>
                                                                    {payment.payment_method_details?.name || 
                                                                     paymentMethods.find(m => m.value === payment.payment_method)?.label || 
                                                                     payment.payment_method}
                                                                </span>
                                                            </div>
                                                            {payment.purpose && (
                                                                <div className="text-xs text-gray-500 mt-1">
                                                                    {payment.purpose}
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge 
                                                                variant={getStatusVariant(payment.status)} 
                                                                className="flex items-center gap-1 w-fit"
                                                            >
                                                                {getStatusIcon(payment.status)}
                                                                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                                            </Badge>
                                                            {payment.recorder?.name && (
                                                                <div className="text-xs text-gray-500 mt-1">
                                                                    by {payment.recorder.name}
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Link href={getRoute('payments.show', payment.id)}>
                                                                    <Button size="sm" variant="ghost" title="View Details">
                                                                        <Eye className="h-4 w-4" />
                                                                    </Button>
                                                                </Link>
                                                                <Link href={getRoute('payments.receipt', payment.id)}>
                                                                    <Button size="sm" variant="ghost" title="Print Receipt">
                                                                        <Printer className="h-4 w-4" />
                                                                    </Button>
                                                                </Link>
                                                                <Link href={getRoute('payments.edit', payment.id)}>
                                                                    <Button size="sm" variant="ghost" title="Edit Payment">
                                                                        <Edit className="h-4 w-4" />
                                                                    </Button>
                                                                </Link>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                    
                                                    {/* Expanded Row for Payment Items */}
                                                    {expandedPayments.has(payment.id) && payment.items && payment.items.length > 0 && (
                                                        <TableRow className="bg-gray-50">
                                                            <TableCell colSpan={8} className="p-0">
                                                                <div className="p-4 pl-12 border-t">
                                                                    <h4 className="font-medium mb-2">Payment Items</h4>
                                                                    <div className="rounded-md border">
                                                                        <Table>
                                                                            <TableHeader>
                                                                                <TableRow>
                                                                                    <TableHead>Fee Name</TableHead>
                                                                                    <TableHead>Description</TableHead>
                                                                                    <TableHead>Base Amount</TableHead>
                                                                                    <TableHead>Surcharge</TableHead>
                                                                                    <TableHead>Penalty</TableHead>
                                                                                    <TableHead className="text-right">Total</TableHead>
                                                                                </TableRow>
                                                                            </TableHeader>
                                                                            <TableBody>
                                                                                {payment.items.map((item) => (
                                                                                    <TableRow key={item.id}>
                                                                                        <TableCell className="font-medium">
                                                                                            <div>
                                                                                                <div>{item.fee_name}</div>
                                                                                                <div className="text-xs text-gray-500">{item.fee_code}</div>
                                                                                            </div>
                                                                                        </TableCell>
                                                                                        <TableCell>
                                                                                            {item.description || '-'}
                                                                                        </TableCell>
                                                                                        <TableCell>
                                                                                            {formatCurrency(item.base_amount)}
                                                                                        </TableCell>
                                                                                        <TableCell>
                                                                                            {item.surcharge > 0 ? (
                                                                                                <span className="text-amber-600">
                                                                                                    {formatCurrency(item.surcharge)}
                                                                                                </span>
                                                                                            ) : '-'}
                                                                                        </TableCell>
                                                                                        <TableCell>
                                                                                            {item.penalty > 0 ? (
                                                                                                <span className="text-red-600">
                                                                                                    {formatCurrency(item.penalty)}
                                                                                                </span>
                                                                                            ) : '-'}
                                                                                        </TableCell>
                                                                                        <TableCell className="text-right font-bold">
                                                                                            {formatCurrency(item.total_amount)}
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                ))}
                                                                            </TableBody>
                                                                        </Table>
                                                                    </div>
                                                                    {payment.remarks && (
                                                                        <div className="mt-3">
                                                                            <h4 className="font-medium mb-1">Remarks</h4>
                                                                            <p className="text-sm text-gray-600 bg-gray-100 p-2 rounded">
                                                                                {payment.remarks}
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                
                                {/* Pagination */}
                                {payments.meta && payments.meta.total > payments.meta.per_page && (
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="text-sm text-gray-500">
                                            Showing {payments.meta.from} to {payments.meta.to} of {payments.meta.total} results
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={!payments.links?.prev || isLoading}
                                                onClick={() => payments.links.prev && router.get(payments.links.prev)}
                                            >
                                                Previous
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={!payments.links?.next || isLoading}
                                                onClick={() => payments.links.next && router.get(payments.links.next)}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                    <Receipt className="h-6 w-6 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
                                <p className="text-gray-500 mb-6">
                                    {hasActiveFilters 
                                        ? 'No payments match your current filters. Try adjusting your search criteria.'
                                        : 'No payments have been recorded yet. Start by recording your first payment.'}
                                </p>
                                {hasActiveFilters ? (
                                    <Button onClick={handleClearFilters}>
                                        Clear All Filters
                                    </Button>
                                ) : (
                                    <Link href={getRoute('payments.create')}>
                                        <Button>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Record Your First Payment
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}