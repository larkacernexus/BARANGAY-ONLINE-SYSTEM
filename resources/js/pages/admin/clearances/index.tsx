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
    SelectionMode,
    ClearanceStatus,
    PaymentStatus
} from '@/types/admin/clearances/clearance-types';
import { TooltipProvider } from '@/components/ui/tooltip';

// Import reusable components
import ClearancesHeader from '@/components/admin/clearances/ClearancesHeader';
import ClearancesStats from '@/components/admin/clearances/ClearancesStats';
import ClearancesFilters from '@/components/admin/clearances/ClearancesFilters';
import ClearancesContent from '@/components/admin/clearances/ClearancesContent';
import ClearancesDialogs from '@/components/admin/clearances/ClearancesDialogs';
import { Button } from '@/components/ui/button';
import { KeyRound } from 'lucide-react';

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

export default function ClearancesIndex({ 
    clearances, 
    filters, 
    clearanceTypes, 
    statusOptions,
    paymentStatusOptions,
    stats 
}: ClearancesPageProps) {
    const { flash } = usePage().props as any;
    
    // Safe destructuring with defaults
    const safeClearances = clearances || defaultPaginationData;
    const safeFilters = filters || {};
    const safeClearanceTypes = clearanceTypes || [];
    const safeStatusOptions = statusOptions || [];
    const safePaymentStatusOptions = paymentStatusOptions || [];
    const safeStats = stats || defaultStats;
    
    // State management
    const [search, setSearch] = useState(safeFilters.search || '');
    const [filtersState, setFiltersState] = useState<Filters>({
        status: safeFilters.status || '',
        type: safeFilters.type || '',
        urgency: safeFilters.urgency || '',
        payment_status: safeFilters.payment_status || '',
        sort: safeFilters.sort || 'created_at',
        direction: safeFilters.direction || 'desc'
    });
    const [currentPage, setCurrentPage] = useState(safeClearances.current_page || 1);
    const itemsPerPage = safeClearances.per_page || 15;
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    
    // Bulk selection states
    const [selectedClearances, setSelectedClearances] = useState<number[]>([]);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [isSelectAll, setIsSelectAll] = useState(false);
    const [selectionMode, setSelectionMode] = useState<SelectionMode>('page');
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
    const [showBulkStatusDialog, setShowBulkStatusDialog] = useState(false);
    const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false);
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

    // Auto switch to grid view on mobile
    useEffect(() => {
        if (typeof window !== 'undefined' && window.innerWidth < 768 && viewMode === 'table') {
            setViewMode('grid');
        }
    }, []);

    // Flash messages
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // Handle search change - immediate navigation without debounce
    const handleSearchChange = (value: string) => {
        setSearch(value);
        
        const params = {
            ...filtersState,
            search: value
        };
        
        // Clean up empty values
        Object.keys(params).forEach(key => {
            if (!params[key as keyof typeof params]) {
                delete params[key as keyof typeof params];
            }
        });
        
        router.get('/admin/clearances', params, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };

    // Filter clearances client-side
    const filteredClearances = useMemo(() => {
        return safeClearances.data.filter(clearance => {
            // Search filter
            const searchMatch = !search || 
                clearance.reference_number?.toLowerCase().includes(search.toLowerCase()) ||
                clearance.clearance_number?.toLowerCase().includes(search.toLowerCase()) ||
                clearance.resident?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
                clearance.or_number?.toLowerCase().includes(search.toLowerCase());
            
            // Status filter
            const statusMatch = !filtersState.status || clearance.status === filtersState.status;
            
            // Payment status filter
            const paymentStatusMatch = !filtersState.payment_status || clearance.payment_status === filtersState.payment_status;
            
            // Type filter
            const typeMatch = !filtersState.type || clearance.clearance_type_id?.toString() === filtersState.type;
            
            // Urgency filter
            const urgencyMatch = !filtersState.urgency || clearance.urgency === filtersState.urgency;
            
            return searchMatch && statusMatch && paymentStatusMatch && typeMatch && urgencyMatch;
        });
    }, [safeClearances.data, search, filtersState]);

    // Sort filtered clearances
    const sortedClearances = useMemo(() => {
        const sorted = [...filteredClearances];
        const sortBy = filtersState.sort || 'created_at';
        const direction = filtersState.direction || 'desc';
        
        sorted.sort((a, b) => {
            let aValue: any, bValue: any;
            
            switch (sortBy) {
                case 'reference_number':
                    aValue = a.reference_number?.toLowerCase() || '';
                    bValue = b.reference_number?.toLowerCase() || '';
                    break;
                case 'resident_name':
                    aValue = a.resident?.full_name?.toLowerCase() || '';
                    bValue = b.resident?.full_name?.toLowerCase() || '';
                    break;
                case 'status':
                    aValue = a.status;
                    bValue = b.status;
                    break;
                case 'payment_status':
                    aValue = a.payment_status || 'unpaid';
                    bValue = b.payment_status || 'unpaid';
                    break;
                case 'fee_amount':
                    aValue = Number(a.fee_amount) || 0;
                    bValue = Number(b.fee_amount) || 0;
                    break;
                case 'amount_paid':
                    aValue = Number(a.amount_paid) || 0;
                    bValue = Number(b.amount_paid) || 0;
                    break;
                case 'created_at':
                    aValue = new Date(a.created_at).getTime();
                    bValue = new Date(b.created_at).getTime();
                    break;
                case 'issue_date':
                    aValue = a.issue_date ? new Date(a.issue_date).getTime() : 0;
                    bValue = b.issue_date ? new Date(b.issue_date).getTime() : 0;
                    break;
                default:
                    aValue = new Date(a.created_at).getTime();
                    bValue = new Date(b.created_at).getTime();
            }

            if (direction === 'asc') {
                return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
            } else {
                return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
            }
        });

        return sorted;
    }, [filteredClearances, filtersState]);

    // Pagination
    const totalItems = sortedClearances.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedClearances = sortedClearances.slice(startIndex, endIndex);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, filtersState]);

    // Reset selection when exiting bulk mode
    useEffect(() => {
        if (!isBulkMode) {
            setSelectedClearances([]);
            setIsSelectAll(false);
        }
    }, [isBulkMode]);

    // Keyboard shortcuts
    useEffect(() => {
        if (isMobile) return;
        
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl/Cmd + A to select all
            if ((e.ctrlKey || e.metaKey) && e.key === 'a' && isBulkMode) {
                e.preventDefault();
                if (e.shiftKey) {
                    handleSelectAllFiltered();
                } else {
                    handleSelectAllOnPage();
                }
            }
            // Escape key
            if (e.key === 'Escape') {
                if (isBulkMode) {
                    if (selectedClearances.length > 0) {
                        setSelectedClearances([]);
                    } else {
                        setIsBulkMode(false);
                    }
                }
            }
            // Ctrl/Cmd + Shift + B to toggle bulk mode
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'B') {
                e.preventDefault();
                setIsBulkMode(!isBulkMode);
            }
            // Delete key for bulk delete
            if (e.key === 'Delete' && isBulkMode && selectedClearances.length > 0) {
                e.preventDefault();
                setShowBulkDeleteDialog(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isBulkMode, selectedClearances, isMobile]);

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
        const allIds = sortedClearances.map(clearance => clearance.id);
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
            const pageIds = paginatedClearances.map(clearance => clearance.id);
            setSelectedClearances(pageIds);
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
        const allSelected = allPageIds.every(id => selectedClearances.includes(id));
        setIsSelectAll(allSelected);
    }, [selectedClearances, paginatedClearances]);

    // Get selected clearances data
    const selectedClearancesData = useMemo(() => {
        return sortedClearances.filter(clearance => selectedClearances.includes(clearance.id));
    }, [selectedClearances, sortedClearances]);

    // Calculate selection stats
    const selectionStats = useMemo(() => {
        return {
            total: selectedClearancesData.length,
            pending: selectedClearancesData.filter(c => c.status === 'pending' || c.status === 'pending_payment').length,
            processing: selectedClearancesData.filter(c => c.status === 'processing').length,
            approved: selectedClearancesData.filter(c => c.status === 'approved' || c.status === 'issued').length,
            unpaid: selectedClearancesData.filter(c => c.payment_status === 'unpaid').length,
            partially_paid: selectedClearancesData.filter(c => c.payment_status === 'partially_paid').length,
            paid: selectedClearancesData.filter(c => c.payment_status === 'paid').length,
            totalValue: selectedClearancesData.reduce((sum, c) => sum + (Number(c.fee_amount) || 0), 0),
            totalPaid: selectedClearancesData.reduce((sum, c) => sum + (Number(c.amount_paid) || 0), 0)
        };
    }, [selectedClearancesData]);

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
                            setShowBulkDeleteDialog(false);
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
                    // Export to CSV
                    const selectedData = selectedClearancesData.map(clearance => ({
                        'Reference Number': clearance.reference_number,
                        'Clearance Number': clearance.clearance_number || '',
                        'Resident Name': clearance.resident?.full_name || '',
                        'Clearance Type': clearance.clearance_type?.name || '',
                        'Purpose': clearance.purpose,
                        'Fee Amount': clearance.fee_amount,
                        'Amount Paid': clearance.amount_paid || 0,
                        'Balance': clearance.balance || clearance.fee_amount,
                        'Payment Status': clearance.payment_status || 'unpaid',
                        'Urgency': clearance.urgency,
                        'Status': clearance.status,
                        'Issue Date': clearance.issue_date || '',
                        'Valid Until': clearance.valid_until || '',
                        'Created At': clearance.created_at,
                        'Issuing Officer': clearance.issuing_officer_name || '',
                    }));
                    
                    if (selectedData.length === 0) {
                        toast.error('No data to export');
                        break;
                    }
                    
                    const headers = Object.keys(selectedData[0]);
                    const csv = [
                        headers.join(','),
                        ...selectedData.map(row => 
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
                    a.download = `clearances-export-${new Date().toISOString().split('T')[0]}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                    
                    toast.success('Export completed successfully');
                    break;

                case 'print':
                    selectedClearances.forEach(id => {
                        window.open(`/admin/clearances/${id}/print`, '_blank');
                    });
                    toast.success(`${selectedClearances.length} clearance(s) opened for printing`);
                    break;

                case 'update_status':
                    if (bulkEditValue) {
                        await router.post('/admin/clearances/bulk-update-status', {
                            ids: selectedClearances,
                            status: bulkEditValue
                        }, {
                            preserveScroll: true,
                            onSuccess: () => {
                                setSelectedClearances([]);
                                setBulkEditValue('');
                                setShowBulkStatusDialog(false);
                                toast.success('Status updated successfully');
                            },
                            onError: () => {
                                toast.error('Failed to update status');
                            }
                        });
                    }
                    break;

                case 'copy_data':
                    // Copy selected data to clipboard
                    const selectedDataForCopy = selectedClearancesData.map(clearance => ({
                        'Reference': clearance.reference_number,
                        'Name': clearance.resident?.full_name || 'N/A',
                        'Type': clearance.clearance_type?.name || 'N/A',
                        'Status': clearance.status,
                        'Payment': clearance.payment_status || 'unpaid',
                        'Amount': clearance.fee_amount,
                        'Paid': clearance.amount_paid || 0,
                        'Purpose': clearance.purpose,
                        'Urgency': clearance.urgency
                    }));
                    
                    if (selectedDataForCopy.length === 0) {
                        toast.error('No data to copy');
                        break;
                    }
                    
                    const csvForCopy = [
                        Object.keys(selectedDataForCopy[0]).join(','),
                        ...selectedDataForCopy.map(row => Object.values(row).join(','))
                    ].join('\n');
                    
                    navigator.clipboard.writeText(csvForCopy).then(() => {
                        toast.success('Data copied to clipboard');
                    }).catch(() => {
                        toast.error('Failed to copy to clipboard');
                    });
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
        if (confirm(`Are you sure you want to cancel request ${clearance.reference_number}?`)) {
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

    const handleSort = (column: string) => {
        setFiltersState(prev => ({
            ...prev,
            sort: column,
            direction: prev.sort === column && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleClearFilters = () => {
        setSearch('');
        setFiltersState({
            status: '',
            type: '',
            urgency: '',
            payment_status: '',
            sort: 'created_at',
            direction: 'desc'
        });
    };

    const handleClearSelection = () => {
        setSelectedClearances([]);
        setIsSelectAll(false);
    };

    const handleCopySelectedData = () => {
        handleBulkOperation('copy_data');
    };

    const updateFilter = (key: keyof Filters, value: string) => {
        setFiltersState(prev => ({ ...prev, [key]: value }));
    };

    const hasActiveFilters = 
        search || 
        filtersState.status || 
        filtersState.type || 
        filtersState.urgency ||
        filtersState.payment_status;

    // ===== REVISED: Handle Record Payment Click with enhanced debugging =====
    const handleRecordPayment = (clearance: ClearanceRequest) => {
        console.log('=== RECORD PAYMENT CLICKED ===');
        console.log('Clearance:', {
            id: clearance.id,
            reference: clearance.reference_number,
            fee_amount: clearance.fee_amount,
            status: clearance.status,
            payment_status: clearance.payment_status,
            payer_type: clearance.payer_type,
            resident: clearance.resident?.full_name
        });

        // Helper function to safely get string values
        const safeString = (value: any): string => {
            if (value === null || value === undefined) return '';
            if (typeof value === 'boolean') return '';
            if (typeof value === 'object') return '';
            return String(value);
        };

        // Helper to get contact number safely
        const getContactNumber = (): string => {
            if (clearance.contact_number && typeof clearance.contact_number === 'string') {
                return clearance.contact_number;
            }
            if (clearance.resident?.contact_number && typeof clearance.resident.contact_number === 'string') {
                return clearance.resident.contact_number;
            }
            return '';
        };

        // Helper to get address safely
        const getAddress = (): string => {
            if (clearance.contact_address && typeof clearance.contact_address === 'string') {
                return clearance.contact_address;
            }
            if (clearance.resident?.address && typeof clearance.resident.address === 'string') {
                return clearance.resident.address;
            }
            return '';
        };

        // Helper to get purok safely
        const getPurok = (): string => {
            if (clearance.contact_purok && typeof clearance.contact_purok === 'string') {
                return clearance.contact_purok;
            }
            if (clearance.resident?.purok && typeof clearance.resident.purok === 'string') {
                return clearance.resident.purok;
            }
            return '';
        };

        // Helper to get business name safely
        const getBusinessName = (): string => {
            if (clearance.business && typeof clearance.business === 'object') {
                const business = clearance.business as any;
                if (business && business.business_name && typeof business.business_name === 'string') {
                    return business.business_name;
                }
            }
            return '';
        };

        // Helper to get household name safely
        const getHouseholdName = (): string => {
            if (clearance.household && typeof clearance.household === 'object') {
                const household = clearance.household as any;
                if (household && household.head_name && typeof household.head_name === 'string') {
                    return household.head_name;
                }
                if (household && household.household_number) {
                    return `Household ${household.household_number}`;
                }
            }
            return '';
        };

        // Helper to get payer name
        const getPayerName = (): string => {
            if (clearance.payer_name && typeof clearance.payer_name === 'string') {
                return clearance.payer_name;
            }
            
            if (clearance.payer_type === 'resident' && clearance.resident) {
                if (clearance.resident.full_name && typeof clearance.resident.full_name === 'string') {
                    return clearance.resident.full_name;
                }
                if (clearance.resident.first_name || clearance.resident.last_name) {
                    const firstName = typeof clearance.resident.first_name === 'string' ? clearance.resident.first_name : '';
                    const lastName = typeof clearance.resident.last_name === 'string' ? clearance.resident.last_name : '';
                    return `${firstName} ${lastName}`.trim();
                }
            }
            
            if (clearance.payer_type === 'household') {
                const householdName = getHouseholdName();
                if (householdName) return householdName;
            }
            
            if (clearance.payer_type === 'business') {
                const businessName = getBusinessName();
                if (businessName) return businessName;
            }
            
            return clearance.resident?.full_name || 'Unknown';
        };

        // Build parameters - FOCUS ON CLEARANCE_REQUEST_ID
        const params: Record<string, string> = {
            // PRIMARY IDENTIFIER - use this to load the clearance
            clearance_request_id: clearance.id.toString(),
            
            // Payer info (for display)
            payer_type: clearance.payer_type || 'resident',
            payer_id: safeString(clearance.payer_id || clearance.resident_id || ''),
            payer_name: getPayerName(),
            
            // Contact info
            contact_number: getContactNumber(),
            address: getAddress(),
            purok: getPurok(),
            
            // Clearance details
            clearance_type: clearance.clearance_type?.name || 'Clearance',
            clearance_type_id: clearance.clearance_type_id?.toString() || '',
            purpose: clearance.purpose || '',
            fee_amount: (clearance.fee_amount || 0).toString(),
            balance: ((clearance.balance ?? clearance.fee_amount) || 0).toString(),
            
            // Explicitly set source to avoid confusion with garbage fees
            source: 'clearance',
            from_clearance: 'true',
            
            // Optional: include fee_code but as a descriptive field only
            fee_code: clearance.clearance_type?.code || `CLR-${clearance.id}`,
            
            // Timestamp to prevent caching
            _t: Date.now().toString()
        };

        // Filter out empty values
        const filteredParams = Object.fromEntries(
            Object.entries(params).filter(([_, value]) => value !== '')
        );

        // Use the correct URL path: /payments/payments/create
        const url = `/payments/payments/create?${new URLSearchParams(filteredParams).toString()}`;
        
        console.log('Final Payment URL:', url);
        console.log('Navigating to:', url);
        
        // Show loading toast
        toast.info('Redirecting to payment page...');
        
        // Try both methods to ensure navigation
        try {
            // Method 1: Direct window.location
            window.location.href = url;
            
            // Method 2: Fallback with setTimeout
            setTimeout(() => {
                console.log('Fallback navigation...');
                if (window.location.href === url) {
                    console.log('Already at target URL');
                } else {
                    window.location.replace(url);
                }
            }, 500);
        } catch (error) {
            console.error('Navigation error:', error);
            toast.error('Failed to navigate to payment page');
        }
    };

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
                    <ClearancesHeader 
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isMobile={isMobile}
                    />

                    <ClearancesStats stats={safeStats} />

                    <ClearancesFilters
                        search={search}
                        setSearch={handleSearchChange}
                        filtersState={filtersState}
                        updateFilter={updateFilter}
                        handleClearFilters={handleClearFilters}
                        hasActiveFilters={hasActiveFilters}
                        clearanceTypes={safeClearanceTypes}
                        statusOptions={safeStatusOptions}
                        paymentStatusOptions={safePaymentStatusOptions}
                        startIndex={startIndex}
                        endIndex={endIndex}
                        totalItems={totalItems}
                        isBulkMode={isBulkMode}
                        selectionMode={selectionMode}
                        selectedCount={selectedClearances.length}
                        onClearSelection={handleClearSelection}
                        onSelectAllPage={handleSelectAllOnPage}
                        onSelectAllFiltered={handleSelectAllFiltered}
                        onSelectAll={handleSelectAll}
                    />

                    <ClearancesContent
                        clearances={paginatedClearances}
                        totalItems={totalItems}
                        stats={safeStats}
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
                        filtersState={filtersState}
                        handleRecordPayment={handleRecordPayment}
                        isLoading={false}
                        clearanceTypes={safeClearanceTypes}
                        statusOptions={safeStatusOptions}
                        isPerformingBulkAction={isPerformingBulkAction}
                        selectionMode={selectionMode}
                        selectionStats={selectionStats}
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