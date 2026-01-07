import AppLayout from '@/layouts/admin-app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useMemo, useEffect, JSX } from 'react';
import { format } from 'date-fns';
import { route } from 'ziggy-js';
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Search,
    Plus,
    Filter,
    Download,
    Eye,
    Edit,
    Trash2,
    FileText,
    DollarSign,
    Calendar,
    User,
    Home,
    Building,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    MoreVertical,
    BarChart,
    CreditCard,
    Receipt,
    ChevronRight,
    ChevronLeft,
    Hash,
    Printer,
    Copy,
    AlertTriangle,
    ShieldCheck,
    CalendarClock
} from 'lucide-react';

interface Fee {
    id: number;
    fee_type_id: number;
    payer_type: string;
    payer_name: string;
    contact_number?: string;
    purok?: string;
    issue_date: string;
    due_date: string;
    total_amount: number;
    amount_paid: number;
    balance: number;
    status: string;
    fee_code: string;
    fee_type?: {
        name: string;
        category: string;
    };
    resident?: {
        name: string;
    };
    household?: {
        name: string;
    };
    payment?: {
        payment_date?: string;
    };
    created_at: string;
}

interface PaginationLinks {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationData {
    current_page: number;
    data: Fee[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: PaginationLinks[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

interface Filters {
    search?: string;
    status?: string;
    category?: string;
    purok?: string;
    from_date?: string;
    to_date?: string;
}

interface Stats {
    total: number;
    total_amount: number;
    collected: number;
    pending: number;
    overdue_count: number;
}

// Helper function to truncate text
const truncateText = (text: string, maxLength: number = 30): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

// Helper function for contact number
const formatContactNumber = (contact: string): string => {
    if (!contact) return 'N/A';
    if (contact.length <= 12) return contact;
    return truncateText(contact, 12);
};

export default function FeesIndex({
    fees,
    filters,
    statuses,
    categories,
    puroks,
    stats
}: {
    fees: PaginationData;
    filters: Filters;
    statuses: Record<string, string>;
    categories: Record<string, string>;
    puroks: string[];
    stats: Stats;
}) {
    const { flash } = usePage().props as any;
    const [selected, setSelected] = useState<number[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(15);
    const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);

    // Track window resize
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Get responsive truncation length
    const getTruncationLength = (type: 'name' | 'contact' | 'code' = 'name'): number => {
        if (typeof window === 'undefined') return 30;
        
        const width = window.innerWidth;
        if (width < 640) { // Mobile
            switch(type) {
                case 'name': return 15;
                case 'contact': return 10;
                case 'code': return 12;
                default: return 15;
            }
        }
        if (width < 768) { // Tablet
            switch(type) {
                case 'name': return 20;
                case 'contact': return 12;
                case 'code': return 15;
                default: return 20;
            }
        }
        if (width < 1024) { // Small desktop
            switch(type) {
                case 'name': return 25;
                case 'contact': return 15;
                case 'code': return 18;
                default: return 25;
            }
        }
        // Large desktop
        switch(type) {
            case 'name': return 30;
            case 'contact': return 15;
            case 'code': return 20;
            default: return 30;
        }
    };

    // Calculate pagination
    const totalItems = fees.data.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedFees = fees.data.slice(startIndex, endIndex);

    const handleSearch = (value: string) => {
        router.get(route('fees.index'), { search: value }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleFilter = (key: keyof Filters, value: string) => {
        router.get(route('fees.index'), { ...filters, [key]: value || undefined }, {
            preserveState: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        router.get(route('fees.index'), {}, {
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = (fee: Fee) => {
        if (confirm(`Are you sure you want to delete fee #${fee.id}? This action cannot be undone.`)) {
            router.delete(route('fees.destroy', fee.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setSelected(selected.filter(id => id !== fee.id));
                },
            });
        }
    };

    const handleBulkAction = (action: string) => {
        if (selected.length === 0) {
            alert('Please select at least one fee.');
            return;
        }

        if (action === 'delete') {
            if (confirm(`Are you sure you want to delete ${selected.length} selected fees? This action cannot be undone.`)) {
                router.post(route('fees.bulk-action'), {
                    action: 'delete',
                    fee_ids: selected,
                }, {
                    preserveScroll: true,
                    onSuccess: () => {
                        setSelected([]);
                        setShowBulkActions(false);
                    },
                });
            }
        } else if (action === 'issue') {
            router.post(route('fees.bulk-action'), {
                action: 'issue',
                fee_ids: selected,
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelected([]);
                    setShowBulkActions(false);
                },
            });
        } else if (action === 'mark_paid') {
            router.post(route('fees.bulk-action'), {
                action: 'mark_paid',
                fee_ids: selected,
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelected([]);
                    setShowBulkActions(false);
                },
            });
        }
    };

    const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            'paid': 'default',
            'issued': 'outline',
            'pending': 'secondary',
            'partially_paid': 'outline',
            'overdue': 'destructive',
            'cancelled': 'outline',
            'waived': 'outline',
            'written_off': 'outline'
        };
        return variants[status] || 'outline';
    };

    const getStatusIcon = (status: string) => {
        const icons: Record<string, JSX.Element> = {
            'paid': <CheckCircle className="h-4 w-4 text-green-500" />,
            'issued': <FileText className="h-4 w-4 text-blue-500" />,
            'pending': <Clock className="h-4 w-4 text-amber-500" />,
            'partially_paid': <DollarSign className="h-4 w-4 text-indigo-500" />,
            'overdue': <AlertCircle className="h-4 w-4 text-red-500" />,
            'cancelled': <XCircle className="h-4 w-4 text-gray-500" />,
            'waived': <ShieldCheck className="h-4 w-4 text-purple-500" />,
            'written_off': <XCircle className="h-4 w-4 text-gray-500" />
        };
        return icons[status] || null;
    };

    const getPayerIcon = (payerType: string) => {
        switch (payerType) {
            case 'resident':
                return <User className="h-4 w-4" />;
            case 'household':
                return <Home className="h-4 w-4" />;
            case 'business':
                return <Building className="h-4 w-4" />;
            default:
                return <User className="h-4 w-4" />;
        }
    };

    const getCategoryBadgeVariant = (category: string): "default" | "secondary" | "destructive" | "outline" => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            'tax': 'destructive',
            'clearance': 'outline',
            'certificate': 'outline',
            'service': 'secondary',
            'rental': 'outline',
            'fine': 'destructive',
            'contribution': 'outline',
            'other': 'outline'
        };
        return variants[category] || 'outline';
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'MMM dd, yyyy');
    };

    const getDaysOverdue = (dueDate: string) => {
        const due = new Date(dueDate);
        const today = new Date();
        const diffTime = today.getTime() - due.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    const handleCopyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text).then(() => {
            // You could add a toast notification here
            console.log(`Copied ${label} to clipboard:`, text);
        });
    };

    const hasActiveFilters = Object.values(filters).some(value => value);

    return (
        <AppLayout
            title="Fees Management"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Fees', href: '/fees' }
            ]}
        >
            <div className="space-y-6">
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                        <div className="flex items-center">
                            <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                            <div>
                                <p className="text-green-800 font-medium">Success</p>
                                <p className="text-green-700 text-sm mt-1">{flash.success}</p>
                            </div>
                        </div>
                    </div>
                )}

                {flash?.error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                        <div className="flex items-center">
                            <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
                            <div>
                                <p className="text-red-800 font-medium">Error</p>
                                <p className="text-red-700 text-sm mt-1">{flash.error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Fees Management</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                            Manage and track barangay fees, bills, and certificates
                        </p>
                    </div>
                    <Link href={route('fees.create')}>
                        <Button className="h-9">
                            <Plus className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">New Fee</span>
                            <span className="sm:hidden">New</span>
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <Card className="overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                                <Hash className="h-4 w-4 mr-2 text-blue-500" />
                                Total Fees
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">{stats.total}</div>
                            <div className="text-xs sm:text-sm text-gray-500 mt-1">
                                All time
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                                <DollarSign className="h-4 w-4 mr-2 text-green-500" />
                                Total Amount
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">{formatCurrency(stats.total_amount)}</div>
                            <div className="text-xs sm:text-sm text-gray-500 mt-1">
                                All categories
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                                <CreditCard className="h-4 w-4 mr-2 text-indigo-500" />
                                Collected
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">{formatCurrency(stats.collected)}</div>
                            <div className="text-xs sm:text-sm text-gray-500 mt-1">
                                Total payments
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                                <Clock className="h-4 w-4 mr-2 text-amber-500" />
                                Pending
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">{formatCurrency(stats.pending)}</div>
                            <div className="text-xs sm:text-sm text-gray-500 mt-1">
                                Unpaid balance
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                                <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                                Overdue
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">{stats.overdue_count}</div>
                            <div className="text-xs sm:text-sm text-gray-500 mt-1">
                                Past due fees
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Filters */}
                <Card className="overflow-hidden">
                    <CardContent className="pt-6">
                        <div className="flex flex-col space-y-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        placeholder="Search by payer name, fee code, certificate #..."
                                        className="pl-10"
                                        defaultValue={filters.search}
                                        onChange={(e) => handleSearch(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button 
                                        variant="outline" 
                                        onClick={() => setShowFilters(!showFilters)}
                                        className="h-9"
                                    >
                                        <Filter className="h-4 w-4 mr-2" />
                                        <span className="hidden sm:inline">
                                            {showFilters ? 'Hide Filters' : 'More Filters'}
                                        </span>
                                        <span className="sm:hidden">
                                            {showFilters ? 'Hide' : 'Filters'}
                                        </span>
                                    </Button>
                                    <Button 
                                        variant="outline"
                                        className="h-9"
                                        onClick={() => {
                                            const exportUrl = new URL('/fees/export', window.location.origin);
                                            if (filters.search) exportUrl.searchParams.append('search', filters.search);
                                            if (filters.status) exportUrl.searchParams.append('status', filters.status);
                                            if (filters.category) exportUrl.searchParams.append('category', filters.category);
                                            window.open(exportUrl.toString(), '_blank');
                                        }}
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        <span className="hidden sm:inline">Export</span>
                                    </Button>
                                </div>
                            </div>

                            {/* Basic Filters */}
                            <div className="flex flex-wrap gap-2 sm:gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500 hidden sm:inline">Status:</span>
                                    <select
                                        className="border rounded px-2 py-1 text-sm w-28 sm:w-auto"
                                        value={filters.status || ''}
                                        onChange={(e) => handleFilter('status', e.target.value)}
                                    >
                                        <option value="">All Status</option>
                                        {Object.entries(statuses).map(([value, label]) => (
                                            <option key={value} value={value}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500 hidden sm:inline">Category:</span>
                                    <select
                                        className="border rounded px-2 py-1 text-sm w-28 sm:w-auto"
                                        value={filters.category || ''}
                                        onChange={(e) => handleFilter('category', e.target.value)}
                                    >
                                        <option value="">All Categories</option>
                                        {Object.entries(categories).map(([value, label]) => (
                                            <option key={value} value={value}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500 hidden sm:inline">Purok:</span>
                                    <select
                                        className="border rounded px-2 py-1 text-sm w-28 sm:w-auto"
                                        value={filters.purok || ''}
                                        onChange={(e) => handleFilter('purok', e.target.value)}
                                    >
                                        <option value="">All Puroks</option>
                                        {puroks.map((purok) => (
                                            <option key={purok} value={purok}>
                                                {purok}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500 hidden sm:inline">Date:</span>
                                    <select
                                        className="border rounded px-2 py-1 text-sm w-28 sm:w-auto"
                                        value=""
                                        onChange={(e) => {
                                            if (e.target.value === 'last30') {
                                                const today = new Date();
                                                const lastMonth = new Date(today);
                                                lastMonth.setMonth(today.getMonth() - 1);
                                                handleFilter('from_date', lastMonth.toISOString().split('T')[0]);
                                                handleFilter('to_date', today.toISOString().split('T')[0]);
                                            }
                                        }}
                                    >
                                        <option value="">Date Range</option>
                                        <option value="last30">Last 30 Days</option>
                                    </select>
                                </div>
                            </div>

                            {/* Advanced Filters */}
                            {showFilters && (
                                <div className="border-t pt-4 space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Date Range</label>
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="From Date"
                                                    type="date"
                                                    className="w-full"
                                                    value={filters.from_date || ''}
                                                    onChange={(e) => handleFilter('from_date', e.target.value)}
                                                />
                                                <span className="self-center text-sm">to</span>
                                                <Input
                                                    placeholder="To Date"
                                                    type="date"
                                                    className="w-full"
                                                    value={filters.to_date || ''}
                                                    onChange={(e) => handleFilter('to_date', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Amount Range</label>
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="Min amount"
                                                    type="number"
                                                    className="w-full"
                                                />
                                                <span className="self-center text-sm">to</span>
                                                <Input
                                                    placeholder="Max amount"
                                                    type="number"
                                                    className="w-full"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Quick Actions</label>
                                            <div className="flex flex-wrap gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className={`h-8 ${filters.status === 'overdue' ? 'bg-red-50 text-red-700' : ''}`}
                                                    onClick={() => handleFilter('status', 'overdue')}
                                                >
                                                    Overdue Only
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className={`h-8 ${filters.status === 'pending' ? 'bg-amber-50 text-amber-700' : ''}`}
                                                    onClick={() => handleFilter('status', 'pending')}
                                                >
                                                    Pending Only
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8"
                                                    onClick={() => {
                                                        const today = new Date();
                                                        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                                                        handleFilter('from_date', firstDay.toISOString().split('T')[0]);
                                                        handleFilter('to_date', today.toISOString().split('T')[0]);
                                                    }}
                                                >
                                                    This Month
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Active filters indicator and clear button */}
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                <div className="text-sm text-gray-500">
                                    Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} fees
                                    {filters.search && ` matching "${filters.search}"`}
                                </div>
                                
                                {hasActiveFilters && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearFilters}
                                        className="text-red-600 hover:text-red-700 h-8"
                                    >
                                        Clear All Filters
                                    </Button>
                                )}
                                
                                {selected.length > 0 && (
                                    <div className="relative">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowBulkActions(!showBulkActions)}
                                            className="h-8 bg-primary-50 text-primary-700 hover:bg-primary-100"
                                        >
                                            <span>{selected.length} selected</span>
                                            <MoreVertical className="h-4 w-4 ml-2" />
                                        </Button>
                                        {showBulkActions && (
                                            <DropdownMenu open={showBulkActions} onOpenChange={setShowBulkActions}>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem onClick={() => handleBulkAction('issue')}>
                                                        <FileText className="mr-2 h-4 w-4" />
                                                        <span>Mark as Issued</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleBulkAction('mark_paid')}>
                                                        <CreditCard className="mr-2 h-4 w-4" />
                                                        <span>Mark as Paid</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem 
                                                        onClick={() => handleBulkAction('delete')}
                                                        className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        <span>Delete Selected</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Fees Table */}
                <Card className="overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-lg sm:text-xl">Fees List</CardTitle>
                        <div className="text-sm text-gray-500">
                            Page {currentPage} of {totalPages}
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <div className="min-w-full inline-block align-middle">
                                <div className="overflow-hidden">
                                    <Table className="min-w-full">
                                        <TableHeader>
                                            <TableRow className="bg-gray-50 dark:bg-gray-800">
                                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[60px]">
                                                    <input
                                                        type="checkbox"
                                                        className="rounded border-gray-300 dark:border-gray-600"
                                                        checked={selected.length === paginatedFees.length && paginatedFees.length > 0}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelected(paginatedFees.map(fee => fee.id));
                                                            } else {
                                                                setSelected([]);
                                                            }
                                                        }}
                                                    />
                                                </TableHead>
                                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[160px]">
                                                    Fee Details
                                                </TableHead>
                                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">
                                                    Payer Information
                                                </TableHead>
                                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px]">
                                                    Dates
                                                </TableHead>
                                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                                                    Amount
                                                </TableHead>
                                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                                                    Status
                                                </TableHead>
                                                <TableHead className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 dark:bg-gray-800 min-w-[80px]">
                                                    Actions
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {paginatedFees.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                                        <div className="flex flex-col items-center justify-center space-y-4">
                                                            <FileText className="h-16 w-16 text-gray-300 dark:text-gray-700" />
                                                            <div>
                                                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No fees found</h3>
                                                                <p className="text-gray-500 dark:text-gray-400">
                                                                    {hasActiveFilters 
                                                                        ? 'Try changing your filters or search criteria.'
                                                                        : 'Get started by creating a new fee.'}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                {hasActiveFilters && (
                                                                    <Button
                                                                        variant="outline"
                                                                        onClick={clearFilters}
                                                                        className="h-8"
                                                                    >
                                                                        Clear Filters
                                                                    </Button>
                                                                )}
                                                                <Link
                                                                    href={route('fees.create')}
                                                                >
                                                                    <Button className="h-8">
                                                                        <Plus className="h-3 w-3 mr-1" />
                                                                        Create New Fee
                                                                    </Button>
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                paginatedFees.map((fee) => {
                                                    const nameLength = getTruncationLength('name');
                                                    const contactLength = getTruncationLength('contact');
                                                    const codeLength = getTruncationLength('code');
                                                    const daysOverdue = getDaysOverdue(fee.due_date);
                                                    
                                                    return (
                                                        <TableRow key={fee.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                                            <TableCell className="px-4 py-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selected.includes(fee.id)}
                                                                    onChange={(e) => {
                                                                        if (e.target.checked) {
                                                                            setSelected([...selected, fee.id]);
                                                                        } else {
                                                                            setSelected(selected.filter(id => id !== fee.id));
                                                                        }
                                                                    }}
                                                                    className="rounded border-gray-300 dark:border-gray-600"
                                                                />
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3">
                                                                <div 
                                                                    className="space-y-1 cursor-text select-text"
                                                                    onDoubleClick={(e) => {
                                                                        const selection = window.getSelection();
                                                                        if (selection) {
                                                                            const range = document.createRange();
                                                                            range.selectNodeContents(e.currentTarget);
                                                                            selection.removeAllRanges();
                                                                            selection.addRange(range);
                                                                        }
                                                                    }}
                                                                    title={`Double-click to select all\nFee Code: ${fee.fee_code}\nType: ${fee.fee_type?.name || 'Unknown'}`}
                                                                >
                                                                    <div className="font-medium">
                                                                        <div 
                                                                            className="truncate"
                                                                            data-full-text={fee.fee_code}
                                                                        >
                                                                            {truncateText(fee.fee_code, codeLength)}
                                                                        </div>
                                                                    </div>
                                                                    <div 
                                                                        className="text-sm text-gray-500 truncate"
                                                                        data-full-text={fee.fee_type?.name}
                                                                    >
                                                                        {fee.fee_type?.name || 'Unknown Fee Type'}
                                                                    </div>
                                                                    {fee.fee_type?.category && (
                                                                        <div className="mt-1">
                                                                            <Badge 
                                                                                variant={getCategoryBadgeVariant(fee.fee_type.category)}
                                                                                className="truncate max-w-full"
                                                                                title={categories[fee.fee_type.category] || fee.fee_type.category}
                                                                            >
                                                                                {truncateText(categories[fee.fee_type.category] || fee.fee_type.category, 15)}
                                                                            </Badge>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3">
                                                                <div 
                                                                    className="flex items-center gap-3 cursor-text select-text"
                                                                    onDoubleClick={(e) => {
                                                                        const selection = window.getSelection();
                                                                        if (selection) {
                                                                            const range = document.createRange();
                                                                            range.selectNodeContents(e.currentTarget);
                                                                            selection.removeAllRanges();
                                                                            selection.addRange(range);
                                                                        }
                                                                    }}
                                                                    title={`Double-click to select all\nPayer: ${fee.payer_name}\nContact: ${fee.contact_number || 'N/A'}\nPurok: ${fee.purok || 'N/A'}`}
                                                                >
                                                                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                                                        {getPayerIcon(fee.payer_type)}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <div 
                                                                            className="font-medium truncate"
                                                                            data-full-text={fee.payer_name}
                                                                        >
                                                                            {truncateText(fee.payer_name, nameLength)}
                                                                        </div>
                                                                        <div 
                                                                            className="text-sm text-gray-500 truncate mt-1"
                                                                            data-full-text={fee.contact_number}
                                                                        >
                                                                            {formatContactNumber(fee.contact_number || '')}
                                                                        </div>
                                                                        {fee.purok && (
                                                                            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">
                                                                                Purok {fee.purok}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3">
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                                                        <span className="text-sm truncate">
                                                                            <span className="font-medium">Issued:</span>{' '}
                                                                            <span className="text-gray-600 dark:text-gray-400">{formatDate(fee.issue_date)}</span>
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                                                        <span className="text-sm truncate">
                                                                            <span className="font-medium">Due:</span>{' '}
                                                                            <span className={daysOverdue > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}>
                                                                                {formatDate(fee.due_date)}
                                                                            </span>
                                                                            {daysOverdue > 0 && fee.status !== 'paid' && (
                                                                                <span className="text-xs text-red-500 dark:text-red-400 ml-1 truncate">
                                                                                    ({daysOverdue} days)
                                                                                </span>
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3">
                                                                <div className="space-y-1">
                                                                    <div className="font-bold text-lg truncate" title={formatCurrency(fee.total_amount)}>
                                                                        {formatCurrency(fee.total_amount)}
                                                                    </div>
                                                                    <div className="text-sm text-green-600 dark:text-green-400 truncate" title={formatCurrency(fee.amount_paid)}>
                                                                        Paid: {formatCurrency(fee.amount_paid)}
                                                                    </div>
                                                                    <div className="text-sm text-red-600 dark:text-red-400 truncate" title={formatCurrency(fee.balance)}>
                                                                        Balance: {formatCurrency(fee.balance)}
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3">
                                                                <Badge 
                                                                    variant={getStatusBadgeVariant(fee.status)} 
                                                                    className="flex items-center gap-1 truncate max-w-full"
                                                                    title={statuses[fee.status] || fee.status}
                                                                >
                                                                    {getStatusIcon(fee.status)}
                                                                    <span className="truncate">
                                                                        {truncateText(statuses[fee.status] || fee.status, 15)}
                                                                    </span>
                                                                </Badge>
                                                                {fee.status === 'paid' && fee.payment?.payment_date && (
                                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                                                                        Paid on {formatDate(fee.payment.payment_date)}
                                                                    </div>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3 text-right sticky right-0 bg-white dark:bg-gray-900">
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button 
                                                                            variant="ghost" 
                                                                            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                                        >
                                                                            <span className="sr-only">Open menu</span>
                                                                            <MoreVertical className="h-4 w-4" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end" className="w-48">
                                                                        <DropdownMenuItem asChild>
                                                                            <Link href={route('fees.show', fee.id)} className="flex items-center cursor-pointer">
                                                                                <Eye className="mr-2 h-4 w-4" />
                                                                                <span>View Details</span>
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                        
                                                                        {(fee.status === 'pending' || fee.status === 'issued') && (
                                                                            <DropdownMenuItem asChild>
                                                                                <Link href={route('fees.edit', fee.id)} className="flex items-center cursor-pointer">
                                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                                    <span>Edit Fee</span>
                                                                                </Link>
                                                                            </DropdownMenuItem>
                                                                        )}
                                                                        
                                                                        <DropdownMenuSeparator />
                                                                        
                                                                        <DropdownMenuItem 
                                                                            onClick={() => handleCopyToClipboard(fee.fee_code, 'Fee Code')}
                                                                            className="flex items-center cursor-pointer"
                                                                        >
                                                                            <Copy className="mr-2 h-4 w-4" />
                                                                            <span>Copy Fee Code</span>
                                                                        </DropdownMenuItem>
                                                                        
                                                                        <DropdownMenuItem 
                                                                            onClick={() => handleCopyToClipboard(fee.payer_name, 'Payer Name')}
                                                                            className="flex items-center cursor-pointer"
                                                                        >
                                                                            <Copy className="mr-2 h-4 w-4" />
                                                                            <span>Copy Payer Name</span>
                                                                        </DropdownMenuItem>
                                                                        
                                                                        <DropdownMenuItem asChild>
                                                                            <Link href={`/fees/${fee.id}/print`} className="flex items-center cursor-pointer">
                                                                                <Printer className="mr-2 h-4 w-4" />
                                                                                <span>Print Invoice</span>
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                        
                                                                        {fee.status !== 'paid' && fee.balance > 0 && (
                                                                            <DropdownMenuItem asChild>
                                                                                <Link href={route('payments.create', fee.id)} className="flex items-center cursor-pointer">
                                                                                    <CreditCard className="mr-2 h-4 w-4" />
                                                                                    <span>Record Payment</span>
                                                                                </Link>
                                                                            </DropdownMenuItem>
                                                                        )}
                                                                        
                                                                        <DropdownMenuSeparator />
                                                                        
                                                                        {fee.status === 'pending' && (
                                                                            <DropdownMenuItem 
                                                                                onClick={() => handleDelete(fee)}
                                                                                className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                                                            >
                                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                                <span>Delete Fee</span>
                                                                            </DropdownMenuItem>
                                                                        )}
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-4 pt-4 px-4 border-t">
                                <div className="text-sm text-gray-500">
                                    Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} results
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="h-8"
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-1" />
                                        Previous
                                    </Button>
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum;
                                            if (totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (currentPage <= 3) {
                                                pageNum = i + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                pageNum = totalPages - 4 + i;
                                            } else {
                                                pageNum = currentPage - 2 + i;
                                            }
                                            return (
                                                <Button
                                                    key={pageNum}
                                                    variant={currentPage === pageNum ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    {pageNum}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="h-8"
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}