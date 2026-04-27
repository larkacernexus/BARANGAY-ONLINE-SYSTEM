import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { router, usePage, Link } from '@inertiajs/react';
import { toast } from 'sonner';
import AppLayout from '@/layouts/admin-app-layout';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { KeyRound, Receipt as ReceiptIcon } from 'lucide-react';
import { route } from 'ziggy-js';

// Import components
import ReceiptsHeader from '@/components/admin/receipts/ReceiptsHeader';
import ReceiptsStats from '@/components/admin/receipts/ReceiptsStats';
import ReceiptsFilters from '@/components/admin/receipts/ReceiptsFilters';
import ReceiptsContent from '@/components/admin/receipts/ReceiptsContent';
import ReceiptsDialogs from '@/components/admin/receipts/ReceiptsDialogs';

type SelectionMode = 'page' | 'filtered' | 'all';

interface Receipt {
    id: number;
    receipt_number: string;
    or_number: string | null;
    receipt_type: string;
    receipt_type_label: string;
    payer_name: string;
    payer_address: string | null;
    formatted_total: string;
    formatted_amount_paid: string;
    payment_method: string;
    payment_method_label: string;
    formatted_issued_date: string;
    status: string;
    is_voided: boolean;
    printed_count: number;
    fee_breakdown: Array<any>;
}

interface ReceiptsPageProps {
    receipts: {
        data: Receipt[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: {
        search?: string;
        status?: string;
        payment_method?: string;
        receipt_type?: string;
        date_from?: string;
        date_to?: string;
        amount_range?: string;
        printed_status?: string;
        per_page?: number;
    };
    stats: {
        total: { count: number; amount: number; formatted_amount: string };
        today: { count: number; amount: number; formatted_amount: string };
        this_month: { count: number; amount: number; formatted_amount: string };
        voided: number;
        by_method: Array<{ method: string; method_label: string; count: number; total: number; formatted_total: string }>;
        by_type: Array<{ type: string; type_label: string; count: number }>;
    };
    pendingClearances?: Array<any>;
    filterOptions: {
        payment_methods: Array<{ value: string; label: string }>;
        receipt_types: Array<{ value: string; label: string }>;
        status_options: Array<{ value: string; label: string }>;
    };
}

// Helper functions for safe value extraction
const getSafeString = (value: any, defaultValue: string = ''): string => {
    if (value === null || value === undefined) return defaultValue;
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    return defaultValue;
};

export default function ReceiptsIndex({ 
    receipts, 
    filters: initialFilters, 
    stats, 
    pendingClearances = [],
    filterOptions 
}: ReceiptsPageProps) {
    const { flash } = usePage().props as any;
    
    // Safe data extraction
    const safeReceipts = receipts || { data: [], current_page: 1, last_page: 1, total: 0, per_page: 15, from: 0, to: 0 };
    const allReceipts = safeReceipts.data || [];
    
    // Filter states - client-side only (removed sort from filters)
    const [search, setSearch] = useState<string>(getSafeString(initialFilters.search));
    const [statusFilter, setStatusFilter] = useState<string>(getSafeString(initialFilters.status));
    const [methodFilter, setMethodFilter] = useState<string>(getSafeString(initialFilters.payment_method));
    const [typeFilter, setTypeFilter] = useState<string>(getSafeString(initialFilters.receipt_type));
    const [dateFrom, setDateFrom] = useState<string>(getSafeString(initialFilters.date_from));
    const [dateTo, setDateTo] = useState<string>(getSafeString(initialFilters.date_to));
    const [amountRange, setAmountRange] = useState<string>(getSafeString(initialFilters.amount_range));
    const [printedStatusFilter, setPrintedStatusFilter] = useState<string>(getSafeString(initialFilters.printed_status));
    
    // Separate sort states for table header
    const [sortBy, setSortBy] = useState<string>('issued_date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(initialFilters.per_page || 15);
    const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
    
    // Bulk selection states
    const [selectedReceipts, setSelectedReceipts] = useState<number[]>([]);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [isSelectAll, setIsSelectAll] = useState(false);
    const [selectionMode, setSelectionMode] = useState<SelectionMode>('page');
    const [showBulkVoidDialog, setShowBulkVoidDialog] = useState(false);
    const [showBulkExportDialog, setShowBulkExportDialog] = useState(false);
    const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');
    const [bulkEditValue, setBulkEditValue] = useState<string>('');

    const searchInputRef = useRef<HTMLInputElement>(null);

    // Handle window resize
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

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter, methodFilter, typeFilter, dateFrom, dateTo, amountRange, printedStatusFilter]);

    // Reset selection when exiting bulk mode
    useEffect(() => {
        if (!isBulkMode) {
            setSelectedReceipts([]);
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

    // Helper to extract numeric amount from formatted string
    const extractNumericAmount = (formattedAmount: string): number => {
        if (!formattedAmount) return 0;
        const match = formattedAmount.match(/[\d,]+\.?\d*/);
        if (match) {
            return parseFloat(match[0].replace(/,/g, ''));
        }
        return 0;
    };

    // Filter receipts client-side
    const filteredReceipts = useMemo(() => {
        if (!allReceipts || allReceipts.length === 0) {
            return [];
        }
        
        let filtered = [...allReceipts];
        
        // Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(receipt =>
                receipt?.receipt_number?.toLowerCase().includes(searchLower) ||
                receipt?.or_number?.toLowerCase().includes(searchLower) ||
                receipt?.payer_name?.toLowerCase().includes(searchLower)
            );
        }
        
        // Status filter
        if (statusFilter && statusFilter !== 'all') {
            if (statusFilter === 'voided') {
                filtered = filtered.filter(receipt => receipt?.is_voided === true);
            } else {
                filtered = filtered.filter(receipt => receipt?.status === statusFilter && !receipt?.is_voided);
            }
        }
        
        // Payment method filter
        if (methodFilter && methodFilter !== 'all') {
            filtered = filtered.filter(receipt => receipt?.payment_method === methodFilter);
        }
        
        // Receipt type filter
        if (typeFilter && typeFilter !== 'all') {
            filtered = filtered.filter(receipt => receipt?.receipt_type === typeFilter);
        }
        
        // Date range filter
        if (dateFrom) {
            filtered = filtered.filter(receipt => receipt?.formatted_issued_date >= dateFrom);
        }
        if (dateTo) {
            filtered = filtered.filter(receipt => receipt?.formatted_issued_date <= dateTo);
        }
        
        // Amount range filter
        if (amountRange && amountRange !== 'all') {
            filtered = filtered.filter(receipt => {
                const amount = extractNumericAmount(receipt?.formatted_total || '0');
                return checkAmountRange(amount, amountRange);
            });
        }
        
        // Printed status filter
        if (printedStatusFilter && printedStatusFilter !== 'all') {
            if (printedStatusFilter === 'printed') {
                filtered = filtered.filter(receipt => (receipt?.printed_count || 0) > 0);
            } else if (printedStatusFilter === 'unprinted') {
                filtered = filtered.filter(receipt => (receipt?.printed_count || 0) === 0);
            }
        }
        
        // Apply sorting (for table header)
        if (filtered.length > 0) {
            filtered.sort((a, b) => {
                let valueA: any;
                let valueB: any;
                
                switch (sortBy) {
                    case 'receipt_number':
                        valueA = a?.receipt_number || '';
                        valueB = b?.receipt_number || '';
                        break;
                    case 'or_number':
                        valueA = a?.or_number || '';
                        valueB = b?.or_number || '';
                        break;
                    case 'payer_name':
                        valueA = a?.payer_name || '';
                        valueB = b?.payer_name || '';
                        break;
                    case 'payment_method':
                        valueA = a?.payment_method_label || '';
                        valueB = b?.payment_method_label || '';
                        break;
                    case 'receipt_type':
                        valueA = a?.receipt_type_label || '';
                        valueB = b?.receipt_type_label || '';
                        break;
                    case 'total_amount':
                        valueA = extractNumericAmount(a?.formatted_total || '0');
                        valueB = extractNumericAmount(b?.formatted_total || '0');
                        break;
                    case 'status':
                        valueA = a?.is_voided ? 'voided' : (a?.status || '');
                        valueB = b?.is_voided ? 'voided' : (b?.status || '');
                        break;
                    case 'printed_status':
                        valueA = (a?.printed_count || 0) > 0 ? 1 : 0;
                        valueB = (b?.printed_count || 0) > 0 ? 1 : 0;
                        break;
                    case 'issued_date':
                        valueA = a?.formatted_issued_date ? new Date(a.formatted_issued_date).getTime() : 0;
                        valueB = b?.formatted_issued_date ? new Date(b.formatted_issued_date).getTime() : 0;
                        break;
                    default:
                        valueA = a?.formatted_issued_date ? new Date(a.formatted_issued_date).getTime() : 0;
                        valueB = b?.formatted_issued_date ? new Date(b.formatted_issued_date).getTime() : 0;
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
    }, [allReceipts, search, statusFilter, methodFilter, typeFilter, dateFrom, dateTo, amountRange, printedStatusFilter, sortBy, sortOrder]);

    // Calculate filtered stats
    const filteredStats = useMemo(() => {
        if (!filteredReceipts || filteredReceipts.length === 0) {
            return stats;
        }
        
        const totalCount = filteredReceipts.length;
        const totalAmount = filteredReceipts.reduce((sum, r) => sum + extractNumericAmount(r?.formatted_total || '0'), 0);
        const voidedCount = filteredReceipts.filter(r => r?.is_voided).length;
        const printedCount = filteredReceipts.filter(r => (r?.printed_count || 0) > 0).length;
        
        return {
            total: { count: totalCount, amount: totalAmount, formatted_amount: `₱${totalAmount.toLocaleString()}` },
            today: stats.today,
            this_month: stats.this_month,
            voided: voidedCount,
            printed: printedCount,
            by_method: stats.by_method,
            by_type: stats.by_type
        };
    }, [filteredReceipts, stats]);

    // Pagination
    const totalItems = filteredReceipts.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedReceipts = filteredReceipts.slice(startIndex, endIndex);

    // Selection handlers
    const handleSelectAllOnPage = useCallback(() => {
        const pageIds = paginatedReceipts.map(r => r.id);
        if (isSelectAll) {
            setSelectedReceipts(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedReceipts, ...pageIds])];
            setSelectedReceipts(newSelected);
        }
        setIsSelectAll(!isSelectAll);
        setSelectionMode('page');
    }, [paginatedReceipts, isSelectAll, selectedReceipts]);

    const handleSelectAllFiltered = useCallback(() => {
        const allIds = filteredReceipts.map(r => r.id);
        if (selectedReceipts.length === allIds.length && allIds.every(id => selectedReceipts.includes(id))) {
            setSelectedReceipts(prev => prev.filter(id => !allIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedReceipts, ...allIds])];
            setSelectedReceipts(newSelected);
            setSelectionMode('filtered');
        }
    }, [filteredReceipts, selectedReceipts]);

    const handleSelectAll = useCallback(() => {
        if (confirm(`This will select ALL ${totalItems} receipts. This action may take a moment.`)) {
            const allIds = filteredReceipts.map(r => r.id);
            setSelectedReceipts(allIds);
            setSelectionMode('all');
        }
    }, [filteredReceipts, totalItems]);

    const handleItemSelect = useCallback((id: number) => {
        setSelectedReceipts(prev => {
            if (prev.includes(id)) {
                return prev.filter(itemId => itemId !== id);
            } else {
                return [...prev, id];
            }
        });
    }, []);

    // Check if all items on current page are selected
    useEffect(() => {
        const allPageIds = paginatedReceipts.map(r => r.id);
        const allSelected = allPageIds.length > 0 && allPageIds.every(id => selectedReceipts.includes(id));
        setIsSelectAll(allSelected);
    }, [selectedReceipts, paginatedReceipts]);

    // Get selected receipts data
    const selectedReceiptsData = useMemo(() => {
        return filteredReceipts.filter(r => selectedReceipts.includes(r.id));
    }, [selectedReceipts, filteredReceipts]);

    // Calculate selection stats
    const selectionStats = useMemo(() => {
        const totalAmount = selectedReceiptsData.reduce((sum, r) => sum + extractNumericAmount(r?.formatted_total || '0'), 0);
        const paidAmount = selectedReceiptsData.reduce((sum, r) => sum + extractNumericAmount(r?.formatted_amount_paid || '0'), 0);
        const voidedCount = selectedReceiptsData.filter(r => r?.is_voided).length;
        const printedCount = selectedReceiptsData.filter(r => (r?.printed_count || 0) > 0).length;
        
        return {
            count: selectedReceiptsData.length,
            totalAmount,
            formattedTotalAmount: `₱${totalAmount.toLocaleString()}`,
            paidAmount,
            formattedPaidAmount: `₱${paidAmount.toLocaleString()}`,
            voidedCount,
            printedCount,
            paymentMethods: selectedReceiptsData.reduce((acc, r) => {
                acc[r?.payment_method] = (acc[r?.payment_method] || 0) + 1;
                return acc;
            }, {} as Record<string, number>)
        };
    }, [selectedReceiptsData]);

    // Handle sort from table header
    const handleSort = useCallback((column: string) => {
        const newOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortBy(column);
        setSortOrder(newOrder);
    }, [sortBy, sortOrder]);

    // Apply filters
    const applyFilters = useCallback(() => {
        setCurrentPage(1);
    }, []);

    // Clear filters
    const clearFilters = useCallback(() => {
        setSearch('');
        setStatusFilter('all');
        setMethodFilter('all');
        setTypeFilter('all');
        setDateFrom('');
        setDateTo('');
        setAmountRange('all');
        setPrintedStatusFilter('all');
        setSortBy('issued_date');
        setSortOrder('desc');
        setCurrentPage(1);
    }, []);

    // View receipt
    const viewReceipt = useCallback((id: number) => {
        router.get(route('receipts.show', id));
    }, []);

    // Print receipt
    const printReceipt = useCallback((receipt: Receipt) => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Print Receipt</title></head><body>');
            printWindow.document.write('<div>' + JSON.stringify(receipt) + '</div>');
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.print();
        }
    }, []);

    // Void receipt
    const voidReceipt = useCallback((id: number, receiptNumber: string) => {
        const reason = prompt(`Enter reason for voiding receipt #${receiptNumber}:`);
        if (reason && reason.trim().length >= 10) {
            router.post(route('receipts.void', id), {
                void_reason: reason
            }, {
                preserveScroll: true,
            });
        } else if (reason) {
            alert('Void reason must be at least 10 characters long.');
        }
    }, []);

    // Generate receipt from clearance
    const generateFromClearance = useCallback((clearanceId: number) => {
        router.post(route('receipts.generate-from-clearance', clearanceId), {
            receipt_type: 'clearance'
        }, {
            preserveScroll: true,
        });
    }, []);

    // Handle clear selection
    const handleClearSelection = useCallback(() => {
        setSelectedReceipts([]);
        setIsBulkMode(false);
    }, []);

    // Handle copy selected data
    const handleCopySelectedData = useCallback(() => {
        if (selectedReceiptsData.length === 0) {
            toast.error('No data to copy');
            return;
        }
        
        const data = selectedReceiptsData.map(r => ({
            'Receipt #': r?.receipt_number || 'N/A',
            'OR #': r?.or_number || 'N/A',
            'Payer': r?.payer_name || 'N/A',
            'Amount': r?.formatted_total || '₱0.00',
            'Paid': r?.formatted_amount_paid || '₱0.00',
            'Method': r?.payment_method_label || 'N/A',
            'Date': r?.formatted_issued_date || 'N/A',
            'Status': r?.is_voided ? 'Voided' : (r?.status || 'N/A'),
        }));
        
        const csvData = [
            Object.keys(data[0]).join(','),
            ...data.map(row => Object.values(row).join(','))
        ].join('\n');
        
        navigator.clipboard.writeText(csvData).then(() => {
            toast.success(`${selectedReceiptsData.length} records copied to clipboard`);
        }).catch(() => {
            toast.error('Failed to copy to clipboard');
        });
    }, [selectedReceiptsData]);

    // Bulk operations
    const handleBulkOperation = useCallback(async (operation: string) => {
        if (selectedReceipts.length === 0) {
            toast.error('Please select at least one receipt');
            return;
        }

        setIsPerformingBulkAction(true);

        try {
            switch (operation) {
                case 'export':
                    setShowBulkExportDialog(true);
                    break;
                case 'void':
                    setShowBulkVoidDialog(true);
                    break;
                case 'copy_data':
                    handleCopySelectedData();
                    break;
                default:
                    toast.info('Functionality to be implemented');
                    break;
            }
        } catch (error) {
            console.error('Bulk operation error:', error);
            toast.error('An error occurred during the bulk operation.');
        } finally {
            setIsPerformingBulkAction(false);
        }
    }, [selectedReceipts.length, handleCopySelectedData]);

    const handleBulkVoid = useCallback(async () => {
        if (!bulkEditValue) {
            toast.error('Please provide a reason for voiding');
            return;
        }
        
        setIsPerformingBulkAction(true);

        try {
            await router.post('/admin/receipts/bulk-action', {
                action: 'void',
                receipt_ids: selectedReceipts,
                void_reason: bulkEditValue
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedReceipts([]);
                    setBulkEditValue('');
                    setShowBulkVoidDialog(false);
                    toast.success(`${selectedReceipts.length} receipts voided successfully`);
                },
                onError: () => {
                    toast.error('Failed to void receipts');
                }
            });
        } catch (error) {
            console.error('Bulk void error:', error);
            toast.error('An error occurred during the operation.');
        } finally {
            setIsPerformingBulkAction(false);
        }
    }, [bulkEditValue, selectedReceipts]);

    const handleBulkExport = useCallback(async () => {
        setIsPerformingBulkAction(true);

        try {
            const exportData = selectedReceiptsData.map(r => ({
                'Receipt Number': r?.receipt_number || 'N/A',
                'OR Number': r?.or_number || 'N/A',
                'Payer Name': r?.payer_name || 'N/A',
                'Total Amount': r?.formatted_total || '₱0.00',
                'Amount Paid': r?.formatted_amount_paid || '₱0.00',
                'Payment Method': r?.payment_method_label || 'N/A',
                'Receipt Type': r?.receipt_type_label || 'N/A',
                'Issue Date': r?.formatted_issued_date || 'N/A',
                'Status': r?.is_voided ? 'Voided' : (r?.status || 'N/A'),
                'Printed': (r?.printed_count || 0) > 0 ? 'Yes' : 'No',
            }));
            
            const csv = [
                Object.keys(exportData[0]).join(','),
                ...exportData.map(row => Object.values(row).map(v => `"${v}"`).join(','))
            ].join('\n');
            
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `receipts-export-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
            
            toast.success(`${selectedReceipts.length} receipts exported successfully`);
            setSelectedReceipts([]);
            setShowBulkExportDialog(false);
        } catch (error) {
            console.error('Bulk export error:', error);
            toast.error('Failed to export receipts');
        } finally {
            setIsPerformingBulkAction(false);
        }
    }, [selectedReceiptsData, selectedReceipts.length]);

    // Handle page change
    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const hasActiveFilters = useMemo(() => 
        !!(search || statusFilter || methodFilter || typeFilter || dateFrom || dateTo || amountRange || printedStatusFilter),
    [search, statusFilter, methodFilter, typeFilter, dateFrom, dateTo, amountRange, printedStatusFilter]);

    // Get current page stats
    const startIndexDisplay = (currentPage - 1) * itemsPerPage + 1;
    const endIndexDisplay = Math.min(startIndexDisplay + itemsPerPage - 1, totalItems);

    // Create filtersStateForComponent (removed sort fields)
    const filtersStateForComponent = {
        search,
        status: statusFilter,
        payment_method: methodFilter,
        receipt_type: typeFilter,
        date_from: dateFrom,
        date_to: dateTo,
        amount_range: amountRange,
        printed_status: printedStatusFilter
    };

    // Handle sort change from dropdown
    const handleSortChange = useCallback((value: string) => {
        const [col, order] = value.split('-');
        setSortBy(col);
        setSortOrder(order as 'asc' | 'desc');
    }, []);

    const getCurrentSortValue = useCallback(() => {
        return `${sortBy}-${sortOrder}`;
    }, [sortBy, sortOrder]);

    // Handle delete receipt
    const handleDelete = useCallback((receipt: Receipt) => {
        toast.info('Delete functionality to be implemented');
    }, []);

    // Handle create new receipt
    const handleCreateNew = useCallback(() => {
        router.get(route('receipts.create'));
    }, []);

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
                    if (selectedReceipts.length > 0) {
                        setSelectedReceipts([]);
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
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isBulkMode, selectedReceipts, isMobile, handleSelectAllFiltered, handleSelectAllOnPage]);

    return (
        <AppLayout
            title="Receipts Management"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Receipts', href: '/admin/receipts' }
            ]}
        >
            <TooltipProvider>
                <div className="space-y-6">
                    <ReceiptsHeader 
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isMobile={isMobile}
                    />

                    <ReceiptsStats 
                        globalStats={filteredStats}
                        filteredStats={null}
                        isLoading={isPerformingBulkAction}
                    />

                    <ReceiptsFilters
                        search={search}
                        setSearch={setSearch}
                        statusFilter={statusFilter}
                        setStatusFilter={setStatusFilter}
                        methodFilter={methodFilter}
                        setMethodFilter={setMethodFilter}
                        typeFilter={typeFilter}
                        setTypeFilter={setTypeFilter}
                        dateFrom={dateFrom}
                        setDateFrom={setDateFrom}
                        dateTo={dateTo}
                        setDateTo={setDateTo}
                        amountRange={amountRange}
                        setAmountRange={setAmountRange}
                        printedStatusFilter={printedStatusFilter}
                        setPrintedStatusFilter={setPrintedStatusFilter}
                        showAdvancedFilters={showAdvancedFilters}
                        setShowAdvancedFilters={setShowAdvancedFilters}
                        handleClearFilters={clearFilters}
                        hasActiveFilters={hasActiveFilters}
                        isMobile={isMobile}
                        totalItems={totalItems}
                        startIndex={startIndexDisplay}
                        endIndex={endIndexDisplay}
                        searchInputRef={searchInputRef}
                        isLoading={isPerformingBulkAction}
                        filterOptions={filterOptions}
                        onApplyFilters={applyFilters}
                    />

                    <ReceiptsContent
                        receipts={paginatedReceipts}
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isSelectAll={isSelectAll}
                        selectedReceipts={selectedReceipts}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        isMobile={isMobile}
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
                        onClearFilters={clearFilters}
                        onClearSelection={handleClearSelection}
                        onDelete={handleDelete}
                        onSort={handleSort}
                        onBulkOperation={handleBulkOperation}
                        onCopySelectedData={handleCopySelectedData}
                        onView={viewReceipt}
                        onPrint={printReceipt}
                        onVoid={voidReceipt}
                        onGenerateFromClearance={generateFromClearance}
                        setShowBulkVoidDialog={setShowBulkVoidDialog}
                        setShowBulkExportDialog={setShowBulkExportDialog}
                        pendingClearances={pendingClearances}
                        isPerformingBulkAction={isPerformingBulkAction}
                        selectionMode={selectionMode}
                        selectionStats={selectionStats}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSortChange={handleSortChange}
                        getCurrentSortValue={getCurrentSortValue}
                        onCreateNew={handleCreateNew}
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
                                    <span>Void selected</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Esc</kbd>
                                    <span>Exit/clear</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Ctrl+F</kbd>
                                    <span>Focus search</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </TooltipProvider>

            <ReceiptsDialogs
                showBulkVoidDialog={showBulkVoidDialog}
                setShowBulkVoidDialog={setShowBulkVoidDialog}
                showBulkExportDialog={showBulkExportDialog}
                setShowBulkExportDialog={setShowBulkExportDialog}
                isPerformingBulkAction={isPerformingBulkAction}
                selectedReceipts={selectedReceipts}
                handleBulkVoid={handleBulkVoid}
                handleBulkExport={handleBulkExport}
                selectionStats={selectionStats}
                bulkEditValue={bulkEditValue}
                setBulkEditValue={setBulkEditValue}
            />
        </AppLayout>
    );
}