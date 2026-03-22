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
    Banknote,
    ShieldCheck,
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

// Import payment-specific components
import { ModernPaymentCard } from '@/components/residentui/modern-payment-card';
import { ModernPaymentGridCard } from '@/components/residentui/payments/modern-payment-grid-card';
import { ModernPaymentFilters } from '@/components/residentui/payments/modern-payment-filters';

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

// Types
type PaymentStatus = 'completed' | 'paid' | 'pending' | 'overdue' | 'cancelled';
type PaymentMethod = 'cash' | 'gcash' | 'maya' | 'bank' | 'check' | 'online';
type ViewMode = 'grid' | 'list';
type TabValue = 'all' | PaymentStatus;

interface PayerDetails {
    name: string;
    contact_number?: string;
    address?: string;
    household_number?: string;
    purok?: string;
}

interface PaymentItem {
    id: number;
    item_name: string;
    description?: string;
    quantity: number;
    unit_price: number;
    total: number;
}

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
    status: PaymentStatus;
    payment_method: PaymentMethod;
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
    payer_details?: PayerDetails;
    items?: PaymentItem[];
}

interface PageProps extends Record<string, any> {
    payments?: {
        data: Payment[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    stats?: {
        total_payments: number;
        pending_payments: number;
        total_paid: number;
        balance_due: number;
        completed_payments: number;
        overdue_payments: number;
        cancelled_payments: number;
        current_year_total: number;
        current_year_paid: number;
        current_year_balance: number;
    };
    availableYears?: number[];
    availablePaymentMethods?: Array<{
        type: string;
        display_name: string;
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
        payment_method?: string;
        year?: string;
        page?: string;
    };
    error?: string;
}

// Payment-specific utilities
const formatDate = (dateString: string, isMobile?: boolean): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'N/A';
        
        return isMobile 
            ? date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
            : date.toLocaleDateString('en-PH', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
    } catch {
        return 'N/A';
    }
};

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
    }).format(amount);
};

const getPaymentStatsCards = (stats: PageProps['stats']) => [
    {
        title: 'Total Payments',
        value: stats?.total_payments || 0,
        icon: Receipt,
        color: 'from-blue-500 to-blue-600',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        textColor: 'text-blue-600 dark:text-blue-400',
        trend: stats?.total_payments > 0 ? `${((stats?.total_paid || 0) / (stats?.total_payments || 1) * 100).toFixed(1)}% paid` : 'No payments',
        trendUp: true,
    },
    {
        title: 'Total Paid',
        value: formatCurrency(stats?.total_paid || 0),
        icon: Banknote,
        color: 'from-emerald-500 to-emerald-600',
        bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
        textColor: 'text-emerald-600 dark:text-emerald-400',
        trend: stats?.total_paid > 0 ? 'Completed' : 'No payments',
        trendUp: true,
    },
    {
        title: 'Balance Due',
        value: formatCurrency(stats?.balance_due || 0),
        icon: AlertCircle,
        color: 'from-amber-500 to-amber-600',
        bgColor: 'bg-amber-50 dark:bg-amber-900/20',
        textColor: 'text-amber-600 dark:text-amber-400',
        trend: stats?.balance_due > 0 ? 'Needs attention' : 'All paid',
        trendUp: false,
        badge: stats?.overdue_payments ? `${stats.overdue_payments} overdue` : null,
    },
    {
        title: 'Pending',
        value: stats?.pending_payments || 0,
        icon: Clock,
        color: 'from-purple-500 to-purple-600',
        bgColor: 'bg-purple-50 dark:bg-purple-900/20',
        textColor: 'text-purple-600 dark:text-purple-400',
        badge: stats?.pending_payments ? `${stats.pending_payments} pending` : null,
    },
];

const getStatusCount = (stats: PageProps['stats'], status: string, payments: Payment[] = []): number => {
    switch (status) {
        case 'all':
            return stats?.total_payments || 0;
        case 'paid':
            return (stats?.completed_payments || 0) + payments.filter(p => p.status === 'paid').length;
        case 'completed':
            return stats?.completed_payments || 0;
        case 'pending':
            return stats?.pending_payments || 0;
        case 'overdue':
            return stats?.overdue_payments || 0;
        case 'cancelled':
            return stats?.cancelled_payments || 0;
        default:
            return 0;
    }
};

const printPaymentsList = (payments: Payment[], statusFilter: string, formatDate: Function, formatCurrency: Function) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        toast.error('Please allow popups to print');
        return;
    }

    const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>My Payments Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; background: white; color: #333; }
                h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
                .print-header { margin-bottom: 30px; }
                .print-info { display: flex; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; }
                .payment-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                .payment-table th { background-color: #f3f4f6; padding: 12px; text-align: left; border: 1px solid #ddd; }
                .payment-table td { padding: 10px; border: 1px solid #ddd; }
                .badge { padding: 2px 8px; border-radius: 12px; font-size: 12px; display: inline-block; }
                .badge-paid, .badge-completed { background-color: #d1fae5; color: #065f46; }
                .badge-pending { background-color: #fef3c7; color: #92400e; }
                .badge-overdue { background-color: #fee2e2; color: #991b1b; }
                .badge-cancelled { background-color: #f3f4f6; color: #374151; }
                .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px; }
                @media print {
                    body { margin: 0; }
                }
            </style>
        </head>
        <body>
            <div class="print-header">
                <h1>My Payments Report</h1>
                <div class="print-info">
                    <div>
                        <p><strong>Generated:</strong> ${new Date().toLocaleDateString('en-PH', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}</p>
                        <p><strong>Total Payments:</strong> ${payments.length}</p>
                        <p><strong>Status:</strong> ${statusFilter === 'all' ? 'All' : statusFilter}</p>
                    </div>
                </div>
            </div>
            
            <table class="payment-table">
                <thead>
                    <tr>
                        <th>OR Number</th>
                        <th>Purpose</th>
                        <th>Date</th>
                        <th>Payment Method</th>
                        <th>Status</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${payments.map(payment => `
                        <tr>
                            <td>${payment.or_number}</td>
                            <td>${payment.purpose}</td>
                            <td>${formatDate(payment.payment_date)}</td>
                            <td>${payment.payment_method_display}</td>
                            <td><span class="badge badge-${payment.status}">${payment.status.toUpperCase()}</span></td>
                            <td>${formatCurrency(payment.total_amount)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="footer">
                <p>Generated from Barangay Management System</p>
            </div>
        </body>
        </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
};

const exportToCSV = (payments: Payment[], statusFilter: string, formatDate: Function, setIsExporting: Function, toast: any) => {
    if (payments.length === 0) {
        toast.error('No payments to export');
        return;
    }

    setIsExporting(true);

    setTimeout(() => {
        const headers = [
            'OR Number',
            'Reference Number',
            'Purpose',
            'Certificate Type',
            'Subtotal',
            'Surcharge',
            'Penalty',
            'Discount',
            'Total Amount',
            'Payment Date',
            'Due Date',
            'Status',
            'Payment Method',
            'Collection Type',
            'Remarks',
        ];

        const csvData = payments.map(payment => [
            payment.or_number,
            payment.reference_number || 'N/A',
            `"${payment.purpose.replace(/"/g, '""')}"`,
            payment.certificate_type_display || 'N/A',
            (payment.subtotal || 0).toFixed(2),
            (payment.surcharge || 0).toFixed(2),
            (payment.penalty || 0).toFixed(2),
            (payment.discount || 0).toFixed(2),
            (payment.total_amount || 0).toFixed(2),
            formatDate(payment.payment_date),
            payment.due_date ? formatDate(payment.due_date) : 'N/A',
            payment.status.toUpperCase(),
            payment.payment_method_display,
            payment.collection_type_display,
            `"${(payment.remarks || '').replace(/"/g, '""')}"`,
        ]);

        const csvContent = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `payments_${statusFilter}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setIsExporting(false);
        toast.success('CSV file downloaded successfully');
    }, 500);
};

const getPaymentMethodDisplay = (method: string): string => {
    const methods: Record<string, string> = {
        cash: 'Cash',
        gcash: 'GCash',
        maya: 'Maya',
        bank: 'Bank Transfer',
        check: 'Check',
        online: 'Online Payment',
    };
    return methods[method] || method;
};

// Main Component
export default function MyPayments() {
    const page = usePage<PageProps>();
    const pageProps = page.props;
    
    const payments = pageProps.payments || {
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
        total_payments: 0,
        pending_payments: 0,
        total_paid: 0,
        balance_due: 0,
        completed_payments: 0,
        overdue_payments: 0,
        cancelled_payments: 0,
        current_year_total: 0,
        current_year_paid: 0,
        current_year_balance: 0,
    };
    
    const availableYears = pageProps.availableYears || [];
    const availablePaymentMethods = pageProps.availablePaymentMethods || [];
    const currentResident = pageProps.currentResident || { id: 0, first_name: '', last_name: '' };
    const hasProfile = pageProps.hasProfile || false;
    const filters = pageProps.filters || {};
    
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
    const [yearFilter, setYearFilter] = useState('all');
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [showStats, setShowStats] = useState(true);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [selectedPayments, setSelectedPayments] = useState<number[]>([]);
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
            setPaymentMethodFilter(filters.payment_method || 'all');
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
        
        router.get('/portal/payments', cleanFilters, {
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
    
    const handlePaymentMethodChange = (method: string) => {
        setPaymentMethodFilter(method);
        updateFilters({ 
            payment_method: method === 'all' ? '' : method,
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
        setPaymentMethodFilter('all');
        setYearFilter('all');
        
        router.get('/portal/payments', {}, {
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
    
    const toggleSelectPayment = (id: number) => {
        setSelectedPayments(prev =>
            prev.includes(id)
                ? prev.filter(paymentId => paymentId !== id)
                : [...prev, id]
        );
    };
    
    const selectAllPayments = () => {
        const currentPayments = payments.data;
        if (selectedPayments.length === currentPayments.length && currentPayments.length > 0) {
            setSelectedPayments([]);
        } else {
            setSelectedPayments(currentPayments.map(p => p.id));
        }
    };
    
    const toggleSelectMode = () => {
        if (selectMode) {
            setSelectMode(false);
            setSelectedPayments([]);
        } else {
            setSelectMode(true);
        }
    };
    
    const getCurrentTabPayments = () => {
        return payments.data;
    };
    
    const hasActiveFilters = useMemo(() => {
        return Object.entries(filters).some(([key, value]) => 
            key !== 'page' && value && value !== '' && value !== 'all'
        );
    }, [filters]);
    
    const handlePrintPayments = () => {
        const currentPayments = getCurrentTabPayments();
        printPaymentsList(currentPayments, statusFilter, formatDate, formatCurrency);
    };
    
    const handleExportCSV = () => {
        const currentPayments = getCurrentTabPayments();
        exportToCSV(currentPayments, statusFilter, formatDate, setIsExporting, toast);
    };
    
    const handleCopyOrNumber = (orNumber: string) => {
        navigator.clipboard.writeText(orNumber);
        toast.success(`Copied: ${orNumber}`);
    };
    
    const handleCopyReference = (ref: string) => {
        navigator.clipboard.writeText(ref);
        toast.success(`Copied: ${ref}`);
    };
    
    const handleViewDetails = (id: number) => {
        router.visit(`/portal/payments/${id}`);
    };
    
    const handleMakePayment = (id: number) => {
        router.visit(`/portal/payments/create?payment_id=${id}`);
    };
    
    const handleDownloadReceipt = (payment: Payment) => {
        toast.info('Receipt download would be implemented here');
    };
    
    const handleGenerateReceipt = (payment: Payment) => {
        const reportWindow = window.open('', '_blank');
        if (reportWindow) {
            reportWindow.document.write(`
                <h1>Payment Receipt: ${payment.or_number}</h1>
                <p><strong>Purpose:</strong> ${payment.purpose}</p>
                <p><strong>Amount:</strong> ${formatCurrency(payment.total_amount)}</p>
                <p><strong>Status:</strong> ${payment.status}</p>
            `);
        }
    };
    
    const renderTabContent = () => {
        const currentPayments = getCurrentTabPayments();
        const tabHasData = currentPayments.length > 0;
        
        return (
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
                <CardContent className="p-4 md:p-6">
                    {/* Selection Mode Banner */}
                    {selectMode && tabHasData && (
                        <ModernSelectionBanner
                            selectedCount={selectedPayments.length}
                            totalCount={currentPayments.length}
                            onSelectAll={selectAllPayments}
                            onDeselectAll={() => setSelectedPayments([])}
                            onCancel={toggleSelectMode}
                            onDelete={() => {
                                toast.success(`Deleted ${selectedPayments.length} payments`);
                                setSelectedPayments([]);
                                setSelectMode(false);
                            }}
                            deleteLabel="Delete Selected"
                        />
                    )}
                    
                    {/* Header with Sort */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {statusFilter === 'all' ? 'All' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Payments
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {tabHasData 
                                    ? `Showing ${currentPayments.length} payment${currentPayments.length !== 1 ? 's' : ''}`
                                    : `No ${statusFilter === 'all' ? 'payments' : statusFilter.replace('_', ' ')} found`
                                }
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            {/* Sort Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="gap-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <ArrowUpDown className="h-4 w-4" />
                                        Sort
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                                    <DropdownMenuItem onClick={() => {
                                        setSortBy('date');
                                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                                    }} className="text-gray-700 dark:text-gray-300">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {
                                        setSortBy('amount');
                                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                                    }} className="text-gray-700 dark:text-gray-300">
                                        <DollarSign className="h-4 w-4 mr-2" />
                                        Amount {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {
                                        setSortBy('status');
                                        setSortOrder('asc');
                                    }} className="text-gray-700 dark:text-gray-300">
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
                                    className="gap-2 border-gray-200 dark:border-gray-700"
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
                                    {currentPayments.map((payment) => (
                                        isMobile ? (
                                            <ModernPaymentCard
                                                key={`payment-${payment.id}`}
                                                payment={payment}
                                                selectMode={selectMode}
                                                selectedPayments={selectedPayments}
                                                toggleSelectPayment={toggleSelectPayment}
                                                formatDate={(date) => formatDate(date, isMobile)}
                                                formatCurrency={formatCurrency}
                                                onViewDetails={handleViewDetails}
                                                onMakePayment={handleMakePayment}
                                                onDownloadReceipt={handleDownloadReceipt}
                                                onCopyOrNumber={handleCopyOrNumber}
                                                onCopyReference={handleCopyReference}
                                                onGenerateReceipt={handleGenerateReceipt}
                                                isMobile={isMobile}
                                            />
                                        ) : (
                                            <ModernPaymentGridCard
                                                key={`payment-${payment.id}`}
                                                payment={payment}
                                                selectMode={selectMode}
                                                selectedPayments={selectedPayments}
                                                toggleSelectPayment={toggleSelectPayment}
                                                formatDate={(date) => formatDate(date, isMobile)}
                                                formatCurrency={formatCurrency}
                                                onViewDetails={handleViewDetails}
                                                onMakePayment={handleMakePayment}
                                                onDownloadReceipt={handleDownloadReceipt}
                                                onCopyOrNumber={handleCopyOrNumber}
                                                onCopyReference={handleCopyReference}
                                                onGenerateReceipt={handleGenerateReceipt}
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
                                            <TableRow className="hover:bg-transparent border-gray-200 dark:border-gray-700">
                                                {selectMode && (
                                                    <TableHead className="w-12">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedPayments.length === currentPayments.length && currentPayments.length > 0}
                                                            onChange={selectAllPayments}
                                                            className="h-4 w-4 rounded border-gray-300 dark:border-gray-600"
                                                        />
                                                    </TableHead>
                                                )}
                                                <TableHead className="font-semibold text-gray-700 dark:text-gray-300">OR Details</TableHead>
                                                <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Purpose & Type</TableHead>
                                                <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Dates</TableHead>
                                                <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Method</TableHead>
                                                <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Status</TableHead>
                                                <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Amount</TableHead>
                                                <TableHead className="font-semibold text-gray-700 dark:text-gray-300 text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {currentPayments.map((payment) => (
                                                <TableRow key={`table-${payment.id}`} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors border-gray-200 dark:border-gray-700">
                                                    {selectMode && (
                                                        <TableCell>
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedPayments.includes(payment.id)}
                                                                onChange={() => toggleSelectPayment(payment.id)}
                                                                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600"
                                                            />
                                                        </TableCell>
                                                    )}
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <button
                                                                onClick={() => handleCopyOrNumber(payment.or_number)}
                                                                className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                                                            >
                                                                OR #{payment.or_number}
                                                            </button>
                                                            {payment.reference_number && (
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                    Ref: {payment.reference_number}
                                                                </p>
                                                            )}
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                {payment.collection_type_display}
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium text-gray-900 dark:text-white">
                                                                {payment.purpose}
                                                            </p>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                                                {payment.certificate_type_display || 'General Payment'}
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">Paid</p>
                                                                <p className="text-sm text-gray-700 dark:text-gray-300">{formatDate(payment.payment_date)}</p>
                                                            </div>
                                                            {payment.due_date && (
                                                                <div>
                                                                    <p className={cn(
                                                                        "text-xs",
                                                                        payment.status === 'overdue' ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
                                                                    )}>
                                                                        Due
                                                                    </p>
                                                                    <p className={cn(
                                                                        "text-sm",
                                                                        payment.status === 'overdue' && "text-red-600 dark:text-red-400 font-medium"
                                                                    )}>
                                                                        {formatDate(payment.due_date)}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                                            {getPaymentMethodDisplay(payment.payment_method)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className={cn(
                                                            "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                                                            payment.status === 'paid' || payment.status === 'completed' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "",
                                                            payment.status === 'pending' ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "",
                                                            payment.status === 'overdue' ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "",
                                                            payment.status === 'cancelled' ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400" : "",
                                                        )}>
                                                            {payment.status === 'paid' || payment.status === 'completed' ? 'Paid' :
                                                             payment.status === 'pending' ? 'Pending' :
                                                             payment.status === 'overdue' ? 'Overdue' :
                                                             payment.status === 'cancelled' ? 'Cancelled' : payment.status}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <p className="font-bold text-gray-900 dark:text-white">
                                                                {formatCurrency(payment.total_amount)}
                                                            </p>
                                                            {((payment.surcharge || 0) > 0 ||
                                                              (payment.penalty || 0) > 0 ||
                                                              (payment.discount || 0) > 0) && (
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                    Base: {formatCurrency(payment.subtotal)}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            className="h-8 w-8 p-0 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                                                            onClick={() => handleViewDetails(payment.id)}
                                                                        >
                                                                            <Eye className="h-4 w-4" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>View Details</TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                            
                                                            {(payment.status === 'pending' || payment.status === 'overdue') && (
                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Button
                                                                                size="sm"
                                                                                variant="default"
                                                                                className="h-8 px-3 text-xs bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                                                                                onClick={() => handleMakePayment(payment.id)}
                                                                            >
                                                                                Pay
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                            )}
                                                            
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                                                                        <MoreVertical className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                                                                    <DropdownMenuItem onClick={() => handleCopyOrNumber(payment.or_number)} className="text-gray-700 dark:text-gray-300">
                                                                        <Copy className="h-4 w-4 mr-2" />
                                                                        Copy OR Number
                                                                    </DropdownMenuItem>
                                                                    {payment.reference_number && (
                                                                        <DropdownMenuItem onClick={() => handleCopyReference(payment.reference_number!)} className="text-gray-700 dark:text-gray-300">
                                                                            <Copy className="h-4 w-4 mr-2" />
                                                                            Copy Reference
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    {(payment.status === 'paid' || payment.status === 'completed') && (
                                                                        <DropdownMenuItem onClick={() => handleDownloadReceipt(payment)} className="text-gray-700 dark:text-gray-300">
                                                                            <Download className="h-4 w-4 mr-2" />
                                                                            Download Receipt
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    <DropdownMenuItem onClick={() => handleGenerateReceipt(payment)} className="text-gray-700 dark:text-gray-300">
                                                                        <FileText className="h-4 w-4 mr-2" />
                                                                        Generate Receipt
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={handlePrintPayments} className="text-gray-700 dark:text-gray-300">
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
                            {payments.last_page > 1 && (
                                <div className="mt-6">
                                    <ModernPagination
                                        currentPage={payments.current_page}
                                        lastPage={payments.last_page}
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
                    { title: 'My Payments', href: '/portal/payments' }
                ]}
            >
                <Head title="My Payments" />
                <div className="min-h-[50vh] flex items-center justify-center px-4">
                    <Card className="w-full max-w-md border-0 shadow-xl bg-white dark:bg-gray-900">
                        <CardContent className="pt-6 text-center">
                            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 rounded-2xl flex items-center justify-center mb-4">
                                <AlertCircle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Complete Your Profile</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                You need to complete your resident profile before you can view payments.
                            </p>
                            <Link href="/resident/profile/create">
                                <Button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                                    Complete Profile
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </ResidentLayout>
        );
    }
    
    if (pageProps.error) {
        return (
            <ResidentLayout
                breadcrumbs={[
                    { title: 'Dashboard', href: '/portal/dashboard' },
                    { title: 'My Payments', href: '/portal/payments' }
                ]}
            >
                <div className="space-y-6">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">My Payments</h1>
                    </div>
                    <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
                        <CardContent className="py-12 text-center">
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
            <Head title="My Payments" />
            
            <ResidentLayout
                breadcrumbs={[
                    { title: 'Dashboard', href: '/portal/dashboard' },
                    { title: 'My Payments', href: '/portal/payments' }
                ]}
            >
                <div className="space-y-4 md:space-y-6 pb-20 md:pb-6">
                    {/* Mobile Header */}
                    {isMobile && (
                        <div className="flex items-center justify-between sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl z-10 py-3 px-4 -mx-4">
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Payments</h1>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {stats.total_payments} payment{stats.total_payments !== 1 ? 's' : ''} total
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
                                <Link href="/portal/payments/create">
                                    <Button size="sm" className="h-8 px-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                                        <Plus className="h-4 w-4 mr-1" />
                                        Pay
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
                                    My Payments
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    View and manage your barangay payments
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePrintPayments}
                                    className="gap-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                                >
                                    <Printer className="h-4 w-4" />
                                    Print
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleExportCSV}
                                    disabled={isExporting}
                                    className="gap-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
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
                            <ModernStatsCards cards={getPaymentStatsCards(stats)} loading={loading} />
                        </div>
                    )}
                    
                    {/* Desktop Filters */}
                    {!isMobile && (
                        <ModernPaymentFilters
                            search={search}
                            setSearch={setSearch}
                            handleSearchSubmit={handleSearchSubmit}
                            handleSearchClear={handleSearchClear}
                            paymentMethodFilter={paymentMethodFilter}
                            handlePaymentMethodChange={handlePaymentMethodChange}
                            yearFilter={yearFilter}
                            handleYearChange={handleYearChange}
                            loading={loading}
                            availablePaymentMethods={availablePaymentMethods}
                            availableYears={availableYears}
                            printPayments={handlePrintPayments}
                            exportToCSV={handleExportCSV}
                            isExporting={isExporting}
                            hasActiveFilters={hasActiveFilters}
                            handleClearFilters={handleClearFilters}
                            onCopySummary={() => {
                                const summary = `Payments Summary:\n` +
                                    `Total: ${stats.total_payments}\n` +
                                    `Paid: ${formatCurrency(stats.total_paid)}\n` +
                                    `Balance: ${formatCurrency(stats.balance_due)}`;
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
                            getStatusCount={(status) => getStatusCount(stats, status, payments.data)}
                            tabsConfig={[
                                { id: 'all', label: 'All', icon: Receipt },
                                { id: 'paid', label: 'Paid', icon: CheckCircle2 },
                                { id: 'pending', label: 'Pending', icon: Clock },
                                { id: 'overdue', label: 'Overdue', icon: AlertCircle },
                                { id: 'cancelled', label: 'Cancelled', icon: XCircle },
                            ]}
                        />
                        
                        {/* Tab Content */}
                        <div className="mt-4">
                            {renderTabContent()}
                        </div>
                    </div>
                </div>
                
                {/* Mobile FAB */}
                {isMobile && (
                    <div className="fixed bottom-6 right-6 z-50 safe-bottom animate-scale-in">
                        <Link href="/portal/payments/create">
                            <Button 
                                size="lg" 
                                className="rounded-full h-14 w-14 shadow-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                            >
                                <Plus className="h-6 w-6" />
                            </Button>
                        </Link>
                    </div>
                )}
                
                {/* Mobile Filter Modal */}
                <ModernFilterModal
                    isOpen={showMobileFilters}
                    onClose={() => setShowMobileFilters(false)}
                    title="Filter Payments"
                    description={hasActiveFilters ? 'Filters are currently active' : 'No filters applied'}
                    search={search}
                    onSearchChange={setSearch}
                    onSearchSubmit={handleSearchSubmit}
                    onSearchClear={handleSearchClear}
                    loading={loading}
                    hasActiveFilters={hasActiveFilters}
                    onClearFilters={handleClearFilters}
                >
                    {/* Payment Method Filter */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Payment Method
                        </label>
                        <ModernSelect
                            value={paymentMethodFilter}
                            onValueChange={handlePaymentMethodChange}
                            placeholder="All payment methods"
                            options={availablePaymentMethods.map(method => ({
                                value: method.type,
                                label: method.display_name
                            }))}
                            disabled={loading}
                            icon={CreditCard}
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
                
                {/* Loading Overlay */}
                <ModernLoadingOverlay loading={loading} message="Loading payments..." />
            </ResidentLayout>
        </>
    );
}