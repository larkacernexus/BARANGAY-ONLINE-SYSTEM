import AppLayout from '@/layouts/admin-app-layout';
import { router } from '@inertiajs/react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';

// Components
import PaymentsHeader from '@/components/admin/payments/PaymentsHeader';
import PaymentsStats from '@/components/admin/payments/PaymentsStats';
import PaymentsFilters from '@/components/admin/payments/PaymentsFilters';
import PaymentsContent from '@/components/admin/payments/PaymentsContent';
import PaymentsDialogs from '@/components/admin/payments/PaymentsDialogs';
import PrintableReceipt from '@/components/admin/receipts/PrintableReceipt';

// Types
import { PaginationData, Filters, Stats, Payment } from '@/types/admin/payments/payments';
import { route } from 'ziggy-js';
import { Loader2, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Debounce utility
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

// Helper function to format currency
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};

// Helper functions for safe value extraction
const getSafeString = (value: any, defaultValue: string = ''): string => {
    if (value === null || value === undefined) return defaultValue;
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    return defaultValue;
};

interface PaymentsIndexProps {
    payments: PaginationData;
    filters: Filters;
    stats: Stats;
    clearanceTypes?: Array<{ id: number; name: string; code: string; fee: number }>;
}

export default function PaymentsIndex({
    payments: initialPayments,
    filters: initialFilters = {},
    stats: initialStats,
    clearanceTypes = []
}: PaymentsIndexProps) {
    
    const [selectedPaymentForPrint, setSelectedPaymentForPrint] = useState<any>(null);
    const [showPrintPreview, setShowPrintPreview] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `receipt-${selectedPaymentForPrint?.or_number || 'payment'}`,
        onAfterPrint: () => {
            setShowPrintPreview(false);
            setSelectedPaymentForPrint(null);
        },
    });

    // Safe data extraction
    const safePayments = initialPayments || { 
        data: [], current_page: 1, last_page: 1, total: 0, per_page: 20, from: 0, to: 0 
    };
    const safeStats = initialStats || { 
        total: 0, today: 0, monthly: 0, total_amount: 0, today_amount: 0, monthly_amount: 0 
    };
    
    // Filter states - server-side
    const [search, setSearch] = useState<string>(getSafeString(initialFilters.search));
    const [statusFilter, setStatusFilter] = useState<string>(getSafeString(initialFilters.status, 'all'));
    const [methodFilter, setMethodFilter] = useState<string>(getSafeString(initialFilters.payment_method, 'all'));
    const [payerTypeFilter, setPayerTypeFilter] = useState<string>(getSafeString(initialFilters.payer_type, 'all'));
    const [clearanceTypeFilter, setClearanceTypeFilter] = useState<string>(getSafeString(initialFilters.clearance_type_id, 'all'));
    const [dateFrom, setDateFrom] = useState<string>(getSafeString(initialFilters.date_from));
    const [dateTo, setDateTo] = useState<string>(getSafeString(initialFilters.date_to));
    
    // Sorting states
    const [sortBy, setSortBy] = useState<string>('payment_date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    
    // Per page state
    const [perPage, setPerPage] = useState<string>(getSafeString(initialFilters.per_page, '20'));
    
    // UI states
    const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
    const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    
    // Bulk selection states
    const [selectedPayments, setSelectedPayments] = useState<number[]>([]);
    const [isBulkMode, setIsBulkMode] = useState<boolean>(false);
    const [isSelectAll, setIsSelectAll] = useState<boolean>(false);
    const [selectionMode, setSelectionMode] = useState<'page' | 'filtered' | 'all'>('page');
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState<boolean>(false);
    const [showBulkStatusDialog, setShowBulkStatusDialog] = useState<boolean>(false);
    const [isPerformingBulkAction, setIsPerformingBulkAction] = useState<boolean>(false);
    const [bulkEditValue, setBulkEditValue] = useState<string>('');
    const [expandedPayments, setExpandedPayments] = useState<Set<number>>(new Set());
    
    // Refs
    const searchInputRef = useRef<HTMLInputElement>(null);
    const isFirstMount = useRef(true);

    // Debounce filters
    const debouncedSearch = useDebounce(search, 300);
    const debouncedDateFrom = useDebounce(dateFrom, 500);
    const debouncedDateTo = useDebounce(dateTo, 500);

    // Track window resize
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleResize = () => {
            const width = window.innerWidth;
            setWindowWidth(width);
            setIsMobile(width < 768);
            if (width < 768 && viewMode === 'table') {
                setViewMode('grid');
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, [viewMode]);

    // Get current page data
    const currentPayments = safePayments.data || [];
    const paginationData = useMemo(() => ({
        current_page: safePayments.current_page || 1,
        last_page: safePayments.last_page || 1,
        total: safePayments.total || 0,
        from: safePayments.from || 0,
        to: safePayments.to || 0,
        per_page: safePayments.per_page || parseInt(perPage) || 20,
        path: typeof window !== 'undefined' ? window.location.pathname : '/admin/payments',
        links: safePayments.links || []
    }), [safePayments, perPage]);

    const getCurrentFilters = useCallback(() => ({
        search: debouncedSearch,
        status: statusFilter,
        payment_method: methodFilter,
        payer_type: payerTypeFilter,
        clearance_type_id: clearanceTypeFilter,
        date_from: debouncedDateFrom,
        date_to: debouncedDateTo,
        per_page: perPage,
    }), [
        debouncedSearch, statusFilter, methodFilter, payerTypeFilter, 
        clearanceTypeFilter, debouncedDateFrom, debouncedDateTo, perPage
    ]);

    const reloadData = useCallback((page = 1) => {
        setIsLoading(true);
        
        const filters = { ...getCurrentFilters(), page };
        
        const cleanedFilters: Record<string, any> = {};
        
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== 'all' && value !== '' && value !== null && value !== undefined) {
                cleanedFilters[key] = value;
            }
        });
        
        router.get('/admin/payments', cleanedFilters, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsLoading(false);
                setSelectedPayments([]);
                setIsSelectAll(false);
            },
            onError: () => {
                setIsLoading(false);
                toast.error('Failed to load payments');
            }
        });
    }, [getCurrentFilters]);

    // Server-side filtering - reload data when filters change
    useEffect(() => {
        if (isFirstMount.current) {
            isFirstMount.current = false;
            return;
        }
        
        reloadData();
    }, [
        debouncedSearch, statusFilter, methodFilter, payerTypeFilter,
        clearanceTypeFilter, debouncedDateFrom, debouncedDateTo, perPage
    ]);

    // Handle per page change
    const handlePerPageChange = useCallback((value: string) => {
        setPerPage(value);
        reloadData(1);
    }, [reloadData]);

    // Reset selection when exiting bulk mode
    useEffect(() => {
        if (!isBulkMode) {
            setSelectedPayments([]);
            setIsSelectAll(false);
        }
    }, [isBulkMode]);

    // Selection handlers
    const handleSelectAllOnPage = useCallback(() => {
        const pageIds = currentPayments.map(payment => payment.id);
        if (isSelectAll) {
            setSelectedPayments(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            setSelectedPayments(prev => [...new Set([...prev, ...pageIds])]);
        }
        setIsSelectAll(!isSelectAll);
        setSelectionMode('page');
    }, [currentPayments, isSelectAll]);

    const handleItemSelect = useCallback((id: number) => {
        setSelectedPayments(prev => 
            prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
        );
    }, []);

    // Check if all items on current page are selected
    useEffect(() => {
        const allPageIds = currentPayments.map(payment => payment.id);
        const allSelected = allPageIds.length > 0 && allPageIds.every(id => selectedPayments.includes(id));
        setIsSelectAll(allSelected);
    }, [selectedPayments, currentPayments]);

    // Get selected payments data
    const selectedPaymentsData = useMemo(() => {
        return currentPayments.filter(payment => selectedPayments.includes(payment.id));
    }, [selectedPayments, currentPayments]);

    // Calculate selection stats
    const selectionStats = useMemo(() => {
        if (!selectedPaymentsData || selectedPaymentsData.length === 0) {
            return {
                total: 0, completed: 0, pending: 0, cancelled: 0,
                totalAmount: 0, avgAmount: 0, cashPayments: 0, digitalPayments: 0,
                residents: 0, households: 0
            };
        }
        
        const completed = selectedPaymentsData.filter(p => p?.status === 'completed').length;
        const pending = selectedPaymentsData.filter(p => p?.status === 'pending').length;
        const cancelled = selectedPaymentsData.filter(p => p?.status === 'cancelled').length;
        const totalAmount = selectedPaymentsData.reduce((sum, p) => sum + (Number(p?.total_amount) || 0), 0);
        const cashPayments = selectedPaymentsData.filter(p => p?.payment_method === 'cash').length;
        const digitalPayments = selectedPaymentsData.filter(p => p?.payment_method !== 'cash').length;
        const residents = selectedPaymentsData.filter(p => p?.payer_type === 'resident').length;
        const households = selectedPaymentsData.filter(p => p?.payer_type === 'household').length;
        
        return {
            total: selectedPaymentsData.length,
            completed,
            pending,
            cancelled,
            totalAmount,
            avgAmount: selectedPaymentsData.length > 0 ? totalAmount / selectedPaymentsData.length : 0,
            cashPayments,
            digitalPayments,
            residents,
            households
        };
    }, [selectedPaymentsData]);

    // Handle page change
    const handlePageChange = useCallback((page: number) => {
        reloadData(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [reloadData]);

    // Bulk operations
    const handleBulkOperation = useCallback(async (operation: any) => {
        if (selectedPayments.length === 0) {
            toast.error('Please select at least one payment');
            return;
        }

        setIsPerformingBulkAction(true);

        try {
            switch (operation) {
                case 'delete':
                    setShowBulkDeleteDialog(true);
                    break;
                case 'export':
                    const exportData = selectedPaymentsData.map(payment => ({
                        'OR Number': payment.or_number,
                        'Payer Name': payment.payer_name,
                        'Payer Type': payment.payer_type,
                        'Payment Method': payment.payment_method,
                        'Total Amount': payment.total_amount,
                        'Amount Paid': payment.amount_paid,
                        'Status': payment.status,
                        'Payment Date': new Date(payment.payment_date).toLocaleDateString(),
                        'Reference #': payment.reference_number || ''
                    }));
                    
                    const csv = [
                        Object.keys(exportData[0]).join(','),
                        ...exportData.map(row => Object.values(row).map(v => `"${v}"`).join(','))
                    ].join('\n');
                    
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `payments-export-${new Date().toISOString().split('T')[0]}.csv`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                    
                    toast.success(`${selectedPayments.length} payments exported`);
                    break;
                case 'print':
                    selectedPayments.forEach(id => {
                        const payment = selectedPaymentsData.find(p => p.id === id);
                        if (payment) {
                            handlePrintReceipt(payment);
                        }
                    });
                    break;
                default:
                    toast.info('Functionality to be implemented');
            }
        } catch (error) {
            console.error('Bulk operation error:', error);
            toast.error('An error occurred during the bulk operation.');
        } finally {
            setIsPerformingBulkAction(false);
        }
    }, [selectedPayments, selectedPaymentsData]);

    const handleCopySelectedData = useCallback(() => {
        if (selectedPaymentsData.length === 0) {
            toast.error('No data to copy');
            return;
        }
        
        const data = selectedPaymentsData.map(payment => ({
            'OR Number': payment.or_number,
            'Payer Name': payment.payer_name,
            'Amount': payment.total_amount,
            'Status': payment.status,
            'Date': new Date(payment.payment_date).toLocaleDateString()
        }));
        
        const csv = [
            Object.keys(data[0]).join('\t'),
            ...data.map(row => Object.values(row).join('\t'))
        ].join('\n');
        
        navigator.clipboard.writeText(csv).then(() => {
            toast.success(`${selectedPaymentsData.length} records copied to clipboard`);
        }).catch(() => {
            toast.error('Failed to copy to clipboard');
        });
    }, [selectedPaymentsData]);

    const handleClearFilters = useCallback(() => {
        setSearch('');
        setStatusFilter('all');
        setMethodFilter('all');
        setPayerTypeFilter('all');
        setClearanceTypeFilter('all');
        setDateFrom('');
        setDateTo('');
        setPerPage('20');
    }, []);

    const handleClearSelection = useCallback(() => {
        setSelectedPayments([]);
        setIsSelectAll(false);
    }, []);

    const handleExport = useCallback(() => {
        handleBulkOperation('export');
    }, [handleBulkOperation]);

    const togglePaymentExpanded = useCallback((id: number) => {
        setExpandedPayments(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    }, []);

    const hasActiveFilters = Boolean(
        search || 
        (statusFilter && statusFilter !== 'all') || 
        (methodFilter && methodFilter !== 'all') ||
        (payerTypeFilter && payerTypeFilter !== 'all') ||
        (clearanceTypeFilter && clearanceTypeFilter !== 'all') ||
        dateFrom ||
        dateTo
    );

    // Options for filters
    const paymentMethods = [
        { value: 'cash', label: 'Cash', icon: '💰' },
        { value: 'gcash', label: 'GCash', icon: '📱' },
        { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
        { value: 'check', label: 'Check', icon: '📝' }
    ];

    const statusOptions = [
        { value: 'completed', label: 'Completed' },
        { value: 'pending', label: 'Pending' },
        { value: 'cancelled', label: 'Cancelled' }
    ];

    const payerTypeOptions = [
        { value: 'resident', label: 'Resident' },
        { value: 'household', label: 'Household' },
        { value: 'business', label: 'Business' }
    ];

    // Prepare receipt data for printing
    const prepareReceiptData = (payment: any) => {
        const amountDue = payment.total_amount - (payment.discount || 0);
        const changeDue = Math.max(0, payment.amount_paid - amountDue);
        
        return {
            id: payment.id,
            receipt_number: payment.or_number,
            or_number: payment.or_number,
            receipt_type: 'official',
            receipt_type_label: 'OFFICIAL RECEIPT',
            payer_name: payment.payer_name,
            payer_address: payment.address || null,
            subtotal: Number(payment.subtotal) || 0,
            surcharge: Number(payment.surcharge) || 0,
            penalty: Number(payment.penalty) || 0,
            discount: Number(payment.discount) || 0,
            total_amount: Number(payment.total_amount - (payment.discount || 0)) || 0,
            amount_paid: Number(payment.amount_paid) || 0,
            change_due: changeDue,
            formatted_subtotal: formatCurrency(payment.subtotal || 0),
            formatted_surcharge: formatCurrency(payment.surcharge || 0),
            formatted_penalty: formatCurrency(payment.penalty || 0),
            formatted_discount: formatCurrency(payment.discount || 0),
            formatted_total: formatCurrency(payment.total_amount - (payment.discount || 0)),
            formatted_amount_paid: formatCurrency(payment.amount_paid || 0),
            formatted_change: formatCurrency(changeDue),
            payment_method: payment.payment_method || 'cash',
            payment_method_label: payment.payment_method_display || 
                (payment.payment_method ? payment.payment_method.charAt(0).toUpperCase() + payment.payment_method.slice(1) : 'Cash'),
            reference_number: payment.reference_number || null,
            formatted_payment_date: new Date(payment.payment_date).toLocaleDateString('en-PH'),
            formatted_issued_date: new Date(payment.payment_date).toLocaleDateString('en-PH'),
            issued_by: payment.recorded_by_user_name || 'System',
            fee_breakdown: (payment.items || []).map((item: any) => ({
                fee_name: item.fee_name || 'Fee',
                fee_code: item.fee_code,
                base_amount: Number(item.base_amount || item.total_amount || 0) || 0,
                total_amount: Number(item.total_amount || item.base_amount || 0) || 0
            })),
            notes: payment.remarks || null
        };
    };

    const handlePrintReceipt = (payment: any) => {
        const receiptData = prepareReceiptData(payment);
        setSelectedPaymentForPrint(receiptData);
        setShowPrintPreview(true);
        
        setTimeout(() => {
            handlePrint();
        }, 100);
    };

    const handleCopyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success(`${label} copied to clipboard`);
        }).catch(() => {
            toast.error('Failed to copy to clipboard');
        });
    };

    const handleDeletePayment = (payment: any) => {
        if (confirm(`Are you sure you want to delete payment OR#${payment.or_number}?`)) {
            router.delete(`/admin/payments/${payment.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    reloadData(paginationData.current_page);
                    toast.success('Payment deleted successfully');
                },
                onError: () => {
                    toast.error('Failed to delete payment');
                }
            });
        }
    };

    const handleViewDetails = (payment: any) => {
        router.get(route('admin.payments.show', payment.id));
    };

    // Keyboard shortcuts - using refs to avoid dependency issues
    const bulkModeRef = useRef(isBulkMode);
    const selectedPaymentsRef = useRef(selectedPayments);
    
    useEffect(() => {
        bulkModeRef.current = isBulkMode;
        selectedPaymentsRef.current = selectedPayments;
    }, [isBulkMode, selectedPayments]);

    useEffect(() => {
        if (isMobile) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'b') {
                e.preventDefault();
                setIsBulkMode(prev => !prev);
            }
            
            if (e.ctrlKey && e.key.toLowerCase() === 'a' && bulkModeRef.current) {
                e.preventDefault();
                const pageIds = currentPayments.map(payment => payment.id);
                setSelectedPayments(prev => {
                    const allSelected = pageIds.length > 0 && pageIds.every(id => prev.includes(id));
                    if (allSelected) {
                        return prev.filter(id => !pageIds.includes(id));
                    } else {
                        return [...new Set([...prev, ...pageIds])];
                    }
                });
                setIsSelectAll(prev => !prev);
                setSelectionMode('page');
            }
            
            if (e.key === 'Escape' && bulkModeRef.current) {
                e.preventDefault();
                if (selectedPaymentsRef.current.length > 0) {
                    setSelectedPayments([]);
                    setIsSelectAll(false);
                } else {
                    setIsBulkMode(false);
                }
            }
            
            if (e.ctrlKey && e.key.toLowerCase() === 'f') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            
            if (e.key === 'Delete' && bulkModeRef.current && selectedPaymentsRef.current.length > 0) {
                e.preventDefault();
                setShowBulkDeleteDialog(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isMobile, currentPayments]);

    // Filters state for component
    const filtersStateForComponent = useMemo(() => ({
        search,
        status: statusFilter,
        payment_method: methodFilter,
        payer_type: payerTypeFilter,
        clearance_type_id: clearanceTypeFilter,
        date_from: dateFrom,
        date_to: dateTo,
        per_page: perPage
    }), [search, statusFilter, methodFilter, payerTypeFilter, clearanceTypeFilter, dateFrom, dateTo, perPage]);

    return (
        <AppLayout
            title="Payment Management"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Payments', href: '/admin/payments' }
            ]}
        >
            <TooltipProvider>
                {/* Loading Indicator */}
                {isLoading && (
                    <div className="fixed top-4 right-4 z-50 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Loading...</span>
                    </div>
                )}
                
                {/* Hidden Print Preview */}
                {showPrintPreview && selectedPaymentForPrint && (
                    <div className="fixed top-0 left-0 w-0 h-0 overflow-hidden opacity-0 pointer-events-none">
                        <PrintableReceipt 
                            ref={printRef} 
                            receipt={selectedPaymentForPrint}
                            copyType="original"
                        />
                    </div>
                )}

                <div className="space-y-6">
                    {/* Header */}
                    <PaymentsHeader 
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        handleExport={handleExport}
                        isLoading={isLoading}
                    />
                    
                    {/* Stats Cards */}
                    <PaymentsStats stats={safeStats} />
                    
                    {/* Search and Filters */}
                    <PaymentsFilters
                        search={search}
                        setSearch={setSearch}
                        statusFilter={statusFilter}
                        setStatusFilter={setStatusFilter}
                        methodFilter={methodFilter}
                        setMethodFilter={setMethodFilter}
                        payerTypeFilter={payerTypeFilter}
                        setPayerTypeFilter={setPayerTypeFilter}
                        clearanceTypeFilter={clearanceTypeFilter}
                        setClearanceTypeFilter={setClearanceTypeFilter}
                        dateFrom={dateFrom}
                        setDateFrom={setDateFrom}
                        dateTo={dateTo}
                        setDateTo={setDateTo}
                        showAdvancedFilters={showAdvancedFilters}
                        setShowAdvancedFilters={setShowAdvancedFilters}
                        handleClearFilters={handleClearFilters}
                        handleExport={handleExport}
                        hasActiveFilters={hasActiveFilters}
                        isLoading={isLoading}
                        paymentMethods={paymentMethods}
                        statusOptions={statusOptions}
                        payerTypeOptions={payerTypeOptions}
                        clearanceTypes={clearanceTypes}
                        searchInputRef={searchInputRef}
                        payments={{ meta: paginationData }}
                        isBulkMode={isBulkMode}
                        selectedPayments={selectedPayments}
                        handleSelectAllOnPage={handleSelectAllOnPage}
                        handleSelectAllFiltered={() => {}}
                        handleSelectAll={() => {}}
                        setSelectedPayments={setSelectedPayments}
                        perPage={perPage}
                        onPerPageChange={handlePerPageChange}
                    />
                    
                    {/* Main Content */}
                    <PaymentsContent
                        payments={currentPayments}
                        paymentsMeta={paginationData}
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isSelectAll={isSelectAll}
                        selectedPayments={selectedPayments}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        hasActiveFilters={hasActiveFilters}
                        currentPage={paginationData.current_page}
                        totalPages={paginationData.last_page}
                        totalItems={paginationData.total}
                        itemsPerPage={paginationData.per_page}
                        perPage={perPage}
                        onPerPageChange={handlePerPageChange}
                        onPageChange={handlePageChange}
                        onSelectAllOnPage={handleSelectAllOnPage}
                        onSelectAllFiltered={() => {}}
                        onSelectAll={() => {}}
                        onItemSelect={handleItemSelect}
                        onClearFilters={handleClearFilters}
                        onClearSelection={handleClearSelection}
                        onDelete={handleDeletePayment}
                        onViewDetails={handleViewDetails}
                        onPrintReceipt={handlePrintReceipt}
                        onCopyToClipboard={handleCopyToClipboard}
                        onCopySelectedData={handleCopySelectedData}
                        onSort={() => {}}
                        onBulkOperation={handleBulkOperation}
                        setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                        filtersState={filtersStateForComponent}
                        isPerformingBulkAction={isPerformingBulkAction}
                        selectionMode={selectionMode}
                        selectionStats={selectionStats}
                        expandedPayments={expandedPayments}
                        togglePaymentExpanded={togglePaymentExpanded}
                        paymentMethods={paymentMethods}
                        statusOptions={statusOptions}
                        payerTypeOptions={payerTypeOptions}
                        isLoading={isLoading}
                        windowWidth={windowWidth}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSortChange={() => {}}
                        getCurrentSortValue={() => `${sortBy}-${sortOrder}`}
                    />

                    {/* Keyboard Shortcuts */}
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
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-xs text-gray-600">
                                <div><kbd className="px-2 py-1 bg-gray-200 rounded">Ctrl+A</kbd> Select page</div>
                                <div><kbd className="px-2 py-1 bg-gray-200 rounded">Delete</kbd> Delete selected</div>
                                <div><kbd className="px-2 py-1 bg-gray-200 rounded">Esc</kbd> Exit/clear</div>
                                <div><kbd className="px-2 py-1 bg-gray-200 rounded">Ctrl+F</kbd> Focus search</div>
                            </div>
                        </div>
                    )}
                </div>
            </TooltipProvider>
            
            {/* Dialogs */}
            <PaymentsDialogs
                showBulkDeleteDialog={showBulkDeleteDialog}
                setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                showBulkStatusDialog={showBulkStatusDialog}
                setShowBulkStatusDialog={setShowBulkStatusDialog}
                isPerformingBulkAction={isPerformingBulkAction}
                selectedPayments={selectedPayments}
                handleBulkOperation={handleBulkOperation}
                selectionStats={selectionStats}
                bulkEditValue={bulkEditValue}
                setBulkEditValue={setBulkEditValue}
            />
        </AppLayout>
    );
}