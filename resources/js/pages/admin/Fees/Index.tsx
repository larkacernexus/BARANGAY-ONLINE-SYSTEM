import AppLayout from '@/layouts/admin-app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useMemo, useEffect, JSX, useRef, useCallback } from 'react';
import { format, isAfter } from 'date-fns';
import { route } from 'ziggy-js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
    CreditCard,
    Receipt,
    ChevronRight,
    ChevronLeft,
    Hash,
    Printer,
    Copy,
    AlertTriangle,
    ShieldCheck,
    CalendarClock,
    Layers,
    MousePointer,
    Check,
    X,
    ChevronDown,
    ChevronUp,
    CheckSquare,
    Square,
    PackageCheck,
    PackageX,
    ClipboardCopy,
    Mail,
    Loader2,
    ArrowUpDown,
    CheckCheck,
    Archive,
    Send,
    FileSpreadsheet,
    QrCode,
    FileDigit,
    Checkbox,
    FilterX,
    RotateCcw,
    KeyRound,
    Users,
    Clock4,
    Calculator,
    EyeOff,
    FileEdit,
    FileUp,
    MoveHorizontal,
    Timer,
    PlayCircle,
    PauseCircle,
    CopyCheck,
    CheckSquare as CheckSquareIcon,
    Square as SquareIcon,
    Grid3X3,
    List,
    MoreHorizontal,
    Tags,
    Tag,
    Percent,
    Shield,
    Globe,
    Zap,
    RefreshCw,
    ShieldAlert,
    Info,
    FileSearch,
    Calculator as CalculatorIcon,
    Building2,
    Crown,
    Camera,
    Phone,
    MapPin,
    ExternalLink,
    BarChart3
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
    or_number?: string;
    certificate_number?: string;
    purpose?: string;
    billing_period?: string;
    valid_from?: string;
    valid_until?: string;
    discount_amount?: number;
    surcharge_amount?: number;
    penalty_amount?: number;
    base_amount?: number;
    payment_method?: string;
    payment_reference?: string;
}

interface PaginationData {
    current_page: number;
    data: Fee[];
    from: number;
    last_page: number;
    per_page: number;
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
    payer_type?: string;
    min_amount?: string;
    max_amount?: string;
}

interface Stats {
    total: number;
    total_amount: number;
    collected: number;
    pending: number;
    overdue_count: number;
    issued_count: number;
    partially_paid_count: number;
    waived_count: number;
}

// Bulk operation types
type BulkOperation = 'export' | 'print' | 'delete' | 'issue' | 'mark_paid' | 'mark_overdue' | 'cancel' | 'waive' | 'export_csv' | 'export_pdf' | 'send_reminder' | 'generate_certificates' | 'generate_receipts';

declare module '@inertiajs/react' {
    interface PageProps {
        fees: PaginationData;
        filters: Filters;
        statuses: Record<string, string>;
        categories: Record<string, string>;
        puroks: string[];
        stats: Stats;
        flash?: {
            success?: string;
            error?: string;
        };
    }
}

// Helper functions
const truncateText = (text: string, maxLength: number = 30): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

const formatContactNumber = (contact: string): string => {
    if (!contact) return 'N/A';
    if (contact.length <= 12) return contact;
    return truncateText(contact, 12);
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

const isOverdue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    return isAfter(today, due);
};

const getDaysOverdue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
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
    
    // State management - EXACTLY like Residents component
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || 'all');
    const [purokFilter, setPurokFilter] = useState(filters.purok || 'all');
    const [fromDateFilter, setFromDateFilter] = useState(filters.from_date || '');
    const [toDateFilter, setToDateFilter] = useState(filters.to_date || '');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(15);
    const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
    
    // Bulk selection states - EXACT SAME as Residents
    const [selectedFees, setSelectedFees] = useState<number[]>([]);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [isSelectAll, setIsSelectAll] = useState(false);
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
    const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [selectionMode, setSelectionMode] = useState<'page' | 'filtered' | 'all'>('page');
    const [showSelectionOptions, setShowSelectionOptions] = useState(false);
    const [copied, setCopied] = useState(false);
    
    const bulkActionRef = useRef<HTMLDivElement>(null);
    const selectionRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Track window resize
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close dropdowns when clicking outside - EXACT SAME as Residents
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

    // Keyboard shortcuts - EXACT SAME as Residents
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
                    if (selectedFees.length > 0) {
                        setSelectedFees([]);
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
            if (e.key === 'Delete' && isBulkMode && selectedFees.length > 0) {
                e.preventDefault();
                setShowBulkDeleteDialog(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isBulkMode, selectedFees, showBulkActions, showSelectionOptions]);

    // Reset selection when bulk mode is turned off
    useEffect(() => {
        if (!isBulkMode) {
            setSelectedFees([]);
            setIsSelectAll(false);
        }
    }, [isBulkMode]);

    // Filter fees client-side
    const filteredFees = useMemo(() => {
        let result = [...fees.data];

        // Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            result = result.filter(fee => 
                fee.fee_code.toLowerCase().includes(searchLower) ||
                fee.payer_name.toLowerCase().includes(searchLower) ||
                (fee.contact_number && fee.contact_number.includes(search)) ||
                (fee.purok && fee.purok.toLowerCase().includes(searchLower)) ||
                (fee.fee_type?.name && fee.fee_type.name.toLowerCase().includes(searchLower)) ||
                (fee.certificate_number && fee.certificate_number.includes(search)) ||
                (fee.or_number && fee.or_number.includes(search))
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            result = result.filter(fee => fee.status === statusFilter);
        }

        // Category filter
        if (categoryFilter !== 'all') {
            result = result.filter(fee => fee.fee_type?.category === categoryFilter);
        }

        // Purok filter
        if (purokFilter !== 'all') {
            result = result.filter(fee => fee.purok === purokFilter);
        }

        // Date range filter
        if (fromDateFilter) {
            const fromDate = new Date(fromDateFilter);
            result = result.filter(fee => new Date(fee.issue_date) >= fromDate);
        }

        if (toDateFilter) {
            const toDate = new Date(toDateFilter);
            result = result.filter(fee => new Date(fee.issue_date) <= toDate);
        }

        // Sorting
        result.sort((a, b) => {
            let aValue: any, bValue: any;
            
            switch (sortBy) {
                case 'fee_code':
                    aValue = a.fee_code.toLowerCase();
                    bValue = b.fee_code.toLowerCase();
                    break;
                case 'payer_name':
                    aValue = a.payer_name.toLowerCase();
                    bValue = b.payer_name.toLowerCase();
                    break;
                case 'total_amount':
                    aValue = a.total_amount;
                    bValue = b.total_amount;
                    break;
                case 'due_date':
                    aValue = new Date(a.due_date).getTime();
                    bValue = new Date(b.due_date).getTime();
                    break;
                case 'created_at':
                    aValue = new Date(a.created_at).getTime();
                    bValue = new Date(b.created_at).getTime();
                    break;
                case 'status':
                    aValue = a.status;
                    bValue = b.status;
                    break;
                default:
                    aValue = new Date(a.created_at).getTime();
                    bValue = new Date(b.created_at).getTime();
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
            } else {
                return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
            }
        });

        return result;
    }, [fees.data, search, statusFilter, categoryFilter, purokFilter, fromDateFilter, toDateFilter, sortBy, sortOrder]);

    // Calculate pagination
    const totalItems = filteredFees.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedFees = filteredFees.slice(startIndex, endIndex);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter, categoryFilter, purokFilter, fromDateFilter, toDateFilter, sortBy, sortOrder]);

    // Handle select/deselect all on current page - EXACT SAME as Residents
    const handleSelectAllOnPage = () => {
        const pageIds = paginatedFees.map(fee => fee.id);
        if (isSelectAll) {
            setSelectedFees(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedFees, ...pageIds])];
            setSelectedFees(newSelected);
        }
        setIsSelectAll(!isSelectAll);
        setSelectionMode('page');
    };

    // Handle select/deselect all filtered items
    const handleSelectAllFiltered = () => {
        const allIds = filteredFees.map(fee => fee.id);
        if (selectedFees.length === allIds.length && allIds.every(id => selectedFees.includes(id))) {
            setSelectedFees(prev => prev.filter(id => !allIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedFees, ...allIds])];
            setSelectedFees(newSelected);
            setSelectionMode('filtered');
        }
    };

    // Handle select all items (including not loaded)
    const handleSelectAll = () => {
        if (confirm(`This will select ALL ${fees.total} fees. This action may take a moment.`)) {
            const pageIds = paginatedFees.map(fee => fee.id);
            setSelectedFees(pageIds);
            setSelectionMode('all');
        }
    };

    // Handle individual item selection
    const handleItemSelect = (id: number) => {
        setSelectedFees(prev => {
            if (prev.includes(id)) {
                return prev.filter(itemId => itemId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    // Check if all items on current page are selected
    useEffect(() => {
        const allPageIds = paginatedFees.map(fee => fee.id);
        const allSelected = allPageIds.every(id => selectedFees.includes(id));
        setIsSelectAll(allSelected);
    }, [selectedFees, paginatedFees]);

    // Get selected fees data
    const selectedFeesData = useMemo(() => {
        return filteredFees.filter(fee => selectedFees.includes(fee.id));
    }, [selectedFees, filteredFees]);

    // Calculate selection stats - SIMILAR PATTERN as Residents
    const selectionStats = useMemo(() => {
        const selectedData = selectedFeesData;
        
        const totalAmount = selectedData.reduce((sum, fee) => sum + fee.total_amount, 0);
        const totalPaid = selectedData.reduce((sum, fee) => sum + fee.amount_paid, 0);
        const totalBalance = selectedData.reduce((sum, fee) => sum + fee.balance, 0);
        const overdueCount = selectedData.filter(fee => 
            isOverdue(fee.due_date) && fee.status !== 'paid'
        ).length;
        
        return {
            total: selectedData.length,
            totalAmount,
            totalPaid,
            totalBalance,
            overdueCount,
            paidCount: selectedData.filter(fee => fee.status === 'paid').length,
            pendingCount: selectedData.filter(fee => fee.status === 'pending').length,
            issuedCount: selectedData.filter(fee => fee.status === 'issued').length,
            partiallyPaidCount: selectedData.filter(fee => fee.status === 'partially_paid').length,
            withCertificates: selectedData.filter(fee => fee.certificate_number).length,
            withReceipts: selectedData.filter(fee => fee.or_number).length,
            residents: selectedData.filter(fee => fee.payer_type === 'resident').length,
            households: selectedData.filter(fee => fee.payer_type === 'household').length,
            businesses: selectedData.filter(fee => fee.payer_type === 'business').length,
        };
    }, [selectedFeesData]);

    // Enhanced bulk operation handler - SIMILAR PATTERN as Residents
    const handleBulkOperation = async (operation: BulkOperation) => {
        if (selectedFees.length === 0) {
            alert('Please select at least one fee');
            return;
        }

        setIsPerformingBulkAction(true);

        try {
            switch (operation) {
                case 'export':
                case 'export_csv':
                    const exportData = selectedFeesData.map(fee => ({
                        'Fee Code': fee.fee_code,
                        'Payer Name': fee.payer_name,
                        'Contact': fee.contact_number || '',
                        'Purok': fee.purok || '',
                        'Fee Type': fee.fee_type?.name || '',
                        'Category': fee.fee_type?.category || '',
                        'Issue Date': formatDate(fee.issue_date),
                        'Due Date': formatDate(fee.due_date),
                        'Total Amount': fee.total_amount,
                        'Amount Paid': fee.amount_paid,
                        'Balance': fee.balance,
                        'Status': statuses[fee.status] || fee.status,
                        'Certificate #': fee.certificate_number || '',
                        'OR #': fee.or_number || '',
                        'Payment Method': fee.payment_method || '',
                        'Created At': fee.created_at,
                    }));
                    
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
                    
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `fees-export-${new Date().toISOString().split('T')[0]}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                    
                    break;

                case 'print':
                    selectedFees.forEach(id => {
                        window.open(`/fees/${id}/print`, '_blank');
                    });
                    break;

                case 'delete':
                    if (confirm(`Are you sure you want to delete ${selectedFees.length} selected fee(s)? This action cannot be undone.`)) {
                        await router.post('/fees/bulk-action', {
                            action: 'delete',
                            fee_ids: selectedFees,
                        }, {
                            preserveScroll: true,
                            onSuccess: () => {
                                setSelectedFees([]);
                                setShowBulkDeleteDialog(false);
                            },
                        });
                    }
                    break;

                // Other bulk operations...
                default:
                    alert('Operation not supported yet');
            }
        } catch (error) {
            console.error('Bulk operation error:', error);
        } finally {
            setIsPerformingBulkAction(false);
        }
    };

    // Copy selected data to clipboard - SIMILAR as Residents
    const handleCopySelectedData = () => {
        if (selectedFeesData.length === 0) {
            alert('No data to copy');
            return;
        }
        
        const data = selectedFeesData.map(fee => ({
            'Fee Code': fee.fee_code,
            'Payer': fee.payer_name,
            'Amount': formatCurrency(fee.total_amount),
            'Balance': formatCurrency(fee.balance),
            'Status': statuses[fee.status] || fee.status,
            'Due Date': formatDate(fee.due_date),
        }));
        
        const csv = [
            Object.keys(data[0]).join(','),
            ...data.map(row => Object.values(row).join(','))
        ].join('\n');
        
        navigator.clipboard.writeText(csv).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch(() => {
            alert('Failed to copy to clipboard');
        });
    };

    const handleSort = (column: string) => {
        const newSortOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortBy(column);
        setSortOrder(newSortOrder);
    };

    const handleClearFilters = () => {
        setSearch('');
        setStatusFilter('all');
        setCategoryFilter('all');
        setPurokFilter('all');
        setFromDateFilter('');
        setToDateFilter('');
        setSortBy('created_at');
        setSortOrder('desc');
    };

    const handleDelete = (fee: Fee) => {
        if (confirm(`Are you sure you want to delete fee ${fee.fee_code}? This action cannot be undone.`)) {
            router.delete(route('fees.destroy', fee.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedFees(selectedFees.filter(id => id !== fee.id));
                },
            });
        }
    };

    const handleCopyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text).then(() => {
            // Could add toast here
        });
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status.toLowerCase()) {
            case 'paid': return 'default';
            case 'issued': return 'outline';
            case 'pending': return 'secondary';
            case 'partially_paid': return 'outline';
            case 'overdue': return 'destructive';
            case 'cancelled': return 'outline';
            case 'waived': return 'outline';
            case 'written_off': return 'outline';
            default: return 'outline';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'paid': return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'issued': return <FileText className="h-4 w-4 text-blue-500" />;
            case 'pending': return <Clock className="h-4 w-4 text-amber-500" />;
            case 'partially_paid': return <DollarSign className="h-4 w-4 text-indigo-500" />;
            case 'overdue': return <AlertCircle className="h-4 w-4 text-red-500" />;
            case 'cancelled': return <XCircle className="h-4 w-4 text-gray-500" />;
            case 'waived': return <ShieldCheck className="h-4 w-4 text-purple-500" />;
            default: return null;
        }
    };

    const getPayerIcon = (payerType: string) => {
        switch (payerType) {
            case 'resident': return <User className="h-4 w-4" />;
            case 'household': return <Home className="h-4 w-4" />;
            case 'business': return <Building className="h-4 w-4" />;
            default: return <User className="h-4 w-4" />;
        }
    };

    const getCategoryBadgeVariant = (category: string) => {
        switch (category.toLowerCase()) {
            case 'tax': return 'destructive';
            case 'clearance': return 'outline';
            case 'certificate': return 'outline';
            case 'service': return 'secondary';
            case 'rental': return 'outline';
            case 'fine': return 'destructive';
            case 'contribution': return 'outline';
            case 'other': return 'outline';
            default: return 'outline';
        }
    };

    const getSortIcon = (column: string) => {
        if (sortBy !== column) return null;
        return sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
    };

    const hasActiveFilters = 
        search || 
        statusFilter !== 'all' || 
        categoryFilter !== 'all' || 
        purokFilter !== 'all' ||
        fromDateFilter ||
        toDateFilter;

    // Get responsive truncation length - SAME as Residents
    const getTruncationLength = (type: 'name' | 'contact' | 'code' = 'name'): number => {
        if (typeof window === 'undefined') return 30;
        
        const width = window.innerWidth;
        if (width < 640) {
            switch(type) {
                case 'name': return 15;
                case 'contact': return 10;
                case 'code': return 12;
                default: return 15;
            }
        }
        if (width < 768) {
            switch(type) {
                case 'name': return 20;
                case 'contact': return 12;
                case 'code': return 15;
                default: return 20;
            }
        }
        if (width < 1024) {
            switch(type) {
                case 'name': return 25;
                case 'contact': return 15;
                case 'code': return 18;
                default: return 25;
            }
        }
        switch(type) {
            case 'name': return 30;
            case 'contact': return 15;
            case 'code': return 20;
            default: return 30;
        }
    };

    return (
        <AppLayout
            title="Fees Management"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Fees', href: '/fees' }
            ]}
        >
            <TooltipProvider>
                <div className="space-y-6">
                    {/* Flash Messages - SAME as Residents */}
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

                    {/* Header - EXACT SAME LAYOUT as Residents */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Fees Management</h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                                Manage and track barangay fees, bills, and certificates
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
                                                Bulk Mode
                                            </>
                                        ) : (
                                            <>
                                                <MousePointer className="h-4 w-4 mr-2" />
                                                Bulk Select
                                            </>
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Toggle Bulk Mode (Ctrl+Shift+B)</p>
                                    <p className="text-xs text-gray-500">Select multiple fees for batch operations</p>
                                </TooltipContent>
                            </Tooltip>
                            <Link href={route('fees.create')}>
                                <Button className="h-9">
                                    <Plus className="h-4 w-4 mr-2" />
                                    <span className="hidden sm:inline">New Fee</span>
                                    <span className="sm:hidden">New</span>
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Stats Cards - EXACT SAME STYLING as Residents */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Card className="overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500">
                                    Total Fees
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl sm:text-2xl font-bold">{stats.total.toLocaleString()}</div>
                                <div className="text-xs sm:text-sm text-gray-500 mt-1">
                                    {formatCurrency(stats.total_amount)} total amount
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500">
                                    Collected
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl sm:text-2xl font-bold">{formatCurrency(stats.collected)}</div>
                                <div className="text-xs sm:text-sm text-gray-500 mt-1">
                                    {formatCurrency(stats.pending)} pending
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500">
                                    This Month
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl sm:text-2xl font-bold text-green-600">+{stats.issued_count}</div>
                                <div className="text-xs sm:text-sm text-gray-500 mt-1">
                                    {stats.overdue_count} overdue • {stats.partially_paid_count} partial
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500">
                                    Status Overview
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl sm:text-2xl font-bold">{stats.waived_count}</div>
                                <div className="text-xs sm:text-sm text-gray-500 mt-1">
                                    Waived • {stats.partially_paid_count} Partial
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Search and Filters - EXACT SAME LAYOUT as Residents */}
                    <Card className="overflow-hidden">
                        <CardContent className="pt-6">
                            <div className="flex flex-col space-y-4">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <Input
                                            ref={searchInputRef}
                                            placeholder="Search fees by code, payer, certificate #... (Ctrl+F)"
                                            className="pl-10"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
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
                                            onClick={() => {
                                                const exportUrl = new URL('/fees/export', window.location.origin);
                                                if (search) exportUrl.searchParams.append('search', search);
                                                if (statusFilter !== 'all') exportUrl.searchParams.append('status', statusFilter);
                                                if (categoryFilter !== 'all') exportUrl.searchParams.append('category', categoryFilter);
                                                window.open(exportUrl.toString(), '_blank');
                                            }}
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            <span className="hidden sm:inline">Export</span>
                                        </Button>
                                    </div>
                                </div>

                                {/* Active filters indicator and clear button - EXACT SAME */}
                                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                    <div className="text-sm text-gray-500">
                                        Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} fees
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
                                                                <List className="h-3.5 w-3.5 mr-2" />
                                                                Current Page ({paginatedFees.length})
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                className="w-full justify-start h-8 text-sm"
                                                                onClick={handleSelectAllFiltered}
                                                            >
                                                                <Filter className="h-3.5 w-3.5 mr-2" />
                                                                All Filtered ({filteredFees.length})
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                className="w-full justify-start h-8 text-sm"
                                                                onClick={handleSelectAll}
                                                            >
                                                                <Hash className="h-3.5 w-3.5 mr-2" />
                                                                All ({fees.total})
                                                            </Button>
                                                            <div className="border-t my-1"></div>
                                                            <Button
                                                                variant="ghost"
                                                                className="w-full justify-start h-8 text-sm text-red-600 hover:text-red-700"
                                                                onClick={() => setSelectedFees([])}
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

                                {/* Basic Filters - SIMILAR LAYOUT */}
                                <div className="flex flex-wrap gap-2 sm:gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500 hidden sm:inline">Status:</span>
                                        <select
                                            className="border rounded px-2 py-1 text-sm w-28 sm:w-auto"
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                        >
                                            <option value="all">All Status</option>
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
                                            value={categoryFilter}
                                            onChange={(e) => setCategoryFilter(e.target.value)}
                                        >
                                            <option value="all">All Categories</option>
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
                                            value={purokFilter}
                                            onChange={(e) => setPurokFilter(e.target.value)}
                                        >
                                            <option value="all">All Puroks</option>
                                            {puroks.map((purok) => (
                                                <option key={purok} value={purok}>
                                                    {purok}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500 hidden sm:inline">Sort:</span>
                                        <select
                                            className="border rounded px-2 py-1 text-sm w-28 sm:w-auto"
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                        >
                                            <option value="created_at">Date Added</option>
                                            <option value="fee_code">Fee Code</option>
                                            <option value="payer_name">Payer Name</option>
                                            <option value="total_amount">Amount</option>
                                            <option value="due_date">Due Date</option>
                                            <option value="status">Status</option>
                                        </select>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-7 w-7 p-0"
                                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                        >
                                            {sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                        </Button>
                                    </div>
                                </div>

                                {/* Advanced Filters - SAME STRUCTURE */}
                                {showAdvancedFilters && (
                                    <div className="border-t pt-4 space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {/* Date Range */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Date Range</label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        placeholder="From Date"
                                                        type="date"
                                                        className="w-full"
                                                        value={fromDateFilter}
                                                        onChange={(e) => setFromDateFilter(e.target.value)}
                                                    />
                                                    <span className="self-center text-sm">to</span>
                                                    <Input
                                                        placeholder="To Date"
                                                        type="date"
                                                        className="w-full"
                                                        value={toDateFilter}
                                                        onChange={(e) => setToDateFilter(e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            {/* Amount Range */}
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

                                            {/* Quick Actions */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Quick Filters</label>
                                                <div className="flex flex-wrap gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className={`h-8 ${statusFilter === 'overdue' ? 'bg-red-50 text-red-700' : ''}`}
                                                        onClick={() => setStatusFilter('overdue')}
                                                    >
                                                        Overdue Only
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className={`h-8 ${statusFilter === 'pending' ? 'bg-amber-50 text-amber-700' : ''}`}
                                                        onClick={() => setStatusFilter('pending')}
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
                                                            setFromDateFilter(firstDay.toISOString().split('T')[0]);
                                                            setToDateFilter(today.toISOString().split('T')[0]);
                                                        }}
                                                    >
                                                        This Month
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Enhanced Bulk Actions Bar - EXACT SAME STYLING as Residents */}
                    {isBulkMode && selectedFees.length > 0 && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 shadow-sm">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full border">
                                        <PackageCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        <span className="font-medium text-sm">
                                            {selectedFees.length} selected
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
                                                setSelectedFees([]);
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
                                                    {copied ? 'Copied!' : 'Copy'}
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
                                                    onClick={() => handleBulkOperation('export')}
                                                    className="h-8"
                                                    disabled={isPerformingBulkAction}
                                                >
                                                    <FileSpreadsheet className="h-3.5 w-3.5 mr-1" />
                                                    Export
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Export selected fees as CSV
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
                                                    Print
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Print selected fees
                                            </TooltipContent>
                                        </Tooltip>
                                        
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleBulkOperation('mark_paid')}
                                                    className="h-8"
                                                    disabled={isPerformingBulkAction}
                                                >
                                                    <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                                    Mark Paid
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Mark selected as paid
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
                                                    More
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
                                                        onClick={() => handleBulkOperation('issue')}
                                                    >
                                                        <FileText className="h-3.5 w-3.5 mr-2" />
                                                        Mark as Issued
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        className="w-full justify-start h-8 text-sm"
                                                        onClick={() => handleBulkOperation('mark_overdue')}
                                                    >
                                                        <AlertCircle className="h-3.5 w-3.5 mr-2" />
                                                        Mark as Overdue
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        className="w-full justify-start h-8 text-sm"
                                                        onClick={() => handleBulkOperation('send_reminder')}
                                                    >
                                                        <Mail className="h-3.5 w-3.5 mr-2" />
                                                        Send Reminder
                                                    </Button>
                                                    {selectionStats.withCertificates > 0 && (
                                                        <Button
                                                            variant="ghost"
                                                            className="w-full justify-start h-8 text-sm"
                                                            onClick={() => handleBulkOperation('generate_certificates')}
                                                        >
                                                            <FileDigit className="h-3.5 w-3.5 mr-2" />
                                                            Generate Certificates
                                                        </Button>
                                                    )}
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
                                        Exit
                                    </Button>
                                </div>
                            </div>
                            
                            {/* Enhanced stats of selected items - SIMILAR PATTERN */}
                            {selectedFeesData.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-blue-100 dark:border-blue-800">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Hash className="h-3.5 w-3.5 text-blue-500" />
                                            <span>
                                                {selectionStats.total} fees
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="h-3.5 w-3.5 text-green-500" />
                                            <span>
                                                {formatCurrency(selectionStats.totalAmount)} total
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="h-3.5 w-3.5 text-indigo-500" />
                                            <span>
                                                {formatCurrency(selectionStats.totalBalance)} balance
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                                            <span>
                                                {selectionStats.overdueCount} overdue
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <FileDigit className="h-3 w-3 text-purple-500" />
                                            <span>{selectionStats.withCertificates} certificates</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Receipt className="h-3 w-3 text-green-500" />
                                            <span>{selectionStats.withReceipts} receipts</span>
                                        </div>
                                    </div>
                                    <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <User className="h-3 w-3 text-blue-500" />
                                            <span>{selectionStats.residents} residents</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Home className="h-3 w-3 text-amber-500" />
                                            <span>{selectionStats.households} households</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Building className="h-3 w-3 text-emerald-500" />
                                            <span>{selectionStats.businesses} businesses</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Fees Table - EXACT SAME STRUCTURE as Residents Table */}
                    <Card className="overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <div className="flex items-center gap-4">
                                <CardTitle className="text-lg sm:text-xl">
                                    Fees List
                                    {selectedFees.length > 0 && isBulkMode && (
                                        <span className="ml-2 text-sm font-normal text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                            {selectedFees.length} selected
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
                                
                                <div className="text-sm text-gray-500 hidden sm:block">
                                    Page {currentPage} of {totalPages}
                                </div>
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
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelectAll && paginatedFees.length > 0}
                                                                    onChange={handleSelectAllOnPage}
                                                                    className="rounded border-gray-300 dark:border-gray-600"
                                                                />
                                                            </div>
                                                        </TableHead>
                                                    )}
                                                    <TableHead 
                                                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[160px] cursor-pointer hover:bg-gray-100"
                                                        onClick={() => handleSort('fee_code')}
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            Fee Details
                                                            {getSortIcon('fee_code')}
                                                        </div>
                                                    </TableHead>
                                                    <TableHead 
                                                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px] cursor-pointer hover:bg-gray-100"
                                                        onClick={() => handleSort('payer_name')}
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            Payer Information
                                                            {getSortIcon('payer_name')}
                                                        </div>
                                                    </TableHead>
                                                    <TableHead 
                                                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px] cursor-pointer hover:bg-gray-100"
                                                        onClick={() => handleSort('due_date')}
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            Dates
                                                            {getSortIcon('due_date')}
                                                        </div>
                                                    </TableHead>
                                                    <TableHead 
                                                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px] cursor-pointer hover:bg-gray-100"
                                                        onClick={() => handleSort('total_amount')}
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            Amount
                                                            {getSortIcon('total_amount')}
                                                        </div>
                                                    </TableHead>
                                                    <TableHead 
                                                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px] cursor-pointer hover:bg-gray-100"
                                                        onClick={() => handleSort('status')}
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            Status
                                                            {getSortIcon('status')}
                                                        </div>
                                                    </TableHead>
                                                    <TableHead className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 dark:bg-gray-800 min-w-[80px]">
                                                        Actions
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {paginatedFees.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={isBulkMode ? 8 : 7} className="text-center py-8 text-gray-500">
                                                            <div className="flex flex-col items-center justify-center space-y-4">
                                                                <FileText className="h-16 w-16 text-gray-300 dark:text-gray-700" />
                                                                <div>
                                                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                                                        No fees found
                                                                    </h3>
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
                                                                            onClick={handleClearFilters}
                                                                            className="h-8"
                                                                        >
                                                                            Clear Filters
                                                                        </Button>
                                                                    )}
                                                                    <Link href={route('fees.create')}>
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
                                                        const isSelected = selectedFees.includes(fee.id);
                                                        const isFeeOverdue = isOverdue(fee.due_date) && fee.status !== 'paid';
                                                        
                                                        return (
                                                            <TableRow 
                                                                key={fee.id} 
                                                                className={`hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors ${
                                                                    isSelected ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-blue-500' : ''
                                                                } ${isFeeOverdue ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}
                                                                onClick={(e) => {
                                                                    if (isBulkMode && e.target instanceof HTMLElement && 
                                                                        !e.target.closest('a') && 
                                                                        !e.target.closest('button') &&
                                                                        !e.target.closest('.dropdown-menu-content') &&
                                                                        !e.target.closest('input[type="checkbox"]')) {
                                                                        handleItemSelect(fee.id);
                                                                    }
                                                                }}
                                                            >
                                                                {isBulkMode && (
                                                                    <TableCell className="px-4 py-3 text-center">
                                                                        <div className="flex items-center justify-center">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={isSelected}
                                                                                onChange={() => handleItemSelect(fee.id)}
                                                                                onClick={(e) => e.stopPropagation()}
                                                                                className="rounded border-gray-300 dark:border-gray-600"
                                                                            />
                                                                        </div>
                                                                    </TableCell>
                                                                )}
                                                                <TableCell className="px-4 py-3 whitespace-nowrap">
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
                                                                        {fee.certificate_number && (
                                                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                                                                                Cert: {truncateText(fee.certificate_number, 15)}
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
                                                                                <span className={isFeeOverdue ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}>
                                                                                    {formatDate(fee.due_date)}
                                                                                </span>
                                                                                {isFeeOverdue && (
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
                                                                                onClick={(e) => e.stopPropagation()}
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
                                                                            
                                                                            {isBulkMode && (
                                                                                <>
                                                                                    <DropdownMenuSeparator />
                                                                                    <DropdownMenuItem 
                                                                                        onClick={() => handleItemSelect(fee.id)}
                                                                                        className="flex items-center cursor-pointer"
                                                                                    >
                                                                                        {isSelected ? (
                                                                                            <>
                                                                                                <CheckSquareIcon className="mr-2 h-4 w-4 text-green-600" />
                                                                                                <span className="text-green-600">Deselect</span>
                                                                                            </>
                                                                                        ) : (
                                                                                            <>
                                                                                                <SquareIcon className="mr-2 h-4 w-4" />
                                                                                                <span>Select for Bulk</span>
                                                                                            </>
                                                                                        )}
                                                                                    </DropdownMenuItem>
                                                                                </>
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

                            {/* Pagination - EXACT SAME as Residents */}
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

                    {/* Keyboard Shortcuts Help - EXACT SAME as Residents */}
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

            {/* Bulk Delete Confirmation Dialog - EXACT SAME STYLING as Residents */}
            <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Selected Fees</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedFees.length} selected fee{selectedFees.length !== 1 ? 's' : ''}?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    {selectionStats.totalBalance > 0 && (
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                            <p className="text-sm text-yellow-700 dark:text-yellow-400">
                                ⚠️ Warning: Selected fees have a total balance of {formatCurrency(selectionStats.totalBalance)}.
                                Consider marking as paid instead of deleting.
                            </p>
                        </div>
                    )}
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
        </AppLayout>
    );
}