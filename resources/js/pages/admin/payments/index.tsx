import AppLayout from '@/layouts/admin-app-layout';
import { Head, router } from '@inertiajs/react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';

// Custom hooks
import { usePaymentsManagement } from '@/hooks/usePaymentsManagement';

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

interface PaymentsIndexProps {
    payments: PaginationData;
    filters: Filters;
    stats: Stats;
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

const getSafeSortOrder = (value: any): 'asc' | 'desc' => {
    if (value === 'asc') return 'asc';
    if (value === 'desc') return 'desc';
    return 'desc';
};

export default function PaymentsIndex({
    payments: rawPayments,
    filters,
    stats
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
    const safePaymentsData = rawPayments?.data || [];
    const safeMeta = rawPayments || { current_page: 1, last_page: 1, total: 0, per_page: 15, from: 0, to: 0 };
    const safeFilters = filters || {};
    const safeStats = stats || { total: 0, today: 0, monthly: 0, total_amount: 0, today_amount: 0, monthly_amount: 0 };
    
    // Filter states - client-side only
    const [search, setSearch] = useState<string>(getSafeString(safeFilters.search));
    const [statusFilter, setStatusFilter] = useState<string>(getSafeString(safeFilters.status, 'all'));
    const [methodFilter, setMethodFilter] = useState<string>(getSafeString(safeFilters.payment_method, 'all'));
    const [payerTypeFilter, setPayerTypeFilter] = useState<string>(getSafeString(safeFilters.payer_type, 'all'));
    const [dateFrom, setDateFrom] = useState<string>(getSafeString(safeFilters.date_from));
    const [dateTo, setDateTo] = useState<string>(getSafeString(safeFilters.date_to));
    const [sortBy, setSortBy] = useState<string>(getSafeString(safeFilters.sort_by, 'payment_date'));
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(getSafeSortOrder(safeFilters.sort_order));
    
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 15;
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
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
    const [showBulkActions, setShowBulkActions] = useState<boolean>(false);
    const [showSelectionOptions, setShowSelectionOptions] = useState<boolean>(false);
    const [expandedPayments, setExpandedPayments] = useState<Set<number>>(new Set());
    
    // Refs
    const bulkActionRef = useRef<HTMLDivElement>(null);
    const selectionRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

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

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter, methodFilter, payerTypeFilter, dateFrom, dateTo, sortBy, sortOrder]);

    // Filter payments client-side
    const filteredPayments = useMemo(() => {
        if (!safePaymentsData || safePaymentsData.length === 0) {
            return [];
        }
        
        let filtered = [...safePaymentsData];
        
        // Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(payment =>
                payment?.or_number?.toLowerCase().includes(searchLower) ||
                payment?.payer_name?.toLowerCase().includes(searchLower) ||
                payment?.reference_number?.toLowerCase().includes(searchLower)
            );
        }
        
        // Status filter
        if (statusFilter && statusFilter !== 'all') {
            filtered = filtered.filter(payment => payment?.status === statusFilter);
        }
        
        // Payment method filter
        if (methodFilter && methodFilter !== 'all') {
            filtered = filtered.filter(payment => payment?.payment_method === methodFilter);
        }
        
        // Payer type filter
        if (payerTypeFilter && payerTypeFilter !== 'all') {
            filtered = filtered.filter(payment => payment?.payer_type === payerTypeFilter);
        }
        
        // Date range filter
        if (dateFrom) {
            filtered = filtered.filter(payment => payment?.payment_date >= dateFrom);
        }
        if (dateTo) {
            filtered = filtered.filter(payment => payment?.payment_date <= dateTo);
        }
        
        // Apply sorting
        if (filtered.length > 0) {
            filtered.sort((a, b) => {
                let valueA: any;
                let valueB: any;
                
                switch (sortBy) {
                    case 'or_number':
                        valueA = a?.or_number || '';
                        valueB = b?.or_number || '';
                        break;
                    case 'payer_name':
                        valueA = a?.payer_name || '';
                        valueB = b?.payer_name || '';
                        break;
                    case 'payment_method':
                        valueA = a?.payment_method || '';
                        valueB = b?.payment_method || '';
                        break;
                    case 'total_amount':
                        valueA = Number(a?.total_amount) || 0;
                        valueB = Number(b?.total_amount) || 0;
                        break;
                    case 'amount_paid':
                        valueA = Number(a?.amount_paid) || 0;
                        valueB = Number(b?.amount_paid) || 0;
                        break;
                    case 'status':
                        valueA = a?.status || '';
                        valueB = b?.status || '';
                        break;
                    case 'payment_date':
                        valueA = a?.payment_date ? new Date(a.payment_date).getTime() : 0;
                        valueB = b?.payment_date ? new Date(b.payment_date).getTime() : 0;
                        break;
                    default:
                        valueA = a?.payment_date ? new Date(a.payment_date).getTime() : 0;
                        valueB = b?.payment_date ? new Date(b.payment_date).getTime() : 0;
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
    }, [safePaymentsData, search, statusFilter, methodFilter, payerTypeFilter, dateFrom, dateTo, sortBy, sortOrder]);

    // Calculate display stats that match the Stats interface
    const displayStats = useMemo(() => {
        if (!filteredPayments || filteredPayments.length === 0) {
            return safeStats;
        }
        
        const today = new Date().toISOString().split('T')[0];
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const todayPayments = filteredPayments.filter(p => p?.payment_date === today);
        const monthlyPayments = filteredPayments.filter(p => {
            const paymentDate = new Date(p?.payment_date);
            return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
        });
        
        const totalAmount = filteredPayments.reduce((sum, p) => sum + (Number(p?.total_amount) || 0), 0);
        const todayAmount = todayPayments.reduce((sum, p) => sum + (Number(p?.total_amount) || 0), 0);
        const monthlyAmount = monthlyPayments.reduce((sum, p) => sum + (Number(p?.total_amount) || 0), 0);
        
        return {
            total: filteredPayments.length,
            today: todayPayments.length,
            monthly: monthlyPayments.length,
            total_amount: totalAmount,
            today_amount: todayAmount,
            monthly_amount: monthlyAmount
        };
    }, [filteredPayments, safeStats]);

    // Pagination
    const totalItems = filteredPayments.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedPayments = filteredPayments.slice(startIndex, endIndex);

    // Pagination meta for filters component
    const paginationMeta = useMemo(() => {
        return {
            current_page: currentPage,
            from: startIndex + 1,
            last_page: totalPages,
            per_page: itemsPerPage,
            to: endIndex,
            total: totalItems,
            path: window.location.pathname,
            links: []
        };
    }, [currentPage, totalPages, itemsPerPage, startIndex, endIndex, totalItems]);

    // Selection handlers
    const handleSelectAllOnPage = useCallback(() => {
        const pageIds = paginatedPayments.map(payment => payment.id);
        if (isSelectAll) {
            setSelectedPayments(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedPayments, ...pageIds])];
            setSelectedPayments(newSelected);
        }
        setIsSelectAll(!isSelectAll);
        setSelectionMode('page');
    }, [paginatedPayments, isSelectAll, selectedPayments]);

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

    const handleSelectAll = useCallback(() => {
        if (confirm(`This will select ALL ${totalItems} payments. This action may take a moment.`)) {
            const allIds = filteredPayments.map(payment => payment.id);
            setSelectedPayments(allIds);
            setSelectionMode('all');
        }
    }, [filteredPayments, totalItems]);

    const handleItemSelect = useCallback((id: number) => {
        setSelectedPayments(prev => {
            if (prev.includes(id)) {
                return prev.filter(itemId => itemId !== id);
            } else {
                return [...prev, id];
            }
        });
    }, []);

    // Check if all items on current page are selected
    useEffect(() => {
        const allPageIds = paginatedPayments.map(payment => payment.id);
        const allSelected = allPageIds.length > 0 && allPageIds.every(id => selectedPayments.includes(id));
        setIsSelectAll(allSelected);
    }, [selectedPayments, paginatedPayments]);

    // Get selected payments data
    const selectedPaymentsData = useMemo(() => {
        return filteredPayments.filter(payment => selectedPayments.includes(payment.id));
    }, [selectedPayments, filteredPayments]);

    // Calculate selection stats
    const selectionStats = useMemo(() => {
        if (!selectedPaymentsData || selectedPaymentsData.length === 0) {
            return {
                total: 0,
                completed: 0,
                pending: 0,
                cancelled: 0,
                totalAmount: 0,
                avgAmount: 0,
                cashPayments: 0,
                digitalPayments: 0,
                residents: 0,
                households: 0
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

    // Handle sort change from dropdown
    const handleSortChange = useCallback((value: string) => {
        const [newSortBy, newSortOrder] = value.split('-');
        setSortBy(newSortBy);
        setSortOrder(newSortOrder as 'asc' | 'desc');
    }, []);

    // Get current sort value for dropdown
    const getCurrentSortValue = useCallback((): string => {
        return `${sortBy}-${sortOrder}`;
    }, [sortBy, sortOrder]);

    // Bulk operations
    const handleBulkOperation = useCallback(async (operation: any, customData?: any) => {
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
        setDateFrom('');
        setDateTo('');
        setSortBy('payment_date');
        setSortOrder('desc');
        setCurrentPage(1);
    }, []);

    const handleClearSelection = useCallback(() => {
        setSelectedPayments([]);
        setIsSelectAll(false);
        setIsBulkMode(false);
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

    // Handle page change
    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

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
        }).catch(err => {
            console.error('Failed to copy:', err);
            toast.error('Failed to copy to clipboard');
        });
    };

    const handleDeletePayment = (payment: any) => {
        if (confirm(`Are you sure you want to delete payment OR#${payment.or_number}?`)) {
            router.delete(`/admin/payments/${payment.id}`, {
                preserveScroll: true,
                onSuccess: () => {
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

    const handleSort = (column: string) => {
        const newSortOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortBy(column);
        setSortOrder(newSortOrder);
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
                    if (selectedPayments.length > 0) {
                        setSelectedPayments([]);
                    } else {
                        setIsBulkMode(false);
                    }
                }
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
    }, [isBulkMode, selectedPayments, isMobile]);

    return (
        <AppLayout
            title="Payment Management"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Payments', href: '/admin/payments' }
            ]}
        >
            <TooltipProvider>
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
                        isLoading={false}
                    />
                    
                    {/* Stats Cards - Now passing displayStats which matches the Stats interface */}
                    <PaymentsStats stats={displayStats} />
                    
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
                        dateFrom={dateFrom}
                        setDateFrom={setDateFrom}
                        dateTo={dateTo}
                        setDateTo={setDateTo}
                        showAdvancedFilters={showAdvancedFilters}
                        setShowAdvancedFilters={setShowAdvancedFilters}
                        handleClearFilters={handleClearFilters}
                        handleExport={handleExport}
                        hasActiveFilters={hasActiveFilters}
                        isLoading={isPerformingBulkAction}
                        paymentMethods={paymentMethods}
                        statusOptions={statusOptions}
                        payerTypeOptions={payerTypeOptions}
                        searchInputRef={searchInputRef}
                        payments={{ meta: paginationMeta }}
                        isBulkMode={isBulkMode}
                        selectedPayments={selectedPayments}
                        handleSelectAllOnPage={handleSelectAllOnPage}
                        handleSelectAllFiltered={handleSelectAllFiltered}
                        handleSelectAll={handleSelectAll}
                        selectionRef={selectionRef}
                        showSelectionOptions={showSelectionOptions}
                        setShowSelectionOptions={setShowSelectionOptions}
                        setSelectedPayments={setSelectedPayments}
                    />
                    
                    {/* Main Content */}
                    <PaymentsContent
                        payments={paginatedPayments}
                        paymentsMeta={{
                            current_page: currentPage,
                            last_page: totalPages,
                            total: totalItems,
                            per_page: itemsPerPage,
                            from: startIndex + 1,
                            to: endIndex
                        }}
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isSelectAll={isSelectAll}
                        selectedPayments={selectedPayments}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        hasActiveFilters={hasActiveFilters}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        onPageChange={handlePageChange}
                        onSelectAllOnPage={handleSelectAllOnPage}
                        onSelectAllFiltered={handleSelectAllFiltered}
                        onSelectAll={handleSelectAll}
                        onItemSelect={handleItemSelect}
                        onClearFilters={handleClearFilters}
                        onClearSelection={handleClearSelection}
                        onDelete={handleDeletePayment}
                        onViewDetails={handleViewDetails}
                        onPrintReceipt={handlePrintReceipt}
                        onCopyToClipboard={handleCopyToClipboard}
                        onCopySelectedData={handleCopySelectedData}
                        onSort={handleSort}
                        onBulkOperation={handleBulkOperation}
                        setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                        filtersState={{
                            search,
                            status: statusFilter,
                            payment_method: methodFilter,
                            payer_type: payerTypeFilter,
                            date_from: dateFrom,
                            date_to: dateTo
                        }}
                        isPerformingBulkAction={isPerformingBulkAction}
                        selectionMode={selectionMode}
                        selectionStats={selectionStats}
                        expandedPayments={expandedPayments}
                        togglePaymentExpanded={togglePaymentExpanded}
                        paymentMethods={paymentMethods}
                        statusOptions={statusOptions}
                        payerTypeOptions={payerTypeOptions}
                        isLoading={false}
                        windowWidth={windowWidth}
                        bulkActionRef={bulkActionRef}
                        showBulkActions={showBulkActions}
                        setShowBulkActions={setShowBulkActions}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSortChange={handleSortChange}
                        getCurrentSortValue={getCurrentSortValue}
                    />
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