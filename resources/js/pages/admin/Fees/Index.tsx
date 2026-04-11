import { useState, useEffect, useMemo, useCallback } from 'react';
import AppLayout from '@/layouts/admin-app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { toast } from 'sonner';

// Custom hooks
import { useMediaQuery } from '@/hooks/useMediaQuery';

// Components
import FeesHeader from '@/components/admin/fees/FeesHeader';
import FeesStats from '@/components/admin/fees/FeesStats';
import FeesFilters from '@/components/admin/fees/FeesFilters';
import FeesContent from '@/components/admin/fees/FeesContent';
import FeesDialogs from '@/components/admin/fees/FeesDialogs';
import FlashMessages from '@/components/adminui/FlashMessages';

// Types
import { PaginationData, Filters, Stats, BulkOperation, Fee } from '@/types/admin/fees/fees';
import { route } from 'ziggy-js';

interface FeesIndexProps {
    fees: PaginationData;
    filters: Filters;
    statuses: Record<string, string>;
    categories: Record<string, string>;
    puroks: string[];
    payerTypes?: Record<string, string>;
    stats: Stats;
    flash?: {
        success?: string;
        error?: string;
        info?: string;
        warning?: string;
    };
}

export default function FeesIndex({
    fees,
    filters,
    statuses,
    categories,
    puroks,
    payerTypes = {},
    stats,
    flash
}: FeesIndexProps) {
    
    // Detect mobile for responsive behavior
    const isMobile = useMediaQuery('(max-width: 768px)');
    
    // SAFE DESTRUCTURING
    const safeFees = fees || { data: [], current_page: 1, last_page: 1, total: 0, per_page: 15 };
    const safeFilters = filters || {};
    const safeStatuses = statuses || {};
    const safePuroks = puroks || [];
    const safePayerTypes = payerTypes || {};
    const safeStats = stats || { total: 0, active: 0, inactive: 0, totalAmount: 0, averageAmount: 0 };
    
    const allFees = safeFees.data || [];
    
    // Helper functions for safe value extraction
    const getSafeString = (value: any, defaultValue: string = ''): string => {
        if (value === null || value === undefined) return defaultValue;
        if (typeof value === 'string') return value;
        if (typeof value === 'number') return String(value);
        return defaultValue;
    };
    
    // Helper function to safely get payer type display
    const getPayerTypeDisplay = useCallback((payerType: string | undefined): string => {
        if (!payerType) return 'N/A';
        return safePayerTypes[payerType] || payerType || 'N/A';
    }, [safePayerTypes]);
    
    // Filter states
    const [search, setSearch] = useState<string>(getSafeString(safeFilters.search));
    const [statusFilter, setStatusFilter] = useState<string>(getSafeString(safeFilters.status, 'all'));
    const [purokFilter, setPurokFilter] = useState<string>(getSafeString(safeFilters.purok, 'all'));
    const [minAmount, setMinAmount] = useState<string>(getSafeString(safeFilters.min_amount));
    const [maxAmount, setMaxAmount] = useState<string>(getSafeString(safeFilters.max_amount));
    const [fromDate, setFromDate] = useState<string>(getSafeString(safeFilters.from_date));
    const [toDate, setToDate] = useState<string>(getSafeString(safeFilters.to_date));
    
    // New filter states
    const [payerTypeFilter, setPayerTypeFilter] = useState<string>('all');
    const [dueDateRange, setDueDateRange] = useState<string>('');
    const [dateRangePreset, setDateRangePreset] = useState<string>('');
    const [amountRange, setAmountRange] = useState<string>('');
    
    // Separate sort states for table header
    const [sortBy, setSortBy] = useState<string>('created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    
    const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 15;
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [isBulkMode, setIsBulkMode] = useState<boolean>(false);
    const [selectedFees, setSelectedFees] = useState<number[]>([]);
    const [isSelectAll, setIsSelectAll] = useState<boolean>(false);
    const [selectionMode, setSelectionMode] = useState<'page' | 'filtered' | 'all'>('page');
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState<boolean>(false);
    const [isPerformingBulkAction, setIsPerformingBulkAction] = useState<boolean>(false);
    const [selectionStats, setSelectionStats] = useState<any>(null);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter, purokFilter, minAmount, maxAmount, fromDate, toDate, payerTypeFilter, dueDateRange, amountRange]);

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

    // Filter fees client-side
    const filteredFees = useMemo(() => {
        if (!allFees || allFees.length === 0) {
            return [];
        }
        
        let filtered = [...allFees];
        
        // Search filter - searches fee_code, payer_name, or_number, certificate_number
        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(fee =>
                fee?.name?.toLowerCase().includes(searchLower) ||
                fee?.code?.toLowerCase().includes(searchLower) ||
                fee?.fee_code?.toLowerCase().includes(searchLower) ||
                fee?.description?.toLowerCase().includes(searchLower) ||
                fee?.payer_name?.toLowerCase().includes(searchLower) ||
                fee?.or_number?.toLowerCase().includes(searchLower) ||
                fee?.certificate_number?.toLowerCase().includes(searchLower)
            );
        }
        
        // Status filter
        if (statusFilter && statusFilter !== 'all') {
            filtered = filtered.filter(fee => fee?.status === statusFilter);
        }
        
        // Purok filter
        if (purokFilter && purokFilter !== 'all') {
            filtered = filtered.filter(fee => fee?.purok === purokFilter);
        }
        
        // Payer Type filter
        if (payerTypeFilter && payerTypeFilter !== 'all') {
            filtered = filtered.filter(fee => fee?.payer_type === payerTypeFilter);
        }
        
        // Amount range filter (min/max inputs)
        if (minAmount) {
            const min = parseFloat(minAmount);
            filtered = filtered.filter(fee => (fee?.total_amount || 0) >= min);
        }
        if (maxAmount) {
            const max = parseFloat(maxAmount);
            filtered = filtered.filter(fee => (fee?.total_amount || 0) <= max);
        }
        
        // Amount range filter (preset)
        if (amountRange) {
            filtered = filtered.filter(fee => checkAmountRange(fee?.total_amount || 0, amountRange));
        }
        
        // Date range filter (created_at)
        if (fromDate) {
            filtered = filtered.filter(fee => fee?.created_at && fee.created_at >= fromDate);
        }
        if (toDate) {
            filtered = filtered.filter(fee => fee?.created_at && fee.created_at <= toDate);
        }
        
        // Due date range filter
        if (dueDateRange) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            filtered = filtered.filter(fee => {
                if (!fee?.due_date) return false;
                const dueDate = new Date(fee.due_date);
                dueDate.setHours(0, 0, 0, 0);
                const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                
                switch (dueDateRange) {
                    case 'overdue':
                        return dueDate < today && (fee?.status === 'pending' || fee?.status === 'issued' || fee?.status === 'partially_paid');
                    case 'due_today':
                        return dueDate.getTime() === today.getTime();
                    case 'due_this_week':
                        return diffDays >= 0 && diffDays <= 7;
                    case 'due_next_week':
                        return diffDays >= 8 && diffDays <= 14;
                    case 'due_this_month':
                        return diffDays >= 0 && diffDays <= 30;
                    default:
                        return true;
                }
            });
        }
        
        // Apply sorting (for table header)
        if (filtered.length > 0) {
            filtered.sort((a, b) => {
                let valueA: any;
                let valueB: any;
                
                switch (sortBy) {
                    case 'name':
                        valueA = a?.name || a?.fee_type?.name || '';
                        valueB = b?.name || b?.fee_type?.name || '';
                        break;
                    case 'code':
                        valueA = a?.code || a?.fee_code || '';
                        valueB = b?.code || b?.fee_code || '';
                        break;
                    case 'amount':
                        valueA = Number(a?.total_amount) || 0;
                        valueB = Number(b?.total_amount) || 0;
                        break;
                    case 'status':
                        valueA = a?.status || '';
                        valueB = b?.status || '';
                        break;
                    case 'payer_type':
                        valueA = a?.payer_type || '';
                        valueB = b?.payer_type || '';
                        break;
                    case 'due_date':
                        valueA = a?.due_date ? new Date(a.due_date).getTime() : 0;
                        valueB = b?.due_date ? new Date(b.due_date).getTime() : 0;
                        break;
                    case 'created_at':
                        valueA = a?.created_at ? new Date(a.created_at).getTime() : 0;
                        valueB = b?.created_at ? new Date(b.created_at).getTime() : 0;
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
    }, [allFees, search, statusFilter, purokFilter, payerTypeFilter, minAmount, maxAmount, fromDate, toDate, dueDateRange, amountRange, sortBy, sortOrder]);

    // Calculate filtered stats
    const filteredStats = useMemo(() => {
        if (!filteredFees || filteredFees.length === 0) {
            return {
                total: 0,
                active: 0,
                inactive: 0,
                totalAmount: 0,
                averageAmount: 0,
                overdue: 0,
                pending: 0,
                paid: 0,
                issued: 0,
                partially_paid: 0,
                cancelled: 0,
                refunded: 0,
                residentCount: 0,
                businessCount: 0,
                householdCount: 0
            };
        }
        
        // Use the actual status values from the Fee type
        const paid = filteredFees.filter(f => f?.status === 'paid').length;
        const pending = filteredFees.filter(f => f?.status === 'pending').length;
        const overdue = filteredFees.filter(f => f?.status === 'overdue').length;
        const issued = filteredFees.filter(f => f?.status === 'issued').length;
        const partially_paid = filteredFees.filter(f => f?.status === 'partial' || f?.status === 'partially_paid').length;
        const cancelled = filteredFees.filter(f => f?.status === 'cancelled').length;
        const refunded = filteredFees.filter(f => f?.status === 'refunded').length;
        
        // "Active" means not cancelled or refunded
        const active = filteredFees.filter(f => 
            f?.status === 'pending' || 
            f?.status === 'paid' || 
            f?.status === 'overdue' || 
            f?.status === 'issued' || 
            f?.status === 'partial' || 
            f?.status === 'partially_paid'
        ).length;
        
        // "Inactive" means cancelled or refunded
        const inactive = filteredFees.filter(f => 
            f?.status === 'cancelled' || 
            f?.status === 'refunded'
        ).length;
        
        const totalAmount = filteredFees.reduce((sum, f) => sum + (Number(f?.total_amount) || Number(f?.amount) || 0), 0);
        const averageAmount = totalAmount / (filteredFees.length || 1);
        
        // Count by payer type
        const residentCount = filteredFees.filter(f => f?.payer_type === 'resident' || f?.type === 'resident').length;
        const businessCount = filteredFees.filter(f => f?.payer_type === 'business' || f?.type === 'business').length;
        const householdCount = filteredFees.filter(f => f?.payer_type === 'household' || f?.type === 'household').length;
        
        return {
            total: filteredFees.length,
            active,
            inactive,
            totalAmount,
            averageAmount,
            overdue,
            pending,
            paid,
            issued,
            partially_paid,
            cancelled,
            refunded,
            residentCount,
            businessCount,
            householdCount
        };
    }, [filteredFees]);

    // Pagination
    const totalItems = filteredFees.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedFees = filteredFees.slice(startIndex, endIndex);

    // Selection handlers
    const handleSelectAllOnPage = useCallback(() => {
        const pageIds = paginatedFees.map(fee => fee.id);
        if (isSelectAll) {
            setSelectedFees(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedFees, ...pageIds])];
            setSelectedFees(newSelected);
        }
        setIsSelectAll(!isSelectAll);
        setSelectionMode('page');
    }, [paginatedFees, isSelectAll, selectedFees]);

    const handleSelectAllFiltered = useCallback(() => {
        const allIds = filteredFees.map(fee => fee.id);
        if (selectedFees.length === allIds.length && allIds.every(id => selectedFees.includes(id))) {
            setSelectedFees(prev => prev.filter(id => !allIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedFees, ...allIds])];
            setSelectedFees(newSelected);
            setSelectionMode('filtered');
        }
    }, [filteredFees, selectedFees]);

    const handleSelectAll = useCallback(() => {
        if (confirm(`This will select ALL ${totalItems} fees. This action may take a moment.`)) {
            const allIds = filteredFees.map(fee => fee.id);
            setSelectedFees(allIds);
            setSelectionMode('all');
        }
    }, [filteredFees, totalItems]);

    const handleItemSelect = useCallback((id: number) => {
        setSelectedFees(prev => {
            if (prev.includes(id)) {
                return prev.filter(itemId => itemId !== id);
            } else {
                return [...prev, id];
            }
        });
    }, []);

    // Check if all items on current page are selected
    useEffect(() => {
        const allPageIds = paginatedFees.map(fee => fee.id);
        const allSelected = allPageIds.length > 0 && allPageIds.every(id => selectedFees.includes(id));
        setIsSelectAll(allSelected);
    }, [selectedFees, paginatedFees]);

    // Get selected fees data
    const selectedFeesData = useMemo(() => {
        return filteredFees.filter(fee => selectedFees.includes(fee.id));
    }, [selectedFees, filteredFees]);

    // Calculate selection stats - FIXED: Use correct status values
    useEffect(() => {
        const totalAmount = selectedFeesData.reduce((sum, f) => sum + (Number(f?.total_amount) || Number(f?.amount) || 0), 0);
        
        // Define active as fees that are not cancelled or refunded
        const active = selectedFeesData.filter(f => 
            f?.status !== 'cancelled' && 
            f?.status !== 'refunded'
        ).length;
        
        // Define inactive as cancelled or refunded
        const inactive = selectedFeesData.filter(f => 
            f?.status === 'cancelled' || 
            f?.status === 'refunded'
        ).length;
        
        setSelectionStats({
            total: selectedFeesData.length,
            totalAmount,
            averageAmount: selectedFeesData.length > 0 ? totalAmount / selectedFeesData.length : 0,
            active,
            inactive,
            pending: selectedFeesData.filter(f => f?.status === 'pending').length,
            paid: selectedFeesData.filter(f => f?.status === 'paid').length,
            overdue: selectedFeesData.filter(f => f?.status === 'overdue').length,
            issued: selectedFeesData.filter(f => f?.status === 'issued').length,
            partially_paid: selectedFeesData.filter(f => f?.status === 'partial' || f?.status === 'partially_paid').length,
            cancelled: selectedFeesData.filter(f => f?.status === 'cancelled').length,
            refunded: selectedFeesData.filter(f => f?.status === 'refunded').length,
            resident: selectedFeesData.filter(f => f?.payer_type === 'resident' || f?.type === 'resident').length,
            business: selectedFeesData.filter(f => f?.payer_type === 'business' || f?.type === 'business').length,
            household: selectedFeesData.filter(f => f?.payer_type === 'household' || f?.type === 'household').length
        });
    }, [selectedFeesData]);

    // Handle sort from table header
    const handleSort = useCallback((column: string) => {
        const newOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortBy(column);
        setSortOrder(newOrder);
    }, [sortBy, sortOrder]);

    // Bulk operations
    const handleBulkOperation = useCallback(async (operation: BulkOperation) => {
        if (selectedFees.length === 0) {
            toast.error('Please select at least one fee');
            return;
        }

        setIsPerformingBulkAction(true);

        try {
            switch (operation) {
                case 'delete':
                    setShowBulkDeleteDialog(true);
                    break;
                case 'activate':
                    await router.post('/admin/fees/bulk-action', {
                        action: 'activate',
                        fee_ids: selectedFees,
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            setSelectedFees([]);
                            toast.success(`${selectedFees.length} fees activated successfully`);
                            router.reload({ only: ['fees'] });
                        },
                        onError: () => {
                            toast.error('Failed to activate fees');
                        }
                    });
                    break;
                case 'deactivate':
                    await router.post('/admin/fees/bulk-action', {
                        action: 'deactivate',
                        fee_ids: selectedFees,
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            setSelectedFees([]);
                            toast.success(`${selectedFees.length} fees deactivated successfully`);
                            router.reload({ only: ['fees'] });
                        },
                        onError: () => {
                            toast.error('Failed to deactivate fees');
                        }
                    });
                    break;
                case 'export':
                    const exportData = selectedFeesData.map(fee => ({
                        'Name': fee.name || fee.fee_type?.name || 'N/A',
                        'Code': fee.code || fee.fee_code || 'N/A',
                        'Amount': fee.total_amount || 0,
                        'Status': fee.status || 'N/A',
                        'Payer': fee.payer_name || 'N/A',
                        'Payer Type': getPayerTypeDisplay(fee.payer_type),
                        'Due Date': fee.due_date || 'N/A',
                        'Created': fee.created_at ? new Date(fee.created_at).toLocaleDateString() : 'N/A'
                    }));
                    
                    const csv = [
                        Object.keys(exportData[0]).join(','),
                        ...exportData.map(row => Object.values(row).map(v => `"${v}"`).join(','))
                    ].join('\n');
                    
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `fees-export-${new Date().toISOString().split('T')[0]}.csv`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                    
                    toast.success(`${selectedFees.length} fees exported`);
                    break;
                case 'print':
                    selectedFees.forEach(id => {
                        window.open(`/admin/fees/${id}/print`, '_blank');
                    });
                    toast.success(`${selectedFees.length} fee(s) opened for printing`);
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
    }, [selectedFees, selectedFeesData, getPayerTypeDisplay]);

    // Individual fee operations
    const handleDelete = useCallback((fee: Fee) => {
        if (confirm(`Are you sure you want to delete fee "${fee.name || fee.fee_code}"?`)) {
            router.delete(`/admin/fees/${fee.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedFees(prev => prev.filter(id => id !== fee.id));
                    toast.success('Fee deleted successfully');
                    router.reload({ only: ['fees'] });
                },
                onError: () => {
                    toast.error('Failed to delete fee');
                }
            });
        }
    }, []);

    const handleClearFilters = useCallback(() => {
        setSearch('');
        setStatusFilter('all');
        setPurokFilter('all');
        setMinAmount('');
        setMaxAmount('');
        setFromDate('');
        setToDate('');
        setPayerTypeFilter('all');
        setDueDateRange('');
        setDateRangePreset('');
        setAmountRange('');
        setSortBy('created_at');
        setSortOrder('desc');
        setCurrentPage(1);
    }, []);

    const handleClearSelection = useCallback(() => {
        setSelectedFees([]);
        setIsSelectAll(false);
        setIsBulkMode(false);
    }, []);

    const handleCopySelectedData = useCallback(() => {
        if (selectedFeesData.length === 0) {
            toast.error('No data to copy');
            return;
        }
        
        const data = selectedFeesData.map(fee => ({
            'Name': fee.name || fee.fee_type?.name || 'N/A',
            'Code': fee.code || fee.fee_code || 'N/A',
            'Amount': fee.total_amount || 0,
            'Status': fee.status || 'N/A',
            'Payer': fee.payer_name || 'N/A',
            'Payer Type': getPayerTypeDisplay(fee.payer_type)
        }));
        
        const csv = [
            Object.keys(data[0]).join('\t'),
            ...data.map(row => Object.values(row).join('\t'))
        ].join('\n');
        
        navigator.clipboard.writeText(csv).then(() => {
            toast.success(`${selectedFeesData.length} records copied to clipboard`);
        }).catch(() => {
            toast.error('Failed to copy to clipboard');
        });
    }, [selectedFeesData, getPayerTypeDisplay]);

    const updateFilter = useCallback((key: string, value: string) => {
        switch (key) {
            case 'status':
                setStatusFilter(value);
                break;
            case 'purok':
                setPurokFilter(value);
                break;
            case 'min_amount':
                setMinAmount(value);
                break;
            case 'max_amount':
                setMaxAmount(value);
                break;
            case 'from_date':
                setFromDate(value);
                break;
            case 'to_date':
                setToDate(value);
                break;
        }
    }, []);

    const hasActiveFilters = Boolean(
        search || 
        (statusFilter && statusFilter !== 'all') || 
        (purokFilter && purokFilter !== 'all') ||
        (payerTypeFilter && payerTypeFilter !== 'all') ||
        minAmount ||
        maxAmount ||
        fromDate ||
        toDate ||
        dueDateRange ||
        amountRange
    );

    // Create filters object for the Filters component
    const filtersStateForComponent = {
        status: statusFilter,
        purok: purokFilter,
        min_amount: minAmount,
        max_amount: maxAmount,
        from_date: fromDate,
        to_date: toDate
    };

    // Handle mobile view mode override
    useEffect(() => {
        if (isMobile && viewMode !== 'grid') {
            setViewMode('grid');
        }
    }, [isMobile, viewMode]);

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'b') {
                e.preventDefault();
                setIsBulkMode(!isBulkMode);
            }
            if (e.ctrlKey && e.key.toLowerCase() === 'a' && isBulkMode) {
                e.preventDefault();
                handleSelectAllOnPage();
            }
            if (e.key === 'Escape' && isBulkMode && selectedFees.length > 0) {
                e.preventDefault();
                setIsBulkMode(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isBulkMode, selectedFees.length, handleSelectAllOnPage, setIsBulkMode]);

    // Handle page change with scroll to top
    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    // Combine flash messages
    const combinedFlash = {
        success: flash?.success,
        error: flash?.error,
        warning: flash?.warning,
        info: flash?.info
    };

    const hasFlashMessages = Object.values(combinedFlash).some(message => message !== undefined);

    return (
        <AppLayout
            title="Fees Management"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Fees', href: '/admin/fees' }
            ]}
        >
            <TooltipProvider>
                <div className="space-y-6">
                    {/* Flash Messages */}
                    {hasFlashMessages && (
                        <FlashMessages flash={combinedFlash} />
                    )}
                    
                    {/* Header */}
                    <FeesHeader 
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isMobile={isMobile}
                        selectedFees={selectedFees}
                        paginatedFees={paginatedFees}
                    />
                    
                    {/* Stats Cards */}
                    <FeesStats stats={filteredStats} />
                    
                    {/* Search and Filters */}
                    <FeesFilters
                        search={search}
                        setSearch={setSearch}
                        filtersState={filtersStateForComponent}
                        updateFilter={updateFilter}
                        showAdvancedFilters={showAdvancedFilters}
                        setShowAdvancedFilters={setShowAdvancedFilters}
                        handleClearFilters={handleClearFilters}
                        hasActiveFilters={hasActiveFilters}
                        statuses={safeStatuses}
                        puroks={safePuroks}
                        payerTypes={safePayerTypes}
                        startIndex={startIndex}
                        endIndex={endIndex}
                        totalItems={totalItems}
                        isBulkMode={isBulkMode}
                        selectedFees={selectedFees}
                        onSelectAllOnPage={handleSelectAllOnPage}
                        onSelectAllFiltered={handleSelectAllFiltered}
                        onSelectAll={handleSelectAll}
                        onClearSelection={handleClearSelection}
                        isLoading={isPerformingBulkAction}
                        dateRangePreset={dateRangePreset}
                        setDateRangePreset={setDateRangePreset}
                        payerTypeFilter={payerTypeFilter}
                        setPayerTypeFilter={setPayerTypeFilter}
                        amountRange={amountRange}
                        setAmountRange={setAmountRange}
                        dueDateRange={dueDateRange}
                        setDueDateRange={setDueDateRange}
                    />
                    
                    {/* Main Content */}
                    <FeesContent
                        fees={paginatedFees}
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isSelectAll={isSelectAll}
                        selectedFees={selectedFees}
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
                        onClearFilters={handleClearFilters}
                        onClearSelection={handleClearSelection}
                        onDelete={handleDelete}
                        onViewDetails={(fee) => router.get(route('admin.fees.show', fee.id))}
                        onEdit={(fee) => router.get(route('admin.fees.edit', fee.id))}
                        onCopyToClipboard={(text, label) => {
                            navigator.clipboard.writeText(text);
                            toast.success(`${label} copied to clipboard`);
                        }}
                        onCopySelectedData={handleCopySelectedData}
                        onSort={handleSort}
                        onBulkOperation={handleBulkOperation}
                        setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                        filtersState={filtersStateForComponent}
                        isPerformingBulkAction={isPerformingBulkAction}
                        selectionMode={selectionMode}
                        selectionStats={selectionStats}
                        statuses={safeStatuses}
                        puroks={safePuroks}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSortChange={() => {}}
                        getCurrentSortValue={() => `${sortBy}-${sortOrder}`}
                    />
                </div>
            </TooltipProvider>
            
            {/* Dialogs */}
            <FeesDialogs
                showBulkDeleteDialog={showBulkDeleteDialog}
                setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                isPerformingBulkAction={isPerformingBulkAction}
                selectedFees={selectedFees}
                handleBulkOperation={handleBulkOperation}
                selectionStats={selectionStats}
            />
        </AppLayout>
    );
}