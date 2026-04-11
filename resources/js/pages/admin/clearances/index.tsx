import { useState, useMemo, useEffect, useCallback } from 'react';
import { router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import AppLayout from '@/layouts/admin-app-layout';
import { 
    ClearanceRequest,
    ClearanceType,
    StatusOption,
    Filters,
    Stats,
    PaginationData,
    BulkOperation,
    SelectionMode
} from '@/types/admin/clearances/clearance';
import { TooltipProvider } from '@/components/ui/tooltip';

// Import reusable components
import ClearancesStats from '@/components/admin/clearances/ClearancesStats';
import ClearancesFilters from '@/components/admin/clearances/ClearancesFilters';
import ClearancesContent from '@/components/admin/clearances/ClearancesContent';
import ClearancesDialogs from '@/components/admin/clearances/ClearancesDialogs';
import { Button } from '@/components/ui/button';
import { KeyRound, FileText, Plus } from 'lucide-react';

interface ClearancesPageProps {
    clearances?: PaginationData<ClearanceRequest>;
    filters?: Filters;
    clearanceTypes?: ClearanceType[];
    statusOptions?: StatusOption[];
    paymentStatusOptions?: StatusOption[];
    stats?: Stats;
}

const defaultPaginationData: PaginationData<ClearanceRequest> = {
    current_page: 1,
    data: [],
    from: 0,
    last_page: 1,
    per_page: 15,
    to: 0,
    total: 0,
    links: []
};

const defaultStats: Stats = {
    total: 0,
    pending: 0,
    processing: 0,
    approved: 0,
    totalRevenue: 0,
    issuedThisMonth: 0,
    pendingToday: 0,
    expressRequests: 0,
    rushRequests: 0,
    unpaid: 0,
    partially_paid: 0,
    paid: 0,
    pending_payment: 0
};

// Create a compatible default filters object that matches the Filters interface
const defaultFilters: Filters = {
    from_date: () => '',  // Function that returns empty string
    to_date: () => '',    // Function that returns empty string
    search: '',
    status: '',
    type: '',
    urgency: '',
    payment_status: '',
    sort: '',
    direction: ''
};

export default function ClearancesIndex({ 
    clearances, 
    filters, 
    clearanceTypes, 
    statusOptions,
    paymentStatusOptions,
    stats 
}: ClearancesPageProps) {
    const { flash } = usePage().props as any;
    
    // SAFE DESTRUCTURING - Check if props exist before accessing
    const safeClearances = (clearances && typeof clearances === 'object') ? clearances : defaultPaginationData;
    const safeFilters: Filters = (filters && typeof filters === 'object') ? filters : defaultFilters;
    const safeClearanceTypes = Array.isArray(clearanceTypes) ? clearanceTypes : [];
    const safeStatusOptions = Array.isArray(statusOptions) ? statusOptions : [];
    const safePaymentStatusOptions = Array.isArray(paymentStatusOptions) ? paymentStatusOptions : [];
    const safeStats = (stats && typeof stats === 'object') ? stats : defaultStats;
    
    // SAFE DATA ACCESS - ensure data is always an array
    const allClearances = (safeClearances.data && Array.isArray(safeClearances.data)) ? safeClearances.data : [];
    
    // Helper function to safely get string value from filter (handles both string and function)
    const getSafeString = (value: any, defaultValue: string = ''): string => {
        if (value === null || value === undefined) return defaultValue;
        if (typeof value === 'string') return value;
        if (typeof value === 'function') {
            const result = value();
            return typeof result === 'string' ? result : defaultValue;
        }
        if (typeof value === 'number') return String(value);
        return defaultValue;
    };
    
    // Filter states
    const [search, setSearch] = useState<string>(getSafeString(safeFilters.search));
    const [statusFilter, setStatusFilter] = useState<string>(getSafeString(safeFilters.status));
    const [typeFilter, setTypeFilter] = useState<string>(getSafeString(safeFilters.type));
    const [urgencyFilter, setUrgencyFilter] = useState<string>(getSafeString(safeFilters.urgency));
    const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>(getSafeString(safeFilters.payment_status));
    const [fromDate, setFromDate] = useState<string>(getSafeString(safeFilters.from_date));
    const [toDate, setToDate] = useState<string>(getSafeString(safeFilters.to_date));
    
    // Advanced filters
    const [clearanceNumberFilter, setClearanceNumberFilter] = useState<string>('');
    const [applicantTypeFilter, setApplicantTypeFilter] = useState<string>('all');
    const [amountRange, setAmountRange] = useState<string>('');
    const [dateRangePreset, setDateRangePreset] = useState<string>('');
    
    // ✅ Advanced filters toggle state
    const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
    
    // ✅ Sorting states for table header (not in filters)
    const [sortBy, setSortBy] = useState<string>('created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 15;
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    
    // Bulk selection states
    const [selectedClearances, setSelectedClearances] = useState<number[]>([]);
    const [isBulkMode, setIsBulkMode] = useState<boolean>(false);
    const [isSelectAll, setIsSelectAll] = useState<boolean>(false);
    const [selectionMode, setSelectionMode] = useState<SelectionMode>('page');
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState<boolean>(false);
    const [showBulkStatusDialog, setShowBulkStatusDialog] = useState<boolean>(false);
    const [isPerformingBulkAction, setIsPerformingBulkAction] = useState<boolean>(false);
    const [bulkEditValue, setBulkEditValue] = useState<string>('');

    // Handle window resize
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleResize = () => {
            const width = window.innerWidth;
            setIsMobile(width < 768);
            if (width < 768 && viewMode === 'table') {
                setViewMode('grid');
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, [viewMode]);

    // Flash messages
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter, typeFilter, urgencyFilter, paymentStatusFilter, fromDate, toDate, clearanceNumberFilter, applicantTypeFilter, amountRange]);

    // Reset selection when exiting bulk mode
    useEffect(() => {
        if (!isBulkMode) {
            setSelectedClearances([]);
            setIsSelectAll(false);
        }
    }, [isBulkMode]);

    // Helper function to check amount range
    const checkAmountRange = (amount: number, range: string): boolean => {
        switch (range) {
            case '0-100': return amount >= 0 && amount <= 100;
            case '101-500': return amount >= 101 && amount <= 500;
            case '501-1000': return amount >= 501 && amount <= 1000;
            case '1001-5000': return amount >= 1001 && amount <= 5000;
            case '5000+': return amount >= 5000;
            default: return true;
        }
    };

    // Filter clearances client-side
    const filteredClearances = useMemo(() => {
        if (!allClearances || allClearances.length === 0) {
            return [];
        }
        
        let filtered = [...allClearances];
        
        // Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(clearance => 
                clearance?.reference_number?.toLowerCase().includes(searchLower) ||
                clearance?.clearance_number?.toLowerCase().includes(searchLower) ||
                clearance?.resident?.full_name?.toLowerCase().includes(searchLower) ||
                clearance?.or_number?.toLowerCase().includes(searchLower)
            );
        }
        
        // Status filter
        if (statusFilter) {
            filtered = filtered.filter(clearance => clearance?.status === statusFilter);
        }
        
        // Payment status filter
        if (paymentStatusFilter) {
            filtered = filtered.filter(clearance => clearance?.payment_status === paymentStatusFilter);
        }
        
        // Type filter
        if (typeFilter) {
            filtered = filtered.filter(clearance => clearance?.clearance_type_id?.toString() === typeFilter);
        }
        
        // Urgency filter
        if (urgencyFilter) {
            filtered = filtered.filter(clearance => clearance?.urgency === urgencyFilter);
        }
        
        // Clearance number filter
        if (clearanceNumberFilter) {
            filtered = filtered.filter(clearance => 
                clearance?.clearance_number?.toLowerCase().includes(clearanceNumberFilter.toLowerCase()) ||
                clearance?.reference_number?.toLowerCase().includes(clearanceNumberFilter.toLowerCase())
            );
        }
        
        // Applicant type filter
        if (applicantTypeFilter && applicantTypeFilter !== 'all') {
            filtered = filtered.filter(clearance => {
                switch (applicantTypeFilter) {
                    case 'resident':
                        return clearance?.resident_id !== null;
                    case 'business':
                        return clearance?.business_id !== null;
                    case 'senior':
                        return clearance?.applicant_type === 'senior';
                    case 'pwd':
                        return clearance?.applicant_type === 'pwd';
                    default:
                        return true;
                }
            });
        }
        
        // Amount range filter
        if (amountRange) {
            filtered = filtered.filter(clearance => 
                checkAmountRange(clearance?.fee_amount || 0, amountRange)
            );
        }
        
        // Date range filter
        if (fromDate) {
            filtered = filtered.filter(clearance => clearance?.created_at && clearance.created_at >= fromDate);
        }
        if (toDate) {
            filtered = filtered.filter(clearance => clearance?.created_at && clearance.created_at <= toDate);
        }
        
        // Apply sorting (for table header)
        if (filtered.length > 0) {
            filtered.sort((a, b) => {
                let valueA: any;
                let valueB: any;
                
                switch (sortBy) {
                    case 'reference_number':
                        valueA = a?.reference_number || '';
                        valueB = b?.reference_number || '';
                        break;
                    case 'resident_name':
                        valueA = a?.resident?.full_name || '';
                        valueB = b?.resident?.full_name || '';
                        break;
                    case 'status':
                        valueA = a?.status || '';
                        valueB = b?.status || '';
                        break;
                    case 'payment_status':
                        valueA = a?.payment_status || 'unpaid';
                        valueB = b?.payment_status || 'unpaid';
                        break;
                    case 'fee_amount':
                        valueA = Number(a?.fee_amount) || 0;
                        valueB = Number(b?.fee_amount) || 0;
                        break;
                    case 'amount_paid':
                        valueA = Number(a?.amount_paid) || 0;
                        valueB = Number(b?.amount_paid) || 0;
                        break;
                    case 'urgency':
                        const urgencyOrder: Record<string, number> = { 'normal': 1, 'rush': 2, 'express': 3 };
                        valueA = urgencyOrder[a?.urgency || 'normal'] || 1;
                        valueB = urgencyOrder[b?.urgency || 'normal'] || 1;
                        break;
                    case 'created_at':
                        valueA = a?.created_at ? new Date(a.created_at).getTime() : 0;
                        valueB = b?.created_at ? new Date(b.created_at).getTime() : 0;
                        break;
                    case 'issue_date':
                        valueA = a?.issue_date ? new Date(a.issue_date).getTime() : 0;
                        valueB = b?.issue_date ? new Date(b.issue_date).getTime() : 0;
                        break;
                    default:
                        valueA = a?.created_at ? new Date(a.created_at).getTime() : 0;
                        valueB = b?.created_at ? new Date(b.created_at).getTime() : 0;
                }
                
                if (typeof valueA === 'string') {
                    valueA = valueA.toLowerCase();
                    valueB = valueB.toLowerCase();
                }
                
                if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
                if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
                return 0;
            });
        }
        
        return filtered;
    }, [allClearances, search, statusFilter, typeFilter, urgencyFilter, paymentStatusFilter, fromDate, toDate, clearanceNumberFilter, applicantTypeFilter, amountRange, sortBy, sortOrder]);

    // Calculate filtered stats
    const filteredStats = useMemo(() => {
        if (!filteredClearances || filteredClearances.length === 0) {
            return defaultStats;
        }
        
        const pending = filteredClearances.filter(c => c?.status === 'pending' || c?.status === 'pending_payment').length;
        const processing = filteredClearances.filter(c => c?.status === 'processing').length;
        const approved = filteredClearances.filter(c => c?.status === 'approved' || c?.status === 'issued').length;
        const unpaid = filteredClearances.filter(c => c?.payment_status === 'unpaid').length;
        const partially_paid = filteredClearances.filter(c => c?.payment_status === 'partially_paid').length;
        const paid = filteredClearances.filter(c => c?.payment_status === 'paid').length;
        const totalRevenue = filteredClearances.reduce((sum, c) => sum + (Number(c?.amount_paid) || 0), 0);
        const expressRequests = filteredClearances.filter(c => c?.urgency === 'express').length;
        const rushRequests = filteredClearances.filter(c => c?.urgency === 'rush').length;
        
        return {
            total: filteredClearances.length,
            pending,
            processing,
            approved,
            totalRevenue,
            issuedThisMonth: approved,
            pendingToday: pending,
            expressRequests,
            rushRequests,
            unpaid,
            partially_paid,
            paid,
            pending_payment: pending
        };
    }, [filteredClearances]);

    // Pagination
    const totalItems = filteredClearances.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedClearances = filteredClearances.slice(startIndex, endIndex);

    // Selection handlers
    const handleSelectAllOnPage = () => {
        const pageIds = paginatedClearances.map(clearance => clearance.id);
        if (isSelectAll) {
            setSelectedClearances(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedClearances, ...pageIds])];
            setSelectedClearances(newSelected);
        }
        setIsSelectAll(!isSelectAll);
        setSelectionMode('page');
    };

    const handleSelectAllFiltered = () => {
        const allIds = filteredClearances.map(clearance => clearance.id);
        if (selectedClearances.length === allIds.length && allIds.every(id => selectedClearances.includes(id))) {
            setSelectedClearances(prev => prev.filter(id => !allIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedClearances, ...allIds])];
            setSelectedClearances(newSelected);
            setSelectionMode('filtered');
        }
    };

    const handleSelectAll = () => {
        if (confirm(`This will select ALL ${safeClearances.total || 0} clearance requests. This action may take a moment.`)) {
            const allIds = filteredClearances.map(clearance => clearance.id);
            setSelectedClearances(allIds);
            setSelectionMode('all');
        }
    };

    const handleItemSelect = (id: number) => {
        setSelectedClearances(prev => {
            if (prev.includes(id)) {
                return prev.filter(itemId => itemId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    // Check if all items on current page are selected
    useEffect(() => {
        const allPageIds = paginatedClearances.map(clearance => clearance.id);
        const allSelected = allPageIds.length > 0 && allPageIds.every(id => selectedClearances.includes(id));
        setIsSelectAll(allSelected);
    }, [selectedClearances, paginatedClearances]);

    // Get selected clearances data
    const selectedClearancesData = useMemo(() => {
        return filteredClearances.filter(clearance => selectedClearances.includes(clearance.id));
    }, [selectedClearances, filteredClearances]);

    // Calculate selection stats
    const selectionStats = useMemo(() => {
        if (!selectedClearancesData || selectedClearancesData.length === 0) {
            return {
                total: 0,
                pending: 0,
                processing: 0,
                approved: 0,
                unpaid: 0,
                partially_paid: 0,
                paid: 0,
                totalValue: 0,
                totalPaid: 0
            };
        }
        
        return {
            total: selectedClearancesData.length,
            pending: selectedClearancesData.filter(c => c?.status === 'pending' || c?.status === 'pending_payment').length,
            processing: selectedClearancesData.filter(c => c?.status === 'processing').length,
            approved: selectedClearancesData.filter(c => c?.status === 'approved' || c?.status === 'issued').length,
            unpaid: selectedClearancesData.filter(c => c?.payment_status === 'unpaid').length,
            partially_paid: selectedClearancesData.filter(c => c?.payment_status === 'partially_paid').length,
            paid: selectedClearancesData.filter(c => c?.payment_status === 'paid').length,
            totalValue: selectedClearancesData.reduce((sum, c) => sum + (Number(c?.fee_amount) || 0), 0),
            totalPaid: selectedClearancesData.reduce((sum, c) => sum + (Number(c?.amount_paid) || 0), 0)
        };
    }, [selectedClearancesData]);

    // Handle sort from table header
    const handleSort = (column: string) => {
        const newOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortBy(column);
        setSortOrder(newOrder);
    };

    // Bulk operations
    const handleBulkOperation = async (operation: BulkOperation | string, customData?: any) => {
        if (selectedClearances.length === 0) {
            toast.error('Please select at least one clearance request');
            return;
        }

        setIsPerformingBulkAction(true);

        try {
            switch (operation) {
                case 'process':
                    await router.post('/admin/clearances/bulk-process', {
                        ids: selectedClearances
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            setSelectedClearances([]);
                            toast.success('Clearance requests processed successfully');
                        },
                        onError: () => {
                            toast.error('Failed to process clearance requests');
                        }
                    });
                    break;
                case 'approve':
                    await router.post('/admin/clearances/bulk-approve', {
                        ids: selectedClearances
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            setSelectedClearances([]);
                            toast.success('Clearance requests approved successfully');
                        },
                        onError: () => {
                            toast.error('Failed to approve clearance requests');
                        }
                    });
                    break;
                case 'issue':
                    await router.post('/admin/clearances/bulk-issue', {
                        ids: selectedClearances
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            setSelectedClearances([]);
                            toast.success('Clearance requests issued successfully');
                        },
                        onError: () => {
                            toast.error('Failed to issue clearance requests');
                        }
                    });
                    break;
                case 'delete':
                    if (confirm(`Are you sure you want to delete ${selectedClearances.length} selected clearance request(s)?`)) {
                        await router.post('/admin/clearances/bulk-delete', {
                            ids: selectedClearances
                        }, {
                            preserveScroll: true,
                            onSuccess: () => {
                                setSelectedClearances([]);
                                setShowBulkDeleteDialog(false);
                                toast.success('Clearance requests deleted successfully');
                            },
                            onError: () => {
                                toast.error('Failed to delete clearance requests');
                            }
                        });
                    }
                    break;
                case 'export':
                    // Export logic here
                    break;
                case 'print':
                    selectedClearances.forEach(id => {
                        window.open(`/admin/clearances/${id}/print`, '_blank');
                    });
                    toast.success(`${selectedClearances.length} clearance(s) opened for printing`);
                    break;
                case 'copy_data':
                    // Copy data logic here
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

    // Individual clearance operations
    const handleDelete = (clearance: ClearanceRequest) => {
        if (confirm(`Are you sure you want to cancel request ${clearance?.reference_number}?`)) {
            router.delete(`/admin/clearances/${clearance.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedClearances(selectedClearances.filter(id => id !== clearance.id));
                    toast.success('Clearance request cancelled');
                },
                onError: () => {
                    toast.error('Failed to cancel clearance request');
                }
            });
        }
    };

    const handleViewPhoto = (clearance: ClearanceRequest) => {
        toast.info('Photo viewer would open here');
    };

    const handleClearFilters = () => {
        setSearch('');
        setStatusFilter('');
        setTypeFilter('');
        setUrgencyFilter('');
        setPaymentStatusFilter('');
        setFromDate('');
        setToDate('');
        setClearanceNumberFilter('');
        setApplicantTypeFilter('all');
        setAmountRange('');
        setDateRangePreset('');
        setSortBy('created_at');
        setSortOrder('desc');
        setCurrentPage(1);
    };

    const handleClearSelection = () => {
        setSelectedClearances([]);
        setIsSelectAll(false);
    };

    const handleCopySelectedData = () => {
        handleBulkOperation('copy_data');
    };

    const updateFilter = (key: string, value: string) => {
        switch (key) {
            case 'status':
                setStatusFilter(value);
                break;
            case 'type':
                setTypeFilter(value);
                break;
            case 'urgency':
                setUrgencyFilter(value);
                break;
            case 'payment_status':
                setPaymentStatusFilter(value);
                break;
            case 'from_date':
                setFromDate(value);
                break;
            case 'to_date':
                setToDate(value);
                break;
        }
    };

    const hasActiveFilters = Boolean(
        search || 
        statusFilter || 
        typeFilter || 
        urgencyFilter ||
        paymentStatusFilter ||
        fromDate ||
        toDate ||
        clearanceNumberFilter ||
        applicantTypeFilter !== 'all' ||
        amountRange
    );

    // Create filters object for the Filters component (removed sort fields)
    const filtersStateForComponent = {
        status: statusFilter,
        type: typeFilter,
        urgency: urgencyFilter,
        payment_status: paymentStatusFilter,
        from_date: fromDate,
        to_date: toDate
    };

    const handleRecordPayment = (clearance: ClearanceRequest) => {
    // Helper function to safely get string value
    const getSafeStringValue = (value: any, defaultValue: string = ''): string => {
        if (value === null || value === undefined) return defaultValue;
        if (typeof value === 'string') return value;
        if (typeof value === 'boolean') return value ? 'true' : 'false';
        if (typeof value === 'number') return String(value);
        return defaultValue;
    };

        const params: Record<string, string> = {
            clearance_request_id: clearance.id.toString(),
            payer_type: getSafeStringValue(clearance.payer_type, 'resident'),
            payer_id: getSafeStringValue(clearance.payer_id?.toString() || clearance.resident_id?.toString() || ''),
            payer_name: clearance.resident?.full_name || 'Unknown',
            contact_number: getSafeStringValue(clearance.contact_number, getSafeStringValue(clearance.resident?.contact_number, '')),
            address: getSafeStringValue(clearance.contact_address, getSafeStringValue(clearance.resident?.address, '')),
            clearance_type: clearance.clearance_type?.name || 'Clearance',
            clearance_type_id: clearance.clearance_type_id?.toString() || '',
            purpose: clearance.purpose || '',
            fee_amount: (clearance.fee_amount || 0).toString(),
            balance: ((clearance.balance ?? clearance.fee_amount) || 0).toString(),
            source: 'clearance',
            from_clearance: 'true',
            fee_code: clearance.clearance_type?.code || `CLR-${clearance.id}`,
            _t: Date.now().toString()
        };

        const filteredParams = Object.fromEntries(
            Object.entries(params).filter(([_, value]) => value !== '')
        );

        const url = `/payments/payments/create?${new URLSearchParams(filteredParams).toString()}`;
        window.location.href = url;
    };

    // Keyboard shortcuts
    useEffect(() => {
        if (isMobile) return;
        
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'a' && isBulkMode) {
                e.preventDefault();
                if (e.shiftKey) {
                    handleSelectAllFiltered();
                } else {
                    handleSelectAllOnPage();
                }
            }
            if (e.key === 'Escape') {
                if (isBulkMode) {
                    if (selectedClearances.length > 0) {
                        setSelectedClearances([]);
                    } else {
                        setIsBulkMode(false);
                    }
                }
            }
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'B') {
                e.preventDefault();
                setIsBulkMode(!isBulkMode);
            }
            if (e.key === 'Delete' && isBulkMode && selectedClearances.length > 0) {
                e.preventDefault();
                setShowBulkDeleteDialog(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isBulkMode, selectedClearances, isMobile]);

    return (
        <AppLayout
            title="Clearance Requests"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Clearances', href: '/admin/clearances' }
            ]}
        >
            <TooltipProvider>
                <div className="space-y-6">
                    {/* Header - Matching ResidentsHeader and AnnouncementsHeader style */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                Clearance Requests
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Manage and process barangay clearance requests
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setIsBulkMode(!isBulkMode)}
                                className={isBulkMode ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300' : ''}
                            >
                                {isBulkMode ? (
                                    <>
                                        <KeyRound className="h-4 w-4 mr-2" />
                                        Bulk Mode Active ({selectedClearances.length})
                                    </>
                                ) : (
                                    <>
                                        <KeyRound className="h-4 w-4 mr-2" />
                                        Bulk Select
                                    </>
                                )}
                            </Button>
                            <Button asChild>
                                <a href="/admin/clearances/create">
                                    <Plus className="h-4 w-4 mr-2" />
                                    New Request
                                </a>
                            </Button>
                        </div>
                    </div>

                    <ClearancesStats stats={filteredStats} />

                    <ClearancesFilters
                        search={search}
                        setSearch={setSearch}
                        filtersState={filtersStateForComponent}
                        updateFilter={updateFilter}
                        handleClearFilters={handleClearFilters}
                        hasActiveFilters={hasActiveFilters}
                        clearanceTypes={safeClearanceTypes}
                        statusOptions={safeStatusOptions}
                        paymentStatusOptions={safePaymentStatusOptions}
                        startIndex={startIndex}
                        endIndex={endIndex}
                        totalItems={totalItems}
                        totalFilteredItems={totalItems}
                        isBulkMode={isBulkMode}
                        selectionMode={selectionMode}
                        selectedCount={selectedClearances.length}
                        onClearSelection={handleClearSelection}
                        onSelectAllPage={handleSelectAllOnPage}
                        onSelectAllFiltered={handleSelectAllFiltered}
                        onSelectAll={handleSelectAll}
                        isLoading={isPerformingBulkAction}
                        // ✅ Advanced filters props
                        showAdvancedFilters={showAdvancedFilters}
                        setShowAdvancedFilters={setShowAdvancedFilters}
                        dateRangePreset={dateRangePreset}
                        setDateRangePreset={setDateRangePreset}
                        clearanceNumberFilter={clearanceNumberFilter}
                        setClearanceNumberFilter={setClearanceNumberFilter}
                        applicantTypeFilter={applicantTypeFilter}
                        setApplicantTypeFilter={setApplicantTypeFilter}
                        amountRange={amountRange}
                        setAmountRange={setAmountRange}
                    />

                    <ClearancesContent
                        clearances={paginatedClearances}
                        totalItems={totalItems}
                        stats={filteredStats}
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isSelectAll={isSelectAll}
                        selectedClearances={selectedClearances}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        isMobile={isMobile}
                        hasActiveFilters={hasActiveFilters}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        onSelectAllOnPage={handleSelectAllOnPage}
                        onSelectAllFiltered={handleSelectAllFiltered}
                        onSelectAll={handleSelectAll}
                        onItemSelect={handleItemSelect}
                        onClearFilters={handleClearFilters}
                        onClearSelection={handleClearSelection}
                        onDelete={handleDelete}
                        onViewPhoto={handleViewPhoto}
                        onSort={handleSort}
                        onBulkOperation={handleBulkOperation}
                        onCopySelectedData={handleCopySelectedData}
                        setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                        filtersState={filtersStateForComponent}
                        handleRecordPayment={handleRecordPayment}
                        isLoading={false}
                        clearanceTypes={safeClearanceTypes}
                        statusOptions={safeStatusOptions}
                        isPerformingBulkAction={isPerformingBulkAction}
                        selectionMode={selectionMode}
                        selectionStats={selectionStats}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSortChange={() => {}}
                        getCurrentSortValue={() => `${sortBy}-${sortOrder}`}
                    />

                    {/* Keyboard Shortcuts Help */}
                    {isBulkMode && !isMobile && (
                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border">
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

            <ClearancesDialogs
                showBulkDeleteDialog={showBulkDeleteDialog}
                setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                showBulkStatusDialog={showBulkStatusDialog}
                setShowBulkStatusDialog={setShowBulkStatusDialog}
                isPerformingBulkAction={isPerformingBulkAction}
                selectedClearances={selectedClearances}
                handleBulkOperation={handleBulkOperation}
                selectionStats={selectionStats}
                bulkEditValue={bulkEditValue}
                setBulkEditValue={setBulkEditValue}
                statusOptions={safeStatusOptions}
            />
        </AppLayout>
    );
}