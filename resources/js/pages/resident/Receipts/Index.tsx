// resources/js/pages/resident/Receipts/Index.tsx

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import ResidentAppLayout from '@/layouts/resident-app-layout';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// UI Components
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Icons
import {
  Receipt,
  Search,
  Calendar,
  Download,
  Eye,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  FileText,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  Printer,
  Copy,
  MoreVertical,
  Grid,
  List,
  Square,
  BarChart,
  Loader2,
  DollarSign,
  User,
  Home,
  Mail,
  Phone,
  ArrowUpDown,
  Info,
  Check,
  XCircle,
  Receipt as ReceiptIcon,
} from 'lucide-react';

// Reusable Components
import { ReceiptTabs } from '@/components/residentui/ReceiptTabs';
import { ModernSelect } from '@/components/residentui/modern-select';
import { ModernFilterModal } from '@/components/residentui/modern-filter-modal';
import { ModernStatsCards } from '@/components/residentui/modern-stats-cards';
import { ModernEmptyState } from '@/components/residentui/modern-empty-state';
import { ModernPagination } from '@/components/residentui/modern-pagination';
import { ModernLoadingOverlay } from '@/components/residentui/modern-loading-overlay';
import { ModernSelectionBanner } from '@/components/residentui/modern-selection-banner';
import { ModernReceiptCard } from '@/components/residentui/receipts/modern-receipt-card';
import { ModernReceiptGridCard } from '@/components/residentui/receipts/modern-receipt-grid-card';
import { ModernReceiptTable } from '@/components/residentui/receipts/modern-receipt-table';
import { ModernReceiptFilters } from '@/components/residentui/receipts/modern-receipt-filters';

// Types and Constants
interface ReceiptItem {
    id: number;
    receipt_number: string;
    or_number: string | null;
    receipt_type: string;
    receipt_type_label: string;
    payer_name: string;
    formatted_total: string;
    formatted_amount_paid: string;
    payment_method: string;
    payment_method_label: string;
    formatted_payment_date: string;
    formatted_issued_date: string;
    issued_by: string;
    status: string;
    status_badge: string;
    items_count: number;
    has_discount: boolean;
    reference_number?: string;
    clearance_id?: number;
    fee_id?: number;
    notes?: string;
    created_at: string;
    updated_at: string;
}

interface HouseholdData {
    id: number;
    household_number: string;
    head_name: string;
    address: string;
    contact_number: string | null;
    email: string | null;
    member_count: number;
    has_user_account: boolean;
}

interface StatsData {
    total_count: number;
    total_amount: string;
    total_amount_raw: number;
    this_month_count: number;
    this_month_amount: string;
    this_month_amount_raw: number;
    latest_receipt: string | null;
    clearance_count: number;
    fee_count: number;
    official_count: number;
    paid_count: number;
    pending_count: number;
    partial_count: number;
    cancelled_count?: number;
}

interface Props {
    receipts: {
        data: ReceiptItem[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    household: HouseholdData;
    filters: {
        search?: string;
        date_from?: string;
        date_to?: string;
        receipt_type?: string;
        status?: string;
        payment_method?: string;
        page?: string;
        sort?: string;
    };
    stats: StatsData;
    receiptTypes: Array<{ value: string; label: string }>;
    paymentMethods: Array<{ value: string; label: string }>;
    availableYears?: number[];
    error?: string;
}

// Constants
const RECEIPT_TABS = [
    { value: 'all', label: 'All Receipts', icon: Receipt },
    { value: 'paid', label: 'Paid', icon: CheckCircle, color: 'text-green-500' },
    { value: 'partial', label: 'Partial', icon: Clock, color: 'text-yellow-500' },
    { value: 'pending', label: 'Pending', icon: AlertCircle, color: 'text-orange-500' },
    { value: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'text-red-500' },
];

// Format currency helper
const formatCurrency = (amount: string | number): string => {
    if (typeof amount === 'string') {
        return amount;
    }
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
    }).format(amount);
};

// Format date helper
const formatDate = (date: string | null, short: boolean = false): string => {
    if (!date) return '—';
    try {
        const dateObj = new Date(date);
        if (short) {
            return format(dateObj, 'MMM d, yyyy');
        }
        return format(dateObj, 'MMMM d, yyyy');
    } catch {
        return date;
    }
};

// Get status count helper
const getStatusCount = (stats: StatsData, status: string): number => {
    switch (status) {
        case 'all': return stats.total_count || 0;
        case 'paid': return stats.paid_count || 0;
        case 'partial': return stats.partial_count || 0;
        case 'pending': return stats.pending_count || 0;
        case 'cancelled': return stats.cancelled_count || 0;
        default: return 0;
    }
};

// Get receipt stats cards
const getReceiptStatsCards = (stats: StatsData, formatCurrency: (amount: string | number) => string) => {
    const totalItems = (stats.clearance_count || 0) + (stats.fee_count || 0) + (stats.official_count || 0);
    
    return [
        {
            title: 'Total Receipts',
            value: (stats.total_count || 0).toString(),
            icon: Receipt,
            iconColor: 'text-blue-500',
            iconBgColor: 'bg-blue-100 dark:bg-blue-900/20',
            trend: { 
                value: `${totalItems} total items`, 
                positive: true 
            },
            footer: `Total Amount: ${formatCurrency(stats.total_amount_raw || 0)}`,
        },
        {
            title: 'This Month',
            value: (stats.this_month_count || 0).toString(),
            icon: Calendar,
            iconColor: 'text-green-500',
            iconBgColor: 'bg-green-100 dark:bg-green-900/20',
            trend: { 
                value: `${stats.this_month_count || 0} receipts`, 
                positive: true 
            },
            footer: `Amount: ${formatCurrency(stats.this_month_amount_raw || 0)}`,
        },
        {
            title: 'Clearance Fees',
            value: (stats.clearance_count || 0).toString(),
            icon: FileText,
            iconColor: 'text-purple-500',
            iconBgColor: 'bg-purple-100 dark:bg-purple-900/20',
            trend: { 
                value: `${stats.clearance_count || 0} receipts`, 
                positive: true 
            },
            footer: 'Paid clearance receipts',
        },
        {
            title: 'Other Fees',
            value: (stats.fee_count || 0).toString(),
            icon: CreditCard,
            iconColor: 'text-orange-500',
            iconBgColor: 'bg-orange-100 dark:bg-orange-900/20',
            trend: { 
                value: `${stats.fee_count || 0} receipts`, 
                positive: true 
            },
            footer: 'Barangay fees & charges',
        },
    ];
};

export default function Index() {
    const page = usePage<Props>();
    const pageProps = page.props;
    
    // Safely extract filters with fallback
    const filters = pageProps.filters || {};
    
    const receipts = pageProps.receipts || {
        data: [],
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
        from: 0,
        to: 0,
        links: [],
    };
    
    const household = pageProps.household || {
        id: 0,
        household_number: '',
        head_name: '',
        address: '',
        contact_number: null,
        email: null,
        member_count: 0,
        has_user_account: false,
    };
    
    const stats = pageProps.stats || {
        total_count: 0,
        total_amount: '₱0.00',
        total_amount_raw: 0,
        this_month_count: 0,
        this_month_amount: '₱0.00',
        this_month_amount_raw: 0,
        latest_receipt: null,
        clearance_count: 0,
        fee_count: 0,
        official_count: 0,
        paid_count: 0,
        pending_count: 0,
        partial_count: 0,
        cancelled_count: 0,
    };
    
    // Safely extract filter values with fallbacks
    const receiptTypes = pageProps.receiptTypes || [];
    const paymentMethods = pageProps.paymentMethods || [];
    const availableYears = pageProps.availableYears || [];
    
    // State - using function initializers to avoid any side effects
    const [search, setSearch] = useState(() => 
        filters && typeof filters.search === 'string' ? filters.search : ''
    );
    
    const [dateFrom, setDateFrom] = useState(() => 
        filters && typeof filters.date_from === 'string' ? filters.date_from : ''
    );
    
    const [dateTo, setDateTo] = useState(() => 
        filters && typeof filters.date_to === 'string' ? filters.date_to : ''
    );
    
    const [selectedType, setSelectedType] = useState(() => {
        if (filters && filters.receipt_type && filters.receipt_type !== 'all') {
            return filters.receipt_type;
        }
        return 'all';
    });
    
    const [statusFilter, setStatusFilter] = useState(() => {
        if (filters && filters.status && filters.status !== 'all') {
            return filters.status;
        }
        return 'all';
    });
    
    const [paymentMethodFilter, setPaymentMethodFilter] = useState(() => {
        if (filters && filters.payment_method && filters.payment_method !== 'all') {
            return filters.payment_method;
        }
        return 'all';
    });
    
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [showStats, setShowStats] = useState(true);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [selectedReceipts, setSelectedReceipts] = useState<number[]>([]);
    const [selectMode, setSelectMode] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isExporting, setIsExporting] = useState(false);
    
    // CRITICAL FIX: Use a more distinct name to avoid any conflict with native sort
    const [sortOption, setSortOption] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>(() => {
        if (filters && filters.sort) {
            const validSort = ['date_desc', 'date_asc', 'amount_desc', 'amount_asc'];
            return validSort.includes(filters.sort) ? filters.sort as any : 'date_desc';
        }
        return 'date_desc';
    });
    
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
            setDateFrom(filters.date_from || '');
            setDateTo(filters.date_to || '');
            setSelectedType(filters.receipt_type || 'all');
            setStatusFilter(filters.status || 'all');
            setPaymentMethodFilter(filters.payment_method || 'all');
            if (filters.sort) {
                const validSort = ['date_desc', 'date_asc', 'amount_desc', 'amount_asc'];
                if (validSort.includes(filters.sort)) {
                    setSortOption(filters.sort as any);
                }
            }
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
            search,
            date_from: dateFrom,
            date_to: dateTo,
            receipt_type: selectedType === 'all' ? '' : selectedType,
            status: statusFilter === 'all' ? '' : statusFilter,
            payment_method: paymentMethodFilter === 'all' ? '' : paymentMethodFilter,
            sort: sortOption,
            ...newFilters,
        };
        
        const cleanFilters: Record<string, string> = {};
        
        Object.entries(updatedFilters).forEach(([key, value]) => {
            if (key === 'page' && value === '1') return;
            if (value && value !== '' && value !== 'all' && value !== undefined) {
                cleanFilters[key] = value;
            }
        });
        
        router.get('/portal/receipts', cleanFilters, {
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
    
    const handleClearFilters = () => {
        setSearch('');
        setDateFrom('');
        setDateTo('');
        setSelectedType('all');
        setStatusFilter('all');
        setPaymentMethodFilter('all');
        setSortOption('date_desc');
        
        router.get('/portal/receipts', {}, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setLoading(false),
        });
        
        if (isMobile) setShowMobileFilters(false);
    };
    
    const handleApplyFilters = () => {
        updateFilters({ page: '1' });
        if (isMobile) setShowMobileFilters(false);
    };
    
    const handleSortChange = (sort: 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc') => {
        setSortOption(sort);
        updateFilters({ sort, page: '1' });
    };
    
    // Selection mode functions
    const toggleSelectReceipt = (id: number) => {
        setSelectedReceipts(prev =>
            prev.includes(id)
                ? prev.filter(receiptId => receiptId !== id)
                : [...prev, id]
        );
    };
    
    const selectAllReceipts = () => {
        const currentReceipts = receipts.data;
        if (selectedReceipts.length === currentReceipts.length && currentReceipts.length > 0) {
            setSelectedReceipts([]);
        } else {
            setSelectedReceipts(currentReceipts.map(r => r.id));
        }
    };
    
    const toggleSelectMode = () => {
        if (selectMode) {
            setSelectMode(false);
            setSelectedReceipts([]);
        } else {
            setSelectMode(true);
        }
    };
    
    const handleViewReceipt = (id: number) => {
        router.get(`/portal/receipts/${id}`);
    };
    
    const handleDownloadReceipt = (id: number) => {
        window.open(`/portal/receipts/${id}/download`, '_blank');
    };
    
    const handlePrintReceipt = (id: number) => {
        const printWindow = window.open(`/portal/receipts/${id}/print`, '_blank');
        if (printWindow) {
            printWindow.focus();
        }
    };
    
    const handleCopyReceiptNumber = (receiptNumber: string) => {
        navigator.clipboard.writeText(receiptNumber);
        toast.success('Receipt number copied to clipboard');
    };
    
    const handleCopyORNNumber = (orNumber: string | null) => {
        if (orNumber) {
            navigator.clipboard.writeText(orNumber);
            toast.success('OR number copied to clipboard');
        }
    };
    
    const handleDeleteSelected = () => {
        toast.error('Delete functionality is not available for receipts');
    };
    
    const handleExportToCSV = async () => {
        setIsExporting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const headers = ['Receipt #', 'OR #', 'Type', 'Date', 'Amount', 'Method', 'Status', 'Payer'];
            const rows = receipts.data.map(r => [
                r.receipt_number,
                r.or_number || '',
                r.receipt_type_label,
                r.formatted_payment_date,
                r.formatted_total,
                r.payment_method_label || r.payment_method,
                r.status,
                r.payer_name
            ]);
            
            const csvContent = [headers, ...rows]
                .map(row => row.join(','))
                .join('\n');
            
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `receipts-${format(new Date(), 'yyyy-MM-dd')}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
            
            toast.success('Receipts exported successfully');
        } catch (error) {
            toast.error('Failed to export receipts');
        } finally {
            setIsExporting(false);
        }
    };
    
    const handlePrintList = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            const content = `
                <html>
                    <head>
                        <title>Receipts List - ${household.head_name}</title>
                        <style>
                            body { font-family: Arial, sans-serif; padding: 20px; }
                            h1 { color: #333; }
                            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                            th { background: #f3f4f6; padding: 10px; text-align: left; }
                            td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
                            .text-right { text-align: right; }
                            .badge { padding: 4px 8px; border-radius: 9999px; font-size: 12px; }
                            .badge-paid { background: #d1fae5; color: #065f46; }
                            .badge-partial { background: #fef3c7; color: #92400e; }
                            .badge-pending { background: #ffedd5; color: #9a3412; }
                            .badge-cancelled { background: #fee2e2; color: #991b1b; }
                        </style>
                    </head>
                    <body>
                        <h1>Receipts List - ${household.head_name}</h1>
                        <p>Household: ${household.household_number}</p>
                        <p>Address: ${household.address}</p>
                        <p>Generated: ${format(new Date(), 'MMMM d, yyyy h:mm a')}</p>
                        
                        <table>
                            <thead>
                                <tr>
                                    <th>Receipt #</th>
                                    <th>Type</th>
                                    <th>Date</th>
                                    <th class="text-right">Amount</th>
                                    <th>Method</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${receipts.data.map(r => `
                                    <tr>
                                        <td>${r.receipt_number}</td>
                                        <td>${r.receipt_type_label}</td>
                                        <td>${r.formatted_payment_date}</td>
                                        <td class="text-right">${r.formatted_total}</td>
                                        <td>${r.payment_method_label || r.payment_method}</td>
                                        <td><span class="badge badge-${r.status}">${r.status}</span></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        
                        <p style="margin-top: 20px;">Total Receipts: ${receipts.data.length}</p>
                        <p>Total Amount: ${stats.total_amount}</p>
                    </body>
                </html>
            `;
            printWindow.document.write(content);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
        }
    };
    
    const handleEmailSummary = () => {
        const subject = `My Receipts Summary - ${format(new Date(), 'MMMM d, yyyy')}`;
        const body = `
Hello,

Here's a summary of my receipts from the Barangay Management System:

Household: ${household.household_number}
Head of Family: ${household.head_name}

Total Receipts: ${stats.total_count}
Total Amount: ${stats.total_amount}

This Month: ${stats.this_month_count} receipts (${stats.this_month_amount})

Breakdown by Type:
- Clearance Fees: ${stats.clearance_count}
- Other Fees: ${stats.fee_count}
- Official Receipts: ${stats.official_count}

Recent Receipts:
${receipts.data.slice(0, 5).map(r => `- ${r.receipt_number} (${r.receipt_type_label}): ${r.formatted_total}`).join('\n')}

View all receipts: ${window.location.origin}/portal/receipts

Thank you,
${household.head_name}
        `.trim();
        
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };
    
    const handlePageChange = (page: number) => {
        updateFilters({ page: page.toString() });
    };
    
    const hasActiveFilters = useMemo(() => {
        return !!(search || dateFrom || dateTo || 
            (selectedType && selectedType !== 'all') || 
            (statusFilter && statusFilter !== 'all') || 
            (paymentMethodFilter && paymentMethodFilter !== 'all') ||
            (sortOption && sortOption !== 'date_desc'));
    }, [search, dateFrom, dateTo, selectedType, statusFilter, paymentMethodFilter, sortOption]);
    
    const getCurrentReceipts = () => {
        return receipts.data;
    };
    
    const renderTabContent = () => {
        const currentReceipts = getCurrentReceipts();
        const tabHasData = currentReceipts.length > 0;
        
        const displayStatus = statusFilter && statusFilter !== 'all' 
            ? statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)
            : 'All';
        
        return (
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
                <CardContent className="p-4 md:p-6">
                    <ModernSelectionBanner
                        selectMode={selectMode}
                        selectedCount={selectedReceipts.length}
                        totalCount={currentReceipts.length}
                        onSelectAll={selectAllReceipts}
                        onDeselectAll={() => setSelectedReceipts([])}
                        onCancel={() => {
                            setSelectMode(false);
                            setSelectedReceipts([]);
                        }}
                        onDelete={handleDeleteSelected}
                        deleteLabel="Delete Selected"
                        deleteDisabled={true}
                    />
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {displayStatus} Receipts
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {tabHasData 
                                    ? `Showing ${currentReceipts.length} receipt${currentReceipts.length !== 1 ? 's' : ''}`
                                    : `No ${displayStatus.toLowerCase()} receipts found`
                                }
                                {selectMode && selectedReceipts.length > 0 && ` • ${selectedReceipts.length} selected`}
                                {hasActiveFilters && ' (filtered)'}
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            {/* Sort Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="gap-2 rounded-xl">
                                        <ArrowUpDown className="h-4 w-4" />
                                        Sort
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem onClick={() => handleSortChange('date_desc')}>
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Newest First
                                        {sortOption === 'date_desc' && <Check className="h-4 w-4 ml-auto" />}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleSortChange('date_asc')}>
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Oldest First
                                        {sortOption === 'date_asc' && <Check className="h-4 w-4 ml-auto" />}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleSortChange('amount_desc')}>
                                        <DollarSign className="h-4 w-4 mr-2" />
                                        Amount (High to Low)
                                        {sortOption === 'amount_desc' && <Check className="h-4 w-4 ml-auto" />}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleSortChange('amount_asc')}>
                                        <DollarSign className="h-4 w-4 mr-2" />
                                        Amount (Low to High)
                                        {sortOption === 'amount_asc' && <Check className="h-4 w-4 ml-auto" />}
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
                                    className="gap-2 rounded-xl"
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
                            icon={statusFilter === 'paid' ? CheckCircle : 
                                  statusFilter === 'partial' ? Clock :
                                  statusFilter === 'pending' ? AlertCircle :
                                  statusFilter === 'cancelled' ? XCircle : Receipt}
                        />
                    ) : (
                        <>
                            {viewMode === 'grid' && (
                                <>
                                    {isMobile && (
                                        <div className="pb-4">
                                            {currentReceipts.map((receipt) => (
                                                <ModernReceiptCard
                                                    key={receipt.id}
                                                    receipt={receipt}
                                                    selectMode={selectMode}
                                                    selectedReceipts={selectedReceipts}
                                                    toggleSelectReceipt={toggleSelectReceipt}
                                                    formatDate={(date) => formatDate(date, isMobile)}
                                                    formatCurrency={formatCurrency}
                                                    onView={handleViewReceipt}
                                                    onDownload={handleDownloadReceipt}
                                                    onPrint={handlePrintReceipt}
                                                    onCopyReceiptNumber={handleCopyReceiptNumber}
                                                    onCopyORNNumber={handleCopyORNNumber}
                                                    isMobile={isMobile}
                                                />
                                            ))}
                                        </div>
                                    )}
                                    
                                    {!isMobile && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {currentReceipts.map((receipt) => (
                                                <ModernReceiptGridCard
                                                    key={receipt.id}
                                                    receipt={receipt}
                                                    selectMode={selectMode}
                                                    selectedReceipts={selectedReceipts}
                                                    toggleSelectReceipt={toggleSelectReceipt}
                                                    formatDate={(date) => formatDate(date, isMobile)}
                                                    formatCurrency={formatCurrency}
                                                    onView={handleViewReceipt}
                                                    onDownload={handleDownloadReceipt}
                                                    onPrint={handlePrintReceipt}
                                                    onCopyReceiptNumber={handleCopyReceiptNumber}
                                                    onCopyORNNumber={handleCopyORNNumber}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                            
                            {viewMode === 'list' && (
                                <ModernReceiptTable
                                    receipts={currentReceipts}
                                    selectMode={selectMode}
                                    selectedReceipts={selectedReceipts}
                                    toggleSelectReceipt={toggleSelectReceipt}
                                    selectAllReceipts={selectAllReceipts}
                                    formatDate={(date) => formatDate(date, isMobile)}
                                    formatCurrency={formatCurrency}
                                    onView={handleViewReceipt}
                                    onDownload={handleDownloadReceipt}
                                    onPrint={handlePrintReceipt}
                                    onCopyReceiptNumber={handleCopyReceiptNumber}
                                    onCopyORNNumber={handleCopyORNNumber}
                                />
                            )}
                            
                            {receipts.last_page > 1 && (
                                <div className="mt-6">
                                    <ModernPagination
                                        currentPage={receipts.current_page}
                                        lastPage={receipts.last_page}
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
    
    // Collapsible stats for mobile
    const CollapsibleStats = () => (
        <div className="md:hidden">
            <Button 
                variant="outline" 
                className="w-full justify-between bg-white dark:bg-gray-900 rounded-xl border-gray-200 dark:border-gray-700"
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
                        cards={getReceiptStatsCards(stats, formatCurrency)} 
                        loading={false}
                        gridCols="grid-cols-2"
                    />
                </div>
            )}
        </div>
    );
    
    // Desktop Stats
    const DesktopStats = () => (
        <div className="hidden md:block">
            <ModernStatsCards 
                cards={getReceiptStatsCards(stats, formatCurrency)} 
                loading={false}
            />
        </div>
    );
    
    if (pageProps.error) {
        return (
            <ResidentAppLayout>
                <Head title="My Receipts" />
                <div className="min-h-[50vh] flex items-center justify-center px-4">
                    <Card className="w-full max-w-md border-0 shadow-xl">
                        <CardContent className="pt-6 text-center">
                            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-2xl flex items-center justify-center mb-4">
                                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Error</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                {pageProps.error}
                            </p>
                            <Button 
                                onClick={() => window.location.href = '/portal/dashboard'}
                                className="bg-gradient-to-r from-blue-500 to-blue-600"
                            >
                                Go to Dashboard
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </ResidentAppLayout>
        );
    }
    
    return (
        <>
            <Head title="My Receipts" />
            
            <ResidentAppLayout>
                <div className="space-y-4 md:space-y-6 pb-20 md:pb-6">
                    {/* Mobile Header */}
                    {isMobile && (
                        <div className="flex items-center justify-between sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl z-10 py-3 px-4 -mx-4">
                            <div>
                                <h1 className="text-xl font-bold">My Receipts</h1>
                                <p className="text-xs text-gray-500">
                                    {stats.total_count} receipt{stats.total_count !== 1 ? 's' : ''} total
                                    <span className="block text-xs">
                                        {household.household_number}
                                    </span>
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
                                    My Receipts
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    View and download your payment receipts
                                    <span className="block text-xs mt-1">
                                        Household: {household.household_number} • {household.head_name}
                                    </span>
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePrintList}
                                    className="gap-2 rounded-xl"
                                >
                                    <Printer className="h-4 w-4" />
                                    Print
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleExportToCSV}
                                    disabled={isExporting}
                                    className="gap-2 rounded-xl"
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
                            <CollapsibleStats />
                            <DesktopStats />
                        </div>
                    )}
                    
                    {/* Household Info Card */}
                    {!isMobile && (
                        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
                            <CardContent className="p-4 md:p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                                            <Home className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {household.head_name}
                                            </h2>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {household.household_number} • {household.address}
                                            </p>
                                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <Phone className="h-3 w-3" />
                                                    {household.contact_number || 'No contact'}
                                                </span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <User className="h-3 w-3" />
                                                    {household.member_count} members
                                                </span>
                                                {household.email && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="flex items-center gap-1">
                                                            <Mail className="h-3 w-3" />
                                                            {household.email}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleEmailSummary}
                                            className="gap-2 rounded-xl"
                                        >
                                            <Mail className="h-4 w-4" />
                                            Email Summary
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    
                    {/* Mobile Filter Modal */}
                    <ModernFilterModal
                        isOpen={showMobileFilters}
                        onClose={() => setShowMobileFilters(false)}
                        title="Filter Receipts"
                        description={hasActiveFilters ? 'Filters are currently active' : 'No filters applied'}
                        search={search}
                        onSearchChange={setSearch}
                        onSearchSubmit={handleSearchSubmit}
                        onSearchClear={handleSearchClear}
                        loading={loading}
                        hasActiveFilters={hasActiveFilters}
                        onClearFilters={handleClearFilters}
                        onApplyFilters={handleApplyFilters}
                    >
                        {/* Date Range */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Date From
                                </label>
                                <Input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="w-full rounded-xl"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Date To
                                </label>
                                <Input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="w-full rounded-xl"
                                />
                            </div>
                        </div>

                        {/* Receipt Type Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Receipt Type
                            </label>
                            <ModernSelect
                                value={selectedType}
                                onValueChange={setSelectedType}
                                placeholder="All types"
                                options={[
                                    { value: 'all', label: 'All Types' },
                                    ...receiptTypes.map(type => ({
                                        value: type.value,
                                        label: type.label
                                    }))
                                ]}
                                disabled={loading}
                                icon={Receipt}
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Status
                            </label>
                            <ModernSelect
                                value={statusFilter}
                                onValueChange={setStatusFilter}
                                placeholder="All status"
                                options={[
                                    { value: 'all', label: 'All Status' },
                                    { value: 'paid', label: 'Paid' },
                                    { value: 'partial', label: 'Partial' },
                                    { value: 'pending', label: 'Pending' },
                                    { value: 'cancelled', label: 'Cancelled' },
                                ]}
                                disabled={loading}
                                icon={Info}
                            />
                        </div>

                        {/* Payment Method Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Payment Method
                            </label>
                            <ModernSelect
                                value={paymentMethodFilter}
                                onValueChange={setPaymentMethodFilter}
                                placeholder="All methods"
                                options={[
                                    { value: 'all', label: 'All Methods' },
                                    ...paymentMethods.map(method => ({
                                        value: method.value,
                                        label: method.label
                                    }))
                                ]}
                                disabled={loading}
                                icon={CreditCard}
                            />
                        </div>
                    </ModernFilterModal>
                    
                    {/* Desktop Filters */}
                    {!isMobile && (
                        <ModernReceiptFilters
                            search={search}
                            setSearch={setSearch}
                            handleSearchSubmit={handleSearchSubmit}
                            handleSearchClear={handleSearchClear}
                            dateFrom={dateFrom}
                            setDateFrom={setDateFrom}
                            dateTo={dateTo}
                            setDateTo={setDateTo}
                            selectedType={selectedType}
                            setSelectedType={setSelectedType}
                            statusFilter={statusFilter}
                            setStatusFilter={setStatusFilter}
                            paymentMethodFilter={paymentMethodFilter}
                            setPaymentMethodFilter={setPaymentMethodFilter}
                            loading={loading}
                            receiptTypes={receiptTypes}
                            paymentMethods={paymentMethods}
                            hasActiveFilters={hasActiveFilters}
                            handleClearFilters={handleClearFilters}
                            handleApplyFilters={handleApplyFilters}
                            onPrint={handlePrintList}
                            onExport={handleExportToCSV}
                            isExporting={isExporting}
                            onEmailSummary={handleEmailSummary}
                        />
                    )}
                    
                    {/* Receipt Tabs Section */}
                    <div className="mt-4">
                        <ReceiptTabs
                            statusFilter={statusFilter}
                            handleTabChange={handleTabChange}
                            getStatusCount={(status) => getStatusCount(stats, status)}
                            variant="status"
                            showCounts={true}
                            className="mb-4"
                        />
                        
                        {/* Tab Content */}
                        <div className="mt-4">
                            {renderTabContent()}
                        </div>
                    </div>
                </div>
                
                {/* Loading Overlay */}
                <ModernLoadingOverlay loading={loading} message="Loading receipts..." />
            </ResidentAppLayout>
        </>
    );
}