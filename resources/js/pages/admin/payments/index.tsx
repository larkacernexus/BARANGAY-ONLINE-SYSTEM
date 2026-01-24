import AppLayout from '@/layouts/admin-app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
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
    ChevronUp,
    MoreVertical,
    Trash2,
    Copy,
    FileCheck,
    ExternalLink,
    Layers,
    MousePointer,
    FilterX,
    Rows,
    RotateCcw,
    Hash,
    PackageCheck,
    PackageX,
    ClipboardCopy,
    KeyRound,
    X,
    Loader2,
    FileSpreadsheet,
    Mail,
    Square,
    CheckSquare,
    Grid3X3,
    List,
    ArrowUpDown,
    CheckCheck,
    Ban,
    FileEdit,
    Send,
    QrCode,
    ChevronLeft,
    ChevronRight,
    Phone,
    MoreHorizontal,
    Camera,
    Crown
} from 'lucide-react';
import { Link, usePage, router } from '@inertiajs/react';
import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { toast } from 'sonner';

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
        'payments.destroy': (id: number) => `/payments/${id}`,
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

// Helper function to truncate text
const truncateText = (text: string, maxLength: number = 30): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

// Helper function to truncate address
const truncateAddress = (address: string, maxLength: number = 40): string => {
    if (!address) return 'N/A';
    if (address.length <= maxLength) return address;
    return address.substring(0, maxLength) + '...';
};

// Helper function for contact number
const formatContactNumber = (contact: string): string => {
    if (!contact) return 'N/A';
    if (contact.length <= 12) return contact;
    return truncateText(contact, 12);
};

// Safe number conversion helper
const safeNumber = (value: any, defaultValue: number = 0): number => {
    if (value === null || value === undefined || value === '') return defaultValue;
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
};

// Get responsive truncation length
const getTruncationLength = (type: 'name' | 'address' | 'contact' | 'description' = 'name'): number => {
    if (typeof window === 'undefined') return 30;
    
    const width = window.innerWidth;
    if (width < 640) { // Mobile
        switch(type) {
            case 'name': return 15;
            case 'address': return 20;
            case 'contact': return 10;
            case 'description': return 15;
            default: return 15;
        }
    }
    if (width < 768) { // Tablet
        switch(type) {
            case 'name': return 20;
            case 'address': return 25;
            case 'contact': return 12;
            case 'description': return 20;
            default: return 20;
        }
    }
    if (width < 1024) { // Small desktop
        switch(type) {
            case 'name': return 25;
            case 'address': return 30;
            case 'contact': return 15;
            case 'description': return 25;
            default: return 25;
        }
    }
    // Large desktop
    switch(type) {
        case 'name': return 30;
        case 'address': return 35;
        case 'contact': return 15;
        case 'description': return 30;
        default: return 30;
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
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
    
    // Bulk selection states
    const [selectedPayments, setSelectedPayments] = useState<number[]>([]);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [isSelectAll, setIsSelectAll] = useState(false);
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
    const [showBulkStatusDialog, setShowBulkStatusDialog] = useState(false);
    const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false);
    const [bulkEditValue, setBulkEditValue] = useState<string>('');
    const [selectionMode, setSelectionMode] = useState<'page' | 'filtered' | 'all'>('page');
    const [showSelectionOptions, setShowSelectionOptions] = useState(false);
    
    const bulkActionRef = useRef<HTMLDivElement>(null);
    const selectionRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    
    // Payment method options
    const paymentMethods = [
        { value: 'cash', label: 'Cash', icon: 'dollar-sign' },
        { value: 'gcash', label: 'GCash', icon: 'credit-card' },
        { value: 'maya', label: 'Maya', icon: 'credit-card' },
        { value: 'bank', label: 'Bank Transfer', icon: 'file-text' },
        { value: 'check', label: 'Check', icon: 'receipt' },
        { value: 'online', label: 'Online Payment', icon: 'credit-card' },
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

    // Track window resize
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    // Optimized function to build query parameters
    const buildQueryParams = useCallback(() => {
        const params: Record<string, string | null> = {};
        
        if (search) params.search = search;
        if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
        if (methodFilter && methodFilter !== 'all') params.payment_method = methodFilter;
        if (payerTypeFilter && payerTypeFilter !== 'all') params.payer_type = payerTypeFilter;
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;
        
        return params;
    }, [search, statusFilter, methodFilter, payerTypeFilter, dateFrom, dateTo]);
    
    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (bulkActionRef.current && !bulkActionRef.current.contains(event.target as Node)) {
                setShowBulkActions(false);
            }
            if (selectionRef.current && !selectionRef.current.contains(event.target as Node)) {
                setShowSelectionOptions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl/Cmd + A to select all on current page
            if ((e.ctrlKey || e.metaKey) && e.key === 'a' && isBulkMode) {
                e.preventDefault();
                if (e.shiftKey) {
                    handleSelectAllFiltered();
                } else {
                    handleSelectAllOnPage();
                }
            }
            // Escape to exit bulk mode or clear selection
            if (e.key === 'Escape') {
                if (isBulkMode) {
                    if (selectedPayments.length > 0) {
                        setSelectedPayments([]);
                    } else {
                        setIsBulkMode(false);
                    }
                }
                if (showBulkActions) setShowBulkActions(false);
                if (showSelectionOptions) setShowSelectionOptions(false);
            }
            // Ctrl/Cmd + Shift + B to toggle bulk mode
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'B') {
                e.preventDefault();
                setIsBulkMode(!isBulkMode);
            }
            // Ctrl/Cmd + F to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            // Delete key to open delete dialog
            if (e.key === 'Delete' && isBulkMode && selectedPayments.length > 0) {
                e.preventDefault();
                setShowBulkDeleteDialog(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isBulkMode, selectedPayments, showBulkActions, showSelectionOptions]);
    
    // Reset selection when bulk mode is turned off or filters change
    useEffect(() => {
        if (!isBulkMode) {
            setSelectedPayments([]);
            setIsSelectAll(false);
        }
    }, [isBulkMode]);
    
    // Filter payments client-side
    const filteredPayments = useMemo(() => {
        let result = [...payments.data];
        
        // Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            result = result.filter(payment => 
                payment.or_number.toLowerCase().includes(searchLower) ||
                payment.payer_name.toLowerCase().includes(searchLower) ||
                (payment.reference_number && payment.reference_number.toLowerCase().includes(searchLower)) ||
                (payment.contact_number && payment.contact_number.includes(search))
            );
        }
        
        // Status filter
        if (statusFilter !== 'all') {
            result = result.filter(payment => payment.status === statusFilter);
        }
        
        // Method filter
        if (methodFilter !== 'all') {
            result = result.filter(payment => payment.payment_method === methodFilter);
        }
        
        // Payer type filter
        if (payerTypeFilter !== 'all') {
            result = result.filter(payment => payment.payer_type === payerTypeFilter);
        }
        
        // Date filter
        if (dateFrom) {
            const fromDate = new Date(dateFrom);
            result = result.filter(payment => new Date(payment.payment_date) >= fromDate);
        }
        
        if (dateTo) {
            const toDate = new Date(dateTo);
            toDate.setHours(23, 59, 59, 999); // Include entire day
            result = result.filter(payment => new Date(payment.payment_date) <= toDate);
        }
        
        return result;
    }, [payments.data, search, statusFilter, methodFilter, payerTypeFilter, dateFrom, dateTo]);
    
    // Handle select/deselect all on current page
    const handleSelectAllOnPage = () => {
        const pageIds = filteredPayments.map(payment => payment.id);
        if (isSelectAll) {
            setSelectedPayments(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedPayments, ...pageIds])];
            setSelectedPayments(newSelected);
        }
        setIsSelectAll(!isSelectAll);
        setSelectionMode('page');
    };
    
    // Handle select/deselect all filtered items (client-side filtered)
    const handleSelectAllFiltered = () => {
        const allIds = filteredPayments.map(payment => payment.id);
        if (selectedPayments.length === allIds.length && allIds.every(id => selectedPayments.includes(id))) {
            setSelectedPayments(prev => prev.filter(id => !allIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedPayments, ...allIds])];
            setSelectedPayments(newSelected);
            setSelectionMode('filtered');
        }
    };
    
    // Handle select all items (including not loaded)
    const handleSelectAll = () => {
        if (confirm(`This will select ALL ${payments.meta?.total} payments. This action may take a moment.`)) {
            const pageIds = filteredPayments.map(payment => payment.id);
            setSelectedPayments(pageIds);
            setSelectionMode('all');
            toast.info('Selected all items on current page. For full selection, implement server-side API.');
        }
    };
    
    // Handle individual item selection
    const handleItemSelect = (id: number) => {
        setSelectedPayments(prev => {
            if (prev.includes(id)) {
                return prev.filter(itemId => itemId !== id);
            } else {
                return [...prev, id];
            }
        });
    };
    
    // Check if all items on current page are selected
    useEffect(() => {
        const allPageIds = filteredPayments.map(payment => payment.id);
        const allSelected = allPageIds.every(id => selectedPayments.includes(id));
        setIsSelectAll(allSelected);
    }, [selectedPayments, filteredPayments]);
    
    // Get selected payments data
    const selectedPaymentsData = useMemo(() => {
        return filteredPayments.filter(payment => selectedPayments.includes(payment.id));
    }, [selectedPayments, filteredPayments]);
    
    // Calculate selection stats
    const selectionStats = useMemo(() => {
        const selectedData = selectedPaymentsData;
        
        const totalAmount = selectedData.reduce((sum, p) => sum + (p.total_amount || 0), 0);
        const avgAmount = selectedData.length > 0 ? totalAmount / selectedData.length : 0;
        
        return {
            total: selectedData.length,
            completed: selectedData.filter(p => p.status === 'completed').length,
            pending: selectedData.filter(p => p.status === 'pending').length,
            cancelled: selectedData.filter(p => p.status === 'cancelled').length,
            totalAmount: totalAmount,
            avgAmount: avgAmount,
            cashPayments: selectedData.filter(p => p.payment_method === 'cash').length,
            digitalPayments: selectedData.filter(p => ['gcash', 'maya', 'online'].includes(p.payment_method)).length,
            residents: selectedData.filter(p => p.payer_type === 'resident').length,
            households: selectedData.filter(p => p.payer_type === 'household').length,
        };
    }, [selectedPaymentsData]);
    
    // Enhanced bulk operation handler
    const handleBulkOperation = async (operation: 'export' | 'print' | 'delete' | 'update_status' | 'send_receipt' | 'mark_cleared' | 'export_csv', customData?: any) => {
        if (selectedPayments.length === 0) {
            toast.error('Please select at least one payment');
            return;
        }

        setIsPerformingBulkAction(true);

        try {
            switch (operation) {
                case 'export':
                case 'export_csv':
                    // Export to CSV
                    const exportData = selectedPaymentsData.map(payment => ({
                        'OR Number': payment.or_number,
                        'Payer Name': payment.payer_name,
                        'Payer Type': payment.payer_type,
                        'Payment Date': formatDate(payment.payment_date),
                        'Payment Method': payment.payment_method,
                        'Reference Number': payment.reference_number || '',
                        'Subtotal': payment.subtotal,
                        'Surcharge': payment.surcharge,
                        'Penalty': payment.penalty,
                        'Discount': payment.discount,
                        'Total Amount': payment.total_amount,
                        'Status': payment.status,
                        'Remarks': payment.remarks || '',
                        'Recorded By': payment.recorder?.name || '',
                        'Created At': formatDate(payment.created_at),
                    }));
                    
                    // Convert to CSV
                    const headers = Object.keys(exportData[0]);
                    const csv = [
                        headers.join(','),
                        ...exportData.map(row => 
                            headers.map(header => {
                                const value = row[header as keyof typeof row];
                                return typeof value === 'string' && value.includes(',') 
                                    ? `"${value}"` 
                                    : value;
                            }).join(',')
                        )
                    ].join('\n');
                    
                    // Create and download file
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `payments-export-${new Date().toISOString().split('T')[0]}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                    
                    toast.success('Export completed successfully');
                    break;

                case 'print':
                    // Open print preview for each selected payment
                    selectedPayments.forEach(id => {
                        window.open(getRoute('payments.receipt', id), '_blank');
                    });
                    toast.success(`${selectedPayments.length} payment(s) opened for printing`);
                    break;

                case 'delete':
                    if (confirm(`Are you sure you want to delete ${selectedPayments.length} selected payment(s)? This action cannot be undone.`)) {
                        // Simulate API call
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        toast.success(`${selectedPayments.length} payment(s) deleted successfully`);
                        setSelectedPayments([]);
                        setShowBulkDeleteDialog(false);
                    }
                    break;

                case 'update_status':
                    if (!bulkEditValue) {
                        toast.error('Please select a status');
                        return;
                    }
                    
                    // Simulate API call
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    toast.success(`${selectedPayments.length} payment(s) status updated to ${bulkEditValue}`);
                    setShowBulkStatusDialog(false);
                    setBulkEditValue('');
                    setSelectedPayments([]);
                    break;

                case 'send_receipt':
                    // Open email composition for each selected payment
                    selectedPayments.forEach(id => {
                        window.open(`mailto:?subject=Payment Receipt OR#${id}&body=Please find attached your payment receipt.`, '_blank');
                    });
                    toast.info(`Opening email for ${selectedPayments.length} payment receipt(s)`);
                    break;

                case 'mark_cleared':
                    // Simulate marking as cleared
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    toast.success(`${selectedPayments.length} payment(s) marked as cleared`);
                    break;

                default:
                    toast.error('Operation not supported');
            }
        } catch (error) {
            console.error('Bulk operation error:', error);
            toast.error('An error occurred during bulk operation');
        } finally {
            setIsPerformingBulkAction(false);
        }
    };
    
    // Copy selected data to clipboard
    const handleCopySelectedData = () => {
        if (selectedPaymentsData.length === 0) {
            toast.error('No data to copy');
            return;
        }
        
        const data = selectedPaymentsData.map(payment => ({
            'OR Number': payment.or_number,
            'Payer': payment.payer_name,
            'Amount': formatCurrency(payment.total_amount),
            'Date': formatDate(payment.payment_date),
            'Method': payment.payment_method,
            'Status': payment.status,
        }));
        
        const csv = [
            Object.keys(data[0]).join(','),
            ...data.map(row => Object.values(row).join(','))
        ].join('\n');
        
        navigator.clipboard.writeText(csv).then(() => {
            toast.success('Selected data copied to clipboard as CSV');
        }).catch(() => {
            toast.error('Failed to copy to clipboard');
        });
    };
    
    // Smart bulk action based on selection
    const handleSmartBulkAction = () => {
        if (selectionStats.pending > 0) {
            toast.info('Selected payments include pending transactions. Consider updating status.');
        } else if (selectionStats.cancelled > 0) {
            toast.info('Selected payments include cancelled transactions. Consider filtering them out.');
        } else {
            handleBulkOperation('export');
        }
    };
    
    // Optimized debounced search with proper parameter handling
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(true);
            
            const params = buildQueryParams();
            
            // Only make request if there are actual filters (not just empty strings)
            const shouldMakeRequest = Object.keys(params).length > 0;
            
            if (shouldMakeRequest) {
                router.get(getRoute('payments.index'), params, {
                    preserveState: true,
                    replace: true,
                    preserveScroll: true,
                    onFinish: () => setIsLoading(false)
                });
            } else {
                // If no filters, just reload without parameters
                router.get(getRoute('payments.index'), {}, {
                    preserveState: true,
                    replace: true,
                    preserveScroll: true,
                    onFinish: () => setIsLoading(false)
                });
            }
        }, 500);
        
        return () => clearTimeout(timer);
    }, [search, statusFilter, methodFilter, payerTypeFilter, dateFrom, dateTo, buildQueryParams]);
    
    const handleExport = () => {
        const params = buildQueryParams();
        router.get(getRoute('payments.export'), params);
    };
    
    const handleClearFilters = () => {
        setSearch('');
        setStatusFilter('all');
        setMethodFilter('all');
        setPayerTypeFilter('all');
        setDateFrom('');
        setDateTo('');
        setShowAdvancedFilters(false);
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
    
    const handleDeletePayment = (payment: Payment) => {
        if (confirm(`Are you sure you want to delete payment OR#${payment.or_number}? This action cannot be undone.`)) {
            router.delete(getRoute('payments.destroy', payment.id), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Payment deleted successfully');
                },
                onError: (errors) => {
                    toast.error('Failed to delete payment. Please try again.');
                }
            });
        }
    };

    // Handle copy to clipboard
    const handleCopyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success(`${label} copied to clipboard`);
        }).catch(() => {
            toast.error('Failed to copy to clipboard');
        });
    };

    // Calculate stats cards
    const statCards: Stat[] = [
        {
            label: 'Total Payments',
            value: safeNumber(stats?.total).toLocaleString(),
            icon: 'dollar-sign',
            color: 'text-blue-600 bg-blue-50',
            trend: 'up'
        },
        {
            label: "Today's Payments",
            value: safeNumber(stats?.today).toLocaleString(),
            icon: 'calendar',
            color: 'text-green-600 bg-green-50',
            change: formatCurrency(stats?.today_amount || 0)
        },
        {
            label: 'Monthly Payments',
            value: safeNumber(stats?.monthly).toLocaleString(),
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

    const hasActiveFilters = 
        search || 
        statusFilter !== 'all' || 
        methodFilter !== 'all' || 
        payerTypeFilter !== 'all' ||
        dateFrom ||
        dateTo;

    // Function to get payer details text for selection
    const getPayerDetailsText = (payment: Payment): string => {
        let details = payment.payer_name;
        if (payment.contact_number) details += ` | ${payment.contact_number}`;
        if (payment.address) details += ` | ${payment.address}`;
        if (payment.household_number) details += ` | House #${payment.household_number}`;
        if (payment.purok) details += ` | Purok ${payment.purok}`;
        return details;
    };

    return (
        <AppLayout
            title="Payment Management"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Payments', href: getRoute('payments.index') }
            ]}
        >
            <TooltipProvider>
                <div className="space-y-6">
                    {/* Header - Enhanced with responsive design */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Payment Management</h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                                Manage and track all payment transactions
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsBulkMode(!isBulkMode)}
                                        className={`h-9 ${isBulkMode ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}`}
                                    >
                                        {isBulkMode ? (
                                            <>
                                                <Layers className="h-4 w-4 mr-2" />
                                                <span className="hidden sm:inline">Bulk Mode</span>
                                                <span className="sm:hidden">Bulk</span>
                                            </>
                                        ) : (
                                            <>
                                                <MousePointer className="h-4 w-4 mr-2" />
                                                <span className="hidden sm:inline">Bulk Select</span>
                                                <span className="sm:hidden">Select</span>
                                            </>
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Toggle Bulk Mode (Ctrl+Shift+B)</p>
                                    <p className="text-xs text-gray-500">Select multiple payments for batch operations</p>
                                </TooltipContent>
                            </Tooltip>
                            <Button variant="outline" onClick={handleExport} disabled={isLoading} className="h-9">
                                <Download className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Export</span>
                            </Button>
                            <Link href={getRoute('payments.create')}>
                                <Button className="h-9">
                                    <Plus className="h-4 w-4 mr-2" />
                                    <span className="hidden sm:inline">Record Payment</span>
                                    <span className="sm:hidden">Record</span>
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Stats Cards - Enhanced with better responsive layout */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {statCards.map((stat, index) => {
                            const bgColor = stat.color?.split(' ')[1] || 'bg-gray-50';
                            const textColor = stat.color?.split(' ')[0] || 'text-gray-600';
                            
                            return (
                                <Card key={index} className="overflow-hidden">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-sm font-medium text-gray-500">
                                                {stat.label}
                                            </CardTitle>
                                            <div className={`p-2 rounded-full ${bgColor}`}>
                                                {getStatIcon(stat.icon)}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className={`text-xl sm:text-2xl font-bold ${textColor}`}>
                                            {stat.value}
                                        </div>
                                        {stat.change && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                Amount: {stat.change}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Search and Filters - Enhanced with better organization */}
                    <Card className="overflow-hidden">
                        <CardContent className="pt-6">
                            <div className="flex flex-col space-y-4">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <Input
                                            ref={searchInputRef}
                                            placeholder="Search by OR number, payer name, reference number... (Ctrl+F)"
                                            className="pl-10"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            disabled={isLoading}
                                        />
                                        {search && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                                                onClick={() => setSearch('')}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button 
                                            variant="outline" 
                                            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                            className="h-9"
                                        >
                                            <Filter className="h-4 w-4 mr-2" />
                                            <span className="hidden sm:inline">
                                                {showAdvancedFilters ? 'Hide Filters' : 'More Filters'}
                                            </span>
                                            <span className="sm:hidden">
                                                {showAdvancedFilters ? 'Hide' : 'Filters'}
                                            </span>
                                        </Button>
                                        <Button 
                                            variant="outline"
                                            className="h-9"
                                            onClick={handleExport}
                                            disabled={isLoading}
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            <span className="hidden sm:inline">Export</span>
                                        </Button>
                                    </div>
                                </div>

                                {/* Active filters indicator and clear button */}
                                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                    <div className="text-sm text-gray-500">
                                        Showing {payments.meta?.from || 1} to {payments.meta?.to || 0} of {payments.meta?.total || 0} payments
                                        {search && ` matching "${search}"`}
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        {hasActiveFilters && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleClearFilters}
                                                className="text-red-600 hover:text-red-700 h-8"
                                            >
                                                <FilterX className="h-3.5 w-3.5 mr-1" />
                                                Clear Filters
                                            </Button>
                                        )}
                                        {isBulkMode && (
                                            <div className="flex items-center gap-2" ref={selectionRef}>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setShowSelectionOptions(!showSelectionOptions)}
                                                    className="h-8"
                                                >
                                                    <Layers className="h-3.5 w-3.5 mr-1" />
                                                    Select
                                                </Button>
                                                {showSelectionOptions && (
                                                    <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-white dark:bg-gray-800 border rounded-md shadow-lg">
                                                        <div className="p-2">
                                                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1">
                                                                SELECTION OPTIONS
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                className="w-full justify-start h-8 text-sm"
                                                                onClick={handleSelectAllOnPage}
                                                            >
                                                                <Rows className="h-3.5 w-3.5 mr-2" />
                                                                Current Page ({filteredPayments.length})
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                className="w-full justify-start h-8 text-sm"
                                                                onClick={handleSelectAllFiltered}
                                                            >
                                                                <Filter className="h-3.5 w-3.5 mr-2" />
                                                                All Filtered ({filteredPayments.length})
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                className="w-full justify-start h-8 text-sm"
                                                                onClick={handleSelectAll}
                                                            >
                                                                <Hash className="h-3.5 w-3.5 mr-2" />
                                                                All ({payments.meta?.total || 0})
                                                            </Button>
                                                            <div className="border-t my-1"></div>
                                                            <Button
                                                                variant="ghost"
                                                                className="w-full justify-start h-8 text-sm text-red-600 hover:text-red-700"
                                                                onClick={() => setSelectedPayments([])}
                                                            >
                                                                <RotateCcw className="h-3.5 w-3.5 mr-2" />
                                                                Clear Selection
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Basic Filters */}
                                <div className="flex flex-wrap gap-2 sm:gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500 hidden sm:inline">Status:</span>
                                        <select
                                            className="border rounded px-2 py-1 text-sm w-28 sm:w-auto"
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

                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500 hidden sm:inline">Method:</span>
                                        <select
                                            className="border rounded px-2 py-1 text-sm w-28 sm:w-auto"
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

                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500 hidden sm:inline">Payer:</span>
                                        <select
                                            className="border rounded px-2 py-1 text-sm w-28 sm:w-auto"
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
                                </div>

                                {/* Advanced Filters */}
                                {showAdvancedFilters && (
                                    <div className="border-t pt-4 space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {/* Date Range Filter */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Date Range</label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        placeholder="From date"
                                                        type="date"
                                                        className="flex-1"
                                                        value={dateFrom}
                                                        onChange={(e) => setDateFrom(e.target.value)}
                                                        disabled={isLoading}
                                                    />
                                                    <span className="self-center text-sm">to</span>
                                                    <Input
                                                        placeholder="To date"
                                                        type="date"
                                                        className="flex-1"
                                                        value={dateTo}
                                                        onChange={(e) => setDateTo(e.target.value)}
                                                        disabled={isLoading}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {isLoading && (
                                <div className="mt-3 text-sm text-blue-500 flex items-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                                    Loading payments...
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Enhanced Bulk Actions Bar - MOVED ABOVE THE TABLE */}
                    {isBulkMode && selectedPayments.length > 0 && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 shadow-sm">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full border">
                                        <PackageCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        <span className="font-medium text-sm">
                                            {selectedPayments.length} selected
                                        </span>
                                        <Badge variant="outline" className="ml-1 h-5 text-xs">
                                            {selectionMode === 'page' ? 'Page' : 
                                             selectionMode === 'filtered' ? 'Filtered' : 'All'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedPayments([]);
                                                setIsSelectAll(false);
                                            }}
                                            className="h-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <PackageX className="h-3.5 w-3.5 mr-1" />
                                            Clear
                                        </Button>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={handleCopySelectedData}
                                                    className="h-7"
                                                >
                                                    <ClipboardCopy className="h-3.5 w-3.5" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Copy selected data as CSV
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-2" ref={bulkActionRef}>
                                    <div className="flex items-center gap-2">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleSmartBulkAction}
                                                    className="h-8"
                                                    disabled={isPerformingBulkAction}
                                                >
                                                    <FileSpreadsheet className="h-3.5 w-3.5 mr-1" />
                                                    <span className="hidden sm:inline">Export</span>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Smart export based on selection
                                            </TooltipContent>
                                        </Tooltip>
                                        
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleBulkOperation('print')}
                                                    className="h-8"
                                                    disabled={isPerformingBulkAction}
                                                >
                                                    <Printer className="h-3.5 w-3.5 mr-1" />
                                                    <span className="hidden sm:inline">Print</span>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Print payment receipts
                                            </TooltipContent>
                                        </Tooltip>
                                        
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setShowBulkStatusDialog(true)}
                                                    className="h-8"
                                                    disabled={isPerformingBulkAction}
                                                >
                                                    <Edit className="h-3.5 w-3.5 mr-1" />
                                                    <span className="hidden sm:inline">Edit</span>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Bulk edit selected payments
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                    
                                    <div className="relative">
                                        <Button
                                            onClick={() => setShowBulkActions(!showBulkActions)}
                                            className="h-8 bg-blue-600 hover:bg-blue-700 text-white"
                                            disabled={isPerformingBulkAction}
                                        >
                                            {isPerformingBulkAction ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <>
                                                    <Layers className="h-3.5 w-3.5 mr-1" />
                                                    <span className="hidden sm:inline">More</span>
                                                </>
                                            )}
                                        </Button>
                                        
                                        {showBulkActions && (
                                            <div className="absolute right-0 top-full mt-1 z-50 w-56 bg-white dark:bg-gray-800 border rounded-md shadow-lg">
                                                <div className="p-2">
                                                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1">
                                                        BULK ACTIONS
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        className="w-full justify-start h-8 text-sm"
                                                        onClick={() => handleBulkOperation('send_receipt')}
                                                    >
                                                        <Mail className="h-3.5 w-3.5 mr-2" />
                                                        Send Receipts
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        className="w-full justify-start h-8 text-sm"
                                                        onClick={() => handleBulkOperation('mark_cleared')}
                                                    >
                                                        <CheckCheck className="h-3.5 w-3.5 mr-2" />
                                                        Mark as Cleared
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        className="w-full justify-start h-8 text-sm"
                                                        onClick={() => {
                                                            const orNumbers = selectedPaymentsData.map(p => p.or_number).join(', ');
                                                            alert(`Selected OR Numbers: ${orNumbers}`);
                                                        }}
                                                    >
                                                        <QrCode className="h-3.5 w-3.5 mr-2" />
                                                        Generate QR Codes
                                                    </Button>
                                                    <DropdownMenuSeparator />
                                                    <Button
                                                        variant="ghost"
                                                        className="w-full justify-start h-8 text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => setShowBulkDeleteDialog(true)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                                                        Delete Selected
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <Button
                                        variant="outline"
                                        className="h-8"
                                        onClick={() => setIsBulkMode(false)}
                                        disabled={isPerformingBulkAction}
                                    >
                                        <X className="h-3.5 w-3.5 mr-1" />
                                        <span className="hidden sm:inline">Exit</span>
                                    </Button>
                                </div>
                            </div>
                            
                            {/* Enhanced stats of selected items */}
                            {selectedPaymentsData.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-blue-100 dark:border-blue-800">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Receipt className="h-3.5 w-3.5 text-blue-500" />
                                            <span>
                                                {selectionStats.total} payments
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="h-3.5 w-3.5 text-green-500" />
                                            <span>
                                                {formatCurrency(selectionStats.totalAmount)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                                            <span>
                                                {selectionStats.completed} completed
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="h-3.5 w-3.5 text-purple-500" />
                                            <span>
                                                {selectionStats.cashPayments} cash
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <User className="h-3 w-3 text-blue-500" />
                                            <span>{selectionStats.residents} residents</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Users className="h-3 w-3 text-green-500" />
                                            <span>{selectionStats.households} households</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Payments Table - Enhanced with better design */}
                    <Card className="overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <div className="flex items-center gap-4">
                                <CardTitle className="text-lg sm:text-xl">
                                    Payment Transactions
                                    {selectedPayments.length > 0 && isBulkMode && (
                                        <span className="ml-2 text-sm font-normal text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                            {selectedPayments.length} selected
                                        </span>
                                    )}
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`h-8 w-8 p-0 ${viewMode === 'table' ? 'bg-gray-100' : ''}`}
                                                onClick={() => setViewMode('table')}
                                            >
                                                <List className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Table view</TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`h-8 w-8 p-0 ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
                                                onClick={() => setViewMode('grid')}
                                            >
                                                <Grid3X3 className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Grid view</TooltipContent>
                                    </Tooltip>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={isBulkMode}
                                                    onCheckedChange={setIsBulkMode}
                                                    className="data-[state=checked]:bg-blue-600"
                                                />
                                                <Label htmlFor="bulk-mode" className="text-sm font-medium cursor-pointer whitespace-nowrap">
                                                    Bulk Mode
                                                </Label>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Toggle bulk selection mode</p>
                                            <p className="text-xs text-gray-500">Ctrl+Shift+B • Ctrl+A to select</p>
                                            <p className="text-xs text-gray-500">Esc to exit • Del to delete</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                
                                {payments.meta && (
                                    <div className="text-sm text-gray-500 hidden sm:block">
                                        Page {payments.meta.current_page} of {payments.meta.last_page}
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <div className="min-w-full inline-block align-middle">
                                    <div className="overflow-hidden">
                                        <Table className="min-w-full">
                                            <TableHeader>
                                                <TableRow className="bg-gray-50 dark:bg-gray-800">
                                                    {isBulkMode && (
                                                        <TableHead className="px-4 py-3 text-center w-12">
                                                            <div className="flex items-center justify-center">
                                                                <Checkbox
                                                                    checked={isSelectAll && filteredPayments.length > 0}
                                                                    onCheckedChange={handleSelectAllOnPage}
                                                                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                                />
                                                            </div>
                                                        </TableHead>
                                                    )}
                                                    <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">
                                                        <div className="flex items-center gap-1">
                                                            Actions
                                                        </div>
                                                    </TableHead>
                                                    <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px]">
                                                        OR Number
                                                    </TableHead>
                                                    <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">
                                                        Payer Details
                                                    </TableHead>
                                                    <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                                                        Amount
                                                    </TableHead>
                                                    <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                                                        Date
                                                    </TableHead>
                                                    <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                                                        Method
                                                    </TableHead>
                                                    <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                                                        Status
                                                    </TableHead>
                                                    <TableHead className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 dark:bg-gray-800 min-w-[80px]">
                                                        More
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {filteredPayments.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={isBulkMode ? 9 : 8} className="text-center py-8 text-gray-500">
                                                            <div className="flex flex-col items-center justify-center space-y-4">
                                                                <Receipt className="h-16 w-16 text-gray-300 dark:text-gray-700" />
                                                                <div>
                                                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                                                        No payments found
                                                                    </h3>
                                                                    <p className="text-gray-500 dark:text-gray-400">
                                                                        {hasActiveFilters 
                                                                            ? 'Try changing your filters or search criteria.'
                                                                            : 'Get started by recording a payment.'}
                                                                    </p>
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    {hasActiveFilters && (
                                                                        <Button
                                                                            variant="outline"
                                                                            onClick={handleClearFilters}
                                                                            className="h-8"
                                                                        >
                                                                            Clear Filters
                                                                        </Button>
                                                                    )}
                                                                    <Link href={getRoute('payments.create')}>
                                                                        <Button className="h-8">
                                                                            <Plus className="h-3 w-3 mr-1" />
                                                                            Record Payment
                                                                        </Button>
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    filteredPayments.map((payment) => {
                                                        const isSelected = selectedPayments.includes(payment.id);
                                                        const nameLength = getTruncationLength('name');
                                                        const addressLength = getTruncationLength('address');
                                                        const contactLength = getTruncationLength('contact');
                                                        const payerDetails = getPayerDetailsText(payment);
                                                        
                                                        return (
                                                            <>
                                                                <TableRow 
                                                                    key={payment.id} 
                                                                    className={`hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors ${
                                                                        isSelected ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-blue-500' : ''
                                                                    }`}
                                                                    onClick={(e) => {
                                                                        if (isBulkMode && e.target instanceof HTMLElement && 
                                                                            !e.target.closest('a') && 
                                                                            !e.target.closest('button') &&
                                                                            !e.target.closest('.dropdown-menu-content') &&
                                                                            !e.target.closest('input[type="checkbox"]')) {
                                                                            handleItemSelect(payment.id);
                                                                        }
                                                                    }}
                                                                >
                                                                    {isBulkMode && (
                                                                        <TableCell className="px-4 py-3 text-center">
                                                                            <div className="flex items-center justify-center">
                                                                                <Checkbox
                                                                                    checked={isSelected}
                                                                                    onCheckedChange={() => handleItemSelect(payment.id)}
                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                                                />
                                                                            </div>
                                                                        </TableCell>
                                                                    )}
                                                                    <TableCell className="px-4 py-3">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => togglePaymentExpanded(payment.id)}
                                                                            className="h-8 w-8 p-0"
                                                                            disabled={isBulkMode}
                                                                        >
                                                                            {expandedPayments.has(payment.id) ? (
                                                                                <ChevronUp className="h-4 w-4" />
                                                                            ) : (
                                                                                <ChevronDown className="h-4 w-4" />
                                                                            )}
                                                                        </Button>
                                                                    </TableCell>
                                                                    <TableCell className="px-4 py-3">
                                                                        <div 
                                                                            className="flex items-center gap-2 cursor-text select-text"
                                                                            onDoubleClick={(e) => {
                                                                                const selection = window.getSelection();
                                                                                if (selection) {
                                                                                    const range = document.createRange();
                                                                                    range.selectNodeContents(e.currentTarget);
                                                                                    selection.removeAllRanges();
                                                                                    selection.addRange(range);
                                                                                }
                                                                            }}
                                                                            title={`Double-click to select all\nOR Number: ${payment.or_number}\nReference: ${payment.reference_number || 'N/A'}`}
                                                                        >
                                                                            <Receipt className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                                            <div className="min-w-0">
                                                                                <div className="font-medium truncate" data-full-text={payment.or_number}>
                                                                                    {truncateText(payment.or_number, nameLength)}
                                                                                </div>
                                                                                {payment.reference_number && (
                                                                                    <div className="text-xs text-gray-500 truncate">
                                                                                        Ref: {truncateText(payment.reference_number, 12)}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell className="px-4 py-3">
                                                                        <div 
                                                                            className="flex items-center gap-1 cursor-text select-text"
                                                                            onDoubleClick={(e) => {
                                                                                const selection = window.getSelection();
                                                                                if (selection) {
                                                                                    const range = document.createRange();
                                                                                    range.selectNodeContents(e.currentTarget);
                                                                                    selection.removeAllRanges();
                                                                                    selection.addRange(range);
                                                                                }
                                                                            }}
                                                                            title={`Double-click to select all\n${payerDetails}`}
                                                                        >
                                                                            {getPayerIcon(payment.payer_type)}
                                                                            <div className="min-w-0">
                                                                                <div 
                                                                                    className="font-medium truncate flex items-center gap-1"
                                                                                    data-full-text={payment.payer_name}
                                                                                >
                                                                                    {truncateText(payment.payer_name, nameLength)}
                                                                                </div>
                                                                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs text-gray-500">
                                                                                    {payment.contact_number && (
                                                                                        <div className="flex items-center gap-1 truncate">
                                                                                            <Phone className="h-2.5 w-2.5 flex-shrink-0" />
                                                                                            <span data-full-text={payment.contact_number}>
                                                                                                {formatContactNumber(payment.contact_number)}
                                                                                            </span>
                                                                                        </div>
                                                                                    )}
                                                                                    <div className="text-xs text-gray-500 truncate">
                                                                                        {payment.payer_type === 'resident' ? 'Resident' : 'Household'}
                                                                                        {payment.household_number && ` • House #${truncateText(payment.household_number, 8)}`}
                                                                                        {payment.purok && ` • Purok ${payment.purok}`}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell className="px-4 py-3">
                                                                        <div className="font-bold">
                                                                            <div>{formatCurrency(payment.total_amount || 0)}</div>
                                                                            {payment.surcharge > 0 || payment.penalty > 0 || payment.discount > 0 ? (
                                                                                <div className="text-xs text-gray-500">
                                                                                    {payment.discount > 0 && `Discount: ${formatCurrency(payment.discount || 0)} `}
                                                                                    {payment.surcharge > 0 && `Surcharge: ${formatCurrency(payment.surcharge || 0)} `}
                                                                                    {payment.penalty > 0 && `Penalty: ${formatCurrency(payment.penalty || 0)}`}
                                                                                </div>
                                                                            ) : null}
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell className="px-4 py-3">
                                                                        <div>
                                                                            <div>{payment.formatted_date || formatDate(payment.payment_date)}</div>
                                                                            {payment.period_covered && (
                                                                                <div className="text-xs text-gray-500 truncate">
                                                                                    Period: {truncateText(payment.period_covered, 15)}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell className="px-4 py-3">
                                                                        <div className="flex items-center gap-2">
                                                                            {getMethodIcon(payment.payment_method)}
                                                                            <span className="truncate">
                                                                                {payment.payment_method_details?.name || 
                                                                                 paymentMethods.find(m => m.value === payment.payment_method)?.label || 
                                                                                 payment.payment_method}
                                                                            </span>
                                                                        </div>
                                                                        {payment.purpose && (
                                                                            <div className="text-xs text-gray-500 mt-1 truncate">
                                                                                {truncateText(payment.purpose, 20)}
                                                                            </div>
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell className="px-4 py-3">
                                                                        <Badge 
                                                                            variant={getStatusVariant(payment.status)} 
                                                                            className="truncate max-w-full flex items-center gap-1"
                                                                            title={payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                                                        >
                                                                            {getStatusIcon(payment.status)}
                                                                            <span>{payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}</span>
                                                                        </Badge>
                                                                        {payment.recorder?.name && (
                                                                            <div className="text-xs text-gray-500 mt-1 truncate">
                                                                                by {truncateText(payment.recorder.name, 15)}
                                                                            </div>
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell className="px-4 py-3 text-right sticky right-0 bg-white dark:bg-gray-900">
                                                                        <DropdownMenu>
                                                                            <DropdownMenuTrigger asChild>
                                                                                <Button 
                                                                                    variant="ghost" 
                                                                                    className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                >
                                                                                    <span className="sr-only">Open menu</span>
                                                                                    <MoreVertical className="h-4 w-4" />
                                                                                </Button>
                                                                            </DropdownMenuTrigger>
                                                                            <DropdownMenuContent align="end" className="w-48">
                                                                                <DropdownMenuItem asChild>
                                                                                    <Link 
                                                                                        href={getRoute('payments.show', payment.id)}
                                                                                        className="flex items-center cursor-pointer"
                                                                                    >
                                                                                        <Eye className="mr-2 h-4 w-4" />
                                                                                        <span>View Details</span>
                                                                                    </Link>
                                                                                </DropdownMenuItem>
                                                                                
                                                                                <DropdownMenuItem asChild>
                                                                                    <Link 
                                                                                        href={getRoute('payments.edit', payment.id)}
                                                                                        className="flex items-center cursor-pointer"
                                                                                    >
                                                                                        <Edit className="mr-2 h-4 w-4" />
                                                                                        <span>Edit Payment</span>
                                                                                    </Link>
                                                                                </DropdownMenuItem>
                                                                                
                                                                                <DropdownMenuItem asChild>
                                                                                    <Link 
                                                                                        href={getRoute('payments.receipt', payment.id)}
                                                                                        className="flex items-center cursor-pointer"
                                                                                    >
                                                                                        <Printer className="mr-2 h-4 w-4" />
                                                                                        <span>Print Receipt</span>
                                                                                    </Link>
                                                                                </DropdownMenuItem>
                                                                                
                                                                                <DropdownMenuSeparator />
                                                                                
                                                                                <DropdownMenuItem 
                                                                                    onClick={() => handleCopyToClipboard(payment.or_number, 'OR Number')}
                                                                                    className="flex items-center cursor-pointer"
                                                                                >
                                                                                    <Copy className="mr-2 h-4 w-4" />
                                                                                    <span>Copy OR Number</span>
                                                                                </DropdownMenuItem>
                                                                                
                                                                                <DropdownMenuItem 
                                                                                    onClick={() => handleCopyToClipboard(payment.payer_name, 'Payer Name')}
                                                                                    className="flex items-center cursor-pointer"
                                                                                >
                                                                                    <Copy className="mr-2 h-4 w-4" />
                                                                                    <span>Copy Payer Name</span>
                                                                                </DropdownMenuItem>

                                                                                {payment.contact_number && (
                                                                                    <DropdownMenuItem 
                                                                                        onClick={() => handleCopyToClipboard(payment.contact_number, 'Contact Number')}
                                                                                        className="flex items-center cursor-pointer"
                                                                                    >
                                                                                        <Copy className="mr-2 h-4 w-4" />
                                                                                        <span>Copy Contact</span>
                                                                                    </DropdownMenuItem>
                                                                                )}
                                                                                
                                                                                {isBulkMode && (
                                                                                    <>
                                                                                        <DropdownMenuSeparator />
                                                                                        <DropdownMenuItem 
                                                                                            onClick={() => handleItemSelect(payment.id)}
                                                                                            className="flex items-center cursor-pointer"
                                                                                        >
                                                                                            {isSelected ? (
                                                                                                <>
                                                                                                    <CheckSquare className="mr-2 h-4 w-4 text-green-600" />
                                                                                                    <span className="text-green-600">Deselect</span>
                                                                                                </>
                                                                                            ) : (
                                                                                                <>
                                                                                                    <Square className="mr-2 h-4 w-4" />
                                                                                                    <span>Select for Bulk</span>
                                                                                                </>
                                                                                            )}
                                                                                        </DropdownMenuItem>
                                                                                    </>
                                                                                )}
                                                                                
                                                                                <DropdownMenuSeparator />
                                                                                
                                                                                {payment.status !== 'completed' && (
                                                                                    <DropdownMenuItem 
                                                                                        onClick={() => handleDeletePayment(payment)}
                                                                                        className="flex items-center cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
                                                                                    >
                                                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                                                        <span>Delete Payment</span>
                                                                                    </DropdownMenuItem>
                                                                                )}
                                                                            </DropdownMenuContent>
                                                                        </DropdownMenu>
                                                                    </TableCell>
                                                                </TableRow>
                                                                
                                                                {/* Expanded Row for Payment Items */}
                                                                {expandedPayments.has(payment.id) && payment.items && payment.items.length > 0 && (
                                                                    <TableRow className="bg-gray-50">
                                                                        <TableCell colSpan={isBulkMode ? 9 : 8} className="p-0">
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
                                                                                                            <div>{truncateText(item.fee_name, 20)}</div>
                                                                                                            <div className="text-xs text-gray-500">{item.fee_code}</div>
                                                                                                        </div>
                                                                                                    </TableCell>
                                                                                                    <TableCell>
                                                                                                        {item.description ? truncateText(item.description, 25) : '-'}
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
                                                                                            {truncateText(payment.remarks, 100)}
                                                                                        </p>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                )}
                                                            </>
                                                        );
                                                    })
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </div>

                            {/* Pagination - Enhanced with better design */}
                            {payments.meta && payments.meta.total > payments.meta.per_page && (
                                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-4 pt-4 px-4 border-t">
                                    <div className="text-sm text-gray-500">
                                        Showing {payments.meta.from} to {payments.meta.to} of {payments.meta.total} results
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => payments.links.prev && router.get(payments.links.prev)}
                                            disabled={!payments.links?.prev || isLoading}
                                            className="h-8"
                                        >
                                            <ChevronLeft className="h-4 w-4 mr-1" />
                                            Previous
                                        </Button>
                                        <div className="flex items-center gap-1">
                                            {(() => {
                                                const totalPages = payments.meta.last_page;
                                                const currentPage = payments.meta.current_page;
                                                
                                                return Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                                                            onClick={() => router.get(`/payments?page=${pageNum}`)}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            {pageNum}
                                                        </Button>
                                                    );
                                                });
                                            })()}
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => payments.links.next && router.get(payments.links.next)}
                                            disabled={!payments.links?.next || isLoading}
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

                    {/* Keyboard Shortcuts Help */}
                    {isBulkMode && (
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <KeyRound className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm font-medium">Keyboard Shortcuts</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsBulkMode(false)}
                                    className="h-7 text-xs"
                                    disabled={isPerformingBulkAction}
                                >
                                    Exit Bulk Mode
                                </Button>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-xs text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-1">
                                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Ctrl+A</kbd>
                                    <span>Select page</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Shift+Ctrl+A</kbd>
                                    <span>Select filtered</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Delete</kbd>
                                    <span>Delete selected</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Esc</kbd>
                                    <span>Exit/clear</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </TooltipProvider>

            {/* Bulk Delete Confirmation Dialog */}
            <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Selected Payments</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedPayments.length} selected payment{selectedPayments.length !== 1 ? 's' : ''}?
                            This action cannot be undone. Completed payments cannot be deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPerformingBulkAction}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleBulkOperation('delete')}
                            className="bg-red-600 hover:bg-red-700 text-white"
                            disabled={isPerformingBulkAction}
                        >
                            {isPerformingBulkAction ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete Selected'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Status Update Dialog */}
            <AlertDialog open={showBulkStatusDialog} onOpenChange={setShowBulkStatusDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Bulk Update Status</AlertDialogTitle>
                        <AlertDialogDescription>
                            Update status for {selectedPayments.length} selected payments.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>New Status</Label>
                            <select 
                                className="w-full border rounded px-3 py-2 mt-1"
                                value={bulkEditValue}
                                onChange={(e) => setBulkEditValue(e.target.value)}
                            >
                                <option value="">Select Status</option>
                                <option value="completed">Completed</option>
                                <option value="pending">Pending</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded">
                            <div className="font-medium mb-1">Current selection stats:</div>
                            <ul className="list-disc list-inside space-y-1">
                                <li>{selectionStats.total} total payments</li>
                                <li>{selectionStats.completed} completed • {selectionStats.pending} pending • {selectionStats.cancelled} cancelled</li>
                                <li>Total amount: {formatCurrency(selectionStats.totalAmount)}</li>
                                <li>Average amount: {formatCurrency(selectionStats.avgAmount)}</li>
                                <li>{selectionStats.cashPayments} cash payments</li>
                                <li>{selectionStats.digitalPayments} digital payments</li>
                                <li>{selectionStats.residents} residents • {selectionStats.households} households</li>
                            </ul>
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPerformingBulkAction}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleBulkOperation('update_status')}
                            disabled={isPerformingBulkAction || !bulkEditValue}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isPerformingBulkAction ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update Status'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}