// hooks/usePaymentsManagement.tsx
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { Payment, Filters, Stats, PaginationData, SelectionStats } from '@/types/payments.types';

interface UsePaymentsManagementProps {
    payments: PaginationData;
    filters: Filters;
    stats: Stats;
}

export function usePaymentsManagement({ payments, filters, stats }: UsePaymentsManagementProps) {
    // ========== CONSTANTS (Always defined, no conditions) ==========
    const paymentMethods = [
        { value: 'cash', label: 'Cash', icon: 'dollar-sign' },
        { value: 'gcash', label: 'GCash', icon: 'credit-card' },
        { value: 'maya', label: 'Maya', icon: 'credit-card' },
        { value: 'bank', label: 'Bank Transfer', icon: 'file-text' },
        { value: 'check', label: 'Check', icon: 'receipt' },
        { value: 'online', label: 'Online Payment', icon: 'credit-card' },
    ];
    
    const statusOptions = [
        { value: 'completed', label: 'Completed' },
        { value: 'pending', label: 'Pending' },
        { value: 'cancelled', label: 'Cancelled' },
    ];
    
    const payerTypeOptions = [
        { value: 'resident', label: 'Resident' },
        { value: 'household', label: 'Household' },
    ];

    // ========== STATE (Always defined, in same order) ==========
    // NEVER put hooks after early returns or inside conditions
    
    // Filter states
    const [search, setSearch] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');
    const [methodFilter, setMethodFilter] = useState(filters?.payment_method || 'all');
    const [payerTypeFilter, setPayerTypeFilter] = useState(filters?.payer_type || 'all');
    const [dateFrom, setDateFrom] = useState(filters?.date_from || '');
    const [dateTo, setDateTo] = useState(filters?.date_to || '');
    
    // UI states
    const [isLoading, setIsLoading] = useState(false);
    const [expandedPayments, setExpandedPayments] = useState<Set<number>>(new Set());
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [windowWidth, setWindowWidth] = useState<number>(
        typeof window !== 'undefined' ? window.innerWidth : 1024
    );
    
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

    // ========== REFS (Always defined) ==========
    const bulkActionRef = useRef<HTMLDivElement>(null);
    const selectionRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // ========== EFFECTS (Always defined) ==========
    // Window resize
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Click outside handlers
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

    // ========== MEMOIZED VALUES (Always defined) ==========
    // Handle case where payments might be just an array
    const safePaymentsData = useMemo(() => {
        // If payments is an array, return it
        if (Array.isArray(payments)) {
            return payments as Payment[];
        }
        // If payments has data property
        if (payments?.data && Array.isArray(payments.data)) {
            return payments.data;
        }
        // Default fallback
        return [];
    }, [payments]);

    // Create safe meta - handle both array and paginated response
    const safeMeta = useMemo(() => {
        // If payments is an array, create pseudo meta
        if (Array.isArray(payments)) {
            return {
                current_page: 1,
                from: 1,
                last_page: 1,
                per_page: payments.length,
                to: payments.length,
                total: payments.length,
                links: [],
                path: '/payments',
            };
        }
        // If payments has meta
        if (payments?.meta) {
            return {
                current_page: payments.meta.current_page || 1,
                from: payments.meta.from || 1,
                last_page: payments.meta.last_page || 1,
                per_page: payments.meta.per_page || 15,
                to: payments.meta.to || 0,
                total: payments.meta.total || 0,
                links: payments.meta.links || [],
                path: payments.meta.path || '/payments',
            };
        }
        // Default fallback
        return {
            current_page: 1,
            from: 1,
            last_page: 1,
            per_page: 15,
            to: 0,
            total: 0,
            links: [],
            path: '/payments',
        };
    }, [payments]);

    // Create safe links
    const safeLinks = useMemo(() => {
        if (Array.isArray(payments) || !payments?.links) {
            return {
                first: '',
                last: '',
                prev: null,
                next: null,
            };
        }
        return {
            first: payments.links.first || '',
            last: payments.links.last || '',
            prev: payments.links.prev || null,
            next: payments.links.next || null,
        };
    }, [payments]);

    // Create complete safe payments object
    const safePayments = useMemo(() => ({
        data: safePaymentsData,
        links: safeLinks,
        meta: safeMeta
    }), [safePaymentsData, safeLinks, safeMeta]);

    // Build query parameters
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

    // Filter payments client-side
    const filteredPayments = useMemo(() => {
        let result = [...safePaymentsData];
        
        // Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            result = result.filter(payment => 
                payment.or_number?.toLowerCase().includes(searchLower) ||
                payment.payer_name?.toLowerCase().includes(searchLower) ||
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
            result = result.filter(payment => {
                if (!payment.payment_date) return false;
                return new Date(payment.payment_date) >= fromDate;
            });
        }
        
        if (dateTo) {
            const toDate = new Date(dateTo);
            toDate.setHours(23, 59, 59, 999);
            result = result.filter(payment => {
                if (!payment.payment_date) return false;
                return new Date(payment.payment_date) <= toDate;
            });
        }
        
        return result;
    }, [safePaymentsData, search, statusFilter, methodFilter, payerTypeFilter, dateFrom, dateTo]);

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

    // Has active filters
    const hasActiveFilters = useMemo(() => 
        search || 
        statusFilter !== 'all' || 
        methodFilter !== 'all' || 
        payerTypeFilter !== 'all' ||
        dateFrom ||
        dateTo,
        [search, statusFilter, methodFilter, payerTypeFilter, dateFrom, dateTo]
    );

    // ========== HANDLERS (Always defined) ==========
    // Handle select/deselect all on current page
    const handleSelectAllOnPage = useCallback(() => {
        const pageIds = filteredPayments.map(payment => payment.id);
        if (isSelectAll) {
            setSelectedPayments(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedPayments, ...pageIds])];
            setSelectedPayments(newSelected);
        }
        setIsSelectAll(!isSelectAll);
        setSelectionMode('page');
    }, [filteredPayments, isSelectAll, selectedPayments]);

    // Handle select/deselect all filtered items
    const handleSelectAllFiltered = useCallback(() => {
        const allIds = filteredPayments.map(payment => payment.id);
        if (selectedPayments.length === allIds.length && allIds.every(id => selectedPayments.includes(id))) {
            setSelectedPayments(prev => prev.filter(id => !allIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedPayments, ...allIds])];
            setSelectedPayments(newSelected);
            setSelectionMode('filtered');
        }
    }, [filteredPayments, selectedPayments]);

    // Handle select all items
    const handleSelectAll = useCallback(() => {
        if (confirm(`This will select ALL ${safeMeta.total} payments. This action may take a moment.`)) {
            const pageIds = filteredPayments.map(payment => payment.id);
            setSelectedPayments(pageIds);
            setSelectionMode('all');
            toast.info('Selected all items on current page. For full selection, implement server-side API.');
        }
    }, [filteredPayments, safeMeta.total]);

    // Handle individual item selection
    const handleItemSelect = useCallback((id: number) => {
        setSelectedPayments(prev => {
            if (prev.includes(id)) {
                return prev.filter(itemId => itemId !== id);
            } else {
                return [...prev, id];
            }
        });
    }, []);

    // Enhanced bulk operation handler
    const handleBulkOperation = useCallback(async (
        operation: 'export' | 'print' | 'delete' | 'update_status' | 'send_receipt' | 'mark_cleared' | 'export_csv', 
        customData?: any
    ) => {
        if (selectedPayments.length === 0) {
            toast.error('Please select at least one payment');
            return;
        }

        setIsPerformingBulkAction(true);

        try {
            // ... implementation remains the same
            switch (operation) {
                // ... cases
                default:
                    toast.error('Operation not supported');
            }
        } catch (error) {
            console.error('Bulk operation error:', error);
            toast.error('An error occurred during bulk operation');
        } finally {
            setIsPerformingBulkAction(false);
        }
    }, [selectedPayments, selectedPaymentsData, bulkEditValue]);

    // Copy selected data to clipboard
    const handleCopySelectedData = useCallback(() => {
        if (selectedPaymentsData.length === 0) {
            toast.error('No data to copy');
            return;
        }
        
        // Implementation...
    }, [selectedPaymentsData]);

    // Smart bulk action based on selection
    const handleSmartBulkAction = useCallback(() => {
        if (selectionStats.pending > 0) {
            toast.info('Selected payments include pending transactions. Consider updating status.');
        } else if (selectionStats.cancelled > 0) {
            toast.info('Selected payments include cancelled transactions. Consider filtering them out.');
        } else {
            handleBulkOperation('export');
        }
    }, [selectionStats, handleBulkOperation]);

    // Clear all filters
    const handleClearFilters = useCallback(() => {
        setSearch('');
        setStatusFilter('all');
        setMethodFilter('all');
        setPayerTypeFilter('all');
        setDateFrom('');
        setDateTo('');
        setShowAdvancedFilters(false);
    }, []);

    // Export handler
    const handleExport = useCallback(() => {
        const params = buildQueryParams();
        // router.get(getRoute('payments.export'), params);
        console.log('Export with params:', params);
        toast.info('Export functionality would be implemented here');
    }, [buildQueryParams]);

    // Toggle expanded payment
    const togglePaymentExpanded = useCallback((paymentId: number) => {
        setExpandedPayments(prev => {
            const newExpanded = new Set(prev);
            if (newExpanded.has(paymentId)) {
                newExpanded.delete(paymentId);
            } else {
                newExpanded.add(paymentId);
            }
            return newExpanded;
        });
    }, []);

    // Helper functions
    const formatCurrency = useCallback((amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }, []);

    const formatDate = useCallback((dateString: string) => {
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
    }, []);

    // ========== MORE EFFECTS (Always defined, after all hooks) ==========
    // Check if all items on current page are selected
    useEffect(() => {
        const allPageIds = filteredPayments.map(payment => payment.id);
        const allSelected = allPageIds.every(id => selectedPayments.includes(id));
        setIsSelectAll(allSelected);
    }, [selectedPayments, filteredPayments]);

    // Reset selection when bulk mode is turned off
    useEffect(() => {
        if (!isBulkMode) {
            setSelectedPayments([]);
            setIsSelectAll(false);
        }
    }, [isBulkMode]);

    // Keyboard shortcuts
    useEffect(() => {
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
                    if (selectedPayments.length > 0) {
                        setSelectedPayments([]);
                    } else {
                        setIsBulkMode(false);
                    }
                }
                if (showBulkActions) setShowBulkActions(false);
                if (showSelectionOptions) setShowSelectionOptions(false);
            }
            
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'B') {
                e.preventDefault();
                setIsBulkMode(!isBulkMode);
            }
            
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            
            if (e.key === 'Delete' && isBulkMode && selectedPayments.length > 0) {
                e.preventDefault();
                setShowBulkDeleteDialog(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isBulkMode, selectedPayments, showBulkActions, showSelectionOptions, handleSelectAllFiltered, handleSelectAllOnPage]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(true);
            
            const params = buildQueryParams();
            
            const shouldMakeRequest = Object.keys(params).length > 0;
            
            if (shouldMakeRequest) {
                // Implement actual search request
                console.log('Search with params:', params);
                // Simulate API call
                setTimeout(() => setIsLoading(false), 500);
            } else {
                // Reset to initial state
                setTimeout(() => setIsLoading(false), 500);
            }
        }, 500);
        
        return () => clearTimeout(timer);
    }, [search, statusFilter, methodFilter, payerTypeFilter, dateFrom, dateTo, buildQueryParams]);

    // ========== RETURN (Always the same structure) ==========
    return {
        // Safe data
        safePayments,
        safeMeta,
        safeLinks,
        
        // State
        search,
        setSearch,
        statusFilter,
        setStatusFilter,
        methodFilter,
        setMethodFilter,
        payerTypeFilter,
        setPayerTypeFilter,
        dateFrom,
        setDateFrom,
        dateTo,
        setDateTo,
        isLoading,
        setIsLoading,
        expandedPayments,
        setExpandedPayments,
        viewMode,
        setViewMode,
        showAdvancedFilters,
        setShowAdvancedFilters,
        windowWidth,
        setWindowWidth,
        selectedPayments,
        setSelectedPayments,
        isBulkMode,
        setIsBulkMode,
        showBulkActions,
        setShowBulkActions,
        isSelectAll,
        setIsSelectAll,
        showBulkDeleteDialog,
        setShowBulkDeleteDialog,
        showBulkStatusDialog,
        setShowBulkStatusDialog,
        isPerformingBulkAction,
        setIsPerformingBulkAction,
        bulkEditValue,
        setBulkEditValue,
        selectionMode,
        setSelectionMode,
        showSelectionOptions,
        setShowSelectionOptions,
        
        // Refs
        bulkActionRef,
        selectionRef,
        searchInputRef,
        
        // Data
        filteredPayments,
        selectedPaymentsData,
        selectionStats,
        
        // Constants
        paymentMethods,
        statusOptions,
        payerTypeOptions,
        
        // Handlers
        handleSelectAllOnPage,
        handleSelectAllFiltered,
        handleSelectAll,
        handleItemSelect,
        handleBulkOperation,
        handleCopySelectedData,
        handleClearFilters,
        handleExport,
        togglePaymentExpanded,
        handleSmartBulkAction,
        buildQueryParams,
        
        // Computed
        hasActiveFilters,

        // Helper functions
        formatCurrency,
        formatDate,
    };
}